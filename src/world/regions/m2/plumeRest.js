// R5 Plume Rest (M2 spec 7.2): a treetop village of feather-weavers: platforms ringed by hanging loom-frames, dyed feathers on lines, lanterns, a rope lift. Music treetopTown, no fights. Inn: the Soft Nest.
// Entries: start, from_featherfallCanopy (W bridge), inn. Exit: featherfallCanopy@from_plumeRest (W). Triggers plumeArrive, riverBarge (lower dock, show ch4.done). NPCs innkeeper merchant yaxa oldDunmar r1 weaver r2 old man r3 child weaver.
(function () {
  const { R, E, P, L } = World.shapes, K = World.kitM2, W = 1500, H = 1000;
  const plat = (cx, cy, rx, ry, seed) => K.blobPts(cx, cy, rx, ry, seed, { jag: 0.06, n: 20 });
  const def = {
    name: "Plume Rest", ground: "assets/regions/plumeRest.jpg", w: W, h: H, music: "treetopTown", rim: 30, base: "water",
    look: "A treetop village of feather-weavers seen from above: round wooden plank platforms built around giant tree trunks and joined by plank bridges, hanging loom frames, lines of dyed red, blue and yellow feathers, lanterns, woven nests; around and below is white drifting mist with dark green giant tree crowns far down. Warm lantern light, airy and cosy.",
    legend: { floor: "weathered wooden plank platform floor with woven mats, feathers and rope lashings", water: "a sea of white drifting mist with the dark green crowns of giant trees far below, seen from above", rock: "hanging jungle foliage" },
    guide: [
      ["floor", P(plat(750, 480, 400, 230, 1))], ["floor", P(plat(740, 150, 250, 90, 2))], ["floor", P(plat(1180, 300, 210, 130, 3))], ["floor", P(plat(1220, 660, 210, 130, 4))], ["floor", P(plat(300, 720, 230, 130, 5))], ["floor", P(plat(760, 850, 230, 90, 6))],
      ["floor", L([[0, 500], [400, 500]], 90)], ["floor", L([[740, 300], [740, 220]], 90)], ["floor", L([[1030, 400], [1120, 340]], 80)], ["floor", L([[1000, 560], [1100, 620]], 80)], ["floor", L([[450, 560], [360, 650]], 80)], ["floor", L([[760, 700], [760, 790]], 90)],
    ],
    entries: { start: { x: 110, y: 500, face: "right" }, from_featherfallCanopy: { x: 110, y: 500, face: "right" }, inn: { x: 640, y: 560, face: "down" } },
    exits: [{ rect: [10, 450, 50, 100], to: "featherfallCanopy", entry: "from_plumeRest", push: [-1, 0], floor: "floor" }],
    triggers: [{ id: "plumeArrive", rect: [260, 450, 100, 100] }, { id: "riverBarge", rect: [690, 880, 140, 60], show: "ch4.done" }],
    npcs: [
      { id: "innkeeper", art: "innkeeper", name: "Innkeeper", x: 660, y: 520 },
      { id: "merchant", art: "npcTrader", name: "Weaver-merchant", x: 1230, y: 640 },
      { id: "yaxa", art: "npcYaxa", name: "Mother Yaxa", x: 880, y: 440 },
      { id: "oldDunmar", art: "npcDunmar", name: "Old Dunmar", x: 380, y: 760 },
      { id: "r1", art: "npcWeaver", name: "Weaver", x: 1150, y: 330 },
      { id: "r2", art: "npcGranny", name: "Old man", x: 700, y: 170 },
      { id: "r3", art: "npcChild", name: "Child with a kite-string", x: 560, y: 370 },
      { id: "weaver", art: "npcWeaver", name: "Weaver", x: 1090, y: 270, flip: true },
      { id: null, art: "npcVillagerF", x: 900, y: 560, path: [[820, 580], [1000, 560]], speed: 16 }, { id: null, art: "npcChild", x: 1180, y: 700, path: [[1120, 720], [1300, 700]], speed: 26 },
    ],
    props: [
      ["m2_plumeInn", 640, 440], ["m2_weaverHutA", 860, 330], ["m2_weaverHutB", 520, 340], ["m2_loomFrame", 970, 480], ["m2_featherLine", 450, 440], ["m2_yaxaShrine", 920, 520], ["m2_windBells", 760, 540], ["m2_platformLamp", 560, 580], ["m2_platformLamp", 880, 590], ["m2_nestSeat", 740, 600, { solid: false }],
      ["m2_featherStall", 1200, 560], ["m2_dyeVats", 1090, 700], ["m2_featherBundles", 1320, 700], ["m2_loomFrame", 1140, 250], ["m2_kiteRack", 1280, 330], ["m2_featherLine", 1100, 400], ["m2_weaverHutA", 1250, 280], ["m2_loomBasket", 1230, 760, { solid: false }],
      ["wagon", 250, 690, { hide: "wagon.at=plumeRest" }], ["menagerieWagon", 250, 690, { show: "wagon.at=plumeRest" }], ["m2_tarpCrates", 380, 820], ["m2_hayStack", 190, 790], ["m2_featherLine", 440, 700], ["m2_platformLamp", 330, 780], ["m2_hen", 300, 790, { solid: false }],
      ["m2_weaverHutB", 700, 130], ["m2_featherBundles", 820, 170], ["m2_loomBasket", 620, 190, { solid: false }], ["m2_ropeLift", 760, 880, { solid: [40, 14] }], ["m2_barge", 760, 960, { show: "ch4.done", solid: false }], ["m2_platformLamp", 650, 880], ["m2_platformLamp", 880, 880],
      ["m2_bridgeAnchor", 90, 560], ["m2_featherCharms", 260, 560, { solid: false }], ["m2_featherCharms", 1000, 330], ["m2_wovenLantern", 440, 580, { solid: false }], ["m2_wovenLantern", 1050, 470, { solid: false }],
    ],
    lights: [[640, 440, 170, 0.5], [760, 480, 220, 0.3], [1200, 560, 140, 0.4], [250, 700, 130, 0.4]],
    amb: { birds: 6, water: false, dust: 0xe8f0e0, motes: 40, tint: [0x18302c, 0.1], warm: [0xffd890, 0.08], weather: ["mist", "clear", "clear"], butterflies: K.flies(W, H, 4) },
  };
  const at = K.terrainAt(def);
  def.props = def.props.concat(K.fill([0, 0, W, H], 140, [["m2_jungleTreeB", 2], ["m2_jungleTreeA", 2], ["m2_giantCeiba", 1], ["m2_fanPalm", 1]], { seed: 921, chance: 0.5, opts: { solid: false, shadow: false, alpha: 0.9 }, skip: (x, y) => { if (at(x, y) !== "water") return true; for (const [dx, dy] of [[70, 0], [-70, 0], [0, 70], [0, -70], [50, 50], [-50, -50], [50, -50], [-50, 50]]) if (at(x + dx, y + dy) !== "water") return true; return x < 30 || y < 30 || x > W - 30 || y > H - 30; } }));
  World.def("plumeRest", def);
})();
