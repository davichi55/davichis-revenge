// R5 Sporeroot Caves (M2 spec 7.3): dim caves below the canopy, glowing fungus, pale roots. Table `sporeCave` 22 s.
// Puzzle: the slow lights: three spore-gas fields (engine pulses spore1..3, 6 s cycle, solid while the gas is bright; flag pulse.sporeN) block the corridors A-B, B-C, C-D.
// Entries: start, from_featherfallCanopy. Exit: featherfallCanopy@from_sporerootCaves. Trigger sporeIntro. Gather gloomcapSpores1..3. Chest g15_marshWitchRegrowth (end). Lore spot caveTablet.
(function () {
  const { R, E, P, L } = World.shapes, K = World.kitM2, W = 2250, H = 1500;
  const ch = [[330, 330, 250, 170], [1000, 340, 270, 180], [1000, 860, 290, 180], [1780, 860, 320, 210], [330, 830, 170, 120], [1560, 300, 150, 100], [1000, 1310, 210, 100]].map((c, i) => K.blobPts(c[0], c[1], c[2], c[3], 1100 + i, { jag: 0.15 }));
  const cor = [[[330, 20], [330, 220]], [[560, 330], [770, 340]], [[1000, 500], [1000, 700]], [[1280, 860], [1500, 860]], [[330, 480], [330, 720]], [[1250, 340], [1420, 310]], [[1000, 1030], [1000, 1220]]].map((p, i) => K.wob(p, 8, 1120 + i, 80));
  const def = {
    name: "Sporeroot Caves", ground: "assets/regions/sporerootCaves.jpg", w: W, h: H, music: "sporeCave", rim: 50, base: "rock",
    look: "Dim caves below a giant jungle canopy seen from above: damp dark earth and pale root-tangled floors, big glowing blue and teal fungus caps pulsing softly, drifting green spore clouds, hanging pale roots, stalagmites, dripping water. Dark, eerie and beautiful, with teal and green bioluminescence.",
    legend: { sand: "damp dark cave floor of pale roots, soil and glowing moss with puddles", rock: "solid cave wall of tangled pale roots, dark stone and glowing fungus seen from above" },
    guide: [...ch.map(c => ["sand", P(c)]), ...cor.map(c => ["sand", L(c, 120)])],
    entries: { start: { x: 330, y: 130, face: "down" }, from_featherfallCanopy: { x: 330, y: 130, face: "down" } },
    exits: [{ rect: [265, 22, 130, 56], to: "featherfallCanopy", entry: "from_sporerootCaves", push: [0, -1] }],
    pulses: [{ id: "spore1", rect: [620, 250, 120, 170], period: 6000, duty: 0.5, phase: 0 }, { id: "spore2", rect: [900, 540, 200, 120], period: 6000, duty: 0.5, phase: 2000 }, { id: "spore3", rect: [1330, 770, 120, 170], period: 6000, duty: 0.5, phase: 4000 }],
    triggers: [{ id: "sporeIntro", rect: [260, 260, 140, 100] }],
    chests: [{ id: "g15_marshWitchRegrowth", x: 1930, y: 980 }],
    gather: [{ id: "gloomcapSpores1", x: 330, y: 890, label: "Gloomcap spores", color: "gold" }, { id: "gloomcapSpores2", x: 1590, y: 330, label: "Gloomcap spores", color: "gold" }, { id: "gloomcapSpores3", x: 1000, y: 1340, label: "Gloomcap spores", color: "gold" }],
    npcs: [{ id: "caveTablet", art: "m2_caveTablet", name: "Carved tablet", x: 1080, y: 290, scale: 1.1 }],
    props: [
      ["m2_ventMound", 680, 330, { show: "pulse.spore1", solid: false }], ["m2_ventMound", 650, 280, { show: "pulse.spore1", solid: false, flip: true }], ["m2_ventMound", 700, 390, { show: "pulse.spore1", solid: false }],
      ["m2_ventMound", 940, 640, { show: "pulse.spore2", solid: false }], ["m2_ventMound", 1050, 650, { show: "pulse.spore2", solid: false, flip: true }], ["m2_ventMound", 1000, 600, { show: "pulse.spore2", solid: false }],
      ["m2_ventMound", 1390, 850, { show: "pulse.spore3", solid: false }], ["m2_ventMound", 1360, 800, { show: "pulse.spore3", solid: false, flip: true }], ["m2_ventMound", 1410, 910, { show: "pulse.spore3", solid: false }],
      ["m2_glowShroomBig", 230, 360], ["m2_glowShroomBig", 1120, 400], ["m2_glowShroomSmall", 400, 400, { solid: false }], ["m2_glowShroomBig", 1700, 940], ["m2_glowShroomSmall", 900, 880, { solid: false }], ["m2_glowShroomBig", 1130, 900], ["m2_fungusShelf", 1850, 780], ["m2_caveBones", 1650, 960, { solid: false }], ["m2_caveBones", 280, 780, { solid: false }],
      ["m2_cavePuddle", 1900, 880, { solid: false }], ["m2_cavePuddle", 420, 270, { solid: false }], ["m2_sporeCluster", 1480, 280, { solid: false }], ["m2_sporeCluster", 960, 1290, { solid: false }], ["m2_stalagmite", 1160, 800], ["m2_paleRootPillar", 1880, 1000, { solid: [20, 8] }], ["m2_rubbleHeap", 230, 780],
    ],
    lights: [[330, 330, 220, 0.6], [1000, 340, 230, 0.6], [1000, 860, 230, 0.6], [1780, 860, 250, 0.6], [330, 830, 160, 0.6], [1560, 300, 150, 0.6], [1000, 1310, 170, 0.6], [680, 330, 130, 0.4], [1000, 600, 130, 0.4], [1390, 860, 130, 0.4]],
    dark: { ambient: 0.62, radius: 220, fireRadius: 200 },
    encounter: { table: "sporeCave", rate: 22 },
    amb: { birds: 0, water: false, dust: 0x80f0d0, motes: 50, tint: [0x082030, 0.22], warm: [0x40d0b0, 0.05], drips: K.flies(W, H, 6, 9), butterflies: [], sparkle: { terrain: ["sand"], color: 0x80ffd0, rate: 4 } },
  };
  const rockKeys = [["m2_paleRootPillar", 2], ["m2_stalagmite", 1.5], ["m2_glowShroomBig", 1.2], ["m2_dripRock", 1], ["m2_rootWall", 0.8]], at = K.terrainAt(def);
  def.props = def.props.concat(K.blockedFill(def, 96, rockKeys, { seed: 1131 }), K.fill([60, 60, W - 120, H - 120], 120, [["m2_glowShroomSmall", 2], ["m2_cavePuddle", 1], ["m2_caveBones", 0.3]], { seed: 1132, chance: 0.4, opts: { solid: false, shadow: false }, skip: (x, y) => at(x, y) !== "sand" }));
  World.def("sporerootCaves", def);
})();
