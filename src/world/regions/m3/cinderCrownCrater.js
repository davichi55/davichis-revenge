// M3 / ch6: the Crater (dungeon, optional boss). Table "crater" 22 s. Entries start from_cinderCrownIsle. Exit cinderCrownIsle@from_cinderCrownCrater.
// Trigger wolfFight (the wolf-shaped hollow in the north; Ember Wolf lv 34). Chest craterChest.
(function () {
  const { R, E, P, L } = World.shapes, M = World.m3, props = [];
  // the caldera ledge: obsidian spikes, crags, vents, cooled slag
  props.push(...M.ring(["obsidianSpike", "spineCrag", "obsidianSpike", "slagPile"], 1100, 800, 820, 520, 22, {}, 0, undefined, 18, 3), ["steamVent", 600, 1200, { fire: [0, -16, 0.6] }], ["steamVent", 1620, 1200], ["steamVent", 400, 760], ["steamVent", 1820, 540, { fire: [0, -16, 0.6] }], ["glassCluster", 760, 1280], ["glassCluster", 1480, 1260], ["slagPile", 900, 1340], ["slagPile", 1330, 1360], ["obsidianSpike", 700, 1100], ["obsidianSpike", 1550, 1100]);
  props.push(["m2_obsidianBrazier", 1040, 1240, { fire: [0, -46, 0.9], glow: "gold" }], ["m2_obsidianBrazier", 1160, 1240, { fire: [0, -46, 0.9], glow: "gold" }], ["m2_obsidianStele", 940, 1300], ["m2_obsidianStele", 1260, 1300], ["m2_obsidianBrazier", 1840, 760, { fire: [0, -46, 0.9], glow: "gold" }], ["m2_obsidianBrazier", 360, 760, { fire: [0, -46, 0.9], glow: "gold" }]);
  // the wolf's hollow: a huge wolf-shaped bowl in the ash, bones and scorched ground around it
  props.push(["spineCrag", 760, 240], ["spineCrag", 1440, 240], ["obsidianSpike", 860, 130], ["obsidianSpike", 1340, 130], ["m2_caveBones", 980, 320], ["hornSkull", 1220, 330], ["skullPile", 1100, 360], ["m2_obsidianBrazier", 920, 200, { fire: [0, -46, 0.9], glow: "gold" }], ["m2_obsidianBrazier", 1280, 200, { fire: [0, -46, 0.9], glow: "gold" }], ["spineScorch", 1100, 230, { solid: false }]);
  World.def("cinderCrownCrater", {
    name: "The Crater", w: 2200, h: 1500, base: "rock", music: "volcano", rim: 44,
    look: "The inside of a volcano seen from above: a wide caldera ledge of black volcanic ash and cooled rock around a lake of glowing molten orange lava with a crust of black plates, two narrow black obsidian bridges crossing it in a cross shape, and in the north a huge shallow hollow in the ash shaped like a crouching wolf, scorched with embers. Heat shimmer, orange glow, ominous.",
    legend: { ash: "black volcanic ash ledge with glowing orange cracks and cinders", water: "glowing molten orange lava with yellow-white hot edges and dark crust plates drifting", floor: "polished black obsidian bridge stone with orange reflections", red: "scorched red-brown cooled lava rock", rock: "black basalt crater walls, impassable" },
    bank: { ash: "ash", water: "lava", floor: "dark", red: "red", rock: "dark" }, grade: { ash: { mul: [0.9, 0.8, 0.8], add: [0, 0, 0] }, floor: { mul: [1.1, 1.0, 1.0], add: [10, 4, 2] }, red: { mul: [0.85, 0.65, 0.6], add: [0, 0, 0] }, _: [1.04, 0.96, 0.94] },
    marks: [{ k: "crack", on: ["ash"], n: 70, col: [255, 120, 40], a: 0.85, len: [18, 60] }, { k: "dot", on: ["ash", "red"], n: 100, col: [255, 160, 70], a: 0.8, r: [1, 2], hi: false }],
    guide: [
      ["ash", E(1100, 800, 960, 640)], ["water", E(1100, 780, 580, 380)], ["floor", L([[1100, 1180], [1100, 420]], 100)], ["floor", L([[480, 780], [1720, 780]], 100)], ["ash", E(1100, 780, 90, 70)], ["ash", E(1100, 1380, 200, 100)],
      ["red", E(1100, 270, 480, 230)], ["ash", E(1100, 260, 380, 170)], ["red", E(1100, 250, 120, 60)], ["ash", L([[1100, 440], [1100, 380]], 140)],
    ],
    entries: { start: { x: 1100, y: 1420, face: "up" }, from_cinderCrownIsle: { x: 1100, y: 1420, face: "up" } },
    exits: [{ rect: [1040, 1440, 120, 60], to: "cinderCrownIsle", entry: "from_cinderCrownCrater", push: [0, -1], floor: "ash" }],
    triggers: [{ id: "wolfFight", rect: [1000, 180, 200, 110] }],
    chests: [{ id: "craterChest", x: 1880, y: 800 }],
    props,
    scatter: [{ keys: [["slagPile", 2], ["rubblePile", 1], ["bones", 1]], n: 24, on: ["ash", "red"], seed: 181, scaleRange: [0.7, 1] }],
    lights: [[1100, 780, 420, 0.8], [1040, 1240, 100, 0.6], [1160, 1240, 100, 0.6], [1840, 760, 100, 0.6], [360, 760, 100, 0.6], [920, 200, 100, 0.6], [1280, 200, 100, 0.6]],
    dark: { ambient: 0.4, radius: 260, color: 0x120400 },
    encounter: { table: "crater", rate: 22 },
    amb: { birds: 0, butterflies: [], dust: 0xc09070, motes: 90, tint: [0x5a1a08, 0.18], warm: [0xff6a20, 0.1], weather: ["embers"], smoke: [[600, 1200, 0x555050], [1620, 1200, 0x555050], [400, 760, 0x555050], [1820, 540, 0x555050]] },
  });
})();
