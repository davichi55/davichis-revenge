// M4 ch8: The Red Salt Mines (dungeon, table "saltMine" 22 s). Entries start from_redSaltWeir. Exit redSaltWeir@from_redSaltMines (W).
// Three gangs (NPC ids gang1..3, an overseer each; hide salt.gang1..3) in three caves, then the barge dock in the east: press trigger `barges` (burn the salt barges, ch8.mines). Chest mineChest (alcove SE).
(function () {
  const { R, E, P, L } = World.shapes, M = World.m3, props = [], lights = [];
  const lamp = (x, y) => { props.push(["m2_ropeLamp", x, y, { fire: [0, -92, 0.8] }]); lights.push([x, y - 70, 170, 0.6]); };
  // entrance tunnel: rails, carts, lamps, tool racks
  props.push(["mineCart", 330, 740], ["toolRack", 520, 724], ["oreHeap", 220, 724], ["m4_saltMound", 440, 860]); lamp(300, 735); lamp(620, 735);
  // cave 1 (gang 1, the brine channel): chained workers on a rail, crystals on the walls
  props.push(["m4_chainPost", 700, 570], ["m4_chainPost", 780, 580], ["m4_chainPost", 880, 570], ["m4_chainPost", 980, 580], ["mineCart", 920, 470], ["saltCrystal", 640, 410], ["saltCrystal", 1060, 410], ["m4_saltMound", 840, 400], ["oreHeap", 1020, 640]); lamp(760, 420); lamp(1000, 420);
  // cave 2 (gang 2, the second channel and the foreman's desk)
  props.push(["m4_chainPost", 1180, 1280], ["m4_chainPost", 1260, 1290], ["m4_chainPost", 1380, 1280], ["saltCrystal", 1140, 1130], ["saltCrystal", 1560, 1130], ["m4_brineVat", 1480, 1250], ["m4_brineVat", 1540, 1280], ["crates", 1320, 1150], ["clerkDesk", 1440, 1170]); lamp(1200, 1130); lamp(1500, 1130);
  props.push(["mineCart", 1500, 1460], ["oreHeap", 1420, 1480], ["toolRack", 1600, 1470], ["saltCrystal", 1640, 1400]);
  // cave 3 (gang 3, the pulley by the rails)
  props.push(["m4_chainPost", 1700, 460], ["m4_chainPost", 1780, 470], ["m4_chainPost", 1880, 460], ["scaffoldCrane", 1960, 400], ["mineCart", 1660, 620], ["mineCart", 1980, 640], ["saltCrystal", 1640, 350], ["saltCrystal", 2060, 350]); lamp(1760, 350); lamp(2000, 560);
  // the barge dock: plank walk along the black water, salt barges, the heaps of salt
  props.push(["m4_saltBarge", 2290, 720, { solid: false, hide: "ch8.mines" }], ["m4_saltBarge", 2290, 900, { solid: false, hide: "ch8.mines" }], ["m4_saltBargeBurning", 2290, 720, { solid: false, show: "ch8.mines" }], ["m4_saltBargeBurning", 2290, 900, { solid: false, show: "ch8.mines" }], ["m4_saltMound", 2200, 600], ["m4_saltMound", 2200, 1080], ["m4_saltMound", 2150, 800], ["m4_brineVat", 2140, 920], ["m4_chainsHanging", 2300, 600, { solid: false }], ["bollards", 2250, 830]); lamp(2180, 700); lamp(2180, 960);
  World.def("redSaltMines", {
    name: "The Red Salt Mines", w: 2400, h: 1600, base: "rock", music: "mines", rim: 44,
    look: "Slave salt mines seen from above: low dark tunnels cut in rust-red rock with glittering white salt crust on the floors, three wider caves each with a brine channel and a line of iron chain posts, wooden mine rails and carts, glowing rope lamps, a long barge dock in the east where a channel of black brine water runs between plank walks and white salt heaps. Cramped, glittering, cruel.",
    legend: { salt: "white salt crust floor glittering with crystals over rust-red rock", paved: "packed rust-red earth tunnel floor with cart tracks", road: "wooden mine rails and planks", shallow: "shallow brine channel, milky and green-grey", water: "black brine water", floor: "grey wooden plank walkway", rock: "solid rust-red rock with veins of white salt" },
    bank: { salt: "salt", paved: "red", road: "dirt", shallow: "teal", water: "water", floor: "dark", rock: "dark" },
    grade: { salt: { mul: [0.82, 0.86, 1.0], add: [-4, 0, 8] }, paved: { mul: [0.7, 0.55, 0.52], add: [0, -4, -4] }, shallow: { mul: [0.55, 0.85, 0.75], add: [0, 6, 4] }, water: { mul: [0.5, 0.8, 0.8], add: [0, 2, 2] }, _: [0.92, 0.94, 1] },
    marks: [{ k: "dot", on: ["salt"], n: 90, col: [255, 255, 255], a: 0.8, r: [1, 2], hi: false }, { k: "crack", on: ["paved"], n: 30, col: [60, 30, 28], a: 0.4, len: [20, 60] }],
    guide: [
      ["paved", L([[100, 800], [700, 800]], 150)], ["road", L([[100, 800], [700, 800]], 24)],
      ["paved", L([[700, 800], [700, 600]], 120)], ["salt", R(600, 380, 500, 300)], ["shallow", L([[620, 520], [1080, 520]], 50)],
      ["paved", L([[700, 800], [1300, 800], [1300, 1150]], 150)], ["salt", R(1100, 1100, 500, 320)], ["shallow", L([[1120, 1240], [1580, 1240]], 50)], ["salt", R(1400, 1400, 260, 120)],
      ["paved", L([[1300, 800], [1800, 800], [1800, 560]], 150)], ["salt", R(1600, 300, 500, 340)], ["road", L([[1620, 560], [2080, 560]], 22)],
      ["paved", L([[1800, 800], [2160, 800]], 150)], ["salt", R(2100, 560, 120, 560)], ["water", R(2230, 600, 120, 500)], ["floor", L([[2200, 620], [2200, 1060]], 56)],
    ],
    entries: { start: { x: 200, y: 800, face: "right" }, from_redSaltWeir: { x: 200, y: 800, face: "right" } },
    exits: [{ rect: [52, 750, 60, 100], to: "redSaltWeir", entry: "from_redSaltMines", push: [1, 0], floor: "paved" }],
    triggers: [{ id: "barges", rect: [2150, 760, 110, 100], press: true }],
    chests: [{ id: "mineChest", x: 1560, y: 1470 }],
    npcs: [
      { id: "gang1", art: "npcOverseer", name: "Overseer", x: 920, y: 600, hide: "salt.gang1", hint: "E / Space: the first gang" },
      { id: "gang2", art: "npcOverseer", name: "Overseer", x: 1320, y: 1320, hide: "salt.gang2", hint: "E / Space: the second gang" },
      { id: "gang3", art: "npcOverseer", name: "Overseer", x: 1830, y: 540, hide: "salt.gang3", hint: "E / Space: the third gang" },
      { id: null, art: "npcSlave", x: 720, y: 610, still: true, hide: "salt.gang1" }, { id: null, art: "npcSlave", x: 830, y: 610, still: true, hide: "salt.gang1" }, { id: null, art: "npcMiner", x: 1010, y: 610, still: true, hide: "salt.gang1" },
      { id: null, art: "npcSlave", x: 1210, y: 1320, still: true, hide: "salt.gang2" }, { id: null, art: "npcMiner", x: 1420, y: 1320, still: true, hide: "salt.gang2" }, { id: null, art: "npcSlave", x: 1100, y: 1310, still: true, hide: "salt.gang2" },
      { id: null, art: "npcMiner", x: 1730, y: 500, still: true, hide: "salt.gang3" }, { id: null, art: "npcSlave", x: 1930, y: 500, still: true, hide: "salt.gang3" }, { id: null, art: "npcSlave", x: 1650, y: 500, still: true, hide: "salt.gang3" },
    ],
    props,
    scatter: [{ keys: [["saltCrystal", 2], ["m4_saltMound", 1], ["rubblePile", 1], ["bones2", 1]], n: 26, on: ["salt", "paved"], seed: 291, scaleRange: [0.7, 1] }],
    lights,
    dark: { ambient: 0.6, radius: 240, color: 0x050812 },
    encounter: { table: "saltMine", rate: 22 },
    amb: { birds: 0, butterflies: [], water: true, motes: 40, dust: 0xe8e0e0, tint: [0x20243c, 0.1], sparkle: { terrain: ["salt"], color: 0xffffff, rate: 6 }, drips: [[800, 600], [1300, 1250], [1900, 520], [500, 790]] },
  });
})();
