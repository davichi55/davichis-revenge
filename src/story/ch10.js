// Chapter 10 script, The War at its Peak: Saltmere Camp, Warfront and Trenches (S19), Veil Sanctum (S20) and Crypts, the Observatory (Master Ithiel), the Prism Archive (K8),
// Thunder Spine (S21, the Storm Ram), the Naval Cup, the Veil Stag (L7), Story.finish[10], Story.start[10] (owner: STORY-M5). Shared helpers for chapters 10-12 live in window.Story.m5.
// Spec: ../game-mechanics/specs/M5.md. Voices: ../game-mechanics/STORY_BIBLE.md. Hero thoughts are in parentheses. Nobody explains menus; hints travel as rumours.
// Written in parts (each its own function): A helpers, data, regions, banter; B camp, council, trenches (S19); C sanctum (S20), crypts, the Observatory; D K8, Thunder Spine, cups, L7, finish.
"use strict";
(function () {
  const S = window.Story, D = window.Data, Q = Object.assign, M2 = S.m2, M3 = S.m3, M = S.m5 = {};
  S.begin = S.begin || {}; S.legend = S.legend || {}; S.done = S.done || {};
  const T = M3.T, R = D.REGIONS;
  const say = (who, text) => UI.say([[who, text]]), thought = text => UI.say([["hero", text]]);
  M.T = T; M.say = say; M.thought = thought; M.stage = M2.stage; M.once = M2.once; M.cycle = M2.cycle; M.loot = M2.loot; M.mat = M2.mat; M.rel = M2.rel; M.banter = M2.banter;
  M.hub = () => !!(Flow.engine && Flow.engine.mode === "hub");
  M.markBreak = id => { G.best[id] = Object.assign(G.best[id] || { seen: 0, beaten: 0 }, { breakKnown: true }); };

  // ---------- speakers ----------
  M3.people([["legate", "Legate Corvus Maro", "t"], ["lysenne", "High Cantor Lysenne", "i"], ["morvane", "Archdeacon Morvane", "t"], ["surgeon", "Surgeon", "i"], ["vael", "Master Oren Vael", "s"], ["calendarScholar", "Calendar scholar", "s"],
    ["scholar2", "Scholar", "s"], ["grandChampion", "The Grand Champion", "t"], ["pilgrim", "Pilgrim", "s"], ["imela", "Imela", "i"], ["davichi", "Emperor Davichi", "t"], ["oldDunmar", "Old Dunmar", "m"], ["quartermaster", "Quartermaster", "m"]]);
  ["kirinth", "bakuroth", "hearthkin", "emberwick", "veilStag", "lastWarden", "mawmotherOfTheDeep"].forEach(id => { if (!UI.PEOPLE[id]) UI.person(id, D.NAMES[id] || id.replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase()), ["assets/portraits/" + id + ".png", "assets/creatures/" + id + ".png"]); });
  // Ithiel is older from the war council on: his portrait changes with the story (the same trick as the unmasked hero portrait in chapter 7)
  M.syncMentor = () => {
    if (G && G.flags && G.flags["ch10.council"]) UI.person("mentor", "Master Ithiel", ["assets/portraits/ithielOld.png", "assets/portraits/mentor.png", "assets/face_mentor.png"]);
    else UI.person("mentor", "Master Ithiel", ["assets/portraits/mentor.png", "assets/face_mentor.png"]);
  };
  (function () { const enter = Flow.enter; Flow.enter = function () { try { M.syncMentor(); } catch (e) {} return enter.apply(this, arguments); }; })();

  // ---------- items, goods, quests ----------
  const key = (n, d) => ({ n, d, key: true });
  Q(D.ITEMS, {
    ithielSunDisc: key("Ithiel's Sun-Disc Key", "A brass frame the size of a hand with three empty sockets. On the back, in his small square hand: \"Dawn. Zenith. Dusk. Free what holds the disc.\""),
    dawnDisc: key("The Dawn Disc", "A rose-gold disc, warm as a loaf. It sits in the first socket of Ithiel's key like it grew there."),
    zenithDisc: key("The Zenith Disc", "A white-gold disc with no weight at all. It rings if you tap it, and goes on ringing."),
    duskDisc: key("The Dusk Disc", "A copper-black disc, cool and heavy. Where you hold it the shadow is darker than it should be."),
    keyK8: key("Prism Key", "A key of faceted glass that throws a different colour every time you turn it. Opens a cage at the Menagerie Wagon."),
    keyK9: key("Deep Key", "A key of pale lantern-glass, lit from inside. It opens a cage at the Menagerie Wagon."),
    starMetalShard: key("Star-Metal Shard", "A shard of dark metal that hums when you hold it, a thin high note. It is not warm, and it is not cold."),
    starCompass: Q(key("The Plain Brass Compass", "It points at the horizon the others do not."), { f: 12 }),
  });
  Q(D.GOODS, {
    standardTassel: ["Standard Tassel", 52], ballistaBolt: ["Ballista Bolt-Head", 58], priestBeads: ["Ash-Priest Beads", 56], stormFeather: ["Storm Roc Feather", 70], ramHorn: ["Ram-Calf Horn", 60], harpyTalon: ["Gale Talon", 56],
    sparkPelt: ["Spark-Wolf Pelt", 62], waxStub: ["Wraith Wax Stub", 54], choirRib: ["Choir Rib", 58], prismShard: ["Prism Shard", 64], mirrorFacet: ["Mirror Facet", 72], mothScale: ["Mirror-Moth Scale", 60],
  });
  Q(D.QUESTS, {
    m_saltmere: { t: "Hold Saltmere", main: true, ch: 10, steps: ["The legate's field army presses the breach in the Saltmere Trenches. Hold the line."] },
    m_flock: { t: "The Flock Decides", main: true, ch: 10, steps: ["The Church of the Ember Flock will answer on the third bell. Go to the Veil Sanctum."] },
    m_answer: { t: "Ithiel's Answer", main: true, ch: 10, steps: ["Master Ithiel waits in the Veil Observatory, above the Sanctum. He owes you an answer."] },
    m_storm: { t: "The Thunder Spine", main: true, ch: 10, steps: ["The storm belt sits on the Thunder Spine. Climb to the summit."] },
    k8: { t: "The Prism Archive", ch: 10, steps: ["A builder light-lab stands in the marsh. Doors open to the right reaction. Find the Keeper of the Light."] },
    bounty10: { t: "Bounty: Ballista Crews", ch: 10, steps: ["Corvin pays for the siege ballistae in the Saltmere Trenches, north of the camp: destroy three (0/3).", "Tell Corvin."] },
    bounty11: { t: "Bounty: Storm Rocs", ch: 10, steps: ["Rhaz wants the Storm Rocs off the pilgrim stair of the Thunder Spine thinned: three (0/3).", "Tell Rhaz."] },
    bounty12: { t: "Bounty: The Wax Choir", ch: 10, steps: ["Odan asks for three bone choirs silenced in the Veil Crypts (0/3).", "Tell Odan."] },
  });
  D.BREAKS = D.BREAKS || {};
  Q(D.BREAKS, {
    prismGuardian: "Make two elements argue on its skin, twice in a row. Light bends round a plain blow.", mentorIthiel: "Two elemental reactions in a breath unseat the master; his constructs guard him until they fall.",
    stormRam: "Make it wet while it charges. The lightning turns on its owner.", veilStag: "Two strong light moves in a row put out its lantern.",
    lastWarden: "Three heavy blows in a row crack its bronze.", mawmotherOfTheDeep: "Chill her twice and the deep forgets her.", lanternDeepGuardian: "Two elemental reactions in a breath dim the tallest lantern.",
    naumachiaAdmiral: "Two heavy blows in a row knock him off his prow.", grandChampion: "Three heavy blows in a row take the shield out of his hand.", emperorDavichi: "Three heavy blows in a row. Even a thorough man cannot keep a ledger through that.",
  });

  // ---------- inns, shops, rumours ----------
  const BAS = ["sunwater", "antidote"], CURES = [], BOMBS = ["cinderBomb", "rimeFlask", "soakJar", "sparkJar", "venomPot"], WARDS = ["cinderWard", "rimeWard", "stormWard", "venomWard"];
  const disc = (list, f) => { const o = {}; list.forEach(k => (o[k] = f)); return o; };
  M.BAS = BAS; M.CURES = CURES; M.BOMBS = BOMBS; M.WARDS = WARDS; M.disc = disc;
  const CAMP = BAS.concat(CURES, ["tonic", "ember", "incense", "candle"], BOMBS, WARDS);
  const CHURCH = BAS.concat(CURES, ["tonic", "ember", "stormWard"]);
  Q(D.INNS, { saltmereCamp: { n: "The Cot House", mult: 0.5 }, veilSanctum: { n: "The Pilgrim's Bed", mult: 1.0 } });
  Q(D.SHOPS, {
    saltmere: { n: "Saltmere supply tents", who: "merchant", stock: CAMP, disc: disc(CAMP, 0.9), buys: 1.0 },
    veil: { n: "The Sanctum almoner", who: "merchant", stock: CHURCH, disc: Q(disc(["tonic", "ember", "antidote"], 0.8), {}), buys: 0.9 },
  });
  M3.rumours("saltmereCamp", ["The Storm Ram stores lightning for three turns, then it strikes. Soak it while it charges and the lightning turns on itself.", "The mentor was seen at the empire's war table.", "A white stag walks the marsh at dawn, ahead of a battle."], [M3.clue(19, 0)]);
  M3.rumours("veilSanctum", ["The Ember Flock has split. Some pray for the Titans to sleep, some pray for the Titans to rule.", "The Sun Eater feeds on offerings. Starve it and it weakens.", "The great pyramid has three gates: Dawn, Zenith, Dusk."], [M3.clue(20, 0), M3.clue(21, 0)]);

  // ---------- bestiary and drops: the war zone, the crypts, the storm, the light-lab ----------
  Q(D.BEST, {
    legionSlinger: "A slinger in a leather cap who stays behind the line and picks the weakest creature of the three. Lead shot makes a flat, ugly sound.",
    standardBearer: "He raises the standard and the whole cohort stands straighter. Cut him down first.",
    siegeBallista: "A war machine on a wheeled frame. It fires every second turn, and what it fires goes through armour. Fire gets into the timber.",
    spiritPriest: "A church ghost that mends its friends and curses you for being alive. Candle smoke trails from its sleeves.",
    candleWraith: "A wraith of wax and flame, sagging as it walks. Its touch burns. Water settles it.",
    boneChoir: "A choir of skeletal singers in shrouds. The dirge reaches everyone, and the hush takes your voice. Heavy blows scatter them.",
    stormRoc: "A bird the size of a barn with the sky in its feathers. It dives, and the thunderclap after it shocks everyone. Ice and water bring it down.",
    thunderRamCalf: "A ram-calf trailing sparks. Every third turn it charges one of you with its whole weight. Wet fleece takes the lightning badly.",
    galeHarpy: "Fast, and it strikes twice. The talons bleed. Lightning drops it out of the wind.",
    lightningWolf: "A wolf made of the thing it hunts in. Quick, and the bite shocks. Soak it first.",
    prismSprite: "A mote of light that splits in two when it is alone. Strike the second one before it can split again. Light barely marks it.",
    refractionGolem: "A golem of mirrors. The first element that touches it is thrown back at you from then on. Hit it with something plain.",
    mirrorMoth: "A pale moth with a mirror on every wing. It copies the glow on your party and wears it. Cold slows it.",
    prismGuardian: "The Keeper of the Light. It splits a beam into four colours and answers each one. Make two elements argue on its skin.",
    mentorIthiel: "A teacher in an old coat, standing behind his constructs. He knows every move you know.",
    mentorConstructA: "Brass and lamp-eyes. A stone fist and a pulse that stiffens the others.", mentorConstructB: "Brass and lamp-eyes. A rune bolt and a mending light.", mentorConstructC: "Brass and lamp-eyes. Needles, and a mark on whoever it chooses.",
    stormRam: "A ram the size of a fortress that stores lightning for three turns and then strikes. Make it wet while it charges.",
    veilStag: "A white stag with a halo of candle flames, walking ahead of a battle. The side it faces is said to win.",
    jaguarCohortElite: "Obsidian blade, spotted cloak, no fear. Fast and rare. They hit twice.",
    sunPriestGolem: "A gold automaton in a priest's robe, gears ticking under the plate. Blows slide off it. Water sets its gears sticking.",
    obsidianChimera: "A lion, a goat and a serpent in black glass. Every cut bleeds, and the tail poisons. Cold cracks the glass.",
    bloodAltarWraith: "The wraith of old offerings, thin as smoke and smelling of copper. Its touch lowers your Resistance.",
    eclipseMoth: "A black moth with a sun on its wings. The dust blinds one creature for its next action. Light drives it off.",
    shadowMinotaur: "A minotaur of darkness. It charges every third turn with everything it has. Light burns it.",
    pyramidNaga: "A serpent of gold plates. The coil holds one creature helpless. Lightning runs along the plates.",
    palaceGuard: "Gilded helmet, tower shield. Sturdy. Lightning finds the gaps.", courtPriest: "A soft-voiced priest of the sun. He mends the guards and blesses them. Take him first.",
    emperorDavichi: "A thorough man.", sunEater: "The last lock of the builders, a black sun that eats what is given to it. Three suns, three ways.",
    starMetalGolem: "A golem of star-metal. It shrugs off fire, water, ice and lightning. Plain blows and plain light work.", cometFox: "A fox with a burning tail. Very fast. It bites twice. Water puts the tail out.",
    craterBloom: "A flower of glass that heals its neighbours and poisons you. Shatter it with a heavy blow.", meteorBoar: "A boar of black stone that charges every third turn. Stand clear.",
    voidMoth: "A moth made of the place where light is not. Its dust drains your Focus. Light hurts it.", hollowLens: "A floating dark lens that swallows most of every spell and throws a spark back. Blows go straight through.",
    staredrinker: "A tall thin thing that drinks light. It blinds, and it drinks what it blinds. Light is the one thing it does not like.", emberwoodSentinel: "A tree-warden grown from star-ash. Slow and heavy. Fire is the one thing it fears.",
    drownedSentry: "A builder machine, still on watch, under the water. Blows slide off it. Lightning does not.", lanternEel: "A glowing eel that strobes the whole party. The flash lowers Resistance. Cold slows it.",
    builderWraith: "The ghost of a builder, still at its post. It hushes you, and the light-lines lash. Heavy blows break it up.", coralColossus: "A giant of coral, slow, heavy, covered in spines. Fire dries it.",
    abyssalCrab: "A huge armoured crab. The claw holds one of you. Break the shell with heavy blows.", deepGlowfish: "A swarm of glass-clear fish with a lamp each. Many small bites. Lightning clears them.",
    lanternJelly: "A jelly with a lantern in its bell. The sting shocks, and the drifting net slows everyone. Fire is easier than the water around it.", trenchHorror: "A shapeless thing out of the trench. It is afraid of exactly one thing, and it is the thing you carry.",
    lightlessMaw: "A mouth in the dark. It swallows a creature for a turn. Do not stand where the light ends.",
    grandChampion: "A jaguar-man with a collar, undefeated for eleven years. Stoic, and he counts the sand.", naumachiaAdmiral: "An admiral on a ship's prow in a flooded arena. He calls his boarders. Heavy blows knock him off.",
    lastWarden: "A builder guardian, still on watch over a city with nobody in it.", mawmotherOfTheDeep: "A whale-kraken with a star glowing in her belly. Chill her and she slows.", lanternDeepGuardian: "The tallest lantern in the trench turns toward you. It dims when two elements argue on its glass.",
  });
  Q(D.DROPS, {
    legionSlinger: [["legionCoin", 0.5]], standardBearer: [["standardTassel", 0.45]], siegeBallista: [["ballistaBolt", 0.45]], spiritPriest: [["priestBeads", 0.45]], candleWraith: [["waxStub", 0.45]], boneChoir: [["choirRib", 0.45]],
    stormRoc: [["stormFeather", 0.4]], thunderRamCalf: [["ramHorn", 0.45]], galeHarpy: [["harpyTalon", 0.45]], lightningWolf: [["sparkPelt", 0.45]], prismSprite: [["prismShard", 0.4]], refractionGolem: [["mirrorFacet", 0.45]], mirrorMoth: [["mothScale", 0.45]],
  });

  // ---------- regions: metadata the story reads (arena, music, table, town, inn) and the hub fallback (npcs / exits / things) ----------
  const yes = () => true, WARM = "bg_ruins";
  M3.region("saltmereWarfront", { n: "Saltmere Warfront", bg: WARM, arena: "trenches", music: "warfront", table: "warfront", fields: true, overland: true,
    exits: [["saltmereCamp", "Back to Saltmere Camp", yes], ["saltmereTrenches", "The trench lines and the breach", yes], ["veilSanctum", "The pilgrim causeway to the Veil Sanctum", s => s.f["ch10.s19"]],
      ["thunderSpine", "The road up the Thunder Spine", s => s.f["ch10.mentorWon"]], ["prismArchive", "A black-and-gold door in the marsh", yes]],
    things: [["warfrontChest1", "A chest under a burnt wagon", s => !s.f["c.warfront1"], "chest"], ["warfrontChest2", "A chest in a fallen siege tower", s => !s.f["c.warfront2"], "chest"]] });
  M3.region("saltmereCamp", { n: "Saltmere Camp", bg: WARM, arena: "trenches", music: "warfront", town: "saltmereCamp", inn: "saltmereCamp", autos: ["saltmereArrive"],
    npcs: [["innkeeper", "The Cot House"], ["merchant", "The supply tents"], ["saffa", "Commander Saffa Qarim"], ["hadiya", "Hadiya Wells"], ["rhaz", "Rhaz"], ["peya", "Peya"], ["corvin", "Corvin Dray"], ["imela", "Imela, in the war tent"],
      ["dunmar", "The Menagerie Wagon", s => s.f["wagon.at"] === "saltmereCamp"], ["kessa", "Kessa Vorn"], ["dorrin", "Dorrin Hale"], ["mayle", "Mayle Tarn"], ["surgeon", "The surgeon's row"], ["r1", "A runner"], ["r2", "A cook"], ["r3", "A young fighter"]],
    exits: [["weepingSea", "The dock", yes], ["saltmereWarfront", "Out to the Warfront", yes]],
    things: [["warCouncil", "The war tent and its table of marsh maps", s => s.f["ch10.start"] && !s.f["ch10.council"], "trigger"]] });
  M3.region("saltmereTrenches", { n: "Saltmere Trenches", bg: WARM, arena: "trenches", music: "warfront", table: "trenches", fields: true, dungeon: true,
    exits: [["saltmereWarfront", "Back to the Warfront", yes]],
    things: [["breachS19", "The breach, where the collar altar stands", s => s.f["ch10.council"] && !s.f["ch10.s19"], "trigger"], ["trenchChest", "A chest in a bunker", s => !s.f["c.trench"], "chest"]] });
  M3.region("veilSanctum", { n: "Veil Sanctum", bg: WARM, arena: "crypt", music: "sanctum", town: "veilSanctum", inn: "veilSanctum", autos: ["sanctumArrive"],
    npcs: [["innkeeper", "The Pilgrim's Bed"], ["merchant", "The almoner"], ["lysenne", "High Cantor Lysenne"], ["morvane", "Archdeacon Morvane"], ["odan", "Brother Odan"], ["pilgrim", "A pilgrim on the stair"], ["r1", "A novice"], ["r2", "A bell-ringer"], ["r3", "A pilgrim"]],
    exits: [["saltmereWarfront", "Down the causeway to the Warfront", yes], ["veilCrypts", "The cathedral undercroft", s => s.f["ch10.s20"]], ["veilObservatory", "The tower stair to the Observatory", s => s.f["ch10.s20"]], ["thunderSpine", "The pilgrim road up the Thunder Spine", s => s.f["ch10.mentorWon"]]],
    things: [["sanctumS20", "The cathedral steps", s => s.f["ch10.s19"] && !s.f["ch10.s20"], "trigger"]] });
  M3.region("veilCrypts", { n: "Veil Crypts", bg: WARM, arena: "crypt", music: "crypt", table: "crypt", fields: true, dungeon: true,
    exits: [["veilSanctum", "Up to the cathedral", yes]],
    things: [["archiveDoor", "A builder door with four candle-niches", s => !s.f["crypt.open"], "trigger"], ["crypt1", "A tablet in the archive room", s => s.f["crypt.open"] && !s.f["lore.sunPiece4"], "gather"], ["crypt2", "A second tablet, face down", s => s.f["crypt.open"] && !s.f["lore.sunPiece5"], "gather"],
      ["cryptChest", "A chest among the shrouds", s => !s.f["c.crypt"], "chest"]] });
  M3.region("veilObservatory", { n: "The Veil Observatory", bg: WARM, arena: "observatory", music: "mentor", town: false,
    npcs: [["mentor", "Master Ithiel", s => s.f["ch10.mentorWon"]]], exits: [["veilSanctum", "Down the tower stair", s => s.f["ch10.mentorWon"]]],
    things: [["ithielMeeting", "The table under the open dome", s => !s.f["ch10.mentorWon"], "trigger"]] });
  M3.region("thunderSpine", { n: "Thunder Spine", bg: WARM, arena: "stormPeak", music: "stormPeak", table: "thunder", fields: true, overland: true,
    exits: [["veilSanctum", "Down the pilgrim road to the Sanctum", yes], ["saltmereWarfront", "Down to the Warfront", yes]],
    things: [["spineS21", "A collar altar on a landing in the cloud", s => !s.f["ch10.s21"], "trigger"], ["ramFight", "The summit, in the cloud", s => s.f["ch10.s21"] && !s.f["ch10.t7"], "trigger"], ["spineChest", "A chest wedged in the rock", s => !s.f["c.spine"], "chest"],
      ["thunderTablet", "A tablet on the summit", s => s.f["ch10.t7"] && !s.f["lore.sunPiece6"], "gather"]] });
  M3.region("prismArchive", { n: "The Prism Archive", bg: WARM, arena: "prism", music: "vault", table: "prism", fields: true, dungeon: true,
    exits: [["saltmereWarfront", "Out to the marsh", yes]],
    things: [["prismDoor1", "A glass door with two glyphs: water, fire", s => !s.f["prism.d1"], "trigger"], ["prismDoor2", "A glass door with two glyphs: water, lightning", s => s.f["prism.d1"] && !s.f["prism.d2"], "trigger"],
      ["prismDoor3", "A glass door with two glyphs: water, ice", s => s.f["prism.d2"] && !s.f["prism.d3"], "trigger"], ["prism1", "A tablet in the beams", s => !s.f["lore.sunPiece3"], "gather"],
      ["prismFight", "The last chamber, where the light is brightest", s => s.f["prism.d3"] && !s.f["k8.done"], "trigger"], ["g35_aetherBulbCirclet", "A chest in the Keeper's chamber", s => s.f["k8.done"], "chest"]] });
  // the wagon follows the camps: a wagon NPC visible while wagon.at matches (the hub conditions above)
  M.wagonAt = (F, rid) => { F.set("wagon.at", rid); };
})();

