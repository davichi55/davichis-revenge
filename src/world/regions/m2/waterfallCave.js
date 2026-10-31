// R5 Behind the waterfall (M2 spec 7.10, secret): a cave behind a waterfall in the canopy, shafts of light, an old tablet wall. Music `canopy`, no fights.
// Entries: start, from_featherfallCanopy. Exit: featherfallCanopy@from_waterfallCave. Lore spot firstHarvestTablet. Chest waterfallChest.
(function () {
  const { R, E, P, L } = World.shapes, K = World.kitM2, W = 1350, H = 900;
  const cave = K.blobPts(690, 480, 520, 300, 1601, { jag: 0.14 }), pool = K.blobPts(440, 650, 170, 90, 1602, { jag: 0.14 });
  const def = {
    name: "Behind the Waterfall", ground: "assets/regions/waterfallCave.jpg", w: W, h: H, music: "canopy", rim: 40, base: "rock",
    look: "A hidden cave behind a waterfall seen from above: a damp mossy stone ledge floor, a curtain of white falling water along the south edge with spray and mist, a small clear pool, glowing flowers, shafts of golden light falling through the water, an ancient carved stone tablet wall at the back. Magical, cool, green and turquoise with gold light.",
    legend: { sand: "damp mossy dark stone ledge with glowing flowers and small puddles", water: "clear turquoise cave pool with ripples", shallow: "shallow turquoise water over smooth stone", rock: "wet mossy cave rock wall with hanging roots, seen from above" },
    guide: [["sand", P(cave)], ["sand", L([[690, 780], [690, 600]], 130)], ["water", P(pool)], ["shallow", P(K.grow(pool, 30))]],
    entries: { start: { x: 690, y: 780, face: "up" }, from_featherfallCanopy: { x: 690, y: 780, face: "up" } },
    exits: [{ rect: [620, 840, 140, 46], to: "featherfallCanopy", entry: "from_waterfallCave", push: [0, 1] }],
    chests: [{ id: "waterfallChest", x: 1010, y: 560 }],
    npcs: [{ id: "firstHarvestTablet", art: "m2_tabletWall", name: "Carved tablet", x: 690, y: 290, scale: 0.9 }],
    props: [
      ["m2_waterfall", 520, 860, { solid: false }], ["m2_waterfall", 860, 860, { solid: false, flip: true }], ["m2_glowFlowers", 380, 520, { solid: false }], ["m2_glowFlowers", 940, 420, { solid: false }], ["m2_glowFlowers", 1000, 640, { solid: false }], ["m2_caveStalag", 330, 380], ["m2_caveStalag", 1060, 400], ["m2_wetRock", 900, 700], ["m2_wetRock", 480, 380], ["m2_mossLedge", 820, 360, { solid: false }], ["m2_hangingRoots", 560, 250, { solid: false }], ["m2_hangingRoots", 830, 250, { solid: false }], ["m2_fallenSlab", 900, 540],
    ],
    lights: [[690, 300, 260, 0.7], [440, 650, 180, 0.6], [690, 860, 260, 0.5], [1010, 560, 130, 0.5]],
    dark: { ambient: 0.4, radius: 260, fireRadius: 220 },
    amb: { birds: 0, water: true, dust: 0xe0fff0, motes: 50, tint: [0x103028, 0.12], warm: [0xffe8a0, 0.06], drips: K.flies(W, H, 6, 9), butterflies: [], sparkle: { terrain: ["shallow"], color: 0xc0ffff, rate: 8 } },
  };
  const at = K.terrainAt(def);
  def.props = def.props.concat(K.blockedFill(def, 100, [["m2_paleRootPillar", 1.5], ["m2_dripRock", 1.5], ["m2_stalagmite", 1], ["m2_glowShroomBig", 0.6], ["m2_rootWall", 0.8]], { seed: 1611 }));
  World.def("waterfallCave", def);
})();
