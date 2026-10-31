// CH1-EXPAND: The Dry Waystation (east of the Caravan Graveyard): a half-buried builder waystation, courtyard, pillared hall, three side cells, a dry well. Table "cistern" 24 s (builder ruin).
// Entries: start / from_caravanGraveyard (W). Exit: caravanGraveyard@from_dryWaystation. Chests waystationChest1 waystationChest2, lore waystationLedger (keeper's ledger) + waystationTablet, trigger waystationEnter.
(function () {
  const { R, E, P, L } = World.shapes, K = World.kitM2, W = 2400, H = 1600;
  const wall = (x, y, w, h) => ["wall", R(x, y, w, h)];
  const def = {
    name: "The Dry Waystation", ground: "assets/regions/dryWaystation.jpg", w: W, h: H, music: "ruins", rim: 40,
    look: "A ruined builder waystation seen from above, half buried in desert sand: a flagstone courtyard with a dry stone well, a long pillared hall with a worn floor, three small side cells, thick sandstone walls with gaps and fallen blocks, dark dramatic dusk light, faint gold light-lines in the old stone.",
    legend: { sand: "windblown desert sand drifts and rock", paved: "worn sandstone flagstone courtyard with sand in the cracks", floor: "smooth dark builder stone floor with thin gold light-lines", wall: "thick weathered sandstone wall top", road: "sandy track", rock: "dark brown rock outcrops" },
    guide: [
      ["road", L([[0, 800], [500, 800]], 110)],
      ["paved", R(536, 286, 584, 1044)], ["floor", R(1156, 286, 384, 1044)], ["floor", R(1576, 286, 288, 274)], ["floor", R(1576, 596, 288, 324)], ["floor", R(1576, 956, 288, 374)], ["paved", R(500, 700, 40, 200)],
      wall(500, 250, 1400, 36), wall(500, 1330, 1400, 36), wall(500, 250, 36, 450), wall(500, 900, 36, 466), wall(1864, 250, 36, 1116),
      wall(1120, 286, 36, 254), wall(1120, 700, 36, 260), wall(1120, 1120, 36, 210),
      wall(1540, 286, 36, 94), wall(1540, 470, 36, 230), wall(1540, 790, 36, 310), wall(1540, 1200, 36, 130),
      wall(1576, 560, 288, 36), wall(1576, 920, 288, 36),
      ["rock", P(K.blobPts(2150, 300, 230, 160, 1401, { jag: 0.14 }))], ["rock", P(K.blobPts(2150, 1350, 240, 170, 1402, { jag: 0.14 }))], ["rock", P(K.blobPts(300, 300, 240, 170, 1403, { jag: 0.14 }))], ["rock", P(K.blobPts(280, 1330, 250, 160, 1404, { jag: 0.14 }))],
      ["road", L([[540, 800], [1100, 800], [1560, 740]], 70)],
    ],
    dark: { ambient: 0.42, radius: 300, fireRadius: 160 },
    entries: { start: { x: 160, y: 800, face: "right" }, from_caravanGraveyard: { x: 160, y: 800, face: "right" } },
    exits: [{ rect: [40, 740, 56, 120], to: "caravanGraveyard", entry: "from_dryWaystation", push: [1, 0] }],
    triggers: [{ id: "waystationEnter", rect: [560, 740, 100, 120] }],
    chests: [{ id: "waystationChest1", x: 1760, y: 420 }, { id: "waystationChest2", x: 1760, y: 1180 }],
    npcs: [
      { id: "waystationLedger", art: "clerkDesk", name: "Keeper's desk", x: 1760, y: 780, hint: "E / Space: read the ledger" },
      { id: "waystationTablet", art: "lightStele", name: "Builder tablet", x: 1340, y: 380, hint: "E / Space: read the tablet" },
    ],
    props: [
      ["amberWell", 830, 800, { solid: [30, 14] }], ["builderPillar", 1240, 400], ["builderPillar", 1460, 400], ["builderPillar", 1240, 700], ["builderPillar", 1460, 700], ["builderPillar", 1240, 1000], ["builderPillar", 1460, 1000], ["builderPillar", 1240, 1250], ["builderPillar", 1460, 1250],
      ["vaultRubble", 700, 420], ["vaultRubble", 980, 1180], ["vaultRubble", 1130, 620, {}], ["vaultRubble", 1550, 640, {}], ["toppledStatue", 680, 1100, { solid: [26, 12] }], ["crateStack", 1700, 1030, {}], ["crateStack", 1790, 1050, {}], ["barrel", 1650, 1260], ["camelBones", 620, 600], ["skull", 940, 1000],
      ["builderConduit", 1800, 330], ["lightStele", 1680, 640], ["lightStele", 1840, 640], ["deadTree", 400, 800], ["cairn", 220, 780],
    ],
    scatter: [{ keys: [["vaultRubble", 2], ["bones", 1], ["skull", 1], ["puddle", 0.4]], n: 30, on: ["paved", "floor"], seed: 1401, scaleRange: [0.7, 1] }, { keys: ["sandBoulder", "rocks", "cactus", "deadTree", "shrub", "grass"], n: 50, on: ["sand"], seed: 1402 }],
    lights: [[1240, 700, 140, 0.35], [1460, 700, 140, 0.35], [1760, 780, 120, 0.4], [830, 800, 120, 0.3]],
    encounter: { table: "cistern", rate: 24 },
    amb: { motes: 30, tint: [0x301810, 0.2], dust: 0xd8c0a0, water: false, drips: [[830, 800]] },
  };
  World.def("dryWaystation", def);
})();
