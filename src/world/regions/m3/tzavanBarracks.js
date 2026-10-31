// M3 / ch6: the Arena Barracks under the Hall (dungeon, torch-lit). Table "barracks" 24 s. Entries start from_tzavan. Exit tzavan@from_tzavanBarracks (the cell stair, N).
// Set pieces: captiveTamer (cell nine, a prisoner tamer), triggers familyCell (cell twelve, quest family), meretCell (the cell with the folded blanket, quest ring2), barracksEnter (arrival). Chest barracksChest.
(function () {
  const { R, E, P, L } = World.shapes, M = World.m3, props = [];
  // the cell row along the north wall (cells 1-12): cage doors, cage props, cots, chains; cell nine, twelve and the blanket cell are the story ones
  props.push(...M.row(["m2_cellDoor", "emptyCage"], 480, 270, 1480, 270, 11, {}, 0, 3), ["m2_cellDoor", 1640, 270]);
  props.push(["m2_hCradle", 590, 200, { scale: 0.7 }], ["emptyCage", 800, 330], ["emptyCage", 1180, 330], ["m2_hStool", 1010, 330], ["m2_hStool", 1290, 340]);
  // the pit: sand floor, practice posts, weapon racks, sandbags, a bloodless drain
  props.push(["m2_trainingPost", 780, 620], ["m2_trainingPost", 1020, 660], ["weaponRack", 640, 760], ["weaponRack", 1160, 540], ["sandbagWall", 900, 840], ["sandbagWall", 1100, 860], ["m2_whipPost", 900, 430], ["spikeBarricade", 520, 560], ["spikeBarricade", 1300, 760], ["m2_stakeFence", 1400, 600]);
  // torches in iron cups and low brick arches
  props.push(["torchPole", 250, 380, { fire: [0, -62, 0.9] }], ["torchPole", 700, 380, { fire: [0, -62, 0.9] }], ["torchPole", 1220, 380, { fire: [0, -62, 0.9] }], ["torchPole", 1600, 400, { fire: [0, -62, 0.9] }], ["torchPole", 250, 900, { fire: [0, -62, 0.9] }], ["torchPole", 1600, 900, { fire: [0, -62, 0.9] }], ["torchPole", 900, 1000, { fire: [0, -62, 0.9] }],
    ["m4_brickArch", 550, 460], ["m4_brickArch", 1250, 460], ["m4_brickArch", 400, 1020], ["m4_brickArch", 1400, 1020], ["m4_sewerPillar", 220, 560], ["m4_sewerPillar", 1620, 560], ["m4_sewerPillar", 220, 780], ["m4_sewerPillar", 1620, 780]);
  // south: the guard room (table, crates, barrels, the chest), the way down to nowhere
  props.push(["tent", 1500, 1100, { tint: 0xc08070 }], ["campCrates", 1380, 1130], ["campCrates", 1620, 1180], ["m2_waterBarrel", 1700, 1130], ["m2_tribuneTable", 1240, 1120], ["m2_cargoBales", 1480, 1230], ["bones", 400, 1130], ["m2_caveBones", 300, 1060], ["rubblePile", 220, 1180], ["m4_drainGrate", 900, 1150, { solid: false }], ["m4_rotRaft", 1000, 1210], ["m4_brickRubble", 560, 1190]);
  World.def("tzavanBarracks", {
    name: "The Arena Barracks", w: 1800, h: 1300, base: "rock", music: "arenaCity", rim: 44,
    look: "The gladiator barracks under a colosseum seen from above: a low-ceilinged stone hall of dark warm brick and flagstone, a row of iron-barred cells along the north wall, a pit of pale sand in the middle with a narrow drain of dark water running down the centre of the floor, scattered straw, bone-dust and rust stains, torchlight pools on the stone. Grim, dusty, orange torchlight.",
    legend: { floor: "dark warm stone and brick floor, worn and stained, with straw and rust marks", sand: "pale arena sand, raked and scuffed with boot prints and dark stains", shallow: "a shallow stone drain of dark murky water running through the floor", paved: "worn grey flagstones of the guard room with dice marks and wax", rock: "dark brick and stone walls and pillars, impassable", red: "dark rust-red stained stone under the cells" },
    bank: { floor: "grey", sand: "sand", shallow: "teal", paved: "grey", red: "red" }, grade: { floor: { mul: [0.62, 0.52, 0.46], add: [4, 0, -2] }, sand: { mul: [0.9, 0.85, 0.78], add: [-4, -4, -4] }, shallow: { mul: [0.6, 0.85, 0.75], add: [4, 10, 8] }, paved: { mul: [0.7, 0.62, 0.56], add: [0, 0, 0] }, red: { mul: [0.6, 0.45, 0.4], add: [0, 0, 0] }, _: [1.0, 0.95, 0.92] },
    marks: [{ k: "blot", on: ["floor", "sand"], n: 14, col: [90, 30, 24], a: 0.2, r: [8, 24] }, { k: "dot", on: ["floor"], n: 90, col: [200, 160, 80], a: 0.6, r: [1, 2], hi: false }],
    guide: [
      ["floor", R(150, 300, 1500, 740)], ["red", R(150, 190, 1500, 120)], ["floor", R(260, 40, 120, 160)], ["sand", E(900, 640, 340, 190)], ["shallow", L([[900, 440], [900, 1000], [900, 1260]], 40)], ["shallow", L([[150, 1100], [900, 1100]], 40)],
      ["paved", R(1180, 1040, 470, 220)], ["floor", R(150, 1040, 1030, 220)],
    ],
    entries: { start: { x: 310, y: 170, face: "down" }, from_tzavan: { x: 310, y: 170, face: "down" } },
    exits: [{ rect: [250, 0, 140, 70], to: "tzavan", entry: "from_tzavanBarracks", push: [0, 1] }],
    triggers: [{ id: "barracksEnter", rect: [240, 120, 160, 120] }, { id: "familyCell", rect: [1590, 230, 100, 80] }, { id: "meretCell", rect: [590, 230, 100, 80] }],
    chests: [{ id: "barracksChest", x: 1560, y: 1100 }],
    npcs: [
      { id: "captiveTamer", art: "npcCaptive", name: "Prisoner in cell nine", x: 1280, y: 312, hint: "E / Space: speak to the prisoner" },
      { id: null, art: "npcLegionGuard", x: 1500, y: 1060, still: true }, { id: null, art: "npcLegionGuard", x: 700, y: 980, path: [[400, 980], [1100, 980]], speed: 24 }, { id: null, art: "npcLegionGuard", x: 340, y: 360, still: true, flip: true },
    ],
    props,
    scatter: [{ keys: [["m2_hayStack", 1], ["bones", 1], ["rubblePile", 1], ["m4_brickRubble", 1]], n: 20, on: ["floor"], seed: 221, scaleRange: [0.7, 1] }],
    lights: [[250, 380, 150, 0.8], [700, 380, 150, 0.8], [1220, 380, 150, 0.8], [1600, 400, 150, 0.8], [250, 900, 150, 0.8], [1600, 900, 150, 0.8], [900, 1000, 150, 0.8]],
    dark: { ambient: 0.5, radius: 240, color: 0x0c0402 },
    encounter: { table: "barracks", rate: 24 },
    amb: { birds: 0, butterflies: [], motes: 50, dust: 0xd0a070, tint: [0x4a2010, 0.12], warm: [0xff8030, 0.1], drips: [[900, 700], [900, 1100]] },
  });
})();
