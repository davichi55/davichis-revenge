// World data helpers (owner D). Pure data code: runs in the browser and in Node (the region painters in art-review/ load the region files too).
// Region files call World.def(id, data); `guide` is a painter's-algorithm list of [terrain, shape] that is both the layout the ground painting is made from
// and (rasterised on 8 px cells) the collision grid. A region may also give `gridUrl` (JSON array of strings of terrain chars) to override it.
(function (g) {
  "use strict";
  const World = g.World = g.World || {};
  World.REGIONS = World.REGIONS || {};
  World.hooks = World.hooks || {};
  // terrain: ch = char in grids, col = colour in the guide image handed to the painter, block = collision
  World.TERRAIN = {
    sand: { ch: ".", col: [214, 178, 120], block: 0 },
    road: { ch: ":", col: [140, 96, 60], block: 0 },
    paved: { ch: ",", col: [150, 140, 128], block: 0 },
    floor: { ch: "f", col: [196, 192, 186], block: 0 },
    grass: { ch: "g", col: [110, 140, 70], block: 0 },
    red: { ch: "R", col: [176, 84, 52], block: 0 },
    salt: { ch: "s", col: [236, 234, 222], block: 0 },
    glass: { ch: "G", col: [60, 170, 160], block: 0 },
    ash: { ch: "a", col: [92, 62, 62], block: 0 },
    bone: { ch: "b", col: [226, 214, 186], block: 0 },
    shallow: { ch: "w", col: [96, 170, 196], block: 0 },
    water: { ch: "~", col: [30, 90, 130], block: 1 },
    rock: { ch: "#", col: [10, 10, 14], block: 1 },
    wall: { ch: "=", col: [96, 70, 52], block: 1 },
  };
  const S = World.shapes = {
    R: (x, y, w, h) => ({ k: "r", a: [x, y, w, h] }),
    E: (cx, cy, rx, ry) => ({ k: "e", a: [cx, cy, rx, ry] }),
    P: pts => ({ k: "p", a: pts }),
    L: (pts, w) => ({ k: "l", a: pts, w }),
  };
  const segDist = (px, py, ax, ay, bx, by) => { const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy || 1, t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2)); return Math.hypot(px - ax - t * dx, py - ay - t * dy); };
  function inPoly(x, y, p) { let c = false; for (let i = 0, j = p.length - 1; i < p.length; j = i++) if ((p[i][1] > y) !== (p[j][1] > y) && x < (p[j][0] - p[i][0]) * (y - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0]) c = !c; return c; }
  function bbox(s) {
    if (s.k === "r") return [s.a[0], s.a[1], s.a[0] + s.a[2], s.a[1] + s.a[3]];
    if (s.k === "e") return [s.a[0] - s.a[2], s.a[1] - s.a[3], s.a[0] + s.a[2], s.a[1] + s.a[3]];
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; const pad = s.k === "l" ? s.w / 2 + 2 : 0;
    for (const p of s.a) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); }
    return [x0 - pad, y0 - pad, x1 + pad, y1 + pad];
  }
  function inside(s, x, y) {
    if (s.k === "r") return x >= s.a[0] && x < s.a[0] + s.a[2] && y >= s.a[1] && y < s.a[1] + s.a[3];
    if (s.k === "e") return ((x - s.a[0]) / s.a[2]) ** 2 + ((y - s.a[1]) / s.a[3]) ** 2 <= 1;
    if (s.k === "p") return inPoly(x, y, s.a);
    for (let i = 0; i < s.a.length - 1; i++) if (segDist(x, y, s.a[i][0], s.a[i][1], s.a[i + 1][0], s.a[i + 1][1]) <= s.w / 2) return true;
    return false;
  }
  // the full shape list of a region: its guide, then the rock rim, then a corridor through the rim for every exit
  World.fullGuide = function (r) {
    const list = (r.guide || []).slice(), rim = r.rim === undefined ? 40 : r.rim, W = r.w, H = r.h;
    if (rim) list.push(["rock", S.R(0, 0, W, rim)], ["rock", S.R(0, H - rim, W, rim)], ["rock", S.R(0, 0, rim, H)], ["rock", S.R(W - rim, 0, rim, H)]);
    for (const e of r.exits || []) {
      const [x, y, w, h] = e.rect, cx = x + w / 2, cy = y + h / 2, t = e.floor || (r.boat ? "water" : "road");   // boat maps (SYSTEMS): docks and channels are water
      const dl = cx, dr = W - cx, dt = cy, db = H - cy, m = Math.min(dl, dr, dt, db);
      if (m > rim + 60) { list.push([t, S.R(x, y, w, h)]); continue; }
      if (m === dl) list.push([t, S.R(0, y, x + w, h)]); else if (m === dr) list.push([t, S.R(x, y, W - x, h)]);
      else if (m === dt) list.push([t, S.R(x, 0, w, y + h)]); else list.push([t, S.R(x, y, w, H - y)]);
    }
    return list;
  };
  // rasterise to a grid of terrain names (row-major), `cell` px per cell
  World.rasterize = function (r, cell) {
    const cw = Math.ceil(r.w / cell), ch = Math.ceil(r.h / cell), names = Object.keys(World.TERRAIN), out = new Uint8Array(cw * ch), idx = {}; names.forEach((n, i) => (idx[n] = i));
    const sand = idx[r.base || "sand"]; out.fill(sand);
    for (const [t, s] of World.fullGuide(r)) {
      const b = bbox(s), v = idx[t]; if (v === undefined) throw new Error("terrain " + t);
      for (let cy = Math.max(0, Math.floor(b[1] / cell)); cy <= Math.min(ch - 1, Math.floor(b[3] / cell)); cy++) for (let cx = Math.max(0, Math.floor(b[0] / cell)); cx <= Math.min(cw - 1, Math.floor(b[2] / cell)); cx++)
        if (inside(s, cx * cell + cell / 2, cy * cell + cell / 2)) out[cy * cw + cx] = v;
    }
    return { cw, ch, cell, names, data: out };
  };
  World.def = function (id, d) { d.id = id; World.REGIONS[id] = d; return d; };
  // flag conditions: "a.b" truthy, "!a.b", "a.b=3", "a.b>=2"; arrays are AND; {any:[...]} is OR; empty/undefined = true
  World.cond = function (c, flags) {
    if (c === undefined || c === null || c === "" || c === true) return true; if (c === false) return false;
    flags = flags || {};
    if (Array.isArray(c)) return c.every(x => World.cond(x, flags));
    if (typeof c === "object") return (c.any || []).some(x => World.cond(x, flags));
    const m = /^(!?)([^=<>!]+?)(?:(>=|<=|=|>|<)(.+))?$/.exec(String(c).trim()); if (!m) return false;
    const get = k => { if (k in flags) return flags[k]; let o = flags; for (const p of k.split(".")) { if (o === undefined || o === null) return undefined; o = o[p]; } return o; };
    const v = get(m[2].trim());
    if (!m[3]) return m[1] ? !v : !!v;
    const rhs = isNaN(+m[4]) ? m[4] : +m[4];
    return m[3] === "=" ? v == rhs : m[3] === ">=" ? v >= rhs : m[3] === "<=" ? v <= rhs : m[3] === ">" ? v > rhs : v < rhs;
  };
})(typeof window !== "undefined" ? window : globalThis);
