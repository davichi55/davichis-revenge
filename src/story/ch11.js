// Chapter 11 script, The Sun Eater: Dawnwatch Bastion (the last supper), the Great Stair, the three gates (S22-S24, the mirror pack), the Descent, Emperor Davichi, the Sun Eater (T8),
// Story.finish[11], Story.start[11] (owner: STORY-M5). The epilogue on the pyramid roof and the post-game are in post.js. Shared helpers: window.Story.m5 (ch10.js).
// Spec: ../game-mechanics/specs/M5.md. Voices: ../game-mechanics/STORY_BIBLE.md. Hero thoughts are in parentheses. No jokes in the Descent.
// Written in parts: A data, regions, banter; B the Bastion, the supper, the stair; C the gates; D the Descent, the emperor, the Sun Eater, finish.
"use strict";
(function () {
  const S = window.Story, D = window.Data, Q = Object.assign, M3 = S.m3, M = S.m5, R = D.REGIONS;
  const key = (n, d) => ({ n, d, key: true });
  Q(D.GOODS, {
    golemPlate: ["Sun-Priest Plate", 78], chimeraHorn: ["Chimera Horn", 76], altarAsh: ["Altar Ash", 70], eclipseScale: ["Eclipse Scale", 74], minotaurHoof: ["Shadow Hoof", 80], nagaPlate: ["Gold Naga Plate", 82],
  });
  Q(D.DROPS, {
    sunPriestGolem: [["golemPlate", 0.45]], obsidianChimera: [["chimeraHorn", 0.45]], bloodAltarWraith: [["altarAsh", 0.45]], eclipseMoth: [["eclipseScale", 0.45]], shadowMinotaur: [["minotaurHoof", 0.45]], pyramidNaga: [["nagaPlate", 0.4]],
    jaguarCohortElite: [["obsidianShard", 0.4]], palaceGuard: [["legionCoin", 0.5]], courtPriest: [["sunSeal", 0.4]],
  });
  Q(D.QUESTS, {
    m_gates: { t: "The Three Gates", main: true, ch: 11, steps: ["The Great Pyramid has three gates: Dawn, Zenith, Dusk. Each disc is held by a collar. Free what holds the disc."] },
    m_emperor: { t: "The Emperor", main: true, ch: 11, steps: ["The three discs open the way down. The emperor is at the bottom, with his ledger."] },
    m_eater: { t: "The Sun Eater", main: true, ch: 11, steps: ["Under the emperor's hall, the last lock of the builders. Three suns, three ways."] },
    m_roof: { t: "The Roof", main: true, ch: 11, steps: ["A shaft of light has opened upward from the chamber. Climb it."] },
  });

  // ---------- inns, shops, rumours ----------
  const BAS = M.BAS, CURES = M.CURES, BOMBS = M.BOMBS, WARDS = M.WARDS, disc = M.disc;
  const LAST = BAS.concat(CURES, ["tonic", "ember", "incense", "candle"], BOMBS, WARDS);
  Q(D.INNS, { dawnwatchBastion: { n: "The Dawn Bed", mult: 0.5 } });
  Q(D.SHOPS, { dawnwatch: { n: "Dawnwatch last stores", who: "merchant", stock: LAST, disc: disc(LAST, 0.9), buys: 1.0 } });
  M3.rumours("dawnwatchBastion", ["The emperor feeds the Sun Eater from the arena. Every victor is an offering.", "Each gate is guarded by one of your old friends.", "The sun calendar on the top floor has a missing day."], [M3.clue(22, 0), M3.clue(23, 0), M3.clue(24, 0)]);

  // ---------- regions ----------
  const yes = () => true, WARM = "bg_ruins";
  M3.region("dawnwatchBastion", { n: "Dawnwatch Bastion", bg: WARM, arena: "pyramidGate", music: "bastion", town: "dawnwatchBastion", inn: "dawnwatchBastion", autos: ["bastionArrive"],
    npcs: [["innkeeper", "The Dawn Bed"], ["merchant", "The last stores"], ["saffa", "Commander Saffa Qarim"], ["hadiya", "Hadiya Wells"], ["imela", "Imela"], ["oldDunmar", "The Menagerie Wagon", s => s.f["wagon.at"] === "dawnwatchBastion"], ["mentor", "Master Ithiel, in a grey cloak"],
      ["captain", "Captain Brisk"], ["rhaz", "Rhaz"], ["peya", "Peya"], ["corvin", "Corvin Dray"], ["kessa", "Kessa Vorn"], ["dorrin", "Dorrin Hale"], ["mayle", "Mayle Tarn"], ["calendarScholar", "The calendar scholar"], ["r1", "A recruit"], ["r2", "A cook"], ["r3", "A sentry on the wall"]],
    exits: [["weepingSea", "The cove and the dock", yes], ["ahuacanGreatStair", "The gate to the Great Stair", s => s.f["ch11.supper"]]],
    things: [["lastSupper", "The long table in the yard, under lanterns", s => s.f["ch11.start"] && !s.f["ch11.supper"], "trigger"]] });
  M3.region("ahuacanGreatStair", { n: "The Great Stair", bg: WARM, arena: "pyramidGate", music: "warfront", table: "stair", fields: true, overland: true,
    exits: [["dawnwatchBastion", "Back down to the Bastion", yes], ["pyramidDawnGate", "The Dawn Gate, in the pyramid's east face", s => s.f["ch11.stair"]]],
    things: [["stairAssault", "The foot of the stair, where the lines meet", s => !s.f["ch11.stair"], "trigger"], ["stairChest", "A chest behind a toppled statue", s => !s.f["c.stair"], "chest"]] });
  const gate = (id, n, name, table, back, fwd, fwdFlag, what) => M3.region(id, { n: name, bg: WARM, arena: "pyramidGate", music: "greatPyramid", table, fields: true, dungeon: true,
    exits: [[back[0], back[1], yes]].concat(fwd ? [[fwd[0], fwd[1], s => s.f[fwdFlag]]] : []),
    things: [[what[0] + "Plates", "The light-line corridor and its glyph plates", s => !s.f["ch11." + what[0] + "Plates"], "trigger"], ["gateS" + n, "The collar altar chained to the " + what[1] + " disc", s => s.f["ch11." + what[0] + "Plates"] && !s.f["ch11.s" + n], "trigger"],
      [what[0] + "Chest", "A chest in a gutter niche", s => !s.f["c." + what[0]], "chest"]] });
  gate("pyramidDawnGate", 22, "The Dawn Gate", "dawnGate", ["ahuacanGreatStair", "Back out to the Great Stair"], ["pyramidZenithGate", "Up to the Zenith Gate"], "ch11.s22", ["dawn", "rose-gold"]);
  gate("pyramidZenithGate", 23, "The Zenith Gate", "zenithGate", ["pyramidDawnGate", "Back down to the Dawn Gate"], ["pyramidDuskGate", "Across to the Dusk Gate"], "ch11.s23", ["zenith", "white-gold"]);
  gate("pyramidDuskGate", 24, "The Dusk Gate", "duskGate", ["pyramidZenithGate", "Back to the Zenith Gate"], ["pyramidDescent", "The long stair down"], "ch11.s24", ["dusk", "copper-black"]);
  M3.region("pyramidDescent", { n: "The Descent", bg: WARM, arena: "pyramidGate", music: "greatPyramid", table: "descent", fields: true, dungeon: true, autos: ["descentEnter"],
    exits: [["pyramidDuskGate", "Back up to the Dusk Gate", yes], ["emperorHall", "The round gold hall", yes]],
    things: [["calendarWall", "The mural with the gap in the ring of days", s => !s.f["ch11.wall"], "gather"], ["descentChest", "A chest in the offering gutter", s => !s.f["c.descent"], "chest"]] });
  M3.region("emperorHall", { n: "The Emperor's Hall", bg: WARM, arena: "sunCore", music: "emperor", dungeon: true,
    exits: [["pyramidDescent", "Back up the Descent", s => !s.f["ch11.emperor"] || true], ["sunEaterChamber", "The great circular grate, now open", s => s.f["ch11.emperor"]]],
    things: [["emperorScene", "The desk with the ledger and the single lamp", s => !s.f["ch11.emperor"], "trigger"]] });
  M3.region("sunEaterChamber", { n: "The Sun Eater's Chamber", bg: WARM, arena: "sunCore", music: "sunEater", dungeon: true,
    exits: [["emperorHall", "Back to the emperor's hall", s => !s.f["ch11.t8"]], ["pyramidRoof", "The shaft of light, upward", s => s.f["ch11.t8"]]],
    things: [["eaterFight", "The black sun in the floor", s => !s.f["ch11.t8"], "trigger"]] });
  M3.region("pyramidRoof", { n: "The Pyramid Roof", bg: WARM, arena: "sunCore", music: "epilogue", autos: ["epilogueScene"], exits: [], things: [["epilogueScene", "The sun calendar cut in the roof", s => !s.f["epilogue.done"], "trigger"]] });

  // ---------- banter: the old lab-mates at the gates, the Descent, the roof ----------
  const B = M.banter;
  B("gates", [
    ["That's them! That's the— no. No. Don't tell me it's them.", "We left them behind in the cold, young bull. We do not leave them now.", "Take a breath, dear. Then do what must be done, and do it gently."],
    ["Chains again. I know the shape of every link.", "Oh, that is cruel. Even for them. Even for them.", "Do they remember us? Will they know us? Why does it hurt that I want to know?"],
    ["Grumble. Of course it's them. Of course.", "...They are still in there.", "I'll be brave. I'll be brave for them. If that's all right."],
    ["Hah— no. I have no joke for a friend in a collar.", "Can we help them? How? How do we help them? Tell me how!", "We fight them to free them. It is the only door left."],
    ["Hm. Known faces.", "Of course. Of course they put them at the doors.", "What opens when the one holding the key is a friend? A harder door."],
    ["I'm not hungry. That's how bad it is.", "It's them, it's them, and they don't know us, it's not fair, it's not fair!", "Did you know the gates were held by lab-mates? ...I did not. I wish I had."],
    ["They deserve our best manners and our best blows. Mind the glass, please.", "Steady hearts. This is the last of the walking.", "...Slowly... gently... then, not gently. They would want it."],
    ["I'm not joking. Look. I'm not joking. I'm very sad about it.", "Hee... no hee. We're going to get them out.", "They shared my bread. ...I'm going to share the door."],
    ["I knew we would see them again. I did not know it would be like this.", "I will glow for them. Even through the collar.", "...The tide has brought them to the door. Let us open it."],
  ]);
  B("eater", [    // the Descent: murals, gutters, silence; no jokes
    ["...It's so quiet. I hate it. I'll stay quiet. For you.", "Walk slowly, young bull. Whatever is at the bottom has waited longer than we have.", "Stay close, dear. Closer."],
    ["Down. Always down. ...I'm with you.", "I am not going to say a clever thing. I am going to stay right here.", "What is at the bottom? ...I don't want to ask. Isn't that strange?"],
    ["...No grumble.", "...It knows we are coming.", "I'm here. I'm right here. If that's all right."],
    ["...No jokes. I'll save them.", "I'll— no. I'll walk. I can walk slowly. Look.", "Whatever waits, I will be in front of you. That is all."],
    ["Hm.", "...Of course. Of course it's at the bottom.", "What is at the end of the stair? Ask me after. I think I know."],
    ["I'll carry the bread. ...There is no bread. I'll carry the idea.", "It's okay, it's okay, we're together, we're all together.", "...I don't know a single secret about this place. That frightens me."],
    ["Mind the steps, please. They are very old.", "Walk lightly. Walk together. That is all there is.", "...Slowly... we have come a long way. ...A little further."],
    ["...Nothing is on fire. Nothing. I'm checking.", "...Hee. ...No. Not here.", "I am not hungry. ...Something else down there is."],
    ["Whatever it is, it was lonely, too. I think.", "I will glow low. Let the dark be dark, and let us be in it.", "...The tide has come all the way down. Walk."],
  ]);
  B("roof", [     // the roof at dawn, the stars falling
    ["The sky— the sky is doing something! Is it supposed to?!", "...No, young bull. It is not supposed to.", "Hold my hand, dear. Whatever it is, we saw it together."],
    ["Open sky. No roof. No chain. ...Still don't know what to do with it.", "How rude of the sky to outdo me.", "What are they? Where do they fall from? Who threw them?"],
    ["Ha. Pretty. Don't tell anyone I said it.", "...Someone has been waiting for this.", "They're beautiful. Are they supposed to be beautiful? If that's all right."],
    ["Hah— wow. I haven't got a joke. Remember this.", "Can I catch one? Can I— no. Let them fall. Let them fall.", "I have seen this tide before. From a different shore."],
    ["Hm. Good.", "...Of course. The sky is not done. Why would it be.", "What falls and is not lost? The riddle was always the sky."],
    ["I'll remember this. Longer than a meal.", "It's beautiful, it's so beautiful, I knew it would be, I knew it!", "Did you know the old calendars call those the 'thrown' ones? ...I did not. I just found out."],
    ["A lovely morning. May the day be kind.", "Steady hearts. A new road begins, and it begins in light.", "...Slowly... nothing more to do tonight. ...Sleep. Tomorrow, then."],
    ["Don't blame me. I didn't do that. ...Did I?", "Hee... it's fireworks. For us. Hee.", "The stars are falling. Can I eat one? ...No. Fine. Look at them."],
    ["I knew a morning like this was coming. I did not know it would come with stars.", "I will glow for them. A small light under a great one.", "...The tide of the sky has turned. Walk well."],
  ]);
})();

