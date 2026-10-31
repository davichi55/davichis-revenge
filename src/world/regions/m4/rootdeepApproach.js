// M4 ch9: Rootdeep Approach (field, 3000x2000, table "roots" 26 s, mist and shaking ground). A root-chasm splits the map N-S; the rope bridge crosses it (trigger dawnBridge, first crossing after ch9.cell9 until ch9.dawn).
// Entries start from_sea from_ashfeatherCamp from_blackMirrorPrison from_hollowNest from_rootdeep. Exits weepingSea@from_rootdeepApproach (dock, NE), ashfeatherCamp@from_rootdeepApproach (W), blackMirrorPrison@from_rootdeepApproach (cliff road, N), hollowNest@from_rootdeepApproach (S, W bank), rootdeep@from_rootdeepApproach (the descent, E, need ch9.s17).
// Chest approachChest. Guard patrols (armies, table roots) on the east roads.
(function () {
  const { R, E, P, L } = World.shapes, M = World.m3, props = [];
  const flat = (key, x, y, o) => [key, x, y, Object.assign({ dy: 3 - y }, o || {})];
  // the chasm and its bridge: posts at both ends, the long rope bridge laid over the gap
  props.push(["m4_bridgePost", 1260, 960], ["m4_bridgePost", 1260, 1060], ["m4_bridgePost", 1740, 960], ["m4_bridgePost", 1740, 1060], flat("m4_ropeBridgeLong", 1500, 1050, { solid: false, alpha: 0.95 }), ["m4_rootClump", 1300, 340], ["m4_rootClump", 1700, 1700, { solid: false }], ["m4_chewedTrunk", 1250, 1500], ["m4_chewedTrunk", 1750, 460]);
  // tower roots arching over the west bank, ferns, moss boulders, glowing mushrooms, the camp road
  props.push(["m4_giantRoot", 360, 520], ["m4_giantRoot", 980, 360], ["m4_giantRoot", 560, 1460], ["m4_giantRoot", 1000, 1720], ["m4_rootWall", 220, 1700], ["m4_rootWall", 820, 700], ["m4_jungleTree", 160, 300], ["m4_jungleTree", 460, 160], ["m4_jungleTree", 1180, 180], ["m4_jungleTree", 260, 1300], ["m4_jungleTree", 1180, 1250], ["m4_mossBoulder", 700, 880], ["m4_mossBoulder", 1100, 1180], ["m4_glowShroom", 520, 920], ["m4_glowShroom", 900, 1140], ["m4_glowShroom", 360, 1120], ["m4_bigFern", 640, 1080], ["m4_bigFern", 260, 860], ["m4_bigFern", 1160, 780]);
  // east bank: the cliff road to the prison (signs, a gibbet), the beach dock, the descent
  props.push(["m4_giantRoot", 2640, 700], ["m4_giantRoot", 2480, 1860], ["m4_rootWall", 2800, 1160], ["m4_jungleTree", 1900, 300], ["m4_jungleTree", 2000, 1200], ["m4_jungleTree", 2760, 1000], ["m4_jungleTree", 1900, 1700], ["m4_cliffSign", 2260, 620], ["m4_gibbet", 2300, 420], ["m4_cliffSign", 2140, 220], ["m4_beachPier", 2860, 440, { solid: false, dy: -10 }], ["m4_beachPalm", 2800, 220], ["m4_beachPalm", 2780, 640], ["m4_wreckBoat", 2740, 160], ["m4_rootSpikes", 2680, 1420], ["m4_rootSpikes", 2700, 1580], ["m4_chewedTrunk", 2400, 1260], ["m4_glowShroom", 2100, 1400], ["m4_bigFern", 2000, 800], ["m4_mossBoulder", 1950, 1500]);
  // the descent: a chewed hole in the roots at the end of the road
  props.push(["m4_gnawedRoot", 2860, 1460, { solid: [100, 30] }], ["m4_boneHeapRoot", 2760, 1600], ["m4_rootSpikes", 2700, 1360]);
  // the south road: the old ash-tree (hollow nest) at the end, a collapsed bridge
  props.push(["m4_charredBranch", 760, 1850, { solid: false }], ["m4_rootBridgeStub", 640, 1660, { solid: false }], ["m4_thornBush", 560, 1860], ["m4_thornBush", 900, 1840]);
  World.def("rootdeepApproach", {
    name: "Rootdeep Approach", w: 3000, h: 2000, base: "grass", music: "roots", rim: 44,
    look: "The deepest jungle seen from above under a canopy of gigantic roots: dark mossy ground with drifts of fallen leaves and glowing blue-green mushrooms, a pale earth road, a huge black root-chasm running north to south in the middle of the map spanned by a long rope bridge, roots as large as towers arching over the banks, ferns, mist in green light shafts, a pale beach with a small wooden dock in the north-east, a chewed hole in a root-wall in the south-east. Dim, green, the ground trembling.",
    legend: { grass: "dark wet jungle moss, drifts of fallen leaves, roots and ferns", road: "pale beaten earth road with roots crossing it", floor: "grey moss-blackened plank bridge", rock: "bottomless black root-chasm and impassable giant roots", sand: "pale beach sand", shallow: "dark green shallows", water: "dark sea", paved: "mossy flagstones" },
    bank: { grass: "green", road: "dirt", floor: "dark", rock: "dark", sand: "sand", shallow: "teal", water: "water", paved: "grey" },
    grade: { grass: { mul: [0.42, 0.7, 0.5], add: [-4, 4, -2] }, road: { mul: [0.7, 0.64, 0.52], add: [-2, 0, -4] }, floor: { mul: [0.7, 0.62, 0.5], add: [0, 0, 0] }, rock: { mul: [0.4, 0.46, 0.44], add: [0, 2, 0] }, sand: { mul: [0.9, 0.9, 0.8], add: [0, 0, 0] }, _: [0.94, 1, 0.96] },
    marks: [{ k: "dot", on: ["grass"], n: 60, col: [160, 255, 200], a: 0.6, r: [1, 2], hi: false }, { k: "blot", on: ["grass"], n: 24, col: [20, 40, 24], a: 0.3, r: [16, 48] }],
    guide: [
      ["grass", R(60, 60, 1240, 1880)], ["grass", R(1700, 60, 1240, 1880)],
      // the chasm (x 1300..1700) with the bridge
      ["rock", R(1300, 44, 400, 1912)], ["floor", L([[1260, 1000], [1740, 1000]], 100)],
      // west bank: the camp road and the south road to the hollow nest
      ["road", L([[60, 1000], [1280, 1000]], 100)], ["road", L([[700, 1000], [700, 1500], [760, 1940]], 90)],
      // east bank: junction, the prison cliff road north, the dock, the south road, the descent
      ["road", L([[1720, 1000], [2200, 1000]], 100)], ["road", L([[2200, 1000], [2200, 60]], 100)], ["road", L([[2200, 400], [2780, 400]], 90)], ["road", L([[2200, 1000], [2200, 1500], [2800, 1500]], 100)],
      ["sand", R(2780, 200, 160, 400)], ["shallow", R(2900, 160, 60, 520)], ["water", R(2950, 44, 50, 1000)],
      ["rock", E(2900, 1480, 100, 150)],
    ],
    entries: {
      start: { x: 160, y: 1000, face: "right" }, from_ashfeatherCamp: { x: 160, y: 1000, face: "right" }, from_sea: { x: 2820, y: 400, face: "left" }, from_blackMirrorPrison: { x: 2200, y: 160, face: "down" },
      from_hollowNest: { x: 760, y: 1850, face: "up" }, from_rootdeep: { x: 2700, y: 1500, face: "left" },
    },
    exits: [
      { rect: [2890, 350, 60, 100], to: "weepingSea", entry: "from_rootdeepApproach", push: [1, 0], floor: "floor", need: "ch9.start" },
      { rect: [52, 950, 56, 100], to: "ashfeatherCamp", entry: "from_rootdeepApproach", push: [1, 0], floor: "road" },
      { rect: [2150, 52, 100, 56], to: "blackMirrorPrison", entry: "from_rootdeepApproach", push: [0, 1], floor: "road" },
      { rect: [710, 1940, 100, 56], to: "hollowNest", entry: "from_rootdeepApproach", push: [0, -1], floor: "road" },
      { rect: [2790, 1450, 60, 100], to: "rootdeep", entry: "from_rootdeepApproach", push: [-1, 0], need: "ch9.s17", blocked: "descentSealed", floor: "road" },
    ],
    triggers: [{ id: "dawnBridge", rect: [1260, 950, 480, 100], show: ["ch9.cell9", "!ch9.dawn"] }, { id: "dawnAuto", rect: [1260, 950, 480, 100], show: ["ch9.cell9", "!ch9.dawn"] }],
    chests: [{ id: "approachChest", x: 940, y: 1690 }],
    npcs: [{ id: null, art: "npcSentry", x: 2340, y: 980, still: true }, { id: null, art: "npcScout", x: 400, y: 1050, path: [[300, 1050], [900, 1050]], speed: 16 }],
    gather: [{ id: "glowrootSap1", x: 500, y: 780, label: "Glowing sap in a root", color: 0xf0b840 }, { id: "glowrootSap2", x: 2450, y: 700, label: "Sap beading on a root", color: 0xf0b840 }],
    props,
    scatter: [
      { keys: [["m4_glowShroom", 2], ["m4_bigFern", 3], ["m4_mossBoulder", 1], ["m4_rootClump", 2], ["m4_jungleTree", 1]], n: 110, on: ["grass"], seed: 361, scaleRange: [0.8, 1.15] },
    ],
    lights: [[1300, 1000, 160, 0.4], [1700, 1000, 160, 0.4], [2860, 440, 120, 0.4]],
    dark: { ambient: 0.28, radius: 360, color: 0x030a08 },
    encounter: { zones: [{ rect: [0, 900, 400, 200], table: null, rate: 0 }, { rect: [0, 0, 3000, 2000], table: "roots", rate: 26 }] },
    amb: {
      birds: 0, butterflies: [], water: true, motes: 70, dust: 0x90e8b8, tint: [0x0c2418, 0.16], warm: [0x90ffb0, 0.03], weather: ["mist", "clear"], vignette: 1,
      armies: [
        { id: "cliffPatrol", lane: [[2200, 900], [2200, 220]], mode: "pingpong", speed: 28, rows: 2, cols: 3, sight: 210, table: "roots", cry: "Halt! The cliff road is closed!" },
        { id: "eastPatrol", lane: [[1780, 1030], [2160, 1030], [2160, 1460], [2700, 1460]], mode: "pingpong", speed: 26, rows: 2, cols: 3, sight: 200, table: "roots" },
      ],
    },
  });
})();
