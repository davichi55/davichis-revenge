// Atmosphere on the painted maps (Danny 2026-10-31, after the painted-backgrounds research, cc-playground/research/painted-backgrounds.md):
//   1. a colour grade per map (camera ColorMatrix: saturation, contrast, a small hue turn; WebGL only)
//   2. bloom on light sources (a wide soft halo round every fire/lamp glow, crystals and glow-shrooms)
//   3. drifting fog banks above the scene and slow cloud shadows on the ground
//   4. a foreground parallax frame (leaves in the jungle, mist wisps in swamps, caves and crypts) that slides faster than the ground
// The mood comes from the map's music key (MOODS below); a map can override any part with amb.mood = { grade, fog, clouds, parallax, bloom }.
// Menu > System "Atmosphere" (G.atmos) turns all of it off. The engine calls Atmos.build(scene) once and Atmos.update(scene, time, dt) every frame.
(function () {
  const World = window.World = window.World || {};
  const A = World.Atmos = {};
  //            grade: [saturation, contrast, hue degrees]; fog: [colour, alpha, banks] | null; clouds: shadow alpha | 0; parallax: "leaves" | "mist" | null; bloom: halo strength
  const FAM = {
    desert:  { grade: [0.12, 0.06, -3], fog: null, clouds: 0.13, parallax: null, bloom: 1 },
    green:   { grade: [0.16, 0.04, 0], fog: [0xf2f6e8, 0.07, 3], clouds: 0.11, parallax: null, bloom: 1 },
    jungle:  { grade: [0.14, 0.08, 4], fog: [0xd8f0d0, 0.09, 4], clouds: 0, parallax: "leaves", bloom: 1.1 },
    swamp:   { grade: [-0.12, 0.05, 8], fog: [0xcfe4dc, 0.12, 5], clouds: 0, parallax: "mist", bloom: 1.1 },
    sea:     { grade: [0.14, 0.05, 0], fog: [0xe8f4ff, 0.06, 3], clouds: 0.12, parallax: null, bloom: 1 },
    cave:    { grade: [-0.14, 0.12, 0], fog: [0x8a96a8, 0.08, 4], clouds: 0, parallax: "mist", bloom: 1.4 },
    ruins:   { grade: [-0.05, 0.08, -6], fog: [0xd8d0ff, 0.07, 3], clouds: 0.1, parallax: null, bloom: 1.2 },
    fire:    { grade: [0.1, 0.12, -8], fog: [0x5a4038, 0.12, 4], clouds: 0, parallax: null, bloom: 1.3 },
    town:    { grade: [0.08, 0.05, -2], fog: null, clouds: 0.1, parallax: null, bloom: 1.1 },
    storm:   { grade: [-0.22, 0.1, 6], fog: [0xc8d0dc, 0.12, 5], clouds: 0.18, parallax: "mist", bloom: 1 },
    crypt:   { grade: [-0.2, 0.1, 10], fog: [0xb8c8d8, 0.1, 4], clouds: 0, parallax: "mist", bloom: 1.4 },
  };
  const MUSIC = {
    desert: "desert", dunes: "desert", desert2: "desert", desert3: "desert", kharam: "desert", arenaCity: "town", provinces: "desert", warfront: "desert", raid: "town",
    oasis: "green", river: "green", marigold: "green", orchardTown: "green", pilgrimTown: "green", hope: "green",
    jungle: "jungle", canopy: "jungle", treetopTown: "jungle", aviary: "jungle", roots: "jungle", rebelCamp: "jungle",
    shore: "swamp", fishingTown: "swamp", drowned: "swamp",
    sea: "sea", harbour: "sea", voyage: "sea",
    dungeon: "cave", sporeCave: "cave", vault: "cave", mines: "cave", seaCave: "cave", sewer: "cave", underworld: "cave", deepTrench: "cave", prison: "cave",
    ruins: "ruins", pyramid: "ruins", greatPyramid: "ruins", sanctum: "ruins", starfall: "ruins",
    volcano: "fire",
    town: "town", capital: "town", palace: "town", fort: "town", occupied: "town", mourningTown: "crypt", bastion: "town",
    stormPeak: "storm", crypt: "crypt",
  };
  A.moodOf = R => {
    const fam = FAM[MUSIC[R.music] || (R.dark ? "cave" : "town")] || FAM.town, o = (R.amb && R.amb.mood) || {};
    const m = Object.assign({}, fam, o);
    if (R.dark) { m.clouds = 0; }   // dark maps are lit by their own lights: no sun, no cloud shadows
    if (R.boat) { m.parallax = null; }
    return m;
  };
  A.on = () => { try { return G.atmos !== false; } catch (e) { return true; } };

  function tex(sc) {
    const mk = (key, w, h, draw) => { if (sc.textures.exists(key)) return; const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h); sc.textures.addCanvas(key, c); };
    mk("atm_fog", 256, 128, (x, w, h) => { const g = x.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2); g.addColorStop(0, "rgba(255,255,255,0.9)"); g.addColorStop(0.5, "rgba(255,255,255,0.45)"); g.addColorStop(1, "rgba(255,255,255,0)"); x.save(); x.scale(1, h / w); x.fillStyle = g; x.fillRect(0, 0, w, w); x.restore(); });
    mk("atm_cloud", 256, 160, (x, w, h) => { for (let i = 0; i < 7; i++) { const cx = 50 + Math.random() * 156, cy = 45 + Math.random() * 70, r = 34 + Math.random() * 30, g = x.createRadialGradient(cx, cy, 2, cx, cy, r); g.addColorStop(0, "rgba(0,0,0,0.55)"); g.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = g; x.fillRect(0, 0, w, h); } });
    mk("atm_halo", 128, 128, (x, w, h) => { const g = x.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2); g.addColorStop(0, "rgba(255,240,210,0.6)"); g.addColorStop(0.3, "rgba(255,220,170,0.22)"); g.addColorStop(1, "rgba(255,200,140,0)"); x.fillStyle = g; x.fillRect(0, 0, w, h); });
    mk("atm_leaves", 220, 150, (x, w, h) => {   // a dark cluster of broad leaves seen from below, for the top and bottom edges of jungle maps
      for (let i = 0; i < 9; i++) { const cx = 20 + Math.random() * 180, cy = 20 + Math.random() * 110, a = Math.random() * 6.28, L = 40 + Math.random() * 34; x.save(); x.translate(cx, cy); x.rotate(a);
        x.fillStyle = i % 3 ? "rgba(10,26,12,0.92)" : "rgba(18,40,20,0.9)"; x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(L * 0.5, -L * 0.32, L, 0); x.quadraticCurveTo(L * 0.5, L * 0.32, 0, 0); x.fill();
        x.strokeStyle = "rgba(40,70,36,0.6)"; x.lineWidth = 1.5; x.beginPath(); x.moveTo(2, 0); x.lineTo(L - 4, 0); x.stroke(); x.restore(); } });
    mk("atm_wisp", 300, 90, (x, w, h) => { for (let i = 0; i < 6; i++) { const cx = 40 + Math.random() * 220, cy = 30 + Math.random() * 30, r = 30 + Math.random() * 40, g = x.createRadialGradient(cx, cy, 2, cx, cy, r); g.addColorStop(0, "rgba(255,255,255,0.5)"); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.fillRect(0, 0, w, h); } });
  }
  const LIGHT_KEYS = /crystal|glowShroom|Lantern|lantern|Lamp|lamp|Brazier|brazier|torch|Torch|candle|Candle|campfire|FirePit|CookFire|iceSpire|lanternBuoy/;

  A.build = sc => {
    A.clear(sc); if (!A.on()) return;
    try {
      tex(sc); const R = sc.R, m = A.moodOf(R), st = sc.atmos = { m, fog: [], clouds: [], frame: [], halos: [], fx: null };
      sc.events.once("shutdown", () => A.clear(sc));
      // 1. colour grade
      if (m.grade && sc.renderer && sc.renderer.type === Phaser.WEBGL && sc.cameras.main.postFX) {
        const cm = sc.cameras.main.postFX.addColorMatrix(); cm.saturate(m.grade[0], true); if (m.grade[1]) cm.contrast(m.grade[1], true); /* Phaser adds 1 itself: 0 = unchanged */ if (m.grade[2]) cm.hue(m.grade[2], true); st.fx = cm;
      }
      // 2. bloom: a wide soft halo round lights
      const k = m.bloom || 1;
      for (const f of sc.fires || []) { const h = sc.add.image(f.x, f.y, "atm_halo").setBlendMode(Phaser.BlendModes.ADD).setDepth(8001).setScale(2.6 * (f.k || 1) * k).setAlpha(0.32); st.halos.push({ s: h, ph: Math.random() * 6.28, a: 0.32 }); }
      for (const s of sc.children.list) if (s.type === "Image" && s.texture && LIGHT_KEYS.test(s.texture.key) && !(sc.fires || []).some(f => Math.abs(f.x - s.x) < 30 && Math.abs(f.y - s.y) < 90)) {
        const blue = /crystal|Shroom|ice|Buoy/i.test(s.texture.key), h = sc.add.image(s.x, s.y - s.displayHeight * 0.55, "atm_halo").setBlendMode(Phaser.BlendModes.ADD).setDepth(8001).setScale(Math.max(1.2, s.displayHeight / 50) * k).setAlpha(0.26);
        if (blue) h.setTint(0x9fe0ff); st.halos.push({ s: h, ph: Math.random() * 6.28, a: 0.26, src: s }); }
      // 3. fog banks (above everything on the map) and cloud shadows (on the ground, under the sprites)
      if (m.fog) for (let i = 0; i < m.fog[2]; i++) { const s = sc.add.image(0, 0, "atm_fog").setTint(m.fog[0]).setDepth(8950).setScale(3.2 + Math.random() * 1.8, 2.2 + Math.random()).setAlpha(m.fog[1]);
        st.fog.push({ s, x: Math.random() * 1400, y: Math.random() * 700, vx: 6 + Math.random() * 9, ph: Math.random() * 6.28 }); }
      if (m.clouds) for (let i = 0; i < 3; i++) { const s = sc.add.image(0, 0, "atm_cloud").setDepth(1).setScale(4 + Math.random() * 2.5, 3 + Math.random() * 1.5).setAlpha(m.clouds).setBlendMode(Phaser.BlendModes.MULTIPLY);
        st.clouds.push({ s, x: Math.random() * 1800, y: Math.random() * 1000, vx: 10 + Math.random() * 7, vy: 3 + Math.random() * 3 }); }
      // 4. foreground parallax frame: slides along the top and bottom edges 30% faster than the ground
      if (m.parallax) { const key = m.parallax === "leaves" ? "atm_leaves" : "atm_wisp", n = 7;
        for (let i = 0; i < n; i++) { const top = i % 2 === 0, s = sc.add.image(0, 0, key).setScrollFactor(0).setDepth(9450).setScale(m.parallax === "leaves" ? 1.6 + Math.random() * 0.6 : 2 + Math.random()).setFlipX(Math.random() < 0.5).setFlipY(top && m.parallax === "leaves").setAlpha(m.parallax === "leaves" ? 0.95 : 0.13);
          st.frame.push({ s, bx: i * (1360 / n) + Math.random() * 60, top, dy: top ? -30 - Math.random() * 30 : 540 + 20 + Math.random() * 30 }); } }
    } catch (e) { console.warn("atmos", e); }
  };
  A.clear = sc => {
    const st = sc.atmos; sc.atmos = null; if (!st) return;
    try { if (st.fx && sc.cameras.main.postFX) sc.cameras.main.postFX.remove(st.fx); } catch (e) { /* ignore */ }
    for (const list of [st.fog, st.clouds, st.frame, st.halos]) for (const o of list) try { o.s.destroy(); } catch (e) { /* ignore */ }
  };
  A.update = (sc, time, dt) => {
    const st = sc.atmos; if (!st) return; const v = sc.cameras.main.worldView, cam = sc.cameras.main;
    for (const f of st.fog) { f.x += f.vx * dt; const px = v.x + ((f.x - v.x * 0.2) % 1600 + 1600) % 1600 - 320, py = v.y + ((f.y + Math.sin(time * 0.0002 + f.ph) * 30) % 760 + 760) % 760 - 110; f.s.setPosition(Math.round(px), Math.round(py)); }
    for (const c of st.clouds) { c.x += c.vx * dt; c.y += c.vy * dt; c.s.setPosition(Math.round(v.x + ((c.x - v.x * 0.1) % 2000 + 2000) % 2000 - 500), Math.round(v.y + ((c.y - v.y * 0.1) % 1200 + 1200) % 1200 - 330)); }
    for (const h of st.halos) { if (h.src && !h.src.visible) { h.s.setVisible(false); continue; } h.s.setVisible(true).setAlpha(h.a * (0.8 + 0.2 * Math.sin(time * 0.002 + h.ph))); }
    for (const p of st.frame) { const x = ((p.bx - cam.scrollX * 1.3) % 1360 + 1360) % 1360 - 200, y = p.dy + (p.top ? -1 : 1) * (((cam.scrollY * 0.3) % 30 + 30) % 30); p.s.setPosition(Math.round(x), Math.round(y)); }
  };
})();
