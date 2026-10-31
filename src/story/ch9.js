// Chapter 9 script, The Prison Break: Ashfeather Camp, the Rootdeep Approach, the Black Mirror (S16, S17), cell nine and the return, the Hollow Nest (K7) and Hearthkin, the edge of Rootdeep at dawn,
// Rootdeep (S18) and the Root Gnawer (T6), the Silver Cup, the hand-off (owner: STORY-M4). Shared helpers: window.Story.m4 (ch7.js, ch8.js). Spec: ../game-mechanics/specs/M4.md.
// Parts: 1 data, regions; 2 the camp, bounties, K7 and Hearthkin, Silver Cup; 3 the Black Mirror, cell nine; 4 the dawn bridge, Rootdeep, T6, hand-off, finish.
"use strict";
(function () {
  const S = window.Story, D = window.Data, Q = Object.assign, M2 = S.m2, M3 = S.m3, M = S.m4, T = M.T;
  S.begin = S.begin || {}; S.legend = S.legend || {}; S.done = S.done || {};
  M3.people([["hearthkin", "Hearthkin", "i"], ["herald", "Herald", "t"], ["smith", "The Collar-Smith", "t"], ["tamer", "Prisoner tamer", "s"], ["deserter", "Prisoner", "m"], ["flockman", "Prisoner", "s"]]);

  // ---------- goods, quests ----------
  Q(D.GOODS, {
    collarTool: ["Collar-Smith's Tool", 66], blackGlass: ["Black Glass Shard", 64], rootMarrow: ["Root Marrow", 58], gnawTooth: ["Gnawling Tooth", 62], ashPinion: ["Ash-Grey Pinion", 60], mothWing: ["Cinder-Moth Wing", 54], thornScale: ["Thornback Scale", 64], paleFang: ["Pale Hound Fang", 56],
  });
  Q(D.QUESTS, {
    m_dawn: { t: "The Edge of Rootdeep", main: true, ch: 9, steps: ["The emperor stands at the edge of Rootdeep every dawn. Cross the root-chasm bridge when the mist is green."] },
    m_gnawer: { t: "The Root Gnawer", main: true, ch: 9, steps: ["Go down into Rootdeep. Whatever is chewing toward the Great Pyramid is at the bottom. It hides inside the root it has dug; fire is the only thing it fears."] },
    bounty7: { t: "Bounty: Collar-Smith's Tools", ch: 9, steps: ["The scout at Ashfeather Camp wants three Collar-Smith's tools from the Black Mirror forge (0/3)."] },
    bounty8: { t: "Bounty: Gnawlings", ch: 9, steps: ["Five Gnawlings off the Rootdeep roads (0/5). Report to the scout."] },
    bounty9: { t: "Bounty: The Cliff Road", ch: 9, steps: ["Clear the cliff road to the Black Mirror: six of the prison's patrol (0/6). Report to the scout."] },
  });
  D.QUESTS.m_prison.steps = ["The Villa's ledgers say it: cell nine of the Black Mirror holds one creature, to be kept alive. Find the prison.", "The Black Mirror stands on the cliffs past the Rootdeep Approach. The Warden carries the cell key."];

  // ---------- inns, shops, rumours ----------
  const RESN = M.BAS.concat(M.CURES, ["tonic", "ember", "incense", "candle"], M.BOMBS, ["cinderWard", "rimeWard", "venomWard"]);   // Storm-Ward not yet
  Q(D.INNS, { ashfeatherCamp: { n: "The Cracked Mirror", mult: 0.5 } });
  Q(D.SHOPS, { ashfeather: { n: "Ashfeather Camp stores", who: "merchant", stock: RESN, disc: M.disc(RESN, 0.9), buys: 1.0 } });
  M3.rumours("ashfeatherCamp", ["The Gnawer hides inside the root it has dug. Burn the root and it screams.", "The prisoners say there is a creature in cell nine that does not stop singing.", "The emperor left the palace to be here. He stands at the edge of Rootdeep every dawn."],
    [M3.clue(16, 0), M3.clue(17, 0), M3.clue(18, 0)]);

  // ---------- bestiary, drops, breaks ----------
  Q(D.BEST, {
    prisonGuard: "Black helm, tower shield, an iron club. Sturdy. Lightning finds the gaps.", warderSpearman: "A warder with a long spear that reaches the second row. Impact breaks his stance.",
    collarSmith: "An artisan soldier with a hammer and a satchel of collars. He powers up the one beside him every turn. Take him first.", prisonHound: "A pale hound that bites to slow. Fire makes it let go.",
    rootWorm: "A worm that lives inside a root. Fire dries the root and the worm with it.", rootboundTroll: "A troll woven through with roots. Tanky, slow. Fire cuts the roots.",
    gnawling: "A young kin of the Gnawer, mostly mouth. It chews the buffs off your creatures. Fire.", blackMirrorWraith: "A prisoner's ghost in a shard of black glass. The first spell you cast at it is thrown back. After that it is only a ghost.",
    thornbackDragonet: "A small dragon with a back of thorns. Do not hit it with your bare hands. Water.", ashwingOwl: "An ash-grey owl that dives from the dark. Shock, and it falls.",
    cinderMothSwarm: "Moths that burn whatever they touch. Water, and they go out.", smokePhoenixChick: "A grey chick on a puff of smoke. It rises from its ashes once; stop it first.",
    hollowNestGuardian: "The tree's heart is hollow, and the hollow is full of legs. Fire, twice.", rootGnawer: "A worm of bark and teeth. It hides inside the root it has dug. Fire.",
    vaulthorn: "The arena's silver champion. Beautiful, and collared.",
  });
  Q(D.DROPS, {
    prisonGuard: [["blackGlass", 0.35], ["legionCoin", 0.5]], warderSpearman: [["legionCoin", 0.5]], collarSmith: [["collarTool", 0.7]], prisonHound: [["paleFang", 0.45]], rootWorm: [["rootMarrow", 0.45]], rootboundTroll: [["rootMarrow", 0.5]],
    gnawling: [["gnawTooth", 0.5]], blackMirrorWraith: [["blackGlass", 0.5]], thornbackDragonet: [["thornScale", 0.45]], ashwingOwl: [["ashPinion", 0.45]], cinderMothSwarm: [["mothWing", 0.5]],
  });
  Q(D.BREAKS, { hollowNestGuardian: "Fire, twice in a row. The nest is only ash waiting for a spark.", rootGnawer: "Burn the roots it hides in. Hit it with fire while it is hiding, until the roots are gone." });

  // ---------- regions ----------
  const yes = () => true, RG = M3.region;
  RG("ashfeatherCamp", { n: "Ashfeather Camp", bg: "bg_ruins", arena: "roots", music: "rebelCamp", town: "ashfeatherCamp", inn: "ashfeatherCamp", autos: ["ashfeatherArrive", "ashfeatherReturn"],
    npcs: [["innkeeper", "The Cracked Mirror"], ["merchant", "Camp stores"], ["imela", "Imela, at the long table"], ["oldDunmar", "The Menagerie Wagon", s => s.f["wagon.at"] === "ashfeatherCamp"], ["captainDahl", "Captain Dahl"], ["kessa", "Kessa Vorn", s => s.f["ch9.cell9"]],
      ["dorrin", "Dorrin Hale", s => s.f["ch9.cell9"]], ["mayle", "Mayle Tarn", s => s.f["ch9.cell9"]], ["scout", "The scout at the bounty rope"], ["r1", "A fighter"], ["r2", "A cook"], ["r3", "A child"]],
    exits: [["rootdeepApproach", "The root road", yes]], things: [] });
  RG("rootdeepApproach", { n: "Rootdeep Approach", bg: "bg_ruins", arena: "roots", music: "roots", table: "roots", fields: true, overland: true, autos: ["dawnAuto"],
    exits: [["ashfeatherCamp", "Back to Ashfeather Camp", yes], ["blackMirrorPrison", "The cliff road to the Black Mirror", yes], ["hollowNest", "The ash-tree", yes], ["rootdeep", "The descent into Rootdeep", s => s.f["ch9.s17"]], ["weepingSea", "The sea dock", yes]],
    things: [["dawnBridge", "A rope bridge over the root-chasm", s => s.f["ch9.cell9"] && !s.f["ch9.dawn"], "trigger"], ["approachChest", "A chest wedged in the roots", s => !s.f["c.approach"], "chest"]] });
  RG("blackMirrorPrison", { n: "Black Mirror Prison", bg: "bg_ruins", arena: "prison", music: "prison", table: "prison", fields: true, dungeon: true, autos: ["prisonEnter"],
    npcs: [1, 2, 3, 4, 5, 6, 7, 8].map(n => ["cell" + n, "Cell " + n]), exits: [["rootdeepApproach", "Back down the cliff road", yes], ["prisonCellNine", "The glass door to cell nine", s => s.f["ch9.s17"]]],
    things: [["wardenS16", "The courtyard gate", s => !s.f["ch9.s16"], "trigger"], ["forgeS17", "The collar-forge", s => s.f["ch9.s16"] && !s.f["ch9.s17"], "trigger"], ["prisonStore", "The prison store", s => s.f["ch9.s16"] && !s.f["c.prison"], "chest"]] });
  RG("prisonCellNine", { n: "Cell nine", bg: "bg_ruins", arena: "prison", music: "hope", exits: [["blackMirrorPrison", "Back along the glass corridor", s => s.f["ch9.cell9"]]], things: [["cellNine", "The glass cell at the end of the corridor", s => !s.f["ch9.cell9"], "trigger"]] });
  RG("hollowNest", { n: "The Hollow Nest", bg: "bg_ruins", arena: "hollowTree", music: "roots", table: "nest", fields: true, dungeon: true, autos: ["nestEnter"],
    exits: [["rootdeepApproach", "Back out of the tree", yes]],
    things: [["fire1", "A cold brazier by the first drift", s => !s.f["nest.f1"], "trigger"], ["fire2", "A cold brazier under the burnt bough", s => !s.f["nest.f2"], "trigger"], ["fire3", "A cold brazier at the stair", s => !s.f["nest.f3"], "trigger"],
      ["vent1", "A wind vent in the trunk wall", s => !s.f["nest.open"], "trigger"], ["vent2", "A second wind vent", s => !s.f["nest.open"], "trigger"], ["vent3", "A third wind vent", s => !s.f["nest.open"], "trigger"],
      ["nestGuardian", "The heart of the hollow tree", s => s.f["nest.open"] && !s.f["k7.done"], "trigger"], ["g24_shieldbearerAviary", "A chest in the ash", s => s.f["k7.done"], "chest"]] });
  RG("rootdeep", { n: "Rootdeep", bg: "bg_ruins", arena: "roots", music: "roots", table: "rootdeep", fields: true, dungeon: true,
    exits: [["rootdeepApproach", "Back up to the Approach", yes]],
    things: [["sentinelS18", "A collar altar at the mid-descent", s => !s.f["ch9.s18"], "trigger"], ["gnawerFight", "The Gnawer's den", s => s.f["ch9.s18"] && !s.f["ch9.t6"], "trigger"], ["gnawerTablet", "A builder tablet at the den's mouth", s => s.f["ch9.s18"], "gather"], ["rootdeepChest", "A chest among the chewed roots", s => !s.f["c.rootdeep"], "chest"]] });
})();

