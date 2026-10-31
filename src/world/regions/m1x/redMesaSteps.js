// CH1-EXPAND (chapter 2): Red Mesa Steps, south-west of Amber Wells Basin: terraced red mesas, a winding canyon path up three steps, a survey stone of the builders, a scorpion shed. Table "basin" 38 s.
// Entries: start / from_amberBasin (N). Exit: amberBasin@from_redMesaSteps. Chests mesaChest1 mesaChest2, gather scorpShed (Scorpion Plate x2), lore surveyStone.
(function () {
  const { R, E, P, L } = World.shapes, K = World.kitM2, W = 3000, H = 2000;
  const mesas = [K.blobPts(520, 560, 380, 250, 1601, { jag: 0.12 }), K.blobPts(1500, 700, 330, 220, 1602, { jag: 0.12 }), K.blobPts(2500, 520, 380, 250, 1603, { jag: 0.12 }), K.blobPts(720, 1450, 330, 230, 1604, { jag: 0.12 }), K.blobPts(1950, 1350, 360, 240, 1605, { jag: 0.12 }), K.blobPts(2680, 1650, 300, 180, 1606, { jag: 0.14 }), K.blobPts(1250, 1830, 260, 110, 1607, { jag: 0.14 })];
  const terrace = [K.blobPts(2250, 1000, 300, 180, 1611, { jag: 0.12 }), K.blobPts(700, 1000, 260, 150, 1612, { jag: 0.12 }), K.blobPts(1300, 1450, 250, 150, 1613, { jag: 0.12 })];
  const path1 = K.wob([[1500, 30], [1480, 400], [1000, 800], [1300, 1100], [1800, 1000], [2250, 1000], [2500, 1300], [2300, 1700]], 40, 1621, 120);
  const def = {
    name: "Red Mesa Steps", ground: "assets/regions/redMesaSteps.jpg", w: W, h: H, music: "desert", rim: 40,
    look: "A desert of red-orange rock mesas seen from above, stacked terraces and flat red stone ledges separated by cliff walls, golden sand in the canyon floors, a winding dirt path, dry shrubs, old builder survey stone, warm dramatic low sun.",
    legend: { sand: "golden desert sand with ripples", red: "red-orange rock earth ledge with cracks and strata", road: "a worn dirt canyon path", rock: "tall dark red rock mesas and cliffs" },
    guide: [
      ["red", E(600, 1000, 560, 190)], ["red", E(2400, 1100, 440, 260)], ["red", E(1500, 1800, 700, 120)], ...terrace.map(p => ["red", P(p)]),
      ["road", L(path1, 56)], ["road", L([[700, 1000], [1000, 800]], 50)], ["road", L([[1300, 1450], [1300, 1100]], 50)], ["road", L([[1950, 1000], [1800, 1000]], 50)],
      ...mesas.map(p => ["rock", P(p)]),
    ],
    entries: { start: { x: 1500, y: 160, face: "down" }, from_amberBasin: { x: 1500, y: 160, face: "down" } },
    exits: [{ rect: [1440, 40, 130, 50], to: "amberBasin", entry: "from_redMesaSteps", push: [0, 1] }],
    triggers: [{ id: "mesaArrive", rect: [1430, 220, 150, 90] }],
    chests: [{ id: "mesaChest1", x: 2250, y: 1090 }, { id: "mesaChest2", x: 760, y: 1090 }],
    gather: [{ id: "scorpShed", x: 1300, y: 1540, label: "A scorpion's shed shell", color: "gold" }],
    npcs: [{ id: "surveyStone", art: "lightStele", name: "Builder survey stone", x: 1350, y: 960, hint: "E / Space: read the stone" }, { id: null, art: "npcTraveler", x: 1400, y: 500, path: [[1400, 500], [1100, 760], [1400, 500]], speed: 16, loop: true }],
    props: [
      ["redPillar", 1000, 560, { solid: [16, 10] }], ["redPillar", 1900, 760], ["redPillar", 2700, 1100], ["redPillar", 500, 1260], ["redPillar", 1650, 1240], ["redMass", 2000, 1540, { solid: [30, 14] }], ["redMass", 1050, 1240],
      ["cairn", 1480, 120], ["cairn", 2260, 960], ["cairn", 740, 960], ["camelBones", 1700, 560], ["deadTree", 900, 900], ["deadTree", 2450, 1500], ["oreHeap", 2300, 1040], ["skull", 1250, 1500],
    ],
    scatter: [
      { keys: [["cactus", 3], ["agave", 2], ["boulder", 2], ["rocks", 2], ["shrub", 3], ["redPillar", 1]], n: 110, seed: 1601 },
      { keys: [["grass", 4], ["grass2", 4], ["bones", 1], ["skull", 1], ["ribs", 1]], n: 100, seed: 1602 },
      { keys: [["redPillar", 2], ["oreHeap", 1], ["boulder", 2], ["agave", 1]], n: 40, on: ["red"], seed: 1603 },
    ],
    encounter: { table: "basin", rate: 38 },
    amb: { birds: 3, water: false, dust: 0xe8c890, motes: 50, tint: [0x4a2a2a, 0.14], armies: [{ id: "patrol1", lane: [[1000, 800], [1300, 1100], [1800, 1000], [1300, 1100]], mode: "pingpong", speed: 34, rows: 2, cols: 3, sight: 200, table: "basin" }] },
  };
  World.def("redMesaSteps", def);
})();
