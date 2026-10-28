// R0 Orun, the Scholars' Academy city (prologue). No encounters. NPC ids for story scripts: mentor, innkeeper, merchant, oldDunmar, labMaster (quest "Tidy the Lab"), r1 r2 r3 (rumours), lockedLabDoor.
(function () {
  const { R, E, P, L } = World.shapes, props = [];
  // street lamps down the avenues and along the canal
  for (let x = 180; x < 1800; x += 210) props.push(["lampPost", x, 628]), props.push(["lampPost", x + 100, 760]);
  for (let y = 780; y < 1250; y += 160) props.push(["lampPost", 900, y], ["lampPost", 1072, y]);
  props.push(
    ["academyHall", 985, 420], ["whiteColumn", 800, 452], ["whiteColumn", 1170, 452], ["scholarBanner", 860, 470], ["scholarBanner", 1110, 470],
    ["libraryHall", 600, 400], ["bellTower", 1290, 400], ["labHouse", 1560, 480], ["labHouse", 1800, 470], ["whiteHouse", 1420, 250], ["whiteHouse", 330, 140],
    ["bookStall", 150, 330], ["bookStall", 290, 340], ["bookStall", 430, 330], ["bookStall", 220, 500], ["bookStall", 380, 520],
    ["fountain", 985, 590], ["scholarStatue", 700, 580], ["scholarStatue", 1270, 580], ["stoneBench", 860, 600], ["stoneBench", 1110, 600], ["stoneBench", 760, 780], ["stoneBench", 1220, 790],
    ["lampQuillInn", 330, 990], ["shopHouse", 740, 990], ["whiteHouse", 1260, 1010], ["whiteHouse", 1500, 1020], ["whiteHouse", 1770, 1000], ["whiteHouse", 150, 1130], ["whiteHouse", 560, 1200], ["labHouse", 1650, 1230],
    ["whiteGate", 986, 1326, { dy: -70 }], ["lampPost", 930, 1300], ["lampPost", 1042, 1300],
    ["oliveTree", 120, 780], ["oliveTree", 260, 840], ["oliveTree", 430, 800], ["oliveTree", 1560, 860], ["oliveTree", 1700, 880], ["oliveTree", 1830, 840], ["oliveTree", 580, 840], ["oliveTree", 1400, 790], ["oliveTree", 700, 1110],
    ["oliveTree", 1180, 1180], ["oliveTree", 790, 260], ["oliveTree", 1190, 200], ["oliveTree", 1930, 300], ["oliveTree", 100, 640 - 100],
    ["scholarBanner", 560, 1140], ["scholarBanner", 1420, 1100]
  );
  World.def("orun", {
    name: "Orun, the Scholars' Academy", w: 1972, h: 1344, base: "paved", music: "town", rim: 44,
    look: "A desert city of white limestone: wide flagstone avenues, a canal of clear water crossing the city with arched bridges, small terraced gardens, bronze lamp bases. Lamp-lit, calm, scholarly.",
    legend: { paved: "pale white-cream limestone flagstones with fine joints", rock: "the city's outer wall top and rough cliff rock, dark", grass: "neat terraced gardens of grass and herbs", water: "a clear canal of blue-green water with stone edges", road: "a sand and cobble road leading out of the city gate" },
    guide: [
      ["grass", E(985, 250, 360, 110)], ["grass", E(300, 840, 150, 70)], ["grass", E(1650, 860, 200, 70)], ["grass", E(640, 1120, 90, 50)], ["grass", E(1180, 1150, 90, 50)],
      ["water", R(0, 660, 1972, 56)], ["paved", R(560, 652, 110, 72)], ["paved", R(930, 652, 112, 72)], ["paved", R(1290, 652, 110, 72)],
      ["road", L([[986, 1344], [986, 1150]], 120)],
    ],
    entries: { start: { x: 986, y: 1160, face: "up" }, from_dunes: { x: 986, y: 1230, face: "up" }, from_undercroft: { x: 1560, y: 548, face: "down" } },
    exits: [
      { rect: [936, 1296, 100, 48], to: "whisperglassDunes", entry: "from_orun", push: [0, -1] },
      { rect: [1528, 486, 64, 28], to: "orunUndercroft", entry: "from_orun", push: [0, 1] },
    ],
    triggers: [
      { id: "packChoice", rect: [930, 452, 110, 36] },
      { id: "raidStart", rect: [900, 760, 170, 40] },
    ],
    props,
    scatter: [
      { keys: ["stoneBench", "lampPost"], n: 0 },
    ],
    npcs: [
      { id: "mentor", art: "mentor", name: "Mentor", x: 1090, y: 478 },
      { id: "innkeeper", art: "innkeeper", name: "Innkeeper", x: 330, y: 1040 },
      { id: "merchant", art: "merchant", name: "Shopkeeper", x: 740, y: 1040 },
      { id: "oldDunmar", art: "npcDunmar", name: "Old Dunmar", x: 1470, y: 556 },
      { id: "labMaster", art: "scholar", name: "Lab Master", x: 1700, y: 530 },
      { id: "r1", art: "npcVillagerF", name: "Villager", x: 355, y: 440 },
      { id: "r2", art: "npcVillagerM", name: "Villager", x: 880, y: 650 },
      { id: "r3", art: "npcRedScholar", name: "Scholar", x: 1700, y: 600 },
      { id: "lockedLabDoor", art: null, name: "Locked door", x: 1800, y: 500, hint: "E / Space: a locked lab door" },
      { id: null, art: "npcGuard", x: 850, y: 1250, path: [[850, 1250], [850, 1000]] },
      { id: null, art: "npcVillagerM", x: 400, y: 640, path: [[200, 760], [600, 760], [600, 900], [200, 900]], loop: true, speed: 26 },
      { id: null, art: "npcVillagerF", x: 1300, y: 780, path: [[1100, 780], [1700, 780]], speed: 24 },
      { id: null, art: "npcChild", x: 900, y: 700, path: [[820, 790], [1160, 790], [1160, 900], [820, 900]], loop: true, speed: 40 },
      { id: null, art: "npcTraveler", x: 1100, y: 1100, path: [[1100, 1100], [1500, 1100]], speed: 22 },
    ],
    amb: { birds: 4, butterflies: [[300, 840], [1650, 860], [985, 270], [1100, 1150]], dust: 0xf0e6d0, tint: [0x5a4a6a, 0.1], warm: [0xffd8a0, 0.05], motes: 36 },
  });
})();
