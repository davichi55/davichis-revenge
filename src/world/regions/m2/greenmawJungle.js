// R4 Greenmaw Jungle (M2 spec 3.6): deep jungle, a paved imperial road cutting east to Fort Ocelan (wall + gate in the east), ruins, clearings. Tables `jungle` 26 s + road zone `jungleRoad` 30 s.
// Entries: start, from_ninefoldFerry (SW), from_redrootCamp (S), from_fortOcelan (west of the gate), from_fortOcelanEast (east of the wall), from_coilHillPyramid (NE), from_boilingPools (S), from_featherfallCanopy (N cliff).
// Exits: ninefoldFerry, redrootCamp (need ch3.ninefold), fortOcelan (E road gate), coilHillPyramid (need ch3.fort), boilingPools, featherfallCanopy (need ch4.start). Legend L2 (4 clearings), gather galeDown1/2, chest jungleRuinChest, trigger fortHiddenPath.
(function () {
  const { R, E, P, L } = World.shapes, K = World.kitM2, W = 3150, H = 2100;
  const T = (pts, seed, amp) => K.wob(pts, amp === undefined ? 18 : amp, seed, 100);
  const road = T([[0, 1100], [500, 1090], [1000, 1040], [1500, 1000], [2000, 1060], [2450, 1000], [2690, 1000]], 401, 22);
  const trails = [
    T([[230, 2060], [260, 1700], [420, 1400], [620, 1150], [700, 1090]], 402), T([[1100, 2060], [1080, 1700], [1150, 1400], [1050, 1060]], 403), T([[1950, 2060], [1990, 1700], [1900, 1400], [1880, 1070]], 404),
    T([[1300, 40], [1330, 400], [1260, 700], [1330, 1010]], 405), T([[620, 1090], [700, 800], [620, 560]], 406), T([[2200, 1070], [2150, 1400], [2100, 1620]], 407), T([[1900, 1040], [1880, 780], [1900, 560]], 408),
    T([[1500, 1010], [1560, 1250], [1550, 1480]], 409), T([[420, 1450], [600, 1600], [700, 1660]], 410), T([[2420, 1000], [2450, 760], [2400, 560]], 411), T([[2560, 1000], [2630, 880], [2670, 730]], 412), T([[2900, 1000], [2960, 700], [2950, 200], [2950, 40]], 413), T([[880, 1330], [800, 1200], [790, 1090]], 414), T([[1250, 1230], [1180, 1130], [1100, 1050]], 415),
  ];
  const clear = [[600, 480, 230, 150], [1900, 520, 200, 130], [1550, 1520, 200, 130], [700, 1680, 190, 120], [2400, 520, 190, 120], [2100, 1660, 220, 140], [1100, 1960, 210, 90], [250, 1960, 190, 80], [1950, 1960, 190, 90], [1300, 140, 180, 100], [2370, 880, 190, 110], [880, 1330, 150, 90], [1250, 1230, 150, 80]].map((c, i) => K.blobPts(c[0], c[1], c[2], c[3], 420 + i, { jag: 0.16 }));
  const def = {
    name: "Greenmaw Jungle", ground: "assets/regions/greenmawJungle.jpg", w: W, h: H, music: "jungle", rim: 50, base: "rock",
    look: "A deep tropical jungle seen from above: a broad worn paved imperial road with mossy milestones cutting east to west, narrow muddy jungle trails branching off it, open leafy clearings with ferns, flowers and fallen logs, ancient mossy ruins, and walls of dense impassable green canopy all around with dark undergrowth. Buzzing, humid, dappled light, rich greens with a few warm flowers.",
    legend: { rock: "dense impassable jungle: layered dark green canopy, giant leaves, vines and roots seen from above", grass: "jungle clearing floor of ferns, leaf litter, moss, small flowers and damp dark earth", road: "a narrow muddy jungle trail with roots, leaves and footprints", paved: "a broad worn paved imperial road of grey-brown flagstones with moss and weeds in the cracks and cart ruts", wall: "a thick grey stone fortress wall top" },
    guide: [
      ...clear.map(c => ["grass", P(c)]), ["grass", P(K.blobPts(2960, 700, 120, 330, 440, { jag: 0.12 }))], ...trails.map(t => ["road", L(t, 84)]),
      ["paved", L(road, 112)], ["paved", L(T([[2800, 1000], [2900, 1000]], 450, 4), 112)],
      ["rock", R(2700, 0, 120, 880)], ["rock", R(2700, 1130, 120, 970)], ["wall", R(2700, 880, 120, 90)], ["wall", R(2700, 1040, 120, 90)],
    ],
    entries: { start: { x: 700, y: 1085, face: "right" }, from_ninefoldFerry: { x: 240, y: 1950, face: "up" }, from_redrootCamp: { x: 1100, y: 1950, face: "up" }, from_fortOcelan: { x: 2600, y: 1005, face: "left" }, from_fortOcelanEast: { x: 2870, y: 1000, face: "right" }, from_coilHillPyramid: { x: 2950, y: 130, face: "down" }, from_boilingPools: { x: 1950, y: 1950, face: "up" }, from_featherfallCanopy: { x: 1300, y: 130, face: "down" } },
    exits: [
      { rect: [190, 2030, 100, 56], to: "ninefoldFerry", entry: "from_greenmawJungle", push: [0, 1] },
      { rect: [1050, 2030, 100, 56], to: "redrootCamp", entry: "from_greenmawJungle", push: [0, 1], need: "ch3.ninefold", blocked: "jungleSouthBlocked" },
      { rect: [2640, 950, 60, 100], to: "fortOcelan", entry: "from_greenmawJungle", push: [1, 0] },
      { rect: [2900, 30, 100, 56], to: "coilHillPyramid", entry: "from_greenmawJungle", push: [0, -1], need: "ch3.fort", blocked: "coilHillBlocked" },
      { rect: [1900, 2030, 100, 56], to: "boilingPools", entry: "from_greenmawJungle", push: [0, 1] },
      { rect: [1250, 30, 100, 56], to: "featherfallCanopy", entry: "from_greenmawJungle", push: [0, -1], need: "ch4.start", blocked: "canopyBlocked" },
    ],
    checkFlags: { "ch3.fort": true },
    blockers: [{ rect: [2700, 970, 120, 70], hide: "ch3.fort" }],
    triggers: [{ id: "greenmawArrive", rect: [600, 1030, 160, 120] }, { id: "fortHiddenPath", rect: [2620, 690, 100, 80] }],
    chests: [{ id: "jungleRuinChest", x: 2100, y: 1700 }],
    gather: [{ id: "galeDown1", x: 560, y: 470, label: "Molted feathers", color: "gold", show: "!g.gale1" }, { id: "galeDown2", x: 660, y: 520, label: "Molted feathers", color: "gold", show: "!g.gale1" }],
    legends: [{ id: "L2", enemy: "shearwing", level: 15, chance: 0.04, spots: [[1900, 540], [1550, 1540], [700, 1690], [2400, 540]], when: "!l2.done" }],
    encounter: { table: "jungle", rate: 26, zones: [{ rect: [1850, 880, 850, 280], table: "jungleRoad", rate: 30 }] },
    amb: { birds: 14, water: false, dust: 0xd8e0b0, motes: 50, tint: [0x183018, 0.16], warm: [0xffd890, 0.05], night: 0.2, butterflies: K.flies(W, H, 6),
      armies: [{ id: "patrol1", lane: [[800, 1060], [1300, 1020], [1800, 1030], [2200, 1040]], mode: "pingpong", speed: 36, rows: 2, cols: 4, sight: 240, table: "jungleRoad" }, { id: "patrol2", lane: [[1500, 1010], [2000, 1060], [2450, 1000]], mode: "loop", speed: 32, rows: 2, cols: 3, sight: 240, table: "jungleRoad" }],
      chase: { lane: [[1700, 1030], [2000, 1050], [2300, 1020], [2550, 1000]], table: "jungleRoad" }, standoff: { x: 1250, y: 1230, table: "jungleRoad" } },
  };
  const trees = [["m2_jungleTreeA", 3], ["m2_jungleTreeB", 2], ["m2_giantCeiba", 1], ["m2_stranglerFig", 1.5], ["m2_jungleTreeSlim", 2], ["m2_fanPalm", 1.5], ["m2_bananaTree", 0.8], ["m2_treeFern", 1]];
  def.props = [
    ["m2_fortGate", 2760, 1048, { solid: [105, 30] }], ["m2_watchTower", 2540, 790], ["m2_watchTower", 2640, 1190], ["m2_legionStandard", 2680, 960, { solid: [6, 4] }], ["m2_legionStandard", 2680, 1100, { solid: [6, 4] }],
    ["m2_milestone", 560, 1160], ["m2_milestone", 1400, 1070], ["m2_milestone", 2100, 1120], ["m2_milestone", 2500, 960], ["m2_cageWagon", 1190, 1175, { solid: [60, 20] }], ["m2_cageWagon", 2320, 1100, { solid: [60, 20], flip: true }], ["m2_supplyWagon", 2300, 930, { solid: [50, 18] }],
    ["m2_legionTent", 2330, 880], ["m2_legionTent", 2420, 860], ["m2_weaponRack", 2370, 930], ["m2_signalFirePit", 2450, 930, { solid: false }],
    ["m2_ruinWall", 2060, 1650], ["m2_ruinArch", 2160, 1640], ["m2_ruinPillar", 2000, 1700], ["m2_ruinStairs", 2150, 1730], ["m2_stoneHead", 2220, 1690], ["m2_ruinRubble", 2040, 1620], ["m2_fallenLog", 2230, 1750, { solid: false }],
    ["m2_ruinPillar", 1500, 1500], ["m2_ruinRubble", 1590, 1510, { solid: false }], ["m2_stoneHead", 620, 1700], ["m2_fallenLog", 590, 540, { solid: false }], ["m2_giantBloom", 640, 420, { solid: false }], ["m2_orchidLog", 500, 520, { solid: false }],
    ["m2_spiderMonkey", 1930, 480, { solid: false }], ["m2_redParrot", 2380, 470, { solid: false }], ["m2_tapir", 720, 1660, { solid: false }],
    ["m2_ruinPillar", 2400, 560], ["m2_orchidLog", 1850, 560, { solid: false }], ["m2_mossBoulder", 1330, 160], ["m2_ruinStairs", 2690, 760],
  ].concat(
    K.blockedFill(def, 84, trees, { seed: 431, chance: 0.95, edgeKeys: [["m2_jungleTreeA", 3], ["m2_jungleTreeB", 2], ["m2_giantCeiba", 1], ["m2_stranglerFig", 1.5], ["m2_fanPalm", 2], ["m2_treeFern", 1], ["m2_jungleTreeSlim", 1]], skip: (x, y) => x > 2690 && x < 2830 && y > 860 && y < 1140 }));
  def.scatter = [
    { keys: [["m2_fernClump", 4], ["m2_giantLeaf", 3], ["m2_mushrooms", 1], ["m2_flowerBush", 1.2], ["m2_orchidLog", 0.6], ["m2_mossBoulder", 1], ["m2_thornBush", 1], ["m2_rootTangle", 0.8], ["m2_fallenLog", 0.7]], n: 190, on: ["grass"], seed: 441 },
    { keys: [["m2_fernClump", 3], ["m2_giantLeaf", 2]], n: 90, on: ["road", "paved"], seed: 442, opts: { solid: false, shadow: false } },
  ];
  World.def("greenmawJungle", def);
})();
