// R1 Whisperglass Dunes: glass-sand dunes, legion patrols that hunt you, a buried builder door. Table "dunes" about every 40 s of walking.
// Exits: orun (north-west), sandpiperRest (north-east), cisternBurntGate (south door + north gate), amberBasin (east); CH1-EXPAND: glassRidges (north), caravanGraveyard (south-west), oasisOutskirts (north-east), open once Sandpiper Rest has been reached.
(function () {
  const { R, E, P, L } = World.shapes;
  World.def("whisperglassDunes", {
    name: "Whisperglass Dunes", w: 2300, h: 1500, music: "dunes", rim: 40,
    look: "A wide dune sea, golden sand with long wind ripples, and ridges and patches of humming teal glass sand that glitters. Dramatic low sun, dark rocky outcrops.",
    legend: { glass: "rippled teal-green translucent glass sand and glass dune crests, glittering", rock: "dark brown wind-carved rock outcrops and cliffs", road: "a faint worn caravan track" },
    guide: [
      ["glass", E(700, 1000, 260, 130)], ["glass", E(1500, 1100, 300, 140)], ["glass", E(1900, 420, 250, 110)], ["glass", E(380, 560, 200, 100)], ["glass", E(1150, 330, 260, 110)], ["glass", E(1850, 1250, 220, 100)],
      ["road", L([[60, 190], [500, 330], [900, 480], [1300, 640], [1650, 480], [1960, 260]], 56)], ["road", L([[1300, 640], [1240, 980], [1220, 1450]], 54)], ["road", L([[1300, 640], [1800, 760], [2260, 780]], 54)], ["road", L([[1650, 480], [1750, 540]], 50)],
      ["rock", P([[420, 760], [570, 700], [720, 770], [650, 880], [470, 870]])], ["rock", P([[1450, 280], [1600, 230], [1720, 300], [1640, 380], [1480, 370]])], ["rock", P([[800, 1180], [980, 1120], [1100, 1210], [1010, 1330], [830, 1300]])],
      ["rock", P([[1950, 880], [2150, 860], [2200, 1000], [2060, 1080], [1940, 1000]])], ["rock", P([[250, 1150], [420, 1100], [520, 1200], [430, 1320], [280, 1300]])], ["rock", P([[600, 100], [800, 60], [900, 160], [760, 230], [620, 200]])],
      ["rock", P([[1000, 700], [1100, 680], [1140, 760], [1060, 800]])],
    ],
    entries: { start: { x: 160, y: 230, face: "down" }, from_orun: { x: 170, y: 230, face: "right" }, from_sandpiper: { x: 1900, y: 300, face: "left" }, from_cistern: { x: 1220, y: 1360, face: "up" }, from_cistern_gate: { x: 1760, y: 590, face: "down" }, from_amberBasin: { x: 2190, y: 780, face: "left" },
      from_glassRidges: { x: 1115, y: 150, face: "down" }, from_caravanGraveyard: { x: 645, y: 1350, face: "up" }, from_oasisOutskirts: { x: 1765, y: 150, face: "down" } },
    exits: [
      { rect: [40, 140, 56, 120], to: "orun", entry: "from_dunes", push: [1, 0], hide: "ch5.start" },
      { rect: [40, 140, 56, 120], to: "ashenOrun", entry: "from_dunes", push: [1, 0], show: "ch5.start" },
      { rect: [1930, 210, 50, 100], to: "sandpiperRest", entry: "from_dunes", push: [-1, 0], floor: "road" },
      { rect: [1180, 1400, 90, 50], to: "cisternBurntGate", entry: "from_dunes", push: [0, -1] },
      { rect: [1722, 520, 70, 36], to: "cisternBurntGate", entry: "from_dunes_gate", push: [0, 1] },
      { rect: [2220, 730, 50, 100], to: "amberBasin", entry: "from_dunes", push: [-1, 0] },
      { rect: [1050, 40, 130, 50], to: "glassRidges", entry: "from_dunes", push: [0, 1], need: "sp.seen", blocked: "ch1x.wait" },
      { rect: [590, 1400, 110, 50], to: "caravanGraveyard", entry: "from_dunes", push: [0, -1], need: "sp.seen", blocked: "ch1x.wait" },
      { rect: [1700, 40, 130, 50], to: "oasisOutskirts", entry: "from_dunes", push: [0, 1], need: "sp.seen", blocked: "ch1x.wait" },
    ],
    triggers: [{ id: "dunesArrival", rect: [180, 250, 160, 100] }, { id: "duskWhisperer", rect: [1700, 1000, 160, 120], once: false, when: "dunes.dusk" }],
    chests: [{ id: "dunesBuriedChest", x: 1790, y: 1170, show: "ch6.buriedDoorOpen" }],
    props: [["builderDoorBuried", 1750, 1130, { solid: [40, 18] }], ["cairn", 1230, 1300], ["cairn", 1900, 380], ["cairn", 300, 300], ["deadTree", 1260, 780], ["camelBones", 1140, 600], ["camelBones", 1560, 940]],
    scatter: [
      { keys: [["glassSpire", 3], ["glassShard", 4], ["glassDune", 2]], n: 70, on: ["glass"], seed: 1, scaleRange: [0.8, 1.2] },
      { keys: [["glassShard", 3], ["grass", 4], ["grass2", 4], ["bones", 1], ["skull", 1]], n: 80, seed: 2, scaleRange: [0.9, 1.1] },
      { keys: ["sandBoulder", "rocks", "boulder", "cactus", "deadTree", "camelBones", "shrub"], n: 60, seed: 3 },
    ],
    encounter: { table: "dunes", rate: 40 },
    amb: {
      birds: 5, water: false, dust: 0xf0d8a0, motes: 60, tint: [0x4a2a3a, 0.16], sparkle: { terrain: ["glass"], color: 0xbfffee, rate: 10 },
      armies: [
        { id: "patrol1", lane: [[500, 330], [900, 480], [1300, 640], [1650, 480]], mode: "pingpong", speed: 36, rows: 2, cols: 4, sight: 210, table: "dunes", cry: "There! The scholar's apprentice!" },
        { id: "patrol2", lane: [[600, 1000], [1000, 900], [1250, 800], [1100, 1050], [800, 1100]], mode: "loop", speed: 40, rows: 2, cols: 3, sight: 240, table: "dunes" },
        { id: "patrol3", lane: [[1800, 760], [2100, 780], [2100, 1000], [1800, 1000]], mode: "loop", speed: 36, rows: 2, cols: 3, sight: 220, table: "dunes" },
      ],
      chase: { lane: [[150, 700], [450, 640], [700, 600], [900, 640]], table: "dunes" },
      wrecks: [[560, 1020]],
    },
  });
})();
