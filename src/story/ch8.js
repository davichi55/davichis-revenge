// Chapter 8 script, Striking Back: Pale Gate, the Tzavan coast, the Red Salt Flats, Weir and Mines, the Orchard Hills, Tuk Orchard, the Sunmaw pyramid, the Governor's Villa, the Veiled Cistern (K6),
// the guest (Emberwick), the Ninth Legion (L6), the Iron Cup (owner: STORY-M4). Helpers shared with chapters 7 and 9 live in window.Story.m4 (ch7.js). Spec: ../game-mechanics/specs/M4.md.
// Parts: 1 data, regions; 2 Pale Gate, the guest, the operations board; 3 coast, flats, weir, mines (operation 1); 4 orchard, Tuk, Sunmaw, villa (operations 2 and 3); 5 the cistern, wagon, L6, the Iron Cup, finish.
"use strict";
(function () {
  const S = window.Story, D = window.Data, Q = Object.assign, M2 = S.m2, M3 = S.m3, M = S.m4, T = M.T;
  const say = M.say, thought = M.thought;
  S.begin = S.begin || {}; S.legend = S.legend || {}; S.done = S.done || {};
  M3.people([["fighter", "Young fighter", "h"], ["orchardhand", "Orchard hand", "m"], ["oldwoman", "Old woman", "i"], ["farmer", "Farmer", "m"], ["miner", "Miner", "m"], ["clerk", "Clerk", "s"]]);

  // ---------- items, goods, materials ----------
  Q(D.GOODS, {
    centurionCrest: ["Centurion's Crest", 56], knifeObsidian: ["Cultist's Obsidian Knife", 54], saltGargoyleShard: ["Salt Gargoyle Shard", 50], cacaoPod: ["Satyr's Cacao Pod", 44], houndChain: ["Overseer's Chain-Link", 40],
    glassShard: ["Green Glass Shard", 52], mirrorSliver: ["Mirror Sliver", 56], statueEye: ["Statue's Stone Eye", 58], harpyBrine: ["Brine-Crusted Quill", 46],
  });
  Q(D.QUESTS, {
    m_pale: { t: "Pale Gate", main: true, ch: 8, steps: ["Reach Pale Gate, the resistance's forward post at the southern end of the Royal Road."] },
    m_ops: { t: "Operations", main: true, ch: 8, steps: ["Strike the empire in three places: cut the salt road on the Tzavan coast, break the altar at the Sunmaw pyramid, and take the ledgers from the Governor's Villa."] },
    m_prison: { t: "The Black Mirror", main: true, ch: 8, steps: ["The Villa's ledgers say it: cell nine of the Black Mirror holds one creature, to be kept alive. Find the prison."] },
    salt: { t: "The Salt Road", ch: 8, steps: ["Break the tollbooth on the Tzavan coast, cut three convoys on the Royal Road, and free the Red Salt Mines (0/3 convoys)."] },
    m_k6: { t: "The Veiled Cistern", ch: 8, steps: ["A cage in the Menagerie Wagon wants a glass key. The Veiled Cistern lies under the ruined village in the south-east corner of the Tzavan Coast clifftop."] },
    cistern: { t: "Statues in the Glass", ch: 8, steps: ["Turn the mirror stands so a beam of light crosses the cistern onto the sealed door. Keep out of the statues' gaze."] },
    granary: { t: "The Hidden Granary", ch: 8, steps: ["Widow Tuk's husband hid a granary from the overseers. She does not remember where.", "The pressman says it is behind a stone arch grown over with vines, in the far south-east corner of the Orchard Hills."] },
    bounty4: { t: "Bounty: Gargoyle Shards", ch: 8, steps: ["The quartermaster at Pale Gate wants five Salt Gargoyle shards, shed by the gargoyles on the Red Salt Flats (0/5)."] },
    bounty5: { t: "Bounty: A Chained Gang", ch: 8, steps: ["Free one of the chained gangs in the Red Salt Mines. The quartermaster pays on word."] },
    bounty6: { t: "Bounty: Overseer's Hounds", ch: 8, steps: ["Three Overseer's Hounds off the Royal Road (0/3). Report to the quartermaster."] },
  });

  // ---------- inns, shops ----------
  const BAS = M.BAS, CURES = M.CURES, BOMBS = M.BOMBS, WARDS = M.WARDS, disc = M.disc;
  const RES = BAS.concat(CURES, ["tonic", "ember", "incense", "candle"], BOMBS, WARDS), IMP = RES;
  Q(D.INNS, { paleGate: { n: "The Gate Bunk", mult: 0.5 }, redSaltWeir: { n: "The Crust House", mult: 1.5 }, tukOrchard: { n: "The Green Husk", mult: 1.5 } });
  Q(D.SHOPS, {
    pale: { n: "Pale Gate stores", who: "merchant", stock: RES, disc: disc(RES, 0.9), buys: 1.0 },
    weir: { n: "Red Salt Weir stalls", who: "merchant", stock: IMP, disc: disc(IMP, 1.2), buys: 0.8 },
    tuk: { n: "Tuk Orchard press-shop", who: "merchant", stock: IMP, disc: disc(IMP, 1.2), buys: 0.8 },
  });
  M3.rumours("paleGate", ["Supply carts run the Royal Road every third day with an escort of six. The sixth is always asleep.", "A pyramid that loses its altar stops harvesting for a season. The cultists at Sunmaw have heard the rumour and do not like it.",
    "Someone has been singing in the Black Mirror since the night of the palace. The guards say it is a prisoner. The prisoners say it is not."], [M3.clue(13, 0)]);
  M3.rumours("redSaltWeir", ["The Root Gnawer chews through the deep roots. Wherever it passes, the ground shakes. It hides inside the roots, and fire is the only thing it fears.", "The Ninth Legion was lost in the salt marsh. A flag still walks there.",
    "Ember slag from the desert burns the roots. Take some with you."]);
  M3.rumours("tukOrchard", ["The governor keeps a regalia he never wears.", "The pyramid at Sunmaw has a back door the cultists use.", "The collar on the general there is cracked."], [M3.clue(14, 0), M3.clue(15, 0)]);
  M3.onRumour["tukOrchard:1"] = async F => { F.set("tuk.rumour2"); };
  M3.onRumour["redSaltWeir:0"] = async F => { F.set("t6.known"); };

  // ---------- bestiary, drops, breaks ----------
  Q(D.BEST, {
    legionCenturion: "A crested officer. He orders one turn at a time: shields up, or charge. Take him down early and the line goes slack.",
    supplyConvoyGuard: "Loaded with crates and slow because of it. Fire gets into the cargo. What falls off the wagon is worth taking.",
    sunmawCultist: "A priest with an obsidian knife. His cuts bleed, and he feeds on the fallen. Cold slows the knife-hand.",
    saltGargoyle: "A salt-crusted stone gargoyle on wings that do not fly. Blows slide off. Water eats the crust.",
    orchardSatyr: "A cacao-stained satyr with pipes. The tune sends one of you to sleep. Fire frightens it.",
    overseersHound: "A lean hound on a chain that ended somewhere. Fast, and it drags the weakest down. Cold slows it.",
    gazeStatue: "A person turned to stone mid-step, who wakes when you stand in front of it. It slams. Impact breaks it.",
    mirrorShade: "A reflection that has stopped following. It throws your last move back at you. Light hurts it; nothing else does much.",
    glassSerpent: "A serpent of green glass, thin as a ribbon in the shaft of light. Impact shatters it.",
    veiledCisternGuardian: "A veil hangs in the cistern's middle. Behind it, a head turns. Two reactions in a row make the glass shiver.",
    ghostOfTheNinthLegion: "A legion of mist with no faces, under a banner nobody carries. Light does what steel cannot.",
    spearTwinA: "One of the Spear Twins. When Ahiq lunges, so does Bahiq. Heavy blows in a row break the pair.", spearTwinB: "One of the Spear Twins. When Bahiq lunges, so does Ahiq. Heavy blows in a row break the pair.",
  });
  Q(D.DROPS, {
    legionCenturion: [["centurionCrest", 0.4], ["legionCoin", 0.8]], supplyConvoyGuard: [["legionCoin", 0.5]], sunmawCultist: [["knifeObsidian", 0.4]], saltGargoyle: [["saltGargoyleShard", 0.6]], orchardSatyr: [["cacaoPod", 0.45]],
    overseersHound: [["houndChain", 0.45]], gazeStatue: [["statueEye", 0.4]], mirrorShade: [["mirrorSliver", 0.45]], glassSerpent: [["glassShard", 0.45]], saltHarpy: [["harpyBrine", 0.4], ["saltCrust", 0.4]],
  });
  Q(D.BREAKS, {
    veiledCisternGuardian: "Two different elements on it in a row. The glass shivers when the lights argue.", ghostOfTheNinthLegion: "Two strong light moves in a row. A dead legion cannot hold its line in the sun.",
    spearTwinA: "Two heavy impact blows in a row break the pair.", spearTwinB: "Two heavy impact blows in a row break the pair.", vaulthorn: "Two heavy impact blows in a row. The silver plate is only as strong as the bull under it.",
  });
  Q(D.LEGENDS.L6, { level: 46 });

  // ---------- regions ----------
  const yes = () => true, RG = M3.region;
  RG("paleGate", { n: "Pale Gate", bg: "bg_ruins", arena: "harbourCoast", music: "rebelCamp", town: "paleGate", inn: "paleGate", autos: ["paleArrive", "emberwickJoins", "paleReturn"],
    npcs: [["innkeeper", "The Gate Bunk"], ["merchant", "Pale Gate stores"], ["imela", "Imela, at the war table"], ["kessa", "Kessa Vorn", s => s.f["ch8.guest"]], ["dorrin", "Dorrin Hale", s => s.f["ch8.guest"]], ["mayle", "Mayle Tarn", s => s.f["ch8.guest"]],
      ["scout", "Ranna's scout"], ["quartermaster", "The quartermaster, at the bounty board"], ["r1", "A young fighter"], ["r2", "A sentry"], ["r3", "A cook"]],
    exits: [["tzavanCoast", "The north road along the cliffs", s => s.f["ch8.guest"]], ["weepingSea", "The small dock", s => s.f["ch8.done"]]],
    things: [["opsBoard", "The war table", s => s.f["ch8.arrived"], "trigger"]] });
  RG("tzavanCoast", { n: "Tzavan Coast", bg: "bg_ruins", arena: "harbourCoast", music: "provinces", table: "coast", fields: true, overland: true, autos: ["coastEnter"],
    exits: [["paleGate", "South to Pale Gate", yes], ["saltFlats", "West onto the Red Salt Flats", yes], ["orchardHills", "East into the Orchard Hills", s => s.f["ch8.s13"]], ["veiledCistern", "The ruined clifftop village", yes], ["tzavan", "North to Tzavan", s => s.f["ch8.s13"]]],
    things: [["tollS13", "The tollbooth at the centre of the road", s => !s.f["ch8.s13"], "trigger"], ["coastChest1", "A chest in a signal tower", s => !s.f["c.coast1"], "chest"], ["coastChest2", "A chest under a ruined tollbooth", s => !s.f["c.coast2"], "chest"],
      ["coastConvoy", "A slow wagon on the road", s => (G.flags["ch8.supply"] || 0) < 3, "trigger"]] });
  RG("saltFlats", { n: "The Red Salt Flats", bg: "bg_ruins", arena: "saltFlats", music: "provinces", table: "saltFlats", fields: true, overland: true,
    npcs: [["ninthBanner", "A banner that walks", s => !s.f["l6.done"]]], exits: [["tzavanCoast", "East to the coast road", yes], ["redSaltWeir", "West to Red Salt Weir", yes]],
    things: [["flatsCache", "The Ninth Legion's supply chest", s => s.f["l6.done"] || s.f["ninth.cairn"], "chest"], ["ninthCairn", "A legion cairn", s => !s.f["ninth.cairn"], "gather"]] });
  RG("redSaltWeir", { n: "Red Salt Weir", bg: "bg_ruins", arena: "saltMine", music: "provinces", town: "redSaltWeir", inn: "redSaltWeir",
    npcs: [["innkeeper", "The Crust House"], ["merchant", "Weir stalls"], ["foremanSalt", "Overseer Hask"], ["workerLeader", "A miner, scrubbing a pan"], ["r1", "A pan-worker"], ["r2", "An old woman"], ["r3", "A child"], ["child", "A child on the barrel"]],
    exits: [["saltFlats", "East onto the flats", yes], ["redSaltMines", "The mine head", yes]], things: [] });
  RG("redSaltMines", { n: "The Red Salt Mines", bg: "bg_ruins", arena: "saltMine", music: "mines", table: "saltMine", fields: true, dungeon: true,
    npcs: [["gang1", "A chained gang and their overseer", s => !s.f["salt.gang1"]], ["gang2", "A second gang at the brine channel", s => !s.f["salt.gang2"]], ["gang3", "A third gang by the rails", s => !s.f["salt.gang3"]]],
    exits: [["redSaltWeir", "Back up to the mine head", yes]], things: [["barges", "The salt barges at the dock", s => s.f["salt.gang1"] && s.f["salt.gang2"] && s.f["salt.gang3"] && !s.f["ch8.mines"], "trigger"], ["mineChest", "A foreman's chest", s => !s.f["c.mine"], "chest"]] });
  RG("orchardHills", { n: "The Orchard Hills", bg: "bg_ruins", arena: "orchard", music: "provinces", table: "orchard", fields: true, overland: true,
    exits: [["tzavanCoast", "West to the coast road", yes], ["tukOrchard", "To Tuk Orchard", yes], ["sunmawPyramid", "The front stair of the Sunmaw pyramid", yes], ["governorsVilla", "Up to the Governor's Villa", yes]],
    things: [["granaryDoor", "A wall of vines", s => s.q.granary === 1, "gather"]] });
  RG("tukOrchard", { n: "Tuk Orchard", bg: "bg_ruins", arena: "orchard", music: "orchardTown", town: "tukOrchard", inn: "tukOrchard",
    npcs: [["innkeeper", "The Green Husk"], ["merchant", "The press-shop"], ["widow", "Widow Tuk"], ["pressman", "The pressman"], ["r1", "An orchard hand"], ["r2", "A farmer"], ["r3", "A child"]],
    exits: [["orchardHills", "Back to the orchard hills", yes]], things: [] });
  RG("sunmawPyramid", { n: "Sunmaw Harvesting Pyramid", bg: "bg_ruins", arena: "pyramid", music: "pyramid", table: "sunmaw", fields: true, dungeon: true,
    exits: [["orchardHills", "Down to the orchard hills", yes]], things: [["s14Fight", "The collar altar on the summit", s => !s.f["ch8.s14"], "trigger"], ["g13_bloodlettersAltar", "A chest behind the altar", s => s.f["ch8.s14"], "chest"]] });
  RG("governorsVilla", { n: "The Governor's Villa", bg: "bg_ruins", arena: "villa", music: "provinces", table: "villa", fields: true, dungeon: true,
    npcs: [["cook", "The Governor's cook, at the kitchen door"]], exits: [["orchardHills", "Out by the kitchen gate", yes]],
    things: [["ledgerLibrary", "The library, with its ledgers", s => s.f["vil.cook"] && !s.f["vil.ledger"], "gather"], ["s15Fight", "The strongroom", s => s.f["vil.cook"] && !s.f["ch8.s15"], "trigger"], ["villaChest", "The regalia chest", s => s.f["ch8.s15"] && !s.f["c.villa"], "chest"]] });
  RG("veiledCistern", { n: "The Veiled Cistern", bg: "bg_ruins", arena: "glassCistern", music: "crypt", table: "veiledCistern", fields: true, dungeon: true, autos: ["cisternEnter"],
    exits: [["tzavanCoast", "Back up to the clifftop", yes]],
    things: [["mirror1", "The first mirror stand", s => !s.f["cis.solved"], "trigger"], ["mirror2", "The second mirror stand", s => !s.f["cis.solved"], "trigger"], ["mirror3", "The third mirror stand", s => !s.f["cis.solved"], "trigger"], ["mirror4", "The fourth mirror stand", s => !s.f["cis.solved"], "trigger"],
      ["cisternGuardian", "The sealed door and the veil behind it", s => s.f["cis.solved"] && !s.f["k6.done"], "trigger"], ["g30_serpentHairedVeil", "A chest at the foot of the dais", s => s.f["k6.done"], "chest"]] });
})();

