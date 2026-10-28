// Option 2: the whole outskirts area is ONE painted picture (assets/owpaint/map.png, 1376x768);
// the hero walks over it. All data below is in IMAGE pixels (1376x768) and scaled by S at runtime.
(function () {
  "use strict";
  const IMG_W = 1376, IMG_H = 768, S = 1920 / IMG_W;           // painting is shown at ~2x the 960x540 view
  const WORLD_W = Math.round(IMG_W * S), WORLD_H = Math.round(IMG_H * S);

  // Blocked areas: polygons [[x,y],...] in image pixels, placed by eye over the painting.
  // Press B in the demo to draw them as a red overlay.
  const BLOCKED = [
    // town: inn + tower + shop block along the north wall, and the lean-to awning
    [[95,215],[120,130],[195,40],[255,30],[300,0],[335,10],[335,50],[380,50],[470,110],[480,215],[400,222],[340,190],[262,205],[215,240],[130,242]],
    [[95,238],[170,238],[232,292],[205,322],[130,302]],
    // town walls + towers (west wall, south-west wall, gate block, south-east wall to the east tower, north-east wall)
    [[12,290],[12,170],[50,148],[78,160],[100,230],[72,300]],
    [[12,288],[48,232],[78,228],[278,322],[330,335],[332,445],[268,452],[190,385],[62,322]],
    [[385,262],[402,238],[474,252],[482,276],[440,302],[400,300]],
    [[480,240],[540,160],[604,160],[608,285],[560,272],[482,322]],
    [[335,50],[540,160],[540,200],[470,240],[470,130]],
    [[335,342],[375,328],[428,332],[428,402],[335,418]],
    [[1290,712],[1376,650],[1376,768],[1290,768]],
    // oasis: water + dense palms/reeds
    [[655,165],[690,125],[780,100],[1060,130],[1062,262],[1000,312],[910,332],[872,302],[760,292],[702,262]],
    // temple: stepped pyramid (doorway left open) and the three carved pillars
    [[1052,545],[1092,470],[1150,415],[1262,420],[1366,540],[1366,640],[1300,732],[1225,700],[1192,645],[1182,592],[1120,585],[1090,622],[1052,592]],
    [[964,510],[1016,500],[1018,630],[975,672],[940,625]],
    [[1070,372],[1112,372],[1112,520],[1070,525]],
    [[1228,572],[1282,572],[1282,742],[1228,742]],
    // big rocks
    [[0,462],[60,455],[200,545],[200,612],[0,612]],
    [[225,545],[385,535],[468,590],[440,640],[235,645]],
    [[780,740],[860,680],[960,742],[960,768],[780,768]],
    [[430,18],[525,18],[525,70],[430,70]],
    [[1230,195],[1376,195],[1376,420],[1260,420]],
    [[1215,0],[1376,0],[1376,90],[1215,90]],
  ];

  // "Front" pieces: crops of the painting drawn ABOVE the hero while he is north of baseY (walking behind them).
  // [x, y, w, h, baseY] in image pixels.
  const FRONT = [
    [90, 30, 390, 125, 150],      // inn + shop roofs
    [650, 25, 420, 170, 215],     // palm crowns
    [1088, 410, 175, 110, 505],   // pyramid top
    [1068, 368, 46, 80, 450],     // pillar top
  ];

  const NPCS = [
    { key: "innkeeper", x: 268, y: 262, name: "Innkeeper", line: "Rooms are cheap. Sleep is cheaper." },
    { key: "merchant", x: 396, y: 240, name: "Merchant", line: "Dune glass, scorpion salt. Take a look." },
    { key: "mentor", x: 330, y: 300, name: "Mentor", line: "Go to the Dune ruins. Record everything." },
    { key: "scholar", x: 215, y: 340, name: "Wandering scholar", line: "The temple door opens only at dusk." },
  ];
  const START = { x: 350, y: 262 };
  const WARP = { x: 1150, y: 672, r: 40 };   // temple doorway (demo only shows a message)

  function inPoly(px, py, poly) {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const a = poly[i], b = poly[j];
      if ((a[1] > py) !== (b[1] > py) && px < ((b[0] - a[0]) * (py - a[1])) / (b[1] - a[1]) + a[0]) c = !c;
    }
    return c;
  }
  // collision is tested at the hero's feet (image coords) with a small footprint
  function blocked(ix, iy) {
    if (ix < 14 || iy < 22 || ix > IMG_W - 14 || iy > IMG_H - 6) return true;
    const pts = [[0, 0], [-6, 0], [6, 0], [0, -4]];
    for (const p of pts) for (const poly of BLOCKED) if (inPoly(ix + p[0], iy + p[1], poly)) return true;
    return false;
  }

  class Scene extends Phaser.Scene {
    constructor() { super("ow"); }
    preload() {
      this.load.image("map", "assets/owpaint/map.png");
      ["hero", "mentor", "innkeeper", "merchant", "scholar"].forEach(k => this.load.image(k, "assets/" + k + ".png"));
    }
    create() {
      this.add.image(0, 0, "map").setOrigin(0).setDisplaySize(WORLD_W, WORLD_H).setDepth(0);
      const tex = this.textures.get("map");
      this.frontPieces = FRONT.map((f, i) => {
        const k = "front" + i;
        const cv = this.textures.createCanvas(k, f[2], f[3]);
        cv.context.drawImage(tex.getSourceImage(), f[0], f[1], f[2], f[3], 0, 0, f[2], f[3]); cv.refresh();
        const im = this.add.image(f[0] * S, f[1] * S, k).setOrigin(0).setDisplaySize(f[2] * S, f[3] * S).setDepth(4);
        return { im, baseY: f[4] };
      });
      this.npcs = NPCS.map(n => {
        const sp = this.add.image(n.x * S, n.y * S, n.key).setOrigin(0.5, 1).setDepth(3);
        return { ...n, sp };
      });
      this.hero = this.add.image(START.x * S, START.y * S, "hero").setOrigin(0.5, 1).setDepth(5);
      this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H).startFollow(this.hero, true, 0.15, 0.15);
      this.dbg = this.add.graphics().setDepth(900).setVisible(false);
      BLOCKED.forEach(p => {
        const pts = p.map(q => ({ x: q[0] * S, y: q[1] * S }));
        this.dbg.fillStyle(0xff0000, 0.3).lineStyle(2, 0xff0000, 0.8); this.dbg.fillPoints(pts, true); this.dbg.strokePoints(pts, true);
      });
      this.add.rectangle(0, 0, 960, 26, 0x0d0906, 0.78).setOrigin(0).setScrollFactor(0).setDepth(1000);
      this.add.text(10, 4, "Option 2 · Painted map", { fontFamily: "Georgia,serif", fontSize: "15px", color: "#f0c070" }).setScrollFactor(0).setDepth(1001);
      this.add.text(950, 6, "arrows/WASD or hold mouse · E talk · B debug", { fontFamily: "sans-serif", fontSize: "11px", color: "#b89a6a" }).setOrigin(1, 0).setScrollFactor(0).setDepth(1001);
      this.say = this.add.text(480, 500, "", { fontFamily: "Georgia,serif", fontSize: "16px", color: "#fff1d0", backgroundColor: "#1a1008", padding: { x: 12, y: 8 }, wordWrap: { width: 700 } }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(1001).setVisible(false);
      this.keys = this.input.keyboard.addKeys("UP,DOWN,LEFT,RIGHT,W,A,S,D,E,SPACE,B");
      this.keys.B.on("down", () => this.dbg.setVisible(!this.dbg.visible));
      const talk = () => { const n = this.near(); if (n) this.speak(n.name + ": " + n.line); };
      this.keys.E.on("down", talk); this.keys.SPACE.on("down", talk);
      this.input.on("pointerdown", p => {
        const w = p.positionToCamera(this.cameras.main);
        const n = this.npcs.find(n => Math.hypot(w.x - n.sp.x, w.y - n.sp.y + 24) < 30);
        if (n && Math.hypot(this.hero.x - n.sp.x, this.hero.y - n.sp.y) < 90) this.speak(n.name + ": " + n.line);
      });
    }
    near() { return this.npcs.find(n => Math.hypot(this.hero.x - n.sp.x, this.hero.y - n.sp.y) < 60); }
    speak(t) { this.say.setText(t).setVisible(true); this.sayT = this.time.now + 3200; }
    update(time, dt) {
      const k = this.keys; let dx = 0, dy = 0;
      if (k.LEFT.isDown || k.A.isDown) dx -= 1;
      if (k.RIGHT.isDown || k.D.isDown) dx += 1;
      if (k.UP.isDown || k.W.isDown) dy -= 1;
      if (k.DOWN.isDown || k.S.isDown) dy += 1;
      const p = this.input.activePointer;
      if (!dx && !dy && p.isDown && p.y > 26) {
        const w = p.positionToCamera(this.cameras.main), vx = w.x - this.hero.x, vy = w.y - this.hero.y, d = Math.hypot(vx, vy);
        if (d > 8) { dx = vx / d; dy = vy / d; }
      }
      const len = Math.hypot(dx, dy) || 1, sp = 190 * dt / 1000;
      const step = (ax, ay) => {
        const nx = this.hero.x + ax, ny = this.hero.y + ay;
        if (!blocked(nx / S, ny / S) && !this.npcs.some(n => Math.hypot(nx - n.sp.x, ny - n.sp.y) < 16)) { this.hero.x = nx; this.hero.y = ny; }
      };
      if (dx || dy) { step(dx / len * sp, 0); step(0, dy / len * sp); if (dx) this.hero.setFlipX(dx < 0); this.hero.setScale(1, 1 + Math.sin(time / 70) * 0.025); }
      const fy = this.hero.y / S;
      this.frontPieces.forEach(f => f.im.setDepth(fy < f.baseY ? 6 : 4));
      if (this.sayT && time > this.sayT) { this.say.setVisible(false); this.sayT = 0; }
      const dw = Math.hypot(fy - WARP.y, this.hero.x / S - WARP.x);
      if (dw < WARP.r && !this.warned) { this.warned = true; this.speak("The temple doorway. (Demo: the warp to the ruins would trigger here.)"); }
      if (dw > WARP.r * 2) this.warned = false;
    }
  }

  new Phaser.Game({
    type: Phaser.AUTO, parent: "g", width: 960, height: 540, backgroundColor: "#0d0906",
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: Scene,
  });
  window.__ow = { BLOCKED, FRONT, NPCS, blocked, S };
})();
