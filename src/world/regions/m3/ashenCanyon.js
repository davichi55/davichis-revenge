// M3 / ch5: Ashen Canyon (escape field). Table "canyon" 30 s. Entries start from_undervaults from_haldarsReach. Exits undervaults@from_ashenCanyon (S, hide ch5.escape), haldarsReach@from_ashenCanyon (N end, need ch5.escape).
// Triggers canyonRun (arrival, the scripted escape), canyonFire (the smugglers' signal fire at the north end). Chest canyonCache. Hunting `chase` pursuers while ch5.escape is off.
(function () {
  const { R, E, P, L } = World.shapes, M = World.m3, props = [];
  const route = [[380, 1400], [760, 1330], [1100, 1240], [1250, 1020], [1000, 800], [760, 600], [1000, 400], [1400, 300], [1800, 210], [2000, 110]];
  // canyon walls: spires and boulders along both sides, scree, thorn scrub
  props.push(...M.row(["m2_cliffBoulder", "m2_cliffBoulder", "m2_deadSnag", "m2_cliffBoulder"], 140, 1180, 500, 1480, 7, {}, 24, 3), ...M.row(["m2_cliffBoulder", "m2_deadSnag"], 900, 1480, 1500, 1400, 7, {}, 20, 4), ...M.row(["m2_cliffBoulder", "m2_stalagmite"], 1550, 1000, 1700, 1340, 6, {}, 20, 5),
    ...M.row(["m2_cliffBoulder", "deadTree"], 500, 760, 520, 340, 6, {}, 22, 6), ...M.row(["m2_cliffBoulder", "m2_stalagmite"], 1200, 640, 1300, 180, 7, {}, 22, 7), ...M.row(["m2_cliffBoulder", "burntTree"], 1900, 440, 2200, 360, 6, {}, 20, 8));
  props.push(["cairn", 560, 1250], ["cairn", 1180, 1120], ["cairn", 880, 700], ["cairn", 1560, 340], ["m2_milestone", 1000, 1300, { scale: 0.9 }], ["m2_signalFirePit", 1980, 190, { fire: [0, -34, 1.1] }], ["campfire", 2060, 200, { fire: [0, -26, 0.8] }], ["m2_campCrates", 1900, 230], ["cairn", 1940, 130]);
  props.push(["campCrates", 690, 1010], ["spikeBarricade", 560, 1420, { show: "!ch5.escape" }], ["weaponRack", 640, 1450, { show: "!ch5.escape" }], ["dominionBanner", 470, 1450, { show: "!ch5.escape" }]);
  World.def("ashenCanyon", {
    name: "Ashen Canyon", w: 2400, h: 1500, base: "rock", music: "tension", rim: 44,
    look: "A dry winding canyon of red-grey stone seen from above: a worn smugglers' track of packed ash and red dirt snaking from the south-west up to the north-east between tall black-red rock walls, scree slopes, cairns of stacked stones, ash drifting on the wind. Tense, bleak, low smoky light.",
    legend: { road: "a worn packed-ash smugglers' track with footprints and hoofprints", red: "red-brown stony canyon floor with cracks and scree", ash: "grey ash drifts and charcoal dust on dark rock floor", rock: "tall impassable canyon walls, black-red layered stone", sand: "pale gravel and dry ash pockets" },
    bank: { rock: "red", road: "dirt", red: "red", ash: "ash", sand: "sand" }, grade: { rock: { mul: [1.25,0.85,0.8], add: [0, 0, 0] }, road: { mul: [0.82, 0.74, 0.7], add: [-8, -8, -6] }, red: { mul: [0.88, 0.78, 0.76], add: [-6, -4, -4] }, ash: { mul: [1.1, 1.0, 1.0], add: [4, 4, 4] }, _: [0.95, 0.92, 0.95] },
    marks: [{ k: "blot", on: ["road", "red"], n: 20, col: [60, 50, 50], a: 0.2, r: [10, 36] }],
    guide: [
      ["red", L(route, 300)], ["road", L(route, 130)], ["red", E(380, 1380, 200, 110)], ["ash", E(1000, 800, 170, 110)], ["red", E(1250, 1040, 190, 130)], ["ash", E(1620, 250, 160, 90)], ["sand", E(2000, 170, 150, 100)],
      ["red", E(640, 1010, 100, 70)], ["road", L([[640, 1010], [840, 940], [1000, 840]], 90)], ["sand", E(600, 520, 110, 70)], ["road", L([[600, 520], [760, 600]], 80)],
    ],
    entries: { start: { x: 400, y: 1390, face: "up" }, from_undervaults: { x: 400, y: 1390, face: "up" }, from_haldarsReach: { x: 2000, y: 150, face: "down" } },
    exits: [
      { rect: [320, 1440, 140, 60], to: "undervaults", entry: "from_ashenCanyon", push: [0, -1], hide: "ch5.escape" },
      { rect: [1940, 0, 120, 70], to: "haldarsReach", entry: "from_ashenCanyon", push: [0, 1], need: "ch5.escape" },
    ],
    triggers: [{ id: "canyonRun", rect: [320, 1300, 220, 130] }, { id: "canyonFire", rect: [1920, 120, 160, 120], show: "!ch5.escape" }],
    chests: [{ id: "canyonCache", x: 640, y: 1040 }],
    npcs: [],
    props,
    scatter: [{ keys: [["m2_rubbleHeap", 2], ["m2_cliffBoulder", 1], ["bones", 1], ["debris", 1]], n: 34, on: ["red", "ash", "road", "sand"], seed: 51, scaleRange: [0.7, 1.0] }],
    encounter: { table: "canyon", rate: 30 },
    amb: { birds: 0, butterflies: [], dust: 0xb8a090, motes: 60, tint: [0x4a2a2a, 0.14], warm: [0xff7a40, 0.05], weather: ["ash"], smoke: [[2000, 190, 0x666060]],
      armies: [
        { id: "hunterA", lane: [[760, 1330], [1100, 1240], [1250, 1020], [1000, 800]], mode: "pingpong", speed: 40, rows: 2, cols: 3, sight: 260, table: "canyon", show: "!ch5.escape" },
        { id: "hunterB", lane: [[1000, 400], [1400, 300], [1800, 210]], mode: "pingpong", speed: 36, rows: 2, cols: 3, sight: 260, table: "canyon", show: "!ch5.escape" },
      ] },
  });
})();
