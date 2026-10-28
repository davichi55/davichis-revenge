// 3D arena demo: pixel-art sprites standing in a real Three.js arena, with a cinematic camera.
// Battle rules come from core.js; the party plays itself (Core.autoChoice) so the camera work can be judged.
"use strict";
const $ = id => document.getElementById(id);
const ARENAS = {
  desert: { name: "Desert", floor: "floor_sand", pano: "pano_desert", fog: 0x2a1610, fogNear: 22, fogFar: 70, sky: 0x2a1610, tint: 0xfff2e4, sun: 0xffb070, sunI: 0.9, amb: 0.75, torches: false },
  temple: { name: "Temple", floor: "floor_stone", pano: "pano_temple", fog: 0x0c0907, fogNear: 14, fogFar: 48, sky: 0x0c0907, tint: 0xd9c8b4, sun: 0x8a7a6a, sunI: 0.35, amb: 0.45, torches: true },
};
const SPEEDS = [{ n: "1x", f: 1 }, { n: "2x", f: 0.5 }];
const PX = 0.022;                               // world units per sprite pixel
let arenaKey = "desert", speed = 0, cinematic = false, useModels = true;
// camera modes: fixed (default: one steady wide shot), cinematic (cuts and close-ups), free (drag to turn)
const CAM_MODES = ["Fixed", "Cinematic", "Free (drag)"]; let camMode = 0;
// 3D models (assets/models/*.glb, made from the sprites with image-to-3D); creatures without one stay sprites
const models = {}, MODEL_YAW = -Math.PI / 2, YAW_FIX = { duneBearer: Math.PI },  // models face the way their drawing faced
  MODEL_COLORS = { horncinder: 0x8e3b24 };
const RIGGED = new Set(["duneBearer"]);   // only bosses get a skeleton; creatures use the static model + code motion
function loadModel(key) {
  const file = "assets/models/" + key + (RIGGED.has(key) ? ".glb" : "_static.glb");
  return new Promise(res => new THREE.GLTFLoader().load(file, g => { models[key] = g; res(); }, undefined, () => res()));
}

// ---------- renderer, scene, camera ----------
const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setPixelRatio(1);
$("view").appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, 16 / 9, 0.1, 200);
// keep the same horizontal view on narrow or tall screens, so the whole arena stays in frame
function resize() {
  renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight;
  const hHalf = Math.atan(Math.tan(THREE.MathUtils.degToRad(21)) * 16 / 9);
  camera.fov = Math.min(95, Math.max(42, THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(hHalf) / camera.aspect))));
  camera.updateProjectionMatrix();
}
addEventListener("resize", resize); resize();

const loader = new THREE.TextureLoader();
const tex = {};
function loadTex(key) {
  return new Promise(res => loader.load("assets/" + key + ".png", t => { t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; tex[key] = t; res(t); }));
}

