// M5 3.6 The Veil Observatory (interior, 1800x1200): the Flock's old star-tower. A circular room under an open dome at night: a great sun-calendar wheel inlaid in the floor, brass telescopes and armillary
// spheres on the rim, star charts on every wall, bookshelves, lamp stands, and a table with a cold cup of tea at the north end where Master Ithiel waits (trigger ithielMeeting, meeting beat 4.D). No fights.
// After the fight Ithiel stays here as the NPC `mentor`. Entries start, from_veilSanctum. Exit veilSanctum@from_veilObservatory (need ch10.mentorWon).
(function () {
  const { R, E, P, L } = World.shapes, M = World.M5, fx = { solid: false };
  const props = M.flat(
    [["roofCalendar", 900, 780, { solid: false, scale: 0.78 }]],
    // the table, chairs and lamp where Ithiel sits
    [["studyTable", 900, 330], ["studyChair", 850, 345], ["studyChair", 950, 345], ["readingLamp", 862, 318, { fire: [0, -50, 0.7], glow: "gold" }], ["roundRug", 900, 420, fx], ["scrollRack", 780, 300], ["bookPile", 1010, 310, fx]],
    // brass instruments around the rim
    M.ring(["obsTelescope", "obsArmillary", "obsOrrery"], 900, 560, 640, 360, 9, { seed: 2, a0: 3.6, arc: 5.8, jit: 14 }),
    M.ring(["obsLampStand", "obsLampStand"], 900, 560, 560, 300, 7, { seed: 3, a0: 3.4, arc: 6.1, jit: 8, opts: { solid: false } }),
    // star charts and shelves on the curved wall (north half and flanks)
    M.ring(["obsChartWall", "obsBookshelf", "obsChartWall", "bookShelfTall"], 900, 560, 740, 420, 10, { seed: 4, a0: 3.5, arc: 5.9 }),
    [["obsStool", 540, 700], ["obsStool", 1260, 700], ["obsStool", 700, 900, fx], ["obsStool", 1100, 900, fx], ["bookPile", 600, 560, fx], ["bookPile", 1200, 560, fx], ["scrollRack", 1380, 520], ["scrollRack", 420, 520]],
    [["obsTelescope", 330, 860, { scale: 1.2 }], ["obsTelescope", 1470, 860, { scale: 1.2 }], ["obsArmillary", 900, 1010, { scale: 1.0 }], ["obsLampStand", 700, 1020, fx], ["obsLampStand", 1100, 1020, fx]]
  );
  World.def("veilObservatory", {
    name: "The Veil Observatory", w: 1800, h: 1200, music: "mentor", rim: 40, base: "rock", ground: "assets/regions/veilObservatory.jpg",
    look: "A circular observatory room at night seen from above, open to the stars: dark blue-grey stone floor with a great inlaid bronze sun-calendar wheel in the centre, brass telescopes and armillary spheres around the rim, star charts on the curved wall, a lit table with a lamp at the north end, soft lamp light, dark corners.",
    legend: { paved: "dark blue-grey polished stone floor", glass: "inlaid bronze and gold ring of the sun-calendar wheel with engraved day marks", floor: "worn stone threshold", rock: "dark curved tower wall" },
    guide: [["paved", E(900, 560, 780, 470)], ["glass", E(900, 780, 300, 190)], ["floor", R(840, 1020, 120, 130)], ["floor", R(620, 280, 560, 130)]],
    entries: { start: { x: 900, y: 1070, face: "up" }, from_veilSanctum: { x: 900, y: 1070, face: "up" } },
    exits: [{ rect: [830, 1120, 140, 56], to: "veilSanctum", entry: "from_veilObservatory", push: [0, -1], need: "ch10.mentorWon", floor: "floor" }],
    triggers: [{ id: "ithielMeeting", rect: [700, 430, 400, 110], hide: "ch10.mentorWon" }],
    props,
    npcs: [{ id: "mentor", art: "npcIthielGrey", name: "Master Ithiel", x: 900, y: 354, show: "ch10.mentorWon" }],
    amb: { motes: 36, dust: 0xa8c0ff, tint: [0x242c48, 0.22], warm: [0xffc880, 0.03], sparkle: { terrain: ["glass"], color: 0xbfd8ff, rate: 5 } },
    dark: { ambient: 0.62, radius: 360, fireRadius: 190 },
    lights: [[900, 320, 220, 0.95], [900, 780, 240, 0.55], [600, 700, 120, 0.5], [1200, 700, 120, 0.5], [700, 1020, 110, 0.6], [1100, 1020, 110, 0.6], [420, 520, 110, 0.4], [1380, 520, 110, 0.4]],
  });
})();
