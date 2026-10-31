// M3 / ch5: Haldar's Reach, the resistance city in the canyon (town hub, no fights). Entries start from_ashenCanyon from_caravan inn. Exits ashenCanyon@from_haldarsReach (S), brassHarbour@from_haldarsReach (E, need ch5.s6).
// NPC ids: innkeeper merchant saffa hadiya odan oldDunmar sefa lanternBuilder careCart refugee1..3 r1 r2 r3 kessa dorrin mayle (the last three show ch5.kessa). Triggers: reachArrive, siegeS6 (the east gate).
(function () {
  const { R, E, P, L } = World.shapes, M = World.m3, props = [];
  const TINT = [0xff6a5a, 0xffb347, 0xf2e05a, 0x6fd16a, 0x5ac8e8, 0x6a7cff, 0xc77dff];   // the seven banner colours
  // seven tall banners on poles along the upper terrace edge, one more on each stair
  TINT.forEach((t, i) => props.push(["scholarBanner", 360 + i * 160, 150, { tint: t, sway: 0.02 }]));
  props.push(["scholarBanner", 560, 470, { tint: TINT[2] }], ["scholarBanner", 1150, 470, { tint: TINT[4] }], ["scholarBanner", 800, 745, { tint: TINT[0] }], ["scholarBanner", 910, 745, { tint: TINT[5] }]);
  // the great unfinished Last Lantern: tower, scaffold, building stock
  props.push(["lighthouse", 850, 250], ["scaffoldCrane", 760, 270], ["scaffoldCrane", 950, 280], ["blockStack", 700, 330], ["blockStack", 1010, 340], ["crateStack", 660, 280], ["lightStele", 840, 360], ["torchPole", 780, 370], ["torchPole", 920, 370], ["toolRack", 1060, 280], ["oreHeap", 620, 330]);
  // upper terrace houses and mid terrace: houses, forge, inn, stores
  props.push(["m2_adobeHouseA", 420, 300, { tint: 0xd8c8b8 }], ["m2_adobeHouseB", 500, 210, { tint: 0xc8d0d8 }], ["amberHouse", 1240, 230, { tint: 0xe0d0c0 }], ["m2_adobeHouseA", 1330, 330], ["amberDomeHouse", 1130, 180, { tint: 0xd8e0e8 }], ["whiteHouse", 320, 220, { tint: 0xd8c0a8 }], ["m2_adobeHouseB", 1420, 190, { tint: 0xd0d8c8 }]);
  props.push(["lampQuillInn", 560, 560, { tint: 0xe8d0b0 }], ["amberHouse", 330, 560], ["m2_adobeHouseB", 270, 470, { tint: 0xc8c0b8 }], ["guildHall", 1010, 590, { tint: 0xd8c8b8 }], ["amberStall", 780, 600], ["amberStall", 890, 640], ["amberStall", 1150, 600], ["m2_adobeHouseA", 1340, 580, { tint: 0xd0c8c0 }],
    ["firePit", 1250, 520], ["toolRack", 1190, 500], ["mineCart", 1300, 510], ["oreHeap", 1380, 470], ["slagPile", 1160, 540], ["steamVent", 1330, 470], ["lampPost", 700, 560], ["lampPost", 1090, 700], ["lampPost", 450, 700], ["campfire", 620, 700]);
  props.push(...M.row("lampPost", 470, 440, 1250, 440, 6, {}, 0, 3));
  // rope lifts, stair rails, tents and the refugee quarter, hanging washing
  props.push(["m2_ropeStump", 300, 740], ["m2_ropeStump", 1400, 740], ["m2_ropeStump", 700, 740], ["m2_ropeStump", 990, 740], ["m2_clothesLine", 500, 880], ["m2_clothesLine", 1180, 900, { flip: true }], ["m2_clothesLine", 340, 1020]);
  props.push(["tent", 330, 840, { tint: 0xe0c8a0 }], ["m2_hideTent", 470, 800], ["sailorTent", 1250, 840, { tint: 0xd0c0b0 }], ["tent", 1330, 960], ["m2_hideTent", 1300, 1060], ["sailorTent", 560, 1040], ["tent", 440, 960], ["campCrates", 520, 890], ["m2_campCrates", 1120, 880], ["campfire", 410, 900], ["campfire", 1290, 900], ["m2_waterBarrel", 770, 880], ["m2_waterBarrel", 940, 870],
    ["menagerieWagon", 350, 960, { solid: [60, 20] }], ["cart", 1090, 960], ["trough", 860, 1010], ["m2_cookPot", 640, 960], ["hayBales", 1000, 1040], ["m2_waterJars", 780, 1040]);
  props.push(["rubblePile", 140, 1000], ["m2_cliffBoulder", 150, 600], ["m2_cliffBoulder", 1560, 300], ["deadTree", 1600, 820], ["m2_deadSnag", 120, 330], ["cairn", 1480, 640]);
  World.def("haldarsReach", {
    name: "Haldar's Reach", w: 1700, h: 1200, base: "rock", music: "resistance", rim: 44,
    look: "A resistance city built into a deep red canyon, seen from above: three terraces of packed red earth and pale stone steps climbing north, rope stairs, a smoky forge row, tents of refugees in the lower court, tall banners in seven colours, a great half-built lantern tower with scaffolding at the top. Warm, crowded, defiant, golden evening light.",
    legend: { red: "red-orange packed canyon earth, trampled, with straw and boot prints", paved: "pale sandstone flagstones, worn and chipped, with dust in the cracks", road: "a trampled dirt road with cart ruts", sand: "pale sand drifts and gravel", rock: "sheer red canyon walls, impassable layered stone" },
    bank: { rock: "red", red: "red", paved: "sand", road: "dirt", sand: "sand" }, grade: { rock: { mul: [1.45,1.0,0.85], add: [0, 0, 0] }, red: { mul: [0.95, 0.9, 0.9], add: [0, 0, 0] }, paved: { mul: [0.95, 0.85, 0.75], add: [0, -4, -6] }, road: { mul: [0.9, 0.8, 0.7], add: [0, 0, 0] }, _: [1.02, 0.98, 0.95] },
    marks: [{ k: "dot", on: ["red", "paved"], n: 80, col: [60, 30, 20], a: 0.6, r: [1, 2.2] }],
    guide: [
      ["red", R(300, 760, 1100, 330)], ["paved", E(850, 930, 260, 110)], ["road", R(780, 1040, 140, 160)], ["road", R(760, 720, 180, 90)], ["road", R(300, 700, 120, 100)], ["road", R(1280, 700, 120, 100)],
      ["paved", R(200, 420, 1300, 300)], ["road", R(780, 400, 140, 60)], ["paved", R(300, 110, 1100, 320)], ["sand", E(850, 330, 160, 70)], ["road", R(1440, 500, 260, 120)], ["paved", E(850, 580, 120, 50)],
    ],
    entries: { start: { x: 850, y: 1090, face: "up" }, from_ashenCanyon: { x: 850, y: 1090, face: "up" }, from_caravan: { x: 1590, y: 560, face: "left" }, from_brassHarbour: { x: 1590, y: 560, face: "left" }, inn: { x: 560, y: 640, face: "down" } },
    exits: [
      { rect: [780, 1150, 140, 50], to: "ashenCanyon", entry: "from_haldarsReach", push: [0, -1] },
      { rect: [1640, 500, 60, 120], to: "brassHarbour", entry: "from_haldarsReach", push: [-1, 0], need: "ch5.s6" },
    ],
    triggers: [{ id: "reachArrive", rect: [700, 960, 300, 110] }, { id: "siegeS6", rect: [1450, 490, 130, 140], show: "!ch5.s6" }],
    npcs: [
      { id: "innkeeper", art: "npcVillagerF", name: "Innkeeper", x: 612, y: 640 }, { id: "merchant", art: "npcTrader", name: "Merchant", x: 810, y: 640 },
      { id: "saffa", art: "npcSaffa", name: "Commander Saffa", x: 880, y: 440 }, { id: "hadiya", art: "npcHadiya", name: "Hadiya Wells", x: 1180, y: 310 },
      { id: "odan", art: "npcOdan", name: "Brother Odan", x: 1060, y: 780 }, { id: "oldDunmar", art: "npcDunmar", name: "Old Dunmar", x: 430, y: 1000, show: "ch5.escape" },
      { id: "sefa", art: "npcSefa", name: "Sefa Quill", x: 1230, y: 590 }, { id: "lanternBuilder", art: "npcLanternBuilder", name: "Lantern-builder", x: 860, y: 340 },
      { id: "careCart", art: "npcCareKeeper", name: "Care cart", x: 1130, y: 1030 },
      { id: "refugee1", art: "npcRefugeeW", name: "Refugee", x: 520, y: 940 }, { id: "refugee2", art: "npcRefugeeM", name: "Refugee", x: 1300, y: 930 }, { id: "refugee3", art: "npcRefugeeW", name: "Refugee", x: 700, y: 1000 },
      { id: "r1", art: "npcVillagerM", name: "Refugee", x: 700, y: 800 }, { id: "r2", art: "npcGranny", name: "Old woman", x: 1210, y: 560 }, { id: "r3", art: "npcChild", name: "Boy", x: 900, y: 800 },
      { id: "kessa", art: "npcKessa", name: "Kessa Vorn", x: 650, y: 860, show: "ch5.kessa" }, { id: "dorrin", art: "npcDorrin", name: "Dorrin Hale", x: 720, y: 900, show: "ch5.kessa" }, { id: "mayle", art: "npcMayle", name: "Mayle Tarn", x: 590, y: 900, show: "ch5.kessa" },
      { id: null, art: "npcResistFighter", x: 1500, y: 570, still: true }, { id: null, art: "npcResistFighter", x: 1500, y: 540, still: true, flip: true }, { id: null, art: "npcResistFighter", x: 800, y: 1120, still: true },
      { id: null, art: "npcPorter", x: 600, y: 520, path: [[460, 520], [1000, 520]], speed: 24 }, { id: null, art: "npcVillagerF", x: 900, y: 880, path: [[450, 860], [1250, 860], [1250, 940], [450, 940]], loop: true, speed: 22 }, { id: null, art: "npcRefugeeM", x: 1000, y: 200, path: [[500, 220], [1250, 220]], speed: 20 },
    ],
    props,
    scatter: [{ keys: [["crates", 2], ["m2_waterJars", 1], ["debris", 1], ["bookPile", 1]], n: 22, on: ["red", "paved"], seed: 61, scaleRange: [0.8, 1] }],
    encounter: { table: null, rate: 0 },
    amb: { birds: 3, butterflies: [], dust: 0xd8a070, motes: 40, tint: [0x3a1a14, 0.1], warm: [0xff9a50, 0.08], smoke: [[1250, 500, 0x666055], [1180, 540, 0x666055]] },
  });
})();