// ---------- part 2: the voyage, Pale Gate, the guest, the operations board, bounties ----------
(function () {
  const S = window.Story, D = window.Data, Q = Object.assign, M2 = S.m2, M3 = S.m3, M = S.m4, T = M.T, say = M.say, thought = M.thought, stage = M.stage, once = M.once, cycle = M.cycle;
  const hub = M.hub, m8 = () => M3.m(8);

  S.begin[8] = async F => {
    G.ch = 8; F.set("ch8.start"); F.music("voyage");
    await Cinema.voyage({ from: "lowstep", to: "paleGate", text: "South along the coast, with the Royal Road's lamps on the cliffs.", mood: "night" });
    await Cinema.title("Chapter 8", "Striking Back");
    await F.banter("voyage3");
    F.quest("m_pale", 0); F.music("rebelCamp"); F.save(true);
    F.go("paleGate", "from_sea");
  };
  S.start[8] = { region: "paleGate", entry: "from_sea" };

  // ---------- operations bookkeeping ----------
  M.supply = () => G.flags["ch8.supply"] || 0;
  M.ops = F => ({ salt: !!(F.f("ch8.s13") && M.supply() >= 3 && F.f("ch8.mines")), sun: F.f("ch8.s14"), villa: F.f("ch8.s15") });
  M.convoyCut = F => {
    const n = M.supply(); if (n >= 3) return;
    G.flags["ch8.supply"] = n + 1; F.give("sunwater", 2, true); F.give("legionCoin", 1, true);
    UI.toast(n + 1 >= 3 ? "The salt road is cut. Patrols thin on the sea and the road." : `Convoy cut (${n + 1} of 3). Two Sunwater Flasks from the wagon.`, 3200);
  };
  (function () {      // a won fight against convoy guards on the Royal Road cuts a convoy
    const fight = Flow.fight;
    Flow.fight = async function (foes) {
      const res = await fight.apply(this, arguments);
      try { if (res === "win" && foes && foes.some(e => e.id === "supplyConvoyGuard") && ["tzavanCoast", "saltFlats", "orchardHills", "redSaltMines"].includes(G.region)) { M.convoyCut(Flow); if (!G.flags["bn.convoy"]) { G.flags["bn.convoy"] = true; await Flow.banter("convoy"); } } } catch (e) { console.warn("convoy", e); }
      return res;
    };
  })();
  S.trigger.coastConvoy = async F => {
    if (M.supply() >= 3) { await UI.say([["narr", "The road is empty of wagons. The ruts are already filling with dust."]]); return; }
    await UI.say([["narr", "A wagon train crawls along the cliff road under a sun-wheel banner, six guards walking beside it. The sixth is asleep on his feet."]]);
    const foes = F.rollEncounter("convoy"); if (foes) await F.fight(foes, { bg: "harbourCoast", intro: "You hit the convoy!" });
  };

  // ---------- 6.A Pale Gate ----------
  S.trigger.paleArrive = async F => {
    if (!once(F, "ch8.arrived")) return;
    if (G.ch < 8) G.ch = 8; F.music("rebelCamp");
    await stage(async c => {
      c.tint("#30203a", 0.18, 300);
      M3.actors(c, [["im", "npcImela", 140, -6, { name: "Imela" }], ["f1", "npcResistFighter", 40, -70, {}], ["f2", "npcResistFighter", 250, -60, { flip: true }]]);
      await c.say([["narr", "Pale Gate at dusk: limewashed walls the colour of bone, a lantern over the gate, young fighters on the wall with their feet dangling. Tents inside. A war table under an awning, and a woman in a plain dark shawl standing at it with a cup of tea, as if she had always stood there."]]);
      await c.walk("im", c.hero.x + 60, c.hero.y - 4, 600);
      await c.say([["imela", "You hit three kinds of thing. Supply roads, because armies eat. Altars, because the Throne spends its strength on collars. And the places the governors keep their ledgers, because the Throne does not like to be read."],
        ["hero", "You know the empire."], ["imela", "I know its kitchens. They are the same thing."]]);
      c.remove("im"); c.remove("f1"); c.remove("f2"); c.tint("#30203a", 0, 400); c.follow();
    }, { music: "rebelCamp" });
    F.questDone("m_pale"); F.quest("m_ops", 0);
  };
  S.done.paleArrive = F => F.f("ch8.arrived");

  S.trigger.emberwickJoins = async F => {
    if (!F.f("ch8.arrived") || F.f("ch8.guest")) return;
    await stage(async c => {
      const h = c.hero; c.tint("#2a1c2c", 0.15, 300);
      M3.actors(c, [["ke", "npcKessa", 220, 0, { name: "Kessa", flip: true }], ["dor", "npcDorrin", 270, -30, { flip: true }], ["may", "npcMayle", 250, 40, { flip: true }], ["em", "emberwick", 180, 18, { name: "Emberwick", flip: true }]]);
      await c.say([["narr", "Four figures come up the cliff road at lantern-time: a girl with a red scarf, a huge young man eating an apple, a thin one with a little book, and, a step behind them, a lion cub with a mane of candle-flame."]]);
      c.walk("ke", h.x + 70, h.y, 1300); c.walk("dor", h.x + 120, h.y - 30, 1400); c.walk("may", h.x + 100, h.y + 40, 1400); await c.walk("em", h.x + 40, h.y + 22, 1300);
      await c.say([["kessa", "Don't. I know what I look like."], ["hero", "(Kessa Vorn. Last I saw her she was reading a list with her own village on it.)"],
        ["kessa", "Saffa sent me. I am a scout. This one is a loan."], ["emberwick", "Warm. I am warm. That is my whole trick."], ["kessa", "It is a good trick. You have a hole in your team. It will do."]]);
      c.emote("ke", "anger"); await c.wait(300);
      await c.say([["hero", "Kessa-"], ["kessa", "Not now. Say it when it is over and I will pretend I did not hear."], ["dorrin", "Boss says I am not allowed to give you the apple. So, no. Also, hello."],
        ["mayle", "I counted nine sentries on the cliff road. One of them is a goat. It is on page forty."]]);
      c.remove("ke"); c.remove("dor"); c.remove("may");
      await c.say([["emberwick", "I will try not to be in the way. I will try to be in the middle. Is the middle good?"]]);
      c.remove("em"); c.tint("#2a1c2c", 0, 400); c.follow();
    }, { music: "rebelCamp" });
    Systems.guestJoin("emberwick", { level: F.avgLevel(), name: "Emberwick" }); F.set("ch8.guest");
    UI.toast("Emberwick joins the team.", 3200);
    await F.banter("guest");
  };
  S.done.emberwickJoins = F => F.f("ch8.guest");

  // ---------- the return scenes after each operation, Imela's night talk, the end of the chapter ----------
  const marks = {
    salt: ["rm.salt", "Imela pins a red thread across the coast road on the map and pulls it tight.", "They will move the guard to the coast. Good. A guard on the coast is a guard not at an altar.", "The clerk in Tzavan says the granaries are an audit."],
    sun: ["rm.sun", "Imela moves a black pin from the Sunmaw ridge to the edge of the map.", "A pyramid that loses its altar stops harvesting for a season. They will say it was the weather. They always say it was the weather.", null],
    villa: ["rm.villa", "Imela turns the Governor's ledgers over one page at a time, with one finger.", "Thirty years of lots in a clerk's neat hand. They always write it down. It is the one thing about them I have never understood, and the one I rely on.", null],
  };
  M.returnScene = async (F, k) => {
    const [flag, narr, line, extra] = marks[k]; F.set(flag);
    await stage(async c => {
      M3.actors(c, [["im", "npcImela", 60, -6, { name: "Imela" }]]);
      await c.say([["narr", narr], ["imela", line]]);
      if (extra) await c.say([["scout", "Tzavan's granaries are emptying. The clerk calls it an audit."], ["imela", "It is not an audit."]]);
      c.remove("im"); c.follow();
    }, { music: "rebelCamp" });
    if (k === "salt") F.questDone("salt");
  };
  M.nightTalk = async F => {
    F.set("ch8.night"); F.music("hope");
    await M.nightfall(F);
    await stage(async c => {
      M3.actors(c, [["im", "npcImela", 60, 6, { name: "Imela" }]]); c.tint("#201028", 0.3, 400);
      await c.say([["narr", "A fire on the sea wall. The tide coming in under it with a sound like someone folding sheets. Imela sits with her back against the stone and her shawl over her knees, and does not look up."],
        ["imela", "Your father had a mark on his wrist, a feather inside a star."], ["hero", "I have seen it. On the strap. On a blanket."]]);
      if (F.f("ch7.shrine")) await c.say([["hero", "And in the garden. Cut into a wall, with some words. Backwards."], ["imela", "...Backwards. Of course it was."], ["narr", "She is quiet a while. The fire shifts."]]);
      await c.say([["imela", "He said his order kept the star-watch from a tower that fell a hundred years ago. He said the count was short. I thought it was a lover's talk."], ["hero", "Is he alive?"], ["imela", "I stopped counting at nine years. Then I started again."]]);
      c.remove("im"); c.tint("#201028", 0, 700); c.follow();
    }, { music: "hope" });
    if (!F.item("starwardenMark")) F.give("starwardenMark", 1, true); F.set("lore.starwarden");
    UI.toast("Journal: the Feather-in-Star mark.", 3200);
  };
  M.finishOps = async F => {
    F.set("ch8.done"); F.questDone("m_ops"); F.set("ch8.s15");
    await stage(async c => {
      M3.actors(c, [["sc", "npcScout", 120, 0, { name: "Scout", flip: true }], ["im", "npcImela", -30, 6, { name: "Imela" }]]);
      c.tint("#241a30", 0.2, 300);
      await c.walk("sc", c.hero.x + 60, c.hero.y, 900); c.emote("sc", "!");
      await c.say([["scout", "From Ranna, by three hands and a fishing boat. The emperor has not come back. He stands at the edge of Rootdeep every dawn. Nobody has seen him eat."],
        ["imela", "Then the Gnawer has his whole attention. Good. Go and get her back."], ["hero", "Her?"], ["imela", "The one who stayed. I am not stupid, sparrow. I counted the gate."]]);
      c.remove("sc"); c.emote("im", "..."); await c.wait(600);
      await c.say([["imela", "I will not pretend I am comfortable with you walking into the Black Mirror. I will tell you I am proud, and you will not like it."], ["hero", "I don't."], ["imela", "Good. That is how I know it is true."]]);
      c.remove("im"); c.tint("#241a30", 0, 400); c.follow();
    }, { music: "hope" });
    F.save(true);
    await M.sailOffer(F);
  };
  M.sailOffer = async F => {
    const i = await F.ask("The harbour at Pale Gate is open. Sail north to the Rootdeep coast?", [{ label: "Sail" }, { label: "Not yet" }], { top: "40%" });
    if (i !== 0) { await say("imela", "The wagon, the arena, the cistern. Everything that is still here will still be here. Eat first."); return; }
    await S.begin[9](F);
  };
  S.trigger.paleReturn = async F => {
    if (!F.f("ch8.arrived") || !F.f("ch8.guest")) return;
    const o = M.ops(F);
    if (o.salt && !F.f("rm.salt")) await M.returnScene(F, "salt");
    if (o.sun && !F.f("rm.sun")) await M.returnScene(F, "sun");
    if (o.villa && !F.f("rm.villa")) await M.returnScene(F, "villa");
    if (!F.f("ch8.night") && (F.f("rm.salt") || F.f("rm.sun") || F.f("rm.villa"))) await M.nightTalk(F);
    if (o.salt && o.sun && o.villa && !F.f("ch8.done")) await M.finishOps(F);
  };
  S.done.paleReturn = F => true;

  S.trigger.opsBoard = async F => {
    if (!F.f("ch8.arrived")) return;
    if (F.f("ch8.done")) { await say("imela", cycle("ob8", ["The table is clean. Whenever you are ready."])); await M.sailOffer(F); return; }
    const o = M.ops(F), n = M.supply();
    await UI.say([["narr", "The war table: a map of the Royal Road drawn on four tablecloths, with pins, red thread, and a cup of tea set on the Tzavan coast to keep the corner down."],
      ["imela", `Roads: the tollbooth ${F.f("ch8.s13") ? "is broken" : "still stands"}, ${n} of 3 convoys cut, the mines ${F.f("ch8.mines") ? "are ours" : "are still theirs"}. The altar at Sunmaw ${F.f("ch8.s14") ? "is cold" : "is still warm"}. The Governor's ledgers ${F.f("ch8.s15") ? "are on this table" : "are still in his library"}.`],
      ["imela", cycle("ob8.b", ["Do them in any order. The Throne reads in one.", "Hit the road first and they will thin their guard everywhere else. That is what an army does when it is hungry.", "Do not look at the map so long. It does not change when you do."])]]);
  };

  // ---------- Pale Gate: the town's talkers ----------
  M3.talkTown("paleGate", { innLine: "The Gate Bunk. Wooden bunks, hot barley, and a sentry who will wake you before the bell.", inn: "paleGate", shopLine: "Whatever the road delivers. Today the road delivered wards. Do not ask where.", shop: "pale", who: ["fighter", "fighter", "fighter"],
    small: [["Do not stand under the awning at noon. The old women of the quarter throw bones at it.", "I was a baker. Now I carry a spear on the wall. The spear is easier."], ["The Throne's soldiers sleep on the coast road with their boots on. I do not understand boots. Mine are in the tent."], ["Imela makes the tea. She does not drink it. She holds the cup.", "My brother is in Tzavan. He fights in the arena. He does not know I am here."]] });
  T("paleGate").imela = async F => {
    const o = M.ops(F);
    if (F.f("ch8.done")) { await say("imela", cycle("im8d", ["Go. I will be here when you come back. I have been here for nineteen years; I do not mind a few more days.", "Eat something first."])); await M.sailOffer(F); return; }
    if (!F.f("ch8.guest")) { await say("imela", "You have a visitor coming up the road. I recognise the walk. She has her mother's chin and none of her patience."); return; }
    await say("imela", cycle("im8", ["The road first, if you want to see the army change its shape.", "The ledgers are the sharpest knife and the slowest. The Governor has been writing for thirty years. He will not have stopped.", "Eat. You are not thin; you are bored. There is a difference.", "Sit with me a moment. I need to watch someone's hands doing nothing."]));
    if (o.salt && o.sun && o.villa) return;
  };
  T("paleGate").kessa = async F => {
    await say("kessa", cycle("ks8", ["Don't thank me. I will lose my place in the argument.", "It is a loan. A loan has a return date.", "Say the thing you want to say. No? Then do not look like that.", "Emberwick likes you. It is annoying."]));
  };
  T("paleGate").dorrin = async F => { await say("dorrin", cycle("dr8", ["Boss says no apple. I say the apple is a metaphor. Boss says metaphors have seeds.", "I have eaten every kind of bread on this coast. The pale ones are the best. Do not tell the dark ones.", "Hello. Still hello."])); };
  T("paleGate").mayle = async F => { await say("mayle", cycle("my8", ["Page forty-one. Nine hundred crates went north. Eight hundred and ninety arrived. Where do the ten go?", "I have drawn your route twice. The second time I added the goat.", "The tollbooth has a weak beam. Impact, and a second impact, and it comes down. I did not ask the beam."])); };
  T("paleGate").scout = async F => {
    await say("scout", cycle("sc8", ["Ranna sends her regards and a message that says: eat. I think it is for your mother.", "The red cloth is down in Lowstep. Nobody has hung it since you left.", "Tzavan is loud this week. Somebody is winning in the arena. Somebody always is."]));
  };

  // ---------- the bounty board (shared with chapter 9) ----------
  // spec[id] = { give, ready(F), left(F), pay: text, reward(F), take(F) } ; the keeper offers open bounties, pays finished ones
  M.board = async (F, who, ids, spec, intro) => {
    for (const id of ids) {
      if (F.qstep(id) !== undefined && F.qstep(id) !== "done" && spec[id].ready(F)) {
        spec[id].take && spec[id].take(F);
        const g = Math.round(spec[id].gold * m8()); F.gold(g); F.questDone(id); F.sfx("coin");
        await UI.say([[who, spec[id].pay]]); return;
      }
    }
    const open = ids.filter(id => F.qstep(id) === undefined), act = ids.filter(id => F.qstep(id) !== undefined && F.qstep(id) !== "done");
    if (!open.length && !act.length) { await say(who, "Nothing left on the board. Come back after the next convoy."); return; }
    if (act.length) await say(who, spec[act[0]].left(F));
    if (!open.length) return;
    const i = await F.ask(intro, open.map(id => ({ label: D.QUESTS[id].t.replace(/^Bounty: /, "") })).concat([{ label: "Not now" }]), { top: "34%" });
    if (i >= 0 && i < open.length) { const id = open[i]; await say(who, spec[id].give); spec[id].start && spec[id].start(F); F.quest(id, 0); }
  };
  const BQ = {
    bounty4: { give: "Five Salt Gargoyle shards. The gargoyles on the flats shed them when you break the crust. The Weir assayer pays by the shard and so do I.", ready: F => (G.goods.saltGargoyleShard || 0) >= 5, left: F => `Shards: ${Math.min(5, G.goods.saltGargoyleShard || 0)} of 5. The flats are full of them.`,
      take: F => { G.goods.saltGargoyleShard -= 5; }, gold: 3, pay: "Five clean shards. The assayer will cry. Here is your coin." },
    bounty5: { give: "A chained gang in the Red Salt Mines. Free any one and tell me. The overseers keep a count, and I like it when the count is wrong.", ready: F => F.f("salt.gang1") || F.f("salt.gang2") || F.f("salt.gang3"), left: F => "The mines. A chained gang, one of three. Free it and come back.", gold: 3, pay: "A gang loose, and their overseer's tally-stick broken. That is worth a purse." },
    bounty6: { give: "Three Overseer's Hounds off the Royal Road. They are thin and fast and they drag the slowest down. Cold slows them.", start: F => { G.flags["b6.base"] = G.kills.overseersHound || 0; },
      ready: F => (G.kills.overseersHound || 0) - (G.flags["b6.base"] || 0) >= 3, left: F => `Hounds: ${Math.max(0, (G.kills.overseersHound || 0) - (G.flags["b6.base"] || 0))} of 3.`, gold: 3, pay: "Three hounds fewer. The road breathes easier. Here." },
  };
  T("paleGate").quartermaster = async F => { await M.board(F, "quartermaster", ["bounty4", "bounty5", "bounty6"], BQ, "The bounty board at Pale Gate"); };
})();

