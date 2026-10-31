// R3 Tamar's Landing (M2 spec 3.2): a smuggler village on stilts over the mudflats at dusk. No fights. Inn: the Net and Lantern.
// Entries: start, from_shore, inn. Exit: creepingShore@from_tamarsLanding (south walkway). Trigger landingArrive. NPCs: innkeeper merchant oldDunmar oma r1 r2 r3 child.
(function () {
  const { R, E, P, L } = World.shapes, K = World.kitM2, W = 1500, H = 1000;
  const def = {
    name: "Tamar's Landing", ground: "assets/regions/tamarsLanding.jpg", w: W, h: H, music: "shore", rim: 40, base: "water",
    look: "A smuggler village built on stilts over grey-brown tidal mudflats at dusk, seen from above: weathered plank platforms joined by narrow boardwalks and rope bridges, wet glossy mud with reeds, mangrove roots and shallow brown pools all around, a few moored boats, warm lantern glow on the planks. Moody dusk, muted browns and greens with orange lantern light.",
    legend: { water: "glossy grey-brown tidal mud and shallow brown water with reeds, mangrove roots, worm trails and small boats' ripples", floor: "weathered wooden plank boardwalk and platform floor with nail heads, rope coils and wet stains", rock: "dense dark mangrove thicket seen from above" },
    guide: [
      ["floor", L([[750, 1000], [750, 770]], 110)], ["floor", E(750, 650, 290, 160)], ["floor", R(110, 400, 410, 330)], ["floor", R(980, 400, 410, 330)],
      ["floor", L([[750, 520], [750, 150]], 120)], ["floor", R(580, 90, 340, 190)],
      ["floor", L([[300, 410], [300, 300]], 80)], ["floor", R(150, 150, 300, 170)], ["floor", L([[1200, 410], [1200, 300]], 80)], ["floor", R(1060, 150, 300, 170)],
      ["floor", L([[420, 700], [420, 840], [620, 860]], 80)], ["floor", R(180, 830, 250, 130)],
    ],
    entries: { start: { x: 750, y: 930, face: "up" }, from_shore: { x: 750, y: 930, face: "up" }, inn: { x: 300, y: 650, face: "down" } },
    exits: [{ rect: [690, 940, 120, 56], to: "creepingShore", entry: "from_tamarsLanding", push: [0, 1], floor: "floor" }],
    triggers: [{ id: "landingArrive", rect: [690, 830, 120, 70] }, { id: "boatToSehkarem", rect: [250, 880, 150, 70], show: "ch4.done" }],
    npcs: [
      { id: "innkeeper", art: "innkeeper", name: "Innkeeper", x: 330, y: 600 },
      { id: "merchant", art: "npcTrader", name: "Smuggler", x: 1180, y: 600 },
      { id: "oldDunmar", art: "npcDunmar", name: "Old Dunmar", x: 830, y: 205 },
      { id: "oma", art: "npcOma", name: "Oma Wren", x: 700, y: 560 },
      { id: "r1", art: "npcFisher", name: "Fisher", x: 470, y: 650 },
      { id: "r2", art: "npcNetMender", name: "Net-mender", x: 300, y: 270 },
      { id: "r3", art: "npcFerryBoy", name: "Ferry boy", x: 1215, y: 245 },
      { id: "child", art: "npcPip", name: "Pip", x: 1000, y: 650 },
      { id: null, art: "npcVillagerF", x: 760, y: 700, path: [[560, 650], [940, 650]], speed: 18 },
      { id: null, art: "npcFisher", x: 750, y: 400, path: [[750, 340], [750, 470]], speed: 14 },
    ],
    props: [
      ["m2_stiltInn", 300, 540], ["m2_stiltHouseA", 190, 480], ["m2_stiltHouseB", 440, 470], ["m2_fishRack", 160, 700], ["m2_netPile", 220, 640], ["m2_waterJars", 470, 710],
      ["m2_stiltStore", 1300, 530], ["m2_stiltHouseC", 1050, 480], ["m2_tarpCrates", 1320, 690], ["m2_fishRack", 1040, 700], ["m2_coveredCage", 1110, 700],
      ["m2_stiltHouseB", 230, 280], ["m2_stiltHouseD", 380, 290], ["m2_clothesLine", 1130, 280], ["m2_stiltHouseA", 1290, 290], ["m2_riverShrine", 250, 910], ["m2_stiltBoat", 340, 960, { solid: false }],
      ["wagon", 760, 240, { hide: "wagon.at=tamarsLanding" }], ["menagerieWagon", 760, 240, { show: "wagon.at=tamarsLanding" }], ["m2_coveredCage", 640, 250], ["m2_tarpCrates", 880, 120], ["m2_bellPost", 880, 300], ["m2_ropeLamp", 660, 130],
      ["m2_ropeLamp", 640, 700], ["m2_ropeLamp", 860, 700], ["m2_ropeLamp", 690, 880], ["m2_ropeLamp", 810, 880], ["m2_ropeLamp", 580, 420], ["m2_ropeLamp", 920, 420], ["m2_ropeLamp", 480, 600], ["m2_ropeLamp", 1010, 600],
      ["m2_lanternBuoy", 80, 300, { solid: false }], ["m2_mudBoat", 100, 560, { solid: false }], ["m2_stiltBoat", 1450, 560, { solid: false, flip: true }], ["m2_mudBoat", 1430, 860, { solid: false }], ["m2_beachedBoat", 1000, 880, { solid: false }],
      ["m2_crabBasket", 690, 650], ["m2_hen", 770, 610, { solid: false }], ["m2_hen", 735, 625, { solid: false }], ["m2_signalPole", 700, 960],
    ],
    lights: [[300, 560, 150, 0.5], [1180, 540, 150, 0.5], [750, 650, 200, 0.4]],
    amb: { birds: 3, water: true, dust: 0xc8b898, motes: 26, tint: [0x2a2a40, 0.18], warm: [0xff8a50, 0.09], dusk: true, butterflies: [] },
  };
  const trees = ["m2_mangrove", "m2_mangroveRoots", ["m2_deadSnag", 0.4]];
  const at = K.terrainAt(def);
  def.props = def.props.concat(
    K.fill([0, 0, W, H], 150, [["m2_mudReeds", 3], ["m2_mangroveRoots", 1], ["m2_tidalRock", 1], ["m2_crabBasket", 0.2]], { seed: 7, chance: 0.55, opts: { solid: false, shadow: false }, skip: (x, y) => at(x, y) !== "water" || x < 60 || y < 60 || x > W - 60 || y > H - 40 }),
    K.border(W, H, 110, trees, { seed: 8, band: 70, layers: 1, gaps: [[690, 940, 120, 56]], topPad: 20 }));
  World.def("tamarsLanding", def);
})();
