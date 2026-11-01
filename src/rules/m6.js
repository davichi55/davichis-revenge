// Eight enemies with rules the game did not have yet, and the chapter 2 Lich boss (2026-11-01, Danny: "all of them, maybe add in chapter 2 some new necromancer or lich boss").
// Bone-Rattle Priest (necromancer): every second round it gets a fallen ally back up, as often as it likes. Oathbound Berserker: hits harder the lower its HP.
// Sun-Disc Templar: seals away the MP of whoever has the most and turns it into a shield. Quicksilver Transmuter: changes element every two rounds, and its resistances change with it.
// Cutpurse: snatches an item from the bag and runs at the end of the next round; beat it first and you get the item back. Bounty Hunter: hunts you on the map (region amb.hunters, src/world/engine.js).
// Bronze Juggernaut: cannot be slowed, stunned, frozen or chilled until it is broken. Cinder Thrall: pulls itself back together once, unless fire or light finishes it.
// The Cinder Lich (Cinderglass Flats, chapter 2): rises again while its Black Soul Jar stands. The jar is covered while the Lich stands, and the Lich takes 30% less while the jar is whole.
// Story fights and scenes: src/story/m6foes.js. Art: art-review/m7 (data.js).
(function (root) {
  const Core = root.Core || require("../core.js");
  const H = Core.HOOKS, X = Core.EFFECTS, K = Core.CONDS, T = Core.encT;
  const NF = (id, name, profile, o) => Core.defEnemy(id, name, profile, Object.assign({ human: 1 }, o));
  const live = (ctx, u) => ctx.foes.filter(f => f.alive && f !== u);

  // ---------- rule pieces ----------
  // Necromancer: at the end of every second round one fallen ally (not a summon, not one that ran) stands up again with 40% HP. Unlimited, so the priest goes first.
  H.raiseDead = { round(ctx, u) {
    if (!u.alive || u.broken || ctx.round % 2) return;
    const d = ctx.foes.find(f => !f.alive && f !== u && !f.summoned && !f.fled && !f.rise);
    if (!d) return;
    Core.revive(ctx, d, 0.4); ctx.ev[ctx.ev.length - 1].text = u.name + " shakes the skull rattle. " + d.name + " gets up again!";
  } };
  // Berserker: up to +80% damage at 0 HP, in a straight line with the HP it has lost.
  H.berserk = {
    outMult(ctx, u) { return 1 + 0.8 * (1 - u.hp / u.maxHp); },
    hit(ctx, u) { if (u.alive && !u.raged && u.hp / u.maxHp < 0.5) { u.raged = 1; Core.say(ctx, u.name + " roars. Every wound makes him stronger!"); } },
  };
  // Templar: takes up to 2 MP from the hero with the most, and gets a shield of 6% max HP for each point.
  X.sealMp = (ctx, e, a) => {
    const t = ctx.party.filter(p => p.alive && p.mp > 0).sort((x, y) => y.mp - x.mp)[0];
    if (!t) { Core.say(ctx, e.name + " raises the sun disc, but there is no spark to take."); return; }
    const n = Math.min(a.drain || 2, t.mp); t.mp -= n;
    ctx.ev.push({ t: "debuff", tgt: t, stat: "mp", val: -n, turns: 0 });
    const sh = Math.round(e.maxHp * 0.06 * n); Core.addBuff(e, "shield", sh, 3, { force: 1 }); ctx.ev.push({ t: "buff", tgt: e, stat: "shield", val: sh });
    Core.say(ctx, e.name + " seals away " + n + " of " + t.name + "'s MP and wears it as a shield.");
  };
  K.anyMp = ctx => ctx.party.some(p => p.alive && p.mp >= 2);
  // Transmuter: fire -> water -> ice, a new element every second round. It resists its own element and is weak to the one that beats it.
  const TM = { fire: { weak: "water", n: "Red Flask", st: ["burn", 1, 0.4], say: "red. It burns now." }, water: { weak: "shock", n: "Blue Flask", st: ["wet", 1, 0.6], say: "blue. It runs like water now." }, ice: { weak: "fire", n: "White Flask", st: ["chill", 1, 0.5], say: "white. Frost creeps over the mask." } };
  const TM_ORDER = ["fire", "water", "ice"];
  function transmute(ctx, u, quiet) {
    const el = TM_ORDER[u.tmIdx % TM_ORDER.length], d = TM[el];
    u.tmEl = el; u.rs = { [el]: 0.6, [d.weak]: -0.5 };
    u.ab = [{ n: d.n, p: 0.8, k: "spell", el, st: d.st, w: 3 }, { n: "Quicksilver Splash", p: 0.4, k: "spell", el, aoe: 1, w: 1 }];
    if (!quiet) Core.say(ctx, "The Transmuter's flask turns " + d.say);
  }
  H.transmute = {
    start(ctx, u) { u.tmIdx = Math.floor(Math.random() * 3); transmute(ctx, u, true); },
    round(ctx, u) { if (u.alive && ctx.round % 2 === 0) { u.tmIdx++; transmute(ctx, u); } },
  };
  // Thief: Snatch takes one item from the bag (the battle's own item count, so it is gone from G.items when the fight ends). At the end of the next round it runs, unless it is the last foe standing.
  X.snatch = (ctx, e) => {
    if (e.loot || !e.alive) return;
    const bag = ctx.items, keys = bag ? Object.keys(bag).filter(k => bag[k] > 0) : [];
    if (!keys.length) { Core.say(ctx, e.name + " pats your bags and finds nothing."); return; }
    const k = keys[Math.floor(Math.random() * keys.length)]; bag[k]--; e.loot = k; e.lootRound = ctx.round;
    Core.say(ctx, e.name + " snatches your " + itemName(k) + "!");
  };
  const itemName = k => (Core.ITEMS[k] ? Core.ITEMS[k].name : k);
  K.noLoot = (ctx, e) => !e.loot;
  H.cutpurse = {
    round(ctx, u) {
      if (!u.alive || !u.loot || ctx.round - u.lootRound < 1 || !live(ctx, u).length) return;
      u.alive = false; u.hp = 0; u.fled = true; u.held = null; u.charging = null; u.buffs = []; u.st = {};
      u.xp = 0; u.xpAbs = 0; u.kakal = 0; u.gold = 0; u.goldAbs = 0; u.drops = [];
      ctx.ev.push({ t: "flee", tgt: u, text: u.name + " darts away with your " + itemName(u.loot) + "!" });
    },
    die(ctx, u) { if (u.loot && ctx.items) { ctx.items[u.loot] = (ctx.items[u.loot] || 0) + 1; Core.say(ctx, "You take back your " + itemName(u.loot) + "."); u.loot = null; } },
  };
  // Juggernaut: shrugs off slow, stun, freeze, chill, petrify and Speed debuffs until it is broken (core addStatus and debuff read u.unstoppable).
  H.juggernaut = {
    start(ctx, u) { u.unstoppable = true; },
    broken(ctx, u) { Core.say(ctx, "The bronze plates crack open. " + u.name + " can be slowed now."); },
  };
  // Cinder Thrall: a killing blow that is not fire or light leaves it standing once, at 35% HP (not the ones the Lich raises mid-fight).
  H.reform = {
    inMult(ctx, u, src, info) { u.lastEl = info ? info.el : null; return 1; },
    die(ctx, u) {
      if (u.summoned || u.reformed || u.lastEl === "fire" || u.lastEl === "light") return;
      u.reformed = 1; u.hp = Math.max(1, Math.round(u.maxHp * 0.35)); u.st = {};
      ctx.ev.push({ t: "revive", tgt: u, text: "The bones of " + u.name + " pull themselves back together!" });
      return false;
    },
  };
  // The Cinder Lich: 30% less damage while the jar is whole. The jar: covered (60%) while the Lich stands (core coverBy), tells you when it breaks.
  H.lich = {
    start(ctx, u) { Core.say(ctx, "A black glass jar glows on the altar behind " + u.name + "."); },
    inMult(ctx, u) { return ctx.foes.some(f => f.alive && f.id === "soulJar") ? 0.7 : 1; },
  };
  H.soulJar = { die(ctx, u) {
    Core.say(ctx, "The jar bursts. The blue flame inside goes out.");
    const l = ctx.foes.find(f => f.id === "cinderLich"); if (l && l.alive) Core.say(ctx, l.name + "'s fire gutters. Nothing will raise it now.");
  } };

  // ---------- the enemies ----------
  NF("boneRattlePriest", "Bone-Rattle Priest", "caster", { hpMult: 0.5, focusMult: 1.8, hooks: ["raiseDead"], rs: { light: -0.4, dark: 0.4 }, ab: [{ n: "Grave Chill", p: 0.65, k: "spell", el: "dark", w: 3 }, { n: "Rattle of the Dead", p: 0.3, k: "spell", db: ["res", -0.2, 2], w: 1 }] });
  NF("oathBerserker", "Oathbound Berserker", "brute", { hpMult: 0.65, hooks: ["berserk"], ab: [{ n: "Twin Axes", p: 0.5, hits: 2, w: 3 }, { n: "Reckless Charge", p: 1.1, self: ["def", -0.25, 1], w: 1 }] });
  NF("sunTemplar", "Sun-Disc Templar", "human", { hpMult: 0.7, pr: 0.15, rs: { light: 0.4, dark: -0.3 }, ab: [{ n: "Sun Mace", p: 0.85, w: 3 }, { n: "Eclipse Seal", fx: "sealMp", drain: 2, w: 4, if: "anyMp&every:2" }] });
  NF("quickTransmuter", "Quicksilver Transmuter", "caster", { hpMult: 0.55, hooks: ["transmute"], ab: [{ n: "Red Flask", p: 0.8, k: "spell", el: "fire", w: 1 }] });
  NF("cutpurse", "Cutpurse", "swift", { hpMult: 0.4, focusMult: 1.5, hooks: ["cutpurse"], ab: [{ n: "Snatch", p: 0.35, fx: "snatch", w: 8, if: "noLoot" }, { n: "Knife Flick", p: 0.75, st: ["bleed", 1, 0.3], w: 3 }] });
  NF("bountyHunter", "Itzcan, Bounty Hunter", "swift", { hpMult: 2.0, pr: 0.1, ab: [{ n: "Hunting Spear", p: 1.0, w: 3 }, { n: "Bola", p: 0.3, hold: 1, w: 2, if: "nobodyHeld" }, { n: "Mark the Bounty", mark: 0.3, markTurns: 3, w: 1, if: "nomarked" }] });
  NF("bronzeJuggernaut", "Bronze Juggernaut", "brute", { hpMult: 1.0, pr: 0.25, breakType: "impact", breakNeed: 2, hooks: ["juggernaut"], immune: ["bleed"], rs: { shock: -0.3 }, bigEvery: 3, bigHit: 0.8, bigName: "Siege Step",
    ab: [{ n: "Ram Fist", p: 1.05, w: 3 }, { n: "Chain Sweep", p: 0.45, aoe: 1, w: 1 }] });
  NF("cinderThrall", "Cinder Thrall", "brute", { human: 0, hpMult: 0.5, hooks: ["reform"], immune: ["poison", "bleed"], rs: { fire: 0.25, water: -0.4, light: -0.4 }, ab: [{ n: "Obsidian Club", p: 0.9, w: 3 }, { n: "Ash Breath", p: 0.4, k: "spell", el: "fire", st: ["burn", 1, 0.3], w: 1 }] });

  // ---------- the Cinder Lich (boss, chapter 2) ----------
  // level 9 (the party after the Bone Maze), guardian pay like the Well-Eater; 2 actions, summons up to two Cinder Thralls
  const BOSS_META = Core.BOSS_META = Core.BOSS_META || {}, BOSS_FOES = Core.BOSS_FOES = Core.BOSS_FOES || {};
  BOSS_META.cinderLich = { lv: 9, t: 150, kind: "guardian" };
  const PAY = 4;
  Core.defEnemy("cinderLich", "The Cinder Lich", "caster", { boss: true, actions: 2, hpMult: 2.2, hooks: ["lich"], riseWhile: "soulJar", riseAfter: 1, riseMax: 30, riseFrac: 0.6,
    immune: ["poison", "bleed"], rs: { fire: 0.5, water: -0.25, light: -0.25 }, vscale: 1.15, xpAbs: Math.round(Core.fightXpBase(9) * PAY), goldAbs: Math.round(Core.goldBase(9) * PAY),
    intro: "Blue fire rises from the black glass.", bigEvery: 4, bigHit: 0.5, bigName: "Pyre of Souls",
    ab: [{ n: "Glassfire Bolt", p: 0.42, k: "spell", el: "fire", st: ["burn", 1, 0.4], w: 4 }, { n: "Raise the Burned", summon: ["cinderThrall"], summonMax: 2, sumLv: -1, w: 3, if: "kids<:2&every:3" }, { n: "Ash Wind", p: 0.22, k: "spell", aoe: 1, db: ["spd", -0.2, 2], w: 2 }] });
  Core.defEnemy("soulJar", "Black Soul Jar", "tank", { boss: true, actions: 1, hpMult: 0.8, coverBy: "cinderLich", focusMult: 2.5, hooks: ["soulJar"], partOf: "cinderLich", xpAbs: 0, goldAbs: 0, vscale: 0.8,
    immune: ["poison", "bleed", "burn", "stun", "freeze", "chill", "slow", "petrify"], rs: { light: -0.3 },
    ab: [{ n: "Soul Pulse", healAlly: 0.06, w: 1 }] });
  BOSS_FOES.cinderLich = lv => [Core.makeEnemy("cinderLich", lv), Core.makeEnemy("soulJar", lv)];
  Core.DMG.byId.cinderLich = 1.1;   // Danny 2026-11-01: beaten at level 6 with a healer, "maybe he can do a little bit more damage, like 10%"

  // ---------- where they walk: [table, foes, weight, lowest level, highest level] ----------
  { const EN = Core.ENCOUNTERS, NP = "boneRattlePriest", BZ = "oathBerserker", TP = "sunTemplar", TM2 = "quickTransmuter", CP = "cutpurse", JG = "bronzeJuggernaut", TH = "cinderThrall";
    [["flats", [TH], 3, 7, 9], ["flats", [TH, TH], 2, 7, 8], ["flats", [TH, "slagImp"], 1, 8, 9], ["boneMaze", [TH, "mazeBat"], 1, 8, 9],
      ["jungleRoad", [CP, "legionSpearman"], 1.5, 12, 14], ["fort", [BZ, "legionShieldbearer"], 2, 13, 14], ["pyramid", [TP, "pyramidAcolyte"], 2, 14, 15],
      ["sporeCave", [TM2, "gloomMushroomShaman"], 2, 17, 19], ["spire", [TP, "jaguarCohortElite"], 2, 20, 21],
      ["occupied", [CP, "houndOfTheCohort"], 2, 22, 23], ["canyon", [BZ, "houndOfTheCohort"], 2, 24, 25], ["coldVault", [NP, "crystalGargoyle"], 2, 25, 26],
      ["giantQuarry", [JG, "chiselImp"], 2, 30, 31], ["tzavan", [CP, "legionShieldbearer"], 2, 31, 32],
      ["crater", [TM2, "ashImp"], 2, 34, 35], ["hollows", [NP, "ferryGhoul", "tombScarab"], 2, 34, 36], ["hollows", [NP, "paleMinotaurShade"], 1, 35, 36],
      ["orchard", [BZ, "legionSpearman"], 2, 46, 47], ["saltMine", [JG, "legionOptio"], 2, 46, 47], ["sunmaw", [TP, "sunmawCultist"], 2, 47, 48],
      ["trenches", [JG, "legionSlinger"], 2, 60, 60], ["crypt", [NP, "candleWraith"], 2, 60, 61], ["prism", [TM2, "prismSprite"], 2, 61, 62],
    ].forEach(([t, foes, w, a, b]) => { if (EN[t]) EN[t].push(T(foes, w, a, b)); else console.warn("m6: no table", t); });
  }

  // ---------- HUD lines for the foe panel ----------
  const baseNotes = Core.foeNotes;
  Core.foeNotes = (f, ctx) => {
    const n = baseNotes ? baseNotes(f, ctx) : [], r = ctx ? ctx.round : 0, h = f.hooks || [];
    if (h.includes("raiseDead")) n.push("Raises a fallen ally on round " + (Math.floor(r / 2) * 2 + 2));
    if (h.includes("berserk")) { const p = Math.round(80 * (1 - f.hp / f.maxHp)); n.push(p ? "Rage: +" + p + "% damage" : "Rage grows as it is hurt"); }
    if (h.includes("transmute") && f.tmEl) n.push("Element: " + f.tmEl + ", changes on round " + (Math.floor(r / 2) * 2 + 2));
    if (h.includes("cutpurse") && f.loot) n.push("Has your " + itemName(f.loot) + (r - f.lootRound >= 1 ? ", runs this round" : ""));
    if (f.unstoppable) n.push(f.broken ? "Cracked: can be slowed" : "Unstoppable: no slow, stun or freeze");
    if (h.includes("lich")) n.push(ctx && ctx.foes.some(x => x.alive && x.id === "soulJar") ? "Rises again while the jar stands" : "The jar is broken");
    return n;
  };
  if (typeof module !== "undefined") module.exports = Core;
})(typeof window !== "undefined" ? window : globalThis);
