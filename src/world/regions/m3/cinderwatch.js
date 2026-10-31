// M3 / ch6: Cinderwatch, the pilgrim village at the volcano's foot (town, no fights). Entries start from_cinderCrownIsle inn. Exit cinderCrownIsle@from_cinderwatch (E gate).
// NPC ids: innkeeper merchant pilgrim (quest "pilgrim": five water jars up the slope) bather r1 r2 r3.
(function () {
  const { R, E, P, L } = World.shapes, M = World.m3, props = [];
  // terraced baths on the slope in the north-west: hot pools, pink mineral rock, bamboo screens, steam
  props.push(["m2_bathHut", 300, 250, { tint: 0xe8d8c8 }], ["m2_bathHut", 520, 200], ["m2_pinkRock", 220, 340], ["m2_pinkRock", 640, 330], ["m2_mineralCrust", 420, 420], ["m2_steamBoulder", 330, 430], ["m2_steamBoulder", 560, 420], ["m2_hotFern", 180, 230], ["m2_hotFern", 610, 150], ["m2_bambooGrove", 140, 400], ["m2_bambooGrove", 700, 250], ["m2_boardwalkRail", 380, 340], ["m2_boardwalkRail", 520, 340], ["m2_geyserCone", 430, 190], ["stoneBench", 470, 500]);
  // the village: warm stone houses, the inn, shrine stall, charms on strings across the street
  props.push(["reedInn", 900, 330, { tint: 0xf0d8c0 }], ["amberHouse", 760, 300, { tint: 0xd8c0b0 }], ["m2_adobeHouseA", 1120, 270, { tint: 0xd8c0b0 }], ["amberDomeHouse", 1280, 350, { tint: 0xd8c8c0 }], ["m2_adobeHouseB", 760, 640, { tint: 0xd0b8a8 }], ["amberHouse", 1100, 700, { tint: 0xd8c0b0 }], ["amberDomeHouse", 330, 740, { tint: 0xd8c8c0 }], ["whiteHouse", 540, 780, { tint: 0xe8d8c8 }], ["m2_adobeHouseA", 1300, 660, { tint: 0xd0b8a8 }]);
  props.push(["m2_featherCharms", 820, 520], ["m2_featherCharms", 960, 520], ["m2_featherCharms", 1100, 520], ["m2_featherCharms", 1000, 450], ["m2_wovenLantern", 700, 470], ["m2_wovenLantern", 1180, 480], ["lampPost", 650, 560], ["lampPost", 1250, 560], ["amberStall", 880, 600], ["amberStall", 1010, 620], ["m2_waterJars", 860, 700], ["m2_waterJars", 1180, 800], ["terracottaJars", 940, 700], ["m2_waterBarrel", 600, 640], ["m2_clayLampShrine", 430, 640, { tint: 0xf0e0d0 }], ["candleStand", 490, 630]);
  props.push(["m2_hotFern", 100, 720], ["m2_hotFern", 200, 900], ["obsidianSpike", 1400, 120], ["spineCrag", 1360, 170, { scale: 0.7 }], ["slagPile", 1400, 880], ["burntTree", 150, 600], ["burntTree", 1420, 460], ["steamVent", 1000, 880, { fire: [0, -16, 0.5] }], ["m2_milestone", 1340, 540]);
  World.def("cinderwatch", {
    name: "Cinderwatch", w: 1500, h: 1000, base: "ash", music: "pilgrimTown", rim: 44,
    look: "A pilgrim village on a volcano's slope seen from above: warm grey-pink stone terraces, hot spring pools with white steam in the north-west stepping down in terraces with wooden boardwalks, a cobbled street with strings of charms and lanterns across it, small warm-stone houses, black ash ground with pale mineral crust around the pools. Slow, warm, cosy dusk with glowing embers on the hill.",
    legend: { paved: "warm grey-pink cobbled street and terrace stones, swept clean, ash dusted in the cracks", ash: "black volcanic sand and ash around the village", salt: "pale yellow-white mineral crust around hot pools", shallow: "milky turquoise hot spring water, steaming, over pale stone", water: "deep milky blue hot spring pool", road: "a worn dark earth path with cinders", red: "red-brown warm rock terraces", rock: "black basalt cliffs" },
    bank: { paved: "grey", ash: "ash", salt: "bone", shallow: "teal", water: "water", road: "dirt", red: "red" }, grade: { paved: { mul: [1.0, 0.85, 0.82], add: [8, 0, 0] }, ash: { mul: [0.7, 0.66, 0.7], add: [-4, -4, -2] }, salt: { mul: [1.1, 1.05, 0.8], add: [12, 10, -2] }, shallow: { mul: [1.0, 1.2, 1.2], add: [16, 26, 24] }, water: { mul: [0.9, 1.3, 1.3], add: [10, 22, 22] }, road: { mul: [0.65, 0.58, 0.55], add: [0, 0, 0] }, _: [1.02, 0.98, 0.98] },
    marks: [{ k: "dot", on: ["ash"], n: 80, col: [255, 140, 60], a: 0.6, r: [1, 1.8], hi: false }, { k: "dot", on: ["paved"], n: 70, col: [70, 56, 50], a: 0.5, r: [1, 2.2] }],
    guide: [
      ["red", E(400, 300, 380, 280)], ["salt", E(400, 330, 280, 190)], ["shallow", E(330, 280, 120, 70)], ["water", E(330, 280, 60, 36)], ["shallow", E(540, 330, 100, 60)], ["water", E(540, 330, 46, 28)], ["shallow", E(440, 440, 90, 50)], ["paved", L([[400, 480], [640, 520], [900, 540], [1400, 520]], 130)],
      ["paved", E(980, 540, 380, 230)], ["paved", L([[980, 540], [960, 250]], 110)], ["paved", L([[540, 520], [540, 760]], 100)], ["paved", L([[1100, 560], [1100, 800]], 100)], ["road", L([[1300, 520], [1460, 500]], 110)], ["paved", E(460, 640, 130, 90)],
    ],
    entries: { start: { x: 1380, y: 520, face: "left" }, from_cinderCrownIsle: { x: 1380, y: 520, face: "left" }, inn: { x: 900, y: 420, face: "down" } },
    exits: [{ rect: [1420, 460, 80, 120], to: "cinderCrownIsle", entry: "from_cinderwatch", push: [-1, 0] }],
    npcs: [
      { id: "innkeeper", art: "npcVillagerF", name: "Innkeeper", x: 960, y: 420 }, { id: "merchant", art: "npcTrader", name: "Merchant", x: 940, y: 640 }, { id: "pilgrim", art: "npcPilgrim", name: "Pilgrim", x: 560, y: 700 }, { id: "bather", art: "npcVillagerM", name: "Bather", x: 440, y: 520 },
      { id: "r1", art: "npcGranny", name: "Old woman", x: 800, y: 560 }, { id: "r2", art: "npcChild", name: "Child", x: 1140, y: 610 }, { id: "r3", art: "npcAcolyte", name: "Acolyte", x: 470, y: 690 },
      { id: null, art: "npcPilgrim", x: 700, y: 520, path: [[600, 520], [1300, 520]], speed: 20 }, { id: null, art: "npcVillagerF", x: 980, y: 700, path: [[860, 700], [1160, 700]], speed: 18 },
    ],
    props,
    scatter: [{ keys: [["rubblePile", 1], ["slagPile", 1], ["m2_hotFern", 2]], n: 14, on: ["ash"], seed: 171, scaleRange: [0.7, 1] }],
    lights: [[820, 520, 120, 0.5], [960, 520, 120, 0.5], [1100, 520, 120, 0.5], [700, 470, 100, 0.5], [1180, 480, 100, 0.5]],
    encounter: { table: null, rate: 0 },
    amb: { birds: 0, butterflies: [], dust: 0xb8a090, motes: 50, tint: [0x3a1a14, 0.1], warm: [0xff8a40, 0.08], weather: ["ash"], water: true, smoke: [[330, 280, 0xdddddd], [540, 330, 0xdddddd], [440, 440, 0xdddddd], [1400, 120, 0x555050]] },
  });
})();
