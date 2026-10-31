// R5 Featherfall Canopy (M2 spec 7.1): giant trees, rope bridges and wooden platforms in mist, shafts of light, hanging feather charms, the dark Spire to the north. Table `canopy` 26 s + zone `canopyLegion` 30 s (altar platforms).
// Entries: start, from_greenmawJungle (S lift), from_plumeRest, from_sporerootCaves, from_windhollowAviary, from_lookoutChain, from_canopySpire (N), from_marigoldHollow (S long stair), from_waterfallCave.
// Exits: greenmawJungle (S), plumeRest (W bridge), sporerootCaves, windhollowAviary (E), lookoutChain (NE), canopySpire (N, need ch4.s3), marigoldHollow (S), waterfallCave (NW, signpost).
// Triggers canopyArrive, platformS2 (altar platform 1), spireApproachS3 (altar platform 2, show ch4.s2). Legend L3 (3 platforms, moonless). Gather featherMolt1/2. Chests canopyChest1, canopyChest2 (hidden ledge under the second bridge).
(function () {
  const { R, E, P, L } = World.shapes, K = World.kitM2, W = 3150, H = 2100;
  const plat = (cx, cy, rx, ry, seed) => K.blobPts(cx, cy, rx, ry, seed, { jag: 0.07, n: 20 });
  const P_ = { A: plat(1500, 1900, 260, 120, 1), B: plat(1500, 1450, 230, 140, 2), C: plat(1500, 1000, 340, 210, 3), D: plat(700, 1050, 230, 150, 4), E: plat(600, 1650, 220, 130, 5), F: plat(2300, 1000, 230, 150, 6), G: plat(2450, 450, 230, 140, 7), H: plat(1600, 330, 250, 140, 8), I: plat(650, 420, 230, 140, 9), J: plat(1000, 620, 240, 150, 10), K: plat(2350, 1600, 230, 140, 11), M: plat(1950, 1160, 90, 55, 12) };
  const br = (pts, w) => ["floor", L(pts, w || 74)];
  const def = {
    name: "Featherfall Canopy", ground: "assets/regions/featherfallCanopy.jpg", w: W, h: H, music: "canopy", rim: 40, base: "water",
    look: "A cloud-forest canopy seen from above: round wooden plank platforms built around the trunks of giant trees, joined by narrow rope-and-plank bridges, hung with feather charms and lanterns; below and around is a sea of white mist with the dark green tops of giant trees far down; golden shafts of light. Misty, airy, mysterious, deep greens with warm wood.",
    legend: { floor: "weathered wooden plank platform floor with rope lashings, feathers and moss", water: "a sea of white drifting mist with the dark green crowns of giant jungle trees far below, seen from above" , road: "a mossy wooden ledge with ferns", rock: "dense hanging jungle foliage" },
    guide: [
      ...Object.values(P_).map(p => ["floor", P(p)]),
      br([[1500, 1760], [1500, 1600]], 80), br([[1500, 1580], [1500, 1180]], 80), br([[1260, 1010], [900, 1040]], 74), br([[640, 1190], [600, 1530]], 70), br([[1700, 1020], [2090, 1000]], 74), br([[2330, 870], [2430, 590]], 70), br([[1300, 880], [1130, 740]], 70),
      br([[1560, 800], [1600, 460]], 74), br([[700, 920], [670, 540]], 70), br([[1700, 1470], [2200, 1560]], 70), br([[2330, 1130], [2350, 1470]], 70), br([[1100, 640], [1420, 340]], 66), br([[700, 1040], [20, 1050]], 74), br([[1950, 1000], [1950, 1130]], 62),
      br([[2530, 1000], [3130, 1000]], 74), br([[2620, 450], [2900, 300]], 84), br([[1600, 190], [1600, 20]], 74), br([[1500, 2010], [1500, 2090]], 80), br([[2350, 1700], [2350, 2090]], 80), br([[560, 420], [30, 420]], 74),
    ],
    entries: { start: { x: 1500, y: 1900, face: "up" }, from_greenmawJungle: { x: 1500, y: 1960, face: "up" }, from_plumeRest: { x: 130, y: 1050, face: "right" }, from_sporerootCaves: { x: 600, y: 1700, face: "down" }, from_windhollowAviary: { x: 3000, y: 1000, face: "left" }, from_lookoutChain: { x: 2820, y: 340, face: "left" }, from_canopySpire: { x: 1600, y: 120, face: "down" }, from_marigoldHollow: { x: 2350, y: 1960, face: "up" }, from_waterfallCave: { x: 130, y: 420, face: "right" } },
    exits: [
      { rect: [1440, 2040, 120, 50], to: "greenmawJungle", entry: "from_featherfallCanopy", push: [0, 1], floor: "floor" },
      { rect: [20, 1000, 50, 100], to: "plumeRest", entry: "from_featherfallCanopy", push: [-1, 0], floor: "floor" },
      { rect: [520, 1700, 160, 40], to: "sporerootCaves", entry: "from_featherfallCanopy", push: [0, 1], floor: "floor" },
      { rect: [3060, 950, 60, 100], to: "windhollowAviary", entry: "from_featherfallCanopy", push: [1, 0], floor: "floor" },
      { rect: [2870, 250, 100, 100], to: "lookoutChain", entry: "from_featherfallCanopy", push: [1, -1], floor: "floor" },
      { rect: [1540, 24, 120, 50], to: "canopySpire", entry: "from_featherfallCanopy", push: [0, -1], floor: "floor", need: "ch4.s3", blocked: "spireBlocked" },
      { rect: [2290, 2040, 120, 50], to: "marigoldHollow", entry: "from_featherfallCanopy", push: [0, 1], floor: "floor" },
      { rect: [20, 370, 50, 100], to: "waterfallCave", entry: "from_featherfallCanopy", push: [-1, 0], floor: "floor" },
    ],
    triggers: [{ id: "canopyArrive", rect: [1420, 1830, 160, 90] }, { id: "platformS2", rect: [940, 580, 120, 100] }, { id: "spireApproachS3", rect: [1540, 280, 120, 100], show: "ch4.s2" }],
    chests: [{ id: "canopyChest1", x: 1380, y: 1500 }, { id: "canopyChest2", x: 1950, y: 1160 }],
    gather: [{ id: "featherMolt1", x: 470, y: 1610, label: "Molted feathers", color: "gold" }, { id: "featherMolt2", x: 2560, y: 1640, label: "Molted feathers", color: "gold" }],
    legends: [{ id: "L3", enemy: "motherGlowmoth", level: 21, chance: 0.05, spots: [[700, 440], [2450, 470], [2300, 1640]], when: "sky.moonless" }],
    props: [
      ["m2_canopyTrunk", 1500, 1030, { solid: [70, 26] }], ["m2_canopyTrunk", 700, 1090, { solid: [70, 26], scale: 0.8 }], ["m2_canopyTrunk", 2300, 1040, { solid: [70, 26], scale: 0.8 }], ["m2_canopyTrunk", 1000, 650, { solid: [70, 26], scale: 0.8 }], ["m2_canopyTrunk", 1600, 360, { solid: [70, 26], scale: 0.8 }], ["m2_canopyTrunk", 2450, 480, { solid: [70, 26], scale: 0.7 }], ["m2_canopyTrunk", 650, 450, { solid: [70, 26], scale: 0.7 }], ["m2_canopyTrunk", 2350, 1640, { solid: [70, 26], scale: 0.7 }],
      ["m2_canopyHut", 1380, 1960], ["m2_featherSign", 1590, 1900], ["m2_bridgeAnchor", 1390, 1760], ["m2_bridgeAnchor", 1610, 1760], ["m2_wovenLantern", 1430, 1960, { solid: false }], ["m2_lashedCrates", 1630, 1500], ["m2_featherCharms", 1270, 1440], ["m2_featherCharms", 1740, 1470],
      ["m2_legionOutpost", 1180, 1000], ["m2_giantBloom", 1740, 980, { solid: false }], ["m2_featherCharms", 1300, 1130], ["m2_featherCharms", 1700, 1130],
      ["m2_featherSign", 80, 1110], ["m2_hangingMoss", 590, 960, { solid: false }], ["m2_bridgeAnchor", 520, 1090], ["m2_wovenLantern", 800, 1150, { solid: false }],
      ["m2_cableWinch", 470, 1700], ["m2_featherSign", 540, 1590], ["m2_nestSeat", 700, 1700], ["m2_hangingMoss", 780, 1630, { solid: false }],
      ["m2_featherSign", 2560, 1060], ["m2_bridgeAnchor", 2540, 960], ["m2_windBanner", 2400, 1100], ["m2_windBells", 2200, 940],
      ["m2_legionBannerSm", 2320, 400], ["m2_marksmanNest", 2560, 400], ["m2_arrowBarrel", 2380, 530, { solid: false }], ["m2_signalFirePit", 2540, 540, { solid: false }], ["m2_featherSign", 2720, 300],
      ["m2_runePerch", 1480, 250], ["m2_giantFeather", 1700, 300, { solid: false }], ["m2_featherCharms", 1750, 380], ["m2_featherCharms", 1450, 380], ["m2_wovenLantern", 1700, 400, { solid: false }],
      ["m2_collarAltar", 1000, 700, { solid: [50, 16] }], ["m2_obsidianStele", 880, 640], ["m2_obsidianStele", 1120, 640], ["m2_legionBannerSm", 900, 700], ["m2_legionBannerSm", 1110, 720], ["m2_ropeStump", 820, 580],
      ["m2_collarAltar", 1600, 250, { solid: [50, 16], show: "ch4.s2" }], ["m2_obsidianStele", 1480, 300, { show: "ch4.s2" }], ["m2_obsidianStele", 1720, 300, { show: "ch4.s2" }],
      ["m2_hangingMoss", 760, 380, { solid: false }], ["m2_featherSign", 120, 480], ["m2_waterfall", 80, 360, { solid: false, scale: 0.8 }], ["m2_glowFlowers", 620, 480, { solid: false }], ["m2_giantBloom", 560, 440, { solid: false }],
      ["m2_featherSign", 2350, 1780], ["m2_windBells", 2480, 1660], ["m2_bridgeAnchor", 2300, 1760], ["m2_nestSeat", 2250, 1600], ["m2_hangingMoss", 1950, 1050, { solid: false }],
    ],
    lights: [[1500, 1030, 200, 0.4], [1000, 700, 160, 0.5], [2540, 540, 140, 0.4]],
    encounter: { table: "canopy", rate: 26, zones: [{ rect: [800, 460, 400, 320], table: "canopyLegion", rate: 30 }, { rect: [1360, 220, 480, 260], table: "canopyLegion", rate: 30 }] },
    amb: { birds: 8, water: false, dust: 0xe8f0e0, motes: 60, tint: [0x18302c, 0.12], warm: [0xffe8a0, 0.06], weather: ["mist", "mist", "clear"], night: 0.3, butterflies: K.flies(W, H, 4),
      armies: [{ id: "altar1", lane: [[900, 700], [1100, 700], [1100, 560], [900, 560]], mode: "loop", speed: 24, rows: 2, cols: 3, sight: 200, table: "canopyLegion" }, { id: "altar2", lane: [[1480, 380], [1720, 380], [1720, 260], [1480, 260]], mode: "loop", speed: 24, rows: 2, cols: 3, sight: 200, table: "canopyLegion", show: "ch4.s2" }] },
  };
  const at = K.terrainAt(def), crowns = [["m2_jungleTreeB", 2], ["m2_jungleTreeA", 2], ["m2_giantCeiba", 1], ["m2_fanPalm", 1]];
  def.props = def.props.concat(K.fill([0, 0, W, H], 150, crowns, { seed: 911, chance: 0.5, opts: { solid: false, shadow: false, alpha: 0.9 }, skip: (x, y) => { if (at(x, y) !== "water") return true; for (const [dx, dy] of [[70, 0], [-70, 0], [0, 70], [0, -70], [50, 50], [-50, -50], [50, -50], [-50, 50]]) if (at(x + dx, y + dy) !== "water") return true; return x < 40 || y < 40 || x > W - 40 || y > H - 30; } }));
  World.def("featherfallCanopy", def);
})();
