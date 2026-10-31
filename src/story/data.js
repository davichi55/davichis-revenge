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
      boat:   [["bulwyrm", "Water. I do not swim. I sink."], ["rotfang", "Salt on my scales. Terrific."], ["stillgaze", "Who crosses a sea comes back changed, or does not."]],
      idle:   [["bulwyrm", "..."], ["rotfang", "I could hate this town, easily. It's cosy."], ["stillgaze", "What has a roof but no walls? Ask me later."]],
      lab:    [["bulwyrm", "You brought bread. I remember."], ["rotfang", "Fine. I trusted you. Once. Happy?"], ["stillgaze", "The riddle was always you."]],
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
    antidote: { n: "Reed Antidote",   d: "Clears burn, bleed, poison, shock, chill and slow from one creature, and any lowered stat. Not Wet.", f: 0.6 },
    tonic:    { n: "Clearwater Tonic", d: "Cures every status, Wet included, and every lowered stat on one creature.", f: 1.5 },
    ember:    { n: "Ashen Ember",     d: "Revives a fallen creature at 30% HP, in a fight or from the menu.", f: 4, use: "revive" },
    incense:  { n: "Wayfarer's Incense", d: "Halves the fight rate for about 5 minutes of walking.", f: 2, use: "charm" },
    candle:   { n: "Lure Candle",     d: "Doubles the fight rate for about 5 minutes.", f: 1, use: "charm" },
    cinderBomb: { n: "Cinder Bomb", d: "Fire damage, adds burn. Never counts toward a break.", f: 1.8 },
    rimeFlask:  { n: "Rime Flask",  d: "Ice damage, adds chill. Never counts toward a break.", f: 1.8 },
    soakJar:    { n: "Soak Jar",    d: "Makes an enemy Wet. Never counts toward a break.", f: 1.8 },
    sparkJar:   { n: "Spark Jar",   d: "Lightning damage, adds shock. Never counts toward a break.", f: 1.8 },
    venomPot:   { n: "Venom Pot",   d: "Poison damage, adds a poison stack. Never counts toward a break.", f: 1.8 },
    cinderWard: { n: "Cinder-Ward", d: "One creature takes 25% less fire damage for 3 turns.", f: 1.5 },
    rimeWard:   { n: "Rime-Ward",   d: "One creature takes 25% less ice and water damage for 3 turns.", f: 1.5 },
    stormWard:  { n: "Storm-Ward",  d: "One creature takes 25% less lightning damage for 3 turns.", f: 1.5 },
    venomWard:  { n: "Venom-Ward",  d: "One creature takes 25% less poison damage for 3 turns.", f: 1.5 },
    soulDew:    { n: "Soul Dew",    d: "Revives a fallen creature at full HP. Once per fight. Not sold.", f: 0, key: false },
    keyK1:      { n: "Bone Maze Key", d: "Opens a cell in the Menagerie Wagon.", key: true },
    wardstone:  { n: "Wardstone", d: "A charm: halves the fight rate for good.", key: true },
    journal:    { n: "Field Journal", d: "Your satchel of notes. Everything you see goes in.", key: true },
  };
  // trade goods (sellable, no other use) and skill-book materials
  const GOODS = { sandGlass: ["Glass-Sand Vial", 6], scarabShell: ["Scarab Shell", 7], adderFang: ["Adder Fang", 8], impWing: ["Imp Wing", 6], slimeJar: ["Slug Slime", 4], inkVial: ["Ink Vial", 5], boneChip: ["Bone Chip", 6],
    scorpPlate: ["Scorpion Plate", 14], emberSlag: ["Ember Slag", 12], legionCoin: ["Legion Coin", 9], lizScale: ["Lizard Scale", 10], saltCrust: ["Salt Crust", 9], curio: ["Odd Curio", 5], mossClump: ["Cistern Moss", 6], catMist: ["Heat-Haze Jar", 8] };
  const MATS = { duneclawShard: ["Duneclaw Shard", "Hard as a mason's chisel."], cinderglassEmber: ["Cinderglass Ember", "A coal that never goes out."], cinderPlume: ["Cinder Plume", "A feather that is warm on one side."] };
  // skill book: 10 pieces unlock a move that any creature can equip in its off-style slot
  const BOOK = {
    ramStrike: { n: "Ram Strike", mat: "duneclawShard", need: 10, d: "Impact move, 2 MP. Counts toward impact breaks.", move: "ramStrike" },
    kindle:    { n: "Kindle", mat: "cinderglassEmber", need: 10, d: "Fire move, 2 MP. Adds burn.", move: "kindle" },
    revive:    { n: "Revive", mat: "cinderPlume", need: 10, d: "Revives a fallen ally at 20% HP, 3 MP.", move: "revive" },
  };
  const priceOf = (key, tier) => {
    const it = ITEMS[key]; if (!it || it.f == null) return 0;
    return Math.round(TIER_FLASK[tier] * it.f);
  };

  // ---------- gear sets: all 46 of GEAR_SETS.md (owner RULES-GEAR) ----------
  // pieces = [helm, armour, weapon]. Each set has 3 bonuses b[]: n name, d full-set text, d2 two-piece text, fx = the tag the battle rules read (u.fx[tag], src/core.js "gear set bonuses"),
  // st = the part Flow.applyGear applies to the stats: [full, two-piece] as percent (hp def res spd xp) or MP (startMp). Texts say exactly what the rules do (test-gear.js checks the numbers).
  // bn(name, "text with {} for each number", fullNumbers, twoPieceNumbers | twoPieceText, { fx, st })
  const fmt = (t, a) => { let i = 0; return t.replace(/\{\}/g, () => a[i++]); };
  const bn = (n, t, full, half, o) => Object.assign({ n, d: fmt(t, full), d2: Array.isArray(half) ? fmt(t, half) : half }, o);
  const SETS = {
    G1: { n: "Gladiator of the Black Sand", pieces: ["Bronze-and-Obsidian Helm", "Sand-Stained Greaves", "Heavy Trident-Blade"], b: [
      bn("Arena Favourite", "Deal +{}% damage to broken enemies, on top of the normal break bonus.", [20], [10], { fx: "arenaFavourite" }),
      bn("Crowd Roar", "The first time one of your moves breaks an enemy each turn, you gain +1 MP.", [], "Only the first enemy you break each fight gives +1 MP.", { fx: "crowdRoar" }),
      bn("Sand Underfoot", "Moves that cost HP, such as Reckless Blow, cost {}% less HP.", [25], [12], { fx: "sandUnderfoot" })] },
    G2: { n: "Horn of the Sun Bull", pieces: ["Gilded Horn-Cap", "Golden Breastplate", "Sun Gladius"], b: [
      bn("Momentum", "Basic attacks on the same target in a row each deal {}% more damage than the one before, up to +{}%. Any other move, or a new target, starts over.", [10, 30], [5, 15], { fx: "momentum" }),
      bn("Heavy Hitter", "Moves that cost 3 MP deal +{}% damage, but you have {}% less Speed.", [20, 15], [10, 8], { fx: "heavyHitter", st: { spd: [-15, -8] } }),
      bn("Fed by Blood", "Your basic attack gives +1 extra MP when the target is broken.", [], "Every second basic attack on a broken target gives +1 extra MP.", { fx: "fedByBlood" })] },
    G3: { n: "Furious Centurion", pieces: ["Red-Crested Helm", "Scarred Scale Armour", "Notched Blade"], b: [
      bn("Bottled Fury", "Wrath adds {}% more of the damage it stored to your next hit.", [50], [25], { fx: "bottledFury" }),
      bn("Thick Skin of Spite", "Below half HP, you take {}% less physical damage.", [20], [10], { fx: "spiteSkin" }),
      bn("Berserker's Oath", "Below half HP, you deal +{}% damage.", [25], [12], { fx: "berserkOath" })] },
    G4: { n: "Warden of the Winding Halls", pieces: ["Maze-Pattern Helm", "Bronze Maze Plate", "Long-Hafted Axe"], b: [
      bn("Dead End", "Impact moves (Labyrinth Charge, Earthshaker and so on) count one extra hit toward breaks.", [], "The first impact move each turn counts one extra hit toward breaks.", { fx: "deadEnd" }),
      bn("Opening Charge", "Your first move of the fight deals +{}% damage.", [40], [20], { fx: "openingCharge" }),
      bn("Cheap Cruelty", "Attacks that cost 1 MP deal +{}% damage.", [25], [12], { fx: "cheapCruelty" })] },
    G5: { n: "Bullring Bronze", pieces: ["Nose-Ring Helm", "Bronze Cuirass", "Bull-Horn Blade"], b: [
      bn("Bull's Constitution", "+{}% max HP.", [15], [7], { st: { hp: [15, 7] } }),
      bn("Horn Counter", "When a physical attack hits you, the attacker takes {}% of that damage back.", [15], [8], { fx: "hornCounter" }),
      bn("Iron Nose Ring", "{}% of the stuns, slows and Speed drops used against you fail.", [25], [12], { fx: "ironNose" })] },
    G6: { n: "Windfeather Scout", pieces: ["Feathered Cap", "Plume Jerkin", "Hooked Blade"], b: [
      bn("Tailwind Weave", "Your Tailwind gives +{}% Speed instead of +30%.", [45], [37.5], { fx: "tailwindWeave" }),
      bn("Quick Talons", "+{}% Speed.", [15], [7], { st: { spd: [15, 7] } }),
      bn("First Gust", "+{}% Speed during the first round of a fight.", [40], [20], { fx: "firstGust" })] },
    G7: { n: "Razor Plume", pieces: ["Glass-Edged Crest", "Razor-Feather Mantle", "Plume Dagger"], b: [
      bn("Keen Edge", "Critical hits deal {}x damage instead of 1.5x.", [1.8], [1.65], { fx: "critDmg" }),
      bn("Hundred Cuts", "In a move with several hits, the 2nd hit deals +{}%, the 3rd +{}% and later hits +{}%.", [10, 20, 30], [5, 10, 15], { fx: "hundredCuts" }),
      bn("Open Wounds", "Bleed you apply lasts 1 turn longer.", [], "Every second bleed you apply lasts 1 turn longer.", { fx: "openWounds" })] },
    G8: { n: "Condor Tower Watch", pieces: ["Lookout's Hood", "Watchman's Cloak", "Tower Spear"], b: [
      bn("Reward the Hunt", "The first time you land a critical hit each turn, you gain +1 MP.", [], "Only the first critical hit each fight gives +1 MP.", { fx: "rewardHunt" }),
      bn("Hawk Eye", "+{}% chance to land critical hits, added to your normal chance.", [10], [5], { fx: "critChance" }),
      bn("Death From Above", "The strike that follows Dive deals +{}% damage, on top of Dive's own bonus.", [50], [25], { fx: "deathFromAbove" })] },
    G9: { n: "Obsidian Talon Skirmisher", pieces: ["Smoke-Black Hood", "Smoke-Black Cloak", "Obsidian Talons"], b: [
      bn("Glancing Feathers", "Dive and Hit and Run cut damage taken by {} points more (Dive {}% instead of 30%, Hit and Run {}% instead of 25%).", [15, 45, 40], [8, 38, 33], { fx: "glancingFeathers" }),
      bn("Unseen Retreat", "If you took no damage since your last turn, you deal +{}% damage this turn.", [20], [10], { fx: "unseenRetreat" }),
      bn("Swift Recovery", "Heal {}% of your max HP for every hit you land, at most {}% per move.", [2, 6], [1, 3], { fx: "swiftRecovery" })] },
    G10: { n: "Snatcher's Plumage", pieces: ["Ragged Feather Hood", "Patchwork Plumage", "Hooked Hand-Blade"], b: [
      bn("Thief's Hands", "Snatch also gives you the buff it takes, for as long as it had left.", [], "Snatch also gives you the buff it takes, for 1 turn only.", { fx: "thiefsHands" }),
      bn("Shrill Echo", "Moves that lower Speed, such as Shriek, lower it {}% more.", [50], [25], { fx: "shrillEcho" }),
      bn("Wind Cutter", "+{}% damage against enemies slower than you.", [20], [10], { fx: "windCutter" })] },
    G11: { n: "Venomfang Legion", pieces: ["Serpent-Fang Helm", "Green-Black Scale Mail", "Venom-Dripping Short Sword"], b: [
      bn("Toxic Edge", "+{}% poison damage, from poison hits and from the poison itself.", [25], [12], { fx: "toxicEdge" }),
      bn("Virulent", "The first poison you apply each turn adds +1 stack.", [], "The first poison you apply on every second turn adds +1 stack.", { fx: "virulent" }),
      bn("Lean Brew", "Poison moves cost 1 less MP (never below 1).", [], "Every second poison move costs 1 less MP (never below 1).", { fx: "leanBrew" })] },
    G12: { n: "Cinder Serpent Pit", pieces: ["Smoke-Grey Hood", "Coal-Red Plate", "Cinder Rod"], b: [
      bn("Slow Burn", "Burn you apply lasts 1 turn longer.", [], "Every second burn you apply lasts 1 turn longer.", { fx: "slowBurn" }),
      bn("Ember Heart", "+{}% fire damage, from fire hits and from burn.", [20], [10], { fx: "emberHeart" }),
      bn("Ashen Skin", "You take {}% less fire damage, burn included.", [20], [10], { fx: "ashenSkin" })] },
    G13: { n: "Bloodletter's Altar", pieces: ["Priest's Red Cowl", "Red-Stained Apron", "Curved Sacrificial Blade"], b: [
      bn("Deep Cuts", "Bleed you apply deals +{}% damage.", [25], [12], { fx: "deepCuts" }),
      bn("Rupture Rite", "Rupture deals +{}% damage.", [30], [15], { fx: "ruptureRite" }),
      bn("Hunger for Red", "You heal {}% of the damage your bleed deals.", [10], [5], { fx: "hungerRed" })] },
    G14: { n: "Chorus of Many Heads", pieces: ["Nine-Headed Crest", "Layered Scale Mail", "Hydra-Tooth Spear"], b: [
      bn("Louder Chorus", "Many Heads adds +{}% damage over time for each different status on the target, instead of +10%.", [15], [12], { fx: "louderChorus" }),
      bn("Cocktail", "Enemies with 3 or more different statuses take +{}% damage from you.", [15], [7], { fx: "cocktail" }),
      bn("Quickened Rot", "Fester ticks every damage-over-time status {} times instead of once.", [1.5], [1.25], { fx: "quickenedRot" })] },
    G15: { n: "Marsh Witch's Regrowth", pieces: ["Reed Crown", "Bog-Wood Mantle", "Staff of Tangled Roots"], b: [
      bn("Regrowth", "Regrow a Head heals {}% more.", [50], [25], { fx: "regrowth" }),
      bn("Early Rot", "Burn, bleed, poison and shock you apply during your first 2 turns deal +{}% damage.", [50], [25], { fx: "earlyRot" }),
      bn("Antivenom Blood", "{}% of the status effects used against you fail.", [30], [15], { fx: "hardToRattle" })] },
    G16: { n: "Tower Shield Phalanx", pieces: ["Bronze Helm", "Tower Shield", "Short Stabbing Sword"], b: [
      bn("Wall", "+{}% Defense.", [20], [10], { st: { def: [20, 10] } }),
      bn("Shield Brother", "Enemy attacks that Bulwark sends onto you deal {}% less damage.", [25], [12], { fx: "shieldBrother" }),
      bn("Locked Shields", "Shield Wall cuts the team's damage taken by {}% instead of 30%.", [40], [35], { fx: "lockedShields" })] },
    G17: { n: "Stoneguard of the Sun Gate", pieces: ["Mirror-Disc Helm", "Mirror-Disc Plate", "Sun-Gate Shield"], b: [
      bn("Mirror Plate", "+{}% Resistance.", [20], [10], { st: { res: [20, 10] } }),
      bn("Warded Against Elements", "Damage of any element (fire, water, shock and so on), burn, poison and shock damage over time included, is {}% less. Plain physical hits and bleed are not reduced.", [15], [7], { fx: "warded" }),
      bn("Cleansing Pillar", "At the start of each of your turns, the status effect with the most stacks is removed from you.", [], "On every second turn, the status effect with the most stacks is removed from you.", { fx: "cleansing" })] },
    G18: { n: "Counterstrike Bastion", pieces: ["Spiked Helm", "Spiked Plates", "Heavy Mace"], b: [
      bn("Spiked Facing", "Counter Stance's counter-attack deals +{}% damage.", [40], [20], { fx: "spikedFacing" }),
      bn("Weighty Blows", "Crushing Weight deals +{}% damage.", [30], [15], { fx: "weightyBlows" }),
      bn("Reprisal", "Each time you are hit, your next attack deals +{}% more damage, up to {} hits (+{}%).", [10, 3, 30], [5, 3, 15], { fx: "reprisal" })] },
    G19: { n: "Challenge Banner Cohort", pieces: ["Standard-Bearer's Crest", "Stone Mantle", "Carved Pillar-Shaft"], b: [
      bn("Provocation", "Challenge lasts 1 turn longer.", [], "Every second Challenge lasts 1 turn longer.", { fx: "provocation" }),
      bn("Absorb", "The first time you are hit each turn, you gain +1 MP.", [], "The first time you are hit on every second turn, you gain +1 MP.", { fx: "absorb" }),
      bn("Heavy Sleeper", "While Challenge is active, you take {}% less damage.", [15], [7], { fx: "heavySleeper" })] },
    G20: { n: "Quarry Mason's Hammer", pieces: ["Mason's Cap", "Quarry Apron", "Mason's Hammer"], b: [
      bn("Earthquake", "Earthshaker deals +{}% damage and its stun chance is {} points higher.", [30, 10], [15, 5], { fx: "earthquake" }),
      bn("Pillar Fist", "Basic attacks add {}% of your Defense as extra damage.", [25], [12], { fx: "pillarFist" }),
      bn("Full Strength", "+{}% damage while your HP is full.", [20], [10], { fx: "fullStrength" })] },
    G21: { n: "Sunpriest's Vestments", pieces: ["Sun-Disc Helm", "Golden Feather Vestments", "Staff of Warm Light"], b: [
      bn("Radiant Healing", "Your healing moves heal {}% more.", [20], [10], { fx: "radiantHealing" }),
      bn("Frugal Light", "Healing moves cost 1 less MP (never below 1).", [], "Every second healing move costs 1 less MP (never below 1).", { fx: "frugalLight" }),
      bn("Overflowing Light", "Healing above an ally's max HP becomes a shield for 2 turns, worth up to {}% of their max HP.", [10], [5], { fx: "overflowingLight" })] },
    G22: { n: "Ashen Pyre Order", pieces: ["Ash-Grey Hood", "Ember-Trimmed Robes", "Pyre-Tender's Rake"], b: [
      bn("Rebirth Rite", "Rebirth revives at {}% HP instead of 30%.", [50], [40], { fx: "rebirthRite" }),
      bn("Longer Ember", "From the Ashes raises you at {}% HP instead of 25%.", [40], [33], { fx: "longerEmber" }),
      bn("Ashen Mantle", "Allies you revive (Rebirth, Revive), and you when From the Ashes raises you, return with a shield for 2 turns worth {}% of max HP.", [15], [8], { fx: "ashenMantle" })] },
    G23: { n: "Cleanser's Reed Garland", pieces: ["Crown of River Reeds", "Clear White Cloth", "Cleanser's Reed Wand"], b: [
      bn("Healing Flame", "Cleansing Flame, Purge and Silver Lining also heal each cleansed ally for {}% of their max HP.", [8], [4], { fx: "healingFlame" }),
      bn("Quick Purge", "Purge costs 1 less MP (never below 1).", [], "Every second Purge costs 1 less MP (never below 1).", { fx: "quickPurge" }),
      bn("Inoculation", "An ally you cleanse resists those statuses {}% of the time until the end of the round.", [50], [25], { fx: "inoculation" })] },
    G24: { n: "Shieldbearer Aviary", pieces: ["White-Plume Crest", "Layered Shield Plumage", "Gilded Plume Staff"], b: [
      bn("Strong Ward", "Flame Ward absorbs {}% more damage.", [30], [15], { fx: "strongWard" }),
      bn("Lingering Ward", "Shields you cast (Flame Ward, Silver Lining, Plant the Pillar) last 1 turn longer.", [], "Every second shield you cast lasts 1 turn longer.", { fx: "lingeringWard" }),
      bn("Scorching Ward", "When a shield you cast is broken, the attacker is burned (1 stack).", [], "When a shield you cast is broken, the attacker is burned (1 stack) for 1 turn only.", { fx: "scorchingWard" })] },
    G25: { n: "Dawn-Fire Offering", pieces: ["Morning-Red Hood", "Dawn-Red Vestments", "Fire-Bowl Censer"], b: [
      bn("Brighter Sun", "Sunfire deals +{}% damage, and the share of that damage it heals is {}% bigger.", [25, 25], [12, 12], { fx: "brighterSun" }),
      bn("Kind Peck", "Your basic attack also heals the ally with the lowest HP for {}% of their max HP.", [4], [2], { fx: "kindPeck" }),
      bn("Kindled Heart", "Start each fight with {} extra MP.", [2], [1], { st: { startMp: [2, 1] } })] },
    G26: { n: "Stonegaze Order", pieces: ["Slit-Eyed Mask", "Grey Stone Cloak", "Gazer's Rod"], b: [
      bn("Hard Stare", "Stone Gaze lands {} points more often (a base chance of {}% becomes {}%).", [20, 70, 90], [10, 70, 80], { fx: "hardStare" }),
      bn("Deep Weakness", "Stat reductions you apply are {}% stronger.", [25], [12], { fx: "deepWeakness" }),
      bn("Cheap Stone", "Stone Gaze costs 1 less MP (never below 1).", [], "Every second Stone Gaze costs 1 less MP (never below 1).", { fx: "cheapStone" })] },
    G27: { n: "Venom Mark Assassins", pieces: ["Dark Assassin's Hood", "Night-Dyed Leathers", "Poisoned Needle-Blade"], b: [
      bn("Deeper Exposure", "Exposed adds +{}% damage per debuff on the target instead of +5%, still at most +25%.", [8], [6], { fx: "deeperExposure" }),
      bn("Exploit", "+{}% damage against enemies with 2 or more debuffs (statuses or lowered stats).", [15], [7], { fx: "exploit" }),
      bn("Long Marks", "Stat reductions you apply last 1 turn longer.", [], "Every second stat reduction you apply lasts 1 turn longer.", { fx: "longMarks" })] },
    G28: { n: "Shatterer's Chisel", pieces: ["Stonecutter's Cap", "Stonecutter's Smock", "Shatterer's Chisel"], b: [
      bn("Cracking", "Crack Armour lowers Defense {}% more ({}% instead of 25%).", [50, 37.5], [25, 31.25], { fx: "cracking" }),
      bn("Shell Cracker", "Crack Armour and Shatter Shield count one extra hit toward shell breaks.", [], "The first of them each turn counts one extra hit toward shell breaks.", { fx: "shellCracker" }),
      bn("Armour Piercer", "Your hits ignore {}% of the enemy's Defense and Resistance.", [15], [7], { fx: "armourPiercer" })] },
    G29: { n: "Coil of the Slow Hour", pieces: ["Sundial Helm", "Bronze Arm-Coils", "Slow-Hour Rod"], b: [
      bn("Tighter Coil", "When Coil lands, it also lowers the enemy's Speed by {}% for 2 turns.", [20], [10], { fx: "tighterCoil" }),
      bn("Chain Breaker", "Bosses wear down more slowly against your control moves: each earlier control hit on a boss cuts your next chance by {}% instead of 50%.", [37.5], [44], { fx: "chainBreaker" }),
      bn("Heavy Feet", "Enemies whose Speed you lowered take +{}% damage from everyone.", [10], [5], { fx: "heavyFeet" })] },
    G30: { n: "Serpent-Haired Veil", pieces: ["Bronze-Snake Veil", "Serpent-Hair Mantle", "Hissing Staff"], b: [
      bn("Quiet Hiss", "Hiss lowers Attack {}% more ({}% instead of 25%).", [50, 37.5], [25, 31.25], { fx: "quietHiss" }),
      bn("Calm Eyes", "You take {}% less damage from enemies whose Attack you have lowered.", [20], [10], { fx: "calmEyes" }),
      bn("Lasting Curse", "Curse of Stone lasts 1 turn longer.", [], "Every second Curse of Stone lasts 1 turn longer.", { fx: "lastingCurse" })] },
    G31: { n: "Emberscale Mantle", pieces: ["Flame-Shaped Crest", "Emberscale Mantle", "Ember Fang"], b: [
      bn("Dragonfire", "+{}% fire damage, from fire hits and from burn.", [20], [10], { fx: "emberHeart" }),
      bn("Fire Thrift", "Fire spells cost 1 less MP (never below 1).", [], "Every second fire spell costs 1 less MP (never below 1).", { fx: "fireThrift" }),
      bn("Fireproof Hide", "You take {}% less fire damage, burn included.", [20], [10], { fx: "ashenSkin" })] },
    G32: { n: "Tideglass Regalia", pieces: ["Tideglass Crown", "Glass-Scaled Plates", "Tideglass Wand"], b: [
      bn("Deep Frost", "+{}% water and ice damage.", [20], [10], { fx: "deepFrost" }),
      bn("Lingering Damp", "Wet and Chill you apply last 1 turn longer.", [], "Every second Wet or Chill you apply lasts 1 turn longer.", { fx: "lingeringDamp" }),
      bn("Brittle Freeze", "A Freeze (Wet + Chill) you cause also lowers the target's Defense by {}% for 3 turns.", [15], [7], { fx: "brittleFreeze" })] },
    G33: { n: "Stormcaller's Obsidian Crown", pieces: ["Obsidian Crown", "Copper-Spiked Mantle", "Stormcaller's Rod"], b: [
      bn("Storm Surge", "+{}% lightning damage, from shock hits and from shock.", [20], [10], { fx: "stormSurge" }),
      bn("Wet Conductor", "Lightning on a Wet target deals {}x damage instead of 2x.", [2.5], [2.25], { fx: "wetConductor" }),
      bn("Cheap Thunder", "Lightning spells cost 1 less MP (never below 1).", [], "Every second lightning spell costs 1 less MP (never below 1).", { fx: "cheapThunder" })] },
    G34: { n: "Reaction Scholar's Regalia", pieces: ["Diagram Cap", "Scholar's Robe", "Annotated Rod"], b: [
      bn("Master of Mixing", "Combo Master reactions deal +{}% instead of +30%.", [50], [40], { fx: "masterMixing" }),
      bn("Charged Attune", "Attune also gives the next move you use that costs MP +{}% damage.", [15], [7], { fx: "chargedAttune" }),
      bn("Sharper Detonation", "Detonate deals +{}% damage.", [30], [15], { fx: "sharperDetonate" })] },
    G35: { n: "Aether Bulb Circlet", pieces: ["Glass-Bulb Circlet", "Aether Robe", "Spark Staff"], b: [
      bn("Element Dance", "A spell of a different element than your last spell deals +{}% damage.", [20], [10], { fx: "elementDance" }),
      bn("Wide Burn", "Spells that hit all enemies deal +{}% damage.", [20], [10], { fx: "wideBurn" }),
      bn("Primed", "Start each fight with {} extra MP.", [2], [1], { st: { startMp: [2, 1] } })] },
    G36: { n: "Abyssal Trident", pieces: ["Black-Pearl Crown", "Dark-Coral Mail", "Abyssal Trident"], b: [
      bn("Heavier Tide", "Maelstrom and Tidal Wave deal +{}% damage.", [20], [10], { fx: "heavierTide" }),
      bn("Deeper Reservoir", "Your Tide can grow to 6 instead of 5.", [], "You start each fight with 1 Tide.", { fx: "deeperReservoir" }),
      bn("Long Breath", "Deep Breath gives +1 extra Tide.", [], "Every second Deep Breath gives +1 extra Tide.", { fx: "longBreath" })] },
    G37: { n: "Kraken-Hide", pieces: ["Kraken Hood", "Hull-Ribbed Hide Plates", "Kraken-Tooth Hook"], b: [
      bn("Pressure Skin", "With 3 or more Tide, you take {}% less damage.", [15], [7], { fx: "pressureSkin" }),
      bn("Salvage the Deep", "If you are knocked out, you keep {}% of your Tide when you are revived.", [50], [25], { fx: "salvage" }),
      bn("Thick Blubber", "+{}% max HP.", [15], [7], { st: { hp: [15, 7] } })] },
    G38: { n: "Whirlpool Siren", pieces: ["Spiral Shell Crest", "Siren's Shell Mantle", "Conch Horn"], b: [
      bn("Dragging Current", "Riptide also lowers the target's Speed by {}% for 2 turns.", [15], [7], { fx: "draggingCurrent" }),
      bn("Long Hunger", "Abyssal Hunger gives you 1 extra MP.", [], "Every second Abyssal Hunger gives you 1 extra MP.", { fx: "longHunger" }),
      bn("Surging Undertow", "Undertow gives +1 extra Tide against a broken enemy.", [], "Every second Undertow on a broken enemy gives +1 extra Tide.", { fx: "surgingUndertow" })] },
    G39: { n: "Tidal Executioner", pieces: ["Dark-Blue Helm", "Dark-Blue Armour", "Drowning Net"], b: [
      bn("Finishing Wave", "Maelstrom and Tidal Wave deal +{}% damage to broken enemies.", [30], [15], { fx: "finishingWave" }),
      bn("Crashing Wave", "A release at maximum Tide also makes its targets Wet.", [], "A release at maximum Tide also makes its targets Wet for 1 turn only.", { fx: "crashingWave" }),
      bn("Patient Predator", "+{}% damage for each round of the fight after the first, up to +{}%.", [4, 20], [2, 10], { fx: "patientPredator" })] },
    G40: { n: "Deep Current Trench", pieces: ["Tide-Stone Helm", "Barnacled Plates", "Trench Anchor"], b: [
      bn("Deeper Well", "+{} max MP (the usual cap is 10, or 15 for a Leviathan).", [3], [1], { fx: "deeperWell" }),
      bn("Heavy Tail", "Tail Slap and Undertow deal +{}% damage.", [30], [15], { fx: "heavyTail" }),
      bn("Salt Armour", "+{}% Resistance.", [15], [7], { st: { res: [15, 7] } })] },
    G41: { n: "Wayfarer's Road Kit", pieces: ["Road Hood", "Travelling Cloak", "Wayfarer's Knife"], b: [
      bn("Sturdy Boots", "+{}% max HP.", [10], [5], { st: { hp: [10, 5] } }),
      bn("Ready Hands", "Start each fight with 1 extra MP.", [], "Your first basic attack each fight gives +1 extra MP.", { st: { startMp: [1, 0] }, fx: "readyHands" }),
      bn("Fast Learner", "This creature earns +{}% experience from fights.", [15], [7], { st: { xp: [15, 7] } })] },
    G42: { n: "Legion Standard", pieces: ["Plumed Legion Helm", "Red Cloak and Tower Shield", "Legion Gladius"], b: [
      bn("Disciplined Ranks", "+{}% damage.", [8], [4], { fx: "disciplined" }),
      bn("Shoulder to Shoulder", "+{}% Defense and Resistance.", [10], [5], { st: { def: [10, 5], res: [10, 5] } }),
      bn("Last Stand", "Below 25% HP, you deal +{}% damage.", [25], [12], { fx: "lastStand" })] },
    G43: { n: "Sunstone Regalia", pieces: ["Jade Circlet", "Gold-and-Jade Regalia", "Sunstone Sceptre"], b: [
      bn("Brilliant Edge", "Critical hits deal {}x damage instead of 1.5x.", [1.8], [1.65], { fx: "critDmg" }),
      bn("Fortune's Eye", "+{}% chance to land critical hits, added to your normal chance.", [10], [5], { fx: "critChance" }),
      bn("Persuasive Poison", "Your status effects and control moves land {}% more often.", [15], [7], { fx: "persuasive" })] },
    G44: { n: "Initiate's Mask", pieces: ["Plain Wooden Mask", "White Linen Robe", "Temple Reed Staff"], b: [
      bn("Quiet Mind", "Start each fight with at least {} MP. A creature that already starts with that much gains nothing.", [2], [1], { st: { minMp: [2, 1] } }),
      bn("Empty Hands", "When you have 0 MP, your basic attack gives +1 extra MP.", [], "Once per fight, when you have 0 MP, your basic attack gives +1 extra MP.", { fx: "emptyHands" }),
      bn("Thrifty Caster", "The first move you use each turn that costs MP costs 1 less (never below 1).", [], "On every second turn, the first move you use that costs MP costs 1 less (never below 1).", { fx: "thrifty" })] },
    G45: { n: "Stoneweather Cloak", pieces: ["Sun-Bleached Hood", "Thick Grey Cloak", "Weathered Staff"], b: [
      bn("Hard to Rattle", "{}% of the status effects used against you fail.", [30], [15], { fx: "hardToRattle" }),
      bn("Shake It Off", "Status effects on you last 1 turn shorter (at least 1 turn).", [], "Only burn and poison on you last 1 turn shorter (at least 1 turn).", { fx: "shakeOff" }),
      bn("Thick Skin", "You ignore the first status effect used against you each fight.", [], "The first status effect used against you each fight lasts only 1 turn.", { fx: "thickSkin" })] },
    G46: { n: "Triumph Parade Regalia", pieces: ["Gold-Trimmed Parade Helm", "Bright Triumph Cloak", "Parade Standard"], b: [
      bn("Quick Step", "+{}% Speed.", [15], [7], { st: { spd: [15, 7] } }),
      bn("Overtake", "You get your extra third action at {}x the fastest enemy's Speed instead of 2x.", [1.8], [1.9], { fx: "overtake" }),
      bn("First Out", "You act first in round 1. Several creatures that act first go by Speed.", [], "+25% Speed during the first round of a fight.", { fx: "firstOut" })] },
  };
  const SLOTS = ["helm", "armor", "weapon"], SLOT_NAMES = { helm: "Helm", armor: "Armour", weapon: "Weapon" };
  const pieceId = (set, slot) => set + "." + slot;
  const pieceName = (pid) => { const [s, sl] = pid.split("."); return SETS[s].pieces[SLOTS.indexOf(sl)]; };

  // ---------- shops ----------
  // stock entries: item key | "gear:G41" (pieces in fixed order) ; buys: multiplier for trade goods ; disc: price multiplier
  const BASICS = ["sunwater", "antidote"];
  const SHOPS = {
    orun:     { n: "Academy shop", who: "clerk", tier: 0, stock: ["sunwater", "antidote"], buys: 1.0 },
    sandpiper:{ n: "Sandpiper Rest stall", who: "clerk", stock: [...BASICS, "gear:G41"], gearPrice: { G41: [100, 160, 140] }, buys: 1.0 },
    amber:    { n: "Amber Wells market", who: "merchant", stock: [...BASICS, "tonic", "ember", "incense", "cinderBomb", "rimeFlask", "soakJar", "sparkJar", "venomPot", "gear:G45"], gearPrice: { G45: [140, 240, 180] }, buys: 1.0 },
    saltgate: { n: "Smuggler's counter", who: "merchant", stock: [...BASICS, "incense", "cinderBomb", "rimeFlask", "soakJar", "sparkJar", "venomPot"], disc: { cinderBomb: 0.8, rimeFlask: 0.8, soakJar: 0.8, sparkJar: 0.8, venomPot: 0.8 }, buys: 1.2 },
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
