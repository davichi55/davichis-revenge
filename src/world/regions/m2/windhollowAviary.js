// R5 Windhollow Aviary (K2, M2 spec 7.4): a cliff-top ruined aviary of carved perches and open cages, stone updrafts, the sky showing through. Table `aviary` 22 s.
// Puzzle: gusts. Three wind wheels (press triggers wheel1..3, flags av.wheel1..3 set by STORY) open updraft vents over the gaps (blockers hide av.wheelN, vent props show av.wheelN); wheel 3 also opens the cage stair to the guardian platform.
// Entries: start, from_featherfallCanopy (W). Exit: featherfallCanopy@from_windhollowAviary. Trigger aviaryGuardian. Chest g10_snatchersPlumage (show k2.done). Lore spot aviaryGhost.
(function () {
  const { R, E, P, L } = World.shapes, K = World.kitM2, W = 2250, H = 1500;
  const pl = (cx, cy, rx, ry, seed) => K.blobPts(cx, cy, rx, ry, seed, { jag: 0.07, n: 20 });
  const def = {
    name: "Windhollow Aviary", ground: "assets/regions/windhollowAviary.jpg", w: W, h: H, music: "aviary", rim: 40, base: "water",
    look: "A ruined cliff-top aviary of carved grey stone seen from above: round and square stone platforms of cracked flagstones with carved bird glyphs, scattered feathers and nests, broken perches and open iron cages, narrow stone bridges, and between the platforms gaps that open onto bright sky with drifting white clouds far below and wind swirl patterns. Windy, bright cold light, weathered stone with a few teal and rust accents.",
    legend: { paved: "cracked weathered grey flagstone floor with carved bird glyphs, feathers, nests and moss", floor: "narrow old stone bridge slabs and rope walkway", bone: "a gap where the floor has fallen away: open sky with white clouds far below and wind swirls", water: "open bright sky with drifting white clouds and cliffs far below, seen from above", rock: "sheer grey cliff rock with hanging vines" },
    guide: [
      ["floor", L([[0, 780], [210, 780]], 100)], ["paved", P(pl(320, 780, 240, 180, 1))], ["bone", R(540, 690, 160, 180)], ["paved", P(pl(920, 780, 250, 190, 2))], ["bone", R(1180, 690, 160, 180)], ["paved", P(pl(1590, 780, 250, 190, 3))],
      ["paved", L([[920, 620], [920, 440]], 110)], ["paved", P(pl(920, 340, 200, 130, 4))], ["paved", L([[1590, 640], [1590, 420]], 120)], ["paved", P(pl(1590, 300, 330, 180, 5))], ["paved", L([[1780, 300], [1950, 300]], 100)], ["paved", P(pl(2040, 300, 130, 100, 6))],
      ["paved", R(500, 780, 40, 50)], ["paved", R(700, 780, 40, 50)], ["paved", R(1150, 780, 40, 50)], ["paved", R(1340, 780, 40, 50)],
    ],
    entries: { start: { x: 160, y: 780, face: "right" }, from_featherfallCanopy: { x: 160, y: 780, face: "right" } },
    exits: [{ rect: [10, 730, 50, 100], to: "featherfallCanopy", entry: "from_windhollowAviary", push: [-1, 0], floor: "floor" }],
    checkFlags: { "av.wheel1": true, "av.wheel2": true, "av.wheel3": true, "k2.done": true },
    blockers: [{ rect: [540, 690, 160, 180], hide: "av.wheel1" }, { rect: [1180, 690, 160, 180], hide: "av.wheel2" }, { rect: [1520, 470, 140, 120], hide: "av.wheel3" }],
    triggers: [{ id: "wheel1", rect: [410, 660, 80, 70], press: true, once: false }, { id: "wheel2", rect: [1050, 650, 80, 70], press: true, once: false }, { id: "wheel3", rect: [1680, 820, 80, 70], press: true, once: false }, { id: "aviaryGuardian", rect: [1500, 330, 180, 110] }],
    chests: [{ id: "g10_snatchersPlumage", x: 2060, y: 340, show: "k2.done" }],
    npcs: [{ id: "aviaryGhost", art: "m2_carvedPerch", name: "Carved perch", x: 920, y: 330, scale: 1.15 }],
    props: [
      ["m2_windWheel", 450, 690, { solid: [10, 6] }], ["m2_windWheel", 1090, 680, { solid: [10, 6] }], ["m2_windWheel", 1720, 850, { solid: [10, 6] }],
      ["m2_updraftVent", 620, 790, { show: "av.wheel1", solid: false }], ["m2_updraftVent", 1260, 790, { show: "av.wheel2", solid: false }], ["m2_cageStair", 1590, 560, { show: "av.wheel3", solid: false }], ["m2_openCage", 1590, 560, { hide: "av.wheel3", solid: [50, 14] }],
      ["m2_rocStatue", 1590, 220, { solid: [80, 24] }], ["m2_aviaryArch", 1380, 270], ["m2_aviaryArch", 1800, 270, { flip: true }], ["m2_runePerch", 1480, 380], ["m2_runePerch", 1700, 380], ["m2_featherPile", 1650, 330, { solid: false }], ["m2_windBanner", 1420, 180], ["m2_windBanner", 1770, 180],
      ["m2_openCage", 190, 700], ["m2_carvedPerch", 230, 870], ["m2_featherPile", 360, 860, { solid: false }], ["m2_windBanner", 430, 870], ["m2_brokenPerch", 250, 700], ["m2_ropeStump", 520, 740],
      ["m2_openCage", 830, 870], ["m2_brokenPerch", 1010, 690], ["m2_featherPile", 900, 860, { solid: false }], ["m2_runePerch", 760, 740], ["m2_carvedPerch", 1050, 880], ["m2_ropeStump", 1160, 740],
      ["m2_openCage", 1500, 700], ["m2_brokenPerch", 1790, 700], ["m2_featherPile", 1520, 880, { solid: false }], ["m2_carvedPerch", 1400, 860], ["m2_windBanner", 1780, 880], ["m2_openCage", 2030, 250], ["m2_featherNest", 840, 280, { solid: false }], ["m2_featherNest", 1010, 290, { solid: false }], ["m2_featherDrift", 880, 400, { solid: false }],
    ],
    encounter: { table: "aviary", rate: 22 },
    amb: { birds: 10, water: false, dust: 0xf0f0f8, motes: 60, tint: [0x203040, 0.08], warm: [0xfff0c0, 0.07], butterflies: [], weather: ["clear"] },
  };
  const at = K.terrainAt(def), clouds = [["m2_giantFeather", 1], ["m2_featherDrift", 1]];
  def.props = def.props.concat(K.blockedFill(def, 110, [["m2_cliffBoulder", 2], ["m2_cliffTree", 1], ["m2_mossBoulder", 1]], { seed: 1201, chance: 0.9, skip: (x, y) => at(x, y) === "water" && x > 60 && y > 60 && x < W - 60 && y < H - 60 }));
  World.def("windhollowAviary", def);
})();
