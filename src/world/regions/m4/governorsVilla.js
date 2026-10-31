// M4 ch8: The Governor's Villa (dungeon, table "villa" 30 s). Entries start from_orchardHills (the kitchen door, SW). Exit orchardHills@from_governorsVilla (kitchen door).
// Rooms: kitchen (SW, the cook) -> bath hall -> atrium (centre) -> library (W, gather ledgerLibrary), songbird garden (E), strongroom (N, trigger s15Fight, chest villaChest show ch8.s15). Guards patrol the atrium (sight 200).
(function () {
  const { R, E, P, L } = World.shapes, M = World.m3, props = [], lights = [];
  const lamp = (x, y) => { props.push(["lampPost", x, y]); lights.push([x, y - 80, 130, 0.45]); };
  // kitchen: stove on the back wall, crates, jars, herbs
  props.push(["m4_kitchenStove", 300, 1190], ["m4_herbRack", 460, 1196], ["m4_laundryTub", 190, 1196], ["crates", 200, 1420], ["terracottaJars", 540, 1420], ["m4_clayOven", 420, 1330], ["crateStack", 330, 1430], ["m4_lowTable", 330, 1320]);
  // bath hall: the pool, a mosaic fountain, divans and columns
  props.push(["m4_bathPool", 1040, 1250], ["m4_mosaicFountain", 1290, 1250], ["m4_divan", 900, 1400], ["m4_divan", 1380, 1400], ["m4_villaColumn", 860, 1100], ["m4_villaColumn", 1000, 1100], ["m4_villaColumn", 1180, 1100], ["m4_villaColumn", 1340, 1100], ["m4_lowTable", 1160, 1400]); lamp(820, 1420); lamp(1420, 1420);
  // atrium: colonnade rows, a mosaic fountain, benches, braziers
  props.push(...M.row("m4_villaColumn", 760, 500, 1440, 500, 6, {}, 0, 3), ...M.row("m4_villaColumn", 760, 900, 1440, 900, 6, {}, 0, 4), ["m4_mosaicFountain", 1100, 700], ["stoneBench", 920, 700], ["stoneBench", 1280, 700], ["m4_goldBrazier", 800, 780, { fire: [0, -66, 1], glow: "gold" }], ["m4_goldBrazier", 1400, 780, { fire: [0, -66, 1], glow: "gold" }], ["m4_gildedStatue", 780, 620], ["m4_gildedStatue", 1420, 620]);
  // library: shelves on the back wall, the ledger desk, scroll racks
  props.push(["m4_libraryShelf", 170, 490], ["m4_libraryShelf", 290, 490], ["m4_libraryShelf", 410, 490], ["m4_libraryShelf", 530, 490], ["m4_ledgerDesk", 330, 700], ["scrollRack", 180, 820], ["studyChair", 330, 760], ["readingLamp", 460, 700], ["roundRug", 330, 650, { solid: false }], ["bookPile", 500, 820]); lamp(130, 780);
  // songbird garden: chained songbird perches, cages, beds
  props.push(["m4_songbirdPerches", 1780, 560], ["m4_songbirdPerches", 1900, 600], ["m4_songbirdPerches", 2020, 560], ["m4_songbirdPerches", 1840, 800], ["m4_songbirdPerches", 1980, 820], ["m4_birdCage", 1740, 700], ["m4_birdCage", 2080, 700], ["m4_chainPost", 1880, 700], ["m4_chainPost", 1960, 700], ["m4_flowerBed", 1800, 920], ["m4_flowerBed", 2000, 920], ["m4_jasmineBush", 2100, 880], ["m4_cacaoTree", 1730, 900]);
  // strongroom: the vault door (decor), chest, braziers, shelves of coin chests
  props.push(["m4_strongroomDoor", 1100, 400, { solid: false }], ["m4_goldBrazier", 970, 230, { fire: [0, -66, 1], glow: "gold" }], ["m4_goldBrazier", 1230, 230, { fire: [0, -66, 1], glow: "gold" }], ["crateStack", 960, 150], ["crateStack", 1240, 150], ["m4_ledgerDesk", 1100, 150]);
  World.def("governorsVilla", {
    name: "The Governor's Villa", w: 2200, h: 1500, base: "rock", music: "provinces", rim: 44,
    look: "A rich governor's villa seen from above with the roof removed: a stone kitchen in the south-west, a bath hall with a blue-tiled pool and mosaic fountain in the south, a great central atrium of colourful mosaic floor with two rows of white columns and a fountain, a library with shelves in the west, a sunlit garden of caged songbirds in the east, a strongroom with a heavy door in the north. Warm lamplight, polished luxury, a little cruel.",
    legend: { floor: "colourful mosaic tile floor in red, blue and gold patterns, polished", paved: "plain cream stone corridors", grass: "garden lawn with flowerbeds and a few caged birds", shallow: "blue-tiled bathing pool water", rock: "solid cream plaster walls and foundations", wall: "plaster wall tops" },
    bank: { floor: "lime", paved: "grey", grass: "green", shallow: "teal", rock: "dark" },
    grade: { floor: { mul: [1.12, 0.96, 0.8], add: [16, 6, -10] }, paved: { mul: [0.95, 0.9, 0.84], add: [2, 0, -4] }, grass: { mul: [0.75, 1.0, 0.6], add: [0, 8, -6] }, shallow: { mul: [0.7, 1.1, 1.1], add: [4, 16, 18] }, rock: { mul: [0.7, 0.6, 0.5], add: [0, 0, 0] }, _: [1, 0.97, 0.92] },
    marks: [{ k: "dot", on: ["floor"], n: 60, col: [200, 60, 50], a: 0.4, r: [1.5, 3], hi: false }, { k: "dot", on: ["floor"], n: 40, col: [60, 100, 200], a: 0.4, r: [1.5, 3], hi: false }],
    guide: [
      ["floor", R(100, 1180, 520, 280)], ["paved", L([[620, 1330], [800, 1330]], 100)],
      ["floor", R(800, 1080, 640, 380)], ["shallow", R(940, 1200, 200, 90)],
      ["paved", L([[1100, 1080], [1100, 900]], 110)],
      ["floor", R(700, 480, 800, 430)],
      ["paved", L([[580, 700], [700, 700]], 100)], ["floor", R(100, 480, 480, 420)],
      ["paved", L([[1500, 700], [1700, 700]], 100)], ["grass", R(1700, 460, 440, 540)],
      ["paved", L([[1100, 480], [1100, 390]], 140)], ["floor", R(900, 100, 400, 290)],
    ],
    entries: { start: { x: 180, y: 1340, face: "right" }, from_orchardHills: { x: 180, y: 1340, face: "right" } },
    exits: [{ rect: [52, 1290, 60, 100], to: "orchardHills", entry: "from_governorsVilla", push: [1, 0], floor: "floor" }],
    triggers: [{ id: "s15Fight", rect: [1000, 220, 200, 110] }],
    gather: [{ id: "ledgerLibrary", x: 330, y: 740, label: "The governor's ledgers", color: "gold" }],
    chests: [{ id: "villaChest", x: 1100, y: 190, show: "ch8.s15" }],
    npcs: [
      { id: "cook", art: "npcCook", name: "The cook", x: 270, y: 1290 },
      { id: null, art: "npcServant", x: 1000, y: 1380, path: [[860, 1380], [1380, 1380]], speed: 16 }, { id: null, art: "npcServant", x: 1900, y: 780, path: [[1760, 760], [2060, 760]], speed: 14 },
      { id: null, art: "npcLegionGuard", x: 1050, y: 360, still: true }, { id: null, art: "npcLegionGuard", x: 1150, y: 360, still: true }, { id: null, art: "npcJaguarElite", x: 760, y: 700, still: true },
    ],
    props,
    scatter: [{ keys: [["terracottaJars", 1], ["m4_flowerBed", 1], ["puddle", 1]], n: 8, on: ["floor"], seed: 331, scaleRange: [0.85, 1] }],
    lights,
    encounter: { zones: [{ rect: [0, 1100, 700, 400], table: null, rate: 0 }, { rect: [0, 0, 2200, 1500], table: "villa", rate: 30 }] },
    amb: {
      birds: 0, butterflies: [], water: true, dust: 0xf0dca8, motes: 36, tint: [0x3a2a1c, 0.12], warm: [0xffc070, 0.07], vignette: 1,
      armies: [
        { id: "villaPatrolA", lane: [[800, 580], [1400, 580], [1400, 820], [800, 820]], mode: "loop", speed: 24, rows: 2, cols: 3, sight: 200, table: "villa", cry: "Intruder! In the atrium!" },
        { id: "villaPatrolB", lane: [[880, 1200], [1360, 1200], [1360, 1400], [880, 1400]], mode: "loop", speed: 22, rows: 2, cols: 2, sight: 190, table: "villa" },
      ],
    },
  });
})();
