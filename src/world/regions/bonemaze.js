// K1 The Bone Maze: winding bone-walled labyrinth under the oasis (dark). Table "boneMaze" ~20 s. Chest g4_wardenHalls (G4).
// NPC oldMazeheart (the keeper); trigger k1Cage = the locked cage at the heart (frees the Minotaur lab extra).
(function () {
  const { R, E, P, L } = World.shapes;
  // a fixed maze on a 7 x 4 cell grid (200 px pitch), carved by a seeded depth-first walk
  const COLS = 7, ROWS = 4, PX = 200, OX = 150, OY = 160; let seed = 77; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const cx = c => OX + c * PX, cy = r => OY + r * PX, seen = {}, edges = [], deg = {}; const key = (c, r) => c + "," + r;
  (function carve(c, r) { seen[key(c, r)] = 1; const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]].sort(() => rnd() - 0.5); for (const [dc, dr] of dirs) { const nc = c + dc, nr = r + dr; if (nc < 0 || nr < 0 || nc >= COLS || nr >= ROWS || seen[key(nc, nr)]) continue; edges.push([[c, r], [nc, nr]]); deg[key(c, r)] = (deg[key(c, r)] || 0) + 1; deg[key(nc, nr)] = (deg[key(nc, nr)] || 0) + 1; carve(nc, nr); } })(0, ROWS - 1);
  // a few loops so it is not a pure tree
  [[[2, 1], [3, 1]], [[4, 2], [5, 2]], [[1, 2], [1, 3]], [[5, 0], [6, 0]]].forEach(e => { if (!edges.some(x => (x[0][0] === e[0][0] && x[0][1] === e[0][1] && x[1][0] === e[1][0] && x[1][1] === e[1][1]) || (x[1][0] === e[0][0] && x[1][1] === e[0][1] && x[0][0] === e[1][0] && x[0][1] === e[1][1]))) edges.push(e); });
  const guide = [["bone", E(cx(0), cy(ROWS - 1), 64, 64)]];
  for (const [[a, b], [c, d]] of edges) { guide.push(["bone", L([[cx(a), cy(b)], [cx(c), cy(d)]], 76)]); guide.push(["bone", E(cx(a), cy(b), 56, 56)], ["bone", E(cx(c), cy(d), 56, 56)]); }
  // the heart: a round chamber at the farthest cell, entrance cell at the bottom left
  const hx = cx(COLS - 1), hy = cy(0); guide.push(["floor", E(hx, hy, 110, 100)]);
  guide.push(["bone", L([[cx(0), cy(ROWS - 1)], [cx(0), 940]], 90)]);
  const props = [], lights = [];
  for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) {
    const k = key(c, r), d = deg[k] || 0, x = cx(c), y = cy(r), h = Math.abs(Math.sin(c * 12.9 + r * 78.2) * 43758.5) % 1;
    if (c === 0 && r === ROWS - 1) continue;
    if (d === 1 && !(c === COLS - 1 && r === 0)) props.push(["boneBrazier", x + 30, y - 10], ["skullPile", x - 30, y + 24]);
    else if (d >= 3) props.push(["bonePillar", x + 44, y - 30], h > 0.5 ? ["boneBrazier", x - 44, y - 30] : ["skullPile", x - 40, y + 44]);
    else if (h > 0.55) props.push([h > 0.8 ? "spineArc" : "ribArch", x + 36, y + 42, { flip: h > 0.7 }]);
  }
  props.push(["boneBrazier", hx - 70, hy - 20], ["boneBrazier", hx + 70, hy - 20], ["bullSkullAltar", hx, hy - 60], ["hornGate", cx(0), 916, { dy: -60 }], ["boneBrazier", cx(0) - 50, 860], ["boneBrazier", cx(0) + 50, 860], ["bonePillar", hx - 90, hy + 70], ["bonePillar", hx + 90, hy + 70]);
  World.def("boneMaze", {
    name: "K1: The Bone Maze", w: 1500, h: 1000, base: "rock", music: "dungeon", rim: 40,
    look: "A winding labyrinth of pale bone-dust corridors carved into dark rock, seen from above, ribs and horns half buried in the walls, scattered small bones, eerie. A round stone chamber at the end.",
    legend: { bone: "pale bone-dust floor with small scattered bones and vertebrae", floor: "round chamber of carved stone floor with a bull glyph", rock: "dark rock walls studded with giant bones, ribs and horns" },
    guide, dark: { ambient: 0.78, radius: 200, fireRadius: 130 },
    entries: { start: { x: cx(0), y: 900, face: "up" }, from_wells: { x: cx(0), y: 900, face: "up" } },
    exits: [{ rect: [cx(0) - 50, 946, 100, 40], to: "amberWells", entry: "from_boneMaze", push: [0, -1] }],
    triggers: [{ id: "k1Cage", rect: [hx - 50, hy + 8, 100, 60] }],
    chests: [{ id: "g4_wardenHalls", x: hx + 70, y: hy + 28 }],
    npcs: [{ id: "oldMazeheart", art: "npcMazeKeeper", name: "Old Mazeheart", x: cx(0) + 70, y: 780 }],
    props, scatter: [{ keys: [["skullPile", 1], ["bones", 3], ["bones2", 3], ["skull", 2]], n: 60, on: ["bone"], seed: 51, tries: 3000 }],
    encounter: { table: "boneMaze", rate: 20 },
    amb: { motes: 26, tint: [0x182838, 0.22], warm: null, dust: 0xc8d0d8, water: false },
  });
})();
