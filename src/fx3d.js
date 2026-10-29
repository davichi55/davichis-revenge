// Battle effects for the 3D arena (2026-10-30, Danny: "more sparkles or animations on the attacks").
// Pooled additive sprites + a few meshes (rings, slash arcs, beams). arena3d.js calls:
//   FX3D.init(scene)  once,  FX3D.update(dt)  every frame,  FX3D.clear()  after a fight,
//   FX3D.cast(src, el, power)               a non-basic move starts (glow gathers on the caster)
//   await FX3D.shoot(src, tgt, el, power)   spell projectile from caster to target
//   FX3D.hit(tgt, el, kind, power, crit)    impact on a target (the look depends on the element)
//   FX3D.heal(tgt) / buff(tgt) / debuff(tgt) / status(tgt, type) / brk(tgt) / ko(tgt) / revive(tgt) / wave(pos, el, power)
// power: 1 = basic attack, 1.6 = 2 MP move, 2.3 = 3 MP move or an enemy's big attack.
(function (root) {
  "use strict";
  let scene = null, on = true;
  const SIZE = 1.9;   // all particle sizes; solid colours (normal blending) so effects stay visible on the bright desert, additive only for flashes
  const parts = [], free = [], meshes = [], T = {};
  const COL = {
    fire: [0xff7a2a, 0xffd36a], water: [0x3ab8ff, 0xb8f0ff], ice: [0x9fe6ff, 0xffffff], shock: [0xffe45c, 0xffffff], earth: [0xb07a40, 0xe0c090],
    wind: [0x9effc0, 0xffffff], light: [0xffe08a, 0xffffff], dark: [0x9a4aff, 0x2a0a4a], nature: [0x6ad860, 0xd8ff8a], poison: [0x9be06a, 0x4a8a2a],
    phys: [0xfff0d0, 0xffffff], heal: [0x7ee081, 0xfff4a0], buff: [0xa8e0a0, 0xffffff], debuff: [0xb06aff, 0xff7a9a], gold: [0xf2c14e, 0xffffff], blood: [0xe04a4a, 0x801818],
  };
  const rnd = (a, b) => a + Math.random() * (b - a);

  function canvasTex(w, h, draw) {
    const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h);
    const t = new THREE.CanvasTexture(c); t.needsUpdate = true; return t;
  }
  function makeTextures() {
    T.dot = canvasTex(64, 64, (g, w) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(0.25, "rgba(255,255,255,.8)"); r.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = r; g.fillRect(0, 0, w, w); });
    T.star = canvasTex(64, 64, g => { g.translate(32, 32); const r = g.createRadialGradient(0, 0, 0, 0, 0, 30); r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = r;
      for (let i = 0; i < 4; i++) { g.rotate(Math.PI / 4 * (i ? 2 : 0)); g.beginPath(); g.moveTo(0, -31); g.lineTo(4, 0); g.lineTo(0, 31); g.lineTo(-4, 0); g.fill(); } g.beginPath(); g.arc(0, 0, 7, 0, 7); g.fill(); });
    T.shard = canvasTex(32, 64, g => { g.fillStyle = "rgba(255,255,255,1)"; g.beginPath(); g.moveTo(16, 0); g.lineTo(26, 32); g.lineTo(16, 64); g.lineTo(6, 32); g.fill(); });
    T.leaf = canvasTex(32, 32, g => { g.fillStyle = "#fff"; g.beginPath(); g.ellipse(16, 16, 14, 7, 0.6, 0, 7); g.fill(); });
    T.rock = canvasTex(32, 32, g => { g.fillStyle = "#fff"; g.beginPath(); g.moveTo(6, 10); g.lineTo(18, 3); g.lineTo(29, 12); g.lineTo(25, 27); g.lineTo(9, 28); g.closePath(); g.fill(); });
    T.bubble = canvasTex(32, 32, g => { g.strokeStyle = "#fff"; g.lineWidth = 3; g.beginPath(); g.arc(16, 16, 12, 0, 7); g.stroke(); g.fillStyle = "rgba(255,255,255,.35)"; g.fill(); g.fillStyle = "#fff"; g.beginPath(); g.arc(11, 11, 3, 0, 7); g.fill(); });
    T.ring = canvasTex(128, 128, g => { const r = g.createRadialGradient(64, 64, 40, 64, 64, 62); r.addColorStop(0, "rgba(255,255,255,0)"); r.addColorStop(0.7, "rgba(255,255,255,1)"); r.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = r; g.fillRect(0, 0, 128, 128); });
  }

  // ---------- particles ----------
  function spawn(o) {
    if (!on || !scene) return null;
    let p = free.pop();
    if (!p) { if (parts.length > 900) return null; const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: T.dot, transparent: true, depthWrite: false, depthTest: false, fog: false })); p = { s }; parts.push(p); }
    const m = p.s.material; m.map = T[o.tex || "dot"]; m.color.set(o.col); m.opacity = o.a == null ? 1 : o.a; m.rotation = o.rot || 0; m.blending = o.add ? THREE.AdditiveBlending : THREE.NormalBlending; m.needsUpdate = true;
    p.s.position.set(o.x, o.y, o.z); p.vx = o.vx || 0; p.vy = o.vy || 0; p.vz = o.vz || 0; p.g = o.g || 0; p.drag = o.drag == null ? 1.5 : o.drag;
    p.life = p.max = o.life || 0.6; p.size = (o.size || 0.3) * SIZE; p.grow = o.grow == null ? 0 : o.grow; p.a0 = m.opacity; p.spin = o.spin || 0; p.sx = o.sx || 1; p.sy = o.sy || 1;
    p.orbit = o.orbit || null; p.delay = o.delay || 0; p.s.visible = !p.delay; p.alive = true; p.s.scale.set(p.size * p.sx, p.size * p.sy, 1); p.s.renderOrder = o.add ? 1001 : 1000;
    if (!p.s.parent) scene.add(p.s);
    return p;
  }
  // flat or upright meshes that grow and fade: ground rings, slash arcs, light beams
  function mesh(geo, col, o) {
    if (!on || !scene) return;
    const mat = new THREE.MeshBasicMaterial({ color: col, map: o.map || null, transparent: true, opacity: o.a == null ? 0.9 : o.a, depthWrite: false, depthTest: !!o.depth, fog: false, blending: o.add ? THREE.AdditiveBlending : THREE.NormalBlending, side: THREE.DoubleSide });
    const m = new THREE.Mesh(geo, mat); m.renderOrder = 999; m.position.copy(o.pos); if (o.rx != null) m.rotation.x = o.rx; if (o.ry != null) m.rotation.y = o.ry; if (o.rz != null) m.rotation.z = o.rz;
    m.scale.setScalar(o.s0 || 0.2); scene.add(m);
    meshes.push({ m, life: o.life || 0.5, max: o.life || 0.5, s0: o.s0 || 0.2, s1: o.s1 || 2, a0: mat.opacity, sy: o.sy || null });
  }
  function update(dt) {
    for (const p of parts) {
      if (!p.alive) continue;
      if (p.delay > 0) { p.delay -= dt; if (p.delay <= 0) p.s.visible = true; else continue; }
      p.life -= dt; if (p.life <= 0) { p.alive = false; p.s.visible = false; free.push(p); continue; }
      const k = p.life / p.max, pos = p.s.position;
      if (p.orbit) { const o = p.orbit; o.ang += o.w * dt; o.r = Math.max(0, o.r + o.dr * dt); pos.x = o.cx + Math.cos(o.ang) * o.r; pos.z = o.cz + Math.sin(o.ang) * o.r * 0.6; pos.y += p.vy * dt; }
      else { p.vy -= p.g * dt; const d = Math.exp(-p.drag * dt); p.vx *= d; p.vz *= d; if (!p.g) p.vy *= d; pos.x += p.vx * dt; pos.y += p.vy * dt; pos.z += p.vz * dt; if (p.g && pos.y < 0.05) { pos.y = 0.05; p.vy *= -0.3; p.vx *= 0.6; p.vz *= 0.6; } }
      const sz = p.size * (1 + p.grow * (1 - k)); p.s.scale.set(sz * p.sx, sz * p.sy, 1);
      p.s.material.opacity = p.a0 * Math.min(1, k * 2.2); if (p.spin) p.s.material.rotation += p.spin * dt;
    }
    for (let i = meshes.length - 1; i >= 0; i--) {
      const q = meshes[i]; q.life -= dt; const k = 1 - Math.max(0, q.life) / q.max, e = 1 - Math.pow(1 - k, 3);
      const s = q.s0 + (q.s1 - q.s0) * e; if (q.sy) q.m.scale.set(s, q.sy * (1 - k * 0.3), s); else q.m.scale.setScalar(s);
      q.m.material.opacity = q.a0 * (1 - k);
      if (q.life <= 0) { scene.remove(q.m); q.m.geometry.dispose(); q.m.material.dispose(); meshes.splice(i, 1); }
    }
  }
  function clear() { for (const p of parts) { p.alive = false; p.s.visible = false; } free.length = 0; free.push(...parts); for (const q of meshes) { scene.remove(q.m); q.m.material.dispose(); } meshes.length = 0; }

  // ---------- where things are ----------
  const at = (u, hf = 0.5) => { const v = u && u.view; if (!v) return null; const p = v.group.position; return { x: p.x, y: (v.h || 2.5) * hf, z: p.z + 0.3, h: v.h || 2.5, gx: p.x, gz: p.z }; };
  const sizeK = c => Math.max(0.8, Math.min(1.8, c.h / 2.9));
  const colOf = el => COL[el] || COL.phys;
  const ringAt = (x, z, col, s1, life, a) => mesh(new THREE.PlaneGeometry(1, 1), col, { map: T.ring, pos: new THREE.Vector3(x, 0.06, z), rx: -Math.PI / 2, s0: 0.3, s1, life, a });
  function burst(c, col, n, speed, o = {}) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, e = rnd(-0.5, 1.1), sp = speed * rnd(0.5, 1.1);
      spawn(Object.assign({ x: c.x, y: c.y, z: c.z, vx: Math.cos(a) * Math.cos(e) * sp, vy: Math.sin(e) * sp, vz: Math.sin(a) * Math.cos(e) * sp * 0.6, col: Array.isArray(col) ? col[i % col.length] : col, life: rnd(0.35, 0.7), size: rnd(0.12, 0.28), drag: 3 }, o));
    }
  }
  const flashAt = (c, col, size, life = 0.18) => spawn({ x: c.x, y: c.y, z: c.z + 0.2, col, size, grow: 0.6, life, drag: 0, add: true });

  // ---------- the element looks ----------
  const LOOK = {
    fire(c, P) {
      const [a, b] = COL.fire; flashAt(c, b, 1.2 * P);
      for (let i = 0; i < 14 * P; i++) spawn({ x: c.x + rnd(-0.4, 0.4) * P, y: c.y + rnd(-0.6, 0.3), z: c.z + rnd(-0.2, 0.2), vx: rnd(-0.6, 0.6), vy: rnd(1.5, 3.5), col: i % 3 ? a : b, size: rnd(0.25, 0.55) * Math.sqrt(P), grow: -0.6, life: rnd(0.5, 0.9), drag: 1 });
      burst(c, [a, b, 0xffffff], 10 * P, 4 * Math.sqrt(P), { size: 0.1, life: 0.9, g: -1.5 });
    },
    water(c, P) {
      const [a, b] = COL.water; flashAt(c, b, 1 * P);
      for (let i = 0; i < 18 * P; i++) { const ang = rnd(0, 6.28), sp = rnd(1.5, 3.5) * Math.sqrt(P); spawn({ x: c.x, y: c.y, z: c.z, vx: Math.cos(ang) * sp, vy: rnd(2.5, 5), vz: Math.sin(ang) * sp * 0.5, g: 12, col: i % 2 ? a : b, size: rnd(0.12, 0.24), life: rnd(0.6, 1), drag: 0.5 }); }
      ringAt(c.gx, c.gz, a, 3 * P, 0.7, 0.8); ringAt(c.gx, c.gz, b, 1.8 * P, 0.5, 0.6);
    },
    ice(c, P) {
      const [a, b] = COL.ice; flashAt(c, b, 1.1 * P);
      for (let i = 0; i < 12 * P; i++) { const ang = rnd(0, 6.28), sp = rnd(2.5, 5) * Math.sqrt(P), vx = Math.cos(ang) * sp, vy = Math.sin(ang) * sp; spawn({ x: c.x, y: c.y, z: c.z, vx, vy, col: i % 2 ? a : b, tex: "shard", sx: 0.45, sy: 1, rot: Math.atan2(vy, vx) - Math.PI / 2, size: rnd(0.35, 0.6), life: rnd(0.4, 0.7), drag: 4 }); }
      for (let i = 0; i < 10 * P; i++) spawn({ x: c.x + rnd(-1, 1), y: c.y + rnd(0.5, 1.5), z: c.z, vy: -rnd(0.4, 1), col: b, tex: "star", size: rnd(0.1, 0.2), life: rnd(0.8, 1.3), spin: 2, drag: 0 });
      ringAt(c.gx, c.gz, a, 2.4 * P, 0.6, 0.7);
    },
    shock(c, P) {
      const [a, b] = COL.shock; flashAt(c, b, 1.3 * P, 0.12);
      for (let k = 0; k < 1 + Math.round(P); k++) {   // jagged bolts from the sky
        const x0 = c.x + rnd(-1.5, 1.5), steps = 18; let jx = 0;
        for (let i = 0; i <= steps; i++) { const f = i / steps; jx = (jx + rnd(-0.35, 0.35)) * (1 - f * 0.5); spawn({ x: x0 + (c.x - x0) * f + jx * (1 - f), y: c.y + 5 * (1 - f), z: c.z, col: i % 2 ? a : b, size: 0.34, life: 0.22, delay: k * 0.08, drag: 0 }); }
      }
      burst(c, [a, b], 14 * P, 6, { size: 0.09, life: 0.35, drag: 6 });
    },
    earth(c, P) {
      const [a, b] = COL.earth;
      for (let i = 0; i < 10 * P; i++) { const ang = rnd(0, 6.28), sp = rnd(1.5, 3.5); spawn({ x: c.gx + rnd(-0.3, 0.3), y: 0.3, z: c.gz, vx: Math.cos(ang) * sp, vy: rnd(3, 6) * Math.sqrt(P), vz: Math.sin(ang) * sp * 0.5, g: 14, col: i % 2 ? a : b, tex: "rock", size: rnd(0.2, 0.4), spin: rnd(-6, 6), life: rnd(0.8, 1.2), drag: 0.3, a: 1 }); }
      for (let i = 0; i < 12; i++) spawn({ x: c.gx + rnd(-1, 1) * P, y: 0.3, z: c.gz + rnd(-0.4, 0.4), vy: rnd(0.3, 0.8), col: b, size: rnd(0.5, 0.9), grow: 1, life: rnd(0.7, 1.1), a: 0.35, drag: 1 });
      ringAt(c.gx, c.gz, b, 3.2 * P, 0.6, 0.6);
    },
    wind(c, P) {
      const [a, b] = COL.wind;
      for (let i = 0; i < 26 * P; i++) spawn({ x: c.x, y: 0.2 + i * 0.06, z: c.z, vy: rnd(1, 2.5), col: i % 2 ? a : b, size: rnd(0.12, 0.24), life: rnd(0.6, 1), orbit: { cx: c.x, cz: c.z, ang: i * 0.7, r: rnd(0.6, 1.2) * Math.sqrt(P), dr: 0.8, w: 9 } });
      for (let i = 0; i < 4; i++) spawn({ x: c.x, y: c.y + rnd(-0.5, 0.8), z: c.z, vx: rnd(-6, 6), col: 0xffffff, sx: 3, sy: 0.25, size: 0.8, life: 0.3, drag: 3, a: 0.7 });
    },
    light(c, P) {
      const [a, b] = COL.light;
      mesh(new THREE.CylinderGeometry(0.5, 0.5, 1, 20, 1, true), a, { pos: new THREE.Vector3(c.gx, 5, c.gz), s0: 0.6 * P, s1: 1.3 * P, sy: 10, life: 0.6, a: 0.7, add: true });
      flashAt(c, b, 1.4 * P);
      for (let i = 0; i < 18 * P; i++) spawn({ x: c.x + rnd(-0.8, 0.8), y: rnd(0.2, c.h), z: c.z, vy: rnd(0.5, 2), col: i % 2 ? a : b, tex: "star", size: rnd(0.15, 0.32), spin: rnd(-3, 3), life: rnd(0.6, 1.1), drag: 0.5 });
    },
    dark(c, P) {
      const [a, b] = COL.dark;
      for (let i = 0; i < 22 * P; i++) { const ang = rnd(0, 6.28), r = rnd(1.4, 2.4) * Math.sqrt(P); spawn({ x: c.x + Math.cos(ang) * r, y: c.y + rnd(-1, 1), z: c.z + Math.sin(ang) * r * 0.5, vx: -Math.cos(ang) * r * 3, vz: -Math.sin(ang) * r * 1.5, col: a, size: rnd(0.15, 0.3), life: 0.35, drag: 0 }); }
      for (let i = 0; i < 8; i++) spawn({ x: c.x, y: c.y, z: c.z, col: a, size: 0.6, grow: 2.5 * P, life: 0.6, delay: 0.3, drag: 0, a: 0.5 });
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
      for (let i = 0; i < 8 * P; i++) spawn({ x: c.x + rnd(-0.5, 0.5), y: c.y, z: c.z, vy: rnd(0, 1), g: 8, col: a, size: rnd(0.1, 0.18), life: 0.8, drag: 0.5 });
    },
    phys(c, P, o = {}) {
      const col = o.col || COL.phys[0];
      const arc = (rz, d) => mesh(new THREE.RingGeometry(0.85, 1, 24, 1, 0.2, Math.PI * 0.8), col, { pos: new THREE.Vector3(c.x, c.y, c.z + 0.4), rz, s0: 0.6 * Math.sqrt(P), s1: 1.6 * Math.sqrt(P), life: 0.28 + d, a: 1 });
      arc(rnd(-0.6, 0.6) + Math.PI * 0.6, 0); if (P > 1.3) arc(rnd(2.5, 3.6), 0.06);
      flashAt(c, 0xffffff, 0.8 * P, 0.12);
      burst(c, [col, 0xffffff, 0xffd36a], 8 * P, 5 * Math.sqrt(P), { size: 0.09, life: 0.35, drag: 5 });
      if (P > 1.3) { ringAt(c.gx, c.gz, 0xffe0b0, 2.6 * P, 0.45, 0.6); for (let i = 0; i < 8; i++) spawn({ x: c.gx + rnd(-0.8, 0.8), y: 0.3, z: c.gz + rnd(-0.3, 0.3), vx: rnd(-1, 1), vy: rnd(0.2, 0.6), col: 0xd8c0a0, size: 0.6, grow: 1, life: 0.8, a: 0.3 }); }
    },
  };
  LOOK.self = LOOK.phys; LOOK.chill = LOOK.ice; LOOK.torrent = LOOK.water;

  // ---------- what arena3d.js calls ----------
  const FX = {
    init(sc) { scene = sc; if (!T.dot) makeTextures(); },
    update, clear,
    setEnabled(v) { on = !!v; },
    hit(u, el, kind, P = 1, crit = false) {
      const c = at(u, 0.55); if (!c) return; P *= sizeK(c);
      if (kind === "phys" || !el || !LOOK[el]) LOOK.phys(c, P, { col: el && COL[el] ? COL[el][0] : null });
      if (el && LOOK[el] && LOOK[el] !== LOOK.phys) LOOK[el](c, kind === "phys" ? P * 0.7 : P);
      if (crit) { flashAt(c, 0xffffff, 2 * P, 0.2); burst(c, [0xffd23f, 0xffffff], 16, 7, { tex: "star", size: 0.3, spin: 4, life: 0.6, drag: 4 }); }
    },
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
      const t0 = performance.now(), dur = Math.max(120, ms);
      return new Promise(res => {
        const step = () => {
          const k = Math.min(1, (performance.now() - t0) / dur), x = a.x + (b.x - a.x) * k, y = a.y + (b.y - a.y) * k + Math.sin(k * Math.PI) * 1.2, z = a.z + (b.z - a.z) * k;
          [orb, core].forEach(p => p && p.s.position.set(x, y, z));
          for (let i = 0; i < 2; i++) spawn({ x: x + rnd(-0.1, 0.1), y: y + rnd(-0.1, 0.1), z, vx: rnd(-0.4, 0.4), vy: rnd(-0.4, 0.4), col: i ? c2 : c1, tex: el === "ice" || el === "light" ? "star" : el === "nature" ? "leaf" : "dot", size: rnd(0.15, 0.3) * Math.sqrt(P), grow: -0.5, life: 0.35, drag: 2 });
          if (k < 1) requestAnimationFrame(step); else { [orb, core].forEach(p => p && (p.life = 0.01)); res(); }
        };
        requestAnimationFrame(step);
      });
    },
    wave(list, el, P = 1.6) { // area move: a shockwave across the targets' ground
      const pts = list.map(u => at(u)).filter(Boolean); if (!pts.length) return; const x = pts.reduce((s, p) => s + p.gx, 0) / pts.length, z = pts.reduce((s, p) => s + p.gz, 0) / pts.length;
      ringAt(x, z, colOf(el)[0], 7 * Math.sqrt(P), 0.7, 0.9); ringAt(x, z, colOf(el)[1], 4.5 * Math.sqrt(P), 0.5, 0.7);
    },
    heal(u) {
      const c = at(u, 0.3); if (!c) return; const [a, b] = COL.heal;
      ringAt(c.gx, c.gz, a, 2.4, 0.8, 0.8);
      for (let i = 0; i < 22; i++) spawn({ x: c.x + rnd(-0.7, 0.7), y: rnd(0, 0.6), z: c.z + rnd(-0.2, 0.2), vy: rnd(1.2, 2.6), col: i % 3 ? a : b, tex: i % 2 ? "star" : "dot", size: rnd(0.14, 0.28), spin: 2, life: rnd(0.8, 1.3), drag: 0.6 });
      spawn({ x: c.x, y: c.h * 0.5, z: c.z, col: a, size: c.h * 0.9, grow: 0.3, life: 0.5, a: 0.35, drag: 0 });
    },
    buff(u) {
      const c = at(u, 0.2); if (!c) return; const [a, b] = COL.buff;
      for (let i = 0; i < 18; i++) spawn({ x: c.x, y: 0.1 + i * 0.08, z: c.z, vy: 1.8, col: i % 2 ? a : b, size: rnd(0.12, 0.2), life: 0.9, orbit: { cx: c.x, cz: c.z, ang: i * 0.9, r: 0.9, dr: -0.3, w: 6 } });
      ringAt(c.gx, c.gz, a, 2, 0.6, 0.6);
    },
    debuff(u) {
      const c = at(u, 0.9); if (!c) return; const [a, b] = COL.debuff;
      for (let i = 0; i < 16; i++) spawn({ x: c.x + rnd(-0.6, 0.6), y: c.y + rnd(0, 0.4), z: c.z, vy: -rnd(1, 2.2), col: i % 2 ? a : b, size: rnd(0.12, 0.22), life: rnd(0.6, 0.9), drag: 0.5 });
    },
    status(u, type) {
      const c = at(u, 0.6); if (!c) return;
      const map = { burn: "fire", wet: "water", chill: "ice", freeze: "ice", shock: "shock", poison: "poison", petrify: "earth", steam: "wind" };
      if (map[type]) return LOOK[map[type]](c, 0.6);
      if (type === "bleed") { for (let i = 0; i < 12; i++) spawn({ x: c.x + rnd(-0.3, 0.3), y: c.y, z: c.z + 0.1, vx: rnd(-1.5, 1.5), vy: rnd(0.5, 2.5), g: 10, col: i % 2 ? COL.blood[0] : COL.blood[1], size: rnd(0.1, 0.18), life: 0.7 }); return; }
      if (type === "stun" || type === "slow") { const top = at(u, 1.02); for (let i = 0; i < 5; i++) spawn({ x: top.x, y: top.y, z: top.z, col: 0xffd23f, tex: "star", size: 0.28, spin: 3, life: 1.4, orbit: { cx: top.x, cz: top.z, ang: i * 1.26, r: 0.55, dr: 0, w: 5 } }); return; }
      LOOK.dark(c, 0.5);
    },
    brk(u) {
      const c = at(u, 0.55); if (!c) return; flashAt(c, 0xfff0b0, 2.2, 0.25);
      burst(c, [COL.gold[0], 0xffffff, 0xffe08a], 30, 8, { tex: "shard", sx: 0.5, size: 0.4, spin: 8, life: 0.9, g: 6, drag: 1.2 });
      ringAt(c.gx, c.gz, COL.gold[0], 4, 0.6, 0.9);
    },
    ko(u) { const c = at(u, 0.3); if (!c) return; for (let i = 0; i < 16; i++) spawn({ x: c.x + rnd(-0.8, 0.8), y: rnd(0.1, 0.5), z: c.z + rnd(-0.3, 0.3), vy: rnd(0.3, 0.9), col: 0x8a7a6a, size: rnd(0.6, 1), grow: 1, life: rnd(0.8, 1.2), a: 0.35 }); },
    revive(u) { const c = at(u, 0.5); if (!c) return; LOOK.light(c, 1.2); FX.heal(u); },
    reaction(u, name) {
      const c = at(u, 0.55); if (!c) return;
      const el = { Freeze: "ice", Shatter: "ice", Conductive: "shock", Steam: "wind", Detonate: "fire" }[name] || "light"; LOOK[el](c, 2.2);
      if (name === "Shatter") burst(c, [0xffffff, 0x9fe6ff], 30, 9, { tex: "shard", sx: 0.4, size: 0.5, spin: 9, life: 0.8, g: 8 });
    },
  };
  root.FX3D = FX;
})(window);
