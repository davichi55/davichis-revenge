// M3 / ch5-6: the Weeping Sea (boat mode, 5200x3600). Needs flag `ship`. Docks are normal exits on water next to a pier prop; entries are 80+ px away from their dock rect.
// DOCK REGISTER (M3 docks built here): saltgate NW coast, brassHarbour SW coast, mournsGate W coast mid, gullrest northern island, maelstromCaves the whirlpool N-centre, cinderCrownIsle southern island, tzavan E coast centre, creepingShore SE coast.
// M4/M5 APPEND their docks (entries + exits, small anchored Edit at the markers `//DOCKS-ENTRIES` and `//DOCKS-EXITS`): lowstep E coast north (about 4700,900), paleGate E coast south of Tzavan (about 4700,2350), saltmereCamp NW salt marsh, starhaven NE behind the storm belt, diving-bell trigger mid-east (post).
// Tables: seaOpen (rate 55), zone straits (around the whirlpool, rate 50), patrolGalley (amb.ships). Legend L5. Chest sunkenShipChest (sunken builder ship in the Straits).
(function () {
  const { R, E, P, L } = World.shapes, M = World.m3, props = [], free = { solid: false };
  // piers: posts, lamp, crates and a moored boat at every M3 dock (pier props stand on the shallows beside the dock rect)
  const pier = (x, y, dx, flip) => props.push(["m2_dockPosts", x + dx * 0.0, y - 40, free], ["m2_dockPosts", x, y + 40, free], ["pierLamp", x + dx * 0.5, y - 60, free], ["crates", x + dx * 0.8, y + 50, free], ["rowboatMoored", x + dx * 1.3, y + 10, Object.assign({ flip: !!flip }, free)], ["bollards", x - dx * 0.4, y, free]);
  pier(400, 490, 60); pier(410, 2960, 60); pier(410, 1710, 60); pier(2300, 700, 0); pier(4790, 1810, -60, true); pier(4780, 3010, -60, true); pier(2300, 2660, 0); pier(4790, 910, -60, true); pier(4790, 2410, -60, true); pier(4790, 370, -60, true); pier(410, 1100, 60); pier(4790, 500, -60, true); pier(3700, 830, 0);
  props.push(["m2_lanternBuoy", 3500, 1800, free], ["m2_lanternBuoy", 3610, 1800, free], ["m2_lanternBuoy", 3550, 1860, free], ["m2_lanternBuoy", 4240, 1250, free], ["m2_lanternBuoy", 4360, 1250, free], ["drownedWreck", 4300, 1330, free]);
  // west coast (Sehkarem, pale): cliffs and a few buildings at Saltgate, Mourn's Gate and Brass Harbour
  props.push(["lighthouse", 330, 380], ["whiteHouse", 250, 520], ["harborHouse", 290, 600], ["bellTower", 270, 1660], ["whiteHouse", 220, 1760], ["harborHouse", 300, 2920], ["craneHoist", 330, 3040], ["dockWarehouse", 200, 2960], ["redMass", 120, 900], ["redMass", 100, 2200], ["redMass", 140, 3300], ["m2_cliffBoulder", 200, 1250], ["m2_cliffBoulder", 190, 2500]);
  // east coast (the jungle coast, dark): Tzavan's white steps and banners, Creeping Shore's stilt houses
  props.push(["m2_jungleTreeA", 5000, 400], ["m2_jungleTreeB", 5080, 900], ["m2_giantCeiba", 5040, 1300], ["m2_jungleTreeA", 5100, 2300], ["m2_jungleTreeB", 5020, 2600], ["m2_giantCeiba", 5080, 3400], ["whiteHouse", 4960, 1700], ["whiteHouse", 4980, 1900], ["m2_stiltHouseA", 4960, 2960], ["m2_stiltHouseB", 4980, 3080], ["m2_mangrove", 4850, 2700]);
  // Gullrest (fishermen's island): lighthouse of hull-planks, nets, huts, bleached ribs
  props.push(["lighthouse", 2400, 430], ["m2_stiltHouseA", 2200, 480], ["m2_stiltHouseC", 2290, 450], ["netRack", 2150, 560], ["fishStall", 2330, 560], ["ribArch", 2000, 500], ["m2_fishRack", 2480, 540], ["m2_driftwood", 2100, 440], ["m2_tidalRock", 1850, 430], ["m2_tidalRock", 2720, 640, { scale: 0.8 }], ["m2_tidalRock", 2150, 290, { scale: 0.7 }]);
  // the Maelstrom: cave mouth on the rock isle, the whirlpool's reef teeth, a sunken builder ship in the Straits
  props.push(["m2_caveMouth", 2800, 1060], ["redMass", 2700, 940], ["redMass", 2900, 930], ["m2_tidalRock", 2560, 1260], ["m2_tidalRock", 3060, 1270], ["m2_tidalRock", 2540, 1620], ["m2_tidalRock", 3080, 1640], ["drownedWreck", 3000, 1500, free], ["drownedCoral", 2930, 1560, free], ["drownedKelp", 3070, 1560, free], ["m2_lanternBuoy", 2800, 1200, free], ["m2_lanternBuoy", 2400, 1500, free], ["m2_lanternBuoy", 3200, 1400, free]);
  // Cinder Crown (southern volcanic island)
  props.push(["spineCrag", 2300, 2820, { scale: 1.6 }], ["obsidianSpike", 2200, 2900], ["obsidianSpike", 2400, 2930], ["steamVent", 2150, 2780, { fire: [0, -20, 0.8] }], ["steamVent", 2450, 2800], ["slagPile", 2100, 2960], ["slagPile", 2520, 3000], ["burntTree", 2000, 3000], ["burntTree", 2600, 3050], ["glassCluster", 2300, 3080], ["ashBrazier", 2300, 2720, { fire: [0, -50, 1], glow: "gold" }]);
  // islets, reefs, wrecks and buoys across the open sea
  props.push(["m2_shipWreck", 1400, 1900, free], ["m2_shipWreck", 3800, 2400, free], ["drownedWreck", 1100, 800, free], ["m2_beachedBoat", 3700, 640], ["m2_tidalRock", 1500, 2290], ["m2_tidalRock", 1560, 2330], ["m2_tidalRock", 1210, 1200], ["m2_tidalRock", 3640, 2610], ["m2_tidalRock", 3760, 2620, { scale: 0.7 }], ["m2_fanPalm", 1200, 1170], ["m2_fanPalm", 3720, 640], ["m2_lanternBuoy", 800, 1000, free], ["m2_lanternBuoy", 1600, 3200, free], ["m2_lanternBuoy", 3900, 1500, free], ["m2_lanternBuoy", 4200, 2900, free], ["drownedKelp", 1000, 2200, free], ["drownedKelp", 3300, 3200, free], ["drownedCoral", 4100, 700, free]);
  World.def("weepingSea", {
    name: "The Weeping Sea", w: 5200, h: 3600, base: "water", boat: true, music: "sea",
    look: "An open grey-green sea seen from above, the whole map: deep water with white wave-caps and wind streaks, pale shallow turquoise bands around the coasts and islands, a pale dry coast on the west edge, a dark jungle coast on the east edge, a rocky island with a vortex of concentric rings (a whirlpool) in the north-centre, a fishermen's island in the north, a black volcanic island in the south, reefs and small sandy islets. Rain-streaked light, melancholy.",
    legend: { water: "deep grey-green sea water with soft wave patterns and white foam flecks", shallow: "pale clear turquoise shallow water over sand, with ripples", sand: "pale dry coast sand, rocky and sun-bleached", red: "red-brown dry hills of the western coast", grass: "dark jungle green of the eastern coast and islets", ash: "black volcanic ash and glowing cracks on the southern island", rock: "black reef rocks and island cliffs breaking the water" },
    bank: { water: "water", shallow: "teal", sand: "sand", red: "red", grass: "green", ash: "ash", rock: "dark" }, grade: { water: { mul: [0.9, 1.45, 1.35], add: [-4, 8, 6] }, shallow: { mul: [0.95, 1.15, 1.1], add: [14, 26, 20] }, sand: { mul: [0.95, 0.95, 0.9], add: [10, 8, 4] }, grass: { mul: [0.55, 0.8, 0.5], add: [-6, 0, -6] }, red: { mul: [0.9, 0.8, 0.75], add: [0, 0, 0] }, _: [0.97, 1.0, 1.02] },
    marks: [{ k: "dot", on: ["water"], n: 160, col: [200, 230, 230], a: 0.5, r: [1, 2], hi: false }, { k: "crack", on: ["water"], n: 90, col: [190, 225, 225], a: 0.4, len: [20, 60] }],
    guide: [
      ["shallow", P([[0, 0], [560, 0], [470, 300], [540, 640], [450, 1000], [520, 1400], [420, 1800], [500, 2200], [410, 2600], [540, 3000], [450, 3300], [520, 3600], [0, 3600]])],
      ["sand", P([[0, 0], [430, 0], [350, 300], [420, 640], [330, 1000], [400, 1400], [300, 1800], [380, 2200], [290, 2600], [420, 3000], [330, 3300], [400, 3600], [0, 3600]])], ["red", P([[0, 0], [220, 0], [180, 1200], [240, 2400], [200, 3600], [0, 3600]])],
      ["shallow", P([[5200, 0], [4620, 0], [4700, 400], [4640, 800], [4700, 1200], [4650, 1600], [4720, 2000], [4640, 2400], [4710, 2800], [4630, 3200], [4700, 3600], [5200, 3600]])],
      ["grass", P([[5200, 0], [4780, 0], [4860, 400], [4760, 800], [4850, 1200], [4800, 1600], [4880, 2000], [4790, 2400], [4870, 2800], [4770, 3200], [4850, 3600], [5200, 3600]])],
      // Gullrest
      ["shallow", E(2300, 520, 420, 250)], ["sand", E(2300, 520, 300, 160)], ["grass", E(2300, 480, 190, 90)],
      // the Maelstrom: rock isle with the cave mouth, whirlpool rings
      ["shallow", E(2800, 1000, 280, 190)], ["rock", E(2800, 960, 190, 120)], ["shallow", E(2800, 1460, 360, 250)], ["water", E(2800, 1460, 250, 170)], ["shallow", E(2800, 1460, 150, 100)], ["water", E(2800, 1460, 70, 48)],
      ["rock", E(2560, 1260, 28, 18)], ["rock", E(3060, 1270, 28, 18)], ["rock", E(2540, 1620, 28, 18)], ["rock", E(3080, 1640, 28, 18)], ["shallow", E(3000, 1500, 150, 90)],
      // Cinder Crown
      ["shallow", E(2300, 2950, 560, 360)], ["sand", E(2300, 2950, 440, 270)], ["ash", E(2300, 2950, 360, 210)], ["rock", E(2300, 2880, 150, 100)],
      // islets and reefs
      ["shallow", E(1200, 1200, 200, 120)], ["sand", E(1200, 1200, 110, 60)], ["shallow", E(1500, 2300, 260, 150)], ["grass", E(1500, 2300, 160, 80)], ["shallow", E(3700, 700, 240, 130)], ["sand", E(3700, 700, 140, 70)], ["shallow", E(3700, 2600, 300, 170)], ["rock", E(3640, 2610, 40, 24)], ["rock", E(3760, 2620, 26, 16)], ["rock", E(1210, 1200, 22, 14)],
      ["shallow", E(1100, 3100, 220, 120)], ["sand", E(1100, 3100, 120, 56)], ["shallow", E(3300, 3250, 240, 120)], ["rock", E(1850, 420, 36, 24)], ["rock", E(2720, 640, 30, 20)], ["rock", E(2150, 290, 26, 18)], ["rock", E(1500, 2290, 30, 20)], ["rock", E(1560, 2330, 24, 16)],
    ],
    entries: {
      start: { x: 640, y: 490, face: "right" }, from_saltgate: { x: 640, y: 490, face: "right" }, from_brassHarbour: { x: 640, y: 2960, face: "right" }, from_mournsGate: { x: 640, y: 1710, face: "right" }, from_gullrest: { x: 2300, y: 880, face: "down" },
      from_maelstromCaves: { x: 2800, y: 1260, face: "down" }, from_cinderCrownIsle: { x: 2300, y: 2520, face: "up" }, from_tzavan: { x: 4540, y: 1810, face: "left" }, from_creepingShore: { x: 4540, y: 3010, face: "left" },
      from_lowstep: { x: 4540, y: 910, face: "left" }, from_paleGate: { x: 4540, y: 2410, face: "left" }, from_rootdeepApproach: { x: 4540, y: 370, face: "left" },   // M4 docks
      //DOCKS-ENTRIES (M4/M5 append here)
      // M5: Saltmere coast (W), Dawnwatch Bastion (E coast north), Starhaven (the NE islet), Lantern Deep trench (centre-east), the diving bell (mid-east)
      from_saltmereCamp: { x: 640, y: 1100, face: "right" }, from_dawnwatchBastion: { x: 4540, y: 500, face: "left" }, from_starhaven: { x: 3700, y: 960, face: "up" }, from_lanternDeep: { x: 3550, y: 1640, face: "down" }, from_drownedCapital: { x: 4300, y: 1100, face: "down" },
    },
    exits: [
      { rect: [440, 430, 90, 120], to: "saltgate", entry: "from_sea", push: [1, 0] }, { rect: [450, 2900, 90, 120], to: "brassHarbour", entry: "from_sea", push: [1, 0] }, { rect: [440, 1650, 90, 120], to: "mournsGate", entry: "from_sea", push: [1, 0] },
      { rect: [2250, 740, 100, 90], to: "gullrest", entry: "from_sea", push: [0, 1] }, { rect: [2750, 1130, 100, 90], to: "maelstromCaves", entry: "from_sea", push: [0, 1] }, { rect: [2250, 2600, 100, 90], to: "cinderCrownIsle", entry: "from_sea", push: [0, -1] },
      { rect: [4660, 1750, 90, 120], to: "tzavan", entry: "from_sea", push: [-1, 0] }, { rect: [4660, 2950, 90, 120], to: "creepingShore", entry: "from_sea", push: [-1, 0] },
      { rect: [4660, 850, 90, 120], to: "lowstep", entry: "from_sea", push: [-1, 0], need: "ch7.start", blocked: "seaLowstepShut" }, { rect: [4660, 2350, 90, 120], to: "paleGate", entry: "from_sea", push: [-1, 0], need: "ch8.start", blocked: "seaPaleGateShut" }, { rect: [4660, 310, 90, 120], to: "rootdeepApproach", entry: "from_sea", push: [-1, 0], need: "ch9.start" },   // M4 docks
      //DOCKS-EXITS (M4/M5 append here)
      // M5 docks
      { rect: [440, 1040, 90, 120], to: "saltmereCamp", entry: "from_sea", push: [1, 0], need: "ch10.start", blocked: "seaSaltmereShut" }, { rect: [4660, 440, 90, 120], to: "dawnwatchBastion", entry: "from_sea", push: [-1, 0], need: "ch11.start" },
      { rect: [3650, 780, 100, 90], to: "starhaven", entry: "from_sea", push: [0, -1], need: "stormSails" }, { rect: [3490, 1740, 120, 120], to: "lanternDeep", entry: "from_sea", push: [0, -1], need: "stormSails", show: "post.start" },
    ],
    chests: [{ id: "sunkenShipChest", x: 3000, y: 1500 }],
    triggers: [{ id: "divingBell", rect: [4240, 1190, 120, 120], show: "post.start", once: false }],   // M5: the diving bell (Story.trigger.divingBell by STORY-M5, then drownedCapital@from_bell)
    legends: [{ id: "L5", enemy: "blackPearlHermit", level: 35, chance: 0.04, spots: [[1800, 480], [2720, 700], [2200, 250]] },
      { id: "L9", enemy: "mawmotherOfTheDeep", level: 80, chance: 0.04, spots: [[3300, 600], [3950, 700], [3900, 1300], [3500, 1250]], when: "stormSails" }],   // M5: Mawmother of the Deep in the storm belt (needs the storm sails)
    props,
    scatter: [{ keys: [["m2_driftwood", 2], ["m2_lanternBuoy", 1], ["m2_tidalRock", 1]], n: 30, on: ["water", "shallow"], seed: 131, opts: { solid: false }, scaleRange: [0.7, 1] }],
    encounter: { table: "seaOpen", rate: 55, zones: [{ rect: [2200, 900, 1300, 800], table: "straits", rate: 50 }] },
    amb: {
      birds: 10, butterflies: [], water: true, motes: 20, tint: [0x203038, 0.1], weather: ["clear", "clear", "saltRain"], night: 0.25,
      ships: [{ id: "patrolTzavan", lane: [[4300, 1500], [4300, 2150], [3800, 2150], [3800, 1500]], mode: "loop", speed: 40, sight: 260, table: "patrolGalley" }, { id: "patrolStraits", lane: [[1900, 1350], [2300, 1350], [2450, 1000], [2300, 1350]], mode: "pingpong", speed: 40, sight: 260, table: "patrolGalley", hide: "ch8.supply" }],
    },
  });
})();
