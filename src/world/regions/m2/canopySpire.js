// R5 The Canopy Spire (M2 spec 7.6): a spiral climb up a colossal hollow tree-spire, nests of brown-white feathers, wind howling through slits, a great perch at the top. Table `spire` 22 s. Boss music titanSky (T2 at the top).
// Entries: start, from_featherfallCanopy (bottom). Exit: featherfallCanopy@from_canopySpire. Trigger spireTop (T2). Chest spireChest (mid-climb). Inn: Plume Rest (no inn entry here).
(function () {
  const { R, E, P, L } = World.shapes, K = World.kitM2, W = 2250, H = 1500, cx = 1125, cy = 680;
  const spiral = [], N = 64;
  for (let i = 0; i <= N; i++) { const t = i / N, th = Math.PI / 2 + t * Math.PI * 4, r = 610 - 430 * t; spiral.push([Math.round(cx + Math.cos(th) * r * 1.5), Math.round(cy + Math.sin(th) * r * 0.9)]); }
  const mid = spiral[38];
  const def = {
    name: "The Canopy Spire", ground: "assets/regions/canopySpire.jpg", w: W, h: H, music: "canopy", rim: 40, base: "rock",
    look: "The inside of a colossal hollow tree-spire seen from above: a wide spiral ramp of weathered wooden planks and bare bark winding inward and upward around the inner wall, brown-and-white feather nests, long thin slits in the bark letting in streaks of cold light and wind, a big round perch platform of ancient wood at the centre. Cold, windy, vast, brown and cream with pale blue light.",
    legend: { floor: "weathered wooden plank ramp and bare bark floor with scattered brown and white feathers", road: "pale bark ledge with feathers", rock: "solid colossal tree bark and root wall with deep grooves, seen from above" },
    guide: [["floor", L([[1125, 1500], [1125, 1190]], 150)], ["floor", L(spiral, 140)], ["floor", E(cx, 640, 270, 170)]],
    entries: { start: { x: 1125, y: 1400, face: "up" }, from_featherfallCanopy: { x: 1125, y: 1400, face: "up" } },
    exits: [{ rect: [1060, 1440, 130, 56], to: "featherfallCanopy", entry: "from_canopySpire", push: [0, 1], floor: "floor" }],
    triggers: [{ id: "spireTop", rect: [1040, 600, 170, 120] }],
    chests: [{ id: "spireChest", x: mid[0], y: mid[1] + 10 }],
    props: [
      ["m2_bigPerch", cx, 700, { solid: [90, 26] }], ["m2_cageFrame", 1330, 640, { solid: [50, 16] }], ["m2_giantFeather", 960, 560, { solid: false }], ["m2_featherNest", 1260, 740, { solid: false }], ["m2_featherDrift", 980, 720, { solid: false }], ["m2_windSlit", 1010, 520], ["m2_windSlit", 1240, 520], ["m2_windBanner", 940, 640],
      ["m2_featherNest", 1020, 1330, { solid: false }], ["m2_featherDrift", 1240, 1330, { solid: false }], ["m2_windSlit", 880, 1240], ["m2_windSlit", 1390, 1240],
    ],
    lights: [[1125, 640, 280, 0.6], [1010, 520, 100, 0.5], [1240, 520, 100, 0.5], [880, 1240, 100, 0.4], [1390, 1240, 100, 0.4]],
    dark: { ambient: 0.35, radius: 260, fireRadius: 200 },
    encounter: { table: "spire", rate: 22 },
    amb: { birds: 0, water: false, dust: 0xe8e8f0, motes: 70, tint: [0x20283a, 0.16], warm: [0xc0d8ff, 0.05], butterflies: [], weather: ["clear"] },
  };
  for (let i = 4; i < N; i += 7) { const p = spiral[i], q = spiral[Math.min(N, i + 1)], ox = (p[0] - cx) > 0 ? 1 : -1; def.props.push(i % 2 ? ["m2_featherNest", p[0] + ox * 40, p[1] + 40, { solid: false }] : ["m2_featherDrift", p[0] - ox * 30, p[1] + 20, { solid: false }]); }
  for (let i = 10; i < N; i += 11) { const p = spiral[i]; def.props.push(["m2_windSlit", p[0] + ((p[0] - cx) > 0 ? 90 : -90), p[1] - 60]); def.lights.push([p[0] + ((p[0] - cx) > 0 ? 90 : -90), p[1] - 40, 110, 0.4]); }
  const bark = [["m2_paleRootPillar", 3], ["m2_rootWall", 1], ["m2_rootBrace", 0.6], ["m2_giantFeather", 0.5], ["m2_stalagmite", 0.4]];
  def.props = def.props.concat(K.blockedFill(def, 100, bark, { seed: 1401, edgeKeys: [["m2_paleRootPillar", 3], ["m2_giantFeather", 1]] }));
  World.def("canopySpire", def);
})();
