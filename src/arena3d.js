// 3D battle screen for Davichi's Revenge (owner A): models in a Three.js arena, fixed camera, your own commands.  Rules come from core.js; this file only shows the fight and asks the player what to do.
//
// ===== SIGNATURE (owner E calls this) ===================================================================================================
//   const out = await Arena3D.fight({
//     party,            // array of Core.makeCreature(...) units (1-3); HP/MP/xp persist on the objects, so the caller keeps them between fights
//     foes,             // array of Core.makeEnemy(...) units, 1-3 (use Core.rollEncounter(tableId) or Core.makeFoes([ids], level) or Core.karvanFight(5))
//     bg,               // arena look: "desert" | "ruins" | "temple" | "dunes" | "cistern" | "quarry" | "flats" | "undercroft" | "boneMaze" | "hollow" | "basin" (unknown -> desert)
//     boss,             // true for a boss fight: no Run, boss intro text and warnings
//     items,            // { potion: n, antidote: n, ashenEmber: n } counts the player owns  (legacy: potions: n  ==  items: { potion: n })
//     speedF,           // optional () => animation time factor (1 = normal, 0.5 = twice as fast, 0.02 = instant)
//     auto,             // true = the AI plays the player's side (tests / "Auto" for a whole fight)
//     intro,            // optional first log line (default: the boss intro / "X attacks!")
//   }) -> { res: "win" | "lose" | "flee",
//           potions,    // potions left (backwards compatible)
//           items,      // all item counts left, same shape as the input
//           rewards,    // only on "win": { xp, kakal, gold, drops: { materialId: count } }  -- NOT applied: the caller calls Core.giveXp(party, rewards.xp) and adds kakal/drops
//           rounds }    // rounds fought
//   The party units are changed in place (hp, mp, alive). Fallen creatures stay fallen; the caller decides what a defeat means.
//   Other exports: Arena3D.init(), Arena3D.snap(w), Arena3D.ctx (the live battle context), Arena3D.manifest() (the loaded model manifest).
// Audio hooks: window.Audio.sfx(key) with keys hit, hitHeavy, crit, spell, fire, water, ice, shock, poison, heal, buff, debuff, break, ko, levelUp, telegraph.  A missing Audio object never breaks anything.
// Models: assets/models/manifest.json { id: { file, yaw, scale, kind } } (owner B). Fallback chain per id: manifest file -> built-in SRC table -> models/<id>.glb / <id>_static.glb -> billboard of assets/creatures/<id>.png or assets/<id>.png -> grey box.
// ==========================================================================================================================================
(function (root) {
  "use strict";
  const ARENAS = {
    desert: { floor: "floor_sand", pano: "pano_desert", fog: 0x2a1610, fogNear: 22, fogFar: 70, sun: 0xffb070, sunI: 0.9, amb: 0.75, hemi: 0.9, torches: false, props: true, dust: 0xffe0b0 },
    temple: { floor: "floor_stone", pano: "pano_temple", fog: 0x0c0907, fogNear: 14, fogFar: 48, sun: 0x8a7a6a, sunI: 0.35, amb: 0.45, hemi: 0.6, torches: true, props: false, dust: 0xffa060 },
    cistern: { floor: "floor_stone", pano: "pano_temple", fog: 0x0a1418, fogNear: 12, fogFar: 42, sun: 0x6a8a9a, sunI: 0.4, amb: 0.5, hemi: 0.65, torches: true, props: false, dust: 0x9fd8ff, torch: 0x4aa8d8, tint: 0x9ec8d8 },
    undercroft: { floor: "floor_stone", pano: "pano_temple", fog: 0x0e100a, fogNear: 12, fogFar: 40, sun: 0x8a8a6a, sunI: 0.3, amb: 0.5, hemi: 0.6, torches: true, props: false, dust: 0xc8d8a0, torch: 0xffc060 },
    quarry: { floor: "floor_sand", pano: "pano_desert", fog: 0x2e1a12, fogNear: 20, fogFar: 62, sun: 0xff9a5a, sunI: 1.0, amb: 0.7, hemi: 0.8, torches: false, props: true, dust: 0xe0a070 },
    flats: { floor: "floor_sand", pano: "pano_desert", fog: 0x2a0e08, fogNear: 16, fogFar: 54, sun: 0xff6a3a, sunI: 1.1, amb: 0.6, hemi: 0.7, torches: true, props: true, dust: 0xff8a40, torch: 0xff5a20 },
    boneMaze: { floor: "floor_stone", pano: "pano_temple", fog: 0x14110c, fogNear: 12, fogFar: 40, sun: 0xb0a890, sunI: 0.35, amb: 0.5, hemi: 0.6, torches: true, props: false, dust: 0xe8e0c8 },
  };
  const BG_ALIAS = { ruins: "temple", dunes: "desert", basin: "desert", hollow: "temple" };
  const MODEL_YAW = -Math.PI / 2;                   // models face +x
  // built-in model sources (used when the manifest has nothing for the id): [file under assets/models, extra turn so the model faces its opponent]
  const SRC = { horncinder: ["trellis/horncinder.glb", 0], shellmund: ["trellis/shellmund.glb", Math.PI], kitsuneva: ["trellis/kitsuneva.glb", Math.PI / 4],
    scorpion: ["trellis/scorpion.glb", Math.PI / 2], jackal: ["trellis/jackal.glb", Math.PI / 2], legion: ["trellis/legion.glb", 1.27], duneBearer: ["duneBearer.glb", 0], knight: ["dreadKnight.glb", 0] };   // the hero (dread knight, 2026-10-30)
  const RIGGED = new Set(["duneBearer", "knight"]);
  const KIND_H = { creature: 2.9, enemy: 2.6, boss: 5.6, human: 2.9 };
  const HEIGHT = { knight: 2.3, duneBearer: 6.2, scorpion: 2.0, jackal: 2.1, legion: 2.9, raidOptioKarvan: 3.4 };
  const PROPS = ["propPillar", "propHead", "propRuin"];
  const DESERT_PROPS = [["propPillar", -9, -6, 7, 0.3], ["propPillar", 8.5, -7.5, 6, 2.1], ["propPillar", -14, 3, 5, 1.2], ["propHead", 3.5, -9.5, 3.4, -0.5], ["propRuin", -3, -15, 7, 0.2], ["propRuin", 15, -3, 4.5, -1.1], ["propHead", -12, -12, 2.6, 2.5]];
  const CHIP = { burn: ["\u{1F525}", "#ff8a3a", "Burn"], bleed: ["\u{1FA78}", "#e04a4a", "Bleed"], poison: ["☠", "#9be06a", "Poison"], shock: ["⚡", "#ffe45c", "Shock"], chill: ["❄", "#9fd8ff", "Chill"],
    freeze: ["\u{1F9CA}", "#7fe3ff", "Freeze"], wet: ["\u{1F4A7}", "#6fb7ff", "Wet"], slow: ["\u{1F40C}", "#c9b28a", "Slow"], stun: ["\u{1F4AB}", "#ffd23f", "Stun"], steam: ["♨", "#d6d6d6", "Steam"], petrify: ["\u{1F5FF}", "#b0a090", "Petrify"] };
  const STAT_LABEL = { atk: "ATK", def: "DEF", pow: "POW", res: "RES", spd: "SPD", foc: "FOC", lck: "LCK", dr: "GUARD", shield: "SHIELD", taunt: "TAUNT", hot: "REGEN", sres: "STATUS-RES", vuln: "EXPOSED", wrathStore: "WRATH", swell: "SWELL",
    counter: "COUNTER", cover: "COVERED", hounds: "HOUNDS", decoy: "DECOY", antlers: "ANTLERS", dust: "DUST", braceDeep: "BRACE", tithe: "TITHE", redHot: "RED-HOT", stunImmune: "UNSTUNNABLE", mp: "MP", endure: "ENDURE" };
  const GROUPS = [["damage", "Attacks"], ["support", "Support"], ["control", "Control"], ["personal", "Personal"], ["skill", "Skill book (off-style slot)"]];

  let ready = null, renderer, scene, camera, world, dust, torchLights = [], units = [], ctx = null, active = false, speedF = () => 1, shake = 0, introT = 0, marker = null, manifest = {}, manifestTried = false;
  const tex = {}, assets = {}, el = {}; let arenaCtl = null;   // arenaCtl: the controller of the arena built by src/arena-sets.js (ARENA agent)
  const camP = { y: 4.6, z: 14.5, ly: 1.9, k: 1, base: 42, id: "std" };   // camera framing of this fight; src/arena-layout.js picks a wider preset for huge bosses
  const $ = s => el.root.querySelector(s);
  const FX = () => root.FX3D || null;   // battle effects (src/fx3d.js); the fight works without them
  const sfx = k => { try { const A = root.Audio; if (A && typeof A.sfx === "function") A.sfx(k); } catch (e) { /* audio must never break a fight */ } };

  // ---------- one-time setup: DOM overlay, renderer ----------
  function init() {
    if (ready) return ready;
    const css = document.createElement("style");
    css.textContent = `
      #a3 { position: fixed; inset: 0; z-index: 50; display: none; font-family: "Marcellus", Georgia, serif; color: #f4e9d4; background: #0d0907; }
      #a3 canvas { display: block; }
      #a3 .hud { position: absolute; pointer-events: none; text-shadow: 0 2px 0 #000, 0 0 6px #000; }
      #a3 .log { top: 14px; left: 50%; transform: translateX(-50%); font-size: 22px; white-space: nowrap; max-width: 96vw; overflow: hidden; text-overflow: ellipsis; }
      #a3 .warn { top: 46px; left: 50%; transform: translateX(-50%); font-size: 18px; color: #ff6b57; white-space: nowrap; }
      #a3 .foes { top: 16px; left: 16px; width: 300px; }
      #a3 .foe { margin-bottom: 8px; font-size: 16px; } #a3 .foe.down { opacity: .35; }
      #a3 .bar { height: 10px; background: rgba(0,0,0,.6); border: 1px solid #000; margin-top: 3px; } #a3 .bar i { display: block; height: 100%; transition: width .25s; }
      #a3 .tags { display: flex; flex-wrap: wrap; gap: 3px 8px; margin-top: 3px; font-size: 12px; line-height: 1.2; } #a3 .tags .w { color: #ffb26a; } #a3 .tags .r { color: #aab4c0; } #a3 .tags .b { color: #e8d28a; }
      #a3 .brk { font-size: 14px; color: #b7a58a; margin-top: 3px; } #a3 .brk.on { color: #f2c14e; }
      #a3 .chips { display: flex; flex-wrap: wrap; gap: 3px; margin-top: 3px; min-height: 2px; }
      #a3 .chips span { font-size: 12px; line-height: 1; padding: 2px 4px; background: rgba(0,0,0,.55); border: 1px solid #000; border-radius: 3px; white-space: nowrap; }
      #a3 .chips span em { font-style: normal; font-size: 10px; color: #b7a58a; margin-left: 2px; }
      #a3 .party { right: 16px; bottom: 16px; width: 350px; background: rgba(24,17,13,.9); border: 2px solid #6b5236; padding: 10px 12px; }
      #a3 .pm { margin-bottom: 8px; } #a3 .pm:last-child { margin-bottom: 0; } #a3 .pm.on .nm { color: #f2c14e; } #a3 .pm.down { opacity: .45; }
      #a3 .row { display: flex; justify-content: space-between; font-size: 17px; }
      #a3 .mp { display: flex; gap: 3px; margin-top: 3px; } #a3 .mp b { width: 10px; height: 5px; background: #2a3440; } #a3 .mp b.on { background: #6fb7ff; }
      #a3 .tide { display: flex; gap: 3px; margin-top: 2px; align-items: center; font-size: 11px; color: #4ad0c8; } #a3 .tide b { width: 14px; height: 5px; background: #1c3a3a; } #a3 .tide b.on { background: #4ad0c8; box-shadow: 0 0 4px #4ad0c8; }
      #a3 .cmd { position: absolute; left: 16px; bottom: 16px; width: 440px; max-width: calc(100vw - 32px); max-height: calc(100vh - 120px); overflow-y: auto; background: rgba(24,17,13,.94); border: 2px solid #6b5236; padding: 8px 12px 10px; }
      #a3 .cmd[hidden] { display: none; }
      #a3 .cmd h4 { margin: 2px 0 6px; font-size: 15px; font-weight: 400; color: #b7a58a; }
      #a3 .cmd button { display: block; width: 100%; text-align: left; font: inherit; font-size: 19px; color: #f4e9d4; background: none; border: 0; padding: 3px 4px; cursor: pointer; }
      #a3 .cmd button.sel { color: #f2c14e; } #a3 .cmd button.sel::before { content: "> "; } #a3 .cmd button:disabled { color: #6d5f4f; cursor: default; }
      #a3 .cmd .hd { font-size: 13px; letter-spacing: .08em; text-transform: uppercase; color: #8f7a5c; margin: 6px 0 1px; border-bottom: 1px solid #3a2c1f; }
      #a3 .cmd p { margin: 6px 0 0; font-size: 14px; color: #b7a58a; min-height: 2.4em; }
      #a3 .num { position: absolute; font-size: 26px; pointer-events: none; text-shadow: 0 2px 0 #000, 0 0 6px #000; transition: transform .9s ease-out, opacity .9s ease-in; white-space: nowrap; }
      #a3 .dmg { position: absolute; pointer-events: none; font-size: 40px; font-weight: 700; transform: translate(-50%, -50%); -webkit-text-stroke: 2px #1a0d06; text-shadow: 0 3px 0 #000, 0 0 10px rgba(0,0,0,.8); animation: a3pop 1.5s ease-out forwards; white-space: nowrap; }
      #a3 .dmg.dot { font-size: 24px; } #a3 .dmg small { display: block; font-size: 16px; -webkit-text-stroke: 1px #1a0d06; text-align: center; }
      #a3 .react { position: absolute; left: 50%; top: 30%; transform: translate(-50%, -50%); font-size: 54px; font-weight: 700; letter-spacing: .06em; pointer-events: none; -webkit-text-stroke: 2px #1a0d06; text-shadow: 0 4px 0 #000, 0 0 18px currentColor; animation: a3react 1.6s ease-out forwards; white-space: nowrap; }
      @keyframes a3pop { 0% { transform: translate(-50%, -30%) scale(.4); opacity: 0; } 12% { transform: translate(-50%, -60%) scale(1.25); opacity: 1; } 25% { transform: translate(-50%, -70%) scale(1); } 75% { opacity: 1; } 100% { transform: translate(-50%, -140%) scale(1); opacity: 0; } }
      @keyframes a3react { 0% { transform: translate(-50%, -50%) scale(.5); opacity: 0; } 15% { transform: translate(-50%, -50%) scale(1.15); opacity: 1; } 70% { opacity: 1; } 100% { transform: translate(-50%, -70%) scale(1); opacity: 0; } }
      @media (max-width: 760px) { #a3 .party { width: 46vw; font-size: 14px; } #a3 .cmd { width: 48vw; } #a3 .log { font-size: 16px; } #a3 .foes { width: 40vw; } }`;
    document.head.appendChild(css);
    el.root = document.createElement("div"); el.root.id = "a3";
    el.root.innerHTML = `<div class="hud log"></div><div class="hud warn"></div><div class="hud foes"></div><div class="hud party"></div><div class="cmd" hidden><h4></h4><div class="opts"></div><p></p></div>`;
    document.body.appendChild(el.root);
    renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
    el.root.prepend(renderer.domElement);
    scene = new THREE.Scene(); camera = new THREE.PerspectiveCamera(42, 16 / 9, 0.1, 200);
    world = new THREE.Group(); scene.add(world); if (FX()) FX().init(scene);
    marker = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.7, 4), new THREE.MeshBasicMaterial({ color: 0xf2c14e })); marker.rotation.x = Math.PI; marker.visible = false; scene.add(marker);
    addEventListener("resize", resize);
    ready = Promise.all(["floor_sand", "floor_stone", "pano_desert", "pano_temple"].map(k => loadTex("assets/" + k + ".png", true).then(t => { tex[k] = t; })).concat(PROPS.map(k => ensureAsset(k)), [loadManifest()]));
    requestAnimationFrame(frame);
    return ready;
  }
  function resize() {
    if (!renderer) return;
    renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight;
    const hHalf = Math.atan(Math.tan(THREE.MathUtils.degToRad(21)) * 16 / 9);   // same sideways view on tall screens
    camP.base = Math.min(95, Math.max(42, THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(hHalf) / camera.aspect)))); camera.fov = Math.min(110, camP.base * camP.k);
    camera.updateProjectionMatrix();
  }

  // ---------- assets: manifest, models, billboards ----------
  const loadGLB = url => new Promise(res => { try { new THREE.GLTFLoader().load(url, g => res(g), undefined, () => res(null)); } catch (e) { res(null); } });
  const loadTex = (url, repeat) => new Promise(res => new THREE.TextureLoader().load(url, t => { t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; res(t); }, undefined, () => res(null)));
  async function loadManifest() {
    manifestTried = true;
    try { const r = await fetch("assets/models/manifest.json", { cache: "no-cache" }); if (r.ok) manifest = (await r.json()) || {}; } catch (e) { /* no manifest yet: fall back to SRC / billboards */ }
  }
  const manifestFile = f => (f.startsWith("assets/") ? f : f.startsWith("models/") ? "assets/" + f : "assets/models/" + f);
  async function ensureAsset(id) {
    if (assets[id]) return assets[id];
    const man = manifest[id], tries = [];
    if (man && man.file) tries.push([manifestFile(man.file), man.yaw || 0]);
    if (SRC[id]) tries.push(["assets/models/" + SRC[id][0], man && man.yaw !== undefined ? man.yaw : SRC[id][1]]);
    if (!man || !man.file) { tries.push(["assets/models/" + id + ".glb", 0]); tries.push(["assets/models/" + id + "_static.glb", 0]); }
    for (const [url, yaw] of tries) {
      const g = await loadGLB(url);
      if (g) return (assets[id] = { kind: "model", gltf: g, yaw, scale: (man && man.scale) || 1, mkind: man && man.kind });
    }
    for (const url of ["assets/creatures/" + id + ".png", "assets/" + id + ".png"]) {
      const t = await loadTex(url);
      if (t) return (assets[id] = { kind: "sprite", tex: t, scale: (man && man.scale) || 1, mkind: man && man.kind });
    }
    return (assets[id] = { kind: "none", scale: 1 });
  }

  // ---------- arena ----------
  function posedBox(root) {
    root.updateMatrixWorld(true);
    const box = new THREE.Box3(), v = new THREE.Vector3();
    root.traverse(o => { if (!o.isMesh) return; const p = o.geometry.attributes.position, step = Math.max(1, Math.floor(p.count / 4000));
      for (let i = 0; i < p.count; i += step) { if (o.isSkinnedMesh) o.boneTransform(i, v); else v.fromBufferAttribute(p, i); box.expandByPoint(v.applyMatrix4(o.matrixWorld)); } });
    return box;
  }
  function fitModel(m, height, sink = 0) {
    let b = posedBox(m); m.scale.multiplyScalar(height / b.getSize(new THREE.Vector3()).y); b = posedBox(m);
    const c = b.getCenter(new THREE.Vector3()); m.position.set(m.position.x - c.x, m.position.y - b.min.y - sink, m.position.z - c.z);
  }
  function matte(m) { m.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); if ("metalness" in o.material) { o.material.metalness = 0; o.material.roughness = 0.9; } } }); }
  function buildArena(key) {
    world.clear(); torchLights = [];
    const A = ARENAS[key] || ARENAS.desert;
    scene.background = new THREE.Color(A.fog); scene.fog = new THREE.Fog(A.fog, A.fogNear, A.fogFar);
    const ft = (tex[A.floor] || new THREE.Texture()).clone(); ft.needsUpdate = true; ft.wrapS = ft.wrapT = THREE.RepeatWrapping; ft.repeat.set(16, 16);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(140, 140), new THREE.MeshLambertMaterial({ map: ft, color: A.tint || 0xffffff })); floor.rotation.x = -Math.PI / 2; world.add(floor);
    const pt = (tex[A.pano] || new THREE.Texture()).clone(); pt.needsUpdate = true; pt.wrapS = THREE.MirroredRepeatWrapping; pt.repeat.set(4, 1);
    const pano = new THREE.Mesh(new THREE.CylinderGeometry(60, 60, 34, 64, 1, true), new THREE.MeshBasicMaterial({ map: pt, side: THREE.BackSide, fog: false, color: A.tint || 0xffffff }));
    pano.position.y = A.floor === "floor_stone" ? 13 : 9; world.add(pano);
    world.add(new THREE.AmbientLight(0xffffff, A.amb), new THREE.HemisphereLight(0xfff0dd, 0x6a4a30, A.hemi));
    const sun = new THREE.DirectionalLight(A.sun, A.sunI); sun.position.set(-10, 14, 8); world.add(sun);
    if (A.torches) [[-9, -7], [9, -7], [-12, 6], [12, 6]].forEach(([x, z]) => {
      const l = new THREE.PointLight(A.torch || 0xff8a3a, 1.6, 22, 2); l.position.set(x, 3.2, z); world.add(l); torchLights.push(l);
      const f = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), new THREE.MeshBasicMaterial({ color: A.torch || 0xffb060 })); f.position.copy(l.position); world.add(f);
    });
    if (A.props) {
      DESERT_PROPS.forEach(([k, x, z, h, r]) => { const a = assets[k]; if (!a || !a.gltf) return; const m = a.gltf.scene.clone(true); matte(m); fitModel(m, h, h * 0.04); const g = new THREE.Group(); g.add(m); g.position.set(x, 0, z); g.rotation.y = r; world.add(g); });
      const rockMat = new THREE.MeshPhongMaterial({ color: 0x9a6a44, flatShading: true, shininess: 0 });
      for (let i = 0; i < 26; i++) {
        const a = i * 2.39, d = 7 + (i * 37 % 11), s = 0.25 + (i * 13 % 7) / 9, x = Math.cos(a) * d, z = Math.sin(a) * d - 2;
        if (z > 6 && Math.abs(x) < 6) continue;
        const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), rockMat); rock.position.set(x, s * 0.35, z); rock.rotation.set(i, i * 2, i * 3); rock.scale.y = 0.6; world.add(rock);
      }
    }
    const n = 260, pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { pos[i * 3] = (Math.random() - 0.5) * 40; pos[i * 3 + 1] = Math.random() * 8; pos[i * 3 + 2] = (Math.random() - 0.5) * 30; }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    dust = new THREE.Points(g, new THREE.PointsMaterial({ color: A.dust || 0xffe0b0, size: 0.07, transparent: true, opacity: 0.7 })); world.add(dust);
  }

  // every arena key of the game (floor, painted backdrop, props, light, weather) comes from src/arena-sets.js; the ARENAS table above is only the fallback
  async function buildArenaSets(key) {
    if (!root.ArenaSets) return false;
    try {
      if (arenaCtl) { arenaCtl.dispose(); arenaCtl = null; }
      world.clear(); torchLights = []; dust = null;
      arenaCtl = await root.ArenaSets.build({ THREE, world, scene, renderer, camera, key }); arenaCtl.sfx = sfx; return true;
    } catch (e) { console.warn("arena sets failed, using the old arena", e); arenaCtl = null; return false; }
  }

  // ---------- fighters ----------
  const shadowTex = () => {
    const c = document.createElement("canvas"); c.width = c.height = 64; const x = c.getContext("2d");
    const gr = x.createRadialGradient(32, 32, 2, 32, 32, 30); gr.addColorStop(0, "rgba(0,0,0,0.6)"); gr.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  };
  let shadowT = null;
  function heightOf(u, key, a) {
    const kind = (a && a.mkind) || (u.coach ? "creature" : u.boss ? "boss" : u.side === "e" ? "enemy" : "creature");
    const h = (HEIGHT[key] || KIND_H[kind] || 2.6) * ((a && a.scale) || 1) * (u.vscale || 1);
    return root.ArenaLayout && root.ArenaLayout.capHeight ? root.ArenaLayout.capHeight(u, h, a) : h;   // sizes stay in a range that always fits a camera framing (nothing tiny, nothing taller than the frame)
  }
  function makeView(u, key, x, z) {
    let a = assets[key] || { kind: "none" }; const h = heightOf(u, key, a);
    const group = new THREE.Group(); group.position.set(x, 0, z); scene.add(group);
    shadowT = shadowT || shadowTex();
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(h * 1.1, h * 0.5), new THREE.MeshBasicMaterial({ map: shadowT, transparent: true, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.02; group.add(shadow);
    const v = u.view = { group, h, home: new THREE.Vector3(x, 0, z), phase: Math.random() * 6, anim: null, alive: u.alive ? 1 : 0, hitT: 0, yawFix: a.yaw || 0 };
    if (a.kind === "none" && root.ArenaBoss && root.ArenaBoss.placeholder) a = { kind: "sprite", tex: root.ArenaBoss.placeholder(u), scale: 1 };   // missing art: a silhouette with its initial, never a grey box
    if (a.kind === "sprite") {
      const asp = a.tex.image ? a.tex.image.width / a.tex.image.height : 1, pivot = new THREE.Group();
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(h * asp, h), new THREE.MeshBasicMaterial({ map: a.tex, transparent: true, alphaTest: 0.05, side: THREE.DoubleSide }));
      mesh.position.y = h / 2; mesh.scale.x = u.side === "e" ? -1 : 1;   // the 2D art faces left; enemies stand on the left and look right
      if (u.vtint) mesh.material.color.setHex(u.vtint);
      pivot.add(mesh); group.add(pivot); v.model = pivot; v.inner = mesh; v.innerY = h / 2; v.billboard = true; return;
    }
    if (a.kind !== "model") { const box = new THREE.Mesh(new THREE.BoxGeometry(1, h, 1), new THREE.MeshLambertMaterial({ color: u.side === "e" ? 0x886655 : 0x556688 })); box.position.y = h / 2; group.add(box); v.model = box; v.inner = box; v.innerY = h / 2; return; }
    const src = a.gltf, m = THREE.SkeletonUtils.clone(src.scene), pivot = new THREE.Group(); matte(m);
    if (src.animations && src.animations.length) {
      const mixer = new THREE.AnimationMixer(m), clips = {};
      src.animations.forEach(c => { const n = c.name.toLowerCase(); ["idle", "walk", "slash", "hurt", "jump"].forEach(k => { if (n.includes(k)) clips[k] = c; }); });
      v.mixer = mixer; v.clips = clips;
      const base = clips.idle || clips.walk; if (base) { const ac = mixer.clipAction(base); ac.play(); if (!clips.idle) ac.timeScale = 0; v.base = ac; }
      mixer.update(0);
    }
    if (u.vtint) m.traverse(o => { if (o.isMesh && o.material && o.material.color) o.material.color.multiply(new THREE.Color(u.vtint)); });
    fitModel(m, h);
    pivot.add(m); group.add(pivot); v.model = pivot; v.inner = m; v.innerY = m.position.y;
  }
  function clearFighters() { units.forEach(u => u.view && scene.remove(u.view.group)); units = []; if (marker) marker.visible = false; }
  function formation(foes) {   // enemies stand back and to the left so the command menu (bottom left) never covers them
    const n = foes.length, boss = foes.find(f => f.boss);
    if (boss && n > 1) { const adds = [[-3.4, -4.8], [-3.4, 0.6], [-4.8, 2.6]]; let k = 0; return foes.map(f => (f === boss ? [-6.2, -1.6] : adds[k++])); }
    if (boss) return [[-5.0, -1.0]];
    if (n === 1) return [[-4.4, -1.5]];
    if (n === 2) return [[-3.6, -4.2], [-6.2, -0.8]];
    return [[-3.0, -5.4], [-5.2, -2.6], [-7.4, 0.2]];
  }

  // ---------- per frame ----------
  const clock = new THREE.Clock(), tmpV = new THREE.Vector3();
  function frame() {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, clock.getDelta()), t = clock.elapsedTime;
    if (!active) return;
    if (FX()) FX().update(dt);
    if (arenaCtl) arenaCtl.update(dt, t);
    if (root.ArenaBoss) root.ArenaBoss.update(dt, t);
    // fixed camera: a slow push-in at the start, then one steady wide shot
    const f = introT > 0 ? (introT = Math.max(0, introT - dt)) / 2.5 : 0;
    camera.position.set(0, camP.y + 1.5 * f, Math.min(20.8, camP.z + 6 * f));
    if (shake > 0) { shake = Math.max(0, shake - dt * 2.5); camera.position.x += (Math.random() - 0.5) * shake; camera.position.y += (Math.random() - 0.5) * shake; }
    camera.lookAt(0, camP.ly, 0);
    units.forEach(u => {
      const v = u.view; if (!v) return; const g = v.group;
      if (v.anim) {
        v.anim.t += dt / v.anim.dur; const k = Math.min(1, v.anim.t), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        g.position.lerpVectors(v.anim.from, v.anim.to, k < 0.5 ? e * 2 : (1 - k) * 2);
        if (k >= 1) { g.position.copy(v.anim.from); v.anim = null; }
      }
      const others = (u.side === "p" ? ctx.foes : ctx.party).filter(x => x.alive && x.view);
      if (others.length && v.model !== v.inner && !v.billboard) {
        const cx = others.reduce((a, x) => a + x.view.home.x, 0) / others.length, cz = others.reduce((a, x) => a + x.view.home.z, 0) / others.length;
        v.model.rotation.y = Math.atan2(cx - g.position.x, (cz - g.position.z) * 0.35) + MODEL_YAW + v.yawFix;   // mostly sideways, a little toward the group
      }
      v.model.scale.set(1, (1 + (v.mixer && v.clips.idle ? 0 : Math.sin(t * 2.2 + v.phase) * 0.02)) * v.alive + (1 - v.alive) * 0.6, 1);
      v.model.rotation.z = (1 - v.alive) * 1.4;
      if (!v.mixer) {
        const k = v.anim ? Math.min(1, v.anim.t) : 0, arc = v.anim ? Math.sin(Math.PI * Math.min(1, k * 2)) : 0;
        v.inner.position.y = v.innerY + arc * v.h * 0.18; if (!v.billboard) v.inner.rotation.z = -arc * 0.25;     // hop and lean into the attack
        v.hitT = Math.max(0, v.hitT - dt * 3); const sq = v.hitT * 0.14;
        v.model.scale.x = v.model.scale.z = 1 + sq * 0.5; v.model.scale.y *= 1 - sq; v.model.rotation.x = Math.sin(t * 40) * sq * 0.6;   // squash when hit
      }
      if (v.mixer) v.mixer.update(dt);
    });
    if (marker && marker.visible && marker.userData.unit && marker.userData.unit.view) { const v = marker.userData.unit.view; marker.position.set(v.group.position.x, v.h + 0.9 + Math.sin(t * 6) * 0.12, v.group.position.z); marker.rotation.y = t * 2; }
    if (dust) { const p = dust.geometry.attributes.position; for (let i = 0; i < p.count; i++) { let y = p.getY(i) + dt * 0.25; if (y > 8) y = 0; p.setY(i, y); } p.needsUpdate = true; }
    if (coachLight) coachLight.intensity = 0.9 + Math.sin(t * 2.6) * 0.5;
    torchLights.forEach((l, i) => (l.intensity = 1.4 + Math.sin(t * 9 + i * 2) * 0.25 + Math.random() * 0.15));
    renderer.render(scene, camera);
  }
  function setMarker(u) { if (!marker) return; marker.userData.unit = u || null; marker.visible = !!(u && u.view); }

  // ---------- HUD ----------
  function chipsFor(u) {
    return Core.statusList(u).map(s => {
      if (s.buff) {
        const label = STAT_LABEL[s.type] || (s.type.startsWith("ward_") ? "WARD" : s.type.toUpperCase());
        const arrow = s.val === undefined ? "" : s.val >= 0 ? "▲" : "▼";
        const bad = s.val !== undefined && s.val < 0;
        return `<span style="color:${bad ? "#ff9a8a" : "#a8e0a0"}" title="${label}">${label}${arrow}${s.turns ? `<em>${s.turns}</em>` : ""}</span>`;
      }
      if (s.type === "tide") return "";
      const c = CHIP[s.type] || ["•", "#ddd", s.name];
      return `<span style="color:${c[1]}" title="${c[2]}">${c[0]}${s.n > 1 ? " " + s.n : ""}<em>${s.turns ? s.turns : ""}</em></span>`;
    }).join("");
  }
  function hud(activeU) {
    const phaseNote = e => (e.phases && (e.phases.length || e.phaseNo > 1) ? ` · phase ${e.phaseNo}/${e.phaseNo + e.phases.length}` : "");
    $(".foes").innerHTML = ctx.foes.map(e => `<div class="foe${e.alive || shownHp(e) > 0 ? "" : " down"}">${e.name}${e.boss ? ` · Lv ${e.level}${phaseNote(e)}` : ""}
      <div class="bar"><i style="width:${100 * shownHp(e) / e.maxHp}%;background:#d94a3a"></i></div>${e.alive ? foeTags(e) : ""}<div class="chips">${e.alive ? chipsFor(e) : ""}</div>
      ${e.breakType && e.alive ? `<div class="brk${e.broken ? " on" : ""}">${e.broken ? "BROKEN! +50% damage" : "Break " + "◆".repeat(e.breakPts) + "◇".repeat(Math.max(0, (e.breakNeed || 1) - e.breakPts))}</div>` : ""}</div>`).join("");
    const weak = e => { const w = Object.entries(e.rs || {}).filter(([k, v]) => v <= -0.25).map(([k]) => k); return w.length ? w.join("/") : ""; };
    ctx.foes.forEach(() => 0);
    $(".party").innerHTML = ctx.party.map(u => `<div class="pm${u === activeU ? " on" : ""}${u.alive || shownHp(u) > 0 ? "" : " down"}"><div class="row"><span class="nm">${u === activeU ? "▶ " : ""}${u.name} <small>Lv${u.level}</small></span><span>${shownHp(u)}/${u.maxHp}</span></div>
      <div class="bar"><i style="width:${100 * shownHp(u) / u.maxHp}%;background:#58c26a"></i></div><div class="mp">${Array.from({ length: u.maxMp }, (_, k) => `<b class="${k < u.mp ? "on" : ""}"></b>`).join("")}</div>
      ${u.style === "leviathan" ? `<div class="tide">${"<b class='on'></b>".repeat(u.tide)}${"<b></b>".repeat(Math.max(0, (u.tideMax || 5) - u.tide))} Tide ${u.tide}</div>` : ""}<div class="chips">${u.alive ? chipsFor(u) : ""}</div></div>`).join("")
      + `<div class="row" style="font-size:13px;color:#b7a58a;margin-top:6px"><span>${itemLine()}</span><span>Round ${ctx.round}</span></div>`;
  }
  const itemLine = () => Object.keys(state.items).filter(k => state.items[k] > 0 && Core.ITEMS[k]).map(k => `${Core.ITEMS[k].name} ${state.items[k]}`).join(" · ") || "No items";
  const log = s => ($(".log").textContent = s);
  // big popping damage/heal numbers over whoever was hit (CSS animation, so it runs even when frames are slow)
  function screenPos(u, hf = 0.75) { const v = u.view; if (!v) return null; tmpV.copy(v.group.position); tmpV.y += v.h * hf; tmpV.project(camera); return [(tmpV.x + 1) / 2 * innerWidth, (1 - tmpV.y) / 2 * innerHeight]; }
  function popNum(u, value, color, note, cls) {
    const p = screenPos(u); if (!p) return;
    const d = document.createElement("div"); d.className = "dmg" + (cls ? " " + cls : ""); d.style.color = color; d.textContent = value;
    if (note) { const sm = document.createElement("small"); sm.textContent = note; d.appendChild(sm); }
    d.style.left = (p[0] + (Math.random() - 0.5) * 50) + "px"; d.style.top = p[1] + "px";
    el.root.appendChild(d); setTimeout(() => d.remove(), 1600);
  }
  let lastUse = null;
  function float(u, s, color) {
    const p = screenPos(u, 0.9); if (!p) return;
    const d = document.createElement("div"); d.className = "num"; d.textContent = s; d.style.color = color || "#f4e9d4";
    d.style.left = (p[0] + (Math.random() - 0.5) * 40) + "px"; d.style.top = p[1] + "px";
    el.root.appendChild(d); requestAnimationFrame(() => { d.style.transform = "translateY(-50px)"; d.style.opacity = "0"; }); setTimeout(() => d.remove(), 1000);
  }
  function banner(text, color) {
    const d = document.createElement("div"); d.className = "react"; d.style.color = color || "#ffd27a"; d.textContent = text; el.root.appendChild(d); setTimeout(() => d.remove(), 1700);
  }
  // the hero stands behind the team and coaches: a gesture and a short line over his helmet
  const coach = { name: "You", side: "p", alive: true, coach: true };
  let coachLight = null, bubbleEl = null, bubbleT = null;
  function coachSay(text, clip = "slash") {
    if (!coach.view) return;
    playClip(coach, clip, clip === "slash" ? 0.9 : 1);
    if (!bubbleEl) { bubbleEl = document.createElement("div"); bubbleEl.className = "num"; Object.assign(bubbleEl.style, { fontSize: "18px", color: "#e8c8ff", transition: "opacity .3s", whiteSpace: "nowrap", transform: "translate(-50%, -100%)" }); el.root.appendChild(bubbleEl); }
    const p = screenPos(coach, 1.15); if (!p) return;
    bubbleEl.style.left = p[0] + "px"; bubbleEl.style.top = p[1] + "px";
    bubbleEl.textContent = "“" + text + "”"; bubbleEl.style.opacity = "1";
    clearTimeout(bubbleT); bubbleT = setTimeout(() => bubbleEl && (bubbleEl.style.opacity = "0"), 1600 * speedF() + 400);
  }
  const pick = list => list[Math.floor(Math.random() * list.length)];
  function flash(color, ms = 220) {
    const d = document.createElement("div"); Object.assign(d.style, { position: "absolute", inset: "0", background: color, opacity: "0.5", pointerEvents: "none", transition: `opacity ${ms}ms` });
    el.root.appendChild(d); requestAnimationFrame(() => (d.style.opacity = "0")); setTimeout(() => d.remove(), ms + 50);
  }
  function tint(u, hex, ms = 130) {
    const v = u.view; if (!v || !v.model || v.billboard) return;
    v.model.traverse(o => o.isMesh && o.material.emissive && o.material.emissive.set(hex).multiplyScalar(0.5));
    setTimeout(() => v.model.traverse(o => o.isMesh && o.material.emissive && o.material.emissive.set(0)), ms);
  }
  function playClip(u, name, sp = 1) {
    const v = u.view; if (!v || !v.mixer || !v.clips[name]) return false; const c = v.clips[name];
    const a = v.mixer.clipAction(c); a.reset(); a.setLoop(name === "walk" ? THREE.LoopRepeat : THREE.LoopOnce, 1); a.timeScale = sp; a.fadeIn(0.1).play();
    if (v.base && v.base !== a) { v.base.fadeOut(0.1); setTimeout(() => { a.fadeOut(0.15); v.base.reset().fadeIn(0.15).play(); }, Math.min(1400, c.duration * 1000 / sp) * speedF() + 60); }
    return true;
  }
  function lunge(u, target, dist) {
    if (!u.view || !target.view) return;
    if (!playClip(u, "slash", 1.4)) playClip(u, "walk", 2.2);
    const from = u.view.home.clone(), to = from.clone().lerp(target.view.home, dist); to.y = 0;
    u.view.anim = { from, to, t: 0, dur: 0.42 * speedF() + 0.05 };
  }
  const centreOf = list => { const l = list.filter(x => x.view); const c = { view: { home: new THREE.Vector3(l.reduce((s, x) => s + x.view.home.x, 0) / (l.length || 1), 0, l.reduce((s, x) => s + x.view.home.z, 0) / (l.length || 1)) } }; return c; };

  // ---------- playing back what the rules did ----------
  const wait = ms => new Promise(r => setTimeout(r, Math.max(10, ms * speedF())));
  const EL_SFX = { fire: "fire", water: "water", ice: "ice", shock: "shock", poison: "poison" };
  const ST_SFX = { burn: "fire", wet: "water", chill: "ice", freeze: "ice", shock: "shock", poison: "poison" };
  // HP the HUD shows per unit while events play: the rules already hold the final HP, so each hit/heal event carries hpAfter and the bar follows the events (UI-FIX)
  const shown = new Map();
  const shownHp = u => (shown.has(u) ? shown.get(u) : u.hp);
  async function play() {
    const evs = ctx.ev.splice(0);
    shown.clear();
    for (const e of evs) {   // start from the HP before the first hp-carrying event of each unit
      if (e.hpAfter === undefined || !e.tgt || shown.has(e.tgt)) continue;
      shown.set(e.tgt, e.t === "heal" ? Math.max(0, e.hpAfter - e.v) : Math.min(e.tgt.maxHp, e.hpAfter + e.v));
    }
    if (shown.size) hud();
    for (const e of evs) {
      try { await playOne(e); } catch (err) { console.warn("arena event failed", e && e.t, err); }
    }
    shown.clear(); hud();
    if (!ctx.telegraph) $(".warn").textContent = "";
  }
  // a foe that joined the fight (a "summon" event of the rules): its view appears on a free spot and climbs out of the ground (ARENA agent)
  async function summonIn(e) {
    const u = e.unit; if (!u || u.view) return;
    await ensureAsset(u.art || u.id); if (!units.includes(u)) units.push(u);
    makeView(u, u.art || u.id, -6, -2);
    if (root.ArenaLayout) { try { root.ArenaLayout.place({ THREE, camera, w: innerWidth, h: innerHeight, foes: ctx.foes, party: ctx.party.slice(0, 3), coach, camP }, u); } catch (err) { console.warn("arena place failed", err); } }
    if (root.ArenaBoss) { root.ArenaBoss.attach(u); root.ArenaBoss.rise(u); }
    sfx("telegraph"); hud(); await wait(650);
  }
  async function playOne(e) {
    if (root.ArenaBoss) { const r = root.ArenaBoss.event(e); if (r && r.then) await r; }   // boss visuals: collar, phase rings, pinned / marked heroes
    if (e.t === "summon") { await summonIn(e); return; }
    if (e.t === "use") {
      const mv = e.moveId && Core.MOVES[e.moveId], P = e.basic ? 1 : e.enemy ? (e.big ? 2.3 : 1.2) : mv && mv.mp >= 3 ? 2.3 : mv && mv.mp >= 2 ? 1.6 : 1.2;
      log(`${e.src.name}: ${e.move}`); lastUse = { src: e.src, move: e.move, total: 0, P };
      if (FX()) FX().setEnabled(speedF() >= 0.1);
      const offensive = !e.item && (e.enemy || e.tkind === "enemy" || e.tkind === "allEnemies");
      let tgt = null;
      if (offensive) {
        if (e.tgt && e.tgt.view && e.tgt.side !== e.src.side) tgt = e.tgt;
        else tgt = e.src.side === "e" ? ctx.party.find(p => p.alive && p.view) : centreOf(ctx.foes.filter(f => f.alive));
      }
      // spells fly (an orb from the caster), physical moves lunge; non-basic moves gather a glow on the caster first
      const spell = offensive && !e.basic && (e.enemy ? !!e.el && !e.big : mv && (mv.kind === "spell" || (mv.kind === "best" && Core.eff(e.src, "pow") > Core.eff(e.src, "atk"))));
      const fx = FX();
      // a move with its own animation (FX3D.move, see src/fx-moves.js) plays that instead of the generic glow / orb / lunge below
      const own = fx && fx.move && speedF() >= 0.1 ? fx.move(e, { mv, P, tgt, spell, offensive, foes: ctx.foes, party: ctx.party, lunge, playClip, flash, wait, sfx, speedF: () => speedF(), shake: v => { shake = Math.max(shake, v); } }) : null;
      if (own) { await own; return; }
      if (fx && !e.basic && !e.item && (offensive || e.grp === "support" || e.grp === "control")) fx.cast(e.src, e.el, P);
      if (fx && offensive && e.tkind === "allEnemies") fx.wave((e.src.side === "p" ? ctx.foes : ctx.party).filter(x => x.alive), e.el, P);
      if (spell && fx && tgt && e.tkind !== "allEnemies") { await wait(260); await fx.shoot(e.src, tgt.view && tgt.side ? tgt : (ctx.foes.find(f => f.alive) || tgt), e.el, P, 360 * speedF()); }
      else if (tgt && !e.big) lunge(e.src, tgt, e.src.boss ? 0.22 : 0.5);
      if (e.big) { shake = 0.2; await wait(400); }
      else if (!offensive) sfx("buff");
      else if (e.el && EL_SFX[e.el]) { /* the sound plays on the hit */ } else if (!e.basic && e.grp !== "basic" && !e.enemy) sfx("spell");
      await wait(e.basic ? 300 : spell ? 120 : 420);
    } else if (e.t === "dmg") { if (e.absorbed) seenFx("shield");
      if (e.hpAfter !== undefined && e.tgt) shown.set(e.tgt, e.hpAfter);
      if (e.dot) {
        if (FX()) FX().status(e.tgt, e.dot); float(e.tgt, "-" + e.v, (CHIP[e.dot] || ["", "#ff9a6a"])[1]); sfx(EL_SFX[e.el] || "hit"); hud(); await wait(160); return;
      }
      if (FX()) FX().hit(e.tgt, e.el, e.kind, lastUse && lastUse.src === e.src ? lastUse.P : 1, e.crit);
      playClip(e.tgt, "hurt", 1.6); if (e.tgt.view) e.tgt.view.hitT = 1; tint(e.tgt, 0xff6060); shake = Math.max(shake, e.crit ? 0.18 : e.tgt.boss ? 0.05 : 0.09);
      sfx(e.crit ? "crit" : EL_SFX[e.el] || (e.v > e.tgt.maxHp * 0.22 ? "hitHeavy" : e.kind === "spell" ? "spell" : "hit"));
      popNum(e.tgt, e.v, e.tgt.side === "p" ? "#ff7a66" : e.crit ? "#ffd23f" : "#fff4e0", [e.crit ? "CRITICAL" : "", e.note, e.tgt.broken ? "BROKEN x1.5" : "", e.absorbed ? e.absorbed + " blocked" : ""].filter(Boolean).join(" · "));
      if (lastUse && e.src && lastUse.src === e.src) { lastUse.total += e.v; log(`${e.src.name}: ${lastUse.move}  —  ${lastUse.total} damage`); }
      hud(); await wait(320);
    } else if (e.t === "heal") { if (e.hpAfter !== undefined && e.tgt) shown.set(e.tgt, e.hpAfter); if (e.v > 0) { if (FX()) FX().heal(e.tgt); tint(e.tgt, 0x90ff90, 200); popNum(e.tgt, "+" + e.v, "#7ee081"); sfx("heal"); } hud(); await wait(e.v > 0 ? 260 : 20); }
    else if (e.t === "selfDmg") { float(e.tgt, "-" + e.v, "#ff6b57"); hud(); await wait(200); }
    else if (e.t === "say") { log(e.text); await wait(450); }
    else if (e.t === "status") { seenFx(e.type); if (FX()) FX().status(e.tgt, e.type); const c = CHIP[e.type]; float(e.tgt, c ? `${c[0]} ${c[2]}${e.n > 1 ? " x" + e.n : ""}` : e.type === "coil" ? "Coiled" : e.type === "curse" ? "Sealed" : e.type, c ? c[1] : "#e8c8ff"); sfx(ST_SFX[e.type] || "debuff"); hud(); await wait(240); }
    else if (e.t === "debuff") { seenFx("debuff"); if (FX()) FX().debuff(e.tgt); float(e.tgt, `${STAT_LABEL[e.stat] || e.stat} ▼`, "#ff9a8a"); sfx("debuff"); hud(); await wait(220); }
    else if (e.t === "buff") { seenFx("buff"); if (FX()) FX().buff(e.tgt); float(e.tgt, `${STAT_LABEL[e.stat] || e.stat} ▲`, "#a8e0a0"); sfx("buff"); hud(); await wait(200); }
    else if (e.t === "reaction") { seenFx(e.name); if (FX() && e.tgt) FX().reaction(e.tgt, e.name); banner(e.name.toUpperCase() + "!", { Freeze: "#7fe3ff", Steam: "#e0e0e0", Conductive: "#ffe45c", Shatter: "#b0e8ff", Detonate: "#ff9a4a" }[e.name]); if (e.text) log(e.text); flash("#ffffff", 180); sfx(e.name === "Freeze" || e.name === "Shatter" ? "ice" : e.name === "Conductive" ? "shock" : "fire"); shake = Math.max(shake, 0.15); hud(); await wait(750); }
    else if (e.t === "stunned") { float(e.tgt, e.type === "freeze" ? "FROZEN" : "STUNNED", "#ffd23f"); sfx("debuff"); log(`${e.tgt.name} cannot act!`); await wait(500); }
    else if (e.t === "tide") { seenFx("tide"); if (e.n > 0) float(e.tgt, "Tide " + e.v, "#4ad0c8"); hud(); await wait(e.n > 0 ? 160 : 20); }
    else if (e.t === "resist") { seenFx("resist"); float(e.tgt, "Resisted", "#c9b28a"); await wait(160); }
    else if (e.t === "immune") { float(e.tgt, "Immune", "#c9b28a"); await wait(160); }
    else if (e.t === "reflect") { float(e.tgt, "Reflected!", "#e8f0ff"); flash("#ffffff", 150); await wait(300); }
    else if (e.t === "cleanse") { float(e.tgt, "Cleansed", "#ffe9a0"); sfx("heal"); hud(); await wait(160); }
    else if (e.t === "breakPt") { float(e.tgt, `Crack ${e.pts}/${e.need || 2}`, "#f2c14e"); hud(); await wait(260); }
    else if (e.t === "broken") { seenFx("broken"); if (FX()) FX().brk(e.tgt); coachSay(pick(["Now! It's open!", "Hit it while it's down!", "Its guard is broken!"])); sfx("break"); banner("BROKEN!", "#f2c14e"); flash("#ffd27a"); shake = 0.25; log(`${e.tgt.name} is BROKEN! It takes 50% more damage.`); hud(); await wait(900); }
    else if (e.t === "phase") { sfx("telegraph"); flash("#ff3b2a", 500); shake = 0.35; banner("PHASE " + (e.tgt.phaseNo || ""), "#ff6b57"); log(e.text); hud(); await wait(1700); }
    else if (e.t === "ko") { if (e.tgt.side === "p") coachSay(pick([e.tgt.name + "! Get up!", "Hold on, " + e.tgt.name + "!"]), "idle"); sfx("ko"); if (FX()) FX().ko(e.tgt); if (e.tgt.view) e.tgt.view.alive = 0; log(`${e.tgt.name} falls!`); hud(); await wait(500); }
    else if (e.t === "revive") { if (FX()) FX().revive(e.tgt); sfx("heal"); if (e.tgt.view) e.tgt.view.alive = 1; tint(e.tgt, 0xffe080, 300); log(e.text || `${e.tgt.name} is back on its feet!`); hud(); await wait(500); }
    else if (e.t === "telegraph") { seenFx("telegraph"); sfx("telegraph"); coachSay(pick(["Brace yourselves!", "Something big is coming!", "Guard up, all of you!"]), "idle"); $(".warn").textContent = "⚠ " + e.text; log(e.text); await wait(1000); }
  }

  // ---------- command menu (keyboard: arrows + Enter, Esc = back, 1-9 = pick; or click) ----------
  function menu(title, options, back = false, onHover, start) {
    return new Promise(resolve => {
      const box = $(".cmd"), list = box.querySelector(".opts"), info = box.querySelector("p");
      box.hidden = false; box.querySelector("h4").textContent = title || "";
      const sel0 = options.findIndex(o => !o.disabled && !o.header);
      let sel = start >= 0 && options[start] && !options[start].disabled && !options[start].header ? start : Math.max(0, sel0);   // start = remembered cursor
      const draw = () => { [...list.children].forEach((b, i) => { if (options[i].header) return; b.classList.toggle("sel", i === sel); if (i === sel) { info.textContent = options[i].info || ""; if (onHover) onHover(options[i], i); } }); };
      list.innerHTML = "";
      let num = 0;
      options.forEach((o, i) => {
        if (o.header) { const h = document.createElement("div"); h.className = "hd"; h.textContent = o.label; list.appendChild(h); return; }
        const b = document.createElement("button"); b.type = "button"; b.textContent = (++num <= 9 ? num + ". " : "") + o.label; b.disabled = !!o.disabled; o._n = num;
        b.onmouseenter = () => { if (!o.disabled) { sel = i; draw(); } }; b.onclick = () => done(i); list.appendChild(b);
      });
      const selectable = () => options.map((o, i) => (o.disabled || o.header ? -1 : i)).filter(i => i >= 0);
      const step = d => { const s = selectable(); if (!s.length) return; let k = s.indexOf(sel); if (k < 0) k = 0; sel = s[(k + d + s.length) % s.length]; draw(); };
      const key = e => {
        if (["ArrowDown", "s", "ArrowRight"].includes(e.key)) { step(1); e.preventDefault(); }
        else if (["ArrowUp", "w", "ArrowLeft"].includes(e.key)) { step(-1); e.preventDefault(); }
        else if (["Enter", " "].includes(e.key)) { if (!options[sel].disabled) done(sel); e.preventDefault(); }
        else if (["Escape", "Backspace"].includes(e.key) && back) { done(-1); e.preventDefault(); }
        else if (/^[1-9]$/.test(e.key)) { const i = options.findIndex(o => o._n === +e.key); if (i >= 0 && !options[i].disabled) done(i); e.preventDefault(); }
      };
      addEventListener("keydown", key, true);
      function done(i) { removeEventListener("keydown", key, true); box.hidden = true; setMarker(null); resolve(i); }
      draw();
    });
  }
  const weakNote = f => {
    const w = Object.entries(f.rs || {}).filter(([k, v]) => v <= -0.25).map(([k]) => k), r = Object.entries(f.rs || {}).filter(([k, v]) => v >= 0.4).map(([k]) => k);
    return [w.length ? "Weak to " + w.join(", ") : "", r.length ? "Resists " + r.join(", ") : "", f.pr ? "Resists physical hits" : "", f.reflect ? "Reflects " + f.reflect.join("/") + " spells" : "", f.swarm ? "Swarm: area hits hurt it most" : "", f.breakType ? "Break: " + f.breakType : "", f.immune && f.immune.length ? "Immune: " + f.immune.join(", ") : ""].filter(Boolean).join(". ");
  };
  // the same weakness / resistance / break info as the target picker, always shown on the foe's HUD panel (UI-FIX: it vanished when one foe was left and the picker was skipped)
  function foeTags(f) {
    const w = Object.entries(f.rs || {}).filter(([k, v]) => v <= -0.25).map(([k]) => k), r = Object.entries(f.rs || {}).filter(([k, v]) => v >= 0.4).map(([k]) => k);
    const t = [w.length ? `<span class="w">Weak: ${w.join(", ")}</span>` : "", r.length ? `<span class="r">Resists: ${r.join(", ")}</span>` : "", f.pr ? `<span class="r">Resists physical</span>` : "", f.reflect ? `<span class="r">Reflects ${f.reflect.join("/")}</span>` : "", f.swarm ? `<span class="w">Swarm: area hits</span>` : "", f.breakType ? `<span class="b">Break: ${f.breakType}</span>` : "", f.immune && f.immune.length ? `<span class="r">Immune: ${f.immune.join(", ")}</span>` : ""].filter(Boolean);
    return t.length ? `<div class="tags">${t.join("")}</div>` : "";
  }
  async function pickTarget(kind, u) {
    if (kind === "self" || kind === "team" || kind === "allEnemies") return u;
    if (kind === "enemy") {
      const foes = ctx.foes.filter(f => f.alive);
      if (foes.length === 1) return foes[0];
      const i = await menu("Target", foes.map(f => ({ label: `${f.name}  ${f.hp}/${f.maxHp}`, info: weakNote(f), unit: f })).concat([{ label: "Back" }]), true, o => setMarker(o.unit));
      return i >= 0 && i < foes.length ? foes[i] : null;
    }
    const pool = kind === "allyDown" ? ctx.party.filter(p => !p.alive) : ctx.party.filter(p => p.alive);
    if (!pool.length) return null;
    const i = await menu(kind === "allyDown" ? "Revive who?" : "Who?", pool.map(p => ({ label: `${p.name}  ${p.hp}/${p.maxHp}`, info: Core.statusList(p).map(s => s.name).join(", "), unit: p })).concat([{ label: "Back" }]), true, o => setMarker(o.unit));
    return i >= 0 && i < pool.length ? pool[i] : null;
  }
  const costText = (u, id) => { const m = Core.MOVES[id]; const c = Core.mpCost(u, id); return m.hpCost ? `${Math.round(m.hpCost * 100)}% HP` : m.hpCostPct ? `${Math.round(m.hpCostPct * 100)}% HP` : c ? c + " MP" : m.basic ? "+1 MP" : "free"; };
  const powerNote = (u, id) => {
    const m = Core.MOVES[id], bits = [];
    if (m.p) bits.push(`Power ${Math.round(m.p * 100)}%${m.hits > 1 ? " x" + m.hits : ""}`);
    if (id === "maelstrom" || id === "tidalWave") bits.push(`Tide now ${u.tide}: x${(1 + 0.8 * u.tide).toFixed(1)}`);
    if (m.el && m.el !== "self") bits.push(m.el);
    if (m.bk && m.bk.length) bits.push("break: " + m.bk.join("/"));
    if (m.skill) bits.push("off-style: no role bonuses");
    return bits.length ? " [" + bits.join(", ") + "]" : "";
  };
  function movesMenuOptions(u) {
    const all = Core.movesOf(u).filter(m => !Core.MOVES[m].basic), opts = [];
    GROUPS.forEach(([g, label]) => {
      const list = all.filter(m => (Core.MOVES[m].grp || "damage") === g).sort((a, b) => (b === u.lastMove) - (a === u.lastMove));
      if (!list.length) return; opts.push({ header: true, label });
      list.forEach(m => {
        const d = Core.MOVES[m], can = Core.canUse(ctx, u, m);
        opts.push({ label: `${d.name}  —  ${costText(u, m)}`, disabled: !can, id: m, info: (can ? "" : u.mp < Core.mpCost(u, m) ? `Needs ${Core.mpCost(u, m)} MP. ` : "Not usable now. ") + d.desc + powerNote(u, m) });
      });
    });
    return opts;
  }
  async function chooseMove(u, id) {
    const m = Core.MOVES[id]; let opt;
    if (m.choices) { const i = await menu(m.name, m.choices.map(([k, l]) => ({ label: l })).concat([{ label: "Back" }]), true); if (i < 0 || i >= m.choices.length) return null; opt = m.choices[i][0]; }
    const t = await pickTarget(m.target, u); if (!t) return null;
    return { move: id, target: t, opt };
  }
  // the game state G is a top-level let in flow.js (not on window); read the setting safely
  // the journal Effects tab opens an entry once that effect happened in a fight (either side)
  const seenFx = k => { try { if (k) (G.seenFx = G.seenFx || {})[k] = 1; } catch (e) {} };
  const cursorMem = () => { try { return G.cursorMem !== false; } catch (e) { return true; } };
  async function command(u, a, n) {
    const mv = Core.movesOf(u), basic = mv.find(m => Core.MOVES[m].basic), B = Core.MOVES[basic];
    for (;;) {
      log(`${u.name}: action ${a + 1} of ${n}  (MP ${u.mp}/${u.maxMp}${u.style === "leviathan" ? ", Tide " + u.tide : ""})`);
      const repeat = u.lastMove && !Core.MOVES[u.lastMove].basic && mv.includes(u.lastMove) ? u.lastMove : null;
      const off = u.offMove && mv.includes(u.offMove) ? u.offMove : null;
      const hasItems = Object.keys(state.items).some(k => state.items[k] > 0 && Core.ITEMS[k]);
      const opts = [{ label: `Attack: ${B.name} (+1 MP)`, info: B.desc + powerNote(u, basic), k: "attack" }];
      if (repeat) opts.push({ label: `Again: ${Core.MOVES[repeat].name} (${costText(u, repeat)})`, disabled: !Core.canUse(ctx, u, repeat), info: Core.MOVES[repeat].desc + powerNote(u, repeat), k: "repeat" });
      opts.push({ label: "Moves ▸", info: `${mv.length - 1} moves learned. Last used comes first in each group.`, k: "moves" });
      if (off) opts.push({ label: `Skill: ${Core.MOVES[off].name} (${costText(u, off)})`, disabled: !Core.canUse(ctx, u, off), info: "Your off-style slot. " + Core.MOVES[off].desc + powerNote(u, off), k: "off" });
      opts.push({ label: `Items ▸`, disabled: !hasItems || u.usedItem, info: u.usedItem ? "Only 1 item per creature per turn." : itemLine(), k: "items" });
      opts.push({ label: "Auto (let the AI pick)", k: "auto" }, { label: "Run", disabled: state.boss, info: state.boss ? "There is no running from this fight." : "70% chance to get away.", k: "run" });
      // cursor memory (setting, on by default): start on the last command; a move used from Moves puts the cursor on "Again"
      const mem = cursorMem(), lk = u._lastK === "moves" && repeat ? "repeat" : u._lastK;
      const i = await menu("", opts, false, null, mem ? opts.findIndex(o => o.k === lk) : -1);
      const k = opts[i].k; if (k !== "auto" && k !== "run") u._lastK = k;
      if (k === "attack") { const c = await chooseMove(u, basic); if (c) return c; }
      else if (k === "repeat" || k === "off") { const c = await chooseMove(u, k === "repeat" ? repeat : off); if (c) return c; }
      else if (k === "moves") {
        const mo = movesMenuOptions(u), j = await menu(`Moves · MP ${u.mp}${u.style === "leviathan" ? " · Tide " + u.tide : ""}`, mo.concat([{ label: "Back" }]), true, null, cursorMem() ? mo.findIndex(o => o.id && o.id === u.lastMove) : -1);
        if (j >= 0 && mo[j] && mo[j].id) { const c = await chooseMove(u, mo[j].id); if (c) return c; }
      } else if (k === "items") {
        const ids = Object.keys(Core.ITEMS).filter(x => state.items[x] > 0), io = ids.map(x => ({ label: `${Core.ITEMS[x].name}  x${state.items[x]}`, id: x, disabled: !(Core.itemOk ? Core.itemOk(ctx, x) : !(Core.ITEMS[x].target === "allyDown" && !ctx.party.some(p => !p.alive))), info: Core.ITEMS[x].desc }));
        const j = await menu("Items", io.concat([{ label: "Back" }]), true);
        if (j >= 0 && io[j]) { const t = await pickTarget(Core.ITEMS[io[j].id].target, u); if (t) return { item: io[j].id, target: t }; }
      } else if (k === "auto") { const it = Core.autoItem(ctx, u, state.items); return it ? it : Core.autoChoice(ctx, u); }
      else if (k === "run") { if (Math.random() < 0.7) return { flee: true }; log("Couldn't get away!"); sfx("debuff"); await wait(500); return { move: basic, target: ctx.foes.find(f => f.alive) }; }
    }
  }

  // ---------- the fight ----------
  const state = { items: {}, boss: false };
  async function fight(opts) {
    await init();
    if (!Object.keys(manifest).length && !manifestTried) await loadManifest();
    speedF = opts.speedF || (() => 1); state.boss = !!opts.boss || opts.foes.some(f => f.boss);
    state.items = Object.assign({}, opts.items || {}); if (opts.potions !== undefined && state.items.potion === undefined) state.items.potion = opts.potions;
    clearFighters(); const bg = BG_ALIAS[opts.bg] || opts.bg; if (!(await buildArenaSets(opts.bg))) buildArena(ARENAS[bg] ? bg : "desert");
    const keys = new Set([...opts.foes.map(f => f.art || f.id), ...opts.party.map(p => p.art || p.id), "knight"]);
    await Promise.all([...keys].map(ensureAsset));
    ctx = Core.newBattle(opts.party, opts.foes);
    await Promise.all(opts.foes.map(f => ensureAsset(f.art || f.id)));   // QA-A: units added by a start hook (Maelstrom heads) were in opts.foes without art loaded -> "M" placeholders
    const fm = formation(opts.foes);
    opts.foes.forEach((e, i) => { const p = fm[i] || [-4 - i * 1.5, -2 + i]; makeView(e, e.art || e.id, p[0], p[1]); });   // 4-5 foes (summons) have no classic slot: ArenaLayout places them
    // the front slot is closest to the camera: the bulkiest creature stands at the back so it never hides a smaller one (Danny 2026-10-30, Mawdeep over Pyrewisp)
    const SLOTS = [[3.4, -3.2], [6.0, -0.8], [2.4, 2.2]], team = opts.party.slice(0, 3);
    team.forEach(p => makeView(p, p.art || p.id, 0, 0));   // p.art = the evolved form's own art when it exists (Evo sets it)
    const bulk = p => { const b = new THREE.Box3().setFromObject(p.view.group), s = b.getSize(tmpV); return s.x * s.y + s.z * s.y * 0.5; };
    team.map(p => [p, bulk(p)]).sort((a, b) => b[1] - a[1]).forEach(([p], i) => { const [x, z] = SLOTS[i]; p.view.group.position.set(x, 0, z); p.view.home.set(x, 0, z); });
    makeView(coach, "knight", 9.6, -4.8);   // behind the team, upper right of the screen, so no creature covers him
    if (!coachLight) coachLight = new THREE.PointLight(0x9a4dff, 1.2, 6, 2);
    coach.view.group.add(coachLight); coachLight.position.set(0, 1.6, 0.6);
    units = [...opts.foes, ...opts.party, coach];
    el.root.style.display = "block"; camP.k = 1; camP.id = "std"; camP.y = 4.6; camP.z = 14.5; camP.ly = 1.9; resize(); active = true; introT = opts.noIntro ? 0 : 2.5; hud();
    // where everybody stands and which camera frames them (src/arena-layout.js): nothing hides anything, nothing is off screen or under a HUD panel; the classic formation above is the fallback
    if (root.ArenaLayout) { try { root.ArenaLayout.arrange({ THREE, camera, renderer, scene, w: innerWidth, h: innerHeight, foes: opts.foes, party: team, coach, camP }); resize(); } catch (e) { console.warn("arena layout failed", e); } }
    // boss visuals (src/arena-boss.js): general collars, multi-part shields, burrowed / airborne / pinned states, phase rings
    if (root.ArenaBoss) { try { root.ArenaBoss.begin({ THREE, scene, camera, ctx: () => ctx, units: () => units, arena: () => arenaCtl, sfx, float, flash: (c, ms) => flash(c, ms), shake: v => { shake = Math.max(shake, v); } }); } catch (e) { console.warn("arena boss visuals failed", e); } }
    const n = opts.foes.length, lead = opts.foes.find(f => f.boss) || opts.foes[0];
    log(opts.intro || (lead.boss && lead.intro) || (state.boss ? "A fearsome foe blocks your way!" : n > 1 ? "A group attacks!" : `${lead.name} attacks!`));
    await wait(1600);
    await play();   // opening events (e.g. a Sphinx Cub's free Weaken)
    if (opts.hold) { await opts.hold({ playOne, ctx, hud, log, wait }); finish(); return { res: "flee", potions: 0, items: state.items, rounds: ctx.round }; }   // test pages (fx-test.html): play events by hand, no turn loop
    let res = null;
    try {
      while (!res) {
        ctx.round++;
        for (const u of Core.turnOrder(ctx)) {
          if (!u.alive) continue;
          const acts = Core.actionsFor(ctx, u); await play();
          if (u.side === "p" && acts > 2) { log(`${u.name} is twice as fast: 3 actions!`); await wait(500); }
          for (let a = 0; a < acts && u.alive && !Core.outcome(ctx); a++) {
            if (u.side === "e") Core.enemyAct(ctx, u);
            else {
              hud(u);
              if (a === 0 && Math.random() < 0.5) coachSay(pick([u.name + ", go!", u.name + ", your turn!", "Show them, " + u.name + "!", "Steady, " + u.name + "."]));
              let c;
              if (opts.auto) { c = Core.autoItem(ctx, u, state.items) || Core.autoChoice(ctx, u); } else c = await command(u, a, acts);
              if (c.flee) { sfx("debuff"); finish(); return { res: "flee", potions: state.items.potion || 0, items: state.items, rounds: ctx.round }; }
              if (c.item) { state.items[c.item]--; Core.useItem(ctx, u, c.item, c.target); } else Core.useMove(ctx, u, c.move, c.target, c.opt);
            }
            await play();
          }
          Core.endTurn(ctx, u); await play();
          if ((res = Core.outcome(ctx))) break;
        }
        Core.endRound(ctx); await play(); res = res || Core.outcome(ctx); hud();
      }
    } catch (err) { finish(); throw err; }
    if (res === "win") coachSay(pick(["Well fought.", "That's how it's done.", "Good. Stay sharp."]), "jump"); else coachSay("Fall back!", "idle");
    log(res === "win" ? "Victory!" : "Your team falls...");
    await wait(1400);
    const out = { res, potions: state.items.potion || 0, items: state.items, rounds: ctx.round };
    if (res === "win") out.rewards = Core.rewards(opts.foes);
    finish();
    return out;
  }
  function finish() { if (FX()) FX().clear(); if (root.ArenaBoss) root.ArenaBoss.end(); active = false; el.root.style.display = "none"; $(".cmd").hidden = true; setMarker(null); clearFighters(); }

  // test helper: a small JPEG of the current 3D view (lets automated checks see facing without a big screen)
  function snap(w = 640) { renderer.render(scene, camera); const c = document.createElement("canvas"), src = renderer.domElement; c.width = w; c.height = Math.round(w * src.height / src.width); c.getContext("2d").drawImage(src, 0, 0, c.width, c.height); return c.toDataURL("image/jpeg", 0.6); }
  root.Arena3D = { init, fight, snap, manifest: () => manifest, get ctx() { return ctx; },
    arenaDef: key => (root.ArenaSets && root.ArenaSets.def ? root.ArenaSets.def(key) : null), get arena() { return arenaCtl; }, get camera() { return camera; }, get scene() { return scene; }, get camP() { return camP; },
    layoutEnv: () => ({ THREE, camera, renderer, scene, w: innerWidth, h: innerHeight, foes: ctx.foes, party: ctx.party.slice(0, 3), coach, camP }) };
})(window);
