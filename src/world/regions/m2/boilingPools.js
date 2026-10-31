// R4 Boiling Pools (M2 spec 3.10): a steaming valley below the road, white-and-orange pools, boardwalks of old timber, pink-grey rock. Table `pools` 22 s.
// Entries: start, from_greenmawJungle (N). Exit: greenmawJungle@from_boilingPools (N). Gather steamstone1..3 (g.steam1..3). Chest poolsChest. NPC bather (old woman in the warm pool).
(function () {
  const { R, E, P, L } = World.shapes, K = World.kitM2, W = 2250, H = 1500;
  const valley = K.blobPts(1125, 800, 1000, 560, 801, { jag: 0.1 });
  const hot = [K.blobPts(600, 640, 170, 110, 811, { jag: 0.16 }), K.blobPts(1500, 600, 190, 110, 812, { jag: 0.16 }), K.blobPts(1700, 1030, 160, 100, 813, { jag: 0.16 }), K.blobPts(560, 1120, 150, 90, 814, { jag: 0.16 }), K.blobPts(1250, 470, 120, 70, 815, { jag: 0.16 })];
  const warm = K.blobPts(1040, 960, 210, 120, 816, { jag: 0.14 });
  const def = {
    name: "Boiling Pools", ground: "assets/regions/boilingPools.jpg", w: W, h: H, music: "jungle", rim: 50, base: "rock",
    look: "A steaming volcanic valley seen from above: pink-grey mineral rock and pale ground with white and orange sulphur crusts, big round hot pools in milky turquoise with orange and white terraces around their rims, drifting steam, old weathered timber boardwalks, bamboo and ferns clinging to the edges, steep pink cliffs all around. Warm, humid, hazy light.",
    legend: { sand: "pale pink-grey mineral ground with white and orange sulphur crust, cracks and small steaming vents", shallow: "hot shallow milky turquoise spring water over orange and white mineral terraces", water: "deep milky turquoise boiling pool with steam", floor: "old weathered timber boardwalk planks", rock: "steep pink-grey mineral cliffs, boulders and dark thickets seen from above" },
    guide: [
      ["sand", P(valley)], ["sand", L([[1100, 20], [1100, 300]], 130)],
      ...hot.map(p => ["shallow", P(K.grow(p, 34))]), ...hot.map(p => ["water", P(p)]), ["shallow", P(warm)],
      ["floor", L([[1100, 40], [1100, 480], [1250, 600]], 90)], ["floor", L([[1100, 600], [760, 650], [600, 760]], 80)], ["floor", L([[1100, 600], [1500, 760], [1700, 860]], 80)], ["floor", L([[1100, 700], [1040, 840]], 80)],
    ],
    entries: { start: { x: 1100, y: 130, face: "down" }, from_greenmawJungle: { x: 1100, y: 130, face: "down" } },
    exits: [{ rect: [1040, 22, 120, 56], to: "greenmawJungle", entry: "from_boilingPools", push: [0, -1] }],
    chests: [{ id: "poolsChest", x: 330, y: 960 }],
    gather: [{ id: "steamstone1", x: 760, y: 820, label: "Steamstone", color: "gold" }, { id: "steamstone2", x: 1680, y: 760, label: "Steamstone", color: "gold" }, { id: "steamstone3", x: 1860, y: 1100, label: "Steamstone", color: "gold" }],
    npcs: [{ id: "bather", art: "npcGranny", name: "Old bather", x: 1040, y: 950 }, { id: null, art: "npcTraveler", x: 800, y: 900, path: [[700, 900], [900, 920]], speed: 14 }],
    props: [
      ["m2_bathHut", 880, 840], ["m2_boardwalkRail", 1000, 560, { solid: false }], ["m2_boardwalkRail", 1200, 720, { solid: false }], ["m2_geyserCone", 620, 650, { solid: false }], ["m2_geyserCone", 1500, 610, { solid: false }], ["m2_geyserCone", 1710, 1040, { solid: false }], ["m2_geyserCone", 1250, 480, { solid: false }], ["m2_geyserCone", 560, 1130, { solid: false }],
      ["m2_mineralCrust", 480, 700, { solid: false }], ["m2_mineralCrust", 1380, 700, { solid: false }], ["m2_mineralCrust", 1820, 960, { solid: false }], ["m2_mineralCrust", 440, 1060, { solid: false }], ["m2_steamBoulder", 330, 880], ["m2_steamBoulder", 1950, 1000], ["m2_steamBoulder", 1300, 1200], ["m2_hotFern", 880, 740, { solid: false }], ["m2_hotFern", 1950, 840, { solid: false }], ["m2_bambooGrove", 300, 1000], ["m2_bambooGrove", 1980, 1180], ["m2_bambooGrove", 1900, 640], ["m2_bambooGrove", 380, 560],
      ["m2_pinkRock", 760, 1230], ["m2_pinkRock", 1500, 1260], ["m2_pinkRock", 1100, 1260], ["m2_hotFern", 1000, 1150, { solid: false }], ["m2_redParrot", 1960, 700, { solid: false }], ["m2_spiderMonkey", 330, 620, { solid: false }],
    ],
    lights: [[600, 640, 190, 0.35], [1500, 600, 200, 0.35]],
    encounter: { table: "pools", rate: 22 },
    amb: { birds: 4, water: true, dust: 0xf0e0d0, motes: 50, tint: [0x401820, 0.1], warm: [0xffb890, 0.08], butterflies: K.flies(W, H, 2), smoke: [[600, 640, 0xe8e0e0], [1500, 600, 0xe8e0e0], [1710, 1030, 0xe8e0e0], [560, 1120, 0xe8e0e0], [1040, 960, 0xe8e0e0], [1250, 470, 0xe8e0e0]] },
  };
  const trees = [["m2_pinkRock", 3], ["m2_bambooGrove", 1], ["m2_steamBoulder", 1], ["m2_hotFern", 1], ["m2_jungleTreeB", 0.6], ["m2_mossBoulder", 1], ["m2_thornBush", 1]];
  def.props = def.props.concat(K.blockedFill(def, 90, trees, { seed: 811, edgeKeys: [["m2_pinkRock", 4], ["m2_bambooGrove", 2], ["m2_steamBoulder", 1], ["m2_hotFern", 1]] }));
  def.scatter = [{ keys: [["m2_mineralCrust", 1], ["m2_hotFern", 2], ["m2_steamBoulder", 1], ["m2_fernClump", 1]], n: 30, on: ["sand"], seed: 821 }];
  World.def("boilingPools", def);
})();
