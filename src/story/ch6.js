// Chapter 6, The World Opens: Brass Harbour and the Salt Heron, the blockade, the Kharam road, Kharam Oasis (contract, vote, plan), the three key dungeons, the Weeping Sea,
// Gullrest, the Maelstrom, Cinder Crown, Mourn's Gate and the Hollows, Tzavan and the Bronze Cup (owner: STORY-M3, 2026-10-31). Helpers and shared data live in ch5.js (window.Story.m3).
// Spec: ../game-mechanics/specs/M3.md. Voices: ../game-mechanics/STORY_BIBLE.md. Log: logs/STORY-M3.md. Each part below is its own closure so a half-written file still parses.
"use strict";
// ---------- part 1: banter for chapter 6 (nine packs x three lines per moment, each in the creature's own voice) ----------
(function () {
  const M3 = window.Story.m3, B = M3.banter;
  B("heron", [   // the Salt Heron: a patched three-master, Brisk at the rail
    ["A SHIP! A real one! With sails! Patched ones! I love it!", "A ship that owes a favour. Mind the captain, young bull.", "Look at that sail, dear. Somebody stitched it with love and very little thread."],
    ["A deck under my feet. A deck. ...Fine.", "Patched sails. Brisk's idea of luxury. How charming.", "Can it really cross the whole sea? How fast? Does it have a name? Is it a good one?"],
    ["Ha. A boat. My moss will be seasick by dinner.", "He wanted you to have it. ...He did not want to say why.", "Is it all right if I sit near the mast? I've never trusted floors that move."],
    ["Hah! A ship! Look at that mast! I could knock it down in one go!", "Can we sail it? Can we sail it now? Can we sail it into the storm?!", "Water carries. The sea remembers. This one has carried worse."],
    ["Hm. Seaworthy. Barely.", "Sure. A smuggler's hull. What could go wrong. Great.", "Who owns a ship? The one who can refuse it a harbour."],
    ["Is there a galley? Please tell me there is a galley.", "I saw it first! The Heron! I saw her before the dock did!", "Between us? That patch on the sail is a bedsheet. I know a bedsheet."],
    ["A gentle hull. She will carry us, dear hero. Thank you, captain.", "A ship is a road that walks. Walk her lightly.", "...Floating. Again. ...Good. ...Nap."],
    ["Please do not let me near the sails. Please. I mean it. Oops?", "Hee. A wooden ship. All that rope. All that lovely, dry rope. Hee.", "Bread in the hold. I can smell it. Brisk keeps good bread."],
    ["A ship called the Salt Heron. It sounds like a prayer. I like it.", "I will glow at the bow. The sea is wide and dark. I will not be far.", "...The tide is ours now. Be gentle with it."],
  ]);
  B("harbour", [   // Brass Harbour: cranes, hulls on slips, green-copper roofs, ropewalks
    ["Cranes! Hulls! SO MANY HAMMERS! I want to hit one!", "Honest work, young bull. It rings like a bell. Listen.", "These people are proud of what their hands make. How lovely, dear."],
    ["Noise. Smoke. Soldiers? None. ...Good.", "Green copper roofs. Quite pretty, for a place that smells of tar.", "How do they get the ships off the slips? Do they push? Who pushes? How many?"],
    ["Ha. A shipyard. Everything here floats or sinks. Nothing in between.", "Honest tar. Honest rope. ...They don't ask what we are.", "It's busy, if that's all right. I'll stay by your side."],
    ["Hah! Look at that hull! I could ram it! ...I will not ram it!", "Can I climb a crane? Can I climb two? Can I fall off? Joking! Probably!", "A harbour. Calm water. It will not last."],
    ["Hm. Good timber.", "Sure. Cranes, hulls, honest men. Let's see how long that lasts.", "Who built the first hull? Someone who was afraid of what was on the other side."],
    ["Fish stalls! Fried fish stalls! I smell all of them!", "I counted forty ships! No, forty-one! I win!", "Between us? The harbourmaster has a soft spot for sweet pastry. A gull told me."],
    ["A place of craft. Good. We should learn from them.", "Each plank was shaped by someone who wanted it to hold. Mind your step on them.", "...The slips smell of pine. ...I like pine."],
    ["Tar! Pitch! Oil! It's like a feast! Oops, I mean, a feast for the eyes!", "Hee. So many lamps. So many tempting lamps. Hee.", "Hot pies on the quay. Hot pies. I will behave. I will behave."],
    ["So many hands working together. That is a rare thing. I like them.", "The lanterns on the masts are lovely. I will glow beside them.", "...The tide in a harbour is different. Quieter. Held."],
  ]);
  B("seaFirst", [   // the first open water of the Weeping Sea
    ["The WHOLE WORLD is water! Nobody told me it was so much!", "Wide as a hope. Wide as a doubt. Sail it, young bull.", "Hold your hat, dear. Hold mine too."],
    ["Nowhere to run. ...Interesting.", "Grey and green and rain-streaked. How dramatic. Someone has taste.", "How deep is it? What lives in it? Is anything looking up at us right now?"],
    ["Ha. Open water. Nothing to hide behind. I like it.", "The sea keeps what it is given. ...Be careful what you give.", "It's very big, if that's all right. I'll stay low."],
    ["Hah! Home! This is home! Spray in my face! Yes!", "Is that a whale? Is it? It's a rock. Is that a whale? It's a rock!", "The sea is awake. Wind from the west. Mind it."],
    ["Hm. Open sea.", "Sure. No walls. No doors. Nowhere to be safe. Great.", "What do you call an edge with no far side?"],
    ["Fish! The whole sea is fish! The whole sea is dinner!", "I saw the coast first! No, wait, I saw the island! I win!", "Between us? The gulls are talking about us. They are not kind."],
    ["The sea. How long since we saw her. Thank you for bringing us.", "She is old. She is patient. Walk her lightly, and keep a hand on the rail.", "...Rocking. ...Gently. ...I could sleep a year."],
    ["WATER EVERYWHERE. Fine. Fine. I am fine. Oops.", "Hee. I am a spark on a sea. How tragic. Hee.", "Is there bread? On a ship? Always bread on a ship. Check."],
    ["Look at the light on the water. It looks like someone scattered lanterns.", "I will glow in the dark water. They will find us by it.", "...Tide's in. Somewhere, someone is thinking of us."],
  ]);
  B("kharam", [   // the Concord's oasis: seven wells, seven tongues, three guild halls
    ["SEVEN WELLS! I want to drink from all of them! One after the other!", "A city of people who agreed on something. That is a small miracle, young bull.", "Three guild masters in a row, dear. Eyes up. Smile. They are looking at you as a favour."],
    ["Seven wells. Seven ways out. I counted. I always count.", "A market in seven tongues. How cosmopolitan. I will pretend to understand all of them.", "Who are the guild masters? What do they want? What do WE want from them?"],
    ["Ha. A neutral city. Everyone smiles. Nobody trusts anybody.", "Keep your face open and your hand closed. That is how you walk in the Concord.", "Is it all right if I stay at the back? There are a lot of eyes."],
    ["Hah! Seven bells! I want to ring them all! Wait. I will ring them all!", "Can we shop? Can we shop first? Can we shop at ALL of the stalls?!", "A well is a promise. Seven wells, seven promises. Keep them."],
    ["Hm. Neutral ground.", "Sure. Guilds. Votes. Lunch. What a world we live in.", "Who pays for peace in a place that wages none?"],
    ["LUNCH. They said lunch. I heard it. Lunch!", "I saw Corvin first! The loud one! He waved at me first, too!", "Between us? Peya looks at you like she is reading the back of your head."],
    ["A place of agreements. Good. We need more of them.", "Seven wells, seven tongues, one table. Sit at it humbly.", "...The shade here is pleasant. ...Wake me for lunch."],
    ["Fireworks. Please. Just a small fireworks. For the guilds. Oops?", "Hee. A hall full of serious people. I want to set a very small chair on fire. Hee. No.", "Lunch is a rule. I love this city. I love it."],
    ["So many kind people at one table. I feel we are welcome.", "I will glow in the hall, if it helps them see your face.", "...A well is deep. Be careful what you drop into it."],
  ]);
  B("maelstrom", [   // the sea caves round the whirlpool, the Mother of the Maelstrom
    ["It is SPINNING! The whole sea is spinning! Why is it spinning?!", "A great wheel in the water, young bull. Mind your footing. Mind your head.", "Do not look straight into it, dear. It looks back."],
    ["A whirlpool. A big one. Sure. Why not.", "A great round chamber with a pool at the middle. Obviously the Mother lives here. Dramatic.", "How deep does it go? Is it a drain? Does it ever stop? What is at the bottom?"],
    ["Ha. Wet rock. Wet moss. Wet me. Wonderful.", "Cold first. Then wet. Then she stops. ...That is what they said.", "It's loud, if that's all right. I'll hold your cloak."],
    ["Hah! A WHIRLPOOL! I want to jump in! Do not let me jump in!", "Can we ride it? Can we ride it down? Can we ride it back up?!", "The sea is angry here. It is not angry at us. Stay together."],
    ["Hm. Water.", "Sure. A cave with a creature in it. The usual. Great.", "What does a mother guard? Whatever she is afraid to lose."],
    ["It smells like fish! Old fish! The best kind!", "I saw it first! The whirlpool! I saw it from outside!", "Between us? That glow in the water is eyes. Many eyes."],
    ["She is old and she is tired. Be gentle. Be firm.", "A spinning water is a lock. Still it, dear hero, and it opens.", "...The cave is cold. ...Warm me when we are done."],
    ["So wet. So very wet. I hate it. I hate it. Oops?", "Hee. A cave full of water. I am extremely small. Hee. Please hold me.", "Do whirlpools have snacks? The sailors say they do."],
    ["Whatever is in there, it is not wicked. It is only strong.", "I will glow in the dark water. We will see where we go.", "...The tide is rising. Be quick. Be gentle."],
  ]);
  B("ember", [   // Cinder Crown: black sand, steaming vents, the volcano and the wolf
    ["A VOLCANO! A real one! It is RED! I love it!", "A hot mountain full of old anger, young bull. Mind the ledge.", "Stay close, dear. The ground is warm and not all of it is safe."],
    ["Ash on the wind. Black sand. A volcano. Sure.", "How lovely. We came all this way to be cooked. Marvellous.", "Does it erupt? When? Is that why the wolf runs? Is it running from the mountain?"],
    ["Ha. Fire. Of course there is fire.", "A wolf runs where the earth is hot. Water stops a runner. ...That is what they said.", "It is warm, if that's all right. I feel a little faint."],
    ["Hah! Lava! I want to throw something in it! Rocks! Rocks!", "Can we climb to the top? Can we look down? Can we look INTO it?!", "Fire loves air. Mind the wind."],
    ["Hm. Heat.", "Sure. A volcano. A wolf. A deadline. Great.", "Who runs from a fire it was born in?"],
    ["It smells like roast! Everything smells like roast!", "I saw the smoke first! From the sea! I win!", "Between us? The wolf is not angry. It is afraid. I can tell."],
    ["An old fire, and an old wolf. We are old too. Be gentle.", "A fire is a guest. Do not invite it further than the door.", "...The warmth is pleasant. ...Careful. Do not sleep near the vent."],
    ["Oh. Oh no. I LOVE it here. Oops. I mean no. I mean yes.", "Hee. A volcano is a very big match. Hee. A very, very big match.", "Is the lava edible? Joking. Is it edible? Joking."],
    ["It burns, but it does not hate. I can feel it.", "I will glow beside the lava. We will not seem so small.", "...The fire is old. So is the wolf. Both need rest."],
  ]);
  B("mourn", [   // Mourn's Gate and the Hollows: funeral bells, shrouds on lines, the ferry on the black river
    ["Why are the bells ringing? Who died? Is it someone we know?!", "A town of those who bury their own. Hush, young bull. Take off your hat.", "Hold my paw, dear. They are not afraid of us. They are tired."],
    ["Bells. Candles. Shrouds. ...I am leaving. No. I am not. Fine.", "How charming. A town devoted to funerals. We will fit right in.", "Where does the ferry go? Who rows? Does the river have another side?"],
    ["Ha. A town for the dead. I like the manners.", "The ferryman wants a story. Give him a good one. He keeps the ones he likes.", "It's very quiet, if that's all right. I'll stay close."],
    ["Hah! Spooky! Is it spooky? It is a bit spooky! Not scared! Not scared!", "Can we ring the bell? Can we ring it? Can we ring it and run?", "The dead listen. Speak low."],
    ["Hm. Graves.", "Sure. A cave of the dead. A Gate Hound. Great.", "Who guards a gate that nobody leaves through?"],
    ["It smells of candle wax and cold soup! I am hungry!", "I saw the hound statue first! The bronze one! I saw it first!", "Between us? That is not a statue. That is a hint."],
    ["Honour them. They carry what we cannot.", "A gate is a mercy for those who cross it. Walk it lightly.", "...Quiet here. ...Heavy, but quiet."],
    ["Candles! So many candles! Oops. I will not touch one. I will not touch one.", "Hee. A town full of lit candles and I am a very hot spark. Hee. Sorry.", "Do the dead eat bread? Asking for a friend."],
    ["They are grieving. We should be gentle with all of them.", "I will glow low. I will not frighten them.", "...The tide goes out for everyone. Not all return."],
  ]);
  B("arena", [   // Tzavan: the Hall of the Hundred Banners over the harbour, the crowd
    ["A COLOSSEUM! A real one! Can I fight in it? Can we ALL fight in it?!", "A ring of stone, and the crowd. Remember why you fight, young bull.", "Mind your steps, dear. Crowds are not always kind."],
    ["A cage with an audience. How familiar. ...Not funny.", "Marvellous. All those people cheering for a fight. Charming. Truly.", "How many fights are there? Who wins? Is there a prize? Is there a way out?"],
    ["Ha. A cheering crowd. I do not trust it.", "A man who is paid to watch you bleed is not your friend. ...Remember that.", "It's loud, if that's all right. I will stay near the exit."],
    ["Hah! The crowd! I want the crowd! I WANT THE CROWD!", "Can we win? Can we win everything? Can we win a trophy? Can we keep it?!", "A noisy sea. Fight it as you fight a storm."],
    ["Hm. Arena.", "Sure. A stage. A crowd. A cage. Perfect.", "Who pays for a death that is entertainment?"],
    ["Food stalls! The arena has FOOD STALLS! Win first, eat second!", "I'll win more than you! I'll win more than ALL of you!", "Between us? The champion is nervous. I saw her hands shake."],
    ["Fight with honour, and fight to end it. Not to please them.", "A crowd is a tide. Do not let it carry you.", "...So much noise. ...Wake me when we win."],
    ["A big wooden stand! Full of people! Oops. No. I did not think that. I did not think that.", "Hee. A flag on every pole. All that cloth. Hee. No. Fine. No.", "Is there bread for the crowd? Is it free? Is it free for us?"],
    ["They cheer for blood. Let us give them something kinder.", "I will glow at your back. The crowd will see you, and not the fear.", "...The sand is warm. The sand has seen much."],
  ]);
})();

