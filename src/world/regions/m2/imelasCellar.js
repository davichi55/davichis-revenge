// R5 Imela's cellar (M2 spec 7.9): a dry herb cellar: shelves, jars, a low chest, a hidden alcove. Music `letters`. No fights.
// Entries: start, from_imelasHouse (ladder). Exit: imelasHouse@from_imelasCellar. Chest g9_obsidianTalonSkirmisher (G9, three pieces over three visits). Gather featherBlanket (key item, show !g.blanket).
(function () {
  const { R, E, P, L } = World.shapes, K = World.kitM2, W = 900, H = 600;
  const def = {
    name: "Imela's Cellar", ground: "assets/regions/imelasCellar.jpg", w: W, h: H, music: "letters", rim: 30, base: "rock",
    look: "The inside of a small dry stone herb cellar seen from above: packed earth and flagstone floor, rough stone walls, wooden shelves of jars, barrels, bundles of dried herbs hanging, a low alcove in one wall, soft lamp light. Quiet, cool, dusty, warm brown and grey.",
    legend: { floor: "dry packed earth and old flagstone cellar floor with straw and a few dried herbs", wall: "rough fitted grey stone cellar wall top", rock: "solid earth" },
    guide: [["floor", R(80, 120, 740, 380)], ["wall", R(50, 90, 800, 34)], ["wall", R(50, 490, 800, 30)], ["wall", R(50, 90, 34, 430)], ["wall", R(816, 90, 34, 430)], ["floor", E(790, 300, 70, 70)]],
    entries: { start: { x: 200, y: 200, face: "down" }, from_imelasHouse: { x: 200, y: 200, face: "down" } },
    exits: [{ rect: [150, 130, 100, 40], to: "imelasHouse", entry: "from_imelasCellar", push: [0, -1], floor: "floor" }],
    chests: [{ id: "g9_obsidianTalonSkirmisher", x: 450, y: 440 }],
    gather: [{ id: "featherBlanket", x: 790, y: 330, label: "A folded blanket", color: "gold", show: "!g.blanket" }],
    props: [
      ["m2_cLadder", 200, 150, { solid: false }], ["m2_cShelf", 400, 190, { solid: [50, 12] }], ["m2_cShelf", 560, 190, { solid: [50, 12] }], ["m2_cShelf", 700, 210, { solid: [50, 12] }], ["m2_cBarrel", 130, 400], ["m2_cBarrel", 175, 420], ["m2_cJars", 320, 440], ["m2_cCrate", 130, 330], ["m2_cHerbs", 640, 440, { solid: [26, 8] }], ["m2_cAlcove", 800, 270, { solid: [30, 10] }], ["m2_cLamp", 300, 190, { solid: false }], ["m2_cLamp", 600, 450, { solid: false }], ["m2_cJars", 560, 330, { solid: [26, 8] }], ["m2_cCrate", 270, 330],
    ],
    lights: [[300, 190, 180, 0.7], [600, 450, 170, 0.6], [790, 300, 120, 0.6]],
    dark: { ambient: 0.4, radius: 240, fireRadius: 220 },
    amb: { birds: 0, water: false, dust: 0xe8d8b8, motes: 26, tint: [0x201810, 0.14], warm: [0xffd090, 0.08], butterflies: [] },
  };
  World.def("imelasCellar", def);
})();
