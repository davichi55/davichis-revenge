// M4 ch8: The Orchard Hills (field, 2800x1900, empire zone, table "orchard" 28 s). Three terraces joined by stairs; Tuk Orchard in the south, the governor's villa on the NW hill, the Sunmaw pyramid on the NE ridge.
// Entries start from_tzavanCoast from_tukOrchard from_sunmawPyramid from_governorsVilla. Exits tzavanCoast@from_orchardHills (W), tukOrchard@from_orchardHills (S), sunmawPyramid@from_orchardHills (front stair), sunmawPyramid@from_backDoor (E, show tuk.rumour2), governorsVilla@from_orchardHills (NW).
// Gather granaryDoor (a wall of vines, SE; hide granary.done). Convoys: armies with table coastConvoy (hide ch8.supply>=3).
(function () {
  const { R, E, P, L } = World.shapes, M = World.m3, props = [];
  const flat = (key, x, y, o) => [key, x, y, Object.assign({ dy: 3 - y }, o || {})];
  // NE ridge: the Sunmaw pyramid and its front stair; the cultists' back door on the east edge
  props.push(["m4_ridgePyramid", 2250, 320, { solid: [180, 36] }]);
  props.push(["m2_skullRack", 2060, 400], ["m2_obsidianBrazier", 2130, 420, { fire: [0, -56, 0.9] }], ["m2_obsidianBrazier", 2370, 420, { fire: [0, -56, 0.9] }], ["m2_redBanner", 2460, 400], ["m2_redBanner", 2040, 340], ["m2_obsidianStele", 2650, 340]);
  // NW hill: the governor's villa roof and a colonnade, a walled garden
  props.push(["m4_villaRoof", 380, 330, { solid: [150, 40] }], ["m4_villaColumn", 190, 400], ["m4_villaColumn", 590, 400], ["m4_vineWall", 760, 360], ["m4_vineWall", 920, 360], ["m4_cacaoTree", 1050, 330]);
  // terrace walls with vines (gaps are the stairs) and irrigation gates
  for (const x of [200, 360, 520, 1000, 1160, 1320, 1700, 1860, 2200, 2360, 2680]) props.push(["m4_vineWall", x, 1250, { solid: [70, 16] }]);
  for (const x of [200, 360, 520, 680, 860, 1020, 1180, 1700, 1860, 2020, 2200, 2360, 2680]) props.push(["m4_vineWall", x, 700, { solid: [70, 16] }]);
  props.push(["m4_irrigationGate", 1250, 1000], ["m4_irrigationGate", 1880, 880], ["m4_irrigationGate", 640, 1560], ["m4_irrigationGate", 2280, 1620]);
  // picking and drying: baskets, racks
  props.push(["m4_pickerBaskets", 960, 1500], ["m4_pickerBaskets", 1700, 1500], ["m4_dryingRack", 1040, 1430], ["m4_dryingRack", 1860, 1440], ["m4_pickerBaskets", 1420, 820], ["m4_dryingRack", 1600, 830]);
  // the hidden granary in the SE hillside
  props.push(["m4_granaryVines", 2560, 1560, { hide: "granary.done" }], ["m4_granaryOpen", 2560, 1560, { show: "granary.done" }], ["m4_vineWall", 2420, 1480], ["m4_vineWall", 2720, 1480]);
  World.def("orchardHills", {
    name: "The Orchard Hills", w: 2800, h: 1900, base: "grass", music: "provinces", rim: 44,
    look: "Terraced hills of cacao and fruit orchards seen from above: three broad terraces of rich green grass and dark earth rows, held by old stone retaining walls thick with vines and joined by stone stairs, narrow irrigation channels with little sluice gates, reddish dirt roads linking a village in the south, a villa on a hill in the north-west and a black-red stepped pyramid on a ridge in the north-east. Warm, fertile, uneasy.",
    legend: { grass: "rich green orchard grass with dark earth rows, fallen fruit, flowers and dappled leaf shadow", road: "reddish dirt road with cart ruts", wall: "old stone terrace walls covered with green vines", shallow: "narrow irrigation water channel, clear and shallow", sand: "pale packed earth yards", rock: "dark rock cliff edge", paved: "worn stone stairs" },
    bank: { grass: "green", road: "dirt", wall: "grey", shallow: "teal", sand: "sand", rock: "dark", paved: "grey" },
    grade: { grass: { mul: [0.82, 0.98, 0.55], add: [0, 8, -8] }, road: { mul: [1.05, 0.8, 0.6], add: [10, 0, -6] }, wall: { mul: [0.55, 0.62, 0.45], add: [-4, 4, -6] }, shallow: { mul: [0.7, 1.0, 0.9], add: [0, 10, 6] }, _: [0.98, 1, 0.96] },
    marks: [{ k: "dot", on: ["grass"], n: 70, col: [240, 180, 80], a: 0.6, r: [1, 2], hi: false }, { k: "blot", on: ["grass"], n: 24, col: [30, 70, 30], a: 0.22, r: [16, 44] }],
    guide: [
      // terrace walls (the stairs are gaps)
      ["wall", R(60, 1250, 640, 34)], ["wall", R(800, 1250, 1200, 34)], ["wall", R(2100, 1250, 640, 34)],
      ["wall", R(60, 700, 1340, 34)], ["wall", R(1500, 700, 1000, 34)], ["wall", R(2600, 700, 140, 34)],
      ["paved", R(700, 1240, 100, 56)], ["paved", R(2000, 1240, 100, 56)], ["paved", R(1400, 690, 100, 56)], ["paved", R(2500, 690, 100, 56)],
      // roads
      ["road", L([[60, 1500], [1500, 1500], [1500, 1860]], 90)], ["road", L([[750, 1500], [750, 1000], [2050, 1000], [2050, 1500]], 90)], ["road", L([[1450, 1000], [1450, 400], [2250, 420]], 90)], ["road", L([[1450, 420], [420, 420]], 90)], ["road", L([[2550, 1000], [2550, 420], [2740, 420]], 90)], ["road", L([[2050, 1000], [2550, 1000]], 90)],
      ["road", L([[2050, 1500], [2560, 1560]], 80)],
      // irrigation channels
      ["shallow", L([[900, 1380], [1250, 1380], [1900, 1380], [2400, 1380]], 28)], ["shallow", L([[900, 850], [1250, 850], [1880, 820], [2300, 840]], 28)], ["shallow", L([[1000, 300], [1200, 250], [1700, 250]], 26)],
      ["sand", E(2250, 400, 240, 90)], ["sand", E(420, 400, 200, 80)],
    ],
    entries: {
      start: { x: 160, y: 1500, face: "right" }, from_tzavanCoast: { x: 160, y: 1500, face: "right" }, from_tukOrchard: { x: 1500, y: 1770, face: "up" }, from_sunmawPyramid: { x: 2250, y: 470, face: "down" }, from_governorsVilla: { x: 420, y: 470, face: "down" },
    },
    exits: [
      { rect: [52, 1450, 60, 100], to: "tzavanCoast", entry: "from_orchardHills", push: [1, 0], floor: "road" },
      { rect: [1440, 1850, 120, 50], to: "tukOrchard", entry: "from_orchardHills", push: [0, -1], floor: "road" },
      { rect: [2200, 360, 100, 60], to: "sunmawPyramid", entry: "from_orchardHills", push: [0, 1], floor: "sand" },
      { rect: [2700, 370, 60, 100], to: "sunmawPyramid", entry: "from_backDoor", push: [-1, 0], show: "tuk.rumour2", floor: "road" },
      { rect: [370, 360, 100, 60], to: "governorsVilla", entry: "from_orchardHills", push: [0, 1], floor: "sand" },
    ],
    gather: [{ id: "orchardRue1", x: 1200, y: 1120, label: "A hedgerow of grey rue", color: 0x9ad88a }, { id: "orchardRue2", x: 1950, y: 560, label: "Rue by the ditch", color: 0x9ad88a }, { id: "granaryDoor", x: 2560, y: 1600, label: "A wall of vines", color: 0x9ad88a, hide: "granary.done" }],
    npcs: [
      { id: null, art: "npcOrchardWorker", x: 1000, y: 1560, path: [[900, 1560], [1300, 1560]], speed: 16 }, { id: null, art: "npcOrchardWorker", x: 1800, y: 1000, path: [[1700, 1040], [1950, 1040]], speed: 16 },
      { id: null, art: "npcOrchardWorker", x: 1500, y: 800, still: true },
    ],
    props,
    scatter: [
      { keys: [["m4_fruitTree", 2], ["m4_cacaoTree", 3]], n: 150, on: ["grass"], seed: 301, scaleRange: [0.85, 1.1] },
      { keys: [["m4_pickerBaskets", 1], ["m4_flowerBed", 2], ["m2_fernClump", 1]], n: 30, on: ["grass"], seed: 302, scaleRange: [0.8, 1] },
    ],
    encounter: { table: "orchard", rate: 28 },
    amb: {
      birds: 6, butterflies: [[600, 1400], [1200, 1100], [1800, 1450], [900, 600], [2000, 600], [1400, 1700]], water: true, dust: 0xf0e8b8, motes: 44, tint: [0x28381c, 0.08], warm: [0xffe0a0, 0.06], weather: ["clear"],
      armies: [
        { id: "orchardConvoy", lane: [[200, 1510], [1400, 1510]], mode: "pingpong", speed: 17, rows: 1, cols: 3, banner: false, cent: false, sight: 0, table: "coastConvoy", hide: "ch8.supply>=3", s0: 200 },
        { id: "orchardConvoy2", lane: [[780, 1010], [2000, 1010]], mode: "pingpong", speed: 16, rows: 1, cols: 3, banner: false, cent: false, sight: 0, table: "coastConvoy", hide: "ch8.supply>=3", s0: 500 },
        { id: "orchardPatrol", lane: [[1460, 900], [1460, 450], [1000, 430]], mode: "pingpong", speed: 28, rows: 2, cols: 3, sight: 200, table: "orchard", cry: "Halt! You are on the governor's road!" },
        { id: "orchardPatrolE", lane: [[2060, 1010], [2540, 1010], [2540, 480]], mode: "pingpong", speed: 26, rows: 2, cols: 3, sight: 200, table: "orchard" },
      ],
    },
  });
})();