// ---------- part B: banter, the voyage, Saltmere Camp, the war council, the breach (S19) ----------
(function () {
  const S = window.Story, D = window.Data, Q = Object.assign, M3 = S.m3, M = S.m5, T = M.T, say = M.say, thought = M.thought, stage = M.stage, once = M.once, cycle = M.cycle, rel = M.rel;
  const B = M.banter;   // B(moment, 9 rows of 3 lines in pack order: vanguard sprint venom tempest ironward breakers bastion wildfire dawn)
  B("war", [   // Saltmere: tents in three colours, the sound of a siege far off
    ["So many banners! Which side is ours? Is it all of them?!", "A marsh keeps its dead softly, young bull. Walk where the ground is sure.", "Stay close, dear. There are three kinds of frightened here, and I can smell all of them."],
    ["Armies. Lines. Orders. I hate it. I will fight in it.", "So many people, and not one of them in a hurry. How tragic.", "Which banner is which? Who chose the colours? Do they mean the same thing to everyone?"],
    ["Ha. A marsh at last. Somebody finally asked me.", "...Half this camp is not sleeping.", "There are so many of them. I'll stay close, if that's all right."],
    ["Hah! Three colours of flag. Ten kakal on the blue one!", "Is that a catapult? Can I sit on it? Can I?!", "Marsh water, and men at the edge of it. Stay behind us when it starts."],
    ["Hm. Good walls.", "Of course. A war. At last, something to match the mood.", "Who wins a war that three armies lose? Ask me after."],
    ["Cook tent! I smell a cook tent!", "So many friends, so many friends, I knew they'd come!", "Did you know the Flock's envoy and the legate dined together last month? I did."],
    ["A fine camp. Mind the guy-ropes, please.", "Steady hearts. A camp is only a road that has stopped for the night.", "...Slowly... a battle is slow, too. ...Until it is not."],
    ["Don't look at me. I haven't touched a single tent.", "Hee. That siege tower is so, so dry.", "The mess hall. Is the mess hall free?"],
    ["So many came. I knew they would, when it mattered.", "I'll glow low here. There is enough fire in this marsh.", "...The tide brought an army. It will take it back."],
  ]);
  B("mentor", [   // the Observatory: the creatures are quiet, one careful line each
    ["...I don't shout in here. Look. I'm not shouting.", "He is old, young bull. Older than when he fed us.", "Whatever you decide, dear, we are behind you. Not in front. Behind."],
    ["That one signed the cages. ...I will stand by you. Not by him.", "He looks smaller than I remember. How inconvenient.", "Is he sorry? Can he be sorry? Do I want to know?"],
    ["Grumble. ...No grumble. Let him talk.", "...He is not lying. That is the worst of it.", "I'm here, if that's all right. I'm right here."],
    ["...No joke. I'm checking. Nope. No joke.", "Can I— no. No. Quiet. I can be quiet.", "I will stand between you and every blow in this room. The words, too."],
    ["Hm.", "Of course. He has tea. Of course.", "The riddle was always him."],
    ["I don't want his biscuits. I want to want them, and I don't.", "He looks so tired, so tired, and I'm still angry.", "I know every secret in that lab. I did not know this one. ...I wish I still didn't."],
    ["He rocked us, too, once. Mind your step, please.", "Walk lightly. Whatever he is, you are not him.", "...Slowly... listen. Then, not slowly, decide."],
    ["Oops— no. No oops. Nothing is on fire.", "Hee— no. No hee. Not for this.", "He gave me bread once. ...I remember that. I remember the rest, too."],
    ["I knew you would come, and I knew it would be hard.", "I will glow, if you want. Quietly.", "...The tide has come in for him. Hear him out."],
  ]);
  B("storm", [    // the chain stair into the cloud
    ["Lightning! It's LOUDER than me! I love it! I hate it!", "Hold the chain, young bull. Lightning loves a tall fool.", "Mind the rungs, dear. They're wet. Hold my tail if you must."],
    ["Rock. Wind. Nothing to chain me to up here. Good.", "A storm and a climb. I am going to be unbearable about it.", "Why does the lightning go to the tall things? Does it choose? Can I ask it?"],
    ["Grumble. Bare rock. Not one patch of moss. Insulting.", "...The mountain is listening.", "I'm not scared of thunder. I'm scared of the bit before it. If that's all right."],
    ["Hah! A storm! Finally, my kind of weather!", "Can I catch it? Can I catch the lightning? CAN I?!", "Wet rock. Falling ice. Stay behind me on the stair."],
    ["Hm. Climb.", "Of course. Lightning. On a chain of iron. Why not.", "What climbs without legs, and falls without wings? Ask the ram."],
    ["I'll carry the snacks up! ...I ate the snacks.", "Higher, higher, I knew we'd go higher!", "Did you know the pilgrims used to bring ewes up here, to bargain? Interesting, what the ram did not take."],
    ["Mind the ice on the rungs, please.", "Steady hearts. A storm is only a road in a hurry.", "...Slowly... wait for the thunder to finish. Then climb."],
    ["Don't blame me. That fork of lightning was already smoking.", "Hee! The sky is lighting fires for us!", "Are there snacks at the top? Is it far? Is it very far?"],
    ["The clouds will part. I know it.", "I'll glow low. The lightning is bright enough.", "...The sea is a long way down. I can taste it in the rain."],
  ]);
  B("crypts", [   // the Veil Crypts: candle-niches, shrouded bones
    ["I don't like quiet! It's too quiet! Somebody say something!", "The dead are patient, young bull. Show them the same.", "Light a candle for each, dear. Even the ones you don't know."],
    ["Bones. Doors. A locked vault. I do not like locked.", "I'm too young and too fast for crypts. Hurry up.", "Who were they? What were their names? Did anyone write them down?"],
    ["Grumble. Good soil down here. Don't tell anyone I said so.", "...They are not gone. They are listening.", "I'll hold the candle, if that's all right. I don't mind the dark."],
    ["Hah— no. Even I won't, down here.", "Can I look? Can I just look? I'll be quiet!", "Stay close. Nobody walks alone in a place like this."],
    ["Hm. Respect.", "Of course. Candles. Bones. A locked door. Why not.", "What is buried, but never lost? Ask the archive."],
    ["I don't think there are snacks down here. I checked.", "Be nice to the bones, be nice, I'm sure they were nice!", "Did you know the Flock keeps a ledger of its dead? Everyone does."],
    ["Mind the shrouds. Please. Gently.", "Walk lightly. These halls remember.", "...Slowly... the dead are in no hurry. Neither are we."],
    ["I'm keeping my hands in my pockets. I have no pockets.", "Hee... no. Even I know when not to.", "There's no food here. Only candles. I'm sad."],
    ["They were loved. I can tell.", "I'll glow for them. Quietly.", "...The tide goes in and out of every grave. Walk."],
  ]);

  // ---------- 4.0 the voyage (Story.begin[10]; chapter 9 ends with the green-wax letter) ----------
  M.ensure = (F, n) => { if (G.ch < n) G.ch = n; if (!F.f("ch" + n + ".start")) F.set("ch" + n + ".start"); };
  S.begin[10] = async F => {
    G.ch = 10; F.set("ch10.start"); F.music("voyage");
    await Cinema.voyage({ from: "ashfeatherCamp", to: "saltmereCamp", text: "Across the Weeping Sea, towards the marsh coast of Sehkarem.", mood: "day" });
    await Cinema.title("Chapter 10", "The War at its Peak");
    F.music("warfront"); F.autoSave = true; F.save(true);
    F.go("saltmereCamp", "from_sea");
  };
  S.start[10] = { region: "saltmereCamp", entry: "from_sea" };

  // ---------- 4.A Saltmere Camp ----------
  const SC = "saltmereCamp";
  S.trigger.saltmereArrive = async F => {
    M.ensure(F, 10);
    if (!once(F, "sc.seen")) return;
    G.lastTown = SC; F.set("wagon.at", SC); F.music("warfront");
    await stage(async c => {
      M3.actors(c, [["r1", "npcRecruit", -150, -30], ["r2", "npcMedic", 150, 30], ["r3", "npcScout", 70, -60]]);
      c.tint("#2a2630", 0.18, 400); await c.pan(c.hero.x + 120, c.hero.y - 20, 900);
      await c.say([["narr", "A city of tents on the marsh. Banners of three colours snap over the mess halls: blue for the Concord, white for the Flock, red-and-black for the road that leads to the Dominion. Somewhere to the north, flat and regular as a clock, a siege goes on."],
        ["narr", "Boys carry water. A surgeon's row steams under a canvas roof. Nobody runs, and nobody sits."]]);
      c.sfx("bell"); c.follow(); c.tint("#2a2630", 0, 500);
    }, { music: "warfront" });
    await F.banter("war");
  };
  S.done.saltmereArrive = F => F.f("sc.seen");
  S.trigger.warCouncil = async F => {
    M.ensure(F, 10);
    if (F.f("ch10.council")) { await say("saffa", "The table is yours when you want it. The line holds until you say it does not."); return; }
    F.music("warfront");
    await stage(async c => {
      M3.actors(c, [["saffa", "npcSaffa", 90, -14], ["hadiya", "npcHadiya", 150, -34], ["rhaz", "npcRhaz", 190, 16], ["peya", "npcPeya", 130, 40], ["corvin", "npcCorvin", 60, 50], ["imela", "npcImela", 230, -10, { flip: true }]]);
      c.tint("#1d1820", 0.25, 500);
      await c.say([["narr", "The war tent is the biggest in the camp and the only one with a floor. A table of marsh maps fills it; someone has weighted the corners with a ladle, a boot, a clay cup and a dagger."], ["saffa", "Show me."]]);
      G.party.slice(0, 3).forEach((u, i) => c.actor("p" + i, { art: u.art || u.id, x: c.hero.x - 40 - i * 34, y: c.hero.y + 20 - i * 14 }));
      await c.wait(500);
      await c.say([["saffa", "Three at your heel. The last report said two and a gap."], ["hero", "The gap came back."],
        ["hadiya", "Everything costs. Eleven days of sea, a crossing at the storm belt's edge, and the whole team at the end of it. I have seen worse invoices."],
        ["rhaz", "I have seen the creatures. The rest can wait for the soup."], ["peya", "And what does the Flock say?"], ["hadiya", "The Flock says it will tell us on the third bell."], ["imela", "That means after the battle."]]);
      c.emote("saffa", "..."); await c.wait(300);
      await c.say([["saffa", "The legate's army is the Dominion's last field army. Legate Corvus Maro, four cohorts at the breach, a general on the altar behind them, ballistae behind the sandbags. If the line goes, Saltmere goes, and the road to the coast goes after it."],
        ["corvin", "Three guilds, three banners, one lunch tent. I have fought on worse terms."], ["saffa", "You hold the trench line. Nothing more. When the general falls, the cohorts go home."]]);
      const e = rel(c, 150, 70);
      c.actor("kessa", { art: "npcKessa", x: e.x, y: e.y }); c.actor("dorrin", { art: "npcDorrin", x: e.x + 40, y: e.y + 10 }); c.actor("mayle", { art: "npcMayle", x: e.x + 80, y: e.y });
      await c.say([["kessa", "Not bad, for a tin can. You came back with all three. I counted."], ["dorrin", "Boss says hello. I say hello. Also, have you eaten?"], ["mayle", "Page two hundred. The legate's cohorts are paid late. It's in the margin. Nobody reads the margin."]]);
      await c.say([["imela", "Sparrow. Sit. The tea is terrible."], ["imela", "He wants to see you. I told him the Flock's stairs are long, and he should climb them himself."], ["hero", "(He sent a letter. A letter is not a door.)"], ["imela", "Go when you are ready. Not before. Questions keep."]]);
      c.tint("#1d1820", 0, 500); c.follow();
    }, { music: "warfront" });
    F.set("ch10.council"); M.syncMentor(); F.quest("m_saltmere", 0);
    UI.toast("Saffa is holding the trench line at the breach.", 3200);
  };
  S.done.warCouncil = F => F.f("ch10.council");

  // ---------- the camp's people ----------
  M3.talkTown(SC, { inn: SC, shop: "saltmere", who: ["scout", "stallkeeper", "refugee"], opts: {},
    innLine: F => F.f("ch10.s19") ? "The Cot House. A cot, a blanket and a bowl. The line held last night, so tonight the cots are full of people who are not listening for horns." : "The Cot House. A cot, a blanket and a bowl. Sleep while you can; the siege does.",
    shopLine: "Supply tents, Saltmere. Wards, bombs, flasks, the lot. The Concord pays me in promises, so I charge you in kakal, at the camp's price." });
  Object.assign(T(SC), {
    saffa: async F => {
      if (F.f("ch10.t7")) return say("saffa", "The Spine is quiet. First night in a month the sky was not part of the war.");
      if (F.f("ch10.mentorWon")) return say("saffa", "The Flock has its stair and you have your answer. The mountain is still there. So is the storm on it.");
      if (F.f("ch10.s19")) return say("saffa", "The line held. The legate will find another place to push. He is a patient man. So am I.");
      await say("saffa", F.f("ch10.council") ? "The breach is north of the camp, in the trenches. Hold it. Nothing more." : "Go to the war tent, at the centre. Hadiya has the maps.");
    },
    hadiya: async F => {
      if (F.f("ch10.t7") && !F.f("ch10.done")) return M.sail10(F);
      if (F.f("ch10.s19")) return say("hadiya", cycle("hd10", ["The Flock sits on the third bell. It is a long bell. Everything costs, and so does waiting.", "The storm belt has a Titan in it. Every ship I send goes round, and every day round is a day of grain.", "Your mother has taken over the tea. I have never seen the quartermaster afraid until now."]));
      await say("hadiya", cycle("hd10", ["Everything costs. The line costs men, and the men cost bread. Eat when it is offered.", "Count the exits before you count the enemy. It was my first rule at the guild. It has kept me alive twice."]));
    },
    rhaz: async F => {
      const st = F.qstep("bounty11");
      if (st === "done") return say("rhaz", "The pilgrim stair is quiet. Thank you. Show me the next creature when you find one.");
      if (st === undefined) { await say("rhaz", "The Storm Rocs have been taking pilgrims off the chain stair. Three of them. The Thunder Spine road is shut until somebody thins them."); M.startBounty(F, "bounty11"); return; }
      return M.checkBounty(F, "bounty11", "rhaz");
    },
    peya: async F => say("peya", cycle("py10", ["And what did you do with the last favour you were given?", "The Flock is splitting on the stair as we speak. Who gains when the shepherd and the flock part?", "Your master sits in a tower. Have you asked yourself what he is waiting for?"])),
    corvin: async F => {
      const st = F.qstep("bounty10");
      if (st === "done") return say("corvin", "Three ballistae fewer. The cooks have stopped flinching. Lunch is on me. Lunch is always on somebody.");
      if (st === undefined) { await say("corvin", "Three siege ballistae in the trench line, Saltwater coin on every wheel. Break them and I am yours for a week. We have three rules, and one of them is lunch."); M.startBounty(F, "bounty10"); return; }
      return M.checkBounty(F, "bounty10", "corvin");
    },
    imela: async F => {
      if (F.f("ch10.mentorWon")) return say("imela", cycle("im10", ["Eat. There is bread, and I am not asking.", "I have known him thirty years. He is exactly as old as he looks, and not a day wiser.", "Hm."]));
      await say("imela", cycle("im10", ["Eat first. Questions keep. The tea is still terrible.", "The surgeons have started asking me where the thyme is. I tell them: in the south, in a garden you can't see from here.", "Sparrow. Whatever he says on that stair, you may keep your face."]));
    },
    kessa: async F => say("kessa", cycle("ks10", ["Don't look at me like that. I'm holding a line, same as you. Not bad, for a tin can.", "Emberwick sends a flame, a small one, and an opinion.", "If you see that legate, give him my regards. And a bruise."])),
    dorrin: async F => say("dorrin", cycle("dr10", ["Boss says it is stew. I say it is mostly stew.", "The surgeon's row has a pie. Nobody has told the surgeons yet.", "Eat, friend. Also hello."])),
    mayle: async F => say("mayle", cycle("my10", ["Page two hundred and eleven. The legate is behind on three cohorts' pay. It's in the margin.", "I counted the ballistae. Eleven in the field. The ledger says eight. Somebody is lying on both sides.", "Page two hundred and forty. 'As agreed' again. I am starting to dislike that phrase."])),
    surgeon: async F => say("surgeon", cycle("sg10", ["Bandages, Sunwater, and whatever the cooks can spare. Do not stand there. If you are hurt, lie down. If you are not, find someone who is.", "The marsh is bad for wounds. Everything festers. We boil everything. Everything but the soldiers."])),
  });
  T(SC).dunmar = async F => { await M3.wagon(F); };
  T(SC).oldDunmar = T(SC).dunmar;

  // ---------- bounty boards (ballistae, storm rocs, bone choirs): the kill counter at the time the bounty was taken is stored in a flag ----------
  const BOUNTY = {
    bounty10: { enemy: "siegeBallista", n: 3, ch: 10, left: "Ballistae: %d of 3. The trenches are north of the camp.", pay: "Three wheels fewer. Here, as posted. And stay for lunch." },
    bounty11: { enemy: "stormRoc", n: 3, ch: 10, left: "Rocs: %d of 3. They sit on the pilgrim stair, in the weather.", pay: "Three gone. The stair is open. The coin is as posted." },
    bounty12: { enemy: "boneChoir", n: 3, ch: 10, left: "Choirs: %d of 3. They sing in the crypts under the cathedral.", pay: "The dirge has stopped. Heaven is patient. The coin is as posted." } };
  M.startBounty = (F, id) => { G.flags[id + ".base"] = G.kills[BOUNTY[id].enemy] || 0; F.quest(id, 0); };
  M.checkBounty = async (F, id, who) => {
    const b = BOUNTY[id], got = Math.min(b.n, (G.kills[b.enemy] || 0) - (G.flags[id + ".base"] || 0));
    if (got >= b.n) { F.questDone(id); F.gold(Math.round(5 * M3.m(b.ch))); F.sfx("coin"); return say(who, b.pay); }
    return say(who, b.left.replace("%d", Math.max(0, got)));
  };

  // ---------- 4.B the breach (S19) ----------
  S.trigger.breachS19 = async F => {
    if (F.f("ch10.s19")) return;
    F.music("tension");
    const freed = await S.generalScene(F, 19, { level: 60, soldiers: [["standardBearer", 58, " B"], ["siegeBallista", 58, " C"]], bg: "trenches", title: "General of the Fourth Cohort", place: "the Saltmere breach",
      where: "It went north through the reeds, and the reeds closed behind it.", fx: 140, fy: -6,
      setup: async c => {
        M3.actors(c, [["l1", "npcLegionGuard", 160, -50], ["l2", "npcLegionGuard", 180, 0], ["l3", "npcLegionGuard", 160, 50]]);
        c.tint("#14101a", 0.45, 400);
        await c.say([["narr", "The trench line at night. Torches in pans along the firing steps, and past the sandbags a legion cohort in a square, shields up, standing in black water to the knee. Behind them, on a mound of piled planks, a collar altar with a chain running up to the neck of something that is not a soldier."]]);
        c.sfx("chain"); c.fx("sparkle", c.hero.x + 150, c.hero.y - 30);
        await c.say([["narr", "Soldiers kneel at its foot. A standard-bearer lifts the standard. Nobody speaks. The ballista winds, once, with a sound like a tooth coming out."]]);
        c.tint("#14101a", 0, 500);
      } });
    if (!freed) return;
    F.set("ch10.s19"); F.questDone("m_saltmere"); F.quest("m_flock", 0);
    await stage(async c => {
      M3.actors(c, [["odan", "npcOdan", 100, -10]]);
      c.tint("#2a2a38", 0.2, 500);
      await c.say([["narr", "The cohorts break formation before the altar is cold. One at a time, then all together, they turn and wade north through the reeds, shields trailing. Behind the sandbags the line begins, very quietly, to breathe."]]);
      await c.say([["odan", "Say it. Heaven is patient. I am slower. ...No. Not you. I said it to myself."], ["odan", "The Flock has answered. The Cantor will see you."], ["hero", "Both factions?"], ["odan", "Both. That is the difficulty."]]);
      c.tint("#2a2a38", 0, 500);
    }, { music: "farewell" });
    UI.toast("Veil Sanctum: the causeway is open.", 3000);
  };
  S.done.breachS19 = F => F.f("ch10.s19");
  S.chest.trenchChest = M.loot("c.trench", [["ember", 3]], 800, "A chest in a bunker, under a dry blanket and a dead man's boots. Three Ashen Embers wrapped in oilcloth, and the legion's last payroll for a cohort that will not need it.");
  S.chest.warfrontChest1 = M.loot("c.warfront1", [["tonic", 4]], 900, "A chest under a burnt wagon, its lid scorched but sound. Four Clearwater Tonics in straw, and a purse the quartermaster did not live to count.");
  S.chest.warfrontChest2 = M.loot("c.warfront2", [["ember", 3]], 0, "A chest in a fallen siege tower, wedged between two beams. Three Ashen Embers, still warm from the fire that took the tower.");
})();