// ---------- part 3: operation 1, the salt road: the Tzavan coast (S13), the flats, Red Salt Weir, the Mines ----------
(function () {
  const S = window.Story, D = window.Data, Q = Object.assign, M2 = S.m2, M3 = S.m3, M = S.m4, T = M.T, say = M.say, thought = M.thought, stage = M.stage, once = M.once, cycle = M.cycle;
  const hub = M.hub;

  S.trigger.coastEnter = async F => {
    if (!once(F, "coast.seen")) return;
    F.music("provinces"); F.quest("salt", 0);
    await stage(async c => {
      c.tint("#1c2430", 0.12, 300);
      await c.say([["narr", "A paved road above grey cliffs, olive and salt-bush on the slopes, signal towers every mile. The sea is on the east, flat and pale. Down the road a line of wagons crawls north, with soldiers walking beside them out of step."], ["hero", "(Armies eat. A road is a throat.)"]]);
      c.tint("#1c2430", 0, 500); c.follow();
    }, { music: "provinces" });
  };
  S.done.coastEnter = F => F.f("coast.seen");
  S.chest.coastChest1 = M2.loot("c.coast1", [["tonic", 3]], 400, "A chest in a signal tower, under a pile of oilcloth. Three Clearwater Tonics and a purse. Somebody was saving them for a long watch.");
  S.chest.coastChest2 = M2.loot("c.coast2", [["ember", 2]], 0, "Under the lintel of a ruined tollbooth, a clay jar sealed with wax. Two Ashen Embers, still warm from the sun.");
  S.done.tollS13 = F => F.f("ch8.s13");
  S.trigger.tollS13 = async F => {
    if (F.f("ch8.s13")) return;
    F.music("tension");
    const ok = await M.general(F, 13, { level: 45, soldiers: [["legionCenturion", 44, " B"]], bg: "harbourCoast", title: "The Tollbooth General", place: "the Tzavan coast tollbooth", where: "It went out along the cliff, where the road runs out of stone.", fx: 130, fy: -4,
      setup: async c => {
        const h = c.hero; c.tint("#202a34", 0.2, 400);
        M3.actors(c, [["gd", "npcLegionGuard", 160, -30, { name: "Toll-clerk", flip: true }]]);
        await c.pan(h.x + 110, h.y - 10, 900);
        await c.say([["narr", "A tollbooth of pale stone in the middle of the road, a bar across it, a ledger on a stand. At the bar a creature stands in harness with a gold wire collar, a sun-wheel hung on its chest like a medal. A line of carts waits behind it, and no one in the line is looking at it."], ["guard", "By the authority of the Throne, the toll is one kakal a wheel and one question a traveller."]]);
        c.shake(2, 500); c.sfx("hitHeavy"); await c.wait(400); c.remove("gd"); c.follow();
      }, after: ["(The bar is up. The road is open. It does not feel like a victory.)"] });
    if (!ok) return;
    F.set("ch8.s13");
    await S.m2.stage(async c => {
      const h = c.hero, p = { x: h.x + 150, y: h.y - 6 };
      [["d1", "supplyWagon", 60, 40], ["d2", "supplyWagon", 150, 70], ["d3", "supplyWagon", 240, 40]].forEach(([id, art, dx, dy]) => c.actor(id, { art, x: h.x + dx, y: h.y + dy, flip: true }));
      await c.pan(p.x, p.y, 700); c.sfx("woodDoor"); c.shake(1, 500); c.fx("dust", p.x, p.y, { ms: 1600, r: 40 }); await c.wait(900);
      await c.say([["narr", "The bar swings up and stays up. The carts in the line stand where they are, drivers looking at each other, then at the road north."]]);
      c.follow(); ["d1", "d2", "d3"].forEach(id => c.remove(id));
    });
  };

  // ---------- the Red Salt Flats and the Ninth Legion's cache ----------
  M3.spot("saltFlats", "ninthCairn", async F => {
    if (!once(F, "ninth.cairn")) { await UI.say([["narr", "The cairn has been opened. A flag-pole stands in the salt beside it, bare."]]); return; }
    await UI.say([["narr", "A cairn of grey stones, half buried in salt, a sun-wheel scratched into the top one. A flat stone has been shifted aside. Under it, a supply chest wrapped in oilcloth and a banner-pole, snapped. Somebody hid this from the legion that lost it."]]);
  }, "tg");
  S.chest.flatsCache = async F => {
    if (!F.f("l6.done") && !F.f("ninth.cairn")) { await UI.say([["narr", "The chest is under the cairn. You have not found the cairn."]]); return false; }
    return M2.loot("c.flats8", [["sunwater", 4]], 500, "The lost Ninth Legion's supply chest: four Sunwater Flasks, and a purse of old kakal with a sun-wheel on every coin.")(F);
  };
  T("saltFlats").ninthBanner = async F => {
    if (F.f("l6.done")) { await UI.say([["narr", "The banner stands quietly in the salt. Nothing under it moves."]]); return; }
    await Systems.hookLegend("L6", "saltFlats", { level: 46 });
  };

  // ---------- Red Salt Weir ----------
  M3.talkTown("redSaltWeir", { innLine: "The Crust House. Salt on the sheets, salt in the soup, and a bed that does not complain.", inn: "redSaltWeir", shopLine: "Imperial stock. The Throne sets the price; I set the face I make when I say it.", shop: "weir",
    beforeShop: F => M.backup(F, "bought.ember", "cinderglassEmber", 10, 1000, "Ten Cinderglass Embers, from a bagman who sells to people who ask no questions. They will light a root."), who: ["miner", "oldwoman", "child"],
    small: [["Brine gets in your hands, then in your head. We call it the weir.", "The overseers eat first. We eat second. The salt eats last."], ["My mother was born on these pans. She says the sea used to be sweeter.", "If a soldier asks, I never learned to count."], ["Do you want to see a trick? Watch the overseer's hat. Now it is not on his head.", "Mama says do not speak to men in armour. You are in armour."]] });
  T("redSaltWeir").foremanSalt = async F => {
    if (F.f("ch8.mines")) { await say("foremanSalt", "It is entered in the ledger that the barges are lost, the gangs are scattered, and I am to explain it to a tribune. Do you have any idea what an explanation costs?"); return; }
    await say("foremanSalt", cycle("hk", ["You are standing in a productive district. Productive districts do not have visitors. Do not touch anything that is white.", "The pans are three days behind quota. The quota is a number the Throne has decided. It is not my fault the sea is not cooperating.", "Move along. The sun sees all work, and you are not doing any."]));
  };
  T("redSaltWeir").workerLeader = async F => {
    if (F.f("ch8.mines")) { await say("workerLeader", "We are free. It is strange. My hands do not know what to do. They keep reaching for a rake."); return; }
    if (F.f("salt.gang1") || F.f("salt.gang2") || F.f("salt.gang3")) { await say("workerLeader", "(a whisper) Tonight. The barges. They load at dusk."); return; }
    await say("workerLeader", cycle("wl", ["(without looking up, scrubbing a pan) Tonight.", "(a whisper) If a gang goes missing, the rest of us will not see it. We will not see anything. We are very good at not seeing."]));
  };
  T("redSaltWeir").child = async F => { await say("child", cycle("cd8", ["Mama says the barges go to Tzavan, and Tzavan goes to the sun.", "I can hold my breath longer than the overseer. Watch."])); };

  // ---------- the Mines: three gangs, then the barges ----------
  const GANG = [["The first gang is chained to a rail along the brine channel, a dozen of them, hauling a cart that has not moved in an hour. Their overseer sits on the cart with his boots up.", "legionOptio", "overseersHound"], ["A second gang, at the loading ramp, stacking salt-blocks on a wooden sledge. A whip lies coiled on the top block. The overseer is counting.", "legionCenturion", "overseersHound"],
    ["The third gang works a pulley by the rails, singing under their breath so softly it is almost breathing. The overseer is at the end of the line with a stick.", "legionOptio", "overseersHound"]];
  [1, 2, 3].forEach(n => {
    T("redSaltMines")["gang" + n] = async F => {
      if (F.f("salt.gang" + n)) { await UI.say([["narr", "The chains lie in the salt where they were dropped."]]); return; }
      const [text, boss, dog] = GANG[n - 1];
      await UI.say([["narr", text], ["overseer", ["It is entered in the ledger that this gang's rate has been exceeded. Please do not stop it.", "Move along. You have taken a wrong turn. Wrong turns are punished in the mines.", "Sir, madam, creature, whatever you are: that cart is the property of the Harvest Office."][n - 1]]]);
      const res = await F.fight([F.mkEnemy(boss, 46), F.mkEnemy(dog, 46, " B"), F.mkEnemy(dog, 46, " C")], { bg: "saltMine", intro: "The overseer calls the hounds!" });
      if (res !== "win") return;
      F.set("salt.gang" + n); F.sfx("door");
      await UI.say([["narr", ["The overseer drops his boots from the cart. The chains come off with a sound like coins. The gang does not speak: they hold each other by the forearm in turn, one by one, and go up the ramp towards the light.", "The whip goes into the brine. Nobody touches it. They file out past you with their eyes on the floor, and at the top one of them turns and nods, once, as if tipping a hat.", "The song stops. The last man in the line says only: \"Dusk. The barges.\" Then they are gone up the rails."][n - 1]]]);
    };
  });
  S.done.barges = F => F.f("ch8.mines");
  S.trigger.barges = async F => {
    if (F.f("ch8.mines")) return;
    if (!hub() && !(F.f("salt.gang1") && F.f("salt.gang2") && F.f("salt.gang3"))) { await UI.say([["narr", "The barge dock is shuttered, and the gangs are still on their chains."]]); return; }
    F.music("tension");
    await stage(async c => {
      const h = c.hero; c.tint("#2a1a10", 0.25, 400);
      for (let i = 0; i < 5; i++) c.actor("mn" + i, { art: i % 2 ? "npcSlave" : "npcRefugeeM", x: h.x - 200 + i * 30, y: h.y + (i - 2) * 26 });
      await c.say([["narr", "The barge dock at dusk: three flat boats stacked high with white blocks, a rail, a lamp, a single sleepy guard. And behind you, up the long ramp, the miners. All of them. Walking quietly, with torches made of rag and brine-oil."]]);
      await c.say([["workerLeader", "Tonight."]]);
      for (let i = 0; i < 5; i++) c.walk("mn" + i, h.x + 140 + i * 24, h.y + (i - 2) * 28, 1500);
      await c.wait(1000); c.sfx("break"); c.fx("fire", h.x + 190, h.y - 10, { ms: 3000 }); c.fx("embers", h.x + 190, h.y - 30, { ms: 3000 }); c.shake(3, 700);
      c.fx("fire", h.x + 230, h.y + 20, { ms: 3000 }); c.flash("#ffb060", 400); await c.wait(1100);
      await c.say([["narr", "The first barge catches with a whump. Then the second. The white blocks glow orange from inside and begin to crack. A man laughs, once, in a high voice, and then they are all laughing, quietly, with their hands over their mouths."], ["workerLeader", "That is a year of the Throne's salt. Go, quickly. We will say it was the lamp."]]);
      for (let i = 0; i < 5; i++) c.remove("mn" + i);
      c.tint("#2a1a10", 0, 700); c.follow();
    }, { music: "mines" });
    F.set("ch8.mines"); if (M.supply() < 3) { G.flags["ch8.supply"] = M.supply() + 1; UI.toast(`The salt road is cut by one more (${M.supply()} of 3).`, 3000); }
    F.music("mines");
  };
  S.chest.mineChest = M2.loot("c.mine", [["ember", 3]], 400, "A foreman's strongbox under the rails, with a padlock that has been oiled and never locked. Three Ashen Embers and a purse.");
})();

