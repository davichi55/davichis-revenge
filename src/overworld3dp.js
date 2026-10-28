// Option 4 overworld: a painted top-down ground (assets/ow3d/ground.png) is the map; 3D models stand on it.
// The walkable grid comes from the painting: water and rock edges were read from its colours (assets/ow3d/grid.json),
// the town walls, gates and temple court were measured on it (fractions of the painting below).
"use strict";
const GW = 44, GH = 30, T = 2, W = GW * T, H = GH * T;           // grid of 2-unit tiles over an 88 x 60 world
const fx = f => f * W, fz = f => f * H;
const TOWN = { x0: 0.046, x1: 0.33, z0: 0.075, z1: 0.415, gaps: { top: [0.177, 0.215], bottom: [0.177, 0.258], right: [0.22, 0.29] } };
const TEMPLE = { x0: 0.68, x1: 0.955, z0: 0.56, z1: 0.92 };
const OASIS = { x: 0.55, z: 0.18 };

// ---------- renderer, scene, camera, the painting's mood: low warm sun, long shadows, dusty haze ----------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x3a2014); scene.fog = new THREE.Fog(0x3a2014, 38, 95);
const camera = new THREE.PerspectiveCamera(40, 16 / 9, 0.1, 300);
function resize() { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
addEventListener("resize", resize); resize();
scene.add(new THREE.HemisphereLight(0xffe6c8, 0x6a4a30, 0.75), new THREE.AmbientLight(0xffffff, 0.25));
const sun = new THREE.DirectionalLight(0xffb070, 1.25);
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005;
Object.assign(sun.shadow.camera, { left: -32, right: 32, top: 32, bottom: -32, near: 1, far: 120 });
scene.add(sun, sun.target);

// ---------- the painted ground, with dark rock beyond its edges ----------
const tl = new THREE.TextureLoader();
const groundTex = tl.load("assets/ow3d/ground.png"); groundTex.anisotropy = 8;
const ground = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshLambertMaterial({ map: groundTex }));
ground.rotation.x = -Math.PI / 2; ground.position.set(W / 2, 0, H / 2); ground.receiveShadow = true; scene.add(ground);
const beyond = new THREE.Mesh(new THREE.PlaneGeometry(W + 160, H + 160), new THREE.MeshLambertMaterial({ color: 0x2c2018 }));
beyond.rotation.x = -Math.PI / 2; beyond.position.set(W / 2, -0.02, H / 2); scene.add(beyond);
const pano = new THREE.Mesh(new THREE.CylinderGeometry(130, 130, 60, 64, 1, true), new THREE.MeshBasicMaterial({ map: (() => { const t = tl.load("assets/pano_desert.png"); t.wrapS = THREE.MirroredRepeatWrapping; t.repeat.set(5, 1); return t; })(), side: THREE.BackSide, fog: false }));
pano.position.set(W / 2, 20, H / 2); scene.add(pano);

// ---------- walkable grid ----------
const SOLID = new Set(), key = (x, y) => x + "," + y, tileOf = v => [Math.floor(v.x / T), Math.floor(v.z / T)];
fetch("assets/ow3d/grid.json").then(r => r.json()).then(g => g.forEach((row, y) => row.forEach((t, x) => {
  if (t === "water" || t === "rock" || x === 0 || y === 0 || x === GW - 1 || y === GH - 1) SOLID.add(key(x, y));
})));
const blockWorld = (x, z) => SOLID.add(key(Math.floor(x / T), Math.floor(z / T)));
const blocked = (x, z) => { const tx = Math.floor(x / T), ty = Math.floor(z / T); return tx < 0 || ty < 0 || tx >= GW || ty >= GH || SOLID.has(key(tx, ty)); };

