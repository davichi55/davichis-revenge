// M4 ch9: Cell nine (interior, music hope, no fights). Entries start from_blackMirrorPrison. Exit blackMirrorPrison@from_prisonCellNine (W end of the corridor). Trigger cellNine (inside the glass cell).
(function () {
  const { R, E, P, L } = World.shapes, props = [], lights = [];
  // the corridor: black glass walls on both sides, lamps, empty cells
  for (const x of [200, 360, 520]) props.push(["m4_cellDoorGlass", x, 520, { solid: false }]);
  props.push(["m4_glassPillarBlack", 160, 700], ["m4_glassPillarBlack", 420, 700], ["m4_glassPillarBlack", 640, 700], ["m4_prisonLamp", 280, 700, { fire: [0, -84, 0.6] }], ["m4_prisonLamp", 540, 700, { fire: [0, -84, 0.6] }]);
  lights.push([280, 640, 120, 0.4], [540, 640, 120, 0.4]);
  // cell nine: a bench scratched all over, a high window with a thin shaft of light, a heap of chains, scratches of a lullaby on the wall
  props.push(["m4_glassWall", 850, 330, { solid: false }], ["m4_lampWindow", 850, 300, { solid: false, tint: 0xb8d8ff, alpha: 0.9 }], ["m4_clawBench", 800, 520], ["m4_chainPile", 900, 560, { solid: false }], ["m4_shackledBones", 950, 440, { solid: false }], ["m4_cellDoorGlass", 700, 620, { solid: false }], ["m4_glassSpikes", 960, 340, { scale: 0.5 }]);
  lights.push([850, 430, 180, 0.6]);
  World.def("prisonCellNine", {
    name: "Cell Nine", w: 1100, h: 800, base: "rock", music: "hope", rim: 40,
    look: "A long dark corridor of polished black glass cells seen from above, ending in a single small glass cell: a stone floor with a bench, scratches of tiny claw marks covering the walls in the pattern of a song, a thin pale shaft of light from a small high window, a heap of old chains. Silent, cold, a single warm spot of light.",
    legend: { floor: "polished black glass floor with a thin pale shaft of light and dust", glass: "dark green-black glass corridor floor", paved: "plain dark stone slabs with scratches" },
    bank: { floor: "dark", glass: "dark", paved: "grey" },
    grade: { floor: { mul: [0.42, 0.55, 0.5], add: [0, 2, 0] }, glass: { mul: [0.36, 0.52, 0.46], add: [-2, 2, 0] }, paved: { mul: [0.55, 0.6, 0.55], add: [0, 0, 0] }, rock: { mul: [0.4, 0.46, 0.44], add: [0, 0, 0] }, _: [0.95, 1, 0.98] },
    marks: [{ k: "crack", on: ["floor", "paved"], n: 30, col: [210, 210, 190], a: 0.4, len: [10, 30] }],
    guide: [["glass", L([[100, 610], [720, 610]], 120)], ["paved", R(700, 340, 320, 360)]],
    entries: { start: { x: 180, y: 610, face: "right" }, from_blackMirrorPrison: { x: 180, y: 610, face: "right" } },
    exits: [{ rect: [52, 560, 56, 100], to: "blackMirrorPrison", entry: "from_prisonCellNine", push: [1, 0], floor: "glass" }],
    triggers: [{ id: "cellNine", rect: [770, 430, 220, 170] }],
    npcs: [],
    props,
    lights,
    dark: { ambient: 0.5, radius: 260, color: 0x020608 },
    amb: { birds: 0, butterflies: [], water: false, motes: 28, dust: 0xc0e8ff, tint: [0x102030, 0.12], vignette: 1 },
  });
})();