// ---------- part 2: chapter 6 start, Brass Harbour, the Salt Heron, the blockade (S7), the ferry pass ----------
(function () {
  const S = window.Story, D = window.Data, M3 = S.m3, T = M3.T, m = M3.m;
  const say = (who, text) => UI.say([[who, text]]);

  S.begin[6] = async F => {   // called by the last beat of chapter 5 (the siege) after the caravan voyage
    G.ch = 6; F.set("ch6.start"); F.autoSave = true;
    await Cinema.title("Chapter 6", "The World Opens");
    F.save(true);
    F.go("brassHarbour", "from_haldarsReach");
  };
  S.trigger["ch6.brass"] = async F => {   // dbg.jump(6) and old saves land here without begin[6]
    if (G.ch < 6) G.ch = 6;
    if (!F.f("ch6.start")) F.set("ch6.start");
    if (!F.f("ship") && F.qstep("m_heron") === undefined) F.quest("m_heron", 0);
  };
  S.done["ch6.brass"] = F => F.f("ch6.start");

  M3.region("brassHarbour", { n: "Brass Harbour", arena: "harbourCoast", music: "harbour", town: "brassHarbour", inn: "brass", autos: ["ch6.brass", "harbourArrive"],
    npcs: [["innkeeper", "The Salt Heron Berth"], ["merchant", "Chandlery"], ["yusra", "Harbourmaster Yusra Daal"], ["captain", "Captain Brisk", s => s.f["ch6.arrive"]], ["shipwright", "A shipwright on a slip"],
      ["purser", "The ship's purser", s => s.f.ship], ["r1", "A docker on the quay"], ["r2", "A sailor mending a net"], ["r3", "A ropewalk hand"]],
    exits: [["haldarsReach", "The caravan gate, west", () => true], ["kharamRoad", "The inland road, east", s => s.f["ch6.arrive"]], ["weepingSea", "The berth", s => s.f.ship && s.f["ch6.s7"]]],
    things: [["customsCharter", "The customs house", () => true, "trigger"], ["blockadeS7", "Cast off from the berth", s => s.f.ship && !s.f["ch6.s7"], "trigger"]] });
  M3.rumours("brassHarbour", ["The Mother of the Maelstrom keeps a frozen heart. Chill and then soak her whirlpool and she goes still.", "A hermit with a black pearl lives off Gullrest. He hands it to anyone who finds him.",
    "The sea itself turns every winter at the Straits."], [M3.clue(7, 0)]);
  M3.onRumour["brassHarbour:1"] = async F => { F.set("rum.hermit"); };
  M3.talkTown("brassHarbour", { inn: "brass", shop: "brass", who: ["docker", "sailor", "docker"], opts: { clues: 1 },
    innLine: F => F.f("ship") ? "The Salt Heron Berth. A bed, a bath and a view of your own ship. Do not look at her too long, she gets ideas." : "The Salt Heron Berth. Beds by the night, bunks by the hour, and a bell for dinner. Harbour rates.",
    shopLine: "Rope, tar, lamp-oil, and whatever the sea did not take. Chandlery rates, friend. The sea is dear enough." });
  Object.assign(T("brassHarbour"), {
    shipwright: async F => { await say("shipwright", F.f("ship") ? "She is a good hull and a poor liar. Brisk patched that sail himself. I told him a bedsheet was not canvas. He told me it was a flag." : "That hull on the end slip? Forty years old and nobody dares scrap her. She has outrun three harbour fleets and one tax collector."); },
    purser: async F => { await say("purser", "Ship's stores, captain. Bandages, tea and a little brandy for the nerves. Anything fancier, the harbour has it, and the harbour is dearer."); await F.shop("purser"); },
    yusra: async F => {
      if (F.f("ch6.s7") && !F.f("ferryPass")) {
        await say("yusra", "You broke the galleys at my harbour mouth. I will not pretend it did me no good. Here: a ferry pass.");
        await say("yusra", "Any pier you have touched. No fee. The Concord will not tax a man twice for the same sea.");
        Systems.giveFerryPass(F); F.sfx("coin"); return;
      }
      if (F.f("ferryPass")) await say("yusra", "Come back when you have more piers. I keep a chair for the ones who sail well.");
      else if (F.f("ship")) await say("yusra", "The galleys sit at the harbour mouth like a lid. No ship leaves with them there. Take the road east if you do not like waiting.");
      else await say("yusra", "Harbourmaster Yusra Daal. The ledger is not a threat in this port. Mind the cranes.");
    },
    captain: async F => {
      if (!F.f("ch6.s7")) {
        await say("captain", F.f("ch6.plan") ? "Ahuacan, friend? Past the galleys. Do you want to deal with them now, or after breakfast? The answer is now, but I am polite." : "She is ready any time you are. The galleys at the harbour mouth will have opinions about it.");
        const i = await F.ask("Cast off from the berth?", [{ label: "Cast off" }, { label: "Not yet" }], { top: "40%" });
        if (i === 0) await M3.blockade(F);
        return;
      }
      if (F.f("ch6.plan")) { await M3.helm(F); return; }
      await say("captain", ["Brisk's the name, still. The sea is open since you cleared it. Mind the Straits: the water there goes round.", "She is yours to point. I only hold the wheel and tell lies.", "A tip, free of charge. Everything on this sea hides something. Look at rocks twice."][(G.nights || 0) % 3]);
      const i = await F.ask("Sail?", [{ label: "Cast off" }, { label: "Not yet" }], { top: "40%" });
      if (i === 0) F.go("weepingSea", "from_brassHarbour");
    },
  });
  S.trigger.blockadeS7 = async F => {
    if (F.f("ch6.s7") || !F.f("ship")) return;
    await M3.blockade(F);
  };
  S.done.blockadeS7 = F => F.f("ch6.s7");

  // ---------- the arrival: the Salt Heron, Brisk, Yusra ----------
  S.trigger.harbourArrive = async F => {
    if (!M3.once(F, "ch6.arrive")) return;
    G.lastTown = "brassHarbour"; F.music("harbour"); F.quest("m_heron", 0);
    await Cinema.panels([{ img: "assets/cinema/m3_ship.png", text: "The Salt Heron at her berth: three masts, one patched sail, and a flag nobody here has seen before.", pan: "in" }], { music: "harbour" });
    await Cinema.stage(async c => {
      M3.actors(c, [["yusra", "npcTrader", 150, 20], ["captain", "npcBrisk", 260, -36], ["ship", "harborShip", 330, -70, { scale: 1.2 }]]);
      await c.pan(c.hero.x + 190, c.hero.y - 20, 900);
      await c.say([["narr", "The caravan road ends at a harbour the colour of old coins: green copper roofs, cranes like herons, hulls on slips with their ribs showing. At the end berth lies a three-master with one patched sail. A man leans on her rail with the air of someone who has been there some time and means to deny it."]]);
      c.emote("captain", "!");
      await c.say([["captain", "Brisk's the name. Captain of a ship with a flag. Told you, friend: you do not outsail a war."], ["hero", "Brisk."], ["captain", "The very same. A little more respectable. Hardly at all."]]);
      await c.say([["yusra", "Harbourmaster Yusra Daal. The Reach sent word by pigeon, and Commander Saffa's pigeons do not lie. The berth fee is paid. Her papers are yours."]]);
      c.sfx("menuOk"); c.fx("sparkle", c.hero.x + 150, c.hero.y);
      await c.say([["narr", "She hands you a roll of stamped paper, tied with a blue cord. The Salt Heron's papers, in your name."], ["hero", "(A ship. Mine. Brisk's. Both.)"],
        ["captain", "Mine to sail, yours to say where. Do not touch the wheel unless you want to be a captain. The pay is dreadful."], ["captain", "The fare, since you ask: one story per voyage. I collect them."]]);
      c.follow();
    });
    Systems.giveShip(F, { pass: false }); F.set("ship"); F.give("harbourPass", 1, true); F.give("shipLog", 1, true);
    F.questDone("m_heron"); F.quest("m_kharam", 0);
    await F.banter("heron");
    await F.banter("harbour");
  };
  S.done.harbourArrive = F => F.f("ch6.arrive");

  // ---------- customs house: the Company's charter (lore) ----------
  M3.spot("brassHarbour", "customsCharter", async F => {
    const first = !F.f("lore.charter");
    await UI.say([["narr", "The customs house keeps the Company's charter under glass, as a point of pride or a warning. Cream vellum, a sun wheel for a seal, and under the long list of privileges a single line of signature."]]);
    await UI.say([["narr", "The Tzakal Harvesting Company, chartered to take, hold and answer for the creatures and works of the old people, for the greater strength of the Dominion. Signed: Davichi, Founder."]]);
    if (first) { F.set("lore.charter"); await UI.say([["hero", "(Davichi.)"], ["narr", "A clerk beside the case does not look up. 'The glass is cleaned weekly,' she says, 'and we do not touch the signature.'"]]); }
  });
  S.done.customsCharter = F => F.f("lore.charter");
  D.LORE.companyCharter = "The Company's charter, in the Brass Harbour customs house: \"Chartered to take, hold and answer for the creatures and works of the old people. Signed: Davichi, Founder.\"";

  // ---------- S7: the blockade at the harbour mouth ----------
  M3.blockade = async F => {
    if (F.f("ch6.s7")) return true;
    F.music("tension");
    const ok = await M3.general(F, 7, { level: 28, soldiers: [["legionOptio", 26, " A"], ["legionOptio", 26, " B"]], bg: "seaDeck", title: "The Harbour Mouth",
      place: "the harbour mouth of Brass Harbour", where: "It slipped over the side and swam out past the lighthouse, not once looking back.", after: ["(The empire shut a port to catch one ship. It must think the ship is worth it.)"],
      setup: async c => {
        const g = S.generalFor(7) || { id: "horncinder" };
        M3.actors(c, [["g1", "harborShip", 250, -110, { scale: 1.15 }], ["g2", "harborShip", 310, 70, { scale: 1.15 }], ["gen", g.id, 220, -14, { scale: 1.2 }], ["o1", "npcOptio", 260, -50], ["o2", "npcOptio", 260, 30], ["captain", "npcBrisk", -50, -24]]);
        c.sprite("collarAltar", c.hero.x + 190, c.hero.y - 10); c.tint("#0c1a22", 0.2, 600);
        await c.pan(c.hero.x + 190, c.hero.y - 10, 1000);
        await c.say([["narr", "The Salt Heron's bow rounds the last lighthouse and stops, because the harbour mouth has been shut with a wall of galleys, side by side, oars shipped. On a barge between the two centre ships a black altar glows, and on the barge, at the end of a chain of light, stands a creature of the pens."]]);
        c.emote("captain", "sweat");
        await c.say([["captain", "I told them my papers were in order. They told me the Dominion has reviewed the order of all papers."], ["captain", "Friend, I do not like the look of that thing on the barge. I like even less the look of its eyes."]]);
        c.sfx("encounter"); c.shake(2, 400); c.follow();
      } });
    if (!ok) return false;
    F.set("ch6.s7");
    await S.m2.stage(async c => {
      M3.actors(c, [["g1", "harborShip", 250, -110, { scale: 1.15 }], ["g2", "harborShip", 310, 70, { scale: 1.15 }], ["captain", "npcBrisk", -50, -24]]);
      await c.pan(c.hero.x + 170, c.hero.y - 10, 800); c.sfx("oars");
      const out = Promise.all([c.walk("g1", c.hero.x + 900, c.hero.y - 150, 5200), c.walk("g2", c.hero.x + 960, c.hero.y + 110, 5600)]);
      await c.say([["captain", "The galleys are rowing home with the tide. They will say it was a storm. Admirals always say it was a storm."]]);
      await out; c.remove("g1"); c.remove("g2"); c.remove("captain"); c.follow();
    }, { music: "harbour" });
    return true;
  };
  // ---------- the helm: the end of chapter 6 (needs ch6.plan); chapter 7's opening belongs to STORY-M4 ----------
  M3.helm = async F => {
    await say("captain", "Ahuacan, friend? The Lowstep stairs. Rest first. The palace has waited nineteen years. It will wait for you to eat.");
    const i = await F.ask("Sail for Ahuacan?", [{ label: "Sail" }, { label: "Not yet" }], { top: "40%" });
    if (i !== 0) { await say("captain", "Then eat. I will be here, and so will the tide."); return; }
    if (!F.f("ch6.s7")) { const ok = await M3.blockade(F); if (!ok) return; }
    F.set("ch6.done"); F.questDone("m_plan"); F.save(true);
    if (S.begin[7]) await S.begin[7](F);
    else await UI.say([["narr", "The Salt Heron slips out between the lighthouses with the tide behind her. To be continued in Chapter 7."]]);
  };
  S.trigger.salt_heron_helm = async F => { if (F.f("ch6.plan")) await M3.helm(F); };
})();

