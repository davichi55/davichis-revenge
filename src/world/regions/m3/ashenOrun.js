// M3 / ch5: Ashen Orun, the Academy city under occupation (empire zone, table "occupied", legion patrols that hunt you, a stand-off, ash fall).
// NPC ids: checkpointSoldier sarn apprentice1..3 printer r1 r2 r3 wardenSign. Triggers: orunArrive labGateS4 studyDoor. Chest orunStash. Legend L4 (shared with kharamRoad).
// Exits: whisperglassDunes@from_orun (S gate), orunMemoryRoom@from_ashenOrun (study door, need ch5.s4), undervaults@from_ashenOrun (vault stair, need ch5.s4). Entries: start from_dunes from_undervaults from_memoryRoom.
(function () {
  const { R, E, P, L } = World.shapes, M = World.m3, props = [];
  // the three lamp bridges over the canal, banners and lamps along the main avenue
  for (const bx of [480, 1200, 1560]) props.push(["lampPost", bx - (bx === 1200 ? 130 : 70), 790], ["lampPost", bx + (bx === 1200 ? 130 : 70), 790], ["dominionBanner", bx - (bx === 1200 ? 130 : 70), 870], ["dominionBanner", bx + (bx === 1200 ? 130 : 70), 870]);
  props.push(...M.row(["lampPost", "dominionBanner"], 1090, 1500, 1090, 930, 6, {}, 4, 3), ...M.row(["lampPost", "dominionBanner"], 1310, 1500, 1310, 930, 6, {}, 4, 4));
  props.push(
    // academy quarter
    ["academyHall", 1200, 410], ["whiteColumn", 1020, 440], ["whiteColumn", 1380, 440], ["dominionBanner", 1100, 470], ["dominionBanner", 1300, 470], ["legionStandard", 1160, 560], ["legionStandard", 1240, 560],
    ["burntLibrary", 640, 440], ["burntHouse", 360, 250], ["whiteHouse", 880, 230], ["burntHouse", 1560, 250], ["whiteHouse", 1460, 160], ["bellTower", 1560, 440], ["whiteHouse", 220, 480], ["burntHouse", 520, 220],
    ["toppledStatue", 900, 600], ["toppledStatue", 1470, 640], ["scholarStatue", 760, 640], ["fountain", 1200, 700, { solid: [40, 14] }], ["stoneBench", 1040, 660], ["stoneBench", 1360, 660],
    ["clerkDesk", 960, 640, {}], ["clerkDesk", 1440, 600], ["clerkDesk", 1010, 560], ["noticeBoard", 1075, 520],
    ["watchPost", 780, 560], ["watchPost", 1650, 610], ["legionTent", 300, 650], ["supplyWagon", 380, 720], ["campCrates", 470, 690], ["weaponRack", 230, 700],
    ["burntTree", 140, 330], ["burntTree", 420, 380], ["burntTree", 1000, 130], ["burntTree", 1330, 120], ["bookPile", 600, 540], ["bookPile", 720, 520], ["rubblePile", 560, 600],
    // lab district behind the fence: gate, dry fountain with the portable collar altar, labs, Ithiel's study, the vault stair
    ["ironFence", 1774, 520, {}], ["ironFence", 1774, 668, {}], ["dryFountain", 1960, 540], ["collarAltar", 1900, 610, { glow: "gold" }], ["torchPole", 1830, 500], ["torchPole", 1830, 690], ["legionStandard", 1850, 580],
    ["labHouse", 1900, 190], ["labHouse", 2190, 200], ["labHouse", 2260, 480], ["ithielStudy", 2040, 330], ["trapStair", 2230, 660], ["burntHouse", 1840, 300], ["campCrates", 2100, 700], ["bookPile", 2000, 440], ["rubblePile", 2140, 620],
    ["whiteColumn", 1980, 420], ["whiteColumn", 2100, 420], ["dominionBanner", 1960, 380], ["dominionBanner", 2120, 380],
    // south quarter: burnt book market, legion camp, houses, the south gate
    ["burntStall", 300, 960], ["burntStall", 440, 1010], ["burntStall", 640, 960], ["burntStall", 760, 1030], ["printingPress", 430, 1090], ["bookPile", 330, 1060], ["bookPile", 560, 1070], ["bookPile", 700, 1110], ["rubblePile", 250, 1150], ["rubblePile", 820, 1180],
    ["burntHouse", 240, 1300], ["burntHouse", 560, 1380], ["whiteHouse", 880, 1350], ["burntHouse", 150, 1480], ["whiteHouse", 420, 1500],
    ["legionTent", 1780, 1120], ["legionTent", 1960, 1190], ["legionTent", 1700, 1300], ["officersPavilion", 2120, 1100], ["supplyWagon", 1620, 1180], ["campCrates", 1860, 1300], ["weaponRack", 1900, 1100], ["weaponRack", 1660, 1060], ["spikeBarricade", 1480, 1110], ["spikeBarricade", 1480, 1260],
    ["campfire", 1860, 1230], ["barracksHall", 2200, 1380], ["whiteHouse", 1500, 1400], ["burntHouse", 1650, 1520], ["whiteHouse", 1930, 1520], ["barracksHall", 1520, 1560],
    ["spikeBarricade", 980, 1050], ["spikeBarricade", 1420, 960], ["spikeBarricade", 920, 1250], ["sandbagWall", 1010, 1450], ["sandbagWall", 1390, 1450], ["watchPost", 1000, 1580], ["watchPost", 1400, 1580], ["torchPole", 1110, 1600], ["torchPole", 1290, 1600],
    ["sunCalendarGate", 1200, 1652], ["dominionBanner", 1060, 1600], ["dominionBanner", 1340, 1600], ["pillory", 1050, 1180], ["noticeBoard", 1350, 1200],
    ["toppledStatue", 780, 1260], ["burntTree", 140, 1100], ["burntTree", 700, 1260], ["burntTree", 1000, 940], ["burntTree", 2280, 960], ["burntTree", 1600, 1000], ["deadTree", 1780, 1420]
  );
  World.def("ashenOrun", {
    name: "Ashen Orun", w: 2400, h: 1700, base: "paved", music: "occupied", rim: 44,
    look: "The Academy city of Orun under harsh military occupation, seen from above: pale limestone flagstone streets and plazas scorched and stained with soot and ash, a canal of grey-tinged water crossing the city with three arched bridges, dead burnt gardens, a fenced laboratory courtyard in the north-east, a trampled red-and-bronze legion camp in the south-east, a burnt book market in the south-west. Ashfall, bleak, hostile, dramatic dusk light.",
    legend: { paved: "pale white-cream limestone flagstones, cracked, soot-stained, with ash drifts, footprints and burnt paper scraps", ash: "burnt black ground: ash, charcoal, scorched paving and half-burnt book pages", grass: "dead trampled lawn terraces, ash-grey and brown with a few green blades", water: "a canal of dark blue-green water with grey ash floating on it and stone edges", road: "a trampled military dirt-and-cobble road with deep wheel ruts leading out through the south gate", floor: "a lab courtyard of pale grey flagstones with a worn star pattern and ash dust", wall: "pale limestone city and compound wall tops", sand: "bare churned dirt of the legion camp with boot prints, tent-stake holes, fire pits and straw", rock: "dark rock rim and outer wall" },
    detail: "ash drifts in the corners, boot prints, wheel ruts, scorch marks, scattered burnt book pages, dried bloodless stains, cracked paving, small puddles of grey water, a few red cloth scraps",
    guide: [
      ["ash", E(520, 1180, 380, 260)], ["ash", E(560, 560, 330, 150)], ["ash", E(300, 330, 190, 110)], ["ash", E(2280, 1000, 100, 160)], ["grass", E(1200, 200, 560, 110)], ["grass", E(1000, 130, 130, 50)], ["grass", E(300, 1500, 190, 80)],
      ["sand", E(1860, 1230, 380, 250)], ["sand", E(380, 690, 200, 100)], ["road", L([[1200, 1700], [1200, 1480]], 150)],
      ["water", R(44, 800, 2312, 60)], ["paved", R(400, 790, 140, 80)], ["paved", R(1080, 790, 240, 80)], ["paved", R(1500, 790, 130, 80)],
      ["wall", R(44, 1618, 1056, 30)], ["wall", R(1300, 1618, 1056, 30)], ["wall", R(1760, 44, 28, 476)], ["wall", R(1760, 660, 28, 140)],
      ["floor", R(1788, 60, 540, 730)], ["paved", E(1960, 540, 90, 70)],
    ],
    bank: { paved: "lime", ash: "dark", floor: "grey" },
    grade: { _: { mul: [0.9, 0.86, 0.9], add: [-4, -6, -4] }, paved: { mul: [0.82, 0.78, 0.76], add: [-6, -8, -8] }, ash: { mul: [1.5, 1.2, 1.1], add: [14, 6, 4] }, grass: { mul: [0.9, 0.8, 0.6], add: [14, 10, 4] }, floor: { mul: [0.95, 0.9, 0.95], add: [0, 0, 0] }, water: { mul: [0.9, 1.05, 1.05], add: [10, 14, 12] } },
    marks: [{ k: "blot", on: ["paved"], n: 22, col: [20, 16, 16], a: 0.22, r: [14, 44] }, { k: "dot", on: ["ash"], n: 120, col: [255, 110, 40], a: 0.7, r: [1, 1.8], hi: false }],
    entries: { start: { x: 1200, y: 1590, face: "up" }, from_dunes: { x: 1200, y: 1590, face: "up" }, from_undervaults: { x: 2230, y: 730, face: "up" }, from_memoryRoom: { x: 2040, y: 410, face: "down" } },
    exits: [
      { rect: [1140, 1650, 120, 50], to: "whisperglassDunes", entry: "from_orun", push: [0, -1] },
      { rect: [2005, 336, 70, 26], to: "orunMemoryRoom", entry: "from_ashenOrun", push: [0, 1], need: "ch5.s4" },
      { rect: [2195, 664, 70, 34], to: "undervaults", entry: "from_ashenOrun", push: [0, 1], need: "ch5.s4" },
    ],
    triggers: [{ id: "orunArrive", rect: [1060, 1440, 280, 110] }, { id: "labGateS4", rect: [1690, 520, 96, 140] }, { id: "studyDoor", rect: [1990, 372, 100, 50], show: "ch5.s4" }],
    chests: [{ id: "orunStash", x: 262, y: 1368 }],
    legends: [{ id: "L4", enemy: "oldHollowbell", level: 28, chance: 0.03, spots: [[1900, 1330], [600, 1580]] }],
    npcs: [
      { id: "checkpointSoldier", art: "npcLegionGuard", name: "Checkpoint soldier", x: 1120, y: 1545 },
      { id: "sarn", art: "npcSarn", name: "Tribune Sarn", x: 1832, y: 556 },
      { id: "apprentice1", art: "npcApprentice", name: "Clerk", x: 990, y: 650 }, { id: "apprentice2", art: "npcApprentice", name: "Clerk", x: 1470, y: 610, flip: true }, { id: "apprentice3", art: "npcApprentice", name: "Clerk", x: 1040, y: 570 },
      { id: "printer", art: "npcPrinter", name: "Printer", x: 470, y: 1100 },
      { id: "r1", art: "npcVillagerF", name: "Villager", x: 330, y: 1190 }, { id: "r2", art: "npcGranny", name: "Old woman", x: 650, y: 1120 }, { id: "r3", art: "npcVillagerM", name: "Villager", x: 520, y: 1320 },
      { id: "wardenSign", art: null, name: "Notice", x: 1075, y: 536, hint: "E / Space: read the notice" },
      { id: null, art: "npcLegionGuard", x: 1840, y: 480, still: true }, { id: null, art: "npcLegionGuard", x: 1840, y: 640 }, { id: null, art: "npcLegionGuard", x: 1930, y: 640 }, { id: null, art: "npcLegionGuard", x: 1930, y: 480 },
      { id: null, art: "npcVillagerF", x: 600, y: 1200, path: [[420, 1240], [800, 1240], [800, 1380], [420, 1380]], loop: true, speed: 24 },
      { id: null, art: "npcVillagerM", x: 1300, y: 1000, path: [[1180, 1000], [1250, 1300]], speed: 22 },
      { id: null, art: "npcApprentice", x: 900, y: 700, path: [[820, 700], [1100, 700]], speed: 20 },
    ],
    props,
    scatter: [
      { keys: [["bookPile", 3], ["rubblePile", 2], ["debris", 2], ["bones", 1]], n: 40, on: ["paved", "ash", "sand"], seed: 31, scaleRange: [0.8, 1.1] },
      { keys: [["burntTree", 1], ["deadTree", 1], ["campCrates", 1], ["toppledStatue", 1]], n: 14, on: ["ash", "grass"], seed: 32 },
    ],
    encounter: { zones: [{ rect: [1790, 44, 570, 760], table: null, rate: 0 }, { rect: [0, 0, 2400, 1700], table: "occupied", rate: 28 }] },
    amb: {
      birds: 0, butterflies: [], water: true, dust: 0xb8b0a8, motes: 50, tint: [0x4a2a34, 0.2], warm: [0xff7a40, 0.05], weather: ["ash", "clear"], smoke: [[640, 400, 0x555050], [360, 230, 0x555050], [1560, 230, 0x555050], [440, 1090, 0x555050], [560, 1370, 0x555050]],
      armies: [
        { id: "patrolW", lane: [[300, 740], [470, 740], [470, 940], [300, 940]], mode: "loop", speed: 34, rows: 2, cols: 3, sight: 230, table: "occupied", cry: "Halt! The Master's apprentice!" },
        { id: "patrolMid", lane: [[1000, 1010], [1400, 1010], [1400, 1280], [1000, 1280]], mode: "loop", speed: 36, rows: 2, cols: 4, sight: 240, table: "occupied" },
        { id: "patrolN", lane: [[760, 500], [1000, 480], [1000, 720], [760, 720]], mode: "loop", speed: 32, rows: 2, cols: 3, sight: 230, table: "occupied" },
        { id: "patrolE", lane: [[1440, 740], [1640, 740], [1640, 560]], mode: "pingpong", speed: 30, rows: 2, cols: 3, sight: 220, table: "occupied" },
      ],
      standoff: { x: 760, y: 1500, table: "occupied" },
    },
  });
})();
