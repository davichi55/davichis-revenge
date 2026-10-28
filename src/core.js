// Battle rules for Davichi's Revenge (owner A). UI-free: every rule pushes events into ctx.ev and the battle scene plays them back.
// Works in the browser (window.Core) and in Node (require) for headless tests.
//
// QUICK API (see BUILD_LOG.md for the long version)
//   Core.CREATURES[id], Core.PACKS.P1..P9, Core.makeCreature(id, level), Core.movesOf(u) -> move ids, Core.MOVES[id]
//   Core.ENEMIES[id], Core.makeEnemy(id, level, tag), Core.ENCOUNTERS[tableId], Core.rollEncounter(tableId) -> enemy units
//   Core.newBattle(party, foes) -> ctx;  loop: for u of Core.turnOrder(ctx): n = Core.actionsFor(ctx,u);
//     player: Core.useMove(ctx,u,moveId,target,opt) | Core.useItem(ctx,u,itemId,target);  enemy: Core.enemyAct(ctx,u); then Core.endTurn(ctx,u); after the round Core.endRound(ctx)
//   Core.autoChoice(ctx,u) -> {move,target,opt}; Core.autoItem(ctx,u,items) -> {item,target}|null; Core.canUse(ctx,u,moveId); Core.mpCost(u,moveId)
//   Core.rewards(foes) -> {xp,kakal,drops}; Core.giveXp(party,xp); Core.SKILLBOOK; Core.ITEMS; Core.MATERIALS
(function (root) {
  "use strict";
  const STATS = ["hp", "atk", "pow", "def", "res", "spd", "foc", "lck"];
  const STAT_NAMES = { hp: "HP", atk: "Attack", pow: "Power", def: "Defense", res: "Resistance", spd: "Speed", foc: "Focus", lck: "Luck" };
  const BASE_TOTAL = 80, POINTS_PER_LEVEL = 3;
  const rnd = Math.random, chance = p => rnd() < p;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const pick = a => a[Math.floor(rnd() * a.length)];
  const sum = a => a.reduce((s, x) => s + x, 0);

  // exact-total stat spread: every stat starts at 3, the rest is shared by weight (largest remainder), so every creature has the same total
  function spread(weights, total, tweak) {
    const w = {}; STATS.forEach(k => (w[k] = (weights[k] || 0.1) * ((tweak && tweak[k]) || 1)));
    const ws = sum(Object.values(w)), rest = total - 3 * STATS.length, s = {}, fr = [];
    let used = 0;
    STATS.forEach(k => { const raw = rest * w[k] / ws; s[k] = 3 + Math.floor(raw); used += Math.floor(raw); fr.push([raw - Math.floor(raw), k]); });
    fr.sort((a, b) => b[0] - a[0]);
    for (let i = 0; used + i < rest; i++) s[fr[i % fr.length][1]]++;
    return s;
  }
  const maxHpOf = (s, level, mult = 1) => Math.round((30 + 5 * s.hp + 3 * level) * mult);
  const xpToNext = level => Math.round(10 * Math.pow(level, 1.5));

  // ---------- styles ----------
  const STYLES = {
    minotaur: { name: "Minotaur", passive: "rampage", passiveName: "Rampage: +25% damage to a broken enemy", w: { hp: 2, atk: 4, pow: 0.3, def: 1, res: 0.5, spd: 0.6, foc: 0.6, lck: 0.8 } },
    harpy: { name: "Harpy", passive: "relentless", passiveName: "Relentless: every 3rd hit it lands in one turn gives +1 MP", w: { hp: 1.3, atk: 2.5, pow: 0.3, def: 0.7, res: 0.8, spd: 4, foc: 0.8, lck: 2 } },
    hydra: { name: "Hydra", passive: "manyHeads", passiveName: "Many Heads: each different status on a target raises all damage over time on it by 10%", w: { hp: 2, atk: 0.5, pow: 3.2, def: 1, res: 1.3, spd: 0.8, foc: 1, lck: 2.2 } },
    colossus: { name: "Colossus", passive: "stoneskin", passiveName: "Stone Skin: +1 MP when hit (max 2 per turn)", w: { hp: 3, atk: 1, pow: 0.3, def: 3, res: 2, spd: 0.4, foc: 0.8, lck: 0.3 } },
    phoenix: { name: "Phoenix", passive: "ashes", passiveName: "From the Ashes: once per fight, rises at 25% HP", w: { hp: 2, atk: 0.3, pow: 3, def: 1, res: 2, spd: 1, foc: 2, lck: 0.4 } },
    gorgon: { name: "Gorgon", passive: "exposed", passiveName: "Exposed: each debuff on a target makes it take +5% damage from everyone", w: { hp: 1.4, atk: 0.4, pow: 2.4, def: 0.9, res: 1.5, spd: 2.6, foc: 1.2, lck: 2.4 } },
    dragon: { name: "Dragon", passive: "comboMaster", passiveName: "Combo Master: reactions it triggers deal +30%", w: { hp: 1.2, atk: 0.3, pow: 3.8, def: 0.6, res: 1.2, spd: 1.8, foc: 2.4, lck: 0.8 } },
    leviathan: { name: "Leviathan", passive: "highWater", passiveName: "High Water: max MP 15; at 5 Tide its next release also stuns", w: { hp: 3.2, atk: 1.6, pow: 2.2, def: 1.2, res: 1.2, spd: 0.5, foc: 2.2, lck: 0.6 } },
  };
  const STYLE_WEIGHTS = Object.fromEntries(Object.entries(STYLES).map(([k, v]) => [k, v.w]));

  // ---------- creatures: [id, name, style, element, pack, personality, personal move, stat tweak] ----------
  const CREATURE_ROWS = [
    ["horncinder", "Horncinder", "minotaur", "fire", "P1", "loud, impulsive, fiercely loyal", "twoHeads", { hp: 1.1, lck: 1.3, spd: 0.9 }],
    ["shellmund", "Shellmund", "colossus", "earth", "P1", "slow-speaking old soul", "erodingRune", { hp: 1.15, def: 1.1, res: 0.9, spd: 0.8 }],
    ["kitsuneva", "Kitsuneva", "phoenix", "fire", "P1", "warm, motherly, likes to tease", "nineTails", { spd: 1.3, pow: 1.05, res: 0.9 }],
    ["skarnwolf", "Skarnwolf", "minotaur", "ice", "P2", "angry about captivity, softens slowly", "grudgeBite", { spd: 1.6, atk: 1.1, def: 0.8, hp: 0.9 }],
    ["vespera", "Vespera", "harpy", "dark", "P2", "arrogant, sharp-tongued, very quick", "cuttingRemark", { spd: 1.25, lck: 1.4, hp: 0.8, def: 0.9 }],
    ["glimmerkoi", "Glimmerkoi", "dragon", "water", "P2", "curious, bookish, asks too many questions", "gateClimb", { foc: 1.3, res: 1.2, spd: 0.9 }],
    ["mossmaw", "Mossmaw", "hydra", "nature", "P3", "grumpy, secretly funny", "smotheringMoss", { hp: 1.5, def: 1.3, spd: 0.7, pow: 0.9 }],
    ["nightveil", "Nightveil", "gorgon", "dark", "P3", "silent, eerie, wise", "unheardApproach", { res: 1.4, lck: 1.2, hp: 0.9 }],
    ["emberlamb", "Emberlamb", "phoenix", "fire", "P3", "shy, but brave when it counts", "goldenFleece", { hp: 1.3, def: 1.4, pow: 0.9, spd: 0.8 }],
    ["skyrend", "Skyrend", "harpy", "wind", "P4", "reckless joker", "jokersGambit", { atk: 1.25, lck: 1.3, def: 0.8, hp: 0.9 }],
    ["volthorn", "Volthorn", "dragon", "shock", "P4", "overexcited, never sits still", "staticGallop", { spd: 1.5, pow: 1.05, foc: 0.8, res: 0.8 }],
    ["brinegrave", "Brinegrave", "leviathan", "water", "P4", "brooding, patient, protective", "houndsAtTheGate", { def: 1.4, hp: 1.1, pow: 0.8, atk: 1.2 }],
    ["bulwyrm", "Bulwyrm", "colossus", "earth", "P5", "stoic, few words", "serpentSpout", { def: 1.3, hp: 0.9, res: 0.9, pow: 2.5 }],
    ["rotfang", "Rotfang", "hydra", "poison", "P5", "sarcastic, bitter", "nidhoggGnaw", { atk: 3, hp: 0.9, lck: 1.2, spd: 1.2 }],
    ["stillgaze", "Stillgaze", "gorgon", "earth", "P5", "cryptic, playful", "creepingStone", { foc: 1.5, spd: 0.9, hp: 1.2 }],
    ["crushjaw", "Crushjaw", "minotaur", "dark", "P6", "gluttonous, cheerful", "ammitsFeast", { hp: 1.35, def: 1.25, spd: 0.8, atk: 0.95 }],
    ["zephyrra", "Zephyrra", "harpy", "wind", "P6", "hyper, kind-hearted", "featherCushion", { spd: 1.1, hp: 1.3, res: 1.5, atk: 0.85 }],
    ["duskcoil", "Duskcoil", "gorgon", "dark", "P6", "a gossip who knows everyone's secrets", "dirtyLaundry", { lck: 1.3, pow: 1.1, def: 0.9, hp: 0.9 }],
    ["atlacrab", "Atlacrab", "colossus", "water", "P7", "gentle giant", "plantThePillar", { def: 1.3, hp: 1.1, res: 0.8, foc: 1.3 }],
    ["solenne", "Solenne", "phoenix", "light", "P7", "serene, a bit preachy", "sunAscending", { res: 1.3, foc: 1.2, spd: 0.8, pow: 1.05 }],
    ["kappadeep", "Kappadeep", "leviathan", "water", "P7", "sleepy, wise, slow to anger", "tipTheBowl", { hp: 1.3, res: 1.3, atk: 0.8, spd: 0.8 }],
    ["smolderhead", "Smolderhead", "hydra", "fire", "P8", "mischievous pyromaniac", "spontaneousCombustion", { pow: 1.2, lck: 1.3, hp: 0.8, def: 0.8, spd: 1.2 }],
    ["pyrewisp", "Pyrewisp", "dragon", "fire", "P8", "playful trickster", "misleadingLight", { spd: 1.7, lck: 1.8, hp: 0.9, def: 0.8 }],
    ["mawdeep", "Mawdeep", "leviathan", "water", "P8", "always hungry, simple, honest", "devouringWhirl", { hp: 1.3, atk: 1.5, foc: 0.8, pow: 0.9 }],
    ["auroracorn", "Auroracorn", "phoenix", "light", "P9", "calm optimist, always sees the good in people", "silverLining", { pow: 1.15, res: 1.2, foc: 1.1, hp: 0.9 }],
    ["lumoth", "Lumoth", "phoenix", "wind", "P9", "quiet night-healer, a little melancholic", "fallingDust", { spd: 1.4, foc: 1.3, hp: 0.8, def: 0.8 }],
    ["sunkenhorn", "Sunkenhorn", "leviathan", "water", "P9", "patient elder who speaks rarely but means it", "moonlitAntlers", { hp: 1.2, foc: 1.3, pow: 1.1, atk: 0.9 }],
    // lab extras (freed with dungeon keys; L1 is reachable in M1)
    ["bramblehoof", "Bramblehoof", "minotaur", "nature", "L", "slow-moving forest guardian, no hurry", "takeRoot", { hp: 1.3, def: 1.4, res: 1.3, atk: 0.9, spd: 0.7 }],
    ["quillshade", "Quillshade", "harpy", "wind", "L", "a chatterbox who knows every rumour", "sealedLetters", { foc: 1.6, lck: 1.3, atk: 0.8 }],
    ["mirequeen", "Mirequeen", "hydra", "poison", "L", "haunted survivor, wants the records burned", "keeningOmen", { res: 1.4, hp: 1.2, spd: 0.9 }],
    ["brassbone", "Brassbone", "colossus", "fire", "L", "an old builder-made guardian, slowly remembering", "redHotBronze", { atk: 2.2, def: 1.2, hp: 0.9 }],
    ["selkira", "Selkira", "phoenix", "water", "L", "grieving, searching for her lost pod", "lamentOfThePod", { hp: 1.3, res: 1.3, pow: 0.95 }],
    ["hearthkin", "Hearthkin", "phoenix", "fire", "L", "hums your mother's lullaby", "lightTheHearth", { foc: 1.4, hp: 1.1, spd: 0.8, pow: 0.95 }],
    ["mothmara", "Mothmara", "gorgon", "dark", "L", "carries guilt, seeks redemption", "nightTerror", { spd: 1.2, res: 1.3, lck: 0.9 }],
    ["kirinth", "Kirinth", "dragon", "light", "L", "sacred and shy; scales shift with its mood", "moodScales", { foc: 1.3, hp: 1.3, spd: 0.9 }],
    ["bakuroth", "Bakuroth", "leviathan", "dark", "L", "eats nightmares, dreams of falling stars", "dreamEater", { hp: 1.4, res: 1.3, atk: 0.8, foc: 1.2 }],
  ];
  const CREATURES = {};
  CREATURE_ROWS.forEach(([id, name, style, element, pack, personality, personal, t]) => {
    const S = STYLES[style];
    CREATURES[id] = { id, name, style, styleName: S.name, element, pack, personality, passive: S.passive, passiveName: S.passiveName, personal, t };
  });
  const PACKS = {
    P1: { id: "P1", name: "The Vanguard", flavour: "The lab's first successful trio; they act like a small family.", creatures: ["horncinder", "shellmund", "kitsuneva"] },
    P2: { id: "P2", name: "Blood Sprint", flavour: "Three escape artists who once nearly broke out of the lab together.", creatures: ["skarnwolf", "vespera", "glimmerkoi"] },
    P3: { id: "P3", name: "Slow Venom", flavour: "Used in the lab's long poison experiments; patient and a little sad.", creatures: ["mossmaw", "nightveil", "emberlamb"] },
    P4: { id: "P4", name: "Tempest", flavour: "Captured together in the same storm at sea.", creatures: ["skyrend", "volthorn", "brinegrave"] },
    P5: { id: "P5", name: "The Iron Ward", flavour: "The lab's \"failed\" trio, judged too dangerous and kept apart, so they barely trust anyone.", creatures: ["bulwyrm", "rotfang", "stillgaze"] },
    P6: { id: "P6", name: "Breakers", flavour: "Hunting partners and best friends who compete in everything.", creatures: ["crushjaw", "zephyrra", "duskcoil"] },
    P7: { id: "P7", name: "Deep Bastion", flavour: "The calm old guard of the lab.", creatures: ["atlacrab", "solenne", "kappadeep"] },
    P8: { id: "P8", name: "Wildfire", flavour: "The chaos trio that once burned down a wing of the lab.", creatures: ["smolderhead", "pyrewisp", "mawdeep"] },
    P9: { id: "P9", name: "Endless Dawn", flavour: "The lab's healing experiment: three who never wanted to hurt anyone.", creatures: ["auroracorn", "lumoth", "sunkenhorn"] },
  };
  const LAB_EXTRAS = ["bramblehoof", "quillshade", "mirequeen", "brassbone", "selkira", "hearthkin", "mothmara", "kirinth", "bakuroth"];


  // ---------- moves (data; the special effects live in FX below) ----------
  // target: enemy | allEnemies | ally | allyDown | self | team.  kind: phys | spell | best (higher of Attack/Power).
  // p = power per hit, hits, el = element, bk = break tags (medium/strong moves of that tag count toward the enemy's break), st = statuses [type,stacks,chance?],
  // db = debuffs [stat,val,turns], tide = Tide gained, grp = menu group, fx = custom effect, skill = skill-book move (no style bonuses)
  const MOVES = {};
  function mv(id, name, lvl, mp, target, o) { MOVES[id] = Object.assign({ id, name, lvl, mp, target, kind: "phys", grp: "damage" }, o); return MOVES[id]; }
  // --- Minotaur ---
  mv("gore", "Gore", 1, 0, "enemy", { basic: 1, grp: "basic", p: 1.0, el: "self", desc: "Horn strike. +1 MP." });
  mv("hoofStomp", "Hoof Stomp", 1, 1, "enemy", { p: 1.35, desc: "Quick, cheap hit. Best spammed on a broken enemy." });
  mv("labCharge", "Labyrinth Charge", 4, 2, "enemy", { p: 2.0, bk: ["impact"], desc: "Heavy charge. Counts toward impact breaks." });
  mv("bullRush", "Bull Rush", 6, 2, "enemy", { p: 1.4, fx: "bullRush", desc: "If the enemy has not acted yet this round, pushes its turn to the end of the round." });
  mv("roar", "Labyrinth Roar", 8, 1, "self", { grp: "support", fx: "roar", desc: "Draws the enemy's next single-target attacks onto itself." });
  mv("skullCrush", "Skull Crusher", 12, 3, "enemy", { p: 2.8, bk: ["impact"], db: [["def", -0.2, 3]], desc: "Massive blow, lowers enemy Defense. Counts toward impact breaks." });
  mv("bloodrage", "Bloodrage", 16, 2, "self", { grp: "support", fx: "bloodrage", desc: "+30% Attack, -30% Defense for 2 turns." });
  mv("reckless", "Reckless Blow", 20, 0, "enemy", { p: 3.0, hpCost: 0.15, desc: "Huge hit that costs 15% of its own max HP." });
  mv("stampede", "Stampede", 24, 3, "allEnemies", { p: 1.6, bk: ["impact"], desc: "Hits all enemies. Counts toward impact breaks." });
  mv("wrath", "Wrath", 28, 2, "self", { grp: "support", fx: "wrath", desc: "Stores the damage it takes and adds it to its next hit." });
  // --- Harpy ---
  mv("talonSwipe", "Talon Swipe", 1, 0, "enemy", { basic: 1, grp: "basic", p: 0.9, el: "self", desc: "Quick slash. +1 MP." });
  mv("featherVolley", "Feather Volley", 1, 1, "enemy", { p: 0.5, hits: 3, desc: "3 small hits, each can crit." });
  mv("rend", "Rend", 4, 2, "enemy", { p: 0.7, hits: 2, st: [["bleed", 1]], stEach: 1, desc: "2 hits that each add a bleed stack." });
  mv("shriek", "Shriek", 6, 2, "enemy", { kind: "spell", p: 0.5, db: [["spd", -0.25, 2]], bk: ["slow"], grp: "control", desc: "Lowers enemy Speed for 2 turns. Counts toward slow breaks." });
  mv("tailwind", "Tailwind", 8, 2, "ally", { grp: "support", fx: "tailwind", desc: "Raises an ally's Speed by 30% for 2 turns." });
  mv("cyclone", "Cyclone", 12, 3, "allEnemies", { p: 0.45, hits: 3, desc: "Several hits on all enemies." });
  mv("dive", "Dive", 16, 2, "self", { grp: "support", fx: "dive", desc: "Flies up: takes 30% less damage until its next turn, and its next strike hits 60% harder." });
  mv("hitAndRun", "Hit and Run", 20, 1, "enemy", { p: 1.0, fx: "hitAndRun", desc: "Hits, then takes 25% less damage until its next turn." });
  mv("snatch", "Snatch", 24, 1, "enemy", { fx: "snatch", grp: "control", desc: "Steals one enemy buff." });
  // --- Hydra ---
  mv("venomBite", "Venom Bite", 1, 0, "enemy", { basic: 1, grp: "basic", kind: "spell", p: 0.8, el: "self", st: [["poison", 1, 0.3]], desc: "Bite, 30% chance to poison. +1 MP." });
  mv("toxicSpit", "Toxic Spit", 1, 1, "enemy", { kind: "spell", p: 0.5, el: "poison", st: [["poison", 1]], desc: "Adds 1 poison stack." });
  mv("searingBreath", "Searing Breath", 4, 2, "enemy", { kind: "spell", p: 0.9, el: "fire", st: [["burn", 2]], desc: "Fire breath, adds 2 burn stacks." });
  mv("lacerate", "Lacerate", 6, 2, "enemy", { kind: "best", p: 0.7, st: [["bleed", 2]], desc: "Adds 2 bleed stacks." });
  mv("corrode", "Corrode", 8, 1, "enemy", { kind: "spell", p: 0.3, el: "poison", db: [["sres", -0.3, 3]], grp: "control", desc: "Lowers the target's status resistance, so statuses land more often." });
  mv("fester", "Fester", 12, 2, "enemy", { fx: "fester", desc: "Every damage-over-time status on the target ticks once right now. Stacks stay." });
  mv("plagueCloud", "Plague Cloud", 16, 3, "allEnemies", { kind: "spell", p: 0.4, el: "poison", st: [["poison", 2]], desc: "2 poison stacks on all enemies." });
  mv("rupture", "Rupture", 20, 3, "enemy", { fx: "rupture", desc: "Consumes all bleed for one big burst." });
  mv("regrow", "Regrow a Head", 24, 2, "self", { grp: "support", fx: "regrow", desc: "Heals itself over 3 turns." });
  // --- Colossus ---
  mv("stoneFist", "Stone Fist", 1, 0, "enemy", { basic: 1, grp: "basic", p: 0.8, el: "self", bonusDef: 0.3, desc: "Heavy punch that hits harder the higher its Defense. +1 MP." });
  mv("challenge", "Challenge", 1, 1, "self", { grp: "support", fx: "challenge", desc: "Single-target attacks must hit it for 2 turns." });
  mv("fortify", "Fortify", 4, 1, "self", { grp: "support", fx: "fortify", desc: "+40% Defense and Resistance for 2 turns." });
  mv("bulwark", "Bulwark", 6, 2, "ally", { grp: "support", fx: "bulwark", desc: "Takes the single-target hits meant for one ally until its next turn." });
  mv("counterSt", "Counter Stance", 8, 2, "self", { grp: "support", fx: "counterSt", desc: "Strikes back after every hit it takes until its next turn." });
  mv("shieldWall", "Shield Wall", 12, 3, "team", { grp: "support", fx: "shieldWall", desc: "The whole team takes 30% less damage until its next turn." });
  mv("crushWeight", "Crushing Weight", 16, 2, "enemy", { p: 1.0, bonusDef: 0.9, desc: "Damage based on its own Defense." });
  mv("earthshaker", "Earthshaker", 20, 3, "allEnemies", { p: 1.1, bk: ["impact"], fx: "earthshaker", desc: "Hits all enemies, small stun chance. Counts toward impact breaks." });
  mv("unbreakable", "Unbreakable", 24, 2, "self", { grp: "support", fx: "unbreakable", desc: "Removes its own debuffs, immune to stun for 2 turns." });
  // --- Phoenix ---
  mv("emberPeck", "Ember Peck", 1, 0, "enemy", { basic: 1, grp: "basic", kind: "spell", p: 0.85, el: "fire", desc: "Small fire hit. +1 MP." });
  mv("warmLight", "Warm Light", 1, 1, "ally", { grp: "support", fx: "warmLight", desc: "Heals one ally (more than a third of their HP)." });
  mv("rejuvenate", "Rejuvenate", 4, 2, "ally", { grp: "support", fx: "rejuvenate", desc: "Heals an ally a little every turn for 3 turns." });
  mv("cleansingFlame", "Cleansing Flame", 6, 1, "ally", { grp: "support", fx: "cleansingFlame", desc: "Removes 1 status from an ally." });
  mv("flameWard", "Flame Ward", 8, 2, "ally", { grp: "support", fx: "flameWard", desc: "Shield on an ally that absorbs damage for 2 turns." });
  mv("healWave", "Healing Wave", 12, 3, "team", { grp: "support", fx: "healWave", desc: "Heals the whole team." });
  mv("rebirth", "Rebirth", 16, 3, "allyDown", { grp: "support", fx: "rebirth", desc: "Revives a fallen ally at 30% HP." });
  mv("purge", "Purge", 20, 2, "team", { grp: "support", fx: "purge", desc: "Removes all statuses from the team." });
  mv("sunfire", "Sunfire", 24, 2, "enemy", { kind: "spell", p: 1.4, el: "light", fx: "sunfire", desc: "Light damage; part of it heals the team." });
  // --- Gorgon ---
  mv("serpentLash", "Serpent Lash", 1, 0, "enemy", { basic: 1, grp: "basic", kind: "spell", p: 0.8, el: "self", desc: "Whip-fast lash. +1 MP." });
  mv("hiss", "Hiss", 1, 1, "enemy", { kind: "spell", p: 0.3, db: [["atk", -0.25, 2]], grp: "control", desc: "Lowers enemy Attack for 2 turns." });
  mv("venomMark", "Venom Mark", 4, 1, "enemy", { kind: "spell", p: 0.3, el: "poison", db: [["res", -0.25, 3]], grp: "control", desc: "Lowers enemy Resistance for 3 turns." });
  mv("petrifyingGaze", "Petrifying Gaze", 6, 2, "enemy", { kind: "spell", p: 0.4, db: [["spd", -0.35, 2]], bk: ["slow"], grp: "control", desc: "Lowers enemy Speed for 2 turns. Counts toward slow breaks." });
  mv("crackArmour", "Crack Armour", 8, 2, "enemy", { kind: "spell", p: 0.5, db: [["def", -0.25, 3]], bk: ["shell"], grp: "control", desc: "Lowers enemy Defense for 3 turns. Counts toward shell breaks." });
  mv("shatterShield", "Shatter Shield", 12, 2, "enemy", { kind: "spell", p: 0.6, bk: ["shell"], fx: "shatterShield", grp: "control", desc: "Breaks shields and barriers. Counts toward shell breaks." });
  mv("coil", "Coil", 16, 2, "enemy", { fx: "coil", grp: "control", desc: "The enemy loses 1 action next turn (bosses resist repeats)." });
  mv("stoneGaze", "Stone Gaze", 20, 3, "enemy", { fx: "stoneGaze", grp: "control", desc: "Petrifies (stuns) for 1 turn. Luck against the enemy's Resistance." });
  mv("curseOfStone", "Curse of Stone", 24, 3, "enemy", { fx: "curseOfStone", grp: "control", desc: "Removes the enemy's buffs and blocks new ones for 2 turns." });
  // --- Dragon ---
  mv("claw", "Claw", 1, 0, "enemy", { basic: 1, grp: "basic", kind: "best", p: 0.8, el: "self", desc: "Rending claws. +1 MP." });
  mv("ember", "Ember", 1, 1, "enemy", { kind: "spell", p: 0.8, el: "fire", st: [["burn", 1]], desc: "Fire, adds burn." });
  mv("torrent", "Torrent", 4, 1, "enemy", { kind: "spell", p: 0.7, el: "water", st: [["wet", 1]], desc: "Water, makes the target wet." });
  mv("frostBreath", "Frost Breath", 6, 2, "enemy", { kind: "spell", p: 1.0, el: "ice", st: [["chill", 2]], desc: "Ice, adds 2 chill. Chill + wet = Freeze." });
  mv("thunderclap", "Thunderclap", 8, 2, "enemy", { kind: "spell", p: 1.1, el: "shock", st: [["shock", 1]], desc: "Lightning, adds shock. Double damage on a wet target." });
  mv("attune", "Attune", 12, 1, "self", { grp: "support", fx: "attune", desc: "Its next spell of the same element as its last one costs 1 less (minimum 1)." });
  mv("inferno", "Inferno", 16, 3, "allEnemies", { kind: "spell", p: 0.9, el: "fire", st: [["burn", 1]], desc: "Fire on all enemies." });
  mv("blizzard", "Blizzard", 20, 3, "allEnemies", { kind: "spell", p: 0.8, el: "ice", st: [["chill", 1]], desc: "Ice on all enemies, adds chill." });
  mv("detonate", "Detonate", 24, 3, "enemy", { fx: "detonate", desc: "Consumes all element marks (burn, wet, chill, shock) on the target for a burst." });
  // --- Leviathan ---
  mv("tailSlap", "Tail Slap", 1, 0, "enemy", { basic: 1, grp: "basic", kind: "best", p: 0.9, el: "self", tide: 1, desc: "Heavy slap. +1 MP, +1 Tide." });
  mv("undertow", "Undertow", 1, 1, "enemy", { kind: "spell", p: 0.6, el: "water", tide: 1, desc: "Small hit, +1 Tide." });
  mv("deepBreath", "Deep Breath", 3, 1, "self", { grp: "support", tide: 2, fx: "deepBreath", desc: "+2 Tide." });
  mv("maelstrom", "Maelstrom", 4, 3, "enemy", { kind: "best", p: 1.0, el: "water", bk: ["impact"], fx: "maelstrom", desc: "Damage grows with Tide, uses all Tide. Counts toward impact breaks." });
  mv("swell", "Swell", 6, 2, "self", { grp: "support", fx: "swell", desc: "+1 Tide at the start of each of its next 3 turns." });
  mv("braceDeep", "Brace the Deep", 8, 1, "self", { grp: "support", fx: "braceDeep", desc: "Takes 35% less damage until its next turn; +1 Tide when hit (max 2)." });
  mv("riptide", "Riptide", 12, 2, "enemy", { kind: "spell", p: 0.8, el: "water", tide: 1, fx: "riptide", desc: "Hit that pushes the enemy's turn back, +1 Tide." });
  mv("abyssalHunger", "Abyssal Hunger", 16, 2, "enemy", { kind: "spell", p: 0.6, el: "dark", fx: "abyssal", desc: "Drains MP from the enemy into itself." });
  mv("tidalWave", "Tidal Wave", 20, 3, "allEnemies", { kind: "best", p: 0.55, el: "water", fx: "tidalWave", desc: "Damage on all enemies grows with Tide, uses all Tide." });

  const STYLE_MOVES = {
    minotaur: ["gore", "hoofStomp", "labCharge", "bullRush", "roar", "skullCrush", "bloodrage", "reckless", "stampede", "wrath"],
    harpy: ["talonSwipe", "featherVolley", "rend", "shriek", "tailwind", "cyclone", "dive", "hitAndRun", "snatch"],
    hydra: ["venomBite", "toxicSpit", "searingBreath", "lacerate", "corrode", "fester", "plagueCloud", "rupture", "regrow"],
    colossus: ["stoneFist", "challenge", "fortify", "bulwark", "counterSt", "shieldWall", "crushWeight", "earthshaker", "unbreakable"],
    phoenix: ["emberPeck", "warmLight", "rejuvenate", "cleansingFlame", "flameWard", "healWave", "rebirth", "purge", "sunfire"],
    gorgon: ["serpentLash", "hiss", "venomMark", "petrifyingGaze", "crackArmour", "shatterShield", "coil", "stoneGaze", "curseOfStone"],
    dragon: ["claw", "ember", "torrent", "frostBreath", "thunderclap", "attune", "inferno", "blizzard", "detonate"],
    leviathan: ["tailSlap", "undertow", "deepBreath", "maelstrom", "swell", "braceDeep", "riptide", "abyssalHunger", "tidalWave"],
  };

  // --- personal moves (PERSONAL_MOVES.md): one per creature; "own" = the creature id ---
  function pm(id, own, name, lvl, mp, target, o) { const m = mv(id, name, lvl, mp, target, Object.assign({ grp: "personal", own, personal: 1 }, o)); return m; }
  pm("twoHeads", "horncinder", "Two Heads, One Charge", 12, 2, "enemy", { p: 2.0, bk: ["impact"], fx: "twoHeads", choices: [["bull", "Bull head (impact)"], ["goat", "Goat head (bleed)"]], desc: "Bull: a normal impact hit. Goat: 60% damage plus 1 bleed, no break." });
  pm("erodingRune", "shellmund", "Eroding Rune", 22, 2, "self", { grp: "personal", fx: "erodingRune", desc: "For 2 turns every hit it takes adds a rune (max 4); then the runes burst on all enemies." });
  pm("nineTails", "kitsuneva", "Nine Tails Blessing", 26, 3, "self", { fx: "nineTails", desc: "Nine small heals over 3 turns, each to whoever is lowest at that moment." });
  pm("grudgeBite", "skarnwolf", "Grudge Bite", 16, 2, "enemy", { p: 1.5, fx: "grudgeBite", desc: "Bites and marks. Each time the marked enemy hits it, it deals +10% to that enemy (max 4)." });
  pm("cuttingRemark", "vespera", "Cutting Remark", 14, 1, "enemy", { p: 0.8, hits: 2, fx: "cuttingRemark", desc: "Two hits; both crit if the target has any status or lowered stat." });
  pm("gateClimb", "glimmerkoi", "Gate Climb", 24, 2, "enemy", { kind: "spell", p: 0.9, fx: "gateClimb", desc: "Rotates wet, chill, shock. Twice in a row on one target = Freeze." });
  pm("smotheringMoss", "mossmaw", "Smothering Moss", 18, 2, "enemy", { kind: "spell", p: 0.3, el: "nature", fx: "smotheringMoss", desc: "For 3 turns its damage-over-time lasts 2 turns longer, and healing on it is halved." });
  pm("unheardApproach", "nightveil", "Unheard Approach", 24, 2, "self", { grp: "personal", fx: "unheardApproach", desc: "Its next status or control move ignores Resistance and a boss's growing resistance." });
  pm("goldenFleece", "emberlamb", "Golden Fleece Offering", 18, 0, "ally", { hpCostPct: 0.2, fx: "goldenFleece", desc: "Costs 20% of its max HP, no MP: heals an ally for 30% of their max HP." });
  pm("jokersGambit", "skyrend", "Joker's Gambit", 12, 1, "enemy", { p: 0.5, fx: "jokersGambit", desc: "Random: a 4-hit flurry, one heavy hit, or a hit that slows the target." });
  pm("staticGallop", "volthorn", "Static Gallop", 20, 1, "self", { fx: "staticGallop", desc: "For 3 turns each lightning spell adds +15% to the next one (max 4); other moves reset it." });
  pm("houndsAtTheGate", "brinegrave", "Hounds at the Gate", 20, 2, "ally", { fx: "hounds", desc: "Takes 40% of the damage dealt to one ally until its next turn; +1 Tide per hit absorbed (max 2)." });
  pm("serpentSpout", "bulwyrm", "Serpent Spout", 22, 2, "enemy", { kind: "spell", p: 0.7, el: "water", st: [["wet", 1]], fx: "serpentSpout", desc: "Water hit, target wet for 3 turns; also douses itself (removes its burn)." });
  pm("nidhoggGnaw", "rotfang", "Nidhogg Gnaw", 32, 3, "enemy", { p: 2.2, fx: "nidhoggGnaw", desc: "Heavy bite; each poison tick then shaves 1% off the target's max HP (cap 15%)." });
  pm("creepingStone", "stillgaze", "Creeping Stone", 22, 2, "enemy", { fx: "creepingStone", desc: "Petrifies over 3 turns: -10% damage and Speed per turn, then stunned for 1 turn." });
  pm("ammitsFeast", "crushjaw", "Ammit's Feast", 24, 2, "enemy", { p: 1.8, fx: "ammitsFeast", desc: "Crushing bite; heals 20% of the damage (40% on a broken target)." });
  pm("featherCushion", "zephyrra", "Feather Cushion", 18, 1, "enemy", { p: 0.5, fx: "featherCushion", desc: "Quick hit; the lowest-HP ally takes 25% less damage until its next turn." });
  pm("dirtyLaundry", "duskcoil", "Dirty Laundry", 20, 2, "enemy", { fx: "dirtyLaundry", grp: "personal", desc: "For 2 turns the target loses 8% Attack and Defense per status or debuff on it (max 40%)." });
  pm("plantThePillar", "atlacrab", "Plant the Pillar", 28, 2, "team", { fx: "plantThePillar", desc: "Team barrier worth 1.5x its Defense for 3 turns; it loses 1 action next turn." });
  pm("sunAscending", "solenne", "Sun Ascending", 32, 3, "team", { fx: "sunAscending", desc: "Team healed at the start of its next 3 turns: 5%, 10%, 15% of max HP." });
  pm("tipTheBowl", "kappadeep", "Tip the Bowl", 16, 2, "enemy", { kind: "spell", p: 0.4, el: "water", st: [["wet", 1]], tide: 2, fx: "tipTheBowl", desc: "Target wet, +2 Tide; takes 25% more damage for 2 turns." });
  pm("spontaneousCombustion", "smolderhead", "Spontaneous Combustion", 20, 1, "self", { fx: "ablaze", desc: "Sets itself ablaze for 3 turns: burn moves add +1 stack and its basic attack burns." });
  pm("misleadingLight", "pyrewisp", "Misleading Light", 22, 2, "self", { fx: "decoy", desc: "The next single-target attack must hit it for 50% less, and marks the attacker with its last spell's element." });
  pm("devouringWhirl", "mawdeep", "Devouring Whirl", 22, 2, "enemy", { kind: "best", p: 0.9, el: "water", fx: "devouringWhirl", desc: "Eats the target's statuses: +1 Tide and +10% damage each (max 3). Removes your team's damage-over-time too." });
  pm("silverLining", "auroracorn", "Silver Lining", 16, 2, "ally", { fx: "silverLining", desc: "Heals an ally; overheal becomes a shield. Removes 1 status." });
  pm("fallingDust", "lumoth", "Falling Dust", 22, 2, "team", { fx: "fallingDust", desc: "For 2 turns each hit on an ally restores 20% of that damage. Ends if Lumoth is hit." });
  pm("moonlitAntlers", "sunkenhorn", "Moonlit Antlers", 20, 1, "self", { fx: "moonlitAntlers", desc: "For 3 turns, +1 Tide whenever an ally is healed (max 2 per turn)." });
  pm("takeRoot", "bramblehoof", "Take Root", 20, 2, "self", { fx: "takeRoot", desc: "Rooted for 3 turns: heals 5% max HP per turn, takes 20% less damage, deals 25% less." });
  pm("sealedLetters", "quillshade", "Sealed Letters", 14, 1, "enemy", { p: 0.5, hits: 2, fx: "sealedLetters", desc: "Two hits that leave notes; the next 2 teammate hits open a note for +15% damage." });
  pm("keeningOmen", "mirequeen", "Keening Omen", 26, 2, "enemy", { fx: "keeningOmen", desc: "After 3 turns every poison, bleed and burn stack ticks 3 times at once." });
  pm("redHotBronze", "brassbone", "Red-Hot Bronze", 26, 2, "self", { fx: "redHotBronze", desc: "For 3 turns physical attackers get burned; takes 25% more water damage." });
  pm("lamentOfThePod", "selkira", "Lament of the Pod", 24, 2, "ally", { fx: "lament", desc: "Heals an ally for exactly the damage of the last hit they took (cap 35%)." });
  pm("lightTheHearth", "hearthkin", "Light the Hearth", 28, 3, "team", { fx: "lightTheHearth", desc: "For the rest of the fight every ally recovers 3% max HP at the start of each turn." });
  pm("nightTerror", "mothmara", "Night Terror", 26, 2, "enemy", { fx: "nightTerror", grp: "personal", desc: "For 3 turns the target's strong moves deal 20% less and hurt it." });
  pm("moodScales", "kirinth", "Mood Scales", 14, 1, "self", { fx: "moodScales", choices: [["fire", "Fire"], ["water", "Water"], ["ice", "Ice"], ["shock", "Shock"]], desc: "Pick an element: 40% less damage from it for 2 turns; its next spell of that element costs 1 less." });
  pm("dreamEater", "bakuroth", "Dream Eater", 24, 2, "ally", { fx: "dreamEater", desc: "Eats the statuses off an ally: +1 Tide each (max 3)." });

  // --- skill-book moves (shared, one equipped off-style slot; unlocked by gathering 10 of a material) ---
  function sk(id, name, mp, target, o) { return mv(id, name, 0, mp, target, Object.assign({ grp: "skill", skill: 1 }, o)); }
  sk("ramStrike", "Ram Strike", 2, "enemy", { kind: "best", p: 1.5, bk: ["impact"], desc: "Impact blow. Counts toward impact breaks." });
  sk("dampenWing", "Dampen Wing", 2, "enemy", { kind: "spell", p: 0.4, db: [["spd", -0.3, 2]], bk: ["slow"], desc: "Slows the enemy for 2 turns. Counts toward slow breaks." });
  sk("coldSnap", "Cold Snap", 2, "enemy", { kind: "spell", p: 0.9, el: "ice", st: [["chill", 2]], desc: "Ice, adds chill." });
  sk("douse", "Douse", 2, "enemy", { kind: "spell", p: 0.7, el: "water", st: [["wet", 1]], desc: "Water, makes the target wet." });
  sk("sporeCloud", "Spore Cloud", 3, "allEnemies", { kind: "spell", p: 0.35, el: "poison", st: [["poison", 2]], desc: "Poison on all enemies." });
  sk("kindle", "Kindle", 2, "enemy", { kind: "spell", p: 0.9, el: "fire", st: [["burn", 1]], desc: "Fire, adds burn." });
  sk("soak", "Soak", 1, "enemy", { kind: "spell", p: 0.5, el: "water", st: [["wet", 1]], desc: "Cheap water, makes the target wet." });
  sk("revive", "Revive", 3, "allyDown", { grp: "skill", fx: "revive", desc: "Revives a fallen ally at 20% HP." });

  // gathering unlocks (10 pieces each, WORLD_MAP.md section 3)
  const MATERIALS = {
    duneclawShard: { name: "Duneclaw Shard", desc: "A hard scorpion-shell splinter. Unlocks Ram Strike." },
    galeDown: { name: "Gale Down", desc: "Jungle harpy feather. Unlocks Dampen Wing." },
    rimecrystal: { name: "Rimecrystal", desc: "Cold vault crystal. Unlocks Cold Snap." },
    steamstone: { name: "Steamstone", desc: "Hot-spring stone. Unlocks Douse." },
    gloomcapSpores: { name: "Gloomcap Spores", desc: "Cave fungus spores. Unlocks Spore Cloud." },
    cinderglassEmber: { name: "Cinderglass Ember", desc: "A glowing ember of glass. Unlocks Kindle." },
    riverPearl: { name: "River Pearl", desc: "A pearl from a river snapper. Unlocks Soak." },
    cinderPlume: { name: "Cinder Plume", desc: "A warm, glowing feather. Unlocks Revive." },
    pipeSlime: { name: "Pipe Slime", desc: "Sticky goo from an old builder pipe." }, inkVial: { name: "Ink Vial", desc: "Black lab ink." },
    ratWhisker: { name: "Rat Whisker", desc: "A long grey whisker." }, wispSpark: { name: "Wisp Spark", desc: "A dry crackling spark in glass." },
    gelSample: { name: "Gel Sample", desc: "A wobbling specimen." }, jackalPelt: { name: "Jackal Pelt", desc: "Sandy fur with a scarab-shell scale." },
    adderFang: { name: "Adder Fang", desc: "A clear, hollow fang." }, impWing: { name: "Imp Wing Scrap", desc: "A leathery wing scrap." },
    mirageDust: { name: "Mirage Dust", desc: "Heat haze caught in a pinch of sand." }, wraithWater: { name: "Wraith Water", desc: "A vial of cold, whispering water." },
    boneChip: { name: "Bone Chip", desc: "A pale, hard bone chip." }, eelTooth: { name: "Eel Tooth", desc: "A very human tooth." }, mossCore: { name: "Moss Core", desc: "A damp green core." },
    scarabShell: { name: "Scarab Shell", desc: "A golden shell fragment." }, saltCrust: { name: "Salt Crust", desc: "Armour made of salt." }, sphinxWhisker: { name: "Sphinx Whisker", desc: "Stiff and a little smug." },
    gargoyleChip: { name: "Gargoyle Chip", desc: "Grey carved stone." }, slag: { name: "Cooled Slag", desc: "Burns clean." }, basaltShard: { name: "Basalt Shard", desc: "Black and sharp." },
    mirrorScale: { name: "Mirror Scale", desc: "It throws light back." }, batEar: { name: "Bat Ear", desc: "Thin as paper." }, calfHorn: { name: "Calf Horn", desc: "A small chalk-white horn." },
    soldierToken: { name: "Soldier Token", desc: "An imperial legion token." },
  };
  const SKILLBOOK = {
    ramStrike: { material: "duneclawShard", count: 10, titan: "T1 Dune Bearer", note: "Impact move for the Dune Bearer's sky-stone." },
    dampenWing: { material: "galeDown", count: 10, titan: "T2 Plumed Coil", note: "Slow." },
    coldSnap: { material: "rimecrystal", count: 10, titan: "T3 Mother of the Maelstrom", note: "Chill." },
    douse: { material: "steamstone", count: 10, titan: "T4 Ember Wolf", note: "Wet." },
    sporeCloud: { material: "gloomcapSpores", count: 10, titan: "T5 Gate Hound", note: "Poison on all." },
    kindle: { material: "cinderglassEmber", count: 10, titan: "T6 Root Gnawer", note: "Fire." },
    soak: { material: "riverPearl", count: 10, titan: "T7 Storm Ram", note: "Cheap wet." },
    revive: { material: "cinderPlume", count: 10, titan: null, note: "Revive a fallen ally." },
  };
  Object.keys(SKILLBOOK).forEach(k => (SKILLBOOK[k].move = k));

  const ITEMS = {
    potion: { name: "Potion", target: "ally", desc: "Heals 25% of max HP." },
    antidote: { name: "Antidote", target: "ally", desc: "Removes burn, bleed, poison, shock and chill." },
    ashenEmber: { name: "Ashen Ember", target: "allyDown", desc: "Revives a fallen ally at 30% HP." },
  };


  // ---------- units ----------
  function makeCreature(id, level, stats) {
    const c = CREATURES[id];
    const s = stats || spread(STYLES[c.style].w, BASE_TOTAL + POINTS_PER_LEVEL * (level - 1), c.t);
    const u = { id, side: "p", name: c.name, style: c.style, element: c.element, passive: c.passive, level, stats: s, xp: 0, maxMp: c.style === "leviathan" ? 15 : 10, mp: 0, buffs: [], st: {}, alive: true, offMove: null, tide: 0, points: 0 };
    u.maxHp = maxHpOf(s, level); u.hp = u.maxHp;
    return u;
  }
  function movesOf(u) {
    const list = STYLE_MOVES[u.style].filter(m => MOVES[m].lvl <= u.level);
    const c = CREATURES[u.id];
    if (c && c.personal && MOVES[c.personal].lvl <= u.level) list.push(c.personal);
    if (u.offMove && MOVES[u.offMove] && !list.includes(u.offMove)) list.push(u.offMove);
    return list;
  }
  const isOffStyle = (u, id) => !!(MOVES[id] && MOVES[id].skill);
  function setOffMove(u, id) { if (id && !(MOVES[id] && MOVES[id].skill)) return false; u.offMove = id || null; return true; }

  // ---------- buffs, statuses ----------
  // gear set-bonus tags (u.fx[tag] = 2 full set, 1 two pieces; set by the story layer before a fight). Stat-type bonuses (hp, def, res, startMp, xp) are applied by the story layer, not here.
  const fxl = (u, k) => (u && u.fx && u.fx[k]) || 0;
  const fxv = (u, k, full, half) => { const l = fxl(u, k); return l >= 2 ? full : l === 1 ? half : 0; };
  const fxs = u => u.fxs || (u.fxs = {});
  const comboMult = u => (u && u.passive === "comboMaster" ? 1.3 + fxv(u, "masterMixing", 0.2, 0.1) : 1);
  function directHit(ctx, src, tgt, v, note) {
    if (!tgt.alive || v < 1) return; v = Math.round(v); tgt.hp = Math.max(0, tgt.hp - v);
    ctx.ev.push({ t: "dmg", src, tgt, v, crit: false, absorbed: 0, el: null, kind: "phys", note: note || "" });
    if (tgt.hp <= 0) die(ctx, tgt);
  }
  const buffVal = (u, type) => u.buffs.filter(b => b.type === type).reduce((a, b) => a + b.val, 0);
  const hasBuff = (u, type) => u.buffs.some(b => b.type === type);
  const getBuff = (u, type) => u.buffs.find(b => b.type === type);
  function addBuff(u, type, val, turns, o) {
    if (val > 0 && u.noBuff > 0 && !(o && o.force)) return false;
    u.buffs = u.buffs.filter(b => !(b.type === type && Math.sign(b.val) === Math.sign(val)));
    u.buffs.push(Object.assign({ type, val, turns }, o || {})); return true;
  }
  // a buff that lasts until the owner's next turn starts
  const hold = (owner, tgt, type, val, o) => addBuff(tgt, type, val, 99, Object.assign({ owner, until: "turn" }, o || {}));
  const STATUS = {
    burn: { name: "Burn", dot: 1, max: 8, t: 3, stat: "pow", el: "fire" }, bleed: { name: "Bleed", dot: 1, max: 8, t: 3, stat: "atk" }, poison: { name: "Poison", dot: 1, max: 8, t: 4, stat: "pow", el: "poison" },
    shock: { name: "Shock", dot: 0.6, max: 3, t: 2, stat: "pow", el: "shock" }, chill: { name: "Chill", max: 6, t: 3 }, wet: { name: "Wet", max: 1, t: 3 }, slow: { name: "Slow", max: 1, t: 2 },
    stun: { name: "Stun", max: 1, t: 1, ctrl: 1 }, freeze: { name: "Freeze", max: 1, t: 1, ctrl: 1 }, steam: { name: "Steam", max: 1, t: 2 }, petrify: { name: "Petrify", max: 3, t: 3 },
  };
  const DOTS = ["burn", "bleed", "poison", "shock"];
  function eff(u, k) {
    let v = u.stats[k] * (1 + clamp(buffVal(u, k), -0.8, 3));
    if (k === "spd") { if (u.st.slow) v *= 0.7; if (u.st.chill) v *= 1 - 0.06 * u.st.chill.n; }
    return Math.max(1, v);
  }
  const debuffCount = u => u.buffs.filter(b => b.val < 0 && !["sres"].includes(b.type)).length + Object.keys(u.st).filter(k => !["wet"].includes(k)).length;
  const say = (ctx, text) => ctx.ev.push({ t: "say", text });
  function elemMult(tgt, el) {
    if (!el) return 1;
    let r = (tgt.rs && tgt.rs[el]) || 0;
    if (tgt.side === "p" && tgt.element === el) r += 0.25;
    r += buffVal(tgt, "ward_" + el);
    if (el === "water" && hasBuff(tgt, "redHot")) r -= 0.25;
    return clamp(1 - r, 0.1, 2.5);
  }
  const dotUnit = (tgt, type) => {
    const s = tgt.st[type], S = STATUS[type]; let mh = 1;
    if (Object.values(tgt.st).some(x => x.mh)) mh += 0.1 * DOTS.filter(d => tgt.st[d]).length;
    return Math.max(1, Math.round(s.n * (1 + 0.18 * s.pw) * S.dot * mh));
  };
  function ctrlRoll(ctx, src, tgt, base) {
    if (src && src.unheard) { src.unheard = false; return true; }
    let p = base * (1 + (src ? src.stats.lck * 0.004 : 0));
    const R = eff(tgt, "res"); p *= 1 - clamp(0.5 * R / (R + (src ? eff(src, "pow") : 20) + 20), 0, 0.5);
    if (tgt.boss) p *= 0.6 * Math.pow(0.5, tgt.ctrlCount || 0);
    if (hasBuff(tgt, "stunImmune")) p = 0;
    if (chance(p)) { if (tgt.boss) tgt.ctrlCount = (tgt.ctrlCount || 0) + 1; return true; }
    ctx.ev.push({ t: "resist", tgt }); return false;
  }
  function removeStatus(tgt, type) { delete tgt.st[type]; }
  function reaction(ctx, tgt, name, text) { ctx.ev.push({ t: "reaction", tgt, name, text }); }
  function addStatus(ctx, src, tgt, type, n = 1, o = {}) {
    if (!tgt.alive) return false;
    const S = STATUS[type], ev = ctx.ev;
    if (tgt.immune && tgt.immune.includes(type)) { ev.push({ t: "immune", tgt, type }); return false; }
    if (o.chance !== undefined && !o.sure) {
      let p = o.chance * (1 + (src ? src.stats.lck * 0.004 : 0)); const R = eff(tgt, "res");
      const rf = clamp(0.5 * R / (R + (src ? eff(src, "pow") + eff(src, "atk") : 30) + 20) + (tgt.sr || 0) + buffVal(tgt, "sres"), 0, 0.8);
      if (!chance(p * (1 - rf))) return false;
    }
    if (S.ctrl && !o.sure && tgt.boss && !ctrlRoll(ctx, src, tgt, 1)) return false;
    let gearDur = 0;   // gear: Iron Nose Ring, Stoneweather Cloak
    if (src && src.side !== tgt.side && type !== "steam" && tgt.fx) {
      if ((type === "stun" || type === "slow") && chance(fxv(tgt, "ironNose", 0.25, 0.12))) { ev.push({ t: "resist", tgt }); return false; }
      if (chance(fxv(tgt, "hardToRattle", 0.3, 0.15))) { ev.push({ t: "resist", tgt }); return false; }
      const f = fxs(tgt);
      if (fxl(tgt, "thickSkin") && !f.thickDone) { f.thickDone = 1; if (fxl(tgt, "thickSkin") >= 2) { ev.push({ t: "resist", tgt }); say(ctx, tgt.name + " ignores it."); return false; } gearDur = 1; }
      if (fxl(tgt, "shakeOff") && (fxl(tgt, "shakeOff") >= 2 || type === "burn" || type === "poison")) gearDur = gearDur || -1;
    }
    const combo = src && src.passive === "comboMaster" && !o.off ? comboMult(src) : 1;
    const reactBurst = (el, name, text) => { reaction(ctx, tgt, name, text); if (src && src.alive) damage(ctx, src, tgt, 0.6, "spell", { el, noReact: 1, mult: combo, off: o.off }); };
    // element reactions (Dragon section of the notes)
    if (type === "wet" && tgt.st.burn) { removeStatus(tgt, "burn"); if (tgt.alive) { addStatus(ctx, src, tgt, "steam", 1, { sure: 1 }); reactBurst("water", "Steam", tgt.name + " is wreathed in steam! Its Attack drops."); } return true; }
    if (type === "burn" && tgt.st.wet) { removeStatus(tgt, "wet"); addStatus(ctx, src, tgt, "steam", 1, { sure: 1 }); reactBurst("fire", "Steam", tgt.name + " is wreathed in steam! Its Attack drops."); return true; }
    if ((type === "chill" && tgt.st.wet) || (type === "wet" && tgt.st.chill)) {
      if (!tgt.boss || ctrlRoll(ctx, src, tgt, 0.85)) { removeStatus(tgt, "wet"); removeStatus(tgt, "chill"); addStatus(ctx, src, tgt, "freeze", 1, { sure: 1 }); reactBurst("ice", "Freeze", tgt.name + " freezes solid!"); return true; }
    }
    if (type === "steam") addBuff(tgt, "atk", -0.25, 2);
    let dur = S.t; if (tgt.moss && S.dot) dur += 2;
    if (gearDur === 1) dur = 1; else if (gearDur === -1) dur = Math.max(1, dur - 1);
    if (type === "burn" && src && fxl(src, "slowBurn")) { const f = fxs(src); f.burnN = (f.burnN || 0) + 1; if (fxl(src, "slowBurn") >= 2 || f.burnN % 2 === 0) dur += 1; }
    let add = n; if (src && src.ablaze && type === "burn" && !o.off) add += 1;
    const pw = src ? eff(src, S.stat || "pow") : 10, ex = tgt.st[type];
    if (ex) { ex.n = Math.min(S.max, ex.n + add); ex.t = Math.max(ex.t, dur); ex.pw = Math.max(ex.pw, pw); if (src && src.passive === "manyHeads" && !o.off) ex.mh = true; }
    else tgt.st[type] = { n: Math.min(S.max, add), t: dur, pw, mh: !!(src && src.passive === "manyHeads" && !o.off) };
    ev.push({ t: "status", tgt, type, n: tgt.st[type].n });
    return true;
  }
  const DOT_CLEANSE = ["burn", "bleed", "poison", "shock", "chill", "slow", "stun", "freeze", "steam", "petrify"];
  function cleanse(ctx, tgt, count) {
    let done = 0;
    const list = DOT_CLEANSE.filter(k => tgt.st[k]).sort((a, b) => (tgt.st[b].n || 1) - (tgt.st[a].n || 1));
    for (const k of list) { if (count && done >= count) break; delete tgt.st[k]; done++; ctx.ev.push({ t: "cleanse", tgt, type: k }); }
    if (!count || done < count) { const bad = tgt.buffs.filter(b => b.val < 0); if (bad.length && (!count || done < count)) { tgt.buffs = tgt.buffs.filter(b => b.val >= 0); done++; } }
    tgt.moss = 0; if (tgt.omen) tgt.omen = null;
    return done;
  }
  function debuff(ctx, src, t, stat, val, turns) {
    if (!t.alive) return;
    const v = val * (t.dbm === undefined ? 1 : t.dbm);
    addBuff(t, stat, v, turns, { force: 1 });
    ctx.ev.push({ t: "debuff", tgt: t, stat, val: v, turns });
  }

  // ---------- damage and healing ----------
  function countBreak(ctx, tgt, bk) {
    if (!tgt.breakType || tgt.broken || !tgt.alive || !bk || !bk.includes(tgt.breakType)) return;
    const need = tgt.breakNeed || 1;
    tgt.breakPts = ctx.round - tgt.breakHitRound <= 1 ? tgt.breakPts + 1 : 1; tgt.breakHitRound = ctx.round;
    ctx.ev.push({ t: "breakPt", tgt, pts: tgt.breakPts, need });
    if (tgt.breakPts >= need) { tgt.broken = 2; tgt.breakPts = 0; ctx.ev.push({ t: "broken", tgt }); }
  }
  function damage(ctx, src, tgt, base, kind, tg = {}) {
    if (!tgt.alive) return 0;
    const ev = ctx.ev;
    const el = tg.el === "self" ? (src.element || null) : (tg.el || null);
    if (kind === "best") kind = eff(src, "atk") >= eff(src, "pow") ? "phys" : "spell";
    if (tgt.reflect && kind === "spell" && el && tgt.reflect.includes(el) && !tg.refl && src.side !== tgt.side && src.alive) {
      ev.push({ t: "reflect", src, tgt }); ev.push({ t: "say", text: tgt.name + " reflects the spell!" });
      return damage(ctx, tgt, src, base * 0.6, kind, { el, refl: 1, off: 1 });
    }
    const A = eff(src, kind === "phys" ? "atk" : "pow"), D = eff(tgt, kind === "phys" ? "def" : "res");
    let v = base * A * (A / (A + D)) * (0.9 + 0.2 * rnd());
    if (tg.mult) v *= tg.mult;
    const notes = [];
    const crit = tg.crit !== undefined ? tg.crit : chance(clamp(0.05 + src.stats.lck * 0.004 - tgt.stats.lck * 0.002, 0.02, 0.6));
    if (crit) v *= 1.5;
    const em = elemMult(tgt, el);
    if (em !== 1) { v *= em; notes.push(em > 1.2 ? "WEAK" : em < 0.8 ? "RESIST" : ""); }
    if (kind === "phys" && tgt.pr) v *= 1 - tgt.pr;
    if (tgt.swarm) v *= tg.aoe ? 1.6 : 0.75;
    // gear set bonuses
    if (src.fx) {
      if (fxl(src, "fullStrength") && src.hp >= src.maxHp) v *= 1 + fxv(src, "fullStrength", 0.2, 0.1);
      if (el === "fire" && fxl(src, "emberHeart")) v *= 1 + fxv(src, "emberHeart", 0.2, 0.1);
      if (tg.cheap && fxl(src, "cheapCruelty")) v *= 1 + fxv(src, "cheapCruelty", 0.25, 0.12);
      if (src.opening) v *= 1 + src.opening;
      if (src.spellBonus) v *= 1 + src.spellBonus;
    }
    if (tgt.fx) {
      if (el && fxl(tgt, "warded")) v *= 1 - fxv(tgt, "warded", 0.15, 0.07);
      if (el === "fire" && fxl(tgt, "ashenSkin")) v *= 1 - fxv(tgt, "ashenSkin", 0.2, 0.1);
      if (fxl(tgt, "shieldBrother") && ctx.lastRedirect === tgt && src.side !== tgt.side) v *= 1 - fxv(tgt, "shieldBrother", 0.25, 0.12);
    }
    const passives = !tg.off;
    if (tgt.broken) v *= 1.5 + (src.passive === "rampage" && passives ? 0.25 : 0);
    else if (tgt.frontShield && !(tgt.shieldDown > 0)) v *= 1 - tgt.frontShield;
    if (tgt.coverBy && ctx.foes.some(f => f.alive && f !== tgt && f.id === tgt.coverBy)) { v *= 0.6; notes.push("COVERED"); }
    v *= 1 - Math.min(0.6, Math.max(0, buffVal(tgt, "dr")));
    v *= 1 + buffVal(tgt, "vuln");
    if (tgt.side === "e" && passives !== false && ctx.party.some(p => p.alive && p.passive === "exposed")) v *= 1 + Math.min(0.25, 0.05 * debuffCount(tgt));
    if (src.grudge && src.grudge.tgt === tgt) v *= 1 + 0.1 * src.grudge.n;
    if (tgt.notes > 0 && src.side === "p" && src !== tgt.notesBy) { v *= 1.15; tgt.notes--; }
    if (tgt.terrorOn && tg.strongHit) v *= 0.8;
    // reactions with the element/physical hit
    if (!tg.noReact) {
      const combo = src.passive === "comboMaster" && passives ? comboMult(src) : 1;
      if (el === "shock" && tgt.st.wet) { v *= 2 * combo; removeStatus(tgt, "wet"); reaction(ctx, tgt, "Conductive", "Wet + shock: double damage!"); if (chance(0.3)) addStatus(ctx, src, tgt, "stun", 1, { chance: 1, off: !passives }) ; }
      else if (kind === "phys" && tg.strong && (tgt.st.chill || tgt.st.freeze)) { v *= 1.6 * combo; removeStatus(tgt, "chill"); removeStatus(tgt, "freeze"); reaction(ctx, tgt, "Shatter", "Chill + a heavy blow: Shatter!"); }
    }
    if (tg.bonus) v += tg.bonus;
    v = Math.max(1, Math.round(v));
    // hounds at the gate: a share goes to the protector
    const hd = getBuff(tgt, "hounds");
    if (hd && hd.owner && hd.owner.alive && hd.owner !== tgt) {
      const sh = Math.round(v * 0.4); v -= sh; hd.owner.hp = Math.max(0, hd.owner.hp - sh);
      ev.push({ t: "dmg", src, tgt: hd.owner, v: sh, crit: false, absorbed: 0, el, note: "HOUNDS" });
      if ((hd.owner.houndTide || 0) < 2) { hd.owner.houndTide = (hd.owner.houndTide || 0) + 1; gainTide(ctx, hd.owner, 1); }
      if (hd.owner.hp <= 0) die(ctx, hd.owner);
    }
    const dc = getBuff(tgt, "decoy");
    if (dc && src.side !== tgt.side) { v = Math.max(1, Math.round(v * 0.5)); tgt.buffs = tgt.buffs.filter(b => b !== dc); const pe = tgt.lastEl; const map = { fire: "burn", water: "wet", ice: "chill", shock: "shock" }; if (pe && map[pe] && src.alive) addStatus(ctx, tgt, src, map[pe], 1, { sure: 1 }); }
    let absorbed = 0;
    const sh = getBuff(tgt, "shield");
    if (sh) { absorbed = Math.min(sh.val, v); sh.val -= absorbed; v -= absorbed; if (sh.val <= 0) tgt.buffs = tgt.buffs.filter(b => b !== sh); }
    tgt.hp = Math.max(0, tgt.hp - v);
    ev.push({ t: "dmg", src, tgt, v, crit, absorbed, el, kind, note: notes.filter(Boolean).join(" ") });
    tgt.lastHit = v + absorbed;
    if (kind === "phys" && fxl(tgt, "hornCounter") && src.side !== tgt.side && src.alive && !tg.refl && tgt.hp > 0) directHit(ctx, tgt, src, v * fxv(tgt, "hornCounter", 0.15, 0.08), "HORN COUNTER");
    // on-hit effects
    const ws = getBuff(tgt, "wrathStore"); if (ws) ws.val += v;
    if (tgt.runes && tgt.runes.n < 4) tgt.runes.n++;
    if (tgt.passive === "stoneskin" && tgt.alive && tgt.stoneSkin < 2) { tgt.mp = Math.min(tgt.maxMp, tgt.mp + 1); tgt.stoneSkin++; }
    if (hasBuff(tgt, "braceDeep") && (tgt.braceTide || 0) < 2) { tgt.braceTide = (tgt.braceTide || 0) + 1; gainTide(ctx, tgt, 1); }
    if (tgt.grudge && tgt.grudge.tgt === src && tgt.grudge.n < 4) tgt.grudge.n++;
    if (hasBuff(tgt, "dust") && tgt.alive) { const d = getBuff(tgt, "dust"); const r = Math.min(tgt.maxHp - tgt.hp, Math.round(v * 0.2)); if (r > 0) { tgt.hp += r; ev.push({ t: "heal", tgt, v: r }); } if (d.owner === tgt) { [...ctx.party].forEach(a => (a.buffs = a.buffs.filter(b => b.type !== "dust"))); } }
    if (hasBuff(tgt, "redHot") && kind === "phys" && src.side !== tgt.side && src.alive) addStatus(ctx, tgt, src, "burn", 1, { sure: 1 });
    if (src.passive === "relentless" && passives && src.side === "p" && !tg.refl) { src.hitsTurn = (src.hitsTurn || 0) + 1; if (src.hitsTurn % 3 === 0) { src.mp = Math.min(src.maxMp, src.mp + 1); } }
    if (tg.bk && tg.strong) {
      countBreak(ctx, tgt, tg.bk);
      if (fxl(src, "deadEnd") && tg.bk.includes("impact") && tgt.alive && !tgt.broken) {   // Dead End: impact moves count as 2 hits
        const f = fxs(src); if (fxl(src, "deadEnd") >= 2 || !f.deadTurn) { f.deadTurn = 1; countBreak(ctx, tgt, tg.bk); }
      }
    }
    if (tgt.hp <= 0) die(ctx, tgt);
    else {
      if (hasBuff(tgt, "counter") && src.alive && src.side !== tgt.side && !tg.counterHit) { ev.push({ t: "say", text: tgt.name + " counters!" }); damage(ctx, tgt, src, 0.6, "phys", { counterHit: 1, noReact: 1, off: 1 }); }
    }
    return v;
  }
  function die(ctx, u) {
    if (u.phases && u.phases.length) {
      const p = u.phases.shift();
      Object.assign(u, p); u.maxHp = maxHpOf(u.stats, u.level, u.hpMult); u.hp = u.maxHp;
      u.broken = 0; u.breakPts = 0; u.buffs = []; u.st = {}; u.charging = null; u.phaseNo = (u.phaseNo || 1) + 1; u.ctrlCount = 0; u.shieldDown = 0;
      ctx.telegraph = null; ctx.ev.push({ t: "phase", tgt: u, text: p.text });
      return;
    }
    u.hp = 0; u.alive = false; u.buffs = []; u.st = {}; u.tide = 0; u.charging = null; u.runes = null;
    ctx.ev.push({ t: "ko", tgt: u });
    if (u.passive === "ashes" && !u.ashesUsed) { u.ashesUsed = true; u.rise = true; }
    if (u.side === "p") ctx.party.forEach(a => { if (a.sun && a.sun.owner === u) a.sun = null; });
    ctx.telegraph = ctx.foes.find(f => f.alive && f.charging) || null;
  }
  function gainTide(ctx, u, n) {
    if (!u || !u.alive || u.style !== "leviathan" || !n) return;
    const before = u.tide; u.tide = Math.min(5, u.tide + n);
    if (u.tide !== before) ctx.ev.push({ t: "tide", tgt: u, v: u.tide, n: u.tide - before });
  }
  function heal(ctx, src, tgt, base, o = {}) {
    if (!tgt.alive) return 0;
    let v = Math.round(base * eff(src, "pow") * 0.7 * (0.9 + 0.2 * rnd()));
    if (tgt.moss) v = Math.round(v / 2);
    return healFlat(ctx, tgt, v, o);
  }
  function healFlat(ctx, tgt, v, o = {}) {
    if (!tgt.alive) return 0;
    const real = Math.max(0, Math.min(tgt.maxHp - tgt.hp, v));
    tgt.hp += real; ctx.lastOver = v - real;
    ctx.ev.push({ t: "heal", tgt, v: real });
    if (real > 0 && !o.silent) ctx.team(tgt).forEach(a => { if (a.alive && a !== undefined && hasBuff(a, "antlers") && (a.antTide || 0) < 2) { a.antTide = (a.antTide || 0) + 1; gainTide(ctx, a, 1); } });
    return real;
  }
  function revive(ctx, tgt, pct) {
    tgt.alive = true; tgt.rise = false; tgt.hp = Math.max(1, Math.round(tgt.maxHp * pct)); tgt.st = {}; tgt.buffs = [];
    ctx.ev.push({ t: "revive", tgt });
  }
  // push an enemy's turn to the end of this round (only if it has not acted yet)
  function delayTurn(ctx, t, text) {
    if (!ctx.order || t.actedRound === ctx.round) return false;
    const i = ctx.order.indexOf(t); if (i < 0) return false;
    ctx.order.splice(i, 1); ctx.order.push(t); if (text) say(ctx, text); return true;
  }

  // ---------- costs and checks ----------
  function mpCost(u, id) {
    const m = MOVES[id]; let c = m.mp; if (!c) return 0;
    const el = m.el === "self" ? u.element : m.el;
    if (u.attune && el && m.kind !== "phys" && el === u.attune) c -= 1;
    if (u.moodEl && el === u.moodEl && m.kind !== "phys") c -= 1;
    if (fxl(u, "thrifty") && !u.spellsTurn && !m.basic && (fxl(u, "thrifty") >= 2 || (u.fxTurns || 0) % 2 === 1)) c -= 1;
    return Math.max(1, c);
  }
  function canUse(ctx, u, id) {
    const m = MOVES[id]; if (!m || !u.alive) return false;
    if (u.mp < mpCost(u, id)) return false;
    if (m.hpCost && u.hp <= Math.round(u.maxHp * m.hpCost) + 1) return false;
    if (m.hpCostPct && u.hp <= Math.round(u.maxHp * m.hpCostPct) + 1) return false;
    if (m.target === "allyDown" && !ctx.party.some(p => !p.alive && !p.rise)) return false;
    if ((m.target === "enemy" || m.target === "allEnemies") && !ctx.foes.some(f => f.alive)) return false;
    return true;
  }
  function targetsOf(ctx, u, m, target) {
    const mine = ctx.team(u), theirs = ctx.opp(u);
    switch (m.target) {
      case "allEnemies": return theirs.filter(f => f.alive);
      case "team": return mine.filter(a => a.alive);
      case "self": return [u];
      default: return [target && (target.alive || m.target === "allyDown") ? target : (m.target === "enemy" ? theirs.find(f => f.alive) : u)];
    }
  }


  // ---------- doing a move ----------
  function genericAttack(ctx, u, m, tgts, o = {}) {
    const el = m.el === "self" ? (u.element || null) : (m.el || null);
    const strong = m.mp >= 2 || !!o.strong;
    const bk = (m.bk || []).slice(); if (strong && el && m.el !== "self") bk.push(el);
    const off = !!m.skill, aoe = m.target === "allEnemies";
    let total = 0;
    tgts.forEach(t => {
      if (!t.alive) return;
      for (let h = 0, n = m.hits || 1; h < n && t.alive; h++) {
        let base = (o.p !== undefined ? o.p : m.p) * (o.pmul || 1);
        const tg = { el: m.el, bk, strong, off, aoe, move: m.id, strongHit: m.mp >= 3, cheap: m.mp === 1 };
        if (m.bonusDef) tg.bonus = eff(u, "def") * m.bonusDef;
        if (m.basic && fxl(u, "pillarFist")) tg.bonus = (tg.bonus || 0) + eff(u, "def") * fxv(u, "pillarFist", 0.25, 0.12);
        const ws = getBuff(u, "wrathStore"); if (ws && ws.val > 0 && h === 0) { tg.bonus = (tg.bonus || 0) + ws.val; ws.val = 0; u.buffs = u.buffs.filter(b => b !== ws); }
        if (u.diveReady && h === 0) { base *= 1.6; }
        if (u.gallop && el === "shock") base *= 1 + 0.15 * u.gallop.n;
        if (o.crit !== undefined) tg.crit = o.crit;
        if (o.pre) o.pre(tg, h);
        total += damage(ctx, u, t, base, m.kind, tg);
        if (m.stEach && t.alive && m.st) m.st.forEach(([ty, n, ch]) => addStatus(ctx, u, t, ty, n, { chance: ch, off }));
      }
      if (t.alive && m.st && !m.stEach) m.st.forEach(([ty, n, ch]) => addStatus(ctx, u, t, ty, n, { chance: ch, off }));
      if (t.alive && m.db) m.db.forEach(([s, v, tu]) => debuff(ctx, u, t, s, v, tu));
      if (m.db && m.bk) countBreak(ctx, t, m.bk);
      if (m.basic && u.ablaze && t.alive) addStatus(ctx, u, t, "burn", 1, { sure: 1 });
    });
    if (u.diveReady) u.diveReady = false;
    if (m.tide) gainTide(ctx, u, m.tide);
    return total;
  }
  function useMove(ctx, u, moveId, target, opt) {
    const m = MOVES[moveId]; if (!m) return;
    const ev = ctx.ev;
    const mp0 = u.mp;
    u.mp = Math.max(0, u.mp - mpCost(u, moveId));
    if (m.mp && !m.basic) u.spellsTurn = (u.spellsTurn || 0) + 1;
    const el = m.el === "self" ? u.element : m.el;
    if (u.fx) {
      const f = fxs(u);
      u.opening = fxl(u, "openingCharge") && !f.opened ? fxv(u, "openingCharge", 0.4, 0.2) : 0; f.opened = 1;
      u.spellBonus = 0; if (u.attuneBonus && m.mp && moveId !== "attune") { u.spellBonus = u.attuneBonus; u.attuneBonus = 0; }
    }
    // the one-shot cost reductions are spent by a matching spell
    if (u.attune && el === u.attune && m.kind !== "phys" && m.mp) u.attune = null;
    if (u.moodEl && el === u.moodEl && m.kind !== "phys" && m.mp) u.moodEl = null;
    if (m.hpCost) { const c = Math.round(u.maxHp * m.hpCost); u.hp = Math.max(1, u.hp - c); ev.push({ t: "selfDmg", tgt: u, v: c }); }
    if (m.hpCostPct) { const c = Math.round(u.maxHp * m.hpCostPct); u.hp = Math.max(1, u.hp - c); ev.push({ t: "selfDmg", tgt: u, v: c }); }
    ev.push({ t: "use", src: u, move: m.name, moveId, grp: m.grp, tkind: m.target, basic: !!m.basic, tgt: target, el });
    u.lastMove = moveId;
    if (m.basic) {
      u.mp = Math.min(u.maxMp, u.mp + 1);
      if (u.fx) {
        const f = fxs(u);
        if (fxl(u, "emptyHands") && mp0 === 0 && (fxl(u, "emptyHands") >= 2 || !f.emptyUsed)) { f.emptyUsed = 1; u.mp = Math.min(u.maxMp, u.mp + 1); }
        if (fxl(u, "readyHands") === 1 && !f.readyUsed) { f.readyUsed = 1; u.mp = Math.min(u.maxMp, u.mp + 1); }
      }
    }
    const tgts = targetsOf(ctx, u, m, target);
    if (m.basic && u.style === "leviathan") { /* Tide comes from m.tide in genericAttack */ }
    if (m.fx && FX[m.fx]) FX[m.fx](ctx, u, m, target, tgts, opt); else genericAttack(ctx, u, m, tgts);
    if (u.gallop && moveId !== "staticGallop") { if (el === "shock" && m.mp) u.gallop.n = Math.min(4, u.gallop.n + 1); else if (m.mp) u.gallop = null; }
    if (m.kind !== "phys" && el && m.mp) u.lastEl = el;
    u.opening = 0; u.spellBonus = 0;
    if (u.unheard && (m.fx === "coil" || m.fx === "stoneGaze" || m.st || m.db)) u.unheard = false;
  }

  // ---------- special effects ----------
  const teamHeal = (c, u, mine, base) => mine.filter(a => a.alive).forEach(a => heal(c, u, a, base));
  const FX = {
    bullRush(c, u, m, t, ts) { genericAttack(c, u, m, ts); if (t.alive) delayTurn(c, t, u.name + " shoves " + t.name + " to the back of the line!"); },
    roar(c, u) { hold(u, u, "taunt", 1); say(c, u.name + " roars. All eyes are on it!"); },
    bloodrage(c, u) { addBuff(u, "atk", 0.3, 2); addBuff(u, "def", -0.3, 2, { force: 1 }); say(c, u.name + " is filled with rage."); },
    wrath(c, u) { addBuff(u, "wrathStore", 0, 3); say(c, u.name + " bottles up its anger."); },
    tailwind(c, u, m, t) { addBuff(t, "spd", 0.3, 2); c.ev.push({ t: "buff", tgt: t, stat: "spd", val: 0.3 }); say(c, t.name + " feels the wind at its back."); },
    dive(c, u) { hold(u, u, "dr", 0.3); u.diveReady = true; say(c, u.name + " soars out of reach."); },
    hitAndRun(c, u, m, t, ts) { genericAttack(c, u, m, ts); hold(u, u, "dr", 0.25); },
    snatch(c, u, m, t) {
      const b = t.buffs.find(x => x.val > 0 && ["atk", "def", "pow", "res", "spd", "dr", "shield", "taunt"].includes(x.type));
      if (!b) { say(c, "There is nothing to snatch."); return; }
      t.buffs = t.buffs.filter(x => x !== b); addBuff(u, b.type, b.val, b.turns > 50 ? 2 : b.turns, { force: 1 }); say(c, u.name + " snatches " + t.name + "'s " + b.type + " boost!");
    },
    fester(c, u, m, t) { DOTS.forEach(d => t.st[d] && tickOne(c, t, d, "FESTER")); },
    rupture(c, u, m, t) {
      const b = t.st.bleed, n = b ? b.n : 0; delete t.st.bleed;
      genericAttack(c, u, m, [t], { p: 0.7 + 0.45 * n, strong: true }); if (!n) say(c, "No bleed to burst."); else say(c, "The wounds burst open!");
    },
    regrow(c, u) { addBuff(u, "hot", Math.round(0.9 * eff(u, "pow") * 0.7), 3); say(c, u.name + " regrows a head."); },
    challenge(c, u) { addBuff(u, "taunt", 1, 2); say(c, u.name + " challenges the enemy!"); },
    fortify(c, u) { addBuff(u, "def", 0.4, 2); addBuff(u, "res", 0.4, 2); say(c, u.name + " hardens its shell."); },
    bulwark(c, u, m, t) { hold(u, t, "cover", 1, { by: u }); say(c, u.name + " steps in front of " + (t === u ? "itself" : t.name) + "."); },
    counterSt(c, u) { hold(u, u, "counter", 1); say(c, u.name + " takes a counter stance."); },
    shieldWall(c, u, m, t, ts) { const dr = fxl(u, "lockedShields") ? fxv(u, "lockedShields", 0.4, 0.35) : 0.3; ts.forEach(a => hold(u, a, "dr", dr)); say(c, "A wall of stone shields the team."); },
    earthshaker(c, u, m, t, ts) { genericAttack(c, u, m, ts, { pmul: 1 + fxv(u, "earthquake", 0.3, 0.15) }); ts.forEach(x => x.alive && addStatus(c, u, x, "stun", 1, { chance: 0.15 + fxv(u, "earthquake", 0.10, 0.05) })); },
    unbreakable(c, u) { u.buffs = u.buffs.filter(b => b.val >= 0); ["stun", "freeze", "slow", "chill", "steam", "petrify"].forEach(k => delete u.st[k]); addBuff(u, "stunImmune", 1, 2); say(c, u.name + " stands unbreakable."); },
    warmLight(c, u, m, t) { heal(c, u, t, 3.4); },
    rejuvenate(c, u, m, t) { addBuff(t, "hot", Math.round(0.9 * eff(u, "pow") * 0.7), 3); c.ev.push({ t: "buff", tgt: t, stat: "regen" }); say(c, t.name + " is wrapped in warm light."); },
    cleansingFlame(c, u, m, t) { if (!cleanse(c, t, 1)) say(c, "Nothing to cleanse."); },
    flameWard(c, u, m, t) { addBuff(t, "shield", Math.round(1.6 * eff(u, "pow") * 0.7), 2); c.ev.push({ t: "buff", tgt: t, stat: "shield" }); say(c, t.name + " gets a flame shield."); },
    healWave(c, u, m, t, ts) { teamHeal(c, u, ts, 1.1); },
    rebirth(c, u, m, t) { revive(c, t, 0.3); },
    revive(c, u, m, t) { revive(c, t, 0.2); },
    purge(c, u, m, t, ts) { ts.forEach(a => cleanse(c, a, 0)); say(c, "A clean flame washes over the team."); },
    sunfire(c, u, m, t, ts) { const d = genericAttack(c, u, m, [t]); ctxTeam(c, u).forEach(a => a.alive && healFlat(c, a, Math.round(d * 0.3))); },
    shatterShield(c, u, m, t, ts) {
      genericAttack(c, u, m, ts); t.buffs = t.buffs.filter(b => !["shield", "dr"].includes(b.type)); if (t.frontShield) { t.shieldDown = 2; say(c, t.name + "'s barrier cracks!"); }
    },
    coil(c, u, m, t) { if (ctrlRoll(c, u, t, 0.9)) { t.loseAct = (t.loseAct || 0) + 1; c.ev.push({ t: "status", tgt: t, type: "coil" }); say(c, t.name + " is wrapped up and loses an action!"); } },
    stoneGaze(c, u, m, t) { if (ctrlRoll(c, u, t, 0.7)) addStatus(c, u, t, "stun", 1, { sure: 1 }); },
    curseOfStone(c, u, m, t) { t.buffs = t.buffs.filter(b => b.val <= 0); t.noBuff = 2; say(c, "Stone seals " + t.name + "'s power."); c.ev.push({ t: "status", tgt: t, type: "curse" }); },
    attune(c, u) { if (u.lastEl) { u.attune = u.lastEl; if (fxl(u, "chargedAttune")) u.attuneBonus = fxv(u, "chargedAttune", 0.15, 0.07); say(c, u.name + " attunes to " + u.lastEl + "."); } else say(c, "Nothing to attune to yet."); },
    detonate(c, u, m, t) {
      let n = 0; ["burn", "chill", "shock"].forEach(k => { if (t.st[k]) { n += t.st[k].n; delete t.st[k]; } }); if (t.st.wet) { n += 1; delete t.st.wet; }
      genericAttack(c, u, m, [t], { p: (0.8 + 0.4 * n) * (1 + fxv(u, "sharperDetonate", 0.3, 0.15)), strong: true, pre: tg => { tg.noReact = 1; if (u.passive === "comboMaster") tg.mult = comboMult(u); } }); if (n) reaction(c, t, "Detonate", n + " marks detonate!");
    },
    deepBreath(c, u, m) { gainTide(c, u, m.tide); },
    maelstrom(c, u, m, t, ts) { release(c, u, m, ts); },
    tidalWave(c, u, m, t, ts) { release(c, u, m, ts); },
    swell(c, u) { addBuff(u, "swell", 1, 3); say(c, u.name + " gathers the deep."); },
    braceDeep(c, u) { hold(u, u, "dr", 0.35); hold(u, u, "braceDeep", 1); u.braceTide = 0; say(c, u.name + " braces against the current."); },
    riptide(c, u, m, t, ts) { genericAttack(c, u, m, ts); if (t.alive) delayTurn(c, t, "The riptide drags " + t.name + " back!"); },
    abyssal(c, u, m, t, ts) {
      genericAttack(c, u, m, ts); const take = Math.min(2, t.mp || 0); if (take) t.mp -= take; u.mp = Math.min(u.maxMp, u.mp + (take || 1)); say(c, u.name + " drains " + (take || 1) + " MP.");
    },
    // ----- personal moves -----
    twoHeads(c, u, m, t, ts, opt) {
      if (opt === "goat") { const m2 = Object.assign({}, m, { bk: [], mp: 1 }); genericAttack(c, u, m2, ts, { p: 1.2 }); if (t.alive) addStatus(c, u, t, "bleed", 1, { sure: 1 }); }
      else genericAttack(c, u, m, ts);
    },
    erodingRune(c, u) { u.runes = { n: 0, t: 2 }; say(c, u.name + " carves a rune into its shell."); },
    nineTails(c, u) { u.tails = 3; say(c, "Nine tails light up, one by one."); },
    grudgeBite(c, u, m, t, ts) { genericAttack(c, u, m, ts); if (t.alive) { u.grudge = { tgt: t, n: 0, t: 4 }; say(c, u.name + " remembers " + t.name + "."); } },
    cuttingRemark(c, u, m, t, ts) { const marked = debuffCount(t) > 0; genericAttack(c, u, m, ts, { crit: marked ? true : undefined }); },
    gateClimb(c, u, m, t) {
      const steps = [["water", "wet"], ["ice", "chill"], ["shock", "shock"]]; const i = (u.gcIdx || 0) % 3; u.gcIdx = i + 1; const [el, st] = steps[i];
      damage(c, u, t, m.p, "spell", { el, bk: [el], strong: true }); if (t.alive) addStatus(c, u, t, st, st === "chill" ? 2 : 1, { sure: 1 }); u.lastEl = el;
    },
    smotheringMoss(c, u, m, t, ts) { genericAttack(c, u, m, ts); if (t.alive) { t.moss = 3; Object.keys(t.st).forEach(k => STATUS[k].dot && (t.st[k].t += 2)); say(c, t.name + " is smothered in moss."); } },
    unheardApproach(c, u) { u.unheard = true; say(c, u.name + " slips into the shadows."); },
    goldenFleece(c, u, m, t) { healFlat(c, t, Math.round(t.maxHp * 0.3)); },
    jokersGambit(c, u, m, t, ts) {
      const r = Math.floor(rnd() * 3);
      if (r === 0) { say(c, "Joker's Gambit: a flurry!"); for (let i = 0; i < 4 && t.alive; i++) damage(c, u, t, 0.45, "phys", {}); }
      else if (r === 1) { say(c, "Joker's Gambit: a heavy hit!"); genericAttack(c, u, m, ts, { p: 2.0 }); }
      else { say(c, "Joker's Gambit: a slowing blow!"); genericAttack(c, u, m, ts, { p: 0.9 }); if (t.alive) addStatus(c, u, t, "slow", 1, { sure: 1 }); }
    },
    staticGallop(c, u) { u.gallop = { n: 0, t: 3 }; say(c, u.name + " starts to gallop!"); },
    hounds(c, u, m, t) { hold(u, t, "hounds", 1, { owner: u }); say(c, "The hounds fix their eyes on " + t.name + "."); },
    serpentSpout(c, u, m, t, ts) { genericAttack(c, u, m, ts); delete u.st.burn; },
    nidhoggGnaw(c, u, m, t, ts) { genericAttack(c, u, m, ts); if (t.alive) { t.shave = true; t.baseMaxHp = t.baseMaxHp || t.maxHp; say(c, "Rot sets into " + t.name + "."); } },
    creepingStone(c, u, m, t) { if (ctrlRoll(c, u, t, 0.95)) { t.st.petrify = { n: 0, t: 3, pw: 0 }; c.ev.push({ t: "status", tgt: t, type: "petrify", n: 1 }); say(c, t.name + " begins to turn to stone."); } },
    ammitsFeast(c, u, m, t, ts) { const was = t.broken; const d = genericAttack(c, u, m, ts); healFlat(c, u, Math.round(d * (was ? 0.4 : 0.2))); },
    featherCushion(c, u, m, t, ts) { genericAttack(c, u, m, ts); const low = ctxTeam(c, u).filter(a => a.alive).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0]; if (low) hold(u, low, "dr", 0.25); },
    dirtyLaundry(c, u, m, t) { const k = Math.min(5, debuffCount(t)); if (!k) { say(c, "Nothing to gossip about."); return; } debuff(c, u, t, "atk", -0.08 * k, 2); debuff(c, u, t, "def", -0.08 * k, 2); },
    plantThePillar(c, u, m, t, ts) { ts.forEach(a => addBuff(a, "shield", Math.round(1.5 * eff(u, "def")), 3)); u.loseAct = (u.loseAct || 0) + 1; say(c, "A great pillar shelters the team."); },
    sunAscending(c, u, m, t, ts) { u.sun = { n: 0, left: 3, owner: u }; say(c, "The sun begins to rise."); },
    tipTheBowl(c, u, m, t, ts) { genericAttack(c, u, m, ts); hold(u, u, "vuln", 0.25); },
    ablaze(c, u) { u.ablaze = 3; say(c, u.name + " bursts into flame!"); },
    decoy(c, u) { addBuff(u, "decoy", 1, 3); addBuff(u, "taunt", 1, 3); say(c, u.name + " dangles a misleading light."); },
    devouringWhirl(c, u, m, t, ts) {
      let eaten = Object.keys(t.st).reduce((s, k) => s + (t.st[k].n || 1), 0); eaten = Math.min(3, eaten); t.st = {};
      genericAttack(c, u, m, ts, { pmul: 1 + 0.1 * eaten }); gainTide(c, u, eaten); c.party.concat(c.foes).forEach(a => { if (a.side === u.side) DOTS.forEach(d => delete a.st[d]); });
    },
    silverLining(c, u, m, t) { heal(c, u, t, 2.2); if (c.lastOver > 0) addBuff(t, "shield", c.lastOver, 3); cleanse(c, t, 1); },
    fallingDust(c, u, m, t, ts) { ts.forEach(a => addBuff(a, "dust", 1, 2, { owner: u })); say(c, "Glowing dust drifts down."); },
    moonlitAntlers(c, u) { addBuff(u, "antlers", 1, 3); ctxTeam(c, u).forEach(a => (a.antTide = 0)); say(c, "The antlers shine like a moon."); },
    takeRoot(c, u) { u.rooted = 3; addBuff(u, "dr", 0.2, 3); addBuff(u, "atk", -0.25, 3, { force: 1 }); addBuff(u, "pow", -0.25, 3, { force: 1 }); say(c, u.name + " plants itself."); },
    sealedLetters(c, u, m, t, ts) { genericAttack(c, u, m, ts); if (t.alive) { t.notes = 2; t.notesBy = u; } },
    keeningOmen(c, u, m, t) { t.omen = { t: 3, src: u }; say(c, "A song of mourning rises around " + t.name + "."); },
    redHotBronze(c, u) { addBuff(u, "redHot", 1, 3); say(c, u.name + "'s bronze glows red."); },
    lament(c, u, m, t) { const v = Math.min(t.lastHit || 0, Math.round(t.maxHp * 0.35)); if (v) healFlat(c, t, v); else say(c, "No fresh wound to mend."); },
    lightTheHearth(c, u) { c.hearth = c.hearth || {}; c.hearth[u.side] = u; say(c, "A hearth fire flickers to life."); },
    nightTerror(c, u, m, t) { t.terrorOn = 3; say(c, "Dread settles over " + t.name + "."); },
    moodScales(c, u, m, t, ts, opt) { const el = opt || u.element; addBuff(u, "ward_" + el, 0.4, 2); u.moodEl = el; say(c, u.name + "'s scales turn " + el + "."); },
    dreamEater(c, u, m, t) { let n = 0; Object.keys(t.st).forEach(k => { if (n < 3 && DOT_CLEANSE.includes(k)) { delete t.st[k]; n++; } }); gainTide(c, u, n); if (!n) say(c, "Nothing to eat."); },
  };
  const ctxTeam = (c, u) => (u.side === "p" ? c.party : c.foes);
  function release(c, u, m, ts) {
    const full = u.tide >= 5 && u.passive === "highWater", mult = 1 + 0.8 * u.tide;
    genericAttack(c, u, m, ts, { pmul: mult, strong: true }); u.tide = 0; c.ev.push({ t: "tide", tgt: u, v: 0, n: 0 });
    if (full) ts.forEach(x => x.alive && ctrlRoll(c, u, x, 0.9) && addStatus(c, u, x, "stun", 1, { sure: 1 }));
  }
  function tickOne(ctx, u, type, tag) {
    if (!u.alive || !u.st[type]) return;
    let v = dotUnit(u, type);
    const S = STATUS[type]; v = Math.max(1, Math.round(v * elemMult(u, S.el) * (S.el === "fire" && fxl(u, "ashenSkin") ? 1 - fxv(u, "ashenSkin", 0.2, 0.1) : 1)));
    u.hp = Math.max(0, u.hp - v);
    ctx.ev.push({ t: "dmg", src: null, tgt: u, v, dot: type, el: S.el || null, note: tag || "" });
    if (type === "poison" && u.shave) { const cap = Math.round((u.baseMaxHp || u.maxHp) * 0.15), cur = (u.baseMaxHp || u.maxHp) - u.maxHp; if (cur < cap) { u.maxHp = Math.max(1, u.maxHp - Math.round((u.baseMaxHp || u.maxHp) * 0.01)); u.hp = Math.min(u.hp, u.maxHp); } }
    if (u.hp <= 0) die(ctx, u);
  }


  // ---------- enemies ----------
  const ENEMY_PROFILES = {
    brute: { hp: 3, atk: 3, pow: 0.5, def: 2, res: 1, spd: 0.6, foc: 0.5, lck: 0.5 },
    beast: { hp: 2, atk: 2.5, pow: 1, def: 1.5, res: 1.2, spd: 1.2, foc: 0.5, lck: 0.6 },
    swift: { hp: 1.6, atk: 2.2, pow: 1, def: 1, res: 1, spd: 2.2, foc: 0.5, lck: 1 },
    caster: { hp: 1.5, atk: 0.5, pow: 3, def: 0.8, res: 1.5, spd: 1.2, foc: 0.5, lck: 0.8 },
    tank: { hp: 3, atk: 2, pow: 0.5, def: 3.5, res: 1.5, spd: 0.4, foc: 0.5, lck: 0.3 },
    flyer: { hp: 1.6, atk: 2.2, pow: 1, def: 1, res: 1.2, spd: 2.8, foc: 0.5, lck: 1 },
    swarm: { hp: 2, atk: 2, pow: 0.5, def: 1, res: 1, spd: 1.5, foc: 0.5, lck: 0.5 },
    ghost: { hp: 2, atk: 0.5, pow: 2.8, def: 1.5, res: 2, spd: 1.2, foc: 0.5, lck: 0.8 },
    human: { hp: 2.4, atk: 2.6, pow: 0.5, def: 2.2, res: 1.5, spd: 1, foc: 0.5, lck: 0.8 },
  };
  // ab = abilities: n name, p power, k kind (phys|spell), el, aoe, tgt (rand|weak|front|frail|strong), st [type,stacks,chance], db [stat,val,turns],
  // self [stat,val,turns], ally [stat,val,turns] (all allies), drain (fraction healed), w weight, if (first | hp<x | hp>x | every:N | alone | ally:id)
  const ENEMIES = {};
  // field (non-boss) enemies are scaled here so one number tunes all random fights: HP x FIELD_HP, ability power x FIELD_DMG
  const FIELD_HP = 1.25, FIELD_DMG = 1.45;   // 2026-10-29: Danny wants about 4-8 player actions per field enemy (was 15 at 2.4)
  function en(id, name, profile, o) {
    const d = ENEMIES[id] = Object.assign({ id, name, art: id, profile, actions: 1, hpMult: 0.5 }, o);
    if (!d.boss && !d.legacy) { d.hpMult *= FIELD_HP; d.ab = d.ab.map(a => (a.p ? Object.assign({}, a, { p: +(a.p * FIELD_DMG).toFixed(3) }) : a)); if (d.bigHit) d.bigHit *= FIELD_DMG; }
  }
  // --- legacy prototype enemies (kept so the old demo scenes still work) ---
  en("scorpion", "Glass Scorpion", "brute", { legacy: 1, hpMult: 0.55, actions: 2, xp: 14, kakal: 12, ab: [{ n: "Attack", p: 1.1, w: 7 }, { n: "Wild Sweep", p: 0.6, aoe: 1, w: 3 }] });
  en("jackal", "Dune Jackal", "swift", { legacy: 1, hpMult: 0.4, xp: 6, kakal: 5, ab: [{ n: "Attack", p: 1.0 }] });
  en("legion", "Legionary", "brute", { legacy: 1, hpMult: 0.32, xp: 8, kakal: 9, ab: [{ n: "Attack", p: 1.0 }] });
  // --- R0 Orun Undercroft (L1-2) ---
  en("pipeSlug", "Pipe Slug", "brute", { hpMult: 0.5, rs: { fire: -0.25 }, drops: [["pipeSlime", 0.3]], ab: [{ n: "Slime Bash", p: 1.0, w: 3 }, { n: "Sticky Goo", p: 0.5, k: "spell", db: ["spd", -0.3, 2], w: 2 }] });
  en("inkImp", "Ink Imp", "caster", { hpMult: 0.35, drops: [["inkVial", 0.3]], ab: [{ n: "Ink Blot", p: 0.9, k: "spell", db: ["res", -0.2, 2], w: 3 }, { n: "Scratch", p: 0.6, w: 1 }] });
  en("cellarRatKing", "Cellar Rat-King", "swarm", { hpMult: 0.55, actions: 2, swarm: 1, drops: [["ratWhisker", 0.3]], ab: [{ n: "Gnaw", p: 0.55, st: ["bleed", 1, 0.35] }] });
  en("dustWisp", "Dust Wisp", "caster", { hpMult: 0.3, rs: { water: -1, fire: 0.5, shock: 0.5 }, drops: [["wispSpark", 0.3]], ab: [{ n: "Spark", p: 0.85, k: "spell", el: "shock", st: ["shock", 1, 0.25] }] });
  en("gelatinCubeMimic", "Gelatin Cube Mimic", "tank", { hpMult: 0.7, immune: ["poison", "bleed"], rs: { fire: -0.3 }, drops: [["gelSample", 0.3]], ab: [{ n: "Engulf", p: 0.8, db: ["def", -0.2, 2], w: 2 }, { n: "Slam", p: 1.1, w: 3 }] });
  // --- R1 Whisperglass Dunes (L2-4) ---
  en("sandstitchJackal", "Sandstitch Jackal", "swift", { hpMult: 0.4, art: "sandstitchJackal", drops: [["jackalPelt", 0.25], ["duneclawShard", 0.05]], ab: [{ n: "Bite", p: 1.0, st: ["bleed", 1, 0.5], w: 3 }, { n: "Circle and Snap", p: 0.8, self: ["dr", 0.2, 1], w: 1 }] });
  en("glassAdder", "Glass Adder", "swift", { hpMult: 0.4, drops: [["adderFang", 0.3]], ab: [{ n: "Venom Bite", p: 0.8, st: ["poison", 1, 0.8], w: 3 }, { n: "Vanish into Sand", p: 0.6, self: ["dr", 0.5, 1], w: 1 }] });
  en("dustwingImp", "Dustwing Imp", "flyer", { hpMult: 0.35, drops: [["impWing", 0.3]], ab: [{ n: "Sand Toss", p: 0.5, k: "spell", db: ["spd", -0.25, 2], w: 2 }, { n: "Scratch", p: 0.9, w: 2 }] });
  en("mirageCat", "Mirage Cat", "beast", { hpMult: 0.45, actions: 1, drops: [["mirageDust", 0.3]], ab: [{ n: "Pounce and Flicker", p: 0.9, self: ["dr", 0.35, 1], w: 3 }, { n: "Claw", p: 0.8, w: 1 }] });
  en("raidShieldbearer", "Raid Shieldbearer", "human", { hpMult: 0.55, pr: 0.4, drops: [["soldierToken", 0.2]], ab: [{ n: "Shield Bash", p: 0.8, db: ["spd", -0.2, 2], w: 2 }, { n: "Short Sword", p: 1.0, w: 3 }] });
  en("raidSlinger", "Raid Slinger", "human", { hpMult: 0.35, drops: [["soldierToken", 0.2]], ab: [{ n: "Sling Stone", p: 1.1, tgt: "weak" }] });
  // --- Cistern of the Burnt Gate (L3-5) ---
  en("dripWraith", "Drip Wraith", "ghost", { hpMult: 0.45, pr: 0.5, immune: ["bleed"], rs: { shock: -0.5, water: 0.75 }, drops: [["wraithWater", 0.3]], ab: [{ n: "Chilling Touch", p: 0.9, k: "spell", el: "water", st: ["wet", 1, 0.5], w: 3 }, { n: "Drain", p: 0.7, k: "spell", drain: 0.4, w: 2 }] });
  en("boneCrab", "Bone Crab", "tank", { hpMult: 0.6, immune: ["poison", "bleed"], breakType: "impact", rs: { fire: 0.25 }, drops: [["boneChip", 0.3]], ab: [{ n: "Pincer", p: 1.1, w: 3 }, { n: "Brittle Rush", p: 0.8, aoe: 1, w: 1 }] });
  en("cisternEel", "Cistern Eel", "beast", { hpMult: 0.45, rs: { shock: 0.5, ice: -0.25 }, drops: [["eelTooth", 0.3]], ab: [{ n: "Gnash", p: 1.0, st: ["bleed", 1, 0.5], w: 3 }, { n: "Zap", p: 0.7, k: "spell", el: "shock", w: 1 }] });
  en("mossGolem", "Moss Golem", "tank", { hpMult: 0.75, rs: { fire: -0.5, water: 0.5 }, breakType: "fire", drops: [["mossCore", 0.3]], ab: [{ n: "Slam", p: 1.1, w: 3 }, { n: "Moss Wrap", p: 0.6, db: ["spd", -0.25, 2], w: 1 }] });
  en("raidTorchbearer", "Raid Torchbearer", "human", { hpMult: 0.45, rs: { water: -0.3, fire: 0.5 }, drops: [["soldierToken", 0.2]], ab: [{ n: "Torch Swing", p: 0.9, el: "fire", st: ["burn", 1, 0.6] }] });
  // --- R2 Amber Wells Basin (L5-7) ---
  en("cinderlizardHound", "Cinderlizard Hound", "beast", { hpMult: 0.55, rs: { water: -0.5, ice: -0.5, fire: 0.75 }, breakType: "water", drops: [["cinderglassEmber", 0.15]], ab: [{ n: "Bite", p: 1.0, w: 3 }, { n: "Ember Breath", p: 0.7, k: "spell", el: "fire", aoe: 1, st: ["burn", 1, 0.7], w: 2 }] });
  en("duneScorpionKnight", "Dune Scorpion Knight", "brute", { hpMult: 0.75, breakType: "impact", pr: 0.15, drops: [["duneclawShard", 0.25]], ab: [{ n: "Ram-Skull Slam", p: 1.4, w: 3 }, { n: "Pincer Sweep", p: 0.6, aoe: 1, w: 1 }] });
  en("sunScarabSwarm", "Sun-Scarab Swarm", "swarm", { hpMult: 0.6, actions: 2, swarm: 1, drops: [["scarabShell", 0.3]], ab: [{ n: "Swarm Bite", p: 0.55, w: 3 }, { n: "Locust Cloud", p: 0.35, aoe: 1, w: 1 }] });
  en("saltHarpy", "Salt Harpy", "flyer", { hpMult: 0.45, actions: 2, rs: { water: -0.5 }, drops: [["saltCrust", 0.3]], ab: [{ n: "Salt-Talon Rake", p: 0.65, st: ["bleed", 1, 0.5] }] });
  en("dustSphinxCub", "Dust Sphinx Cub", "caster", { hpMult: 0.5, drops: [["sphinxWhisker", 0.3]], open: { n: "Free Weaken", db: ["atk", -0.25, 3], tgt: "strong" }, ab: [{ n: "Riddle", p: 0.7, k: "spell", db: ["pow", -0.2, 2], w: 2 }, { n: "Paw", p: 0.9, w: 2 }] });
  en("raidSpearman", "Raid Spearman", "human", { hpMult: 0.5, drops: [["soldierToken", 0.2]], ab: [{ n: "Spear Thrust", p: 1.15, tgt: "front" }] });
  en("raidArcher", "Raid Archer", "human", { hpMult: 0.4, drops: [["soldierToken", 0.2]], ab: [{ n: "Aimed Shot", p: 1.1, tgt: "weak" }] });
  // --- Quarry, Flats, Bone Maze, Hollow (L6-9) ---
  en("quarryboundGargoyle", "Quarrybound Gargoyle", "brute", { hpMult: 0.7, pr: 0.3, breakType: "impact", rs: { earth: 0.5, water: -0.25 }, drops: [["gargoyleChip", 0.3]], ab: [{ n: "Claw", p: 1.0, w: 3 }, { n: "Stone Dive", p: 1.5, w: 1, if: "every:3" }] });
  en("slagImp", "Slag Imp", "caster", { hpMult: 0.4, rs: { water: -0.75, fire: 0.75 }, breakType: "water", drops: [["slag", 0.3]], ab: [{ n: "Slag Spit", p: 0.95, k: "spell", el: "fire", st: ["burn", 1, 0.5] }] });
  en("basaltSkin", "Basalt Skin", "tank", { hpMult: 0.8, pr: 0.25, breakType: "impact", rs: { earth: 0.5 }, drops: [["basaltShard", 0.3]], ab: [{ n: "Basalt Fist", p: 1.2 }] });
  en("mirrorBeetle", "Mirror Beetle", "tank", { hpMult: 0.6, reflect: ["light", "shock"], drops: [["mirrorScale", 0.3]], ab: [{ n: "Mandibles", p: 1.0, w: 3 }, { n: "Glint", p: 0.7, k: "spell", el: "light", w: 1 }] });
  en("mazeBat", "Maze Bat", "flyer", { hpMult: 0.35, actions: 2, drops: [["batEar", 0.3]], ab: [{ n: "Draining Bite", p: 0.6, drain: 0.5 }] });
  en("boneBullCalf", "Bone Bull-Calf", "brute", { hpMult: 0.65, immune: ["poison", "bleed"], breakType: "impact", bigEvery: 3, bigHit: 1.5, bigName: "Bone Charge", bigSingle: 1, drops: [["calfHorn", 0.3]], ab: [{ n: "Gore", p: 1.2 }] });
  en("emberScorpion", "Ember Scorpion", "brute", { hpMult: 0.6, rs: { water: -0.5, fire: 0.75 }, breakType: "water", drops: [["cinderglassEmber", 0.2], ["duneclawShard", 0.05]], ab: [{ n: "Burning Sting", p: 1.0, st: ["burn", 2, 0.6], w: 3 }, { n: "Pincer", p: 0.9, w: 1 }] });
  // --- legend L1 and the K1 guardian ---
  en("duneWhisperer", "The Dune Whisperer", "swift", { hpMult: 1.1, art: "sandstitchJackal", vscale: 1.25, vtint: 0xd8e4ff, rs: { shock: -0.25, fire: 0.25 }, xp: 40, kakal: 20, drops: [],
    ab: [{ n: "Echoed Bite", p: 0.95, st: ["bleed", 1, 0.4], w: 3 }, { n: "Whisper", p: 0.55, k: "spell", db: ["atk", -0.2, 2], w: 2 }, { n: "A Mouthful of Voices", p: 0.35, k: "spell", aoe: 1, db: ["res", -0.15, 2], w: 1 }] });
  en("mazeGuardian", "Maze Guardian", "brute", { boss: true, hpMult: 3, art: "boneBullCalf", vscale: 1.9, actions: 2, immune: ["poison", "bleed"], breakType: "impact", breakNeed: 2, xp: 90, kakal: 70, drops: [["boneChip", 1]],
    intro: "The Maze's guardian lowers its horns!", bigEvery: 3, bigHit: 0.8, bigName: "Labyrinth Charge", bigSingle: 1,
    ab: [{ n: "Gore", p: 0.62, w: 5 }, { n: "Horn Sweep", p: 0.34, aoe: 1, w: 2 }, { n: "Bellow", p: 0.3, k: "spell", db: ["spd", -0.25, 2], aoe: 1, w: 1 }] });
  // --- bosses ---
  en("raidOptioKarvan", "Raid Optio Karvan", "human", {
    boss: true, hpMult: 3.2, actions: 2, breakType: "impact", breakNeed: 2, coverBy: "raidShieldbearer", xp: 70, kakal: 60, drops: [["G16", 1]],
    intro: "An officer steps out from behind a wall of tower shields. \"Take the scholar's pets alive!\"",
    bigEvery: 4, bigHit: 0.8, bigName: "Legion Charge",
    ab: [{ n: "Gladius Strike", p: 0.85, w: 4 }, { n: "Shield Bash", p: 0.65, db: ["spd", -0.25, 2], w: 2 }, { n: "Rally Cry", ally: ["atk", 0.2, 3], w: 2, if: "hasAlly" }],
  });
  en("duneBearer", "The Dune Bearer", "brute", {
    boss: true, hpMult: 8, actions: 2, breakType: "impact", breakNeed: 2, xp: 220, kakal: 150, frontShield: 0.25, drops: [["G17", 1]],
    bigEvery: 3, bigHit: 0.68, bigName: "Sky-Stone Drop",
    intro: "The sand rises. An ancient giant stands up, a cracked sky-stone strapped to its back.",
    ab: [{ n: "Crush", p: 0.48, w: 7 }, { n: "Sand Sweep", p: 0.296, aoe: 1, w: 3 }],
    phases: [
      { hpMult: 8, actions: 2, bigEvery: 3, bigHit: 0.76, frontShield: 0.25, text: "The Dune Bearer roars. Its runes flare red!",
        ab: [{ n: "Crush", p: 0.544, w: 6 }, { n: "Sand Sweep", p: 0.336, aoe: 1, w: 3 }, { n: "Rune Flare", p: 0.4, k: "spell", el: "fire", aoe: 1, st: ["burn", 1, 0.5], w: 2 }] },
      { hpMult: 6.4, actions: 2, bigEvery: 2, bigHit: 0.68, frontShield: 0, text: "The sky-stone shatters! Nothing shields it now, but it fights wildly.",
        ab: [{ n: "Crush", p: 0.616, w: 6 }, { n: "Sand Sweep", p: 0.384, aoe: 1, w: 3 }, { n: "Rune Flare", p: 0.44, k: "spell", el: "fire", aoe: 1, st: ["burn", 1, 0.5], w: 2 }] },
    ],
  });
  const HUMAN_IDS = ["raidShieldbearer", "raidSlinger", "raidTorchbearer", "raidSpearman", "raidArcher", "raidOptioKarvan"];

  function makeEnemy(id, level, tag) {
    const d = ENEMIES[id];
    const u = { id, side: "e", name: d.name + (tag || ""), art: d.art || id, level, stats: spread(ENEMY_PROFILES[d.profile], BASE_TOTAL + POINTS_PER_LEVEL * (level - 1)), mp: d.mp || 0, maxMp: d.mp || 0, buffs: [], st: {}, alive: true,
      broken: 0, breakPts: 0, breakHitRound: -9, boss: !!d.boss, human: HUMAN_IDS.includes(id), phases: d.phases ? d.phases.map(p => ({ ...p })) : null, phaseNo: 1 };
    ["actions", "hpMult", "breakType", "breakNeed", "frontShield", "bigEvery", "bigHit", "bigName", "bigSingle", "pr", "swarm", "reflect", "coverBy", "ab", "open", "sr", "intro", "vscale", "vtint"].forEach(k => d[k] !== undefined && (u[k] = d[k]));
    u.rs = Object.assign({}, d.rs); u.immune = d.immune ? d.immune.slice() : [];
    if (u.breakType && u.breakNeed === undefined) u.breakNeed = 1;
    if (u.boss) { u.dbm = 0.7; }
    u.maxHp = maxHpOf(u.stats, level, u.hpMult); u.hp = u.maxHp;
    u.xp = d.xp !== undefined ? d.xp : Math.round((4 + 2.2 * level) * (0.5 + d.hpMult) * (d.xpMult || 1));
    u.kakal = d.kakal !== undefined ? d.kakal : Math.round(u.xp * 0.7); u.gold = u.kakal; u.drops = d.drops || [];
    return u;
  }

  // ---------- battle context ----------
  function newBattle(party, foes) {
    party.forEach(p => {
      p.mp = Math.floor(p.stats.foc / 10); p.buffs = []; p.st = {}; p.counter = false; p.rise = false; p.ashesUsed = false; p.stoneSkin = 0; p.tide = 0; p.alive = p.hp > 0;
      p.attune = null; p.moodEl = null; p.unheard = false; p.diveReady = false; p.gallop = null; p.runes = null; p.grudge = null; p.ablaze = 0; p.sun = null; p.tails = 0; p.rooted = 0; p.hitsTurn = 0; p.loseAct = 0; p.maxMp = STYLES[p.style].passive === "highWater" ? 15 : 10;
      p.mp = Math.min(p.mp, p.maxMp); p.lastMove = p.lastMove || null; p.noBuff = 0; p.lastEl = null; p.gcIdx = 0; p.usedItem = false; p.moss = 0; p.omen = null; p.notes = 0; p.shave = false; p.terrorOn = 0; p.endedTurn = false;
      p.fxs = {}; p.fxTurns = 0; p.spellsTurn = 0; p.opening = 0; p.spellBonus = 0; p.attuneBonus = 0;
    });
    foes.forEach(f => { f.st = f.st || {}; f.endedTurn = false; f.loseAct = 0; });
    const ctx = { party, foes, round: 0, telegraph: null, ev: [], order: null, hearth: {}, team: u => (u.side === "p" ? party : foes), opp: u => (u.side === "p" ? foes : party) };
    foes.forEach(f => { if (f.open && f.alive) execAb(ctx, f, f.open, party.filter(p => p.alive), false); });
    return ctx;
  }
  function turnOrder(ctx) {
    ctx.foes.forEach(f => (f.chargedThisRound = false));
    ctx.order = [...ctx.party, ...ctx.foes].filter(u => u.alive).sort((a, b) => eff(b, "spd") - eff(a, "spd") || rnd() - 0.5);
    return ctx.order;
  }
  // called once at the start of every unit's turn: expires "until my next turn" effects, runs start-of-turn effects, returns the number of actions
  function actionsFor(ctx, u) {
    if (!u.alive) return 0;
    u.actedRound = ctx.round; u.endedTurn = false; u.hitsTurn = 0; u.spellsTurn = 0; u.fxTurns = (u.fxTurns || 0) + 1; if (u.fxs) u.fxs.deadTurn = 0;
    if (u.fx && fxl(u, "cleansing") && (fxl(u, "cleansing") >= 2 || u.fxTurns % 2 === 1)) {
      const k = DOT_CLEANSE.filter(x => u.st[x]).sort((a, b) => (u.st[b].n || 1) - (u.st[a].n || 1))[0];
      if (k) { delete u.st[k]; ctx.ev.push({ t: "cleanse", tgt: u, type: k }); }
    } u.houndTide = 0; u.braceTide = 0; u.antTide = 0;
    ctx.party.concat(ctx.foes).forEach(x => { if (x.buffs.length) x.buffs = x.buffs.filter(b => !(b.until === "turn" && b.owner === u)); });
    if (u.st.stun || u.st.freeze) {
      const k = u.st.freeze ? "freeze" : "stun"; delete u.st.stun; delete u.st.freeze;
      ctx.ev.push({ t: "stunned", tgt: u, type: k });
      if (u.charging) { u.charging = null; ctx.telegraph = ctx.foes.find(f => f.alive && f.charging) || null; say(ctx, u.name + "'s attack is interrupted!"); }
      u.sun = null; u.tails = 0; u.loseAct = 0; u.endedTurn = true;
      return 0;
    }
    if (hasBuff(u, "swell")) gainTide(ctx, u, 1);
    if (u.sun && u.sun.left > 0) { const pct = [0.05, 0.1, 0.15][u.sun.n] || 0.15; u.sun.n++; u.sun.left--; ctx.team(u).forEach(a => a.alive && healFlat(ctx, a, Math.round(a.maxHp * pct), { silent: 1 })); if (!u.sun.left) u.sun = null; }
    const hearthOwner = ctx.hearth[u.side]; if (hearthOwner && hearthOwner.alive) healFlat(ctx, u, Math.round(u.maxHp * 0.03), { silent: 1 });
    if (u.rooted > 0) healFlat(ctx, u, Math.round(u.maxHp * 0.05), { silent: 1 });
    let n;
    if (u.side === "e") n = u.actions || 1;
    else { const fastest = Math.max(1, ...ctx.foes.filter(f => f.alive).map(f => eff(f, "spd"))); n = 2 + (eff(u, "spd") >= 2 * fastest ? 1 : 0); }
    if (u.st.shock && chance(0.12 * u.st.shock.n)) { n -= 1; ctx.ev.push({ t: "say", text: u.name + " is jolted and loses an action!" }); }
    if (u.loseAct) { n -= u.loseAct; u.loseAct = 0; ctx.ev.push({ t: "say", text: u.name + " loses an action." }); }
    return Math.max(0, n);
  }
  function endTurn(ctx, u) {
    if (u.alive) {
      DOTS.forEach(d => u.alive && u.st[d] && tickOne(ctx, u, d));
      const hot = getBuff(u, "hot");
      if (hot && u.alive) { const v = Math.min(u.maxHp - u.hp, hot.val); u.hp += v; if (v) ctx.ev.push({ t: "heal", tgt: u, v }); }
      if (u.tails > 0 && u.alive) { u.tails--; for (let i = 0; i < 3; i++) { const low = ctx.team(u).filter(a => a.alive).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0]; if (low) heal(ctx, u, low, 0.5); } }
      if (u.ablaze > 0 && u.alive) { const v = Math.max(1, Math.round(u.maxHp * 0.03)); u.hp = Math.max(1, u.hp - v); ctx.ev.push({ t: "selfDmg", tgt: u, v }); }
      if (u.side === "e" && u.broken) { u.broken--; if (!u.broken) ctx.ev.push({ t: "say", text: u.name + " recovers from the break." }); }
    }
    u.stoneSkin = 0; u.usedItem = false;
  }
  function endRound(ctx) {
    const all = ctx.party.concat(ctx.foes);
    all.forEach(x => {
      if (!x.alive) return;
      x.buffs.forEach(b => { if (b.turns < 50) b.turns--; }); x.buffs = x.buffs.filter(b => b.turns > 0);
      Object.keys(x.st).forEach(k => { if (k === "stun" || k === "freeze") return; const s = x.st[k]; s.t--; if (s.t <= 0) { delete x.st[k]; } });
      if (x.st.petrify) { const p = x.st.petrify; delete x.st.petrify; p.n++; p.t = 3; if (p.n >= 3) { addStatus(ctx, null, x, "stun", 1, { sure: 1 }); } else { x.st.petrify = p; addBuff(x, "atk", -0.1 * p.n, 2, { force: 1 }); addBuff(x, "pow", -0.1 * p.n, 2, { force: 1 }); addBuff(x, "spd", -0.1 * p.n, 2, { force: 1 }); } }
      if (x.noBuff > 0) x.noBuff--; if (x.shieldDown > 0) x.shieldDown--; if (x.moss > 0) x.moss--; if (x.rooted > 0) x.rooted--; if (x.terrorOn > 0) x.terrorOn--; if (x.ablaze > 0) x.ablaze--;
      if (x.notes > 0 && !x.notesBy) x.notes = 0;
      if (x.gallop) { x.gallop.t--; if (x.gallop.t <= 0) x.gallop = null; }
      if (x.grudge) { x.grudge.t--; if (x.grudge.t <= 0) x.grudge = null; }
      if (x.runes) { x.runes.t--; if (x.runes.t <= 0) { const n = x.runes.n; x.runes = null; if (n) { ctx.opp(x).filter(f => f.alive).forEach(f => damage(ctx, x, f, 0.5 * n, "phys", { aoe: true, noReact: 1 })); say(ctx, "The runes burst!"); } } }
      if (x.omen) { x.omen.t--; if (x.omen.t <= 0) { const o = x.omen; x.omen = null; say(ctx, "The omen comes true!"); for (let i = 0; i < 3; i++) DOTS.forEach(d => x.alive && x.st[d] && tickOne(ctx, x, d, "OMEN")); } }
    });
    ctx.party.forEach(p => { if (p.rise) { p.rise = false; p.alive = true; p.hp = Math.round(p.maxHp * 0.25); p.st = {}; p.buffs = []; ctx.ev.push({ t: "revive", tgt: p, text: p.name + " rises from the ashes!" }); } });
    ctx.telegraph = ctx.foes.find(f => f.alive && f.charging) || null;
  }
  const outcome = ctx => (!ctx.foes.some(f => f.alive) ? "win" : !ctx.party.some(p => p.alive) ? "lose" : null);

  // ---------- enemy turn ----------
  function cond(ctx, e, a) {
    if (!a.if) return true;
    return a.if.split("&").every(c => {
      const [k, v] = c.split(":");
      if (k === "first") return !e.usedFirst;
      if (k === "every") return ctx.round % (+v) === 0;
      if (k === "alone") return ctx.foes.filter(f => f.alive).length === 1;
      if (k === "hasAlly") return ctx.foes.some(f => f.alive && f !== e) && !e.rallied;
      if (k.startsWith("hp<")) return e.hp / e.maxHp < +k.slice(3);
      if (k.startsWith("hp>")) return e.hp / e.maxHp > +k.slice(3);
      return true;
    });
  }
  function pickTarget(ctx, e, a, targets) {
    let t;
    const taunt = targets.filter(x => hasBuff(x, "taunt"));
    if (taunt.length && !a.aoe) t = pick(taunt);
    else if (a.tgt === "weak") t = targets.slice().sort((x, y) => x.hp / x.maxHp - y.hp / y.maxHp)[0];
    else if (a.tgt === "front") t = ctx.party.find(x => x.alive) || targets[0];
    else if (a.tgt === "frail") t = targets.slice().sort((x, y) => eff(x, "def") - eff(y, "def"))[0];
    else if (a.tgt === "strong") t = targets.slice().sort((x, y) => eff(y, "atk") + eff(y, "pow") - eff(x, "atk") - eff(x, "pow"))[0];
    else {
      let pool = targets; if (a.st) { const fresh = targets.filter(x => !x.st[a.st[0]]); if (fresh.length) pool = fresh; }
      t = chance(0.4) ? pool.slice().sort((x, y) => x.hp / x.maxHp - y.hp / y.maxHp)[0] : pick(pool);
    }
    const cv = getBuff(t, "cover"); if (cv && cv.by && cv.by.alive && cv.by !== t) { t = cv.by; ctx.lastRedirect = t; }
    return t;
  }
  function execAb(ctx, e, a, targets, big) {
    const ev = ctx.ev; e.usedFirst = true; ctx.lastRedirect = null;
    if (!targets.length) return;
    const kind = a.k || "phys", el = a.el || null;
    const strong = !!(big || a.big);
    if (a.if === "hasAlly" || (a.if && a.if.includes("hasAlly"))) e.rallied = true;
    let tgt = (a.p || a.db) && !a.aoe ? pickTarget(ctx, e, a, targets) : null;
    ev.push({ t: "use", src: e, move: a.n, big: !!big, tgt: tgt || undefined, el, enemy: true });
    if (e.terrorOn > 0 && strong) { const v = Math.max(1, Math.round(e.maxHp * 0.05)); e.hp = Math.max(1, e.hp - v); ev.push({ t: "selfDmg", tgt: e, v }); }
    if (a.self) hold(e, e, a.self[0], a.self[1]);
    if (a.ally) ctx.foes.filter(f => f.alive).forEach(f => { addBuff(f, a.ally[0], a.ally[1], a.ally[2], { force: 1 }); ev.push({ t: "buff", tgt: f, stat: a.ally[0], val: a.ally[1] }); });
    if (a.ally) say(ctx, e.name + " rallies the line!");
    if (a.p) {
      const list = a.aoe ? targets : [tgt];
      list.forEach(t => {
        if (!t.alive) return;
        let total = 0;
        for (let h = 0, n = a.hits || 1; h < n && t.alive; h++) total += damage(ctx, e, t, a.p, kind, { el, aoe: !!a.aoe, enemy: 1, strongHit: strong, noReact: 0 });
        if (a.drain && total) healFlat(ctx, e, Math.round(total * a.drain), { silent: 1 });
        if (t.alive && a.st) addStatus(ctx, e, t, a.st[0], a.st[1], { chance: a.st[2] });
        if (t.alive && a.db) debuff(ctx, e, t, a.db[0], a.db[1], a.db[2]);
      });
    } else if (a.db && tgt) debuff(ctx, e, tgt, a.db[0], a.db[1], a.db[2]);
  }
  function enemyAct(ctx, e) {
    if (!e.alive || e.endedTurn) return;
    const targets = ctx.party.filter(f => f.alive);
    if (!targets.length) return;
    if (e.charging) {
      const ab = e.charging; e.charging = null; ctx.telegraph = ctx.foes.find(f => f.alive && f.charging) || null;
      execAb(ctx, e, ab, targets, true); return;
    }
    if (e.bigEvery && ctx.round % e.bigEvery === 0 && e.lastBigRound !== ctx.round) {
      const ab = { n: e.bigName || "Crushing Blow", p: e.bigHit, aoe: !e.bigSingle, big: true, k: "phys" };
      e.charging = ab; e.lastBigRound = ctx.round; e.endedTurn = true; ctx.telegraph = e;
      ctx.ev.push({ t: "telegraph", src: e, move: ab.n, text: e.name + " gathers its strength... " + ab.n + " is coming!" });
      return;
    }
    const list = (e.ab || []).filter(a => cond(ctx, e, a));
    let tot = sum(list.map(a => a.w || 1)), r = rnd() * tot, a = list[0];
    for (const x of list) { r -= x.w || 1; if (r <= 0) { a = x; break; } }
    if (!a) return;
    execAb(ctx, e, a, targets, false);
  }


  // ---------- items ----------
  function useItem(ctx, u, itemId, target) {
    const it = ITEMS[itemId]; if (!it) return;
    ctx.ev.push({ t: "use", src: u, move: it.name, item: true, tgt: target });
    u.usedItem = true;
    if (itemId === "potion") healFlat(ctx, target, Math.round(target.maxHp * 0.25), { silent: 1 });
    else if (itemId === "antidote") cleanse(ctx, target, 0);
    else if (itemId === "ashenEmber") revive(ctx, target, 0.3);
  }
  function usePotion(ctx, u, target) { useItem(ctx, u, "potion", target); }

  // ---------- encounters ----------
  const T = (foes, weight, a, b) => ({ foes, weight, level: [a, b === undefined ? a : b] });
  const ENCOUNTERS = {
    undercroft: [T(["pipeSlug"], 3, 1, 2), T(["inkImp"], 3, 1, 2), T(["dustWisp"], 3, 1, 2), T(["cellarRatKing"], 2, 1, 2), T(["gelatinCubeMimic"], 1, 2), T(["inkImp", "inkImp"], 2, 1), T(["dustWisp", "pipeSlug"], 2, 1, 2), T(["dustWisp", "dustWisp", "inkImp"], 1, 1, 2)],
    dunes: [T(["sandstitchJackal"], 3, 2, 4), T(["glassAdder"], 3, 2, 4), T(["dustwingImp"], 2, 2, 4), T(["mirageCat"], 2, 3, 4), T(["sandstitchJackal", "sandstitchJackal"], 3, 2, 3), T(["sandstitchJackal", "sandstitchJackal", "glassAdder"], 2, 3, 4),
      T(["dustwingImp", "dustwingImp"], 1, 2, 3), T(["raidShieldbearer", "raidSlinger"], 2, 3, 4), T(["raidSlinger", "raidSlinger"], 1, 3, 4)],
    cistern: [T(["dripWraith"], 3, 3, 5), T(["boneCrab"], 3, 3, 5), T(["cisternEel"], 3, 3, 5), T(["mossGolem"], 2, 4, 5), T(["raidTorchbearer"], 2, 4, 5), T(["cisternEel", "cisternEel"], 2, 3, 4),
      T(["boneCrab", "dripWraith"], 2, 4, 5), T(["raidTorchbearer", "raidShieldbearer", "raidSlinger"], 2, 4, 5)],
    basin: [T(["cinderlizardHound"], 3, 5, 7), T(["duneScorpionKnight"], 3, 5, 7), T(["sunScarabSwarm"], 3, 5, 7), T(["saltHarpy"], 3, 5, 7), T(["dustSphinxCub"], 3, 5, 7), T(["raidSpearman", "raidArcher"], 2, 5, 7),
      T(["sandstitchJackal", "sandstitchJackal", "sandstitchJackal"], 1, 4, 5), T(["saltHarpy", "saltHarpy"], 1, 5, 6), T(["raidSpearman", "raidArcher", "raidShieldbearer"], 2, 6, 7)],
    quarry: [T(["quarryboundGargoyle"], 3, 6, 8), T(["slagImp"], 3, 6, 8), T(["basaltSkin"], 3, 6, 8), T(["mirrorBeetle"], 2, 6, 8), T(["duneScorpionKnight"], 2, 6, 8), T(["slagImp", "slagImp"], 2, 6, 7),
      T(["basaltSkin", "slagImp"], 2, 7, 8), T(["emberScorpion", "slagImp"], 1, 7, 8)],
    flats: [T(["cinderlizardHound"], 3, 7, 9), T(["emberScorpion"], 3, 7, 9), T(["slagImp"], 2, 7, 9), T(["cinderlizardHound", "cinderlizardHound"], 2, 7, 8), T(["emberScorpion", "slagImp", "slagImp"], 1, 7, 8), T(["saltHarpy", "emberScorpion"], 1, 7, 9)],
    boneMaze: [T(["mazeBat"], 3, 7, 9), T(["boneBullCalf"], 3, 7, 9), T(["mazeBat", "mazeBat"], 2, 7, 8), T(["boneBullCalf", "mazeBat"], 2, 7, 9), T(["mazeBat", "mazeBat", "mazeBat"], 1, 7, 8), T(["basaltSkin", "boneBullCalf"], 1, 8, 9)],
    hollow: [T(["quarryboundGargoyle"], 2, 8, 10), T(["basaltSkin"], 2, 8, 10), T(["mirrorBeetle"], 2, 8, 10), T(["emberScorpion"], 2, 8, 10), T(["raidSpearman", "raidArcher", "raidTorchbearer"], 2, 8, 10), T(["mirrorBeetle", "quarryboundGargoyle"], 1, 8, 9)],
  };
  function makeFoes(ids, level) {
    const dup = {}; ids.forEach(i => (dup[i] = (dup[i] || 0) + 1)); const seen = {};
    return ids.map(i => { seen[i] = (seen[i] || 0) + 1; return makeEnemy(i, level, dup[i] > 1 ? " " + "ABC"[seen[i] - 1] : ""); });
  }
  function rollEncounterSpec(tableId) {
    const tab = ENCOUNTERS[tableId]; if (!tab) return null;
    let r = rnd() * sum(tab.map(e => e.weight)), e = tab[0];
    for (const x of tab) { r -= x.weight; if (r <= 0) { e = x; break; } }
    return { foes: e.foes.slice(), level: e.level[0] + Math.floor(rnd() * (e.level[1] - e.level[0] + 1)) };
  }
  function rollEncounter(tableId) { const s = rollEncounterSpec(tableId); return s ? makeFoes(s.foes, s.level) : []; }
  // karvan + 2 shieldbearers
  function karvanFight(level = 5) { return [makeEnemy("raidOptioKarvan", level), makeEnemy("raidShieldbearer", level, " A"), makeEnemy("raidShieldbearer", level, " B")]; }
  function rewards(foes) {
    let xp = 0, kakal = 0; const drops = {};
    foes.forEach(f => { xp += f.xp || 0; kakal += f.kakal || 0; (f.drops || []).forEach(([id, p]) => { if (chance(p)) drops[id] = (drops[id] || 0) + 1; }); });
    return { xp, kakal, gold: kakal, drops };
  }

  // ---------- auto-play AI (the Auto button and the headless tests) ----------
  function focus(ctx, u, id) {
    const m = id ? MOVES[id] : null, el = m ? (m.el === "self" ? u.element : m.el) : u.element;
    const foes = ctx.foes.filter(f => f.alive); let best = foes[0], bs = 1e9;
    foes.forEach(f => {
      let mult = elemMult(f, el);
      if ((!m || m.kind === "phys") && f.pr) mult *= 1 - f.pr;
      if (m && m.kind === "spell" && f.reflect && f.reflect.includes(el)) mult *= 0.15;
      if (f.swarm && m && m.target === "enemy") mult *= 0.75;
      if (f.coverBy && foes.some(x => x !== f && x.id === f.coverBy)) mult *= 0.5;
      if (f.broken) mult *= 1.5; else if (f.frontShield) mult *= 1 - f.frontShield;
      const s = f.hp / Math.max(0.05, mult);
      if (s < bs) { bs = s; best = f; }
    });
    return best;
  }
  const dotCount = f => DOTS.reduce((s, d) => s + (f.st[d] ? f.st[d].n : 0), 0);
  const canStatus = (f, s) => !(f.immune && f.immune.includes(s));
  function autoPersonal(ctx, u, S) {
    const id = CREATURES[u.id] && CREATURES[u.id].personal; if (!id || !S.ok(id)) return null;
    const { foe, lowest, avg, tele, team, foes } = S, mk = (t, opt) => ({ move: id, target: t, opt });
    switch (id) {
      case "twoHeads": return mk(foe, foe.breakType === "impact" && !foe.broken ? "bull" : "goat");
      case "erodingRune": return !u.runes && (tele || foes.length > 1) ? mk(u) : null;
      case "nineTails": return !u.tails && avg < 0.8 ? mk(u) : null;
      case "grudgeBite": return !u.grudge && foe.boss ? mk(foe) : null;
      case "cuttingRemark": return debuffCount(foe) > 0 ? mk(foe) : null;
      case "gateClimb": return mk(foe);
      case "smotheringMoss": return !foe.moss && dotCount(foe) >= 3 ? mk(foe) : null;
      case "unheardApproach": return foe.boss && !u.unheard && (S.ok("stoneGaze") || S.ok("coil")) ? mk(u) : null;
      case "goldenFleece": return lowest.hp / lowest.maxHp < 0.4 && u.hp / u.maxHp > 0.4 && lowest !== u ? mk(lowest) : null;
      case "jokersGambit": return mk(foe);
      case "staticGallop": return !u.gallop && S.ok("thunderclap") ? mk(u) : null;
      case "houndsAtTheGate": return lowest.hp / lowest.maxHp < 0.6 && lowest !== u ? mk(lowest) : null;
      case "serpentSpout": return !foe.st.wet ? mk(foe) : null;
      case "nidhoggGnaw": return foe.boss && foe.st.poison ? mk(foe) : null;
      case "creepingStone": return foe.boss && !foe.st.petrify ? mk(foe) : null;
      case "ammitsFeast": return u.hp / u.maxHp < 0.7 || foe.broken ? mk(foe) : null;
      case "featherCushion": return lowest.hp / lowest.maxHp < 0.6 ? mk(foe) : null;
      case "dirtyLaundry": return debuffCount(foe) >= 2 ? mk(foe) : null;
      case "plantThePillar": return tele ? mk(u) : null;
      case "sunAscending": return avg < 0.75 && !team.some(a => a.sun) ? mk(u) : null;
      case "tipTheBowl": return !foe.st.wet ? mk(foe) : null;
      case "spontaneousCombustion": return !u.ablaze && S.ok("searingBreath") ? mk(u) : null;
      case "misleadingLight": return lowest.hp / lowest.maxHp < 0.45 && lowest !== u && u.hp / u.maxHp > 0.5 ? mk(u) : null;
      case "devouringWhirl": return Object.keys(foe.st).length >= 2 ? mk(foe) : null;
      case "silverLining": return lowest.hp / lowest.maxHp < 0.55 ? mk(lowest) : null;
      case "fallingDust": return avg < 0.8 && !team.some(a => hasBuff(a, "dust")) ? mk(u) : null;
      case "moonlitAntlers": return !hasBuff(u, "antlers") && team.some(a => a.style === "phoenix") ? mk(u) : null;
      case "takeRoot": return u.hp / u.maxHp < 0.6 && !u.rooted ? mk(u) : null;
      case "sealedLetters": return foe.notes ? null : mk(foe);
      case "keeningOmen": return foe.boss && dotCount(foe) >= 3 && !foe.omen ? mk(foe) : null;
      case "redHotBronze": return !hasBuff(u, "redHot") ? mk(u) : null;
      case "lamentOfThePod": return lowest.lastHit > lowest.maxHp * 0.15 && lowest.hp / lowest.maxHp < 0.7 ? mk(lowest) : null;
      case "lightTheHearth": return !ctx.hearth.p && (foe.boss || foes.length > 1) ? mk(u) : null;
      case "nightTerror": return foe.boss && tele && !foe.terrorOn ? mk(foe) : null;
      case "moodScales": return tele ? mk(u, foe.elementHint || u.element) : null;
      case "dreamEater": { const t = team.find(a => Object.keys(a.st).length); return t ? mk(t) : null; }
    }
    return null;
  }
  function autoChoice(ctx, u) {
    const mv = movesOf(u), foes = ctx.foes.filter(f => f.alive), team = ctx.party.filter(a => a.alive);
    const ok = id => mv.includes(id) && canUse(ctx, u, id);
    const lowest = team.slice().sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
    const avg = team.reduce((s, a) => s + a.hp / a.maxHp, 0) / team.length;
    const tele = !!ctx.telegraph;
    const basic = mv.find(m => MOVES[m].basic);
    const foe = focus(ctx, u, basic);
    const S = { ok, foe, lowest, avg, tele, team, foes };
    const R = (move, target, opt) => ({ move, target: target === undefined ? foe : target, opt });
    const F = id => focus(ctx, u, id);
    const covered = f => hasBuff(f, "dr");
    const fresh = (f, s) => !f.st[s] && canStatus(f, s);
    // 1. try to break an enemy with a matching medium/strong move (any style, including the off-style slot)
    const breakable = foes.filter(f => f.breakType && !f.broken && (f.boss || f.hp / f.maxHp > 0.4));
    for (const f of breakable) {
      const mid = mv.filter(id => ok(id) && MOVES[id].mp >= 2 && ((MOVES[id].bk || []).includes(f.breakType) || ((MOVES[id].el === f.breakType) && MOVES[id].el))).sort((a, b) => MOVES[a].mp - MOVES[b].mp);
      if (mid.length && (f.breakPts > 0 || u.mp >= MOVES[mid[0]].mp)) {
        if (u.style === "phoenix" && lowest.hp / lowest.maxHp < 0.5) break;
        const best = f.breakType === "impact" && ok("skullCrush") ? "skullCrush" : mid[0];
        return R(best, f);
      }
    }
    const pers = autoPersonal(ctx, u, S);
    switch (u.style) {
      case "phoenix": {
        const down = team.length < ctx.party.length ? ctx.party.find(a => !a.alive && !a.rise) : null;
        if (down && ok("rebirth")) return R("rebirth", down);
        if (down && ok("revive")) return R("revive", down);
        const lr = lowest.hp / lowest.maxHp;
        if (avg < 0.6 && ok("healWave")) return R("healWave", u);
        if (lr < 0.5 && pers && pers.move !== "silverLining") { /* personal heals below */ }
        if (lr < 0.55 && ok("silverLining")) return R("silverLining", lowest);
        if (lr < 0.5 && ok("warmLight")) return R("warmLight", lowest);
        if (lr < 0.4 && ok("goldenFleece")) return R("goldenFleece", lowest);
        const dotted = team.find(a => DOT_CLEANSE.filter(k => a.st[k]).length >= 2 || (a.st.poison && a.st.poison.n >= 3));
        if (dotted && ok("cleansingFlame")) return R("cleansingFlame", dotted);
        if (tele && ok("flameWard") && !hasBuff(lowest, "shield")) return R("flameWard", lowest);
        if (pers && ["nineTails", "sunAscending", "fallingDust", "lightTheHearth", "lamentOfThePod", "moonlitAntlers"].includes(pers.move)) return pers;
        if (lr < 0.75 && !hasBuff(lowest, "hot") && ok("rejuvenate")) return R("rejuvenate", lowest);
        if (avg > 0.85 && u.mp >= 5 && ok("sunfire")) return R("sunfire", F("sunfire"));
        if (pers && pers.move === "sealedLetters") return pers;
        return R(basic, F(basic));
      }
      case "colossus": {
        const p2 = autoPersonal(ctx, u, S);
        if (tele && ok("shieldWall") && !team.some(a => hasBuff(a, "dr"))) return R("shieldWall", u);
        if (tele && p2 && p2.move === "plantThePillar") return p2;
        const hurt = team.find(a => a !== u && a.hp / a.maxHp < 0.45);
        if (hurt && ok("bulwark") && !team.some(a => hasBuff(a, "cover"))) return R("bulwark", hurt);
        if (!hasBuff(u, "taunt") && ok("challenge") && (foe.boss || foes.length === 1) && team.length > 1) return R("challenge", u);
        if (p2 && ["erodingRune", "serpentSpout", "redHotBronze", "plantThePillar"].includes(p2.move) && u.mp >= 3) return p2;
        if (!hasBuff(u, "def") && ok("fortify") && (foe.boss || tele)) return R("fortify", u);
        if (foes.length > 1 && ok("earthshaker")) return R("earthshaker", u);
        if (foe.broken && ok("crushWeight")) return R("crushWeight", F("crushWeight"));
        if (u.mp >= 5 && ok("crushWeight")) return R("crushWeight", F("crushWeight"));
        if (u.mp >= 6 && ok("counterSt") && !hasBuff(u, "counter")) return R("counterSt", u);
        return R(basic, F(basic));
      }
      case "minotaur": {
        if (foe.broken || (foes.length === 1 && foe.hp / foe.maxHp < 0.25)) {
          if (u.hp / u.maxHp > 0.6 && ok("reckless")) return R("reckless", foe);
          if (ok("hoofStomp")) return R("hoofStomp", foe);
        }
        if (foes.length > 1 && ok("stampede")) return R("stampede", u);
        if (foes.length > 1 && ok("bullRush") && foe.actedRound !== ctx.round && foe.boss) return R("bullRush", foe);
        if (ok("skullCrush") && (foe.boss || foe.hp / foe.maxHp > 0.5)) return R("skullCrush", foe);
        if (ok("labCharge") && (u.mp >= 3 || (foe.breakType === "impact" && foe.breakPts > 0)) && foe.hp / foe.maxHp > 0.3) return R("labCharge", foe);
        if (!hasBuff(u, "atk") && ok("bloodrage") && u.hp / u.maxHp > 0.7 && foe.boss) return R("bloodrage", u);
        if (ok("bullRush") && foe.boss && foe.actedRound !== ctx.round && u.mp >= 3) return R("bullRush", foe);
        if (pers) return pers;
        if (u.mp >= 5 && ok("hoofStomp")) return R("hoofStomp", foe);
        return R(basic, F(basic));
      }
      case "harpy": {
        if (tele && ok("dive") && !u.diveReady) return R("dive", u);
        if (u.diveReady && ok("featherVolley")) return R("featherVolley", foe);
        if (foes.length > 1 && ok("cyclone")) return R("cyclone", u);
        const slowAlly = team.filter(a => a !== u && a.style !== "phoenix" && !hasBuff(a, "spd")).sort((a, b) => eff(a, "spd") - eff(b, "spd"))[0];
        if (slowAlly && ok("tailwind") && u.mp >= 4 && team.length > 2) return R("tailwind", slowAlly);
        if (ok("rend") && fresh(foe, "bleed") && (foe.boss || foe.hp / foe.maxHp > 0.5)) return R("rend", foe);
        if (ok("snatch") && foe.buffs.some(b => b.val > 0 && b.type !== "taunt")) return R("snatch", foe);
        if (pers) return pers;
        if (ok("featherVolley")) return R("featherVolley", foe);
        return R(basic, F(basic));
      }
      case "hydra": {
        const weak = foes.slice().sort((a, b) => b.hp - a.hp)[0];
        const t = foe.boss || foes.length === 1 ? foe : weak;
        if (u.hp / u.maxHp < 0.5 && ok("regrow") && !hasBuff(u, "hot")) return R("regrow", u);
        if (foes.length > 1 && ok("plagueCloud") && foes.some(f => fresh(f, "poison"))) return R("plagueCloud", u);
        if (t.st.bleed && t.st.bleed.n >= 3 && ok("rupture")) return R("rupture", t);
        if (dotCount(t) >= 5 && ok("fester")) return R("fester", t);
        if (ok("corrode") && !hasBuff(t, "sres") && t.boss) return R("corrode", t);
        if (ok("searingBreath") && fresh(t, "burn")) return R("searingBreath", t);
        if (ok("lacerate") && fresh(t, "bleed")) return R("lacerate", t);
        if (ok("toxicSpit") && fresh(t, "poison")) return R("toxicSpit", t);
        if (pers) return pers;
        if (ok("searingBreath") && u.mp >= 4) return R("searingBreath", t);
        if (ok("lacerate") && u.mp >= 4) return R("lacerate", t);
        if (ok("toxicSpit") && u.mp >= 2) return R("toxicSpit", t);
        return R(basic, F(basic));
      }
      case "gorgon": {
        const t = foe;
        if (tele && ok("stoneGaze")) { const c = foes.find(f => f.charging) || t; return R("stoneGaze", c); }
        if (ok("shatterShield") && (t.frontShield && !t.broken && !t.shieldDown || t.buffs.some(b => b.type === "shield"))) return R("shatterShield", t);
        if (ok("curseOfStone") && t.boss && t.buffs.some(b => b.val > 0)) return R("curseOfStone", t);
        if (ok("venomMark") && !hasBuff(t, "res")) return R("venomMark", t);
        if (ok("hiss") && !hasBuff(t, "atk") && (t.boss || t.hp / t.maxHp > 0.5)) return R("hiss", t);
        if (ok("crackArmour") && !hasBuff(t, "def") && (t.boss || t.hp / t.maxHp > 0.5)) return R("crackArmour", t);
        if (ok("petrifyingGaze") && !hasBuff(t, "spd") && t.boss) return R("petrifyingGaze", t);
        if (ok("coil") && t.boss && (t.actions || 1) > 1 && !t.loseAct) return R("coil", t);
        if (pers) return pers;
        if (ok("hiss") && u.mp >= 3 && !hasBuff(t, "atk")) return R("hiss", t);
        return R(basic, F(basic));
      }
      case "dragon": {
        const t = foe;
        if (foes.length > 1 && ok("inferno") && u.mp >= 3) return R("inferno", u);
        if (foes.length > 1 && ok("blizzard") && u.mp >= 3) return R("blizzard", u);
        const marks = (t.st.burn ? t.st.burn.n : 0) + (t.st.chill ? t.st.chill.n : 0) + (t.st.shock ? t.st.shock.n : 0) + (t.st.wet ? 1 : 0);
        if (marks >= 4 && ok("detonate")) return R("detonate", t);
        const wetOk = !(t.reflect && t.reflect.includes("shock"));
        if (t.st.wet && wetOk && ok("thunderclap")) return R("thunderclap", t);
        if (t.st.wet && !t.st.burn && ok("frostBreath") && elemMult(t, "ice") >= 0.9) return R("frostBreath", t);
        const knows = id => mv.includes(id);
        if (!t.st.wet && !t.st.burn && ok("torrent") && elemMult(t, "water") >= 0.7 && (knows("thunderclap") && wetOk || knows("frostBreath"))) return R("torrent", t);
        if (t.st.wet && !t.st.burn && (knows("thunderclap") || knows("frostBreath")) && u.mp < 2) return R(basic, F(basic));   // keep the wet target: save up MP for the follow-up
        if (pers && ["gateClimb", "staticGallop", "moodScales", "misleadingLight"].includes(pers.move)) return pers;
        const opts = ["ember", "frostBreath", "thunderclap", "torrent"].filter(ok).map(id => ({ id, v: MOVES[id].p * elemMult(t, MOVES[id].el) * (t.reflect && t.reflect.includes(MOVES[id].el) ? 0.1 : 1) / MOVES[id].mp })).sort((a, b) => b.v - a.v);
        if (u.mp >= 2 && opts.length) return R(opts[0].id, t);
        if (ok("attune") && u.lastEl && u.mp >= 4) return R("attune", u);
        if (ok("ember") && u.mp >= 1) return R("ember", t);
        return R(basic, F(basic));
      }
      case "leviathan": {
        const big = foes.slice().sort((a, b) => b.hp - a.hp)[0];
        const need = foes.length === 1 && foe.hp / foe.maxHp < 0.3 ? 2 : 3;
        if (tele && ok("braceDeep") && !hasBuff(u, "braceDeep")) return R("braceDeep", u);
        if (foes.length > 1 && u.tide >= need && ok("tidalWave")) return R("tidalWave", u);
        if (u.tide >= need && ok("maelstrom")) return R("maelstrom", foe.boss ? foe : F("maelstrom"));
        if (u.tide >= 5 && ok("tidalWave")) return R("tidalWave", u);
        if (pers) return pers;
        if (ok("swell") && u.tide <= 2 && !hasBuff(u, "swell") && u.mp >= 5) return R("swell", u);
        if (ok("deepBreath") && u.tide <= 3 && u.mp >= 4) return R("deepBreath", u);
        if (ok("riptide") && foe.boss && foe.actedRound !== ctx.round && u.mp >= 4) return R("riptide", foe);
        if (ok("undertow") && u.mp >= 5 && u.tide < 5) return R("undertow", foe);
        return R(basic, F(basic));
      }
    }
    return R(basic, foe);
  }
  // potions and other items for the Auto button and the tests; items = { potion: n, antidote: n, ashenEmber: n }
  function autoItem(ctx, u, items) {
    if (u.usedItem || !items) return null;
    const team = ctx.party.filter(a => a.alive), worst = team.slice().sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
    if (items.ashenEmber > 0 && ctx.party.some(a => !a.alive && !a.rise) && !movesOf(u).includes("rebirth")) return { item: "ashenEmber", target: ctx.party.find(a => !a.alive && !a.rise) };
    const healer = team.some(a => a.style === "phoenix" && a.mp >= 1);
    if (items.potion > 0 && worst.hp / worst.maxHp < (healer ? 0.3 : 0.4) && !(u.style === "phoenix" && worst.hp / worst.maxHp > 0.2)) return { item: "potion", target: worst };
    if (items.antidote > 0) { const sick = team.find(a => (a.st.poison && a.st.poison.n >= 3) || (a.st.burn && a.st.burn.n >= 3) || (a.st.bleed && a.st.bleed.n >= 3)); if (sick && sick.hp / sick.maxHp < 0.6 && !movesOf(u).includes("cleansingFlame")) return { item: "antidote", target: sick }; }
    return null;
  }

  // ---------- XP and levelling ----------
  // XP: every creature in the party gets full XP (also fallen ones). Returns level-up events.
  function giveXp(party, xp) {
    const ups = [];
    party.forEach(u => {
      u.xp += xp;
      while (u.xp >= xpToNext(u.level)) {
        u.xp -= xpToNext(u.level); u.level++; u.points = (u.points || 0) + POINTS_PER_LEVEL;
        const before = u.maxHp; u.maxHp = maxHpOf(u.stats, u.level); u.hp += u.maxHp - before;
        const c = CREATURES[u.id];
        const learned = STYLE_MOVES[u.style].filter(m => MOVES[m].lvl === u.level).concat(c && c.personal && MOVES[c.personal].lvl === u.level ? [c.personal] : []).map(m => MOVES[m].name);
        ups.push({ u, level: u.level, learned });
      }
    });
    return ups;
  }
  function spendPoint(u, stat) {
    if (!u.points) return false;
    u.points--; u.stats[stat]++;
    if (stat === "hp") { const before = u.maxHp; u.maxHp = maxHpOf(u.stats, u.level); u.hp += u.maxHp - before; }
    return true;
  }
  // for the UI: readable status and buff lists on a unit
  function statusList(u) {
    const out = Object.keys(u.st).map(k => ({ type: k, name: STATUS[k] ? STATUS[k].name : k, n: u.st[k].n, turns: u.st[k].t }));
    if (u.tide) out.push({ type: "tide", name: "Tide", n: u.tide });
    u.buffs.forEach(b => { if (["wrathStore", "swell", "stunImmune", "hounds", "cover", "decoy", "antlers", "dust", "braceDeep", "counter", "redHot"].includes(b.type) || b.type.startsWith("ward_")) out.push({ type: b.type, name: b.type, n: 0, turns: b.turns < 50 ? b.turns : 0, buff: true }); else out.push({ type: b.type, name: b.type, n: 0, val: b.val, turns: b.turns < 50 ? b.turns : 0, buff: true }); });
    return out;
  }

  const Core = { STATS, STAT_NAMES, STYLES, STYLE_WEIGHTS, CREATURES, PACKS, LAB_EXTRAS, MOVES, STYLE_MOVES, ENEMIES, ENEMY_PROFILES, ENCOUNTERS, SKILLBOOK, ITEMS, MATERIALS, STATUS,
    makeCreature, makeEnemy, makeFoes, rollEncounter, rollEncounterSpec, karvanFight, rewards, movesOf, setOffMove, isOffStyle, mpCost, canUse, newBattle, useMove, useItem, usePotion, enemyAct,
    turnOrder, actionsFor, endTurn, endRound, outcome, autoChoice, autoItem, focus, giveXp, spendPoint, xpToNext, eff, hasBuff, buffVal, maxHpOf, statusList, elemMult, spread };
  if (typeof module !== "undefined") module.exports = Core; else root.Core = Core;
})(typeof window !== "undefined" ? window : globalThis);