// ---------- part C: the Veil Sanctum (S20), the sun-lore tablets, the Veil Crypts, the Observatory and Master Ithiel ----------
(function () {
  const S = window.Story, D = window.Data, Q = Object.assign, M3 = S.m3, M = S.m5, T = M.T, say = M.say, thought = M.thought, stage = M.stage, once = M.once, cycle = M.cycle, rel = M.rel;

  // ---------- the six builder tablets of the Sun Eater (spec 8): each is a Journal entry; none is ever required ----------
  const PIECE = {
    1: ["Hollow of the Sky-Stone", "The first sun is held by a hand of stone. Strike the hand twice, and the sun sets down its weight."],
    2: ["Behind the waterfall, Featherfall Canopy", "The second sun is a bird that will not land. Slow it, and slow it again, and it lands."],
    3: ["The Prism Archive", "The third sun is a coal. Wet the coal, and wet it again, and it forgets it was bright."],
    4: ["The Veil Crypts", "Under the coal lie the roots that feed it. Set the roots alight and nothing feeds the coal."],
    5: ["The Veil Crypts", "A sun that is fed grows. Close the hands that feed it."],
    6: ["The Thunder Spine summit", "At the end of the year there is a day that is not a day. We did not take it. It was never ours to give."],
  };
  M.PIECE = PIECE;
  Object.keys(PIECE).forEach(n => { D.LORE["sunPiece" + n] = "Builder tablet, " + PIECE[n][0] + ": \"" + PIECE[n][1] + "\""; M3.LORE.push(["lore.sunPiece" + n, "Tablet of the Sun Eater (" + n + " of 6)", D.LORE["sunPiece" + n]]); });
  Object.defineProperty(D.BREAKS, "sunEater", { enumerable: true, configurable: true, get: () => {
    const t = [], f = k => window.G && G.flags && G.flags["lore.sunPiece" + k];
    if (f(1)) t.push("The first sun is held by a hand of stone: strike it twice.");
    if (f(2)) t.push("The second sun is a bird that will not land: slow it, and slow it again.");
    if (f(3)) t.push("The third sun is a coal: wet it, and wet it again.");
    if (f(4)) t.push("Under the coal lie roots that feed it: set them alight.");
    return t.length ? t.join(" ") : "The builders' tablets speak of three suns. Find what they say.";
  } });
  S.sunPiece = (F, n) => {
    if (F.f("lore.sunPiece" + n)) return false;
    F.set("lore.sunPiece" + n); if (n <= 4) M.markBreak("sunEater");
    G.best.sunEater = G.best.sunEater || { seen: 0, beaten: 0 };
    UI.toast("Journal: the Sun Eater, tablet " + n + " of 6.", 3000); return true;
  };
  M.tablet = async (F, n, intro, thoughtLine) => {
    await UI.say([["narr", intro], ["narr", "\"" + PIECE[n][1] + "\""]]);
    if (S.sunPiece(F, n) && thoughtLine) await thought(thoughtLine);
  };

  // ---------- the lines of the mentor's fight: the constructs keep their pay rules and guard link after a lost fight ("Try again" rebuilds with F.mkEnemy) ----------
  (function () {
    const mk = Flow.mkEnemy, NM = { A: "Stone Construct", B: "Rune Construct", C: "Needle Construct" };
    Flow.mkEnemy = function (id, lv, tag) {
      const u = mk.call(this, id, lv, tag);
      if (/^mentorConstruct[ABC]$/.test(id)) { u.guards = "mentorIthiel"; u.xpAbs = 0; u.goldAbs = 0; u.name = NM[id.slice(-1)] + (tag || ""); }
      return u;
    };
  })();

  // ---------- 4.C the Veil Sanctum and the split of the Flock (S20) ----------
  const VS = "veilSanctum";
  S.trigger.sanctumArrive = async F => {
    M.ensure(F, 10);
    if (!once(F, "vs.seen")) return;
    G.lastTown = VS; F.music("sanctum");
    await stage(async c => {
      M3.actors(c, [["p1", "npcPilgrim", -140, -20], ["p2", "npcAcolyte", 130, 30], ["g1", "npcFlockGuard", 60, -60]]);
      c.tint("#e8e4f0", 0.08, 400); await c.pan(c.hero.x + 100, c.hero.y - 60, 1000);
      await c.say([["narr", "White terraces climb a cliff in steps, one cathedral on the crown of them, and over its door a stag cut of white stone with a halo of candle-flames burning at its brow in broad day. Bells in every tower. Pilgrims on the stair stop, look at you, and look away, as if you had been named."],
        ["narr", "Above the city, apart from it, a round tower with an open dome. A single lamp burns at its top."]]);
      c.sfx("bell"); c.follow(); c.tint("#e8e4f0", 0, 500);
    }, { music: "sanctum" });
  };
  S.done.sanctumArrive = F => F.f("vs.seen");
  S.trigger.sanctumS20 = async F => {
    if (F.f("ch10.s20")) return;
    if (!F.f("ch10.s19")) { await say("odan", "The causeway first, friend. The cohorts have not gone home yet."); return; }
    F.music("sanctum");
    const freed = await S.generalScene(F, 20, { level: 61, soldiers: [["spiritPriest", 59, " B"], ["spiritPriest", 59, " C"]], bg: "crypt", title: "General of the Sanctum Door", place: "the cathedral steps",
      where: "It went up the cliff, past the bells, and the bells did not ring for it.", fx: 120, fy: -6,
      setup: async c => {
        M3.actors(c, [["lysenne", "npcLysenne", -120, -10], ["morvane", "npcMorvane", 150, 0], ["g1", "npcFlockGuard", 110, 50]]);
        c.tint("#e8e4f0", 0.06, 300);
        await c.say([["narr", "The cathedral steps at the third bell. On one side of them the Cantor, on the other the Archdeacon, and a dozen paces of bare white stone between them that neither will cross."],
          ["lysenne", "You came. The Flock does not often answer a question. It has been asked one, and so it will."], ["morvane", "Peace is made by those who can bear the price. I have been paying it for three years. I do not apologise for the receipt."],
          ["lysenne", "A flame that will not be used is still a flame."], ["morvane", "A flame that is used is a fire, Cantor. Look at the marsh."]]);
        c.sfx("chain"); c.fx("sparkle", c.hero.x + 110, c.hero.y - 30);
        await c.say([["morvane", "I have made an arrangement. The Dominion sends a gift to keep the door."], ["hero", "That is a collar."], ["morvane", "It is a guard. I did not ask what it was made of."], ["lysenne", "No. You asked what it cost."]]);
        c.tint("#e8e4f0", 0, 400);
      } });
    if (!freed) return;
    F.set("ch10.s20"); F.set("ch10.sanctum"); F.questDone("m_flock"); F.quest("m_answer", 0);
    await stage(async c => {
      M3.actors(c, [["lysenne", "npcLysenne", 90, -10], ["morvane", "npcMorvane", 190, 20]]);
      c.tint("#e8e4f0", 0.05, 400);
      await c.say([["narr", "The creature goes up the cliff and does not look back. On the steps, the Archdeacon's people begin to gather their robes and file into the cathedral and draw the door behind them, one by one, without a word. The Cantor's people stand where they are, and then, one by one, they walk the other way: down to the undercroft, with candles."]]);
      await c.say([["morvane", "It will be remembered that I tried to buy time."], ["lysenne", "It will be remembered that you bought it with someone else's."], ["morvane", "..."], ["lysenne", "The Flock will not be one thing again. It will be two honest things."]]);
      await c.say([["lysenne", "The crypts are open to you. Our dead keep what the builders left under them, and the Flock has kept it badly for a thousand years."],
        ["lysenne", "And there is a stair in the east tower. A man has been sitting at the top of it since the second bell, with a cold cup of tea. He asked that you come alone."], ["hero", "(Alone. After nineteen years, he asks for alone.)"]]);
      c.tint("#e8e4f0", 0, 400);
    }, { music: "farewell" });
    UI.toast("The Veil Crypts and the Observatory stair are open.", 3200);
  };
  S.done.sanctumS20 = F => F.f("ch10.s20");

  M3.talkTown(VS, { inn: VS, shop: "veil", who: ["pilgrim", "bellringer", "scribe"], opts: {},
    innLine: "The Pilgrim's Bed. Linen, a candle, and a wall that has heard every prayer worth hearing. We take the offering you can afford.",
    shopLine: "The almoner's stall. Cures and revivals, at the Flock's price, which is a kindness. Storm-Ward for the pilgrim stair. Nothing is for war. Everything is for after." });
  Object.assign(T(VS), {
    lysenne: async F => {
      if (F.f("k8.freed")) return say("lysenne", cycle("ly10", ["They tell me a qilin walks the camp now. I had hoped to live to hear that. Thank you for being the kind of person who asks the sacred what it would rather be.", "Sacred is a thing others call you. A wise creature once said that to me in a dream. I did not know it would be true."]));
      if (F.f("ch10.s20")) return say("lysenne", cycle("ly10", ["The Flock will not be one thing again. I am at peace with that. A pilgrim told me the stag walked the marsh this dawn. He faced the sea.", "You have something of the Master's walk. Not the armour. The way you stop at doors."]));
      await say("lysenne", "The steps first, child. The third bell is a long bell.");
    },
    morvane: async F => {
      if (F.f("k8.freed")) return say("morvane", cycle("mv10", ["A qilin in a camp full of soldiers. It will be sold to a banner within a year. I say this not as a threat but as arithmetic.", "I am told your creature is sacred. Everything is sacred until the harvest."]));
      if (F.f("ch10.s20")) return say("morvane", cycle("mv10", ["I did what I could with what I was given. That is all any of us can say, and few of us can say it with a straight face.", "The Dominion will outlive both of us. I would like to be remembered for having noticed."]));
      await say("morvane", "Peace is made by those who can bear the price. Do you know what you can bear?");
    },
    odan: async F => {
      const st = F.qstep("bounty12");
      if (st === "done") return say("odan", "The crypts are quiet. I light a candle for you each night. It is not much. It is a candle.");
      if (st === undefined) { await say("odan", "The bone choirs under the cathedral have started singing at the wrong hours. Three of them. They frighten the novices. Hush them, and heaven will hold the price."); M.startBounty(F, "bounty12"); return; }
      return M.checkBounty(F, "bounty12", "odan");
    },
    pilgrim: async F => say("pilgrim", cycle("pg10", ["Every pilgrim climbs the stair to the bell. Few come down quite the same.", "I walked eleven days to see the stag. I saw a bird instead. It was enough."])),
  });

  // ---------- 4.C the Veil Crypts: the archive door (four candle-niches lit in the order of the year), the tablets, the chest ----------
  const NICHES = ["The Seed", "The Sun", "The Star", "The Moon"], ORDER = [0, 1, 2, 3];
  S.trigger.archiveDoor = async F => {
    if (F.f("crypt.open")) return;
    if (once(F, "crypt.seen")) await F.banter("crypts");
    if (once(F, "crypt.door")) await UI.say([["narr", "A door of black-and-gold builder stone at the end of the crypt, and no handle. Four niches in the wall beside it, one for each glyph on the lintel: the Seed, the Sun, the Star, the Moon, carved in a ring. An old line of Flock script has been scratched under it: \"Light the year in the order it is lived.\""]]);
    const step = G.flags["crypt.step"] || 0;
    const i = await F.ask("The four niches.", NICHES.map(n => ({ label: "Light " + n })).concat([{ label: "Leave them" }]), { top: "36%" });
    if (i < 0 || i > 3) return;
    if (ORDER[step] === i) {
      G.flags["crypt.step"] = step + 1; F.sfx("fire");
      if (step + 1 < 4) await UI.say([["narr", `${NICHES[i]} lights, and holds, a small yellow flame in the dust. Somewhere behind the door a stone shifts a hand's breadth.`]]);
      else { F.set("crypt.open"); F.sfx("door"); await UI.say([["narr", "The fourth flame catches and all four turn white. The door breathes out, a long breath of cold, dry air that smells of lamp-oil and old paper. Behind it an archive room: shelf on shelf of clay and slate, a reading-table, a lamp that is already lit."]]); }
      return;
    }
    await UI.say([["narr", "The flame takes, and gutters, and goes out, and every other candle in the crypt goes out with it. In the dark, something begins to sing."]]);
    G.flags["crypt.step"] = 0; M3.hurt && M3.hurt(F, 0.06);
    const foes = F.rollEncounter("crypt"); if (foes) await F.fight(foes, { bg: "crypt" });
  };
  S.done.archiveDoor = F => F.f("crypt.open");
  S.gather.crypt1 = async F => {
    if (F.f("lore.sunPiece4")) return false;
    await M.tablet(F, 4, "A tablet face-up on the reading table, in the builders' short hand. A Flock scholar has laid a ribbon beside it, a little fraying, a little gold.", "(Roots. A coal with roots. Something is feeding it, and not only from the arena.)");
  };
  S.gather.crypt2 = async F => {
    if (F.f("lore.sunPiece5")) return false;
    await M.tablet(F, 5, "A tablet turned face down on a lower shelf, as if someone could not bear to look at it. You turn it over.", "(Close the hands that feed it. The arena. Every victor an offering.)");
  };
  S.chest.cryptChest = M.loot("c.crypt", [["soulDew", 1]], 1000, "A chest among the shrouds, its lock polished by the hands of a hundred acolytes. One Soul Dew in a glass vial, and a purse the Flock has been saving for a day that finally came.");

  // ---------- 4.D the answer: Master Ithiel (ithielMeeting) ----------
  S.trigger.ithielMeeting = async F => {
    if (F.f("ch10.mentorWon")) return;
    if (!F.f("ch10.s20")) { await UI.say([["narr", "The tower door is barred from the inside. A candle on the sill, and a folded paper under it: \"Not yet. - I.\""]]); return; }
    F.music("mentor"); F.quest("m_answer", 0);
    await stage(async c => {
      M3.actors(c, [["ithiel", "npcIthielGrey", 150, -10, { flip: true }]]);
      c.tint("#0a1020", 0.45, 500);
      await c.say([["narr", "The Observatory at night. The dome stands open on a sky crowded with stars, and under it a circle of brass instruments, star charts on every wall, a great sun-calendar wheel in the floor with a ring of days worn smooth by feet. A lamp. A table. And at the table, with a cold cup of tea, a man older than you remember."]]);
      c.emote("ithiel", "..."); await c.wait(500);
    }, { music: "mentor" });
    await F.banter("mentor");
    await UI.say([["mentor", "Late again. ...No. You are exactly on time. I was early."], ["hero", "Tell me."],
      ["mentor", "I traded eight cages for nineteen years of your life. I would do it again. Ask me to be sorry and I will try, and fail."], ["hero", "You sold her to him."],
      ["mentor", "I sold him maps, data and creatures. He kept Imela unharmed because that was the price. I did not choose the price. I chose to pay it."],
      ["hero", "The creatures."], ["mentor", "Twenty-four names on a receipt. I can recite them. I have, most nights."],
      ["mentor", "I read the builders' tablets at twenty. The Titans are locks. Something is coming, and the locks are being broken one by one, by a man who thinks they are a harvest. I could not stop him. I could only try to guide the hand: wake them gently, bind them, hold them in reserve for what comes."],
      ["mentor", "I was wrong about the hand."], ["hero", "You made me write down every blow."],
      ["mentor", "Yes. You were the best instrument I ever had, and the only thing I ever loved that I used."],
      ["mentor", "Now. I will not let you walk into that pyramid without the one thing I can give you. Do not mistake that for a request to be forgiven. Fight me. Then listen."]]);
    await stage(async c => {
      c.tint("#0a1020", 0.45, 100); c.sfx("door"); c.shake(3, 700); c.fx("sparkle", c.hero.x + 100, c.hero.y - 30, { ms: 1400, r: 60 });
      await c.say([["narr", "The floor opens in three places along the wheel of days. Brass rises out of it: three figures with lamps for eyes, who take their places around the table without a sound."], ["mentor", "Panic is not a plan. Do not panic."]]);
      c.tint("#0a1020", 0, 300);
    }, { music: "mentor" });
    await Cinema.boss({ id: "mentorIthiel", name: "Master Ithiel", title: "Master of the Academy", bg: "observatory", music: "mentor", lines: [["mentor", "I taught you to read every move. Read this."], ["hero", "(He taught me everything. That is the trouble.)"]] });
    const res = await F.boss(Core.bossFoes("mentorIthiel", 62), { bg: "observatory", music: "mentor", intro: "Master Ithiel stands behind his constructs, hands folded." });
    if (res !== "win") return;
    M.markBreak("mentorIthiel");
    await stage(async c => {
      M3.actors(c, [["ithiel", "npcIthielGrey", 130, -10, { flip: true }]]);
      c.tint("#0a1020", 0.4, 100); c.sfx("break"); await c.wait(500);
      await c.say([["narr", "The constructs stand down one by one, lamps going out. Ithiel sits, slowly, like a man putting down something he has carried up a long stair. His hands are not quite steady."]]);
      await c.say([["mentor", "My boy."], ["narr", "He has never said it before. He says it once, and does not say it again."],
        ["mentor", "There is a lock on the Great Pyramid. Three gates. I built them for him, fifteen years ago, because it is hard to say no to a man who holds the one you love. Each gate is held by a disc, and each disc by a collar. Free what holds the disc and the gate opens. Dawn. Zenith. Dusk."],
        ["narr", "He sets a brass frame in your hand the size of a palm, with three empty sockets."], ["mentor", "The gates open the way down. At the bottom is the last lock. The Sun Eater. It is the last of them, and it is the one that matters."]]);
      const e = rel(c, -170, 30); c.actor("imela", { art: "npcImela", x: e.x, y: e.y });
      await c.walk("imela", c.hero.x - 70, c.hero.y + 20, 1100);
      await c.say([["imela", "You old fox."], ["mentor", "Imela."], ["imela", "He kept you alive. I will thank you once. After that I will not mention it."], ["mentor", "That is more than I deserve."], ["imela", "Yes."]]);
      await c.walk("imela", c.hero.x + 160, c.hero.y - 60, 1400); c.face("imela", "up");
      c.tint("#0a1020", 0, 500);
      await c.say([["narr", "She goes to the window and looks at the stars without speaking. You look from one to the other, and say nothing."]]);
    }, { music: "farewell" });
    F.give("ithielSunDisc", 1, true); UI.toast("Ithiel's Sun-Disc Key received.", 3200);
    F.set("ch10.mentor"); F.set("ch10.mentorWon"); M.syncMentor(); F.questDone("m_answer"); F.quest("m_storm", 0);
  };
  S.done.ithielMeeting = F => F.f("ch10.mentorWon");
  T("veilObservatory").mentor = async F => {
    await say("mentor", cycle("mn10", ["I am an old man with a telescope. Do not make it more than it is.", "The sky is wrong, you know. Not tonight. Soon. I have been counting the nights since I was twenty.", "Go. Take the storm first. The lightning is a lock, too, and a smaller one. It will teach you what the larger ones will ask.", "I made the discs. I will not make you carry them alone. Your mother has already told me so, twice."]));
  };
})();