// ---------- part 3: the Kharam road, the caravan raiders (S9), Old Hollowbell (L4) ----------
(function () {
  const S = window.Story, D = window.Data, M3 = S.m3, T = M3.T, m = M3.m;
  const say = (who, text) => UI.say([[who, text]]);

  M3.region("kharamRoad", { n: "The Kharam Road", arena: "flats", music: "desert", table: "kharamRoad", fields: true, overland: true,
    exits: [["brassHarbour", "West to Brass Harbour", () => true], ["kharamOasis", "East to Kharam Oasis", () => true], ["drownedFenShrine", "The sunken track to the Fen Shrine", () => true],
      ["giantQuarry", "The cart road to the Quarry of the Stone Giants", () => true], ["sunbirdRoost", "The mesa stair to the Sunbird Roost", () => true]],
    things: [["raiderS9", "The burning crossroads", s => s.f["ch6.kharam"] && !s.f["ch6.s9"], "trigger"], ["roadChest1", "A chest in a wadi", s => !s.f["c.road1"], "chest"], ["roadChest2", "A chest under the mesa", s => !s.f["c.road2"], "chest"]],
    legends: [{ id: "L4", enemy: "oldHollowbell", level: 28, chance: 0.04 }] });
  S.chest.roadChest1 = async F => { if (F.f("c.road1")) return false; F.set("c.road1"); F.give("sunwater", 3); F.gold(250); await UI.say([["narr", "A caravan-guard's chest in a dry wadi, the lid weighted with a flat stone. Three Sunwater Flasks and a purse of kakal. Whoever left it meant to come back."]]); };
  S.chest.roadChest2 = async F => { if (F.f("c.road2")) return false; F.set("c.road2"); F.give("tonic", 2); await UI.say([["narr", "Under the lee of the mesa, a wooden chest the colour of the rock. Inside, wrapped in oiled cloth: two Clearwater Tonics. Someone wrote on the cloth: 'for the ones who get stung.'"]]); };

  // ---------- S9: the raiders at the crossroads (only after Kharam has been reached) ----------
  S.trigger.raiderS9 = async F => {
    if (F.f("ch6.s9") || !F.f("ch6.kharam")) return;
    F.music("tension");
    const ok = await M3.general(F, 9, { level: 30, soldiers: [["legionArcher", 28, " A"], ["legionArcher", 28, " B"]], bg: "flats", title: "The Road Raider", banter: null,
      place: "the burning crossroads of the Kharam road", where: "It broke into the hills and kept to the wadis, running with the wind in its mane.", after: ["(The empire sends its collared ones to rob the Concord's carts. A caravan is not a threat. A caravan is a message.)"],
      setup: async c => {
        const g = S.generalFor(9) || { id: "horncinder" };
        M3.actors(c, [["w1", "supplyWagon", 150, -50], ["w2", "supplyWagon", 220, 30], ["gen", g.id, 280, -10, { scale: 1.2 }], ["a1", "npcLegionGuard", 330, -60], ["a2", "npcLegionGuard", 330, 50], ["cm", "npcTrader", 90, 26]]);
        c.sprite("collarAltar", c.hero.x + 250, c.hero.y - 6); c.fx("fire", c.hero.x + 150, c.hero.y - 40); c.fx("smoke", c.hero.x + 220, c.hero.y + 20);
        await c.pan(c.hero.x + 200, c.hero.y, 900);
        await c.say([["narr", "Black smoke over the crossroads. Two wagons burn with their teams cut loose. A man sits against a wheel with an arrow in his arm, watching a creature of the pens stand on a wagon-bed at the end of a chain of light, while two archers go through the crates."]]);
        c.emote("cm", "!");
        await c.say([["caravanMaster", "The Concord's cargo! Dates, lamp-oil, the guild's lunch! Do something about it, if you are going to be here!"]]);
        c.sfx("encounter"); c.follow();
      } });
    if (!ok) return;
    F.set("ch6.s9");
    await Cinema.stage(async c => {
      M3.actors(c, [["cm", "npcTrader", 80, 24]]);
      await c.say([["caravanMaster", "Thirty years on this road and I have never seen the empire send a collared one to rob a cart. Tell the guild masters. Tell them the road is not safe, and that it is not an accident."], ["narr", "He presses a purse into your hand: the guild's reward, and a bag of dates that did not burn."]]);
    });
    F.gold(2 * m(6)); F.give("sunwater", 2);
  };
  S.done.raiderS9 = F => F.f("ch6.s9");

  // ---------- legends: the quest chain around Old Hollowbell (L4) and the Black Pearl Hermit (L5) ----------
  if (D.LEGENDS && D.LEGENDS.L4) { D.LEGENDS.L4.level = 28; D.LEGENDS.L5.level = 35; }
  S.legend = S.legend || {};
  S.legend.L4 = async (F, info) => {
    F.music("legend");
    await UI.say([["narr", "Somewhere a bell is ringing, low and slow, and the sound comes from underfoot as much as from the air. A tortoise the size of a wagon hauls itself out of the heat haze, a bronze bell grown into its shell."], ["narr", "Dong. ...Dong. It stops, looks at you with one old wet eye, and rings once more, politely."]]);
    const i = await F.ask("Old Hollowbell", [{ label: "Face it" }, { label: "Back away" }], { top: "38%" });
    if (i !== 0) { F.music(F.regionMusic()); return false; }
    await Cinema.boss({ id: "oldHollowbell", name: "Old Hollowbell", title: "Rings When the Wells Run Low", bg: F.arenaOf(G.region), music: "legend", lines: [["narr", "A great bronze bell drags itself out of the mud, and it rings."]] });
    F.checkpoint();
    const res = await F.fight(Core.bossFoes ? Core.bossFoes("oldHollowbell", info.level || 28) : [F.mkEnemy("oldHollowbell", info.level || 28)], { noFlee: true, music: "legend", goldMult: 0, xpBonus: 1.5, bg: F.arenaOf(G.region), intro: Core.ENEMIES.oldHollowbell && Core.ENEMIES.oldHollowbell.intro });
    if (res !== "win") { F.music(F.regionMusic()); return false; }
    F.set("l4.done"); F.gold(10 * m(6));
    await S.m2.outro("oldHollowbell", [["narr", "The bell goes quiet. The tortoise settles into the sand with a sound like a door closing in a very large house. From under his shell rolls a round grey stone, warm on one side, marked with a ring of wells."], ["hero", "(He rang for the water. Nobody answered.)"]], { fx: "dust", end: "bow", sfx: "bell", dx: 150 });
    await Systems.giveReward(D.LEGENDS.L4.reward, 6);
    F.questDone("hollowbell");
    F.music(F.regionMusic());
    return true;
  };
  S.legend.L5 = async (F, info) => {
    F.music("legend");
    await UI.say([["narr", "A rock that only shows at low tide. On it, a crab-man sits very still around a pearl as black as a well. He looks at you with eyes like two small wet coins."], ["hermit", "A pearl is a grain of sand that did not stop being angry. Do you carry anything you have not stopped being angry about? Then show me."]]);
    const i = await F.ask("The Black Pearl Hermit", [{ label: "Face him" }, { label: "Back away" }], { top: "38%" });
    if (i !== 0) { F.music(F.regionMusic()); return false; }
    await Cinema.boss({ id: "blackPearlHermit", name: "The Black Pearl Hermit", title: "Keeper of the Black Pearl", bg: "seaDeck", music: "legend", lines: [["hermit", "You carry things you have not put down. Show me."]] });
    F.checkpoint();
    const res = await F.fight(Core.bossFoes ? Core.bossFoes("blackPearlHermit", info.level || 35) : [F.mkEnemy("blackPearlHermit", info.level || 35)], { noFlee: true, music: "legend", goldMult: 0, xpBonus: 1.5, bg: "seaDeck", intro: Core.ENEMIES.blackPearlHermit && Core.ENEMIES.blackPearlHermit.intro });
    if (res !== "win") { F.music(F.regionMusic()); return false; }
    F.set("l5.done"); F.gold(10 * m(6));
    await S.m2.outro("blackPearlHermit", [["hermit", "Fairly fought. Take it. A pearl should be carried by someone who knows what it cost."], ["narr", "He lowers the black pearl into your hands. It is cold, and heavier than the sea, and set around it in a ring of old silver is the first piece of something that was made to be worn."]], { fx: "glow", end: "bow", scale: 1.2, dx: 110 });
    await Systems.giveReward(D.LEGENDS.L5.reward, 6);
    F.music(F.regionMusic());
    return true;
  };
})();

// ---------- part 4: Kharam Oasis: the Concord, guild contracts, bounties, the vote, the rescue plan, the well, the shrine ----------
(function () {
  const S = window.Story, D = window.Data, M3 = S.m3, T = M3.T, m = M3.m;
  const say = (who, text) => UI.say([[who, text]]);

  M3.region("kharamOasis", { n: "Kharam Oasis", arena: "oasisRuins", music: "kharam", town: "kharamOasis", inn: "kharam", autos: ["kharamArrive"],
    npcs: [["innkeeper", "The Seventh Stool"], ["merchant", "Market of seven tongues"], ["rhaz", "Rhaz of the Dune Wardens"], ["peya", "Peya of the Lantern Circle"], ["corvin", "Corvin Dray of the Saltwater Compact"],
      ["ilse", "Sister Ilse at the Flock shrine"], ["wellKeeper", "The Well-Keeper"], ["pell", "Pell"], ["hadiya", "Hadiya Wells", s => s.f["ch6.kharam"]], ["r1", "A pilgrim at the well-stone"], ["r2", "A woman selling water"], ["r3", "A caravan guard"]],
    exits: [["kharamRoad", "The road west", () => true]],
    things: [["concordHall", "The hall of the Concord", s => s.f["ch6.contract"] && !s.f["ch6.vote"], "trigger"], ["briefing", "The well-stone", s => s.f["ch6.vote"] && !s.f["ch6.briefed"], "trigger"]] });
  M3.rumours("kharamOasis", ["The Church preaches that the Titans must not be woken. The Empire preaches that they must.", "A bronze statue of a hound with three heads stands in the old market. It has a plaque no one reads.",
    "Old Hollowbell the tortoise rings his shell when the water is low."], [M3.clue(8, 0), M3.clue(9, 0)]);
  M3.onRumour["kharamOasis:1"] = async F => { F.set("rum.gatehound"); };
  M3.onRumour["kharamOasis:2"] = async F => { F.quest("hollowbell", 0); };
  M3.talkTown("kharamOasis", { inn: "kharam", shop: "kharam", who: ["scholar", "wellwoman", "caravaner"], opts: { clues: 2 },
    innLine: "The Seventh Stool. We keep one stool empty for whoever arrives last. The beds are on the second floor, and there is a rule about lunch.",
    shopLine: "Seven tongues, seven prices, one stall. Ask for the traveller's rate. It is the same rate, but it sounds kinder." });

  // ---------- the guild masters: contract, proof, bounty ----------
  const GUILD = {
    rhaz: { who: "Dune Wardens", k: "k4", bounty: "bounty1",
      offer: ["The Dune Wardens hold the cart road to a quarry, and the empire's miners have been waking what is cut into the cliffs. Giants. Half-made, half-asleep, and angry about it.", "Go in. A guard waits at the works, the kind with a collar on its neck. Beat the guard, then beat the giant. Bring me back the thing a giant's fingernail makes. I will know."],
      more: "The quarry first. Then we will talk about what you want to hang over the Concord's neck.", done: "The quarry is quiet. The road is quiet. I will say it in the hall, when you ask me to." },
    peya: { who: "Lantern Circle", k: "k5", bounty: "bounty2",
      offer: ["Above the road a mesa stands with a golden tower on it, and a bird that nests there is older than the Concord. The Company has been taking her chicks.", "Go and see what the roost has become. And what did you do, the last time someone trusted you with a thing that burns? Bring me the feather key."],
      more: "The roost, then. Do not hurry the last stair. The braziers go out if you stand still.", done: "She is calm again. The chicks sing at dawn. I will say yes in the hall, if you ask." },
    corvin: { who: "Saltwater Compact", k: "k3", bounty: "bounty3",
      offer: ["The fen by the road is a graveyard of ships and a shrine, and the guardian in the water has been waking. Four sluices, four carvings, and a lot of ways to drown. Do it in order. I am told the order is on the walls.", "Put it back to sleep and I will buy you lunch. This is a very serious offer. I do not make it lightly, as I make it very often."],
      more: "Fen first, lunch after. I am keeping a chair warm.", done: "The fen is quiet! I owe you lunch. I will say yes in the hall, and I will say it with my mouth full." },
  };
  const kills = (id, key) => (G.kills[id] || 0) - (G.flags[key] || 0);
  const BOUNTY = {   // quest id -> { id: kills of this creature since taken, n, goods? }
    bounty1: { enemy: "mesaRoc", n: 5, text: "Five Mesa Rocs off the Kharam road. They have taken to the caravans. Count the feathers, do not count the misses." },
    bounty2: { goods: "automatonCore", n: 3, text: "Three Automaton Cores, from the rusting builder machines on the road. I would like to know what they were building. The cores will do." },
    bounty3: { enemy: "sirenEel", n: 3, text: "The siren eels in the harbour channel sing the pilots onto the rocks. Silence three of them. Out on the open sea, by the Salt Heron's wake." },
  };
  const bountyProgress = id => { const b = BOUNTY[id]; return b.goods ? Math.min(b.n, G.goods[b.goods] || 0) : Math.min(b.n, kills(b.enemy, id + ".base")); };
  const board = async (F, master) => {
    const q = GUILD[master].bounty, b = BOUNTY[q], st = F.qstep(q);
    if (st === "done") { await say(master, "The board is clear of yours. Come back when the road has had time to grow new problems."); return; }
    if (st === undefined) {
      await say(master, b.text); F.quest(q, 0); if (b.enemy) G.flags[q + ".base"] = G.kills[b.enemy] || 0; return;
    }
    const got = bountyProgress(q);
    if (got >= b.n) {
      if (b.goods) G.goods[b.goods] -= b.n;
      F.questDone(q); F.gold(6 * m(6)); F.sfx("coin"); await say(master, "That is the number. Six measures of kakal, as posted. The guild thanks you, in the usual way: with money.");
    } else await say(master, b.goods ? `Cores: ${got} of ${b.n}. The machines rust out on the road. Bring them when you have them.` : `${got} of ${b.n} so far. The board remembers every one.`);
  };
  const eligible = F => F.f("k4.done") && (F.f("k3.done") || F.f("k5.done"));
  const guild = master => async F => {
    const g = GUILD[master], took = F.f("contract." + master), fin = F.f(g.k + ".done");
    if (!F.f("ch6.kharam")) { await say(master, "Not here. The hall is ahead."); return; }
    if (F.f("ch6.vote")) { await say(master, g.done); }
    else if (eligible(F) && !F.f("ch6.vote")) await say(master, "The proof is on the table, and there are two guilds behind it. The wells are already ringing in the hall.");
    const opts = [{ label: took ? (fin ? "The contract: done" : "The contract") : "Ask about a contract" }, { label: "The bounty board" }, { label: "Nothing, thank you" }];
    const i = await F.ask(g.who, opts, { top: "36%", back: true });
    if (i === 1) { await board(F, master); return; }
    if (i !== 0) return;
    if (fin) { await say(master, g.done); return; }
    if (took) { await say(master, g.more); return; }
    await UI.say(g.offer.map(t => [master, t]));
    F.set("contract." + master);
    if (!F.f("ch6.contract")) { F.set("ch6.contract"); F.questDone("m_contract"); F.quest("m_vote", 0); await UI.say([["hero", "(A contract. First favour. It never ends there.)"]]); }
  };
  Object.assign(T("kharamOasis"), { rhaz: guild("rhaz"), peya: guild("peya"), corvin: guild("corvin"),
    pell: async F => { await say("pell", F.f("ch6.vote") ? "I keep their books now. They owe me, for once. It is a very strange feeling, being owed." : "I keep their books now. They owe me, for once."); },
    ilse: async F => {
      await say("ilse", "The flame does not ask who you are. It asks what you will do. Warm yourself, friend. The alms-table has what the road took from you.");
      await F.shop("kharamChurch");
    },
    wellKeeper: async F => {
      await say("wellKeeper", F.f("l4.done") ? "A ring of wells on a grey stone! You met the old bell. The wells remember him. Sit. Say who you want to become again, and the water will oblige." : "Seven wells. Each one a different water, and each one a different mind. Sit. I will pour. You may be the person you were before the road, for a price.");
      await Systems.respecDialog();
    },
    hadiya: async F => {
      if (F.f("ch6.plan")) { await say("hadiya", "Ranna says there is bread. I do not know what you will do with that. I will keep the plan warm."); return; }
      if (F.f("ch6.briefed")) {
        if (G.nights <= (G.flags["ch6.n1"] || 0)) { await say("hadiya", "A basket crosses a harbour and a sewer, friend. It takes a night. Sleep. Everything costs, including this."); return; }
        await M3.rannaReply(F); return;
      }
      if (F.f("ch6.vote")) { await M3.briefing(F); return; }
      await say("hadiya", F.f("ch6.contract") ? "The Concord does favours, and favours come in a sequence. Finish the contracts. I will be here." : "Everything costs. Choose what you pay with.");
    },
  });

  // ---------- the arrival ----------
  S.trigger.kharamArrive = async F => {
    if (!M3.once(F, "ch6.kharam")) return;
    G.lastTown = "kharamOasis"; F.music("kharam"); F.questDone("m_kharam"); F.quest("m_contract", 0);
    await Cinema.stage(async c => {
      M3.actors(c, [["rhaz", "npcRhaz", 200, -24], ["peya", "npcPeya", 235, 18], ["corvin", "npcCorvin", 272, -8], ["hadiya", "npcHadiya", 140, 40]]);
      await c.say([["narr", "Seven wells stand in a ring of grey stone in the middle of the green, and as you walk into the ring a bell is struck at the first well, and then at the second, and then at each in turn, all seven, until the last note hangs in the air like a held breath."]]);
      for (let i = 0; i < 7; i++) { c.sfx("bell"); await c.wait(260); }
      await c.pan(c.hero.x + 200, c.hero.y, 800);
      await c.say([["narr", "Three people wait at the hall steps: a broad slow-eyed man with a caravan guard's shoulders, a small old woman who looks at you as if reading the back of your head, and a sun-tanned man already halfway to a joke."],
        ["rhaz", "Show me the creature. Then tell me about yourself."], ["peya", "And what did you do with the last favour you were given?"], ["corvin", "We have three rules, and one of them is lunch."]]);
      await c.say([["hero", "My mother is held in the palace at Ahuacan."]]);
      await c.wait(600);
      await c.say([["narr", "The room is silent. A bell, somewhere, rings once on its own."], ["rhaz", "The Concord does not wage war."], ["peya", "It does favours."], ["corvin", "It does lunch."]]);
      await c.say([["hadiya", "Everything costs. Choose what you pay with."]]);
      c.follow();
    });
    await F.banter("kharam");
  };
  S.done.kharamArrive = F => F.f("ch6.kharam");

  // ---------- the vote ----------
  S.trigger.concordHall = async F => {
    if (F.f("ch6.vote") || !F.f("ch6.contract")) return;
    if (!eligible(F)) {
      await say("rhaz", !F.f("k4.done") ? "The hall sits when it has something to sit about. I want the quarry done first." : "The hall wants a second guild behind you. The fen or the roost. One is enough.");
      return;
    }
    F.music("kharam");
    await Cinema.stage(async c => {
      M3.actors(c, [["rhaz", "npcRhaz", 150, -34], ["peya", "npcPeya", 190, 4], ["corvin", "npcCorvin", 230, -26], ["hadiya", "npcHadiya", 100, 40]]);
      await c.pan(c.hero.x + 170, c.hero.y - 10, 800);
      await c.say([["narr", "The hall of the Concord is a circle under an open roof, seven benches in a ring, and a well-bell hung over each. Today only three are filled. The others are empty, with a lit candle on each bench: the guilds that could not come, and agreed to be counted anyway."], ["rhaz", "Three guilds have asked a thing of this boy and he has done it. The question is not whether he can. The question is what we are, if we say no."]]);
      c.sfx("bell");
      await c.say([["peya", "And who will pay for the quiet if we say no?"], ["corvin", "I say yes. Also lunch."], ["rhaz", "Yes. The road will remember it."], ["peya", "Yes. And may we not need to remember it."]]);
      for (let i = 0; i < 7; i++) { c.sfx("bell"); await c.wait(200); }
      await c.say([["narr", "Seven bells. The ring is complete. The Concord of Seven Wells has voted to take a quarrel that is not its own."], ["hadiya", "That is a thing the Concord has never done. Let nobody tell you it came cheap."]]);
      c.follow();
    });
    F.set("ch6.vote"); F.questDone("m_vote"); F.quest("m_plan", 0); F.gold(5 * m(6));
    await UI.say([["hero", "(Three guilds. A rescue. I did not know it could be asked for.)"]]);
  };
  S.done.concordHall = F => F.f("ch6.vote");

  // ---------- the briefing and Ranna's answer ----------
  M3.briefing = async F => {
    if (F.f("ch6.briefed")) return;
    F.set("ch6.briefed"); F.set("ch6.n1", G.nights); F.music("tension");
    await Cinema.stage(async c => {
      M3.actors(c, [["hadiya", "npcHadiya", 110, 20], ["saffa", "npcSaffa", 150, -14]]);
      c.sfx("menuOk");
      await c.say([["narr", "Hadiya spreads a floor plan on the well-stone and weights its corners with four cups. A great house in pencil, and a long wing, and a column of small neat rooms."],
        ["hadiya", "Sewers to Lowstep. The Gate Warden. The Garden Keeper. The Gaoler's court. The east wing."], ["narr", "Her finger rests on a window in the third court."],
        ["hadiya", "Third court, east wing. Ranna says there is a lamp in her window every night. Ranna has never lied to me about a lamp."]]);
      await c.say([["hero", "Ask her what she needs."], ["hadiya", "I will put it in a bread-basket. It will take a night. Everything costs, and everything is slower in a basket."]]);
      c.follow();
    });
    await F.banter("kharam");
  };
  S.trigger.briefing = async F => {
    if (!F.f("ch6.vote") || F.f("ch6.plan")) return;
    if (!F.f("ch6.briefed")) { await M3.briefing(F); return; }
    if (G.nights <= (G.flags["ch6.n1"] || 0)) { await UI.say([["hadiya", "A basket crosses a harbour and a sewer, friend. It takes a night. Sleep. Everything costs, including this."]]); return; }
    await M3.rannaReply(F);
  };
  S.done.briefing = F => F.f("ch6.plan");
  M3.rannaReply = async F => {
    await Cinema.stage(async c => {
      M3.actors(c, [["hadiya", "npcHadiya", 100, 20]]);
      await c.say([["narr", "The basket comes back before the third bell, wrapped in a flour sack, with a loaf in it that is slightly too heavy. Inside the loaf, a slip of paper the size of a thumb."],
        ["hadiya", "Ranna's hand. 'Tell him there is bread.'"]]);
      await c.wait(900);
      await c.say([["hero", "..."], ["narr", "You hold the paper a long time."], ["hero", "(Bread, thyme, and a window left open.)"], ["hadiya", "It is a code, I think. Or it is a mother. Either way, it means yes."]]);
      c.follow();
    });
    F.set("ch6.plan"); F.questDone("m_plan"); UI.toast("Salt Heron: Lowstep is open to the ship.", 3200);
    await UI.say([["hadiya", "The Salt Heron knows the way. Brisk will take you when you say. Rest first. Eat something. I mean it."]]);
  };
})();

