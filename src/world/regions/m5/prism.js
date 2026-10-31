// M5 3.8 The Prism Archive (K8, dungeon, 2250x1500): a builder light-lab of black-and-gold stone. Four rooms in a row joined by glass doors that open to the right reaction (STORY drives them):
// hall 1 (arrival, the tablet alcove prism1 to the north) -> door 1 (water+fire) -> hall 2 (golem statues) -> door 2 (water+lightning) -> hall 3 (charts) -> door 3 (water+ice) -> the Keeper's chamber
// (trigger prismFight once prism.d3; chest g35_aetherBulbCirclet once k8.done). Doors: triggers prismDoor1..3 (press, in front of each door), flags prism.d1..3 (hide the door, remove its blocker).
// Bomb shelves stand by each door. Table "prism" 22 s. Entries start, from_saltmereWarfront. Exit saltmereWarfront@from_prismArchive.
(function () {
  const { R, E, P, L } = World.shapes, M = World.M5, fx = { solid: false };
  const props = M.flat(
    // beams: prisms that glow, lenses on the floor, charts on the north walls
    [["prismPrism", 240, 880, { fire: [0, -80, 0.8], glow: "blue" }], ["prismPrism", 520, 640, { fire: [0, -80, 0.8], glow: "gold" }], ["prismPrism", 980, 920, { fire: [0, -80, 0.8], glow: "blue" }], ["prismPrism", 1220, 600, { fire: [0, -80, 0.8], glow: "gold" }], ["prismPrism", 1560, 900, { fire: [0, -80, 0.8], glow: "blue" }], ["prismPrism", 1700, 620, { fire: [0, -80, 0.8], glow: "gold" }]],
    M.line("prismChart", [[160, 548], [680, 548]], 150, { seed: 1, opts: { solid: false } }), M.line("prismChart", [[880, 498], [1300, 498]], 150, { seed: 2, opts: { solid: false } }), M.line("prismChart", [[1440, 548], [1780, 548]], 150, { seed: 3, opts: { solid: false } }),
    [["prismLens", 400, 780, fx], ["prismLens", 640, 880, fx], ["prismLens", 1100, 760, fx], ["prismLens", 1280, 900, fx], ["prismLens", 1500, 760, fx], ["prismLens", 1760, 860, fx]],
    // hall 2: golem statues in rows
    [["prismGolemStatue", 900, 600], ["prismGolemStatue", 1250, 960], ["prismGolemStatue", 940, 990], ["prismGolemStatue", 1290, 580]],
    // bomb shelves by each door, the three doors themselves
    [["prismBombShelf", 690, 690], ["prismBombShelf", 1280, 690], ["prismBombShelf", 1770, 690]],
    [["prismDoorFire", 790, 790, { solid: false, show: "!prism.d1" }], ["prismDoorShock", 1370, 790, { solid: false, show: "!prism.d2" }], ["prismDoorIce", 1860, 790, { solid: false, show: "!prism.d3" }]],
    // the tablet alcove (north of hall 1)
    [["spineTablet", 300, 460], ["prismChart", 220, 395, fx], ["prismChart", 380, 395, fx], ["builderPillar", 150, 470], ["builderPillar", 450, 470]],
    // the Keeper's chamber: lenses in a ring and a dais of light
    M.ring("prismLens", 2050, 750, 150, 100, 7, { seed: 5, opts: { solid: false } }), [["prismPrism", 2050, 700, { scale: 1.6, fire: [0, -120, 1], glow: "gold" }], ["builderPillar", 1930, 560], ["builderPillar", 2180, 560], ["builderPillar", 1930, 960], ["builderPillar", 2180, 960]],
    M.rect(["debris", "vaultRubble", "builderConduit"], 100, 560, 2150, 1000, 8, { seed: 6, flipR: true, avoid: [[300, 460, 120], [790, 790, 120], [1370, 790, 120], [1860, 790, 120], [2050, 750, 200]], opts: { solid: false } })
  );
  World.def("prismArchive", {
    name: "The Prism Archive", w: 2250, h: 1500, music: "vault", rim: 40, base: "rock", ground: "assets/regions/prismArchive.jpg",
    look: "A builder light-laboratory seen from above: four black-and-gold stone rooms in a row joined by glass doors, beams of coloured light crossing over the floor, glowing prisms and lenses, diagrams of reactions on the walls, a tall alcove with a stone tablet, a final round chamber with a great glowing facet.",
    legend: { paved: "polished black stone floor with fine gold inlay lines", glass: "black-and-gold glowing builder floor with light channels", floor: "glass door threshold with a coloured glow", rock: "solid black-and-gold builder wall" },
    guide: [
      ["paved", R(60, 560, 700, 380)], ["paved", R(200, 380, 200, 180)], ["paved", R(820, 500, 520, 500)], ["paved", R(1400, 560, 430, 380)], ["glass", E(2050, 750, 220, 300)],
      ["floor", R(760, 690, 60, 120)], ["floor", R(1340, 690, 60, 120)], ["floor", R(1830, 690, 60, 120)],
      ["glass", L([[100, 750], [700, 750]], 40)], ["glass", L([[830, 750], [1300, 750]], 40)], ["glass", L([[1410, 750], [1800, 750]], 40)], ["glass", L([[1900, 750], [2150, 750]], 40)],
    ],
    entries: { start: { x: 140, y: 750, face: "right" }, from_saltmereWarfront: { x: 140, y: 750, face: "right" } },
    exits: [{ rect: [40, 690, 56, 120], to: "saltmereWarfront", entry: "from_prismArchive", push: [1, 0], floor: "floor" }],
    blockers: [{ rect: [770, 690, 50, 120], show: "!prism.d1" }, { rect: [1350, 690, 50, 120], show: "!prism.d2" }, { rect: [1840, 690, 50, 120], show: "!prism.d3" }],
    triggers: [
      { id: "prismDoor1", rect: [660, 700, 100, 100], press: true, once: false, hide: "prism.d1" }, { id: "prismDoor2", rect: [1240, 700, 100, 100], press: true, once: false, hide: "prism.d2", show: "prism.d1" }, { id: "prismDoor3", rect: [1730, 700, 100, 100], press: true, once: false, hide: "prism.d3", show: "prism.d2" },
      { id: "prismEnter", rect: [100, 680, 200, 140] }, { id: "prismFight", rect: [1960, 660, 220, 180], show: ["prism.d3", "!k8.done"] },
    ],
    chests: [{ id: "g35_aetherBulbCirclet", x: 2150, y: 880, show: "k8.done" }],
    gather: [{ id: "prism1", x: 300, y: 490, label: "tablet", color: 0xe8c860, show: "!lore.sunPiece3" }],
    props,
    encounter: { table: "prism", rate: 22 },
    amb: { motes: 36, dust: 0xffe8c0, tint: [0x242030, 0.2], sparkle: { terrain: ["glass", "paved"], color: 0xffe9a8, rate: 6 } },
    dark: { ambient: 0.66, radius: 230, fireRadius: 200 },
    lights: [[240, 880, 180, 0.8], [520, 640, 180, 0.8], [980, 920, 180, 0.8], [1220, 600, 180, 0.8], [1560, 900, 180, 0.8], [1700, 620, 180, 0.8], [2050, 700, 260, 1], [790, 790, 110, 0.7], [1370, 790, 110, 0.7], [1860, 790, 110, 0.7], [300, 470, 120, 0.7]],
    checkFlags: { "prism.d1": true, "prism.d2": true, "prism.d3": true, "k8.done": true },
  });
})();
