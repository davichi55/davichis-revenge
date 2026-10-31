// M5 5.8 The Sun Eater's Chamber (boss room, 2250x1500): a vast domed chamber. A black sun inlaid in the floor ringed with gold and chains (pyrBlackSun decal), dark roots running into it from the walls,
// pillars of old offerings round the edge. Trigger eaterFight west of the sun (hide ch11.t8). After the fight a shaft of light opens in the north (props show ch11.t8) and the exit pyramidRoof@from_sunEaterChamber
// (need ch11.t8) leads up. Entries start, from_emperorHall. Exits emperorHall@from_sunEaterChamber (W), pyramidRoof@from_sunEaterChamber (N shaft). No random fights.
(function () {
  const { R, E, P, L } = World.shapes, M = World.M5, fx = { solid: false };
  const props = M.flat(
    [["pyrBlackSun", 1125, 1330, { solid: false, scale: 1.3 }]],
    // roots creeping in from the rim toward the sun, chains on the diagonals
    M.ring("pyrRoots", 1125, 750, 760, 480, 14, { seed: 1, jit: 30, opts: fx }), M.ring("pyrRoots", 1125, 750, 560, 350, 10, { seed: 2, a0: 0.3, jit: 40, opts: fx }),
    // pillars of old offerings
    M.ring("pyrOfferingPillar", 1125, 750, 930, 560, 14, { seed: 3, a0: 0.45, arc: 5.4, jit: 6 }), M.ring("pyrBrazier", 1125, 750, 840, 500, 14, { seed: 4, a0: 0.1, jit: 6, opts: fx }),
    [["pyrChains", 640, 380, fx], ["pyrChains", 1610, 380, fx], ["pyrChains", 640, 1100, fx], ["pyrChains", 1610, 1100, fx], ["pyrGoldStatue", 380, 560], ["pyrGoldStatue", 1870, 560], ["pyrGoldStatue", 380, 1000], ["pyrGoldStatue", 1870, 1000]],
    M.rect(["bones", "skull", "pyrRubble", "debris"], 300, 220, 1950, 1280, 14, { seed: 5, avoid: [[1125, 750, 330]], opts: fx, flipR: true }),
    // the shaft of light (after the fight)
    [["pyrLightPillar", 1070, 150, { solid: false, show: "ch11.t8", scale: 1.6 }], ["pyrLightPillar", 1180, 150, { solid: false, show: "ch11.t8", scale: 1.6 }], ["pyrBanner", 1000, 200, { solid: false, show: "ch11.t8" }], ["pyrBanner", 1250, 200, { solid: false, show: "ch11.t8" }]]
  );
  World.def("sunEaterChamber", {
    name: "The Sun Eater's Chamber", w: 2250, h: 1500, music: "sunEater", rim: 40, base: "rock", ground: "assets/regions/sunEaterChamber.jpg",
    look: "A vast domed chamber inside a pyramid seen from above: a huge black sun inlaid in the stone floor ringed with gold and iron chains, dark roots running across the floor into it from the walls, a ring of old offering pillars, black stone slabs with gold lines, faint ember glow, heavy darkness.",
    legend: { glass: "black stone slabs with gold inlay and cracks", paved: "dark stone doorway floor", rock: "solid black wall with hanging roots", ash: "scorched black floor near the sun" },
    guide: [["glass", E(1125, 750, 1000, 620)], ["ash", E(1125, 750, 360, 300)], ["paved", L([[40, 750], [300, 750]], 130)], ["paved", L([[1125, 140], [1125, 40]], 120)], ["glass", R(1065, 100, 120, 160)]],
    entries: { start: { x: 150, y: 750, face: "right" }, from_emperorHall: { x: 150, y: 750, face: "right" } },
    exits: [{ rect: [40, 690, 56, 120], to: "emperorHall", entry: "from_sunEaterChamber", push: [1, 0] }, { rect: [1065, 44, 120, 50], to: "pyramidRoof", entry: "from_sunEaterChamber", push: [0, 1], need: "ch11.t8" }],
    triggers: [{ id: "eaterFight", rect: [560, 650, 330, 220], hide: "ch11.t8" }],
    props,
    amb: { motes: 40, dust: 0xa08060, tint: [0x180c14, 0.3], warm: [0xff7030, 0.05], sparkle: { terrain: ["ash"], color: 0xffb060, rate: 6 } },
    dark: { ambient: 0.84, radius: 200, fireRadius: 200 },
    lights: [[1125, 750, 360, 0.8], [1125, 750, 190, 1], [380, 560, 110, 0.6], [1870, 560, 110, 0.6], [380, 1000, 110, 0.6], [1870, 1000, 110, 0.6], [150, 750, 130, 0.7], [1125, 150, 240, 0.9]],
    checkFlags: { "ch11.t8": true },
  });
})();
