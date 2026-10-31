// CH1-EXPAND: Sandpiper Oasis (east of Sandpiper Rest): palm ponds, reed beds, a small waiting camp, goat pen. Table "dunes" 40 s. Gather pearlMussels (River Pearls), chest oasisChest, quest NPC reedKeeper (3 Glass Adders).
// Entries: start / from_sandpiper (W), from_dunes (S), from_glassRidges (E). Exits: sandpiperRest@from_oasisOutskirts, whisperglassDunes@from_oasisOutskirts, glassRidges@from_oasisOutskirts.
(function () {
  const { R, E, P, L } = World.shapes, K = World.kitM2, W = 2700, H = 1800;
  const ponds = [[1000, 800, 260, 150], [1700, 1100, 220, 130], [2150, 560, 170, 100]];
  const pondPts = ponds.map(([x, y, rx, ry], i) => K.blobPts(x, y, rx, ry, 1500 + i, { jag: 0.12 }));
  const green = [K.blobPts(1000, 800, 440, 300, 1511, { jag: 0.12 }), K.blobPts(1700, 1100, 400, 270, 1512, { jag: 0.12 }), K.blobPts(2150, 560, 330, 230, 1513, { jag: 0.12 })];
  const rocks = [K.blobPts(2450, 1500, 300, 200, 1521, { jag: 0.14 }), K.blobPts(300, 1450, 280, 200, 1522, { jag: 0.14 }), K.blobPts(560, 260, 300, 160, 1523, { jag: 0.14 }), K.blobPts(1500, 260, 260, 130, 1524, { jag: 0.14 })];
  const reeds = [], palms = [];
  ponds.forEach(([x, y, rx, ry], i) => { for (let a = 0.2; a < 6.28; a += 0.5) reeds.push(["reeds", x + Math.cos(a) * rx * 0.95, y + Math.sin(a) * ry * 0.95 + 8]); for (let a = 0.4 + i; a < 6.28; a += 0.95) palms.push([a % 2 > 1 ? "palm1" : "palm2", x + Math.cos(a) * (rx + 70), y + Math.sin(a) * (ry + 50) + 20]); });
  const def = {
    name: "Sandpiper Oasis", ground: "assets/regions/oasisOutskirts.jpg", w: W, h: H, music: "oasis", rim: 40,
    look: "A desert oasis seen from above: golden sand, patches of green grass and damp dark earth around three small ponds of dark green water ringed with reeds and date palms, red-brown rock outcrops, a worn caravan track, a small camp of tents and a goat pen. Warm evening light.",
    legend: { sand: "golden desert sand with ripples", grass: "green grass and damp dark earth around oasis ponds", water: "dark green oasis pond water", shallow: "shallow clear water at the pond edge", road: "a worn dirt caravan track", rock: "dark red-brown rock outcrops" },
    guide: [
      ...green.map(p => ["grass", P(p)]), ...ponds.map(([x, y, rx, ry]) => ["shallow", E(x, y, rx + 28, ry + 22)]), ...pondPts.map(p => ["water", P(p)]),
      ["road", L([[60, 840], [500, 860], [1000, 1180], [1500, 1280], [1700, 1500], [1560, 1760]], 56)], ["road", L([[1500, 1280], [2000, 1000], [2300, 820], [2680, 800]], 54)], ["road", L([[500, 860], [700, 500], [1000, 300]], 48)],
      ...rocks.map(p => ["rock", P(p)]),
    ],
    entries: { start: { x: 160, y: 840, face: "right" }, from_sandpiper: { x: 160, y: 840, face: "right" }, from_dunes: { x: 1560, y: 1650, face: "up" }, from_glassRidges: { x: 2600, y: 800, face: "left" } },
    exits: [
      { rect: [40, 780, 56, 120], to: "sandpiperRest", entry: "from_oasisOutskirts", push: [1, 0] },
      { rect: [1500, 1710, 130, 50], to: "whisperglassDunes", entry: "from_oasisOutskirts", push: [0, -1] },
      { rect: [2604, 740, 56, 120], to: "glassRidges", entry: "from_oasisOutskirts", push: [-1, 0] },
    ],
    triggers: [{ id: "duskWhisperer", rect: [1900, 1400, 160, 120], once: false, when: "dunes.dusk" }],
    chests: [{ id: "oasisChest", x: 2330, y: 1210 }],
    gather: [{ id: "pearlMussels", x: 1100, y: 960, label: "Mussels in the shallows", color: "gold" }],
    npcs: [
      { id: "reedKeeper", art: "npcFisher", name: "Reed keeper", x: 760, y: 1010 },
      { id: null, art: "npcFarmer", x: 1300, y: 640, path: [[1300, 640], [1500, 700], [1400, 560]], speed: 14, loop: true },
      { id: null, art: "npcChild", x: 1850, y: 800, path: [[1850, 800], [2000, 860], [1900, 740]], speed: 22, loop: true },
    ],
    props: [
      ...reeds, ...palms,
      ["tent", 600, 1150, {}], ["tent", 700, 1230, {}], ["campfire", 660, 1190, {}], ["hayBales", 540, 1230], ["trough", 800, 1180], ["reedFence", 1960, 1320], ["reedFence", 2060, 1320], ["reedFence", 2160, 1320], ["camel", 1440, 1420], ["camel", 2040, 1260],
      ["cairn", 140, 780], ["cairn", 2600, 750], ["camelBones", 1180, 1500], ["deadTree", 400, 560],
    ],
    scatter: [
      { keys: [["marigold", 2], ["shrub", 2], ["grass", 3], ["grass2", 3]], n: 100, on: ["grass"], seed: 1501 },
      { keys: [["grass", 3], ["grass2", 3], ["bones", 1], ["cactus", 1], ["agave", 1], ["sandBoulder", 1]], n: 120, seed: 1502 },
    ],
    encounter: { table: "dunes", rate: 40 },
    amb: { birds: 6, water: true, dust: 0xf0d8a0, motes: 60, tint: [0x4a2a3a, 0.12], butterflies: K.flies(W, H, 5, 1503) },
  };
  World.def("oasisOutskirts", def);
})();
