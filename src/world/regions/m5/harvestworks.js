// Post-game, optional: the Sealed Harvest Works under the south islet of the Starfall Isles (2000x1400, dark). Nothing in the story leads here. The Company's first harvesting
// works: the Intake Hall (cages, collar hooks), the Sorting Floor (glass tanks, carts, chains), a causeway north to the Engine Pit, where Harvest Engine No. 1 sleeps (super boss, src/rules/m8.js).
// Entry from_starfallIsles (the hatch stair, SW). Exit starfallIsles@from_harvestWorks. Triggers hwEnter hwHum hwSort hwPit, lore NPCs hwNotice hwLog hwTally. No random fights: the works are silent.
(function () {
  const { R, E, P, L } = World.shapes, W = 2000, H = 1400, fx = { solid: false };
  World.def("harvestWorks", {
    name: "The Sealed Harvest Works", w: W, h: H, music: "harvestWorks", rim: 40, base: "rock", ground: "assets/regions/harvestWorks.jpg",
    look: "An abandoned underground factory seen from above, dark: riveted iron floor plates, rails and drains, a long causeway of metal grating, rust stains, a huge round pit at the far end with a ring walkway around a black glass floor. Black rock walls.",
    legend: { rock: "black rock walls of a mine", paved: "riveted dark iron floor plates with rust", road: "a metal grating causeway", glass: "a black glass pit floor with faint blue light", ash: "oily grime and soot on iron" },
    guide: [
      ["road", L([[60, 1240], [420, 1220]], 110)],                                                   // the hatch stair
      ["paved", P([[380, 1060], [1000, 1000], [1060, 1320], [400, 1330]])], ["ash", E(700, 1180, 180, 70)],   // the Intake Hall
      ["road", L([[980, 1100], [1180, 980]], 120)],
      ["paved", P([[1000, 700], [1560, 660], [1600, 1060], [1060, 1080]])], ["ash", E(1300, 900, 150, 60)],   // the Sorting Floor
      ["road", L([[1260, 700], [1240, 560]], 110)],                                                  // the causeway
      ["paved", E(1240, 330, 440, 240)], ["glass", E(1240, 300, 260, 140)],                         // the Engine Pit: ring walkway round the black glass
    ],
    dark: { ambient: 0.82, radius: 210, fireRadius: 170 },
    entries: { start: { x: 140, y: 1240, face: "right" }, from_starfallIsles: { x: 140, y: 1240, face: "right" } },
    exits: [{ rect: [40, 1180, 56, 120], to: "starfallIsles", entry: "from_harvestWorks", push: [1, 0] }],
    triggers: [{ id: "hwEnter", rect: [120, 1170, 200, 140] }, { id: "hwHum", rect: [820, 1040, 160, 240] }, { id: "hwSort", rect: [1120, 760, 260, 220] }, { id: "hwPit", rect: [1150, 520, 190, 120] }],
    props: [
      // the Intake Hall: cages, collar hooks, chains, a Company notice board
      ["emptyCage", 480, 1110], ["emptyCage", 560, 1110], ["m2_cageFrame", 640, 1100], ["emptyCage", 480, 1300], ["m2_openCage", 580, 1300], ["m4_collarHooks", 760, 1080], ["m4_collarHooks", 860, 1090],
      ["m4_chainsHanging", 700, 1060, fx], ["m4_chainPile", 900, 1290], ["m2_collarPile", 820, 1300], ["m4_shackledBones", 650, 1240], ["m4_mineLamp", 420, 1200, fx], ["m4_mineLamp", 980, 1200, fx], ["m4_drainGrate", 720, 1190, fx],
      ["pipeRun", 450, 1035, fx], ["pipeRun", 650, 1020, fx], ["leakPipe", 860, 1020, fx], ["steamVent", 940, 1150, fx],
      // the Sorting Floor: glass tanks with husks, carts on rails, chains, a desk with the last shift's log
      ["m4_glassTank", 1080, 760], ["m4_glassTank", 1160, 740], ["m4_glassTank", 1440, 720], ["m4_glassTank", 1520, 740], ["m4_brineVat", 1500, 980], ["mineCart", 1100, 1000], ["mineCart", 1180, 1020],
      ["craneHoist", 1380, 760], ["scaffoldCrane", 1560, 880], ["pyrChains", 1250, 860, fx], ["m4_chainPile", 1460, 1040], ["m4_ventGrate", 1300, 960, fx], ["steamVent", 1200, 900, fx], ["steamVent", 1420, 900, fx],
      ["starhavenDesk", 1080, 880], ["m4_forgeAnvil", 1530, 820], ["saltmereForge", 1560, 1000], ["m4_mineLamp", 1040, 700, fx], ["m4_mineLamp", 1560, 690, fx],
      // the causeway and the pit: warning signs, chains across the way, the ring of dead lamps
      ["m4_cliffSign", 1180, 640], ["m4_cliffSign", 1320, 640, { flip: true }], ["spineChainPost", 1190, 590], ["spineChainPost", 1300, 590],
      ["m4_brazierUnlit", 880, 330], ["m4_brazierUnlit", 1600, 330], ["m4_brazierUnlit", 1000, 190], ["m4_brazierUnlit", 1480, 190], ["m4_brazierUnlit", 1000, 480], ["m4_brazierUnlit", 1480, 480],
      ["pipeRun", 900, 200, fx], ["pipeRun", 1580, 200, fx], ["m2_collarPile", 1640, 440], ["m4_shackledBones", 860, 440], ["skullPile", 1620, 260],
    ],
    scatter: [{ keys: [["m4_shackledBones", 1], ["skullPile", 0.5], ["m4_chainPile", 0.6], ["crates", 0.6]], n: 18, seed: 61, on: ["paved"], opts: { solid: false }, scaleRange: [0.6, 0.9] }],
    npcs: [
      { id: "hwNotice", art: "m2_paintedSign", name: "A Company notice board", x: 430, y: 1080, noTurn: true },
      { id: "hwLog", art: "readingLamp", name: "The last shift's log", x: 1120, y: 880, noTurn: true },
      { id: "hwTally", art: "m4_cliffSign", name: "A tally painted on the wall", x: 1500, y: 680, noTurn: true },
    ],
    amb: { motes: 30, dust: 0x9fb0c8, tint: [0x101828, 0.3], warm: [0x6080ff, 0.04], water: false, birds: 0,
      smoke: [[940, 1150, 0x707880], [1200, 900, 0x707880], [1420, 900, 0x707880]],
      hunters: [{ id: "harvestEngineDormant", art: "harvestEngine", lane: [[1230, 300], [1250, 300]], mode: "pingpong", speed: 0, sight: 0, size: 150, trigger: "hwPit", hide: "x.harvestEngine" }] },
  });
})();
