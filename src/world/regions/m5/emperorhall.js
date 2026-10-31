// M5 5.7 The Emperor's Hall (boss room, 1800x1200): a round gold hall at the pyramid's heart. A desk with a ledger and a single lamp at the north, a floor of gold that glows from beneath, the Sun Eater's
// light seen through a great circular grate in the middle, ring of offering pillars. No random fights. Trigger emperorScene at the west doorway (the scene walks the hero in; Davichi is a Cinema actor at the desk).
// Entries start, from_pyramidDescent, from_sunEaterChamber. Exits pyramidDescent@from_emperorHall (W), sunEaterChamber@from_emperorHall (E, need ch11.emperor).
(function () {
  const { R, E, P, L } = World.shapes, M = World.M5, fx = { solid: false };
  const props = M.flat(
    [["pyrDesk", 900, 330], ["readingLamp", 850, 318, { fire: [0, -52, 0.8], glow: "gold" }], ["bookPile", 975, 330, fx], ["studyChair", 900, 372, fx]],
    M.ring("pyrOfferingPillar", 900, 600, 640, 400, 12, { seed: 1, a0: 0.52, arc: 5.2, jit: 4 }), M.ring("pyrBrazier", 900, 600, 520, 320, 10, { seed: 2, a0: 0.2, jit: 4, opts: fx }),
    [["pyrGoldStatue", 360, 330], ["pyrGoldStatue", 1440, 330], ["pyrGoldStatue", 360, 880], ["pyrGoldStatue", 1440, 880], ["pyrBanner", 640, 250, fx], ["pyrBanner", 1160, 250, fx], ["pyrLightPillar", 1480, 520, fx], ["pyrLightPillar", 1480, 700, fx]],
    M.line("pyrRoots", [[720, 840], [1080, 840]], 120, { seed: 3, opts: fx, jit: 20 }), M.line("pyrChains", [[620, 440], [1180, 440]], 140, { seed: 4, opts: fx })
  );
  World.def("emperorHall", {
    name: "The Emperor's Hall", w: 1800, h: 1200, music: "emperor", rim: 40, base: "rock", ground: "assets/regions/emperorHall.jpg",
    look: "A round gold hall at the heart of a pyramid seen from above: a floor of polished gold that glows warmly from beneath, a great circular iron grate in the centre with fierce light welling up through it, a ring of dark offering pillars, a single desk with a lamp and a ledger at the north, deep shadow in the corners.",
    legend: { glass: "polished gold floor glowing from beneath with fine inlaid lines", paved: "black stone doorway floor", rock: "solid black-and-gold wall" },
    guide: [["glass", E(900, 600, 720, 470)], ["paved", L([[40, 600], [300, 600]], 130)], ["paved", L([[1500, 600], [1760, 600]], 130)]],
    entries: { start: { x: 150, y: 600, face: "right" }, from_pyramidDescent: { x: 150, y: 600, face: "right" }, from_sunEaterChamber: { x: 1650, y: 600, face: "left" } },
    exits: [{ rect: [40, 540, 56, 120], to: "pyramidDescent", entry: "from_emperorHall", push: [1, 0] }, { rect: [1744, 540, 56, 120], to: "sunEaterChamber", entry: "from_emperorHall", push: [-1, 0], need: "ch11.emperor" }],
    triggers: [{ id: "emperorScene", rect: [200, 500, 160, 200], hide: "ch11.emperor" }],
    props,
    amb: { motes: 34, dust: 0xffd890, tint: [0x30200c, 0.2], warm: [0xffb050, 0.07], sparkle: { terrain: ["glass"], color: 0xffd070, rate: 6 } },
    dark: { ambient: 0.74, radius: 240, fireRadius: 220 },
    lights: [[900, 740, 330, 1], [900, 330, 180, 0.9], [900, 600, 380, 0.6], [360, 600, 120, 0.5], [1440, 600, 120, 0.5], [150, 600, 120, 0.7], [1650, 600, 120, 0.7]],
  });
})();
