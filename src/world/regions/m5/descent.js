// M5 5.6 The Descent (dungeon, 2550x1700): a long switchback stair and ramp inside the pyramid. Three long corridors (E, W, E) joined by turns, an offering gutter of dark water running down the middle
// of each, carved sun-calendar murals along the walls (the middle corridor's big mural has a gap in the ring of days: interact spot calendarWall), chains, silence; the dark roots of the Sun Eater creep
// in along the last corridor which ends in the door to the Emperor's Hall. A side alcove holds the chest (descentChest). Table "descent" 22 s.
// Entries start, from_pyramidDuskGate, from_emperorHall. Exits pyramidDuskGate@from_pyramidDescent (top left), emperorHall@from_pyramidDescent (bottom right).
(function () {
  const { R, E, P, L } = World.shapes, M = World.M5, fx = { solid: false };
  const C1 = [[60, 300], [2350, 300], [2350, 800]], C2 = [[2350, 800], [250, 800], [250, 1300]], C3 = [[250, 1300], [2480, 1300]];
  const props = M.flat(
    // murals on the north wall of every corridor, the great calendar mural in the middle
    M.line("pyrMural", [[420, 190], [2200, 190]], 330, { seed: 1, opts: fx }), M.line("pyrMural", [[2000, 690], [500, 690]], 330, { seed: 2, opts: fx, start: 100 }), M.line("pyrMural", [[560, 1190], [2300, 1190]], 330, { seed: 3, opts: fx }),
    [["pyrMural", 1250, 700, { solid: false, scale: 1.7 }], ["sunCalendarGate", 1250, 690, { solid: false, alpha: 0.9 }]],
    // chains, braziers, offering pillars at the turns, statues, rubble
    M.line("pyrChains", [[300, 360], [2300, 360]], 380, { seed: 4, opts: fx }), M.line("pyrChains", [[2300, 860], [300, 860]], 380, { seed: 5, opts: fx, start: 190 }), M.line("pyrChains", [[400, 1360], [2400, 1360]], 380, { seed: 6, opts: fx }),
    M.line("pyrBrazier", [[200, 230], [2260, 230]], 520, { seed: 7, opts: fx }), M.line("pyrBrazier", [[2260, 730], [300, 730]], 520, { seed: 8, opts: fx }), M.line("pyrBrazier", [[420, 1230], [2380, 1230]], 520, { seed: 9, opts: fx }),
    [["pyrOfferingPillar", 2350, 160], ["pyrOfferingPillar", 2460, 480], ["pyrOfferingPillar", 2240, 480], ["pyrOfferingPillar", 150, 1000], ["pyrOfferingPillar", 350, 1000], ["pyrOfferingPillar", 150, 1470]],
    [["pyrGoldStatue", 700, 900], ["pyrGoldStatue", 1700, 900], ["pyrGoldStatue", 1100, 400], ["pyrGoldStatue", 1900, 1400], ["pyrRubble", 1450, 340, fx], ["pyrRubble", 800, 860, fx], ["pyrRubble", 2200, 1340, fx]],
    M.line("pyrRoots", [[900, 1320], [2400, 1320]], 220, { seed: 10, opts: fx, jit: 30 }), [["pyrRoots", 320, 1100, fx], ["pyrRoots", 190, 1180, fx], ["obsidianSpike", 2420, 1400], ["obsidianSpike", 2300, 1450]],
    // the chest alcove and the door at the bottom end
    [["pyrGoldStatue", 1100, 1100], ["pyrBrazier", 1300, 1130, fx], ["pyrLightPillar", 2440, 1230, fx], ["pyrLightPillar", 2440, 1380, fx], ["pyrBanner", 2380, 1150, fx], ["pyrBanner", 2380, 1450, fx]]
  );
  World.def("pyramidDescent", {
    name: "The Descent", w: 2550, h: 1700, music: "greatPyramid", rim: 40, base: "rock", ground: "assets/regions/pyramidDescent.jpg",
    look: "A long switchback stair and ramp inside a black-and-gold pyramid seen from above: three long dark corridors, a channel of dark water running down the middle of each, carved sun-calendar murals on the walls, chains hanging, dim braziers, dark roots creeping across the floor near the end, a gold door at the bottom right.",
    legend: { paved: "black polished stone floor with gold inlay", floor: "wide black stone steps with gold edges", shallow: "a gutter of dark still water with a faint red sheen", glass: "black-and-gold glowing builder floor", rock: "solid black pyramid wall carved with sun murals" },
    guide: [
      ["paved", L(C1, 200)], ["paved", L(C2, 200)], ["paved", L(C3, 200)], ["paved", R(1100, 1100, 200, 220)],
      ["shallow", L([[200, 300], [2350, 300], [2350, 800]], 56)], ["shallow", L([[2350, 800], [250, 800], [250, 1300]], 56)], ["shallow", L([[250, 1300], [2200, 1300]], 56)],
      ["floor", R(2250, 380, 200, 300)], ["floor", R(150, 880, 200, 330)], ["glass", R(2380, 1200, 120, 200)],
    ],
    entries: { start: { x: 150, y: 300, face: "right" }, from_pyramidDuskGate: { x: 150, y: 300, face: "right" }, from_emperorHall: { x: 2400, y: 1300, face: "left" } },
    exits: [{ rect: [40, 240, 56, 120], to: "pyramidDuskGate", entry: "from_pyramidDescent", push: [1, 0] }, { rect: [2494, 1240, 56, 120], to: "emperorHall", entry: "from_pyramidDescent", push: [-1, 0] }],
    gather: [{ id: "calendarWall", x: 1250, y: 735, label: "mural", color: 0xe8c860, show: "!ch11.wall" }],
    chests: [{ id: "descentChest", x: 1200, y: 1130 }],
    props,
    encounter: { table: "descent", rate: 22 },
    amb: { motes: 22, dust: 0x907868, drips: [[700, 300], [1700, 800], [900, 1300], [1500, 300]], tint: [0x281818, 0.25], warm: [0xff8040, 0.04] },
    dark: { ambient: 0.82, radius: 190, fireRadius: 190 },
    lights: [[200, 230, 110, 0.7], [720, 230, 110, 0.7], [1240, 230, 110, 0.7], [1760, 230, 110, 0.7], [2260, 230, 110, 0.7], [2260, 730, 110, 0.7], [1740, 730, 110, 0.7], [1220, 730, 160, 0.9], [700, 730, 110, 0.7], [300, 730, 110, 0.7], [420, 1230, 110, 0.7], [940, 1230, 110, 0.7], [1460, 1230, 110, 0.7], [1980, 1230, 110, 0.7], [1300, 1130, 110, 0.8], [2440, 1300, 170, 0.9]],
  });
})();
