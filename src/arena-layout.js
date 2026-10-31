// Arena layout (ARENA agent). Global `ArenaLayout`: where every fighter stands and which camera frames the fight, so that nothing hides anything,
// nothing is off screen and nobody stands under the HUD panels (foe list top left, party panel bottom right, command menu bottom left, log line on top).
//   const res = ArenaLayout.arrange({ THREE, camera, w, h, foes, party, coach, camP })
//        foes / party / coach: units whose `view` (group, home, model, h) already exists; their positions are moved here. camP = { y, z, ly, k } is set to the chosen camera preset.
//        -> { cam: "std"|"wide"|..., cost, report }   (report = ArenaLayout.check result)
//   ArenaLayout.place(env, unit)  put one new foe (a summon) on a free spot between the others.      ArenaLayout.check(env) -> { problems: [...], rects: [...] } (tests)
// The fighters are measured (bounding box of the real model or sprite), projected through the real camera at the real window size, and a small annealing search moves them away
// from their classic formation only as far as needed. Same units + same window = same result (seeded), so a fight always looks the same.
(function (root) {
  "use strict";
  const MODEL_YAW = -Math.PI / 2;
  // camera presets tried in order (the standard one is the M1 camera): y, z = camera position, ly = height it looks at, k = field-of-view factor
  const CAMS = [{ id: "std", y: 4.6, z: 14.5, ly: 1.9, k: 1 }, { id: "wide", y: 5.4, z: 16.0, ly: 2.3, k: 1.1 }, { id: "far", y: 6.4, z: 17.4, ly: 3.0, k: 1.22 }, { id: "titan", y: 7.6, z: 18.6, ly: 4.0, k: 1.36 }];
  const REG = { e: { x: [-11.5, -1.3], z: [-12, 3.6] }, p: { x: [1.3, 11.5], z: [-9.5, 4.0] }, c: { x: [4.5, 12.5], z: [-11, -2.5] } };
  const SLOTS_P = [[3.4, -3.2], [6.0, -0.8], [2.4, 2.2]], COACH = [9.6, -4.8];
  const ADDS = [[-3.4, -4.8], [-3.4, 0.6], [-4.8, 2.6], [-2.8, -2.2], [-6.4, 3.8]];
  let V = null;
  const rng = seed => { let s = (seed >>> 0) || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
  const hash = str => { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // ---------- the classic formation (copy of Arena3D formation(), extended for 4-5 foes and for the parts of multi-part bosses) ----------
  function templateFoes(foes) {
    const n = foes.length, bodies = foes.filter(f => !f.partOf), parts = foes.filter(f => f.partOf), boss = bodies.find(f => f.boss), out = new Map();
    const others = bodies.filter(f => f !== boss);
    if (boss) { out.set(boss, others.length || parts.length ? [-6.2, -1.6] : [-5.0, -1.0]); others.forEach((f, i) => out.set(f, ADDS[Math.min(i, ADDS.length - 1)].slice())); }
    else {
      const m = bodies.length, T = m === 1 ? [[-4.4, -1.5]] : m === 2 ? [[-3.6, -4.2], [-6.2, -0.8]] : m === 3 ? [[-3.0, -5.4], [-5.2, -2.6], [-7.4, 0.2]] : m === 4 ? [[-2.6, -6.2], [-4.4, -3.4], [-6.2, -0.6], [-8.0, 2.2]] : [[-2.4, -6.6], [-4.0, -4.2], [-5.6, -1.8], [-7.2, 0.6], [-8.8, 3.0]];
      bodies.forEach((f, i) => out.set(f, T[Math.min(i, T.length - 1)].slice()));
    }
    parts.forEach((p, i) => { const body = foes.find(f => f.id === p.partOf || f.uid === p.partOf) || boss || bodies[0], b = (body && out.get(body)) || [-5, -1], k = parts.filter(q => q.partOf === p.partOf).indexOf(p), m = parts.filter(q => q.partOf === p.partOf).length; out.set(p, [b[0] + 1.6 + (k - (m - 1) / 2) * 2.4, b[1] + 1.6 + (k % 2) * 0.8]); });
    return out;
  }

  // ---------- measuring ----------
  // relative bounding box of a unit around its ground point, with the model turned the way arena3d turns it (sideways, towards the other group)
  // relative box of the VISIBLE MASS: vertices are sampled and the thinnest 7% on each side (tails, horns, wings tips) are ignored, so a long tail does not push its owner away from the others
  function measure(THREE, u, towardX) {
    const v = u.view, g = v.group, m = v.model, dflt = { x0: -0.6, x1: 0.6, y0: 0, y1: v.h || 2.6, z0: -0.6, z1: 0.6 }; if (!m) return dflt;
    const save = [g.position.x, g.position.y, g.position.z, m.rotation.y];
    g.position.set(0, 0, 0); if (!v.billboard && v.model !== v.inner) m.rotation.y = Math.atan2(towardX * 8, 0.8) + MODEL_YAW + (v.yawFix || 0);
    g.updateMatrixWorld(true); m.updateMatrixWorld(true);
    const xs = [], ys = [], zs = [], p3 = new THREE.Vector3();
    m.traverse(o => { if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return; const p = o.geometry.attributes.position, step = Math.max(1, Math.floor(p.count / 700));
      for (let i = 0; i < p.count; i += step) { if (o.isSkinnedMesh && o.boneTransform) o.boneTransform(i, p3); else p3.fromBufferAttribute(p, i); p3.applyMatrix4(o.matrixWorld); xs.push(p3.x); ys.push(p3.y); zs.push(p3.z); } });
    g.position.set(save[0], save[1], save[2]); m.rotation.y = save[3]; g.updateMatrixWorld(true);
    if (xs.length < 4) return dflt;
    const q = (a, f) => { a.sort((x, y) => x - y); return a[Math.min(a.length - 1, Math.max(0, Math.round(f * (a.length - 1))))]; };
    const o = { x0: q(xs, 0.07), x1: q(xs, 0.93), y0: Math.max(0, q(ys, 0)), y1: q(ys, 1), z0: q(zs, 0.07), z1: q(zs, 0.93) };
    if (!(o.x1 > o.x0) || !isFinite(o.y1)) return dflt; o.z0 = Math.min(o.z0, -0.05); o.z1 = Math.max(o.z1, 0.05); return o;
  }
  function mkCam(THREE, env, preset) {
    const camera = env.camera, c = new THREE.PerspectiveCamera(((env.camP && env.camP.base) || camera.fov) * preset.k, camera.aspect, 0.1, 200);
    c.position.set(0, preset.y, preset.z); c.lookAt(0, preset.ly, 0); c.updateMatrixWorld(true); c.updateProjectionMatrix(); return c;
  }
  // screen rectangle [x0, y0, x1, y1] (pixels) of an item standing at ground point (x, z)
  function rectAt(THREE, cam, w, h, rel, x, z) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (let i = 0; i < 8; i++) {
      V.set(x + (i & 1 ? rel.x1 : rel.x0), i & 2 ? rel.y1 : rel.y0, z + (i & 4 ? rel.z1 : rel.z0)).project(cam);
      const sx = (V.x + 1) * 0.5 * w, sy = (1 - V.y) * 0.5 * h; if (sx < x0) x0 = sx; if (sx > x1) x1 = sx; if (sy < y0) y0 = sy; if (sy > y1) y1 = sy;
    }
    return [x0, y0, x1, y1];
  }
  const core = r => { const dx = (r[2] - r[0]) * 0.09, dy = (r[3] - r[1]) * 0.06; return [r[0] + dx, r[1] + dy, r[2] - dx, r[3]]; };   // the visible body: a little less than the box (the feet are kept whole)
  const area = r => Math.max(1, (r[2] - r[0]) * (r[3] - r[1]));
  const inter = (a, b) => Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));

  // ---------- HUD keep-out rectangles in pixels (read from the live HUD when it is on screen) ----------
  function hudRects(w, h, nFoes) {
    const out = [], q = s => (typeof document !== "undefined" ? document.querySelector("#a3 " + s) : null);
    const rect = (el, fb, wt, name) => { let r = fb; if (el && el.getBoundingClientRect) { const b = el.getBoundingClientRect(); if (b.width > 20 && b.height > 20) r = [b.left, b.top, b.right, b.bottom]; } out.push({ r, wt, name }); };
    rect(q(".foes"), [16, 14, 316, 14 + 24 + Math.max(1, nFoes) * 62], 0.5, "foes");
    rect(q(".party"), [w - 16 - 350, h - 16 - 218, w - 16, h - 16], 1.0, "party");
    out.push({ r: [16, h - 16 - Math.min(285, h * 0.42), Math.min(16 + 440, w - 16), h - 16], wt: 0.8, name: "menu" });
    out.push({ r: [w * 0.18, 0, w * 0.82, 58], wt: 0.45, name: "log" });
    return out;
  }

  // ---------- the cost of one arrangement ----------
  function itemCost(P, i, pos, rects) {
    const it = P.items[i], r = rects[i], c = core(r), W = P.w, H = P.h; let cost = 0;
    // off screen
    const over = Math.max(0, W * 0.012 - r[0]) + Math.max(0, r[2] - W * 0.988) + Math.max(0, 54 - r[1]) + Math.max(0, r[3] - H * 0.99);
    cost += (over / H) * 16 + (over / H) * (over / H) * 260;
    // HUD panels
    for (const K of P.hud) { const f = inter(c, K.r) / area(c); if (f > 0) cost += K.wt * (10 * f * f + 3 * f); }
    // the classic formation: stay close to it unless something is wrong
    cost += 0.02 * ((pos[0] - it.tpl[0]) ** 2 + (pos[1] - it.tpl[1]) ** 2);
    // presence: nobody shrinks to a dot when there is room (at most about 8% smaller on screen than in the classic formation)
    cost += 9 * Math.max(0, it.hf0 * 0.92 - (r[3] - r[1]) / H);
    return cost;
  }
  function pairCost(P, i, j, pi, pj, ri, rj) {
    const a = P.items[i], b = P.items[j]; if (a.group && a.group === b.group) return 0;
    const ci = core(ri), cj = core(rj), I = inter(ci, cj);
    let cost = 0;
    if (I > 0) {
      const iFront = pi[1] > pj[1], front = iFront ? ci : cj, back = iFront ? cj : ci, fb = I / area(back), ff = I / area(front);
      const o = Math.max(0, fb - 0.07); cost += 24 * o * o + 4 * o + 5 * Math.max(0, ff - 0.45);
      if (a.side !== b.side) cost *= 1.25;
    }
    // the two groups keep a gap in the middle of the field
    if (a.side === "e" && b.side === "p" || a.side === "p" && b.side === "e") { const e = a.side === "e" ? [a, pi] : [b, pj], p = a.side === "p" ? [a, pi] : [b, pj], gap = (p[1][0] + p[0].rel.x0) - (e[1][0] + e[0].rel.x1); if (gap < 1.6) cost += 1.2 * (1.6 - gap) ** 2; }
    return cost;
  }
  function totalCost(P, pos, rects) { let c = 0; const n = P.items.length; for (let i = 0; i < n; i++) { c += itemCost(P, i, pos[i], rects); for (let j = i + 1; j < n; j++) c += pairCost(P, i, j, pos[i], pos[j], rects[i], rects[j]); } return c; }

  function buildProblem(env, preset) {
    const THREE = env.THREE, cam = mkCam(THREE, env, preset), P = { THREE, cam, w: env.w, h: env.h, items: [], hud: hudRects(env.w, env.h, env.foes.length) };
    P.hud.forEach(K => { K.r = K.r.slice(); });
    const tplF = templateFoes(env.foes);
    const add = (u, side, tpl, reg, fixed) => {
      if (!u.view) return; const rel = measure(THREE, u, side === "e" ? 1 : -1);
      const r0 = rectAt(THREE, cam, env.w, env.h, rel, tpl[0], tpl[1]);
      P.items.push({ u, side, tpl, reg, fixed: !!fixed, rel, hf0: (r0[3] - r0[1]) / env.h, group: u.partOf ? "part:" + u.partOf : (env.foes.some(f => f.partOf === u.id) ? "part:" + u.id : null) });
    };
    env.foes.forEach(f => add(f, "e", (tplF.get(f) || [-5, -1]).slice(), REG.e, f.fixedAt));
    // party: the bulkiest creature at the back (a front creature never hides a bigger one); same rule as before
    const bulk = u => { if (!u.view) return 0; const r = measure(THREE, u, -1); return (r.x1 - r.x0) * (r.y1 - r.y0) + (r.z1 - r.z0) * (r.y1 - r.y0) * 0.5; };
    env.party.map(p => [p, bulk(p)]).sort((a, b) => b[1] - a[1]).forEach(([p], i) => add(p, "p", SLOTS_P[Math.min(i, SLOTS_P.length - 1)].slice(), REG.p));
    if (env.coach && env.coach.view) add(env.coach, "c", COACH.slice(), REG.c);
    return P;
  }
  function solve(P, seed, iters) {
    const n = P.items.length, R = rng(seed), W = P.w, H = P.h, THREE = P.THREE;
    let pos = P.items.map(it => it.tpl.slice()), rects = pos.map((p, i) => rectAt(THREE, P.cam, W, H, P.items[i].rel, p[0], p[1]));
    let cur = totalCost(P, pos, rects), best = cur, bestPos = pos.map(p => p.slice());
    const free = P.items.map((it, i) => (it.fixed ? -1 : i)).filter(i => i >= 0);
    if (!free.length || cur < 0.02) return { pos: bestPos, cost: best };
    for (let k = 0; k < iters; k++) {
      const f = k / iters, T = 0.6 * (1 - f) * (1 - f) + 0.002, sg = 1.4 * (1 - f) + 0.12;
      const i = free[Math.floor(R() * free.length)], it = P.items[i], old = pos[i], oldR = rects[i];
      const np = [clamp(old[0] + (R() - 0.5) * 2 * sg * 1.6, it.reg.x[0], it.reg.x[1]), clamp(old[1] + (R() - 0.5) * 2 * sg * 1.6, it.reg.z[0], it.reg.z[1])];
      const nr = rectAt(THREE, P.cam, W, H, it.rel, np[0], np[1]);
      // delta cost: only the terms that involve unit i
      let before = itemCost(P, i, old, rects), after; for (let j = 0; j < n; j++) if (j !== i) before += pairCost(P, i, j, old, pos[j], oldR, rects[j]);
      pos[i] = np; rects[i] = nr; after = itemCost(P, i, np, rects); for (let j = 0; j < n; j++) if (j !== i) after += pairCost(P, i, j, np, pos[j], nr, rects[j]);
      const d = after - before;
      if (d <= 0 || R() < Math.exp(-d / T)) { cur += d; if (cur < best - 1e-9) { best = cur; bestPos = pos.map(p => p.slice()); } } else { pos[i] = old; rects[i] = oldR; }
    }
    return { pos: bestPos, cost: totalCost(P, bestPos, bestPos.map((p, i) => rectAt(THREE, P.cam, W, H, P.items[i].rel, p[0], p[1]))) };
  }

  // hard violations of one arrangement (0 = fine): units off screen, a body more than a quarter covered by one in front, a body more than a third under a HUD panel
  function violations(P, pos) {
    const n = P.items.length, rects = pos.map((p, i) => rectAt(P.THREE, P.cam, P.w, P.h, P.items[i].rel, p[0], p[1])); let v = 0;
    for (let i = 0; i < n; i++) {
      const r = rects[i], c = core(r), W = P.w, H = P.h; v += Math.max(0, Math.max(-r[0], r[2] - W, -r[1], r[3] - H) - 4) / H * 6;
      P.hud.forEach(K => { if (K.name === "log") return; const f = inter(c, K.r) / area(c); if (f > (K.name === "menu" ? 0.34 : 0.3)) v += (f - 0.3) * 2; });
      for (let j = i + 1; j < n; j++) { const a = P.items[i], b = P.items[j]; if (a.group && a.group === b.group) continue; const cj = core(rects[j]), I = inter(c, cj); if (I <= 0) continue; const iFront = pos[i][1] > pos[j][1], fb = I / area(iFront ? cj : c); if (fb > 0.25) v += (fb - 0.25) * 3; }
    }
    return v;
  }
  function capHeight(u, h, a) {   // sizes are kept in a range that always fits some camera: nothing tiny, nothing taller than the frame
    const big = !!(u.boss || u.titan || (a && a.mkind === "boss")), max = big ? 11.5 : u.side === "p" ? 4.6 : 5.6, min = u.coach ? 0 : big ? 3.0 : u.side === "p" ? 2.0 : 1.3; let k = Math.min(max, Math.max(min, h));
    if (a && a.kind === "sprite" && a.tex && a.tex.image && a.tex.image.height) k = Math.min(k, (big ? 15 : 7.5) / Math.max(1, a.tex.image.width / a.tex.image.height));
    return k;
  }
  // ---------- ground truth (POLISH): what the camera REALLY sees ----------
  // The boxes above are only a first guess. Here every fighter is drawn on its own and then the whole scene is drawn with one flat colour per fighter (props and floor get their
  // own colour), at about 480 px wide: hidden share of a fighter = silhouette pixels that are covered by another fighter, a prop or a HUD panel / silhouette pixels.
  const ID_MUL = 20, OTHER = 255;
  let RT = null;
  function groupOf(env, u) { return u.partOf ? "part:" + u.partOf : (env.foes.some(f => f.partOf === u.id) ? "part:" + u.id : null); }
  // turn every model the way arena3d frame() turns it (mostly sideways, a little toward the other group), so the picture matches the live one
  function orient(env, units) {
    units.forEach(u => { const v = u.view; if (!v || !v.model || v.billboard || v.model === v.inner) return; const others = (u.side === "p" ? env.foes : env.party).filter(x => x.alive !== false && x.view); if (!others.length) return;
      const cx = others.reduce((a, x) => a + x.view.home.x, 0) / others.length, cz = others.reduce((a, x) => a + x.view.home.z, 0) / others.length, g = v.group; v.model.rotation.y = Math.atan2(cx - g.position.x, (cz - g.position.z) * 0.35) + MODEL_YAW + (v.yawFix || 0); });
  }
  function seeBegin(env, cam, units) {
    orient(env, units);
    const THREE = env.THREE, S = env.scene, R = env.renderer, w = env.w, h = env.h, sc = Math.min(1, 480 / w), W = Math.max(48, Math.round(w * sc)), H = Math.max(27, Math.round(h * sc));
    if (!RT || RT.width !== W || RT.height !== H) { if (RT) RT.dispose(); RT = new THREE.WebGLRenderTarget(W, H, { depthBuffer: true, stencilBuffer: false }); }
    const owner = new Map(); units.forEach((u, k) => { if (u.view && u.view.group) owner.set(u.view.group, k + 1); });
    const ents = [], extra = [], made = [];
    S.updateMatrixWorld(true);
    S.traverse(o => {
      if (o.isPoints || o.isSprite || o.isLine || o.isLight) { if (o.visible) { extra.push(o); } return; }
      if (!o.isMesh || !o.material) return;
      let vis = true, p = o, id = 0; while (p) { if (p.visible === false) { vis = false; break; } if (!id && owner.has(p)) id = owner.get(p); p = p.parent; }
      if (!vis) return;
      const m = Array.isArray(o.material) ? o.material[0] : o.material, alpha = !!(m.alphaTest > 0 && m.map);
      if ((m.transparent && !alpha) || m.depthWrite === false || m.visible === false) { ents.push({ o, hide: true, mat: o.material }); return; }
      const col = new THREE.Color().setRGB((id ? id * ID_MUL : OTHER) / 255, 0, 0);
      const mat = new THREE.MeshBasicMaterial({ color: col, fog: false, side: alpha ? THREE.DoubleSide : m.side, skinning: !!o.isSkinnedMesh, blending: THREE.NoBlending });
      if (alpha) { mat.map = m.map; mat.alphaTest = 0.05; mat.onBeforeCompile = sh => { sh.fragmentShader = sh.fragmentShader.replace("#include <map_fragment>", "diffuseColor.a *= texture2D( map, vUv ).a;"); }; mat.customProgramCacheKey = () => "polishIdAlpha"; }
      made.push(mat); ents.push({ o, id, mat: o.material, idMat: mat });
    });
    const oldBg = S.background, oldFog = S.fog, oldTarget = R.getRenderTarget(), oldCol = new THREE.Color(), oldAlpha = R.getClearAlpha(); R.getClearColor(oldCol);
    const buf = new Uint8Array(W * H * 4), isoCache = new Map();
    const read = () => { R.readRenderTargetPixels(RT, 0, 0, W, H, buf); const out = new Uint8Array(W * H); for (let y = 0; y < H; y++) { const sr = (H - 1 - y) * W * 4, dr = y * W; for (let x = 0; x < W; x++) out[dr + x] = buf[sr + x * 4]; } return out; };
    const draw = only => {
      ents.forEach(e => { e.o.visible = !e.hide && (only === null || e.id === only); if (e.idMat) e.o.material = Array.isArray(e.mat) ? e.mat.map(() => e.idMat) : e.idMat; });
      extra.forEach(o => { o.visible = false; });
      S.background = null; S.fog = null; R.setRenderTarget(RT); R.setClearColor(0x000000, 0); R.clear(); R.render(S, cam); return read();
    };
    const sess = {
      W, H, sc: W / w, units,
      full() { return draw(null); },
      iso(k) { if (!isoCache.has(k)) { const m = draw(k), idx = []; const raw = k * ID_MUL; for (let i = 0; i < m.length; i++) if (m[i] === raw) idx.push(i); isoCache.set(k, { mask: m, idx: Int32Array.from(idx), raw }); } return isoCache.get(k); },
      invalidate(k) { isoCache.delete(k); },
      end() { ents.forEach(e => { e.o.visible = true; e.o.material = e.mat; }); extra.forEach(o => { o.visible = true; }); S.background = oldBg; S.fog = oldFog; R.setRenderTarget(oldTarget); R.setClearColor(oldCol, oldAlpha); made.forEach(m => m.dispose()); },
    };
    return sess;
  }
  // stats of every unit from the full picture + the isolated silhouettes: { hidden, hud, by: {name: share}, n }
  function seeStats(env, sess, hud, items) {
    const full = sess.full(), W = sess.W, H = sess.H, sc = sess.sc, out = [];
    const hr = hud.filter(K => K.name !== "log").map(K => ({ n: K.name, x0: K.r[0] * sc, y0: K.r[1] * sc, x1: K.r[2] * sc, y1: K.r[3] * sc }));
    items.forEach((it, k) => {
      const iso = sess.iso(k + 1), idx = iso.idx, n = idx.length, st = { n, hidden: 0, hud: 0, prop: 0, by: {}, name: it.u.name || it.u.id, side: it.side };
      if (n < 25) { out.push(st); return; }
      let blocked = 0, hudHit = 0, prop = 0; const by = {}, byI = {};
      for (let q = 0; q < n; q++) {
        const i = idx[q], f = full[i]; let b = false;
        if (f !== iso.raw) { if (f === OTHER) { b = true; prop++; } else if (f > 0) { const j = Math.round(f / ID_MUL) - 1, jt = items[j]; if (jt && !(it.group && it.group === jt.group)) { b = true; const nm = jt.u.name || jt.u.id; by[nm] = (by[nm] || 0) + 1; byI[j] = (byI[j] || 0) + 1; } } }
        if (hr.length) { const x = i % W, y = (i / W) | 0; for (let a = 0; a < hr.length; a++) { const K = hr[a]; if (x >= K.x0 && x <= K.x1 && y >= K.y0 && y <= K.y1) { b = true; hudHit++; by["HUD:" + K.n] = (by["HUD:" + K.n] || 0) + 1; break; } } }
        if (b) blocked++;
      }
      st.hidden = blocked / n; st.hud = hudHit / n; st.prop = prop / n; Object.keys(by).forEach(k2 => { by[k2] = +(by[k2] / n).toFixed(2); }); st.by = by; Object.keys(byI).forEach(k2 => { byI[k2] = byI[k2] / n; }); st.byIdx = byI; out.push(st);
    });
    return out;
  }
  const LIM = { p: 0.07, c: 0.14, e: 0.3 };   // allowed hidden share of a silhouette: party creatures about 10% at most, the coach a little more, foes (often huge, in a group) 30%
  const fHid = (st, side) => { const lim = LIM[side] || 0.3, e = Math.max(0, st.hidden - (side === "p" ? 0.012 : lim * 0.5)); return (side === "p" ? 1 : side === "c" ? 0.5 : 0.6) * (70 * e * e + 5 * e); };

  // ---------- refinement against the ground truth ----------
  let V2 = null;
  function footOf(cam, W, H, x, z) { V.set(x, 0, z); V2.copy(V).applyMatrix4(cam.matrixWorldInverse); const d = -V2.z; V.project(cam); return { x: (V.x + 1) * 0.5 * W, y: (1 - V.y) * 0.5 * H, d }; }
  function extraCost(P, pos) {   // off screen + the gap between the two groups (same terms as the solver) for a whole layout
    let c = 0; const n = P.items.length, rects = pos.map((p, i) => rectAt(P.THREE, P.cam, P.w, P.h, P.items[i].rel, p[0], p[1]));
    for (let i = 0; i < n; i++) {
      const r = rects[i], W = P.w, H = P.h, over = Math.max(0, W * 0.012 - r[0]) + Math.max(0, r[2] - W * 0.988) + Math.max(0, 54 - r[1]) + Math.max(0, r[3] - H * 0.99); c += (over / H) * 30 + (over / H) * (over / H) * 600;
      for (let j = i + 1; j < n; j++) { const a = P.items[i], b = P.items[j]; if (a.side === "e" && b.side === "p" || a.side === "p" && b.side === "e") { const e = a.side === "e" ? [a, pos[i]] : [b, pos[j]], p = a.side === "p" ? [a, pos[i]] : [b, pos[j]], gap = (p[1][0] + p[0].rel.x0) - (e[1][0] + e[0].rel.x1); if (gap < 1.6) c += 1.2 * (1.6 - gap) ** 2; } }
    }
    return c;
  }
  function applyPos(P, pos, env) { P.items.forEach((it, i) => { const v = it.u.view; v.group.position.set(pos[i][0], 0, pos[i][1]); v.home.set(pos[i][0], 0, pos[i][1]); }); if (env) orient(env, P.items.map(it => it.u)); }
  function refine(env, P) {
    if (!env.renderer || !env.scene || !env.THREE.WebGLRenderTarget) return null;
    const items = P.items, units = items.map(it => it.u), n = items.length; V2 = V2 || new env.THREE.Vector3();
    let sess; try { sess = seeBegin(env, P.cam, units); } catch (e) { console.warn("arena seen failed", e); return null; }
    const t0 = (typeof performance !== "undefined" ? performance.now() : 0);
    try {
      const W = sess.W, H = sess.H, hr = P.hud.filter(K => K.name !== "log").map(K => [K.r[0] * sess.sc, K.r[1] * sess.sc, K.r[2] * sess.sc, K.r[3] * sess.sc]);
      let pos = items.map(it => [it.u.view.home.x, it.u.view.home.z]), stats = seeStats(env, sess, P.hud, items);
      const total = (st, ps) => st.reduce((a, s, k) => a + fHid(s, items[k].side), 0) + extraCost(P, ps);
      let cur = total(stats, pos);
      // the silhouette of every unit at its current place: offsets (pixels) from the foot point, sampled; plus the mask for look-ups
      const snap = () => items.map((it, k) => { const iso = sess.iso(k + 1), foot = footOf(P.cam, W, H, pos[k][0], pos[k][1]), step = Math.max(1, Math.floor(iso.idx.length / 420)), pts = []; for (let q = 0; q < iso.idx.length; q += step) { const i = iso.idx[q]; pts.push((i % W) - foot.x, ((i / W) | 0) - foot.y); } return { foot, pts: Float32Array.from(pts), iso }; });
      const stuck = new Set(); let moves = 0;
      for (let iter = 0; iter < 10; iter++) {
        let wi = -1, wv = 1e-6; stats.forEach((st, k) => { const ex = st.hidden - (LIM[items[k].side] || 0.3); if (ex > wv && !stuck.has(k)) { wv = ex; wi = k; } });
        if (wi < 0) break;
        const movers = []; if (!items[wi].fixed) movers.push(wi);
        let bj = -1, bv = 0; Object.keys(stats[wi].byIdx || {}).forEach(j => { if (stats[wi].byIdx[j] > bv && !items[j].fixed) { bv = stats[wi].byIdx[j]; bj = +j; } }); if (bj >= 0 && bj !== wi) movers.push(bj);
        const S0 = snap(); let best = null;
        for (const m of movers) {
          const it = items[m], cands = [], P0 = pos.map(p => p.slice());
          for (let x = it.reg.x[0]; x <= it.reg.x[1] + 1e-6; x += 0.8) for (let z = it.reg.z[0]; z <= it.reg.z[1] + 1e-6; z += 0.8) {
            const pp = P0.map(p => p.slice()); pp[m] = [x, z]; const ft = items.map((_, k) => (k === m ? footOf(P.cam, W, H, x, z) : S0[k].foot)), hid = [];
            for (let i = 0; i < n; i++) {
              const A = S0[i], si = A.foot.d / ft[i].d, pts = A.pts, N = pts.length / 2; let cov = 0;
              if (!N) { hid.push({ hidden: 0 }); continue; }
              for (let q = 0; q < N; q++) {
                const qx = ft[i].x + si * pts[2 * q], qy = ft[i].y + si * pts[2 * q + 1]; let b = false;
                if (qx < 0 || qy < 0 || qx >= W || qy >= H) b = true;
                else {
                  for (let a = 0; a < hr.length && !b; a++) if (qx >= hr[a][0] && qx <= hr[a][2] && qy >= hr[a][1] && qy <= hr[a][3]) b = true;
                  for (let j = 0; j < n && !b; j++) {
                    if (j === i || ft[j].d >= ft[i].d || (items[i].group && items[i].group === items[j].group) || !S0[j].pts.length) continue;
                    const sj = S0[j].foot.d / ft[j].d, sx = Math.round(S0[j].foot.x + (qx - ft[j].x) / sj), sy = Math.round(S0[j].foot.y + (qy - ft[j].y) / sj);
                    if (sx >= 0 && sy >= 0 && sx < W && sy < H && S0[j].iso.mask[sy * W + sx] === S0[j].iso.raw) b = true;
                  }
                }
                if (b) cov++;
              }
              hid.push({ hidden: cov / N });
            }
            const c = hid.reduce((a, s, k) => a + fHid(s, items[k].side), 0) + extraCost(P, pp) + 0.01 * ((x - P0[m][0]) ** 2 + (z - P0[m][1]) ** 2);
            cands.push({ c, x, z });
          }
          cands.sort((a, b) => a.c - b.c);
          // the best few are checked against the real picture
          for (const cd of cands.slice(0, 6)) {
            const pp = P0.map(p => p.slice()); pp[m] = [cd.x, cd.z]; applyPos(P, pp, env); sess.invalidate(m + 1);
            const st = seeStats(env, sess, P.hud, items), c = total(st, pp) + 0.01 * ((cd.x - P0[m][0]) ** 2 + (cd.z - P0[m][1]) ** 2);
            if (!best || c < best.c) best = { c, pp, st, m };
          }
          applyPos(P, P0, env); sess.invalidate(m + 1);
        }
        if (best && best.c < cur - 1e-6) { pos = best.pp; moves++; applyPos(P, pos, env); sess.invalidate(best.m + 1); stats = seeStats(env, sess, P.hud, items); cur = total(stats, pos); }
        else { applyPos(P, pos, env); stuck.add(wi); }
      }
      let worst = 0; stats.forEach((st, k) => { worst = Math.max(worst, st.hidden - (LIM[items[k].side] || 0.3)); });
      const party = Math.max(0, ...stats.filter((_, k) => items[k].side === "p").map(s => s.hidden));
      return { worst, party, stats, pos, moves, ms: Math.round((typeof performance !== "undefined" ? performance.now() : 0) - t0) };
    } finally { sess.end(); }
  }

  function arrange(env) {
    const THREE = env.THREE; V = V || new THREE.Vector3(); env.w = env.w || innerWidth; env.h = env.h || innerHeight;
    const all = env.foes.concat(env.party), seed = hash(all.map(u => u.id).join(",") + "|" + Math.round(env.w / 40) + "x" + Math.round(env.h / 40));
    let pick = null; const tried = [];
    for (let ci = 0; ci < CAMS.length; ci++) {
      const preset = CAMS[ci], P = buildProblem(env, preset); let res = null;
      for (let r = 0; r < 3; r++) { const s = solve(P, seed + r * 7919 + ci * 104729, r === 0 ? 1600 : 2600); if (!res || s.cost < res.cost) res = s; if (res.cost < 0.5) break; }
      const vio = violations(P, res.pos); let bad = 0, seen = null, fpos = res.pos;
      if (env.renderer) { applyPos(P, res.pos, env); try { seen = refine(env, P); } catch (e) { console.warn("arena refine failed", e); seen = null; } if (seen) { bad = Math.max(0, seen.worst); fpos = seen.pos; } }
      const score = res.cost + vio * 6 + ci * 0.25 + bad * 300; tried.push({ id: preset.id, cost: +res.cost.toFixed(3), vio: +vio.toFixed(3), seen: seen ? { party: +seen.party.toFixed(3), worst: +seen.worst.toFixed(3), moves: seen.moves, ms: seen.ms } : null });
      if (!pick || score < pick.score) pick = { P, res, ci, score, fpos, seen };
      if (vio < 0.02 && bad < 0.005) break;
    }
    const { P, res, ci } = pick; res.pos = pick.fpos;
    P.items.forEach((it, i) => { let [x, z] = res.pos[i]; const v = it.u.view; if (!isFinite(x) || !isFinite(z)) { x = it.tpl[0]; z = it.tpl[1]; } v.group.position.set(x, 0, z); v.home.set(x, 0, z); v.rel = it.rel; });
    orient(env, P.items.map(it => it.u));
    const camP = env.camP; if (camP) { camP.y = CAMS[ci].y; camP.z = CAMS[ci].z; camP.ly = CAMS[ci].ly; camP.k = CAMS[ci].k; camP.id = CAMS[ci].id; }
    const out = { cam: CAMS[ci].id, cost: res.cost, items: P.items.length, tried, seen: pick.seen ? { party: pick.seen.party, worst: pick.seen.worst } : null }; ArenaLayout.last = out; return out;
  }

  // one new foe (a summon, a revived part): the free spot with the least overlap, the others stay where they are
  function place(env, u) {
    const THREE = env.THREE; V = V || new THREE.Vector3(); env.w = env.w || innerWidth; env.h = env.h || innerHeight;
    const k = env.camP && CAMS.find(c => c.id === env.camP.id) || CAMS[0], P = buildProblem(Object.assign({}, env, { foes: env.foes }), k), idx = P.items.findIndex(it => it.u === u);
    if (idx < 0) return null;
    const pos = P.items.map(it => (it.u === u ? it.tpl.slice() : [it.u.view.home.x, it.u.view.home.z])), rects = pos.map((p, i) => rectAt(THREE, P.cam, P.w, P.h, P.items[i].rel, p[0], p[1]));
    let best = null; const it = P.items[idx];
    for (let x = it.reg.x[0]; x <= it.reg.x[1]; x += 0.7) for (let z = it.reg.z[0]; z <= it.reg.z[1]; z += 0.7) {
      const np = [x, z], nr = rectAt(THREE, P.cam, P.w, P.h, it.rel, x, z); pos[idx] = np; rects[idx] = nr;
      let c = itemCost(P, idx, np, rects); for (let j = 0; j < P.items.length; j++) if (j !== idx) c += pairCost(P, idx, j, np, pos[j], nr, rects[j]);
      if (!best || c < best.c) best = { c, x, z };
    }
    if (best) { const v = u.view; v.group.position.set(best.x, 0, best.z); v.home.set(best.x, 0, best.z); v.rel = it.rel; }
    return best;
  }

  // report for tests: pairs where more than 12% of the smaller body is hidden, units off screen, units under HUD panels
  function check(env) {
    const THREE = env.THREE; V = V || new THREE.Vector3(); env.w = env.w || innerWidth; env.h = env.h || innerHeight;
    const preset = env.camP && CAMS.find(c => c.id === env.camP.id) || CAMS[0], P = buildProblem(env, preset), probs = [], rects = [];
    P.items.forEach(it => { const h = it.u.view.home, r = rectAt(P.THREE, P.cam, P.w, P.h, it.rel, h.x, h.z); rects.push(r); });
    P.items.forEach((it, i) => {
      const r = rects[i], c = core(r), W = P.w, H = P.h, nm = it.u.name || it.u.id;
      const off = Math.max(0, 0 - r[0], r[2] - W, 0 - r[1], r[3] - H); if (off > 6) probs.push({ t: "offscreen", who: nm, px: Math.round(off) });
      P.hud.forEach(K => { if (K.name === "log") return; const f = inter(c, K.r) / area(c); if (f > (K.name === "foes" ? 0.18 : K.name === "menu" ? 0.22 : 0.12)) probs.push({ t: "hud:" + K.name, who: nm, frac: +f.toFixed(2) }); });
      for (let j = i + 1; j < P.items.length; j++) {
        const b = P.items[j]; if (it.group && it.group === b.group) continue;
        const cj = core(rects[j]), I = inter(c, cj); if (I <= 0) continue;
        const iFront = it.u.view.home.z > b.u.view.home.z, back = iFront ? cj : c, f = I / area(back);   // the share of the body behind that the one in front covers
        if (f > 0.22) probs.push({ t: "hides", who: iFront ? b.u.name || b.u.id : nm, by: iFront ? nm : b.u.name || b.u.id, frac: +f.toFixed(2) });
      }
    });
    if (env.renderer && env.scene) { const sn = seen(env); if (sn) sn.forEach(st => { const lim = LIM[st.side === "c" ? "c" : st.side] || 0.3; if (st.hidden > lim + 0.02) probs.push({ t: "seen", who: st.name, frac: +st.hidden.toFixed(2), by: st.by }); }); }
    return { problems: probs, rects: P.items.map((it, i) => ({ n: it.u.name || it.u.id, side: it.side, r: rects[i].map(Math.round) })), cam: preset.id };
  }
  // what the camera really sees of every fighter right now (live camera, live HUD): [{ name, side, n, hidden, hud, prop, by }]
  function seen(env) {
    const THREE = env.THREE; V = V || new THREE.Vector3(); V2 = V2 || new THREE.Vector3(); env.w = env.w || innerWidth; env.h = env.h || innerHeight;
    const preset = env.camP && CAMS.find(c => c.id === env.camP.id) || CAMS[0], P = buildProblem(env, preset); if (!env.renderer || !env.scene) return null;
    env.camera.updateMatrixWorld(true); const sess = seeBegin(env, env.camera, P.items.map(it => it.u));
    try { return seeStats(env, sess, P.hud, P.items); } finally { sess.end(); }
  }
  const ArenaLayout = root.ArenaLayout = { arrange, place, check, seen, LIM, capHeight, CAMS, templateFoes, REG, _dbg: { seeBegin, seeStats, buildProblem, solve, itemCost, pairCost, rectAt, core, inter, area, get V() { return V; } } };
})(typeof window !== "undefined" ? window : globalThis);
