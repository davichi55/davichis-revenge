// M5 3.4 Veil Sanctum (town, 1950x1300): the Ember Flock's white city on a cliff. Three paved terraces climb north, joined by wide stairs; the cathedral (candle-flame stag over the door) stands on the top
// terrace with its two bell towers, the crypt stair at its west end, the Observatory tower on a higher terrace NE; the pilgrim causeway to the Warfront leaves west (bottom), the Thunder Spine road east (middle).
// Entries: start (= from_saltmereWarfront), from_saltmereWarfront, from_veilCrypts, from_veilObservatory, from_thunderSpine, inn. NPC ids: innkeeper merchant lysenne morvane odan pilgrim r1 r2 r3.
// Triggers: sanctumArrive, sanctumS20 (cathedral steps). No fights.
(function () {
  const { R, E, P, L } = World.shapes, M = World.M5;
  const props = M.flat(
    // top terrace: the cathedral, bell towers, candelabra rows, cypresses, banners
    [["sanctumCathedral", 975, 335, { solid: [90, 24] }], ["sanctumBellTower", 770, 320, { solid: [30, 16] }], ["sanctumBellTower", 1185, 320, { solid: [30, 16] }], ["sanctumStagStatue", 975, 560], ["sanctumBanner", 880, 300], ["sanctumBanner", 1070, 300]],
    M.line("sanctumCandelabra", [[800, 440], [800, 500]], 60, { seed: 1, opts: { solid: false } }), M.line("sanctumCandelabra", [[1150, 440], [1150, 500]], 60, { seed: 2, opts: { solid: false } }),
    M.line("sanctumCypress", [[500, 300], [700, 300]], 70, { seed: 3, jit: 6 }), M.line("sanctumCypress", [[1260, 300], [1450, 300]], 70, { seed: 4, jit: 6 }),
    [["sanctumPilgrimHall", 560, 290, { solid: [90, 22] }], ["sanctumPrayerWall", 1340, 455]],
    // observatory terrace
    [["sanctumObservTower", 1700, 305, { solid: [50, 20] }], ["sanctumCypress", 1560, 260], ["sanctumCypress", 1860, 300], ["sanctumBanner", 1580, 330], ["sanctumCandelabra", 1640, 350, { solid: false }], ["sanctumCandelabra", 1770, 350, { solid: false }]],
    // middle terrace: houses, the stag statue court, benches and planters
    [["sanctumHouseA", 360, 650], ["sanctumHouseB", 520, 640], ["sanctumHouseA", 1430, 650], ["sanctumHouseB", 1280, 640], ["sanctumBench", 660, 740], ["sanctumBench", 1300, 740], ["sanctumPlanter", 720, 610], ["sanctumPlanter", 1230, 610], ["sanctumPlanter", 850, 740], ["sanctumPlanter", 1100, 740]],
    M.line("sanctumCandelabra", [[900, 600], [900, 740]], 70, { seed: 5, opts: { solid: false } }), M.line("sanctumCandelabra", [[1050, 600], [1050, 740]], 70, { seed: 6, opts: { solid: false } }),
    // lower terrace: the Pilgrim's Bed, the almoner's shop, the fountain, hostels, lamps
    [["sanctumPilgrimInn", 420, 1030, { solid: [64, 20] }], ["sanctumShop", 700, 1000, { solid: [50, 18] }], ["sanctumFountain", 1010, 1060], ["sanctumHouseB", 1280, 1000], ["sanctumHouseA", 1480, 1020], ["sanctumPilgrimHall", 1650, 1030, { solid: [90, 22] }]],
    [["sanctumBench", 850, 1130], ["sanctumBench", 1170, 1130], ["sanctumPlanter", 560, 1150], ["sanctumPlanter", 1380, 1150], ["sanctumCandelabra", 300, 990], ["sanctumCandelabra", 900, 940], ["sanctumCandelabra", 1130, 940], ["sanctumCypress", 250, 920], ["sanctumCypress", 1800, 930], ["sanctumBanner", 600, 940], ["sanctumBanner", 1560, 940]],
    // cliff edge: cypresses on the outer ledges, prayer wall at the stair heads
    M.line("sanctumCypress", [[200, 560], [330, 560]], 60, { seed: 7 }), M.line("sanctumCypress", [[1560, 560], [1690, 560]], 60, { seed: 8 }),
    [["sanctumPrayerWall", 620, 835, { solid: false }], ["sanctumPrayerWall", 1330, 835, { solid: false }], ["sanctumBanner", 1860, 640], ["sanctumBanner", 1860, 720]]
  );
  World.def("veilSanctum", {
    name: "Veil Sanctum", w: 1950, h: 1300, music: "sanctum", rim: 40, base: "rock", ground: "assets/regions/veilSanctum.jpg",
    look: "A white city of the Ember Flock on a sea cliff seen from above: three terraces of white-and-cream paved stone joined by wide stairs, a cathedral with a candle-flame stag over the door and two bell towers on the top terrace, an observatory tower on a higher terrace, cypresses, candelabra, banners, dark cliff rock all around and a pale sky.",
    legend: { paved: "white and cream paved stone terraces with fine joints", floor: "wide white stone stairs", wall: "white limestone retaining walls of the terraces", road: "pale gravel pilgrim paths", rock: "dark sea-cliff rock", grass: "short dry grass" },
    guide: [
      ["paved", R(150, 880, 1650, 330)], ["wall", R(150, 810, 1650, 70)], ["paved", R(250, 560, 1450, 250)], ["wall", R(250, 505, 1250, 55)], ["paved", R(450, 250, 1050, 255)],
      ["floor", R(690, 800, 130, 90)], ["floor", R(1480, 800, 130, 90)], ["floor", R(880, 495, 200, 70)], ["floor", R(500, 495, 110, 70)], ["floor", R(1300, 495, 110, 70)],
      ["paved", R(1520, 150, 340, 260)], ["road", L([[1440, 380], [1620, 300]], 76)], ["floor", R(1480, 380, 70, 90)],
      ["road", L([[40, 1050], [220, 1050]], 100)], ["road", L([[1700, 680], [1910, 680]], 96)], ["grass", E(540, 420, 70, 40)],
    ],
    entries: { start: { x: 200, y: 1050, face: "right" }, from_saltmereWarfront: { x: 200, y: 1050, face: "right" }, inn: { x: 420, y: 1090, face: "down" }, from_veilCrypts: { x: 540, y: 450, face: "down" }, from_veilObservatory: { x: 1700, y: 380, face: "down" }, from_thunderSpine: { x: 1840, y: 680, face: "left" } },
    exits: [
      { rect: [40, 1000, 56, 100], to: "saltmereWarfront", entry: "from_veilSanctum", push: [1, 0] },
      { rect: [490, 330, 90, 60], to: "veilCrypts", entry: "from_veilSanctum", push: [0, 1], need: "ch10.s20" },
      { rect: [1650, 310, 100, 50], to: "veilObservatory", entry: "from_veilSanctum", push: [0, 1], need: "ch10.s20" },
      { rect: [1894, 630, 56, 100], to: "thunderSpine", entry: "from_veilSanctum", push: [-1, 0], need: "ch10.mentorWon" },
    ],
    triggers: [{ id: "sanctumArrive", rect: [120, 990, 320, 130] }, { id: "sanctumS20", rect: [895, 370, 170, 110] }],
    props,
    scatter: [{ keys: [["sanctumPlanter", 1], ["grass", 2], ["grass2", 2]], n: 24, seed: 21, on: ["paved"], opts: { solid: false }, scaleRange: [0.6, 0.9] }],
    npcs: [
      { id: "innkeeper", art: "innkeeper", name: "Innkeeper", x: 480, y: 1100 }, { id: "merchant", art: "merchant", name: "Almoner", x: 770, y: 1050 },
      { id: "lysenne", art: "npcLysenne", name: "High Cantor Lysenne", x: 850, y: 440 }, { id: "morvane", art: "npcMorvane", name: "Archdeacon Morvane", x: 1110, y: 440 }, { id: "odan", art: "npcOdan", name: "Brother Odan", x: 640, y: 540 },
      { id: "pilgrim", art: "npcPilgrim", name: "Pilgrim", x: 765, y: 850 }, { id: "r1", art: "npcAcolyte", name: "Novice", x: 1420, y: 760 }, { id: "r2", art: "npcFlockGuard", name: "Bell-ringer", x: 1260, y: 420 }, { id: "r3", art: "npcPilgrim", name: "Pilgrim", x: 1190, y: 1100 },
      { id: null, art: "npcAcolyte", x: 900, y: 650, path: [[620, 660], [1300, 660]], speed: 16 }, { id: null, art: "npcPilgrim", x: 600, y: 1130, path: [[420, 1140], [1000, 1140]], speed: 14 }, { id: null, art: "npcAcolyte", x: 1500, y: 1120, path: [[1300, 1120], [1700, 1120]], speed: 16 },
      { id: null, art: "npcFlockGuard", x: 1580, y: 600, path: [[1500, 600], [1650, 600]], speed: 12 },
    ],
    amb: { weather: ["clear", "clear", "mist"], birds: 8, motes: 28, dust: 0xf0ece0, tint: [0xe8eefc, 0.1], warm: [0xffe8c0, 0.05], sparkle: { terrain: ["paved"], color: 0xfff4d0, rate: 2 } },
  });
})();
