// M4 ch8: Sunmaw Harvesting Pyramid (dungeon, table "sunmaw" 22 s). Entries start from_orchardHills (front stair, S) from_backDoor (cultists' door, E). Exit orchardHills@from_sunmawPyramid (S).
// Climb: plaza -> stair -> terrace of collar altars -> stair -> acolytes' terrace -> stair -> summit. Trigger s14Fight (summit, before the cracked altar). Chest g13_bloodlettersAltar (summit, show ch8.s14). The back door leads along the acolytes' cells onto the first terrace.
(function () {
  const { R, E, P, L } = World.shapes, M = World.m3, props = [], lights = [], red = 0xd08070;
  const brazier = (x, y) => { props.push(["m4_bloodBrazier", x, y]); lights.push([x, y - 50, 150, 0.55]); };
  // the tier faces: pyramid blocks stand on the wall bands between the terraces (stair gaps in the middle)
  for (const x of [560, 760, 960, 1440, 1640, 1840]) props.push(["m2_pyramidTier", x, 1250, { scale: 0.8, tint: 0x8a5a54 }]);
  for (const x of [660, 860, 1480, 1680]) props.push(["m2_pyramidTier", x, 800, { scale: 0.8, tint: 0x8a5a54 }]);
  for (const x of [900, 1500]) props.push(["m2_pyramidTier", x, 380, { scale: 0.8, tint: 0x8a5a54 }]);
  // plaza: the front stair's foot, skull racks, collar piles, the ring of obsidian stele
  props.push(["m4_skullRack", 780, 1420], ["m4_skullRack", 1620, 1420], ["m2_obsidianStele", 940, 1480], ["m2_obsidianStele", 1460, 1480], ["m2_collarPile", 1100, 1390], ["m2_collarPile", 1300, 1400], ["m2_whipPost", 880, 1330], ["m2_whipPost", 1520, 1330]); brazier(1080, 1300); brazier(1320, 1300);
  // terrace 1: the ring of collar altars
  props.push(["m2_collarAltar", 700, 960, { glow: "gold", tint: red }], ["m2_collarAltar", 1000, 900, { glow: "gold", tint: red }], ["m2_collarAltar", 1400, 900, { glow: "gold", tint: red }], ["m2_collarAltar", 1700, 960, { glow: "gold", tint: red }], ["m2_obsidianStele", 560, 1040], ["m2_obsidianStele", 1840, 1040], ["m4_skullRack", 560, 900], ["m4_skullRack", 1840, 900]); brazier(900, 1030); brazier(1500, 1030);
  // the back door (E) and the acolytes' cells along the corridor
  props.push(["m4_cellDoor", 2180, 840], ["m4_cellDoor", 2060, 840], ["m4_cellDoor", 1940, 840], ["m4_chainPost", 2120, 960], ["m4_chainPost", 2000, 960], ["m4_shackledBones", 2240, 1000, { solid: false }], ["m2_obsidianStele", 2320, 800], ["m4_skullRack", 2290, 980]); brazier(2250, 1000);
  // terrace 2: the acolytes' terrace, a wide red carpet of old blood, braziers
  props.push(["m2_obsidianStele", 780, 440], ["m2_obsidianStele", 1620, 440], ["m4_skullRack", 840, 520], ["m4_skullRack", 1560, 520], ["m2_collarAltar", 1000, 520, { glow: "gold", tint: red }], ["m2_collarAltar", 1400, 520, { glow: "gold", tint: red }]); brazier(960, 600); brazier(1440, 600);
  // the summit: the cracked altar, chest behind, banners
  props.push(["m4_crackedAltar", 1200, 170, { glow: "gold" }], ["m2_redBanner", 1040, 160], ["m2_redBanner", 1360, 160], ["m4_skullRack", 1000, 240], ["m4_skullRack", 1400, 240]); brazier(1120, 240); brazier(1280, 240);
  World.def("sunmawPyramid", {
    name: "Sunmaw Harvesting Pyramid", w: 2400, h: 1600, base: "rock", music: "pyramid", rim: 44,
    look: "An old black-and-red stepped harvesting pyramid seen from above at dusk: a broad plaza at the foot with skull racks, collar piles and obsidian steles, a grand stair climbing between three terraces of black-red stone stained dark brown with old blood, a ring of collar altars on the first terrace, an acolytes' terrace with cells along a corridor behind a side door on the east, a small summit platform at the north with a cracked altar. Oppressive, red torchlight, heavy stone.",
    legend: { floor: "black-red polished obsidian-flecked stone slabs with old brown blood stains, cracked, torch-lit", paved: "narrow stone corridor floor, dark red-brown", road: "wide stone steps, blood-stained, worn in the middle", wall: "tall stepped pyramid faces, black-red stone blocks", rock: "solid black stone and jungle ridge foliage in darkness" },
    bank: { floor: "dark", paved: "red", road: "red", wall: "dark", rock: "dark" },
    grade: { floor: { mul: [0.82, 0.55, 0.52], add: [6, -4, -4] }, paved: { mul: [0.7, 0.5, 0.48], add: [0, -4, -4] }, road: { mul: [0.9, 0.55, 0.5], add: [6, -4, -4] }, wall: { mul: [0.6, 0.4, 0.4], add: [0, -2, -2] }, rock: { mul: [0.5, 0.45, 0.5], add: [0, 0, 0] }, _: [1, 0.9, 0.9] },
    marks: [{ k: "blot", on: ["floor", "road"], n: 30, col: [90, 20, 20], a: 0.35, r: [10, 36] }, { k: "crack", on: ["floor"], n: 40, col: [20, 10, 10], a: 0.5, len: [20, 60] }],
    guide: [
      ["floor", R(560, 1250, 1280, 300)],
      ["wall", R(500, 1100, 1400, 150)], ["road", R(1100, 1100, 200, 160)],
      ["floor", R(500, 800, 1400, 300)],
      ["wall", R(600, 650, 1200, 150)], ["road", R(1100, 650, 200, 160)],
      ["floor", R(700, 380, 1000, 270)],
      ["wall", R(800, 250, 800, 130)], ["road", R(1120, 250, 160, 140)],
      ["floor", R(950, 100, 500, 150)],
      // the back door corridor and the cells
      ["paved", L([[2300, 900], [1900, 900]], 120)], ["floor", R(1880, 820, 80, 160)],
    ],
    entries: { start: { x: 1200, y: 1500, face: "up" }, from_orchardHills: { x: 1200, y: 1500, face: "up" }, from_backDoor: { x: 2250, y: 900, face: "left" } },
    exits: [{ rect: [1140, 1540, 120, 56], to: "orchardHills", entry: "from_sunmawPyramid", push: [0, 1], floor: "floor" }],
    triggers: [{ id: "s14Fight", rect: [1080, 230, 240, 100] }],
    chests: [{ id: "g13_bloodlettersAltar", x: 1350, y: 190, show: "ch8.s14" }],
    npcs: [
      { id: null, art: "npcAcolyte", x: 900, y: 1380, still: true }, { id: null, art: "npcAcolyte", x: 1500, y: 1380, still: true }, { id: null, art: "npcPriest", x: 1200, y: 560, still: true }, { id: null, art: "npcChainedBeast", x: 1200, y: 960, still: true },
      { id: null, art: "npcAcolyte", x: 800, y: 980, path: [[700, 1000], [1000, 1000]], speed: 14 }, { id: null, art: "npcAcolyte", x: 1600, y: 980, path: [[1450, 1000], [1700, 1000]], speed: 14 },
    ],
    props,
    scatter: [{ keys: [["bones", 2], ["bones2", 1], ["rubblePile", 1], ["debris", 1]], n: 28, on: ["floor"], seed: 321, scaleRange: [0.8, 1] }],
    lights,
    dark: { ambient: 0.5, radius: 280, color: 0x0a0204 },
    encounter: { zones: [{ rect: [1000, 80, 400, 280], table: null, rate: 0 }, { rect: [0, 0, 2400, 1600], table: "sunmaw", rate: 22 }] },
    amb: { birds: 0, butterflies: [], water: false, motes: 44, dust: 0xe0a080, tint: [0x4a1010, 0.16], warm: [0xff6030, 0.08], weather: ["embers"], vignette: 1 },
  });
})();
