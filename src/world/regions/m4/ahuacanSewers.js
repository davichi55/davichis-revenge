// M4 ch7: Ahuacan Sewers (dungeon, table "sewer" 28 s, stealth run). Entries start from_lowstep from_palaceCourt. Exits lowstep@from_ahuacanSewers (W end), palaceCourt@from_ahuacanSewers (grating, need ch7.sewers).
// Puzzle: three water-gates in a row (sluice bars hide on sw.v1/sw.v2/sw.v3, a drained gap shows); the valve wheels (press triggers valve1..3, E near the wheel) sit before each gate.
// NPC pavo (the guide, at the entry). Triggers sewerEnter (entry), valve1..3, sewerEnd (show sw.v1+v2+v3, at the grating). Chest sewerChest (builder cistern, north).
(function () {
  const { R, E, P, L } = World.shapes, M = World.m3, props = [], lights = [];
  const flat = (key, x, y, o) => [key, x, y, Object.assign({ dy: 3 - y }, o || {})];
  const lamp = (x, y) => { props.push(["m4_sewerLamp", x, y, { fire: [0, -58, 0.7] }]); lights.push([x, y - 50, 150, 0.55]); };
  const gate = (n, x, y) => {
    props.push(["m4_sluiceBars", x, y, { hide: "sw." + n, solid: [76, 14], shadow: false }], flat("m4_drainedGap", x, y + 6, { show: "sw." + n, solid: false }));
  };
  // corridor A: west mouth, arches in the north wall, a rat-warren side branch, lamps
  props.push(["m4_brickArch", 300, 1122], ["m4_sewerPillar", 480, 1130], ["m4_sewerPillar", 700, 1130], ["m4_brickArch", 880, 1122], ["m4_drainPipe", 390, 1118], ["m4_glowMold", 620, 1268], ["m4_glowMold", 220, 1275], ["m4_brickRubble", 760, 1290], ["m4_chainsHanging", 580, 1112],
    ["m4_ratWarren", 400, 1460], ["m4_shackledBones", 340, 1440], ["m4_brickRubble", 470, 1480], ["m4_glowMold", 320, 1500]);
  lamp(250, 1135); lamp(560, 1135); lamp(840, 1135);
  // valve room 1 (north of corridor A), then gate 1 in the vertical shaft
  props.push(["m4_valveStand", 560, 1000], ["m4_sewerPillar", 480, 960], ["m4_sewerPillar", 640, 960], ["m4_drainPipe", 560, 940], flat("m4_slimeFlat", 560, 1060, { alpha: 0.7, solid: false }), ["m4_glowMold", 500, 1070]);
  lamp(560, 940);
  gate("v1", 1000, 1000);
  props.push(["m4_brickArch", 1160, 1000], ["m4_sewerPillar", 920, 900], ["m4_sewerPillar", 1080, 900], ["m4_chainsHanging", 930, 1100]);
  lamp(960, 900);
  // corridor B: the long hall, valve room 2 (south), the cistern branch north, gate 2 in the next shaft
  props.push(["m4_brickArch", 1300, 682], ["m4_sewerPillar", 1500, 690], ["m4_chainsHanging", 1180, 690], ["m4_shackledBones", 1420, 820], ["m4_drainPipe", 1200, 678], ["m4_rotRaft", 1250, 820, { solid: false }], flat("m4_slimeFlat", 1160, 800, { alpha: 0.6, solid: false }));
  lamp(1260, 690); lamp(1500, 690);
  props.push(["m4_valveStand", 1300, 930], ["m4_sewerPillar", 1220, 890], ["m4_sewerPillar", 1380, 890], ["m4_glowMold", 1240, 960]);
  lamp(1300, 880);
  gate("v2", 1600, 620);
  props.push(["m4_brickArch", 1470, 560], ["m4_sewerPillar", 1520, 520], ["m4_sewerPillar", 1680, 520]);
  // the builder cistern (north): a ring walk round a round pool, chest on the rim
  props.push(["m4_sewerPillar", 920, 360], ["m4_sewerPillar", 1280, 360], ["m4_sewerPillar", 920, 160], ["m4_sewerPillar", 1280, 160], ["m4_brickArch", 1100, 500], ["builderPillar", 900, 260, { tint: 0x9aa890 }], ["m4_glowMold", 1000, 420], ["m4_glowMold", 1240, 240]);
  lamp(1000, 240); lamp(1200, 380);
  // corridor C: valve room 3 (north), gate 3 in the shaft down to the grating
  props.push(["m4_brickArch", 1760, 342], ["m4_streetGrating", 1960, 330, { solid: false, alpha: 0.9 }], ["m4_drainPipe", 1640, 345], ["m4_shackledBones", 1700, 470], ["m4_chainsHanging", 2080, 430]);
  lamp(1700, 380); lamp(2050, 380);
  props.push(["m4_valveStand", 1800, 240], ["m4_sewerPillar", 1720, 200], ["m4_sewerPillar", 1880, 200], ["m4_glowMold", 1740, 290]);
  lamp(1800, 190);
  gate("v3", 2000, 620);
  props.push(["m4_sewerPillar", 1920, 700], ["m4_sewerPillar", 2080, 700], ["m4_brickArch", 2160, 720], ["m4_sewerGrating", 2250, 722, { solid: false }], ["m4_glowMold", 2100, 880], flat("m4_streetGrating", 2160, 900, { solid: false }));
  lamp(2050, 760); lamp(2230, 770);
  World.def("ahuacanSewers", {
    name: "Ahuacan Sewers", w: 2400, h: 1500, base: "rock", music: "sewer", rim: 44,
    look: "Brick sewer tunnels under a city seen from above: dark wet brick vaults, a channel of shallow black water down the middle of every tunnel with narrow dry brick walks beside it, side rooms with valve wheels, a round builder cistern with a ring walk and a deep pool, a rat-warren dead end, thin shafts of white light falling through street gratings. Dim, damp, green mould.",
    legend: { paved: "dark wet brick walkway, mossy, with puddles", shallow: "ankle-deep black water in a channel with ripples and floating filth", floor: "dark round brick floor of the cistern and the valve rooms", water: "deep black still water", rock: "solid black brick and earth", grass: "wet mud and green slime" },
    bank: { paved: "grey", shallow: "teal", floor: "dark", water: "water", grass: "mud" },
    grade: { paved: { mul: [0.55, 0.58, 0.5], add: [-6, -2, -6] }, shallow: { mul: [0.28, 0.42, 0.36], add: [0, 2, 0] }, floor: { mul: [0.5, 0.52, 0.46], add: [-4, 0, -4] }, water: { mul: [0.4, 0.7, 0.6], add: [0, 2, 0] }, _: [0.95, 1.0, 0.95] },
    marks: [{ k: "blot", on: ["paved", "floor"], n: 22, col: [30, 70, 30], a: 0.25, r: [10, 36] }, { k: "dot", on: ["shallow"], n: 50, col: [150, 200, 170], a: 0.5, r: [1, 2], hi: false }],
    guide: [
      // corridor A (west mouth to the first shaft) with the rat-warren branch
      ["paved", L([[110, 1200], [1000, 1200]], 150)], ["shallow", L([[110, 1215], [1000, 1215]], 54)], ["paved", L([[400, 1200], [400, 1440]], 120)], ["floor", R(300, 1380, 200, 100)],
      // valve room 1
      ["paved", L([[560, 1200], [560, 1060]], 90)], ["floor", R(440, 940, 240, 160)],
      // shaft 1, corridor B, shaft 2, corridor C, shaft 3, the last stretch
      ["paved", L([[1000, 1200], [1000, 760], [1600, 760], [1600, 420], [2000, 420], [2000, 800], [2260, 800]], 150)],
      ["shallow", L([[1000, 1200], [1000, 760], [1600, 760], [1600, 420], [2000, 420], [2000, 800], [2260, 800]], 54)],
      ["floor", R(1200, 830, 200, 150)], ["paved", L([[1300, 780], [1300, 880]], 90)],
      ["floor", R(1700, 160, 200, 150)], ["paved", L([[1800, 420], [1800, 300]], 90)],
      // the cistern branch and the round cistern
      ["paved", L([[1000, 760], [1000, 520], [1100, 440]], 120)], ["floor", E(1100, 270, 270, 200)], ["water", E(1100, 270, 120, 80)], ["paved", E(1100, 440, 130, 60)],
      ["floor", R(2240, 740, 90, 120)],
    ],
    entries: { start: { x: 220, y: 1200, face: "right" }, from_lowstep: { x: 220, y: 1200, face: "right" }, from_palaceCourt: { x: 2170, y: 800, face: "left" } },
    exits: [
      { rect: [100, 1150, 70, 100], to: "lowstep", entry: "from_ahuacanSewers", push: [1, 0], floor: "paved" },
      { rect: [2250, 750, 80, 100], to: "palaceCourt", entry: "from_ahuacanSewers", push: [-1, 0], need: "ch7.sewers", blocked: "sewerGratingShut", floor: "floor" },
    ],
    triggers: [
      { id: "sewerEnter", rect: [180, 1150, 130, 100] },
      { id: "valve1", rect: [520, 1020, 80, 60], press: true }, { id: "valve2", rect: [1260, 950, 80, 60], press: true }, { id: "valve3", rect: [1760, 260, 80, 60], press: true },
      { id: "sewerEnd", rect: [2090, 750, 110, 100], show: ["sw.v1", "sw.v2", "sw.v3"] },
    ],
    chests: [{ id: "sewerChest", x: 1230, y: 330 }],
    npcs: [{ id: "pavo", art: "npcPavo", name: "Pavo", x: 310, y: 1170 }],
    props,
    scatter: [{ keys: [["m4_brickRubble", 2], ["m4_glowMold", 2], ["puddle", 2], ["bones", 1]], n: 36, on: ["paved", "floor"], seed: 201, scaleRange: [0.8, 1] }],
    lights,
    dark: { ambient: 0.66, radius: 230, color: 0x030806 },
    encounter: { table: "sewer", rate: 28 },
    amb: { birds: 0, butterflies: [], water: true, motes: 30, dust: 0x8aa890, tint: [0x102018, 0.16], weather: ["mist"], drips: [[800, 1150], [1000, 900], [1700, 640], [1100, 420], [2100, 760]], sparkle: { terrain: ["shallow"], color: 0xa8e8c8, rate: 2 } },
  });
})();