// ---------- arena: floor, wrap-around backdrop, lights, dust ----------
const world = new THREE.Group(); scene.add(world);
let torchLights = [];
function buildArena() {
  world.clear(); torchLights = [];
  const A = ARENAS[arenaKey];
  scene.background = new THREE.Color(A.sky);
  scene.fog = new THREE.Fog(A.fog, A.fogNear, A.fogFar);
  const ft = tex[A.floor].clone(); ft.needsUpdate = true; ft.wrapS = ft.wrapT = THREE.RepeatWrapping; ft.repeat.set(16, 16);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(140, 140), new THREE.MeshLambertMaterial({ map: ft }));
  floor.rotation.x = -Math.PI / 2; world.add(floor);
  const pt = tex[A.pano].clone(); pt.needsUpdate = true; pt.wrapS = THREE.MirroredRepeatWrapping; pt.repeat.set(4, 1);
  const pano = new THREE.Mesh(new THREE.CylinderGeometry(60, 60, 34, 64, 1, true), new THREE.MeshBasicMaterial({ map: pt, side: THREE.BackSide, fog: false }));
  pano.position.y = arenaKey === "temple" ? 13 : 9; world.add(pano);
  world.add(new THREE.AmbientLight(0xffffff, A.amb));
  world.add(new THREE.HemisphereLight(0xfff0dd, 0x6a4a30, arenaKey === "temple" ? 0.6 : 0.9));   // lifts the 3D models out of the shadows
  const sun = new THREE.DirectionalLight(A.sun, A.sunI); sun.position.set(-10, 14, 8); world.add(sun);
  if (A.torches) [[-9, -7], [9, -7], [-12, 6], [12, 6]].forEach(([x, z]) => {
    const l = new THREE.PointLight(0xff8a3a, 1.6, 22, 2); l.position.set(x, 3.2, z); world.add(l); torchLights.push(l);
    const flame = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffb060 })); flame.position.copy(l.position); world.add(flame);
  });
  if (arenaKey === "desert") dressDesert();
  // floating dust / embers
  const n = 260, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { pos[i * 3] = (Math.random() - 0.5) * 40; pos[i * 3 + 1] = Math.random() * 8; pos[i * 3 + 2] = (Math.random() - 0.5) * 30; }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  dust = new THREE.Points(g, new THREE.PointsMaterial({ color: arenaKey === "temple" ? 0xffa060 : 0xffe0b0, size: 0.07, transparent: true, opacity: 0.7 }));
  world.add(dust);
  units.forEach(u => u.view && u.view.mesh.material.color.set(A.tint));
}
let dust = null;
// Props close around the desert arena so the fight happens somewhere, not in an empty plain.
const DESERT_PROPS = [
  ["propPillar", -9, -6, 7, 0.3], ["propPillar", 8.5, -7.5, 6, 2.1], ["propPillar", -14, 3, 5, 1.2],
  ["propHead", 3.5, -9.5, 3.4, -0.5], ["propRuin", -3, -15, 7, 0.2], ["propRuin", 15, -3, 4.5, -1.1], ["propHead", -12, -12, 2.6, 2.5],
];
function placeProp(key, x, z, height, rotY) {
  if (!models[key]) return;
  const m = models[key].scene.clone(true);
  m.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.metalness = 0; o.material.roughness = 0.95; } });
  let b = posedBox(m); m.scale.setScalar(height / b.getSize(new THREE.Vector3()).y); b = posedBox(m);
  const c = b.getCenter(new THREE.Vector3()); m.position.set(-c.x, -b.min.y - height * 0.04, -c.z);   // sink slightly into the sand
  const g = new THREE.Group(); g.add(m); g.position.set(x, 0, z); g.rotation.y = rotY; world.add(g);
}
function dressDesert() {
  DESERT_PROPS.forEach(p => placeProp(...p));
  // scattered rocks in the same stone colour, cheap and free
  const rockMat = new THREE.MeshLambertMaterial({ color: 0x9a6a44, flatShading: true });
  for (let i = 0; i < 26; i++) {
    const a = i * 2.39, d = 7 + (i * 37 % 11), s = 0.25 + (i * 13 % 7) / 9;
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), rockMat);
    rock.position.set(Math.cos(a) * d, s * 0.35, Math.sin(a) * d - 2); rock.rotation.set(i, i * 2, i * 3); rock.scale.y = 0.6;
    if (rock.position.z > 6 && Math.abs(rock.position.x) < 6) continue;   // keep the camera side clear
    world.add(rock);
  }
}

