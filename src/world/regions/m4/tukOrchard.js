// M4 ch8: Tuk Orchard (town, no fights). Inn: the Green Husk (entry `inn`). Shop `tuk`. Entries start from_orchardHills inn. Exit orchardHills@from_tukOrchard (S road).
// NPC ids: innkeeper merchant widow pressman r1 r2 r3. No triggers.
(function () {
  const { R, E, P, L } = World.shapes, M = World.m3, props = [];
  // the north row stands against the hill foot: white houses, the Green Husk inn, the cacao press
  props.push(["m4_tukHouse", 170, 264], ["m4_tukHouse", 340, 264], ["m4_tukInn", 540, 264], ["m4_cacaoPress", 930, 264], ["m4_tukHouse", 1110, 264], ["m4_tukHouse", 1280, 264]);
  // the square: a well, benches, drying racks of cacao beans, baskets
  props.push(["fountain", 750, 560, { solid: [34, 14] }], ["stoneBench", 640, 620], ["stoneBench", 860, 620], ["m4_dryingRack", 380, 480], ["m4_dryingRack", 520, 520], ["m4_dryingRack", 1020, 480], ["m4_dryingRack", 1160, 540], ["m4_pickerBaskets", 300, 600], ["m4_pickerBaskets", 1260, 620], ["m4_waterJars", 460, 400], ["m4_waterJars", 1040, 400]);
  // cacao trees round the edges, a fenced yard, hanging lamps
  props.push(["m4_cacaoTree", 120, 540], ["m4_cacaoTree", 200, 760], ["m4_cacaoTree", 380, 820], ["m4_cacaoTree", 1120, 830], ["m4_cacaoTree", 1300, 780], ["m4_cacaoTree", 1380, 560], ["m4_fruitTree", 280, 900], ["m4_fruitTree", 1220, 920], ["m4_fruitTree", 540, 780], ["m4_fruitTree", 960, 800], ["lampPost", 700, 400], ["lampPost", 800, 400], ["lampPost", 700, 860], ["lampPost", 800, 860]);
  World.def("tukOrchard", {
    name: "Tuk Orchard", w: 1500, h: 1000, base: "grass", music: "orchardTown", rim: 40,
    look: "A quiet orchard village seen from above: white-washed houses with brown-red tile roofs in a row under a green hill, an inn and a cacao press, a small paved square with a well, long drying racks of cacao beans, dark glossy cacao trees and fruit trees all round, a dirt road leaving south. A sweet smell and a sad quiet; soft warm afternoon light.",
    legend: { grass: "rich green grass with fallen cacao pods, flowers and dappled shadow", paved: "worn pale stone paving of the square", road: "reddish dirt road", rock: "green hill foot, vine-covered stone", sand: "pale packed earth yards" },
    bank: { grass: "green", paved: "grey", road: "dirt", rock: "dark", sand: "sand" },
    grade: { grass: { mul: [0.82, 0.96, 0.55], add: [2, 6, -8] }, paved: { mul: [1.0, 0.96, 0.88], add: [4, 2, -2] }, road: { mul: [1.05, 0.8, 0.6], add: [10, 0, -6] }, rock: { mul: [0.5, 0.6, 0.45], add: [0, 4, 0] }, _: [0.98, 1, 0.96] },
    marks: [{ k: "dot", on: ["grass"], n: 60, col: [240, 190, 90], a: 0.6, r: [1, 2], hi: false }, { k: "blot", on: ["grass"], n: 10, col: [30, 70, 30], a: 0.22, r: [14, 36] }],
    guide: [
      ["rock", R(0, 0, 1500, 260)], ["sand", R(60, 260, 1380, 130)], ["road", L([[750, 960], [750, 300]], 110)], ["paved", E(750, 560, 300, 150)],
      ["sand", E(380, 500, 140, 60)], ["sand", E(1100, 510, 150, 60)],
    ],
    entries: { start: { x: 750, y: 900, face: "up" }, from_orchardHills: { x: 750, y: 900, face: "up" }, inn: { x: 540, y: 320, face: "down" } },
    exits: [{ rect: [690, 950, 120, 50], to: "orchardHills", entry: "from_tukOrchard", push: [0, 1], floor: "road" }],
    npcs: [
      { id: "innkeeper", art: "npcRebelCook", name: "Innkeeper", x: 600, y: 316, hint: "E / Space: the Green Husk" },
      { id: "merchant", art: "merchant", name: "Merchant", x: 400, y: 330 },
      { id: "widow", art: "npcWidow", name: "Widow Tuk", x: 230, y: 320 },
      { id: "pressman", art: "npcPressman", name: "Pressman", x: 990, y: 322 },
      { id: "r1", art: "npcOrchardWorker", name: "Picker", x: 460, y: 560 }, { id: "r2", art: "npcGranny", name: "Old woman", x: 1020, y: 600 }, { id: "r3", art: "npcChild", name: "Child", x: 800, y: 700 },
      { id: null, art: "npcOrchardWorker", x: 600, y: 760, path: [[400, 760], [1100, 760]], speed: 16 }, { id: null, art: "npcVillagerF", x: 1200, y: 420, path: [[1100, 420], [1350, 420], [1350, 560]], loop: true, speed: 14 },
    ],
    props,
    scatter: [{ keys: [["m4_pickerBaskets", 1], ["m4_flowerBed", 2], ["hayBales", 1]], n: 12, on: ["grass"], seed: 311, scaleRange: [0.85, 1] }],
    amb: { birds: 1, butterflies: [[500, 700], [1000, 740]], water: true, dust: 0xf0e8c8, motes: 30, tint: [0x30382c, 0.1], warm: [0xffd8a0, 0.05], smoke: [[930, 262], [170, 262]], vignette: 1 },
  });
})();
