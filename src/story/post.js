// The epilogue on the pyramid roof, the credits, and the post-game: Starhaven, Starfall Isles, the Crater Garden, the Drowned Capital (L8), Lantern Deep (K9 and Bakuroth), the star-whale (L9),
// the Grand Cup, Story.begin["post"], Story.start[12], Story.finish[12] (owner: STORY-M5). Story.finish[11] lives in ch11.js (it sets epilogue.done and post.start for dbg.jump). Helpers: window.Story.m5 (ch10.js).
// Spec: ../game-mechanics/specs/M5.md (sections 7, 9, 10). Voices: ../game-mechanics/STORY_BIBLE.md. No "To be continued": the last card reads THE FIRST COUNT ENDS.
// Written in parts: A epilogue and hand-off; B Starhaven, data, banter; C Starfall Isles, Crater Garden, Drowned Capital; D Lantern Deep, the star-whale, the Grand Cup, the last gift, finish.
"use strict";
(function () {
  const S = window.Story, D = window.Data, Q = Object.assign, M3 = S.m3, M = S.m5, T = M.T, say = M.say, thought = M.thought, stage = M.stage, once = M.once, cycle = M.cycle, rel = M.rel;

  // ---------- 7 the epilogue: the roof at dawn (epilogueScene) ----------
  S.trigger.epilogueScene = async F => {
    if (F.f("epilogue.done")) { await thought("(The roof. The calendar in the floor, with its gap. The sun is up.)"); return; }
    M.ensure(F, 11); F.music("epilogue");
    const freed = [22, 23, 24].map(n => { const g = S.generalFor(n); return g ? g.id : null; }).filter(Boolean);
    await stage(async c => {
      c.tint("#f0a0b0", 0.12, 600);
      await c.say([["narr", "The shaft of light carries you up into the open air. The flat top of the Great Pyramid, at dawn: a huge sun calendar cut into the stone floor, a ring of small carved suns, a stone altar rim, and the whole city very far below. The sky is half dark and half pink, and the stars have not gone out."]]);
      const row = [["imela", "npcImela", -280, 30], ["ithiel", "npcIthielGrey", -240, -20], ["dunmar", "npcDunmar", -300, 60], ["saffa", "npcSaffa", -330, -40], ["hadiya", "npcHadiya", -350, 20], ["rhaz", "npcRhaz", -370, -10], ["peya", "npcPeya", -310, 80],
        ["corvin", "npcCorvin", -390, 40], ["brisk", "npcBrisk", -400, -30], ["kessa", "npcKessa", -420, 10], ["dorrin", "npcDorrin", -440, 50], ["mayle", "npcMayle", -450, -20]];
      row.forEach(([id, art, dx, dy]) => { const p = rel(c, dx, dy); c.actor(id, { art, x: p.x, y: p.y }); });
      G.party.slice(0, 3).forEach((u, i) => { const p = rel(c, -60 - i * 36, 30 - i * 24); c.actor("pc" + i, { art: u.art || u.id, x: p.x, y: p.y }); });
      freed.forEach((id, i) => { const p = rel(c, -520 - i * 40, 70 + i * 24); c.actor("fr" + i, { art: id, x: p.x, y: p.y, scale: 1.1 }); });
      await c.wait(500);
      await Promise.all(row.map(([id, , dx, dy], i) => c.walk(id, c.hero.x + 30 + (i % 4) * 60 + (dx > -330 ? 0 : 40), c.hero.y - 40 + Math.floor(i / 4) * 52, 2200 + i * 80)));
      await Promise.all(freed.map((id, i) => c.walk("fr" + i, c.hero.x - 160 - i * 34, c.hero.y + 90 + i * 12, 2400)));
      await c.say([["narr", "They climb up behind you in a procession that nobody organised, one after another, blinking: the Concord, the Flock, the resistance in their patched cloaks, your mother, a grey cloak, the creatures at your heel. On the steps far below, three shapes that are not collared stand together and watch."]]);
    }, { music: "epilogue" });
    await F.banter("roof");
    await stage(async c => {
      const p = rel(c, 90, 20); c.actor("ith", { art: "npcIthielGrey", x: p.x, y: p.y });
      c.tint("#f0a0b0", 0.12, 100);
      await c.walk("ith", p.x + 60, p.y + 10, 1000); c.emote("ith", "...");
      await c.say([["narr", "Ithiel kneels at the carved calendar, slowly, one knee and then the other, and runs his thumb along the ring of days. He counts under his breath. He counts twice."], ["mentor", "Three hundred and sixty-four. There is a day missing."]]);
      c.sfx("bell"); await c.wait(500);
      await c.say([["narr", "He stands, with a hand on the altar rim. Behind him, over the sea, the sky is turning to pink and gold. And the stars do not fade."], ["mentor", "It is today."]]);
      c.tint("#101830", 0.22, 1200); c.music("tension"); await c.wait(800);
      for (let i = 0; i < 3; i++) { c.flash("#cfe8ff", 260); c.fx("sparkle", c.hero.x + 180 + i * 60, c.hero.y - 220 + i * 18, { ms: 1800, r: 30 }); c.sfx("chime"); await c.wait(900); }
      await c.say([["narr", "One star falls. Then two. A line of light across the dawn, and another beside it, and another, as if a hand were dealing cards."], ["imela", "Those are not falling by chance."], ["mentor", "No."]]);
      await c.say([["mentor", "I was wrong about who, not about what."]]);
      c.fx("glow", c.hero.x, c.hero.y - 20, { ms: 2600, r: 40 });
      await c.say([["narr", "On the back of your gauntlet, where the satchel strap has rubbed the steel bright for years, a faint light wakes. A feather inside a star, in the colour of the falling stars, and in time with them."], ["hero", "(Father.)"]]);
      c.tint("#101830", 0, 1000); c.music("epilogue");
      const q = rel(c, 40, 10); c.actor("imela2", { art: "npcImela", x: q.x + 40, y: q.y });
      await c.say([["narr", "A hand settles on your shoulder."], ["imela", "Hm."], ["imela", "Come. Eat first. Questions keep."]]);
    }, { music: "epilogue" });
    // the credits sequence: four painted panels, then the last card. No "to be continued".
    await Cinema.panels([
      { img: "assets/cinema/m5_epilogue1.png", text: "Dawn on the roof of the Great Pyramid. The old calendar in the floor, with one day cut out of its ring, and a company of people standing in the gap." },
      { img: "assets/cinema/m5_epilogue2.png", text: "Stars falling over a dark sea, in lines, as if thrown." },
      { img: "assets/cinema/m5_epilogue3.png", text: "At the edge of the jungle at sunrise, small shapes running free. They do not look back." },
      { img: "assets/cinema/m5_epilogue4.png", text: "A closed gauntlet, and on the back of it a faint light: a feather inside a star." },
    ], { music: "credits" });
    await UI.card({ image: "assets/title.png", big: "THE FIRST COUNT ENDS", text: "Davichi's Revenge. Designed by Danny, built with Claude.", delay: 900 });
    F.set("epilogue.done"); F.set("ch11.done"); F.set("post.start");
    await S.begin.post(F);
  };
  S.done.epilogueScene = F => F.f("epilogue.done");

  // ---------- 10.0 the post-game opens (Story.begin["post"]): Dawnwatch Bastion, Brisk at the cove ----------
  S.begin.post = async F => {
    G.ch = Math.max(G.ch, 12); F.set("post.start"); F.set("wagon.at", "dawnwatchBastion"); G.lastTown = "dawnwatchBastion";
    F.music("bastion"); F.autoSave = true; F.save(true);
    F.go("dawnwatchBastion", "start");
  };
  S.start[12] = { region: "dawnwatchBastion", entry: "start" };
  D.REGIONS.dawnwatchBastion.autos = ["bastionArrive", "postArrive"];
  S.trigger.postArrive = async F => {
    if (!F.f("post.start") || F.f("post.brisk")) return;
    F.set("post.brisk"); G.ch = Math.max(G.ch, 12); F.music("bastion");
    await stage(async c => {
      M3.actors(c, [["brisk", "npcBrisk", 120, -10, { flip: true }]]);
      c.tint("#f0c0a0", 0.1, 400);
      await c.say([["narr", "Morning at Dawnwatch. The banners on the wall are the same banners, and nobody quite knows what to do with them. From the cove comes a smell of tar and bread."], ["captain", "Friend, the storm belt is quiet. The scholars at Starhaven have been sending kites. Sail west from the cove, a little south, past the storm belt. Their island is the one behind the weather."]]);
      c.tint("#f0c0a0", 0, 400); c.follow();
    }, { music: "bastion" });
  };
  S.done.postArrive = F => F.f("post.brisk");
})();

