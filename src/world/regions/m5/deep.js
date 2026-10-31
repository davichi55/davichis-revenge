// M5 9.5 Lantern Deep (K9, dungeon, 2700x1800): a lightless trench of black water full of glowing creatures. The only lit way is the winding path of pale reef the lantern-fish and wisps drift along
// (glass terrain, ambient glowing creatures walk it); everything beside it is walkable dark. PUZZLE (STORY-M5 post.js owns the logic): the press trigger deepPath (hidden once flag deep.path is set) at the first bend:
// the lights go left / ahead / right three times, a wrong step wakes the dark (a fight). Until deep.path a blocker of dark water (show !deep.path) shuts the last stretch; after it the trigger deepGuardian on the dais
// (show deep.path and !k9.done) and the chest g40_deepCurrentTrench (show k9.done). Table "deep" 20 s. Entries start, from_sea. Exit weepingSea@from_lanternDeep (SW).
(function () {
  const { R, E, P, L } = World.shapes, M = World.M5, fx = { solid: false };
  const PATH = [[150, 1600], [700, 1600], [1000, 1300], [700, 1000], [1000, 700], [1500, 600], [1900, 900], [1900, 1300], [2300, 1300], [2300, 800], [2400, 420]];
  const props = M.flat(
    // glowing plants and pale reefs along the lit path, whale ribs and rocks in the dark beside it
    M.line("deepLanternPlant", PATH, 170, { seed: 1, jit: 30, dx: 100, opts: fx }), M.line("deepLanternPlant", PATH, 170, { seed: 2, jit: 30, dx: -100, start: 80, opts: fx }), M.line("deepReef", PATH, 330, { seed: 3, jit: 20, dx: 150, dy: 30 }), M.line("deepReef", PATH, 330, { seed: 4, jit: 20, dx: -150, dy: -30, start: 160 }),
    M.rect(["deepRock", "deepReef", "deepWhaleRib", "deepGlassFish", "deepJelly"], 100, 160, 2600, 1700, 70, { seed: 5, flipR: true, avoid: PATH.concat([[500, 1600], [850, 1450], [850, 850], [1250, 650], [1700, 750], [1900, 1100], [2100, 1300], [2300, 1050], [2350, 600]]).map(p => [p[0], p[1], 190]), opts: fx }),
    [["deepWhaleRib", 450, 1250], ["deepWhaleRib", 2500, 1500], ["deepWhaleRib", 1450, 1300], ["deepWhaleRib", 1300, 300]],
    // the dais at the end of the way
    [["deepDais", 2400, 420, fx], ["deepWisp", 2330, 360, fx], ["deepWisp", 2470, 360, fx], ["deepLanternPlant", 2300, 280], ["deepLanternPlant", 2520, 280], ["deepReef", 2250, 470], ["deepReef", 2560, 470]]
  );
  const npcs = [
    { id: null, art: "deepGlassFish", x: 400, y: 1600, path: [[250, 1600], [700, 1600], [1000, 1300]], speed: 40 }, { id: null, art: "deepWisp", x: 900, y: 1400, path: [[900, 1400], [700, 1000], [1000, 700]], speed: 34 }, { id: null, art: "deepJelly", x: 1100, y: 700, path: [[1000, 700], [1500, 600], [1900, 900]], speed: 30 },
    { id: null, art: "deepGlassFish", x: 1900, y: 1100, path: [[1900, 900], [1900, 1300], [2300, 1300]], speed: 38 }, { id: null, art: "deepWisp", x: 2300, y: 1100, path: [[2300, 1300], [2300, 800], [2400, 450]], speed: 32 }, { id: null, art: "deepJelly", x: 1500, y: 620, path: [[1500, 600], [1000, 700], [700, 1000]], speed: 28 },
    { id: null, art: "deepGlassFish", x: 800, y: 1100, path: [[700, 1000], [1000, 1300], [700, 1600]], speed: 36 }, { id: null, art: "deepWisp", x: 2000, y: 1250, path: [[2300, 1300], [1900, 1300], [1900, 900]], speed: 30 },
  ];
  World.def("lanternDeep", {
    name: "Lantern Deep", w: 2700, h: 1800, music: "deepTrench", rim: 40, base: "ash", ground: "assets/regions/lanternDeep.jpg",
    look: "The floor of a lightless ocean trench seen from above: black sea-floor silt, a winding path of pale glowing reef lit by drifting lanterns of glow-fish and wisps, glass-clear fish and jellyfish, pale reefs, whale ribs, dark walls that seem to move, a round pale dais at the end of the path, everything else lost in darkness.",
    legend: { ash: "black silt of the deep sea floor", glass: "pale glowing reef path lit by drifting lights", road: "pale reef stones", paved: "pale round dais of carved reef", rock: "black trench wall", shallow: "dim silt" },
    guide: [["glass", L(PATH, 150)], ["paved", E(2400, 400, 170, 110)], ["road", L([[40, 1600], [200, 1600]], 130)]],
    entries: { start: { x: 220, y: 1600, face: "right" }, from_sea: { x: 220, y: 1600, face: "right" } },
    blockers: [{ rect: [2290, 500, 200, 80], show: "!deep.path" }],
    exits: [{ rect: [40, 1540, 56, 120], to: "weepingSea", entry: "from_lanternDeep", push: [1, 0] }],
    triggers: [{ id: "deepPath", rect: [900, 1230, 200, 150], press: true, once: false, hide: "deep.path" }, { id: "deepGuardian", rect: [2290, 330, 220, 190], show: ["deep.path", "!k9.done"] }],
    chests: [{ id: "g40_deepCurrentTrench", x: 2400, y: 300, show: "k9.done" }],
    props, npcs,
    encounter: { table: "deep", rate: 20 },
    amb: { motes: 70, dust: 0x80d0ff, tint: [0x041838, 0.36], warm: [0x40a0ff, 0.03], sparkle: { terrain: ["glass", "paved"], color: 0x90e0ff, rate: 10 }, water: true },
    dark: { ambient: 0.92, radius: 190, fireRadius: 190 },
    lights: PATH.map(p => [p[0], p[1], 190, 0.7]).concat([[400, 1600, 180, 0.7], [850, 1450, 170, 0.6], [850, 850, 170, 0.6], [1250, 650, 170, 0.6], [1700, 750, 170, 0.6], [1900, 1100, 170, 0.6], [2100, 1300, 170, 0.6], [2300, 1050, 170, 0.6], [2400, 420, 300, 1], [2400, 300, 160, 0.8]]),
    checkFlags: { "k9.done": true, "deep.path": true },
  });
})();