// ---------- part 5: the three key dungeons: K3 Drowned Fen Shrine, K4 Quarry of the Stone Giants (with S8), K5 Sunbird Roost ----------
(function () {
  const S = window.Story, D = window.Data, M3 = S.m3, T = M3.T, m = M3.m;
  const say = (who, text) => UI.say([[who, text]]);
  const markBreak = id => { G.best[id] = Object.assign(G.best[id] || { seen: 0, beaten: 0 }, { breakKnown: true }); };
  M3.hurt = (F, frac) => F.allCreatures().forEach(u => { if (u.alive !== false) u.hp = Math.max(1, u.hp - Math.round(u.maxHp * frac)); });
  // a key-dungeon guardian: reveal, fight, flags, key
  M3.keyBoss = async (F, o) => {
    if (F.f(o.k + ".done")) return true;
    F.music("tension");
    const res = await M3.boss(F, { id: o.id, level: o.level, name: o.name, title: o.title, bg: o.bg, music: "guardian", lines: o.lines, stage: o.stage });
    if (res !== "win") return false;
    markBreak(o.id); F.set(o.k + ".done"); F.give(o.key, 1, true); F.sfx("coin");
    await S.m2.outro(o.id, o.after, { fx: o.fx, end: o.end, dx: o.dx, scale: o.scale });   // the guardian is on the map while its last lines play, then it goes quiet
    UI.toast(D.ITEMS[o.key].n + " received. The Menagerie Wagon will know what it opens.", 3600);
    return true;
  };

  // ---------------------------------------- K3: the Drowned Fen Shrine ----------------------------------------
  M3.region("drownedFenShrine", { n: "The Drowned Fen Shrine", arena: "fenShrine", music: "shore", table: "fen", fields: true, dungeon: true, autos: ["fenEnter"],
    npcs: [["fenCarvings", "Carvings on the arch"]], exits: [["kharamRoad", "Back to the Kharam road", () => true]],
    things: [["sluice1", "A sluice wheel with one notch", s => !s.f["fen.drained"], "trigger"], ["sluice2", "A sluice wheel with two notches", s => !s.f["fen.drained"], "trigger"], ["sluice3", "A sluice wheel with three notches", s => !s.f["fen.drained"], "trigger"],
      ["sluice4", "A sluice wheel with four notches", s => !s.f["fen.drained"], "trigger"], ["fenGuardian", "The flooded heart of the shrine", s => !s.f["k3.done"], "trigger"], ["g14_chorusOfManyHeads", "A chest in the drained nave", s => s.f["k3.done"], "chest"]] });
  S.trigger.fenEnter = async F => {
    if (!M3.once(F, "k3.seen")) return;
    await UI.say([["narr", "Green water to the knee, warm as breath. Stepping stones, and carved heads rising out of the fen on every side: hydras, nine-headed, seven-headed, one with only a single, enormous, sorrowful face. The air tastes of copper and old flowers."], ["hero", "(Something here was worshipped. Something here was not asked.)"]]);
    await UI.say([["narr", "On the arch over the nave, four hydra heads each bite a wheel of the sluices, and each neck is knotted: three knots, then one, then four, then two. The knots are worn smooth where hands have counted them."]]);
  };
  S.done.fenEnter = F => F.f("k3.seen");
  const FEN = [3, 1, 4, 2];
  const sluice = n => async F => {
    if (F.f("fen.drained")) { await UI.say([["narr", "The wheel turns freely now. The room beyond is dry."]]); return; }
    if (F.f("fen.w" + n)) { await UI.say([["narr", "The wheel is already turned. The water in that room is gone."]]); return; }
    const step = G.flags["fen.step"] || 0;
    if (FEN[step] === n) {
      F.set("fen.w" + n); G.flags["fen.step"] = step + 1; F.sfx("door");
      if (step + 1 < 4) await S.m2.gate([["narr", `The wheel groans over, ${["once", "twice", "three times"][step]} on its rusted shaft. Somewhere below, a room drains with a long, wet sigh.`]], { dx: 110, dy: 20, sfx: "waterRush", fx: "splash", shake: 1 });
      else { F.set("fen.drained"); await S.m2.gate([["narr", "The last wheel drops into place. All through the shrine the fen goes out like a tide, down through the floor, and the stepping stones stand on bare black stone. At the far end the great doors of the shrine's heart stand open on a flooded nave."]], { dx: 200, dy: -20, sfx: "waterRush", fx: "splash", fx2: "smoke", shake: 3, tint: "#0c2418" }); }
      return;
    }
    await UI.say([["narr", "The wheel turns, and the wrong room drains: the water rushes out of its door and into a lower one, and the lower room fills with something that was asleep."]]);
    ["fen.w1", "fen.w2", "fen.w3", "fen.w4"].forEach(k => delete G.flags[k]); G.flags["fen.step"] = 0;
    M3.hurt(F, 0.12);
    const foes = F.rollEncounter("fen"); if (foes) await F.fight(foes, { bg: "fenShrine" });
  };
  [1, 2, 3, 4].forEach(n => { S.trigger["sluice" + n] = sluice(n); S.done["sluice" + n] = F => F.f("fen.drained"); });
  M3.spot("drownedFenShrine", "fenCarvings", async F => {
    await UI.say([["narr", "Four hydra heads on the arch, each biting a wheel, and every neck knotted with a different number of knots: three, then one, then four, then two. The knots are worn smooth where hands have counted them."]]);
  }, "t");
  S.trigger.fenGuardian = async F => {
    if (F.f("k3.done")) return;
    if (!F.f("fen.drained")) { await UI.say([["narr", "Black water fills the nave to the roof beams, calm and level, like a held breath. Nothing wades into that."]]); return; }
    const ok = await M3.keyBoss(F, { id: "drownedShrineGuardian", level: 31, k: "k3", key: "keyK3", name: "The Drowned Shrine Guardian", title: "Keeper of the Fen", bg: "fenShrine", fx: "splash", end: "bow",
      lines: [["narr", "Black water pours from the shrine's mouth and stands up in the shape of a weed-hung keeper, a giant of green stone."]],
      stage: async c => { c.tint("#0c2418", 0.3, 600); c.sfx("encounter"); c.fx("splash", c.hero.x + 120, c.hero.y); await c.say([["narr", "In the drained nave the last pool shivers. A shoulder rises from it, then another, hung with weed and bound in old rope, and the keeper has not yet turned its face to you."]]); },
      after: [["narr", "The keeper kneels, goes still, and the black water sinks into the floor. On a drowned altar lies a key stained green, smelling of the fen."], ["hero", "(Whatever it kept, it kept for someone who did not come back.)"]] });
    if (ok) await UI.say([["narr", "Behind the altar a chest has surfaced, hung with weed."]]);
  };
  S.done.fenGuardian = F => F.f("k3.done");
  S.chest.g14_chorusOfManyHeads = async F => { if (!F.f("k3.done")) { await UI.say([["narr", "The chest sits under water in the flooded nave. Something guards it."]]); return false; } return S.gearChest2(F, "g14_chorusOfManyHeads", "G14"); };

  // ---------------------------------------- K4: the Quarry of the Stone Giants ----------------------------------------
  M3.region("giantQuarry", { n: "Quarry of the Stone Giants", arena: "giantQuarry", music: "pyramid", table: "giantQuarry", fields: true, dungeon: true, autos: ["quarryEnter"],
    npcs: [["quarryPlaque", "A builders' plaque"]], exits: [["kharamRoad", "Back to the Kharam road", () => true]],
    things: [["s8Fight", "The loading platform", s => !s.f["ch6.s8"], "trigger"], ["block1", "A carved block", s => s.f["ch6.s8"] && !s.f["qb.1"], "trigger"], ["block2", "A carved block", s => s.f["ch6.s8"] && !s.f["qb.2"], "trigger"], ["block3", "A carved block", s => s.f["ch6.s8"] && !s.f["qb.3"], "trigger"],
      ["block4", "A carved block", s => s.f["ch6.s8"] && !s.f["qb.4"], "trigger"], ["block5", "A carved block", s => s.f["ch6.s8"] && !s.f["qb.5"], "trigger"], ["quarryGiant", "The inner hall of giants", s => !s.f["k4.done"], "trigger"],
      ["g18_counterstrikeBastion", "A chest at the giant's feet", s => s.f["k4.done"], "chest"]] });
  S.trigger.quarryEnter = async F => {
    if (!M3.once(F, "k4.seen")) return;
    await UI.say([["narr", "A cliff cut into giants: shoulders, a half-finished face, a hand as wide as a house open on the quarry floor. Cranes of black timber, rails, a long ramp. Along the stone, scars of black and gold, where something was cut out that did not want to be."], ["hero", "(They carved them to be woken.)"]]);
    await UI.say([["narr", "A bronze plaque in builder script, green with age. Someone has scratched a translation underneath: WE CARVED THEM TO CARRY THE SKY. THE SKY CAME DOWN. THE CARRYING CONTINUES."]]);
  };
  S.done.quarryEnter = F => F.f("k4.seen");
  M3.spot("giantQuarry", "quarryPlaque", async F => { await UI.say([["narr", "A bronze plaque in builder script, green with age. Someone has scratched a translation underneath: WE CARVED THEM TO CARRY THE SKY. THE SKY CAME DOWN. THE CARRYING CONTINUES."]]); }, "t");
  S.trigger.s8Fight = async F => {
    if (F.f("ch6.s8")) return;
    F.music("tension");
    const ok = await M3.general(F, 8, { level: 31, soldiers: [["chiselImp", 29, " A"], ["chiselImp", 29, " B"]], bg: "giantQuarry", title: "The Overseer of the Works",
      place: "the outer works of the Quarry of the Stone Giants", where: "It climbed the quarry ramp and over the rim, and on into the grey.", after: ["(Collared to stand guard over a hole. And somebody cut the hole.)"],
      setup: async c => {
        const g = S.generalFor(8) || { id: "horncinder" };
        M3.actors(c, [["gen", g.id, 230, -6, { scale: 1.2 }], ["m1", "npcOverseer", 280, -50], ["m2", "npcOverseer", 280, 40]]);
        c.sprite("collarAltar", c.hero.x + 200, c.hero.y - 6); await c.pan(c.hero.x + 200, c.hero.y, 900);
        await c.say([["narr", "The outer works: a loading platform at the quarry's mouth, rails running into the cliff, two overseers with whips coiled at their belts. On the platform a black altar, and chained to it, a creature of the pens, standing guard over an open hole."], ["overseer", "No visitors past the platform. By the authority of the Throne."]]);
        c.sfx("encounter"); c.follow();
      } });
    if (!ok) return;
    F.set("ch6.s8");
    await S.m2.stage(async c => {
      M3.actors(c, [["m1", "npcOverseer", 150, -50], ["m2", "npcOverseer", 150, 40]]);
      c.sfx("chainBreak"); c.emote("m1", "!"); c.emote("m2", "!"); await c.wait(500);
      await c.say([["narr", "The collar breaks. The overseers throw down their whips, and go. On the platform the rails shine, and past them, inside the cliff, a long hall of stone figures waits in the dark."]]);
      await Promise.all([c.walk("m1", c.hero.x - 420, c.hero.y - 120, 2200), c.walk("m2", c.hero.x - 440, c.hero.y + 100, 2400)]);
      c.remove("m1"); c.remove("m2");
    });
  };
  S.done.s8Fight = F => F.f("ch6.s8");
  const block = n => async F => {
    if (!F.f("ch6.s8")) { await UI.say([["narr", "The block sits on its rails, a ramp of overseers' timber under it. The platform's guard has not stopped watching."]]); return; }
    if (F.f("qb." + n)) { await UI.say([["narr", "The block sits on its glyph tile, humming faintly."]]); return; }
    F.set("qb." + n); F.sfx("hitHeavy");
    const count = [1, 2, 3, 4, 5].filter(k => F.f("qb." + k)).length;
    if (count < 5) { await UI.say([["narr", `You push the carved block along its rail until it drops onto a glyph tile with a thud you feel in your teeth. ${count} of 5.`]]); return; }
    await S.m2.gate([["narr", "The fifth block drops onto its tile. Light-lines run through the floor, up the walls, along the giants' shoulders, and the whole hall begins to turn its heads."]], { dx: 160, dy: -30, sfx: "rumble", fx: "dust", fx2: "sparkle", shake: 4, flash: "#ffe9a8" });
    const res = await F.fight([F.mkEnemy("giantstoneSentry", 31, " A"), F.mkEnemy("chiselImp", 30, " B"), F.mkEnemy("giantstoneSentry", 31, " C")], { bg: "giantQuarry", intro: "The giants of the hall wake, shaking dust from their shoulders!" });
    if (res !== "win") return;
    F.set("quarry.open"); await S.m2.gate([["narr", "The last giant sinks back onto its plinth. At the end of the hall the door of the inner works slides into the floor."]], { dx: 220, dy: -10, fx: "dust", shake: 3 });
  };
  [1, 2, 3, 4, 5].forEach(n => { S.trigger["block" + n] = block(n); S.done["block" + n] = F => F.f("qb." + n); });
  S.trigger.quarryGiant = async F => {
    if (F.f("k4.done")) return;
    if (!F.f("quarry.open")) { await UI.say([["narr", "A door of black stone, sealed. Five glyph tiles are set in the floor of the outer hall, and each tile lies empty."]]); return; }
    const ok = await M3.keyBoss(F, { id: "stoneGiant", level: 32, k: "k4", key: "keyK4", name: "The Stone Giant", title: "Carried the Sky", bg: "giantQuarry", fx: "dust", end: "bow", scale: 1.7,
      lines: [["narr", "The quarry wall shrugs, and a giant steps out of it."]],
      stage: async c => { c.sfx("hitHeavy"); c.shake(5, 900); c.fx("dust", c.hero.x + 160, c.hero.y); await c.say([["narr", "In the inner hall the biggest figure of all, a giant three storeys high with its back to the room, begins very slowly to turn."]]); },
      after: [["narr", "The giant sits down, as if tired, and the light goes out of its seams. In its open hand lies a key cut from a fingernail of black stone."], ["hero", "(It never finished waking. It looked relieved.)"]] });
    if (ok) await UI.say([["narr", "At the giant's feet, on the stone, a chest."]]);
  };
  S.done.quarryGiant = F => F.f("k4.done");
  S.chest.g18_counterstrikeBastion = async F => { if (!F.f("k4.done")) { await UI.say([["narr", "The chest sits in the shadow of the giant. It will not open yet."]]); return false; } return S.gearChest2(F, "g18_counterstrikeBastion", "G18"); };

  // ---------------------------------------- K5: the Sunbird Roost ----------------------------------------
  M3.region("sunbirdRoost", { n: "The Sunbird Roost", arena: "sunbirdRoost", music: "fort", table: "roost", fields: true, dungeon: true, autos: ["roostEnter"],
    npcs: [["roostTablet", "A builders' tablet by the first bowl"]], exits: [["kharamRoad", "Back to the Kharam road", () => true]],
    things: [1, 2, 3, 4, 5, 6, 7, 8].map(n => ["brazier" + n, "A brazier bowl", s => !s.f["roost.open"], "trigger"]).concat([["roostGuardian", "The top of the roost", s => !s.f["k5.done"], "trigger"], ["g23_cleanserReedGarland", "A chest in the nest", s => s.f["k5.done"], "chest"]]) });
  S.trigger.roostEnter = async F => {
    if (!M3.once(F, "k5.seen")) return;
    await UI.say([["narr", "A tower of beaten gold on a red mesa, a ramp spiralling up its outside, and at every turn a great bowl on a tripod, black with old soot. The wind pulls at your cloak. Warm feathers, shed in thousands, lie in the corners like leaves."], ["hero", "(A nest this size was built to be seen from a long way off.)"]]);
    await UI.say([["narr", "A tablet of gold-veined stone by the first bowl: WE LIT THE ROOST SO THE SUN-BIRD WOULD KNOW THE WAY HOME. LIGHT THE BOWLS IN ONE BREATH. THE WIND IS HER OPINION."]]);
  };
  S.done.roostEnter = F => F.f("k5.seen");
  M3.spot("sunbirdRoost", "roostTablet", async F => { await UI.say([["narr", "A tablet of gold-veined stone: WE LIT THE ROOST SO THE SUN-BIRD WOULD KNOW THE WAY HOME. LIGHT THE BOWLS IN ONE BREATH. THE WIND IS HER OPINION."]]); }, "t");
  M3.roost = { t: 0 };
  const brazier = n => async F => {
    if (F.f("roost.open")) { await UI.say([["narr", "The bowl burns steadily, a column of gold."]]); return; }
    const lit = G.flags["roost.lit"] || 0, now = Date.now();
    if (lit > 0 && now - M3.roost.t > 22000) {
      G.flags["roost.lit"] = 0; F.sfx("hitHeavy");
      await S.m2.gate([["narr", "A draft slides up the ramp, finds the chain of bowls and goes along it, flame by flame. By the time it reaches you every bowl is black."]], { dx: 120, dy: -40, sfx: "gust", fx: "smoke", shake: 1 });
      return;
    }
    if (n !== lit + 1) { await UI.say([["narr", lit === 0 ? "The bowl will not catch. The chain starts at the first, at the foot of the ramp." : "The bowl takes the spark and gutters out. The chain goes in order, one bowl after the other."]]); return; }
    G.flags["roost.lit"] = n; M3.roost.t = now; F.sfx("fire");
    if (n < 8) await UI.say([["narr", `The bowl catches with a soft whump, and a ribbon of gold climbs the tripod. ${n} of 8.`]]);
    else { F.set("roost.open"); await S.m2.gate([["narr", "The eighth bowl catches, and the whole ramp runs gold from foot to crown. At the top of the tower a door of beaten leaf swings open on its own."]], { dx: 130, dy: -90, sfx: "fire", fx: "fire", fx2: "sparkle", shake: 1, flash: "#fff1b8" }); }
  };
  for (let n = 1; n <= 8; n++) { S.trigger["brazier" + n] = brazier(n); S.done["brazier" + n] = F => F.f("roost.open"); }
  S.trigger.roostGuardian = async F => {
    if (F.f("k5.done")) return;
    if (!F.f("roost.open")) { await UI.say([["narr", "The door at the top of the ramp is a sheet of beaten leaf, shut. The bowls below it are cold."]]); return; }
    const ok = await M3.keyBoss(F, { id: "sunbirdGuardian", level: 33, k: "k5", key: "keyK5", name: "The Sunbird Guardian", title: "Noon Made Bird", bg: "sunbirdRoost", fx: "feathers", end: "fade",
      lines: [["narr", "The roost burns white. A bird made of noon sunlight spreads its wings."]],
      stage: async c => { c.flash("#fff1b8", 600); c.fx("feathers", c.hero.x + 120, c.hero.y - 40); c.sfx("encounter"); await c.say([["narr", "In the crown of the tower there is a nest of gold wire the size of a house, and in the nest a light that is not a fire. It is hot, and it is old, and it opens one eye."]]); },
      after: [["narr", "The great bird folds her wings. The white light goes out of her, and the roost is only a golden tower in the wind. On the edge of the nest lies a feather-shaped key, warm even in the cold."], ["hero", "(She was guarding chicks. The Company only ever saw what it could take.)"]] });
    if (ok) await UI.say([["narr", "Among the feathers of the nest, half buried, a chest."]]);
  };
  S.done.roostGuardian = F => F.f("k5.done");
  S.chest.g23_cleanserReedGarland = async F => { if (!F.f("k5.done")) { await UI.say([["narr", "The chest is wedged in the nest. The nest is not empty."]]); return false; } return S.gearChest2(F, "g23_cleanserReedGarland", "G23"); };
})();

