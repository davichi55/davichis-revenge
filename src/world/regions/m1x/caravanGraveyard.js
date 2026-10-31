// CH1-EXPAND: Caravan Graveyard (south-west of the Whisperglass Dunes): a dry salt bed where caravans died, wrecked wagons, bleached bones, a scraped tally board, a track east to the Dry Waystation. Table "dunes" 40 s.
// Entries: start / from_dunes (N), from_dryWaystation (E). Exits: whisperglassDunes@from_caravanGraveyard, dryWaystation@from_caravanGraveyard.
(function () {
  const { R, E, P, L } = World.shapes, K = World.kitM2, W = 3150, H = 2100;
  const bed = K.blobPts(1450, 1000, 780, 420, 1301, { jag: 0.12 }), bleach = [K.blobPts(2300, 600, 300, 160, 1311, { jag: 0.14 }), K.blobPts(700, 1600, 330, 170, 1312, { jag: 0.14 }), K.blobPts(2450, 1500, 280, 150, 1313, { jag: 0.14 })];
  const mas = [K.blobPts(2750, 330, 330, 230, 1321, { jag: 0.12 }), K.blobPts(300, 420, 280, 230, 1322, { jag: 0.12 }), K.blobPts(420, 1800, 260, 150, 1323, { jag: 0.14 }), K.blobPts(1300, 1830, 300, 150, 1324, { jag: 0.14 }), K.blobPts(2900, 1100, 180, 300, 1325, { jag: 0.14 }), K.blobPts(900, 280, 200, 120, 1326, { jag: 0.14 })];
  const road = K.wob([[1575, 20], [1500, 450], [1380, 900], [1700, 1300], [2200, 1560], [3110, 1610]], 30, 1331, 130);
  const def = {
    name: "Caravan Graveyard", ground: "assets/regions/caravanGraveyard.jpg", w: W, h: H, music: "desert", rim: 40,
    look: "A dry desert seen from above: pale cracked salt bed and bleached bone-white ground in the middle, golden sand around it, many wrecked wooden wagons and carts, scattered animal bones and ribs, dead trees, dark rock outcrops, a faint worn caravan road.",
    legend: { sand: "golden desert sand with ripples", salt: "pale cracked dry salt bed", bone: "bleached bone-white dusty ground with small bones", road: "a worn caravan road with wheel ruts", rock: "dark brown wind-carved rock outcrops" },
    guide: [
      ["salt", P(bed)], ...bleach.map(p => ["bone", P(p)]), ["road", L(road, 56)], ["road", L([[1500, 1300], [1000, 1500], [640, 1620]], 48)], ["road", L([[1380, 900], [2050, 650], [2300, 600]], 48)],
      ...mas.map(p => ["rock", P(p)]),
    ],
    entries: { start: { x: 1575, y: 160, face: "down" }, from_dunes: { x: 1575, y: 160, face: "down" }, from_dryWaystation: { x: 3000, y: 1610, face: "left" } },
    exits: [
      { rect: [1510, 40, 130, 50], to: "whisperglassDunes", entry: "from_caravanGraveyard", push: [0, 1] },
      { rect: [3054, 1550, 56, 120], to: "dryWaystation", entry: "from_caravanGraveyard", push: [-1, 0] },
    ],
    triggers: [{ id: "duskWhisperer", rect: [800, 1000, 160, 120], once: false, when: "dunes.dusk" }, { id: "graveyardArrive", rect: [1500, 220, 150, 90] }],
    chests: [{ id: "graveChest1", x: 2780, y: 540 }, { id: "graveChest2", x: 520, y: 1650 }],
    gather: [{ id: "shardHeap", x: 1260, y: 1590, label: "A great shell under the wagon", color: "gold" }, { id: "tallyBox", x: 2250, y: 720, label: "A strongbox under a wagon", color: "gold", show: "tally.started" }],
    npcs: [{ id: "tallyBoard", art: "noticeBoard", name: "Tally board", x: 1620, y: 420, hint: "E / Space: read the board" }],
    props: [
      ["supplyWagon", 1200, 700], ["cart", 1750, 640], ["supplyWagon", 2260, 790], ["cart", 1900, 1100], ["supplyWagon", 1000, 1250], ["cart", 600, 1350], ["cart", 2500, 1350], ["supplyWagon", 1500, 1500], ["cart", 800, 520], ["crates", 1240, 770, {}], ["crates", 2310, 840, {}], ["barrel", 2210, 840], ["barrel", 1830, 680],
      ["camelBones", 1100, 900], ["camelBones", 1600, 1000], ["camelBones", 2000, 1400], ["camelBones", 700, 1100], ["ribs", 1400, 560], ["ribs", 2000, 900], ["skullPile", 1500, 800, { solid: [14, 8] }], ["deadTree", 1300, 1100], ["deadTree", 2100, 1000], ["deadTree", 900, 1400], ["cairn", 1560, 120], ["cairn", 3010, 1560],
      ["tent", 1950, 1300, {}], ["hayBales", 1450, 1380],
    ],
    scatter: [
      { keys: [["bones", 3], ["skull", 2], ["ribs", 1], ["grass", 2], ["grass2", 2]], n: 160, seed: 1301, scaleRange: [0.9, 1.1] },
      { keys: ["sandBoulder", "rocks", "boulder", "cactus", "deadTree", "camelBones", "shrub"], n: 90, seed: 1302 },
      { keys: [["saltCrystal", 3], ["bones", 1], ["skull", 1]], n: 40, on: ["salt"], seed: 1303 },
    ],
    encounter: { table: "dunes", rate: 40 },
    amb: {
      birds: 3, water: false, dust: 0xe8d8b8, motes: 50, tint: [0x4a3a3a, 0.18],
      armies: [{ id: "patrol1", lane: [[1700, 1300], [2200, 1560], [2700, 1560], [2200, 1560]], mode: "pingpong", speed: 34, rows: 2, cols: 3, sight: 210, table: "dunes" }],
      wrecks: [[1000, 1650], [2300, 1150]],
    },
  };
  World.def("caravanGraveyard", def);
})();
