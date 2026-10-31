// Bosses for chapters 3-11 and the post-game: Titans T2-T8, creature generals, human bosses, K-dungeon guardians, legends, arena champions (owner: RULES-BOSS).
// Every boss is a Core.defEnemy entry (boss: true => no field scaling). Multi-unit fights: Core.bossFoes(id, level) returns the whole unit list (falls back to [makeEnemy]).
// Tuning: HP_TUNE[id] multiplies hpMult (filled by `node test-core.js 40 bosses`, which aims at BOSS_META[id].t seconds); BOSS_META[id] = { lv: party level it is balanced for, t: target seconds, kind }.
// Break types used here: impact, slow, an element name (fire/water/shock/ice...), react, st_wet, st_chill, st_poison, st_any. Hooks live in Core.HOOKS (airborne, roots, stormRam, emberHeat, gateHeads, prism, ...).
(function (root) {
  const Core = root.Core || require("../core.js");
  const { HOOKS, CONDS, EFFECTS } = Core;
  const BOSS_META = Core.BOSS_META = Core.BOSS_META || {}, BOSS_FOES = Core.BOSS_FOES = Core.BOSS_FOES || {}, HP_TUNE = Core.HP_TUNE = Core.HP_TUNE || {};
  const KIND_PAY = { mid: 3.2, guardian: 4, legend: 4, titan: 8, end: 10, cup: 3.5, optTitan: 7 };   // boss pay = this many average field enemies (XP and kakal)
  // TUNE-BEGIN
  Object.assign(HP_TUNE, {"fortCenturion":1.66,"windhollowGuardian":1.93,"plumedCoil":0.76,"shearwing":2.37,"motherGlowmoth":0.82,"drownedShrineGuardian":1.5,"stoneGiant":1.56,"sunbirdGuardian":1.44,"motherOfTheMaelstrom":0.62,"emberWolf":0.84,"bronzeChampion":0.82,"oldHollowbell":1.84,"blackPearlHermit":1.51,"veiledCisternGuardian":1.73,"hollowNestGuardian":0.5,"rootGnawer":1.03,"ghostOfTheNinthLegion":0.93,"spearTwinA":0.81,"prismGuardian":1.86,"mentorIthiel":0.67,"stormRam":1.06,"veilStag":1.51,"emperorDavichi":0.77,"sunEater":0.36,"lastWarden":1.68,"mawmotherOfTheDeep":0.82,"lanternDeepGuardian":1.1,"naumachiaAdmiral":1,"grandChampion":1.14,"gateHound":0.69});
  // TUNE-END
  const meta = (id, lv, t, kind) => (BOSS_META[id] = { lv, t, kind });
  // boss(id, name, profile, level it is balanced for, target seconds, kind, options)
  function boss(id, name, profile, lv, t, kind, o) {
    meta(id, lv, t, kind);
    const d = Object.assign({ boss: true, actions: 2, hpMult: 3, art: id, titan: kind === "titan", legend: kind === "legend" }, o);
    if (d.xpAbs === undefined) { d.xpAbs = Math.round(Core.fightXpBase(lv) * (KIND_PAY[kind] || 3.2)); d.goldAbs = Math.round(Core.goldBase(lv) * (KIND_PAY[kind] || 3.2)); }
    d.hpMult = +(d.hpMult * (HP_TUNE[id] || 1)).toFixed(3);
    if (d.phases) d.phases = d.phases.map(p => (p.hpMult ? Object.assign({}, p, { hpMult: +(p.hpMult * (HP_TUNE[id] || 1)).toFixed(3) }) : p));
    Core.defEnemy(id, name, profile, d);
    return d;
  }
  const addUnits = (ctx, e, ids, lvOff) => Core.abExtras(ctx, e, { summon: ids, summonMax: ids.length, sumLv: lvOff || 0 }, null, [], false);
  Core.bossFoes = (id, level, extra) => (BOSS_FOES[id] ? BOSS_FOES[id](level, extra) : [Core.makeEnemy(id, level)]);
  const lowest = (ctx) => ctx.party.filter(p => p.alive).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];

  const PARTNERS = ["bronzeBeast", "spearTwinB"];   // fought together with another boss: not balanced alone
  // ================= hooks =================
  // Flying boss: takes half damage until it is broken (slowed twice), then it is grounded.
  HOOKS.airborne = { inMult(ctx, u) { return u.broken ? 1 : (u.airMult || 0.55); }, start(ctx, u) { Core.say(ctx, u.name + " wheels high above, out of easy reach."); } };
  // Burrows: hidden on even rounds (takes 20%), fire hits burn its roots; with the roots gone it is dragged out (broken for 3 turns).
  HOOKS.roots = {
    start(ctx, u) { u.roots = u.rootsMax || 4; u.hidden = false; },
    round(ctx, u) { if (!u.alive) return; if (u.broken || u.roots <= 0) { u.hidden = false; return; } u.hidden = ctx.round % 2 === 0; if (u.hidden) Core.say(ctx, u.name + " sinks into the roots."); else Core.say(ctx, u.name + " tears up out of the ground!"); },
    inMult(ctx, u, src, info) { if (!u.hidden) return 1; if (info && info.el === "fire") return 1; return 0.2; },
    hit(ctx, u, src, v, info) { if (u.hidden && info && info.el === "fire" && u.roots > 0 && v > 0) { u.roots--; Core.say(ctx, "A root burns away! (" + u.roots + " left)"); if (u.roots <= 0) { u.hidden = false; u.broken = 3; ctx.ev.push({ t: "broken", tgt: u }); } } },
  };
  // Charges lightning: if it is wet while it gathers the strike, it shocks itself (stunned, hurt) and the charge is gone.
  HOOKS.stormRam = {
    act(ctx, u) { if (u.charging && u.st.wet) { u.charging = null; ctx.telegraph = null; const v = Math.round(u.maxHp * 0.12); u.hp = Math.max(1, u.hp - v); ctx.ev.push({ t: "selfDmg", tgt: u, v }); Core.say(ctx, "The wet storm runs back into " + u.name + "!"); Core.addStatus(ctx, null, u, "stun", 1, { sure: 1 }); u.broken = 2; ctx.ev.push({ t: "broken", tgt: u }); delete u.st.wet; return true; } return false; },
  };
  // Heat: every round the party burns a little; broken (soaked twice) it stops.
  HOOKS.emberHeat = { round(ctx, u) { if (!u.alive || u.broken) return; ctx.party.filter(p => p.alive).forEach(p => Core.addStatus(ctx, u, p, "burn", 1, { sure: 1 })); Core.say(ctx, u.name + "'s heat rolls over the party."); } };
  // Three heads: while not all living heads are poisoned they mend each other; with all poisoned they take +50% and cannot heal.
  const heads = (ctx, u) => ctx.foes.filter(f => f.alive && f.id === u.id);
  HOOKS.gateHeads = {
    inMult(ctx, u) { const h = heads(ctx, u); return h.length && h.every(x => x.st.poison) ? 1.5 : 1; },
    round(ctx, u) { if (!u.alive) return; const h = heads(ctx, u); if (h[0] === u && h.length > 1 && !h.every(x => x.st.poison)) { const low = h.slice().sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0]; Core.healFlat(ctx, low, Math.round(low.maxHp * 0.06), { silent: 1 }); } },
  };
  // Prism: shows one element each round; spells of that element are reflected, the opposite element hurts it.
  const PRISM = ["fire", "water", "shock", "ice"], OPP = { fire: "water", water: "shock", shock: "ice", ice: "fire" };
  HOOKS.prism = {
    start(ctx, u) { HOOKS.prism.round(ctx, u); },
    round(ctx, u) { const el = PRISM[ctx.round % 4]; u.shown = el; u.reflect = [el]; u.rs = { [el]: 0.5, [OPP[el]]: -0.5 }; Core.say(ctx, u.name + " glows " + el + "."); },
  };
  // Something shields the boss while its helpers stand (damage x0.6).
  HOOKS.guarded = { inMult(ctx, u) { return ctx.foes.some(f => f.alive && f !== u && f.guards === u.id) ? 0.6 : 1; } };
  // Takes less damage until a named kind of break (u.softUntil): used for sky-stone-like shells.
  HOOKS.shell = { inMult(ctx, u) { return u.broken ? 1 : (u.shellMult || 0.7); } };
  // Round bell: every N rounds a toll stuns one hero (chance based on res).
  HOOKS.toll = { round(ctx, u) { if (!u.alive || (ctx.round % (u.tollEvery || 3))) return; const t = lowest(ctx); if (t) { Core.say(ctx, "The bell tolls."); Core.addStatus(ctx, u, t, "stun", 1, { chance: 0.7 }); } } };
  // Phase-locked break: each phase text names a break kind through the phase's own breakType (set in phases[]); nothing extra needed.

  // ================= helper creatures for fights =================
  const add = (id, name, profile, o) => Core.defEnemy(id, name, profile, Object.assign({ boss: false, legacy: 0, hpMult: 0.5, ab: [{ n: "Strike", p: 0.9 }] }, o));
  add("glowMoth", "Glowmoth", "flyer", { hpMult: 0.4, ab: [{ n: "Dust Cloud", p: 0.5, k: "spell", db: ["spd", -0.2, 2] }] });
  add("maelstromHead", "Maelstrom Head", "beast", { boss: true, hpMult: 1.6, dieWith: "motherOfTheMaelstrom", ab: [{ n: "Snap", p: 0.62, st: ["bleed", 1, 0.4], w: 4 }, { n: "Drag Under", p: 0.4, k: "spell", el: "water", st: ["wet", 1, 0.8], w: 2 }] });
  add("gateHoundHead", "Gate Hound Head", "beast", { boss: true, hpMult: 2.4, hooks: ["gateHeads"], riseWhile: "gateHoundHead", riseAfter: 2, riseFrac: 0.4, riseMax: 3, rs: { poison: 0 },
    ab: [{ n: "Rend", p: 0.55, w: 4 }, { n: "Howl", p: 0.28, aoe: 1, k: "spell", db: ["res", -0.15, 2], w: 2 }, { n: "Cerberus Bite", p: 0.45, st: ["bleed", 1, 0.5], w: 2 }] });
  add("ninthLegionShade", "Shade of the Ninth", "ghost", { hpMult: 0.9, immune: ["bleed", "poison"], ab: [{ n: "Spectral Gladius", p: 0.7 }, { n: "Cold Shield", ally: ["def", 0.2, 2], w: 1, if: "first" }] });
  add("hollowNestSpawn", "Nest Spawn", "swarm", { hpMult: 0.5, swarm: 1, actions: 2, ab: [{ n: "Skitter Bite", p: 0.35, st: ["poison", 1, 0.4] }] });
  add("mentorConstructA", "Ithiel's Construct", "tank", { boss: true, hpMult: 1.8, guards: "mentorIthiel", immune: ["poison", "bleed"], breakType: "impact", breakNeed: 2, ab: [{ n: "Iron Fist", p: 0.7, w: 4 }, { n: "Guard Pulse", ally: ["def", 0.25, 2], w: 1 }] });
  add("mentorConstructB", "Ithiel's Construct", "ghost", { boss: true, hpMult: 1.5, guards: "mentorIthiel", immune: ["poison", "bleed"], ab: [{ n: "Rune Bolt", p: 0.65, k: "spell", el: "light", w: 4 }, { n: "Mend", healAlly: 0.15, w: 1 }] });
  add("mentorConstructC", "Ithiel's Construct", "swift", { boss: true, hpMult: 1.4, guards: "mentorIthiel", immune: ["poison", "bleed"], ab: [{ n: "Needle Rush", p: 0.5, st: ["bleed", 1, 0.5], w: 4 }, { n: "Mark Prey", mark: 0.25, w: 1 }] });
  add("emperorGuard", "Imperial Guard", "human", { hpMult: 1.0, pr: 0.2, ab: [{ n: "Halberd", p: 0.8, w: 3 }, { n: "Shield Up", self: ["dr", 0.35, 1], w: 1 }] });
  add("naumachiaSailor", "Naumachia Marine", "human", { hpMult: 0.8, ab: [{ n: "Boarding Axe", p: 0.75, st: ["bleed", 1, 0.4] }] });
  add("sunTendril", "Sun Tendril", "ghost", { hpMult: 1.0, ab: [{ n: "Scorch", p: 0.5, k: "spell", el: "fire", st: ["burn", 1, 0.5] }] });
  add("deepLantern", "Deep Lantern", "caster", { hpMult: 0.8, ab: [{ n: "Lure Light", p: 0.5, k: "spell", db: ["res", -0.2, 2] }] });
  add("dreadShadeAdd", "Drowned Shade", "ghost", { hpMult: 0.9, immune: ["poison", "bleed"], ab: [{ n: "Cold Grasp", p: 0.6, k: "spell", el: "water", st: ["wet", 1, 0.5] }] });
  add("grandChampionPet", "Grand Champion's Hound", "beast", { hpMult: 1.4, ab: [{ n: "Maul", p: 0.7, st: ["bleed", 1, 0.5] }] });

  // ================= M2 (chapters 3-4) =================
  boss("fortCenturion", "Fort Ocelan Centurion", "human", 13, 170, "mid", { hpMult: 3.6, breakType: "impact", breakNeed: 2, pr: 0.15, drops: [["G42", 1]],
    intro: "The centurion draws a long gladius. \"This fort has held for forty years. It will hold for you.\"", bigEvery: 4, bigHit: 0.75, bigName: "Cohort Charge",
    ab: [{ n: "Gladius Strike", p: 0.75, w: 4 }, { n: "Shield Wall", self: ["dr", 0.4, 1], w: 2 }, { n: "Rally the Cohort", ally: ["atk", 0.2, 3], w: 1, if: "hasAlly" }, { n: "Pilum Volley", p: 0.35, aoe: 1, w: 2 }] });
  boss("windhollowGuardian", "Windhollow Guardian", "flyer", 18, 190, "guardian", { hpMult: 3.4, breakType: "slow", breakNeed: 2, hooks: ["airborne"], airMult: 0.7, immune: ["bleed"],
    intro: "A shape of feathers and wind unfolds in the hollow's mouth.", bigEvery: 3, bigHit: 0.75, bigName: "Gale Dive",
    ab: [{ n: "Wind Slash", p: 0.6, w: 4 }, { n: "Cutting Gust", p: 0.3, k: "spell", aoe: 1, db: ["spd", -0.2, 2], w: 2 }, { n: "Updraft", self: ["dr", 0.35, 1], w: 1 }] });
  boss("plumedCoil", "The Plumed Coil", "flyer", 21, 420, "titan", { hpMult: 7, actions: 2, breakType: "slow", breakNeed: 2, hooks: ["airborne"], airMult: 0.5, grow: ["atk", 0.04, 6], immune: ["bleed"], drops: [["G21", 1]],
    intro: "The canopy darkens. A feathered serpent as long as a river coils out of the sky.", bigEvery: 3, bigHit: 0.8, bigName: "Plumed Dive",
    ab: [{ n: "Feather Lash", p: 0.5, w: 5 }, { n: "Cyclone Coil", p: 0.3, k: "spell", aoe: 1, db: ["spd", -0.2, 2], w: 3 }, { n: "Preen the Plumes", self: ["dr", 0.3, 1], w: 1 }],
    phases: [{ hpMult: 6.5, bigEvery: 2, bigHit: 0.8, text: "The Plumed Coil screams. Every feather stands on end!", airMult: 0.45,
      ab: [{ n: "Feather Lash", p: 0.56, w: 5 }, { n: "Cyclone Coil", p: 0.34, k: "spell", aoe: 1, db: ["spd", -0.25, 2], w: 3 }, { n: "Thousand Feathers", p: 0.22, aoe: 1, hits: 3, w: 2 }] }] });
  boss("shearwing", "Shearwing", "swift", 14, 170, "legend", { hpMult: 3.2, breakType: "slow", breakNeed: 2, drops: [["G7", 1]],
    intro: "A giant harpy with wings like shears drops from the cliff. \"Few climb this far.\"",
    ab: [{ n: "Shearing Pass", p: 0.55, st: ["bleed", 1, 0.6], w: 4 }, { n: "Wing Slice", p: 0.35, aoe: 1, w: 2 }, { n: "Sky Veil", self: ["dr", 0.4, 1], w: 1 }] });
  boss("motherGlowmoth", "Mother Glowmoth", "caster", 18, 180, "legend", { hpMult: 3.4, breakType: "light", breakNeed: 2,
    intro: "The cave brightens. A moth the size of a house hangs in its own glow.",
    ab: [{ n: "Glow Dust", p: 0.5, k: "spell", el: "light", db: ["res", -0.2, 2], w: 4 }, { n: "Brood Call", summon: ["glowMoth", "glowMoth"], summonMax: 2, w: 2, if: "kids<:2" }, { n: "Healing Glow", healAll: 0.08, w: 2 }, { n: "Wing Beat", p: 0.28, aoe: 1, w: 1 }] });
