// Chapter 7 script, The Rescue: Lowstep, the Ahuacan sewers, the Gilded Palace (court, garden, east wing, roofs), the sacrifice (owner: STORY-M4).
// Also holds the helpers chapters 7-9 share (window.Story.m4). Spec: ../game-mechanics/specs/M4.md. Voices: ../game-mechanics/STORY_BIBLE.md. Hero thoughts are in parentheses. Nobody explains menus; hints travel as rumours.
// Written in parts (each its own function): 1 helpers, data, regions; 2 Lowstep, sewers, court (S10); 3 garden (S11), east wing (S12), Imela; 4 roofs, the sacrifice, hand-off, finish/start.
"use strict";
(function () {
  const S = window.Story, D = window.Data, Q = Object.assign, M2 = S.m2, M3 = S.m3, M = S.m4 = {};
  S.begin = S.begin || {}; S.legend = S.legend || {}; S.done = S.done || {};
  const T = M3.T, R = D.REGIONS;
  const say = (who, text) => UI.say([[who, text]]), thought = text => UI.say([["hero", text]]);
  M.T = T; M.say = say; M.thought = thought; M.stage = M2.stage; M.once = M2.once; M.cycle = M2.cycle; M.loot = M2.loot; M.mat = M2.mat; M.rel = M2.rel; M.backup = M2.backup;
  M.hub = () => !!(Flow.engine && Flow.engine.mode === "hub");

  // ---------- speakers (portraits come from assets/portraits/<id>.png when ART-B has drawn them, else a stand-in face) ----------
  M3.people([["pavo", "Pavo", "h"], ["mender", "The Mender", "i"], ["messenger", "Courier of the Court", "t"], ["gaoler", "The Gaoler", "t"], ["gardener", "The Garden-Keeper", "s"], ["governor", "The Governor", "t"],
    ["foremanSalt", "Overseer Hask", "m"], ["widow", "Widow Tuk", "i"], ["wardenPrison", "The Warden", "t"], ["prisoner1", "Prisoner", "s"], ["prisoner2", "Prisoner", "s"], ["prisoner3", "Prisoner", "s"],
    ["cellVoice", "A voice in the glass", "s"], ["scout", "Scout", "h"], ["quartermaster", "Quartermaster", "m"], ["captainDahl", "Captain Oruk Dahl", "t"], ["cook", "The Governor's cook", "i"],
    ["workerLeader", "Miner", "m"], ["pressman", "Pressman", "m"], ["laundress", "Washerwoman", "i"], ["child", "Child", "h"], ["davichi", "Emperor Davichi", "t"], ["imela", "Imela", "i"],
    ["oldDunmar", "Old Dunmar", "m"], ["herald", "Herald", "t"], ["porter", "Porter", "m"], ["miner", "Miner", "m"], ["cellmate", "Prisoner", "s"], ["tamer", "Prisoner tamer", "s"]]);
  ["emberwick", "hearthkin", "mothmara"].forEach(id => { if (!UI.PEOPLE[id]) UI.person(id, id.charAt(0).toUpperCase() + id.slice(1), ["assets/portraits/" + id + ".png", "assets/creatures/" + id + ".png"]); });
  // from ch7.helm on the hero's portrait is the unmasked face (his mother's); the overworld sprite and the battle model keep the armour
  M.syncHero = () => {
    if (G && G.flags && G.flags["hero.unmasked"]) UI.person("hero", "Apprentice", ["assets/portraits/hero_open.png", "assets/portraits/hero.png", "assets/face_hero.png"]);
    else UI.person("hero", "Apprentice", ["assets/portraits/hero.png", "assets/face_hero.png"]);
  };
  (function () { const enter = Flow.enter; Flow.enter = function () { try { M.syncHero(); } catch (e) {} return enter.apply(this, arguments); }; })();
  // a village-style rumour giver for the M4 towns: first time the fixed rumour, afterwards the clue lines (M3.rum), then small talk
  M.town = (rid, o) => M3.talkTown(rid, o);
  // a gear chest that gives one piece per visit (S.gearChest2 from chapter 3), gated by a flag
  M.gearChest = (id, set, flag, locked) => async F => {
    if (flag && !F.f(flag)) { await UI.say([["narr", locked || "The chest is shut tight. Something still has to be dealt with first."]]); return false; }
    return S.gearChest2(F, id, set);
  };
  // the creature the player can see in a stage as a short silhouette: stage positions are relative to the hero
  M.actors = M3.actors;
  M.nightfall = M3.nightfall;
  // gaoler-style general scenes: S.generalScene (chapter 3) with this chapter's defaults. o = { level, soldiers, bg, title, place, where, setup, banter, after }
  M.general = (F, slot, o) => S.generalScene(F, slot, Q({ title: "General of the Legions", bg: "palace" }, o));

  // ---------- items, goods, quests ----------
  const key = (n, d) => ({ n, d, key: true });
  Q(D.ITEMS, {
    lowstepToken: key("Ranna's Pass", "A scrap of dyed cloth with a laundry mark. Servants at the palace doors look at it, then at the wall."),
    palaceKeyA: key("Court Gate Key", "A gilt key with a sun-wheel bow. It fits the servants' door in the west gallery."),
    palaceKeyB: key("Garden Gate Key", "A key of jade and brass, warm from a hundred hands."),
    palaceKeyC: key("East Wing Key", "A plain iron key. The only plain thing in the palace."),
    davichiNote: key("The Note on the Table", "\"To Imela's son. She is yours, if you can carry her out. The door is open. Come again. Use the door this time. - D.\" A courtly hand, with every letter finished."),
    imelaShawl: key("Imela's Shawl", "Plain dark wool, smelling of thyme. She put it round your shoulders on the roof and has not asked for it back."),
    ninthBanner: key("The Ninth Banner", "A legion banner gone grey with salt. The sun wheel is stitched on it twice, once by a hand that was in a hurry."),
    keyK6: key("Cistern Key", "A key of green glass, cold as the cistern. It opens a cage at the Menagerie Wagon."),
    keyK7: key("Nest Key", "A key of grey ash-wood, still warm in the middle. It opens a cage at the Menagerie Wagon."),
    cellKey: key("Warden's Cell Key", "A black glass key taken off the Warden's belt. It opens the glass doors of the Black Mirror."),
    cellNineKey: key("Cell Nine Key", "A small glass key, newer than the others. The tag reads: one creature, to be kept alive."),
    ledgerLots: key("Ledger: Lots and Transfers", "The Governor's ledgers: lots, prices, transfers. One line is underlined in another hand: \"Cell 9, Black Mirror: one creature, Ahuacan palace lot, to be kept alive.\""),
    governorRegalia: Q(key("Governor's Regalia", "Cosmetic. A cloak of green feathers and a gilt collar, taken out of a strongroom. It does nothing and weighs a great deal."), { f: 20 }),
  });
  Q(D.GOODS, {
    gildedPlume: ["Gilded Helm Plume", 48], eagleFletch: ["Eagle Fletching", 42], sunSeal: ["Court Sun-Seal", 56], houndTag: ["Temple-Hound Tag", 40], nagaHide: ["Sewer-Naga Hide", 44], ratTail: ["Rat-King's Tail", 36], wraithChain: ["Wraith Chain Link", 46],
  });
  Q(D.QUESTS, {
    m_rescue: { t: "The Rescue", main: true, ch: 7, steps: ["Get your mother out of the palace. Ranna's cell has a way in under the city."] },
    m_sail: { t: "To the Ship", main: true, ch: 7, steps: ["Get her to the ship. The Salt Heron waits at the Lowstep dock."] },
  });

  // ---------- inns, shops, rumours ----------
  const BAS = ["sunwater", "antidote"], CURES = [], BOMBS = ["cinderBomb", "rimeFlask", "soakJar", "sparkJar", "venomPot"], WARDS = ["cinderWard", "rimeWard", "stormWard", "venomWard"];
  const disc = (list, f) => { const o = {}; list.forEach(k => (o[k] = f)); return o; };
  const IMP = BAS.concat(CURES, ["tonic", "ember", "incense", "candle"], BOMBS, WARDS);
  M.BAS = BAS; M.CURES = CURES; M.BOMBS = BOMBS; M.WARDS = WARDS; M.disc = disc;
  Q(D.INNS, { lowstep: { n: "The Mender's Corner", mult: 1.5 } });
  Q(D.SHOPS, { lowstep: { n: "Lowstep market", who: "merchant", stock: IMP, disc: disc(IMP, 1.2), buys: 0.8 } });
  M3.rumours("lowstep", ["The emperor leaves the palace once a decade, for a triumph. This week there is no triumph.", "The lady in the east wing never speaks of her homeland.", "Something in the roots of Tolcan woke two moons ago. It has been chewing since."],
    [M3.clue(10, 0), M3.clue(11, 0), M3.clue(12, 0)]);

  // ---------- bestiary and drops: the palace and the sewers ----------
  Q(D.BEST, {
    sewerNaga: "A water-snake as thick as a drain, in the black water. Its coil holds one of you helpless. Lightning in the water goes a long way.",
    ratChimera: "Rats fused into one mass, all teeth and tails. It swarms. Fire clears the nest.",
    drownedSlaveWraith: "A chained ghost, dragging its chain. Its pull slows you down. Fire reaches it; blades do not.",
    palaceGuard: "Gilded helmet, tower shield. Sturdy. Lightning finds the gaps.",
    eagleCohortArcher: "An archer on the gallery wall. He fires at whoever is lowest on health. Shock drops him.",
    courtPriest: "A soft-voiced priest of the sun. He mends the guards and blesses them. Take him first; cold unsettles him.",
    templeHound: "A dog-man trained to hunt, quick, and its bite keeps bleeding. Cold slows it.",
  });
  Q(D.DROPS, {
    sewerNaga: [["nagaHide", 0.45]], ratChimera: [["ratTail", 0.5]], drownedSlaveWraith: [["wraithChain", 0.45]], palaceGuard: [["gildedPlume", 0.45], ["legionCoin", 0.5]],
    eagleCohortArcher: [["eagleFletch", 0.45]], courtPriest: [["sunSeal", 0.4]], templeHound: [["houndTag", 0.45]],
  });
  D.BREAKS = D.BREAKS || {};

  // ---------- regions: metadata the story reads (arena, music, table, town, inn) and the hub fallback (npcs / exits / things) ----------
  const yes = () => true;
  M3.region("lowstep", { n: "Lowstep", bg: "bg_ruins", arena: "palace", music: "capital", town: "lowstep", inn: "lowstep", autos: ["lowstepArrive"],
    npcs: [["mender", "The Mender's Corner"], ["merchant", "Market stalls"], ["ranna", "Ranna Kell"], ["pavo", "Pavo, at the drain grate", s => !s.f["ch7.sewers"]], ["cell1", "A dye-works hand"], ["cell2", "A dyer"], ["cell3", "A washerwoman at the table"],
      ["r1", "A porter"], ["r2", "An old woman"], ["r3", "A child on the stair"], ["laundress", "A washerwoman"]],
    exits: [["ahuacanSewers", "The drain grate behind the dye-works", s => s.f["ch7.briefed"] && !s.f["ch7.sacrifice"]], ["weepingSea", "The dock stairs", s => s.f["ch7.done"]]],
    things: [["planBriefing", "Ranna's chalk map on the dye-works floor", s => s.f["ch7.start"] && !s.f["ch7.briefed"], "trigger"]] });
  M3.region("ahuacanSewers", { n: "Ahuacan Sewers", bg: "bg_ruins", arena: "sewer", music: "sewer", table: "sewer", fields: true, dungeon: true, autos: ["sewerEnter"],
    npcs: [["pavo", "Pavo, ahead with the lantern"]], exits: [["lowstep", "Back up the drain to Lowstep", yes], ["palaceCourt", "The grating under the palace court", s => s.f["ch7.sewers"]]],
    things: [["valve1", "A water-gate wheel, rust-red", s => !s.f["sw.v1"], "trigger"], ["valve2", "A water-gate wheel, green with slime", s => !s.f["sw.v2"], "trigger"], ["valve3", "A water-gate wheel under a lamp-niche", s => !s.f["sw.v3"], "trigger"],
      ["sewerChest", "A builder cistern with a chest on its rim", s => !s.f["c.sewer"], "chest"], ["sewerEnd", "The grating, now above the waterline", s => s.f["sw.v1"] && s.f["sw.v2"] && s.f["sw.v3"] && !s.f["ch7.sewers"], "trigger"]] });
  M3.region("palaceCourt", { n: "The Palace Court", bg: "bg_ruins", arena: "palace", music: "palace", table: "palace", fields: true, dungeon: true, autos: ["courtEnter"],
    npcs: [], exits: [["ahuacanSewers", "Back down to the sewers", yes], ["palaceGarden", "The inner gate to the Palace Garden", s => s.f["ch7.s10"]]],
    things: [["gateS10", "The inner gate and its collar altar", s => !s.f["ch7.s10"], "trigger"], ["courtWatch", "A servants' passage between the galleries", s => !s.f["ch7.watch"], "trigger"],
      ["westGallery", "The west gallery, where a priest keeps the keys", s => !s.f["ch7.courtKey"], "trigger"], ["g43_sunstoneRegalia", "The treasury behind the servant door", s => s.f["ch7.courtKey"], "chest"]] });
  M3.region("palaceGarden", { n: "The Palace Garden", bg: "bg_ruins", arena: "palaceGarden", music: "palace", table: "garden", fields: true, dungeon: true, autos: ["messengerScene"],
    npcs: [], exits: [["palaceCourt", "Back to the Court", yes], ["palaceEastWing", "The gate to the East Wing", s => s.f["ch7.s11"]]],
    things: [["gardenS11", "The centre of the garden, under the sun-dial", s => !s.f["ch7.s11"], "trigger"], ["hiddenShrine", "A gap in the hedge wall", s => !s.f["ch7.shrine"], "gather"]] });
  M3.region("palaceEastWing", { n: "The East Wing", bg: "bg_ruins", arena: "palace", music: "palace", table: "eastWing", fields: true, dungeon: true,
    npcs: [], exits: [["palaceGarden", "Back to the Garden", yes], ["palaceRoofs", "The stair to the roofs", s => s.f["ch7.s12"] && s.f["ch7.helm"]]],
    things: [["gaolerS12", "The second court, where the Gaoler waits", s => !s.f["ch7.s12"], "trigger"], ["imelaRoom", "The door of the third court, with a lamp in the window", s => s.f["ch7.s12"] && !s.f["ch7.helm"], "trigger"],
      ["davichiNote", "A folded note on her table", s => s.f["ch7.helm"] && !s.f["ch7.note"], "gather"], ["thymeBox", "A window box of thyme", s => s.f["ch7.s12"], "gather"]] });
  M3.region("palaceRoofs", { n: "The Roofs", bg: "bg_ruins", arena: "palace", music: "tension", table: "palace", fields: false, dungeon: true, autos: ["roofRun"],
    npcs: [], exits: [], things: [["sacrificeGate", "The last gate, a stone shutter at the roof stair", s => s.f["ch7.roofs"] && !s.f["ch7.sacrifice"], "trigger"]] });
})();

