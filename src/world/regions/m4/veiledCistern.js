// M4 ch8: The Veiled Cistern (K6, dungeon, table "veiledCistern" 22 s; the spec's `cistern` id belongs to M1). Entries start from_tzavanCoast. Exit tzavanCoast@from_veiledCistern (S stair).
// Puzzle: four bronze mirror stands (press triggers mirror1..4 turn one a quarter; STORY keeps cis.ok1..4 and cis.solved) throw the light shaft from the SW across the hall onto the sealed door in the north wall (sealed door hides on cis.solved, open door shows).
// The statues' gaze: zones where the encounter rate is very high (walking into a gaze = a fight with the statues). Triggers cisternEnter, cisternGuardian (beyond the door). Chest g30_serpentHairedVeil (the chamber).
(function () {
  const { R, E, P, L } = World.shapes, M = World.m3, props = [], lights = [], green = 0xa8d8b8;
  const lamp = (x, y, r, a) => lights.push([x, y, r || 150, a || 0.5]);
  // the light shaft (SW) and the four mirror stands; the sealed door and the open door
  props.push(["m4_streetGrating", 250, 1200, { solid: false, alpha: 0.85 }], ["m4_glassPillar", 160, 1300], ["m4_glassPillar", 340, 1300]); lamp(250, 1250, 220, 0.8);
  props.push(["m4_mirrorStand", 750, 1250], ["m4_mirrorStand", 750, 700], ["m4_mirrorStand", 1450, 700], ["m4_mirrorStand", 1450, 500]);
  props.push(["m4_sealedGlassDoor", 1450, 452, { hide: "cis.solved", solid: [76, 16] }], ["m4_openGlassDoor", 1450, 452, { show: "cis.solved", solid: false }]); lamp(1450, 420, 200, 0.5);
  // glass tanks in rows with walkways between, pillars, the lake's rim
  props.push(["m4_glassTank", 330, 560], ["m4_glassTank", 520, 560], ["m4_glassTank", 330, 900], ["m4_glassTank", 1900, 900], ["m4_glassTank", 1900, 1180], ["m4_glassTank", 1750, 560], ["m4_glassTank", 520, 1000], ["m4_glassTank", 1180, 1330], ["m4_glassTank", 1420, 1330]);
  props.push(["m4_glassPillar", 640, 520], ["m4_glassPillar", 1000, 520], ["m4_glassPillar", 1250, 520], ["m4_glassPillar", 1650, 520], ["m4_glassPillar", 640, 1350], ["m4_glassPillar", 1700, 1350], ["m4_glassPillar", 120, 700], ["m4_glassPillar", 2060, 700]);
  // the frozen statues (gaze zones below), ruins of the village above
  const statues = [[900, 1250], [1150, 1160], [1500, 1220], [1000, 640], [1250, 620], [1650, 800], [500, 780], [880, 880]];
  statues.forEach(([x, y], i) => { props.push([i % 3 === 2 ? "m4_gazeStatueCracked" : "m4_gazeStatue", x, y]); lamp(x, y - 40, 90, 0.35); });
  props.push(["m4_cisternRuin", 1900, 700], ["m4_cisternRuin", 380, 1100], ["m4_glowMold", 700, 980], ["m4_glowMold", 1300, 1100], ["m4_glowMold", 1800, 620], ["m4_brickRubble", 1600, 1150, { solid: false }], ["m4_shackledBones", 600, 640, { solid: false }]);
  // the boss chamber behind the door
  props.push(["m4_glassPillar", 1200, 100], ["m4_glassPillar", 1800, 100], ["m4_glassTank", 1280, 240], ["m4_glassTank", 1660, 240], ["m4_glowMold", 1500, 130], ["m4_goldBrazier", 1400, 330, { fire: [0, -66, 1], glow: "blue" }], ["m4_goldBrazier", 1500, 330, { fire: [0, -66, 1], glow: "blue" }]); lamp(1500, 200, 260, 0.7);
  // gaze zones: a very high encounter rate in front of the watching statues
  const gaze = [[860, 1330, 200, 170], [1080, 1220, 200, 140], [1400, 1280, 200, 150], [930, 700, 190, 150], [1160, 680, 190, 140], [1560, 860, 170, 160], [420, 840, 170, 150]];
  World.def("veiledCistern", {
    name: "The Veiled Cistern", w: 2200, h: 1500, base: "rock", music: "crypt", rim: 44,
    look: "A vast ancient cistern under a ruined clifftop village seen from above: a great hall with a green-black polished glass floor, still black water in the middle like a mirror, green glass tanks and slender glass pillars, thin shafts of white light falling through broken roof holes, pale stone statues of people frozen mid-step with their hands out, bronze mirrors on stands, a sealed glass door in the north wall and a small chamber behind it. Eerie, green, silent.",
    legend: { floor: "polished green-black glass floor with reflections and fine cracks, wet", paved: "pale worn stone stairs and ledges", water: "still black water like a mirror with faint green glow", shallow: "shallow glassy green water over stone", rock: "solid dark green stone and glass walls", wall: "dark glass wall tops" },
    bank: { floor: "dark", paved: "grey", water: "water", shallow: "teal", rock: "dark", wall: "dark" },
    grade: { floor: { mul: [0.4, 0.62, 0.52], add: [-2, 6, 2] }, paved: { mul: [0.6, 0.72, 0.66], add: [-2, 2, 0] }, water: { mul: [0.3, 0.6, 0.5], add: [0, 2, 0] }, shallow: { mul: [0.4, 0.8, 0.7], add: [0, 8, 6] }, rock: { mul: [0.4, 0.5, 0.45], add: [0, 2, 0] }, _: [0.9, 1, 0.95] },
    marks: [{ k: "crack", on: ["floor"], n: 40, col: [120, 220, 180], a: 0.5, len: [20, 70] }, { k: "dot", on: ["floor", "water"], n: 70, col: [200, 255, 230], a: 0.6, r: [1, 2], hi: false }],
    guide: [
      ["floor", R(100, 450, 1900, 950)], ["shallow", E(1100, 920, 440, 250)], ["water", E(1100, 920, 380, 200)],
      ["wall", R(100, 330, 1900, 120)], ["paved", R(1380, 330, 140, 120)],
      ["floor", R(1100, 60, 800, 270)],
      ["paved", R(1040, 1380, 120, 120)],
    ],
    entries: { start: { x: 1100, y: 1400, face: "up" }, from_tzavanCoast: { x: 1100, y: 1400, face: "up" } },
    exits: [{ rect: [1040, 1440, 120, 56], to: "tzavanCoast", entry: "from_veiledCistern", push: [0, 1], floor: "paved" }],
    triggers: [
      { id: "cisternEnter", rect: [1000, 1330, 200, 100] },
      { id: "mirror1", rect: [710, 1270, 80, 60], press: true }, { id: "mirror2", rect: [710, 720, 80, 60], press: true }, { id: "mirror3", rect: [1410, 720, 80, 60], press: true }, { id: "mirror4", rect: [1410, 520, 80, 60], press: true },
      { id: "cisternGuardian", rect: [1380, 180, 240, 120] },
    ],
    chests: [{ id: "g30_serpentHairedVeil", x: 1780, y: 190 }],
    npcs: [],
    props,
    scatter: [{ keys: [["m4_glowMold", 2], ["m4_brickRubble", 1], ["puddle", 2]], n: 24, on: ["floor"], seed: 341, scaleRange: [0.8, 1] }],
    lights,
    dark: { ambient: 0.6, radius: 250, color: 0x020a08 },
    encounter: { zones: gaze.map(([x, y, w, h]) => ({ rect: [x, y, w, h], table: "veiledCistern", rate: 3 })).concat([{ rect: [0, 0, 2200, 1500], table: "veiledCistern", rate: 22 }]) },
    amb: { birds: 0, butterflies: [], water: true, motes: 44, dust: 0x90d0b0, tint: [0x0c2820, 0.16], weather: ["mist"], sparkle: { terrain: ["floor", "water"], color: 0xb8ffe0, rate: 3 }, drips: [[700, 500], [1700, 1300], [400, 1250], [1000, 600]] },
  });
})();