// ================= M3 (chapters 5-6) =================
  boss("drownedShrineGuardian", "Drowned Shrine Guardian", "ghost", 29, 200, "guardian", { hpMult: 3.6, breakType: "shock", breakNeed: 2, rs: { water: 0.75, shock: -0.4, fire: 0.25 }, immune: ["bleed", "poison"],
    intro: "Black water pours from the shrine's mouth and stands up in the shape of a priest.", bigEvery: 3, bigHit: 0.75, bigName: "Flooded Hall",
    ab: [{ n: "Drowning Touch", p: 0.55, k: "spell", el: "water", st: ["wet", 1, 0.7], w: 4 }, { n: "Tide Mark", mark: 0.25, p: 0.3, k: "spell", el: "water", w: 2, if: "nomarked" }, { n: "Undertow", p: 0.28, k: "spell", el: "water", aoe: 1, db: ["spd", -0.2, 2], w: 2 }, { n: "Reclaim", healSelf: 0.08, w: 1, if: "hp<0.5" }] });
  boss("stoneGiant", "The Stone Giant", "tank", 31, 200, "guardian", { hpMult: 4, breakType: "impact", breakNeed: 3, pr: 0.25, rs: { earth: 0.5, water: -0.2 }, immune: ["bleed", "poison"],
    intro: "The quarry wall shrugs and a giant steps out of it.", bigEvery: 3, bigHit: 0.85, bigName: "Boulder Throw", bigSingle: 1,
    ab: [{ n: "Crush", p: 0.7, w: 5 }, { n: "Seize", p: 0.3, hold: 2, w: 2, if: "nobodyHeld" }, { n: "Quarry Slam", p: 0.3, aoe: 1, w: 2 }, { n: "Stone Skin", self: ["dr", 0.35, 1], w: 1 }] });
  boss("sunbirdGuardian", "Sunbird Guardian", "flyer", 34, 210, "guardian", { hpMult: 3.5, breakType: "water", breakNeed: 2, rs: { fire: 0.75, water: -0.5, ice: -0.25 }, hooks: ["airborne"], airMult: 0.75,
    intro: "The roost burns white. A bird made of noon sunlight spreads its wings.", bigEvery: 3, bigHit: 0.8, bigName: "Noon Dive",
    ab: [{ n: "Sun Talon", p: 0.55, el: "fire", st: ["burn", 1, 0.5], w: 4 }, { n: "Solar Flare", p: 0.3, k: "spell", el: "fire", aoe: 1, st: ["burn", 1, 0.5], w: 3 }, { n: "Heat Shimmer", self: ["dr", 0.3, 1], healSelf: 0.06, w: 1 }] });
  boss("motherOfTheMaelstrom", "Mother of the Maelstrom", "tank", 32, 420, "optTitan", { hpMult: 8, coverBy: "maelstromHead", breakType: "st_chill", breakNeed: 2, rs: { water: 0.75, ice: -0.25, shock: -0.25 }, immune: ["bleed", "poison"], hooks: ["maelstrom"], drops: [["G32", 1]],
    intro: "The sea folds in on itself. Something old turns in the whirlpool, and many mouths open.", bigEvery: 3, bigHit: 0.8, bigName: "Maelstrom",
    ab: [{ n: "Whirlpool", p: 0.4, k: "spell", el: "water", hold: 2, st: ["wet", 1, 0.9], w: 4, if: "nobodyHeld" }, { n: "Crushing Tide", p: 0.55, k: "spell", el: "water", w: 4 }, { n: "Spiral Surge", p: 0.28, k: "spell", el: "water", aoe: 1, st: ["wet", 1, 0.5], w: 2 }],
    phases: [{ hpMult: 6, bigEvery: 2, text: "The whirlpool opens wider. The sea itself rises to fight!", ab: [{ n: "Whirlpool", p: 0.44, k: "spell", el: "water", hold: 2, st: ["wet", 1, 0.9], w: 4, if: "nobodyHeld" }, { n: "Crushing Tide", p: 0.6, k: "spell", el: "water", w: 4 }, { n: "Spiral Surge", p: 0.32, k: "spell", el: "water", aoe: 1, st: ["wet", 1, 0.5], w: 3 }] }] });
  HOOKS.maelstrom = { start(ctx, u) { addUnits(ctx, u, ["maelstromHead", "maelstromHead"], 0); Core.say(ctx, "Two heads rise out of the foam beside the Mother."); } };
  BOSS_FOES.motherOfTheMaelstrom = lv => [Core.makeEnemy("motherOfTheMaelstrom", lv)];   // the two heads arrive through the start hook
  boss("emberWolf", "The Ember Wolf", "swift", 34, 420, "optTitan", { hpMult: 7.5, breakType: "st_wet", breakNeed: 2, rs: { fire: 1, water: -0.5, ice: -0.3 }, hooks: ["emberHeat"], grow: ["spd", 0.07, 6], immune: ["burn", "bleed"], drops: [["G31", 1]],
    intro: "A wolf of living flame lopes down the slope, chasing a sun that is not there.", bigEvery: 3, bigHit: 0.8, bigName: "Sun Chase",
    ab: [{ n: "Burning Fang", p: 0.55, el: "fire", st: ["burn", 1, 0.5], w: 5 }, { n: "Cinder Howl", p: 0.28, k: "spell", el: "fire", aoe: 1, w: 3 }, { n: "Flame Dash", p: 0.4, self: ["dr", 0.3, 1], w: 2 }],
    phases: [{ hpMult: 6, bigEvery: 2, text: "The Ember Wolf burns white. It runs faster than the eye can follow!", grow: ["spd", 0.09, 6], ab: [{ n: "Burning Fang", p: 0.6, el: "fire", st: ["burn", 1, 0.6], w: 5 }, { n: "Cinder Howl", p: 0.32, k: "spell", el: "fire", aoe: 1, w: 3 }, { n: "Flame Dash", p: 0.44, self: ["dr", 0.3, 1], w: 2 }] }] });
  boss("gateHound", "The Gate Hound", "beast", 36, 400, "optTitan", { hpMult: 2.4, hooks: ["gateHeads"], riseWhile: "gateHound", riseAfter: 2, riseFrac: 0.4, riseMax: 3, art: "gateHound", drops: [["G22", 1]], breakType: "st_poison", breakNeed: 2, actions: 2,
    intro: "Three heads lift from the dark, and not one of them is looking at you alone.",
    ab: [{ n: "Rend", p: 0.58, w: 4 }, { n: "Howl", p: 0.28, aoe: 1, k: "spell", db: ["res", -0.15, 2], w: 2 }, { n: "Cerberus Bite", p: 0.48, st: ["bleed", 1, 0.5], w: 2 }] });
  BOSS_FOES.gateHound = lv => ["", " B", " C"].map(t => { const u = Core.makeEnemy("gateHound", lv, t); if (t) { u.xpAbs = 0; u.goldAbs = 0; u.drops = []; } else { u.xpAbs = Math.round(u.xpAbs * 1); } return u; });
  boss("bronzeChampion", "Bronze Cup Champion", "human", 35, 190, "cup", { hpMult: 3.6, breakType: "impact", breakNeed: 2, pr: 0.2, drops: [],
    intro: "The crowd roars. The Bronze Champion salutes with a trident and a net.", bigEvery: 3, bigHit: 0.75, bigName: "Net and Trident",
    ab: [{ n: "Trident", p: 0.65, w: 4 }, { n: "Throw the Net", p: 0.3, hold: 2, w: 2, if: "nobodyHeld" }, { n: "Crowd Pleaser", self: ["atk", 0.3, 3], empower: ["atk", 0.3, 3], w: 1, if: "hasAlly" }, { n: "Sand Kick", db: ["spd", -0.25, 2], w: 1 }] });
  boss("bronzeBeast", "Bronze Cup Beast", "beast", 35, 190, "cup", { hpMult: 2.4, drops: [["G1", 1]], breakType: "impact", breakNeed: 2, ab: [{ n: "Maul", p: 0.65, st: ["bleed", 1, 0.5], w: 4 }, { n: "Bellow", p: 0.28, aoe: 1, k: "spell", db: ["atk", -0.15, 2], w: 1 }] });
  BOSS_FOES.bronzeChampion = lv => [Core.makeEnemy("bronzeChampion", lv), Core.makeEnemy("bronzeBeast", lv)];
  boss("oldHollowbell", "Old Hollowbell", "tank", 30, 200, "legend", { hpMult: 4, hooks: ["toll"], tollEvery: 3, breakType: "impact", breakNeed: 2, immune: ["bleed", "poison"],
    intro: "A great bronze bell drags itself out of the mud, and it rings as it walks.",
    ab: [{ n: "Bell Slam", p: 0.65, w: 4 }, { n: "Deafening Peal", p: 0.3, k: "spell", aoe: 1, db: ["res", -0.2, 2], w: 2 }, { n: "Resound", self: ["dr", 0.35, 1], w: 1 }] });
  boss("blackPearlHermit", "The Black Pearl Hermit", "caster", 33, 210, "legend", { hpMult: 3.6, breakType: "react", breakNeed: 2, rs: { water: 0.5, shock: -0.25 }, drops: [["G36", 1]],
    intro: "A shell as black as a closed eye turns. \"You carry things that glitter. Leave them.\"",
    ab: [{ n: "Pearl Beam", p: 0.6, k: "spell", el: "water", w: 4 }, { n: "Cold Pearl", steal: 1, p: 0.3, k: "spell", w: 2 }, { n: "Shell Shut", shield: 0.1, self: ["dr", 0.35, 1], w: 1 }, { n: "Black Tide", p: 0.28, k: "spell", el: "water", aoe: 1, st: ["wet", 1, 0.5], w: 2 }] });
  // ============ PART2-END ============

