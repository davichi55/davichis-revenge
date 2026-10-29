// Data-driven overworld ("Option 5") for Davichi's Revenge (owner D). Needs Phaser 3 and src/world/helpers.js.
// Painted ground + crisp y-sorted pixel sprites, collision from the region's terrain grid plus prop footprints, ambience, followers, encounters.
// Everything about a map lives in World.REGIONS[id] (see BUILD_LOG.md for the format). Story code (owner E) only sets World.hooks and starts the scene:
//   game.scene.start("Region", { region: "orun", entry: "start", party: ["horncinder", ...], flags: {...} })
(function () {
  "use strict";
  const World = window.World = window.World || {};
  World.REGIONS = World.REGIONS || {};
  const H = World.hooks = World.hooks || {};
  if (/[?&]raf/.test(location.search)) window.requestAnimationFrame = cb => setTimeout(() => cb(performance.now()), 16);
  // two overlapping scene loads can add the same texture key twice; Phaser then returns null and its loader crashes ("Cannot set properties of null"). Return the existing texture instead.
  if (window.Phaser && Phaser.Textures && !Phaser.Textures.TextureManager.prototype.__guard) {
    const TM = Phaser.Textures.TextureManager.prototype; TM.__guard = true;
    ["addImage", "addCanvas"].forEach(fn => { const o = TM[fn]; TM[fn] = function (key) { if (typeof key === "string" && this.exists(key) && key !== "ground_" + (World.scene && World.scene.rid)) return this.get(key); return o.apply(this, arguments); }; });
  }
  const DEBUG = /[?&]debug/.test(location.search);
  const CELL = 8, SPEED = 135, FOLLOW_H = 52, NPC_SCALE = 1.3;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const hash = (x, y) => { let n = Math.floor(x) * 374761393 + Math.floor(y) * 668265263; n = (n ^ (n >> 13)) * 1274126177; return ((n ^ (n >> 16)) >>> 0) / 4294967295; };
  const mulberry = a => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const strSeed = s => { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return h; };
  const makeCanvas = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
  function segDist(px, py, ax, ay, bx, by) { const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy || 1, t = clamp(((px - ax) * dx + (py - ay) * dy) / l2, 0, 1); return Math.hypot(px - ax - t * dx, py - ay - t * dy); }
  function mkPath(pts, closed) { const p = closed ? pts.concat([pts[0]]) : pts, cum = [0]; for (let i = 1; i < p.length; i++) cum.push(cum[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1])); return { p, cum, L: cum[cum.length - 1] }; }
  function pathAt(P, s) { s = clamp(s, 0, P.L - 0.001); let i = 1; while (P.cum[i] < s) i++; const a = P.p[i - 1], b = P.p[i], d = P.cum[i] - P.cum[i - 1] || 1, t = (s - P.cum[i - 1]) / d; return { x: a[0] + (b[0] - a[0]) * t, y: a[1] + (b[1] - a[1]) * t, hx: (b[0] - a[0]) / d, hy: (b[1] - a[1]) / d }; }
  function pathNearest(P, x, y) { let best = 0, bd = 1e9; for (let i = 0; i < P.p.length - 1; i++) { const a = P.p[i], b = P.p[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy || 1, t = clamp(((x - a[0]) * dx + (y - a[1]) * dy) / l2, 0, 1), d = Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy); if (d < bd) { bd = d; best = P.cum[i] + t * Math.sqrt(l2); } } return best; }

  // ---------- sprite catalogue: where each key lives, and how it behaves by default ----------
  // hero: 8-frame walk cycles rendered from the rigged 3D dread knight (art-review/hero2), plus an idle frame per direction
  const HERO_FRAMES = 8, HERO_FRAME_MS = 95, HERO_KEYS = ["Down", "Up", "Side"].flatMap(d => ["hk" + d + "Idle", ...Array.from({ length: HERO_FRAMES }, (_, i) => "hk" + d + i)]);
  const OW2DP = "wall wallBlock wallBlock2 tower gateArch pyramid serpent jaguar sunstone stele steleFace headBlock brazier featherPole sunBanner ballRing awning blanket jars rack maize boatSide agave boat marigold scrub inn lgA lgB lgSpear lgBanner lgDead lgCent rbA rbB rbArcher rbBanner rbDead rbSword cavA cavB jackA jackB hyena skull ribs bones bones2 grass grass2 wagon debris heroDown0 heroDown1 heroDown2 heroUp0 heroUp1 heroUp2 heroSide0 heroSide1 heroSide2 house well temple facePillar platform chacmool".split(" ");
  const OW2D = "palm1 palm2 cactus barrel boulder rocks shrub reeds".split(" ");
  const LEGACY_NPC = "mentor innkeeper merchant scholar".split(" ");
  const KIND = {
    big: "inn house temple pyramid awning platform chacmool tower wagon", tall: "stele featherPole sunBanner palm1 palm2 facePillar maize", gate: "gateArch",
    round: "jaguar serpent sunstone ballRing jars rack well boatSide cactus barrel boulder rocks agave marigold shrub steleFace headBlock brazier",
    flat: "skull ribs bones bones2 grass grass2 debris blanket scrub hyena reeds boat wall wallBlock wallBlock2",
  };
  const KINDOF = {}; for (const [k, v] of Object.entries(KIND)) v.split(" ").forEach(n => (KINDOF[n] = k));
  const PRESET = { brazier: { solid: [10, 8], fire: [0, -54, 1] }, palm1: { sway: 0.02 }, palm2: { sway: 0.03 }, featherPole: { sway: 0.025 }, sunBanner: { sway: 0.02 }, maize: { sway: 0.03 }, grass: { sway: 0.03 }, grass2: { sway: 0.03 }, reeds: { sway: 0.04 },
    tower: { solid: [30, 26] }, cactus: { solid: [8, 6] }, barrel: { solid: [8, 5] }, boulder: { solid: [24, 12] }, rocks: { solid: [24, 12] }, jaguar: { solid: [14, 10] }, stele: { solid: [18, 10] }, well: { solid: [20, 12] } };
  // per-sprite defaults from its kind and size: [solid footprint half-width, depth], shadow style
  function defaults(key, w, h, man) {
    const kind = (man && man.kind) || KINDOF[key] || "round", p = Object.assign({}, PRESET[key] || {}, man ? { fire: man.fire, sway: man.sway } : {});
    if (p.fire === undefined) delete p.fire; if (!p.sway) delete p.sway;
    if (!p.solid && p.solid !== false) {
      if (kind === "big") p.solid = [Math.round(w * 0.45), clamp(Math.round(h * 0.2), 14, 36)];
      else if (kind === "tall") p.solid = [6, 5];
      else if (kind === "round") p.solid = [Math.max(6, Math.round(w * 0.36)), clamp(Math.round(h * 0.14), 6, 14)];
    }
    p.shadow = kind === "big" || kind === "gate" ? "box" : kind === "tall" ? "tall" : kind === "flat" ? false : "round";
    return p;
  }

  // ---------- small hook helper ----------
  const log = (...a) => { if (World.log) World.log(...a); else console.log("[World]", ...a); };
  async function callHook(name, ...args) {
    const h = H[name]; if (typeof h !== "function") { log("hook " + name + " (not set)", ...args); return undefined; }
    try { return await h(...args); } catch (e) { console.error("World hook " + name + " failed", e); return undefined; }
  }
  function playMusic(key) { try { if (key !== undefined && window.Audio && typeof window.Audio.music === "function") window.Audio.music(key); } catch (e) { /* audio is optional */ } }

  class Region extends Phaser.Scene {
    constructor() { super("Region"); }
    init(data) {
      data = data || {};
      this.rid = data.region || "orun"; this.R = World.REGIONS[this.rid];
      if (!this.R) throw new Error("World: unknown region " + this.rid);
      this.entryName = data.entry || "start"; this.party = (data.party || []).slice(0, 3);
      this.flags = data.flags || (World.flags = World.flags || {});
      this.ready = false; this.dark = null; this.darkRT = null; this.lightImg = null; World.scene = this;
    }

    // ---------- loading ----------
    spriteUrl(key) {
      const man = this.man && this.man[key], R = this.R;
      if (R.sprites && R.sprites[key]) return R.sprites[key];
      if (man) return "assets/regions/sprites/" + key + ".png";
      if (HERO_KEYS.includes(key)) return "assets/hero/" + key + ".png";
      if (OW2DP.includes(key)) return "assets/ow2dp/" + key + ".png";
      if (OW2D.includes(key)) return "assets/ow2d/" + key + ".png";
      if (LEGACY_NPC.includes(key)) return "assets/" + key + ".png";
      return null;
    }
    neededKeys() {
      const R = this.R, s = new Set(HERO_KEYS);
      (R.props || []).forEach(p => s.add(p[0])); (R.scatter || []).forEach(sc => sc.keys.forEach(k => s.add(Array.isArray(k) ? k[0] : k))); (R.npcs || []).forEach(n => n.art && s.add(n.art));
      const a = R.amb || {};
      if ((a.armies && a.armies.length) || a.chase || a.standoff) "lgA lgB lgSpear lgBanner lgDead lgCent rbA rbB rbArcher rbBanner rbDead rbSword cavA cavB".split(" ").forEach(k => s.add(k));
      if (a.wrecks) "wagon debris bones jackA jackB hyena".split(" ").forEach(k => s.add(k));
      return [...s];
    }
    preload() {
      this.add.text(480, 270, (this.R.name || this.rid) + "...", { fontFamily: "Marcellus, Georgia, serif", fontSize: "20px", color: "#d9c7a4" }).setOrigin(0.5);
      this.failed = [];
      this.load.on("loaderror", f => this.failed.push(f.key));
      const R = this.R, queue = () => {
        this.man = this.cache.json.get("regman") || {};
        for (const k of this.neededKeys()) { if (this.textures.exists(k)) continue; const u = this.spriteUrl(k); if (u) this.load.image(k, u); else console.warn("World: no sprite", k); }
        const gk = "gsrc_" + this.rid; if (!this.textures.exists(gk)) this.load.image(gk, R.ground || "assets/regions/" + this.rid + ".png");
        if (R.gridUrl) this.load.json("grid_" + this.rid, R.gridUrl);
        this.party.forEach(id => { const k = "cr_" + id; if (!this.textures.exists(k) && !this.textures.exists("crx_" + id)) this.load.image(k, "assets/creatures/" + id + ".png"); });
      };
      if (this.cache.json.exists("regman")) queue();
      else { this.load.json("regman", "assets/regions/sprites/manifest.json"); this.load.once("filecomplete-json-regman", queue); }
    }
    create() {
      const miss = this.failed.filter(k => k.startsWith("cr_") && !this.textures.exists(k));
      this.failed.filter(k => !k.startsWith("cr_") && !k.startsWith("gsrc_") && k !== "regman").forEach(k => console.warn("World: failed to load", k));
      if (miss.length) { miss.forEach(k => this.load.image("crx_" + k.slice(3), "assets/" + k.slice(3) + ".png")); this.load.once("complete", () => this.safeCreate()); this.load.start(); }
      else this.safeCreate();
    }
    safeCreate() { try { this.create0(); } catch (e) { window.WORLD_ERR = e.stack; document.title = "ERR " + e.message; console.error(e); this.add.text(10, 10, "World error: " + e.message, { color: "#ff8080", fontSize: "14px" }).setScrollFactor(0).setDepth(30000); } }

    create0() {
      const R = this.R;
      window.WORLD_SCENE = this; this.busy = 0; this.noPtr = false; this.hudT = 0; this.condT = 0; this.rng = mulberry(strSeed(this.rid));
      this.swayers = []; this.fires = []; this.conds = []; this.dynSolids = []; this.shadowOnly = false;
      this.makeTextures();
      this.terr = World.rasterize(R, CELL); this.cw = this.terr.cw; this.chh = this.terr.ch;
      if (R.gridUrl) this.applyGrid(this.cache.json.get("grid_" + this.rid));
      this.block = new Uint8Array(this.cw * this.chh); this.occ = new Uint8Array(this.cw * this.chh);
      this.terrBlock = this.terr.names.map(n => World.TERRAIN[n].block);
      for (let i = 0; i < this.block.length; i++) if (this.terrBlock[this.terr.data[i]]) this.block[i] = 1;
      this.paintGround();
      this.reserveAreas();
      this.buildProps();
      this.buildScatter();
      this.buildThings();
      this.makePeople();
      this.makeAmbience();
      this.buildArmies();
      this.makeDark();
      this.keys = this.input.keyboard.addKeys({ up: "UP", down: "DOWN", left: "LEFT", right: "RIGHT", w: "W", a: "A", s: "S", d: "D" });
      this.input.keyboard.on("keydown-E", () => this.interact()); this.input.keyboard.on("keydown-SPACE", () => this.interact());
      this.input.keyboard.on("keydown-ESC", () => { if (!this.busy) this.runHook("menu", this.rid); });
      this.input.on("pointerdown", p => this.pointerDown(p));
      this.cameras.main.setBounds(0, 0, R.w, R.h).startFollow(this.hero, true, 0.12, 0.12).setRoundPixels(true);
      this.puffTimer = 0;
      this.hint = this.add.text(480, 520, "", { fontFamily: "Marcellus, Georgia, serif", fontSize: "13px", color: "#f0d9a8", backgroundColor: "#00000099", padding: { x: 8, y: 3 } }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(20000);
      this.banner = this.add.text(480, 56, R.name || this.rid, { fontFamily: "Marcellus SC, Marcellus, Georgia, serif", fontSize: "26px", color: "#f3dfae", stroke: "#1a0f14", strokeThickness: 5 }).setOrigin(0.5).setScrollFactor(0).setDepth(20000).setAlpha(0);
      this.tweens.add({ targets: this.banner, alpha: 1, duration: 600, yoyo: true, hold: 1500, delay: 300 });
      this.cameras.main.fadeIn(350, 10, 6, 12);
      this.safeUntil = this.time.now + 3000; this.safeDist = 0; this.encFrac = 0.5 + this.rng(); this.walkT = 0; this.talkCool = 0; this.exitCool = this.time.now + 600; this.fired = {};
      playMusic(R.music);
      if (DEBUG) this.debugOverlay();
      this.events.once("shutdown", () => { if (this.textures.exists("ground_" + this.rid)) this.textures.remove("ground_" + this.rid); if (World.scene === this) World.scene = null; });
      this.ready = true; this.events.emit("ready", this); if (World.onReady) World.onReady(this);
      if (typeof H.enter === "function") this.runHook("enter", this.rid, this.entryName);
    }
    applyGrid(g) { if (!g) return; const idx = {}; this.terr.names.forEach((n, i) => (idx[World.TERRAIN[n].ch] = i)); for (let y = 0; y < Math.min(this.chh, g.length); y++) for (let x = 0; x < Math.min(this.cw, g[y].length); x++) if (idx[g[y][x]] !== undefined) this.terr.data[y * this.cw + x] = idx[g[y][x]]; }

    // ---------- generated textures (once per game) ----------
    makeTextures() {
      const mk = (key, w, h, draw) => { if (this.textures.exists(key)) return; const c = makeCanvas(w, h), ctx = c.getContext("2d"); draw(ctx, w, h); this.textures.addCanvas(key, c); };
      mk("shadow", 64, 24, (ctx, w, h) => { const g = ctx.createRadialGradient(w / 2, h / 2, 1, w / 2, h / 2, w / 2); g.addColorStop(0, "rgba(10,4,14,0.55)"); g.addColorStop(1, "rgba(10,4,14,0)"); ctx.save(); ctx.translate(0, h / 2); ctx.scale(1, h / w); ctx.translate(0, -w / 2); ctx.fillStyle = g; ctx.fillRect(0, 0, w, w); ctx.restore(); });
      mk("dust", 4, 3, ctx => { ctx.fillStyle = "#fff"; ctx.fillRect(0, 1, 4, 1); ctx.fillRect(1, 0, 2, 3); });
      mk("puff", 8, 8, ctx => { ctx.fillStyle = "#c8a070"; ctx.fillRect(2, 0, 4, 8); ctx.fillRect(0, 2, 8, 4); ctx.fillStyle = "#dcb888"; ctx.fillRect(3, 1, 2, 6); });
      mk("glint", 6, 1, ctx => { ctx.fillStyle = "#bfffe8"; ctx.fillRect(1, 0, 4, 1); ctx.fillStyle = "#ffffff"; ctx.fillRect(2, 0, 2, 1); });
      mk("smoke", 10, 10, ctx => { ctx.fillStyle = "rgba(70,60,66,0.9)"; ctx.beginPath(); ctx.arc(5, 5, 4.5, 0, 7); ctx.fill(); });
      mk("spark", 7, 7, ctx => { ctx.fillStyle = "#fff0a0"; ctx.fillRect(3, 0, 1, 7); ctx.fillRect(0, 3, 7, 1); ctx.fillStyle = "#fff"; ctx.fillRect(2, 2, 3, 3); });
      mk("pglow", 96, 96, (ctx, w, h) => { const g = ctx.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2); g.addColorStop(0, "rgba(170,80,255,0.8)"); g.addColorStop(0.4, "rgba(130,50,230,0.3)"); g.addColorStop(1, "rgba(110,30,210,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); });
      mk("ember", 2, 2, ctx => { ctx.fillStyle = "#ffb050"; ctx.fillRect(0, 0, 2, 2); });
      mk("glow", 96, 96, (ctx, w, h) => { const g = ctx.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2); g.addColorStop(0, "rgba(255,170,70,0.9)"); g.addColorStop(0.35, "rgba(255,120,30,0.35)"); g.addColorStop(1, "rgba(255,100,20,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); });
      mk("glowBlue", 96, 96, (ctx, w, h) => { const g = ctx.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2); g.addColorStop(0, "rgba(140,210,255,0.9)"); g.addColorStop(0.35, "rgba(80,150,255,0.35)"); g.addColorStop(1, "rgba(60,120,255,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); });
      mk("glowGold", 96, 96, (ctx, w, h) => { const g = ctx.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2); g.addColorStop(0, "rgba(255,230,120,0.95)"); g.addColorStop(0.35, "rgba(255,200,60,0.4)"); g.addColorStop(1, "rgba(255,180,40,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); });
      mk("exitArrow", 22, 16, ctx => { ctx.strokeStyle = "rgba(255,236,160,1)"; ctx.lineWidth = 4; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.beginPath(); ctx.moveTo(3, 13); ctx.lineTo(11, 4); ctx.lineTo(19, 13); ctx.stroke(); });
      mk("light", 256, 256, (ctx, w, h) => { const g = ctx.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.55, "rgba(255,255,255,0.7)"); g.addColorStop(1, "rgba(255,255,255,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); });
      mk("vignette", 960, 540, (ctx, w, h) => { const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.38, w / 2, h / 2, w * 0.62); g.addColorStop(0, "rgba(14,6,20,0)"); g.addColorStop(1, "rgba(14,6,20,0.72)"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); });
      const bird = up => ctx => { ctx.fillStyle = "#1c1218"; ctx.fillRect(4, 3, 2, 3); if (up) { ctx.fillRect(1, 1, 3, 1); ctx.fillRect(0, 0, 1, 1); ctx.fillRect(6, 1, 3, 1); ctx.fillRect(9, 0, 1, 1); } else { ctx.fillRect(1, 3, 3, 1); ctx.fillRect(0, 4, 1, 1); ctx.fillRect(6, 3, 3, 1); ctx.fillRect(9, 4, 1, 1); } };
      mk("bird0", 10, 7, bird(true)); mk("bird1", 10, 7, bird(false));
      const fly = (c1, c2, open) => ctx => { ctx.fillStyle = c1; ctx.fillRect(open ? 0 : 1, 0, open ? 2 : 1, 2); ctx.fillRect(open ? 4 : 2, 0, open ? 2 : 1, 2); ctx.fillStyle = c2; ctx.fillRect(2, 1, 2, 2); };
      mk("bfly0", 6, 3, fly("#f0a030", "#3a2010", true)); mk("bfly1", 6, 3, fly("#f0a030", "#3a2010", false)); mk("bfly2", 6, 3, fly("#58c8c0", "#1a2a30", true)); mk("bfly3", 6, 3, fly("#58c8c0", "#1a2a30", false));
      mk("drop", 2, 4, ctx => { ctx.fillStyle = "#9fd8ff"; ctx.fillRect(0, 0, 2, 4); });
      mk("star", 5, 5, ctx => { ctx.fillStyle = "#fff"; ctx.fillRect(2, 0, 1, 5); ctx.fillRect(0, 2, 5, 1); });
      // treasure chests (closed / open), drawn in the same chunky pixel style
      const chest = open => ctx => {
        ctx.fillStyle = "#1a0f0c"; ctx.fillRect(1, open ? 6 : 8, 30, open ? 20 : 18);
        ctx.fillStyle = "#7a4a26"; ctx.fillRect(2, open ? 14 : 12, 28, 12); ctx.fillStyle = "#9a6232"; ctx.fillRect(2, open ? 14 : 12, 28, 3);
        ctx.fillStyle = "#c9a03c"; ctx.fillRect(2, open ? 18 : 16, 28, 2); ctx.fillRect(14, open ? 16 : 14, 4, 6);
        if (open) { ctx.fillStyle = "#3a2214"; ctx.fillRect(2, 7, 28, 8); ctx.fillStyle = "#5a3a20"; ctx.fillRect(3, 8, 26, 3); ctx.fillStyle = "#ffe88a"; ctx.fillRect(8, 14, 4, 2); ctx.fillRect(18, 13, 5, 2); ctx.fillRect(13, 12, 3, 2); }
        else { ctx.fillStyle = "#8a5430"; ctx.fillRect(2, 9, 28, 6); ctx.fillStyle = "#c9a03c"; ctx.fillRect(2, 11, 28, 2); ctx.fillRect(14, 12, 4, 5); }
        ctx.fillStyle = "#1a0f0c"; ctx.fillRect(0, 25, 32, 2);
      };
      mk("chestClosed", 32, 28, chest(false)); mk("chestOpen", 32, 28, chest(true));
    }

    // ---------- the painted ground (a procedural stand-in is drawn from the terrain grid if the painting is missing) ----------
    paintGround() {
      const R = this.R, c = makeCanvas(R.w, R.h), ctx = c.getContext("2d"), gk = "gsrc_" + this.rid;
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
      if (this.textures.exists(gk) && this.textures.get(gk).key !== "__MISSING") ctx.drawImage(this.textures.get(gk).getSourceImage(), 0, 0, R.w, R.h);
      else {
        this.groundMissing = true; const T = World.TERRAIN;
        for (let cy = 0; cy < this.chh; cy++) for (let cx = 0; cx < this.cw; cx++) { const col = T[this.terr.names[this.terr.data[cy * this.cw + cx]]].col, n = (hash(cx, cy) - 0.5) * 16; ctx.fillStyle = `rgb(${clamp(col[0] + n, 0, 255) | 0},${clamp(col[1] + n, 0, 255) | 0},${clamp(col[2] + n, 0, 255) | 0})`; ctx.fillRect(cx * CELL, cy * CELL, CELL, CELL); }
      }
      this.shadowCtx = c.getContext("2d");
      if (this.textures.exists("ground_" + this.rid)) this.textures.remove("ground_" + this.rid);
      this.groundCanvas = c; this.groundTex = this.textures.addCanvas("ground_" + this.rid, c);
      this.add.image(0, 0, "ground_" + this.rid).setOrigin(0, 0).setDepth(0);
    }
    bakeShadow(x, base, w, h, kind) {
      if (this.R.dark && this.R.dark.noShadow) return;
      const ctx = this.shadowCtx; ctx.save(); ctx.filter = "blur(2px)"; ctx.fillStyle = "rgba(14,5,18,0.4)"; ctx.strokeStyle = "rgba(14,5,18,0.34)"; ctx.beginPath();
      if (kind === "tall") { ctx.lineWidth = 8; ctx.globalAlpha = 0.6; ctx.moveTo(x, base - 2); ctx.lineTo(x + h * 0.42, base + h * 0.1); ctx.stroke(); ctx.globalAlpha = 1; ctx.beginPath(); ctx.ellipse(x + h * 0.45, base + h * 0.11, w * 0.4, w * 0.13, 0.2, 0, 7); ctx.fill(); }
      else if (kind === "box") { const hw = w * 0.42, L = Math.min(h * 0.3, 60); ctx.moveTo(x - hw, base); ctx.lineTo(x + hw, base); ctx.lineTo(x + hw + L, base + L * 0.5); ctx.lineTo(x - hw + L, base + L * 0.5); ctx.closePath(); ctx.fill(); }
      else { ctx.ellipse(x + w * 0.1, base - 1, w * 0.46, Math.max(4, w * 0.13), 0, 0, 7); ctx.fill(); }
      ctx.restore();
    }

    // ---------- collision ----------
    terrainAt(x, y) { const cx = Math.floor(x / CELL), cy = Math.floor(y / CELL); if (cx < 0 || cy < 0 || cx >= this.cw || cy >= this.chh) return "rock"; return this.terr.names[this.terr.data[cy * this.cw + cx]]; }
    blockRect(x0, y0, x1, y1, arr) { arr = arr || this.block; for (let cy = Math.max(0, Math.floor(y0 / CELL)); cy <= Math.min(this.chh - 1, Math.floor((y1 - 0.01) / CELL)); cy++) for (let cx = Math.max(0, Math.floor(x0 / CELL)); cx <= Math.min(this.cw - 1, Math.floor((x1 - 0.01) / CELL)); cx++) arr[cy * this.cw + cx] = 1; }
    blockedAt(x, y) {
      const cx = Math.floor(x / CELL), cy = Math.floor(y / CELL); if (cx < 0 || cy < 0 || cx >= this.cw || cy >= this.chh || this.block[cy * this.cw + cx] === 1) return true;
      for (const d of this.dynSolids) if (d.on && x >= d.r[0] && x < d.r[2] && y >= d.r[1] && y < d.r[3]) return true;
      return false;
    }
    free(x, y) { return !(this.blockedAt(x - 4, y) || this.blockedAt(x + 4, y) || this.blockedAt(x - 4, y - 3) || this.blockedAt(x + 4, y - 3)); }
    npcAt(x, y) { for (const n of this.npcs || []) if (n.on && n.solid !== false && Math.abs(x - n.x) < 10 && Math.abs(y - n.y) < 7) return true; return false; }
    ok(x, y) { return this.free(x, y) && !this.npcAt(x, y); }
    reach(ax, ay, bx, by, tol) {
      const S = 4, W = Math.floor(this.R.w / S), Hh = Math.floor(this.R.h / S), key = (x, y) => y * W + x, seen = new Uint8Array(W * Hh);
      const sx = Math.round(ax / S), sy = Math.round(ay / S), ex = Math.round(bx / S), ey = Math.round(by / S), q = [[sx, sy]], t = Math.ceil((tol || 4) / S); seen[key(sx, sy)] = 1;
      for (let i = 0; i < q.length; i++) {
        const [x, y] = q[i]; if (Math.abs(x - ex) <= t && Math.abs(y - ey) <= t) return true;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= Hh || seen[key(nx, ny)] || !this.free(nx * S, ny * S)) continue; seen[key(nx, ny)] = 1; q.push([nx, ny]); }
      }
      return false;
    }
    // nearest free spot around (x,y) (used for spawns)
    nearestFree(x, y) { if (this.free(x, y)) return [x, y]; for (let r = 4; r < 200; r += 4) for (let a = 0; a < 6.28; a += 0.3) { const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r; if (this.free(px, py)) return [px, py]; } return [x, y]; }

    // ---------- placing sprites ----------
    cond(c) { return World.cond(c, this.flags); }
    // key, x, base y, opts: solid [hw, depth] | false, shadow, sway, fire [dx, dy, scale], flip, scale, dy, tint, show/hide (flag conditions), glow ("blue"|"gold")
    P(key, x, base, o) {
      o = Object.assign({}, o || {});
      if (!this.textures.exists(key)) { console.warn("World: missing texture", key); return null; }
      const s = this.add.image(Math.round(x), Math.round(base), key).setOrigin(0.5, 1).setDepth(base + (o.dy || 0));
      if (o.scale) s.setScale(o.scale); if (o.flip) s.setFlipX(true); if (o.tint) s.setTint(o.tint); if (o.alpha !== undefined) s.setAlpha(o.alpha);
      const w = s.displayWidth, h = s.displayHeight, d = defaults(key, w / (o.scale || 1), h / (o.scale || 1), this.man && this.man[key]);
      for (const k of ["solid", "shadow", "sway", "fire"]) if (o[k] === undefined) o[k] = d[k];
      if (o.scale && o.solid) o.solid = [o.solid[0] * o.scale, o.solid[1] * Math.max(1, o.scale)];
      const cnd = o.show !== undefined || o.hide !== undefined ? { show: o.show, hide: o.hide } : null, vis = !cnd || (this.cond(cnd.show) && !(cnd.hide !== undefined && this.cond(cnd.hide)));
      if (o.shadow && !cnd) this.bakeShadow(x, base, w, h, o.shadow);
      let solidRec = null;
      if (o.solid) {
        const r = [x - o.solid[0], base - o.solid[1], x + o.solid[0], base];
        if (cnd) { solidRec = { r, on: vis }; this.dynSolids.push(solidRec); } else this.blockRect(r[0], r[1], r[2], r[3]);
        this.blockRect(r[0] - 12, r[1] - 12, r[2] + 12, r[3] + 10, this.occ);
      } else this.blockRect(x - w * 0.3, base - 14, x + w * 0.3, base + 6, this.occ);
      if (o.sway) this.swayers.push({ s, phase: hash(x, base) * 6.28, amp: o.sway });
      const extras = [s];
      if (o.fire) extras.push(this.addFire(x + o.fire[0], base + o.fire[1], o.fire[2] || 1, o.glow));
      if (cnd) { this.conds.push({ cnd, objs: extras, solid: solidRec }); extras.forEach(e => e && e.setVisible && e.setVisible(vis)); }
      return s;
    }
    addFire(x, y, k, tint) {
      const tex = tint === "blue" ? "glowBlue" : tint === "gold" ? "glowGold" : "glow";
      const glow = this.add.image(Math.round(x), Math.round(y), tex).setDepth(8000).setBlendMode(Phaser.BlendModes.ADD).setScale(1.4 * k).setAlpha(0.5);
      this.fires.push({ x, y, glow, k, ph: Math.random() * 6.28, tint }); return glow;
    }
    buildProps() { for (const p of this.R.props || []) this.P(p[0], p[1], p[2], p[3]); }
    // keep scatter off everything that matters: entries, exits, NPCs, things, armies' lanes
    reserveAreas() {
      const R = this.R, occ = this.occ;
      for (const e of Object.values(R.entries || {})) this.blockRect(e.x - 48, e.y - 48, e.x + 48, e.y + 40, occ);
      for (const e of R.exits || []) this.blockRect(e.rect[0] - 44, e.rect[1] - 44, e.rect[0] + e.rect[2] + 44, e.rect[1] + e.rect[3] + 44, occ);
      for (const t of R.triggers || []) this.blockRect(t.rect[0] - 24, t.rect[1] - 24, t.rect[0] + t.rect[2] + 24, t.rect[1] + t.rect[3] + 24, occ);
      for (const n of R.npcs || []) this.blockRect(n.x - 40, n.y - 40, n.x + 40, n.y + 30, occ);
      for (const c of [].concat(R.chests || [], R.gather || [])) this.blockRect(c.x - 40, c.y - 40, c.x + 40, c.y + 30, occ);
      const a = R.amb || {}, lanes = (a.armies || []).map(g => g.lane).concat(a.chase ? [a.chase.lane] : []);
      for (const l of lanes) for (let i = 0; i < l.length - 1; i++) { const n = Math.ceil(Math.hypot(l[i + 1][0] - l[i][0], l[i + 1][1] - l[i][1]) / 12); for (let k = 0; k <= n; k++) { const x = l[i][0] + (l[i + 1][0] - l[i][0]) * k / n, y = l[i][1] + (l[i + 1][1] - l[i][1]) * k / n; this.blockRect(x - 40, y - 40, x + 40, y + 30, occ); } }
      if (a.standoff) this.blockRect(a.standoff.x - 130, a.standoff.y - 90, a.standoff.x + 130, a.standoff.y + 90, occ);
      (a.wrecks || []).forEach(w => this.blockRect(w[0] - 140, w[1] - 100, w[0] + 140, w[1] + 100, occ));
      for (const z of R.reserve || []) this.blockRect(z[0], z[1], z[0] + z[2], z[1] + z[3], occ);
    }
    openAround(x, y, r) { for (let a = 0; a < 6.28; a += 0.7) for (const k of [0.5, 1]) if (this.blockedAt(x + Math.cos(a) * r * k, y + Math.sin(a) * r * k)) return false; return !this.blockedAt(x, y); }
    buildScatter() {
      const R = this.R, T = this.terr;
      for (const sc of R.scatter || []) {
        const rnd = mulberry(strSeed(this.rid) + (sc.seed || 0) * 7919), area = sc.area || [60, 60, R.w - 60, R.h - 60], on = sc.on === "any" ? null : (sc.on || ["sand", "red", "grass", "salt", "glass", "ash", "bone"]);
        const weights = sc.keys.map(k => (Array.isArray(k) ? k[1] : 1)), wsum = weights.reduce((a, b) => a + b, 0); let placed = 0;
        for (let i = 0; i < (sc.tries || sc.n * 30) && placed < sc.n; i++) {
          const x = area[0] + rnd() * (area[2] - area[0]), y = area[1] + rnd() * (area[3] - area[1]); let t = rnd() * wsum, ki = 0; while (ki < weights.length - 1 && t > weights[ki]) { t -= weights[ki]; ki++; }
          const kk = sc.keys[ki], key = Array.isArray(kk) ? kk[0] : kk, tn = this.terrainAt(x, y);
          if (on && !on.includes(tn)) continue;
          const cx = Math.floor(x / CELL), cy = Math.floor(y / CELL); if (this.occ[cy * this.cw + cx]) continue;
          const tex = this.textures.exists(key) ? this.textures.get(key).getSourceImage() : null; if (!tex) continue;
          const o = Object.assign({}, sc.opts || {}), d = defaults(key, tex.width, tex.height, this.man && this.man[key]), solid = o.solid !== undefined ? o.solid : d.solid;
          if (solid) { if (!this.openAround(x, y, 24 + solid[0] * 0.6)) continue; } else if (this.blockedAt(x, y)) continue;
          if (hash(x, y) < 0.0) continue;
          if (sc.flipRandom !== false && rnd() < 0.5) o.flip = true;
          const sz = sc.scaleRange ? sc.scaleRange[0] + rnd() * (sc.scaleRange[1] - sc.scaleRange[0]) : 0; if (sz) o.scale = sz;
          if (this.P(key, x, y, o)) placed++;
        }
        if (placed < sc.n * 0.6) console.warn("World: scatter placed only", placed, "of", sc.n, "in", this.rid, sc.keys);
      }
    }

    // ---------- exits, triggers, chests, gathering spots, NPCs ----------
    buildThings() {
      const R = this.R; this.exits = (R.exits || []).map(e => Object.assign({}, e)); this.triggers = (R.triggers || []).map(t => Object.assign({}, t)); this.chests = []; this.gathers = [];
      for (const c of R.chests || []) {
        const opened = !!this.flags["chest." + c.id], s = this.add.image(c.x, c.y, opened ? "chestOpen" : "chestClosed").setOrigin(0.5, 1).setDepth(c.y), sh = this.add.image(c.x, c.y - 1, "shadow").setDepth(c.y - 1).setScale(0.7);
        this.blockRect(c.x - 14, c.y - 6, c.x + 14, c.y); const rec = Object.assign({ s, sh, on: true }, c); this.chests.push(rec);
        if (c.show !== undefined || c.hide !== undefined) this.conds.push({ cnd: { show: c.show, hide: c.hide }, objs: [s, sh], rec });
      }
      // exits glow and point the way out, so entrances are easy to spot (Danny 2026-10-29)
      for (const e of this.exits) {
        const [x, y, w, h] = e.rect, cx = x + w / 2, cy = y + h / 2, out = e.push ? [-e.push[0], -e.push[1]] : null;
        e.glow = this.add.image(cx, cy, "glowGold").setBlendMode(Phaser.BlendModes.ADD).setDepth(2).setDisplaySize(w + 90, h + 90);
        e.core = this.add.image(cx, cy, "glowGold").setBlendMode(Phaser.BlendModes.ADD).setDepth(2).setDisplaySize(w + 20, h + 20);
        e.arrow = out ? this.add.image(cx, cy, "exitArrow").setBlendMode(Phaser.BlendModes.ADD).setDepth(9500).setRotation(Math.atan2(out[0], -out[1])).setScale(1.5) : null;
        e.out = out; e.ph = Math.random() * 6; e.on = true;
        this.conds.push({ cnd: { show: e.show, hide: e.hide }, objs: [e.glow, e.core, e.arrow], rec: e });
      }
      for (const g of R.gather || []) {
        const col = g.color || "gold", tex = col === "blue" ? "glowBlue" : "glowGold", glow = this.add.image(g.x, g.y - 4, tex).setBlendMode(Phaser.BlendModes.ADD).setDepth(g.y).setScale(0.5).setAlpha(0.7), star = this.add.image(g.x, g.y - 10, "star").setScale(2).setDepth(g.y + 1);
        const rec = Object.assign({ glow, star, on: true, ph: Math.random() * 6 }, g); this.gathers.push(rec);
        this.conds.push({ cnd: { show: g.show, hide: g.hide }, objs: [glow, star], rec });
      }
    }
    makePeople() {
      const R = this.R; this.npcs = [];
      for (const d of R.npcs || []) {
        const n = Object.assign({ on: true, solid: true }, d);
        if (d.art && this.textures.exists(d.art)) {
          const sc = d.scale || (this.man && this.man[d.art] && this.man[d.art].kind === "npc" || LEGACY_NPC.includes(d.art) ? NPC_SCALE : 1);
          n.sh = this.add.image(d.x, d.y - 1, "shadow").setDepth(d.y - 1).setScale(1.2);
          n.s = this.add.image(d.x, d.y, d.art).setOrigin(0.5, 1).setDepth(d.y).setScale(sc); if (d.flip) n.s.setFlipX(true);
          this.tweens.add({ targets: n.s, scaleY: { from: sc, to: sc * 0.97 }, duration: 900 + hash(d.x, d.y) * 500, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
        } else n.solid = false;
        if (d.path) { n.P = mkPath(d.path, d.loop); n.ps = 0; n.pd = 1; }
        this.npcs.push(n);
        if (d.show !== undefined || d.hide !== undefined) this.conds.push({ cnd: { show: d.show, hide: d.hide }, objs: [n.s, n.sh], rec: n });
      }
      const en = (R.entries || {})[this.entryName] || (R.entries || {}).start || (R.entries || {}).default || { x: R.w / 2, y: R.h / 2, face: "down" };
      const [sx, sy] = this.nearestFree(en.x, en.y); this.face = en.face === "up" ? "up" : en.face === "down" ? "down" : "side"; this.flipH = en.face === "left";
      this.heroShadow = this.add.image(sx, sy - 1, "shadow").setDepth(sy - 1);
      this.hero = this.add.image(sx, sy, "hkDownIdle").setOrigin(0.5, 1).setDepth(sy);
      this.heroGlow = this.add.image(sx, sy - 28, "pglow").setBlendMode(Phaser.BlendModes.ADD).setDepth(sy + 0.2).setScale(0.8, 1);
      this.heroGlowLow = this.add.image(sx, sy - 2, "pglow").setBlendMode(Phaser.BlendModes.ADD).setDepth(sy - 1.5).setScale(0.9, 0.35);
      this.pos = { x: sx, y: sy }; this.moving = false; this.makeFollowers(sx, sy);
      this.refresh();
    }
    makeFollowers(sx, sy) {
      this.trail = []; this.trailD = 0; for (let d = 130; d >= 0; d -= 4) this.trail.push({ x: sx, y: sy, d: -d });
      this.followers = this.party.map((id, i) => {
        const src = this.textures.exists("cr_" + id) ? "cr_" + id : this.textures.exists("crx_" + id) ? "crx_" + id : null; if (!src) { console.warn("World: no art for creature", id); return null; }
        const tk = "pf_" + id; if (!this.textures.exists(tk)) { const im = this.textures.get(src).getSourceImage(), sc = FOLLOW_H / im.height, w = Math.max(1, Math.round(im.width * sc)), c = makeCanvas(w, FOLLOW_H), ctx = c.getContext("2d"); ctx.imageSmoothingEnabled = false; ctx.drawImage(im, 0, 0, w, FOLLOW_H); this.textures.addCanvas(tk, c); }
        const sh = this.add.image(sx, sy, "shadow").setScale(0.9, 0.8).setAlpha(0.9), s = this.add.image(sx, sy + 6 + i, tk).setOrigin(0.5, 1);
        return { s, sh, gap: [40, 76, 110][i], x: sx, y: sy + 6 + i, phase: i * 1.7, flip: false, moving: false };
      }).filter(Boolean);
    }
    updateFollowers(time, dt) {
      const p = this.pos, T = this.trail, last = T[T.length - 1], dd = Math.hypot(p.x - last.x, p.y - last.y);
      if (dd > 80) { T.length = 0; for (let d = 130; d >= 0; d -= 4) T.push({ x: p.x, y: p.y, d: this.trailD - d }); }
      else if (dd >= 2) { this.trailD += dd; T.push({ x: p.x, y: p.y, d: this.trailD }); }
      while (T.length > 2 && T[1].d < this.trailD - 200) T.shift();
      const at = d => { let i = T.length - 1; while (i > 0 && T[i].d > d) i--; const a = T[i], b = T[Math.min(T.length - 1, i + 1)], span = b.d - a.d || 1, t = clamp((d - a.d) / span, 0, 1); return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }; };
      for (const f of this.followers) {
        const tg = at(this.trailD - f.gap), nx = f.x + (tg.x - f.x) * Math.min(1, dt * 10), ny = f.y + (tg.y - f.y) * Math.min(1, dt * 10), mv = Math.hypot(nx - f.x, ny - f.y) / Math.max(dt, 0.001);
        if (Math.abs(nx - f.x) > 0.25 * dt * 60) f.flip = nx > f.x; f.moving = mv > 12; f.x = nx; f.y = ny;
        const bob = f.moving ? Math.abs(Math.sin(time * 0.012 + f.phase)) * 2.5 : 0;
        f.s.setFlipX(f.flip).setPosition(Math.round(f.x), Math.round(f.y - bob)).setDepth(f.y); f.sh.setPosition(Math.round(f.x), Math.round(f.y - 1)).setDepth(f.y - 1);
      }
    }
    // re-read flag conditions: show/hide NPCs, props, chests, gather spots; chest open state
    refresh() {
      for (const c of this.conds) {
        const on = this.cond(c.cnd.show) && !(c.cnd.hide !== undefined && this.cond(c.cnd.hide));
        if (c.rec) { c.rec.on = on; if (c.army) c.rec.off = !on; } if (c.solid) c.solid.on = on;
        for (const o of c.objs) if (o && o.setVisible) o.setVisible(on);
      }
      for (const c of this.chests) { const op = !!this.flags["chest." + c.id]; if (c.s && c.s.texture.key !== (op ? "chestOpen" : "chestClosed")) c.s.setTexture(op ? "chestOpen" : "chestClosed"); }
      for (const g of this.gathers) { const got = !!this.flags["gather." + g.id]; if (got) { g.glow.setVisible(false); g.star.setVisible(false); g.done = true; } }
    }

    // ---------- ambience ----------
    makeAmbience() {
      const R = this.R, a = this.amb = Object.assign({ motes: 46, tint: [0x3a1c30, 0.16], warm: [0xffa860, 0.05], vignette: 1, dust: 0xe8c890, water: true }, R.amb || {});
      this.motes = []; for (let i = 0; i < a.motes; i++) this.motes.push({ s: this.add.image(0, 0, "dust").setTint(a.dust).setDepth(9000).setAlpha(0.08 + Math.random() * 0.2), vx: 18 + Math.random() * 30, ph: Math.random() * 6.28, x: Math.random() * 1000, y: Math.random() * 600 });
      if (a.tint) this.add.rectangle(0, 0, 960, 540, a.tint[0], a.tint[1]).setOrigin(0, 0).setScrollFactor(0).setDepth(9500).setBlendMode(Phaser.BlendModes.MULTIPLY);
      if (a.warm) this.add.rectangle(0, 0, 960, 540, a.warm[0], a.warm[1]).setOrigin(0, 0).setScrollFactor(0).setDepth(9501).setBlendMode(Phaser.BlendModes.ADD);
      if (a.vignette) this.add.image(0, 0, "vignette").setOrigin(0, 0).setScrollFactor(0).setDepth(9600).setAlpha(Math.min(1, a.vignette));
      this.birds = []; for (let i = 0; i < (a.birds || 0); i++) { const s = this.add.image(0, 0, "bird0").setDepth(8500).setScale(2), sh = this.add.image(0, 0, "shadow").setDepth(8499).setScale(0.35, 0.3).setAlpha(0.5); this.birds.push({ s, sh, x: hash(i, 71) * R.w, y: 150 + hash(i, 72) * (R.h - 300), vx: (hash(i, 73) < 0.5 ? -1 : 1) * (36 + hash(i, 74) * 30), vy: (hash(i, 75) - 0.5) * 16, ph: hash(i, 76) * 6 }); }
      this.flies = []; (a.butterflies || []).forEach(([x, y], i) => this.flies.push({ s: this.add.image(x, y, i % 2 ? "bfly0" : "bfly2").setScale(1.5), hx: x, hy: y - 20, ph: i * 1.7, alt: i % 2 }));
      // water glints and ripples over water cells in view
      if (a.water) {
        this.time.addEvent({ delay: 170, loop: true, callback: () => {
          const v = this.cameras.main.worldView;
          for (let k = 0; k < 3; k++) { const x = v.x + Math.random() * v.width, y = v.y + Math.random() * v.height, t = this.terrainAt(x, y); if (t !== "water" && t !== "shallow") continue; const g = this.add.image(Math.round(x), Math.round(y), "glint").setDepth(2).setAlpha(0).setScale(1.5); this.tweens.add({ targets: g, alpha: 0.9, duration: 260, yoyo: true, onComplete: () => g.destroy() }); }
        } });
        this.time.addEvent({ delay: 1300, loop: true, callback: () => {
          const v = this.cameras.main.worldView, x = v.x + Math.random() * v.width, y = v.y + Math.random() * v.height; if (this.terrainAt(x, y) !== "water" || this.terrainAt(x + 12, y) !== "water") return;
          const e = this.add.ellipse(x, y, 10, 4).setStrokeStyle(1, 0xbfffe8, 0.7).setDepth(2); this.tweens.add({ targets: e, scaleX: 4, scaleY: 4, alpha: 0, duration: 1800, onComplete: () => e.destroy() });
        } });
      }
      // sparkles on glass sand / salt / bone floors etc: a.sparkle = { terrain: ["glass"], color: 0xbfffee, rate: 6 }
      if (a.sparkle) this.time.addEvent({ delay: 1000 / (a.sparkle.rate || 6), loop: true, callback: () => {
        const v = this.cameras.main.worldView;
        for (let k = 0; k < 4; k++) { const x = v.x + Math.random() * v.width, y = v.y + Math.random() * v.height; if (!(a.sparkle.terrain || ["glass"]).includes(this.terrainAt(x, y))) continue; const e = this.add.image(Math.round(x), Math.round(y), "star").setDepth(y).setAlpha(0).setTint(a.sparkle.color || 0xbfffee); this.tweens.add({ targets: e, alpha: 1, scale: 1.8, duration: 380, yoyo: true, onComplete: () => e.destroy() }); break; }
      } });
      if (a.drips) this.time.addEvent({ delay: 650, loop: true, callback: () => {
        const v = this.cameras.main.worldView; for (const [x, y] of a.drips) { if (x < v.x - 30 || x > v.right + 30 || y < v.y - 30 || y > v.bottom + 130 || Math.random() > 0.35) continue; const d = this.add.image(x, y - 70, "drop").setDepth(y + 1); this.tweens.add({ targets: d, y, duration: 420, ease: "Quad.easeIn", onComplete: () => { d.destroy(); const e = this.add.ellipse(x, y, 6, 3).setStrokeStyle(1, 0xbfe8ff, 0.8).setDepth(y); this.tweens.add({ targets: e, scaleX: 3, scaleY: 3, alpha: 0, duration: 800, onComplete: () => e.destroy() }); } }); }
      } });
      if (a.smoke) this.time.addEvent({ delay: 260, loop: true, callback: () => this.spawnSmoke(a.smoke) });
      this.time.addEvent({ delay: 140, loop: true, callback: () => this.spawnEmbers() });
    }
    spawnEmbers() {
      const v = this.cameras.main.worldView;
      for (const f of this.fires) {
        if (f.x < v.x - 40 || f.x > v.right + 40 || f.y < v.y - 40 || f.y > v.bottom + 40 || Math.random() > 0.55) continue;
        const e = this.add.image(Math.round(f.x + (Math.random() - 0.5) * 8), Math.round(f.y), "ember").setDepth(8001).setScale(1 + Math.random()); if (f.tint === "blue") e.setTint(0x9fd8ff); else if (f.tint === "gold") e.setTint(0xffe27a);
        this.tweens.add({ targets: e, y: e.y - 26 - Math.random() * 26, x: e.x + (Math.random() - 0.3) * 20, alpha: 0, duration: 900 + Math.random() * 700, onComplete: () => e.destroy() });
      }
    }
    spawnSmoke(list) {
      const v = this.cameras.main.worldView;
      for (const [x, y, col] of list) {
        if (x < v.x - 100 || x > v.right + 100 || y < v.y - 250 || y > v.bottom + 100) continue;
        const e = this.add.image(Math.round(x + (Math.random() - 0.5) * 14), Math.round(y - 40), "smoke").setDepth(8600).setAlpha(0.5).setScale(0.7); if (col) e.setTint(col);
        this.tweens.add({ targets: e, y: e.y - 130 - Math.random() * 50, x: e.x + 30 + Math.random() * 30, scale: 2.8, alpha: 0, duration: 3200 + Math.random() * 1500, onComplete: () => e.destroy() });
      }
    }
    // dungeon lighting: a dark layer with soft holes around the hero and every fire
    makeDark() {
      const d = this.R.dark; if (!d) return; this.dark = Object.assign({ ambient: 0.86, radius: 170, color: 0x04020a }, d === true ? {} : d);
      this.darkRT = this.add.renderTexture(0, 0, 960, 540).setOrigin(0, 0).setScrollFactor(0).setDepth(9700);
      this.lightImg = this.make.image({ key: "light", add: false });
    }
    updateDark(time) {
      const d = this.dark, rt = this.darkRT, cam = this.cameras.main, v = cam.worldView; rt.fill(d.color, d.ambient);
      const stamp = (x, y, r, a) => { this.lightImg.setScale(r / 128).setAlpha(a); rt.erase(this.lightImg, x - v.x - 0, y - v.y); };
      const fl = 1 + Math.sin(time * 0.011) * 0.03; this.lightImg.setOrigin(0.5, 0.5);
      stamp(this.pos.x, this.pos.y - 20, d.radius * fl, 1);
      for (const f of this.fires) if (f.glow.visible && f.x > v.x - 160 && f.x < v.right + 160 && f.y > v.y - 160 && f.y < v.bottom + 160) stamp(f.x, f.y, (d.fireRadius || 120) * f.k * (1 + Math.sin(time * 0.017 + f.ph) * 0.06), 0.95);
      for (const e of this.exits || []) if (e.on && e.glow) stamp(e.rect[0] + e.rect[2] / 2, e.rect[1] + e.rect[3] / 2, Math.max(e.rect[2], e.rect[3]) * 0.6 + 30, 0.7);
      for (const l of this.R.lights || []) if (l[0] > v.x - 200 && l[0] < v.right + 200 && l[1] > v.y - 200 && l[1] < v.bottom + 200) stamp(l[0], l[1], l[2] || 100, l[3] || 0.8);
    }

    // ---------- armies: patrols (that hunt you), a chase, a stand-off, wrecks ----------
    isHidden(name) { return !!name && Date.now() < ((World.hidden && World.hidden[name]) || 0); }
    hideFor(name, ms) { World.hidden = World.hidden || {}; World.hidden[name] = Date.now() + ms; }
    mkUnit(g, tex, ox, oy, o) {
      const s = this.add.image(-99, -99, tex).setOrigin(0.5, 1), sh = this.add.image(-99, -99, "shadow").setScale(0.5, 0.45).setAlpha(0.85);
      const u = Object.assign({ s, sh, x: 0, y: 0, ox, oy, tex, frames: [tex], right: true, phase: Math.random() * 6, dead: false, placed: false, kind: "legion", still: false, flip: false }, o || {}); g.units.push(u); return u;
    }
    addGroup(path, mode, speed, s0, closed, extra) {
      const g = Object.assign({ P: mkPath(path, closed), mode, speed, s: s0 || 0, s0: s0 || 0, dir: 1, hv: [1, 0], units: [], hidden: false, done: false, dust: 0, lx: 0, ly: 0, px: null, py: null, chasing: false }, extra || {}); this.groups.push(g); return g;
    }
    legionRow(g, rows, cols, banner, cent) {
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const spear = r === 1 && c % 2 === 0; this.mkUnit(g, spear ? "lgSpear" : "lgA", -r * 21, (c - (cols - 1) / 2) * 19, { frames: spear ? ["lgSpear"] : ["lgA", "lgB"], still: spear, phase: (r + c) * 0.5 }); }
      if (banner) this.mkUnit(g, "lgBanner", -rows * 21 - 4, 0, { frames: ["lgBanner"], still: true }); if (cent) this.mkUnit(g, "lgCent", 18, 0, { frames: ["lgCent"], still: true });
    }
    buildArmies() {
      const a = this.amb; this.groups = []; this.beasts = []; this.stand = null; this.chase = null; this.wrecks = a.wrecks || [];
      (a.armies || []).forEach((d, i) => { const g = this.addGroup(d.lane, d.mode || "pingpong", d.speed || 34, d.s0 === undefined ? 60 : d.s0, d.mode === "loop", { name: d.id || "army" + i, cfg: d, table: d.table }); this.legionRow(g, d.rows || 2, d.cols || 4, d.banner !== false, d.cent !== false); if (d.show !== undefined || d.hide !== undefined) this.conds.push({ cnd: { show: d.show, hide: d.hide }, objs: [], rec: g, army: true }); });
      if (a.chase) {
        const c = a.chase, ch = this.chase = { reb: this.addGroup(c.lane, "once", c.rebelSpeed || 66, 130), pur: this.addGroup(c.lane, "once", c.pursuerSpeed || 86, -80), wait: 0, fell: false };
        [[0, -26], [18, -12], [8, 12], [-14, 20], [-30, -4], [-40, 14]].forEach(([ox, oy], i) => this.mkUnit(ch.reb, i === 3 ? "rbArcher" : "rbA", ox, oy, { frames: i === 3 ? ["rbArcher"] : ["rbA", "rbB"], right: false, kind: "rebel", still: i === 3, phase: i }));
        [[0, 0], [-20, -18], [-20, 18], [-42, 0]].forEach(([ox, oy], i) => this.mkUnit(ch.pur, "cavA", ox, oy, { frames: ["cavA", "cavB"], phase: i * 0.7, fps: 8 }));
        ch.reb.name = ch.pur.name = "chase"; ch.reb.table = ch.pur.table = c.table;
      }
      if (a.standoff) this.buildStandoff(a.standoff);
      if (this.wrecks.length) {
        this.wrecks.forEach(([x, y]) => { this.P("wagon", x, y, { solid: [30, 12], shadow: "box" }); this.P("debris", x + 56, y + 14, { shadow: false }); this.P("bones", x - 52, y + 10, { shadow: false }); });
        if (a.beasts !== false) { for (let i = 0; i < 4; i++) { const sh = this.add.image(-99, -99, "shadow").setScale(0.5, 0.4), s = this.add.image(-99, -99, "jackA").setOrigin(0.5, 1); this.beasts.push({ s, sh, a: i * 1.57, r: 70 + i * 12, w: (i % 2 ? -1 : 1) * (0.5 + i * 0.07), x: 0, y: 0 }); } this.hyena = this.add.image(this.wrecks[0][0] + 44, this.wrecks[0][1] + 24, "hyena").setOrigin(0.5, 1).setDepth(this.wrecks[0][1] + 24); }
        if (!a.smoke) this.time.addEvent({ delay: 260, loop: true, callback: () => this.spawnSmoke(this.wrecks) });
      }
    }
    buildStandoff(so) {
      const S = this.stand = { L: [], R: [], t: { shout: 2500, fight: 5000 }, g: { units: [] }, x: so.x, y: so.y, table: so.table }, X = so.x, Y = so.y;
      const mk = (side, tex, hx, hy, o) => { const u = this.mkUnit(S.g, tex, 0, 0, Object.assign({ hx, hy, jx: 0, jy: 0, tx: 0, ty: 0, nj: Math.random() * 2000, lunge: 0, side, frames: [tex], still: true, kind: side === "L" ? "legion" : "rebel", right: side === "L", front: false, c: -1, placed: false }, o)); (side === "L" ? S.L : S.R).push(u); return u; };
      for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++) { const a = mk("L", r ? "lgSpear" : "lgA", X - 46 - r * 21, Y + (c - 2) * 19, { front: r === 0, c }); if (!r) a.frames = ["lgA"]; mk("R", r ? (c === 1 || c === 3 ? "rbArcher" : "rbSword") : "rbA", X + 46 + r * 21, Y + (c - 2) * 19, { front: r === 0, c }); }
      mk("L", "lgBanner", X - 108, Y, {}); mk("L", "lgCent", X - 66, Y - 48, {}); mk("R", "rbBanner", X + 108, Y, {});
    }
    shout(x, y, txt, col) { const t = this.add.text(Math.round(x), Math.round(y - 44), txt, { fontFamily: "Marcellus, Georgia, serif", fontSize: "11px", color: col || "#fbe9c0", backgroundColor: "#1a0f1acc", padding: { x: 4, y: 2 } }).setOrigin(0.5, 1).setDepth(9100); this.tweens.add({ targets: t, y: t.y - 8, alpha: 0, delay: 1100, duration: 600, onComplete: () => t.destroy() }); }
    spark(x, y) { const e = this.add.image(Math.round(x), Math.round(y), "spark").setDepth(9000).setBlendMode(Phaser.BlendModes.ADD).setScale(1.5); this.tweens.add({ targets: e, scale: 3, alpha: 0, duration: 260, onComplete: () => e.destroy() }); }
    dustAt(x, y, a) { const p = this.add.image(Math.round(x), Math.round(y - 1), "puff").setDepth(y + 0.5).setAlpha(a || 0.4).setScale(0.5); this.tweens.add({ targets: p, alpha: 0, scale: 1.2, y: p.y - 6, duration: 650, onComplete: () => p.destroy() }); }
    placeUnit(u, x, y, t, moving, cosh) {
      const f = u.frames, fi = u.dead || u.still || f.length < 2 ? 0 : Math.floor(t / (1000 / (u.fps || 5)) + u.phase) % f.length, tex = u.dead ? u.deadTex : f[fi];
      if (u.s.texture.key !== tex) u.s.setTexture(tex); if (cosh !== undefined && Math.abs(cosh) > 0.25 && !u.dead) u.flip = u.right ? cosh < 0 : cosh > 0; u.s.setFlipX(u.flip);
      const bob = moving && !u.dead ? (u.still ? Math.abs(Math.sin(t * 0.012 + u.phase)) * 1.4 : fi * 1.2) : 0;
      u.s.setPosition(Math.round(x), Math.round(y - bob)).setDepth(y).setVisible(true); u.sh.setPosition(Math.round(x), Math.round(y - 1)).setDepth(y - 1).setVisible(!u.dead);
    }
    killUnit(u, reviveMs) { if (u.dead) return; u.dead = true; u.deadTex = u.kind === "legion" ? "lgDead" : "rbDead"; this.dustAt(u.x, u.y, 0.6); if (reviveMs) this.time.delayedCall(reviveMs, () => { u.dead = false; this.dustAt(u.x, u.y, 0.3); }); }
    updateGroup(g, t, dt) {
      const P = g.P, cfg = g.cfg || {}, hide = g.hidden || g.off || this.isHidden(g.name) || (g.s < 0 && g.mode === "once");
      if (g.px === null) { const a0 = pathAt(P, Math.max(0, g.s)); g.px = a0.x; g.py = a0.y; }
      let hunting = false;
      if (cfg.sight && !hide && !g.done) {   // a patrol that has seen you comes for you; if you get away it walks back to its route
        const dh = Math.hypot(this.pos.x - g.px, this.pos.y - g.py);
        if (!g.chasing && dh < cfg.sight && !this.busy && this.time.now > this.safeUntil) { g.chasing = true; this.shout(g.px, g.py - 20, cfg.cry || "Halt! In the name of the empire!", "#ffb0a0"); }
        if (g.chasing && dh > (cfg.sight * 1.7)) { g.chasing = false; g.s = pathNearest(P, g.px, g.py); }
        hunting = g.chasing;
      }
      if (!g.done && !hunting) {
        const a = pathAt(P, g.s), off = Math.hypot(a.x - g.px, a.y - g.py);
        if (off > 10) { const k = Math.min(1, (g.speed * 1.2 * dt) / off); g.px += (a.x - g.px) * k; g.py += (a.y - g.py) * k; g.hv[0] += ((a.x - g.px) / off - g.hv[0]) * Math.min(1, dt * 2.5); g.hv[1] += ((a.y - g.py) / off - g.hv[1]) * Math.min(1, dt * 2.5); }
        else {
          g.s += g.speed * dt * g.dir;
          if (g.mode === "pingpong") { if (g.s > P.L - 20) { g.s = P.L - 20; g.dir = -1; } if (g.s < 55) { g.s = 55; g.dir = 1; } } else if (g.mode === "loop") g.s = (g.s + P.L) % P.L; else if (g.s >= P.L - 2) { g.s = P.L - 2; g.done = true; }
          const b = pathAt(P, g.s); g.px = b.x; g.py = b.y; g.hv[0] += (b.hx * g.dir - g.hv[0]) * Math.min(1, dt * 2.5); g.hv[1] += (b.hy * g.dir - g.hv[1]) * Math.min(1, dt * 2.5);
        }
      } else if (hunting) {
        const dx = this.pos.x - g.px, dy = this.pos.y - g.py, d = Math.hypot(dx, dy) || 1, sp = (cfg.chaseSpeed || 78) * dt; g.px += dx / d * Math.min(sp, d); g.py += dy / d * Math.min(sp, d);
        g.hv[0] += (dx / d - g.hv[0]) * Math.min(1, dt * 4); g.hv[1] += (dy / d - g.hv[1]) * Math.min(1, dt * 4);
      }
      const hl = Math.hypot(g.hv[0], g.hv[1]) || 1, cx = g.hv[0] / hl, sy = g.hv[1] / hl; g.lx = g.px; g.ly = g.py;
      for (const u of g.units) {
        if (hide) { u.s.setVisible(false); u.sh.setVisible(false); u.placed = false; continue; }
        if (!u.dead) { const tx = g.px + cx * u.ox - sy * u.oy, ty = g.py + sy * u.ox + cx * u.oy; if (!u.placed) { u.x = tx; u.y = ty; u.placed = true; } else { const k = Math.min(1, dt * 7); u.x += (tx - u.x) * k; u.y += (ty - u.y) * k; } }
        this.placeUnit(u, u.x, u.y, t, !g.done && !u.dead, cx); if (u.alpha !== undefined) { u.s.setAlpha(u.alpha); u.sh.setAlpha(u.alpha * 0.85); }
      }
      g.dust -= dt;
      if (!g.done && !hide && g.dust <= 0 && g.units.length) { g.dust = 0.3; const u = g.units[Math.floor(Math.random() * g.units.length)], v = this.cameras.main.worldView; if (u.x > v.x - 60 && u.x < v.right + 60 && u.y > v.y - 60 && u.y < v.bottom + 60) this.dustAt(u.x - cx * 8, u.y, 0.38); }
    }
    updateChase(t) {
      const c = this.chase, r = c.reb, p = c.pur; p.hidden = p.s < 0;
      if (!c.fell && p.s > 0 && Math.hypot(p.lx - r.lx, p.ly - r.ly) < 80 && r.s > 400) { c.fell = true; this.killUnit(r.units[5]); this.shout(p.lx, p.ly, "Ride them down!", "#ff9a80"); }
      if (r.done && p.done && !c.wait) { c.wait = t + 3500; r.units.concat(p.units).forEach(u => this.tweens.add({ targets: u, alpha: 0, duration: 1200, delay: 1500 })); }
      if (c.wait && t > c.wait) { c.wait = 0; c.fell = false; [r, p].forEach(g => { g.s = g.s0; g.done = false; g.px = null; g.hv = [1, 0]; g.units.forEach(u => { u.dead = false; u.placed = false; u.alpha = 1; }); }); }
    }
    updateStandoff(t, dt) {
      const S = this.stand, all = S.L.concat(S.R);
      if (this.isHidden("stand")) { all.forEach(u => { u.s.setVisible(false); u.sh.setVisible(false); }); return; }
      for (const u of all) { u.nj -= dt * 1000; if (u.nj <= 0) { u.nj = 900 + Math.random() * 1800; u.tx = (Math.random() - 0.5) * 5; u.ty = (Math.random() - 0.5) * 3; } u.jx += (u.tx - u.jx) * Math.min(1, dt * 3); u.jy += (u.ty - u.jy) * Math.min(1, dt * 3); u.x = u.hx + u.jx + u.lunge * (u.side === "L" ? 1 : -1); u.y = u.hy + u.jy; this.placeUnit(u, u.x, u.y, t, Math.abs(u.tx - u.jx) > 0.6 && !u.dead); }
      S.t.shout -= dt * 1000; S.t.fight -= dt * 1000;
      const v = this.cameras.main.worldView, near = S.x > v.x - 150 && S.x < v.right + 150 && S.y > v.y - 150 && S.y < v.bottom + 150;
      if (S.t.shout <= 0) { S.t.shout = 3200 + Math.random() * 2600; const left = Math.random() < 0.5, pool = (left ? S.L : S.R).filter(u => !u.dead), u = pool[Math.floor(Math.random() * pool.length)], lines = left ? ["Hold the line!", "Shields up!", "For the empire!", "Break them!"] : ["For the free cities!", "Hold!", "Never kneel!", "Stand firm!"]; if (u && near) this.shout(u.x, u.y - 4, lines[Math.floor(Math.random() * lines.length)], left ? "#ffb0a0" : "#a8c8ff"); }
      if (S.t.fight <= 0) {
        S.t.fight = 5500 + Math.random() * 4500; const c = Math.floor(Math.random() * 5), a = S.L.find(u => u.front && u.c === c && !u.dead), b = S.R.find(u => u.front && u.c === c && !u.dead);
        if (a && b && near) { this.tweens.add({ targets: [a, b], lunge: 17, duration: 260, yoyo: true, ease: "Quad.easeOut" }); [220, 330, 440].forEach((d, i) => this.time.delayedCall(d, () => { this.spark((a.x + b.x) / 2, a.y - 16 + (i - 1) * 3); if (i === 1) this.dustAt((a.x + b.x) / 2, a.y); })); if (Math.random() < 0.55) this.time.delayedCall(520, () => this.killUnit(Math.random() < 0.5 ? a : b, 9000)); }
      }
    }
    updateArmies(t, dt) {
      this.groups.forEach(g => this.updateGroup(g, t, dt)); if (this.chase) this.updateChase(t); if (this.stand) this.updateStandoff(t, dt);
      const bh = this.isHidden("beasts"); this.beasts.forEach(b => { b.s.setVisible(!bh); b.sh.setVisible(!bh); }); if (this.hyena) this.hyena.setVisible(!bh);
      for (const b of this.beasts) { if (bh) break; b.a += b.w * dt; const cx = this.wrecks[0][0], cy = this.wrecks[0][1] + 10, nx = cx + Math.cos(b.a) * b.r * 1.25, ny = cy + Math.sin(b.a) * b.r * 0.7, dx = nx - b.x; if (Math.abs(dx) > 0.05) b.s.setFlipX(dx < 0); b.x = nx; b.y = ny; b.s.setTexture(Math.floor(t / 130 + b.a * 3) % 2 ? "jackA" : "jackB").setPosition(Math.round(nx), Math.round(ny)).setDepth(ny); b.sh.setPosition(Math.round(nx), Math.round(ny) - 1).setDepth(ny - 1); }
      if (this.hyena) this.hyena.setScale(1, 1 + Math.sin(t * 0.003) * 0.02);
      // touching a legion soldier or the beasts starts an encounter
      const h = this.pos, hit = (x, y, r, px, py) => Math.hypot(x - px, y - py) < r; let touch = null;
      for (const g of this.groups) { if (g.hidden || g.off || this.isHidden(g.name) || g.s < 0) continue; for (const u of g.units) if (u.kind === "legion" && !u.dead && u.placed && (hit(u.x, u.y, 40, h.x, h.y) || this.followers.some(f => hit(u.x, u.y, 32, f.x, f.y)))) { touch = touch || { name: g.name, table: g.table }; } }
      if (this.stand && !this.isHidden("stand")) for (const u of this.stand.L) if (!u.dead && hit(u.x, u.y, 44, h.x, h.y)) touch = touch || { name: "stand", table: this.stand.table };
      if (!bh) for (const b of this.beasts) if (hit(b.x, b.y, 40, h.x, h.y)) touch = touch || { name: "beasts" };
      this.touch = touch;
      if (touch && !this.busy && this.time.now > this.safeUntil && this.safeDist <= 0) this.startEncounter((touch.table || this.defaultTable()), touch.name);
    }

    // ---------- encounters ----------
    defaultTable() { const e = this.R.encounter || {}; return e.table || (e.zones && e.zones[0] && e.zones[0].table) || null; }
    zoneAt(x, y) {
      const e = this.R.encounter; if (!e) return null;
      for (const z of e.zones || []) if (x >= z.rect[0] && x < z.rect[0] + z.rect[2] && y >= z.rect[1] && y < z.rect[1] + z.rect[3]) return z;
      return e.table ? { table: e.table, rate: e.rate } : null;
    }
    encounterTick(dt, moved, stepLen) {
      if (this.busy || this.noEnc || !moved) return;
      if (this.safeDist > 0) { this.safeDist -= stepLen; }
      if (this.time.now < this.safeUntil || this.safeDist > 0) return;
      const z = this.zoneAt(this.pos.x, this.pos.y); if (!z || !z.table || !z.rate) return;
      this.walkT += dt; if (this.walkT >= z.rate * this.encFrac * (1 / Math.max(0.05, window.Flow && Flow.encounterMult ? Flow.encounterMult() : 1))) this.startEncounter(z.table, "steps");
    }
    async startEncounter(table, why) {
      if (!table) return; this.busy++; this.walkT = 0; this.encFrac = 0.5 + Math.random(); this.moving = false;
      this.cameras.main.flash(180, 255, 255, 255); this.shout(this.pos.x, this.pos.y + 6, "!", "#fff"); log("encounter", table, why);
      await new Promise(r => this.time.delayedCall(260, r));
      await callHook("encounter", table, this.rid);
      if (!this.sys || !this.sys.isActive()) return; this.busy--;
      this.safeUntil = this.time.now + 5000; this.safeDist = 96; this.walkT = 0; if (why && why !== "steps") this.hideFor(why, 25000);
    }

    // ---------- input ----------
    runHook(name, ...args) { this.busy++; return callHook(name, ...args).then(r => { if (this.sys && this.sys.isActive()) { this.busy = Math.max(0, this.busy - 1); this.talkCool = this.time.now + 250; this.refresh(); } return r; }); }
    nearest(list, r) { let best = null, bd = r; for (const n of list) { if (!n.on || n.done) continue; const d = Math.hypot(this.pos.x - n.x, this.pos.y - n.y); if (d < bd) { bd = d; best = n; } } return best; }
    interact() {
      if (this.busy || this.time.now < this.talkCool || !this.ready) return;
      const n = this.nearest(this.npcs.filter(x => x.id), 64), ch = this.nearest(this.chests, 44), g = this.nearest(this.gathers, 44);
      const dn = n ? Math.hypot(this.pos.x - n.x, this.pos.y - n.y) : 1e9, dc = ch ? Math.hypot(this.pos.x - ch.x, this.pos.y - ch.y) : 1e9, dg = g ? Math.hypot(this.pos.x - g.x, this.pos.y - g.y) : 1e9;
      const tr = this.triggers.find(t => t.press && this.inRect(t.rect) && this.trigOn(t));
      if (tr) { this.fireTrigger(tr); return; }
      if (n && dn <= dc && dn <= dg) this.talkTo(n); else if (ch && dc <= dg && !this.flags["chest." + ch.id]) this.openChest(ch); else if (g) this.gatherAt(g);
    }
    async talkTo(n) { if (n.s && n.sh) { const dx = this.pos.x - n.x; if (Math.abs(dx) > 6 && !n.noTurn) n.s.setFlipX(n.art && /^npc/.test(n.art) ? dx > 0 : n.s.flipX); } await this.runHook("talk", n.id, this.rid); }
    async openChest(c) { const r = await this.runHook("chest", c.id); if (r !== false) { this.flags["chest." + c.id] = true; this.refresh(); this.spark(c.x, c.y - 14); } }
    async gatherAt(g) { const r = await this.runHook("gather", g.id); if (r !== false) { this.flags["gather." + g.id] = true; this.refresh(); this.spark(g.x, g.y - 10); } }
    pointerDown(p) {
      if (this.busy || this.noPtr || this.time.now < this.talkCool || !this.ready) return;
      const w = this.cameras.main.getWorldPoint(p.x, p.y);
      for (const n of this.npcs) if (n.id && n.on && n.s && Math.abs(w.x - n.x) < 20 && w.y > n.y - 70 && w.y < n.y + 8 && Math.hypot(this.pos.x - n.x, this.pos.y - n.y) < 80) { this.talkTo(n); return; }
    }
    inRect(r) { return this.pos.x >= r[0] && this.pos.x < r[0] + r[2] && this.pos.y >= r[1] && this.pos.y < r[1] + r[3]; }
    trigOn(t) { return !(t.once !== false && this.flags["trig." + t.id]) && this.cond(t.when) && this.cond(t.show) && !(t.hide !== undefined && this.cond(t.hide)); }
    async fireTrigger(t) { if (t.once !== false) this.flags["trig." + t.id] = true; await this.runHook("trigger", t.id, this.rid); }
    async takeExit(e) {
      this.busy++; this.moving = false; log("exit", e.to, e.entry);
      const party = this.party.slice(), flags = this.flags, r = await callHook("exit", e.to, e.entry, { scene: this, party, flags, from: this.rid });
      if (!this.sys || !this.sys.isActive()) return;
      if (r === false) { this.busy--; this.exitCool = this.time.now + 1500; const [x, y] = this.nearestFree(this.pos.x + Math.sign(e.push && e.push[0] || 0) * 40, this.pos.y + Math.sign(e.push && e.push[1] || 0) * 40); this.pos.x = x; this.pos.y = y; return; }
      if (r === "handled") return;
      World.enter(this, e.to, e.entry, party, flags);
    }
    // slide along obstacles; pointer walking also steers around things
    walk(vx, vy, step, steer) {
      const p = this.pos;
      if (steer) { const base = Math.atan2(vy, vx), order = this.steerSign > 0 ? [1, -1] : [-1, 1]; for (const ang of [0, 0.45, 0.9, 1.5708]) for (const sg of ang ? order : [1]) { const a = base + ang * sg, dx = Math.cos(a) * step, dy = Math.sin(a) * step; if (this.ok(p.x + dx, p.y + dy)) { p.x += dx; p.y += dy; if (ang) this.steerSign = sg; return true; } } }
      if (this.ok(p.x + vx * step, p.y + vy * step)) { p.x += vx * step; p.y += vy * step; return true; }
      let moved = false;
      if (vx && this.ok(p.x + vx * step, p.y)) { p.x += vx * step; moved = true; }
      if (vy && this.ok(p.x, p.y + vy * step)) { p.y += vy * step; moved = true; }
      if (moved) return true;
      const n = step * 0.9, horizontal = Math.abs(vx) >= Math.abs(vy);
      for (const off of [3, 6, 9, 12, 16]) for (const sg of [1, -1]) { const tx = horizontal ? p.x + Math.sign(vx) * step : p.x + sg * off, ty = horizontal ? p.y + sg * off : p.y + Math.sign(vy) * step; if (this.ok(tx, ty)) { if (horizontal) p.y += sg * Math.min(n, off); else p.x += sg * Math.min(n, off); return true; } }
      return false;
    }

    // ---------- scripting helpers for the story layer (all return promises) ----------
    lock(on) { this.busy += on ? 1 : -1; if (this.busy < 0) this.busy = 0; }
    moveHero(x, y, speed) { return new Promise(res => { const p = this.pos, d = Math.hypot(x - p.x, y - p.y), dur = d / (speed || SPEED) * 1000; this.scripted = true; this.face = Math.abs(y - p.y) > Math.abs(x - p.x) + 4 ? (y > p.y ? "down" : "up") : "side"; this.flipH = x < p.x; this.tweens.add({ targets: p, x, y, duration: Math.max(1, dur), onUpdate: () => (this.moving = true), onComplete: () => { this.moving = false; this.scripted = false; res(); } }); }); }
    moveNpc(id, x, y, speed) { const n = this.npcs.find(q => q.id === id); return new Promise(res => { if (!n || !n.s) return res(); const d = Math.hypot(x - n.x, y - n.y); this.tweens.add({ targets: n, x, y, duration: Math.max(1, d / (speed || 60) * 1000), onUpdate: () => { n.s.setPosition(Math.round(n.x), Math.round(n.y)).setDepth(n.y); n.sh.setPosition(Math.round(n.x), Math.round(n.y) - 1).setDepth(n.y - 1); }, onComplete: res }); }); }
    pan(x, y, ms) { return new Promise(res => { const c = this.cameras.main; c.stopFollow(); c.pan(x, y, ms || 800, "Sine.easeInOut", true, (cam, pr) => { if (pr === 1) res(); }); }); }
    follow() { this.cameras.main.startFollow(this.hero, true, 0.12, 0.12); }
    setFlag(k, v) { this.flags[k] = v === undefined ? true : v; this.refresh(); }
    // reachability report for the test page and the build log: every entry to every exit/NPC/chest/gather/trigger
    checkReach() {
      const R = this.R, out = [], pts = [];
      for (const e of R.exits || []) pts.push(["exit " + e.to + (e.entry ? "@" + e.entry : ""), e.rect[0] + e.rect[2] / 2, e.rect[1] + e.rect[3] / 2, Math.max(e.rect[2], e.rect[3]) / 2 + 6]);
      for (const n of R.npcs || []) if (n.id && n.art) pts.push(["npc " + n.id, n.x, n.y + 14, 36]);
      for (const c of R.chests || []) pts.push(["chest " + c.id, c.x, c.y + 10, 30]);
      for (const g of R.gather || []) pts.push(["gather " + g.id, g.x, g.y, 24]);
      for (const t of R.triggers || []) pts.push(["trigger " + t.id, t.rect[0] + t.rect[2] / 2, t.rect[1] + t.rect[3] / 2, Math.max(t.rect[2], t.rect[3]) / 2 + 4]);
      const entries = Object.entries(R.entries || {});
      for (const [en, e] of entries) { const [sx, sy] = this.nearestFree(e.x, e.y); if (Math.hypot(sx - e.x, sy - e.y) > 6) out.push("entry " + en + " is blocked (nearest free " + Math.round(sx) + "," + Math.round(sy) + ")"); for (const [name, x, y, tol] of pts) if (!this.reach(sx, sy, x, y, tol)) out.push("from entry " + en + " cannot reach " + name); }
      return out;
    }

    debugOverlay() {
      const c = makeCanvas(this.R.w, this.R.h), ctx = c.getContext("2d"); ctx.fillStyle = "rgba(255,0,0,0.33)";
      for (let cy = 0; cy < this.chh; cy++) for (let cx = 0; cx < this.cw; cx++) if (this.block[cy * this.cw + cx]) ctx.fillRect(cx * CELL, cy * CELL, CELL, CELL);
      for (const d of this.dynSolids) { ctx.fillStyle = "rgba(255,120,0,0.4)"; ctx.fillRect(d.r[0], d.r[1], d.r[2] - d.r[0], d.r[3] - d.r[1]); }
      const box = (r, col, label) => { ctx.strokeStyle = col; ctx.fillStyle = col.replace("1)", "0.18)"); ctx.lineWidth = 2; ctx.fillRect(r[0], r[1], r[2], r[3]); ctx.strokeRect(r[0], r[1], r[2], r[3]); ctx.fillStyle = "#fff"; ctx.font = "12px sans-serif"; ctx.fillText(label, r[0] + 3, r[1] + 13); };
      for (const e of this.R.exits || []) box(e.rect, "rgba(60,140,255,1)", "-> " + e.to + (e.entry ? "@" + e.entry : "")); for (const t of this.R.triggers || []) box(t.rect, "rgba(255,230,60,1)", "trig " + t.id);
      for (const z of (this.R.encounter && this.R.encounter.zones) || []) box(z.rect, "rgba(60,220,90,1)", "enc " + z.table + " " + z.rate + "s");
      ctx.fillStyle = "#fff"; ctx.font = "12px sans-serif";
      for (const [k, e] of Object.entries(this.R.entries || {})) { ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.fillRect(e.x - 3, e.y - 3, 6, 6); ctx.fillText("entry " + k, e.x + 6, e.y); }
      for (const n of this.R.npcs || []) { ctx.strokeStyle = "#ff0"; ctx.beginPath(); ctx.arc(n.x, n.y, 64, 0, 7); ctx.stroke(); ctx.fillStyle = "#ff0"; ctx.fillText(n.id || "", n.x - 10, n.y - 66); }
      for (const g of (this.R.chests || []).concat(this.R.gather || [])) { ctx.fillStyle = "#0ff"; ctx.fillText(g.id, g.x - 10, g.y - 30); }
      if (this.textures.exists("dbg")) this.textures.remove("dbg"); this.textures.addCanvas("dbg", c); this.add.image(0, 0, "dbg").setOrigin(0, 0).setDepth(9400);
      this.dbgText = this.add.text(8, 8, "", { fontSize: "12px", color: "#fff", backgroundColor: "#000a" }).setScrollFactor(0).setDepth(30000);
    }

    // ---------- the frame loop ----------
    update(time, delta) {
      if (!this.ready) return;
      const dt = Math.min(0.05, delta / 1000), k = this.keys, ptr = this.input.activePointer;
      let vx = (k.right.isDown || k.d.isDown ? 1 : 0) - (k.left.isDown || k.a.isDown ? 1 : 0), vy = (k.down.isDown || k.s.isDown ? 1 : 0) - (k.up.isDown || k.w.isDown ? 1 : 0), usePtr = false;
      if (this.busy || this.scripted) { vx = 0; vy = 0; }
      else if (!vx && !vy && ptr.isDown && !this.noPtr) { usePtr = true; const w = this.cameras.main.getWorldPoint(ptr.x, ptr.y), dx = w.x - this.pos.x, dy = w.y - (this.pos.y - 18), d = Math.hypot(dx, dy); if (d > 8) { vx = dx / d; vy = dy / d; } }
      const len = Math.hypot(vx, vy) || 1; vx /= len; vy /= len;
      const step = SPEED * dt; let moved = false, ox = this.pos.x, oy = this.pos.y;
      if (vx || vy) moved = this.walk(vx, vy, step, usePtr);
      if (!this.scripted) this.moving = moved;
      if (vx || vy) { if (Math.abs(vy) > Math.abs(vx) + 0.1) this.face = vy > 0 ? "down" : "up"; else { this.face = "side"; this.flipH = vx < 0; } }
      const px = Math.round(this.pos.x), py = Math.round(this.pos.y), mv = this.moving, fr = mv ? Math.floor(time / HERO_FRAME_MS) % HERO_FRAMES : "Idle", bob = 0;   // the 8-frame walk has its own bob
      this.hero.setTexture((this.face === "up" ? "hkUp" : this.face === "down" ? "hkDown" : "hkSide") + fr).setFlipX(this.face === "side" && this.flipH).setPosition(px, py - bob).setDepth(this.pos.y);
      this.heroShadow.setPosition(px, py - 1).setDepth(this.pos.y - 1);
      { const pu = 0.5 + 0.5 * Math.sin(time * 0.0026); this.heroGlow.setPosition(px, py - 30).setDepth(this.pos.y + 0.2).setAlpha(0.10 + 0.12 * pu).setScale(0.75 + 0.08 * pu, 0.95 + 0.08 * pu); this.heroGlowLow.setPosition(px, py - 2).setDepth(this.pos.y - 1.5).setAlpha(0.28 + 0.2 * pu); }
      if (mv) { this.puffTimer -= dt; if (this.puffTimer <= 0) { this.puffTimer = 0.16; const p = this.add.image(Math.round(this.pos.x - vx * 6), py - 1, "puff").setDepth(this.pos.y + 0.5).setAlpha(this.R.noPuff ? 0 : 0.5).setScale(0.6); if (this.R.puffTint) p.setTint(this.R.puffTint); this.tweens.add({ targets: p, alpha: 0, scale: 1.3, y: p.y - 5, duration: 480, onComplete: () => p.destroy() }); } }
      for (const w of this.swayers) { const a = Math.sin(time * 0.0014 + w.phase) * w.amp + Math.sin(time * 0.0031 + w.phase * 2) * w.amp * 0.4; if (w.s.setSkew) w.s.setSkew(a, 0); else w.s.rotation = a * 0.6; }
      for (const f of this.fires) f.glow.setAlpha(0.42 + 0.2 * Math.sin(time * 0.017 + f.ph) + 0.1 * Math.sin(time * 0.043 + f.ph * 3)).setScale((1.4 + 0.08 * Math.sin(time * 0.021 + f.ph)) * f.k);
      const wf = Math.floor(time / 140) % 2, R = this.R;
      for (const b of this.birds) { b.x += b.vx * dt; b.y += (b.vy + Math.sin(time * 0.001 + b.ph) * 8) * dt; if (b.x < -60) b.x = R.w + 60; if (b.x > R.w + 60) b.x = -60; if (b.y < 40) b.vy = Math.abs(b.vy); if (b.y > R.h - 40) b.vy = -Math.abs(b.vy); b.s.setPosition(Math.round(b.x), Math.round(b.y - 90)).setTexture("bird" + wf).setFlipX(b.vx < 0); b.sh.setPosition(Math.round(b.x + 20), Math.round(b.y)); }
      for (const f of this.flies) { f.s.setPosition(Math.round(f.hx + Math.sin(time * 0.0011 + f.ph) * 34 + Math.sin(time * 0.0027 + f.ph) * 10), Math.round(f.hy + Math.sin(time * 0.0017 + f.ph * 2) * 18)).setDepth(f.s.y + 40); f.s.setTexture((f.alt ? "bfly0" : "bfly2").replace(/\d/, d => (+d + (Math.floor(time / 110 + f.ph * 7) % 2)) + "")); }
      for (const e of this.exits) if (e.on && e.glow) {
        const pu = 0.5 + 0.5 * Math.sin(time * 0.003 + e.ph), [x, y, w, h] = e.rect; e.glow.setAlpha(0.55 + 0.4 * pu); e.core.setAlpha(0.35 + 0.5 * pu);
        if (time > (e.nextMote || 0) && Math.abs(x + w / 2 - this.pos.x) < 700 && Math.abs(y + h / 2 - this.pos.y) < 450) { e.nextMote = time + 220; const m = this.add.image(x + Math.random() * w, y + h * (0.3 + Math.random() * 0.7), "star").setBlendMode(Phaser.BlendModes.ADD).setDepth(9400).setScale(1.2).setAlpha(0.9); this.tweens.add({ targets: m, y: m.y - 26 - Math.random() * 16, alpha: 0, duration: 1100, onComplete: () => m.destroy() }); }
        if (e.arrow) { const k = 6 + pu * 8, cx = Math.min(Math.max(x + w / 2 - e.out[0] * k, 14), R.w - 14), cy = Math.min(Math.max(y + h / 2 - e.out[1] * k, 14), R.h - 14); e.arrow.setPosition(Math.round(cx), Math.round(cy)).setAlpha(0.55 + 0.45 * pu); }
      }
      for (const g of this.gathers) if (!g.done && g.on) { const pu = 0.5 + 0.5 * Math.sin(time * 0.004 + g.ph); g.glow.setAlpha(0.35 + 0.4 * pu).setScale(0.45 + 0.15 * pu); g.star.setAlpha(0.5 + 0.5 * pu).setY(g.y - 10 - pu * 4); }
      // wandering townspeople
      for (const n of this.npcs) if (n.P && n.on && n.s && !(this.busy && Math.hypot(this.pos.x - n.x, this.pos.y - n.y) < 90)) {
        if (Math.hypot(this.pos.x - n.x, this.pos.y - n.y) < 52) continue;
        n.ps += (n.speed || 22) * dt * n.pd; if (n.ps > n.P.L) { n.ps = n.P.L; n.pd = -1; } if (n.ps < 0) { n.ps = 0; n.pd = 1; }
        const a = pathAt(n.P, n.ps); if (Math.abs(a.hx) > 0.2) n.s.setFlipX(a.hx * n.pd > 0); n.x = a.x; n.y = a.y; n.s.setPosition(Math.round(n.x), Math.round(n.y - Math.abs(Math.sin(time * 0.01)) * 1)).setDepth(n.y); n.sh.setPosition(Math.round(n.x), Math.round(n.y) - 1).setDepth(n.y - 1);
      }
      this.updateFollowers(time, dt); this.updateArmies(time, dt);
      const v = this.cameras.main.worldView;
      for (const m of this.motes) { m.x += m.vx * dt; m.y += Math.sin(time * 0.001 + m.ph) * 6 * dt; m.s.setPosition(Math.round(v.x + ((m.x - v.x) % 1000 + 1000) % 1000 - 20), Math.round(v.y + ((m.y - v.y) % 600 + 600) % 600 - 20)); }
      if (this.dark) this.updateDark(time);
      this.condT -= dt; if (this.condT <= 0) { this.condT = 0.3; this.refresh(); }
      if (!this.busy && !this.scripted) {
        this.encounterTick(dt, moved, Math.hypot(this.pos.x - ox, this.pos.y - oy));
        if (this.time.now > this.exitCool) for (const e of this.exits) { if (this.inRect(e.rect) && this.cond(e.show) && !(e.hide !== undefined && this.cond(e.hide))) { if (e.need !== undefined && !this.cond(e.need)) { if (!e.warned) { e.warned = true; this.exitCool = this.time.now + 1200; if (e.blocked) this.runHook("trigger", e.blocked, this.rid); const [x, y] = this.nearestFree(this.pos.x + Math.sign(e.push && e.push[0] || 0) * 36, this.pos.y + Math.sign(e.push && e.push[1] || 0) * 36); this.pos.x = x; this.pos.y = y; } } else { e.warned = false; this.takeExit(e); } break; } else e.warned = false; }
        if (!this.busy) for (const t of this.triggers) if (!t.press && this.inRect(t.rect) && this.trigOn(t)) { this.fireTrigger(t); break; }
      }
      // prompts
      const near = this.nearest(this.npcs.filter(n => n.id && n.name !== undefined), 64), ch = this.nearest(this.chests, 44), gs = this.nearest(this.gathers, 44);
      const msg = this.busy ? "" : near ? (near.hint || "E / Space: talk to " + near.name) : ch && !this.flags["chest." + ch.id] ? "E / Space: open the chest" : gs ? "E / Space: " + (gs.label || "gather") : "";
      this.hint.setText(msg).setVisible(msg !== "");
      if (this.dbgText) { const w = this.cameras.main.getWorldPoint(ptr.x, ptr.y); this.dbgText.setText(`${this.rid}  hero ${px},${py}  mouse ${Math.round(w.x)},${Math.round(w.y)}  ${this.terrainAt(this.pos.x, this.pos.y)}  safe ${Math.max(0, Math.round(this.safeDist))}px  walk ${this.walkT.toFixed(1)}s/${(((this.zoneAt(px, py) || {}).rate || 0) * this.encFrac).toFixed(0)}s`); }
    }
  }

  // start (or restart) the Region scene from any scene
  World.enter = function (fromScene, region, entry, party, flags) {
    const sm = fromScene.scene, args = { region, entry, party: party || [], flags: flags || World.flags || {} };
    if (fromScene.cameras && fromScene.cameras.main && fromScene.scene.key === "Region") { fromScene.cameras.main.fadeOut(250, 10, 6, 12); fromScene.cameras.main.once("camerafadeoutcomplete", () => sm.start("Region", args)); } else sm.start("Region", args);
  };
  World.Region = Region; window.Region = Region;
  World.listRegions = () => Object.keys(World.REGIONS);
  // run checkReach over every region (test page / build log): resolves to { regionId: [problems] }
  World.checkAll = function (game, party) {
    const ids = Object.keys(World.REGIONS), res = {};
    return new Promise(done => {
      let i = 0; const next = () => {
        if (i >= ids.length) return done(res); const id = ids[i++]; World.onReady = sc => { try { res[id] = sc.checkReach(); } catch (e) { res[id] = ["ERROR " + e.message]; } World.onReady = null; setTimeout(next, 50); };
        game.scene.start("Region", { region: id, entry: "start", party: party || [], flags: {} });
      }; next();
    });
  };
})();
