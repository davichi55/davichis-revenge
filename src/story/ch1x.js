// CH1-EXPAND: the extra maps of chapter 1 (around the Whisperglass Dunes) and chapter 2 (off Amber Wells Basin).
// World files: src/world/regions/m1x/*.js. Nothing here blocks or skips a main beat: the new exits open once Sandpiper Rest has been reached (flag sp.seen), everything else is optional.
// Ids: glassRidges hummingHollow caravanGraveyard dryWaystation oasisOutskirts (ch1), redMesaSteps saltpanWorks (ch2). Quests: bell (Hassa), tally (Ossan), adders (reed keeper).
"use strict";
(function () {
  const S = window.Story, D = window.Data, Q = Object.assign, R = D.REGIONS, yes = () => true;
  const person = (id, name, fb) => UI.person(id, name, ["assets/portraits/" + id + ".png", fb || "assets/face_scholar.png"]);
  person("hassa", "Hassa", "assets/face_innkeeper.png"); person("ossan", "Ossan", "assets/face_merchant.png"); person("reedkeeper", "Reed keeper", "assets/face_merchant.png");
  const T = (id, o) => { S.talk[id] = Q(S.talk[id] || {}, o); };
  const hero = t => ["hero", "(" + t + ")"];

  // ---------- the dusk hound roams the dunes and these maps (flow.js F.enter rolls the dusk once per visit to the area) ----------
  S.duskSet = { dunes: 1, glassRidges: 1, caravanGraveyard: 1, oasisOutskirts: 1 };
  S.trigger["ch1x.wait"] = async F => { await UI.say([["hero", "(Sandpiper Rest first. Everything out here can wait until I have a roof.)"]]); };
  S.trigger["cistern.gateSealed"] = async F => { F.sfx("clang"); await UI.say([["hero", "(Green bronze, bolted from the far side. Whoever bolted it is still out there.)"]]); };   // north gate of the cistern, from inside, before Karvan falls

  // ---------- quests and rumours ----------
  Q(D.QUESTS, {
    bell: { t: "The Tuning Bell", steps: ["Hassa in Sandpiper Rest lost her husband's lead bell somewhere on the Humming Ridges, north of the dunes. Find it: west of the ring of singing stones, by a lone cairn.", "Bring the bell back to Hassa in Sandpiper Rest."] },
    tally: { t: "The Dead Man's Tally", steps: ["Old Ossan wants his dead partner's strongbox from the Caravan Graveyard, south-west of the dunes. Jackals keep the place. Brem's wagon had a red cover with a sun on it.", "Bring the strongbox back to Ossan in Sandpiper Rest."] },
    adders: { t: "Adders in the Reeds", steps: ["The reed keeper at the Sandpiper Oasis wants three Glass Adders out of the reed beds (0/3).", "Go back to the reed keeper."] },
  });
  D.RUMOURS.sandpiper.push(
    "\"North of the dunes the glass hums a different note on every ridge. Walk it at noon and you can hear which way the wind will turn.\"",
    "\"The wagons that went into the white bed south-west of here never came out. The jackals keep the rent.\"",
    "\"A reed keeper out at the oasis says the mud is full of pearls, if you do not mind the adders.\"");

  // ---------- region metadata (arena, music, table; npcs / exits / things feed the fallback hub) ----------
  const thing = (id, label, kind, cond) => [id, label, cond || yes, kind];
  Q(R, {
    glassRidges: { n: "The Humming Ridges", bg: "bg_desert", arena: "dunes", music: "dunes", table: "dunes", fields: true, overland: true, npcs: [["singingStone", "A humming stone"]],
      exits: [["dunes", "South to the Whisperglass Dunes", yes], ["oasisOutskirts", "East along the track to the oasis", yes], ["hummingHollow", "The cave under the north-east massif", yes]],
      things: [thing("ridgeChest1", "A chest wedged under the rock", "chest"), thing("ridgeChest2", "A cache in the south-west rocks", "chest"), thing("ridgeVials", "Humming glass sand", "gather", s => !s.f["g.vials"]), thing("lostBell", "Something bright in the glass", "gather", s => s.f["bell.started"] && !s.f["bell.got"]), thing("duskWhisperer", "A whispering shape on a ridge", "trigger", s => s.f["dunes.dusk"] && !s.f["l1.done"])], autos: [] },
    hummingHollow: { n: "Hollow of the Humming Glass", bg: "bg_ruins", arena: "dunes", music: "dungeon", table: "dunes", fields: true, dungeon: true, npcs: [["humTablet", "A builder tablet"]],
      exits: [["glassRidges", "Back out to the ridges", yes]], things: [thing("hollowGlassChest", "A chest in the east chamber", "chest"), thing("emberVein", "A coal inside the glass", "gather", s => !s.f["g.emberVein"])] },
    caravanGraveyard: { n: "Caravan Graveyard", bg: "bg_desert", arena: "dunes", music: "desert", table: "dunes", fields: true, overland: true, npcs: [["tallyBoard", "A tally board"]],
      exits: [["dunes", "North to the Whisperglass Dunes", yes], ["dryWaystation", "East along the old road", yes]],
      things: [thing("graveChest1", "A chest in the north-east rocks", "chest"), thing("graveChest2", "A chest by a dead cart", "chest"), thing("shardHeap", "A great shell under a wagon", "gather", s => !s.f["g.shardHeap"]), thing("tallyBox", "A strongbox under a wagon", "gather", s => s.f["tally.started"] && !s.f["tally.got"]), thing("duskWhisperer", "A whispering shape between the wagons", "trigger", s => s.f["dunes.dusk"] && !s.f["l1.done"])] },
    dryWaystation: { n: "The Dry Waystation", bg: "bg_ruins", arena: "ruins", music: "ruins", table: "cistern", fields: true, dungeon: true, npcs: [["waystationLedger", "The keeper's desk"], ["waystationTablet", "A builder tablet"]],
      exits: [["caravanGraveyard", "Back west to the Caravan Graveyard", yes]], things: [thing("waystationChest1", "A chest in the north cell", "chest"), thing("waystationChest2", "A chest in the south cell", "chest")] },
    oasisOutskirts: { n: "Sandpiper Oasis", bg: "bg_desert", arena: "basin", music: "oasis", table: "dunes", fields: true, overland: true, npcs: [["reedKeeper", "The reed keeper"]],
      exits: [["sandpiper", "West to Sandpiper Rest", yes], ["dunes", "South to the Whisperglass Dunes", yes], ["glassRidges", "East along the track to the ridges", yes]],
      things: [thing("oasisChest", "A reed basket by the rocks", "chest"), thing("pearlMussels", "Mussels in the shallows", "gather", s => s.f["adders.started"] && !s.f["g.mussels"]), thing("duskWhisperer", "A whispering shape by the water", "trigger", s => s.f["dunes.dusk"] && !s.f["l1.done"])] },
    redMesaSteps: { n: "Red Mesa Steps", bg: "bg_desert", arena: "basin", music: "desert", table: "basin", fields: true, overland: true, npcs: [["surveyStone", "A builder survey stone"]],
      exits: [["basin", "North to the Amber Wells Basin", yes]], things: [thing("mesaChest1", "A chest on the east terrace", "chest"), thing("mesaChest2", "A chest on the west terrace", "chest"), thing("scorpShed", "A scorpion's shed shell", "gather", s => !s.f["g.scorpShed"])] },
    saltpanWorks: { n: "Saltpan Works", bg: "bg_desert", arena: "basin", music: "desert", table: "basin", fields: true, overland: true, npcs: [["panLedger", "The pan-keeper's desk"]],
      exits: [["basin", "South to the Amber Wells Basin", yes]], things: [thing("saltChest1", "A chest in the far pans", "chest"), thing("saltChest2", "A chest by the huts", "chest"), thing("saltRake", "A fresh crust on the pan", "gather", s => !s.f["g.saltRake"])] },
  });
  // the old maps get their new doors in the fallback hub too
  const open = s => s.f["sp.seen"];
  R.dunes.exits.push(["glassRidges", "North into the Humming Ridges", open], ["caravanGraveyard", "South-west to the Caravan Graveyard", open], ["oasisOutskirts", "North-east to the oasis", open]);
  R.sandpiper.exits.push(["oasisOutskirts", "Out the east side to the oasis", yes]);
  R.basin.exits.push(["redMesaSteps", "South-west to the Red Mesa Steps", yes], ["saltpanWorks", "North-west to the Saltpan Works", yes]);

  // ---------- arrival lines (once each) ----------
  const arrive = (key, lines, then) => async F => { if (F.f(key)) return; F.set(key); await UI.say(lines.map(t => ["narr", t])); if (then) await then(F); };
  Q(S.trigger, {
    ridgesArrive: arrive("x.ridges", ["North of the dunes the sand turns to glass in long bright rows. The hum is louder here, a chord of a dozen notes that never settle."]),
    graveyardArrive: arrive("x.grave", ["A dry white bed, and on it wagons: dozens, spokes in the air, covers long gone. Nothing here has moved in a very long time. Something has been eating well."]),
    waystationEnter: arrive("x.waystation", ["A courtyard half under the sand. The well in the middle is dry to the bottom, and the stone around it is worn smooth by hands."]),
    mesaArrive: arrive("x.mesa", ["Red steps, one on top of the next, climbing away in terraces. Nothing on them casts a shadow longer than a spear."]),
    saltpanArrive: arrive("x.saltpan", ["Rows of white pans under a white sky. The dike crunches like old bread. Whatever was salted here is long gone."]),
  });
  S.done = Q(S.done || {}, { ridgesArrive: F => F.f("x.ridges"), graveyardArrive: F => F.f("x.grave"), waystationEnter: F => F.f("x.waystation"), mesaArrive: F => F.f("x.mesa"), saltpanArrive: F => F.f("x.saltpan") });

  // ---------- chests ----------
  const chest = (id, flag, text, gold, items) => { S.chest[id] = async F => { if (F.f(flag)) return false; F.set(flag); F.sfx("door"); if (gold) F.gold(gold); (items || []).forEach(([k, n]) => F.give(k, n)); await UI.say([["narr", text]]); }; };
  chest("ridgeChest1", "c.ridge1", "A traveller's cache wedged under a rock and wrapped in oilcloth. Two flasks and a few kakal, still dry.", 30, [["sunwater", 2]]);
  chest("ridgeChest2", "c.ridge2", "A bundle in a hollow of the south-west rocks: three flasks and two vials of humming sand, stoppered with wax.", 0, [["sunwater", 3], ["sandGlass", 2]]);
  chest("hollowGlassChest", "c.hollowglass", "A chest set into the glass floor, the lid fused shut and cracked open by the heat of your hands. Kakal, flasks, and sand that still hums.", 35, [["sunwater", 2], ["sandGlass", 3]]);
  chest("graveChest1", "c.grave1", "A driver's chest under a dead axle. Inside, wrapped in a shirt: kakal, and two small odd things he must have thought were lucky.", 45, [["curio", 2]]);
  chest("graveChest2", "c.grave2", "A medicine box on a dead cart. Two flasks, and a pair of adder fangs the carter kept as a charm.", 20, [["sunwater", 2], ["adderFang", 2]]);
  chest("waystationChest1", "c.way1", "The keeper's strongbox in the north cell. Three flasks and a purse that was never sent anywhere.", 60, [["sunwater", 3]]);
  chest("waystationChest2", "c.way2", "A store-chest in the south cell. Damp moss from the dry well, two flasks, and a few coins at the bottom.", 25, [["sunwater", 2], ["mossClump", 2]]);
  chest("oasisChest", "c.oasis", "A reed basket under the rocks by the pond. Someone saved kakal in it and flasks, and never came back for them.", 35, [["sunwater", 2]]);
  chest("mesaChest1", "c.mesa1", "A chest on the east terrace, red with dust. Kakal and two flasks.", 55, [["sunwater", 2]]);
  chest("mesaChest2", "c.mesa2", "A surveyor's chest on the west terrace: kakal and two big scorpion plates, the kind a mason pays well for.", 40, [["scorpPlate", 2]]);
  chest("saltChest1", "c.salt1", "A pan-keeper's chest in the far pans, crusted white. Kakal, and two lumps of salt crust.", 60, [["saltCrust", 2]]);
  chest("saltChest2", "c.salt2", "A chest by the huts. Three flasks and a little kakal, all stiff with salt.", 30, [["sunwater", 3]]);

  // ---------- gathering (skill-book materials first: Ram Strike, Kindle and Soak each get a head start here; the full ten still come from the quarry, the flats and the Silt River) ----------
  const gather = (id, flag, sfx, mat, n, text, toast) => { S.gather[id] = async F => { F.set(flag); F.give(mat, n); F.sfx(sfx); await UI.say([["narr", text]]); if (toast && F.matCount(mat) >= toast[0]) UI.toast(toast[1]); }; };
  gather("emberVein", "g.emberVein", "fire", "cinderglassEmber", 3, "A seam of glass with a coal sealed inside it, still orange after who knows how many years. You chip out three embers and they sit warm in your palm.", [10, "New in the Skill Book: Kindle."]);
  gather("shardHeap", "g.shardHeap", "coin", "duneclawShard", 4, "Under a wagon bed lies the shell of a scorpion the size of a door, picked clean. Its plates break off in clean, hard shards. You take four.", [10, "New in the Skill Book: Ram Strike."]);
  gather("ridgeVials", "g.vials", "coin", "sandGlass", 4, "You kneel on the ridge and fill four little vials from the humming sand. Held to the ear, each one keeps a note.");
  gather("scorpShed", "g.scorpShed", "coin", "scorpPlate", 2, "A scorpion's shed shell, whole, on a warm ledge: two plates as long as your forearm.");
  gather("saltRake", "g.saltRake", "coin", "saltCrust", 4, "You rake a fresh grey crust off the pan with the flat of a spade. Four good lumps.");
  S.gather.pearlMussels = async F => {
    F.set("g.mussels"); F.give("riverPearl", 3); F.sfx("coin");
    await UI.say([["narr", "The mussels in the shallows are shut tight and heavy. Three of them hold a pearl, small and a little warm."]]);
    if (F.matCount("riverPearl") >= 10) UI.toast("New in the Skill Book: Soak.");
  };

  // ---------- lore spots ----------
  const lore = (lines) => async F => { await UI.say(lines.map(l => (Array.isArray(l) ? l : ["narr", l]))); };
  T("glassRidges", { singingStone: lore(["A standing stone, warm in the sun, humming under your palm. Words are cut into it, worn almost smooth:", "\"We set the stones to sing so that no one would walk the glass in silence. The wind sings. The stone remembers.\"", hero("It is the same note as the sand. Only slower.")]) });
  T("hummingHollow", { humTablet: lore(["A tablet in the north chamber, the letters filled with pale glass:", "\"Here the fire went into the sand and the sand kept it. Take what the glass has kept. Leave the rest warm.\""]) });
  T("caravanGraveyard", { tallyBoard: lore(["A plank nailed to a dead wagon, covered in tally marks: forty-one strokes in five-bar bundles. Under the last bundle someone scratched with a knife:", "\"WAITED FOR THE WELL TO FILL. IT DID NOT.\"", hero("Forty-one wagons. East, the old road goes on. Toward what?")]) });
  T("dryWaystation", {
    waystationTablet: lore(["A tablet by the hall door, the old builders' hand:", "\"We built this house for those who walk. Drink, rest, and leave the well as full as you found it.\""]),
    waystationLedger: lore(["A keeper's desk, the ledger still open. The last page, in a tired hand:", "\"Day 31. The well is dry. Eleven wagons in the yard, forty-one mouths. I opened the pipe to the Burnt Gate cistern by hand, as the tablet says. Nothing came. Someone has closed it from the other end.\"", "\"Day 33. They have stopped asking. The jackals have not.\"", hero("Closed from the other end. Not a storm. Not luck.")]),
  });
  T("redMesaSteps", { surveyStone: lore(["A flat stone set into the ledge, cut with a ring of marks and a line of tiny wells:", "\"From this step we measured the basin: eight wells, one sky. The wells belong to whoever keeps them clean.\""]) });
  T("saltpanWorks", { panLedger: lore(["A pan-keeper's desk under a rotted awning, the books weighted with salt. The last entries are in a clerk's neat hand, not the keeper's:", "\"Pan 4: yield nil. Pan 5: yield nil. Works closed by order of the Collection Office. Workers reassigned.\"", hero("Reassigned to where? The page does not say.")]) });

  // ---------- side quests ----------
  // The Tuning Bell: Hassa (Sandpiper Rest) -> the bell lies in the glass of the Humming Ridges
  T("sandpiper", {
    hassa: async F => {
      const st = F.qstep("bell");
      if (st === "done") { G.flags.hassaTurn = ((G.flags.hassaTurn || 0) + 1) % 2; await S.rumourIdx(F, "sandpiper", G.flags.hassaTurn ? 3 : 5, "hassa"); return; }
      if (st === undefined) {
        await UI.say([["hassa", "Forgive me. You walk like someone who has gone a long way and means to go further. Do you pass the north ridges?"], ["hero", "Maybe. Why?"],
          ["hassa", "My Dumar walked the lead camel. He tuned a bell to the ridge hum, so the whole string kept step, forty beasts in one stride. The storm took him, and the bell with him."], ["hassa", "The ridges can keep him. I would like the bell. A drover swore he heard it ring once, west of the ring of singing stones, out by the lone cairn."], ["hero", "I'll look."]]);
        F.set("bell.started"); F.quest("bell", 0); return;
      }
      if (!F.f("bell.got")) { await UI.say([["hassa", "Glass hides things. Go to the ring of singing stones and walk west to the lone cairn. Listen for the note."]]); return; }
      await UI.say([["hero", "(The bell rings once in the satchel, all by itself.)"], ["hassa", "...That is his note. Hm."], ["hassa", "Take this. He would say it is too much. He said that about everything I ever gave anyone."]]);
      F.gold(60); F.give("sunwater", 2); F.questDone("bell");
    },
    // The Dead Man's Tally: Ossan wants his partner's strongbox from the Caravan Graveyard (jackals guard it)
    ossan: async F => {
      const st = F.qstep("tally");
      if (st === "done") { await S.rumourIdx(F, "sandpiper", 4, "ossan"); return; }
      if (st === undefined) {
        await UI.say([["ossan", "Sit down, you make my back hurt standing like that. Ossan. I ran salt north with a man named Brem for thirty years."], ["ossan", "Three years gone he took the last wagon out through the white bed, south-west of here. They say the waystation well went dry and nobody walked out."],
          ["ossan", "His strongbox has the tally. Every wagon, every debt, mine and his. I cannot walk that far, and the jackals keep the place."], ["hero", "What do I get?"], ["ossan", "The truth about thirty years of salt prices. And some kakal. I am not sentimental."],
          ["ossan", "His wagon had a red cover with a sun on it. He painted that sun on everything he owned, even me once, when I fell asleep. And he hid things under things."]]);
        F.set("tally.started"); F.quest("tally", 0); return;
      }
      if (!F.f("tally.got")) { await UI.say([["ossan", "The red cover with the sun. The sand eats the rest, but that red stays. Under it, he would have said. Brem put everything under something."]]); return; }
      await UI.say([["ossan", "Huh. The box. ...He lied about the price of salt, you know. For thirty years, by exactly one kakal a sack. The old thief."], ["ossan", "Here. Spend it on something that is not a flask. ...Spend it on a flask, then."]]);
      F.gold(80); F.give("sunwater", 2); F.questDone("tally");
    },
  });
  S.gather.tallyBox = async F => {
    await S.stage(async c => {
      const h = c.hero;
      await c.say([["narr", "Under the wagon bed, a strongbox wedged in the sand. Something growls in the shade. Then something else."]]);
      c.sfx("growl");
      c.actor("j1", { art: "sandstitchJackal", x: h.x + 44, y: h.y - 22, alpha: 0 }); c.actor("j2", { art: "sandstitchJackal", x: h.x + 76, y: h.y + 4, alpha: 0, flip: true });
      await Promise.all([c.anim("j1", "fadeIn", { ms: 200 }), c.anim("j2", "fadeIn", { ms: 350 })]);
      c.emote("hero", "!"); c.fx("dust", h.x + 60, h.y - 8, { n: 8 }); c.shake(2, 250);
      await Promise.all([c.anim("j1", "lunge", { dx: -26 }), c.anim("j2", "lunge", { dx: -26 })]);
      await c.wait(300);
    });
    const res = await F.fight([F.mkEnemy("sandstitchJackal", 4, " A"), F.mkEnemy("sandstitchJackal", 4, " B")], { intro: "Jackals have made a den under the wagon!" });
    if (res !== "win") return false;
    F.set("tally.got"); F.quest("tally", 1); F.sfx("door");
    await UI.say([["narr", "The strongbox is lighter than it looks. Inside: a tally book tied in string, and one very old kakal coin, bent double."]]);
  };
  S.gather.lostBell = async F => {
    F.set("bell.got"); F.quest("bell", 1); F.sfx("coin");
    await S.stage(async c => {
      const h = c.hero;
      c.sfx("chime"); c.fx("glow", h.x, h.y - 30, { color: 0x9fe8ff, n: 3 });
      await c.say([["narr", "Under a skin of glass, a small brass bell gone green. When you lift it, the whole ridge answers on one thin note."]]);
      c.sfx("bell"); c.shake(1.5, 900); c.fx("sparkle", h.x, h.y - 20, { r: 130, ms: 2200, color: 0xbfffee }); c.tint("#bfffee", 0.12, 400);
      await c.wait(1300);
      await c.say([["hero", "(He tuned it to this. Of course he did.)"]]);
    });
  };
  // Adders in the Reeds: the reed keeper of the oasis opens the pearl shallows
  T("oasisOutskirts", {
    reedKeeper: async F => {
      const st = F.qstep("adders");
      if (st === "done") { await UI.say([["reedkeeper", "The shallows are quiet. The goats are fat. Go on, you know the way."]]); return; }
      if (st === undefined) {
        await UI.say([["reedkeeper", "Quiet. Walk softly, they sleep in the reeds. Glass Adders, three of them this month, and my goats will not go to the water."], ["reedkeeper", "Kill three and the shallows are yours. There are mussels in there that are not only mussels, if you take my meaning."],
          ["hero", "Pearls."], ["reedkeeper", "I said nothing about pearls."]]);
        F.set("adders.started"); F.quest("adders", 0); G.flags.addersBase = G.kills.glassAdder || 0; return;
      }
      const n = (G.kills.glassAdder || 0) - (G.flags.addersBase || 0);
      if (n < 3) { await UI.say([["reedkeeper", `${Math.max(0, n)} of 3. Look low, where the reeds are thickest. They do not hiss; that is the trouble.`]]); return; }
      await UI.say([["reedkeeper", "Three. Good. ...The goats are not clapping, but they would."]]);
      F.gold(45); F.give("sunwater", 1); F.questDone("adders");
    },
  });
})();
