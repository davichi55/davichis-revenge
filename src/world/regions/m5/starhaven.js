// M5 9.1 Starhaven (town, 1650x1100): a research camp of former Academy scholars on a star-metal crater island. Glassy black sand, prefab huts and tents with brass telescopes on every roof, notebooks pinned
// to ropes, the Star Lamp inn, the Menagerie Wagon, the great telescope on a platform in the NE (interact spot `telescope`), a pier in the west (dock to weepingSea), the trail east to the Starfall Isles.
// Entries start, from_sea, from_starfallIsles, inn. NPC ids: innkeeper merchant vael imela oldDunmar mentor calendarScholar quartermaster r1 r2 r3. Trigger starhavenArrive. No fights.
(function () {
  const { R, E, P, L } = World.shapes, M = World.M5, fx = { solid: false };
  const props = M.flat(
    // the great telescope on its platform, the research huts and tents round the plaza
    [["starhavenGreatTelescope", 1010, 340, { solid: [50, 20] }], ["starhavenCrates", 920, 380], ["starhavenDesk", 1120, 380], ["starhavenLampPost", 880, 270, fx], ["starhavenLampPost", 1150, 270, fx], ["starhavenFlag", 1180, 330]],
    [["starhavenStarLamp", 600, 410, { solid: [60, 22] }], ["starhavenHut", 440, 380], ["starhavenHut", 780, 330], ["starhavenHut", 460, 700], ["starhavenHut", 1080, 760], ["starhavenTent", 330, 450], ["starhavenTent", 700, 780], ["starhavenTent", 1230, 640], ["starhavenTent", 1260, 460], ["starhavenQuarterStall", 880, 720]],
    // notebooks on ropes, kites, lamp posts, crates, the wagon, the dinghy
    M.line("starhavenNotebooks", [[500, 520], [1000, 520]], 150, { seed: 1, opts: fx, jit: 8 }), M.line("starhavenKite", [[400, 620], [1160, 600]], 230, { seed: 2, opts: fx }),
    M.line("starhavenLampPost", [[420, 570], [1000, 570], [1200, 600]], 190, { seed: 3, opts: fx }), [["menagerieWagon", 560, 880], ["starhavenCrates", 1000, 850], ["starhavenCrates", 1180, 820], ["starhavenDinghy", 280, 760], ["starhavenDinghy", 200, 420], ["starhavenCrates", 340, 640, fx]],
    // black rock, glass spires and beach grass; the crater bowl on the east trail
    M.rect(["starhavenBlackRock", "starhavenGlassSpire", "starhavenBeachGrass", "starhavenShard"], 250, 200, 1500, 900, 26, { seed: 4, flipR: true, avoid: [[760, 540, 300], [1010, 340, 200], [1400, 560, 150], [330, 560, 130], [580, 880, 120]], opts: { solid: false } }),
    [["starfallBowl", 1380, 760, fx], ["starhavenShard", 1330, 400], ["starhavenGlassSpire", 1500, 480], ["starhavenGlassSpire", 1530, 700], ["starhavenBlackRock", 1450, 880], ["starfallStone", 1240, 560, { solid: false }]]
  );
  World.def("starhaven", {
    name: "Starhaven", w: 1650, h: 1100, music: "starfall", rim: 40, base: "water", ground: "assets/regions/starhaven.jpg",
    look: "A research camp on a small crater island seen from above on a very clear day: glassy black sand with glints, a paved plaza of dark metal plates, prefab huts and tents with brass telescopes on every roof, a great brass telescope on a platform, ropes of pinned notebooks and kites, a wooden pier on a calm blue sea to the west, an old crater bowl of dark star-metal in the east.",
    legend: { ash: "glassy black sand with bright glints", glass: "smooth dark star-metal plates with a violet sheen", paved: "dark metal plaza plates", road: "packed black sand trail", floor: "wooden pier planks", sand: "pale beach sand", shallow: "clear shallow water over pale sand", water: "calm deep blue sea", rock: "black star-metal rock" },
    guide: [
      ["shallow", E(820, 540, 800, 480)], ["sand", E(820, 540, 770, 450)], ["ash", E(820, 540, 700, 400)], ["glass", E(1400, 700, 200, 140)], ["glass", E(1010, 320, 160, 110)],
      ["paved", E(760, 540, 320, 210)], ["paved", R(900, 220, 240, 190)], ["road", L([[330, 560], [600, 540]], 90)], ["road", L([[1080, 560], [1620, 560]], 100)], ["road", L([[760, 700], [560, 880]], 80)], ["road", L([[1000, 420], [1000, 500]], 80)],
      ["floor", L([[40, 560], [340, 560]], 100)],
    ],
    entries: { start: { x: 400, y: 560, face: "right" }, from_sea: { x: 400, y: 560, face: "right" }, from_starfallIsles: { x: 1550, y: 560, face: "left" }, inn: { x: 600, y: 470, face: "down" } },
    exits: [{ rect: [40, 500, 56, 120], to: "weepingSea", entry: "from_starhaven", push: [1, 0], floor: "floor" }, { rect: [1594, 500, 56, 120], to: "starfallIsles", entry: "from_starhaven", push: [-1, 0] }],
    triggers: [{ id: "starhavenArrive", rect: [330, 490, 190, 140] }],
    gather: [{ id: "telescope", x: 1010, y: 376, label: "telescope", color: 0xb0c8ff, show: "post.start" }, { id: "postcard", x: 700, y: 526, label: "postcard", color: 0xf0e0b0, show: ["post.imelaHome", "!post.postcard"] }],
    props,
    scatter: [{ keys: [["starhavenBeachGrass", 2], ["starhavenBlackRock", 1], ["starhavenShard", 0.4]], n: 30, seed: 5, on: ["ash", "sand"], opts: { solid: false }, scaleRange: [0.5, 0.8] }],
    npcs: [
      { id: "innkeeper", art: "innkeeper", name: "Innkeeper", x: 660, y: 470 }, { id: "merchant", art: "merchant", name: "Quartermaster", x: 880, y: 760 }, { id: "quartermaster", art: "npcQuartermaster", name: "Quartermaster", x: 960, y: 800 },
      { id: "vael", art: "npcVael", name: "Master Oren Vael", x: 820, y: 560 }, { id: "oldDunmar", art: "npcDunmar", name: "Old Dunmar", x: 640, y: 900 }, { id: "mentor", art: "npcIthielGrey", name: "Master Ithiel", x: 1060, y: 380 }, { id: "imela", art: "npcImela", name: "Imela", x: 780, y: 610, hide: "post.imelaHome" },
      { id: "calendarScholar", art: "npcCalendarScholar", name: "Calendar scholar", x: 1160, y: 500 }, { id: "r1", art: "npcScholarM", name: "Scholar", x: 500, y: 600 }, { id: "r2", art: "npcScholarF", name: "Scholar", x: 1000, y: 610 }, { id: "r3", art: "npcScholarM", name: "Scholar", x: 420, y: 760 },
      { id: null, art: "npcScholarF", x: 760, y: 640, path: [[600, 640], [940, 640]], speed: 14 }, { id: null, art: "npcScholarM", x: 860, y: 450, path: [[740, 440], [900, 470]], speed: 12 }, { id: null, art: "npcScholarF", x: 1300, y: 560, path: [[1100, 570], [1500, 560]], speed: 18 },
    ],
    amb: { motes: 24, dust: 0xe8f0ff, tint: [0x28385a, 0.1], warm: [0xc0d8ff, 0.03], water: true, birds: 4, sparkle: { terrain: ["ash", "glass"], color: 0xd8e8ff, rate: 7 } },
  });
})();
