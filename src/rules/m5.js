// Field enemies, rule hooks and encounter tables for milestone M5: chapters 10 and 11 and the post-game (owner: STORY-M5).
// Core.defEnemy(id, name, profile, o) / Core.ENCOUNTERS[id] = [Core.encT(foes, weight, lo, hi), ...]  (src/core.js "enemies"; ability fields documented above en()).
// Shared soldiers (legion, palace, priests) are defined here only when an earlier milestone file has not defined them (this file loads last).
// Bosses live in src/rules/bosses.js (RULES-BOSS); this file only patches their art ids (see "art" at the bottom).
(function (root) {
  const Core = root.Core || require("../core.js");
  const H = Core.HOOKS, X = Core.EFFECTS, K = Core.CONDS, T = Core.encT;
  const HK = 0.8;   // one knob for the HP of every field enemy defined here (test-m5.js: fights of 30-60 s, about 12-18% HP lost)
  const E = (id, name, profile, o) => { if (!Core.ENEMIES[id]) Core.defEnemy(id, name, profile, id === "prismTarget" ? o : Object.assign({}, o, { hpMult: +(o.hpMult * HK).toFixed(3) })); };

  // ---------- rule pieces used by the enemies below ----------
  K.notSummoned = (ctx, e) => !e.summoned;                       // a split-off Prism Sprite never splits again
  X.copyBuff = (ctx, e, ab, tgt, targets) => {                    // Mirror Moth: the strongest glow on the party appears on the moth too
    const list = [].concat(...(targets || ctx.party).filter(p => p.alive).map(p => p.buffs.filter(b => b.val > 0 && b.turns < 50 && b.type !== "taunt" && b.type !== "cover")));
    const b = list.sort((x, y) => y.val - x.val)[0]; if (!b) return;
    Core.addBuff(e, b.type, b.val, b.turns, { force: 1 }); ctx.ev.push({ t: "buff", tgt: e, stat: b.type, val: b.val }); Core.say(ctx, e.name + " copies the glow and wears it.");
  };
  X.blindNext = (ctx, e, ab, tgt) => {                            // Eclipse Moth, Staredrinker: the creature loses an action at its next turn
    if (tgt && tgt.alive) { tgt.loseAct = (tgt.loseAct || 0) + 1; Core.say(ctx, tgt.name + " is blinded and will lose an action."); }
  };
  H.mirrorTurn = {                                                // Refraction Golem: the first element that touches it is reflected from then on
    hit(ctx, u, src, v, info) {
      if (u.mirrorEl || !info || !info.el || info.el === "self" || src.side === u.side) return;
      u.mirrorEl = info.el; u.reflect = [info.el]; Core.say(ctx, u.name + "'s mirrors turn to face " + info.el + ". It will throw that back.");
    },
  };
  H.lensBack = {                                                  // Hollow Lens: swallows most of every spell and throws a spark of it back at the caster; blows and moves that are not spells pass
    inMult(ctx, u, src, info) { return info && info.kind === "spell" && src && src.side !== u.side ? 0.45 : 1; },
    hit(ctx, u, src, v, info) { if (info && info.kind === "spell" && src && src.side !== u.side && src.alive && !(info.tg && info.tg.refl)) { Core.say(ctx, u.name + " throws a spark of it back!"); Core.damage(ctx, u, src, 0.3, "spell", { el: info.el, refl: 1, off: 1 }); } },
  };
  // The door of the Prism Archive: a target that wants one named reaction (u.door = "Steam" | "Conductive" | "Freeze"). It barely takes damage;
  // the right reaction breaks it and the door opens (it dies); any other reaction is ignored.
  H.doorReact = {
    start(ctx, u) { Core.say(ctx, "The glass door shows two glyphs: " + (u.doorGlyphs || u.door) + "."); },
    inMult() { return 0.04; },
    broken(ctx, u) {
      let r = null; for (let i = ctx.ev.length - 1; i >= 0; i--) { const e = ctx.ev[i]; if (e.t === "reaction" && e.tgt === u) { r = e.name; break; } }
      u.broken = 0; u.breakPts = 0;
      if (r === u.door) { u.doorOpen = true; Core.say(ctx, "The glyphs flare. The glass door clicks open."); u.hp = 0; Core.die(ctx, u); }
      else Core.say(ctx, "The glyphs flicker and go dim. " + (r || "That") + " is not what the door asks for.");
    },
  };

  // ---------- shared soldiers (earlier milestones may already have defined them) ----------
  E("legionShieldbearer", "Legion Shieldbearer", "human", { hpMult: 0.55, pr: 0.4, ab: [{ n: "Shield Bash", p: 0.8, db: ["spd", -0.2, 2], w: 2 }, { n: "Gladius", p: 1.0, w: 3 }, { n: "Close Ranks", self: ["dr", 0.3, 1], w: 1 }] });
  E("legionSpearman", "Legion Spearman", "human", { hpMult: 0.45, ab: [{ n: "Spear Thrust", p: 1.15, tgt: "front", w: 3 }, { n: "Braced Spear", p: 0.9, st: ["bleed", 1, 0.3], w: 1 }] });
  E("legionArcher", "Legion Archer", "human", { hpMult: 0.35, ab: [{ n: "Aimed Shot", p: 1.1, tgt: "weak", w: 3 }, { n: "Volley", p: 0.4, aoe: 1, w: 1 }] });
  E("legionSlinger", "Legion Slinger", "human", { hpMult: 0.35, ab: [{ n: "Sling Stone", p: 1.2, tgt: "weak", w: 3 }, { n: "Lead Shot", p: 0.8, tgt: "weak", st: ["bleed", 1, 0.35], w: 1 }] });
  E("legionCenturion", "Legion Centurion", "human", { hpMult: 0.8, pr: 0.15, ab: [{ n: "Gladius Strike", p: 1.0, w: 4 }, { n: "Shield Bash", p: 0.7, db: ["spd", -0.25, 2], w: 2 }, { n: "Hold the Line", ally: ["def", 0.2, 3], w: 2, if: "hasAlly" }] });
  E("palaceGuard", "Palace Guard", "human", { hpMult: 0.7, pr: 0.25, ab: [{ n: "Halberd", p: 1.1, w: 3 }, { n: "Cross Guard", self: ["dr", 0.3, 1], w: 1 }, { n: "Shield Rush", p: 0.8, db: ["def", -0.15, 2], w: 1 }] });
  E("courtPriest", "Court Priest", "human", { hpMult: 0.6, ab: [{ n: "Sun Blessing", healAlly: 0.2, w: 2, if: "hurtAlly:0.6" }, { n: "Edict of Silence", p: 0.6, k: "spell", db: ["pow", -0.25, 2], w: 2 }, { n: "Censer Flame", p: 0.9, k: "spell", el: "fire", st: ["burn", 1, 0.4], w: 3 }] });
  E("jaguarCohortElite", "Jaguar Cohort Elite", "human", { hpMult: 0.85, actions: 2, ab: [{ n: "Pounce", p: 0.75, st: ["bleed", 1, 0.4], w: 3 }, { n: "Obsidian Blade", p: 0.7, w: 3 }, { n: "Net Throw", p: 0.4, db: ["spd", -0.25, 2], w: 1 }] });

  // ---------- chapter 10: the war zone, the church, the storm, the light-lab ----------
  E("standardBearer", "Standard-Bearer", "human", { hpMult: 0.45, ab: [{ n: "Raise the Standard", ally: ["atk", 0.15, 2], w: 4 }, { n: "Pole Strike", p: 0.7, w: 1 }] });
  E("siegeBallista", "Siege Ballista", "tank", { hpMult: 0.7, immune: ["poison", "bleed"], rs: { fire: -0.5, shock: 0.25 }, breakType: "fire", ab: [{ n: "Heavy Bolt", p: 1.9, tgt: "weak", if: "every:2", w: 6 }, { n: "Wind the Winch", self: ["spd", 0.1, 1], w: 1 }] });
  E("spiritPriest", "Spirit Priest", "ghost", { hpMult: 0.6, immune: ["bleed", "poison"], rs: { water: -0.25, dark: 0.25 }, ab: [{ n: "Mend the Faithful", healAlly: 0.2, w: 3, if: "hurtAlly:0.7" }, { n: "Curse of Ash", p: 0.7, k: "spell", db: ["res", -0.2, 3], w: 3 }, { n: "Candle Flame", p: 0.9, k: "spell", el: "fire", st: ["burn", 1, 0.4], w: 2 }] });
  E("candleWraith", "Candle Wraith", "ghost", { hpMult: 0.55, immune: ["bleed"], rs: { fire: 0.75, water: -0.75 }, breakType: "water", ab: [{ n: "Melt Touch", p: 0.9, k: "spell", el: "fire", st: ["burn", 1, 0.5], w: 3 }, { n: "Wax Drip", p: 0.5, k: "spell", db: ["spd", -0.25, 2], w: 2 }] });
  E("boneChoir", "Bone Choir", "caster", { hpMult: 0.7, immune: ["poison", "bleed"], breakType: "impact", rs: { fire: 0.25 }, ab: [{ n: "Dirge", p: 0.55, k: "spell", aoe: 1, w: 2 }, { n: "Hush", p: 0.4, k: "spell", db: ["pow", -0.3, 2], steal: 1, w: 2 }, { n: "Rib Clatter", p: 0.8, w: 2 }] });
  E("stormRoc", "Storm Roc", "flyer", { hpMult: 0.8, rs: { shock: 0.75, water: -0.4, ice: -0.25 }, ab: [{ n: "Talon Dive", p: 1.25, w: 3 }, { n: "Thunderclap", p: 0.5, k: "spell", el: "shock", aoe: 1, st: ["shock", 1, 0.4], w: 2 }] });
  E("thunderRamCalf", "Thunder Ram Calf", "brute", { hpMult: 0.7, rs: { shock: 0.75, water: -0.4 }, bigEvery: 3, bigHit: 1.5, bigName: "Spark Charge", bigSingle: 1, ab: [{ n: "Spark Butt", p: 1.0, st: ["shock", 1, 0.3], w: 3 }, { n: "Bleat of Thunder", p: 0.35, k: "spell", el: "shock", aoe: 1, w: 1 }] });
  E("galeHarpy", "Gale Harpy", "flyer", { hpMult: 0.45, actions: 2, rs: { shock: -0.3 }, ab: [{ n: "Gale Rake", p: 0.65, st: ["bleed", 1, 0.5], w: 3 }, { n: "Wind Cut", p: 0.5, k: "spell", el: "wind", w: 1 }] });
  E("lightningWolf", "Lightning Wolf", "swift", { hpMult: 0.5, rs: { shock: 0.75, water: -0.5 }, ab: [{ n: "Forked Bite", p: 1.0, st: ["shock", 1, 0.35], w: 3 }, { n: "Arc Dash", p: 0.8, self: ["dr", 0.25, 1], w: 1 }] });
  E("prismSprite", "Prism Sprite", "caster", { hpMult: 0.3, rs: { light: 0.75, dark: -0.5 }, ab: [{ n: "Refract", p: 0.85, k: "spell", el: "light", w: 3 }, { n: "Split Light", summon: ["prismSprite"], summonMax: 1, sumLv: -2, if: "alone&notSummoned", w: 4 }] });
  E("refractionGolem", "Refraction Golem", "tank", { hpMult: 0.9, pr: 0.2, immune: ["poison", "bleed"], hooks: ["mirrorTurn"], breakType: "impact", ab: [{ n: "Mirror Fist", p: 1.2, w: 3 }, { n: "Flash of Facets", p: 0.5, k: "spell", el: "light", aoe: 1, db: ["res", -0.15, 2], w: 1 }] });
  E("mirrorMoth", "Mirror Moth", "flyer", { hpMult: 0.4, ab: [{ n: "Mirror Wing", p: 0.55, k: "spell", el: "light", fx: "copyBuff", w: 3 }, { n: "Scale Dust", p: 0.5, k: "spell", db: ["spd", -0.2, 2], w: 2 }] });
  E("prismTarget", "Prism Door", "tank", { hpMult: 40, immune: ["poison", "bleed", "stun"], hooks: ["doorReact"], breakType: "react", breakNeed: 1, xp: 0, kakal: 0, ab: [{ n: "Glint", p: 0.12, k: "spell", el: "light", w: 1 }] });

  // ---------- chapter 11: the Great Pyramid ----------
  E("sunPriestGolem", "Sun-Priest Golem", "tank", { hpMult: 0.9, pr: 0.45, immune: ["poison", "bleed"], rs: { water: -0.6, fire: 0.5, light: 0.5 }, breakType: "water", ab: [{ n: "Gold Fist", p: 1.2, w: 3 }, { n: "Sun Pulse", p: 0.5, k: "spell", el: "light", aoe: 1, w: 2 }, { n: "Offering Bowl", healSelf: 0.08, w: 1, if: "hp<0.6" }] });
  E("obsidianChimera", "Obsidian Chimera", "beast", { hpMult: 0.8, pr: 0.2, rs: { ice: -0.3 }, ab: [{ n: "Obsidian Rake", p: 1.0, st: ["bleed", 2, 0.7], w: 3 }, { n: "Serpent Tail", p: 0.7, st: ["poison", 1, 0.5], w: 2 }, { n: "Goat Ram", p: 1.25, w: 1 }] });
  E("bloodAltarWraith", "Blood-Altar Wraith", "ghost", { hpMult: 0.6, immune: ["bleed", "poison"], ab: [{ n: "Offering Touch", p: 0.8, k: "spell", db: ["res", -0.25, 3], w: 3 }, { n: "Drain Life", p: 0.7, k: "spell", drain: 0.5, w: 2 }] });
  E("eclipseMoth", "Eclipse Moth", "flyer", { hpMult: 0.45, rs: { light: -0.5, dark: 0.5 }, ab: [{ n: "Eclipse Dust", p: 0.4, k: "spell", el: "dark", fx: "blindNext", w: 3, if: "every:2" }, { n: "Wing Beat", p: 0.9, w: 3 }] });
  E("shadowMinotaur", "Shadow Minotaur", "brute", { hpMult: 0.85, rs: { light: -0.6, dark: 0.75 }, bigEvery: 3, bigHit: 1.7, bigName: "Shadow Charge", bigSingle: 1, ab: [{ n: "Shadow Gore", p: 1.4, w: 3 }, { n: "Horn Sweep", p: 0.5, aoe: 1, w: 1 }] });
  E("pyramidNaga", "Pyramid Naga", "beast", { hpMult: 0.75, pr: 0.15, rs: { shock: -0.3 }, ab: [{ n: "Gold Fang", p: 1.0, st: ["poison", 1, 0.5], w: 3 }, { n: "Coil", p: 0.4, hold: 2, w: 2, if: "nobodyHeld" }] });
  // ---------- post-game: Starfall Isles, Crater Garden, Drowned Capital, Lantern Deep ----------
  const EL5 = { fire: 0.4, water: 0.4, ice: 0.4, shock: 0.4 };
  E("starMetalGolem", "Star-Metal Golem", "tank", { hpMult: 0.95, pr: 0.15, immune: ["poison", "bleed"], rs: EL5, ab: [{ n: "Star-Metal Fist", p: 1.3, w: 3 }, { n: "Meteor Hum", p: 0.45, k: "spell", el: "light", aoe: 1, db: ["res", -0.15, 2], w: 2 }] });
  E("cometFox", "Comet Fox", "swift", { hpMult: 0.5, actions: 2, rs: { fire: 0.75, water: -0.5, ice: -0.25 }, ab: [{ n: "Comet Bite", p: 0.7, st: ["burn", 1, 0.5], w: 3 }, { n: "Tail Streak", p: 0.35, k: "spell", el: "fire", aoe: 1, w: 1 }] });
  E("craterBloom", "Crater Bloom", "caster", { hpMult: 0.55, immune: ["poison"], breakType: "impact", rs: { ice: -0.3 }, ab: [{ n: "Glass Pollen", p: 0.55, k: "spell", el: "poison", aoe: 1, st: ["poison", 1, 0.6], w: 3 }, { n: "Open Petals", healAlly: 0.2, w: 2, if: "hurtAlly:0.7" }, { n: "Shard Lash", p: 0.8, w: 1 }] });
  E("meteorBoar", "Meteor Boar", "brute", { hpMult: 0.85, pr: 0.25, bigEvery: 3, bigHit: 1.7, bigName: "Meteor Charge", bigSingle: 1, ab: [{ n: "Black-Stone Tusk", p: 1.3, w: 3 }, { n: "Trample", p: 0.45, aoe: 1, w: 1 }] });
  E("voidMoth", "Void Moth", "flyer", { hpMult: 0.45, rs: { light: -0.5, dark: 0.5 }, ab: [{ n: "Hollow Dust", p: 0.5, k: "spell", el: "dark", steal: 1, w: 3 }, { n: "Fade", self: ["dr", 0.35, 1], w: 1 }, { n: "Wing Beat", p: 0.8, w: 2 }] });
  E("hollowLens", "Hollow Lens", "ghost", { hpMult: 0.6, immune: ["poison", "bleed"], hooks: ["lensBack"], breakType: "impact", ab: [{ n: "Focused Dark", p: 1.0, k: "spell", el: "dark", w: 3 }, { n: "Dim", p: 0.4, k: "spell", db: ["res", -0.2, 2], w: 2 }] });
  E("staredrinker", "Staredrinker", "ghost", { hpMult: 0.7, immune: ["bleed", "poison"], rs: { light: -0.4, dark: 0.5 }, ab: [{ n: "Drink the Light", p: 0.8, k: "spell", el: "dark", drain: 0.4, fx: "blindNext", w: 3 }, { n: "Long Reach", p: 0.9, w: 2 }, { n: "Dark Sip", steal: 1, w: 1 }] });
  E("emberwoodSentinel", "Emberwood Sentinel", "tank", { hpMult: 1.0, pr: 0.2, rs: { fire: -0.4, ice: 0.25 }, breakType: "fire", ab: [{ n: "Root Slam", p: 1.3, w: 3 }, { n: "Ash Cloud", p: 0.4, k: "spell", aoe: 1, db: ["spd", -0.25, 2], w: 2 }, { n: "Regrow", healSelf: 0.1, w: 1, if: "hp<0.5" }] });
  E("drownedSentry", "Drowned Sentry", "tank", { hpMult: 0.9, pr: 0.45, immune: ["poison", "bleed"], rs: { shock: -0.5 }, breakType: "shock", ab: [{ n: "Builder Strike", p: 1.2, w: 3 }, { n: "Seal the Way", p: 0.4, db: ["spd", -0.25, 2], aoe: 1, w: 1 }] });
  E("lanternEel", "Lantern Eel", "beast", { hpMult: 0.6, rs: { shock: 0.5, ice: -0.3 }, ab: [{ n: "Glow Bite", p: 1.0, st: ["bleed", 1, 0.5], w: 3 }, { n: "Lantern Flash", p: 0.45, k: "spell", el: "light", aoe: 1, db: ["res", -0.15, 2], w: 2 }] });
  E("builderWraith", "Builder Wraith", "ghost", { hpMult: 0.7, immune: ["bleed", "poison"], ab: [{ n: "Builder's Hush", p: 0.4, k: "spell", db: ["pow", -0.3, 2], steal: 1, w: 3 }, { n: "Light-Line Lash", p: 0.9, k: "spell", el: "light", w: 3 }] });
  E("coralColossus", "Coral Colossus", "tank", { hpMult: 1.1, rs: { fire: -0.3, water: 0.5 }, breakType: "impact", ab: [{ n: "Coral Slam", p: 1.5, w: 3 }, { n: "Reef Spines", p: 0.45, aoe: 1, st: ["bleed", 1, 0.5], w: 2 }] });
  E("abyssalCrab", "Abyssal Crab", "tank", { hpMult: 0.95, pr: 0.5, immune: ["poison"], breakType: "impact", ab: [{ n: "Crushing Claw", p: 1.4, w: 3 }, { n: "Snap and Hold", p: 0.4, hold: 2, w: 2, if: "nobodyHeld" }] });
  E("deepGlowfish", "Deep Glowfish", "swarm", { hpMult: 0.5, rs: { shock: -0.3 }, ab: [{ n: "Glow Nip", p: 0.55, w: 3 }, { n: "Dazzle", p: 0.3, k: "spell", el: "light", db: ["res", -0.15, 2], w: 1 }] });
  E("lanternJelly", "Lantern Jelly", "caster", { hpMult: 0.7, rs: { shock: 0.75, fire: -0.3 }, ab: [{ n: "Sting", p: 0.8, k: "spell", el: "shock", st: ["shock", 1, 0.6], w: 3 }, { n: "Drift Net", p: 0.35, k: "spell", aoe: 1, db: ["spd", -0.25, 2], w: 2 }] });
  E("trenchHorror", "Trench Horror", "brute", { hpMult: 1.2, immune: ["poison", "bleed"], rs: { light: -0.7, dark: 0.75 }, ab: [{ n: "Crushing Dark", p: 1.35, k: "spell", el: "dark", w: 3 }, { n: "Reaching Mass", p: 0.5, aoe: 1, w: 2 }] });
  E("lightlessMaw", "Lightless Maw", "beast", { hpMult: 1.0, rs: { light: -0.5, dark: 0.5 }, ab: [{ n: "Gnash", p: 1.1, st: ["bleed", 1, 0.5], w: 3 }, { n: "Swallow", p: 0.5, hold: 1, w: 2, if: "nobodyHeld" }] });

  // the post-game is balanced against geared parties: more damage per enemy than a bare sim party needs (test-m5.js); factors on every ability power
  const DMG = { starMetalGolem: 1.15, cometFox: 1.2, craterBloom: 1.15, meteorBoar: 1.2, voidMoth: 1.2, hollowLens: 1.25, staredrinker: 1.3, emberwoodSentinel: 1.3, drownedSentry: 1.2, lanternEel: 1.25, builderWraith: 1.25, coralColossus: 1.25, abyssalCrab: 1.25, deepGlowfish: 1.5, lanternJelly: 1.4, trenchHorror: 1.35, lightlessMaw: 1.35 };
  Object.keys(DMG).forEach(id => { const d = Core.ENEMIES[id]; if (!d || d._dmgDone) return; d._dmgDone = 1; (d.ab || []).forEach(a => { if (a.p) a.p = +(a.p * DMG[id]).toFixed(3); }); if (d.bigHit) d.bigHit = +(d.bigHit * DMG[id]).toFixed(3); });

  // ---------- encounter tables (rate = seconds of walking is set by the map; levels are the story levels) ----------
  const TB = Core.ENCOUNTERS;
  TB.warfront = [T(["legionShieldbearer", "legionSpearman", "legionArcher"], 3, 58, 59), T(["legionCenturion", "legionSlinger", "legionSlinger"], 2, 59), T(["standardBearer", "legionShieldbearer", "legionShieldbearer"], 2, 59, 60), T(["siegeBallista", "legionArcher"], 2, 59, 60), T(["spiritPriest"], 1, 59)];
  TB.trenches = [T(["legionShieldbearer", "legionSpearman", "legionSlinger"], 2, 59, 60), T(["siegeBallista", "legionArcher", "legionArcher"], 2, 60), T(["standardBearer", "legionCenturion"], 2, 60), T(["legionSlinger", "legionSlinger", "legionArcher"], 1, 59)];
  TB.crypt = [T(["spiritPriest", "candleWraith"], 2, 59, 60), T(["boneChoir"], 2, 60), T(["candleWraith", "candleWraith"], 2, 59), T(["spiritPriest", "boneChoir"], 1, 60, 61)];
  TB.thunder = [T(["stormRoc"], 2, 61, 62), T(["thunderRamCalf", "thunderRamCalf"], 2, 61, 62), T(["galeHarpy", "galeHarpy"], 2, 62), T(["lightningWolf", "lightningWolf"], 2, 62), T(["stormRoc", "galeHarpy"], 1, 62, 63)];
  TB.prism = [T(["prismSprite", "prismSprite"], 2, 60, 61), T(["refractionGolem"], 2, 61), T(["mirrorMoth", "mirrorMoth"], 2, 60, 61), T(["prismSprite", "refractionGolem"], 1, 62)];
  TB.stair = [T(["jaguarCohortElite", "jaguarCohortElite"], 2, 64, 65), T(["palaceGuard", "palaceGuard", "courtPriest"], 2, 64), T(["standardBearer", "legionCenturion", "legionArcher"], 2, 64, 65), T(["siegeBallista", "legionArcher", "legionArcher"], 2, 65), T(["sunPriestGolem"], 1, 65)];
  TB.dawnGate = [T(["jaguarCohortElite", "jaguarCohortElite"], 2, 64, 65), T(["palaceGuard", "bloodAltarWraith"], 2, 65), T(["sunPriestGolem"], 2, 65), T(["courtPriest", "jaguarCohortElite"], 1, 65)];
  TB.zenithGate = [T(["courtPriest", "courtPriest"], 2, 65, 66), T(["eclipseMoth", "eclipseMoth"], 2, 66), T(["sunPriestGolem", "obsidianChimera"], 2, 66), T(["palaceGuard", "courtPriest"], 1, 66)];
  TB.duskGate = [T(["shadowMinotaur", "shadowMinotaur"], 2, 66, 67), T(["pyramidNaga", "bloodAltarWraith"], 2, 67), T(["obsidianChimera", "eclipseMoth"], 2, 67), T(["shadowMinotaur", "pyramidNaga"], 1, 67)];
  TB.descent = [T(["sunPriestGolem", "sunPriestGolem"], 2, 67, 68), T(["obsidianChimera", "shadowMinotaur"], 2, 67, 68), T(["bloodAltarWraith", "eclipseMoth"], 2, 67), T(["pyramidNaga", "jaguarCohortElite"], 2, 68)];
  TB.starfall = [T(["starMetalGolem"], 2, 70, 72), T(["cometFox", "cometFox"], 2, 70, 72), T(["craterBloom", "craterBloom"], 2, 71, 72), T(["meteorBoar", "meteorBoar"], 2, 71, 73), T(["voidMoth", "voidMoth"], 2, 72), T(["hollowLens", "starMetalGolem"], 1, 72, 73)];
  TB.crater2 = [T(["craterBloom", "staredrinker"], 2, 74, 76), T(["starMetalGolem", "starMetalGolem"], 2, 75, 76), T(["emberwoodSentinel"], 2, 75, 77), T(["voidMoth", "hollowLens", "staredrinker"], 2, 76, 78), T(["cometFox", "cometFox", "cometFox"], 1, 74)];
  TB.drowned = [T(["drownedSentry", "drownedSentry"], 2, 72, 74), T(["lanternEel", "lanternEel"], 2, 72, 73), T(["builderWraith"], 2, 74, 75), T(["coralColossus"], 2, 75, 76), T(["abyssalCrab", "lanternEel"], 2, 74, 76)];
  TB.deep = [T(["deepGlowfish", "deepGlowfish", "deepGlowfish"], 2, 78, 79), T(["lanternJelly", "lanternJelly"], 2, 78, 80), T(["trenchHorror"], 2, 79, 81), T(["lightlessMaw"], 2, 80, 81), T(["lanternJelly", "trenchHorror"], 1, 80)];

  // ---------- art: stand-ins until ART-B's own sprite or model exists ----------
  // id: [stand-in art id, tint, scale]. At load in the browser the creature index and the model manifest are read once; an id that now has its own art switches to it.
  // The four bosses whose rules were written before their art existed also switch (mentorIthiel, veilStag, lastWarden, mawmotherOfTheDeep).
  const ART = {
    legionSlinger: ["raidSlinger"], legionCenturion: ["centurion"], candleWraith: ["dripWraith", 0xffd9a0], boneChoir: ["boneCrab", 0xe8e0c8, 1.1], prismSprite: ["dustWisp", 0xbff4ff],
    refractionGolem: ["mirrorBeetle", 0xe0f4ff, 1.5], mirrorMoth: ["eclipseMoth", 0xc8d8ff], prismTarget: ["mirrorBeetle", 0x9fe8ff, 1.6], starMetalGolem: ["basaltSkin", 0x8aa0c0, 1.3],
    cometFox: ["sandstitchJackal", 0xff9a50], craterBloom: ["orchidDryad", 0xbfefff], meteorBoar: ["arenaBoarBull", 0x504860], voidMoth: ["eclipseMoth", 0x403060], hollowLens: ["dustWisp", 0x303040, 1.3],
    staredrinker: ["shadeLamia", 0x202030, 1.1], emberwoodSentinel: ["rootboundTroll", 0xffb070], drownedSentry: ["brassAutomaton", 0x80a0a8], lanternEel: ["skyEel", 0x90e8ff],
    builderWraith: ["archiveWraith", 0xd8c890], coralColossus: ["stoneGiant", 0xff9a90], abyssalCrab: ["boneCrab", 0x6070a0, 1.4], deepGlowfish: ["pearlBackedSnapper", 0x90ffe0],
    lanternJelly: ["steamSprite", 0x90c0ff], trenchHorror: ["deepLantern", 0x303850, 1.3], lightlessMaw: ["deepLantern", 0x101020, 1.5],
  };
  const BOSS_OWN = ["mentorIthiel", "veilStag", "lastWarden", "mawmotherOfTheDeep"];
  Object.keys(ART).forEach(id => { const d = Core.ENEMIES[id], a = ART[id]; if (d && d.art === id) { d.art = a[0]; if (a[1]) d.vtint = a[1]; if (a[2]) d.vscale = a[2]; } });
  const ownArt = id => { const d = Core.ENEMIES[id]; if (!d) return; d.art = id; delete d.vtint; delete d.vscale; };
  Core.M5 = { ART, ownArt };
  if (typeof window !== "undefined" && typeof fetch === "function") {
    const J = u => fetch(u).then(r => (r.ok ? r.json() : {})).catch(() => ({}));
    Promise.all([J("assets/creatures/index.json"), J("assets/models/manifest.json")]).then(([idx, man]) => {
      Object.keys(ART).concat(BOSS_OWN).forEach(id => { if (idx[id] || (man[id] && man[id].file)) ownArt(id); });
    });
  }
  if (typeof module !== "undefined") module.exports = Core;
})(typeof window !== "undefined" ? window : globalThis);
