// R5 Imela's house (M2 spec 7.8): a small, kept house nobody has lived in for nineteen years: a cup on the table, a half-woven loom, a cradle, dried herbs gone to dust, a window left open. Music `letters`. No fights.
// Entries: start, from_marigoldHollow (front door), from_imelasCellar. Exits: marigoldHollow@from_imelasHouse (door), imelasCellar@from_imelasHouse (trapdoor behind the pantry shelf, need ch4.letters=4).
// Interact spots (npc, no art): letter1 kitchen table, letter2 loom basket, letter3 door-notice, letter4 cradle, plus flavour cradle, cup, loom. Trigger houseFirst.
(function () {
  const { R, E, P, L } = World.shapes, K = World.kitM2, W = 1050, H = 700;
  const def = {
    name: "Imela's House", ground: "assets/regions/imelasHouse.jpg", w: W, h: H, music: "letters", rim: 30, base: "rock",
    look: "The inside of a small old farmhouse seen from above, one room: warm worn wooden plank floor with a faded woven rug, dust and cobwebs in the corners, whitewashed plaster walls, shafts of morning light from an open window, a stone hearth on one wall. Quiet, still, tender, faded browns and creams, sad and warm.",
    legend: { floor: "worn warm wooden plank floor with dust, a faded rug, a few dried herbs and straw", wall: "whitewashed plaster and timber house wall top, cracked and dusty", rock: "dark outside the house" },
    guide: [["floor", R(90, 130, 870, 500)], ["wall", R(60, 90, 930, 44)], ["wall", R(60, 630, 400, 30)], ["wall", R(600, 630, 390, 30)], ["wall", R(60, 90, 34, 570)], ["wall", R(956, 90, 34, 570)], ["floor", R(460, 620, 140, 80)]],
    entries: { start: { x: 530, y: 560, face: "up" }, from_marigoldHollow: { x: 530, y: 560, face: "up" }, from_imelasCellar: { x: 190, y: 330, face: "down" } },
    exits: [
      { rect: [470, 650, 120, 42], to: "marigoldHollow", entry: "from_imelasHouse", push: [0, 1], floor: "floor" },
      { rect: [140, 290, 100, 50], to: "imelasCellar", entry: "from_imelasHouse", push: [0, -1], need: "ch4.letters=4", blocked: "imelaTrapdoorHidden", floor: "floor" },
    ],
    triggers: [{ id: "houseFirst", rect: [440, 480, 180, 90] }],
    npcs: [
      { id: "letter1", art: null, name: "Kitchen table", x: 360, y: 345 }, { id: "cup", art: null, name: "A cup", x: 440, y: 290 }, { id: "letter2", art: null, name: "Loom basket", x: 880, y: 395 }, { id: "loom", art: null, name: "The loom", x: 780, y: 350 },
      { id: "letter3", art: null, name: "Door-notice", x: 640, y: 628 }, { id: "letter4", art: null, name: "Cradle", x: 700, y: 575 }, { id: "cradle", art: null, name: "Cradle", x: 755, y: 540 },
    ],
    props: [
      ["m2_hTable", 360, 330, { solid: [44, 16] }], ["m2_hChair", 300, 340, { solid: [8, 5] }], ["m2_hChair", 430, 350, { solid: [8, 5], flip: true }], ["m2_hHearth", 690, 215, { solid: [44, 16] }], ["m2_hPantry", 190, 270, { solid: [36, 12] }], ["m2_hJars", 270, 215, { solid: [20, 8] }], ["m2_hHerbs", 410, 210, { solid: false }], ["m2_hHerbs", 560, 210, { solid: false }],
      ["m2_hWindow", 480, 160, { solid: false }], ["m2_hWindow", 860, 160, { solid: false }], ["m2_hLoom", 820, 350, { solid: [60, 18] }], ["m2_hBasket", 890, 420, { solid: [20, 8] }], ["m2_hBed", 880, 590, { solid: [60, 22] }], ["m2_hCradle", 730, 590, { solid: [30, 10] }], ["m2_hRug", 520, 440, { solid: false, shadow: false }], ["m2_hRug", 190, 330, { solid: false, shadow: false, scale: 0.55 }],
      ["m2_hDoor", 530, 640, { solid: false }], ["m2_hLamp", 600, 640, { solid: false }], ["m2_hChest", 140, 560, { solid: [30, 10] }], ["m2_hStool", 230, 500, { solid: [10, 6] }], ["m2_hJars", 150, 450, { solid: [20, 8] }], ["m2_hBasket", 300, 580, { solid: [20, 8] }], ["m2_hLamp", 960, 280, { solid: false }],
    ],
    lights: [[480, 330, 230, 0.8], [860, 320, 200, 0.6], [690, 280, 140, 0.6]],
    dark: { ambient: 0.28, radius: 280, fireRadius: 240 },
    amb: { birds: 0, water: false, dust: 0xfff0d0, motes: 36, tint: [0x302010, 0.1], warm: [0xffd890, 0.1], butterflies: [] },
  };
  World.def("imelasHouse", def);
})();
