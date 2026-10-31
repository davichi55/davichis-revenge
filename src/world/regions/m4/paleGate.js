// M4 ch8: Pale Gate (resistance forward post, town: no fights). Inn: the Gate Bunk (entry `inn`). Music rebelCamp.
// Entries start from_sea from_tzavanCoast inn. Exits weepingSea@from_paleGate (small pier, E), tzavanCoast@from_paleGate (N gate road).
// NPC ids: innkeeper merchant imela (war table) kessa dorrin mayle (show ch8.guest) scout quartermaster r1 r2 r3. Triggers paleArrive (beach by the pier) emberwickJoins (war table) paleReturn (inside the north gate) opsBoard (war table).
(function () {
  const { R, E, P, L } = World.shapes, M = World.m3, props = [];
  // the north wall of the compound: limewashed wall segments, towers, the gate with its lantern, the inn and the stores stand against it
  for (const x of [190, 360, 530, 930, 1100, 1160]) props.push(["m4_paleWall", x, 264]);
  props.push(["m4_paleTower", 80, 270, { solid: false }], ["m4_paleTower", 590, 270], ["m4_paleTower", 850, 270], ["m4_paleGateArch", 720, 270, { solid: false }], ["m4_rebelBanner", 640, 300], ["m4_rebelBanner", 800, 300]);
  props.push(["m4_gateBunk", 300, 560], ["m4_supplyStack", 1010, 330], ["m4_supplyStack", 1120, 336], ["m4_rebelBanner", 960, 330]);
  // plaza: the war table under its awning, banners, lanterns
  props.push(["m4_warTable", 640, 640], ["m4_rebelBanner", 500, 560], ["m4_rebelBanner", 780, 560], ["lampPost", 460, 720], ["lampPost", 840, 720]);
  // tents of the young fighters on the east half, a cook fire and drying lines
  props.push(["m4_fighterTent", 960, 560], ["m4_fighterTent", 1110, 600], ["m4_fighterTent", 1000, 780], ["m4_fighterTent", 1150, 830], ["m4_fighterTent", 860, 900], ["campfire", 1060, 700], ["m4_dryingRack", 700, 940], ["m4_dryingRack", 580, 930], ["crateStack", 420, 920], ["crates", 340, 880], ["m4_waterJars", 520, 880], ["m4_pickerBaskets", 250, 880]);
  // the beach and the pier
  props.push(["m4_beachPier", 1380, 680, { solid: false, dy: -10 }], ["m4_driftwood", 1300, 540], ["m4_driftwood", 1280, 840], ["rowboatMoored", 1340, 730], ["bollards", 1290, 600], ["pierLamp", 1360, 590], ["m4_beachPalm", 1250, 480], ["m4_beachPalm", 1270, 900], ["netRack", 1180, 960]);
  World.def("paleGate", {
    name: "Pale Gate", w: 1600, h: 1100, base: "rock", music: "rebelCamp", rim: 44,
    look: "A coastal fort town at the end of a road seen from above: pale limewashed walls along the north with a gate and a lantern, a walled compound of packed sand and trampled grass inside with a broad plaza and a long war table under a canvas awning, green-brown canvas tents and cook fires, an inn built against the wall, a narrow pale beach on the east with a small wooden pier into dark blue-green water. Plain, hopeful, young.",
    legend: { sand: "packed sand and trampled dry grass with boot prints, straw and ash of cook fires", paved: "pale limestone flags of the plaza and the gate", wall: "thick limewashed pale wall tops", road: "a dusty road with cart ruts leading north out of the gate", rock: "solid pale cliff and wall foundations", shallow: "pale beach and shallow turquoise water", water: "deep blue-green sea", floor: "grey weathered pier planks" },
    bank: { sand: "sand", paved: "lime", wall: "lime", road: "dirt", rock: "dark", shallow: "teal", water: "water", floor: "dark" },
    grade: { sand: { mul: [1.0, 0.96, 0.86], add: [4, 2, -2] }, paved: { mul: [1.08, 1.04, 0.96], add: [8, 6, 2] }, wall: { mul: [1.1, 1.08, 1.0], add: [16, 14, 8] }, _: [1, 0.98, 0.95] },
    marks: [{ k: "blot", on: ["sand"], n: 12, col: [60, 40, 24], a: 0.2, r: [10, 28] }, { k: "dot", on: ["sand"], n: 50, col: [255, 160, 70], a: 0.5, r: [1, 1.6], hi: false }],
    guide: [
      ["wall", R(80, 140, 1180, 124)], ["road", R(640, 40, 160, 240)], ["paved", R(620, 260, 200, 90)],
      ["sand", R(80, 264, 1180, 780)], ["paved", E(640, 660, 310, 170)],
      ["sand", R(1240, 400, 200, 480)], ["shallow", R(1360, 380, 80, 520)], ["water", R(1420, 44, 136, 1012)],
      ["floor", L([[1290, 640], [1520, 640]], 64)],
    ],
    entries: { start: { x: 1330, y: 640, face: "left" }, from_sea: { x: 1330, y: 640, face: "left" }, from_tzavanCoast: { x: 720, y: 360, face: "down" }, inn: { x: 300, y: 600, face: "down" } },
    exits: [
      { rect: [1490, 610, 60, 60], to: "weepingSea", entry: "from_paleGate", push: [1, 0], floor: "floor" },
      { rect: [650, 50, 140, 50], to: "tzavanCoast", entry: "from_paleGate", push: [0, -1], floor: "road" },
    ],
    triggers: [
      { id: "paleArrive", rect: [1230, 580, 150, 120] }, { id: "emberwickJoins", rect: [500, 700, 280, 120] }, { id: "paleReturn", rect: [640, 340, 160, 50], once: false },
      { id: "opsBoard", rect: [520, 600, 240, 90], press: true },
    ],
    npcs: [
      { id: "innkeeper", art: "npcRebelCook", name: "Innkeeper", x: 360, y: 600, hint: "E / Space: the Gate Bunk" },
      { id: "merchant", art: "merchant", name: "Merchant", x: 1060, y: 380 },
      { id: "imela", art: "npcImela", name: "Imela", x: 650, y: 700 },
      { id: "kessa", art: "npcKessa", name: "Kessa Vorn", x: 900, y: 700, show: "ch8.guest" }, { id: "dorrin", art: "npcDorrin", name: "Dorrin Hale", x: 960, y: 770, show: "ch8.guest" }, { id: "mayle", art: "npcMayle", name: "Mayle Tarn", x: 860, y: 770, show: "ch8.guest" },
      { id: "scout", art: "npcScout", name: "Ranna's scout", x: 770, y: 400 },
      { id: "quartermaster", art: "npcQuartermaster", name: "Quartermaster", x: 1220, y: 380, hint: "E / Space: the bounty board" },
      { id: "r1", art: "npcFighter", name: "Young fighter", x: 480, y: 800 }, { id: "r2", art: "npcSentry", name: "Sentry", x: 680, y: 330 }, { id: "r3", art: "npcRebelCook", name: "Cook", x: 1010, y: 690 },
      { id: null, art: "npcFighter", x: 700, y: 520, path: [[420, 480], [900, 480], [900, 880], [420, 880]], loop: true, speed: 22 },
      { id: null, art: "npcRebelMedic", x: 1100, y: 900, path: [[1000, 900], [1200, 900]], speed: 18 },
    ],
    props,
    scatter: [{ keys: [["crates", 1], ["m4_waterJars", 1], ["hayBales", 1], ["debris", 1]], n: 12, on: ["sand"], seed: 251, scaleRange: [0.85, 1] }],
    amb: { birds: 3, butterflies: [], water: true, dust: 0xe8d8b0, motes: 36, tint: [0x30283a, 0.08], warm: [0xffc080, 0.05], smoke: [[1060, 700], [700, 940]], vignette: 1 },
  });
})();