// ---------- part 6: the Weeping Sea, Gullrest, the Maelstrom Caves (T3), Cinder Crown, Cinderwatch, the Crater (T4) ----------
(function () {
  const S = window.Story, D = window.Data, M3 = S.m3, T = M3.T, m = M3.m;
  const say = (who, text) => UI.say([[who, text]]);
  const markBreak = id => { G.best[id] = Object.assign(G.best[id] || { seen: 0, beaten: 0 }, { breakKnown: true }); };
  const dock = (to, label, cond) => [to, label, cond || (() => true)];

  // ---------------------------------------- the Weeping Sea ----------------------------------------
  M3.region("weepingSea", { n: "The Weeping Sea", arena: "seaDeck", music: "sea", table: "seaOpen", fields: true, boat: true, autos: ["seaArrive"],
    exits: [dock("brassHarbour", "The berth at Brass Harbour"), dock("saltgate", "The smugglers' pier at Saltgate"), dock("gullrest", "The piers of Gullrest"), dock("maelstromCaves", "The cave mouths round the whirlpool"),
      dock("cinderCrownIsle", "The black beach of Cinder Crown"), dock("mournsGate", "The bell-pier of Mourn's Gate"), dock("tzavan", "The harbour stairs of Tzavan"), dock("creepingShore", "The Creeping Shore")],
    things: [["sunkenShipChest", "A sunken builder ship in the Straits", s => !s.f["c.sunken"], "chest"]],
    legends: [{ id: "L5", enemy: "blackPearlHermit", level: 35, chance: 0.04 }] });
  S.trigger.seaArrive = async F => {
    if (!M3.once(F, "ch6.seaFirst")) return;
    G.lastTown = G.lastTown || "brassHarbour";
    await Cinema.stage(async c => {
      c.tint("#0c1a22", 0.18, 600);
      await c.say([["narr", "The Salt Heron clears the harbour mouth and the sea opens on every side: grey-green water, rain-streaked light, white caps, and the Sehkarem coast a pale line behind you. The deck lifts. Somewhere high up, a gull screams, and is answered by forty more."], ["captain", "Every sea has a name, friend. This one is the Weeping Sea, and she is not crying for you."]]);
      c.follow();
    });
    await F.banter("seaFirst");
  };
  S.done.seaArrive = F => F.f("ch6.seaFirst");
  S.chest.sunkenShipChest = async F => {
    if (F.f("c.sunken")) return false; F.set("c.sunken"); F.give("tonic", 3);
    await UI.say([["narr", "A builder ship lies on its side in the shallows, black timber furred with weed. In the captain's cabin a chest, and in the chest a brass tube with a log rolled inside, and three Clearwater Tonics."],
      ["narr", "LOG OF THE LONG PATIENCE. DAY 40. THE WATER HERE TURNS AGAINST THE SUN. WE HAVE NAMED IT THE MOTHER'S WHEEL AND WE DO NOT GO NEAR IT. SOMETHING SLEEPS IN THE MIDDLE, AND THE SEA TURNS TO KEEP IT SO."]]);
    F.set("lore.longPatience");
  };
  D.LORE.longPatience = "A builder ship's log from the Straits: \"The water here turns against the sun. Something sleeps in the middle, and the sea turns to keep it so.\"";

  // ---------------------------------------- Gullrest ----------------------------------------
  M3.region("gullrest", { n: "Gullrest", arena: "harbourCoast", music: "fishingTown", town: "gullrest", inn: "gullrest",
    npcs: [["innkeeper", "The Wet Wick"], ["merchant", "The net-loft"], ["gullCaptain", "An old fisher on the quay"], ["fisher", "A fisher with a net"], ["r1", "A girl mending a net"], ["r2", "A man at the lighthouse stair"], ["r3", "A woman gutting fish"]],
    exits: [["weepingSea", "The piers", () => true], ["maelstromCaves", "The boat to the cave mouths", () => true]], things: [] });
  M3.rumours("gullrest", ["A frozen thing sleeps in the whirlpool. They say frost and then a good soaking makes the Mother forget how to turn.", "The black pearl lives on a rock that shows at low tide, past the lighthouse. The hermit on it will fight you for it, and he is fair about it.",
    "The gulls follow the Salt Heron because the captain feeds them. He says they pay in gossip."], []);
  M3.onRumour["gullrest:1"] = async F => { F.set("rum.hermit"); };
  M3.talkTown("gullrest", { inn: "gullrest", shop: "gullrest", who: ["girl", "fisher", "oldwoman"], opts: {},
    innLine: "The Wet Wick. It is not wet, the wick, it is only the name. Beds above the net-loft, and the gulls are not included.",
    shopLine: "Lamp oil, rope, cold-water tonics and a jar of soak for those who like a puzzle. It is a poor island and a good market, which is the same thing." });
  Object.assign(T("gullrest"), {
    gullCaptain: async F => { await say("gullCaptain", F.f("t3.done") ? "The wheel has slowed. The fish are confused. I have never been so glad to be confused." : "The Mother turns the sea at the Straits. My father said you had to freeze her heart and then wash it, to make her forget. My father also said the moon was a fish. So."); },
    fisher: async F => { await say("fisher", "I fish the shallows. The deep is the Mother's. Last winter the sea froze white around her cave, and I swear the ice hummed."); },
  });
  M3.people([["girl", "Net-mender", "i", "child"]]);

  // ---------------------------------------- the Maelstrom Caves: T3, the Mother of the Maelstrom ----------------------------------------
  M3.region("maelstromCaves", { n: "The Maelstrom Caves", arena: "seaCave", music: "seaCave", table: "maelstrom", fields: true, dungeon: true, autos: ["maelstromEnter"],
    exits: [["gullrest", "Back to the Gullrest boat", () => true], ["weepingSea", "The cave mouth to the open sea", () => true]],
    things: [["g38_whirlpoolSiren", "A chest above the tideline", () => true, "chest"], ["motherFight", "The great round chamber", s => !s.f["t3.done"], "trigger"]] });
  S.trigger.maelstromEnter = async F => {
    if (!M3.once(F, "t3.seen")) return;
    await UI.say([["narr", "Wet black rock, foam on the ledges, glow-moss in the cracks. The roar grows as you go in, until it is no longer a sound but a pressure. Far ahead, through an arch, something round and white turns and turns."]]);
    await F.banter("maelstrom");
  };
  S.done.maelstromEnter = F => F.f("t3.seen");
  S.chest.g38_whirlpoolSiren = async F => S.gearChest2(F, "g38_whirlpoolSiren", "G38");
  S.trigger.motherFight = async F => {
    if (F.f("t3.done")) return;
    F.music("tension");
    const res = await M3.boss(F, { id: "motherOfTheMaelstrom", level: 32, name: "The Mother of the Maelstrom", title: "Warden of the Turning Water", bg: "seaCave", music: "titanSea",
      lines: [["narr", "The sea folds in on itself. Something old turns in the whirl."]],
      stage: async c => { c.tint("#0a1c28", 0.3, 600); c.shake(3, 900); c.sfx("encounter"); c.fx("splash", c.hero.x + 130, c.hero.y); await c.say([["narr", "The great round chamber: a pool at the middle, spinning, taller on the edges than the middle, and in the spin, once, something that is not water turns its face to the roof."]]); } });
    if (res !== "win") return;
    markBreak("motherOfTheMaelstrom"); F.set("t3.done"); F.giveGear("G32", 3); F.gold(10 * m(6));
    await S.m2.outro("motherOfTheMaelstrom", [["narr", "The whirlpool slows, and slows, and goes still as a plate. In the middle, where the water was turning, a ring of black stone shows, with lines of pale light going down. A round lid, the size of a house, set into the sea floor."], ["hero", "(A lid. Not a beast. A lid.)"]], { fx: "splash", end: "fade", tint: "#0a1c28", dx: 150 });
  };
  S.done.motherFight = F => F.f("t3.done");

  // ---------------------------------------- Cinder Crown ----------------------------------------
  M3.region("cinderCrownIsle", { n: "Cinder Crown", arena: "volcano", music: "volcano", table: "cinder", fields: true, boat: false, overland: true, autos: ["cinderEnter"],
    exits: [["weepingSea", "The black beach and the boat", () => true], ["cinderwatch", "The pilgrim path to Cinderwatch", () => true], ["cinderCrownCrater", "The ash road up to the crater", () => true]],
    things: [["hotSpring", "A steaming gap behind the rocks", s => !s.f["g.spring"], "gather"]],
    legends: [{ id: "L3", enemy: "motherGlowmoth", level: 23, when: "sky.moonless", chance: 0.04 }] });
  S.trigger.cinderEnter = async F => { if (!M3.once(F, "ember.seen")) return; await F.banter("ember"); };
  S.done.cinderEnter = F => F.f("ember.seen");
  S.gather.hotSpring = async F => {
    if (F.f("g.spring")) return false; F.set("g.spring"); F.give("springCharm", 1, true);
    await UI.say([["narr", "Behind a wall of black rock, a pool the colour of milk tea, steaming in the cold air. At the bottom lies a smooth black stone, warm on one side and cold on the other."], ["hero", "(Nobody told me about this. Nobody told anybody.)"], ["narr", "You take the stone. A warmth runs up your arm and settles behind your ribs."]]);
    UI.toast("Spring Charm: every creature starts each fight with 1 extra MP.", 4200);
  };
  T("cinderCrownIsle").hotSpring = async F => { if (F.f("g.spring")) { await UI.say([["narr", "The spring steams quietly behind its wall of black rock. Whatever was at the bottom of it, you have."]]); return; } await S.gather.hotSpring(F); };
  M3.region("cinderwatch", { n: "Cinderwatch", arena: "volcano", music: "pilgrimTown", town: "cinderwatch", inn: "cinderwatch",
    npcs: [["innkeeper", "The Ashen Hearth"], ["merchant", "Ash-stalls"], ["pilgrim", "A pilgrim with an empty jar"], ["bather", "A bather in the terraces"], ["r1", "A woman stringing charms"], ["r2", "A man by the bath-steps"], ["r3", "A child with a pebble"]],
    exits: [["cinderCrownIsle", "The path down to the beach", () => true]], things: [] });
  M3.rumours("cinderwatch", ["The wolf on the crater is not hunting, it is running. Splash it twice in a breath and it stops to shake itself dry.", "Behind the rocks above the beach there is a spring warm enough to cook an egg. The stone in it keeps a creature's spirit up for the first breath of a fight.",
    "Ash falls on the days the wolf runs. Today is a quiet day."], []);
  M3.onRumour["cinderwatch:0"] = async F => { F.set("rum.wolf"); };
  M3.talkTown("cinderwatch", { inn: "cinderwatch", shop: "cinderwatch", who: ["pilgrimW", "pilgrimM", "boy"], opts: {},
    innLine: "The Ashen Hearth. Slow beds, warm water, and a fire that has not gone out in four hundred years. We take turns feeding it. You may take a turn if you wish.",
    shopLine: "Ash-charms, ward tonics, and a few little bombs for the road. Careful with the little bombs, friend. They do what they say." });
  M3.people([["pilgrimW", "Charm-seller", "i", "widow"], ["pilgrimM", "Bath attendant", "m", "pilgrim"]]);
  Object.assign(T("cinderwatch"), {
    bather: async F => { await say("bather", "The volcano is warm and the sea is cold and I sit in between. That is the whole of my philosophy. It has served me for sixty years."); },
    pilgrim: async F => {
      const st = F.qstep("pilgrim");
      if (st === "done") { await say("pilgrim", "The ash shrine has water again. The wolf stopped howling, I think, to listen."); return; }
      if (st === undefined) { await say("pilgrim", "There is a shrine on the slope, a bowl in a rock, and the pilgrims fill it with water so the mountain remembers what it is not. I am too old for the climb, and out of water. Five flasks of Sunwater, if you can spare them."); F.quest("pilgrim", 0); return; }
      if (F.item("sunwater") >= 5) {
        F.take("sunwater", 5); F.questDone("pilgrim"); F.gold(3 * m(6)); F.give("cinderBomb", 2); F.sfx("coin");
        await say("pilgrim", "Five. The mountain will drink slowly, but it will drink. Take these, they were my husband's. He said a bomb is only a thought with a short fuse.");
      } else await say("pilgrim", `Sunwater: ${Math.min(5, F.item("sunwater"))} of 5. The slope is steep. The bowl is patient.`);
    },
  });

  // ---------------------------------------- the Crater: T4, the Ember Wolf ----------------------------------------
  M3.region("cinderCrownCrater", { n: "The Crater", arena: "volcano", music: "volcano", table: "crater", fields: true, dungeon: true, autos: ["craterEnter"],
    exits: [["cinderCrownIsle", "Back down the ash road", () => true]],
    things: [["craterChest", "A chest on an obsidian ledge", s => !s.f["c.crater"], "chest"], ["wolfFight", "The wolf-shaped hollow in the ash", s => !s.f["t4.done"], "trigger"]] });
  S.trigger.craterEnter = async F => {
    if (!M3.once(F, "t4.seen")) return;
    await UI.say([["narr", "The volcano's inside: a ledge of black glass, lava rivers glowing under a crust, and the air so hot it bends the light into ripples. Ahead, in the ash, a hollow the shape of a huge sleeping wolf, pressed so deep and so often that the ash has gone smooth."]]);
  };
  S.done.craterEnter = F => F.f("t4.seen");
  S.chest.craterChest = async F => { if (F.f("c.crater")) return false; F.set("c.crater"); F.give("ember", 2); F.gold(450); await UI.say([["narr", "On a ledge of black glass, a pilgrim's chest, warm to the touch. Two Ashen Embers, and a purse of kakal that no one has come back for."]]); };
  S.trigger.wolfFight = async F => {
    if (F.f("t4.done")) return;
    F.music("tension");
    const res = await M3.boss(F, { id: "emberWolf", level: 34, name: "The Ember Wolf", title: "Chasing the Sun", bg: "volcano", music: "titanFire",
      lines: [["narr", "A wolf of living flame lopes down the slope, chasing a sun that is not there."]],
      stage: async c => { c.tint("#401408", 0.3, 600); c.fx("embers", c.hero.x + 100, c.hero.y - 20); c.shake(2, 700); await c.say([["narr", "The hollow in the ash is not empty. It is warm, and it breathes, and as you stand at its edge a shape lifts out of it on four legs, made of the same fire that the volcano is made of, looks past you at the horizon, and starts to run."]]); } });
    if (res !== "win") return;
    markBreak("emberWolf"); F.set("t4.done"); F.giveGear("G31", 3); F.gold(10 * m(6));
    await S.m2.outro("emberWolf", [["narr", "The wolf stops, shakes itself like a dog out of a river, and the flames go out of it one by one, until a lean grey animal is standing in the hollow, tired and blinking. It looks at the horizon once more, and lies down, and is still. On the wall of the crater, lines of pale light go down into the stone."], ["hero", "(It was running from something. Or toward it. It never got there.)"]], { fx: "embers", end: "fall", tint: "#401408", dx: 150 });
  };
  S.done.wolfFight = F => F.f("t4.done");
})();

