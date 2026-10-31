// Battle arena sets for Davichi's Revenge (ARENA agent).  Global `ArenaSets`.
// Every arena key of the game (BUILD_PLAN_2 "Arena keys") resolves to a spec: art look (floor + panorama), light mood, fog, weather, props, water.
//   ArenaSets.resolve(key) -> canonical key (alias table, then closest match, then "desert")
//   await ArenaSets.prepare(key) -> loads the textures and prop cut-outs of that arena
//   const ctl = ArenaSets.build({ THREE, world, scene, renderer, camera, key }) -> controller { spec, update(dt, t), flood(on), sky(k), flash(hex, k), setWeather(kind|null), dispose() }
// Look of the picture: a mirrored 4-part panorama ring (radius 22) whose painted ground line sits on the floor, a fog skirt, a mirrored-repeat floor (1024 px JPEG, anisotropic),
// light mood, painted cut-outs and code props near the fight (walls, pillars, trunks, crystals, torches...), weather particles.  Art: assets/arenas/<look>_floor.jpg, <look>_pano.jpg, looks.json.
(function (root) {
  "use strict";
  const BASE = "assets/arenas/";
  const R_WALL = 22, N_COPIES = 4;
  const hexToRgb = h => [(h >> 16 & 255) / 255, (h >> 8 & 255) / 255, (h & 255) / 255];
  const strHex = s => parseInt(String(s).replace("#", ""), 16) || 0;
  const mix = (a, b, k) => { const x = hexToRgb(a), y = hexToRgb(b); return (Math.round((x[0] + (y[0] - x[0]) * k) * 255) << 16) | (Math.round((x[1] + (y[1] - x[1]) * k) * 255) << 8) | Math.round((x[2] + (y[2] - x[2]) * k) * 255); };
  const rnd = (a, b) => a + Math.random() * (b - a);
  let seedV = 1; const rs = s => { seedV = s; }; const rr = () => { seedV = (seedV * 16807) % 2147483647; return (seedV - 1) / 2147483646; };   // seeded random so every fight in one arena looks the same

  // ---------- light moods ----------
  const MOODS = {
    day:    { amb: 0.8,  hemi: [0xfff0dd, 0x6a4a30, 0.9],  sun: [0xffe8c0, 0.9] },
    dusk:   { amb: 0.65, hemi: [0xffb890, 0x4a3020, 0.8],  sun: [0xff9a5a, 1.0] },
    night:  { amb: 0.4,  hemi: [0x6a82b8, 0x241c38, 0.6],  sun: [0x8aa0d8, 0.4] },
    cave:   { amb: 0.52, hemi: [0x9aa8b0, 0x30281c, 0.62], sun: [0x8a8a7a, 0.3] },
    dark:   { amb: 0.4,  hemi: [0x808890, 0x201818, 0.5],  sun: [0x706c68, 0.25] },
    fire:   { amb: 0.5,  hemi: [0xff9060, 0x301008, 0.7],  sun: [0xff6a3a, 1.0] },
    cold:   { amb: 0.6,  hemi: [0xb8d8ff, 0x203040, 0.8],  sun: [0xcfe4ff, 0.6] },
    green:  { amb: 0.62, hemi: [0xd8ffd0, 0x20301a, 0.8],  sun: [0xc8ffa8, 0.8] },
    gold:   { amb: 0.75, hemi: [0xffe8b0, 0x6a5020, 0.9],  sun: [0xffd070, 1.0] },
    storm:  { amb: 0.5,  hemi: [0x98a8c8, 0x202838, 0.7],  sun: [0xb0c0e0, 0.5] },
    deep:   { amb: 0.45, hemi: [0x60a0c0, 0x102030, 0.7],  sun: [0x70c0e0, 0.5] },
  };
  const STD_TORCHES = [[-9, -7], [9, -7], [-12, 6], [12, 6]];

  // ---------- spec table ----------
  // look = art id (assets/arenas/<look>_floor.jpg / _pano.jpg), or files:{floor,pano} = explicit legacy paths.  ground = where the painted ground line sits in the picture (fraction from the top).
  // ftint/ptint multiply floor / picture, pb = picture brightness, fog colour (auto from the picture), fogNear/fogFar, torches [[x,z]..]|true, lights [[hex,I,dist,x,y,z,flick]],
  // weather [{k,n,...}], shafts n, mist n, water {y,c,a,s}, lightning, props [[type,x,z,h,{opts}]].
  const SPECS = {}, ALIAS = {};
  const def = (key, o) => (SPECS[key] = Object.assign({ key, mood: "dusk", ground: 0.8, fogNear: 14, fogFar: 44 }, o));
  const WING = (type, o) => [[type, -13.5, -7, 0, o], [type, 13.5, -8, 0, o]];   // left / right wing helpers are resolved in propsFor()

  // chapter 1-2 (M1)
  def("desert", { amb: 0.75, hemi: [0xfff0dd, 0x6a4a30, 0.9], sun: [0xffb070, 0.9], look: "desertOpen", files: { floor: "assets/floor_sand.png", pano: "assets/pano_desert.png" }, ground: 0.58, mood: "dusk", fog: 0x2a1610, fogNear: 22, fogFar: 62, weather: [{ k: "dust", n: 160 }], mist: 3, props: [["rocks", 0, 0, 0, { n: 26, c: 0x9a6a44 }]] });
  def("temple", { amb: 0.45, hemi: [0xfff0dd, 0x6a4a30, 0.6], sun: [0x8a7a6a, 0.35], look: "temple", files: { floor: "assets/floor_stone.png", pano: "assets/pano_temple.png" }, ground: 0.9, mood: "cave", fog: 0x0c0907, fogNear: 14, fogFar: 44, torches: true, torch: 0xffa040, weather: [{ k: "dust", n: 120, c: 0xffa060 }], props: [["pillar", -13, -8, 8.5, {}], ["pillar", 13, -9, 8.5, {}], ["pillar", -9, -14, 9, {}], ["pillar", 9, -14, 9, {}]] });
  def("cistern", { amb: 0.5, hemi: [0xfff0dd, 0x6a4a30, 0.65], sun: [0x6a8a9a, 0.4], look: "cistern", files: { floor: "assets/floor_stone.png", pano: "assets/pano_temple.png" }, ground: 0.9, mood: "cave", ftint: 0x9ec8d8, ptint: 0x9ec8d8, fog: 0x0a1418, torches: true, torch: 0x4aa8d8, water: { y: 0.05, c: 0x2a6a80, a: 0.4 }, weather: [{ k: "drips" }, { k: "motes", c: 0x9fd8ff, n: 100 }] });
  def("undercroft", { amb: 0.5, hemi: [0xfff0dd, 0x6a4a30, 0.6], sun: [0x8a8a6a, 0.3], look: "undercroft", files: { floor: "assets/floor_stone.png", pano: "assets/pano_temple.png" }, ground: 0.9, mood: "cave", fog: 0x0e100a, torches: true, torch: 0xffc060, weather: [{ k: "dust", n: 100, c: 0xc8d8a0 }] });
  def("quarry", { amb: 0.7, hemi: [0xfff0dd, 0x6a4a30, 0.8], sun: [0xff9a5a, 1], look: "quarry", files: { floor: "assets/floor_sand.png", pano: "assets/pano_desert.png" }, ground: 0.58, mood: "dusk", fog: 0x2e1a12, fogNear: 20, fogFar: 62, weather: [{ k: "dust", n: 180, c: 0xe0a070 }], props: [["rocks", 0, 0, 0, { n: 30, c: 0xa8623a }]] });
  def("flats", { amb: 0.6, hemi: [0xfff0dd, 0x6a4a30, 0.7], sun: [0xff6a3a, 1.1], look: "flats", files: { floor: "assets/floor_sand.png", pano: "assets/pano_desert.png" }, ground: 0.58, mood: "fire", fog: 0x2a0e08, fogNear: 16, fogFar: 54, torches: true, torch: 0xff5a20, weather: [{ k: "embers", n: 140 }] });
  def("boneMaze", { amb: 0.5, hemi: [0xfff0dd, 0x6a4a30, 0.6], sun: [0xb0a890, 0.35], look: "boneMaze", files: { floor: "assets/floor_stone.png", pano: "assets/pano_temple.png" }, ground: 0.9, mood: "cave", fog: 0x14110c, torches: true, torch: 0x7fc8ff, weather: [{ k: "dust", n: 100, c: 0xe8e0c8 }] });
  def("hollow", { look: "hollow", files: { floor: "assets/floor_stone.png", pano: "assets/pano_temple.png" }, ground: 0.9, mood: "gold", fog: 0x0c0907, torches: true, torch: 0xffd070, weather: [{ k: "motes", n: 140, c: 0xffe0a0 }] });
  Object.assign(ALIAS, { ruins: "temple", dunes: "desert", basin: "desert" });

  // chapter 3-4
  def("shore", { look: "shore", mood: "dusk", fogNear: 16, fogFar: 50, water: { y: 0.04, c: 0x6a4a30, a: 0.38 }, weather: [{ k: "motes", n: 80, c: 0xffd8a0 }, { k: "leaves", n: 30 }], mist: 4, props: [["rocks", 0, 0, 0, { n: 14, c: 0x6a5a48 }], ["roots", -12, -6, 7, {}], ["roots", 12.5, -8, 8, {}], ["reeds", -10, 3, 3, {}], ["reeds", 11, 4, 3, {}]] });
  def("river", { look: "river", mood: "dusk", fogNear: 16, fogFar: 52, water: { y: 0.06, c: 0x7a5a3a, a: 0.55, s: 0.04 }, weather: [{ k: "motes", n: 70, c: 0xffd8a0 }], mist: 5, props: [["reeds", -11, -4, 3.5, {}], ["reeds", 12, -5, 3.5, {}], ["rocks", 0, 0, 0, { n: 12, c: 0x7a6a58 }], ["roots", -14, -9, 8, {}]] });
  def("riverCave", { look: "riverCave", mood: "cave", fogNear: 12, fogFar: 40, water: { y: 0.05, c: 0x1a5a5a, a: 0.45 }, weather: [{ k: "spores", n: 60, c: 0x70ffe0 }, { k: "drips" }], lights: [[0x30e0c0, 1.2, 14, -9, 1.2, -3, 0.3], [0x30e0c0, 1.0, 12, 9, 1.0, -5, 0.3]], props: [["stalac", -8, -6, 7, {}], ["stalac", 7, -8, 8, {}], ["stalag", -12, -5, 4.5, {}], ["stalag", 12, -7, 5, {}], ["crystal", -11, -2, 2.2, { c: 0x30ffd0 }], ["crystal", 11.5, -3, 2.0, { c: 0x30ffd0 }], ["roots", -14, -8, 9, {}], ["roots", 14, -9, 9, {}]] });
  def("jungle", { look: "jungle", mood: "green", fogNear: 12, fogFar: 42, weather: [{ k: "leaves", n: 70 }, { k: "motes", n: 90, c: 0xd8ff90 }], shafts: 4, mist: 3, props: [["trunk", -13, -6, 17, {}], ["trunk", 13.5, -8, 18, {}], ["trunk", -8, -14, 20, {}], ["trunk", 8, -15, 20, {}], ["rocks", 0, 0, 0, { n: 14, c: 0x5a6a48 }], ["ferns", -10, 2, 2.2, {}], ["ferns", 10.5, 3, 2.4, {}]] });
  def("fort", { look: "fort", mood: "dusk", fogNear: 14, fogFar: 44, torches: true, torch: 0xff8a3a, weather: [{ k: "embers", n: 70, v: 0.6 }, { k: "dust", n: 60 }], props: [["wall", -13.5, -4, 6, {}], ["wall", 13.5, -5, 6, {}], ["banner", -8, -12, 7, { c: 0x9a1a14 }], ["banner", 8, -12, 7, { c: 0x9a1a14 }], ["crates", -11, 3, 1.5, {}], ["barrels", 11.5, 4, 1.4, {}]] });
  def("pyramid", { look: "pyramid", mood: "fire", fogNear: 14, fogFar: 46, torches: [[-9, -7], [9, -7], [-5, -12], [5, -12]], torch: 0xff7a30, weather: [{ k: "embers", n: 110 }], props: [["collarAltar", 0, -11, 5, {}], ["pillar", -13, -6, 7.5, { c: 0x4a3a34 }], ["pillar", 13, -7, 7.5, { c: 0x4a3a34 }], ["brazier", -7.5, -9, 1.4, {}], ["brazier", 7.5, -9.5, 1.4, {}]] });
  def("pools", { look: "pools", mood: "dusk", fogNear: 12, fogFar: 40, ftint: 0xffe8d8, weather: [{ k: "steam", n: 90 }, { k: "bubbles", n: 40, c: 0xdfffff }], mist: 7, water: { y: 0.04, c: 0x2ab0b0, a: 0.4, s: 0.02 }, props: [["rocks", 0, 0, 0, { n: 20, c: 0x8a6a48 }], ["rocks", -13, -5, 0, { n: 5, c: 0x7a5a3e, s: 2.4 }], ["rocks", 13, -6, 0, { n: 5, c: 0x7a5a3e, s: 2.4 }]] });
  def("canopy", { look: "canopy", mood: "gold", fogNear: 14, fogFar: 46, weather: [{ k: "feathers", n: 40 }, { k: "motes", n: 80, c: 0xfff0b0 }], mist: 6, shafts: 3, props: [["trunk", -13, -7, 19, { c: 0x5a4030 }], ["trunk", 13, -8, 19, { c: 0x5a4030 }], ["lantern", -7, -3, 4, {}], ["lantern", 7.5, -5, 4, {}], ["ropes", 0, -9, 0, {}]] });
  def("sporeCave", { look: "sporeCave", mood: "cave", fogNear: 10, fogFar: 36, weather: [{ k: "spores", n: 140, c: 0xd0a0ff }, { k: "spores", n: 80, c: 0x70ffe8 }], lights: [[0xa070ff, 1.4, 14, -9, 1.2, -4, 0.2], [0x40e8d0, 1.2, 12, 9, 1.0, -6, 0.2]], props: [["mushroom", -10, -3, 2.6, { c: 0xb070ff }], ["mushroom", 11, -4, 3.2, { c: 0x40e8d0 }], ["mushroom", -6, -9, 4, { c: 0x40e8d0 }], ["mushroom", 7, -10, 3.6, { c: 0xb070ff }], ["stalac", -10, -7, 8, {}], ["stalac", 9, -8, 8, {}], ["stalag", -13, -5, 4, {}], ["stalag", 13, -6, 4.5, {}]] });
  def("aviary", { look: "aviary", mood: "dusk", fogNear: 16, fogFar: 48, weather: [{ k: "feathers", n: 60 }, { k: "dust", n: 60 }], props: [["pillar", -13, -6, 8, { broken: 1 }], ["pillar", 13, -7, 8, {}], ["cage", -3, -10, 2.2, {}], ["cage", 9.5, -10, 2.4, {}], ["rocks", 0, 0, 0, { n: 12, c: 0x8a7a68 }]] });
  def("spire", { look: "spire", mood: "storm", fogNear: 16, fogFar: 50, ftint: 0xe8d8c8, weather: [{ k: "feathers", n: 60 }, { k: "dust", n: 50, c: 0xffe0a0 }], mist: 7, shafts: 4, lightning: true, props: [["branch", -12, -6, 9, {}], ["branch", 12, -7, 9, {}], ["rocks", 0, 0, 0, { n: 12, c: 0x6a5238 }]] });
  def("lookout", { look: "lookout", mood: "cold", ground: 0.84, fogNear: 14, fogFar: 46, ftint: 0xb8b8c0, weather: [{ k: "mist", n: 60 }], mist: 8, props: [["wall", -13, -4, 3.2, { c: 0x6a6a68 }], ["wall", 13, -5, 3.2, { c: 0x6a6a68 }], ["lantern", -8, -4, 4.5, {}], ["lantern", 8, -6, 4.5, {}]] });

  // chapter 5-6
  def("occupied", { look: "occupied", mood: "dusk", fogNear: 14, fogFar: 46, weather: [{ k: "ash", n: 220 }], mist: 5, lights: [[0xff7a30, 1.4, 16, -12, 1.5, -6, 0.5]], props: [["wall", -13.5, -4, 6.5, { c: 0x8a8070, ruin: 1 }], ["wall", 13.5, -5, 7, { c: 0x8a8070, ruin: 1 }], ["banner", -8, -10, 7, { c: 0xa01a14 }], ["banner", 8.5, -11, 7, { c: 0xa01a14 }], ["rocks", 0, 0, 0, { n: 14, c: 0x6a6258 }], ["fire", -11, -8, 2, {}]] });
  def("vault", { look: "vault", mood: "cold", ftint: 0xc4cadc, fogNear: 10, fogFar: 38, weather: [{ k: "snow", n: 100, v: 0.4 }, { k: "motes", n: 70, c: 0xa0f0ff }], mist: 5, lights: [[0x50d0ff, 1.4, 16, -9, 2, -5, 0.15], [0xffc860, 1.0, 14, 9, 2, -6, 0.15]], props: [["pillar", -13, -6, 8, { c: 0x181c24, glow: 0xffc860 }], ["pillar", 13, -7, 8, { c: 0x181c24, glow: 0xffc860 }], ["crystal", -10, -2, 2.6, { c: 0x70e0ff }], ["crystal", 10, -4, 2.2, { c: 0x70e0ff }], ["crystal", 0, -13, 4, { c: 0x70e0ff }]] });
  def("oasisRuins", { look: "oasisRuins", mood: "gold", ground: 0.84, fogNear: 18, fogFar: 56, weather: [{ k: "dust", n: 100, c: 0xffd890 }, { k: "motes", n: 40 }], props: [["pillar", -13, -6, 7, { c: 0xb89868, broken: 1 }], ["pillar", 13, -7, 7.5, { c: 0xb89868 }], ["rocks", 0, 0, 0, { n: 16, c: 0xb89060 }], ["reeds", 9, -3, 2.4, {}]] });
  def("harbourCoast", { look: "harbourCoast", mood: "dusk", fogNear: 16, fogFar: 52, ftint: 0xc0b0a0, fbright: 0.3, weather: [{ k: "motes", n: 50, c: 0xffe0b0 }], mist: 3, torches: [[-12, 3], [12, 3], [-8, -9], [8, -9]], torch: 0xffb060, props: [["crates", -11, 2, 1.6, {}], ["barrels", 11.5, 3, 1.5, {}], ["crates", 10, -7, 1.4, {}], ["bollard", -9, 5, 0.9, {}], ["bollard", 8, 6, 0.9, {}]] });
  def("fenShrine", { look: "fenShrine", mood: "green", fogNear: 10, fogFar: 36, water: { y: 0.1, c: 0x2a7a6a, a: 0.55, s: 0.03 }, weather: [{ k: "motes", n: 80, c: 0xd0ffc0 }, { k: "bubbles", n: 30 }], shafts: 4, mist: 5, props: [["pillar", -12, -5, 8, { c: 0x4a5a48, mossy: 1 }], ["pillar", 12.5, -6, 8, { c: 0x4a5a48, mossy: 1 }], ["pillar", -7, -12, 9, { c: 0x4a5a48, mossy: 1 }], ["pillar", 7.5, -12, 9, { c: 0x4a5a48, mossy: 1 }], ["lily", -4, -3, 1, {}], ["lily", 5, -5, 1, {}]] });
  def("giantQuarry", { look: "giantQuarry", mood: "day", ground: 0.84, fogNear: 16, fogFar: 50, ftint: 0xe0d0c0, weather: [{ k: "dust", n: 140, c: 0xe8d0b0 }], props: [["blocks", -17, -13, 3, {}], ["blocks", 17, -13, 3, {}], ["scaffold", -14, -9, 12, {}], ["scaffold", 14, -10, 12, {}], ["rocks", 0, 0, 0, { n: 16, c: 0x9a8268 }]] });
  def("sunbirdRoost", { look: "sunbirdRoost", mood: "gold", fogNear: 16, fogFar: 48, weather: [{ k: "feathers", n: 50, c: 0xffe090 }, { k: "motes", n: 90, c: 0xffe8a0 }], shafts: 3, props: [["pillar", -13, -6, 8.5, { c: 0xc8a050 }], ["pillar", 13, -7, 8.5, { c: 0xc8a050 }], ["brazier", -6, -3, 1.4, {}], ["brazier", 6.5, -4.5, 1.4, {}], ["branch", 0, -13, 8, { c: 0xc8a050 }]] });
  def("seaDeck", { look: "seaDeck", mood: "storm", ground: 0.74, fogNear: 16, fogFar: 54, weather: [{ k: "rain", n: 300, v: 0.6 }, { k: "spray", n: 60 }], lightning: false, props: [["mast", -12.5, -5, 16, {}], ["mast", 12.5, -6, 16, {}], ["crates", -10.5, 3, 1.4, {}], ["barrels", 10.5, 4, 1.3, {}], ["rail", 0, -13, 1.6, {}]] });
  def("seaCave", { look: "seaCave", mood: "deep", fogNear: 10, fogFar: 38, water: { y: 0.08, c: 0x1e6e86, a: 0.6, s: 0.06 }, weather: [{ k: "spray", n: 80 }, { k: "drips" }], mist: 6, lights: [[0x60d8ff, 1.2, 16, 0, 3, -10, 0.2]], props: [["stalac", -9, -6, 7, {}], ["stalac", 8, -7, 8, {}], ["stalag", -13, -5, 5, {}], ["stalag", 13, -6, 5.5, {}], ["rocks", 0, 0, 0, { n: 14, c: 0x3a4a50 }]] });
  def("volcano", { look: "volcano", mood: "fire", fogNear: 14, fogFar: 46, weather: [{ k: "embers", n: 180 }, { k: "ash", n: 80 }], mist: 3, lights: [[0xff6a20, 2.2, 20, -6, 0.6, -6, 0.5], [0xff5a10, 2.0, 18, 8, 0.6, -8, 0.5]], props: [["spire", -12.5, -6, 8, { c: 0x1c1816 }], ["spire", 12.5, -7, 9, { c: 0x1c1816 }], ["spire", -7, -13, 10, { c: 0x1c1816 }], ["spire", 8, -13, 10, { c: 0x1c1816 }], ["rocks", 0, 0, 0, { n: 18, c: 0x2a2220 }]] });
  def("underworld", { look: "underworld", mood: "dark", fogNear: 10, fogFar: 36, weather: [{ k: "spores", n: 90, c: 0x60ffc0 }, { k: "mist", n: 50 }], mist: 6, lights: [[0x40ffb0, 1.3, 14, -10, 1.2, -4, 0.3], [0x40e0ff, 1.1, 14, 10, 1.2, -6, 0.3]], props: [["boneArch", -9, -7, 9, {}], ["boneArch", 9, -8, 9, {}], ["mushroom", -12, -3, 2.4, { c: 0x40ffb0 }], ["mushroom", 12, -4, 2.8, { c: 0x40e0ff }], ["stalac", 0, -10, 9, {}]] });
  def("colosseum", { look: "colosseum", mood: "day", ground: 0.82, fogNear: 18, fogFar: 56, weather: [{ k: "dust", n: 90, c: 0xf0d8a8 }], props: [["pillar", -13, -5, 8, { c: 0xd8d0c0 }], ["pillar", 13, -6, 8, { c: 0xd8d0c0 }], ["banner", -9, -11, 8, { c: 0x2a58a8 }], ["banner", 9, -11, 8, { c: 0xb83a20 }], ["rocks", 0, 0, 0, { n: 10, c: 0xc8b898, s: 0.7 }]] });
  def("barracks", { look: "barracks", mood: "cave", fogNear: 12, fogFar: 38, torches: [[-9, -7], [9, -7], [-12, 4], [12, 4]], torch: 0xff8a3a, weather: [{ k: "dust", n: 80 }], props: [["bars", -12.5, -5, 6, {}], ["bars", 12.5, -6, 6, {}], ["crates", -10, 3, 1.4, {}], ["barrels", 10.5, 4, 1.3, {}]] });
  def("sewer", { look: "sewer", mood: "cave", fogNear: 10, fogFar: 36, water: { y: 0.06, c: 0x3a9a30, a: 0.5, s: 0.08 }, torches: [[-9, -7], [9, -7], [-12, 4], [12, 4]], torch: 0xffb040, weather: [{ k: "drips" }, { k: "spores", n: 40, c: 0x90ff60 }], mist: 4, props: [["pillar", -13, -5, 7, { c: 0x5a4a3a }], ["pillar", 13, -6, 7, { c: 0x5a4a3a }], ["pipe", -8, -11, 9, {}], ["pipe", 8, -12, 9, {}], ["barrels", 11, 3, 1.3, {}]] });
  def("palace", { look: "palace", mood: "gold", ground: 0.84, fogNear: 14, fogFar: 46, torches: [[-9, -7], [9, -7], [-12, 4], [12, 4]], torch: 0xffc060, weather: [{ k: "motes", n: 90, c: 0xffe8b0 }], props: [["pillar", -13, -5, 9, { c: 0xc8a048, gold: 1 }], ["pillar", 13, -6, 9, { c: 0xc8a048, gold: 1 }], ["pillar", -8, -12, 10, { c: 0xc8a048, gold: 1 }], ["pillar", 8, -12, 10, { c: 0xc8a048, gold: 1 }]] });
  def("palaceGarden", { look: "palaceGarden", mood: "dusk", fogNear: 16, fogFar: 50, weather: [{ k: "petals", n: 50 }, { k: "motes", n: 70, c: 0xffd890 }], torches: [[-9, -5], [9, -6], [-12, 4], [12, 4]], torch: 0xffa050, props: [["hedge", -12, -4, 2.2, {}], ["hedge", 12.5, -5, 2.2, {}], ["hedge", -8, -11, 2.6, {}], ["hedge", 8.5, -12, 2.6, {}], ["rocks", 0, 0, 0, { n: 8, c: 0x9a9a88, s: 0.6 }]] });

  // chapter 8-9
  def("saltFlats", { look: "saltFlats", mood: "dusk", ground: 0.82, fogNear: 18, fogFar: 56, weather: [{ k: "saltRain", n: 160 }, { k: "dust", n: 60, c: 0xffd8d0 }], props: [["tower", -13.5, -7, 9, {}], ["tower", 13.5, -8, 9, {}], ["saltCrystals", -9, -3, 1.6, {}], ["saltCrystals", 10, -4, 1.8, {}], ["rocks", 0, 0, 0, { n: 12, c: 0xe0b0a0, s: 0.7 }]] });
  def("orchard", { look: "orchard", mood: "dusk", fogNear: 16, fogFar: 50, weather: [{ k: "leaves", n: 40, c: 0x9a7a30 }, { k: "motes", n: 80, c: 0xffe090 }], mist: 3, props: [["trunk", -13, -6, 15, { c: 0x4a3828 }], ["trunk", 13, -8, 15, { c: 0x4a3828 }], ["crates", -10, 3, 1.4, {}], ["rocks", 0, 0, 0, { n: 8, c: 0x6a6a48, s: 0.7 }]] });
  def("saltMine", { look: "saltMine", mood: "cave", fogNear: 10, fogFar: 36, torches: [[-9, -7], [9, -7], [-12, 4], [12, 4]], torch: 0xffa850, weather: [{ k: "dust", n: 110, c: 0xffd8e0 }], lights: [[0xff90b0, 1.0, 14, -9, 1.2, -4, 0.2]], props: [["timber", -12, -5, 8, {}], ["timber", 12, -6, 8, {}], ["saltCrystals", -10, -2, 2.0, {}], ["saltCrystals", 10.5, -3, 2.2, {}], ["crates", 11, 4, 1.3, {}]] });
  def("villa", { look: "villa", mood: "gold", ground: 0.8, fogNear: 16, fogFar: 50, weather: [{ k: "petals", n: 40 }, { k: "motes", n: 60, c: 0xffe0a0 }], props: [["pillar", -13, -5, 8, { c: 0xe0d8c8 }], ["pillar", 13, -6, 8, { c: 0xe0d8c8 }], ["planter", -9, 3, 1.6, {}], ["planter", 9.5, 3.5, 1.6, {}]] });
  def("glassCistern", { look: "glassCistern", mood: "deep", fogNear: 10, fogFar: 38, water: { y: 0.1, c: 0x2a9a9a, a: 0.5, s: 0.03 }, weather: [{ k: "bubbles", n: 70, c: 0xc8ffff }], mist: 4, shafts: 4, props: [["glassPillar", -12.5, -5, 8, {}], ["glassPillar", 12.5, -6, 8, {}], ["glassPillar", -7, -12, 9, {}], ["glassPillar", 7.5, -12, 9, {}]] });
  def("prison", { look: "prison", mood: "dark", ftint: 0xc8c4d0, fbright: 0.25, fogNear: 10, fogFar: 36, torches: [[-9, -7], [9, -7], [-12, 4], [12, 4]], torch: 0xa060ff, weather: [{ k: "dust", n: 80, c: 0xc0a0ff }], lights: [[0x9050ff, 1.2, 16, 0, 2, -8, 0.3]], props: [["bars", -12.5, -5, 6.5, {}], ["bars", 12.5, -6, 6.5, {}], ["chains", -6, -9, 7, {}], ["chains", 6, -10, 7, {}]] });
  def("roots", { look: "roots", mood: "green", fogNear: 10, fogFar: 38, weather: [{ k: "motes", n: 90, c: 0xffc060 }, { k: "spores", n: 40, c: 0xffa040 }], mist: 4, shafts: 3, lights: [[0xffa030, 1.3, 14, -9, 1.4, -5, 0.4], [0xffa030, 1.1, 14, 9, 1.4, -7, 0.4]], props: [["roots", -12, -6, 10, {}], ["roots", 12.5, -7, 10, {}], ["roots", -6, -12, 12, {}], ["roots", 7, -13, 12, {}]] });
  def("hollowTree", { look: "hollowTree", mood: "dark", fogNear: 10, fogFar: 38, weather: [{ k: "ash", n: 160 }, { k: "embers", n: 80, v: 0.7 }], shafts: 4, mist: 4, lights: [[0xff8a30, 1.2, 14, 0, 0.8, -7, 0.5]], props: [["rocks", 0, 0, 0, { n: 14, c: 0x3a3430 }], ["roots", -12.5, -6, 9, {}], ["roots", 12.5, -7, 9, {}]] });
  def("trenches", { look: "trenches", mood: "dark", ground: 0.82, fogNear: 14, fogFar: 46, weather: [{ k: "rain", n: 140, v: 0.35 }, { k: "ash", n: 80 }], mist: 6, props: [["sandbags", -12, -4, 2.2, {}], ["sandbags", 12.5, -5, 2.2, {}], ["stakes", -8, -9, 2.4, {}], ["stakes", 8.5, -10, 2.4, {}], ["rocks", 0, 0, 0, { n: 12, c: 0x5a5448, s: 0.7 }]] });
  def("crypt", { look: "crypt", mood: "cave", fogNear: 10, fogFar: 38, torches: [[-9, -7], [9, -7], [-6, -12], [6, -12]], torch: 0xffc880, weather: [{ k: "dust", n: 90, c: 0xffe8c8 }], shafts: 2, props: [["pillar", -13, -5, 8, { c: 0xb8b0a0 }], ["pillar", 13, -6, 8, { c: 0xb8b0a0 }], ["sarcophagus", -8, -3, 2.2, {}], ["sarcophagus", 9, -4, 2.2, {}], ["candles", -4, -11, 1.4, {}], ["candles", 5, -11, 1.4, {}]] });
  def("stormPeak", { look: "stormPeak", mood: "storm", fogNear: 14, fogFar: 46, weather: [{ k: "rain", n: 360, v: 1 }], lightning: true, mist: 6, props: [["spire", -12.5, -6, 9, { c: 0x201f24 }], ["spire", 12.5, -7, 10, { c: 0x201f24 }], ["spire", -7, -13, 12, { c: 0x201f24 }], ["rocks", 0, 0, 0, { n: 16, c: 0x3a3a40 }]] });
  def("prism", { look: "prism", mood: "dark", fogNear: 12, fogFar: 40, weather: [{ k: "motes", n: 120, c: 0xffffff }, { k: "sparkles", n: 60 }], lights: [[0xff60a0, 1.2, 14, -9, 1.5, -5, 0.2], [0x60a0ff, 1.2, 14, 9, 1.5, -6, 0.2], [0x60ffa0, 1.0, 14, 0, 1.5, -10, 0.2]], props: [["prismShard", -11, -3, 3.2, { c: 0xa0d8ff }], ["prismShard", 11, -4, 3.0, { c: 0xffa0d8 }], ["prismShard", -5, -10, 4, { c: 0xa0ffd0 }], ["prismShard", 6, -11, 4.2, { c: 0xffe0a0 }]] });
  def("greatPyramid", { look: "greatPyramid", mood: "fire", ground: 0.84, fogNear: 12, fogFar: 40, torches: [[-9, -7], [9, -7], [-12, 4], [12, 4]], torch: 0xff7a30, weather: [{ k: "embers", n: 100 }, { k: "dust", n: 70, c: 0xffc080 }], props: [["pillar", -13, -5, 9, { c: 0x2a2020, gold: 1 }], ["pillar", 13, -6, 9, { c: 0x2a2020, gold: 1 }], ["brazier", -6, -3, 1.5, {}], ["brazier", 6.5, -4.5, 1.5, {}]] });
  def("pyramidGate", { look: "pyramidGate", mood: "gold", ground: 0.82, fogNear: 14, fogFar: 46, weather: [{ k: "motes", n: 100, c: 0xffe8b0 }], shafts: 3, lights: [[0xffe0a0, 1.6, 18, 0, 2, -9, 0.1]], props: [["pillar", -13, -5, 8.5, { c: 0x6a5a48 }], ["pillar", 13, -6, 8.5, { c: 0x6a5a48 }], ["brazier", -6, -2, 1.4, {}], ["brazier", 6.5, -3.5, 1.4, {}]] });
  def("sunCore", { look: "sunCore", mood: "fire", fogNear: 14, fogFar: 48, ftint: 0xffe0b0, weather: [{ k: "sparks", n: 200 }, { k: "embers", n: 120 }], lights: [[0xffb040, 2.4, 22, 0, 2, -9, 0.4], [0xff6a20, 1.6, 18, -9, 1, -3, 0.5], [0xff6a20, 1.6, 18, 9, 1, -4, 0.5]], props: [["spire", -12.5, -6, 8, { c: 0x241a16 }], ["spire", 12.5, -7, 8, { c: 0x241a16 }], ["rocks", 0, 0, 0, { n: 16, c: 0x2a1c16 }]] });
  def("starfall", { look: "starfall", mood: "night", fogNear: 16, fogFar: 52, weather: [{ k: "stars", n: 10 }, { k: "motes", n: 90, c: 0x90c0ff }], lights: [[0x40a0ff, 1.5, 16, -9, 1, -6, 0.3], [0x40a0ff, 1.3, 16, 10, 1, -7, 0.3]], props: [["crystal", -11, -3, 3.4, { c: 0x40a8ff }], ["crystal", 11.5, -4, 3.0, { c: 0x6a80ff }], ["crystal", -6, -10, 4.6, { c: 0x40a8ff }], ["rocks", 0, 0, 0, { n: 14, c: 0x2a3038 }]] });
  def("crater", { look: "starfall", mood: "night", fogNear: 14, fogFar: 46, ptint: 0xc8a0ff, ftint: 0xd8c0ff, weather: [{ k: "stars", n: 8 }, { k: "sparkles", n: 100 }], lights: [[0xb060ff, 1.6, 16, -9, 1, -6, 0.3], [0x40ffc0, 1.4, 16, 10, 1, -7, 0.3]], props: [["crystal", -11, -3, 4.2, { c: 0xb070ff }], ["crystal", 11.5, -4, 3.8, { c: 0x40ffc0 }], ["crystal", -6, -10, 5.4, { c: 0x40ffc0 }], ["crystal", 6, -11, 5.2, { c: 0xb070ff }]] });
  def("drownedCity", { look: "drownedCity", mood: "deep", fogNear: 10, fogFar: 38, weather: [{ k: "bubbles", n: 120, c: 0xc8f8ff }, { k: "motes", n: 120, c: 0xa0f0ff }], shafts: 5, mist: 4, props: [["pillar", -12.5, -5, 8, { c: 0x7a9a98, mossy: 1 }], ["pillar", 12.5, -6, 8, { c: 0x7a9a98, mossy: 1 }], ["kelp", -9, -2, 5, {}], ["kelp", 10, -3, 5.5, {}], ["kelp", 0, -11, 6, {}]] });
  def("deepTrench", { look: "deepTrench", mood: "deep", fogNear: 8, fogFar: 32, weather: [{ k: "bubbles", n: 60, c: 0x90f0ff }, { k: "motes", n: 140, c: 0x60e0ff }], lights: [[0x30e0ff, 1.4, 16, -9, 2, -5, 0.4], [0xff40c0, 1.2, 14, 9, 2, -7, 0.4]], props: [["lanternLight", -8, -4, 3, { c: 0x30e0ff }], ["lanternLight", 9, -6, 3.5, { c: 0xff40c0 }], ["lanternLight", 0, -12, 5, { c: 0x40ffa0 }], ["rocks", 0, 0, 0, { n: 10, c: 0x1a2428 }]] });

  // alias table: every key of BUILD_PLAN_2 resolves (to its own spec or the closest built one)
  Object.assign(ALIAS, {
    coldVault: ["vault", { ptint: 0xd8ecff, pb: 1.18, ftint: 0xe4f2ff, fbright: 0.44, fog: 0x1c2c3c, mood: "cold", mist: 9, mistC: 0xdcecff, weather: [{ k: "snow", n: 220, v: 0.5 }, { k: "motes", n: 80, c: 0xc0f0ff }] }],
    pyramidDawn: ["pyramidGate", { ptint: 0xffc0c8, mood: "dusk" }], pyramidDusk: ["pyramidGate", { ptint: 0xff8a60, mood: "fire" }], pyramidZenith: ["pyramidGate", { ptint: 0xfff0d8, mood: "gold" }],
    fenShrine2: "fenShrine", hollowNest: "hollowTree", sporeroot: "sporeCave", windhollow: "aviary", canopySpire: "spire", lookoutChain: "lookout", ashenOrun: "occupied", observatory: "starfall", undervaults: "vault", coldVaults: "coldVault", kharam: "oasisRuins",
    harbour: "harbourCoast", brassHarbour: "harbourCoast", deck: "seaDeck", ship: "seaDeck", sea: "seaDeck", maelstrom: "seaCave", cinder: "volcano", crater2: "crater", mourn: "underworld", hollows: "underworld", tzavan: "colosseum", arena: "colosseum", gladiator: "barracks", pits: "barracks",
    sewers: "sewer", gildedPalace: "palace", garden: "palaceGarden", salt: "saltFlats", saltWeir: "saltFlats", tuk: "orchard", mines: "saltMine", governorsVilla: "villa", veiledCistern: "glassCistern", blackMirror: "prison", rootdeep: "roots", saltmere: "trenches", veilCrypts: "crypt", thunderSpine: "stormPeak",
    prismArchive: "prism", pyramidHall: "greatPyramid", sunEater: "sunCore", starfallIsles: "starfall", drowned: "drownedCity", trench: "deepTrench", lanternDeep: "deepTrench", fen: "fenShrine", temple2: "temple", river2: "river",
    maze: "boneMaze", bonemaze: "boneMaze", undercrofts: "undercroft", dune: "desert", sand: "desert", ruin: "ruins", cave: "sporeCave", jungleRoot: "roots", ocean: "seaDeck", lava: "volcano", ice: "coldVault", storm: "stormPeak", graveyard: "crypt", cemetery: "crypt", prismVault: "prism", sky: "spire", arenaPit: "colosseum", ballCourt: "colosseum", cup: "colosseum", harbor: "harbourCoast", dock: "harbourCoast", docks: "harbourCoast",
  });
  // keyword fallback for keys nobody listed: the closest built arena
  const WORDS = [[/cave|grotto|hollow/i, "sporeCave"], [/sea|ship|deck|boat|wave/i, "seaDeck"], [/trench|deep|abyss/i, "deepTrench"], [/fire|lava|volcan|ember|cinder/i, "volcano"], [/ice|frost|cold|snow/i, "coldVault"], [/storm|thunder|peak|mount/i, "stormPeak"], [/jungle|forest|wood/i, "jungle"],
    [/pyramid/i, "greatPyramid"], [/palace|throne|hall/i, "palace"], [/prison|jail|cell/i, "prison"], [/crypt|tomb|church|sanct/i, "crypt"], [/fort|camp|legion|war/i, "fort"], [/sand|desert|dune/i, "desert"], [/ruin|temple/i, "temple"], [/water|river|shore|coast/i, "shore"], [/star|night|sky/i, "starfall"]];

  // ---------- spec lookup ----------
  function resolve(key) {
    if (!key) return "desert";
    if (SPECS[key]) return key;
    const a = ALIAS[key]; if (a) { const k = Array.isArray(a) ? a[0] : a; return SPECS[k] ? k : resolve(k); }
    const low = Object.keys(SPECS).find(k => k.toLowerCase() === String(key).toLowerCase()); if (low) return low;
    const w = WORDS.find(([re]) => re.test(key)); return w ? w[1] : "desert";
  }
  const overrides = {};
  function specOf(key) {
    const raw = ALIAS[key], k = resolve(key), base = SPECS[k], extra = Array.isArray(raw) ? raw[1] : null;
    return Object.assign({}, base, extra || {}, overrides[key] || {}, overrides[k] || {}, { key: k, asked: key });
  }

  // ---------- textures ----------
  let THREE = null, looksJson = null, looksP = null;
  const texCache = {}, texDone = {}, texOrder = [], manifestP = {};
  function loadTex(url, cfg) {
    if (texCache[url]) { const i = texOrder.indexOf(url); if (i >= 0) texOrder.splice(i, 1); texOrder.push(url); return texCache[url]; }
    texOrder.push(url);
    return (texCache[url] = new Promise(res => new THREE.TextureLoader().load(url, t => {
      cfg && cfg(t); texDone[url] = t; res(t);
    }, undefined, () => res(null))));
  }
  // keep the textures of the newest arenas only (a long session visits dozens; each floor + picture is about 10 MB of video memory)
  function trimTextures(keep) {
    const live = texOrder.filter(u => !keep.includes(u)); while (live.length > 4) { const u = live.shift(); const t = texDone[u]; if (t && t.dispose) t.dispose(); delete texCache[u]; delete texDone[u]; texOrder.splice(texOrder.indexOf(u), 1); }
  }
  const floorCfg = rend => t => { t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping; t.magFilter = THREE.NearestFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true; t.anisotropy = Math.min(8, rend && rend.capabilities ? rend.capabilities.getMaxAnisotropy() : 4); };
  const legacyFloorCfg = t => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; };   // the M1 floors (assets/floor_*.png) keep their original look
  const panoCfg = t => { t.wrapS = THREE.MirroredRepeatWrapping; t.wrapT = THREE.ClampToEdgeWrapping; t.magFilter = THREE.NearestFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true; t.anisotropy = 4; };
  const cutCfg = t => { t.magFilter = THREE.NearestFilter; t.minFilter = THREE.LinearFilter; t.generateMipmaps = false; };
  function loadLooks() { return looksP || (looksP = fetch(BASE + "looks.json", { cache: "no-cache" }).then(r => (r.ok ? r.json() : {})).catch(() => ({})).then(j => { looksJson = j || {}; return looksJson; })); }
  let cutManifest = null, cutP = null;
  function loadCutManifest() { return cutP || (cutP = fetch(BASE + "props/manifest.json", { cache: "no-cache" }).then(r => (r.ok ? r.json() : {})).catch(() => ({})).then(j => { cutManifest = j || {}; return cutManifest; })); }
  const rendererRef = { r: null };
  async function prepare(key, three, renderer) {
    THREE = three || root.THREE; if (renderer) rendererRef.r = renderer;
    const spec = specOf(key); await Promise.all([loadLooks(), loadCutManifest()]);
    const files = spec.files || {}, lk = spec.look;
    const fUrl = files.floor || BASE + (spec.floor || lk) + "_floor.jpg", pUrl = files.pano || BASE + (spec.pano || lk) + "_pano.jpg";
    const legacyFloor = !!files.floor, jobs = [loadTex(fUrl, legacyFloor ? legacyFloorCfg : floorCfg(rendererRef.r)), loadTex(pUrl, panoCfg)];
    const cuts = (spec.props || []).filter(p => p[0] === "cut").map(p => p[1]);
    cuts.forEach(c => { if (cutManifest[c]) jobs.push(loadTex(BASE + "props/" + c + ".png", cutCfg)); });
    const [ft, pt] = await Promise.all(jobs); trimTextures([fUrl, pUrl]);
    return { spec, floor: ft, pano: pt, fUrl, pUrl };
  }

  // ---------- small canvas textures ----------
  const cvCache = {};
  function canvasTex(name, w, h, draw, repeat) {
    if (cvCache[name]) return cvCache[name];
    const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h);
    const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false;
    if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return (cvCache[name] = t);
  }
  const dotTex = () => canvasTex("dot", 32, 32, (g, w, h) => { const gr = g.createRadialGradient(16, 16, 1, 16, 16, 15); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.35, "rgba(255,255,255,.9)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const softTex = () => canvasTex("soft", 64, 64, (g, w, h) => { const gr = g.createRadialGradient(32, 32, 1, 32, 32, 31); gr.addColorStop(0, "rgba(255,255,255,.9)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const diamondTex = () => canvasTex("diamond", 16, 16, (g) => { g.fillStyle = "#fff"; g.beginPath(); g.moveTo(8, 0); g.lineTo(14, 8); g.lineTo(8, 16); g.lineTo(2, 8); g.closePath(); g.fill(); });
  const leafTex = () => canvasTex("leaf", 16, 16, (g) => { g.fillStyle = "#fff"; g.beginPath(); g.ellipse(8, 8, 7, 3.4, -0.6, 0, 7); g.fill(); g.strokeStyle = "rgba(0,0,0,.35)"; g.beginPath(); g.moveTo(2, 12); g.lineTo(14, 4); g.stroke(); });
  const featherTex = () => canvasTex("feather", 16, 16, (g) => { g.fillStyle = "#fff"; g.beginPath(); g.ellipse(8, 8, 7.4, 2, -0.7, 0, 7); g.fill(); g.strokeStyle = "rgba(120,100,80,.6)"; g.beginPath(); g.moveTo(2, 14); g.lineTo(14, 2); g.stroke(); });
  const ringTex = () => canvasTex("ring", 24, 24, (g) => { g.strokeStyle = "#fff"; g.lineWidth = 2; g.beginPath(); g.arc(12, 12, 8, 0, 7); g.stroke(); g.fillStyle = "rgba(255,255,255,.6)"; g.fillRect(8, 7, 3, 2); });
  const petalTex = () => canvasTex("petal", 12, 12, (g) => { g.fillStyle = "#fff"; g.beginPath(); g.ellipse(6, 6, 5, 3, 0.5, 0, 7); g.fill(); });
  const flameTex = () => canvasTex("flame", 32, 48, (g, w, h) => {
    const gr = g.createRadialGradient(16, 34, 2, 16, 30, 20); gr.addColorStop(0, "rgba(255,255,220,1)"); gr.addColorStop(0.3, "rgba(255,200,80,.95)"); gr.addColorStop(0.65, "rgba(255,100,20,.6)"); gr.addColorStop(1, "rgba(255,60,0,0)");
    g.fillStyle = gr; g.beginPath(); g.moveTo(16, 2); g.bezierCurveTo(26, 18, 31, 28, 16, 46); g.bezierCurveTo(1, 28, 6, 18, 16, 2); g.fill(); g.globalCompositeOperation = "source-in"; g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
  const skirtTex = () => canvasTex("skirt", 4, 64, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#000"); gr.addColorStop(0.5, "#666"); gr.addColorStop(1, "#fff"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });   // used as an alphaMap: three reads the GREEN channel, so it is a grey ramp (top clear, bottom solid)
  const shaftTex = () => canvasTex("shaft", 32, 64, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(255,255,255,.55)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.globalCompositeOperation = "destination-in"; const gx = g.createLinearGradient(0, 0, w, 0); gx.addColorStop(0, "rgba(0,0,0,0)"); gx.addColorStop(0.5, "rgba(0,0,0,1)"); gx.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gx; g.fillRect(0, 0, w, h); });
  const rippleTex = () => canvasTex("ripple", 64, 64, (g, w, h) => { g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(0, 0, w, h); for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(255,255,255,${0.15 + Math.random() * 0.35})`; const x = Math.random() * w, y = Math.random() * h; g.fillRect(x, y, 2 + Math.random() * 7, 1); } }, true);
  function stoneTex(base, key) {
    return canvasTex("stone" + key + base, 64, 64, (g, w, h) => {
      const c = hexToRgb(base).map(v => v * 255); g.fillStyle = `rgb(${c.map(Math.round)})`; g.fillRect(0, 0, w, h);
      for (let row = 0; row < 4; row++) { const off = row % 2 ? 16 : 0; for (let col = -1; col < 3; col++) { const x = col * 32 + off, v = 0.82 + Math.random() * 0.34; g.fillStyle = `rgb(${c.map(k => Math.round(Math.min(255, k * v)))})`; g.fillRect(x + 1, row * 16 + 1, 30, 14); g.fillStyle = "rgba(255,255,255,.07)"; g.fillRect(x + 1, row * 16 + 1, 30, 2); } }
      g.fillStyle = "rgba(0,0,0,.45)"; for (let row = 0; row < 4; row++) { g.fillRect(0, row * 16, w, 1); for (let col = -1; col < 3; col++) g.fillRect(col * 32 + (row % 2 ? 16 : 0), row * 16, 1, 16); }
      for (let i = 0; i < 90; i++) { g.fillStyle = Math.random() < 0.5 ? "rgba(0,0,0,.18)" : "rgba(255,255,255,.1)"; g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1); }
    }, true);
  }
  function frondTex() {   // a fern frond with a stem and paired leaflets, on a clear background (cut out by alphaTest)
    return canvasTex("frond", 64, 96, (g, w, h) => {
      g.strokeStyle = "#cfe8b0"; g.lineWidth = 2; g.beginPath(); g.moveTo(32, 95); g.quadraticCurveTo(30, 50, 32, 4); g.stroke();
      for (let i = 0; i < 14; i++) { const y = 90 - i * 6.2, L = 4 + (i < 8 ? i * 2.6 : (14 - i) * 3.6); g.fillStyle = i % 2 ? "#ffffff" : "#d8f0c0"; g.beginPath(); g.ellipse(32 - L / 2 - 1, y, L / 2 + 1, 2.4, -0.45, 0, 7); g.fill(); g.beginPath(); g.ellipse(32 + L / 2 + 1, y, L / 2 + 1, 2.4, 0.45, 0, 7); g.fill(); }
    });
  }
  function bannerTex(base) {   // tattered banner: dark border, a pale emblem (a diamond with a ring), a swallow-tail bottom
    return canvasTex("banner" + base, 64, 96, (g, w, h) => {
      const c = hexToRgb(base).map(v => Math.round(v * 255)); g.clearRect(0, 0, w, h);
      g.fillStyle = "#1c1008"; g.beginPath(); g.moveTo(0, 0); g.lineTo(w, 0); g.lineTo(w, h - 4); g.lineTo(w / 2, h - 22); g.lineTo(0, h - 4); g.closePath(); g.fill();
      g.fillStyle = "rgb(" + c + ")"; g.beginPath(); g.moveTo(4, 4); g.lineTo(w - 4, 4); g.lineTo(w - 4, h - 12); g.lineTo(w / 2, h - 28); g.lineTo(4, h - 12); g.closePath(); g.fill();
      g.strokeStyle = "rgba(240,210,150,.85)"; g.lineWidth = 3; g.beginPath(); g.moveTo(w / 2, 20); g.lineTo(w - 16, 40); g.lineTo(w / 2, 60); g.lineTo(16, 40); g.closePath(); g.stroke(); g.beginPath(); g.arc(w / 2, 40, 6, 0, 7); g.stroke();
      for (let i = 0; i < 10; i++) { g.fillStyle = "rgba(0,0,0,.18)"; g.fillRect(Math.random() * w, Math.random() * h, 2, 6 + Math.random() * 10); }
    });
  }
  function barkTex(base) {
    return canvasTex("bark" + base, 64, 64, (g, w, h) => { const c = hexToRgb(base).map(v => v * 255); g.fillStyle = `rgb(${c.map(Math.round)})`; g.fillRect(0, 0, w, h);
      for (let x = 0; x < w; x += 2) { const v = 0.6 + Math.random() * 0.7; g.fillStyle = `rgba(${c.map(k => Math.round(Math.min(255, k * v)))},.9)`; g.fillRect(x, 0, 1 + (Math.random() < 0.4 ? 1 : 0), h); }
      for (let i = 0; i < 40; i++) { g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(Math.random() * w, Math.random() * h, 1, 3 + Math.random() * 8); }
      for (let i = 0; i < 14; i++) { g.fillStyle = "rgba(90,130,50,.45)"; g.fillRect(Math.random() * w, Math.random() * h, 3 + Math.random() * 4, 2); } }, true);
  }
  function woodTex(base) {
    return canvasTex("wood" + base, 64, 64, (g, w, h) => { const c = hexToRgb(base).map(v => v * 255);
      for (let r = 0; r < 4; r++) { const v = 0.8 + Math.random() * 0.4; g.fillStyle = `rgb(${c.map(k => Math.round(Math.min(255, k * v)))})`; g.fillRect(0, r * 16, w, 16); g.fillStyle = "rgba(0,0,0,.5)"; g.fillRect(0, r * 16, w, 1); for (let i = 0; i < 6; i++) { g.fillStyle = "rgba(0,0,0,.15)"; g.fillRect(Math.random() * w, r * 16 + 3 + Math.random() * 10, 8 + Math.random() * 14, 1); } } }, true);
  }

  // ---------- materials ----------
  const matCache = {};
  const phong = (color, o) => new THREE.MeshPhongMaterial(Object.assign({ color, flatShading: true, shininess: 0, specular: 0 }, o || {}));
  const basic = (color, o) => new THREE.MeshBasicMaterial(Object.assign({ color }, o || {}));
  const glow = (color, op) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: op === undefined ? 0.9 : op, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  function sprite(tex, color, scale, opacity, additive) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color, transparent: true, opacity: opacity === undefined ? 1 : opacity, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, fog: false }));
    s.scale.set(scale, scale, 1); return s;
  }

  // ---------- backdrop ----------
  function ringGeo(R, y0, y1, segs, uc, uSpan) {
    const pos = [], uv = [], idx = [];
    for (let i = 0; i <= segs; i++) {
      const t = i / segs, phi = (t - 0.5) * Math.PI * 2, x = R * Math.sin(phi), z = -R * Math.cos(phi), u = uc + phi / (Math.PI * 2) * uSpan;
      pos.push(x, y0, z, x, y1, z); uv.push(u, 0, u, 1);
      if (i < segs) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); return g;
  }
  // average colours of the top rows and of the rows just above the ground line of a loaded picture (a 64 px copy on a canvas)
  function edgeColors(tex) {
    try {
      const im = tex.image; if (!im || !im.width) return null; const w = 64, h = Math.max(8, Math.round(64 * im.height / im.width)), c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d"); g.drawImage(im, 0, 0, w, h);
      const rows = (y0, y1) => { const d = g.getImageData(0, Math.floor(y0 * h), w, Math.max(1, Math.ceil((y1 - y0) * h))).data; let r = 0, gg = 0, b = 0, n = d.length / 4; for (let i = 0; i < d.length; i += 4) { r += d[i]; gg += d[i + 1]; b += d[i + 2]; } return "#" + [r, gg, b].map(v => Math.round(v / n).toString(16).padStart(2, "0")).join(""); };
      return { top: rows(0, 0.04), mid: rows(0.7, 0.8), fog: rows(0.92, 1), aspect: im.width / im.height };
    } catch (e) { return null; }
  }
  function buildBackdrop(env, spec, art, L) {
    const { world } = env, group = new THREE.Group(); world.add(group);
    const aspect = (L && L.aspect) || (art.pano && art.pano.image && art.pano.image.width ? art.pano.image.width / art.pano.image.height : 2.356), ground = spec.ground, W = Math.PI * R_WALL / 2 * (4 / N_COPIES), H = W / aspect, yTop = ground * H, yBot = -(1 - ground) * H;
    const pm = new THREE.MeshBasicMaterial({ map: art.pano || null, side: THREE.DoubleSide, fog: false, color: spec.ptint === undefined ? 0xffffff : spec.ptint });
    if (spec.pb) pm.color.multiplyScalar(spec.pb);
    const ring = new THREE.Mesh(ringGeo(R_WALL, yBot, yTop, 96, N_COPIES / 2 + 0.5, N_COPIES), pm); group.add(ring);
    if (!(L && L.top) && art.pano) L = edgeColors(art.pano) || L;   // pictures without a looks.json entry (the old M1 backdrops): read the colours off the picture itself
    const topCol = L && L.top ? mix(strHex(L.top), 0x000000, 0.2) : 0x101010;
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(R_WALL, R_WALL, 70, 32, 1, true), new THREE.MeshBasicMaterial({ color: topCol, side: THREE.DoubleSide, fog: false })); cap.position.y = yTop + 35 - 0.02; group.add(cap);
    const fogC = spec.fog !== undefined ? spec.fog : L && L.mid ? mix(strHex(L.mid), 0x000000, 0.45) : 0x201410;
    const skirtH = spec.skirt || 3.2;
    const sk = new THREE.Mesh(ringGeo(R_WALL - 0.12, -0.4, skirtH, 48, 0.5, 1), new THREE.MeshBasicMaterial({ color: fogC, alphaMap: skirtTex(), transparent: true, side: THREE.DoubleSide, depthWrite: false, fog: false })); sk.renderOrder = 1; group.add(sk);
    return { group, ring, pm, fogC, yTop };
  }

  // ---------- lights ----------
  function buildLights(env, spec) {
    const { world } = env, mood = MOODS[spec.mood] || MOODS.dusk, out = { flick: [], lights: [] };
    out.amb = new THREE.AmbientLight(0xffffff, spec.amb !== undefined ? spec.amb : mood.amb); world.add(out.amb);
    const h = spec.hemi || mood.hemi; out.hemi = new THREE.HemisphereLight(h[0], h[1], h[2]); world.add(out.hemi);
    const s = spec.sun || mood.sun; out.sun = new THREE.DirectionalLight(s[0], s[1]); out.sun.position.set(-10, 14, 8); world.add(out.sun);
    out.base = { amb: out.amb.intensity, hemi: out.hemi.intensity, sun: out.sun.intensity };
    const torches = spec.torches === true ? STD_TORCHES : spec.torches || [];
    torches.forEach(([x, z], i) => {
      const col = spec.torch || 0xff8a3a, l = new THREE.PointLight(col, 1.6, 22, 2); l.position.set(x, 3.2, z); world.add(l); out.flick.push({ l, base: 1.5, amp: 0.3, ph: i * 2 });
      const f = sprite(flameTex(), col, 1.5, 0.95, true); f.position.set(x, 3.3, z); f.scale.set(0.9, 1.4, 1); world.add(f); out.flick.push({ f });
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 3.0, 5), phong(0x3a2a1c)); pole.position.set(x, 1.5, z); world.add(pole);
    });
    (spec.lights || []).forEach(([c, i, d, x, y, z, fl], k) => { const l = new THREE.PointLight(c, i, d, 2); l.position.set(x, y, z); world.add(l); out.flick.push({ l, base: i, amp: (fl || 0) * i, ph: k * 1.7 }); });
    return out;
  }

  // ---------- weather ----------
  const WX = {
    rain:     { line: true, n: 360, len: 1.0, v: [-3, -26, 0], c: 0xaecdf0, a: 0.5 },
    saltRain: { pts: "diamond", n: 200, v: [-1.2, -3.2, 0], c: 0xffe4ec, size: 0.2, a: 0.95, sway: 0.5 },
    snow:     { pts: "dot", n: 240, v: [-0.3, -1.4, 0], c: 0xffffff, size: 0.18, a: 0.9, sway: 0.8 },
    ash:      { pts: "dot", n: 200, v: [-0.6, -0.9, 0], c: 0xc8bfb4, size: 0.14, a: 0.75, sway: 0.7 },
    embers:   { pts: "dot", n: 140, v: [0.2, 1.5, 0], c: 0xff9440, size: 0.17, a: 1, sway: 0.9, add: true, flicker: true, spawnY: [0, 4] },
    sparks:   { pts: "dot", n: 120, v: [0.5, 3.4, 0], c: 0xffd070, size: 0.15, a: 1, sway: 0.5, add: true, spawnY: [0, 3] },
    spores:   { pts: "soft", n: 100, v: [0.1, 0.32, 0], c: 0xb8ffd8, size: 0.34, a: 0.8, sway: 0.6, add: true },
    leaves:   { pts: "leaf", n: 60, v: [-0.8, -1.1, 0], c: 0x8aa84a, size: 0.4, a: 1, sway: 1.4 },
    feathers: { pts: "feather", n: 40, v: [-0.5, -0.7, 0], c: 0xf0e8d8, size: 0.42, a: 1, sway: 1.3 },
    petals:   { pts: "petal", n: 40, v: [-0.4, -0.6, 0], c: 0xff9a8a, size: 0.3, a: 1, sway: 1.0 },
    motes:    { pts: "soft", n: 100, v: [0.12, 0.06, 0], c: 0xffe0b0, size: 0.3, a: 0.55, sway: 0.4, add: true },
    dust:     { pts: "dot", n: 140, v: [0.1, 0.25, 0], c: 0xffe0b0, size: 0.1, a: 0.7, sway: 0.2 },
    mist:     { pts: "soft", n: 50, v: [0.25, 0, 0], c: 0xdfe8f0, size: 1.6, a: 0.1, sway: 0.2, spawnY: [0, 3] },
    steam:    { pts: "soft", n: 80, v: [0.1, 0.9, 0], c: 0xf0f8ff, size: 1.1, a: 0.16, sway: 0.5, spawnY: [0, 2] },
    spray:    { pts: "dot", n: 80, v: [-2.5, 0.4, 0], c: 0xe8f4ff, size: 0.14, a: 0.7, sway: 0.4 },
    bubbles:  { pts: "ring", n: 80, v: [0, 1.0, 0], c: 0xbfe8ff, size: 0.3, a: 0.85, sway: 0.4 },
    sparkles: { pts: "diamond", n: 80, v: [0, 0.2, 0], c: 0xffffff, size: 0.22, a: 1, sway: 0.3, add: true, flicker: true },
    drips:    { pts: "dot", n: 18, v: [0, -9, 0], c: 0xbfe0ff, size: 0.1, a: 0.8, sway: 0, spawnY: [10, 14] },
    stars:    { line: true, n: 8, len: 6, v: [9, -13, 0], c: 0xffffff, a: 1, add: true, respawn: 2.5 },
  };
  function buildWeather(env, w) {
    const base = WX[w.k]; if (!base) return null; const d = Object.assign({}, base, w), n = d.n, box = { x: [-26, 26], y: [0, 15], z: [-22, 11] };
    const sy = d.spawnY || [box.y[0], box.y[1]], P = new Float32Array(n * 3), V = [], PH = new Float32Array(n);
    const speedK = d.v ? 1 : 1; const vk = w.v && typeof w.v === "number" ? w.v : 1;   // numeric v = speed multiplier from the spec
    const vel = Array.isArray(base.v) ? base.v : [0, 0, 0];
    for (let i = 0; i < n; i++) { P[i * 3] = rnd(box.x[0], box.x[1]); P[i * 3 + 1] = rnd(sy[0], sy[1]); P[i * 3 + 2] = rnd(box.z[0], box.z[1]); PH[i] = rnd(0, 6.28); V.push(rnd(0.75, 1.25)); }
    let mesh, geo = new THREE.BufferGeometry();
    const col = new THREE.Color(d.c);
    if (d.line) {
      const lp = new Float32Array(n * 6); geo.setAttribute("position", new THREE.BufferAttribute(lp, 3));
      mesh = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: d.a, blending: d.add ? THREE.AdditiveBlending : THREE.NormalBlending, depthWrite: false, fog: false }));
    } else {
      geo.setAttribute("position", new THREE.BufferAttribute(P.slice(), 3));
      const tex = { dot: dotTex, soft: softTex, diamond: diamondTex, leaf: leafTex, feather: featherTex, ring: ringTex, petal: petalTex }[d.pts]();
      mesh = new THREE.Points(geo, new THREE.PointsMaterial({ map: tex, color: col, size: d.size, transparent: true, opacity: d.a, depthWrite: false, blending: d.add ? THREE.AdditiveBlending : THREE.NormalBlending, alphaTest: d.pts === "dot" || d.pts === "soft" ? 0 : 0.2, fog: false }));
    }
    mesh.frustumCulled = false; env.world.add(mesh);
    const timers = d.respawn ? new Float32Array(n).map(() => rnd(0, d.respawn)) : null;
    const sp = (typeof w.v === "number" ? w.v : 1);
    return { mesh, d, update(dt, t) {
      const pa = d.line ? mesh.geometry.attributes.position : mesh.geometry.attributes.position, arr = pa.array;
      for (let i = 0; i < n; i++) {
        const k = V[i] * sp;
        if (d.respawn) { timers[i] -= dt; if (timers[i] < 0) { timers[i] = d.respawn * rnd(0.6, 1.6); P[i * 3] = rnd(-24, 4); P[i * 3 + 1] = rnd(9, 15); P[i * 3 + 2] = rnd(-24, -8); PH[i] = 0.0001; } if (PH[i] > 0) { PH[i] += dt; } }
        P[i * 3] += (vel[0] * k + Math.sin(t * 0.9 + PH[i]) * (d.sway || 0)) * dt; P[i * 3 + 1] += vel[1] * k * dt; P[i * 3 + 2] += vel[2] * k * dt;
        if (P[i * 3 + 1] < box.y[0] - 0.2 && vel[1] < 0) { P[i * 3 + 1] = sy[1]; P[i * 3] = rnd(box.x[0], box.x[1]); P[i * 3 + 2] = rnd(box.z[0], box.z[1]); }
        else if (P[i * 3 + 1] > sy[1] + (d.spawnY ? 6 : 0) && vel[1] > 0) { P[i * 3 + 1] = sy[0]; P[i * 3] = rnd(box.x[0], box.x[1]); P[i * 3 + 2] = rnd(box.z[0], box.z[1]); }
        if (P[i * 3] > box.x[1]) P[i * 3] = box.x[0]; else if (P[i * 3] < box.x[0]) P[i * 3] = box.x[1];
        if (d.line) { const l = d.len, vl = Math.hypot(vel[0], vel[1]) || 1; arr[i * 6] = P[i * 3]; arr[i * 6 + 1] = P[i * 3 + 1]; arr[i * 6 + 2] = P[i * 3 + 2]; arr[i * 6 + 3] = P[i * 3] - vel[0] / vl * l; arr[i * 6 + 4] = P[i * 3 + 1] - vel[1] / vl * l; arr[i * 6 + 5] = P[i * 3 + 2]; }
        else { arr[i * 3] = P[i * 3]; arr[i * 3 + 1] = P[i * 3 + 1]; arr[i * 3 + 2] = P[i * 3 + 2]; }
      }
      pa.needsUpdate = true;
      if (d.flicker) mesh.material.opacity = d.a * (0.8 + Math.sin(t * 13) * 0.2);
    }, dispose() { env.world.remove(mesh); geo.dispose(); } };
  }

  // ---------- props ----------
  // every prop builder returns an Object3D standing on the floor at (0,0,0); placement happens in addProp.  h = height, o = options
  const ROCK = (c, s) => { const m = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), phong(c)); m.scale.y = 0.62; m.position.y = s * 0.3; m.rotation.set(rnd(0, 3), rnd(0, 3), rnd(0, 3)); return m; };
  const B = {
    rocks(h, o, env, spec) {
      const g = new THREE.Group(), n = o.n || 12, c = o.c || 0x8a7a68, ss = o.s || 1; const rock = phong(c);
      for (let i = 0; i < n; i++) {
        const a = rr() * 6.28, d = o.band ? o.band[0] + rr() * (o.band[1] - o.band[0]) : 8 + rr() * 11, s = (0.22 + rr() * 0.55) * ss, x = Math.cos(a) * d * 1.25, z = Math.sin(a) * d * 0.9 - 3;
        if (z > 3.0) continue; if (Math.abs(x) < 8.5 && z > -7 && z < 4) continue;   // keep the fight area clear
        const m = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), rock); m.position.set(x, s * 0.28, z); m.rotation.set(rr() * 3, rr() * 6, rr() * 3); m.scale.y = 0.62; g.add(m);
      }
      g.userData.absolute = true; return g;
    },
    pillar(h, o) {
      const g = new THREE.Group(), r = Math.max(0.55, h * 0.085), tex = o.glow ? null : stoneTex(o.c || 0x8a7a68, "p"), col = o.gold ? 0xffd870 : 0xffffff;
      const m = tex ? new THREE.MeshPhongMaterial({ map: tex, color: col, shininess: 0, specular: 0, flatShading: true }) : phong(o.c || 0x181c24);
      if (tex) tex.repeat.set(2, Math.max(1, Math.round(h / 3)));
      const hh = o.broken ? h * 0.62 : h;
      const base = new THREE.Mesh(new THREE.BoxGeometry(r * 2.7, 0.5, r * 2.7), m); base.position.y = 0.25; g.add(base);
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.88, r, hh - 1.0, 9), m); shaft.position.y = 0.5 + (hh - 1.0) / 2; g.add(shaft);
      if (!o.broken) { const cap = new THREE.Mesh(new THREE.BoxGeometry(r * 2.5, 0.5, r * 2.5), m); cap.position.y = hh - 0.25; g.add(cap); } else { for (let i = 0; i < 4; i++) { const c = ROCK(o.c || 0x8a7a68, r * (0.4 + Math.random() * 0.4)); c.position.x = rnd(-r * 2.2, r * 2.2); c.position.z = rnd(-r, r * 2); g.add(c); } }
      if (o.glow) for (let i = 0; i < 3; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.06, hh * 0.9, 0.06), glow(o.glow, 0.9)); s.position.set(r * 0.9 * Math.cos(i * 2.1 + 0.7), hh / 2, r * 0.9 * Math.sin(i * 2.1 + 0.7)); g.add(s); }
      if (o.mossy) { const mo = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.92, r * 1.02, hh * 0.3, 9, 1, true), basic(0x3a6a3a, { transparent: true, opacity: 0.45, side: THREE.DoubleSide })); mo.position.y = hh * 0.2; g.add(mo); }
      return g;
    },
    wall(h, o) {
      const g = new THREE.Group(), w = o.w || 8, tex = stoneTex(o.c || 0x6a625a, "w"); tex.repeat.set(w / 3, h / 3);
      const m = new THREE.MeshPhongMaterial({ map: tex, shininess: 0, specular: 0, flatShading: true });
      const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, 1.6), m); body.position.y = h / 2; g.add(body);
      const n = Math.round(w / 1.4); for (let i = 0; i < n; i++) { if (o.ruin && Math.random() < 0.4) continue; const b = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.7, 1.7), m); b.position.set(-w / 2 + 0.7 + i * (w - 1.4) / Math.max(1, n - 1), h + 0.35, 0); g.add(b); }
      if (o.ruin) { for (let i = 0; i < 6; i++) { const c = ROCK(o.c || 0x6a625a, 0.4 + Math.random() * 0.5); c.position.set(rnd(-w * 0.6, w * 0.6), 0, rnd(0.8, 3)); g.add(c); } }
      return g;
    },
    trunk(h, o) {
      const g = new THREE.Group(), r = Math.max(0.9, h * 0.075), tex = barkTex(o.c || 0x4a3626); tex.repeat.set(2, Math.max(1, h / 5));
      const m = new THREE.MeshPhongMaterial({ map: tex, shininess: 0, specular: 0, flatShading: true });
      const t = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.78, r, h, 10), m); t.position.y = h / 2; g.add(t);
      const fl = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.5, h * 0.12, 10), m); fl.position.y = h * 0.06; g.add(fl);
      for (let i = 0; i < 5; i++) { const a = i / 5 * 6.28 + 0.4, root = new THREE.Mesh(new THREE.ConeGeometry(r * 0.5, r * 3.2, 5), m); root.position.set(Math.cos(a) * r * 1.5, r * 0.45, Math.sin(a) * r * 1.5); root.rotation.z = -Math.cos(a) * 1.25; root.rotation.x = Math.sin(a) * 1.25; g.add(root); }
      const vm = basic(0x2f5a2a, { side: THREE.DoubleSide });
      for (let i = 0; i < 4; i++) { const a = rnd(0, 6.28), len = h * rnd(0.3, 0.6), v = new THREE.Mesh(new THREE.PlaneGeometry(0.22, len), vm); v.position.set(Math.cos(a) * r * 0.85, h * 0.9 - len / 2, Math.sin(a) * r * 0.85); v.rotation.y = a; g.add(v); }
      return g;
    },
    roots(h, o) {
      const g = new THREE.Group(), tex = barkTex(o.c || 0x4a3220), m = new THREE.MeshPhongMaterial({ map: tex, shininess: 0, specular: 0, flatShading: true }); tex.repeat.set(1, 6);
      for (let k = 0; k < 3; k++) {
        const s = k === 0 ? 1 : 0.6, pts = [new THREE.Vector3(-1.2 * k, 0, 0), new THREE.Vector3(-2 + k, h * 0.3 * s, 0.6), new THREE.Vector3(1 + k * 0.6, h * 0.6 * s, -0.4), new THREE.Vector3(3 - k, h * 0.95 * s, 0.2)];
        g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 18, 0.55 - k * 0.12, 7, false), m));
      }
      return g;
    },
    ferns(h) {
      const g = new THREE.Group(), tx = frondTex(), m = new THREE.MeshBasicMaterial({ map: tx, color: 0xa8c890, side: THREE.DoubleSide, transparent: true, alphaTest: 0.35, fog: true }), m2 = new THREE.MeshBasicMaterial({ map: tx, color: 0x70a060, side: THREE.DoubleSide, transparent: true, alphaTest: 0.35, fog: true });
      for (let i = 0; i < 8; i++) { const w = h * rnd(0.9, 1.5), l = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.6, w), i % 2 ? m : m2); l.position.y = w * 0.46; l.rotation.set(rnd(-0.35, 0.15), rnd(0, 6.28), rnd(-0.5, 0.5)); l.position.x = rnd(-0.5, 0.5); l.position.z = rnd(-0.4, 0.4); g.add(l); }
      return g;
    },
    reeds(h) {
      const g = new THREE.Group(), m = basic(0x6a7a3a, { side: THREE.DoubleSide });
      for (let i = 0; i < 16; i++) { const r = new THREE.Mesh(new THREE.PlaneGeometry(0.1, h * rnd(0.6, 1.2)), m); r.position.set(rnd(-1.2, 1.2), h * 0.5, rnd(-0.6, 0.6)); r.rotation.z = rnd(-0.25, 0.25); g.add(r); const t = new THREE.Mesh(new THREE.SphereGeometry(0.1, 5, 4), basic(0x4a3220)); t.position.set(r.position.x, h * 0.95 * rnd(0.6, 1), r.position.z); g.add(t); }
      return g;
    },
    stalag(h, o) { const g = new THREE.Group(); for (let i = 0; i < 3; i++) { const hh = h * (i ? rnd(0.4, 0.7) : 1), m = new THREE.Mesh(new THREE.ConeGeometry(h * 0.16 * (i ? 0.6 : 1), hh, 6), phong(o.c || 0x4a4640)); m.position.set(i ? rnd(-1.1, 1.1) : 0, hh / 2, i ? rnd(-0.7, 0.7) : 0); g.add(m); } return g; },
    stalac(h, o) { const g = new THREE.Group(); for (let i = 0; i < 3; i++) { const hh = h * (i ? rnd(0.4, 0.8) : 1), m = new THREE.Mesh(new THREE.ConeGeometry(h * 0.1 * (i ? 0.6 : 1), hh, 6), phong(o.c || 0x4a4640)); m.rotation.x = Math.PI; m.position.set(i ? rnd(-1.4, 1.4) : 0, 17 - hh / 2, i ? rnd(-0.7, 0.7) : 0); g.add(m); } return g; },
    crystal(h, o) {
      const g = new THREE.Group(), c = o.c || 0x70e0ff, m = new THREE.MeshPhongMaterial({ color: c, emissive: c, emissiveIntensity: 0.65, flatShading: true, shininess: 40, transparent: true, opacity: 0.92 });
      for (let i = 0; i < 5; i++) { const hh = h * (i ? rnd(0.4, 0.8) : 1), s = new THREE.Mesh(new THREE.ConeGeometry(h * 0.16 * (i ? 0.7 : 1), hh, 5), m); s.position.set(i ? rnd(-0.9, 0.9) * h * 0.3 : 0, hh / 2, i ? rnd(-0.5, 0.5) * h * 0.3 : 0); s.rotation.z = i ? rnd(-0.3, 0.3) : 0; g.add(s); }
      const sp = sprite(softTex(), c, h * 2.2, 0.5, true); sp.position.y = h * 0.5; g.add(sp); const l = new THREE.PointLight(c, 0.9, 11, 2); l.position.y = h * 0.6; g.add(l); g.userData.flick = l; return g;
    },
    prismShard(h, o) { const g = B.crystal(h, o); return g; },
    mushroom(h, o) {
      const g = new THREE.Group(), c = o.c || 0xb070ff, stem = new THREE.Mesh(new THREE.CylinderGeometry(h * 0.08, h * 0.12, h * 0.8, 6), phong(0xd8d0c0)); stem.position.y = h * 0.4; g.add(stem);
      const cap = new THREE.Mesh(new THREE.SphereGeometry(h * 0.42, 9, 6, 0, 6.3, 0, 1.45), new THREE.MeshPhongMaterial({ color: c, emissive: c, emissiveIntensity: 0.7, flatShading: true, side: THREE.DoubleSide, shininess: 0 })); cap.position.y = h * 0.78; g.add(cap);
      const sp = sprite(softTex(), c, h * 1.8, 0.45, true); sp.position.y = h * 0.8; g.add(sp);
      for (let i = 0; i < 3; i++) { const s = new THREE.Mesh(new THREE.CylinderGeometry(h * 0.04, h * 0.06, h * 0.4, 5), phong(0xd8d0c0)); s.position.set(rnd(-1, 1) * h * 0.5, h * 0.2, rnd(-0.6, 0.6) * h * 0.5); g.add(s); const cp = new THREE.Mesh(new THREE.SphereGeometry(h * 0.18, 7, 5, 0, 6.3, 0, 1.45), new THREE.MeshPhongMaterial({ color: c, emissive: c, emissiveIntensity: 0.7, flatShading: true })); cp.position.set(s.position.x, h * 0.4, s.position.z); g.add(cp); }
      return g;
    },
    brazier(h, o) {
      const g = new THREE.Group(), bowl = new THREE.Mesh(new THREE.CylinderGeometry(h * 0.5, h * 0.3, h * 0.35, 8), phong(0x2a2420)); bowl.position.y = h * 0.95; g.add(bowl);
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(h * 0.1, h * 0.16, h * 0.8, 6), phong(0x2a2420)); leg.position.y = h * 0.4; g.add(leg);
      const f = sprite(flameTex(), 0xffffff, h * 1.5, 1, true); f.scale.set(h * 1.0, h * 1.6, 1); f.position.y = h * 1.5; g.add(f); const l = new THREE.PointLight(o.c || 0xff8a3a, 1.5, 14, 2); l.position.y = h * 1.6; g.add(l); g.userData.flick = l; g.userData.flame = f; return g;
    },
    fire(h, o) { const g = new THREE.Group(); const f = sprite(flameTex(), 0xffffff, h, 1, true); f.scale.set(h * 0.8, h * 1.3, 1); f.position.y = h * 0.6; g.add(f); const l = new THREE.PointLight(o.c || 0xff7a30, 1.6, 15, 2); l.position.y = h * 0.8; g.add(l); g.userData.flick = l; g.userData.flame = f; return g; },
    banner(h, o) {
      const g = new THREE.Group(), pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, h, 6), phong(0x3a2a1c)); pole.position.y = h / 2; g.add(pole);
      const cloth = new THREE.Mesh(new THREE.PlaneGeometry(1.7, h * 0.55, 6, 8), new THREE.MeshPhongMaterial({ map: bannerTex(o.c || 0x9a1a14), side: THREE.DoubleSide, shininess: 0, specular: 0, flatShading: true, transparent: true, alphaTest: 0.5 })); cloth.position.set(0.95, h * 0.68, 0); g.add(cloth); g.userData.cloth = cloth; return g;
    },
    crates(h) { const g = new THREE.Group(), t = woodTex(0x8a6a44); for (let i = 0; i < 4; i++) { const s = h * rnd(0.7, 1.05), m = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), new THREE.MeshPhongMaterial({ map: t, shininess: 0, specular: 0 })); m.position.set(i % 2 * h * 1.05 - h * 0.5 + rnd(-0.1, 0.1), s / 2 + (i === 3 ? h : 0), (i > 1 ? 0.9 : 0) * h); m.rotation.y = rnd(-0.3, 0.3); if (i === 3) m.position.x = h * 0.3; g.add(m); } return g; },
    barrels(h) { const g = new THREE.Group(), t = woodTex(0x7a5a38); for (let i = 0; i < 3; i++) { const m = new THREE.Mesh(new THREE.CylinderGeometry(h * 0.42, h * 0.38, h * 1.1, 9), new THREE.MeshPhongMaterial({ map: t, shininess: 0, specular: 0 })); m.position.set(i * h * 0.85 - h * 0.7, h * 0.55, (i % 2) * 0.7 * h); g.add(m); const band = new THREE.Mesh(new THREE.CylinderGeometry(h * 0.45, h * 0.45, 0.07, 9), phong(0x2a2420)); band.position.set(m.position.x, h * 0.55, m.position.z); g.add(band); } return g; },
    bollard(h) { const m = new THREE.Mesh(new THREE.CylinderGeometry(h * 0.3, h * 0.4, h, 8), phong(0x2a2824)); m.position.y = h / 2; const g = new THREE.Group(); g.add(m); return g; },
    mast(h, o) {
      const g = new THREE.Group(), t = woodTex(0x6a4a2c), m = new THREE.MeshPhongMaterial({ map: t, shininess: 0, specular: 0 }); t.repeat.set(1, 8);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.5, h, 8), m); pole.position.y = h / 2; g.add(pole);
      const yard = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 9, 6), m); yard.rotation.z = Math.PI / 2; yard.position.y = h * 0.78; g.add(yard);
      const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 7.4, 8), new THREE.MeshPhongMaterial({ color: 0xb8a888, shininess: 0, specular: 0, flatShading: true })); roll.rotation.z = Math.PI / 2; roll.position.set(0, h * 0.78 - 0.5, 0.1); g.add(roll);
      const rope = basic(0x3a2a1c); for (let i = -1; i <= 1; i += 2) { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, h * 0.85, 4), rope); r.position.set(i * 2.0, h * 0.42, 0.4); r.rotation.z = i * -0.25; g.add(r); }
      return g;
    },
    rail(h) { const g = new THREE.Group(), m = phong(0x4a3420); const top = new THREE.Mesh(new THREE.BoxGeometry(34, 0.3, 0.4), m); top.position.y = h; g.add(top); for (let i = 0; i < 18; i++) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, h, 5), m); p.position.set(-16 + i * 1.9, h / 2, 0); g.add(p); } return g; },
    lantern(h, o) {
      const g = new THREE.Group(), pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, h, 6), phong(0x3a2a1c)); pole.position.y = h / 2; g.add(pole);
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.65, 0.5), new THREE.MeshBasicMaterial({ color: 0xffd890 })); box.position.y = h + 0.1; g.add(box);
      const sp = sprite(softTex(), 0xffc060, 3.2, 0.55, true); sp.position.y = h + 0.1; g.add(sp); const l = new THREE.PointLight(0xffb050, 1.1, 14, 2); l.position.y = h; g.add(l); g.userData.flick = l; return g;
    },
    lanternLight(h, o) { const g = new THREE.Group(), c = o.c || 0x30e0ff; const sp = sprite(softTex(), c, h * 2, 0.85, true); sp.position.y = h; g.add(sp); const core = sprite(dotTex(), 0xffffff, h * 0.5, 1, true); core.position.y = h; g.add(core); const l = new THREE.PointLight(c, 1.2, 14, 2); l.position.y = h; g.add(l); g.userData.flick = l; g.userData.bob = h; return g; },
    cage(h) { const g = new THREE.Group(), m = phong(0x2a2824); for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28, b = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, h, 4), m); b.position.set(Math.cos(a) * h * 0.4, h / 2, Math.sin(a) * h * 0.4); g.add(b); } const top = new THREE.Mesh(new THREE.TorusGeometry(h * 0.4, 0.05, 4, 12), m); top.rotation.x = Math.PI / 2; top.position.y = h; g.add(top); const bot = top.clone(); bot.position.y = 0.05; g.add(bot); return g; },
    branch(h, o) { const g = new THREE.Group(), t = barkTex(o.c || 0x4a3626), m = new THREE.MeshPhongMaterial({ map: t, shininess: 0, specular: 0, flatShading: true }); t.repeat.set(1, 6); const pts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(-1.5, h * 0.4, 0.5), new THREE.Vector3(1.8, h * 0.75, -0.5), new THREE.Vector3(-0.5, h * 1.1, 0)]; g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.6, 7, false), m)); return g; },
    spire(h, o) { const g = new THREE.Group(), m = phong(o.c || 0x201f24); const s = new THREE.Mesh(new THREE.ConeGeometry(h * 0.16, h, 5), m); s.position.y = h / 2; g.add(s); for (let i = 0; i < 3; i++) { const hh = h * rnd(0.4, 0.7), c = new THREE.Mesh(new THREE.ConeGeometry(h * 0.1, hh, 5), m); c.position.set(rnd(-1.4, 1.4), hh / 2, rnd(-0.8, 0.8)); g.add(c); } return g; },
    boneArch(h) { const g = new THREE.Group(), m = phong(0xd8d0b8); const pts = []; for (let i = 0; i <= 10; i++) { const a = i / 10 * Math.PI; pts.push(new THREE.Vector3(Math.cos(a) * h * 0.35, Math.sin(a) * h, 0)); } g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.34, 6, false), m)); for (let i = 0; i < 3; i++) { const r = new THREE.Mesh(new THREE.SphereGeometry(0.4, 6, 5), m); r.position.set(-h * 0.35 + i * 0.1, 0.4, i * 0.3); g.add(r); } return g; },
    bars(h) { const g = new THREE.Group(), m = phong(0x1a1816); for (let i = 0; i < 10; i++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, h, 5), m); b.position.set(i * 0.7 - 3.2, h / 2, 0); g.add(b); } for (const y of [0.3, h * 0.5, h - 0.2]) { const r = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.16, 0.2), m); r.position.set(0, y, 0); g.add(r); } return g; },
    chains(h) { const g = new THREE.Group(), m = phong(0x2a2826); for (let i = 0; i < 3; i++) for (let k = 0; k < 11; k++) { const l = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.04, 4, 8), m); l.position.set(i * 1.3 - 1.3, 17 - k * 0.38, 0); l.rotation.y = k % 2 ? 0 : Math.PI / 2; g.add(l); } return g; },
    pipe(h) { const g = new THREE.Group(), m = phong(0x6a4a30); const p = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, h, 8), m); p.position.y = h / 2; g.add(p); const q = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 8, 8), m); q.rotation.z = Math.PI / 2; q.position.set(4, h * 0.85, 0); g.add(q); return g; },
    hedge(h) { const g = new THREE.Group(), m = phong(0x1f4a24); for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(h * 0.62, 0), m); b.position.set(i * h * 0.8 - h * 1.2, h * 0.5, rnd(-0.2, 0.2)); b.scale.y = 0.85; g.add(b); } return g; },
    planter(h) { const g = new THREE.Group(), p = new THREE.Mesh(new THREE.CylinderGeometry(h * 0.5, h * 0.35, h * 0.6, 8), phong(0xa86a40)); p.position.y = h * 0.3; g.add(p); const b = new THREE.Mesh(new THREE.IcosahedronGeometry(h * 0.6, 0), phong(0x2a5a2a)); b.position.y = h * 1.0; g.add(b); return g; },
    tower(h) { const g = new THREE.Group(), t = woodTex(0x6a4a30), m = new THREE.MeshPhongMaterial({ map: t, shininess: 0, specular: 0 }); for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.3, h, 0.3), m); l.position.set(x * 1.2, h / 2, z * 1.2); l.rotation.z = -x * 0.05; g.add(l); } const pf = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.3, 3.4), m); pf.position.y = h; g.add(pf); const r = new THREE.Mesh(new THREE.ConeGeometry(2.6, 1.4, 4), m); r.position.y = h + 2.2; r.rotation.y = Math.PI / 4; g.add(r); return g; },
    saltCrystals(h) { const g = new THREE.Group(), m = new THREE.MeshPhongMaterial({ color: 0xf0c8c8, emissive: 0x6a3038, flatShading: true, shininess: 30 }); for (let i = 0; i < 6; i++) { const hh = h * rnd(0.5, 1.2), c = new THREE.Mesh(new THREE.ConeGeometry(h * 0.18, hh, 5), m); c.position.set(rnd(-1, 1) * h * 0.5, hh / 2, rnd(-1, 1) * h * 0.4); c.rotation.z = rnd(-0.4, 0.4); g.add(c); } return g; },
    timber(h) { const g = new THREE.Group(), t = woodTex(0x6a4a2c), m = new THREE.MeshPhongMaterial({ map: t, shininess: 0, specular: 0 }); for (const x of [-2.4, 2.4]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.55, h, 0.55), m); p.position.set(x, h / 2, 0); g.add(p); } const b = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.6, 0.6), m); b.position.set(0, h, 0); g.add(b); return g; },
    sandbags(h) { const g = new THREE.Group(), m = phong(0x8a7a58); for (let r = 0; r < 3; r++) for (let i = 0; i < 6 - r; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(h * 0.3, 6, 5), m); b.scale.set(1.5, 0.75, 1); b.position.set(i * h * 0.85 - (6 - r) * h * 0.4, h * 0.25 + r * h * 0.4, 0); g.add(b); } return g; },
    stakes(h) { const g = new THREE.Group(), m = phong(0x4a3a2a); for (let i = 0; i < 6; i++) { const s = new THREE.Mesh(new THREE.ConeGeometry(0.16, h * rnd(0.8, 1.2), 5), m); s.position.set(i * 0.9 - 2.2, h / 2, rnd(-0.3, 0.3)); s.rotation.z = rnd(-0.25, 0.25); s.rotation.x = Math.PI; s.position.y = h * 0.5; g.add(s); } return g; },
    sarcophagus(h) { const g = new THREE.Group(), t = stoneTex(0xb8b0a0, "s"), m = new THREE.MeshPhongMaterial({ map: t, shininess: 0, specular: 0 }); const b = new THREE.Mesh(new THREE.BoxGeometry(h * 1.6, h * 0.7, h * 0.8), m); b.position.y = h * 0.35; g.add(b); const l = new THREE.Mesh(new THREE.BoxGeometry(h * 1.7, h * 0.18, h * 0.9), m); l.position.y = h * 0.78; g.add(l); return g; },
    candles(h) { const g = new THREE.Group(); const st = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, h * 1.2, 5), phong(0x2a2420)); st.position.y = h * 0.6; g.add(st); for (let i = 0; i < 3; i++) { const f = sprite(flameTex(), 0xffffff, 0.6, 1, true); f.scale.set(0.3, 0.5, 1); f.position.set((i - 1) * 0.4, h * 1.4 + (i === 1 ? 0.2 : 0), 0); g.add(f); } const l = new THREE.PointLight(0xffc070, 1.1, 12, 2); l.position.y = h * 1.5; g.add(l); g.userData.flick = l; return g; },
    glassPillar(h) { const g = new THREE.Group(), m = new THREE.MeshPhongMaterial({ color: 0x40c8c0, emissive: 0x104848, transparent: true, opacity: 0.55, shininess: 80, flatShading: true }); const p = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.0, h, 8), m); p.position.y = h / 2; g.add(p); const sp = sprite(softTex(), 0x40e8d8, 4, 0.3, true); sp.position.y = h * 0.4; g.add(sp); return g; },
    lily(h) { const g = new THREE.Group(), m = basic(0x2f6a3a, { side: THREE.DoubleSide }); for (let i = 0; i < 6; i++) { const p = new THREE.Mesh(new THREE.CircleGeometry(h * rnd(0.35, 0.6), 8), m); p.rotation.x = -Math.PI / 2; p.position.set(rnd(-2, 2), 0.14, rnd(-1.5, 1.5)); g.add(p); } return g; },
    kelp(h) { const g = new THREE.Group(), m = basic(0x2a6a4a, { side: THREE.DoubleSide, transparent: true, opacity: 0.85 }); for (let i = 0; i < 5; i++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.55, h * rnd(0.7, 1.2), 1, 6), m); p.position.set(rnd(-1, 1), h * 0.5, rnd(-0.5, 0.5)); g.add(p); } g.userData.cloth = g.children[0]; g.userData.sway = true; return g; },
    blocks(h) { const g = new THREE.Group(), t = stoneTex(0xb09878, "b"), m = new THREE.MeshPhongMaterial({ map: t, shininess: 0, specular: 0 }); for (let i = 0; i < 4; i++) { const s = h * rnd(0.6, 1.0), b = new THREE.Mesh(new THREE.BoxGeometry(s * 1.3, s, s), m); b.position.set(i * h * 0.9 - h, s / 2 + (i === 3 ? h * 0.8 : 0), (i % 2) * 0.6 * h); b.rotation.y = rnd(-0.4, 0.4); g.add(b); } return g; },
    scaffold(h) { const g = new THREE.Group(), t = woodTex(0x7a5a38), m = new THREE.MeshPhongMaterial({ map: t, shininess: 0, specular: 0 }); for (const x of [-2.5, 2.5]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.4, h, 0.4), m); p.position.set(x, h / 2, 0); g.add(p); } for (let y = 3; y < h; y += 3.2) { const b = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.3, 0.5), m); b.position.set(0, y, 0); g.add(b); } return g; },
    collarAltar(h) {
      const g = new THREE.Group(), t = stoneTex(0x5a4a44, "a"), m = new THREE.MeshPhongMaterial({ map: t, shininess: 0, specular: 0, flatShading: true });
      for (let i = 0; i < 3; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(5 - i * 1.3, 0.6, 3.6 - i * 0.9), m); s.position.y = 0.3 + i * 0.6; g.add(s); }
      const col = new THREE.Mesh(new THREE.BoxGeometry(1.2, h * 0.5, 1.2), m); col.position.y = 1.8 + h * 0.25; g.add(col);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.16, 8, 24), new THREE.MeshBasicMaterial({ color: 0xffa040 })); ring.position.y = 2.2 + h * 0.5; ring.rotation.x = 0.3; g.add(ring); g.userData.ring = ring;
      const sp = sprite(softTex(), 0xff8a30, 6, 0.6, true); sp.position.y = 2.2 + h * 0.5; g.add(sp); const l = new THREE.PointLight(0xff8a30, 1.8, 18, 2); l.position.y = 2.4 + h * 0.5; g.add(l); g.userData.flick = l; return g;
    },
    ropes(h) { const g = new THREE.Group(), m = basic(0x4a3a24); for (let i = 0; i < 3; i++) { const pts = []; for (let k = 0; k <= 8; k++) pts.push(new THREE.Vector3(-18 + k * 4.5, 8.5 - Math.sin(k / 8 * Math.PI) * 1.8 - i * 0.7, -i * 0.7)); g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.05, 4, false), m)); } return g; },
  };
  B.glassPillar2 = B.glassPillar;

  function cutProp(spec, p, env) {
    const [, id, x, z, h, o = {}] = p, info = cutManifest && cutManifest[id], tex = texCache[BASE + "props/" + id + ".png"]; if (!info || !tex || !tex.then === undefined) return null;
    return null;   // resolved asynchronously in build (textures are plain objects once loaded)
  }

  function addProp(env, spec, p, ctl) {
    const [type, x, z, h, o0] = p, o = o0 || {};
    let obj = null;
    if (type === "cut") return addCut(env, spec, p, ctl);
    const fn = B[type]; if (!fn) return;
    seedFor(type, x, z); obj = fn(h, o, env, spec); if (!obj) return;
    // pale props (white pillars, gold columns) blow out under bright moods: scale every lit material by the mood's irradiance (once per material)
    const pg = Math.max(0.42, Math.min(1, 0.9 / irradiance(spec))), seen = new Set();
    obj.traverse(m => { const mt = m.material; if (mt && mt.isMeshPhongMaterial && !seen.has(mt) && type !== "crystal" && type !== "prismShard") { seen.add(mt); mt.color.multiplyScalar(pg); } });
    if (!obj.userData.absolute) obj.position.set(x, o.y || 0, z);
    if (o.rot !== undefined) obj.rotation.y = o.rot; else if (x !== 0 && type !== "stalac") obj.rotation.y = rr() * 6;
    if (type === "mast" || type === "banner" || type === "wall" || type === "bars" || type === "chains" || type === "pipe" || type === "rail" || type === "hedge" || type === "sandbags" || type === "stakes" || type === "timber" || type === "tower" || type === "scaffold" || type === "boneArch" || type === "ropes" || type === "blocks" || type === "kelp" || type === "collarAltar" || type === "sarcophagus" || type === "stalag" || type === "stalac" || type === "ferns" || type === "reeds" || type === "lily" || type === "roots" || type === "branch") obj.rotation.y = o.rot !== undefined ? o.rot : (type === "wall" || type === "bars" ? Math.atan2(-x, 14) * 0.5 : 0);
    if (o.s && type !== "rocks") obj.scale.multiplyScalar(o.s);
    env.world.add(obj); ctl.props.push(obj);
    if (obj.userData.flick) ctl.flick.push({ l: obj.userData.flick, base: obj.userData.flick.intensity, amp: obj.userData.flick.intensity * 0.22, ph: x });
    if (obj.userData.flame) ctl.flames.push(obj.userData.flame);
    if (obj.userData.cloth) ctl.cloths.push({ m: obj.userData.cloth, sway: obj.userData.sway });
    if (obj.userData.ring) ctl.rings.push(obj.userData.ring);
    if (obj.userData.bob) ctl.bobs.push({ o: obj, h: obj.userData.bob, ph: x });
  }
  const seedFor = (t, x, z) => rs(Math.abs(Math.floor(x * 31 + z * 17 + t.length * 101)) % 2147483 + 7);
  function addCut(env, spec, p, ctl) {
    const [, id, x, z, h, o = {}] = p, info = cutManifest && cutManifest[id], tex = ctl.cutTex[id]; if (!info || !tex) return;
    const w = h * info.w / info.h, mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, color: o.tint || spec.ctint || 0xe8e8e8 });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, h / 2 + (o.y || 0), z); if (o.flip) m.scale.x = -1;
    env.world.add(m); ctl.props.push(m);
  }

  // ---------- water / shafts / mist ----------
  function buildWater(env, spec, ctl) {
    const w = spec.water; if (!w) return;
    const t = rippleTex().clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(34, 34);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshBasicMaterial({ color: w.c, map: t, transparent: true, opacity: w.a === undefined ? 0.5 : w.a, depthWrite: false, fog: true }));
    m.rotation.x = -Math.PI / 2; m.position.y = w.y || 0.05; m.renderOrder = 0; env.world.add(m); ctl.water = { m, t, s: w.s === undefined ? 0.05 : w.s, base: w.a === undefined ? 0.5 : w.a, y: w.y || 0.05 };
  }
  function buildFlood(env, ctl) {
    if (ctl.flooded) return; const t = rippleTex().clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(30, 30);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshBasicMaterial({ color: 0x4a9ac0, map: t, transparent: true, opacity: 0, depthWrite: false, fog: true })); m.rotation.x = -Math.PI / 2; m.position.y = 0.12; env.world.add(m); ctl.flooded = { m, t, k: 0, target: 0 };
  }
  function buildShafts(env, spec, ctl, color) {
    for (let i = 0; i < (spec.shafts || 0); i++) {
      const w = rnd(2.4, 4.2), h = rnd(12, 16), m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: shaftTex(), color: color || 0xfff0c0, transparent: true, opacity: 0.32, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, side: THREE.DoubleSide }));
      m.position.set(-12 + i * (24 / Math.max(1, spec.shafts - 1 || 1)) + rnd(-2, 2), h / 2 - 0.3, -rnd(7, 15)); m.rotation.z = rnd(0.12, 0.3) * (i % 2 ? -1 : 1); m.rotation.y = rnd(-0.3, 0.3); env.world.add(m); ctl.shafts.push({ m, ph: rnd(0, 6), base: m.material.opacity });
    }
  }
  function buildMist(env, spec, ctl, color) {
    for (let i = 0; i < (spec.mist || 0); i++) {
      const s = sprite(softTex(), color || 0xe8eef0, rnd(10, 17), rnd(0.09, 0.17), false); s.position.set(rnd(-20, 20), rnd(0.8, 2.6), -rnd(3, 13)); env.world.add(s); ctl.mists.push({ s, v: rnd(0.1, 0.35) * (Math.random() < 0.5 ? -1 : 1) });
    }
  }

  // ---------- floor brightness ----------
  const lumOf = h => { const c = hexToRgb(h); return 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]; };
  const FLOOR_TARGET = { day: 0.42, gold: 0.40, dusk: 0.34, green: 0.30, cold: 0.34, storm: 0.30, fire: 0.30, cave: 0.27, deep: 0.27, dark: 0.22, night: 0.24 };
  function irradiance(spec) { const m = MOODS[spec.mood] || MOODS.dusk, h = spec.hemi || m.hemi, s = spec.sun || m.sun, a = spec.amb !== undefined ? spec.amb : m.amb; return a + h[2] * lumOf(h[0]) + s[1] * lumOf(s[0]) * 0.74; }
  function floorGain(spec, L) { const fl = L && L.favg ? lumOf(strHex(L.favg)) : 0.45, t = (spec.fbright !== undefined ? spec.fbright : FLOOR_TARGET[spec.mood] || 0.32); return Math.max(0.3, Math.min(2.2, t / (Math.max(0.1, fl) * irradiance(spec)))); }

  // ---------- build ----------
  async function build(env) {
    THREE = env.THREE || root.THREE;
    const key = env.key, art = await prepare(key, THREE, env.renderer), spec = art.spec, L = looksJson && looksJson[spec.look] || {};
    const ctl = { spec, key: spec.key, env, props: [], flick: [], flames: [], cloths: [], rings: [], bobs: [], shafts: [], mists: [], weather: [], water: null, flooded: null, cutTex: {}, flash: 0, dark: 0, darkT: 0, lightningT: rnd(2, 6), bolt: null, t: 0 };
    (spec.props || []).filter(p => p[0] === "cut").forEach(p => { ctl.cutTex[p[1]] = texCache[BASE + "props/" + p[1] + ".png"] && texCache[BASE + "props/" + p[1] + ".png"].__t; });
    const bd = buildBackdrop(env, spec, art, L); ctl.bd = bd;
    env.scene.background = new THREE.Color(bd.fogC); env.scene.fog = new THREE.Fog(bd.fogC, spec.fogNear, spec.fogFar);
    // floor
    // new floors: one big mirrored tile (odd count, so the middle of the fight sits in the middle of a tile); the colour gain sets the brightness the mood asks for (all floors are normalised to the same albedo by build.js)
    const legacy = !!(spec.files && spec.files.floor), ft = art.floor; if (ft) ft.repeat.set(legacy ? 16 : 9, legacy ? 16 : 9);
    const fcol = new THREE.Color(spec.ftint === undefined ? 0xffffff : spec.ftint).multiplyScalar(legacy ? 1 : floorGain(spec, (looksJson && looksJson[spec.floor || spec.look]) || {}));
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(legacy ? 140 : 200, legacy ? 140 : 200), new THREE.MeshPhongMaterial({ map: ft || null, color: fcol, shininess: 0, specular: 0x000000 }));
    floor.rotation.x = -Math.PI / 2; env.world.add(floor); ctl.floor = floor;
    ctl.lights = buildLights(env, spec);
    (spec.weather || []).forEach(w => { const wx = buildWeather(env, w); if (wx) ctl.weather.push(wx); });
    buildWater(env, spec, ctl); buildShafts(env, spec, ctl, spec.shaftC); buildMist(env, spec, ctl, spec.mistC);
    (spec.props || []).forEach(p => addProp(env, spec, p, ctl));
    ctl.update = (dt, t) => update(ctl, dt, t);
    ctl.flood = on => { buildFlood(env, ctl); ctl.flooded.target = on ? 1 : 0; };
    ctl.sky = k => { ctl.darkT = Math.max(0, Math.min(1, k)); };
    ctl.flashNow = (hex, k) => { ctl.flash = k === undefined ? 1 : k; ctl.flashColor = hex; };
    ctl.dispose = () => { ctl.weather.forEach(w => w.dispose && w.dispose()); };
    return ctl;
  }

  function update(ctl, dt, t) {
    ctl.t = t; const sp = ctl.spec, L = ctl.lights;
    ctl.flick.forEach(f => { if (f.l) f.l.intensity = Math.max(0, f.base + Math.sin(t * 9 + f.ph) * f.amp + (f.amp ? Math.random() * f.amp * 0.4 : 0)); if (f.f) { f.f.scale.y = 1.4 + Math.sin(t * 14 + (f.f.position.x * 3)) * 0.18; f.f.scale.x = 0.9 + Math.sin(t * 11) * 0.08; } });
    ctl.flames.forEach((f, i) => { const k = 1 + Math.sin(t * 13 + i * 2) * 0.12; f.scale.y = Math.abs(f.scale.x) * 1.6 * k; });
    ctl.cloths.forEach((c, ci) => { const p = c.m.geometry.attributes.position; if (!c.m.userData.base) c.m.userData.base = p.array.slice(); const b = c.m.userData.base; for (let i = 0; i < p.count; i++) { const x = b[i * 3], y = b[i * 3 + 1]; p.array[i * 3 + 2] = Math.sin(t * 2.4 + x * 1.3 + y * 0.9 + ci) * (c.sway ? 0.25 : 0.32) * (c.sway ? 1 : Math.min(1, (x + 1.8) / 3.4)); if (c.sway) p.array[i * 3] = b[i * 3] + Math.sin(t * 1.3 + y * 0.8 + ci) * 0.25; } p.needsUpdate = true; });
    ctl.rings.forEach(r => { r.rotation.z = t * 0.6; r.material.color.setHex(0xff9030).multiplyScalar(0.8 + Math.sin(t * 5) * 0.2); });
    ctl.bobs.forEach(b => { b.o.position.y = Math.sin(t * 0.8 + b.ph) * 0.35 + 0.3; });
    ctl.weather.forEach(w => w.update(dt, t));
    ctl.mists.forEach(m => { m.s.position.x += m.v * dt; if (m.s.position.x > 24) m.s.position.x = -24; else if (m.s.position.x < -24) m.s.position.x = 24; });
    ctl.shafts.forEach(s => { s.m.material.opacity = s.base * (0.75 + Math.sin(t * 0.6 + s.ph) * 0.25); });
    if (ctl.water) { ctl.water.t.offset.x += dt * ctl.water.s; ctl.water.t.offset.y += dt * ctl.water.s * 0.4; }
    if (ctl.flooded) { const f = ctl.flooded; f.k += (f.target - f.k) * Math.min(1, dt * 1.6); f.m.material.opacity = f.k * 0.62; f.m.position.y = 0.12 + f.k * 0.1; f.t.offset.x += dt * 0.08; f.t.offset.y += dt * 0.03; }
    // sky darkening (Sun Eater phases) and flashes (lightning, boss phase changes)
    ctl.dark += (ctl.darkT - ctl.dark) * Math.min(1, dt * 1.2);
    if (sp.lightning || ctl.stormOn) { ctl.lightningT -= dt; if (ctl.lightningT < 0) { ctl.lightningT = rnd(4, 11); ctl.flash = 1; ctl.flashColor = 0xbcd0ff; bolt(ctl); ctl.sfx && ctl.sfx("shock"); } }
    ctl.flash = Math.max(0, ctl.flash - dt * 3.2);
    const d = 1 - ctl.dark * 0.78, fl = ctl.flash;
    L.amb.intensity = L.base.amb * d + fl * 1.6; L.hemi.intensity = L.base.hemi * d + fl * 1.2; L.sun.intensity = L.base.sun * d + fl * 1.2;
    const pm = ctl.bd.pm, pc = (sp.ptint === undefined ? 0xffffff : sp.ptint), k = d * (sp.pb || 1) + fl * 0.9; pm.color.setHex(pc).multiplyScalar(Math.min(2.2, k));
    if (ctl.bolt) { ctl.bolt.life -= dt; ctl.bolt.mesh.material.opacity = Math.max(0, ctl.bolt.life * 5); if (ctl.bolt.life <= 0) { env_remove(ctl, ctl.bolt.mesh); ctl.bolt = null; } }
  }
  const env_remove = (ctl, m) => { ctl.env.world.remove(m); m.geometry.dispose(); };
  function bolt(ctl) {
    if (ctl.bolt) env_remove(ctl, ctl.bolt.mesh);
    const x0 = rnd(-14, 6), z = -rnd(15, 19), pts = []; let x = x0, y = 17;
    while (y > 0.5) { pts.push([x, y]); y -= rnd(1.2, 2.4); x += rnd(-1.4, 1.4); }
    const pos = [], idx = []; pts.forEach(([px, py], i) => { pos.push(px - 0.13, py, z, px + 0.13, py, z); if (i < pts.length - 1) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } });
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0xe0ecff, transparent: true, opacity: 1, side: THREE.DoubleSide, fog: false, depthWrite: false, blending: THREE.AdditiveBlending })); ctl.env.world.add(m); ctl.bolt = { mesh: m, life: 0.22 };
  }

  const keys = () => Object.keys(SPECS).concat(Object.keys(ALIAS));
  // the settings of an arena key for other scenes (Cinema.boss builds its reveal from this): { key, floorUrl, panoUrl, fog, fogNear, fogFar, sun, sunI, amb, hemi, torches, torch, dust, tint, rocks, ground, aspect, mood }
  function arenaDef(key) {
    const spec = specOf(key), mood = MOODS[spec.mood] || MOODS.dusk, files = spec.files || {}, lk = spec.look, L = (looksJson && looksJson[lk]) || {};
    const s = spec.sun || mood.sun, h = spec.hemi || mood.hemi, w0 = (spec.weather || [])[0] || {};
    return { key: spec.key, asked: key, mood: spec.mood, floorUrl: files.floor || BASE + (spec.floor || lk) + "_floor.jpg", panoUrl: files.pano || BASE + (spec.pano || lk) + "_pano.jpg",
      fog: spec.fog !== undefined ? spec.fog : L.mid ? mix(strHex(L.mid), 0x000000, 0.45) : 0x201410, fogNear: spec.fogNear, fogFar: spec.fogFar, sun: s[0], sunI: s[1], amb: spec.amb !== undefined ? spec.amb : mood.amb, hemi: h[2],
      torches: !!spec.torches, torch: spec.torch, dust: w0.c, tint: spec.ptint, rocks: (spec.props || []).some(p => p[0] === "rocks"), ground: spec.ground, aspect: L.aspect };
  }
  root.ArenaSets = { resolve, specOf, def: arenaDef, prepare, build, keys, SPECS, ALIAS, MOODS, overrides, props: B, loadLooks, R_WALL, _tex: texCache };
})(window);
