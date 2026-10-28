// R2 Amber Wells: big oasis town of orange brick, date palms, the Menagerie Wagon (Old Dunmar). No encounters.
// NPC ids: innkeeper (the Seventh Date), merchant (G45 Stoneweather Cloak), oldDunmar (wagon, lab-creature keys), guildMaster (Duneclaw quest), redScholar (G34 quest), r1 r2 r3. The ribArch is the stair down to the Bone Maze.
(function () {
  const { R, E, P, L } = World.shapes, props = [];
  for (let i = 0; i < 14; i++) { const a = i / 14 * 6.28; props.push([i % 2 ? "palm1" : "palm2", 560 + Math.cos(a) * 270, 560 + Math.sin(a) * 175 + 20]); }
  World.def("amberWells", {
    name: "Amber Wells", w: 1800, h: 1200, music: "oasis", rim: 44, base: "sand",
    look: "A large desert oasis town: a central pool of clear dark-green water ringed by grass and palms, packed orange-brick streets and plazas, market squares, orange tiled courtyards. Warm and busy.",
    legend: { paved: "orange-red brick paving and terracotta flagstones", grass: "lush green grass and damp earth around the oasis pool", water: "clear dark green oasis water", road: "a dirt road out of town", sand: "sandy ground between streets", rock: "town wall top and rock, dark" },
    guide: [
      ["paved", R(100, 100, 1600, 1000)], ["sand", R(100, 900, 400, 200)], ["sand", R(1400, 100, 300, 160)],
      ["grass", E(560, 560, 330, 215)], ["water", E(560, 560, 200, 125)], ["road", L([[900, 1200], [900, 1000]], 100)],
      ["road", L([[900, 1000], [900, 700], [1250, 700]], 40)],
    ],
    entries: { start: { x: 900, y: 1100, face: "up" }, from_basin: { x: 900, y: 1120, face: "up" }, from_boneMaze: { x: 1390, y: 330, face: "down" } },
    exits: [
      { rect: [850, 1150, 100, 46], to: "amberBasin", entry: "from_amberWells", push: [0, -1] },
      { rect: [1356, 296, 70, 30], to: "boneMaze", entry: "from_wells", push: [0, 1] },
    ],
    props: props.concat([
      ["guildHall", 1100, 400], ["amberHouse", 300, 300], ["amberDomeHouse", 480, 280], ["amberHouse", 1480, 640], ["amberDomeHouse", 1280, 680], ["amberHouse", 1580, 900], ["guildHall", 1300, 960], ["amberHouse", 320, 1000], ["amberDomeHouse", 560, 1050],
      ["amberStall", 800, 820], ["amberStall", 700, 900], ["amberStall", 1000, 860], ["dateCrate", 780, 880], ["dateCrate", 1040, 900], ["terracottaJars", 880, 900], ["terracottaJars", 1160, 800],
      ["menagerieWagon", 1150, 780], ["hayBales", 1060, 760], ["amberWell", 960, 560], ["amberWell", 1450, 240, {}], ["ribArch", 1390, 292, { dy: -50 }],
      ["lampPost", 840, 1000], ["lampPost", 960, 1000], ["trough", 1300, 820], ["camel", 1480, 820], ["camel", 200, 800], ["cart", 250, 880], ["tent", 180, 980],
      ["reedInnPlaceholder", 0, 0],
    ].filter(p => p[0] !== "reedInnPlaceholder")),
    scatter: [{ keys: [["palm1", 1], ["palm2", 1], ["marigold", 2], ["agave", 1], ["jars", 1], ["dateCrate", 1]], n: 30, on: ["grass", "paved"], seed: 21 }, { keys: [["grass", 2], ["shrub", 1], ["cactus", 1], ["sandBoulder", 1]], n: 22, on: ["sand"], seed: 22 }],
    npcs: [
      { id: "innkeeper", art: "innkeeper", name: "Innkeeper", x: 300, y: 350 },
      { id: "merchant", art: "merchant", name: "Merchant", x: 800, y: 870 },
      { id: "oldDunmar", art: "npcDunmar", name: "Old Dunmar", x: 1110, y: 830 },
      { id: "guildMaster", art: "npcTrader", name: "Guild Master", x: 1100, y: 450 },
      { id: "redScholar", art: "npcRedScholar", name: "Red Scholar", x: 700, y: 1000 },
      { id: "r1", art: "npcVillagerF", name: "Villager", x: 960, y: 700 },
      { id: "r2", art: "npcDockhand", name: "Labourer", x: 1480, y: 700 },
      { id: "r3", art: "npcGranny", name: "Old woman", x: 330, y: 880 },
      { id: null, art: "npcVillagerM", x: 700, y: 760, path: [[240, 760], [500, 780], [640, 800]], speed: 24 },
      { id: null, art: "npcChild", x: 960, y: 640, path: [[880, 640], [1200, 640], [1200, 740], [880, 740]], loop: true, speed: 40 },
      { id: null, art: "npcTraveler", x: 1300, y: 1060, path: [[1000, 1060], [1500, 1060]], speed: 22 },
    ],
    amb: { birds: 4, butterflies: [[430, 560], [700, 600], [560, 440], [900, 520], [600, 700]], dust: 0xf0d090, motes: 44, tint: [0x4a2a2a, 0.12] },
  });
})();
