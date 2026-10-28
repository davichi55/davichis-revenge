// The two prototype maps: the desert outskirts with a small camp town, and the Dune ruins dungeon.
// Each map is a grid of tile names; SOLID tiles block walking; zones decide random encounters.
(function (root) {
  "use strict";
  const SOLID = new Set(["wall", "ruin", "water", "palm", "cactus", "roof", "housewall", "dwall", "door", "shopdoor"]);

  function grid(w, h, fill) { return Array.from({ length: h }, () => Array(w).fill(fill)); }
  function rect(g, x0, y0, x1, y1, t) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (g[y] && g[y][x] !== undefined) g[y][x] = t; }
  const hash = (x, y) => { let n = x * 374761393 + y * 668265263; n = (n ^ (n >> 13)) * 1274126177; return ((n ^ (n >> 16)) >>> 0) / 4294967295; };

  function outskirts() {
    const W = 44, H = 30, g = grid(W, H, "sand");
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (hash(x, y) < 0.25) g[y][x] = "sand2";
    rect(g, 0, 0, W - 1, 0, "ruin"); rect(g, 0, H - 1, W - 1, H - 1, "ruin"); rect(g, 0, 0, 0, H - 1, "ruin"); rect(g, W - 1, 0, W - 1, H - 1, "ruin");
    // camp town
    rect(g, 2, 2, 14, 12, "wall"); rect(g, 3, 3, 13, 11, "town"); g[7][14] = "town";
    rect(g, 4, 3, 7, 3, "roof"); rect(g, 4, 4, 7, 5, "housewall"); g[5][5] = "door";          // inn
    rect(g, 9, 3, 12, 3, "roof"); rect(g, 9, 4, 12, 5, "housewall"); g[5][10] = "shopdoor";   // shop
    // oasis
    for (let y = 3; y <= 9; y++) for (let x = 20; x <= 29; x++) if (((x - 24.5) / 4.5) ** 2 + ((y - 6) / 2.8) ** 2 < 1) g[y][x] = "water";
    // road to the ruins
    rect(g, 15, 7, 33, 7, "path"); rect(g, 33, 7, 33, 24, "path");
    rect(g, 30, 23, 36, 27, "ruin"); rect(g, 31, 24, 35, 26, "path"); g[23][33] = "path"; g[25][33] = "gate";
    // plants
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      if (!["sand", "sand2"].includes(g[y][x])) continue;
      if (x >= 2 && x <= 15 && y >= 1 && y <= 13) continue;
      const r = hash(x + 99, y + 7);
      if (r < 0.035) g[y][x] = "cactus"; else if (r < 0.06 && Math.abs(y - 6) < 6 && x > 17 && x < 32) g[y][x] = "palm";
    }
    return {
      id: "outskirts", name: "Sun-Scorched Outskirts", w: W, h: H, g, start: { x: 8, y: 9 },
      bg: "desert",
      zone: (x, y) => (g[y][x] === "town" ? null : x >= 27 && y >= 14 ? "patrol" : g[y][x] === "path" ? "road" : "desert"),
      npcs: [
        { x: 6, y: 9, art: "mentor", id: "mentor" },
        { x: 5, y: 6, art: "innkeeper", id: "inn" },
        { x: 10, y: 6, art: "merchant", id: "shop" },
        { x: 12, y: 9, art: "scholar", id: "scholar" },
      ],
      warps: [{ x: 33, y: 25, to: "ruins", tx: 2, ty: 11 }],
    };
  }

  function ruins() {
    const W = 32, H = 22, g = grid(W, H, "dwall");
    rect(g, 1, 9, 5, 13, "floor");                 // entrance hall
    rect(g, 6, 11, 11, 11, "floor");               // corridor
    rect(g, 12, 4, 17, 17, "floor");               // big hall
    rect(g, 13, 1, 16, 3, "floor"); g[2][14] = "chest";   // side room with a chest
    rect(g, 18, 15, 22, 15, "floor"); rect(g, 22, 8, 22, 15, "floor");
    rect(g, 22, 8, 23, 8, "floor");
    rect(g, 24, 6, 30, 16, "floor");               // the Titan's chamber
    g[11][28] = "altar"; g[11][1] = "exit";
    for (let y = 5; y <= 16; y += 4) { g[y][13] = "dwall"; g[y][16] = "dwall"; }
    return {
      id: "ruins", name: "Dune Ruins", w: W, h: H, g, start: { x: 2, y: 11 }, bg: "ruins",
      zone: (x, y) => (x <= 5 || x >= 24 ? null : "ruins"),
      npcs: [],
      warps: [{ x: 1, y: 11, to: "outskirts", tx: 33, ty: 24 }],
      boss: { x: 28, y: 11 },
      chest: { x: 14, y: 2 },
    };
  }

  root.Maps = { SOLID, build: { outskirts, ruins } };
})(window);
