// Ten optional bosses that hold gear pieces (2026-11-01, Danny: "spread it out over some optional bosses ... use some unused concept that our 200 class list got").
// Each one is a class concept the game did not have yet, with one rule of its own. Where they stand and what they drop: src/story/pieces.js. Art: art-review/m7.
//   stoneSinger (Geomancer, ch2 Red Mesa Steps)      her standing stones each add 20% to her damage; she sings them back up
//   xocoPoisoner (Poisoner, ch3 Greenmaw ruins)      every 2nd round she drinks: heals 1.5% for every poison stack on your team
//   rootWitch (Floramancer, ch4 Sporeroot Caves)     plants a Blood Lily that blooms after 2 rounds: heals her and puts your team to sleep, unless you cut it first
//   condorKeeper (Falconer, ch4 Lookout Chain)       marks one of you; his Red Condor dives on the mark; whistles a new bird when it falls
//   blindOracle (Oracle, ch5 Undervaults)            every 2nd round foretells the element you used most and turns it back on you
//   ironKnuckle (Pugilist, ch6 Giant Quarry)         his punches build a combo on one creature; the third is a knockout (stun); breaking him resets it
//   mirrorChamberlain (Illusionist, ch7 Palace Garden) mirror images catch single-target hits meant for him; area hits break them
//   nightDrinker (Vampire, ch8 Sunmaw Pyramid)       every bite drinks a Blood stack (+8% damage each); fire and light burn one away, a light break burns them all
//   stormcaller (Stormcaller, ch10 Prism Archive)    every 3rd round the storm strikes everyone who did not hit her that round
//   deepAngler (Angler, post-game Lantern Deep)      every 2nd round dangles a lure: a basic attack on him that round bites it (hooked: hurt, loses an action)
(function (root) {
  const Core = root.Core || require("../core.js");
  const H = Core.HOOKS, X = Core.EFFECTS, K = Core.CONDS, A = Core.EVOAPI, say = Core.say;
  const BOSS_META = Core.BOSS_META = Core.BOSS_META || {}, BOSS_FOES = Core.BOSS_FOES = Core.BOSS_FOES || {};
  const PAY = 4;   // guardian pay, like the Well-Eater and the Cinder Lich
  const boss = (id, name, profile, lv, t, o) => { BOSS_META[id] = { lv, t, kind: "guardian" }; Core.defEnemy(id, name, profile, Object.assign({ boss: true, actions: 2, xpAbs: Math.round(Core.fightXpBase(lv) * PAY), goldAbs: Math.round(Core.goldBase(lv) * PAY) }, o)); };
  const part = (id, name, profile, o) => Core.defEnemy(id, name, profile, Object.assign({ boss: true, actions: 1, xpAbs: 0, goldAbs: 0 }, o));   // a unit that belongs to a boss fight
  const addUnits = (ctx, e, ids, max) => Core.abExtras(ctx, e, { summon: ids, summonMax: max || ids.length }, null, [], false);
  const alive = (ctx, id) => ctx.foes.filter(f => f.alive && f.id === id);
  const heroes = ctx => ctx.party.filter(p => p.alive);

  // ---------- Geomancer: the Stone-Singer ----------
  H.stoneSong = {
    start(ctx, u) { addUnits(ctx, u, ["singingStone", "singingStone"], 2); say(ctx, "Two standing stones answer her song."); },
    outMult(ctx, u) { return 1 + 0.2 * alive(ctx, "singingStone").length; },
  };
  boss("stoneSinger", "The Stone-Singer", "caster", 8, 120, { hpMult: 2.8, hooks: ["stoneSong"], rs: { earth: 0.5, water: -0.25 }, intro: "The ground hums under your feet.",
    bigEvery: 4, bigHit: 0.35, bigName: "Earthsong", ab: [{ n: "Stone Song", p: 0.34, k: "spell", el: "earth", w: 4 }, { n: "Rockfall", p: 0.17, k: "spell", el: "earth", aoe: 1, w: 2 },
      { n: "Raise the Stones", summon: ["singingStone", "singingStone"], summonMax: 2, w: 6, if: "kids<:1&every:4" }] });
  part("singingStone", "Singing Stone", "tank", { hpMult: 0.55, immune: ["poison", "bleed", "burn", "stun", "freeze", "chill", "slow", "petrify"], rs: { earth: 0.5 }, focusMult: 1.6, ab: [{ n: "Hum", p: 0.15, k: "spell", el: "earth", aoe: 1, w: 1 }] });
  BOSS_FOES.stoneSinger = lv => [Core.makeEnemy("stoneSinger", lv)];

  // ---------- Poisoner: Xoco ----------
  H.venomCup = { round(ctx, u) {
    if (!u.alive || ctx.round % 2) return;
    const n = heroes(ctx).reduce((s, p) => s + ((p.st.poison && p.st.poison.n) || 0), 0); if (!n) { say(ctx, u.name + " lifts the skull cup and finds it dry."); return; }
    A.healFlat(ctx, u, Math.round(u.maxHp * 0.015 * n), { silent: 1 }); say(ctx, u.name + " drinks from the skull cup: your poison heals her.");
  } };
  boss("xocoPoisoner", "Xoco the Poisoner", "swift", 14, 130, { hpMult: 3.2, hooks: ["venomCup"], immune: ["poison"], rs: { poison: 0.6, light: -0.25 }, intro: "Something sweet and rotten hangs in the air.",
    bigEvery: 4, bigHit: 0.8, bigSingle: 1, bigName: "Bitter Draught", ab: [{ n: "Venom Blade", p: 0.6, st: ["poison", 1, 0.6], w: 4 }, { n: "Poison Mist", p: 0.22, k: "spell", el: "poison", aoe: 1, st: ["poison", 1, 0.6], w: 2 },
      { n: "Toxic Kiss", p: 0.38, k: "spell", el: "poison", st: ["poison", 2, 0.9], w: 2 }] });
  BOSS_FOES.xocoPoisoner = lv => [Core.makeEnemy("xocoPoisoner", lv)];

  // ---------- Floramancer: the Root Witch ----------
  H.bloodLily = { round(ctx, u) {
    if (!u.alive) return; u.age = (u.age || 0) + 1;
    if (u.age < 2) { say(ctx, "The Blood Lily swells. It will open soon."); return; }
    const w = alive(ctx, "rootWitch")[0]; if (w) A.healFlat(ctx, w, Math.round(w.maxHp * 0.18), { silent: 1 });
    say(ctx, "The Blood Lily blooms! Its scent makes your team drowsy.");
    heroes(ctx).forEach(p => A.addStatus(ctx, u, p, "stun", 1, { chance: 0.55 }));
    u.hp = 0; A.die(ctx, u);
  } };
  boss("rootWitch", "The Root Witch", "caster", 19, 140, { hpMult: 4.2, rs: { nature: 0.5, fire: -0.4 }, intro: "Roots twist across the cave floor toward you.",
    ab: [{ n: "Thorn Lash", p: 0.85, w: 4 }, { n: "Spore Cloud", p: 0.22, k: "spell", el: "nature", aoe: 1, st: ["poison", 1, 0.4], w: 2 }, { n: "Root Snare", p: 0.3, hold: 1, w: 2, if: "nobodyHeld" },
      { n: "Plant a Lily", summon: ["bloodLily"], summonMax: 1, w: 7, if: "kids<:1&every:3" }] });
  part("bloodLily", "Blood Lily", "tank", { hpMult: 0.3, hooks: ["bloodLily"], rs: { fire: -0.5 }, focusMult: 2.5, immune: ["poison", "bleed", "stun"], ab: [{ n: "Sway", self: ["dr", 0.1, 1], w: 1 }] });
  BOSS_FOES.rootWitch = lv => [Core.makeEnemy("rootWitch", lv)];

  // ---------- Falconer: the Condor Keeper ----------
  K.noBird = ctx => !ctx.foes.some(f => f.alive && f.id === "redCondor");
  boss("condorKeeper", "The Condor Keeper", "human", 20, 130, { hpMult: 2.2, human: 1, pr: 0.1, intro: "A bone whistle shrills. Something huge answers from above.",
    ab: [{ n: "Called Shot", mark: 0.25, markTurns: 3, w: 5, if: "nomarked" }, { n: "Short Spear", p: 0.7, w: 3 }, { n: "Whistle", summon: ["redCondor"], summonMax: 1, w: 8, if: "noBird&every:3" }] });
  part("redCondor", "Red Condor", "beast", { hpMult: 0.8, actions: 1, rs: { shock: -0.4, earth: 0.25 }, ab: [{ n: "Dive", p: 1.0, tgt: "marked", w: 4 }, { n: "Talon Rake", p: 0.55, st: ["bleed", 1, 0.5], w: 2 }] });
  BOSS_FOES.condorKeeper = lv => [Core.makeEnemy("condorKeeper", lv), Core.makeEnemy("redCondor", lv)];

  // ---------- Oracle: the Blind Oracle ----------
  H.foretell = {
    hit(ctx, u, src, v, info) { if (src && src.side === "p" && info && info.el) { u.elSeen = u.elSeen || {}; u.elSeen[info.el] = (u.elSeen[info.el] || 0) + 1; } },
    inMult(ctx, u, src, info) { return info && info.el && info.el === u.foreEl ? 0.6 : 1; },
    round(ctx, u) {
      if (!u.alive || ctx.round % 2) return;
      const seen = Object.entries(u.elSeen || {}).sort((a, b) => b[1] - a[1]); u.elSeen = {};
      if (!seen.length) return;
      u.foreEl = seen[0][0]; u.reflect = [u.foreEl]; say(ctx, "The Oracle whispers: \"I see " + u.foreEl + ".\" " + u.foreEl[0].toUpperCase() + u.foreEl.slice(1) + " spells will come back on you.");
    },
  };
  boss("blindOracle", "The Blind Oracle", "caster", 25, 130, { hpMult: 3.2, hooks: ["foretell"], rs: { dark: 0.4 }, intro: "Small mirrors turn on their cords, all at once, toward you.",
    bigEvery: 4, bigHit: 0.5, bigName: "The Seen End", ab: [{ n: "Third Eye", p: 0.6, k: "spell", el: "light", w: 4 }, { n: "Bells of Warning", p: 0.25, k: "spell", aoe: 1, db: ["spd", -0.2, 2], w: 2 }, { n: "Smoke of Years", p: 0.35, k: "spell", el: "dark", db: ["pow", -0.2, 2], w: 2 }] });
  BOSS_FOES.blindOracle = lv => [Core.makeEnemy("blindOracle", lv)];

  // ---------- Pugilist: Iron-Knuckle Toma ----------
  X.combo = (ctx, e, a, tgt) => {
    if (!tgt || !tgt.alive) return;
    tgt.toma = (tgt.toma || 0) + 1;
    if (tgt.toma < 3) { say(ctx, "Toma's combo on " + tgt.name + ": " + tgt.toma + "."); return; }
    tgt.toma = 0; A.directHit(ctx, e, tgt, Math.round(tgt.maxHp * 0.08), "KNOCKOUT"); if (tgt.alive) A.addStatus(ctx, e, tgt, "stun", 1, { sure: 1 });
    say(ctx, "KNOCKOUT! Toma's third punch lands on " + tgt.name + ".");
  };
  H.toma = { broken(ctx, u) { heroes(ctx).forEach(p => (p.toma = 0)); say(ctx, "Toma stumbles. His combo is gone."); } };
  boss("ironKnuckle", "Iron-Knuckle Toma", "brute", 31, 130, { hpMult: 3.8, human: 1, hooks: ["toma"], breakType: "impact", breakNeed: 2, intro: "A bell rings for round one.",
    ab: [{ n: "Jab", p: 0.48, mark: 0.1, markTurns: 2, tgt: "marked", fx: "combo", w: 4 }, { n: "Body Hook", p: 0.62, tgt: "marked", fx: "combo", w: 3 }, { n: "Champion's Roar", self: ["atk", 0.2, 2], w: 1, if: "hp<0.5" }] });
  BOSS_FOES.ironKnuckle = lv => [Core.makeEnemy("ironKnuckle", lv)];

  // ---------- Illusionist: the Mirror Chamberlain ----------
  H.mirrors = {
    start(ctx, u) { addUnits(ctx, u, ["mirrorImage", "mirrorImage"], 2); say(ctx, "Two more chamberlains step out of the air beside him."); },
    inMult(ctx, u, src, info) {
      const imgs = alive(ctx, "mirrorImage"); if (!imgs.length || !info || (info.tg && info.tg.aoe) || !(info.v > 0)) return 1;
      if (Math.random() >= 0.35 * imgs.length) return 1;
      const img = imgs[Math.floor(Math.random() * imgs.length)]; say(ctx, "The blow hits a mirror image instead!"); A.directHit(ctx, src, img, info.v, "MIRROR"); return 0;
    },
  };
  boss("mirrorChamberlain", "The Mirror Chamberlain", "caster", 40, 130, { hpMult: 2.6, human: 1, hooks: ["mirrors"], rs: { light: 0.4, dark: -0.3 }, intro: "He bows. So does his reflection, a moment late.",
    ab: [{ n: "Glass Needle", p: 0.55, k: "spell", el: "light", w: 4 }, { n: "Dazzle", p: 0.24, k: "spell", aoe: 1, db: ["spd", -0.2, 2], w: 2 }, { n: "Hall of Mirrors", summon: ["mirrorImage", "mirrorImage"], summonMax: 2, w: 7, if: "kids<:1&every:3" }] });
  part("mirrorImage", "Mirror Image", "caster", { hpMult: 0.3, art: "mirrorChamberlain", vtint: 0xc8e8ff, ab: [{ n: "Mimic", p: 0.2, k: "spell", el: "light", w: 1 }] });
  BOSS_FOES.mirrorChamberlain = lv => [Core.makeEnemy("mirrorChamberlain", lv)];

  // ---------- Vampire: the Night-Drinker ----------
  X.bloodStack = (ctx, e) => { if (e.broken) return; e.blood = Math.min(6, (e.blood || 0) + 1); say(ctx, e.name + " drinks. Blood " + e.blood + "."); };
  H.vampire = {
    outMult(ctx, u) { return 1 + 0.08 * (u.blood || 0); },
    hit(ctx, u, src, v, info) { if (u.blood > 0 && info && (info.el === "fire" || info.el === "light") && v > 0) { u.blood--; say(ctx, "The light burns away some of the blood. Blood " + u.blood + "."); } },
    broken(ctx, u) { u.blood = 0; say(ctx, "The light sears him. Every drop he drank burns out."); },
  };
  boss("nightDrinker", "The Night-Drinker", "swift", 47, 130, { hpMult: 3.6, human: 1, hooks: ["vampire"], breakType: "light", breakNeed: 2, rs: { light: -0.4, fire: -0.25, dark: 0.5 }, immune: ["poison", "bleed"], intro: "The torches gutter. Something smiles in the dark.",
    ab: [{ n: "Bite", p: 0.65, drain: 0.6, fx: "bloodStack", w: 4 }, { n: "Bat Swarm", p: 0.25, aoe: 1, w: 2 }, { n: "Red Mist", self: ["dr", 0.3, 1], w: 1, if: "hp<0.5" }] });
  BOSS_FOES.nightDrinker = lv => [Core.makeEnemy("nightDrinker", lv)];

  // ---------- Stormcaller ----------
  H.eyeOfStorm = {
    hit(ctx, u, src) { if (src && src.side === "p") { if (u.hitR !== ctx.round) { u.hitR = ctx.round; u.hitBy = new Set(); } u.hitBy.add(src); } },
    round(ctx, u) {
      if (!u.alive || ctx.round % 3) return;
      const hit = u.hitR === ctx.round ? u.hitBy : new Set(), list = heroes(ctx).filter(p => !hit.has(p));
      if (!list.length) { say(ctx, "The storm breaks overhead, and every one of you is in its eye."); return; }
      say(ctx, "EYE OF THE STORM! Lightning finds everyone who held back.");
      list.forEach(p => { A.directHit(ctx, u, p, Math.round(p.maxHp * 0.08), "STORM"); if (p.alive) A.addStatus(ctx, u, p, "shock", 1, { sure: 1 }); });
    },
  };
  boss("stormcaller", "The Stormcaller", "caster", 61, 130, { hpMult: 3.4, human: 1, hooks: ["eyeOfStorm"], rs: { shock: 0.6, water: 0.25, earth: -0.3 }, intro: "Rain begins to fall indoors.",
    ab: [{ n: "Thunderbolt", p: 0.55, k: "spell", el: "shock", w: 4 }, { n: "Chain Lightning", p: 0.22, k: "spell", el: "shock", aoe: 1, w: 2 }, { n: "Downpour", p: 0.15, k: "spell", el: "water", aoe: 1, st: ["wet", 1, 0.8], w: 2 }] });
  BOSS_FOES.stormcaller = lv => [Core.makeEnemy("stormcaller", lv)];

  // ---------- Angler: the Deep Angler ----------
  H.lure = {
    round(ctx, u) { if (!u.alive) return; u.bait = ctx.round % 2 === 1; if (u.bait) say(ctx, "The Deep Angler dangles its glowing lure."); },
    hit(ctx, u, src, v, info) {
      if (!u.bait || !src || src.side !== "p" || !src.alive || !info || !info.tg || !info.tg.move) return;
      const m = Core.MOVES[info.tg.move]; if (!m || !m.basic || src.hookedR === ctx.round) return;
      src.hookedR = ctx.round; src.loseAct = (src.loseAct || 0) + 1; A.directHit(ctx, u, src, Math.round(src.maxHp * 0.1), "HOOKED"); say(ctx, src.name + " bites the lure and is hooked!");
    },
  };
  boss("deepAngler", "The Deep Angler", "beast", 80, 130, { hpMult: 3.2, hooks: ["lure"], rs: { water: 0.6, shock: -0.4, light: -0.25 }, intro: "A small light bobs in the dark water. It is very pretty.",
    bigEvery: 4, bigHit: 0.85, bigSingle: 1, bigName: "Swallow Whole", ab: [{ n: "Needle Teeth", p: 0.65, st: ["bleed", 1, 0.5], w: 4 }, { n: "Reel In", p: 0.35, hold: 1, w: 2, if: "nobodyHeld" }, { n: "Abyssal Glow", p: 0.25, k: "spell", el: "dark", aoe: 1, db: ["res", -0.2, 2], w: 2 }] });
  BOSS_FOES.deepAngler = lv => [Core.makeEnemy("deepAngler", lv)];

  // ---------- HUD lines ----------
  const baseNotes = Core.foeNotes;
  Core.foeNotes = (f, ctx) => {
    const n = baseNotes ? baseNotes(f, ctx) : [], h = f.hooks || [], r = ctx ? ctx.round : 0;
    if (h.includes("stoneSong") && ctx) { const s = alive(ctx, "singingStone").length; n.push(s ? "Stones: +" + 20 * s + "% damage" : "No stones standing"); }
    if (h.includes("venomCup")) n.push("Drinks your poison on round " + (Math.floor(r / 2) * 2 + 2));
    if (h.includes("bloodLily")) n.push((f.age || 0) >= 1 ? "Blooms this round" : "Blooms in 2 rounds");
    if (h.includes("foretell") && f.foreEl) n.push("Foretold: " + f.foreEl + " (reflected)");
    if (h.includes("vampire")) n.push("Blood " + (f.blood || 0) + ": +" + 8 * (f.blood || 0) + "% damage");
    if (h.includes("eyeOfStorm")) n.push("Eye of the storm on round " + (Math.floor(r / 3) * 3 + 3));
    if (h.includes("lure") && f.bait) n.push("Lure out: basic attacks get hooked");
    if (h.includes("mirrors") && ctx) { const m = alive(ctx, "mirrorImage").length; if (m) n.push(m + " mirror image" + (m > 1 ? "s" : "") + " catch single hits"); }
    return n;
  };
  if (typeof module !== "undefined") module.exports = Core;
})(typeof window !== "undefined" ? window : globalThis);