// ---------- units as billboard sprites with blob shadows ----------
const shadowTex = (() => {
  const c = document.createElement("canvas"); c.width = c.height = 64; const x = c.getContext("2d");
  const gr = x.createRadialGradient(32, 32, 2, 32, 32, 30); gr.addColorStop(0, "rgba(0,0,0,0.6)"); gr.addColorStop(1, "rgba(0,0,0,0)");
  x.fillStyle = gr; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
})();
let units = [];
function makeView(u, key, artFacesLeft, x, z) {
  const t = tex[key], w = t.image.width * PX, h = t.image.height * PX;
  const geo = new THREE.PlaneGeometry(w, h); geo.translate(0, h / 2, 0);
  const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: t, alphaTest: 0.5, side: THREE.DoubleSide, color: ARENAS[arenaKey].tint }));
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.9, w * 0.38), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.02;
  const group = new THREE.Group(); group.add(shadow, mesh); group.position.set(x, 0, z); scene.add(group);
  u.view = { group, mesh, h, home: new THREE.Vector3(x, 0, z), artFacesLeft, phase: Math.random() * 6, anim: null, alive: 1 };
  if (useModels && models[key]) {
    const src = models[key], m = THREE.SkeletonUtils ? THREE.SkeletonUtils.clone(src.scene) : src.scene.clone(true), pivot = new THREE.Group();
    m.traverse(o => { if (o.isMesh) { if (!o.geometry.attributes.normal) o.geometry.computeVertexNormals(); o.material = o.material.clone(); if (!o.material.map) o.material = new THREE.MeshStandardMaterial({ color: MODEL_COLORS[key] || 0xb0a090, roughness: 0.85 }); } });
    m.traverse(o => { if (o.isMesh && o.material.isMeshStandardMaterial) { o.material.metalness = 0; o.material.roughness = 0.9; } });
    if (src.animations && src.animations.length) {
      const mixer = new THREE.AnimationMixer(m), clips = {};
      src.animations.forEach(c => { const n = c.name.toLowerCase(); ["idle", "walk", "slash", "hurt"].forEach(k => { if (n.includes(k)) clips[k] = c; }); });
      u.view.mixer = mixer; u.view.clips = clips;
      const base = clips.idle || clips.walk; if (base) { const a = mixer.clipAction(base); a.play(); if (!clips.idle) a.timeScale = 0; u.view.base = a; }
      mixer.update(0);
    }
    // measure the posed, skinned mesh (a plain bounding box ignores the skeleton and puts rigged models in the floor)
    let box = posedBox(m); const size = box.getSize(new THREE.Vector3());
    m.scale.multiplyScalar(h * 1.05 / size.y); box = posedBox(m); const c = box.getCenter(new THREE.Vector3());
    m.position.set(m.position.x - c.x, m.position.y - box.min.y, m.position.z - c.z);
    pivot.add(m); group.add(pivot); mesh.visible = false; u.view.model = pivot; u.view.inner = m; u.view.innerY = m.position.y; u.view.hitT = 0; u.view.yawFix = YAW_FIX[key] || 0;
  }
}
function posedBox(root) {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3(), v = new THREE.Vector3();
  root.traverse(o => {
    if (!o.isMesh) return;
    const p = o.geometry.attributes.position, step = Math.max(1, Math.floor(p.count / 4000));
    for (let i = 0; i < p.count; i += step) {
      if (o.isSkinnedMesh) o.boneTransform(i, v); else v.fromBufferAttribute(p, i);
      box.expandByPoint(v.applyMatrix4(o.matrixWorld));
    }
  });
  return box;
}
function setupFight() {
  units.forEach(u => u.view && scene.remove(u.view.group));
  const party = ["horncinder", "shellmund", "kitsuneva"].map(id => Core.makeCreature(id, 9));
  const boss = Core.makeEnemy("duneBearer", 8);
  makeView(boss, "duneBearer", false, -4.6, 0);
  [[2.6, -2.4], [3.8, 0.4], [5.0, 3.0]].forEach(([x, z], i) => makeView(party[i], party[i].id, true, x, z));
  units = [boss, ...party];
  ctx = Core.newBattle(party, [boss]); potions = 5;
  buildParty();
}
let ctx = null, potions = 5;