// ---------- part 2: Lowstep, the sewers, the Palace Court (S10) ----------
(function () {
  const S = window.Story, D = window.Data, M = S.m4, M3 = S.m3, M2 = S.m2, T = M.T, say = M.say, thought = M.thought, stage = M.stage, once = M.once, cycle = M.cycle;
  const hub = M.hub;

  // ---------- 4.A Lowstep ----------
  S.trigger.lowstepArrive = async F => {
    if (F.f("ch7.sacrifice") && !F.f("ch7.done")) return M.dockScene(F);           // coming back over the rope bridge
    if (!once(F, "ch7.arrived")) return;
    if (G.ch < 7) G.ch = 7; F.set("ch7.start"); F.music("capital");
    await stage(async c => {
      c.tint("#241c34", 0.25, 300);
      M3.actors(c, [["ranna", "npcRanna", 170, -10, { name: "Ranna", flip: true }]]);
      await c.say([["narr", "Night at the foot of the Great Pyramid. A stair of lamps climbs the dark hill, and the pyramid blots out half the sky above it. The air smells of dye and lamp-smoke and fried dough."]]);
      c.emote("ranna", "!");
      await c.walk("ranna", c.hero.x + 70, c.hero.y - 4, 900);
      await c.say([["ranna", "You are late and you are the right height. Ask nicely and I will get you through any door."], ["hero", "Where is she?"],
        ["ranna", "Ask rudely and I will get you through a better one. Sit. Eat first."]]);
      c.sfx("door"); c.tint("#241c34", 0.1, 600);
      await c.say([["narr", "A dye-works with the shutters down. Three people at a table under a hanging rack of sun-yellow cloth: a hand with stained arms, a dyer, a washerwoman folding a sheet in thirds. Nobody asks who you are. A bowl is put in front of you."]]);
      c.remove("ranna"); c.follow();
    }, { music: "capital" });
    F.quest("m_rescue", 0);
  };
  S.done.lowstepArrive = F => F.f("ch7.arrived") && !(F.f("ch7.sacrifice") && !F.f("ch7.done"));
  S.trigger.planBriefing = async F => {
    if (F.f("ch7.briefed") || !F.f("ch7.start")) return;
    await stage(async c => {
      M3.actors(c, [["ranna", "npcRanna", 60, -8, { name: "Ranna", flip: true }]]);
      c.tint("#2a2030", 0.18, 300);
      await c.say([["narr", "Ranna kneels on the dye-works floor with a stub of chalk. A stair for the sewers. A square for the court. A square inside it, for the garden. A long thin box for the east wing. A line over the top of all of it."],
        ["ranna", "Sewers, court, garden, east wing, roofs. It is one long walk and there are no beds in it. Sleep at the Mender's first."],
        ["ranna", "The emperor does not meet guests. He does not leave either. Tonight is not a good night to count on that."],
        ["hero", "How many guards?"], ["ranna", "Enough to be bored. Bored guards are the worst: they are looking for something to do."],
        ["ranna", "Pavo knows the drains. He will tell you he knows all of them. He knows most."]]);
      c.remove("ranna"); c.follow();
    });
    F.set("ch7.briefed"); F.give("lowstepToken", 1, true); UI.toast("Ranna's pass received.", 2600);
  };
  S.done.planBriefing = F => F.f("ch7.briefed");
  // blocked exits (the world maps run these when a gated exit is walked into)
  S.trigger.lowstepGrateShut = async F => { await UI.say([["hero", "(An iron grate behind the vats, a new chain through the bars. The boy sitting beside it watches me and keeps his hands in his lap.)"]]); };
  S.trigger.sewerGratingShut = async F => { await UI.say([["hero", "(The grating up into the court is under water. The current holds it shut.)"]]); };
  S.trigger.innerGateSealed = async F => { await UI.say([["hero", "(The inner gate is barred, and the collar altar on its lintel is humming.)"]]); };
  S.trigger.trellisGateShut = async F => { await UI.say([["hero", "(The trellis gate to the East Wing is chained. The sundial's shadow lies across the lock.)"]]); };
  S.trigger.roofStairShut = async F => { await UI.say([["hero", "(The roof stair is shut behind a third court. There is a lamp lit in that window.)"]]); };
  S.trigger.ropeBridgeShut = async F => { await UI.say([["hero", "(The rope bridge is hauled up on the far side. Before it, the last gate of the roofs is still shut.)"]]); };
  S.trigger.seaLowstepShut = async F => { await UI.say([["hero", "(Lamps climbing a black hill, and a chain boom across the dock. No pilot would bring a ship in there for me.)"]]); };
  M3.talkTown("lowstep", { innLine: F => F.f("ch7.helm") ? "The Mender's Corner. A bed, a bowl, and nobody's business." : "The Mender's Corner. A bed, a bowl, and no questions about who you were before.", inn: "lowstep",
    shopLine: "Imperial stock, imperial prices. The Throne's tax is in the cheese.", shop: "lowstep", who: ["porter", "oldwoman", "child"] });
  T("lowstep").mender = T("lowstep").innkeeper;
  T("lowstep").ranna = async F => {
    if (!F.f("ch7.briefed")) { await say("ranna", "The chalk is on the floor by the vats. Come and look at it before you start asking me things."); return; }
    if (!F.f("ch7.sewers")) { await say("ranna", cycle("rn7.a", ["Pavo is at the drain grate behind the dye-works. He talks. Let him talk; a boy who talks is a boy who is not afraid.", "Sleep first, then the drain. I mean it. I have buried people who did it the other way round.", "Bread, thyme and a window left open. That is the whole plan, if you need it short."])); return; }
    await say("ranna", cycle("rn7.b", ["The washerwomen are watching the palace stairs. If something happens, they will hang the red cloth.", "You are up late. Good. So is the palace.", "Go. I will be here. Someone should be."]));
  };
  T("lowstep").pavo = async F => {
    if (!F.f("ch7.briefed")) { await say("pavo", "I know a thousand drains. Nine hundred are lies. Ranna says I am to take you, when you have eaten. Have you eaten?"); return; }
    await say("pavo", "I know a thousand drains. Nine hundred are lies. Come on; keep your lantern low and your feet in the middle. The walls have opinions.");
    await thought("(He is perhaps fourteen. He walks into the drain like a boy walking into his own kitchen.)");
    if (!hub()) F.go("ahuacanSewers", "from_lowstep");
  };
  T("lowstep").cell1 = async F => { await say("cell1", cycle("cl1", ["Ranna says the laundry goes into the east wing every second morning. Don't ask me what comes out.", "My hands are blue to the elbow. I was born with them this colour, I tell the guards."])); };
  T("lowstep").cell2 = async F => { await say("cell2", cycle("cl2", ["Sun-yellow takes twelve days and a good fire. The palace wants it by the dozen. We send them orange and they say thank you.", "I dyed the banner on the Court gate. It is slightly the wrong yellow. Nobody has noticed in six years."])); };
  T("lowstep").cell3 = async F => { await say("cell3", cycle("cl3", ["The sheets from that wing come back folded corner to corner. Only one woman in the palace folds like that. We knew whose it was before anybody told us.", "Eat. You are thin under that tin, and your mother will say so."])); };
  T("lowstep").laundress = async F => { await say("laundress", cycle("lw7", ["Hang it where the lamplight cannot find it. That is the whole trade.", "The gold leaf on the Court gate comes off on the washing. We have enough to buy a goat, some years."])); };
  ["cell1", "cell2", "cell3"].forEach(id => { if (!UI.PEOPLE[id]) UI.person(id, id === "cell1" ? "Dye-works hand" : id === "cell2" ? "Dyer" : "Washerwoman", ["assets/portraits/" + id + ".png", "assets/face_scholar.png"]); });

  // ---------- 4.B The sewers ----------
  S.trigger.sewerEnter = async F => {
    if (!once(F, "sw.seen")) return;
    F.music("sewer");
    await stage(async c => {
      M3.actors(c, [["pavo", "npcPavo", 50, -8, { name: "Pavo", flip: true }]]); c.tint("#0a1814", 0.3, 400);
      await c.say([["narr", "Brick tunnels under the city, black water to the ankle, light coming down through grates in thin white bars. Somewhere above, a cart goes over the street, and the whole tunnel hums."],
        ["pavo", "That one leads to the tannery. That one leads to a very angry man. That one leads to where you want to go, but it is under water. Valves. Three of them."]]);
      c.remove("pavo"); c.follow();
    }, { music: "sewer" });
  };
  S.done.sewerEnter = F => F.f("sw.seen");
  const VALVE = ["A wheel the size of a cartwheel, red with rust. It turns on the second try, and something far off in the brick gives a long wet sigh.", "The second wheel is green with slime. It turns easily, as if it had been turned every week by someone who was not supposed to.",
    "The third wheel hangs under a lamp-niche. Somebody has been oiling it. You turn it, and the whole tunnel groans, and the black water starts to go down the walls like a held breath being let out."];
  [1, 2, 3].forEach(n => {
    S.done["valve" + n] = F => F.f("sw.v" + n);
    S.trigger["valve" + n] = async F => {
      if (F.f("sw.v" + n)) return; F.set("sw.v" + n);
      await S.m2.gate([["narr", VALVE[n - 1]]], { dx: 100, dy: 10, sfx: "waterRush", fx: "splash", fx2: n === 3 ? "smoke" : undefined, shake: n === 3 ? 3 : 1, tint: "#0a1814" });
      if (F.f("sw.v1") && F.f("sw.v2") && F.f("sw.v3")) await say("pavo", "That is all three. The grating is out of the water. Nine hundred lies and one true drain.");
    };
  });
  T("ahuacanSewers").pavo = async F => {
    const n = [1, 2, 3].filter(k => F.f("sw.v" + k)).length;
    if (F.f("ch7.sewers")) { await say("pavo", "Up is the court. I do not go up. A boy with sewer on his boots in a gilded corridor is a very short story."); return; }
    await say("pavo", n === 0 ? "Wheels, three of them. Rusty, slimy and the one with the lamp. Do not ask what the lamp is for." : n < 3 ? "Good. " + (3 - n) + " more. Do not let the rat-nests see your light; they take it personally." : "The grating. Go and look at it, I will watch the corridor.");
  };
  S.chest.sewerChest = M2.loot("c.sewer", [["sunwater", 3]], 300, "A builder's cistern, dry on its rim, and a chest somebody has hidden in it. Three Sunwater Flasks and a purse that clinks. Whoever stashed it did it in a hurry and did not come back.");
  S.done.sewerEnd = F => F.f("ch7.sewers");
  S.trigger.sewerEnd = async F => {
    if (F.f("ch7.sewers")) return;
    if (!hub() && ![1, 2, 3].every(n => F.f("sw.v" + n)) && !F.f("ch7.valves")) { await UI.say([["narr", "The grating is under a hand's depth of black water. The wheels must be turned first."]]); return; }
    F.set("ch7.sewers"); F.sfx("door");
    await stage(async c => {
      M3.actors(c, [["pavo", "npcPavo", -50, 0, { name: "Pavo" }]]);
      await c.say([["narr", "The grating swings up on a hinge somebody greased this spring. Above it, a shaft of gold light, and the smell of beeswax and warm stone."], ["pavo", "That is the court. I stay here. If I hear boots I will bang the pipe three times."], ["hero", "And if you don't hear boots?"], ["pavo", "Then I will be eating. Go on."]]);
      c.remove("pavo"); c.follow();
    });
  };

  // ---------- 4.B The court (S10) ----------
  S.trigger.courtEnter = async F => {
    if (!once(F, "crt.seen")) return;
    F.music("palace");
    await stage(async c => {
      c.tint("#3a2c14", 0.15, 400);
      await c.say([["narr", "The outer court of the Gilded Palace: white stone and gold leaf, banners of the sun calendar, galleries where guards walk slowly in pairs. A fountain keeps its own time. Servants cross the court with trays, and nobody looks at their faces."], ["hero", "(Nineteen years. She has been behind these walls for nineteen years.)"]]);
      c.tint("#3a2c14", 0, 500); c.follow();
    }, { music: "palace" });
    await F.banter("palace");
  };
  S.done.courtEnter = F => F.f("crt.seen");
  S.trigger.courtWatch = async F => {
    if (!once(F, "ch7.watch")) return;
    await UI.say([["narr", "A servants' passage runs behind the gallery wall, low and plain, smelling of soap. A washerwoman at the far end sees Ranna's cloth, then looks carefully at the wall until you have gone by."], ["hero", "(Nobody notices a servant. Nobody notices a servant carrying a tray.)"]]);
  };
  S.trigger.westGallery = async F => {
    if (F.f("ch7.courtKey")) return;
    await UI.say([["narr", "In the west gallery a priest of the court sits at a small table with a ring of keys, a cup of tea going cold, and no guards. He looks up with the gentle face of a man who has never been refused."], ["priest", "By the authority of the Throne, the west gallery is closed. It is entered in the ledger that you did not hear me say so."]]);
    const res = await F.fight([F.mkEnemy("courtPriest", 40), F.mkEnemy("palaceGuard", 40, " B")], { bg: "palace", intro: "The court priest calls the guard!" });
    if (res !== "win") return;
    F.set("ch7.courtKey"); F.give("palaceKeyA", 1, true); F.sfx("coin");
    await UI.say([["narr", "On the priest's ring, one gilt key with a sun-wheel bow. It fits a servant door at the end of the gallery, behind a tapestry of the harvest."]]);
  };
  S.done.westGallery = F => F.f("ch7.courtKey");
  S.chest.g43_sunstoneRegalia = M.gearChest("g43_sunstoneRegalia", "G43", "ch7.courtKey", "The treasury is behind a servant door with a gilt lock. The keys are in the west gallery.");
  S.done.gateS10 = F => F.f("ch7.s10");
  S.trigger.gateS10 = async F => {
    if (F.f("ch7.s10")) return;
    F.music("tension");
    const ok = await M.general(F, 10, { level: 39, soldiers: [["palaceGuard", 38, " B"], ["maskedExecutioner", 40, " C"]], bg: "palace", title: "The Gate Warden", place: "the inner gate of the Palace Court", where: "It ran for the lowest gate, and the lowest gate let it through.", fx: 130, fy: -6,
      setup: async c => {
        const h = c.hero; c.tint("#2a1a08", 0.25, 400);
        M3.actors(c, [["gd", "npcGuard", 150, -40, { name: "Gate-guard", flip: true }]]);
        await c.pan(h.x + 120, h.y - 20, 900);
        await c.say([["narr", "The inner gate stands under a gilded arch. On a dais before it a collar altar of black stone, and a creature kneeling in gold harness as if it were being dressed for a feast. The guards on either side do not look at it. It does not look at them."], ["guard", "By the authority of the Throne, the inner gate is closed to the unregistered."]]);
        c.shake(2, 500); c.sfx("hitHeavy"); await c.wait(400); c.remove("gd"); c.follow();
      }, after: ["(The gate is open. I do not want to walk through it.)"] });
    if (!ok) return;
    F.set("ch7.s10");
    await S.m2.gate([["narr", "The collar-altar goes dark. The gate stands open, and a long white corridor runs under banners to the Garden. Nobody has come yet."]], { dx: 190, dy: -20, sfx: "door", fx: "dust", fx2: "sparkle", shake: 2 });
  };
})();