// ---------- part 7: Mourn's Gate, the Hollows of Mourn (the pale ferry, the death masks, T5 the Gate Hound) ----------
(function () {
  const S = window.Story, D = window.Data, M3 = S.m3, T = M3.T, m = M3.m;
  const say = (who, text) => UI.say([[who, text]]);
  const markBreak = id => { G.best[id] = Object.assign(G.best[id] || { seen: 0, beaten: 0 }, { breakKnown: true }); };

  M3.region("mournsGate", { n: "Mourn's Gate", arena: "underworld", music: "mourningTown", town: "mournsGate", inn: "mourns",
    npcs: [["innkeeper", "The Candle House"], ["merchant", "The chandler"], ["bellringer", "The bell-ringer"], ["mourner", "A mourner at the shroud-lines"], ["r1", "A candle-seller"], ["r2", "A gravedigger resting on his spade"], ["r3", "A child lighting candles"]],
    exits: [["weepingSea", "The bell-pier", () => true], ["hollowsOfMourn", "The cave road down to the Hollows", () => true]], things: [], autos: ["mournArrive"] });
  M3.rumours("mournsGate", ["The Hollows ask for a story, and a little more than the story.", "The hound at the gate has three heads, and they sulk together. Poison all three in one breath and they fall quiet together.",
    "The bells here ring one more than the number of dead. Nobody says for whom."], []);
  M3.onRumour["mournsGate:1"] = async F => { F.set("rum.gatehound"); };
  M3.talkTown("mournsGate", { inn: "mourns", shop: "mournsGate", who: ["candleSeller", "gravedigger", "boy"], opts: {},
    innLine: "The Candle House. Quiet rooms, thick walls, and a candle in every window for the ones who have not come home. Please do not blow one out.",
    shopLine: "Candles, shrouds, ward tonics, and the little pots we use against the creeping things in the Hollows. We are a practical people, friend. Grief is tidy when it is organised." });
  M3.people([["candleSeller", "Candle-seller", "i", "widow"], ["gravedigger", "Gravedigger", "m", "foreman"]]);
  S.trigger.mournArrive = async F => { if (!M3.once(F, "mourn.seen")) return; F.music("mourningTown"); await UI.say([["narr", "Bells, slow and flat, from five towers at once. White shrouds hang on lines across the street like washing, and in every niche of every wall a candle burns. Nobody calls out. Nobody hurries. A woman puts a hand on the doorframe of her own house as you pass, as if to be sure it is there."]]); await F.banter("mourn"); };
  S.done.mournArrive = F => F.f("mourn.seen");
  Object.assign(T("mournsGate"), {
    bellringer: async F => { await say("bellringer", F.f("t5.done") ? "The hound is quiet. Three bells for the three heads, for a month. Then the usual. Then one more than the usual. You will understand it when you are old." : "I ring the bells. One for each of ours, and one over. Do not ask whose the over is. I have been ringing it for thirty years and I still do not know."); },
    mourner: async F => { await say("mourner", "The Hollows take the ones we cannot bury. We put their names on the shrouds, and the shrouds go in the wind. It is not much. It is what we have."); },
  });

  // ---------------------------------------- the Hollows of Mourn ----------------------------------------
  M3.region("hollowsOfMourn", { n: "Hollows of Mourn", arena: "underworld", music: "underworld", table: "hollows", fields: true, dungeon: true, autos: ["hollowsEnter"],
    npcs: [["paleFerry", "The pale ferryman on the black river"], ["maskChamber", "A chamber of builder death masks"]], exits: [["mournsGate", "Back up to Mourn's Gate", () => true]],
    things: [["gateFight", "The gate at the bottom of the Hollows", s => !s.f["t5.done"], "trigger"]] });
  S.trigger.hollowsEnter = async F => {
    if (!M3.once(F, "t5.seen")) return;
    await UI.say([["narr", "Long caves going down: glowing fungus in cold blue, bone arches grown over with white moss, funeral lanterns hung on hooks at every turn by hands you never see. Ahead, the sound of a river that makes no sound."]]);
  };
  S.done.hollowsEnter = F => F.f("t5.seen");
  M3.spot("hollowsOfMourn", ["paleFerry", "pale"], async F => {
    if (F.f("hollows.ferry")) { await say("pale", "The river knows you. Cross, or stay. I keep both kinds of passenger."); return; }
    await UI.say([["narr", "A black river with a flat ferry on it, no lantern, no oars. The ferryman stands at the stern with a pole: pale as candle-tallow, wrapped in grey rags. He does not look at you. He looks at the place where you will be."],
      ["pale", "Passage is a story. Not the one you tell everyone. A true one. And a little more than the story."]]);
    const i = await F.ask("Tell the ferryman a story.", [{ label: "The day the lab burned" }, { label: "A promise I made" }, { label: "I have no story" }], { top: "38%" });
    const fee = Math.min(G.gold, Math.round(0.5 * m(6)));
    if (i === 0) await UI.say([["hero", "I chose a team. The same day the lab burned. I have not stopped wondering whether one caused the other."], ["pale", "Yes. I have a ledger, too. Yours is long. Cross."]]);
    else if (i === 1) await UI.say([["hero", "I told twenty-four creatures I would come back for them. I am still counting."], ["pale", "Twenty-four. Keep counting. Cross."]]);
    else await UI.say([["hero", "I do not have one."], ["pale", "Everyone does. You will find yours on the far bank. Cross."]]);
    G.gold -= fee; F.set("hollows.ferry"); F.sfx("coin");
    await UI.say([["narr", `The ferry slides across without a sound. At the far bank the pale ferryman puts out a hand and you give him ${fee} kakal, the little more than the story. He closes his fingers on it as if it were a fish.`], ["pale", "I keep the ones I like. I will keep this one."]]);
  }, "t");
  M3.spot("hollowsOfMourn", "maskChamber", async F => {
    const first = !F.f("lore.masks");
    if (first) await Cinema.panels([{ img: "assets/cinema/m3_masks.png", text: "Rows of builder death masks, each one different, every one turned toward the door.", pan: "in" }], { music: "underworld" });
    await UI.say([["narr", "A round chamber with shelves to the roof, and on every shelf a mask: bronze, black glass, white stone, no two alike, each with the eyes shut. Under the shelf at the far end, cut deep and filled with gold, a single line of builder script, with the same translation scratched under it in a hurry by a human hand."], ["narr", "TO KEEP THE SLEEPERS ASLEEP."]]);
    if (first) { F.set("lore.masks"); await UI.say([["hero", "(Not weapons. Not wardens of the old people's wealth. Something kept shut, and somebody has been picking the locks.)"]]); }
  }, "t");
  D.LORE.masks = "In the chamber of death masks under the Hollows of Mourn, cut in builder script: \"TO KEEP THE SLEEPERS ASLEEP.\"";
  S.trigger.gateFight = async F => {
    if (F.f("t5.done")) return;
    F.music("tension");
    const res = await M3.boss(F, { id: "gateHound", level: 36, name: "The Gate Hound", title: "Three Heads, One Grief", bg: "underworld", music: "titanUnder",
      lines: [["narr", "Three heads lift from the dark, and not one of them is looking at the others."]],
      stage: async c => { c.tint("#0a0a20", 0.35, 600); c.sfx("encounter"); c.shake(2, 600); await c.say([["narr", "At the bottom of the Hollows an arch of black glass stands closed, and in front of it a hound lies like a hill, three great heads on three long necks. Each is asleep. Each is asleep in a different direction. One has its eyes open anyway."]]); } });
    if (res !== "win") return;
    markBreak("gateHound"); F.set("t5.done"); F.giveGear("G22", 3); F.gold(10 * m(6));
    await S.m2.outro("gateHound", [["narr", "The three heads lower, one after another, and rest on their paws. Behind the hound, the arch of black glass is not open. It is simply no longer cold."], ["hero", "(The bronze statue in the market. Somebody was telling me. Somebody was warning me, too.)"]], { fx: "smoke", end: "bow", scale: 1.5, tint: "#0a0a20", dx: 170 });
  };
  S.done.gateFight = F => F.f("t5.done");
})();

