// M3 / ch6: the Sunbird Roost (K5). Table "roost" 22 s. Entries start from_kharamRoad. Exit kharamRoad@from_sunbirdRoost.
// Puzzle: press triggers brazier1..8 along the ramps (chain in one pass, flags roost.lit / roost.open; lit bowls show their fire), the top door opens on roost.open. Triggers roostGuardian (top platform). Chest g23_cleanserReedGarland.
(function () {
  const { R, E, P, L } = World.shapes, M = World.m3, props = [];
  const BR = [[920, 1290], [520, 1215], [700, 975], [1300, 975], [1700, 975], [1500, 725], [900, 725], [700, 485]];
  BR.forEach(([x, y], i) => {
    const n = i + 1, lit = { any: ["roost.open", "roost.lit>=" + n] };
    props.push(["ashBrazier", x, y, { hide: lit, tint: 0xd8b060 }], ["ashBrazier", x, y, { show: lit, fire: [0, -50, 1], glow: "gold", tint: 0xffe090 }]);
  });
  // ramp edges: feathers, nests, wind banners, stone posts; the roost wheels in the sky
  props.push(...M.row(["m2_stonePost", "m2_windBanner"], 300, 1360, 1900, 1360, 8, {}, 10, 3), ...M.row(["m2_featherPile", "m2_bigNest", "m2_giantFeather"], 420, 1120, 1780, 1120, 6, {}, 14, 4), ...M.row(["m2_stonePost", "m2_windBanner"], 380, 870, 1760, 870, 7, {}, 10, 5), ...M.row(["m2_featherPile", "m2_giantFeather", "m2_bigNest"], 480, 620, 1700, 620, 6, {}, 14, 6));
  props.push(["m2_updraftVent", 1100, 1330, { solid: false }], ["m2_updraftVent", 1500, 1030, { solid: false }], ["m2_updraftVent", 1000, 780, { solid: false }], ["m2_rocStatue", 200, 1330, { tint: 0xf0d080 }], ["m2_rocStatue", 2000, 800, { tint: 0xf0d080 }], ["m2_windWheel", 220, 1000], ["m2_windWheel", 1960, 1150], ["m2_cliffBoulder", 150, 780], ["m2_cliffBoulder", 2050, 560], ["m2_stalagmite", 240, 560], ["m2_stalagmite", 2020, 1330]);
  // the golden nest-tower top: the leaf door, the platform, the great perch, the garland chest
  props.push(["builderDoor", 1100, 350, { hide: "roost.open", solid: [58, 16], tint: 0xffd870 }], ["m2_aviaryArch", 1100, 360, { show: "roost.open", solid: false }], ["m2_bigPerch", 1100, 190, { tint: 0xf0d890 }], ["m2_featherNest", 900, 220], ["m2_featherNest", 1310, 230], ["ashBrazier", 800, 150, { fire: [0, -50, 1], glow: "gold" }], ["ashBrazier", 1400, 150, { fire: [0, -50, 1], glow: "gold" }], ["m2_giantFeather", 760, 250], ["m2_giantFeather", 1450, 260], ["m2_featherDrift", 1000, 290], ["m2_featherDrift", 1220, 295], ["m2_windBanner", 840, 300], ["m2_windBanner", 1360, 300]);
  World.def("sunbirdRoost", {
    name: "The Sunbird Roost", w: 2200, h: 1500, base: "rock", music: "fort", rim: 44,
    look: "A golden nest-tower on a high mesa seen from above: broad zigzag ramps of warm sandy stone climbing in four levels with stone braziers along them, loose feathers and straw nests, wind banners, and at the top a wide round platform of pale stone with gold leaf and ash around a great perch. Sunlit, golden, airy, with wind-blown ash.",
    legend: { road: "warm golden-sand stone ramp with wind-blown ash and feathers, worn smooth", sand: "pale gold sand and straw nest litter", paved: "pale cream stone platform with fine gold leaf flakes and ash, a sun-disc pattern", red: "warm orange cliff stone", ash: "grey-brown ash and burnt straw", rock: "sheer pale orange mesa cliffs, impassable" },
    bank: { rock: "red", road: "sand", sand: "sand", paved: "lime", red: "red", ash: "ash" }, grade: { rock: { mul: [1.55,1.15,0.85], add: [0, 0, 0] }, road: { mul: [1.05, 0.95, 0.8], add: [10, 6, 0] }, sand: { mul: [1.05, 0.98, 0.85], add: [8, 6, 0] }, paved: { mul: [1.05, 0.98, 0.8], add: [6, 4, -4] }, red: { mul: [1.0, 0.9, 0.8], add: [0, 0, 0] }, ash: { mul: [1.3, 1.1, 1.0], add: [10, 6, 4] }, _: [1.05, 1.0, 0.92] },
    marks: [{ k: "dot", on: ["paved", "road"], n: 60, col: [255, 210, 90], a: 0.7, r: [1, 2], hi: false }, { k: "blot", on: ["road", "sand"], n: 10, col: [90, 70, 60], a: 0.14, r: [10, 30] }],
    guide: [
      ["road", L([[1100, 1460], [1100, 1280], [360, 1250], [300, 1010], [1900, 1000], [1900, 760], [420, 760], [360, 520], [1100, 520], [1100, 300]], 140)],
      ["sand", E(520, 1215, 90, 50)], ["sand", E(1700, 975, 90, 50)], ["ash", E(1200, 1000, 90, 40)], ["ash", E(1000, 760, 80, 36)], ["paved", E(1100, 190, 380, 150)], ["paved", R(740, 120, 720, 180)],
      ["road", R(1040, 290, 120, 100)],
    ],
    entries: { start: { x: 1100, y: 1400, face: "up" }, from_kharamRoad: { x: 1100, y: 1400, face: "up" } },
    exits: [{ rect: [1040, 1440, 120, 60], to: "kharamRoad", entry: "from_sunbirdRoost", push: [0, -1] }],
    triggers: [...BR.map(([x, y], i) => ({ id: "brazier" + (i + 1), rect: [x - 38, y - 30, 76, 46], press: true })), { id: "roostGuardian", rect: [1000, 200, 200, 90] }],
    chests: [{ id: "g23_cleanserReedGarland", x: 1330, y: 160 }],
    npcs: [{ id: "roostTablet", art: null, name: "A builders' tablet", x: 1000, y: 1330, hint: "E / Space: the tablet" }],
    props,
    scatter: [{ keys: [["m2_featherPile", 2], ["m2_cliffBoulder", 1], ["bones", 1]], n: 24, on: ["red", "road", "sand", "ash"], seed: 121, scaleRange: [0.7, 1.0] }],
    encounter: { table: "roost", rate: 22 },
    amb: { birds: 6, butterflies: [], dust: 0xf0d890, motes: 70, tint: [0x4a3818, 0.06], warm: [0xffc860, 0.08], weather: ["ash", "clear"] },
  });
})();
