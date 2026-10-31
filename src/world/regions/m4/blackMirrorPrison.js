// M4 ch9: Black Mirror Prison (dungeon, table "prison" 22 s, wind and green lamplight). Entries start from_rootdeepApproach from_prisonCellNine. Exits rootdeepApproach@from_blackMirrorPrison (cliff road, SW), prisonCellNine@from_blackMirrorPrison (the glass door, NE, need ch9.s17).
// Trigger wardenS16 (before the courtyard gate; the portcullis is shut until ch9.s16), forgeS17 (collar-forge hall, show ch9.s16), prisonEnter (arrival). Interact cell1..8 (cell doors along the north block and the west wing). Chest prisonStore (store room W, show ch9.s16).
(function () {
  const { R, E, P, L } = World.shapes, M = World.m3, props = [], lights = [], glow = 0xa8ffc8;
  const lamp = (x, y) => { props.push(["m4_prisonLamp", x, y, { fire: [0, -84, 0.7], glow: "blue" }]); lights.push([x, y - 70, 150, 0.5]); };
  // the cliff road: glass spikes on the edges, lamps, a crow perch, glass walls at the gate
  props.push(["m4_glassSpikes", 400, 1380], ["m4_glassSpikes", 700, 1600], ["m4_glassSpikes", 1020, 1560], ["m4_glassSpikes", 1300, 1250], ["m4_glassSpikes", 840, 1360], ["m4_crowPerch", 560, 1400], ["m4_crowPerch", 1240, 1230], ["m4_cliffSign", 300, 1440], ["m4_gibbet", 1000, 1230]); lamp(520, 1410); lamp(900, 1410); lamp(1160, 1260);
  // the gate: two black towers, the closed portcullis (until the Warden falls), the raised gate after
  props.push(["m4_glassTower", 880, 1040, { solid: [36, 18] }], ["m4_glassTower", 1320, 1040, { solid: [36, 18] }], ["m4_wardenGate", 1100, 1050, { hide: "ch9.s16", solid: [100, 22] }], ["m4_openGlassDoor", 1100, 1050, { show: "ch9.s16", solid: false, scale: 1.4 }], ["m4_glassWall", 760, 1050], ["m4_glassWall", 1440, 1050]); lamp(1020, 1090); lamp(1180, 1090);
  // courtyard: black glass pillars, benches, the Warden's desk, lamps; the north cell block stands on the north wall
  props.push(["m4_glassPillarBlack", 950, 700], ["m4_glassPillarBlack", 1250, 700], ["m4_glassPillarBlack", 1550, 700], ["m4_glassBench", 1100, 880], ["m4_glassBench", 1400, 880], ["m4_wardenDesk", 1100, 760], ["m4_chainPile", 1500, 940, { solid: false }]); lamp(1000, 620); lamp(1500, 620);
  for (const x of [930, 1080, 1230, 1380, 1530, 1680]) props.push(["m4_cellBlock", x, 560]);
  // west wing: store room and cells 7-8 (glass doors in the wall)
  props.push(["m4_cellDoorGlass", 640, 700], ["m4_cellDoorGlass", 760, 700], ["m4_glassBench", 560, 940], ["crateStack", 540, 860], ["crates", 650, 880], ["m4_chainPile", 700, 960, { solid: false }], ["m4_prisonLamp", 800, 800, { fire: [0, -84, 0.7] }]); lights.push([800, 740, 130, 0.45]);
  // the collar forge (east hall): anvil, rack of collars, glass walls
  props.push(["m4_forgeAnvil", 2000, 800, { solid: [40, 14] }], ["m4_collarHooks", 1900, 640], ["m4_collarHooks", 2100, 640], ["m4_collarHooks", 2260, 640], ["m4_chainPile", 1900, 900, { solid: false }], ["m4_wardenDesk", 2220, 880], ["m4_glassWall", 2120, 980], ["m4_glassPillarBlack", 1860, 780]); lamp(1900, 740); lamp(2200, 760);
  // the glass stair and corridor to cell nine, the glass door
  props.push(["m4_glassStairs", 1860, 470, { solid: false }], ["m4_glassPillarBlack", 1780, 330], ["m4_cellDoorGlass", 1900, 190], ["m4_prisonLamp", 1990, 330, { fire: [0, -84, 0.7] }]); lights.push([1990, 260, 150, 0.5]);
  World.def("blackMirrorPrison", {
    name: "Black Mirror Prison", w: 2600, h: 1700, base: "rock", music: "prison", rim: 44,
    look: "A fortress prison of polished black volcanic glass on a high cliff seen from above: a long narrow road along the cliff edge with glass spikes and drops into green mist, a huge black glass gate flanked by towers, a courtyard of mirror-black floor reflecting a green sky, a long north wall of glass cell blocks, a west wing with a store room, an east hall with a collar forge and racks of iron collars, a narrow glass corridor going north-east to a single glass door. Cold, cruel, green lantern light, wind.",
    legend: { floor: "polished black volcanic glass floor reflecting green light, fine cracks, iron drains", paved: "black basalt flagstones of the cliff road with green moss in the cracks", glass: "dark green-black glass corridor floor", rock: "sheer cliff, black glass walls and the drop into green mist", wall: "black glass wall tops with iron studs", road: "narrow cliff road of dark stone" },
    bank: { floor: "dark", paved: "grey", glass: "dark", rock: "dark", road: "grey", wall: "dark" },
    grade: { floor: { mul: [0.34, 0.52, 0.44], add: [-4, 4, 2] }, paved: { mul: [0.5, 0.58, 0.52], add: [-4, 0, -2] }, glass: { mul: [0.34, 0.55, 0.46], add: [-2, 6, 2] }, road: { mul: [0.5, 0.58, 0.52], add: [-4, 0, -2] }, rock: { mul: [0.34, 0.44, 0.4], add: [0, 2, 0] }, _: [0.92, 1, 0.97] },
    marks: [{ k: "crack", on: ["floor", "glass"], n: 40, col: [140, 255, 200], a: 0.5, len: [20, 70] }, { k: "dot", on: ["floor", "glass"], n: 70, col: [190, 255, 230], a: 0.6, r: [1, 2], hi: false }],
    guide: [
      // the cliff road
      ["road", L([[100, 1500], [900, 1500], [1100, 1350], [1100, 1100]], 120)], ["paved", R(1000, 1100, 200, 90)],
      // courtyard, west wing (store, cells), east forge hall, north-east corridor to cell nine
      ["floor", R(850, 560, 900, 450)], ["floor", R(1040, 1000, 120, 100)],
      ["paved", L([[850, 800], [780, 800]], 110)], ["floor", R(480, 640, 310, 360)],
      ["paved", L([[1750, 780], [1820, 780]], 110)], ["floor", R(1800, 580, 520, 420)],
      ["glass", L([[1700, 560], [1900, 360], [1900, 180]], 100)],
    ],
    entries: { start: { x: 200, y: 1500, face: "right" }, from_rootdeepApproach: { x: 200, y: 1500, face: "right" }, from_prisonCellNine: { x: 1900, y: 260, face: "down" } },
    exits: [
      { rect: [52, 1450, 56, 100], to: "rootdeepApproach", entry: "from_blackMirrorPrison", push: [1, 0], floor: "road" },
      { rect: [1850, 130, 100, 56], to: "prisonCellNine", entry: "from_blackMirrorPrison", push: [0, 1], need: "ch9.s17", blocked: "cellNineDoorShut", floor: "glass" },
    ],
    triggers: [{ id: "prisonEnter", rect: [120, 1440, 200, 120] }, { id: "wardenS16", rect: [1000, 1110, 200, 90] }, { id: "forgeS17", rect: [1920, 760, 180, 120], show: ["ch9.s16", "!ch9.s17"] }],
    chests: [{ id: "prisonStore", x: 540, y: 940, show: "ch9.s16" }],
    npcs: [
      { id: "cell1", art: "npcPrisonerA", name: "Prisoner", x: 930, y: 590, hint: "E / Space: cell 1" }, { id: "cell2", art: "npcSlave", name: "Prisoner", x: 1080, y: 590, hint: "E / Space: cell 2" }, { id: "cell3", art: "npcPrisonerB", name: "Prisoner", x: 1230, y: 590, hint: "E / Space: cell 3" },
      { id: "cell4", art: "npcSlave", name: "Prisoner", x: 1380, y: 590, hint: "E / Space: cell 4" }, { id: "cell5", art: "npcPrisonerC", name: "Prisoner", x: 1530, y: 590, hint: "E / Space: cell 5" }, { id: "cell6", art: "npcMiner", name: "Prisoner", x: 1680, y: 590, hint: "E / Space: cell 6" },
      { id: "cell7", art: "npcSlave", name: "Prisoner", x: 640, y: 740, hint: "E / Space: cell 7" }, { id: "cell8", art: "npcPrisonerB", name: "Prisoner", x: 760, y: 740, hint: "E / Space: cell 8" },
      { id: null, art: "npcWarden", x: 1180, y: 760, still: true }, { id: null, art: "npcCollarsmith", x: 2060, y: 850, still: true }, { id: null, art: "npcLegionGuard", x: 1010, y: 1000, still: true }, { id: null, art: "npcLegionGuard", x: 1190, y: 1000, still: true },
    ],
    props,
    scatter: [{ keys: [["m4_glassSpikes", 1], ["m4_chainPile", 1], ["bones2", 1], ["debris", 1]], n: 14, on: ["floor", "road"], seed: 371, scaleRange: [0.7, 0.95] }],
    lights,
    dark: { ambient: 0.42, radius: 300, color: 0x020806 },
    encounter: { zones: [{ rect: [0, 1380, 340, 200], table: null, rate: 0 }, { rect: [0, 0, 2600, 1700], table: "prison", rate: 22 }] },
    amb: {
      birds: 0, butterflies: [], water: false, motes: 50, dust: 0xa0ffd0, tint: [0x0c2a20, 0.16], warm: [0x90ffc0, 0.03], weather: ["mist"], vignette: 1, sparkle: { terrain: ["floor", "glass"], color: 0xb8ffe0, rate: 3 },
      armies: [
        { id: "cliffGuards", lane: [[300, 1500], [900, 1500], [1100, 1350]], mode: "pingpong", speed: 26, rows: 2, cols: 3, sight: 200, table: "prison", cry: "Halt! No visitors at the Black Mirror!" },
        { id: "courtGuards", lane: [[920, 840], [1650, 840], [1650, 640], [920, 640]], mode: "loop", speed: 24, rows: 2, cols: 3, sight: 200, table: "prison", show: "ch9.s16" },
      ],
    },
  });
})();
