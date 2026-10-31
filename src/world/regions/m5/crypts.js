// M5 3.5 Veil Crypts (dungeon, 2250x1500): the church's crypt under the cathedral. Candle-niche corridors in a grid, burial rooms with shrouded bones and sarcophagi, an ossuary, a chest chamber (SE),
// and at the east end of the middle corridor a black-and-gold builder door (blocker until flag crypt.open) with the four floor glyphs Seed/Sun/Star/Moon in front of it (trigger archiveDoor: press, the story asks
// for the niche order). Behind it the archive room with the tablets (gather crypt1, crypt2). Table "crypt" 22 s. Dark map lit by candles. Entries start, from_veilSanctum. Exit veilSanctum@from_veilCrypts.
(function () {
  const { R, E, P, L } = World.shapes, M = World.M5;
  const fx = { solid: false };
  const props = M.flat(
    // candle niches in the corridor walls, candle stands at the junctions
    M.line("cryptNiche", [[300, 218], [1800, 218]], 190, { seed: 1, jit: 6, start: 40 }), M.line("cryptNiche", [[560, 668], [1780, 668]], 180, { seed: 2, jit: 6, start: 30 }), M.line("cryptNiche", [[1120, 1070], [1840, 1070]], 190, { seed: 3, jit: 6 }),
    [["cryptCandleStand", 400, 330, fx], ["cryptCandleStand", 1000, 330, fx], ["cryptCandleStand", 1700, 330, fx], ["cryptCandleStand", 400, 770, fx], ["cryptCandleStand", 1000, 770, fx], ["cryptCandleStand", 1700, 770, fx], ["cryptCandleStand", 1000, 1190, fx], ["cryptCandleStand", 1500, 1190, fx]],
    // burial rooms: north rooms (sarcophagi and shrouded bones), the south ossuary and the long hall
    [["cryptSarcophagus", 600, 160], ["cryptSarcophagus", 740, 160], ["cryptShroudedBones", 670, 215, fx], ["cryptAltar", 1370, 160], ["cryptSarcophagus", 1250, 160], ["cryptSarcophagus", 1500, 160], ["cryptPillar", 1190, 150], ["cryptPillar", 1550, 150]],
    [["cryptOssuary", 560, 960], ["cryptOssuary", 700, 960], ["cryptShroudedBones", 780, 1040, fx], ["cryptShroudedBones", 500, 1040, fx], ["cryptPillar", 460, 900], ["cryptPillar", 830, 900]],
    M.grid("cryptShroudedBones", 1160, 900, 3, 2, 150, 80, { seed: 4, jit: 12, opts: { solid: false } }), [["cryptPillar", 1110, 880], ["cryptPillar", 1590, 880], ["cryptSarcophagus", 1380, 960]],
    // the builder door and its four glyphs, the tablet room
    [["cryptGlyphDawn", 1700, 755, fx], ["cryptGlyphZenith", 1740, 700, fx], ["cryptGlyphDusk", 1780, 755, fx], ["cryptGlyphNight", 1740, 810, fx]],
    [["builderDoor", 1935, 800, { solid: false, hide: "crypt.open" }], ["lightStele", 1900, 700, { solid: false }], ["lightStele", 1900, 880, { solid: false }]],
    [["cryptTablets", 2040, 640, fx], ["cryptTablets", 2130, 640, fx], ["studyTable", 2050, 760], ["archiveCabinet", 2130, 600], ["archiveCabinet", 2190, 600], ["archiveCabinetGlow", 2000, 600], ["readingLamp", 2090, 700, { fire: [0, -34, 0.6], glow: "gold" }], ["bookPile", 2130, 860], ["scrollRack", 2000, 880]],
    // the chest chamber
    [["cryptSarcophagus", 1820, 1180], ["cryptCandleStand", 1930, 1130, fx], ["cryptShroudedBones", 2040, 1240, fx], ["cryptPillar", 2090, 1130], ["cryptOssuary", 1850, 1260, { solid: false }]],
    M.rect(["cryptShroudedBones", "bones", "skull", "debris"], 150, 350, 2100, 1400, 14, { seed: 5, flipR: true, avoid: [[400, 330, 90], [1000, 330, 90], [1700, 330, 90], [1740, 755, 140]], opts: { solid: false } })
  );
  World.def("veilCrypts", {
    name: "Veil Crypts", w: 2250, h: 1500, music: "crypt", rim: 40, base: "rock", ground: "assets/regions/veilCrypts.jpg",
    look: "A church crypt under a cathedral seen from above, black darkness around small pools of candle light: narrow vaulted corridors of old pale stone with candle niches, burial rooms with shrouded bones and sarcophagi, an ossuary, and at the east end a sealed black-and-gold builder-stone door with four glyphs on the floor and an archive room behind.",
    legend: { floor: "old pale limestone crypt floor, cracked and dusty", paved: "burial room flagstones with worn names", wall: "crypt wall with candle niches", rock: "solid black stone", glass: "black-and-gold builder stone floor with glowing lines" },
    guide: [
      ["floor", L([[60, 300], [1900, 300]], 140)], ["floor", L([[300, 750], [1900, 750]], 140)], ["floor", L([[1000, 1150], [1900, 1150]], 140)],
      ["floor", L([[400, 300], [400, 750]], 120)], ["floor", L([[1000, 300], [1000, 1150]], 120)], ["floor", L([[1700, 300], [1700, 750]], 120)],
      ["paved", R(520, 90, 300, 160)], ["paved", R(1180, 90, 410, 160)], ["paved", R(430, 820, 450, 250)], ["paved", R(1080, 820, 560, 240)], ["paved", R(1760, 1050, 350, 250)],
      ["glass", R(1900, 560, 300, 380)], ["glass", L([[1860, 750], [1980, 750]], 90)], ["paved", R(1690, 690, 120, 130)],
    ],
    entries: { start: { x: 160, y: 300, face: "right" }, from_veilSanctum: { x: 160, y: 300, face: "right" } },
    exits: [{ rect: [40, 240, 56, 120], to: "veilSanctum", entry: "from_veilCrypts", push: [1, 0] }],
    blockers: [{ rect: [1900, 690, 56, 120], hide: "crypt.open" }],
    triggers: [{ id: "archiveDoor", rect: [1800, 700, 96, 110], press: true, once: false, hide: "crypt.open" }],
    chests: [{ id: "cryptChest", x: 1960, y: 1190 }],
    gather: [{ id: "crypt1", x: 2060, y: 790, label: "tablet", color: 0xe8c860, show: ["crypt.open", "!lore.sunPiece4"] }, { id: "crypt2", x: 2150, y: 760, label: "tablet", color: 0xe8c860, show: ["crypt.open", "!lore.sunPiece5"] }],
    props,
    encounter: { table: "crypt", rate: 22 },
    amb: { motes: 24, dust: 0xb0a890, drips: [[700, 300], [1300, 760], [540, 940], [1500, 1160]], tint: [0x30283c, 0.2], warm: [0xffa850, 0.04] },
    dark: { ambient: 0.84, radius: 150, fireRadius: 150 },
    lights: [[400, 330, 110, 0.8], [1000, 330, 110, 0.8], [1700, 330, 110, 0.8], [400, 770, 110, 0.8], [1000, 770, 110, 0.8], [1700, 770, 110, 0.8], [1000, 1190, 110, 0.8], [1500, 1190, 110, 0.8], [670, 160, 100, 0.7], [1370, 160, 110, 0.7],
      [1740, 755, 140, 0.9], [2090, 700, 140, 0.9], [2060, 780, 110, 0.7], [1930, 1130, 100, 0.8], [250, 300, 100, 0.7], [800, 300, 100, 0.6], [1350, 300, 100, 0.6], [900, 750, 100, 0.6], [1300, 750, 100, 0.6]],
    checkFlags: { "crypt.open": true },
  });
})();
