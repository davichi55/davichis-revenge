// M5 5.2 The Great Stair (field/assault, 3000x2000): the city's white processional stair burning on the way up to the Great Pyramid. A wide avenue climbs from the Bastion road (SW) through three
// flights to the Dawn Gate in the NE under the pyramid's black wall. Side pockets (W, E, N) hold the allied/imperial lines in stand-offs (spectacle only, noTouch) and the chest (stairChest); the avenue
// itself is lined with statues, burnt banners, barricades and braziers, burnt houses on the city blocks; ash falls. Table "stair" 26 s. Trigger stairAssault (once, near the start).
// Entries start, from_dawnwatchBastion, from_pyramidDawnGate. Exits dawnwatchBastion@from_ahuacanGreatStair (W), pyramidDawnGate@from_ahuacanGreatStair (E gate).
(function () {
  const { R, E, P, L } = World.shapes, M = World.M5, fx = { solid: false };
  const AVE = [[100, 1780], [760, 1780], [1150, 1420], [1150, 960], [1560, 720], [2150, 700], [2560, 440], [2940, 440]];
  const props = M.flat(
    [["m4_greatPyramid", 2480, 270, { solid: false, scale: 1.3 }], ["stairArch", 2790, 470, { solid: false }], ["pyrBanner", 2740, 360, fx], ["pyrBanner", 2740, 560, fx], ["stairBrazierGold", 2700, 370, fx], ["stairBrazierGold", 2700, 560, fx]],
    // statue rows and gold braziers either side of the avenue
    M.line("stairStatue", [[760, 1600], [1000, 1380], [1000, 1000], [1450, 800], [2150, 550], [2450, 330]], 260, { seed: 1, jit: 4 }), M.line("stairStatue", [[860, 1960], [1300, 1520], [1300, 900], [1650, 880], [2150, 880], [2470, 590]], 260, { seed: 2, jit: 4 }),
    M.line("stairBrazierGold", [[300, 1640], [700, 1640], [1000, 1280], [1000, 1060], [1520, 820], [2100, 560]], 280, { seed: 3, opts: fx }), M.line("stairTorchStand", [[300, 1930], [700, 1930], [1290, 1380], [1290, 1000], [1600, 890], [2250, 860]], 250, { seed: 4, opts: fx }),
    // the fight: barricades with gaps, rams, shield piles, burnt banners, wrecks
    [["stairBarricade", 520, 1700], ["stairBarricade", 1000, 1560], ["stairBarricade", 1280, 1230], ["stairBarricade", 1040, 880], ["stairBarricade", 1700, 760], ["stairBarricade", 2250, 600], ["stairSiegeRam", 920, 1840], ["stairSiegeRam", 1360, 800], ["stairSiegeRam", 2000, 850]],
    M.rect(["stairShieldPile", "stairBurntBanner", "stairBrokenColumn", "stairFallenStatue", "stairCart", "saltmereFallenBanner", "saltmereRubble"], 200, 700, 2800, 1950, 34, { seed: 5, flipR: true, opts: fx, avoid: [[1500, 700, 100]] }),
    [["stairArch", 1150, 1180, { solid: false }], ["stairArch", 1840, 700, { solid: false }]],
    // city blocks: burnt houses on the stone between the pockets
    [["stairBurntHouse", 340, 1000], ["stairBurntHouse", 760, 1000], ["stairHouseA", 1630, 1440], ["stairHouseB", 1840, 1500], ["stairBurntHouse", 2250, 1460], ["stairHouseA", 2560, 1380], ["stairHouseB", 2780, 1180], ["stairBurntHouse", 2660, 880],
      ["stairHouseB", 260, 420], ["stairHouseA", 520, 340], ["stairBurntHouse", 840, 400], ["stairHouseA", 1160, 340], ["stairBurntHouse", 1480, 290], ["stairHouseB", 330, 760], ["stairHouseA", 640, 700], ["stairBurntHouse", 960, 700], ["stairHouseB", 2000, 340], ["stairHouseA", 1980, 1000]],
    // the pockets: tents behind the lines, field fires, the chest corner
    [["stairTent", 340, 1450], ["stairTent", 420, 1500], ["saltmereCookFire", 640, 1450], ["saltmereAmmoCrates", 760, 1380], ["saltmereSupplyWagon", 600, 1090], ["stairTent", 1950, 1390], ["stairTent", 2060, 1340], ["saltmereBoltPile", 1800, 1360], ["saltmereLegionStandard", 1700, 1050], ["saltmereLegionStandard", 2080, 1050]],
    [["saltmereBannerConcord", 330, 1160], ["saltmereBannerFlock", 330, 1340], ["saltmereBannerDominion", 2200, 1060], ["saltmereBannerDominion", 2200, 1250], ["saltmereBannerConcord", 1440, 380], ["saltmereBannerDominion", 1790, 280]]
  );
  World.def("ahuacanGreatStair", {
    name: "The Great Stair", w: 3000, h: 2000, music: "warfront", rim: 40, base: "wall", ground: "assets/regions/ahuacanGreatStair.jpg",
    look: "A burning imperial city seen from above: a wide white processional stair climbing in three flights between statue rows, burnt banners, barricades, ash and smoke, soldiers fighting in side squares, burnt houses of pale stone on every side, a huge black-and-gold pyramid wall at the top right with a gate.",
    legend: { paved: "wide white processional avenue of cream stone slabs scattered with ash and embers", floor: "white stone stairs", road: "trampled ash-covered squares", ash: "burnt black earth and ash", wall: "pale burnt city stone blocks with roofs seen from above", rock: "dark rubble" },
    guide: [
      ["road", E(500, 1250, 340, 240)], ["road", E(1900, 1150, 340, 240)], ["road", E(1600, 340, 320, 140)], ["road", L([[800, 1250], [1050, 1250]], 150)], ["road", L([[1250, 1150], [1650, 1150]], 150)], ["road", L([[1560, 600], [1560, 400]], 120)],
      ["paved", L(AVE, 340)], ["paved", E(1150, 1190, 300, 260)], ["floor", L([[1150, 1420], [1150, 1260]], 330)], ["floor", L([[1150, 980], [1300, 880]], 330)], ["floor", L([[1560, 720], [1880, 710]], 330)], ["floor", L([[2250, 660], [2420, 540]], 300)],
      ["ash", E(2780, 440, 190, 170)], ["ash", E(900, 1900, 300, 80)], ["ash", E(1700, 1600, 200, 80)],
    ],
    entries: { start: { x: 150, y: 1780, face: "right" }, from_dawnwatchBastion: { x: 150, y: 1780, face: "right" }, from_pyramidDawnGate: { x: 2850, y: 440, face: "left" } },
    exits: [{ rect: [40, 1710, 56, 140], to: "dawnwatchBastion", entry: "from_ahuacanGreatStair", push: [1, 0] }, { rect: [2894, 370, 56, 140], to: "pyramidDawnGate", entry: "from_ahuacanGreatStair", push: [-1, 0], need: "ch11.stair", blocked: "dawnGateShut" }],
    triggers: [{ id: "stairAssault", rect: [260, 1680, 300, 200] }],
    chests: [{ id: "stairChest", x: 800, y: 1330 }],
    gather: [{ id: "bannerThread1", x: 560, y: 1390, label: "A burnt standard", color: 0xe8b040 }, { id: "bannerThread2", x: 1980, y: 1260, label: "A banner in the ash", color: 0xe8b040 }],
    props,
    scatter: [{ keys: [["saltmereRubble", 2], ["bones", 1], ["debris", 1], ["stairShieldPile", 1]], n: 70, seed: 51, on: ["paved", "road", "ash"], opts: { solid: false }, scaleRange: [0.6, 0.9] }],
    encounter: { table: "stair", rate: 26 },
    amb: {
      weather: "ash", motes: 60, dust: 0x807468, tint: [0x4a3030, 0.24], warm: [0xff9050, 0.08], birds: 0,
      smoke: [[340, 1000, 0x302824], [760, 1000, 0x302824], [2250, 1460, 0x302824], [2660, 880, 0x302824], [840, 400, 0x302824], [960, 700, 0x302824], [1480, 290, 0x403a38], [1980, 1000, 0x302824], [1160, 340, 0x302824], [520, 340, 0x302824]],
      standoff: [{ id: "lineW", x: 500, y: 1250, cols: 8, noTouch: true, table: "stair", cryL: "For the Dominion!", cryR: "Hold the stair!" }, { id: "lineE", x: 1900, y: 1150, cols: 8, mirror: true, noTouch: true, table: "stair", cryR: "Up, up!" }, { id: "lineN", x: 1600, y: 340, cols: 5, noTouch: true, table: "stair" }],
      armies: [
        { id: "allied1", lane: [[250, 1790], [760, 1790], [1100, 1440], [1100, 1010]], mode: "pingpong", speed: 26, rows: 3, cols: 6 }, { id: "allied2", lane: [[1180, 1010], [1560, 770], [2100, 750]], mode: "pingpong", speed: 22, rows: 2, cols: 5 },
        { id: "hostile1", lane: [[2400, 570], [2100, 740], [1700, 770]], mode: "pingpong", speed: 18, rows: 2, cols: 5 },
      ],
    },
    dark: { ambient: 0.25, radius: 400, fireRadius: 200 },
    lights: [[2700, 370, 160, 0.9], [2700, 560, 160, 0.9], [640, 1450, 140, 0.9], [300, 1640, 90, 0.7], [700, 1640, 90, 0.7], [1000, 1280, 90, 0.7], [1520, 820, 90, 0.7], [2100, 560, 90, 0.7], [1150, 1190, 160, 0.6]],
  });
})();
