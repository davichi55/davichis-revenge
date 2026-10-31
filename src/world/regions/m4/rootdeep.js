// M4 ch9: Rootdeep (dungeon, table "rootdeep" 22 s). Entries start from_rootdeepApproach. Exit rootdeepApproach@from_rootdeep (NE, top of the descent).
// A spiral descent through chewed galleries: a chewed-root barrier (hides on ch9.s18) stands across the road after the collar altar. Triggers sentinelS18 (collar altar, W gallery), gnawerFight (the den, show ch9.s18). Gather gnawerTablet (builder tablet at the den's mouth, show ch9.s18). Chest rootdeepChest (south alcove).
(function () {
  const { R, E, P, L } = World.shapes, M = World.m3, props = [], lights = [];
  const fungus = (x, y) => { props.push(["m4_glowFungus", x, y]); lights.push([x, y - 20, 110, 0.5]); };
  // top gallery (arrival): tower roots on the back wall, teeth marks
  props.push(["m4_giantRoot", 700, 250, { solid: false }], ["m4_rootWall", 1200, 240, { solid: false }], ["m4_giantRoot", 1700, 250, { solid: false }], ["m4_rootWall", 2150, 240, { solid: false }], ["m4_chewedTrunk", 1000, 370], ["m4_chewedTrunk", 1900, 380]); fungus(1400, 360); fungus(800, 380);
  // west gallery: the collar altar (the Rootdeep sentinel), bones, spikes
  props.push(["m4_collarAltarRoot", 400, 900, { glow: "blue" }], ["m4_boneHeapRoot", 300, 760], ["m4_rootSpikes", 300, 1100], ["m4_rootSpikes", 500, 600], ["m4_giantRoot", 180, 700, { solid: false }], ["m4_rootWall", 150, 1200, { solid: false }]); fungus(300, 960); fungus(520, 800);
  // bottom gallery: chewed trunks, the spur with the chest, fungus
  props.push(["m4_chewedTrunk", 900, 1360], ["m4_chewedTrunk", 1700, 1380], ["m4_rootSpikes", 700, 1540], ["m4_rootSpikes", 1900, 1540], ["m4_giantRoot", 1000, 1640, { solid: false }], ["m4_rootWall", 1600, 1640, { solid: false }], ["m4_boneHeapRoot", 1300, 1580]); fungus(1100, 1580); fungus(1500, 1380); fungus(600, 1380);
  // the east gallery: the chewed-root barrier across the road, spikes, a fallen trunk
  props.push(["m4_gnawedRoot", 2200, 1040, { hide: "ch9.s18", solid: [100, 34] }], ["m4_rootSpikes", 2380, 900], ["m4_rootSpikes", 2020, 1200], ["m4_chewedTrunk", 2060, 800], ["m4_giantRoot", 2480, 1100, { solid: false }]); fungus(2300, 820); fungus(2100, 1300);
  // the inner gallery and the den: the hollow root of bark and bone, the tablet at its mouth
  props.push(["m4_denMouth", 1250, 860, { solid: [120, 30] }], ["m4_builderTablet", 1020, 830], ["m4_boneHeapRoot", 1480, 1060], ["m4_boneHeapRoot", 1060, 1100], ["m4_rootSpikes", 1380, 1130], ["m4_chewedTrunk", 1560, 980]); fungus(1150, 780); fungus(1350, 1120); lights.push([1250, 900, 260, 0.45]);
  World.def("rootdeep", {
    name: "Rootdeep", w: 2600, h: 1700, base: "rock", music: "roots", rim: 44,
    look: "The descent into the roots of the world seen from above: a spiral of wide galleries between towering walls of black roots, dark cold floor of packed earth, bone-dust and woodchips, huge tooth marks as long as a man on every root and trunk, clusters of glowing blue fungus, a collar altar grown into the roots on the west side, a spur with a heap of bones, and at the bottom a round den: a hollow root of bark and bone with a black mouth. Cold black air, silence.",
    legend: { floor: "packed dark earth with wood chips, bone dust and tooth gouges", paved: "chewed root-wood floor of the galleries, splintered, damp", road: "worn earth path", rock: "towering walls of black roots and earth, deep tooth marks", ash: "dark soil with pale bone fragments" },
    bank: { floor: "dark", paved: "dark", road: "dirt", rock: "dark", ash: "dark" },
    grade: { floor: { mul: [0.5, 0.52, 0.55], add: [-2, 0, 4] }, paved: { mul: [0.55, 0.52, 0.5], add: [-2, -2, 0] }, road: { mul: [0.55, 0.5, 0.45], add: [0, 0, 0] }, rock: { mul: [0.38, 0.4, 0.46], add: [0, 0, 4] }, ash: { mul: [0.6, 0.6, 0.62], add: [0, 0, 4] }, _: [0.92, 0.97, 1.02] },
    marks: [{ k: "dot", on: ["floor", "paved"], n: 60, col: [120, 190, 255], a: 0.6, r: [1, 2], hi: false }, { k: "crack", on: ["paved"], n: 40, col: [20, 14, 10], a: 0.5, len: [20, 60] }],
    guide: [
      ["paved", L([[2400, 300], [400, 300], [400, 1450], [2200, 1450], [2200, 650], [1000, 650], [1000, 1000]], 170)],
      ["floor", R(900, 880, 700, 320)], ["paved", L([[1300, 1450], [1300, 1600]], 120)], ["floor", R(1200, 1520, 200, 130)],
    ],
    entries: { start: { x: 2300, y: 330, face: "left" }, from_rootdeepApproach: { x: 2300, y: 330, face: "left" } },
    exits: [{ rect: [2430, 250, 120, 100], to: "rootdeepApproach", entry: "from_rootdeep", push: [-1, 0], floor: "paved" }],
    triggers: [{ id: "sentinelS18", rect: [330, 840, 220, 170], hide: "ch9.s18" }, { id: "gnawerFight", rect: [1100, 960, 300, 130], show: "ch9.s18" }],
    gather: [{ id: "gnawerTablet", x: 1050, y: 870, label: "A builder tablet", color: "gold", show: "ch9.s18" }],
    chests: [{ id: "rootdeepChest", x: 1300, y: 1600 }],
    npcs: [],
    props,
    scatter: [{ keys: [["m4_glowFungus", 1], ["m4_rootClump", 2], ["bones2", 1], ["m4_boneHeapRoot", 1]], n: 22, on: ["paved", "floor"], seed: 391, scaleRange: [0.7, 0.95] }],
    lights,
    dark: { ambient: 0.55, radius: 260, color: 0x02040a },
    encounter: { table: "rootdeep", rate: 22 },
    amb: { birds: 0, butterflies: [], water: false, motes: 56, dust: 0x80b8e8, tint: [0x081830, 0.16], weather: ["spores"], vignette: 1 },
  });
})();
