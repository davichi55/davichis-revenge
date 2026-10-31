// R1 Cistern of the Burnt Gate: half-sunk builder water vault (dark). Table "cistern" ~22 s. Chest g5_bullringBronze (G5). Trigger karvanAmbush at the north gate (Raid Optio Karvan).
(function () {
  const { R, E, P, L } = World.shapes;
  World.def("cisternBurntGate", {
    name: "Cistern of the Burnt Gate", w: 1600, h: 1100, base: "rock", music: "dungeon", rim: 40,
    look: "A flooded builder water vault: black-and-gold smooth stone floors, shallow water over the lower chamber with stone causeways, deep dark pools, scorched blackened gate at the far end, faint gold light-lines in the stone. Dark and moody.",
    legend: { floor: "smooth dark builder stone floor with thin gold light-lines", shallow: "shallow clear water over dark stone, ripples", water: "deep black water", rock: "solid black builder stone walls" },
    guide: [
      ["floor", R(600, 870, 400, 180)], ["floor", L([[800, 870], [800, 650]], 100)],
      ["shallow", R(420, 360, 760, 300)], ["floor", R(740, 360, 120, 300)], ["water", E(560, 500, 90, 60)], ["water", E(1040, 520, 90, 60)], ["floor", R(440, 380, 60, 60)], ["floor", R(1100, 380, 60, 60)],
      ["floor", L([[1180, 500], [1400, 500]], 80)], ["floor", R(1300, 370, 240, 270)], ["shallow", L([[1180, 500], [1300, 500]], 60)],
      ["floor", L([[420, 500], [200, 500], [200, 300]], 80)], ["floor", R(90, 160, 270, 210)], ["shallow", E(220, 260, 70, 40)],
      ["floor", L([[800, 360], [800, 160]], 100)], ["floor", R(620, 70, 360, 130)],
      ["shallow", L([[800, 870], [800, 700]], 50)], ["shallow", E(800, 960, 120, 40)],
    ],
    dark: { ambient: 0.76, radius: 210 },
    entries: { start: { x: 800, y: 1000, face: "up" }, from_dunes: { x: 800, y: 1000, face: "up" }, from_dunes_gate: { x: 800, y: 140, face: "down" } },
    exits: [
      { rect: [750, 1050, 100, 40], to: "whisperglassDunes", entry: "from_cistern", push: [0, -1] },
      { rect: [750, 44, 100, 40], to: "whisperglassDunes", entry: "from_cistern_gate", push: [0, 1], need: "ci.karvan", blocked: "cistern.gateSealed" },
    ],
    triggers: [{ id: "karvanAmbush", rect: [700, 96, 200, 50] }],
    chests: [{ id: "g5_bullringBronze", x: 1450, y: 540 }],
    npcs: [{ id: "burntGateSign", art: "lightStele", name: "Stele", x: 720, y: 130, hint: "E / Space: read the stele" }],
    props: [
      ["builderPillar", 430, 640], ["builderPillar", 1170, 640], ["builderPillar", 430, 470], ["builderPillar", 1170, 470], ["lightStele", 740, 400], ["lightStele", 860, 400], ["poolStatue", 560, 540], ["sluiceWheel", 1040, 560],
      ["builderPillar", 690, 1010], ["builderPillar", 910, 1010], ["lightStele", 740, 760], ["lightStele", 860, 760], ["builderConduit", 1340, 420], ["vaultRubble", 1480, 600], ["vaultRubble", 130, 330], ["sluiceWheel", 280, 340],
      ["builderPillar", 660, 120], ["builderPillar", 940, 120], ["vaultRubble", 700, 170], ["lightStele", 1400, 600, {}], ["builderPillar", 1500, 400],
    ],
    scatter: [{ keys: ["vaultRubble", "puddle", "glassShard"], n: 10, on: ["floor", "shallow"], seed: 5, scaleRange: [0.8, 1] }],
    lights: [[760, 400, 90, 0.6], [840, 400, 90, 0.6], [800, 760, 130, 0.6]],
    encounter: { table: "cistern", rate: 22 },
    amb: { motes: 20, tint: [0x102030, 0.22], warm: null, dust: 0xa8c0d8, water: true, drips: [[430, 640], [1170, 640], [690, 1010]], sparkle: { terrain: ["shallow"], color: 0xbfe8ff, rate: 5 } },
  });
})();
