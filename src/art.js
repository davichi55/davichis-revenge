// Placeholder pixel art, drawn in code until the real sprites are picked.
// Every sprite is drawn on a small canvas (1 unit = 1 pixel) and gets an automatic dark outline.
(function (root) {
  "use strict";
  const OUT = "#1b1420";

  function make(scene, key, w, h, draw, outline = true) {
    if (scene.textures.exists(key)) return;   // real art (assets/*.png) wins over the placeholder
    const tex = scene.textures.createCanvas(key, w, h), ctx = tex.getContext();
    ctx.imageSmoothingEnabled = false;
    const p = (x, y, ww, hh, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(ww), Math.round(hh)); };
    const disc = (cx, cy, r, c) => { for (let y = -r; y <= r; y++) { const half = Math.floor(Math.sqrt(r * r - y * y) + 0.3); p(cx - half, cy + y, half * 2 + 1, 1, c); } };
    const oval = (cx, cy, rx, ry, c) => { for (let y = -ry; y <= ry; y++) { const half = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry))) + 0.3); p(cx - half, cy + y, half * 2 + 1, 1, c); } };
    draw(p, disc, oval, ctx);
    if (outline) {
      const img = ctx.getImageData(0, 0, w, h), d = img.data, solid = (x, y) => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 0;
      const marks = [];
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (!solid(x, y) && (solid(x + 1, y) || solid(x - 1, y) || solid(x, y + 1) || solid(x, y - 1))) marks.push([x, y]);
      marks.forEach(([x, y]) => p(x, y, 1, 1, OUT));
    }
    tex.refresh();
  }

  // ---------- battle creatures (40 x 36, party faces left) ----------
  function creatures(scene) {
    make(scene, "horncinder", 40, 36, (p, disc, oval) => {
      p(30, 12, 6, 3, "#3f7a3a"); p(35, 9, 3, 4, "#3f7a3a"); p(36, 8, 2, 2, "#e8d24a");        // serpent tail
      oval(21, 20, 12, 8, "#8e3b24"); oval(21, 23, 10, 4, "#a8492c");                         // body
      p(11, 25, 4, 9, "#6b2a18"); p(17, 26, 4, 8, "#6b2a18"); p(25, 26, 4, 8, "#6b2a18"); p(30, 25, 4, 9, "#6b2a18");
      p(11, 32, 4, 2, "#2a1a14"); p(17, 32, 4, 2, "#2a1a14"); p(25, 32, 4, 2, "#2a1a14"); p(30, 32, 4, 2, "#2a1a14");
      oval(8, 17, 6, 5, "#a8492c"); p(2, 18, 5, 4, "#c8735a"); p(3, 19, 1, 1, OUT);             // head and snout
      p(6, 15, 2, 2, "#ffd866");                                                               // eye
      p(4, 10, 2, 5, "#efe2c2"); p(2, 8, 3, 3, "#efe2c2"); p(11, 10, 2, 5, "#efe2c2"); p(12, 8, 3, 3, "#efe2c2"); // horns
      oval(24, 10, 4, 3, "#c9b28a"); p(21, 5, 2, 4, "#efe2c2"); p(26, 5, 2, 4, "#efe2c2"); p(23, 10, 1, 1, OUT); // goat head
      p(14, 12, 3, 3, "#ff8a3d"); p(17, 11, 2, 2, "#ffb347");                                  // ember mane
    });
    make(scene, "shellmund", 40, 36, (p, disc, oval) => {
      oval(22, 18, 15, 11, "#5b6b52"); oval(22, 16, 12, 8, "#6f8063");                       // shell
      p(16, 13, 3, 3, "#2c3328"); p(25, 13, 3, 3, "#2c3328"); p(19, 19, 6, 2, "#2c3328");     // carved troll face
      p(17, 14, 1, 1, "#7fe0c8"); p(26, 14, 1, 1, "#7fe0c8");                                 // glowing eyes
      p(11, 11, 2, 2, "#7fe0c8"); p(33, 12, 2, 2, "#7fe0c8"); p(22, 8, 2, 2, "#7fe0c8");      // runes
      oval(5, 22, 5, 4, "#8a9a72"); p(2, 21, 2, 2, "#ffd866"); p(1, 24, 4, 1, "#3b4a32");     // head
      p(10, 27, 6, 7, "#7a8a62"); p(28, 27, 6, 7, "#7a8a62"); p(18, 28, 5, 6, "#7a8a62");
      p(12, 18, 3, 2, "#9bb07a"); p(30, 20, 3, 2, "#9bb07a");                                 // moss
    });
    make(scene, "kitsuneva", 40, 36, (p, disc, oval) => {
      const tails = [["#ff9a2e", 0], ["#ffc23d", 1], ["#ff6b2e", 2]];
      for (let i = 0; i < 9; i++) { const a = -1.2 + i * 0.3, x = 28 + Math.cos(a) * 9, y = 18 + Math.sin(a) * 11; oval(x, y, 3, 2, tails[i % 3][0]); p(x + 1, y - 1, 1, 1, "#fff2a8"); }
      oval(19, 23, 9, 6, "#f2e6d8"); oval(19, 21, 8, 4, "#e9873d");                          // body
      p(12, 27, 3, 7, "#e9873d"); p(17, 28, 3, 6, "#e9873d"); p(22, 28, 3, 6, "#e9873d");
      oval(9, 17, 5, 5, "#e9873d"); p(3, 18, 4, 3, "#f2e6d8"); p(3, 18, 1, 1, OUT);           // head
      p(7, 10, 3, 4, "#e9873d"); p(11, 10, 3, 4, "#e9873d"); p(8, 11, 1, 2, "#ffd0b0"); p(12, 11, 1, 2, "#ffd0b0");
      p(7, 16, 2, 2, "#3a2a5a");                                                               // eye
    });
  }

  // ---------- enemies (face right) ----------
  function enemies(scene) {
    make(scene, "duneBearer", 64, 60, (p, disc, oval) => {
      oval(34, 14, 18, 12, "#7a6a8a"); oval(34, 14, 14, 9, "#9a88b0");                        // sky-stone on the back
      p(26, 8, 2, 10, "#e8e0ff"); p(36, 6, 2, 12, "#e8e0ff"); p(30, 18, 10, 2, "#e8e0ff");    // cracks
      p(20, 22, 26, 22, "#c9a46a"); p(22, 24, 22, 4, "#a8844e");                              // torso
      p(24, 30, 4, 4, "#7a5a2e"); p(31, 30, 4, 4, "#7a5a2e"); p(38, 30, 4, 4, "#7a5a2e");     // temple carvings
      p(23, 36, 20, 2, "#7a5a2e");
      p(42, 20, 12, 8, "#c9a46a"); p(50, 22, 3, 3, "#ff5a3a"); p(52, 26, 4, 1, "#7a5a2e");    // head (faces right)
      p(10, 24, 10, 6, "#b8935a"); p(6, 28, 6, 12, "#b8935a"); p(4, 38, 8, 5, "#a8844e");     // arm holding the stone
      p(46, 30, 8, 6, "#b8935a"); p(52, 34, 6, 12, "#b8935a"); p(51, 44, 9, 5, "#a8844e");
      p(22, 44, 9, 14, "#a8844e"); p(35, 44, 9, 14, "#a8844e"); p(20, 56, 12, 3, "#7a5a2e"); p(34, 56, 12, 3, "#7a5a2e");
    });
    make(scene, "scorpion", 40, 28, (p, disc, oval) => {
      oval(17, 18, 10, 5, "#7fb8c8"); oval(17, 17, 8, 3, "#a8e0ee");                         // glass body
      p(5, 6, 3, 10, "#7fb8c8"); p(5, 4, 8, 3, "#7fb8c8"); p(12, 4, 3, 4, "#ffe08a");        // tail and sting
      p(26, 14, 8, 4, "#7fb8c8"); p(32, 11, 5, 3, "#a8e0ee"); p(32, 17, 5, 3, "#a8e0ee");    // claws
      for (let i = 0; i < 4; i++) p(10 + i * 4, 22, 2, 5, "#5a8a98");
      p(25, 16, 2, 2, "#ff4a4a");
    });
    make(scene, "jackal", 34, 26, (p, disc, oval) => {
      oval(15, 14, 9, 5, "#c48a3a"); p(2, 10, 6, 3, "#a8702a");                               // body, tail
      oval(26, 9, 5, 4, "#c48a3a"); p(29, 10, 4, 3, "#d8a860"); p(23, 2, 2, 5, "#c48a3a"); p(27, 2, 2, 5, "#c48a3a");
      p(27, 8, 2, 1, "#2a1a10");
      p(8, 18, 3, 7, "#a8702a"); p(13, 18, 3, 7, "#a8702a"); p(18, 18, 3, 7, "#a8702a"); p(22, 18, 3, 7, "#a8702a");
    });
    make(scene, "legion", 26, 38, (p, disc, oval) => {
      p(4, 12, 10, 22, "#9a2a2a"); p(8, 10, 16, 18, "#b8b8c8");                               // tower shield (front) and armour
      p(3, 12, 9, 22, "#b83a2e"); p(6, 20, 3, 6, "#e8c050");                                  // shield with sun emblem
      p(12, 2, 9, 9, "#d8b088"); p(11, 1, 11, 4, "#c8c8d0"); p(13, 0, 7, 2, "#c83a2a");       // head, helmet, crest
      p(18, 5, 2, 2, "#2a1a10");
      p(20, 14, 3, 10, "#d8b088"); p(22, 16, 2, 10, "#e0e0f0");                               // arm and short sword
      p(10, 28, 4, 9, "#6a4a2a"); p(16, 28, 4, 9, "#6a4a2a");
    });
  }

  // ---------- map (16 x 16 tiles and the hero) ----------
  function tiles(scene) {
    const t = (key, draw) => make(scene, key, 16, 16, draw, false);
    const speck = (p, c1, c2, seed) => { let s = seed; for (let i = 0; i < 10; i++) { s = (s * 9301 + 49297) % 233280; p(s % 16, (s >> 4) % 16, 1, 1, i % 2 ? c1 : c2); } };
    t("sand", p => { p(0, 0, 16, 16, "#e2c58a"); speck(p, "#d4b47a", "#ecd6a0", 7); });
    t("sand2", p => { p(0, 0, 16, 16, "#dcbd80"); speck(p, "#c9a86c", "#e8d09a", 3); p(3, 11, 4, 1, "#c9a86c"); });
    t("path", p => { p(0, 0, 16, 16, "#c9a26a"); speck(p, "#b8925c", "#d8b47c", 5); });
    t("town", p => { p(0, 0, 16, 16, "#c8b494"); p(0, 7, 16, 1, "#b09c7c"); p(7, 0, 1, 7, "#b09c7c"); p(12, 8, 1, 8, "#b09c7c"); });
    t("wall", p => { p(0, 0, 16, 16, "#a08060"); p(0, 0, 16, 2, "#c0a080"); p(0, 7, 16, 1, "#806040"); p(5, 2, 1, 5, "#806040"); p(11, 8, 1, 8, "#806040"); });
    t("ruin", p => { p(0, 0, 16, 16, "#9a8a6a"); p(1, 1, 6, 6, "#b0a080"); p(9, 1, 6, 6, "#b0a080"); p(1, 9, 14, 6, "#b0a080"); p(4, 11, 3, 2, "#6a5a3a"); p(10, 11, 3, 2, "#6a5a3a"); });
    t("water", p => { p(0, 0, 16, 16, "#3a8ab0"); p(2, 4, 5, 1, "#7ac0e0"); p(9, 10, 5, 1, "#7ac0e0"); p(5, 13, 3, 1, "#5aa8d0"); });
    t("palm", p => { p(0, 0, 16, 16, "#e2c58a"); p(7, 6, 2, 10, "#8a5a2a"); p(2, 3, 12, 3, "#3a9a4a"); p(4, 1, 8, 2, "#4ab85a"); p(1, 5, 3, 2, "#2a7a3a"); p(12, 5, 3, 2, "#2a7a3a"); });
    t("cactus", p => { p(0, 0, 16, 16, "#e2c58a"); p(7, 3, 3, 12, "#4a9a4a"); p(3, 6, 2, 5, "#4a9a4a"); p(3, 10, 4, 2, "#4a9a4a"); p(12, 5, 2, 5, "#4a9a4a"); p(10, 9, 4, 2, "#4a9a4a"); });
    t("roof", p => { p(0, 0, 16, 16, "#b8503a"); for (let y = 2; y < 16; y += 4) p(0, y, 16, 1, "#8a3a2a"); });
    t("housewall", p => { p(0, 0, 16, 16, "#e8d8b8"); p(0, 15, 16, 1, "#b8a888"); p(4, 4, 4, 4, "#5a7a9a"); });
    t("door", p => { p(0, 0, 16, 16, "#e8d8b8"); p(4, 3, 8, 13, "#6a4a2a"); p(10, 9, 1, 1, "#e8c050"); });
    t("shopdoor", p => { p(0, 0, 16, 16, "#e8d8b8"); p(4, 3, 8, 13, "#3a5a8a"); p(2, 0, 12, 3, "#e8c050"); });
    t("gate", p => { p(0, 0, 16, 16, "#9a8a6a"); p(3, 2, 10, 14, "#1a1410"); p(5, 0, 6, 2, "#e8c050"); });
    t("floor", p => { p(0, 0, 16, 16, "#5a4a3e"); p(0, 0, 16, 1, "#4a3a30"); p(0, 0, 1, 16, "#4a3a30"); p(8, 8, 8, 1, "#4a3a30"); p(8, 8, 1, 8, "#4a3a30"); });
    t("dwall", p => { p(0, 0, 16, 16, "#2e2420"); p(0, 12, 16, 4, "#3e3028"); p(2, 2, 5, 3, "#3a2e26"); p(9, 6, 5, 3, "#3a2e26"); });
    t("exit", p => { p(0, 0, 16, 16, "#5a4a3e"); p(3, 3, 10, 10, "#e2c58a"); p(5, 5, 6, 6, "#fff0c0"); });
    t("altar", p => { p(0, 0, 16, 16, "#5a4a3e"); p(2, 6, 12, 8, "#9a88b0"); p(4, 4, 8, 3, "#e8e0ff"); p(7, 8, 2, 4, "#ff5a3a"); });
    t("chest", p => { p(0, 0, 16, 16, "#5a4a3e"); p(3, 6, 10, 8, "#8a5a2a"); p(3, 6, 10, 2, "#b07a3a"); p(7, 9, 2, 2, "#e8c050"); });
    t("chestopen", p => { p(0, 0, 16, 16, "#5a4a3e"); p(3, 9, 10, 5, "#8a5a2a"); p(3, 5, 10, 3, "#6a4a2a"); });
    // hero: young academy apprentice; 2 frames
    for (let f = 0; f < 2; f++) make(scene, "hero" + f, 16, 16, p => {
      p(5, 1, 6, 5, "#f0c8a0"); p(4, 0, 8, 2, "#3a2a1a"); p(4, 2, 1, 3, "#3a2a1a"); p(9, 3, 1, 1, OUT);
      p(4, 6, 8, 6, "#3a6ab0"); p(3, 7, 1, 4, "#f0c8a0"); p(12, 7, 1, 4, "#f0c8a0"); p(5, 9, 6, 1, "#e8c050");
      p(f ? 4 : 5, 12, 3, 3, "#4a3a2a"); p(f ? 9 : 8, 12, 3, 3, "#4a3a2a");
    });
    const npc = (key, robe, hair) => make(scene, key, 16, 16, p => {
      p(5, 1, 6, 5, "#e0b890"); p(4, 0, 8, 2, hair); p(9, 3, 1, 1, OUT); p(4, 6, 8, 9, robe); p(3, 7, 1, 4, "#e0b890"); p(12, 7, 1, 4, "#e0b890");
    });
    npc("mentor", "#5a3a7a", "#c8c8c8"); npc("innkeeper", "#8a5a2a", "#6a3a1a"); npc("merchant", "#2a7a5a", "#1a1a1a"); npc("scholar", "#7a6a3a", "#c88a3a");
  }

  root.Art = { build(scene) { creatures(scene); enemies(scene); tiles(scene); } };
})(window);
