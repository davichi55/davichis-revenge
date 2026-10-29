// Story data for M1 (prologue + chapters 1-2): packs, banter, items, gear sets, shops, quests, rumours, regions, drops, encounters.
"use strict";
const Data = (() => {
  // ---------- the nine packs (styles stay hidden at the choice: only art, names and a line of flavour) ----------
  const PACKS = [
    { id: "vanguard",  n: "The Vanguard",   ids: ["horncinder", "shellmund", "kitsuneva"],   line: "The lab's first trio. They act like a small family." },
    { id: "sprint",    n: "Blood Sprint",   ids: ["skarnwolf", "vespera", "glimmerkoi"],     line: "Three escape artists. One still drags a broken chain." },
    { id: "venom",     n: "Slow Venom",     ids: ["mossmaw", "nightveil", "emberlamb"],      line: "Patient and a little sad. They sat through the long experiments." },
    { id: "tempest",   n: "Tempest",        ids: ["skyrend", "volthorn", "brinegrave"],      line: "Caught in the same storm at sea. They have not stopped bickering." },
    { id: "ironward",  n: "The Iron Ward",  ids: ["bulwyrm", "rotfang", "stillgaze"],        line: "Judged too dangerous and kept apart. They trust nobody." },
    { id: "breakers",  n: "Breakers",       ids: ["crushjaw", "zephyrra", "duskcoil"],       line: "Hunting partners and best friends. They compete at everything." },
    { id: "bastion",   n: "Deep Bastion",   ids: ["atlacrab", "solenne", "kappadeep"],       line: "The calm old guard of the lab." },
    { id: "wildfire",  n: "Wildfire",       ids: ["smolderhead", "pyrewisp", "mawdeep"],     line: "They burned down a wing of the lab once. Nobody is sorry." },
    { id: "dawn",      n: "Endless Dawn",   ids: ["auroracorn", "lumoth", "sunkenhorn"],     line: "A healing experiment. They never wanted to hurt anyone." },
  ];
  const MIRROR = { vanguard: "sprint", sprint: "vanguard", venom: "tempest", tempest: "venom", ironward: "breakers", breakers: "ironward", bastion: "wildfire", wildfire: "bastion", dawn: "venom" };
  const NAMES = {}; PACKS.forEach(p => p.ids.forEach(id => (NAMES[id] = id.charAt(0).toUpperCase() + id.slice(1))));
  NAMES.bramblehoof = "Bramblehoof";
  const packOf = id => PACKS.find(p => p.ids.includes(id));

  // ---------- creature talk: per pack and moment, [creature, line] ----------
  // moments: tut (undercroft lessons), choose, flee, rest, karvan, wagon, bearer, boat, idle (random in towns), lab (what a general remembers later)
  const BANTER = {
    vanguard: {
      tut:    [["horncinder", "Again? I can smash that slug in my sleep!"], ["shellmund", "Slowly, young bull. Watch the pipe-drip. Learn."], ["kitsuneva", "Good, dear. Breathe. We have all day."]],
      choose: [["horncinder", "You picked us! Course you did. Best pen in the vault!"], ["kitsuneva", "Hush, bull. Come close, dear. Stay close."], ["shellmund", "...Home is behind us now. Walk on."]],
      flee:   [["horncinder", "I hear them behind us! Let me turn and fight!"], ["shellmund", "No. We keep moving. They are many."], ["kitsuneva", "The others, I counted. Eight pens. I hear them crying."]],
      rest:   [["kitsuneva", "Eat something, dear. Then sleep. I'll keep watch."], ["horncinder", "I'm not tired. I'm... loud-tired. Is that a thing?"], ["shellmund", "It is. It passes."]],
      karvan: [["horncinder", "A man in a shell of steel! My favourite kind!"], ["shellmund", "Spells. His shield turns the horns."], ["kitsuneva", "I am right behind you all. Go."]],
      wagon:  [["horncinder", "Look at all those cages. Who are they?"], ["shellmund", "Cousins. Strangers. We were all kept so."], ["kitsuneva", "We will open them, one by one. I promise."]],
      bearer: [["horncinder", "A giant! Oh, the stories I'll tell!"], ["shellmund", "Carrying a star on its back. Think before you charge."], ["kitsuneva", "Together, then. As always."]],
      boat:   [["horncinder", "Sea! Wide, wet, wobbly sea!"], ["shellmund", "I have crossed worse waters. In the old shell."], ["kitsuneva", "Home is behind us, dear. We make a new one."]],
      idle:   [["horncinder", "Can we get meat? Just asking. Asking loudly."], ["kitsuneva", "Straighten that strap, dear. There."], ["shellmund", "Sand is patient. We should be, too."]],
      lab:    [["horncinder", "Remember when we shared one bucket of stew? Best day of the lab."], ["shellmund", "I carried you out of that fire once. You remember."], ["kitsuneva", "Little one. Look at what you've become."]],
    },
    sprint: {
      tut:    [["skarnwolf", "Practice cellars. Cages with extra steps."], ["vespera", "Slow, slow, slow. Do hurry up, someone."], ["glimmerkoi", "Why does the slug spit? What is it for? Is it a defence?"]],
      choose: [["skarnwolf", "You opened the pen. ...Not bad for a keeper."], ["vespera", "About time somebody with taste came along."], ["glimmerkoi", "Where are we going? Is it far? Can I see the sky first?"]],
      flee:   [["skarnwolf", "Run. We know how. We nearly got out once."], ["vespera", "Faster! You are a snail in a bucket!"], ["glimmerkoi", "Behind us, the smoke... why is it that colour?"]],
      rest:   [["skarnwolf", "No walls. No chain. ...Feels odd. Good odd."], ["vespera", "Don't get used to my kindness. I'm only tired."], ["glimmerkoi", "Do you dream? What do you dream? Mine are all water."]],
      karvan: [["skarnwolf", "Soldiers hunt in lines. I hunt better."], ["vespera", "Let me at him. I'll be gone before he blinks."], ["glimmerkoi", "How thick is a tower shield, exactly? Asking for tactics."]],
      wagon:  [["skarnwolf", "Cages. ...I know that smell. The metal."], ["vespera", "Disgusting. Open them, quickly."], ["glimmerkoi", "How many are there? Do they have names? May I read the tags?"]],
      bearer: [["skarnwolf", "Big thing, big mistake. Don't stop moving."], ["vespera", "A statue that walks. How uncouth."], ["glimmerkoi", "A star on its back! Is that where they fall? Does it hurt?"]],
      boat:   [["skarnwolf", "Water again. We came from the sea, once. Near enough."], ["vespera", "If I'm seasick, no one speaks of it."], ["glimmerkoi", "Where does the horizon end? Please, someone say."]],
      idle:   [["skarnwolf", "Someone is watching us. Always someone."], ["vespera", "That scarf is a crime. Remove it."], ["glimmerkoi", "Do all towns smell of dates?"]],
      lab:    [["skarnwolf", "We almost made it out together. The wall. Remember the wall?"], ["vespera", "You were the only one who ever said please."], ["glimmerkoi", "I've got so many questions. Starting with: why?"]],
    },
    venom: {
      tut:    [["mossmaw", "Ha. Slugs. Finally a fair fight."], ["nightveil", "..."], ["emberlamb", "I-I'll try, if that's all right."]],
      choose: [["mossmaw", "Grumble. Fine. Better you than the soldiers."], ["nightveil", "You are afraid. Good. It keeps you alive."], ["emberlamb", "Thank you for taking us. Really. Thank you."]],
      flee:   [["mossmaw", "Run, he says. I'm a boar. I run in one direction."], ["nightveil", "They are slower than the dark."], ["emberlamb", "Please don't let go of my fleece. Oh. You weren't."]],
      rest:   [["mossmaw", "A bed with no chains. I'll cry later. In private."], ["nightveil", "The stars here are old. Listen."], ["emberlamb", "I'll sleep next to you, if that's all right."]],
      karvan: [["mossmaw", "Steel man. Soft inside, they say. Let's check."], ["nightveil", "Wait. Watch. Let the poison do its work."], ["emberlamb", "I'm scared. But I'll go. I'll go first, even."]],
      wagon:  [["mossmaw", "Cages. Right. I'll just... look at the floor."], ["nightveil", "They are listening. All of them."], ["emberlamb", "We'll get you out. I promise, small voice."]],
      bearer: [["mossmaw", "Ha! A giant. Poison takes longer on giants. Let's be patient."], ["nightveil", "It does not hate us. It only holds."], ["emberlamb", "I'm brave when it counts. It counts now."]],
      boat:   [["mossmaw", "A boat. I have opinions. They are unfavourable."], ["nightveil", "Deep water. Old things sleep there."], ["emberlamb", "Will the jungle be warm? I like warm."]],
      idle:   [["mossmaw", "Moss grows where I stand. Sorry, innkeeper."], ["nightveil", "Someone is lying in that tent."], ["emberlamb", "Do you think they remember us? The other pens?"]],
      lab:    [["mossmaw", "We sat in that long hall for months. You brought us apples."], ["nightveil", "I knew you would come. I did not know why."], ["emberlamb", "You... you grew up. I'm sorry I'm shaking."]],
    },
    tempest: {
      tut:    [["skyrend", "Race you to the slug! Loser buys the stew!"], ["volthorn", "Fighting! Fighting! Can I go first? Please?"], ["brinegrave", "Calm. Spacing. Watch the spit."]],
      choose: [["skyrend", "Hah! The kid has an eye. Top pen!"], ["volthorn", "Where do we go?! Anywhere! Anywhere is great!"], ["brinegrave", "Stay behind us when it starts. All of it."]],
      flee:   [["skyrend", "Soldiers? In THIS wind? Catch me, then!"], ["volthorn", "Fast fast fast fast fast!"], ["brinegrave", "Quiet. Keep to the low ground."]],
      rest:   [["skyrend", "Best night ever. Worst night ever. Tied."], ["volthorn", "I can't sit still. I can't! Sorry! Okay! Sitting!"], ["brinegrave", "Sleep. I'll hold the door."]],
      karvan: [["skyrend", "Tower shield? Sky doesn't care about your shield!"], ["volthorn", "ZAP! Zap him! Please can I zap him!"], ["brinegrave", "Steady. Everyone behind the line."]],
      wagon:  [["skyrend", "Cages in a row... the joke isn't funny. Open them."], ["volthorn", "Let them out let them out let them out!"], ["brinegrave", "I'll keep the guard. The rest of you, unlock."]],
      bearer: [["skyrend", "Big stone man! Who wants to get hit first?"], ["volthorn", "Can I climb it? Can I climb it?!"], ["brinegrave", "Stay together. It is slow, not stupid."]],
      boat:   [["skyrend", "Sea! Again! Take that, storm!"], ["volthorn", "BOAT! Fast boat? No? Slow boat. Okay."], ["brinegrave", "I know this water. It remembers us."]],
      idle:   [["skyrend", "Let's steal the baker's hat. For science."], ["volthorn", "Is it time yet? Time for what? Anything!"], ["brinegrave", "Stay close to the walls."]],
      lab:    [["skyrend", "I told the jokes. You laughed. It helped."], ["volthorn", "Remember the storm? We were so loud."], ["brinegrave", "I promised to protect you. I failed. I am sorry."]],
    },
    ironward: {
      tut:    [["bulwyrm", "..."], ["rotfang", "Oh brilliant, a cellar. Just what my life needed."], ["stillgaze", "What walks on four legs, drips on three, and spits on none?"]],
      choose: [["bulwyrm", "Hm."], ["rotfang", "Why us? Everyone's scared of us. What's wrong with you?"], ["stillgaze", "Who takes what is dangerous? One who has nothing left to lose."]],
      flee:   [["bulwyrm", "Move."], ["rotfang", "Great. Running. Ran my whole life, no medals."], ["stillgaze", "The one who runs is followed. The one who stops is found."]],
      rest:   [["bulwyrm", "Rest. I watch."], ["rotfang", "Don't think this means we're friends."], ["stillgaze", "A kind word is cheap. Why did it feel so heavy?"]],
      karvan: [["bulwyrm", "Shield for shield. I will hold."], ["rotfang", "Steel? Pff. Rust always wins."], ["stillgaze", "He guards a door. What does the door guard?"]],
      wagon:  [["bulwyrm", "Cages. ...I was in one. Open them."], ["rotfang", "Typical. Everyone gets kept. Nobody gets asked."], ["stillgaze", "Locked and listening. A cage hears itself."]],
      bearer: [["bulwyrm", "The Bearer. I am also a wall."], ["rotfang", "A giant stone man. Of course. Why not."], ["stillgaze", "What is carried is not always a burden. What is it, here?"]],
      boat:   [["bulwyrm", "Water. I do not swim. I... sink well."], ["rotfang", "Salt on my scales. Terrific."], ["stillgaze", "Who crosses a sea comes back changed, or does not."]],
      idle:   [["bulwyrm", "..."], ["rotfang", "I could hate this town, easily. It's cosy."], ["stillgaze", "What has a roof but no walls? Ask me later."]],
      lab:    [["bulwyrm", "You brought bread to the bars. I remember."], ["rotfang", "Fine. I trusted you. Once. Happy?"], ["stillgaze", "The riddle was always you."]],
    },
    breakers: {
      tut:    [["crushjaw", "Is the slug edible? Asking for science."], ["zephyrra", "Ooh ooh, I'll beat Crushjaw to it!"], ["duskcoil", "Between us, the slug is nervous. I can tell."]],
      choose: [["crushjaw", "A pack! A real team! Do we get snacks?"], ["zephyrra", "You picked us, you picked us, I knew it!"], ["duskcoil", "Interesting choice. I'll tell you why later."]],
      flee:   [["crushjaw", "I can run and eat. Watch me. ...Okay, no."], ["zephyrra", "Faster, faster, they're coming, I love it!"], ["duskcoil", "That soldier on the left? Terrified of his mother."]],
      rest:   [["crushjaw", "Dates! Rolls! A whole roast bird! Thank you!"], ["zephyrra", "I can't sleep, I'm too excited. Tell me a story."], ["duskcoil", "Do you know what the innkeeper hides under the bed?"]],
      karvan: [["crushjaw", "Armoured meat. I mean, opponent."], ["zephyrra", "Race you to the first hit, Crushjaw!"], ["duskcoil", "He is afraid of failing someone. Use it."]],
      wagon:  [["crushjaw", "Cages. Whoever did this owes me dinner."], ["zephyrra", "Hello, hello, hello, I'm Zephyrra, you'll like me!"], ["duskcoil", "These ones know secrets. Delicious."]],
      bearer: [["crushjaw", "It is HUGE. I want to bite it."], ["zephyrra", "Look at its stone! Oh, we hit it twice. I know it!"], ["duskcoil", "They say it cracks. They always say that."]],
      boat:   [["crushjaw", "Snacks for the voyage? I packed two."], ["zephyrra", "Waves! I'll fly ahead and see! Don't wait!"], ["duskcoil", "Everyone on that boat has a secret. Fun!"]],
      idle:   [["crushjaw", "Is that a stew? Oh the smell!"], ["zephyrra", "Look at that banner! I want one!"], ["duskcoil", "Did you know the baker's son..."]],
      lab:    [["crushjaw", "We ate all the keepers' bread. Good old days!"], ["zephyrra", "We always won together. Together, remember?"], ["duskcoil", "I know every secret in that lab. Except yours."]],
    },
    bastion: {
      tut:    [["atlacrab", "There, there, little slug. It will be over soon."], ["solenne", "Every lesson is a small blessing."], ["kappadeep", "Mmm... is it time? ...oh. The fight. Right."]],
      choose: [["atlacrab", "A gentle hand. Thank you for choosing us."], ["solenne", "The light has led you to us. I knew it would."], ["kappadeep", "Take your time. We have plenty of it."]],
      flee:   [["atlacrab", "Quickly, but do not trample the small ones."], ["solenne", "Fear is a lantern. It shows the road, too."], ["kappadeep", "...we walk. They shout. The sand is calm."]],
      rest:   [["atlacrab", "Sleep, little one. We watch."], ["solenne", "A good fire teaches patience."], ["kappadeep", "Zzz... I'm awake. Mostly."]],
      karvan: [["atlacrab", "I'll hold the shield. You choose the strike."], ["solenne", "Steady hearts. We are the old guard."], ["kappadeep", "Slowly... slowly... and then, not slowly."]],
      wagon:  [["atlacrab", "Oh, the little ones. All in a row."], ["solenne", "May the keys turn gently."], ["kappadeep", "Open them. Let them breathe."]],
      bearer: [["atlacrab", "He carries a mountain. I carry a pillar. We understand each other."], ["solenne", "Even giants tire. Be kind. Be firm."], ["kappadeep", "Wake me when it cracks."]],
      boat:   [["atlacrab", "I am built for water. Mostly. Hold on."], ["solenne", "The sun follows us over any sea."], ["kappadeep", "Ahh. Water. Home. A little."]],
      idle:   [["atlacrab", "What a lovely market. Mind the glass."], ["solenne", "Walk lightly. These streets remember."], ["kappadeep", "Nap?"]],
      lab:    [["atlacrab", "I rocked you to sleep once, in that cold hall."], ["solenne", "You were so little. And so brave."], ["kappadeep", "...Hello. Still here. Still waiting for you."]],
    },
    wildfire: {
      tut:    [["smolderhead", "Slug! Let's set it ON FIRE. Wait. It's damp. Aw."], ["pyrewisp", "Hee. Hee hee. Watch me spook it."], ["mawdeep", "Hungry. Slug looks tasty."]],
      choose: [["smolderhead", "You picked us! No one ever picks us! Bad idea!"], ["pyrewisp", "Oh you have no idea what you've done. Hee."], ["mawdeep", "Thank you. Is there food? ...Is there food?"]],
      flee:   [["smolderhead", "Let me burn something on the way out. Just one!"], ["pyrewisp", "Run, run! I'll make the fire dance behind us!"], ["mawdeep", "Running makes me hungry."]],
      rest:   [["smolderhead", "Don't tell the innkeeper about the little scorch mark."], ["pyrewisp", "Boo. Did I scare you? Hee."], ["mawdeep", "Bread. Good. Honest bread."]],
      karvan: [["smolderhead", "Hot metal burns slower than people think. Let me show him!"], ["pyrewisp", "Hee hee. Which one of you wants a surprise?"], ["mawdeep", "I'm hungry. He looks hard. I'll swallow the shield."]],
      wagon:  [["smolderhead", "Cages! Melt the lock? ...please?"], ["pyrewisp", "Poor little ones. Who wants a joke?"], ["mawdeep", "They look hungry too."]],
      bearer: [["smolderhead", "Biggest bonfire ever. I accept!"], ["pyrewisp", "A giant. A big, slow, stony giant. Let's make it dance."], ["mawdeep", "That's a lot of food. ...Wait, it's rock."]],
      boat:   [["smolderhead", "Boat and fire. Probably bad. I'll be careful!"], ["pyrewisp", "Ha! A ghost story for the crew!"], ["mawdeep", "Fish. Everywhere. Wonderful."]],
      idle:   [["smolderhead", "Don't look at me. It was already smoking."], ["pyrewisp", "Booo! Did it work?"], ["mawdeep", "What's that smell? Is it food?"]],
      lab:    [["smolderhead", "We burned the east wing for you once. Oops?"], ["pyrewisp", "Hee... you remember the jokes? I made them for you."], ["mawdeep", "You gave me your bread. I never forgot."]],
    },
    dawn: {
      tut:    [["auroracorn", "Gently. Nobody has to be hurt more than they must."], ["lumoth", "...The slug is only afraid, I think."], ["sunkenhorn", "Hold. Learn. Win quietly."]],
      choose: [["auroracorn", "I knew someone kind would come. You did."], ["lumoth", "Thank you. I will glow for you, if you want."], ["sunkenhorn", "...Walk. I will follow."]],
      flee:   [["auroracorn", "Breathe. Don't look back. Light the road ahead."], ["lumoth", "The smoke tastes of old books. Poor Orun."], ["sunkenhorn", "Go."]],
      rest:   [["auroracorn", "Sleep. Whatever tomorrow is, we meet it together."], ["lumoth", "I can mend your cuts as you dream."], ["sunkenhorn", "Rest. I keep the tide."]],
      karvan: [["auroracorn", "Let us fight, not to harm, but to end the harm."], ["lumoth", "I will keep you all. I swear it."], ["sunkenhorn", "He is a wall. Walls fall. Slowly."]],
      wagon:  [["auroracorn", "Oh, all those hearts. We will free them."], ["lumoth", "So many in the dark. Let me shine on them."], ["sunkenhorn", "...Open them."]],
      bearer: [["auroracorn", "He is tired. Not wicked. Be strong, be kind."], ["lumoth", "He holds the star. I'd like to ask him why."], ["sunkenhorn", "Patience. A giant falls when it chooses."]],
      boat:   [["auroracorn", "There is light over every sea."], ["lumoth", "I'll glow at the bow. For luck."], ["sunkenhorn", "...I know these waves."]],
      idle:   [["auroracorn", "What a gentle town. May it stay that way."], ["lumoth", "The moths here are small. Hello, small friends."], ["sunkenhorn", "..."]],
      lab:    [["auroracorn", "You came back. I knew it, in my heart."], ["lumoth", "I never stopped glowing for you. Not once."], ["sunkenhorn", "The tide brought you home. Welcome."]],
    },
  };

  // ---------- items, prices (ECONOMY.md tiers) ----------
  const TIER_FLASK = [8, 12, 20, 32, 48, 68, 90, 110];
  const ITEMS = {
    sunwater: { n: "Sunwater Flask",  d: "Heals one creature by 25% of its max HP.", f: 1.0, use: "heal" },
    antidote: { n: "Reed Antidote",   d: "Cures poison.", f: 0.6 },
    salve:    { n: "Cooling Salve",   d: "Cures burn.", f: 0.6 },
    moss:     { n: "Clotting Moss",   d: "Cures bleed.", f: 0.6 },
    wrap:     { n: "Ember Wrap",      d: "Cures chill.", f: 0.6 },
    clay:     { n: "Grounding Clay",  d: "Cures shock.", f: 0.6 },
    tea:      { n: "Quick Tea",       d: "Cures slow.", f: 0.6 },
    cloth:    { n: "Dry Cloth",       d: "Removes Wet.", f: 0.33 },
    tonic:    { n: "Clearwater Tonic", d: "Cures every status on one creature.", f: 1.5 },
    ember:    { n: "Ashen Ember",     d: "Revives a fallen creature at 20% HP.", f: 4, use: "revive" },
    incense:  { n: "Wayfarer's Incense", d: "Halves the fight rate for about 5 minutes of walking.", f: 2, use: "charm" },
    candle:   { n: "Lure Candle",     d: "Doubles the fight rate for about 5 minutes.", f: 1, use: "charm" },
    cinderBomb: { n: "Cinder Bomb", d: "Fire damage, adds burn. Never breaks a boss.", f: 1.8 },
    rimeFlask:  { n: "Rime Flask",  d: "Ice damage, adds chill. Never breaks a boss.", f: 1.8 },
    soakJar:    { n: "Soak Jar",    d: "Makes an enemy Wet.", f: 1.8 },
    sparkJar:   { n: "Spark Jar",   d: "Lightning damage, adds shock.", f: 1.8 },
    venomPot:   { n: "Venom Pot",   d: "Poison damage, adds a stack.", f: 1.8 },
    keyK1:      { n: "Bone Maze Key", d: "Opens a cell in the Menagerie Wagon.", key: true },
    wardstone:  { n: "Wardstone", d: "A charm: halves the fight rate for good.", key: true },
    journal:    { n: "Field Journal", d: "Your satchel of notes. Everything you see goes in.", key: true },
  };
  // trade goods (sellable, no other use) and skill-book materials
  const GOODS = { sandGlass: ["Glass-Sand Vial", 6], scarabShell: ["Scarab Shell", 7], adderFang: ["Adder Fang", 8], impWing: ["Imp Wing", 6], slimeJar: ["Slug Slime", 4], inkVial: ["Ink Vial", 5], boneChip: ["Bone Chip", 6],
    scorpPlate: ["Scorpion Plate", 14], emberSlag: ["Ember Slag", 12], legionCoin: ["Legion Coin", 9], lizScale: ["Lizard Scale", 10], saltCrust: ["Salt Crust", 9], curio: ["Odd Curio", 5], mossClump: ["Cistern Moss", 6], catMist: ["Heat-Haze Jar", 8] };
  const MATS = { duneclawShard: ["Duneclaw Shard", "Hard as a mason's chisel. Helps against Titans' stone."], cinderglassEmber: ["Cinderglass Ember", "A coal that never goes out."], cinderPlume: ["Cinder Plume", "A feather that is warm on one side."] };
  // skill book: 10 pieces unlock a move that any creature can equip in its off-style slot
  const BOOK = {
    ramStrike: { n: "Ram Strike", mat: "duneclawShard", need: 10, d: "Impact move, 2 MP. Counts toward impact breaks. Helps against the Dune Bearer.", move: "ramStrike" },
    kindle:    { n: "Kindle", mat: "cinderglassEmber", need: 10, d: "Fire move, 2 MP. Adds burn. A fire answer to roots and wood.", move: "kindle" },
    revive:    { n: "Revive", mat: "cinderPlume", need: 10, d: "Brings a fallen ally back to their feet.", move: "revive" },
  };
  const priceOf = (key, tier) => {
    const it = ITEMS[key]; if (!it || it.f == null) return 0;
    if (key === "cloth") return [2, 4, 6, 10, 14, 20, 27, 33][tier];
    return Math.round(TIER_FLASK[tier] * it.f);
  };

  // ---------- gear sets (GEAR_SETS.md); st = [full, two-piece] for stat bonuses I can apply; fx = tag passed to the battle rules ----------
  const SETS = {
    G44: { n: "Initiate's Mask", pieces: ["Plain Wooden Mask", "White Linen Robe", "Temple Reed Staff"], b: [
      { n: "Quiet Mind", d: "Start each fight with 2 MP.", d2: "Start each fight with 1 MP.", st: { startMp: [2, 1] } },
      { n: "Empty Hands", d: "At 0 MP your basic attack gives +1 extra MP.", d2: "Once per fight.", fx: "emptyHands" },
      { n: "Thrifty Caster", d: "Your first spell each turn costs 1 less MP (min 1).", d2: "Every second turn.", fx: "thrifty" }] },
    G41: { n: "Wayfarer's Road Kit", pieces: ["Road Hood", "Travelling Cloak", "Wayfarer's Knife"], b: [
      { n: "Sturdy Boots", d: "+10% max HP.", d2: "+5% max HP.", st: { hp: [10, 5] } },
      { n: "Ready Hands", d: "Start each fight with 1 MP.", d2: "First basic attack gives +1 extra MP.", st: { startMp: [1, 0] }, fx: "readyHands" },
      { n: "Fast Learner", d: "+15% experience.", d2: "+7% experience.", st: { xp: [15, 7] } }] },
    G5: { n: "Bullring Bronze", pieces: ["Nose-Ring Helm", "Bronze Cuirass", "Bull-Horn Blade"], b: [
      { n: "Bull's Constitution", d: "+15% max HP.", d2: "+7% max HP.", st: { hp: [15, 7] } },
      { n: "Horn Counter", d: "Deal back 15% of physical damage you take.", d2: "8%.", fx: "hornCounter" },
      { n: "Iron Nose Ring", d: "25% less chance to be stunned or slowed.", d2: "12%.", fx: "ironNose" }] },
    G16: { n: "Tower Shield Phalanx", pieces: ["Bronze Helm", "Tower Shield", "Short Stabbing Sword"], b: [
      { n: "Wall", d: "+20% Defense.", d2: "+10% Defense.", st: { def: [20, 10] } },
      { n: "Shield Brother", d: "Taking hits for an ally: 25% less damage.", d2: "12%.", fx: "shieldBrother" },
      { n: "Locked Shields", d: "Shield Wall reduces team damage by 40%.", d2: "35%.", fx: "lockedShields" }] },
    G45: { n: "Stoneweather Cloak", pieces: ["Sun-Bleached Hood", "Thick Grey Cloak", "Weathered Staff"], b: [
      { n: "Hard to Rattle", d: "30% less chance to be hit by a status.", d2: "15%.", fx: "hardToRattle" },
      { n: "Shake It Off", d: "Statuses on you last 1 turn shorter.", d2: "Only burn and poison.", fx: "shakeOff" },
      { n: "Thick Skin", d: "Ignore the first status each fight.", d2: "The first status lasts 1 turn.", fx: "thickSkin" }] },
    G20: { n: "Quarry Mason's Hammer", pieces: ["Mason's Cap", "Quarry Apron", "Mason's Hammer"], b: [
      { n: "Earthquake", d: "Earthshaker +30% damage, stun chance +10 points.", d2: "+15%, +5 points.", fx: "earthquake" },
      { n: "Pillar Fist", d: "Basic attacks add 25% of your Defense.", d2: "12%.", fx: "pillarFist" },
      { n: "Full Strength", d: "+20% damage while your HP is full.", d2: "+10%.", fx: "fullStrength" }] },
    G12: { n: "Cinder Serpent Pit", pieces: ["Smoke-Grey Hood", "Coal-Red Plate", "Cinder Rod"], b: [
      { n: "Slow Burn", d: "Burn you apply lasts 1 turn longer.", d2: "Every second burn.", fx: "slowBurn" },
      { n: "Ember Heart", d: "+20% fire damage.", d2: "+10%.", fx: "emberHeart" },
      { n: "Ashen Skin", d: "20% less fire damage taken.", d2: "10%.", fx: "ashenSkin" }] },
    G4: { n: "Warden of the Winding Halls", pieces: ["Maze-Pattern Helm", "Bronze Maze Plate", "Long-Hafted Axe"], b: [
      { n: "Dead End", d: "Impact moves count as 2 hits toward breaks.", d2: "The first impact move each turn.", fx: "deadEnd" },
      { n: "Opening Charge", d: "Your first action of the fight deals +40% damage.", d2: "+20%.", fx: "openingCharge" },
      { n: "Cheap Cruelty", d: "Weak (1 MP) spells deal +25% damage.", d2: "+12%.", fx: "cheapCruelty" }] },
    G17: { n: "Stoneguard of the Sun Gate", pieces: ["Mirror-Disc Helm", "Mirror-Disc Plate", "Sun-Gate Shield"], b: [
      { n: "Mirror Plate", d: "+20% Resistance.", d2: "+10% Resistance.", st: { res: [20, 10] } },
      { n: "Warded Against Elements", d: "15% less damage from all elements.", d2: "7%.", fx: "warded" },
      { n: "Cleansing Pillar", d: "Remove one status from yourself each turn.", d2: "Every second turn.", fx: "cleansing" }] },
    G34: { n: "Reaction Scholar's Regalia", pieces: ["Diagram Cap", "Scholar's Robe", "Annotated Rod"], b: [
      { n: "Master of Mixing", d: "Combo Master bonus rises from +30% to +50%.", d2: "+40%.", fx: "masterMixing" },
      { n: "Charged Attune", d: "Attune also gives the next spell +15% damage.", d2: "+7%.", fx: "chargedAttune" },
      { n: "Sharper Detonation", d: "Detonate deals +30% damage.", d2: "+15%.", fx: "sharperDetonate" }] },
  };
  const SLOTS = ["helm", "armor", "weapon"], SLOT_NAMES = { helm: "Helm", armor: "Armour", weapon: "Weapon" };
  const pieceId = (set, slot) => set + "." + slot;
  const pieceName = (pid) => { const [s, sl] = pid.split("."); return SETS[s].pieces[SLOTS.indexOf(sl)]; };

  // ---------- shops ----------
  // stock entries: item key | "gear:G41" (pieces in fixed order) ; buys: multiplier for trade goods ; disc: price multiplier
  const BASICS = ["sunwater", "antidote", "salve", "moss"];
  const SHOPS = {
    orun:     { n: "Academy shop", who: "clerk", tier: 0, stock: ["sunwater", "antidote"], buys: 1.0 },
    sandpiper:{ n: "Sandpiper Rest stall", who: "clerk", stock: [...BASICS, "gear:G41"], gearPrice: { G41: [100, 160, 140] }, buys: 1.0 },
    amber:    { n: "Amber Wells market", who: "merchant", stock: [...BASICS, "wrap", "clay", "tea", "cloth", "tonic", "ember", "incense", "cinderBomb", "rimeFlask", "soakJar", "sparkJar", "venomPot", "gear:G45"], gearPrice: { G45: [140, 240, 180] }, buys: 1.0 },
    saltgate: { n: "Smuggler's counter", who: "merchant", stock: [...BASICS, "wrap", "clay", "tea", "cloth", "incense", "cinderBomb", "rimeFlask", "soakJar", "sparkJar", "venomPot"], disc: { cinderBomb: 0.8, rimeFlask: 0.8, soakJar: 0.8, sparkJar: 0.8, venomPot: 0.8 }, buys: 1.2 },
  };
  const INNS = { orun: { n: "The Lamp and Quill", free1: true }, sandpiper: { n: "The Reed Inn" }, amber: { n: "The Seventh Date" }, saltgate: { n: "The Gull and Anchor" }, tent: { n: "Field tent by the Hollow door" } };

  // ---------- quests ----------
  const QUESTS = {
    m_lessons:  { t: "Lessons in the Undercroft", main: true, steps: ["Speak to Old Dunmar at the lab.", "Go down to the Undercroft and finish the three lessons.", "Go to the creature vault and choose your team."] },
    m_escape:   { t: "Out of the Burning City", main: true, steps: ["Reach Sandpiper Rest across the dunes."] },
    m_cistern:  { t: "Through the Burnt Gate", main: true, steps: ["Follow the marked route into the Cistern of the Burnt Gate and come out the other side."] },
    m_research: { t: "Field Research", main: true, steps: ["Find Old Dunmar's wagon in Amber Wells.", "Master Ithiel wants the Hollow of the Sky-Stone recorded. Reach it through Saltgate."] },
    m_bearer:   { t: "The Dune Bearer", main: true, steps: ["Enter the Hollow of the Sky-Stone and record the Titan."] },
    m_boat:     { t: "The Smuggler's Boat", main: true, steps: ["Find the captain on Saltgate's docks."] },
    tidy:       { t: "Tidy the Lab", steps: ["Dunmar wants the lab tidied: find three things out of place (0/3).", "Return to Dunmar."] },
    debt:       { t: "The Scholar's Debt", steps: ["Pell the scholar is hiding from his creditors in Amber Wells. Hear him out.", "Pay Pell's debts (60 kakal) and he will pay you back in the only coin he has."] },
    shard:      { t: "Quarry Order", steps: ["The shard foreman wants three Dune Scorpion Knights cleared from the roads (0/3).", "Return to the foreman."] },
    bellow:     { t: "A Bellow in the Walls", steps: ["Old Mazeheart hears a bull under the oasis. Find the Bone Maze.", "Use the Bone Maze key at the wagon."] },
  };

  // ---------- rumours (heard by talking to townsfolk) ----------
  const RUMOURS = {
    orun: ["\"The new apprentices pick their teams today. They say no two teams play alike.\"", "\"The empire buys scholars. Not many go willingly.\"", "\"Old Dunmar keeps a cage no one is allowed to ask about.\""],
    sandpiper: ["\"A hound made of whispers walks the dunes at dusk. Those who see it keep their luck for a month.\"", "\"Scorpion shells from the Quarry are so hard they can be made into a ramming boot.\"", "\"The legions came in tower shields like a wall. I did not see one fall.\""],
    amber: ["\"The Bearer carries its stone on its back and guards its front with it. Strike the stone twice in a breath and it splits.\"", "\"Old Mazeheart under the oasis keeps a locked cage. A traveller says a bull bellows in the walls.\"", "\"A scholar owes everyone money. His red robe is the best cut in the city.\""],
    saltgate: ["\"The empire's tax ships dock at the north pier. They never unload anything.\"", "\"A kite maker says the jungle's feathers make slow cloth.\"", "\"The Quarry's ember slag burns clean. A fire-master from the jungle would pay for it.\""],
  };
  const LORE = {
    bearerBreak: "The Dune Bearer's stone guards its front. Two heavy impact blows in a row crack it (Amber Wells rumour).",
  };

  // ---------- bestiary text (short, in the apprentice's voice) ----------
  const BEST = {
    pipeSlug: "A pale slug with a crab claw. Slow. Spits goo.", inkImp: "Born of spilled lab ink. Fires blots.", cellarRatKing: "Three rats knotted together. Acts as a swarm.", dustWisp: "A dry spark in a jar. Weak to water.", gelatinCubeMimic: "A specimen box that grew legs. Hates fire.",
    sandstitchJackal: "A jackal with a scarab shell. Circles you and bites for bleed.", glassAdder: "Clear-hooded viper. Poison bite, then it hides in the sand.", dustwingImp: "Throws sand to lower Speed.", mirageCat: "Hits and flickers like heat haze.",
    raidShieldbearer: "Tower shield: takes less physical damage. Use spells.", raidSlinger: "Stays back and hits whoever is weakest.", raidTorchbearer: "Burns what it touches.", raidSpearman: "Reach attack: hits the front creature.", raidArcher: "Shoots the lowest-HP creature.",
    dripWraith: "A water ghost in the cistern.", boneCrab: "A skeleton crab. Brittle but hard.", cisternEel: "A fish with human teeth.", mossGolem: "A small golem of moss and stone.",
    raidOptioKarvan: "An imperial officer. Two shieldbearers at his side. Spells slip past the shields.",
    cinderlizardHound: "Salamander with a hound's head. Burns.", duneScorpionKnight: "Ram-skull shell. Slow and heavy. Drops Duneclaw Shards.", sunScarabSwarm: "Golden beetles that act together. Area spells.", saltHarpy: "Salt-crusted harpy. Fast, bleeds.", dustSphinxCub: "Asks riddles. Begins with a free Weaken.",
    quarryboundGargoyle: "Stone watcher of the Quarry.", slagImp: "Small and hot.", basaltSkin: "A little golem.", mirrorBeetle: "Reflects light spells.", mazeBat: "Flits through the bone walls.", boneBullCalf: "A young bone-bull. Charges.", emberScorpion: "Burning scorpion. Drops Cinderglass Embers.",
    duneWhisperer: "A hound of wind and sand with a mouth full of voices. It repeats what you said last night.", mazeGuardian: "A great bone-bull guarding the heart of the Maze. Break it with two heavy blows in a row.",
    duneBearer: "A builder Titan holding up a fallen sky-stone. The stone shields its front.",
  };

  // ---------- drops: item/mat/good, chance, count ----------
  const DROPS = {
    sandstitchJackal: [["scarabShell", 0.5], ["duneclawShard", 0.05]], glassAdder: [["adderFang", 0.5]], dustwingImp: [["impWing", 0.5]], mirageCat: [["catMist", 0.4]],
    raidShieldbearer: [["legionCoin", 0.5]], raidSlinger: [["legionCoin", 0.5]], raidTorchbearer: [["legionCoin", 0.5]], raidSpearman: [["legionCoin", 0.5]], raidArcher: [["legionCoin", 0.5]],
    dripWraith: [["curio", 0.4]], boneCrab: [["boneChip", 0.5]], cisternEel: [["curio", 0.4]], mossGolem: [["mossClump", 0.6]],
    cinderlizardHound: [["lizScale", 0.5], ["cinderglassEmber", 0.2]], duneScorpionKnight: [["scorpPlate", 0.5], ["duneclawShard", 0.18]], sunScarabSwarm: [["scarabShell", 0.6]], saltHarpy: [["saltCrust", 0.5]], dustSphinxCub: [["sandGlass", 0.4]],
    quarryboundGargoyle: [["scorpPlate", 0.3], ["duneclawShard", 0.08]], slagImp: [["emberSlag", 0.5]], basaltSkin: [["curio", 0.4]], mirrorBeetle: [["sandGlass", 0.5]], mazeBat: [["impWing", 0.5]], boneBullCalf: [["boneChip", 0.6]], emberScorpion: [["emberSlag", 0.4], ["cinderglassEmber", 0.2], ["cinderPlume", 0.05]],
    mazeGuardian: [["boneChip", 1]], pipeSlug: [["slimeJar", 0.6]], inkImp: [["inkVial", 0.6]], cellarRatKing: [["curio", 0.4]], dustWisp: [["sandGlass", 0.4]], gelatinCubeMimic: [["slimeJar", 0.6]],
  };

  // ---------- encounter tables (used when Core.ENCOUNTERS[id] is missing). group = [enemyId...]; lv = [lo, hi] ----------
  const ENC = {
    undercroft: { lv: [1, 2], groups: [["pipeSlug"], ["inkImp", "inkImp"], ["dustWisp", "dustWisp"], ["cellarRatKing"], ["gelatinCubeMimic"]] },
    dunes:      { lv: [3, 4], groups: [["sandstitchJackal", "sandstitchJackal"], ["glassAdder"], ["dustwingImp", "dustwingImp"], ["mirageCat"], ["raidShieldbearer", "raidSlinger"], ["sandstitchJackal"], ["glassAdder", "dustwingImp"]] },
    cistern:    { lv: [4, 5], groups: [["dripWraith"], ["boneCrab", "boneCrab"], ["cisternEel"], ["mossGolem"], ["raidTorchbearer", "raidShieldbearer"], ["dripWraith", "boneCrab"]] },
    basin:      { lv: [6, 7], groups: [["cinderlizardHound"], ["duneScorpionKnight"], ["sunScarabSwarm"], ["saltHarpy"], ["dustSphinxCub", "dustSphinxCub"], ["raidSpearman", "raidArcher"], ["cinderlizardHound", "saltHarpy"]] },
    quarry:     { lv: [7, 8], groups: [["quarryboundGargoyle"], ["slagImp", "slagImp"], ["basaltSkin", "basaltSkin"], ["mirrorBeetle"], ["duneScorpionKnight"], ["emberScorpion"]] },
    flats:      { lv: [7, 9], groups: [["cinderlizardHound", "cinderlizardHound"], ["emberScorpion"], ["slagImp", "slagImp"], ["emberScorpion", "cinderlizardHound"]] },
    boneMaze:   { lv: [7, 8], groups: [["mazeBat", "mazeBat"], ["boneBullCalf"], ["boneBullCalf", "mazeBat"], ["mirrorBeetle"]] },
    hollow:     { lv: [8, 10], groups: [["quarryboundGargoyle"], ["duneScorpionKnight"], ["raidSpearman", "raidArcher", "raidShieldbearer"], ["basaltSkin", "mirrorBeetle"], ["emberScorpion"]] },
  };
  // Stand-ins while A's enemies are missing: [art that exists today, name kept]
  const STAND_IN = { soldier: "legion", beast: "jackal", heavy: "scorpion" };
  const kindOf = id => /^raid/.test(id) ? "soldier" : /scorpion|golem|gargoyle|skin|bull|crab|beetle/i.test(id) ? "heavy" : "beast";

  // ---------- regions (fallback hub + metadata for music, backgrounds, fights) ----------
  // bg: art in assets/ ; fights: arena bg ("desert" | "ruins") ; npc ids are what talk() receives
  const REGIONS = {
    orun:      { n: "Orun, the Scholars' Academy", bg: "bg_desert", arena: "desert", music: "town", town: "orun", inn: "orun",
      npcs: [["mentor", "Master Ithiel", s => !s.f["pro.packed"]], ["oldDunmar", "Old Dunmar"], ["labMaster", "Lab Master"], ["merchant", "Academy shop"], ["innkeeper", "The Lamp and Quill"], ["r1", "A villager"], ["r2", "A passer-by"], ["r3", "A scholar"], ["lockedLabDoor", "The locked lab door"]],
      exits: [["undercroft", "Down to the Undercroft", s => s.f["pro.dunmar"] && !s.f["pro.lessons"]], ["vault", "The creature vault", s => s.f["pro.lessons"] && !s.f["pro.packed"], "trigger"], ["dunes", "Out through the south gate", s => s.f["pro.packed"]]],
      things: [], autos: ["orun.start", "orun.vaultAuto"] },
    undercroft:{ n: "Orun Undercroft", bg: "bg_ruins", arena: "ruins", music: "dungeon", table: "undercroft", fields: false,
      exits: [["lesson", "Go deeper (next lesson)", s => !s.f["pro.lessons"], "trigger"], ["orun", "Back up to Orun", s => true]], things: [["undercroftChest", "A dusty chest", s => !s.f["c.under"], "chest"]] },
    dunes:     { n: "Whisperglass Dunes", bg: "bg_desert", arena: "desert", music: "dunes", table: "dunes", fields: true,
      exits: [["sandpiper", "Walk to Sandpiper Rest", s => true], ["basin", "East along the road to the Amber Wells basin", s => s.f["ci.karvan"]]], things: [["dunesBuriedChest", "Dig by the humming ridge", s => !s.f["c.dunes1"], "chest"], ["duskWhisperer", "A whispering shape on the ridge", s => s.f["dunes.dusk"] && !s.f["l1.done"], "trigger"]], autos: ["dunes.start"] },
    sandpiper: { n: "Sandpiper Rest", bg: "bg_desert", arena: "desert", music: "oasis", town: "sandpiper", inn: "sandpiper",
      npcs: [["innkeeper", "Reed inn"], ["merchant", "Stall"], ["r1", "Tired traveller"], ["r2", "Woman at the well"], ["r3", "Caravan guard"]],
      exits: [["dunes", "Back to the dunes", s => true]], autos: ["sandpiper.arrive"] },
    cistern:   { n: "Cistern of the Burnt Gate", bg: "bg_ruins", arena: "ruins", music: "dungeon", table: "cistern", fields: true,
      npcs: [["burntGateSign", "The carved sign by the gate"]],
      exits: [["dunes", "Back out to the dunes", s => !s.f["ci.karvan"]], ["karvanAmbush", "The sealed gate ahead", s => !s.f["ci.karvan"], "trigger"], ["dunes", "Out through the opened gate", s => s.f["ci.karvan"]]],
      things: [["g5_bullringBronze", "A sunk chest", s => true, "chest"]] },
    amberWells:{ n: "Amber Wells", bg: "bg_desert", arena: "desert", music: "oasis", town: "amber", inn: "amber",
      npcs: [["innkeeper", "The Seventh Date"], ["merchant", "Market"], ["oldDunmar", "Old Dunmar's wagon"], ["redScholar", "Man in a red robe"], ["guildMaster", "Guild master"], ["r1", "Market gossip"], ["r2", "Old woman"], ["r3", "Labourer"]],
      exits: [["basin", "The basin road", s => true], ["maze", "The stair down to the Bone Maze", s => true]], autos: ["amber.arrive"] },
    basin:     { n: "Amber Wells Basin", bg: "bg_desert", arena: "desert", music: "desert", table: "basin", fields: true,
      exits: [["amberWells", "South to Amber Wells", s => true], ["dunes", "West to the dunes", s => true], ["quarry", "Scorpion Quarry", s => s.f["am.wagon"]], ["flats", "Cinderglass Flats", s => s.f["am.wagon"]], ["saltgate", "North to Saltgate", s => s.f["am.wagon"]], ["hollow", "The Hollow of the Sky-Stone", s => s.f["am.wagon"]]], things: [] },
    quarry:    { n: "Scorpion Quarry", bg: "bg_ruins", arena: "ruins", music: "dungeon", table: "quarry", fields: true,
      npcs: [["quarryForeman", "Quarry foreman"]],
      exits: [["basin", "Back to the basin", s => true]], things: [["g20_masonHammer", "A mason's chest", s => true, "chest"], ["duneclawShard", "Pick through the shard pile", s => !s.f["g.quarry"], "gather"]] },
    flats:     { n: "Cinderglass Flats", bg: "bg_desert", arena: "desert", music: "dungeon", table: "flats", fields: true,
      exits: [["basin", "Back to the basin", s => true]], things: [["g12_cinderSerpentPit", "A smouldering chest", s => true, "chest"], ["cinderglassEmber1", "Rake the first fire-pit", s => !s.f["g.ember1"], "gather"], ["cinderglassEmber2", "Rake the second fire-pit", s => !s.f["g.ember2"], "gather"], ["cinderPlume1", "A warm feather by the glass", s => !s.f["g.plume1"], "gather"], ["cinderPlume2", "Another warm feather", s => !s.f["g.plume2"], "gather"], ["flatsPool", "The hidden pool", s => true, "trigger"]] },
    maze:      { n: "The Bone Maze", bg: "bg_ruins", arena: "ruins", music: "ruins", table: "boneMaze", fields: true,
      npcs: [["oldMazeheart", "Old Mazeheart"]],
      exits: [["amberWells", "Back up to Amber Wells", s => true], ["mazeDeep", "Follow the bellowing", s => !s.f["k1.done"], "trigger"]], things: [["g4_wardenHalls", "The reward chest", s => s.f["k1.done"], "chest"]] },
    saltgate:  { n: "Saltgate", bg: "bg_desert", arena: "desert", music: "town", town: "saltgate", inn: "saltgate",
      npcs: [["innkeeper", "The Gull and Anchor"], ["merchant", "Smuggler's counter"], ["smuggler", "Captain on the dock", s => s.f["bear.done"]], ["customsOfficer", "Customs officer"], ["r1", "Dockhand"], ["r2", "Kite maker"], ["r3", "Lighthouse keeper"]],
      exits: [["basin", "Back down the basin road", s => true], ["boatToIxcalo", "The smuggler dock", s => s.f["bear.done"], "trigger"]], autos: ["saltgate.arrive"] },
    hollow:    { n: "Hollow of the Sky-Stone", bg: "bg_ruins", arena: "ruins", music: "ruins", table: "hollow", fields: true,
      npcs: [["campKeeper", "Field tent keeper"], ["skyShardLore", "The cracked shard"]],
      exits: [["basin", "Back to the basin", s => true], ["duneBearer", "The great door", s => !s.f["bear.done"], "trigger"]], things: [["hollowLoreChest", "A builder chest", s => true, "chest"]], autos: ["hollow.enter"] },
  };

  return { PACKS, MIRROR, NAMES, packOf, BANTER, ITEMS, GOODS, MATS, BOOK, priceOf, SETS, SLOTS, SLOT_NAMES, pieceId, pieceName, SHOPS, INNS, QUESTS, RUMOURS, LORE, BEST, DROPS, ENC, STAND_IN, kindOf, REGIONS, TIER_FLASK };
})();
window.Data = Data;
