// M5 5.9 The Pyramid Roof (epilogue, 1800x1200): the flat top of the Great Pyramid at dawn. A huge sun calendar carved in the stone floor, a low altar rim round the edge, the city and clouds far below,
// half the sky dark, half pink, stars still showing. No exits until the epilogue is over (the story then returns the player to dawnwatchBastion). No fights.
// Entries start, from_sunEaterChamber. Trigger epilogueScene (hide epilogue.done).
(function () {
  const { R, E, P, L } = World.shapes, M = World.M5, fx = { solid: false };
  const props = M.flat(
    [["roofCalendar", 900, 880, { solid: false, scale: 1.15 }]],
    // the altar rim: braziers and gold banners, statues at the four corners
    M.line("pyrBrazier", [[360, 230], [1440, 230]], 180, { seed: 1, opts: fx }), M.line("pyrBrazier", [[360, 1040], [1440, 1040]], 180, { seed: 2, opts: fx }), M.line("pyrBrazier", [[330, 300], [330, 980]], 170, { seed: 3, opts: fx, start: 40 }), M.line("pyrBrazier", [[1470, 300], [1470, 980]], 170, { seed: 4, opts: fx, start: 40 }),
    [["pyrGoldStatue", 380, 330], ["pyrGoldStatue", 1420, 330], ["pyrGoldStatue", 380, 1000], ["pyrGoldStatue", 1420, 1000], ["pyrBanner", 640, 240, fx], ["pyrBanner", 1160, 240, fx], ["pyrOfferingPillar", 330, 640], ["pyrOfferingPillar", 1470, 640], ["pyrLightPillar", 900, 1060, { solid: false, scale: 1.3 }]],
    [["pyrChainRing", 900, 620, fx], ["pyrRubble", 520, 880, fx], ["pyrRubble", 1300, 400, fx]]
  );
  World.def("pyramidRoof", {
    name: "The Pyramid Roof", w: 1800, h: 1200, music: "epilogue", rim: 0, base: "water", ground: "assets/regions/pyramidRoof.jpg",
    look: "The flat stone top of a great pyramid at dawn seen from above: a huge sun calendar carved in a ring of day-marks in the floor, a low carved altar rim all round the edge, below it clouds and the tiny burnt city far down, the sky half dark with stars and half pink and gold, soft rosy light, gold braziers.",
    legend: { paved: "pale carved pyramid-top stone with the day-marks of a sun calendar", wall: "low carved stone rim with gold edging", water: "soft rose-pink clouds far below with glimpses of a city", glass: "pale gold inlaid ring" },
    guide: [["paved", R(300, 150, 1200, 900)], ["glass", E(900, 620, 330, 300)], ["wall", L([[290, 140], [1510, 140], [1510, 1060], [290, 1060], [290, 140]], 36)]],
    entries: { start: { x: 900, y: 960, face: "up" }, from_sunEaterChamber: { x: 900, y: 960, face: "up" } },
    exits: [],
    triggers: [{ id: "epilogueScene", rect: [780, 700, 240, 160], hide: "epilogue.done" }],
    props,
    amb: { motes: 50, dust: 0xffd8c0, tint: [0x4a3050, 0.14], warm: [0xffa890, 0.1], birds: 4, sparkle: { terrain: ["glass", "paved"], color: 0xffffff, rate: 4 } },
    lights: [],
  });
})();