// ================= M4 (chapters 7-9) =================
  boss("veiledCisternGuardian", "Veiled Cistern Guardian", "ghost", 47, 210, "guardian", { hpMult: 3.8, breakType: "react", breakNeed: 2, immune: ["bleed", "poison"], rs: { water: 0.5, shock: -0.3 },
    intro: "A veil hangs in the cistern's centre. Behind it, something turns its head.", bigEvery: 3, bigHit: 0.8, bigName: "Veil of Drowning",
    ab: [{ n: "Veiled Touch", p: 0.6, k: "spell", el: "water", w: 4 }, { n: "Bind in Cloth", p: 0.3, k: "spell", hold: 2, w: 2, if: "nobodyHeld" }, { n: "Whisper of the Well", mark: 0.25, k: "spell", w: 2, if: "nomarked" }, { n: "Fold the Veil", self: ["dr", 0.35, 1], w: 1 }] });
  boss("hollowNestGuardian", "Hollow Nest Guardian", "swarm", 55, 220, "guardian", { hpMult: 4, breakType: "fire", breakNeed: 2, rs: { fire: -0.4, poison: 0.5 }, immune: ["poison"],
    intro: "The tree's heart is hollow, and the hollow is full of legs.", bigEvery: 3, bigHit: 0.8, bigName: "Nest Surge",
    ab: [{ n: "Chitin Lash", p: 0.58, w: 4 }, { n: "Hatch", summon: ["hollowNestSpawn", "hollowNestSpawn"], summonMax: 3, w: 3, if: "kids<:3" }, { n: "Venom Cloud", p: 0.28, k: "spell", el: "poison", aoe: 1, st: ["poison", 1, 0.6], w: 2 }, { n: "Brood Mend", healAll: 0.05, w: 1 }] });
  boss("rootGnawer", "The Root Gnawer", "beast", 57, 440, "titan", { hpMult: 7.5, breakType: "fire", breakNeed: 99, hooks: ["roots"], rootsMax: 4, immune: ["bleed"], rs: { fire: -0.3, water: 0.25 }, drops: [["G29", 1]],
    intro: "The roots of the world-tree tremble. Something has been chewing them for ten thousand years.", bigEvery: 3, bigHit: 0.85, bigName: "Gnaw the World",
    ab: [{ n: "Gnash", p: 0.6, st: ["bleed", 1, 0.5], w: 5 }, { n: "Root Lash", p: 0.32, aoe: 1, hold: 2, w: 2, if: "nobodyHeld" }, { n: "Tunnel Quake", p: 0.3, aoe: 1, db: ["spd", -0.2, 2], w: 2 }, { n: "Burrow Mend", healSelf: 0.05, w: 1, if: "hp<0.6" }],
    phases: [{ hpMult: 6.5, text: "The Root Gnawer screams and the whole ground splits!", bigEvery: 2, ab: [{ n: "Gnash", p: 0.66, st: ["bleed", 1, 0.5], w: 5 }, { n: "Root Lash", p: 0.34, aoe: 1, hold: 2, w: 2, if: "nobodyHeld" }, { n: "Tunnel Quake", p: 0.34, aoe: 1, db: ["spd", -0.2, 2], w: 3 }] }] });
  boss("ghostOfTheNinthLegion", "Ghost of the Ninth Legion", "ghost", 46, 220, "legend", { hpMult: 3.8, breakType: "light", breakNeed: 2, immune: ["bleed", "poison"], rs: { light: -0.5, dark: 0.5 },
    intro: "Banners nobody has carried for a century rise out of the dust. Under them, a legion with no faces.",
    ab: [{ n: "Spectral Gladius", p: 0.62, w: 4 }, { n: "Raise the Banner", summon: ["ninthLegionShade"], summonMax: 2, w: 2, if: "kids<:2" }, { n: "Cold Order", empower: ["atk", 0.25, 3], w: 1, if: "hasAlly" }, { n: "Wail of the Fallen", p: 0.28, k: "spell", aoe: 1, db: ["res", -0.2, 2], w: 2 }] });
  boss("spearTwinA", "Spear Twin Ahiq", "human", 48, 220, "cup", { hpMult: 3, breakType: "impact", breakNeed: 2, guards: "spearTwinB",
    intro: "Two spears flash in the Iron Cup sand. \"One fights. The other finishes.\"", bigEvery: 3, bigHit: 0.75, bigName: "Twin Thrust",
    ab: [{ n: "Spear Thrust", p: 0.62, tgt: "front", w: 4 }, { n: "Cover Brother", self: ["dr", 0.3, 1], w: 1 }, { n: "Rally the Twin", empower: ["atk", 0.3, 3], w: 2, if: "hasAlly" }] });
  boss("spearTwinB", "Spear Twin Bahiq", "human", 48, 220, "cup", { hpMult: 3, breakType: "impact", breakNeed: 2, drops: [["G2", 1]], guards: "spearTwinA",
    ab: [{ n: "Finishing Thrust", p: 0.7, tgt: "weak", w: 4 }, { n: "Spear Rain", p: 0.28, aoe: 1, w: 2 }, { n: "Rally the Twin", empower: ["atk", 0.3, 3], w: 2, if: "hasAlly" }] });
  BOSS_FOES.spearTwinA = lv => [Core.makeEnemy("spearTwinA", lv), Core.makeEnemy("spearTwinB", lv)];
  HOOKS.twins = { };
  Core.ENEMIES.spearTwinA.hooks = ["guarded"]; Core.ENEMIES.spearTwinB.hooks = ["guarded"];

  // ================= M5 (chapters 10-11, post-game) =================
  boss("prismGuardian", "Prism Guardian", "caster", 60, 220, "guardian", { hpMult: 3.8, hooks: ["prism"], breakType: "react", breakNeed: 2, immune: ["bleed", "poison"],
    intro: "A crystal wakes in the sanctum and splits the light into four.", bigEvery: 3, bigHit: 0.8, bigName: "Prismatic Beam",
    ab: [{ n: "Refraction", p: 0.58, k: "spell", w: 4, el: "light" }, { n: "Spectrum Burst", p: 0.3, k: "spell", aoe: 1, w: 3, el: "light" }, { n: "Facet Shield", self: ["dr", 0.3, 1], w: 1 }] });
  boss("mentorIthiel", "Master Ithiel", "caster", 61, 480, "end", { hpMult: 6.5, hooks: ["guarded"], breakType: "react", breakNeed: 2, immune: ["bleed", "poison"],
    intro: "\"You came all this way to ask me why. I will answer you with the thing I taught you best.\"", bigEvery: 3, bigHit: 0.85, bigName: "Rune of Ending",
    ab: [{ n: "Rune Lance", p: 0.62, k: "spell", el: "light", w: 4 }, { n: "Binding Rune", p: 0.3, k: "spell", hold: 2, w: 2, if: "nobodyHeld" }, { n: "Empower Construct", empower: ["atk", 0.3, 3], w: 2, if: "hasAlly" }, { n: "Repair Rune", healAlly: 0.2, w: 2, if: "hurtAlly:0.6" }, { n: "Call Back", reviveAlly: 0.6, w: 3, if: "deadAlly" }, { n: "Lesson in Pain", mark: 0.3, p: 0.3, k: "spell", w: 1, if: "nomarked" }],
    phases: [{ hpMult: 5, text: "Ithiel throws off his sleeves. \"Enough of the teacher.\"", bigEvery: 2, ab: [{ n: "Rune Lance", p: 0.7, k: "spell", el: "light", w: 4 }, { n: "Binding Rune", p: 0.34, k: "spell", hold: 2, w: 2, if: "nobodyHeld" }, { n: "Rune Storm", p: 0.3, k: "spell", aoe: 1, w: 3 }, { n: "Lesson in Pain", mark: 0.3, p: 0.34, k: "spell", w: 1, if: "nomarked" }] }] });
  BOSS_FOES.mentorIthiel = lv => [Core.makeEnemy("mentorIthiel", lv), Core.makeEnemy("mentorConstructA", lv, ""), Core.makeEnemy("mentorConstructB", lv, ""), Core.makeEnemy("mentorConstructC", lv, "")].map((u, i) => { u.guards = i ? "mentorIthiel" : u.guards; if (i) { u.xpAbs = 0; u.goldAbs = 0; u.name = ["", "Stone Construct", "Rune Construct", "Needle Construct"][i]; } return u; });
  boss("stormRam", "The Storm Ram", "brute", 62, 440, "titan", { hpMult: 8, hooks: ["stormRam"], bigEvery: 3, bigHit: 1.0, bigName: "Thunder Charge", breakType: "st_wet", breakNeed: 99, rs: { shock: 1, water: -0.25 }, immune: ["bleed"], drops: [["G33", 1]],
    intro: "Thunder walks the ridge on four legs. Its horns spit white fire.",
    ab: [{ n: "Horn Ram", p: 0.68, w: 5 }, { n: "Static Bolt", p: 0.34, k: "spell", el: "shock", aoe: 1, st: ["shock", 1, 0.5], w: 3 }, { n: "Charge the Sky", self: ["atk", 0.15, 2], w: 1 }],
    phases: [{ hpMult: 7, bigEvery: 2, text: "Lightning wraps the Storm Ram. The sky answers it!", ab: [{ n: "Horn Ram", p: 0.74, w: 5 }, { n: "Static Bolt", p: 0.38, k: "spell", el: "shock", aoe: 1, st: ["shock", 1, 0.6], w: 3 }, { n: "Chain Lightning", p: 0.3, k: "spell", el: "shock", aoe: 1, hits: 2, w: 2 }] }] });
  boss("veilStag", "The Veil Stag", "ghost", 59, 220, "legend", { hpMult: 3.8, breakType: "light", breakNeed: 2, immune: ["bleed", "poison"], drops: [],
    intro: "A stag steps out of the mist. Its antlers hold a lantern that is not lit.",
    ab: [{ n: "Antler Sweep", p: 0.6, w: 4 }, { n: "Mist Walk", self: ["dr", 0.45, 1], w: 2 }, { n: "Soul Dew", p: 0.28, k: "spell", el: "light", healSelf: 0.06, w: 2 }, { n: "Gentle Terror", p: 0.28, k: "spell", aoe: 1, db: ["atk", -0.2, 2], w: 2 }] });
  boss("emperorDavichi", "Emperor Davichi", "human", 68, 600, "end", { hpMult: 7, breakType: "impact", breakNeed: 3, pr: 0.2, art: "emperorDavichi", immune: ["poison"],
    intro: "The emperor rises from the throne he refused to leave. \"Do you know what I built this for?\"", bigEvery: 3, bigHit: 0.9, bigName: "Sun Edict",
    ab: [{ n: "Imperial Blade", p: 0.7, w: 5 }, { n: "Call the Guard", summon: ["emperorGuard"], summonMax: 2, w: 2, if: "kids<:2" }, { n: "Edict of Binding", p: 0.3, hold: 2, w: 2, if: "nobodyHeld" }, { n: "Mark of the Sun", mark: 0.3, w: 1, if: "nomarked" }, { n: "Sunlit Sweep", p: 0.3, aoe: 1, el: "fire", w: 2 }],
    phases: [{ hpMult: 6, text: "The emperor drops his crown. Under it, a tired man with a ledger in his hand.", bigEvery: 3, ab: [{ n: "Imperial Blade", p: 0.78, w: 5 }, { n: "Edict of Binding", p: 0.34, hold: 2, w: 2, if: "nobodyHeld" }, { n: "Sunlit Sweep", p: 0.34, aoe: 1, el: "fire", w: 3 }, { n: "Mark of the Sun", mark: 0.3, w: 1, if: "nomarked" }] },
      { hpMult: 5, text: "\"Then watch it all burn.\" The throne room fills with light.", bigEvery: 2, grow: ["atk", 0.05, 6], ab: [{ n: "Imperial Blade", p: 0.84, w: 5 }, { n: "Sunlit Sweep", p: 0.38, aoe: 1, el: "fire", w: 4 }, { n: "Edict of Binding", p: 0.36, hold: 2, w: 2, if: "nobodyHeld" }] }] });
  boss("sunEater", "The Sun Eater", "ghost", 70, 700, "titan", { hpMult: 9, grow: ["atk", 0.04, 8], breakType: "slow", breakNeed: 2, immune: ["bleed", "poison"], rs: { fire: 0.5, water: -0.2 }, drops: [["G25", 1]],
    intro: "Under the pyramid, the dark opens like a mouth that has been waiting for the day.", bigEvery: 3, bigHit: 0.9, bigName: "Eclipse",
    ab: [{ n: "Devour Light", p: 0.62, k: "spell", el: "dark", w: 5 }, { n: "Black Corona", p: 0.3, k: "spell", el: "dark", aoe: 1, db: ["res", -0.2, 2], w: 3 }, { n: "Feed on Offerings", healSelf: 0.04, summon: ["sunTendril"], summonMax: 2, w: 2, if: "kids<:2" }],
    phases: [
      { hpMult: 8, breakType: "st_wet", breakNeed: 2, bigEvery: 3, text: "The Sun Eater swallows the torches. The dark turns cold and wet with ash.", ab: [{ n: "Devour Light", p: 0.68, k: "spell", el: "dark", w: 5 }, { n: "Black Corona", p: 0.34, k: "spell", el: "dark", aoe: 1, db: ["res", -0.2, 2], w: 3 }, { n: "Mark of the Eater", mark: 0.3, w: 1, if: "nomarked" }] },
      { hpMult: 8, breakType: "fire", breakNeed: 2, bigEvery: 3, text: "It burns from inside. The swallowed sun fights back.", ab: [{ n: "Sun Rend", p: 0.7, k: "spell", el: "fire", w: 5 }, { n: "Solar Flare", p: 0.36, k: "spell", el: "fire", aoe: 1, st: ["burn", 2, 0.7], w: 3 }, { n: "Feed on Offerings", healSelf: 0.04, summon: ["sunTendril"], summonMax: 2, w: 2, if: "kids<:2" }] },
      { hpMult: 8, breakType: "impact", breakNeed: 3, bigEvery: 2, text: "The Sun Eater stops pretending to be anything but hunger.", grow: ["atk", 0.06, 8], ab: [{ n: "Devour Everything", p: 0.78, k: "spell", el: "dark", w: 5 }, { n: "Black Corona", p: 0.4, k: "spell", el: "dark", aoe: 1, w: 4 }, { n: "Swallow the Sky", mark: 0.3, p: 0.3, k: "spell", w: 1, if: "nomarked" }] }] });
  boss("lastWarden", "The Last Warden", "tank", 75, 240, "legend", { hpMult: 4.2, breakType: "impact", breakNeed: 3, pr: 0.3, immune: ["bleed", "poison"], drops: [],
    intro: "A guardian in builder-bronze lifts a hand. \"The island is closed. It has always been closed.\"", bigEvery: 3, bigHit: 0.85, bigName: "Warden's Verdict",
    ab: [{ n: "Bronze Fist", p: 0.68, w: 5 }, { n: "Shackle", p: 0.3, hold: 2, w: 2, if: "nobodyHeld" }, { n: "Seal the Ground", p: 0.28, aoe: 1, db: ["spd", -0.25, 2], w: 2 }, { n: "Ward", self: ["dr", 0.35, 1], w: 1 }] });
  boss("mawmotherOfTheDeep", "Mawmother of the Deep", "tank", 80, 250, "legend", { hpMult: 4.4, breakType: "st_chill", breakNeed: 2, rs: { water: 0.6, ice: -0.3, shock: -0.3 }, drops: [["G37", 1]],
    intro: "The drowned street floods. Something with too many teeth opens under it.", bigEvery: 3, bigHit: 0.85, bigName: "Maw of the Deep",
    ab: [{ n: "Crushing Maw", p: 0.7, w: 5 }, { n: "Pull Under", p: 0.3, k: "spell", el: "water", hold: 2, w: 2, if: "nobodyHeld" }, { n: "Brood Call", summon: ["dreadShadeAdd"], summonMax: 2, w: 2, if: "kids<:2" }, { n: "Black Water", p: 0.3, k: "spell", el: "water", aoe: 1, st: ["wet", 1, 0.6], w: 2 }] });
  boss("lanternDeepGuardian", "Lantern Deep Guardian", "ghost", 82, 250, "guardian", { hpMult: 4.4, breakType: "react", breakNeed: 2, immune: ["bleed", "poison"], drops: [["G40", 1]],
    intro: "A thousand lanterns burn in the dark below. The tallest one turns toward you.", bigEvery: 3, bigHit: 0.85, bigName: "Lanternfall",
    ab: [{ n: "Lantern Lash", p: 0.64, k: "spell", el: "light", w: 4 }, { n: "Lure Light", summon: ["deepLantern"], summonMax: 2, w: 2, if: "kids<:2" }, { n: "Dazzle", p: 0.3, k: "spell", aoe: 1, db: ["res", -0.25, 2], w: 2 }, { n: "Smother Flame", mark: 0.3, w: 1, if: "nomarked" }] });
  boss("naumachiaAdmiral", "Naumachia Admiral", "human", 62, 230, "cup", { hpMult: 4, breakType: "impact", breakNeed: 2, pr: 0.2, drops: [["G39", 1]],
    intro: "The arena floods and the admiral stands on the prow of a wrecked galley. \"Boarders!\"", bigEvery: 3, bigHit: 0.8, bigName: "Ramming Speed",
    ab: [{ n: "Cutlass", p: 0.68, st: ["bleed", 1, 0.4], w: 4 }, { n: "Boarders Away", summon: ["naumachiaSailor"], summonMax: 2, w: 2, if: "kids<:2" }, { n: "Grapple", p: 0.3, hold: 2, w: 2, if: "nobodyHeld" }, { n: "Broadside", p: 0.3, aoe: 1, w: 2 }] });
  boss("grandChampion", "The Grand Champion", "human", 85, 260, "cup", { hpMult: 4.4, breakType: "impact", breakNeed: 3, pr: 0.2, drops: [["G46", 1]],
    intro: "The Grand Cup crowd stands. The champion has not lost in eleven years.", bigEvery: 3, bigHit: 0.9, bigName: "Champion's Blow",
    ab: [{ n: "Gladius and Shield", p: 0.7, w: 5 }, { n: "Crowd Roar", self: ["atk", 0.2, 3], empower: ["atk", 0.2, 3], w: 2 }, { n: "Whistle the Hound", summon: ["grandChampionPet"], summonMax: 1, w: 2, if: "kids<:1" }, { n: "Arena Sweep", p: 0.32, aoe: 1, w: 2 }, { n: "Disarm", steal: 1, p: 0.3, w: 1 }] });
  PARTNERS.forEach(id => delete BOSS_META[id]);
  // ============ PART3-END ============

})(typeof window !== "undefined" ? window : globalThis);
