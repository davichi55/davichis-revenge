// R2 Scorpion Quarry: open-pit stone quarry. Table "quarry" ~25 s. Chest g20_masonHammer (G20). Gathering spot: duneclawShard (Duneclaw Shard).
(function () {
  const { R, E, P, L } = World.shapes;
  World.def("scorpionQuarry", {
    name: "Scorpion Quarry", w: 1700, h: 1100, base: "red", music: "desert", rim: 40,
    note: "IMPORTANT: the pure black areas are sheer red-brown rock cliffs and rock masses (rough dark red stone), never water and never blue.", look: "An open-pit red sandstone quarry seen from above: terraced cut stone ledges, rough red rock walls, ramps, scattered cut blocks, dust, dark pits. Hot and harsh.",
    legend: { red: "red-orange packed quarry earth with chisel marks and dust", sand: "pale cut-stone floor of the pit with sand", rock: "sheer red-brown rock cliff walls and ledges", road: "a worn cart ramp road" },
    guide: [
      ["sand", E(900, 560, 420, 230)], ["road", L([[60, 560], [400, 540], [700, 560]], 70)], ["road", L([[1300, 560], [1580, 380]], 64)], ["road", L([[900, 560], [900, 900]], 56)],
      ["rock", P([[500, 200], [800, 130], [1150, 180], [1300, 260], [1100, 330], [700, 320], [520, 330]])], ["rock", P([[520, 760], [760, 800], [1050, 780], [1300, 800], [1200, 930], [820, 980], [560, 900]])],
      ["rock", P([[250, 150], [400, 120], [440, 260], [300, 300]])], ["rock", P([[1400, 700], [1600, 650], [1620, 820], [1450, 860]])], ["rock", P([[200, 760], [360, 700], [440, 830], [330, 950], [190, 900]])],
      ["rock", P([[1450, 100], [1620, 110], [1640, 260], [1500, 250]])], ["red", E(1560, 380, 100, 80)],
    ],
    entries: { start: { x: 160, y: 560, face: "right" }, from_basin: { x: 160, y: 560, face: "right" } },
    exits: [{ rect: [40, 500, 60, 120], to: "amberBasin", entry: "from_quarry", push: [1, 0] }],
    chests: [{ id: "g20_masonHammer", x: 1570, y: 360 }],
    gather: [{ id: "duneclawShard", x: 920, y: 600, label: "dig for a Duneclaw Shard", color: "gold" }],
    npcs: [{ id: "quarryForeman", art: "npcDockhand", name: "Foreman", x: 330, y: 620 }],
    props: [
      ["scaffoldCrane", 1000, 640], ["mineCart", 760, 560], ["mineCart", 1160, 520], ["blockStack", 640, 640], ["toolRack", 540, 580], ["blockStack", 1260, 620], ["oreHeap", 900, 480], ["scaffoldCrane", 470, 700], ["saltCrystal", 1100, 470],
      ["redMass", 820, 240], ["redMass", 1000, 880], ["redPillar", 420, 200], ["redPillar", 1540, 720], ["redPillar", 300, 840], ["hornSkull", 1380, 450], ["campfire", 270, 540],
    ],
    scatter: [
      { keys: [["redPillar", 2], ["oreHeap", 2], ["blockStack", 1], ["boulder", 2], ["mineCart", 0.4]], n: 40, seed: 31 },
      { keys: [["bones", 2], ["skull", 1], ["ribs", 1], ["grass2", 2], ["glassShard", 0.4]], n: 50, seed: 32 },
    ],
    encounter: { table: "quarry", rate: 25 },
    amb: { birds: 2, water: false, dust: 0xd09070, motes: 70, tint: [0x4a2020, 0.18], smoke: [[1010, 600, 0x9a7a60]] },
  });
})();
