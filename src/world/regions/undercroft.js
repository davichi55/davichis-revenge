// R0 Orun Undercroft: short tutorial cellar (dark), leaky builder pipes. Encounter table "undercroft". Chest: undercroftChest. Triggers: cellarTutorial, undercroftDeep.
(function () {
  const { R, E, P, L } = World.shapes;
  World.def("orunUndercroft", {
    name: "Orun Undercroft", w: 1300, h: 860, base: "rock", music: "dungeon", rim: 40, puffTint: 0x9a9088,
    look: "A damp cellar under a laboratory: old flagstones, puddles, brass pipes along the walls, a builder conduit with a faint gold light-line, rough dark stone walls. Moody, torch-lit.",
    legend: { floor: "damp grey flagstone cellar floor with puddles and moss", shallow: "shallow puddles and trickling water on the stone floor", rock: "solid dark stone cellar walls and rubble, black-brown", paved: "worn flagstones" },
    guide: [
      ["floor", R(80, 560, 360, 240)], ["floor", L([[440, 680], [700, 680]], 72)], ["floor", R(700, 480, 300, 320)], ["floor", L([[850, 480], [850, 270]], 72)], ["floor", R(560, 90, 560, 210)], ["floor", L([[560, 190], [220, 190]], 72)], ["floor", R(80, 90, 220, 300)],
      ["shallow", E(250, 700, 70, 40)], ["shallow", L([[440, 680], [700, 680]], 30)], ["shallow", E(850, 640, 80, 50)], ["shallow", E(860, 200, 120, 50)], ["shallow", E(180, 250, 60, 40)],
    ],
    dark: { ambient: 0.7, radius: 200 },
    entries: { start: { x: 200, y: 760, face: "up" }, from_orun: { x: 200, y: 760, face: "up" } },
    exits: [{ rect: [150, 808, 100, 40], to: "orun", entry: "from_undercroft", push: [0, -1] }],
    triggers: [{ id: "cellarTutorial", rect: [250, 620, 100, 80] }, { id: "undercroftDeep", rect: [780, 150, 160, 100] }],
    chests: [{ id: "undercroftChest", x: 1040, y: 260 }],
    npcs: [{ id: "cellarCage", art: "emptyCage", name: "Cage", x: 180, y: 150, hint: "E / Space: look at the cage", scale: 1 }],
    props: [
      ["jarShelf", 140, 590], ["jarShelf", 320, 590], ["crateStack", 400, 790], ["crateStack", 110, 780], ["leakPipe", 460, 640], ["leakPipe", 700, 530], ["pipeRun", 570, 730], ["cellarPillar", 760, 790], ["cellarPillar", 940, 790],
      ["candleStand", 130, 700, {}], ["candleStand", 410, 700], ["candleStand", 730, 520], ["candleStand", 980, 520], ["jarShelf", 740, 330], ["cellarPillar", 600, 290], ["cellarPillar", 1090, 290], ["candleStand", 640, 130], ["candleStand", 1050, 130], ["leakPipe", 860, 120], ["crateStack", 1000, 140],
      ["leakPipe", 400, 160], ["crateStack", 250, 330], ["jarShelf", 120, 140], ["candleStand", 300, 180], ["puddle", 230, 700, { alpha: 0.9 }], ["puddle", 860, 650], ["puddle", 850, 215], ["puddle", 170, 280], ["builderConduit", 1020, 560],
    ],
    scatter: [{ keys: ["crateStack", "puddle", "vaultRubble"], n: 8, on: ["floor", "shallow"], seed: 2, opts: {}, scaleRange: [0.8, 1] }],
    encounter: { table: "undercroft", rate: 22 },
    amb: { motes: 24, tint: [0x182030, 0.2], warm: null, vignette: 1, dust: 0xaab0b8, water: true, drips: [[460, 640], [700, 530], [860, 120], [400, 160], [570, 730]] },
  });
})();