// ---------- part B: the voyage, Dawnwatch Bastion, the last supper, the Great Stair ----------
(function () {
  const S = window.Story, D = window.Data, Q = Object.assign, M2 = S.m2, M3 = S.m3, M = S.m5, T = M.T, say = M.say, thought = M.thought, stage = M.stage, once = M.once, cycle = M.cycle, rel = M.rel;

  // ---------- 6.0 the voyage (Story.begin[11]) ----------
  S.begin[11] = async F => {
    G.ch = 11; F.set("ch11.start"); F.music("voyage");
    await Cinema.voyage({ from: "saltmereCamp", to: "dawnwatchBastion", text: "East along the Ahuacan coast, on storm sails, at dusk.", mood: "night" });
    await Cinema.title("Chapter 11", "The Sun Eater");
    F.music("bastion"); F.autoSave = true; F.save(true);
    F.go("dawnwatchBastion", "from_sea");
  };
  S.start[11] = { region: "dawnwatchBastion", entry: "from_sea" };

  // ---------- 5.1 Dawnwatch Bastion ----------
  const BB = "dawnwatchBastion";
  S.trigger.bastionArrive = async F => {
    M.ensure(F, 11);
    if (!once(F, "bb.seen")) return;
    G.lastTown = BB; F.set("wagon.at", BB); F.music("bastion");
    await stage(async c => {
      M3.actors(c, [["s1", "npcResistFighter", -150, -20], ["s2", "npcFlockGuard", 140, 30], ["s3", "npcRecruit", 70, -60]]);
      c.tint("#2a2030", 0.2, 400); await c.pan(c.hero.x + 120, c.hero.y - 40, 1000);
      await c.say([["narr", "A captured stone fort on a headland, grey walls hung with new banners that do not quite fit the poles. Lanterns in the yard. Far to the east, black against a sky the colour of a bruise, the Great Pyramid stands on the horizon like a tooth."],
        ["narr", "Nobody here is laughing. Nobody here is crying. They are eating, in a long line, standing up."]]);
      c.sfx("bell"); c.follow(); c.tint("#2a2030", 0, 500);
    }, { music: "bastion" });
  };
  S.done.bastionArrive = F => F.f("bb.seen");

  S.trigger.lastSupper = async F => {
    M.ensure(F, 11);
    if (F.f("ch11.supper")) { await say("dunmar", "Sit, lad. The table is still warm."); return; }
    F.music("farewell");
    await M2.talkPanels("assets/cinema/m5_supper.png", [
      ["narr", "Dusk at Dawnwatch. In the fort yard someone has set a table the length of the wall and hung lanterns over it, and everyone who has walked this far sits down at it without being asked."],
      ["dunmar", "Eat, lad. There are cages to open after."], ["dorrin", "There is stew. There is more stew. There is a pie nobody has admitted to."],
      ["mayle", "I stopped writing the numbers down this week. I write the names instead."], ["corvin", "To lunch."], ["saffa", "To the stair."], ["hadiya", "Everything costs. Tonight it is free. Eat."],
      ["narr", "At the far end of the table, in a grey cloak, sits Master Ithiel. He arrived at dusk. Nobody asked how."],
      ["narr", "Your creatures lie at your feet in a row, shoulder to shoulder, and one of them has put its head on your boot."],
      ["narr", "Across forty feet of table, Ithiel meets your eye and does not look away and does not speak. After a while you nod. It is a small nod. He takes it as if it were a letter."],
      ["imela", "Hm."], ["narr", "Everyone laughs a little, the way people do at a table before a morning like tomorrow's."],
    ], { music: "farewell" });
    F.set("ch11.supper"); F.quest("m_gates", 0);
    UI.toast("The gate to the Great Stair is open.", 3000);
  };
  S.done.lastSupper = F => F.f("ch11.supper");
  S.trigger.dawnStairGateShut = async F => { await UI.say([["hero", "(The gate to the stair is shut and barred. Behind me they are still hanging lanterns over a long table.)"]]); };

  M3.talkTown(BB, { inn: BB, shop: "dawnwatch", who: ["scout", "stallkeeper", "scout"], opts: {},
    innLine: "The Dawn Bed. A cot by the wall, a blanket, and all the sleep the night will give you. Nobody is charging for the quiet.",
    shopLine: "The last stores. Everything the camp has left, at the camp's price. There is no restock after this, so choose like it matters." });
  const before = F => !F.f("ch11.stair"), after = F => F.f("ch11.emperor");
  Object.assign(T(BB), {
    saffa: async F => say("saffa", after(F) ? "The stair is ours. I do not know what to do with a stair that is ours. Show me what comes next." : F.f("ch11.stair") ? "Go. We hold the stair. I do not say that twice." : "Tomorrow, the stair. Tonight, you eat. That is an order, and I do not give many."),
    hadiya: async F => say("hadiya", cycle("hd11", ["Everything costs. I have stopped adding it up. I would rather see the sum at the end.", "I booked passage for the creatures on the first ship home. Booked it twice. The second is for you.", "Count the exits before you count the enemy. Then count them again. Then stop counting, and walk."])),
    imela: async F => say("imela", cycle("im11", ["Eat. Whatever is at the bottom of that stair will keep until you have eaten.", "Hm.", "I counted every wall in that palace for nineteen years. I will not count a single one tomorrow. I will be at the foot of the stair with a lamp.", "Sparrow. Come home after. That is all I want. The rest is detail."])),
    oldDunmar: async F => {
      if (["keyK1", "keyK2", "keyK3", "keyK4", "keyK5", "keyK6", "keyK7", "keyK8", "keyK9"].some(k => F.item(k) > 0)) { await M3.wagon(F); return; }
      await say("dunmar", cycle("dm11", ["Eat, lad. There are cages to open after. I have a list. It is a long one.", "I carried his coffee thirty years. Tomorrow I carry nothing and I am afraid I will not know what to do with my hands.", "Bring me every key you find, lad. Every one."]));
    },
    mentor: async F => say("mentor", cycle("mn11", ["I did not tell anyone I was coming. I find that people come in the end, if one is quiet about it.", "I built the gates. I could not tell you how many times I have walked them in my head. They are shorter in my head.", "Do not forgive me tonight. Tomorrow, if there is a tomorrow, we can discuss the matter over tea. Cold tea. It is the only kind I seem to make."])),
    captain: async F => say("captain", cycle("br11", ["Friend! The Heron is at the cove with her sails furled, and her captain is here, and her captain is not at all nervous. Not at all.", "I lie about many things. I do not lie about the price of a ship. That was a bargain, and tomorrow I intend to be at the dock for the return.", "You do not outsail a war, friend. You outwait it. We have outwaited this one as far as we can."])),
    rhaz: async F => say("rhaz", cycle("rh11", ["Show me the creatures. Then go and do what the creatures are for.", "The Dune Wardens hold the east barricade. We are not many. We are loud."])),
    peya: async F => say("peya", cycle("py11", ["And what will you be, when it is over?", "Everyone is asking what is at the bottom. I am asking what is at the top. Someone built a roof on that thing."])),
    corvin: async F => say("corvin", cycle("cv11", ["We have three rules and one of them is lunch. We have kept it. I would like it noted.", "Saltwater Compact is holding the quay. If you come back down that stair with a boat to catch, we will have it warm."])),
    kessa: async F => say("kessa", cycle("ks11", ["Don't look at me like that. I'll be on the stair. Not bad, for a tin can. ...Be careful.", "Emberwick wants to come. I said no. It said it was useful. I said no again. It is sulking, in a warm way."])),
    dorrin: async F => say("dorrin", cycle("dr11", ["Boss says it is the last stew. I say it is the last stew before the next stew.", "I packed you a pie. Do not ask which one. Also, hello."])),
    mayle: async F => say("mayle", cycle("my11", ["Page three hundred and ninety. 'As agreed.' I have crossed it out.", "I wrote the names down. All of them. If it goes wrong, I want to know that somebody has them."])),
    calendarScholar: async F => {
      const have = [1, 2, 3, 4, 5, 6].filter(n => F.f("lore.sunPiece" + n));
      if (!have.length) { await say("calendarScholar", "I have your Journal open at the Sun Eater's page. It is empty. The builders wrote it down in places where the sleepers are watched. I cannot say more than that, and I am sorry."); return; }
      await UI.say([["calendarScholar", "Your Journal, at the Sun Eater's page. Let me read you what is there."]].concat(have.map(n => ["calendarScholar", "Tablet " + n + ": \"" + M.PIECE[n][1] + "\""])));
      await say("calendarScholar", have.length === 6 ? "All six. I have nothing to add. It is unusual to be out of work." : "The rest are in the places where the sleepers are watched. I cannot say where. I wish I could.");
    },
    r1: M3.rum(BB, 0, "scout", {}), r2: M3.rum(BB, 1, "stallkeeper", {}), r3: M3.rum(BB, 2, "scout", {}),
  });

  // ---------- 6.A the Great Stair ----------
  S.trigger.stairAssault = async F => {
    if (F.f("ch11.stair")) return;
    F.music("warfront");
    await stage(async c => {
      M3.actors(c, [["saffa", "npcSaffa", 70, -20], ["f1", "npcResistFighter", 130, 40], ["f2", "npcFlockGuard", 130, -50], ["f3", "npcLegionGuard", 260, 0, { flip: true }]]);
      c.tint("#2a1a1a", 0.3, 400); await c.pan(c.hero.x + 160, c.hero.y - 20, 1000);
      await c.say([["narr", "The Great Stair is the width of a parade ground and white as a bone. Burnt banners lie on every step. From the foot to the first landing it is one fight: blue Concord shields against the red-and-black of the last cohorts, white Flock candles held up by pilgrims in a line, resistance fighters in patched cloaks going up the barricades with ladders."]]);
      c.sfx("hitHeavy"); c.fx("explosion", c.hero.x + 190, c.hero.y - 30, { scale: 0.8, shake: 3 }); c.fx("embers", c.hero.x + 100, c.hero.y - 60);
      await c.wait(600); c.fx("explosion", c.hero.x + 250, c.hero.y + 40, { scale: 0.6, shake: 2 }); c.sfx("hit"); c.shake(3, 500);
      await c.walkHero(c.hero.x + 120, c.hero.y - 10, 1400);
      c.fx("embers", c.hero.x + 60, c.hero.y - 60); c.sfx("fire"); await c.wait(500);
      await c.say([["saffa", "Go. We hold the stair."], ["hero", "Saffa..."], ["saffa", "I said go. Show me the other side of it."]]);
      c.tint("#2a1a1a", 0, 500); c.follow();
    }, { music: "warfront" });
    F.set("ch11.stair");
    UI.toast("The Dawn Gate is open ahead.", 3000);
  };
  S.done.stairAssault = F => F.f("ch11.stair");
  S.trigger.dawnGateShut = async F => { await UI.say([["hero", "(The Dawn Gate is shut. Between me and it, the stair is still a field of men fighting for the steps.)"]]); };
  S.chest.stairChest = M.loot("c.stair", [["ember", 4], ["tonic", 4]], 1300, "A chest behind a toppled statue of a man with a sun for a head. Four Ashen Embers, four Clearwater Tonics, and a purse of kakal that somebody on the stair meant to spend later.");
})();

