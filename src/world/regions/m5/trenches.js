// M5 3.3 Saltmere Trenches (dungeon, 2400x1600): trench warfare seen from above. The whole map is earthwork; the trenches are mud corridors (road) with plank runs (floor), bunker rooms (paved),
// firing steps, ballistae behind sandbags, mortar pits and a wrecked siege ram. West mouth = entry from the Warfront; the main line runs east to the breach (S19: a blown-open crater with the collar
// altar, trigger breachS19); a north branch ends in a bunker with the chest (trenchChest); a south loop is the dead-end supply trench. Table "trenches" 22 s. No armies (the legion stands beyond the
// breach, off the map). Entries start, from_saltmereWarfront. Exit saltmereWarfront@from_saltmereTrenches (west mouth).
(function () {
  const { R, E, P, L } = World.shapes, M = World.M5;
  const MAIN = [[60, 800], [560, 800], [560, 520], [1000, 520], [1000, 1080], [1500, 1080], [1500, 800], [1880, 800]];
  const SOUTH = [[560, 800], [560, 1260], [1120, 1260], [1120, 1080]];
  const NORTH = [[1500, 800], [1500, 340], [2020, 340], [2020, 250], [2200, 250]];
  const SPUR = [[1000, 520], [1000, 300], [760, 300]];
  const ALL = [MAIN, SOUTH, NORTH, SPUR];
  const props = M.flat(
    // sandbag lips and stakes along the trench edges (visual only, they sit on the earthwork beside the corridor)
    M.line("saltmereSandbags", [[130, 735], [500, 735]], 130, { seed: 1, jit: 4, flipR: true, opts: { solid: false } }), M.line("saltmereSandbags", [[130, 868], [500, 868]], 130, { seed: 2, jit: 4, flipR: true, opts: { solid: false } }),
    M.line("saltmereSandbags", [[630, 470], [940, 470]], 140, { seed: 3, jit: 4, flipR: true, opts: { solid: false } }), M.line("saltmereSandbags", [[1070, 1140], [1440, 1140]], 140, { seed: 4, jit: 4, flipR: true, opts: { solid: false } }),
    M.line("saltmereStakes", [[1560, 740], [1800, 740]], 120, { seed: 5, opts: { solid: false }, flipR: true }), M.line("saltmereStakes", [[1560, 870], [1800, 870]], 120, { seed: 6, opts: { solid: false }, flipR: true }),
    // ballistae on firing steps, mortar pits, ammo and bolts in the bunkers
    [["saltmereBallista", 700, 440], ["saltmereBallista", 1340, 1020], ["saltmereBallista", 1700, 730], ["saltmereMortarPit", 780, 640, { solid: false }], ["saltmereMortarPit", 1260, 960, { solid: false }], ["saltmereMortarPit", 380, 960, { solid: false }]],
    [["saltmereAmmoCrates", 620, 590], ["saltmereBoltPile", 880, 580], ["saltmereBoltPile", 1220, 1160], ["saltmereAmmoCrates", 760, 1330], ["saltmereAmmoCrates", 980, 1330], ["saltmereBunkTent", 1300, 1330]],
    // plank-run details, ladders up to the firing steps, torches, banners, a dead mule-cart
    [["saltmereLadder", 520, 690, { solid: false }], ["saltmereLadder", 1060, 860, { solid: false }], ["saltmereLadder", 1560, 640, { solid: false }], ["saltmereLadder", 1360, 1190, { solid: false }]],
    M.line("saltmereTorchPost", [[200, 720], [600, 620], [1000, 900], [1300, 1010], [1700, 860], [1800, 760]], 210, { seed: 7, opts: { solid: false } }),
    [["saltmereBannerConcord", 340, 700], ["saltmereBannerFlock", 1180, 1000], ["saltmereBannerConcord", 1620, 900], ["saltmereBurntWagon", 400, 1100], ["saltmereBurntWagon", 1700, 460], ["saltmereSupplyWagon", 1900, 400]],
    [["saltmereRubble", 1420, 900], ["saltmereRubble", 1590, 770], ["saltmereRubble", 1700, 880]],
    // the supply bunker (south), the north bunker with the chest
    [["saltmereGuildHall", 840, 1350, { solid: false }], ["saltmereBunkerHatch", 680, 1180, { solid: false }], ["saltmereBunkerHatch", 1240, 1330, { solid: false }]],
    [["saltmereWeaponRack", 2120, 230], ["saltmereAmmoCrates", 2250, 210], ["saltmereBunkerHatch", 2200, 150, { solid: false }], ["saltmereShieldWall", 2010, 450, { solid: false }]],
    // the breach: crater, wrecked ram and tower, the collar altar and the legion's standard beyond
    [["saltmereWreckedTower", 2050, 600, { solid: false }], ["collarAltar", 2090, 830], ["saltmereLegionStandard", 2300, 700], ["saltmereLegionStandard", 2300, 920], ["saltmereBannerDominion", 2240, 620], ["saltmereBannerDominion", 2240, 1010], ["saltmereWarBrazier", 1980, 920], ["saltmereWarBrazier", 1980, 690], ["stairSiegeRam", 2220, 1060]],
    M.rect(["saltmereRubble", "saltmereFallenBanner", "saltmereBoltPile", "saltmereDeadTree"], 1950, 640, 2330, 1040, 8, { seed: 8, flipR: true, avoid: [[2090, 800, 120]] })
  );
  const trench = ALL.map(l => ["road", L(l, 96)]), plank = ALL.map(l => ["floor", L(l, 40)]);
  World.def("saltmereTrenches", {
    name: "Saltmere Trenches", w: 2400, h: 1600, music: "warfront", rim: 40, base: "wall", ground: "assets/regions/saltmereTrenches.jpg",
    look: "Trench warfare seen from above: a mass of packed grey earth and timber revetments cut by narrow winding mud trenches with plank duckboards, square bunkers, firing steps, sandbag parapets, a blown-open crater at the centre-east, grey overcast light.",
    legend: { wall: "packed grey-brown earthworks with timber revetment and sandbags seen from above", road: "wet churned mud trench floor with boot prints", floor: "wooden duckboard planks in the trench bottom", paved: "bunker plank floor", ash: "blasted black crater earth with embers", rock: "dark earth" },
    guide: [
      ...trench, ...plank,
      ["paved", R(1980, 150, 270, 200)], ["paved", R(740, 1230, 340, 150)], ["paved", R(560, 270, 340, 60)],
      ["ash", E(2090, 800, 250, 190)], ["road", L([[1880, 800], [2090, 800]], 110)],
    ],
    entries: { start: { x: 150, y: 800, face: "right" }, from_saltmereWarfront: { x: 150, y: 800, face: "right" } },
    exits: [{ rect: [40, 750, 60, 100], to: "saltmereWarfront", entry: "from_saltmereTrenches", push: [1, 0] }],
    triggers: [{ id: "breachS19", rect: [1930, 700, 140, 200] }],
    chests: [{ id: "trenchChest", x: 2160, y: 290 }],
    props,
    scatter: [{ keys: [["saltmereMudPuddle", 3], ["saltmereBoltPile", 1], ["saltmereRubble", 1], ["bones", 1]], n: 30, seed: 3, opts: { solid: false } }],
    encounter: { table: "trenches", rate: 22 },
    npcs: [
      { id: null, art: "npcWarden", x: 300, y: 770, path: [[240, 790], [520, 790]], speed: 18 }, { id: null, art: "npcFlockGuard", x: 1250, y: 1090, path: [[1030, 1090], [1470, 1090]], speed: 16 },
      { id: null, art: "npcResistFighter", x: 760, y: 540, path: [[600, 520], [980, 520]], speed: 18 }, { id: null, art: "npcMedic", x: 1500, y: 560, path: [[1500, 400], [1500, 760]], speed: 16 },
    ],
    amb: { weather: ["mist", "clear"], motes: 30, dust: 0xa8a090, tint: [0x30363c, 0.28], warm: [0xffa060, 0.03], smoke: [[2090, 800, 0x403a38], [2090, 760, 0x504844], [780, 640, 0x403a38], [1260, 960, 0x403a38], [400, 1100, 0x403a38]] },
    dark: { ambient: 0.35, radius: 260, fireRadius: 160 },
    lights: [[2090, 830, 200, 0.9], [1980, 920, 120, 0.8], [1980, 690, 120, 0.8], [700, 440, 110, 0.6], [1340, 1020, 110, 0.6], [200, 720, 90, 0.6], [600, 620, 90, 0.6], [1000, 900, 90, 0.6], [1700, 860, 100, 0.7], [2250, 220, 130, 0.7]],
  });
})();
