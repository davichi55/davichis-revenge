// M3 / ch6: Cinder Crown (volcanic island field). Table "cinder" 26 s, weather ash. Entries start from_sea from_cinderwatch from_cinderCrownCrater.
// Exits weepingSea@from_cinderCrownIsle (the south pier), cinderwatch@from_cinderCrownIsle (W road), cinderCrownCrater@from_cinderCrownIsle (N, the crater path). Interact hotSpring (hidden hot spring, gives springCharm, flag g.spring). Legend L3 at the crater edge (when sky.moonless).
(function () {
  const { R, E, P, L } = World.shapes, M = World.m3, props = [];
  // the crown of the volcano in the north: crags, glowing vents, obsidian
  props.push(["spineCrag", 900, 200, { scale: 1.3 }], ["spineCrag", 1500, 190, { scale: 1.3 }], ["redMass", 700, 330], ["redMass", 1700, 340], ["obsidianSpike", 1000, 150], ["obsidianSpike", 1400, 160], ["obsidianSpike", 1120, 120], ["steamVent", 1000, 330, { fire: [0, -16, 0.6] }], ["steamVent", 1420, 320], ["m2_geyserCone", 1240, 330], ["ashBrazier", 1100, 400, { fire: [0, -50, 1], glow: "gold" }], ["ashBrazier", 1300, 400, { fire: [0, -50, 1], glow: "gold" }], ["slagPile", 800, 380], ["slagPile", 1600, 400]);
  // ash forest: burnt trees, spires, steam vents, ash heaps; lava rivers in the east
  props.push(...M.rand(["burntTree", "deadTree", "m2_deadSnag", "burntTree"], 450, 600, 1200, 600, 26, {}, 5), ...M.rand(["burntTree", "m2_deadSnag"], 1500, 700, 380, 500, 8, {}, 6), ["steamVent", 700, 800], ["steamVent", 1500, 900, { fire: [0, -16, 0.6] }], ["m2_geyserCone", 900, 1000], ["glassCluster", 560, 1000], ["glassCluster", 1380, 1150], ["obsidianSpike", 640, 700], ["obsidianSpike", 1480, 650], ["spineCrag", 380, 560], ["spineCrag", 2060, 760], ["obsidianSpike", 2080, 420], ["slagPile", 1760, 1100]);
  // the south beach and pier, a wrecked ship, black sand and driftwood
  props.push(["m2_shipWreck", 700, 1530, { scale: 0.8 }], ["m2_driftwood", 500, 1500], ["m2_driftwood", 1700, 1520], ["m2_tidalRock", 400, 1560], ["m2_tidalRock", 1900, 1500], ["m2_dockPosts", 1060, 1560], ["m2_dockPosts", 1160, 1560], ["pierLamp", 1050, 1500], ["pierLamp", 1170, 1500], ["bollards", 1110, 1640], ["rowboatMoored", 1280, 1640, { solid: false }], ["crates", 1190, 1580]);
  // the hidden hot spring in the north-west (pale stones, steam) and the Cinderwatch road marker
  props.push(["m2_pinkRock", 430, 340], ["m2_mineralCrust", 600, 440], ["m2_steamBoulder", 480, 480], ["m2_hotFern", 400, 430], ["m2_hotFern", 620, 360], ["m2_bathHut", 700, 470, { tint: 0xe8d8c8 }], ["m2_milestone", 200, 930], ["cairn", 260, 740], ["campfire", 160, 960, { fire: [0, -22, 0.7] }]);
  World.def("cinderCrownIsle", {
    name: "Cinder Crown", w: 2400, h: 1700, base: "ash", music: "volcano", rim: 44,
    look: "A volcanic island seen from above: black sand and dark grey ash ground with glowing orange cracks, a forest of burnt black trees, steaming vents, rivers of molten orange lava in the east, red-brown rock slopes rising to a glowing crater crown in the north, a pale grey pebble beach with grey-green shallows in the south, a small hidden hot spring with pale mineral stone in the north-west. Smoky, ominous, ember-lit dusk.",
    legend: { ash: "black volcanic sand and dark grey ash with faint glowing orange cracks and cinders", sand: "pale grey pumice gravel and wind-blown ash drifts", road: "a packed dark earth path, worn, with cinders", red: "red-brown cooled lava rock and scoria slopes", water: "glowing orange molten lava with a bright yellow crust edge", shallow: "grey-green shallow sea water with black sand under it, ripples", rock: "black obsidian cliffs, impassable", paved: "grey stone planks of the pier", salt: "pale yellow sulphur crust and mineral deposits around the hot spring" },
    bank: { ash: "ash", sand: "sand", road: "dirt", red: "red", water: "lava", shallow: "teal", rock: "dark", paved: "dirt", salt: "bone" }, grade: { ash: { mul: [0.75, 0.7, 0.75], add: [-4, -4, -2] }, sand: { mul: [0.6, 0.58, 0.58], add: [0, 0, 0] }, road: { mul: [0.6, 0.55, 0.5], add: [0, 0, 0] }, red: { mul: [0.9, 0.7, 0.65], add: [0, 0, 0] }, water: { mul: [1.1, 0.7, 0.5], add: [0, -12, -24] }, shallow: { mul: [0.6, 0.9, 0.85], add: [0, 10, 10] }, paved: { mul: [0.6, 0.55, 0.5], add: [0, 0, 0] }, salt: { mul: [1.2, 1.1, 0.7], add: [14, 10, -4] }, _: [1.0, 0.97, 0.97] },
    marks: [{ k: "crack", on: ["ash"], n: 50, col: [255, 120, 40], a: 0.8, len: [14, 50] }, { k: "dot", on: ["ash", "sand"], n: 80, col: [255, 150, 60], a: 0.7, r: [1, 1.8], hi: false }, { k: "blot", on: ["ash"], n: 12, col: [10, 8, 10], a: 0.25, r: [14, 40] }],
    guide: [
      ["red", E(1200, 330, 700, 260)], ["ash", E(1200, 1000, 1000, 560)], ["sand", E(1200, 1480, 760, 150)], ["shallow", R(300, 1560, 1700, 140)], ["paved", R(1060, 1540, 140, 160)], ["road", L([[1130, 1560], [1180, 1200], [1200, 700], [1200, 380], [1200, 60]], 120)], ["road", L([[1190, 800], [700, 780], [400, 820], [44, 850]], 100)],
      ["water", L([[1900, 230], [2000, 520], [1850, 780], [2050, 1060], [1950, 1380]], 110)], ["water", L([[1650, 350], [1700, 560]], 60)], ["salt", E(520, 400, 120, 70)], ["shallow", E(520, 400, 70, 40)], ["road", L([[700, 780], [640, 560], [560, 430]], 60)], ["red", E(380, 560, 140, 90)],
    ],
    entries: { start: { x: 1130, y: 1500, face: "up" }, from_sea: { x: 1130, y: 1500, face: "up" }, from_cinderwatch: { x: 140, y: 850, face: "right" }, from_cinderCrownCrater: { x: 1200, y: 150, face: "down" } },
    exits: [
      { rect: [1060, 1640, 140, 60], to: "weepingSea", entry: "from_cinderCrownIsle", push: [0, -1], floor: "paved" }, { rect: [0, 790, 80, 120], to: "cinderwatch", entry: "from_cinderCrownIsle", push: [1, 0] }, { rect: [1130, 0, 140, 60], to: "cinderCrownCrater", entry: "from_cinderCrownIsle", push: [0, 1] },
    ],
    npcs: [{ id: "hotSpring", art: null, name: "A hot spring", x: 540, y: 440, hint: "E / Space: a hidden hot spring", hide: "g.spring" }],
    legends: [{ id: "L3", enemy: "motherGlowmoth", level: 21, chance: 0.05, spots: [[1000, 300], [1420, 300], [1200, 480]], when: "sky.moonless" }],
    props,
    scatter: [{ keys: [["rubblePile", 1], ["slagPile", 2], ["m2_cliffBoulder", 1], ["bones", 1]], n: 40, on: ["ash", "sand", "red"], seed: 161, scaleRange: [0.7, 1] }],
    lights: [[1100, 400, 150, 0.7], [1300, 400, 150, 0.7], [1900, 500, 160, 0.6], [2000, 1000, 160, 0.6], [1950, 1350, 150, 0.6], [1000, 330, 90, 0.5]],
    encounter: { table: "cinder", rate: 26 },
    amb: { birds: 0, butterflies: [], dust: 0x908078, motes: 70, tint: [0x4a1a10, 0.14], warm: [0xff7a30, 0.08], weather: ["ash"], water: false, smoke: [[1000, 330, 0x555050], [1420, 320, 0x555050], [700, 800, 0x666060], [1500, 900, 0x666060], [1240, 330, 0x555050]] },
  });
})();
