// Option 3 overworld: the outskirts map from maps.js rebuilt as a 3D world with the same models as the 3D battles.
// The tile grid stays the logic (collision, NPC spots); everything you see is 3D: sand floor, stone walls, TRELLIS props, a rigged Tripo hero.
"use strict";
const T = 2;                                   // world units per map tile
const m = Maps.build.outskirts();
const W = m.w * T, H = m.h * T;
const cx = x => x * T + T / 2, cz = y => y * T + T / 2;

// ---------- renderer, scene, camera ----------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x2a1610); scene.fog = new THREE.Fog(0x2a1610, 34, 90);
const camera = new THREE.PerspectiveCamera(40, 16 / 9, 0.1, 300);
function resize() { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
addEventListener("resize", resize); resize();

scene.add(new THREE.HemisphereLight(0xfff0dd, 0x6a4a30, 0.85), new THREE.AmbientLight(0xffffff, 0.35));
const sun = new THREE.DirectionalLight(0xffc690, 1.1);
sun.position.set(-20, 30, 14); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 90 });
scene.add(sun, sun.target);

const texLoader = new THREE.TextureLoader();
const tex = (file, rep) => { const t = texLoader.load(file); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); t.anisotropy = 4; return t; };

// ---------- ground: sand everywhere, stone in town, darker packed dirt on the road, water in the oasis ----------
const ground = new THREE.Mesh(new THREE.PlaneGeometry(W + 80, H + 80), new THREE.MeshLambertMaterial({ map: tex("assets/floor_sand.png", 22) }));
ground.rotation.x = -Math.PI / 2; ground.position.set(W / 2, 0, H / 2); ground.receiveShadow = true; scene.add(ground);
const pano = new THREE.Mesh(new THREE.CylinderGeometry(120, 120, 60, 64, 1, true), new THREE.MeshBasicMaterial({ map: (() => { const t = texLoader.load("assets/pano_desert.png"); t.wrapS = THREE.MirroredRepeatWrapping; t.repeat.set(5, 1); return t; })(), side: THREE.BackSide, fog: false }));
pano.position.set(W / 2, 18, H / 2); scene.add(pano);

const stoneTex = tex("assets/floor_stone.png", 1);
const roadMat = new THREE.MeshLambertMaterial({ color: 0xa0704a, transparent: true, opacity: 0.55 });
const townMat = new THREE.MeshLambertMaterial({ map: stoneTex });
const waterMat = new THREE.MeshPhongMaterial({ color: 0x2f7f9a, shininess: 90, specular: 0x88ccee, transparent: true, opacity: 0.88 });
const wallMat = new THREE.MeshLambertMaterial({ map: tex("assets/floor_sand.png", 1), color: 0xd8b48a });   // adobe walls
const tileGeo = new THREE.PlaneGeometry(T, T);
// one stone plaza under the whole camp (big slabs instead of one texture per tile)
const plazaTex = tex("assets/floor_stone.png", 1); plazaTex.repeat.set(5, 4);
const plaza = new THREE.Mesh(new THREE.PlaneGeometry(11 * T, 9 * T), new THREE.MeshLambertMaterial({ map: plazaTex, color: 0xcfb59a }));
plaza.rotation.x = -Math.PI / 2; plaza.position.set(3 * T + 11 * T / 2, 0.03, 3 * T + 9 * T / 2); plaza.receiveShadow = true; scene.add(plaza);
const SOLID = new Set();                         // "x,y" of blocked tiles
const water = [];
for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
  const t = m.g[y][x];
  const flat = mat => { const p = new THREE.Mesh(tileGeo, mat); p.rotation.x = -Math.PI / 2; p.position.set(cx(x), 0.02, cz(y)); p.receiveShadow = true; scene.add(p); return p; };
  if (t === "path" || t === "gate") flat(roadMat);
  else if (t === "water") { const w = flat(waterMat); w.position.y = 0.06; water.push(w); }
  if (t === "wall" || t === "ruin") {
    const b = new THREE.Mesh(new THREE.BoxGeometry(T, t === "wall" ? 1.3 : 2.4, T), wallMat);
    b.position.set(cx(x), (t === "wall" ? 1.3 : 2.4) / 2, cz(y)); b.castShadow = b.receiveShadow = true; scene.add(b);
  }
  if (Maps.SOLID.has(t)) SOLID.add(x + "," + y);
}

