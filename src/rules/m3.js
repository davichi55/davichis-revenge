// Field enemies and encounter tables for milestone M3 (owner: STORY-M3), chapters 5 and 6, levels 22 to 38.
// Spec: ../game-mechanics/specs/M3.md section 2. Bosses (generals, K3-K5 guardians, T3-T5, L4/L5, Bronze Cup) are RULES-BOSS's, in bosses.js.
// Content: Core.defEnemy(id, name, profile, o) (field enemies are scaled by FIELD_HP / FIELD_DMG in core.js) and Core.ENCOUNTERS[table] = [Core.encT(foes, weight, lo, hi), ...].
(function (root) {
  const Core = root.Core || require("../core.js");
  const en = Core.defEnemy, T = Core.encT, has = id => !!Core.ENEMIES[id];
  const ab = (n, p, o) => Object.assign({ n }, p ? { p } : {}, o);

  // ---------- the empire's soldiers (STORY-M2 defines the real ones in m2.js; these only stand in when m2.js has not) ----------
  const soldier = (id, name, hp, o) => { if (!has(id)) en(id, name, "human", Object.assign({ hpMult: hp, human: true }, o)); };
  soldier("legionShieldbearer", "Legion Shieldbearer", 0.55, { pr: 0.4, ab: [ab("Shield Bash", 0.8, { db: ["spd", -0.2, 2], w: 2 }), ab("Short Sword", 1.0, { w: 3 })] });
  soldier("legionSpearman", "Legion Spearman", 0.5, { ab: [ab("Spear Thrust", 1.15, { tgt: "front" })] });
  soldier("legionArcher", "Legion Archer", 0.4, { ab: [ab("Volley", 1.0, { tgt: "weak" })] });
  soldier("legionOptio", "Legion Optio", 0.6, { ab: [ab("Gladius Strike", 0.95, { w: 4 }), ab("Rally Cry", 0, { ally: ["atk", 0.2, 3], w: 2, if: "hasAlly" })] });

  // ---------- chapter 5: Ashen Orun, Undervaults, Cold Vaults, the canyon (levels 22-26) ----------
  en("legionTribune", "Legion Tribune", "human", { hpMult: 0.6, human: true, ab: [
    ab("Sound the Horn", 0, { summon: ["legionSpearman"], summonMax: 1, sumLv: -1, if: "first", w: 40 }),
    ab("Command", 0, { ally: ["atk", 0.2, 3], w: 2, if: "hasAlly" }),
    ab("Gladius Thrust", 1.05, { w: 3 }), ab("Officer's Cut", 0.85, { tgt: "weak", w: 1 })] });
  en("houndOfTheCohort", "Hound of the Cohort", "swift", { hpMult: 0.45, pr: 0.2, rs: { ice: -0.5 }, breakType: "ice", ab: [
    ab("Plated Bite", 0.95, { st: ["bleed", 1, 0.6], w: 3 }), ab("Run Down", 0.7, { tgt: "weak", w: 2 })] });
  en("academyWardenConstruct", "Academy Warden Construct", "tank", { hpMult: 0.85, pr: 0.35, immune: ["bleed", "poison"], rs: { shock: -0.6, water: 0.25 }, breakType: "shock",
    bigEvery: 3, bigHit: 1.1, bigName: "Warden's Lamp", bigSingle: 1, ab: [
    ab("Brass Fist", 1.3, { w: 3 }), ab("Lamp Flare", 0.6, { k: "spell", el: "light", db: ["res", -0.2, 2], w: 1 })] });
  en("frostWisp", "Frost Wisp", "caster", { hpMult: 0.3, rs: { fire: -1, ice: 0.75 }, immune: ["chill"], ab: [
    ab("Rime Spark", 0.85, { k: "spell", el: "ice", st: ["chill", 1, 0.6], w: 3 })] });
  en("rimeBasilisk", "Rime Basilisk", "beast", { hpMult: 0.55, rs: { fire: -0.6, ice: 0.75 }, immune: ["chill"], breakType: "fire", ab: [
    ab("Frost Bite", 1.0, { w: 3 }), ab("Crest Chill", 0.6, { k: "spell", el: "ice", db: ["spd", -0.3, 2], st: ["chill", 1, 0.5], w: 2 })] });
  en("archiveWraith", "Archive Wraith", "ghost", { hpMult: 0.45, pr: 0.5, immune: ["bleed", "poison"], rs: { fire: -0.6, shock: -0.2 }, breakType: "fire", ab: [
    ab("Quill Prick", 0.8, { k: "spell", steal: 1, w: 3 }), ab("Cold Ink", 0.7, { k: "spell", db: ["pow", -0.2, 2], w: 2 })] });
  en("crystalGargoyle", "Crystal Gargoyle", "tank", { hpMult: 0.7, sr: 0.3, rs: { ice: 0.5, fire: 0.25, shock: 0.25 }, immune: ["chill"], breakType: "impact", ab: [
    ab("Rime Claw", 1.1, { w: 3 }), ab("Shard Burst", 0.5, { k: "spell", el: "ice", aoe: 1, st: ["chill", 1, 0.4], w: 1 })] });
  en("vaultHound", "Vault Hound", "beast", { hpMult: 0.55, rs: { poison: -0.6 }, breakType: "st_poison", ab: [
    ab("Triple Bite", 0.45, { hits: 3, w: 3 }), ab("Whine and Lunge", 0.8, { w: 1 })] });

  // ---------- chapter 6: the Kharam road and the Weeping Sea (levels 27-33) ----------
  en("oasisSphinxGuard", "Oasis Sphinx Guard", "caster", { hpMult: 0.6, rs: { ice: -0.5, fire: 0.25 }, breakType: "ice", ab: [
    ab("Riddle", 0.8, { k: "spell", db: ["pow", -0.25, 2], w: 3 }), ab("Paw", 1.0, { w: 2 }), ab("Scholar's Roar", 0.4, { k: "spell", el: "light", aoe: 1, w: 1 })] });
  en("mesaRoc", "Mesa Roc", "flyer", { hpMult: 0.7, pr: 0.1, rs: { shock: -0.5 }, breakType: "shock", ab: [
    ab("Talon Dive", 1.2, { w: 3 }), ab("Wing Buffet", 0.5, { aoe: 1, db: ["spd", -0.2, 2], w: 2 })] });
  en("brassAutomaton", "Brass Automaton", "tank", { hpMult: 0.8, immune: ["bleed", "poison"], rs: { water: -0.5, shock: 0.25 }, breakType: "water", ab: [
    ab("Piston Slam", 1.3, { w: 3 }), ab("Grinding Sweep", 0.5, { aoe: 1, w: 1 })] });
  en("sandWyrmling", "Sand Wyrmling", "swift", { hpMult: 0.4, rs: { water: -0.3 }, ab: [
    ab("Wyrm Bite", 0.9, { st: ["poison", 1, 0.5], w: 3 }), ab("Dune Dive", 0.6, { self: ["dr", 0.4, 1], w: 1 })] });
  en("seaGullHarpy", "Sea Gull Harpy", "flyer", { hpMult: 0.3, rs: { shock: -0.4 }, ab: [
    ab("Screaming Dive", 0.8, { w: 3 }), ab("Peck and Pull", 0.5, { st: ["bleed", 1, 0.4], w: 2 })] });
  en("krakenWhelp", "Kraken Whelp", "tank", { hpMult: 0.65, pr: 0.2, rs: { shock: -0.3, water: 0.5 }, ab: [
    ab("Tentacle Grab", 0.8, { st: ["slow", 1, 0.6], w: 2 }), ab("Ink Squirt", 0.5, { k: "spell", db: ["spd", -0.3, 2], w: 2 }), ab("Shell Bash", 1.0, { w: 2 })] });
  en("gullLord", "Gull Lord", "flyer", { hpMult: 0.45, rs: { shock: -0.4 }, ab: [
    ab("Dive", 1.2, { tgt: "weak", w: 3 }), ab("Mocking Cry", 0.4, { k: "spell", db: ["atk", -0.2, 2], w: 2 })] });
  en("sirenEel", "Siren Eel", "caster", { hpMult: 0.45, rs: { shock: -0.5, water: 0.5 }, breakType: "shock", ab: [
    ab("Siren Song", 0.6, { k: "spell", el: "water", db: ["res", -0.25, 2], w: 3 }), ab("Eel Whip", 0.9, { w: 2 })] });
  en("saltHydraChick", "Salt Hydra Chick", "beast", { hpMult: 0.5, rs: { water: 0.25, fire: -0.2 }, ab: [
    ab("Salt Bite", 0.85, { st: ["poison", 1, 0.6], w: 3 }), ab("Brine Spit", 0.5, { k: "spell", el: "water", w: 1 })] });
  en("mermaidShaman", "Mermaid Shaman", "caster", { hpMult: 0.4, rs: { shock: -0.8, water: 0.5 }, breakType: "shock", ab: [
    ab("Tide Mending", 0, { healAlly: 0.2, w: 3, if: "hurtAlly:0.7" }), ab("Brine Bolt", 0.8, { k: "spell", el: "water", w: 2 })] });
  // ---------- Maelstrom Caves, Cinder Crown, Hollows of Mourn (levels 31-37) ----------
  en("scyllaHound", "Scylla Hound", "swift", { hpMult: 0.55, rs: { shock: -0.4, water: 0.5 }, ab: [
    ab("Three-Jaw Snap", 0.4, { hits: 3, w: 3 }), ab("Drag Under", 0.6, { st: ["wet", 1, 0.7], w: 1 })] });
  en("whirlpoolImp", "Whirlpool Imp", "caster", { hpMult: 0.35, rs: { shock: -0.6, water: 0.75 }, ab: [
    ab("Whirl", 0.8, { k: "spell", el: "water", st: ["wet", 1, 0.6], w: 3 }), ab("Pull Down", 0.5, { db: ["spd", -0.3, 2], w: 1 })] });
  en("caveCrabKnight", "Cave Crab Knight", "tank", { hpMult: 0.85, pr: 0.35, immune: ["bleed"], rs: { shock: -0.3 }, breakType: "impact", ab: [
    ab("Pincer Cleave", 1.3, { w: 3 }), ab("Shell Guard", 0, { self: ["dr", 0.4, 1], w: 1 })] });
  en("drownedSailorWraith", "Drowned Sailor Wraith", "ghost", { hpMult: 0.5, pr: 0.5, immune: ["bleed", "poison"], rs: { fire: -0.4, shock: -0.3, water: 0.75 }, breakType: "fire", ab: [
    ab("Drowning Grip", 0.7, { k: "spell", el: "water", st: ["wet", 1, 0.7], w: 3 }), ab("Cold Lantern", 0.5, { k: "spell", db: ["res", -0.2, 2], w: 1 })] });
  en("ashImp", "Ash Imp", "caster", { hpMult: 0.35, rs: { water: -0.8, fire: 0.75 }, breakType: "water", ab: [
    ab("Ember Toss", 0.9, { k: "spell", el: "fire", st: ["burn", 1, 0.5], w: 3 })] });
  en("lavaBoarling", "Lava Boarling", "brute", { hpMult: 0.6, rs: { water: -0.5, fire: 0.75 }, breakType: "water", bigEvery: 3, bigHit: 1.4, bigName: "Lava Charge", bigSingle: 1, ab: [
    ab("Scorching Gore", 1.1, { st: ["burn", 1, 0.3], w: 3 })] });
  en("cinderGargoyle", "Cinder Gargoyle", "brute", { hpMult: 0.7, pr: 0.3, rs: { water: -0.4, fire: 0.5 }, breakType: "impact", ab: [
    ab("Cinder Claw", 1.1, { st: ["burn", 1, 0.6], w: 3 }), ab("Wing Smother", 0.5, { aoe: 1, w: 1 })] });
  en("smokePhoenixChick", "Smoke Phoenix Chick", "caster", { hpMult: 0.4, rs: { water: -0.5, fire: 0.75 }, ab: [
    ab("Smoke Puff", 0.7, { k: "spell", el: "fire", db: ["atk", -0.15, 2], w: 2 }), ab("Rekindle", 0, { reviveAlly: 0.5, w: 8, if: "deadAlly" })] });
  en("basaltTroll", "Basalt Troll", "tank", { hpMult: 1.0, pr: 0.3, immune: ["burn"], rs: { fire: 0.5, water: -0.2 }, breakType: "impact", ab: [
    ab("Basalt Club", 1.3, { w: 3 }), ab("Stone Skin", 0, { self: ["dr", 0.3, 1], healSelf: 0.05, w: 1 })] });
  en("salamanderKnight", "Salamander Knight", "brute", { hpMult: 0.75, pr: 0.25, immune: ["burn"], rs: { water: -0.5, ice: -0.3, fire: 0.75 }, breakType: "water", ab: [
    ab("Scale Slash", 1.2, { w: 3 }), ab("Flame Edge", 0.9, { el: "fire", st: ["burn", 1, 0.6], w: 2 })] });
  en("obsidianJackal", "Obsidian Jackal", "swift", { hpMult: 0.4, ab: [
    ab("Glass Bite", 0.9, { st: ["bleed", 2, 0.6], w: 3 }), ab("Black Edge", 0.7, { st: ["bleed", 1, 0.4], w: 1 })] });
  en("gloomcapWalker", "Gloomcap Walker", "beast", { hpMult: 0.6, immune: ["poison"], rs: { fire: -0.6, poison: 0.75 }, breakType: "fire", ab: [
    ab("Spore Cloud", 0.5, { k: "spell", el: "poison", aoe: 1, st: ["poison", 1, 0.6], w: 2 }), ab("Cap Slam", 1.0, { w: 3 })] });
  en("boneCerberusPup", "Bone Cerberus Pup", "beast", { hpMult: 0.6, rs: { poison: -0.6 }, breakType: "st_poison", ab: [
    ab("Triple Rend", 0.45, { hits: 3, w: 3 }), ab("Grave Howl", 0.4, { k: "spell", aoe: 1, db: ["res", -0.15, 2], w: 1 })] });
  en("ferryGhoul", "Ferry Ghoul", "brute", { hpMult: 0.7, immune: ["poison"], rs: { fire: -0.3, light: -0.3 }, ab: [
    ab("Oar Sweep", 1.0, { w: 3 }), ab("Drag Aboard", 0.7, { db: ["spd", -0.3, 2], st: ["slow", 1, 0.6], w: 2 })] });
  en("shadeLamia", "Shade Lamia", "ghost", { hpMult: 0.5, pr: 0.4, immune: ["bleed"], rs: { light: -0.6, fire: -0.2 }, ab: [
    ab("Smoke Coil", 0.7, { k: "spell", db: ["res", -0.3, 3], w: 3 }), ab("Fang", 0.8, { st: ["poison", 1, 0.5], w: 2 })] });
  en("paleMinotaurShade", "Pale Minotaur Shade", "brute", { hpMult: 0.8, pr: 0.4, immune: ["bleed", "poison"], rs: { light: -0.5 }, bigEvery: 3, bigHit: 1.5, bigName: "Shade Charge", bigSingle: 1, ab: [
    ab("Spectral Gore", 1.5, { w: 3 }), ab("Bellow of the Dead", 0.4, { k: "spell", aoe: 1, db: ["atk", -0.2, 2], w: 1 })] });
  en("tombScarab", "Tomb Scarab", "swarm", { hpMult: 0.35, riseWhile: "tombScarab", riseMax: 1, riseAfter: 1, riseFrac: 0.5, immune: ["poison"], rs: { fire: -0.3 }, ab: [
    ab("Tomb Bite", 0.8, { w: 3 }), ab("Dust of Ages", 0.35, { aoe: 1, k: "spell", db: ["res", -0.15, 2], w: 1 })] });

  // ---------- Tzavan arena beasts, the three key dungeons, a few chapter characters ----------
  en("lionWolf", "Lion-Wolf", "swift", { hpMult: 0.6, ab: [
    ab("Maul", 1.1, { st: ["bleed", 1, 0.5], w: 3 }), ab("Pack Howl", 0.4, { k: "spell", aoe: 1, db: ["atk", -0.15, 2], w: 1 })] });
  en("boarBull", "Boar-Bull", "brute", { hpMult: 0.75, bigEvery: 3, bigHit: 1.4, bigName: "Bull Rush", bigSingle: 1, ab: [
    ab("Tusk Gore", 1.2, { w: 3 }), ab("Stamp", 0.5, { aoe: 1, w: 1 })] });
  en("fenLeech", "Fen Leech", "beast", { hpMult: 0.55, rs: { fire: -0.3 }, ab: [ab("Blood Drain", 0.8, { drain: 0.5, w: 3 })] });
  en("bogLantern", "Bog Lantern", "caster", { hpMult: 0.3, rs: { shock: -0.4, water: 0.5 }, ab: [
    ab("Lure Light", 0, { pull: 2, w: 2 }), ab("Marsh Spark", 0.8, { k: "spell", el: "shock", w: 2 })] });
  en("giantstoneSentry", "Giantstone Sentry", "tank", { hpMult: 1.1, pr: 0.3, immune: ["bleed", "poison"], rs: { water: -0.2, earth: 0.5 }, breakType: "impact", bigEvery: 3, bigHit: 1.4, bigName: "Giant's Fall", bigSingle: 1, ab: [
    ab("Boulder Fist", 1.5, { w: 3 }), ab("Tremor", 0.5, { aoe: 1, w: 1 })] });
  en("chiselImp", "Chisel Imp", "swift", { hpMult: 0.35, ab: [ab("Chisel Jab", 0.8, { db: ["def", -0.25, 2], w: 3 }), ab("Scrape", 0.7, { w: 1 })] });
  en("emberhawk", "Emberhawk", "flyer", { hpMult: 0.45, rs: { water: -0.5, fire: 0.75 }, breakType: "water", ab: [
    ab("Ember Talon", 1.0, { el: "fire", st: ["burn", 1, 0.6], w: 3 }), ab("Cinder Shriek", 0.35, { k: "spell", el: "fire", aoe: 1, w: 1 })] });
  en("sunbirdChick", "Sunbird Chick", "flyer", { hpMult: 0.4, rs: { water: -0.4, fire: 0.5 }, ab: [
    ab("Warm Chirp", 0, { healAlly: 0.2, w: 3, if: "hurtAlly:0.7" }), ab("Peck", 0.7, { w: 2 })] });
  en("marketOverseer", "Market Overseer", "human", { hpMult: 0.65, human: true, ab: [ab("Whip", 0.9, { st: ["bleed", 1, 0.5], w: 3 }), ab("Crack the Whip", 0, { ally: ["atk", 0.2, 3], w: 1, if: "hasAlly" })] });
  en("netFighter", "Net Fighter", "human", { hpMult: 0.7, human: true, ab: [ab("Trident Jab", 1.0, { w: 3 }), ab("Cast the Net", 0.4, { st: ["slow", 1, 0.8], db: ["spd", -0.25, 2], w: 2 })] });
  en("cellGhost", "Cell Ghost", "ghost", { hpMult: 0.5, pr: 0.5, immune: ["bleed", "poison"], rs: { light: -0.5, fire: -0.3 }, ab: [ab("Cold Hands", 0.7, { k: "spell", db: ["pow", -0.2, 2], w: 3 }), ab("Wail", 0.35, { k: "spell", aoe: 1, db: ["res", -0.15, 2], w: 1 })] });

  // ---------- encounter tables (spec section 3 and 5; weights and levels as written there) ----------
  Object.assign(Core.ENCOUNTERS, {
    occupied: [T(["legionShieldbearer", "legionSpearman"], 3, 22, 23), T(["legionArcher", "legionArcher", "legionOptio"], 2, 22, 23), T(["houndOfTheCohort", "houndOfTheCohort"], 2, 22, 23),
      T(["academyWardenConstruct"], 2, 23, 24), T(["legionTribune", "legionShieldbearer", "legionArcher"], 1, 23, 24)],
    vault: [T(["frostWisp", "frostWisp"], 2, 24, 25), T(["rimeBasilisk"], 2, 24, 25), T(["archiveWraith"], 2, 24, 25), T(["crystalGargoyle"], 2, 25), T(["vaultHound"], 2, 24, 25),
      T(["legionTribune", "legionArcher"], 1, 24, 25), T(["archiveWraith", "frostWisp"], 1, 25)],
    coldVault: [T(["frostWisp", "frostWisp", "frostWisp"], 2, 25, 26), T(["crystalGargoyle"], 3, 25, 26), T(["rimeBasilisk", "frostWisp"], 2, 25, 26), T(["vaultHound", "vaultHound"], 1, 25)],
    canyon: [T(["houndOfTheCohort", "houndOfTheCohort"], 2, 24, 25), T(["legionArcher", "legionSpearman"], 2, 24, 25), T(["legionTribune", "legionShieldbearer"], 1, 25)],
    kharamRoad: [T(["oasisSphinxGuard"], 2, 27, 29), T(["mesaRoc"], 2, 28, 30), T(["brassAutomaton"], 2, 27, 29), T(["sandWyrmling", "sandWyrmling"], 2, 27, 28),
      T(["seaGullHarpy", "seaGullHarpy", "seaGullHarpy"], 1, 27, 28), T(["legionShieldbearer", "legionSpearman", "legionArcher"], 2, 28, 30)],
    seaOpen: [T(["krakenWhelp"], 2, 28, 31), T(["gullLord", "gullLord"], 2, 28, 31), T(["sirenEel"], 2, 28, 31), T(["saltHydraChick", "saltHydraChick"], 2, 28, 31), T(["mermaidShaman", "sirenEel"], 1, 28, 31)],
    straits: [T(["krakenWhelp", "saltHydraChick"], 2, 31, 33), T(["mermaidShaman", "gullLord"], 2, 31, 33), T(["sirenEel", "sirenEel"], 2, 31, 33), T(["legionShieldbearer", "legionArcher", "legionOptio"], 1, 31, 32)],
    patrolGalley: [T(["legionShieldbearer", "legionArcher", "legionOptio"], 1, 30, 32)],
    fen: [T(["saltHydraChick", "fenLeech"], 2, 29, 30), T(["bogLantern", "bogLantern"], 2, 29), T(["drownedSailorWraith"], 2, 30), T(["fenLeech", "fenLeech"], 2, 29, 30), T(["mudbackBasilisk", "bogLantern"], 1, 29)],
    giantQuarry: [T(["giantstoneSentry"], 2, 30, 31), T(["chiselImp", "chiselImp"], 2, 30), T(["brassAutomaton", "basaltSkin"], 2, 30, 31), T(["giantstoneSentry", "chiselImp"], 1, 31), T(["legionArcher", "legionOptio"], 1, 30)],
    roost: [T(["emberhawk", "emberhawk"], 2, 31, 32), T(["sunbirdChick", "sunbirdChick"], 2, 31), T(["mesaRoc"], 2, 31, 32), T(["sunScarabSwarm"], 1, 31), T(["emberhawk", "sunbirdChick"], 1, 32)],
    maelstrom: [T(["scyllaHound", "scyllaHound"], 2, 31, 32), T(["whirlpoolImp", "whirlpoolImp"], 2, 31), T(["caveCrabKnight"], 2, 32), T(["drownedSailorWraith"], 2, 31, 32), T(["scyllaHound", "whirlpoolImp"], 1, 32)],
    cinder: [T(["ashImp", "ashImp"], 2, 33, 34), T(["lavaBoarling"], 2, 33, 34), T(["cinderGargoyle"], 2, 33, 34), T(["smokePhoenixChick", "smokePhoenixChick"], 2, 33), T(["basaltTroll"], 2, 34, 35),
      T(["salamanderKnight"], 2, 34), T(["obsidianJackal", "obsidianJackal"], 1, 34)],
    crater: [T(["lavaBoarling", "cinderGargoyle"], 2, 34, 35), T(["salamanderKnight", "ashImp"], 2, 34), T(["basaltTroll"], 2, 35), T(["obsidianJackal", "obsidianJackal", "obsidianJackal"], 2, 34),
      T(["smokePhoenixChick", "basaltTroll"], 1, 35)],
    hollows: [T(["gloomcapWalker", "gloomcapWalker"], 2, 34, 35), T(["boneCerberusPup", "boneCerberusPup"], 2, 35), T(["ferryGhoul"], 2, 35, 36), T(["shadeLamia"], 2, 35, 36), T(["paleMinotaurShade"], 2, 36),
      T(["tombScarab", "tombScarab"], 1, 35)],
    tzavan: [T(["legionShieldbearer", "legionSpearman", "legionArcher"], 3, 30, 32), T(["legionOptio", "legionShieldbearer", "legionArcher"], 2, 31, 32), T(["lionWolf", "lionWolf"], 2, 30, 31), T(["boarBull"], 2, 31, 32)],
    barracks: [T(["lionWolf", "boarBull"], 2, 31, 33), T(["legionShieldbearer", "legionSpearman"], 2, 31), T(["legionOptio", "legionArcher", "legionArcher"], 2, 32)],
  });
  Core.ENCOUNTERS.tzavanOutskirts = Core.ENCOUNTERS.tzavan;
  // (the collared generals speak in the battle log through Core.HOOKS.genLines and Core.generalWithLines in m2.js; Story.generalScene in ch3.js builds the whole scene)
  if (!has("mudbackBasilisk")) en("mudbackBasilisk", "Mudback Basilisk", "beast", { hpMult: 0.6, rs: { fire: -0.5, water: 0.5 }, ab: [
    ab("Poison Breath", 0.5, { k: "spell", el: "poison", aoe: 1, st: ["poison", 1, 0.6], w: 2 }), ab("Mud Bite", 1.0, { w: 3 })] });
  if (typeof module !== "undefined") module.exports = Core;
})(typeof window !== "undefined" ? window : globalThis);
