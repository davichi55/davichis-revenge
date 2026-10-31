// M3 / ch6: Kharam Oasis, the Concord's capital (town, no fights). Entries start from_kharamRoad inn. Exit kharamRoad@from_kharamOasis (W gate).
// NPC ids: innkeeper merchant rhaz peya corvin ilse wellKeeper pell r1 r2 r3. Triggers: kharamArrive, concordHall (show ch6.contract), briefing (show ch6.vote).
(function () {
  const { R, E, P, L } = World.shapes, M = World.m3, props = [];
  // the ring of seven wells around the central plaza, a great fountain in the middle
  props.push(...M.ring("amberWell", 950, 640, 235, 150, 7, {}, -Math.PI / 2, Math.PI * 1.5, 0, 3), ["fountain", 950, 650, { solid: [40, 14] }]);
  props.push(...M.ring(["lampPost", "scholarBanner"], 950, 640, 330, 215, 12, { tint: 0xf0d8a0 }, 0, undefined, 0, 4));
  // guild halls: Dune Wardens (west), Lantern Circle (east), Saltwater Compact (south), the Concord hall (north)
  props.push(["guildHall", 460, 540, { tint: 0xe8c898 }], ["scholarBanner", 400, 600, { tint: 0xe8b050 }], ["scholarBanner", 520, 600, { tint: 0xe8b050 }], ["guildHall", 1450, 520, { tint: 0xf0e0a0 }], ["scholarBanner", 1390, 580, { tint: 0xffe070 }], ["scholarBanner", 1510, 580, { tint: 0xffe070 }],
    ["guildHall", 880, 1040, { tint: 0xa8e0d8 }], ["scholarBanner", 820, 1100, { tint: 0x50c8c0 }], ["scholarBanner", 940, 1100, { tint: 0x50c8c0 }], ["academyHall", 950, 270, { tint: 0xe8d8b8 }], ["whiteColumn", 840, 300], ["whiteColumn", 1060, 300]);
  props.push(["noticeBoard", 600, 690], ["noticeBoard", 1300, 690], ["noticeBoard", 1010, 960]);
  // houses, inn, stalls, bazaar
  props.push(["reedInn", 1180, 330, { tint: 0xf0e0c8 }], ["amberHouse", 360, 330], ["amberDomeHouse", 560, 250], ["amberHouse", 1380, 270], ["amberDomeHouse", 1600, 400], ["amberHouse", 300, 780], ["amberDomeHouse", 280, 940, { tint: 0xe8d8c8 }], ["amberHouse", 1650, 740], ["amberHouse", 1540, 1000], ["amberDomeHouse", 700, 1150, { tint: 0xe8d8c8 }], ["amberHouse", 1180, 1120], ["amberDomeHouse", 480, 1080]);
  props.push(["amberStall", 700, 800], ["amberStall", 790, 840], ["amberStall", 1110, 820], ["amberStall", 1200, 780], ["bookStall", 640, 860], ["dateCrate", 1050, 860], ["terracottaJars", 760, 890], ["trough", 1160, 880], ["camel", 1330, 860], ["hayBales", 1280, 900], ["terracottaJars", 520, 760]);
  // the small Flock shrine of white stone (candle-flame stag over the door) in the south-east
  props.push(["whiteHouse", 1520, 880, { tint: 0xfaf4ea }], ["m2_clayLampShrine", 1450, 940, { tint: 0xfff0d0 }], ["candleStand", 1590, 940], ["candleStand", 1470, 860], ["scholarStatue", 1620, 880, { tint: 0xfaf4ea }]);
  // oasis: palms and water pools in the north-west and north-east, reeds
  props.push(["palm1", 130, 180], ["palm2", 210, 150], ["palm1", 300, 130], ["palm2", 120, 300], ["palm1", 1700, 160], ["palm2", 1780, 260], ["palm1", 1600, 130], ["palm2", 1790, 140], ["reeds", 190, 250], ["reeds", 1730, 230], ["reeds", 270, 220], ["palm1", 1760, 600], ["palm2", 150, 1130], ["palm1", 240, 1180], ["palm1", 1780, 1180]);
  World.def("kharamOasis", {
    name: "Kharam Oasis", w: 1900, h: 1300, base: "sand", music: "kharam", rim: 44,
    look: "A desert oasis capital seen from above: a round cobbled plaza ringed by seven stone wells with a fountain in the middle, wide sandy streets between warm sand-coloured buildings with domes, three guild halls with coloured banners, a small white shrine in a corner, green grass and palms around two clear blue pools in the north corners. Warm, bustling, afternoon sun.",
    legend: { paved: "sand-coloured cobbled plaza and streets with a ring pattern around the wells, swept clean", sand: "pale warm sand, trampled between the buildings", road: "a worn road through the western gate", grass: "lush green oasis grass and damp earth, clover", shallow: "clear turquoise shallow oasis water over pale stone", water: "deep clear blue oasis pool", salt: "white-washed courtyard of the shrine" },
    bank: { paved: "lime", sand: "sand", road: "dirt", grass: "green", shallow: "teal", water: "water", salt: "lime" }, grade: { paved: { mul: [1.0, 0.9, 0.74], add: [6, 2, -4] }, sand: { mul: [1.05, 1.0, 0.92], add: [6, 4, 0] }, grass: { mul: [1.0, 1.15, 0.9], add: [0, 6, 0] }, water: { mul: [0.9, 1.3, 1.3], add: [4, 22, 22] }, shallow: { mul: [0.9, 1.25, 1.15], add: [4, 20, 14] }, salt: { mul: [1.0, 0.98, 0.94], add: [8, 6, 2] }, _: [1.04, 1.0, 0.94] },
    marks: [{ k: "dot", on: ["paved", "sand"], n: 90, col: [120, 90, 60], a: 0.5, r: [1, 2.2] }],
    guide: [
      ["grass", E(220, 220, 260, 190)], ["grass", E(1680, 220, 260, 190)], ["grass", E(160, 1150, 200, 130)], ["grass", E(1760, 1160, 200, 130)], ["shallow", E(220, 220, 170, 120)], ["water", E(220, 220, 100, 70)], ["shallow", E(1680, 220, 170, 120)], ["water", E(1680, 220, 100, 70)],
      ["road", L([[44, 660], [400, 660], [700, 650]], 120)], ["paved", E(950, 640, 380, 250)], ["paved", L([[950, 640], [950, 1180]], 140)], ["paved", L([[950, 640], [950, 300]], 150)], ["paved", L([[950, 640], [1700, 640]], 130)], ["paved", L([[400, 660], [400, 960]], 110)],
      ["salt", E(1530, 920, 170, 110)], ["paved", L([[1530, 920], [1350, 780]], 90)],
    ],
    entries: { start: { x: 160, y: 660, face: "right" }, from_kharamRoad: { x: 160, y: 660, face: "right" }, inn: { x: 1180, y: 410, face: "down" } },
    exits: [{ rect: [0, 590, 80, 140], to: "kharamRoad", entry: "from_kharamOasis", push: [1, 0] }],
    triggers: [{ id: "kharamArrive", rect: [100, 590, 160, 140] }, { id: "concordHall", rect: [850, 330, 200, 90], show: "ch6.contract" }, { id: "briefing", rect: [1250, 600, 150, 110], show: "ch6.vote" }],
    npcs: [
      { id: "innkeeper", art: "npcVillagerF", name: "Innkeeper", x: 1240, y: 410 }, { id: "merchant", art: "npcTrader", name: "Merchant", x: 900, y: 880 },
      { id: "rhaz", art: "npcRhaz", name: "Rhaz, Dune Wardens", x: 470, y: 640 }, { id: "peya", art: "npcPeya", name: "Peya, Lantern Circle", x: 1450, y: 610 }, { id: "corvin", art: "npcCorvin", name: "Corvin, Saltwater Compact", x: 890, y: 1120 },
      { id: "ilse", art: "npcAcolyte", name: "Sister Ilse", x: 1520, y: 960 }, { id: "wellKeeper", art: "npcPilgrim", name: "Well-Keeper", x: 1090, y: 700 }, { id: "hadiya", art: "npcHadiya", name: "Hadiya Wells", x: 1380, y: 700 }, { id: "pell", art: "npcScholarM", name: "Pell", x: 620, y: 780 },
      { id: "r1", art: "npcTraveler", name: "Traveller", x: 760, y: 700 }, { id: "r2", art: "npcGranny", name: "Old woman", x: 1010, y: 500 }, { id: "r3", art: "npcChild", name: "Child", x: 330, y: 820 },
      { id: null, art: "npcTrader", x: 800, y: 600, path: [[600, 640], [1250, 640]], speed: 22 }, { id: null, art: "npcVillagerF", x: 960, y: 820, path: [[700, 840], [1200, 840], [1200, 960], [700, 960]], loop: true, speed: 20 }, { id: null, art: "npcGuard", x: 150, y: 600, still: true }, { id: null, art: "npcGuard", x: 150, y: 720, still: true, flip: true }, { id: null, art: "npcTraveler", x: 1650, y: 700, path: [[1500, 700], [1700, 700]], speed: 18 },
    ],
    props,
    scatter: [{ keys: [["terracottaJars", 2], ["dateCrate", 1], ["hayBales", 1]], n: 14, on: ["paved", "sand"], seed: 91, scaleRange: [0.8, 1.0] }, { keys: [["shrub", 2], ["grass", 3]], n: 20, on: ["grass"], seed: 92 }],
    encounter: { table: null, rate: 0 },
    amb: { birds: 7, butterflies: [[300, 300], [1560, 330], [260, 1100], [1700, 1120], [980, 560]], water: true, dust: 0xe8d0a0, motes: 28, tint: [0x4a3a20, 0.04], warm: [0xffa040, 0.06] },
  });
})();