// ---------- part 2: the voyage, Ashfeather Camp, bounties, the Hollow Nest (K7), Hearthkin, the Silver Cup ----------
(function () {
  const S = window.Story, D = window.Data, Q = Object.assign, M2 = S.m2, M3 = S.m3, M = S.m4, T = M.T, say = M.say, thought = M.thought, stage = M.stage, once = M.once, cycle = M.cycle;
  const hub = M.hub;

  S.begin[9] = async F => {
    G.ch = 9; F.set("ch9.start"); F.set("wagon.at", "ashfeatherCamp"); F.music("voyage");
    await Cinema.voyage({ from: "paleGate", to: "rootdeepApproach", text: "North along the jungle coast, to where the roots come down to the sea.", mood: "night" });
    await Cinema.title("Chapter 9", "The Prison Break");
    F.music("rebelCamp"); F.save(true);
    F.go("ashfeatherCamp", "from_rootdeepApproach");
  };
  S.start[9] = { region: "ashfeatherCamp", entry: "from_rootdeepApproach" };

  // ---------- 8.0 Ashfeather Camp ----------
  S.trigger.ashfeatherArrive = async F => {
    if (!once(F, "ch9.arrived")) return;
    if (G.ch < 9) G.ch = 9; F.set("wagon.at", "ashfeatherCamp"); F.music("rebelCamp");
    await stage(async c => {
      c.tint("#10241c", 0.22, 300);
      M3.actors(c, [["dh", "npcOldGuard", 110, -10, { name: "Captain Dahl", flip: true }], ["im", "npcImela", 190, 18, { name: "Imela", flip: true }]]);
      await c.say([["narr", "A camp under giant roots: rope walkways high in the dark, canvas hung between the buttresses, fires in clay pots, a long table beneath a root that arches like a cathedral door. The ground gives a faint, regular shudder, as if something very large were turning over in its sleep."]]);
      await c.walk("dh", c.hero.x + 50, c.hero.y, 600);
      await c.say([["captainDahl", "Tired. We are all tired. We are also here, which is the main thing."]]);
      c.remove("dh"); await c.pan(c.hero.x + 150, c.hero.y + 10, 700);
      await c.say([["imela", "You came back with the same number of limbs. Good. Eat."]]);
      c.remove("im"); c.tint("#10241c", 0, 400); c.follow();
    }, { music: "rebelCamp" });
    await F.banter("rootdeep");
    F.quest("m_prison", 1);
  };
  S.done.ashfeatherArrive = F => F.f("ch9.arrived");

  S.trigger.dawnAuto = async F => { if (hub()) await S.trigger.dawnBridge(F); };
  S.trigger.ashfeatherReturn = async F => {
    if (F.f("ch9.cell9") && !F.f("ch9.camp")) {
      F.set("ch9.camp"); F.music("hope"); F.quest("m_dawn", 0);
      const id = G.flags["sacrifice.id"] || (G.party[2] && G.party[2].id);
      await stage(async c => {
        c.tint("#10241c", 0.22, 300);
        M3.actors(c, [["im", "npcImela", 110, 4, { name: "Imela" }], ["rt", id, 60, 14, { name: F.nameOf(id) }]]);
        await c.say([["narr", "The long table, in grey light. Imela has not slept: the cup in front of her is cold, and the shawl is on the wrong shoulder. She looks up. She sees the one who came back."]]);
        await c.walk("im", c.hero.x + 80, c.hero.y + 6, 900);
        await c.say([["narr", "She puts her hand on its head. She does not say anything. She keeps it there until the creature closes its eyes."]]);
        c.remove("im"); c.remove("rt"); c.tint("#10241c", 0, 600); c.follow();
      }, { music: "hope" });
    }
    if (F.f("ch9.t6") && !F.f("ch9.done")) await M.letterScene(F);
  };
  S.done.ashfeatherReturn = F => true;

  M3.talkTown("ashfeatherCamp", { innLine: "The Cracked Mirror, named for a shard of black glass the cook found in the mud and refuses to throw out. A bunk, a bowl, and the ground humming under it.", inn: "ashfeatherCamp",
    shopLine: "Camp stores. Not much, but all of it is clean. Do not ask what happened to the dirty stock.", shop: "ashfeather", who: ["fighter", "oldwoman", "child"],
    small: [["It shakes at dawn. It shakes at dusk. I have given up asking it to stop.", "My feet know the ground is thinking. I do not like it."], ["The roots above us are older than the empire. They are kinder than the empire."], ["Mama says do not go near the edge. The edge is where the man stands.", "I saw the man once. He did not look at me. He looked at the hole."]] });
  T("ashfeatherCamp").captainDahl = async F => {
    await say("captainDahl", cycle("dh", ["We lost the bridge twice this month. We built it back three times. The arithmetic does not matter. It is the habit.", "The Corps wanted to garrison us. I said we are a camp, not a barracks. They said what is the difference. I said, the singing.", "If the emperor stands at the edge, he is not at the palace. If he is not at the palace, he is not looking at the roads. That is the whole of my plan. It is not much of a plan.", "Eat. I do not give orders. I only suggest, with feeling."]));
  };
  T("ashfeatherCamp").imela = async F => {
    if (F.f("ch9.done")) { await say("imela", "Whenever you are ready. I will be here with the tea."); await M.sailToSaltmere(F); return; }
    if (F.f("ch9.t6")) { await say("imela", "Go. Rest. Then go again."); return; }
    if (F.f("ch9.dawn")) { await say("imela", cycle("imd", ["He offered you a gift. I know the voice he did it in. Keep your hands in your pockets for a week.", "Fire, the rumour said. Take plenty of it."])); return; }
    if (F.f("ch9.cell9")) { await say("imela", cycle("imc", ["You are tired. Sleep. The thing in the roots will not move before the morning. I have never known it to.", "She is eating? Good. Watch that she eats."])); return; }
    await say("imela", cycle("ima", ["Cell nine is in the Black Mirror. Rest, and then go. You know how that goes, don't you? I do.", "I am not going to tell you what to say to her. You will know. Sparrow, you always know. You just do not say it for a day.", "The key for the glass doors hangs on the Warden's belt. I have that from a laundress. Of course I have it from a laundress."]));
  };
  T("ashfeatherCamp").kessa = async F => { await say("kessa", cycle("ks9", ["I am not going to say it was nothing. I am going to say you are still annoying.", "Emberwick likes it here. The fires are the right size.", "Go. I will watch the rope bridge. Somebody ought to."])); };
  T("ashfeatherCamp").dorrin = async F => { await say("dorrin", cycle("dr9", ["Boss says no pie. The pie is in my pocket. The pocket is a long story.", "There is a mushroom in the roots that tastes of cheese. I am not telling Mayle."])); };
  T("ashfeatherCamp").mayle = async F => { await say("mayle", cycle("my9", ["The Gnawer has dug a spiral. Down, always down. Page sixty. It is not wandering; it is being led.", "The ground shakes every four hours. Not randomly. On a schedule."])); };
  M.sailToSaltmere = async F => {
    const i = await F.ask("Sail for Saltmere?", [{ label: "Sail" }, { label: "Not yet" }], { top: "40%" });
    if (i !== 0) return;
    if (S.begin[10]) await S.begin[10](F);
    else await UI.say([["narr", "The ship leaves the roots behind. To be continued in Chapter 10."]]);
  };

  // ---------- the bounty board at the camp ----------
  const base = k => (G.kills[k] || 0);
  const BQ = {
    bounty7: { give: "Three of the Collar-Smith's tools, from the Black Mirror forge. Hammer-heads, tongs, anything with a collar's blue on it. I will have them melted for horseshoes.", ready: F => (G.goods.collarTool || 0) >= 3, take: F => { G.goods.collarTool -= 3; },
      left: F => `Tools: ${Math.min(3, G.goods.collarTool || 0)} of 3. The Black Mirror forge.`, gold: 4, pay: "Three tools, and still warm from the forge. They will pull a plough for years. Here is your coin." },
    bounty8: { give: "Five Gnawlings off the Rootdeep roads. They chew the buffs off your creatures; fire stops them. The scouts are tired of losing their lunches.", start: F => { G.flags["b8.base"] = base("gnawling"); },
      ready: F => base("gnawling") - (G.flags["b8.base"] || 0) >= 5, left: F => `Gnawlings: ${Math.max(0, base("gnawling") - (G.flags["b8.base"] || 0))} of 5.`, gold: 4, pay: "Five fewer. The scouts will eat their lunches in peace. Here." },
    bounty9: { give: "Clear the cliff road to the Black Mirror: six of the prison's patrol. Guards, warders, whatever walks it in a helm. The road is the only way up.", start: F => { G.flags["b9.base"] = base("prisonGuard") + base("warderSpearman"); },
      ready: F => base("prisonGuard") + base("warderSpearman") - (G.flags["b9.base"] || 0) >= 6, left: F => `Patrol: ${Math.max(0, base("prisonGuard") + base("warderSpearman") - (G.flags["b9.base"] || 0))} of 6.`, gold: 4, pay: "The cliff road is quiet. A wind is the only thing on it. That is worth a purse." },
  };
  T("ashfeatherCamp").scout = async F => { await M.board(F, "scout", ["bounty7", "bounty8", "bounty9"], BQ, "The bounty rope at Ashfeather Camp"); };

  // ---------- 8.C K7: the Hollow Nest ----------
  S.trigger.nestEnter = async F => {
    if (!once(F, "nest.seen")) return;
    F.music("roots"); F.quest("m_k7", 0);
    await stage(async c => {
      c.tint("#2a1a10", 0.3, 400);
      await c.say([["narr", "A giant hollow tree, as wide as a hall, drifted with grey ash to the knee. Burnt branches make walkways over empty nests the size of cart-beds. Embers glow in the walls like eyes. A cold updraught roars up the middle of the trunk and pulls at your cloak."], ["hero", "(It burned once. It never got over it.)"]]);
      c.tint("#2a1a10", 0.1, 600); c.follow();
    }, { music: "roots" });
  };
  S.done.nestEnter = F => F.f("nest.seen");
  Q(D.QUESTS, { m_k7: { t: "The Hollow Nest", ch: 9, steps: ["A cage in the Menagerie Wagon wants an ash-wood key. The Hollow Nest is an old burnt tree at the south-west edge of the Rootdeep Approach, where thorn bushes grow round a charred branch. It is full of ash and fire."] } });
  [1, 2, 3].forEach(n => {
    S.done["fire" + n] = F => F.f("nest.f" + n);
    S.trigger["fire" + n] = async F => {
      if (F.f("nest.f" + n)) return; F.set("nest.f" + n); F.sfx("fire");
      await UI.say([["narr", ["You strike a spark into the first brazier. It catches slowly, then roars; the ash-drift across the corridor lifts on the heat and blows away in flakes.", "The second brazier smokes, then lights. A drift of old nest-material, three feet deep, burns away like paper.", "The third brazier takes at once. A whole wall of ash falls in on itself and the stair beyond it is clear."][n - 1]]]);
      if ([1, 2, 3].every(k => F.f("nest.f" + k))) { F.set("nest.open"); await UI.say([["narr", "The last drift burns away. At the top of the stair the trunk opens into a great hollow, and in the hollow something shifts, with a sound like a hundred slow wings."]]); }
    };
    S.done["vent" + n] = F => F.f("nest.open");
    S.trigger["vent" + n] = async F => {
      const k = "nest.v" + n, v = !G.flags[k]; G.flags[k] = v;
      await UI.say([["narr", v ? "You wedge the vent open. The grate glows dull orange and a breath of warm embers climbs the updraught; the cold air bends round the corner." : "You push the vent shut. The wind drops, and the ash settles on your shoulders."]]);
    };
  });
  S.done.nestGuardian = F => F.f("k7.done");
  S.trigger.nestGuardian = async F => {
    if (F.f("k7.done")) return;
    if (!hub() && !F.f("nest.open") && !F.f("nest.f1")) { await UI.say([["narr", "Ash blocks the corridor to the heart of the tree. It would burn."]]); return; }
    const ok = await M3.keyBoss(F, { id: "hollowNestGuardian", level: 54, k: "k7", key: "keyK7", name: "The Nest Guardian", title: "Keeper of the Ash", bg: "hollowTree",
      lines: [["narr", "The hollow is full of legs. The Nest Guardian unfolds from the wall of the tree: a body of grey chitin and ash, a hundred small wings folded on its back, and eyes the colour of banked coals."], ["hero", "(It has been alone in here since the fire.)"]],
      stage: async c => { c.tint("#2a1a10", 0.3, 500); c.sfx("encounter"); c.fx("embers", c.hero.x + 100, c.hero.y - 20, { ms: 2200 }); await c.say([["narr", "The updraught drops to a whisper. Every ember in the wall of the tree goes dark at once."]]); },
      after: [["narr", "The wings fold. The ash falls from its back in a long grey sheet and the thing lies quiet at last. On a branch above it, a key of grey ash-wood, still warm in the middle."], ["hero", "(Whatever it kept, it kept to the end.)"]] });
    if (ok) await UI.say([["narr", "In a hollow of the ash, a chest the burn never reached."]]);
  };
  S.chest.g24_shieldbearerAviary = M.gearChest("g24_shieldbearerAviary", "G24", "k7.done", "The chest is in the hollow of the heart-tree, behind the Guardian.");

  // ---------- 8.C Hearthkin ----------
  M.hearthkinScene = async F => {
    F.take("keyK7", 1); F.set("k7.freed");
    const u = F.mk("hearthkin", Math.max(3, F.avgLevel() - 1)); G.collection.push(u); G.best.hearthkin = G.best.hearthkin || { seen: 1, beaten: 0 };
    await M.stage(async c => {
      const h = c.hero; c.sfx("door"); c.tint("#10241c", 0.16, 300);
      M3.actors(c, [["im", "npcImela", 150, 8, { name: "Imela", flip: true }], ["dun", "npcDunmar", -60, 6, { name: "Dunmar" }]]);
      await c.cageOut("hk", "hearthkin", { fx: "embers", before: [["dunmar", "Hold the lantern, lad. Mind the lock. It's ash-wood, and ash-wood does what it wants."]], desc: [["narr", "The cage door swings open on a warm breath of ash. A small bear-like thing, the size of a hearth-dog, with a belly that glows like a banked ember, steps down onto the boards, sniffs the air once, and freezes."]] });
      await c.say([["hearthkin", "I know that smell. Bread and thyme and a window left open."]]);
      c.emote("im", "!"); c.sfx("break"); await c.wait(500);
      await c.say([["narr", "Somewhere behind you a cup hits the table, rolls, and does not break."], ["imela", "Hearthkin. You little thief. You took my kettle."], ["hearthkin", "I did not take it. I minded it. Someone had to mind it."]]);
      await c.say([["dunmar", "...Nineteen years it sat in my cages. And I never once asked whose kitchen it minded."], ["hero", "It remembers the house."], ["imela", "It remembers more than I do."]]);
      await c.cageBack("hk"); c.remove("im"); c.remove("dun"); c.tint("#10241c", 0, 500); c.follow();
    }, { music: "hope" });
    F.set("k7.done"); F.questDone("m_k7"); UI.toast("Hearthkin joins the collection.", 3400);
  };
  S.trigger.hearthkinFreed = async F => { if (F.item("keyK7") > 0 && !F.f("k7.freed")) await M.hearthkinScene(F); };
  const w8 = M3.wagon;
  M3.wagon = async F => {
    if (F.item("keyK7") > 0) { if (G.region === "ashfeatherCamp") { await M.hearthkinScene(F); return true; } await say("dunmar", "The wagon is at Ashfeather Camp now, lad. The front needs medicine and cages. Take it there."); return false; }
    return w8(F);
  };
  T("ashfeatherCamp").oldDunmar = async F => {
    if (F.item("keyK7") > 0 || F.item("keyK6") > 0) { await M3.wagon(F); return; }
    await say("dunmar", cycle("dm9", ["The front needs medicine and cages, lad. So the wagon came. A cage of ash-wood, grey, warm in the middle. It wants a nest key. The old burnt tree at the south-west edge of the Rootdeep Approach, past the thorn bushes. The ash there is knee-deep.", "Nineteen years of crates going east, and I never asked. I am asking now. Everyone I ask says 'as agreed'.", "Mind the roots. They are older than the cages and they never forget the way home."]));
  };

  // ---------- 8.0 the Silver Cup (Tzavan) ----------
  Q(D.CUPS.silver, { n: "Silver Cup", ch: 9, gear: "G3", note: "Three fights, then Vaulthorn.",
    fights: [{ n: "Jaguar guard", foes: ["jaguarCohortElite", "jaguarCohortElite", "courtPriest"], lv: 52 }, { n: "Palace shields", foes: ["palaceGuard", "palaceGuard", "eagleCohortArcher"], lv: 53 }, { n: "Knives and a crest", foes: ["sunmawCultist", "sunmawCultist", "legionCenturion"], lv: 54 }],
    champion: { n: "Vaulthorn", foes: ["vaulthorn"], lv: 55, intro: "The south gate lifts on its chains, and the arena's silver champion walks out into the light.",
      cinema: () => Cinema.boss({ id: "vaulthorn", name: "Vaulthorn", title: "Champion of the Silver Cup", bg: "colosseum", music: "arenaChampion", lines: [["narr", "Something comes out of the dark on four legs and walks into the light on two: a bull's body in silver plate, an eagle's head under a gold crest, and at its throat a collar of gold wire, worn like a necklace at a feast."], ["hero", "(It is beautiful. That is what they want you to see first.)"]] }) } });
})();

