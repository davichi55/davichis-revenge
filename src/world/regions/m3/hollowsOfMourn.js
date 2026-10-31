// M3 / ch6: the Hollows of Mourn (dungeon, dark). Table "hollows" 22 s. Entries start from_mournsGate. Exit mournsGate@from_hollowsOfMourn.
// Set pieces: paleFerry (the pale ferryman on the north bank; once hollows.ferry is set the ford across the black river opens as the shortcut), maskChamber (chamber of builder death masks), trigger gateFight (the gate at the bottom; Gate Hound lv 36, optional).
(function () {
  const { R, E, P, L } = World.shapes, M = World.m3, props = [], blue = 0xa8c8ff;
  // the entry cave and the long west passage: fungus lamps, bone arches, funeral lanterns on poles
  props.push(["ribArch", 350, 200], ["boneBrazier", 280, 260, { fire: [0, -44, 0.8], glow: "blue" }], ["boneBrazier", 420, 260, { fire: [0, -44, 0.8], glow: "blue" }], ["m2_glowShroomBig", 230, 360], ["m2_glowShroomSmall", 470, 380], ["m2_stalagmite", 180, 280], ["m2_caveStalag", 520, 300],
    ...M.row(["m2_stalagmite", "m2_wetRock", "m2_glowShroomSmall"], 160, 520, 140, 1000, 5, {}, 14, 3), ...M.row(["m2_stalagmite", "m2_caveStalag", "m2_glowShroomBig"], 480, 540, 520, 980, 5, {}, 14, 4), ["m2_wovenLantern", 400, 700, { tint: blue }], ["m2_wovenLantern", 330, 900, { tint: blue }], ["ribArch", 460, 1150], ["cryptCandleStand", 520, 1220], ["cryptCandleStand", 380, 1180]);
  // the north passage and bank cave: funeral lanterns, shrouded bones, tablets, skulls
  props.push(...M.row(["cryptCandleStand", "m2_glowShroomSmall"], 700, 290, 1300, 360, 6, {}, 10, 5), ["skullPile", 900, 330], ["cryptShroudedBones", 1200, 330], ["m2_caveBones", 1400, 300], ["cryptTablets", 1600, 300], ["boneBrazier", 1700, 360, { fire: [0, -44, 0.8], glow: "blue" }], ["m2_glowShroomBig", 1100, 260], ["m2_glowShroomBig", 1800, 450], ["m2_stalagmite", 1000, 480], ["m2_stalagmite", 1900, 520], ["m2_wovenLantern", 1500, 540, { tint: blue }], ["m2_wovenLantern", 1300, 520, { tint: blue }]);
  // the mask chamber: shelves of builder death masks round the wall, a plinth with the cut line
  props.push(...M.ring(["cryptNiche", "cryptNiche", "m2_caveTablet"], 2050, 330, 180, 110, 9, {}, Math.PI * 0.95, Math.PI * 2.05, 0, 6), ["cryptAltar", 2050, 270], ["cryptCandleStand", 1940, 380], ["cryptCandleStand", 2160, 380], ["cryptOssuary", 2000, 420, { scale: 0.8 }]);
  // the black river: ferry dock on the north bank, the ferry moored (solid) across the ford until the fare is paid, lanterns on both banks
  props.push(["m2_ferryRaft", 1500, 770, { hide: "hollows.ferry", solid: [50, 18] }], ["m2_ferryRaft", 1620, 680, { show: "hollows.ferry", solid: false }], ["m2_dockPosts", 1420, 690], ["m2_dockPosts", 1580, 690], ["boneBrazier", 1400, 650, { fire: [0, -44, 0.8], glow: "blue" }], ["boneBrazier", 1600, 650, { fire: [0, -44, 0.8], glow: "blue" }], ["m2_dockPosts", 1420, 880], ["m2_dockPosts", 1580, 880], ["cryptCandleStand", 1400, 900], ["cryptCandleStand", 1600, 900], ["drownedKelp", 1000, 780, { solid: false }], ["drownedKelp", 2000, 780, { solid: false }]);
  // south bank cave and the gate at the bottom
  props.push(["m2_stalagmite", 1000, 1020], ["m2_stalagmite", 2000, 1040], ["m2_glowShroomBig", 1100, 1180], ["m2_glowShroomBig", 1950, 1200], ["m2_caveBones", 1300, 1260], ["skullPile", 1700, 1250], ["boneBrazier", 1380, 1400, { fire: [0, -44, 0.8], glow: "blue" }], ["boneBrazier", 1620, 1400, { fire: [0, -44, 0.8], glow: "blue" }], ["hornGate", 1500, 1500, { solid: false }], ["ribArch", 1360, 1470], ["ribArch", 1640, 1470], ["boneWall", 1250, 1450], ["boneWall", 1750, 1450], ["bonePillar", 1450, 1330], ["bonePillar", 1550, 1330], ["bullSkullAltar", 1500, 1260], ["m2_wovenLantern", 1200, 1000, { tint: blue }], ["m2_wovenLantern", 1800, 1000, { tint: blue }]);
  World.def("hollowsOfMourn", {
    name: "Hollows of Mourn", w: 2400, h: 1600, base: "rock", music: "underworld", rim: 44,
    look: "Long underworld caves seen from above: dark grey-violet cave floor of cold stone and bone dust, glowing blue-green fungus, winding passages leading down to a great bone-arched gate at the bottom, a wide river of utterly black still water across the middle with a narrow ford, a round chamber of masks in the north-east, funeral lanterns glowing pale blue. Silent, cold, mournful.",
    legend: { floor: "dark grey-violet cave stone floor, smooth, with bone dust and pale fungus specks", bone: "pale bone dust and small bones on the floor around the gate and chambers", water: "black still water, almost no reflection, a faint pale mist", shallow: "ankle-deep black water over stepping stones, the ford", rock: "dark violet-grey cave walls with bone-white veins" },
    bank: { floor: "grey", bone: "bone", water: "water", shallow: "teal", rock: "dark" }, grade: { floor: { mul: [0.46, 0.5, 0.64], add: [2, 4, 12] }, bone: { mul: [0.8, 0.82, 0.95], add: [10, 12, 22] }, water: { mul: [0.3, 0.45, 0.6], add: [-6, -4, 2] }, shallow: { mul: [0.45, 0.8, 0.85], add: [4, 14, 18] }, _: [0.95, 1.0, 1.1] },
    marks: [{ k: "dot", on: ["floor", "bone"], n: 80, col: [120, 230, 200], a: 0.7, r: [1, 2], hi: false }, { k: "dot", on: ["bone", "floor"], n: 40, col: [236, 232, 220], a: 0.8, r: [1, 2.2] }],
    guide: [
      ["floor", E(350, 320, 260, 200)], ["floor", R(290, 40, 120, 160)], ["floor", L([[350, 320], [700, 340], [1100, 370], [1500, 420]], 180)], ["floor", E(1500, 420, 700, 240)], ["floor", E(2050, 330, 220, 150)], ["floor", L([[1750, 400], [1900, 360]], 130)],
      ["floor", L([[350, 320], [300, 700], [400, 1050], [700, 1250], [1000, 1200]], 190)], ["floor", E(1500, 1170, 800, 300)], ["bone", E(1500, 1340, 380, 140)], ["floor", L([[1500, 1300], [1500, 1520]], 160)],
      ["water", R(900, 700, 1456, 150)], ["shallow", R(1460, 690, 80, 170)], ["bone", E(420, 480, 70, 40)],
    ],
    entries: { start: { x: 350, y: 140, face: "down" }, from_mournsGate: { x: 350, y: 140, face: "down" } },
    exits: [{ rect: [290, 0, 120, 70], to: "mournsGate", entry: "from_hollowsOfMourn", push: [0, 1] }],
    triggers: [{ id: "gateFight", rect: [1400, 1400, 200, 100] }],
    npcs: [{ id: "paleFerry", art: "npcHooded", name: "The pale ferryman", x: 1500, y: 650, hint: "E / Space: the ferryman" }, { id: "maskChamber", art: null, name: "Chamber of masks", x: 2050, y: 330, hint: "E / Space: the masks" }],
    props,
    scatter: [{ keys: [["m2_caveBones", 1], ["m2_wetRock", 2], ["m2_glowShroomSmall", 2], ["m2_cavePuddle", 1]], n: 36, on: ["floor", "bone"], seed: 201, scaleRange: [0.7, 1] }],
    lights: [[280, 260, 110, 0.6], [420, 260, 110, 0.6], [1700, 360, 110, 0.6], [1400, 650, 110, 0.6], [1600, 650, 110, 0.6], [1380, 1400, 110, 0.6], [1620, 1400, 110, 0.6], [2050, 330, 130, 0.6], [1500, 1260, 120, 0.6]],
    dark: { ambient: 0.62, radius: 230, color: 0x03030c },
    encounter: { table: "hollows", rate: 22 },
    amb: { birds: 0, butterflies: [], motes: 80, dust: 0xa0b8d8, tint: [0x101030, 0.16], weather: ["mist"], sparkle: { terrain: ["bone"], color: 0xb8ffe8, rate: 3 } },
  });
})();
