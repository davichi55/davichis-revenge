// WORLD-M3 prop helpers (pure data code, runs in the browser and in Node). Every helper returns a list of prop entries [key, x, y, opts] for a region's `props`.
(function () {
  const M = World.m3 = World.m3 || {};
  M.rng = seed => { let a = seed | 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const arr = k => (Array.isArray(k) ? k : [k]);
  const mk = (keys, i, x, y, o, r, j) => [arr(keys)[i % arr(keys).length], Math.round(x + (j ? (r() - 0.5) * 2 * j : 0)), Math.round(y + (j ? (r() - 0.5) * 2 * j * 0.6 : 0)), Object.assign({}, o || {})];
  // n props evenly spaced on the line (x0,y0)-(x1,y1); keys cycle; j = random jitter in px
  M.row = (keys, x0, y0, x1, y1, n, o, j, seed) => { const r = M.rng(seed || 7), out = []; for (let i = 0; i < n; i++) { const t = n === 1 ? 0.5 : i / (n - 1); out.push(mk(keys, i, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, o, r, j)); } return out; };
  // n props on an ellipse (angles a0..a1 in radians, default full circle)
  M.ring = (keys, cx, cy, rx, ry, n, o, a0, a1, j, seed) => { const r = M.rng(seed || 11), out = [], s = a0 === undefined ? 0 : a0, e = a1 === undefined ? Math.PI * 2 : a1, full = Math.abs(e - s - Math.PI * 2) < 0.01; for (let i = 0; i < n; i++) { const a = s + (e - s) * (full ? i / n : n === 1 ? 0.5 : i / (n - 1)); out.push(mk(keys, i, cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, o, r, j)); } return out; };
  // nx * ny props on a grid inside the rectangle (x, y, w, h), cell centres
  M.grid = (keys, x, y, w, h, nx, ny, o, j, seed) => { const r = M.rng(seed || 13), out = []; let i = 0; for (let b = 0; b < ny; b++) for (let a = 0; a < nx; a++) out.push(mk(keys, i++, x + w * (a + 0.5) / nx, y + h * (b + 0.5) / ny, o, r, j)); return out; };
  // n props at random places inside a rectangle (no collision test: use only in open ground, or let `scatter` do the placement)
  M.rand = (keys, x, y, w, h, n, o, seed) => { const r = M.rng(seed || 17), out = []; for (let i = 0; i < n; i++) out.push(mk(keys, Math.floor(r() * 997), x + r() * w, y + r() * h, o, r, 0)); return out; };
  // a polyline route as [x,y] points, built from a flat list (x0,y0,x1,y1,...)
  M.pts = flat => { const o = []; for (let i = 0; i < flat.length; i += 2) o.push([flat[i], flat[i + 1]]); return o; };
  // flatten arrays of prop lists
  M.cat = (...lists) => [].concat(...lists);
})();
