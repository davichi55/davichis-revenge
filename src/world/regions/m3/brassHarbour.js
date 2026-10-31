// M3 / ch6: Brass Harbour, the shipyard city (town, no fights). Entries start from_haldarsReach from_sea from_kharamRoad inn. Exits haldarsReach@from_brassHarbour (W caravan gate), kharamRoad@from_brassHarbour (E road), weepingSea@from_brassHarbour (the berth, need ship).
// NPC ids: innkeeper merchant yusra captain (aboard) r1 r2 r3 shipwright purser. Triggers: harbourArrive, blockadeS7 (on the pier, before the berth), customsCharter (customs house door).
(function () {
  const { R, E, P, L } = World.shapes, M = World.m3, props = [], cu = 0xbfe8d4;   // green-copper roof tint
  // west: customs house, warehouses, guild sign; north: copper-roofed houses and the inn along the road
  props.push(["customsHouse", 230, 560, { tint: cu }], ["dockWarehouse", 420, 500, { tint: 0xd8e8d8 }], ["harborInn", 640, 520, { tint: cu }], ["harborHouse", 790, 330, { tint: cu }], ["harborHouse", 930, 250, { tint: cu }], ["harborHouse", 1090, 330, { tint: cu }], ["harborHouse", 520, 280, { tint: cu }], ["harborHouse", 330, 330, { tint: cu }],
    ["shopHouse", 1220, 280, { tint: cu }], ["harborHouse", 150, 330, { tint: cu }], ["whiteHouse", 1400, 240, { tint: cu }], ["harborHouse", 1560, 300, { tint: cu }], ["dockWarehouse", 220, 220, { tint: 0xd8e8d8 }], ["noticeBoard", 90, 640, { tint: 0xcfe8ff }]);
  props.push(...M.row(["pierLamp", "lampPost"], 160, 640, 1560, 640, 10, {}, 0, 2), ["noticeBoard", 1020, 660], ["amberStall", 1180, 680], ["fishStall", 560, 700], ["fishStall", 1300, 700], ["fishBarrels", 480, 730], ["fishBarrels", 1360, 740], ["crates", 300, 740], ["crates", 1440, 700], ["bollards", 730, 800], ["bollards", 980, 800], ["bollards", 340, 800], ["bollards", 1220, 800], ["anchor", 600, 790], ["craneHoist", 1130, 790], ["craneHoist", 200, 790], ["netRack", 900, 450]);
  // shipyard in the east: hulls on slips, ropewalk of coils and posts, cranes, timber
  props.push(["m2_boatHull", 1210, 520], ["harborShip", 1420, 560, { shadow: false, tint: 0xe0d0b0 }], ["m2_boatHull", 1530, 440], ["craneHoist", 1330, 470], ["m2_cargoBales", 1150, 450], ["m2_cargoBales", 1590, 650], ["m2_dockPosts", 1120, 620], ["m2_dockPosts", 1500, 740], ["campCrates", 1260, 690], ["tent", 1480, 380, { tint: 0xe0d0b0 }], ["m2_waterBarrel", 1210, 440], ["m2_oarRack", 1360, 380], ["m2_netPile", 1050, 560]);
  props.push(...M.row("m2_dockPosts", 1000, 450, 1000, 580, 3, {}, 0, 8), ["lighthouse", 1600, 780]);
  // water: the Salt Heron at the berth, other hulls at anchor, rowboats, piers with lamps
  props.push(["harborShip", 1070, 950, { shadow: false, tint: 0xd0c8b0 }], ["harborShip", 480, 960, { shadow: false }], ["harborShip", 1340, 930, { shadow: false, tint: 0xc0d0d8 }], ["rowboatMoored", 640, 880], ["rowboatMoored", 1210, 900, { flip: true }], ["rowboatMoored", 300, 900], ["pierLamp", 800, 880], ["pierLamp", 900, 880], ["pierLamp", 800, 1000], ["pierLamp", 900, 1000], ["bollards", 805, 930], ["bollards", 870, 1040], ["fishBarrels", 760, 860], ["crates", 930, 880]);
  World.def("brassHarbour", {
    name: "Brass Harbour", w: 1700, h: 1100, base: "water", music: "harbour", rim: 44,
    look: "A busy shipyard harbour city seen from above: stone quays and cobbled streets, green-copper roofs, cranes and slipways with half-built hulls in the east, warehouses and a customs house in the west, wooden piers reaching into grey-green harbour water at the south, ropewalks, crates, fishing nets. Salt wind, working-class pride, bright overcast light.",
    legend: { paved: "grey-brown harbour cobblestones and quay flagstones, damp, with rope scraps and fish scales", road: "packed brown dirt road with cart ruts and puddles", sand: "pale trampled sand and wood shavings of the shipyard", shallow: "pale green shallow harbour water over stone", water: "deep grey-green harbour water with small waves and foam against the quay", wall: "stone quay wall tops", rock: "dark harbour breakwater rocks", grass: "wind-flattened coastal grass" },
    bank: { paved: "grey", road: "dirt", sand: "sand", water: "water", shallow: "teal" }, grade: { paved: { mul: [0.95, 1.0, 0.98], add: [4, 6, 4] }, water: { mul: [0.95, 1.35, 1.2], add: [4, 14, 10] }, shallow: { mul: [0.9, 1.1, 1.0], add: [10, 20, 14] }, grass: { mul: [0.9, 1.0, 0.9], add: [4, 6, 0] }, _: [1.0, 1.0, 1.0] },
    marks: [{ k: "dot", on: ["paved", "sand"], n: 90, col: [70, 60, 50], a: 0.5, r: [1, 2.2] }],
    guide: [
      ["paved", R(60, 640, 1580, 180)], ["paved", R(60, 100, 1580, 540)], ["road", L([[44, 440], [600, 440], [1100, 440], [1700, 440]], 110)], ["road", L([[800, 440], [800, 640]], 90)], ["grass", E(250, 120, 160, 40)],
      ["sand", R(1050, 410, 580, 330)], ["paved", R(780, 820, 140, 280)], ["shallow", R(760, 800, 180, 50)], ["paved", R(250, 820, 60, 60)], ["paved", R(1190, 820, 60, 90)], ["paved", R(560, 820, 70, 60)],
      ["shallow", R(44, 820, 700, 40)], ["shallow", R(940, 820, 710, 40)],
    ],
    entries: { start: { x: 800, y: 580, face: "down" }, from_haldarsReach: { x: 150, y: 450, face: "right" }, from_kharamRoad: { x: 1560, y: 450, face: "left" }, from_sea: { x: 850, y: 1010, face: "up" }, inn: { x: 640, y: 600, face: "down" } },
    exits: [
      { rect: [0, 380, 80, 120], to: "haldarsReach", entry: "from_brassHarbour", push: [1, 0] },
      { rect: [1620, 380, 80, 120], to: "kharamRoad", entry: "from_brassHarbour", push: [-1, 0] },
      { rect: [790, 1040, 120, 60], to: "weepingSea", entry: "from_brassHarbour", push: [0, -1], need: "ship", floor: "paved" },
    ],
    triggers: [{ id: "harbourArrive", rect: [680, 480, 240, 130] }, { id: "blockadeS7", rect: [770, 900, 160, 60] }, { id: "customsCharter", rect: [190, 600, 100, 60] }],
    npcs: [
      { id: "innkeeper", art: "npcVillagerF", name: "Innkeeper", x: 700, y: 590 }, { id: "merchant", art: "npcTrader", name: "Merchant", x: 1060, y: 700 }, { id: "yusra", art: "npcHooded", name: "Harbourmaster Yusra Daal", x: 880, y: 700 },
      { id: "captain", art: "npcBrisk", name: "Captain Brisk", x: 890, y: 925 }, { id: "shipwright", art: "npcDockhand", name: "Shipwright", x: 1330, y: 640 }, { id: "purser", art: "npcSailor", name: "Ship purser", x: 820, y: 960 },
      { id: "r1", art: "npcDockhand", name: "Docker", x: 460, y: 700 }, { id: "r2", art: "npcFisher", name: "Fisher", x: 600, y: 740 }, { id: "r3", art: "npcVillagerM", name: "Rope-maker", x: 1180, y: 590 },
      { id: null, art: "npcSailor", x: 700, y: 720, path: [[350, 720], [1100, 720]], speed: 26 }, { id: null, art: "npcDockhand", x: 1420, y: 640, path: [[1250, 640], [1500, 640]], speed: 20 }, { id: null, art: "npcGuard", x: 300, y: 620, still: true }, { id: null, art: "npcVillagerF", x: 900, y: 420, path: [[500, 420], [1000, 420]], speed: 22 },
    ],
    gather: [{ id: "wrackKelp1", x: 330, y: 790, label: "Kelp on the pilings", color: 0x9a8a50 }, { id: "wrackKelp2", x: 1290, y: 780, label: "Kelp laid out to dry", color: 0x9a8a50 }],
    props,
    scatter: [{ keys: [["crates", 2], ["fishBarrels", 1], ["m2_cargoBales", 1], ["bollards", 1]], n: 16, on: ["paved", "sand"], seed: 71, scaleRange: [0.8, 1.0] }],
    encounter: { table: null, rate: 0 },
    amb: { birds: 8, butterflies: [], water: true, dust: 0xd8d8d0, motes: 26, tint: [0x2a3a40, 0.08] },
  });
})();
