// M5 3.7 Thunder Spine (field/dungeon, 3000x2000): a storm-wrapped peak range. The pilgrim road climbs from the lower slopes (west: from the Sanctum, east: from the Warfront) through wind-bent pines to a
// chain stair; mid-ascent a landing with a collar altar (trigger spineS21, the general); above it the stair winds up into the cloud to the summit plateau (trigger ramFight, show ch10.s21; the Storm Ram's
// horns, tablet gather thunderTablet). A side ledge holds the chest (spineChest). Weather storm (lightning), lightning rods glow blue. Table "thunder" 24 s.
// Entries start, from_veilSanctum, from_saltmereWarfront. Exits veilSanctum@from_thunderSpine (W), saltmereWarfront@from_thunderSpine (E).
(function () {
  const { R, E, P, L } = World.shapes, M = World.M5, fx = { solid: false };
  const ROAD = [[60, 1700], [500, 1700], [900, 1620], [1200, 1700], [1500, 1520]], EAST = [[2940, 1560], [2500, 1580], [2100, 1660], [1700, 1700], [1500, 1520]], UP = [[1500, 1520], [1330, 1280], [1500, 1100]];
  const STAIR = [[1500, 1100], [1720, 900], [1520, 700], [1880, 600], [1700, 470], [2020, 420], [2360, 380]], LEDGE = [[900, 1620], [720, 1320], [700, 1060]];
  const props = M.flat(
    // lower slopes: pines, dead pines, crags and boulders
    M.rect(["spinePine", "spinePine", "spineDeadPine", "spineCrag", "spineBoulder"], 120, 1380, 2900, 1960, 38, { seed: 1, flipR: true, avoid: [[600, 1700, 150], [1000, 1640, 150], [1300, 1700, 150], [2100, 1640, 150], [2600, 1580, 150], [1500, 1450, 200]] }),
    M.rect(["spinePine", "spineCrag", "spineBoulder", "spineScrub", "spineDeadPine"], 150, 200, 1250, 1300, 26, { seed: 2, flipR: true, avoid: [[720, 1320, 160], [700, 1060, 220], [1330, 1280, 160]] }),
    M.rect(["spineCrag", "spineBoulder", "spineDeadPine", "spineScrub"], 2100, 700, 2900, 1400, 20, { seed: 3, flipR: true, avoid: [[2500, 1580, 160]] }),
    // road furniture: cairns, prayer flags, lanterns, rods that catch the lightning
    M.line("spineCairn", ROAD.concat(EAST.slice().reverse()), 330, { seed: 4, jit: 20, dy: -66, opts: { solid: false } }), M.line("spineFlags", [[300, 1630], [1100, 1620], [1700, 1640], [2300, 1600]], 360, { seed: 5, opts: { solid: false } }),
    M.line("spineRod", [[400, 1620], [1000, 1560], [1700, 1620], [2400, 1500], [2800, 1500]], 380, { seed: 6, opts: {} }), M.line("spineLantern", [[260, 1790], [900, 1710], [1500, 1760], [2100, 1740], [2700, 1650]], 340, { seed: 7, opts: { solid: false } }),
    // the chain stair: posts every few steps, slabs, scorch marks where lightning hit
    M.line("spineChainPost", STAIR.slice(0, 5), 120, { seed: 8, dx: -64, dy: -4 }), M.line("spineChainPost", STAIR.slice(0, 5), 120, { seed: 9, dx: 64, dy: -4, start: 50 }), M.line("spineChainPost", STAIR.slice(4), 120, { seed: 10, dx: -64, dy: -4 }),
    M.line("spineSlab", UP.concat(STAIR.slice(0, 3)), 190, { seed: 11, opts: { solid: false }, jit: 20 }), M.rect(["spineScorch", "spineFulgurite"], 1200, 500, 2300, 1400, 10, { seed: 12, flipR: true, avoid: [[1500, 1100, 200], [1720, 900, 100], [1520, 700, 100], [1880, 600, 100]], opts: { solid: false } }),
    // the landing: collar altar ringed by lanterns and rods
    [["spineCollarAltar", 1500, 1090], ["spineLantern", 1400, 1040, fx], ["spineLantern", 1600, 1040, fx], ["spineRod", 1380, 1190], ["spineRod", 1620, 1190], ["spineCairn", 1330, 1100, fx]],
    // the summit: Ram horns, tablet, arcs of lightning, rods in a ring
    [["spineRamHorns", 2540, 250, { solid: [60, 20] }], ["spineTablet", 2300, 330], ["spineArc", 2400, 520, fx], ["spineArc", 2700, 440, fx], ["spineRod", 2240, 460], ["spineRod", 2700, 340], ["spineRod", 2500, 540], ["spineFulgurite", 2650, 480], ["spineFulgurite", 2330, 250], ["spineLantern", 2380, 460, fx]],
    // the chest ledge
    [["spineCrag", 640, 940], ["spineCrag", 790, 960], ["spineLantern", 700, 1130, fx], ["spineRod", 780, 1020]]
  );
  World.def("thunderSpine", {
    name: "Thunder Spine", w: 3000, h: 2000, music: "stormPeak", rim: 40, base: "rock", ground: "assets/regions/thunderSpine.jpg",
    look: "A storm-wrapped mountain range seen from above: bare dark grey rock, wind-bent pines on the lower slopes, a pale pilgrim road switchbacking up, a chain stair of stone slabs climbing into thick cloud, lightning scorch marks, a flat summit plateau half hidden in cloud, deep cold blue-grey light.",
    legend: { ash: "bare dark-grey storm-scoured rock with lichen", road: "pale worn pilgrim path of gravel", floor: "stone slab stairs with iron chain posts", paved: "flat summit slabs scorched by lightning", grass: "short wind-flattened mountain grass", rock: "sheer dark cliff and cloud" },
    guide: [
      ["ash", E(700, 1750, 700, 230)], ["ash", E(2200, 1620, 800, 300)], ["ash", E(1500, 1500, 400, 260)], ["ash", E(700, 800, 560, 600)], ["grass", E(300, 1750, 200, 100)], ["grass", E(2700, 1650, 200, 100)],
      ["road", L(ROAD, 130)], ["road", L(EAST, 130)], ["road", L(UP, 120)], ["road", L(LEDGE, 110)], ["ash", E(700, 1000, 200, 130)],
      ["ash", E(1500, 1100, 240, 170)], ["floor", L(STAIR, 100)], ["ash", E(1520, 700, 120, 80)], ["ash", E(1880, 600, 120, 80)], ["paved", E(2500, 380, 420, 250)], ["floor", L([[2300, 400], [2460, 380]], 100)],
    ],
    entries: { start: { x: 150, y: 1700, face: "right" }, from_veilSanctum: { x: 150, y: 1700, face: "right" }, from_saltmereWarfront: { x: 2850, y: 1560, face: "left" } },
    exits: [
      { rect: [40, 1640, 56, 120], to: "veilSanctum", entry: "from_thunderSpine", push: [1, 0] },
      { rect: [2896, 1500, 56, 120], to: "saltmereWarfront", entry: "from_thunderSpine", push: [-1, 0] },
    ],
    triggers: [{ id: "spineS21", rect: [1400, 1030, 200, 160] }, { id: "ramFight", rect: [2380, 330, 260, 190], show: "ch10.s21" }],
    chests: [{ id: "spineChest", x: 700, y: 1020 }],
    gather: [{ id: "stormglass1", x: 1750, y: 1690, label: "Hollow lightning-glass", color: 0xb0d0ff }, { id: "stormglass2", x: 1050, y: 1665, label: "Fused sand tubes", color: 0xb0d0ff }, { id: "thunderTablet", x: 2300, y: 380, label: "tablet", color: 0xe8c860, show: ["ch10.t7", "!lore.sunPiece6"] }],
    props,
    scatter: [{ keys: [["spineScrub", 2], ["spineBoulder", 1], ["grass", 1]], n: 50, seed: 31, on: ["ash", "grass"], opts: { solid: false }, scaleRange: [0.7, 1] }],
    encounter: { table: "thunder", rate: 24 },
    npcs: [{ id: null, art: "npcPilgrim", x: 600, y: 1690, path: [[420, 1700], [900, 1630]], speed: 14 }],
    amb: { weather: "storm", motes: 40, dust: 0xc0c8e0, tint: [0x28324a, 0.3], birds: 0 },
    dark: { ambient: 0.4, radius: 330, fireRadius: 170 },
    lights: [[1500, 1090, 180, 0.9], [1400, 1040, 100, 0.7], [1600, 1040, 100, 0.7], [2300, 330, 140, 0.8], [2380, 460, 110, 0.6], [700, 1130, 110, 0.7], [260, 1790, 100, 0.6], [900, 1710, 100, 0.6], [1500, 1760, 100, 0.6], [2100, 1740, 100, 0.6], [2700, 1650, 100, 0.6]],
    checkFlags: { "ch10.s21": true, "ch10.t7": true },
  });
})();
