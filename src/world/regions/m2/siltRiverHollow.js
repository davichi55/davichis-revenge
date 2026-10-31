// R3 Hollow of the Silt River (M2 spec 3.4): mangrove caves, glowing moss, tidal channels. Table `riverCave` 22 s. No boss.
// Entries: start, from_siltRiver (north mouth). Exit: siltRiver@from_hollow. Gather riverPearlBed (10 pearls, g.pearlbed). Chest hollowPearlChest. Lore spot drownedStatue.
(function () {
  const { R, E, P, L } = World.shapes, K = World.kitM2, W = 2250, H = 1500;
  const A = K.blobPts(1125, 340, 340, 210, 201, { jag: 0.18 }), B = K.blobPts(460, 620, 320, 240, 202, { jag: 0.2 }), C = K.blobPts(1800, 640, 340, 240, 203, { jag: 0.2 }), D = K.blobPts(1125, 930, 380, 230, 204, { jag: 0.18 }), F = K.blobPts(1125, 1280, 440, 150, 205, { jag: 0.2 });
  const pool = K.blobPts(430, 640, 150, 90, 211, { jag: 0.18 }), chan = K.ribbonPts(K.wob([[780, 900], [950, 960], [1125, 920], [1300, 970], [1470, 920]], 20, 212, 90), 90, 90);
  const def = {
    name: "Hollow of the Silt River", ground: "assets/regions/siltRiverHollow.jpg", w: W, h: H, music: "river", rim: 50, base: "rock",
    look: "A network of mangrove caves under a river bank, seen from above: damp dark mud and bone-white root floors, glowing teal moss on the walls, tidal water channels and still pools, hanging roots, tiny glowing fungus. Dark and moody with teal and brown tones.",
    legend: { sand: "damp dark cave floor of grey mud and pale roots, with puddles and glowing teal moss", water: "dark still tidal water with faint teal reflections", shallow: "shallow dark water over mud with ripples and a few pale river pearls", rock: "solid cave wall of tangled pale mangrove roots, dark stone and dripping moss, seen from above" },
    guide: [
      ["sand", P(A)], ["sand", P(B)], ["sand", P(C)], ["sand", P(D)], ["sand", P(F)],
      ["sand", L(K.wob([[1125, 20], [1125, 200]], 0, 1, 90), 120)], ["sand", L(K.wob([[880, 380], [700, 480], [600, 560]], 12, 221, 80), 110)], ["sand", L(K.wob([[1370, 380], [1520, 480], [1620, 560]], 12, 222, 80), 110)],
      ["sand", L(K.wob([[620, 800], [780, 880], [920, 900]], 12, 223, 80), 110)], ["sand", L(K.wob([[1630, 820], [1500, 880], [1370, 910]], 12, 224, 80), 110)], ["sand", L(K.wob([[1125, 1100], [1125, 1230]], 0, 1, 90), 130)],
      ["water", P(pool)], ["shallow", P(K.grow(pool, 36))], ["water", P(chan)], ["shallow", L([[1125, 840], [1125, 1000]], 120)],
    ],
    entries: { start: { x: 1125, y: 130, face: "down" }, from_siltRiver: { x: 1125, y: 130, face: "down" } },
    exits: [{ rect: [1060, 22, 130, 56], to: "siltRiver", entry: "from_hollow", push: [0, -1] }],
    npcs: [{ id: "drownedStatue", art: "m2_stoneHead", name: "Drowned statue", x: 1125, y: 800, scale: 1.1 }],
    chests: [{ id: "hollowPearlChest", x: 1860, y: 760 }],
    gather: [{ id: "riverPearlBed", x: 430, y: 760, label: "Pearl bed", color: "gold" }],
    encounter: { table: "riverCave", rate: 22 },
    dark: { ambient: 0.6, radius: 230, fireRadius: 200 },
    lights: [[430, 640, 200, 0.7], [1125, 340, 180, 0.5], [1800, 640, 200, 0.6], [1125, 930, 200, 0.5], [1125, 1280, 180, 0.5]],
    amb: { birds: 0, water: true, dust: 0x9fd8c8, motes: 40, tint: [0x102838, 0.22], warm: [0x40c0b0, 0.05], drips: K.flies(W, H, 6, 9), butterflies: [] },
  };
  const rockKeys = [["m2_paleRootPillar", 2], ["m2_stalagmite", 1], ["m2_dripRock", 1], ["m2_glowShroomBig", 1], ["m2_rootWall", 1]];
  const at = K.terrainAt(def), floor = (x, y) => at(x, y) !== "sand";
  def.props = [
    ["m2_glowShroomBig", 700, 470, { solid: false }], ["m2_glowShroomSmall", 560, 560, { solid: false }], ["m2_glowShroomBig", 1560, 480], ["m2_glowShroomSmall", 1700, 840, { solid: false }], ["m2_caveBones", 1390, 1000, { solid: false }], ["m2_cavePuddle", 900, 1010, { solid: false }], ["m2_sporeCluster", 1250, 1330, { solid: false }],
    ["m2_rubbleHeap", 780, 300], ["m2_stalagmite", 1480, 270], ["m2_glowShroomBig", 1010, 1210], ["m2_fungusShelf", 1330, 1180],
  ].concat(
    K.blockedFill(def, 96, rockKeys, { seed: 231, edgeKeys: [["m2_paleRootPillar", 2], ["m2_stalagmite", 1], ["m2_glowShroomBig", 1], ["m2_dripRock", 1]] }),
    K.fill([60, 60, W - 120, H - 120], 120, [["m2_glowShroomSmall", 2], ["m2_cavePuddle", 1], ["m2_caveBones", 0.4]], { seed: 232, chance: 0.4, opts: { solid: false, shadow: false }, skip: (x, y) => at(x, y) !== "sand" }));
  World.def("siltRiverHollow", def);
})();
