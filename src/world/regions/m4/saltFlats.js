// M4 ch8: The Red Salt Flats (field, 2800x1900, empire zone, table "saltFlats" 28 s). Entries start from_tzavanCoast from_redSaltWeir. Exits tzavanCoast@from_saltFlats (E), redSaltWeir@from_saltFlats (W).
// NPC ninthBanner (a banner that walks; hide l6.done; interact = legend L6 intro). Gather ninthCairn (show !ninth.cairn). Chest flatsCache (show l6.done || ninth.cairn). Legend L6 (shared with tzavanCoast). Convoys (armies, table coastConvoy, hide ch8.supply>=3).
(function () {
  const { R, E, P, L } = World.shapes, M = World.m3, props = [];
  // the Ninth Legion's last camp (north centre): cairns round the supply chest, a toppled standard
  props.push(["m4_ninthCairn", 1280, 520], ["m4_ninthCairn", 1520, 520], ["m4_ninthCairn", 1400, 640], ["m4_legionCairn", 1220, 400], ["m4_legionCairn", 1580, 410], ["m4_legionCairn", 1400, 330], ["legionStandard", 1330, 420, { tint: 0xa09890 }], ["m4_saltMound", 1190, 600], ["m4_saltMound", 1630, 620]);
  // wind-carved salt statues scattered over the plain, brine pans and ruined cairns
  props.push(["m4_saltStatue", 520, 600], ["m4_saltStatue", 880, 420], ["m4_saltStatue", 1060, 1420], ["m4_saltStatue", 1800, 1300], ["m4_saltStatue", 2200, 560], ["m4_saltStatue", 2420, 1500], ["m4_saltStatue", 640, 1540], ["m4_saltStatue", 1900, 360],
    ["m4_saltPan", 900, 1180], ["m4_saltPan", 1700, 1060], ["m4_saltPan", 2260, 1180], ["m4_saltPan", 460, 1180], ["m4_legionCairn", 760, 800], ["m4_legionCairn", 2000, 760], ["m4_legionCairn", 2480, 880], ["m4_legionCairn", 300, 760]);
  // the weir side (west): an overseers' tower, white barracks and brine vats on the horizon
  props.push(["m4_overseerTower", 180, 680], ["m4_whiteBarracks", 360, 1560], ["m4_brineVat", 150, 1260], ["m4_brineVat", 240, 1290], ["m4_chainPost", 300, 1100], ["m4_chainPost", 360, 1110], ["m4_overseerTower", 2620, 700, { tint: 0xd0c8c0 }]);
  World.def("saltFlats", {
    name: "The Red Salt Flats", w: 2800, h: 1900, base: "salt", music: "provinces", rim: 44,
    look: "A flat red-and-white salt plain seen from above: cracked white salt crust stained pink and rust-red in drifts, shallow green-grey brine pools with white crystal rims and a few deep blue brine holes, an old paved road crossing the plain from east to west, ruined legion cairns, wind-carved salt statues, white salt mounds. Harsh grey sky, bleached, dry, a little sinister.",
    legend: { salt: "cracked white salt crust, glittering, with pink-red staining and wind ripples", red: "rust-red salt mud and iron-stained crust, cracked", road: "an old pale road of packed salt and grey flagstones with ruts", shallow: "shallow brine pool, milky green-grey, white crystal edges", water: "deep blue-green brine hole with white crystal rim", sand: "pale grey gravel", rock: "dark grey cliff edge" },
    bank: { salt: "salt", red: "red", road: "dirt", shallow: "teal", water: "water", sand: "sand", rock: "dark" },
    grade: { salt: { mul: [0.98, 0.94, 0.94], add: [2, -2, -2] }, red: { mul: [0.82, 0.52, 0.48], add: [4, -4, -4] }, road: { mul: [0.85, 0.82, 0.8], add: [4, 2, 2] }, shallow: { mul: [0.7, 1.0, 0.85], add: [6, 14, 8] }, water: { mul: [0.6, 1.0, 0.9], add: [0, 6, 4] }, _: [1, 0.97, 0.97] },
    marks: [{ k: "crack", on: ["salt"], n: 80, col: [140, 110, 100], a: 0.4, len: [20, 70] }, { k: "dot", on: ["salt"], n: 60, col: [255, 255, 255], a: 0.8, r: [1, 2], hi: false }],
    guide: [
      ["red", E(700, 1500, 380, 200)], ["red", E(2100, 500, 400, 180)], ["red", E(1500, 1500, 300, 170)], ["red", E(300, 400, 260, 150)], ["red", E(2400, 1400, 260, 160)],
      ["road", L([[60, 950], [700, 1000], [1400, 900], [2100, 1000], [2740, 950]], 100)],
      ["shallow", E(900, 1180, 190, 90)], ["water", E(900, 1180, 110, 50)], ["shallow", E(1700, 1060, 200, 100)], ["water", E(1700, 1060, 120, 56)], ["shallow", E(2260, 1180, 170, 80)], ["water", E(2260, 1180, 90, 40)], ["shallow", E(460, 1180, 150, 70)], ["water", E(460, 1180, 80, 34)],
      ["shallow", E(1000, 300, 200, 90)], ["shallow", E(2300, 1700, 240, 90)], ["shallow", E(500, 1750, 200, 70)], ["shallow", E(1800, 300, 150, 70)],
    ],
    entries: { start: { x: 2640, y: 950, face: "left" }, from_tzavanCoast: { x: 2640, y: 950, face: "left" }, from_redSaltWeir: { x: 160, y: 950, face: "right" } },
    exits: [
      { rect: [2740, 900, 60, 100], to: "tzavanCoast", entry: "from_saltFlats", push: [-1, 0], floor: "road" },
      { rect: [52, 900, 60, 100], to: "redSaltWeir", entry: "from_saltFlats", push: [1, 0], floor: "road" },
    ],
    gather: [{ id: "ninthCairn", x: 1400, y: 560, label: "A legion cairn", color: 0xe8e0d0, show: "!ninth.cairn" }],
    chests: [{ id: "flatsCache", x: 1400, y: 420, show: { any: ["l6.done", "ninth.cairn"] } }],
    legends: [{ id: "L6", enemy: "ghostOfTheNinthLegion", level: 46, chance: 0.04, spots: [[1000, 700], [1800, 800], [1400, 1300], [600, 1000]], when: "!l6.done" }],
    npcs: [
      { id: "ninthBanner", art: "npcNinthBanner", name: "A banner that walks", x: 1500, y: 700, path: [[1500, 700], [1900, 760], [1700, 1000], [1200, 800]], loop: true, speed: 14, hide: "l6.done", solid: false },
    ],
    props,
    scatter: [
      { keys: [["m4_saltMound", 2], ["m4_saltBush", 1], ["m4_legionCairn", 1], ["bones2", 1]], n: 70, on: ["salt", "red"], seed: 271, scaleRange: [0.8, 1.1] },
      { keys: [["m2_deadSnag", 1], ["debris", 1], ["bones", 1]], n: 14, on: ["salt", "red"], seed: 272 },
    ],
    encounter: { table: "saltFlats", rate: 28 },
    amb: {
      birds: 2, butterflies: [], water: true, dust: 0xe8d8d0, motes: 44, tint: [0x4a3038, 0.1], warm: [0xffb090, 0.05], weather: ["clear", "mist"], sparkle: { terrain: ["salt"], color: 0xffffff, rate: 5 },
      armies: [
        { id: "saltConvoyA", lane: [[200, 960], [1300, 910]], mode: "pingpong", speed: 17, rows: 1, cols: 3, banner: false, cent: false, sight: 0, table: "coastConvoy", hide: "ch8.supply>=3", s0: 120 },
        { id: "saltPatrol", lane: [[1500, 960], [2500, 980]], mode: "pingpong", speed: 28, rows: 2, cols: 3, sight: 200, table: "saltFlats", cry: "Halt! The flats are closed after dusk!" },
        { id: "saltPatrolN", lane: [[900, 500], [1100, 700], [700, 800]], mode: "loop", speed: 26, rows: 2, cols: 3, sight: 190, table: "saltFlats" },
      ],
    },
  });
})();