// ---------- camera director ----------
const cam = { pos: new THREE.Vector3(0, 4.5, 14), look: new THREE.Vector3(0, 1.8, 0), wantPos: new THREE.Vector3(0, 4.5, 14), wantLook: new THREE.Vector3(0, 1.8, 0), k: 2.2, shake: 0 };
let userYaw = 0, drift = 0, wideMode = "wide";
function shotWide() { wideMode = "wide"; cam.k = 1.0; }
function shotOn(u, other, close = 1) {
  if (!cinematic) return;
  wideMode = "shot"; cam.k = 1.6;
  const p = u.view.group.position, side = p.x < 0 ? -1 : 1;
  const o = other ? other.view.group.position : new THREE.Vector3();
  cam.wantPos.set(p.x + side * 3.2 * close, 1.7 + u.view.h * 0.35, p.z + 6.5 * close);
  cam.wantLook.set(p.x * 0.65 + o.x * 0.35, u.view.h * 0.45, p.z * 0.65 + o.z * 0.35);
}
function shotLow(u) {
  if (!cinematic) return;
  wideMode = "shot"; cam.k = 1.4;
  const p = u.view.group.position;
  cam.wantPos.set(p.x + 3.5, 0.6, p.z + 7.5); cam.wantLook.set(p.x, u.view.h * 0.6, p.z);
}
let introT = 0;
function updateCamera(dt, t) {
  drift += dt * 0.03;
  if (introT > 0 && camMode === 0) {   // fixed mode opens with a slow, straight push-in instead of an orbit
    introT = Math.max(0, introT - dt);
    const f = introT / 3.2; cam.wantPos.set(Math.sin(userYaw) * (14.5 + 6 * f), 4.6 + 1.5 * f, Math.cos(userYaw) * (14.5 + 6 * f)); cam.wantLook.set(0, 1.9, 0); cam.k = 2;
  } else if (introT > 0) {            // opening orbit: swing from behind the boss round to the front
    introT = Math.max(0, introT - dt);
    const a = Math.PI * 0.95 * (introT / 3.2) + 0.12, R = 12 + 4 * (introT / 3.2);
    cam.wantPos.set(Math.sin(a) * R, 3 + 2.5 * (introT / 3.2), Math.cos(a) * R); cam.wantLook.set(0, 1.8, 0); cam.k = 4;
  } else if (wideMode === "wide" || !cinematic) {
    const a = userYaw + (cinematic ? Math.sin(drift) * 0.08 : 0), R = 14.5;
    cam.wantPos.set(Math.sin(a) * R, 4.6, Math.cos(a) * R); cam.wantLook.set(0, 1.9, 0);
  }
  const f = 1 - Math.exp(-dt * cam.k);
  cam.pos.lerp(cam.wantPos, f); cam.look.lerp(cam.wantLook, f);
  camera.position.copy(cam.pos);
  if (cam.shake > 0) { cam.shake = Math.max(0, cam.shake - dt * 2.5); camera.position.x += (Math.random() - 0.5) * cam.shake; camera.position.y += (Math.random() - 0.5) * cam.shake; }
  camera.lookAt(cam.look);
}
// drag to turn
let drag = null;
renderer.domElement.addEventListener("pointerdown", e => (drag = e.clientX));
addEventListener("pointerup", () => (drag = null));
addEventListener("pointermove", e => { if (drag === null) return; userYaw = Math.max(-1.3, Math.min(1.3, userYaw - (e.clientX - drag) * 0.006)); drag = e.clientX; if (camMode !== 0) shotWide(); });

