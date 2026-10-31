// M4 ch7: The Palace Court (dungeon, stealth: patrols are visible and hunt you; table "palace" 40 s, none near the sewer grating).
// Entries start from_ahuacanSewers from_palaceGarden. Exits ahuacanSewers@from_palaceCourt (floor grating, SE), palaceGarden@from_palaceCourt (inner gate, N, need ch7.s10).
// Triggers courtEnter (arrival yard), gateS10 (before the collar altar on the dais), courtWatch (the servants' passage, E), westGallery (the priest who keeps the keys, W). Chest g43_sunstoneRegalia (treasury behind the servant door, show ch7.courtKey).
(function () {
  const { R, E, P, L } = World.shapes, M = World.m3, props = [], gold = 0xffe4a0;
  const flat = (key, x, y, o) => [key, x, y, Object.assign({ dy: 3 - y }, o || {})];
  // the north wall: gilded colonnades stand on the wall band (blocked), banners between, the inner gate in the middle
  for (const x of [400, 640, 880, 1530, 1770, 2010]) props.push(["m4_colonnade", x, 420]);
  props.push(["m4_palaceGate", 1200, 330, { solid: false }], ["m4_sunBannerGold", 1000, 420], ["m4_sunBannerGold", 1400, 420], ["m4_goldBrazier", 1060, 440, { fire: [0, -66, 1], glow: "gold" }], ["m4_goldBrazier", 1340, 440, { fire: [0, -66, 1], glow: "gold" }]);
  // the dais before the gate: collar altar (the inner gate is sealed by it until the general falls)
  props.push(["m4_collarAltar", 1200, 430, { glow: "gold" }], ["m4_gildedStatue", 1090, 470], ["m4_gildedStatue", 1310, 470]);
  // the long carpet (painted: terrain red) and the fountain
  props.push(["m4_goldFountain", 1200, 930, { solid: [46, 20] }], ["m4_gildedStatue", 1060, 1130], ["m4_gildedStatue", 1340, 1130], ["m4_gildedStatue", 1060, 700], ["m4_gildedStatue", 1340, 700], ["m4_goldBrazier", 1100, 1290, { fire: [0, -66, 1], glow: "gold" }], ["m4_goldBrazier", 1300, 1290, { fire: [0, -66, 1], glow: "gold" }]);
  // guard galleries: columns along the east and west walls, banners, benches
  props.push(...M.row(["whiteColumn", "m4_sunBannerGold"], 350, 560, 350, 1260, 6, { tint: gold }, 0, 4), ...M.row(["whiteColumn", "m4_sunBannerGold"], 2060, 560, 2060, 1260, 6, { tint: gold }, 0, 5), ["m4_palaceBench", 640, 1100], ["m4_palaceBench", 1760, 1100], ["m4_palaceBench", 700, 640], ["m4_palaceBench", 1700, 640]);
  props.push(["m4_gildedStatue", 560, 900], ["m4_gildedStatue", 1840, 900], ["m4_goldUrn", 520, 1200], ["m4_goldUrn", 1880, 1200], ["m4_goldBrazier", 480, 760, { fire: [0, -66, 1], glow: "gold" }], ["m4_goldBrazier", 1920, 760, { fire: [0, -66, 1], glow: "gold" }]);
  // west: the treasury behind the servant door (opens with the priest's key), east: the servants' passage; south-east: the arrival yard with the sewer grating
  props.push(["m4_servantDoor", 290, 1452, { hide: "ch7.courtKey", solid: [14, 210] }], ["m4_servantDoor", 290, 1452, { show: "ch7.courtKey", solid: false, alpha: 0.5 }], ["m4_goldBrazier", 150, 1290, { fire: [0, -66, 1], glow: "gold" }], ["m4_goldBrazier", 220, 1500, { fire: [0, -66, 1], glow: "gold" }], ["crateStack", 130, 1400], ["m4_goldUrn", 240, 1440]);
  props.push(["m4_gildedWall", 2200, 470, { solid: false }]);
  props.push(["m4_laundryTub", 2200, 640], ["m4_laundryTub", 2210, 860], ["m4_herbRack", 2190, 1100], ["crates", 2200, 1260], ["crateStack", 2090, 1500], ["m4_sewerGrating", 2230, 1510, { solid: false }], ["m4_laundryTub", 1980, 1500], ["m4_brickRubble", 1900, 1520], ["m4_sewerLamp", 2150, 1450, { fire: [0, -58, 0.7] }]);
  World.def("palaceCourt", {
    name: "The Palace Court", w: 2400, h: 1600, base: "rock", music: "palace", rim: 44,
    look: "The outer court of an emperor's palace seen from above: vast courtyard of polished white stone inlaid with gold leaf sun-calendar rings, a long red carpet running to a raised dais and a sealed golden inner gate in a wall of gilded colonnades at the north, a gold fountain in the centre, galleries of white columns on the east and west, a small servants' passage along the east wall, a treasury room behind a servant door in the south-west, a dingy servants' yard in the south-east. Rich, cold, golden light.",
    legend: { floor: "polished white-cream stone slabs inlaid with thin gold-leaf circles and rays, very clean, a few red petals", paved: "pale grey-cream flagstones, plain servant paving and the dais steps", wall: "gilded wall tops, white stone and gold leaf", rock: "solid white stone palace wall and foundations", red: "a deep red carpet runner with gold borders and woven sun rays", water: "deep fountain basin water" },
    bank: { floor: "lime", paved: "lime", wall: "lime", red: "red", rock: "dark" },
    grade: { floor: { mul: [1.18, 1.1, 0.98], add: [26, 20, 8] }, red: { mul: [1.1, 0.5, 0.45], add: [18, -8, -8] }, paved: { mul: [0.95, 0.9, 0.82], add: [4, 0, -6] }, wall: { mul: [0.95, 0.85, 0.65], add: [14, 8, -6] }, rock: { mul: [0.7, 0.62, 0.5], add: [0, 0, 0] }, _: [1, 0.96, 0.9] },
    marks: [{ k: "dot", on: ["floor"], n: 60, col: [230, 190, 90], a: 0.6, r: [1, 2], hi: false }, { k: "blot", on: ["floor"], n: 8, col: [200, 160, 90], a: 0.12, r: [30, 80] }],
    guide: [
      // the court and its north wall band (gate gap in the middle)
      ["floor", R(260, 420, 1880, 1136)], ["wall", R(260, 300, 1880, 120)], ["paved", R(1020, 300, 360, 120)], ["paved", R(1040, 40, 320, 270)],
      // the dais before the gate
      ["paved", R(1000, 420, 400, 110)], ["red", R(1150, 430, 100, 1126)],
      // the treasury (SW) behind the servant door, the servants' passage (E) and the arrival yard (SE)
      ["floor", R(80, 1260, 200, 240)], ["paved", R(120, 1380, 180, 60)],
      ["wall", R(2120, 520, 30, 760)], ["paved", R(2150, 420, 120, 1000)], ["paved", R(2100, 1420, 220, 136)],
    ],
    entries: { start: { x: 2090, y: 1480, face: "left" }, from_ahuacanSewers: { x: 2090, y: 1480, face: "left" }, from_palaceGarden: { x: 1200, y: 200, face: "down" } },
    exits: [
      { rect: [2190, 1500, 80, 50], to: "ahuacanSewers", entry: "from_palaceCourt", push: [0, 1], floor: "paved", blocked: "courtGratingShut" },
      { rect: [1130, 54, 140, 50], to: "palaceGarden", entry: "from_palaceCourt", push: [0, -1], need: "ch7.s10", blocked: "innerGateSealed", floor: "paved" },
    ],
    triggers: [
      { id: "courtEnter", rect: [1950, 1400, 330, 150] },
      { id: "gateS10", rect: [1090, 520, 220, 80] },
      { id: "courtWatch", rect: [2160, 880, 100, 120] },
      { id: "westGallery", rect: [400, 780, 160, 180], hide: "ch7.courtKey" },
    ],
    chests: [{ id: "g43_sunstoneRegalia", x: 160, y: 1440, show: "ch7.courtKey" }],
    npcs: [
      { id: null, art: "npcCourtPriest", x: 470, y: 870, still: true },
      { id: null, art: "npcPalaceGuard", x: 1050, y: 560, still: true }, { id: null, art: "npcPalaceGuard", x: 1350, y: 560, still: true }, { id: null, art: "npcJaguarElite", x: 640, y: 1240, still: true },
      { id: null, art: "npcServant", x: 800, y: 1380, path: [[600, 1400], [1000, 1400], [1000, 1250]], loop: true, speed: 22 },
      { id: null, art: "npcServant", x: 2200, y: 600, path: [[2200, 470], [2200, 1300]], speed: 20 },
      { id: null, art: "npcServant", x: 1600, y: 800, path: [[1500, 900], [1800, 900], [1800, 1100], [1500, 1100]], loop: true, speed: 18 },
    ],
    props,
    scatter: [{ keys: [["terracottaJars", 1], ["puddle", 1], ["m4_gildedStatue", 1]], n: 6, on: ["floor"], seed: 211, scaleRange: [0.9, 1] }],
    encounter: { zones: [{ rect: [1900, 1380, 420, 180], table: null, rate: 0 }, { rect: [0, 0, 2400, 1600], table: "palace", rate: 40 }] },
    amb: {
      birds: 0, butterflies: [], water: true, dust: 0xf0d8a0, motes: 36, tint: [0x3a2c18, 0.1], warm: [0xffc060, 0.06], vignette: 1,
      armies: [
        { id: "courtPatrolA", lane: [[620, 720], [1800, 720], [1800, 1020], [620, 1020]], mode: "loop", speed: 24, rows: 2, cols: 3, sight: 240, table: "palace", cry: "Halt! Who goes there in the court!" },
        { id: "courtPatrolB", lane: [[520, 1260], [1800, 1260]], mode: "pingpong", speed: 22, rows: 2, cols: 3, sight: 240, table: "palace" },
        { id: "courtPatrolC", lane: [[540, 560], [900, 560], [900, 640], [540, 640]], mode: "loop", speed: 20, rows: 2, cols: 2, sight: 220, table: "palace" },
        { id: "courtPatrolD", lane: [[1500, 520], [1800, 520], [1800, 620]], mode: "pingpong", speed: 22, rows: 2, cols: 2, sight: 220, table: "palace" },
      ],
    },
  });
})();
