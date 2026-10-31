// M4 ch7: The Roofs (escape at dawn, no random fights; patrols hunt you). Entries start from_palaceEastWing. Exit lowstep@from_palaceRoofs (rope bridge, E end, need ch7.sacrifice).
// Triggers roofRun (arrival), sacrificeGate (the last gate on the east roof, before the rope bridge). Imela walks behind the hero (STORY stage actors / SYSTEMS follower).
(function () {
  const { R, E, P, L } = World.shapes, M = World.m3, props = [], gold = 0xffe4a0;
  const flat = (key, x, y, o) => [key, x, y, Object.assign({ dy: 3 - y }, o || {})];
  // roof A (arrival): the stair-house we came out of, chimneys on the back edge, banners
  props.push(["m4_roofStairs", 150, 900, { solid: false }], ["m2_templePillar", 260, 790, { tint: gold }], ["m2_templePillar", 520, 790, { tint: gold }], ["m4_sunBannerGold", 680, 790], ["m4_goldBrazier", 800, 800, { fire: [0, -66, 1], glow: "gold" }], ["m4_parapet", 400, 1130, { solid: [60, 14] }], ["m4_parapet", 640, 1130, { solid: [60, 14] }], ["m4_brickRubble", 300, 1060, { solid: false }], ["m4_chimney", 390, 790]);
  // roof D (north-west rooftop garden, a dead end with cover)
  props.push(["m4_jasmineBush", 330, 380], ["m4_flowerBed", 480, 560], ["m4_birdCage", 600, 420], ["m4_jasmineBush", 560, 340], ["m2_templePillar", 260, 330, { tint: gold }], ["m4_goldFountain", 440, 460, { scale: 0.7 }]);
  // roof B (the high roof): hatches, chimneys, a long banner row, the stair up from roof A
  props.push(["m4_roofStairs", 900, 820, { solid: false }], ["m2_templePillar", 1060, 310, { tint: gold }], ["m2_templePillar", 1260, 310, { tint: gold }], ["m2_templePillar", 1460, 310, { tint: gold }], ["m4_sunBannerGold", 1160, 310], ["m4_sunBannerGold", 1360, 310], ["m4_roofHatch", 1110, 600], ["m4_goldBrazier", 1560, 330, { fire: [0, -66, 1], glow: "gold" }], ["m4_goldBrazier", 980, 330, { fire: [0, -66, 1], glow: "gold" }],
    ["m4_parapet", 1300, 740, { solid: [60, 14] }], ["m4_parapet", 1500, 740, { solid: [60, 14] }], ["m4_brickRubble", 1200, 520, { solid: false }]);
  // the ledge to roof C and roof C (the east roof), the last gate before the rope bridge
  props.push(["m4_parapet", 1750, 560, { solid: [60, 14] }], ["m2_templePillar", 1860, 710, { tint: gold }], ["m2_templePillar", 2100, 710, { tint: gold }], ["m4_sunBannerGold", 1980, 710], ["m4_goldBrazier", 2180, 740, { fire: [0, -66, 1], glow: "gold" }], ["m4_gildedStatue", 1900, 1100], ["m4_goldBrazier", 2060, 1100, { fire: [0, -66, 1], glow: "gold" }], ["m4_collarAltar", 2200, 800, { glow: "gold", scale: 0.8, solid: [40, 12] }],
    ["m4_ropeBridgeEnd", 2330, 900], ["m4_ropeBridgeLong", 2250, 960, { solid: false, dy: -20, alpha: 0.9 }]);
  World.def("palaceRoofs", {
    name: "The Roofs", w: 2400, h: 1300, base: "rock", music: "tension", rim: 44,
    look: "The roofs of an emperor's palace at dawn seen from above: gold-glazed clay tile roofs in several levels, chimneys and banner poles, stone stairs and narrow ledges between the roofs, a tiny rooftop garden in the north-west, a high long roof in the middle, an east roof ending at a rope bridge; everywhere else a sheer drop to the dark city streets far below with mist and the first orange light. Dangerous, golden, cold.",
    legend: { floor: "overlapping gold-glazed clay roof tiles in rows, warm gold and ochre with dew", paved: "grey stone ledges and gutters between the roofs", road: "narrow stone steps", rock: "dark far-below streets and rooftops in blue-grey mist, a sheer drop", grass: "a small rooftop garden of soil and green leaves" },
    bank: { floor: "red", paved: "grey", road: "dirt", rock: "dark", grass: "green" },
    grade: { floor: { mul: [1.2, 0.9, 0.5], add: [14, 4, -8] }, paved: { mul: [0.85, 0.82, 0.78], add: [0, -2, -2] }, rock: { mul: [0.55, 0.62, 0.8], add: [-6, -2, 8] }, _: [1, 0.98, 0.95] },
    marks: [{ k: "crack", on: ["floor"], n: 30, col: [90, 50, 20], a: 0.4, len: [20, 60] }, { k: "dot", on: ["floor"], n: 60, col: [255, 220, 140], a: 0.6, r: [1, 2], hi: false }],
    guide: [
      ["floor", R(100, 780, 720, 360)],
      ["road", L([[800, 900], [1000, 700]], 90)],
      ["floor", R(960, 300, 640, 440)],
      ["paved", L([[1580, 500], [1780, 600], [1900, 760]], 90)],
      ["floor", R(1800, 700, 420, 420)],
      ["paved", L([[2200, 900], [2340, 900]], 110)],
      ["paved", L([[400, 780], [400, 640]], 80)], ["grass", R(240, 320, 440, 320)],
    ],
    entries: { start: { x: 200, y: 960, face: "right" }, from_palaceEastWing: { x: 200, y: 960, face: "right" } },
    exits: [{ rect: [2290, 850, 60, 100], to: "lowstep", entry: "from_palaceRoofs", push: [1, 0], need: "ch7.sacrifice", blocked: "ropeBridgeShut", floor: "paved" }],
    triggers: [{ id: "roofRun", rect: [150, 880, 200, 160] }, { id: "sacrificeGate", rect: [2110, 820, 120, 200] }],
    npcs: [],
    props,
    scatter: [{ keys: [["m4_brickRubble", 1], ["debris", 1], ["puddle", 1]], n: 14, on: ["floor"], seed: 241, scaleRange: [0.7, 0.9] }],
    amb: {
      birds: 2, butterflies: [], water: false, dust: 0xffd8a0, motes: 36, tint: [0x6a3010, 0.2], warm: [0xff9a40, 0.1], vignette: 1, weather: ["mist"],
      armies: [
        { id: "roofPatrolA", lane: [[200, 1060], [760, 1060]], mode: "pingpong", speed: 30, rows: 2, cols: 2, sight: 250, chaseSpeed: 96, table: "palace", cry: "There! On the roof!" },
        { id: "roofPatrolB", lane: [[1020, 500], [1540, 500], [1540, 660], [1020, 660]], mode: "loop", speed: 32, rows: 2, cols: 3, sight: 260, chaseSpeed: 98, table: "palace" },
        { id: "roofPatrolC", lane: [[1840, 780], [2180, 780], [2180, 1060], [1840, 1060]], mode: "loop", speed: 30, rows: 2, cols: 3, sight: 250, chaseSpeed: 96, table: "palace" },
      ],
    },
  });
})();
