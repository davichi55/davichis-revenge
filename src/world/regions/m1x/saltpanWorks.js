// CH1-EXPAND (chapter 2): Saltpan Works, north-west of Amber Wells Basin: abandoned salt-evaporation pans divided by low dikes, a pan-keeper's hut, a half-buried salt barge. Table "basin" 38 s.
// Entries: start / from_amberBasin (S). Exit: amberBasin@from_saltpanWorks. Chests saltChest1 saltChest2, gather saltRake (Salt Crust x4), lore panLedger.
(function () {
  const { R, E, P, L } = World.shapes, K = World.kitM2, W = 2700, H = 1800;
  const pans = [], dikes = [];
  // a grid of 3 x 2 pans with sand dikes between them (dikes stay walkable "sand", pans are salt)
  const cols = [[300, 760], [900, 1360], [1500, 1960]], rows = [[260, 760], [900, 1400]];
  rows.forEach(r => cols.forEach(c => pans.push(["salt", R(c[0], r[0], c[1] - c[0], r[1] - r[0])])));
  const def = {
    name: "Saltpan Works", ground: "assets/regions/saltpanWorks.jpg", w: W, h: H, music: "desert", rim: 40,
    look: "An abandoned salt works seen from above: rectangular pale cracked white-and-pink salt evaporation pans divided by low sand and mud dikes, a few small wooden huts and drying racks, a half-buried old wooden barge, golden sand around, dark red rock at the edges.",
    legend: { sand: "golden desert sand and low dikes of packed earth", salt: "white cracked salt pan with pink crystals", road: "a worn dirt track", paved: "old wooden planks and stone", rock: "dark red rock outcrops" },
    guide: [
      ...pans, ["salt", E(2350, 1000, 260, 330)], ["salt", E(2350, 450, 230, 150)],
      ["road", L([[1350, 1780], [1350, 1500], [830, 830], [830, 300]], 56)], ["road", L([[1350, 1500], [1730, 1500], [2000, 1000], [2350, 1000]], 50)], ["road", L([[1730, 830], [2350, 450]], 48)], ["paved", R(220, 1480, 240, 120)],
      ["rock", P(K.blobPts(2500, 1600, 300, 180, 1701, { jag: 0.14 }))], ["rock", P(K.blobPts(180, 1060, 150, 280, 1702, { jag: 0.14 }))], ["rock", P(K.blobPts(900, 130, 330, 90, 1703, { jag: 0.14 }))], ["rock", P(K.blobPts(2420, 140, 300, 100, 1704, { jag: 0.14 }))], ["rock", P(K.blobPts(450, 1700, 260, 100, 1705, { jag: 0.14 }))],
    ],
    entries: { start: { x: 1350, y: 1650, face: "up" }, from_amberBasin: { x: 1350, y: 1650, face: "up" } },
    exits: [{ rect: [1290, 1710, 130, 50], to: "amberBasin", entry: "from_saltpanWorks", push: [0, -1] }],
    triggers: [{ id: "saltpanArrive", rect: [1290, 1560, 150, 90] }],
    chests: [{ id: "saltChest1", x: 2350, y: 1100 }, { id: "saltChest2", x: 340, y: 1540 }],
    gather: [{ id: "saltRake", x: 1740, y: 880, label: "A fresh crust on the pan", color: "gold" }],
    npcs: [{ id: "panLedger", art: "clerkDesk", name: "Pan-keeper's desk", x: 330, y: 1420, hint: "E / Space: read the ledger" }, { id: null, art: "npcMiner", x: 1100, y: 1100, path: [[1100, 1100], [1300, 1000], [1100, 1100]], speed: 12, loop: true }],
    props: [
      ["saltCrystal", 600, 480], ["saltCrystal", 1180, 1180], ["saltCrystal", 1760, 520], ["saltCrystal", 2000, 1200, {}], ["saltCrystal", 2400, 380],
      ["crates", 420, 1470, {}], ["barrel", 480, 1500], ["tent", 380, 1580, {}], ["hayBales", 270, 1500], ["trough", 520, 1550], ["rowboatMoored", 2080, 1500, { solid: [34, 12] }], ["harborShip", 2260, 1340, { solid: [60, 20] }],
      ["camelBones", 1000, 1000], ["skull", 1500, 700], ["deadTree", 780, 1500], ["cairn", 1300, 1700], ["cairn", 840, 220],
    ],
    scatter: [{ keys: [["saltCrystal", 4], ["bones", 1], ["skull", 1]], n: 60, on: ["salt"], seed: 1701 }, { keys: [["grass", 3], ["grass2", 3], ["cactus", 1], ["shrub", 2], ["sandBoulder", 1], ["bones", 1]], n: 100, seed: 1702 }],
    encounter: { table: "basin", rate: 38 },
    amb: { birds: 3, water: false, dust: 0xf0e0d0, motes: 50, tint: [0x4a3038, 0.12], sparkle: { terrain: ["salt"], color: 0xfff0f0, rate: 6 } },
  };
  World.def("saltpanWorks", def);
})();
