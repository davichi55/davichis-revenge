// Option 5: 2D + painted. The painted top-down ground (assets/ow3d/ground.png) is the map; crisp pixel sprites (walls, towers,
// gates, buildings, statues, market, people) stand on it and are y-sorted, so you walk behind and in front of them.
// The layout was measured on the painting (same numbers as option 4); collision = painted rock/water (assets/ow3d/grid.json)
// plus the footprints of everything we put on top. Aztec-like look: sprite sheets in assets/ow2dp/ (generated, magenta-keyed).
// Ambience: brazier glow + embers, swaying banners and plants, birds, butterflies, water glints and ripples, drifting dust.
(function () {
  "use strict";
  if (/[?&]raf/.test(location.search)) window.requestAnimationFrame = cb => setTimeout(() => cb(performance.now()), 16);   // test hook: keeps the game running in a hidden browser pane
  const WW = 1972, WH = 1344, K = WW / 1244, GW = 44, GH = 30, CELL = 8, CW = Math.ceil(WW / CELL), CH = Math.ceil(WH / CELL);
  const fx = f => f * WW, fz = f => f * WH;
  const TOWN = { x0: fx(0.046), x1: fx(0.33), z0: fz(0.075), z1: fz(0.415), gaps: { top: [0.177, 0.215], bottom: [0.177, 0.258], right: [0.22, 0.29] } };
  const TEMPLE = { x0: fx(0.68), x1: fx(0.955), z0: fz(0.56), z1: fz(0.92) };
  const OASIS = { x: 1125, y: 313, rx: 198, ry: 130 };      // measured on the painting
  const WALL0 = TOWN.z0 + 14, WALL1 = TOWN.z1 + 14;           // y of the wall bases (bottom of the front faces)
  const GX_TOP = (fx(TOWN.gaps.top[0]) + fx(TOWN.gaps.top[1])) / 2, GX_BOT = (fx(TOWN.gaps.bottom[0]) + fx(TOWN.gaps.bottom[1])) / 2;
  const OPEN = 22;                                            // half width of the walkable opening in a gate arch
  const ARCH_DX = 15;                                         // the arch sprite's dark opening sits 15 px right of its centre
  const NPC_SCALE = 1.3;
  // the dirt road on the painting (painting pixels), used to keep boulders and cacti off it
  const ROADS = [
    [[240, 372], [255, 430], [300, 490], [400, 505], [520, 480], [640, 440], [760, 395], [880, 380], [940, 400], [960, 440], [900, 470]],
    [[870, 190], [940, 215], [965, 280], [960, 360], [950, 440]],
  ].map(r => r.map(p => [p[0] * K, p[1] * K]));
  const hash = (x, y) => { let n = Math.floor(x) * 374761393 + Math.floor(y) * 668265263; n = (n ^ (n >> 13)) * 1274126177; return ((n ^ (n >> 16)) >>> 0) / 4294967295; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function segDist(px, py, ax, ay, bx, by) { const dx = bx - ax, dy = by - ay, t = clamp(((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy), 0, 1); return Math.hypot(px - ax - t * dx, py - ay - t * dy); }
  const roadDist = (x, y) => { let d = 1e9; for (const r of ROADS) for (let i = 0; i < r.length - 1; i++) d = Math.min(d, segDist(x, y, r[i][0], r[i][1], r[i + 1][0], r[i + 1][1])); return d; };
  // army routes (world px) and sites; scatter stays off all of them
const LANES = {
  patrol1: ROADS[0].slice(0, 8),
  patrol2: [[860, 150], [860, 430], [1000, 560], [1250, 580], [1440, 560], [1440, 140], [1100, 125]],
  chase: [[200, 720], [480, 760], [760, 880], [1000, 850], [1180, 980], [1230, 1150]],
};
const STANDOFF = { x: 980, y: 1130 }, WRECKS = [[560, 1150], [1640, 520]];
function mkPath(pts, closed) { const p = closed ? pts.concat([pts[0]]) : pts, cum = [0]; for (let i = 1; i < p.length; i++) cum.push(cum[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1])); return { p, cum, L: cum[cum.length - 1] }; }
function pathAt(P, s) { s = Math.max(0, Math.min(P.L - 0.001, s)); let i = 1; while (P.cum[i] < s) i++; const a = P.p[i - 1], b = P.p[i], d = P.cum[i] - P.cum[i - 1], t = (s - P.cum[i - 1]) / d; return { x: a[0] + (b[0] - a[0]) * t, y: a[1] + (b[1] - a[1]) * t, hx: (b[0] - a[0]) / d, hy: (b[1] - a[1]) / d }; }
const makeCanvas = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };

  const SPRITES = ["wall", "wallBlock", "wallBlock2", "tower", "gateArch", "pyramid", "serpent", "jaguar", "sunstone", "stele", "steleFace", "headBlock", "brazier", "featherPole", "sunBanner", "ballRing",
    "awning", "blanket", "jars", "rack", "maize", "boatSide", "agave", "boat", "marigold", "scrub", "inn", "lgA", "lgB", "lgSpear", "lgBanner", "lgDead", "lgCent", "rbA", "rbB", "rbArcher", "rbBanner", "rbDead", "rbSword", "cavA", "cavB", "jackA", "jackB", "hyena", "skull", "ribs", "bones", "bones2", "grass", "grass2", "wagon", "debris", "heroDown0", "heroDown1", "heroDown2", "heroUp0", "heroUp1", "heroUp2", "heroSide0", "heroSide1", "heroSide2", "house", "well", "temple", "facePillar", "platform", "chacmool"];
  const OW2D = ["palm1", "palm2", "cactus", "barrel", "boulder", "rocks", "shrub", "reeds"];

  class Scene extends Phaser.Scene {
    constructor(key) { super(key || "ow2dp"); }
    zoneAt(x, y) {
      const T = TOWN;
      if (x > T.x0 - 40 && x < T.x1 + 40 && y > T.z0 - 40 && y < T.z1 + 60) return "town";
      if (x > TEMPLE.x0 - 20 && x < TEMPLE.x1 + 20 && y > TEMPLE.z0 - 120 && y < TEMPLE.z1 + 20) return "court";
      return roadDist(x, y) < 46 ? "road" : "sand";
    }
    armyNear(r) {
      const h = this.pos;
      for (const g of this.groups) { if (this.isHidden(g.name)) continue; for (const u of g.units) if (u.kind === "legion" && !u.dead && u.placed && Math.hypot(u.x - h.x, u.y - h.y) < r) return true; }
      return !this.isHidden("stand") && Math.hypot(STANDOFF.x - h.x, STANDOFF.y - h.y) < r;
    }
    startPos() { return [400, 372]; }
    isHidden(name) { return !!name && Date.now() < ((window.OWS && window.OWS.hide[name]) || 0); }
    hideFor(name, ms) { window.OWS = window.OWS || { hide: {} }; window.OWS.hide[name] = Date.now() + ms; }
    preload() {
      if (this.add) this.add.text(480, 270, "Loading the desert...", { fontFamily: "Marcellus, Georgia, serif", fontSize: "20px", color: "#d9c7a4" }).setOrigin(0.5);
      this.load.image("groundSrc", "assets/ow3d/ground.png");
      this.load.json("grid", "assets/ow3d/grid.json");
      SPRITES.forEach(k => this.load.image(k, "assets/ow2dp/" + k + ".png"));
      OW2D.forEach(k => this.load.image(k, "assets/ow2d/" + k + ".png"));
      ["mentor", "innkeeper", "merchant", "scholar", "horncinder", "shellmund", "kitsuneva"].forEach(k => this.load.image(k, "assets/" + k + ".png"));
    }

    create() { try { this.create0(); } catch (e) { window.OW2ERR = e.stack; document.title = "ERR " + e.message; console.error(e); } }
    create0() {
      window.OW2DP = this; this.busy = false; this.noPtr = false; this.touch = null; this.legionNear = this.beastNear = false; this.hudT = 0;
      this.block = new Uint8Array(CW * CH);
      this.swayers = []; this.fires = []; this.fireKinds = [];
      this.makeTextures();
      this.paintGround();
      this.initCollision();
      this.buildTown();
      this.buildOutside();
      this.buildTemple();
      this.makePeople();
      this.buildArmies();
      this.makeAmbience();
      this.keys = this.input.keyboard.addKeys({ up: "UP", down: "DOWN", left: "LEFT", right: "RIGHT", w: "W", a: "A", s: "S", d: "D" });
      this.input.keyboard.on("keydown-E", () => this.talk()); this.input.keyboard.on("keydown-SPACE", () => this.talk());
      this.input.on("pointerdown", p => this.pointerDown(p));
      this.cameras.main.setBounds(0, -80, WW, WH + 80).startFollow(this.hero, true, 0.12, 0.12).setRoundPixels(true);
      this.puffTimer = 0; this.speech = null;
      this.hint = this.add.text(480, 520, "", { fontFamily: "Marcellus, Georgia, serif", fontSize: "13px", color: "#f0d9a8", backgroundColor: "#00000099", padding: { x: 8, y: 3 } }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(20000);
      if (/debug/.test(location.search)) this.debugOverlay();
      this.safeUntil = this.time.now + 3000; this.talkCool = 0;
      if (this.onReady) this.onReady();
    }

    // ---------- small generated textures ----------
    makeTextures() {
      const mk = (key, w, h, draw) => { const c = makeCanvas(w, h), ctx = c.getContext("2d"); draw(ctx, w, h); if (this.textures.exists(key)) this.textures.remove(key); this.textures.addCanvas(key, c); };
      mk("shadow", 64, 24, (ctx, w, h) => {
        const g = ctx.createRadialGradient(w / 2, h / 2, 1, w / 2, h / 2, w / 2);
        g.addColorStop(0, "rgba(10,4,14,0.55)"); g.addColorStop(1, "rgba(10,4,14,0)");
        ctx.save(); ctx.translate(0, h / 2); ctx.scale(1, h / w); ctx.translate(0, -w / 2); ctx.fillStyle = g; ctx.fillRect(0, 0, w, w); ctx.restore();
      });
      mk("dust", 4, 3, ctx => { ctx.fillStyle = "#e8c890"; ctx.fillRect(0, 1, 4, 1); ctx.fillRect(1, 0, 2, 3); });
      mk("puff", 8, 8, ctx => { ctx.fillStyle = "#c8a070"; ctx.fillRect(2, 0, 4, 8); ctx.fillRect(0, 2, 8, 4); ctx.fillStyle = "#dcb888"; ctx.fillRect(3, 1, 2, 6); });
      mk("glint", 6, 1, ctx => { ctx.fillStyle = "#bfffe8"; ctx.fillRect(1, 0, 4, 1); ctx.fillStyle = "#ffffff"; ctx.fillRect(2, 0, 2, 1); });
      mk("smoke", 10, 10, ctx => { ctx.fillStyle = "rgba(70,60,66,0.9)"; ctx.beginPath(); ctx.arc(5, 5, 4.5, 0, 7); ctx.fill(); });
      mk("spark", 7, 7, ctx => { ctx.fillStyle = "#fff0a0"; ctx.fillRect(3, 0, 1, 7); ctx.fillRect(0, 3, 7, 1); ctx.fillStyle = "#ffffff"; ctx.fillRect(2, 2, 3, 3); });
      mk("pglow", 96, 96, (ctx, w, h) => { const g = ctx.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2); g.addColorStop(0, "rgba(170,80,255,0.8)"); g.addColorStop(0.4, "rgba(130,50,230,0.3)"); g.addColorStop(1, "rgba(110,30,210,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); });
      mk("ember", 2, 2, ctx => { ctx.fillStyle = "#ffb050"; ctx.fillRect(0, 0, 2, 2); });
      mk("glow", 96, 96, (ctx, w, h) => {
        const g = ctx.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2);
        g.addColorStop(0, "rgba(255,170,70,0.9)"); g.addColorStop(0.35, "rgba(255,120,30,0.35)"); g.addColorStop(1, "rgba(255,100,20,0)");
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      });
      mk("vignette", 960, 540, (ctx, w, h) => {
        const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.38, w / 2, h / 2, w * 0.62);
        g.addColorStop(0, "rgba(14,6,20,0)"); g.addColorStop(1, "rgba(14,6,20,0.72)");
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      });
      // birds (two wing frames, seen from above) and butterflies
      const bird = up => ctx => { ctx.fillStyle = "#1c1218"; ctx.fillRect(4, 3, 2, 3); if (up) { ctx.fillRect(1, 1, 3, 1); ctx.fillRect(0, 0, 1, 1); ctx.fillRect(6, 1, 3, 1); ctx.fillRect(9, 0, 1, 1); } else { ctx.fillRect(1, 3, 3, 1); ctx.fillRect(0, 4, 1, 1); ctx.fillRect(6, 3, 3, 1); ctx.fillRect(9, 4, 1, 1); } };
      mk("bird0", 10, 7, bird(true)); mk("bird1", 10, 7, bird(false));
      const fly = (c1, c2, open) => ctx => { ctx.fillStyle = c1; ctx.fillRect(open ? 0 : 1, 0, open ? 2 : 1, 2); ctx.fillRect(open ? 4 : 2, 0, open ? 2 : 1, 2); ctx.fillStyle = c2; ctx.fillRect(2, 1, 2, 2); };
      mk("bfly0", 6, 3, fly("#f0a030", "#3a2010", true)); mk("bfly1", 6, 3, fly("#f0a030", "#3a2010", false));
      mk("bfly2", 6, 3, fly("#58c8c0", "#1a2a30", true)); mk("bfly3", 6, 3, fly("#58c8c0", "#1a2a30", false));
    }

    // ---------- the painted ground, with a dark rock rim over its grey frame, drawn into a canvas so shadows can be baked in ----------
    paintGround() {
      const c = makeCanvas(WW, WH), ctx = c.getContext("2d");
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
      ctx.drawImage(this.textures.get("groundSrc").getSourceImage(), 0, 0, WW, WH);
      const rim = (x0, y0, x1, y1) => { const g = ctx.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, "rgba(22,14,10,1)"); g.addColorStop(0.5, "rgba(22,14,10,1)"); g.addColorStop(1, "rgba(22,14,10,0)"); return g; };
      ctx.fillStyle = rim(0, 0, 0, 74); ctx.fillRect(0, 0, WW, 74);
      ctx.fillStyle = rim(0, WH, 0, WH - 74); ctx.fillRect(0, WH - 74, WW, 74);
      ctx.fillStyle = rim(0, 0, 74, 0); ctx.fillRect(0, 0, 74, WH);
      ctx.fillStyle = rim(WW, 0, WW - 74, 0); ctx.fillRect(WW - 74, 0, 74, WH);
      this.shadowCtx = ctx;
      if (this.textures.exists("ground")) this.textures.remove("ground"); this.textures.addCanvas("ground", c);
      this.add.image(0, 0, "ground").setOrigin(0, 0).setDepth(0);
    }
    bakeShadow(x, base, w, h, kind) {
      const ctx = this.shadowCtx; ctx.save(); ctx.filter = "blur(2px)"; ctx.fillStyle = "rgba(14,5,18,0.4)"; ctx.strokeStyle = "rgba(14,5,18,0.34)"; ctx.beginPath();
      if (kind === "tall") { ctx.lineWidth = 8; ctx.globalAlpha = 0.6; ctx.moveTo(x, base - 2); ctx.lineTo(x + h * 0.42, base + h * 0.1); ctx.stroke(); ctx.globalAlpha = 1; ctx.beginPath(); ctx.ellipse(x + h * 0.45, base + h * 0.11, w * 0.4, w * 0.13, 0.2, 0, 7); ctx.fill(); }
      else if (kind === "box") { const hw = w * 0.42, L = Math.min(h * 0.3, 60); ctx.moveTo(x - hw, base); ctx.lineTo(x + hw, base); ctx.lineTo(x + hw + L, base + L * 0.5); ctx.lineTo(x - hw + L, base + L * 0.5); ctx.closePath(); ctx.fill(); }
      else { ctx.ellipse(x + w * 0.1, base - 1, w * 0.46, Math.max(4, w * 0.13), 0, 0, 7); ctx.fill(); }
      ctx.restore();
    }

    // ---------- collision: a grid of 8 px cells ----------
    initCollision() {
      const g = this.cache.json.get("grid"), tw = WW / GW, th = WH / GH;
      this.tiles = g;
      for (let cy = 0; cy < CH; cy++) for (let cx = 0; cx < CW; cx++) {
        const tx = Math.min(GW - 1, Math.floor((cx * CELL + CELL / 2) / tw)), ty = Math.min(GH - 1, Math.floor((cy * CELL + CELL / 2) / th)), t = g[ty][tx];
        if (t === "water" || t === "rock" || tx === 0 || ty === 0 || tx === GW - 1 || ty === GH - 1) this.block[cy * CW + cx] = 1;
      }
    }
    tileAt(x, y) { const tx = Math.floor(x / (WW / GW)), ty = Math.floor(y / (WH / GH)); return tx < 0 || ty < 0 || tx >= GW || ty >= GH ? "rock" : this.tiles[ty][tx]; }
    blockRect(x0, y0, x1, y1) { for (let cy = Math.max(0, Math.floor(y0 / CELL)); cy <= Math.min(CH - 1, Math.floor((y1 - 0.01) / CELL)); cy++) for (let cx = Math.max(0, Math.floor(x0 / CELL)); cx <= Math.min(CW - 1, Math.floor((x1 - 0.01) / CELL)); cx++) this.block[cy * CW + cx] = 1; }
    blockedAt(x, y) { const cx = Math.floor(x / CELL), cy = Math.floor(y / CELL); return cx < 0 || cy < 0 || cx >= CW || cy >= CH || this.block[cy * CW + cx] === 1; }
    free(x, y) { return !(this.blockedAt(x - 4, y) || this.blockedAt(x + 4, y) || this.blockedAt(x - 4, y - 3) || this.blockedAt(x + 4, y - 3)); }
    ok(x, y) { return this.free(x, y) && !this.npcAt(x, y); }
    npcAt(x, y) { for (const n of this.npcs || []) if (Math.abs(x - n.x) < 10 && Math.abs(y - n.y) < 7) return true; return false; }
    // can a person walk from (ax,ay) to (bx,by)? breadth-first search on a 4 px lattice (used by the gate checks)
    reach(ax, ay, bx, by) {
      const S = 4, W = Math.floor(WW / S), H = Math.floor(WH / S), key = (x, y) => y * W + x, seen = new Uint8Array(W * H);
      const sx = Math.round(ax / S), sy = Math.round(ay / S), ex = Math.round(bx / S), ey = Math.round(by / S), q = [[sx, sy]]; seen[key(sx, sy)] = 1;
      for (let i = 0; i < q.length; i++) {
        const [x, y] = q[i]; if (Math.abs(x - ex) <= 1 && Math.abs(y - ey) <= 1) return true;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H || seen[key(nx, ny)] || !this.free(nx * S, ny * S)) continue; seen[key(nx, ny)] = 1; q.push([nx, ny]); }
      }
      return false;
    }

    // ---------- placing sprites ----------
    // o: solid [halfWidth, depth] footprint, shadow kind, sway amplitude, scale, flip, dy (depth shift), fire [dx, dy-from-base, glowScale]
    P(key, x, base, o) {
      o = o || {};
      const s = this.add.image(Math.round(x), Math.round(base), key).setOrigin(0.5, 1).setDepth(base + (o.dy || 0));
      if (o.scale) s.setScale(o.scale); if (o.flip) s.setFlipX(true);
      const w = s.displayWidth, h = s.displayHeight;
      if (o.shadow) this.bakeShadow(x, base, w, h, o.shadow);
      if (o.solid) this.blockRect(x - o.solid[0], base - o.solid[1], x + o.solid[0], base);
      if (o.sway) this.swayers.push({ s, phase: hash(x, base) * 6.28, amp: o.sway });
      if (o.fire) this.addFire(x + o.fire[0], base + o.fire[1], o.fire[2] || 1);
      return s;
    }
    addFire(x, y, k) {
      const glow = this.add.image(Math.round(x), Math.round(y), "glow").setDepth(8000).setBlendMode(Phaser.BlendModes.ADD).setScale(1.4 * k).setAlpha(0.5);
      this.fires.push({ x, y, glow, k, ph: Math.random() * 6.28 });
    }
    // one wall piece between a and b along an axis, made of overlapping sprites
    wallRun(horizontal, a, b, fixed) {
      const len = b - a; if (len < 20) return;
      if (horizontal) {
        const n = Math.ceil(len / 136), step = len / n;
        for (let i = 0; i < n; i++) this.P("wall", a + step * (i + 0.5), fixed, { shadow: false });
        this.shadowStrip(a, fixed, b, fixed + 18);
      } else {
        const n = Math.max(1, Math.round(len / 24)), step = len / n;
        for (let i = 0; i < n; i++) this.P(i % 2 ? "wallBlock2" : "wallBlock", fixed, a + step * (i + 0.5) + 10, { scale: 1.15 });
        this.shadowStrip(fixed + 8, a, fixed + 30, b + 8);
      }
    }
    shadowStrip(x0, y0, x1, y1) { const c = this.shadowCtx; c.save(); c.filter = "blur(3px)"; c.fillStyle = "rgba(14,5,18,0.38)"; c.fillRect(x0 + 6, y0 + 2, x1 - x0, y1 - y0); c.restore(); }

    buildTown() {
      const { x0, x1, z0, z1, gaps } = TOWN, gT = gaps.top.map(fx), gB = gaps.bottom.map(fx), gR = gaps.right.map(fz);
      // walls: sprites along the painted footing; the three gaps stay open
      this.wallRun(true, x0, gT[0], WALL0); this.wallRun(true, gT[1], x1, WALL0);
      this.wallRun(true, x0, gB[0], WALL1); this.wallRun(true, gB[1], x1, WALL1);
      this.wallRun(false, z0 + 8, z1 - 6, x0);
      this.wallRun(false, z0 + 8, gR[0] - 14, x1); this.wallRun(false, gR[1] + 14, z1 - 6, x1);
      // wall collision bands (everything except the gate openings)
      this.blockRect(x0 - 14, WALL0 - 18, GX_TOP - OPEN, WALL0); this.blockRect(GX_TOP + OPEN, WALL0 - 18, x1 + 14, WALL0);
      this.blockRect(x0 - 14, WALL1 - 18, GX_BOT - OPEN, WALL1); this.blockRect(GX_BOT + OPEN, WALL1 - 18, x1 + 14, WALL1);
      this.blockRect(x0 - 14, WALL0, x0 + 14, WALL1);
      this.blockRect(x1 - 14, WALL0, x1 + 14, gR[0] + 4); this.blockRect(x1 - 14, gR[1] - 4, x1 + 14, WALL1);
      // gate arches in the top and bottom walls, drawn over the wall ends
      this.P("gateArch", GX_TOP - ARCH_DX, WALL0 + 4, { shadow: "box", dy: 0.5, fire: null });
      this.P("gateArch", GX_BOT - ARCH_DX, WALL1 + 4, { shadow: "box", dy: 0.5 });
      // east gate: two carved posts with banner poles beside them
      this.P("wallBlock2", x1, gR[0] - 2, { scale: 1.5, shadow: "box" }); this.P("wallBlock", x1, gR[1] + 16, { scale: 1.5, shadow: "box" });
      // corner towers with a fire on top
      [[x0, z0 + 14], [x1, z0 + 14], [x0, z1 + 20], [x1, z1 + 20]].forEach(([x, y]) => { this.P("tower", x, y, { solid: [30, 26], shadow: "box", fire: [0, -166, 1.1] }); });
      // braziers and banners at the gates
      const brz = (x, y) => this.P("brazier", x, y, { solid: [10, 8], shadow: "round", fire: [0, -54, 1] });
      brz(GX_TOP - 66, WALL0 + 50); brz(GX_TOP + 48, WALL0 + 50); brz(GX_BOT - 74, WALL1 - 12); brz(GX_BOT + 56, WALL1 - 12);
      this.P("featherPole", GX_TOP - 100, WALL0 + 40, { solid: [5, 5], shadow: "tall", sway: 0.025 }); this.P("featherPole", GX_TOP + 82, WALL0 + 40, { solid: [5, 5], shadow: "tall", sway: 0.025 });
      this.P("sunBanner", x1 - 34, gR[0] - 26, { solid: [5, 5], shadow: "tall", sway: 0.02 }); this.P("sunBanner", x1 - 34, gR[1] + 40, { solid: [5, 5], shadow: "tall", sway: 0.02 });
      // the plaza: inn, house, well, market stall, sun-stone and goods
      this.P("inn", 212, 285, { solid: [80, 36], shadow: "box" });
      this.P("house", 186, 518, { solid: [62, 34], shadow: "box" });
      this.P("well", 330, 412, { solid: [20, 12], shadow: "round" });
      this.P("awning", 510, 262, { solid: [48, 24], shadow: "box", fire: null });
      this.P("jars", 580, 282, { solid: [16, 10], shadow: "round" }); this.P("rack", 446, 272, { solid: [20, 9], shadow: "round" });
      this.P("blanket", 492, 318, { scale: 0.7, shadow: false });
      this.P("sunstone", 574, 478, { solid: [28, 14], shadow: "box" });
      this.P("steleFace", 120, 372, { solid: [14, 8], shadow: "round" });
      [[272, 372, "maize"], [298, 380, "maize"], [248, 440, "marigold"], [606, 170, "agave"], [140, 170, "agave"], [610, 410, "marigold"], [505, 528, "marigold"], [330, 540, "maize"]].forEach(([x, y, k]) =>
        this.P(k, x, y, { solid: k === "agave" ? [22, 10] : [8, 6], shadow: "round", sway: k === "maize" ? 0.03 : 0 }));
      this.P("barrel", 148, 322, { shadow: "round" }); this.P("barrel", 168, 330, { shadow: "round" });
    }

    inExclusion(x, y, pad) {
      const T = TOWN;
      if (x > T.x0 - 60 && x < T.x1 + 90 && y > T.z0 - 70 && y < T.z1 + 130) return true;
      if (x > TEMPLE.x0 - pad && x < TEMPLE.x1 + pad && y > TEMPLE.z0 - 110 - pad && y < TEMPLE.z1 + pad) return true;
      if (Math.hypot((x - OASIS.x) / (OASIS.rx + 30), (y - OASIS.y) / (OASIS.ry + 30)) < 1) return true;
      if (roadDist(x, y) < 46) return true;
      for (const l of Object.values(LANES)) for (let i = 0; i < l.length - 1; i++) if (segDist(x, y, l[i][0], l[i][1], l[i + 1][0], l[i + 1][1]) < 52) return true;
      if (Math.abs(x - STANDOFF.x) < 130 && Math.abs(y - STANDOFF.y) < 90) return true;
      for (const w of WRECKS) if (Math.hypot(x - w[0], y - w[1]) < 150) return true;
      if (x < 90 || y < 90 || x > WW - 90 || y > WH - 90) return true;
      for (let dx = -14; dx <= 14; dx += 14) for (let dy = -10; dy <= 6; dy += 8) if (this.tileAt(x + dx, y + dy) === "water" || this.tileAt(x + dx, y + dy) === "rock") return true;
      return false;
    }

    buildOutside() {
      // statues and shrine along the road, standing stones at the east gate
      this.P("jaguar", GX_BOT - 78, WALL1 + 68, { solid: [14, 10], shadow: "box" }); this.P("jaguar", GX_BOT + 70, WALL1 + 68, { solid: [14, 10], shadow: "box", flip: true });
      this.P("stele", TOWN.x1 + 56, fz(TOWN.gaps.right[0]) - 24, { solid: [18, 10], shadow: "box" }); this.P("stele", TOWN.x1 + 56, fz(TOWN.gaps.right[1]) + 44, { solid: [18, 10], shadow: "box", flip: true });
      this.P("pyramid", 905, 600, { solid: [50, 26], shadow: "box", fire: [2, -138, 1.3] });
      this.P("brazier", 842, 626, { solid: [10, 8], shadow: "round", fire: [0, -54, 1] }); this.P("brazier", 968, 626, { solid: [10, 8], shadow: "round", fire: [0, -54, 1] });
      this.P("serpent", 760, 700, { solid: [22, 12], shadow: "box" });
      this.P("ballRing", 1285, 905, { solid: [20, 12], shadow: "box" });
      // by the oasis: palms, reeds, boats, goods; the boat floats on the water, so it only gets a gentle bob
      this.boat = this.P("boat", 1085, 345, { shadow: false, scale: 0.9 });
      this.P("boatSide", 1262, 392, { shadow: "round" });
      this.P("jars", 1010, 470, { solid: [16, 10], shadow: "round" }); this.P("blanket", 1060, 478, { scale: 0.6, shadow: false }); this.P("rack", 1330, 400, { solid: [20, 9], shadow: "round" });
      for (let i = 0; i < 12; i++) {
        const a = i / 12 * 6.28 + 0.2, r = 1.2 + hash(i, 5) * 0.18, x = OASIS.x + Math.cos(a) * OASIS.rx * r, y = OASIS.y + Math.sin(a) * OASIS.ry * r * 0.95 + 14;
        if (this.inExclusion(x, y, 0) && Math.hypot((x - OASIS.x) / (OASIS.rx + 30), (y - OASIS.y) / (OASIS.ry + 30)) >= 1) { if (roadDist(x, y) < 46 || this.tileAt(x, y) === "rock") continue; }
        else if (this.tileAt(x, y) === "water") continue;
        const t = hash(i, 9);
        this.P(t < 0.5 ? "palm1" : "palm2", x, y, { solid: [8, 6], shadow: "tall", sway: t < 0.5 ? 0.02 : 0.03, flip: t > 0.75 });
      }
      for (let a = 0.1; a < 6.28; a += 0.33) {
        const x = OASIS.x + Math.cos(a) * OASIS.rx * 0.93, y = OASIS.y + Math.sin(a) * OASIS.ry * 0.9 + 4;
        if (this.tileAt(x, y) !== "water" && this.tileAt(x, y + 14) !== "water") continue;
        if (this.tileAt(x, y) === "water" && this.tileAt(x, y - 20) === "water" && this.tileAt(x, y + 20) === "water" && this.tileAt(x - 20, y) === "water") continue;
        this.P("reeds", x, y, { shadow: false, sway: 0.04, flip: hash(a * 10, 3) < 0.5 });
      }
      // scattered desert: cacti, boulders, agave and maize plants, rocks and scrub
      let placed = 0, seed = 12345; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
      for (let i = 0; i < 400 && placed < 70; i++) {
        const x = 90 + rnd() * (WW - 180), y = 100 + rnd() * (WH - 200);
        if (this.inExclusion(x, y, 20)) continue;
        const t = rnd(); placed++;
        if (t < 0.22) this.P("cactus", x, y, { solid: [8, 6], shadow: "round", flip: hash(i, 3) < 0.5 });
        else if (t < 0.32) this.P("barrel", x, y, { solid: [8, 5], shadow: "round" });
        else if (t < 0.45) this.P(hash(i, 4) < 0.5 ? "boulder" : "rocks", x, y, { solid: [24, 12], shadow: "round", flip: hash(i, 6) < 0.5 });
        else if (t < 0.57) this.P(hash(i, 5) < 0.5 ? "grass" : "grass2", x, y, { shadow: false, sway: 0.03 });
        else if (t < 0.62) this.P("skull", x, y, { shadow: "round", flip: hash(i, 7) < 0.5 });
        else if (t < 0.66) this.P("ribs", x, y, { shadow: "round", flip: hash(i, 7) < 0.5 });
        else if (t < 0.72) this.P(hash(i, 8) < 0.5 ? "bones" : "bones2", x, y, { shadow: false });
        else this.P("shrub", x, y, { shadow: false, scale: 0.8, flip: hash(i, 8) < 0.5 });
      }
    }

    buildTemple() {
      const cx = (TEMPLE.x0 + TEMPLE.x1) / 2, base = TEMPLE.z0 + 130;
      this.templeDoor = { x: cx, y: base };
      // the serpent-mouth temple: solid except for the doorway slot; drawn behind the person who steps up to the door
      this.temple = this.P("temple", cx, base, { shadow: "box", dy: -30 });
      this.blockRect(cx - 112, base - 40, cx - 22, base); this.blockRect(cx + 22, base - 40, cx + 112, base); this.blockRect(cx - 112, base - 70, cx + 112, base - 26);
      this.glowDoor = this.add.image(cx, base - 30, "glow").setDepth(base - 29).setBlendMode(Phaser.BlendModes.ADD).setScale(1.3, 0.8).setAlpha(0.35);
      this.P("jaguar", cx - 78, base + 50, { solid: [14, 10], shadow: "box" }); this.P("jaguar", cx + 78, base + 50, { solid: [14, 10], shadow: "box", flip: true });
      this.P("brazier", cx - 30, base + 74, { solid: [10, 8], shadow: "round", fire: [0, -54, 1] }); this.P("brazier", cx + 30, base + 74, { solid: [10, 8], shadow: "round", fire: [0, -54, 1] });
      const { x0, x1, z0, z1 } = TEMPLE;
      [[x0 + 44, z0 + 150], [x1 - 44, z0 + 150], [x0 + 44, z1 - 50], [x1 - 44, z1 - 50]].forEach(([x, y]) => this.P("facePillar", x, y, { solid: [14, 10], shadow: "box" }));
      this.P("platform", x0 + 150, z0 + 330, { solid: [52, 26], shadow: "box" });
      this.P("chacmool", x1 - 150, z0 + 320, { solid: [40, 20], shadow: "box" });
      this.P("serpent", cx, z0 + 420, { solid: [22, 12], shadow: "box" });
      this.P("stele", x0 + 60, z0 + 250, { solid: [18, 10], shadow: "box" }); this.P("headBlock", x1 - 60, z0 + 240, { solid: [18, 10], shadow: "box" });
      this.P("sunBanner", x0 + 120, z0 + 120, { solid: [5, 5], shadow: "tall", sway: 0.02 }); this.P("featherPole", x1 - 120, z0 + 120, { solid: [5, 5], shadow: "tall", sway: 0.025 });
      this.P("grass", x0 + 90, z1 - 60, { shadow: false, sway: 0.03 }); this.P("skull", x1 - 100, z1 - 80, { shadow: "round" }); this.P("bones", x0 + 220, z1 - 40, { shadow: false });
    }

    // ---------- hero and townspeople ----------
    makePeople() {
      this.npcs = [];
      const defs = [
        { id: "mentor", art: "mentor", x: 296, y: 452, name: "Mentor", say: "Davichi, the old temple lies east, beyond the oasis. The serpent gate has not opened in an age. Do not go in unprepared." },
        { id: "inn", art: "innkeeper", x: 180, y: 308, name: "Innkeeper", say: "A bed and a mug of hot cacao for a few coins. Come back when you are hurt." },
        { id: "shop", art: "merchant", x: 492, y: 292, name: "Merchant", say: "Cacao, chili, maize and fine pots! The desert eats gear for breakfast." },
        { id: "scholar", art: "scholar", x: 540, y: 506, name: "Scholar", say: "The glyphs on that sun-stone speak of a titan asleep beneath the temple. The empire's legions guard the roads, so watch your step." },
      ];
      for (const d of defs) {
        this.add.image(d.x, d.y - 1, "shadow").setDepth(d.y - 1).setScale(1.2);
        const s = this.add.image(d.x, d.y, d.art).setOrigin(0.5, 1).setDepth(d.y).setScale(NPC_SCALE);
        this.tweens.add({ targets: s, scaleY: { from: NPC_SCALE, to: NPC_SCALE * 0.97 }, duration: 900 + hash(d.x, d.y) * 500, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
        this.npcs.push({ s, id: d.id, x: d.x, y: d.y, name: d.name, say: d.say });
      }
      const [sx, sy] = this.startPos(); this.face = "down"; this.flipH = false;
      this.heroShadow = this.add.image(sx, sy - 1, "shadow").setDepth(sy - 1).setScale(1);
      this.hero = this.add.image(sx, sy, "heroDown0").setOrigin(0.5, 1).setDepth(sy);
      this.heroGlow = this.add.image(sx, sy - 28, "pglow").setBlendMode(Phaser.BlendModes.ADD).setDepth(sy + 0.2).setScale(0.8, 1);
      this.heroGlowLow = this.add.image(sx, sy - 2, "pglow").setBlendMode(Phaser.BlendModes.ADD).setDepth(sy - 1.5).setScale(0.9, 0.35);
      this.pos = { x: sx, y: sy }; this.moving = false;
      this.makeFollowers(sx, sy);
    }

    // ---------- party followers: they walk the hero's trail, a fixed distance behind ----------
    makeFollowers(sx, sy) {
      const defs = [["horncinder", 0.42, 40], ["shellmund", 0.45, 76], ["kitsuneva", 0.4, 110]];
      this.trail = []; this.trailD = 0;
      for (let d = 130; d >= 0; d -= 4) this.trail.push({ x: sx, y: sy + 0, d: -d });   // the party starts gathered on the hero
      this.followers = defs.map(([k, sc, gap], i) => {
        const src = this.textures.get(k).getSourceImage(), w = Math.round(src.width * sc), h = Math.round(src.height * sc), c = makeCanvas(w, h), ctx = c.getContext("2d");
        ctx.imageSmoothingEnabled = false; ctx.drawImage(src, 0, 0, w, h); if (this.textures.exists("pf" + i)) this.textures.remove("pf" + i); this.textures.addCanvas("pf" + i, c);
        const sh = this.add.image(sx, sy, "shadow").setScale(0.9, 0.8).setAlpha(0.9), s = this.add.image(sx, sy + 6 + i, "pf" + i).setOrigin(0.5, 1);
        return { s, sh, gap, x: sx, y: sy + 6 + i, phase: i * 1.7, flip: false, moving: false };
      });
    }
    updateFollowers(time, dt) {
      const p = this.pos, T = this.trail, last = T[T.length - 1];
      const dd = Math.hypot(p.x - last.x, p.y - last.y);
      if (dd > 80) { T.length = 0; for (let d = 130; d >= 0; d -= 4) T.push({ x: p.x, y: p.y, d: this.trailD - d }); }   // teleport: regroup
      else if (dd >= 2) { this.trailD += dd; T.push({ x: p.x, y: p.y, d: this.trailD }); }
      while (T.length > 2 && T[1].d < this.trailD - 200) T.shift();
      const at = d => { let i = T.length - 1; while (i > 0 && T[i].d > d) i--; const a = T[i], b = T[Math.min(T.length - 1, i + 1)], span = b.d - a.d || 1, t = Math.max(0, Math.min(1, (d - a.d) / span)); return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }; };
      for (const f of this.followers) {
        const tg = at(this.trailD - f.gap), nx = f.x + (tg.x - f.x) * Math.min(1, dt * 10), ny = f.y + (tg.y - f.y) * Math.min(1, dt * 10), mv = Math.hypot(nx - f.x, ny - f.y) / Math.max(dt, 0.001);
        if (Math.abs(nx - f.x) > 0.25 * dt * 60) f.flip = nx > f.x;     // the art faces left
        f.moving = mv > 12; f.x = nx; f.y = ny;
        const bob = f.moving ? Math.abs(Math.sin(time * 0.012 + f.phase)) * 2.5 : 0;
        f.s.setFlipX(f.flip).setPosition(Math.round(f.x), Math.round(f.y - bob)).setDepth(f.y);
        f.sh.setPosition(Math.round(f.x), Math.round(f.y - 1)).setDepth(f.y - 1);
      }
    }

    // ---------- ambience ----------
    makeAmbience() {
      // dust motes, warm overlay, vignette
      this.motes = [];
      for (let i = 0; i < 46; i++) this.motes.push({ s: this.add.image(0, 0, "dust").setDepth(9000).setAlpha(0.08 + Math.random() * 0.2), vx: 18 + Math.random() * 30, ph: Math.random() * 6.28, x: Math.random() * 1000, y: Math.random() * 600 });
      this.add.rectangle(0, 0, 960, 540, 0x3a1c30, 0.16).setOrigin(0, 0).setScrollFactor(0).setDepth(9500).setBlendMode(Phaser.BlendModes.MULTIPLY);
      this.add.rectangle(0, 0, 960, 540, 0xffa860, 0.05).setOrigin(0, 0).setScrollFactor(0).setDepth(9501).setBlendMode(Phaser.BlendModes.ADD);
      this.add.image(0, 0, "vignette").setOrigin(0, 0).setScrollFactor(0).setDepth(9600);
      // birds crossing the sky, each with a small shadow on the ground
      this.birds = [];
      for (let i = 0; i < 4; i++) {
        const s = this.add.image(0, 0, "bird0").setDepth(8500).setScale(2), sh = this.add.image(0, 0, "shadow").setDepth(8499).setScale(0.35, 0.3).setAlpha(0.5);
        this.birds.push({ s, sh, x: hash(i, 71) * WW, y: 150 + hash(i, 72) * (WH - 300), vx: (hash(i, 73) < 0.5 ? -1 : 1) * (36 + hash(i, 74) * 30), vy: (hash(i, 75) - 0.5) * 16, ph: hash(i, 76) * 6 });
      }
      // butterflies around the flowers by the oasis and the plaza
      this.flies = [];
      const spots = [[1010, 470], [1180, 470], [300, 380], [610, 400], [1650, 1150], [1450, 1170], [900, 600], [1300, 420]];
      spots.forEach(([x, y], i) => this.flies.push({ s: this.add.image(x, y, i % 2 ? "bfly0" : "bfly2").setScale(1.5), hx: x, hy: y - 20, ph: i * 1.7, alt: i % 2 }));
      // water: glints, and now and then a slow ripple ring
      this.time.addEvent({ delay: 170, loop: true, callback: () => {
        for (let k = 0; k < 2; k++) {
          const a = Math.random() * 6.28, r = Math.sqrt(Math.random()), x = OASIS.x + Math.cos(a) * r * OASIS.rx * 0.78, y = OASIS.y + 6 + Math.sin(a) * r * OASIS.ry * 0.6;
          if (this.tileAt(x, y) !== "water") continue;
          const g = this.add.image(Math.round(x), Math.round(y), "glint").setDepth(2).setAlpha(0).setScale(1.5);
          this.tweens.add({ targets: g, alpha: 0.9, duration: 260, yoyo: true, onComplete: () => g.destroy() });
        }
      } });
      this.time.addEvent({ delay: 1500, loop: true, callback: () => {
        const x = OASIS.x + (Math.random() - 0.5) * OASIS.rx * 1.2, y = OASIS.y + 10 + (Math.random() - 0.5) * OASIS.ry * 0.9;
        if (this.tileAt(x, y) !== "water") return;
        const e = this.add.ellipse(x, y, 10, 4).setStrokeStyle(1, 0xbfffe8, 0.7).setDepth(2);
        this.tweens.add({ targets: e, scaleX: 4, scaleY: 4, alpha: 0, duration: 1800, onComplete: () => e.destroy() });
      } });
      this.time.addEvent({ delay: 140, loop: true, callback: () => this.spawnEmbers() });
    }
    spawnEmbers() {
      const v = this.cameras.main.worldView;
      for (const f of this.fires) {
        if (f.x < v.x - 40 || f.x > v.right + 40 || f.y < v.y - 40 || f.y > v.bottom + 40 || Math.random() > 0.55) continue;
        const e = this.add.image(Math.round(f.x + (Math.random() - 0.5) * 8), Math.round(f.y), "ember").setDepth(8001).setScale(1 + Math.random());
        this.tweens.add({ targets: e, y: e.y - 26 - Math.random() * 26, x: e.x + (Math.random() - 0.3) * 20, alpha: 0, duration: 900 + Math.random() * 700, onComplete: () => e.destroy() });
      }
    }

    // ---------- armies: legion patrols, a chase, a stand-off, wild beasts, burning wrecks ----------
    mkUnit(g, tex, ox, oy, o) {
      const s = this.add.image(-99, -99, tex).setOrigin(0.5, 1), sh = this.add.image(-99, -99, "shadow").setScale(0.5, 0.45).setAlpha(0.85);
      const u = Object.assign({ s, sh, x: 0, y: 0, ox, oy, tex, frames: [tex], right: true, phase: Math.random() * 6, dead: false, placed: false, kind: "legion", still: false, flip: false }, o || {});
      g.units.push(u); return u;
    }
    addGroup(path, mode, speed, s0, closed) {
      const g = { P: mkPath(path, closed), mode, speed, s: s0, s0, dir: 1, hv: [1, 0], units: [], hidden: false, done: false, dust: 0, lx: 0, ly: 0 };
      this.groups.push(g); return g;
    }
    legionRow(g, rows, cols, banner, cent) {
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const spear = r === 1 && c % 2 === 0;
        this.mkUnit(g, spear ? "lgSpear" : "lgA", -r * 21, (c - (cols - 1) / 2) * 19, { frames: spear ? ["lgSpear"] : ["lgA", "lgB"], still: spear, phase: (r + c) * 0.5 });
      }
      if (banner) this.mkUnit(g, "lgBanner", -rows * 21 - 4, 0, { frames: ["lgBanner"], still: true });
      if (cent) this.mkUnit(g, "lgCent", 18, 0, { frames: ["lgCent"], still: true });
    }
    buildArmies() {
      this.groups = [];
      // 1. a legion patrol marching out along the road from the south gate and back (ping-pong)
      const p1 = this.addGroup(LANES.patrol1, "pingpong", 34, 60); p1.name = "patrol1"; this.legionRow(p1, 2, 4, true, true);
      // 2. a second patrol circling the oasis country
      const p2 = this.addGroup(LANES.patrol2, "loop", 38, 60, true); p2.name = "patrol2"; this.legionRow(p2, 2, 3, true, true);
      // 3. the chase: legion riders run down fleeing rebels, then it starts over
      const ch = this.chase = { reb: this.addGroup(LANES.chase, "once", 66, 130), pur: this.addGroup(LANES.chase, "once", 86, -80), wait: 0, fell: false };
      [[0, -26], [18, -12], [8, 12], [-14, 20], [-30, -4], [-40, 14]].forEach(([ox, oy], i) => this.mkUnit(ch.reb, i === 3 ? "rbArcher" : "rbA", ox, oy, { frames: i === 3 ? ["rbArcher"] : ["rbA", "rbB"], right: false, kind: "rebel", still: i === 3, phase: i }));
      [[0, 0], [-20, -18], [-20, 18], [-42, 0]].forEach(([ox, oy], i) => this.mkUnit(ch.pur, "cavA", ox, oy, { frames: ["cavA", "cavB"], phase: i * 0.7, fps: 8 }));
      ch.reb.name = ch.pur.name = "chase";
      // 4. the stand-off
      this.buildStandoff();
      // 5. jackals circling a burned-out wagon, a second wreck far away, and smoke from both
      this.beasts = [];
      WRECKS.forEach(([x, y]) => { this.P("wagon", x, y, { solid: [30, 12], shadow: "box" }); this.P("debris", x + 56, y + 14, { shadow: false }); this.P("bones", x - 52, y + 10, { shadow: false }); });
      for (let i = 0; i < 4; i++) { const sh = this.add.image(-99, -99, "shadow").setScale(0.5, 0.4), s = this.add.image(-99, -99, "jackA").setOrigin(0.5, 1); this.beasts.push({ s, sh, a: i * 1.57, r: 70 + i * 12, w: (i % 2 ? -1 : 1) * (0.5 + i * 0.07), x: 0, y: 0 }); }
      this.hyena = this.add.image(WRECKS[0][0] + 44, WRECKS[0][1] + 24, "hyena").setOrigin(0.5, 1).setDepth(WRECKS[0][1] + 24);
      this.time.addEvent({ delay: 260, loop: true, callback: () => this.spawnSmoke() });
    }
    buildStandoff() {
      const S = this.stand = { L: [], R: [], t: { shout: 2500, fight: 5000 }, g: { units: [] } };
      const X = STANDOFF.x, Y = STANDOFF.y;
      const mk = (side, tex, hx, hy, o) => {
        const u = this.mkUnit(S.g, tex, 0, 0, Object.assign({ hx, hy, jx: 0, jy: 0, tx: 0, ty: 0, nj: Math.random() * 2000, lunge: 0, side, frames: [tex], still: true, kind: side === "L" ? "legion" : "rebel", right: side === "L", front: false, c: -1, placed: false }, o));
        (side === "L" ? S.L : S.R).push(u); return u;
      };
      for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++) {
        const a = mk("L", r ? "lgSpear" : "lgA", X - 46 - r * 21, Y + (c - 2) * 19, { front: r === 0, c }); if (!r) a.frames = ["lgA"];
        mk("R", r ? (c === 1 || c === 3 ? "rbArcher" : "rbSword") : "rbA", X + 46 + r * 21, Y + (c - 2) * 19, { front: r === 0, c });
      }
      mk("L", "lgBanner", X - 46 - 62, Y, {}); mk("L", "lgCent", X - 46 - 20, Y - 48, {}); mk("R", "rbBanner", X + 46 + 62, Y, {});
    }
    spawnSmoke() {
      const v = this.cameras.main.worldView;
      for (const [x, y] of WRECKS) {
        if (x < v.x - 100 || x > v.right + 100 || y < v.y - 250 || y > v.bottom + 100) continue;
        const e = this.add.image(Math.round(x + (Math.random() - 0.5) * 14), Math.round(y - 40), "smoke").setDepth(8600).setAlpha(0.5).setScale(0.7);
        this.tweens.add({ targets: e, y: e.y - 130 - Math.random() * 50, x: e.x + 30 + Math.random() * 30, scale: 2.8, alpha: 0, duration: 3200 + Math.random() * 1500, onComplete: () => e.destroy() });
      }
    }
    shout(x, y, txt, col) {
      const t = this.add.text(Math.round(x), Math.round(y - 44), txt, { fontFamily: "Marcellus, Georgia, serif", fontSize: "11px", color: col || "#fbe9c0", backgroundColor: "#1a0f1acc", padding: { x: 4, y: 2 } }).setOrigin(0.5, 1).setDepth(9100);
      this.tweens.add({ targets: t, y: t.y - 8, alpha: 0, delay: 1100, duration: 600, onComplete: () => t.destroy() });
    }
    spark(x, y) {
      const e = this.add.image(Math.round(x), Math.round(y), "spark").setDepth(9000).setBlendMode(Phaser.BlendModes.ADD).setScale(1.5);
      this.tweens.add({ targets: e, scale: 3, alpha: 0, duration: 260, onComplete: () => e.destroy() });
    }
    dustAt(x, y, a) {
      const p = this.add.image(Math.round(x), Math.round(y - 1), "puff").setDepth(y + 0.5).setAlpha(a || 0.4).setScale(0.5);
      this.tweens.add({ targets: p, alpha: 0, scale: 1.2, y: p.y - 6, duration: 650, onComplete: () => p.destroy() });
    }
    placeUnit(u, x, y, t, moving, cosh) {
      const f = u.frames, fi = u.dead || u.still || f.length < 2 ? 0 : Math.floor(t / (1000 / (u.fps || 5)) + u.phase) % f.length;
      const tex = u.dead ? u.deadTex : f[fi];
      if (u.s.texture.key !== tex) u.s.setTexture(tex);
      if (cosh !== undefined && Math.abs(cosh) > 0.25 && !u.dead) u.flip = u.right ? cosh < 0 : cosh > 0;
      u.s.setFlipX(u.flip);
      const bob = moving && !u.dead ? (u.still ? Math.abs(Math.sin(t * 0.012 + u.phase)) * 1.4 : fi * 1.2) : 0;
      u.s.setPosition(Math.round(x), Math.round(y - bob)).setDepth(y).setVisible(true);
      u.sh.setPosition(Math.round(x), Math.round(y - 1)).setDepth(y - 1).setVisible(!u.dead);
    }
    killUnit(u, reviveMs) {
      if (u.dead) return; u.dead = true; u.deadTex = u.kind === "legion" ? "lgDead" : "rbDead";
      this.dustAt(u.x, u.y, 0.6);
      if (reviveMs) this.time.delayedCall(reviveMs, () => { u.dead = false; this.dustAt(u.x, u.y, 0.3); });
    }
    updateGroup(g, t, dt) {
      const P = g.P;
      if (!g.done) {
        g.s += g.speed * dt * g.dir;
        if (g.mode === "pingpong") { if (g.s > P.L - 20) { g.s = P.L - 20; g.dir = -1; } if (g.s < 55) { g.s = 55; g.dir = 1; } }
        else if (g.mode === "loop") g.s = (g.s + P.L) % P.L;
        else if (g.s >= P.L - 2) { g.s = P.L - 2; g.done = true; }
      }
      const hide = g.s < 0 || g.hidden || this.isHidden(g.name);
      const a = pathAt(P, g.s), hxn = a.hx * g.dir, hyn = a.hy * g.dir;
      g.hv[0] += (hxn - g.hv[0]) * Math.min(1, dt * 2.5); g.hv[1] += (hyn - g.hv[1]) * Math.min(1, dt * 2.5);
      const hl = Math.hypot(g.hv[0], g.hv[1]) || 1, cx = g.hv[0] / hl, sy = g.hv[1] / hl;
      g.lx = a.x; g.ly = a.y;
      for (const u of g.units) {
        if (hide) { u.s.setVisible(false); u.sh.setVisible(false); u.placed = false; continue; }
        if (!u.dead) {
          const tx = a.x + cx * u.ox - sy * u.oy, ty = a.y + sy * u.ox + cx * u.oy;
          if (!u.placed) { u.x = tx; u.y = ty; u.placed = true; } else { const k = Math.min(1, dt * 7); u.x += (tx - u.x) * k; u.y += (ty - u.y) * k; }
        }
        this.placeUnit(u, u.x, u.y, t, !g.done && !u.dead, cx);
        if (u.alpha !== undefined) { u.s.setAlpha(u.alpha); u.sh.setAlpha(u.alpha * 0.85); }
      }
      g.dust -= dt;
      if (!g.done && !hide && g.dust <= 0 && g.units.length) {
        g.dust = 0.3; const u = g.units[Math.floor(Math.random() * g.units.length)], v = this.cameras.main.worldView;
        if (u.x > v.x - 60 && u.x < v.right + 60 && u.y > v.y - 60 && u.y < v.bottom + 60) this.dustAt(u.x - cx * 8, u.y, 0.38);
      }
    }
    updateChase(t) {
      const c = this.chase, r = c.reb, p = c.pur;
      p.hidden = p.s < 0;
      if (!c.fell && p.s > 0 && Math.hypot(p.lx - r.lx, p.ly - r.ly) < 80 && r.s > 400) {   // the straggler is run down
        c.fell = true; this.killUnit(r.units[5]); this.shout(p.lx, p.ly, "Ride them down!", "#ff9a80");
      }
      if (r.done && p.done && !c.wait) { c.wait = t + 3500; r.units.concat(p.units).forEach(u => this.tweens.add({ targets: u, alpha: 0, duration: 1200, delay: 1500 })); }
      if (c.wait && t > c.wait) {
        c.wait = 0; c.fell = false;
        [r, p].forEach(g => { g.s = g.s0; g.done = false; g.hv = [1, 0]; g.units.forEach(u => { u.dead = false; u.placed = false; u.alpha = 1; }); });
      }
    }
    updateStandoff(t, dt) {
      const S = this.stand, all = S.L.concat(S.R);
      if (this.isHidden("stand")) { all.forEach(u => { u.s.setVisible(false); u.sh.setVisible(false); }); return; }
      for (const u of all) {
        u.nj -= dt * 1000;
        if (u.nj <= 0) { u.nj = 900 + Math.random() * 1800; u.tx = (Math.random() - 0.5) * 5; u.ty = (Math.random() - 0.5) * 3; }
        u.jx += (u.tx - u.jx) * Math.min(1, dt * 3); u.jy += (u.ty - u.jy) * Math.min(1, dt * 3);
        u.x = u.hx + u.jx + u.lunge * (u.side === "L" ? 1 : -1); u.y = u.hy + u.jy;
        this.placeUnit(u, u.x, u.y, t, Math.abs(u.tx - u.jx) > 0.6 && !u.dead);
      }
      S.t.shout -= dt * 1000; S.t.fight -= dt * 1000;
      const v = this.cameras.main.worldView, near = STANDOFF.x > v.x - 150 && STANDOFF.x < v.right + 150 && STANDOFF.y > v.y - 150 && STANDOFF.y < v.bottom + 150;
      if (S.t.shout <= 0) {
        S.t.shout = 3200 + Math.random() * 2600;
        const left = Math.random() < 0.5, pool = (left ? S.L : S.R).filter(u => !u.dead), u = pool[Math.floor(Math.random() * pool.length)];
        const lines = left ? ["Hold the line!", "Shields up!", "For the empire!", "Break them!"] : ["For the free cities!", "Hold!", "Never kneel!", "Stand firm!"];
        if (u && near) this.shout(u.x, u.y - 4, lines[Math.floor(Math.random() * lines.length)], left ? "#ffb0a0" : "#a8c8ff");
      }
      if (S.t.fight <= 0) {
        S.t.fight = 5500 + Math.random() * 4500;
        const c = Math.floor(Math.random() * 5), a = S.L.find(u => u.front && u.c === c && !u.dead), b = S.R.find(u => u.front && u.c === c && !u.dead);
        if (a && b && near) {
          this.tweens.add({ targets: [a, b], lunge: 17, duration: 260, yoyo: true, ease: "Quad.easeOut" });
          [220, 330, 440].forEach((d, i) => this.time.delayedCall(d, () => { this.spark((a.x + b.x) / 2, a.y - 16 + (i - 1) * 3); if (i === 1) this.dustAt((a.x + b.x) / 2, a.y); }));
          if (Math.random() < 0.55) this.time.delayedCall(520, () => this.killUnit(Math.random() < 0.5 ? a : b, 9000));
        }
      }
    }
    updateArmies(t, dt) {
      this.groups.forEach(g => this.updateGroup(g, t, dt));
      this.updateChase(t); this.updateStandoff(t, dt);
      const bh = this.isHidden("beasts");
      this.beasts.forEach(b => { b.s.setVisible(!bh); b.sh.setVisible(!bh); }); this.hyena.setVisible(!bh);
      for (const b of this.beasts) {
        if (bh) break;
        b.a += b.w * dt; const cx = WRECKS[0][0], cy = WRECKS[0][1] + 10, nx = cx + Math.cos(b.a) * b.r * 1.25, ny = cy + Math.sin(b.a) * b.r * 0.7;
        const dx = nx - b.x; if (Math.abs(dx) > 0.05) b.s.setFlipX(dx < 0); b.x = nx; b.y = ny;
        b.s.setTexture(Math.floor(t / 130 + b.a * 3) % 2 ? "jackA" : "jackB").setPosition(Math.round(nx), Math.round(ny)).setDepth(ny); b.sh.setPosition(Math.round(nx), Math.round(ny) - 1).setDepth(ny - 1);
      }
      this.hyena.setScale(1, 1 + Math.sin(t * 0.003) * 0.02);
      // touching a legion soldier or the beasts (hidden groups are skipped)
      let legion = false, beast = false, touch = null; const h = this.pos, standOn = !this.isHidden("stand");
      const hit = (x, y, r, px, py) => Math.hypot(x - px, y - py) < r;
      for (const g of this.groups) { if (this.isHidden(g.name)) continue; for (const u of g.units) if (u.kind === "legion" && !u.dead && u.placed) { if (hit(u.x, u.y, 52, h.x, h.y) || this.followers.some(f => hit(u.x, u.y, 40, f.x, f.y))) { legion = true; touch = touch || { type: "legion", name: g.name }; } } }
      if (standOn) for (const u of this.stand.L) if (!u.dead && (hit(u.x, u.y, 52, h.x, h.y) || this.followers.some(f => hit(u.x, u.y, 40, f.x, f.y)))) { legion = true; touch = touch || { type: "legion", name: "stand" }; }
      if (!bh) for (const b of this.beasts) if (hit(b.x, b.y, 46, h.x, h.y)) { beast = true; touch = touch || { type: "beasts", name: "beasts" }; }
      this.legionNear = legion; this.beastNear = beast; this.touch = touch;
    }

    debugOverlay() {
      const c = makeCanvas(WW, WH), ctx = c.getContext("2d"); ctx.fillStyle = "rgba(255,0,0,0.35)";
      for (let cy = 0; cy < CH; cy++) for (let cx = 0; cx < CW; cx++) if (this.block[cy * CW + cx]) ctx.fillRect(cx * CELL, cy * CELL, CELL, CELL);
      if (this.textures.exists("dbg")) this.textures.remove("dbg"); this.textures.addCanvas("dbg", c); this.add.image(0, 0, "dbg").setOrigin(0, 0).setDepth(9400);
    }

    // ---------- input ----------
    pointerDown(p) {
      if (this.busy || this.noPtr || this.time.now < this.talkCool) return;
      const w = this.cameras.main.getWorldPoint(p.x, p.y);
      for (const n of this.npcs) if (Math.abs(w.x - n.x) < 20 && w.y > n.y - 70 && w.y < n.y + 8 && Math.hypot(this.pos.x - n.x, this.pos.y - n.y) < 80) { this.say(n); return; }
    }
    // slide along obstacles: full step, then each axis alone, then a small sideways nudge around corners; pointer walking also steers around things
    walk(vx, vy, step, steer) {
      const p = this.pos;
      if (steer) {
        const base = Math.atan2(vy, vx), order = this.steerSign > 0 ? [1, -1] : [-1, 1];
        for (const ang of [0, 0.45, 0.9, 1.5708]) for (const sg of ang ? order : [1]) {
          const a = base + ang * sg, dx = Math.cos(a) * step, dy = Math.sin(a) * step;
          if (this.ok(p.x + dx, p.y + dy)) { p.x += dx; p.y += dy; if (ang) this.steerSign = sg; return true; }
          if (ang === 0) { /* fall through to sliding below only if every rotation fails */ }
        }
      }
      if (this.ok(p.x + vx * step, p.y + vy * step)) { p.x += vx * step; p.y += vy * step; return true; }
      let moved = false;
      if (vx && this.ok(p.x + vx * step, p.y)) { p.x += vx * step; moved = true; }
      if (vy && this.ok(p.x, p.y + vy * step)) { p.y += vy * step; moved = true; }
      if (moved) return true;
      // stuck on a corner: look a few pixels to either side for a way past
      const n = step * 0.9, horizontal = Math.abs(vx) >= Math.abs(vy);
      for (const off of [3, 6, 9, 12, 16]) for (const sg of [1, -1]) {
        const tx = horizontal ? p.x + Math.sign(vx) * step : p.x + sg * off, ty = horizontal ? p.y + sg * off : p.y + Math.sign(vy) * step;
        if (this.ok(tx, ty)) { if (horizontal) p.y += sg * Math.min(n, off); else p.x += sg * Math.min(n, off); return true; }
      }
      return false;
    }
    talk() {
      if (this.busy || this.time.now < this.talkCool) return;
      let best = null, bd = 64;
      for (const n of this.npcs) { const d = Math.hypot(this.pos.x - n.x, this.pos.y - n.y); if (d < bd) { bd = d; best = n; } }
      if (best) this.say(best);
    }
    say(n) {
      if (this.speech) this.speech.destroy();
      this.speech = this.add.text(480, 480, n.name + ": " + n.say, { fontFamily: "Marcellus, Georgia, serif", fontSize: "15px", color: "#fbe9c0", backgroundColor: "#1a0f1ae6", padding: { x: 12, y: 8 }, wordWrap: { width: 640 } }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(20001);
      this.speechUntil = this.time.now + 4200;
    }

    update(time, delta) {
      const dt = Math.min(0.05, delta / 1000), k = this.keys, ptr = this.input.activePointer;
      let vx = (k.right.isDown || k.d.isDown ? 1 : 0) - (k.left.isDown || k.a.isDown ? 1 : 0);
      let vy = (k.down.isDown || k.s.isDown ? 1 : 0) - (k.up.isDown || k.w.isDown ? 1 : 0);
      let usePtr = false;
      if (this.busy) { vx = 0; vy = 0; }
      else if (!vx && !vy && ptr.isDown && !this.noPtr) { usePtr = true;
        const w = this.cameras.main.getWorldPoint(ptr.x, ptr.y), dx = w.x - this.pos.x, dy = w.y - (this.pos.y - 18), d = Math.hypot(dx, dy);
        if (d > 8) { vx = dx / d; vy = dy / d; }
      }
      const len = Math.hypot(vx, vy) || 1; vx /= len; vy /= len;
      const step = 135 * dt; let moved = false;
      if (vx || vy) moved = this.walk(vx, vy, step, usePtr);
      this.moving = moved;
      if (vx || vy) { if (Math.abs(vy) > Math.abs(vx) + 0.1) this.face = vy > 0 ? "down" : "up"; else { this.face = "side"; this.flipH = vx < 0; } }
      const px = Math.round(this.pos.x), py = Math.round(this.pos.y), seq = [0, 1, 0, 2], fr = moved ? seq[Math.floor(time / 130) % 4] : 0, bob = moved ? (fr ? 1 : 0) : 0;
      const tex = this.face === "up" ? "heroUp" + fr : this.face === "down" ? "heroDown" + fr : "heroSide" + fr;
      this.hero.setTexture(tex).setFlipX(this.face === "side" && this.flipH).setPosition(px, py - bob).setDepth(this.pos.y);
      this.heroShadow.setPosition(px, py - 1).setDepth(this.pos.y - 1);
      { const pu = 0.5 + 0.5 * Math.sin(time * 0.0026); this.heroGlow.setPosition(px, py - 30).setDepth(this.pos.y + 0.2).setAlpha(0.10 + 0.12 * pu).setScale(0.75 + 0.08 * pu, 0.95 + 0.08 * pu); this.heroGlowLow.setPosition(px, py - 2).setDepth(this.pos.y - 1.5).setAlpha(0.28 + 0.2 * pu); }
      if (moved) {
        this.puffTimer -= dt;
        if (this.puffTimer <= 0) {
          this.puffTimer = 0.16;
          const p = this.add.image(Math.round(this.pos.x - vx * 6), py - 1, "puff").setDepth(this.pos.y + 0.5).setAlpha(0.5).setScale(0.6);
          this.tweens.add({ targets: p, alpha: 0, scale: 1.3, y: p.y - 5, duration: 480, onComplete: () => p.destroy() });
        }
      }
      // wind: palms, banners, feather poles, maize and reeds sway
      for (const w of this.swayers) { const a = Math.sin(time * 0.0014 + w.phase) * w.amp + Math.sin(time * 0.0031 + w.phase * 2) * w.amp * 0.4; if (w.s.setSkew) w.s.setSkew(a, 0); else w.s.rotation = a * 0.6; }
      // fire glow flicker
      for (const f of this.fires) f.glow.setAlpha(0.42 + 0.2 * Math.sin(time * 0.017 + f.ph) + 0.1 * Math.sin(time * 0.043 + f.ph * 3)).setScale((1.4 + 0.08 * Math.sin(time * 0.021 + f.ph)) * f.k);
      this.glowDoor.setAlpha(0.28 + 0.12 * Math.sin(time * 0.004));
      this.boat.y = 345 + Math.sin(time * 0.0016) * 1.5; this.boat.setDepth(this.boat.y - 1);
      // birds
      const wf = Math.floor(time / 140) % 2;
      for (const b of this.birds) {
        b.x += b.vx * dt; b.y += (b.vy + Math.sin(time * 0.001 + b.ph) * 8) * dt;
        if (b.x < -60) b.x = WW + 60; if (b.x > WW + 60) b.x = -60;
        if (b.y < 40) b.vy = Math.abs(b.vy); if (b.y > WH - 40) b.vy = -Math.abs(b.vy);
        b.s.setPosition(Math.round(b.x), Math.round(b.y - 90)).setTexture("bird" + wf).setFlipX(b.vx < 0);
        b.sh.setPosition(Math.round(b.x + 20), Math.round(b.y));
      }
      // butterflies
      for (const f of this.flies) {
        f.s.setPosition(Math.round(f.hx + Math.sin(time * 0.0011 + f.ph) * 34 + Math.sin(time * 0.0027 + f.ph) * 10), Math.round(f.hy + Math.sin(time * 0.0017 + f.ph * 2) * 18)).setDepth(f.s.y + 40);
        f.s.setTexture((f.alt ? "bfly0" : "bfly2").replace(/\d/, d => (+d + (Math.floor(time / 110 + f.ph * 7) % 2)) + ""));
      }
      this.updateFollowers(time, dt);
      this.updateArmies(time, dt);
      // dust drifting through the view
      const v = this.cameras.main.worldView;
      for (const m of this.motes) {
        m.x += m.vx * dt; m.y += Math.sin(time * 0.001 + m.ph) * 6 * dt;
        m.s.setPosition(Math.round(v.x + ((m.x - v.x) % 1000 + 1000) % 1000 - 20), Math.round(v.y + ((m.y - v.y) % 600 + 600) % 600 - 20));
      }
      // prompts
      const near = this.npcs.find(n => Math.hypot(this.pos.x - n.x, this.pos.y - n.y) < 64);
      const td = this.templeDoor, atDoor = this.atDoor = Math.abs(this.pos.x - td.x) < 24 && this.pos.y < td.y + 16 && this.pos.y > td.y - 70;
      if (this.speech && time > this.speechUntil) { this.speech.destroy(); this.speech = null; }
      const msg = this.legionNear && this.msgLegion !== "" ? (this.msgLegion || "A legion patrol spots you! (battle would start here)") : this.beastNear && this.msgLegion !== "" ? "Wild jackals circle the wreck! (battle would start here)" : this.busy ? "" : this.beastNear ? "Wild jackals circle the wreck! (battle would start here)" : atDoor ? (this.doorMsg || "The Serpent Gate - the real game would warp you inside here") : near && !this.speech ? "E / Space: talk to " + near.name : "";
      this.hint.setText(msg).setVisible(msg !== "");
    }
  }

  window.Overworld5 = Scene;
  if (!window.REAL_GAME) new Phaser.Game({
    type: Phaser.AUTO, width: 960, height: 540, parent: "game", pixelArt: true, roundPixels: true, backgroundColor: "#16100c",
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [Scene],
  });
})();