// ---------- part 4: operations 2 and 3: the Orchard Hills, Tuk Orchard, the Sunmaw altar (S14, cracked collar), the Governor's Villa (S15) ----------
(function () {
  const S = window.Story, D = window.Data, Q = Object.assign, M2 = S.m2, M3 = S.m3, M = S.m4, T = M.T, say = M.say, thought = M.thought, stage = M.stage, once = M.once, cycle = M.cycle;
  const hub = M.hub;

  // ---------- Tuk Orchard and the hidden granary ----------
  M3.talkTown("tukOrchard", { innLine: "The Green Husk. Cacao in the soup, cacao in the bread, and a bed that smells of it. You will dream sweet.", inn: "tukOrchard", shopLine: "The press-shop. Imperial prices, imperial manners. We use the back door, you understand.", shop: "tuk",
    who: ["orchardhand", "farmer", "child"], small: [["Under every tree a root, over every root a tax.", "My mother says the pods are sweet because of what is under them."], ["The cultists on the ridge buy the best of the crop and pay with a sack of coin and a stare.", "If the governor smiles at you, count your fingers."], ["There is a ghost in the press room. It sings. Nobody has told it to stop.", "A woman gave me a pod today and cried. I did not do anything."]] });
  T("tukOrchard").widow = async F => {
    const st = F.qstep("granary");
    if (st === "done") { await say("widow", cycle("wd", ["The children are eating. I will not say more than that. It is enough.", "My husband would have put his hat on the table and gone quiet. I have done it for him."])); return; }
    if (st === undefined) {
      await say("widow", "My husband built a granary before the overseers came, behind a wall in the hills. He told me where on the night he died, and I was so tired I did not listen. The children are hungry. Do you understand?");
      await say("widow", "Ask the pressman. He carried the last load up the hill. He will not tell me, because he thinks I would go.");
      F.quest("granary", 0); return;
    }
    await say("widow", st === 0 ? "The pressman. He knows. He is a stubborn man; ask him as if you already knew." : "A stone arch under vines, in the south-east corner of the hills. Find it, and bring back what you can. I will not be able to thank you properly.");
  };
  T("tukOrchard").pressman = async F => {
    const st = F.qstep("granary");
    if (st === 0) {
      await say("pressman", "The widow sent you. She would. ...Go up into the hills and east along the lowest terrace, to the far south-east corner, where the overseers never walk. A stone arch gone green with vines, and a stone in it with a notch. Not the low flowering terrace walls. Behind the notch, the door.");
      await say("pressman", "I carried the last sack up it myself. I have not been back. Every time I think of it, I smell the grain.");
      F.quest("granary", 1); return;
    }
    await say("pressman", cycle("pr", ["The press is slow. The pods are sweet. That is all I have to say about pods.", "If a man tells you he has no secrets, he is selling something.", "Careful on the hill roads. The Governor's dogs are loose."]));
  };
  S.gather.granaryDoor = async F => {
    if (F.f("granary.done")) { await UI.say([["narr", "The vine wall stands open. The granary behind it is nearly empty, and swept."]]); return false; }
    if (F.qstep("granary") !== 1) { await UI.say([["narr", "A hillside wall hung with vines, as green as any other. A notch in one stone, if you look. Nothing happens."]]); return false; }
    F.set("granary.done"); F.sfx("door"); F.give("sunwater", 6); F.give("ember", 6); F.gold(800, true); UI.toast("+800 kakal", 2400);
    await UI.say([["narr", "The notched stone turns. The vines swing back like a curtain, and behind them a dry stone room, cool and full of the smell of grain. Sacks to the roof. Jars of dried fruit. At the back, a box of flasks and embers wrapped in oilcloth, with a child's drawing of a sun pinned over it."]]);
    F.questDone("granary");
  };
  Q(S.done, { granaryDoor: F => F.f("granary.done") });

  // ---------- the Sunmaw altar (S14): the collar is cracked ----------
  const mg = S.makeGeneral;
  S.makeGeneral = (slot, level, o) => { const u = mg(slot, level, o); if (u && slot === 14) M.crack(u); return u; };
  M.crack = u => {
    const set = d => { d.breakNeed = Math.max(1, (d.breakNeed || 1) - 1); d.cracked = true; d.hooks = (d.hooks || []).filter(h => h !== "genLines").concat("crackedLines"); };
    set(u); const d = Core.ENEMIES[u.id]; if (d) set(d);
  };
  S.done.s14Fight = F => F.f("ch8.s14");
  S.trigger.s14Fight = async F => {
    if (F.f("ch8.s14")) return;
    F.music("tension");
    const ok = await M.general(F, 14, { level: 47, soldiers: [["sunmawCultist", 46, " B"], ["sunmawCultist", 46, " C"]], bg: "pyramid", title: "The Cracked Collar", place: "the summit altar of the Sunmaw pyramid", where: "It went down the back stair, and the cultists did not stop it.", fx: 130, fy: -4,
      setup: async c => {
        const h = c.hero; c.tint("#2c0c08", 0.3, 400);
        M3.actors(c, [["pr", "npcAcolyte", 170, -40, { name: "Acolyte", flip: true }], ["pr2", "npcAcolyte", 220, 10, { name: "Acolyte", flip: true }]]);
        await c.pan(h.x + 120, h.y - 10, 900);
        await c.say([["narr", "The summit: a platform of black-red stone, steps dark with something that has been washed and never quite clean. A ring of collar altars, and at the centre the oldest, with a crack across its face as long as an arm. The creature chained to it is looking at the crack."], ["priest", "The altar is cracked! Hold the line! The sun sees it! The sun SEES it!"]]);
        c.shake(2, 500); c.sfx("hitHeavy"); await c.wait(300); c.remove("pr"); c.remove("pr2"); c.follow();
      }, after: ["(It spoke to me before the cultists stopped it. In its own voice. Through the crack.)"] });
    if (!ok) return;
    F.set("ch8.s14"); F.sfx("door");
    await S.m2.stage(async c => {
      const h = c.hero, ids = [];
      for (let i = 0; i < 4; i++) { ids.push("cu" + i); c.actor("cu" + i, { art: "npcAcolyte", x: h.x + 110 + (i % 2) * 40, y: h.y - 50 + i * 30, flip: true }); }
      c.tint("#2c0c08", 0.22, 300); c.sfx("chainBreak"); ids.forEach(id => c.emote(id, "!")); await c.wait(500);
      await c.say([["narr", "The altar goes dark. The cultists drop their knives and run down the stair in a body, shouting about the weather. At the back of the platform, a chest has been standing open all along."]]);
      await Promise.all(ids.map((id, i) => c.walk(id, h.x - 360 - i * 24, h.y + 40 + i * 12, 1800 + i * 120))); ids.forEach(id => c.remove(id)); c.tint("#2c0c08", 0, 400);
    });
    UI.toast("Sunmaw stops harvesting for a season.", 3600);
  };
  S.chest.g13_bloodlettersAltar = M.gearChest("g13_bloodlettersAltar", "G13", "ch8.s14", "The chest is bolted to the altar. Something still guards the altar.");

  // ---------- the Governor's Villa (S15) ----------
  T("governorsVilla").cook = async F => {
    if (!F.f("vil.cook")) {
      await UI.say([["cook", "You are the bread-and-thyme boy. I knew from the boots. Imela's loaf, Tuesdays, in the laundry basket: I have sent her one for eleven years."], ["hero", "She is out. She is safe."],
        ["cook", "(her hands stop) ...Good. Then I do not have to be brave on Tuesdays. Back stair, past the songbirds. The library is the long room with the lamps. Do not let the steward see you; he counts the spoons."]]);
      F.set("vil.cook"); return;
    }
    await say("cook", cycle("ck", ["The governor takes his tea at the fourth bell. The steward takes his at the third. I have never once brought them the same pot.", "Mind the dogs. They are lazy and they love me. They do not love you.", "If you see a spoon on the floor, leave it. It is a message."]));
  };
  S.gather.ledgerLibrary = async F => {
    if (!F.f("vil.cook") && !hub()) { await UI.say([["narr", "The library door is locked from the inside. A servant would know the back stair."]]); return false; }
    if (!once(F, "vil.ledger")) { await UI.say([["narr", "The ledgers are exactly where the cook said. You have what you need."]]); return false; }
    F.give("ledgerLots", 1, true); F.sfx("coin");
    await UI.say([["narr", "A long room of lamps and shelves. The ledgers are bound in green cloth, thirty years of them, each page ruled in red. Lots, prices, destinations, the same clean hand all the way down. You copy the last page and the one before it into the Field Journal."],
      ["hero", "(He wrote everything down. Every one of them. By lot.)"]]);
  };
  S.done.ledgerLibrary = F => F.f("vil.ledger");
  S.done.s15Fight = F => F.f("ch8.s15");
  S.trigger.s15Fight = async F => {
    if (F.f("ch8.s15")) return;
    if (!F.f("vil.cook") && !hub()) { await UI.say([["narr", "The strongroom door is behind a corridor of steward's guards. A servant's stair might get you round."]]); return; }
    F.music("tension");
    const ok = await M.general(F, 15, { level: 49, soldiers: [["legionCenturion", 47, " B"]], bg: "villa", title: "The Governor's Strongroom", place: "the Governor's strongroom", where: "It went out through the songbird garden, and the cages sprang open behind it.", fx: 130, fy: -4,
      setup: async c => {
        const h = c.hero; c.tint("#2a1c10", 0.22, 400);
        M3.actors(c, [["gv", "npcTribune", 170, -30, { name: "The Governor", flip: true }]]);
        await c.pan(h.x + 110, h.y - 10, 900);
        await c.say([["narr", "The strongroom: a vault of mosaic and iron, shelves of chests, a desk with a lamp and a pen still wet. In the middle, a creature in gold harness stands on a mat of cloth-of-gold, one foot on a chain bolted to the floor. A man in green silk stands at the desk with his back to you."], ["governor", "It is entered in the ledger that this is a private residence, and that you have not been invited."]]);
        c.shake(2, 500); c.sfx("hitHeavy"); await c.wait(300); c.follow();
      } });
    if (!ok) return;
    await stage(async c => {
      const h = c.hero; c.tint("#2a1c10", 0.18, 300);
      M3.actors(c, [["gv", "npcTribune", 90, -20, { name: "The Governor", flip: true }]]);
      c.emote("gv", "!");
      await c.say([["governor", "The Throne will hear of this."], ["hero", "I hope so."]]);
      await c.walk("gv", h.x + 380, h.y - 70, 1500); c.sfx("door"); c.remove("gv");
      await c.say([["narr", "He leaves by the garden door at a trot, holding his silk up like a woman crossing a stream. The pen on his desk is still wet. Beside it lies an open ledger, ruled in red, and the last entry is underlined in another hand."],
        ["narr", "\"Cell 9, Black Mirror: one creature, Ahuacan palace lot, to be kept alive.\""], ["hero", "(That is where it is.)"]]);
      c.tint("#2a1c10", 0, 500); c.follow();
    });
    F.set("ch8.s15"); F.quest("m_prison", 0); F.give("ledgerLots", 1, true);
    await UI.say([["narr", "Behind the desk, a regalia chest stands with its lid propped open. The songbirds in the garden have found the cage doors, and the noise comes in through the walls."]]);
  };
  S.chest.villaChest = async F => {
    if (!F.f("ch8.s15")) { await UI.say([["narr", "The regalia chest is behind the strongroom door."]]); return false; }
    if (F.f("c.villa")) { await UI.say([["narr", "The chest is empty."]]); return false; }
    F.set("c.villa"); F.give("governorRegalia", 1, true); F.gold(1200, true); F.sfx("coin"); UI.toast("+1200 kakal", 2600);
    await UI.say([["narr", "The Governor's regalia: a cloak of green feathers, a gilt collar, a sceptre with a sun-wheel at the top. He never wore it. Under it, a purse of twelve hundred kakal and a note in his own hand: \"For the day I am recalled.\""]]);
  };
})();

