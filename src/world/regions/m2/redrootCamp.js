// R4 Redroot Camp (M2 spec 3.7): a resistance camp inside a fallen jungle temple: moss on carved stone, tents in the nave, cook fires, a shrine to the freed creatures. No fights. Inn: the Hollow Log (mult 0.5).
// Entries: start, from_greenmawJungle (N gate), inn. Exit: greenmawJungle@from_redrootCamp (N). Trigger redrootArrive. NPCs innkeeper merchant itzel r1 runaway r2 healer r3 old guard shrineKeeper.
(function () {
  const { R, E, P, L } = World.shapes, K = World.kitM2, W = 1500, H = 1000;
  const def = {
    name: "Redroot Camp", ground: "assets/regions/redrootCamp.jpg", w: W, h: H, music: "resistance", rim: 40, base: "rock",
    look: "A resistance camp inside a collapsed jungle temple seen from above: a big rectangular hall of mossy carved grey stone flagstones with cracks and roots pushing through, broken carved walls, patches of grass and ferns where the roof fell in, trampled earth around camp fires, cloth tents, and thick dense jungle outside the walls. Warm fire glow, humid green light.",
    legend: { paved: "mossy carved grey-green temple flagstones with cracks, glyphs, roots and ferns", grass: "patches of ferns, moss and damp earth growing through the temple floor", road: "a trodden earth path through the jungle to the temple gate", wall: "tall crumbling carved stone temple wall top covered in moss and vines", rock: "dense impassable green jungle seen from above" },
    guide: [
      ["paved", R(200, 150, 1100, 700)], ["grass", E(420, 650, 150, 90)], ["grass", E(1130, 330, 140, 80)], ["grass", E(760, 820, 120, 40)], ["road", L(K.wob([[750, 40], [750, 160]], 0, 1, 90), 130)],
      ["wall", R(180, 130, 480, 34)], ["wall", R(850, 130, 470, 34)], ["wall", R(180, 836, 1140, 34)], ["wall", R(180, 130, 34, 740)], ["wall", R(1286, 130, 34, 740)],
      ["rock", R(186, 400, 28, 150)],
    ],
    entries: { start: { x: 750, y: 230, face: "down" }, from_greenmawJungle: { x: 750, y: 230, face: "down" }, inn: { x: 420, y: 470, face: "down" } },
    exits: [{ rect: [690, 30, 120, 56], to: "greenmawJungle", entry: "from_redrootCamp", push: [0, -1] }],
    triggers: [{ id: "redrootArrive", rect: [680, 190, 140, 90] }],
    npcs: [
      { id: "innkeeper", art: "innkeeper", name: "Innkeeper", x: 440, y: 440 },
      { id: "merchant", art: "npcTrader", name: "Quartermaster", x: 1070, y: 450 },
      { id: "itzel", art: "npcItzel", name: "Itzel Coyo", x: 810, y: 260 },
      { id: "r1", art: "npcRunaway", name: "Runaway", x: 580, y: 600 },
      { id: "r2", art: "npcHealer", name: "Healer", x: 340, y: 720 },
      { id: "r3", art: "npcOldGuard", name: "Old guard", x: 1180, y: 700 },
      { id: "shrineKeeper", art: "npcShrineKeeper", name: "Shrine-keeper", x: 760, y: 770 },
      { id: null, art: "npcRefugeeW", x: 700, y: 560, path: [[640, 520], [900, 520], [900, 640]], loop: true, speed: 18 },
      { id: null, art: "npcRefugeeM", x: 1000, y: 700, path: [[960, 700], [1100, 700]], speed: 14 },
    ],
    props: [
      ["m2_templePillar", 450, 280], ["m2_templePillar", 450, 520], ["m2_templePillar", 1050, 280], ["m2_templePillar", 1050, 560], ["m2_templePillar", 620, 330, { solid: [10, 6] }], ["m2_templePillar", 880, 330],
      ["m2_templeWall", 340, 220], ["m2_templeWall", 1150, 215, { flip: true }], ["m2_templeSteps", 1150, 810, { flip: true }], ["m2_templeSteps", 330, 815],
      ["m2_hideTent", 330, 380], ["m2_hideTent", 520, 400], ["m2_hideTent", 1060, 380], ["m2_hideTent", 1220, 420], ["m2_hideTent", 330, 560], ["m2_hideTent", 1220, 600], ["m2_hammock", 570, 740], ["m2_hammock", 960, 770], ["m2_hammock", 250, 600],
      ["m2_cookPot", 700, 500], ["m2_cookPot", 880, 640, { fire: [0, -8, 1] }], ["m2_spearRack", 940, 300], ["m2_spearRack", 580, 270], ["m2_herbRack", 300, 770], ["m2_campCrates", 1130, 500], ["m2_campCrates", 1000, 480, { flip: true }], ["m2_waterBarrel", 1150, 560], ["m2_waterBarrel", 280, 470],
      ["m2_freedShrine", 760, 840, { solid: [60, 10] }], ["m2_mossAltar", 1180, 800], ["m2_collarPile", 690, 800], ["m2_treeLookout", 1240, 230, { solid: [40, 14] }], ["m2_stoneBench", 0, 0, { show: "never.flag" }],
      ["m2_campSign", 700, 120],
    ],
    lights: [[700, 500, 190, 0.6], [880, 640, 170, 0.5], [760, 800, 160, 0.5]],
    amb: { birds: 5, water: false, dust: 0xd8e0b0, motes: 40, tint: [0x183018, 0.16], warm: [0xffb060, 0.07], smoke: [[700, 470, 0x998877], [880, 610, 0x998877]], butterflies: K.flies(W, H, 2) },
  };
  def.props = def.props.filter(p => p[0] !== "m2_stoneBench");
  const trees = [["m2_jungleTreeA", 3], ["m2_jungleTreeB", 2], ["m2_giantCeiba", 1.2], ["m2_stranglerFig", 1.5], ["m2_fanPalm", 1.5], ["m2_treeFern", 1]];
  def.props = def.props.concat(K.blockedFill(def, 82, trees, { seed: 511, skip: (x, y) => x > 600 && x < 900 && y < 200 && false }));
  def.scatter = [{ keys: [["m2_fernClump", 3], ["m2_giantLeaf", 2], ["m2_ruinRubble", 1], ["m2_mossBoulder", 1], ["m2_mushrooms", 1]], n: 45, on: ["paved", "grass"], seed: 521 }];
  World.def("redrootCamp", def);
})();