// ---------- part 3: the garden (S11, the messenger, the hidden shrine), the east wing (S12) and Imela ----------
(function () {
  const S = window.Story, D = window.Data, M = S.m4, M3 = S.m3, M2 = S.m2, T = M.T, say = M.say, thought = M.thought, stage = M.stage, once = M.once, cycle = M.cycle;
  const hub = M.hub;
  D.ITEMS.starwardenMark = { n: "The Feather-in-Star Mark", d: "A feather inside a star, cut into a hedge-shrine in the emperor's garden, the same mark as on your satchel strap. Beside it, mirrored in builder script: THE COUNT IS SHORT.", key: true };
  D.LORE.starwarden = "The feather inside a star. On your satchel strap, on a blanket in Marigold Hollow, and on a hedge-shrine in the emperor's garden. Someone who could read builder script backwards cut it there.";

  // ---------- 4.C The garden ----------
  S.trigger.messengerScene = async F => {
    if (!F.f("ch7.s10") && !hub()) return;
    if (!once(F, "ch7.messenger")) return;
    F.music("palace");
    await stage(async c => {
      const h = c.hero; c.tint("#2c2418", 0.14, 400);
      await c.say([["narr", "Terraced gardens of cacao and jasmine under a glass roof, caged birds in every arbour. From the balcony you can see down into the court. A horn sounds, twice, short."]]);
      M3.actors(c, [["msg", "npcCourier", 130, 60, { name: "Courier", flip: true }]]);
      c.emote("msg", "!");
      await c.say([["messenger", "Lord, a creature the size of a hill has been found in Rootdeep. The roots have moved."]]);
      await c.wait(600); c.sfx("encounter");
      await c.say([["davichi", "Prepare the guard. I will see it myself."]]);
      c.remove("msg");
      M3.actors(c, [["em", "npcDavichi", 300, 80, { name: "", flip: true }]]);
      await c.say([["narr", "Through a lattice of gilt wood you see a man in plain dark robes cross the court below, with his back to you: lean, unhurried, hands folded behind him. Forty guards fall in around him without a word. He never turns his head."]]);
      await c.walk("em", h.x + 640, h.y + 90, 3200); c.remove("em");
      await c.say([["hero", "(That is him. He is walking away.)"]]);
      c.tint("#2c2418", 0, 600); c.follow();
    }, { music: "tension" });
    UI.toast("The palace patrols thin.", 2600);
  };
  S.done.messengerScene = F => F.f("ch7.messenger");
  S.done.gardenS11 = F => F.f("ch7.s11");
  S.trigger.gardenS11 = async F => {
    if (F.f("ch7.s11")) return;
    F.music("tension");
    const ok = await M.general(F, 11, { level: 41, soldiers: [["wardStoneAbjurer", 40, " B"]], bg: "palaceGarden", title: "The Garden Keeper", place: "the sun-dial in the Palace Garden", where: "It went up through the glass roof, and every caged bird sang.", fx: 140, fy: -4,
      setup: async c => {
        const h = c.hero; c.tint("#14260e", 0.22, 400);
        M3.actors(c, [["gd", "npcPriest", 170, -30, { name: "Court Priest", flip: true }]]);
        await c.pan(h.x + 110, h.y - 10, 900);
        await c.say([["narr", "At the centre of the garden a sun-dial of white stone, and at its foot a creature curled round it like a gardener's dog, a collar of gold wire on its neck and a chain running to a stake in the soil. The caged birds have all gone quiet at once."], ["priest", "The Keeper does not care for visitors. The jasmine is in bloom. It is entered in the ledger that you were warned."]]);
        c.shake(2, 500); c.sfx("hitHeavy"); await c.wait(400); c.remove("gd"); c.follow();
      }, after: ["(Every bird in this garden is singing. They know something I do not.)"] });
    if (!ok) return;
    F.set("ch7.s11"); F.set("ch7.garden");
    await S.m2.gate([["narr", "The gold wire falls out of the jasmine like a dropped necklace. Beyond the hedge wall, a little gate stands ajar toward the East Wing."]], { dx: 200, dy: 10, sfx: "door", fx: "leaves", fx2: "sparkle", shake: 1 });
  };
  M3.spot("palaceGarden", "hiddenShrine", async F => {
    if (!once(F, "ch7.shrine")) { await UI.say([["narr", "The hedge-shrine is small and grey. A feather inside a star. The mirrored lines beside it have not changed."]]); return; }
    F.give("starwardenMark", 1, true); F.set("lore.starwarden");
    await UI.say([["narr", "A gap in the hedge wall, grown over, as if it had been trimmed round for a hundred years by gardeners who did not know why. Behind it, a shrine no taller than a child: grey stone, a candle stub, and in the stone a feather inside a star."],
      ["narr", "Beside it, cut with a knife-point over older builder carving, mirrored lines in builder script. Backwards. Someone wrote this so it could only be read in a pool of water, or a mirror, or a polished shield."], ["narr", "THE COUNT IS SHORT."],
      ["hero", "(The same mark. It is on my strap. It is on a wall in the emperor's own garden.)"], ["hero", "(Someone stood here, with a knife, in a hurry. Someone who could write backwards.)"]]);
    UI.toast("Journal: the Feather-in-Star mark.", 3000);
  }, "tgc");
  S.done.hiddenShrine = F => F.f("ch7.shrine");

  // ---------- 4.D The east wing: the Gaoler (S12) ----------
  S.done.gaolerS12 = F => F.f("ch7.s12");
  S.trigger.gaolerS12 = async F => {
    if (F.f("ch7.s12")) return;
    F.music("tension");
    const ok = await M.general(F, 12, { level: 43, soldiers: [["jaguarCohortElite", 41, " B"], ["jaguarCohortElite", 41, " C"]], bg: "palace", title: "The Mother's Gaoler", place: "the second court of the East Wing", where: "It went out by the laundry court, the way the washing goes.", fx: 130, fy: -4,
      setup: async c => {
        const h = c.hero; c.tint("#2a1c18", 0.22, 400);
        M3.actors(c, [["gl", "npcOverseer", 160, -30, { name: "The Gaoler", flip: true }]]);
        await c.pan(h.x + 110, h.y - 10, 900);
        await c.say([["narr", "A herb court, quiet as a held breath. A window box of rosemary, a well-swept path. At the arch to the third court a creature lies across the threshold, and over it a heavy woman with a ring of keys at her belt stands as still as the creature does."],
          ["gaoler", "By the authority of the Throne, the lady is not to be disturbed. I have kept this arch for nineteen years. It is entered in the ledger that no one has ever come."]]);
        c.shake(2, 500); c.sfx("hitHeavy"); await c.wait(400); c.follow();
      }, after: ["(Nineteen years at that threshold. And it never once let her through.)"] });
    if (!ok) return;
    F.set("ch7.s12");
    await stage(async c => {
      M3.actors(c, [["gl", "npcOverseer", 60, -6, { name: "The Gaoler" }]]);
      await c.say([["gaoler", "The keys. Take them. They are for show. That door has never been locked."], ["hero", "Never?"], ["gaoler", "She has never once tried it. Not in nineteen years. She knew what the door was for, and what it was not for."],
        ["gaoler", "The third court is on your left. Mind the thyme."]]);
      c.remove("gl"); c.follow();
    });
    F.give("palaceKeyC", 1, true);
  };
  M3.spot("palaceEastWing", "thymeBox", async F => {
    await UI.say([["narr", "A window box of thyme, cut back hard, and a few stems twisted into a ring and hung from the nail. Bread, thyme and a window left open."]]);
    if (once(F, "ch7.thyme")) await thought("(She grows it here. Nineteen years, and she planted the same thing.)");
  }, "tgc");

  // ---------- 4.D Imela (imelaRoom) ----------
  M.noteScene = async F => {
    F.give("davichiNote", 1, true); F.set("ch7.note");
    await UI.say([["narr", "A folded note on the table, under a plate of bread. A courtly hand, with every letter finished."], ["hero", "\"To Imela's son. She is yours, if you can carry her out. The door is open. Come again. Use the door this time. - D.\""], ["imela", "Hm."],
      ["narr", "It is a whole sentence. You have heard her say it twice and you already know it."]]);
  };
  S.done.imelaRoom = F => F.f("ch7.helm");
  S.trigger.imelaRoom = async F => {
    if (F.f("ch7.helm")) return;
    if (!F.f("ch7.s12") && !hub()) { await UI.say([["narr", "The door to the third court is a few steps on. Something is still lying across the way."]]); return; }
    F.music("letters");
    await stage(async c => {
      const h = c.hero; c.tint("#3a2c14", 0.2, 500);
      M3.actors(c, [["im", "npcImela", 90, -6, { name: "Imela", flip: true }]]);
      await c.say([["narr", "The third court. A lamp in a high window. A window box of thyme. A woman of about forty at a loom, her back to the door, passing the shuttle through without looking at it."]]);
      await c.wait(900);
      await c.say([["imela", "You are late for dinner."]]);
      await c.say([["hero", "..."]]);
      await c.say([["imela", "Sit. Eat first. Questions keep."], ["hero", "(I cannot make a sound come out. I have written this in my head a hundred times and every one of them was wrong.)"]]);
      c.face("im", "right"); c.emote("im", "heart"); await c.wait(800);
      await c.say([["imela", "You have my father's chin. Take that thing off your head, sparrow. I want to see it."]]);
      c.tint("#3a2c14", 0, 400);
    }, { music: "letters" });
    // prompt for cinema/m4_helm.png (panel.mjs): "a young man of 18 lifting off a black-and-purple great helm in lamp light, brown skin, his mother's face, tired eyes, a thyme box in the window, style B"
    await Cinema.panels([{ img: "assets/cinema/m4_helm.png", text: "The helm comes off in both hands. Under it a young man of eighteen, brown-skinned, tired, with her face.", pan: "inup" }], { music: "letters" });
    F.set("ch7.helm"); F.set("hero.unmasked"); M.syncHero();
    await UI.say([["imela", "There. ...Hm."], ["imela", "The old fox gave you the armour. Of course he did. They would have known my face in yours in any market."], ["hero", "He said it was for protection."], ["imela", "It was. From me, as it turns out."],
      ["narr", "She laughs, quietly, in a way that is not a laugh."], ["imela", "Hands. Show me. ...Calloused in the wrong places. We will fix that. Later. Sit."]]);
    await thought("(She smells of thyme. I had forgotten that I knew that.)");
    await UI.say([["imela", "There is a note on the table. It came with the bread. I have not opened it; I know the hand."]]);
    await M.noteScene(F);
    await UI.say([["imela", "He leaves the door open and counts how long you take to use it. Nineteen years, I have watched him do it. Get me my shawl, sparrow. It is on the nail."]]);
    F.give("imelaShawl", 1, true);
    F.questDone("m_rescue"); F.quest("m_sail", 0); F.save(true);
    UI.toast("Imela walks with you.", 3000);
  };
  M3.spot("palaceEastWing", "davichiNote", async F => {
    if (F.f("ch7.note")) { await UI.say([["narr", "The note is where it was. \"Use the door this time.\""]]); return; }
    await M.noteScene(F);
  }, "tg");
})();

