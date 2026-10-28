// Option 1: the "outskirts" area as a polished 2D pixel-art map (Phaser 3 only, no changes to the real game).
// The ground is painted once into a big canvas: sand, road, courtyard and oasis water blend into each other with
// dithered soft edges. Everything standing on it (buildings, trees, rocks, walls, people) is a sprite that is
// y-sorted, so you walk behind things. Water shimmer, palm sway, floating dust and footstep puffs are the animation.
(function () {
  "use strict";
  const TILE = 32, MW = 44, MH = 30, WW = MW * TILE, WH = MH * TILE;
  const SOLID = new Set(["wall", "ruin", "palm", "cactus", "roof", "housewall", "dwall", "door", "shopdoor", "prop"]);

  // ---------- the same layout as outskirts() in maps.js (plus a few extra props) ----------
  function grid(w, h, fill) { return Array.from({ length: h }, () => Array(w).fill(fill)); }
  function rect(g, x0, y0, x1, y1, t) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (g[y] && g[y][x] !== undefined) g[y][x] = t; }
  const hash = (x, y) => { let n = x * 374761393 + y * 668265263; n = (n ^ (n >> 13)) * 1274126177; return ((n ^ (n >> 16)) >>> 0) / 4294967295; };

  function buildMap() {
    const g = grid(MW, MH, "sand");
    rect(g, 0, 0, MW - 1, 0, "ruin"); rect(g, 0, MH - 1, MW - 1, MH - 1, "ruin"); rect(g, 0, 0, 0, MH - 1, "ruin"); rect(g, MW - 1, 0, MW - 1, MH - 1, "ruin");
    rect(g, 2, 2, 14, 12, "wall"); rect(g, 3, 3, 13, 11, "town"); g[7][14] = "town";
    rect(g, 4, 3, 7, 3, "roof"); rect(g, 4, 4, 7, 5, "housewall"); g[5][5] = "door";            // inn
    rect(g, 9, 3, 12, 3, "roof"); rect(g, 9, 4, 12, 5, "housewall"); g[5][10] = "shopdoor";     // shop
    // the oasis is painted as one ellipse (see inWater); the road crosses its south end like a causeway
    rect(g, 15, 7, 33, 7, "path"); rect(g, 33, 7, 33, 24, "path");
    rect(g, 30, 23, 36, 27, "ruin"); rect(g, 31, 24, 35, 26, "path"); g[23][33] = "path"; g[25][33] = "gate";
    const plants = [];   // { x, y, kind } on sand tiles, same random rule as the real map
    for (let y = 1; y < MH - 1; y++) for (let x = 1; x < MW - 1; x++) {
      if (g[y][x] !== "sand") continue;
      if (x >= 2 && x <= 15 && y >= 1 && y <= 13) continue;
      const r = hash(x + 99, y + 7);
      if (r < 0.035) { g[y][x] = "cactus"; plants.push({ x, y, kind: "cactus" }); }
      else if (r < 0.06 && Math.abs(y - 6) < 6 && x > 17 && x < 32) { g[y][x] = "palm"; plants.push({ x, y, kind: "palm" }); }
    }
    // extra props of this demo (all solid)
    g[9][9] = "prop";                                      // well in the town square
    g[10][4] = "prop"; g[10][5] = "prop";                  // market stall
    rect(g, 7, 17, 10, 18, "prop");                        // an abandoned house south of the walls
    const boulders = [];
    for (let y = 2; y < MH - 2; y++) for (let x = 2; x < MW - 2; x++) {
      if (g[y][x] !== "sand" || (x < 17 && y < 15)) continue;
      if (x >= 29 && x <= 37 && y >= 21) continue;
      if (Math.abs(y - 7) < 2 || Math.abs(x - 33) < 2) continue;      // keep the road clear
      if (Math.abs(y - 6) < 5 && x > 18 && x < 31) continue;          // and the oasis shore
      if (hash(x + 5, y + 61) < 0.011) { g[y][x] = "prop"; boulders.push({ x, y }); }
    }
    return { g, plants, boulders };
  }

  // the oasis: a wobbly ellipse; the road band across it stays dry
  const OASIS = { x: 800, y: 208, rx: 138, ry: 88 };
  function oasisR(a) { return 1 + 0.07 * Math.sin(3 * a + 1) + 0.045 * Math.sin(5 * a + 2) + 0.03 * Math.sin(8 * a); }
  function waterDepth(x, y) {   // < 1 inside the water
    const dx = (x - OASIS.x) / OASIS.rx, dy = (y - OASIS.y) / OASIS.ry;
    return Math.sqrt(dx * dx + dy * dy) / oasisR(Math.atan2(dy, dx));
  }
  const onCauseway = y => y > 218 && y < 262;
  function inWater(x, y) { return waterDepth(x, y) < 0.9 && !onCauseway(y); }

  // ---------- small helpers ----------
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  function vnoise(x, y) {   // smooth value noise 0..1
    const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

  function makeCanvas(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; }

  // a blurred white-on-black mask of whatever `draw` paints, as 0..1 floats
  function makeMask(draw, blur) {
    const c = makeCanvas(WW, WH), ctx = c.getContext("2d");
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, WW, WH);
    ctx.fillStyle = "#fff"; ctx.strokeStyle = "#fff"; ctx.lineCap = "round"; ctx.lineJoin = "round";
    if (blur) ctx.filter = "blur(" + blur + "px)";
    draw(ctx);
    const d = ctx.getImageData(0, 0, WW, WH).data, m = new Float32Array(WW * WH);
    for (let i = 0; i < m.length; i++) m[i] = d[i * 4] / 255;
    return m;
  }
  function wobblyLine(ctx, x0, y0, x1, y1, width) {
    const len = Math.hypot(x1 - x0, y1 - y0), nx = -(y1 - y0) / len, ny = (x1 - x0) / len;
    ctx.lineWidth = width; ctx.beginPath();
    for (let t = 0; t <= len; t += 8) {
      const o = Math.sin(t * 0.045 + x0) * 4 + Math.sin(t * 0.13 + y0) * 2;
      const px = x0 + (x1 - x0) * t / len + nx * o, py = y0 + (y1 - y0) * t / len + ny * o;
      t === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  // a 256px texture as floats with its colours pulled toward the game's dark, earthy palette
  function readTexture(scene, key, tone, sat, contrast) {
    const img = scene.textures.get(key).getSourceImage(), c = makeCanvas(256, 256), ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0, 256, 256);
    const d = ctx.getImageData(0, 0, 256, 256).data, out = new Float32Array(256 * 256 * 3);
    let mr = 0, mg = 0, mb = 0;
    for (let i = 0; i < 65536; i++) { mr += d[i * 4]; mg += d[i * 4 + 1]; mb += d[i * 4 + 2]; }
    mr /= 65536; mg /= 65536; mb /= 65536;
    for (let i = 0; i < 65536; i++) {
      let r = mr + (d[i * 4] - mr) * contrast, g = mg + (d[i * 4 + 1] - mg) * contrast, b = mb + (d[i * 4 + 2] - mb) * contrast;
      const l = r * 0.3 + g * 0.59 + b * 0.11;
      out[i * 3] = (l + (r - l) * sat) * tone[0]; out[i * 3 + 1] = (l + (g - l) * sat) * tone[1]; out[i * 3 + 2] = (l + (b - l) * sat) * tone[2];
    }
    return out;
  }
  const mirror = v => { v = ((v % 512) + 512) % 512; return v < 256 ? v : 511 - v; };   // mirrored tiling hides the seams
  function sampleTex(t, x, y, ox, oy, out) { const i = (mirror(y + oy) * 256 + mirror(x + ox)) * 3; out[0] = t[i]; out[1] = t[i + 1]; out[2] = t[i + 2]; }

  // ---------- the scene ----------
  class OverworldScene extends Phaser.Scene {
    constructor() { super("overworld"); }

    preload() {
      ["tex_sand", "tex_path", "tex_water", "tex_stone", "palm1", "palm2", "cactus", "barrel", "boulder", "rocks", "shrub", "reeds", "inn", "shop", "house", "well", "gate", "pillar1", "pillar2", "altar", "fallen", "steps", "stall"]
        .forEach(k => this.load.image(k, "assets/ow2d/" + k + ".png"));
      ["hero", "mentor", "innkeeper", "merchant", "scholar"].forEach(k => this.load.image(k, "assets/" + k + ".png"));
    }

    create() {
      const m = buildMap();
      this.grid = m.g; window.OW2D = this;   // handy for poking around in the console
      this.sortables = [];     // static things that cast a baked shadow
      this.swayers = [];
      this.makeTextures();
      this.paintGround(m);
      this.placeObjects(m);
      this.makePeople();
      this.makeWaterShimmer();
      this.makeAtmosphere();

      this.cameras.main.setBounds(0, 0, WW, WH).startFollow(this.hero, true, 0.12, 0.12).setRoundPixels(true);
      this.keys = this.input.keyboard.addKeys({ up: "UP", down: "DOWN", left: "LEFT", right: "RIGHT", w: "W", a: "A", s: "S", d: "D", e: "E", space: "SPACE" });
      this.input.keyboard.on("keydown-E", () => this.talk()); this.input.keyboard.on("keydown-SPACE", () => this.talk());
      this.input.on("pointerdown", p => this.pointerDown(p));
      this.puffTimer = 0; this.speech = null; this.toastText = null;
      this.hint = this.add.text(480, 520, "", { fontFamily: "Noto Sans KR, sans-serif", fontSize: "13px", color: "#f0d9a8", backgroundColor: "#00000099", padding: { x: 8, y: 3 } }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(20000);
    }

    // ----- generated textures: wall blocks, shadow blob, dust, vignette -----
    makeTextures() {
      const mk = (key, w, h, draw) => { const c = makeCanvas(w, h), ctx = c.getContext("2d"); draw(ctx, w, h); this.textures.addCanvas(key, c); };
      for (let v = 0; v < 4; v++) {
        mk("wallTop" + v, TILE, TILE, (ctx, w, h) => {      // top face of the wall: lit sandstone slabs
          ctx.fillStyle = "#b08a5e"; ctx.fillRect(0, 0, w, h);
          for (let i = 0; i < 90; i++) { ctx.fillStyle = hash(i, v) < 0.5 ? "#a07c52" : "#c09a6c"; ctx.fillRect(Math.floor(hash(i, v + 9) * w), Math.floor(hash(i + 3, v + 4) * h), 2, 1); }
          ctx.fillStyle = "#cfa878"; ctx.fillRect(0, 0, w, 2);                       // lit back edge
          ctx.fillStyle = "#6a4c36"; ctx.fillRect(0, 0, 1, h); ctx.fillRect(w - 1, 0, 1, h);   // slab joints
          ctx.fillStyle = "#8a6646"; ctx.fillRect(0, h - 3, w, 3);                   // shaded front lip
          ctx.fillStyle = "#6a4c36"; ctx.fillRect(0, h - 1, w, 1);
        });
        mk("wallFront" + v, TILE, 20, (ctx, w, h) => {      // front face: darker, in shade, with block courses
          ctx.fillStyle = "#7c5a40"; ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = "#5e4230"; ctx.fillRect(0, 9, w, 1); ctx.fillRect(0, 19, w, 1);
          const o = v % 2 ? 8 : 20; ctx.fillRect(o, 0, 1, 9); ctx.fillRect((o + 16) % 32, 10, 1, 9);
          for (let i = 0; i < 50; i++) { ctx.fillStyle = hash(i, v + 20) < 0.5 ? "#6c4e38" : "#8a664a"; ctx.fillRect(Math.floor(hash(i, v + 12) * w), Math.floor(hash(i + 5, v + 2) * h), 2, 1); }
          ctx.fillStyle = "rgba(20,8,16,0.45)"; ctx.fillRect(0, 0, w, 3);              // shade under the lip
          ctx.fillStyle = "rgba(20,8,16,0.35)"; ctx.fillRect(0, h - 3, w, 3);           // dirt at the foot
        });
      }
      mk("shadow", 64, 24, (ctx, w, h) => {
        const g = ctx.createRadialGradient(w / 2, h / 2, 1, w / 2, h / 2, w / 2);
        g.addColorStop(0, "rgba(10,4,14,0.55)"); g.addColorStop(1, "rgba(10,4,14,0)");
        ctx.save(); ctx.translate(0, h / 2); ctx.scale(1, h / w); ctx.translate(0, -w / 2); ctx.fillStyle = g; ctx.fillRect(0, 0, w, w); ctx.restore();
      });
      mk("dust", 4, 3, ctx => { ctx.fillStyle = "#e8c890"; ctx.fillRect(0, 1, 4, 1); ctx.fillRect(1, 0, 2, 3); });
      mk("puff", 8, 8, ctx => { ctx.fillStyle = "#c8a070"; ctx.fillRect(2, 0, 4, 8); ctx.fillRect(0, 2, 8, 4); ctx.fillStyle = "#dcb888"; ctx.fillRect(3, 1, 2, 6); });
      mk("glint", 6, 1, ctx => { ctx.fillStyle = "#bfffe8"; ctx.fillRect(1, 0, 4, 1); ctx.fillStyle = "#ffffff"; ctx.fillRect(2, 0, 2, 1); });
      mk("vignette", 960, 540, (ctx, w, h) => {
        const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.38, w / 2, h / 2, w * 0.62);
        g.addColorStop(0, "rgba(14,6,20,0)"); g.addColorStop(1, "rgba(14,6,20,0.72)");
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      });
    }

    // ----- the ground: one big canvas, every pixel blended from masks -----
    paintGround(m) {
      const g = m.g;
      const sandT = readTexture(this, "tex_sand", [0.82, 0.74, 0.64], 0.62, 0.3);
      const pathT = readTexture(this, "tex_path", [1.32, 1.2, 1.02], 0.85, 0.8);
      const waterT = readTexture(this, "tex_water", [0.8, 0.9, 0.9], 0.9, 0.9);
      const stoneT = readTexture(this, "tex_stone", [0.9, 0.85, 0.85], 0.7, 0.8);

      const roadPath = c => {
        wobblyLine(c, 13 * TILE, 7.5 * TILE, 33.5 * TILE, 7.5 * TILE, 40);
        wobblyLine(c, 33.5 * TILE, 7.5 * TILE, 33.5 * TILE, 24.4 * TILE, 40);
        wobblyLine(c, 24.5 * TILE, 8 * TILE, 21.6 * TILE, 11.5 * TILE, 18);      // a worn footpath off the road
      };
      const pathM = makeMask(roadPath, 3);
      const townM = makeMask(c => c.fillRect(2.5 * TILE, 2.5 * TILE, 12 * TILE, 10 * TILE), 3);
      const courtM = makeMask(c => c.fillRect(31 * TILE + 3, 24 * TILE + 3, 5 * TILE - 6, 3 * TILE - 6), 4);
      const wetM = makeMask(c => { c.beginPath(); for (let a = 0; a <= 6.3; a += 0.1) { const r = oasisR(a); c.lineTo(OASIS.x + Math.cos(a) * (OASIS.rx + 22) * r, OASIS.y + Math.sin(a) * (OASIS.ry + 22) * r); } c.fill(); }, 12);
      const waterM = makeMask(c => { c.beginPath(); for (let a = 0; a <= 6.3; a += 0.1) { const r = oasisR(a); c.lineTo(OASIS.x + Math.cos(a) * OASIS.rx * r, OASIS.y + Math.sin(a) * OASIS.ry * r); } c.fill(); }, 2);

      const canvas = makeCanvas(WW, WH), ctx = canvas.getContext("2d"), img = ctx.createImageData(WW, WH), out = img.data;
      const col = [0, 0, 0], lay = [0, 0, 0];
      const mix = (c, l, t) => { c[0] += (l[0] - c[0]) * t; c[1] += (l[1] - c[1]) * t; c[2] += (l[2] - c[2]) * t; };
      // blend factor with a noisy, dithered edge: crisp pixels but a soft, organic transition
      const edge = (v, bx) => { if (v <= 0.42) return 0; if (v >= 0.58) return 1; const a = (v - 0.42) / 0.16; return 0.3 * a + 0.7 * (a > bx ? 1 : 0); };

      this.waterBox = { x0: 640, y0: 100, x1: 960, y1: 320 };
      for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) {
        const i = y * WW + x, bx = (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16;
        const nn = (vnoise(x / 13, y / 13) - 0.5) * 0.34 + (hash(x, y) - 0.5) * 0.08;
        sampleTex(sandT, x, y, 0, 0, col); sampleTex(sandT, y + 130, Math.floor(x * 0.8) + 60, 0, 0, lay);   // two crossed samples hide the mirrored repeat
        col[0] = (col[0] + lay[0]) * 0.5; col[1] = (col[1] + lay[1]) * 0.5; col[2] = (col[2] + lay[2]) * 0.5;
        const big = (vnoise(x / 90, y / 90) - 0.5) * 0.28 + (vnoise(x / 28, y / 28) - 0.5) * 0.1;   // large soft patches break the texture repeat
        col[0] *= 1 + big; col[1] *= 1 + big; col[2] *= 1 + big * 0.9;

        const wet = wetM[i];                                  // damp sand around the oasis
        if (wet > 0.05) { const t = smooth(0.05, 0.55, wet + nn * 0.3); lay[0] = col[0] * 0.55; lay[1] = col[1] * 0.58; lay[2] = col[2] * 0.62 + 6; mix(col, lay, t * 0.85); }

        const tv = townM[i] + nn;                             // swept courtyard inside the walls
        const ta = edge(tv, bx);
        if (ta > 0) {
          sampleTex(pathT, x, y, 77, 31, lay);
          const s0 = col[0] * 0.8, s1 = col[1] * 0.78, s2 = col[2] * 0.75;
          lay[0] = lay[0] * 0.55 + s0 * 0.55; lay[1] = lay[1] * 0.55 + s1 * 0.55; lay[2] = lay[2] * 0.55 + s2 * 0.55;
          const gx = (x + (Math.floor(y / 16) % 2) * 16) % 32, gy = y % 16;   // loose flagstones
          if ((gx === 0 || gy === 0) && hash(Math.floor(x / 32), Math.floor(y / 16)) < 0.8) { lay[0] *= 0.82; lay[1] *= 0.82; lay[2] *= 0.82; }
          mix(col, lay, ta);
        }
        const pv = pathM[i] + nn;                             // the packed-dirt road
        const pa = edge(pv, bx);
        if (pa > 0) {
          sampleTex(pathT, x, y, 77, 31, lay);
          if (pv < 0.68 && pa >= 1) { lay[0] *= 0.82; lay[1] *= 0.8; lay[2] *= 0.8; }     // darker lip where the road meets the sand
          mix(col, lay, pa);
        } else if (pv > 0.3) { col[0] *= 1.06; col[1] *= 1.04; }                            // dusty verge
        const cv = courtM[i] + nn * 0.8;                      // stone floor of the ruins court
        const ca = edge(cv, bx);
        if (ca > 0) { sampleTex(stoneT, x, y, 40, 90, lay); mix(col, lay, ca); }

        const wv = waterM[i] * (1 - clamp(pathM[i] * 1.5, 0, 1)) + nn * 0.5;   // oasis water; the road keeps a dry causeway
        if (wv > 0.4) {
          const wa = edge(wv, bx);
          sampleTex(waterT, x, y, 13, 200, lay);
          const depth = smooth(0.5, 1.0, wetM[i] * 1.0 + (waterM[i] - 0.5) * 0.9);          // deeper toward the middle
          lay[0] *= 1 - depth * 0.42; lay[1] *= 1 - depth * 0.32; lay[2] *= 1 - depth * 0.25;
          mix(col, lay, wa);
          if (wv > 0.5 && wv < 0.62 && ((x + y * 3) & 3) < 2) { col[0] += (170 - col[0]) * 0.35; col[1] += (215 - col[1]) * 0.35; col[2] += (190 - col[2]) * 0.35; }   // foam along the shore
        }
        const bd = Math.min(x, y, WW - x, WH - y);            // dark rocky rim at the world edge
        if (bd < 46) { const t = smooth(46, 14, bd + nn * 30); lay[0] = 38; lay[1] = 27; lay[2] = 30; mix(col, lay, t * 0.9); }

        const o = i * 4; out[o] = col[0]; out[o + 1] = col[1]; out[o + 2] = col[2]; out[o + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      this.groundCtx = ctx;
      this.groundMasks = { pathM, waterM };

      // small details: pebbles and dry grass tufts on the sand
      for (let i = 0; i < 900; i++) {
        const x = Math.floor(hash(i, 3) * WW), y = Math.floor(hash(i, 8) * WH), idx = y * WW + x;
        if (pathM[idx] > 0.3 || townM[idx] > 0.3 || waterM[idx] > 0.2 || courtM[idx] > 0.2) continue;
        if (hash(i, 21) < 0.5) { ctx.fillStyle = "#5c4030"; ctx.fillRect(x, y, 2, 1); ctx.fillStyle = "#a88860"; ctx.fillRect(x, y - 1, 1, 1); }
        else { ctx.fillStyle = "#7a6a3a"; ctx.fillRect(x, y - 3, 1, 3); ctx.fillRect(x - 1, y - 2, 1, 2); ctx.fillRect(x + 1, y - 2, 1, 2); }
      }

      // shadows of walls and props, baked in with a soft blur (light comes from the upper left)
      ctx.save(); ctx.filter = "blur(3px)"; ctx.fillStyle = "rgba(14,5,18,0.42)";
      for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) if (g[y][x] === "wall") ctx.fillRect(x * TILE + 8, y * TILE + 6, TILE, TILE + 4);
      ctx.restore();
      this.shadowCtx = ctx;
      this.groundTexture = this.textures.addCanvas("ground", canvas);
      this.add.image(0, 0, "ground").setOrigin(0, 0).setDepth(0);
    }

    // soft ground shadow for a sprite that stands at (x, base)
    bakeShadow(x, base, w, h, tall) {
      const ctx = this.shadowCtx; ctx.save(); ctx.filter = "blur(2px)"; ctx.fillStyle = "rgba(14,5,18,0.4)"; ctx.strokeStyle = "rgba(14,5,18,0.34)";
      ctx.beginPath();
      if (tall) {     // palm: long slanted trunk shadow with the crown's shadow at the end
        ctx.lineWidth = 8; ctx.globalAlpha = 0.6; ctx.moveTo(x, base - 2); ctx.lineTo(x + h * 0.42, base + h * 0.1); ctx.stroke(); ctx.globalAlpha = 1;
        ctx.beginPath(); ctx.ellipse(x + h * 0.45, base + h * 0.11, w * 0.42, w * 0.14, 0.2, 0, 7); ctx.fill();
      } else if (h > 70) {   // buildings: a cast shadow to the lower right
        ctx.moveTo(x - w / 2, base); ctx.lineTo(x + w / 2, base); ctx.lineTo(x + w / 2 + h * 0.32, base + h * 0.16); ctx.lineTo(x - w / 2 + h * 0.32, base + h * 0.16); ctx.closePath(); ctx.fill();
      } else {
        ctx.ellipse(x + w * 0.12, base - 1, w * 0.46, Math.max(4, w * 0.13), 0, 0, 7); ctx.fill();
      }
      ctx.restore();
    }

    // add a y-sorted sprite standing at (x, base); solid ones also get a baked shadow
    prop(key, x, base, opts) {
      opts = opts || {};
      const s = this.add.image(Math.round(x), Math.round(base), key).setOrigin(0.5, 1).setDepth(base);
      if (opts.flip) s.setFlipX(true);
      if (opts.shadow !== false) this.bakeShadow(x, base, s.width, s.height, opts.tall);
      if (opts.sway) this.swayers.push({ s, phase: hash(Math.round(x), Math.round(base)) * 6.28, amp: opts.sway });
      return s;
    }

    placeObjects(m) {
      const g = m.g;
      // walls of the camp town: lit top faces raised above the footprint, a shaded front face where nothing stands below
      for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
        if (g[y][x] !== "wall") continue;
        const v = Math.floor(hash(x, y) * 4), base = y * TILE + TILE;
        this.add.image(x * TILE, base - 20, "wallTop" + v).setOrigin(0, 1).setDepth(base);
        if (!g[y + 1] || g[y + 1][x] !== "wall") this.add.image(x * TILE, base, "wallFront" + v).setOrigin(0, 1).setDepth(base + 0.1);
      }
      // gate posts where the wall opens to the east
      this.prop("pillar2", 14 * TILE + 16, 6 * TILE + 30, { shadow: false }).setScale(0.8).setDepth(7 * TILE);
      this.prop("pillar2", 14 * TILE + 16, 9 * TILE - 2, { shadow: false }).setScale(0.8);
      // the inn and the shop, door positions line up with the real doors
      this.prop("inn", 5.5 * TILE + 4 - 0.64 * 122 + 61, 6 * TILE);
      this.prop("shop", 10.5 * TILE - 0.55 * 150 + 75, 6 * TILE);
      this.prop("well", 9.5 * TILE, 10 * TILE - 2);
      this.prop("stall", 5 * TILE, 11 * TILE - 2);
      this.prop("house", 9 * TILE + 16, 19 * TILE);
      // plants from the real map's random rule, with a size / shape variety
      for (const p of m.plants) {
        const x = p.x * TILE + 16, base = p.y * TILE + 30, r = hash(p.x, p.y + 3);
        if (p.kind === "palm") this.prop(r < 0.5 ? "palm1" : "palm2", x, base, { tall: true, sway: r < 0.5 ? 0.02 : 0.03, flip: r > 0.75 });
        else this.prop(r < 0.65 ? "cactus" : "barrel", x, base, { flip: r > 0.8 });
      }
      for (const b of m.boulders) this.prop(hash(b.x, b.y) < 0.5 ? "boulder" : "rocks", b.x * TILE + 16, b.y * TILE + 30, { flip: hash(b.y, b.x) < 0.5 });
      // the world rim: boulders and rubble all around
      for (let x = 0; x < MW; x++) for (const y of [0, MH - 1]) this.rim(x, y);
      for (let y = 1; y < MH - 1; y++) for (const x of [0, MW - 1]) this.rim(x, y);
      // decoration that you can walk through: shrubs, reeds at the shore, small rocks
      for (let i = 0; i < 46; i++) {
        const tx = 2 + Math.floor(hash(i, 40) * (MW - 4)), ty = 2 + Math.floor(hash(i, 41) * (MH - 4));
        if (g[ty][tx] !== "sand" || (tx < 17 && ty < 15) || Math.abs(ty - 7) < 1 || tx === 33) continue;
        const x = tx * TILE + 8 + hash(i, 42) * 16, base = ty * TILE + 28 + hash(i, 43) * 4;
        if (inWater(x, base) || waterDepth(x, base) < 1.15) continue;
        const deco = this.prop(hash(i, 44) < 0.7 ? "shrub" : "rocks", x, base, { flip: hash(i, 45) < 0.5, shadow: false });
        if (hash(i, 44) >= 0.7) deco.setScale(0.5);
      }
      for (let a = 0.2; a < 6.2; a += 0.38) {       // reeds standing along the water's edge
        const r = oasisR(a) * 1.04, x = OASIS.x + Math.cos(a) * OASIS.rx * r, y = OASIS.y + Math.sin(a) * OASIS.ry * r;
        if (onCauseway(y) || Math.abs(y - 240) < 40 && y > 200) continue;
        this.prop("reeds", x, y + 4, { flip: hash(Math.round(x), 3) < 0.5, shadow: false, sway: 0.04 });
      }
      // the ruins court: broken pillars, rubble and the entrance gate
      const R = (k, tx, ty, o) => this.prop(k, tx * TILE + 16, ty * TILE + 30, o);
      R("pillar1", 30, 23, { flip: false }); R("pillar2", 36, 23); R("pillar2", 30, 27); R("pillar1", 36, 27);
      R("pillar2", 30, 25); R("fallen", 36, 25); R("fallen", 31, 23); R("altar", 35, 23); R("boulder", 32, 27); R("rocks", 34, 27); R("steps", 30, 24, { shadow: false });
      for (const [tx, ty] of [[34, 23], [32, 23], [30, 26], [36, 24], [36, 26], [31, 27], [35, 27], [33, 27], [30, 22]]) R(hash(tx, ty) < 0.5 ? "rocks" : "shrub", tx, ty, { shadow: false });
      this.gate = this.prop("gate", 33 * TILE + 16, 26 * TILE - 2);
      // a warm flicker of light in the gate's doorway
      this.glow = this.add.ellipse(33 * TILE + 16, 25 * TILE + 10, 60, 40, 0xff9a40, 0.0).setDepth(26 * TILE + 1).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: this.glow, alpha: { from: 0.06, to: 0.18 }, duration: 900, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    }
    rim(tx, ty) {
      const k = hash(tx, ty + 11);
      this.prop(k < 0.55 ? "boulder" : "rocks", tx * TILE + 16 + (hash(ty, tx) - 0.5) * 10, ty * TILE + 34, { flip: k < 0.3, shadow: false }).setScale(0.9 + hash(tx + 1, ty) * 0.5);
    }

    // ----- hero and NPCs -----
    makePeople() {
      this.npcs = [];
      const defs = [
        { art: "mentor", x: 6, y: 9, name: "Mentor", say: "Davichi, the ruins lie east, beyond the oasis. Do not go in unprepared." },
        { art: "innkeeper", x: 5, y: 6, name: "Innkeeper", say: "A bed and a hot meal for a few coins. Come back when you are hurt." },
        { art: "merchant", x: 10, y: 6, name: "Merchant", say: "Fresh supplies! The desert eats gear for breakfast." },
        { art: "scholar", x: 12, y: 9, name: "Scholar", say: "The glyphs on that gate speak of a titan that sleeps below." },
      ];
      for (const d of defs) {
        const x = d.x * TILE + 16, y = d.y * TILE + 30;
        const sh = this.add.image(x, y - 1, "shadow").setDepth(y - 1);
        const s = this.add.image(x, y, d.art).setOrigin(0.5, 1).setDepth(y);
        this.tweens.add({ targets: s, scaleY: { from: 1, to: 0.97 }, duration: 900 + hash(d.x, d.y) * 500, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
        this.npcs.push({ s, x, y, name: d.name, say: d.say });
      }
      const sx = 8 * TILE + 16, sy = 9 * TILE + 30;
      this.heroShadow = this.add.image(sx, sy - 1, "shadow").setDepth(sy - 1);
      this.hero = this.add.image(sx, sy, "hero").setOrigin(0.5, 1).setDepth(sy);
      this.pos = { x: sx, y: sy };
      this.moving = false;
    }

    blocked(x, y) {
      const tx = Math.floor(x / TILE), ty = Math.floor(y / TILE);
      if (tx < 0 || ty < 0 || tx >= MW || ty >= MH) return true;
      if (SOLID.has(this.grid[ty][tx])) return true;
      if (inWater(x, y)) return true;
      for (const n of this.npcs) if (Math.abs(x - n.x) < 9 && Math.abs(y - n.y) < 6) return true;
      return false;
    }
    free(x, y) { return !(this.blocked(x - 6, y) || this.blocked(x + 6, y) || this.blocked(x - 6, y - 5) || this.blocked(x + 6, y - 5)); }

    // ----- water shimmer: two highlight layers fade against each other, glints pop on the surface -----
    makeWaterShimmer() {
      const b = this.waterBox, w = b.x1 - b.x0, h = b.y1 - b.y0, wm = this.groundMasks;
      const waterT = readTexture(this, "tex_water", [1, 1, 1], 1, 1.5);
      for (let layer = 0; layer < 2; layer++) {
        const c = makeCanvas(w, h), ctx = c.getContext("2d"), img = ctx.createImageData(w, h), lay = [0, 0, 0];
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
          const wx = x + b.x0, wy = y + b.y0, a = wm.waterM[wy * WW + wx] * (1 - clamp(wm.pathM[wy * WW + wx] * 1.5, 0, 1));
          if (a < 0.6) continue;
          sampleTex(waterT, wx, wy, layer ? 150 : 20, layer ? 90 : 10, lay);
          const l = lay[0] * 0.3 + lay[1] * 0.59 + lay[2] * 0.11;
          if (l > 150 && ((x + y) & 1) === 0) { const o = (y * w + x) * 4; img.data[o] = 180; img.data[o + 1] = 245; img.data[o + 2] = 225; img.data[o + 3] = 210; }
        }
        ctx.putImageData(img, 0, 0);
        this.textures.addCanvas("waterHi" + layer, c);
        const s = this.add.image(b.x0, b.y0, "waterHi" + layer).setOrigin(0, 0).setDepth(1).setAlpha(layer ? 0.1 : 0.7);
        this.tweens.add({ targets: s, alpha: layer ? 0.75 : 0.08, duration: 1700, yoyo: true, repeat: -1, ease: "Sine.easeInOut", delay: layer ? 0 : 200 });
      }
      this.time.addEvent({ delay: 170, loop: true, callback: () => {
        for (let k = 0; k < 2; k++) {
          const x = OASIS.x + (Math.random() - 0.5) * OASIS.rx * 1.7, y = OASIS.y + (Math.random() - 0.5) * OASIS.ry * 1.6;
          if (waterDepth(x, y) > 0.8 || onCauseway(y)) continue;
          const g = this.add.image(Math.round(x), Math.round(y), "glint").setDepth(2).setAlpha(0);
          this.tweens.add({ targets: g, alpha: 0.9, duration: 260, yoyo: true, onComplete: () => g.destroy() });
        }
      } });
    }

    // ----- floating dust, heat tint and a vignette over everything -----
    makeAtmosphere() {
      this.motes = [];
      for (let i = 0; i < 46; i++) this.motes.push({ s: this.add.image(0, 0, "dust").setDepth(9000).setAlpha(0.08 + Math.random() * 0.2), vx: 18 + Math.random() * 30, ph: Math.random() * 6.28, x: Math.random() * 1000, y: Math.random() * 600 });
      this.add.rectangle(0, 0, 960, 540, 0x3a1c30, 0.16).setOrigin(0, 0).setScrollFactor(0).setDepth(9500).setBlendMode(Phaser.BlendModes.MULTIPLY);
      this.add.rectangle(0, 0, 960, 540, 0xffa860, 0.05).setOrigin(0, 0).setScrollFactor(0).setDepth(9501).setBlendMode(Phaser.BlendModes.ADD);
      this.add.image(0, 0, "vignette").setOrigin(0, 0).setScrollFactor(0).setDepth(9600);
    }

    // ----- input -----
    pointerDown(p) {
      const w = this.cameras.main.getWorldPoint(p.x, p.y);
      for (const n of this.npcs) if (Math.abs(w.x - n.x) < 16 && w.y > n.y - 50 && w.y < n.y + 6 && Math.hypot(this.pos.x - n.x, this.pos.y - n.y) < 70) { this.say(n); return; }
    }
    talk() {
      let best = null, bd = 56;
      for (const n of this.npcs) { const d = Math.hypot(this.pos.x - n.x, this.pos.y - n.y); if (d < bd) { bd = d; best = n; } }
      if (best) this.say(best);
    }
    say(n) {
      if (this.speech) this.speech.destroy();
      this.speech = this.add.text(480, 480, n.name + ": " + n.say, { fontFamily: "Noto Sans KR, sans-serif", fontSize: "15px", color: "#fbe9c0", backgroundColor: "#1a0f1ae6", padding: { x: 12, y: 8 }, wordWrap: { width: 640 } }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(20001);
      this.speechUntil = this.time.now + 3800;
    }

    update(time, delta) {
      const dt = delta / 1000, k = this.keys, ptr = this.input.activePointer;
      let vx = (k.right.isDown || k.d.isDown ? 1 : 0) - (k.left.isDown || k.a.isDown ? 1 : 0);
      let vy = (k.down.isDown || k.s.isDown ? 1 : 0) - (k.up.isDown || k.w.isDown ? 1 : 0);
      if (!vx && !vy && ptr.isDown) {                      // hold the mouse / finger to walk toward it
        const w = this.cameras.main.getWorldPoint(ptr.x, ptr.y), dx = w.x - this.pos.x, dy = w.y - (this.pos.y - 14), d = Math.hypot(dx, dy);
        if (d > 8) { vx = dx / d; vy = dy / d; }
      }
      const len = Math.hypot(vx, vy) || 1; vx /= len; vy /= len;
      const speed = 108;
      let moved = false;
      if (vx || vy) {
        const nx = this.pos.x + vx * speed * dt, ny = this.pos.y + vy * speed * dt;
        if (this.free(nx, this.pos.y)) { this.pos.x = nx; moved = true; }
        if (this.free(this.pos.x, ny)) { this.pos.y = ny; moved = true; }
        if (Math.abs(vx) > 0.2) this.hero.setFlipX(vx < 0);
      }
      this.moving = moved;
      this.hero.setPosition(Math.round(this.pos.x), Math.round(this.pos.y)).setDepth(this.pos.y);
      this.heroShadow.setPosition(Math.round(this.pos.x), Math.round(this.pos.y) - 1).setDepth(this.pos.y - 1);
      this.hero.setScale(1, moved ? 1 - 0.035 * Math.abs(Math.sin(time * 0.014)) : 1);
      if (moved) {                                          // dust puffs under the boots
        this.puffTimer -= dt;
        if (this.puffTimer <= 0) {
          this.puffTimer = 0.16;
          const p = this.add.image(Math.round(this.pos.x - vx * 6), Math.round(this.pos.y - 1), "puff").setDepth(this.pos.y + 0.5).setAlpha(0.5).setScale(0.6);
          this.tweens.add({ targets: p, alpha: 0, scale: 1.3, y: p.y - 5, duration: 480, onComplete: () => p.destroy() });
        }
      }
      // palms and reeds sway in the wind
      for (const w of this.swayers) {
        const a = Math.sin(time * 0.0014 + w.phase) * w.amp + Math.sin(time * 0.0031 + w.phase * 2) * w.amp * 0.4;
        if (w.s.setSkew) w.s.setSkew(a, 0); else w.s.rotation = a * 0.6;
      }
      // dust motes drift across the view
      const v = this.cameras.main.worldView;
      for (const m of this.motes) {
        m.x += m.vx * dt; m.y += Math.sin(time * 0.001 + m.ph) * 6 * dt;
        let sx = v.x + ((m.x - v.x) % 1000 + 1000) % 1000 - 20, sy = v.y + ((m.y - v.y) % 600 + 600) % 600 - 20;
        m.s.setPosition(Math.round(sx), Math.round(sy));
      }
      // prompts
      const near = this.npcs.find(n => Math.hypot(this.pos.x - n.x, this.pos.y - n.y) < 56);
      const atGate = Math.floor(this.pos.x / TILE) === 33 && Math.floor((this.pos.y - 2) / TILE) === 25;
      if (this.speech && time > this.speechUntil) { this.speech.destroy(); this.speech = null; }
      const msg = atGate ? "The Dune Ruins - the real game would warp you inside here" : near && !this.speech ? "E / Space: talk to " + near.name : "";
      this.hint.setText(msg).setVisible(msg !== "");
    }
  }

  new Phaser.Game({
    type: Phaser.AUTO, width: 960, height: 540, parent: "game", pixelArt: true, roundPixels: true, backgroundColor: "#0b0710",
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [OverworldScene],
  });
})();
