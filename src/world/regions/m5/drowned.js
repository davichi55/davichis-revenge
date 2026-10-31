// M5 9.4 The Drowned Capital (dungeon, 2700x1800): the builders' sunken capital reached by the diving bell. A great avenue of black-and-gold stone with its light-lines still glowing runs west to east
// into the dry cooling chamber (a lit floor); three cross streets with plazas run north and south; the rest is dark canal water with domes, bridges, coral colossi and drowned machinery on the blocks.
// Legend L8 (The Last Warden, never respawns) kneels on the great avenue. Lore chests builderLogChest1..2. Table "drowned" 22 s. Entries start, from_bell. Exit weepingSea@from_drownedCapital (the bell up, west).
(function () {
  const { R, E, P, L } = World.shapes, M = World.M5, fx = { solid: false };
  const props = M.flat(
    // blocks of buildings on the canal water: domes, walls, colossi, bridges over the cross streets
    [["drownedDome", 340, 520], ["drownedDome", 860, 480], ["drownedDome", 1400, 520], ["drownedDome", 1900, 470], ["drownedDome", 340, 1330], ["drownedDome", 860, 1370], ["drownedDome", 1400, 1340], ["drownedDome", 1900, 1380]],
    [["drownedColossus", 1250, 740], ["drownedColossus", 1550, 1060], ["drownedColossus", 380, 1080], ["drownedColossus", 2340, 400], ["drownedColossus", 760, 700]],
    [["drownedBridge", 860, 900, { solid: false }], ["drownedBridge", 1400, 900, { solid: false }], ["drownedBridge", 600, 600, { solid: false }], ["drownedBridge", 1700, 1200, { solid: false }]],
    // the avenue: steles and light pylons, statues, rubble, shells and vents
    M.line("drownedStele", [[160, 770], [1850, 770]], 280, { seed: 1, opts: fx }), M.line("drownedLightPylon", [[200, 1040], [1850, 1040]], 300, { seed: 2, opts: fx }), M.line("drownedStatue", [[300, 760], [1700, 760]], 560, { seed: 3, jit: 6 }),
    M.line("drownedPillar", [[500, 330], [500, 1480]], 360, { seed: 4, opts: fx }), M.line("drownedPillar", [[1200, 330], [1200, 1480]], 360, { seed: 5, opts: fx }), M.line("drownedPillar", [[1800, 330], [1800, 1480]], 360, { seed: 6, opts: fx }),
    M.rect(["drownedRubble", "drownedShell", "drownedCrates", "drownedVent", "drownedAnemone"], 120, 300, 1900, 1500, 24, { seed: 7, flipR: true, avoid: [[1500, 900, 200]], opts: fx }),
    // coral and kelp on the canal banks, wrecks
    M.rect(["drownedCoral", "drownedKelp", "drownedAnemone", "drownedWreck"], 100, 120, 2600, 1700, 30, { seed: 8, flipR: true, opts: fx, avoid: [[600, 900, 300], [1100, 900, 300], [1700, 900, 300]] }),
    [["drownedWreck", 2480, 1500], ["drownedWreck", 150, 220, { scale: 0.9 }], ["drownedBlockWall", 1000, 330], ["drownedBlockWall", 1600, 1530]],
    // the cooling chamber: pylons, pillars, steles, vents
    [["drownedLightPylon", 2040, 640, fx], ["drownedLightPylon", 2040, 1160, fx], ["drownedLightPylon", 2560, 640, fx], ["drownedLightPylon", 2560, 1160, fx], ["drownedPillar", 2150, 560], ["drownedPillar", 2450, 560], ["drownedPillar", 2150, 1230], ["drownedPillar", 2450, 1230], ["drownedStele", 2300, 600, fx], ["drownedStele", 2300, 1200, fx], ["drownedVent", 2300, 900, fx], ["drownedStatue", 2540, 900]],
    // lore chest nooks
    [["drownedStele", 1060, 330, fx], ["drownedStele", 1740, 1530, fx], ["drownedLightPylon", 1160, 340, fx], ["drownedLightPylon", 1780, 1520, fx]]
  );
  World.def("drownedCapital", {
    name: "The Drowned Capital", w: 2700, h: 1800, music: "drowned", rim: 40, base: "water", ground: "assets/regions/drownedCapital.jpg",
    look: "A sunken city of black-and-gold builder stone on the sea floor seen from above, lit by glowing cyan and gold light-lines still running along the streets: a great avenue, domes, bridges over dark canals, huge coral-encrusted colossi, drifting kelp, and at the east end a dry round chamber with a brightly lit floor, murky blue-green water light.",
    legend: { glass: "black-and-gold builder stone street with glowing light-lines", paved: "polished black stone plazas with gold inlay", floor: "bright lit dry chamber floor with gold lines", water: "dark deep canal water with drifting silt", shallow: "murky shallow silt", rock: "black stone wall" },
    guide: [
      ["shallow", R(60, 100, 2540, 1600)], ["water", R(80, 120, 2500, 1560)],
      ["glass", L([[60, 900], [1980, 900]], 300)], ["glass", L([[600, 270], [600, 1530]], 200)], ["glass", L([[1100, 270], [1100, 1530]], 200)], ["glass", L([[1700, 270], [1700, 1530]], 200)],
      ["paved", E(600, 900, 270, 270)], ["paved", E(1100, 900, 270, 270)], ["paved", E(1700, 900, 270, 270)], ["paved", E(600, 270, 200, 130)], ["paved", E(1100, 270, 200, 130)], ["paved", E(1700, 270, 200, 130)], ["paved", E(600, 1530, 200, 130)], ["paved", E(1100, 1530, 200, 130)], ["paved", E(1700, 1530, 200, 130)],
      ["floor", R(1980, 520, 640, 760)], ["glass", L([[2000, 900], [2600, 900]], 80)], ["glass", L([[2300, 540], [2300, 1260]], 80)], ["paved", R(40, 840, 200, 120)],
    ],
    entries: { start: { x: 150, y: 900, face: "right" }, from_bell: { x: 150, y: 900, face: "right" } },
    exits: [{ rect: [40, 840, 56, 120], to: "weepingSea", entry: "from_drownedCapital", push: [1, 0], floor: "paved" }],
    legends: [{ id: "L8", enemy: "lastWarden", level: 76, chance: 0.06, spots: [[1400, 900], [1550, 900], [1850, 900]] }],
    chests: [{ id: "builderLogChest1", x: 1100, y: 350 }, { id: "builderLogChest2", x: 1700, y: 1450 }],
    gather: [{ id: "lanternGlass1", x: 600, y: 1520, label: "Lantern beads on a coral post", color: 0xa0f0ff }, { id: "lanternGlass2", x: 1700, y: 290, label: "Cold light in the jelly", color: 0xa0f0ff }],
    props,
    encounter: { table: "drowned", rate: 22 },
    amb: { motes: 60, dust: 0x80c0c0, tint: [0x083038, 0.34], warm: [0x40c0b0, 0.04], sparkle: { terrain: ["glass", "floor"], color: 0x80ffe8, rate: 8 }, water: true },
    dark: { ambient: 0.66, radius: 270, fireRadius: 210 },
    lights: [[300, 760, 120, 0.6], [900, 760, 120, 0.6], [1500, 760, 130, 0.7], [2040, 640, 160, 0.8], [2040, 1160, 160, 0.8], [2560, 640, 160, 0.8], [2560, 1160, 160, 0.8], [2300, 900, 330, 0.9], [1160, 340, 130, 0.8], [1780, 1520, 130, 0.8], [600, 900, 150, 0.6], [1100, 900, 150, 0.6], [1700, 900, 150, 0.6], [500, 1040, 120, 0.6], [1300, 1040, 120, 0.6]],
  });
})();
