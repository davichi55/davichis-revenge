// R4 Fort Ocelan (M2 spec 3.8): a stone fort on the imperial road: west gate -> courtyard (patrols) -> granary yard -> cell block (3 captives, optio carries the key) -> the centurion's tower (boss). Table `fort` 24 s.
// Entries: start, from_greenmawJungle (W gate), from_wall (hidden ladder, granary yard). Exits: greenmawJungle@from_fortOcelan (W), greenmawJungle@from_fortOcelanEast (E gate, show ch3.fort).
// Triggers centurionFight. Chests fortWallChest (show fort.ladder), fortStrongbox. NPCs captive1..3 (hide fort.freed1..3), optio. Puzzle: the tower yard gate is shut until flag fort.cells.
(function () {
  const { R, E, P, L } = World.shapes, K = World.kitM2, W = 2250, H = 1500;
  const def = {
    name: "Fort Ocelan", ground: "assets/regions/fortOcelan.jpg", w: W, h: H, music: "fort", rim: 50, base: "rock",
    look: "A large stone legion fort seen from above: grey flagstone parade courtyards with worn drill marks, thick crenellated stone walls with gates, a barracks yard, a granary yard with cart ruts and straw, a cell block yard with iron grates, a command tower yard, banners with a sun emblem. Dark, ordered, cold grey stone with red and gold accents; jungle outside the walls.",
    legend: { paved: "worn grey flagstone fort courtyard with drill marks, straw, cart ruts and puddles", road: "a packed dirt road to the fort gate", wall: "thick grey crenellated stone fort wall top", rock: "dense dark jungle outside the fort seen from above" },
    guide: [
      ["paved", R(170, 170, 1910, 1160)], ["road", R(0, 720, 190, 80)], ["road", R(2060, 720, 190, 80)],
      ["wall", R(130, 130, 1990, 40)], ["wall", R(130, 1330, 1990, 40)], ["wall", R(130, 130, 40, 590)], ["wall", R(130, 800, 40, 570)], ["wall", R(2080, 130, 40, 590)], ["wall", R(2080, 800, 40, 570)],
      ["wall", R(810, 170, 36, 530)], ["wall", R(810, 800, 36, 530)], ["wall", R(1350, 170, 36, 530)], ["wall", R(1350, 800, 36, 530)], ["wall", R(1800, 170, 36, 530)], ["wall", R(1800, 800, 36, 530)],
    ],
    entries: { start: { x: 270, y: 760, face: "right" }, from_greenmawJungle: { x: 270, y: 760, face: "right" }, from_wall: { x: 1100, y: 270, face: "down" } },
    exits: [
      { rect: [20, 715, 100, 90], to: "greenmawJungle", entry: "from_fortOcelan", push: [-1, 0] },
      { rect: [2130, 715, 100, 90], to: "greenmawJungle", entry: "from_fortOcelanEast", push: [1, 0], show: "ch3.fort" },
    ],
    checkFlags: { "fort.cells": true, "fort.ladder": true, "ch3.fort": true },
    blockers: [{ rect: [1800, 700, 36, 100], hide: "fort.cells" }, { rect: [2080, 720, 40, 80], hide: "ch3.fort" }],
    triggers: [{ id: "centurionFight", rect: [1900, 440, 130, 80] }],
    chests: [{ id: "fortWallChest", x: 1160, y: 250, show: "fort.ladder" }, { id: "fortStrongbox", x: 330, y: 1230 }],
    npcs: [
      { id: "optio", art: "npcOptio", name: "Optio", x: 1480, y: 690 },
      { id: "captive1", art: "npcCaptive", name: "Prisoner", x: 1470, y: 520, hide: "fort.freed1" }, { id: "captive2", art: "npcRunaway", name: "Prisoner", x: 1570, y: 520, hide: "fort.freed2" }, { id: "captive3", art: "npcRefugeeW", name: "Prisoner", x: 1670, y: 520, hide: "fort.freed3" },
      { id: null, art: "npcLegionGuard", x: 1060, y: 1100, path: [[1000, 1100], [1250, 1100]], speed: 20 }, { id: null, art: "npcLegionGuard", x: 520, y: 760, path: [[400, 760], [700, 760]], speed: 24 },
    ],
    props: [
      ["m2_fortWall", 330, 160], ["m2_fortWall", 530, 160], ["m2_fortWall", 730, 160], ["m2_fortWall", 930, 160], ["m2_fortWall", 1130, 160], ["m2_fortWall", 1330, 160], ["m2_fortWall", 1530, 160], ["m2_fortWall", 1730, 160], ["m2_fortWall", 1930, 160],
      ["m2_fortWall", 330, 1365], ["m2_fortWall", 530, 1365], ["m2_fortWall", 730, 1365], ["m2_fortWall", 930, 1365], ["m2_fortWall", 1130, 1365], ["m2_fortWall", 1330, 1365], ["m2_fortWall", 1530, 1365], ["m2_fortWall", 1730, 1365], ["m2_fortWall", 1930, 1365],
      ["m2_watchTower", 190, 200], ["m2_watchTower", 2040, 200], ["m2_watchTower", 190, 1330], ["m2_watchTower", 2040, 1330], ["m2_fortGate", 150, 740, { solid: false }], ["m2_legionStandard", 220, 700], ["m2_legionStandard", 220, 830],
      ["m2_stakeFence", 828, 270], ["m2_stakeFence", 828, 480], ["m2_stakeFence", 828, 1000], ["m2_stakeFence", 828, 1200], ["m2_stakeFence", 1368, 270], ["m2_stakeFence", 1368, 480], ["m2_stakeFence", 1368, 1000], ["m2_stakeFence", 1368, 1200], ["m2_stakeFence", 1818, 270], ["m2_stakeFence", 1818, 480], ["m2_stakeFence", 1818, 1000], ["m2_stakeFence", 1818, 1200],
      ["m2_legionStandard", 800, 690], ["m2_legionStandard", 800, 850], ["m2_legionStandard", 1340, 690], ["m2_legionStandard", 1340, 850], ["m2_legionStandard", 1790, 690], ["m2_legionStandard", 1790, 850],
      ["m2_barracks", 420, 400], ["m2_barracks", 640, 400], ["m2_barracks", 420, 1180], ["m2_barracks", 640, 1180], ["m2_trainingPost", 330, 620], ["m2_trainingPost", 440, 900], ["m2_trainingPost", 560, 640], ["m2_weaponRack", 700, 640], ["m2_weaponRack", 330, 960], ["m2_legionTent", 700, 960], ["m2_ballista", 700, 840],
      ["m2_granary", 1000, 420], ["m2_granary", 1190, 380], ["m2_supplyWagon", 980, 600], ["m2_supplyWagon", 1220, 1040], ["m2_cargoBales", 1100, 1140], ["m2_cargoBales", 940, 1190, { flip: true }], ["m2_campCrates", 1250, 600], ["m2_campCrates", 920, 1020], ["m2_hen", 1020, 700, { solid: false, show: "never.x" }],
      ["m2_cellBlock", 1580, 370], ["m2_cellDoor", 1470, 460], ["m2_cellDoor", 1570, 460], ["m2_cellDoor", 1670, 460], ["m2_cageWagon", 1560, 1050, { solid: [60, 20] }], ["m2_weaponRack", 1480, 1200], ["m2_obsidianBrazier", 1680, 1000], ["m2_obsidianBrazier", 1450, 880],
      ["m2_commandTower", 1960, 400], ["m2_legionStandard", 1900, 560], ["m2_legionStandard", 2030, 560], ["m2_obsidianBrazier", 1900, 880], ["m2_obsidianBrazier", 2020, 880], ["m2_tribuneTable", 2000, 1100], ["m2_legionTent", 1930, 1230],
      ["m2_fortWall", 2150, 110, { show: "never.x" }],
    ].filter(p => !(p[3] && p[3].show === "never.x")),
    lights: [[1680, 1000, 150, 0.7], [1450, 880, 150, 0.7], [1900, 880, 150, 0.7], [2020, 880, 150, 0.7], [1960, 460, 170, 0.6]],
    dark: { ambient: 0.45, radius: 230, fireRadius: 210 },
    encounter: { table: "fort", rate: 24 },
    amb: { birds: 0, water: false, dust: 0xb8b0a8, motes: 30, tint: [0x20202c, 0.2], warm: [0xff9a60, 0.05], butterflies: [],
      armies: [{ id: "drill", lane: [[400, 760], [600, 1000], [700, 540], [450, 560]], mode: "loop", speed: 30, rows: 2, cols: 3, sight: 220, table: "fort" }, { id: "granaryGuard", lane: [[900, 780], [1250, 780], [1250, 600]], mode: "pingpong", speed: 26, rows: 2, cols: 2, sight: 200, table: "fort" }] },
  };
  const trees = [["m2_jungleTreeA", 3], ["m2_jungleTreeB", 2], ["m2_stranglerFig", 1], ["m2_fanPalm", 1.5], ["m2_treeFern", 1]];
  def.props = def.props.concat(K.blockedFill(def, 90, trees, { seed: 611, skip: (x, y) => x > 120 && x < 2130 && y > 120 && y < 1380 }));
  World.def("fortOcelan", def);
})();
