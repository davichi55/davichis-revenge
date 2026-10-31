// M4 ch7: The Palace Garden (dungeon, table "garden" 40 s). Entries start from_palaceCourt from_palaceEastWing. Exits palaceCourt@from_palaceGarden (S), palaceEastWing@from_palaceGarden (NE trellis gate, need ch7.s11).
// Triggers messengerScene (south entrance, the emperor's departure seen from the balcony), gardenS11 (the Garden Keeper under the sun-dial). Gather hiddenShrine (a pocket behind the hedge wall, west). Patrols visible (sight 220).
(function () {
  const { R, E, P, L } = World.shapes, M = World.m3, props = [];
  const flat = (key, x, y, o) => [key, x, y, Object.assign({ dy: 3 - y }, o || {})];
  // north: the balcony terrace on the back wall, caged songbirds, back hedges and cacao trees
  props.push(["m4_colonnade", 1100, 140, { solid: false, tint: 0xffe8b0 }], ["m4_sunBannerGold", 930, 160], ["m4_sunBannerGold", 1270, 160], ["m4_goldBrazier", 960, 330, { fire: [0, -66, 1], glow: "gold" }], ["m4_goldBrazier", 1240, 330, { fire: [0, -66, 1], glow: "gold" }]);
  props.push(...M.row("m4_hedge", 240, 190, 760, 190, 4, {}, 0, 3), ...M.row("m4_hedge", 1440, 190, 2000, 190, 4, {}, 0, 4), ["m4_birdCage", 560, 330], ["m4_birdCage", 680, 330], ["m4_birdCage", 1520, 330], ["m4_birdCage", 1640, 330], ["m4_birdCage", 430, 560], ["m4_birdCage", 1740, 560]);
  // the centre: the sun-dial on a paved circle, benches and flower beds round it
  props.push(["m4_sundial", 1100, 740], ["m4_palaceBench", 940, 800], ["m4_palaceBench", 1260, 800], ["m4_flowerBed", 940, 700], ["m4_flowerBed", 1260, 700], ["m4_jasmineBush", 1000, 840], ["m4_jasmineBush", 1200, 840]);
  // the west wing of the garden: a gold fountain, trellis arches, beds, cacao grove
  props.push(["m4_goldFountain", 640, 1130], ["m4_trellisArch", 520, 760, { solid: false }], ["m4_trellisArch", 700, 760, { solid: false }], ["m4_flowerBed", 520, 1010], ["m4_flowerBed", 770, 1010], ["m4_flowerBed", 520, 1250], ["m4_flowerBed", 770, 1250], ["m4_cacaoTree", 880, 1180], ["m4_cacaoTree", 430, 1130], ["m4_cacaoTree", 960, 1340]);
  // the hidden shrine (SW pocket) behind the hedge wall: the entrance is a gap on its east side
  props.push(["m4_hedge", 215, 925], ["m4_hedge", 365, 925], ["m4_hedge", 215, 1200], ["m4_hedge", 365, 1200], ["m4_hedge", 450, 970], ["m4_hedge", 450, 1180], ["m4_hiddenShrine", 250, 1080], ["m4_jasmineBush", 330, 1010], ["m4_flowerBed", 340, 1130]);
  // the east wing of the garden: terraces of cacao, a second fountain, the trellis gate to the east wing
  props.push(["m4_goldFountain", 1560, 1130], ["m4_flowerBed", 1440, 1010], ["m4_flowerBed", 1690, 1010], ["m4_flowerBed", 1440, 1250], ["m4_flowerBed", 1690, 1250], ["m4_cacaoTree", 1330, 1180], ["m4_cacaoTree", 1810, 1180], ["m4_cacaoTree", 1260, 1340], ["m4_cacaoTree", 1960, 1260],
    ["m4_trellisArch", 2040, 330, { solid: false }], ["m4_goldBrazier", 2040, 420, { fire: [0, -66, 1], glow: "gold" }], ["m4_goldBrazier", 2040, 250, { fire: [0, -66, 1], glow: "gold" }], ["m4_gildedStatue", 1700, 540], ["m4_gildedStatue", 500, 540]);
  props.push(["m4_gildedStatue", 960, 1400], ["m4_gildedStatue", 1240, 1400], ["m4_goldBrazier", 1010, 1430, { fire: [0, -66, 1], glow: "gold" }], ["m4_goldBrazier", 1190, 1430, { fire: [0, -66, 1], glow: "gold" }]);
  World.def("palaceGarden", {
    name: "The Palace Garden", w: 2200, h: 1500, base: "rock", music: "palace", rim: 44,
    look: "A walled imperial garden seen from above under a glass roof: lush terraces of dark glossy cacao trees, jasmine and flower beds in neat rows, white gravel paths meeting at a paved circle with a bronze sun-dial in the centre, two gold fountains, rows of tall green hedges, hanging cages of songbirds, a marble balcony platform at the north wall with banners, a trellis gate in the north-east corner, a tiny hedge-walled pocket in the south-west. Warm, green, filtered light.",
    legend: { grass: "dense dark green lawn and rich dark earth beds with fallen petals", paved: "white and cream gravel paths and a paved circle with sun rays", floor: "cream marble balcony slabs with gold inlay", rock: "solid garden wall, hedge-covered stone", wall: "low white stone terrace walls" },
    bank: { grass: "green", paved: "lime", floor: "lime", rock: "dark" },
    grade: { grass: { mul: [0.62, 0.98, 0.55], add: [-4, 10, -6] }, paved: { mul: [1.15, 1.08, 0.92], add: [18, 14, 0] }, floor: { mul: [1.15, 1.08, 0.95], add: [20, 16, 4] }, _: [0.98, 1.02, 0.96] },
    marks: [{ k: "dot", on: ["grass"], n: 90, col: [250, 210, 120], a: 0.7, r: [1, 2], hi: false }, { k: "dot", on: ["grass"], n: 40, col: [240, 120, 140], a: 0.7, r: [1, 2], hi: false }],
    guide: [
      ["grass", R(120, 130, 1960, 1290)],
      ["paved", L([[1100, 1456], [1100, 760]], 110)], ["paved", L([[1100, 760], [320, 760], [320, 420]], 110)], ["paved", L([[1100, 760], [1880, 760], [1880, 330], [2090, 330]], 110)], ["paved", L([[1100, 760], [1100, 340]], 110)],
      ["paved", E(1100, 760, 190, 120)], ["floor", R(900, 140, 400, 230)], ["paved", L([[1100, 1000], [640, 1000], [640, 1260]], 80)], ["paved", L([[1100, 1000], [1560, 1000], [1560, 1260]], 80)],
      ["paved", L([[330, 1050], [450, 1050]], 90)],
    ],
    entries: { start: { x: 1100, y: 1380, face: "up" }, from_palaceCourt: { x: 1100, y: 1380, face: "up" }, from_palaceEastWing: { x: 1980, y: 330, face: "left" } },
    exits: [
      { rect: [1040, 1440, 120, 60], to: "palaceCourt", entry: "from_palaceGarden", push: [0, -1], floor: "paved" },
      { rect: [2060, 280, 80, 100], to: "palaceEastWing", entry: "from_palaceGarden", push: [-1, 0], need: "ch7.s11", blocked: "trellisGateShut", floor: "paved" },
    ],
    triggers: [{ id: "messengerScene", rect: [980, 1260, 240, 120] }, { id: "gardenS11", rect: [1030, 810, 140, 70] }],
    gather: [{ id: "giltFlake1", x: 640, y: 1215, label: "A flaking gilded trellis", color: 'gold' }, { id: "giltFlake2", x: 1560, y: 1215, label: "Gold leaf under a screen", color: 'gold' }, { id: "hiddenShrine", x: 250, y: 1110, label: "A gap in the hedge wall", color: "gold" }],
    npcs: [
      { id: null, art: "npcServant", x: 700, y: 900, path: [[500, 880], [900, 880], [900, 1000], [500, 1000]], loop: true, speed: 18 },
      { id: null, art: "npcGardener", x: 1500, y: 880, path: [[1300, 880], [1700, 880]], speed: 18 },
      { id: null, art: "npcPalaceGuard", x: 1020, y: 380, still: true }, { id: null, art: "npcPalaceGuard", x: 1180, y: 380, still: true },
    ],
    props,
    scatter: [{ keys: [["m4_cacaoTree", 2], ["m4_jasmineBush", 3], ["m4_flowerBed", 2], ["m4_hedge", 1]], n: 22, on: ["grass"], seed: 221, scaleRange: [0.85, 1] }],
    encounter: { zones: [{ rect: [940, 1330, 320, 170], table: null, rate: 0 }, { rect: [0, 0, 2200, 1500], table: "garden", rate: 40 }] },
    amb: {
      birds: 3, butterflies: [[600, 900], [1500, 980], [1100, 600], [800, 1300], [1700, 700]], water: true, dust: 0xf0f0c0, motes: 40, tint: [0x20381c, 0.1], warm: [0xffe090, 0.06], vignette: 1, weather: ["clear"],
      armies: [
        { id: "gardenPatrolA", lane: [[400, 1100], [900, 1100], [900, 1300], [400, 1300]], mode: "loop", speed: 22, rows: 2, cols: 3, sight: 220, table: "garden", cry: "Halt! The garden is closed!" },
        { id: "gardenPatrolB", lane: [[1400, 1100], [1900, 1100], [1900, 1300], [1400, 1300]], mode: "loop", speed: 22, rows: 2, cols: 3, sight: 220, table: "garden" },
      ],
    },
  });
})();
