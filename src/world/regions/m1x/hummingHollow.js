// CH1-EXPAND: Hollow of the Humming Glass (cave under the north-east massif of the Humming Ridges): glowing glass floors, a spring, three chambers. Gather emberVein (Cinderglass Embers), chest hollowGlassChest, lore humTablet. Table "dunes" 28 s.
// Entries: start / from_glassRidges (S mouth). Exit: glassRidges@from_hummingHollow.
(function () {
  const { R, E, P, L } = World.shapes, K = World.kitM2, W = 1800, H = 1200;
  const main = K.blobPts(900, 640, 360, 220, 1201, { jag: 0.1 }), west = K.blobPts(330, 480, 220, 170, 1202, { jag: 0.12 }), east = K.blobPts(1470, 470, 230, 190, 1203, { jag: 0.12 }), north = K.blobPts(820, 190, 230, 110, 1204, { jag: 0.1 });
  const def = {
    name: "Hollow of the Humming Glass", ground: "assets/regions/hummingHollow.jpg", w: W, h: H, music: "dungeon", rim: 40, base: "rock",
    look: "The inside of a cave seen from above: dark brown rock walls, floors of smooth glowing teal glass sand with veins of pale glass, a small clear spring pool, a warm ember glow in one side chamber, sparkling glass crystals.",
    legend: { glass: "smooth teal translucent glass sand floor with glowing pale veins, glittering", sand: "dry dusty sand patches", shallow: "clear shallow spring water over glass", water: "deep clear spring water", road: "packed sandy path", rock: "dark brown solid cave rock" },
    guide: [
      ["glass", P(main)], ["glass", P(west)], ["glass", P(east)], ["glass", P(north)],
      ["sand", L([[900, 1160], [900, 820]], 120)], ["sand", L([[620, 560], [420, 520]], 90)], ["sand", L([[1180, 540], [1360, 500]], 90)], ["sand", L([[880, 430], [830, 260]], 90)],
      ["shallow", E(900, 600, 120, 70)], ["water", E(900, 600, 70, 36)],
    ],
    dark: { ambient: 0.62, radius: 250 },
    entries: { start: { x: 900, y: 1060, face: "up" }, from_glassRidges: { x: 900, y: 1060, face: "up" } },
    exits: [{ rect: [840, 1110, 120, 50], to: "glassRidges", entry: "from_hummingHollow", push: [0, -1] }],
    chests: [{ id: "hollowGlassChest", x: 1560, y: 540 }],
    gather: [{ id: "emberVein", x: 330, y: 540, label: "A coal inside the glass", color: "gold" }],
    npcs: [{ id: "humTablet", art: "lightStele", name: "Builder tablet", x: 840, y: 270, hint: "E / Space: read the tablet" }],
    props: [
      ["glassCluster", 560, 500, { solid: [16, 10] }], ["glassCluster", 1240, 760, { solid: [16, 10] }], ["glassSpire", 640, 770], ["glassSpire", 1160, 480], ["glassShard", 400, 600], ["glassShard", 1380, 400], ["builderPillar", 780, 340], ["builderPillar", 900, 340],
      ["vaultRubble", 1460, 620], ["cairn", 260, 430, {}], ["skull", 1500, 580],
    ],
    scatter: [{ keys: [["glassShard", 4], ["glassSpire", 2], ["puddle", 1]], n: 40, on: ["glass"], seed: 1201, scaleRange: [0.7, 1] }],
    lights: [[330, 540, 130, 0.7], [900, 600, 150, 0.4], [1560, 540, 100, 0.4]],
    encounter: { table: "dunes", rate: 28 },
    amb: { motes: 30, tint: [0x103040, 0.2], dust: 0xa8e0d8, water: true, sparkle: { terrain: ["glass"], color: 0xbfffee, rate: 8 }, drips: [[640, 770], [1160, 480]] },
  };
  World.def("hummingHollow", def);
})();
