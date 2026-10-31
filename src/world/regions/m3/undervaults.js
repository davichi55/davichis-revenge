// M3 / ch5: the Undervaults (dungeon, dark). Table "vault" 22 s. Entries start from_ashenOrun from_coldVaults from_ashenCanyon. Exits ashenOrun@from_undervaults, coldVaults@from_undervaults, ashenCanyon@from_undervaults (the drain, show ch5.logs=5).
// NPC/interact ids: dataLog1..5 (cabinets; dataLog5 shows ch5.s5), courierDesk (show ch5.s5). Triggers: kessaScene (west reading room), s5Fight (great archive door), escapeStart (show ch5.logs=5). Chest g26_stonegazeOrder (show ch5.s5).
(function () {
  const { R, E, P, L } = World.shapes, M = World.m3, props = [], blue = 0x9fc8ff;
  // upper wing (empire guards): colonnade, standards, a guard post
  props.push(...M.row("builderPillar", 560, 330, 1840, 330, 8, {}, 0, 1), ...M.row("builderPillar", 560, 600, 1840, 600, 8, {}, 0, 2), ["legionStandard", 1000, 380], ["legionStandard", 1400, 380], ["weaponRack", 1220, 520], ["campCrates", 1520, 540], ["campCrates", 880, 540], ["campfire", 1210, 440], ["lightStele", 700, 470], ["lightStele", 1740, 470]);
  props.push(["copyTube", 960, 190], ["copyTube", 1440, 190], ["builderConduit", 1100, 160], ["builderConduit", 1300, 160], ["lightStele", 1010, 290], ["lightStele", 1390, 290]);
  // west reading room: green-lamp tables and shelves
  props.push(["bookShelfTall", 150, 440], ["bookShelfTall", 290, 440], ["bookShelfTall", 430, 440], ["bookShelfLow", 560, 450], ["studyTable", 250, 600], ["studyTable", 420, 640], ["studyChair", 215, 650], ["studyChair", 455, 690], ["readingLamp", 340, 560], ["readingLamp", 540, 700], ["bookPile", 160, 700], ["scrollRack", 150, 560], ["roundRug", 330, 620, { solid: false }]);
  // central archive: cabinet rows (the glowing ones hold the logs), copy-tubes along the middle
  props.push(...M.row("archiveCabinet", 480, 760, 1840, 760, 11, {}, 0, 3), ...M.row("archiveCabinet", 560, 1000, 960, 1000, 4, {}, 0, 4), ...M.row("archiveCabinet", 1380, 1000, 1760, 1000, 4, {}, 0, 5), ...M.row("copyTube", 640, 900, 1760, 900, 6, {}, 0, 6));
  props.push(["archiveCabinetGlow", 620, 1000], ["archiveCabinetGlow", 1700, 760], ["archiveCabinetGlow", 1380, 1000], ["archiveCabinetGlow", 800, 1160], ["vaultClerkDesk", 1170, 1050], ["studyChair", 1170, 1090], ["readingLamp", 1060, 1080], ["lightStele", 500, 880], ["lightStele", 1860, 880], ["builderConduit", 1200, 840]);
  // lower wing: ice creeping in, frozen cabinets, the cold-vault door and the drain
  props.push(["iceCluster", 560, 1330, {}], ["iceSpire", 700, 1280], ["iceCluster", 900, 1480], ["iceSpire", 1060, 1520], ["iceCluster", 1300, 1340], ["iceSpire", 1500, 1300], ["iceCluster", 1700, 1500], ["iceSpire", 1880, 1420], ["iceCluster", 2080, 1560], ["iceSpire", 2200, 1340],
    ["archiveCabinet", 520, 1520, { tint: blue }], ["archiveCabinet", 1220, 1560, { tint: blue }], ["archiveCabinet", 1640, 1260, { tint: blue }], ["builderPillar", 780, 1400], ["builderPillar", 1440, 1420], ["builderPillar", 1980, 1300], ["vaultRubble", 380, 1500], ["builderDoor", 2310, 1380, { tint: 0xbfe2ff }], ["pipeRun", 330, 1560], ["leakPipe", 450, 1580], ["puddle", 400, 1600, { solid: false }]);
  // the great archive: star-metal door (shut until the warden falls), chamber in front, inner archive behind it
  props.push(["greatArchiveDoor", 2140, 720, { hide: "ch5.s5", solid: [102, 20] }], ["greatArchiveDoorOpen", 2140, 720, { show: "ch5.s5" }], ["lightStele", 2020, 860], ["lightStele", 2260, 860], ["builderPillar", 1990, 790], ["builderPillar", 2290, 790], ["ashBrazier", 2060, 940, { fire: [0, -42, 0.8] }], ["ashBrazier", 2230, 940, { fire: [0, -42, 0.8] }],
    ...M.row("archiveCabinet", 2020, 160, 2280, 160, 3, {}, 0, 7), ["archiveCabinet", 2020, 300], ["archiveCabinet", 2280, 300], ["archiveCabinetGlow", 2140, 190], ["copyTube", 2030, 430], ["copyTube", 2260, 430], ["readingLamp", 2100, 520], ["vaultClerkDesk", 2060, 400, { show: "ch5.s5" }]);
  World.def("undervaults", {
    name: "The Undervaults", w: 2400, h: 1700, base: "rock", music: "vault", rim: 44,
    look: "Builder vaults beneath a laboratory seen from above: black stone floor inlaid with thin gold light-lines in geometric patterns, long archive halls, a wide hall with a colonnade, a west reading room with green lamps, ice crystals and frost creeping over the lower wing, a drain in the south-west corner. Cold, ancient, eerie blue and gold light.",
    legend: { floor: "black star-metal stone floor with fine gold inlay light-lines and dust", paved: "pale worn flagstones of the reading room, grey-brown with dry paper scraps", salt: "white hoarfrost and ice on the black floor, cracked, blue-white", rock: "solid black vault walls and shelving blocks" },
    bank: { floor: "grey", paved: "grey", salt: "salt" }, grade: { floor: { mul: [0.4, 0.46, 0.62], add: [0, 4, 10] }, paved: { mul: [0.9, 1.0, 0.95], add: [-8, -4, -6] }, salt: { mul: [0.78, 0.95, 1.2], add: [-10, 6, 26] }, _: [0.95, 1.0, 1.08] },
    marks: [{ k: "crack", on: ["floor"], n: 40, col: [220, 180, 90], a: 0.6, len: [20, 70] }, { k: "dot", on: ["salt"], n: 80, col: [230, 245, 255], a: 0.8, r: [1, 2], hi: false }],
    guide: [
      ["floor", R(880, 60, 640, 300)], ["floor", R(500, 300, 1400, 330)], ["paved", R(90, 380, 520, 380)], ["floor", R(560, 460, 120, 120)], ["floor", R(1000, 600, 400, 140)], ["floor", R(400, 700, 1500, 490)],
      ["floor", R(1850, 880, 120, 130)], ["floor", R(1900, 720, 400, 300)], ["floor", R(2050, 520, 180, 220)], ["floor", R(1980, 60, 320, 500)],
      ["floor", R(300, 1180, 1700, 420)], ["salt", E(700, 1420, 260, 120)], ["salt", E(1500, 1450, 300, 120)], ["salt", E(2000, 1450, 200, 130)], ["floor", R(1990, 1340, 400, 180)], ["floor", R(300, 1560, 160, 90)],
    ],
    entries: { start: { x: 1200, y: 150, face: "down" }, from_ashenOrun: { x: 1200, y: 150, face: "down" }, from_coldVaults: { x: 2290, y: 1460, face: "left" }, from_ashenCanyon: { x: 380, y: 1585, face: "up" } },
    exits: [
      { rect: [1140, 0, 120, 70], to: "ashenOrun", entry: "from_undervaults", push: [0, 1] },
      { rect: [2330, 1400, 70, 120], to: "coldVaults", entry: "from_undervaults", push: [-1, 0] },
      { rect: [300, 1640, 140, 60], to: "ashenCanyon", entry: "from_undervaults", push: [0, -1], show: "ch5.logs=5" },
    ],
    triggers: [
      { id: "kessaScene", rect: [160, 500, 380, 200] }, { id: "s5Fight", rect: [2040, 800, 200, 120] },
      { id: "escapeStart", rect: [1840, 860, 140, 170], show: "ch5.logs=5" },
    ],
    chests: [{ id: "g26_stonegazeOrder", x: 2240, y: 220, show: "ch5.s5" }],
    npcs: [
      { id: "dataLog1", art: null, name: "Archive cabinet", x: 622, y: 1022, hint: "E / Space: open the cabinet" },
      { id: "dataLog2", art: null, name: "Archive cabinet", x: 1700, y: 782, hint: "E / Space: open the cabinet" },
      { id: "dataLog3", art: null, name: "Archive cabinet", x: 1382, y: 1022, hint: "E / Space: open the cabinet" },
      { id: "dataLog4", art: null, name: "Archive cabinet", x: 802, y: 1182, hint: "E / Space: open the cabinet" },
      { id: "dataLog5", art: null, name: "The heart of the archive", x: 2140, y: 212, hint: "E / Space: open the cabinet", show: "ch5.s5" },
      { id: "courierDesk", art: "npcCourier", name: "Copyist", x: 2062, y: 428, show: "ch5.s5" },
      { id: null, art: "npcLegionGuard", x: 1050, y: 440, still: true }, { id: null, art: "npcLegionGuard", x: 1380, y: 470, still: true }, { id: null, art: "npcLegionGuard", x: 900, y: 570, path: [[760, 570], [1020, 570]], speed: 22 },
    ],
    props,
    scatter: [{ keys: [["bookPile", 2], ["vaultRubble", 1], ["bones", 1]], n: 24, on: ["floor", "paved"], seed: 41, scaleRange: [0.8, 1] }],
    lights: [[1210, 440, 160, 0.9], [560, 700, 110, 0.6], [340, 560, 110, 0.7], [1060, 1080, 110, 0.6], [2060, 940, 130, 0.8], [2230, 940, 130, 0.8], [2140, 300, 160, 0.8], [2310, 1380, 120, 0.7], [700, 1420, 110, 0.5], [1500, 1450, 110, 0.5]],
    dark: { ambient: 0.62, radius: 210, color: 0x04060e },
    encounter: { table: "vault", rate: 22 },
    amb: { birds: 0, butterflies: [], motes: 50, dust: 0x9fb8e0, tint: [0x102040, 0.12], drips: [[430, 1580], [1000, 1500], [1700, 1520]], sparkle: { terrain: ["salt"] } },
  });
})();