// ---------- part C: the three gates (S22 Dawn, S23 Zenith, S24 Dusk): the mirror pack, one creature per gate ----------
(function () {
  const S = window.Story, D = window.Data, Q = Object.assign, M2 = S.m2, M3 = S.m3, M = S.m5, T = M.T, say = M.say, thought = M.thought, stage = M.stage, once = M.once, cycle = M.cycle, rel = M.rel;

  // D.GATE_LINES[creatureId] = [Dawn, Zenith, Dusk]: the creature's own opening line at the gate it holds. Dawn: the one who hoped longest. Zenith: the proudest. Dusk: the saddest.
  // The collar's line (upper case, from Data.GENERAL_LINES) follows each of them. Which creature holds which gate depends on the playthrough (G.slots 22-24, the mirror pack).
  D.GATE_LINES = {
    horncinder: ["I stood here, waiting for the door to open from your side! Loudly! I have been loud for days!", "Look at me! I'm the loudest thing on the whole stair! Hit me, see if I mind!", "...I'm not loud now. Isn't that strange. I can't find the loud."],
    shellmund: ["I stood here, waiting for the door to open from your side. I am patient. I did not know I was this patient.", "A wall does not apologise for being a wall, little one. Neither will I.", "The sand ran out of my hourglass some days ago. I stood anyway."],
    kitsuneva: ["Dear. I stood here, waiting for the door to open from your side. I kept the lamp lit, as best I could.", "Look at my tails, dear. All nine, and every one of them proud. Mind you do not look away.", "Come closer, dear. No. Stay back. I am so very tired."],
    skarnwolf: ["I waited at the door. From the inside. Do not say I did not wait.", "I did not choose this post. I will hold it as if I did.", "Chain again. This one, not mine. ...Hit me."],
    vespera: ["About time. I stood here the whole night. Do not apologise, it ruins the effect.", "I am the fastest thing in this pyramid, and I am standing still. Admire the restraint.", "Don't. Don't be kind, I can't bear it now. Fight."],
    glimmerkoi: ["Is it you? It's you! I stood here, waiting for the door to open from your side. Why was it so long?", "Why do I stand so straight? Is it the collar? Is it pride? I cannot tell them apart.", "Why is it so dark here? Did someone put out the lamps? Is it me?"],
    mossmaw: ["Grumble. I stood here, waiting for the door to open from your side. Took your time.", "Grumble. They put me on the white landing. White. I hate white. I will stand on it anyway.", "Grumble. ...No. No grumble. I am just so tired of this stair."],
    nightveil: ["...You came. I waited at the door. I knew.", "...I see you. Do you see yourself?", "...Dark. It was always going to be dark. Hello."],
    emberlamb: ["I... I stood here, waiting for the door to open from your side. If that's all right. It was a long time.", "I'm brave when it counts. It counts. Please don't be gentle with me.", "I'm so sorry. I'm so sorry. I'll try to be brave. I'm trying."],
    skyrend: ["Hah! Kid! I stood here waiting for the door to open from your side! Hah. ...Took you long enough.", "Hah! Best seat in the pyramid, top of the gate! Hah. No view, though.", "Hah— no. No joke. I looked for one. There isn't one."],
    volthorn: ["I stood here! I waited! Is it you? It's you! The door, from your side! Did you bring it? Did you?!", "Can I— I can't. The collar says stand. Why can't I move? I'm the fastest!", "Is it over? Is it time? Is it— no. No. Nothing is over."],
    brinegrave: ["I stood here, waiting for the door to open from your side. I told myself you would come.", "I promised to protect you. I am standing between you and the way in. I do not understand it, but I am doing it.", "I failed once. I will not fail you now. Strike. Do it well."],
    bulwyrm: ["Waited. Here. ...You came.", "A wall. I am also a wall.", "Hm. Dark. Fine."],
    rotfang: ["Of course you're late. I stood here, waiting for the door to open from your side. Of course.", "Fine. Look at me. Magnificent. Happy now?", "Of course. The last one. Why not. Go on, say something kind. I won't believe it."],
    stillgaze: ["What waits at a door that opens from the other side? I did. Ask me what I learned.", "What stands on the highest landing and sees no one? Me. The riddle was always me.", "What has no light and no shadow? Ask me later. ...There is no later."],
    crushjaw: ["I stood here, waiting for the door to open from your side! They had no snacks! None!", "I'm very big up here and very hungry! Come and be a snack! ...No. Come and be kind.", "I don't want to eat. Isn't that strange. I always want to eat."],
    zephyrra: ["You came, you came, I knew you'd come, I stood here the whole time!", "I'm so high, I'm so high, and it is lonely, it is so lonely up here!", "No more hoping. I did it, I did it so hard, and it did not work, and now I can't."],
    duskcoil: ["Did you know I stood here, waiting for the door to open from your side? I told everyone. No one listened.", "I know everything about this pyramid. I did not know it would be me, holding the white gate.", "I know every secret in this place, and I am so tired of knowing."],
    atlacrab: ["I stood here, waiting for the door to open from your side. Thank you for coming. Mind the glass.", "Forgive me. I am standing in your way. It is my post, and I am not at liberty to move.", "I rocked you to sleep once. I would like to do it again. Not like this."],
    solenne: ["I stood here, waiting for the door to open from your side. Steady hearts. Mine was steady, mostly.", "Walk lightly, child. I cannot. The collar has made me heavy.", "The light is going. Let it. We walked the long road together, and this is where it ends."],
    kappadeep: ["...I stood here... waiting for the door... to open from your side. ...Slowly. Nearly forever.", "...Slowly... I am the last gate but one. ...Do not hurry. ...Then do.", "...Nap? ...No. No nap. ...Strike, little one."],
    smolderhead: ["Oops! I stood here, waiting for the door to open from your side! Not oops. No oops. Hello.", "Don't look at me. I didn't choose this landing. I'd have picked one with a window.", "Oops? No. No oops. I think this is the real thing."],
    pyrewisp: ["Hee... boo! I stood here waiting for the door to open from your side! Did it work? Are you surprised?", "Hee. They put me on the white landing. White burns so easily. Hee... don't.", "Hee. ...No hee. I tried. I'm out of hee."],
    mawdeep: ["I stood here waiting for the door to open from your side. Is there food? ...You came. That's better than food.", "I'm hungry, and I'm so very big, and I don't want to be. Is there bread?", "I don't remember the taste of bread. Isn't that strange? I used to think about it all day."],
  };
  // the scene is the shared general scene (ch3.js) with the gate line in place of the creature's recognition line for the length of the scene
  M.gateScene = async (F, slot, idx, o) => {
    const g = S.generalFor(slot); if (!g) return true;
    const L0 = D.GENERAL_LINES[g.id], gl = (D.GATE_LINES[g.id] || [])[idx];
    if (gl && L0) D.GENERAL_LINES[g.id] = Object.assign({}, L0, { meet: [gl, L0.meet[1]] });
    try { return await S.generalScene(F, slot, Q({ bg: "pyramidGate", where: "It stood aside, and watched, and was still standing there when you looked back." }, o)); }
    finally { if (L0) D.GENERAL_LINES[g.id] = L0; }
  };

  // ---------- the glyph-plate corridors: step on the plates in the order of the sun; the wrong order shuts a shutter and wakes the gate's creatures ----------
  const PLATES = {
    dawn: { id: 22, order: [2, 1, 0], carve: "On the lintel, in a builder's short hand: \"The sun rises in the east and sets in the west. Walk it the way the day goes.\"", table: "dawnGate", gate: "Dawn",
      done: "The last plate sinks, and the light-lines in the floor all turn the same colour, a rose that deepens as they run toward the far wall. The shutter at the end of the corridor lifts." },
    zenith: { id: 23, order: [1, 2, 0], carve: "On the lintel: \"At noon the sun stands in the middle of the sky. The shadows run out from under it: first to the east, then to the west.\"", table: "zenithGate", gate: "Zenith",
      done: "Three plates, three notes, and the third one rings so long that you feel it in your teeth. The shutter at the end of the corridor rises into the roof without a sound." },
    dusk: { id: 24, order: [0, 1, 2], carve: "On the lintel, in a smaller hand than the others: \"Dusk is the dawn walked backwards.\"", table: "duskGate", gate: "Dusk",
      done: "The last plate goes down, and the light in the corridor goes out all at once, and comes back copper. The shutter at the end of the hall lifts a hand's breadth and then all the way." },
  };
  const SIDE = ["west", "centre", "east"];
  const plates = which => async F => {
    const p = PLATES[which], key = "ch11." + which + "Plates";
    if (F.f(key)) return;
    if (once(F, "plates." + which)) await UI.say([["narr", "A corridor of black stone with three glyph plates set in a line across the floor, one at each end and one in the middle, and light-lines running between them. A shutter of gold bars stands across the far end. " + p.carve]]);
    const step = G.flags["plates." + which + ".n"] || 0;
    const i = await F.ask("Three glyph plates.", [{ label: "Step on the west plate" }, { label: "Step on the centre plate" }, { label: "Step on the east plate" }, { label: "Wait" }], { top: "36%" });
    if (i < 0 || i > 2) return;
    if (p.order[step] === i) {
      G.flags["plates." + which + ".n"] = step + 1; F.sfx("menuOk");
      if (step + 1 < 3) await UI.say([["narr", "The " + SIDE[i] + " plate sinks under your boot with a soft click. A line of light jumps to the next plate."]]);
      else { F.set(key); await S.m2.gate([["narr", p.done]], { dx: 200, dy: -10, sfx: "stoneGrind", fx: "dust", fx2: "sparkle", shake: 2, tint: which === "dusk" ? "#301810" : which === "dawn" ? "#a04860" : "#e8e8f4" }); }
      return;
    }
    await UI.say([["narr", "The " + SIDE[i] + " plate gives a flat, wrong note. Every light-line in the corridor goes out together, and the shutter behind you comes down like a guillotine. In the dark, things that were waiting for the plates to say so begin to move."]]);
    G.flags["plates." + which + ".n"] = 0;
    const foes = F.rollEncounter(p.table); if (foes) await F.fight(foes, { bg: "pyramidGate" });
    await UI.say([["narr", "Then the shutter lifts again, slowly, as if it were embarrassed."]]);
  };
  ["dawn", "zenith", "dusk"].forEach(k => { S.trigger[k + "Plates"] = plates(k); S.done[k + "Plates"] = F => F.f("ch11." + k + "Plates"); });
  S.chest.dawnChest = M.loot("c.dawn", [["ember", 2], ["stormWard", 2]], 1400, "A chest in a gutter niche, the lid stamped with a sun-wheel. Two Ashen Embers, two Storm-Wards, and a purse that was meant for the priests.");
  S.chest.zenithChest = M.loot("c.zenith", [["ember", 2], ["stormWard", 2]], 1400, "A chest in the white hall, humming faintly like a struck glass. Two Ashen Embers, two Storm-Wards, and a purse of kakal, stamped, and not yet counted.");
  S.chest.duskChest = M.loot("c.dusk", [["ember", 2], ["stormWard", 2]], 1400, "A chest sunk in a dry gutter, heavy and cold. Two Ashen Embers, two Storm-Wards, and a purse of kakal that smells of old copper.");

  // ---------- 6.B Dawn Gate (S22) ----------
  S.trigger.gateS22 = async F => {
    if (F.f("ch11.s22")) return;
    F.music("greatPyramid");
    if (once(F, "gate.seen")) {
      await Cinema.panels([{ img: "assets/cinema/m5_gate.png", text: "A gate-hall of black-and-gold stone. In the east wall a disc as tall as a house, rose-gold, with a morning caught in it. A collar altar chained to its rim, and the light-lines in the floor running toward it like rivers to a sea." }], { music: "greatPyramid" });
      await F.banter("gates");
    }
    const freed = await M.gateScene(F, 22, 0, { level: 65, soldiers: [["jaguarCohortElite", 64, " B"], ["jaguarCohortElite", 64, " C"]], title: "Keeper of the Dawn Gate", place: "the Dawn Gate", fx: 120, fy: -6,
      setup: async c => {
        M3.actors(c, [["j1", "npcJaguarElite", 130, -50], ["j2", "npcJaguarElite", 150, 40]]);
        c.tint("#a04860", 0.25, 400); c.fx("sparkle", c.hero.x + 120, c.hero.y - 40, { ms: 1800, r: 60 });
        await c.say([["narr", "The rose disc turns very slowly in the wall. Under it, on the altar steps, stands the first guardian, with a collar of light at its neck and the chain run up to the disc. It has been standing here a long time. The dust on its shoulders says so."]]);
        c.sfx("chain"); c.tint("#a04860", 0, 500);
      } });
    if (!freed) return;
    F.give("dawnDisc", 1, true); F.set("ch11.s22"); F.sfx("coin");
    await UI.say([["narr", "With the collar gone the disc comes out of the wall in your hands as easily as a ripe fruit. Rose-gold, warm as a loaf. It fits the first socket of Ithiel's key as if it had grown there."]]);
    UI.toast("The Dawn Disc. The Zenith Gate is open.", 3200);
  };
  S.done.gateS22 = F => F.f("ch11.s22");

  // ---------- Zenith Gate (S23) ----------
  S.trigger.gateS23 = async F => {
    if (F.f("ch11.s23")) return;
    F.music("greatPyramid");
    const freed = await M.gateScene(F, 23, 1, { level: 66, soldiers: [["courtPriest", 64, " B"], ["aquilaBearer", 66, " C"]], title: "Keeper of the Zenith Gate", place: "the Zenith Gate", fx: 120, fy: -6,
      setup: async c => {
        M3.actors(c, [["p1", "npcPriest", 130, -50], ["p2", "npcPriest", 150, 40]]);
        c.tint("#e8e8f4", 0.18, 400); c.fx("sparkle", c.hero.x + 120, c.hero.y - 40, { ms: 1800, r: 70 });
        await c.say([["narr", "The Zenith Gate is a round white hall, and every footstep comes back to you three times. The disc hangs high in the wall, white-gold, and the light falls from it straight down, so that nothing in the room has a shadow. On the altar stands the proudest of them, upright as a spear."]]);
        c.sfx("chain"); c.tint("#e8e8f4", 0, 500);
      } });
    if (!freed) return;
    F.give("zenithDisc", 1, true); F.set("ch11.s23"); F.sfx("coin");
    await UI.say([["narr", "The disc weighs nothing at all. In the second socket of Ithiel's key it rings, one clear note, and goes on ringing after you have stopped listening."]]);
    UI.toast("The Zenith Disc. The Dusk Gate is open.", 3200);
  };
  S.done.gateS23 = F => F.f("ch11.s23");

  // ---------- Dusk Gate (S24) ----------
  S.trigger.gateS24 = async F => {
    if (F.f("ch11.s24")) return;
    F.music("greatPyramid");
    const freed = await M.gateScene(F, 24, 2, { level: 67, soldiers: [["shadowMinotaur", 66, " B"], ["shadowMinotaur", 66, " C"]], title: "Keeper of the Dusk Gate", place: "the Dusk Gate", fx: 120, fy: -6,
      setup: async c => {
        M3.actors(c, [["m1", "npcJaguarElite", 130, -50], ["m2", "npcJaguarElite", 150, 40]]);
        c.tint("#301810", 0.5, 400);
        await c.say([["narr", "The Dusk Gate is almost dark. Copper light comes from the disc and from nowhere else; offering gutters run along both walls, dry, and a long way off water drips. The last guardian does not stand on the altar. It sits at the foot of it, with the chain across its knees."]]);
        c.sfx("chain"); c.tint("#301810", 0, 500);
      } });
    if (!freed) return;
    F.give("duskDisc", 1, true); F.set("ch11.s24"); F.sfx("coin");
    await S.m2.gate([["narr", "The third disc is cold and heavy. It fills the last socket, and the three together make the frame hum, one low chord, and somewhere under the hall a lock turns over like a sleeper."],
      ["narr", "The floor of the gate parts along a seam of light. A long stair runs down into the dark."]], { dx: 160, dy: 20, sfx: "stoneGrind", fx: "dust", fx2: "sparkle", shake: 4, flash: "#f0a060" });
    F.questDone("m_gates"); F.quest("m_emperor", 0);
    UI.toast("The Descent is open.", 3200);
  };
  S.done.gateS24 = F => F.f("ch11.s24");
})();

