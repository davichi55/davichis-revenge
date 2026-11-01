// R0b The creature vault under Orun (prologue, Danny 2026-11-01: "a new entrance ... and then underground, an open area where we can actually see all the teams").
// Reached by the stair behind the old lab door in Orun (orun.js exit, open between pro.lessons and pro.packed). Nine pens along the north wall, the three creatures
// of each pack stand behind the bars (figures, hidden one by one in the scene). Talk to a pen (npc pen0..pen8) to look at the pack; story in ch0.js (vault.arrive, S.talk.orunVault).
// The back stair in the east wall is the way out in the escape scene (scripted, no exit).
(function () {
  const { R, E, L } = World.shapes, C = window.Core;
  const W = 1800, H = 1000, PEN_Y0 = 96, PEN_Y1 = 306, FENCE_Y = 322, PX = i => 150 + i * 187.5;
  const packs = C && C.PACKS ? Object.keys(C.PACKS).map(k => C.PACKS[k]) : [];
  const guide = [["floor", R(84, PEN_Y1, W - 168, 600)]];   // inside the painted walls (orunVault.jpg)
  const props = [], figures = [], npcs = [];
  for (let i = 0; i < 9; i++) {
    const x = PX(i);
    guide.push(["wall", R(x - 76, PEN_Y0, 152, PEN_Y1 - PEN_Y0 + 4)]);   // the pen floor: straw behind bars, not walkable
    props.push(["ironFence", x, FENCE_Y, { scale: 1.36 }]);
    const ids = packs[i] ? packs[i].creatures : [];
    ids.forEach((id, k) => figures.push({ id: "pen" + i + "_" + k, art: id, x: x + (k - 1) * 44, y: 232 + (k === 1 ? -26 : 8), size: 62, flip: k === 2, hide: "vault.out" + i }));
    npcs.push({ id: "pen" + i, art: null, name: packs[i] ? packs[i].name : "Pen", x, y: FENCE_Y + 34, hint: "E / Space: look into the pen", show: "vault.seen", hide: "pro.packed" });
  }
  // the main stair up to Orun (south), the back stair in the east wall (the escape)
  guide.push(["paved", L([[900, H], [900, 900]], 120)], ["paved", R(1640, 500, 140, 170)]);
  props.push(["lampPost", 780, 900], ["lampPost", 1020, 900], ["lampPost", 1600, 480], ["lampPost", 1600, 720]);
  [300, 600, 1200, 1500].forEach(x => props.push(["lampPost", x, 620]));
  npcs.push(
    { id: "oldDunmar", art: "npcDunmar", name: "Old Dunmar", x: 760, y: 470 },
    { id: "mentor", art: "mentor", name: "Master Ithiel", x: 1050, y: 480 },
  );
  World.VAULT = { penX: PX, fenceY: FENCE_Y, backStair: { x: 1700, y: 590 }, mainStair: { x: 900, y: 960 } };
  World.def("orunVault", {
    name: "The Creature Vault", w: W, h: H, base: "rock", music: "packChoice", rim: 40, ground: "assets/regions/orunVault.jpg",
    look: "An underground stone vault under a desert academy, seen from above: a long hall of pale flagstones, nine straw-filled pens along the north wall behind iron bars, a stone stair going up in the south, a dark archway in the east wall.",
    legend: { floor: "pale worn limestone flagstones of a vault hall", wall: "straw-strewn stone pen floors with water troughs", rock: "thick dark stone walls and pillars between the pens", paved: "worn stone stair steps" },
    guide, dark: { ambient: 0.62, radius: 220, fireRadius: 150 },
    entries: { start: { x: 900, y: 880, face: "up" }, from_orun: { x: 900, y: 880, face: "up" } },
    exits: [{ rect: [850, 958, 100, 42], to: "orun", entry: "from_vault", push: [0, -1], hide: "pro.packed" }],
    props, figures, npcs,
    amb: { motes: 30, tint: [0x2a2030, 0.18], warm: [0xffc890, 0.06], dust: 0xe8dcc0 },
  });
})();