// ---------- part 5: the Veiled Cistern (K6) and Mothmara, the Ninth Legion (L6), the Iron Cup, Story.finish[8] ----------
(function () {
  const S = window.Story, D = window.Data, Q = Object.assign, M2 = S.m2, M3 = S.m3, M = S.m4, T = M.T, say = M.say, thought = M.thought, stage = M.stage, once = M.once, cycle = M.cycle;
  const hub = M.hub;

  // ---------- 6.C K6: the Veiled Cistern ----------
  S.trigger.cisternEnter = async F => {
    if (!once(F, "cis.seen")) return;
    F.music("crypt"); F.quest("m_k6", 0);
    await stage(async c => {
      c.tint("#0c2a1c", 0.28, 400);
      await c.say([["narr", "Green glass tanks in the dark, shafts of light falling through cracks in the roof, a lake of still water without a ripple. Statues of people stand frozen mid-step among the pillars, hands out, mouths a little open. On stands of polished bronze, mirrors, turned every way."], ["hero", "(Do not stand where they are looking.)"]]);
      c.tint("#0c2a1c", 0.1, 600); c.follow();
    }, { music: "crypt" });
    await F.banter("cistern");
    F.quest("cistern", 0);
  };
  S.done.cisternEnter = F => F.f("cis.seen");
  const MIRR = { 1: 2, 2: 0, 3: 3, 4: 1 };      // the angle each mirror stand must face (0 to 3 quarter-turns)
  [1, 2, 3, 4].forEach(n => {
    S.done["mirror" + n] = F => F.f("cis.solved");
    S.trigger["mirror" + n] = async F => {
      if (F.f("cis.solved")) { await UI.say([["narr", "The mirror holds its angle. A thread of light crosses the hall."]]); return; }
      const k = "cis.m" + n, v = ((G.flags[k] || 0) + 1) % 4; G.flags[k] = v; F.sfx("door");
      if (v === MIRR[n]) { G.flags["cis.ok" + n] = true; await UI.say([["narr", ["The stand grates round a quarter-turn. The mirror catches the shaft of light and throws it across the hall; a bright thread falls onto the water and holds.", "The mirror swings and stops. The beam it caught leaps to the next stand in the line, and the stand trembles."][n % 2]]]); }
      else { delete G.flags["cis.ok" + n]; await UI.say([["narr", ["The stand grates round a quarter-turn. The beam slides off the glass and drowns itself in the lake.", "The mirror swings. The light falls on a statue's face, and the statue seems, very slightly, to look at you.", "The mirror turns and sends the light up into the roof, where a thousand years of dust turn gold and settle again."][v % 3]]]); }
      if ([1, 2, 3, 4].every(i => G.flags["cis.ok" + i])) {
        F.set("cis.solved");
        await S.m2.gate([["narr", "The fourth mirror takes the beam and the whole hall lights in a line: stand to stand, bronze to bronze, until the light lands on the sealed door at the far end. It begins to glow like a coal, and then the bronze moves. Behind it, a veil of grey cloth stirs where there is no wind."]], { dx: 220, dy: -30, sfx: "stoneGrind", fx: "glow", fx2: "sparkle", shake: 2, flash: "#fff4c8", tint: "#0c2a1c" });
      }
    };
  });
  S.done.cisternGuardian = F => F.f("k6.done");
  S.trigger.cisternGuardian = async F => {
    if (F.f("k6.done")) return;
    if (!hub() && !F.f("cis.solved") && !F.f("cis.open")) { await UI.say([["narr", "The sealed door will not open to a hand. It wants the light."]]); return; }
    const ok = await M3.keyBoss(F, { id: "veiledCisternGuardian", level: 49, k: "k6", key: "keyK6", name: "The Veiled Guardian", title: "Keeper of the Glass Cistern", bg: "glassCistern", fx: "sparkle", end: "fade",
      lines: [["narr", "The veil lifts without a hand on it. Behind it, a figure of grey cloth stands in the middle of the lake, its face a smooth oval of glass in which you see yourself looking back, and slightly behind you, someone else."], ["hero", "(It is wearing every face it has ever looked at.)"]],
      stage: async c => { c.tint("#0c2a1c", 0.3, 500); c.sfx("encounter"); c.fx("sparkle", c.hero.x + 100, c.hero.y - 20, { ms: 2000 }); await c.say([["narr", "The water of the lake goes flat as a plate. Every statue in the cistern has turned its head toward the door."]]); },
      after: [["narr", "The veil falls in on itself like a held breath let go, and settles on the water. On a dais where it stood there lies a key of green glass, as cold as the cistern."], ["hero", "(Whatever it kept, someone paid for it to be kept.)"]] });
    if (!ok) return;
    F.questDone("cistern"); await UI.say([["narr", "At the foot of the dais a chest has risen out of the water, hung with weed and bound in bronze."]]);
  };
  S.chest.g30_serpentHairedVeil = M.gearChest("g30_serpentHairedVeil", "G30", "k6.done", "The chest sits under the dais, behind the Veiled Guardian.");

  // ---------- K6 at the wagon: Mothmara ----------
  M.freeMothmara = async F => {
    F.take("keyK6", 1); F.set("k6.freed"); F.questDone("m_k6");
    const u = F.mk("mothmara", Math.max(3, F.avgLevel() - 1)); G.collection.push(u); G.best.mothmara = G.best.mothmara || { seen: 1, beaten: 0 }; F.sfx("door");
    await M.stage(async c => {
      c.tint("#1a1030", 0.2, 400);
      await c.cageOut("mm", "mothmara", { before: [["dunmar", "A cage of green glass. Careful, lad. She does not like a lamp held too close."]], desc: [["narr", "The cage door opens on its own. A nightmare-horse, black as a well, a veil of small snakes lifting about her head like hair in water, steps down onto the wagon boards and does not look at anyone's eyes."]] });
      await c.say([["mothmara", "I have asked many questions in the dark. I would like to ask a kind one."], ["dunmar", "She was used to question prisoners, lad. She carries it."], ["mothmara", "Forgive me. I remember what I saw in them. ...May I walk with you?"]]);
      await c.cageBack("mm"); c.tint("#1a1030", 0, 500);
    });
    UI.toast("Mothmara joins the collection.", 3200);
  };
  const baseWagon = M3.wagon;
  M3.wagon = async F => { if (F.item("keyK6") > 0) { await M.freeMothmara(F); return true; } return baseWagon(F); };

  // ---------- 6.D L6: the Ghost of the Ninth Legion ----------
  S.legend.L6 = async (F, info) => {
    const l = D.LEGENDS.L6; F.music("legend");
    await stage(async c => {
      const h = c.hero; c.tint("#8a96b0", 0.3, 500);
      for (let i = 0; i < 6; i++) c.actor("nl" + i, { art: "npcLegionGuard", x: h.x + 260 + (i % 3) * 38, y: h.y - 60 + Math.floor(i / 3) * 90 + (i % 2) * 14, flip: true, alpha: 0.6 });
      await c.say([["narr", "A banner walks the salt with no one carrying it. Under it the mist thickens into men: a legion, rank behind rank, in the shapes of the old armour, with nothing under the helms. They form a line on the white plain, and the line is exactly as straight as a line drawn by someone who has never been allowed to be wrong."]]);
      c.tint("#8a96b0", 0, 500); for (let i = 0; i < 6; i++) c.remove("nl" + i);
    }, { music: "legend" });
    const i = await F.ask(l.n, [{ label: "Face it" }, { label: "Back away" }], { top: "38%" });
    if (i !== 0) { F.music(F.regionMusic()); return false; }
    await Cinema.boss({ id: "ghostOfTheNinthLegion", name: l.n, title: "The Legion With No Faces", bg: "saltFlats", music: "legend",
      lines: [["narr", "No one speaks. A horn that no one blows sounds three notes. The line turns toward you as one."], ["hero", "(They have been looking for their general for a hundred years. They think I might be him.)"]] });
    F.checkpoint();
    const res = await F.fight(Core.bossFoes ? Core.bossFoes("ghostOfTheNinthLegion", (info && info.level) || 46) : [F.mkEnemy("ghostOfTheNinthLegion", 46)], { noFlee: true, music: "legend", goldMult: 0, xpBonus: 1.5, intro: "The Ninth Legion forms its line!", bg: F.arenaOf(G.region) });
    if (res !== "win") { F.music(F.regionMusic()); return false; }
    const g = Math.round(10 * Systems.m(l.ch)); G.gold += g; UI.toast("+" + g + " kakal", 2400);
    F.set("l6.done"); F.give("ninthBanner", 1, true); await Systems.giveReward(l.reward, l.ch);
    await stage(async c => {
      const h = c.hero; c.tint("#8a96b0", 0.3, 300);
      for (let i = 0; i < 6; i++) c.actor("nl" + i, { art: "npcLegionGuard", x: h.x + 200 + (i % 3) * 38, y: h.y - 60 + Math.floor(i / 3) * 90 + (i % 2) * 14, flip: true, alpha: 0.6 });
      await c.wait(400);
      const out = (async () => { await c.wait(1200); for (let i = 0; i < 6; i++) c.anim("nl" + i, "fadeOut", { ms: 1400 }); await c.wait(1500); })();
      await c.say([["narr", "The banner stops walking. It stands in the salt, quite still, and the mist goes out of the line in one long breath, leaving boots, a few buckles, and a very old banner folded as neatly as a letter. Someone has been taking care of it."], ["hero", "(Folded. They folded it for me.)"]]);
      await out; for (let i = 0; i < 6; i++) c.remove("nl" + i); c.tint("#8a96b0", 0, 400);
    });
    F.music(F.regionMusic());
    return true;
  };

  // ---------- 6.D the Iron Cup ----------
  Q(D.CUPS.iron, { n: "Iron Cup", ch: 8, gear: "G2", note: "Three fights, then the Spear Twins.",
    fights: [{ n: "Shield line", foes: ["legionCenturion", "legionShieldbearer", "legionShieldbearer"], lv: 44 }, { n: "Knives of the sun", foes: ["sunmawCultist", "sunmawCultist", "legionArcher"], lv: 45 }, { n: "The beast pen", foes: ["lionWolf", "boarBull", "lionWolf"], lv: 46 }],
    champion: { n: "The Spear Twins", foes: ["spearTwinA", "spearTwinB"], lv: 47, intro: "Two spearmen walk out in step. When one lunges, so does the other.",
      cinema: () => Cinema.boss({ id: "spearTwinA", name: "The Spear Twins", title: "Champions of the Iron Cup", bg: "colosseum", music: "arenaChampion", lines: [["narr", "Two spearmen come out of the south gate in step: one in sun-gold, one in river-blue. They stop at the same moment, and they plant their spears at the same moment, and the crowd, which has been shouting all day, goes quiet."], ["hero", "(They are not two men. They are one man in two places.)"]] }) } });

  // ---------- Story.finish[8] (dbg.jump: the end of chapter 8) ----------
  S.finish[8] = (F, G) => {
    ["ch8.start", "ch8.arrived", "ch8.guest", "ch8.s13", "ch8.mines", "ch8.s14", "ch8.s15", "ch8.night", "ch8.done", "rm.salt", "rm.sun", "rm.villa", "coast.seen", "vil.cook", "vil.ledger", "salt.gang1", "salt.gang2", "salt.gang3", "tuk.rumour2", "t6.known",
      "gen.freed.13", "gen.freed.14", "gen.freed.15", "ch9.start"].forEach(k => (G.flags[k] = true));
    delete G.flags["ch9.start"]; G.flags["ch8.supply"] = 3;
    ["m_pale", "m_ops", "salt"].forEach(q => (G.quests[q] = "done")); G.quests.m_prison = 0;
    [13, 14, 15].forEach(n => { const g = S.generalFor(n); if (g) S.noteGeneral(g.id, ["Freed at the Tzavan coast tollbooth. It went out along the cliff, where the road runs out of stone.", "Freed at the Sunmaw summit. It went down the back stair, and the cultists did not stop it.", "Freed in the Governor's strongroom. It went out through the songbird garden, and the cages sprang open behind it."][n - 13]); });
    F.giveGear("G13", 3, true); G.items.ledgerLots = 1; G.flags["wagon.at"] = "ashfeatherCamp"; G.gold += 2000; G.ch = 8; G.lastTown = "paleGate";
    if (window.Systems) Systems.guestJoin("emberwick", { level: F.avgLevel(), name: "Emberwick" });
  };
})();

