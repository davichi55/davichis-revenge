// R5 Lookout Chain (M2 spec 7.5): a chain of old stone watch posts linked by rope bridges, the empire's marksmen holding the middle three. Table `lookout` 22 s.
// Puzzle: triggers lookoutPost1..3 (STORY: fight the marksmen, then set lookout.postN = the signal fire is lit); each bridge onward is blocked until the previous post is lit.
// Entries: start, from_featherfallCanopy (SW). Exit: featherfallCanopy@from_lookoutChain. Chest g8_condorTowerWatch (show lookout.post3). Lore spot tribuneTable.
(function () {
  const { R, E, P, L } = World.shapes, K = World.kitM2, W = 2250, H = 1500;
  const pl = (cx, cy, rx, ry, seed) => K.blobPts(cx, cy, rx, ry, seed, { jag: 0.08, n: 18 });
  const posts = [[330, 1220, 240, 150], [800, 960, 210, 140], [1240, 720, 210, 140], [1680, 470, 210, 140], [2000, 220, 190, 110]];
  const def = {
    name: "Lookout Chain", ground: "assets/regions/lookoutChain.jpg", w: W, h: H, music: "canopy", rim: 40, base: "water",
    look: "A chain of old grey stone watch posts on a mountain ridge seen from above: round cracked flagstone platforms with stone towers and signal fire pits, joined by long rope-and-plank bridges across deep gaps; around is open sky with drifting clouds and far-below jungle canopy and cliffs. Cold windy light, weathered stone with red legion banners.",
    legend: { paved: "cracked weathered grey flagstone watch-post platform with moss, arrow scratches and soot", floor: "rope-and-plank bridge deck", water: "open sky with white clouds, far-below green jungle canopy and sheer cliffs, seen from above", rock: "sheer grey cliff with scrub trees" },
    guide: [
      ...posts.map((p, i) => ["paved", P(pl(p[0], p[1], p[2], p[3], 20 + i))]),
      ["floor", L([[480, 1160], [650, 1040]], 84)], ["floor", L([[930, 900], [1110, 780]], 84)], ["floor", L([[1370, 660], [1550, 530]], 84)], ["floor", L([[1800, 410], [1900, 290]], 84)], ["floor", L([[0, 1300], [160, 1260]], 100)],
    ],
    entries: { start: { x: 190, y: 1250, face: "right" }, from_featherfallCanopy: { x: 190, y: 1250, face: "right" } },
    exits: [{ rect: [10, 1200, 50, 110], to: "featherfallCanopy", entry: "from_lookoutChain", push: [-1, 0], floor: "floor" }],
    checkFlags: { "lookout.post1": true, "lookout.post2": true, "lookout.post3": true },
    blockers: [{ rect: [940, 790, 160, 110], hide: "lookout.post1" }, { rect: [1380, 550, 160, 110], hide: "lookout.post2" }, { rect: [1810, 310, 80, 100], hide: "lookout.post3" }],
    triggers: [{ id: "lookoutPost1", rect: [720, 900, 160, 100] }, { id: "lookoutPost2", rect: [1160, 660, 160, 100] }, { id: "lookoutPost3", rect: [1600, 410, 160, 100] }],
    chests: [{ id: "g8_condorTowerWatch", x: 2010, y: 260, show: "lookout.post3" }],
    npcs: [{ id: "tribuneTable", art: "m2_tribuneTable", name: "Tribune's table", x: 1760, y: 540, scale: 1.1 }],
    props: [
      ["m2_stonePost", 330, 1130, { solid: [48, 16] }], ["m2_signalFirePit", 440, 1280, { solid: false, fire: [0, -14, 1] }], ["m2_legionBannerSm", 220, 1180], ["m2_arrowBarrel", 420, 1180],
      ["m2_stonePost", 800, 880, { solid: [48, 16] }], ["m2_marksmanNest", 920, 1040], ["m2_signalFirePit", 700, 1020, { solid: false, hide: "lookout.post1" }], ["m2_signalFirePit", 700, 1020, { solid: false, show: "lookout.post1", fire: [0, -14, 1] }], ["m2_arrowBarrel", 720, 880], ["m2_legionBannerSm", 880, 880],
      ["m2_stonePost", 1240, 640, { solid: [48, 16] }], ["m2_marksmanNest", 1360, 800], ["m2_signalFirePit", 1130, 780, { solid: false, hide: "lookout.post2" }], ["m2_signalFirePit", 1130, 780, { solid: false, show: "lookout.post2", fire: [0, -14, 1] }], ["m2_arrowBarrel", 1160, 640], ["m2_legionBannerSm", 1320, 640],
      ["m2_stonePost", 1680, 390, { solid: [48, 16] }], ["m2_marksmanNest", 1790, 550], ["m2_signalFirePit", 1570, 540, { solid: false, hide: "lookout.post3" }], ["m2_signalFirePit", 1570, 540, { solid: false, show: "lookout.post3", fire: [0, -14, 1] }], ["m2_arrowBarrel", 1600, 400], ["m2_legionBannerSm", 1770, 410],
      ["m2_stonePost", 2000, 150, { solid: [48, 16] }], ["m2_legionBannerSm", 1920, 260], ["m2_signalFirePit", 2100, 270, { solid: false, fire: [0, -14, 1], show: "lookout.post3" }],
    ],
    lights: [[440, 1280, 120, 0.4], [2100, 270, 120, 0.4]],
    encounter: { table: "lookout", rate: 22 },
    amb: { birds: 6, water: false, dust: 0xf0f0f8, motes: 50, tint: [0x203040, 0.1], warm: [0xffe0b0, 0.06], butterflies: [] },
  };
  const at = K.terrainAt(def);
  def.props = def.props.concat(K.blockedFill(def, 110, [["m2_cliffBoulder", 2], ["m2_cliffTree", 1.2], ["m2_mossBoulder", 1]], { seed: 1301, chance: 0.9, skip: (x, y) => at(x, y) === "water" && x > 60 && y > 60 && x < W - 60 && y < H - 60 }));
  World.def("lookoutChain", def);
})();
