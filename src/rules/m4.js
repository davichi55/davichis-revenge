// Field enemies, encounter tables, two new creatures (emberwick, vaulthorn) and rule hooks for milestone M4, chapters 7-9, levels 38-58 (owner: STORY-M4).
// Spec: ../game-mechanics/specs/M4.md section 2. Bosses (generals, K6/K7 guardians, T6, L6, Iron Cup twins) are RULES-BOSS's, in bosses.js.
// Soldiers and creatures other agents also define (legion*, jaguarCohortElite, lionWolf, boarBull, smokePhoenixChick ...) are only defined here when missing (m2.js / m3.js load first).
(function (root) {
  const Core = root.Core || require("../core.js");
  const en = Core.defEnemy, T = Core.encT, has = id => !!Core.ENEMIES[id];
  const ab = (n, p, o) => Object.assign({ n }, p ? { p } : {}, o);
  const def = (id, name, profile, o) => { if (!has(id)) en(id, name, profile, o); };

  // ---------- the soldiers (m2.js / m3.js define the real ones; these stand in when they are missing) ----------
  const soldier = (id, name, hp, o) => def(id, name, "human", Object.assign({ hpMult: hp, human: true }, o));
  soldier("legionShieldbearer", "Legion Shieldbearer", 0.55, { pr: 0.4, ab: [ab("Shield Bash", 0.8, { db: ["spd", -0.2, 2], w: 2 }), ab("Short Sword", 1.0, { w: 3 })] });
  soldier("legionSpearman", "Legion Spearman", 0.5, { ab: [ab("Spear Thrust", 1.15, { tgt: "front" })] });
  soldier("legionArcher", "Legion Archer", 0.4, { ab: [ab("Volley", 1.0, { tgt: "weak" })] });
  soldier("legionOptio", "Legion Optio", 0.6, { ab: [ab("Gladius Strike", 0.95, { w: 4 }), ab("Rally Cry", 0, { ally: ["atk", 0.2, 3], w: 2, if: "hasAlly" })] });
  soldier("jaguarCohortElite", "Jaguar Cohort Elite", 0.75, { ab: [ab("Obsidian Slash", 1.0, { st: ["bleed", 1, 0.5], w: 3 }), ab("Pounce", 1.15, { tgt: "weak", w: 2 }), ab("Cohort Roar", 0, { ally: ["atk", 0.15, 2], w: 1, if: "hasAlly" })] });

  // ---------- chapter 7: the sewers and the Gilded Palace (levels 38-43) ----------
  en("sewerNaga", "Sewer Naga", "beast", { hpMult: 0.55, rs: { shock: -0.35 }, breakType: "shock", ab: [
    ab("Coil", 0.5, { hold: 2, w: 2, if: "nobodyHeld" }), ab("Venomous Bite", 0.95, { st: ["poison", 1, 0.5], w: 3 })] });
  en("ratChimera", "Rat Chimera", "swarm", { hpMult: 0.6, swarm: 1, actions: 2, rs: { fire: -0.5 }, breakType: "fire", ab: [
    ab("Gnawing Mass", 0.55, { st: ["bleed", 1, 0.35] }), ab("Squeal", 0.3, { k: "spell", aoe: 1, db: ["spd", -0.15, 2], w: 1 })] });
  en("drownedSlaveWraith", "Drowned Slave Wraith", "ghost", { hpMult: 0.5, pr: 0.5, immune: ["bleed", "poison"], rs: { fire: -0.5, water: 0.75 }, breakType: "fire", ab: [
    ab("Dragging Chains", 0.7, { k: "spell", db: ["spd", -0.3, 2], w: 3 }), ab("Drowned Wail", 0.4, { k: "spell", el: "water", aoe: 1, w: 1 })] });
  en("palaceGuard", "Palace Guard", "human", { hpMult: 0.85, human: true, pr: 0.45, rs: { shock: -0.45 }, breakType: "shock", ab: [
    ab("Spear Thrust", 1.0, { tgt: "front", w: 3 }), ab("Shield Bash", 0.8, { db: ["spd", -0.2, 2], w: 2 }), ab("Raise the Tower Shield", 0, { self: ["dr", 0.35, 1], w: 1 })] });
  en("eagleCohortArcher", "Eagle Cohort Archer", "human", { hpMult: 0.35, human: true, rs: { shock: -0.4 }, ab: [
    ab("Eagle Shot", 1.2, { tgt: "weak", w: 4 }), ab("Wall Volley", 0.45, { aoe: 1, w: 1 })] });
  en("courtPriest", "Court Priest", "caster", { hpMult: 0.45, human: true, rs: { ice: -0.45, light: 0.5 }, breakType: "ice", ab: [
    ab("Mend the Guard", 0, { healAlly: 0.3, w: 3, if: "hurtAlly:0.7" }), ab("Sun Blessing", 0, { ally: ["def", 0.2, 2], w: 2, if: "hasAlly" }), ab("Rebuke of the Sun", 0.95, { k: "spell", el: "light", w: 3 })] });
  en("templeHound", "Temple Hound", "swift", { hpMult: 0.42, rs: { ice: -0.25 }, ab: [
    ab("Rending Bite", 0.9, { st: ["bleed", 1, 0.6], w: 3 }), ab("Run Down", 1.0, { tgt: "weak", w: 2 })] });

  // ---------- chapter 8: the Royal Road provinces (levels 44-49) ----------
  en("legionCenturion", "Legion Centurion", "human", { hpMult: 1.0, human: true, pr: 0.2, breakType: "impact", ab: [
    ab("Order: Shields Up", 0, { ally: ["def", 0.3, 1], w: 2 }), ab("Order: Charge", 0, { ally: ["atk", 0.3, 1], w: 2 }), ab("Crested Gladius", 1.1, { w: 4 })] });
  en("supplyConvoyGuard", "Supply Convoy Guard", "tank", { hpMult: 0.8, human: true, pr: 0.25, rs: { fire: -0.55 }, breakType: "fire", ab: [
    ab("Crate Slam", 1.05, { w: 3 }), ab("Heavy Load", 0, { self: ["def", 0.25, 2], w: 1 }), ab("Whip the Mule", 0.55, { aoe: 1, db: ["spd", -0.2, 2], w: 1 })] });
  en("sunmawCultist", "Sunmaw Cultist", "caster", { hpMult: 0.5, human: true, rs: { ice: -0.45 }, breakType: "ice", ab: [
    ab("Obsidian Knife", 0.95, { k: "phys", st: ["bleed", 1, 0.7], drain: 0.3, w: 4 }), ab("Blood Rite", 0.7, { k: "spell", el: "dark", aoe: 1, w: 1 }),
    ab("Feast on the Fallen", 0, { healSelf: 0.35, w: 6, if: "deadAlly" })] });
  en("saltGargoyle", "Salt Gargoyle", "brute", { hpMult: 0.75, pr: 0.4, rs: { water: -0.4, earth: 0.4 }, breakType: "water", ab: [
    ab("Wing Slam", 1.1, { w: 3 }), ab("Salt Spray", 0.5, { k: "spell", aoe: 1, db: ["res", -0.2, 2], w: 2 })] });
  en("orchardSatyr", "Orchard Satyr", "beast", { hpMult: 0.5, rs: { fire: -0.3 }, ab: [
    ab("Hoof Kick", 1.0, { w: 3 }), ab("Lullaby Pipes", 0.5, { k: "spell", st: ["stun", 1, 0.3], w: 2 })] });
  en("overseersHound", "Overseer's Hound", "swift", { hpMult: 0.45, rs: { ice: -0.25 }, ab: [
    ab("Chain Lunge", 1.0, { st: ["bleed", 1, 0.5], w: 3 }), ab("Drag Down", 0.8, { tgt: "weak", w: 2 })] });
  // the Veiled Cistern (K6, levels 47-49)
  en("gazeStatue", "Gaze Statue", "tank", { hpMult: 0.85, pr: -0.2, immune: ["bleed", "poison"], rs: { shock: 0.25 }, breakType: "impact", ab: [
    ab("Stone Slam", 1.2, { w: 3 }), ab("Frozen Stare", 0.4, { k: "spell", st: ["petrify", 1, 0.3], w: 2 })] });
  en("glassSerpent", "Glass Serpent", "swift", { hpMult: 0.5, pr: -0.25, immune: ["poison"], breakType: "impact", ab: [
    ab("Glass Fang", 0.95, { st: ["bleed", 1, 0.6], w: 3 }), ab("Shatter Coil", 0.6, { aoe: 1, w: 1 })] });
  en("mirrorShade", "Mirror Shade", "ghost", { hpMult: 0.45, pr: 0.4, immune: ["bleed", "poison"], rs: { light: -0.4, dark: 0.4 }, ab: [
    ab("Mirror Image", 0, { fx: "mirrorCopy", w: 3 }), ab("Cold Reflection", 0.7, { k: "spell", w: 2 })] });

  // ---------- chapter 9: the Black Mirror, the roots and the Hollow Nest (levels 50-58) ----------
  en("prisonGuard", "Prison Guard", "human", { hpMult: 0.85, human: true, pr: 0.4, rs: { shock: -0.3 }, breakType: "impact", ab: [
    ab("Iron Club", 1.1, { w: 3 }), ab("Shield Shove", 0.7, { db: ["spd", -0.25, 2], w: 2 }), ab("Hold the Line", 0, { self: ["dr", 0.3, 1], w: 1 })] });
  en("warderSpearman", "Warder Spearman", "human", { hpMult: 0.55, human: true, ab: [
    ab("Long Spear", 1.2, { tgt: "front", w: 3 }), ab("Sweep the Corridor", 0.4, { aoe: 1, w: 1 })] });
  en("collarSmith", "Collar-Smith", "caster", { hpMult: 0.55, human: true, rs: { water: -0.4 }, breakType: "water", ab: [
    ab("Temper the Collar", 0, { empower: ["atk", 0.3, 3], w: 3 }), ab("Hot Hammer", 0.95, { st: ["burn", 1, 0.4], w: 3 }), ab("Quench", 0, { ally: ["def", 0.2, 2], w: 1, if: "hasAlly" })] });
  en("prisonHound", "Prison Hound", "swift", { hpMult: 0.45, rs: { ice: -0.25 }, ab: [
    ab("Pale Bite", 0.85, { st: ["slow", 1, 0.6], w: 3 }), ab("Run Down", 0.9, { tgt: "weak", w: 2 })] });
  en("rootWorm", "Root Worm", "brute", { hpMult: 0.6, rs: { fire: -0.5 }, breakType: "fire", ab: [
    ab("Burrow Bite", 1.0, { w: 3 }), ab("Root Squeeze", 0.5, { db: ["spd", -0.25, 2], w: 2 })] });
  en("rootboundTroll", "Rootbound Troll", "tank", { hpMult: 1.0, pr: 0.2, rs: { fire: -0.5 }, breakType: "fire", ab: [
    ab("Root Club", 1.25, { w: 3 }), ab("Rootquake", 0.35, { aoe: 1, w: 1 }), ab("Knit the Bark", 0, { healSelf: 0.1, w: 3, if: "hp<0.6" })] });
  en("gnawling", "Gnawling", "beast", { hpMult: 0.55, rs: { fire: -0.35 }, ab: [
    ab("Chew", 0.8, { steal: 1, w: 3 }), ab("Gnash", 1.0, { st: ["bleed", 1, 0.45], w: 2 })] });
  en("blackMirrorWraith", "Black Mirror Wraith", "ghost", { hpMult: 0.5, pr: 0.45, immune: ["bleed", "poison"], rs: { light: -0.3, dark: 0.5 }, hooks: ["mirrorOnce"], ab: [
    ab("Black Glass Shard", 0.85, { k: "spell", w: 3 }), ab("Prisoner's Wail", 0.4, { k: "spell", aoe: 1, db: ["res", -0.2, 2], w: 2 })] });
  en("thornbackDragonet", "Thornback Dragonet", "beast", { hpMult: 0.5, rs: { fire: -0.3 }, ab: [
    ab("Thorn Claw", 1.0, { st: ["bleed", 1, 0.4], w: 3 }), ab("Thorn Volley", 0.45, { aoe: 1, w: 2 })] });
  // the Hollow Nest (K7, levels 52-54)
  en("ashwingOwl", "Ashwing Owl", "flyer", { hpMult: 0.5, rs: { shock: -0.4 }, ab: [
    ab("Ash Dive", 1.25, { tgt: "weak", w: 3 }), ab("Ash Cloud", 0.4, { k: "spell", aoe: 1, db: ["res", -0.2, 2], w: 2 })] });
  en("cinderMothSwarm", "Cinder Moth Swarm", "swarm", { hpMult: 0.6, swarm: 1, actions: 2, rs: { water: -0.5 }, ab: [
    ab("Burning Dust", 0.5, { k: "spell", el: "fire", st: ["burn", 1, 0.6], w: 3 }), ab("Flutter Veil", 0, { self: ["dr", 0.3, 1], w: 1 })] });
  def("smokePhoenixChick", "Smoke Phoenix Chick", "caster", { hpMult: 0.4, rs: { water: -0.5, fire: 0.75 }, ab: [
    ab("Ash Peck", 0.85, { k: "spell", el: "fire", st: ["burn", 1, 0.5], w: 3 }), ab("Smoke Veil", 0.3, { k: "spell", aoe: 1, db: ["spd", -0.2, 2], w: 2 })] });
  def("lionWolf", "Lion-Wolf", "swift", { hpMult: 0.6, ab: [ab("Pounce", 1.1, { st: ["bleed", 1, 0.4], w: 3 }), ab("Howl", 0, { ally: ["spd", 0.2, 2], w: 1, if: "hasAlly" })] });
  def("boarBull", "Boar-Bull", "brute", { hpMult: 0.75, bigEvery: 3, bigHit: 1.4, bigName: "Bull Rush", bigSingle: 1, ab: [ab("Gore", 1.2, { w: 3 }), ab("Trample", 0.4, { aoe: 1, w: 1 })] });

  // ---------- encounter tables (TABLE ids from the spec; the K6 table is veiledCistern, `cistern` already belongs to the M1 Cistern of the Burnt Gate) ----------
  Object.assign(Core.ENCOUNTERS, {
    sewer: [T(["sewerNaga"], 2, 38, 39), T(["ratChimera", "ratChimera"], 2, 38), T(["drownedSlaveWraith"], 2, 38, 39), T(["sewerNaga", "ratChimera"], 1, 39)],
    palace: [T(["palaceGuard", "palaceGuard"], 2, 39, 40), T(["jaguarCohortElite"], 2, 40), T(["eagleCohortArcher", "eagleCohortArcher"], 2, 39, 40), T(["courtPriest", "palaceGuard"], 2, 40), T(["templeHound", "templeHound"], 1, 39)],
    garden: [T(["courtPriest", "templeHound"], 2, 40, 41), T(["eagleCohortArcher", "jaguarCohortElite"], 2, 41), T(["palaceGuard", "courtPriest"], 2, 41)],
    eastWing: [T(["palaceGuard", "templeHound"], 2, 42), T(["jaguarCohortElite", "jaguarCohortElite"], 2, 42, 43), T(["courtPriest", "eagleCohortArcher"], 2, 42)],
    coast: [T(["legionShieldbearer", "legionSpearman", "legionArcher"], 3, 44, 45), T(["legionCenturion", "legionShieldbearer"], 2, 45), T(["saltHarpy", "saltHarpy"], 2, 44, 45), T(["overseersHound", "overseersHound"], 2, 44, 45),
      T(["supplyConvoyGuard", "supplyConvoyGuard", "legionSpearman"], 2, 45)],
    convoy: [T(["supplyConvoyGuard", "supplyConvoyGuard", "legionSpearman"], 2, 45, 46), T(["supplyConvoyGuard", "legionArcher", "legionShieldbearer"], 1, 45, 46)],
    saltFlats: [T(["saltGargoyle"], 2, 45, 46), T(["saltHarpy", "saltHarpy"], 2, 45, 46), T(["overseersHound"], 2, 45, 46), T(["legionShieldbearer", "legionArcher", "legionOptio"], 2, 45), T(["supplyConvoyGuard", "supplyConvoyGuard"], 1, 46)],
    saltMine: [T(["saltGargoyle", "saltGargoyle"], 2, 46), T(["legionOptio", "overseersHound", "overseersHound"], 2, 46), T(["supplyConvoyGuard", "legionSpearman"], 2, 46), T(["legionCenturion", "legionArcher", "legionArcher"], 1, 47)],
    orchard: [T(["orchardSatyr", "orchardSatyr"], 2, 46, 47), T(["overseersHound"], 2, 46), T(["legionShieldbearer", "legionSpearman", "legionArcher"], 3, 46, 47), T(["legionCenturion", "sunmawCultist"], 2, 47), T(["supplyConvoyGuard", "supplyConvoyGuard"], 1, 47)],
    sunmaw: [T(["sunmawCultist", "sunmawCultist"], 2, 47), T(["jaguarCohortElite"], 2, 47, 48), T(["orchardSatyr", "saltGargoyle"], 2, 47), T(["legionCenturion", "sunmawCultist"], 2, 48)],
    villa: [T(["palaceGuard", "courtPriest"], 2, 47, 48), T(["legionCenturion", "legionArcher"], 2, 48), T(["overseersHound", "overseersHound"], 2, 47), T(["jaguarCohortElite"], 1, 48)],
    veiledCistern: [T(["gazeStatue"], 2, 47, 48), T(["mirrorShade", "mirrorShade"], 2, 48), T(["glassSerpent"], 2, 47, 48), T(["gazeStatue", "mirrorShade"], 1, 48)],
    prison: [T(["prisonGuard", "prisonGuard", "warderSpearman"], 2, 51, 52), T(["collarSmith", "prisonGuard"], 2, 52), T(["prisonHound", "prisonHound"], 2, 51, 52), T(["blackMirrorWraith"], 2, 52, 53), T(["warderSpearman", "collarSmith"], 1, 53)],
    roots: [T(["rootWorm", "rootWorm"], 2, 51, 53), T(["rootboundTroll"], 2, 52, 53), T(["gnawling", "gnawling"], 2, 52), T(["thornbackDragonet"], 2, 51, 53), T(["prisonGuard", "warderSpearman"], 2, 51, 52), T(["blackMirrorWraith"], 1, 52)],
    nest: [T(["ashwingOwl", "ashwingOwl"], 2, 52, 53), T(["cinderMothSwarm"], 2, 52), T(["thornbackDragonet", "smokePhoenixChick"], 2, 53), T(["ashwingOwl", "cinderMothSwarm"], 1, 53)],
    rootdeep: [T(["rootWorm", "rootWorm", "gnawling"], 2, 55, 56), T(["rootboundTroll", "rootboundTroll"], 2, 55, 56), T(["gnawling", "thornbackDragonet"], 2, 55), T(["blackMirrorWraith", "rootWorm"], 1, 56)],
  });

  Core.ENCOUNTERS.coastConvoy = Core.ENCOUNTERS.convoy;   // WORLD-M4's name for the visible convoy wagons

  // ---------- rule hooks and effects used by the enemies above ----------
  // Mirror Shade: copies the damage move one of your creatures used last (about 55 % of its power) and throws it at someone.
  Core.EFFECTS.mirrorCopy = (ctx, e) => {
    const src = ctx.party.filter(p => p.alive && p.lastMove && Core.MOVES[p.lastMove] && Core.MOVES[p.lastMove].p);
    const s = src.length ? src[Math.floor(Math.random() * src.length)] : null, live = ctx.party.filter(p => p.alive);
    if (!s || !live.length) { Core.say(ctx, e.name + " flickers. Nothing to copy."); return; }
    const m = Core.MOVES[s.lastMove], t = live[Math.floor(Math.random() * live.length)];
    Core.say(ctx, e.name + " copies " + s.name + "'s " + m.name + "!");
    Core.damage(ctx, e, t, m.p * (m.hits || 1) * 0.55, m.kind === "phys" ? "phys" : "spell", { el: m.el === "self" ? s.element : m.el, off: 1, enemy: 1 });
  };
  // Black Mirror Wraith: the first spell cast at it is thrown back (the glass cracks, then it is an ordinary ghost).
  Core.HOOKS.mirrorOnce = {
    start(ctx, u) { u.reflect = ["fire", "water", "ice", "shock", "earth", "wind", "light", "dark", "nature", "poison"]; },
    outMult(ctx, u, tgt, info) { if (info && info.tg && info.tg.refl && u.reflect) { u.reflect = null; Core.say(ctx, u.name + "'s black glass cracks."); } return 1; },
  };
  // A collared general speaks while it fights. STORY-M3 defines the same hook in m3.js (genTalk); this is only the fallback when it is missing.
  const quote = (u, t) => u.name.replace(/ [A-D]$/, "") + ': "' + t + '"';
  if (!Core.HOOKS.genTalk) Core.HOOKS.genTalk = {
    start(ctx, u) { u.gt = { a: 0, b: 0, c: 0, k: 0 }; if (u.talk && u.talk.fight && u.talk.fight[0]) Core.say(ctx, quote(u, u.talk.fight[0])); },
    round(ctx, u) {
      if (!u.alive || !u.talk || !u.gt) return; const r = u.hp / Math.max(1, u.maxHp), t = u.talk;
      if (r <= 0.75 && !u.gt.a && t.fight && t.fight[1]) { u.gt.a = 1; Core.say(ctx, quote(u, t.fight[1])); }
      else if (r <= 0.5 && !u.gt.b && t.memories && t.memories[0]) { u.gt.b = 1; Core.say(ctx, quote(u, t.memories[0])); }
      else if (r <= 0.25 && !u.gt.c && t.fight && t.fight[2]) { u.gt.c = 1; Core.say(ctx, quote(u, t.fight[2])); }
    },
    broken(ctx, u) { if (!u.talk || !u.talk.brk) return; u.gt = u.gt || { a: 0, b: 0, c: 0, k: 0 }; const l = u.talk.brk[Math.min(u.gt.k, u.talk.brk.length - 1)]; u.gt.k++; if (l) Core.say(ctx, quote(u, l)); },
  };

  // S14 at Sunmaw: the altar's collar is cracked. The creature half-speaks: its break lines come at 75 and 25 percent, a memory at 50, and one break step is easier (the story sets breakNeed).
  const gLines = u => (root.Data && root.Data.GENERAL_LINES && root.Data.GENERAL_LINES[u.art]) || null;
  Core.HOOKS.crackedLines = {
    start(ctx, u) { u.glSaid = {}; const L = gLines(u); if (L) Core.say(ctx, u.name + ': "' + L.fight[0] + '"'); },
    hit(ctx, u) {
      if (!u.alive) return; const L = gLines(u); if (!L) return; const f = u.hp / u.maxHp, s = u.glSaid = u.glSaid || {}, sp = t => t && Core.say(ctx, u.name + ': "' + t + '"');
      if (f <= 0.75 && !s[75]) { s[75] = 1; sp(L.brk[0]); }
      if (f <= 0.5 && !s[50]) { s[50] = 1; sp(L.memories[0]); }
      if (f <= 0.25 && !s[25]) { s[25] = 1; sp(L.brk[1]); }
    },
    broken(ctx, u) { const L = gLines(u); if (!L || (u.glSaid && u.glSaid.brk)) return; (u.glSaid = u.glSaid || {}).brk = 1; Core.say(ctx, u.name + ': "' + L.fight[2] + '"'); },
  };

  // ---------- two creatures that are not part of any pack ----------
  const STY = Core.STYLES, move = (id, o) => { if (!Core.MOVES[id]) Core.MOVES[id] = Object.assign({ id, lvl: 1, mp: 2, target: "enemy", kind: "phys", grp: "damage" }, o); };
  // Emberwick: Kessa Vorn's lion cub with a candle-flame mane, a Phoenix healer. The guest of chapter 8 (Systems.guestJoin); never recruitable, never a general.
  if (!Core.CREATURES.emberwick) Core.CREATURES.emberwick = { id: "emberwick", name: "Emberwick", style: "phoenix", styleName: STY.phoenix.name, element: "fire", pack: "G", personality: "small, brave, scorched-warm, loyal to Kessa", passive: STY.phoenix.passive, passiveName: STY.phoenix.passiveName, personal: "candleMane", t: { foc: 1.25, hp: 1.15, spd: 0.9, pow: 0.95, def: 0.9 } };
  move("candleMane", { name: "Candle-Mane", lvl: 12, mp: 3, target: "team", grp: "personal", own: "emberwick", personal: 1, fx: "candleMane", desc: "Its mane burns steady and soft: every ally heals 14% of their max HP and loses Burn and Chill." });
  if (Core.PLAYER_FX && !Core.PLAYER_FX.candleMane) Core.PLAYER_FX.candleMane = (c, u, m, t, ts) => {
    (ts && ts.length ? ts : c.party).forEach(a => { if (!a.alive) return; Core.healFlat(c, a, Math.round(a.maxHp * 0.14), { src: u }); delete a.st.burn; delete a.st.chill; });
    Core.say(c, u.name + "'s mane burns steady and soft.");
  };
  // Vaulthorn: the Silver Cup champion of Tzavan, a bull-bodied, eagle-headed beast in silver plate. A collared arena creature built through makeGeneral (Minotaur rules: two heavy blows in a row break it).
  if (!Core.CREATURES.vaulthorn) Core.CREATURES.vaulthorn = { id: "vaulthorn", name: "Vaulthorn", style: "minotaur", styleName: STY.minotaur.name, element: "light", pack: "A", personality: "the arena's silver champion, beautiful and collared", passive: STY.minotaur.passive, passiveName: STY.minotaur.passiveName, personal: "silverCharge", t: { atk: 1.2, def: 1.15, hp: 1.1, spd: 0.95 } };
  move("silverCharge", { name: "Silver Charge", lvl: 40, mp: 3, grp: "personal", own: "vaulthorn", personal: 1, p: 2.2, bk: ["impact"], desc: "A charge under silver plate. Counts toward impact breaks." });
  try {
    Core.makeGeneral("vaulthorn", 55, { slot: "cup" });   // registers gen_vaulthorn; the cup uses the plain id `vaulthorn`
    if (Core.ENEMIES.gen_vaulthorn && !has("vaulthorn")) Core.ENEMIES.vaulthorn = Object.assign({}, Core.ENEMIES.gen_vaulthorn, { id: "vaulthorn", name: "Vaulthorn", art: "vaulthorn", intro: "Vaulthorn lowers its eagle head. The silver plate rings like a bell." });
  } catch (e) { console.warn("m4: vaulthorn", e); }

  if (typeof module !== "undefined") module.exports = Core;
})(typeof window !== "undefined" ? window : globalThis);