// ---------- part 8: Tzavan (the arena city), the Bronze Cup, the gladiator chain, the slave market, the barracks ----------
(function () {
  const S = window.Story, D = window.Data, M3 = S.m3, T = M3.T, m = M3.m;
  const say = (who, text) => UI.say([[who, text]]);

  // Bronze Cup: the spec's fights (Systems registered stand-ins until these ids existed)
  if (D.CUPS && D.CUPS.bronze) Object.assign(D.CUPS.bronze, { ch: 6, gear: "G1", note: "Three fights and a gladiator with a captured beast.",
    fights: [{ n: "Shield squad", foes: ["legionShieldbearer", "legionShieldbearer", "legionSpearman"], lv: 30 }, { n: "Arena beasts", foes: ["lionWolf", "boarBull"], lv: 31 },
      { n: "Archers and optio", foes: ["legionArcher", "legionArcher", "legionOptio"], lv: 32 }],
    champion: { n: "The Bronze Champion", foes: ["bronzeChampion", "bronzeBeast"], lv: 34, intro: "The Gladiator of the Black Sand steps out behind a tower shield, a chained beast at his heel." } });

  M3.region("tzavan", { n: "Tzavan", arena: "colosseum", music: "arenaCity", town: "tzavan", inn: "tzavan", autos: ["tzavanArrive"],
    npcs: [["innkeeper", "The Champion's Rest"], ["merchant", "The imperial bazaar"], ["arenaClerk", "The arena clerk at the counter"], ["bookmaker", "The bookmaker"], ["ring1", "Casso, a retired net-fighter"], ["ring2", "Meret, a gladiator on the steps"], ["ring3", "Brun, a gladiator with a bandaged arm"],
      ["slaveMerchant", "A merchant at the slave market"], ["gladiator", "A gladiator warming up"], ["r1", "A spectator on the white steps"], ["r2", "A baker's boy"], ["r3", "An old veteran by the harbour wall"]],
    exits: [["weepingSea", "The harbour stairs", () => true], ["tzavanBarracks", "The cell stair under the Hall", () => true]], things: [] });
  M3.rumours("tzavan", ["The Grand Champion has not lost in eleven years.", "The empire feeds the arena, and the arena feeds the pyramids.", "A ghost with a banner walks the road when no one is looking."], []);
  M3.onRumour["tzavan:2"] = async F => { F.set("rum.ninth"); };
  M3.talkTown("tzavan", { inn: "tzavan", shop: "tzavan", who: ["spectator", "boy", "veteran"], opts: {},
    innLine: "The Champion's Rest. Imperial rates, imperial sheets, and a view of the Hall that costs extra. Everyone who sleeps here has a story about the sand.",
    shopLine: "The imperial bazaar. Every ward and every bomb in the Dominion, at the Dominion's price. We buy goods, at the Dominion's price as well." });
  M3.people([["spectator", "Spectator", "m", "gossip"], ["veteran", "Old veteran", "m", "guard"], ["mother", "A mother", "i", "widow"]]);
  S.trigger.tzavanArrive = async F => {
    if (!M3.once(F, "tzavan.seen")) return;
    G.lastTown = "tzavan"; F.music("arenaCity");
    await Cinema.stage(async c => {
      M3.actors(c, [["gl", "npcLegionGuard", 160, -30], ["spec", "npcVillagerM", 120, 40]]);
      await c.pan(c.hero.x + 180, c.hero.y - 40, 1000);
      await c.say([["narr", "From the harbour stairs the whole city is a slope of white steps and banners, and on the crown of it the Hall of the Hundred Banners: a ring of arches three storeys tall, a hundred poles along its rim and a hundred flags snapping on them, red and black and gold. A bell tolls from inside it, once, and a roar follows the bell like a wave on a beach."],
        ["narr", "Crowds on every stair. Bread sellers, bet-takers, boys selling pennants, and, in a side court behind a rope, a line of people sitting very still with numbers chalked on their sleeves."]]);
      c.shake(1, 500); c.sfx("bell");
      c.follow();
    });
    await F.banter("arena");
  };
  S.done.tzavanArrive = F => F.f("tzavan.seen");
  Object.assign(T("tzavan"), {
    arenaClerk: async F => {
      await Systems.arena.counter(F);
      if (F.f("arena.licence")) { const i = await F.ask("Anything else?", [{ label: "The Gladiator's Locker" }, { label: "No, thank you" }], { top: "40%" }); if (i === 0) await F.shop("locker"); }
    },
    bookmaker: async F => { await say("bookmaker", "Small stakes, big dreams. I take what you can afford to lose and I take it with a smile. The clerk at the counter will set the line."); },
    gladiator: async F => { await say("gladiator", F.f("cup.bronze") ? "You took the Bronze. Good. Now they will make you fight someone you like." : "I would tell you about the sand, but you would not believe me. It is warm. It is always warm. That is the worst of it."); },
    slaveMerchant: async F => {
      const st = F.qstep("family");
      if (st === "done") { await say("slaveMerchant", "The cell stands open, I am told. Empty. It will go in the ledger as an escape. It is entered in the ledger."); return; }
      if (st === undefined) {
        await UI.say([["narr", "Behind the rope, a line of people sit on a stone bench with numbers chalked on their sleeves. A woman holds two children very close, one under each arm, and does not look at the buyers. The children do not look at anyone."], ["slaveMerchant", "Everyone has a price. Yours is high."], ["hero", "..."], ["slaveMerchant", "The mother and the two small ones are lot twelve. They were sold this morning to a buyer at the Hall, and are waiting in a cell under it until he comes. The cell stair is the guarded one on the east side of the arena; twelve is the last door along the north wall. Do not look at me like that. It is entered in the ledger."]]);
        F.quest("family", 0); return;
      }
      await say("slaveMerchant", "Lot twelve is in the cells under the Hall, at the far east end. Down the guarded stair beside the arena. I would not go. The overseer there has been told what to do with visitors.");
    },
    ring1: async F => {
      const st = F.qstep("ring1");
      if (st === "done") { await say("ring1", "A net is a thought about where someone will be. You have a better one. Wear the cape."); return; }
      if (st === undefined) { await say("ring1", "I threw nets for the Hall for twenty years. My student is better than I was and does not know it. Meet him behind the stalls, and see whether you can think faster than his net. I would like to know."); F.quest("ring1", 0); return; }
      const i = await F.ask("Casso's student waits behind the bazaar stalls.", [{ label: "Meet him" }, { label: "Not now" }], { top: "40%" });
      if (i !== 0) return;
      const res = await F.fight([F.mkEnemy("netFighter", 32)], { bg: "colosseum", intro: "Casso's student unrolls his net!" });
      if (res !== "win") return;
      F.questDone("ring1"); F.give("sandCape", 1, true);
      await UI.say([["ring1", "Hah! He came back with his net in a knot. Take this, it is sand from the old black arena, pressed into red wool. It does nothing and looks superb."]]);
    },
    ring2: async F => {
      const st = F.qstep("ring2");
      if (st === "done") { await say("ring2", "My old cell is quiet. I sleep better now, and I do not sleep, if you follow."); return; }
      if (st === undefined) { await say("ring2", "There is a ghost in my old cell in the barracks. It sits on the bunk. It folds the blanket every night, and I did not put it there to be folded. I will not go back down. You might. The cell stair is the guarded one on the east side of the arena. Mine is the first cell on the north wall."); F.quest("ring2", 0); return; }
      if (F.f("ring2.cell")) { F.questDone("ring2"); F.give("candle", 3, true); await UI.say([["ring2", "Quiet? Truly quiet? Then I owe you a candle. Three. They are for luring things, but the old women say they also keep the dark from the bed."]]); }
      else await say("ring2", "It is down the guarded stair on the east side of the arena. The first cell along the north wall. The one with the folded blanket.");
    },
    ring3: async F => {
      const st = F.qstep("ring3");
      if (st === "done") { await say("ring3", "The arm is better. The doctors would not touch it. It is the salt. It is always the salt."); return; }
      if (st === undefined) { await say("ring3", "The arena doctors would not touch this wound, because I am a slave and a wound is cheaper than a doctor. Packing it in salt would do it. Three salt crystals, the sea-hydra kind. I would pay."); F.quest("ring3", 0); return; }
      if ((G.goods.saltCrystal || 0) >= 3) { G.goods.saltCrystal -= 3; F.questDone("ring3"); F.gold(300); F.sfx("coin"); await say("ring3", "Three. Clean. It will sting like a hundred wasps. Thank you. Take this, it is not much, it is all I won."); }
      else await say("ring3", `Salt crystals: ${Math.min(3, G.goods.saltCrystal || 0)} of 3. The little hydras on the open sea carry them.`);
    },
  });

  // ---------------------------------------- the barracks ----------------------------------------
  M3.region("tzavanBarracks", { n: "The Arena Barracks", arena: "barracks", music: "arenaCity", table: "barracks", fields: true, dungeon: true, autos: ["barracksEnter"],
    npcs: [["captiveTamer", "A prisoner in cell nine"]], exits: [["tzavan", "Up the cell stair", () => true]],
    things: [["familyCell", "Cell twelve", s => s.q.family === 0 || (s.q.family === 1 && !s.f["family.freed"]), "trigger"], ["meretCell", "The cell with a folded blanket", s => s.q.ring2 === 0 && !s.f["ring2.cell"], "trigger"], ["barracksChest", "A guard's chest", s => !s.f["c.barracks"], "chest"]] });
  S.trigger.barracksEnter = async F => { if (!M3.once(F, "barracks.seen")) return; await UI.say([["narr", "Low arches, cage rows, a drain running down the middle of the floor, torches in iron cups. The sand from the arena has drifted down the stairs and lies in drifts in the corners. Somewhere a chain moves, once, and stops."]]); };
  S.done.barracksEnter = F => F.f("barracks.seen");
  S.chest.barracksChest = async F => { if (F.f("c.barracks")) return false; F.set("c.barracks"); F.give("sunwater", 3); F.gold(300); await UI.say([["narr", "A guard's chest under a bench. Three Sunwater Flasks and a purse, and on the lid someone has scratched a row of tally marks, a hundred and more."]]); };
  M3.spot("tzavanBarracks", ["captiveTamer", "captive"], async F => {
    await UI.say([["narr", "Cell nine. A thin woman in a tamer's grey cloak, sitting with her back to the wall, a rope of knots in her hands. She does not stand. She looks at your creature before she looks at you."],
      ["captive", "A tamer. Real or the Hall's? ...Real. Good. Then listen. The empire has a place for tamers: black glass and cliff-wind. A prison in the north. They keep the good ones. The ones who talk to the creatures. They keep them alive, which is the worst of it."],
      ["captive", "You will see it. Do not let them put you on the bridge."]]);
    F.set("captive.met");
  }, "t");
  S.trigger.meretCell = async F => {
    if (F.f("ring2.cell")) return;
    await UI.say([["narr", "The cell at the end of the second row. The door hangs open. On the bunk a grey blanket is folded in four, corners squared, and as you step in, the air in the cell goes cold, and the shape of someone sitting on the bunk comes out of nothing."]]);
    const res = await F.fight([F.mkEnemy("cellGhost", 32)], { bg: "barracks", intro: "A ghost in the cell turns its head!" });
    if (res !== "win") return;
    F.set("ring2.cell"); await UI.say([["narr", "The shape unfolds, and thins, and is gone. The blanket stays folded. The cell is only a cell."]]);
  };
  S.done.meretCell = F => F.f("ring2.cell");
  S.trigger.familyCell = async F => {
    if (F.f("family.freed")) return;
    await UI.say([["narr", "Cell twelve. An overseer in a leather apron sits on a stool across the cell door with a bunch of keys on his knee, two guards on the wall behind him. In the cell, the woman and two small children, on the floor, side by side."], ["overseer", "No visitors. The buyer comes at the next bell. By the authority of the Throne."]]);
    const res = await F.fight([F.mkEnemy("marketOverseer", 31), F.mkEnemy("legionSpearman", 31, " A"), F.mkEnemy("legionSpearman", 31, " B")], { bg: "barracks", intro: "The overseer rises with his keys in his fist!" });
    if (res !== "win") return;
    F.set("family.freed"); F.questDone("family");
    await Cinema.stage(async c => {
      M3.actors(c, [["mother", "npcSlave", 70, -6], ["kid1", "npcChild", 40, 18], ["kid2", "npcChild", 96, 22]]);
      await c.say([["narr", "You take the keys off the overseer's belt. The door swings open, and for a moment nobody inside it moves. Then the smaller of the two children lets go of the woman's sleeve and walks out into the corridor on his own."], ["mother", "...Where do we go?"], ["hero", "The harbour. A ship called the Salt Heron. Tell the captain I sent you, and that the fare has been paid."]]);
      await c.walk("mother", c.hero.x - 260, c.hero.y - 40, 2600); c.remove("mother"); c.remove("kid1"); c.remove("kid2");
    });
  };
  S.done.familyCell = F => F.f("family.freed");
})();

