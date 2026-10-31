// R3 Creeping Shore (M2 spec 3.1): grey-brown mangrove shore at dusk, tidal mud, wrecks, a beached rowboat, the first green wall to the east.
// Entries: start, from_sea (west beach), from_tamarsLanding, from_siltRiver. Exits: tamarsLanding@from_shore (north stilt walkway), siltRiver@from_shore (east, need ch3.landed).
// Table `shore` 28 s. Trigger shoreLanding (once), chest shoreChest, gather lostKite (show kite.started or kite=0).
(function () {
  const { R, E, P, L } = World.shapes, K = World.kitM2, W = 2700, H = 1800;
  const seaEdge = K.wob([[440, 0], [410, 240], [370, 500], [400, 760], [350, 1020], [390, 1280], [360, 1540], [430, H]], 30, 11, 90);
  const sea = [[0, 0]].concat(seaEdge, [[0, H]]);
  const fringe = seaEdge.concat(K.wob(seaEdge.map(p => [p[0] + 110, p[1]]), 14, 12, 90).reverse());
  const beachL = seaEdge.filter(p => p[1] > 230 && p[1] < 1600).map(p => [p[0] + 70, p[1]]);
  const beach = beachL.concat(K.wob(beachL.map(p => [p[0] + 190 + (p[1] % 70), p[1]]), 26, 13, 90).reverse());
  // jungle wall in the east with a corridor for the track; thickets (rock) with forest-floor halos (grass)
  const eN = K.wobPoly([[1980, 0], [2700, 0], [2700, 830], [2530, 800], [2380, 700], [2230, 560], [2100, 400], [2010, 220]], 26, 14, 80);
  const eS = K.wobPoly([[2160, H], [2700, H], [2700, 970], [2530, 1000], [2390, 1100], [2250, 1260], [2170, 1500]], 26, 15, 80);
  const cores = [K.blobPts(1180, 230, 220, 120, 21, { jag: 0.25 }), K.blobPts(1560, 120, 200, 90, 22, { jag: 0.22 }), K.blobPts(1000, 1640, 260, 110, 23, { jag: 0.25 }), K.blobPts(1560, 1660, 230, 100, 24, { jag: 0.25 }),
    K.blobPts(1750, 560, 110, 80, 25, { jag: 0.28 }), K.blobPts(1700, 1330, 120, 90, 26, { jag: 0.28 }), K.blobPts(780, 1380, 90, 70, 27, { jag: 0.28 }), K.blobPts(1290, 560, 90, 70, 28, { jag: 0.28 }), K.blobPts(1980, 760, 70, 50, 29, { jag: 0.3 })];
  const pools = [K.blobPts(1430, 880, 110, 60, 31, { jag: 0.2 }), K.blobPts(760, 760, 90, 50, 32, { jag: 0.2 }), K.blobPts(1940, 1190, 120, 70, 33, { jag: 0.2 }), K.blobPts(1250, 1190, 100, 55, 34, { jag: 0.2 }), K.blobPts(1860, 330, 90, 50, 35, { jag: 0.2 })];
  const inlet = K.ribbonPts(K.wob([[360, 640], [560, 650], [760, 600], [900, 560]], 24, 36, 80), 90, 40);
  const mainRoad = K.wob([[610, 1000], [1000, 1040], [1350, 980], [1750, 1010], [2100, 930], [2450, 900], [2660, 900]], 24, 41, 100);
  const northRoad = K.wob([[900, 1020], [870, 780], [760, 530], [610, 340], [520, 190], [490, 40]], 20, 42, 90);
  const wreck1Road = K.wob([[1000, 1040], [1040, 1250], [1090, 1330]], 12, 43, 90), kiteRoad = K.wob([[1040, 1250], [1300, 1400], [1500, 1450]], 14, 44, 90), wreck2Road = K.wob([[1350, 980], [1430, 760], [1500, 570]], 14, 45, 90);
  const trees = ["m2_mangrove", "m2_jungleTreeB", ["m2_jungleTreeA", 2], ["m2_giantCeiba", 1], "m2_stranglerFig"];
  World.def("creepingShore", {
    name: "Creeping Shore", ground: "assets/regions/creepingShore.jpg", w: W, h: H, music: "shore", rim: 60, base: "ash",
    look: "A wide grey-brown tidal shore at dusk seen from above: glossy mud flats with puddles, worm trails and root stubs, a pale beach and a brown-green sea on the west, braided tidal pools, mangrove thickets with tangled roots, and in the east the first dense green wall of jungle. Moody, low orange dusk light, muted greys and browns with deep greens.",
    legend: { ash: "glossy grey-brown tidal mud flat with puddles, worm trails and small shells", sand: "pale damp beach sand with shells and driftwood stains", grass: "dark green mangrove forest floor with roots, ferns and moss", road: "a trodden muddy track with boot prints and plank stepping stones", floor: "weathered wooden stilt walkway planks over the mud", shallow: "shallow brown tidal water over mud with ripples", water: "deep brown-green estuary water and open sea with small waves", rock: "dense impassable mangrove and jungle thicket seen from above: tangled dark green foliage, arching roots and vines" },
    guide: [
      ["water", P(sea)], ["shallow", P(fringe)], ["sand", P(beach)],
      ["water", P(inlet)], ...pools.map(p => ["water", P(p)]), ["shallow", E(1430, 880, 150, 100)], ["shallow", E(760, 760, 130, 90)],
      ...cores.map(c => ["grass", P(K.grow(c, 70))]), ["grass", P(K.grow(eN, 60))], ["grass", P(K.grow(eS, 60))],
      ...cores.map(c => ["rock", P(c)]), ["rock", P(eN)], ["rock", P(eS)],
      ["road", L(mainRoad, 96)], ["road", L(northRoad, 84)], ["road", L(wreck1Road, 80)], ["road", L(kiteRoad, 72)], ["road", L(wreck2Road, 72)],
      ["shallow", L([[820, 640], [940, 700]], 90)], ["floor", L([[600, 340], [540, 220], [500, 40]], 76)],
    ],
    entries: { start: { x: 610, y: 1000, face: "right" }, from_sea: { x: 610, y: 1000, face: "right" }, from_tamarsLanding: { x: 500, y: 150, face: "down" }, from_siltRiver: { x: 2540, y: 900, face: "left" } },
    exits: [
      { rect: [430, 30, 130, 60], to: "tamarsLanding", entry: "from_shore", push: [0, -1], floor: "floor" },
      { rect: [2620, 850, 60, 100], to: "siltRiver", entry: "from_shore", push: [1, 0], need: "ch3.landed", blocked: "shoreEastBlocked" },
    ],
    triggers: [{ id: "shoreLanding", rect: [540, 930, 160, 140] }],
    chests: [{ id: "shoreChest", x: 1010, y: 1372 }],
    gather: [{ id: "lostKite", x: 1500, y: 1452, label: "Cut the kite free", color: "gold", show: { any: ["kite.started", "kite=0"] } }],
    props: [].concat([
      ["m2_beachedBoat", 540, 1110], ["m2_mudBoat", 430, 990, { solid: false, alpha: 0.95 }], ["m2_shipWreck", 1040, 1350, { solid: [90, 18] }], ["m2_shipWreck", 1520, 540, { solid: [90, 18], flip: true }],
      ["m2_kiteTree", 1490, 1440], ["m2_signalPole", 560, 900], ["m2_signalPole", 640, 380], ["m2_oarRack", 590, 1090], ["m2_crabBasket", 668, 1080], ["m2_driftwood", 520, 700], ["m2_driftwood", 560, 1400],
      ["m2_fishStakes", 780, 900], ["m2_fishStakes", 1480, 960], ["m2_lanternBuoy", 520, 1000], ["m2_deadSnag", 1300, 1320], ["m2_deadSnag", 1700, 800], ["m2_sunCroc", 1110, 1420, { solid: false }], ["m2_sunCroc", 1580, 640, { solid: false, flip: true }],
      ["m2_heron", 1470, 850, { solid: false }], ["m2_heron", 1380, 910, { solid: false, flip: true }], ["m2_heron", 800, 770, { solid: false }], ["m2_riverTurtle", 1930, 1210, { solid: false }],
      ["galley", 140, 560, { solid: false, shadow: false, alpha: 0.85 }],
    ], K.edge(eN, 74, trees, { seed: 51, inset: 24, jitter: 26 }), K.edge(eS, 74, trees, { seed: 52, inset: 24, jitter: 26 }), K.fill(eN, 120, trees, { seed: 53, chance: 0.75, opts: {} }), K.fill(eS, 130, trees, { seed: 54, chance: 0.75, opts: {} }),
    ...cores.map((c, i) => K.fill(c, 78, trees, { seed: 60 + i, chance: 0.9 })), K.border(W, H, 90, trees, { seed: 70, band: 90, layers: 2, gaps: [[430, 30, 130, 60], [2620, 850, 60, 100]] })),
    scatter: [
      { keys: [["m2_mudReeds", 3], ["reeds", 2], ["m2_shellMound", 1], ["m2_tidalRock", 1], ["rocks", 1], ["m2_mangroveRoots", 1]], n: 110, on: ["ash", "sand", "shallow"], seed: 31 },
      { keys: [["m2_fernClump", 3], ["m2_giantLeaf", 2], ["m2_mossBoulder", 1], ["m2_mangrove", 2], ["m2_jungleTreeB", 1], ["m2_flowerBush", 1], ["m2_mushrooms", 1]], n: 90, on: ["grass"], seed: 32 },
      { keys: [["m2_driftwood", 1], ["m2_shellMound", 2], ["m2_crabBasket", 1], ["bones", 1]], n: 20, on: ["sand"], seed: 33 },
    ],
    encounter: { table: "shore", rate: 28 },
    amb: { birds: 6, water: true, dust: 0xc8b898, motes: 30, tint: [0x2a2a40, 0.2], warm: [0xff8a50, 0.07], dusk: true, butterflies: [] },
  });
})();
