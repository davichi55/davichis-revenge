// Field enemies and encounter tables for milestone M2, chapters 3 and 4 (owner: STORY-M2). Core.defEnemy(id, name, profile, o) and Core.ENCOUNTERS[id] = [Core.encT(foes, weight, lo, hi), ...].
// Content spec: ../game-mechanics/specs/M2.md section 2 and the map sections. Ids = BUILD_PLAN_2 rule. Field enemies get the FIELD_HP / FIELD_DMG scaling of core.js; `boss: true` units do not.
// Imperial soldiers (legion...) are defined HERE for every later chapter (M3-M5 reuse them). Also: Core.HOOKS.genLines (mid-fight lines of collared generals, text from Data.GENERAL_LINES).
(function (root) {
  const Core = root.Core || require("../core.js");
  const E = (id, name, profile, o) => Core.defEnemy(id, name, profile, o);
  const T = Core.encT;
  const xp = (lv, k) => Math.round(Core.fightXpBase(lv) * k), gd = (lv, k) => Math.round(Core.goldBase(lv) * k);

  // ================= imperial soldiers (used from chapter 3 to the end) =================
  E("legionShieldbearer", "Legion Shieldbearer", "human", { human: 1, hpMult: 0.6, pr: 0.4, rs: { shock: -0.2 },
    ab: [{ n: "Gladius", p: 1.0, w: 3 }, { n: "Shield Bash", p: 0.75, db: ["spd", -0.2, 2], w: 2 }, { n: "Brace Behind the Shield", self: ["dr", 0.35, 1], w: 1, if: "hp<0.7" }] });
  E("legionSpearman", "Legion Spearman", "human", { human: 1, hpMult: 0.5,
    ab: [{ n: "Spear Thrust", p: 1.2, tgt: "front", w: 3 }, { n: "Brace the Spear", p: 0.7, self: ["dr", 0.3, 1], w: 1 }] });
  E("legionArcher", "Legion Archer", "human", { human: 1, hpMult: 0.4,
    ab: [{ n: "Volley", p: 1.0, w: 3 }, { n: "Quick Shot", p: 0.7, tgt: "weak", w: 1 }] });
  E("legionOptio", "Legion Optio", "human", { human: 1, hpMult: 0.65,
    ab: [{ n: "Optio's Blade", p: 0.95, w: 3 }, { n: "Rally the Line", ally: ["atk", 0.2, 3], w: 2, if: "hasAlly" }, { n: "Shield Wall Order", ally: ["def", 0.2, 3], w: 1, if: "first" }] });
  E("legionMarksman", "Legion Marksman", "human", { human: 1, hpMult: 0.45,
    ab: [{ n: "Aimed Shot", p: 1.3, tgt: "weak", w: 4 }, { n: "Feather-Cloak Roll", self: ["dr", 0.3, 1], w: 1 }] });
  E("jaguarCohortElite", "Jaguar Cohort Elite", "swift", { human: 1, hpMult: 0.8, actions: 2, rs: { ice: -0.2 },
    ab: [{ n: "Obsidian Slash", p: 0.7, st: ["bleed", 1, 0.6], w: 3 }, { n: "Pounce", p: 0.65, tgt: "weak", w: 2 }] });
  E("pyramidAcolyte", "Pyramid Acolyte", "caster", { human: 1, hpMult: 0.55, rs: { light: 0.25 },
    ab: [{ n: "Obsidian Knife", p: 1.0, k: "phys", st: ["bleed", 1, 0.7], w: 3 }, { n: "Rite of the Offering", p: 0.5, k: "spell", db: ["res", -0.2, 2], w: 2 }] });

  // ================= the rival team (Kessa Vorn, Dorrin Hale, Mayle Tarn, Emberwick): duels, no break =================
  const duel = (lv, k) => ({ boss: true, xpAbs: xp(lv, k), goldAbs: gd(lv, k) });
  E("kessaVorn", "Kessa Vorn", "swift", Object.assign({ human: 1, hpMult: 1.7, actions: 1, element: "fire", intro: "Kessa Vorn steps forward, red scarf snapping.",
    ab: [{ n: "Corps Blade", p: 0.8, w: 4 }, { n: "Scarf Feint", p: 0.5, self: ["dr", 0.3, 1], w: 2 }, { n: "Tamer's Whistle", ally: ["atk", 0.25, 2], w: 2, if: "hasAlly" }, { n: "Quick Cut", p: 0.55, st: ["bleed", 1, 0.5], tgt: "weak", w: 2 }] }, duel(12, 2.2)));
  E("emberwick", "Emberwick", "caster", Object.assign({ hpMult: 1.0, element: "fire", rs: { water: -0.4, fire: 0.5 }, intro: "Emberwick shakes out its candle-flame mane.",
    ab: [{ n: "Ember Peck", p: 0.6, k: "spell", el: "fire", st: ["burn", 1, 0.5], w: 3 }, { n: "Warm", healAlly: 0.18, w: 2, if: "hurtAlly:0.8" }, { n: "Candle Mane", p: 0.3, k: "spell", el: "fire", aoe: 1, w: 1 }] }, duel(12, 1.0)));
  E("dorrinHale", "Dorrin Hale", "tank", Object.assign({ human: 1, hpMult: 1.5, actions: 1,
    ab: [{ n: "Haymaker", p: 0.85, w: 4 }, { n: "Snack Break", healSelf: 0.12, w: 1, if: "hp<0.6" }, { n: "Shoulder Barge", p: 0.5, db: ["spd", -0.25, 2], w: 2 }] }, duel(19, 1.1)));
  E("mayleTarn", "Mayle Tarn", "caster", Object.assign({ human: 1, hpMult: 1.1, actions: 1,
    ab: [{ n: "Page Twelve", p: 0.7, k: "spell", db: ["def", -0.2, 2], w: 3 }, { n: "Note the Weakness", p: 0.35, mark: 0.25, w: 2, if: "nomarked" }, { n: "Inkpot", p: 0.8, k: "spell", w: 2 }] }, duel(19, 1.1)));

  // ================= chapter 3: Creeping Shore and Silt River (levels 10-12) =================
  E("mudbackBasilisk", "Mudback Basilisk", "beast", { hpMult: 0.6, rs: { fire: -0.5, water: 0.5 }, ab: [{ n: "Mud Jaws", p: 1.0, w: 3 }, { n: "Poison Breath", p: 0.4, k: "spell", el: "poison", aoe: 1, st: ["poison", 1, 0.7], w: 2 }] });
  E("riverSiren", "River Siren", "caster", { hpMult: 0.38, rs: { shock: -0.5, water: 0.6 }, ab: [{ n: "Siren's Lament", p: 0.5, k: "spell", db: ["res", -0.3, 2], w: 3 }, { n: "Spray", p: 0.85, k: "spell", el: "water", w: 2 }] });
  E("reedmoth", "Reedmoth", "flyer", { hpMult: 0.45, rs: { fire: -0.6 }, ab: [{ n: "Pale Wingbeat", p: 0.8, w: 2 }, { n: "Reed Dust", p: 0.3, k: "spell", aoe: 1, db: ["atk", -0.2, 2], w: 3 }] });
  E("bogTrollPup", "Bog Troll Pup", "tank", { hpMult: 0.85, rs: { ice: -0.5, earth: 0.3 }, ab: [{ n: "Mossy Fist", p: 1.15, w: 3 }, { n: "Sit on It", p: 0.7, db: ["spd", -0.25, 2], w: 1 }] });
  E("heronWraith", "Heron Wraith", "ghost", { hpMult: 0.5, pr: 0.5, immune: ["bleed"], rs: { shock: -0.5 }, ab: [{ n: "Draw the Eye", pull: 2, w: 3, if: "first" }, { n: "Beak in the Fog", p: 1.0, k: "spell", w: 3 }, { n: "Draw the Eye", pull: 2, w: 1, if: "every:3" }] });
  E("pearlBackedSnapper", "Pearl-Backed Snapper", "tank", { hpMult: 0.7, rs: { shock: -0.5 }, ab: [{ n: "Snap", p: 1.1, w: 3 }, { n: "Withdraw", self: ["dr", 0.5, 1], w: 2 }] });
  E("tideHag", "Tide Hag", "caster", { hpMult: 0.5, rs: { fire: -0.4, water: 0.5 }, ab: [{ n: "Brine Hex", p: 0.6, k: "spell", el: "water", steal: 1, w: 3 }, { n: "Clutching Hands", p: 0.9, w: 2 }] });
  E("glowCrab", "Glow Crab", "tank", { hpMult: 0.6, rs: { water: 0.3 }, ab: [{ n: "Pincer", p: 1.0, w: 3 }, { n: "Glowshell Flash", p: 0.45, k: "spell", el: "light", db: ["spd", -0.25, 2], w: 2 }] });
  E("mangroveImp", "Mangrove Imp", "swift", { hpMult: 0.35, rs: { fire: -0.4 }, ab: [{ n: "Thorn Rake", p: 0.9, st: ["bleed", 1, 0.6], w: 3 }, { n: "Cage Dash", p: 0.5, self: ["dr", 0.3, 1], w: 1 }] });
  E("whisperfish", "Whisperfish", "caster", { hpMult: 0.4, rs: { shock: -0.4 }, ab: [{ n: "Maddening Whisper", p: 0.4, k: "spell", st: ["stun", 1, 0.25], w: 2 }, { n: "Silencing Murmur", p: 0.5, k: "spell", db: ["pow", -0.35, 2], w: 2 }, { n: "Bubble", p: 0.7, k: "spell", el: "water", w: 1 }] });

  // ================= chapter 3: Greenmaw Jungle, Boiling Pools (levels 12-14) =================
  E("gildedTapirSprite", "Gilded Tapir Sprite", "tank", { hpMult: 0.75, rs: { ice: -0.5 }, ab: [{ n: "Gilded Stomp", p: 1.0, db: ["def", -0.25, 2], w: 3 }, { n: "Sphinx Paw", p: 1.1, w: 2 }] });
  E("vineChimera", "Vine Chimera", "swift", { hpMult: 0.55, rs: { fire: -0.5 }, ab: [{ n: "Lion Claws", p: 0.9, st: ["bleed", 1, 0.5], w: 3 }, { n: "Goat Ram", p: 1.1, w: 2 }] });
  E("jungleHarpy", "Jungle Harpy", "flyer", { hpMult: 0.45, actions: 2, rs: { shock: -0.5 }, ab: [{ n: "Talon Rake", p: 0.65, st: ["bleed", 1, 0.4] }] });
  E("sporeSatyr", "Spore Satyr", "beast", { hpMult: 0.6, rs: { fire: -0.5 }, ab: [{ n: "Spore Puff", p: 0.4, k: "spell", el: "poison", aoe: 1, st: ["poison", 1, 0.8], w: 3 }, { n: "Horn Butt", p: 1.0, w: 2 }] });
  E("emberToucan", "Ember Toucan", "flyer", { hpMult: 0.45, rs: { water: -0.5, fire: 0.5 }, ab: [{ n: "Torch Beak", p: 0.9, el: "fire", st: ["burn", 1, 0.7], w: 3 }, { n: "Spark Shower", p: 0.35, k: "spell", el: "fire", aoe: 1, st: ["burn", 1, 0.4], w: 1 }] });
  E("stranglerNaga", "Strangler Naga", "beast", { hpMult: 0.65, rs: { fire: -0.5 }, ab: [{ n: "Strangling Coil", p: 0.55, hold: 1, w: 3, if: "nobodyHeld" }, { n: "Root Bite", p: 1.05, w: 3 }] });
  E("kapokTroll", "Kapok Troll", "tank", { hpMult: 0.9, rs: { fire: -0.5 }, ab: [{ n: "Branch Smash", p: 1.25, w: 3 }, { n: "Root Stomp", p: 0.4, aoe: 1, w: 1 }] });
  E("steamSprite", "Steam Sprite", "caster", { hpMult: 0.4, rs: { ice: -0.6, fire: 0.5, water: 0.3 }, ab: [{ n: "Scalding Puff", p: 0.8, k: "spell", el: "fire", st: ["burn", 1, 0.6], w: 3 }, { n: "Boil Over", p: 0.35, k: "spell", el: "fire", aoe: 1, w: 1 }] });
  E("hotspringToad", "Hot-Spring Toad", "tank", { hpMult: 0.7, rs: { fire: 0.2, shock: -0.4 }, ab: [{ n: "Tongue Slap", p: 0.9, st: ["wet", 1, 0.6], w: 3 }, { n: "Soak in the Spring", healSelf: 0.15, w: 2, if: "hp<0.7" }] });

  // ================= chapter 4: Featherfall Canopy, caves, aviary, lookout, spire (levels 16-21) =================
  E("featherWyvern", "Feather Wyvern", "flyer", { hpMult: 0.55, rs: { shock: -0.5 }, bigEvery: 3, bigHit: 1.5, bigName: "Plunging Dive", bigSingle: 1, ab: [{ n: "Wing Buffet", p: 0.8, w: 3 }, { n: "Tail Barb", p: 0.9, w: 2 }] });
  E("lanternBatKnight", "Lantern Bat Knight", "flyer", { hpMult: 0.5, pr: 0.2, rs: { fire: -0.5 }, ab: [{ n: "Tin Sword", p: 0.95, w: 3 }, { n: "Lamplight", p: 0.3, k: "spell", el: "light", mark: 0.3, w: 2, if: "nomarked" }] });
  E("ropeSpiderMaiden", "Rope Spider-Maiden", "swift", { hpMult: 0.6, rs: { fire: -0.6 }, ab: [{ n: "Web Shot", p: 0.6, k: "spell", st: ["slow", 1, 0.85], w: 3 }, { n: "Venom Fang", p: 1.0, st: ["poison", 1, 0.4], w: 2 }] });
  E("orchidDryad", "Orchid Dryad", "caster", { hpMult: 0.5, rs: { fire: -0.6, water: 0.3 }, ab: [{ n: "Bloom Mend", healAlly: 0.2, w: 3, if: "hurtAlly:0.8" }, { n: "Thorn Whip", p: 0.9, k: "spell", w: 3 }, { n: "Pollen Veil", p: 0.3, k: "spell", aoe: 1, db: ["spd", -0.2, 2], w: 1 }] });
  E("cloudRam", "Cloud Ram", "beast", { hpMult: 0.6, rs: { shock: -0.5 }, bigEvery: 3, bigHit: 1.4, bigName: "Thunderhead Charge", bigSingle: 1, ab: [{ n: "Horn Butt", p: 1.1, w: 3 }, { n: "Cloudstep", p: 0.6, self: ["dr", 0.25, 1], w: 1 }] });
  E("skyEel", "Sky Eel", "flyer", { hpMult: 0.5, rs: { ice: -0.5, shock: 0.6 }, ab: [{ n: "Static Bite", p: 0.9, st: ["shock", 1, 0.5], w: 3 }, { n: "Arc Storm", p: 0.35, k: "spell", el: "shock", aoe: 1, w: 1 }] });
  E("sporerootCrawler", "Sporeroot Crawler", "beast", { hpMult: 0.55, rs: { fire: -0.5 }, ab: [{ n: "Root Legs", p: 0.9, st: ["poison", 1, 0.5], w: 3 }, { n: "Spore Spray", p: 0.35, k: "spell", el: "poison", aoe: 1, st: ["poison", 1, 0.5], w: 1 }] });
  E("gloomMushroomShaman", "Gloom Mushroom Shaman", "caster", { hpMult: 0.5, rs: { fire: -0.5 }, ab: [{ n: "Poison Cap", p: 0.7, k: "spell", el: "poison", st: ["poison", 1, 0.8], w: 3 }, { n: "Spore Mend", healAlly: 0.15, w: 2, if: "hurtAlly:0.8" }] });
  E("caveGargoyle", "Cave Gargoyle", "brute", { hpMult: 0.8, sr: 0.3, pr: 0.15, rs: { earth: 0.5, water: -0.25 }, ab: [{ n: "Claw", p: 1.0, w: 3 }, { n: "Stone Dive", p: 1.5, w: 1, if: "every:3" }] });
  E("fungusTroll", "Fungus Troll", "tank", { hpMult: 0.9, immune: ["poison"], rs: { fire: -0.5 }, ab: [{ n: "Cap Smash", p: 1.2, w: 3 }, { n: "Spore Belch", p: 0.35, k: "spell", el: "poison", aoe: 1, st: ["poison", 1, 0.6], w: 2 }] });
  E("drippingMimic", "Dripping Mimic", "tank", { hpMult: 0.8, immune: ["bleed", "poison"], rs: { fire: -0.4 }, open: { n: "Lid Snaps Open", p: 1.1, tgt: "weak" }, ab: [{ n: "Gnash", p: 1.15, w: 3 }, { n: "Drip", p: 0.6, k: "spell", el: "water", st: ["wet", 1, 0.7], w: 1 }] });
  E("plumedWatcher", "Plumed Watcher", "tank", { hpMult: 0.9, pr: 0.3, immune: ["bleed", "poison"], rs: { shock: -0.3 }, ab: [{ n: "Stone Wing", p: 1.1, w: 3 }, { n: "Stand Guard", ally: ["def", 0.3, 2], w: 1, if: "hasAlly" }] });

  // ================= encounter tables (rate and zones live in the map data; levels per the spec) =================
  const EN = Core.ENCOUNTERS;
  EN.shore = [T(["mudbackBasilisk"], 3, 10, 11), T(["riverSiren"], 2, 10, 11), T(["reedmoth", "reedmoth"], 2, 10, 11), T(["bogTrollPup"], 2, 11), T(["pearlBackedSnapper"], 2, 10, 12), T(["mudbackBasilisk", "reedmoth"], 1, 11)];
  EN.river = [T(["pearlBackedSnapper"], 3, 10, 12), T(["riverSiren", "riverSiren"], 2, 11), T(["heronWraith"], 2, 11, 12), T(["bogTrollPup", "reedmoth"], 2, 11, 12), T(["mudbackBasilisk"], 2, 11), T(["heronWraith", "pearlBackedSnapper"], 1, 12)];
  EN.riverCave = [T(["tideHag"], 2, 11, 12), T(["glowCrab", "glowCrab"], 2, 11), T(["mangroveImp", "mangroveImp"], 2, 11), T(["whisperfish"], 2, 11, 12), T(["tideHag", "glowCrab"], 1, 12)];
  EN.jungle = [T(["gildedTapirSprite"], 2, 12, 13), T(["vineChimera"], 3, 12, 14), T(["jungleHarpy", "jungleHarpy"], 3, 12, 14), T(["sporeSatyr"], 2, 12, 13), T(["emberToucan", "emberToucan"], 2, 12, 13), T(["stranglerNaga"], 2, 13, 14), T(["kapokTroll"], 2, 13, 14), T(["vineChimera", "jungleHarpy"], 1, 13)];
  EN.jungleRoad = [T(["legionShieldbearer", "legionSpearman"], 3, 12, 13), T(["legionArcher", "legionArcher"], 2, 12, 13), T(["legionOptio", "legionShieldbearer", "legionArcher"], 2, 13, 14), T(["jaguarCohortElite"], 1, 14)];
  EN.fort = [T(["legionShieldbearer", "legionShieldbearer", "legionArcher"], 2, 13), T(["legionSpearman", "legionSpearman"], 2, 13), T(["legionOptio", "legionSpearman", "legionArcher"], 2, 13, 14), T(["jaguarCohortElite"], 1, 14)];
  EN.pyramid = [T(["legionArcher", "legionOptio", "legionSpearman"], 2, 14), T(["pyramidAcolyte", "pyramidAcolyte"], 2, 14), T(["jaguarCohortElite"], 2, 14, 15), T(["kapokTroll"], 1, 14), T(["stranglerNaga"], 1, 14)];
  EN.pools = [T(["steamSprite", "steamSprite"], 2, 13, 14), T(["hotspringToad"], 2, 13), T(["emberToucan", "vineChimera"], 2, 13, 14), T(["sporeSatyr"], 1, 13), T(["kapokTroll"], 1, 14)];
  EN.canopy = [T(["featherWyvern"], 2, 16, 18), T(["lanternBatKnight", "lanternBatKnight"], 2, 16, 17), T(["ropeSpiderMaiden"], 2, 17, 18), T(["orchidDryad", "cloudRam"], 2, 16, 18), T(["skyEel"], 2, 17, 18), T(["cloudRam", "cloudRam"], 1, 17, 19)];
  EN.canopyLegion = [T(["legionMarksman", "legionArcher"], 2, 17, 18), T(["legionMarksman", "jaguarCohortElite"], 1, 18)];
  EN.sporeCave = [T(["sporerootCrawler", "sporerootCrawler"], 2, 17, 18), T(["gloomMushroomShaman"], 2, 17, 18), T(["caveGargoyle"], 2, 18), T(["fungusTroll"], 2, 18, 19), T(["drippingMimic"], 1, 18), T(["gloomMushroomShaman", "sporerootCrawler"], 1, 18)];
  EN.aviary = [T(["featherWyvern", "skyEel"], 2, 18, 19), T(["cloudRam"], 2, 18), T(["legionMarksman", "legionMarksman"], 2, 18), T(["lanternBatKnight", "orchidDryad"], 2, 18, 19), T(["jaguarCohortElite"], 1, 19)];
  EN.lookout = [T(["legionMarksman", "legionMarksman", "legionOptio"], 3, 18, 19), T(["jaguarCohortElite", "legionMarksman"], 2, 19), T(["featherWyvern"], 2, 18), T(["ropeSpiderMaiden", "cloudRam"], 1, 18)];
  EN.spire = [T(["featherWyvern", "skyEel"], 2, 20, 21), T(["plumedWatcher"], 2, 20, 21), T(["legionMarksman", "jaguarCohortElite"], 2, 20), T(["cloudRam", "lanternBatKnight"], 1, 20)];

  // ================= generals: their own voice in the battle log =================
  // Data.GENERAL_LINES[creatureId] = { meet, fight[3], brk[2], freed, memories[3] } (src/story/generals.js). The unit says fight[0] when the fight starts, fight[1] at 75 percent HP,
  // memories[0] at 50 percent, fight[2] at 25 percent and brk[0..1] when its style break lands. The text is a "say" event (the arena prints it in the battle log).
  const lines = u => (root.Data && root.Data.GENERAL_LINES && root.Data.GENERAL_LINES[u.art]) || null;
  const speak = (ctx, u, t) => { if (t) Core.say(ctx, u.name + ': "' + t + '"'); };
  Core.HOOKS.genLines = {
    start(ctx, u) { u.glSaid = {}; const L = lines(u); if (L) speak(ctx, u, L.fight[0]); },
    hit(ctx, u) {
      if (!u.alive) return; const L = lines(u); if (!L) return; const f = u.hp / u.maxHp, s = u.glSaid = u.glSaid || {};
      if (f <= 0.75 && !s[75]) { s[75] = 1; speak(ctx, u, L.fight[1]); }
      if (f <= 0.5 && !s[50]) { s[50] = 1; speak(ctx, u, L.memories[0]); }
      if (f <= 0.25 && !s[25]) { s[25] = 1; speak(ctx, u, L.fight[2]); }
    },
    broken(ctx, u) { const L = lines(u); if (!L || (u.glSaid && u.glSaid.brk)) return; (u.glSaid = u.glSaid || {}).brk = 1; speak(ctx, u, L.brk[0]); speak(ctx, u, L.brk[1]); },
  };
  // Core.generalWithLines(creatureId, level, { slot, ... }) = Core.makeGeneral + the genLines hook (also on the definition, so "Try again" keeps it)
  Core.generalWithLines = (creatureId, level, o) => {
    const u = Core.makeGeneral(creatureId, level, o), d = Core.ENEMIES["gen_" + creatureId];
    if (d) d.hooks = (d.hooks || []).filter(h => h !== "genLines").concat("genLines");
    u.hooks = (u.hooks || []).filter(h => h !== "genLines").concat("genLines"); return u;
  };

  if (typeof module !== "undefined") module.exports = Core;
})(typeof window !== "undefined" ? window : globalThis);