// ---------- per-frame: billboards face the camera, idle bob, lunges ----------
const tmpV = new THREE.Vector3();
function screenX(v) { tmpV.copy(v).project(camera); return tmpV.x; }
function updateUnits(dt, t) {
  const foes = ctx ? ctx.foes : [];
  units.forEach(u => {
    const v = u.view; if (!v) return;
    const g = v.group;
    if (v.anim) {
      v.anim.t += dt / v.anim.dur;
      const k = Math.min(1, v.anim.t), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      g.position.lerpVectors(v.anim.from, v.anim.to, v.anim.back ? (k < 0.5 ? e * 2 : (1 - k) * 2) : e);
      if (k >= 1) { if (v.anim.back) g.position.copy(v.anim.from); v.anim = null; }
    }
    v.mesh.rotation.y = Math.atan2(camera.position.x - g.position.x, camera.position.z - g.position.z);
    if (v.model) {
      const o = (u.side === "p" ? foes[0] : ctx && ctx.party[1]);
      if (o && o.view) v.model.rotation.y = Math.atan2(o.view.group.position.x - g.position.x, o.view.group.position.z - g.position.z) + MODEL_YAW + (v.yawFix || 0);
      v.model.scale.y = (1 + (v.mixer && v.clips.idle ? 0 : Math.sin(t * 2.2 + v.phase) * 0.02)) * v.alive + (1 - v.alive) * 0.6;
      v.model.rotation.z = (1 - v.alive) * 1.4;
      if (!v.mixer) {
        const k = v.anim ? Math.min(1, v.anim.t) : 0, arc = v.anim ? Math.sin(Math.PI * Math.min(1, k * 2)) : 0;
        v.inner.position.y = v.innerY + arc * v.h * 0.18;              // hop toward the target
        v.inner.rotation.z = -arc * 0.25;                                // lean forward (models face +x)
        v.hitT = Math.max(0, v.hitT - dt * 3);
        const sq = v.hitT * 0.14;
        v.model.scale.x = v.model.scale.z = 1 + sq * 0.5; v.model.scale.y *= 1 - sq;
        v.model.rotation.x = Math.sin(t * 40) * sq * 0.6;               // shudder when hit
      }
    }
    // face the other side on screen, whichever way the camera has turned
    const opp = u.side === "p" ? foes[0] : ctx && ctx.party[1];
    if (opp && opp.view) { const leftOfMe = screenX(opp.view.group.position) < screenX(g.position); v.mesh.scale.x = (leftOfMe === v.artFacesLeft ? 1 : -1); }
    const breathe = 1 + Math.sin(t * 2.2 + v.phase) * (u.boss ? 0.012 : 0.02);
    v.mesh.scale.y = breathe * v.alive + (1 - v.alive) * 0.15;
    v.mesh.material.opacity = 1;
    v.mesh.position.y = (1 - v.alive) * -v.h * 0.05;
    v.mesh.rotation.z = (1 - v.alive) * (u.side === "p" ? 1.2 : -1.2);
  });
  if (dust) { const p = dust.geometry.attributes.position; for (let i = 0; i < p.count; i++) { let y = p.getY(i) + dt * 0.25; if (y > 8) y = 0; p.setY(i, y); p.setX(i, p.getX(i) + Math.sin(t + i) * dt * 0.1); } p.needsUpdate = true; }
  torchLights.forEach((l, i) => (l.intensity = 1.4 + Math.sin(t * 9 + i * 2) * 0.25 + Math.random() * 0.15));
}

// ---------- HUD ----------
function buildParty() {
  $("party").innerHTML = ctx.party.map((u, i) => `<div class="pm" id="pm${i}"><div class="row"><span>${u.name}</span><span id="hp${i}"></span></div><div class="bar"><div class="fill" id="hb${i}"></div></div><div class="mp" id="mp${i}">${"<i></i>".repeat(10)}</div></div>`).join("");
  refresh();
}
function refresh(active) {
  const b = ctx.foes[0];
  $("bname").textContent = `${b.name}  Lv ${b.level}` + (b.phases ? `  ·  phase ${3 - b.phases.length}/3` : "");
  $("bhp").style.width = (100 * b.hp / b.maxHp) + "%";
  $("bbrk").textContent = b.broken ? "BROKEN! +50% damage" : "Break " + "◆".repeat(b.breakPts) + "◇".repeat(2 - b.breakPts) + "  (2 impact hits in a row)";
  $("bbrk").style.color = b.broken ? "#f2c14e" : "";
  ctx.party.forEach((u, i) => {
    $("hp" + i).textContent = `${u.hp}/${u.maxHp}`; $("hb" + i).style.width = (100 * u.hp / u.maxHp) + "%";
    [...$("mp" + i).children].forEach((d, k) => d.classList.toggle("on", k < u.mp));
    $("pm" + i).classList.toggle("active", u === active); $("pm" + i).classList.toggle("down", !u.alive);
  });
}
function float(u, s, color) {
  const v = u.view; tmpV.copy(v.group.position); tmpV.y += v.h * 0.85; tmpV.project(camera);
  const d = document.createElement("div"); d.className = "num"; d.textContent = s; d.style.color = color || "#f4e9d4";
  d.style.left = ((tmpV.x + 1) / 2 * innerWidth + (Math.random() - 0.5) * 40) + "px"; d.style.top = ((1 - tmpV.y) / 2 * innerHeight) + "px";
  document.body.appendChild(d);
  requestAnimationFrame(() => { d.style.transform = "translateY(-50px)"; d.style.opacity = "0"; });
  setTimeout(() => d.remove(), 1000);
}
function flashScreen(color, ms = 220) {
  const d = document.createElement("div"); Object.assign(d.style, { position: "fixed", inset: "0", background: color, opacity: "0.55", pointerEvents: "none", transition: `opacity ${ms}ms` });
  document.body.appendChild(d); requestAnimationFrame(() => (d.style.opacity = "0")); setTimeout(() => d.remove(), ms + 50);
}
function tint(u, hex, ms = 130) {
  if (u.view.model) { u.view.model.traverse(o => o.isMesh && o.material.emissive && o.material.emissive.set(hex).multiplyScalar(0.5)); setTimeout(() => u.view.model.traverse(o => o.isMesh && o.material.emissive && o.material.emissive.set(0)), ms); return; }
  const m = u.view.mesh.material; m.color.set(hex); setTimeout(() => m.color.set(ARENAS[arenaKey].tint), ms);
}
function playClip(u, name, speedUp = 1) {
  const v = u.view; if (!v.mixer) return false; const c = v.clips[name]; if (!c) return false;
  const a = v.mixer.clipAction(c); a.reset(); a.setLoop(name === "walk" ? THREE.LoopRepeat : THREE.LoopOnce, 1); a.clampWhenFinished = false; a.timeScale = speedUp; a.fadeIn(0.1).play();
  if (v.base && v.base !== a) { v.base.fadeOut(0.1); setTimeout(() => { a.fadeOut(0.15); v.base.reset().fadeIn(0.15).play(); }, Math.min(1400, c.duration * 1000 / speedUp) * SPEEDS[speed].f + 60); }
  return true;
}
function lunge(u, target, dist = 0.45, dur = 0.42) {
  if (!playClip(u, "slash", 1.4)) playClip(u, "walk", 2.2);
  const from = u.view.home.clone(), to = from.clone().lerp(target.view.home, dist); to.y = 0;
  u.view.anim = { from, to, t: 0, dur: dur * SPEEDS[speed].f + 0.05, back: true };
}