// ---------- part B: data, regions, banter, Starhaven ----------
(function () {
  const S = window.Story, D = window.Data, Q = Object.assign, M2 = S.m2, M3 = S.m3, M = S.m5, T = M.T, R = D.REGIONS, say = M.say, thought = M.thought, stage = M.stage, once = M.once, cycle = M.cycle, rel = M.rel;
  const key = (n, d) => ({ n, d, key: true });
  Q(D.GOODS, {
    starMetal: ["Star-Metal Fragment", 100], foxEmber: ["Comet-Fox Ember", 92], glassPetal: ["Glass Petal", 96], boarTusk: ["Black-Stone Tusk", 98], voidDust: ["Void Dust", 104], lensGlass: ["Hollow Lens Glass", 110], starSip: ["Staredrinker Sip", 112],
    ashSap: ["Star-Ash Sap", 106], builderCog: ["Builder Cog", 100], eelLamp: ["Eel Lamp-Gland", 94], wraithSigil: ["Builder Sigil", 108], coralHeart: ["Coral Heart", 104], crabShell: ["Abyssal Shell", 110], deepPearl: ["Deep Pearl", 98],
    jellyBell: ["Jelly Bell", 100], horrorTooth: ["Trench Tooth", 114], mawTooth: ["Maw Tooth", 118],
  });
  Q(D.DROPS, {
    starMetalGolem: [["starMetal", 0.45]], cometFox: [["foxEmber", 0.45]], craterBloom: [["glassPetal", 0.45]], meteorBoar: [["boarTusk", 0.45]], voidMoth: [["voidDust", 0.45]], hollowLens: [["lensGlass", 0.4]], staredrinker: [["starSip", 0.4]], emberwoodSentinel: [["ashSap", 0.45]],
    drownedSentry: [["builderCog", 0.45]], lanternEel: [["eelLamp", 0.45]], builderWraith: [["wraithSigil", 0.4]], coralColossus: [["coralHeart", 0.45]], abyssalCrab: [["crabShell", 0.45]], deepGlowfish: [["deepPearl", 0.45]],
    lanternJelly: [["jellyBell", 0.45]], trenchHorror: [["horrorTooth", 0.4]], lightlessMaw: [["mawTooth", 0.4]],
  });
  Q(D.ITEMS, {
    starfallCloak: Q(key("Starfall Cloak", "Cosmetic. A cloak woven with a thread of star-metal that holds the light a moment after it passes. It does nothing and looks superb."), { f: 40 }),
    lanternBead: Q(key("Lantern Bead", "Cosmetic. A glass bead from Lantern Deep that glows when the room is dark. It does nothing and is very hard to put down."), { f: 25 }),
  });
  Q(D.QUESTS, {
    m_starhaven: { t: "Starhaven", ch: 12, steps: ["The old Academy scholars have a camp on a star-metal island beyond the storm belt, north-east on the Weeping Sea, east of the Maelstrom. They have been sending kites."] },
    m_crater: { t: "The Crater Garden", ch: 12, steps: ["In the Starfall Isles there is a crater full of glass flowers, and something sleeps in it."] },
    m_drowned: { t: "The Drowned Capital", ch: 12, steps: ["A builder city lies under the sea. A diving bell goes down from a buoy off the east coast, between Lowstep and Tzavan, beside two lantern buoys and a wreck."] },
    m_deep: { t: "Lantern Deep", ch: 12, steps: ["A lightless trench lies below three lantern buoys in the open sea, east of the Maelstrom and south of the diving bell. Follow the creatures that glow."] },
    m_league: { t: "The Grand Cup", ch: 12, steps: ["Tzavan's Grand Cup is open. Enter it at the arena clerk's counter in Tzavan. The champion has not lost in eleven years."] },
  });
  D.LORE.sleepers = "The sleepers. Something fell from the sky a very long time ago, and sleeps in the Crater Garden of the Starfall Isles. It is not dead. When you stand close, the mark on your gauntlet answers it.";
  D.LORE.builderLogs = "Builder logs of the Drowned Capital: \"We set the locks. We did not tell the sleepers' names.\" and: \"The count resumes when the last lock is gone.\"";
  [["lore.sleepers", "The sleepers", D.LORE.sleepers], ["lore.builderLogs", "The builder logs of the Drowned Capital", D.LORE.builderLogs]].forEach(r => M3.LORE.push(r));
  Q(D.BREAKS, {});

  const ALL = M.BAS.concat(M.CURES, ["tonic", "ember", "incense", "candle", "starfallCloak", "lanternBead"], M.BOMBS, M.WARDS);
  Q(D.INNS, { starhaven: { n: "The Star Lamp", mult: 1.0 } });
  Q(D.SHOPS, { starhaven: { n: "Starhaven research stores", who: "merchant", stock: ALL, buys: 1.0 } });
  M3.rumours("starhaven", ["The Last Warden still guards a city that has no one left to guard. A diving bell goes down to it, off the east coast, between Lowstep and Tzavan.", "A whale swallowed a star. It still burns inside her.", "The trench below the three lantern buoys is dark, east of the Maelstrom and south of the bell. Follow the creatures that glow."], []);

  // ---------- regions ----------
  const yes = () => true, WARM = "bg_ruins";
  M3.region("starhaven", { n: "Starhaven", bg: WARM, arena: "starfall", music: "starfall", town: "starhaven", inn: "starhaven", autos: ["starhavenArrive", "post.allDone"],
    npcs: [["innkeeper", "The Star Lamp"], ["merchant", "Research stores"], ["vael", "Master Oren Vael"], ["oldDunmar", "The Menagerie Wagon", s => s.f["wagon.at"] === "starhaven"], ["mentor", "Master Ithiel, at the telescope"], ["calendarScholar", "The calendar scholar"],
      ["imela", "Imela", s => !s.f["post.imelaHome"]], ["quartermaster", "The quartermaster"], ["r1", "A young scholar"], ["r2", "A kite-flyer"], ["r3", "A note-taker"]],
    exits: [["weepingSea", "The dinghy beach", yes], ["starfallIsles", "The glass-sand path to the Starfall Isles", yes]],
    things: [["telescope", "The great brass telescope", s => s.f["post.start"], "gather"], ["postcard", "A postcard pinned to the notice-rope", s => s.f["post.imelaHome"] && !s.f["post.postcard"], "gather"]]  });
  M3.region("starfallIsles", { n: "Starfall Isles", bg: WARM, arena: "starfall", music: "starfall", table: "starfall", fields: true, overland: true,
    exits: [["starhaven", "Back to Starhaven", yes], ["craterGarden", "The rim of the great crater", yes]],
    things: [["starfallChest1", "A chest in a dark metal bowl", s => !s.f["c.starfall1"], "chest"], ["starfallChest2", "A chest under a curved metal rib", s => !s.f["c.starfall2"], "chest"], ["starfallChest3", "A chest in a glass-sand dune", s => !s.f["c.starfall3"], "chest"],
      ["starMetalShard", "A humming shard in the glass sand", s => !s.f["g.starshard"], "gather"]] });
  M3.region("craterGarden", { n: "The Crater Garden", bg: WARM, arena: "starfall", music: "starfall", table: "crater2", fields: true, dungeon: true,
    exits: [["starfallIsles", "Back out of the crater", yes]],
    things: [["craterSleeper", "The crystal shape in the crater floor", s => !s.f["crater.seen"], "trigger"], ["craterChest1", "A chest among the glass flowers", s => !s.f["c.crater1"], "chest"], ["craterChest2", "A chest at the foot of a crystal flower", s => !s.f["c.crater2"], "chest"],
      ["craterChest3", "A chest in the hollow of a root", s => !s.f["c.crater3"], "chest"], ["craterChest4", "A chest on the far rim", s => !s.f["c.crater4"], "chest"]] });
  M3.region("drownedCapital", { n: "The Drowned Capital", bg: WARM, arena: "drownedCity", music: "drowned", table: "drowned", fields: true, dungeon: true,
    exits: [["weepingSea", "The diving bell, up", yes]],
    things: [["builderLogChest1", "A builders' chest in a dome", s => !s.f["c.log1"], "chest"], ["builderLogChest2", "A builders' chest on a bridge", s => !s.f["c.log2"], "chest"], ["legendL8", "The great avenue, where a figure kneels", s => !s.f["l8.done"], "trigger"]] });
  M3.region("lanternDeep", { n: "Lantern Deep", bg: WARM, arena: "deepTrench", music: "deepTrench", table: "deep", fields: true, dungeon: true,
    exits: [["weepingSea", "Back up to the open sea", yes]],
    things: [["deepPath", "The lights, drifting in the dark", s => !s.f["deep.path"], "trigger"], ["deepGuardian", "The tallest lantern in the trench", s => s.f["deep.path"] && !s.f["k9.done"], "trigger"], ["g40_deepCurrentTrench", "A chest in the dark below the lanterns", s => s.f["k9.done"], "chest"]] });
  // the sea hub (when there is no sea map): the new docks and the diving bell
  if (R.weepingSea && Array.isArray(R.weepingSea.exits)) R.weepingSea.exits.push(["saltmereCamp", "Saltmere quay, in the marsh", s => s.f["ch10.start"]], ["dawnwatchBastion", "The cove at Dawnwatch Bastion", s => s.f["ch11.start"]],
    ["starhaven", "Starhaven, beyond the storm belt", s => s.f["stormSails"]], ["lanternDeep", "A trench in the deep, dark water", s => s.f["stormSails"] && s.f["post.start"]], ["divingBell", "The diving bell, at its buoy", s => s.f["post.start"], "trigger"]);
  // the legend L7 as a hub stand-in for the shimmer (the world map spawns it by itself)
  if (R.saltmereWarfront) R.saltmereWarfront.things.push(["legendL7", "A white shape in the mist of the marsh clearing", s => !s.f["l7.done"], "trigger"]);

  // ---------- banter: Starfall, the Drowned Capital, Lantern Deep ----------
  const B = M.banter;
  B("starfall", [
    ["The sand is singing! Why is the sand singing?!", "Stone that hums is stone that remembers, young bull. Tread lightly.", "Mind your feet, dear. The ground is listening."],
    ["Open sky. Black glass. Nothing alive but us. I like it.", "Everything here is shiny and I have nothing to say about it. Savour this.", "What made the bowls? What fell here? Is it still here? May I touch it?"],
    ["Grumble. No moss. Not even a hope of moss.", "...Something sleeps under here.", "It's so quiet. I'll stay close, if that's all right."],
    ["Hah! The whole sky threw things at this island!", "Can I roll down the crater? Can I?!", "The tide never reached here. I feel its absence."],
    ["Hm. Old metal.", "Of course. An island made of fallen things. Fitting.", "What falls and is not broken? The island knows."],
    ["It smells of burnt pennies. Is it edible? ...No. Pity.", "It hums, it hums, I love it, it hums just for us!", "Did you know the scholars call this the Thrown Coast? ...I just learned that from a notebook."],
    ["Mind the glass sand, please. It is sharp.", "Steady hearts. This ground has been waiting a very long time.", "...Slowly... the ribs of something older than the builders. ...Show respect."],
    ["Don't blame me. It was already smoking when we got here.", "Hee. Shiny things. Don't touch, I know. Hee.", "Is there anything to eat on a star? ...Probably not."],
    ["Every dark place has a little light in it. I find it.", "I will glow low. The stars are close enough.", "...The tide of the sky left this shore behind. Walk gently."],
  ]);
  B("drowned", [
    ["Why is it underwater and also not wet?!", "A city that sank without a sound. The sea has good manners, young bull.", "Stay together, dear. The currents here are old."],
    ["Streets. No people. No cages. ...Someone left in a hurry.", "A drowned city, and it still has better lighting than most.", "Who lived here? Where did they go? Why did they leave the lamps on?"],
    ["Grumble. Damp, dark, and a bit sad. My kind of town.", "...They are still here. In the stone.", "The lights are still on. If that's all right. I think that's kind."],
    ["Hah! A city for fish! Nobody tell the fish.", "Can I swim down that street? Can I? Just to the dome?!", "The sea took this city gently. I know the difference."],
    ["Hm. Good stone.", "Of course. The builders sank their own capital. Of course.", "What is drowned, and still on watch? Ask the sentries."],
    ["Is there a kitchen down here? ...The builders must have eaten.", "It's so beautiful, it's so beautiful and so sad!", "Did you know no builder ever left a name on a wall? ...I looked."],
    ["Mind the coral, please. It was somebody's garden.", "Walk lightly. This is a graveyard that remembered to keep its lamps lit.", "...Slowly... the sea holds what it is given. ...Gently."],
    ["Nothing is on fire. Everything is wet. I'm uneasy.", "Hee... hello? Hee, anyone? The echo is rude.", "Everyone left the lamps on, and the food? ...Where is the food?"],
    ["They left their light behind. I think that was on purpose.", "I will glow beside theirs. Two small lights.", "...The sea kept this city safe. Now it keeps us."],
  ]);
  B("deep", [
    ["It's so dark! I can't see my own horns! ...Good. They are very big.", "Follow the lights, young bull. They know the way.", "Stay where I can see you, dear. Where I can see your glow."],
    ["Dark. Walls that move. No chains. ...Still don't like it.", "If I had known there would be this much dark, I'd have worn something brighter.", "Why do they glow? For whom? Is it for us, or against us?"],
    ["Grumble. At least the dark is honest.", "...I like it here. It is quiet and it knows my name.", "I'll hold a little light, if that's all right. Just a little."],
    ["Hah— ow. Something hit me. Something with a lamp. Hah.", "Can I follow the fish? Can I follow them all?!", "Deep water, no floor, no light. I have been here before, in my dreams."],
    ["Hm. Dark.", "Of course. The deepest dark in the sea, and we walk right in.", "What shines where there is no sun? Follow it."],
    ["Do the glowing ones taste like anything? ...No. Fine.", "Look at them, look at them, they're like stars, like little stars!", "Did you know the deep ones talk by flashing? ...I'm learning. Slowly."],
    ["Mind the dark, please. It does not mind us.", "Walk lightly. The way is lit by those who were here first.", "...Slowly... the deep is home. ...Easy."],
    ["Don't blame me for the glow. That's all them.", "Hee. They're showing off. Rude. I like them.", "The glowing ones look edible. ...I'm not going to. Probably."],
    ["The dark is full of little lights. They found each other.", "I'll glow with them. A small light among many.", "...The tide goes deepest here. This is where it rests."],
  ]);

  // ---------- 10.A Starhaven ----------
  const SH = "starhaven";
  S.trigger.starhavenArrive = async F => {
    if (!F.f("post.start")) { F.set("post.start"); G.ch = Math.max(G.ch, 12); }
    G.lastTown = SH;
    G.flags["sh.visits"] = (G.flags["sh.visits"] || 0) + 1;
    if (G.flags["sh.visits"] === 4 && !F.f("post.imelaHome") && F.f("post.start")) {
      F.set("post.imelaHome");
      await UI.say([["narr", "Imela is not at the tent today. Her cup is washed and upside down on the table. A scholar says she took the dinghy at first light, with a basket, a sack of seed and a very firm expression, and said she had a well to see to."]]);
    }
    if (!once(F, "sh.seen")) return;
    F.set("wagon.at", SH); F.music("starfall"); F.quest("m_starhaven", 0);
    await stage(async c => {
      M3.actors(c, [["vael", "npcVael", 130, -20, { flip: true }], ["ith", "npcIthielGrey", 260, -50], ["dun", "npcDunmar", -150, 20], ["wagon", "menagerieWagon", -230, 10]]);
      c.tint("#101838", 0.14, 400); await c.pan(c.hero.x + 120, c.hero.y - 40, 900);
      await c.say([["narr", "A research camp on a crater island: tents and prefab huts on glassy black sand, brass telescopes on every roof, notebooks pinned to ropes and clacking in the wind like a hundred small flags. The sky is so clear it looks recently cleaned."]]);
      await c.walk("vael", c.hero.x + 60, c.hero.y - 10, 900);
      await c.say([["vael", "The old Academy staff who left before the raid. We took the data that was ours and left the rest. Welcome."], ["vael", "Do you know how many of our notes were stolen by your own journal? Do not answer. I am delighted."]]);
      c.emote("ith", "..."); await c.wait(400);
      await c.say([["narr", "At the far end of the camp, at the foot of the biggest telescope, a man in a grey cloak sits with a cold cup of tea. He raises it to you, a quarter inch. Near the wagon, Dunmar is shouting at a scholar for putting a notebook on the roof."]]);
      c.tint("#101838", 0, 500); c.follow();
    }, { music: "starfall" });
  };
  S.done.starhavenArrive = F => F.f("sh.seen");
  M3.talkTown(SH, { inn: SH, shop: "starhaven", who: ["scholar2", "kitemaker", "scribe"], opts: {},
    innLine: "The Star Lamp. A bunk, a blanket and a window with the best sky in the world in it. We charge for the bunk. The sky is on the house.",
    shopLine: "Research stores. Everything we can make, buy, or talk a captain into carrying. Our prices are honest. Our notebooks are not for sale.",
    afterInn: async F => { if (F.f("k9.freed") && F.allCreatures().some(u => u.id === "bakuroth")) await say("bakuroth", cycle("bk.dream", ["I dreamed of a very long road, and something walking down it. It was not in a hurry.", "I ate a bad dream last night. It had stars in it. It was good, a little. Mostly sad.", "Someone was singing under the water, very far down. I did not know the song. I have been humming it anyway."])); } });
  Object.assign(T(SH), {
    vael: async F => {
      if (G.items.starMetalShard && !F.f("sh.shard")) { F.set("sh.shard"); await UI.say([["vael", "You have the shard. May I? ...No. Do not hand it over. I want to hold it exactly as long as you will let me."], ["vael", "It hums at the note of the glass. The note of the telescope lens. The note, I confess, of my back teeth. The builders did not build this. Something older than the builders did."]]); return; }
      await say("vael", cycle("vl", ["The glass here hums at four hundred and forty cycles. That is not a coincidence, and I have a notebook for it.", "I was a cartographer. I drew coasts. Now I draw skies, and the coasts have started to move. I am enchanted.", "Your journal is cited in three of our papers. I have written to it twice. It has not replied. A very rude journal.", "Do not thank me. Thank the data. It does the work, and it never asks for lunch."]));
    },
    oldDunmar: async F => {
      if (["keyK1", "keyK2", "keyK3", "keyK4", "keyK5", "keyK6", "keyK7", "keyK8", "keyK9"].some(k => F.item(k) > 0)) { await M3.wagon(F); return; }
      await say("dunmar", cycle("dm12", ["There is a cage in this wagon I have been keeping open for the one the sea has under it. Bring me the key, lad. It will fit. I measured.", "I have a notebook, now. A scholar gave it to me. I write the creatures' names in it. All of them. I have run out of pages once already.", "Eat, lad. There are still cages. There will always be cages. That is why I eat."]));
    },
    mentor: async F => {
      if (!F.f("post.imelaHome")) return say("mentor", cycle("mn12", ["I read the sky for a living. For nineteen years I read it wrong. Now I read it right, and it is worse.", "Your mother and I have an understanding. She does not speak to me, and I make tea. It is going rather well.", "Look at the sky when you can, my boy. Not for what it says. For what it is doing."]));
      await say("mentor", cycle("mn12b", ["Imela has gone home. She sent word that I am not to follow. I am not following. I am looking in the general direction, from a polite distance.", "I was wrong about who, not about what. I hope it is a comfort to someone, someday. It is not to me.", "Do not stay at the telescope too long. It will tell you things you cannot do anything about."]));
    },
    calendarScholar: async F => say("calendarScholar", cycle("cs12", ["The missing day is entered in my notebook, in red. I do not know what to do with a red day. I keep looking at it.", "The count has started. I do not know what it is counting. I would like to be around when it reaches something.", "I used to read other people's calendars. Now I am asked to write one. I have started with: today."])),
    quartermaster: async F => say("quartermaster", cycle("qm12", ["Stores are by the crate, and the crate is in the shed. If it is not in the shed, it is on the roof. If it is not on the roof, a scholar has it.", "We trade with the sea. The sea does not always want what we make. It takes everything, in the end."])),
    imela: async F => say("imela", cycle("im12", ["Eat. This is a camp full of people who forget to. I have started a rota.", "I am told the telescope shows a light that is not a star. I have not looked. I know what I would see, and I would rather eat.", "Sparrow. I have a well in Marigold Hollow that needs seeing to. It has been nineteen years. It can wait a little longer. Not much longer."])),
  });
  S.gather.telescope = async F => {
    await UI.say([["narr", "The great brass telescope is trained on a patch of sky between two bright stars. A scholar's note is pinned to the tube: \"Not a star. Not a comet. It moves against the fixed stars, slowly, and every night it is a little larger.\""]]);
    const i = await F.ask("The telescope.", [{ label: "Look" }, { label: "Leave it" }], { top: "38%" });
    if (i !== 0) return;
    await UI.say([["narr", "A great deal of black. Then, very small, a point of light that is not like the others. It does not twinkle. It is moving, and it is moving this way, patiently, like someone who knows the road."], ["hero", "(It is not falling. It is coming down the way you come down a stair you have walked before.)"]]);
    F.set("telescope.seen");
  };
  S.gather.postcard = async F => {
    F.set("post.postcard");
    await UI.say([["narr", "A postcard pinned to the notice-rope, a little curled, the ink brown. On the front, drawn in pencil by a hand that was not used to drawing: a stone well, a bucket, thyme on the lip of it, and a small door open on a dark hall."], ["imela", "Sparrow. The well still works. The thyme has taken the porch. Come when you can. Eat first. - Mother"]]);
  };
})();

