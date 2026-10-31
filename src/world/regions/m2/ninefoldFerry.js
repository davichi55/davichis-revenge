// R3 Ninefold Ferry (M2 spec 3.5): nine brown rivers crossing a market town of timber and awnings, ferries, hanging fish. No fights. Inn: the Ninth Ferry.
// Entries: start, from_siltRiver (W), from_greenmawJungle (N dock), inn. Exits: siltRiver@from_ninefoldFerry (W), greenmawJungle@from_ninefoldFerry (N dock, need ch3.kessa1).
// Triggers ninefoldArrive (west bridge), kessaDuel (market square). NPCs innkeeper merchant tahlen r1 ferryman r2 stall-woman r3 boy on the dock.
(function () {
  const { R, E, P, L } = World.shapes, K = World.kitM2, W = 1500, H = 1000;
  const r1 = K.ribbonPts(K.wob([[400, 0], [360, 300], [430, 600], [380, 1000]], 16, 301, 90), 120, 120), r2 = K.ribbonPts(K.wob([[1100, 0], [1060, 400], [1130, 700], [1080, 1000]], 16, 302, 90), 130, 130);
  const def = {
    name: "Ninefold Ferry", ground: "assets/regions/ninefoldFerry.jpg", w: W, h: H, music: "river", rim: 40, base: "ash",
    look: "A busy timber market town where nine slow brown rivers cross, seen from above: trampled mud streets with plank walkways, wooden bridges over brown channels, striped market awnings, boat landings and rafts, crates, nets and hanging fish, warm dusk light. Earthy browns, greens and the odd red awning.",
    legend: { ash: "trampled brown mud street with plank stepping stones, straw and puddles", road: "packed muddy road with cart ruts", floor: "weathered timber plank walkway, bridge or dock", water: "slow brown river channel with ripples and floating leaves", rock: "dense dark green jungle thicket seen from above" },
    guide: [
      ["water", P(r1)], ["water", P(r2)], ["water", R(0, 0, W, 130)],
      ["road", L(K.wob([[40, 600], [250, 590], [700, 580], [1100, 600], [1460, 570]], 10, 311, 100), 100)], ["road", E(700, 580, 240, 150)], ["floor", L([[700, 480], [700, 90]], 110)], ["floor", R(620, 40, 160, 120)],
      ["floor", R(300, 540, 210, 110)], ["floor", R(1000, 540, 240, 110)], ["road", L([[700, 680], [700, 900]], 90)], ["floor", L([[140, 600], [140, 700]], 60)],
      ["floor", R(500, 120, 90, 14)],
    ],
    entries: { start: { x: 150, y: 600, face: "right" }, from_siltRiver: { x: 150, y: 600, face: "right" }, from_greenmawJungle: { x: 700, y: 230, face: "down" }, inn: { x: 190, y: 400, face: "down" } },
    exits: [
      { rect: [20, 550, 60, 100], to: "siltRiver", entry: "from_ninefoldFerry", push: [-1, 0] },
      { rect: [650, 30, 100, 56], to: "greenmawJungle", entry: "from_ninefoldFerry", push: [0, -1], floor: "floor", need: "ch3.kessa1", blocked: "ninefoldDockBlocked" },
    ],
    triggers: [{ id: "ninefoldArrive", rect: [130, 540, 90, 120] }, { id: "kessaDuel", rect: [640, 540, 120, 90], when: "ch3.ninefold" }],
    npcs: [
      { id: "innkeeper", art: "innkeeper", name: "Innkeeper", x: 220, y: 440 },
      { id: "merchant", art: "npcTrader", name: "Ferry merchant", x: 560, y: 470 },
      { id: "tahlen", art: "npcTahlen", name: "Tahlen Orrow", x: 800, y: 455 },
      { id: "r1", art: "npcFerryman", name: "Ferryman", x: 600, y: 190 },
      { id: "r2", art: "npcStallWoman", name: "Stall-woman", x: 880, y: 640 },
      { id: "r3", art: "npcFerryBoy", name: "Boy on the dock", x: 790, y: 200 },
      { id: null, art: "npcVillagerM", x: 500, y: 700, path: [[480, 760], [940, 760]], speed: 22 },
      { id: null, art: "npcDockhand", x: 1300, y: 440, path: [[1250, 440], [1380, 440]], speed: 16 },
      { id: null, art: "npcChild", x: 1250, y: 700, path: [[1200, 760], [1400, 760], [1400, 840]], loop: true, speed: 30 },
    ],
    props: [
      ["m2_ferryInn", 200, 380], ["m2_riverHouseA", 120, 840], ["m2_riverHouseB", 270, 860], ["m2_riverHouseC", 130, 220], ["m2_hangingFish", 300, 470], ["m2_cargoBales", 80, 480],
      ["m2_riverWarehouse", 590, 360], ["m2_riverHouseC", 880, 340], ["m2_eelStall", 800, 480], ["m2_marketStall", 560, 700], ["m2_marketStall", 840, 700], ["m2_fruitCrates", 640, 720], ["m2_paintedSign", 520, 640], ["m2_riverLamp", 610, 520], ["m2_riverLamp", 800, 640],
      ["m2_riverHouseB", 1220, 330], ["m2_riverHouseA", 1370, 340], ["m2_riverWarehouse", 1260, 880], ["m2_ferryHoist", 1380, 700], ["m2_hangingFish", 1190, 460], ["m2_boatHull", 960, 900], ["m2_cargoBales", 980, 440],
      ["m2_dockPosts", 640, 150], ["m2_dockPosts", 770, 150], ["m2_ferryRaft", 560, 90, { solid: false }], ["m2_ferryRaft", 880, 100, { solid: false, flip: true }], ["m2_riverLamp", 640, 280], ["m2_riverLamp", 760, 280], ["m2_boatHull", 380, 810, { solid: false, scale: 0.7 }], ["m2_ferryRaft", 1090, 880, { solid: false }],
      ["m2_riverLamp", 140, 540], ["m2_riverLamp", 1250, 540], ["m2_hen", 700, 800, { solid: false }], ["m2_capybara", 200, 940, { solid: false }], ["m2_heron", 470, 940, { solid: false }],
    ],
    lights: [[200, 420, 150, 0.5], [700, 580, 200, 0.4], [700, 200, 140, 0.4]],
    amb: { birds: 4, water: true, dust: 0xc8b898, motes: 24, tint: [0x2a2a40, 0.16], warm: [0xff9a60, 0.08], dusk: true, butterflies: [] },
  };
  const trees = ["m2_mangrove", "m2_jungleTreeB", ["m2_jungleTreeA", 2], "m2_fanPalm", "m2_bananaTree", "m2_jungleTreeSlim"], at = K.terrainAt(def);
  def.props = def.props.concat(
    K.blockedFill(def, 100, trees, { seed: 331, skip: (x, y) => at(x, y) === "water" && y < 150 }),
    K.fill([60, 160, W - 120, H - 200], 140, [["m2_mudReeds", 2], ["m2_fernClump", 1], ["m2_netPile", 0.3]], { seed: 332, chance: 0.4, opts: { solid: false, shadow: false }, skip: (x, y) => at(x, y) !== "ash" }));
  World.def("ninefoldFerry", def);
})();
