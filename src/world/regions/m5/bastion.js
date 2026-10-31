// M5 5.1 Dawnwatch Bastion (town, 1650x1100): a captured grey stone fort on a headland at dusk. Sea and a pier in the west (dock to weepingSea), the yard in the middle with the long supper table under
// lanterns (trigger lastSupper), the Dawn Bed inn NW, the supply stall NE, the Menagerie Wagon SW, towers at the corners, the east gate road to the Great Stair, the Great Pyramid black on the horizon.
// Entries start, from_sea, from_ahuacanGreatStair, inn. NPC ids: innkeeper merchant saffa hadiya imela oldDunmar mentor captain rhaz peya corvin kessa dorrin mayle calendarScholar r1 r2 r3. Triggers bastionArrive, lastSupper.
(function () {
  const { R, E, P, L } = World.shapes, M = World.M5, fx = { solid: false };
  const WALL = [[[440, 250], [1400, 250]], [[440, 250], [440, 620]], [[440, 780], [440, 880]], [[440, 880], [1400, 880]], [[1400, 250], [1400, 340]], [[1400, 460], [1400, 880]]];
  const props = M.flat(
    [["bastionFarPyramid", 1230, 190, { solid: false, scale: 1.0 }]],
    // the wall: stone segments and corner towers, the east gate
    ...WALL.map((s, i) => M.line(["m2_fortWall", "stairWallSegment"], s, 150, { seed: 10 + i, dy: 30, opts: { solid: false } })),
    [["m2_watchTower", 450, 280], ["m2_watchTower", 1390, 280], ["m2_watchTower", 450, 915], ["m2_watchTower", 1390, 915], ["m2_fortGate", 1400, 470, { solid: false }], ["bastionTorch", 1370, 480, fx], ["bastionTorch", 1430, 480, fx], ["bastionTorch", 470, 650, fx], ["bastionTorch", 470, 750, fx]],
    [["m4_rebelBanner", 700, 285, fx], ["m4_rebelBanner", 1100, 285, fx], ["saltmereBannerConcord", 500, 300, fx], ["saltmereBannerFlock", 1330, 300, fx]],
    // the yard: inn, supply stall, command table, the wagon, the training ground
    [["harborInn", 580, 430, { solid: [60, 20] }], ["fishStall", 1250, 400], ["m4_campCrates", 1330, 440], ["m4_supplyStack", 1190, 460], ["m2_barracks", 900, 340, { solid: [70, 20] }], ["menagerieWagon", 590, 780], ["saltmereHorseLine", 760, 830, fx]],
    [["bastionWell", 760, 520], ["bastionHayCart", 1260, 780], ["bastionCrates", 1330, 700], ["bastionCrates", 1290, 840], ["bastionTrainingPost", 1100, 800], ["bastionTrainingPost", 1160, 840], ["m2_spearRack", 1030, 840], ["bastionMessFire", 1000, 440, fx]],
    // the long table, benches and the lantern lines
    [["m4_longTable", 900, 600], ["stoneBench", 780, 650, fx], ["stoneBench", 1020, 650, fx], ["stoneBench", 780, 560, fx], ["stoneBench", 1020, 560, fx], ["m4_hangLanterns", 800, 520, fx], ["m4_hangLanterns", 1000, 520, fx], ["m4_hangLanterns", 800, 700, fx], ["m4_hangLanterns", 1000, 700, fx], ["campfire", 900, 480, fx]],
    M.line("lampPost", [[480, 540], [480, 700]], 80, { seed: 3, opts: fx }), M.line("lampPost", [[600, 560], [1300, 560]], 340, { seed: 4, opts: fx, dy: 120 }),
    // outside: the beach, the pier, rowboats and nets; the east road
    [["m2_dockPosts", 200, 650, fx], ["m2_dockPosts", 200, 760, fx], ["pierLamp", 300, 640, fx], ["crates", 330, 770], ["rowboatMoored", 120, 840, fx], ["bastionRowboat", 90, 560, fx], ["bollards", 280, 770, fx], ["m4_beachPalm", 330, 960], ["m4_beachPalm", 400, 1020], ["m4_wreckBoat", 600, 1010, fx]],
    [["bastionTent", 1500, 640], ["bastionTent", 1560, 700], ["bastionCrates", 1480, 560], ["saltmereStakes", 1540, 300, fx], ["m4_rebelBanner", 1520, 360, fx], ["m4_rebelBanner", 1520, 440, fx], ["bastionTorch", 1580, 500, fx]],
    M.rect(["grass", "grass2", "rocks"], 300, 900, 1500, 1060, 14, { seed: 5, opts: fx })
  );
  World.def("dawnwatchBastion", {
    name: "Dawnwatch Bastion", w: 1650, h: 1100, music: "bastion", rim: 40, base: "rock", ground: "assets/regions/dawnwatchBastion.jpg",
    look: "A captured stone fort on a sea headland at dusk seen from above: grey stone walls with towers and new banners, a paved yard with a long table under lanterns, a wooden pier on the sea to the west, a gate road to the east, rocky headland and sand, the black Great Pyramid on the horizon, warm lantern light against cool dusk.",
    legend: { paved: "grey flagstone fort yard", road: "packed earth road", floor: "wooden pier planks", wall: "grey fort wall stones seen from above", sand: "pale beach sand", water: "dark dusk sea", shallow: "shallow surf", rock: "dark headland rock", grass: "dry coast grass" },
    guide: [
      ["sand", R(0, 0, 440, 1100)], ["grass", E(900, 980, 600, 90)], ["grass", E(1550, 760, 150, 200)], ["road", E(1500, 600, 150, 190)], ["water", P([[0, 0], [250, 0], [240, 400], [200, 700], [240, 1000], [180, 1100], [0, 1100]])], ["shallow", L([[250, 0], [240, 400], [200, 700], [240, 1000]], 70)],
      ["paved", R(440, 250, 960, 630)], ["road", R(440, 620, 80, 160)], ["road", R(1360, 340, 90, 120)],
      ...WALL.map(s => ["wall", L(s, 54)]), ["paved", R(446, 620, 20, 160)], ["paved", R(1380, 345, 40, 110)],
      ["floor", L([[40, 700], [440, 700]], 110)], ["road", L([[1400, 400], [1640, 400]], 100)], ["road", L([[1500, 400], [1500, 740]], 100)], ["road", L([[300, 700], [520, 700]], 90)],
    ],
    entries: { start: { x: 340, y: 700, face: "right" }, from_sea: { x: 340, y: 700, face: "right" }, from_ahuacanGreatStair: { x: 1550, y: 400, face: "left" }, inn: { x: 600, y: 490, face: "down" } },
    exits: [
      { rect: [40, 640, 56, 120], to: "weepingSea", entry: "from_dawnwatchBastion", push: [1, 0], floor: "floor" },
      { rect: [1594, 340, 56, 120], to: "ahuacanGreatStair", entry: "from_dawnwatchBastion", push: [-1, 0] },
    ],
    triggers: [{ id: "bastionArrive", rect: [300, 640, 140, 120] }, { id: "lastSupper", rect: [800, 660, 220, 110] }],
    props,
    scatter: [{ keys: [["grass", 3], ["grass2", 2], ["rocks", 1]], n: 28, seed: 41, on: ["grass", "sand"], opts: { solid: false }, scaleRange: [0.6, 0.9] }],
    npcs: [
      { id: "innkeeper", art: "innkeeper", name: "Innkeeper", x: 640, y: 480 }, { id: "merchant", art: "merchant", name: "Quartermaster", x: 1250, y: 440 },
      { id: "imela", art: "npcImela", name: "Imela", x: 860, y: 540 }, { id: "saffa", art: "npcSaffa", name: "Saffa", x: 940, y: 540 }, { id: "hadiya", art: "npcHadiya", name: "Hadiya", x: 820, y: 640 }, { id: "rhaz", art: "npcRhaz", name: "Rhaz", x: 980, y: 640 },
      { id: "peya", art: "npcPeya", name: "Peya", x: 1060, y: 590 }, { id: "corvin", art: "npcCorvin", name: "Corvin", x: 740, y: 590 }, { id: "mentor", art: "npcIthielGrey", name: "Master Ithiel", x: 1080, y: 620 },
      { id: "kessa", art: "npcKessa", name: "Kessa", x: 880, y: 660 }, { id: "dorrin", art: "npcDorrin", name: "Dorrin", x: 940, y: 665 }, { id: "mayle", art: "npcMayle", name: "Mayle", x: 700, y: 640 },
      { id: "oldDunmar", art: "npcDunmar", name: "Old Dunmar", x: 660, y: 790 }, { id: "captain", art: "npcBrisk", name: "Brisk", x: 280, y: 740 }, { id: "calendarScholar", art: "npcCalendarScholar", name: "Calendar scholar", x: 1190, y: 520 },
      { id: "r1", art: "npcRecruit", name: "Soldier", x: 1130, y: 780 }, { id: "r2", art: "npcCook", name: "Cook", x: 1030, y: 470 }, { id: "r3", art: "npcWarden", name: "Warden", x: 1470, y: 560 },
      { id: null, art: "npcRecruit", x: 1250, y: 700, path: [[1100, 740], [1340, 740]], speed: 18 }, { id: null, art: "npcWarden", x: 700, y: 330, path: [[520, 330], [1300, 330]], speed: 16 }, { id: null, art: "npcPorter", x: 380, y: 700, path: [[300, 700], [520, 720]], speed: 20 },
      { id: null, art: "npcResistFighter", x: 1520, y: 520, path: [[1500, 420], [1500, 700]], speed: 16 },
    ],
    amb: { motes: 30, dust: 0xe8d0b0, tint: [0x30344c, 0.22], warm: [0xffa860, 0.06], water: true, birds: 2, smoke: [[1000, 440, 0x585048], [900, 480, 0x585048]] },
    dark: { ambient: 0.4, radius: 330, fireRadius: 200 },
    lights: [[900, 560, 300, 1], [900, 480, 140, 0.9], [800, 520, 110, 0.8], [1000, 520, 110, 0.8], [800, 700, 110, 0.8], [1000, 700, 110, 0.8], [1000, 440, 120, 0.8], [300, 640, 120, 0.8], [480, 540, 110, 0.7], [480, 700, 110, 0.7], [1370, 480, 120, 0.8], [1430, 480, 120, 0.8], [580, 480, 130, 0.8], [1250, 420, 120, 0.7], [1500, 400, 140, 0.7]],
  });
})();
