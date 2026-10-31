// Adapter between the world engine's ids (owner D: NPC, trigger, chest and gather ids in src/world/regions/*.js) and the story scripts.
// Also the story steps that only exist because of the engine's layout (Mazeheart inside the maze, the K1 cage, the boat trigger, the Dusk Whisperer).
"use strict";
(function () {
  const S = window.Story, T = S.talk, Tr = S.trigger;
  const rum = (town, i, who) => F => S.rumourIdx(F, town, i, who);

  // ----- Sandpiper Rest -----
  T.sandpiper.merchant = T.sandpiper.clerk;
  T.sandpiper.r1 = rum("sandpiper", 0, "traveller"); T.sandpiper.r2 = rum("sandpiper", 1, "wellwoman");
  T.sandpiper.r3 = async F => { await S.rumourIdx(F, "sandpiper", 2, "caravaner"); await UI.say([["caravaner", "Soldiers on the main road since last night. If you must go east, go under it. The Burnt Gate cistern is old but dry enough."]]); };
  // ----- Cistern -----
  T.cistern = { burntGateSign: async F => { await UI.say([["narr", "A carved sign: THE BURNT GATE. Under it, scratched with a knife: \"The Optio sits beyond. Bring shields.\""]]); } };
  Tr.karvanAmbush = Tr.karvan; S.chest.g5_bullringBronze = S.chest["cistern.chest"];
  // ----- Dunes -----
  Tr.dunesArrival = Tr["dunes.start"]; S.chest.dunesBuriedChest = S.chest["dunes.chest1"];
  Tr.duskWhisperer = async F => {
    if (F.f("l1.done")) return;
    F.music("sad");
    await UI.say([["narr", "On the ridge at dusk, a hound of sand and wind stands very still. Its mouth is full of voices. They are saying what you said yesterday."], ["hero", "(The Dune Whisperer. The traders say it brings luck.)"]]);
    const res = await F.fight([F.mkEnemy("duneWhisperer", 6)], { intro: "The Dune Whisperer speaks in your own voice!", xpBonus: 1.4 });
    F.music("dunes");
    if (res !== "win") return;
    F.set("l1.done"); F.set("wardstone"); F.give("wardstone", 1, true);
    await UI.say([["narr", "The hound lies down and fades into the sand. On the ground, a smooth grey stone, warm and humming: a Wardstone. (Fights come half as often now.)"]]);
  };
  // ----- Undercroft -----
  S.chest.undercroftChest = async F => { if (F.f("c.under")) return false; F.set("c.under"); F.give("sunwater", 2); F.gold(15); await UI.say([["narr", "A lab-keeper's lunch box: two flasks and a few coins."]]); };
  T.undercroft = { cellarCage: async F => { await UI.say([["narr", "An empty cage with a tag: \"Practice animal, retired.\" The bars are bent from the inside."]]); } };
  // ----- Amber Wells -----
  const AW = T.amberWells;
  AW.oldDunmar = AW.dunmar; AW.redScholar = AW.pell; AW.guildMaster = AW.foreman;
  AW.r1 = rum("amber", 0, "gossip"); AW.r2 = rum("amber", 1, "gossip"); AW.r3 = rum("amber", 2, "gossip");
  // ----- Scorpion Quarry -----
  T.quarry = { quarryForeman: async F => { await UI.say([["foreman", "Dune Scorpion Knights roam out on the basin road. In here it's the Gargoyles and the heat. The shard pile at the bottom is free to anyone brave enough."]]); } };
  S.chest.g20_masonHammer = S.chest["quarry.chest"];
  S.gather.duneclawShard = S.gather["quarry.shards"];
  // ----- Cinderglass Flats -----
  S.chest.g12_cinderSerpentPit = S.chest["flats.chest"];
  const emb = n => async F => { F.set("g.ember" + n); F.give("cinderglassEmber", 5); F.sfx("fire"); await UI.say([["narr", "You rake the fire-pit with a bone ladle. Five Cinderglass Embers glow in the cold sand."]]); if (F.matCount("cinderglassEmber") >= 10) UI.toast("New in the Skill Book: Kindle."); };
  const plm = n => async F => { F.set("g.plume" + n); F.give("cinderPlume", 5); await UI.say([["narr", "A warm feather in the glass. Then another. Five Cinder Plumes."]]); };
  S.gather.cinderglassEmber1 = emb(1); S.gather.cinderglassEmber2 = emb(2); S.gather.cinderPlume1 = plm(1); S.gather.cinderPlume2 = plm(2);
  Tr.flatsPool = async F => { await UI.say([["narr", "A hidden pool, warm as milk. At the bottom, curled in its own tails, a fox of red fire sleeps."], ["hero", "(Not mine to take. Not mine to wake.)"]]); if (!F.f("pool.seen")) { F.set("pool.seen"); G.best.fireFox = { seen: 1, beaten: 0 }; await UI.say([["narr", "You note the fox in the Journal and leave quietly."]]); } };
  // ----- the Bone Maze: Mazeheart waits inside; the cage is the end of the walk -----
  T.maze = {
    oldMazeheart: async F => {
      if (!F.f("mazeheart.talked")) { F.set("mazeheart.talked"); F.quest("bellow", 0); await UI.say([["mazeheart", "Old bones hear old bones. A bull bellows in these walls when the wind is right. A cage waits where the bellow ends."], ["mazeheart", "Follow the bellowing. The louder side leads on."]]); }
      else await UI.say([["mazeheart", F.f("k1.done") ? "The bull is quiet. You did well. Take the chest, and the key." : "Louder is closer. Follow the bellowing."]]);
    },
  };
  Tr.k1Cage = async F => {
    if (F.f("k1.done")) return;
    F.quest("bellow", 0);
    await UI.say([["narr", "The deepest cell. A ring of bone, and a guardian rising from a pile of horns: a great skull on four legs, stamping."]]);
    const res = await F.boss([F.mkEnemy("mazeGuardian", 8), F.mkEnemy("mazeBat", 7, " B")], { bg: "boneMaze", intro: "The Maze's guardian lowers its horns!", xpBonus: 1.0 });
    if (res !== "win") return;
    F.set("k1.done"); F.quest("bellow", 1); F.set("k1.key"); F.give("keyK1", 1);
    await UI.say([["narr", "The guardian crumbles into horns. On a hook by the cage hangs a bone key, cold as a grave. At the back of the cell stands a chest."]]);
  };
  Tr.mazeDeep = async F => {    // hub version: the three junctions, then the cage
    const J = [["Three passages of pale bone. A bellow rolls out of the LEFT one, loud, shaking dust from the roof.", "left"], ["A fork. The bellowing is behind the RIGHT wall now, so close you feel it in your teeth.", "right"], ["A last hall of ribs. The bellow comes from straight AHEAD, down the middle aisle.", "mid"]];
    for (let i = 0; i < J.length; i++) {
      await UI.say([["narr", J[i][0]]]);
      const pick = await F.ask("Which way?", [{ label: "Left" }, { label: "Middle" }, { label: "Right" }]);
      if (["left", "mid", "right"][pick] !== J[i][1]) {
        await UI.say([["narr", "Dead end. The bones close behind you with a click, and something wakes."]]);
        const foes = F.rollEncounter("boneMaze"); if (foes) await F.fight(foes, { bg: "boneMaze" });
        await UI.say([["narr", "You wander back to the first junction. The bellow starts again."]]); i = -1; continue;
      }
      await UI.say([["narr", "The bellow grows. You keep going."]]);
    }
    await Tr.k1Cage(F);
  };
  S.chest.g4_wardenHalls = async F => { if (!F.f("k1.done")) { await UI.say([["narr", "The chest is wrapped in bone chains. Something guards it."]]); return false; } return S.gearChest(F, "maze.chest", "G4"); };
  S.chest["maze.chest"] = S.chest.g4_wardenHalls;
  // ----- Saltgate -----
  const SG = T.saltgate;
  SG.r1 = rum("saltgate", 0, "gossip"); SG.r2 = rum("saltgate", 1, "kitemaker"); SG.r3 = rum("saltgate", 2, "gossip");
  SG.customsOfficer = async F => { await UI.say([["captain", "Customs. I stamp what I'm paid to stamp. Papers? ...No? Excellent, nor does anyone."]]); };
  SG.smuggler = SG.captain;
  Tr.boatToIxcalo = async F => {
    if (!F.f("bear.done")) { await UI.say([["hero", "(A smuggler dock. The boat can wait. Ithiel's work first: the Hollow of the Sky-Stone.)"]]); return; }
    await SG.captain(F);
  };
  // ----- Hollow of the Sky-Stone -----
  Tr.hollowDoor = Tr["hollow.enter"]; Tr.duneBearer = Tr.bearer;
  T.hollow = {
    campKeeper: async F => { await UI.say([["innkeeper", "Field tent. Same price as the inn in town. No questions, no draughts."]]); await F.inn("tent"); },
    skyShardLore: async F => { await Tr["hollow.tablet"](F); },
  };
  S.chest.hollowLoreChest = async F => { if (F.f("c.hollow")) return false; F.set("c.hollow"); F.give("sunwater", 3); F.gold(60); await UI.say([["narr", "A builder chest with a rune on the lid. Inside: three flasks and a handful of old coins."]]); };

  // each D trigger fires once; these say when the story step is really finished (otherwise the trigger is given back)
  S.done = Object.assign(S.done || {}, {   // (chapter files may have registered their own entries before this file runs)
    cellarTutorial: F => F.f("pro.l2"), undercroftDeep: F => F.f("pro.lessons"), packChoice: F => F.f("pro.packed"), raidStart: () => true,
    dunesArrival: F => F.f("ch1.start"), karvanAmbush: F => F.f("ci.karvan"), duskWhisperer: F => F.f("l1.done") || !F.f("dunes.dusk"),
    k1Cage: F => F.f("k1.done"), duneBearer: F => F.f("bear.done"), hollowDoor: F => F.f("hol.seen"), boatToIxcalo: F => F.f("m1.done"),
  });
  // the shared rumour tables use town keys; the world uses these region ids
  S.townOf = { orun: "orun", sandpiper: "sandpiper", amberWells: "amber", saltgate: "saltgate" };
})();