// ---------- part D: the Descent, Emperor Davichi, the Sun Eater (T8), finish ----------
(function () {
  const S = window.Story, D = window.Data, Q = Object.assign, M2 = S.m2, M3 = S.m3, M = S.m5, T = M.T, say = M.say, thought = M.thought, stage = M.stage, once = M.once, cycle = M.cycle, rel = M.rel;

  // ---------- 6.C the Descent ----------
  S.trigger.descentEnter = async F => {
    M.ensure(F, 11);
    if (!once(F, "descent.seen")) return;
    F.music("greatPyramid");
    const ids = [22, 23, 24].map(n => { const g = S.generalFor(n); return g ? g.id : null; }).filter(Boolean);
    await stage(async c => {
      ids.forEach((id, i) => c.actor("m" + i, { art: id, x: c.hero.x - 150 - i * 40, y: c.hero.y - 30 + i * 30, flip: false, scale: 1.1 }));
      c.tint("#10080a", 0.4, 500);
      await c.say([["narr", "Behind you, at the head of the stair, in the last of the copper light, three shapes stand together. They are not collared. They do not speak. They stand the way people stand at a harbour."]]);
      c.emote("m0", "heart"); await c.wait(900);
      await c.walkHero(c.hero.x + 90, c.hero.y + 10, 1400);
      await c.say([["narr", "The Descent runs down inside the pyramid in a long spiral of stair and ramp. Murals follow the wall: the sun calendar, a ring of days, each day a small carved sun with its own face. Offering gutters run along the foot of the wall with dark water in them, moving, though nothing moves it. Chains hang in loops from the roof, all the way down. Nobody makes a joke."]]);
      ids.forEach((_, i) => c.remove("m" + i)); c.tint("#10080a", 0, 800); c.follow();
    }, { music: "greatPyramid" });
    await F.banter("eater");
    F.set("ch11.descent");
  };
  S.done.descentEnter = F => F.f("ch11.descent");
  S.gather.calendarWall = async F => {
    if (F.f("ch11.wall")) return false;
    F.set("ch11.wall");
    await UI.say([["narr", "The ring of carved suns closes on itself, nearly. One sun is missing. The stone where it should be has been chiselled smooth, so carefully that the surface is a little brighter than the rest."], ["hero", "(Three hundred and sixty-four. Who erased the last?)"]]);
  };
  S.chest.descentChest = M.loot("c.descent", [["soulDew", 1]], 1500, "A chest in the offering gutter, sunk to its lid in dark water that does not wet your hand. One Soul Dew in a vial, and a purse of kakal tied with a priest's cord.");

  // ---------- 6.D Emperor Davichi ----------
  S.trigger.emperorScene = async F => {
    if (F.f("ch11.emperor")) return;
    M.ensure(F, 11); F.music("emperor");
    await stage(async c => {
      M3.actors(c, [["davichi", "npcDavichi", 130, -10, { flip: true }]]);
      c.tint("#2a1c08", 0.3, 500);
      await c.say([["narr", "A round gold hall at the pyramid's heart. A desk with a ledger on it, a single lamp, and a floor of gold that glows from beneath, as if something under it were breathing out. In the middle of the ceiling, a great round grate, and through it a light that is not the sun. A man at the desk is reading. He does not look up."]]);
      await c.walkHero(c.hero.x + 60, c.hero.y, 1100);
      await c.say([["davichi", "Sit. You have walked a long way. It is entered in the ledger."], ["hero", "I will stand."], ["davichi", "You will. You have your mother's way of refusing a chair."]]);
      c.emote("davichi", "..."); await c.wait(500);
      await c.say([["davichi", "Imela's son. You have her hands. I noticed that first, in the Corps' report from Marigold."],
        ["davichi", "Ithiel told you of the locks. He is right, and he is wrong. The locks hold what is inside. I have only ever wanted to know what is inside. Is that a crime? Everyone who ever built a door has wondered."],
        ["davichi", "I kept her safe from the war I made. Call it what you like."], ["hero", "You took her."], ["davichi", "Yes. And I would again. I am not a good man. I am a thorough one."]]);
      if (F.f("arena.licence")) await c.say([["davichi", "The arena has been generous this year. Your name is in it. Every victor is entered, and every entry is a yield."]]);
      await c.say([["davichi", "I will not beg. It is bad accounting."]]);
      c.shake(2, 600); c.sfx("hitHeavy"); c.tint("#2a1c08", 0.1, 400);
      await c.say([["narr", "He closes the ledger. He rises. The gold floor brightens under his boots, and the light through the grate comes down on him like a hand on a shoulder."]]);
    }, { music: "emperor" });
    const res = await M3.boss(F, { id: "emperorDavichi", level: 69, name: "Emperor Davichi", title: "Founder of the Company, Lord of the Dominion", bg: "sunCore", music: "emperor",
      lines: [["davichi", "Let us settle the account."], ["hero", "(He sounds like a man reading the weather.)"]] });
    if (res !== "win") return;
    M.markBreak("emperorDavichi");
    await stage(async c => {
      M3.actors(c, [["davichi", "npcDavichi", 110, -10, { flip: true }]]);
      c.tint("#2a1c08", 0.3, 100); c.sfx("break"); await c.wait(500);
      await c.say([["narr", "He goes down on one knee on the gold, and the sword goes quiet in his hand. For a moment he is simply a lean tired man in a good coat."], ["davichi", "It was entered in the ledger that you would win. I did not enter what it would cost."]]);
      c.shake(4, 1200); c.sfx("door"); c.flash("#ffd890", 600);
      await c.say([["narr", "The gold floor opens along a circle. A light the colour of old iron rises through it. Roots come up out of the dark, thick as a man's arm, and take him by the wrist, the knee, the shoulder, gently, the way a field takes seed. He does not resist."], ["davichi", "Yield."]]);
      c.remove("davichi"); c.shake(2, 800); await c.wait(900);
      c.tint("#2a1c08", 0.1, 600);
      await c.say([["narr", "He is gone. The floor closes over the place, and the lamp on the desk, which has not moved, goes out."], ["hero", "..."], ["narr", "Your creatures press close, all of them, shoulder to shoulder, and none of them says a word."]]);
      c.tint("#2a1c08", 0, 600);
    }, { music: "farewell" });
    F.set("ch11.emperor"); F.questDone("m_emperor"); F.quest("m_eater", 0);
    UI.toast("The grate in the floor stands open.", 3000);
  };
  S.done.emperorScene = F => F.f("ch11.emperor");

  // ---------- 6.E the Sun Eater (T8) ----------
  S.trigger.eaterFight = async F => {
    if (F.f("ch11.t8")) return;
    if (!F.f("ch11.emperor")) { await UI.say([["narr", "The way down is shut. Whatever is under the floor is waiting for its keeper to be dealt with."]]); return; }
    F.music("tension");
    const known = [1, 2, 3, 4].filter(n => F.f("lore.sunPiece" + n)).length;
    await stage(async c => {
      c.tint("#050408", 0.45, 500);
      await c.say([["narr", "A vast domed chamber with a black sun set into the floor, ringed with gold and chains. Dark roots run into it from every wall. Pillars of old offerings stand around it, like men holding their breath."],
        known ? ["hero", "(The tablets spoke of three suns. Dawn, Zenith, Dusk. I know " + (known >= 4 ? "all of it" : "some of it") + ".)"] : ["hero", "(Three suns. Dawn, Zenith, Dusk. I do not know what to do with that.)"]]);
      c.tint("#050408", 0, 400);
    }, { music: "tension" });
    const res = await M3.boss(F, { id: "sunEater", level: 70, name: "The Sun Eater", title: "Last Lock of the Builders", bg: "sunCore", music: "sunEater",
      lines: [["narr", "The floor goes black. A sun the colour of old iron rises out of it, ringed with chains, and opens something that is not a mouth."], ["hero", "(Three suns. Dawn, Zenith, Dusk.)"]] });
    if (res !== "win") return;
    M.markBreak("sunEater"); G.best.sunEater = Object.assign(G.best.sunEater || {}, { breakKnown: true });
    await stage(async c => {
      c.tint("#050408", 0.4, 100); c.sfx("break"); c.flash("#ffffff", 700); c.shake(5, 1400); await c.wait(1100);
      await c.say([["narr", "The black sun collapses inward, not like a thing dying but like a breath let out. The chains go slack, link by link, and fall silent on the gold. The pillars of offerings crumble into fine dust. The whole pyramid hums once, a single deep note that you feel in your ribs, and goes quiet."]]);
      c.tint("#050408", 0, 1400); c.fx("sparkle", c.hero.x, c.hero.y - 120, { ms: 2400, r: 80 });
      await c.say([["narr", "Where the sun was there is only a round shaft going up, and at the top of it, a long way up, a very small circle of pink."]]);
    }, { music: "farewell" });
    F.giveGear("G25", 3); F.set("ch11.t8"); F.questDone("m_eater"); F.quest("m_roof", 0);
    F.go("pyramidRoof", "from_sunEaterChamber");
  };
  S.done.eaterFight = F => F.f("ch11.t8");

  // ---------- Story.finish[11] (dbg.jump: the end of chapter 11, the epilogue and the post-game start) ----------
  S.finish[11] = (F, G) => {
    ["ch11.start", "ch11.supper", "ch11.stair", "ch11.s22", "ch11.s23", "ch11.s24", "ch11.descent", "ch11.wall", "ch11.emperor", "ch11.t8", "ch11.done", "gen.freed.22", "gen.freed.23", "gen.freed.24", "bb.seen", "descent.seen",
      "ch11.dawnPlates", "ch11.zenithPlates", "ch11.duskPlates", "epilogue.done", "post.start"].forEach(k => (G.flags[k] = true));
    ["m_gates", "m_emperor", "m_eater", "m_roof"].forEach(q => (G.quests[q] = "done"));
    [22, 23, 24].forEach(n => { const g = S.generalFor(n); if (g) S.noteGeneral(g.id, ["Freed at the Dawn Gate. It stood aside, and watched, and was still standing there when you looked back.", "Freed at the Zenith Gate. It stood aside, and watched, and was still standing there when you looked back.", "Freed at the Dusk Gate. It stood aside, and watched, and was still standing there when you looked back."][n - 22]); });
    G.items.ithielSunDisc = 1; G.items.dawnDisc = 1; G.items.zenithDisc = 1; G.items.duskDisc = 1; F.giveGear("G25", 3, true); G.gold += 5000;
    G.flags["wagon.at"] = "dawnwatchBastion"; G.lastTown = "dawnwatchBastion"; G.ch = 11;
    if (S.finish10Lore) S.finish10Lore(F, G);
  };
})();

