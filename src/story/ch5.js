// Chapter 5, The Truth: Saltgate caravan, Ashen Orun, the study and memory room, the Undervaults and Cold Vaults, the canyon escape, Haldar's Reach and its siege (owner: STORY-M3, 2026-10-31).
// This file also holds the helpers and data that chapters 5 and 6 share (window.Story.m3). Spec: ../game-mechanics/specs/M3.md. Voices: ../game-mechanics/STORY_BIBLE.md. Log: logs/STORY-M3.md.
"use strict";
(function () {
  const S = window.Story, D = window.Data, M3 = S.m3 = {};
  S.begin = S.begin || {}; S.legend = S.legend || {}; S.done = S.done || {};
  const T = rid => (S.talk[rid] = S.talk[rid] || {});
  const m = ch => (window.Systems && Systems.m ? Systems.m(ch) : 90);   // ECONOMY "m": what one fight pays in that chapter
  M3.m = m; M3.T = T;

  // ---------- speakers (portraits come from assets/portraits/<id>.png when ART has drawn them, else the stand-in) ----------
  const FACE = { m: "assets/face_merchant.png", s: "assets/face_scholar.png", i: "assets/face_innkeeper.png", t: "assets/face_mentor.png", h: "assets/face_hero.png" };
  M3.people = list => list.forEach(([id, name, f, art]) => { if (!UI.PEOPLE[id]) UI.person(id, name, ["assets/portraits/" + (art || id) + ".png", FACE[f || "s"]]); });   // art: reuse another id's portrait until ART draws this one
  M3.people([["sarn", "Tribune Sarn", "t"], ["legionary", "Legionary", "m", "soldier"], ["printer", "Printer", "s"], ["sefa", "Sefa Quill", "i"], ["saffa", "Saffa Qarim", "t"], ["hadiya", "Hadiya Wells", "m"],
    ["odan", "Brother Odan", "s"], ["kessa", "Kessa Vorn", "h"], ["dorrin", "Dorrin Hale", "m"], ["mayle", "Mayle Tarn", "s"], ["refugee", "Refugee", "s"], ["lanternBuilder", "Lantern-builder", "m"],
    ["forgemaster", "Forge-master", "m"], ["caravanMaster", "Caravan master", "m"], ["stallkeeper", "Stall-keeper", "m"], ["scribe", "Scribe", "s"], ["oldwoman", "Old woman", "i"], ["boy", "Boy", "h", "child"],
    ["docker", "Docker", "m"], ["sailor", "Sailor", "m"], ["yusra", "Yusra Daal", "t"], ["shipwright", "Shipwright", "m"], ["purser", "Purser", "m"], ["rhaz", "Rhaz", "m"], ["peya", "Peya", "i"],
    ["corvin", "Corvin Dray", "m"], ["ilse", "Sister Ilse", "i"], ["wellKeeper", "Well-Keeper", "i"], ["gullCaptain", "Old fisher", "m"], ["fisher", "Fisher", "m"], ["bather", "Bather", "i"],
    ["pilgrim", "Pilgrim", "s"], ["bellringer", "Bell-ringer", "s"], ["mourner", "Mourner", "i"], ["pale", "The Pale Ferryman", "t"], ["ferryman", "Ferryman", "m"], ["arenaClerk", "Arena clerk", "s"],
    ["bookmaker", "Bookmaker", "m"], ["gladiator", "Gladiator", "m"], ["ring1", "Casso", "m"], ["ring2", "Meret", "i"], ["ring3", "Brun", "m"], ["slaveMerchant", "Slave merchant", "m"],
    ["overseer", "Overseer", "m"], ["hermit", "The Black Pearl Hermit", "s"], ["ranna", "Ranna Kell", "i"], ["captive", "Captive tamer", "s"], ["guard", "Guard", "m"], ["pell", "Pell", "s"],
    ["captain", "Captain Brisk", "m"], ["courier", "Courier", "m"], ["innkeeper", "Innkeeper", "i"], ["merchant", "Merchant", "m"]]);
  if (!UI.PEOPLE.collar) UI.person("collar", "The Collar", []);
  ["mirequeen", "brassbone", "selkira"].forEach(id => { if (!UI.PEOPLE[id]) UI.person(id, id.charAt(0).toUpperCase() + id.slice(1), ["assets/portraits/" + id + ".png", "assets/creatures/" + id + ".png"]); });

  // ---------- rumours: three fixed ones per town (r1 r2 r3) and the style clues, which are computed from this playthrough's generals ----------
  // M3.rumours(town, [3 strings], [() => clue text, ...]): the clues are getters at index 3, 4, so the Journal and F.rumour see them like any other rumour.
  M3.rumours = (town, fixed, clues, extra) => {
    const arr = fixed.map(s => '"' + s + '"');
    (clues || []).forEach((c, i) => Object.defineProperty(arr, 3 + i, { get: () => { try { return c() || ""; } catch (e) { return ""; } }, enumerable: true, configurable: true }));
    (extra || []).forEach((s, i) => { arr[3 + (clues || []).length + i] = '"' + s + '"'; });
    D.RUMOURS[town] = arr;
  };
  M3.clue = (slot, v) => () => S.styleClue(slot, v);
  M3.onRumour = {};   // "town:idx" -> async F => {} : a rumour that starts a quest
  // villager idx (0..2) of a town: the fixed rumour the first time; later the style clue (index 3 + idx) if there is one; extra rumours (the Refugee Market) when `unlock` says so
  M3.rum = (town, idx, who, opts) => async F => {
    const list = D.RUMOURS[town] || [], seen = (G.rumours[town] = G.rumours[town] || []);
    if (!seen.includes(idx)) { await S.rumourIdx(F, town, idx, who); const h = M3.onRumour[town + ":" + idx]; if (h) await h(F); return; }
    const o = opts || {}, extraFrom = 3 + (o.clues || 0);
    let k = list[3 + idx] && 3 + idx < extraFrom ? 3 + idx : -1;
    if (k < 0 && o.unlock && o.unlock(F) && list[extraFrom + idx]) k = extraFrom + idx;
    if (k >= 0 && !seen.includes(k) && list[k]) { await S.rumourIdx(F, town, k, who); return; }
    await UI.say([[who, o.none || "Nothing new since you last asked. Come back after the next bell."]]);
  };

  // ---------- towns and regions ----------
  M3.talkTown = (rid, o) => {
    const t = T(rid);
    t.innkeeper = async F => { await UI.say([["innkeeper", typeof o.innLine === "function" ? o.innLine(F) : o.innLine]]); const slept = await F.inn(o.inn); if (slept && o.afterInn) await o.afterInn(F); };
    t.merchant = async F => { await UI.say([["merchant", typeof o.shopLine === "function" ? o.shopLine(F) : o.shopLine]]); await F.shop(o.shop); };
    (o.who || []).forEach((who, i) => { t["r" + (i + 1)] = M3.rum(o.rum || rid, i, who, o.opts); });
  };
  // Data.REGIONS[id]: music, arena, table, town/inn keys. npcs / exits / things / autos feed the fallback hub (menu explorer) and F.enter's arrival triggers.
  M3.region = (id, o) => { D.REGIONS[id] = Object.assign({ bg: "bg_desert", npcs: [], exits: [], things: [], autos: [] }, o); return D.REGIONS[id]; };
  // register a handler under every kind of id the world map might use for the same spot
  M3.spot = (rid, ids, fn, kinds) => [].concat(ids).forEach(id => {
    const k = kinds || "tgc";
    if (k.includes("t")) T(rid)[id] = fn;
    if (k.includes("g")) S.gather[id] = S.gather[id] || fn;
    if (k.includes("c")) S.trigger[id] = S.trigger[id] || fn;
  });
  M3.once = (F, flag) => { if (F.f(flag)) return false; F.set(flag); return true; };

  // ---------- cinema helpers (scenes are written relative to the hero so they fit any map) ----------
  M3.sceneNpc = id => { const sc = window.World && World.scene; const n = sc && sc.npcs && sc.npcs.find(q => q.id === id); return n ? { x: n.x, y: n.y } : null; };
  M3.actors = (c, list) => { const h = c.hero; list.forEach(([id, art, dx, dy, o]) => c.actor(id, Object.assign({ art, x: h.x + dx, y: h.y + (dy || 0) }, o || {}))); };
  M3.nightfall = async (F, text) => { await UI.fade(true, 700); F.healAll(); G.nights++; if (text) await UI.say([["narr", text]]); await UI.fade(false, 700); };

  // ---------- creature generals (STORY_BIBLE 6) use STORY-M2's template (ch3.js): the stage, the Cinema.boss reveal with the meet lines, the fight (the general speaks in the battle log through Core.HOOKS.genLines), ----------
  // the collar shatters, the creature leaves, a Journal note. o: { level, soldiers: [[enemyId, level, tag]], bg, title, setup: async c => {}, banter, place, where, after: [hero lines] }  ->  true when it was freed
  M3.general = (F, slot, o) => S.generalScene(F, slot, o);
  // a boss with its Cinema.boss reveal. o: { id, level, name, title, bg, music, lines, stage: async c => {}, foes (override), intro, art }
  M3.boss = async (F, o) => {
    if (o.stage) await Cinema.stage(o.stage, { music: o.music });
    await Cinema.boss({ id: o.art || o.id, name: o.name, title: o.title, bg: o.bg, music: o.music || "boss", lines: o.lines || [] });
    const foes = o.foes || (Core.ENEMIES[o.id] ? Core.bossFoes(o.id, o.level) : [F.mkEnemy(o.id, o.level)]);
    return F.boss(foes, { bg: o.bg, music: o.music || "boss", intro: o.intro || (Core.ENEMIES[o.id] && Core.ENEMIES[o.id].intro) });
  };
  // ======================================================================================================================================
  // DATA shared by chapters 5 and 6: items, goods, materials, skill book, quests, inns, shops
  // ======================================================================================================================================
  const BAS = ["sunwater", "antidote"], CURES = [];
  const BOMBS = ["cinderBomb", "rimeFlask", "soakJar", "sparkJar", "venomPot"], WARDS = ["cinderWard", "rimeWard", "stormWard", "venomWard"];
  const disc = (list, f) => { const o = {}; list.forEach(k => (o[k] = f)); return o; };
  const key = (n, d) => ({ n, d, key: true });
  Object.assign(D.ITEMS, {
    mentorLetter: key("Ithiel's Unfinished Letter", "\"Child - I told myself it would be only the maps. Then only the lab...\" It stops in the middle of a line."),
    dataLog1: key("Data Log 1: Weekly Receipt", "\"Weekly receipt, 41st week: field-team battle records. Received complete, as agreed. Forwarded to the Office of Titan Affairs.\""),
    dataLog2: key("Data Log 2: Sites Charted", "\"Titan sites charted by the Academy field teams: the Dune Bearer, confirmed; the Plumed Coil, confirmed; the Maelstrom, in outline. Source: the apprentice team of Master Ithiel. Value: considerable.\""),
    dataLog3: key("Data Log 3: The Day of the Raid", "\"Raid on Orun: the day of the apprentice's pack choice. Pens 1 to 9 to be taken. The apprentice to be left in the vault, unseen, with one pack. Instruction of the Master: do not harm the boy; do not let him be seen.\""),
    dataLog4: key("Data Log 4: A Covering Note", "In Ithiel's hand: \"The records you want are in the satchel. He does not know what he carries. Continue to treat him as a student. - I.\""),
    dataLog5: key("Data Log 5: Consideration", "\"Consideration: as agreed. The Founder's word has been kept for nineteen years.\""),
    keyK3: key("Fen Shrine Key", "A green-stained key that smells of the fen. Opens a cage at the Menagerie Wagon."),
    keyK4: key("Quarry Key", "A key cut from a giant's fingernail of black stone. Opens a cage at the Menagerie Wagon."),
    keyK5: key("Sunbird Key", "A feather-shaped key, warm even in the cold. Opens a cage at the Menagerie Wagon."),
    springCharm: key("Spring Charm", "A smooth black stone from the Cinderwatch hot spring, warm on one side. Every creature starts each fight with 1 extra MP."),
    harbourPass: key("Berth Papers", "The Salt Heron's papers, stamped by the Harbourmaster of Brass Harbour. Her berth is yours."),
    shipLog: key("The Salt Heron's Log", "Captain Brisk's log. The first page says: Never the same route twice."),
    sandCape: key("Sand-Dyed Cape", "Cosmetic. The sand of the Black Sand arena, pressed into red wool. It does nothing and looks superb.")
  });
  Object.assign(D.ITEMS.sandCape, { f: 14 });
  Object.assign(D.ITEMS, { arenaPennant: Object.assign(key("Hundred Banners Pennant", "Cosmetic. A small pennant for the Salt Heron's rail."), { f: 8 }), riverGlassBead: key("River-Glass Bead", "Cosmetic. A bead of green glass pressed into your hand by a woman who could not speak.") });
  Object.assign(D.GOODS, {   // [name, base price]; chapter 5 and 6 trade goods
    tribuneBadge: ["Tribune's Horn Badge", 26], houndStrap: ["Plated Hound-Strap", 20], wardenLens: ["Warden Lamp-Lens", 32], frostSpark: ["Frost-Spark Jar", 24], rimeCrest: ["Rime Crest", 28],
    wraithQuill: ["Wraith Quill", 34], gargoyleShard: ["Gargoyle Shard", 30], houndFang: ["Vault-Hound Fang", 22],
    riddleScroll: ["Riddle Scroll", 30], rocFeather: ["Roc Feather", 44], automatonCore: ["Automaton Core", 40], wyrmScale: ["Wyrmling Scale", 26], gullFeather: ["Gull Feather", 18],
    whelpShell: ["Whelp Shell", 36], lordBand: ["Gull-Lord's Band", 28], sirenScale: ["Siren Scale", 34], saltCrystal: ["Salt Crystal", 30], shamanPearl: ["Shaman Pearl", 42],
    scyllaTooth: ["Scylla Tooth", 36], whirlShell: ["Whirlpool Shell", 28], crabPlate: ["Crab-Knight Plate", 40], sailorBadge: ["Sailor's Tin Badge", 32],
    ashCinder: ["Ash Cinder", 24], lavaTusk: ["Lava Tusk", 38], cinderWing: ["Cinder Wing", 42], smokeDown: ["Smoke Down", 40], trollHide: ["Basalt Troll Hide", 46], salamanderScale: ["Salamander Scale", 44], obsidianFang: ["Obsidian Fang", 44],
    walkerCap: ["Walker's Cap", 38], pupBone: ["Pup Knuckle-Bone", 36], ghoulOar: ["Ghoul's Oar-Splinter", 38], lamiaVeil: ["Lamia Veil", 46], shadeHorn: ["Shade Horn", 52], tombScarabShell: ["Tomb Scarab", 34],
    leechSac: ["Leech Sac", 30], bogGlass: ["Bog-Lantern Glass", 34], giantChip: ["Giant-Stone Chip", 40], impChisel: ["Imp's Chisel", 30], hawkFeather: ["Emberhawk Feather", 40], chickDown: ["Golden Down", 36],
    wolfMane: ["Lion-Wolf Mane", 34], bullTusk: ["Boar-Bull Tusk", 34] });
  D.MATS.rimecrystal = ["Rimecrystal", "Ice that never melts, even in a fist."];
  D.BOOK.coldSnap = { n: "Cold Snap", mat: "rimecrystal", need: 10, d: "Ice move, 2 MP. Adds chill. Chill and Wet together make a Freeze.", move: "coldSnap" };
  D.BREAKS = D.BREAKS || {};

  Object.assign(D.QUESTS, {
    m_truth: { t: "The Truth", main: true, ch: 5, steps: ["Ride the Master's caravan from Saltgate to Ashen Orun. Hold the ring.", "Find out what the Academy kept under the lab."] },
    m_escape2: { t: "Out of Orun", main: true, ch: 5, steps: ["Get out through the drain, away from the hounds.", "Reach the signal fire at the north end of the canyon."] },
    m_reach: { t: "Haldar's Reach", main: true, ch: 5, steps: ["Follow the smugglers' wagon to the resistance."] },
    m_siege: { t: "Hold the Reach", main: true, ch: 5, steps: ["The legion will not wait. Stand with the Reach at dawn."] },
    m_heron: { t: "The Salt Heron", main: true, ch: 5, steps: ["Take the caravan to Brass Harbour. A ship called the Salt Heron waits at the berth."] },
    m_kharam: { t: "Seven Wells", main: true, ch: 6, steps: ["Walk the Kharam road to the Concord's oasis."] },
    m_contract: { t: "A Guild Contract", main: true, ch: 6, steps: ["Take a contract from one of the three guild masters of Kharam Oasis."] },
    m_vote: { t: "The Concord's Vote", main: true, ch: 6, steps: ["Bring Rhaz the proof from the Quarry of the Stone Giants, and the proof of one other guild (the Fen Shrine or the Sunbird Roost).", "Stand before the Concord in the guild hall."] },
    m_plan: { t: "The Rescue Plan", main: true, ch: 6, steps: ["Hadiya will lay out the plan at the well-stone in Kharam Oasis.", "Wait for Ranna's answer."] },
    needle: { t: "The Silent Needle", ch: 5, steps: ["Sefa Quill wants five Adder Fangs, from the Glass Adders of the Whisperglass Dunes, and the quill of an Archive Wraith, one of the clerks' ghosts in the Undervaults beneath Ashen Orun.", "Bring them to Sefa Quill in Haldar's Reach."] },
    lantern: { t: "The Last Lantern", ch: 5, steps: ["The lantern-builder needs kakal for the frame, the roof and the oil. Give what you can."] },
    hollowbell: { t: "A Bell in the Dry", ch: 6, steps: ["Old Hollowbell rings when the water is low. He walks the Kharam Road, west of Kharam Oasis, and the dry cisterns of Ashen Orun. You hear the bell before you see him."] },
    bounty1: { t: "Bounty: Mesa Rocs", ch: 6, steps: ["Rhaz wants the Kharam road cleared of five Mesa Rocs (0/5).", "Return to Rhaz."] },
    bounty2: { t: "Bounty: Automaton Cores", ch: 6, steps: ["Peya wants three Automaton Cores from the rusting builder machines on the Kharam Road.", "Bring them to Peya."] },
    bounty3: { t: "Bounty: Siren Eels", ch: 6, steps: ["Corvin wants the siren eels silenced (0/3). They sing in the open water beyond Brass Harbour.", "Return to Corvin."] },
    pilgrim: { t: "Water for the Pilgrims", ch: 6, steps: ["A pilgrim in Cinderwatch needs five Sunwater Flasks for the ash shrine on the slope."] },
    family: { t: "Everyone Has a Price", ch: 6, steps: ["A mother and two children were sold at Tzavan's market. They wait in cell twelve, at the east end of the cell row under the Hall. The cell stair is the guarded one on the east side of the arena.", "The family is free. Let the overseer's cell door stand open."] },
    ring1: { t: "The Net Fighter", ch: 6, steps: ["Casso, a retired net-fighter in Tzavan, wants to see what you can do against his old net.", "Bring Casso the news."] },
    ring2: { t: "Ghost in the Cell", ch: 6, steps: ["Meret swears a ghost sits in her old cell in the arena barracks, the first cell along the north wall from the foot of the guarded stair on the east side of the arena.", "Tell Meret the cell is quiet."] },
    ring3: { t: "Sand and Salt", ch: 6, steps: ["Brun needs three Salt Crystals to pack a wound the arena doctors will not touch.", "Bring Brun three Salt Crystals."] },
  });
  Object.assign(D.INNS, {
    haldars: { n: "The Last Lantern" }, brass: { n: "The Salt Heron Berth" }, kharam: { n: "The Seventh Stool" }, gullrest: { n: "The Wet Wick" },
    cinderwatch: { n: "The Ashen Hearth" }, mourns: { n: "The Candle House" }, tzavan: { n: "The Champion's Rest", mult: 1.5 },
  });
  Object.defineProperty(D.INNS.haldars, "mult", { get: () => (window.G && G.flags["base.hall.done"] ? 0.0001 : 0.5), enumerable: true, configurable: true });   // the resistance charges half; the repaired Lantern Hall is free for you
  const FULL = BAS.concat(CURES, ["tonic", "ember", "incense", "candle"], BOMBS);
  Object.assign(D.SHOPS, {
    reach: { n: "Haldar's Reach stores", who: "merchant", stock: BAS.concat(CURES, ["gear:G19"]), gearPrice: { G19: [340, 560, 460] }, disc: disc(BAS.concat(CURES), 0.9), buys: 1.0 },
    brass: { n: "Brass Harbour chandlery", who: "merchant", stock: FULL, buys: 1.0 },
    kharam: { n: "Kharam Oasis market", who: "merchant", stock: FULL, buys: 1.0 },
    kharamChurch: { n: "Flock shrine alms-table", who: "ilse", stock: BAS.concat(CURES, ["tonic", "ember"]), disc: disc(["antidote", "tonic", "ember"].concat(CURES), 0.8), buys: 1.0 },
    gullrest: { n: "Gullrest net-loft", who: "merchant", stock: BAS.concat(["rimeWard", "rimeFlask", "soakJar"]), buys: 1.0 },
    cinderwatch: { n: "Cinderwatch ash-stalls", who: "merchant", stock: BAS.concat(["cinderWard", "cinderBomb"]), buys: 1.0 },
    mournsGate: { n: "Mourn's Gate chandler", who: "merchant", stock: BAS.concat(["venomWard", "venomPot"]), buys: 1.0 },
    tzavan: { n: "Imperial bazaar", who: "merchant", stock: BAS.concat(CURES, ["tonic", "ember", "incense", "candle"], BOMBS, WARDS), disc: disc(BAS.concat(CURES, ["tonic", "ember", "incense", "candle"], BOMBS, WARDS), 1.2), buys: 0.8 },
    locker: { n: "Gladiator's Locker", who: "arenaClerk", stock: BOMBS.concat(WARDS, ["candle", "sandCape", "arenaPennant"]), buys: 1.0 },
    purser: { n: "Salt Heron purser", who: "purser", stock: BAS.concat(["ember"]), buys: 1.0 },
  });
  // ======================================================================================================================================
  // BANTER for chapter 5: nine packs x three lines per moment, in pack order (vanguard sprint venom tempest ironward breakers bastion wildfire dawn), each in the creature's own voice
  // ======================================================================================================================================
  M3.banter = (moment, rows) => D.PACKS.forEach((p, i) => { D.BANTER[p.id] = D.BANTER[p.id] || {}; D.BANTER[p.id][moment] = p.ids.map((id, k) => [id, rows[i][k]]); });
  M3.banter("voyageBack", [   // back across the Weeping Sea to Saltgate, with a mother's house behind us and the Master ahead
    ["Back to the sand! I missed the sand! I did not know that until right now!", "We come back changed, young bull. So does the sand, I expect.", "You are quiet, dear. A mother's house is a lot to carry. Sit by me."],
    ["Same sea. Different chain.", "Do not look so grim. You found a mother. Most of us only found a lock.", "Will the Master be glad? Will he ask what we saw? What will you say?"],
    ["Ha. Back to the desert. My moss will hate it.", "He has a reason to want you home. ...Ask what it is.", "That house had a lamp in the window. I keep thinking of the lamp, if that's all right."],
    ["Hah! Salt wind! I would say I missed it, but I would be lying. So, yes! I missed it!", "Are we there? Are we nearly there? How about now? Now?", "Water remembers. Mind what you tell the Master."],
    ["Hm. Home.", "Sure. Back to the one who sent us. Great.", "Who waits at the end of a road? The one who drew it."],
    ["Salt fish! The dockside ones are the best. Can we stop?", "I saw it first, I saw the lighthouse, I saw it!", "Between us? Brisk is humming. He only hums when he lies."],
    ["A gentle crossing. Thank you, captain.", "A road behind, a road ahead. Walk them both lightly.", "...The sea is calm. Calm before. ...Or after. I forget."],
    ["Don't tell Brisk about the scorch on the rail. Please.", "Hee. I want to see the Master's face when we walk in. He will say 'late again.' Hee.", "Is there bread in Orun? The Master always had bread."],
    ["We go back to the one who sent us. I trust him. I trust you more.", "I will glow at the bow. It is a long dark sea.", "...The tide turns. So do we."],
  ]);
  M3.banter("ashen", [   // the occupied city: Dominion banners on the lamp bridges, soldiers on every terrace
    ["That is our bridge! Those are not our banners! Who hung those?!", "The bridge remembers us, young bull. The banners are only cloth. Be calm.", "Look at the lamps, dear. Someone still lights them. Someone is being brave."],
    ["Soldiers on every terrace. I counted. I always count.", "Disgusting. They hung their rags on our beautiful bridges.", "Where have all the books gone? Who burned the market? Why the books?"],
    ["Ha. Home sweet home. With a garrison.", "The city is holding its breath. ...So is the tribune.", "It smells of smoke. I'm sorry. I know that is the wrong thing to say."],
    ["Hah! Look at them stand in rows. Someone should steal a helmet.", "Is that the Academy? Are we going in? Can we go in? Why is it so quiet?", "Keep close. Eyes low. This is their ground now."],
    ["Hm. Soldiers. As expected.", "Home, and it belongs to them. Of course. Why not.", "Whose city is it that is guarded by strangers?"],
    ["The sausage stall is gone. The sausage stall! They will pay for that.", "I see the lab roof, I see it! They painted the door!", "Did you know the tribune dyes his hair? Between us, I like him less for it."],
    ["Mind the glass underfoot, dear hero. Someone broke the lamps.", "Even an occupied street can be walked lightly. Remember who you are.", "...Slowly... I know this place. It has been unkind to it."],
    ["Oops, I want to set fire to every banner. Just the banners! Oops?", "Hee. They hung those flags too high. Tempting. Hee.", "The baker's shutters are nailed. No bread. Bad city."],
    ["They are afraid too, the soldiers. Look at their hands.", "The lamps are lit but dim. I could glow, if it helps.", "...The tide has gone out of this place."],
  ]);
  M3.banter("labgate", [   // a collared creature of the lab stands in the courtyard
    ["That is... one of ours! One of the pens! Why does it have THAT on its neck?!", "A collar. The old world's worst idea. Steady, young bull.", "Dear, do not look away. It knows you are here."],
    ["A chain. They put a chain on one of us. Again.", "I know that walk. I knew that walk for years. Release it. Now.", "Does it hurt? Is it hurting? Can it hear us?"],
    ["Grumble. They kept one back. Of course they kept one back.", "It sees us. ...It does not want to.", "Oh. Oh no. I-I'll go first, if that's all right. Please let me."],
    ["That is not a joke. That is not even a bad one.", "Can we help it? Can we? How? What do we do?", "Stay behind us. All of you. This one we do carefully."],
    ["Hm. Brother.", "Sure. Collars. They used them on us, too. Great.", "Who wears the chain when the owner is not watching?"],
    ["We shared a pen with that one. It stole my bread. I miss it.", "I knew it, I knew it, I knew it would be someone from the pens!", "Between us? It did not choose this. Be kind."],
    ["Oh, little one. They have made you carry this.", "A collar is a lantern lit by the wrong hand. We will put it out.", "...Wake me when it is over. ...No. I will stay awake for this one."],
    ["I did NOT do this. Oops? No. Not oops. I'm angry.", "Hee... no. No hee. Nothing funny about this one.", "It looks hungry. They do not feed the collared ones."],
    ["I knew you would still be in there. I knew.", "I will glow for you, even now. Hold on.", "...Free it. Gently."],
  ]);
  M3.banter("truth", [   // the data logs: every blow the hero wrote down went to the capital, and the Master signed for it
    ["The Master did WHAT? He gave us out like... like crates?!", "The lamp stays lit, young bull. But it throws a different shadow now.", "Oh, dear. Come here. Not a word. Come here."],
    ["Chains come in many sizes. He had the quiet kind.", "I knew that old fox was too polite. Nobody is that polite for free.", "Why would he? What did he get? What does 'as agreed' mean?"],
    ["Ha. I knew the tea was too good.", "He loved you. ...And he sold you. Both. Hold both.", "I'm so sorry. I'm so sorry. If that's all right, I'll stay close."],
    ["Nothing is funny. I will say that once, and mean it.", "Wait wait wait, he sent the records? Our fights? Every one? Why?!", "Pain runs deep here. Let it. We keep watch."],
    ["...Hm. A lie.", "Of course. The kind old man. Of course. Why not.", "Who writes down every blow? The one who wants to know where they land."],
    ["I do not want snacks. I do not want... that is how bad it is.", "I can't, I can't talk, I can't, I can't believe it.", "Between us... I suspected. I did not want to be right."],
    ["My child. We carried it with you, whatever it is.", "A hard road. Walk it lightly, and do not walk it alone.", "...Slowly. Let it sink. The sea is deep enough for this."],
    ["Don't give me matches. Not tonight. Not tonight.", "Hee... sorry. Reflex. No jokes. I mean it.", "He gave me bread once, too. Was it a trade?"],
    ["Be gentle with yourself. And with him, later. Not yet.", "I will glow for you tonight. All night, if you want.", "...The tide goes out. It comes back. Not the same."],
  ]);
  M3.banter("escape", [   // down the drain and up the canyon with the hounds behind
    ["RUN! Run! No, fight! No, run! I can do both!", "Down the drain, young ones. The stone falls behind us.", "Keep your breath even, dear. Count your steps."],
    ["Tunnels. Good. I know tunnels.", "Faster! You are a snail in a bucket, and I mean that kindly!", "Where does the drain lead? Is the water deep? Do hounds swim?"],
    ["Ha. Crawling through a drain. My finest hour.", "Left. The hounds are on the right.", "I'll go first. I'll... I'll go first. Please keep up."],
    ["Hah! They will never catch us in a drain! Probably!", "Run run run run run! Is it over? Is it over yet?", "Together. Nobody falls behind. Move."],
    ["Forward.", "Great. Running again. Ran my whole life, no medals.", "A door that closes behind you opens in front."],
    ["Can we run and eat? I had a biscuit. Never mind.", "I knew we would make it, I knew it, I knew it, now go!", "The tribune is furious. Between us, he tripped."],
    ["Quickly, but mind the glass. Mind the little ones.", "Steady feet. The road is dark but the road is there.", "...Slowly... and then, not slowly. Now."],
    ["Let me burn the back door behind us! Oops, I already did.", "Hee, hee! Smoke! They love a good smoke!", "Running makes me hungry. Always. Keep running."],
    ["Breathe. Light the road ahead. We are almost out.", "I'll glow at the back. They will follow me, and not you.", "...Go. The drain is only a river. We know rivers."],
  ]);
  M3.banter("reach", [   // Haldar's Reach: seven-coloured banners, forges, rope lifts, the unfinished tower
    ["Look at all the banners! Seven colours! I like the red one best!", "Strangers who feed strangers. That is rarer than gold, young bull.", "They are looking at us, dear. Smile. They are not afraid. They are hoping."],
    ["No chains. No soldiers. ...Feels odd. Good odd.", "Rope lifts. Forges. Almost tasteful. Almost.", "Who built it? How many live here? What is the tower for?"],
    ["Ha. A town made of rope and anger. I like it.", "They have lost more than they say. ...And they stay.", "It is warm here, if that's all right. The forges."],
    ["Hah! Rope lifts! Who is racing me to the top?!", "Can I ride the lift? Can I ride it twice? Can I ride it on the OUTSIDE?!", "A good place to defend. Remember that."],
    ["A fortress. Good.", "Refugees and rope. A long way from a bed.", "A tower with no light. Why build it to be lit?"],
    ["Hot soup! I smell hot soup! Did someone say soup?!", "Seven colours, seven banners, I counted, I counted!", "Did you know the one with the burnt arm is the commander? She looked at us last."],
    ["What a brave little city. Thank you for having us.", "A city of the walked-out. It will hold.", "...A place to rest. At last. ...Briefly."],
    ["Forges! They have forges! Don't tell Hadiya I am looking at them.", "Hee. Lanterns on poles. I want to see them all light up at once.", "Is that a kitchen? It smells like a kitchen. Good city."],
    ["They are tired, and they are kind. I knew they would be.", "So many small lights. I will not outshine them.", "...The tide has found a harbour."],
  ]);
  // ======================================================================================================================================
  // CHAPTER 5 BEATS. Start: the voyage back, the caravan from Saltgate (5.0)
  // ======================================================================================================================================
  S.begin[5] = async F => {   // called by chapter 4's last beat (STORY-M2) and by nothing else
    G.ch = 5; F.questDone("m_boat"); F.quest("m_truth", 0);
    await Cinema.voyage({ from: "Tamar's Landing", to: "Saltgate", text: "Back across the Weeping Sea." });
    await F.banter("voyageBack");
    await UI.say([["captain", "Back to the sand. Same price, same silence. You look different, friend. Older."], ["hero", "..."], ["captain", "Older is not an insult. It is a fare increase."]]);
    await Cinema.title("Chapter 5", "The Truth");
    F.set("ch5.start"); F.autoSave = true; F.save(true);
    F.go("saltgate", "from_sea");
  };
  S.trigger["ch5.saltgate"] = async F => { if (G.ch === 5 && !F.f("ch5.start")) { F.set("ch5.start"); F.quest("m_truth", 0); } };   // dbg.jump(5) lands here without begin[5]
  {
    const R = D.REGIONS.saltgate; if (R) { R.autos = (R.autos || []).concat("ch5.saltgate"); R.npcs = (R.npcs || []).concat([["caravanMaster", "Caravan master", s => s.f["ch5.start"] && !s.f["ch5.orun"]]]); }
  }
  T("saltgate").caravanMaster = async F => {
    if (F.f("ch5.orun")) { await UI.say([["caravanMaster", "The Master's road is open both ways. For you."]]); return; }
    await UI.say([["caravanMaster", "Green wax on a bronze ring. That is the sign I was told to look for."], ["hero", "..."], ["caravanMaster", "The Master's caravan. Dawn, if you hold the ring."]]);
    const i = await F.ask("Ride with the caravan at dawn?", [{ label: "At dawn" }, { label: "Not yet" }], { top: "40%" });
    if (i !== 0) { await UI.say([["caravanMaster", "The wagons do not wait long. Not long."]]); return; }
    await Cinema.voyage({ from: "Saltgate", to: "Ashen Orun", text: "Three days by caravan, along the roads Ithiel's couriers use." });
    F.go("ashenOrun", "from_dunes");
  };

  // ---------- Ashen Orun (5.A, 5.B) ----------
  M3.region("ashenOrun", { n: "Ashen Orun", arena: "occupied", music: "occupied", table: "occupied", fields: true, autos: ["orunArrive"],
    npcs: [["checkpointSoldier", "Checkpoint soldier"], ["sarn", "Tribune Sarn"], ["apprentice1", "A stamped clerk"], ["apprentice2", "A stamped clerk"], ["apprentice3", "A stamped clerk"], ["printer", "Printer"],
      ["wardenSign", "Notice board"], ["r1", "Stall in the ruined market"], ["r2", "Old woman by the cistern"], ["r3", "Burnt-out scribe"]],
    exits: [["dunes", "South gate to the dunes", () => true], ["orunMemoryRoom", "The study door", s => s.f["ch5.s4"]], ["undervaults", "The lab's vault stair", s => s.f["ch5.s4"]], ["labGateS4", "The lab gate", s => !s.f["ch5.s4"], "trigger"]],
    things: [["orunStash", "A burnt scholar's cache", () => true, "chest"]] });
  M3.rumours("ashenOrun", ["Old Hollowbell the tortoise rings his shell when the water is low. He was seen in the dry cisterns.", "Every apprentice's journal was copied. Every one. The copies went under the lab.",
    "The Master left on the night of the raid, by the front door. No one stopped him."], [M3.clue(4, 0), M3.clue(5, 0)]);
  M3.onRumour["ashenOrun:0"] = async F => { F.quest("hollowbell", 0); };
  Object.assign(T("ashenOrun"), {
    r1: M3.rum("ashenOrun", 0, "stallkeeper", { clues: 2 }), r2: M3.rum("ashenOrun", 1, "oldwoman", { clues: 2 }), r3: M3.rum("ashenOrun", 2, "scribe", { clues: 2 }),
    checkpointSoldier: async F => { await UI.say([["legionary", F.f("ch5.escape") ? "Ring or no ring, the lab is closed. Move along." : "The Master's mark. Pass, citizen. Mind the lamp bridges after the fourth bell."]]); },
    sarn: async F => {
      if (F.f("ch5.s4")) await UI.say([["sarn", "The study is yours. It will not help you."], ["sarn", "Everything below is entered in the ledger. I would not wander, apprentice. The ledger is patient. I am less so."]]);
      else await UI.say([["sarn", "The Academy serves the Throne now. The lab is closed. Walk where you like."], ["sarn", "It is a pity about the books. I did not burn them. Someone else counted them first."]]);
    },
    apprentice1: async F => { await UI.say([["apprentice", "I stamp the entries. They are the same entries we always made. Only the heading changed."]]); },
    apprentice2: async F => { await UI.say([["apprentice", "They kept my hands. They said I write the straightest column in the Academy. I wish I did not."]]); },
    apprentice3: async F => { await UI.say([["apprentice", "Do not speak to me where the tribune can see. ...Your journal was copied three times. I held the lamp."]]); },
    printer: async F => { await UI.say([["printer", "Seven pages a day, all regulations, all in the Throne's name. They use our old plates. The old plates print better than their own."], ["printer", "That is the only joke I am allowed."]]); },
    wardenSign: async F => { await UI.say([["narr", "ACADEMY OF ORUN, SUBJECT TO THE AUTHORITY OF THE THRONE. Citizens present their papers at the south gate. The lamp bridges close at the fourth bell. Lab district: CLOSED."], ["narr", "By order of Tribune M. Sarn. It is entered in the ledger."]]); },
  });
  S.chest.orunStash = async F => {
    if (F.f("c.orunStash")) return false; F.set("c.orunStash"); F.give("ember", 2); F.gold(250);
    await UI.say([["narr", "Under a fallen shelf, a scholar's cache wrapped in a scorched cloak: two Ashen Embers and a purse of kakal. A note in the purse: 'For whoever comes back.'"]]);
  };
  S.trigger.orunArrive = async F => {
    if (!M3.once(F, "ch5.orun")) return;
    G.lastTown = "ashenOrun"; F.music("occupied"); F.quest("m_truth", 1);
    await Cinema.stage(async c => {
      M3.actors(c, [["gate", "npcLegionGuard", 90, -14], ["tribune", "npcLegionGuard", 190, 24, { scale: 1.1 }]]);
      await c.say([["narr", "The caravan rolls under the south gate of Orun. Where the Academy's lamps used to hang, the sun calendar hangs now, on a banner as tall as a house."], ["legionary", "Pass."]]);
      await c.say([["narr", "You hold up the ring: green wax set in bronze."]]);
      c.emote("gate", "!"); await c.anim("gate", "bow");
      await c.say([["legionary", "...The Master's mark. Pass, citizen."], ["hero", "(A ring from a scholar, and soldiers salute it.)"]]);
      await c.pan(c.hero.x + 190, c.hero.y + 20, 800);
      await c.say([["sarn", "The Master's apprentice. The ledger expected you three weeks ago. The Academy serves the Throne now. Walk where you like. The lab is closed."], ["hero", "..."]]);
      c.follow();
    });
    await F.banter("ashen");
  };

  // S4 at the lab gate
  S.trigger.labGateS4 = async F => {
    if (F.f("ch5.s4")) return;
    const ok = await M3.general(F, 4, { level: 23, soldiers: [["legionShieldbearer", 22, " A"], ["legionShieldbearer", 22, " B"]], bg: "occupied", title: "Gift of the Academy", banter: "labgate",
      place: "the lab gate of Ashen Orun", where: "It ran south over the dunes, toward the old well road.", after: ["(The lab's own. They set it to guard the lab.)"],
      setup: async c => {
        const g = S.generalFor(4) || { id: "horncinder" };
        c.sprite("collarAltar", c.hero.x + 210, c.hero.y + 30);
        M3.actors(c, [["s1", "npcLegionGuard", 250, -70], ["s2", "npcLegionGuard", 250, 80], ["sarn", "npcSarn", 330, -10], ["gen", g.id, 205, 0]]);
        await c.pan(c.hero.x + 200, c.hero.y, 900);
        await c.say([["narr", "The lab quarter gate. By the dry fountain stands a collar altar of black stone, and soldiers at attention on either side of it. On the steps, a man in a plumed helm with ink on his fingers watches you come."], ["sarn", "A gift from the Academy to the Throne. It guards what we keep."]]);
        c.emote("gen", "anger"); c.sfx("encounter"); c.follow();
      } });
    if (!ok) return;
    F.set("ch5.s4");
    await UI.say([["sarn", "The study is yours. It will not help you."]]);
  };
  S.done.labGateS4 = F => F.f("ch5.s4"); S.done.orunArrive = F => F.f("ch5.orun");

  // ---------- the study and the memory room (5.C) ----------
  M3.region("orunMemoryRoom", { n: "The Academy's memory room", arena: "vault", music: "truth", autos: ["memoryFirst"],
    npcs: [["mentorLetter", "The unfinished letter"], ["fieldBooks", "The shelves"], ["cupOfTea", "A cup of tea"]], exits: [["ashenOrun", "Up the stair to the study", () => true]] });
  S.trigger.studyDoor = async F => {
    if (!M3.once(F, "ch5.studySeen")) return;
    await UI.say([["narr", "The study is cold. A cup of tea stands half drunk on the desk, a skin on it. The lamp is out. Behind the desk a trapdoor lies open, and a stair goes down into lamp-light."], ["hero", "(He left the lamp out. He never leaves the lamp out.)"]]);
  };
  S.done.studyDoor = F => F.f("ch5.studySeen");
  S.trigger.memoryFirst = async F => {
    if (!M3.once(F, "ch5.memory")) return;
    F.music("truth");
    await Cinema.panels([{ img: "assets/cinema/m3_memory_room.png", text: "Shelves to the ceiling. Every apprentice's journal, copied.", pan: "in" }], { music: "truth" });
  };
  S.done.memoryFirst = F => F.f("ch5.memory");
  M3.spot("orunMemoryRoom", "mentorLetter", async F => {
    await UI.say([["narr", "A folded letter lies beside the cup, the green wax broken. The ink has barely dried. Ithiel's hand, small and upright."]]);
    await UI.say([["mentor", "Child -"], ["mentor", "I told myself it would be only the maps. Then only the lab. Then only your records, because they were so very useful. A man can be sold in pieces and never notice the bill."],
      ["mentor", "If you are reading this, I have not had the courage to say it to your face, and you have found it without me. Before you judge, ask what I would have had to buy, and what it would have cost to refuse. And then judge, because you will, and you should -"]]);
    await UI.say([["narr", "The letter stops in the middle of the line."], ["hero", "(He wrote 'child'. He never called me that.)"]]);
    if (!F.f("ch5.study")) { F.set("ch5.study"); F.give("mentorLetter", 1); }
  });
  M3.spot("orunMemoryRoom", "fieldBooks", async F => { await UI.say([["narr", "Your own Field Journal, copied. Not only the last pages: every page, in a clerk's tidy hand, with a date and a receipt number. Beside it stand eight more spines, eight other apprentices, all the same."]]); });
  M3.spot("orunMemoryRoom", "cupOfTea", async F => { await UI.say([["narr", "Tea gone cold. One sugar and a bay leaf: Ithiel said it kept a clear head. The cup is turned to face the door."]]); });
  // ---------- the Undervaults (5.D): five data logs, the courier, Kessa, the warden S5 ----------
  M3.region("undervaults", { n: "The Undervaults", arena: "vault", music: "vault", table: "vault", fields: true, autos: ["undervaultsEnter"],
    npcs: [["dataLog1", "An archive cabinet"], ["dataLog2", "A second cabinet"], ["dataLog3", "A third cabinet"], ["dataLog4", "A cabinet with a folded note"], ["dataLog5", "The cabinet at the heart of the great archive", s => s.f["ch5.s5"]], ["courierDesk", "A copyist at his desk", s => s.f["ch5.s5"]]],
    exits: [["ashenOrun", "Up the stair to Orun", () => true], ["coldVaults", "The side door to the Cold Vaults", () => true], ["ashenCanyon", "The drain", s => (s.f["ch5.logs"] || 0) >= 5 && !s.f["ch5.escape"]],
      ["s5Fight", "The great archive door", s => !s.f["ch5.s5"], "trigger"], ["kessaScene", "The west reading room", s => !s.f["ch5.kessa"], "trigger"]],
    things: [["g26_stonegazeOrder", "The warden's chest", s => s.f["ch5.s5"], "chest"]] });
  S.trigger.undervaultsEnter = async F => { if (!F.f("ch5.escape")) G.lastTown = "ashenOrun"; };
  const LOGS = [
    { intro: "A grey drawer of weekly receipts, each stamped and numbered. The top sheet reads:", text: "Weekly receipt, 41st week: field-team battle records. Received complete, as agreed. Forwarded to the Office of Titan Affairs.",
      react: [["hero", "(My weekly pages. The courier took them every week. I thought they went to the Master's desk.)"]] },
    { intro: "A chart drawer, rolled sheets in brass tubes. One tube is marked with a Company seal:", text: "Titan sites charted by the Academy field teams: the Dune Bearer, confirmed; the Plumed Coil, confirmed; the Maelstrom, in outline. Source: the apprentice team of Master Ithiel. Value: considerable.",
      react: [["hero", "(The Dune Bearer. The Plumed Coil. I walked in and wrote down where they sleep.)"]] },
    { intro: "A black-edged file, the paper much newer than the cabinet. It is dated nineteen years after a signature you know:", text: "Raid on Orun: the day of the apprentice's pack choice. Pens 1 to 9 to be taken. The apprentice to be left in the vault, unseen, with one pack. Instruction of the Master: do not harm the boy; do not let him be seen.",
      react: [["hero", "..."], ["narr", "You read it twice. The date is the day Dunmar said 'Today you choose.'"]] },
    { intro: "A single sheet, folded small. The hand is small and upright. You have read it in the margins of every book you ever owned:", text: "(Ithiel's hand, a covering note) The records you want are in the satchel. He does not know what he carries. Continue to treat him as a student. - I.",
      react: [["hero", "(Everything I saw and fought goes into it, he said. Everything.)"], ["narr", "The satchel is on your shoulder. The feather stitch on its strap has gone grey with age."]] },
    { intro: "The last drawer, in the heart of the great archive. One line, in a clerk's round hand, under a seal you saw once on the Company charter:", text: "Consideration: as agreed. The Founder's word has been kept for nineteen years.",
      react: [["narr", "You sit down on the floor between the cabinets. The copy-tubes hum over your head."], ["hero", "(Every blow I wrote down. He asked me to write down every blow.)"]] },
  ];
  const readLog = n => async F => {
    const L = LOGS[n - 1], first = !F.f("log." + n); let count = G.flags["ch5.logs"] || 0;
    F.sfx("menuOk");
    await UI.say([["narr", L.intro], ["narr", L.text]]);
    if (first) { F.set("log." + n); F.give("dataLog" + n, 1, true); count++; F.set("ch5.logs", count); UI.toast(`Data log ${count} of 5 copied into the Journal.`, 2600); }
    await UI.say(L.react);
    if (first && count >= 5) await M3.escape(F);
  };
  for (let n = 1; n <= 5; n++) M3.spot("undervaults", "dataLog" + n, readLog(n));
  M3.spot("undervaults", ["courierDesk", "courier"], async F => {
    if (!F.f("ch5.courierSeen")) {
      F.set("ch5.courierSeen");
      await UI.say([["narr", "A man in a grey hood sits at a long desk, copying reports from one stack to another with a steady, tired hand. You know the hood. You know the hand that reached for your pages every week."],
        ["courier", "I only copy. I did not read. I have a daughter."], ["hero", "..."], ["narr", "You leave him at his desk. He does not look up."]]);
    } else await UI.say([["courier", "I only copy."]]);
  });
  S.trigger.kessaScene = async F => {
    if (!M3.once(F, "ch5.kessa")) return;
    F.music("tension");
    await Cinema.stage(async c => {
      M3.actors(c, [["kessa", "npcKessa", 180, -10], ["dorrin", "npcDorrin", 215, 34], ["mayle", "npcMayle", 215, -42], ["emberwick", "emberwick", 150, 24]]);
      await c.pan(c.hero.x + 170, c.hero.y, 800);
      await c.say([["narr", "The west reading room: long tables, green lamps, and three people who should not be here. The tribune has posted Kessa's team over the Undervaults while the audit runs."],
        ["kessa", "You. Of course. Sarn said an apprentice might come sniffing. I was told to stand here and be unpleasant."], ["dorrin", "Boss says unpleasant. So, unpleasant. Also, hello."]]);
      c.emote("mayle", "?");
      await c.say([["mayle", "Boss. I have the lots list. The Company's lots, by village. I wanted to check one thing."], ["kessa", "Mayle, not now."], ["mayle", "Page forty-one. Kessa. Ashwater."]]);
      c.emote("kessa", "!");
      await c.say([["kessa", "Tell me it is a different Ashwater."], ["mayle", "It is not. 'Cleared, year eleven.'"]]);
      await c.anim("kessa", "bow", { dir: "left" }); c.sfx("menuMove");
      await c.say([["kessa", "They told me everyone died of the fever."], ["narr", "She sits down on a bench, very straight, as if someone had told her to."], ["hero", "I am sorry."], ["kessa", "Not yet. Later."]]);
      await c.wait(500);
      await c.say([["kessa", "The tribune comes down the east stair. Go left. We never saw you."]]);
      await c.say([["kessa", "Emberwick. Come."]]);
      await c.walk("emberwick", c.hero.x + 330, c.hero.y + 40, 1200); c.remove("emberwick"); c.follow();
    });
    F.music("vault");
  };
  S.done.kessaScene = F => F.f("ch5.kessa");
  S.trigger.s5Fight = async F => {
    if (F.f("ch5.s5")) return;
    const ok = await M3.general(F, 5, { level: 25, bg: "vault", title: "Warden of the Great Archive", place: "the great archive door in the Undervaults", where: "It went up the stair, one slow step at a time, and did not look back.",
      after: ["(Chained to the door that keeps my own journal copies. Of course.)"],
      setup: async c => {
        const g = S.generalFor(5) || { id: "horncinder" };
        M3.actors(c, [["gen", g.id, 230, 0]]);
        await c.pan(c.hero.x + 180, c.hero.y, 900);
        await c.say([["narr", "The great archive door: star-metal, black and gold, taller than three men, lit from within by one line of light. Before it, chained by the neck to a ring in the floor, a creature of the pens stands guard over a door it cannot open."], ["narr", "Nobody watches the warden. The collar does that."]]);
        c.sfx("encounter"); c.follow();
      } });
    if (!ok) return;
    F.set("ch5.s5");
    await S.m2.gate([["narr", "The collar goes dark. Behind the warden, the great door sighs open on a long room of cabinets, and the hum of the copy-tubes grows loud. At the foot of the door, a chest."]], { dx: 230, dy: -10, fx: "dust", fx2: "sparkle", shake: 3 });
  };
  S.done.s5Fight = F => F.f("ch5.s5");
  S.chest.g26_stonegazeOrder = async F => { if (!F.f("ch5.s5")) { await UI.say([["narr", "The chest is chained to the great door. Something guards it."]]); return false; } return S.gearChest2(F, "g26_stonegazeOrder", "G26"); };

  // ---------- the Cold Vaults (optional): rimecrystal, G28 ----------
  M3.region("coldVaults", { n: "The Cold Vaults", arena: "coldVault", music: "vault", table: "coldVault", fields: true,
    npcs: [["coldDoorLate", "A door furred with frost"]], exits: [["undervaults", "Back to the Undervaults", () => true]],
    things: [["g28_shattererChisel", "A frosted chest", () => true, "chest"], ["rimecrystal1", "Ice crystals", s => !s.f["g.cold1"], "gather"], ["rimecrystal2", "More ice crystals", s => !s.f["g.cold2"], "gather"], ["rimecrystal3", "A cluster of ice crystals", s => !s.f["g.cold3"], "gather"]] });
  [1, 2, 3].forEach(n => { S.gather["rimecrystal" + n] = async F => {
    if (F.f("g.cold" + n)) return false; F.set("g.cold" + n); F.give("rimecrystal", 4); F.sfx("coin");
    await UI.say([["narr", ["Ice grown out of the black stone like fingers. It does not melt in your hand. Four rimecrystals go into the satchel.", "A cluster the colour of a winter sky. You chip four rimecrystals free. The cold climbs your wrist and stops there.", "The last cluster, thick as a tree trunk. Four more rimecrystals, and a feeling of being watched by something very patient."][n - 1]]]);
    if (F.matCount("rimecrystal") >= 10 && !F.f("book.cold")) { F.set("book.cold"); UI.toast("New in the Skill Book: Cold Snap."); }
  }; });
  S.chest.g28_shattererChisel = async F => S.gearChest2(F, "g28_shattererChisel", "G28");
  M3.spot("coldVaults", "coldDoorLate", async F => {
    await UI.say([["narr", F.f("ch10.done") ? "The frost has gone from the black glass door. It is not open. It is simply no longer cold, like a held breath let out." : "A door of black glass, furred with frost. The cold that comes off it is not the vault's cold. Something behind it is older than the cooling chambers, and it has not been warm for a very long time."]]);
  }, "t");

  // ---------- the escape (5.E): the bell, the collapsing vault, the drain, the canyon run ----------
  M3.escape = async F => {
    if (!M3.once(F, "ch5.esc")) return;
    F.music("tension"); F.quest("m_escape2", 0);
    await Cinema.stage(async c => {
      const h = c.hero; c.tint("#301810", 0.28, 500); c.sfx("encounter");
      await c.say([["narr", "A bell. Not the Academy's: a flat iron note, struck again and again. All along the walls the brass copy-tubes stop humming."], ["sarn", "Seal every door. The apprentice carries the Academy's honour."]]);
      c.shake(5, 700); c.sfx("hitHeavy"); c.fx("dust", h.x - 40, h.y); await c.wait(300);
      await c.say([["narr", "Somewhere above, doors slam one after another, and the frost on the cabinets cracks and shatters."]]);
      await F.banter("escape");
      await c.walkHero(h.x - 160, h.y + 20, 900); c.shake(3, 500); c.fx("dust", h.x - 160, h.y + 20);
      await c.walkHero(h.x - 320, h.y - 10, 900); c.shake(6, 600); c.fx("dust", h.x - 300, h.y);
      await c.say([["narr", "At the end of the passage the floor gives way into a builder's drain, a channel as wide as a road, and the water pulls you in."]]);
      await c.fade(true, 500);
    });
    G.lastTown = "ashenCanyon";
    F.go("ashenCanyon", "from_undervaults");
  };
  S.trigger.escapeStart = async F => { if ((G.flags["ch5.logs"] || 0) >= 5 && !F.f("ch5.escape")) await M3.escape(F); };
  S.done.escapeStart = F => F.f("ch5.escape");

  // ---------- Ashen Canyon: the chase, the signal fire ----------
  M3.region("ashenCanyon", { n: "Ashen Canyon", arena: "quarry", music: "tension", table: "canyon", fields: true, autos: ["canyonRun"],
    npcs: [], exits: [["undervaults", "Back through the drain", s => !s.f["ch5.escape"]], ["haldarsReach", "North, past the signal fire", s => s.f["ch5.escape"]], ["canyonFire", "The signal fire at the north end", s => !s.f["ch5.escape"], "trigger"]],
    things: [["canyonCache", "A smugglers' cache under a cairn", () => true, "chest"]] });
  S.trigger.canyonRun = async F => {
    if (F.f("ch5.escape") || !M3.once(F, "ch5.canyon")) return;
    F.music("tension");
    await Cinema.stage(async c => {
      const h = c.hero; c.actor("hound1", { art: "houndOfTheCohort", x: h.x + 60, y: h.y - 190 }); c.actor("hound2", { art: "houndOfTheCohort", x: h.x + 130, y: h.y - 200 });
      await c.say([["narr", "The drain spits you out in a dry canyon of red-grey stone, coughing, with ash on the wind. On the rim above, plated hounds trot along the cliff edge, and a horn calls from the south."], ["narr", "Far to the north, at the end of the canyon, a small fire burns. Someone has set it where only a runner would look."]]);
      c.emote("hound1", "!"); c.sfx("encounter"); await c.pan(h.x, h.y - 180, 700); c.follow();
    });
  };
  S.done.canyonRun = F => F.f("ch5.canyon");
  S.chest.canyonCache = async F => { if (F.f("c.canyonCache")) return false; F.set("c.canyonCache"); F.give("sunwater", 4); F.gold(120); await UI.say([["narr", "A smugglers' cache under a cairn: four Sunwater Flasks and a few coins, wrapped in a rag stamped with a rope-lift."]]); };
  S.trigger.canyonFire = async F => {
    if (F.f("ch5.escape")) return;
    F.music("hope");
    await Cinema.stage(async c => {
      M3.actors(c, [["odan", "npcOdan", 90, -14], ["dunmar", "npcDunmar", 140, 26], ["wagon", "menagerieWagon", 200, 6, { scale: 1.0 }]]);
      await c.say([["narr", "The signal fire burns in a ring of stones. Beside it stands a man in a worn grey surplice, and beside him, with a lantern and a scowl, Old Dunmar, and behind them a covered wagon painted with faded stars."]]);
      c.emote("dunmar", "!");
      await c.say([["dunmar", "Lad! Do not ask. Get in the wagon."], ["hero", "Dunmar. How did you..."], ["dunmar", "I said, do not ask."], ["odan", "Quiet now. The hounds can hear a heartbeat in this canyon. Heaven can wait until we are behind a wall."]]);
      await c.fade(true, 500);
    });
    F.set("ch5.escape"); F.questDone("m_escape2"); F.quest("m_reach", 0);
    F.go("haldarsReach", "from_ashenCanyon");
  };
  S.done.canyonFire = F => F.f("ch5.escape");
  // ---------- Haldar's Reach (5.F): arrival, the resistance, Dunmar's wagon, Kessa's team ----------
  M3.region("haldarsReach", { n: "Haldar's Reach", arena: "occupied", music: "resistance", town: "haldarsReach", inn: "haldars", autos: ["reachArrive"],
    npcs: [["innkeeper", "The Last Lantern"], ["merchant", "Reach stores"], ["saffa", "Commander Saffa Qarim"], ["hadiya", "Hadiya Wells"], ["odan", "Brother Odan"], ["oldDunmar", "Old Dunmar's wagon"], ["sefa", "Sefa Quill"],
      ["lanternBuilder", "The lantern-builder"], ["careCart", "The care cart"], ["refugee1", "A refugee"], ["refugee2", "A refugee"], ["refugee3", "A refugee"], ["kessa", "Kessa Vorn", s => s.f["ch5.kessa"]],
      ["dorrin", "Dorrin Hale", s => s.f["ch5.kessa"]], ["mayle", "Mayle Tarn", s => s.f["ch5.kessa"]], ["r1", "A refugee on the stair"], ["r2", "An old woman at the forge"], ["r3", "A boy with a bucket"]],
    exits: [["ashenCanyon", "South into the canyon", () => true], ["brassHarbour", "The east road to Brass Harbour", s => s.f["ch5.s6"]], ["siegeS6", "The gate", s => s.f["ch5.reach"] && !s.f["ch5.s6"], "trigger"]], things: [] });
  M3.rumours("haldarsReach", ["Every fight your team ever had at the academy went into a ledger. The ledger went to the capital.", "The Concord of Seven Wells meets at Kharam Oasis. They say the guilds finally agree on something.",
    "A sea-cave in the Straits freezes solid in winter, and something sleeps inside. Frost opens the lock."], [M3.clue(6, 0)],
    ["The Wolf of the Cinder Crown is not hunting. It is running. Water stops a runner.", "The ferryman at Mourn's Gate sells passage for a story. He keeps the ones he likes.", "Old Hollowbell? Walks the Kharam road. Rings when the wells run low. Hit him twice, hard, and he forgets how to ring."]);
  const marketOpen = F => F.f("base.market.done");
  Object.assign(T("haldarsReach"), {
    r1: M3.rum("haldarsReach", 0, "refugee", { clues: 1, unlock: marketOpen }), r2: M3.rum("haldarsReach", 1, "oldwoman", { clues: 1, unlock: marketOpen }), r3: M3.rum("haldarsReach", 2, "boy", { clues: 1, unlock: marketOpen }),
    innkeeper: async F => {
      await UI.say([["innkeeper", F.f("base.hall.done") ? "The Last Lantern. The roof holds now, and the bed is the Reach's gift to you." : "The Last Lantern. Hot water, a straw bed, a roof that mostly holds. Half price. We know who pays for the war."]]);
      const slept = await F.inn("haldars");
      if (slept && F.f("ch5.reach") && !F.f("ch5.s6")) await M3.siege(F);
    },
    merchant: async F => { await UI.say([["merchant", "Stores at cost, friend. Bandages, rope and tea. And a standard or two, if you want to be seen coming."]]); await F.shop("reach"); },
    saffa: async F => {
      if (!F.f("ch5.s6")) await UI.say([["saffa", "Rest. The legion needs a night to find a way up the canyon. Be at the gate at dawn."]]);
      else if (!F.f("ch6.start")) await UI.say([["saffa", "Brass Harbour. The caravan leaves when you do."]]);
      else await UI.say([["saffa", "Show me what you have done since. ...Hm. Good. Go and do the next thing."]]);
    },
    hadiya: async F => {
      if (!F.f("ch5.s6")) await UI.say([["hadiya", "Eat. Then sleep. Everything costs, and tomorrow costs the most."]]);
      else await UI.say([["hadiya", "The harbour has the ship. The Concord has the votes. Neither comes cheap. Choose what you pay with."]]);
    },
    odan: async F => {
      if (F.f("ch5.odan")) { await UI.say([["odan", "Heaven is patient. I am slower. Come back when the chair is lighter."]]); return; }
      await UI.say([["odan", "Say it. Heaven is patient. I am slower."]]);
      const i = await F.ask("", [{ label: "\"I was his spy.\"" }, { label: "Say nothing" }], { top: "40%" });
      if (i === 0) { F.set("ch5.odan"); await UI.say([["hero", "I was his spy."], ["odan", "You were his student. A spy knows what he sends. ...Sit with that. It is a heavier chair, and a truer one."]]); }
      else await UI.say([["odan", "Then say nothing. It counts. I was listening."]]);
    },
    kessa: async F => { await UI.say([["kessa", F.f("ch6.start") ? "I work the rope lift. Don't thank me, I'm paying a debt. Emberwick won't stop humming. It does that when it is scared." : "Don't look at me like that. I did not know. ...Carry crates, they said. So I carry crates."]]); },
    dorrin: async F => { await UI.say([["dorrin", "They feed us at the Reach. Real soup. Real! I wept a little. Boss says I didn't. So, I didn't."]]); },
    mayle: async F => { await UI.say([["mayle", "Page forty-one. I read it three times. It still says Ashwater. I am keeping the book. Somebody should."]]); },
    refugee1: async F => { await UI.say([["refugee", "I came from Orun with a shelf of books on my back. I lost the shelf at the second wall. I kept the books."]]); },
    refugee2: async F => { await UI.say([["refugee", "The lanterns on the poles are not for light. They are so that those in the dark know the Reach is still here."]]); },
    refugee3: async F => { await UI.say([["refugee", marketOpen(F) ? "A real market, with dyes! My daughter has not seen a colour in two years." : "They say the tower will be lit one day. I am not a fool. But I look up every night."]]); },
    careCart: async F => { await M3.careCart(F); },
  });
  S.trigger.reachArrive = async F => {
    if (!F.f("ch5.escape") || !M3.once(F, "ch5.reach")) return;
    G.lastTown = "haldarsReach"; F.set("ch5.n0", G.nights); F.music("resistance");
    await Cinema.stage(async c => {
      M3.actors(c, [["saffa", "npcSaffa", 130, -16], ["hadiya", "npcHadiya", 175, 24], ["dunmar", "npcDunmar", 70, 30]]);
      await c.say([["narr", "The wagon climbs out of the dark into a deep canyon hung with banners, seven colours on seven poles, snapping in the wind. Forges glow in the rock. Refugee quarters climb the walls in tiers, joined by rope lifts, and everywhere faces turn up to watch the wagon pass."],
        ["narr", "At the head of the canyon, a great tower of lantern-frames stands unfinished against the sky."]]);
      await c.pan(c.hero.x + 150, c.hero.y, 700);
      await c.say([["saffa", "Show me."], ["narr", "You hand over the Field Journal. A woman with a burn-scarred forearm reads three pages in silence, and turns one back."],
        ["saffa", "Your master has a good spy in you. Do you know it?"], ["hero", "I do now."],
        ["saffa", "We do not hold a man to account for a book he was told to write. We hold him to account for the next one."], ["hadiya", "Everything costs. Start by sitting down and eating."]]);
      c.emote("dunmar", "sweat");
      await c.say([["dunmar", "I carried his coffee thirty years and never asked why the crates went east. That is on me, lad."], ["hero", "It is on both of us."]]);
      if (F.f("ch5.kessa")) {
        M3.actors(c, [["kessa", "npcKessa", 230, 60], ["dorrin", "npcDorrin", 262, 80], ["mayle", "npcMayle", 262, 40], ["emberwick", "emberwick", 214, 72]]);
        await c.pan(c.hero.x + 230, c.hero.y + 60, 700);
        await c.say([["narr", "Against the far wall, three people who should not be here: a girl in a red scarf, a big young man holding a bowl of soup in both hands, a thin one with a notebook. A small lion with a flame for a mane sits on the girl's feet."],
          ["kessa", "I will say sorry once and badly. Ready? ...Sorry. Moving on."], ["saffa", "Corps ends at the gate. Crates begin at the lift. All three of you."], ["dorrin", "Boss says yes. So, yes."], ["mayle", "I have started a new page. The heading is 'Debts'."]]);
      }
      c.follow();
    });
    F.questDone("m_truth"); F.questDone("m_escape2"); F.questDone("m_reach"); F.quest("m_siege", 0);
    await F.banter("reach");
    await UI.say([["saffa", "There is a bed at the Last Lantern. Use it. The legion will not come in the dark."]]);
  };
  S.done.reachArrive = F => F.f("ch5.reach");
  // Sefa Quill: the Silent Needle (G27)
  T("haldarsReach").sefa = async F => {
    const st = F.qstep("needle");
    if (st === "done") { await UI.say([["sefa", "Wear it well. And never tell me what for."]]); return; }
    if (st === undefined) {
      await UI.say([["sefa", "You have the look of a man who owes the Company a letter. I owe the Concord nothing, which is rarer. Sefa Quill. Forty years I made medicines for the Concord, and a few other things for a few other people."],
        ["sefa", "I am making the last needle I shall ever make. It wants five fangs of a glass adder and the quill of an archive wraith. The wraith's, mind. The ink must be dead. They drift in the Undervaults, under your old Academy. The adders sleep in the Whisperglass Dunes."], ["sefa", "Bring them, and the kit is yours. I have no use for it. I have used it."]]);
      F.quest("needle", 0); return;
    }
    const fangs = G.goods.adderFang || 0, quill = G.goods.wraithQuill || 0;
    if (fangs >= 5 && quill >= 1) {
      G.goods.adderFang -= 5; G.goods.wraithQuill -= 1; F.questDone("needle"); F.giveGear("G27", 3); F.gold(2 * m(5)); F.sfx("coin");
      await UI.say([["sefa", "Five fangs, clean. And a quill that has stopped writing. ...Good. A needle does one thing, and does it to the right person. Take the kit."]]);
    } else await UI.say([["sefa", `Fangs: ${Math.min(5, fangs)} of 5. Quill: ${quill ? 1 : 0} of 1. The adders keep to the Whisperglass Dunes; the clerks' ghosts keep to the Undervaults, under the lab in Ashen Orun. Both are patient. So am I.`]]);
  };

  // ---------- Dunmar's wagon: lab creatures are freed with the dungeon keys (K1-K5 here; chapters 7-10 free K6-K9 where the wagon stands then) ----------
  const EXTRAS = {
    keyK1: ["bramblehoof", "k1", "A cage of bark and moss swings open. An elk-bull the colour of old wood steps down, and the moss on its antlers is blooming.", "Bark remembers. You opened the door, small iron one.", "...I will walk with you, when you need a horn.", "Bramblehoof, a forest guardian. The wild clans lost him to the lab."],
    keyK2: ["quillshade", "k2", "A cage of woven reed. Inside, a squirrel in a tiny scholar's collar clutches a letter it will not put down. It steps out and looks everywhere except at you.", "Between us? The cook at the palace sleeps through the second bell.", "I carried that letter. I did not read it. I remember it very well.", "Quillshade, the Academy's messenger. Keep your secrets close, lad. It will find them anyway."],
    keyK3: ["mirequeen", "k3", "A cage of reed and rot swings open, and a hydra of green-black scale steps down, five heads swaying, none of them looking at the same thing.", "We have been dead twice and found it overrated.", "I am Mirequeen. We are tired of fire. ...I will walk with you, when you need a poison.", "Mirequeen. Do not tell her the heads are rude, lad. They know."],
    keyK4: ["brassbone", "k4", "A cage of riveted brass opens by itself, with a click like a question. A figure of brass plates and old white stone, taller than Dunmar, steps down and stands very straight.", "Record: this door once opened to a song.", "Record: I was made to carry. I carry. That is not unhappiness.", "Brassbone is not a creature the way you are, lad. Be patient with it."],
    keyK5: ["selkira", "k5", "A cage of driftwood and salt-rope. A seal-woman of ember and gold, a lotus on her back, steps out and turns her face to the south, towards the sea.", "My pod sang here. ...I am listening.", "You are warm. The sea is not, where they are.", "Selkira will want the sea, lad. Take her to it sometimes."],
  };
  M3.freeExtra = async (F, keyId) => {
    const [cid, flag, desc, l1, l2, dun] = EXTRAS[keyId]; F.take(keyId, 1); F.set(flag + ".freed");
    const u = F.mk(cid, Math.max(3, F.avgLevel() - 1)); G.collection.push(u); G.best[cid] = G.best[cid] || { seen: 1, beaten: 0 };
    const fx = { bramblehoof: "leaves", quillshade: "feathers", mirequeen: "leaves", brassbone: "dust", selkira: "splash" }[cid];
    await Cinema.stage(async c => {
      await c.cageOut("ex", cid, { fx, before: [["dunmar", "Right, hold the lantern. Let me see to this lock."]], desc: [["narr", desc]], scale: cid === "brassbone" ? 1.1 : undefined });
      await c.say([[cid, l1], [cid, l2], ["dunmar", dun]]);
      await c.cageBack("ex");
    });
  };
  M3.wagon = async F => {
    const held = Object.keys(EXTRAS).filter(k => F.item(k) > 0);
    if (held.length) { for (const k of held) await M3.freeExtra(F, k); return true; }
    const n = ["k3.freed", "k4.freed", "k5.freed"].filter(k => F.f(k)).length;
    await UI.say([["dunmar", n === 0 ? "Any keys yet, lad? No? Sit. Eat. The cages are patient. It is the keepers who are not." : n < 3 ? "More keys will turn up. They always do, in the worst places." : "Every cage I can open is open. For now. Keep walking, lad."]]);
    return false;
  };
  T("haldarsReach").oldDunmar = async F => { await M3.wagon(F); };
  T("haldarsReach").dunmar = T("haldarsReach").oldDunmar;

  // ---------- The Last Lantern: the resistance's base projects (ECONOMY 6.2) and the archive room ----------
  M3.projects = [
    { id: "hall", n: "Lantern Hall repair", ch: 5, cost: 1600, d: "The inn is free for you. The wagon gets a roof.", done: "The beams go up before nightfall. The inn of the Reach is yours to sleep in for free, and the wagon has a roof at last." },
    { id: "market", n: "Refugee Market", ch: 6, cost: 3000, d: "New stalls: dyes, banners, treats. The refugees tell more rumours.", done: "By morning there are awnings in six colours, a dye-vat and a woman selling honey cakes. People stop to talk." },
    { id: "archive", n: "Archive Room", ch: 6, cost: 3500, d: "Replay the lore tablets and read what you have found so far.", done: "A dry room with a lamp and a long table opens off the canyon wall. The tablets you have found are hung on its walls." },
  ];
  M3.LORE = [   // [flag, title, text]: what the Archive Room shows once it is built
    ["log.1", "Data log: Weekly receipt", D.ITEMS.dataLog1.d], ["log.2", "Data log: Sites charted", D.ITEMS.dataLog2.d], ["log.3", "Data log: The day of the raid", D.ITEMS.dataLog3.d],
    ["log.4", "Data log: A covering note", D.ITEMS.dataLog4.d], ["log.5", "Data log: Consideration", D.ITEMS.dataLog5.d], ["ch5.study", "The unfinished letter", D.ITEMS.mentorLetter.d],
    ["lore.bearer", "The Dune Bearer's stone", D.LORE.bearerBreak],
  ];
  M3.archive = async F => {
    const found = M3.LORE.filter(([f]) => F.f(f));
    await UI.window("The Archive Room", body => { body.innerHTML = found.length ? found.map(([, t, x]) => `<div class="row"><div class="g">${UI.esc(t)}<small>${UI.esc(x)}</small></div></div>`).join("") : `<div class="row"><div class="g">The walls are bare so far.</div></div>`; }, { closeLabel: "Close (Esc)" });
  };
  T("haldarsReach").lanternBuilder = async F => {
    F.quest("lantern", 0);
    if (M3.once(F, "base.met")) await UI.say([["lanternBuilder", "The Last Lantern. They say one this size lit the whole canyon once, in the days of the builders. We have the frame, the will and no oil. And no roof, and no market, and no shelves for the tablets."], ["lanternBuilder", "Give what you can. Every kakal goes into the tower or the town. Hadiya counts it. She counts everything."]]);
    for (;;) {
      const open = M3.projects.filter(p => G.ch >= p.ch), have = p => G.flags["base." + p.id] || 0, isDone = p => !!G.flags["base." + p.id + ".done"];
      const opts = open.map(p => ({ label: isDone(p) ? `${p.n}: finished` : `${p.n}: ${have(p)} of ${p.cost} kakal`, info: p.d, disabled: isDone(p) && p.id !== "archive" })).concat(F.f("base.archive.done") ? [{ label: "Read the archive" }] : [], [{ label: "Not now" }]);
      const i = await F.ask(`The Last Lantern (${G.gold} kakal)`, opts, { back: true });
      if (i < 0 || i === opts.length - 1) return;
      if (i >= open.length) { await M3.archive(F); continue; }
      const p = open[i]; if (isDone(p)) { await M3.archive(F); continue; }
      const left = p.cost - have(p), amounts = [100, 500, 1000, left].filter((a, k, arr) => a > 0 && a <= left && arr.indexOf(a) === k);
      const j = await F.ask(`${p.n}: ${have(p)} of ${p.cost}`, amounts.map(a => ({ label: a === left ? `Give the rest (${a} kakal)` : `Give ${a} kakal`, disabled: G.gold < a })).concat([{ label: "Back" }]), { back: true });
      if (j < 0 || j >= amounts.length) continue;
      G.gold -= amounts[j]; G.flags["base." + p.id] = have(p) + amounts[j]; F.sfx("coin");
      if (G.flags["base." + p.id] >= p.cost) { G.flags["base." + p.id + ".done"] = true; if (open.every(isDone)) F.questDone("lantern"); await UI.say([["narr", p.done]]); }
      else await UI.say([["lanternBuilder", "Noted. Every kakal into the frame."]]);
    }
  };

  // ---------- the care cart (ECONOMY 6.1): one favourite treat per creature; the right one earns a word ----------
  const TREATS = [["meat", "Dried meat strips"], ["fish", "Smoked fish"], ["apples", "Warm baked apples"], ["bread", "Seed bread"], ["dates", "Honeyed dates"], ["cake", "Berry cake"]];
  const FAV = { horncinder: "meat", shellmund: "dates", kitsuneva: "apples", skarnwolf: "meat", vespera: "cake", glimmerkoi: "dates", mossmaw: "apples", nightveil: "meat", emberlamb: "bread", skyrend: "cake", volthorn: "dates", brinegrave: "fish",
    bulwyrm: "bread", rotfang: "meat", stillgaze: "bread", crushjaw: "bread", zephyrra: "apples", duskcoil: "meat", atlacrab: "fish", solenne: "dates", kappadeep: "fish", smolderhead: "meat", pyrewisp: "cake", mawdeep: "bread", auroracorn: "apples",
    lumoth: "dates", sunkenhorn: "fish", bramblehoof: "apples", quillshade: "bread", mirequeen: "meat", brassbone: "bread", selkira: "fish", hearthkin: "bread", mothmara: "cake", kirinth: "apples", bakuroth: "cake" };
  const BOND = { horncinder: "MEAT! You remembered! I will love you forever, loudly!", shellmund: "Dates from the oasis. Sand and sweetness. Thank you, little one.", kitsuneva: "Baked apples. You used to steal these for me, dear. Don't think I never knew.",
    skarnwolf: "...Meat. Good. Nothing on it but meat.", vespera: "Cake. Hmph. I suppose it is acceptable. ...Another.", glimmerkoi: "Dates! Why are they sweet? How? ...Don't answer. Thank you.", mossmaw: "Ha. Apples. Fine. You win. They're good. Don't tell anyone.",
    nightveil: "Meat. ...You noticed what I like. You notice everything. Thank you.", emberlamb: "Bread. Warm bread. I... thank you. If that's all right, I'll keep the crust.", skyrend: "Cake! Hah! Where did you hide it?! I demand a rematch of the hiding!",
    volthorn: "Dates dates dates! Are there more?! There are more! Thank you thank you!", brinegrave: "Fish. From the north sea. ...I had forgotten the taste. Thank you.", bulwyrm: "Bread. Good. Thank you.", rotfang: "Meat. ...Fine. Don't make it a habit. ...Make it a habit.",
    stillgaze: "Bread. What is soft inside and hard outside? You. ...Thank you.", crushjaw: "BREAD! The keepers' bread! You kept some! This is the best day!", zephyrra: "Apples, apples, I love apples, I knew you knew, I knew!",
    duskcoil: "Meat. Between us? Nobody else ever asks. Thank you.", atlacrab: "Fish. How kind. Thank you. I shall eat slowly, and mind the bones.", solenne: "Dates. A small sweetness for the road. Walk lightly, and thank you.",
    kappadeep: "...Fish. ...Mm. Slowly. ...Thank you. ...Nap?", smolderhead: "Meat! I did not set anything on fire. Look at it. Oops. Joke. Thank you!", pyrewisp: "Cake! Hee! It's a trick cake, isn't it? ...It's just cake. Hee. Thank you.",
    mawdeep: "Bread. Honest bread. You remembered. I never forgot.", auroracorn: "Apples. I knew you would find the right one. Thank you.", lumoth: "Dates, at night. How lovely. I will glow for you.", sunkenhorn: "...Fish. The tide remembers kindness. Thank you.",
    bramblehoof: "Apples. Sweet as spring bark. Thank you, small iron one.", quillshade: "Seed bread. Between us? The best thing in this whole camp. Thank you.", mirequeen: "Meat. We are very grateful. I am very grateful. ...We, I. Both.",
    brassbone: "Record: this tastes of something I forgot I had. Record: thank you.", selkira: "Fish. ...The sea tastes like this. Thank you. ...Thank you.", hearthkin: "Warm bread. Mind the crumbs. Mind the hearth. Oh, I like you.",
    mothmara: "Cake. May I? ...Thank you for asking me what I like.", kirinth: "Apples. Sacred? No. Simply good. Thank you.", bakuroth: "Cake. It tastes like a dream with a happy ending. Thank you." };
  M3.careCart = async F => {
    const price = Math.round(1.2 * D.priceOf("sunwater", F.tier()));
    await UI.say([["narr", "The cart sits under the wagon's new awning: baskets of treats, brushes, a bucket, a lamp. The care-keeper wipes her hands."], ["merchant", `A treat is ${price} kakal. Every creature has one it would walk through fire for. Finding it is the whole joke.`]]);
    for (;;) {
      const all = F.allCreatures().filter(u => !u.guest);
      const a = await F.ask(`Who is hungry? (${G.gold} kakal)`, all.map(u => ({ label: `${u.name}${G.flags["bond." + u.id] ? "  (bond)" : ""}` })).concat([{ label: "Nobody, thank you" }]), { back: true, top: "30%" });
      if (a < 0 || a >= all.length) return;
      const u = all[a], b = await F.ask(`What does ${u.name} get?`, TREATS.map(t => ({ label: t[1], disabled: G.gold < price })).concat([{ label: "Back" }]), { back: true, top: "30%" });
      if (b < 0 || b >= TREATS.length) continue;
      G.gold -= price; F.sfx("coin");
      if (FAV[u.id] === TREATS[b][0]) {
        if (!G.flags["bond." + u.id]) { G.flags["bond." + u.id] = true; UI.toast(`${u.name} trusts you a little more.`, 2600); }
        await UI.say([[u.id, BOND[u.id] || "Thank you."]]);
      } else await UI.say([["narr", `${u.name} eats it politely, looks at you, and waits.`]]);
    }
  };
  // ---------- the siege of the Reach (5.G): S6 at the gate, then the ship ----------
  M3.siege = async F => {
    if (F.f("ch5.s6") || !F.f("ch5.reach")) return;
    F.music("tension");
    const ok = await M3.general(F, 6, { level: 26, soldiers: [["legionTribune", 24], ["legionArcher", 24, " A"], ["legionArcher", 24, " B"]], bg: "occupied", title: "The Siege of the Reach",
      place: "the gate of Haldar's Reach", where: "It climbed out of the canyon by the goat path, towards the north and the cold.", after: ["(The legion's best collar, and the best it has is somebody I fed apples.)"],
      setup: async c => {
        const g = S.generalFor(6) || { id: "horncinder" };
        M3.actors(c, [["saffa", "npcSaffa", 90, -26], ["hadiya", "npcHadiya", 130, 26], ["gen", g.id, 330, 4], ["sarn", "npcSarn", 400, -80], ["l1", "npcLegionGuard", 380, 40], ["l2", "npcLegionGuard", 400, 0], ["l3", "npcLegionGuard", 420, 36]]);
        c.sfx("encounter"); c.tint("#402010", 0.2, 500);
        await c.say([["narr", "Dawn. Horns from the south, flat and ugly, and then the rolling thunder of boots. The legion has filled the road from wall to wall. In front of it stands a creature at the end of a chain of light; above it, on a ledge, a man in a plumed helm with ink on his fingers."]]);
        await c.pan(c.hero.x + 250, c.hero.y, 800); c.shake(2, 600);
        await c.say([["saffa", "You brought them."], ["hero", "Yes."], ["saffa", "Then you will help send them home."]]);
        c.fx("embers", c.hero.x + 120, c.hero.y - 30); c.fx("fire", c.hero.x + 150, c.hero.y + 20); c.sfx("fire");
        await c.say([["hadiya", "Forge-fire on the gate! Let them pay for every step of the climb!"]]);
        c.emote("sarn", "!"); c.follow();
      } });
    if (!ok) return;
    F.set("ch5.s6");
    await Cinema.stage(async c => {
      M3.actors(c, [["sarn", "npcSarn", 260, -30], ["saffa", "npcSaffa", 100, -20], ["hadiya", "npcHadiya", 140, 20]]);
      await c.say([["narr", "The collar shatters. The legion hears it go, a sound like a dropped bell, and the front rank stops. Then the second. Then the horns blow a different call, and the road below the gate begins to empty."]]);
      await c.walk("sarn", c.hero.x + 560, c.hero.y - 40, 2400);
      await c.say([["sarn", "It is entered in the ledger."]]);
    });
    F.questDone("m_siege");
    await UI.say([["saffa", "Brass Harbour. A ship called the Salt Heron. The captain owes us for a boat in Saltgate."], ["hero", "(Brisk.)"], ["saffa", "He told me you would guess. He also said to tell you the fare has risen."]]);
    F.quest("m_heron", 0); F.set("ch5.done"); F.save(true);
    const i = await F.ask("The caravan to Brass Harbour leaves with the sun.", [{ label: "Leave for Brass Harbour now" }, { label: "Stay a while" }], { top: "40%" });
    if (i !== 0) { await UI.say([["saffa", "The east road is open. Use it when you are ready. Not later than you must."]]); return; }
    await Cinema.voyage({ from: "Haldar's Reach", to: "Brass Harbour", text: "Two days by caravan to the sea." });
    await S.begin[6](F);
  };
  S.trigger.siegeS6 = async F => {
    if (!F.f("ch5.reach") || F.f("ch5.s6")) return;
    if (G.nights <= (G.flags["ch5.n0"] || 0)) { await UI.say([["saffa", "Not yet. Go and rest. The legion has not found the way up. Be at the gate at dawn."]]); return; }
    await M3.siege(F);
  };
  S.done.siegeS6 = F => F.f("ch5.s6");

  // ---------- chapter hand-offs: dbg.jump(5) lands at Saltgate, dbg.jump(6) runs finish[5] first ----------
  S.start[5] = { region: "saltgate", entry: "from_sea" };
  S.finish[5] = (F, G) => {
    ["ch5.start", "ch5.orun", "ch5.s4", "ch5.study", "ch5.studySeen", "ch5.memory", "ch5.kessa", "ch5.s5", "ch5.courierSeen", "ch5.esc", "ch5.canyon", "ch5.escape", "ch5.reach", "ch5.s6", "ch5.done", "ch5.odan"].forEach(k => F.set(k));
    F.set("ch5.logs", 5); F.set("ch5.n0", 0); for (let n = 1; n <= 5; n++) { F.set("log." + n); F.give("dataLog" + n, 1, true); }
    F.give("mentorLetter", 1, true); ["m_truth", "m_escape2", "m_reach", "m_siege"].forEach(q => (G.quests[q] = "done")); G.quests.m_heron = 0;
    F.giveGear("G26", 3, true); G.flags["wagon.at"] = "haldarsReach"; G.gold += 900; G.lastTown = "haldarsReach"; G.ch = 5;
  };
})();
