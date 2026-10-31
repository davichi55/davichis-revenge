// M3 / ch6: the Drowned Fen Shrine (K3). Table "fen" 22 s. Entries start from_kharamRoad. Exit kharamRoad@from_drownedFenShrine.
// Puzzle: press triggers sluice1..4 (E near the wheels, order 3-1-4-2, flags fen.w1..4 and fen.drained), the nave gate opens on fen.drained. Triggers fenGuardian (nave, beyond the gate). Chest g14_chorusOfManyHeads (the drained nave).
(function () {
  const { R, E, P, L } = World.shapes, M = World.m3, props = [], moss = 0xb8d8a8;
  // entry court and the hall of stepping stones: ruined pillars, carved many-headed steles (the order of the wheels is carved: 3, 1, 4, 2)
  props.push(["m2_templeWall", 840, 1230], ["m2_templeWall", 1360, 1230], ["m2_ruinPillar", 960, 1200], ["m2_ruinPillar", 1240, 1200], ["m2_stoneHead", 1100, 1290], ["m2_mossBoulder", 780, 1330], ["m2_mossBoulder", 1430, 1340], ["m2_glowShroomSmall", 1000, 1380], ["m2_glowShroomSmall", 1200, 1390]);
  props.push(...M.ring(["m2_ruinPillar", "m2_templePillar"], 1100, 840, 420, 250, 8, {}, Math.PI * 0.1, Math.PI * 0.9, 0, 3), ...M.ring(["m2_ruinPillar", "m2_templePillar"], 1100, 840, 420, 250, 8, {}, Math.PI * 1.1, Math.PI * 1.9, 0, 4));
  props.push(["drownedStele", 880, 700], ["drownedStele", 1040, 640], ["drownedStele", 1180, 640], ["drownedStele", 1320, 700], ["m2_stoneHead", 1100, 780], ["m2_mossBoulder", 900, 930], ["m2_mossBoulder", 1310, 960], ["m2_rootTangle", 780, 1020], ["m2_rootTangle", 1420, 1040], ["m2_glowShroomBig", 760, 620], ["m2_glowShroomBig", 1440, 620]);
  // four sluice rooms
  props.push(["sluiceWheel", 330, 700], ["m2_ruinWall", 220, 640], ["m2_stoneHead", 470, 650], ["m2_mangrove", 190, 860], ["m2_mudReeds", 420, 900], ["m2_rootTangle", 520, 830], ["m2_glowShroomSmall", 280, 820],
    ["sluiceWheel", 1580, 1330], ["m2_ruinWall", 1700, 1260], ["m2_stoneHead", 1490, 1290], ["m2_mangrove", 1860, 1400], ["m2_mudReeds", 1700, 1370], ["m2_rootTangle", 1900, 1290], ["m2_glowShroomSmall", 1800, 1330],
    ["sluiceWheel", 1860, 720], ["m2_ruinWall", 1990, 650], ["m2_stoneHead", 1700, 650], ["m2_mangrove", 2020, 900], ["m2_mudReeds", 1760, 900], ["m2_rootTangle", 1660, 840], ["m2_glowShroomSmall", 1960, 840],
    ["sluiceWheel", 420, 1290], ["m2_ruinWall", 300, 1190], ["m2_stoneHead", 560, 1230], ["m2_mangrove", 200, 1400], ["m2_mudReeds", 640, 1380], ["m2_rootTangle", 330, 1370], ["m2_glowShroomSmall", 480, 1380]);
  // the nave: gate shut until the fen is drained, altar and chest behind, many heads carved on the walls
  props.push(["builderDoor", 1100, 520, { hide: "fen.drained", solid: [66, 16], tint: 0x9ab898 }], ["m2_templeSteps", 1100, 440, { show: "fen.drained" }], ["m2_templePillar", 860, 360], ["m2_templePillar", 1340, 360], ["m2_templePillar", 880, 220], ["m2_templePillar", 1320, 220], ["m2_mossAltar", 1100, 200], ["m2_stoneHead", 800, 130], ["m2_stoneHead", 1400, 130], ["m2_ruinArch", 1100, 110], ["m2_glowShroomBig", 1010, 330], ["m2_glowShroomBig", 1190, 330]);
  World.def("drownedFenShrine", {
    name: "The Drowned Fen Shrine", w: 2200, h: 1500, base: "rock", music: "shore", rim: 44,
    groundAlt: { src: "assets/regions/drownedFenShrineDrained.png", show: "fen.drained" },   // POLISH: the bare black stone bed that fades in when the sluices are done (water props hidden below)
    look: "A flooded ruined temple in a fen seen from above: grey-green knee-deep water over black flagstones with a winding path of mossy stepping stones, four side chambers around a central hall of broken pillars, deep black pools, mud banks with reeds and roots, a raised nave at the north with a stone altar, poison mist. Eerie, damp, sickly green light.",
    legend: { shallow: "knee-deep green-grey fen water over submerged black flagstones, with drifting algae and ripples", paved: "mossy stone stepping path and flagstones above the water, wet and dark green", water: "deep black-green still pools", grass: "mud banks with reeds, moss and roots, dark olive", floor: "dark wet temple floor of the nave, black stone with green stains", rock: "solid dark mossy ruin walls and roots" },
    bank: { shallow: "teal", paved: "grey", water: "water", grass: "mud", floor: "grey" }, grade: { shallow: { mul: [0.34, 0.6, 0.45], add: [0, 6, 0] }, paved: { mul: [0.5, 0.62, 0.45], add: [-4, 2, -6] }, water: { mul: [0.55, 1.0, 0.8], add: [0, 6, 2] }, grass: { mul: [0.8, 1.0, 0.7], add: [0, 6, 0] }, floor: { mul: [0.5, 0.62, 0.5], add: [0, 4, 0] }, _: [0.95, 1.05, 0.95] },
    marks: [{ k: "blot", on: ["shallow"], n: 20, col: [60, 110, 50], a: 0.25, r: [10, 40] }, { k: "dot", on: ["shallow", "water"], n: 60, col: [150, 210, 140], a: 0.6, r: [1, 2], hi: false }],
    guide: [
      ["shallow", R(740, 520, 720, 640)], ["paved", L([[1100, 1440], [1100, 1180], [1000, 1000], [1200, 800], [1100, 600]], 70)], ["paved", R(900, 1180, 400, 270)], ["water", E(900, 960, 90, 60)], ["water", E(1320, 960, 80, 60)], ["water", E(1100, 830, 70, 40)],
      ["shallow", R(140, 600, 460, 360)], ["paved", L([[330, 760], [700, 840]], 60)], ["shallow", R(600, 720, 150, 110)], ["grass", E(220, 880, 90, 60)], ["water", E(420, 860, 70, 50)],
      ["shallow", R(1600, 600, 460, 360)], ["paved", L([[1860, 780], [1460, 840]], 60)], ["shallow", R(1450, 720, 160, 110)], ["grass", E(1980, 880, 90, 60)], ["water", E(1760, 860, 70, 50)],
      ["shallow", R(1360, 1200, 600, 260)], ["paved", L([[1580, 1340], [1300, 1330]], 60)], ["shallow", R(1260, 1280, 110, 110)], ["grass", E(1880, 1410, 90, 40)], ["water", E(1700, 1380, 70, 40)],
      ["shallow", R(240, 1100, 500, 340)], ["paved", L([[420, 1330], [900, 1330]], 60)], ["shallow", R(730, 1260, 180, 110)], ["grass", E(260, 1400, 90, 40)], ["water", E(560, 1370, 70, 40)],
      ["shallow", R(740, 520, 100, 120)], ["floor", R(750, 60, 700, 440)], ["paved", R(1060, 440, 90, 90)], ["grass", E(280, 1020, 110, 60)],
    ],
    entries: { start: { x: 1100, y: 1400, face: "up" }, from_kharamRoad: { x: 1100, y: 1400, face: "up" } },
    exits: [{ rect: [1040, 1440, 120, 60], to: "kharamRoad", entry: "from_drownedFenShrine", push: [0, -1], floor: "paved" }],
    triggers: [
      { id: "sluice1", rect: [290, 720, 80, 60], press: true }, { id: "sluice2", rect: [1540, 1350, 80, 60], press: true }, { id: "sluice3", rect: [1820, 740, 80, 60], press: true }, { id: "sluice4", rect: [380, 1310, 80, 60], press: true },
      { id: "fenGuardian", rect: [1000, 260, 200, 90] },
    ],
    chests: [{ id: "g14_chorusOfManyHeads", x: 1000, y: 210 }],
    npcs: [{ id: "fenCarvings", art: null, name: "Carvings on the arch", x: 1110, y: 690, hint: "E / Space: the carvings" }],
    props,
    scatter: [{ keys: [["m2_mudReeds", 3], ["m2_mossBoulder", 1], ["m2_fernClump", 1]], n: 40, on: ["grass", "shallow"], seed: 101, scaleRange: [0.8, 1.1] }, { keys: [["m2_ruinRubble", 1], ["m2_rubbleHeap", 1]], n: 10, on: ["paved", "floor"], seed: 102 }],
    lights: [[1100, 200, 160, 0.6], [1010, 330, 110, 0.5], [1190, 330, 110, 0.5]],
    dark: { ambient: 0.32, radius: 280, color: 0x040e08 },
    encounter: { table: "fen", rate: 22 },
    amb: { birds: 0, butterflies: [], water: true, motes: 60, dust: 0x9fc890, tint: [0x103018, 0.14], weather: ["mist"], sparkle: { terrain: ["shallow"], color: 0xa8ffb8, rate: 3 } },
  });
})();
