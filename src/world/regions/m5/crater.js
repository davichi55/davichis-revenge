// M5 9.3 The Crater Garden (dungeon, 2700x1800): a crater of glass flowers growing round a sleeping, enormous, crystalline shape half-buried in the floor and lit from within (craterSleeper in the middle).
// The way in is the stair on the north rim; paths wind between flower beds and emberwood sentinels; four chests in the quadrants (craterChest1..4). Story: the sleeper is not a fight; trigger `craterSleeper` (walk up
// to the crystal, once) starts the Cinema scene. Table "crater2" 20 s (the hardest random fights). Entries start, from_starfallIsles. Exit starfallIsles@from_craterGarden.
(function () {
  const { R, E, P, L } = World.shapes, M = World.M5, fx = { solid: false };
  const props = M.flat(
    [["craterSleeper", 1350, 1000, { solid: [150, 40] }], ["craterBloomBig", 1130, 870], ["craterBloomBig", 1580, 830], ["craterBloomBig", 1210, 1130, { scale: 0.8 }], ["craterBloomBig", 1520, 1150, { scale: 0.9 }]],
    // flower beds: rings of glass flowers round the sleeper and in the quadrants
    M.ring(["craterFlowerA", "craterFlowerB", "craterFlowerC"], 1350, 950, 420, 270, 18, { seed: 1, jit: 40 }), M.ring(["craterFlowerB", "craterFlowerC", "craterFlowerA"], 1350, 950, 640, 420, 22, { seed: 2, jit: 60 }),
    M.ring(["craterFlowerC", "craterShard", "craterFlowerA"], 1350, 950, 880, 580, 24, { seed: 3, jit: 60 }),
    // sentinels and chimes; ash heaps; shards
    [["craterEmberwood", 700, 560], ["craterEmberwood", 2000, 520], ["craterEmberwood", 640, 1300], ["craterEmberwood", 2080, 1330], ["craterEmberwood", 1350, 360], ["craterChimes", 880, 700, fx], ["craterChimes", 1830, 720, fx], ["craterChimes", 900, 1260, fx], ["craterChimes", 1800, 1260, fx]],
    [["craterAshHeap", 520, 900, fx], ["craterAshHeap", 2200, 940, fx], ["craterAshHeap", 1350, 1480, fx], ["craterShard", 560, 740], ["craterShard", 2150, 780], ["craterShard", 700, 1400], ["craterShard", 2020, 1450]]
  );
  World.def("craterGarden", {
    name: "The Crater Garden", w: 2700, h: 1800, music: "starfall", rim: 40, base: "rock", ground: "assets/regions/craterGarden.jpg",
    look: "A huge round crater seen from above at night: a floor of dark glassy rock covered in glowing glass flowers in violet, teal and amber, in the centre a gigantic crystalline pale-blue shape half buried in the ground and lit from within, soft light on everything, a stair on the north rim, black crater walls.",
    legend: { glass: "dark glassy crater floor with faint violet reflections", ash: "grey star-ash on the crater lip", grass: "beds of glass-flower stems and ash", paved: "bright crystal platform around the sleeper", road: "worn path of crushed glass", rock: "black crater wall" },
    guide: [
      ["ash", E(1350, 900, 1250, 820)], ["glass", E(1350, 900, 1130, 720)], ["grass", E(740, 560, 200, 130)], ["grass", E(2000, 520, 200, 130)], ["grass", E(640, 1300, 200, 130)], ["grass", E(2080, 1330, 200, 130)],
      ["paved", E(1350, 960, 330, 230)], ["road", L([[1350, 40], [1350, 360], [1000, 620], [1000, 960], [1350, 1250], [1700, 960], [1350, 700]], 100)], ["road", L([[1350, 360], [1700, 620], [1700, 960]], 100)],
    ],
    entries: { start: { x: 1350, y: 190, face: "down" }, from_starfallIsles: { x: 1350, y: 190, face: "down" } },
    exits: [{ rect: [1290, 40, 120, 56], to: "starfallIsles", entry: "from_craterGarden", push: [0, 1] }],
    triggers: [{ id: "craterSleeper", rect: [1180, 1040, 340, 200] }],
    chests: [{ id: "craterChest1", x: 560, y: 840 }, { id: "craterChest2", x: 2160, y: 700 }, { id: "craterChest3", x: 760, y: 1440 }, { id: "craterChest4", x: 1980, y: 1500 }],
    props,
    scatter: [{ keys: [["craterFlowerA", 2], ["craterFlowerB", 2], ["craterFlowerC", 2], ["craterShard", 1]], n: 120, seed: 11, on: ["glass", "grass"], opts: {}, scaleRange: [0.7, 1.05] }],
    encounter: { table: "crater2", rate: 20 },
    amb: { motes: 56, dust: 0xb8a0ff, tint: [0x181040, 0.28], warm: [0x8078ff, 0.04], sparkle: { terrain: ["glass", "paved", "grass"], color: 0xc0b0ff, rate: 9 } },
    dark: { ambient: 0.66, radius: 270, fireRadius: 210 },
    lights: [[1350, 960, 420, 1], [1350, 960, 220, 0.8], [1130, 870, 140, 0.8], [1580, 830, 140, 0.8], [700, 560, 130, 0.7], [2000, 520, 130, 0.7], [640, 1300, 130, 0.7], [2080, 1330, 130, 0.7], [1350, 360, 130, 0.7], [560, 840, 100, 0.6], [2160, 700, 100, 0.6], [760, 1440, 100, 0.6], [1980, 1500, 100, 0.6]],
  });
})();
