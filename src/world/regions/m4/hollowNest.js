// M4 ch9: The Hollow Nest (K7, dungeon, table "nest" 22 s). Entries start from_rootdeepApproach. Exit rootdeepApproach@from_hollowNest (S).
// Puzzle: three ash drifts in a row (each hides on nest.f1/f2/f3) and a cold brazier before each (press triggers fire1..3, STORY sets nest.fN and nest.open); wind vents vent1..3 (press, flavour: toggle nest.v1..3). Boss trigger nestGuardian (heart chamber, N), chest g24_shieldbearerAviary (show k7.done).
(function () {
  const { R, E, P, L } = World.shapes, M = World.m3, props = [], lights = [];
  const brazier = (n, x, y) => { props.push(["m4_brazierUnlit", x, y, { hide: "nest.f" + n }], ["m4_brazierLit", x, y, { show: "nest.f" + n, fire: [0, -66, 1.1] }]); lights.push([x, y - 50, 150, 0.7]); };
  const drift = (n, x, y, vert) => props.push(["m4_ashDrift", x, y, { hide: "nest.f" + n, solid: vert ? [70, 30] : [34, 135], shadow: false }], ["m4_ashBurnt", x, y + 6, { show: "nest.f" + n, solid: false, dy: 3 - y }]);
  // POLISH: a pressed vent shows its effect: closed = cold grate; open (flag nest.vN, toggled by the press) = the grate glows and breathes warm embers upward
  const vent = (n, x, y) => { props.push(["m4_ventGrate", x, y, { solid: false, dy: 3 - y, hide: "nest.v" + n }], ["m4_ventGrate", x, y, { solid: false, dy: 3 - y, show: "nest.v" + n, tint: 0xffb878, fire: [0, -16, 0.85] }]); };
  // the entrance chamber: old nests, charred branches, vent 3, the first brazier in the west alcove, the first drift in the corridor
  props.push(["m4_oldNest", 960, 1330], ["m4_oldNest", 1240, 1380], ["m4_charredBranch", 1100, 1300, { solid: false, dy: 3 - 1300 }], ["m4_emberWall", 1000, 1255, { solid: false }], ["m4_emberWall", 1200, 1255, { solid: false }]); vent(3, 1000, 1390); brazier(1, 760, 1340);
  drift(1, 1100, 1130, true);
  props.push(["m4_emberWall", 960, 900, { solid: false }], ["m4_emberWall", 1240, 900, { solid: false }]);
  // hall A: nests, vent 1, the second brazier in the east alcove
  props.push(["m4_oldNest", 860, 760], ["m4_oldNest", 1340, 740], ["m4_charredBranch", 1100, 800, { solid: false, dy: 3 - 800 }], ["m4_charredBranch", 960, 700, { solid: false, dy: 3 - 700 }], ["m4_emberWall", 800, 650, { solid: false }], ["m4_emberWall", 1000, 650, { solid: false }], ["m4_emberWall", 1200, 650, { solid: false }], ["m4_emberWall", 1400, 650, { solid: false }]); vent(1, 900, 860); brazier(2, 1620, 850);
  props.push(["m4_oldNest", 1560, 940], ["m4_charredBranch", 1580, 790, { solid: false, dy: 3 - 790 }]);
  // corridor west (drift 2) and hall B: the third brazier, vent 2, nests
  drift(2, 620, 770, false);
  props.push(["m4_oldNest", 280, 820], ["m4_oldNest", 520, 840], ["m4_charredBranch", 400, 700, { solid: false, dy: 3 - 700 }], ["m4_emberWall", 260, 565, { solid: false }], ["m4_emberWall", 480, 565, { solid: false }]); vent(2, 450, 780); brazier(3, 310, 650);
  // corridor north (drift 3) and the heart chamber
  drift(3, 400, 450, true);
  props.push(["m4_oldNest", 860, 280], ["m4_oldNest", 1360, 300], ["m4_emberWall", 800, 110, { solid: false }], ["m4_emberWall", 1000, 110, { solid: false }], ["m4_emberWall", 1200, 110, { solid: false }], ["m4_emberWall", 1400, 110, { solid: false }], ["m4_charredBranch", 1100, 260, { solid: false, dy: 3 - 260 }], ["m4_oldNest", 1100, 190, { scale: 1.4 }]); lights.push([1100, 190, 260, 0.5], [800, 120, 140, 0.5], [1400, 120, 140, 0.5]);
  World.def("hollowNest", {
    name: "The Hollow Nest", w: 2200, h: 1500, base: "rock", music: "roots", rim: 44,
    look: "The inside of a giant hollow burnt tree seen from above: black charred bark walls with glowing orange ember cracks, a floor of grey ash piled in drifts and old bird nests the size of cart-beds made of charred sticks, burnt branches laid as walkways, an entrance chamber in the south, a hall in the middle, a west hall, narrow corridors blocked by ash drifts, a great round heart chamber at the north with a column of orange light from above. Hot updrafts, drifting ash and sparks.",
    legend: { ash: "deep grey ash, soft and drifted, with footprints and glowing ember specks", floor: "charred black wood floor with ember cracks, ash dust", paved: "burnt branch walkway, black bark planks", rock: "charred bark walls with glowing ember cracks", road: "ash path" },
    bank: { ash: "ash", floor: "dark", paved: "dark", rock: "dark", road: "ash" },
    grade: { ash: { mul: [0.8, 0.74, 0.7], add: [4, 0, 0] }, floor: { mul: [0.6, 0.45, 0.4], add: [0, -4, -4] }, paved: { mul: [0.65, 0.5, 0.42], add: [0, -2, -2] }, rock: { mul: [0.55, 0.4, 0.35], add: [4, 0, 0] }, _: [1, 0.95, 0.92] },
    marks: [{ k: "dot", on: ["ash", "floor"], n: 100, col: [255, 120, 40], a: 0.8, r: [1, 2], hi: false }, { k: "crack", on: ["floor"], n: 30, col: [255, 90, 20], a: 0.6, len: [20, 60] }],
    guide: [
      ["ash", R(900, 1250, 400, 200)], ["ash", R(700, 1260, 200, 160)], ["ash", L([[1100, 1250], [1100, 900]], 130)],
      ["ash", R(750, 640, 700, 340)], ["ash", R(1450, 780, 260, 180)],
      ["paved", L([[760, 700], [420, 700]], 130)], ["ash", R(200, 560, 400, 320)],
      ["paved", L([[400, 560], [400, 330], [720, 330]], 130)],
      ["floor", R(700, 100, 800, 330)],
    ],
    entries: { start: { x: 1100, y: 1400, face: "up" }, from_rootdeepApproach: { x: 1100, y: 1400, face: "up" } },
    exits: [{ rect: [1040, 1440, 120, 56], to: "rootdeepApproach", entry: "from_hollowNest", push: [0, 1], floor: "ash" }],
    triggers: [
      { id: "nestEnter", rect: [1000, 1330, 200, 100] },
      { id: "fire1", rect: [720, 1350, 100, 70], press: true }, { id: "fire2", rect: [1580, 870, 100, 70], press: true }, { id: "fire3", rect: [270, 670, 100, 70], press: true },
      { id: "vent1", rect: [860, 870, 80, 60], press: true }, { id: "vent2", rect: [410, 790, 80, 60], press: true }, { id: "vent3", rect: [960, 1400, 80, 60], press: true },
      { id: "nestGuardian", rect: [1000, 160, 200, 130] },
    ],
    chests: [{ id: "g24_shieldbearerAviary", x: 1380, y: 220, show: "k7.done" }],
    npcs: [],
    props,
    scatter: [{ keys: [["m4_oldNest", 1], ["m4_charredBranch", 1], ["bones2", 1], ["debris", 1]], n: 14, on: ["ash", "floor"], seed: 381, scaleRange: [0.7, 0.95] }],
    lights,
    dark: { ambient: 0.5, radius: 270, color: 0x080302 },
    encounter: { zones: [{ rect: [880, 1240, 440, 220], table: null, rate: 0 }, { rect: [0, 0, 2200, 1500], table: "nest", rate: 22 }] },
    amb: { birds: 0, butterflies: [], water: false, motes: 60, dust: 0xe0a070, tint: [0x401808, 0.16], warm: [0xff7030, 0.08], weather: ["embers"], vignette: 1 },
  });
})();