// ---------- part D: K8 and Kirinth, the Thunder Spine (S21, the Storm Ram), the Naval Cup, the Veil Stag (L7), the storm sails, finish ----------
(function () {
  const S = window.Story, D = window.Data, Q = Object.assign, M3 = S.m3, M = S.m5, T = M.T, say = M.say, thought = M.thought, stage = M.stage, once = M.once, cycle = M.cycle, rel = M.rel;

  // ---------- 4.E K8 the Prism Archive: three doors that ask for a reaction (a prismTarget fight: the named reaction breaks it), then the Keeper of the Light ----------
  const DOORS = {
    1: { react: "Steam", glyphs: "water and fire", look: "A glass door with two glyphs side by side: a drop and a flame. On the wall beside it, a chart in builder hand: the two drawn together, and a cloud rising between them.", bombs: [["soakJar", 1], ["cinderBomb", 1]], done: "The drop meets the flame on the glass and the glass clouds over, white, and clears. The door slides into the wall." },
    2: { react: "Conductive", glyphs: "water and lightning", look: "A glass door with two glyphs: a drop and a forked line. The chart on this wall shows the drop swallowing the fork whole and glowing from inside.", bombs: [["soakJar", 1], ["sparkJar", 1]], done: "A crackle runs the length of the glass, blue on wet, and the door breathes open." },
    3: { react: "Freeze", glyphs: "water and ice", look: "A glass door with two glyphs: a drop and a six-armed star. The chart shows the drop stopped in the middle of falling.", bombs: [["soakJar", 1], ["rimeFlask", 1]], done: "Frost fans over the glass in a perfect spiral. The door shatters inward, soundlessly, and the pieces never reach the floor." },
  };
  (function () {
    const mk = Flow.mkEnemy;
    Flow.mkEnemy = function (id, lv, tag) { const u = mk.call(this, id, lv, tag); if (id === "prismTarget" && Flow.doorSpec) { u.door = Flow.doorSpec.react; u.doorGlyphs = Flow.doorSpec.glyphs; u.name = "Glass Door" + (tag || ""); } return u; };
  })();
  D.REGIONS.prismArchive.autos = ["prismEnter"];
  S.trigger.prismEnter = async F => {
    M.ensure(F, 10);
    if (!once(F, "prism.seen")) return;
    F.quest("k8", 0);
    await UI.say([["narr", "Black-and-gold walls of prisms, and between them beams of coloured light that cross and part and cross again without ever touching the floor. Charts line the walls in builder hand, each one two small drawings and a line between them. Water and fire. Water and lightning. Water and ice."],
      ["hero", "(A lab. Not for creatures. For light.)"]]);
  };
  S.done.prismEnter = F => F.f("prism.seen");
  const door = n => async F => {
    const d = DOORS[n];
    if (F.f("prism.d" + n)) return;
    if (n > 1 && !F.f("prism.d" + (n - 1))) { await UI.say([["narr", "The way to this door is closed behind the last."]]); return; }
    if (once(F, "prism.look" + n)) { await UI.say([["narr", d.look]]); await UI.say([["narr", "On a shelf beside it, two clay jars with a note under them in a Flock hand: \"For those who came without. Do not drink.\""]]); d.bombs.forEach(([k, c]) => F.give(k, c, true)); UI.toast("Taken from the shelf: " + d.bombs.map(([k]) => D.ITEMS[k].n).join(" and ") + ".", 3000); }
    const i = await F.ask("The glass door asks for " + d.glyphs + ".", [{ label: "Answer the door" }, { label: "Not yet" }], { top: "38%" });
    if (i !== 0) return;
    Flow.doorSpec = d;
    const res = await F.fight([F.mkEnemy("prismTarget", 60)], { bg: "prism", intro: "The door's glyphs flare." });
    Flow.doorSpec = null;
    if (res !== "win") return;
    F.set("prism.d" + n); F.sfx("door");
    await UI.say([["narr", d.done]]);
    if (n === 3) await UI.say([["narr", "Past the third door, the light comes from one place. A chamber with a single great facet hanging in it, turning slowly, and the beams all bending towards it."]]);
  };
  [1, 2, 3].forEach(n => { S.trigger["prismDoor" + n] = door(n); S.done["prismDoor" + n] = F => F.f("prism.d" + n); });
  S.gather.prism1 = async F => {
    if (F.f("lore.sunPiece3")) return false;
    await M.tablet(F, 3, "A tablet standing in the beams, so that the light falls through it in colours. The builders' short hand, cut very deep.", "(A coal. Wet it, and wet it again.)");
  };
  S.trigger.prismFight = async F => {
    if (F.f("k8.done")) return;
    const ok = await M3.keyBoss(F, { id: "prismGuardian", level: 62, k: "k8", key: "keyK8", name: "The Prism Guardian", title: "Keeper of the Light", bg: "prism",
      lines: [["narr", "The great facet stops turning. It splits the nearest beam into four colours and holds them in a fan, and each colour looks at you."], ["hero", "(It will answer whatever I send with something else.)"]],
      after: [["narr", "The facets dim one by one. In the centre of the chamber, where the Keeper hung, a key of faceted glass lies on the floor, throwing a different colour every time the light moves."]] });
    if (ok) F.quest("k8", 1), F.questDone("k8");
  };
  S.done.prismFight = F => F.f("k8.done");
  S.chest.g35_aetherBulbCirclet = async F => S.gearChest2(F, "g35_aetherBulbCirclet", "G35");

  // Kirinth at the wagon (the wagon is wrapped once more: M3.wagon was wrapped by chapter 8 for K6)
  M.freeKirinth = async F => {
    F.take("keyK8", 1); F.set("k8.freed");
    const u = F.mk("kirinth", Math.max(3, F.avgLevel() - 1)); G.collection.push(u); G.best.kirinth = G.best.kirinth || { seen: 1, beaten: 0 }; F.sfx("door");
    await stage(async c => {
      await c.cageOut("kr", "kirinth", { scale: 1.1, before: [["dunmar", "Hold the lantern, lad. This lock is made of colours."]], desc: [["narr", "The cage door turns every shade of the rainbow and swings open. A qilin steps down onto the wagon boards: a deer's grace, a dragon's head, scales of pearl that go from blue to rose to green as it looks about."]] });
      await c.say([["kirinth", "My scales know my mood before I do."], ["dunmar", "The Flock calls it sacred, lad. Half of them will be thrilled and half furious."], ["kirinth", "Sacred is a thing others call you. I would rather be asked."]]);
      await c.cageBack("kr");
    });
    UI.toast("Kirinth joins the collection.", 3200);
    await UI.say([["kirinth", "I will walk with you, if you will have me. I am told you ask first."]]);
  };
  (function () { const base = M3.wagon; M3.wagon = async F => { if (F.item("keyK8") > 0) { await M.freeKirinth(F); return true; } return base(F); }; })();

  // ---------- 4.F Thunder Spine: S21 mid-ascent, the summit and the Storm Ram (T7) ----------
  S.trigger.spineS21 = async F => {
    if (F.f("ch10.s21")) return;
    if (!F.f("ch10.mentorWon")) { await UI.say([["narr", "The chain stair is shut behind a rope and a pilgrim's lamp. The lamp has been lit for someone who has not come yet."]]); return; }
    if (once(F, "spine.seen")) await F.banter("storm");
    F.music("stormPeak");
    const freed = await S.generalScene(F, 21, { level: 62, soldiers: [["lightningWolf", 61, " B"]], bg: "stormPeak", title: "General of the Spine Stair", place: "the landing in the cloud",
      where: "It went up into the cloud and the cloud closed over it like water.", fx: 120, fy: -6,
      setup: async c => {
        M3.actors(c, [["l1", "npcLegionGuard", 130, -40], ["l2", "npcLegionGuard", 150, 30]]);
        c.tint("#1a2030", 0.4, 400); c.fx("lightning", c.hero.x + 60, c.hero.y - 90);
        await c.say([["narr", "Mid-ascent the chain stair widens into a landing in the cloud, and on the landing the legion has put a collar altar, because a storm is a good place to hide a leash. Rain comes in sideways. Two soldiers kneel on the wet stone with their eyes shut and their lips moving."]]);
        c.sfx("chain"); c.fx("sparkle", c.hero.x + 120, c.hero.y - 30);
        c.tint("#1a2030", 0, 500);
      } });
    if (!freed) return;
    F.set("ch10.s21");
  };
  S.done.spineS21 = F => F.f("ch10.s21");
  S.trigger.ramFight = async F => {
    if (F.f("ch10.t7")) return;
    if (!F.f("ch10.s21")) { await UI.say([["narr", "The summit is hidden in cloud, and the stair to it is held by a collar altar."]]); return; }
    F.music("tension");
    const res = await M3.boss(F, { id: "stormRam", level: 64, name: "The Storm Ram", title: "Titan of the Thunder Spine", bg: "stormPeak", music: "titanStorm",
      lines: [["narr", "Thunder rolls under your feet. A ram the size of a fortress lowers its horns and the clouds gather in them."], ["hero", "(Three turns of lightning, and then it strikes. Wet wool and lightning have never agreed.)"]] });
    if (res !== "win") return;
    M.markBreak("stormRam"); G.best.stormRam = Object.assign(G.best.stormRam || {}, { breakKnown: true });
    await stage(async c => {
      c.tint("#1a2030", 0.35, 100); c.sfx("break"); c.flash("#ffffff", 500); c.shake(4, 700); await c.wait(900);
      await c.say([["narr", "The ram goes down on its knees, and the lightning leaves it: not in a flash, but in a long sigh up through the horns. The clouds on the summit begin to come apart. Light falls through them in shafts."]]);
      c.tint("#1a2030", 0, 1200); c.music("farewell");
      await c.say([["narr", "Far out to sea the storm belt thins like breath on a window. A road opens in it, the colour of pewter, running east."], ["hero", "(Not mine to take. Not mine to wake. But I woke it, and I put it down.)"]]);
    }, { music: "farewell" });
    F.giveGear("G33", 3); F.set("ch10.t7"); F.set("stormSails"); F.questDone("m_storm");
    UI.toast("The storm belt has opened. Hadiya's carpenters are fitting storm sails to the Salt Heron.", 4200);
  };
  S.done.ramFight = F => F.f("ch10.t7");
  S.gather.thunderTablet = async F => {
    if (F.f("lore.sunPiece6")) return false;
    await M.tablet(F, 6, "On a flat stone at the very top, out of the wind, the builders' hand again, cut deep and filled with rain.", "(A day that is not a day. Somebody took it, once. Or somebody was afraid to.)");
  };
  S.chest.spineChest = M.loot("c.spine", [["stormWard", 3], ["tonic", 3]], 1100, "A chest wedged in the rock, its lid frosted with a night of lightning. Three Storm-Wards, three Clearwater Tonics, and a purse a pilgrim left for the ram and the ram never took.");

  // ---------- 4.G the Naval Cup (Tzavan): STORY-M5 overrides the fights of Data.CUPS.naval ----------
  if (D.CUPS && D.CUPS.naval) Object.assign(D.CUPS.naval, {
    fights: [{ n: "Whelps and a gull-lord", foes: ["krakenWhelp", "krakenWhelp", "gullLord"], lv: 58 }, { n: "Siren eels", foes: ["sirenEel", "sirenEel", "mermaidShaman"], lv: 59 },
      { n: "The boarding party", foes: ["legionShieldbearer", "legionShieldbearer", "legionArcher", "legionArcher"], lv: 60 }],
    champion: { n: "The Naumachia Admiral", foes: ["naumachiaAdmiral", "krakenWhelp", "krakenWhelp"], lv: 62, intro: "Water pours over the white steps. The Admiral stands on a ship's prow that was never built to float, and two whelps circle the stern." } });

  // ---------- L7: the Veil Stag of the marsh at dawn ----------
  S.legend.L7 = async (F, info) => {
    if (!F.f("l7.heard") && (info.def && info.def.n)) F.set("l7.heard");
    F.music("legend");
    await Cinema.panels([{ img: "assets/cinema/m5_stag.png", text: "Mist on the marsh at dawn. A white stag stands on a hummock between the camps, a halo of candle-flames burning at its brow. It is facing the battlefield. It does not look at you." }], { music: "legend" });
    await UI.say([["hero", "(Whichever side it faces wins, they say. It is facing both.)"]]);
    const i = await F.ask("The Veil Stag", [{ label: "Walk out to it" }, { label: "Let it stand" }], { top: "38%" });
    if (i !== 0) { F.music(F.regionMusic()); return false; }
    F.checkpoint();
    const res = await F.fight([F.mkEnemy("veilStag", 60)], { noFlee: true, music: "legend", goldMult: 0, xpBonus: 1.5, intro: "The Veil Stag lowers its antlers. The candles lean towards you.", bg: F.arenaOf(G.region) });
    if (res !== "win") { F.music(F.regionMusic()); return false; }
    M.markBreak("veilStag");
    F.gold(Math.round(10 * M3.m(10)), true); F.give("soulDew", 1); F.set("l7.done");
    await UI.say([["narr", "The stag bows its head. The halo gutters to a single flame, and the flame falls into your hand: a vial of dew that glows faintly, like a lantern behind a curtain. When you look up, the mist has taken the hummock."]]);
    return true;
  };

  // ---------- 4.H the storm sails and the end of chapter 10 ----------
  M.sail10 = async F => {
    if (!F.f("ch10.sails")) {
      F.set("ch10.sails"); F.music("warfront");
      await stage(async c => {
        M3.actors(c, [["hadiya", "npcHadiya", 100, -20], ["brisk", "npcBrisk", 170, 20, { flip: true }], ["w1", "npcDockhand", 60, 40]]);
        c.tint("#2a3040", 0.1, 300); c.sfx("door"); await c.wait(400);
        await c.say([["narr", "At the Saltmere quay the Salt Heron lies with her mast bare and a crew of carpenters on her yards, unrolling sailcloth the colour of pewter, stitched through with copper wire. The cloth hums when the wind touches it."],
          ["captain", "Friend! Look at her! Storm sails! She'll thread a thunderhead like a needle, and not a thread out of place."], ["hadiya", "Everything costs. This one was paid by a Titan."], ["captain", "It is the only invoice I have ever loved."]]);
        c.tint("#2a3040", 0, 400); c.follow();
      }, { music: "warfront" });
    }
    const i = await F.ask("Hadiya: the muster is on the quay. The Heron sails when you say.", [{ label: "Sail for Ahuacan" }, { label: "Not yet" }], { top: "38%" });
    if (i !== 0) { await say("hadiya", "She will wait. She is used to it. Do the last of what you came to do, and come back."); return; }
    await M.finish10(F);
  };
  S.trigger.saltmereSails = async F => { if (F.f("ch10.t7") && !F.f("ch10.sails")) await M.sail10(F); };
  D.REGIONS.saltmereCamp.autos = ["saltmereArrive", "saltmereSails"];
  M.finish10 = async F => {
    F.music("farewell");
    await stage(async c => {
      M3.actors(c, [["saffa", "npcSaffa", 90, -10], ["imela", "npcImela", 150, -30], ["rhaz", "npcRhaz", 190, 10], ["peya", "npcPeya", 120, 40], ["corvin", "npcCorvin", 70, 50], ["lysenne", "npcLysenne", 220, 0]]);
      c.tint("#2a3040", 0.15, 400);
      await c.say([["narr", "Dawn on the quay. The Concord, the Flock and the resistance have mustered: blue banners and white and a hundred small flags nobody has a name for, queueing up the gangways without being told to."],
        ["saffa", "Ahuacan. The coast road, then the city. We take the bastion at Dawnwatch first. After that, the stair."], ["lysenne", "The Flock will walk behind your banner. It has been a long time since the Flock walked behind anyone's."],
        ["peya", "And what do you intend to do when you get there?"], ["hero", "Open the cages."], ["peya", "Hm. That is an answer."], ["imela", "Hm."]]);
      c.tint("#2a3040", 0, 400);
    }, { music: "farewell" });
    F.set("ch10.done"); G.ch = Math.max(G.ch, 10);
    F.autoSave = true; F.save(true);
    if (S.begin[11]) await S.begin[11](F);
    else await UI.say([["narr", "The Salt Heron slips out between the marsh lights. To be continued in Chapter 11."]]);
  };

  // ---------- Story.finish[10] (dbg.jump: the end of chapter 10) ----------
  S.finish[10] = (F, G) => {
    ["ch10.start", "ch10.council", "ch10.s19", "ch10.sanctum", "ch10.s20", "ch10.mentor", "ch10.mentorWon", "ch10.s21", "ch10.t7", "ch10.sails", "ch10.done", "stormSails", "sc.seen", "vs.seen", "prism.seen", "ch11.start",
      "gen.freed.19", "gen.freed.20", "gen.freed.21", "lore.sunPiece6"].forEach(k => (G.flags[k] = true));
    ["m_saltmere", "m_flock", "m_answer", "m_storm"].forEach(q => (G.quests[q] = "done"));
    [19, 20, 21].forEach(n => { const g = S.generalFor(n); if (g) S.noteGeneral(g.id, ["Freed at the Saltmere breach. It went north through the reeds, and the reeds closed behind it.", "Freed on the cathedral steps. It went up the cliff, past the bells, and the bells did not ring for it.", "Freed on the Thunder Spine stair. It went up into the cloud and the cloud closed over it."][n - 19]); });
    G.items.ithielSunDisc = 1; F.giveGear("G33", 3, true); G.gold += 3500; G.flags["wagon.at"] = "saltmereCamp"; G.lastTown = "saltmereCamp"; G.ch = 10;
    if (window.Systems && Systems.giveShip && !G.flags.ship) Systems.giveShip(F, { pass: true });
    M.syncMentor();
  };
})();

