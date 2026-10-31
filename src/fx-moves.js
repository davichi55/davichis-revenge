// One animation per move (owner: FX). Sets FX3D.move(e, api) -> Promise | null. See BUILD_PLAN_2.md "FX API".
//
// ============================== HOW TO ADD A MOVE (the recipe format) ==============================
// A recipe is one entry in RECIPES keyed by Core.MOVES id:      RECIPES.myMove = [ step, step, ... ];
// or in the long form                                          RECIPES.myMove = { col: "fire", hit: 1, quiet: ["heal"], max: 1500, do: [ step, ... ] };
//   col    palette name (FX3D.lib.COL: fire water ice shock earth wind light dark nature poison phys heal gold blood ember stone bone brass steam rune shadow sand moss violet rose sun moon steel red)
//          or [main, accent] (names or 0xRRGGBB). Default = the element of the move (e.el); steps can override with their own col.
//   hit    what the damage events that follow add on each damaged unit: 0 = the full generic element look, 1 = a small spark in the move's colours (default),
//          2 = nothing, or a list of steps (played on that unit).
//   quiet  generic follow-ups to skip because the recipe already shows them: "heal" "buff" "debuff" "status".
//   max    safety cut-off in ms at 1x (default 1700; big enemy moves 2600).
// A step is ["verb", {options}] (or just "verb"), a number (wait that many ms at 1x), or ["par", [step, step, ...]] (run together, wait for all).
// Steps run one after another. A verb that flies or moves is waited for; one that only spawns sparkles returns at once, so put a number between steps to space them.
// Options every verb understands:  col (palette), s (size multiplier), ms (duration at 1x), n (count), at (ms delay first), go:1 (do not wait for it),
//   on ("src" the caster, "tgt" the first target, "tgts" all targets, "team" the caster's side, "foes" the other side, "all", "ally" the others on the caster's side), hf (height on the unit: 0 feet, 1 head).
// Enemy abilities have no recipe id: SIG["ability name in lower case"] holds exact names (boss signature moves), KEY holds [regex, recipe] rules on the name, and anything else falls back to the element.
// New moves without a recipe still get their own look: autoRecipe() picks a template from the move's data and varies it by a hash of the id.
//
// VERBS (all in V below; options in the code):
//  caster/target motion  dash leap hop spin rise fall lean rear crouch recoil jitter home squash knock tint
//  wind-ups              gather aura circle wings charge roar flare
//  travel                proj (shapes: orb fire ember ice bolt spear arrow feather rock glob drop bubble skull note leaf star wind sonic eye claw dart bone flask seed beam) stream beam lash chain bolt
//  impact on the target  slash claws bite hit spr ring crack spikes cage pillar blast look
//  from the sky/ground   rain meteor quake wave storm whirl vortex cloud
//  support / status      dome shield wall mark arrows emit ice web coil drain sun tails stonify
//  misc                  sfx shake scr pass
(function (root) {
  "use strict";
  const FX = root.FX3D; if (!FX || !FX.lib) { console.warn("fx-moves.js needs fx3d.js first"); return; }
  const L = FX.lib, { spawn, kill, setSize, prop, tween, sleep, at, sizeK, scrAng, aim, move3, home, tintUnit, ringAt, burst, flashAt, dustAt, LOOK, T, COL, EASE, rnd, irnd, pick, lerp, clamp, PI, TAU } = L;
  const V = {}, RECIPES = {}, SIG = {}, KEY = [];

  // ---------- helpers ----------
  const dur = (c, ms) => Math.max(0.02, ms * c.sf / 1000);
  const palOf = v => {
    if (v == null) return null;
    if (typeof v === "string") return COL[v] || null;
    if (typeof v === "number") return [v, 0xffffff];
    if (Array.isArray(v)) { const f = x => (typeof x === "string" ? (COL[x] || COL.phys)[0] : x); return [f(v[0]), v[1] == null ? 0xffffff : f(v[1])]; }
    return null;
  };
  const colOf = (c, o) => (o && palOf(o.col)) || c.col;
  function who(c, o, def) {
    if (o && Array.isArray(o.on)) return o.on.filter(u => u && u.view && u.view.group);
    switch ((o && o.on) || def || "tgts") {
      case "src": return [c.src];
      case "tgt": return [c.tgt];
      case "team": return c.mine;
      case "foes": return c.foes;
      case "all": return c.mine.concat(c.foes);
      case "ally": return c.mine.filter(u => u !== c.src);
      default: return c.tgts;
    }
  }
  const unitK = (c, p, o) => sizeK(p) * c.pk * ((o && o.s) || 1) * (1 + clamp(-p.z * 0.04, 0, 0.3));   // far units are drawn smaller by the camera: a little extra so the effect stays readable
  // where an effect leaves the caster: a little in front of it, at mouth/hand height
  function muzzle(c, o = {}) {
    const p = at(c.src, o.hf == null ? 0.58 : o.hf), f = (o.fwd == null ? 0.5 : o.fwd) * p.h * 0.5;
    return { x: p.x + c.fx * f + (o.dx || 0), y: p.y + (o.dy || 0), z: p.z, h: p.h, gx: p.gx, gz: p.gz };
  }
  // where a motion verb sends the caster
  function dest(c, o) {
    const s = c.src.view.group.position, hs = c.src.view.h, t = c.tgt, tp = t.view.group.position, ht = t.view.h, to = o.to || "tgt";
    if (to === "far") { const far = c.fx * Math.max(...c.foes.map(f => c.fx * f.view.group.position.x), c.fx * tp.x) + c.fx * 2.4; return { x: far, z: c.foes.length ? c.foes.reduce((a, f) => a + f.view.group.position.z, 0) / c.foes.length : tp.z }; }
    if (to === "centre") { const n = c.foes.length || 1; return { x: c.foes.reduce((a, f) => a + f.view.group.position.x, 0) / n - c.fx * 2.2, z: c.foes.reduce((a, f) => a + f.view.group.position.z, 0) / n }; }
    if (to === "front") { return { x: tp.x + c.fx * 1.4, z: tp.z + 0.4 }; }   // in front of an ally, toward the enemy
    if (to === "past") { return { x: tp.x - c.fx * -1.9, z: tp.z }; }
    const stop = o.stop != null ? o.stop : (hs + ht) * 0.5 * (o.reach || 1) + 0.5, side = Math.sign(s.x - tp.x) || -c.fx;   // stand beside the target, on the caster's side, at about its depth
    return { x: tp.x + side * stop, z: lerp(s.z, tp.z, 0.85) };
  }
  const markMoved = (c, us) => us.forEach(u => c.moved.add(u));
  let sfxSet = null;
  function sfxHas(k) {
    if (sfxSet === null) { sfxSet = {}; try { const A = root.Audio; if (A && A.manifest) A.manifest(m => { Object.keys(m || {}).forEach(x => { if (m[x] && m[x].type === "sfx") sfxSet[x] = 1; }); }); } catch (e) { /* no audio */ } }
    return !!sfxSet[k];
  }
  const snd = (c, k, fb) => { try { c.api.sfx(sfxHas(k) ? k : fb || null); } catch (e) { /* audio must never break a fight */ } };
  const trailAt = (c, x, z, col, n = 1, s = 0.5) => dustAt(x, z, n, col, s, 0.3);

  // ---------- caster / target motion ----------
  V.dash = (c, o) => {   // run at the target (o.to: tgt | far | centre | front | past), o.stop = distance to keep, o.lean, o.hop
    const us = who(c, o, "src"), sec = dur(c, o.ms || 200), d = dest(c, o), tr = o.trail !== 0, col = o.dust ? palOf(o.dust)[0] : 0xd8c0a0;
    markMoved(c, us);
    const ps = us.map(u => move3(u, { x: d.x + (o.dx || 0), z: d.z, y: o.y || 0 }, sec, { lean: -c.fx * (o.lean == null ? 0.28 : o.lean), arc: o.hop || 0, ease: o.ease || EASE.in2 }));
    if (tr) { const u = us[0], g = u.view.group.position; let acc = 0, px = g.x; ps.push(tween(sec, (k, kk, dt) => { acc += dt * 60; const dx = g.x - px; px = g.x; while (acc >= 1) { acc--; spawn({ x: g.x - dx * 2, y: u.view.h * rnd(0.2, 0.7), z: g.z + 0.3, tex: "streak", col: palOf(o.col) ? palOf(o.col)[1] : 0xffffff, rot: c.fx < 0 ? PI : 0, sx: 2.2, sy: 0.5, size: 0.5, life: 0.18, a: 0.5, drag: 0 }); if (Math.random() < 0.5) trailAt(c, g.x, g.z, col, 1, 0.5); } }, null)); }
    return Promise.all(ps);
  };
  V.leap = (c, o) => {   // jump in an arc toward the target (o.h = height, o.spin = turns)
    const us = who(c, o, "src"), d = dest(c, o); markMoved(c, us);
    return Promise.all(us.map(u => move3(u, { x: d.x, z: d.z, y: 0 }, dur(c, o.ms || 400), { arc: o.h || 3, lean: -c.fx * (o.lean == null ? 0.2 : o.lean), spin: o.spin || 0, ease: EASE.lin })));
  };
  V.hop = async (c, o) => {   // hop on the spot n times
    const us = who(c, o, "src"); markMoved(c, us);
    for (let i = 0; i < (o.n || 1); i++) await Promise.all(us.map(u => move3(u, {}, dur(c, o.ms || 220), { arc: o.h || 0.7, lean: o.lean == null ? undefined : -c.fx * o.lean, ease: EASE.lin })));
  };
  V.spin = (c, o) => { const us = who(c, o, "src"); markMoved(c, us); return Promise.all(us.map(u => move3(u, {}, dur(c, o.ms || 320), { spin: o.n || 1, arc: o.lift || 0, ease: o.ease || EASE.io }))); };
  V.rise = (c, o) => { const us = who(c, o, "src"); markMoved(c, us); return Promise.all(us.map(u => move3(u, { y: o.h || 2 }, dur(c, o.ms || 300), { lean: o.tilt == null ? undefined : -c.fx * o.tilt, ease: EASE.out }))); };
  V.fall = (c, o) => { const us = who(c, o, "src"); markMoved(c, us); return Promise.all(us.map(u => move3(u, { y: 0 }, dur(c, o.ms || 140), { ease: EASE.in }))); };
  V.lean = (c, o) => { const us = who(c, o, "src"); markMoved(c, us); return Promise.all(us.map(u => move3(u, {}, dur(c, o.ms || 120), { lean: -c.fx * (o.a == null ? 0.3 : o.a), ease: EASE.out }))); };
  V.rear = (c, o) => { const us = who(c, o, "src"); markMoved(c, us); return Promise.all(us.map(u => move3(u, { y: o.h == null ? 0.4 : o.h }, dur(c, o.ms || 240), { lean: c.fx * (o.a == null ? 0.38 : o.a), ease: EASE.out }))); };
  V.crouch = (c, o) => { const us = who(c, o, "src"); markMoved(c, us); return Promise.all(us.map(u => move3(u, {}, dur(c, o.ms || 150), { sy: o.sy || 0.78, lean: o.lean == null ? undefined : -c.fx * o.lean, ease: EASE.out }))); };
  V.recoil = (c, o) => { const us = who(c, o, "src"); markMoved(c, us); return Promise.all(us.map(u => move3(u, { x: u.view.group.position.x - c.fx * (o.d || 0.6) }, dur(c, o.ms || 140), { ease: EASE.out }))); };
  V.home = (c, o) => { const us = who(c, o, "src"); return Promise.all(us.map(u => home(u, dur(c, o.ms || 160)))); };
  V.jitter = (c, o) => {   // tremble
    const us = who(c, o, "src"); markMoved(c, us);
    return Promise.all(us.map(u => { const v = u.view, g = v.group, x0 = g.position.x, y0 = g.position.y, z0 = g.position.z, tok = (v.fxm = (v.fxm || 0) + 1), amp = o.amp || 0.08; return tween(dur(c, o.ms || 300), () => { if (v.fxm !== tok) return; g.position.set(x0 + rnd(-amp, amp), y0 + Math.abs(rnd(-amp, amp)) * 0.5, z0 + rnd(-amp, amp) * 0.4); }).then(() => { if (v.fxm === tok) g.position.set(x0, y0, z0); }); }));
  };
  V.squash = (c, o) => { const us = who(c, o, "tgts"); markMoved(c, us); return Promise.all(us.map(u => move3(u, {}, dur(c, o.ms || 120), { sy: o.sy || 0.62, ease: EASE.out }))); };
  V.knock = (c, o) => {   // the target is shoved back (and returns when the move ends)
    const us = who(c, o, "tgts"); markMoved(c, us);
    return Promise.all(us.map(u => { const g = u.view.group.position; return move3(u, { x: g.x - c.fx * -(o.d || 0.9), y: 0 }, dur(c, o.ms || 150), { arc: o.hop || 0.3, lean: c.fx * 0.25, spin: o.spin || 0, ease: EASE.out }); }));
  };
  V.tint = (c, o) => { const us = who(c, o, "src"), col = colOf(c, o)[0], p = Promise.all(us.map(u => tintUnit(u, col, dur(c, o.ms || 500), o.amt || 0.6))); return p; };

  // ---------- wind-ups on the caster ----------
  V.gather = (c, o) => {   // motes rush in from all sides (o.tex, o.r, o.hf)
    const [a, b] = colOf(c, o), us = who(c, o, "src"), sec = dur(c, o.ms || 300), n = Math.round((o.n || 14) * c.pk);
    us.forEach(u => {
      const p = at(u, o.hf == null ? 0.5 : o.hf), k = sizeK(p) * (o.s || 1);
      if (o.ring !== 0) ringAt(p.gx, p.gz, a, 2.2 * k, sec * 1.1, 0.8);
      for (let i = 0; i < n; i++) { const ang = rnd(0, TAU), r = rnd(1.2, 2) * k * (o.r || 1); spawn({ x: p.x + Math.cos(ang) * r, y: p.y + rnd(-0.8, 1) * k, z: p.z + Math.sin(ang) * r * 0.5, vx: -Math.cos(ang) * r / sec, vy: rnd(-0.5, 0.5), vz: -Math.sin(ang) * r * 0.5 / sec, col: i % 2 ? a : b, tex: o.tex || (i % 3 ? "dot" : "star"), size: rnd(0.12, 0.24) * (o.size || 1), life: sec, drag: 0 }); }
      spawn({ x: p.x, y: p.y, z: p.z, col: a, size: 1.2 * k, grow: 0.4, life: sec * 0.5, delay: sec * 0.7, drag: 0, a: 0.7 });
    });
    return sleep(sec);
  };
  V.aura = (c, o) => {   // rising motes around the unit for a while (o.tex, o.vy, o.r, o.rate)
    const [a, b] = colOf(c, o), us = who(c, o, "src"), sec = dur(c, o.ms || 600); let acc = 0;
    return tween(sec, (k, kk, dt) => { acc += dt * (o.rate || 40) / Math.max(0.5, c.sf); while (acc >= 1) { acc--; us.forEach(u => { const p = at(u, 0), s = sizeK(p) * (o.s || 1), ang = rnd(0, TAU), r = rnd(0.4, 1) * (o.r || 0.9) * s;
      spawn({ x: p.x + Math.cos(ang) * r, y: p.gy + rnd(0, p.h * 0.8), z: p.z + Math.sin(ang) * r * 0.6, vy: o.vy == null ? rnd(1.2, 2.4) : o.vy + rnd(-0.3, 0.3), col: pick([a, b]), tex: o.tex || "dot", size: rnd(0.12, 0.24) * (o.size || 1), life: rnd(0.5, 0.9), drag: 0.5, spin: o.spin || 0, grow: o.grow || 0, a: o.a }); }); } });
  };
  V.circle = (c, o) => {   // a magic circle on the ground that turns and fades
    const [a, b] = colOf(c, o), us = who(c, o, "src"), sec = dur(c, o.ms || 700);
    us.forEach(u => { const p = at(u, 0), s = unitK(c, p, o);
      prop("plane", { map: T.glyph, col: a, a: 0.85, p: [p.gx, 0.07, p.gz], r: [-PI / 2, 0, 0], r1: [-PI / 2, 0, o.turn == null ? 2.2 : o.turn], s: [1.2 * s, 1.2 * s, 1], s1: [3.6 * s, 3.6 * s, 1], life: sec, fo: 0.5, e: EASE.out });
      prop("plane", { map: T.glyph, col: b, a: 0.55, p: [p.gx, 0.075, p.gz], r: [-PI / 2, 0, 0], r1: [-PI / 2, 0, -(o.turn == null ? 2.2 : o.turn) * 1.4], s: [0.8 * s, 0.8 * s, 1], s1: [2.4 * s, 2.4 * s, 1], life: sec, fo: 0.5, e: EASE.out }); });
  };
  V.wings = (c, o) => {   // two wings that flap open and shut at the shoulders
    const [a, b] = colOf(c, o), us = who(c, o, "src"), sec = dur(c, o.ms || 420), flaps = o.flaps || 2;
    const ws = us.map(u => { const p = at(u, 0.7), s = sizeK(p) * (o.s || 1); return { u, s, pair: [-1, 1].map(sd => spawn({ tex: o.tex || "wing", x: p.x, y: p.y, z: p.z, col: sd < 0 ? b : a, size: 1.05 * s, sx: -sd, sy: 0.75, life: sec + 0.2, drag: 0, a: 0.95 })) }; });
    return tween(sec, (k, kk) => ws.forEach(({ u, s, pair }) => {
      const p = at(u, 0.7), fl = Math.sin(kk * flaps * TAU - 0.6) * 0.5 + 0.5, env = Math.min(1, kk * 6, (1 - kk) * 6);
      pair.forEach((w, i) => { const sd = i ? 1 : -1, th = (-0.35 + fl * 1.0) * sd * -1, ox = 0.45 * 1.05 * SZ * s * 0.5, oy = 0.44 * 0.75 * 1.05 * SZ * s * 0.5; // the sprite centre sits off the shoulder; swing it round the shoulder
        const cx = sd * ox, cy = oy, cs = Math.cos(th), sn = Math.sin(th); w.s.position.set(p.x + (cx * cs - cy * sn) * env, p.y + (cx * sn + cy * cs) * env, p.z + 0.1); w.s.material.rotation = th; });
    })).then(() => ws.forEach(w => w.pair.forEach(kill)));
  };
  const SZ = L.SIZE;
  V.charge = (c, o) => {   // an orb grows at the muzzle
    const [a, b] = colOf(c, o), sec = dur(c, o.ms || 300), m0 = muzzle(c, o), s = (o.s || 1) * c.pk * sizeK(m0);
    const halo = spawn({ x: m0.x, y: m0.y, z: m0.z, col: a, size: 0.1, life: 30, drag: 0, a: 0.6 }), core = spawn({ x: m0.x, y: m0.y, z: m0.z, col: 0xffffff, size: 0.05, life: 30, drag: 0 });
    return tween(sec, (k, kk, dt) => { const m = muzzle(c, o); [halo, core].forEach(p => p && p.s.position.set(m.x, m.y, m.z)); setSize(halo, lerp(0.1, 0.95, k) * s); setSize(core, lerp(0.05, 0.45, k) * s);
      if (Math.random() < 0.6) { const ang = rnd(0, TAU), r = rnd(0.8, 1.4) * s; spawn({ x: m.x + Math.cos(ang) * r, y: m.y + Math.sin(ang) * r, z: m.z, vx: -Math.cos(ang) * r / 0.2, vy: -Math.sin(ang) * r / 0.2, col: pick([a, b]), size: 0.14, life: 0.2, drag: 0 }); } }, EASE.in2).then(() => { kill(halo); kill(core); });
  };
  V.roar = (c, o) => {   // sound rings leave the mouth and the screen shakes
    const [a, b] = colOf(c, o), n = o.n || 3, m = muzzle(c, o), s = (o.s || 1) * c.pk * sizeK(m);
    for (let i = 0; i < n; i++) spawn({ x: m.x + c.fx * i * 0.15, y: m.y, z: m.z + 0.3, tex: "ring", col: i % 2 ? b : a, size: 0.5 * s, grow: 5 * (1 + i * 0.2), life: 0.55, delay: i * 0.09 * c.sf, drag: 0, a: 0.9, fi: 0.1 });
    c.api.shake(o.shake == null ? 0.1 : o.shake);
  };
  V.flare = (c, o) => { const [a, b] = colOf(c, o); who(c, o, "src").forEach(u => { const p = at(u, o.hf == null ? 0.55 : o.hf), s = unitK(c, p, o); flashAt(p, b, 1.8 * s, 0.2); spawn({ x: p.x, y: p.y, z: p.z, tex: "star", col: a, size: 1.4 * s, grow: 0.6, life: 0.3, add: true, drag: 0, spin: 2 }); }); };

  // ---------- travel ----------
  // projectile shapes: tex, size, sx/sy stretch, al (rotation offset when it points along its flight), halo / core (sizes relative), spin (rad/s), wob (wobble), arc (lob height), white (keep the texture white), tr (trail)
  const SH = {
    orb:    { tex: "dot", size: 0.42, halo: 2.2, core: 0.55, tr: { rate: 55, size: 0.2, life: 0.3, grow: -0.7 } },
    fire:   { tex: "flame", size: 0.85, sx: 0.85, al: PI / 2, halo: 1.5, tr: { tex: "flame", rate: 38, size: 0.5, life: 0.42, vy: 1.3, grow: -0.6, c2: 1 } },
    ember:  { tex: "flame", size: 0.5, al: PI / 2, tr: { tex: "dot", rate: 60, size: 0.12, life: 0.35, vy: 1, c2: 1 } },
    ice:    { tex: "shard", size: 0.95, sx: 0.55, al: -PI / 2, tr: { tex: "snow", rate: 36, size: 0.2, life: 0.5, spin: 3, c2: 1 } },
    bolt:   { tex: "streak", size: 1.1, sx: 2.2, sy: 0.7, al: 0, core: 0.35, tr: { rate: 40, size: 0.16, life: 0.2, c2: 1 } },
    spear:  { tex: "streak", size: 1.3, sx: 3.2, sy: 0.7, al: 0, tr: { tex: "streak", rate: 24, size: 0.7, sx: 2, sy: 0.4, life: 0.15, a: 0.5 } },
    arrow:  { tex: "streak", size: 0.95, sx: 2.6, sy: 0.55, al: 0, tr: { rate: 16, size: 0.1, life: 0.2 } },
    dart:   { tex: "streak", size: 0.6, sx: 2.2, sy: 0.6, al: 0, tr: { tex: "drop", rate: 24, size: 0.1, life: 0.4, g: 5, c2: 1 } },
    feather:{ tex: "feather", size: 0.9, sx: 0.55, al: -PI / 2, wob: 0.3, tr: { tex: "feather", rate: 12, size: 0.3, life: 0.8, g: 2, spin: 4, a: 0.6, c2: 1 } },
    rock:   { tex: "rock", size: 1.0, spin: 9, arc: 2.4, tr: { tex: "smoke", rate: 34, size: 0.6, life: 0.5, grow: 1, a: 0.35, col: 0xb8a080 } },
    bone:   { tex: "shard", size: 0.8, sx: 0.5, spin: 12, arc: 1.6, tr: { tex: "smoke", rate: 24, size: 0.4, life: 0.4, grow: 1, a: 0.3, col: 0xeee6d0 } },
    glob:   { tex: "dot", size: 0.6, halo: 1.5, wobS: 0.25, arc: 1.4, tr: { tex: "drop", rate: 36, size: 0.16, life: 0.6, g: 8, c2: 1 } },
    drop:   { tex: "drop", size: 0.8, al: -PI / 2, arc: 1.2, tr: { tex: "drop", rate: 40, size: 0.16, life: 0.4, g: 6, c2: 1 } },
    flask:  { tex: "drop", size: 0.95, spin: 8, arc: 2.2, halo: 1.4, tr: { tex: "dot", rate: 30, size: 0.12, life: 0.4, c2: 1 } },
    bubble: { tex: "bubble", size: 0.8, wobS: 0.12, arc: 1.2, tr: { tex: "bubble", rate: 18, size: 0.14, life: 0.7, vy: 0.8, a: 0.7 } },
    skull:  { tex: "skull", size: 0.85, halo: 1.8, hc: 1, wob: 0.15, tr: { tex: "smoke", rate: 30, size: 0.5, life: 0.6, grow: 0.8, a: 0.4 } },
    note:   { tex: "note", size: 0.75, wob: 0.5, tr: { tex: "star", rate: 20, size: 0.14, life: 0.4, c2: 1 } },
    leaf:   { tex: "leaf", size: 0.65, spin: 10, wob: 0.3, tr: { tex: "leaf", rate: 16, size: 0.24, life: 0.7, g: 2, spin: 6, c2: 1 } },
    seed:   { tex: "dot", size: 0.35, halo: 1.8, arc: 1, tr: { tex: "leaf", rate: 22, size: 0.18, life: 0.5, g: 2, spin: 6, c2: 1 } },
    star:   { tex: "star", size: 0.8, spin: 7, tr: { tex: "star", rate: 40, size: 0.2, life: 0.4, c2: 1 } },
    wind:   { tex: "slash", size: 1.7, al: -PI / 2, sx: 0.8, tr: { tex: "streak", rate: 30, size: 0.7, sx: 2.4, sy: 0.35, life: 0.2, a: 0.6 } },
    sonic:  { tex: "slash", size: 1.6, al: -PI / 2, sx: 0.8, a: 0.9, tr: { tex: "ring", rate: 8, size: 0.4, life: 0.25, a: 0.4 } },
    eye:    { tex: "eye", size: 1.0, halo: 1.6, hc: 1, wob: 0.1, tr: { tex: "smoke", rate: 24, size: 0.4, life: 0.5, grow: 0.8, a: 0.35 } },
    claw:   { tex: "claw", size: 1.4, al: -PI / 2, tr: { tex: "streak", rate: 20, size: 0.6, sx: 2, sy: 0.4, life: 0.2, a: 0.5 } },
    beam:   { tex: "streak", size: 1.6, sx: 3.6, sy: 0.55, al: 0, core: 0.3, halo: 1.3, tr: { tex: "dot", rate: 70, size: 0.2, life: 0.25, c2: 1 } },
    letter: { tex: "envelope", size: 0.85, sy: 0.7, wob: 0.3, arc: 1.2, tr: { tex: "star", rate: 20, size: 0.14, life: 0.4, c2: 1 } },
    coin:   { tex: "coin", size: 0.6, spin: 14, arc: 1.4, tr: { tex: "star", rate: 24, size: 0.14, life: 0.4, c2: 1 } },
  };
  function fly(c, o, A, B, delay) {
    const sh = SH[o.shape || "orb"] || SH.orb, [col, col2] = colOf(c, o), sec = dur(c, o.ms || 320), sc = (o.s || 1) * c.pk, gen0 = L.gen;
    return (delay > 0 ? sleep(delay) : Promise.resolve()).then(() => {
      if (gen0 !== L.gen) return;
      const base = sh.size * sc, mk = (tex, colr, size, a, ro, sx, sy) => spawn({ x: A.x, y: A.y, z: A.z, tex, col: colr, size, sx, sy, life: 40, drag: 0, a, ro });
      const main = mk(sh.tex, sh.white ? 0xffffff : col, base, sh.a == null ? 1 : sh.a, 1003, sh.sx || 1, sh.sy || 1);
      const halo = sh.halo ? mk("dot", sh.hc ? col2 : col, base * sh.halo, 0.5, 1002) : null, core = sh.core ? mk("dot", 0xffffff, base * sh.core, 1, 1004) : null;
      const arc = (o.arc != null ? o.arc : sh.arc || 0), ph = rnd(0, 6.28), P = k => ({ x: lerp(A.x, B.x, k), y: lerp(A.y, B.y, k) + Math.sin(k * PI) * arc, z: lerp(A.z, B.z, k) });
      let acc = 0;
      return tween(sec, (k, kk, dt) => {
        const p = P(k); if (sh.wob) p.y += Math.sin(kk * 14 + ph) * sh.wob * sc * 0.5;
        [main, halo, core].forEach(q => q && q.s.position.set(p.x, p.y, p.z));
        if (sh.al != null) main.s.material.rotation = scrAng(p, P(Math.min(1, k + 0.04))) + sh.al + (sh.wob ? Math.sin(kk * 14 + ph) * 0.35 : 0);
        if (sh.spin) main.s.material.rotation += sh.spin * dt;
        if (sh.wobS) { const w = 1 + Math.sin(kk * 30 + ph) * sh.wobS; main.sx = w; main.sy = 2 - w; }
        const tr = sh.tr; if (tr) { acc += dt * tr.rate * c.pk; while (acc >= 1) { acc--; spawn({ x: p.x + rnd(-0.08, 0.08), y: p.y + rnd(-0.08, 0.08), z: p.z, vx: rnd(-0.3, 0.3), vy: (tr.vy || 0) + rnd(-0.3, 0.3), g: tr.g || 0, tex: tr.tex || "dot", col: tr.col != null ? tr.col : tr.c2 ? col2 : col, size: tr.size * rnd(0.7, 1.2) * sc, sx: tr.sx || 1, sy: tr.sy || 1, rot: tr.sx ? main.s.material.rotation : 0, life: tr.life, grow: tr.grow || 0, spin: tr.spin || 0, a: tr.a == null ? 0.9 : tr.a, drag: 1.5 }); } }
      }, o.ease || sh.ease || EASE.lin).then(() => { kill(main); kill(halo); kill(core); });
    });
  }
  V.proj = (c, o) => {   // a projectile (o.shape, o.n for a volley, o.spread, o.stagger ms, o.arc, o.from: "src" | "sky" | "ground")
    const tgts = who(c, o, "tgts"), n = o.n || 1, jobs = [], gap = (o.stagger == null ? 90 : o.stagger) * c.sf / 1000;
    tgts.forEach((t, ti) => { for (let i = 0; i < n; i++) {
      const m = muzzle(c, o), B = at(t, o.hf == null ? 0.5 : o.hf), spr = (o.spread == null ? (n > 1 ? 0.5 : 0) : o.spread) * unitK(c, B, {}), j = n > 1 ? (i - (n - 1) / 2) : 0;
      const A = o.from === "sky" ? { x: B.x + rnd(-1, 1), y: 11, z: B.z } : o.from === "ground" ? { x: B.x, y: -0.5, z: B.z } : { x: m.x, y: m.y + j * spr * 0.5, z: m.z };
      jobs.push(fly(c, o, A, { x: B.x + (n > 1 ? rnd(-0.3, 0.3) : 0), y: B.y + j * spr * 0.55, z: B.z }, gap * (ti * 0.6 + i)));
    } });
    return Promise.all(jobs);
  };
  V.stream = (c, o) => {   // a breath: a cone of particles from the mouth to the target (o.tex, o.rate, o.spread, o.grow)
    const [a, b] = colOf(c, o), sec = dur(c, o.ms || 500), tgts = who(c, o, "tgts"), t = tgts[0], rate = (o.rate || 90) * c.pk, spread = o.spread || 0.22; let acc = 0;
    return tween(sec, (k, kk, dt) => {
      const m = muzzle(c, o), B = at(t, o.hf == null ? 0.45 : o.hf), env = Math.min(1, kk * 5, (1 - kk) * 3 + 0.3); acc += dt * rate / Math.max(0.5, c.sf) * env;
      while (acc >= 1) { acc--; const tg = tgts.length > 1 ? at(pick(tgts), 0.45) : B, life = rnd(0.38, 0.55), dx = tg.x - m.x, dy = tg.y - m.y, dz = tg.z - m.z, sp = rnd(-spread, spread);
        spawn({ x: m.x, y: m.y + rnd(-0.1, 0.1), z: m.z, vx: dx / life * 0.95 + sp * 3, vy: dy / life * 0.95 + rnd(-spread, spread) * 3 + (o.up || 0), vz: dz / life * 0.95, tex: o.tex || "flame", col: Math.random() < 0.5 ? a : b, size: rnd(0.3, 0.6) * (o.size || 1) * c.pk, grow: o.grow == null ? 1.1 : o.grow, life, drag: 0, a: 0.85, g: o.g || 0, spin: o.spin || 0, rot: rnd(0, 6) }); }
    });
  };
  V.beam = (c, o) => {   // a continuous beam (o.kind: line | zig | wave | pulse), o.w width, o.up:1 = from the sky, o.hf
    const [a, b] = colOf(c, o), kind = o.kind || "line", sec = dur(c, o.ms || 420), w = (o.w || 1) * c.pk, tgts = who(c, o, "tgts"), N = kind === "line" ? 14 : 22;
    return tween(sec, (k, kk, dt) => {
      const A = o.up ? null : muzzle(c, o), env = Math.sqrt(Math.max(0, Math.sin(clamp(kk, 0, 1) * PI))), life = Math.max(dt * 1.7, 0.04);
      tgts.forEach((t, ti) => {
        const B = at(t, o.hf == null ? 0.5 : o.hf), S = A || { x: B.x + (o.dx || 0), y: 12, z: B.z };
        const dx = B.x - S.x, dy = B.y - S.y, dz = B.z - S.z, len = Math.hypot(dx, dy) || 1, px = -dy / len, py = dx / len;
        for (let i = 0; i <= N; i++) {
          const f = i / N, env2 = Math.sin(f * PI); let off = 0;
          if (kind === "zig") off = rnd(-0.4, 0.4) * env2 * w; else if (kind === "wave") off = Math.sin(f * 11 - kk * 38) * 0.28 * env2 * w; else if (kind === "pulse") off = 0;
          const x = S.x + dx * f + px * off, y = S.y + dy * f + py * off, z = S.z + dz * f;
          spawn({ x, y, z, col: a, size: 0.5 * w * env, life, drag: 0, a: 0.55 });
          spawn({ x, y, z, col: b, size: 0.22 * w * env, life, drag: 0, a: 0.95, ro: 1003 });
        }
        if (kind === "pulse") { const f = (kk * 3) % 1; spawn({ x: S.x + dx * f, y: S.y + dy * f, z: S.z + dz * f, col: 0xffffff, size: 0.9 * w, life, drag: 0, ro: 1004 }); }
        flashAt(B, b, 0.9 * w * env, life); if (A && ti === 0) flashAt(A, b, 0.7 * w * env, life);
        if (Math.random() < 0.7) spawn({ x: B.x + rnd(-0.3, 0.3), y: B.y + rnd(-0.4, 0.4), z: B.z, vx: rnd(-3, 3), vy: rnd(-1, 3), col: pick([a, b]), size: 0.1, life: 0.3, drag: 3 });
      });
    });
  };
  V.lash = (c, o) => {   // a whip: a curve from the caster that cracks straight at the target
    const [a, b] = colOf(c, o), sec = dur(c, o.ms || 220), t = c.tgt, h = (o.h == null ? 1.6 : o.h) * c.pk;
    return tween(sec, (k, kk, dt) => {
      const A = muzzle(c, o), B = at(t, 0.5), bend = (1 - kk) * h * (kk < 0.5 ? -1 : 1), reach = Math.min(1, kk * 2.2);
      for (let i = 0; i <= 26; i++) { const f = i / 26 * reach, x = lerp(A.x, B.x, f), y = lerp(A.y, B.y, f) + Math.sin(f * PI) * bend + Math.sin(f * 20 - kk * 30) * 0.12 * (1 - kk), z = lerp(A.z, B.z, f);
        spawn({ x, y, z, col: 0x1a1008, size: 0.5 * c.pk * (0.6 + f * 0.6), life: Math.max(dt * 2, 0.05), drag: 0, a: 0.5 }); spawn({ x, y, z, col: a, size: 0.42 * c.pk * (0.6 + f * 0.6), life: Math.max(dt * 2, 0.05), drag: 0, a: 0.95, ro: 1002 }); spawn({ x, y, z, col: b, size: 0.18 * c.pk, life: Math.max(dt * 2, 0.05), drag: 0, ro: 1003 }); }
      if (kk > 0.82) flashAt(B, 0xffffff, 0.9 * c.pk, 0.1);
    }, EASE.lin);
  };
  V.chain = (c, o) => {   // a chain of links between the caster and the target that hangs for o.hold ms
    const [a, b] = colOf(c, o), sec = dur(c, o.ms || 260), hold = dur(c, o.hold == null ? 250 : o.hold), t = c.tgt, links = [], N = o.links || 12;
    const A = muzzle(c, o), B = at(t, 0.5);
    for (let i = 0; i < N; i++) links.push(spawn({ tex: "chain", x: A.x, y: A.y, z: A.z, col: i % 2 ? a : b, size: 0.45 * c.pk, sx: 1.5, life: 30, drag: 0, a: 1, ro: 1002 }));
    return tween(sec + hold, (k, kk) => { const reach = Math.min(1, kk * (sec + hold) / sec); links.forEach((l, i) => { const f = (i + 0.5) / N * reach, sag = Math.sin(f * PI) * -0.5 * (1 - reach * 0.6) * c.pk;
      l.s.position.set(lerp(A.x, B.x, f), lerp(A.y, B.y, f) + sag, lerp(A.z, B.z, f)); l.a0 = i / N < reach ? 1 : 0; l.s.material.rotation = (i % 2 ? PI / 2 : 0) + scrAng(A, B); }); }).then(() => links.forEach(kill));
  };
  V.bolt = (c, o) => {   // lightning from the sky onto each target (o.n bolts, o.dx lean)
    const [a, b] = colOf(c, o), tgts = who(c, o, "tgts");
    tgts.forEach(t => { const B = at(t, 0.5), s = unitK(c, B, o);
      for (let k = 0; k < (o.n || 1); k++) { const x0 = B.x + (o.dx == null ? rnd(-1.5, 1.5) : o.dx), steps = 16; let jx = 0, prev = { x: x0, y: B.y + 6, z: B.z };
        for (let i = 1; i <= steps; i++) { const f = i / steps; jx = (jx + rnd(-0.55, 0.55)) * (1 - f * 0.45); const cur = { x: x0 + (B.x - x0) * f + jx * (1 - f), y: B.y + 6 * (1 - f), z: B.z };
          const ang = scrAng(prev, cur), len = Math.hypot(cur.x - prev.x, cur.y - prev.y) * 1.4;
          spawn({ x: (prev.x + cur.x) / 2, y: (prev.y + cur.y) / 2, z: B.z, tex: "dot", col: a, rot: ang, sx: len * 2.2, sy: 1.3, size: 0.4, life: 0.3, delay: k * 0.09 * c.sf, drag: 0, a: 0.75 });
          spawn({ x: (prev.x + cur.x) / 2, y: (prev.y + cur.y) / 2, z: B.z, tex: "dot", col: b, rot: ang, sx: len * 2.2, sy: 0.55, size: 0.4, life: 0.26, delay: k * 0.09 * c.sf, drag: 0, ro: 1003 }); prev = cur; } }
      flashAt(B, b, 1.4 * s, 0.14); ringAt(B.gx, B.gz, a, 2.4 * s, 0.4, 0.7); burst(B, [a, b], 12, 6, { size: 0.09, life: 0.35, drag: 6 }); });
    c.api.flash("#fffbe0", 110);
  };
  // ---------- extra textures (made on first use, once FX3D.init has built the base set) and small helpers ----------
  const mkTex = (name, w, h, draw) => { if (!T[name] && L.canvasTex) T[name] = L.canvasTex(w, h, draw); };
  let texDone = false;
  function extraTextures() {
    if (texDone || !T.dot || !L.canvasTex) return; texDone = true;
    mkTex("stripes", 128, 128, (g, w, h) => { g.fillStyle = "rgba(255,255,255,.2)"; g.fillRect(0, 0, w, h); g.strokeStyle = "#fff"; g.lineWidth = 9; for (let i = -2; i < 8; i++) { g.beginPath(); g.moveTo(i * 22, h); g.lineTo(i * 22 + 50, 0); g.stroke(); } });
    mkTex("bone", 64, 24, g => { g.fillStyle = "#fff"; g.fillRect(10, 8, 44, 8); [[8, 7], [8, 17], [56, 7], [56, 17]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 5, 0, TAU); g.fill(); }); });
    mkTex("hourglass", 32, 48, g => { g.fillStyle = g.strokeStyle = "#fff"; g.lineWidth = 3; g.fillRect(3, 2, 26, 4); g.fillRect(3, 42, 26, 4); g.beginPath(); g.moveTo(6, 6); g.lineTo(26, 6); g.lineTo(18, 24); g.lineTo(26, 42); g.lineTo(6, 42); g.lineTo(14, 24); g.closePath(); g.globalAlpha = 0.55; g.fill(); g.globalAlpha = 1; g.stroke(); });
    mkTex("envelope", 48, 34, g => { g.fillStyle = "#fff"; g.fillRect(2, 4, 44, 28); g.strokeStyle = "rgba(0,0,0,.55)"; g.lineWidth = 2; g.beginPath(); g.moveTo(2, 4); g.lineTo(24, 20); g.lineTo(46, 4); g.stroke(); g.fillStyle = "rgba(0,0,0,.4)"; g.beginPath(); g.arc(24, 20, 4, 0, TAU); g.fill(); });
    mkTex("bowl", 56, 36, g => { g.fillStyle = "#fff"; g.beginPath(); g.moveTo(2, 6); g.quadraticCurveTo(28, 46, 54, 6); g.closePath(); g.fill(); g.fillRect(0, 3, 56, 5); });
    mkTex("coin", 32, 32, g => { g.fillStyle = "#fff"; g.beginPath(); g.arc(16, 16, 14, 0, TAU); g.fill(); g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 3; g.beginPath(); g.arc(16, 16, 9, 0, TAU); g.stroke(); });
    mkTex("paw", 40, 40, g => { g.fillStyle = "#fff"; g.beginPath(); g.ellipse(20, 27, 11, 9, 0, 0, TAU); g.fill(); [[7, 14], [15, 7], [25, 7], [33, 14]].forEach(([x, y]) => { g.beginPath(); g.ellipse(x, y, 4.5, 5.5, 0, 0, TAU); g.fill(); }); });
    mkTex("flask", 32, 48, g => { g.fillStyle = "#fff"; g.beginPath(); g.moveTo(12, 2); g.lineTo(20, 2); g.lineTo(20, 16); g.lineTo(28, 42); g.quadraticCurveTo(16, 50, 4, 42); g.lineTo(12, 16); g.closePath(); g.fill(); g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(12, 2, 8, 5); });
    mkTex("rune", 48, 48, g => { g.strokeStyle = "#fff"; g.lineWidth = 4; g.lineCap = "round"; g.beginPath(); g.arc(24, 24, 19, 0, TAU); g.stroke(); g.beginPath(); g.moveTo(24, 9); g.lineTo(24, 39); g.moveTo(14, 18); g.lineTo(24, 24); g.lineTo(34, 18); g.moveTo(14, 32); g.lineTo(24, 26); g.lineTo(34, 32); g.stroke(); });
    mkTex("chev", 40, 40, g => { g.strokeStyle = "#fff"; g.lineWidth = 7; g.lineCap = g.lineJoin = "round"; for (const x of [6, 20]) { g.beginPath(); g.moveTo(x, 6); g.lineTo(x + 14, 20); g.lineTo(x, 34); g.stroke(); } });
    mkTex("hound", 48, 40, g => { g.fillStyle = "#fff"; g.beginPath(); g.moveTo(8, 34); g.lineTo(6, 14); g.lineTo(14, 5); g.lineTo(20, 12); g.lineTo(28, 12); g.lineTo(34, 5); g.lineTo(42, 14); g.lineTo(40, 34); g.quadraticCurveTo(24, 44, 8, 34); g.fill(); g.globalCompositeOperation = "destination-out"; g.beginPath(); g.arc(16, 22, 3, 0, TAU); g.arc(32, 22, 3, 0, TAU); g.fill(); g.beginPath(); g.moveTo(21, 30); g.lineTo(27, 30); g.lineTo(24, 35); g.fill(); });
    mkTex("shell", 48, 40, g => { g.fillStyle = "#fff"; g.beginPath(); g.moveTo(24, 36); g.lineTo(4, 14); g.quadraticCurveTo(24, -6, 44, 14); g.closePath(); g.fill(); g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 2; for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(24, 36); g.lineTo(24 + i * 9, 6 + Math.abs(i) * 2); g.stroke(); } });
  }
  const tx = (n, d) => (T[n] ? n : d || "dot");
  // run fn(p, k, unit, i) for each unit named by o.on (default the targets); p = a point on the unit (o.hf = height 0..1), k = size factor
  const each = (c, o, fn, def, hfDef) => who(c, o, def || "tgts").forEach((u, i) => { const p = at(u, o.hf == null ? (hfDef == null ? 0.5 : hfDef) : o.hf); if (p) fn(p, unitK(c, p, o), u, i); });
  const grnd = (c, o) => { const [a, b] = colOf(c, o); return { a, b }; };

  // ---------- impact on the target ----------
  V.slash = (c, o) => {   // crescent slashes (o.n, o.ang first angle in rad, o.da turn per slash, o.gap ms, o.tex)
    const [a, b] = colOf(c, o), n = o.n || 1, gap = dur(c, o.gap == null ? 80 : o.gap), flip = c.fx < 0 ? 1 : -1, tex = tx(o.tex || "slash");
    each(c, o, (p, k) => {
      for (let i = 0; i < n; i++) {
        const ang = o.ang != null ? o.ang + i * (o.da == null ? 1.1 : o.da) : (0.45 + (i % 2) * 2.3 + (i > 1 ? 0.3 : 0)) * flip, d = i * gap;
        spawn({ x: p.x, y: p.y, z: p.z + 0.4, tex, col: 0x1a1008, rot: ang, size: 1.1 * k, life: 0.3, grow: 0.45, a: 0.4, delay: d, drag: 0 });
        spawn({ x: p.x, y: p.y, z: p.z + 0.45, tex, col: a, rot: ang, size: 1.05 * k, life: 0.3, grow: 0.45, delay: d, drag: 0 });
        spawn({ x: p.x, y: p.y, z: p.z + 0.5, tex, col: b, rot: ang, size: 0.95 * k, sy: 0.6, life: 0.22, grow: 0.45, delay: d, drag: 0 });
        burst(p, [a, b], Math.round(5 * c.pk), 4.5, { size: 0.08, life: 0.3, drag: 5, delay: d });
      }
      flashAt(p, 0xffffff, 0.7 * k, 0.1);
    });
    return sleep(dur(c, o.ms || 120) + gap * (n - 1));
  };
  V.claws = (c, o) => {   // three claw rakes (o.n sets, o.ang)
    const [a, b] = colOf(c, o), n = o.n || 1, gap = dur(c, o.gap == null ? 90 : o.gap), flip = c.fx < 0 ? 1 : -1;
    each(c, o, (p, k) => {
      for (let i = 0; i < n; i++) {
        const ang = (o.ang != null ? o.ang : 0.5) * flip + i * 0.45 * (i % 2 ? 1 : -1), d = i * gap, off = (i - (n - 1) / 2) * 0.35 * k;
        spawn({ x: p.x + off, y: p.y, z: p.z + 0.4, tex: "claw", col: 0x1a1008, rot: ang, size: 1.3 * k, life: 0.34, grow: 0.3, a: 0.4, delay: d, drag: 0 });
        spawn({ x: p.x + off, y: p.y, z: p.z + 0.45, tex: "claw", col: a, rot: ang, size: 1.22 * k, life: 0.34, grow: 0.3, delay: d, drag: 0 });
        spawn({ x: p.x + off, y: p.y, z: p.z + 0.5, tex: "claw", col: b, rot: ang, size: 1.1 * k, sx: 0.8, life: 0.2, grow: 0.3, delay: d, drag: 0 });
        burst(p, [a, b], 5, 4, { size: 0.08, life: 0.3, drag: 5, delay: d });
      }
    });
    return sleep(dur(c, o.ms || 130) + gap * (n - 1));
  };
  V.bite = (c, o) => {   // two rows of fangs close on the target (o.teeth per row)
    const [a, b] = colOf(c, o), sec = dur(c, o.ms || 170), teeth = o.teeth || 3, jobs = [];
    each(c, o, (p, k) => {
      const rows = [];
      for (let r = 0; r < 2; r++) for (let i = 0; i < teeth; i++) rows.push({ r, q: spawn({ x: p.x + (i - (teeth - 1) / 2) * 0.42 * k, y: p.y + (r ? -1 : 1) * 1.6 * k, z: p.z + 0.45, tex: "fang", col: r ? b : a, size: 0.62 * k * (i % 2 ? 0.85 : 1), rot: r ? PI : 0, life: 30, drag: 0, ro: 1003 }) });
      jobs.push(tween(sec, kk => rows.forEach(w => { if (w.q) w.q.s.position.y = p.y + (w.r ? -1 : 1) * lerp(1.6, 0.18, kk) * k; }), EASE.in2).then(() => {
        rows.forEach(w => w.q && kill(w.q)); flashAt(p, 0xffffff, 0.9 * k, 0.1); burst(p, [a, b, 0xffffff], 9, 4, { size: 0.09, life: 0.35, drag: 5 });
      }));
    });
    return Promise.all(jobs);
  };
  V.hit = (c, o) => {   // a punch / smash / thump / pierce / pop on the target (o.kind, o.shake)
    const [a, b] = colOf(c, o), kind = o.kind || "punch";
    each(c, o, (p, k) => {
      if (kind === "punch") {
        spawn({ x: p.x, y: p.y, z: p.z + 0.5, tex: "fist", col: b, size: 0.95 * k, rot: c.fx < 0 ? 0.5 : -0.5, life: 0.28, grow: 0.5, drag: 0 });
        spawn({ x: p.x, y: p.y, z: p.z + 0.45, tex: "star", col: a, size: 1.4 * k, life: 0.22, grow: 0.8, spin: 3, drag: 0 });
        burst(p, [a, b], 8, 5, { size: 0.09, life: 0.3, drag: 5 });
      } else if (kind === "pierce") {
        for (let i = 0; i < 3; i++) spawn({ x: p.x - c.fx * 1.8, y: p.y + (i - 1) * 0.28 * k, z: p.z + 0.5, vx: c.fx * 16, tex: "streak", col: i === 1 ? 0xffffff : a, rot: c.fx < 0 ? PI : 0, sx: 2.4, sy: 0.45, size: 1.0 * k, life: 0.24, drag: 0, delay: i * 0.025 });
        flashAt(p, b, 0.9 * k, 0.12); burst(p, [a, b], 8, 5, { size: 0.08, life: 0.3, drag: 5 });
      } else if (kind === "smash") {
        flashAt(p, 0xffffff, 1.3 * k, 0.14); spawn({ x: p.x, y: p.y, z: p.z + 0.45, tex: "star", col: a, size: 1.7 * k, life: 0.28, grow: 0.8, spin: 2, drag: 0 });
        ringAt(p.gx, p.gz, a, 3.6 * k, 0.5, 0.85); dustAt(p.gx, p.gz, 8, 0xd8c0a0, 0.7 * k, 0.9);
        for (let i = 0; i < 9; i++) { const ang = rnd(0, TAU); spawn({ x: p.gx, y: 0.3, z: p.gz, vx: Math.cos(ang) * rnd(1.5, 4), vy: rnd(3, 6), vz: Math.sin(ang) * rnd(1, 2.5), g: 14, tex: "rock", col: i % 2 ? a : b, size: rnd(0.14, 0.3) * k, spin: rnd(-6, 6), life: rnd(0.6, 0.9), drag: 0.3 }); }
      } else if (kind === "thump") {
        ringAt(p.gx, p.gz, a, 3 * k, 0.5, 0.8); ringAt(p.gx, p.gz, b, 1.8 * k, 0.4, 0.7); dustAt(p.gx, p.gz, 7, 0xc8b898, 0.6 * k, 0.8); flashAt(p, b, 0.9 * k, 0.12);
      } else { spawn({ x: p.x, y: p.y, z: p.z + 0.45, tex: "star", col: a, size: 1.3 * k, life: 0.24, grow: 0.9, spin: 3, drag: 0 }); flashAt(p, b, 1.0 * k, 0.12); burst(p, [a, b], 10, 5, { size: 0.09, life: 0.35, drag: 5 }); }
    });
    if (o.shake != null || kind === "smash") c.api.shake(o.shake == null ? 0.2 : o.shake);
    return sleep(dur(c, o.ms || 100));
  };
  V.spr = (c, o) => {   // sprite(s) on the unit: tex n hf size/s ms rise grow spin rot a add pop bob spread stagger alt dy dx sx sy
    const [a, b] = colOf(c, o), n = o.n || 1, life = dur(c, o.ms || 600), tex = tx(o.tex || "star");
    each(c, o, (p, k) => {
      for (let i = 0; i < n; i++) {
        const dx = (n > 1 ? (o.spread == null ? 0.5 : o.spread) * k * (i - (n - 1) / 2) * 1.4 : 0) + (o.dx || 0) * k, dd = (o.stagger || 0) * i * c.sf / 1000, y0 = p.y + (o.dy || 0) * k;
        const q = spawn({ x: p.x + dx, y: y0, z: p.z + 0.4, vx: o.vx || 0, vy: o.rise || 0, tex, col: o.alt && i % 2 ? b : a, size: (o.size || 0.6) * k * (o.s || 1), rot: o.rot || 0, life, grow: o.grow || 0, spin: o.spin || 0, a: o.a, add: !!o.add, drag: 0, delay: dd, sx: (o.sx || 1) * (o.flip ? (c.fx < 0 ? -1 : 1) : 1), sy: o.sy, ro: o.ro });
        if (!q) continue;
        if (o.pop) { const s0 = q.size; q.size = 0.01; sleep(dd).then(() => tween(0.2, (kk) => { if (q.alive && q.life > 0.05) q.size = s0 * Math.max(0.01, kk); }, EASE.back)); }
        if (o.bob) { const t0 = dd; tween(life + dd, (kk, k2) => { if (q.alive && !o.rise) q.s.position.y = y0 + Math.sin(k2 * (life + dd) * 6) * o.bob * k; }); }
      }
    });
    return o.wait ? sleep(dur(c, o.wait)) : undefined;
  };
  V.ring = (c, o) => {   // ground rings under the unit(s) (o.n, o.r size, o.gap ms, o.ms life)
    const [a, b] = colOf(c, o), n = o.n || 1;
    each(c, o, (p, k) => { for (let i = 0; i < n; i++) prop("plane", { map: T.ring, col: i % 2 ? b : a, a: o.a == null ? 0.85 : o.a, p: [p.gx, 0.06 + i * 0.002, p.gz], r: [-PI / 2, 0, 0], s: 0.3 * k, s1: (o.r || 3) * k * (1 + i * 0.25), life: dur(c, o.ms || 500), delay: i * dur(c, o.gap == null ? 90 : o.gap), fo: 0.3 }); }, o.on || "tgts", 0);
    return n > 1 && o.wait !== 0 ? sleep(dur(c, (o.gap == null ? 90 : o.gap) * (n - 1))) : undefined;
  };
  V.crack = (c, o) => {   // cracks in the ground under the unit(s), or a fissure running from the caster to the target (o.line)
    const [a] = colOf(c, o), life = dur(c, o.ms || 800);
    each(c, o, (p, k) => {
      if (o.line) {
        const s = c.src.view.group.position, dx = p.gx - s.x, dz = p.gz - s.z, len = Math.hypot(dx, dz) || 1, ang = Math.atan2(-dz, dx);
        [[0x20120a, 0.18, 0.85, 1000], [a, 0.1, 0.95, 1001]].forEach(([col, th, al, ro]) => prop("plane", { map: T.fissure, col, a: al, r: [-PI / 2, 0, ang], s: 0.001, static: true, life, fi: 0.05, fo: 0.6, ro,
          upd: (q, kk) => { const Lc = len * Math.min(1, EASE.out(Math.min(1, kk * 4))); q.m.position.set(s.x + dx / len * Lc / 2, 0.055, s.z + dz / len * Lc / 2); q.m.scale.set(Lc, len * th, 1); } }));
      } else {
        const rz = rnd(0, 6);
        prop("plane", { map: T.crack, col: 0x20120a, a: 0.85, p: [p.gx, 0.055, p.gz], r: [-PI / 2, 0, rz], s: 0.5 * k, s1: (o.r || 3.2) * k, life, fi: 0.05, fo: 0.6, e: EASE.out });
        prop("plane", { map: T.crack, col: a, a: 0.85, p: [p.gx, 0.058, p.gz], r: [-PI / 2, 0, rz], s: 0.4 * k, s1: (o.r || 3.2) * 0.95 * k, life: life * 0.7, fi: 0.05, fo: 0.4, e: EASE.out, ro: 1000 });
      }
    }, o.on || "tgts", 0);
    return undefined;
  };
  V.spikes = (c, o) => {   // spikes erupt from the ground at the unit(s): o.kind stone | ice | thorn | bone | crystal | lava, o.n, o.h, o.w, o.ring (stand in a circle), o.spread
    const kind = o.kind || "stone", [a] = colOf(c, o), K = { stone: [0x6e6e78, 0x000000, "pyr"], ice: [0x7cc8e8, 0x14506a, "cone"], thorn: [0x3c7228, 0x081a04, "cone"], bone: [0xc8c0a8, 0x1a160c, "cone"], crystal: [0x8a50e0, 0x4a1a90, "pyr"], lava: [0xe05a14, 0xc02a00, "pyr"] }[kind] || [a, 0, "pyr"];
    const n = o.n || 6, life = dur(c, o.ms || 700);
    each(c, o, (p, k) => {
      for (let i = 0; i < n; i++) {
        const ang = (i / n) * TAU + rnd(-0.3, 0.3), r = (o.ring ? 1.1 : 0.2 + rnd(0, 0.9)) * k * (o.spread || 1), h = (o.h || 1.8) * k * rnd(0.7, 1.25), w = (o.w || 0.5) * k * rnd(0.8, 1.2), d = i * dur(c, 28);
        prop(o.geo || K[2], { lit: true, col: K[0], em: K[1], a: 0.95, p: [p.gx + Math.cos(ang) * r, 0, p.gz + Math.sin(ang) * r * 0.85], r: [rnd(-0.2, 0.2), 0, rnd(-0.3, 0.3) + Math.cos(ang) * 0.3], s: [w, 0.01, w], s1: [w, h, w], life, delay: d, fi: 0.02, fo: 0.7, e: EASE.back, depth: true });
      }
      ringAt(p.gx, p.gz, a, 2.6 * k, 0.5, 0.7); dustAt(p.gx, p.gz, 6, kind === "ice" ? 0xd8f4ff : 0xc8b898, 0.5 * k, 0.8);
    }, o.on || "tgts", 0);
    return sleep(dur(c, 140 + n * 28));
  };
  V.cage = (c, o) => {   // bars close around the unit: o.kind bars | ice | thorn | chain | light | bone | shadow, o.n, o.r, o.h, o.ms hold
    const kind = o.kind || "bars", [a] = colOf(c, o), n = o.n || 8, life = dur(c, o.ms || 800);
    const K = { bars: [0xa87a30, 0x201004, "cylc"], ice: [0x7cc8e8, 0x14506a, "cone"], thorn: [0x3c7228, 0x081a04, "cone"], chain: [0x6e6e78, 0x080810, "cylc"], light: [0xe8d890, 0xc09030, "cylc"], bone: [0xc8c0a8, 0x1a160c, "cone"], shadow: [0x4a2a6a, 0x1a0a2a, "cylc"] }[kind] || [a, 0, "cylc"];
    each(c, o, (p, k) => {
      const R = (o.r || 1.0) * k, H = (o.h || 1.0) * p.h * 1.05;
      for (let i = 0; i < n; i++) {
        const ang = i / n * TAU, w = ({ bars: 0.09, light: 0.09, shadow: 0.1, chain: 0.07 }[kind] || 0.16) * k;
        prop(K[2], { lit: true, col: K[0], em: K[1], a: 0.95, p: [p.gx + Math.cos(ang) * R, 0, p.gz + Math.sin(ang) * R], r: [0, 0, K[2] === "cone" ? Math.cos(ang) * 0.12 : 0], s: [w, 0.01, w], s1: [w, H, w], life, delay: i * dur(c, 22), fi: 0.02, fo: 0.75, e: EASE.out, depth: true });
      }
      prop("tor", { lit: true, col: K[0], em: K[1], a: 0.95, p: [p.gx, H, p.gz], r: [PI / 2, 0, 0], s: [R, R, R], s1: [R, R, R], life, delay: dur(c, n * 22), fi: 0.05, fo: 0.75, depth: true });
      ringAt(p.gx, p.gz, a, 2.4 * k, 0.5, 0.7);
    }, o.on || "tgts", 0);
    return sleep(dur(c, 160 + n * 22));
  };
  V.pillar = (c, o) => {   // a column of light / fire / water ... on the unit(s): o.fall (comes down from the sky), o.w width, o.h height, o.tex motes
    const [a, b] = colOf(c, o), life = dur(c, o.ms || 500), top = o.h || 11;
    each(c, o, (p, k) => {
      const w = (o.w || 1.2) * k, y0 = o.fall ? top : 0;
      prop("cyl", { col: a, a: 0.7, p: [p.gx, y0, p.gz], p1: [p.gx, 0, p.gz], s: [w * 0.4, o.fall ? 0.01 : top, w * 0.4], s1: [w, top, w], life, fi: 0.1, fo: 0.4, e: EASE.out });
      prop("cyl", { col: b, a: 0.95, p: [p.gx, y0, p.gz], p1: [p.gx, 0, p.gz], s: [w * 0.2, o.fall ? 0.01 : top, w * 0.2], s1: [w * 0.5, top, w * 0.5], life: life * 0.8, fi: 0.1, fo: 0.3, e: EASE.out, ro: 1000 });
      ringAt(p.gx, p.gz, a, 2.6 * k, 0.5, 0.8); flashAt(p, b, 1.6 * k, 0.2);
      for (let i = 0; i < 14; i++) spawn({ x: p.gx + rnd(-w, w) * 0.6, y: rnd(0, 1), z: p.gz, vy: rnd(2, 5), col: i % 2 ? a : b, tex: tx(o.tex || "star"), size: rnd(0.12, 0.26), life: rnd(0.5, 0.9), drag: 0.3 });
    });
    return sleep(dur(c, o.wait == null ? 220 : o.wait));
  };
  V.blast = (c, o) => {   // an explosion on the unit(s): o.kind fire | shock | dark | ice | water | poison | light | earth ..., o.p strength
    const kind = o.kind || "fire", [a, b] = palOf(o.col) || COL[kind] || c.col;
    each(c, o, (p, k) => {
      if (kind !== "blood") { prop("sph", { col: a, a: 0.8, p: [p.x, p.y, p.z], s: 0.25 * k, s1: 2.0 * k, life: 0.36, fi: 0.05, fo: 0.3, e: EASE.out });
        prop("sph", { col: b, a: 0.95, p: [p.x, p.y, p.z + 0.1], s: 0.15 * k, s1: 1.2 * k, life: 0.24, fi: 0.05, fo: 0.4, e: EASE.out, ro: 1000 }); }
      else spawn({ x: p.x, y: p.y, z: p.z + 0.4, tex: "star", col: a, size: 1.5 * k, life: 0.3, grow: 0.8, spin: 2, drag: 0 });
      ringAt(p.gx, p.gz, a, 4 * k, 0.55, 0.8); flashAt(p, 0xffffff, 2.4 * k, 0.16);
      if (LOOK[kind] && o.look !== 0) LOOK[kind](p, 0.7 * (o.p || 1) * c.pk * sizeK(p));
      else if (o.look !== 0) for (let i = 0; i < 16; i++) { const ang = rnd(0, TAU), sp = rnd(2, 5); spawn({ x: p.x, y: p.y, z: p.z, vx: Math.cos(ang) * sp, vy: Math.abs(Math.sin(ang)) * sp + 1, vz: Math.sin(ang) * sp * 0.4, g: 10, tex: kind === "blood" ? "drop" : "dot", col: i % 2 ? a : b, size: rnd(0.12, 0.26) * k, life: rnd(0.5, 0.9), drag: 0.4 }); }
    });
    if (o.shake !== 0) c.api.shake(o.shake == null ? 0.14 : o.shake);
    return sleep(dur(c, o.ms || 140));
  };
  V.shards = (c, o) => {   // pieces fly off the unit(s): o.tex (shard | rock | bone | leaf ...), o.n, o.speed, o.g
    const [a, b] = colOf(c, o), tex = tx(o.tex || "shard");
    each(c, o, (p, k) => { burst(p, [a, b, 0xffffff], Math.round((o.n || 14) * c.pk), (o.speed || 6) * Math.sqrt(k), { tex, sx: tex === "shard" ? 0.45 : 1, size: (o.size || 0.38) * k, spin: 8, g: o.g == null ? 9 : o.g, life: 0.8, drag: 0.8 }); });
    return sleep(dur(c, o.ms || 90));
  };
  V.look = (c, o) => {   // the generic element look of fx3d (o.kind = element, o.p strength)
    each(c, o, (p, k) => { const f = LOOK[o.kind || c.el] || LOOK.phys; f(p, (o.p || 1) * c.pk * sizeK(p)); });
    return sleep(dur(c, o.ms || 80));
  };
  // ---------- from the sky and the ground ----------
  // one point per unit, or (o.area) one point in the middle of all of them with a spread
  function spots(c, o, hfDef) {
    const pts = who(c, o, "tgts").map(u => at(u, o.hf == null ? (hfDef == null ? 0.5 : hfDef) : o.hf)).filter(Boolean);
    if (!o.area || pts.length < 2) return pts.map(p => Object.assign(p, { k: unitK(c, p, o), sp: 1 }));
    const n = pts.length, avg = key => pts.reduce((s, p) => s + p[key], 0) / n, m = { x: avg("x"), y: avg("y"), z: avg("z"), gx: avg("gx"), gz: avg("gz"), h: Math.max(...pts.map(p => p.h)), gy: 0 };
    m.sp = Math.max(...pts.map(p => Math.abs(p.x - m.x))) + 1.4; m.k = c.pk * (o.s || 1); return [m];
  }
  // what lands: a small puff at the end of a fall
  function landing(kind, x, z, col, col2, delay, k) {
    if (kind === "none") return;
    if (kind === "splash") { for (let i = 0; i < 3; i++) spawn({ x, y: 0.25, z, vx: rnd(-1.2, 1.2), vy: rnd(2, 3.5), g: 11, tex: "drop", col: i % 2 ? col2 : col, size: 0.14 * k, life: 0.45, delay, drag: 0.4 }); spawn({ x, y: 0.1, z, tex: "ring", col, size: 0.2, grow: 3.5, a: 0.7, life: 0.3, delay, drag: 0, fo: 0.9 }); }
    else if (kind === "spark") { spawn({ x, y: 0.4, z: z + 0.2, tex: "star", col: col2, size: 0.5 * k, grow: 0.6, life: 0.22, delay, drag: 0 }); }
    else if (kind === "ember") { for (let i = 0; i < 3; i++) spawn({ x, y: 0.2, z, vx: rnd(-1.5, 1.5), vy: rnd(1.5, 3), g: 8, col: i % 2 ? col : col2, size: 0.12 * k, life: 0.4, delay, drag: 0.5 }); spawn({ x, y: 0.4, z: z + 0.1, tex: "flame", col, size: 0.5 * k, life: 0.35, grow: -0.4, delay, drag: 0 }); }
    else spawn({ x, y: 0.3, z: z + 0.1, tex: "smoke", col: col2, size: 0.55 * k, grow: 1.4, a: 0.45, life: 0.5, delay, drag: 0 });
  }
  V.rain = (c, o) => {   // things fall onto the unit(s) (or one area): o.tex o.n o.ms o.spread o.size o.spin o.fall (ms of one fall) o.land splash|spark|ember|puff|none o.slant o.height
    const [a, b] = colOf(c, o), sec = dur(c, o.ms || 500), fallT = dur(c, o.fall || 280), n = Math.round((o.n || 14) * c.pk), tex = tx(o.tex || "drop"), H = o.height || 9, land = o.land || "puff";
    spots(c, o).forEach(p => {
      const sp = (o.spread == null ? 0.9 : o.spread) * p.k * p.sp * 1.2;
      for (let i = 0; i < n; i++) {
        const x = p.gx + rnd(-sp, sp), z = p.gz + rnd(-0.7, 0.7) * p.k, d = rnd(0, sec), y1 = o.hit == null ? p.y * 0.8 : p.y * o.hit, slant = o.slant || 0;
        const col = i % 2 ? b : a, big = (o.size || 0.3) * rnd(0.75, 1.25);
        spawn({ x: x - slant * fallT, y: H, z: z + 0.3, vx: slant, vy: -(H - y1) / fallT, tex, col, size: big * p.k, rot: o.rot != null ? o.rot : tex === "drop" ? 0 : rnd(0, 6), spin: (o.spin || 0) * (i % 2 ? 1 : -1), life: fallT, delay: d, drag: 0, fo: 0.08, a: o.a });
        landing(land, x, z, a, b, d + fallT, p.k);
      }
    });
    return sleep(sec + fallT * 0.8);
  };
  V.quake = (c, o) => {   // the ground heaves under the unit(s): rings, cracks, rocks, dust; o.hop (targets jump), o.shake, o.cracks
    const [a, b] = colOf(c, o), tg = who(c, o, "tgts"); c.api.shake(o.shake == null ? 0.3 : o.shake);
    each(c, o, (p, k, u, i) => {
      const d = i * 0.06 * c.sf;
      ringAt(p.gx, p.gz, a, 4.4 * k, 0.6, 0.8); prop("plane", { map: T.ring, col: b, a: 0.7, p: [p.gx, 0.062, p.gz], r: [-PI / 2, 0, 0], s: 0.3 * k, s1: 2.6 * k, life: 0.5, delay: 0.08, fo: 0.3 });
      if (o.cracks !== 0) { const rz = rnd(0, 6); prop("plane", { map: T.crack, col: 0x20120a, a: 0.85, p: [p.gx, 0.055, p.gz], r: [-PI / 2, 0, rz], s: 0.5 * k, s1: 3.4 * k, life: dur(c, 800), fi: 0.05, fo: 0.6, e: EASE.out }); }
      for (let j = 0; j < 11; j++) { const ang = rnd(0, TAU); spawn({ x: p.gx + Math.cos(ang) * 0.5 * k, y: 0.2, z: p.gz + Math.sin(ang) * 0.3 * k, vx: Math.cos(ang) * rnd(1, 3), vy: rnd(3, 6.5), vz: Math.sin(ang) * rnd(0.5, 1.8), g: 14, tex: "rock", col: j % 2 ? a : b, size: rnd(0.22, 0.5) * k, spin: rnd(-6, 6), life: rnd(0.7, 1.0), delay: d, drag: 0.3, a: 1 }); }
      dustAt(p.gx, p.gz, 10, 0xc8b090, 1.0 * k, 1.2);
    }, "tgts", 0);
    return o.hop === 0 ? sleep(dur(c, 160)) : V.hop(c, { on: o.on || "tgts", h: o.hopH || 0.7, ms: 230, n: 1 });
  };
  V.wave = (c, o) => {   // a wave / wall of water, fire, dark ... sweeps across the field toward the targets: o.kind, o.rows, o.ms, o.s size, o.land
    const kind = o.kind || "water", [a, b] = palOf(o.col) || COL[kind] || c.col, sec = dur(c, o.ms || 620), rows = o.rows || 3, tgs = who(c, o, "tgts");
    const sx0 = c.src.view.group.position.x, far = c.fx * Math.max(...tgs.map(u => c.fx * u.view.group.position.x)) + c.fx * 3.5, x0 = sx0 + c.fx * 1.5;
    const zs = tgs.map(u => u.view.group.position.z), zc = zs.reduce((s, z) => s + z, 0) / zs.length, zr = Math.max(1.5, Math.max(...zs) - Math.min(...zs));
    const size = 5.2 * (o.s || 1) * c.pk, jobs = [];
    for (let r = 0; r < rows; r++) {
      const z = zc + (rows > 1 ? (r / (rows - 1) - 0.5) * (zr + 3.5) : 0), delay = r * dur(c, 70), shade = r % 2 ? b : a;
      const w = spawn({ x: x0, y: size * 0.25 + (rows - r) * 0.1, z: z + 0.5, tex: "wave", col: shade, size, sx: c.fx < 0 ? -1 : 1, sy: 0.5, life: 40, drag: 0, a: 0.95, ro: 1000 + r, delay });
      jobs.push(sleep(delay).then(() => tween(sec, (k, kk, dt) => {
        if (!w) return; const x = lerp(x0, far, k); w.s.position.x = x;
        if (kind === "water" && Math.random() < 0.7) spawn({ x: x - c.fx * rnd(0, 1.2) * size * 0.2, y: size * rnd(0.2, 0.4), z: z + 0.6, vx: -c.fx * rnd(0, 2), vy: rnd(0.5, 2), g: 6, tex: "drop", col: b, size: rnd(0.12, 0.22), life: 0.5, drag: 0.5 });
        else if (kind === "fire" && Math.random() < 0.8) spawn({ x: x - c.fx * rnd(0, 1.2), y: size * rnd(0.15, 0.4), z: z + 0.6, vy: rnd(1, 2.5), tex: "flame", col: pick([a, b]), size: rnd(0.3, 0.55), life: 0.45, grow: -0.5, drag: 0.5 });
        else if (Math.random() < 0.6) spawn({ x: x - c.fx * rnd(0, 1.2), y: size * rnd(0.1, 0.4), z: z + 0.6, vy: rnd(0.3, 1.2), tex: kind === "light" || kind === "dark" ? "star" : "smoke", col: b, size: rnd(0.2, 0.5), life: 0.45, grow: 1, a: 0.5, drag: 0.5 });
      }, EASE.io).then(() => kill(w))));
    }
    return Promise.all(jobs).then(() => { each(c, o, (p, k) => { if (o.land !== 0) { if (kind === "water") LOOK.water(p, 0.8 * k); else lite(p, kind, 1, [a, b]); } }); });
  };
  const lite = (p, el, P, col) => { const [a, b] = col || COL[el] || COL.phys; flashAt(p, b, 0.9 * P, 0.12); burst(p, [a, b, 0xffffff], 7 * P, 3.5 * Math.sqrt(P), { size: 0.09, life: 0.35, drag: 5 }); };
  V.storm = (c, o) => {   // a cloud gathers over the unit(s) and rains / hails / snows / flashes: o.kind rain | hail | snow | thunder | dust | sparks, o.ms, o.area
    const kind = o.kind || "rain", sec = dur(c, o.ms || 700), [a, b] = colOf(c, o), cl = { rain: 0x5a6a80, hail: 0x8a96a8, snow: 0xe8f0ff, thunder: 0x3a3a52, dust: 0x9a8060, sparks: 0x4a4a62 }[kind] || 0x6a7080;
    spots(c, Object.assign({ area: 1 }, o), 0.5).forEach(p => {
      const sp = Math.max(2.2, p.sp * 1.6);
      for (let i = 0; i < 6; i++) spawn({ x: p.x + (i / 5 - 0.5) * sp * 2.2, y: 7.2 + (i % 2) * 0.7, z: p.z - 0.2, vx: (i % 2 ? 0.25 : -0.25), tex: "cloud", col: cl, size: 2.6 * (o.s || 1), sx: 1.5, sy: 0.9, life: sec + 0.35, a: 0.85, drag: 0, fi: 0.2, fo: 0.2, ro: 1001, delay: i * 0.03 });
    });
    const tex = { rain: "drop", hail: "rock", snow: "snow", thunder: "drop", dust: "dot", sparks: "star" }[kind];
    V.rain(c, Object.assign({ area: 1, tex, land: kind === "rain" || kind === "thunder" ? "splash" : kind === "hail" ? "puff" : kind === "sparks" ? "spark" : "puff", n: kind === "snow" ? 22 : 18, size: kind === "snow" ? 0.26 : kind === "hail" ? 0.2 : 0.22, spin: kind === "snow" ? 2 : kind === "hail" ? 5 : 0, fall: kind === "snow" ? 520 : 240, col: c.col, spread: 1 }, o, { ms: (o.ms || 700) * 0.85, at: undefined }));
    if (kind === "thunder" || kind === "sparks") sleep(sec * 0.35).then(() => V.bolt(c, { n: 1, col: o.bcol || "shock" }));
    return sleep(sec);
  };
  V.whirl = (c, o) => {   // a tornado / water spout on the unit(s): o.kind wind | water | fire | sand | dark | poison, o.w o.h o.ms o.rev
    const kind = o.kind || "wind", [a, b] = palOf(o.col) || COL[kind] || c.col, sec = dur(c, o.ms || 600), deb = { wind: "leaf", water: "drop", fire: "flame", sand: "rock", dark: "smoke", poison: "bubble", ice: "snow", light: "star" }[kind] || "dot";
    each(c, o, (p, k) => {
      const w = (o.w || 1.5) * k, h = (o.h || 3.4) * k, dir = o.rev ? -1 : 1;
      prop("funnel", { map: T.stripes, col: a, a: 0.55, p: [p.gx, 0, p.gz], s: [w * 0.5, h * 0.4, w * 0.5], s1: [w, h, w], r: [0, 0, 0], r1: [0, 13 * dir, 0], life: sec + 0.25, fi: 0.15, fo: 0.6, e: EASE.out });
      prop("funnel", { map: T.stripes, col: b, a: 0.4, p: [p.gx, 0, p.gz], s: [w * 0.3, h * 0.35, w * 0.3], s1: [w * 0.65, h * 0.9, w * 0.65], r: [0, 0, 0], r1: [0, -17 * dir, 0], life: sec + 0.2, fi: 0.15, fo: 0.6, e: EASE.out });
      for (let i = 0; i < 18; i++) spawn({ x: p.gx, y: rnd(0.2, h * 0.9), z: p.gz, vy: rnd(0.2, 1.6), tex: tx(deb), col: i % 2 ? a : b, size: rnd(0.14, 0.3) * k, spin: rnd(-8, 8), life: sec * rnd(0.6, 1), delay: rnd(0, sec * 0.3), drag: 0, orbit: { cx: p.gx, cz: p.gz, ang: rnd(0, TAU), r: rnd(0.4, 1) * w * 0.9, dr: 0.2, w: 11 * dir } });
      dustAt(p.gx, p.gz, 5, kind === "sand" ? 0xd8b878 : 0xd8d8d8, 0.7 * k, 0.8); ringAt(p.gx, p.gz, a, 2.8 * k, 0.5, 0.6);
    }, "tgts", 0);
    return sleep(sec);
  };
  V.vortex = (c, o) => {   // a spiral on the ground that pulls things in: o.kind water | dark | light, o.r, o.ms, o.sink (targets squash)
    const kind = o.kind || "water", [a, b] = palOf(o.col) || COL[kind] || c.col, sec = dur(c, o.ms || 600);
    each(c, o, (p, k) => {
      const R = (o.r || 3.4) * k;
      prop("plane", { map: T.spiral, col: a, a: 0.85, p: [p.gx, 0.07, p.gz], r: [-PI / 2, 0, 0], r1: [-PI / 2, 0, -9], s: R * 0.4, s1: R, life: sec, fi: 0.1, fo: 0.55, e: EASE.out });
      prop("plane", { map: T.spiral, col: b, a: 0.6, p: [p.gx, 0.075, p.gz], r: [-PI / 2, 0, 0], r1: [-PI / 2, 0, 7], s: R * 0.3, s1: R * 0.62, life: sec, fi: 0.1, fo: 0.55, e: EASE.out });
      for (let i = 0; i < 16; i++) spawn({ x: p.gx, y: rnd(0.1, 1.2) * k, z: p.gz, vy: rnd(0, 0.6), tex: kind === "water" ? "drop" : "dot", col: i % 2 ? a : b, size: rnd(0.12, 0.26) * k, life: sec * 0.9, delay: rnd(0, sec * 0.25), drag: 0, orbit: { cx: p.gx, cz: p.gz, ang: rnd(0, TAU), r: R * rnd(0.45, 0.6), dr: -R * 0.5 / sec, w: 8 } });
    }, "tgts", 0);
    return o.sink ? V.squash(c, { on: o.on || "tgts", sy: 0.8, ms: 300 }) : sleep(dur(c, 120));
  };
  V.cloud = (c, o) => {   // a drifting cloud of smoke / gas / spores over the unit(s) or the group (o.area): o.n o.ms o.mote (bubble | star | dot | skull ...) o.rise
    const [a, b] = colOf(c, o), sec = dur(c, o.ms || 700), n = Math.round((o.n || 9) * c.pk);
    spots(c, o, 0.45).forEach(p => {
      const sp = p.sp * p.k * 0.9;
      for (let i = 0; i < n; i++) spawn({ x: p.x + rnd(-1, 1) * sp, y: p.y + rnd(-0.7, 0.7) * p.k, z: p.z + rnd(-0.5, 0.5), vx: rnd(-0.3, 0.3), vy: o.rise == null ? rnd(0, 0.4) : o.rise, tex: "smoke", col: a, size: rnd(1.0, 1.8) * p.k * (o.size || 1), grow: 0.7, a: o.a == null ? 0.55 : o.a, life: sec * rnd(0.75, 1), delay: rnd(0, sec * 0.3), drag: 0.3 });
      for (let i = 0; i < Math.round(n * 0.8); i++) spawn({ x: p.x + rnd(-1, 1) * sp, y: p.y + rnd(-0.8, 0.8) * p.k, z: p.z + 0.2, vy: rnd(0.2, 1.1), tex: tx(o.mote || "bubble"), col: b, size: rnd(0.12, 0.26) * p.k, life: sec * rnd(0.6, 1), delay: rnd(0, sec * 0.4), drag: 0.3, spin: o.spin || 0 });
    });
    return sleep(sec * 0.7);
  };
  V.meteor = (c, o) => V.proj(c, Object.assign({ from: "sky", shape: "fire", s: 2.2, ms: 420, arc: 0 }, o)).then(() => V.blast(c, Object.assign({ kind: o.kind || "fire" }, o, { s: o.bs })));
  // ---------- support / status ----------
  V.dome = (c, o) => {   // a shield bubble over the unit(s), or one big dome over the group (o.area): o.ms, o.r
    const [a, b] = colOf(c, o), sec = dur(c, o.ms || 700);
    spots(c, o, 0.4).forEach(p => {
      const R = (Math.max(1.5, p.h * 0.6) * p.k + (p.sp > 1 ? p.sp * 0.9 : 0)) * (o.r || 1), rim = (S, al, col) => prop("tor", { col, a: al, p: [p.gx, 0.09, p.gz], r: [PI / 2, 0, 0], s: R * 0.7 * S, s1: R * S, life: sec, fi: 0.1, fo: 0.55, e: EASE.back });
      prop("hemi", { map: T.hex, col: a, a: 0.6, depth: true, p: [p.gx, 0, p.gz], s: [R * 0.7, R * 0.65, R * 0.7], s1: [R, R * 0.92, R], r: [0, 0, 0], r1: [0, 1.4, 0], life: sec, fi: 0.12, fo: 0.55, e: EASE.back });
      prop("hemi", { col: b, a: 0.26, depth: true, p: [p.gx, 0, p.gz], s: [R * 0.72, R * 0.68, R * 0.72], s1: [R * 1.03, R * 0.95, R * 1.03], life: sec, fi: 0.12, fo: 0.55, e: EASE.back });
      rim(1, 0.9, b); ringAt(p.gx, p.gz, a, 3 * p.k, 0.5, 0.7);
      for (let i = 0; i < 10; i++) spawn({ x: p.gx + Math.cos(i * 0.63) * R, y: 0.15, z: p.gz + Math.sin(i * 0.63) * R * 0.6, vy: rnd(0.5, 1.6), col: i % 2 ? a : b, tex: "star", size: rnd(0.1, 0.2), life: rnd(0.5, 0.9), delay: rnd(0, 0.3), drag: 0.4 });
    });
    return sleep(dur(c, 160));
  };
  V.wall = (c, o) => {   // blocks rise in an arc in front of the unit(s)/team: o.kind stone | brass | ice | light | thorn | earth, o.n, o.ms
    const kind = o.kind || "stone", [a] = colOf(c, o), K = { stone: [0x6e6e78, 0x000000], brass: [0x9a7028, 0x201004], ice: [0x7cc8e8, 0x14506a], light: [0xe8d890, 0xc09030], thorn: [0x3c7228, 0x081a04], earth: [0x8a5a30, 0x100802] }[kind] || [a, 0];
    const us = who(c, o, "team"), cx = us.reduce((s, u) => s + u.view.group.position.x, 0) / us.length, cz = us.reduce((s, u) => s + u.view.group.position.z, 0) / us.length;
    const front = c.fx * Math.max(...us.map(u => c.fx * (u.view.group.position.x - cx))), n = o.n || 7, R = (Math.abs(front) + 1.7) * (o.r || 1), life = dur(c, o.ms || 800), hh = (o.h || 2.2) * c.pk;
    for (let i = 0; i < n; i++) {
      const th = (i / (n - 1) - 0.5) * 2.3, x = cx + c.fx * Math.cos(th) * R, z = cz + Math.sin(th) * R * 1.05, w = 0.95 * c.pk, h = hh * rnd(0.85, 1.15), d = Math.abs(i - (n - 1) / 2) * dur(c, 45);
      prop("box", { lit: true, depth: true, col: K[0], em: K[1], a: 0.96, p: [x, 0, z], r: [0, -th * c.fx * 0.6 + (c.fx < 0 ? 0 : PI), 0], s: [w * 0.5, 0.01, w], s1: [w * 0.5, h, w], life, delay: d, fi: 0.02, fo: 0.75, e: EASE.back });
      dustAt(x, z, 2, 0xc8b898, 0.5, 0.4); ringAt(x, z, a, 1.4, 0.4, 0.6);
    }
    return sleep(dur(c, 160 + n * 45 / 2));
  };
  V.arrows = (c, o) => {   // up / down arrows climb or sink around the unit(s): o.dir up | down, o.n, o.ms
    const dir = o.dir === "down" ? -1 : 1, [a, b] = colOf(c, o), sec = dur(c, o.ms || 700), n = o.n || 6;
    each(c, o, (p, k) => {
      for (let i = 0; i < n; i++) spawn({ x: p.x + (i % 2 ? 1 : -1) * rnd(0.3, 0.9) * k, y: dir > 0 ? p.gy + 0.2 : p.gy + p.h * 0.95, z: p.z + 0.3, vy: dir * p.h * 0.9 / sec * 1.15, tex: "arrow", col: i % 3 === 0 ? b : a, rot: dir > 0 ? 0 : PI, size: 0.34 * k, life: sec * 0.8, delay: i * sec / n * 0.5, drag: 0, fo: 0.3 });
      ringAt(p.gx, p.gz, a, 2.1 * k, sec * 0.9, 0.55);
    }, "tgts", 0.5);
    return sleep(sec * 0.45);
  };
  V.ice = (c, o) => {   // ice grows round the unit(s): o.ms hold, o.shatter (shards burst at the end)
    const [a, b] = colOf(c, o), sec = dur(c, o.ms || 700);
    each(c, o, (p, k) => {
      const w = 0.95 * k, h = p.h * 0.62;
      prop("ico", { lit: true, depth: true, col: a, em: 0x1a5a7a, a: 0.5, p: [p.gx, p.gy + p.h * 0.5, p.gz], s: [w * 0.4, h * 0.4, w * 0.4], s1: [w, h, w], r: [0.2, 0.5, 0.1], life: sec, fi: 0.1, fo: 0.7, e: EASE.back });
      for (let i = 0; i < 7; i++) { const ang = i / 7 * TAU, r = 0.85 * k; prop("pyr", { lit: true, depth: true, col: i % 2 ? a : b, em: 0x1a5a7a, a: 0.85, p: [p.gx + Math.cos(ang) * r, 0, p.gz + Math.sin(ang) * r * 0.7], r: [Math.sin(ang) * 0.25, 0, -Math.cos(ang) * 0.3], s: [0.2 * k, 0.01, 0.2 * k], s1: [0.2 * k, p.h * rnd(0.35, 0.65), 0.2 * k], life: sec, delay: i * dur(c, 25), fi: 0.05, fo: 0.7, e: EASE.back }); }
      ringAt(p.gx, p.gz, b, 2.6 * k, 0.6, 0.7);
      for (let i = 0; i < 10; i++) spawn({ x: p.x + rnd(-1, 1) * k, y: p.gy + p.h * rnd(0.4, 1.1), z: p.z, vy: -rnd(0.3, 0.9), tex: "snow", col: b, size: rnd(0.12, 0.22), spin: 2, life: rnd(0.7, 1.1), drag: 0, delay: rnd(0, 0.3) });
      if (o.shatter) sleep(sec * 0.85).then(() => burst(p, [a, b, 0xffffff], 22, 7, { tex: "shard", sx: 0.4, size: 0.4, spin: 8, life: 0.7, g: 8, drag: 0.8 }));
    }, "tgts", 0.5);
    return sleep(dur(c, 220));
  };
  V.web = (c, o) => {   // a web wraps the unit(s)
    const [a, b] = colOf(c, o), sec = dur(c, o.ms || 800);
    each(c, o, (p, k) => {
      const q = spawn({ x: p.x, y: p.y, z: p.z + 0.5, tex: "web", col: a, size: p.h * 1.15 * (o.s || 1), life: sec, a: 0.85, drag: 0, rot: rnd(0, 1) });
      if (q) { const s0 = q.size; q.size = s0 * 0.3; tween(0.18, kk => { if (q.alive) q.size = lerp(s0 * 0.3, s0, kk); }, EASE.back); }
      prop("plane", { map: T.web, col: b, a: 0.6, p: [p.gx, 0.07, p.gz], r: [-PI / 2, 0, rnd(0, 1)], s: 0.5 * k, s1: 2.8 * k, life: sec, fi: 0.1, fo: 0.6, e: EASE.out });
    }, "tgts", 0.5);
    return sleep(dur(c, 160));
  };
  V.coil = (c, o) => {   // a snake coils round the unit(s) and tightens: o.n segments, o.turns, o.ms
    const [a, b] = colOf(c, o), sec = dur(c, o.ms || 650), n = o.n || 16, turns = o.turns || 2.1;
    each(c, o, (p, k) => {
      const R0 = 1.15 * k, R1 = 0.6 * k, H = p.h * 0.85;
      for (let i = 0; i < n; i++) {
        const f = i / (n - 1), ang = f * turns * TAU, y = p.gy + 0.2 + f * H, sz = 0.46 * k * (1 - 0.3 * f), d = f * sec * 0.55;
        prop("sph", { lit: true, depth: true, col: i % 3 === 0 ? b : a, em: 0x0a1a08, a: 0.95, p: [p.gx + Math.cos(ang) * R0, y, p.gz + Math.sin(ang) * R0], p1: [p.gx + Math.cos(ang) * R1, y, p.gz + Math.sin(ang) * R1], s: 0.01, s1: [sz, sz, sz], life: sec * 1.15, delay: d, fi: 0.04, fo: 0.8, e: EASE.out });
      }
      prop("sph", { lit: true, depth: true, col: b, em: 0x331a00, a: 0.98, p: [p.gx + R0, p.gy + 0.2 + H, p.gz], p1: [p.gx + R1 * Math.cos(turns * TAU), p.gy + 0.2 + H, p.gz + R1 * Math.sin(turns * TAU)], s: 0.01, s1: [0.4 * k, 0.34 * k, 0.4 * k], life: sec * 1.15, delay: sec * 0.55, fi: 0.04, fo: 0.8, e: EASE.out });
    }, "tgts", 0);
    return sleep(sec * 0.75);
  };
  V.drain = (c, o) => {   // motes stream from the target to the caster (o.rev: from the caster to the target): o.tex o.n o.ms
    const [a, b] = colOf(c, o), sec = dur(c, o.ms || 600), n = Math.round((o.n || 14) * c.pk), tex = tx(o.tex || "dot"), jobs = [];
    who(c, o, o.rev ? "tgts" : "tgts").forEach(t => {
      for (let i = 0; i < n; i++) {
        const d = rnd(0, sec * 0.45), life = sec * 0.55, bend = rnd(-1.2, 1.2), col = i % 2 ? a : b, sz = rnd(0.12, 0.26) * c.pk;
        jobs.push(sleep(d).then(() => {
          const A = at(o.rev ? c.src : t, 0.5), B = at(o.rev ? t : c.src, 0.55); if (!A || !B) return;
          const q = spawn({ x: A.x, y: A.y, z: A.z + 0.2, tex, col, size: sz, life: 30, drag: 0, spin: o.spin || 0 });
          return tween(life, k => { if (q) q.s.position.set(lerp(A.x, B.x, k), lerp(A.y, B.y, k) + Math.sin(k * PI) * bend, lerp(A.z, B.z, k) + 0.2); }, EASE.in2).then(() => { kill(q); });
        }));
      }
    });
    return Promise.all(jobs);
  };
  V.sun = (c, o) => {   // a sun rises over the unit(s)/group: o.ms, o.low (rises behind the field), o.beam (a pillar of light on each), o.size
    const [a, b] = colOf(c, o), sec = dur(c, o.ms || 800);
    spots(c, Object.assign({ area: 1 }, o), 0.5).forEach(p => {
      const y0 = o.low ? 0.5 : 5.2, y1 = o.low ? 4.4 : 7.2, S = 2.5 * p.k * (o.size || 1), sun = spawn({ x: p.x, y: y0, z: p.z - 1.5, tex: "sun", col: b, size: 0.2, life: 40, drag: 0, a: 0.85, ro: 1001 }), halo = spawn({ x: p.x, y: y0, z: p.z - 1.6, tex: "dot", col: a, size: 0.2, life: 40, drag: 0, a: 0.4, ro: 1000 });
      tween(sec, k => { if (!sun) return; sun.s.position.y = lerp(y0, y1, k); halo.s.position.y = sun.s.position.y; setSize(sun, lerp(0.2, S, k)); setSize(halo, lerp(0.2, S * 2.4, k)); sun.s.material.rotation += 0.015; }, EASE.out).then(() => { kill(sun); kill(halo); });
    });
    if (o.beam) V.pillar(c, { on: o.on || "tgts", fall: 1, col: o.col, w: 1.4, ms: o.ms || 800, wait: 0 });
    return sleep(sec);
  };
  V.tails = (c, o) => {   // nine flame-tails fan out behind the caster and each sends a spark of light to an ally: o.ms
    const [a, b] = colOf(c, o), sec = dur(c, o.ms || 900), n = o.n || 9, p = at(c.src, 0.3), k = sizeK(p) * c.pk, len = 2.4 * k, tails = [];
    for (let i = 0; i < n; i++) tails.push(spawn({ x: p.x, y: p.y, z: p.z - 0.2, tex: "flame", col: i % 2 ? a : b, size: 1, sx: 0.7 * len / 2.4, sy: 1.25 * len / 2.4, life: 40, a: 1, drag: 0, ro: 1001 }));
    const allies = c.mine.filter(u => u !== c.src || c.mine.length === 1);
    return tween(sec, (e, kk) => {
      const open = Math.min(1, kk * 4), t = kk * sec / c.sf;
      tails.forEach((q, i) => { if (!q) return; const base = ((i / (n - 1)) - 0.5) * 2.2 * open, ang = base + Math.sin(t * 5 + i) * 0.08 * open, lit = clamp((kk * n * 1.3) - i * 0.9, 0, 1);
        q.s.position.set(p.x - c.fx * 0.3 * k + Math.sin(ang) * len * 0.5, p.y - 0.2 * k + Math.cos(ang) * len * 0.5, p.z - 0.2); q.s.material.rotation = -ang; q.a0 = (0.35 + 0.65 * lit) * Math.min(1, open * 2) * Math.min(1, (1 - kk) * 4);
        if (lit > 0.95 && !q.sent) { q.sent = 1; const tg = at(pick(allies), 0.5), x0 = p.x + Math.sin(ang) * len, y0 = p.y + Math.cos(ang) * len, m = spawn({ x: x0, y: y0, z: p.z, tex: "star", col: 0xfff4a0, size: 0.4, life: 30, drag: 0 });
          tween(0.4 * c.sf + 0.05, k2 => { if (m) m.s.position.set(lerp(x0, tg.x, k2), lerp(y0, tg.y, k2) + Math.sin(k2 * PI) * 0.8, lerp(p.z, tg.z, k2)); }, EASE.in2).then(() => { kill(m); flashAt(tg, 0xfff4a0, 0.7, 0.12); }); } });
    }, EASE.lin).then(() => tails.forEach(kill));
  };
  V.stonify = (c, o) => {   // the unit(s) turn to stone: grey flash, crust, dust, cracks; o.ms
    const [a, b] = colOf(c, o), sec = dur(c, o.ms || 700), jobs = [];
    who(c, o, "tgts").forEach(u => { jobs.push(tintUnit(u, 0x9a9aa6, sec * 1.4, 0.85)); });
    each(c, o, (p, k) => {
      prop("ico", { lit: true, depth: true, col: 0x8e8e98, em: 0x0a0a0e, a: 0.5, p: [p.gx, p.gy + p.h * 0.5, p.gz], s: [0.5 * k, p.h * 0.3, 0.5 * k], s1: [0.95 * k, p.h * 0.6, 0.95 * k], r: [0.1, 0.4, 0.1], life: sec * 1.3, fi: 0.15, fo: 0.7, e: EASE.out });
      spawn({ x: p.x, y: p.y, z: p.z + 0.5, tex: "crack", col: 0x30303a, size: p.h * 0.9, life: sec * 1.2, a: 0.75, drag: 0, rot: rnd(0, 6) });
      for (let i = 0; i < 14; i++) spawn({ x: p.x + rnd(-0.8, 0.8) * k, y: p.gy + p.h * rnd(0.3, 1.1), z: p.z, vy: -rnd(0.4, 1.2), vx: rnd(-0.3, 0.3), tex: i % 2 ? "rock" : "smoke", col: i % 2 ? 0x8e8e98 : 0xa8a8b0, size: rnd(0.1, 0.22) * k, life: rnd(0.6, 1.1), delay: rnd(0, sec * 0.6), drag: 0.3, a: 0.8 });
      ringAt(p.gx, p.gz, 0x8e8e98, 2.4 * k, 0.6, 0.7);
    }, "tgts", 0.5);
    return sleep(sec * 0.8);
  };
  V.mark = (c, o) => V.spr(c, Object.assign({ tex: "cross", hf: 1.18, pop: 1, bob: 0.12, ms: 800, size: 0.7 }, o));
  V.shield = (c, o) => { each(c, Object.assign({ hf: 0.5 }, o), (p, k) => ringAt(p.gx, p.gz, colOf(c, o)[0], 2.4 * k, 0.5, 0.7), o.on || "src", 0); return V.spr(c, Object.assign({ tex: "shieldIcon", on: "src", hf: 0.55, dx: c.fx * 0.9, pop: 1, bob: 0.06, ms: 700, size: 0.95 }, o)); };
  // ---------- misc ----------
  V.sfx = (c, o) => { snd(c, o.k || o.key, o.fb); };
  V.shake = (c, o) => { c.api.shake(o.v == null ? 0.15 : o.v); };
  V.scr = (c, o) => { const col = o.col == null ? 0xffffff : palOf(o.col)[0]; c.api.flash("#" + (col & 0xffffff).toString(16).padStart(6, "0"), o.ms || 150); };
  V.pass = (c, o) => (o.ms ? sleep(dur(c, o.ms)) : undefined);
  // ============================== the interpreter ==============================
  const hashOf = s => { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };
  let cur = null;   // the move that is playing: FX3D.hit / heal / buff ... read its hit mode and quiet list
  const FXo = { hit: FX.hit, heal: FX.heal, buff: FX.buff, debuff: FX.debuff, status: FX.status, clear: FX.clear };

  function runStep(c, st) {
    if (c.dead()) return undefined;
    if (typeof st === "function") st = st(c);
    if (!st) return undefined;
    if (Array.isArray(st) && st[0] === "par") return Promise.all((st[1] || []).map(s => runStep(c, s)));
    let verb, o;
    if (typeof st === "number") { verb = "pass"; o = { ms: st }; }
    else if (typeof st === "string") { verb = st; o = {}; }
    else { verb = st[0]; o = st[1]; if (typeof o === "string") o = { k: o }; else if (typeof o === "number") o = { ms: o }; o = o || {}; }
    const f = V[verb]; if (!f) { if (!runStep.warned) runStep.warned = {}; if (!runStep.warned[verb]) { runStep.warned[verb] = 1; console.warn("fx: unknown verb", verb); } return undefined; }
    const job = (o.at ? sleep(dur(c, o.at)) : Promise.resolve()).then(() => (c.dead() ? undefined : f(c, o))).catch(err => { console.warn("fx verb " + verb, err); });
    if (o.go) { c.jobs.push(job); return undefined; }
    return job;
  }
  async function runSteps(c, steps) { for (const st of steps) { if (c.dead()) return; await runStep(c, st); } }

  const ALLY_KINDS = { ally: 1, allyDown: 1 };
  function makeCtx(e, api, spec) {
    const src = e.src, mineSide = src.side === "p" ? api.party : api.foes, foeSide = src.side === "p" ? api.foes : api.party;
    const ok = u => u && u.view && u.view.group && u.view.alive !== 0;
    const mine = (mineSide || []).filter(ok), foes = (foeSide || []).filter(ok), T0 = e.tgt && e.tgt.view && e.tgt.view.group ? e.tgt : null, tk = e.tkind, ab = e.ab || null;
    let tgts;
    if (e.item) tgts = [T0 || src];
    else if (tk === "allEnemies") tgts = foes.slice();
    else if (tk === "team") tgts = mine.slice();
    else if (tk === "self") tgts = [src];
    else if (ALLY_KINDS[tk]) tgts = [T0 || src];
    else if (e.enemy && !T0) tgts = ab ? (ab.ally ? mine.slice() : ab.self && !ab.p && !ab.aoe ? [src] : foes.slice()) : (e.big || e.aoe ? foes.slice() : /\b(rally|cry|harden|brace|bulk|enrage|frenzy|fortify|burrow|regrow|mend|heal)/i.test(e.move || "") ? [src] : foes.slice());
    else tgts = [T0 && T0.side !== src.side ? T0 : (foes[0] || T0 || src)];
    if (!tgts.length) tgts = [T0 || src];
    let tgt = T0 && tgts.includes(T0) ? T0 : tgts[0];
    if (tgts.length > 1 && !(T0 && tgts.includes(T0))) { const mx = tgts.reduce((s, u) => s + u.view.group.position.x, 0) / tgts.length; tgt = tgts.slice().sort((a, b) => Math.abs(a.view.group.position.x - mx) - Math.abs(b.view.group.position.x - mx))[0]; }
    const P = api.P || 1, gen0 = L.gen, el = e.el && e.el !== "self" ? e.el : e.enemy ? nameEl(String(e.move || "").toLowerCase()) : (src.element || null);
    const c = { e, api, src, tgt, tgts, mine, foes, el, fx: src.side === "p" ? -1 : 1, sf: Math.max(0.05, api.speedF ? api.speedF() : 1), pk: clamp(Math.pow(P, 0.45), 0.85, 1.5), moved: new Set(), jobs: [], over: false, gen0, ab,
      dead: () => c.over || gen0 !== L.gen };
    c.col = palOf(spec.col) || COL[el] || COL.phys;
    return c;
  }
  async function play(spec, c) {
    const steps = typeof spec.do === "function" ? spec.do(c) : spec.do, maxSec = dur(c, spec.max || (c.e.big ? 2600 : 1700));
    cur = { c, hit: spec.hit == null ? 1 : spec.hit, quiet: spec.quiet || [], t0: Date.now(), t1: 0, win: 1800 };
    const t0 = performance.now();
    try {
      await Promise.race([(async () => { await runSteps(c, steps); await Promise.all(c.jobs); const left = dur(c, spec.min == null ? 380 : spec.min) * 1000 - (performance.now() - t0); if (left > 20) await sleep(left / 1000); })(), sleep(maxSec)]);   // every move shows for at least 380 ms (speed-scaled), so a quick effect is seen before the damage numbers
    } catch (err) { console.warn("fx move failed", err); }
    c.over = true;
    if (c.gen0 === L.gen) { const us = [...c.moved]; if (us.length) await Promise.all(us.map(u => home(u, dur(c, 150)))); }
    if (cur && cur.c === c) cur.t1 = Date.now();
  }

  // ---------- picking the recipe for an event ----------
  const nameIndex = {};   // lower-case move name -> move id (generals and other enemies that use a player move by name)
  let nameDone = false;
  function indexNames() {
    if (nameDone) return; const C = root.Core; if (!C || !C.MOVES) return; nameDone = true;
    Object.keys(C.MOVES).forEach(id => { nameIndex[String(C.MOVES[id].name).toLowerCase()] = id; });
  }
  const norm = r => (!r ? null : typeof r === "function" ? { do: r } : Array.isArray(r) ? { do: r } : r);
  let pathOf = "";   // which rule picked the recipe (for fx-test.html)
  function findRecipe(e) {
    indexNames(); pathOf = "move";
    if (e.item) return norm(RECIPES[{ potion: "@potion", antidote: "@antidote", "ashen ember": "@ember" }[String(e.move || "").toLowerCase()] || "@potion"]);
    if (e.moveId && RECIPES[e.moveId]) return norm(RECIPES[e.moveId]);
    const name = String(e.move || "").toLowerCase();
    if (e.enemy || !e.moveId) {
      if (SIG[name]) { pathOf = "sig"; return norm(typeof SIG[name] === "string" ? RECIPES[SIG[name]] : SIG[name]); }
      if (nameIndex[name] && RECIPES[nameIndex[name]]) { pathOf = "name:" + nameIndex[name]; return norm(RECIPES[nameIndex[name]]); }
      const sr = structRecipe(e); if (sr) { pathOf = "struct"; return norm(sr); }
      for (const [re, key] of KEY) if (re.test(name)) { pathOf = "key:" + re.source.slice(0, 24); return norm(typeof key === "string" ? RECIPES[key] : key); }
    }
    return null;
  }

  // ---------- what arena3d calls ----------
  FX.move = function (e, api) {
    try {
      if (!L.on || !e || !e.src || !e.src.view || !e.src.view.group) return null;
      extraTextures();
      let spec = findRecipe(e); if (!spec) { pathOf = "auto"; spec = norm(root.FX3D.autoRecipe && root.FX3D.autoRecipe(e, api)); } if (!spec) return null; FX.lastPath = pathOf;
      const c = makeCtx(e, api, spec); return play(spec, c);
    } catch (err) { console.warn("fx move", err); return null; }
  };
  const quiet = k => !!(cur && cur.quiet.indexOf(k) >= 0 && (cur.t1 === 0 || Date.now() - cur.t1 < cur.win));
  FX.hit = function (u, el, kind, P = 1, crit = false) {
    if (!cur || cur.hit === 0) return FXo.hit.call(FX, u, el, kind, P, crit);
    const h = cur.hit;
    if (Array.isArray(h)) { const c = cur.c, c2 = Object.assign({}, c, { tgts: [u], tgt: u, jobs: [], dead: () => c.gen0 !== L.gen }); runSteps(c2, h); if (crit) FX.crit(u, P); return; }
    if (h === 1) FX.lite(u, cur.c.el || el, Math.min(P, 1.6), cur.c.col);
    if (crit) FX.crit(u, P);
  };
  ["heal", "buff", "debuff", "status"].forEach(k => { FX[k] = function (...a) { if (quiet(k)) return undefined; return FXo[k].apply(FX, a); }; });
  FX.clear = function () { cur = null; return FXo.clear.apply(FX, arguments); };
  FX.pathFor = e => { const r = findRecipe(e); return r ? pathOf : "auto"; };
  FX.recipes = RECIPES; FX.sig = SIG; FX.key = KEY; FX.verbs = V;   // for fx-test.html and later agents
  // ============================== RECIPES ==============================
  // Players: STYLE moves (8 styles), PERSONAL moves (36), SKILL-BOOK moves (8), items. Each one differs in motion, shape and colour from every other.
  const par = (...s) => ["par", s];
  const R = (id, spec, steps) => { RECIPES[id] = Object.assign({ do: steps }, spec); };
  const SND = (k, at) => ["sfx", { k, at, go: 1 }];

  // ---------- MINOTAUR (bronze, blood, stone: charging, stomping, breaking) ----------
  R("gore", { col: ["ember", "bone"] }, [["crouch", { ms: 110, lean: 0.25 }], SND("whoosh"), ["dash", { ms: 170, lean: 0.4 }], par(["spr", { tex: "horn", hf: 0.5, size: 1.5, ms: 260, rot: -0.4, flip: 1, pop: 1 }], ["hit", { kind: "smash", shake: 0.1 }])]);
  R("hoofStomp", { col: ["brass", "stone"] }, [["rear", { ms: 150, h: 0.6, a: 0.3 }], ["dash", { ms: 140, hop: 0.5, lean: 0.1 }], ["fall", { ms: 80 }], par(["hit", { kind: "thump", shake: 0.14 }], ["crack", { r: 2.2 }], ["spr", { tex: "paw", n: 2, col: "stone", ms: 500, size: 0.5, spread: 0.7, dy: -0.8, a: 0.8, rot: 3.1 }])]);
  R("labCharge", { col: ["brass", "gold"] }, [["crouch", { ms: 200, lean: 0.35, sy: 0.82 }], par(["tint", { ms: 450, col: "gold", amt: 0.5, go: 1 }], SND("whooshBig"), ["dash", { ms: 250, lean: 0.5, reach: 0.85, dust: "sand", col: "gold" }]), par(["hit", { kind: "smash", shake: 0.3 }], ["knock", { d: 1.2, ms: 200 }], ["crack", { line: 1 }])]);
  R("bullRush", { col: ["red", "bone"] }, [["lean", { a: 0.2, ms: 100 }], SND("whoosh"), ["dash", { ms: 160, lean: 0.45, reach: 0.8 }], par(["knock", { d: 1.7, ms: 230, hop: 0.2 }], ["hit", { kind: "punch" }], ["spr", { tex: "chev", n: 3, stagger: 70, flip: 1, col: "bone", ms: 450, size: 0.6, dx: -1.2, vx: -3 }]), ["spr", { tex: "hourglass", hf: 1.2, pop: 1, bob: 0.1, ms: 750, size: 0.7, col: ["gold", "bone"] }]]);
  R("roar", { col: ["red", "ember"] }, [["rear", { ms: 200, h: 0.3, a: 0.4 }], par(["roar", { n: 4, shake: 0.18 }], ["aura", { on: "src", tex: "flame", ms: 600, vy: 2, col: ["red", "ember"] }]), ["spr", { on: "foes", tex: "excl", hf: 1.18, pop: 1, bob: 0.1, ms: 800, size: 0.55, col: "red", stagger: 90 }]]);
  R("skullCrush", { col: ["blood", "bone"] }, [["crouch", { ms: 160, sy: 0.78 }], SND("whooshBig"), ["leap", { ms: 330, h: 3.4, lean: 0.3 }], par(["hit", { kind: "smash", shake: 0.32 }], ["crack", {}], ["spr", { tex: "skull", hf: 1.3, pop: 1, rise: 1.3, ms: 750, size: 0.8, col: ["bone", "blood"] }], ["arrows", { dir: "down", col: "debuff" }])]);
  R("bloodrage", { col: ["red", "blood"] }, [par(["tint", { ms: 750, col: "red", amt: 0.7, go: 1 }], ["jitter", { ms: 520, amp: 0.05 }], ["aura", { tex: "flame", ms: 700, vy: 2.6, r: 0.9, rate: 55, col: ["red", "ember"] }]), par(["roar", { n: 2, shake: 0.1 }], ["arrows", { dir: "up", col: "red" }], ["spr", { on: "src", tex: "drop", n: 3, rise: -1, ms: 500, size: 0.3, col: "blood", spread: 0.4, hf: 0.9 }])]);
  R("reckless", { col: ["blood", "steel"] }, [["spin", { ms: 280, n: 1, ease: EASE.in2 }], SND("whoosh"), ["dash", { ms: 190, lean: 0.5, reach: 0.9 }], par(["slash", { n: 3, gap: 60, da: 1.3, s: 1.2 }], ["hit", { kind: "smash", shake: 0.3 }], ["rain", { on: "src", tex: "drop", n: 8, height: 4, land: "none", col: "blood", ms: 300, fall: 300, spread: 0.5, size: 0.28, go: 1 }]), ["home", { ms: 150 }]]);
  R("stampede", { col: ["sand", "brass"] }, [["roar", { n: 2, shake: 0.12 }], par(["dash", { to: "far", ms: 440, lean: 0.4, trail: 1, dust: "sand", col: "gold" }], ["quake", { on: "foes", shake: 0.32, cracks: 0, hop: 0, at: 160, go: 1 }], ["cloud", { on: "foes", area: 1, n: 9, size: 1.1, a: 0.4, ms: 520, mote: "rock", col: ["sand", "stone"], at: 120, go: 1 }]), ["knock", { on: "foes", d: 0.7, ms: 160 }]]);
  R("wrath", { col: ["blood", "shadow"] }, [["crouch", { ms: 220, sy: 0.82 }], par(["gather", { ms: 330, tex: "dot", n: 22, col: ["blood", "shadow"] }], ["tint", { ms: 650, col: "red", amt: 0.8, go: 1 }]), par(["aura", { tex: "smoke", ms: 420, grow: 1.2, vy: 1.4, a: 0.55, col: ["shadow", "blood"] }], ["spr", { on: "src", tex: "spiral", col: "blood", size: 2.4, ms: 600, spin: 4, a: 0.7, hf: 0.5, grow: 0.4 }])]);

  // ---------- HARPY (wind, feathers, speed) ----------
  R("talonSwipe", { col: ["wind", "white"] }, [SND("wingbeat"), ["dash", { ms: 130, hop: 0.5, lean: 0.35 }], ["claws", { n: 2, ang: 0.55 }]]);
  R("featherVolley", { col: ["wind", "white"] }, [["wings", { ms: 330, flaps: 2 }], SND("wingFlutter"), ["proj", { shape: "feather", n: 3, spread: 0.7, ms: 300, stagger: 90, arc: 0.6, hf: 0.6 }], ["spr", { tex: "feather", n: 4, rise: -1.5, ms: 600, size: 0.5, spread: 0.8, col: ["wind", "white"], spin: 3, alt: 1 }]]);
  R("rend", { col: ["blood", "wind"] }, [["dash", { ms: 130, hop: 0.6 }], ["claws", { n: 2, ang: 0.3, gap: 110 }], ["spr", { tex: "drop", n: 6, rise: 1, ms: 600, size: 0.26, col: "blood", spread: 0.5, stagger: 40 }], ["shake", { v: 0.08 }]]);
  R("shriek", { col: ["violet", "white"] }, [["rear", { ms: 130, h: 0.15, a: 0.3 }], par(["roar", { n: 3, shake: 0.06 }], ["proj", { shape: "sonic", n: 3, stagger: 120, ms: 340, hf: 0.55 }]), par(["jitter", { on: "tgts", ms: 380, amp: 0.08 }], ["arrows", { dir: "down", col: ["violet", "white"] }], ["spr", { tex: "note", n: 3, rise: 1.5, ms: 600, size: 0.5, col: "violet", spread: 0.6, hf: 1.0, spin: 2 }])]);
  R("tailwind", { col: ["wind", "white"] }, [["wings", { ms: 260, flaps: 1 }], ["proj", { shape: "wind", ms: 340, arc: 0.8 }], par(["spr", { tex: "streak", n: 6, vx: -7, ms: 450, size: 0.9, sx: 2.2, sy: 0.35, col: ["white", "wind"], spread: 0.9, hf: 0.5 }], ["arrows", { dir: "up", col: ["wind", "white"] }], ["ring", { r: 2.6 }])]);
  R("cyclone", { col: ["wind", "white"] }, [par(["spin", { ms: 520, n: 2, ease: EASE.lin }], ["wings", { ms: 520, flaps: 3, go: 1 }], ["whirl", { on: "foes", kind: "wind", ms: 700, w: 1.5, h: 3.4, at: 120 }], ["slash", { on: "foes", n: 3, gap: 130, da: 1.3, s: 1.2, at: 250 }])]);
  R("dive", { col: ["gold", "wind"] }, [["wings", { ms: 240, flaps: 1, go: 1 }], ["rise", { ms: 280, h: 3.2, tilt: 0.25 }], par(["aura", { tex: "streak", ms: 400, vy: -3, r: 0.8, col: ["gold", "white"], rate: 50 }], ["flare", { col: "gold" }]), ["fall", { ms: 160 }], ["ring", { on: "src", r: 2.6 }]]);
  R("hitAndRun", { col: ["steel", "wind"] }, [SND("whoosh"), ["dash", { ms: 120, hop: 0.4 }], par(["claws", { n: 1, ang: 0.3 }], ["hit", { kind: "pop" }]), ["home", { ms: 150 }], ["aura", { on: "src", tex: "streak", ms: 200, vy: 0, col: ["steel", "white"], go: 1 }]]);
  R("snatch", { col: ["gold", "violet"] }, [["dash", { ms: 140, hop: 0.5 }], par(["claws", { n: 1, ang: -0.3 }], ["drain", { tex: "star", n: 12, ms: 520, col: ["gold", "white"] }]), par(["flare", { col: "gold" }], ["spr", { on: "src", tex: "star", n: 3, rise: 1.2, ms: 500, size: 0.5, col: "gold", spread: 0.5, hf: 1.0 }])]);

  // ---------- HYDRA (poison, fire breath, bleeding, many heads) ----------
  R("venomBite", { col: ["poison", "bone"] }, [["dash", { ms: 150, lean: 0.3 }], ["bite", { teeth: 3 }], ["spr", { tex: "drop", n: 4, rise: -1.2, ms: 500, size: 0.3, spread: 0.3 }]]);
  R("toxicSpit", { col: ["poison", "moss"] }, [["rear", { ms: 140, h: 0.15, a: 0.2 }], ["proj", { shape: "glob", ms: 340, hf: 0.7 }], par(["look", { kind: "poison", p: 0.9 }], ["cloud", { n: 4, ms: 400, mote: "bubble" }])]);
  R("searingBreath", { col: ["fire", "gold"] }, [["gather", { ms: 160, tex: "flame", n: 10 }], ["stream", { tex: "flame", ms: 540, rate: 95, size: 0.95 }], par(["look", { kind: "fire" }], ["spr", { tex: "flame", n: 3, rise: 1.4, ms: 500, size: 0.6, spread: 0.5 }])]);
  R("lacerate", { col: ["blood", "steel"] }, [["dash", { ms: 140 }], ["slash", { n: 3, gap: 70, da: 0.7, s: 1.1 }], ["spr", { tex: "drop", n: 8, rise: 1.4, ms: 650, size: 0.27, col: "blood", spread: 0.8, stagger: 30 }]]);
  R("corrode", { col: ["poison", "gold"] }, [["rear", { ms: 130, h: 0.1, a: 0.15 }], ["proj", { shape: "flask", ms: 380, hf: 0.7 }], par(["cloud", { n: 7, ms: 560, mote: "bubble", col: ["moss", "poison"] }], ["arrows", { dir: "down", col: ["poison", "gold"] }], ["spr", { tex: "drop", n: 5, rise: -1.4, ms: 600, size: 0.3, spread: 0.6, col: "poison" }])]);
  R("fester", { col: ["poison", "blood"], hit: 2 }, [par(["spr", { tex: "skull", hf: 1.15, pop: 1, ms: 800, size: 0.7, rise: 0.4 }], ["ring", { n: 3, gap: 130, r: 2.6 }], ["jitter", { on: "tgt", ms: 520, amp: 0.06 }]), ["cloud", { n: 5, mote: "bubble", ms: 600 }], ["flare", { on: "tgt", col: "blood" }]]);
  R("plagueCloud", { col: ["poison", "moss"] }, [["rear", { ms: 160, h: 0.2, a: 0.3 }], par(["cloud", { on: "foes", area: 1, n: 11, size: 1.3, a: 0.45, ms: 900, mote: "skull", col: ["poison", "moss"] }], ["stream", { on: "foes", tex: "smoke", ms: 450, rate: 40, size: 0.8, col: ["moss", "poison"] }])]);
  R("rupture", { col: ["blood", "bone"] }, [["dash", { ms: 140 }], ["bite", { teeth: 2 }], par(["blast", { kind: "blood", s: 1.2, shake: 0.2 }], ["ring", { r: 3.4 }], ["spr", { tex: "drop", n: 10, rise: 2, ms: 700, size: 0.3, col: "blood", spread: 1.1, stagger: 20 }])]);
  R("regrow", { col: ["nature", "heal"] }, [["crouch", { ms: 220, sy: 0.84 }], par(["aura", { tex: "leaf", ms: 750, vy: 1.8, r: 1.0, col: ["nature", "heal"], spin: 3 }], ["circle", { ms: 800 }], ["spr", { tex: "plus", n: 3, rise: 1.4, ms: 700, size: 0.4, col: "heal", spread: 0.6, hf: 0.8 }])]);

  // ---------- COLOSSUS (stone, brass: punching, guarding, shaking the ground) ----------
  R("stoneFist", { col: ["earth", "stone"] }, [["lean", { a: -0.25, ms: 130 }], SND("whoosh"), ["dash", { ms: 190, lean: 0.12 }], par(["hit", { kind: "punch" }], ["ring", { r: 2.6, ms: 400 }])]);
  R("challenge", { col: ["gold", "brass"] }, [par(["shield", {}], ["roar", { n: 3, shake: 0.1 }]), ["mark", { on: "foes", tex: "cross", col: "gold", hf: 0.6, stagger: 80, ms: 800, size: 0.8 }]]);
  R("fortify", { col: ["stone", "brass"] }, [par(["tint", { ms: 600, col: "stone", amt: 0.6, go: 1 }], ["aura", { tex: "rock", ms: 600, vy: 0.6, r: 1.3, col: ["stone", "brass"], rate: 35, size: 1.3 }], ["dome", { on: "src", ms: 650 }]), ["arrows", { dir: "up", col: ["brass", "gold"] }]]);
  R("bulwark", { col: ["brass", "gold"] }, [["dash", { to: "front", ms: 200 }], par(["shield", { on: "src" }], ["beam", { kind: "line", on: "tgt", w: 0.5, ms: 350 }], ["ring", { on: "tgt", r: 2.6 }])]);
  R("counterSt", { col: ["steel", "brass"] }, [["crouch", { ms: 180, sy: 0.82 }], par(["spikes", { on: "src", kind: "stone", ring: 1, n: 7, h: 1.3, w: 0.38, ms: 700 }], ["aura", { tex: "cross", ms: 500, vy: 0, r: 1.1, col: ["steel", "brass"], rate: 30, size: 1.2 }]), ["flare", { col: "brass" }]]);
  R("shieldWall", { col: ["brass", "gold"] }, [["crouch", { ms: 150, sy: 0.85 }], par(["wall", { kind: "brass", n: 7 }], ["dome", { on: "team", area: 1, ms: 800 }], ["shake", { v: 0.1 }])]);
  R("crushWeight", { col: ["stone", "earth"] }, [["rise", { ms: 200, h: 0.9 }], ["gather", { ms: 150, tex: "rock", n: 8 }], ["proj", { shape: "rock", from: "sky", s: 2.8, ms: 380, arc: 0, hf: 0.7 }], par(["squash", { on: "tgt", ms: 150 }], ["hit", { kind: "smash", shake: 0.28 }], ["shards", { tex: "rock", n: 10 }])]);
  R("earthshaker", { col: ["earth", "sand"] }, [["rear", { ms: 200, h: 0.5, a: 0.3 }], SND("whooshBig"), ["fall", { ms: 90 }], par(["quake", { on: "foes", shake: 0.4, hopH: 1 }], ["spikes", { on: "foes", kind: "stone", n: 4, h: 1.7 }], ["crack", { on: "foes", line: 1 }])]);
  R("unbreakable", { col: ["gold", "stone"] }, [["tint", { ms: 300, col: "stone", amt: 0.7, go: 1 }], ["crouch", { ms: 200, sy: 0.85 }], par(["blast", { kind: "light", on: "src", s: 0.8, shake: 0, look: 0 }], ["shards", { tex: "rock", on: "src", n: 12, speed: 5 }], ["aura", { tex: "star", col: ["gold", 0xffffff], ms: 600, vy: 1.8 }], ["spr", { on: "src", tex: "shieldIcon", hf: 0.6, pop: 1, ms: 700, col: "gold", size: 1 }])]);

  // ---------- PHOENIX (fire and light: healing, warding, sun) ----------
  R("emberPeck", { col: ["fire", "gold"] }, [["dash", { ms: 130, hop: 0.45, lean: 0.35 }], ["blast", { kind: "fire", s: 0.55, shake: 0 }]]);
  R("warmLight", { col: ["heal", "gold"] }, [["gather", { ms: 180, tex: "star", n: 9, col: ["gold", 0xffffff] }], ["proj", { shape: "orb", on: "tgt", ms: 360, arc: 1.2 }], par(["flare", { on: "tgt", col: "gold" }], ["ring", { on: "tgt", r: 2.6 }])]);
  R("rejuvenate", { col: ["heal", "nature"] }, [["circle", { on: "tgt", ms: 850, col: ["heal", "gold"] }], par(["aura", { on: "tgt", tex: "leaf", col: ["heal", "nature"], vy: 1.6, ms: 800, spin: 3, r: 1 }], ["spr", { on: "tgt", tex: "plus", n: 3, rise: 1.2, ms: 800, size: 0.45, col: "heal", spread: 0.5, stagger: 120, hf: 0.3 }], ["spr", { on: "tgt", tex: "heart", hf: 1.1, pop: 1, ms: 800, size: 0.5, col: "rose", bob: 0.1 }])]);
  R("cleansingFlame", { col: ["fire", "white"] }, [["gather", { ms: 150, tex: "flame", n: 8 }], par(["pillar", { on: "tgt", w: 1.0, h: 6, ms: 520, col: ["light", "fire"], tex: "flame" }], ["aura", { on: "tgt", tex: "smoke", col: ["steam", "ink"], vy: 2.4, ms: 600, a: 0.5, grow: 1, rate: 30 }])]);
  R("flameWard", { col: ["fire", "gold"] }, [par(["dome", { on: "tgt", ms: 850 }], ["aura", { on: "tgt", tex: "flame", ms: 850, vy: 0.9, r: 1.3, rate: 36, size: 1.1 }])]);
  R("healWave", { col: ["gold", "heal"] }, [["wings", { ms: 420, flaps: 1 }], par(["ring", { on: "team", n: 3, gap: 110, r: 3.6, col: ["heal", "gold"] }], ["spr", { on: "team", tex: "plus", n: 4, rise: 1.6, ms: 800, size: 0.5, col: ["heal", "gold"], alt: 1, spread: 0.6, stagger: 70, hf: 0.2 }], ["flare", { on: "team", col: "gold", s: 0.55 }])]);
  R("rebirth", { col: ["fire", "gold"] }, [["wings", { ms: 520, flaps: 2, s: 1.3, go: 1 }], par(["pillar", { on: "tgt", fall: 1, w: 1.9, h: 11, ms: 650, tex: "flame" }], ["rain", { on: "tgt", tex: "feather", n: 12, ms: 600, spread: 0.7, col: ["gold", "fire"], land: "ember", height: 6, spin: 2, fall: 420 }]), ["blast", { on: "tgt", kind: "fire", s: 1, shake: 0.1 }]]);
  R("purge", { col: ["light", "gold"] }, [par(["ring", { on: "team", n: 3, gap: 100, r: 4 }], ["aura", { on: "team", tex: "smoke", col: ["ink", "steam"], vy: 2.4, ms: 600, a: 0.5, grow: 1 }], ["spr", { on: "team", tex: "star", n: 5, rise: 1.6, ms: 700, size: 0.4, spread: 0.7, hf: 0.2, col: ["gold", 0xffffff], alt: 1 }])]);
  R("sunfire", { col: ["sun", "fire"] }, [["gather", { ms: 160, tex: "star" }], par(["sun", { on: "team", ms: 600 }], ["beam", { kind: "pulse", up: 1, w: 1.5, ms: 560, col: ["sun", "fire"], at: 260, on: "tgt" }]), ["blast", { kind: "light", on: "tgt", s: 1 }]]);

  // ---------- GORGON (control: lashes, gazes, coils, curses) ----------
  R("serpentLash", { col: ["violet", "moss"] }, [["lash", { ms: 240, h: 1.8 }], ["hit", { kind: "pierce" }]]);
  R("hiss", { col: ["moss", "ink"] }, [["rear", { ms: 120, h: 0.1, a: 0.25 }], par(["stream", { tex: "smoke", ms: 460, rate: 75, size: 1.0, grow: 1.6, spread: 0.14 }], ["roar", { n: 2, shake: 0, s: 0.7 }], ["sfx", { k: "debuff", go: 1 }]), par(["jitter", { on: "tgt", ms: 300, amp: 0.07 }], ["arrows", { dir: "down", on: "tgt", col: ["moss", "ink"] }])]);
  R("venomMark", { col: ["poison", "violet"] }, [["proj", { shape: "dart", ms: 260, hf: 0.6 }], par(["mark", { tex: "cross", col: "violet", ms: 900, hf: 0.55, size: 0.9 }], ["circle", { on: "tgt", ms: 600, s: 0.7 }], ["look", { kind: "poison", p: 0.5 }])]);
  R("petrifyingGaze", { col: ["sand", "stone"] }, [["spr", { on: "src", tex: "eye", hf: 1.15, pop: 1, ms: 700, size: 1, col: ["violet", "sand"] }], ["beam", { kind: "line", ms: 420, w: 0.7, col: ["stone", 0xffffff] }], par(["tint", { on: "tgt", ms: 600, col: "stone", amt: 0.6, go: 1 }], ["squash", { on: "tgt", sy: 0.85, ms: 200 }], ["cloud", { n: 5, col: ["stone", "sand"], mote: "rock", ms: 500 }])]);
  R("crackArmour", { col: ["steel", "stone"] }, [["lean", { a: -0.2, ms: 100 }], ["beam", { kind: "zig", ms: 300, w: 0.6 }], par(["spr", { on: "tgt", tex: "crack", size: 2.6, ms: 700, hf: 0.5, a: 0.95, col: "ink" }], ["shards", { n: 14, tex: "shard", speed: 6 }], ["hit", { kind: "pop" }]), ["arrows", { dir: "down", on: "tgt", col: "steel" }]]);
  R("shatterShield", { col: ["rune", "white"] }, [["gather", { ms: 150 }], ["beam", { kind: "pulse", ms: 260, w: 0.7 }], ["dome", { on: "tgt", ms: 350 }], par(["shards", { n: 22, tex: "shard", speed: 8 }], ["flare", { on: "tgt", col: "rune" }], ["shake", { v: 0.12 }])]);
  R("coil", { col: ["moss", "violet"] }, [["crouch", { ms: 150 }], ["coil", { ms: 720 }], ["squash", { on: "tgt", ms: 200, sy: 0.8 }]]);
  R("stoneGaze", { col: ["stone", "violet"] }, [["spr", { on: "src", tex: "eye", hf: 1.15, pop: 1, ms: 800, size: 1.1, col: ["violet", "stone"] }], ["beam", { kind: "pulse", ms: 520, w: 0.9, col: ["stone", 0xffffff] }], ["stonify", { ms: 700 }]]);
  R("curseOfStone", { col: ["violet", "stone"] }, [["circle", { on: "tgt", ms: 850 }], par(["cage", { on: "tgt", kind: "chain", n: 8, ms: 800 }], ["drain", { tex: "star", n: 12, ms: 550, col: ["violet", "gold"] }]), ["spr", { on: "tgt", tex: "rune", hf: 1.2, pop: 1, ms: 700, col: "violet", size: 0.8, bob: 0.1 }]]);

  // ---------- DRAGON (the elements: fireball, jet, frost, lightning, area storms) ----------
  R("claw", { col: ["gold", "ember"] }, [["rear", { ms: 170 }], ["dash", { ms: 150, y: 0.2 }], ["fall", { ms: 90 }], ["claws", { n: 3, ang: 0.4, gap: 70 }]]);
  R("ember", { col: ["fire", "gold"] }, [["charge", { ms: 180 }], ["proj", { shape: "fire", ms: 300 }], ["blast", { kind: "fire", s: 0.8 }]]);
  R("torrent", { col: ["water", "steam"] }, [["rear", { ms: 150, a: 0.2, h: 0.1 }], ["stream", { tex: "drop", ms: 420, size: 0.8, rate: 80, g: 2 }], ["look", { kind: "water" }]]);
  R("frostBreath", { col: ["ice", 0xffffff] }, [["gather", { ms: 160 }], ["stream", { tex: "snow", ms: 460, rate: 70, spin: 3 }], ["ice", { ms: 500 }]]);
  R("thunderclap", { col: ["shock", 0xffffff] }, [["gather", { ms: 150, tex: "star" }], ["bolt", { n: 2 }], ["ring", { r: 3.2 }]]);
  R("attune", { col: ["rune", 0xffffff] }, [par(["aura", { col: "fire", tex: "flame", ms: 700, vy: 1, r: 0.7, rate: 18, size: 0.8 }], ["aura", { col: "water", tex: "drop", ms: 700, vy: 1.2, r: 1.0, rate: 18 }], ["aura", { col: "ice", tex: "snow", ms: 700, vy: 0.8, r: 1.3, rate: 16, spin: 2 }], ["aura", { col: "shock", tex: "star", ms: 700, vy: 1.6, r: 0.9, rate: 16, spin: 3 }], ["circle", { ms: 800 }]), ["flare", { col: "gold" }]]);
  R("inferno", { col: ["fire", "gold"] }, [["roar", { n: 2, shake: 0.15 }], par(["stream", { on: "foes", tex: "flame", ms: 600, rate: 120, size: 1.0, spread: 0.3 }], ["pillar", { on: "foes", w: 1.1, h: 6, tex: "flame", at: 220, go: 1 }])]);
  R("blizzard", { col: ["ice", 0xffffff] }, [["rear", { ms: 160, h: 0.2, a: 0.3 }], par(["storm", { on: "foes", kind: "snow", area: 1, ms: 800 }], ["spikes", { on: "foes", kind: "ice", n: 4, at: 300 }])]);
  R("detonate", { col: ["fire", 0xffffff] }, [par(["spr", { on: "tgt", tex: "dot", col: "fire", dx: -0.7, hf: 0.9, size: 0.6, pop: 1, ms: 500 }], ["spr", { on: "tgt", tex: "dot", col: "water", dx: -0.2, hf: 1.2, size: 0.6, pop: 1, ms: 500 }], ["spr", { on: "tgt", tex: "dot", col: "ice", dx: 0.3, hf: 0.9, size: 0.6, pop: 1, ms: 500 }], ["spr", { on: "tgt", tex: "dot", col: "shock", dx: 0.8, hf: 1.2, size: 0.6, pop: 1, ms: 500, wait: 420 }]), par(["blast", { kind: "fire", s: 1.5, shake: 0.3 }], ["look", { kind: "ice", p: 1.4 }], ["look", { kind: "shock", p: 1.2 }])]);

  // ---------- LEVIATHAN (water and the Tide: tail, whirlpools, waves) ----------
  R("tailSlap", { col: ["water", "steam"] }, [["dash", { ms: 160, lean: 0.1 }], ["spin", { n: 1, ms: 240 }], par(["slash", { ang: 0.2, n: 1, s: 1.3 }], ["look", { kind: "water", p: 0.7 }])]);
  R("undertow", { col: ["water", "steam"] }, [["rear", { ms: 140, h: 0.1, a: 0.2 }], par(["vortex", { on: "tgt", kind: "water", sink: 1, ms: 650 }], ["wave", { on: "tgt", kind: "water", rows: 1, s: 0.55, ms: 450, land: 0 }])]);
  R("deepBreath", { col: ["water", "steam"] }, [par(["gather", { ms: 450, tex: "bubble", n: 20, r: 1.4 }], ["crouch", { ms: 400, sy: 1.12 }]), par(["aura", { tex: "bubble", ms: 450, vy: 1.4 }], ["ring", { on: "src", n: 2, r: 3 }], ["spr", { on: "src", tex: "drop", n: 2, hf: 1.15, pop: 1, ms: 700, size: 0.5, spread: 0.6, col: ["water", 0xffffff] }])]);
  R("maelstrom", { col: ["water", "ice"] }, [["rise", { ms: 260, h: 0.8, tilt: 0.15 }], par(["whirl", { kind: "water", on: "tgt", w: 2.4, h: 5.2, ms: 650 }], ["vortex", { kind: "water", on: "tgt", r: 4, ms: 650 }]), ["hit", { kind: "smash", shake: 0.3 }]]);
  R("swell", { col: ["water", "steam"] }, [par(["aura", { tex: "drop", vy: 2.4, ms: 700, r: 1.1 }], ["ring", { on: "src", n: 3, gap: 160, r: 3.4 }], ["hop", { n: 2, h: 0.25, ms: 230 }])]);
  R("braceDeep", { col: ["water", "steam"] }, [["crouch", { ms: 200, sy: 0.85 }], par(["dome", { on: "src", ms: 850 }], ["shield", { on: "src" }])]);
  R("riptide", { col: ["water", "steam"] }, [["wave", { kind: "water", on: "tgt", rows: 1, s: 0.8, ms: 500 }], par(["knock", { d: 1.4, ms: 200 }], ["spr", { tex: "hourglass", hf: 1.2, pop: 1, bob: 0.1, ms: 700 }])]);
  R("abyssalHunger", { col: ["dark", "water"] }, [["vortex", { kind: "dark", on: "tgt", ms: 650, go: 1 }], ["bite", { teeth: 2, col: ["dark", "violet"] }], ["drain", { col: ["dark", "water"], n: 18, tex: "dot", ms: 600 }]]);
  R("tidalWave", { col: ["water", "steam"] }, [["rear", { ms: 200, h: 0.4, a: 0.2 }], ["wave", { kind: "water", on: "foes", rows: 4, s: 1.25, ms: 640 }], ["shake", { v: 0.2 }]]);
  // Tithe of the Deep: it bleeds a share of its own life into the sea (blood drops fall away, the water whirls round it), then the deep answers with a dark swell that stays on it until the release
  R("deepTithe", { col: ["water", "blood"] }, [["crouch", { ms: 260, sy: 0.88 }], par(["spr", { on: "src", tex: "drop", n: 5, rise: 1.0, ms: 560, size: 0.35, col: "blood", spread: 0.5, hf: 0.7 }], ["vortex", { on: "src", kind: "water", ms: 640 }], ["shake", { v: 0.04 }]), par(["gather", { ms: 420, tex: "bubble", n: 18, col: ["water", "violet"], r: 1.6 }], ["aura", { on: "src", tex: "bubble", ms: 600, vy: 1.8, r: 0.9, col: ["water", "violet"] }], ["ring", { on: "src", n: 2, gap: 120, r: 3.0, col: ["water", "violet"] }]), ["arrows", { dir: "up", on: "src", col: ["water", "gold"] }]]);

  // ============================== PERSONAL MOVES (one per creature, see PERSONAL_MOVES.md) ==============================
  const lowest = c => c.mine.filter(u => u !== c.src).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0] || c.src;
  // P1 The Vanguard
  R("twoHeads", { col: ["ember", "bone"] }, [["crouch", { ms: 140, lean: 0.3 }], SND("whooshBig"), ["dash", { ms: 170, lean: 0.45 }], par(["spr", { tex: "horn", hf: 0.6, size: 1.8, col: "ember", rot: -0.4, flip: 1, pop: 1, ms: 320, dx: -0.2 }], ["spr", { tex: "horn", hf: 0.45, size: 1.0, col: "bone", rot: -0.1, flip: 1, pop: 1, ms: 320, dx: 0.6, dy: -0.2 }], ["hit", { kind: "smash", shake: 0.18 }])]);
  R("erodingRune", { col: ["rune", "stone"] }, [["crouch", { ms: 200, sy: 0.85 }], par(["spr", { on: "src", tex: "rune", hf: 0.55, size: 1.2, pop: 1, ms: 950, col: ["rune", 0xffffff], bob: 0.05 }], ["shards", { on: "src", tex: "rock", n: 9, speed: 3, col: ["stone", "rune"] }], ["circle", { on: "src", ms: 750 }])]);
  R("nineTails", { col: ["fire", "gold"] }, [["tails", { ms: 1000 }], ["flare", { col: "gold" }]]);
  // P2 Blood Sprint
  R("grudgeBite", { col: ["ice", 0xffffff] }, [["dash", { ms: 150, lean: 0.3 }], ["bite", { teeth: 4 }], par(["spr", { on: "tgt", tex: "chain", n: 2, hf: 1.1, pop: 1, ms: 900, size: 0.6, col: ["steel", "ice"], spread: 0.6, rot: 0.7 }], ["spr", { on: "tgt", tex: "paw", hf: 0.5, pop: 1, ms: 700, size: 0.7, col: "ice", a: 0.8 }])]);
  R("cuttingRemark", { col: ["violet", 0xffffff] }, [["dash", { ms: 120, hop: 0.5 }], ["slash", { n: 2, gap: 90, da: 1.6 }], ["spr", { tex: "star", n: 5, rise: 1, ms: 550, size: 0.4, col: ["gold", 0xffffff], spread: 0.9, hf: 1.0, spin: 3, alt: 1 }]]);
  R("gateClimb", { col: ["water", "ice"] }, [["proj", { shape: "orb", col: "water", hf: 0.25, ms: 240, arc: 0.6, go: 1 }], ["proj", { shape: "orb", col: "ice", hf: 0.6, ms: 240, arc: 0.9, at: 150, go: 1 }], ["proj", { shape: "orb", col: "shock", hf: 1, ms: 240, arc: 1.3, at: 300 }], par(["ring", { n: 3, gap: 80, r: 2.8, col: ["water", "shock"] }], ["look", { kind: "shock", p: 0.8 }])]);
  // P3 Slow Venom
  R("smotheringMoss", { col: ["moss", "nature"] }, [["proj", { shape: "seed", ms: 340, hf: 0.7 }], par(["spr", { on: "tgt", tex: "smoke", size: 1.9, hf: 0.4, ms: 950, a: 0.7, grow: 0.5 }], ["aura", { on: "tgt", tex: "leaf", ms: 800, vy: 0.4, r: 0.9, rate: 40, spin: 3 }], ["cloud", { n: 6, mote: "leaf", ms: 700 }])]);
  R("unheardApproach", { col: ["shadow", "violet"] }, [par(["tint", { ms: 700, col: "shadow", amt: 0.8, go: 1 }], ["wings", { ms: 420, flaps: 1 }], ["circle", { on: "src", ms: 700 }]), ["rain", { on: "src", tex: "feather", n: 10, height: 4, ms: 400, fall: 450, land: "none", spin: 1, size: 0.36, spread: 1, col: ["shadow", "violet"] }]]);
  R("goldenFleece", { col: ["gold", "fire"] }, [par(["spr", { on: "src", tex: "flame", n: 3, hf: 0.7, size: 0.6, rise: 1.4, ms: 450, spread: 0.7, col: ["gold", "fire"] }], ["shake", { v: 0.04 }]), ["drain", { rev: 1, tex: "flame", n: 10, ms: 520, col: ["gold", "fire"] }], par(["flare", { on: "tgt", col: "gold" }], ["ring", { on: "tgt", r: 2.8 }])]);
  // P4 Tempest
  R("jokersGambit", { col: ["violet", "gold"] }, [["spr", { on: "src", tex: "coin", hf: 1.2, rise: 2.8, spin: 14, ms: 450, col: "gold", size: 0.55 }], SND("whoosh"), ["dash", { ms: 130, hop: 0.5 }], ["slash", { n: 4, gap: 55, da: 2.2, s: 1.0 }], ["spr", { tex: "star", n: 3, rise: 1, ms: 450, size: 0.4, col: ["gold", "violet"], spread: 0.8, hf: 1.0, alt: 1 }]]);
  R("staticGallop", { col: ["shock", 0xffffff] }, [par(["hop", { n: 3, ms: 150, h: 0.4 }], ["aura", { tex: "star", ms: 650, vy: 1.2, rate: 60, spin: 4, r: 1.1 }], ["spr", { on: "src", tex: "zig", n: 3, hf: 0.5, size: 0.9, ms: 600, spread: 1.2, col: ["shock", 0xffffff], alt: 1, pop: 1, rot: 0.3 }]), ["arrows", { dir: "up", col: "shock" }]]);
  R("houndsAtTheGate", { col: ["water", "steam"] }, [["dash", { to: "front", ms: 200 }], par(["spr", { on: "src", tex: "hound", n: 3, hf: 1.05, size: 0.6, pop: 1, ms: 800, spread: 0.9, col: ["water", "ice"], bob: 0.08, stagger: 60 }], ["beam", { kind: "line", on: "tgt", w: 0.5, ms: 350 }], ["ring", { on: "tgt", r: 2.6 }])]);
  // P5 The Iron Ward
  R("serpentSpout", { col: ["water", "steam"] }, [["rear", { ms: 150, h: 0.1, a: 0.2 }], par(["stream", { tex: "drop", ms: 420, size: 0.8, rate: 80, g: 2, hf: 0.45 }], ["rain", { on: "src", tex: "drop", n: 8, height: 4, land: "splash", ms: 400, spread: 0.5, at: 200, go: 1 }]), ["look", { kind: "water", p: 0.8 }]]);
  R("nidhoggGnaw", { col: ["poison", "shadow"] }, [["crouch", { ms: 150 }], ["dash", { ms: 170, lean: 0.35 }], ["bite", { teeth: 5 }], par(["cloud", { n: 8, col: ["moss", "ink"], mote: "skull", ms: 700 }], ["arrows", { dir: "down", on: "tgt", col: "poison" }], ["shake", { v: 0.2 }])]);
  R("creepingStone", { col: ["stone", "sand"] }, [["spr", { on: "src", tex: "eye", hf: 1.15, pop: 1, ms: 450, size: 0.8, col: ["sand", "stone"] }], par(["beam", { kind: "line", ms: 360, w: 0.5, col: ["stone", 0xffffff] }], ["spikes", { on: "tgt", kind: "stone", n: 5, h: 0.8, w: 0.3, spread: 0.8, at: 200 }]), ["stonify", { ms: 800 }]]);
  // P6 Breakers
  R("ammitsFeast", { col: ["dark", "blood"] }, [["dash", { ms: 150, lean: 0.35 }], ["bite", { teeth: 4 }], par(["drain", { tex: "plus", n: 10, ms: 480, col: ["heal", "gold"] }], ["shake", { v: 0.16 }], ["flare", { on: "src", col: "heal", at: 300, go: 1 }])]);
  R("featherCushion", { col: ["wind", 0xffffff] }, [["dash", { ms: 120, hop: 0.5 }], ["hit", { kind: "pop" }], c => ["par", [["rain", { on: [lowest(c)], tex: "feather", n: 10, height: 4, ms: 400, fall: 380, land: "puff", spin: 2, size: 0.4, spread: 0.7, col: ["wind", 0xffffff] }], ["dome", { on: [lowest(c)], ms: 700, r: 0.8 }]]]]);
  R("dirtyLaundry", { col: ["violet", "shadow"] }, [["roar", { n: 2, shake: 0, col: ["violet", "shadow"], s: 0.8 }], par(["spr", { on: "tgt", tex: "eye", n: 3, hf: 0.95, size: 0.65, pop: 1, ms: 900, spread: 1.0, stagger: 100, bob: 0.1 }], ["arrows", { dir: "down", on: "tgt", col: ["violet", "shadow"] }], ["aura", { on: "tgt", tex: "smoke", col: "shadow", vy: 1, ms: 700, a: 0.5, grow: 1 }])]);
  // P7 Deep Bastion
  R("plantThePillar", { col: ["stone", "water"] }, [["crouch", { ms: 200, sy: 0.82 }], par(["spikes", { on: "src", kind: "stone", geo: "cylc", n: 1, h: 4, w: 1.2, ring: 0, spread: 0.05, ms: 900 }], ["dome", { on: "team", area: 1, ms: 900 }], ["shake", { v: 0.16 }]), ["ring", { on: "team", n: 2, r: 3.4 }]]);
  R("sunAscending", { col: ["sun", "gold"] }, [["sun", { on: "team", low: 1, ms: 850, beam: 1 }], ["aura", { on: "team", tex: "star", col: ["gold", 0xffffff], vy: 1.2, ms: 500, go: 1 }]]);
  R("tipTheBowl", { col: ["water", "steam"] }, [par(["spr", { on: "src", tex: "bowl", hf: 1.2, pop: 1, ms: 600, size: 1.0, col: ["stone", "water"], rot: 0.5, flip: 1 }]), ["rain", { on: "tgt", tex: "drop", n: 14, height: 5, land: "splash", ms: 380, fall: 300, spread: 0.6, hit: 0.9 }], ["look", { kind: "water", p: 0.7 }]]);
  // P8 Wildfire
  R("spontaneousCombustion", { col: ["fire", "gold"] }, [par(["aura", { tex: "flame", ms: 850, vy: 3, r: 1.1, rate: 90, size: 1.3 }], ["tint", { ms: 850, col: "fire", amt: 0.8, go: 1 }], ["jitter", { ms: 500, amp: 0.05 }], ["spr", { on: "src", tex: "flame", n: 5, hf: 1.0, size: 0.6, ms: 700, spread: 1.0, pop: 1 }]), ["flare", { col: "fire" }]]);
  R("misleadingLight", { col: ["fire", "gold"] }, [par(["spr", { on: "src", tex: "flame", hf: 1.2, size: 0.85, pop: 1, ms: 900, col: ["gold", "fire"], bob: 0.15 }], ["aura", { tex: "dot", col: ["fire", "gold"], ms: 800, vy: 0.8, r: 1.2, rate: 30, size: 1.4 }], ["roar", { n: 3, col: ["gold", "fire"], shake: 0 }])]);
  R("devouringWhirl", { col: ["water", "poison"] }, [par(["vortex", { on: "tgt", kind: "water", ms: 600, sink: 1 }], ["whirl", { on: "tgt", kind: "water", w: 1.3, h: 2.8, ms: 600 }]), ["drain", { tex: "dot", col: ["water", "poison"], n: 16, ms: 480 }]]);
  // P9 Endless Dawn
  R("silverLining", { col: ["steel", 0xffffff] }, [par(["spr", { on: "tgt", tex: "cloud", hf: 1.55, size: 2.2, pop: 1, ms: 900, a: 0.85 }], ["pillar", { on: "tgt", w: 0.9, h: 3.6, ms: 700 }]), ["dome", { on: "tgt", ms: 700 }]]);
  R("fallingDust", { col: ["moon", "gold"] }, [["wings", { ms: 400, flaps: 2, tex: "wing" }], ["rain", { on: "team", area: 1, tex: "dot", n: 32, ms: 650, fall: 650, size: 0.2, land: "none", height: 6, hit: 0.9 }]]);
  R("moonlitAntlers", { col: ["moon", 0xffffff] }, [par(["spr", { on: "src", tex: "moon", hf: 1.5, size: 1.4, pop: 1, ms: 950, bob: 0.1 }], ["aura", { tex: "star", vy: 1.5, ms: 800 }], ["ring", { on: "src", r: 3 }])]);
  // the lab creatures
  R("takeRoot", { col: ["nature", "moss"] }, [["crouch", { ms: 200, sy: 0.85 }], par(["spikes", { on: "src", kind: "thorn", ring: 1, n: 6, h: 0.9, w: 0.3, ms: 800 }], ["aura", { tex: "leaf", vy: 0.6, ms: 800, r: 1.0, spin: 2 }], ["ring", { on: "src", r: 3 }])]);
  R("sealedLetters", { col: ["bone", "red"] }, [["proj", { shape: "letter", n: 2, stagger: 130, ms: 320, hf: 0.6, arc: 1.2 }], ["spr", { on: "tgt", tex: "envelope", n: 2, ms: 900, size: 0.6, spread: 0.8, hf: 1.0, pop: 1, col: ["bone", "red"] }]]);
  R("keeningOmen", { col: ["poison", "violet"] }, [par(["roar", { n: 3, col: ["violet", "poison"], shake: 0 }], ["cloud", { on: "tgt", n: 6, col: ["moss", "ink"], mote: "dot", ms: 800, a: 0.45 }]), ["mark", { tex: "skull", col: ["poison", "violet"], ms: 1000, size: 0.9 }]]);
  R("redHotBronze", { col: ["ember", "gold"] }, [par(["tint", { ms: 950, col: "fire", amt: 0.9, go: 1 }], ["aura", { tex: "smoke", col: ["steam", "ember"], vy: 2.4, a: 0.4, ms: 800, r: 1.0 }], ["ring", { on: "src", r: 3, col: ["ember", "gold"] }], ["spr", { on: "src", tex: "flame", n: 3, hf: 0.2, size: 0.9, ms: 750, spread: 0.9 }])]);
  R("lamentOfThePod", { col: ["water", "moon"] }, [par(["roar", { n: 3, col: ["water", "moon"], shake: 0 }], ["proj", { shape: "note", on: "tgt", ms: 440, arc: 1.4 }]), par(["aura", { on: "tgt", tex: "drop", vy: 1.4, ms: 600, col: ["water", "heal"] }], ["ring", { on: "tgt", r: 2.8 }])]);
  R("lightTheHearth", { col: ["fire", "gold"] }, [["circle", { on: "src", ms: 900 }], par(["spr", { on: "src", tex: "flame", n: 3, hf: 0.15, size: 1.3, ms: 1000, spread: 0.5, rise: 0.3, grow: -0.2 }], ["aura", { on: "team", tex: "star", col: ["gold", "fire"], vy: 1, ms: 750 }], ["flare", { on: "team", col: "gold", s: 0.45 }])]);
  R("nightTerror", { col: ["shadow", "violet"] }, [["wings", { ms: 420, flaps: 1, tex: "wing" }], par(["vortex", { on: "tgt", kind: "dark", ms: 600 }], ["spr", { on: "tgt", tex: "skull", hf: 1.25, size: 1.3, pop: 1, ms: 750, bob: 0.1 }], ["jitter", { on: "tgt", ms: 480, amp: 0.07 }], ["cloud", { on: "tgt", n: 8, mote: "skull", ms: 700 }])]);
  R("moodScales", { col: ["rune", 0xffffff] }, [par(["spr", { on: "src", tex: "shell", col: "fire", n: 2, hf: 0.8, size: 0.7, pop: 1, ms: 700, spread: 0.7 }], ["spr", { on: "src", tex: "shell", col: "water", n: 2, hf: 0.5, size: 0.7, pop: 1, ms: 700, spread: 0.7, at: 90 }], ["spr", { on: "src", tex: "shell", col: "ice", n: 2, hf: 0.3, size: 0.7, pop: 1, ms: 700, spread: 0.7, at: 180 }], ["spr", { on: "src", tex: "shell", col: "shock", n: 2, hf: 1.05, size: 0.7, pop: 1, ms: 700, spread: 0.7, at: 270 }]), ["flare", { col: "light" }]]);
  R("dreamEater", { col: ["violet", "shadow"] }, [par(["drain", { on: "tgt", tex: "smoke", n: 12, ms: 560, col: ["violet", "shadow"] }], ["spr", { on: "src", tex: "moon", hf: 1.4, size: 0.9, pop: 1, ms: 800, col: ["violet", 0xffffff], bob: 0.1 }]), ["flare", { on: "src", col: "violet" }]]);

  // ============================== SKILL-BOOK MOVES (same elements as the style moves, different shapes) ==============================
  R("ramStrike", { col: ["steel", "bone"] }, [["crouch", { ms: 170, lean: 0.3, sy: 0.84 }], SND("whooshBig"), ["dash", { ms: 200, lean: 0.5 }], par(["spr", { tex: "horn", hf: 0.55, size: 1.4, col: "bone", rot: -0.3, flip: 1, pop: 1, ms: 300, dx: -0.3 }], ["spr", { tex: "horn", hf: 0.55, size: 1.4, col: "bone", rot: 0.3, pop: 1, ms: 300, dx: 0.3, sx: -1, flip: 0 }], ["spr", { tex: "ring", hf: 0.5, size: 0.5, grow: 5, ms: 380, a: 0.9, col: ["steel", 0xffffff] }], ["knock", { d: 1.0, ms: 180 }], ["hit", { kind: "smash", shake: 0.2 }])]);
  R("dampenWing", { col: ["water", "ink"] }, [["proj", { shape: "drop", n: 3, spread: 0.7, ms: 300, stagger: 90, arc: 1.0, hf: 0.7 }], par(["rain", { on: "tgt", tex: "drop", n: 12, height: 4, land: "splash", ms: 400, fall: 280, spread: 0.7 }], ["arrows", { dir: "down", on: "tgt", col: ["steel", "water"] }], ["squash", { on: "tgt", sy: 0.86, ms: 260 }])]);
  R("coldSnap", { col: ["ice", 0xffffff] }, [["gather", { ms: 140, tex: "snow", n: 8 }], ["proj", { shape: "ice", from: "sky", ms: 240, s: 1.5, arc: 0, hf: 0.7 }], par(["spikes", { on: "tgt", kind: "ice", n: 5, h: 1.5 }], ["ring", { r: 3 }], ["shards", { n: 12, tex: "shard" }])]);
  R("douse", { col: ["water", "steam"] }, [["lean", { a: -0.2, ms: 110 }], ["proj", { shape: "flask", ms: 380, arc: 2.2, hf: 0.7 }], par(["look", { kind: "water", p: 0.9 }], ["cloud", { on: "tgt", n: 5, col: ["steam", 0xffffff], mote: "drop", ms: 500, a: 0.4 }])]);
  R("sporeCloud", { col: ["gold", "moss"] }, [["rear", { ms: 150, h: 0.1, a: 0.2 }], par(["cloud", { on: "foes", area: 1, n: 12, size: 1.2, ms: 900, mote: "star", col: ["sand", "gold"], a: 0.4 }], ["aura", { on: "foes", tex: "dot", col: ["gold", "moss"], vy: 1.2, ms: 800, rate: 45, r: 1.2, size: 1.1 }])]);
  R("kindle", { col: ["fire", "gold"] }, [["gather", { ms: 130, tex: "flame", n: 6 }], par(["spr", { on: "tgt", tex: "flame", hf: 0.2, size: 0.3, grow: 2.5, ms: 650, pop: 1 }], ["pillar", { on: "tgt", w: 0.7, h: 3.4, ms: 600, tex: "flame", at: 160 }]), ["look", { kind: "fire", p: 0.6 }]]);
  R("soak", { col: ["water", "steam"] }, [["rear", { ms: 110, h: 0.05, a: 0.15 }], ["storm", { kind: "rain", ms: 560, s: 0.7 }]]);
  R("revive", { col: ["gold", 0xffffff] }, [["circle", { on: "tgt", ms: 900 }], par(["pillar", { on: "tgt", fall: 1, w: 1.3, h: 10, ms: 700 }], ["spr", { on: "tgt", tex: "plus", n: 4, rise: 1.4, ms: 800, size: 0.55, col: ["gold", 0xffffff], spread: 0.6, hf: 0.3, stagger: 90, alt: 1 }]), ["flare", { on: "tgt", col: "gold" }]]);

  // ---------- SKILL BOOK, CHAPTERS 6-11 + POST-GAME (SKILLBOOK agent 2026-10-31): none shares its shape with another move ----------
  // Kelp Poultice = wet kelp falls over the whole team; Chisel Crack = a chisel blow that cracks the plate; Gilt Shield = gold leaf rains onto one ally and a gold dome closes
  R("kelpPoultice", { col: ["moss", "water"] }, [["crouch", { ms: 170, sy: 0.9 }], par(["rain", { on: "team", tex: "leaf", n: 14, ms: 620, spread: 1.7, height: 4, land: "splash", fall: 380, spin: 2, col: ["moss", "water"] }], ["spr", { on: "src", tex: "wave", hf: 0.5, pop: 1, ms: 520, size: 0.8, col: ["water", "moss"] }]), par(["aura", { on: "team", tex: "plus", col: ["heal", "moss"], vy: 1.1, ms: 600 }], ["ring", { on: "team", r: 2.8, col: ["moss", "heal"] }])]);
  R("chiselCrack", { col: ["steel", "gold"] }, [["lean", { a: 0.25, ms: 130 }], ["dash", { ms: 170, lean: 0.4, reach: 0.9 }], par(["spr", { tex: "blade", hf: 0.8, size: 1.0, rot: -0.9, pop: 1, ms: 280, col: ["steel", "gold"] }], ["hit", { kind: "smash", shake: 0.2 }], ["crack", { on: "tgt", line: 1 }], ["shards", { on: "tgt", tex: "shard", n: 12, speed: 5 }]), ["arrows", { dir: "down", on: "tgt", col: ["steel", "gold"] }], ["home", { ms: 140 }]]);
  R("giltShield", { col: ["gold", "sun"] }, [["proj", { shape: "star", on: "tgt", ms: 360, arc: 1.6, hf: 0.7 }], par(["rain", { on: "tgt", tex: "leaf", n: 16, ms: 620, height: 3, spread: 0.6, land: "spark", fall: 320, spin: 4, col: ["gold", "sun"] }], ["dome", { on: "tgt", ms: 820, col: ["gold", 0xffffff] }], ["spr", { on: "tgt", tex: "shieldIcon", hf: 0.6, pop: 1, ms: 700, size: 0.95, col: ["gold", 0xffffff] }])]);
  // Bitter Rue = a grey sprig thrown, the sickness leaves the ally as dark motes; Root Draught = amber sap flows into the ally and its MP pips light up
  R("bitterRue", { col: ["moss", "poison"] }, [["proj", { shape: "leaf", on: "tgt", ms: 340, arc: 1.3, hf: 0.7 }], par(["cloud", { on: "tgt", n: 7, mote: "leaf", ms: 700, col: ["moss", "poison"], a: 0.45 }], ["spr", { on: "tgt", tex: "dot", n: 8, rise: 1.7, ms: 650, size: 0.4, col: ["violet", "poison"], spread: 0.5, hf: 0.3 }]), ["flare", { on: "tgt", col: "heal" }]]);
  R("rootDraught", { col: ["gold", "ember"] }, [["crouch", { ms: 150, sy: 0.92 }], ["drain", { rev: 1, tex: "drop", n: 10, ms: 520, col: ["gold", "ember"] }], par(["spr", { on: "tgt", tex: "star", n: 8, rise: 1.5, ms: 700, size: 0.4, col: ["gold", "fire"], spread: 0.5, hf: 0.2, stagger: 50 }], ["arrows", { dir: "up", on: "tgt", col: ["gold", "ember"] }], ["ring", { on: "tgt", r: 2.6, col: ["gold", "ember"] }])]);
  // Static Snare = an orb of static that wraps the target in crackling chain, then a jolt; Banner Decoy = a scorched banner and a loud mark over the carrier; Lantern Vigil = a pale lantern hangs over the ally
  R("staticSnare", { col: ["shock", 0xffffff] }, [["rear", { ms: 150, h: 0.2, a: 0.25 }], ["proj", { shape: "orb", ms: 300, hf: 0.7 }], par(["cage", { on: "tgt", kind: "chain", n: 6, ms: 760, col: ["shock", 0xffffff] }], ["spr", { on: "tgt", tex: "zig", n: 3, hf: 0.7, size: 0.8, ms: 500, spread: 0.5, col: ["shock", 0xffffff] }], ["jitter", { on: "tgt", ms: 520, amp: 0.08 }], ["flare", { on: "tgt", col: "shock" }])]);
  R("bannerDecoy", { col: ["red", "gold"] }, [["rear", { ms: 200, h: 0.4, a: 0.3 }], par(["spr", { on: "src", tex: "excl", hf: 1.55, pop: 1, bob: 0.1, size: 1.4, ms: 900, col: ["red", "gold"] }], ["aura", { on: "src", tex: "chev", col: ["red", "gold"], vy: 1.4, ms: 700, rate: 30, size: 0.8 }], ["roar", { n: 1, shake: 0.05 }]), par(["ring", { on: "src", n: 2, r: 3.0, gap: 100, col: ["red", "gold"] }], ["dome", { on: "src", ms: 650, col: ["red", "gold"] }])]);
  R("lanternVigil", { col: ["ice", 0xffffff] }, [["spr", { on: "tgt", tex: "sun", hf: 1.55, pop: 1, bob: 0.1, size: 0.7, ms: 1000, col: ["ice", 0xffffff] }], par(["pillar", { on: "tgt", fall: 1, w: 0.6, h: 7, ms: 700, col: ["ice", 0xffffff] }], ["ring", { on: "tgt", n: 2, r: 2.8, gap: 120, col: ["ice", 0xffffff] }], ["spr", { on: "tgt", tex: "heart", hf: 0.7, pop: 1, ms: 800, size: 0.55, col: ["ice", 0xffffff] }])]);

  // ---------- LATE-GAME STYLE MOVES (MOVE-RESEARCH 2026-10-31, learn levels 28-60; one recipe each, none shares a shape with another move) ----------
  // Minotaur: Decimate = tally strokes of the legion's punishment on a weak target; Standard = a horned banner rises over the team
  R("decimate", { col: ["bone", "blood"] }, [["rear", { ms: 260, h: 0.9, a: 0.4 }], par(["gather", { ms: 260, tex: "dot", n: 14, col: ["blood", "bone"] }], ["tint", { ms: 400, col: "red", amt: 0.5, go: 1 }]), SND("whooshBig"), ["dash", { ms: 200, lean: 0.5, reach: 0.9 }], par(["slash", { n: 1, ang: 1.45, s: 2.0 }], ["hit", { kind: "smash", shake: 0.34 }], ["spr", { tex: "slash", n: 5, stagger: 60, size: 0.55, col: "bone", hf: 0.9, spread: 0.5, ms: 520, rot: 0.8 }]), ["home", { ms: 160 }]]);
  R("hornStandard", { col: ["gold", "blood"] }, [["rear", { ms: 220, h: 0.5, a: 0.3 }], par(["spr", { on: "src", tex: "horn", hf: 1.9, pop: 1, bob: 0.08, size: 2.2, ms: 1000, col: ["gold", "blood"] }], ["roar", { n: 2, shake: 0.1 }]), par(["arrows", { dir: "up", on: "team", col: "red" }], ["ring", { on: "team", n: 2, gap: 120, r: 3.4, col: ["red", "gold"] }], ["aura", { on: "team", tex: "chev", col: ["gold", "red"], vy: 1.6, ms: 600, rate: 24, size: 0.7 }])]);
  // Harpy: Augur's Eye = a golden eye opens over the target and a mark falls on it; Gale = a rain of feathers that drags every enemy down
  R("augurEye", { col: ["gold", 0xffffff] }, [["wings", { ms: 240, flaps: 1 }], par(["spr", { on: "src", tex: "eye", hf: 1.25, pop: 1, ms: 520, size: 0.9, col: ["gold", "wind"] }]), ["proj", { shape: "eye", ms: 380, hf: 0.9, arc: 0.5 }], par(["mark", { on: "tgt", col: ["red", "gold"], size: 0.9 }], ["ring", { on: "tgt", n: 2, r: 2.6, col: ["gold", "red"] }], ["flare", { on: "tgt", col: "gold" }])]);
  R("scatterGale", { col: ["wind", "white"] }, [["wings", { ms: 300, flaps: 3, go: 1 }], ["rise", { ms: 240, h: 1.6, tilt: 0.1 }], par(["rain", { on: "foes", tex: "feather", n: 16, ms: 640, spread: 1.4, height: 5, land: "puff", fall: 380, spin: 3, col: ["wind", "white"], slant: 1 }], ["arrows", { dir: "down", on: "foes", col: ["wind", "white"], at: 300 }], ["spr", { on: "foes", tex: "hourglass", hf: 1.2, pop: 1, bob: 0.1, ms: 700, size: 0.55, col: ["white", "wind"], at: 300 }]), ["home", { ms: 160 }]]);
  // Hydra: Vine = a seed roots and the life flows back to the caster; Blight = a spore cloud drifts over the whole line; Fang = three bites, three colours
  R("hungryVine", { col: ["nature", "heal"] }, [["rear", { ms: 150, h: 0.15, a: 0.2 }], ["proj", { shape: "seed", ms: 340, hf: 0.7 }], par(["spr", { on: "tgt", tex: "leaf", n: 7, rise: 1.4, ms: 700, size: 0.5, spread: 0.6, col: ["nature", "poison"], spin: 3, hf: 0.2 }], ["cage", { on: "tgt", kind: "thorn", n: 6, ms: 700 }]), ["drain", { tex: "plus", n: 10, ms: 560, col: ["heal", "nature"] }]]);
  R("spreadBlight", { col: ["poison", "blood"] }, [["rear", { ms: 150, h: 0.2, a: 0.25 }], ["proj", { shape: "glob", ms: 320, hf: 0.7 }], par(["cloud", { on: "foes", area: 1, n: 12, size: 1.2, a: 0.45, ms: 900, mote: "bubble", col: ["poison", "fire"] }], ["spr", { on: "foes", tex: "skull", hf: 1.15, pop: 1, size: 0.55, ms: 700, stagger: 110, col: ["moss", "bone"] }], ["arrows", { dir: "down", on: "foes", col: ["poison", "blood"], at: 250 }])]);
  R("tripleFang", { col: ["blood", "poison"] }, [["dash", { ms: 140, lean: 0.35 }], ["bite", { teeth: 3, col: ["blood", "bone"] }], 60, ["bite", { teeth: 3, col: ["poison", "bone"] }], 60, par(["bite", { teeth: 3, col: ["fire", "gold"] }], ["spr", { tex: "fang", n: 3, hf: 0.7, size: 0.5, ms: 500, spread: 0.5, col: "bone" }]), ["home", { ms: 140 }]]);
  // Colossus: Thornwall = thorns burst around the whole team; Idol = blood flows into a stone idol on an ally; Unbowed = a column of stone grips the feet
  R("thornwall", { col: ["nature", "stone"] }, [["crouch", { ms: 200, sy: 0.84 }], SND("whooshBig"), par(["spikes", { on: "team", kind: "thorn", n: 5, h: 1.5, w: 0.32, ms: 760, ring: 1 }], ["quake", { on: "team", shake: 0.18, cracks: 0 }]), ["aura", { on: "team", tex: "leaf", col: ["nature", "stone"], vy: 0.8, ms: 500, rate: 18, size: 0.6 }]]);
  R("idolStandIn", { col: ["blood", "stone"] }, [["crouch", { ms: 180, sy: 0.88 }], par(["spr", { on: "src", tex: "drop", n: 4, rise: 1.1, ms: 520, size: 0.35, col: "blood", spread: 0.45, hf: 0.7 }], ["shake", { v: 0.03 }]), ["drain", { rev: 1, tex: "drop", n: 10, ms: 520, col: ["blood", "gold"] }], par(["dome", { on: "tgt", ms: 800, col: ["stone", "gold"] }], ["spr", { on: "tgt", tex: "shieldIcon", hf: 0.6, pop: 1, ms: 700, size: 1.0, col: ["stone", "gold"] }], ["shards", { on: "tgt", tex: "rock", n: 8, speed: 3.5 }])]);
  R("unbowed", { col: ["stone", "gold"] }, [["crouch", { ms: 240, sy: 0.8 }], par(["pillar", { on: "src", fall: 0, w: 1.0, h: 4.5, ms: 650, tex: "rock", col: ["stone", "gold"] }], ["quake", { on: "src", shake: 0.22, cracks: 0 }], ["tint", { ms: 650, col: "gold", amt: 0.45, go: 1 }]), par(["spr", { on: "src", tex: "heart", hf: 0.75, pop: 1, ms: 800, size: 0.8, col: ["gold", "red"] }], ["ring", { on: "src", n: 2, r: 2.6, col: ["gold", "stone"] }])]);
  // Phoenix: Wish = a falling star and an hourglass over the ally; Veil = dawn light rains down under a dome; Offering = the Phoenix's own heart-flame flows out to the others
  R("emberWish", { col: ["gold", "fire"] }, [["gather", { ms: 200, tex: "star", n: 10, col: ["gold", 0xffffff] }], ["proj", { shape: "star", on: "tgt", ms: 520, arc: 2.8, s: 1.2 }], par(["spr", { on: "tgt", tex: "hourglass", hf: 1.3, pop: 1, bob: 0.1, ms: 950, size: 0.8, col: ["gold", "fire"] }], ["ring", { on: "tgt", n: 2, r: 2.8, col: ["gold", "fire"] }], ["flare", { on: "tgt", col: "gold" }])]);
  R("dawnVeil", { col: ["gold", 0xffffff] }, [["wings", { ms: 260, flaps: 1 }], par(["dome", { on: "team", area: 1, ms: 700, col: ["gold", "white"] }], ["rain", { on: "team", tex: "star", n: 16, ms: 600, spread: 1.7, height: 5.5, land: "spark", fall: 420, col: ["gold", 0xffffff] }]), ["arrows", { dir: "up", on: "team", col: ["gold", "white"] }]]);
  R("heartfireOffering", { col: ["red", "fire"] }, [["crouch", { ms: 240, sy: 0.84 }], par(["spr", { on: "src", tex: "heart", hf: 0.85, pop: 1, bob: 0.06, ms: 760, size: 1.0, col: ["red", "gold"] }], ["aura", { on: "src", tex: "flame", ms: 640, vy: 1.8, r: 0.8, col: ["red", "gold"] }]), ["wings", { ms: 400, flaps: 2, go: 1 }], par(["pillar", { on: "ally", fall: 1, w: 1.3, h: 8, ms: 650, tex: "flame", col: ["red", "gold"] }], ["spr", { on: "ally", tex: "plus", n: 4, rise: 1.5, ms: 800, size: 0.5, col: ["heal", "gold"], spread: 0.6, hf: 0.2, stagger: 80 }])]);
  // Gorgon: Verdict = a stone tablet falls like a gavel and brands the target; Choir = a hissing chorus of notes sinks every enemy
  R("verdictOfStone", { col: ["stone", "gold"] }, [["spr", { on: "src", tex: "eye", hf: 1.15, pop: 1, ms: 520, size: 0.9, col: ["violet", "stone"] }], ["proj", { shape: "rock", on: "tgt", from: "sky", s: 2.4, ms: 440, arc: 0 }], par(["hit", { kind: "smash", shake: 0.26 }], ["crack", { on: "tgt", line: 1 }], ["mark", { on: "tgt", col: ["red", "gold"], size: 0.9 }], ["spr", { on: "tgt", tex: "rune", hf: 0.9, pop: 1, ms: 800, size: 1.1, col: ["stone", "gold"] }])]);
  R("hissingChoir", { col: ["moss", "violet"] }, [["rear", { ms: 170, h: 0.2, a: 0.3 }], par(["spr", { on: "src", tex: "note", n: 6, rise: 1.6, ms: 650, size: 0.5, col: ["moss", "violet"], spread: 0.7, hf: 0.9, spin: 2 }], ["proj", { shape: "sonic", on: "foes", n: 3, stagger: 100, ms: 400, hf: 0.6 }]), par(["arrows", { dir: "down", on: "foes", col: ["moss", "violet"] }], ["jitter", { on: "foes", ms: 420, amp: 0.07 }], ["spr", { on: "foes", tex: "note", n: 3, rise: -1.2, ms: 600, size: 0.45, col: "violet", spread: 0.5, hf: 1.1 }])]);
  // Dragon: Stormchain = a bolt that jumps from enemy to enemy; Gathering = lightning coils around the dragon; Comet = a burning star appears high above the target (cometFall plays when it lands at the end of next round)
  R("stormchain", { col: ["shock", 0xffffff] }, [["gather", { ms: 150, tex: "star", n: 8 }], ["bolt", { on: "tgt", n: 1 }], par(["bolt", { on: "foes", n: 1, dx: 0.4 }], ["ring", { on: "foes", n: 2, r: 3.0, gap: 90 }], ["shake", { v: 0.1 }])]);
  R("stormGathering", { col: ["shock", "gold"] }, [["crouch", { ms: 240, sy: 0.88 }], par(["gather", { ms: 420, tex: "star", n: 22, col: ["shock", 0xffffff], r: 1.6 }], ["aura", { on: "src", tex: "streak", ms: 640, vy: 2.2, r: 0.7, col: ["shock", 0xffffff], rate: 40 }], ["circle", { on: "src", ms: 700 }]), ["flare", { on: "src", col: "shock" }], ["arrows", { dir: "up", on: "src", col: "shock" }]]);
  R("cometCall", { col: ["fire", "gold"] }, [["rear", { ms: 220, h: 0.4, a: 0.3 }], par(["gather", { ms: 300, tex: "flame", n: 12 }], ["spr", { on: "tgt", tex: "flame", hf: 3.2, pop: 1, size: 1.2, ms: 700, col: ["fire", "gold"] }]), par(["mark", { on: "tgt", col: ["fire", "gold"], size: 0.9 }], ["spr", { on: "tgt", tex: "hourglass", hf: 1.4, pop: 1, bob: 0.1, ms: 800, size: 0.6, col: ["fire", "gold"] }], ["ring", { on: "tgt", n: 2, r: 2.8, col: ["fire", "gold"] }])]);
  R("cometFall", { col: ["fire", "gold"] }, [["meteor", { on: "tgt", s: 3.2, ms: 520, bs: 1.4 }], par(["quake", { on: "tgt", shake: 0.42, cracks: 1 }], ["shards", { on: "tgt", tex: "rock", n: 14 }], ["spr", { on: "tgt", tex: "flame", n: 5, rise: 1.8, ms: 700, size: 0.7, spread: 0.7 }])]);
  // Leviathan: Ebb = the tide drains out and returns as healing; Flood = rain and a rising swell soak every enemy; Weight = a column of the deep presses down
  R("ebbTide", { col: ["water", "heal"] }, [["crouch", { ms: 300, sy: 1.1 }], par(["vortex", { on: "src", kind: "water", ms: 620 }], ["drain", { rev: 1, tex: "drop", n: 9, ms: 560, col: ["water", "heal"] }]), par(["ring", { on: "team", n: 3, gap: 100, r: 3.4, col: ["water", "heal"] }], ["spr", { on: "team", tex: "plus", n: 4, rise: 1.6, ms: 800, size: 0.5, col: ["heal", "water"], spread: 0.6, hf: 0.2, stagger: 70 }])]);
  R("risingFlood", { col: ["water", "steam"] }, [["rear", { ms: 180, h: 0.3, a: 0.25 }], par(["storm", { on: "foes", kind: "rain", area: 1, ms: 800 }], ["wave", { on: "foes", kind: "water", rows: 1, s: 0.8, ms: 600, at: 150 }]), ["arrows", { dir: "down", on: "foes", col: ["water", "steam"] }]]);
  R("weightOfDeep", { col: ["water", "steam"] }, [["crouch", { ms: 240, sy: 0.9 }], par(["pillar", { on: "tgt", fall: 1, w: 2.2, h: 10, ms: 620, tex: "drop", col: ["water", "steam"] }], ["hit", { kind: "smash", shake: 0.36 }], ["squash", { on: "tgt", ms: 240, sy: 0.7 }]), ["crack", { on: "tgt", line: 1 }]]);

  // ============================== ITEMS ==============================
  R("@potion", { col: ["heal", "gold"] }, [["lean", { a: -0.2, ms: 100 }], ["proj", { shape: "flask", on: "tgt", ms: 340, arc: 1.8 }], par(["cloud", { on: "tgt", n: 6, mote: "plus", ms: 520, a: 0.4 }], ["ring", { on: "tgt", r: 2.6 }])]);
  R("@antidote", { col: ["violet", 0xffffff] }, [["lean", { a: -0.2, ms: 100 }], ["proj", { shape: "flask", on: "tgt", ms: 340, arc: 1.5, s: 0.8 }], par(["aura", { on: "tgt", tex: "smoke", col: ["moss", "ink"], vy: 2, ms: 600, a: 0.45, grow: 1 }], ["spr", { on: "tgt", tex: "star", n: 5, rise: 1.5, ms: 600, size: 0.4, col: [0xffffff, "violet"], spread: 0.7, hf: 0.2, alt: 1 }])]);
  R("@ember", { col: ["fire", "gold"] }, [["lean", { a: -0.2, ms: 100 }], ["proj", { shape: "ember", on: "tgt", ms: 440, arc: 2.4, s: 1.2 }], par(["pillar", { on: "tgt", w: 0.8, h: 4, ms: 600, tex: "flame" }], ["blast", { on: "tgt", kind: "fire", s: 0.7, shake: 0 }])]);

  // ============================== ENEMY ABILITIES ==============================
  // Enemy abilities have no id. Lookup: SIG[exact lower-case name] -> a player move with that name (generals) -> KEY[regex on the name] -> autoRecipe (element + hash of the name).
  // The templates below are functions of the context, so they follow the ability's element (e.el, or a word in its name), size and target.
  const NAME_EL = [[/venom|poison|toxic|spore|acid|plague|rot|fester|slime|goo|ooze|miasma|pollen|reed dust|poison cap/, "poison"], [/fire|flame|burn|ember|torch|slag|lava|cinder|scorch|scald|inferno|blaze|magma|sear|kiln|candle|smoke|boil/, "fire"], [/frost|ice|chill|freez|snow|glacier|rime|cold|shard|crest/, "ice"],
    [/shock|spark|zap|thunder|lightning|volt|static|storm/, "shock"], [/water|tide|wave|drown|brine|splash|flood|spray|torrent|surf|spout|drip|bubble|soak|quench|steam|spring|pool|rain|siren|dew|undertow|whirlpool|maelstrom|drag (under|down|aboard)|pull down/, "water"], [/stone|rock|boulder|earth|quake|gravel|basalt|crush|tremor|slab|sky-stone|giant|stamp|sand|dust of ages/, "earth"],
    [/wind|gust|gale|cyclone|feather|wing|squall|breeze|talon|swoop|updraft|flutter|flap|sky/, "wind"], [/light|sun|solar|lantern|glow|facet|prism|dazzle|flash|refract|pearl|mirror|spectrum|radiant|holy|dawn|gleam|glare|lamp|shine|glint|blessing|meteor|lure/, "light"],
    [/dark|shadow|curse|drain|void|night|soul|grave|death|whisper|hex|dread|gloom|umbral|voices|eclipse|dim|black|terror|murmur|blood rite|corona|reaching/, "dark"], [/leaf|vine|root|thorn|moss|bloom|bramble|sap|wild|seed|grove|reed/, "nature"], [/blood|bleed|rend|gore|gash|lacerat|rake|claw|fang/, "blood"]];
  const nameEl = name => { for (const [re, k] of NAME_EL) if (re.test(name)) return k; return null; };
  const ELSHAPE = { fire: "fire", water: "drop", ice: "ice", shock: "bolt", earth: "rock", wind: "wind", light: "star", dark: "skull", nature: "leaf", poison: "glob", blood: "glob" };
  const ELTEX = { fire: "flame", water: "drop", ice: "snow", shock: "star", earth: "rock", wind: "leaf", light: "star", dark: "smoke", nature: "leaf", poison: "bubble", blood: "drop" };
  const big = c => c.src.view.h > 4;
  const E = {};
  E.bite = c => [["dash", { ms: 140, lean: 0.3 }], ["bite", { teeth: big(c) ? 5 : 3 }], c.el === "poison" ? ["spr", { tex: "drop", n: 3, rise: -1.2, ms: 450, size: 0.28, spread: 0.3, go: 1 }] : c.el === "blood" ? ["spr", { tex: "drop", n: 4, rise: 1.2, ms: 450, size: 0.26, col: "blood", spread: 0.4, go: 1 }] : 20];
  E.claw = c => [["dash", { ms: 130, hop: 0.4 }], ["claws", { n: big(c) ? 2 : 1, ang: 0.5 }]];
  E.slam = c => [["dash", { ms: 190 }], ["rear", { ms: 130, h: 0.35, a: 0.25 }], ["fall", { ms: 80 }], par(["hit", { kind: "smash", shake: big(c) ? 0.25 : 0.14 }], ["crack", { r: 2.4 }])];
  E.charge = c => [["crouch", { ms: 150, lean: 0.3, sy: 0.84 }], SND("whoosh"), ["dash", { ms: 210, lean: 0.5, dust: "sand" }], par(["hit", { kind: "smash", shake: 0.18 }], ["knock", { d: 1.0, ms: 180 }])];
  E.sting = c => [["lean", { a: -0.2, ms: 110 }], ["dash", { ms: 130 }], par(["hit", { kind: "pierce" }], ["spr", { tex: "drop", n: 3, rise: -1, ms: 450, size: 0.26, col: c.el === "poison" ? "poison" : "blood", spread: 0.3 }])];
  E.sweep = c => [["spin", { ms: 320, n: 1, ease: EASE.lin }], par(["wave", { kind: c.el && COL[c.el] ? c.el : "sand", on: "foes", rows: 2, s: 0.8, ms: 420, land: 1 }], ["shake", { v: 0.12 }])];
  E.shot = c => { const n = String(c.e.move || "").toLowerCase(), shape = /sling|stone|rock|boulder|throw|hurl/.test(n) ? "rock" : /spear|javelin|lance/.test(n) ? "spear" : /dart|needle|quill/.test(n) ? "dart" : "arrow"; return [["lean", { a: -0.2, ms: 110 }], SND("whoosh"), ["proj", { shape, ms: 260, hf: 0.6 }]]; };
  E.spit = c => [["rear", { ms: 130, h: 0.1, a: 0.2 }], ["proj", { shape: "glob", ms: 340, hf: 0.7 }], ["look", { kind: c.el || "poison", p: 0.8 }]];
  E.breath = c => [["gather", { ms: 150, tex: ELTEX[c.el] || "flame" }], ["stream", { tex: ELTEX[c.el] || "flame", ms: 480, rate: 80, size: 0.9 }], ["look", { kind: c.el || "fire", p: 0.8 }]];
  E.zap = c => [["gather", { ms: 130, tex: "star" }], ["bolt", { n: c.e.big ? 3 : 1, col: ["shock", 0xffffff] }]];
  E.bolt = c => [["charge", { ms: 170 }], ["proj", { shape: ELSHAPE[c.el] || "orb", ms: 300 }], ["blast", { kind: c.el || "light", s: 0.7, shake: 0 }]];
  E.drain = c => [["dash", { ms: 140 }], ["hit", { kind: "pop" }], ["drain", { tex: "dot", n: 12, ms: 480, col: ["dark", "violet"] }], ["flare", { on: "src", col: "violet" }]];
  E.howl = c => [["rear", { ms: 160, h: 0.3, a: 0.3 }], par(["roar", { n: 3, shake: 0.12 }], ["arrows", { dir: "down", on: "foes", col: ["violet", "steel"] }])];
  E.rally = c => [["rear", { ms: 160, h: 0.3, a: 0.3 }], par(["roar", { n: 2, shake: 0.08 }], ["arrows", { dir: "up", on: "team", col: ["gold", "red"] }], ["aura", { on: "team", tex: "star", col: ["gold", "red"], vy: 1.4, ms: 600 }])];
  E.guard = c => [["crouch", { ms: 180, sy: 0.85 }], par(["dome", { on: "src", ms: 700 }], ["shield", { on: "src", col: ["steel", "brass"] }])];
  E.vanish = c => [par(["cloud", { on: "src", n: 6, mote: "dot", col: ["sand", "ink"], ms: 450 }], ["tint", { on: "src", ms: 400, col: "sand", amt: 0.6 }], ["jitter", { ms: 300, amp: 0.05 }])];
  E.summon = c => [["circle", { on: "src", ms: 800, col: ["violet", "shadow"] }], par(["pillar", { on: "src", w: 1.0, h: 5, ms: 500, col: ["violet", "shadow"] }], ["cloud", { on: "src", n: 6, col: ["shadow", "violet"], mote: "dot", ms: 600 }])];
  E.gaze = c => [["spr", { on: "src", tex: "eye", hf: 1.1, pop: 1, ms: 600, size: 0.9 }], ["beam", { kind: "line", ms: 420, w: 0.7 }], ["jitter", { on: "tgts", ms: 300, amp: 0.05 }]];
  E.curse = c => [["circle", { on: "tgts", ms: 800, col: ["violet", "shadow"] }], par(["mark", { on: "tgts", tex: "rune", col: "violet", ms: 800, size: 0.8 }], ["arrows", { dir: "down", on: "tgts", col: ["violet", "shadow"] }])];
  E.swarm = c => [["rear", { ms: 130, h: 0.1, a: 0.2 }], par(["cloud", { on: "foes", area: 1, n: 12, size: 1.1, ms: 800, mote: "dot", col: c.el && COL[c.el] ? [c.el, "ink"] : ["ink", "sand"], a: 0.4 }], ["aura", { on: "foes", tex: "dot", col: ["ink", "sand"], vy: 0.6, ms: 700, rate: 40, r: 1.2 }])];
  E.dive = c => [["rise", { ms: 240, h: 3, tilt: 0.25 }], ["leap", { ms: 220, h: 0.5, lean: 0.4 }], ["claws", { n: 1, ang: 0.4 }]];
  E.heal = c => [["crouch", { ms: 160, sy: 0.88 }], par(["aura", { on: "src", tex: "plus", col: ["heal", "gold"], vy: 1.6, ms: 600 }], ["ring", { on: "src", r: 2.8, col: "heal" }])];
  E.quake = c => [["rear", { ms: 180, h: 0.5, a: 0.3 }], ["fall", { ms: 90 }], ["quake", { on: "foes", shake: 0.3, hop: 1 }]];
  E.web = c => [["rear", { ms: 130, h: 0.1, a: 0.2 }], ["proj", { shape: "glob", ms: 300, col: ["steel", 0xffffff] }], ["web", { ms: 800 }]];
  E.grab = c => [["dash", { ms: 150 }], ["coil", { ms: 600, turns: 1.6 }], ["squash", { on: "tgt", ms: 200, sy: 0.8 }]];
  E.torch = c => [["dash", { ms: 150, lean: 0.3 }], par(["slash", { n: 1, ang: 0.5 }], ["look", { kind: "fire", p: 0.7 }])];
  KEY.push(
    [/\b(heal|mend|regrow|restore|recover|lick|renew|rest|revive)/, E.heal], [/\b(rally|battle cry|war cry|inspire|command|banner|call to arms|formation)/, E.rally],
    [/\b(howl|roar|bellow|screech|shriek|cry|shout|scream|bark|hoot|growl|wail|bleat|hiss)/, E.howl], [/\b(harden|brace|guard|shell|block|shield up|fortify|bulwark|cover|carapace|stance|stone skin|turtle)/, E.guard],
    [/\b(vanish|burrow|flicker|blink|dodge|hide|mirage|fade|disappear|phase|sink|circle and snap)/, E.vanish], [/\b(summon|call forth|ritual|conjure|raise|animate)/, E.summon],
    [/\b(gaze|glare|stare|hypno|evil eye|watch)/, E.gaze], [/\b(curse|hex|whisper|riddle|hush|doom|omen|dread|dirge|lament|haunt|voices)/, E.curse],
    [/\b(swarm|locust|cloud|spore|mist|gas|fog|smog|miasma|plague|buzz)/, E.swarm], [/\b(breath|flame jet|fire stream|spout|spray|jet|belch)/, E.breath],
    [/\b(web|net|snare|ensnare|entangle|bind)/, E.web], [/\b(grab|grapple|constrict|coil|wrap|squeeze|engulf|hug)/, E.grab],
    [/\b(spark|zap|shock|lightning|thunder|static|bolt|arc)/, E.zap], [/\b(drain|siphon|leech|sap|devour|feast|suck|absorb|touch)/, E.drain],
    [/\b(torch|firebrand|ember swing)/, E.torch], [/\b(spit|ink|goo|blot|slime|acid|toss|hurl|lob|glob|sand toss|splash)/, E.spit],
    [/\b(shot|sling|arrow|aimed|bow|javelin|throw|dart|volley|snipe)/, E.shot], [/\b(dive|swoop|plunge|stoop|pounce|drop on)/, E.dive],
    [/\b(sting|stab|thrust|spear|pierce|lunge|barb|quill|spike|needle|skewer|lance)/, E.sting], [/\b(sweep|swing|whirl|spin|cleave|tail|lash|whip|thresh|flurry)/, E.sweep],
    [/\b(stomp|slam|crush|smash|bash|hammer|pound|fist|punch|maul|club|weight|stone dive|tremor|quake)/, E.slam], [/\b(charge|rush|ram|gore|horn|trample|stampede|tackle|barge|skull)/, E.charge],
    [/\b(bite|gnaw|gnash|chomp|snap|maw|mandible|jaw|nip|munch|chew)/, E.bite], [/\b(claw|scratch|rake|swipe|talon|paw|rend|slash|tear|pincer|flay|cut|gladius|sword|blade|knife|dagger|hack|chop|strike|stab)/, E.claw]
  );
  // exact names: the first bosses (Maze Guardian, Optio Karvan, Dune Bearer ...)
  const bigIntro = c => [par(["aura", { on: "src", tex: "flame", col: ["red", "ember"], vy: 2.4, ms: 450, r: 1.3, go: 1 }], ["roar", { n: 2, shake: 0.18, col: ["red", "ember"] }])];
  SIG["labyrinth charge"] = { do: c => [["crouch", { ms: 240, lean: 0.35, sy: 0.82 }], ["roar", { n: 2, shake: 0.2 }], par(["dash", { to: "far", on: "src", ms: 420, lean: 0.5, trail: 1, dust: "sand", col: "gold" }], ["quake", { on: "foes", shake: 0.4, cracks: 0, at: 150, go: 1 }]), ["knock", { on: "foes", d: 1.2, ms: 180 }]], max: 2600 };
  SIG["horn sweep"] = { do: c => [["rear", { ms: 150, h: 0.2, a: 0.3 }], par(["spin", { ms: 340, n: 1 }], ["slash", { on: "foes", n: 1, tex: "horn", ang: 0.2, s: 1.6, at: 160 }]), ["shake", { v: 0.14 }]] };
  SIG["bellow"] = { col: ["violet", "bone"], do: c => [["rear", { ms: 170, h: 0.3, a: 0.35 }], par(["roar", { n: 4, shake: 0.14 }], ["proj", { shape: "sonic", on: "foes", n: 2, stagger: 130, ms: 360 }]), ["arrows", { dir: "down", on: "foes", col: ["violet", "steel"] }]] };
  SIG["gladius strike"] = { col: ["steel", 0xffffff], do: c => [["dash", { ms: 150 }], ["slash", { n: 1, ang: 0.6, s: 1.2 }], ["hit", { kind: "pierce" }]] };
  SIG["shield bash"] = { col: ["steel", "brass"], do: c => [["dash", { ms: 140 }], par(["spr", { tex: "shieldIcon", hf: 0.5, size: 1.3, pop: 1, ms: 300, flip: 1 }], ["hit", { kind: "punch" }], ["knock", { d: 0.8, ms: 170 }])] };
  SIG["rally cry"] = { do: E.rally };
  SIG["legion charge"] = { col: ["steel", "red"], do: c => [["roar", { n: 2, shake: 0.12 }], par(["dash", { to: "far", ms: 400, lean: 0.4, trail: 1, dust: "sand" }], ["spr", { on: "foes", tex: "chev", n: 4, stagger: 60, flip: 1, col: "red", ms: 500, size: 0.8, dx: 1.2, vx: -3, at: 120, go: 1 }]), par(["hit", { kind: "smash", on: "foes", shake: 0.3 }], ["knock", { on: "foes", d: 1.0, ms: 170 }])], max: 2600 };
  SIG["crush"] = { col: ["earth", "stone"], do: c => [["rise", { ms: 280, h: 1.4, tilt: 0.1 }], ["dash", { ms: 160 }], ["fall", { ms: 100 }], par(["hit", { kind: "smash", shake: 0.3 }], ["crack", { r: 3.4 }], ["squash", { on: "tgt", ms: 150 }])] };
  SIG["sand sweep"] = { col: ["sand", "earth"], do: c => [["spin", { ms: 340 }], par(["wave", { kind: "sand", on: "foes", rows: 3, s: 1.1, ms: 520 }], ["shake", { v: 0.14 }])] };
  SIG["rune flare"] = { col: ["red", "fire"], do: c => [["circle", { on: "src", ms: 600 }], par(["spr", { on: "src", tex: "rune", n: 3, hf: 0.9, pop: 1, ms: 500, size: 0.9, spread: 1.2, col: "red" }], ["pillar", { on: "foes", w: 1.1, h: 6, col: ["red", "fire"], tex: "flame", at: 300 }])] };
  SIG["sky-stone drop"] = { col: ["earth", "stone"], do: c => [["rear", { ms: 260, h: 0.6, a: 0.3 }], ["roar", { n: 2, shake: 0.2 }], par(["proj", { shape: "rock", on: "foes", from: "sky", s: 3.4, ms: 480, arc: 0 }]), par(["quake", { on: "foes", shake: 0.5, hop: 1 }], ["shards", { on: "foes", tex: "rock", n: 12 }])], max: 2600 };
  SIG["bone charge"] = { col: ["bone", "stone"], do: c => [["crouch", { ms: 220, lean: 0.35, sy: 0.82 }], ["dash", { ms: 240, lean: 0.5, dust: "sand" }], par(["hit", { kind: "smash", shake: 0.25 }], ["spr", { tex: "bone", n: 5, hf: 0.6, size: 0.6, ms: 600, spread: 1, rise: 1.2, col: "bone", spin: 6 }])] };
  SIG["crushing blow"] = { do: E.slam };

  // ---------- autoRecipe: anything without a recipe still gets its own look (element + the type of the move + a hash of its id / name) ----------
  const HEAL_RE = /heal|mend|light|life|bless|soothe|renew|salve|tonic|rest|cure|recover|warm|dawn|sun|lull|song|prayer/i;
  function autoPlayer(e, m, h, name, el) {
    const cols = [el || "phys", "gold"], v = h % 4, grp = m && m.grp, tk = e.tkind, hits = (m && m.hits) || 1, spell = m && m.kind !== "phys", sh = ELSHAPE[el] || "orb", tex = ELTEX[el] || "dot";
    if (tk === "allyDown") return { col: ["gold", 0xffffff], do: [["circle", { on: "tgt", ms: 800 }], par(["pillar", { on: "tgt", fall: 1, w: 1.2, h: 10, ms: 600 }], ["spr", { on: "tgt", tex: "plus", n: 3, rise: 1.4, ms: 700, size: 0.5, col: ["gold", 0xffffff], spread: 0.6, hf: 0.3 }])] };
    if (tk === "ally" || tk === "team" || tk === "self") {
      const heal = HEAL_RE.test(name) || (m && /heal|regen|rejuv|mend/i.test(String(m.fx || "")));
      if (heal) return { col: ["heal", el || "gold"], do: [[["gather", { ms: 160, tex: "star" }], ["circle", { on: "tgt", ms: 700 }], ["wings", { ms: 360, flaps: 1 }], ["crouch", { ms: 160, sy: 0.88 }]][v], par([["aura", { on: "tgt", tex: "plus", vy: 1.6, ms: 650 }], ["rain", { on: "tgt", tex: "star", n: 10, height: 4, ms: 500, land: "spark", fall: 380 }], ["proj", { shape: "orb", on: "tgt", ms: 340, arc: 1.2 }], ["pillar", { on: "tgt", w: 0.9, h: 5, ms: 520 }]][v], ["ring", { on: "tgt", r: 2.8 }], ["flare", { on: "tgt", col: "gold" }])] };
      return { col: cols, do: [[["crouch", { ms: 170, sy: 0.86 }], ["rear", { ms: 170, h: 0.3, a: 0.3 }], ["gather", { ms: 200, tex }], ["spin", { ms: 260, n: 1 }]][v], par([["dome", { on: "tgt", ms: 700 }], ["aura", { on: "tgt", tex, ms: 650, vy: 1.4 }], ["shield", { on: "tgt" }], ["circle", { on: "tgt", ms: 650 }]][v], ["arrows", { dir: "up", on: "tgt", col: cols }])] };
    }
    if (tk === "allEnemies") return { col: cols, do: [[["rear", { ms: 170, h: 0.3, a: 0.3 }], ["gather", { ms: 180, tex }], ["crouch", { ms: 160 }], ["roar", { n: 2, shake: 0.1 }]][v], [["storm", { on: "foes", kind: el === "ice" ? "snow" : el === "shock" ? "thunder" : "rain", area: 1, ms: 700 }], ["whirl", { on: "foes", kind: ({ fire: "fire", water: "water", ice: "ice", dark: "dark", poison: "poison", earth: "sand", light: "light" })[el] || "wind", ms: 650 }], ["quake", { on: "foes", shake: 0.3, hop: 1 }], ["wave", { on: "foes", kind: ({ fire: "fire", dark: "dark", poison: "poison", light: "light", earth: "sand" })[el] || "water", rows: 3, ms: 600 }]][v]] };
    if (grp === "control" || (m && m.db && !m.p)) return { col: cols, do: [[["mark", { tex: "cross", ms: 800 }], ["circle", { on: "tgt", ms: 700 }], ["gather", { ms: 160, tex }], ["rear", { ms: 150, h: 0.15, a: 0.25 }]][v], [["proj", { shape: "dart", ms: 260 }], ["beam", { kind: "zig", ms: 340, w: 0.6 }], ["stream", { tex: "smoke", ms: 380, rate: 50, size: 0.7 }], ["drain", { n: 10, tex: "star", ms: 480 }]][v], par(["arrows", { dir: "down", on: "tgt", col: cols }], ["jitter", { on: "tgt", ms: 300, amp: 0.06 }], ["look", { kind: el || "dark", p: 0.5 }])] };
    if (spell) return { col: cols, do: [[["charge", { ms: 180 }], ["gather", { ms: 170, tex }], ["circle", { ms: 500 }], ["rise", { ms: 220, h: 0.8 }]][v], [["proj", { shape: sh, ms: 300, n: hits }], ["stream", { tex, ms: 440, rate: 80, size: 0.85 }], ["rain", { on: "tgt", from: "sky", tex, n: 10, height: 8, ms: 400, land: "spark", fall: 260, col: cols, spread: 0.5 }], ["beam", { kind: ["line", "wave", "zig", "pulse"][h % 4], ms: 440, w: 0.8 }]][v], ["blast", { kind: el || "light", s: 0.8, shake: 0.05 }]] };
    const phys = [[["dash", { ms: 150 }], ["slash", { n: Math.max(1, hits), gap: 70, da: 1 }]], [["leap", { ms: 300, h: 2.2 }], ["claws", { n: Math.max(1, hits - 1), ang: 0.5 }]], [["spin", { ms: 240, n: 1 }], ["dash", { ms: 140 }], ["hit", { kind: "smash", shake: 0.15 }]], [["crouch", { ms: 130 }], ["dash", { ms: 160 }], ["bite", { teeth: 3 }]]];
    return { col: cols, do: phys[v] };
  }
  function autoEnemy(e, h, name, el) {
    const ab = e.ab || {}, spell = ab.k === "spell" || (!!el && ab.k !== "phys"), v = h % 5;
    if (e.big) return { max: 2600, do: c => bigIntro(c).concat(ab.aoe || !e.tgt ? [["rise", { ms: 220, h: 0.5 }], par(["quake", { on: "foes", shake: 0.4, hop: 1 }], ["blast", { on: "foes", kind: el || "earth", s: 0.9, shake: 0 }])] : E.slam(c)) };
    if (ab.aoe || (!e.tgt && !ab.self && !ab.ally)) return { do: c => [["rear", { ms: 150, h: 0.25, a: 0.3 }], [["storm", { on: "foes", kind: el === "ice" ? "snow" : "rain", area: 1, ms: 600 }], ["whirl", { on: "foes", kind: ({ fire: "fire", water: "water", dark: "dark", poison: "poison", earth: "sand" })[el] || "wind", ms: 600 }], ["quake", { on: "foes", shake: 0.25, hop: 1 }], ["wave", { on: "foes", kind: ({ fire: "fire", dark: "dark", poison: "poison", earth: "sand" })[el] || "water", rows: 2, ms: 520 }], ["cloud", { on: "foes", area: 1, n: 10, ms: 700, mote: "dot" }]][v]] };
    if (spell) return { do: c => [[["charge", { ms: 170 }], ["gather", { ms: 160, tex: ELTEX[el] || "dot" }], ["rear", { ms: 150, h: 0.15, a: 0.25 }]][v % 3], [["proj", { shape: ELSHAPE[el] || "orb", ms: 300 }], ["stream", { tex: ELTEX[el] || "smoke", ms: 420, rate: 70 }], ["beam", { kind: "zig", ms: 360, w: 0.7 }]][v % 3], ["blast", { kind: el || "dark", s: 0.7, shake: 0 }]] };
    return { do: [E.claw, E.bite, E.slam, E.sting, E.charge][v] };
  }
  FX.autoRecipe = function (e, api) {
    const m = e.moveId && root.Core && root.Core.MOVES[e.moveId], name = String(e.move || e.moveId || "").toLowerCase(), h = hashOf(name === "attack" && e.src ? String(e.src.id || e.src.name || name) : name), el = (e.el && e.el !== "self" ? e.el : null) || nameEl(name);
    const spec = e.enemy || !m ? autoEnemy(e, h, name, el) : autoPlayer(e, m, h, name, el);
    spec.hit = 1; return spec;
  };

  // ---------- enemy abilities by what they DO (the rules pass the ability data as e.ab): hold, steal, mark, pull, heal an ally, empower, summon ----------
  const strongest = c => c.mine.filter(u => u !== c.src).sort((a, b) => (b.stats ? b.stats.atk + b.stats.pow : 0) - (a.stats ? a.stats.atk + a.stats.pow : 0))[0] || c.src;
  E.hold = c => { const el = c.el, kind = el === "nature" || /vine|root|bramble|thorn/i.test(c.e.move || "") ? "thorn" : el === "ice" ? "ice" : el === "dark" ? "shadow" : /chain|net|manacle|shackle/i.test(c.e.move || "") ? "chain" : null;
    return [["dash", { ms: 150 }], kind ? ["cage", { on: "tgt", kind, n: 8, ms: 800 }] : ["coil", { ms: 650, turns: 1.8 }], ["squash", { on: "tgt", ms: 200, sy: 0.82 }]]; };
  E.steal = c => [["dash", { ms: 140, hop: 0.4 }], par(["claws", { n: 1, ang: -0.3 }], ["drain", { tex: "star", n: 12, ms: 520, col: ["gold", 0xffffff] }]), ["flare", { on: "src", col: "gold" }]];
  E.mark = c => [["circle", { on: "tgt", ms: 700, col: ["red", "shadow"], s: 0.8 }], par(["mark", { tex: "cross", col: "red", ms: 900, size: 0.9 }], ["arrows", { dir: "down", on: "tgt", col: ["red", "shadow"] }])];
  E.pull = c => [["rear", { ms: 150, h: 0.3, a: 0.3 }], par(["gather", { ms: 380, tex: "ring", n: 6, r: 2.4, col: ["gold", "red"] }], ["roar", { n: 2, shake: 0.1, col: ["gold", "red"] }]), ["spr", { on: "foes", tex: "excl", hf: 1.18, pop: 1, bob: 0.1, ms: 700, size: 0.5, col: "red" }]];
  E.healAlly = c => [["crouch", { ms: 150, sy: 0.88 }], ["drain", { rev: 1, on: [lowest(c)], tex: "plus", n: 10, ms: 480, col: ["heal", "gold"] }], par(["aura", { on: [lowest(c)], tex: "plus", col: ["heal", "gold"], vy: 1.6, ms: 500 }], ["ring", { on: [lowest(c)], r: 2.8, col: "heal" }])];
  E.reviveAlly = c => { const down = c.e.src ? [] : []; return [["circle", { on: "src", ms: 800, col: ["violet", "gold"] }], ["pillar", { on: "src", w: 1.0, h: 6, ms: 600, col: ["gold", 0xffffff], tex: "star" }], ["flare", { on: "src", col: "gold" }]]; };
  E.empower = c => [["rear", { ms: 150, h: 0.3, a: 0.3 }], par(["beam", { kind: "pulse", on: [strongest(c)], w: 0.5, ms: 360, col: ["gold", "red"] }], ["arrows", { dir: "up", on: [strongest(c)], col: ["gold", "red"] }], ["aura", { on: [strongest(c)], tex: "flame", col: ["red", "gold"], vy: 2, ms: 600 }])];
  function structRecipe(e) {
    const a = e.ab; if (!a) return null;
    if (a.hold) return E.hold; if (a.steal) return E.steal; if (a.mark) return E.mark; if (a.pull) return E.pull; if (a.reviveAlly) return E.reviveAlly;
    if (a.healAlly) return E.healAlly; if (a.empower) return E.empower; if (a.summon) return E.summon;
    return null;
  }

  // ---------- more enemy templates (names the content agents used: wings, veils, beams, songs, orders, weapons ...) ----------
  E.wings = c => [["wings", { ms: 360, flaps: 2 }], par(["wave", { kind: "wind", on: "foes", rows: 2, s: 0.8, ms: 420, land: 1 }], ["spr", { on: "foes", tex: "feather", n: 3, rise: -1.2, ms: 500, size: 0.4, spread: 0.8, col: ["wind", 0xffffff], spin: 2 }])];
  E.beam = c => [["gather", { ms: 160, tex: "star" }], ["beam", { kind: c.e.big ? "pulse" : "line", ms: 420, w: c.e.big ? 1.3 : 0.8, up: c.src.view.h > 4 ? 0 : 0 }], ["blast", { kind: c.el || "light", s: 0.7, shake: 0 }]];
  E.sound = c => [["rear", { ms: 150, h: 0.25, a: 0.3 }], par(["roar", { n: 4, shake: 0.08, col: ["gold", "violet"] }], ["spr", { on: "foes", tex: "note", n: 3, rise: 1.4, ms: 600, size: 0.45, spread: 0.8, hf: 0.9, col: ["violet", "gold"], spin: 2, alt: 1 }], ["jitter", { on: "foes", ms: 350, amp: 0.06 }])];
  E.guardTeam = c => [["rear", { ms: 150, h: 0.2, a: 0.25 }], par(["dome", { on: "team", area: 1, ms: 750 }], ["arrows", { dir: "up", on: "team", col: ["steel", "brass"] }], ["shield", { on: "src", col: ["steel", "brass"] }])];
  E.selfBuff = c => [["crouch", { ms: 170, sy: 0.88 }], par(["aura", { on: "src", tex: ELTEX[c.el] || "star", vy: 1.6, ms: 600, rate: 40 }], ["arrows", { dir: "up", on: "src" }], ["ring", { on: "src", r: 2.8 }])];
  E.veil = c => [par(["cloud", { on: "src", n: 8, mote: "star", col: c.el && COL[c.el] ? [c.el, 0xffffff] : [0xffffff, "moon"], ms: 600, a: 0.4, size: 0.9 }], ["tint", { on: "src", ms: 450, col: "moon", amt: 0.6 }], ["dome", { on: "src", ms: 600, r: 0.9 }])];
  E.strike = c => { const h = hashOf(String(c.e.move || "")), v = h % 3, n = String(c.e.move || "").toLowerCase();
    if (/halberd|trident|pike|spear|lance|tusk|horn|jab|peck|chisel/.test(n)) return E.sting(c);
    if (/axe|blade|edge|sword|knife|cutlass|scythe|sickle/.test(n)) return [["dash", { ms: 150 }], ["slash", { n: 2, gap: 90, da: 1.6 }], ["hit", { kind: "pop" }]];
    if (/hammer|haymaker|stamp|kick|hoof|shove|buffet|club|mace|boot|fist|maul/.test(n)) return v ? E.slam(c) : E.charge(c);
    return [E.claw, E.bite, E.slam][v](c); };
  KEY.unshift(
    [/\b(wing beat|wingbeat|wing slice|wing buffet|wing smother|updraft|thousand feathers|shearing pass|feather|flutter|preen|pale wing)/, E.wings],
    [/\b(shield wall|shields up|hold the line|order:|orders|formation|stand firm|close ranks)/, E.guardTeam],
    [/\b(veil|ward|cold shield|facet shield|withdraw|sky veil|glow dust|reclaim|fold)/, E.veil],
    [/\b(beam|solar flare|sun pulse|lantern flash|lanternfall|prismatic|spectrum|dazzle|refract|pearl|focused|corona|eclipse|sun edict|meteor hum)/, E.beam],
    [/\b(song|peal|squeal|lullaby|pipes|resound|murmur|chime|hum|whistle|siren|call\b|bleat|honk|screech|trill)/, E.sound]
  );
  KEY.push([/\b(halberd|axe|trident|pike|lance|hoof|kick|stamp|haymaker|jab|shove|buffet|peck|fang|tusk|scrape|clutch|fist|hammer|mace|club|boot|chisel|blow|edge|sword|blade|punch|slap|flick|dash|rush|run|knock|whack|shell|stone wing)/, E.strike]);
  // pure self buffs and ally buffs by their data
  const structOld = structRecipe;
  structRecipe = function (e) { const r = structOld(e); if (r) return r; const a = e.ab; if (!a) return null; if (a.ally && !a.p && !a.db) return E.rally; if (a.self && !a.p && !a.db && !a.aoe) return E.selfBuff; return null; };
  // ---------- late personal moves (rules/m4.js) ----------
  R("candleMane", { col: ["fire", "gold"] }, [["rear", { ms: 170, h: 0.15, a: 0.25 }], par(["spr", { on: "src", tex: "flame", n: 5, hf: 1.0, size: 0.45, ms: 900, spread: 0.8, rise: 0.4, grow: -0.1, col: ["gold", "fire"], bob: 0.1 }], ["circle", { on: "src", ms: 700, col: ["gold", "fire"] }]), par(["spr", { on: "team", tex: "flame", hf: 1.25, size: 0.5, pop: 1, ms: 800, bob: 0.1, col: ["gold", "fire"] }], ["aura", { on: "team", tex: "plus", col: ["heal", "gold"], vy: 1.2, ms: 700 }], ["flare", { on: "team", col: "gold", s: 0.4 }])]);
  R("silverCharge", { col: ["steel", 0xffffff] }, [["crouch", { ms: 200, lean: 0.3, sy: 0.84 }], par(["gather", { ms: 260, tex: "star", n: 16, col: ["steel", 0xffffff] }], ["spr", { on: "src", tex: "shieldIcon", hf: 0.9, size: 1.1, pop: 1, ms: 420, col: ["steel", 0xffffff] }]), SND("whoosh"), par(["dash", { ms: 200, lean: 0.4, trail: 1, dust: "sand", col: ["steel", 0xffffff] }], ["spr", { on: "src", tex: "star", n: 6, hf: 0.5, size: 0.35, ms: 500, spread: 0.6, col: 0xffffff, stagger: 30 }]), par(["blast", { kind: "light", s: 0.8, shake: 0.14 }], ["ring", { on: "tgt", r: 2.4, col: ["steel", 0xffffff] }], ["knock", { on: "tgt", d: 0.6, ms: 150 }])]);
  // ---------- the names that matched no rule above (drags, flashes, dusts, drips, seals ...) ----------
  E.puff = c => { const el = c.el, col = el && COL[el] ? [el, "stone"] : [0xd8c9a8, "sand"]; return [["rear", { ms: 130, h: 0.15, a: 0.2 }], par(["cloud", { on: "foes", area: !c.e.tgt ? 1 : 0, n: 9, mote: el === "poison" ? "bubble" : "dot", col, ms: 700, a: 0.5, size: 0.9 }], ["spr", { on: "tgt", tex: ELTEX[el] || "smoke", n: 4, rise: 0.8, ms: 600, size: 0.55, spread: 0.7, hf: 0.7, col }]), ["look", { kind: el || "earth", p: 0.6 }]]; };
  E.flash = c => [["gather", { ms: 150, tex: "star", col: ["light", 0xffffff] }], par(["flare", { on: "src", col: c.el === "dark" ? "violet" : "light", s: 1.1 }], ["flare", { on: "foes", col: c.el === "dark" ? "shadow" : "light", s: 0.9, at: 90 }], ["arrows", { dir: "down", on: "tgt", col: ["light", 0xffffff] }]), ["look", { kind: c.el || "light", p: 0.6 }]];
  E.drown = c => [["dash", { ms: 150 }], par(["vortex", { on: "tgt", kind: c.el === "dark" ? "dark" : "water", ms: 560, sink: 1 }], ["cage", { on: "tgt", kind: c.el === "ice" ? "ice" : c.el === "dark" ? "shadow" : "chain", n: 6, ms: 700 }]), ["squash", { on: "tgt", ms: 200, sy: 0.82 }]];
  E.tide = c => [["rear", { ms: 150, h: 0.3, a: 0.3 }], par(["wave", { kind: c.el === "dark" ? "dark" : "water", on: "foes", rows: 2, s: 0.9, ms: 480, land: 1 }], ["cloud", { on: "foes", area: 1, n: 8, mote: "drop", col: c.el === "dark" ? ["shadow", "water"] : ["water", "ice"], ms: 600, a: 0.45 }], ["shake", { v: 0.1 }])];
  E.drip = c => [["rear", { ms: 130, h: 0.1, a: 0.2 }], ["proj", { shape: c.el === "fire" ? "ember" : "drop", ms: 320, hf: 0.8, arc: 0.9 }], par(["spr", { on: "tgt", tex: c.el === "fire" ? "flame" : "drop", n: 5, rise: -0.8, ms: 600, size: 0.35, spread: 0.5, hf: 1.0, col: c.el === "fire" ? ["fire", "gold"] : [c.el || "water", "stone"] }], ["look", { kind: c.el || "water", p: 0.7 }])];
  E.seal = c => [["circle", { on: "tgt", ms: 800, col: ["rune", "gold"] }], par(["mark", { on: "tgt", tex: "rune", col: "gold", ms: 800, size: 0.9 }], ["cage", { on: "tgt", kind: "stone", n: 6, ms: 700 }])];
  E.mirror = c => [["spr", { on: "src", tex: "shell", n: 3, hf: 0.7, size: 0.8, pop: 1, ms: 700, spread: 0.9, col: ["steel", 0xffffff] }], par(["beam", { kind: "zig", ms: 340, w: 0.5, col: ["light", 0xffffff] }], ["flare", { on: "tgt", col: "light", s: 0.8, at: 200 }]), ["look", { kind: "light", p: 0.6 }]];
  KEY.push(
    [/\b(drag|pull down|drown|grip|grasp|cold hands|chains|reach|pull aboard|aboard|under)/, E.drown],
    [/\b(giant's fall|rootquake|root legs|quake|fall\b)/, E.quake],
    [/\b(black tide|flooded|black water|spiral surge|surge|tide|water)/, E.tide],
    [/\b(mirror|reflection|glass shard|facet|crest|shard)/, E.mirror],
    [/\b(glint|flash|flare|lamp|lantern|sun chase|rebuke|dim|drink the light|lure light|cold lantern|chase)/, E.flash],
    [/\b(dust|puff|pollen|reed|smoke|scale|cap\b|glow|scarf|page twelve|snack|nest|gentle terror)/, E.puff],
    [/\b(drip|bubble|boil|scorch|wax|candle|flame|scald|burn|blood rite|soak|spring)/, E.drip],
    [/\b(seal|rite|offering|broadside|free weaken|sit on it|soul dew|rib clatter|clatter|long reach|mass)/, E.seal]
  );
  SIG["candle mane"] = "candleMane"; SIG["silver charge"] = "silverCharge";
//@@NEXT@@
})(window);