// ---------- part 4: the roofs, the sacrifice, the hand-off to chapter 8, Story.begin/start/finish[7] ----------
(function () {
  const S = window.Story, D = window.Data, M = S.m4, M3 = S.m3, M2 = S.m2, T = M.T, say = M.say, thought = M.thought, stage = M.stage, once = M.once, cycle = M.cycle;
  const hub = M.hub;

  // ---------- 4.0 start: the voyage ----------
  S.begin[7] = async F => {
    G.ch = 7; F.set("ch7.start"); F.music("voyage");
    await Cinema.voyage({ from: "kharamOasis", to: "lowstep", text: "East, along the black coast, past Tzavan's lights.", mood: "night" });
    await Cinema.title("Chapter 7", "The Rescue");
    await F.banter("voyage2");
    F.music("capital"); F.save(true);
    F.go("lowstep", "from_sea");
  };
  S.start[7] = { region: "lowstep", entry: "from_sea" };

  // ---------- 4.E the roofs ----------
  S.done.roofRun = F => F.f("ch7.roofs");
  S.trigger.roofRun = async F => {
    if (!once(F, "ch7.roofs")) return;
    F.music("tension");
    await stage(async c => {
      const h = c.hero; c.tint("#4a2a10", 0.2, 300);
      M3.actors(c, [["im", "npcImela", -50, 10, { name: "Imela" }]]);
      await c.say([["narr", "Dawn over the Gilded Palace. Gold tile, chimneys, stairs that go nowhere, a rope bridge in the distance to the Lowstep wall. A bell begins to ring in the court below, and then a second, and then the whole palace."]]);
      c.sfx("encounter"); c.shake(2, 500); c.emote("im", "!");
      await c.say([["imela", "That is the north bell. They have found the Gaoler's keys on the floor. Which way, sparrow?"], ["hero", "The bridge."], ["imela", "Then walk like you mean it, and not like you are carrying me."]]);
      c.follow();
    }, { music: "tension" });
    await UI.say([["narr", "Boots on the tiles behind you. The patrols have seen the roofs."]]);
  };
  S.done.sacrificeGate = F => F.f("ch7.sacrifice");

  // the sacrifice: the player picks who stays. Systems.sacrifice removes the creature; it waits in G.sys.captive until chapter 9 (cell nine).
  M.sacrifice = async F => {
    const party = G.party.filter(u => !u.guest);
    F.music("sacrifice");
    await stage(async c => {
      const h = c.hero; c.tint("#3a1c0c", 0.25, 400);
      M3.actors(c, [["im", "npcImela", -40, 8, { name: "Imela" }]]);
      [[200, -30], [240, 10], [280, -10]].forEach(([dx, dy], i) => c.actor("gs" + i, { art: "npcLegionGuard", x: h.x + dx, y: h.y + dy, flip: true }));
      await c.say([["narr", "The last gate of the roofs is a slab of stone on a track, a shutter cut into the stair-head. It will come down if someone leans on it from this side. It will not hold if someone is not leaning."]]);
      c.shake(3, 600); c.sfx("hitHeavy"); c.fx("dust", h.x + 120, h.y + 10);
      await c.say([["imela", "The shutter will not hold alone."], ["narr", "Behind you the tiles are shaking under a run of boots. A horn. Another."]]);
      c.follow();
    }, { music: "sacrifice" });
    const i = await F.ask("The gate will not hold. Someone has to stay.", party.map(u => ({ label: u.name })), { top: "32%" });
    const u = party[Math.max(0, i)], mates = party.filter(x => x !== u), L = D.SACRIFICE[u.id] || D.SACRIFICE_FALLBACK;
    F.checkpoint();
    await stage(async c => {
      const h = c.hero; c.tint("#3a1c0c", 0.3, 300);
      M3.actors(c, [["im", "npcImela", -40, 8, { name: "Imela" }], ["st", u.id, 70, 4, { name: u.name, scale: 1.15 }]]);
      c.face("st", "left"); c.emote("st", "...");
      await c.say([[u.id, L.hero]]);
      await c.say([[u.id, L.mates]]);
      for (const m of mates) { const g = (D.SACRIFICE_GRIEF[m.id] && D.SACRIFICE_GRIEF[m.id][u.id]) || (D.SACRIFICE[m.id] || D.SACRIFICE_FALLBACK).grief; await c.say([[m.id, g]]); }
      await c.say([["hero", "(No. No, I can't. There is another way. There has to be.)"]]);
      c.sfx("hitHeavy"); c.shake(4, 700);
      await c.walk("st", h.x + 150, h.y + 4, 900); c.face("st", "right");
      c.fx("dust", h.x + 150, h.y + 10);
      await c.say([["narr", "It turns. It puts its shoulder to the shutter and plants its feet in the stair, and does not look back. The first of the guards reaches it and it does not move. The second reaches it."]]);
      c.shake(6, 900); c.flash("#ffe8c0", 300); c.sfx("break");
      await c.wait(500);
      await c.say([["hero", u.name.toUpperCase() + "!"]]);
      c.fx("explosion", h.x + 160, h.y, { scale: 0.7, shake: 2 }); c.sfx("door"); await c.wait(600);
      c.remove("st"); c.tint("#000000", 0.5, 600);
    }, { music: "sacrifice" });
    Systems.sacrifice(u.id);
    F.set("ch7.sacrifice"); G.flags["sacrifice.id"] = u.id; F.save(true);
    await UI.say([["narr", "The shutter comes down with a sound you feel in your teeth. Then it is quiet. You can hear a single chain, a long way off, going the other way."]]);
    UI.toast(u.name + " stayed behind.", 4000);
  };
  S.trigger.sacrificeGate = async F => {
    if (F.f("ch7.sacrifice")) return;
    if (!F.f("ch7.roofs")) { await UI.say([["narr", "The roofs are quiet. The gate waits at the far end."]]); return; }
    await M.sacrifice(F);
    await stage(async c => {
      const h = c.hero; c.tint("#2a1608", 0.2, 400);
      M3.actors(c, [["im", "npcImela", -30, 4, { name: "Imela" }]]);
      c.emote("im", "..."); await c.wait(500);
      await c.say([["imela", "Do not turn round. If you turn round you will go back."], ["hero", "(She has her hand on my arm. It is shaking. She is holding on very steadily.)"]]);
      await c.walk("im", h.x + 120, h.y + 6, 1800); await c.walkHero(h.x + 150, h.y + 6, 1800);
      await c.say([["narr", "The rope bridge sways over the street. Beneath it the washerwomen of Lowstep have hung red cloth from every line. The bell behind you stops."]]);
      c.tint("#2a1608", 0, 500); c.follow();
    });
    F.go("lowstep", "from_palaceRoofs");
  };

  // ---------- 4.F the dock, the Salt Heron, the hand-off ----------
  M.dockScene = async F => {
    if (F.f("ch7.done")) return;
    F.music("farewell");
    await stage(async c => {
      const h = c.hero; c.tint("#241c34", 0.22, 300);
      M3.actors(c, [["ranna", "npcRanna", 130, 2, { name: "Ranna", flip: true }], ["im", "npcImela", -36, 6, { name: "Imela" }]]);
      await c.say([["narr", "The dock stairs of Lowstep, in grey early light. Red cloth on every line. Ranna waits at the bottom step with her arms folded and a laundry basket at her feet, and she looks at you, and then past you."]]);
      c.emote("ranna", "?"); await c.wait(400);
      await c.say([["narr", "She counts. She does not say it. She puts one hand flat to her chest, and takes it away."]]);
      await c.say([["ranna", "The Salt Heron is two piers down. Your Captain has been asking for you every hour. And your mother has not stopped talking, in case you wondered."], ["imela", "I have said eleven words."], ["ranna", "Eleven is a lot, for you."]]);
      await c.say([["imela", "You folded my sheets corner to corner for a year and never once asked why they were different. Thank you, Ranna."], ["ranna", "...Go. Before I do something unprofessional."]]);
      c.remove("ranna"); c.remove("im");
    }, { music: "farewell" });
    await stage(async c => {
      const h = c.hero; c.tint("#10182c", 0.35, 600);
      M3.actors(c, [["br", "npcBrisk", 140, 0, { name: "Captain Brisk", flip: true }], ["im", "npcImela", -30, 8, { name: "Imela" }]]);
      await c.say([["narr", "The Salt Heron, with her lanterns shaded. The deck smells of tar and the sea."], ["captain", "Madam."], ["imela", "Captain. You are the one who does not sail through wars. Good. I am the one who has been in one for nineteen years."], ["captain", "...I like her, friend. I do not know if that is wise."]]);
      c.remove("br");
      await c.say([["narr", "Night on deck. The lamp swings. Imela sits on a coil of rope with your gauntlets in her lap, cleaning each finger with a rag and a little oil, and does not speak."]]);
      await c.wait(1400);
      await c.say([["hero", "I could not turn round."], ["imela", "No. That is why it worked."]]);
      c.remove("im"); c.tint("#10182c", 0, 600);
    }, { music: "farewell" });
    F.set("ch7.done"); F.questDone("m_sail"); G.lastTown = "lowstep"; F.save(true);
    if (S.begin[8]) await S.begin[8](F);
    else await UI.say([["narr", "The Salt Heron slips out between the lighthouses. To be continued in Chapter 8."]]);
  };

  // ---------- Story.finish[7] (dbg.jump: the end of chapter 7) ----------
  S.finish[7] = (F, G) => {
    ["ch7.start", "ch7.arrived", "ch7.briefed", "sw.seen", "sw.v1", "sw.v2", "sw.v3", "ch7.sewers", "crt.seen", "ch7.s10", "ch7.garden", "ch7.messenger", "ch7.s11", "ch7.s12", "ch7.helm", "ch7.note", "ch7.shrine", "ch7.courtKey", "ch7.thyme", "ch7.watch",
      "ch7.roofs", "ch7.sacrifice", "ch7.done", "hero.unmasked", "ch8.start", "gen.freed.10", "gen.freed.11", "gen.freed.12"].forEach(k => (G.flags[k] = true));
    ["m_rescue", "m_sail"].forEach(q => (G.quests[q] = "done"));
    [10, 11, 12].forEach(n => { const g = S.generalFor(n); if (g) S.noteGeneral(g.id, ["Freed at the Palace Court gate. It ran for the lowest gate, and the lowest gate let it through.", "Freed in the Palace Garden. It went up through the glass roof, and every caged bird sang.", "Freed in the East Wing. It went out by the laundry court, the way the washing goes."][n - 10]); });
    G.items.davichiNote = 1; G.items.imelaShawl = 1; G.items.lowstepToken = 1; F.giveGear("G43", 3, true); G.gold += 1500;
    const pr = G.party.filter(u => !u.guest); if (!(G.sys && G.sys.captive) && pr.length > 2 && window.Systems) { G.flags["sacrifice.id"] = pr[2].id; Systems.sacrifice(pr[2].id); }
    G.flags["wagon.at"] = "haldarsReach"; G.lastTown = "lowstep"; G.ch = 7;
    M.syncHero();
  };
})();

