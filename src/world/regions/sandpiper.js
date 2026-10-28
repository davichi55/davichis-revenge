// R1 Sandpiper Rest: shaded caravanserai town. No encounters. NPC ids: innkeeper, merchant (sells G41 Wayfarer's Road Kit), r1 r2 r3.
(function () {
  const { R, E, P, L } = World.shapes;
  World.def("sandpiperRest", {
    name: "Sandpiper Rest", w: 1300, h: 860, music: "town", rim: 40,
    look: "A walled desert caravanserai seen from above: a big courtyard of packed earth and worn flagstones around a stone well, low mud-brick walls, hay, tents. Warm evening light.",
    legend: { floor: "packed earth and worn sandstone flagstones courtyard with trampled straw", wall: "low mud-brick wall top with a stone footing", road: "a worn caravan road", rock: "dark rocky ground" },
    guide: [
      ["road", L([[650, 860], [650, 640]], 120)], ["floor", R(290, 200, 720, 450)],
      ["wall", R(250, 170, 790, 28)], ["wall", R(250, 170, 28, 500)], ["wall", R(1012, 170, 28, 500)], ["wall", R(250, 646, 340, 28)], ["wall", R(710, 646, 330, 28)],
    ],
    entries: { start: { x: 650, y: 760, face: "up" }, from_dunes: { x: 650, y: 760, face: "up" } },
    exits: [{ rect: [600, 810, 100, 40], to: "whisperglassDunes", entry: "from_sandpiper", push: [0, -1] }],
    props: [
      ["reedInn", 520, 330], ["tent", 860, 330], ["tent", 960, 440], ["tent", 380, 470], ["cart", 790, 560], ["cart", 380, 590], ["trough", 560, 580], ["hayBales", 930, 560], ["hayBales", 320, 340],
      ["well", 650, 480], ["campfire", 790, 450], ["camel", 900, 600], ["camel", 340, 540], ["reedFence", 230, 700], ["reedFence", 330, 720], ["reedFence", 960, 710], ["reedFence", 1060, 700],
      ["tent", 160, 400], ["tent", 1140, 380], ["camel", 1140, 560], ["hayBales", 150, 560], ["deadTree", 1180, 240], ["deadTree", 120, 250], ["campfire", 210, 520, {}],
      ["reedFence", 280, 640, { flip: true }], ["lampPost", 590, 700], ["lampPost", 710, 700],
    ],
    scatter: [{ keys: [["grass", 4], ["grass2", 4], ["bones", 1], ["skull", 1], ["sandBoulder", 1], ["cactus", 1]], n: 40, seed: 4 }],
    npcs: [
      { id: "innkeeper", art: "innkeeper", name: "Innkeeper", x: 520, y: 372 },
      { id: "merchant", art: "npcTrader", name: "Trader", x: 760, y: 596 },
      { id: "r1", art: "npcTraveler", name: "Traveller", x: 800, y: 480 },
      { id: "r2", art: "npcGranny", name: "Old woman", x: 420, y: 520 },
      { id: "r3", art: "npcLegionGuard", name: "Soldier", x: 940, y: 520 },
      { id: null, art: "npcChild", x: 600, y: 440, path: [[600, 520], [720, 520], [720, 440], [600, 440]], loop: true, speed: 40 },
      { id: null, art: "npcVillagerM", x: 300, y: 400, path: [[300, 420], [300, 600]], speed: 20 },
    ],
    amb: { birds: 2, water: false, motes: 40, dust: 0xf0d8a0, butterflies: [[650, 470]], tint: [0x5a3028, 0.14] },
  });
})();
