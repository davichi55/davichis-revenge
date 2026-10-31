// M5 3.2 Saltmere Camp (town, 1800x1200): a city of tents on the marsh. The sea and the pier in the west (dock to weepingSea), the war tent with the map table in the middle (council NPCs
// stand around it), the surgeon's row NW, the forge NE, the Cot House inn SW (entry "inn"), mess halls S, the three guild tents and the drill ground SE, the palisade gate E (to the Warfront).
// NPC ids: innkeeper merchant saffa hadiya rhaz peya corvin imela dunmar kessa dorrin mayle surgeon r1 r2 r3. Triggers: saltmereArrive (pier root), warCouncil (war tent front). No fights.
(function () {
  const { R, E, P, L } = World.shapes, M = World.M5;
  const props = M.flat(
    [["saltmereWarTent", 900, 470, { solid: [86, 22] }], ["saltmereMapTable", 900, 600], ["saltmereBannerConcord", 760, 520], ["saltmereBannerFlock", 1040, 520], ["saltmereBannerConcord", 780, 700], ["saltmereBannerFlock", 1020, 700], ["saltmereLantern", 700, 620], ["saltmereLantern", 1100, 620], ["saltmereWarBrazier", 800, 430], ["saltmereWarBrazier", 1000, 430]],
    // surgeon's row (NW)
    [["saltmereSurgeonTent", 430, 290], ["saltmereSurgeonTent", 610, 250], ["saltmereSurgeonTent", 780, 300], ["saltmereStretchers", 520, 360], ["saltmereStretchers", 690, 350], ["saltmereLantern", 500, 440], ["saltmereLantern", 860, 330], ["saltmereMedicCart", 330, 330]].filter(p => p[0] !== "saltmereMedicCart"),
    // forge and armoury (NE) and the cadets' fire
    [["saltmereForge", 1330, 270], ["saltmereForge", 1490, 300], ["saltmereWeaponRack", 1230, 240], ["saltmereWeaponRack", 1600, 270], ["saltmereBoltPile", 1420, 360], ["saltmereAmmoCrates", 1560, 380], ["saltmereCookFire", 1250, 420], ["saltmereLantern", 1170, 320], ["saltmereBunkTent", 1120, 250]],
    // the Cot House (inn), the Menagerie wagon, the supply tent with the merchant, mess halls
    [["saltmereCotHouse", 440, 830, { solid: [90, 24] }], ["saltmereLantern", 540, 870], ["saltmereBunkTent", 330, 780], ["menagerieWagon", 250, 1020], ["saltmereHorseLine", 130, 930], ["saltmereSupplyTent", 1010, 940], ["saltmereMessHall", 760, 1060, { solid: [90, 20] }], ["saltmereMessHall", 1190, 1070, { solid: [90, 20] }], ["saltmereCookFire", 880, 960], ["saltmereCookFire", 1110, 1000], ["saltmereFirewood", 650, 1000], ["saltmereWaterCart", 1330, 1000], ["saltmereSupplyWagon", 600, 930]],
    // the guild rows (SE) and the drill ground
    [["saltmereGuildHall", 1380, 770], ["saltmereGuildHall", 1520, 730], ["saltmereGuildHall", 1650, 800], ["saltmereBannerConcord", 1440, 840], ["saltmereBannerFlock", 1590, 830], ["saltmereBannerConcord", 1300, 700]],
    M.grid("saltmereDummy", 1180, 900, 4, 2, 84, 70, { seed: 4, jit: 6 }), [["saltmereWeaponRack", 1520, 940], ["saltmereLantern", 1620, 960], ["saltmereStakes", 1560, 1080]],
    // gate and palisade (E), tents scattered between the districts, the waterline
    M.line("saltmerePalisade", [[1720, 100], [1720, 480]], 118, { seed: 6 }), M.line("saltmerePalisade", [[1720, 740], [1720, 1110]], 118, { seed: 7 }), [["saltmereTorchPost", 1700, 520], ["saltmereTorchPost", 1700, 690], ["saltmereLegionStandard", 1680, 440]],
    M.rect(["saltmereBunkTent", "saltmereTentConcord", "saltmereTentFlock", "saltmereFirewood", "saltmereAmmoCrates"], 300, 120, 1600, 1130, 14, { seed: 8, flipR: true, avoid: [[900, 560, 330], [440, 830, 130], [250, 1020, 120], [1000, 940, 120], [1500, 760, 220], [1300, 300, 220], [570, 300, 220], [1250, 960, 180], [800, 1050, 170], [250, 600, 140], [1500, 600, 150]] }),
    [["rowboatMoored", 150, 380], ["saltmereAmmoCrates", 120, 700], ["saltmereFirewood", 120, 500], ["saltmereLantern", 280, 520], ["saltmereLantern", 280, 680]]
  );
  World.def("saltmereCamp", {
    name: "Saltmere Camp", w: 1800, h: 1200, music: "warfront", rim: 44, base: "grass", ground: "assets/regions/saltmereCamp.jpg",
    look: "A huge army camp on a salt marsh: a city of canvas tents of grey, white and blue-and-white stripes in districts, trampled mud paths and plank duckboard walkways, cook fires, a big war tent in the centre, a surgeon's row, a forge, a drill ground, a wooden pier on the sea to the west, a palisade gate to the east. Overcast, smoky, busy.",
    legend: { grass: "trampled grey-green marsh grass and mud between the tents", road: "packed brown trampled mud paths with boot prints and cart ruts", floor: "wooden plank duckboard walkways and pier planks", shallow: "shallow brackish marsh water with reeds", water: "grey-green sea water with small waves", sand: "pale shingle beach", rock: "dark rock and mud banks" },
    guide: [
      ["shallow", E(1600, 230, 170, 70)], ["shallow", E(1640, 1040, 130, 60)], ["shallow", E(560, 1130, 160, 50)],
      ["water", P([[0, 0], [215, 0], [185, 260], [160, 500], [150, 700], [185, 900], [215, 1200], [0, 1200]])], ["sand", L([[215, 0], [185, 260], [160, 500], [150, 700], [185, 900], [215, 1200]], 50)],
      ["road", E(900, 560, 320, 200)], ["grass", E(900, 530, 210, 110)], ["floor", E(900, 560, 235, 120)],
      ["road", L([[170, 600], [600, 600], [760, 590]], 86)], ["road", L([[1040, 600], [1250, 600], [1760, 600]], 86)], ["road", L([[790, 430], [620, 320], [440, 310]], 80)], ["road", L([[1010, 430], [1250, 330], [1500, 320]], 80)],
      ["road", L([[900, 760], [900, 900], [900, 1010]], 84)], ["road", L([[1090, 720], [1300, 820], [1680, 830]], 80)], ["road", L([[720, 720], [540, 860], [440, 890]], 80)], ["road", L([[440, 890], [300, 960], [220, 1000]], 74)],
      ["road", L([[1090, 840], [1300, 1000], [1600, 1000]], 74)], ["road", L([[900, 1010], [1200, 1100]], 74)],
      ["floor", L([[300, 600], [90, 600]], 84)], ["floor", L([[440, 310], [440, 250]], 60)], ["floor", L([[620, 320], [620, 250]], 60)], ["floor", L([[1500, 320], [1500, 260]], 60)],
      ["wall", R(1706, 90, 30, 400)], ["wall", R(1706, 720, 30, 400)],
    ],
    entries: { start: { x: 300, y: 600, face: "right" }, from_sea: { x: 300, y: 600, face: "right" }, from_saltmereWarfront: { x: 1650, y: 600, face: "left" }, inn: { x: 440, y: 890, face: "down" } },
    exits: [
      { rect: [56, 540, 76, 120], to: "weepingSea", entry: "from_saltmereCamp", push: [1, 0], floor: "floor" },
      { rect: [1740, 540, 56, 120], to: "saltmereWarfront", entry: "from_saltmereCamp", push: [-1, 0] },
    ],
    triggers: [{ id: "saltmereArrive", rect: [210, 520, 190, 160] }, { id: "warCouncil", rect: [780, 660, 240, 100] }],
    props,
    scatter: [{ keys: [["saltmereTussock", 3], ["grass", 3], ["grass2", 3], ["reeds", 1], ["saltmereBoardwalk", 1]], n: 90, seed: 11 }, { keys: [["reeds", 4]], n: 20, on: ["shallow"], seed: 12 }],
    npcs: [
      { id: "innkeeper", art: "innkeeper", name: "Innkeeper", x: 520, y: 930 }, { id: "merchant", art: "merchant", name: "Merchant", x: 1010, y: 990 },
      { id: "imela", art: "npcImela", name: "Imela", x: 900, y: 548 }, { id: "saffa", art: "npcSaffa", name: "Saffa", x: 830, y: 620 }, { id: "hadiya", art: "npcHadiya", name: "Hadiya", x: 975, y: 625 },
      { id: "rhaz", art: "npcRhaz", name: "Rhaz", x: 770, y: 580 }, { id: "peya", art: "npcPeya", name: "Peya", x: 1030, y: 585 }, { id: "corvin", art: "npcCorvin", name: "Corvin", x: 900, y: 665 },
      { id: "dunmar", art: "npcDunmar", name: "Old Dunmar", x: 330, y: 1000 }, { id: "surgeon", art: "npcSurgeon", name: "Surgeon", x: 600, y: 350 },
      { id: "kessa", art: "npcKessa", name: "Kessa", x: 1200, y: 465 }, { id: "dorrin", art: "npcDorrin", name: "Dorrin", x: 1305, y: 465 }, { id: "mayle", art: "npcMayle", name: "Mayle", x: 1255, y: 505 },
      { id: "r1", art: "npcWarden", name: "Warden", x: 700, y: 800 }, { id: "r2", art: "npcScout", name: "Scout", x: 1300, y: 920 }, { id: "r3", art: "npcAcolyte", name: "Acolyte", x: 620, y: 470 },
      { id: null, art: "npcRecruit", x: 1230, y: 960, path: [[1230, 960], [1500, 960]], speed: 24 }, { id: null, art: "npcRecruit", x: 1300, y: 1030, path: [[1560, 1030], [1250, 1030]], speed: 22 }, { id: null, art: "npcWarden", x: 1500, y: 880, path: [[1250, 880], [1600, 880]], speed: 20 },
      { id: null, art: "npcCook", x: 880, y: 1000, path: [[760, 1000], [1000, 1000]], speed: 20 }, { id: null, art: "npcMedic", x: 520, y: 400, path: [[430, 380], [760, 380]], speed: 26 }, { id: null, art: "npcPorter", x: 600, y: 600, path: [[300, 600], [680, 600]], speed: 24 },
      { id: null, art: "npcResistFighter", x: 1500, y: 600, path: [[1180, 600], [1660, 600]], speed: 24 }, { id: null, art: "npcScholarF", x: 900, y: 860, path: [[900, 780], [900, 940]], speed: 18 }, { id: null, art: "npcRefugee", x: 340, y: 700, path: [[300, 720], [420, 760]], speed: 16 },
    ],
    amb: { weather: ["mist", "clear", "clear"], birds: 3, water: true, motes: 44, dust: 0xc8c8b8, tint: [0x3a4650, 0.16], warm: [0xffb070, 0.05], smoke: [[880, 960, 0x585048], [1110, 1000, 0x585048], [1250, 420, 0x585048], [1330, 270, 0x605850], [600, 560, 0x585048]] },
  });
})();
