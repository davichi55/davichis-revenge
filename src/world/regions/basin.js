// R2 Amber Wells Basin: oasis chain, red rock, a salt flat to the north; legion armies roam (patrols, a chase, a stand-off). Table "basin" ~40 s.
// Exits: dunes (west), amberWells (south), scorpionQuarry (south-east), cinderglassFlats (north-east), saltgate (north), hollowSkyStone (south-west).
(function () {
  const { R, E, P, L } = World.shapes;
  const oases = [[700, 800, 130, 80], [1350, 900, 160, 95], [1850, 650, 110, 70]], reeds = [];
  oases.forEach(([x, y, rx, ry], i) => { for (let a = 0.2; a < 6.28; a += 0.55) if (Math.sin(a) < 0.7) reeds.push(["reeds", x + Math.cos(a) * rx * 0.95, y + Math.sin(a) * ry * 0.95 + 8]); for (let a = 0.5 + i; a < 6.28; a += 1.05) reeds.push([a % 2 > 1 ? "palm1" : "palm2", x + Math.cos(a) * (rx + 55), y + Math.sin(a) * (ry + 40) + 20]); });
  World.def("amberBasin", {
    name: "Amber Wells Basin", w: 2300, h: 1500, music: "desert", rim: 40,
    look: "A desert basin of golden sand and red-orange rock mesas, a chain of small green oases with dark water, and a pale cracked white salt flat in the north. Warm dramatic light.",
    legend: { salt: "white cracked salt flat with pink salt crystals", red: "red-orange rock earth with cracks and strata", grass: "green grass and damp dark earth around the oasis ponds", water: "dark green oasis pond water with reeds on the shore", rock: "tall dark red rock mesas and cliffs", road: "a worn dirt caravan road with cart ruts" },
    guide: [
      ["salt", E(1150, 190, 700, 150)], ["red", E(400, 1150, 360, 200)], ["red", E(1900, 1150, 330, 220)], ["red", E(1750, 250, 260, 160)],
      ["grass", E(700, 800, 190, 125)], ["grass", E(1350, 900, 230, 150)], ["grass", E(1850, 650, 165, 110)], ["water", E(700, 800, 130, 80)], ["water", E(1350, 900, 160, 95)], ["water", E(1850, 650, 110, 70)],
      ["road", L([[60, 760], [600, 860], [1150, 1000], [1150, 1460]], 60)], ["road", L([[1150, 1000], [1700, 780], [2260, 300]], 56)], ["road", L([[1700, 780], [2260, 1250]], 56)], ["road", L([[600, 860], [1000, 360], [1500, 50]], 56)], ["road", L([[600, 860], [100, 1300]], 56)],
      ["rock", P([[300, 300], [520, 240], [680, 330], [620, 470], [380, 480]])], ["rock", P([[1500, 1150], [1700, 1100], [1800, 1220], [1700, 1360], [1520, 1320]])], ["rock", P([[800, 1150], [980, 1100], [1060, 1200], [960, 1300], [820, 1280]])],
      ["rock", P([[1350, 460], [1520, 420], [1600, 520], [1500, 620], [1360, 580]])], ["rock", P([[2050, 900], [2220, 860], [2250, 1000], [2120, 1060], [2020, 1000]])], ["rock", P([[220, 800], [320, 780], [360, 880], [270, 940]])],
    ],
    entries: { start: { x: 160, y: 760, face: "right" }, from_dunes: { x: 160, y: 770, face: "right" }, from_amberWells: { x: 1150, y: 1340, face: "up" }, from_quarry: { x: 2150, y: 1220, face: "left" }, from_flats: { x: 2150, y: 340, face: "left" }, from_saltgate: { x: 1480, y: 140, face: "down" }, from_hollow: { x: 190, y: 1240, face: "up" } },
    exits: [
      { rect: [40, 710, 60, 120], to: "whisperglassDunes", entry: "from_amberBasin", push: [1, 0] },
      { rect: [1100, 1420, 100, 50], to: "amberWells", entry: "from_basin", push: [0, -1] },
      { rect: [2210, 1190, 60, 110], to: "scorpionQuarry", entry: "from_basin", push: [-1, 0] },
      { rect: [2210, 250, 60, 110], to: "cinderglassFlats", entry: "from_basin", push: [-1, 0] },
      { rect: [1450, 40, 110, 50], to: "saltgate", entry: "from_basin", push: [0, 1] },
      { rect: [60, 1250, 100, 50], to: "hollowSkyStone", entry: "from_basin", push: [0, -1] },
    ],
    props: reeds,
    scatter: [
      { keys: [["cactus", 3], ["agave", 2], ["boulder", 2], ["rocks", 2], ["barrel", 0.3], ["shrub", 3], ["redPillar", 1]], n: 90, seed: 11 },
      { keys: [["grass", 4], ["grass2", 4], ["bones", 1], ["skull", 1], ["ribs", 1], ["glassShard", 0.3]], n: 90, seed: 12 },
      { keys: [["saltCrystal", 4], ["bones", 1], ["skull", 1]], n: 30, on: ["salt"], seed: 13 },
      { keys: [["redPillar", 2], ["oreHeap", 1], ["boulder", 2], ["agave", 1]], n: 30, on: ["red"], seed: 14 },
      { keys: [["marigold", 2], ["shrub", 2], ["grass", 2]], n: 36, on: ["grass"], seed: 15 },
    ],
    encounter: { table: "basin", rate: 40 },
    amb: {
      birds: 5, water: true, dust: 0xe8c890, motes: 60, butterflies: [[700, 840], [1350, 940], [1850, 690], [640, 770], [1420, 870]],
      armies: [
        { id: "patrol1", lane: [[160, 760], [600, 860], [1150, 1000], [1700, 780]], mode: "pingpong", speed: 36, rows: 2, cols: 4, sight: 200, table: "basin" },
        { id: "patrol2", lane: [[900, 450], [1500, 450], [1700, 650], [1100, 650]], mode: "loop", speed: 38, rows: 2, cols: 3, sight: 220, table: "basin" },
        { id: "patrol3", lane: [[1700, 780], [2100, 1000], [1900, 1300], [1500, 1280], [1400, 1100]], mode: "loop", speed: 36, rows: 2, cols: 3, sight: 200, table: "basin" },
      ],
      chase: { lane: [[300, 1000], [620, 1040], [900, 1000], [1180, 1160]], table: "basin" },
      standoff: { x: 1100, y: 330, table: "basin" },
      wrecks: [[500, 580], [1950, 420]],
    },
  });
})();
