// WORLD-M2 kit: seeded organic shapes and prop generators for the M2 region files. Pure data code (runs in the browser and in Node for the painters).
// World.kitM2 = { rng, blob, blobPts, wob, ribbon, inPoly, edge, fill, along, border, center }
(function () {
  "use strict";
  const { R, E, P, L } = World.shapes;
  const K = (World.kitM2 = World.kitM2 || {});
  const mul = a => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  K.rng = mul;
  K.inPoly = (x, y, p) => { let c = false; for (let i = 0, j = p.length - 1; i < p.length; j = i++) if ((p[i][1] > y) !== (p[j][1] > y) && x < (p[j][0] - p[i][0]) * (y - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0]) c = !c; return c; };
  K.center = pts => { let x = 0, y = 0; pts.forEach(p => { x += p[0]; y += p[1]; }); return [x / pts.length, y / pts.length]; };
  // an organic closed outline (point list) around (cx, cy); jag = how lumpy (0.1 calm .. 0.3 wild), n = points
  K.blobPts = (cx, cy, rx, ry, seed, o) => {
    o = o || {}; const n = o.n || 18, jag = o.jag === undefined ? 0.16 : o.jag, rnd = mul(seed || 1), ph1 = rnd() * 6.28, ph2 = rnd() * 6.28, pts = [];
    for (let i = 0; i < n; i++) { const a = i / n * 6.2832, k = 1 + jag * (0.6 * Math.sin(a * 3 + ph1) + 0.4 * Math.sin(a * 5 + ph2) + (rnd() - 0.5) * 0.8); pts.push([Math.round(cx + Math.cos(a) * rx * k), Math.round(cy + Math.sin(a) * ry * k)]); }
    return pts;
  };
  K.blob = (cx, cy, rx, ry, seed, o) => P(K.blobPts(cx, cy, rx, ry, seed, o));
  // a polyline made natural: split into ~seg px pieces and sway them sideways by up to amp px (smooth); ends stay put
  K.wob = (pts, amp, seed, seg) => {
    const rnd = mul(seed || 1), out = [], step = seg || 70, ph = rnd() * 6.28;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1], len = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(len / step)), nx = -(b[1] - a[1]) / (len || 1), ny = (b[0] - a[0]) / (len || 1);
      for (let k = 0; k < n; k++) { const t = k / n, off = (i === 0 && k === 0) ? 0 : amp * (0.7 * Math.sin((i * n + k) * 1.3 + ph) + 0.6 * (rnd() - 0.5)); out.push([Math.round(a[0] + (b[0] - a[0]) * t + nx * off), Math.round(a[1] + (b[1] - a[1]) * t + ny * off)]); }
    }
    out.push(pts[pts.length - 1].slice()); return out;
  };
  // a river/road ribbon with a width that changes from w0 to w1 along its length: returns a polygon point list
  K.ribbonPts = (pts, w0, w1) => {
    const left = [], right = [], n = pts.length; let total = 0; const cum = [0];
    for (let i = 1; i < n; i++) { total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); cum.push(total); }
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, w = (w0 + (w1 - w0) * (cum[i] / (total || 1))) / 2;
      left.push([Math.round(pts[i][0] - dy / l * w), Math.round(pts[i][1] + dx / l * w)]); right.push([Math.round(pts[i][0] + dy / l * w), Math.round(pts[i][1] - dx / l * w)]);
    }
    return left.concat(right.reverse());
  };
  K.ribbon = (pts, w0, w1) => P(K.ribbonPts(pts, w0, w1 === undefined ? w0 : w1));
  // a closed outline made natural: every edge (including the closing one) is split and swayed
  K.wobPoly = (pts, amp, seed, seg) => { const w = K.wob(pts.concat([pts[0]]), amp, seed, seg); w.pop(); return w; };
  // push every point of an outline away from its centre by d px (a halo around a thicket, a bank around a pool)
  K.grow = (pts, d) => { const c = K.center(pts); return pts.map(p => { const dx = p[0] - c[0], dy = p[1] - c[1], l = Math.hypot(dx, dy) || 1; return [Math.round(p[0] + dx / l * d), Math.round(p[1] + dy / l * d)]; }); };
  // a flat decal (drawn under characters and props): returns [key, x, y, opts] with depth 1
  K.decal = (key, x, y, o) => [key, x, y, Object.assign({ solid: false, shadow: false, dy: 1 - y }, o || {})];
  // ---- prop generators: they return arrays of ["key", x, baseY, opts] to be concatenated into a region's `props` ----
  const pick = (keys, rnd) => { let tot = 0; keys.forEach(k => (tot += Array.isArray(k) ? k[1] : 1)); let t = rnd() * tot; for (const k of keys) { const w = Array.isArray(k) ? k[1] : 1; if (t < w) return Array.isArray(k) ? k[0] : k; t -= w; } return Array.isArray(keys[0]) ? keys[0][0] : keys[0]; };
  const mk = (key, x, y, o, rnd) => { const op = Object.assign({}, o || {}); if (op.scaleRange) { op.scale = Math.round((op.scaleRange[0] + rnd() * (op.scaleRange[1] - op.scaleRange[0])) * 100) / 100; delete op.scaleRange; } if (op.flipRandom !== false && rnd() < 0.5) op.flip = true; delete op.flipRandom; return [key, Math.round(x), Math.round(y), op]; };
  // props along the outline of a polygon (point list), step px apart, pushed `inset` px toward the centre (negative = outward)
  K.edge = (pts, step, keys, o) => {
    o = o || {}; const rnd = mul(o.seed || 3), out = [], c = K.center(pts), inset = o.inset === undefined ? 14 : o.inset, jit = o.jitter === undefined ? 14 : o.jitter, opts = o.opts || {};
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length], len = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.floor(len / step));
      for (let k = 0; k < n; k++) {
        const t = (k + 0.5 + (rnd() - 0.5) * 0.5) / n; let x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t; const dx = c[0] - x, dy = c[1] - y, dl = Math.hypot(dx, dy) || 1;
        x += dx / dl * inset + (rnd() - 0.5) * jit * 2; y += dy / dl * inset + (rnd() - 0.5) * jit * 2;
        if (o.skip && o.skip(x, y)) continue; out.push(mk(pick(keys, rnd), x, y, opts, rnd));
      }
    }
    return out;
  };
  // props scattered inside a polygon (point list) or a rect [x, y, w, h] on a jittered grid `step` px apart
  K.fill = (area, step, keys, o) => {
    o = o || {}; const rnd = mul(o.seed || 5), out = [], opts = o.opts || {}, rect = Array.isArray(area[0]) ? null : area, pts = rect ? null : area;
    const x0 = rect ? rect[0] : Math.min(...pts.map(p => p[0])), x1 = rect ? rect[0] + rect[2] : Math.max(...pts.map(p => p[0])), y0 = rect ? rect[1] : Math.min(...pts.map(p => p[1])), y1 = rect ? rect[1] + rect[3] : Math.max(...pts.map(p => p[1]));
    for (let y = y0; y < y1; y += step) for (let x = x0; x < x1; x += step) {
      const px = x + (rnd() - 0.5) * step * 0.9, py = y + (rnd() - 0.5) * step * 0.9; if (pts && !K.inPoly(px, py, pts)) continue; if (rnd() > (o.chance === undefined ? 1 : o.chance)) continue;
      if (o.skip && o.skip(px, py)) continue; out.push(mk(pick(keys, rnd), px, py, opts, rnd));
    }
    return out;
  };
  // props along a polyline (a river bank, a road), step px apart, `side` px to the left/right of it (both sides if side is [-a, b])
  K.along = (pts, step, keys, o) => {
    o = o || {}; const rnd = mul(o.seed || 7), out = [], sides = Array.isArray(o.side) ? o.side : [o.side || 0], opts = o.opts || {};
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1], len = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.floor(len / step)), nx = -(b[1] - a[1]) / (len || 1), ny = (b[0] - a[0]) / (len || 1);
      for (let k = 0; k < n; k++) for (const s of sides) {
        const t = (k + rnd()) / n, off = s + (rnd() - 0.5) * (o.jitter === undefined ? 10 : o.jitter) * 2, x = a[0] + (b[0] - a[0]) * t + nx * off, y = a[1] + (b[1] - a[1]) * t + ny * off + (rnd() - 0.5) * 8;
        if (o.skip && o.skip(x, y)) continue; if (o.chance !== undefined && rnd() > o.chance) continue; out.push(mk(pick(keys, rnd), x, y, opts, rnd));
      }
    }
    return out;
  };
  // terrain name at (x, y) of a region definition (before it is registered): K.terrainAt(def)(x, y)
  K.terrainAt = def => { const T = World.rasterize({ w: def.w, h: def.h, guide: def.guide, base: def.base, rim: def.rim, exits: def.exits || [] }, 12); return (x, y) => { const cx = Math.floor(x / 12), cy = Math.floor(y / 12); return cx < 0 || cy < 0 || cx >= T.cw || cy >= T.ch ? "rock" : T.names[T.data[cy * T.cw + cx]]; }; };
  // n butterfly start positions inside a w x h map (engine format [[x, y], ...])
  K.flies = (w, h, n, seed) => { const r = mul(seed || 5), o = []; for (let i = 0; i < n; i++) o.push([Math.round(w * (0.15 + r() * 0.7)), Math.round(h * (0.2 + r() * 0.65))]); return o; };
  // trees (or any props) on every BLOCKED cell of a region definition (rock rim, thickets): a living wall. def = { w, h, guide, base, rim, exits }; edge cells (blocked, next to walkable ground) get the first keys and shadows.
  K.blockedFill = (def, step, keys, o) => {
    o = o || {}; const rnd = mul(o.seed || 11), out = [], r = { w: def.w, h: def.h, guide: def.guide, base: def.base, rim: def.rim, exits: def.exits || [] }, CELL = 12, T = World.rasterize(r, CELL), blk = T.names.map(n => World.TERRAIN[n].block);
    const isB = (x, y) => { const cx = Math.floor(x / CELL), cy = Math.floor(y / CELL); return cx < 0 || cy < 0 || cx >= T.cw || cy >= T.ch || !!blk[T.data[cy * T.cw + cx]]; };
    const near = (x, y, d) => { for (let a = 0; a < 6.3; a += 1.05) if (!isB(x + Math.cos(a) * d, y + Math.sin(a) * d)) return true; return false; };
    const skip = o.skip, edgeKeys = o.edgeKeys || keys, opts = o.opts || {};
    for (let y = 0; y < def.h + step; y += step) for (let x = 0; x < def.w + step; x += step) {
      const px = x + (rnd() - 0.5) * step * 0.95, py = y + (rnd() - 0.5) * step * 0.95; if (px < 0 || py < 0 || px > def.w || py > def.h) continue; if (!isB(px, py)) continue; if (!o.onWater && (() => { const cx = Math.floor(px / CELL), cy = Math.floor(py / CELL); return T.names[T.data[Math.min(T.ch - 1, cy) * T.cw + Math.min(T.cw - 1, cx)]] === "water"; })()) continue;
      if (rnd() > (o.chance === undefined ? 1 : o.chance)) continue; if (skip && skip(px, py)) continue;
      const edge = near(px, py, 46), op = Object.assign({}, opts); if (!edge) { op.shadow = false; if (op.solid === undefined) op.solid = false; }
      out.push(mk(pick(edge ? edgeKeys : keys, rnd), px, py, op, rnd));
    }
    return out;
  };
  // a hedge of props just inside the map border (in the rock rim): w x h = map size, band = how deep, `gaps` = list of [x, y, w, h] rects to keep clear (exit corridors)
  K.border = (w, h, step, keys, o) => {
    o = o || {}; const rnd = mul(o.seed || 9), band = o.band || 100, out = [], gaps = o.gaps || [], opts = o.opts || {};
    const ok = (x, y) => !gaps.some(g => x > g[0] - 40 && x < g[0] + g[2] + 40 && y > g[1] - 40 && y < g[1] + g[3] + 40);
    const row = (ax, ay, bx, by, depthDir, pad) => {
      const len = Math.hypot(bx - ax, by - ay), n = Math.floor(len / step);
      for (let k = 0; k < n; k++) for (let layer = 0; layer < (o.layers || 2); layer++) {
        const t = (k + rnd()) / n, d = pad + layer * (band / (o.layers || 2)) + rnd() * 24, x = ax + (bx - ax) * t + depthDir[0] * d, y = ay + (by - ay) * t + depthDir[1] * d;
        if (!ok(x, y)) continue; out.push(mk(pick(keys, rnd), x, y, opts, rnd));
      }
    };
    row(0, 0, w, 0, [0, 1], o.topPad === undefined ? 90 : o.topPad); row(0, h, w, h, [0, -1], 10); row(0, 0, 0, h, [1, 0], 10); row(w, 0, w, h, [-1, 0], 10);
    return out;
  };
})();