// ---------- skill book (SKILLBOOK agent 2026-10-31): Gilt Shield (Gilt Flake, Palace Garden) ----------
(function () {
  const S = window.Story, D = window.Data, M2 = S.m2, add = (id, ...drops) => { D.DROPS[id] = (D.DROPS[id] || []).concat(drops); };
  Object.assign(D.MATS, { giltFlake: ["Gilt Flake", "Gold leaf peeled off a palace screen, thin enough to read a letter through."] });
  Object.assign(D.BOOK, { giltShield: { n: "Gilt Shield", mat: "giltFlake", need: 10, d: "2 MP. A shield worth 18% of the ally's max HP for 2 turns.", move: "giltShield" } });
  add("eagleCohortArcher", ["giltFlake", 0.3]); add("templeHound", ["giltFlake", 0.25]);
  M2.bookSpot("palaceGarden", "giltFlake1", "A flaking gilded trellis", "g.gilt1", "giltFlake", 5, "The trellis at the end of the path is gilded, and the gilding is coming away in curls. A gardener's bucket stands under it, half full of the stuff, swept up and never collected. Five flakes of gold leaf.", "Gilt Shield");
  M2.bookSpot("palaceGarden", "giltFlake2", "Gold leaf under a screen", "g.gilt2", "giltFlake", 5, "A garden screen, gold on both faces, shedding leaf like a tree in autumn. Imperial gold, wasted on a hedge. Five more flakes.", "Gilt Shield");
})();