// ---------- models ----------
const gl = new THREE.GLTFLoader(), cache = {};
const load = f => cache[f] || (cache[f] = new Promise(res => gl.load(f, g => res(g), undefined, () => res(null))));
function fit(obj, height) {
  obj.updateMatrixWorld(true);
  let b = new THREE.Box3().setFromObject(obj); obj.scale.multiplyScalar(height / b.getSize(new THREE.Vector3()).y);
  obj.updateMatrixWorld(true); b = new THREE.Box3().setFromObject(obj);
  const c = b.getCenter(new THREE.Vector3()); obj.position.set(obj.position.x - c.x, obj.position.y - b.min.y, obj.position.z - c.z);
}
function dress(obj) { obj.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; if (o.material && "metalness" in o.material) { o.material = o.material.clone(); o.material.metalness = 0; o.material.roughness = 0.9; } } }); }
async function place(file, x, z, height, rotY = 0, solidTiles = []) {
  const g = await load(file); if (!g) return null;
  const obj = g.scene.clone(true); dress(obj); fit(obj, height);
  const holder = new THREE.Group(); holder.add(obj); holder.position.set(x, 0, z); holder.rotation.y = rotY; scene.add(holder);
  solidTiles.forEach(([tx, ty]) => SOLID.add(tx + "," + ty));
  return holder;
}
const M = "assets/models/";
const hash = (x, y) => { let n = x * 374761393 + y * 668265263; n = (n ^ (n >> 13)) * 1274126177; return ((n ^ (n >> 16)) >>> 0) / 4294967295; };

async function buildWorld() {
  const jobs = [];
  // buildings sit on the old roof/wall tiles of the inn and the shop
  jobs.push(place(M + "trellis/inn.glb", cx(5.5), cz(4.2), 6.2, 0));
  jobs.push(place(M + "trellis/stall.glb", cx(10.5), cz(4.4), 3.6, 0));
  jobs.push(place(M + "trellis/house.glb", cx(12.3), cz(10), 3.6, -0.6, [[12, 10], [13, 10]]));
  jobs.push(place(M + "trellis/well.glb", cx(8.5), cz(8.5), 1.8, 0, [[8, 8]]));
  jobs.push(place(M + "trellis/tent.glb", cx(3.6), cz(10.2), 3.2, 0.5, [[3, 10], [4, 10]]));
  // desert plants from the map, a little random size and turn
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
    const t = m.g[y][x], r = hash(x, y);
    if (t === "palm") jobs.push(place(M + "trellis/palm.glb", cx(x), cz(y), 5 + r * 2, r * 6));
    if (t === "cactus") jobs.push(place(M + "trellis/cactus.glb", cx(x), cz(y), 2.2 + r * 1.4, r * 6));
  }
  // the ruined temple entrance in the south-east
  jobs.push(place(M + "propRuin_static.glb", cx(33), cz(27.5), 6, 0));
  jobs.push(place(M + "propPillar_static.glb", cx(30), cz(23), 6, 0.4));
  jobs.push(place(M + "propPillar_static.glb", cx(36), cz(23), 5, 2.2));
  jobs.push(place(M + "propHead_static.glb", cx(38), cz(19), 3, -0.8, [[38, 19], [37, 19]]));
  jobs.push(place(M + "propPillar_static.glb", cx(22), cz(15), 4.5, 1.1, [[22, 15]]));
  // townspeople
  const PEOPLE = { mentor: "Mentor", inn: "Innkeeper", shop: "Merchant", scholar: "Wandering scholar" };
  const FILE = { mentor: "mentor", inn: "innkeeper", shop: "merchant", scholar: "scholar" };
  m.npcs.forEach(n => jobs.push(place(M + "trellis/" + FILE[n.id] + ".glb", cx(n.x), cz(n.y), 1.85, 0).then(h => { if (h) npcs.push({ h, name: PEOPLE[n.id] }); })));
  await Promise.all(jobs);
}
const npcs = [];

