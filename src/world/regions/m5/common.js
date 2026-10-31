// WORLD-M5 helpers shared by the m5 region files (loaded first by list.js; pure data code, runs in the browser and in node).
// M5.line(keys, pts, step, o)        props along a polyline: o = { seed, jit, dx, dy, start, opts, flipR }   -> [[key, x, y, opts], ...]
// M5.ring(keys, cx, cy, rx, ry, n, o) props on an ellipse (o.a0 = start angle, o.arc = angle span, default full circle)
// M5.grid(keys, x0, y0, nx, ny, dx, dy, o) props on a jittered grid
// M5.rect(keys, x0, y0, x1, y1, n, o) n random props in a rectangle (seeded, o.avoid = [[x,y,r],...] keeps clear of spots)
// M5.lightsAt(pts, r, a) lights for dark maps; M5.flat(...arrays)
(function () {
  "use strict";
  const g = typeof window !== "undefined" ? window : globalThis, World = (g.World = g.World || {}), M5 = (World.M5 = World.M5 || {});
  const rnd = seed => { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const pick = (r, keys) => keys[Math.floor(r() * keys.length)];
  const mk = (r, keys, x, y, o) => { const opts = o.opts ? Object.assign({}, o.opts) : {}; if (o.flipR && r() < 0.5) opts.flip = true; if (o.scaleR) opts.scale = o.scaleR[0] + r() * (o.scaleR[1] - o.scaleR[0]); const k = pick(r, keys); return Object.keys(opts).length ? [k, Math.round(x), Math.round(y), opts] : [k, Math.round(x), Math.round(y)]; };
  M5.rnd = rnd;
  M5.line = function (key, pts, step, o) {
    o = o || {}; const r = rnd(o.seed || 1), keys = [].concat(key), out = []; let carry = o.start || 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], len = Math.hypot(x1 - x0, y1 - y0) || 1; let d = carry;
      for (; d < len; d += step) { const t = d / len; out.push(mk(r, keys, x0 + (x1 - x0) * t + (r() - 0.5) * (o.jit || 0) + (o.dx || 0), y0 + (y1 - y0) * t + (r() - 0.5) * (o.jit || 0) + (o.dy || 0), o)); }
      carry = d - len;
    }
    return out;
  };
  M5.ring = function (key, cx, cy, rx, ry, n, o) {
    o = o || {}; const r = rnd(o.seed || 1), keys = [].concat(key), out = [], a0 = o.a0 || 0, arc = o.arc === undefined ? Math.PI * 2 : o.arc;
    for (let i = 0; i < n; i++) { const a = a0 + arc * i / (o.arc === undefined ? n : Math.max(1, n - 1)); out.push(mk(r, keys, cx + Math.cos(a) * rx + (r() - 0.5) * (o.jit || 0), cy + Math.sin(a) * ry + (r() - 0.5) * (o.jit || 0), o)); }
    return out;
  };
  M5.grid = function (key, x0, y0, nx, ny, dx, dy, o) {
    o = o || {}; const r = rnd(o.seed || 1), keys = [].concat(key), out = [];
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) out.push(mk(r, keys, x0 + i * dx + (r() - 0.5) * (o.jit || 0), y0 + j * dy + (r() - 0.5) * (o.jit || 0), o));
    return out;
  };
  M5.rect = function (key, x0, y0, x1, y1, n, o) {
    o = o || {}; const r = rnd(o.seed || 1), keys = [].concat(key), out = [], av = o.avoid || [];
    for (let i = 0, t = 0; i < n && t < n * 40; t++) { const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0); if (av.some(([ax, ay, ar]) => Math.hypot(x - ax, y - ay) < ar)) continue; out.push(mk(r, keys, x, y, o)); i++; }
    return out;
  };
  M5.lightsAt = (pts, rad, a) => pts.map(p => [p[0], p[1], p[2] || rad || 110, p[3] || a || 0.8]);
  M5.flat = (...arrs) => [].concat(...arrs);
})();
