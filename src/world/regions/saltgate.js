// R2 Saltgate: walled harbour city, lighthouses, docks. No encounters. NPC ids: innkeeper (Gull and Anchor), merchant, r1 r2 r3, smuggler (the boat to Ixcalo), customsOfficer.
// Trigger boatToIxcalo (end of the north pier) = end of chapter 2 voyage.
(function () {
  const { R, E, P, L } = World.shapes;
  World.def("saltgate", {
    name: "Saltgate", w: 1700, h: 1150, music: "town", rim: 44, base: "paved",
    look: "A walled desert harbour city seen from above: sandstone flagstone streets and plazas, a wide blue-green sea along the east with wooden piers and stone quays, busy docks. Dusky and shady.",
    legend: { paved: "worn sandstone flagstones, rope-worn, sandy at the edges", water: "deep blue-green harbour sea water with small waves and foam", floor: "dark weathered wooden dock planks", road: "a dirt road leading out of the west gate", wall: "thick sandstone city wall top", rock: "rough dark rock" },
    guide: [
      ["water", P([[1180, 0], [1700, 0], [1700, 1150], [1250, 1150], [1200, 900], [1240, 600], [1180, 300]])],
      ["floor", R(1150, 300, 330, 56)], ["floor", R(1480, 270, 170, 120)], ["floor", R(1460, 610, 190, 120)], ["floor", R(1160, 640, 300, 56)], ["floor", R(1170, 900, 240, 56)], ["paved", R(1100, 150, 120, 900)],
      ["road", L([[0, 560], [200, 560]], 110)], ["wall", R(60, 90, 1100, 26)], ["wall", R(60, 1010, 1100, 26)], ["wall", R(60, 90, 26, 400)], ["wall", R(60, 650, 26, 386)],
    ],
    entries: { start: { x: 190, y: 580, face: "right" }, from_basin: { x: 190, y: 580, face: "right" }, from_sea: { x: 1290, y: 930, face: "left" }, inn: { x: 470, y: 410, face: "down" } },
    exits: [{ rect: [40, 500, 60, 120], to: "amberBasin", entry: "from_saltgate", push: [1, 0] }, { rect: [1350, 902, 56, 52], to: "weepingSea", entry: "from_saltgate", push: [-1, 0], floor: "floor", show: "ship" }],
    triggers: [{ id: "boatToIxcalo", rect: [1400, 290, 70, 76] }],
    props: [
      ["harborInn", 460, 300], ["customsHouse", 760, 260], ["dockWarehouse", 960, 420], ["harborHouse", 300, 780], ["harborHouse", 560, 800], ["harborHouse", 830, 820], ["harborHouse", 300, 220], ["harborHouse", 170, 900],
      ["fishStall", 640, 560], ["fishStall", 760, 640], ["crates", 1010, 640], ["crates", 1050, 330], ["netRack", 1130, 500], ["netRack", 1120, 780], ["anchor", 1090, 560], ["bollards", 1190, 350], ["bollards", 1210, 690], ["bollards", 1210, 940],
      ["fishBarrels", 1280, 330], ["fishBarrels", 1320, 670], ["craneHoist", 1060, 940], ["rowboatMoored", 950, 960], ["harborShip", 1450, 480, { shadow: false }], ["harborShip", 1470, 800, { shadow: false }], ["lighthouse", 1590, 380], ["lighthouse", 1580, 722],
      ["pierLamp", 1180, 340], ["pierLamp", 1430, 350], ["pierLamp", 1180, 680], ["pierLamp", 1440, 690], ["pierLamp", 1190, 930], ["lampPost", 300, 520], ["lampPost", 620, 520], ["lampPost", 900, 520], ["whiteColumn", 120, 520],
      ["scholarBanner", 400, 360], ["scholarBanner", 560, 380], ["tent", 140, 760, {}], ["hayBales", 700, 920], ["crates", 420, 900], ["terracottaJars", 520, 940],
    ],
    scatter: [{ keys: [["crates", 1], ["fishBarrels", 1], ["terracottaJars", 1], ["hayBales", 1], ["bollards", 1], ["bones2", 1]], n: 24, on: ["paved"], seed: 61 }, { keys: [["grass", 1], ["shrub", 1], ["oliveTree", 1]], n: 10, on: ["paved"], seed: 62 }],
    npcs: [
      { id: "innkeeper", art: "innkeeper", name: "Innkeeper", x: 460, y: 352 },
      { id: "merchant", art: "merchant", name: "Merchant", x: 640, y: 596 },
      { id: "customsOfficer", art: "npcLegionGuard", name: "Customs officer", x: 760, y: 312 },
      { id: "smuggler", art: "npcHooded", name: "Hooded man", x: 1330, y: 330 },
      { id: "caravanMaster", art: "npcTrader", name: "Caravan master", x: 300, y: 590, show: ["ch5.start", "!ch5.orun"] },
      { id: "r1", art: "npcSailor", name: "Sailor", x: 1000, y: 580 },
      { id: "r2", art: "npcFisher", name: "Fisherman", x: 1250, y: 720 },
      { id: "r3", art: "npcDockhand", name: "Dockhand", x: 900, y: 880 },
      { id: null, art: "npcVillagerF", x: 500, y: 520, path: [[250, 560], [700, 560], [700, 700], [350, 700]], loop: true, speed: 26 },
      { id: null, art: "npcSailor", x: 1250, y: 460, path: [[1130, 460], [1270, 460]], speed: 20 },
      { id: null, art: "npcChild", x: 800, y: 700, path: [[600, 720], [900, 720]], speed: 38 },
    ],
    amb: { birds: 7, butterflies: [], dust: 0xd8d0c0, motes: 36, tint: [0x2a2a4a, 0.14], water: true },
  });
})();
