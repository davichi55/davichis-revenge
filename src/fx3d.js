// Battle effects for the 3D arena. Owner of this file: FX. First version 2026-10-30, rebuilt as a primitive layer 2026-10-31.
//
// THIS FILE = the primitives: procedural textures, pooled sprite particles, pooled 3D props (rings, cones, cylinders, domes ...), a tween runner,
// caster motions (dash / leap / spin / rise ... on the unit's group), and the generic element hit looks.
// fx-moves.js = the verbs built on top of these and one recipe per move (see the format at the top of that file).
//
// arena3d.js calls (unchanged):  FX3D.init(scene)  once,  FX3D.update(dt)  every frame,  FX3D.clear()  after a fight,
//   FX3D.cast / shoot / wave                           generic glow, orb and ground wave (only used for a move that has no recipe)
//   FX3D.hit(tgt, el, kind, power, crit)               impact on a target for every damage event (fx-moves.js wraps it so a recipe can tone it down)
//   FX3D.heal / buff / debuff / status / brk / ko / revive / reaction
//   FX3D.move(e, api) -> Promise | null                defined in fx-moves.js
// FX3D.lib exposes the primitives to fx-moves.js (and to later agents: spawn, prop, tween, sleep, at, move3, home, tintUnit, T, COL, EASE ...).
// Rules: everything is pooled, nothing allocates per frame in the hot loops, effects use normal blending with solid colours (additive only for flashes)
// so they stay visible on the bright desert, and sprites ignore the depth buffer (always on top). Disabled when the battle speed is "instant".
(function (root) {
  "use strict";
  let scene = null, on = true, cam = null, gen = 0, probe = null, ready = false;
  const SIZE = 1.9;                       // all particle sizes are authored small and multiplied by this
  const PI = Math.PI, TAU = PI * 2;
  const parts = [], free = [], tws = [], live = [], pools = {}, T = {}, GEO = {};
  const rnd = (a, b) => a + Math.random() * (b - a), irnd = (a, b) => Math.floor(rnd(a, b + 1)), pick = a => a[Math.floor(Math.random() * a.length)];
  const lerp = (a, b, k) => a + (b - a) * k, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const EASE = { lin: k => k, out: k => 1 - Math.pow(1 - k, 3), in: k => k * k * k, io: k => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2), sin: k => Math.sin(k * PI), out2: k => 1 - Math.pow(1 - k, 2), in2: k => k * k,
    back: k => { const c = 1.9; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); }, bounce: k => { const n = 7.5625, d = 2.75; if (k < 1 / d) return n * k * k; if (k < 2 / d) return n * (k -= 1.5 / d) * k + 0.75; if (k < 2.5 / d) return n * (k -= 2.25 / d) * k + 0.9375; return n * (k -= 2.625 / d) * k + 0.984375; } };

  // ---------- palettes: [main, accent] ----------
  const COL = {
    fire: [0xff6a1a, 0xffd36a], water: [0x2fa8ff, 0xb8f0ff], ice: [0x8fdcff, 0xffffff], shock: [0xffe45c, 0xffffff], earth: [0xb07a40, 0xe0c090],
    wind: [0x9effc0, 0xffffff], light: [0xffe08a, 0xffffff], dark: [0x9a4aff, 0x2a0a4a], nature: [0x5ccf50, 0xd8ff8a], poison: [0x9be06a, 0x3a7a2a],
    phys: [0xfff0d0, 0xffffff], heal: [0x7ee081, 0xfff4a0], buff: [0xa8e0a0, 0xffffff], debuff: [0xb06aff, 0xff7a9a], gold: [0xf2c14e, 0xffffff], blood: [0xe04a4a, 0x801818],
    ember: [0xff3a10, 0xffa040], stone: [0x8e8e98, 0xd8d8e0], bone: [0xeee6d0, 0xb8a888], brass: [0xd8a040, 0xfff0a0], steam: [0xe8e8e8, 0xffffff], rune: [0x66e0ff, 0xffffff],
    shadow: [0x4a2a6a, 0x1a0a2a], sand: [0xd8b878, 0xfff0c0], moss: [0x5a8a3a, 0xa8d070], violet: [0xb070ff, 0xf0d8ff], rose: [0xff7a9a, 0xffd0dc], ink: [0x2a2a3a, 0x8080a0],
    sun: [0xffc040, 0xfff6c0], moon: [0xb8c8ff, 0xffffff], steel: [0xc8d4e0, 0xffffff], red: [0xff3b2a, 0xffa090],
  };
  COL.self = COL.phys; COL.chill = COL.ice; COL.torrent = COL.water;

  // ---------- textures (procedural, white on transparent, tinted by the sprite colour) ----------
  function canvasTex(w, h, draw) {
    const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h);
    const t = new THREE.CanvasTexture(c); t.needsUpdate = true; return t;
  }
  let _seed = 1234567;
  const R = () => (_seed = (_seed * 16807) % 2147483647) / 2147483647;
  const lens = (g, sx, sy, ex, ey, b1, b2) => {   // a pointed crescent: two quadratic edges between two points
    const mx = (sx + ex) / 2, my = (sy + ey) / 2, dx = ex - sx, dy = ey - sy, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo(mx + nx * b1, my + ny * b1, ex, ey); g.quadraticCurveTo(mx + nx * b2, my + ny * b2, sx, sy); g.fill();
  };
  function makeTextures() {
    const C = canvasTex;
    T.dot = C(64, 64, (g, w) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(0.25, "rgba(255,255,255,.8)"); r.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = r; g.fillRect(0, 0, w, w); });
    T.star = C(64, 64, g => { g.translate(32, 32); const r = g.createRadialGradient(0, 0, 0, 0, 0, 30); r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = r;
      for (let i = 0; i < 4; i++) { g.rotate(PI / 4 * (i ? 2 : 0)); g.beginPath(); g.moveTo(0, -31); g.lineTo(4, 0); g.lineTo(0, 31); g.lineTo(-4, 0); g.fill(); } g.beginPath(); g.arc(0, 0, 7, 0, 7); g.fill(); });
    T.shard = C(32, 64, g => { g.fillStyle = "#fff"; g.beginPath(); g.moveTo(16, 0); g.lineTo(26, 32); g.lineTo(16, 64); g.lineTo(6, 32); g.fill(); });
    T.leaf = C(32, 32, g => { g.fillStyle = "#fff"; g.beginPath(); g.ellipse(16, 16, 14, 7, 0.6, 0, 7); g.fill(); });
    T.rock = C(32, 32, g => { g.fillStyle = "#fff"; g.beginPath(); g.moveTo(6, 10); g.lineTo(18, 3); g.lineTo(29, 12); g.lineTo(25, 27); g.lineTo(9, 28); g.closePath(); g.fill(); });
    T.bubble = C(32, 32, g => { g.strokeStyle = "#fff"; g.lineWidth = 3; g.beginPath(); g.arc(16, 16, 12, 0, 7); g.stroke(); g.fillStyle = "rgba(255,255,255,.35)"; g.fill(); g.fillStyle = "#fff"; g.beginPath(); g.arc(11, 11, 3, 0, 7); g.fill(); });
    T.ring = C(128, 128, g => { const r = g.createRadialGradient(64, 64, 40, 64, 64, 62); r.addColorStop(0, "rgba(255,255,255,0)"); r.addColorStop(0.7, "rgba(255,255,255,1)"); r.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = r; g.fillRect(0, 0, 128, 128); });
    // a comet pointing right (arrows, spears, speed lines)
    T.streak = C(128, 32, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(0.7, "rgba(255,255,255,.85)"); gr.addColorStop(1, "rgba(255,255,255,1)"); g.fillStyle = gr; g.beginPath(); g.moveTo(0, h / 2); g.quadraticCurveTo(w * 0.62, 1, w, h / 2); g.quadraticCurveTo(w * 0.62, h - 1, 0, h / 2); g.fill(); });
    // a crescent blade, bulging up
    T.slash = C(128, 128, g => { g.fillStyle = "#fff"; g.shadowColor = "#fff"; g.shadowBlur = 6; lens(g, 8, 100, 120, 100, -138, -92); });
    // three claw marks
    T.claw = C(128, 128, g => { g.fillStyle = "#fff"; g.shadowColor = "#fff"; g.shadowBlur = 4; for (let i = 0; i < 3; i++) lens(g, 24 + i * 38, 6, 44 + i * 38, 122, 18, 0); });
    T.fang = C(32, 64, g => { g.fillStyle = "#fff"; g.beginPath(); g.moveTo(3, 0); g.quadraticCurveTo(8, 40, 18, 62); g.quadraticCurveTo(26, 36, 29, 0); g.closePath(); g.fill(); });
    T.feather = C(48, 128, g => { g.fillStyle = "#fff"; g.beginPath(); g.moveTo(24, 2); g.bezierCurveTo(52, 30, 50, 92, 24, 124); g.bezierCurveTo(-2, 92, -4, 30, 24, 2); g.fill();
      g.globalCompositeOperation = "destination-out"; g.lineWidth = 2; for (let i = 0; i < 9; i++) { const y = 26 + i * 10; g.beginPath(); g.moveTo(24, y); g.lineTo(i % 2 ? 1 : 47, y - 13); g.stroke(); }
      g.globalCompositeOperation = "source-over"; g.strokeStyle = "#fff"; g.lineWidth = 3; g.beginPath(); g.moveTo(24, 0); g.lineTo(24, 128); g.stroke(); });
    T.flame = C(64, 96, g => { const gr = g.createRadialGradient(32, 62, 4, 32, 58, 42); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.5, "rgba(255,255,255,.85)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr;
      g.beginPath(); g.moveTo(32, 94); g.bezierCurveTo(2, 84, 6, 46, 30, 2); g.bezierCurveTo(34, 26, 52, 34, 58, 62); g.bezierCurveTo(62, 82, 48, 94, 32, 94); g.fill(); });
    T.drop = C(32, 48, g => { g.fillStyle = "#fff"; g.beginPath(); g.moveTo(16, 2); g.bezierCurveTo(30, 22, 31, 40, 16, 46); g.bezierCurveTo(1, 40, 2, 22, 16, 2); g.fill(); g.fillStyle = "rgba(255,255,255,.0)"; });
    T.snow = C(64, 64, g => { g.translate(32, 32); g.strokeStyle = "#fff"; g.lineCap = "round"; for (let i = 0; i < 6; i++) { g.rotate(PI / 3); g.lineWidth = 3; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -28); g.stroke(); g.lineWidth = 2; g.beginPath(); g.moveTo(0, -16); g.lineTo(-7, -23); g.moveTo(0, -16); g.lineTo(7, -23); g.stroke(); } });
    // a magic circle, to lie flat on the ground
    T.glyph = C(256, 256, g => { g.translate(128, 128); g.strokeStyle = "#fff"; g.lineCap = "round"; g.lineWidth = 6; g.beginPath(); g.arc(0, 0, 120, 0, TAU); g.stroke(); g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 100, 0, TAU); g.stroke(); g.beginPath(); g.arc(0, 0, 58, 0, TAU); g.stroke();
      g.lineWidth = 3.5; g.beginPath(); for (let i = 0; i <= 5; i++) { const a = (i * 2 % 5) * TAU / 5 - PI / 2; g[i ? "lineTo" : "moveTo"](Math.cos(a) * 58, Math.sin(a) * 58); } g.stroke();
      for (let i = 0; i < 16; i++) { g.save(); g.rotate(i * TAU / 16); g.lineWidth = 3.5; const k = (i * 7) % 5; g.beginPath(); g.moveTo(-6, -113); g.lineTo(k % 2 ? 6 : -6, -105); g.moveTo(0, -115); g.lineTo(0, -103); if (k > 1) { g.moveTo(-6, -108); g.lineTo(6, -108); } if (k > 2) { g.moveTo(5, -115); g.lineTo(-1, -103); } g.stroke(); g.restore(); } });
    T.note = C(32, 48, g => { g.fillStyle = g.strokeStyle = "#fff"; g.beginPath(); g.ellipse(10, 38, 8, 6, -0.4, 0, TAU); g.fill(); g.lineWidth = 3; g.beginPath(); g.moveTo(17, 36); g.lineTo(17, 6); g.quadraticCurveTo(28, 12, 25, 26); g.stroke(); });
    T.plus = C(32, 32, g => { g.fillStyle = "#fff"; g.beginPath(); g.rect(12, 2, 8, 28); g.rect(2, 12, 28, 8); g.fill(); });
    T.heart = C(40, 40, g => { g.fillStyle = "#fff"; g.beginPath(); g.moveTo(20, 36); g.bezierCurveTo(-8, 18, 6, 0, 20, 12); g.bezierCurveTo(34, 0, 48, 18, 20, 36); g.fill(); });
    T.eye = C(64, 40, g => { g.fillStyle = "rgba(255,255,255,.6)"; g.beginPath(); g.moveTo(2, 20); g.quadraticCurveTo(32, -8, 62, 20); g.quadraticCurveTo(32, 48, 2, 20); g.fill(); g.fillStyle = "#fff"; g.beginPath(); g.arc(32, 20, 11, 0, TAU); g.fill();
      g.globalCompositeOperation = "destination-out"; g.beginPath(); g.ellipse(32, 20, 3.5, 9, 0, 0, TAU); g.fill(); });
    T.skull = C(48, 52, g => { g.fillStyle = "#fff"; g.beginPath(); g.arc(24, 20, 17, 0, TAU); g.fill(); g.fillRect(14, 28, 20, 16); g.globalCompositeOperation = "destination-out"; g.beginPath(); g.arc(17, 20, 5, 0, TAU); g.arc(31, 20, 5, 0, TAU); g.fill();
      g.beginPath(); g.moveTo(24, 26); g.lineTo(21, 32); g.lineTo(27, 32); g.fill(); for (let i = 0; i < 4; i++) g.fillRect(17 + i * 5, 38, 1.5, 7); });
    T.spiral = C(128, 128, g => { g.translate(64, 64); for (let a = 0; a < 3.6 * TAU; a += 0.1) { const r = 4 + a * 2.6, k = a / (3.6 * TAU); g.fillStyle = "rgba(255,255,255," + (0.12 + k * 0.88) + ")"; g.beginPath(); g.arc(Math.cos(a) * r, Math.sin(a) * r, 1.4 + k * 3.2, 0, TAU); g.fill(); } });
    T.hex = C(128, 128, g => { g.strokeStyle = "rgba(255,255,255,.9)"; g.lineWidth = 3; g.fillStyle = "rgba(255,255,255,.16)"; const Rr = 22;
      for (let row = -1; row < 6; row++) for (let col = -1; col < 6; col++) { const cx = col * Rr * 1.5 + 6, cy = row * Rr * 1.732 + (col % 2 ? Rr * 0.866 : 0) + 6; g.beginPath(); for (let i = 0; i < 6; i++) g.lineTo(cx + Math.cos(i * PI / 3) * Rr, cy + Math.sin(i * PI / 3) * Rr); g.closePath(); g.fill(); g.stroke(); } });
    T.web = C(128, 128, g => { g.translate(64, 64); g.strokeStyle = "#fff"; g.lineWidth = 2.5; for (let i = 0; i < 8; i++) { g.rotate(PI / 4); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -60); g.stroke(); }
      for (let r = 14; r <= 58; r += 11) { g.beginPath(); for (let i = 0; i <= 8; i++) { const a = i * PI / 4, rr = r * (i % 2 ? 0.9 : 1); g[i ? "lineTo" : "moveTo"](Math.sin(a) * rr, -Math.cos(a) * rr); } g.stroke(); } });
    T.crack = C(256, 256, g => { g.translate(128, 128); g.lineCap = g.lineJoin = "round"; g.strokeStyle = "#fff";
      const branch = (x, y, a, len, w, d) => { g.lineWidth = w; g.beginPath(); g.moveTo(x, y); let px = x, py = y; for (let i = 0; i < 6; i++) { a += (R() - 0.5) * 0.7; px += Math.cos(a) * len / 6; py += Math.sin(a) * len / 6; g.lineTo(px, py); } g.stroke();
        if (d > 0) { branch(px, py, a + 0.5 + R() * 0.4, len * 0.55, w * 0.62, d - 1); if (R() > 0.35) branch((x + px) / 2, (y + py) / 2, a - 0.6 - R() * 0.4, len * 0.5, w * 0.55, d - 1); } };
      for (let i = 0; i < 7; i++) branch(0, 0, i * TAU / 7 + R() * 0.4, 100, 7, 2); });
    T.fissure = C(256, 48, g => { g.strokeStyle = "#fff"; g.lineCap = g.lineJoin = "round"; g.lineWidth = 6; g.beginPath(); let y = 24; g.moveTo(2, y); for (let x = 2; x < 254; x += 14) { y = 24 + (R() - 0.5) * 20; g.lineTo(x, y); } g.stroke();
      g.lineWidth = 2.5; for (let i = 0; i < 6; i++) { const x = 20 + i * 38; g.beginPath(); g.moveTo(x, 24); g.lineTo(x + 12, 24 + (R() - 0.5) * 40); g.stroke(); } });
    T.smoke = C(64, 64, g => { for (let i = 0; i < 6; i++) { const x = 32 + Math.cos(i * 1.7) * 11, y = 32 + Math.sin(i * 2.3) * 11, r = 14 + (i % 3) * 4, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, "rgba(255,255,255,.55)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); } });
    T.chain = C(32, 18, g => { g.strokeStyle = "#fff"; g.lineWidth = 4; g.beginPath(); g.ellipse(16, 9, 12, 5.5, 0, 0, TAU); g.stroke(); });
    T.arrow = C(48, 56, g => { g.fillStyle = "#fff"; g.beginPath(); g.moveTo(24, 2); g.lineTo(46, 26); g.lineTo(32, 26); g.lineTo(32, 54); g.lineTo(16, 54); g.lineTo(16, 26); g.lineTo(2, 26); g.closePath(); g.fill(); });
    T.cross = C(64, 64, g => { g.translate(32, 32); g.strokeStyle = g.fillStyle = "#fff"; g.lineWidth = 4; g.beginPath(); g.arc(0, 0, 18, 0, TAU); g.stroke(); for (let i = 0; i < 4; i++) { g.rotate(PI / 2); g.beginPath(); g.moveTo(0, -30); g.lineTo(0, -12); g.stroke(); } g.beginPath(); g.arc(0, 0, 3, 0, TAU); g.fill(); });
    T.wing = C(128, 96, g => { g.fillStyle = "#fff"; g.beginPath(); g.moveTo(6, 90); g.bezierCurveTo(8, 40, 44, 8, 124, 6); g.quadraticCurveTo(122, 28, 106, 30); g.quadraticCurveTo(106, 48, 90, 48); g.quadraticCurveTo(86, 66, 68, 66); g.quadraticCurveTo(60, 82, 40, 82); g.quadraticCurveTo(26, 94, 6, 90); g.fill(); });
    T.wave = C(256, 128, g => { const gr = g.createLinearGradient(0, 10, 0, 128); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.45, "rgba(255,255,255,.85)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr;
      g.beginPath(); g.moveTo(0, 128); g.lineTo(0, 84); g.bezierCurveTo(30, 76, 60, 22, 120, 16); g.bezierCurveTo(165, 10, 205, 28, 218, 58); g.bezierCurveTo(206, 50, 192, 52, 186, 64); g.bezierCurveTo(210, 68, 236, 80, 256, 92); g.lineTo(256, 128); g.closePath(); g.fill();
      g.fillStyle = "#fff"; for (let i = 0; i < 40; i++) { const x = 90 + R() * 130, y = 18 + R() * 40; g.beginPath(); g.arc(x, y, 2 + R() * 4, 0, TAU); g.fill(); } });
    T.sun = C(128, 128, g => { g.translate(64, 64); const gr = g.createRadialGradient(0, 0, 6, 0, 0, 44); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.8, "rgba(255,255,255,.95)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 44, 0, TAU); g.fill();
      g.fillStyle = "#fff"; for (let i = 0; i < 12; i++) { g.rotate(PI / 6); g.beginPath(); g.moveTo(-5, -46); g.lineTo(0, -63); g.lineTo(5, -46); g.fill(); } });
    T.moon = C(64, 64, g => { g.fillStyle = "#fff"; g.beginPath(); g.arc(32, 32, 26, 0, TAU); g.fill(); g.globalCompositeOperation = "destination-out"; g.beginPath(); g.arc(42, 26, 22, 0, TAU); g.fill(); });
    T.cloud = C(160, 80, g => { for (let i = 0; i < 9; i++) { const x = 24 + i * 14, y = 44 + Math.sin(i * 1.9) * 12, r = 22 + (i % 3) * 6, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, "rgba(255,255,255,.75)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 160, 80); } });
    T.vgrad = C(8, 128, (g, w, h) => { const gr = g.createLinearGradient(0, h, 0, 0); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.6, "rgba(255,255,255,.55)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    T.excl = C(32, 64, g => { g.fillStyle = "#fff"; g.beginPath(); g.moveTo(8, 2); g.lineTo(24, 2); g.lineTo(20, 42); g.lineTo(12, 42); g.closePath(); g.fill(); g.beginPath(); g.arc(16, 54, 6, 0, TAU); g.fill(); });
    T.fist = C(48, 48, g => { g.fillStyle = "#fff"; g.beginPath(); g.moveTo(6, 16); g.lineTo(40, 16); g.lineTo(44, 36); g.lineTo(30, 46); g.lineTo(10, 40); g.closePath(); g.fill(); g.globalCompositeOperation = "destination-out"; g.lineWidth = 2; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(6 + i * 9, 16); g.lineTo(8 + i * 9, 30); g.stroke(); } });
    T.horn = C(48, 64, g => { g.fillStyle = "#fff"; g.beginPath(); g.moveTo(6, 62); g.quadraticCurveTo(2, 20, 40, 2); g.quadraticCurveTo(22, 26, 24, 62); g.closePath(); g.fill(); });
    T.blade = C(32, 128, g => { g.fillStyle = "#fff"; g.beginPath(); g.moveTo(16, 0); g.lineTo(24, 20); g.lineTo(22, 104); g.lineTo(10, 104); g.lineTo(8, 20); g.closePath(); g.fill(); g.fillRect(2, 104, 28, 6); g.fillRect(12, 110, 8, 18); });
    T.shieldIcon = C(48, 56, g => { g.fillStyle = "#fff"; g.beginPath(); g.moveTo(4, 6); g.lineTo(44, 6); g.lineTo(44, 28); g.quadraticCurveTo(44, 46, 24, 54); g.quadraticCurveTo(4, 46, 4, 28); g.closePath(); g.fill(); g.globalCompositeOperation = "destination-out"; g.fillRect(21, 14, 6, 32); g.fillRect(12, 22, 24, 6); });
    T.zig = C(32, 128, g => { g.strokeStyle = "#fff"; g.lineWidth = 7; g.lineJoin = "round"; g.shadowColor = "#fff"; g.shadowBlur = 8; g.beginPath(); g.moveTo(22, 2); g.lineTo(10, 40); g.lineTo(22, 52); g.lineTo(8, 90); g.lineTo(16, 98); g.lineTo(6, 126); g.stroke(); });
  }
  function makeGeos() {
    GEO.plane = new THREE.PlaneGeometry(1, 1);
    GEO.cone = new THREE.ConeGeometry(0.5, 1, 7, 1); GEO.cone.translate(0, 0.5, 0);
    GEO.pyr = new THREE.ConeGeometry(0.5, 1, 4, 1); GEO.pyr.translate(0, 0.5, 0);
    GEO.cyl = new THREE.CylinderGeometry(0.5, 0.5, 1, 20, 1, true); GEO.cyl.translate(0, 0.5, 0);
    GEO.cylc = new THREE.CylinderGeometry(0.5, 0.5, 1, 12, 1, false); GEO.cylc.translate(0, 0.5, 0);
    GEO.funnel = new THREE.CylinderGeometry(1, 0.18, 1, 22, 1, true); GEO.funnel.translate(0, 0.5, 0);
    GEO.sph = new THREE.SphereGeometry(1, 20, 14);
    GEO.hemi = new THREE.SphereGeometry(1, 22, 10, 0, TAU, 0, PI / 2);
    GEO.box = new THREE.BoxGeometry(1, 1, 1); GEO.box.translate(0, 0.5, 0);
    GEO.ico = new THREE.IcosahedronGeometry(1, 0);
    GEO.tor = new THREE.TorusGeometry(1, 0.05, 6, 40);
    GEO.disc = new THREE.CircleGeometry(1, 36);
  }

  // ---------- particles (pooled sprites) ----------
  function spawn(o) {
    if (!on || !scene) return null;
    let p = free.pop();
    if (!p) { if (parts.length > 1600) return null; const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: T.dot, transparent: true, depthWrite: false, depthTest: false, fog: false })); s.frustumCulled = false; p = { s }; parts.push(p); }
    const m = p.s.material; m.map = T[o.tex || "dot"]; m.color.set(o.col == null ? 0xffffff : o.col); m.opacity = o.a == null ? 1 : o.a; m.rotation = o.rot || 0; m.blending = o.add ? THREE.AdditiveBlending : THREE.NormalBlending;
    p.s.position.set(o.x, o.y, o.z); p.vx = o.vx || 0; p.vy = o.vy || 0; p.vz = o.vz || 0; p.g = o.g || 0; p.drag = o.drag == null ? 1.5 : o.drag;
    p.life = p.max = o.life || 0.6; p.size = (o.size || 0.3) * SIZE; p.grow = o.grow == null ? 0 : o.grow; p.a0 = m.opacity; p.spin = o.spin || 0; p.sx = o.sx || 1; p.sy = o.sy || 1;
    p.orbit = o.orbit || null; p.delay = o.delay || 0; p.fi = o.fi || 0; p.fo = 1 / (o.fo || 0.45); p.s.visible = !p.delay; p.alive = true; p.s.scale.set(p.size * p.sx, p.size * p.sy, 1); p.s.renderOrder = o.ro || (o.add ? 1001 : 1000);
    if (!p.s.parent) scene.add(p.s);
    return p;
  }
  const kill = p => { if (p) p.life = 0.001; };
  const setSize = (p, s) => { if (p) p.size = s * SIZE; };

  // ---------- props (pooled 3D meshes) ----------
  // o: kind (GEO key), col, em (emissive, lit only), lit (Phong, shaded) or flat colour, map, add, depth, a (peak opacity), fi/fo (fade-in end / fade-out start as fractions of life), life (s), delay (s),
  //    p/p1 (position start/end [x,y,z]), r/r1 (rotation), s/s1 (scale, number or [x,y,z]), e (easing), static (the caller poses the mesh), upd(q, k, dt), done(q)
  function prop(kind, o) {
    if (!on || !scene) return null;
    const lit = !!o.lit, key = kind + (lit ? "L" : "B"), pool = pools[key] || (pools[key] = []);
    let q = pool.pop();
    if (!q) {
      const mat = lit ? new THREE.MeshPhongMaterial({ flatShading: true, shininess: 25, transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: false }) : new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: false });
      const m = new THREE.Mesh(GEO[kind], mat); m.frustumCulled = false; scene.add(m); q = { m, mat, key };
    }
    const m = q.m, mat = q.mat, had = !!mat.map; mat.map = o.map || null; if (had !== !!o.map) mat.needsUpdate = true;
    mat.color.set(o.col == null ? 0xffffff : o.col); if (lit) mat.emissive.set(o.em == null ? 0x000000 : o.em);
    mat.blending = o.add ? THREE.AdditiveBlending : THREE.NormalBlending; mat.depthTest = !!o.depth;
    q.a = o.a == null ? 0.9 : o.a; q.fi = o.fi == null ? 0.08 : o.fi; q.fo = o.fo == null ? 0.55 : o.fo; q.life = q.max = o.life || 0.5; q.delay = o.delay || 0; q.e = o.e || EASE.out;
    const v3 = (v, d) => (v == null ? d : typeof v === "number" ? [v, v, v] : v);
    q.p = v3(o.p, [0, 0, 0]); q.p1 = v3(o.p1, q.p); q.r = v3(o.r, [0, 0, 0]); q.r1 = v3(o.r1, q.r); q.s = v3(o.s, [1, 1, 1]); q.s1 = v3(o.s1, q.s);
    q.static = !!o.static; q.upd = o.upd || null; q.done = o.done || null; m.renderOrder = o.ro || 999; m.visible = !q.delay; m.rotation.set(q.r[0], q.r[1], q.r[2]); m.position.set(q.p[0], q.p[1], q.p[2]); m.scale.set(q.s[0], q.s[1], q.s[2]);
    live.push(q); return q;
  }

  // ---------- tweens ----------
  function tween(sec, fn, ease) { return new Promise(res => { tws.push({ t: 0, d: Math.max(0.001, sec), fn, ease: ease || EASE.lin, res }); }); }
  const sleep = sec => tween(sec, null);
  function runTweens(dt) {
    const n = tws.length;
    for (let i = 0; i < n; i++) { const w = tws[i]; w.t += dt; const k = Math.min(1, w.t / w.d); if (w.fn) { try { w.fn(w.ease(k), k, dt); } catch (err) { console.warn("fx tween", err); w.t = w.d; } } if (k >= 1) w.done = true; }
    for (let i = tws.length - 1; i >= 0; i--) if (tws[i].done) { const w = tws.splice(i, 1)[0]; w.res(); }
  }
  function update(dt) {
    if (!scene) return;
    runTweens(dt);
    for (const p of parts) {
      if (!p.alive) continue;
      if (p.delay > 0) { p.delay -= dt; if (p.delay <= 0) p.s.visible = true; else continue; }
      p.life -= dt; if (p.life <= 0) { p.alive = false; p.s.visible = false; free.push(p); continue; }
      const k = p.life / p.max, pos = p.s.position;
      if (p.orbit) { const o = p.orbit; o.ang += o.w * dt; o.r = Math.max(0, o.r + o.dr * dt); pos.x = o.cx + Math.cos(o.ang) * o.r; pos.z = o.cz + Math.sin(o.ang) * o.r * 0.6; pos.y += p.vy * dt; }
      else { p.vy -= p.g * dt; const d = Math.exp(-p.drag * dt); p.vx *= d; p.vz *= d; if (!p.g) p.vy *= d; pos.x += p.vx * dt; pos.y += p.vy * dt; pos.z += p.vz * dt; if (p.g > 0 && pos.y < 0.05) { pos.y = 0.05; p.vy *= -0.3; p.vx *= 0.6; p.vz *= 0.6; } }
      const sz = p.size * (1 + p.grow * (1 - k)); p.s.scale.set(sz * p.sx, sz * p.sy, 1);
      p.s.material.opacity = p.a0 * Math.min(1, k * p.fo) * (p.fi ? Math.min(1, (1 - k) / p.fi) : 1); if (p.spin) p.s.material.rotation += p.spin * dt;
    }
    for (let i = live.length - 1; i >= 0; i--) {
      const q = live[i];
      if (q.delay > 0) { q.delay -= dt; if (q.delay > 0) continue; q.m.visible = true; }
      q.life -= dt; const k = clamp(1 - q.life / q.max, 0, 1);
      if (!q.static) { const e = q.e(k), m = q.m, p = q.p, p1 = q.p1, r = q.r, r1 = q.r1, s = q.s, s1 = q.s1; m.position.set(lerp(p[0], p1[0], e), lerp(p[1], p1[1], e), lerp(p[2], p1[2], e)); m.rotation.set(lerp(r[0], r1[0], e), lerp(r[1], r1[1], e), lerp(r[2], r1[2], e)); m.scale.set(lerp(s[0], s1[0], e), lerp(s[1], s1[1], e), lerp(s[2], s1[2], e)); }
      q.mat.opacity = q.a * Math.min(1, k / Math.max(0.001, q.fi)) * Math.min(1, (1 - k) / Math.max(0.001, 1 - q.fo));
      if (q.upd) q.upd(q, k, dt);
      if (q.life <= 0) { q.m.visible = false; live.splice(i, 1); pools[q.key].push(q); if (q.done) q.done(q); }
    }
  }
  function clear() {
    gen++;
    for (const w of tws.splice(0)) w.res();
    for (const p of parts) { p.alive = false; p.s.visible = false; } free.length = 0; free.push(...parts);
    for (const q of live) { q.m.visible = false; pools[q.key].push(q); } live.length = 0;
  }

  // ---------- where things are ----------
  const _v1 = null;
  const at = (u, hf = 0.5) => { const v = u && u.view; if (!v || !v.group) return null; const p = v.group.position; return { x: p.x, y: (v.h || 2.5) * hf + p.y, z: p.z + 0.3, h: v.h || 2.5, gx: p.x, gz: p.z, gy: p.y }; };
  const sizeK = c => Math.max(0.8, Math.min(1.8, c.h / 2.9));
  const colOf = el => COL[el] || COL.phys;
  const A1 = { x: 0, y: 0, z: 0 }, A2 = { x: 0, y: 0, z: 0 };
  let pv1 = null, pv2 = null;
  // the on-screen angle (radians, 0 = right, counter-clockwise) of the line from a to b, so a sprite can point along its flight
  function scrAng(a, b) {
    if (!cam || !pv1) { if (THREE && !pv1) { pv1 = new THREE.Vector3(); pv2 = new THREE.Vector3(); } if (!cam || !pv1) return Math.atan2(b.y - a.y, b.x - a.x); }
    pv1.set(a.x, a.y, a.z).project(cam); pv2.set(b.x, b.y, b.z).project(cam);
    return Math.atan2(pv2.y - pv1.y, (pv2.x - pv1.x) * cam.aspect);
  }
  let _up = null, _d = null, _qf = null;
  // put a mesh (geometry along +y, base at the origin) between two points; returns the length
  function aim(m, a, b) {
    if (!_up) { _up = new THREE.Vector3(0, 1, 0); _d = new THREE.Vector3(); }
    _d.set(b.x - a.x, b.y - a.y, b.z - a.z); const len = _d.length() || 0.001; m.position.set(a.x, a.y, a.z); m.quaternion.setFromUnitVectors(_up, _d.multiplyScalar(1 / len)); return len;
  }

  // ---------- caster / target motion: drives the unit's GROUP (arena3d only writes the group while its own lunge animation runs) ----------
  function shadowOf(v) { if (v.fxSh === undefined) v.fxSh = v.group.children.find(ch => ch.isMesh && ch.geometry && ch.geometry.type === "PlaneGeometry" && Math.abs(ch.rotation.x + PI / 2) < 0.01) || null; return v.fxSh; }
  function pose(v, x, y, z, rz, ry, sy) {
    const g = v.group, s = Math.max(0.2, sy), q = 1 / Math.sqrt(s); g.position.set(x, y, z); g.rotation.z = rz; g.rotation.y = ry; g.scale.set(q, s, q);
    const sh = shadowOf(v); if (sh) { if (!_qf) { _qf = new THREE.Quaternion().setFromEuler(new THREE.Euler(-PI / 2, 0, 0)); } sh.position.y = (0.02 - y) / s; sh.scale.setScalar(clamp(1 - y * 0.08, 0.4, 1)); sh.quaternion.copy(g.quaternion).invert().multiply(_qf); }
  }
  // move a unit to `to` ({x,y,z}, any missing = stay) in `sec` seconds. o: arc (hop height), lean (rotation.z, + = top toward -x), spin (turns), sy (squash, default 1), ry (absolute yaw), ease
  function move3(u, to, sec, o = {}) {
    const v = u && u.view; if (!v || !on) return Promise.resolve();
    v.anim = null; const tok = (v.fxm = (v.fxm || 0) + 1), g = v.group;
    const x0 = g.position.x, y0 = g.position.y, z0 = g.position.z, rz0 = g.rotation.z, ry0 = g.rotation.y, sy0 = g.scale.y;
    const x1 = to.x == null ? x0 : to.x, y1 = to.y == null ? y0 : to.y, z1 = to.z == null ? z0 : to.z, rz1 = o.lean == null ? rz0 : o.lean, ry1 = o.ry != null ? o.ry : ry0 + (o.spin || 0) * TAU, sy1 = o.sy == null ? 1 : o.sy;
    return tween(sec, k => { if (v.fxm !== tok) return; pose(v, lerp(x0, x1, k), lerp(y0, y1, k) + (o.arc ? Math.sin(k * PI) * o.arc : 0), lerp(z0, z1, k), lerp(rz0, rz1, k), lerp(ry0, ry1, k), lerp(sy0, sy1, k)); }, o.ease || EASE.io);
  }
  // bring a unit back to its slot and normal pose
  function home(u, sec = 0.16) {
    const v = u && u.view; if (!v || !on) return Promise.resolve();
    const g = v.group; g.rotation.y = g.rotation.y - Math.round(g.rotation.y / TAU) * TAU;
    return move3(u, v.home, sec, { lean: 0, ry: 0, sy: 1, ease: EASE.out });
  }
  function snapHome(u) { const v = u && u.view; if (!v) return; v.fxm = (v.fxm || 0) + 1; pose(v, v.home.x, 0, v.home.z, 0, 0, 1); }
  // flash a unit's colour for a moment (emissive on models, colour mix on flat sprites)
  function tintUnit(u, col, sec, amt = 0.55) {
    const v = u && u.view; if (!v || !v.model || !on) return Promise.resolve();
    const ms = []; v.model.traverse(o => { if (o.isMesh && o.material) ms.push(o); });
    const c = new THREE.Color(col), tok = (v.fxt = (v.fxt || 0) + 1);
    const apply = f => ms.forEach(o => { const m = o.material; if (m.emissive) m.emissive.copy(c).multiplyScalar(f); else if (m.color) { if (!o.userData.c0) o.userData.c0 = m.color.clone(); m.color.copy(o.userData.c0).lerp(c, f); } });
    return tween(sec, k => { if (v.fxt === tok) apply(Math.sin(k * PI) * amt); }).then(() => { if (v.fxt === tok) apply(0); });
  }

  // ---------- small helpers ----------
  const ringAt = (x, z, col, s1, life, a, y = 0.06) => prop("plane", { map: T.ring, col, a: a == null ? 0.8 : a, p: [x, y, z], r: [-PI / 2, 0, 0], s: 0.3, s1, life, fo: 0.3 });
  function burst(c, col, n, speed, o = {}) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU, e = rnd(-0.5, 1.1), sp = speed * rnd(0.5, 1.1);
      spawn(Object.assign({ x: c.x, y: c.y, z: c.z, vx: Math.cos(a) * Math.cos(e) * sp, vy: Math.sin(e) * sp, vz: Math.sin(a) * Math.cos(e) * sp * 0.6, col: Array.isArray(col) ? col[i % col.length] : col, life: rnd(0.35, 0.7), size: rnd(0.12, 0.28), drag: 3 }, o));
    }
  }
  const flashAt = (c, col, size, life = 0.18) => spawn({ x: c.x, y: c.y, z: c.z + 0.2, col, size: size * 0.7, grow: 0.6, life, drag: 0, add: true });
  // dust puffs along the ground
  const dustAt = (x, z, n, col = 0xd8c0a0, s = 0.6, spread = 0.8) => { for (let i = 0; i < n; i++) spawn({ x: x + rnd(-spread, spread), y: 0.25, z: z + rnd(-0.3, 0.3), vx: rnd(-1, 1), vy: rnd(0.2, 0.7), tex: "smoke", col, size: s * rnd(0.7, 1.2), grow: 1.2, life: rnd(0.6, 1), a: 0.4, drag: 1.4 }); };

  // ---------- the element hit looks (generic; used for the follow-up damage events and for moves without a recipe) ----------
  const LOOK = {
    fire(c, P) {
      const [a, b] = COL.fire; flashAt(c, b, 1.2 * P);
      for (let i = 0; i < 14 * P; i++) spawn({ x: c.x + rnd(-0.4, 0.4) * P, y: c.y + rnd(-0.6, 0.3), z: c.z + rnd(-0.2, 0.2), vx: rnd(-0.6, 0.6), vy: rnd(1.5, 3.5), col: i % 3 ? a : b, tex: "flame", size: rnd(0.25, 0.5) * Math.sqrt(P), grow: -0.6, life: rnd(0.5, 0.9), drag: 1 });
      burst(c, [a, b, 0xffffff], 10 * P, 4 * Math.sqrt(P), { size: 0.1, life: 0.9, g: -1.5 });
    },
    water(c, P) {
      const [a, b] = COL.water; flashAt(c, b, 1 * P);
      for (let i = 0; i < 18 * P; i++) { const ang = rnd(0, 6.28), sp = rnd(1.5, 3.5) * Math.sqrt(P); spawn({ x: c.x, y: c.y, z: c.z, vx: Math.cos(ang) * sp, vy: rnd(2.5, 5), vz: Math.sin(ang) * sp * 0.5, g: 12, col: i % 2 ? a : b, tex: "drop", size: rnd(0.14, 0.26), life: rnd(0.6, 1), drag: 0.5 }); }
      ringAt(c.gx, c.gz, a, 3 * P, 0.7, 0.8); ringAt(c.gx, c.gz, b, 1.8 * P, 0.5, 0.6);
    },
    ice(c, P) {
      const [a, b] = COL.ice; flashAt(c, b, 1.1 * P);
      for (let i = 0; i < 12 * P; i++) { const ang = rnd(0, 6.28), sp = rnd(2.5, 5) * Math.sqrt(P), vx = Math.cos(ang) * sp, vy = Math.sin(ang) * sp; spawn({ x: c.x, y: c.y, z: c.z, vx, vy, col: i % 2 ? a : b, tex: "shard", sx: 0.45, sy: 1, rot: Math.atan2(vy, vx) - PI / 2, size: rnd(0.35, 0.6), life: rnd(0.4, 0.7), drag: 4 }); }
      for (let i = 0; i < 10 * P; i++) spawn({ x: c.x + rnd(-1, 1), y: c.y + rnd(0.5, 1.5), z: c.z, vy: -rnd(0.4, 1), col: b, tex: "snow", size: rnd(0.12, 0.22), life: rnd(0.8, 1.3), spin: 2, drag: 0 });
      ringAt(c.gx, c.gz, a, 2.4 * P, 0.6, 0.7);
    },
    shock(c, P) {
      const [a, b] = COL.shock; flashAt(c, b, 1.3 * P, 0.12);
      for (let k = 0; k < 1 + Math.round(P); k++) {
        const x0 = c.x + rnd(-1.5, 1.5), steps = 18; let jx = 0;
        for (let i = 0; i <= steps; i++) { const f = i / steps; jx = (jx + rnd(-0.35, 0.35)) * (1 - f * 0.5); spawn({ x: x0 + (c.x - x0) * f + jx * (1 - f), y: c.y + 5 * (1 - f), z: c.z, col: i % 2 ? a : b, size: 0.34, life: 0.22, delay: k * 0.08, drag: 0 }); }
      }
      burst(c, [a, b], 14 * P, 6, { size: 0.09, life: 0.35, drag: 6 });
    },
    earth(c, P) {
      const [a, b] = COL.earth;
      for (let i = 0; i < 10 * P; i++) { const ang = rnd(0, 6.28), sp = rnd(1.5, 3.5); spawn({ x: c.gx + rnd(-0.3, 0.3), y: 0.3, z: c.gz, vx: Math.cos(ang) * sp, vy: rnd(3, 6) * Math.sqrt(P), vz: Math.sin(ang) * sp * 0.5, g: 14, col: i % 2 ? a : b, tex: "rock", size: rnd(0.2, 0.4), spin: rnd(-6, 6), life: rnd(0.8, 1.2), drag: 0.3, a: 1 }); }
      dustAt(c.gx, c.gz, 10, b, 0.7, P); ringAt(c.gx, c.gz, b, 3.2 * P, 0.6, 0.6);
    },
    wind(c, P) {
      const [a, b] = COL.wind;
      for (let i = 0; i < 26 * P; i++) spawn({ x: c.x, y: 0.2 + i * 0.06, z: c.z, vy: rnd(1, 2.5), col: i % 2 ? a : b, size: rnd(0.12, 0.24), life: rnd(0.6, 1), orbit: { cx: c.x, cz: c.z, ang: i * 0.7, r: rnd(0.6, 1.2) * Math.sqrt(P), dr: 0.8, w: 9 } });
      for (let i = 0; i < 4; i++) spawn({ x: c.x, y: c.y + rnd(-0.5, 0.8), z: c.z, vx: rnd(-6, 6), col: 0xffffff, tex: "streak", sx: 3, sy: 0.4, size: 0.5, life: 0.3, drag: 3, a: 0.7 });
    },
    light(c, P) {
      const [a, b] = COL.light;
      prop("cyl", { col: a, add: true, a: 0.7, p: [c.gx, 0, c.gz], s: [0.6 * P, 10, 0.6 * P], s1: [1.3 * P, 10, 1.3 * P], life: 0.6, depth: false });
      flashAt(c, b, 1.4 * P);
      for (let i = 0; i < 18 * P; i++) spawn({ x: c.x + rnd(-0.8, 0.8), y: rnd(0.2, c.h), z: c.z, vy: rnd(0.5, 2), col: i % 2 ? a : b, tex: "star", size: rnd(0.15, 0.32), spin: rnd(-3, 3), life: rnd(0.6, 1.1), drag: 0.5 });
    },
    dark(c, P) {
      const [a, b] = COL.dark;
      for (let i = 0; i < 22 * P; i++) { const ang = rnd(0, 6.28), r = rnd(1.4, 2.4) * Math.sqrt(P); spawn({ x: c.x + Math.cos(ang) * r, y: c.y + rnd(-1, 1), z: c.z + Math.sin(ang) * r * 0.5, vx: -Math.cos(ang) * r * 3, vz: -Math.sin(ang) * r * 1.5, col: a, size: rnd(0.15, 0.3), life: 0.35, drag: 0 }); }
      for (let i = 0; i < 8; i++) spawn({ x: c.x, y: c.y, z: c.z, col: a, tex: "smoke", size: 0.6, grow: 2.5 * P, life: 0.6, delay: 0.3, drag: 0, a: 0.5 });
      burst(c, [a, 0xe0b0ff], 10 * P, 4, { delay: 0.32, size: 0.15 });
    },
    nature(c, P) {
      const [a, b] = COL.nature;
      for (let i = 0; i < 16 * P; i++) spawn({ x: c.x, y: c.y, z: c.z, vy: rnd(0.5, 2), col: i % 2 ? a : b, tex: "leaf", size: rnd(0.2, 0.32), spin: rnd(-8, 8), life: rnd(0.7, 1.1), orbit: { cx: c.x, cz: c.z, ang: rnd(0, 6.28), r: 0.2, dr: 2.2 * Math.sqrt(P), w: 5 } });
      burst(c, b, 8 * P, 2.5, { size: 0.12, life: 0.9 });
    },
    poison(c, P) {
      const [a, b] = COL.poison; flashAt(c, a, 0.9 * P);
      for (let i = 0; i < 14 * P; i++) spawn({ x: c.x + rnd(-0.6, 0.6), y: c.y + rnd(-0.6, 0.4), z: c.z + 0.1, vy: rnd(0.6, 1.6), vx: rnd(-0.3, 0.3), col: i % 2 ? a : b, tex: "bubble", size: rnd(0.15, 0.32), life: rnd(0.7, 1.2), drag: 0.4 });
      for (let i = 0; i < 8 * P; i++) spawn({ x: c.x + rnd(-0.5, 0.5), y: c.y, z: c.z, vy: rnd(0, 1), g: 8, col: a, tex: "drop", size: rnd(0.1, 0.18), life: 0.8, drag: 0.5 });
    },
    phys(c, P, o = {}) {
      const col = o.col || COL.phys[0], k = Math.sqrt(P);
      const slash = (ang, d) => { spawn({ x: c.x, y: c.y, z: c.z + 0.4, tex: "slash", col: 0x1a1008, rot: ang, size: 0.95 * k, sx: 1.1, sy: 1.1, life: 0.3 + d, grow: 0.5, a: 0.45, delay: d }); spawn({ x: c.x, y: c.y, z: c.z + 0.45, tex: "slash", col, rot: ang, size: 0.9 * k, life: 0.3 + d, grow: 0.5, delay: d }); };
      slash(rnd(-0.6, 0.6) + 0.5, 0); if (P > 1.3) slash(rnd(2.5, 3.6), 0.06);
      flashAt(c, 0xffffff, 0.8 * P, 0.12);
      burst(c, [col, 0xffffff, 0xffd36a], 8 * P, 5 * Math.sqrt(P), { size: 0.09, life: 0.35, drag: 5 });
      if (P > 1.3) { ringAt(c.gx, c.gz, 0xffe0b0, 2.6 * P, 0.45, 0.6); dustAt(c.gx, c.gz, 8, 0xd8c0a0, 0.6, 0.8); }
    },
  };
  LOOK.self = LOOK.phys; LOOK.chill = LOOK.ice; LOOK.torrent = LOOK.water;
  // a small impact in the move's colours: used after a recipe has already played its own impact
  function lite(c, el, P, col) {
    const [a, b] = col || colOf(el); flashAt(c, b, 0.5 * P, 0.1);
    burst(c, [a, b, 0xffffff], 9 * P, 3.5 * Math.sqrt(P), { size: 0.1, life: 0.38, drag: 5 });
  }

  // ---------- what arena3d.js calls ----------
  const FX = {
    init(sc, camera) {
      scene = sc; if (camera) cam = camera;
      if (!T.dot) { makeTextures(); makeGeos(); }
      if (!probe) { probe = new THREE.Mesh(new THREE.PlaneGeometry(0.01, 0.01), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, depthTest: false })); probe.frustumCulled = false; probe.onBeforeRender = (r, s, c2) => { cam = c2; }; }
      if (!probe.parent) scene.add(probe);
      ready = true;
    },
    update, clear,
    setEnabled(v) { on = !!v; },
    get gen() { return gen; },
    hit(u, el, kind, P = 1, crit = false) {
      const c = at(u, 0.55); if (!c) return; P *= sizeK(c);
      if (kind === "phys" || !el || !LOOK[el]) LOOK.phys(c, P, { col: el && COL[el] ? COL[el][0] : null });
      if (el && LOOK[el] && LOOK[el] !== LOOK.phys) LOOK[el](c, kind === "phys" ? P * 0.7 : P);
      if (crit) FX.crit(u, P);
    },
    crit(u, P = 1) { const c = at(u, 0.55); if (!c) return; flashAt(c, 0xffffff, 2 * P, 0.2); burst(c, [0xffd23f, 0xffffff], 16, 7, { tex: "star", size: 0.3, spin: 4, life: 0.6, drag: 4 }); },
    lite(u, el, P = 1, col) { const c = at(u, 0.55); if (c) lite(c, el, P * sizeK(c), col); },
    cast(u, el, P = 1.6) {
      const c = at(u, 0.5); if (!c) return; const [a, b] = colOf(el);
      ringAt(c.gx, c.gz, a, 2.2 * Math.sqrt(P), 0.6, 0.8);
      for (let i = 0; i < 14 * P; i++) { const ang = rnd(0, 6.28), r = rnd(1.2, 2); spawn({ x: c.x + Math.cos(ang) * r, y: c.y + rnd(-0.8, 1), z: c.z + Math.sin(ang) * r * 0.5, vx: -Math.cos(ang) * r * 2.6, vy: rnd(-0.5, 0.5), vz: -Math.sin(ang) * r * 1.3, col: i % 2 ? a : b, tex: i % 3 ? "dot" : "star", size: rnd(0.12, 0.24), life: 0.38, drag: 0 }); }
      spawn({ x: c.x, y: c.y, z: c.z, col: a, size: 1.2 * Math.sqrt(P), grow: 0.4, life: 0.45, delay: 0.28, drag: 0, a: 0.7 });
    },
    // an orb that flies from the caster to the target, leaving a trail; resolves on arrival
    shoot(src, tgt, el, P = 1.6, ms = 360) {
      const a = at(src, 0.6), b = at(tgt, 0.55); if (!a || !b || !on) return Promise.resolve();
      const [c1, c2] = colOf(el), orb = spawn({ x: a.x, y: a.y, z: a.z, col: c1, size: 0.6 * Math.sqrt(P), life: 9, drag: 0 }), core = spawn({ x: a.x, y: a.y, z: a.z, col: 0xffffff, size: 0.3 * Math.sqrt(P), life: 9, drag: 0 });
      return tween(Math.max(0.12, ms / 1000), k => {
        const x = a.x + (b.x - a.x) * k, y = a.y + (b.y - a.y) * k + Math.sin(k * PI) * 1.2, z = a.z + (b.z - a.z) * k;
        [orb, core].forEach(p => p && p.s.position.set(x, y, z));
        for (let i = 0; i < 2; i++) spawn({ x: x + rnd(-0.1, 0.1), y: y + rnd(-0.1, 0.1), z, vx: rnd(-0.4, 0.4), vy: rnd(-0.4, 0.4), col: i ? c2 : c1, tex: el === "ice" || el === "light" ? "star" : el === "nature" ? "leaf" : "dot", size: rnd(0.15, 0.3) * Math.sqrt(P), grow: -0.5, life: 0.35, drag: 2 });
      }).then(() => { kill(orb); kill(core); });
    },
    wave(list, el, P = 1.6) {   // area move: a shockwave across the targets' ground
      const pts = list.map(u => at(u)).filter(Boolean); if (!pts.length) return; const x = pts.reduce((s, p) => s + p.gx, 0) / pts.length, z = pts.reduce((s, p) => s + p.gz, 0) / pts.length;
      ringAt(x, z, colOf(el)[0], 7 * Math.sqrt(P), 0.7, 0.9); ringAt(x, z, colOf(el)[1], 4.5 * Math.sqrt(P), 0.5, 0.7);
    },
    heal(u) {
      const c = at(u, 0.3); if (!c) return; const [a, b] = COL.heal;
      ringAt(c.gx, c.gz, a, 2.4, 0.8, 0.8);
      for (let i = 0; i < 22; i++) spawn({ x: c.x + rnd(-0.7, 0.7), y: rnd(0, 0.6), z: c.z + rnd(-0.2, 0.2), vy: rnd(1.2, 2.6), col: i % 3 ? a : b, tex: i % 3 === 1 ? "plus" : i % 2 ? "star" : "dot", size: rnd(0.14, 0.28), spin: 2, life: rnd(0.8, 1.3), drag: 0.6 });
      spawn({ x: c.x, y: c.h * 0.5, z: c.z, col: a, size: c.h * 0.9, grow: 0.3, life: 0.5, a: 0.35, drag: 0 });
    },
    buff(u) {
      const c = at(u, 0.2); if (!c) return; const [a, b] = COL.buff;
      for (let i = 0; i < 18; i++) spawn({ x: c.x, y: 0.1 + i * 0.08, z: c.z, vy: 1.8, col: i % 2 ? a : b, tex: i % 4 === 0 ? "arrow" : "dot", size: rnd(0.12, 0.2), life: 0.9, orbit: { cx: c.x, cz: c.z, ang: i * 0.9, r: 0.9, dr: -0.3, w: 6 } });
      ringAt(c.gx, c.gz, a, 2, 0.6, 0.6);
    },
    debuff(u) {
      const c = at(u, 0.9); if (!c) return; const [a, b] = COL.debuff;
      for (let i = 0; i < 16; i++) spawn({ x: c.x + rnd(-0.6, 0.6), y: c.y + rnd(0, 0.4), z: c.z, vy: -rnd(1, 2.2), col: i % 2 ? a : b, tex: i % 4 === 0 ? "arrow" : "dot", rot: i % 4 === 0 ? PI : 0, size: rnd(0.12, 0.22), life: rnd(0.6, 0.9), drag: 0.5 });
    },
    status(u, type) {
      const c = at(u, 0.6); if (!c) return;
      const map = { burn: "fire", wet: "water", chill: "ice", freeze: "ice", shock: "shock", poison: "poison", petrify: "earth", steam: "wind" };
      if (map[type]) return LOOK[map[type]](c, 0.6);
      if (type === "bleed") { for (let i = 0; i < 12; i++) spawn({ x: c.x + rnd(-0.3, 0.3), y: c.y, z: c.z + 0.1, vx: rnd(-1.5, 1.5), vy: rnd(0.5, 2.5), g: 10, col: i % 2 ? COL.blood[0] : COL.blood[1], tex: "drop", size: rnd(0.1, 0.18), life: 0.7 }); return; }
      if (type === "stun" || type === "slow") { const top = at(u, 1.02); for (let i = 0; i < 5; i++) spawn({ x: top.x, y: top.y, z: top.z, col: 0xffd23f, tex: "star", size: 0.28, spin: 3, life: 1.4, orbit: { cx: top.x, cz: top.z, ang: i * 1.26, r: 0.55, dr: 0, w: 5 } }); return; }
      LOOK.dark(c, 0.5);
    },
    brk(u) {
      const c = at(u, 0.55); if (!c) return; flashAt(c, 0xfff0b0, 2.2, 0.25);
      burst(c, [COL.gold[0], 0xffffff, 0xffe08a], 30, 8, { tex: "shard", sx: 0.5, size: 0.4, spin: 8, life: 0.9, g: 6, drag: 1.2 });
      ringAt(c.gx, c.gz, COL.gold[0], 4, 0.6, 0.9);
    },
    ko(u) { const c = at(u, 0.3); if (!c) return; for (let i = 0; i < 16; i++) spawn({ x: c.x + rnd(-0.8, 0.8), y: rnd(0.1, 0.5), z: c.z + rnd(-0.3, 0.3), vy: rnd(0.3, 0.9), col: 0x8a7a6a, tex: "smoke", size: rnd(0.6, 1), grow: 1, life: rnd(0.8, 1.2), a: 0.5 }); },
    revive(u) { const c = at(u, 0.5); if (!c) return; LOOK.light(c, 1.2); FX.heal(u); },
    reaction(u, name) {
      const c = at(u, 0.55); if (!c) return;
      const el = { Freeze: "ice", Shatter: "ice", Conductive: "shock", Steam: "wind", Detonate: "fire" }[name] || "light"; LOOK[el](c, 2.2);
      if (name === "Shatter") burst(c, [0xffffff, 0x9fe6ff], 30, 9, { tex: "shard", sx: 0.4, size: 0.5, spin: 9, life: 0.8, g: 8 });
    },
  };
  // the primitives for fx-moves.js and later agents
  FX.lib = { spawn, kill, setSize, prop, tween, sleep, at, sizeK, scrAng, aim, move3, home, snapHome, pose, tintUnit, ringAt, burst, flashAt, dustAt, LOOK, T, GEO, COL, EASE, SIZE, PI, TAU, canvasTex, lens, lite,
    rnd, irnd, pick, lerp, clamp, get cam() { return cam; }, get scene() { return scene; }, get on() { return on; }, get gen() { return gen; } };
  root.FX3D = FX;
})(window);
