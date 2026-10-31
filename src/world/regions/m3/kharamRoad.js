// M3 / ch6: the Kharam Road (field). Table "kharamRoad" 30 s. Entries start from_brassHarbour from_kharamOasis from_drownedFenShrine from_giantQuarry from_sunbirdRoost. Exits to brassHarbour@from_kharamRoad (W), kharamOasis@from_kharamRoad (E),
// drownedFenShrine@from_kharamRoad (S), giantQuarry@from_kharamRoad (N-E mesa gap), sunbirdRoost@from_kharamRoad (N mesa gap). Trigger raiderS9 (the raided caravan at the crossroads). Chests roadChest1 roadChest2. Legend L4 (Old Hollowbell).
(function () {
  const { R, E, P, L } = World.shapes, M = World.m3, props = [];
  // the raided caravan at the crossroads (S9 set piece): burnt wagons, spilled crates, bones, a dead camel
  props.push(["supplyWagon", 1420, 1050, { tint: 0x504038 }], ["cart", 1560, 1020, { tint: 0x605048, flip: true }], ["campCrates", 1500, 1090], ["crates", 1380, 1110], ["camelBones", 1590, 1100], ["camel", 1480, 960, { tint: 0x807060 }], ["bones", 1450, 1130], ["debris", 1350, 1000], ["burntTree", 1640, 960], ["cairn", 1510, 940, { scale: 0.8 }]);
  // mesas: red rock masses and pillars around the three northern mesas, ruined builder pillars along the road
  props.push(["redMass", 860, 560], ["redPillar", 700, 480], ["redPillar", 1060, 500], ["redMass", 1750, 540], ["redPillar", 1560, 440], ["redPillar", 1920, 460], ["redMass", 2680, 640], ["redPillar", 2520, 520], ["redPillar", 2860, 560], ["redMass", 440, 700], ["redMass", 2200, 700]);
  props.push(["builderPillar", 620, 1180], ["builderPillar", 780, 960], ["builderPillar", 1830, 1180], ["builderPillar", 2060, 940], ["builderPillar", 2440, 1090], ["lightStele", 2300, 1020], ["lightStele", 900, 1110], ["builderConduit", 1200, 1230], ["vaultRubble", 700, 1000]);
  props.push(["m2_milestone", 260, 1170], ["m2_milestone", 2780, 1030], ["m2_milestone", 1260, 1000], ["m2_signalPole", 2700, 940], ["m2_signalPole", 320, 1030], ["tent", 2150, 1220, { tint: 0xe0c8a0 }], ["campfire", 2230, 1250, { fire: [0, -22, 0.7] }], ["camel", 2110, 1290], ["hayBales", 2010, 1260]);
  // fen mouth in the south-west: reeds, mangrove, grey water; sea line on the far west edge
  props.push(["reedFence", 560, 1600], ["m2_mangrove", 480, 1520], ["m2_mudReeds", 820, 1560], ["m2_mudReeds", 960, 1700], ["m2_mangrove", 940, 1780], ["m2_driftwood", 380, 1760], ["m2_tidalRock", 300, 1480]);
  World.def("kharamRoad", {
    name: "The Kharam Road", w: 3000, h: 2000, base: "sand", music: "desert", rim: 48,
    look: "Coastal desert hills seen from above: pale sand and red-brown stony ground, a wide caravan track crossing east to west with side tracks leading north to flat-topped red mesas and south to a grey tidal fen, dry wadis, scattered boulders, ruined builder pillars. Hot, wide, dusty, late afternoon light.",
    legend: { sand: "pale desert sand with ripples, pebbles and dry tufts", road: "a wide worn caravan track with deep wheel ruts and hoofprints", red: "red-brown stony hill ground with cracks and loose rocks", rock: "steep red flat-topped mesa cliffs, impassable layered stone", shallow: "a dry-looking wadi bed of pale gravel with a little water, and tidal fen water in the south-west", grass: "dull olive scrub grass and mud of the tidal fen", water: "grey-green tidal water" },
    bank: { rock: "red", sand: "sand", road: "dirt", red: "red", shallow: "teal", grass: "mud" }, grade: { rock: { mul: [1.45,0.95,0.8], add: [0, 0, 0] }, sand: { mul: [1.0, 0.98, 0.95], add: [0, 0, 0] }, road: { mul: [0.95, 0.85, 0.75], add: [0, 0, 0] }, red: { mul: [0.95, 0.85, 0.85], add: [0, 0, 0] }, grass: { mul: [0.9, 1.1, 0.9], add: [0, 6, 0] }, shallow: { mul: [0.85, 1.0, 0.95], add: [14, 16, 10] }, water: { mul: [0.95, 1.2, 1.15], add: [4, 10, 8] } },
    marks: [{ k: "blot", on: ["sand"], n: 12, col: [140, 100, 60], a: 0.14, r: [14, 40] }],
    guide: [
      ["red", E(1250, 1150, 480, 220)], ["red", E(2200, 800, 360, 190)], ["red", E(560, 800, 260, 160)],
      ["rock", E(880, 440, 270, 170)], ["rock", E(1760, 380, 300, 190)], ["rock", E(2690, 470, 250, 220)], ["rock", E(450, 360, 190, 130)],
      ["road", L([[44, 1100], [600, 1060], [1200, 1030], [1800, 1000], [2400, 990], [2960, 960]], 140)],
      ["road", L([[700, 1050], [720, 1500], [720, 1990]], 110)], ["road", L([[1300, 1030], [1280, 640], [1300, 60]], 110)], ["road", L([[2300, 980], [2380, 500], [2400, 60]], 110)],
      ["shallow", L([[1700, 1080], [1900, 1400], [2100, 1700], [2200, 1990]], 80)], ["shallow", L([[300, 600], [500, 900]], 60)],
      ["grass", E(700, 1760, 380, 190)], ["water", E(520, 1860, 230, 90)], ["shallow", E(700, 1700, 330, 130)], ["road", L([[720, 1500], [720, 1990]], 110)],
    ],
    entries: { start: { x: 140, y: 1090, face: "right" }, from_brassHarbour: { x: 140, y: 1090, face: "right" }, from_kharamOasis: { x: 2880, y: 960, face: "left" }, from_drownedFenShrine: { x: 720, y: 1910, face: "up" }, from_giantQuarry: { x: 2400, y: 140, face: "down" }, from_sunbirdRoost: { x: 1300, y: 140, face: "down" } },
    exits: [
      { rect: [0, 1030, 80, 140], to: "brassHarbour", entry: "from_kharamRoad", push: [1, 0] }, { rect: [2920, 890, 80, 140], to: "kharamOasis", entry: "from_kharamRoad", push: [-1, 0] },
      { rect: [650, 1940, 140, 60], to: "drownedFenShrine", entry: "from_kharamRoad", push: [0, -1] }, { rect: [2330, 0, 140, 60], to: "giantQuarry", entry: "from_kharamRoad", push: [0, 1] }, { rect: [1230, 0, 140, 60], to: "sunbirdRoost", entry: "from_kharamRoad", push: [0, 1] },
    ],
    triggers: [{ id: "raiderS9", rect: [1330, 940, 330, 210] }],
    chests: [{ id: "roadChest1", x: 2010, y: 1110 }, { id: "roadChest2", x: 640, y: 700 }],
    legends: [{ id: "L4", enemy: "oldHollowbell", level: 28, chance: 0.04, spots: [[1900, 1350], [900, 1330], [2150, 640]] }],
    npcs: [
      { id: null, art: "npcTrader", x: 700, y: 1070, path: [[300, 1070], [1000, 1050]], speed: 26 }, { id: null, art: "npcTraveler", x: 2100, y: 990, path: [[1800, 1000], [2700, 970]], speed: 24 }, { id: null, art: "npcVillagerM", x: 2150, y: 1250, still: true },
    ],
    props,
    scatter: [
      { keys: [["sandBoulder", 3], ["camelBones", 1], ["cairn", 1], ["rocks", 2], ["shrub", 3], ["cactus", 2]], n: 70, on: ["sand", "red"], seed: 81, scaleRange: [0.8, 1.15] },
      { keys: [["m2_mudReeds", 2], ["m2_mangrove", 1], ["m2_driftwood", 1]], n: 14, on: ["grass", "shallow"], seed: 82 },
    ],
    encounter: { table: "kharamRoad", rate: 30 },
    amb: { birds: 4, butterflies: [], dust: 0xd8b888, motes: 30, tint: [0x4a3a20, 0.05], warm: [0xff9a40, 0.06], water: true,
      armies: [{ id: "patrolRoad", lane: [[1900, 1000], [2400, 990], [2800, 970], [2400, 990]], mode: "pingpong", speed: 32, rows: 2, cols: 4, sight: 220, table: "kharamRoad" }] },
  });
})();
