// M4 ch7: The East Wing (interior, table "eastWing" 40 s). Three small courts in a chain: the laundry court (SW, arrival), the herb court (centre, the Gaoler), the third court with a lamp in a high window (NE, Imela's room).
// Entries start from_palaceGarden from_palaceRoofs. Exits palaceGarden@from_palaceEastWing (W), palaceRoofs@from_palaceEastWing (stair N of the third court, need ch7.s12).
// Triggers gaolerS12 (herb court), imelaRoom (the third court's door). Gather davichiNote (the folded note on her table), thymeBox (herb court window box).
(function () {
  const { R, E, P, L } = World.shapes, M = World.m3, props = [], gold = 0xffe8b8;
  const flat = (key, x, y, o) => [key, x, y, Object.assign({ dy: 3 - y }, o || {})];
  // laundry court: looms and tubs against the back wall, washing lines, a basket row
  props.push(["m4_loom", 200, 830], ["m4_loom", 360, 830], ["m4_laundryTub", 520, 840], ["m4_laundryTub", 640, 840], ["m4_roomScreen", 120, 1000], ["m4_laundryTub", 300, 1030], ["m4_laundryTub", 460, 1040], flat("m4_clothesLine", 400, 960), flat("m4_clothesLine", 560, 1160),
    ["crates", 640, 1220], ["m4_goldUrn", 140, 1230], ["m4_goldBrazier", 110, 870, { fire: [0, -66, 1], glow: "gold" }], ["m4_goldBrazier", 700, 1240, { fire: [0, -66, 1], glow: "gold" }]);
  // herb court: the thyme window box, herb racks, low tables, gilded statues on the back wall
  props.push(["m4_herbRack", 960, 430], ["m4_herbRack", 1100, 430], ["m4_thymeBox", 1300, 440], ["m4_gildedStatue", 1400, 440], ["m4_lowTable", 980, 720], ["m4_lowTable", 1420, 720], ["m4_divan", 1180, 500], ["m4_goldBrazier", 920, 620, { fire: [0, -66, 1], glow: "gold" }], ["m4_goldBrazier", 1480, 620, { fire: [0, -66, 1], glow: "gold" }],
    ["m4_jasmineBush", 1000, 880], ["m4_flowerBed", 1380, 880], ["m4_sundial", 1200, 760, { scale: 0.8 }]);
  // third court: the lamp in a high window, her divan, a screen, the table with the folded note, a loom by the wall
  props.push(["m4_lampWindow", 1720, 110, { fire: [0, -86, 0.8], glow: "gold" }], ["m4_roomScreen", 1620, 130], ["m4_loom", 1860, 130], ["m4_divan", 1690, 220], ["m4_lowTable", 1760, 340], ["m4_flowerBed", 1620, 420], ["m4_jasmineBush", 1860, 420], ["m4_goldBrazier", 1580, 330, { fire: [0, -66, 1], glow: "gold" }], ["m4_goldBrazier", 1900, 330, { fire: [0, -66, 1], glow: "gold" }]);
  // the doors between the courts and the roof stair
  props.push(["m4_servantDoor", 760, 1010, { solid: false }], ["m4_servantDoor", 1520, 400, { solid: false }], ["m4_woodStairs", 1750, 80, { solid: false }]);
  World.def("palaceEastWing", {
    name: "The East Wing", w: 2000, h: 1400, base: "rock", music: "palace", rim: 44,
    look: "A quiet wing of low gilded rooms in an emperor's palace seen from above: three small walled courts of cream stone linked by narrow corridors, a laundry court with tubs and looms in the south-west, a middle herb court with a window box of thyme and low tables, a third court in the north-east with divans, a screen and a single lamp glowing in a high window, a stair going up at its north. Hushed, warm lamplight, dust in the air, a prison made of beautiful things.",
    legend: { floor: "cream-grey stone slabs with a gold thread border, worn smooth, dust in the corners", paved: "narrow plain flagstone corridors, swept", rock: "solid cream plaster and stone walls" },
    bank: { floor: "lime", paved: "grey", rock: "dark" },
    grade: { floor: { mul: [1.08, 0.98, 0.84], add: [14, 8, -6] }, paved: { mul: [0.92, 0.86, 0.78], add: [2, -2, -6] }, rock: { mul: [0.7, 0.6, 0.5], add: [0, 0, 0] }, _: [1, 0.95, 0.88] },
    marks: [{ k: "dot", on: ["floor"], n: 40, col: [235, 200, 120], a: 0.6, r: [1, 1.8], hi: false }, { k: "blot", on: ["floor"], n: 8, col: [160, 120, 70], a: 0.14, r: [20, 50] }],
    guide: [
      ["floor", R(100, 820, 620, 460)], ["paved", L([[720, 1050], [900, 1050], [1000, 880]], 110)],
      ["floor", R(880, 420, 640, 520)],
      ["paved", L([[1480, 480], [1640, 360]], 110)], ["floor", R(1560, 100, 380, 400)],
    ],
    entries: { start: { x: 190, y: 1060, face: "right" }, from_palaceGarden: { x: 190, y: 1060, face: "right" }, from_palaceRoofs: { x: 1750, y: 200, face: "down" } },
    exits: [
      { rect: [56, 990, 70, 120], to: "palaceGarden", entry: "from_palaceEastWing", push: [1, 0], floor: "paved" },
      { rect: [1700, 52, 100, 60], to: "palaceRoofs", entry: "from_palaceEastWing", push: [0, 1], need: "ch7.s12", blocked: "roofStairShut", floor: "paved" },
    ],
    triggers: [{ id: "gaolerS12", rect: [1080, 640, 240, 120] }, { id: "imelaRoom", rect: [1540, 360, 110, 110] }],
    gather: [{ id: "davichiNote", x: 1760, y: 370, label: "A folded note on her table", color: "gold" }, { id: "thymeBox", x: 1300, y: 470, label: "A window box of thyme", color: 0x9ad88a }],
    npcs: [
      { id: null, art: "npcServant", x: 400, y: 1100, path: [[260, 1110], [620, 1110], [620, 940], [260, 940]], loop: true, speed: 18 },
      { id: null, art: "npcServant", x: 1500, y: 820, path: [[1000, 840], [1450, 840]], speed: 16 },
      { id: null, art: "npcPalaceGuard", x: 820, y: 1010, still: true },
    ],
    props,
    scatter: [{ keys: [["terracottaJars", 1], ["puddle", 1], ["m4_flowerBed", 1]], n: 6, on: ["floor"], seed: 231, scaleRange: [0.85, 1] }],
    encounter: { table: "eastWing", rate: 40, zones: [{ rect: [1540, 60, 420, 460], table: null, rate: 0 }, { rect: [0, 0, 2000, 1400], table: "eastWing", rate: 40 }] },
    amb: {
      birds: 0, butterflies: [], water: false, dust: 0xf0dca0, motes: 44, tint: [0x3a2814, 0.14], warm: [0xffb860, 0.08], vignette: 1,
      armies: [{ id: "wingPatrol", lane: [[760, 1050], [900, 1050], [1000, 880], [1400, 860]], mode: "pingpong", speed: 20, rows: 2, cols: 2, sight: 200, table: "eastWing", cry: "You, there! This wing is closed!" }],
    },
  });
})();
