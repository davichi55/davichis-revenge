// Boss visuals for the 3D arena (ARENA agent). Global `ArenaBoss`: everything a boss, a general or a special fight shows on top of the plain models.
//   ArenaBoss.begin(env)  at the start of a fight   env = { THREE, scene, camera, ctx, units() -> every unit, arena() -> the ArenaSets controller (or null), sfx, float(u, text, color), flash(color, ms), shake(v) }
//   ArenaBoss.attach(u)   for one more unit (a summon);  ArenaBoss.update(dt, t) every frame;  ArenaBoss.event(e) -> Promise | null for a battle event;  ArenaBoss.end()
// What it draws (nothing needs an event, the rules only set plain fields; unknown fields are ignored; every call is wrapped so a visual can never break a fight):
//   u.collar            a general's harvesting collar: a glowing gold ring at the neck; cracks when the general is broken, shatters when it falls
//   u.coverBy / parts   the body of a multi-part boss wears a shield bubble while a part of it stands (foe.partOf === body.id)
//   u.hidden            burrowed / submerged: the model sinks, roots and a dirt ring come up        u.airborne  hovers high above the ground (shadow shrinks)
//   u.held | u.heldBy   a pinned creature is greyed and wrapped in thorns                           u.marked | u.mark  a red mark floats over its head
//   u.growN / arenaFx "heat"  a heat glow that grows with the stacks                                 arenaFx "storm" or ctx.storm  lightning storm; a charging boss (ctx.telegraph) crackles
//   arenaFx "sunEater"  corona behind the boss, the sky darkens with every phase                  ctx.flood  flooded floor
//   events: phase (shockwave ring, sky level), broken (collar cracks), ko (collar shatters), summon (rise animation is done in arena3d), steal / mark / pull / held (small floating word)
(function (root) {
  "use strict";
  let E = null, T = null;            // env, THREE
  const cvs = {}, live = [];          // canvas textures, short-lived effects { obj, t, dur, fn }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const safe = (f, ...a) => { try { return f(...a); } catch (e) { if (!safe.warned) { safe.warned = 1; console.warn("ArenaBoss", e); } return null; } };

  function ctex(name, w, h, draw) {
    if (cvs[name]) return cvs[name];
    const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h);
    const t = new T.CanvasTexture(c); t.magFilter = T.LinearFilter; t.minFilter = T.LinearFilter; t.generateMipmaps = false; return (cvs[name] = t);
  }
  const softT = () => ctex("soft", 64, 64, (g, w, h) => { const r = g.createRadialGradient(32, 32, 1, 32, 32, 31); r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(0.4, "rgba(255,255,255,.45)"); r.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = r; g.fillRect(0, 0, w, h); });
  const ringT = () => ctex("ring", 128, 128, (g, w, h) => { const r = g.createRadialGradient(64, 64, 34, 64, 64, 62); r.addColorStop(0, "rgba(255,255,255,0)"); r.addColorStop(0.55, "rgba(255,255,255,.95)"); r.addColorStop(0.8, "rgba(255,255,255,.35)"); r.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = r; g.fillRect(0, 0, w, h); });
  const shardT = () => ctex("shard", 16, 16, g => { g.fillStyle = "#fff"; g.beginPath(); g.moveTo(8, 0); g.lineTo(15, 12); g.lineTo(4, 15); g.closePath(); g.fill(); });
  const markT = () => ctex("mark", 64, 64, g => { g.strokeStyle = "#ff3a2a"; g.lineWidth = 5; g.beginPath(); g.arc(32, 32, 18, 0, 7); g.stroke(); g.lineWidth = 4; [[32, 4, 32, 18], [32, 46, 32, 60], [4, 32, 18, 32], [46, 32, 60, 32]].forEach(([a, b, c, d]) => { g.beginPath(); g.moveTo(a, b); g.lineTo(c, d); g.stroke(); }); });
  // the collar: a thick gold ring with dark rune plates, seen from the front; the cracked variant has red splits
  function collarT(cracked) {
    return ctex("collar" + (cracked ? "X" : ""), 128, 128, (g, w, h) => {
      g.translate(64, 64); const ring = (r, wd, col) => { g.strokeStyle = col; g.lineWidth = wd; g.beginPath(); g.arc(0, 0, r, 0, 7); g.stroke(); };
      ring(46, 18, "#3a2410"); ring(46, 12, cracked ? "#8a4a20" : "#e8b84a"); ring(50, 3, "#fff2b0"); ring(41, 3, "#7a4a14");
      for (let i = 0; i < 6; i++) { g.save(); g.rotate(i * Math.PI / 3 + 0.3); g.fillStyle = "#2a1608"; g.fillRect(-6, -53, 12, 14); g.fillStyle = cracked ? "#ff5a2a" : "#ffb040"; g.fillRect(-3, -50, 6, 8); g.restore(); }
      g.fillStyle = cracked ? "#ff3a1a" : "#ff9a3a"; g.beginPath(); g.arc(0, 46, 8, 0, 7); g.fill(); g.strokeStyle = "#2a1608"; g.lineWidth = 3; g.stroke();
      if (cracked) { g.strokeStyle = "#ff4a20"; g.lineWidth = 3; [[-40, -24, -8, -4], [30, -34, 6, 10], [-12, 50, 14, 30], [44, 12, 24, 22]].forEach(([a, b, c, d]) => { g.beginPath(); g.moveTo(a, b); g.lineTo(c, d); g.stroke(); }); }
    });
  }
  const spriteOf = (tex, color, w, h, o) => { o = o || {}; const s = new T.Sprite(new T.SpriteMaterial({ map: tex, color, transparent: true, opacity: o.opacity === undefined ? 1 : o.opacity, depthWrite: false, depthTest: o.depthTest !== false, blending: o.add ? T.AdditiveBlending : T.NormalBlending, fog: false })); s.scale.set(w, h === undefined ? w : h, 1); return s; };
  function fxAdd(obj, dur, fn, parent) { (parent || E.scene).add(obj); live.push({ obj, t: 0, dur, fn, parent: parent || E.scene }); }
  const bodyOf = u => { const v = u.view, r = v && v.rel; return r ? { w: Math.max(1, r.x1 - r.x0), d: Math.max(0.6, r.z1 - r.z0), h: v.h } : { w: (v && v.h) || 2.6, d: 1, h: (v && v.h) || 2.6 }; };
  const elColor = u => ({ fire: 0xff7a30, water: 0x4ab0ff, ice: 0x9fe0ff, shock: 0xffe45c, earth: 0xb08a50, wind: 0xb8ffd8, light: 0xfff0b0, dark: 0xa070ff, nature: 0x80e060, poison: 0xa0e040 })[u.element || (u.rs && Object.keys(u.rs).sort((a, b) => u.rs[b] - u.rs[a])[0])] || 0xffb060;   // QA-A: no element -> the element it resists most (the Maelstrom's bubble was amber)

  // ---------- one unit's visuals ----------
  function attach(u) {
    const v = u.view; if (!v || v.fx || u.coach) return; const fx = (v.fx = { u, k: {}, t0: Math.random() * 6 }), b = bodyOf(u), side = u.side === "e" ? 1 : -1;
    if (u.collar) {   // the harvesting collar of a creature general
      const w = clamp(b.w * 0.52, 1.2, 3.0), ring = spriteOf(collarT(false), 0xffffff, w, w, {}), glow = spriteOf(softT(), 0xff9a3a, w * 2.1, w * 2.1, { add: true, opacity: 0.55 });
      ring.position.set(side * b.w * 0.2, b.h * 0.66, 0.6); glow.position.copy(ring.position); v.group.add(glow, ring);
      const l = new T.PointLight(0xff8a30, 0.9, 7, 2); l.position.copy(ring.position); l.position.z += 0.8; v.group.add(l);
      fx.collar = { ring, glow, l, w, cracked: false, gone: false };
    }
    if (u.coverBy || (E.units().some(o => o.partOf && o.partOf === u.id))) {   // multi-part body: a shield bubble while a part stands
      const m = new T.Mesh(new T.SphereGeometry(1, 20, 14), new T.MeshBasicMaterial({ color: elColor(u), transparent: true, opacity: 0, side: T.DoubleSide, depthWrite: false, blending: T.AdditiveBlending, fog: false }));
      m.position.y = b.h * 0.5; m.scale.set(Math.max(1.2, b.w * 0.62), b.h * 0.56, Math.max(1, b.d * 0.7)); v.group.add(m); fx.shield = { m, k: 0 };
    }
    if (u.arenaFx === "heat" || u.grow) { const g = spriteOf(softT(), elColor(u), b.h * 1.6, b.h * 1.6, { add: true, opacity: 0.0 }); g.position.y = b.h * 0.5; g.position.z = -0.5; v.group.add(g); const l = new T.PointLight(elColor(u), 0, 9, 2); l.position.y = b.h * 0.6; l.position.z = 1; v.group.add(l); fx.heat = { g, l, k: 0 }; }
    if (u.arenaFx === "sunEater") {   // a dark disc and a golden corona standing behind the boss
      const c = spriteOf(ringT(), 0xffd060, b.h * 2.6, b.h * 2.6, { add: true, opacity: 0.9 }); c.position.set(0, b.h * 0.62, -2.5); v.group.add(c);
      const d = spriteOf(softT(), 0x000000, b.h * 1.25, b.h * 1.25, { opacity: 0.85 }); d.position.set(0, b.h * 0.62, -2.4); v.group.add(d); fx.corona = { c, d };
    }
    if (u.arenaFx === "storm") { fx.arcs = []; for (let i = 0; i < 4; i++) { const g = new T.BufferGeometry(); g.setAttribute("position", new T.BufferAttribute(new Float32Array(18), 3)); const l = new T.Line(g, new T.LineBasicMaterial({ color: 0xcfe0ff, transparent: true, opacity: 0, depthWrite: false, fog: false })); l.frustumCulled = false; v.group.add(l); fx.arcs.push(l); } }
  }
  function updateUnit(u, dt, t, ctx) {
    const v = u.view, fx = v && v.fx; if (!fx) return; const b = bodyOf(u), tt = t + fx.t0;
    const col = fx.collar; if (col && !col.gone) {
      const broken = !!u.broken, pulse = 1 + Math.sin(tt * 3.1) * (broken ? 0.1 : 0.05);
      col.ring.scale.set(col.w * pulse, col.w * pulse, 1); col.glow.material.opacity = (broken ? 0.85 : 0.5) + Math.sin(tt * 4) * 0.12; col.glow.material.color.setHex(broken ? 0xff4a20 : 0xff9a3a);
      col.l.intensity = (broken ? 1.6 : 0.9) + Math.sin(tt * 5) * 0.2; col.ring.position.y = b.h * 0.66 + Math.sin(tt * 1.8) * 0.03 * b.h;
      if (broken && !col.cracked) { col.cracked = true; col.ring.material.map = collarT(true); col.ring.material.needsUpdate = true; }
      if (!broken && col.cracked) { col.cracked = false; col.ring.material.map = collarT(false); col.ring.material.needsUpdate = true; }
      col.glow.position.copy(col.ring.position);
    }
    if (fx.shield) { const parts = E.units().some(o => o.alive && o.partOf && o.partOf === u.id) || (u.coverBy && E.units().some(o => o.alive && o.id === u.coverBy)), s = fx.shield; s.k += ((parts && u.alive ? 1 : 0) - s.k) * Math.min(1, dt * 3); s.m.material.opacity = s.k * (0.2 + Math.sin(tt * 2.3) * 0.06); s.m.visible = s.k > 0.02; s.m.rotation.y = tt * 0.4; }
    if (fx.heat) { const mx = (u.grow && u.grow[2]) || 6, k = clamp((u.growN || 0) / mx, 0, 1) * 0.8 + (u.arenaFx === "heat" ? 0.2 : 0); fx.heat.k += (k - fx.heat.k) * Math.min(1, dt * 2); const f = fx.heat.k; fx.heat.g.material.opacity = f * (0.45 + Math.sin(tt * 7) * 0.1); fx.heat.g.scale.setScalar(b.h * (1.3 + f * 1.0)); fx.heat.l.intensity = f * 1.8; }
    if (fx.corona) { const ph = (u.phaseNo || 1) - 1; fx.corona.c.material.rotation = tt * 0.15; fx.corona.c.material.color.setHex([0xffd060, 0xff9a30, 0xff5a20, 0xff2a10, 0xff1008][Math.min(4, ph)]); fx.corona.c.scale.setScalar(b.h * (2.6 + 0.5 * Math.sin(tt * 1.4) + ph * 0.25)); }
    if (fx.arcs) {
      const charging = ctx && ctx.telegraph === u || (ctx && ctx.storm);
      fx.arcs.forEach((l, i) => { const on = charging && Math.random() < dt * 9; if (on) { const p = l.geometry.attributes.position.array, a = Math.random() * 6.28, r = b.w * 0.5; let x = Math.cos(a) * r * 0.4, y = b.h * (0.3 + Math.random() * 0.5), z = Math.sin(a) * 0.5; for (let k = 0; k < 6; k++) { p[k * 3] = x; p[k * 3 + 1] = y; p[k * 3 + 2] = z; x += (Math.random() - 0.3) * r * 0.5; y += (Math.random() - 0.5) * b.h * 0.25; z += (Math.random() - 0.5) * 0.5; } l.geometry.attributes.position.needsUpdate = true; l.material.opacity = 1; } else l.material.opacity = Math.max(0, l.material.opacity - dt * 7); });
    }
  }
  // ---------- polled states: burrowed, airborne, pinned, marked ----------
  function rootsFor(u) {   // a ring of dark roots that grows out of the ground around a burrowed boss
    const b = bodyOf(u), g = new T.Group(), m = new T.MeshPhongMaterial({ color: 0x3a2a1c, flatShading: true, shininess: 0 });
    for (let i = 0; i < 7; i++) { const a = i / 7 * 6.28 + 0.3, h = b.h * (0.35 + (i % 3) * 0.12), c = new T.Mesh(new T.ConeGeometry(0.28 + (i % 2) * 0.12, h, 5), m); c.position.set(Math.cos(a) * b.w * 0.42, h / 2 - h, Math.sin(a) * Math.max(0.8, b.d * 0.5)); c.rotation.z = Math.cos(a) * 0.35; c.rotation.x = -Math.sin(a) * 0.35; c.userData.h = h; g.add(c); }
    const mound = spriteOf(softT(), 0x4a3422, b.w * 1.6, b.w * 1.6, { opacity: 0.55 }); mound.position.y = 0.06; g.add(mound); g.userData.mound = mound; return g;
  }
  function thornsFor(u) {
    const b = bodyOf(u), g = new T.Group(), m = new T.MeshPhongMaterial({ color: 0x2c2a3a, emissive: 0x3a2060, flatShading: true, shininess: 0 });
    for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28, h = b.h * (0.28 + (i % 2) * 0.1), c = new T.Mesh(new T.ConeGeometry(0.16, h, 5), m); c.position.set(Math.cos(a) * b.w * 0.36, h / 2, Math.sin(a) * Math.max(0.7, b.d * 0.45)); c.rotation.z = -Math.cos(a) * 0.4; c.rotation.x = Math.sin(a) * 0.4; g.add(c); }
    return g;
  }
  function tintUnit(u, on) {   // grey the whole creature while it is pinned, give the colours back afterwards
    const v = u.view, grey = new T.Color(0x7c8088);
    const each = o => { if (!o.isMesh || !o.material) return; (Array.isArray(o.material) ? o.material : [o.material]).forEach(mt => { if (!mt.color) return; if (on) { if (!mt.userData.__c0) mt.userData.__c0 = mt.color.clone(); mt.color.copy(mt.userData.__c0).lerp(grey, 0.62); } else if (mt.userData.__c0) { mt.color.copy(mt.userData.__c0); delete mt.userData.__c0; } }); };
    if (v.model) v.model.traverse(each);
  }
  function pollStates(u, dt, t, ctx) {
    const v = u.view; if (!v || !v.model || u.coach) return;
    const fx = v.fx || (v.fx = { u, k: {}, t0: Math.random() * 6 }), k = fx.k, b = bodyOf(u), tt = t + fx.t0, shadow = v.group.children[0], ease = Math.min(1, dt * 2.6);
    const wantH = u.hidden || u.burrowed ? 1 : 0, wantA = u.airborne ? 1 : 0;
    k.hid = (k.hid || 0) + (wantH - (k.hid || 0)) * ease; k.air = (k.air || 0) + (wantA - (k.air || 0)) * Math.min(1, dt * 2.0);
    if (k.hid > 0.005 || k.air > 0.005 || fx.moved) {
      v.model.position.y = -k.hid * b.h * 0.96 + k.air * (b.h * 0.85 + Math.sin(tt * 1.7) * 0.2); fx.moved = k.hid > 0.005 || k.air > 0.005;
      if (shadow && shadow.material) { shadow.scale.setScalar(clamp(1 - k.air * 0.5, 0.3, 1)); shadow.material.opacity = clamp(1 - k.hid * 1.3 - k.air * 0.25, 0, 1); }
    }
    if (k.hid > 0.04 && !fx.roots) { fx.roots = rootsFor(u); v.group.add(fx.roots); }
    if (fx.roots) {
      fx.roots.children.forEach(c => { if (c.userData.h) c.position.y = c.userData.h / 2 - c.userData.h * (1 - k.hid); });
      if (fx.roots.userData.mound) fx.roots.userData.mound.material.opacity = 0.55 * Math.min(1, k.hid * 2);
      if (k.hid < 0.01 && !wantH) { v.group.remove(fx.roots); fx.roots = null; }
    }
    const held = !!(u.held || u.heldBy) && u.alive;
    if (held && !fx.thorns) { fx.thorns = thornsFor(u); v.group.add(fx.thorns); tintUnit(u, true); }
    if (!held && fx.thorns) { v.group.remove(fx.thorns); fx.thorns = null; tintUnit(u, false); }
    if (fx.thorns) fx.thorns.rotation.y = Math.sin(tt * 1.1) * 0.08;
    const marked = (!!(u.marked || u.mark) && u.alive) || (fx.markUntil && performance.now() / 1000 < fx.markUntil);
    if (marked && !fx.mark) { fx.mark = spriteOf(markT(), 0xffffff, 1.1, 1.1, { depthTest: false, opacity: 0.95 }); fx.mark.renderOrder = 9; v.group.add(fx.mark); }
    if (!marked && fx.mark) { v.group.remove(fx.mark); fx.mark = null; }
    if (fx.mark) { fx.mark.position.set(0, b.h + 0.9 + Math.sin(tt * 4) * 0.08 + (v.model.position.y > 0 ? v.model.position.y : 0), 0); fx.mark.material.rotation = tt * 1.4; }
  }

  // ---------- short effects ----------
  function groundRing(x, z, color, r1, dur, y) {
    const m = new T.Mesh(new T.RingGeometry(0.55, 0.9, 40), new T.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, side: T.DoubleSide, depthWrite: false, blending: T.AdditiveBlending, fog: false }));
    m.rotation.x = -Math.PI / 2; m.position.set(x, y || 0.08, z); fxAdd(m, dur, (o, k) => { o.scale.setScalar(1 + k * r1); o.material.opacity = 0.9 * (1 - k); });
  }
  function burst(x, y, z, color, n, speed, dur) {
    for (let i = 0; i < n; i++) {
      const s = spriteOf(softT(), color, 0.5, 0.5, { add: true }), a = Math.random() * 6.28, sp = speed * (0.4 + Math.random() * 0.8); s.position.set(x, y, z);
      const vx = Math.cos(a) * sp, vz = Math.sin(a) * sp * 0.6, vy = (0.4 + Math.random() * 0.8) * sp;
      fxAdd(s, dur, (o, k, dt) => { o.position.x += vx * dt; o.position.z += vz * dt; o.position.y += (vy * (1 - k) - 3 * k) * dt; o.material.opacity = 1 - k; o.scale.setScalar(0.5 * (1 - 0.5 * k)); });
    }
  }
  function shatterCollar(u) {
    const fx = u.view && u.view.fx, c = fx && fx.collar; if (!c || c.gone) return; c.gone = true; const p = new T.Vector3(); c.ring.getWorldPosition(p);
    for (let i = 0; i < 16; i++) {
      const s = spriteOf(shardT(), i % 3 ? 0xe8b84a : 0xff7a2a, 0.5, 0.5, { add: i % 2 === 0 }), a = Math.random() * 6.28, sp = 3 + Math.random() * 4; s.position.copy(p);
      const vx = Math.cos(a) * sp, vy = 2 + Math.random() * 4, vz = Math.sin(a) * sp * 0.5;
      fxAdd(s, 1.3, (o, k, dt) => { o.position.x += vx * dt; o.position.z += vz * dt; o.position.y = Math.max(0.1, o.position.y + (vy * (1 - k * 1.6)) * dt); o.material.rotation += dt * 6; o.material.opacity = 1 - k * k; });
    }
    burst(p.x, p.y, p.z, 0xffc060, 14, 4, 0.9); c.ring.visible = false; c.glow.visible = false; c.l.intensity = 0; E.sfx && E.sfx("break"); E.flash && E.flash("#ffd890", 260);
  }
  function rise(u) {   // a summoned creature climbs out of the ground: dust, a ring and a scale-in
    const v = u.view; if (!v) return; const x = v.home.x, z = v.home.z, b = bodyOf(u);
    groundRing(x, z, 0xc8a070, b.w * 1.1, 0.7); burst(x, 0.3, z, 0xb89868, 10, 3, 0.7); v.group.scale.setScalar(0.05);
    const t0 = performance.now();
    const tick = () => { const k = Math.min(1, (performance.now() - t0) / 520), e = 1 + 2.6 * Math.pow(k - 1, 3) + 1.6 * Math.pow(k - 1, 2); v.group.scale.setScalar(Math.max(0.05, e)); if (k < 1) setTimeout(tick, 16); else v.group.scale.setScalar(1); };
    tick();
  }
  function phaseFx(e) {
    const u = e.tgt, v = u.view; if (!v) return null; const arena = E.arena && E.arena(), n = u.phaseNo || 2, col = elColor(u);
    groundRing(v.home.x, v.home.z, col, bodyOf(u).w * 2.2 + 3, 1.0); groundRing(v.home.x, v.home.z, 0xffffff, bodyOf(u).w * 1.4 + 2, 0.7);
    if (u.arenaFx === "sunEater" && arena) { arena.sky([0, 0.28, 0.55, 0.78, 0.92][Math.min(4, Math.max(0, n - 1))]); arena.flashNow && arena.flashNow(0xffd090, 0.9); }
    else if (arena && arena.flashNow) arena.flashNow(col, 0.5);
    if (u.arenaFx === "flood" && arena) arena.flood(true);
    return null;
  }

  // ---------- public API ----------
  function begin(env) { E = env; T = env.THREE; live.length = 0; E.lastFlood = undefined; E.lastStorm = undefined; E.units().forEach(u => safe(attach, u)); }
  function update(dt, t) {
    if (!E) return; const ctx = E.ctx(), arena = E.arena && E.arena();
    E.units().forEach(u => { if (u.view) safe(() => { updateUnit(u, dt, t, ctx); pollStates(u, dt, t, ctx); }); });
    if (arena && ctx) { const fl = !!ctx.flood, st = !!ctx.storm; if (fl !== E.lastFlood) { E.lastFlood = fl; arena.flood && arena.flood(fl); } if (st !== E.lastStorm) { E.lastStorm = st; arena.stormOn = st; } }
    for (let i = live.length - 1; i >= 0; i--) { const f = live[i]; f.t += dt; const k = Math.min(1, f.t / f.dur); safe(f.fn, f.obj, k, dt); if (k >= 1) { f.parent.remove(f.obj); if (f.obj.geometry) f.obj.geometry.dispose(); live.splice(i, 1); } }
  }
  function event(e) {
    if (!E || !e) return null;
    return safe(() => {
      if (e.t === "phase" && e.tgt) return phaseFx(e);
      if (e.t === "ko" && e.tgt) { shatterCollar(e.tgt); return null; }
      if (e.t === "held" && e.tgt) { E.float && E.float(e.tgt, "HELD", "#d8c8ff"); return null; }
      if (e.t === "steal" && e.tgt) { E.float && E.float(e.tgt, "STOLEN", "#ffd890"); return null; }
      if (e.t === "mark" && e.tgt) { const fx = e.tgt.view && e.tgt.view.fx; if (fx) fx.markUntil = performance.now() / 1000 + 6; E.float && E.float(e.tgt, "MARKED", "#ff7a6a"); return null; }
      if (e.t === "pull" && e.src && e.src.view) { groundRing(e.src.view.home.x, e.src.view.home.z, 0xffd070, 5, 0.7); return null; }
      return null;
    });
  }
  function end() { if (E) { live.forEach(f => f.parent.remove(f.obj)); live.length = 0; E.units().forEach(u => { const fx = u.view && u.view.fx; if (fx && fx.thorns) tintUnit(u, false); }); } E = null; }
  // art that is not there yet (a new enemy whose figurine is still being made): a dark silhouette with its initial instead of a grey box
  function placeholder(u) {
    T = T || root.THREE; const nm = String(u.name || u.id || "?"), ini = (nm.replace(/^Thes+/i, "")[0] || "?").toUpperCase(), foe = u.side === "e";
    return ctex("ph" + (foe ? "e" : "p") + ini, 96, 128, (g, w, h) => {
      g.fillStyle = foe ? "#3a2630" : "#26323f"; g.strokeStyle = "#0a0608"; g.lineWidth = 4;
      g.beginPath(); g.ellipse(48, 84, 34, 38, 0, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.ellipse(48, 40, 24, 26, 0, 0, 7); g.fill(); g.stroke();
      g.fillStyle = foe ? "#ff8a5a" : "#8ad0ff"; g.beginPath(); g.arc(39, 38, 4, 0, 7); g.arc(57, 38, 4, 0, 7); g.fill();
      g.fillStyle = "rgba(255,255,255,.55)"; g.font = "bold 34px Georgia, serif"; g.textAlign = "center"; g.save(); g.translate(48, 100); if (foe) g.scale(-1, 1); g.fillText(ini, 0, 0); g.restore();   // foes are drawn mirrored (the art faces left), so their letter is mirrored first
    });
  }
  root.ArenaBoss = { begin, placeholder, attach: u => E && safe(attach, u), update, event, end, rise, groundRing, burst };
})(window);
