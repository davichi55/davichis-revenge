// R2 Hollow of the Sky-Stone: builder ruin, the Dune Bearer's chamber (T1). Outside = field tent camp (no fights); inside = table "hollow" ~22 s.
// Triggers: duneBearer (the chamber), skyStoneLore reachable via NPC skyShardLore. NPC campKeeper rests you at the tent (no healing mid-dungeon).
(function () {
  const { R, E, P, L } = World.shapes;
  World.def("hollowSkyStone", {
    name: "Hollow of the Sky-Stone", w: 1500, h: 1000, music: "ruins", rim: 40, base: "rock",
    note: "IMPORTANT: every pure black area in image 1 is solid black builder-stone (walls and rubble, painted dark charcoal, NOT sand); the black-gold halls are the light grey-beige corridors and rooms; only the tan area at the bottom is sand with a few tents.", look: "Ancient builder ruins from above: smooth black stone halls with thin glowing gold light-lines, a great circular chamber at the end with a pale glowing stone, rough desert sand outside with a small tent camp. Mysterious.",
    legend: { floor: "smooth dark black stone floor with thin glowing gold light-line inlays", sand: "desert sand", rock: "black builder stone walls and rough rock", road: "a faint trail in the sand", paved: "a circular dais of black stone with gold inlay" },
    guide: [
      ["road", L([[750, 1000], [750, 800]], 90)], ["sand", R(100, 720, 1300, 240)],
      ["floor", R(560, 560, 380, 160)], ["floor", L([[750, 560], [750, 420]], 80)], ["floor", R(300, 380, 900, 100)], ["floor", L([[360, 430], [360, 250]], 80)], ["floor", L([[1140, 430], [1140, 250]], 80)],
      ["floor", R(240, 150, 240, 140)], ["floor", R(1020, 150, 240, 140)], ["paved", E(750, 220, 270, 150)], ["floor", L([[480, 220], [620, 220]], 70)], ["floor", L([[880, 220], [1020, 220]], 70)],
    ],
    dark: { ambient: 0.62, radius: 220, fireRadius: 150 },
    entries: { start: { x: 750, y: 920, face: "up" }, from_basin: { x: 750, y: 920, face: "up" } },
    exits: [{ rect: [700, 950, 100, 46], to: "amberBasin", entry: "from_hollow", push: [0, -1] }],
    triggers: [{ id: "duneBearer", rect: [660, 300, 180, 60] }, { id: "hollowDoor", rect: [690, 700, 120, 36] }],
    chests: [{ id: "hollowLoreChest", x: 330, y: 270, show: "ch2.bearerDone" }],
    npcs: [
      { id: "campKeeper", art: "npcTraveler", name: "Camp keeper", x: 560, y: 840 },
      { id: "skyShardLore", art: "skyStoneShard", name: "Sky-stone shard", x: 1130, y: 270, show: "ch2.bearerDone", hint: "E / Space: study the shard", scale: 0.8 },
    ],
    props: [
      ["tent", 640, 800], ["campfire", 760, 840], ["tent", 900, 800], ["hayBales", 480, 880], ["camel", 1000, 870], ["builderDoor", 750, 700, { dy: -30, solid: [70, 12] }],
      ["builderPillar", 590, 640], ["builderPillar", 910, 640], ["lightStele", 640, 600], ["lightStele", 860, 600], ["builderPillar", 340, 480], ["builderPillar", 1160, 480], ["lightStele", 480, 450], ["lightStele", 1020, 450],
      ["builderPillar", 560, 190], ["builderPillar", 940, 190], ["lightStele", 540, 300], ["lightStele", 960, 300], ["skyStoneShard", 750, 215, { scale: 1.1 }], ["builderConduit", 330, 200], ["vaultRubble", 1100, 190], ["poolStatue", 1140, 340, {}], ["sluiceWheel", 280, 330], ["vaultRubble", 1220, 450],
      ["deadTree", 200, 840], ["cairn", 1220, 870], ["camelBones", 330, 780], ["sandBoulder", 1300, 800],
    ],
    scatter: [{ keys: [["grass", 3], ["sandBoulder", 1], ["bones", 1], ["cactus", 1]], n: 22, on: ["sand"], seed: 71 }, { keys: [["vaultRubble", 2], ["glassShard", 1]], n: 12, on: ["floor"], seed: 72 }],
    lights: [[750, 215, 160, 0.9], [750, 700, 120, 0.7]],
    encounter: { zones: [{ rect: [0, 0, 1500, 700], table: "hollow", rate: 22 }, { rect: [0, 700, 1500, 300], table: null, rate: 0 }] },
    amb: { motes: 36, tint: [0x181830, 0.2], warm: null, dust: 0xe0d8c0, water: false, sparkle: { terrain: ["paved", "floor"], color: 0xffe9a0, rate: 4 } },
  });
})();
