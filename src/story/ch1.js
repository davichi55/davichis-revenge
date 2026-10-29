// Chapter 1: the Whisperglass Dunes, Sandpiper Rest, the Cistern of the Burnt Gate, Raid Optio Karvan.
"use strict";
(function () {
  const S = window.Story;
  // a chest that hands out one piece of a set per visit to the dungeon (up to 3), then flasks
  S.gearChest = async (F, id, set, extra) => {
    F.visit = F.visit || {}; if (F.visit[id]) { await UI.say([["narr", "The chest is empty."]]); return; }
    F.visit[id] = true; F.sfx("door");
    const n = G.flags["gc." + id] || 0;
    if (extra) await extra(F, n);
    if (n < 3) { G.flags["gc." + id] = n + 1; await UI.say([["narr", `You open the chest. Inside: ${Data.pieceName(Data.pieceId(set, Data.SLOTS.find(s => !F.owned(Data.pieceId(set, s))) || "helm"))} (${Data.SETS[set].n}).`]]); F.giveGear(set, 1); }
    else { F.give("sunwater", 2); await UI.say([["narr", "Only two Sunwater Flasks this time. You already own the whole set."]]); }
  };

  S.trigger["dunes.start"] = async F => {
    if (F.f("ch1.start")) return; F.set("ch1.start");
    F.music("story");
    await UI.card({ image: "assets/pano_desert.png", big: "Chapter 1", text: "The Attack" });
    F.music("dunes");
    await UI.say([["narr", "Night in the Whisperglass Dunes. Behind you Orun burns gold against the stars. The glass sand hums under your boots, a thin high note, like a wet finger on a cup."]]);
    await F.banter("flee");
    F.music("raid");
    await UI.say([["narr", "Torchlight on the ridge. Imperial raiders, spread out in a line, hunting for runaways."], ["soldier", "There! Beasts and a tin man! Take them alive if you can."]]);
    const res = await F.fight([F.mkEnemy("raidShieldbearer", 3, " A"), F.mkEnemy("raidSlinger", 3, " B")], { intro: "Imperial raiders cut you off!" });
    F.music("dunes");
    if (res === "win") await UI.say([["hero", "(Tower shields. The blows slide off them. Spells would bite deeper.)"], ["narr", "You note it in the Field Journal: Raid Shieldbearer, Raid Slinger."]]);
    
  };
  S.chest["dunes.chest1"] = async F => {
    if (F.f("c.dunes1")) return; F.set("c.dunes1"); F.give("sunwater", 2); F.gold(25);
    await UI.say([["narr", "Under the humming ridge, half buried: a traveller's cache. Two flasks and a little kakal."]]);
  };

  // ---------- Sandpiper Rest ----------
  S.trigger["sandpiper.arrive"] = async F => {
    if (F.f("sp.seen")) return; F.set("sp.seen");
    F.music("oasis");
    await UI.say([["narr", "Dawn. Sandpiper Rest: a ring of reed huts around a well, a shaded caravanserai, camels asleep in rows. Nobody has heard about Orun yet."]]);
    F.set("pro.sawTown");
  };
  S.talk.sandpiper = {
    innkeeper: async F => {
      if (!F.f("sp.letter")) {
        await UI.say([["innkeeper", "You look like you ran through a fire. Sit. ...Oh. A letter came for you on the evening caravan. Your name, nobody else's."]]);
        await F.letter("the Academy's green seal", ["\"Alive. Thank the lamps. Do not return to Orun.\"", "\"The main road east is watched. Go under it: the Cistern of the Burnt Gate. The route is marked on the last page of your Journal.\"", "\"Record everything. Every creature, every blow, every break. Rest where you can. I will know when you have rested. - I.\""]);
        await UI.say([["hero", "(The last page already has a map. The ink looks days old.)"]]);
        F.set("sp.letter"); F.questDone("m_escape"); F.quest("m_cistern", 0);
      } else await UI.say([["innkeeper", "A bed and a bowl for the road?"]]);
      const slept = await F.inn("sandpiper");
      if (slept && !F.f("sp.rested")) { F.set("sp.rested"); await F.banter("rest"); await UI.say([["narr", "Somewhere far off a courier takes your notes east. You never see them go."]]); }
    },
    clerk: async F => { await UI.say([["clerk", "Road goods and a few things off the imperial wagons. I even have a travelling set, if you can pay."]]); await F.shop("sandpiper"); },
    traveller: async F => S.rumourTalk(F, "sandpiper", "traveller"),
    wellwoman: async F => S.rumourTalk(F, "sandpiper", "wellwoman", "The well is deep, the gossip is shallow. Come back later."),
    caravaner: async F => { await UI.say([["caravaner", "Soldiers on the main road since last night. Tower shields in a wall. If you must go east, go under it. The Burnt Gate cistern is old but dry enough."]]); if (Math.random() < 0.5) await F.idleBanter(); },
  };

  // ---------- the cistern ----------
  S.chest["cistern.chest"] = async F => S.gearChest(F, "cistern.chest", "G5");
  S.trigger.karvan = async F => {
    if (F.f("ci.karvan")) return;
    F.music("raid");
    await UI.say([
      ["narr", "The far end of the cistern: a gate of green bronze, and in front of it a line of shields."],
      ["karvan", "Halt. Optio Karvan, Ninth Cohort. You are Ithiel's apprentice. And that is his satchel."],
      ["hero", "..."],
      ["karvan", "No answer? There is a boy under that helm, is there not? Hand over the satchel and your beasts keep their teeth."],
      ["hero", "No."],
      ["karvan", "Shields up, then. We were told you would come this way."],
      ["hero", "Told by whom?"],
      ["karvan", "The road tells everyone everything. Shields!"],
    ]);
    await F.banter("karvan");
    const res = await F.boss([F.mkEnemy("raidOptioKarvan", 6), F.mkEnemy("raidShieldbearer", 5, " A"), F.mkEnemy("raidShieldbearer", 5, " B")], { intro: "Optio Karvan raises his shield wall!", music: "boss" });
    if (res !== "win") return;
    F.set("ci.karvan"); F.giveGear("G16", 3); G.ch = 2; F.questDone("m_cistern");
    G.best.raidOptioKarvan = Object.assign(G.best.raidOptioKarvan || {}, { seen: 1, beaten: 1 });
    await UI.say([
      ["karvan", "Hah... Strange. I was told you would be slower. And that you would keep writing."],
      ["hero", "Who told you that?"],
      ["karvan", "..."],
      ["narr", "He drops his shield and limps away through the dark. The bronze gate groans open on its own weight, and the road east lies empty."],
      ["narr", "Karvan's shield crew left their kit behind: helm, shield and sword. It is a full Tower Shield Phalanx set."],
    ]);
    F.save(true);
    F.go("dunes", "from_cistern_gate");
  };
})();
