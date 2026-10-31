// M3 / ch5: the Academy's memory room under Ithiel's study (interior, no fights). Interact spots: mentorLetter fieldBooks cupOfTea. Trigger memoryFirst. Entries: start from_ashenOrun. Exit: ashenOrun@from_memoryRoom.
(function () {
  const { R, E, P, L } = World.shapes, M = World.m3, props = [];
  // curved shelf wall: tall shelves on an ellipse, low shelves in front, scroll racks between, lamps all round
  props.push(...M.ring(["bookShelfTall", "bookShelfTall", "scrollRack"], 550, 395, 440, 250, 14, {}, Math.PI * 1.04, Math.PI * 1.96, 0, 3));
  props.push(["bookShelfTall", 190, 330], ["bookShelfTall", 910, 330], ["bookShelfLow", 150, 470], ["bookShelfLow", 950, 470], ["scrollRack", 215, 560], ["scrollRack", 885, 560]);
  props.push(["bookShelfLow", 350, 690], ["bookShelfLow", 750, 690], ["bookShelfLow", 235, 640], ["bookShelfLow", 865, 640]);
  props.push(["roundRug", 550, 440, { solid: false }], ["studyTable", 550, 420, { solid: [34, 14] }], ["studyChair", 500, 470], ["studyChair", 610, 470, { flip: true }],
    ["readingLamp", 330, 330], ["readingLamp", 770, 330], ["readingLamp", 330, 590], ["readingLamp", 770, 590], ["candleStand", 440, 250], ["candleStand", 660, 250],
    ["bookPile", 700, 480], ["bookPile", 400, 540], ["scrollRack", 260, 250], ["scrollRack", 840, 250], ["archiveCabinet", 550, 170], ["trapStair", 550, 220, { solid: false }]);
  World.def("orunMemoryRoom", {
    name: "The Academy's memory room", w: 1100, h: 800, base: "rock", music: "truth", rim: 40,
    look: "A small round lamp-lit chamber under a scholar's study seen from above: warm dark flagstone floor with a worn round rug in the middle, curved walls of old wooden shelves full of leather field books, brass lamps, a table with a cold cup of tea and an unfinished letter. Quiet, intimate, golden lamplight, dust in the air.",
    legend: { floor: "dark warm wooden-brown flagstone floor with a faint worn path to the centre", paved: "a worn round rug of faded red wool with a gold pattern", rock: "solid shelf wall, dark brown wood and stone" },
    bank: { floor: "dark", paved: "red" }, grade: { floor: { mul: [2.0, 1.55, 1.1], add: [30, 18, 6] }, paved: { mul: [0.8, 0.5, 0.45], add: [0, 0, 0] }, rock: { mul: [1.1, 0.8, 0.5], add: [8, 4, 0] } },
    guide: [["floor", E(550, 425, 470, 320)], ["paved", E(550, 440, 120, 80)], ["floor", R(500, 640, 100, 120)]],
    entries: { start: { x: 550, y: 640, face: "up" }, from_ashenOrun: { x: 550, y: 270, face: "down" } },
    exits: [{ rect: [505, 232, 90, 26], to: "ashenOrun", entry: "from_memoryRoom", push: [0, 1] }],
    triggers: [{ id: "memoryFirst", rect: [440, 380, 220, 120] }],
    npcs: [
      { id: "mentorLetter", art: null, name: "Unfinished letter", x: 560, y: 436, hint: "E / Space: read the letter" },
      { id: "fieldBooks", art: null, name: "Field books", x: 190, y: 360, hint: "E / Space: read the shelf" },
      { id: "cupOfTea", art: null, name: "Cold cup of tea", x: 500, y: 404, hint: "E / Space: look at the cup" },
    ],
    props,
    lights: [[330, 330, 130, 0.7], [770, 330, 130, 0.7], [330, 590, 120, 0.6], [770, 590, 120, 0.6], [550, 430, 150, 0.8]],
    dark: { ambient: 0.35, radius: 230, color: 0x1a0c04 },
    encounter: { table: null, rate: 0 },
    amb: { birds: 0, butterflies: [], motes: 40, dust: 0xe8c880, tint: [0x3a2410, 0.14], warm: [0xffb060, 0.1], vignette: 0.3 },
  });
})();