// ---------- part C: Starfall Isles, the Crater Garden (the sleeper), the diving bell, the Drowned Capital (the Last Warden, L8) ----------
(function () {
  const S = window.Story, D = window.Data, Q = Object.assign, M3 = S.m3, M = S.m5, T = M.T, R = D.REGIONS, say = M.say, thought = M.thought, stage = M.stage, once = M.once, cycle = M.cycle, rel = M.rel;

  // ---------- 9.2 Starfall Isles ----------
  R.starfallIsles.autos = ["starfallEnter"];
  S.trigger.starfallEnter = async F => {
    if (!F.f("post.start")) return;
    if (!once(F, "sf.seen")) return;
    F.music("starfall"); F.quest("m_crater", 0);
    await UI.say([["narr", "Islands cratered with dark metal, bowls of it, wide as ponds. The glass sand hums under your boots, a thin high note. Curved ribs of something older than the builders rise out of the dunes and bend over, like the ribs of a whale the size of a hill. The grass between is scorched in lines."]]);
    await F.banter("starfall");
  };
  S.done.starfallEnter = F => F.f("sf.seen");
  const chestText = {
    starfallChest1: "In the bowl of a dark metal crater, a chest that has gathered no dust at all. Three Storm-Wards, a Soul Dew in a glass vial, and a purse of kakal sealed with star-black wax.",
    starfallChest2: "Under a curved metal rib, a chest the colour of the rib. Three Storm-Wards, a Soul Dew, and a purse that clinks with a thin, high note.",
    starfallChest3: "Half buried in a glass-sand dune, a chest that sings very faintly when you open it. Three Storm-Wards, a Soul Dew, and a purse as heavy as a good week.",
  };
  [1, 2, 3].forEach(n => { S.chest["starfallChest" + n] = M.loot("c.starfall" + n, [["stormWard", 3], ["soulDew", 1]], 2000, chestText["starfallChest" + n]); });
  S.gather.starMetalShard = async F => {
    if (F.f("g.starshard")) return false;
    F.set("g.starshard"); F.give("starMetalShard", 1, true); F.sfx("coin");
    await UI.say([["narr", "A shard of dark metal stands upright in the glass sand like a tooth. It hums when you touch it, a thin high note. It is not warm, and it is not cold. You wrap it in a cloth and put it in your pack, and the pack goes on humming."], ["hero", "(Vael will want this. Vael will want to sit with it.)"]]);
    UI.toast("Star-Metal Shard.", 2600);
  };

  // ---------- 9.3 the Crater Garden ----------
  R.craterGarden.autos = [];
  const CR = [[["soulDew", 1], ["cinderWard", 2]], [["soulDew", 1], ["rimeWard", 2]], [["soulDew", 1], ["venomWard", 2]], [["soulDew", 1], ["stormWard", 3], ["ember", 2]]], CG = [2200, 2400, 2600, 2800];
  const crText = ["A chest among the glass flowers, its lid fogged with their breath. A Soul Dew, two Cinder-Wards, and a purse of kakal bright as a coin that was just minted.",
    "A chest at the foot of a crystal flower as tall as a house. A Soul Dew, two Rime-Wards, and a purse that has been waiting some time to be spent.",
    "A chest in the hollow of a root of glass. A Soul Dew, two Venom-Wards, and a purse of kakal rubbed smooth by something that did not know what it was.",
    "A chest on the far rim, in the first light. A Soul Dew, three Storm-Wards, two Ashen Embers, and a heavy purse with a feather sewn into the lining."];
  [1, 2, 3, 4].forEach(n => { S.chest["craterChest" + n] = M.loot("c.crater" + n, CR[n - 1], CG[n - 1], crText[n - 1]); });
  S.trigger.craterSleeper = async F => {
    if (F.f("crater.seen")) return;
    F.music("starfall"); F.quest("m_crater", 0);
    await stage(async c => {
      c.tint("#101838", 0.16, 500);
      await c.say([["narr", "A crater of glass flowers, thousands of them, growing in rings around a sleeping shape half buried in the floor: crystalline, enormous, lit from within, in a colour that is not any colour you have a name for. The air hums. On the back of your gauntlet, the mark warms."]]);
      await c.walkHero(c.hero.x + 160, c.hero.y + 10, 2200);
      c.fx("glow", c.hero.x, c.hero.y - 20, { ms: 2800, r: 36 }); c.sfx("chime");
      await c.say([["narr", "You stop at the foot of it. The feather inside the star on your gauntlet lights up, slowly, the way a lamp lights in a window far away. And the crystal answers: a pulse of colour along its whole length, from the root to the crown, like a slow heartbeat."]]);
      c.shake(1, 1400); c.fx("sparkle", c.hero.x + 50, c.hero.y - 60, { ms: 2200, r: 60 }); await c.wait(1600);
      await c.say([["narr", "It breathes once. A long, low note goes out over the crater and the glass flowers ring with it, all of them, like a field of struck bells. Then it is quiet again."], ["hero", "(It is asleep. It is not dead.)"]]);
      c.tint("#101838", 0, 800);
    }, { music: "starfall" });
    F.set("crater.seen"); F.set("lore.sleepers"); F.questDone("m_crater");
    UI.toast("Journal: the sleepers.", 3200);
  };
  S.done.craterSleeper = F => F.f("crater.seen");

  // ---------- 9.4 the diving bell and the Drowned Capital ----------
  R.drownedCapital.autos = ["drownedEnter"];
  S.trigger.divingBell = async F => {
    if (!F.f("post.start")) { await UI.say([["narr", "A brass bell on a buoy, rocking on the swell, with a ladder down to the hatch. It is not yet the time for it."]]); return; }
    F.quest("m_drowned", 0); F.music("drowned");
    await stage(async c => {
      c.tint("#08202c", 0.3, 500);
      await c.say([["narr", "A brass bell the size of a small room hangs from a crane on a buoy in the open sea, with a ladder to its hatch and a plaque, in builder script, riveted beneath the porthole. You climb in. The hatch seals. The glass goes green, then blue, then black, and the sea closes over it with a long, soft sigh."]]);
      c.sfx("splash"); c.fx("splash", c.hero.x, c.hero.y); await c.wait(800);
      await c.say([["narr", "Far below, a light. Then a hundred. Then a city, all of it lit, the streets drawn in gold on black."]]);
    }, { music: "drowned" });
    F.go("drownedCapital", "from_bell");
  };
  S.trigger.drownedEnter = async F => {
    if (!F.f("post.start") || !once(F, "dc.seen")) return;
    F.quest("m_drowned", 0); F.music("drowned");
    await UI.say([["narr", "The builders' sunken capital. Streets of black-and-gold stone under dark water, domes and bridges, coral colossi standing in the avenues like statues someone forgot to take down. The light-lines in the road still glow. Nothing has switched them off."]]);
    await F.banter("drowned");
  };
  S.done.drownedEnter = F => F.f("dc.seen");
  S.chest.builderLogChest1 = async F => {
    if (F.f("c.log1")) return false; F.set("c.log1"); F.sfx("door"); F.give("soulDew", 1, true); F.gold(2400, true); F.set("lore.builderLogs");
    await UI.say([["narr", "A builders' chest inside a dome, the lid thick with coral. Inside, a Soul Dew, a purse, and a slate tablet in the short hand: \"We set the locks. We did not tell the sleepers' names.\""]]);
    UI.toast("Journal: the builder logs.", 2800);
  };
  S.chest.builderLogChest2 = async F => {
    if (F.f("c.log2")) return false; F.set("c.log2"); F.sfx("door"); F.give("soulDew", 1, true); F.gold(2400, true); F.set("lore.builderLogs");
    await UI.say([["narr", "A builders' chest on a bridge, held shut by a seal that sighs open at your touch. A Soul Dew, a purse, and a slate tablet: \"The count resumes when the last lock is gone.\""], ["hero", "(It resumed this morning. I was standing on the roof.)"]]);
  };
  // L8 the Last Warden: a builder guardian, on watch in a sunken avenue
  S.legend.L8 = async (F, info) => {
    F.music("legend");
    await stage(async c => {
      const p = rel(c, 160, 0); c.actor("lw", { art: "lastWarden", x: p.x, y: p.y, scale: 1.4 });
      c.tint("#08202c", 0.28, 400); c.fx("glow", p.x, p.y - 30, { ms: 2400, r: 50 });
      await c.say([["narr", "On the great avenue, at the foot of a dome, a figure of builder-bronze kneels with one hand flat on the road. It does not turn its head. The light-lines run under its palm and away, and it is the only thing in the city that has not been switched off."],
        ["lastWarden", "We keep. We were set to keep. The keeping is not finished."], ["hero", "(It does not know the builders are gone.)"], ["lastWarden", "The island is closed. It has always been closed. Do you carry the mark?"]]);
      c.tint("#08202c", 0, 400);
    }, { music: "legend" });
    const i = await F.ask("The Last Warden", [{ label: "Show the mark" }, { label: "Leave it on watch" }], { top: "38%" });
    if (i !== 0) { F.music(F.regionMusic()); return false; }
    F.checkpoint();
    const res = await F.fight([F.mkEnemy("lastWarden", 76)], { noFlee: true, music: "legend", goldMult: 0, xpBonus: 1.5, intro: "The Last Warden rises. \"We keep.\"", bg: F.arenaOf(G.region) });
    if (res !== "win") { F.music(F.regionMusic()); return false; }
    M.markBreak("lastWarden");
    F.gold(Math.round(10 * M3.m(12)), true);
    await UI.say([["lastWarden", "The count resumes. We are not sorry. We were never given the choice."], ["narr", "The bronze goes quiet. The hand lifts from the road, for the first time, and the light-lines under it brighten and go on running. On the stone where it knelt lies a small grey sigil, cool, like a held breath."]]);
    if (window.Systems && Systems.giveCharm) Systems.giveCharm("quietSigil"); F.set("l8.done"); F.questDone("m_drowned");
    return true;
  };
  S.trigger.legendL8 = async F => { if (!F.f("l8.done") && window.Systems && Systems.hookLegend) await Systems.hookLegend("L8", G.region, { enemy: "lastWarden", level: 76 }); };
  S.trigger.legendL7 = async F => { if (!F.f("l7.done") && window.Systems && Systems.hookLegend) await Systems.hookLegend("L7", G.region, { enemy: "veilStag", level: 60 }); };
  S.trigger.legendL9 = async F => { if (!F.f("l9.done") && window.Systems && Systems.hookLegend) await Systems.hookLegend("L9", G.region, { enemy: "mawmotherOfTheDeep", level: 80 }); };
})();