// ---------- battle playback with camera cuts ----------
const wait = ms => new Promise(r => setTimeout(r, Math.max(10, ms * SPEEDS[speed].f)));
let runId = 0;
async function play(id) {
  const evs = ctx.ev.splice(0);
  for (const e of evs) {
    if (id !== runId) return;
    if (e.t === "use") {
      $("log").textContent = `${e.src.name}: ${e.move}`;
      if (e.big) { shotLow(e.src); await wait(500); }
      else if (!e.basic && e.src.side === "p") { /* close-ups only for your creatures' special moves */ const tgt = e.tgt && e.tgt.view ? e.tgt : (e.src.side === "p" ? ctx.foes[0] : null); shotOn(e.src, tgt, e.src.boss ? 1.6 : 1); await wait(350); }
      const tgt = e.tgt && e.tgt.view && e.tgt.side !== e.src.side ? e.tgt : (e.src.side === "e" ? null : ctx.foes[0]);
      if (tgt && e.move !== "Potion" && !["Warm Light", "Rejuvenate", "Flame Ward", "Healing Wave", "Rebirth", "Challenge", "Fortify", "Counter Stance", "Shield Wall", "Labyrinth Roar", "Bloodrage"].includes(e.move)) lunge(e.src, tgt, e.src.boss ? 0.25 : 0.5);
      if (e.src.boss && !e.big) lunge(e.src, ctx.party[1], 0.18);
      await wait(e.basic ? 300 : 420);
    } else if (e.t === "dmg") {
      playClip(e.tgt, "hurt", 1.6); if (e.tgt.view) e.tgt.view.hitT = 1; tint(e.tgt, 0xff6060); cam.shake = Math.max(cam.shake, e.crit ? 0.18 : e.tgt.boss ? 0.05 : 0.09);
      float(e.tgt, (e.crit ? "CRIT " : "") + e.v + (e.absorbed ? ` (${e.absorbed} blocked)` : ""), e.crit ? "#f2c14e" : null);
      refresh(); await wait(280);
    } else if (e.t === "heal") { tint(e.tgt, 0x90ff90, 200); float(e.tgt, "+" + e.v, "#7ee081"); refresh(); await wait(260); }
    else if (e.t === "selfDmg") { float(e.tgt, "-" + e.v, "#ff6b57"); refresh(); await wait(200); }
    else if (e.t === "say") { $("log").textContent = e.text; await wait(450); }
    else if (e.t === "breakPt") { float(e.tgt, `Crack ${e.pts}/2`, "#f2c14e"); refresh(); await wait(260); }
    else if (e.t === "broken") { shotOn(e.tgt, null, 0.8); flashScreen("#ffd27a"); cam.shake = 0.25; $("log").textContent = `${e.tgt.name} is BROKEN!`; refresh(); await wait(900); }
    else if (e.t === "phase") { shotLow(e.tgt); flashScreen("#ff3b2a", 500); cam.shake = 0.35; $("log").textContent = e.text; refresh(); await wait(1700); }
    else if (e.t === "ko") { e.tgt.view.alive = 0; $("log").textContent = `${e.tgt.name} falls!`; refresh(); await wait(500); }
    else if (e.t === "revive") { e.tgt.view.alive = 1; tint(e.tgt, 0xffe080, 300); $("log").textContent = e.text || `${e.tgt.name} is back!`; refresh(); await wait(500); }
    else if (e.t === "telegraph") { shotLow(e.src); $("warn").textContent = "⚠ " + e.text; $("log").textContent = e.text; await wait(1100); }
  }
  if (!ctx.telegraph) $("warn").textContent = "";
}
async function fight() {
  const id = ++runId;
  setupFight(); shotWide(); introT = 3.2;
  $("log").textContent = "The sand rises. The Dune Bearer stands up!"; $("warn").textContent = "";
  await wait(3300);
  let res = null;
  while (!res && id === runId) {
    ctx.round++;
    for (const u of Core.turnOrder(ctx)) {
      if (!u.alive || id !== runId) continue;
      const n = Core.actionsFor(ctx, u);
      for (let a = 0; a < n && u.alive && !Core.outcome(ctx); a++) {
        if (u.side === "e") Core.enemyAct(ctx, u);
        else {
          refresh(u);
          if (u.hp / u.maxHp < 0.3 && potions > 0 && !u.usedItem && u.style !== "phoenix") { potions--; u.usedItem = true; Core.usePotion(ctx, u, u); }
          else { const c = Core.autoChoice(ctx, u); Core.useMove(ctx, u, c.move, c.target); }
        }
        await play(id);
      }
      Core.endTurn(ctx, u); await play(id);
      shotWide();
      if ((res = Core.outcome(ctx))) break;
    }
    Core.endRound(ctx); await play(id); res = res || Core.outcome(ctx); refresh();
  }
  if (id !== runId) return;
  $("log").textContent = res === "win" ? "Victory! The Dune Bearer sinks into the sand." : "Your team falls...";
  if (res === "win") { shotOn(ctx.party[1], null, 1.3); }
}

