// M3 / ch6: the Quarry of the Stone Giants (K4). Table "giantQuarry" 22 s. Entries start from_kharamRoad. Exit kharamRoad@from_giantQuarry.
// Triggers: s8Fight (loading platform, collar altar), block1..5 (press, push the carved blocks; flags qb.1..5, the glyph tile lights on qb.N), quarryGiant (inner hall, beyond the door that opens on quarry.open). Chest g18_counterstrikeBastion.
(function () {
  const { R, E, P, L } = World.shapes, M = World.m3, props = [];
  const B = [[560, 1060], [790, 1250], [1090, 1190], [1480, 1270], [1880, 1350]], T = [[880, 800], [1040, 800], [1200, 800], [1360, 800], [1520, 800]];
  B.forEach(([x, y], i) => props.push(["blockStack", x, y, { hide: "qb." + (i + 1) }]));
  T.forEach(([x, y], i) => props.push(["cryptGlyphZenith", x, y, { solid: false, tint: 0x806040 }], ["cryptGlyphDawn", x, y, { solid: false, show: "qb." + (i + 1), glow: "gold" }], ["blockStack", x, y - 6, { show: "qb." + (i + 1) }]));
  // the outer works: cranes, ore heaps, carts, tool racks, half-cut colossi on the cliff face
  props.push(["scaffoldCrane", 420, 840], ["scaffoldCrane", 1960, 1250], ["oreHeap", 360, 1150], ["oreHeap", 1950, 1020], ["mineCart", 460, 1280], ["mineCart", 1750, 1430], ["toolRack", 640, 900], ["toolRack", 1740, 880], ["slagPile", 330, 1020], ["slagPile", 2060, 1160], ["m2_quarryPit", 1300, 1400], ["m2_workerTent", 2090, 1330], ["m2_workerTent", 300, 1360], ["campfire", 380, 1230, { fire: [0, -22, 0.7] }], ["m2_campCrates", 2000, 1420]);
  props.push(["redMass", 330, 760], ["redMass", 2090, 760], ["redPillar", 500, 760], ["redPillar", 1900, 740], ["m2_stoneHead", 700, 750, { scale: 1.3 }], ["m2_stoneHead", 1710, 750, { scale: 1.3 }], ["poolStatue", 780, 760, { tint: 0xc8b090, scale: 1.2 }], ["poolStatue", 1640, 760, { tint: 0xc8b090, scale: 1.2 }]);
  // the loading platform on the east side with the portable collar altar and the overseer's guards
  props.push(["m2_collarAltar", 1900, 900, { glow: "gold" }], ["dominionBanner", 1790, 840], ["dominionBanner", 2010, 840], ["torchPole", 1780, 980], ["torchPole", 2020, 980], ["legionStandard", 1900, 820], ["supplyWagon", 2020, 920, { flip: true }], ["weaponRack", 1790, 1020]);
  // the sealed door of the inner works and the inner hall of giants
  props.push(["builderDoor", 1200, 700, { hide: "quarry.open", solid: [58, 16], tint: 0x686058 }], ["lightStele", 1110, 690, { tint: 0xffd080 }], ["lightStele", 1290, 690, { tint: 0xffd080 }], ["drownedColossus", 820, 480, { tint: 0xb8a088, scale: 1.3 }], ["drownedColossus", 1580, 480, { tint: 0xb8a088, scale: 1.3 }], ["poolStatue", 960, 300, { tint: 0xc8b090, scale: 1.4 }], ["poolStatue", 1440, 300, { tint: 0xc8b090, scale: 1.4 }], ["m2_stoneHead", 1200, 180, { scale: 1.6 }],
    ["redPillar", 760, 250], ["redPillar", 1640, 250], ["builderPillar", 1000, 560], ["builderPillar", 1400, 560], ["scaffoldCrane", 760, 600], ["m2_stoneCart", 1660, 600], ["toolRack", 880, 600], ["oreHeap", 1500, 640], ["lightStele", 1200, 420, { tint: 0xffd080 }]);
  World.def("giantQuarry", {
    name: "Quarry of the Stone Giants", w: 2400, h: 1600, base: "rock", music: "pyramid", rim: 44,
    look: "A cliff-side quarry carved into giant figures seen from above: a wide worked quarry floor of orange-red stone dust with cart tracks and chisel scars, a raised paved loading platform on the east side, five round glyph tiles in a row below a sealed black door, an inner hall of dark polished stone floor with thin gold light-lines, half-finished colossi carved out of the cliff walls. Dusty, monumental, harsh afternoon light.",
    legend: { red: "orange-red quarry stone dust, chisel scars, cart tracks and rubble", sand: "pale stone chips and dust, trampled", paved: "grey cut-stone paving of the loading platform with iron rings and rope marks", floor: "dark polished black stone with thin gold inlay light-lines", road: "a packed dirt track with deep cart ruts", rock: "tall cliffs carved with the rough shapes of giants, impassable" },
    bank: { rock: "red", red: "red", sand: "sand", paved: "grey", floor: "dark", road: "dirt" }, grade: { rock: { mul: [1.35,0.95,0.8], add: [0, 0, 0] }, red: { mul: [0.95, 0.85, 0.8], add: [0, 0, 0] }, sand: { mul: [0.95, 0.9, 0.85], add: [-4, -4, -4] }, paved: { mul: [0.95, 0.9, 0.85], add: [4, 2, 0] }, floor: { mul: [1.3, 1.1, 0.8], add: [18, 12, 2] }, road: { mul: [0.9, 0.8, 0.7], add: [0, 0, 0] } },
    marks: [{ k: "crack", on: ["floor"], n: 60, col: [230, 190, 90], a: 0.7, len: [20, 70] }, { k: "crack", on: ["red", "sand"], n: 22, col: [80, 40, 30], a: 0.5, len: [10, 40] }],
    guide: [
      ["red", R(300, 700, 1800, 800)], ["sand", E(900, 1100, 400, 200)], ["sand", E(1500, 1300, 360, 140)], ["paved", R(1700, 760, 380, 300)], ["road", L([[1200, 1600], [1200, 1300], [1500, 1180], [1790, 1000]], 110)], ["road", L([[1200, 1450], [640, 1200], [420, 1000]], 90)],
      ["floor", R(1140, 600, 120, 120)], ["floor", R(700, 100, 1000, 540)], ["paved", E(1200, 330, 160, 90)],
    ],
    entries: { start: { x: 1200, y: 1520, face: "up" }, from_kharamRoad: { x: 1200, y: 1520, face: "up" } },
    exits: [{ rect: [1130, 1540, 140, 60], to: "kharamRoad", entry: "from_giantQuarry", push: [0, -1] }],
    triggers: [{ id: "s8Fight", rect: [1760, 800, 280, 200] }, ...B.map(([x, y], i) => ({ id: "block" + (i + 1), rect: [x - 50, y - 36, 100, 56], press: true })), { id: "quarryGiant", rect: [1080, 330, 240, 130] }],
    chests: [{ id: "g18_counterstrikeBastion", x: 1580, y: 330 }],
    npcs: [{ id: "quarryPlaque", art: null, name: "A builders' plaque", x: 1110, y: 1440, hint: "E / Space: the plaque" }, { id: null, art: "npcLegionGuard", x: 1830, y: 940, still: true }, { id: null, art: "npcLegionGuard", x: 1970, y: 940, still: true, flip: true }, { id: null, art: "npcOverseer", x: 1900, y: 990, still: true }, { id: null, art: "npcSlave", x: 1100, y: 1120, path: [[900, 1120], [1400, 1120]], speed: 20 }],
    gather: [{ id: "chiselSteel1", x: 470, y: 960, label: "Snapped chisels", color: 0xd8c090 }, { id: "chiselSteel2", x: 1620, y: 1390, label: "A cart of spoilt chisels", color: 0xd8c090 }],
    props,
    scatter: [{ keys: [["rubblePile", 2], ["m2_rubbleHeap", 1], ["sandBoulder", 1], ["oreHeap", 1]], n: 36, on: ["red", "sand"], seed: 111, scaleRange: [0.8, 1.05] }, { keys: [["vaultRubble", 1], ["rubblePile", 1]], n: 10, on: ["floor"], seed: 112 }],
    lights: [[1200, 330, 220, 0.5]],
    encounter: { table: "giantQuarry", rate: 22 },
    amb: { birds: 0, butterflies: [], dust: 0xd8b890, motes: 50, tint: [0x4a3020, 0.08], warm: [0xffa050, 0.05], smoke: [[1960, 1250, 0x707070]] },
  });
})();