// ---------- skill book (SKILLBOOK agent 2026-10-31): Banner Decoy (Dawn Thread, the Great Stair) ----------
(function () {
  const S = window.Story, D = window.Data, M2 = S.m2, add = (id, ...drops) => { D.DROPS[id] = (D.DROPS[id] || []).concat(drops); };
  Object.assign(D.MATS, { bannerThread: ["Dawn Thread", "Red-and-gold silk, scorched at one end. Someone was proud of the colour once."] });
  Object.assign(D.BOOK, { bannerDecoy: { n: "Banner Decoy", mat: "bannerThread", need: 10, d: "2 MP. Draws single-target attacks onto the user and it takes 25% less damage, until its next turn.", move: "bannerDecoy" } });
  add("sunPriestGolem", ["bannerThread", 0.3]); add("bloodAltarWraith", ["bannerThread", 0.2]);
  M2.bookSpot("ahuacanGreatStair", "bannerThread1", "A burnt standard", "g.thread1", "bannerThread", 5, "A burnt standard lies across the stair, its silk scorched but still red and gold. You unpick the border threads, five hanks of Dawn Thread, while the fighting goes on somewhere else.", "Banner Decoy");
  M2.bookSpot("ahuacanGreatStair", "bannerThread2", "A banner in the ash", "g.thread2", "bannerThread", 5, "A banner has been trodden into the ash by both sides in turn. The silk is the only thing on the stair that is still beautiful. Five more hanks.", "Banner Decoy");
})();