// ---------- skill book (SKILLBOOK agent 2026-10-31): Bitter Rue (Orchard Rue, the Orchard Hills) ----------
(function () {
  const S = window.Story, D = window.Data, M2 = S.m2, add = (id, ...drops) => { D.DROPS[id] = (D.DROPS[id] || []).concat(drops); };
  Object.assign(D.MATS, { orchardRue: ["Orchard Rue", "A bitter grey herb. Tuk's pickers chew it for the fever and for the foreman's mood."] });
  Object.assign(D.BOOK, { bitterRue: { n: "Bitter Rue", mat: "orchardRue", need: 10, d: "2 MP. Removes up to 2 statuses or lowered stats from an ally.", move: "bitterRue" } });
  add("orchardSatyr", ["orchardRue", 0.3]); add("sunmawCultist", ["orchardRue", 0.15]);
  M2.bookSpot("orchardHills", "orchardRue1", "A hedgerow of grey rue", "g.rue1", "orchardRue", 5, "Along the hedge between two terraces grows a low grey herb with a smell that makes your eyes water. The pickers chew it against the fever. You pull five sprigs and your tongue goes numb just from holding them.", "Bitter Rue");
  M2.bookSpot("orchardHills", "orchardRue2", "Rue by the ditch", "g.rue2", "orchardRue", 5, "Rue grows thick where the irrigation ditch leaks. Nobody picks it for the press, so nobody has touched it. Five more sprigs.", "Bitter Rue");
})();
