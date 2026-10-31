// M3 / ch5: the Cold Vaults (side wing, dungeon, dark). Table "coldVault" 22 s. Entries start from_undervaults. Exit undervaults@from_coldVaults.
// Gather rimecrystal1..3, chest g28_shattererChisel, interact spot coldDoorLate (frozen door, opens only after ch10: need ch10.done).
(function () {
  const { R, E, P, L } = World.shapes, M = World.m3, props = [], ice = 0xbfe4ff;
  props.push(...M.ring(["iceSpire", "iceCluster", "iceSpire"], 400, 640, 250, 150, 7, {}, Math.PI * 0.1, Math.PI * 1.9, 18, 3), ["archiveCabinet", 170, 520, { tint: ice }], ["archiveCabinet", 290, 520, { tint: ice }], ["builderPillar", 180, 760], ["builderPillar", 480, 760], ["lightStele", 340, 620, { tint: 0x80c0ff }]);
  props.push(...M.row(["archiveCabinet", "copyTube"], 700, 180, 1100, 180, 4, { tint: ice }, 0, 4), ["iceCluster", 760, 340], ["iceSpire", 960, 300], ["iceCluster", 1100, 430], ["iceSpire", 680, 470], ["builderPillar", 660, 250], ["builderPillar", 1140, 250], ["lightStele", 900, 220, { tint: 0x80c0ff }]);
  props.push(...M.row(["copyTube", "archiveCabinet"], 700, 760, 1100, 760, 4, { tint: ice }, 0, 5), ["iceCluster", 740, 980], ["iceSpire", 900, 1060], ["iceCluster", 1090, 920], ["iceSpire", 1120, 1060], ["builderPillar", 660, 880], ["builderPillar", 1140, 1010], ["iceSpire", 800, 880], ["vaultRubble", 980, 840]);
  props.push(["builderPillar", 1360, 420], ["builderPillar", 1640, 420], ["builderPillar", 1360, 900], ["builderPillar", 1640, 900], ["iceSpire", 1420, 560], ["iceCluster", 1580, 640], ["iceSpire", 1500, 800], ["iceCluster", 1390, 760],
    ["builderDoor", 1720, 640, { tint: 0xbfe2ff }], ["iceCluster", 1710, 740], ["iceCluster", 1710, 560], ["lightStele", 1600, 520, { tint: 0x80c0ff }], ["lightStele", 1450, 860, { tint: 0x80c0ff }], ["copyTube", 1520, 380, { tint: ice }]);
  World.def("coldVaults", {
    name: "The Cold Vaults", w: 1800, h: 1300, base: "rock", music: "vault", rim: 44,
    look: "A side wing of builder cooling chambers seen from above: black-and-gold stone floors thick with white frost, sheets of blue ice on the floor, clusters of glowing ice crystals, blue lamps, frozen pipes. Silent, bitterly cold, blue-white light.",
    legend: { floor: "black star-metal stone with gold inlay lines, covered in thin white frost", salt: "thick white hoarfrost, cracked, with blue shadows", glass: "smooth translucent blue ice sheet over black stone, with frozen bubbles", rock: "solid black stone walls and frozen blocks" },
    bank: { floor: "grey", salt: "salt", glass: "teal" }, grade: { floor: { mul: [0.5, 0.62, 0.85], add: [8, 16, 30] }, salt: { mul: [0.75, 0.95, 1.2], add: [-8, 8, 30] }, glass: { mul: [0.8, 1.1, 1.4], add: [0, 20, 44] }, _: [0.95, 1.02, 1.1] },
    marks: [{ k: "crack", on: ["floor", "glass"], n: 50, col: [210, 235, 255], a: 0.6, len: [16, 60] }, { k: "dot", on: ["salt", "floor"], n: 90, col: [235, 248, 255], a: 0.8, r: [1, 2.2], hi: false }],
    guide: [
      ["floor", R(40, 560, 120, 200)], ["floor", R(100, 440, 440, 420)], ["salt", E(320, 650, 190, 150)], ["floor", R(520, 600, 140, 120)], ["floor", R(620, 100, 560, 420)], ["glass", E(900, 320, 190, 110)], ["floor", R(860, 500, 120, 280)],
      ["floor", R(620, 700, 560, 430)], ["glass", E(900, 940, 170, 110)], ["salt", E(720, 860, 100, 70)], ["floor", R(1160, 600, 200, 130)], ["floor", R(1300, 340, 420, 660)], ["glass", E(1500, 680, 130, 190)], ["salt", E(1420, 440, 90, 60)],
    ],
    entries: { start: { x: 130, y: 660, face: "right" }, from_undervaults: { x: 130, y: 660, face: "right" } },
    exits: [{ rect: [40, 600, 70, 120], to: "undervaults", entry: "from_coldVaults", push: [1, 0] }],
    chests: [{ id: "g28_shattererChisel", x: 1620, y: 440 }],
    gather: [{ id: "rimecrystal1", x: 930, y: 380, label: "Rime crystal", color: 0x9fe0ff }, { id: "rimecrystal2", x: 1040, y: 1000, label: "Rime crystal", color: 0x9fe0ff }, { id: "rimecrystal3", x: 1500, y: 880, label: "Rime crystal", color: 0x9fe0ff }],
    npcs: [{ id: "coldDoorLate", art: null, name: "The frozen door", x: 1720, y: 668, hint: "E / Space: the frozen door" }],
    props,
    lights: [[340, 620, 130, 0.7], [900, 220, 120, 0.7], [1600, 520, 120, 0.7], [1450, 860, 120, 0.7], [1720, 640, 130, 0.8], [900, 940, 100, 0.5]],
    dark: { ambient: 0.62, radius: 210, color: 0x04081a },
    encounter: { table: "coldVault", rate: 22 },
    amb: { birds: 0, butterflies: [], motes: 70, dust: 0xbfe0ff, tint: [0x103060, 0.14], weather: ["snow"], sparkle: { terrain: ["salt", "glass"] } },
  });
})();
