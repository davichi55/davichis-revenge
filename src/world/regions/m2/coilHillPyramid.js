// R4 Coil Hill Harvesting Pyramid (M2 spec 3.9): a fresh-cut step pyramid on a hill: lower terrace with three slave pens in a row, middle terrace (priest quarters, ledger), summit altar. Table `pyramid` 22 s.
// Entries: start, from_greenmawJungle (foot, SW). Exit: greenmawJungle@from_coilHillPyramid (S). Puzzle: crank gates pyr.gate1..3 (blockers hide pyr.gateN); overseer1..3 + triggers pen1..3 start the overseer fights.
// Triggers s1Fight (summit). Chest g11_venomfangLegion (show ch3.s1). Gather ledgerPage. NPCs slave1..3 (hide pyr.gateN), overseer1..3 (hide pyr.gateN), priest, collarsmith.
(function () {
  const { R, E, P, L } = World.shapes, K = World.kitM2, W = 2250, H = 1500;
  const def = {
    name: "Coil Hill Pyramid", ground: "assets/regions/coilHillPyramid.jpg", w: W, h: H, music: "pyramid", rim: 50, base: "rock",
    look: "A freshly cut stone step pyramid on a bare red hill seen from above: broad terraces of pale cut limestone and red clay separated by retaining walls with stairs, slave pens of wooden stakes on the lowest terrace, quarry carts and rubble, a terrace of priest lodges in the middle, a circular obsidian-ringed altar platform at the summit, red banners. Dusty, harsh, cruel, with deep shadows; wild jungle clinging at the edges.",
    legend: { red: "bare red-orange clay earth and quarry dust with cart ruts, rubble and footprints", paved: "pale freshly cut limestone paving and wide stone stairs, with dark stains", wall: "pale cut-stone terrace retaining wall top with red stains", bone: "polished black obsidian-ringed stone platform with a carved sun glyph circle", rock: "steep jungle hillside and dark thicket seen from above" },
    guide: [
      ["red", R(160, 1010, 1930, 330)], ["road", R(120, 1330, 130, 170)], ["paved", L([[1960, 1010], [1960, 880]], 150)], ["red", R(260, 640, 1830, 260)], ["paved", L([[330, 640], [330, 500]], 150)], ["paved", E(1050, 360, 760, 200)], ["bone", E(1050, 340, 330, 110)],
      ["wall", R(130, 980, 1750, 34)], ["wall", R(2040, 980, 70, 34)], ["wall", R(160, 600, 95, 40)], ["wall", R(405, 600, 1705, 40)],
      ["wall", R(690, 1010, 24, 110)], ["wall", R(690, 1240, 24, 100)], ["wall", R(1250, 1010, 24, 110)], ["wall", R(1250, 1240, 24, 100)], ["wall", R(1810, 1010, 24, 110)], ["wall", R(1810, 1240, 24, 100)],
    ],
    entries: { start: { x: 190, y: 1420, face: "up" }, from_greenmawJungle: { x: 190, y: 1420, face: "up" } },
    exits: [{ rect: [130, 1450, 120, 40], to: "greenmawJungle", entry: "from_coilHillPyramid", push: [0, 1] }],
    checkFlags: { "pyr.gate1": true, "pyr.gate2": true, "pyr.gate3": true },
    blockers: [{ rect: [690, 1120, 24, 120], hide: "pyr.gate1" }, { rect: [1250, 1120, 24, 120], hide: "pyr.gate2" }, { rect: [1810, 1120, 24, 120], hide: "pyr.gate3" }],
    triggers: [{ id: "pen1", rect: [520, 1130, 110, 100], when: "!pyr.gate1" }, { id: "pen2", rect: [1080, 1130, 110, 100], when: "!pyr.gate2" }, { id: "pen3", rect: [1640, 1130, 110, 100], when: "!pyr.gate3" }, { id: "s1Fight", rect: [960, 400, 180, 90] }],
    chests: [{ id: "g11_venomfangLegion", x: 1420, y: 250, show: "ch3.s1" }],
    gather: [{ id: "ledgerPage", x: 1500, y: 780, label: "Ledger page", color: "gold" }],
    npcs: [
      { id: "slave1", art: "npcSlave", name: "Worker", x: 330, y: 1210, hide: "pyr.gate1" }, { id: "slave2", art: "npcCaptive", name: "Worker", x: 880, y: 1230, hide: "pyr.gate2" }, { id: "slave3", art: "npcSlave", name: "Worker", x: 1440, y: 1210, hide: "pyr.gate3", flip: true },
      { id: "overseer1", art: "npcOverseer", name: "Overseer", x: 600, y: 1170, hide: "pyr.gate1" }, { id: "overseer2", art: "npcOverseer", name: "Overseer", x: 1150, y: 1170, hide: "pyr.gate2" }, { id: "overseer3", art: "npcOverseer", name: "Overseer", x: 1710, y: 1170, hide: "pyr.gate3" },
      { id: "priest", art: "npcPriest", name: "Acolyte", x: 1130, y: 780 }, { id: "collarsmith", art: "npcCollarsmith", name: "Collarsmith", x: 1000, y: 470 },
      { id: null, art: "npcSlave", x: 460, y: 1250, path: [[400, 1280], [600, 1280]], speed: 12, hide: "pyr.gate1" }, { id: null, art: "npcPriest", x: 800, y: 760, path: [[600, 780], [900, 780]], speed: 14 },
    ],
    props: [
      ["m2_slavePen", 440, 1150, { solid: [70, 12] }], ["m2_slavePen", 990, 1150, { solid: [70, 12] }], ["m2_slavePen", 1550, 1150, { solid: [70, 12] }], ["m2_crankGate", 702, 1180, { hide: "pyr.gate1", solid: false }], ["m2_crankGate", 1262, 1180, { hide: "pyr.gate2", solid: false }], ["m2_crankGate", 1822, 1180, { hide: "pyr.gate3", solid: false }],
      ["m2_stoneCart", 260, 1090], ["m2_stoneCart", 820, 1300, { flip: true }], ["m2_stoneCart", 1380, 1090], ["m2_whipPost", 560, 1250], ["m2_whipPost", 1120, 1260], ["m2_whipPost", 1680, 1270], ["m2_workerTent", 1960, 1250], ["m2_workerTent", 2050, 1120], ["m2_quarryPit", 280, 1260, { solid: false }], ["m2_quarryPit", 860, 1090, { solid: false }], ["m2_quarryPit", 1700, 1060, { solid: false }],
      ["m2_terraceWall", 1960, 1000, { solid: false }], ["m2_obsidianBrazier", 1840, 960, { fire: [0, -46, 1] }], ["m2_obsidianBrazier", 2080, 960, { fire: [0, -46, 1] }], ["m2_redBanner", 2100, 1330], ["m2_redBanner", 160, 1030], ["m2_skullRack", 610, 1060], ["m2_skullRack", 1860, 1300],
      ["m2_priestLodge", 520, 760], ["m2_priestLodge", 740, 740], ["m2_priestLodge", 1300, 750], ["m2_priestLodge", 1760, 760], ["m2_ledgerTable", 1500, 790], ["m2_obsidianStele", 950, 700], ["m2_obsidianStele", 1700, 680], ["m2_stoneCart", 1900, 830], ["m2_obsidianBrazier", 1250, 860, { fire: [0, -46, 1] }], ["m2_redBanner", 430, 690], ["m2_redBanner", 1980, 690],
      ["m2_terraceWall", 330, 620, { solid: false }], ["m2_obsidianBrazier", 230, 560, { fire: [0, -46, 1] }], ["m2_obsidianBrazier", 430, 560, { fire: [0, -46, 1] }],
      ["m2_collarAltar", 1050, 340, { solid: [50, 16] }], ["m2_sunDisc", 1050, 250, { solid: false, alpha: 0.9 }], ["m2_obsidianStele", 800, 330], ["m2_obsidianStele", 1300, 330], ["m2_obsidianBrazier", 760, 430, { fire: [0, -46, 1] }], ["m2_obsidianBrazier", 1340, 430, { fire: [0, -46, 1] }], ["m2_redBanner", 600, 330], ["m2_redBanner", 1500, 330], ["m2_skullRack", 1560, 310], ["m2_pyramidTier", 1900, 380], ["m2_pyramidTier", 300, 360],
    ],
    lights: [[1050, 340, 250, 0.7], [760, 430, 150, 0.6], [1340, 430, 150, 0.6], [1840, 960, 130, 0.6], [2080, 960, 130, 0.6], [1250, 860, 140, 0.5], [230, 560, 130, 0.5], [430, 560, 130, 0.5]],
    dark: { ambient: 0.42, radius: 250, fireRadius: 220 },
    encounter: { table: "pyramid", rate: 22 },
    amb: { birds: 0, water: false, dust: 0xd09070, motes: 36, tint: [0x4a2020, 0.2], warm: [0xff7040, 0.06], butterflies: [], smoke: [[1050, 330, 0x887766]],
      armies: [{ id: "terracePatrol", lane: [[600, 800], [1300, 820], [1800, 800]], mode: "pingpong", speed: 28, rows: 2, cols: 3, sight: 210, table: "pyramid" }] },
  };
  const trees = [["m2_jungleTreeA", 2], ["m2_jungleTreeB", 1], ["m2_fanPalm", 1], ["m2_cliffBoulder", 2], ["m2_thornBush", 2], ["m2_mossBoulder", 1]];
  def.props = def.props.concat(K.blockedFill(def, 92, trees, { seed: 711 }));
  def.scatter = [{ keys: [["m2_ruinRubble", 2], ["m2_cliffBoulder", 1], ["m2_thornBush", 1], ["m2_skullRack", 0.1]], n: 40, on: ["red"], seed: 721 }];
  World.def("coilHillPyramid", def);
})();