// ---------- part 9: bestiary, drops, break lore for chapters 5 and 6; chapter hand-offs (dbg.jump(6), dbg.jump(7)) ----------
(function () {
  const S = window.Story, D = window.Data, M3 = S.m3, m = M3.m, Q = Object.assign;
  // ---------- bestiary (apprentice voice: the behaviour that matters in a fight, then one thing you can see) ----------
  Q(D.BEST, {
    legionTribune: "An officer with a horn at his belt. He blows it once, and a spearman comes running. Cut him down early.",
    houndOfTheCohort: "A war-dog in plate armour, fast, and its bite bleeds. The plates rattle when it runs. Cold slows it.",
    academyWardenConstruct: "A golem of brass and white stone with a lamp for an eye. Slow, heavy-handed, and blows slide off it. Lightning goes through the brass.",
    frostWisp: "A cold spark in a jar of nothing. It chills what it touches. Fire eats it.",
    rimeBasilisk: "An icy lizard with a bird's crest. Its bite slows you down. Fire melts the crest.",
    archiveWraith: "A clerk's ghost with a quill still in its hand. It takes your good buffs for itself. Fire sends it off, and the quill is left behind.",
    crystalGargoyle: "Stone and ice, with the cold running through both. Spells slide off it. A heavy blow shatters it.",
    vaultHound: "A three-headed puppy, smaller than the one at the gate. It bites three times a turn. Poison works.",
    oasisSphinxGuard: "A lion-bodied scholar who asks riddles and bites if you answer wrong. Cold slows its thinking.",
    mesaRoc: "A bird the size of a cart, nesting on the mesas. Its dive hits hard and its feathers are worth good kakal. Lightning brings it down.",
    brassAutomaton: "A half-rusted builder machine that still wants to work. Bleeding does nothing, water rusts it. The core inside is worth a lot to scholars.",
    sandWyrmling: "A small desert serpent with a scale like a coin. Quick and ill-tempered.",
    seaGullHarpy: "A coast harpy with a gull's voice. They come in threes and swarm the weakest.",
    krakenWhelp: "A baby kraken in a shell the size of a barrel. It grabs and slows. The shells fetch a good price.",
    gullLord: "A gull with a human face and a bad temper. It dives from above. They are loud before they strike.",
    sirenEel: "A long eel with a woman's head. Her song lowers your Resistance. She tires fast, and the scales are cold in the hand.",
    saltHydraChick: "A small hydra with salt crystals in its scales. Its bite poisons. The crystals are good for packing wounds.",
    mermaidShaman: "A fish-tailed healer, always with another creature beside it. Lightning stops the song. Leave her for last, and she is a nuisance.",
    scyllaHound: "A dog-headed eel in the caves. Quick bites, and it likes to come in twos.",
    whirlpoolImp: "A small water fiend that spins itself into a top. It drags you off balance.",
    caveCrabKnight: "A crab in a salvaged helmet. Heavy shell, heavy claws. A heavy blow cracks it.",
    drownedSailorWraith: "The ghost of a sailor with a tin badge and no ship. It chills the party. Fire and light drive it off.",
    ashImp: "A small fire fiend that throws embers. It crackles as it laughs.",
    lavaBoarling: "A boar made of cooling lava. It charges, and the tusks are hot.",
    cinderGargoyle: "A stone gargoyle with wings of cinder. It burns what it claws. A heavy blow cracks it.",
    smokePhoenixChick: "A small bird of smoke that can bring a fallen friend back once. Break the chick first and nothing rises.",
    basaltTroll: "A troll of black stone, tanky and slow, and burn does nothing to it. Heavy blows or water.",
    salamanderKnight: "An armoured lizard in a cloak of cinder. Water cools it and a cold edge hurts it.",
    obsidianJackal: "A fast jackal with a glass bite. Its bite bleeds, and it comes in threes.",
    gloomcapWalker: "A mushroom man who walks through caves. His spores poison everyone. Fire clears the air.",
    boneCerberusPup: "A pup of the Gate Hound, all bone and three heads, much smaller than its father. Poison works.",
    ferryGhoul: "A ghoul with an oar. It drags you aboard and slows you. Fire and light hurt it.",
    shadeLamia: "A woman-snake of smoke. Her coils lower your Resistance for three turns. Light hurts her.",
    paleMinotaurShade: "A ghostly bull that hits very hard on the third turn. Light unmakes it.",
    tombScarab: "A beetle from a tomb. It rises again once, as long as its master is alive. Take the master first.",
    lionWolf: "The arena's own beast: a lion's mane on a wolf's body. It bleeds you, and howls to weaken the pack.",
    boarBull: "A boar with a bull's horns. It charges on the third turn. Brace for it.",
    fenLeech: "A leech as long as an arm. It drinks, and heals itself on what it drinks. Fire makes it let go.",
    bogLantern: "A wisp over the water. It draws every eye, and every blow, to itself. Lightning ends it.",
    giantstoneSentry: "A fragment of a giant, carved and given legs. Slow, huge, and tanky. Heavy blows only.",
    chiselImp: "A quick imp with a mason's chisel. Every stab lowers your Defense.",
    emberhawk: "A fire-feathered hawk with a burning talon. Water puts it out.",
    sunbirdChick: "A golden chick that heals its friends when they are hurt. Peck it down first.",
    marketOverseer: "A slave-market overseer with a whip and a ring of keys. His whip bleeds, and he shouts the guards to hit harder.",
    netFighter: "An arena fighter with a trident and a weighted net. The net slows the whole team.",
    cellGhost: "A prisoner's ghost that sits on a bunk. Its cold hands lower your Power. It would rather not fight.",
    drownedShrineGuardian: "The keeper of the Drowned Fen Shrine: a giant of green stone that stands up out of the black water. Two strikes of lightning in a row make it flinch.",
    stoneGiant: "A giant carved into a quarry wall, slow and heavy. Three heavy blows in a row crack the stone.",
    sunbirdGuardian: "A bird of noon sunlight that keeps to the air. Wash it with water twice and it falls to the ground.",
    motherOfTheMaelstrom: "A Titan, a warden who turns the sea above her. Chill her, then soak the whirlpool: it holds still.",
    emberWolf: "A Titan of flame that runs and runs. It speeds up each turn. Soak it twice and it stops to shake.",
    gateHound: "A Titan: a hound with three heads that guard a gate of black glass. Poison all three heads at once and they fall silent together.",
    oldHollowbell: "A tortoise the size of a wagon with a bronze bell grown into its shell. It tolls every third turn. Heavy blows quiet it.",
    blackPearlHermit: "A crab-man who guards a black pearl and fights fairly. Any element reaction upsets his guard.",
    bronzeChampion: "A gladiator behind a tower shield with a chained beast at his heel. Two heavy blows crack his shield.",
    bronzeBeast: "The Bronze Champion's captured beast. It guards its master and gets very angry if he falls.",
  });
  // ---------- break lore (the Journal prints it once the player has performed or learned the break) ----------
  Q(D.BREAKS, {
    drownedShrineGuardian: "Strike it with lightning twice in a breath and the water loses its shape for a turn.",
    stoneGiant: "Three heavy blows in a row crack the stone and it kneels.",
    sunbirdGuardian: "Soak it twice and it can no longer hold the air. It falls to the ground and it is slow to rise.",
    motherOfTheMaelstrom: "Chill her, then soak the whirlpool. The sea above her goes still, and she with it.",
    emberWolf: "Soak it twice in a breath. It stops to shake itself dry, and it is slower for it.",
    gateHound: "Poison all three heads together. They stop healing each other, and each hurts more.",
    oldHollowbell: "Two heavy blows in a row. The bell stops ringing.",
    blackPearlHermit: "Any reaction between two elements will upset his guard.",
    bronzeChampion: "Two heavy blows crack the tower shield.",
  });
  // ---------- drops: item/mat/good and chance ----------
  Q(D.DROPS, {
    legionTribune: [["tribuneBadge", 0.45], ["legionCoin", 0.5]], houndOfTheCohort: [["houndStrap", 0.45]], academyWardenConstruct: [["wardenLens", 0.4]],
    frostWisp: [["frostSpark", 0.45]], rimeBasilisk: [["rimeCrest", 0.4], ["rimecrystal", 0.15]], archiveWraith: [["wraithQuill", 0.4]], crystalGargoyle: [["gargoyleShard", 0.4], ["rimecrystal", 0.25]], vaultHound: [["houndFang", 0.45]],
    oasisSphinxGuard: [["riddleScroll", 0.4]], mesaRoc: [["rocFeather", 0.45]], brassAutomaton: [["automatonCore", 0.3]], sandWyrmling: [["wyrmScale", 0.5]], seaGullHarpy: [["gullFeather", 0.5]],
    krakenWhelp: [["whelpShell", 0.4]], gullLord: [["lordBand", 0.45]], sirenEel: [["sirenScale", 0.45]], saltHydraChick: [["saltCrystal", 0.5]], mermaidShaman: [["shamanPearl", 0.35]],
    scyllaHound: [["scyllaTooth", 0.45]], whirlpoolImp: [["whirlShell", 0.5]], caveCrabKnight: [["crabPlate", 0.4]], drownedSailorWraith: [["sailorBadge", 0.4]],
    ashImp: [["ashCinder", 0.5]], lavaBoarling: [["lavaTusk", 0.4]], cinderGargoyle: [["cinderWing", 0.4]], smokePhoenixChick: [["smokeDown", 0.4]], basaltTroll: [["trollHide", 0.4]], salamanderKnight: [["salamanderScale", 0.4]], obsidianJackal: [["obsidianFang", 0.4]],
    gloomcapWalker: [["walkerCap", 0.45]], boneCerberusPup: [["pupBone", 0.4]], ferryGhoul: [["ghoulOar", 0.4]], shadeLamia: [["lamiaVeil", 0.4]], paleMinotaurShade: [["shadeHorn", 0.35]], tombScarab: [["tombScarabShell", 0.5]],
    lionWolf: [["wolfMane", 0.45]], boarBull: [["bullTusk", 0.45]], fenLeech: [["leechSac", 0.5]], bogLantern: [["bogGlass", 0.45]], giantstoneSentry: [["giantChip", 0.4]], chiselImp: [["impChisel", 0.5]], emberhawk: [["hawkFeather", 0.4]], sunbirdChick: [["chickDown", 0.4]],
    marketOverseer: [["legionCoin", 1]], netFighter: [["legionCoin", 0.5]], cellGhost: [["curio", 0.4]],
  });
  Q(D.LORE, { companyCharter: D.LORE.companyCharter, masks: D.LORE.masks, longPatience: D.LORE.longPatience });
  [["lore.charter", "The Company's charter", D.LORE.companyCharter], ["lore.longPatience", "The Long Patience's log", D.LORE.longPatience], ["lore.masks", "The death-mask chamber", D.LORE.masks]].forEach(r => M3.LORE.push(r));

  // ---------- hand-offs ----------
  S.start[6] = { region: "brassHarbour", entry: "from_haldarsReach" };
  S.finish[6] = (F, G) => {
    ["ch6.start", "ch6.arrive", "ch6.seaFirst", "ch6.s7", "ch6.kharam", "ch6.contract", "ch6.s9", "ch6.s8", "ch6.vote", "ch6.briefed", "ch6.plan", "ch6.done", "contract.rhaz", "contract.corvin",
      "k3.done", "k4.done", "k3.freed", "k4.freed", "k3.seen", "k4.seen", "ship", "ferryPass", "qb.1", "qb.2", "qb.3", "qb.4", "qb.5", "quarry.open", "fen.drained", "lore.charter"].forEach(k => F.set(k));
    F.set("ch6.n1", 0);
    ["m_heron", "m_kharam", "m_contract", "m_vote", "m_plan"].forEach(q => (G.quests[q] = "done"));
    F.giveGear("G14", 3, true); F.giveGear("G18", 3, true); F.give("harbourPass", 1, true); F.give("shipLog", 1, true);
    ["mirequeen", "brassbone"].forEach(id => { if (!F.allCreatures().some(u => u.id === id)) { G.collection.push(F.mk(id, Math.max(3, F.avgLevel() - 1))); G.best[id] = G.best[id] || { seen: 1, beaten: 0 }; } });
    G.flags["wagon.at"] = "haldarsReach"; G.gold += 1200; G.lastTown = "brassHarbour"; G.ch = 6;
    if (window.Systems) { Systems.giveShip(F, { pass: false }); Systems.giveFerryPass(F, true); }
  };
})();

// ---------- skill book (SKILLBOOK agent 2026-10-31): Kelp Poultice (Wrack Kelp, Brass Harbour + the Maelstrom/open sea) and Chisel Crack (Chisel Steel, Quarry of the Stone Giants) ----------
(function () {
  const S = window.Story, D = window.Data, M2 = S.m2, add = (id, ...drops) => { D.DROPS[id] = (D.DROPS[id] || []).concat(drops); };
  Object.assign(D.MATS, {
    wrackKelp: ["Wrack Kelp", "Brown, slick and salty. Gullrest wives bind wounds with it and say it stings less than the truth."],
    chiselSteel: ["Chisel Steel", "A sliver off a giant's chisel. The edge has not dulled since the last hand that held it."],
  });
  Object.assign(D.BOOK, {
    kelpPoultice: { n: "Kelp Poultice", mat: "wrackKelp", need: 10, d: "3 MP. Heals every ally for 56% of the user's Power (Healing Wave: 77%).", move: "kelpPoultice" },
    chiselCrack: { n: "Chisel Crack", mat: "chiselSteel", need: 10, d: "2 MP. Hit that lowers enemy Defense by 20% for 3 turns. Counts toward shell breaks.", move: "chiselCrack" },
  });
  add("sirenEel", ["wrackKelp", 0.25]); add("caveCrabKnight", ["wrackKelp", 0.25]);
  add("chiselImp", ["chiselSteel", 0.3]); add("giantstoneSentry", ["chiselSteel", 0.25]);
  M2.bookSpot("brassHarbour", "wrackKelp1", "Kelp hanging on the pilings", "g.kelp1", "wrackKelp", 5, "The tide leaves kelp on the quay pilings in long brown ropes, and the dockers stack it in the shade to dry. Nobody stops you filling a bag. Five lengths of Wrack Kelp, slick and salty.", "Kelp Poultice");
  M2.bookSpot("brassHarbour", "wrackKelp2", "Kelp laid out to dry", "g.kelp2", "wrackKelp", 5, "A sailor mending a net has spread kelp on the cobbles to dry. 'For wounds, not for soup,' he says, and waves at the heap. Five more lengths.", "Kelp Poultice");
  M2.bookSpot("giantQuarry", "chiselSteel1", "Snapped chisels under the tool rack", "g.chisel1", "chiselSteel", 5, "Under the tool rack the giants' chisels lie in a heap, snapped across the middle. The steel is the colour of old honey and still keeps an edge. You wrap five slivers in a rag.", "Chisel Crack");
  M2.bookSpot("giantQuarry", "chiselSteel2", "A cart of spoilt chisels", "g.chisel2", "chiselSteel", 5, "A cart of spoilt chisels, tipped over and forgotten when the work stopped. Five more slivers, each as long as your hand.", "Chisel Crack");
})();
