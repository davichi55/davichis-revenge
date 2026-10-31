// M4 ch8: Tzavan Coast (field, 3000x2000, empire zone, table "coast" 30 s). The Royal Road runs S (Pale Gate) to N (Tzavan); branches W (salt flats), E (orchard hills), SE (the clifftop village and the Veiled Cistern).
// Entries start from_paleGate from_tzavan from_saltFlats from_orchardHills from_veiledCistern. Exits paleGate@from_tzavanCoast (S), tzavan@from_tzavanCoast (N, need ch8.s13), saltFlats@from_tzavanCoast (W), orchardHills@from_tzavanCoast (E, need ch8.s13), veiledCistern@from_tzavanCoast (SE).
// Triggers coastEnter (S end), tollS13 (the tollbooth on the road, forced north-bound), coastConvoy (the visible convoys: armies with table coastConvoy, hide ch8.supply>=3). Chests coastChest1 coastChest2. Legend L6 (shared with saltFlats).
(function () {
  const { R, E, P, L } = World.shapes, M = World.m3, props = [];
  // the road: markers every few hundred px, signal towers on the high points, the tollbooth block at the centre
  props.push(...M.row("m4_roadMarker", 1640, 1900, 1640, 100, 12, {}, 6, 3), ["m4_signalTower", 1250, 640], ["m4_signalTower", 1860, 1880], ["m4_signalTower", 1180, 1500], ["m4_signalTower", 1900, 280]);
  props.push(["m4_tollbooth", 1380, 1050], ["m4_cliffRuin", 1700, 1060], ["m4_legionCairn", 1640, 1100], ["m4_roadMarker", 1380, 1130], ["m4_supplyStack", 1740, 1130], ["m4_convoyWagon", 1700, 1010, { solid: [50, 14] }]);
  // west: ruined tollbooths and cairns on the salt-bush slopes (chest 2 under a tollbooth)
  props.push(["m4_tollbooth", 480, 1020, { tint: 0xbfb09c }], ["m4_cliffRuin", 760, 1500], ["m4_legionCairn", 380, 1420], ["m4_legionCairn", 980, 760], ["m4_driftwood", 600, 1700], ["m4_cliffRuin", 560, 520], ["m4_signalTower", 340, 300, { tint: 0xc0b8a8 }]);
  // east: the orchard road, a roadside shrine of cairns, terraces
  props.push(["m4_cliffRuin", 2260, 560], ["m4_legionCairn", 2000, 820], ["m4_legionCairn", 2480, 790], ["m4_signalTower", 2560, 420], ["m4_roadMarker", 2100, 840], ["m4_roadMarker", 2400, 840]);
  // the SE cliff village (ruined) and the sea inlet
  props.push(["m4_cliffRuin", 2420, 1640], ["m4_cliffRuin", 2640, 1780], ["m4_cliffRuin", 2780, 1600], ["m4_legionCairn", 2540, 1720], ["m4_driftwood", 2700, 1280], ["m4_driftwood", 2860, 1180, { flip: true }], ["m4_wreckBoat", 2640, 1200], ["m4_saltBush", 2300, 1540], ["m4_saltBush", 2860, 1740]);
  World.def("tzavanCoast", {
    name: "Tzavan Coast", w: 3000, h: 2000, base: "grass", music: "provinces", rim: 44,
    look: "A coastal stretch of an imperial highway seen from above: a wide paved road running north-south with dirt branches west, east and south-east, olive and salt-bush slopes of dry grass and grey scrub, ruined tollbooths, signal towers and legion cairns beside the road, grey limestone cliff edges and a dark blue bay with a pale beach in the east, a ruined clifftop village in the south-east. Grey, windy, dry.",
    legend: { grass: "dry olive-green and grey scrub grass with salt-bush, stones and dust", paved: "an old imperial paved road of grey flagstones with ruts and moss in the cracks", road: "a pale dirt track with cart ruts", sand: "pale gravel and sandy clifftop earth with ruined foundations", rock: "grey limestone cliff and boulders", water: "deep dark blue sea", shallow: "pale shallow turquoise water and beach", ash: "burnt dark earth" },
    bank: { grass: "green", paved: "grey", road: "dirt", sand: "sand", rock: "dark", water: "water", shallow: "teal" },
    grade: { grass: { mul: [1.2, 0.82, 0.5], add: [28, 8, -10] }, paved: { mul: [0.9, 0.9, 0.88], add: [0, 0, 0] }, road: { mul: [1.0, 0.92, 0.8], add: [6, 4, -2] }, sand: { mul: [1.0, 0.94, 0.82], add: [6, 2, -4] }, rock: { mul: [0.7, 0.72, 0.78], add: [0, 0, 4] }, _: [0.95, 0.97, 1] },
    marks: [{ k: "dot", on: ["grass"], n: 50, col: [200, 190, 120], a: 0.6, r: [1, 2], hi: false }, { k: "blot", on: ["grass"], n: 18, col: [80, 80, 50], a: 0.2, r: [14, 40] }],
    guide: [
      ["paved", L([[1500, 1960], [1500, 1000], [1500, 60]], 130)], ["paved", R(1380, 960, 330, 150)],
      ["road", L([[1500, 1400], [60, 1400]], 90)], ["road", L([[1500, 700], [2940, 700]], 90)], ["road", L([[1500, 1700], [2400, 1700], [2940, 1700]], 90)],
      ["sand", R(2380, 1560, 520, 260)],
      // the bay in the east and the cliffs round it
      ["rock", P([[2480, 880], [3000, 880], [3000, 1500], [2480, 1500], [2420, 1200]])], ["shallow", P([[2560, 960], [3000, 960], [3000, 1440], [2560, 1440], [2500, 1200]])], ["water", P([[2700, 1020], [3000, 1020], [3000, 1380], [2700, 1380], [2640, 1200]])],
      ["rock", E(420, 1700, 120, 60)], ["rock", E(1120, 360, 100, 60)], ["rock", E(2000, 1450, 110, 70)], ["rock", E(900, 1750, 90, 50)],
    ],
    entries: {
      start: { x: 1500, y: 1900, face: "up" }, from_paleGate: { x: 1500, y: 1900, face: "up" }, from_tzavan: { x: 1500, y: 160, face: "down" }, from_saltFlats: { x: 160, y: 1400, face: "right" },
      from_orchardHills: { x: 2840, y: 700, face: "left" }, from_veiledCistern: { x: 2820, y: 1700, face: "left" },
    },
    exits: [
      { rect: [1440, 1930, 120, 66], to: "paleGate", entry: "from_tzavanCoast", push: [0, -1], floor: "paved" },
      { rect: [1440, 52, 120, 60], to: "tzavan", entry: "from_tzavanCoast", push: [0, 1], need: "ch8.s13", blocked: "coastRoadBarred", floor: "paved" },
      { rect: [52, 1350, 60, 100], to: "saltFlats", entry: "from_tzavanCoast", push: [1, 0], floor: "road" },
      { rect: [2890, 650, 60, 100], to: "orchardHills", entry: "from_tzavanCoast", push: [-1, 0], need: "ch8.s13", blocked: "coastEastBarred", floor: "road" },
      { rect: [2890, 1650, 60, 100], to: "veiledCistern", entry: "from_tzavanCoast", push: [-1, 0], floor: "road" },
    ],
    triggers: [{ id: "coastEnter", rect: [1420, 1800, 160, 130] }, { id: "tollS13", rect: [1380, 1000, 330, 110] }, { id: "coastConvoy", rect: [1540, 1420, 100, 90], press: true, once: false, show: "ch8.supply<3" }],
    chests: [{ id: "coastChest1", x: 1250, y: 690 }, { id: "coastChest2", x: 520, y: 1080 }],
    legends: [{ id: "L6", enemy: "ghostOfTheNinthLegion", level: 46, chance: 0.04, spots: [[1700, 1350], [900, 1400], [1900, 700], [1300, 300]], when: "!l6.done" }],
    npcs: [{ id: null, art: "npcTraveler", x: 1600, y: 1500, path: [[1580, 1700], [1580, 1250]], speed: 20 }],
    props,
    scatter: [
      { keys: [["m4_saltBush", 4], ["m2_fernClump", 1], ["m4_legionCairn", 1]], n: 90, on: ["grass"], seed: 261, scaleRange: [0.8, 1.15] },
      { keys: [["m2_deadSnag", 1], ["debris", 1], ["bones", 1]], n: 16, on: ["grass", "sand"], seed: 262 },
    ],
    encounter: { table: "coast", rate: 30, zones: [{ rect: [1380, 1850, 240, 150], table: null, rate: 0 }, { rect: [0, 0, 3000, 2000], table: "coast", rate: 30 }] },
    amb: {
      birds: 5, butterflies: [], water: true, dust: 0xd8d0b8, motes: 40, tint: [0x28303c, 0.08], warm: [0xffd8a0, 0.04], weather: ["clear", "mist"],
      armies: [
        { id: "convoyA", lane: [[1470, 1880], [1470, 1100]], mode: "pingpong", speed: 18, rows: 1, cols: 3, banner: false, cent: false, sight: 0, table: "coastConvoy", hide: "ch8.supply>=3" },
        { id: "convoyB", lane: [[1500, 1380], [500, 1380]], mode: "pingpong", speed: 17, rows: 1, cols: 3, banner: false, cent: false, sight: 0, table: "coastConvoy", hide: "ch8.supply>=3", s0: 200 },
        { id: "convoyC", lane: [[1540, 690], [2800, 690]], mode: "pingpong", speed: 17, rows: 1, cols: 3, banner: false, cent: false, sight: 0, table: "coastConvoy", hide: "ch8.supply>=3", s0: 300 },
        { id: "legionRoad", lane: [[1540, 900], [1540, 300], [1560, 150]], mode: "pingpong", speed: 30, rows: 2, cols: 3, sight: 210, table: "coast", hide: "ch8.supply>=3", cry: "Halt! Royal Road business only!" },
        { id: "legionWest", lane: [[1300, 1420], [700, 1430], [400, 1300]], mode: "pingpong", speed: 28, rows: 2, cols: 3, sight: 200, table: "coast" },
      ],
    },
  });
})();
