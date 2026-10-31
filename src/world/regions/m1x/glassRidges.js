// CH1-EXPAND: R1 The Humming Ridges (north of the Whisperglass Dunes): long ridges of humming teal glass sand, a ring of builder stones that sing, rock massifs, a cave mouth (hummingHollow), a track east to the oasis. Table "dunes" 40 s.
// Entries: start / from_dunes (S), from_oasisOutskirts (E), from_hummingHollow (cave mouth). Exits: whisperglassDunes@from_glassRidges, oasisOutskirts@from_glassRidges, hummingHollow@from_glassRidges.
(function () {
  const { R, E, P, L } = World.shapes, K = World.kitM2, W = 3150, H = 2100;
  const ridgeA = K.ribbonPts(K.wob([[260, 1560], [820, 1230], [1320, 1330], [1860, 1060], [2300, 1180]], 36, 1101, 120), 200, 90);
  const ridgeB = K.ribbonPts(K.wob([[420, 640], [980, 520], [1520, 770], [2080, 640], [2640, 900]], 36, 1102, 120), 150, 210);
  const ridgeC = K.ribbonPts(K.wob([[1700, 1720], [2200, 1580], [2700, 1780], [3000, 1640]], 30, 1103, 110), 140, 110);
  const pools = [K.blobPts(1000, 900, 230, 120, 1111, { jag: 0.14 }), K.blobPts(2250, 1010, 200, 110, 1112, { jag: 0.14 }), K.blobPts(700, 1830, 200, 100, 1113, { jag: 0.14 }), K.blobPts(2000, 330, 170, 90, 1114, { jag: 0.14 })];
  const massifNE = K.blobPts(2650, 420, 430, 260, 1121, { jag: 0.1 }), massifW = K.blobPts(300, 380, 300, 250, 1122, { jag: 0.12 }), outS = K.blobPts(1050, 1720, 250, 160, 1123, { jag: 0.14 }), outC = K.blobPts(1760, 1210, 190, 120, 1124, { jag: 0.14 }), outSE = K.blobPts(2560, 1760, 200, 100, 1125, { jag: 0.14 }), outSW = K.blobPts(330, 1790, 170, 110, 1126, { jag: 0.14 }), outN = K.blobPts(1500, 240, 280, 150, 1127, { jag: 0.14 });
  const def = {
    name: "The Humming Ridges", ground: "assets/regions/glassRidges.jpg", w: W, h: H, music: "dunes", rim: 40,
    look: "A wide dune sea seen from above, golden sand with long wind ripples, crossed by long curving ridges of translucent teal-green glass sand that glitter in a low dramatic sun, a ring of old dark standing stones on a glassy hill, dark brown rock outcrops, a faint worn caravan track.",
    legend: { sand: "golden desert sand with long wind ripples", glass: "rippled teal-green translucent glass sand and glass dune crests, glittering", rock: "dark brown wind-carved rock outcrops and cliffs", road: "a faint worn caravan track" },
    guide: [
      ["glass", P(ridgeA)], ["glass", P(ridgeB)], ["glass", P(ridgeC)], ...pools.map(p => ["glass", P(p)]), ["glass", E(900, 800, 150, 90)],
      ["road", L([[1505, 2080], [1500, 1700], [1460, 1400], [1540, 1000], [1560, 760]], 58)], ["road", L([[1500, 1650], [2000, 1500], [2500, 1200], [3110, 1010]], 54)], ["road", L([[1480, 1420], [1000, 1500], [600, 1650]], 50)], ["road", L([[1540, 1000], [1200, 900], [900, 800]], 50)],
      ["rock", P(massifNE)], ["rock", P(massifW)], ["rock", P(outS)], ["rock", P(outC)], ["rock", P(outSE)], ["rock", P(outSW)], ["rock", P(outN)],
    ],
    entries: { start: { x: 1505, y: 1950, face: "up" }, from_dunes: { x: 1505, y: 1950, face: "up" }, from_oasisOutskirts: { x: 3000, y: 1010, face: "left" }, from_hummingHollow: { x: 2650, y: 800, face: "down" } },
    exits: [
      { rect: [1440, 2010, 130, 50], to: "whisperglassDunes", entry: "from_glassRidges", push: [0, -1] },
      { rect: [3054, 960, 56, 100], to: "oasisOutskirts", entry: "from_glassRidges", push: [-1, 0] },
      { rect: [2590, 650, 120, 60], to: "hummingHollow", entry: "from_glassRidges", push: [0, 1] },
    ],
    triggers: [{ id: "duskWhisperer", rect: [2000, 1790, 160, 120], once: false, when: "dunes.dusk" }, { id: "ridgesArrive", rect: [1430, 1830, 150, 90] }],
    chests: [{ id: "ridgeChest1", x: 2470, y: 1830 }, { id: "ridgeChest2", x: 370, y: 1880 }],
    gather: [{ id: "lostBell", x: 620, y: 880, label: "Something bright in the glass", color: "gold", show: "bell.started" }, { id: "ridgeVials", x: 1760, y: 540, label: "Humming glass sand", color: "gold" }],
    npcs: [
      { id: "singingStone", art: "lightStele", name: "Humming stone", x: 900, y: 790, hint: "E / Space: touch the stone" },
      { id: null, art: "npcTraveler", x: 1700, y: 1650, path: [[1700, 1650], [1900, 1580], [2100, 1540], [1900, 1580]], speed: 16, loop: true },
    ],
    props: [
      ["builderPillar", 820, 740, { solid: [18, 10] }], ["builderPillar", 980, 740], ["builderPillar", 820, 860], ["builderPillar", 980, 860], ["builderPillar", 900, 700], ["builderPillar", 900, 900],
      ["cairn", 1500, 1880], ["cairn", 3000, 960], ["cairn", 640, 800], ["camelBones", 1300, 1560], ["camelBones", 2400, 1300], ["deadTree", 1760, 1380], ["deadTree", 480, 1340],
      ["glassSpire", 2230, 960, { solid: [14, 8] }], ["glassSpire", 1020, 860], ["glassCluster", 1840, 520, { solid: [16, 10] }],
    ],
    scatter: [
      { keys: [["glassSpire", 3], ["glassShard", 4], ["glassDune", 2]], n: 140, on: ["glass"], seed: 1101, scaleRange: [0.8, 1.2] },
      { keys: [["glassShard", 3], ["grass", 4], ["grass2", 4], ["bones", 1], ["skull", 1]], n: 150, seed: 1102, scaleRange: [0.9, 1.1] },
      { keys: ["sandBoulder", "rocks", "boulder", "cactus", "deadTree", "camelBones", "shrub"], n: 110, seed: 1103 },
    ],
    encounter: { table: "dunes", rate: 40 },
    amb: {
      birds: 4, water: false, dust: 0xf0d8a0, motes: 70, tint: [0x4a2a3a, 0.16], sparkle: { terrain: ["glass"], color: 0xbfffee, rate: 12 },
      armies: [{ id: "patrol1", lane: [[700, 1300], [1200, 1420], [1500, 1100], [1100, 940], [760, 1100]], mode: "loop", speed: 36, rows: 2, cols: 3, sight: 220, table: "dunes" }],
    },
  };
  World.def("glassRidges", def);
})();
