// R5 Marigold Hollow (M2 spec 7.7): a quiet farming hamlet in a green valley: marigold fields in orange rows, whitewashed houses, a stone well with a flat stone, hens, a shrine of tiny clay lamps. No fights. Inn: the Gate and Gourd.
// Entries: start, from_featherfallCanopy (N stair), from_imelasHouse, inn. Exits: featherfallCanopy@from_marigoldHollow (N stair), imelasHouse@from_marigoldHollow (west house door, need ch4.yaxa).
// Triggers marigoldArrive, wellDuel (forced after ch4.cellar, when ch4.cellar and not ch4.kessa2), wellStone (press, the flat stone). NPCs innkeeper merchant tamoc neeli r1 farmer r2 old woman r3 child.
(function () {
  const { R, E, P, L } = World.shapes, K = World.kitM2, W = 1500, H = 1000;
  const valley = K.blobPts(750, 520, 700, 430, 1501, { jag: 0.07, n: 24 });
  const fieldA = K.wobPoly([[200, 700], [560, 690], [570, 910], [190, 920]], 10, 1502, 80), fieldB = K.wobPoly([[920, 710], [1300, 700], [1310, 900], [930, 920]], 10, 1503, 80);
  const def = {
    name: "Marigold Hollow", ground: "assets/regions/marigoldHollow.jpg", w: W, h: H, music: "marigold", rim: 40, base: "rock",
    look: "A peaceful farming hamlet in a small green valley seen from above: lush green grass with dirt lanes, tilled brown field plots with orange and yellow marigold rows, whitewashed adobe houses with thatch and red tile roofs, a round stone well with a flat stone beside it, small gardens, a stone stair climbing the cliff to the north, fruit trees; the valley is ringed by steep green wooded hills. Warm gentle morning light, soft greens with orange flowers.",
    legend: { grass: "lush green meadow grass with clover, small white flowers and a few orange marigolds", road: "packed dirt village lane with cart ruts and worn edges", red: "tilled dark brown field soil in furrows", paved: "flat grey stone paving around the well", rock: "steep green wooded hillside with dense bushes and trees seen from above" },
    guide: [
      ["grass", P(valley)], ["red", P(fieldA)], ["red", P(fieldB)], ["road", L(K.wob([[750, 20], [750, 280], [740, 460]], 8, 1510, 80), 100)], ["road", L(K.wob([[250, 560], [500, 520], [750, 520], [1000, 540], [1250, 500]], 10, 1511, 90), 90)], ["road", L(K.wob([[750, 520], [760, 700], [750, 880]], 8, 1512, 80), 80)], ["paved", E(750, 520, 130, 80)],
    ],
    entries: { start: { x: 750, y: 140, face: "down" }, from_featherfallCanopy: { x: 750, y: 140, face: "down" }, from_imelasHouse: { x: 230, y: 600, face: "down" }, inn: { x: 1050, y: 470, face: "down" } },
    exits: [
      { rect: [690, 22, 120, 56], to: "featherfallCanopy", entry: "from_marigoldHollow", push: [0, -1] },
      { rect: [200, 505, 60, 36], to: "imelasHouse", entry: "from_marigoldHollow", push: [0, -1], need: "ch4.yaxa", blocked: "imelaHouseLocked", floor: "road" },
    ],
    triggers: [{ id: "marigoldArrive", rect: [680, 160, 140, 90] }, { id: "wellDuel", rect: [660, 450, 180, 130], when: ["ch4.cellar", "!ch4.kessa2"] }, { id: "wellStone", rect: [820, 500, 70, 60], press: true, once: false }],
    npcs: [
      { id: "innkeeper", art: "innkeeper", name: "Innkeeper", x: 1060, y: 440 },
      { id: "merchant", art: "npcTrader", name: "Shopkeeper", x: 500, y: 430 },
      { id: "tamoc", art: "npcTamoc", name: "Elder Tamoc", x: 960, y: 640 },
      { id: "neeli", art: "npcNeeli", name: "Neeli", x: 690, y: 570 },
      { id: "r1", art: "npcFarmer", name: "Farmer", x: 580, y: 780 },
      { id: "r2", art: "npcGranny", name: "Old woman", x: 330, y: 600 },
      { id: "r3", art: "npcChild", name: "Child", x: 1150, y: 600 },
      { id: null, art: "npcFarmer", x: 400, y: 800, path: [[300, 800], [500, 800], [500, 850], [300, 850]], loop: true, speed: 14 }, { id: null, art: "npcVillagerF", x: 900, y: 430, path: [[820, 440], [1000, 450]], speed: 16 },
    ],
    props: [
      ["m2_adobeHouseA", 230, 500], ["m2_adobeHouseB", 500, 400], ["m2_gourdInn", 1050, 400], ["m2_adobeHouseB", 1250, 430, { flip: true }], ["m2_adobeHouseA", 960, 640, { flip: true }], ["m2_adobeHouseA", 380, 640], ["m2_adobeHouseB", 1170, 660],
      ["m2_marigoldWell", 760, 520, { solid: [32, 14] }], ["m2_stairPost", 690, 110], ["m2_stairPost", 810, 110], ["m2_flowerWreath", 690, 330, { solid: false }], ["m2_clayLampShrine", 1280, 560], ["m2_clayLampShrine", 140, 600],
      ["m2_hayStack", 600, 700], ["m2_hayStack", 880, 690], ["m2_scarecrow", 380, 780], ["m2_scarecrow", 1110, 800], ["m2_gourdTrellis", 640, 340], ["m2_gourdTrellis", 1180, 540], ["m2_henHouse", 330, 460], ["m2_henHouse", 1360, 680], ["m2_waterTrough", 880, 440], ["m2_stoneFence", 300, 720, { solid: [50, 8] }], ["m2_stoneFence", 1110, 720, { solid: [50, 8] }], ["m2_appleTree", 130, 400], ["m2_appleTree", 1360, 520], ["m2_appleTree", 560, 560], ["m2_appleTree", 1040, 560],
      ["m2_hen", 340, 480, { solid: false }], ["m2_hen", 370, 500, { solid: false }], ["m2_hen", 1350, 700, { solid: false }], ["m2_hen", 810, 560, { solid: false }], ["m2_capybara", 0, 0, { show: "never.x" }],
    ].filter(p => !(p[3] && p[3].show === "never.x")),
    lights: [],
    amb: { birds: 9, water: false, dust: 0xf0e8c0, motes: 24, tint: [0x182810, 0.06], warm: [0xffe0a0, 0.08], butterflies: K.flies(W, H, 6) },
  };
  const rowsA = [], rowsB = [];
  for (let y = 740; y <= 900; y += 62) for (let x = 250; x <= 520; x += 150) rowsA.push([(x + y) % 2 ? "m2_marigoldRowA" : "m2_marigoldRowB", x + (y % 3) * 4, y + 56, { solid: false, shadow: false }]);
  for (let y = 750; y <= 900; y += 62) for (let x = 980; x <= 1250; x += 150) rowsB.push([(x + y) % 2 ? "m2_marigoldRowB" : "m2_marigoldRowA", x, y + 56, { solid: false, shadow: false }]);
  const trees = [["m2_appleTree", 1.5], ["m2_jungleTreeB", 2], ["m2_jungleTreeSlim", 1.5], ["m2_jungleTreeA", 1.5], ["m2_fanPalm", 0.6], ["m2_flowerBush", 1.5], ["m2_fernClump", 1]];
  def.props = def.props.concat(rowsA, rowsB, K.blockedFill(def, 86, trees, { seed: 1521, edgeKeys: trees }));
  def.scatter = [{ keys: [["m2_flowerBush", 2], ["m2_fernClump", 2], ["m2_mushrooms", 0.5], ["m2_hen", 0.3]], n: 40, on: ["grass"], seed: 1531 }];
  World.def("marigoldHollow", def);
})();