// ---------- models ----------
const gl = new THREE.GLTFLoader(), cache = {};
const load = f => cache[f] || (cache[f] = new Promise(res => gl.load(f, g => res(g), undefined, () => res(null))));
function fit(obj, height) {
  obj.updateMatrixWorld(true);
  let b = new THREE.Box3().setFromObject(obj); obj.scale.multiplyScalar(height / b.getSize(new THREE.Vector3()).y);
  obj.updateMatrixWorld(true); b = new THREE.Box3().setFromObject(obj);
  const c = b.getCenter(new THREE.Vector3()); obj.position.set(obj.position.x - c.x, obj.position.y - b.min.y, obj.position.z - c.z);
}
function dress(obj) { obj.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; if (o.material && "metalness" in o.material) { o.material = o.material.clone(); o.material.metalness = 0; o.material.roughness = 0.92; } } }); }
async function place(name, x, z, height, rotY = 0, solid = false) {
  const g = await load("assets/models/" + name + ".glb"); if (!g) return null;
  const obj = g.scene.clone(true); dress(obj); fit(obj, height);
  const h = new THREE.Group(); h.add(obj); h.position.set(x, 0, z); h.rotation.y = rotY; scene.add(h);
  if (solid) { const b = new THREE.Box3().setFromObject(h); for (let px = b.min.x + 0.3; px < b.max.x; px += T / 2) for (let pz = b.min.z + 0.3; pz < b.max.z; pz += T / 2) blockWorld(px, pz); }
  return h;
}
const rnd = (a, b) => { let n = a * 374761393 + b * 668265263; n = (n ^ (n >> 13)) * 1274126177; return ((n ^ (n >> 16)) >>> 0) / 4294967295; };
const P = "trellis/";