// ---------- hero: rigged Tripo model with idle and walk ----------
const hero = { pos: new THREE.Vector3(cx(G0().x), 0, cz(G0().y)), yaw: 0, holder: new THREE.Group(), mixer: null, idle: null, walk: null, moving: false };
function G0() { return m.start; }
scene.add(hero.holder); hero.holder.position.copy(hero.pos);
load(M + "hero.glb").then(g => {
  if (!g) return;
  const obj = g.scene; dress(obj);
  hero.mixer = new THREE.AnimationMixer(obj);
  g.animations.forEach(c => { const n = c.name.toLowerCase(); if (n.includes("idle")) hero.idle = hero.mixer.clipAction(c); if (n.includes("walk")) hero.walk = hero.mixer.clipAction(c); });
  (hero.idle || hero.walk).play(); hero.mixer.update(0);
  fit(obj, 1.9); hero.holder.add(obj);
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
const blocked = (x, z) => { const tx = Math.floor(x / T), ty = Math.floor(z / T); return tx < 0 || ty < 0 || tx >= m.w || ty >= m.h || SOLID.has(tx + "," + ty); };

// ---------- loop ----------
const clock = new THREE.Clock(), camPos = new THREE.Vector3(), camLook = new THREE.Vector3();
function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, clock.getDelta()), t = clock.elapsedTime;
  // movement: keys, or toward the held pointer on the ground
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
    const want = Math.atan2(dx, dz) - Math.PI / 2;      // Tripo models face +x
    let d = want - hero.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); hero.yaw += d * Math.min(1, dt * 12);
  }
  if (moving !== hero.moving && hero.idle && hero.walk) {
    (moving ? hero.walk : hero.idle).reset().fadeIn(0.2).play(); (moving ? hero.idle : hero.walk).fadeOut(0.2);
    hero.moving = moving;
  }
  hero.holder.position.copy(hero.pos); hero.holder.rotation.y = hero.yaw;
  if (hero.mixer) hero.mixer.update(dt);
  // camera: angled from the south, following the hero smoothly
  camPos.lerp(new THREE.Vector3(hero.pos.x, 13, hero.pos.z + 14), 1 - Math.exp(-dt * 4));
  camLook.lerp(new THREE.Vector3(hero.pos.x, 1, hero.pos.z), 1 - Math.exp(-dt * 6));
  camera.position.copy(camPos); camera.lookAt(camLook);
  sun.position.set(hero.pos.x - 20, 30, hero.pos.z + 14); sun.target.position.copy(hero.pos);
  // water shimmer and swaying palms
  water.forEach((w, i) => (w.material.opacity = 0.84 + Math.sin(t * 2 + i) * 0.04));
  // name of the nearest townsperson
  const near = npcs.find(n => n.h.position.distanceTo(hero.pos) < 3.2), lab = document.getElementById("label");
  if (near) { const p = near.h.position.clone(); p.y = 2.4; p.project(camera); lab.style.left = ((p.x + 1) / 2 * innerWidth) + "px"; lab.style.top = ((1 - p.y) / 2 * innerHeight) + "px"; lab.textContent = near.name; } else lab.textContent = "";
  renderer.render(scene, camera);
}
camPos.set(hero.pos.x, 13, hero.pos.z + 14); camLook.copy(hero.pos);
buildWorld();
frame();
setTimeout(() => (document.getElementById("area").style.opacity = "0"), 2500);
window.ow = { hero, camera, scene };
