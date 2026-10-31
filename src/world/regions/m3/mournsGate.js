// M3 / ch6: Mourn's Gate, the mourning-bell town (no fights). Entries start from_sea from_hollowsOfMourn inn. Exits weepingSea@from_mournsGate (the pier, S), hollowsOfMourn@from_mournsGate (the cave gate, N).
// NPC ids: innkeeper merchant bellringer r1 r2 r3 mourner.
(function () {
  const { R, E, P, L } = World.shapes, M = World.m3, props = [], shroud = 0xf0eef0;
  // bell towers, the Candle House inn, grey-white houses, shrouds drying on lines, candle niches along the walls
  props.push(["bellTower", 420, 300], ["bellTower", 1080, 280], ["whiteHouse", 260, 380, { tint: 0xc8ccd4 }], ["whiteHouse", 640, 330, { tint: 0xc8ccd4 }], ["lampQuillInn", 830, 360, { tint: 0xd8d4d8 }], ["shopHouse", 1260, 380, { tint: 0xc8ccd4 }], ["whiteHouse", 300, 660, { tint: 0xc8ccd4 }], ["whiteHouse", 1230, 640, { tint: 0xc8ccd4 }], ["shopHouse", 540, 740, { tint: 0xc8ccd4 }], ["whiteHouse", 1000, 740, { tint: 0xc8ccd4 }], ["m2_bellPost", 740, 560], ["m2_bellPost", 940, 560], ["m2_bellPost", 840, 470]);
  props.push(["m2_clothesLine", 380, 560, { tint: shroud }], ["m2_clothesLine", 560, 600, { tint: shroud }], ["m2_clothesLine", 1120, 560, { tint: shroud, flip: true }], ["m2_clothesLine", 1300, 520, { tint: shroud }], ["m2_clothesLine", 700, 880, { tint: shroud }], ["m2_clothesLine", 1060, 890, { tint: shroud }], ["cryptNiche", 200, 520], ["cryptNiche", 260, 270], ["cryptNiche", 1400, 300], ["cryptNiche", 1380, 560], ["cryptCandleStand", 650, 470], ["cryptCandleStand", 1030, 470], ["cryptCandleStand", 700, 640], ["cryptCandleStand", 980, 640], ["cryptCandleStand", 560, 560], ["cryptCandleStand", 1120, 480]);
  props.push(["cryptShroudedBones", 440, 560], ["cryptSarcophagus", 190, 760, { tint: 0xc8ccd4 }], ["cryptOssuary", 1380, 760], ["cryptTablets", 330, 540], ["cryptTablets", 1290, 700], ["cryptPillar", 780, 220], ["cryptPillar", 900, 220], ["scholarBanner", 650, 240, { tint: 0xe0e0e8 }], ["scholarBanner", 1030, 240, { tint: 0xe0e0e8 }], ["oliveTree", 120, 440], ["deadTree", 1440, 460], ["deadTree", 100, 880]);
  // the cave gate in the north cliff: bone arch, lanterns; the pier and boats in the south
  props.push(["hornGate", 840, 130, { solid: false }], ["ribArch", 740, 150], ["ribArch", 940, 150], ["boneBrazier", 790, 200, { fire: [0, -44, 0.8], glow: "blue" }], ["boneBrazier", 890, 200, { fire: [0, -44, 0.8], glow: "blue" }], ["m2_dockPosts", 770, 900], ["m2_dockPosts", 910, 900], ["pierLamp", 760, 850], ["pierLamp", 920, 850], ["rowboatMoored", 1100, 950, { solid: false }], ["bollards", 770, 960], ["m2_tidalRock", 300, 920], ["m2_tidalRock", 1300, 930]);
  World.def("mournsGate", {
    name: "Mourn's Gate", w: 1500, h: 1000, base: "paved", music: "mourningTown", rim: 44,
    look: "A hushed mourning town on a grey coast seen from above: pale grey flagstone streets between pale grey-white houses, bell towers, white shrouds hung on lines across the lanes, candle niches in the walls, a central plaza with three tolling bells, a bone-arched cave gate in the north cliff, a wooden pier in the south on cold grey water. Quiet, cold, overcast, a little blue.",
    legend: { paved: "pale grey flagstones, smooth and clean, with a few fallen white petals and candle wax drips", road: "a path of pale gravel and ash leading to the cave gate", rock: "grey cliff and rock outcrops, impassable", shallow: "cold grey-blue shallow water over pale sand", water: "deep cold grey-blue sea", grass: "sparse pale grey-green grass and moss between the stones", bone: "pale bone-dust path inside the gate arch" },
    bank: { paved: "grey", road: "sand", rock: "dark", shallow: "teal", water: "water", grass: "green", bone: "bone" }, grade: { paved: { mul: [0.95, 1.0, 1.1], add: [4, 6, 14] }, road: { mul: [0.8, 0.82, 0.9], add: [0, 2, 8] }, rock: { mul: [0.9, 0.95, 1.15], add: [0, 2, 10] }, shallow: { mul: [0.8, 1.05, 1.15], add: [8, 20, 26] }, water: { mul: [0.85, 1.2, 1.35], add: [0, 8, 14] }, grass: { mul: [0.65, 0.85, 0.7], add: [4, 10, 8] }, bone: { mul: [1.0, 1.0, 1.05], add: [10, 10, 14] }, _: [0.97, 1.0, 1.06] },
    marks: [{ k: "dot", on: ["paved"], n: 70, col: [250, 250, 255], a: 0.5, r: [1, 1.6], hi: false }, { k: "blot", on: ["paved"], n: 10, col: [60, 66, 84], a: 0.14, r: [12, 34] }],
    guide: [
      ["paved", R(100, 160, 1300, 640)], ["road", L([[840, 160], [840, 560]], 110)], ["bone", E(840, 180, 120, 60)], ["rock", R(44, 44, 560, 150)], ["rock", R(1100, 44, 356, 150)], ["rock", R(44, 44, 130, 400)], ["grass", E(200, 700, 100, 50)], ["grass", E(1330, 400, 90, 60)],
      ["paved", R(760, 780, 160, 220)], ["shallow", R(44, 840, 1412, 160)], ["water", R(44, 930, 1412, 70)], ["paved", R(760, 780, 160, 220)], ["road", R(780, 780, 120, 40)],
    ],
    entries: { start: { x: 840, y: 880, face: "up" }, from_sea: { x: 840, y: 880, face: "up" }, from_hollowsOfMourn: { x: 840, y: 270, face: "down" }, inn: { x: 830, y: 440, face: "down" } },
    exits: [{ rect: [780, 940, 120, 60], to: "weepingSea", entry: "from_mournsGate", push: [0, -1], floor: "paved" }, { rect: [780, 0, 120, 70], to: "hollowsOfMourn", entry: "from_mournsGate", push: [0, 1], floor: "bone" }],
    npcs: [
      { id: "innkeeper", art: "npcVillagerF", name: "Innkeeper", x: 890, y: 440 }, { id: "merchant", art: "npcTrader", name: "Merchant", x: 640, y: 620 }, { id: "bellringer", art: "npcPilgrim", name: "Bell-ringer", x: 840, y: 520 }, { id: "mourner", art: "npcHooded", name: "Mourner", x: 480, y: 600 },
      { id: "r1", art: "npcGranny", name: "Old woman", x: 560, y: 450 }, { id: "r2", art: "npcVillagerM", name: "Gravedigger", x: 1160, y: 600 }, { id: "r3", art: "npcChild", name: "Child", x: 1010, y: 700 },
      { id: null, art: "npcAcolyte", x: 700, y: 520, path: [[500, 500], [1180, 500]], speed: 16 }, { id: null, art: "npcHooded", x: 900, y: 800, path: [[700, 800], [1100, 800]], speed: 14 }, { id: null, art: "npcVillagerF", x: 340, y: 520, still: true },
    ],
    props,
    scatter: [{ keys: [["candleStand", 2], ["cryptTablets", 1], ["m2_waterJars", 1]], n: 10, on: ["paved"], seed: 191, scaleRange: [0.8, 1] }],
    lights: [[650, 470, 90, 0.5], [1030, 470, 90, 0.5], [700, 640, 90, 0.5], [980, 640, 90, 0.5], [790, 200, 100, 0.6], [890, 200, 100, 0.6]],
    encounter: { table: null, rate: 0 },
    amb: { birds: 2, butterflies: [], dust: 0xc8d0e0, motes: 24, tint: [0x20283c, 0.14], weather: ["mist"], water: true },
  });
})();