// town walls along the painted footing, with towers on the corners and arches in the three gaps
function wallLine(ax, az, bx, bz, gap, horizontal, jobs) {
  const len = horizontal ? bx - ax : bz - az, step = 3.2, n = Math.round(len / step);
  for (let i = 0; i < n; i++) {
    const f = (i + 0.5) / n, x = horizontal ? ax + f * len : ax, z = horizontal ? az : az + f * len;
    const along = horizontal ? x / W : z / H;
    if (gap && along > gap[0] && along < gap[1]) continue;
    jobs.push(place(P + "wallSeg", x, z, 2.3, horizontal ? 0 : Math.PI / 2, true));
  }
  if (gap) { const mid = (gap[0] + gap[1]) / 2; jobs.push(place(P + "gateArch", horizontal ? fx(mid) : ax, horizontal ? az : fz(mid), 4.2, horizontal ? 0 : Math.PI / 2)); }
}
const npcs = [];
async function buildWorld() {
  const jobs = [], x0 = fx(TOWN.x0), x1 = fx(TOWN.x1), z0 = fz(TOWN.z0), z1 = fz(TOWN.z1);
  wallLine(x0, z0, x1, z0, TOWN.gaps.top, true, jobs); wallLine(x0, z1, x1, z1, TOWN.gaps.bottom, true, jobs);
  wallLine(x0, z0, x0, z1, null, false, jobs); wallLine(x1, z0, x1, z1, TOWN.gaps.right, false, jobs);
  [[x0, z0], [x1, z0], [x0, z1], [x1, z1]].forEach(([x, z], i) => jobs.push(place(P + "tower", x, z, 5, i * 0.4, true)));
  // inside the walls: buildings, the well, market life
  jobs.push(place(P + "inn", 9.5, 9.5, 6.2, 0.15, true), place(P + "stall", 23, 9, 3.4, -0.1, true), place(P + "house", 24.5, 20.5, 3.6, -0.5, true));
  jobs.push(place(P + "well", 16, 15, 1.8, 0, true), place(P + "tent", 8.5, 20.5, 3.2, 0.6, true));
  [[13, 8.5, "crates"], [20.5, 8.2, "pots"], [6.6, 14, "pots"], [26.5, 6.8, "crates"], [12, 22.5, "rubble"], [26.5, 11.5, "pots"]].forEach(([x, z, n]) => jobs.push(place(P + n, x, z, n === "rubble" ? 0.9 : 1.2, rnd(x, z) * 6, true)));
  [[fx(0.196), z0 - 1.6], [fx(0.217), z1 + 1.6], [x1 + 1.6, fz(0.255)]].forEach(([x, z]) => jobs.push(place(P + "banner", x, z, 4.4, 0, true)));
  // townspeople
  [["mentor", 13.5, 17, "Mentor"], ["innkeeper", 11.5, 12.6, "Innkeeper"], ["merchant", 22.5, 11.6, "Merchant"], ["scholar", 19.5, 19.5, "Wandering scholar"]]
    .forEach(([f, x, z, name]) => jobs.push(place(P + f, x, z, 1.85, 0, true).then(h => h && npcs.push({ h, name }))));
  // palms ringing the oasis, bushes and cacti over the open sand
  for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2 + 0.3, r = 9.5 + rnd(i, 3) * 2.5; jobs.push(place(P + "palm", fx(OASIS.x) + Math.cos(a) * r * 1.15, fz(OASIS.z) + Math.sin(a) * r * 0.8, 5 + rnd(i, 7) * 2, rnd(i, 9) * 6, true)); }
  for (let i = 0; i < 46; i++) {
    const x = 4 + rnd(i, 11) * (W - 8), z = 4 + rnd(i, 13) * (H - 8);
    if (x < fx(TOWN.x1) + 3 && z < fz(TOWN.z1) + 3) continue;
    if (x > fx(TEMPLE.x0) - 2 && z > fz(TEMPLE.z0) - 2) continue;
    if (Math.hypot((x - fx(OASIS.x)) / 1.15, (z - fz(OASIS.z)) / 0.8) < 12) continue;
    const kind = i % 3 === 0 ? "cactus" : "rubble";   // the dry-bush model renders as a black blob, so loose stones instead
    jobs.push(place(P + kind, x, z, kind === "cactus" ? 2 + rnd(i, 5) * 1.4 : 0.5 + rnd(i, 5) * 0.5, rnd(i, 17) * 6, kind === "cactus"));
  }
  // the temple court: pillars on its corners, the ruin at the back, the fallen head and rubble
  const tx0 = fx(TEMPLE.x0), tx1 = fx(TEMPLE.x1), tz0 = fz(TEMPLE.z0), tz1 = fz(TEMPLE.z1);
  [[tx0 + 1.5, tz0 + 1.5], [tx1 - 1.5, tz0 + 1.5], [tx0 + 1.5, tz1 - 1.5]].forEach(([x, z], i) => jobs.push(place("propPillar_static", x, z, 6 - i * 0.6, i * 1.3, true)));
  jobs.push(place("propRuin_static", (tx0 + tx1) / 2 + 3, tz1 - 3, 6.5, 0, true), place("propHead_static", tx1 - 4, tz1 - 4, 3, -0.9, true));
  jobs.push(place(P + "rubble", tx0 + 6, tz0 + 9, 1, 2, true), place(P + "rubble", tx1 - 6, tz0 + 4, 0.8, 4, true));
  await Promise.all(jobs);
  clearGates();
}
// keep a free path through every gate, whatever props ended up near it
function clearGates() {
  const free = (x, z) => SOLID.delete(key(Math.floor(x / T), Math.floor(z / T)));
  const g = TOWN.gaps, x1 = fx(TOWN.x1), z0 = fz(TOWN.z0), z1 = fz(TOWN.z1);
  for (let d = -5; d <= 5; d += 0.5) {
    for (let s = fx(g.top[0]) + 0.6; s < fx(g.top[1]) - 0.6; s += 0.5) free(s, z0 + d);
    for (let s = fx(g.bottom[0]) + 0.6; s < fx(g.bottom[1]) - 0.6; s += 0.5) free(s, z1 + d);
    for (let s = fz(g.right[0]) + 0.6; s < fz(g.right[1]) - 0.6; s += 0.5) free(x1 + d, s);
  }
}

