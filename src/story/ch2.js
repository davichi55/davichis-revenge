// Chapter 2: Amber Wells, the Menagerie Wagon, Scorpion Quarry, Cinderglass Flats, the Bone Maze (K1), Saltgate, the Dune Bearer, the boat.
"use strict";
(function () {
  const S = window.Story;

  // ---------- Amber Wells ----------
  S.trigger["amber.arrive"] = async F => {
    if (F.f("am.seen")) return; F.set("am.seen");
    F.music("story");
    await UI.card({ image: "assets/bg_desert.png", big: "Chapter 2", text: "Field Research" });
    F.music("oasis");
    await UI.say([["narr", "Amber Wells: an oasis town of orange brick, date palms and caravan guilds. The noise of the market rolls over you like warm water."]]);
    await F.idleBanter();
    F.quest("m_research", 0);
    UI.toast("Dunmar said: look for a wagon.");
  };
  S.talk.amberWells = {
    innkeeper: async F => {
      if (F.f("am.wagon") && !F.f("am.letter")) {
        F.set("am.letter");
        await UI.say([["innkeeper", "Before you ask: yes, there is a letter. Green wax. They all seem to find me."]]);
        await F.letter("the green seal", ["\"Dunmar is safe, I hear. Good. Now to work.\"", "\"East of Saltgate there is a builder ruin called the Hollow of the Sky-Stone. A Titan sleeps in it. Record how it fights: every blow, every move.\"", "\"Train first. Do not hurry. I will know when you are ready. - I.\""]);
        F.quest("m_research", 1);
      } else await UI.say([["innkeeper", "The Seventh Date. Date wine, date bread, and beds with real linen."]]);
      await F.inn("amber");
    },
    merchant: async F => { await UI.say([["merchant", "Full stock for a long road! Bombs, tonics, and a weather-proof cloak if you want one."]]); await F.shop("amber"); },
    gossip: async F => S.rumourTalk(F, "amber", "gossip"),
    dunmar: async F => {
      if (!F.f("am.wagon")) {
        F.set("am.wagon");
        // the camera finds the wagon first: cages rattle, eyes glint behind the bars, then Dunmar spots his apprentice
        await S.stage(async c => {
          await c.pan(1150, 700, 900);
          c.sfx("creak"); c.shake(1.5, 500);
          c.fx("sparkle", 1128, 742, { r: 26, ms: 2600, color: 0xffe08a }); c.fx("sparkle", 1176, 750, { r: 26, ms: 2600, color: 0xffe08a });
          await c.say([["narr", "At the edge of the market stands a covered wagon painted with faded stars. Cages hang inside, and eyes glint behind the bars."]]);
          c.follow(); c.emote("oldDunmar", "!");
          await c.wait(500);
          await c.say([
            ["dunmar", "Lad! You came through. Look at you, still in that tin."],
            ["hero", "Dunmar. The others..."],
            ["dunmar", "Taken. Eight pens. I got these six cages out on the back stair. This is the Menagerie Wagon now. It parks wherever there is a safe town."],
            ["dunmar", "Ithiel moved half of the cages out of the vault last week. Never said why. Never asked me, either. Strange old goat."],
          ]);
          await F.banter("wagon");
          await c.say([
            ["dunmar", "The cells here open with keys, old keys from the old dungeons. Bring me one and I can free one of my cages. Their creatures are as good as your own."],
            ["dunmar", "There's a story about a bull in the walls under this oasis. Old Mazeheart waits down the stair under the rib arch in the north-east corner of town, if you dare."],
          ]);
        });
        UI.toast("The Menagerie Wagon is here.");
      } else if (F.item("keyK1")) {
        await UI.say([["dunmar", "A bone key! Look at it. Cold as a grave. Right, hold the lantern."]]);
        F.take("keyK1", 1); F.set("k1.freed"); F.questDone("bellow");
        const lv = Math.max(3, F.avgLevel() - 1), b = F.mk("bramblehoof", lv); G.collection.push(b); G.best.bramblehoof = { seen: 1, beaten: 0 };
        // Danny 2026-10-31: he should be there in the world, not only in the text: the cage rattles, he steps out of the Menagerie Wagon (menagerieWagon at 1150,780) and comes to you
        await Cinema.stage(async c => {
          await c.cageOut("bh", "bramblehoof", { fx: "leaves", desc: [["narr", "A cage of bark and moss swings open. An elk-bull the colour of old wood steps down, and the moss on its antlers is blooming."]] });
          await c.anim("bh", "bow");
          await c.say([["bramblehoof", "Bark remembers. You opened the door, small iron one. ...I will walk with you, when you need a horn."],
            ["dunmar", "Bramblehoof, a forest guardian. The wild clans lost him to the lab. Freeing him will not be forgotten."]]);
          await c.cageBack("bh");   // into the wagon's shade, ready when you call him
        });
      } else await UI.say([["dunmar", F.f("k1.freed") ? "Bramblehoof is out and grumbling about the sand. Good. More keys will turn up, lad." : "Any keys yet? No? Well. The oasis is full of stories."]]);
    },
    pell: async F => {
      const st = F.qstep("debt");
      if (st === "done") { await UI.say([["pell", "My benefactor! Now I owe only to the lamps."]]); return; }
      if (st === undefined) {
        await UI.say([["pell", "Psst. You, in the armour. You look like someone with money and no questions."], ["pell", "I owe forty to the date-seller and twenty to the ink-maker. They want my hide. Pay them for me, sixty kakal, and I'll give you my regalia. It is my only good robe set."]]);
        F.quest("debt", 1);
      }
      const i = await F.ask("Pay Pell's debts (60 kakal)?", [{ label: "Pay 60 kakal", disabled: G.gold < 60 }, { label: "Not now" }]);
      if (i === 0) {
        G.gold -= 60; F.questDone("debt"); F.giveGear("G34", 3); F.sfx("coin");
        await UI.say([["pell", "Bless you! The best-cut red robe in the city is yours. Pieces and all. I'll wear brown, like a mouse."]]);
      }
    },
    foreman: async F => {
      const st = F.qstep("shard");
      if (st === "done") { await UI.say([["foreman", "The roads are quiet. Quiet roads, quiet quarries."]]); return; }
      if (st === undefined) {
        await UI.say([["foreman", "Dune Scorpion Knights on the Quarry road, three of them. Clear them out and I'll give you four Duneclaw Shards. Hard as a mason's chisel; it can be made into a ram boot."]]);
        F.quest("shard", 0); G.flags.shardBase = G.kills.duneScorpionKnight || 0; return;
      }
      const n = (G.kills.duneScorpionKnight || 0) - (G.flags.shardBase || 0);
      if (n >= 3) { await UI.say([["foreman", "Three Knights down? You earned this."]]); F.give("duneclawShard", 4); F.gold(80); F.questDone("shard"); }
      else await UI.say([["foreman", `${Math.max(0, n)} of 3 Dune Scorpion Knights so far. They roam the basin road.`]]);
    },
    mazeheart: async F => {
      if (!F.f("mazeheart.talked")) {
        F.set("mazeheart.talked"); F.quest("bellow", 0);
        await UI.say([["mazeheart", "Old bones hear old bones. There is a labyrinth under the oasis wall, and in it a bull bellows when the wind is right."], ["mazeheart", "The bellowing leads on. Follow the louder side, and the maze lets you through."]]);
        UI.toast("The Bone Maze is open.");
      } else await UI.say([["mazeheart", "Follow the bellowing. Louder is closer."]]);
    },
  };

  // ---------- quarry, flats ----------
  S.chest["quarry.chest"] = async F => S.gearChest(F, "quarry.chest", "G20");
  S.gather["quarry.shards"] = async F => { F.set("g.quarry"); F.give("duneclawShard", 6); F.sfx("coin"); await UI.say([["narr", "A shard pile at the bottom of the pit. You fill your satchel with Duneclaw Shards."]]); if (F.matCount("duneclawShard") >= 10) UI.toast("New in the Skill Book: Ram Strike."); };
  S.chest["flats.chest"] = async F => S.gearChest(F, "flats.chest", "G12");
  S.gather["flats.embers"] = async F => { F.set("g.flats"); F.give("cinderglassEmber", 10); F.sfx("fire"); await UI.say([["narr", "You rake the fire-pits with a bone ladle. Ten Cinderglass Embers glow in the cold sand."]]); UI.toast("New in the Skill Book: Kindle."); };
  S.gather["flats.plume"] = async F => { F.set("g.plume"); F.give("cinderPlume", 5); await UI.say([["narr", "A warm feather by the water. Then another. Five Cinder Plumes."]]); };
  S.trigger["flats.pool"] = async F => {
    if (F.f("pool.seen")) { await UI.say([["narr", "The pool is still. The fire-fox sleeps."]]); return; }
    F.set("pool.seen"); F.give("cinderPlume", 5);
    await UI.say([["narr", "A hidden pool, warm as milk. At the bottom, curled in its own tails, a fox of red fire sleeps."], ["hero", "(Not mine to take. Not mine to wake.)"], ["narr", "Five more Cinder Plumes drift to the surface. You note the fox in the Journal and leave quietly."]]);
  };

  // ---------- the Bone Maze (K1) ----------
  // the Maze Guardian is beaten: it staggers, crumbles into horns and dust, and the camera finds the chest at the back of the cell. lines = what is said afterwards
  S.mazeGuardianFalls = async (F, lines) => {
    await S.stage(async c => {
      const h = c.hero;
      c.actor("mg", { art: "boneBullCalf", x: h.x - 10, y: h.y - 96, h: 120 });
      await c.wait(300);
      c.sfx("roar"); await c.anim("mg", "shake", { ms: 500 });
      await c.anim("mg", "fall", { dir: "left", ms: 600 });
      c.sfx("rockFall"); c.shake(4, 700); c.fx("dust", h.x - 10, h.y - 96, { n: 22, scale: 1.8, color: 0xd8d0b8 });
      await c.anim("mg", "fadeOut", { ms: 900 });
      await c.pan(h.x + 70, h.y + 10, 900);
      c.fx("glow", h.x + 70, h.y + 8, { color: 0xffd36a, ms: 2000 }); c.fx("sparkle", h.x + 70, h.y - 6, { r: 24, ms: 1800 });
      await c.say(lines);
      c.follow();
    });
  };
  S.trigger.mazeDeep = async F => {
    const JUNCTIONS = [
      ["Three passages of pale bone. A bellow rolls out of the LEFT one, loud, shaking dust from the roof.", "left"],
      ["A fork. The bellowing is behind the RIGHT wall now, so close you feel it in your teeth.", "right"],
      ["A last hall of ribs. The bellow comes from straight AHEAD, down the middle aisle.", "mid"],
    ];
    for (let i = 0; i < JUNCTIONS.length; i++) {
      const [text, good] = JUNCTIONS[i];
      await UI.say([["narr", text]]);
      const pick = await F.ask("Which way?", [{ label: "Left" }, { label: "Middle" }, { label: "Right" }]);
      const chosen = ["left", "mid", "right"][pick];
      if (chosen !== good) {
        await UI.say([["narr", "Dead end. The bones close behind you with a click, and something wakes."]]);
        const foes = F.rollEncounter("boneMaze"); if (foes) await F.fight(foes, { bg: "boneMaze" });
        await UI.say([["narr", "You wander back to the first junction. The bellow starts again."]]); i = -1; continue;
      }
      await UI.say([["narr", "The bellow grows. You keep going."]]);
    }
    await UI.say([["narr", "The deepest cell. A ring of bone, and a guardian rising from a pile of horns: a great skull on four legs, stamping."]]);
    await Cinema.boss({ id: "mazeGuardian", name: "The Maze Guardian", title: "Keeper of the Bone Maze", bg: "boneMaze" });
    const res = await F.boss([F.mkEnemy("mazeGuardian", 8), F.mkEnemy("mazeBat", 7, " B")], { bg: "boneMaze", intro: "The Maze's guardian lowers its horns!" });
    if (res !== "win") return;
    F.set("k1.done"); F.quest("bellow", 1);
    await S.mazeGuardianFalls(F, [["narr", "The guardian crumbles into horns. At the back of the cell, a chest."]]);
  };
  S.chest["maze.chest"] = async F => {
    if (!F.f("k1.key")) { F.set("k1.key"); F.give("keyK1", 1); }
    await S.gearChest(F, "maze.chest", "G4", async () => { if (F.item("keyK1") && !F.f("k1.freed")) await UI.say([["narr", "A bone key lies on top of the chest: the Bone Maze key. Dunmar's wagon will know what to do with it."]]); });
  };

  // ---------- Saltgate ----------
  S.trigger["saltgate.arrive"] = async F => {
    if (!F.f("sg.seen")) {
      F.set("sg.seen"); F.music("town");
      await UI.say([["narr", "Saltgate: a walled harbour city, white lighthouses, smugglers' coves. Gulls scream over the north pier, where the tax ships dock and never unload."]]);
      if (Math.random() < 0.6) await F.idleBanter();
    }
    if (F.f("bear.done") && !F.f("sg.letter")) {
      F.set("sg.letter");
      await S.stage(async c => {
        const h = c.hero;
        c.actor("cour", { art: "npcHooded", x: h.x + 260, y: h.y + 8, alpha: 0 });
        await c.anim("cour", "fadeIn", { ms: 300 });
        await S.rush(c, "cour", h.x + 54, h.y + 4, 120);
        c.emote("hero", "?"); c.face("cour", "left");
        await c.say([["narr", "A courier in a grey hood waits at the gate. He puts a letter in your hand and is gone before you can ask."]]);
        c.sfx("paper"); c.fx("sparkle", h.x + 20, h.y - 30, { r: 14, ms: 700 });
        await c.anim("cour", "bow");
        c.walk("cour", h.x + 360, h.y - 70, 800); await c.wait(450);
        c.emote("hero", "!");
        await c.anim("cour", "fadeOut", { ms: 350 });
      });
      await F.letter("the green seal", ["\"Well done. The data is exactly what I needed.\"", "\"A friend will meet you on the far shore. Captain Brisk at the Saltgate dock will take you. Do not stop recording. - I.\""]);
      await UI.say([["hero", "(Exactly what he needed? ...For the research. Of course.)"]]);
      F.quest("m_boat", 0);
    }
  };
  S.talk.saltgate = {
    innkeeper: async F => { await UI.say([["innkeeper", "The Gull and Anchor. We keep quiet about who sleeps here."]]); await F.inn("saltgate"); },
    merchant: async F => { await UI.say([["merchant", "No questions about where it came from. Bombs at a discount, and I buy odd goods at a good price."]]); await F.shop("saltgate"); },
    gossip: async F => S.rumourTalk(F, "saltgate", "gossip"),
    kitemaker: async F => S.rumourTalk(F, "saltgate", "kitemaker", "My kites are in the wind. Come again."),
    captain: async F => {
      if (!F.f("bear.done")) { await UI.say([["captain", "Brisk's the name. Passengers to Ixcalo, no questions. ...Not tonight, though. The tide is wrong and the customs men are thick on the pier."], ["hero", "(The boat can wait. Ithiel's work first: the Hollow of the Sky-Stone.)"]]); return; }
      if (F.f("m1.done")) { await UI.say([["captain", "The boat's already sailed east, friend. Wait for the next tide. The jungle will keep."]]); return; }
      await UI.say([["captain", "Brisk's the name. Passengers to Ixcalo, no questions. The jungle shore, three nights' sail. You'd be the one with the green seal, then."]]);
      const i = await F.ask("Board the smuggler's boat now? The dunes will be days behind you.", [{ label: "Board now" }, { label: "Not yet, I have things to finish" }]);
      if (i === 0) await S.ending(F);
    },
  };

  // ---------- Hollow of the Sky-Stone and the Dune Bearer ----------
  S.trigger["hollow.enter"] = async F => {
    if (F.f("hol.seen")) return; F.set("hol.seen");
    F.music("ruins"); F.questDone("m_research"); F.quest("m_bearer", 0);
    await UI.say([["narr", "A sunken builder ruin: smooth black-and-gold stone, light-lines in the walls, a great door carved with a figure that holds a star."], ["hero", "(Ithiel wants this recorded. All of it.)"]]);
  };
  S.trigger["hollow.tablet"] = async F => {
    await UI.say([["narr", "Behind the door-frame lies a cracked shard of sky-stone, scored with builder script."],
      ["hero", "(It speaks of a falling star, held up by a giant who was told to keep it from the ground.)"],
      ["narr", F.f("lore.bearer") ? "That matches the rumour from Amber Wells: strike the stone twice in a breath and it splits." : "The script ends in a diagram: two hammers, one stone, a crack. A heavy blow, then another."]]);
    G.best.duneBearer = Object.assign(G.best.duneBearer || {}, { breakKnown: true }); F.set("lore.bearer");
    if (S.sunPiece) S.sunPiece(F, 1);   // chapter 11 lore: the first builder tablet of the Sun Eater
  };
  S.trigger.bearer = async F => {
    if (F.f("bear.done")) return;
    F.music("ruins");
    await S.stage(async c => {
      c.sfx("stoneGrind"); c.shake(3, 1500); c.fx("dust", 750, 700, { n: 18, scale: 1.8 });
      await c.wait(900);
      await c.pan(750, 235, 1100);
      c.actor("bearer", { art: "duneBearer", x: 750, y: 262, h: 190, alpha: 0 });
      c.light(750, 220, 200, 0.8); c.fx("glow", 750, 215, { color: 0x8fe8ff, n: 3 });
      await c.anim("bearer", "fadeIn", { ms: 1400 });
      await c.say([["narr", "The great door grinds open. A sunken chamber, a fallen star of stone hanging in the air on a giant's back. The giant kneels, and breathes."], ["hero", "(It has not moved in a thousand years. It is awake now.)"]]);
      c.sfx("rumble"); c.shake(2, 600); c.emote("hero", "!");
      await F.banter("bearer");
      await c.anim("bearer", "fadeOut", { ms: 500 });
      c.follow();
    });
    const intro = (Core.ENEMIES && Core.ENEMIES.duneBearer && Core.ENEMIES.duneBearer.intro) || "The sand rises. An ancient giant stands up, a cracked sky-stone strapped to its back.";
    await Cinema.boss({ id: "duneBearer", name: "The Dune Bearer", title: "Titan of the Whisperglass", bg: "ruins", music: "titan" });
    const res = await F.boss([F.mkEnemy("duneBearer", 10)], { intro, music: "titan", xpBonus: 1.0 });
    if (res !== "win") return;
    F.set("bear.done"); F.set("ch2.bearerDone"); F.questDone("m_bearer"); F.giveGear("G17", 3);
    G.best.duneBearer = Object.assign(G.best.duneBearer || {}, { breakKnown: true });
    await S.stage(async c => {
      c.actor("bearer", { art: "duneBearer", x: 750, y: 262, h: 190 });
      await c.pan(750, 235, 700);
      c.sfx("roar"); await c.anim("bearer", "bow"); c.shake(4, 900);
      c.sfx("quake"); c.flash("#fff2c8", 400); c.fx("explosion", 750, 215, { scale: 1.2, shake: 3 });
      await c.wait(700);
      await c.say([["narr", "The Bearer sinks to its knees. The sky-stone cracks in half and thuds into the sand. The giant looks at you, and for an instant its eyes are not angry. Then it is still."]]);
      await c.anim("bearer", "fadeOut", { ms: 900 });
      await c.say([["hero", "(I wrote down every blow. Ithiel will be pleased.)"]]);
      c.sfx("itemGet"); c.fx("sparkle", 750, 240, { r: 50, ms: 1800 });
      await c.say([["narr", "From the debris you take a gleaming mirror-disc set: Stoneguard of the Sun Gate."]]);
      c.follow();
    });
    F.save(true);
    F.go("saltgate", "back");
  };

  // ---------- the end of M1 ----------
  S.ending = async F => {
    F.set("m1.done"); F.questDone("m_boat");
    // out along the pier to the boat, the bell, the lines come off the bollards; then the screen goes dark
    await S.stage(async c => {
      c.sfx("shipBell");
      await Promise.all([c.walk("smuggler", 1440, 332, 1700), c.walk("hero", 1410, 336, 2000)]);
      c.face("hero", "right"); c.face("smuggler", "left");
      c.sfx("anchor"); c.fx("splash", 1500, 400, { scale: 1.4 }); c.emote("hero", "...");
      await c.pan(1450, 420, 1000);
      c.sfx("sail"); c.sfx("gull");
      await c.wait(900);
    });
    await UI.fade(true, 700); F.music("sad");
    await F.banter("boat");
    await UI.say([["hero", "(Behind me: a burning academy, eight empty pens, a Titan on its knees. Ahead: the empire.)"]]);
    F.save(true);
    if (S.begin && S.begin[3]) { await S.begin[3](F); return; }   // chapter 3 (src/story/ch3.js) plays the voyage, the title card and enters Creeping Shore
    await UI.card({ image: "assets/title.png", big: "To be continued", text: "in Chapter 3. Your game has been saved. Thank you for playing.", delay: 800 });
    await UI.fade(false, 300);
    F.save(true);
    if (Flow.toTitle) Flow.toTitle();
    throw new Flow.Interrupt("go");
  };
})();