// ---------- controls and main loop ----------
$("bArena").onclick = () => { arenaKey = arenaKey === "desert" ? "temple" : "desert"; $("bArena").textContent = "Arena: " + ARENAS[arenaKey].name; buildArena(); };
$("bSpeed").onclick = () => { speed = (speed + 1) % SPEEDS.length; $("bSpeed").textContent = "Speed: " + SPEEDS[speed].n; };
$("bCam").onclick = () => { camMode = (camMode + 1) % CAM_MODES.length; cinematic = camMode === 1; $("bCam").textContent = "Camera: " + CAM_MODES[camMode]; shotWide(); };
$("bRestart").onclick = () => fight();
$("bModels").onclick = () => { useModels = !useModels; $("bModels").textContent = "Creatures: " + (useModels ? "3D models" : "Sprites"); fight(); };

const clock = new THREE.Clock();
function frame() {
  const dt = Math.min(0.05, clock.getDelta()), t = clock.elapsedTime;
  updateCamera(dt, t); updateUnits(dt, t);
  units.forEach(u => u.view && u.view.mixer && u.view.mixer.update(dt));
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
Promise.all(["floor_sand", "floor_stone", "pano_desert", "pano_temple", "duneBearer", "horncinder", "shellmund", "kitsuneva"].map(loadTex).concat(["horncinder", "shellmund", "kitsuneva", "duneBearer", "propPillar", "propHead", "propRuin"].map(loadModel))).then(() => {
  setupFight(); buildArena(); frame(); fight();
});
window.demo = { get ctx() { return ctx; }, cam, camera, view(p, l) { runId++; introT = 0; cinematic = true; wideMode = "shot"; cam.k = 3; cam.wantPos.set(...p); cam.wantLook.set(...l); } };
