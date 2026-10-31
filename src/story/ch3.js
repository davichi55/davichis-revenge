// Chapter 3 script, Into the Jungle (owner: STORY-M2): Creeping Shore, Tamar's Landing, Silt River, Ninefold Ferry, Greenmaw Jungle, Redroot Camp, Fort Ocelan, Coil Hill, Boiling Pools.
// Registers Data tables, Story.talk/trigger/chest/gather handlers, Story.begin[3], Story.start[3], Story.finish[3]. Also the shared helpers for chapters 3-4: Story.generalScene, Story.makeGeneral, Story.rum, Story.gearChest2.
// Spec: ../game-mechanics/specs/M2.md. Voices: ../game-mechanics/STORY_BIBLE.md. Hero thoughts are in parentheses. Nobody explains menus; hints travel as rumours.
"use strict";
(function () {
  const S = window.Story, Q = Object.assign;
  S.begin = S.begin || {}; S.done = S.done || {}; S.legend = S.legend || {};
  const M = S.m2 = S.m2 || {};
  // ---------- speakers (portraits come from assets/portraits/<id>.png; the fallback is a stand-in) ----------
  const person = (id, name, fb, art) => UI.person(id, name, ["assets/portraits/" + (art || id) + ".png", fb || "assets/face_scholar.png"]);
  [["kessa", "Kessa Vorn"], ["dorrin", "Dorrin Hale"], ["mayle", "Mayle Tarn"], ["tahlen", "Tahlen Orrow"], ["oma", "Oma Wren"], ["itzel", "Itzel Coyo"], ["centurion", "Centurion Varro Toric"],
    ["optio", "Optio"], ["collarsmith", "Collarsmith"], ["overseer", "Overseer"], ["priest", "Acolyte"], ["slave", "Worker"], ["child", "Child"], ["ferryman", "Ferryman"], ["fisher", "Fisher"],
    ["guard", "Guard"], ["tribune", "Tribune"]].forEach(([id, nm]) => person(id, nm));
  [["netmender", "Net-mender", "weaver"], ["ferryboy", "Ferry-boy", "child"], ["pip", "Pip", "child"], ["stallwoman", "Stall-woman", "innkeeper"], ["runaway", "Runaway", "slave"], ["healer", "Healer", "weaver"],
    ["oldguard", "Old guard", "guard"], ["shrinekeeper", "Shrine-keeper", "priest"], ["prisoner", "Prisoner", "slave"], ["bather", "Old bather", "wellwoman"], ["legionary", "Legionary", "soldier"],
    ["worker", "Worker", "slave"], ["boy", "Boy", "child"]].forEach(([id, nm, art]) => person(id, nm, null, art));
  UI.person("emberwick", "Emberwick", ["assets/portraits/emberwick.png", "assets/creatures/emberwick.png"]);
  UI.person("quillshade", "Quillshade", ["assets/portraits/quillshade.png", "assets/creatures/quillshade.png"]);
  const say = (who, text) => UI.say([[who, text]]), thought = text => UI.say([["hero", text]]);
  const rel = (c, dx, dy) => ({ x: Math.round(c.hero.x + dx), y: Math.round(c.hero.y + dy) });   // stage positions are relative to where the hero stands, so any map layout works
  M.say = say; M.thought = thought; M.rel = rel; M.person = person;

  // ---------- chapter state helpers ----------
  M.ensureCh = (F, n) => { if (G.ch < n) G.ch = n; if (!F.f("ch" + n + ".start")) F.set("ch" + n + ".start"); };
  M.gear = (F, set, n = 3) => F.giveGear(set, n, true);
  // a gear chest that gives one piece per visit and stays closed-looking (returns false to the engine) until the third piece
  S.gearChest2 = async (F, id, set, extra) => {
    F.visit = F.visit || {};
    if (F.visit[id]) { await UI.say([["narr", "The chest is empty."]]); return false; }
    F.visit[id] = true; F.sfx("door");
    const n = G.flags["gc." + id] || 0;
    if (extra) await extra(F, n);
    if (n < 3) {
      G.flags["gc." + id] = n + 1;
      const slot = Data.SLOTS.find(s => !F.owned(Data.pieceId(set, s))) || "helm";
      await UI.say([["narr", `You open the chest. Inside: ${Data.pieceName(Data.pieceId(set, slot))} (${Data.SETS[set].n}).`]]); F.giveGear(set, 1);
      return n + 1 < 3 ? false : undefined;
    }
    F.give("sunwater", 2); await UI.say([["narr", "Two Sunwater Flasks lie in the bottom of the chest."]]);
  };
  // a plain loot chest: opens once, gives gold and items
  M.loot = (flag, items, gold, text) => async F => {
    if (F.f(flag)) return false; F.set(flag); F.sfx("door");
    (items || []).forEach(([k, n]) => F.give(k, n, true)); if (gold) F.gold(gold, true);
    await UI.say([["narr", text]]);
    UI.toast([...(items || []).map(([k, n]) => `+${n} ${(Data.ITEMS[k] && Data.ITEMS[k].n) || (Data.MATS[k] && Data.MATS[k][0]) || k}`), gold ? `+${gold} kakal` : ""].filter(Boolean).join(", "), 2800);
  };
  // a gathering spot for a skill-book material; toasts when the tenth piece is held
  M.mat = (flag, mat, n, text, book, sfx) => async F => {
    if (F.f(flag)) return false; F.set(flag); const before = F.matCount(mat); F.give(mat, n); if (sfx !== false) F.sfx(sfx || "coin");
    await UI.say([["narr", text]]);
    if (book && before < 10 && F.matCount(mat) >= 10) UI.toast("New in the Skill Book: " + book + ".", 3200);
  };
  // a skill-book gathering spot in one call (chapters 6-12, SKILLBOOK agent): the handler S.gather[id] plus the hub-menu entry of region rid
  M.bookSpot = (rid, id, label, flag, mat, n, text, book) => {
    S.gather[id] = M.mat(flag, mat, n, text, book);
    const R = window.Data.REGIONS[rid]; if (R) R.things.push([id, label, s => !s.f[flag], "gather"]);
  };
  // a villager's rumour: told in full the first time, later visits alternate small talk and the rumour again
  const RUM_FX = M.rumFx = {};
  S.rum = async (F, town, idx, who, talk) => {
    const k = "rn." + town + idx, n = G.flags[k] || 0; G.flags[k] = n + 1;
    const tell = async () => { await S.rumourIdx(F, town, idx, who); F.sfx("menuOk"); if (RUM_FX[town + idx]) RUM_FX[town + idx](F); };
    if (n === 0 || !talk || !talk.length) return tell();
    const i = (n - 1) % (talk.length + 1);
    if (i === talk.length) return tell();
    await UI.say([[who, talk[i]]]);
  };
  const markBreak = id => { G.best[id] = Object.assign(G.best[id] || { seen: 0, beaten: 0 }, { breakKnown: true }); };
  M.markBreak = markBreak;
  // creature generals: a journal note per creature (survives save and load because the text lives in a flag)
  Object.keys(Data.GENERAL_STYLE || {}).forEach(id => {
    Object.defineProperty(Data.BEST, "gen_" + id, { enumerable: true, configurable: true, get: () => (window.G && G.flags && G.flags["gnote." + id]) || "A creature of the lab, collared by the Harvest Office and bent to the legions' will. It knows you." });
  });
  S.noteGeneral = (id, text) => { G.flags["gnote." + id] = text; };
  S.makeGeneral = (slot, level, o) => { const g = S.generalFor(slot); if (!g) return null; return Core.generalWithLines(g.id, level, Q({ slot }, o || {})); };

  // ---------- the creature-general scene (STORY_BIBLE 6): reveal, fight, break lines (genLines hook), the collar shatters, the creature leaves ----------
  // o = { level, soldiers: [[enemyId, level, tag]], bg, title, place, where, setup(c), banter, fx, fy, after: [lines] }  ->  true when the creature is freed
  S.generalScene = async (F, slot, o) => {
    const g = S.generalFor(slot); if (!g) return true;
    const L = S.generalLines(g.id);
    if (o.setup) await M.stage(o.setup, { music: o.stageMusic || "tension" });
    if (o.banter) await F.banter(o.banter);
    await Cinema.boss({ id: g.id, name: g.name, title: o.title || "General of the Legions", bg: o.bg, music: "general", lines: [[g.id, L.meet[0]], [g.id, L.meet[1]]] });
    const foes = [S.makeGeneral(slot, o.level)].concat((o.soldiers || []).map(([id, lv, tag]) => F.mkEnemy(id, lv, tag)));
    const res = await F.boss(foes, { bg: o.bg, music: "general", intro: g.name + ", collared and snarling, blocks the way." });
    if (res !== "win") return false;
    await M.stage(async c => {
      const p = rel(c, o.fx || 120, o.fy || -6); c.actor("gen", { art: g.id, x: p.x, y: p.y, scale: 1.3, flip: !!o.flip });
      c.tint("#1a0c08", 0.35, 400); c.sfx("hitHeavy"); c.shake(4, 500); c.flash("#ffe3a8", 380); c.fx("sparkle", p.x, p.y - 20, { ms: 2400, r: 46 }); await c.wait(900);
      c.sfx("break"); c.fx("explosion", p.x, p.y, { scale: 0.6, shake: 2 }); await c.wait(500);
      c.tint("#000000", 0, 800);
      await c.say([[g.id, L.freed[0]]]);
      const h = c.hero; await c.walk("gen", h.x + 36, h.y - 4, 900); c.face("gen", "right");
      await c.say([[g.id, L.freed[1]], [g.id, L.freed[2]]]);
      c.sfx("door"); await c.walk("gen", p.x + 520, p.y - 50, 3400); c.remove("gen");
      if (o.after) await c.say(o.after.map(t => ["hero", t]));
    }, { music: "farewell" });
    F.set("gen.freed." + slot); S.noteGeneral(g.id, "Freed at " + (o.place || "the altar") + ". " + (o.where || "It ran, and did not look back."));
    return true;
  };

  // ---------- items, materials, trade goods, skill-book rows ----------
  Q(Data.ITEMS, {
    keyK2: { n: "Windhollow Key", d: "A key of grey feather-stone from the Aviary. It opens a cell in the Menagerie Wagon.", key: true },
    lostKite: { n: "Pip's Red Kite", d: "A red paper kite, torn at one corner and cut free of the mangrove.", key: true },
    ocelanSeal: { n: "Ocelan Road Seal", d: "A bronze seal with the sun wheel of Fort Ocelan. Soldiers on the road look at it twice, then look elsewhere.", key: true },
    ledgerPage: { n: "Ledger Page: Lot 7", d: "\"Lot 7 (Academy stock). Received complete, as agreed. Signed, the Harvest Office.\" The numbering is the lab's.", key: true },
  });
  Q(Data.MATS, {
    riverPearl: ["River Pearl", "Small, round and faintly warm. The ferrymen float them in bowls of storm water."],
    steamstone: ["Steamstone", "A pink-grey stone from the Boiling Pools. It sinks in water and hisses."],
    galeDown: ["Gale Down", "A molted feather as light as a breath. The air bends around it."],
    gloomcapSpores: ["Gloomcap Spores", "Fine grey spores from the Sporeroot Caves. They glow when the room is quiet."],
  });
  Q(Data.GOODS, {
    basiliskCrest: ["Basilisk Crest", 20], antidoteReeds: ["Antidote Reeds", 12], pearlTear: ["Pearl Tear", 22], mothDust: ["Moth-Dust Vial", 18], bogStone: ["Bog Stone", 20], grayFeather: ["Grey Heron Feather", 22],
    glowShell: ["Glow Shell", 16], silverScale: ["Silver Scale", 18], hagWeed: ["Hag Weed", 14], gildedDust: ["Gilded Dust", 26], vineTail: ["Vine Tail", 18], greenPinion: ["Green Pinion", 16],
    satyrCap: ["Satyr Cap", 16], toucanBeak: ["Torch Beak", 22], nagaScale: ["Naga Scale", 24], kapokWool: ["Kapok Wool", 18], toadSkin: ["Toad Skin", 14], obsidianShard: ["Obsidian Shard", 30],
    lanternWick: ["Lantern Wick", 12], wyvernScale: ["Wyvern Scale", 30], spiderSilk: ["Spider-Silk Spool", 30], orchidPetal: ["Orchid Petal", 26], cloudWool: ["Cloud Wool", 28],
    eelGland: ["Eel Spark Gland", 28], caveChip: ["Cave Chip", 28], trollCap: ["Troll Cap", 26], mimicTooth: ["Mimic Tooth", 30], watcherFeather: ["Watcher Feather", 34], featherCloak: ["Feather Cloak Clasp", 28],
  });
  Q(Data.BOOK, {
    soak:       { n: "Soak", mat: "riverPearl", need: 10, d: "Cheap water move, 1 MP. Makes the target Wet.", move: "soak" },
    douse:      { n: "Steamstone Douse", mat: "steamstone", need: 10, d: "Water move, 2 MP. Makes the target Wet.", move: "douse" },
    dampenWing: { n: "Dampen Wing", mat: "galeDown", need: 10, d: "Slows the enemy for 2 turns, 2 MP. Counts toward slow breaks.", move: "dampenWing" },
    sporeCloud: { n: "Spore Cloud", mat: "gloomcapSpores", need: 10, d: "Poison on every enemy, 3 MP.", move: "sporeCloud" },
  });
  Data.BREAKS = Data.BREAKS || {};
  Q(Data.BREAKS, {
    fortCenturion: "Two heavy impact moves in a row break the shield wall.", shearwing: "Slow it twice and it cannot stay in the sky.", windhollowGuardian: "Slow it twice and the stone bird comes down.",
    plumedCoil: "Slow it twice in a row and it falls from the sky to the Spire's perch.", motherGlowmoth: "Two strong light moves in a row dim her.",
  });

  // ---------- quests, shops, inns, rumours (the rumour key is the region id, so the Journal prints the town's name) ----------
  Q(Data.QUESTS, {
    m_landing: { t: "Ixcalo", main: true, ch: 3, steps: ["Find the smugglers' village along the shore.", "Find a way along the river to Ninefold Ferry."] },
    m_pass: { t: "The Imperial Road", main: true, ch: 3, steps: ["The road east is held by Fort Ocelan.", "Get past Fort Ocelan. Three of Redroot's people are in its cells."] },
    m_coil: { t: "Coil Hill", main: true, ch: 3, steps: ["Past the fort the road climbs to Coil Hill. The Harvest Office is cutting a new pyramid there."] },
    kite: { t: "The Lost Kite", ch: 3, steps: ["Pip's red kite is snagged in the high mangrove by the wreck on Creeping Shore.", "Take the kite back to Pip."] },
    pearls: { t: "Snappers on the Ferry Lines", ch: 3, steps: ["Tahlen wants three Pearl-Backed Snappers cleared from the shallows. They bite the ferry lines (0/3).", "Tell Tahlen the lines are clear."] },
    steam: { t: "Steam for the Camp", ch: 3, steps: ["The healer at Redroot Camp wants to see six steamstones from the Boiling Pools, for burn salves."] },
  });
  const BASIC = ["sunwater", "antidote"], BOMBS = ["cinderBomb", "rimeFlask", "soakJar", "sparkJar", "venomPot"];
  const disc = (list, m) => { const d = {}; list.forEach(k => (d[k] = m)); return d; };
  Q(Data.SHOPS, {
    tamar: { n: "Tamar's smuggler counter", who: "merchant", stock: [...BASIC, "incense", "candle", ...BOMBS], disc: disc(BOMBS, 0.8), buys: 1.2 },
    ninefold: { n: "Ninefold market stalls", who: "merchant", stock: [...BASIC], buys: 1.0 },
    redroot: { n: "Redroot supply tent", who: "merchant", stock: [...BASIC, "tonic", "ember", ...BOMBS], disc: disc([...BASIC, "tonic", "ember", ...BOMBS], 0.9), buys: 1.0 },
  });
  Q(Data.INNS, { tamarsLanding: { n: "The Net and Lantern" }, ninefoldFerry: { n: "The Ninth Ferry" }, redrootCamp: { n: "The Hollow Log", mult: 0.5 } });
  Q(Data.RUMOURS, {
    tamarsLanding: ["\"The empire takes our tamers first. If you have a creature, hide it.\"", "\"A lone bird rules the western jungle, they say. It cuts anything flying below it.\"", "\"The ferrymen sing it: float a river pearl in a bowl of storm water, and you can learn to soak a foe.\""],
    ninefoldFerry: ["\"The Plumed Coil above the canopy hates slow things. The old riverfolk say it cannot stand a heavy wind pulled the wrong way.\"", "\"A fort stands where the road bends, full of shields.\"", "\"They cut a new pyramid at Coil Hill. On windy days the noise carries.\""],
    redrootCamp: ["\"They put collars on the creatures. Each collar is tied to an altar. The general is only the legion's face.\"", "\"The boiling pools hold stones that sink in water. Hot-spring stone teaches you to douse a fire.\"", "\"At night the lights in the cave go slow.\""],
  });
  RUM_FX.ninefoldFerry0 = () => {};   // the Coil's break is only half given here (the clue is vague on purpose); the Plume Rest rumour sets breakKnown

  // ---------- bestiary (apprentice voice: the behaviour that matters, then one thing you can see) ----------
  Q(Data.BEST, {
    mudbackBasilisk: "A crocodile with a rooster's crest, under a crust of river mud. Its breath poisons the whole party. Fire works.",
    riverSiren: "Half fish, half heron, all voice. Her song lowers Resistance, and she is brittle. Lightning drops her fast.",
    reedmoth: "A pale moth the size of a door. Its dust lowers everyone's Attack. Fire eats the wings.",
    bogTrollPup: "A stone-faced pup with moss for fur. Slow and tanky, warm to the touch. Cold makes it sluggish.",
    heronWraith: "A thin ghost bird in grey mist. Everyone is drawn to look at it, and blows slide off it. Lightning goes through.",
    pearlBackedSnapper: "A turtle with a pearl set in its shell. It bites, then pulls in its head. The pearls are worth the patience.",
    tideHag: "Seaweed, silt and a long cold hand. She drinks your Focus. Fire dries her out.",
    glowCrab: "A crab with a lantern for a shell. The flash slows you down; the claws are plain.",
    mangroveImp: "A small imp in a cage of roots. Fast, and its scratches bleed.",
    whisperfish: "A fish that whispers. Hear enough of it and your spells go quiet, or you stand there listening.",
    gildedTapirSprite: "A tapir with sphinx paws and gold dust on its flanks. Its stomps loosen your guard. Cold slows it.",
    vineChimera: "A lion, a goat and a vine for a tail. Fast, and the claws bleed. Fire works on the vine.",
    jungleHarpy: "Green and fast, and the molted feathers it drops are Gale Down.",
    sporeSatyr: "A goat-legged mushroom man. His spores poison everyone. Fire clears the air.",
    emberToucan: "A toucan whose beak is a torch. It burns what it pecks. Water ends it.",
    stranglerNaga: "A snake wrapped in roots. Its coil holds one creature helpless for a turn. Fire frightens it.",
    kapokTroll: "A hairy tree-troll with a branch for a club. Slow and tanky. It burns.",
    legionShieldbearer: "Tower shield, short sword. Physical blows slide off. Spells do not.",
    legionSpearman: "A spear held low. It hits the creature in front, and it braces when you charge.",
    legionArcher: "Shoots from behind the line, at whoever it likes.",
    legionOptio: "An officer. Every soldier near him hits harder. Take him first.",
    legionMarksman: "An archer in a feather cloak. He fires at the weakest creature, every time.",
    jaguarCohortElite: "Obsidian blade, spotted cloak, no fear. Fast and rare. They hit twice.",
    pyramidAcolyte: "A priest of the Harvest Office with an obsidian knife. His cuts bleed, and his rites weaken your Resistance.",
    steamSprite: "A wisp of steam in a tea-cup. It scalds. Cold shuts it up.",
    hotspringToad: "A plump toad that sits in the warm pools and mends itself. Shock hurts it.",
    kessaVorn: "A Tamer Corps cadet with a red scarf. Quick, proud, and she fights beside her creature.",
    emberwick: "A lion cub with a mane of candle-flame. It mends its tamer. It is shy.",
    dorrinHale: "Huge, cheerful, always chewing. He hits hard, and when he is hurt he eats.",
    mayleTarn: "Thin and quiet, with a little book. She writes down your weak spots and uses them.",
    fortCenturion: "The centurion of Fort Ocelan, behind a wall of shields. Two heavy blows in a row crack it.",
    shearwing: "A giant harpy with wings like shears. Slow it twice and it falls out of the sky.",
  });
  Q(Data.DROPS, {
    mudbackBasilisk: [["basiliskCrest", 0.5], ["antidoteReeds", 0.12]], riverSiren: [["pearlTear", 0.45]], reedmoth: [["mothDust", 0.5]], bogTrollPup: [["bogStone", 0.45]], heronWraith: [["grayFeather", 0.45]],
    pearlBackedSnapper: [["riverPearl", 0.25], ["curio", 0.3]], tideHag: [["hagWeed", 0.45], ["curio", 0.2]], glowCrab: [["glowShell", 0.5]], mangroveImp: [["impWing", 0.4]], whisperfish: [["silverScale", 0.45]],
    gildedTapirSprite: [["gildedDust", 0.4]], vineChimera: [["vineTail", 0.45]], jungleHarpy: [["greenPinion", 0.4], ["galeDown", 0.2]], sporeSatyr: [["satyrCap", 0.45]], emberToucan: [["toucanBeak", 0.4]],
    stranglerNaga: [["nagaScale", 0.4]], kapokTroll: [["kapokWool", 0.45]], steamSprite: [["steamstone", 0.15]], hotspringToad: [["toadSkin", 0.45]],
    legionShieldbearer: [["legionCoin", 0.5]], legionSpearman: [["legionCoin", 0.5]], legionArcher: [["legionCoin", 0.5]], legionOptio: [["legionCoin", 0.6]], legionMarksman: [["legionCoin", 0.5], ["featherCloak", 0.15]],
    jaguarCohortElite: [["obsidianShard", 0.4]], pyramidAcolyte: [["obsidianShard", 0.4]], kessaVorn: [["legionCoin", 1]], fortCenturion: [["legionCoin", 1], ["obsidianShard", 1]],
  });

  // ---------- regions: metadata the story reads (arena, music, table, town, inn) and the hub fallback (npcs / exits / things) ----------
  // Hub conditions get s = { f: flags, ch, q: active quest steps }. The world engine uses its own maps (src/world/regions/m2/) and these handlers by id.
  const R = Data.REGIONS, yes = () => true, DS = "bg_desert", RU = "bg_ruins";
  Q(R, {
    creepingShore: { n: "Creeping Shore", bg: DS, arena: "shore", music: "shore", table: "shore", fields: true, overland: true,
      exits: [["tamarsLanding", "West along the stilt walkway to Tamar's Landing", yes], ["siltRiver", "East into the Silt River delta", s => s.f["ch3.landed"]]],
      things: [["shoreChest", "A chest by the wreck", s => !s.f["c.shore"], "chest"], ["lostKite", "A red kite snagged in the high mangrove", s => s.q.kite === 0 && !s.f["g.kite"], "gather"]], autos: ["shoreLanding"] },
    tamarsLanding: { n: "Tamar's Landing", bg: DS, arena: "shore", music: "shore", town: "tamarsLanding", inn: "tamarsLanding",
      npcs: [["innkeeper", "The Net and Lantern"], ["merchant", "Smuggler's counter"], ["oldDunmar", "The Menagerie Wagon", s => s.f["wagon.at"] === "tamarsLanding"], ["oma", "Oma Wren"], ["r1", "A fisher"], ["r2", "A net-mender"], ["r3", "A ferry-boy"], ["child", "A child on the pier", s => !s.f["kite.done"]]],
      exits: [["creepingShore", "Back along the walkway to the shore", yes]], things: [["boatToSehkarem", "The skiff at the end of the pier", s => s.f["ch4.done"], "trigger"]], autos: ["landingArrive"] },
    siltRiver: { n: "Silt River", bg: DS, arena: "river", music: "river", table: "river", fields: true, overland: true,
      exits: [["creepingShore", "West to the Creeping Shore", yes], ["ninefoldFerry", "East by rope ferry to Ninefold", s => s.f["ch3.patrolRun"]], ["siltRiverHollow", "South into the mangrove caves", yes]],
      things: [["patrolRun", "The far bank, where the soldiers wait", s => s.f["ch3.landed"] && !s.f["ch3.patrolRun"], "trigger"], ["riverPearl1", "Shallows with a pearl-bed", s => !s.f["g.rp1"], "gather"], ["riverPearl2", "Shallows by the reeds", s => !s.f["g.rp2"], "gather"]] },
    siltRiverHollow: { n: "Hollow of the Silt River", bg: RU, arena: "riverCave", music: "river", table: "riverCave", fields: true, dungeon: true,
      npcs: [["drownedStatue", "A drowned statue"]], exits: [["siltRiver", "Back out to the river", yes]],
      things: [["riverPearlBed", "The pearl-bed under the glowing moss", s => !s.f["g.pearlbed"], "gather"], ["hollowPearlChest", "A chest in the roots", s => !s.f["c.hollowpearl"], "chest"]] },
    ninefoldFerry: { n: "Ninefold Ferry", bg: DS, arena: "river", music: "river", town: "ninefoldFerry", inn: "ninefoldFerry",
      npcs: [["innkeeper", "The Ninth Ferry"], ["merchant", "Ferry shop"], ["tahlen", "Tahlen Orrow"], ["r1", "A ferryman"], ["r2", "A stall-woman"], ["r3", "A boy on the dock"]],
      exits: [["siltRiver", "West by rope ferry to the Silt River", yes], ["greenmawJungle", "North by the ferry dock to the jungle", s => s.f["ch3.kessa1"]]], autos: ["ninefoldArrive", "kessaDuel"] },
    greenmawJungle: { n: "Greenmaw Jungle", bg: RU, arena: "jungle", music: "jungle", table: "jungle", fields: true, overland: true,
      exits: [["ninefoldFerry", "South-west to the Ninefold dock", yes], ["redrootCamp", "South to Redroot Camp", s => s.f["ch3.ninefold"]], ["fortOcelan", "East along the road to Fort Ocelan", yes], ["coilHillPyramid", "North-east to Coil Hill", s => s.f["ch3.fort"]],
        ["boilingPools", "South-east into the steaming valley", yes], ["featherfallCanopy", "The cliff path north", s => s.f["ch4.start"]]],
      things: [["jungleRuinChest", "A mossy ruin with a chest", s => !s.f["c.jruin"], "chest"], ["galeDown1", "The molted-feather glade", s => !s.f["g.gale1"], "gather"], ["galeDown2", "More molted feathers", s => !s.f["g.gale2"], "gather"],
        ["fortHiddenPath", "A ladder above the fort wall", s => !s.f["fort.ladder"], "trigger"]], autos: ["greenmawArrive"] },
    redrootCamp: { n: "Redroot Camp", bg: RU, arena: "jungle", music: "resistance", town: "redrootCamp", inn: "redrootCamp",
      npcs: [["innkeeper", "The Hollow Log"], ["merchant", "Supply tent"], ["itzel", "Itzel Coyo"], ["r1", "A runaway"], ["r2", "The healer"], ["r3", "An old guard"], ["shrineKeeper", "The shrine of the freed"]],
      exits: [["greenmawJungle", "North to the jungle road", yes]], autos: ["redrootArrive"] },
    fortOcelan: { n: "Fort Ocelan", bg: RU, arena: "fort", music: "fort", table: "fort", fields: true, dungeon: true,
      npcs: [["optio", "The optio at the cell block", s => !s.f["fort.cellKey"]], ["captive1", "A prisoner", s => !s.f["fort.freed1"]], ["captive2", "A prisoner", s => !s.f["fort.freed2"]], ["captive3", "A prisoner", s => !s.f["fort.freed3"]]],
      exits: [["greenmawJungle", "Out through the west gate", yes]],
      things: [["fortStrongbox", "The paymaster's strongbox", s => !s.f["c.fortbox"], "chest"], ["fortWallChest", "A chest on the wall walk", s => s.f["fort.ladder"] && !s.f["c.fortwall"], "chest"], ["centurionFight", "The centurion's tower", s => !s.f["ch3.fort"], "trigger"]] },
    coilHillPyramid: { n: "Coil Hill Harvesting Pyramid", bg: RU, arena: "pyramid", music: "pyramid", table: "pyramid", fields: true, dungeon: true,
      npcs: [["slave1", "A worker in the first pen", s => !s.f["pyr.gate1"]], ["slave2", "A worker in the second pen", s => !s.f["pyr.gate2"]], ["slave3", "A worker in the third pen", s => !s.f["pyr.gate3"]],
        ["overseer1", "The overseer of the first pen", s => !s.f["pyr.gate1"]], ["overseer2", "The overseer of the second pen", s => !s.f["pyr.gate2"]], ["overseer3", "The overseer of the third pen", s => !s.f["pyr.gate3"]],
        ["priest", "The priest at the ledger table"], ["collarsmith", "The collarsmith at the altar"]],
      exits: [["greenmawJungle", "Down the hill to the jungle", yes]],
      things: [["ledgerPage", "The ledger table", s => !s.f["g.ledger"], "gather"], ["s1Fight", "The collar altar on the summit", s => !s.f["ch3.s1"] && s.f["pyr.gate1"] && s.f["pyr.gate2"] && s.f["pyr.gate3"], "trigger"], ["g11_venomfangLegion", "A chest behind the altar", s => s.f["ch3.s1"], "chest"]], autos: ["coilArrive"] },
    boilingPools: { n: "Boiling Pools", bg: RU, arena: "pools", music: "jungle", table: "pools", fields: true, dungeon: true,
      npcs: [["bather", "An old woman in a pool"]], exits: [["greenmawJungle", "Back up to the road", yes]],
      things: [["steamstone1", "A white pool", s => !s.f["g.steam1"], "gather"], ["steamstone2", "An orange pool", s => !s.f["g.steam2"], "gather"], ["steamstone3", "A pool under the pink rock", s => !s.f["g.steam3"], "gather"], ["poolsChest", "A chest on the boardwalk", s => !s.f["c.pools"], "chest"]] },
  });

  // ---------- banter for chapter 3 (nine packs, three lines each, in pack order: vanguard sprint venom tempest ironward breakers bastion wildfire dawn) ----------
  const B = M.banter = (moment, rows) => Data.PACKS.forEach((p, i) => { Data.BANTER[p.id][moment] = p.ids.map((id, k) => [id, rows[i][k]]); });
  B("voyage", [   // the night crossing, a tax ship with no flag lanterns far off
    ["Three nights of sea! My stomach has opinions!", "The water is patient. So the shore can wait, young bull.", "Come away from the rail, dear. The dark is not going anywhere. Neither are we."],
    ["Water on every side. No walls. I keep checking for walls.", "That ship has no flag. How rude, to hide such a nice hull.", "Why do they sail with no flag? Is it a law? Is it a secret?"],
    ["Ha. A ship that does not want to be seen. Finally, someone sensible.", "...Gold in the hold. A lie on the bridge.", "Those lights are so far away. I'm glad we're not over there, if that's all right."],
    ["Hah! A ghost ship! Ten kakal says it carries cheese!", "Is it going to chase us? Can it? Can we chase it? Can we?!", "Quiet. Sound carries on water. Let it pass."],
    ["Hm. Not our fight. Yet.", "Great. Three nights of salt, and now ghosts. Wonderful.", "What carries a cargo and never unloads it? Ask me when we land."],
    ["Do you think that ship has snacks? Asking for the crew.", "Ooh, a secret ship, a secret ship, I knew this trip would be fun!", "Did you know tax ships never carry tax? Interesting, what they do carry."],
    ["A fine night for travel. Mind the rail, please.", "Even a dark sea has a road in it. We only have to walk it.", "...Mm. The tide is wrong. ...Or very right. Nap?"],
    ["No, I did not light the lamp on that ship. It lit itself.", "Hee. Let me wave a lantern at them. Just to say hello.", "Three nights. How much bread did the captain pack?"],
    ["There is light on every sea, even this one. We only have to wait for it.", "I will glow low tonight. Let the dark be dark.", "...The tide is taking us east. Let it."],
  ]);
  B("shore", [    // dawn, the mud flats, the first green wall
    ["Mud! Glorious mud! Race you to the first puddle!", "Slowly, young bull. Mud keeps what it catches.", "Wipe your boots when you can, dear. I will not say it twice. I will say it three times."],
    ["Trees to the horizon. Good. Good cover.", "My feathers are not made for this damp. Someone will hear about it.", "What are those roots doing in the water? Are they drinking? Walking?"],
    ["Ha. Wet, warm and rotten. Feels like home. Grumble.", "...Many eyes in the mangrove. Most are friendly.", "It smells of green. Is that all right? I think it's all right."],
    ["Land! Wet land! Best kind! Hah!", "Can I fly up and see the whole jungle? Can I? Just once?!", "Tide is out. Mud takes a careless foot. Walk where I walk."],
    ["Heavy air. I like it.", "Mud. Of course. Why would there be a road.", "What lies at the end of a shore? Another shore, usually."],
    ["I smell crab! Crab! Is it lunch yet?", "We made it, we made it, I knew we'd make it!", "The captain rowed away very fast. Interesting. Who do you think is looking for him?"],
    ["Careful on the mud, little one. It is slippery, and it is hungry.", "A new shore. Walk lightly. It does not know us yet.", "...Mud. Warm. I could nap in this. ...Not now."],
    ["I wonder if mud burns. Do not answer that.", "Hee, the frogs are staring. Boo!", "Crab. Fish. Mud-snail. This place has a menu."],
    ["A new land. May it be kind to us.", "The morning here is thick and gold. I like it.", "...The river meets the sea here. I know this meeting."],
  ]);
  B("jungle", [   // the Greenmaw road: a legion column, a cage-wagon, parrots lifting
    ["Cages on wheels! Who is in those? Let me at them!", "Not yet, young bull. A column that long has a tail. Watch the tail.", "Count them, dear. Count how many are in the wagon. Then do not forget the number."],
    ["That smell. Iron, and wagon bars. I know it.", "Marching. Always marching. They have no rhythm, those boots.", "Where are they taking them? Who decides? Is there a list?"],
    ["Ha. A parade. Nobody asked me.", "...A dozen in the cage. Eleven are asleep. One is counting us.", "They look so tired. I want to say something. Is that all right?"],
    ["Soldiers on a road. Let's drop a branch on the sergeant. For science.", "Can I? Can I drop it? Please?!", "No. Stay low. Count the column first."],
    ["Hm. Cages again.", "Marching soldiers and a wagon of prisoners. Shocking. Truly.", "Who walks in chains? Not the ones you think. Not the ones you don't."],
    ["That column ate well. I can tell. Crumbs all down the road.", "So many soldiers! I wonder if I could outrun the lot!", "The one on the left is afraid of his wife. The one at the back hates the song they're singing."],
    ["Such an orderly line. Such a heavy wagon. I do not like it.", "Let them pass. A hasty step is a wasted step.", "...Slowly... they are going where we are going. ...Eventually."],
    ["A road made of stone. Stone doesn't burn. I've been wondering.", "Hee, a spark in the supply wagon? A tiny one?", "Supply wagon. Bread? Is there bread? ...Is it only for them?"],
    ["There are people in that wagon, and they are afraid. We will remember them.", "The parrots rose all at once. They knew before we did.", "...They sing as they march. A song for the sea, once. Not now."],
  ]);
  B("fort", [     // Fort Ocelan: shields, sun-wheel banners, a tower
    ["A whole fort of shields! I'll dent every one!", "Shields are only walls that learned to walk. Walls fall to patience, young bull.", "Stay together, dear. A fort is a throat. Do not swallow."],
    ["Walls. A barred gate. Guards on the stair. ...No. Not again.", "I can be over that wall before the bell stops ringing.", "How many soldiers does it hold? Who counts them? What is the wheel on the banner for?"],
    ["Ha. A fort. The one thing worse than a cage is a big cage.", "...Three in the cells. Hungry. They are waiting.", "I'll go first. If the door is the dangerous one, I'll go first."],
    ["Banners! I'll steal the ugliest one. Bet?", "Towers! So many towers! Can I climb them all?!", "The centurion fears someone above him. Fear makes men strict. Be ready."],
    ["Shields. I know them.", "A fortress. How inviting. Let us knock politely.", "Who guards a gate? Someone who was told to. Who tells them?"],
    ["The kitchen! Find me the kitchen!", "First to the tower wins! I win! I'm already winning!", "The centurion sleeps badly. Everyone in this fort knows. Nobody says."],
    ["A strong wall. I respect it. I will still go through it.", "Steady hearts. A door is only a question.", "...Slowly... a wall is a wall... and then... it is a door."],
    ["Granary. Wooden doors. I am not planning anything.", "Hee, those banners are very flammable. Just saying.", "Granary. Oh. Oh, there is a granary."],
    ["Three people in the cells. Let us open the door gently, and kindly.", "The torchlight in here is cold. I will add a little warm.", "...Stone does not hold the tide. It only delays it."],
  ]);
  B("collar", [   // the first collar altar, Coil Hill: obsidian ring, a chain, the wind carrying mallets
    ["That chain... that is the same kind of chain as... who is it for?!", "A collar tied to a stone. They need the stone to do the bending. Remember that, young bull.", "Do not look at it too long, dear. It looks back."],
    ["...I wore one. Not this kind. The same idea.", "Disgusting. A beautiful stone, and they made it do that.", "How does it work? Is it a song? A pressure? Why is it humming?"],
    ["Grumble. I'll say nothing. I'll say nothing very loudly.", "...It listens. Do not say your names near it.", "Somebody was here, wearing it. I can feel them. Please can we leave? ...No. We stay."],
    ["No joke for this one. Hear that? No joke.", "Can we break it? Can we? Can I hit it with something?!", "A leash of stone and obsidian. Remember its shape. We will meet it again."],
    ["Chain. Stone. Cruel.", "Of course. Of course they built a machine for it. Efficient.", "A collar has two ends. Who holds the other?"],
    ["I do not feel like eating. That is how bad it is.", "I don't like it, I don't like it, I really don't.", "Did you know the ledgers call this 'tuning'? I read it over a clerk's shoulder once."],
    ["Gentle hands made that stone. Cruel hands put it to use.", "Even a dark altar teaches. It teaches us what we are here to undo.", "...Slowly... and then not slowly."],
    ["Okay. For the record: this one I would burn on purpose.", "No jokes. ...Hee. No. No hee.", "I do not want to eat that. I want to break it."],
    ["Whoever wears this is in pain. Let us help them.", "I feel it from here. A hum like a held breath.", "...The tide does not wear chains. It will remember this."],
  ]);
  B("s1", [       // the first general: someone from the other pens, collared
    ["That's one of the pens! That's... hey! Hey, it's me! Horncinder!", "I know that step. We shared a wall for seven winters.", "Oh, little one. Oh, what have they done to you."],
    ["Same pen block. Different cage. It knows us.", "Don't just stand there looking noble. We have seen you eat.", "It is one of ours! Why won't it look at us? What did they do?"],
    ["Ha. Of all the places. Hello, you. Ha.", "...I know the eyes behind that collar. They know me.", "We have to help. Is that all right? We have to."],
    ["Hey! I owe you a joke! You hear me?", "Is it going to fight us? It doesn't want to fight! Does it?!", "We shared a sky once, you and I. Do not make me do this."],
    ["...Know you.", "Oh wonderful. We left them behind, and now this. Of course.", "What is a wall that remembers? A friend, under glass."],
    ["Hey! You still owe me half a loaf!", "It's you, it's you! I knew you'd turn up somewhere!", "I know a secret about that one. I'll never tell. Not now."],
    ["I know that gait. We took turns watching the door.", "The old guard knows its own. Hold steady, friend.", "...Hello. Still here. Still waiting. Still... awake."],
    ["Nope. Nope nope. I'm not making a joke about this.", "Hee... that one liked my tricks.", "That one shared my bread. ...We cannot eat it. I mean fight it."],
    ["I knew we would meet again. I did not think like this.", "I never stopped glowing for you. Can you see it?", "...Welcome. The tide brought us both."],
  ]);

  // ======================================================================================================================================
  // CHAPTER 3 BEATS (spec M2 sections 3-4). Helpers first.
  // ======================================================================================================================================
  const T = rid => (S.talk[rid] = S.talk[rid] || {});
  M.T = T;
  const hubMode = () => !!(Flow.engine && Flow.engine.mode === "hub");
  // a Cinema stage that also runs in the menu hub (there is no map to film there): the same lines are spoken, the motion calls do nothing
  const dryStage = () => new Proxy({ hero: { x: 0, y: 0 }, say: lines => UI.say(lines) }, { get: (t, k) => (k in t ? t[k] : k === "then" ? undefined : () => Promise.resolve()) });
  M.stage = async (fn, o) => {
    if (hubMode()) { try { await fn(dryStage()); } catch (e) { if (e instanceof Flow.Interrupt) throw e; console.warn("dry stage", e); } return; }
    return Cinema.stage(fn, o);
  };
  M.once = (F, flag) => { if (F.f(flag)) return false; F.set(flag); return true; };
  M.cycle = (key, lines) => { const n = G.flags[key] || 0; G.flags[key] = n + 1; return lines[n % lines.length]; };
  // illustrated panels used as a dialogue scene: each line becomes a caption "Name: text" (Cinema.panels shows captions only)
  M.talkPanels = (img, rows, o) => Cinema.panels(rows.map(([who, text, pan]) => ({ img, pan, text: who === "narr" ? text : (UI.PEOPLE[who] ? UI.PEOPLE[who].name : who) + ": “" + text + "”" })), o);
  // a town's standard talkers: innkeeper, merchant, and the three rumour givers r1..r3 (who = speaker ids, small = small talk lists per giver)
  M.town = (rid, o) => {
    const t = T(rid);
    t.innkeeper = async F => { await UI.say([["innkeeper", typeof o.innLine === "function" ? o.innLine(F) : o.innLine]]); const slept = await F.inn(o.inn || rid); if (slept && o.afterInn) await o.afterInn(F); };
    t.merchant = async F => { await UI.say([["merchant", typeof o.shopLine === "function" ? o.shopLine(F) : o.shopLine]]); if (o.beforeShop) await o.beforeShop(F); await F.shop(o.shop); };
    o.who.forEach((who, i) => { t["r" + (i + 1)] = F => S.rum(F, o.rum || rid, i, who, (o.small || [])[i]); });
  };

  // ---------- the wagon: Dunmar, at whichever town it is parked ----------
  M.dunmar = async F => {
    if (F.item("keyK2") && !F.f("k2.freed")) {
      await UI.say([["dunmar", "Grey feather-stone. The Windhollow key! Hold the lantern, lad."]]);
      F.take("keyK2", 1); F.set("k2.freed"); F.questDone("m_windhollow");
      const lv = Math.max(3, F.avgLevel() - 1), q = F.mk("quillshade", lv); G.collection.push(q); G.best.quillshade = Object.assign(G.best.quillshade || {}, { seen: 1, beaten: 0 });
      F.sfx("door");
      await M.stage(async c => {
        c.sfx("door"); c.fx("feathers", c.hero.x + 60, c.hero.y - 10); await c.wait(600);
        await c.say([["narr", "A small cage swings open. A grey squirrel with a harpy's wing-folds shakes out its tail and looks around the wagon like someone checking for eavesdroppers."]]);
      });
      await UI.say([["quillshade", "Between us? The cook at the palace sleeps through the second bell."], ["dunmar", "Quillshade carried messages between the factions. The academy treated her as furniture. Mind what you say near her, lad. She remembers everything and tells it to anyone who asks nicely."],
        ["quillshade", "Between us, the Hollow has a house nobody opens. Down the long stair. You did not hear that from me."]]);
      return;
    }
    const L = [];
    if (F.f("ch4.done")) L.push("Back to the sand, lad? I do not like it. I like it less that I keep not saying so.");
    if (F.f("ch4.start") && !F.f("k2.freed")) L.push("Quillshade's cage has a lock I do not like the look of. The Windhollow key, lad. Whenever you feel like it.");
    if (F.f("ch3.s1")) L.push("I heard about the pyramid. One of ours, in a collar. ...Do not tell me what it looked like, lad.");
    if (F.f("ch3.fort")) L.push("Fort Ocelan, was it? Shields all the way down, I hear. Shields have a seam.");
    L.push("No keys yet, lad. Bring one when you find it. And wipe your boots, this wagon has been through enough.");
    await UI.say([["dunmar", M.cycle("dm.n", L.length > 2 ? L.slice(0, 2).concat(L.slice(-1)) : L)]]);
  };
  Q(Data.QUESTS, { m_windhollow: { t: "The Windhollow Key", ch: 4, steps: ["Dunmar wants the Windhollow key for Quillshade's cage."] } });

  // ---------- 3.0 the voyage (Story.begin[3]) ----------
  S.begin[3] = async F => {
    G.ch = 3; F.set("ch3.start"); F.music("voyage");
    await Cinema.voyage({ from: "saltgate", to: "creepingShore", text: "Three nights east on the Weeping Sea.", mood: "night" });
    await M.talkPanels("assets/cinema/m2_deck.png", [
      ["narr", "Night on the Weeping Sea. Far off to starboard, a ship with no flag lanterns slides along the horizon. The lights on her stern do not flicker."],
      ["captain", "That's a tax ship. Never unloads anything. Don't wave."],
      ["hero", "What does it carry?"],
      ["captain", "Ask me when I'm drunk and I'll say gold. Ask me sober and I'll say nothing. Either way, you do not outsail a war, friend. You outwait it."],
    ], { music: "voyage" });
    await F.banter("voyage");
    await M.talkPanels("assets/cinema/m2_deck.png", [
      ["narr", "Dawn. A green wall rises out of the water: a coast with no beaches, only roots, and mist standing in them like breath."],
      ["captain", "Ixcalo. Smells like wet money, doesn't it?"],
    ], { music: "shore" });
    await Cinema.title("Chapter 3", "Into the Jungle");
    F.music("shore"); F.autoSave = true; F.save(true);
    F.go("creepingShore", "from_sea");
  };
  S.start[3] = { region: "creepingShore", entry: "from_sea" };

  // ---------- 3.A Creeping Shore ----------
  S.trigger.shoreLanding = async F => {
    if (!M.once(F, "sh.landed")) return;
    F.music("shore"); if (G.ch < 3) G.ch = 3;
    await M.stage(async c => {
      const p = rel(c, -140, 20); c.tint("#3a2a30", 0.22, 300);
      c.actor("brisk", { art: "npcBrisk", x: p.x, y: p.y, name: "Brisk" });
      c.fx("splash", p.x - 30, p.y + 20); await c.wait(500);
      await c.say([["captain", "This is as far as the price goes. West along the mud there is a lamp that stays lit. They do not like questions, so bring none."]]);
      await c.walk("brisk", p.x - 360, p.y + 40, 2600); c.face("brisk", "left");
      await c.say([["captain", "And keep that helmet on!"]]);
      c.remove("brisk"); c.tint("#3a2a30", 0, 600);
    }, { music: "shore" });
    await F.banter("shore");
    F.quest("m_landing", 0);
  };
  S.chest.shoreChest = M.loot("c.shore", [["sunwater", 2]], 80, "A crate wedged between two ribs of the wreck, tarred shut. Inside: two Sunwater Flasks and a few coins somebody forgot to count.");
  S.gather.lostKite = async F => {
    if (!F.f("kite.started") || F.f("g.kite")) return false;
    F.set("g.kite"); F.give("lostKite", 1, true); F.quest("kite", 1); F.sfx("coin");
    await UI.say([["narr", "A red kite, snagged ten feet up in the mangrove. You climb the root and cut it free. The paper is torn at one corner, and somebody has drawn an eye on it."]]);
  };

  // ---------- 3.B Tamar's Landing ----------
  const TL = "tamarsLanding";
  S.trigger.landingArrive = async F => {
    if (!M.once(F, "tl.seen")) return;
    F.music("shore"); F.set("wagon.at", TL);   // wagon.at is a string flag, as the hub conditions read it
    await M.stage(async c => {
      const h = c.hero, v = [["w1", "npcNetMender", -160, -40], ["w2", "npcFerryBoy", 150, -20], ["w3", "npcPip", 60, 50]];
      c.tint("#2a1c28", 0.2, 400);
      v.forEach(([id, art, dx, dy]) => c.actor(id, { art, x: h.x + dx, y: h.y + dy }));
      await c.say([["narr", "A pier at dusk. As you walk in, cloths go over the cages. A woman drags a child indoors by the shoulder. Lantern after lantern is shuttered."]]);
      c.sfx("door"); c.tint("#0a0610", 0.5, 900); c.remove("w1"); c.remove("w2"); c.remove("w3"); await c.wait(700);
      const p = rel(c, 170, 0); c.actor("oma", { art: "npcOma", x: p.x, y: p.y, name: "Oma Wren", flip: true }); c.emote("oma", "!");
      await c.walk("oma", h.x + 80, h.y, 1000);
      await c.say([["oma", "Keep your voice down and your creature closer. The empire takes our tamers first."]]);
      c.emote("oma", "?"); await c.wait(400);
      await c.say([["oma", "Ah. You are one of those."]]);
      c.tint("#0a0610", 0.1, 700);
      const d = rel(c, -190, 20); c.actor("dun", { art: "npcDunmar", x: d.x, y: d.y, name: "Dunmar" });
      await c.say([["dunmar", "Lad! Do not ask how the wagon crossed. I did not like the answer either."]]);
      c.remove("oma"); c.remove("dun"); c.tint("#0a0610", 0, 600);
    }, { music: "shore" });
    F.set("ch3.landed"); F.quest("m_landing", 1); UI.toast("The Menagerie Wagon is here.");
    await F.idleBanter();
  };
  M.town(TL, {
    inn: TL, innLine: "The Net and Lantern. Dry beds, hot soup, and nobody saw you arrive.", shop: "tamar", shopLine: "Nothing here has a receipt. Everything has a price.",
    who: ["fisher", "netmender", "ferryboy"],
    small: [["Nets do not care who is sinking. They only care about the knots.", "I mend what I can. Mostly I mend my back."], ["Never mind the boy with the kite. He thinks the wind is a person.", "The soldiers pay in coin, and the coin is clean. That is the worst part."], ["I can row you anywhere you like. There is nowhere the legion does not look.", "Ferries run on rope and rumours. Both fray."]],
  });
  T(TL).oldDunmar = M.dunmar;
  T(TL).oma = async F => {
    if (F.f("ch3.s1")) { await UI.say([["oma", "A pyramid on Coil Hill fell quiet last night. The wind carries other things now. I do not know what. I like it better."]]); return; }
    await UI.say([["oma", M.cycle("oma.n", ["The ferrymen of Ninefold will not turn you away. They were all runaways once.", "The river is the only road the legion has not paved. They are working on it.", "Eat. You are all elbows under that tin.", "If a soldier asks, you were never here. If a soldier does not ask, you were never here either."])]]);
  };
  T(TL).child = async F => {
    const st = F.qstep("kite");
    if (st === "done") { await UI.say([["pip", "It flies! Grandmother says only on days the soldiers are not looking."]]); return; }
    if (st === undefined) {
      await UI.say([["pip", "My kite went up into the high mangrove by the wreck and the tide came. Grandmother will skin me."], ["hero", "(He is looking at the helmet, not at me.)"], ["pip", "Are you real? Is there a face in there?"]]);
      F.quest("kite", 0); F.set("kite.started"); return;
    }
    if (st === 0) { await UI.say([["pip", "The high mangrove. By the wreck. The red one is mine. Please."]]); return; }
    if (F.item("lostKite")) {
      F.take("lostKite", 1);
      await UI.say([["pip", "You got it. You got it! There is a tear. ...It is fine. It is a good tear."], ["oma", "He will fly it in the first wind. Mind you, so will I."]]);
      await UI.say([["oma", "Here. My husband's coat, and his father's before him. It does not fit anyone now. It might fit you."]]);
      F.giveGear("G6", 3); F.questDone("kite"); F.set("kite.done"); F.sfx("coin");
    } else await UI.say([["pip", "Did you lose it? Did you lose it in the water?"]]);
  };

  // ---------- Silt River: the pearl shallows, the hollow ----------
  S.gather.riverPearl1 = M.mat("g.rp1", "riverPearl", 5, "A pearl-bed in the shallows. You wade out and feel for them with your toes, and bring up five River Pearls, round and faintly warm.", "Soak");
  S.gather.riverPearl2 = M.mat("g.rp2", "riverPearl", 5, "Under the reeds, another bed. The pearls come up in your fist like warm hail. Five River Pearls.", "Soak");
  S.gather.riverPearlBed = M.mat("g.pearlbed", "riverPearl", 10, "The moss glows where the bed is. You fill both hands, then your cap: ten River Pearls from a bed the tide has not emptied in a hundred years.", "Soak");
  S.chest.hollowPearlChest = M.loot("c.hollowpearl", [["curio", 1]], 120, "A chest grown into the roots. The lid has a pearl set in it for a handle. Inside: a curio, and coins gone green.");
  T("siltRiverHollow").drownedStatue = async F => {
    await UI.say([["narr", "A builder statue stands in the tidewater up to its chest, holding a bowl. The bowl is empty. Cut into the rim: \"We took the first harvest from the river with grace, and gave the shells back.\""]]);
    if (M.once(F, "lore.statue")) await UI.say([["hero", "(Gave back. Nobody here gives anything back.)"]]);
  };

  // ---------- 3.D the patrol run (Silt River) ----------
  S.done.patrolRun = F => F.f("ch3.patrolRun");
  S.trigger.patrolRun = async F => {
    if (F.f("ch3.patrolRun") || !F.f("ch3.landed")) return;
    F.music("tension");
    await M.stage(async c => {
      const h = c.hero; c.tint("#40301c", 0.15, 300);
      c.actor("op", { art: "npcOptio", x: h.x + 470, y: h.y - 40, name: "Optio", flip: true });
      [[0, 30], [50, -20], [90, 40], [30, 90]].forEach(([dx, dy], i) => c.actor("sd" + i, { art: "npcMarksman", x: h.x + 500 + dx, y: h.y + dy, flip: true }));
      await c.pan(h.x + 230, h.y, 900);
      c.emote("op", "!");
      await c.say([["optio", "There. The boy in the red armour. Exactly as described."], ["hero", "(Described. By who?)"]]);
      await c.say([["optio", "Take him. The river will do half the work."]]);
      c.sfx("encounter"); c.follow();
      await Promise.all([0, 1, 2, 3].map(i => c.walk("sd" + i, h.x + 150 + i * 28, h.y + (i - 1.5) * 34, 1500 + i * 120)));
      c.fx("splash", h.x + 190, h.y + 20); c.shake(2, 400);
      c.fx("dust", h.x - 40, h.y + 10); c.sfx("hit"); await c.wait(300);
      await c.walkHero(h.x - 220, h.y + 50, 900); c.fx("splash", h.x - 120, h.y + 60); c.shake(2, 300);
      const f = rel(c, -80, 10); c.actor("ferryman", { art: "npcFerryman", x: f.x, y: f.y, name: "Ferryman" }); c.emote("ferryman", "!");
      await c.say([["ferryman", "Jump, you fool!"]]);
      await c.walkHero(f.x + 10, f.y, 450); c.sfx("hitHeavy"); c.fx("splash", f.x, f.y + 10);
      await c.fade(true, 500);
    }, { music: "tension" });
    await UI.say([["narr", "The ferry lurches off the bank on its rope. Boots land on the deck behind you, and the river is suddenly very narrow."]]);
    const res = await F.fight([F.mkEnemy("legionArcher", 12, " A"), F.mkEnemy("legionShieldbearer", 12, " B")], { bg: "river", intro: "Soldiers swing aboard!", music: "battleSoldiers" });
    if (res !== "win") return;
    F.set("ch3.patrolRun");
    await UI.say([["narr", "You cut the rope-guard loose with the last of your breath. The soldiers stand on the bank and get smaller. Nine brown rivers wait ahead, and a market on top of them."]]);
    F.go("ninefoldFerry", "from_siltRiver");
  };

  // ---------- 3.E Ninefold Ferry ----------
  const NF = "ninefoldFerry";
  S.trigger.ninefoldArrive = async F => {
    if (!M.once(F, "nf.seen")) return;
    F.music("river"); F.questDone("m_landing"); F.set("ch3.ninefold"); F.quest("m_pass", 0);
    await M.stage(async c => {
      const h = c.hero; c.tint("#2c2418", 0.1, 300);
      c.actor("tahlen", { art: "npcTahlen", x: h.x + 70, y: h.y - 10, name: "Tahlen", flip: true });
      c.actor("op", { art: "npcOptio", x: h.x + 420, y: h.y - 20, name: "Optio", flip: true });
      [[0, 20], [40, -30], [70, 30], [100, -10]].forEach(([dx, dy], i) => c.actor("sd" + i, { art: "npcMarksman", x: h.x + 480 + dx, y: h.y + dy, flip: true }));
      await c.say([["narr", "A hand like a mooring rope closes on your arm and hauls you behind a fish stall. Hanging eels slap your helmet."]]);
      await c.walk("op", h.x + 200, h.y - 10, 1600); c.emote("op", "?");
      await c.say([["optio", "Search every boat. Red armour. Tall. A closed helm."]]);
      c.walk("tahlen", h.x + 150, h.y + 5, 700); await c.wait(700);
      await c.say([["tahlen", "Eels, officer? Fresh this morning. Fresher than your orders."], ["optio", "...How much?"], ["tahlen", "For the cohort? Free. For the cohort's wives, a discount."]]);
      c.sfx("coin"); await c.wait(900);
      await Promise.all([c.walk("op", h.x + 520, h.y - 20, 1800), ...[0, 1, 2, 3].map(i => c.walk("sd" + i, h.x + 640, h.y + (i - 1.5) * 24, 2000))]);
      c.remove("op"); [0, 1, 2, 3].forEach(i => c.remove("sd" + i));
      await c.say([["tahlen", "Eat first. Fear later. That is how Ninefold works."]]);
      c.remove("tahlen");
    }, { music: "river" });
    await F.idleBanter();
  };
  const KB = [["kessa", "npcKessa", 360, -80, true], ["dorrin", "npcDorrin", 410, -40, true], ["mayle", "npcMayle", 320, -20, true], ["emberwick", "emberwick", 370, 20, true]];
  S.done.kessaDuel = F => F.f("ch3.kessa1"); S.done.ninefoldArrive = F => F.f("nf.seen");
  S.trigger.kessaDuel = async F => {
    if (!F.f("ch3.ninefold") || F.f("ch3.kessa1")) return;
    F.music("tension");
    await M.stage(async c => {
      const h = c.hero;
      KB.forEach(([id, art, dx, dy, fl]) => c.actor(id, { art, x: h.x + dx, y: h.y + dy, name: UI.PEOPLE[id] ? UI.PEOPLE[id].name : id, flip: fl }));
      await c.pan(h.x + 200, h.y - 60, 1100); c.emote("kessa", "!");
      await c.say([["kessa", "Found you. Ithiel's apprentice, hiding behind a fish."], ["hero", "Who are you?"],
        ["kessa", "Tamer Corps. We lend ourselves to the Legion when there is a bounty. The description came from someone who knows you well. Very well."]]);
      c.follow();
      await c.say([["dorrin", "Boss says duel. Duel it is. Also, hello."], ["mayle", "Page twelve. He does not look like a bounty."]]);
    }, { music: "tension" });
    await Cinema.boss({ id: "kessaVorn", name: "Kessa Vorn", title: "Tamer Corps", bg: "river", music: "general", lines: [["kessa", "Do try to keep up, tin can."]] });
    const res = await F.boss([F.mkEnemy("kessaVorn", 12), F.mkEnemy("emberwick", 11, " B")], { bg: "river", music: "general", intro: "Kessa Vorn steps forward!" });
    if (res !== "win") return;
    await M.stage(async c => {
      const h = c.hero; KB.forEach(([id, art, dx, dy, fl]) => c.actor(id, { art, x: h.x + dx - 160, y: h.y + dy, flip: fl }));
      await c.say([["kessa", "Not bad. For a tin can."], ["emberwick", "Warm. We lost. That is allowed."], ["kessa", "That was a loan, not a gift. I will collect."]]);
      await Promise.all(KB.map(([id], i) => c.walk(id, h.x + 640, h.y - 80 + i * 40, 2200 + i * 150)));
      c.emote("mayle", "..."); KB.forEach(([id]) => c.remove(id));
      c.actor("tahlen", { art: "npcTahlen", x: h.x + 80, y: h.y, name: "Tahlen", flip: true });
      await c.say([["tahlen", "Friends of yours?"], ["hero", "No."]]);
      c.remove("tahlen");
    }, { music: "river" });
    F.set("ch3.kessa1"); F.music("river");
  };
  M.backup = async (F, flag, key, n, price, ask) => {
    if (F.f(flag)) return;
    const i = await F.ask(ask, [{ label: `Buy ${n} for ${price} kakal`, disabled: G.gold < price }, { label: "Not now" }]);
    if (i === 0) { G.gold -= price; F.set(flag); F.give(key, n); F.sfx("coin"); UI.toast("New in the Skill Book: " + Data.BOOK[Object.keys(Data.BOOK).find(k => Data.BOOK[k].mat === key)].n + ".", 3000); }
  };
  M.town(NF, {
    inn: NF, innLine: "The Ninth Ferry. Eight rivers go past the door. The ninth goes through the cellar, but we do not discuss it.", shop: "ninefold", shopLine: "Rope, tea, clay, cloth. Soldiers pay double. They do not know that.",
    beforeShop: F => M.backup(F, "bought.pearl", "riverPearl", 10, 330, "Ten river pearls, strung and ready, for a ferryman's price."),
    who: ["ferryman", "stallwoman", "ferryboy"],
    small: [["Nine rivers, nine ways to drown. The tenth way is to ask the soldiers for directions.", "I have rowed this stretch since before the road was paved. The road will drown first."], ["Eels today, eels tomorrow. The soldiers love them. Ha.", "Tahlen feeds half the dock. The other half feeds Tahlen."], ["I saw a bird with a collar once, flying over, crying. Is that a story or a thing?", "Do not go near the fort. Everyone says that. Nobody says why."]],
  });
  T(NF).tahlen = async F => {
    const st = F.qstep("pearls");
    if (st === "done") { await UI.say([["tahlen", M.cycle("tl.n", ["Eat. You are thin under all that tin.", "The lines are quiet, and the eels are fat. You have done Ninefold a kindness.", "Keep your head down on the road, friend. Keep it up when it matters."])]]); return; }
    if (st === undefined) {
      await UI.say([["tahlen", "You look like a man who can hit things. Good. Snappers bite the ferry lines, three of them in the shallows this week. Clear them out and I will pay you in pearls."], ["tahlen", "Pearl-Backed Snappers. Hard shells, soft tempers. The shallows west of the dock."]]);
      F.quest("pearls", 0); G.flags.pearlBase = G.kills.pearlBackedSnapper || 0; return;
    }
    const n = (G.kills.pearlBackedSnapper || 0) - (G.flags.pearlBase || 0);
    if (n >= 3) {
      await UI.say([["tahlen", "Three Snappers! The ferrymen are calling you a saint. Do not let it go to your head. Here: pearls, and coin for the boots."]]);
      F.give("riverPearl", 5); F.gold(120); F.questDone("pearls"); F.sfx("coin");
      if (F.matCount("riverPearl") >= 10) UI.toast("New in the Skill Book: Soak.", 3000);
    } else await UI.say([["tahlen", `${Math.max(0, n)} of 3 Snappers so far. West of the dock, in the shallows. Mind the pearls on their backs; they bite harder when you stare.`]]);
  };

  // ---------- 3.F Greenmaw Jungle ----------
  S.trigger.greenmawArrive = async F => {
    if (!M.once(F, "gm.seen")) return;
    F.music("jungle");
    await M.stage(async c => {
      const h = c.hero; c.tint("#10261a", 0.16, 400);
      c.actor("w0", { art: "npcMarksman", x: h.x - 520, y: h.y - 200, flip: false });
      c.actor("w1", { art: "npcOptio", x: h.x - 600, y: h.y - 200, flip: false });
      [0, 1, 2, 3].forEach(i => c.actor("cp" + i, { art: "npcCaptive", x: h.x - 680 - i * 46, y: h.y - 196 + (i % 2) * 8, flip: false }));
      await c.say([["narr", "You stop at the edge of the road. Stone, wide enough for six, with milestones. Far along it a column is marching: shields, spears, and behind them a cage-wagon with a dozen people in it."]]);
      c.fx("feathers", h.x + 40, h.y - 120); c.sfx("door");
      await Promise.all([c.walk("w0", h.x + 560, h.y - 200, 5200), c.walk("w1", h.x + 480, h.y - 200, 5200), ...[0, 1, 2, 3].map(i => c.walk("cp" + i, h.x + 400 - i * 46, h.y - 196, 5200))]);
      ["w0", "w1", "cp0", "cp1", "cp2", "cp3"].forEach(id => c.remove(id));
      await c.say([["narr", "A flock of parrots lifts out of the canopy all at once, screaming, and the road is empty again."]]);
    }, { music: "jungle" });
    await F.banter("jungle");
  };
  S.trigger.fortHiddenPath = async F => {
    if (M.once(F, "fort.ladder")) await UI.say([["narr", "A rope ladder, grey with moss, hangs down the back of the fort wall. Somebody climbed it once and did not take it in. At the top: a wall walk, a hatch, and a chest nobody has counted."]]);
    else await UI.say([["narr", "The old ladder creaks. The wall walk above is empty."]]);
  };
  S.done.fortHiddenPath = F => F.f("fort.ladder");
  S.chest.jungleRuinChest = M.loot("c.jruin", [["sunwater", 3]], 150, "A mossy ruin, a collapsed arch, and under a root a chest with a builder's sun on the lid. Three Sunwater Flasks and a purse of green-stained coin.");
  S.gather.galeDown1 = M.mat("g.gale1", "galeDown", 5, "A glade where something big has been moulting. The feathers are as light as a held breath, and the air bends round them. Five Gale Down.", "Dampen Wing");
  S.gather.galeDown2 = M.mat("g.gale2", "galeDown", 5, "More molted plumage under the roots. You gather five more Gale Down, and do not look up.", "Dampen Wing");

  // ---------- Redroot Camp ----------
  const RR = "redrootCamp";
  S.trigger.redrootArrive = async F => {
    if (!M.once(F, "rr.seen")) return;
    F.music("resistance");
    await M.stage(async c => {
      const h = c.hero; c.actor("itzel", { art: "npcItzel", x: h.x + 120, y: h.y, name: "Itzel Coyo", flip: true });
      await c.say([["narr", "A fallen temple, green to the rafters. A woman in a faded overseer's wife's shawl stands in the gate with a spear held low, and does not lift it."]]);
      c.emote("itzel", "?"); await c.say([["itzel", "Rule one: no names. Rule two: no names."]]);
      await c.walk("itzel", h.x + 220, h.y - 30, 900); c.remove("itzel");
    }, { music: "resistance" });
    await UI.say([["narr", "Inside, tents fill the nave. Along the old altar wall stands a row of small stone creatures, each with a broken collar set at its feet. One plinth is empty, waiting."]]);
    F.quest("m_pass", 1);
  };
  M.town(RR, {
    inn: RR, innLine: "The Hollow Log. Straw is free and the soup is not. Half price for those who hit the legion; I do not ask which half.", shop: "redroot", shopLine: "What the camp can spare. Tonics, bombs, and the ember we made ourselves.",
    who: ["runaway", "healer", "oldguard"],
    small: [["I ran in the rain. It is the only way. Nobody follows through mud.", "Do not ask me where I came from. I do not ask you what is under the helmet."], [], ["I stood on the wall at Fort Ocelan for eleven years. It is a good wall. That is the worst thing I can say about it.", "The centurion is not a bad man. He is a frightened one. Those are worse."]],
  });
  T(RR).r2 = async F => {
    const st = F.qstep("steam");
    if (st === undefined) {
      await S.rum(F, RR, 1, "healer");
      await UI.say([["healer", "While you are here: burns. Everyone in this camp has one. I make a salve from steamstone, and the Boiling Pools are south-east of the road. Show me six good stones and I will pay for the trouble."]]);
      F.quest("steam", 0); return;
    }
    if (st === 0) {
      if (F.matCount("steamstone") >= 6) {
        await UI.say([["healer", "Let me see. ...Hold that one under the pot. Hear it hiss? Real. Keep them, I only needed to know they were real. The salve is cheaper than the worry."], ["healer", "Here. Clearwater tonics, and coin. Your hands are shaking, you know."]]);
        F.give("tonic", 3); F.gold(100); F.questDone("steam"); F.sfx("coin");
      } else await UI.say([["healer", F.matCount("steamstone") ? `${F.matCount("steamstone")} stones. Six, I said. The pools are south-east of the road, and the water is hotter than it looks.` : "Steamstone sinks in water and hisses. The Boiling Pools, south-east of the road. Six stones."]]);
      return;
    }
    await UI.say([["healer", "The salve is working. The camp smells of herbs and not of burnt skin. Thank you."]]);
  };
  T(RR).r3 = async F => {
    const seen = (G.rumours[RR] = G.rumours[RR] || []);
    if (F.f("ch3.fort") && seen.includes(2) && !seen.includes(3)) { await S.rumourIdx(F, RR, 3, "oldguard"); return; }
    return S.rum(F, RR, 2, "oldguard", ["I stood on the wall at Fort Ocelan for eleven years. It is a good wall. That is the worst thing I can say about it.", "The centurion is not a bad man. He is a frightened one. Those are worse."]);
  };
  { const r = Data.RUMOURS.redrootCamp; Object.defineProperty(r, 3, { get: () => { try { return S.styleClue(1, 0); } catch (e) { return ""; } }, enumerable: true, configurable: true }); }
  T(RR).r1 = F => S.rum(F, RR, 0, "runaway", F.f("fort.cells") ? ["Three of ours walked in from the fort at dawn. One of them kissed the ground and then apologised to it.", "Mara is alive. Mara is eating her third bowl. Nobody is stopping her."] : ["I ran in the rain. It is the only way. Nobody follows through mud.", "Do not ask me where I came from. I do not ask you what is under the helmet."]);
  T(RR).shrineKeeper = async F => {
    await UI.say([["shrinekeeper", M.cycle("sk.n", ["Each statue is a creature they freed from a collar. We carve it the day it is gone. Gone, not dead. We carve it the same way.", "The empty plinth is not for a stone. It is for the day we are not needed.", "Do not touch the broken collars. They are not sacred. They are only heavy."])]]);
  };
  T(RR).itzel = async F => {
    if (F.f("ch3.s1") && !F.f("ch3.done")) {
      await UI.say([["itzel", "A courier in a grey hood was here before you. He left this, and did not wait to be fed. Nobody does that."]]);
      await F.letter("the green seal", ["\"Well done at the pyramid. I knew you would not shrink from it.\"", "\"North of the road, above the cliff, there is a canopy village of feather-weavers. A Titan nests above them. Record how it flies. - I.\""]);
      await UI.say([["hero", "(He knew. Of course he knew. He always knows where I am.)"]]);
      F.set("ch3.done"); F.set("ch4.start"); F.questDone("m_coil"); F.quest("m_canopy", 0); F.save(true);
      UI.toast("A cliff path leads north from the jungle road.", 3200);
      return;
    }
    if (F.f("ch3.done")) { await UI.say([["itzel", "North, then. Feather-weavers do not like loud people. Be quiet on their bridges."]]); return; }
    if (F.f("ch3.fort")) { await UI.say([["itzel", "Past the fort the road climbs to Coil Hill. They cut a new pyramid there. Do not look at the pens too long. It is how they learn your face."]]); F.quest("m_coil", 0); return; }
    await UI.say([["itzel", "The fort holds the pass. They also hold three of ours. Rumour says the centurion fears his tribune more than the jungle. Make of that what you will."]]);
  };

  // ---------- 3.G Fort Ocelan ----------
  const FO = "fortOcelan";
  S.chest.fortStrongbox = M.loot("c.fortbox", [], 180, "The paymaster's strongbox. The lock was signed for. The coin inside was not: one hundred and eighty kakal in legion silver.");
  S.chest.fortWallChest = M.loot("c.fortwall", [["rimeFlask", 2], ["cinderBomb", 2]], 200, "A watch-chest on the wall walk, left by someone who expected to be relieved. Two Rime Flasks, two Cinder Bombs, a purse of kakal.");
  T(FO).optio = async F => {
    if (F.f("fort.cellKey")) { await UI.say([["optio", "The ring is gone. That is a form. There will be a form for that."]]); return; }
    await UI.say([["optio", "Cell block. No visitors. Keys are signed for."], ["hero", "(A ring of iron keys at his belt. Three cells at his back.)"], ["optio", "Name and cohort. ...No? Then you are not on the list, and I am required to be unpleasant."]]);
    const res = await F.fight([F.mkEnemy("legionOptio", 13), F.mkEnemy("legionSpearman", 13, " B"), F.mkEnemy("legionArcher", 13, " C")], { bg: "fort", intro: "The optio draws his blade!", music: "battleSoldiers" });
    if (res !== "win") return;
    F.set("fort.cellKey"); F.sfx("door");
    await UI.say([["narr", "The optio sits down hard against the wall, ledger still in hand. The ring of cell keys lies at your feet. It is heavier than it looks."]]);
  };
  const CAP = [
    ["captive1", "prisoner", "Quietly. Quietly. They look in at every bell. ...They are not looking in. Why are they not looking? Oh. Oh, thank you."],
    ["captive2", "prisoner", "Tell Redroot that Mara is alive. Tell them I did not say a name. I did not say a single name."],
    ["captive3", "prisoner", "Nineteen days. Not so long. I have been in worse places. Not many. Not many."],
  ];
  CAP.forEach(([id, who, line], n) => {
    T(FO)[id] = async F => {
      if (F.f("fort.freed" + (n + 1))) return;
      if (!F.f("fort.cellKey")) { await UI.say([[who, ["Please. The guard has the keys. The one with the ledger.", "Do not stand there. They count who stands there.", "Is it day outside? We have a window, but it faces a wall."][n]]]); return; }
      F.set("fort.freed" + (n + 1)); F.sfx("door");
      await UI.say([["narr", "The key turns. The door gives with a sound like a held breath leaving."], [who, line]]);
      if ([1, 2, 3].every(k => F.f("fort.freed" + k))) { F.set("fort.cells"); await UI.say([["narr", "The cell block is empty. At the far end, the stair to the tower stands unwatched."]]); }
    };
  });
  S.done.centurionFight = F => F.f("ch3.fort");
  S.trigger.centurionFight = async F => {
    if (F.f("ch3.fort")) return;
    if (!F.f("fort.cellKey")) { await UI.say([["narr", "An iron-banded door at the foot of the tower. Locked, and the lock is a good one. Somewhere below, in the cell block, a man is guarding a ring of keys."]]); return; }
    F.music("fort");
    await F.banter("fort");
    await Cinema.boss({ id: "fortCenturion", name: "Centurion Varro Toric", title: "Fort Ocelan", bg: "fort", music: "general", lines: [["centurion", "Orders are orders. They were here before me."], ["centurion", "The tribune will ask how you passed the wall."], ["hero", "Through the front."], ["centurion", "Of course you did."]] });
    const res = await F.boss([F.mkEnemy("fortCenturion", 13), F.mkEnemy("legionShieldbearer", 12, " B"), F.mkEnemy("legionShieldbearer", 12, " C")], { bg: "fort", music: "guardian", intro: "The shield wall closes!" });
    if (res !== "win") return;
    await M.stage(async c => {
      const h = c.hero; c.actor("cen", { art: "npcCenturion", x: h.x + 90, y: h.y, name: "Varro Toric", flip: true });
      c.tint("#10100c", 0.2, 400);
      await c.say([["narr", "The centurion goes down on one knee behind a shield that has finally stopped being a wall. He does not reach for his sword."], ["centurion", "Take the seal. Tell the tribune... no. Tell him nothing."]]);
      c.sfx("coin"); c.tint("#10100c", 0, 700); c.remove("cen");
    }, { music: "fort" });
    F.giveGear("G42", 3); F.give("ocelanSeal"); F.set("ch3.fort"); F.questDone("m_pass"); F.quest("m_coil", 0);
    await UI.say([["hero", "(Seen from the wall, the road east is only a road.)"]]);
    UI.toast("The east gate of Fort Ocelan is open.", 3000);
  };

  // ---------- 3.H Coil Hill ----------
  const CH = "coilHillPyramid";
  S.trigger.coilArrive = async F => {
    if (!M.once(F, "coil.seen")) return;
    F.music("tension");
    await Cinema.panels([{ img: "assets/cinema/m2_pyramid.png", text: "A new pyramid on a bare hill. Wind carries the noise of mallets, and under it another noise.", pan: "inup" }], { music: "tension" });
    F.music("pyramid"); F.quest("m_coil", 0);
  };
  const pen = async (F, n) => {
    if (F.f("pyr.gate" + n)) return;
    await UI.say([["overseer", ["It is entered in the ledger that this pen's quota is short. You are standing in the quota.", "The Harvest Office thanks you for your interest. It does not require it.", "Visitors are not on the manifest. The manifest does not allow for surprise."][n - 1]]]);
    const res = await F.fight([F.mkEnemy("legionSpearman", 14), F.mkEnemy("legionOptio", 14, " B")], { bg: "pyramid", intro: "The overseer calls the guard!", music: "battleSoldiers" });
    if (res !== "win") return;
    F.set("pyr.gate" + n); F.sfx("door");
    await UI.say([["narr", "The overseer drops his tally-stick. Behind him, the workers put their shoulders to the crank without being told, and the gate swings. They run into the jungle, all of them, not one looking back."]]);
  };
  [1, 2, 3].forEach(n => {
    T(CH)["slave" + n] = async F => { await UI.say([["slave", ["Please do not make me look.", "I did not see you. I did not see anything. It is better.", "The overseer is on the left. I am looking at the floor. The floor is good."][n - 1]]]); };
    T(CH)["overseer" + n] = F => pen(F, n);
    S.trigger["pen" + n] = F => pen(F, n); S.done["pen" + n] = F => F.f("pyr.gate" + n);
  });
  T(CH).collarsmith = async F => { await UI.say([["collarsmith", F.f("ch3.s1") ? "The altar is dark. It is entered in the ledger as a fault of the stone." : "The sun sees it. Go up if you must. The stone is not impressed by visitors."]]); };
  T(CH).priest = async F => {
    await UI.say([["priest", M.cycle("pr.n", ["The Harvest Office thanks you for your visit. Please do not touch the ledgers; they are warm.", "We are soft-spoken here. The stone does the loud work.", "The sun sees all work. It is a comfort, I find."])]]);
  };
  S.gather.ledgerPage = async F => {
    if (F.f("g.ledger")) return false; F.set("g.ledger"); F.set("lore.ledger"); F.give("ledgerPage", 1, true); F.sfx("coin");
    await UI.say([["narr", "On the priests' table a ledger lies open under a paperweight of black glass. You copy the last page into your Field Journal: \"Lot 7 (Academy stock). Received complete, as agreed. Signed, the Harvest Office.\""], ["hero", "(That is the lab's numbering. As agreed...)"]]);
  };
  S.done.s1Fight = F => F.f("ch3.s1");
  S.trigger.s1Fight = async F => {
    if (F.f("ch3.s1")) return;
    if (![1, 2, 3].every(n => F.f("pyr.gate" + n))) { await UI.say([["narr", "The summit stair ends at a crank-gate, chained and warm to the touch. The three pens below keep the cranks."]]); return; }
    F.music("pyramid"); await F.banter("collar");
    const ok = await S.generalScene(F, 1, {
      level: 15, soldiers: [["legionOptio", 13, " B"]], bg: "pyramid", title: "General of the Legions", place: "the Coil Hill altar", where: "It ran east, toward the river.", fx: 120, fy: -6, banter: "s1",
      setup: async c => {
        const h = c.hero; c.tint("#241008", 0.25, 400);
        c.actor("cs", { art: "npcCollarsmith", x: h.x + 110, y: h.y - 20, name: "Collarsmith", flip: true });
        await c.pan(h.x + 160, h.y - 30, 900);
        await c.say([["narr", "The summit: a stone platform, a ring of obsidian, a chain as thick as an arm bolted to the altar. Soldiers kneel in a ring. At the end of the chain, something large stands very still."], ["collarsmith", "The sun sees it."]]);
        c.shake(2, 500); c.sfx("hitHeavy"); await c.wait(400); c.follow(); c.remove("cs");
      },
      after: ["(East, toward the river. Wherever that is, it is not here.)"],
    });
    if (!ok) return;
    F.set("ch3.s1");
    await UI.say([["narr", "Behind the altar a chest stands open to the wind, as if the pyramid had stopped caring what it kept."]]);
  };
  S.chest.g11_venomfangLegion = async F => { if (!F.f("ch3.s1")) { await UI.say([["narr", "The chest is wrapped in the altar chain. Something still guards the altar."]]); return false; } return S.gearChest2(F, "g11_venomfangLegion", "G11"); };

  // ---------- Boiling Pools ----------
  S.gather.steamstone1 = M.mat("g.steam1", "steamstone", 4, "A white pool the colour of milk. The stones at the bottom sink in your fingers and hiss, and you pull out four, wrapped in your sleeve.", "Steamstone Douse", "fire");
  S.gather.steamstone2 = M.mat("g.steam2", "steamstone", 4, "An orange pool, hotter than it looks. Four steamstones, steaming in your gauntlet.", "Steamstone Douse", "fire");
  S.gather.steamstone3 = M.mat("g.steam3", "steamstone", 4, "Under the pink rock a small pool simmers. You work four stones free with a knife.", "Steamstone Douse", "fire");
  S.chest.poolsChest = M.loot("c.pools", [["ember", 1]], 120, "A chest on the boardwalk, warm from the rock below. One Ashen Ember glows inside, and a purse of kakal.");
  T("boilingPools").bather = async F => {
    await UI.say([["bather", M.cycle("bt.n", ["Hot-spring stone teaches you to douse a fire, they say. I only know it teaches my knees to forgive me.", "Do not stare at the pink rock. It stares back, a little.", "I have sat in this pool since the old emperor. The old emperor was better. No, he was not. But I miss his hat."])]]);
  };

  // ---------- legends of chapter 3 and 4: a reveal scene, then the same fight and reward as the generic legend ----------
  M.legend = (id, o) => async (F, info) => {
    const l = Data.LEGENDS[id]; F.music("legend"); await UI.say(o.intro);
    const i = await F.ask(l.n, [{ label: "Face it" }, { label: "Back away" }], { top: "38%" });
    if (i !== 0) { F.music(F.regionMusic()); return false; }
    await Cinema.boss({ id: o.enemy, name: l.n, title: o.title, bg: o.bg, music: "legend", lines: o.lines });
    F.checkpoint();
    const res = await F.fight([F.mkEnemy(o.enemy, (info && info.level) || o.level)], { noFlee: true, music: "legend", goldMult: 0, xpBonus: 1.5, intro: o.fightIntro, bg: F.arenaOf(G.region) });
    if (res !== "win") { F.music(F.regionMusic()); return false; }
    F.set(id.toLowerCase() + ".done"); const g = Math.round(10 * Systems.m(l.ch)); G.gold += g; UI.toast("+" + g + " kakal", 2400);
    await Systems.giveReward(l.reward, l.ch); if (o.after) await UI.say(o.after);
    return true;
  };
  Data.LEGENDS.L2.level = 15; Data.LEGENDS.L3.level = 21;
  S.legend.L2 = M.legend("L2", { enemy: "shearwing", level: 15, bg: "jungle", title: "The Razor Sunbird", fightIntro: "Shearwing screams down out of the canopy!",
    intro: [["narr", "A shape crosses the canopy light: a bird of beaten gold, every feather an edge. It circles once, as if it had been waiting for you."]],
    lines: [["narr", "A sunbird as long as a wagon folds its wings and drops. The leaves it passes fall in two halves."], ["hero", "(It cut a banner in half in one pass. I have no banner.)"]],
    after: [["narr", "Shearwing lands, quite gently, and bows its head to you before the light goes out of its feathers. On the ground lie the pieces of a very old armour."]] });

  // ---------- Story.finish[3] / the end of chapter 3 for dbg.jump ----------
  S.finish[3] = (F, G) => {
    ["ch3.start", "ch3.landed", "ch3.patrolRun", "ch3.ninefold", "ch3.kessa1", "ch3.fort", "ch3.s1", "ch3.done", "ch4.start", "sh.landed", "tl.seen", "nf.seen", "gm.seen", "rr.seen", "coil.seen", "fort.cellKey", "fort.cells", "m1.done"].forEach(k => (G.flags[k] = true));
    ["m_landing", "m_pass", "m_coil", "m_boat"].forEach(q => (G.quests[q] = "done")); G.quests.m_canopy = 0;
    F.giveGear("G42", 3, true); F.giveGear("G11", 3, true); G.items.ocelanSeal = 1; G.flags["wagon.at"] = "tamarsLanding";
    G.gold += 600; G.items.sunwater = (G.items.sunwater || 0) + 6;
    const g = S.generalFor(1); if (g) { G.flags["gen.freed.1"] = true; S.noteGeneral(g.id, "Freed at the Coil Hill altar. It ran east, toward the river."); }
    G.ch = 3; G.lastTown = "redrootCamp";
  };
})();
