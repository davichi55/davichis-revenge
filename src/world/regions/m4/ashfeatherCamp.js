// M4 ch9: Ashfeather Camp (rebel forward camp under giant roots, town: no fights). Inn: the Cracked Mirror (entry `inn`). Shop `ashfeather`. The Menagerie Wagon (Dunmar) is here once `wagon.at=ashfeatherCamp`.
// Entries start from_rootdeepApproach inn. Exit rootdeepApproach@from_ashfeatherCamp (rope walk, E).
// NPC ids: innkeeper merchant imela oldDunmar captainDahl kessa dorrin mayle (show ch9.cell9) scout r1 r2 r3. Triggers ashfeatherArrive (entry), ashfeatherReturn (entry, repeats), hearthkinFreed (at the wagon, when k7.done).
(function () {
  const { R, E, P, L } = World.shapes, M = World.m3, props = [];
  // the back wall: roots the size of towers, the root arch over the long table
  props.push(["m4_giantRoot", 200, 292], ["m4_rootWall", 450, 292], ["m4_giantRoot", 720, 292], ["m4_rootWall", 980, 292], ["m4_giantRoot", 1230, 292], ["m4_rootWall", 1420, 292]);
  props.push(["m4_rootArch", 600, 560, { solid: [100, 20] }], ["m4_longTable", 600, 610], ["m4_hangLanterns", 470, 520], ["m4_hangLanterns", 740, 520]);
  // the war table: a stump with the map, banners
  props.push(["m4_rootStumpTable", 960, 600], ["m4_hangLanterns", 880, 560], ["m4_hangLanterns", 1040, 560], ["m4_ropeWalk", 1170, 520, { solid: false, dy: 3 - 520 }]);
  // the Cracked Mirror (a tent slung under a root, a shard of black glass nailed up as its sign), tents, medical tent, stores
  props.push(["m4_rootTent", 230, 440, { scale: 1.25 }], ["m4_glassWall", 330, 400, { scale: 0.35, solid: false }], ["m4_medTent", 1180, 420], ["m4_rootTent", 1370, 460], ["m4_campCrates", 1100, 700], ["m4_campCrates", 1200, 730], ["m4_rootTent", 420, 800], ["m4_rootTent", 1330, 800]);
  // cook fire, the wagon's yard, lanterns, ferns and glowing shrooms
  props.push(["campfire", 760, 780], ["m4_waterJars", 840, 760], ["menagerieWagon", 270, 780, { show: "wagon.at=ashfeatherCamp" }], ["m4_glowShroom", 120, 640], ["m4_glowShroom", 1440, 640], ["m4_bigFern", 90, 860], ["m4_bigFern", 1420, 900], ["m4_glowShroom", 700, 930], ["m4_rebelBanner", 640, 720], ["m4_rebelBanner", 900, 720], ["m4_rootClump", 540, 920, { solid: false }], ["m4_rootClump", 1000, 940, { solid: false }]);
  World.def("ashfeatherCamp", {
    name: "Ashfeather Camp", w: 1500, h: 1000, base: "rock", music: "rebelCamp", rim: 40,
    look: "A rebel forward camp hidden under giant tree roots seen from above in the deepest jungle: a floor of dark mud and moss trampled into paths, roots as thick as towers arching along the north edge, rope-and-plank walkways, green-brown canvas tents, a long table under a natural root arch, cook fires and soft green lanterns, glowing mushrooms, a rope walk leaving east. Tired, hopeful, damp, green light in the gloom.",
    legend: { grass: "dark wet moss and trampled mud with leaves and roots", sand: "packed trampled earth paths", floor: "grey plank walkways and rope-bridge planks", rock: "colossal tree roots and dark jungle", road: "pale beaten earth path" },
    bank: { grass: "green", sand: "dirt", floor: "dark", rock: "dark", road: "dirt" },
    grade: { grass: { mul: [0.5, 0.72, 0.5], add: [-4, 4, -4] }, sand: { mul: [0.7, 0.62, 0.5], add: [-2, 0, -4] }, floor: { mul: [0.8, 0.7, 0.55], add: [0, 0, 0] }, rock: { mul: [0.45, 0.5, 0.42], add: [0, 2, 0] }, _: [0.95, 1, 0.95] },
    marks: [{ k: "dot", on: ["grass"], n: 70, col: [160, 255, 190], a: 0.6, r: [1, 2], hi: false }, { k: "blot", on: ["grass"], n: 16, col: [20, 40, 20], a: 0.3, r: [14, 40] }],
    guide: [
      ["grass", R(60, 290, 1380, 650)], ["sand", E(620, 640, 520, 200)], ["sand", E(1200, 560, 240, 140)], ["road", L([[1440, 600], [1100, 600]], 90)], ["floor", L([[1300, 600], [1460, 600]], 66)],
      ["sand", E(300, 700, 220, 120)],
    ],
    entries: { start: { x: 1340, y: 640, face: "left" }, from_rootdeepApproach: { x: 1340, y: 640, face: "left" }, inn: { x: 260, y: 520, face: "down" } },
    exits: [{ rect: [1440, 550, 56, 100], to: "rootdeepApproach", entry: "from_ashfeatherCamp", push: [1, 0], floor: "floor" }],
    triggers: [
      { id: "ashfeatherArrive", rect: [1240, 560, 180, 140] }, { id: "ashfeatherReturn", rect: [1150, 560, 80, 140], once: false },
      { id: "hearthkinFreed", rect: [190, 790, 220, 100], when: ["k7.done", "!k7.freed"], once: false },
    ],
    npcs: [
      { id: "innkeeper", art: "npcRebelCook", name: "Innkeeper", x: 300, y: 520, hint: "E / Space: the Cracked Mirror" },
      { id: "merchant", art: "merchant", name: "Merchant", x: 1150, y: 760 },
      { id: "imela", art: "npcImela", name: "Imela", x: 940, y: 650 },
      { id: "oldDunmar", art: "npcDunmar", name: "Old Dunmar", x: 340, y: 830, show: "wagon.at=ashfeatherCamp" },
      { id: "captainDahl", art: "npcCaptainDahl", name: "Captain Dahl", x: 1010, y: 650 },
      { id: "kessa", art: "npcKessa", name: "Kessa Vorn", x: 760, y: 840, show: "ch9.cell9" }, { id: "dorrin", art: "npcDorrin", name: "Dorrin Hale", x: 820, y: 880, show: "ch9.cell9" }, { id: "mayle", art: "npcMayle", name: "Mayle Tarn", x: 700, y: 880, show: "ch9.cell9" },
      { id: "scout", art: "npcScout", name: "Scout", x: 1110, y: 520, hint: "E / Space: the bounty rope" },
      { id: "r1", art: "npcFighter", name: "Fighter", x: 560, y: 700 }, { id: "r2", art: "npcRebelMedic", name: "Medic", x: 1230, y: 480 }, { id: "r3", art: "npcSentry", name: "Sentry", x: 1380, y: 700 },
      { id: null, art: "npcFighter", x: 600, y: 860, path: [[420, 860], [900, 860]], speed: 16 }, { id: null, art: "npcRebelCook", x: 800, y: 740, still: true },
    ],
    props,
    scatter: [{ keys: [["m4_glowShroom", 1], ["m4_bigFern", 1], ["m4_rootClump", 1], ["crates", 1]], n: 14, on: ["grass"], seed: 351, scaleRange: [0.8, 1] }],
    lights: [[600, 520, 200, 0.5], [960, 560, 160, 0.5], [760, 780, 160, 0.6], [1180, 420, 130, 0.4]],
    dark: { ambient: 0.32, radius: 300, color: 0x020a06 },
    amb: { birds: 0, butterflies: [], water: false, motes: 50, dust: 0x90e8b0, tint: [0x10281c, 0.14], warm: [0xffb060, 0.05], smoke: [[760, 780]], weather: ["spores"], vignette: 1 },
  });
})();
