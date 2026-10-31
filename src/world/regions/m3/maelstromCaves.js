// M3 / ch6: Maelstrom Caves (dungeon, dark, optional boss). Table "maelstrom" 22 s. Entries start from_gullrest from_sea. Exits gullrest@from_maelstromCaves (W mouth), weepingSea@from_maelstromCaves (S mouth).
// Trigger motherFight (the great round chamber, north of the pool). Chest g38_whirlpoolSiren.
(function () {
  const { R, E, P, L } = World.shapes, M = World.m3, props = [];
  // the great round chamber: reef teeth ring, glow-moss, anemones, a drowned pillar or two around the pool
  props.push(...M.ring(["m2_wetRock", "drownedCoral", "m2_stalagmite", "drownedAnemone"], 1100, 700, 360, 250, 12, {}, 0, undefined, 10, 3), ["drownedPillar", 760, 560], ["drownedPillar", 1440, 560], ["drownedKelp", 800, 820, { solid: false }], ["drownedKelp", 1400, 840, { solid: false }], ["m2_glowShroomBig", 900, 450], ["m2_glowShroomBig", 1310, 450], ["m2_caveCrystals", 1100, 400, { tint: 0x80d8ff }]);
  // passages: stalagmites and wet rocks along the walls, glow-moss lamps, bones of the drowned
  props.push(...M.row(["m2_stalagmite", "m2_caveStalag", "m2_wetRock"], 160, 600, 640, 580, 5, {}, 14, 4), ...M.row(["m2_stalagmite", "m2_wetRock"], 160, 880, 640, 860, 5, {}, 14, 5), ...M.row(["m2_stalagmite", "m2_caveStalag"], 1350, 1380, 1260, 1000, 5, {}, 16, 6), ...M.row(["m2_stalagmite", "m2_wetRock"], 1650, 1380, 1600, 1100, 4, {}, 14, 7));
  props.push(["m2_glowShroomSmall", 300, 700], ["m2_glowShroomSmall", 520, 740], ["m2_glowShroomBig", 560, 640], ["m2_glowShroomSmall", 1500, 1200], ["m2_glowShroomBig", 1420, 1300], ["m2_caveBones", 420, 780], ["m2_caveBones", 1560, 1260], ["bones", 900, 1000], ["drownedWreck", 300, 1000, { scale: 0.7 }], ["m2_dripRock", 220, 680], ["m2_dripRock", 1700, 1300], ["m2_caveMouth", 120, 750, { solid: false }], ["m2_caveMouth", 1500, 1440, { solid: false }]);
  // the north-east side cave with the siren's chest and a wreck
  props.push(["m2_shipWreck", 1740, 360, { scale: 0.7 }], ["m2_caveCrystals", 1520, 330, { tint: 0x80d8ff }], ["m2_glowShroomBig", 1660, 460], ["drownedCoral", 1840, 480], ["m2_stalagmite", 1900, 340], ["m2_wetRock", 1580, 250], ["m2_caveBones", 1850, 420]);
  World.def("maelstromCaves", {
    name: "Maelstrom Caves", w: 2200, h: 1500, base: "rock", music: "seaCave", rim: 44,
    look: "Sea caves around a whirlpool seen from above: wet black rock passages with shallow glistening water on the floor, a great round chamber in the middle with a dark spinning whirlpool made of concentric rings of deep water and foam, a ring of wet stone around it, glowing blue-green moss, anemones and corals on the rocks, foam at the edges. Cold, wet, eerie blue-green light.",
    legend: { floor: "wet black cave rock floor, glistening, with shells and kelp", shallow: "ankle-deep clear blue-green water over dark rock with ripples", water: "dark deep churning water with white spiral foam, the whirlpool", rock: "wet black cave walls and rock teeth, impassable" },
    bank: { floor: "grey", shallow: "teal", water: "water" }, grade: { floor: { mul: [0.4, 0.5, 0.6], add: [0, 6, 12] }, shallow: { mul: [0.7, 1.15, 1.2], add: [0, 20, 24] }, water: { mul: [0.7, 1.2, 1.3], add: [0, 10, 16] }, _: [0.95, 1.02, 1.05] },
    marks: [{ k: "dot", on: ["floor", "shallow"], n: 70, col: [140, 230, 220], a: 0.6, r: [1, 2], hi: false }],
    guide: [
      ["floor", E(1100, 700, 470, 330)], ["shallow", E(1100, 700, 360, 250)], ["water", E(1100, 700, 250, 170)], ["shallow", E(1100, 700, 150, 100)], ["water", E(1100, 700, 70, 48)],
      ["floor", L([[44, 750], [330, 720], [700, 700]], 170)], ["shallow", L([[44, 750], [330, 720]], 100)], ["floor", L([[1500, 1456], [1500, 1200], [1250, 1020], [1130, 900]], 170)], ["shallow", L([[1500, 1456], [1500, 1250]], 100)],
      ["floor", L([[1330, 560], [1560, 420], [1800, 440]], 150)], ["floor", E(1750, 420, 220, 130)], ["shallow", E(1700, 400, 120, 60)], ["floor", L([[1700, 560], [1560, 700], [1500, 760]], 120)], ["floor", L([[1100, 1000], [700, 1060], [330, 1000]], 130)], ["shallow", E(320, 1000, 120, 70)],
    ],
    entries: { start: { x: 150, y: 750, face: "right" }, from_gullrest: { x: 150, y: 750, face: "right" }, from_sea: { x: 1500, y: 1380, face: "up" } },
    exits: [{ rect: [0, 690, 80, 120], to: "gullrest", entry: "from_maelstromCaves", push: [1, 0] }, { rect: [1440, 1440, 120, 60], to: "weepingSea", entry: "from_maelstromCaves", push: [0, -1] }],
    triggers: [{ id: "motherFight", rect: [1000, 400, 200, 100] }],
    chests: [{ id: "g38_whirlpoolSiren", x: 1850, y: 400 }],
    props,
    scatter: [{ keys: [["m2_wetRock", 2], ["m2_caveBones", 1], ["m2_cavePuddle", 2], ["m2_glowShroomSmall", 1]], n: 30, on: ["floor", "shallow"], seed: 151, scaleRange: [0.7, 1] }],
    lights: [[1100, 700, 250, 0.55], [900, 450, 110, 0.6], [1310, 450, 110, 0.6], [560, 640, 110, 0.6], [1420, 1300, 110, 0.6], [1660, 460, 110, 0.6], [1520, 330, 110, 0.6]],
    dark: { ambient: 0.5, radius: 240, color: 0x020a14 },
    encounter: { table: "maelstrom", rate: 22 },
    amb: { birds: 0, butterflies: [], water: true, motes: 60, dust: 0x90e0e0, tint: [0x083040, 0.14], drips: [[400, 700], [1000, 950], [1700, 450]], sparkle: { terrain: ["shallow"], color: 0xa8ffff, rate: 3 } },
  });
})();