// ---------- part 3: the Black Mirror (S16, the prisoners, the forge S17) and cell nine ----------
(function () {
  const S = window.Story, D = window.Data, Q = Object.assign, M2 = S.m2, M3 = S.m3, M = S.m4, T = M.T, say = M.say, thought = M.thought, stage = M.stage, once = M.once, cycle = M.cycle;
  const hub = M.hub;

  S.trigger.prisonEnter = async F => {
    if (!once(F, "prison.seen")) return;
    F.music("prison");
    await stage(async c => {
      c.tint("#10241c", 0.2, 400);
      await c.say([["narr", "The cliff road. A fortress of black glass stands on the edge, mirror-bright, every wall reflecting the green sky and the long fall under it. Wind whistles in the cracks with a thin high note like a held breath. A crow sits on an empty gibbet and looks at you the way a clerk looks at a late arrival."], ["hero", "(Cell nine. The ledger said: to be kept alive.)"]]);
      c.tint("#10241c", 0, 500); c.follow();
    }, { music: "prison" });
  };
  S.done.prisonEnter = F => F.f("prison.seen");

  S.done.wardenS16 = F => F.f("ch9.s16");
  S.trigger.wardenS16 = async F => {
    if (F.f("ch9.s16")) return;
    F.music("tension");
    const ok = await M.general(F, 16, { level: 52, soldiers: [["prisonGuard", 51, " B"], ["prisonGuard", 51, " C"]], bg: "prison", title: "The Black Mirror Warden", place: "the courtyard gate of the Black Mirror", where: "It went over the cliff edge, and the wind held it up.", fx: 130, fy: -4,
      setup: async c => {
        const h = c.hero; c.tint("#10241c", 0.25, 400);
        M3.actors(c, [["wd", "npcWarden", 170, -30, { name: "The Warden", flip: true }]]);
        await c.pan(h.x + 120, h.y - 10, 900);
        await c.say([["narr", "The courtyard: black glass underfoot, black glass overhead, and your own reflection walking beside you, one step behind. At the gate a collar altar of black stone, and a creature in an iron harness, standing very still. A woman in a glass-black cloak with a ring of glass keys at her belt watches from the step."], ["wardenPrison", "The Black Mirror holds what the Throne cannot decide about. It is entered in the ledger that the courtyard is closed."]]);
        c.shake(2, 500); c.sfx("hitHeavy"); await c.wait(300); c.follow();
      }, after: ["(Cell nine is behind a glass door. The Warden has the key.)"] });
    if (!ok) return;
    F.set("ch9.s16");
    await stage(async c => {
      M3.actors(c, [["wd", "npcWarden", 70, -6, { name: "The Warden" }]]);
      await c.say([["wardenPrison", "...The key. Take it. I was not paid to be brave."], ["hero", "Where are the others?"], ["wardenPrison", "Eight cells, one for each of the Throne's indecisions. The cell block is behind me. The forge is behind that."]]);
      c.sfx("coin"); c.remove("wd"); c.follow();
    });
    F.give("cellKey", 1, true); UI.toast("Warden's cell key received.", 3000);
  };

  // the eight cells: [speaker, what you see, through the glass, when freed]
  const CELLS = [
    ["deserter", "A legionary sits against the glass with his helm in his lap and his hands between his knees.", "I said no once. Once. They put me where I could hear the sea.", "(he salutes with the wrong hand) I will tell the Weir you came."],
    ["flockman", "A man in the grey of the Ember Flock, a candle stub in his fist.", "Archdeacon Morvane signed my warrant himself. 'Peace is made by those who can bear the price.' I could not.", "The Flock will ask who opened the door. Tell them a man in dark armour. They will not believe it."],
    ["tamer", "A tamer's cord at her wrist, the knot half-undone. There is a long scratch on the glass at eye level, as if a creature had stood there.", "The empire has a place for tamers: black glass and cliff-wind. Cell nine is for what it cannot decide about.", "My creature is in the lower cells. You will have to open those too. ...I will wait. I have had practice."],
    ["laundress", "A woman with blue-stained hands, folding a blanket over and over into thirds.", "I hung the wrong cloth on the wrong day. ...Is Ranna still folding corner to corner?", "Tell the cloth I said hello."],
    ["miner", "A big man, salt-white to the elbows, sits bolt upright and listens.", "Tell the Weir we heard the barges. All the way up here, in the dark. We heard them burn.", "Hush. Not a word. The glass listens."],
    ["narr", "A stag-thing with antlers of black glass lies with its head on its forelegs. Its breath fogs the glass in a slow rhythm. It looks at you without fear.", null, "It rises and bows its head to your creatures, one at a time. Then it goes, without a sound, down the long corridor towards the wind."],
    ["scholar", "A thin man in a clerk's coat, a pen behind his ear and no paper in the cell.", "I wrote the reports. Not the ones you think. The ones where the numbers did not add up. They called me an accountant of treason.", "There is a girl at the camp with a little book? Tell her page forty is right. Tell her I checked."],
    ["boy", "A boy of perhaps twelve, in a coat much too big for him, sitting on the floor with his chin on his knees.", "My father did not come back with the grain. Then they came for the rest of us. Is that how it works?", "Where is the road to Tuk? ...Thank you. I will walk it very fast."],
  ];
  CELLS.forEach(([who, look, glass, free], i) => {
    const n = i + 1;
    T("blackMirrorPrison")["cell" + n] = async F => {
      if (F.f("prison.f" + n)) { await UI.say([["narr", "The cell is empty. The glass door stands open, and the wind goes through it."]]); return; }
      if (!F.item("cellKey")) { await UI.say([["narr", look]]); if (glass) await say(who, glass); else await UI.say([["narr", "It cannot speak. It does not need to."]]); return; }
      await UI.say([["narr", look + " The Warden's key turns the lock of black glass."]]);
      F.set("prison.f" + n); G.flags["prison.freed"] = (G.flags["prison.freed"] || 0) + 1; F.sfx("door");
      if (who === "narr") await UI.say([["narr", free]]); else await say(who, free);
      if (G.flags["prison.freed"] >= 8) await UI.say([["narr", "The last glass door swings open. From one end of the cell block to the other the wind goes through, and for a moment it sounds like a great many people breathing out."]]);
    };
  });
  S.chest.prisonStore = async F => {
    if (!F.f("ch9.s16")) { await UI.say([["narr", "The prison store is behind the courtyard gate."]]); return false; }
    return M2.loot("c.prison", [["ember", 3]], 700, "The prison store: shelves of black glass jars, rations, a locker of confiscated tamer's cords. Three Ashen Embers in a wooden box marked for the Warden's table, and a purse.")(F);
  };

  // ---------- the forge (S17) ----------
  S.done.forgeS17 = F => F.f("ch9.s17");
  S.trigger.forgeS17 = async F => {
    if (F.f("ch9.s17")) return;
    F.music("tension");
    const ok = await M.general(F, 17, { level: 54, soldiers: [["collarSmith", 53, " B"]], bg: "prison", title: "The Collar-Smith's Hound", place: "the collar-forge of the Black Mirror", where: "It went through the forge's glass wall, and the whole hall rang like a bell.", fx: 130, fy: -4,
      setup: async c => {
        const h = c.hero; c.tint("#2a0e08", 0.3, 400);
        M3.actors(c, [["cs", "npcCollarsmith", 170, -30, { name: "The Collar-Smith", flip: true }]]);
        await c.pan(h.x + 120, h.y - 10, 900);
        await c.say([["narr", "A hall of glass and iron: anvils in a row, a furnace that burns blue, and on hooks along the walls, collars. Dozens of them, in all sizes, hung like fruit in an orchard. At the centre of the hall a creature crouches beside the largest anvil like a pet beside its master's chair."], ["collarsmith", "The sun sees it."]]);
        c.shake(2, 500); c.sfx("hitHeavy"); await c.wait(300); c.remove("cs"); c.follow();
      }, after: ["(Hundreds of collars. All of them made here. All of them for one of us.)"] });
    if (!ok) return;
    F.set("ch9.s17"); F.give("cellNineKey", 1, true); F.sfx("door");
    await UI.say([["narr", "The furnace gutters and goes out. On the largest anvil, left in a hurry, lies a small glass key, newer than the others, with a paper tag: \"one creature, to be kept alive.\""]]);
  };

  // ---------- 8.B cell nine ----------
  S.done.cellNine = F => F.f("ch9.cell9");
  S.trigger.cellNine = async F => {
    if (F.f("ch9.cell9")) return;
    const cap = window.Systems && Systems.captive(), id = cap ? cap.id : G.flags["sacrifice.id"], nm = id ? F.nameOf(id) : "it";
    F.music("hope");
    await stage(async c => {
      c.tint("#10241c", 0.28, 400);
      await c.say([["narr", "A glass corridor, very long. Cells on both sides, empty now, the doors open and the wind going through. And from far down at the end, through the glass, a faint voice. Not words. A tune, going round and round."],
        ["narr", "Beside the last door someone has scratched into the wall with a claw, over and over, the same two lines."], ["narr", "Eleven stars through the iron, / one for each of us, and one for the keeper's lamp."],
        ["hero", "(The lab lullaby. Every pen sang it. It was the one thing they all had.)"]]);
      c.tint("#10241c", 0, 400);
    }, { music: "hope" });
    // prompt for cinema/m4_cell_nine.png (panel.mjs): "a small glass cell at the end of a long corridor, a thin tired creature sitting on a stone bench under a high window, pale green light through the glass, claw scratches of a lullaby on the wall, style B"
    await Cinema.panels([{ img: "assets/cinema/m4_cell_nine.png", text: "Cell nine. A bench, a high window, light through black glass. On the bench, thin, collar-marks on its neck, a creature sits singing under its breath.", pan: "inup" }], { music: "hope" });
    if (!id) { await UI.say([["narr", "The bench is empty. The scratches on the wall are the only voice in the cell."]]); }
    else {
      await stage(async c => {
        const h = c.hero; M3.actors(c, [["cr", id, 70, 0, { name: nm }]]); c.face("cr", "left");
        await c.say([["hero", nm + "."]]);
        await c.say([["narr", "Nothing else comes out. The singing stops in the middle of a line."]]);
        c.face("cr", "right"); c.emote("cr", "!"); await c.wait(900);
        await c.say([[id, (D.RETURN_LINES && D.RETURN_LINES[id]) || D.RETURN_FALLBACK || "...You came back."]]);
        await c.say([["hero", "(I did not turn round. I came back.)"]]);
        c.remove("cr");
      }, { music: "hope" });
      const u = Systems.returnCaptive();
      if (u) UI.toast(u.name + " rejoins the team.", 3600);
      const mates = G.party.filter(x => x.id !== id && !x.guest);
      await UI.say(mates.map(m => [m.id, (D.GLAD && D.GLAD[m.id]) || "...You are back."]));
    }
    F.set("ch9.cell9"); F.questDone("m_prison"); F.sfx("break");
    await stage(async c => {
      const h = c.hero; c.tint("#2a1010", 0.25, 300); c.shake(3, 700); c.sfx("encounter");
      await c.say([["narr", "Far above, a bell. Then another. Then all the black glass of the fortress rings together, a long cold chord, and boots begin on the stairs."]]);
      await c.walkHero(h.x - 220, h.y + 30, 1500); c.fx("dust", h.x - 100, h.y + 20); c.shake(2, 500);
      await c.say([["narr", "Down the long corridor, across the courtyard in the first grey light, out the gate and along the cliff road with the wind pushing at your back. Behind you the Black Mirror lights, window by window, the green sky running out of every pane."]]);
      c.tint("#2a1010", 0, 600);
      M3.actors(c, [["ke", "npcKessa", 120, 0, { name: "Kessa", flip: true }], ["em", "emberwick", 90, 14, { name: "Emberwick", flip: true }]]);
      await c.say([["narr", "At the foot of the cliff, a red scarf and a small flame, waiting where the road meets the trees."], ["emberwick", "Kessa says be useful. So. I was."], ["kessa", "Keep it warm. I mean the creature. And you."]]);
      c.remove("ke"); c.remove("em"); c.follow();
    }, { music: "hope" });
    if (window.Systems && Systems.guest()) { Systems.guestLeave(); }
    await F.banter("returned");
    F.save(true);
    F.go("ashfeatherCamp", "from_rootdeepApproach");
  };
})();

