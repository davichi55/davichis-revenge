// M5 9.2 Starfall Isles (field, 3300x2200): islands cratered with star-metal. West island A (landing from Starhaven), centre island B (the humming shard, chest 2), south islet D (chest 3), NE island C whose
// north tip leads down into the Crater Garden. Land bridges of glassy sand join them; bowls of dark metal, humming stones (they glow), curved metal ribs of something older than the builders, scorched grass,
// meteors. Table "starfall" 26 s. Chests starfallChest1..3, gather starMetalShard (key item, once). Entries start, from_starhaven, from_craterGarden. Exits starhaven@from_starfallIsles (W), craterGarden@from_starfallIsles (NE).
(function () {
  const { R, E, P, L } = World.shapes, M = World.M5, fx = { solid: false };
  const props = M.flat(
    // island A: ribs, bowls, humming stones round the landing
    [["starfallRib", 560, 880], ["starfallRib", 900, 1420], ["starfallBowl", 480, 1250, fx], ["starfallBowl", 1040, 800, fx], ["starfallStone", 330, 960], ["starfallStone", 800, 1200], ["starfallStone", 1140, 1150], ["starfallMeteor", 640, 1300], ["starfallMeteor", 420, 840], ["starfallBurntTree", 700, 760], ["starfallBurntTree", 300, 1320], ["starfallPillar", 960, 960]],
    // island B: the great bowl, ribs, the shard stand
    [["starfallBowl", 1650, 1060, { solid: false, scale: 1.6 }], ["starfallRib", 1400, 780], ["starfallRib", 1960, 860], ["starfallStone", 1560, 900], ["starfallStone", 1760, 950], ["starfallStone", 1650, 1250], ["starfallPillar", 1400, 1180], ["starfallPillar", 1900, 1180], ["starfallMeteor", 1500, 1300], ["starfallMeteor", 1800, 760], ["starfallBurntTree", 1330, 1020], ["starfallBurntTree", 2020, 1100], ["starfallGlassMound", 1700, 1340], ["starfallShards", 1600, 760]],
    // island C: the crater rim and the stair down
    [["starfallRib", 2420, 540], ["starfallRib", 2860, 600], ["starfallStone", 2560, 420], ["starfallStone", 2760, 420], ["starfallBowl", 2650, 780, fx], ["starfallPillar", 2480, 700], ["starfallPillar", 2820, 720], ["starfallMeteor", 2600, 900], ["starfallBurntTree", 2380, 860], ["starfallGlassMound", 2740, 880]],
    // islet D
    [["starfallRib", 1560, 1840], ["starfallStone", 1760, 1820], ["starfallBowl", 1700, 1900, fx], ["starfallMeteor", 1860, 1900], ["starfallShards", 1500, 1920]],
    // bridges: standing stones either side
    M.line("starfallStone", [[1340, 960], [1440, 960]], 100, { seed: 1, opts: fx }), M.line("starfallShards", [[2050, 900], [2300, 760], [2450, 600]], 160, { seed: 2, opts: fx }), M.line("starfallGlassMound", [[1700, 1480], [1700, 1700]], 130, { seed: 3, opts: fx })
  );
  World.def("starfallIsles", {
    name: "Starfall Isles", w: 3300, h: 2200, music: "starfall", rim: 40, base: "water", ground: "assets/regions/starfallIsles.jpg",
    look: "A cluster of low islands cratered with dark star-metal seen from above on a clear day: bowls of dark metal, glass sand with glints, humming standing stones, huge curved metal ribs half buried, scorched grass, black meteors, narrow land bridges of glassy sand between the islands over a deep clear blue sea.",
    legend: { ash: "scorched black ground and glassy sand with glints", glass: "smooth dark star-metal plates with a violet sheen", grass: "scorched dry grass", sand: "pale glassy sand bridges", shallow: "clear turquoise shallows", water: "deep blue sea", rock: "black star-metal rock", road: "worn path" },
    guide: [
      ["shallow", E(700, 1100, 700, 500)], ["shallow", E(1650, 1000, 700, 600)], ["shallow", E(2650, 640, 600, 460)], ["shallow", E(1700, 1850, 500, 280)],
      ["sand", E(700, 1100, 640, 440)], ["sand", E(1650, 1000, 620, 520)], ["sand", E(2650, 640, 520, 380)], ["sand", E(1700, 1850, 420, 200)],
      ["ash", E(700, 1100, 520, 340)], ["ash", E(1650, 1000, 500, 420)], ["ash", E(2650, 640, 420, 290)], ["ash", E(1700, 1850, 320, 140)],
      ["grass", E(420, 1020, 160, 90)], ["grass", E(1900, 1220, 180, 80)], ["grass", E(2420, 760, 150, 80)], ["glass", E(1650, 1060, 280, 170)], ["glass", E(2650, 780, 170, 90)], ["glass", E(700, 1100, 200, 140)],
      ["sand", L([[1250, 1050], [1450, 980]], 220)], ["sand", L([[2020, 960], [2250, 760]], 220)], ["sand", L([[1700, 1380], [1700, 1760]], 200)],
      ["road", R(2590, 290, 120, 100)], ["road", L([[40, 1100], [300, 1100]], 120)],
    ],
    entries: { start: { x: 230, y: 1100, face: "right" }, from_starhaven: { x: 230, y: 1100, face: "right" }, from_craterGarden: { x: 2650, y: 420, face: "down" } },
    exits: [{ rect: [40, 1040, 56, 120], to: "starhaven", entry: "from_starfallIsles", push: [1, 0] }, { rect: [2600, 296, 100, 70], to: "craterGarden", entry: "from_starfallIsles", push: [0, 1] }],
    chests: [{ id: "starfallChest1", x: 560, y: 1010 }, { id: "starfallChest2", x: 1800, y: 1300 }, { id: "starfallChest3", x: 1680, y: 1920 }],
    gather: [{ id: "starMetalShard", x: 1650, y: 960, label: "shard", color: 0xb0b8ff }],
    props,
    scatter: [{ keys: [["starhavenBeachGrass", 2], ["starhavenBlackRock", 1], ["starfallShards", 0.7], ["starfallMeteor", 0.5], ["starfallBurntTree", 0.3]], n: 130, seed: 7, on: ["ash", "grass", "sand"], opts: { solid: false }, scaleRange: [0.6, 1] }],
    encounter: { table: "starfall", rate: 26 },
    npcs: [{ id: null, art: "npcScholarF", x: 800, y: 1120, path: [[420, 1100], [1000, 1120]], speed: 14 }],
    amb: { motes: 36, dust: 0xe0e8ff, tint: [0x20305a, 0.12], warm: [0xc8d8ff, 0.03], water: true, birds: 5, sparkle: { terrain: ["ash", "glass", "sand"], color: 0xd0dcff, rate: 8 } },
  });
})();