// ---------- part D: Lantern Deep (K9) and Bakuroth, the star-whale (L9), the Grand Cup, the last gift, Story.finish[12] ----------
(function () {
  const S = window.Story, D = window.Data, Q = Object.assign, M3 = S.m3, M = S.m5, T = M.T, R = D.REGIONS, say = M.say, thought = M.thought, stage = M.stage, once = M.once, cycle = M.cycle, rel = M.rel;

  // ---------- 9.5 Lantern Deep: follow the glowing creatures (a wrong step is a fight and a step back) ----------
  R.lanternDeep.autos = ["deepEnter"];
  S.trigger.deepEnter = async F => {
    if (!F.f("post.start") || !once(F, "deep.seen")) return;
    F.music("deepTrench"); F.quest("m_deep", 0);
    await UI.say([["narr", "A trench of black water with no floor and no roof, and in it, everywhere, lights: drifting lanterns, glass-clear fish with a lamp apiece, pale reefs that glow from within, and walls that move when you do not look at them. The dark does not feel empty. It feels crowded."]]);
    await F.banter("deep");
  };
  S.done.deepEnter = F => F.f("deep.seen");
  const PATH = [["A shoal of lantern-fish turns, all together, to the left, and the dark opens there.", 0], ["The drifting lights gather over the middle way, and a jelly bell lifts into them like a lamp raised.", 1], ["Far ahead, a single great glow slides to the right along a wall that is not a wall.", 2]];
  const WAY = ["left", "ahead", "right"];
  S.trigger.deepPath = async F => {
    if (F.f("deep.path")) return;
    const step = G.flags["deep.n"] || 0;
    await UI.say([["narr", PATH[step][0]]]);
    const i = await F.ask("Where the lights go.", [{ label: "Go left" }, { label: "Go ahead" }, { label: "Go right" }, { label: "Wait" }], { top: "36%" });
    if (i < 0 || i > 2) return;
    if (PATH[step][1] === i) {
      G.flags["deep.n"] = step + 1; F.sfx("menuOk");
      if (step + 1 < PATH.length) await UI.say([["narr", "You go " + WAY[i] + ", after the lights. The dark folds back to let you through, and shuts behind you without a sound."]]);
      else { F.set("deep.path"); await UI.say([["narr", "The last light ahead of you goes out of sight round a pillar of pale coral, and when you follow it round, the trench opens. A thousand lanterns hang in the water in a great ring, burning slowly. The tallest one has turned to face you."]]); }
      return;
    }
    await UI.say([["narr", "You step " + WAY[i] + ", off the lights, and the dark closes over your head like a hand. Something with a mouth turns slowly towards the warmth of you."]]);
    G.flags["deep.n"] = 0;
    const foes = F.rollEncounter("deep"); if (foes) await F.fight(foes, { bg: "deepTrench" });
    await UI.say([["narr", "You find the lights again. The shoal is waiting, patiently, a little further back than before."]]);
  };
  S.done.deepPath = F => F.f("deep.path");
  S.trigger.deepGuardian = async F => {
    if (F.f("k9.done")) return;
    const ok = await M3.keyBoss(F, { id: "lanternDeepGuardian", level: 81, k: "k9", key: "keyK9", name: "The Lantern Guardian", title: "Keeper of the Deep", bg: "deepTrench",
      lines: [["narr", "The tallest lantern dips, once, as if it were nodding, and the thousand lights around it go out together. In the dark, a great pale shape rises behind the flame."], ["hero", "(It is not angry. It is the thing that keeps the dark in order.)"]],
      after: [["narr", "The great lantern dims to a coal, and then to a single low glow, and the lights around it come back one by one. At its foot, in the silt, lies a key of pale lantern-glass, lit from inside."]] });
    if (ok) F.questDone("m_deep");
  };
  S.done.deepGuardian = F => F.f("k9.done");
  S.chest.g40_deepCurrentTrench = async F => S.gearChest2(F, "g40_deepCurrentTrench", "G40");
  M.freeBakuroth = async F => {
    F.take("keyK9", 1); F.set("k9.freed");
    const u = F.mk("bakuroth", Math.max(3, F.avgLevel() - 1)); G.collection.push(u); G.best.bakuroth = G.best.bakuroth || { seen: 1, beaten: 0 }; F.sfx("door");
    await stage(async c => {
      const h = c.hero; c.sfx("door"); c.actor("bk", { art: "bakuroth", x: h.x + 80, y: h.y, scale: 1.3 }); c.fx("sparkle", h.x + 80, h.y - 40, { ms: 1800, r: 60 }); c.tint("#08183a", 0.2, 400);
      await c.say([["dunmar", "That key has a light in it. Hold the lantern, lad. ...No. Hold two."], ["narr", "The cage door swings out over the sea and the wagon tips, alarmingly, towards it. A great soft shape comes down the wagon boards one slow coil at a time: a leviathan the size of a house, pale as a lantern, with eyes like deep wells, and a gentleness in the way it moves that makes the boards feel smaller than they are."],
        ["bakuroth", "I ate a bad dream last night. It had stars in it."], ["dunmar", "That is a lot of creature for a wagon, lad."], ["bakuroth", "Sleep. I will keep the nightmares. They taste of salt."]]);
      c.remove("bk"); c.tint("#08183a", 0, 500);
    });
    UI.toast("Bakuroth joins the collection.", 3200);
  };
  (function () { const base = M3.wagon; M3.wagon = async F => { if (F.item("keyK9") > 0) { await M.freeBakuroth(F); return true; } return base(F); }; })();

  // ---------- 10.C L9 the Mawmother of the Deep (the storm-belt sea) ----------
  S.legend.L9 = async (F, info) => {
    F.music("legend");
    await stage(async c => {
      c.tint("#08183a", 0.35, 500); c.fx("splash", c.hero.x + 100, c.hero.y + 30); c.shake(2, 900);
      await c.say([["narr", "The swell lifts the ship and keeps lifting. Something the size of an island rolls up out of the storm-belt sea, black and barnacled, with eyes like round windows. And in the pale of her belly, under the water, a light. A star. It burns inside her slowly, the way a coal burns in a banked fire."],
        ["mawmotherOfTheDeep", "...Mmmmm..."], ["narr", "She sings. It is a low note, longer than any breath, and the whole sea sings it back."], ["hero", "(She swallowed it. Or it chose her.)"]]);
      c.tint("#08183a", 0, 500);
    }, { music: "legend" });
    const i = await F.ask("The Mawmother of the Deep", [{ label: "Face her" }, { label: "Let her sing" }], { top: "38%" });
    if (i !== 0) { F.music(F.regionMusic()); return false; }
    F.checkpoint();
    const res = await F.fight([F.mkEnemy("mawmotherOfTheDeep", 80)], { noFlee: true, music: "legend", goldMult: 0, xpBonus: 1.5, intro: "The sea rises under her. The star in her belly flares.", bg: F.arenaOf(G.region) });
    if (res !== "win") { F.music(F.regionMusic()); return false; }
    M.markBreak("mawmotherOfTheDeep");
    F.gold(Math.round(10 * M3.m(12)), true); F.giveGear("G37", 3); F.set("l9.done");
    await UI.say([["narr", "She goes down slowly, and sings the whole way, and the song goes quieter as she sinks until it is only the shape of a song. The star in her belly dims to a point. A long way down, it turns to look at you, and then it is gone."]]);
    return true;
  };
  if (R.starhaven) R.starhaven.things.push(["legendL9", "The storm-belt sea beyond the dinghy beach, where something rolls", s => !s.f["l9.done"] && s.f["stormSails"], "trigger"]);

  // ---------- 10.D the Grand Cup (Tzavan): STORY-M5 overrides the fights of Data.CUPS.grand; the champion has a Cinema reveal; the league goes free on the win ----------
  if (D.CUPS && D.CUPS.grand) Object.assign(D.CUPS.grand, {
    fights: [{ n: "The banner guard", foes: ["palaceGuard", "palaceGuard", "courtPriest"], lv: 72 }, { n: "Three of the Jaguar Cohort", foes: ["jaguarCohortElite", "jaguarCohortElite", "jaguarCohortElite"], lv: 74 },
      { n: "The beast kings", foes: ["lionWolf", "boarBull", "templeHound"], lv: 76 }, { n: "Gold and eclipse", foes: ["sunPriestGolem", "sunPriestGolem", "eclipseMoth"], lv: 78 }],
    champion: { n: "The Grand Champion", foes: ["grandChampion"], lv: 80, intro: "A jaguar-man in a gold collar, undefeated for eleven years, walks out onto the sand. The hundred banners go quiet.",
      cinema: async () => { await Cinema.boss({ id: "grandChampion", name: "The Grand Champion", title: "Undefeated for Eleven Years", bg: "colosseum", music: "battleArena", lines: [["grandChampion", "Eleven years. I counted the sand."], ["hero", "(He is not boasting. He is reporting.)"]] }); } } });
  M.leagueFree = async F => {
    if (F.f("league.free")) return;
    F.set("cup.grand"); F.set("league.free"); F.questDone("m_league");
    await stage(async c => {
      const p = rel(c, 120, 0); c.actor("gc", { art: "npcJaguarElite", x: p.x, y: p.y, scale: 1.2, flip: true });
      c.tint("#f0d890", 0.1, 400); c.sfx("break"); c.flash("#ffe8b0", 500); c.fx("sparkle", p.x, p.y - 20, { ms: 2000, r: 40 });
      await c.say([["narr", "The champion goes down on one knee in the sand, and the gold collar at his neck comes apart in a ring of small, clean pieces. For a long moment the Hall makes no sound at all. Then, along the rim, the hundred banners come down, one by one, hand over hand."]]);
      c.sfx("bell"); await c.wait(800);
      await c.say([["narr", "The silence breaks. It is the loudest sound you have ever heard, and for once it is not a roar for blood."], ["grandChampion", "Eleven years. I counted the sand. I did not count on this."], ["grandChampion", "Teach me to lose."],
        ["narr", "He smiles, a small stiff smile, like a muscle that has not been used in a very long time. On the rim a single white banner goes up where the hundred hung."]]);
      c.tint("#f0d890", 0, 500);
    }, { music: "triumph" });
    UI.toast("The arena is a free league now. The Grand Champion joins the Champions' Wall.", 4200);
  };
  (function () { const cup = Systems.cup; Systems.cup = async function (id, o) { const r = await cup.call(this, id, o); if (r === "won" && id === "grand") await M.leagueFree(Flow); return r; }; })();
  R.tzavan.autos = (R.tzavan.autos || []).concat("leagueOpen");
  S.trigger.leagueOpen = async F => { if (F.f("post.start") && !F.f("league.free") && F.qstep("m_league") === undefined) { F.quest("m_league", 0); UI.toast("The Grand Cup is open.", 3000); } };
  S.done.leagueOpen = F => F.qstep("m_league") !== undefined;
  (function () {
    const tz = T("tzavan");
    const wrap = (id, who, lines) => { const base = tz[id]; tz[id] = async F => { if (F.f("league.free")) return say(who, cycle("lf." + id, lines)); return base ? base(F) : say(who, "..."); }; };
    wrap("gladiator", "gladiator", ["The sand is only sand now. I cried the first week. Do not tell anyone.", "They call it the Free League. There is a white banner. I have not looked up at it yet.", "The champion trains in the mornings. He is terrible at losing. It is a pleasure to watch."]);
    wrap("r1", "spectator", ["I came for the blood, I will admit it. I stayed for the white banner. I did not expect that.", "My son wants to fight now. For the sport. I said yes. It is the first time I have said yes."]);
    wrap("bookmaker", "bookmaker", ["Odds are the same. The stakes are better. I am told that is called progress.", "There is no more kakal in a dead man. That is bad for business and good for the world, and I cannot decide."]);
  })();

  // ---------- 10.E after everything: Vael's plain brass compass ----------
  S.trigger["post.allDone"] = async F => {
    if (F.f("post.compass")) return;
    if (!["l8.done", "l9.done", "k9.freed", "cup.grand", "t3.done", "t4.done", "t5.done"].every(k => F.f(k))) return;
    F.set("post.compass"); F.music("starfall");
    await stage(async c => {
      M3.actors(c, [["vael", "npcVael", 120, -10, { flip: true }]]);
      c.tint("#101838", 0.1, 400);
      await c.say([["vael", "I have been keeping this in a drawer for the day someone finished everything. I did not think anyone would. I wanted to be wrong."], ["narr", "He puts something into your hand: a plain brass compass, a little dented, with a needle as thin as a hair."],
        ["vael", "It points at nothing. I have spun it in every direction for three weeks. It points, I am almost certain, at the horizon the others do not."], ["vael", "No, I will not tell you what is on it. I will tell you I am delighted. I will write it down."]]);
      c.tint("#101838", 0, 400);
    }, { music: "starfall" });
    F.give("starCompass", 1, true); UI.toast("The Plain Brass Compass.", 3200);
  };
  S.done["post.allDone"] = F => F.f("post.compass");

  // ---------- Story.finish[12] (everything of the post-game; no dbg.jump target uses it, but a debugging run can) ----------
  S.finish[12] = (F, G) => {
    ["post.start", "post.brisk", "sh.seen", "sf.seen", "crater.seen", "lore.sleepers", "dc.seen", "lore.builderLogs", "l8.done", "l9.done", "deep.seen", "deep.path", "k9.done", "k9.freed", "cup.grand", "league.free", "post.compass"].forEach(k => (G.flags[k] = true));
    ["m_starhaven", "m_crater", "m_drowned", "m_deep", "m_league"].forEach(q => (G.quests[q] = "done"));
    G.items.starCompass = 1; G.items.quietSigil = 1; G.flags.quietSigil = true; F.giveGear("G37", 3, true); F.giveGear("G40", 3, true); F.giveGear("G46", 3, true); G.flags["wagon.at"] = "starhaven"; G.ch = 12;
  };
})();