// ---------- part 4: the edge of Rootdeep at dawn, Rootdeep (S18), the Root Gnawer (T6), the letter and the hand-off, Story.finish[9] ----------
(function () {
  const S = window.Story, D = window.Data, Q = Object.assign, M2 = S.m2, M3 = S.m3, M = S.m4, T = M.T, say = M.say, thought = M.thought, stage = M.stage, once = M.once, cycle = M.cycle;
  const hub = M.hub;
  D.LORE.gnawerTablet = "A builder tablet at the mouth of the Gnawer's den: \"We set the last chewer under the roots, to bite the sun if the sun falls.\"";

  // ---------- 8.D the dawn bridge ----------
  S.done.dawnBridge = F => F.f("ch9.dawn");
  S.trigger.dawnBridge = async F => {
    if (!F.f("ch9.cell9") || F.f("ch9.dawn")) return;
    F.set("ch9.dawn"); F.music("tension");
    await stage(async c => {
      const h = c.hero; c.tint("#2a5a3a", 0.3, 800);
      M3.actors(c, [["dv", "npcDavichi", 330, -20, { name: "", flip: true }], ["g1", "npcLegionGuard", 620, -10, { flip: true }], ["g2", "npcLegionGuard", 640, 30, { flip: true }], ["g3", "npcLegionGuard", 660, -30, { flip: true }], ["g4", "npcLegionGuard", 680, 10, { flip: true }]]);
      await c.say([["narr", "Dawn, with the mist running green through the roots. A rope bridge over a chasm so deep that the light never reaches the bottom. Forty paces along it, at the rail, a man in plain dark robes stands with a small lantern in one hand. Four guards wait a long way behind him. He does not turn."]]);
      await c.walkHero(h.x + 140, h.y - 10, 1800);
      await c.say([["davichi", "You are earlier than I expected. Sit. You have walked a long way. It is entered in the ledger."], ["hero", "I will stand."], ["davichi", "Then stand. I will not ask you to kneel. It is a waste of a knee."]]);
      await c.say([["davichi", "You took her from me. I want you to know I am not angry. Anger is a bill I stopped paying in my thirties."], ["davichi", "I have your name in my ledger. Would you like to hear it?"], ["hero", "No."], ["davichi", "Good. A man should keep one thing the Throne has not priced."]]);
      c.shake(1, 500); c.emote("dv", "..."); await c.wait(500);
      await c.say([["davichi", "Your master drives a fair bargain. I have never once regretted it."], ["narr", "You flinch. The lantern does not."]]);
      await c.say([["davichi", "Every Titan you kill is a yield lost to me. Every Titan I bind is a yield gained. You have the gift. I have the throne. Your mother is free, as a sign of good faith. Come home."], ["hero", "No."], ["davichi", "Then I will watch. It is entered in the ledger that I offered."]]);
      c.face("dv", "right"); await c.wait(700);
      c.remove("g1"); c.remove("g2"); c.remove("g3"); c.remove("g4"); c.tint("#2a5a3a", 0.1, 600);
    }, { music: "tension" });
    // prompt for cinema/m4_dawn_bridge.png (panel.mjs): "an elegant lean man in plain dark robes at the rail of a rope bridge at dawn holding a small lantern, green mist, a vast root-chasm below, a young armoured tamer standing forty paces away, style B"
    await Cinema.panels([{ img: "assets/cinema/m4_dawn_bridge.png", text: "He turns for the first time: a lean, courteous face, tired around the eyes. Then he looks down into the chasm, as if the conversation were over.", pan: "inup" }], { music: "tension" });
    await stage(async c => { c.remove("dv"); c.tint("#2a5a3a", 0, 500); c.follow(); });
    F.questDone("m_dawn"); F.quest("m_gnawer", 0); F.music("roots");
    await F.banter("dawn");
  };

  // ---------- 8.E Rootdeep: the sentinel (S18) and the Root Gnawer (T6) ----------
  S.chest.approachChest = M2.loot("c.approach", [["tonic", 4]], 600, "A chest wedged in the roots above the chasm, wrapped in oilcloth and moss. Four Clearwater Tonics and a purse. The oilcloth is a scout's; the scout never came back for it.");
  S.done.sentinelS18 = F => F.f("ch9.s18");
  S.trigger.sentinelS18 = async F => {
    if (F.f("ch9.s18")) return;
    F.music("tension");
    const ok = await M.general(F, 18, { level: 56, soldiers: [["rootboundTroll", 54, " B"], ["rootboundTroll", 54, " C"]], bg: "roots", title: "The Rootdeep Sentinel", place: "the collar altar in Rootdeep", where: "It went up through the chewed galleries, toward the light.", fx: 130, fy: -4,
      setup: async c => {
        const h = c.hero; c.tint("#08180e", 0.4, 400);
        await c.pan(h.x + 110, h.y - 10, 900);
        await c.say([["narr", "Halfway down the spiral, in a gallery chewed wide as a hall, a collar altar of black stone stands at the foot of a root-wall. Torches burn on iron pegs. A creature stands before the altar with its back to the dark, facing up the way you came, as if it had been told to guard the stairs against anything that might come up. Nothing has. Everything is coming down."]]);
        c.shake(2, 500); c.sfx("hitHeavy"); await c.wait(300); c.follow();
      }, after: ["(It was guarding the way up. From what?)"] });
    if (!ok) return;
    F.set("ch9.s18"); F.sfx("door");
  };
  M3.spot("rootdeep", "gnawerTablet", async F => {
    F.set("lore.gnawer");
    await UI.say([["narr", "A builder tablet leans against the mouth of the den, cut in the terse hand of the old people. The letters are worn smooth where the roots have moved against them."], ["narr", "We set the last chewer under the roots, to bite the sun if the sun falls."],
      ["hero", "(Chewing toward the Great Pyramid. It was set to guard it, or to break it.)"]]);
  }, "tg");
  S.chest.rootdeepChest = M2.loot("c.rootdeep", [["ember", 3]], 0, "A chest wedged among chewed roots, its lid scored by teeth the width of a man's arm. Three Ashen Embers inside, wrapped in dry moss.");
  S.done.gnawerFight = F => F.f("ch9.t6");
  S.trigger.gnawerFight = async F => {
    if (F.f("ch9.t6")) return;
    if (!F.f("ch9.s18") && !hub()) { await UI.say([["narr", "The den lies below the sentinel's gallery. The altar blocks the way down."]]); return; }
    F.music("tension");
    const res = await M3.boss(F, { id: "rootGnawer", level: 58, name: "The Root Gnawer", title: "Titan of the Deep Roots", bg: "roots", music: "titanRoot",
      lines: [["narr", "The roots part. A thing of bark and bone and teeth lifts out of the den and looks at you with eyes the colour of old fires."], ["hero", "(It is chewing toward the Great Pyramid.)"]],
      stage: async c => { c.tint("#08180e", 0.4, 500); c.shake(3, 900); c.sfx("encounter"); c.fx("dust", c.hero.x + 120, c.hero.y, { ms: 2000 }); await c.say([["narr", "The den is a hollow root as long as a ship, lined with bark and bone. The whole ground gives a long, slow shudder. Somewhere deep in the roots, a sound like a very large mouth beginning to close."]]); } });
    if (res !== "win") { F.music(F.regionMusic()); return; }
    G.best.rootGnawer = Object.assign(G.best.rootGnawer || { seen: 1, beaten: 1 }, { breakKnown: true });
    await stage(async c => {
      const h = c.hero; c.tint("#08180e", 0.3, 300); c.sfx("break"); c.shake(4, 900); c.fx("embers", h.x + 120, h.y - 10, { ms: 2800 });
      await c.say([["narr", "The roots burn from the root up. The Gnawer screams, once, a sound with the whole forest in it, and sinks back into its den, slowly, as a tide goes out. The chewing stops. The ground stops shaking. You can hear water dripping somewhere, and nothing else."]]);
      c.tint("#08180e", 0, 800); c.follow();
    }, { music: "hope" });
    F.giveGear("G29", 3); F.set("lore.gnawer");
    await UI.say([["narr", "Where the roots were thickest, a chest has burst out of the bark, scorched and warm."]]);
    await stage(async c => {
      const h = c.hero; c.tint("#2a5a3a", 0.18, 300);
      M3.actors(c, [["dv", "npcDavichi", 360, -40, { name: "", flip: true }], ["g1", "npcLegionGuard", 520, -20, { flip: true }], ["g2", "npcLegionGuard", 540, 20, { flip: true }]]);
      await c.say([["narr", "At the top of the long stair, back in the green morning, a man in plain dark robes stands at the rail of the bridge with a lantern, watching the smoke rise from the roots. He has not moved since you went down."], ["davichi", "Fire. How elegant. Ithiel taught you well."]]);
      c.face("dv", "left"); await c.walk("dv", h.x + 700, h.y - 60, 4200);
      await c.say([["davichi", "Come again."]]);
      c.remove("dv"); c.remove("g1"); c.remove("g2"); c.tint("#2a5a3a", 0, 500); c.follow();
    }, { music: "tension" });
    F.set("ch9.t6"); F.questDone("m_gnawer"); F.save(true);
    UI.toast("The Root Gnawer is quiet.", 3400);
  };

  // ---------- 8.F the letter and the hand-off ----------
  M.letterScene = async F => {
    F.set("ch9.done"); F.music("letters");
    await stage(async c => {
      c.tint("#10241c", 0.2, 300);
      M3.actors(c, [["co", "npcCourier", 130, 6, { name: "The courier", flip: true }], ["im", "npcImela", -50, 6, { name: "Imela" }]]);
      await c.say([["narr", "Ashfeather Camp, at the lamp-hour. A man in a grey hood comes down the root road at an ordinary pace, with no escort, and stops in front of you. You have seen him in a clerk's chair in a cold vault. You have never once seen him hurry."]]);
      await c.walk("co", c.hero.x + 36, c.hero.y, 700);
      c.remove("co");
    }, { music: "letters" });
    await F.letter("the green seal", ["\"You have done what I could not. I am proud, and I hope you will not mind that I am also afraid.\"", "\"The war comes to Sehkarem. The Concord, the Flock, and the Throne will meet at Saltmere. Come. I owe you an answer, and I will give it to you in person. - I.\""]);
    await UI.say([["hero", "(He wants to explain. He sends a letter to say so.)"], ["imela", "That old fox."]]);
    F.save(true);
    await M.sailToSaltmere(F);
  };

  // ---------- Story.finish[9] (dbg.jump: the end of chapter 9) ----------
  S.finish[9] = (F, G) => {
    ["ch9.start", "ch9.arrived", "ch9.s16", "ch9.s17", "ch9.cell9", "ch9.camp", "ch9.dawn", "ch9.s18", "ch9.t6", "ch9.done", "k7.done", "k7.freed", "prison.seen", "nest.seen", "nest.open", "lore.gnawer", "gen.freed.16", "gen.freed.17", "gen.freed.18", "ch10.start"].forEach(k => (G.flags[k] = true));
    delete G.flags["ch10.start"];
    ["m_prison", "m_dawn", "m_gnawer"].forEach(q => (G.quests[q] = "done"));
    [16, 17, 18].forEach(n => { const g = S.generalFor(n); if (g) S.noteGeneral(g.id, ["Freed at the Black Mirror gate. It went over the cliff edge, and the wind held it up.", "Freed in the collar-forge. It went through the forge's glass wall, and the whole hall rang like a bell.", "Freed in Rootdeep. It went up through the chewed galleries, toward the light."][n - 16]); });
    if (window.Systems) { if (Systems.captive()) Systems.returnCaptive(); Systems.guestLeave(true); }
    F.giveGear("G29", 3, true); F.giveGear("G24", 3, true); G.items.cellNineKey = 0; G.items.cellKey = 0;
    if (!F.allCreatures().some(u => u.id === "hearthkin")) { G.collection.push(F.mk("hearthkin", Math.max(3, F.avgLevel() - 1))); G.best.hearthkin = G.best.hearthkin || { seen: 1, beaten: 0 }; }
    G.flags["wagon.at"] = "ashfeatherCamp"; G.gold += 2500; G.ch = 9; G.lastTown = "ashfeatherCamp";
  };
})();

