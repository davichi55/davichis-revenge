// R3 Silt River (M2 spec 3.3): wide brown delta, braided channels, rope ferries, reed islands, the green wall closing in. Table `river` 28 s.
// Entries: start, from_shore (W), from_ninefoldFerry (E), from_hollow (S cave mouth). Exits: creepingShore@from_siltRiver (W), ninefoldFerry@from_siltRiver (E, need ch3.patrolRun), siltRiverHollow@from_siltRiver (S).
// Trigger patrolRun (mid-river mud bank). Gather riverPearl1 (north shallows), riverPearl2 (south shallows). Legion patrols show after ch3.patrolRun.
(function () {
  const { R, E, P, L } = World.shapes, K = World.kitM2, W = 2700, H = 1800;
  const ch1 = K.wob([[0, 560], [500, 620], [900, 520], [1400, 600], [1900, 520], [2300, 640], [2700, 580]], 40, 101, 120);
  const ch2 = K.wob([[0, 1160], [600, 1100], [1100, 1250], [1700, 1120], [2200, 1230], [2700, 1150]], 40, 102, 120);
  const wallN = K.wobPoly([[0, 0], [W, 0], [W, 170], [2300, 230], [1800, 170], [1300, 240], [800, 180], [300, 230], [0, 190]], 24, 103, 90);
  const wallS = K.wobPoly([[0, H], [W, H], [W, 1560], [2300, 1600], [1700, 1540], [1580, 1560], [1570, H - 10], [1430, H - 10], [1420, 1560], [1100, 1590], [600, 1550], [0, 1600]], 24, 104, 90);
  const islands = [K.blobPts(900, 850, 130, 60, 111, { jag: 0.2 }), K.blobPts(1800, 780, 150, 70, 112, { jag: 0.2 }), K.blobPts(2250, 950, 100, 50, 113, { jag: 0.2 }), K.blobPts(500, 1380, 120, 60, 114, { jag: 0.2 }), K.blobPts(2000, 1400, 140, 60, 115, { jag: 0.2 }), K.blobPts(1200, 360, 160, 60, 116, { jag: 0.2 })];
  const def = {
    name: "Silt River", ground: "assets/regions/siltRiver.jpg", w: W, h: H, music: "river", rim: 50, base: "ash",
    look: "A wide brown river delta seen from above at dusk: braided slow brown channels, glossy mud banks and sandbars, reed islands, rope ferry lines, a dense green jungle wall closing in on the north and south edges. Muted browns and olive greens with a low orange light.",
    legend: { ash: "wet brown river-mud bank with footprints, reeds, shells and puddles", water: "wide slow brown river channel with gentle ripples and floating leaves", shallow: "shallow brown ford over pale sand with ripples", grass: "reed island of green grass, reeds and damp earth", road: "a trodden mud track with planks and boot prints", rock: "dense impassable green jungle and mangrove thicket seen from above" },
    guide: [
      ["rock", P(wallN)], ["rock", P(wallS)], 
      ["water", K.ribbon(ch1, 170, 230)], ["water", K.ribbon(ch2, 200, 260)],
      ["shallow", E(720, 590, 70, 120)], ["shallow", E(2060, 560, 70, 120)], ["shallow", E(1330, 1190, 70, 130)], ["shallow", E(2460, 1195, 70, 130)], ["shallow", E(1500, 1520, 120, 50)],
      ...islands.map(p => ["grass", P(p)]),
      ["road", L(K.wob([[60, 900], [500, 880], [900, 960], [1350, 900], [1900, 920], [2300, 860], [2650, 900]], 24, 121, 100), 90)], ["road", L(K.wob([[1500, 1740], [1500, 1520], [1450, 1300], [1330, 1190]], 14, 122, 100), 84)],
      ["shallow", L([[1980, 400], [2060, 500]], 80)],
    ],
    entries: { start: { x: 300, y: 890, face: "right" }, from_shore: { x: 160, y: 900, face: "right" }, from_ninefoldFerry: { x: 2540, y: 900, face: "left" }, from_hollow: { x: 1500, y: 1680, face: "up" } },
    exits: [
      { rect: [20, 850, 70, 100], to: "creepingShore", entry: "from_siltRiver", push: [-1, 0] },
      { rect: [2610, 850, 70, 100], to: "ninefoldFerry", entry: "from_siltRiver", push: [1, 0], need: "ch3.patrolRun", blocked: "riverEastBlocked" },
      { rect: [1445, 1735, 110, 56], to: "siltRiverHollow", entry: "from_siltRiver", push: [0, 1] },
    ],
    triggers: [{ id: "patrolRun", rect: [1300, 840, 140, 130] }],
    gather: [{ id: "riverPearl1", x: 740, y: 480, label: "Pearl shallows", color: "gold" }, { id: "riverPearl2", x: 2470, y: 1330, label: "Pearl shallows", color: "gold" }],
    encounter: { table: "river", rate: 28 },
    amb: { birds: 8, water: true, dust: 0xc8b898, motes: 34, tint: [0x2a2a40, 0.16], warm: [0xff9a60, 0.07], dusk: true, butterflies: [],
      armies: [{ id: "patrol1", lane: [[500, 960], [1000, 980], [1700, 940], [2200, 880]], mode: "pingpong", speed: 40, rows: 2, cols: 4, sight: 220, table: "jungleRoad", show: "ch3.patrolRun" }, { id: "patrol2", lane: [[2400, 1330], [2000, 1330], [1700, 1280]], mode: "pingpong", speed: 36, rows: 2, cols: 3, sight: 220, table: "jungleRoad", show: "ch3.patrolRun" }] },
  };
  def.guide = def.guide.filter(g => g[1].k !== "e" || g[1].a[2] > 5);
  const trees = ["m2_mangrove", "m2_jungleTreeB", ["m2_jungleTreeA", 2], ["m2_giantCeiba", 0.7], "m2_stranglerFig", ["m2_jungleTreeSlim", 1], ["m2_fanPalm", 1]];
  const at = K.terrainAt(def);
  def.props = [
    ["m2_ferryRaft", 1700, 570, { solid: false }], ["m2_dockPosts", 1600, 650], ["m2_dockPosts", 1800, 500], ["m2_ferryRaft", 1050, 1180, { solid: false, flip: true }], ["m2_dockPosts", 980, 1100], ["m2_dockPosts", 1120, 1270],
    ["m2_signalPole", 1260, 880], ["m2_beachedBoat", 1380, 1000], ["m2_ruinArch", 1500, 1700, { solid: false }], ["m2_fishStakes", 600, 800], ["m2_fishStakes", 2150, 1000], ["m2_deadSnag", 1650, 1020], ["m2_mudBoat", 800, 640, { solid: false }],
    ["m2_heron", 960, 820, { solid: false }], ["m2_heron", 1820, 770, { solid: false, flip: true }], ["m2_capybara", 2260, 930, { solid: false }], ["m2_riverTurtle", 520, 1370, { solid: false }], ["m2_sunCroc", 1980, 1410, { solid: false }], ["m2_hen", 0, 0, { show: "never.flag" }],
  ].filter(p => p[0] !== "m2_hen").concat(
    K.blockedFill(def, 92, trees, { seed: 131, edgeKeys: trees, chance: 0.9, skip: (x, y) => x > 1380 && x < 1620 && y > 1650 && y < 1780 }),
    K.fill([60, 160, W - 120, H - 200], 160, [["m2_mudReeds", 3], ["m2_shellMound", 1], ["m2_tidalRock", 1], ["m2_mangroveRoots", 1]], { seed: 132, chance: 0.5, opts: { solid: false, shadow: false }, skip: (x, y) => { const t = at(x, y); return t !== "ash" && t !== "grass"; } }));
  def.scatter = [{ keys: [["m2_mudReeds", 3], ["reeds", 1], ["m2_fernClump", 1]], n: 60, on: ["grass"], seed: 141 }];
  World.def("siltRiver", def);
})();