// ---------- skill book (SKILLBOOK agent 2026-10-31): Static Snare (Stormglass, Thunder Spine) ----------
(function () {
  const S = window.Story, D = window.Data, M2 = S.m2, add = (id, ...drops) => { D.DROPS[id] = (D.DROPS[id] || []).concat(drops); };
  Object.assign(D.MATS, { stormglass: ["Stormglass", "Sand fused hollow where lightning struck. Hold it to your ear before the sky clears its throat."] });
  Object.assign(D.BOOK, { staticSnare: { n: "Static Snare", mat: "stormglass", need: 10, d: "2 MP. Shock hit that adds 1 shock, then a 50% base chance to stun for 1 turn (Luck against Resistance; bosses resist repeats).", move: "staticSnare" } });
  add("thunderRamCalf", ["stormglass", 0.3]); add("stormRoc", ["stormglass", 0.2]);
  M2.bookSpot("thunderSpine", "stormglass1", "Hollow lightning-glass", "g.glass1", "stormglass", 5, "Where lightning has struck the road twice, the sand has fused into hollow glass tubes. They hum when the sky changes its mind. You lift five out, careful not to knock them together.", "Static Snare");
  M2.bookSpot("thunderSpine", "stormglass2", "Fused sand tubes", "g.glass2", "stormglass", 5, "A second strike-mark, older, the glass gone cloudy. It rings like a bell when you flick it. Five more tubes.", "Static Snare");
})();
