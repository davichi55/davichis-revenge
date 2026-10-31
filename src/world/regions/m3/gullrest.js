// M3 / ch6: Gullrest, the fishermen's island town (no fights). Entries start from_sea from_maelstromCaves inn. Exits weepingSea@from_gullrest (the pier at the south), maelstromCaves@from_gullrest (the east jetty, a boat steps to the cave mouth).
// NPC ids: innkeeper merchant gullCaptain r1 r2 r3 fisher.
(function () {
  const { R, E, P, L } = World.shapes, M = World.m3, props = [], wood = 0xe0c8a8;
  // the lighthouse of stacked hull-planks, the Wet Wick inn, huts on stilts and wreck-wood sheds
  props.push(["lighthouse", 1060, 380, { tint: 0xd8b890 }], ["m2_stiltInn", 560, 400], ["m2_stiltHouseA", 380, 330], ["m2_stiltHouseB", 760, 300], ["m2_stiltHouseC", 940, 520], ["m2_stiltHouseD", 330, 560], ["m2_stiltStore", 700, 640], ["m2_stiltHouseA", 1120, 600], ["m2_stiltHouseB", 500, 640], ["m2_stiltHouseD", 880, 350]);
  props.push(["m2_fishRack", 440, 470], ["m2_fishRack", 640, 560], ["netRack", 800, 470], ["netRack", 1000, 480], ["m2_netPile", 860, 680], ["m2_crabBasket", 600, 700], ["m2_crabBasket", 1020, 720], ["m2_hangingFish", 680, 410], ["m2_hangingFish", 460, 400], ["m2_clothesLine", 270, 450], ["m2_clothesLine", 1200, 470], ["fishBarrels", 940, 680], ["m2_oarRack", 740, 720], ["m2_waterJars", 400, 700], ["campfire", 900, 580, { fire: [0, -22, 0.7] }]);
  props.push(["ribArch", 260, 640], ["boneWall", 1280, 560], ["hornSkull", 1220, 400], ["m2_driftwood", 230, 520], ["m2_driftwood", 1300, 640], ["m2_mudBoat", 380, 760], ["m2_stiltBoat", 1120, 780], ["rowboatMoored", 560, 790], ["m2_beachedBoat", 1180, 700], ["m2_tidalRock", 180, 360], ["m2_tidalRock", 1330, 330, { scale: 0.8 }], ["m2_shellMound", 300, 780], ["m2_shellMound", 1000, 760]);
  // piers: south pier (the ship dock) and the east jetty to the cave mouth
  props.push(["m2_dockPosts", 700, 880], ["m2_dockPosts", 800, 880], ["pierLamp", 690, 820], ["pierLamp", 810, 820], ["bollards", 700, 940], ["bollards", 800, 940], ["crates", 820, 860], ["m2_dockPosts", 1330, 520], ["m2_dockPosts", 1330, 620], ["pierLamp", 1280, 520], ["bollards", 1440, 640]);
  World.def("gullrest", {
    name: "Gullrest", w: 1500, h: 1000, base: "water", music: "fishingTown", rim: 44,
    look: "A fishermen's town on a small island seen from above: a lumpy island of pale beach sand and grey wet planks, wooden walkways between stilt huts built of wreck-wood, drying nets and fish racks, a hull-plank lighthouse, bleached whale ribs, two wooden piers reaching into grey-green shallow water, white gulls. Windy, salty, grey light.",
    legend: { sand: "pale wet beach sand with shells, kelp, rope scraps and footprints", road: "worn grey wood plank walkways and packed sand paths", paved: "weathered wooden pier planks, grey and salt-bleached, with nail rows", grass: "wind-flattened dune grass and sea thrift", shallow: "pale green shallow water over sand with ripples", water: "grey-green deep water with soft waves and foam on the shore", rock: "dark wave-worn shore rocks" },
    bank: { sand: "sand", road: "dirt", paved: "dirt", grass: "green", shallow: "teal", water: "water" }, grade: { sand: { mul: [0.95, 0.95, 0.92], add: [8, 6, 2] }, road: { mul: [0.75, 0.72, 0.7], add: [0, 0, 0] }, paved: { mul: [0.7, 0.68, 0.66], add: [-2, -2, -2] }, grass: { mul: [0.85, 1.05, 0.8], add: [0, 4, 0] }, shallow: { mul: [0.95, 1.15, 1.1], add: [12, 22, 16] }, water: { mul: [0.9, 1.35, 1.25], add: [0, 8, 6] } },
    marks: [{ k: "dot", on: ["sand"], n: 120, col: [190, 180, 160], a: 0.6, r: [1, 2.2] }],
    guide: [
      ["shallow", E(750, 480, 700, 400)], ["sand", E(750, 480, 640, 340)], ["grass", E(300, 360, 120, 70)], ["grass", E(1250, 580, 110, 60)], ["road", L([[300, 560], [560, 520], [900, 480], [1200, 560]], 70)], ["road", L([[560, 520], [740, 700], [750, 900]], 70)],
      ["paved", R(690, 820, 120, 180)], ["paved", R(1260, 500, 200, 120)], ["shallow", R(660, 800, 190, 40)],
    ],
    entries: { start: { x: 750, y: 900, face: "up" }, from_sea: { x: 750, y: 900, face: "up" }, from_maelstromCaves: { x: 1380, y: 560, face: "left" }, inn: { x: 560, y: 480, face: "down" } },
    exits: [{ rect: [700, 940, 100, 60], to: "weepingSea", entry: "from_gullrest", push: [0, -1], floor: "paved" }, { rect: [1420, 500, 80, 120], to: "maelstromCaves", entry: "from_gullrest", push: [-1, 0], floor: "paved" }],
    npcs: [
      { id: "innkeeper", art: "npcVillagerF", name: "Innkeeper", x: 610, y: 470 }, { id: "merchant", art: "npcTrader", name: "Merchant", x: 780, y: 590 }, { id: "gullCaptain", art: "npcFisher", name: "Old fisher", x: 1050, y: 560 },
      { id: "r1", art: "npcGranny", name: "Net-mender", x: 460, y: 540 }, { id: "r2", art: "npcChild", name: "Child", x: 700, y: 760 }, { id: "r3", art: "npcVillagerM", name: "Fisher", x: 930, y: 620 }, { id: "fisher", art: "npcFisher", name: "Fisher", x: 1330, y: 580 },
      { id: null, art: "npcFisher", x: 600, y: 600, path: [[420, 600], [900, 560]], speed: 24 }, { id: null, art: "npcVillagerF", x: 900, y: 720, path: [[700, 740], [1100, 700]], speed: 20 }, { id: null, art: "npcSailor", x: 760, y: 860, still: true },
    ],
    props,
    scatter: [{ keys: [["m2_shellMound", 2], ["m2_driftwood", 1], ["m2_tidalRock", 1], ["crates", 1]], n: 22, on: ["sand"], seed: 141, scaleRange: [0.7, 1] }],
    encounter: { table: null, rate: 0 },
    amb: { birds: 12, butterflies: [], water: true, dust: 0xe0e0d8, motes: 20, tint: [0x28343a, 0.1] },
  });
})();