// ---------- skill book (SKILLBOOK agent 2026-10-31): Lantern Vigil (Lantern Glass, the Drowned Capital) ----------
(function () {
  const S = window.Story, D = window.Data, M2 = S.m2, add = (id, ...drops) => { D.DROPS[id] = (D.DROPS[id] || []).concat(drops); };
  Object.assign(D.MATS, { lanternGlass: ["Lantern Glass", "A bead of cold light in clear jelly. It does not go out, and it does not go anywhere."] });
  Object.assign(D.BOOK, { lanternVigil: { n: "Lantern Vigil", mat: "lanternGlass", need: 10, d: "2 MP. For 2 turns, one blow that would defeat the ally leaves it on 1 HP instead.", move: "lanternVigil" } });
  add("lanternEel", ["lanternGlass", 0.3]); add("lanternJelly", ["lanternGlass", 0.2]);
  M2.bookSpot("drownedCapital", "lanternGlass1", "Lantern beads on a coral post", "g.lantern1", "lanternGlass", 5, "A lantern-eel's shed skin hangs from a coral post, strung with beads of cold light. You take five. They stay lit in your fist and the water around your wrist goes quiet.", "Lantern Vigil");
  M2.bookSpot("drownedCapital", "lanternGlass2", "Cold light in the jelly", "g.lantern2", "lanternGlass", 5, "On the far plaza the drowned lamps have grown a skin of clear jelly, and the light inside has outlasted the city. Five more beads.", "Lantern Vigil");
})();
