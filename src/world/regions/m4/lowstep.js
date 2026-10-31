// M4 R12 Lowstep (chapter 7): the slum at the foot of the Great Pyramid, a night of lamps. Town: no fights. Inn: the Mender's Corner (entry `inn`).
// Layout rule: terraced houses stand against thick wall bands (blocked), so no house hides a walkable street behind it.
// Entries: start, from_sea, from_ahuacanSewers, from_palaceRoofs, inn. Exits: weepingSea@from_lowstep (pier end), ahuacanSewers@from_lowstep (drain grate beside the dye-works, need ch7.start).
// NPC ids: mender (inn + healer), merchant, ranna, pavo, cell1 cell2 cell3, r1 r2 r3, laundress. Triggers: lowstepArrive (dock steps), planBriefing (dye-works yard).
(function () {
  const { R, E, P, L } = World.shapes;
  const flat = (key, x, y, o) => [key, x, y, Object.assign({ dy: 3 - y }, o || {})];
  const P1 = [];
  // the stair of lamps: hanging lamps down both sides of the central stair (beside the stairs, on the wall bands)
  for (let y = 520; y <= 880; y += 120) { P1.push(["m4_hangingLamps", 772, y, { solid: false }]); P1.push(["m4_hangingLamps", 906, y + 30, { solid: false }]); }
  World.def("lowstep", {
    name: "Lowstep", w: 1700, h: 1100, music: "capital", rim: 40, base: "sand",
    look: "A poor terraced slum seen from above at night, at the foot of a colossal black-and-red stepped pyramid: packed ochre earth yards, worn flagstone streets, steep wooden stairs cut through tall mud-brick terrace retaining walls, laundry lines, puddles, pools of warm lamplight. A harbour quay with a pier in the south-east corner. Warm, tired, dramatic.",
    note: "The very top band (pure black) is the stone foot of a gigantic pyramid: paint it as huge dark stepped masonry with torch glow. The two wide bands across the map are tall mud-brick retaining walls (top faces) with stair gaps. The sea is only in the bottom-right corner.",
    legend: { sand: "packed ochre earth yards with footprints, puddles and scattered straw", paved: "worn grey-brown flagstones of the terrace streets and the quay", road: "steep wooden steps and plank stairs", wall: "thick mud-brick terrace retaining walls, dark brown", rock: "huge dark stepped stone base of a gigantic pyramid, torch-lit", water: "deep dark harbour water with lamp reflections", floor: "grey wooden pier planks" },
    bank: { sand: "sand", paved: "grey", road: "dirt", wall: "red", rock: "dark", floor: "dark", water: "water" },
    grade: { _: { mul: [0.92, 0.84, 0.82], add: [-2, -4, -4] }, sand: { mul: [0.9, 0.78, 0.66], add: [4, 0, -2] }, paved: { mul: [0.82, 0.76, 0.72], add: [0, -2, -4] }, wall: { mul: [0.7, 0.55, 0.45], add: [4, 0, 0] }, rock: { mul: [0.55, 0.5, 0.55], add: [0, 0, 0] } },
    marks: [{ k: "blot", on: ["sand", "paved"], n: 12, col: [40, 24, 16], a: 0.2, r: [10, 30] }, { k: "dot", on: ["paved"], n: 40, col: [255, 170, 80], a: 0.5, r: [1, 1.6], hi: false }],
    guide: [
      ["rock", R(0, 0, 1700, 340)],
      ["paved", R(60, 340, 1580, 100)],
      ["wall", R(60, 440, 1580, 172)],
      ["sand", R(60, 612, 1580, 128)], ["paved", E(850, 676, 330, 40)],
      ["wall", R(60, 740, 1580, 162)],
      ["paved", P([[60, 902], [1640, 902], [1640, 1060], [60, 1060]])],
      ["water", P([[1250, 1100], [1700, 1100], [1700, 780], [1560, 840], [1470, 920], [1330, 980], [1250, 1060]])],
      ["floor", L([[1230, 1010], [1480, 960]], 66)],
      // stairs through the wall bands
      ["road", R(380, 436, 90, 180)], ["road", R(790, 436, 100, 470)], ["road", R(1200, 436, 90, 180)], ["road", R(250, 736, 90, 170)], ["road", R(1380, 736, 90, 170)],
    ],
    entries: { start: { x: 1280, y: 1000, face: "left" }, from_sea: { x: 1280, y: 1000, face: "left" }, from_ahuacanSewers: { x: 150, y: 420, face: "down" }, from_palaceRoofs: { x: 1560, y: 410, face: "left" }, inn: { x: 1010, y: 940, face: "up" } },
    exits: [
      { rect: [1420, 940, 80, 70], to: "weepingSea", entry: "from_lowstep", push: [-1, 0], floor: "floor" },
      { rect: [90, 352, 80, 56], to: "ahuacanSewers", entry: "from_lowstep", push: [0, -1], need: "ch7.start", blocked: "lowstepGrateShut", floor: "paved" },
    ],
    triggers: [{ id: "lowstepArrive", rect: [1180, 930, 150, 110] }, { id: "planBriefing", rect: [260, 370, 220, 70], when: "ch7.start" }],
    npcs: [
      { id: "ranna", art: "npcRanna", name: "Ranna", x: 1140, y: 970 },
      { id: "mender", art: "npcMender", name: "The Mender", x: 960, y: 936, hint: "E / Space: talk to the Mender" },
      { id: "merchant", art: "merchant", name: "Merchant", x: 660, y: 700 },
      { id: "pavo", art: "npcPavo", name: "Pavo", x: 230, y: 410, hide: "ch7.sewers" },
      { id: "cell1", art: "npcCellMan", name: "Dye-works hand", x: 420, y: 400 },
      { id: "cell2", art: "npcCellDyer", name: "Dyer", x: 330, y: 392 },
      { id: "cell3", art: "npcLaundress", name: "Washerwoman", x: 360, y: 420 },
      { id: "r1", art: "npcVillagerM", name: "Porter", x: 560, y: 960 },
      { id: "r2", art: "npcGranny", name: "Old woman", x: 862, y: 650 },
      { id: "r3", art: "npcChild", name: "Child", x: 1220, y: 400 },
      { id: "laundress", art: "npcLaundress", name: "Washerwoman", x: 1420, y: 690 },
      { id: null, art: "npcVillagerF", x: 640, y: 400, path: [[300, 410], [700, 410], [1000, 400], [1400, 410]], loop: true, speed: 24 },
      { id: null, art: "npcDockhand", x: 700, y: 980, path: [[500, 990], [1050, 990]], speed: 22 },
      { id: null, art: "npcTrader", x: 1120, y: 690, path: [[960, 690], [1300, 700]], speed: 20 },
    ],
    props: [
      ["m4_greatPyramid", 850, 330, { solid: false, shadow: false, dy: -325 }],
      // upper terrace: houses stand on the pyramid's stone foot, the dye-works yard on the left
      ["m4_slumHouseTall", 120, 345], ["m4_dyeWorks", 345, 346], ["m4_slumHouseWide", 600, 346], ["m4_slumHovel", 760, 346], ["m4_streetShrine", 860, 400], ["m4_slumHouseTall", 980, 346], ["m4_slumHovel", 1130, 346], ["m4_slumHouseWide", 1280, 346], ["m4_slumHouseTall", 1450, 346],
      ["m4_ropeBridgeEnd", 1610, 358, { solid: false }], flat("m4_woodStairs", 1560, 440, { solid: false }),
      ["m4_dyeVat", 480, 410], ["m4_dyeVat", 548, 396], ["m4_waterJars", 700, 420], ["m4_clayOven", 1060, 425],
      flat("m4_drainGrate", 130, 392), flat("m4_clothesLine", 760, 395), flat("m4_clothesLine", 1180, 400),
      // band 1 (houses against the wall band, base at its south edge), market yard in front
      ["m4_slumHouseTall", 140, 612], ["m4_slumHouseWide", 300, 612], ["m4_slumHouseTall", 560, 612], ["m4_slumHovel", 720, 612], ["m4_slumHouseWide", 990, 612], ["m4_slumHovel", 1130, 612], ["m4_slumHouseTall", 1390, 612], ["m4_slumHouseWide", 1560, 612],
      ["m4_clothStall", 640, 706], ["m4_clothStall", 1010, 712], ["m4_waterJars", 540, 704], ["m4_clayOven", 770, 700], ["m4_dyeVat", 1250, 704], flat("m4_clothesLine", 260, 700),
      // band 2 (lower row), the Mender's Corner at the centre
      ["m4_slumHouseWide", 150, 902], ["m4_slumHovel", 400, 902], ["m4_slumHouseWide", 560, 902], ["m4_slumHovel", 700, 902], ["m4_menderInn", 1010, 902], ["m4_slumHouseWide", 1170, 902], ["m4_slumHovel", 1310, 902], ["m4_slumHouseWide", 1560, 902],
      ["m4_waterJars", 600, 952], ["m4_waterJars", 1180, 950], flat("m4_clothesLine", 460, 960),
      // the quay
      ["m4_quayPosts", 1270, 1070], ["m4_quayPosts", 1390, 1030], ["m4_quayPosts", 1020, 1060], ["crates", 900, 1030], ["crateStack", 820, 1050], ["fishBarrels", 1120, 1050], ["netRack", 560, 1040], ["anchor", 380, 1045], ["rowboatMoored", 250, 1030],
    ].concat(P1),
    scatter: [
      { keys: [["crates", 2], ["fishBarrels", 1], ["terracottaJars", 2], ["hayBales", 1], ["m4_waterJars", 1], ["puddle", 2]], n: 26, on: ["sand", "paved"], seed: 71, scaleRange: [0.85, 1] },
      { keys: [["bones2", 1], ["grass", 1], ["debris", 1]], n: 14, on: ["sand"], seed: 72 },
    ],
    amb: { night: true, birds: 0, butterflies: [], motes: 40, dust: 0xe0c090, tint: [0x30283c, 0.1], warm: [0xff9a50, 0.06], smoke: [[700, 600], [1100, 610], [330, 640], [1500, 540]], water: true },
  });
})();
