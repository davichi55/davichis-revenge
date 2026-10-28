// R2 Cinderglass Flats: scorched glass plain with fire-pits. Table "flats" ~25 s. Chest g12_cinderSerpentPit (G12).
// Gathering spots: cinderglassEmber1/2 (Cinderglass Ember), cinderPlume1/2 (Cinder Plume). A hidden pool (lore) sits north-east.
(function () {
  const { R, E, P, L } = World.shapes;
  World.def("cinderglassFlats", {
    name: "Cinderglass Flats", w: 1700, h: 1100, base: "ash", music: "desert", rim: 40,
    look: "A scorched volcanic plain from above: dark ash and cinder ground with glowing orange cracks, black glass patches, fire pits ringed in black stone, steam, charred ground. Hot red-orange glow.",
    legend: { ash: "dark grey-brown ash and cinder ground with glowing orange cracks", glass: "shiny black and orange volcanic glass sheets", rock: "black obsidian rock and fire pits, impassable", road: "a path of trampled grey ash", shallow: "a still hidden pool of teal water", water: "dark pool water", grass: "a few unburnt green tufts around the pool" },
    guide: [
      ["glass", E(500, 300, 260, 120)], ["glass", E(1050, 780, 300, 140)], ["glass", E(1350, 300, 180, 90)], ["glass", E(380, 800, 200, 110)],
      ["road", L([[60, 560], [450, 560], [800, 540], [1200, 560], [1500, 480]], 64)],
      ["rock", E(700, 300, 90, 60)], ["rock", E(1000, 330, 80, 50)], ["rock", E(800, 780, 90, 55)], ["rock", E(1300, 680, 80, 60)], ["rock", E(520, 650, 70, 45)], ["rock", E(1150, 180, 100, 50)],
      ["rock", P([[250, 150], [420, 120], [470, 220], [330, 250]])], ["rock", P([[1450, 800], [1620, 760], [1640, 920], [1500, 960]])], ["rock", P([[150, 900], [330, 880], [380, 990], [200, 1020]])], ["rock", P([[900, 960], [1100, 940], [1180, 1030], [960, 1050]])],
      ["grass", E(1550, 250, 100, 70)], ["shallow", E(1550, 250, 70, 45)], ["water", E(1550, 250, 38, 22)],
    ],
    entries: { start: { x: 160, y: 560, face: "right" }, from_basin: { x: 160, y: 560, face: "right" } },
    exits: [{ rect: [40, 500, 60, 120], to: "amberBasin", entry: "from_flats", push: [1, 0] }],
    chests: [{ id: "g12_cinderSerpentPit", x: 1370, y: 480 }],
    gather: [
      { id: "cinderglassEmber1", x: 600, y: 430, label: "gather Cinderglass Ember", color: "gold" }, { id: "cinderglassEmber2", x: 1100, y: 880, label: "gather Cinderglass Ember", color: "gold" },
      { id: "cinderPlume1", x: 420, y: 880, label: "gather Cinder Plume", color: "blue" }, { id: "cinderPlume2", x: 1240, y: 240, label: "gather Cinder Plume", color: "blue" },
    ],
    props: [
      ["firePit", 700, 300], ["firePit", 1000, 330], ["firePit", 800, 780], ["firePit", 1300, 680], ["firePit", 520, 650], ["obsidianSpike", 1150, 180], ["obsidianSpike", 340, 200], ["obsidianSpike", 1540, 880], ["ashBrazier", 300, 520], ["ashBrazier", 300, 610],
      ["steamVent", 640, 560], ["steamVent", 1180, 600], ["hornSkull", 900, 560], ["burntTree", 460, 400], ["burntTree", 1400, 380], ["burntTree", 1050, 960], ["slagPile", 760, 430], ["glassCluster", 600, 780],
      ["reeds", 1500, 270], ["reeds", 1610, 280], ["reeds", 1560, 320],
    ],
    scatter: [
      { keys: [["obsidianSpike", 1], ["glassCluster", 3], ["slagPile", 2], ["burntTree", 2], ["steamVent", 1]], n: 55, seed: 41 },
      { keys: [["bones", 2], ["skull", 1], ["ribs", 1], ["glassShard", 4]], n: 60, seed: 42 },
    ],
    encounter: { table: "flats", rate: 25 },
    amb: { birds: 0, water: true, dust: 0xffa060, motes: 64, tint: [0x601810, 0.2], warm: [0xff7030, 0.07], smoke: [[640, 560, 0x998877], [1180, 600, 0x998877]], sparkle: { terrain: ["glass"], color: 0xffb070, rate: 8 } },
  });
})();
