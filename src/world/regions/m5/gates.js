// M5 5.3-5.5 The Three Gates (dungeons, 2250x1500 each): pyramidDawnGate (east, rose-gold, flows west to east), pyramidZenithGate (top, white-gold echo hall, flows south to north),
// pyramidDuskGate (west, copper-black, flows east to west). One layout recipe per gate (vestibule -> plate room -> shutter -> altar chamber with the huge disc, the collar altar, a chest, the forward exit).
// PUZZLE (STORY-M5 ch11.js owns the logic): three glyph plates in a row in the plate room and ONE press trigger <g>Plates (dawnPlates zenithPlates duskPlates, press, in front of the plates, hidden once flag ch11.<g>Plates is set).
// That flag also lights the plates and lifts the shutter (blocker + prop) to the altar chamber. Triggers gateS22 / gateS23 / gateS24 stand at the collar altars (STORY: general + disc, sets ch11.s22/23/24); the forward exit needs ch11.sNN.
// Chests dawnChest zenithChest duskChest. Tables dawnGate zenithGate duskGate (22 s).
(function () {
  const { R, E, P, L } = World.shapes, M = World.M5, fx = { solid: false };
  function gate(id, g, c) {
    const plates = c.plates, pp = [], flag = "ch11." + g + "Plates", x0 = plates[0][0] - 70, x1 = plates[2][0] + 70, py = plates[0][1];
    plates.forEach(p => pp.push(["pyrPlate", p[0], p[1], { solid: false, hide: flag }], ["pyrPlateLit", p[0], p[1], { solid: false, show: flag }]));
    const sh = c.shutter, shut = "!" + flag, alt = c.altar, props = M.flat(pp, [["pyrShutter", sh.prop[0], sh.prop[1], { solid: false, show: shut }], [c.disc, c.discAt[0], c.discAt[1], { solid: false }], ["pyrCollarAltar", alt[0], alt[1]], ["pyrMural", c.mural[0], c.mural[1], fx]], c.props);
    return World.def(id, {
      name: c.name, w: 2250, h: 1500, music: "greatPyramid", rim: 40, base: "rock", ground: "assets/regions/" + id + ".jpg", look: c.look, legend: c.legend,
      guide: [].concat(c.rooms, [["floor", R(sh.rect[0], sh.rect[1], sh.rect[2], sh.rect[3])]], c.lines || []),
      entries: c.entries, exits: c.exits, blockers: [{ rect: sh.block, show: shut }],
      triggers: [{ id: g + "Plates", rect: [x0, py - 70, x1 - x0, 140], press: true, once: false, hide: flag }, { id: c.s, rect: [alt[0] - 100, alt[1] - 90, 200, 190], hide: c.sFlag }],
      chests: [{ id: g + "Chest", x: c.chest[0], y: c.chest[1] }],
      props, encounter: { table: g + "Gate", rate: 22 }, amb: c.amb, dark: c.dark, lights: c.lights, checkFlags: { [flag]: true },
    });
  }
  const GOLD = (x, y) => ["pyrBrazier", x, y, { solid: false }];
  // ---------- Dawn Gate: rose-gold, west to east ----------
  gate("pyramidDawnGate", "dawn", {
    name: "The Dawn Gate", look: "Inside a black-and-gold pyramid gate hall seen from above: black polished stone floor with gold inlay lines, a big hall with five glowing glyph plates in an arch, a golden shutter, an altar chamber with a huge rose-gold disc set in the wall and a collar altar chained to it, soft rose light.",
    legend: { paved: "black polished stone floor with gold inlay light-lines", glass: "black and rose-gold glowing builder floor", floor: "gold shutter threshold", rock: "solid black-and-gold pyramid wall" },
    rooms: [["paved", R(60, 600, 380, 300)], ["paved", R(440, 300, 800, 900)], ["glass", R(1380, 420, 700, 660)], ["glass", L([[2080, 770], [2240, 770]], 120)], ["glass", L([[100, 750], [1380, 770]], 50)], ["road", L([[440, 750], [440, 760]], 40)]],
    shutter: { rect: [1240, 700, 140, 100], block: [1252, 690, 100, 120], prop: [1330, 810] }, altar: [1730, 760], disc: "pyrDiscDawn", discAt: [1730, 480], mural: [520, 420], chest: [1990, 1010], s: "gateS22", sFlag: "ch11.s22",
    plates: [[640, 760], [840, 760], [1040, 760]],
    entries: { start: { x: 150, y: 750, face: "right" }, from_ahuacanGreatStair: { x: 150, y: 750, face: "right" }, from_pyramidZenithGate: { x: 2130, y: 770, face: "left" } },
    exits: [{ rect: [40, 690, 56, 120], to: "ahuacanGreatStair", entry: "from_pyramidDawnGate", push: [1, 0] }, { rect: [2194, 710, 56, 120], to: "pyramidZenithGate", entry: "from_pyramidDawnGate", push: [-1, 0], need: "ch11.s22" }],
    props: M.flat(
      M.line("pyrLightPillar", [[470, 330], [1210, 330]], 150, { seed: 1, opts: fx }), M.line("pyrLightPillar", [[470, 1180], [1210, 1180]], 150, { seed: 2, opts: fx }), M.line("pyrGutter", [[500, 460], [1180, 460]], 150, { seed: 3, opts: fx }), M.line("pyrGutter", [[500, 1060], [1180, 1060]], 150, { seed: 4, opts: fx }),
      [["pyrOfferingPillar", 700, 980], ["pyrOfferingPillar", 960, 980], ["pyrOfferingPillar", 830, 1110], ["pyrOfferingPillar", 830, 400], ["pyrBanner", 300, 610, fx], ["pyrBanner", 300, 900, fx], GOLD(160, 640), GOLD(160, 870), GOLD(1180, 640), GOLD(1180, 880)],
      [["pyrGoldStatue", 1480, 520], ["pyrGoldStatue", 1980, 520], ["pyrGoldStatue", 1480, 1020], ["pyrChains", 1640, 560, fx], ["pyrChains", 1820, 560, fx], ["pyrLightPillar", 1440, 780, fx], ["pyrLightPillar", 2030, 780, fx], ["pyrBrazier", 1730, 960, fx], ["pyrGutter", 1730, 1040, fx], ["pyrBanner", 1900, 470, fx], ["pyrBanner", 1560, 470, fx]]),
    amb: { motes: 30, dust: 0xffc8b0, tint: [0x401828, 0.18], warm: [0xff9080, 0.06], sparkle: { terrain: ["glass"], color: 0xffc0a0, rate: 5 } }, dark: { ambient: 0.62, radius: 250, fireRadius: 210 },
    lights: [[1730, 480, 260, 1], [1730, 760, 160, 0.8], [160, 640, 130, 0.8], [160, 870, 130, 0.8], [1180, 640, 130, 0.8], [1180, 880, 130, 0.8], [1100, 920, 90, 0.6], [1010, 650, 90, 0.6], [840, 530, 90, 0.6], [670, 650, 90, 0.6], [580, 920, 90, 0.6], [520, 440, 120, 0.7]],
  });
  // ---------- Zenith Gate: white-gold echo hall, south to north ----------
  gate("pyramidZenithGate", "zenith", {
    name: "The Zenith Gate", look: "Inside a black-and-gold pyramid hall seen from above, an echo chamber of pale white-gold light: a round plate room with a ring of tall pillars and five glowing glyph plates (one in the centre), a gold shutter in the north, a long altar hall with a huge white-gold disc in the wall and a collar altar, bright cold white light, polished floor.",
    legend: { paved: "black polished stone floor with white-gold inlay", glass: "glowing white-gold builder floor", floor: "gold shutter threshold", rock: "solid black-and-gold pyramid wall" },
    rooms: [["paved", R(940, 1160, 370, 300)], ["paved", E(1125, 800, 560, 380)], ["paved", R(1055, 440, 140, 140)], ["glass", R(500, 100, 1300, 300)], ["glass", L([[1750, 260], [2240, 260]], 120)], ["glass", L([[1125, 1380], [1125, 440]], 50)]],
    shutter: { rect: [1050, 400, 150, 100], block: [1062, 395, 126, 110], prop: [1125, 520] }, altar: [1125, 270], disc: "pyrDiscZenith", discAt: [1125, 150], mural: [900, 1250], chest: [640, 330], s: "gateS23", sFlag: "ch11.s23",
    plates: [[925, 800], [1125, 800], [1325, 800]],
    entries: { start: { x: 1125, y: 1380, face: "up" }, from_pyramidDawnGate: { x: 1125, y: 1380, face: "up" }, from_pyramidDuskGate: { x: 2130, y: 260, face: "left" } },
    exits: [{ rect: [1050, 1444, 150, 56], to: "pyramidDawnGate", entry: "from_pyramidZenithGate", push: [0, -1] }, { rect: [2194, 200, 56, 120], to: "pyramidDuskGate", entry: "from_pyramidZenithGate", push: [-1, 0], need: "ch11.s23" }],
    props: M.flat(
      M.ring("pyrOfferingPillar", 1125, 800, 520, 340, 10, { seed: 1, a0: 0.3, jit: 6 }), M.ring("pyrLightPillar", 1125, 800, 420, 270, 12, { seed: 2, opts: fx }), M.ring("pyrBrazier", 1125, 800, 330, 200, 6, { seed: 3, a0: 0.5, opts: fx }),
      [["pyrGutter", 1000, 1220, fx], ["pyrGutter", 1250, 1220, fx], ["pyrBanner", 1000, 1190, fx], ["pyrBanner", 1250, 1190, fx], GOLD(960, 1300), GOLD(1290, 1300)],
      [["pyrGoldStatue", 640, 240], ["pyrGoldStatue", 1610, 240], ["pyrGoldStatue", 860, 300], ["pyrGoldStatue", 1390, 300], ["pyrBrazier", 740, 340, fx], ["pyrBrazier", 1510, 340, fx], ["pyrLightPillar", 560, 190, fx], ["pyrLightPillar", 1700, 190, fx], ["pyrChains", 1010, 190, fx], ["pyrChains", 1240, 190, fx]]),
    amb: { motes: 40, dust: 0xffffff, tint: [0x303848, 0.1], warm: [0xfff4d8, 0.05], sparkle: { terrain: ["glass", "paved"], color: 0xffffff, rate: 7 } }, dark: { ambient: 0.5, radius: 300, fireRadius: 230 },
    lights: [[1125, 150, 300, 1], [1125, 270, 170, 0.8], [1125, 800, 240, 0.7], [740, 340, 120, 0.8], [1510, 340, 120, 0.8], [1125, 640, 90, 0.7], [1330, 800, 90, 0.7], [1125, 960, 90, 0.7], [920, 800, 90, 0.7], [960, 1300, 110, 0.7], [1290, 1300, 110, 0.7]],
  });
  // ---------- Dusk Gate: copper-black, east to west ----------
  gate("pyramidDuskGate", "dusk", {
    name: "The Dusk Gate", look: "Inside a black-and-gold pyramid gate hall seen from above at dusk: a dark hall of black stone with copper inlay, red offering gutters, dark roots between the slabs, five glyph plates on a valley curve, a copper shutter, an altar chamber with a huge copper-black disc set in the wall and a collar altar, deep shadow with only dim orange light.",
    legend: { paved: "black stone floor with copper inlay and dark stains", glass: "dim copper-black builder floor with faint glow", floor: "copper shutter threshold", rock: "solid black pyramid wall" },
    rooms: [["paved", R(1810, 600, 380, 300)], ["paved", R(1010, 300, 800, 900)], ["glass", R(170, 420, 700, 660)], ["glass", L([[170, 770], [10, 770]], 120)], ["glass", L([[2150, 750], [870, 770]], 50)]],
    shutter: { rect: [870, 700, 140, 100], block: [898, 690, 100, 120], prop: [940, 810] }, altar: [520, 760], disc: "pyrDiscDusk", discAt: [520, 480], mural: [1730, 420], chest: [260, 1010], s: "gateS24", sFlag: "ch11.s24",
    plates: [[1250, 800], [1450, 800], [1650, 800]],
    entries: { start: { x: 2100, y: 750, face: "left" }, from_pyramidZenithGate: { x: 2100, y: 750, face: "left" }, from_pyramidDescent: { x: 150, y: 770, face: "right" } },
    exits: [{ rect: [2194, 690, 56, 120], to: "pyramidZenithGate", entry: "from_pyramidDuskGate", push: [-1, 0] }, { rect: [40, 710, 56, 120], to: "pyramidDescent", entry: "from_pyramidDuskGate", push: [1, 0], need: "ch11.s24" }],
    props: M.flat(
      M.line("pyrLightPillar", [[1040, 330], [1780, 330]], 150, { seed: 1, opts: fx }), M.line("pyrGutter", [[1060, 470], [1760, 470]], 150, { seed: 3, opts: fx }), M.line("pyrGutter", [[1060, 1060], [1760, 1060]], 150, { seed: 4, opts: fx }), M.line("pyrRoots", [[1040, 1170], [1780, 1170]], 200, { seed: 5, opts: fx }),
      [["pyrOfferingPillar", 1290, 640], ["pyrOfferingPillar", 1560, 640], ["pyrOfferingPillar", 1420, 1040], ["pyrOfferingPillar", 1130, 960], ["pyrOfferingPillar", 1700, 960], ["pyrChainRing", 1400, 700, fx], ["pyrRubble", 1180, 1100, fx], ["pyrRubble", 1650, 400, fx], ["pyrBanner", 1950, 610, fx], ["pyrBanner", 1950, 890, fx], GOLD(2100, 640), GOLD(2100, 870)],
      [["pyrRoots", 420, 1000, fx], ["pyrRoots", 680, 560, fx], ["pyrGoldStatue", 280, 520], ["pyrGoldStatue", 760, 520], ["pyrChains", 400, 560, fx], ["pyrChains", 640, 560, fx], ["pyrBrazier", 520, 980, fx], ["pyrGutter", 520, 1060, fx], ["pyrChainRing", 520, 860, fx], ["pyrLightPillar", 230, 770, fx], ["pyrLightPillar", 820, 770, fx]]),
    amb: { motes: 24, dust: 0x806858, tint: [0x2c1814, 0.3], warm: [0xff7040, 0.05], drips: [[1100, 470], [1500, 470], [600, 560], [420, 1000]], sparkle: { terrain: ["glass"], color: 0xff9060, rate: 3 } }, dark: { ambient: 0.8, radius: 190, fireRadius: 190 },
    lights: [[520, 480, 230, 0.9], [520, 760, 150, 0.8], [2100, 640, 120, 0.8], [2100, 870, 120, 0.8], [1150, 560, 80, 0.6], [1250, 800, 80, 0.6], [1410, 920, 80, 0.6], [1570, 800, 80, 0.6], [1680, 560, 80, 0.6], [520, 980, 110, 0.7], [1730, 440, 110, 0.6], [280, 520, 90, 0.5]],
  });
})();
