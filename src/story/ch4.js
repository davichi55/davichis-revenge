// Chapter 4 script, The Plumed Coil (owner: STORY-M2): Featherfall Canopy, Plume Rest, Sporeroot Caves, Windhollow Aviary (K2), Lookout Chain, Canopy Spire (T2), Marigold Hollow, Imela's house and cellar, the waterfall cave.
// Registers Data tables, Story.talk/trigger/chest/gather/legend handlers, Story.begin[4], Story.start[4], Story.finish[4]. Helpers (M.stage, M.town, M.once ...) come from ch3.js (window.Story.m2).
// Spec: ../game-mechanics/specs/M2.md sections 7-9. Voices: ../game-mechanics/STORY_BIBLE.md. Hero thoughts are in parentheses. Nobody explains menus; hints travel as rumours.
"use strict";
(function () {
  const S = window.Story, Q = Object.assign, M = S.m2, T = M.T;
  S.begin = S.begin || {};
  const person = M.person;
  [["yaxa", "Mother Yaxa", "weaver"], ["tamoc", "Old Tamoc", "mentor"], ["neeli", "Neeli", "child"], ["imela", "Imela", "wellwoman"], ["weaver", "Weaver", "weaver"], ["oldman", "Old man", "gossip"],
    ["kiteChild", "Child with a kite-string", "child"], ["farmer", "Farmer", "foreman"], ["oldwoman", "Old woman", "wellwoman"], ["marksman", "Marksman", "soldier"], ["tribune", "Tribune", "soldier"],
    ["lightkeeper", "Lamp-keeper", "weaver"], ["nanny", "Neighbour", "wellwoman"]].forEach(([id, nm, art]) => { if (!UI.PEOPLE[id]) person(id, nm, null, art); });
  const Rg = Data.REGIONS, yes = () => true, RU = "bg_ruins";
  const rel = M.rel;

  // ---------- items, quests, shops, inns, rumours ----------
  Q(Data.ITEMS, {
    ithielPass: { n: "Ithiel's Green Ring Seal", d: "A ring seal in green wax, stamped with an eye inside a sun. \"The pass enclosed will take you through any door in Orun.\"", key: true },
    featherBlanket: { n: "Feather-Star Blanket", d: "A baby's blanket, soft with washing, a feather inside a star sewn into one corner. The twin of the one he was carried in.", key: true },
    imelaLetter1: { n: "Letter on the Kitchen Table", d: "To Tala, her sister: \"The wanderer has stayed the whole summer. He mends the fence, the roof and the loom, and answers nothing I ask him. He has a mark on his wrist, a feather inside a star.\"", key: true },
    imelaLetter2: { n: "Letter in the Loom Basket", d: "Unsent: \"You left before the cock crowed and took nothing but the lamp. The baby has your chin. Where do I send word? Come back, or do not, but let me tell you his name.\"", key: true },
    imelaLetter3: { n: "The Company's Door-Notice", d: "\"TZAKAL HARVESTING COMPANY, Marigold Hollow, Lot 1. The woman Imela, herb-wife, is summoned to the Company's service at the capital. The household is not to be disturbed. The ledger will be balanced.\"", key: true },
    imelaLetter4: { n: "Note from the Cradle", d: "\"To whoever carries him: he is eight months and eats everything. Take him far. The Company counts houses, not cradles. I will pay whatever it costs. I am not going to be able to.\"", key: true },
    wellLetter1: { n: "Under the Stone, I", d: "\"I passed the Hollow at dusk. The house is dark. If you live, Imela, this stone is where I leave word. The sky is not what they told us.\" Signed with a feather inside a star.", key: true },
    wellLetter2: { n: "Under the Stone, II", d: "\"Ten years. I keep a count. The count is short. I am sorry for everything but the leaving.\" Signed with a feather inside a star.", key: true },
    wellLetter3: { n: "Under the Stone, III", d: "\"I asked after the boy at Orun. They say he is well and does not ask about his father. That is the kindest lie anyone has told me.\" Signed with a feather inside a star.", key: true },
  });
  Q(Data.QUESTS, {
    m_canopy: { t: "The Canopy", main: true, ch: 4, steps: ["Climb the cliff path to the canopy village of feather-weavers."] },
    m_letters: { t: "The Marigold Stitch", main: true, ch: 4, steps: ["Mother Yaxa knows the stitching on the satchel strap: the Marigold feather stitch. Three families still sew it, in the Hollow down the long stair.", "Find what Imela's house still holds (0/4)."] },
    m_spire: { t: "The Plumed Coil", main: true, ch: 4, steps: ["A Titan nests above the canopy. Ithiel wants to know how it flies.", "Climb the Canopy Spire."] },
    lanterns: { t: "Lanterns for Plume Rest", ch: 4, steps: ["The weaver at Plume Rest needs four lantern wicks, taken from the Lantern Bat Knights on the rope bridges of Featherfall Canopy, outside the village (0/4)."] },
    wellStone: { t: "Under the Stone by the Well", ch: 4, steps: ["Neeli keeps what strangers leave under the flat stone by the well. Ask her again when the stone has something new."] },
  });
  const BASIC = ["sunwater", "antidote"];
  Q(Data.SHOPS, {
    plume: { n: "Plume Rest weaver's stall", who: "merchant", stock: [...BASIC], buys: 1.0 },
    marigold: { n: "Marigold Hollow stall", who: "merchant", stock: [...BASIC], buys: 1.0 },
  });
  Q(Data.INNS, { plumeRest: { n: "The Soft Nest" }, marigoldHollow: { n: "The Gate and Gourd" } });
  Q(Data.RUMOURS, {
    plumeRest: ["\"The Coil hates things that creep. Slow it twice and it falls from the sky.\"", "\"Mother Glowmoth comes out on moonless nights.\"", "\"A kind weaver sewed a feather mark on a baby's blanket once. Her husband was gone before dawn.\""],
    marigoldHollow: ["\"Imela's house still stands. She went to the capital as a bride, they say. Not by choice.\"", "\"The cellar has no lock, but no one opens it.\"", "\"Strangers sometimes leave letters under the stone by the well.\""],
  });
  [[3, 2], [4, 3]].forEach(([i, slot]) => Object.defineProperty(Data.RUMOURS.plumeRest, i, { get: () => { try { return S.styleClue(slot, 0); } catch (e) { return ""; } }, enumerable: true, configurable: true }));
  Data.BREAKS = Data.BREAKS || {};

  // ---------- bestiary and drops ----------
  Q(Data.BEST, {
    featherWyvern: "A lizard with owl wings. It telegraphs its dive; plan around it.",
    lanternBatKnight: "A bat in tin armour with a lamp on a hook. The light marks you, and the next blow lands harder. Fire melts the tin.",
    ropeSpiderMaiden: "A woman's head on a spider's body. Her webs slow you down. Fire cuts them.",
    orchidDryad: "A flower woman who heals her allies. Kill her first.",
    cloudRam: "A ram on a little cloud. It charges, and the charge is the thing to read. Lightning shakes the cloud loose.",
    skyEel: "A flying eel. Its bite shocks and its tail arcs. Cold slows it right down.",
    plumedWatcher: "A sentinel statue draped in feathers. It guards its friends, and nothing it hits is gentle.",
    sporerootCrawler: "Many legs, all of them rootlets. Poison, and a puff of spores. Fire.",
    gloomMushroomShaman: "A mushroom priest. It mends its friends and poisons you. Finish it first.",
    caveGargoyle: "Stone, hard to wound, deaf to most spells. It drops on one creature from above, every third turn.",
    fungusTroll: "A troll grown over with caps. It cannot be poisoned. It is very good at poisoning you.",
    drippingMimic: "A chest that drips. When it opens, it bites the weakest of you first.",
    windhollowGuardian: "A carved roc of stone and rusted feathers. Slow it twice and the stone bird comes down.",
    plumedCoil: "A feathered sky-serpent. Slow it, and it comes down to earth.",
    motherGlowmoth: "She lights the way for the lost, and eats the lights of those who lie. Two strong light moves in a row dim her.",
    dorrinHale: "Huge, cheerful, always chewing. He hits hard, and when he is hurt he eats.",
  });
  Q(Data.DROPS, {
    featherWyvern: [["wyvernScale", 0.4]], lanternBatKnight: [["lanternWick", 0.5]], ropeSpiderMaiden: [["spiderSilk", 0.4]], orchidDryad: [["orchidPetal", 0.45]], cloudRam: [["cloudWool", 0.45]], skyEel: [["eelGland", 0.4]],
    sporerootCrawler: [["gloomcapSpores", 0.2], ["caveChip", 0.3]], gloomMushroomShaman: [["gloomcapSpores", 0.25], ["trollCap", 0.2]], caveGargoyle: [["caveChip", 0.5]], fungusTroll: [["trollCap", 0.45]],
    drippingMimic: [["mimicTooth", 0.45], ["curio", 0.4]], plumedWatcher: [["watcherFeather", 0.4]], windhollowGuardian: [["legionCoin", 1]], plumedCoil: [["watcherFeather", 1]],
  });
  Q(Data.BREAKS, { windhollowGuardian: Data.BREAKS.windhollowGuardian, plumedCoil: Data.BREAKS.plumedCoil });

  // ---------- regions ----------
  Q(Rg, {
    featherfallCanopy: { n: "Featherfall Canopy", bg: RU, arena: "canopy", music: "canopy", table: "canopy", fields: true, overland: true,
      exits: [["greenmawJungle", "Down the cliff lift to the jungle road", yes], ["plumeRest", "West over the bridge to Plume Rest", yes], ["sporerootCaves", "Down a root-stair to the Sporeroot Caves", yes], ["windhollowAviary", "A cliff-top ruin with open cages", yes],
        ["lookoutChain", "A chain of stone watch posts", yes], ["canopySpire", "North to the Canopy Spire", s => s.f["ch4.s3"]], ["marigoldHollow", "The long stair down to Marigold Hollow", yes], ["waterfallCave", "A path behind the falls, marked with a feather", yes]],
      things: [["platformS2", "The first altar platform", s => s.f["ch4.start"] && !s.f["ch4.s2"], "trigger"], ["spireApproachS3", "The second altar platform", s => s.f["ch4.s2"] && !s.f["ch4.s3"], "trigger"],
        ["canopyChest1", "A chest in a fork of the great tree", s => !s.f["c.canopy1"], "chest"], ["canopyChest2", "A chest under the second bridge", s => !s.f["c.canopy2"], "chest"],
        ["featherMolt1", "A glade of molted feathers", s => !s.f["g.molt1"], "gather"], ["featherMolt2", "More molted feathers on a branch", s => !s.f["g.molt2"], "gather"]], autos: ["canopyArrive"] },
    plumeRest: { n: "Plume Rest", bg: RU, arena: "canopy", music: "treetopTown", town: "plumeRest", inn: "plumeRest",
      npcs: [["innkeeper", "The Soft Nest"], ["merchant", "Weaver's stall"], ["yaxa", "Mother Yaxa"], ["oldDunmar", "The Menagerie Wagon", s => s.f["wagon.at"] === "plumeRest"], ["r1", "A weaver"], ["r2", "An old man"], ["r3", "A child with a kite-string"], ["weaver", "A weaver with a bare lamp-frame", s => !(s.q.lanterns === "done")]],
      exits: [["featherfallCanopy", "West across the bridge to the canopy", yes]], things: [["riverBarge", "The lower dock, where the barge waits", s => s.f["ch4.done"], "trigger"]], autos: ["plumeArrive", "plumeLetter"] },
    sporerootCaves: { n: "Sporeroot Caves", bg: RU, arena: "sporeCave", music: "sporeCave", table: "sporeCave", fields: true, dungeon: true,
      npcs: [["caveTablet", "A tablet in the wall"]], exits: [["featherfallCanopy", "Back up to the canopy", yes]],
      things: [["gloomcapSpores1", "A bed of grey spores", s => !s.f["g.spore1"], "gather"], ["gloomcapSpores2", "Spores along the wall", s => !s.f["g.spore2"], "gather"], ["gloomcapSpores3", "A pulsing cluster", s => !s.f["g.spore3"], "gather"], ["g15_marshWitchRegrowth", "A chest at the end of the cave", s => true, "chest"]], autos: ["sporeIntro"] },
    windhollowAviary: { n: "Windhollow Aviary", bg: RU, arena: "aviary", music: "aviary", table: "aviary", fields: true, dungeon: true,
      npcs: [["aviaryGhost", "A carved perch with writing on it"]], exits: [["featherfallCanopy", "Back to the canopy", yes]],
      things: [["wheel1", "The first wind-wheel", s => !s.f["av.wheel1"], "trigger"], ["wheel2", "The second wind-wheel", s => s.f["av.wheel1"] && !s.f["av.wheel2"], "trigger"], ["wheel3", "The third wind-wheel", s => s.f["av.wheel2"] && !s.f["av.wheel3"], "trigger"],
        ["aviaryGuardian", "The cage stair, and what sits above it", s => s.f["av.wheel3"] && !s.f["k2.done"], "trigger"], ["g10_snatchersPlumage", "A chest on a perch", s => s.f["k2.done"], "chest"]] },
    lookoutChain: { n: "Lookout Chain", bg: RU, arena: "lookout", music: "canopy", table: "lookout", fields: true, dungeon: true,
      npcs: [["tribuneTable", "The tribune's table"]], exits: [["featherfallCanopy", "Back to the canopy", yes]],
      things: [["lookoutPost1", "The first watch post", s => !s.f["lookout.post1"], "trigger"], ["lookoutPost2", "The second watch post", s => s.f["lookout.post1"] && !s.f["lookout.post2"], "trigger"], ["lookoutPost3", "The last watch post", s => s.f["lookout.post2"] && !s.f["lookout.post3"], "trigger"],
        ["g8_condorTowerWatch", "A chest at the last post", s => s.f["lookout.post3"], "chest"]] },
    canopySpire: { n: "The Canopy Spire", bg: RU, arena: "spire", music: "canopy", table: "spire", fields: true, dungeon: true,
      exits: [["featherfallCanopy", "Back down the spiral to the canopy", yes]], things: [["spireChest", "A chest in a nest, mid-climb", s => !s.f["c.spire"], "chest"], ["spireTop", "The great perch at the top", s => !s.f["ch4.coil"], "trigger"]] },
    marigoldHollow: { n: "Marigold Hollow", bg: RU, arena: "jungle", music: "marigold", town: "marigoldHollow", inn: "marigoldHollow",
      npcs: [["innkeeper", "The Gate and Gourd"], ["merchant", "A stall"], ["tamoc", "Old Tamoc"], ["neeli", "Neeli, who keeps the well"], ["r1", "A farmer"], ["r2", "An old woman"], ["r3", "A child"]],
      exits: [["featherfallCanopy", "Up the long stair to the canopy", yes], ["imelasHouse", "The west house with the closed door", s => s.f["ch4.yaxa"]]], things: [["wellStone", "The flat stone beside the well", yes, "trigger"]], autos: ["marigoldArrive", "wellDuel"] },
    imelasHouse: { n: "Imela's house", bg: RU, arena: "jungle", music: "letters", noFerry: true,
      npcs: [["letter1", "The kitchen table"], ["letter2", "The loom basket"], ["letter3", "The notice on the door"], ["letter4", "The cradle"], ["cup", "A cup on the table"], ["loom", "The half-woven cloth"]],
      exits: [["marigoldHollow", "Out into the Hollow", yes], ["imelasCellar", "The trapdoor behind the pantry shelf", s => (s.f["ch4.letters"] || 0) >= 4]], autos: ["houseFirst"] },
    imelasCellar: { n: "Imela's cellar", bg: RU, arena: "jungle", music: "letters", noFerry: true, exits: [["imelasHouse", "Up the ladder", yes]],
      things: [["g9_obsidianTalonSkirmisher", "A low chest", yes, "chest"], ["featherBlanket", "A hidden alcove", s => !s.f["g.blanket"], "gather"]] },
    waterfallCave: { n: "Behind the Waterfall", bg: RU, arena: "jungle", music: "canopy", noFerry: true,
      npcs: [["firstHarvestTablet", "The tablet wall"]], exits: [["featherfallCanopy", "Out through the falls", yes]], things: [["waterfallChest", "A chest in the spray", s => !s.f["c.waterfall"], "chest"]] },
  });

  // ---------- banter for chapter 4 (nine packs, three lines each, in pack order: vanguard sprint venom tempest ironward breakers bastion wildfire dawn) ----------
  const B = M.banter;
  B("canopy", [   // rope bridges, mist, the Spire far off
    ["Bridges! Rope bridges! I am going to run across every single one!", "Slowly, young bull. A rope is only as brave as its knots.", "Hold the rail, dear. Do not look down. Look at me."],
    ["No ground anywhere. Nowhere to run but up. ...I do not like that.", "Finally, a place for wings. Try to keep up, ground-dwellers.", "How do they weave bridges that high? Who holds the other end? Is it a bird?"],
    ["Ha. Mist, rope and a long way down. Cheerful.", "...The trees are listening.", "Is it safe to walk on? If that's all right to ask? I will go first if it is not."],
    ["Hah! A town in the sky! I could live here, if nobody checked my pockets.", "Can I fly up? Can I? Is that the Spire? Is it as tall as it looks? Can I touch it?!", "Stay on the planks. Stay close. The fall is long."],
    ["Bridges. Hm. Narrow.", "Of course. A road made of string. Why not.", "What is a bridge that holds no weight? Ask me when we are across."],
    ["Is there food in the tree-village? There has to be food in the tree-village!", "We are in the clouds, we are in the clouds, I knew it was up here!", "Did you know the weavers hear every secret in the canopy? It comes up through the feathers."],
    ["A delicate road. Thank you, planks, for holding us.", "Walk lightly. A bridge forgives the careful.", "...Slowly... the mist is thick enough to lean on."],
    ["Rope. Dry wood. Lanterns. I am not looking at the lanterns. Nobody ask.", "Hee. A bridge made of string. What happens if I... no. No, I will not.", "Is the mist wet? Does it taste like anything? Is there bread up here?"],
    ["What a kind, tall place. May the bridges hold us.", "The mist is soft. I will glow quietly so we do not frighten the birds.", "...The cloud is a slow tide. Walk."],
  ]);
  B("coil", [     // after the Plumed Coil: it closed its eyes on the perch
    ["It was so big. And it looked at us. Why did it look at us like that?", "A guardian is not a beast, young bull. Remember its eyes.", "Come here, dear. All of you. Let me look at you, one by one."],
    ["Hm. At the end it did not try to kill us. It tried to stay up.", "How very undignified. Beaten, and still more graceful than the rest of us.", "What was it holding up? Is it holding something? Why did the sky go quiet?"],
    ["Ha. We beat it. Why do I feel I lost something.", "...It was a warden. It was keeping watch.", "Is it all right? Is it hurt? I hope we did not hurt it more than we had to."],
    ["Hah! ...No. No hah. It closed its eyes, and I do not feel like hahing.", "Is it sleeping? It is sleeping, isn't it? Will it wake?!", "I have beaten many things. I do not remember one that bowed."],
    ["Hm. Done.", "Of course. It did not want to fight. We did anyway. Why not.", "Whose cage was it meant for? Ask whoever ordered the cage."],
    ["That serpent had better manners than most nobles. I liked it.", "We did it, we did it, we did it, ...and I feel strange. Don't you?", "Did you read the tribune's orders? 'To be taken alive.' Interesting. Who wants a sky alive in a cage?"],
    ["A great creature, and a great weariness. Thank you, old one.", "Rest now. The sky will hold itself a while.", "...Slowly... it was not angry. It was tired."],
    ["For the record, I did not light the feathers. They were already lit. Mostly.", "Hee... no. It closed its eyes. No hee.", "It did not eat us. Why did it not eat us?"],
    ["It held the sky with great patience. May it rest.", "I will glow a little over it while it sleeps.", "...The tide of the air turns now. Thank you, old one."],
  ]);
  B("house", [    // Imela's house in Marigold Hollow
    ["It smells like bread. Why does it smell like bread, if nobody lives here?", "A house kept clean for nineteen years. That is not dust. That is love, young bull.", "Wipe your boots, dear. Please. She would have wanted that."],
    ["...Small rooms. A window open. No bars. I like it.", "A cradle. Of course there is a cradle. Why must it be a cradle.", "Whose house is it? Why does the hero stand so still? What is on the table?"],
    ["Ha. A cup still on the table. Cold. Left in the middle of a sentence.", "...A mother lived here. I can tell by the chair.", "Is it all right to touch things? We should not touch things, if that's all right."],
    ["Hah! ...No. No joke. Sit, kid. Sit.", "Can we stay a while? Can we? Is it okay to be quiet?", "A woman waited here. Not for us. We came anyway."],
    ["Hm. Home.", "A tidy little prison with the door left open. Beautiful.", "A loom with half a cloth. A thread in the needle. She meant to come back."],
    ["There is no food in the pantry and I still smell soup. I should be sad.", "I want to hug the whole house, I want to hug the whole house!", "Did you know the ledgers keep a column for houses? Not for people. Houses."],
    ["Gentle hands lived here. Thank you, house, for keeping her things.", "A lamp left in the window. Someone wanted to be found.", "...Slowly... hold the little one's hand. Nap later."],
    ["I am not going to set anything on fire. Look at me not doing it.", "Hee... no. Not here. Not this one.", "Is there bread? ...No. Never mind. I was not hungry."],
    ["A house with the window open. I knew someone had left it a light.", "I will glow low, so I do not wake her memory.", "...The tide keeps going back to one shore. This was his."],
  ]);

  // ======================================================================================================================================
  // CHAPTER 4 BEATS
  // ======================================================================================================================================
  const PR = "plumeRest", MH = "marigoldHollow";
  const titled = F => { if (!F.f("ch4.titled")) { F.set("ch4.titled"); G.ch = Math.max(G.ch, 4); F.set("wagon.at", PR); return true; } return false; };
  // 4.0 start. dbg.jump(4) and the cliff path both end up in canopyArrive; begin[4] is the same intro as a standalone call.
  S.begin[4] = async F => { if (titled(F)) await Cinema.title("Chapter 4", "The Plumed Coil"); F.set("ch4.start"); F.autoSave = true; F.go("featherfallCanopy", "from_greenmawJungle"); };
  S.start[4] = { region: "featherfallCanopy", entry: "from_greenmawJungle" };
  S.trigger.canopyArrive = async F => {
    if (titled(F)) { F.music("canopy"); await Cinema.title("Chapter 4", "The Plumed Coil"); }
    if (!M.once(F, "cn.seen")) return;
    F.set("ch4.start"); F.music("canopy");
    await M.stage(async c => {
      const h = c.hero; c.tint("#c8d8d0", 0.14, 500); c.fx("leaves", h.x, h.y - 60);
      await c.pan(h.x, h.y - 120, 1800);
      await c.say([["narr", "The lift rises through the mist. Light breaks over rope bridges that run from trunk to trunk, and platforms the size of barns, and hanging feather-charms that tick like rain. Far off, north, a dark bulk climbs out of the cloud: a tree grown hollow, the Spire."]]);
      c.follow(); await c.say([["hero", "(No road here. Only bridges.)"]]);
      c.tint("#c8d8d0", 0, 700);
    }, { music: "canopy" });
    await F.banter("canopy");
    F.quest("m_canopy", 0);
  };
  S.chest.canopyChest1 = M.loot("c.canopy1", [["sunwater", 3]], 200, "A chest wedged in a fork of the great tree. Three Sunwater Flasks and a bag of coin, dry in spite of the mist.");
  S.chest.canopyChest2 = M.loot("c.canopy2", [["tonic", 2]], 0, "Under the second bridge, lashed to a beam with feather-cord: a small hidden chest with two Clearwater Tonics inside.");
  S.gather.featherMolt1 = M.mat("g.molt1", "galeDown", 5, "A branch where something has moulted. The down floats up out of your hands. Five Gale Down.", "Dampen Wing");
  S.gather.featherMolt2 = M.mat("g.molt2", "galeDown", 5, "A cloud of down caught in a bridge-rope. Five more Gale Down.", "Dampen Wing");

  // 4.B Plume Rest
  S.trigger.plumeArrive = async F => {
    if (!M.once(F, "pl.seen")) return;
    titled(F); F.music("treetopTown"); F.questDone("m_canopy"); F.quest("m_spire", 0);
    await M.stage(async c => {
      const h = c.hero;
      [["w1", "npcWeaver", -150, -40], ["w2", "npcWeaver", 160, 10], ["w3", "npcWeaver", 20, 70]].forEach(([id, art, dx, dy]) => c.actor(id, { art, x: h.x + dx, y: h.y + dy, flip: dx > 0 }));
      await c.say([["narr", "Looms hang from every platform, and at each loom a weaver looks up. The dyed feathers on their lines stir, all in the same direction, toward you."]]);
      const y = rel(c, 120, -10); c.actor("yaxa", { art: "npcYaxa", x: y.x, y: y.y, name: "Mother Yaxa", flip: true });
      await c.say([["yaxa", "Hush. The feathers listen."]]);
      ["w1", "w2", "w3", "yaxa"].forEach(id => c.remove(id));
      const d = rel(c, -170, 30); c.actor("dun", { art: "npcDunmar", x: d.x, y: d.y, name: "Dunmar" });
      await c.say([["dunmar", "Lad. Quillshade's cage has a lock I do not like the look of. Bring me the key from the Windhollow, whenever you feel like it. The cliff-top ruin with the open cages, at the far east edge of the canopy."]]);
      c.remove("dun");
    }, { music: "treetopTown" });
    F.quest("m_windhollow", 0); UI.toast("The Menagerie Wagon is here.");
  };
  T(PR).oldDunmar = M.dunmar;
  M.town(PR, {
    inn: PR, innLine: "The Soft Nest. Beds of down, quiet floors. If you must sneeze, do it into a pillow; the feathers will not forgive you.", shop: "plume", shopLine: "Rope, tea, cloth, and the weaver's good clay. All of it woven or wrapped by a family.",
    beforeShop: F => M.backup(F, "bought.gale", "galeDown", 10, 420, "Ten bundles of Gale Down, combed and sorted by the weavers, for a weaver's price."),
    who: ["weaver", "oldman", "kiteChild"],
    small: [["Nothing leaves this village that the feathers did not already say. Mind your tongue.", "A feather's colour is its voice. Red is for warning. White is for 'come'. Brown is for 'be quiet'."], ["I have lived on this platform for sixty years. I have never touched the ground. I do not intend to.", "The Spire eats the sky at night. Do not stand under it."], ["Look! It goes up when I run. It goes up when I run!", "Do you have a kite? Everybody has a kite. Why do you not have a kite?"]],
  });
  // the third and fourth rumour (style clues) are told by the child with the kite-string once the first has been heard
  T(PR).r3 = async F => {
    const seen = (G.rumours[PR] = G.rumours[PR] || []);
    for (const k of [3, 4]) if (!seen.includes(k) && Data.RUMOURS[PR][k]) { await S.rumourIdx(F, PR, k, "kiteChild"); return; }
    await UI.say([["kiteChild", M.cycle("kc.n", ["Look! It goes up when I run. It goes up when I run!", "Do you have a kite? Everybody has a kite. Why do you not have a kite?"])]]);
  };
  T(PR).yaxa = async F => {
    if (!F.f("ch4.yaxa")) {
      F.set("ch4.yaxa");
      await UI.say([["yaxa", "Hold still. Hold still, child. That strap."], ["narr", "She turns the satchel strap in her old hands, tracing the stitching with a thumb."],
        ["yaxa", "Who sewed that? That is the Marigold feather stitch. Only three families still do it, in the Hollow, down the long stair."], ["hero", "(The strap was packed before I woke. The thread looked old.)"]]);
      await S.rumourIdx(F, PR, 2, "yaxa");
      F.quest("m_letters", 0); return;
    }
    if (F.f("ch4.coil")) { await UI.say([["yaxa", "The feathers have been quiet since the Spire. A good quiet. They are not afraid, only listening to something very far."]]); return; }
    await UI.say([["yaxa", M.cycle("yx.n", ["The Hollow is down the long stair. The stair is long. The path is shorter than it looks.", "Hush. Walk softly on our bridges. Quiet people are heard farthest.", "A weaver knows a thread by the hand that made it. Yours was made by a careful hand."])]]);
  };
  T(PR).weaver = async F => {
    const st = F.qstep("lanterns"), wicks = () => G.goods.lanternWick || 0;
    if (st === "done") { await UI.say([["weaver", "The lamps burn gold at night, all along the bridge. You can see them from the Spire."]]); return; }
    if (st === undefined) { await UI.say([["weaver", "The lanterns on the west bridge have gone out, every one. Bat knights stole the wicks; they like the taste of the lamp-oil. Four wicks, from the knights out on the canopy bridges beyond the village gate, and I will pay you."]]); F.quest("lanterns", 0); return; }
    if (wicks() >= 4) {
      G.goods.lanternWick -= 4;
      await UI.say([["weaver", "Four good wicks. Singed at the ends, the way a knight chews them. Thank you. The bridge will be gold again tonight."]]);
      F.gold(200); F.give("tonic", 2); F.questDone("lanterns"); F.sfx("coin");
    } else await UI.say([["weaver", `${wicks()} of 4 wicks. Lantern Bat Knights, on the canopy bridges. They glow before you see them.`]]);
  };
  S.trigger.plumeLetter = async F => {
    if (!F.f("ch4.coil") || F.f("ch4.done")) return;
    F.music("letters");
    await M.stage(async c => {
      const p = M.rel(c, 190, -6); c.actor("co", { art: "npcCourier", x: p.x, y: p.y, name: "Courier", flip: true });
      await c.wait(300); await c.walk("co", c.hero.x + 36, c.hero.y, 1200); c.sfx("paper");
      await c.say([["narr", "A courier in a grey hood stands at the end of the weavers' bridge. He puts a letter and a small object in your hand, and is gone down the rope lift before you can ask."]]);
      c.sfx("whoosh"); await c.walk("co", p.x + 80, p.y + 40, 700); c.remove("co");
    }, { music: "letters" });
    await F.letter("the green seal", ["\"The Plumed Coil. Exactly as I hoped.\"", "\"You have done more than I asked. Now there is something I must explain, and I will not do it by letter. Return to Sehkarem. Captain Brisk will meet you at Tamar's Landing at the next tide. Do not delay. The pass enclosed will take you through any door in Orun. - I.\""]);
    F.give("ithielPass", 1); F.set("ch4.done"); F.set("wagon.at", PR);
    await UI.say([["hero", "(Orun is held by the empire. And a pass from Ithiel opens every door.)"], ["hero", "(Mother. Alive. The capital. First, Orun. Then her.)"]]);
    UI.toast("The barge at Plume Rest's lower dock will take you back down the river.", 3600); F.save(true);
  };
  S.trigger.riverBarge = async F => {
    if (!F.f("ch4.done")) return;
    await M.talkPanels("assets/cinema/m2_barge.png", [["narr", "Down the river on a feather-weavers' barge. Lamp-moths lean out over the water, and Plume Rest shrinks into the canopy until it is only a lantern in a tree."]], { music: "voyage" });
    F.go("tamarsLanding", "from_shore");
  };
  S.trigger.boatToSehkarem = async F => {
    if (!F.f("ch4.done")) { await UI.say([["captain", "Not yet, friend. The tide is for someone else."]]); return; }
    await UI.say([["captain", "Back to Sehkarem, friend? Same price, same silence."]]);
    const i = await F.ask("Board Brisk's boat back across the Weeping Sea? The jungle will be days behind you.", [{ label: "Board now" }, { label: "Not yet, I have things to finish" }]);
    if (i !== 0) return;
    F.save(true);
    if (S.begin && S.begin[5]) { await S.begin[5](F); return; }
    await UI.card({ image: "assets/title.png", big: "To be continued", text: "in Chapter 5. Your game has been saved.", delay: 800 }); F.save(true);
  };
  S.done.boatToSehkarem = () => false;

  // 4.C Sporeroot Caves, Lookout Chain, Windhollow Aviary (K2)
  S.trigger.sporeIntro = async F => {
    if (!M.once(F, "sp.seen")) return;
    F.music("sporeCave");
    await UI.say([["narr", "Below the canopy the air is cool and tastes of earth. Grey fungus climbs the walls, and it glows, and the glow dims, and slowly brightens, and dims. The whole cave breathes at the pace of a sleeping animal."], ["hero", "(Everything down here is slow.)"]]);
    await F.idleBanter();
  };
  T("sporerootCaves").caveTablet = async F => {
    await UI.say([["narr", "A flat tablet, carved in a clerk's hand and not a builder's: \"Season 3, Sporeroot galleries. Sixty harvested, forty-four delivered. The remainder were cave-fast. Loss within tolerance. The Company thanks the caves.\""]]);
    if (M.once(F, "lore.sporeTally")) await UI.say([["hero", "(Cave-fast. As if the caves had kept them.)"]]);
  };
  S.gather.gloomcapSpores1 = M.mat("g.spore1", "gloomcapSpores", 4, "A bed of grey spores, glowing when you hold your breath. You scoop four portions into a glass-sand vial.", "Spore Cloud");
  S.gather.gloomcapSpores2 = M.mat("g.spore2", "gloomcapSpores", 4, "Spores gather along the wall like frost. Four more portions.", "Spore Cloud");
  S.gather.gloomcapSpores3 = M.mat("g.spore3", "gloomcapSpores", 4, "A cluster that pulses with the cave's slow breath. You wait for the dark beat, then take four portions.", "Spore Cloud");
  S.chest.g15_marshWitchRegrowth = async F => S.gearChest2(F, "g15_marshWitchRegrowth", "G15");

  [1, 2, 3].forEach(n => {
    S.done["lookoutPost" + n] = F => F.f("lookout.post" + n);
    S.trigger["lookoutPost" + n] = async F => {
      if (F.f("lookout.post" + n)) return;
      F.music("canopy");
      await M.stage(async c => {
        const h = c.hero; c.tint("#183024", 0.14, 300);
        [["mk1", 190, -40], ["mk2", 230, 30]].forEach(([id, dx, dy]) => c.actor(id, { art: "npcMarksman", x: h.x + dx, y: h.y + dy, flip: true }));
        c.actor("op", { art: "npcOptio", x: h.x + 270, y: h.y - 4, flip: true });
        await c.pan(h.x + 120, h.y - 10, 700); c.emote("mk1", "!");
        await c.say([["narr", ["The first watch post: a stone platform on a chain of rope bridges, a signal fire laid and not lit, and two marksmen in feather cloaks who have already drawn.", "The second post. Arrows come before the bridge does.", "The last post. The marksmen have lashed their bows to the rail and they do not look afraid. They look like men who have decided something."][n - 1]]]);
        c.sfx("arrowShot"); c.fx("dust", h.x + 40, h.y + 6, { ms: 600, r: 20 }); c.shake(2, 300); await c.anim("hero", "shake"); c.follow(); c.tint("#183024", 0, 300);
        ["mk1", "mk2", "op"].forEach(id => c.remove(id));
      }, { music: "tension" });
      const res = await F.fight([F.mkEnemy("legionMarksman", 18, " A"), F.mkEnemy("legionMarksman", 18 + (n > 1 ? 1 : 0), " B"), F.mkEnemy("legionOptio", 18, " C")], { bg: "lookout", intro: "Arrows hiss across the gap!", music: "battleSoldiers" });
      if (res !== "win") return;
      F.set("lookout.post" + n); F.sfx("fire");
      await M.stage(async c => {
        const p = M.rel(c, 90, -10); c.fx("fire", p.x, p.y, { ms: 3200, r: 40 }); c.fx("smoke", p.x, p.y - 30, { ms: 4200, r: 40 }); c.light(p.x, p.y - 20, 150, 0.9);
        await c.pan(p.x, p.y - 60, 700); await c.wait(500);
        await c.say([["narr", n < 3 ? "You light the signal fire with the marksmen's own flint. The smoke goes up straight, and the next post goes quiet." : "You light the last signal fire. The smoke goes up in a straight line, and the whole chain of posts is yours. At the end of the bridge, a chest."]]);
        c.follow();
      });
    };
  });
  S.chest.g8_condorTowerWatch = async F => { if (!F.f("lookout.post3")) { await UI.say([["narr", "The chest is chained to the last post, and the last post is not yours yet."]]); return false; } return S.gearChest2(F, "g8_condorTowerWatch", "G8"); };
  T("lookoutChain").tribuneTable = async F => {
    await UI.say([["narr", "A folding table, a lamp, a wax tablet pinned under a stone: \"Plumed Coil: to be taken alive. Cage readied at the Spire. By the authority of the Throne. It is entered in the ledger.\""]]);
    if (M.once(F, "lore.tribuneOrders")) await UI.say([["hero", "(They want it alive. A cage for a sky-serpent. Who builds that?)"]]);
  };

  T("windhollowAviary").aviaryGhost = async F => {
    await UI.say([["narr", "A carved perch, worn smooth by claws. Chiselled under it, in the builders' short hand: \"We kept the winged ones here. They came back every night, until they did not.\""]]);
  };
  const WHEEL = ["A wind-wheel on a stone axle, half-buried in feathers. You lean on it. It turns, and somewhere across the gap a vent in the floor opens with a sound like a long breath in.", "The second wheel is stiffer. When it turns, warm air roars up out of the rock and carries the loose feathers into the roof.", "The third wheel is rusted to its axle. It takes your whole weight. Behind the far perch, a stone stair unfolds out of the wall, down to a cage the size of a house."];
  [1, 2, 3].forEach(n => {
    S.trigger["wheel" + n] = async F => {
      if (F.f("av.wheel" + n)) return;
      F.set("av.wheel" + n);
      await M.gate([["narr", WHEEL[n - 1]]], n === 3 ? { dx: 190, dy: -20, fx: "dust", fx2: "feathers", shake: 3 } : { dx: 150, fx: n === 2 ? "feathers" : "dust", sfx: n === 2 ? "gust" : "stoneGrind", shake: 1 });
    };
  });
  S.done.aviaryGuardian = F => F.f("k2.done");
  S.trigger.aviaryGuardian = async F => {
    if (F.f("k2.done")) return;
    if (!F.f("av.wheel3")) { await UI.say([["narr", "The cage stair is folded flat against the wall. Whatever sleeps at its foot can wait for the wheels."]]); return; }
    F.music("aviary");
    await Cinema.boss({ id: "windhollowGuardian", name: "The Windhollow Guardian", title: "Keeper of the Aviary", bg: "aviary", music: "guardian", lines: [["narr", "A carved roc of stone and rusted feathers unfolds from the roof."]] });
    const res = await F.boss([F.mkEnemy("windhollowGuardian", 19)], { bg: "aviary", music: "guardian", intro: "The stone bird spreads its wings!" });
    if (res !== "win") return;
    F.set("k2.done"); F.give("keyK2", 1);
    await M.outro("windhollowGuardian", [["narr", "The roc folds in on itself, feather by feather, and settles on its perch as stone again. From the hook at its throat hangs a key of grey feather-stone. A chest has opened in the perch behind it."], ["hero", "(The wagon has a lock this key fits. Dunmar will know which.)"]], { fx: "feathers", end: "fade", dx: 150 });
  };
  S.chest.g10_snatchersPlumage = async F => { if (!F.f("k2.done")) { await UI.say([["narr", "A chest on a high perch, caged in stone feathers. The guardian's shadow lies across it."]]); return false; } return S.gearChest2(F, "g10_snatchersPlumage", "G10"); };

  // 4.D the altar platforms: S2 and S3
  S.done.platformS2 = F => F.f("ch4.s2"); S.done.spireApproachS3 = F => F.f("ch4.s3");
  S.trigger.platformS2 = async F => {
    if (F.f("ch4.s2")) return;
    F.music("canopy");
    const ok = await S.generalScene(F, 2, {
      level: 18, soldiers: [["legionMarksman", 17, " B"]], bg: "canopy", title: "General of the Legions", place: "the first altar platform", where: "It crossed a rope bridge, and the mist took it.", fx: 120, fy: -10,
      setup: async c => {
        const h = c.hero; c.tint("#183024", 0.2, 400); await c.pan(h.x + 160, h.y - 20, 900);
        await c.say([["narr", "A platform of lashed beams hung in the mist. An altar of black stone with an obsidian ring and a chain. Soldiers kneel along the rope bridges around it, bows across their knees, and none of them looks up. At the end of the chain, something stands."]]);
        c.shake(2, 500); c.sfx("hitHeavy"); await c.wait(400); c.follow(); c.tint("#183024", 0, 500);
      },
      after: ["(Another altar. How many are there?)"],
    });
    if (ok) F.set("ch4.s2");
  };
  S.trigger.spireApproachS3 = async F => {
    if (F.f("ch4.s3") || !F.f("ch4.s2")) return;
    F.music("canopy");
    const ok = await S.generalScene(F, 3, {
      level: 20, soldiers: [["legionMarksman", 18, " B"], ["legionMarksman", 18, " C"]], bg: "canopy", title: "General of the Legions", place: "the second altar platform", where: "It went north along the last bridge, into the Spire's shadow.", fx: 120, fy: -10,
      setup: async c => {
        const h = c.hero; c.tint("#10201c", 0.25, 400); await c.pan(h.x + 160, h.y - 20, 900);
        await c.say([["narr", "The last bridge before the Spire. Its altar is older than the others: the black stone has a groove worn in it by a chain that has been tightened and loosened many times. Above, the Spire climbs into the cloud, and something up there is watching."]]);
        c.shake(2, 500); c.sfx("hitHeavy"); await c.wait(400); c.follow(); c.tint("#10201c", 0, 500);
      },
      after: ["(Two altars, two creatures. The road to the Spire is clear. It does not feel clear.)"],
    });
    if (!ok) return;
    F.set("ch4.s3"); UI.toast("The path to the Canopy Spire is open.", 3000);
  };

  // 4.E Marigold Hollow, the house, the letters, the cellar, the stone by the well
  S.trigger.marigoldArrive = async F => {
    if (!M.once(F, "mh.seen")) return;
    F.music("marigold");
    await M.stage(async c => {
      const h = c.hero; c.tint("#e0a050", 0.1, 500);
      c.actor("neeli", { art: "npcNeeli", x: h.x + 150, y: h.y + 20, name: "Neeli", flip: true });
      c.actor("tamoc", { art: "npcTamoc", x: h.x + 260, y: h.y - 40, name: "Old Tamoc", flip: true });
      await c.say([["narr", "Down the long stair, into a valley the colour of honey. Marigolds grow in orange rows to the edge of the hills, and the wind lifts the smell of them to meet you. Whitewashed houses. A stone well with a flat stone beside it. Hens."]]);
      await c.walk("neeli", h.x + 90, h.y + 10, 700);
      await c.say([["neeli", "The Hollow does not get strangers."], ["hero", "(I have seen this stitching on a strap. I have never seen this valley.)"]]);
      await c.walk("tamoc", h.x + 130, h.y - 20, 1200);
      await c.say([["tamoc", "Imela's house still stands. We keep it dry. She went to the capital as a bride, they say. Not by choice."]]);
      c.emote("tamoc", "..."); await c.wait(900);
      c.remove("neeli"); c.remove("tamoc"); c.tint("#e0a050", 0, 700);
    }, { music: "marigold" });
    await UI.say([["narr", "You stand very still. A hen walks past your boots and does not care."]]);
  };
  M.town(MH, {
    inn: MH, innLine: "The Gate and Gourd. Gourd soup, a clean bed, and a gate that does not lock. We have nothing to lock it against.", shop: "marigold", shopLine: "Basics. Nothing fancy. A valley does not need fancy.",
    who: ["farmer", "oldwoman", "child"],
    small: [["Marigolds do not mind the shade. They mind being ignored.", "The stair is long on purpose. It keeps the road away."], ["I do not talk about the house. I leave a lamp in the window on the day she left. That is not talking.", "The strangers come. The strangers go. The stone remains."], ["Do you want to see a very small frog? He is under the bucket.", "Neeli says you are not allowed in the well. I was in the well once."]],
  });
  T(MH).tamoc = async F => {
    if (F.f("ch4.cellar")) { await UI.say([["tamoc", "I buried nothing in that cellar. I only kept the door shut. Do you understand? ...Good."]]); return; }
    await UI.say([["tamoc", M.cycle("tm.n", ["Imela's house still stands. We keep it dry. A door is not a grave.", "The marigolds were her mother's. Or her mother's mother's. Nobody counts. It is rude to count.", "You walk like someone who is listening for a second pair of boots. Do not. It is only us."])]]);
  };
  T(MH).neeli = async F => {
    const n = G.flags["well.n"] || 0;
    if (n >= 3) { await UI.say([["neeli", "There is nothing under the stone now. I check every morning. Old habit."]]); return; }
    if (n === 0 && !F.qstep("wellStone")) { await UI.say([["neeli", "I keep the well. I keep what is under the stone, too, when it is dry enough to keep. Look at the flat stone, if you like. Strangers have always left things there."]]); return; }
    await UI.say([["neeli", "The stone is yours to lift. I only keep it dry. Letters come when they come."]]);
  };
  const WELL = [["wellLetter1", "\"I passed the Hollow at dusk. The house is dark. If you live, Imela, this stone is where I leave word. The sky is not what they told us.\""],
    ["wellLetter2", "\"Ten years. I keep a count. The count is short. I am sorry for everything but the leaving.\""], ["wellLetter3", "\"I asked after the boy at Orun. They say he is well and does not ask about his father. That is the kindest lie anyone has told me.\""]];
  S.trigger.wellStone = async F => {
    const n = G.flags["well.n"] || 0; F.visit = F.visit || {};
    if (n >= 3) { await UI.say([["narr", "The flat stone beside the well. Nothing under it now but a dry hollow in the shape of a folded paper."]]); return; }
    if (F.visit.well) { await UI.say([["narr", "You lift the flat stone again. Nothing new has come since you looked."]]); return; }
    F.visit.well = true; G.flags["well.n"] = n + 1; F.quest("wellStone", 0);
    const [item, text] = WELL[n]; F.give(item, 1, true); F.sfx("menuOk");
    await UI.say([["narr", "Under the flat stone, wrapped in oilcloth and dry as bread, a folded paper in a careful hand. You read it where you stand."], ["narr", text], ["narr", "It is signed with a drawn feather inside a star."]]);
    if (n === 2) {
      F.questDone("wellStone");
      await UI.say([["hero", "(Orun. Someone at Orun told him I was well. Who answers a stranger's letter at Orun?)"]]);
    } else await UI.say([["hero", ["(A feather inside a star. The stitch on my strap is the same bird, sewn slower.)", "(A count. Ten years of it. A short count.)"][n]]]);
  };
  S.trigger.houseFirst = async F => {
    if (!M.once(F, "hs.seen")) return;
    F.music("letters"); F.quest("m_letters", 1);
    await Cinema.panels([{ img: "assets/cinema/m2_house_memory.png", text: "A cup still on the table. A cradle by the window. Somebody was here, a long time ago, and put the lamp on to wait.", pan: "inleft" }], { music: "letters" });
    await UI.say([["hero", "(Nineteen years.)"]]);
    await F.banter("house");
  };
  const LETTER = [
    "\"Tala, the wanderer has stayed the whole summer. He mends the fence, the roof and the loom, and answers nothing I ask him. He has a mark on his wrist, a feather inside a star. He says it is a family habit. I do not believe a word and I do not mind. Tell Mother I am well.\"",
    "\"You left before the cock crowed and took nothing but the lamp. The baby has your chin. He is loud. He laughs when the lamp is lit. Where do I send word? You never say. Come back, or do not, but let me tell you his name.\"",
    "\"TZAKAL HARVESTING COMPANY, Marigold Hollow, Lot 1. By the authority of the Founder: the woman Imela, herb-wife, is summoned to the Company's service at the capital. The household is not to be disturbed. The ledger will be balanced.\"",
    "\"To whoever carries him: he is eight months and eats everything. Take him far. The Company counts houses, not cradles. Do not let anyone see his face until he is old enough to hide it himself. I will pay whatever it costs. I am not going to be able to.\"",
  ];
  const WHERE = ["On the kitchen table, under a cold cup, a letter to a sister. It was never folded.", "In the loom basket, under half-wound wool: a letter with no name on the outside.", "Nailed to the door with a Company stamp, grown soft with nineteen years of weather.", "In the cradle, under a folded blanket, a note written fast, in pencil."];
  [1, 2, 3, 4].forEach(n => {
    T("imelasHouse")["letter" + n] = async F => {
      await UI.say([["narr", WHERE[n - 1]], ["narr", LETTER[n - 1]]]);
      if (!F.f("ch4.letter." + n)) {
        F.set("ch4.letter." + n); F.give("imelaLetter" + n, 1, true);
        const count = [1, 2, 3, 4].filter(k => F.f("ch4.letter." + k)).length; F.set("ch4.letters", count);
        if (count === 4) {
          await UI.say([["hero", "(She sent me away so I would not be counted.)"]]);
          await M.stage(async c => { c.sfx("door"); c.shake(1, 500); await c.wait(500); await c.say([["narr", "Behind the pantry shelf, a trapdoor creaks. Nobody touched it. The house has shifted its weight."]]); });
        } else if (n === 4 || n === 2) await UI.say([["hero", n === 4 ? "(She wrote it in pencil. She expected to be interrupted.)" : "(I have never once slept with the lamp out.)"]]);
      }
    };
  });
  T("imelasHouse").cradle = T("imelasHouse").letter4;
  T("imelasHouse").cup = async F => { await UI.say([["narr", "A cup still on the table, a dry brown ring at the bottom. Whoever left it meant to come back before it cooled."]]); };
  T("imelasHouse").loom = async F => { await UI.say([["narr", "A loom with a half-woven cloth. The needle is still threaded, and the thread has the colour of old marigolds. You do not touch it."]]); };
  S.gather.featherBlanket = async F => {
    if (F.f("g.blanket")) return false; F.set("g.blanket"); F.set("ch4.cellar"); F.give("featherBlanket", 1, true); F.sfx("menuOk");
    await UI.say([["narr", "In a hidden alcove behind the herb jars, wrapped in dry cloth: a baby's blanket, soft with washing. In one corner, sewn with careful stitches, a feather inside a star."], ["hero", "(The mark on the strap. The mark on this. Whose is it?)"]]);
  };
  S.chest.g9_obsidianTalonSkirmisher = async F => S.gearChest2(F, "g9_obsidianTalonSkirmisher", "G9");

  // 4.F Kessa's second duel (forced when the hero comes up from the cellar)
  S.done.wellDuel = F => F.f("ch4.kessa2");
  S.trigger.wellDuel = async F => {
    if (!F.f("ch4.cellar") || F.f("ch4.kessa2")) return;
    F.music("tension");
    const KB2 = [["kessa", "npcKessa", 260, -40], ["dorrin", "npcDorrin", 300, 10], ["mayle", "npcMayle", 240, 40], ["emberwick", "emberwick", 330, -10]];
    await M.stage(async c => {
      const h = c.hero;
      KB2.forEach(([id, art, dx, dy]) => c.actor(id, { art, x: h.x + dx, y: h.y + dy, name: UI.PEOPLE[id] ? UI.PEOPLE[id].name : id, flip: true }));
      await c.pan(h.x + 130, h.y, 900); c.emote("kessa", "!");
      await c.say([["narr", "Daylight. A stone well. Three figures round it and a small flame-maned cub on the flat stone."], ["kessa", "Found you again. The Corps has had a standing order on this house for nineteen years: if a boy ever comes home, bring him in."],
        ["mayle", "Page forty. It does not add up. Why would the Company wait nineteen years?"], ["kessa", "Because the Founder said so. Duel."]]);
      c.follow(); c.emote("emberwick", "?");
      await c.say([["kessa", "Not today, Emberwick. Go and sit."]]); await c.walk("emberwick", h.x + 460, h.y - 40, 1200); c.remove("emberwick");
    }, { music: "tension" });
    await Cinema.boss({ id: "kessaVorn", name: "Kessa Vorn", title: "Tamer Corps", bg: "jungle", music: "general", lines: [["kessa", "Nineteen years. I am not waiting nineteen more."]] });
    const res = await F.boss([F.mkEnemy("kessaVorn", 19), F.mkEnemy("dorrinHale", 19, " B"), F.mkEnemy("mayleTarn", 19, " C")], { bg: "jungle", music: "general", intro: "Kessa, Dorrin and Mayle block the well!" });
    if (res !== "win") return;
    await M.stage(async c => {
      const h = c.hero; KB2.slice(0, 3).forEach(([id, art, dx, dy]) => c.actor(id, { art, x: h.x + dx - 100, y: h.y + dy, name: UI.PEOPLE[id].name, flip: true }));
      await c.say([["kessa", "I am not supposed to know why they watch it. I do now."]]);
      c.emote("kessa", "..."); await c.walk("kessa", h.x + 560, h.y - 30, 2400);
      await Promise.all([c.walk("dorrin", h.x + 560, h.y + 10, 2500), c.walk("mayle", h.x + 560, h.y + 40, 2800)]);
      c.remove("kessa"); c.remove("dorrin"); c.remove("mayle");
    }, { music: "marigold" });
    F.set("ch4.kessa2"); F.music("marigold");
  };

  // 4.G Legend L3 and the waterfall cave
  S.legend.L3 = M.legend("L3", { enemy: "motherGlowmoth", fx: "glow", end: "fade", tint: "#0a0c18", level: 21, bg: "canopy", title: "Mother of the Lamps", fightIntro: "Mother Glowmoth spreads her lamps!",
    intro: [["narr", "A lamp swings out of the dark, then a second, then ten. They are wings. Mother Glowmoth drifts towards you, kind and hungry."], ["narr", "She lights the way for the lost, and eats the lights of those who lie."]],
    lines: [["narr", "The moonless canopy goes still. Every lantern on the bridges leans toward her."], ["hero", "(She is not going to ask me anything. She is going to look, and know.)"]],
    after: [["narr", "The lamps go out one by one. Where Mother Glowmoth hung, two small flasks hang for a breath, glowing, and fall softly into your hands."]] });
  T("waterfallCave").firstHarvestTablet = async F => {
    await UI.say([["narr", "A wall of tablets behind the falling water, green with spray. The builders' short hand, copied letter for letter by someone who learned it without understanding it: \"We took the first with grace. We took the second with need. We took the third with a ledger.\""]]);
    if (M.once(F, "lore.firstHarvest")) await UI.say([["hero", "(Somebody has been here, copying. The Company took the words, and kept none of the grace.)"]]);
    if (window.Story.sunPiece && !F.f("lore.sunPiece2")) { await UI.say([["narr", "Lower on the wall, cut much deeper and without the clerk's flourishes: \"The second sun is a bird that will not land. Slow it, and slow it again, and it lands.\""]]); window.Story.sunPiece(F, 2); }   // chapter 11 lore: the second builder tablet of the Sun Eater
  };
  S.chest.waterfallChest = M.loot("c.waterfall", [["ember", 1]], 150, "A chest in the spray, rust-green and still sound. One Ashen Ember burning in a nest of dry moss, and a purse of kakal.");
  S.chest.spireChest = M.loot("c.spire", [["ember", 2]], 300, "A chest in a nest of brown-white feathers, halfway up the spiral. Two Ashen Embers, and a hundred kakal in each of three pouches.");

  // 4.H The Plumed Coil (T2), the chapter-end fight
  S.done.spireTop = F => F.f("ch4.coil");
  S.trigger.spireTop = async F => {
    if (F.f("ch4.coil")) return;
    if (!F.f("ch4.s3")) { await UI.say([["narr", "The spiral stair ends at a plank door lashed shut with feather-cord. Two altars stand between you and it, and neither has been silenced."]]); return; }
    F.music("canopy");
    await Cinema.boss({ id: "plumedCoil", name: "The Plumed Coil", title: "Titan of the Canopy", bg: "spire", music: "titanSky", lines: [["narr", "The mist parts. A serpent of white and brown feathers, longer than the Spire is tall, uncoils from the sky and looks down."], ["hero", "(It is beautiful. They want to put it in a cage.)"]] });
    const res = await F.boss([F.mkEnemy("plumedCoil", 22)], { bg: "spire", music: "titanSky", xpBonus: 1.0, intro: "The Plumed Coil uncoils from the sky!" });
    if (res !== "win") return;
    await M.stage(async c => {
      const h = c.hero; c.tint("#14181c", 0.22, 600);
      c.actor("coil", { art: "plumedCoil", x: h.x + 150, y: h.y - 10, scale: 1.4, flip: true });
      await c.say([["narr", "The Coil lies on the great perch with its feathers spread, and the wind that has howled through the Spire all your life drops to a sigh. Its eye is as big as a door, and it turns to look at you."]]);
      c.fx("feathers", h.x + 150, h.y - 30, { ms: 2600 }); await c.wait(1200);
      c.sfx("hit"); await c.say([["narr", "The eye closes. The Coil does not die. It sleeps, the way something sleeps after a very long night of holding a door shut."], ["hero", "(Another one that was only holding something up.)"]]);
      c.remove("coil"); c.tint("#14181c", 0, 800);
    }, { music: "farewell" });
    F.giveGear("G21", 3); F.set("ch4.coil"); F.questDone("m_spire"); F.music("canopy");
    G.best.plumedCoil = Object.assign(G.best.plumedCoil || {}, { breakKnown: true });
    await F.banter("coil");
    UI.toast("The wind has dropped. Plume Rest is quiet.", 3000); F.save(true);
  };

  // ---------- Story.finish[4]: what chapter 4 gives (dbg.jump(5) and later runs this after finish[3]) ----------
  S.finish[4] = (F, G) => {
    ["ch4.start", "ch4.titled", "cn.seen", "pl.seen", "ch4.yaxa", "ch4.s2", "ch4.s3", "k2.done", "k2.freed", "ch4.cellar", "ch4.kessa2", "ch4.coil", "ch4.done", "mh.seen", "hs.seen", "sp.seen", "ch4.letter.1", "ch4.letter.2", "ch4.letter.3", "ch4.letter.4", "lookout.post1", "lookout.post2", "lookout.post3", "g.blanket"].forEach(k => (G.flags[k] = true));
    G.flags["ch4.letters"] = 4; G.flags["wagon.at"] = "plumeRest";
    ["m_canopy", "m_letters", "m_spire", "m_windhollow"].forEach(q => (G.quests[q] = "done"));
    ["G21", "G8", "G9", "G10", "G15"].forEach(s => F.giveGear(s, 3, true));
    G.items.ithielPass = 1; G.items.featherBlanket = 1; [1, 2, 3, 4].forEach(n => (G.items["imelaLetter" + n] = 1));
    if (!G.collection.some(u => u.id === "quillshade")) { const q = F.mk("quillshade", Math.max(3, F.avgLevel() - 1)); G.collection.push(q); G.best.quillshade = Object.assign(G.best.quillshade || {}, { seen: 1, beaten: 0 }); }
    [2, 3].forEach(n => { const g = S.generalFor(n); if (g) { G.flags["gen.freed." + n] = true; S.noteGeneral(g.id, n === 2 ? "Freed at the first altar platform. It crossed a rope bridge, and the mist took it." : "Freed at the second altar platform. It went north along the last bridge, into the Spire's shadow."); } });
    G.gold += 800; G.ch = 4; G.lastTown = "plumeRest";
  };

  // ---------- blocked exits (the world maps run these when a gated exit is walked into) ----------
  Q(S.trigger, {
    shoreEastBlocked: async F => { await UI.say([["hero", "(Mud and roots, all the way east. The lamp Brisk spoke of is the other way.)"]]); },
    riverEastBlocked: async F => { await UI.say([["hero", "(No ferry runs east from here. Not while there are soldiers on the far bank.)"]]); },
    ninefoldDockBlocked: async F => { await UI.say([["hero", "(The ferry to the north shore is chained for the night. Something in the market has not finished with me.)"]]); },
    jungleSouthBlocked: async F => { await UI.say([["hero", "(The southern track is a wall of vines. Nobody has come through it in a long while.)"]]); },
    coilHillBlocked: async F => { await UI.say([["hero", "(A legion checkpoint across the hill road. They look at papers there, and I have none.)"]]); },
    canopyBlocked: async F => { await UI.say([["hero", "(Sheer cliff. If there is a path north, it is not one I can see.)"]]); },
    spireBlocked: async F => { await UI.say([["hero", "(Two altar platforms watch the way to the Spire. Neither is quiet.)"]]); },
  });
})();
