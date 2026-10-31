// M4 ch8: Red Salt Weir (town, no fights, grey sky). Inn: the Crust House (entry `inn`). Shop `weir` (backup Cinderglass Ember).
// Entries start from_saltFlats from_redSaltMines inn. Exits saltFlats@from_redSaltWeir (E road), redSaltMines@from_redSaltWeir (mine head, W).
// NPC ids: innkeeper merchant foremanSalt workerLeader child r1 r2 r3. No triggers.
(function () {
  const { R, E, P, L } = World.shapes, M = World.m3, props = [];
  // the north row stands on the cliff foot: overseers' towers, the inn, the shop, whitewashed barracks
  props.push(["m4_overseerTower", 170, 304], ["m4_whiteBarracks", 400, 304], ["amberStall", 640, 330], ["m4_tukInn", 900, 304, { tint: 0xd8d0c8 }], ["m4_whiteBarracks", 1150, 304], ["m4_overseerTower", 1370, 304], ["m4_whiteBarracks", 1560, 304, { tint: 0xe0d8d0 }]);
  props.push(["lampPost", 780, 380], ["lampPost", 1030, 380], ["crateStack", 700, 420], ["m4_brineVat", 1260, 400], ["m4_brineVat", 1330, 420], ["m4_waterJars", 560, 410], ["noticeBoard", 1020, 420]);
  // brine pans across the middle: pans, rakes, salt mounds, vats
  props.push(["m4_saltPan", 330, 640], ["m4_saltPan", 620, 700], ["m4_saltPan", 920, 620], ["m4_saltPan", 1230, 700], ["m4_saltPan", 1500, 640], ["m4_saltMound", 470, 780], ["m4_saltMound", 1080, 790], ["m4_saltMound", 760, 560], ["m4_brineVat", 180, 780], ["m4_brineVat", 1600, 820]);
  // chain lines and workers' quarters in the south, the mine head in the west rock
  props.push(["m4_chainPost", 300, 900], ["m4_chainPost", 380, 910], ["m4_chainPost", 800, 920], ["m4_chainPost", 880, 930], ["m4_chainPost", 1300, 900], ["m4_whiteBarracks", 560, 1000, { scale: 0.8, tint: 0xc8c0b8 }], ["m4_whiteBarracks", 1060, 1000, { scale: 0.8, tint: 0xc8c0b8 }], ["m4_saltMound", 1500, 960], ["mineCart", 200, 960], ["m4_mineHead", 130, 560, { solid: [70, 14] }], ["m4_gibbet", 1180, 920]);
  World.def("redSaltWeir", {
    name: "Red Salt Weir", w: 1700, h: 1100, base: "salt", music: "provinces", rim: 40,
    look: "A harsh salt-mining town seen from above under a flat grey sky: a row of whitewashed barracks, overseers' towers and an inn against a grey cliff in the north, a wide paved street under it, below it fields of rectangular brine pans with white crystal crusts and rust-red salt mud, chain lines and workers' sheds in the south, a dark mine tunnel mouth in the west cliff, a road leaving east. Grey, joyless, orderly.",
    legend: { salt: "white and pink-grey cracked salt crust with trampled paths", paved: "grey-white flagstone street stained with brine", shallow: "shallow milky brine pans with white crystal edges", red: "rust-red salt mud", road: "packed salt road with ruts", rock: "grey cliff", wall: "grey stone", water: "deep brine" },
    bank: { salt: "salt", paved: "grey", shallow: "teal", red: "red", road: "dirt", rock: "dark", wall: "grey" },
    grade: { salt: { mul: [0.94, 0.92, 0.94], add: [0, -2, 0] }, paved: { mul: [0.88, 0.88, 0.9], add: [0, 0, 2] }, shallow: { mul: [0.7, 0.95, 0.85], add: [6, 12, 8] }, red: { mul: [0.8, 0.52, 0.48], add: [4, -4, -4] }, rock: { mul: [0.65, 0.68, 0.74], add: [0, 0, 4] }, _: [0.96, 0.97, 1] },
    marks: [{ k: "crack", on: ["salt"], n: 40, col: [120, 100, 100], a: 0.35, len: [18, 50] }, { k: "dot", on: ["salt"], n: 50, col: [255, 255, 255], a: 0.7, r: [1, 2], hi: false }],
    guide: [
      ["rock", R(0, 0, 1700, 300)], ["paved", R(60, 300, 1580, 180)],
      ["salt", R(60, 480, 1580, 580)], ["red", E(300, 840, 200, 90)], ["red", E(1300, 860, 220, 80)],
      ["shallow", E(330, 640, 120, 50)], ["shallow", E(620, 700, 120, 50)], ["shallow", E(920, 620, 120, 50)], ["shallow", E(1230, 700, 120, 50)], ["shallow", E(1500, 640, 110, 46)],
      ["road", L([[1640, 620], [1300, 560], [1000, 480]], 90)], ["road", L([[60, 700], [200, 620]], 90)],
    ],
    entries: { start: { x: 1560, y: 620, face: "left" }, from_saltFlats: { x: 1560, y: 620, face: "left" }, from_redSaltMines: { x: 190, y: 700, face: "right" }, inn: { x: 900, y: 360, face: "down" } },
    exits: [
      { rect: [1600, 570, 60, 100], to: "saltFlats", entry: "from_redSaltWeir", push: [1, 0], floor: "road" },
      { rect: [52, 650, 60, 100], to: "redSaltMines", entry: "from_redSaltWeir", push: [-1, 0], floor: "road" },
    ],
    npcs: [
      { id: "innkeeper", art: "npcCook", name: "Innkeeper", x: 840, y: 346, hint: "E / Space: the Crust House" },
      { id: "merchant", art: "merchant", name: "Merchant", x: 690, y: 372 },
      { id: "foremanSalt", art: "npcOverseer", name: "Foreman", x: 1300, y: 350 },
      { id: "workerLeader", art: "npcWorkerLeader", name: "Miner", x: 420, y: 740 },
      { id: "child", art: "npcChild", name: "Child", x: 800, y: 640 },
      { id: "r1", art: "npcMiner", name: "Miner", x: 560, y: 560 }, { id: "r2", art: "npcWidow", name: "Woman", x: 1100, y: 560 }, { id: "r3", art: "npcMiner", name: "Miner", x: 1380, y: 780 },
      { id: null, art: "npcMiner", x: 700, y: 880, path: [[500, 870], [900, 870]], speed: 16 }, { id: null, art: "npcOverseer", x: 1000, y: 440, path: [[600, 440], [1300, 440]], speed: 20 },
      { id: null, art: "npcSlave", x: 340, y: 840, still: true }, { id: null, art: "npcSlave", x: 840, y: 860, still: true },
    ],
    props,
    scatter: [{ keys: [["m4_saltMound", 2], ["crates", 1], ["m4_saltBush", 1], ["bones2", 1]], n: 22, on: ["salt"], seed: 281, scaleRange: [0.8, 1] }],
    amb: { birds: 0, butterflies: [], water: true, dust: 0xe0d8d4, motes: 34, tint: [0x30343c, 0.12], warm: [0xffb890, 0.03], smoke: [[1150, 300], [400, 300], [1560, 300]], vignette: 1 },
  });
})();