// ---------- hero: rigged Tripo model with idle and walk ----------
const hero = { pos: new THREE.Vector3(16.5, 0, 17.5), yaw: 0, holder: new THREE.Group(), mixer: null, idle: null, walk: null, moving: false };
scene.add(hero.holder);
load("assets/models/hero.glb").then(g => {
  if (!g) return;
  const obj = g.scene; dress(obj);
  hero.mixer = new THREE.AnimationMixer(obj);
  g.animations.forEach(c => { const n = c.name.toLowerCase(); if (n.includes("idle")) hero.idle = hero.mixer.clipAction(c); if (n.includes("walk")) hero.walk = hero.mixer.clipAction(c); });
  (hero.idle || hero.walk).play(); hero.mixer.update(0); fit(obj, 1.9); hero.holder.add(obj);
});

// ---------- input ----------
const keys = {};
addEventListener("keydown", e => (keys[e.key.toLowerCase()] = true));
addEventListener("keyup", e => (keys[e.key.toLowerCase()] = false));
let pointer = null;
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
renderer.domElement.addEventListener("pointerdown", e => (pointer = e));
addEventListener("pointermove", e => { if (pointer) pointer = e; });
addEventListener("pointerup", () => (pointer = null));

// ---------- loop ----------
const clock = new THREE.Clock(), camPos = new THREE.Vector3(hero.pos.x, 13, hero.pos.z + 14), camLook = hero.pos.clone();
function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, clock.getDelta());
  let dx = (keys.arrowright || keys.d ? 1 : 0) - (keys.arrowleft || keys.a ? 1 : 0), dz = (keys.arrowdown || keys.s ? 1 : 0) - (keys.arrowup || keys.w ? 1 : 0);
  if (!dx && !dz && pointer) {
    ndc.set(pointer.clientX / innerWidth * 2 - 1, -(pointer.clientY / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObject(ground)[0];
    if (hit) { const v = hit.point.sub(hero.pos); v.y = 0; if (v.length() > 0.6) { dx = v.x; dz = v.z; } }
  }
  const len = Math.hypot(dx, dz), moving = len > 0;
  if (moving) {
    const sp = 7 * dt, mx = dx / len * sp, mz = dz / len * sp, r = 0.45;
    if (!blocked(hero.pos.x + mx + Math.sign(mx) * r, hero.pos.z)) hero.pos.x += mx;
    if (!blocked(hero.pos.x, hero.pos.z + mz + Math.sign(mz) * r)) hero.pos.z += mz;
    const want = Math.atan2(dx, dz) - Math.PI / 2;
    let d = want - hero.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); hero.yaw += d * Math.min(1, dt * 12);
  }
  if (moving !== hero.moving && hero.idle && hero.walk) { (moving ? hero.walk : hero.idle).reset().fadeIn(0.2).play(); (moving ? hero.idle : hero.walk).fadeOut(0.2); hero.moving = moving; }
  hero.holder.position.copy(hero.pos); hero.holder.rotation.y = hero.yaw;
  if (hero.mixer) hero.mixer.update(dt);
  camPos.lerp(new THREE.Vector3(hero.pos.x, 13, hero.pos.z + 14), 1 - Math.exp(-dt * 4));
  camLook.lerp(new THREE.Vector3(hero.pos.x, 1, hero.pos.z), 1 - Math.exp(-dt * 6));
  camera.position.copy(camPos); camera.lookAt(camLook);
  sun.position.set(hero.pos.x - 26, 22, hero.pos.z + 12); sun.target.position.copy(hero.pos);   // low sun: long evening shadows
  const near = npcs.find(n => n.h.position.distanceTo(hero.pos) < 3.2), lab = document.getElementById("label");
  if (near) { const p = near.h.position.clone(); p.y = 2.4; p.project(camera); lab.style.left = ((p.x + 1) / 2 * innerWidth) + "px"; lab.style.top = ((1 - p.y) / 2 * innerHeight) + "px"; lab.textContent = near.name; } else lab.textContent = "";
  renderer.render(scene, camera);
}
buildWorld(); frame();
setTimeout(() => (document.getElementById("area").style.opacity = "0"), 2500);
window.ow = { hero, camera, scene, SOLID };
