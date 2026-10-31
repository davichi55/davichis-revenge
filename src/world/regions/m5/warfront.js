// M5 3.1 Saltmere Warfront (field, 3000x2000): the salt-marsh battlefield. West = the Concord/Flock/resistance zone and the camp road; the middle band = two ramparts with no-man's land
// between them (stand-off battle lines, wrecks, the trench mouth); east = the Dominion's walled siege camp (sealed, seen from outside). Bypass causeways run round the north (to Veil Sanctum)
// and the south (to Thunder Spine); the Prism Archive road leaves south at x 850. Table "warfront" ~26 s. Legend L7 (Veil Stag) in the mist.
(function () {
  const { R, E, P, L } = World.shapes, M = World.M5;
  // ramparts: allied (x ~1150, three gaps: y 540-690, 930-1070, 1310-1460) and the legion fort's west wall (sealed)
  const AL = [[[1130, 440], [1160, 540]], [[1165, 690], [1195, 930]], [[1195, 1070], [1165, 1310]], [[1160, 1460], [1130, 1560]]];
  const LW = [[1990, 520], [1952, 700], [1932, 1000], [1952, 1300], [1990, 1480]];
  const props = M.flat(
    // allied rampart: sandbags, stakes in front, banners, ballistae
    ...AL.map((s, i) => M.line("saltmereSandbags", s, 92, { seed: 10 + i, jit: 6, flipR: true })),
    ...AL.map((s, i) => M.line("saltmereStakes", s.map(p => [p[0] + 56, p[1]]), 130, { seed: 20 + i, jit: 10, flipR: true })),
    M.line(["saltmereBannerConcord", "saltmereBannerFlock"], [[1150, 470], [1170, 700], [1200, 920]], 150, { seed: 3, dx: -40 }), M.line(["saltmereBannerFlock", "saltmereBannerConcord"], [[1200, 1080], [1170, 1300], [1140, 1540]], 150, { seed: 4, dx: -40 }),
    [["saltmereBallista", 1112, 590], ["saltmereBallista", 1150, 870], ["saltmereBallista", 1160, 1150], ["saltmereBallista", 1120, 1410]],
    // legion fort west wall (outside face): palisade, standards, siege towers brought up, ballistae
    M.line("saltmerePalisade", LW, 120, { seed: 31, dx: -18 }), M.line(["saltmereBannerDominion", "saltmereLegionStandard"], LW, 210, { seed: 32, dx: -50 }),
    [["saltmereSiegeTower", 1868, 600], ["saltmereSiegeTower", 1838, 830], ["saltmereSiegeTower", 1842, 1190], ["saltmereSiegeTower", 1872, 1440], ["saltmereBallista", 1860, 710], ["saltmereBallista", 1830, 1010], ["saltmereBallista", 1850, 1320], ["saltmereCatapult", 1790, 940]],
    // no-man's land: wrecks, burnt wagons, fallen banners, the trench mouth
    [["saltmereWreckedTower", 1440, 560], ["saltmereWreckedTower", 1470, 1420], ["saltmereBurntWagon", 1330, 800], ["saltmereBurntWagon", 1720, 1160], ["saltmereBurntWagon", 1640, 470], ["saltmereBurntWagon", 1380, 1190], ["saltmereBunkerHatch", 1620, 950, { solid: [40, 14] }], ["saltmereSandbags", 1570, 1080], ["saltmereSandbags", 1660, 1075], ["saltmereMortarPit", 1540, 905], ["saltmereAmmoCrates", 1690, 905], ["saltmereTorchPost", 1520, 1050], ["saltmereTorchPost", 1640, 1050]],
    M.rect(["saltmereFallenBanner", "saltmereRubble", "saltmereBoltPile", "saltmereDeadTree"], 1250, 460, 1880, 1540, 26, { seed: 41, flipR: true, avoid: [[1560, 1000, 150], [1550, 520, 150], [1550, 790, 150], [1550, 1260, 150], [1550, 1500, 150]] }),
    // allied west: two camps, a field forge, supply wagons, lanterns, the Flock's tents
    M.ring(["saltmereTentConcord", "saltmereTentFlock", "saltmereBunkTent"], 560, 560, 180, 100, 6, { seed: 51, a0: 0.4, jit: 14 }), [["saltmereCookFire", 560, 570], ["saltmereLantern", 440, 690], ["saltmereLantern", 690, 690], ["saltmereSupplyWagon", 380, 400], ["saltmereWaterCart", 700, 400]],
    M.ring(["saltmereTentConcord", "saltmereTentFlock", "saltmereBunkTent"], 520, 1450, 170, 100, 6, { seed: 52, a0: 0.2, jit: 14 }), [["saltmereCookFire", 520, 1460], ["saltmereLantern", 400, 1330], ["saltmereLantern", 640, 1330], ["saltmereForge", 990, 1500], ["saltmereSupplyWagon", 1040, 1330], ["saltmereHorseLine", 400, 1640]],
    [["saltmereSurgeonTent", 930, 830], ["saltmereStretchers", 880, 910], ["saltmereMessHall", 330, 840, { solid: [70, 20] }], ["saltmereBannerConcord", 200, 890], ["saltmereBannerFlock", 200, 1110], ["saltmereLantern", 150, 925], ["saltmereLantern", 150, 1075]],
    // legion fort interior (sealed, seen over the wall): tents in rows, standards, cook fires
    M.grid("saltmereTentDominion", 2140, 640, 5, 3, 120, 120, { seed: 61, jit: 14 }), M.grid("saltmereTentDominion", 2140, 1220, 5, 2, 120, 110, { seed: 62, jit: 14 }), M.line("saltmereWarBrazier", [[2080, 560], [2820, 560]], 180, { seed: 63 }),
    [["saltmereCookFire", 2480, 920], ["saltmereSiegeTower", 2740, 830], ["saltmereBallista", 2040, 800], ["saltmereLegionStandard", 2330, 1000], ["saltmereBannerDominion", 2330, 930]],
    // the beach and the sea landing
    [["rowboatMoored", 250, 1900], ["saltmereAmmoCrates", 200, 1830], ["saltmereAmmoCrates", 350, 1860]]
  );
  World.def("saltmereWarfront", {
    name: "Saltmere Warfront", w: 3000, h: 2000, music: "warfront", rim: 40, base: "grass", ground: "assets/regions/saltmereWarfront.jpg",
    look: "A vast salt-marsh battlefield: grey-green tussocky marsh, pale cracked salt crust, churned mud, brackish pools with reeds, burnt black earth where fighting happened, a long earthwork rampart of timber and sandbags in the west and a big square palisade fort in the east, a mud road, plank causeways. Overcast grey light, drifting mist.",
    legend: { grass: "tussocky grey-green salt-marsh grass over wet mud, trampled by armies", salt: "pale cracked salt-crusted mud flats", road: "deep churned brown mud wagon tracks with ruts and boot prints", floor: "wooden plank duckboard causeway laid across the marsh", shallow: "shallow brackish marsh pools with reeds and reflections", water: "deep dark brackish pools", ash: "scorched black earth with embers and ash where the fighting happened", wall: "earthwork ramparts and palisade walls of piled mud, timber logs and sandbags seen from above", red: "packed trampled red-brown camp earth with tent rows", sand: "pale beach sand and shingle", rock: "dark rock and mud banks" },
    guide: [
      ["salt", E(560, 330, 330, 140)], ["salt", E(1650, 1790, 380, 110)], ["salt", E(300, 1250, 200, 120)], ["salt", E(2500, 330, 300, 120)], ["salt", E(2400, 1830, 300, 100)],
      ["ash", E(1560, 640, 270, 130)], ["ash", E(1540, 1380, 250, 120)], ["ash", E(1580, 1000, 190, 100)], ["ash", E(1250, 800, 100, 60)],
      ["shallow", E(780, 420, 150, 60)], ["shallow", E(1050, 1580, 170, 70)], ["shallow", E(2300, 1700, 200, 60)], ["shallow", E(2650, 300, 190, 60)],
      ["water", E(1700, 600, 70, 38)], ["water", E(1450, 1290, 84, 40)], ["water", E(1780, 1380, 70, 34)], ["water", E(1360, 690, 60, 30)], ["water", E(2300, 1700, 90, 28)],
      ["sand", E(300, 1790, 210, 112)], ["water", P([[0, 1500], [120, 1560], [200, 1700], [225, 1990], [0, 1990]])],
      ["road", L([[40, 1000], [560, 1000], [1180, 1000]], 100)], ["road", L([[700, 1000], [760, 760], [960, 470]], 84)], ["road", L([[700, 1000], [770, 1300], [830, 1650], [850, 1950]], 84)],
      ["floor", L([[960, 470], [1250, 300], [1800, 230], [2350, 150], [2350, 60]], 92)], ["floor", L([[830, 1650], [1300, 1740], [1950, 1730], [2500, 1650], [2950, 1560]], 92)],
      ["road", L([[320, 1780], [600, 1770], [830, 1650]], 70)], ["road", L([[1100, 615], [1600, 640]], 70)], ["road", L([[1100, 1385], [1560, 1380]], 70)],
      ["red", R(1990, 540, 850, 920)],
      ...AL.map(s => ["wall", L(s, 44)]), ["wall", L(LW, 46)], ["wall", L([[1990, 520], [2860, 520]], 46)], ["wall", L([[1990, 1480], [2860, 1480]], 46)], ["wall", L([[2860, 520], [2860, 1480]], 46)],
      ["road", L([[1180, 1000], [1570, 1000]], 100)],
    ],
    entries: { start: { x: 150, y: 1000, face: "right" }, from_saltmereCamp: { x: 150, y: 1000, face: "right" }, from_sea: { x: 320, y: 1745, face: "up" }, from_saltmereTrenches: { x: 1470, y: 1010, face: "left" }, from_veilSanctum: { x: 2350, y: 170, face: "down" }, from_thunderSpine: { x: 2870, y: 1560, face: "left" }, from_prismArchive: { x: 850, y: 1860, face: "up" } },
    exits: [
      { rect: [40, 940, 56, 120], to: "saltmereCamp", entry: "from_saltmereWarfront", push: [1, 0] },
      { rect: [1520, 962, 70, 76], to: "saltmereTrenches", entry: "from_saltmereWarfront", push: [-1, 0] },
      { rect: [2300, 40, 100, 56], to: "veilSanctum", entry: "from_saltmereWarfront", push: [0, 1], need: "ch10.s19" },
      { rect: [2896, 1500, 60, 120], to: "thunderSpine", entry: "from_saltmereWarfront", push: [-1, 0], need: "ch10.mentorWon" },
      { rect: [800, 1900, 100, 56], to: "prismArchive", entry: "from_saltmereWarfront", push: [0, -1] },
    ],
    chests: [{ id: "warfrontChest1", x: 1640, y: 360 }, { id: "warfrontChest2", x: 280, y: 1850 }],
    legends: [{ id: "L7", enemy: "veilStag", level: 60, chance: 0.05, spots: [[520, 430], [1000, 1560], [1500, 250]], when: "sky.mist" }],
    props,
    scatter: [
      { keys: [["saltmereTussock", 5], ["reeds", 3], ["grass", 4], ["grass2", 3], ["saltmereDeadTree", 0.5]], n: 150, seed: 1, scaleRange: [0.9, 1.15] },
      { keys: [["saltmereMudPuddle", 2], ["bones", 1], ["skull", 0.6], ["debris", 1], ["saltmereBoardwalk", 1]], n: 60, seed: 2 },
      { keys: [["reeds", 4], ["saltmereTussock", 3]], n: 40, on: ["shallow"], seed: 3 },
    ],
    encounter: { table: "warfront", rate: 26 },
    npcs: [
      { id: null, art: "npcWarden", x: 1118, y: 962 }, { id: null, art: "npcWarden", x: 1118, y: 1042 }, { id: null, art: "npcWarden", x: 1105, y: 620 }, { id: null, art: "npcFlockGuard", x: 1105, y: 1385 },
      { id: null, art: "npcWarden", x: 760, y: 760, path: [[700, 1000], [760, 760], [960, 470]], speed: 22 }, { id: null, art: "npcResistFighter", x: 790, y: 1300, path: [[700, 1000], [770, 1300], [830, 1650]], speed: 20 },
      { id: null, art: "npcMedic", x: 900, y: 880, path: [[880, 870], [980, 920]], speed: 18 }, { id: null, art: "npcPorter", x: 400, y: 1010, path: [[260, 1000], [620, 1000]], speed: 24 }, { id: null, art: "npcAcolyte", x: 1000, y: 1000, path: [[820, 1000], [1060, 1000]], speed: 18 },
    ],
    amb: {
      weather: ["mist", "clear"], birds: 3, water: true, motes: 50, dust: 0xc8c8b8, tint: [0x3a4a50, 0.2], warm: [0xffb070, 0.03],
      smoke: [[1330, 800, 0x403a38], [1720, 1160, 0x403a38], [1640, 470, 0x403a38], [1380, 1190, 0x403a38], [1440, 560, 0x504844], [1470, 1420, 0x504844], [2400, 700, 0x585048], [2600, 1200, 0x585048]],
      standoff: [
        { id: "line1", x: 1550, y: 520, cols: 10, mirror: true, table: "warfront" }, { id: "line2", x: 1550, y: 790, cols: 8, mirror: true, table: "warfront" },
        { id: "line3", x: 1550, y: 1260, cols: 8, mirror: true, table: "warfront" }, { id: "line4", x: 1550, y: 1500, cols: 10, mirror: true, table: "warfront" },
      ],
      armies: [
        { id: "patrolN", lane: [[1250, 330], [1750, 340], [2250, 320], [1750, 330]], mode: "pingpong", speed: 34, rows: 3, cols: 5, sight: 230, table: "warfront", cry: "The Flock's road! Take them!" },
        { id: "patrolS", lane: [[1250, 1680], [1800, 1690], [2300, 1660], [1800, 1670]], mode: "pingpong", speed: 34, rows: 3, cols: 5, sight: 230, table: "warfront" },
        { id: "patrolNW", lane: [[1050, 300], [1500, 260], [1050, 330]], mode: "pingpong", speed: 30, rows: 2, cols: 4, sight: 200, table: "warfront" },
        { id: "column1", lane: [[2060, 620], [2060, 1400]], mode: "pingpong", speed: 22, rows: 3, cols: 8, table: "warfront" }, { id: "column2", lane: [[2300, 1400], [2300, 620]], mode: "pingpong", speed: 20, rows: 3, cols: 7, table: "warfront" },
      ],
    },
  });
})();