// ---------- skill book (SKILLBOOK agent 2026-10-31): Root Draught (Glowroot Sap, Rootdeep Approach) ----------
(function () {
  const S = window.Story, D = window.Data, M2 = S.m2, add = (id, ...drops) => { D.DROPS[id] = (D.DROPS[id] || []).concat(drops); };
  Object.assign(D.MATS, { glowrootSap: ["Glowroot Sap", "Amber sap that glows when shaken. It tastes of struck flint and wakes you like a slap."] });
  Object.assign(D.BOOK, { rootDraught: { n: "Root Draught", mat: "glowrootSap", need: 10, d: "1 MP. An ally gains 3 MP (on itself that is 2 MP net).", move: "rootDraught" } });
  add("rootWorm", ["glowrootSap", 0.3]); add("gnawling", ["glowrootSap", 0.2]);
  M2.bookSpot("rootdeepApproach", "glowrootSap1", "Glowing sap in a split root", "g.sap1", "glowrootSap", 5, "Where a root has split the path, amber sap beads along the crack and glows when you shake it. You fill a vial and the glow settles behind your eyes like a second pulse. Five measures of Glowroot Sap.", "Root Draught");
  M2.bookSpot("rootdeepApproach", "glowrootSap2", "Sap beading on a root", "g.sap2", "glowrootSap", 5, "The east bank has the same roots, bleeding the same slow light. Five more measures. The ground hums under the vial.", "Root Draught");
})();
