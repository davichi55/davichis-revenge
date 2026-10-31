// Creature generals: the lines the 27 starters speak when the empire's collar bends them (BUILD_PLAN_2, ARCHITECT).
// Data.GENERAL_LINES[creatureId] = { meet, fight, brk, freed, memories }  (plain strings, the speaker is the creature itself)
//   meet     = [recognition (own voice, strained), collar (imperial voice, upper case)]   - the Cinema.boss reveal
//   fight    = 3 lines for turn starts / 75 % / 25 % HP     brk = 2 lines when the style break lands (the collar cracks)
//   freed    = 3 lines after the collar shatters (the creature leaves, bittersweet)       memories = 3 lab-memory lines (around 50 % HP)
// Also: Data.GENERAL_STYLE[id], Data.STYLE_CLUES[style] (3 rumour phrasings each), Story.styleClue(slot, variant).
// Voices: game-mechanics/STORY_BIBLE.md section 5 and 6. Keep every line in the creature's own voice; the collar is only ever upper case.
"use strict";
(function () {
  const D = window.Data = window.Data || {};
  const S = window.Story = window.Story || { talk: {}, trigger: {}, chest: {}, gather: {}, arrive: {} };
  D.GENERAL_LINES = D.GENERAL_LINES || {};
  const L = D.GENERAL_LINES;

  // ---------- PACK 1: The Vanguard ----------
  L.horncinder = {
    meet: ["You! The apprentice! The lamp boy!", "ONE LEGION. ONE VOICE. THE THRONE SEES."],
    fight: ["I do not want to hit you! My horns want to! Move!", "Is this what stew feels like? Being stirred?", "Louder! I have to be louder than the collar!"],
    brk: ["There! A crack! I can hear my own name!", "Horncinder. HORNCINDER! That is me! Hah!"],
    freed: ["Ow. Ow. That was a lot of ringing in the head.", "You turned out all right, tin man. If you find the others, tell them I ate properly. Tell them I did not.", "I am running now. Do not follow. Loudly, I am running."],
    memories: ["Remember the bucket of stew? One bucket, three of us, and you brought a fourth spoon.", "You used to sit on my horns and read to the others. Badly.", "The lab wall was warm in the mornings. I miss warm."],
  };
  L.shellmund = {
    meet: ["Little one. You are taller. I am slower.", "THE LEGION IS A WALL. THE WALL DOES NOT SPEAK."],
    fight: ["I will not step aside. The collar says stand. I stand.", "Sand is patient. I am trying to be sand.", "Strike the stone, little one. Strike it. I will not blame you."],
    brk: ["The shell cracks. ...Good. It was always too heavy.", "I hear the sea in it. I had forgotten the sea."],
    freed: ["There. The weight is gone. I am only a tortoise now.", "I carried a bull out of a fire once. You carried me out of this. We are even.", "Walk on, young one. I will sleep in a dry well and hum. Do not look back."],
    memories: ["The night of the fire. The bull was so loud, and so frightened.", "You fed the loud ones first. I let you. A good keeper feeds the loud ones first.", "I counted the stars through the grating. Eleven. Always eleven."],
  };
  L.kitsuneva = {
    meet: ["Dear. Come closer. No, not that close. I am wearing a collar.", "BY THE AUTHORITY OF THE THRONE: STAND."],
    fight: ["Hit me properly, dear. I have done worse to myself.", "Mind your left side. I am not hitting it. The collar is.", "Breathe. I am still your fox, under all this noise."],
    brk: ["The tails are mine again. All nine. Look at them burn.", "Oh, that is quiet. I had forgotten it could be quiet."],
    freed: ["There. Straighten your strap, dear. There.", "I counted the pens that night. Eight. I hear them crying still. Find them, if you can.", "I will not come with you. I would only remind you of what you lost. Go on."],
    memories: ["You grew so quickly. I tied your hair back once. You do not remember.", "I told the others stories in the dark, so they would not hear the cages.", "Little one. Look at what you have become."],
  };

  // ---------- PACK 2: Blood Sprint ----------
  L.skarnwolf = {
    meet: ["You. The keeper's boy. ...You came.", "THE CHAIN IS THE THRONE'S. THE CHAIN IS THE WOLF'S."],
    fight: ["Do not pity me. Hit me.", "Soldiers hunt in lines. I hunt better. Even now.", "The chain on my neck was always mine. This one is not."],
    brk: ["It slips. The collar slips. ...I did not think I would feel that again.", "My own jaw. My own name. Skarnwolf."],
    freed: ["No walls. No chain. ...Feels odd. Good odd.", "You are the only one who ever said please at the bars. I kept count.", "I am running. Do not follow. If I am not running, I will stay, and you will hate me for it."],
    memories: ["We almost got out together, the three of us. The wall. I still remember the wall.", "You sat outside my cage for an hour without speaking. I liked that.", "Kept for seven winters. You were the first thing in the lab that did not smell of iron."],
  };
  L.vespera = {
    meet: ["Well. The tin man. Late, as usual.", "OBEDIENCE IS A KINDNESS."],
    fight: ["Do keep up! I would hate to win this slowly.", "Faster! You are a snail in a bucket!", "Hit me. Please. It is the only thing the collar cannot order."],
    brk: ["Oh. There it is. Air. How vulgar of it to be so sweet.", "My wings are mine. You may look."],
    freed: ["Do not be sentimental. It does not suit the armour.", "I was always the one who said please last. Please. Be alive when I find you again.", "Do not follow me. I am the fastest thing in this jungle and I am embarrassed."],
    memories: ["You were the only one who ever said please. I pretended not to notice.", "Remember when I stole the keeper's hat? You laughed so hard you hiccupped for an hour.", "We were going to be so fast, you and I. Two corners, one gate."],
  };
  L.glimmerkoi = {
    meet: ["It is you! Why are you here? Why am I here? Why am I like this?", "IT IS ENTERED IN THE LEDGER."],
    fight: ["Is this what the lab was for? Was it all for this?", "Do you know the collar hums? What note? Never mind. Fight!", "Why does it hurt when I am still me? Why?"],
    brk: ["The question is out! The question is out and the collar did not catch it!", "My fins are crackling. Mine! Mine! Do you see?"],
    freed: ["Thank you. Where do I go? Is it far? ...Never mind. Away.", "May I keep one question for later? Why did you come back for us?", "Goodbye. ...Is that the right word? It is the only one I know."],
    memories: ["You answered every one of my questions. Even the stupid ones. Why?", "The dragon gate in the books. You read it aloud. I wanted to climb.", "I made a list of everything in the lab I wanted to understand. You were at the top."],
  };

  // ---------- PACK 3: Slow Venom ----------
  L.mossmaw = {
    meet: ["Ha. The apple boy.", "THE HARVEST IS ORDERED."],
    fight: ["Grumble. Hit me or I will hit you. Fair?", "I am not crying. It is moss. It grows when I am sad.", "Poison takes time. I have been patient seven years. Hurry."],
    brk: ["Ha. That hurt. Good. A proper hurt.", "I can smell moss again. My own moss."],
    freed: ["Fine. Fine! I am free. Do not look so pleased.", "You brought us apples. Every week. Even the winter we were not allowed. I remember.", "I am going to sit in a swamp and complain. Come find me if you need a boar."],
    memories: ["You brought apples. Every week, in your coat. Never said who from.", "The long hall, the months of dripping. You sat with us anyway.", "I told Nightveil you would come. She said nothing. Then she said: yes."],
  };
  L.nightveil = {
    meet: ["...You came.", "STAND. THE SUN SEES."],
    fight: ["...", "You are afraid. Good. It keeps you alive.", "Strike. I will not."],
    brk: ["...The snakes are quiet. They are mine.", "I see you. Not the armour. You."],
    freed: ["...Thank you.", "The stars here are old. Listen to them. They will tell you more than I will.", "Do not follow. Someone else needs your door."],
    memories: ["...You sat in the dark with us.", "I knew you would come. I did not know why.", "...You were afraid. You came anyway."],
  };
  L.emberlamb = {
    meet: ["Oh. It is you. I-I am sorry. I am so sorry.", "BY THE AUTHORITY OF THE THRONE: STAND."],
    fight: ["I will try. If that is all right. I will try so hard.", "Please do not look at me while I do this.", "I am brave when it counts. It counts. It counts."],
    brk: ["It broke. The collar broke. I am shaking. Is that all right?", "My fleece is warm again. It is warm! Look!"],
    freed: ["Thank you. Really. Thank you.", "Will you be all right? You look tired. You always looked tired.", "I will go home now. I do not know where it is. Is that all right?"],
    memories: ["You gave me your scarf once. It smelled of ink.", "The long experiments. You held my hoof. I never told you it helped.", "I thought no one would pick us. You picked us. In the end, you came for us."],
  };

  // ---------- PACK 4: Tempest ----------
  L.skyrend = {
    meet: ["Hah! The kid! Look at the size of you!", "ONE LEGION. ONE VOICE."],
    fight: ["Do not go easy! I will know! I will tell everyone!", "Wing, wing, claw! Come on, kid! Beat me!", "Okay, okay, okay, this is not funny any more."],
    brk: ["There! There! Air in the feathers!", "I can feel my own wings again. Hah! I could kiss someone."],
    freed: ["That was the worst joke the Throne ever told. And I laughed at the start.", "Tell the others I made it. Tell them I made it stylishly.", "Do not look at me. I am bad at goodbyes. I am going."],
    memories: ["I told the jokes, you laughed. It helped. Do not argue.", "The storm. All three of us in one cage, shouting. You called it music.", "You hid my dice in your boot. I knew. I let you."],
  };
  L.volthorn = {
    meet: ["You! You! It is you! Why are we fighting? Why are we fighting?!", "IT IS ENTERED IN THE LEDGER."],
    fight: ["I cannot stop! My legs will not stop! Dodge!", "Is it over yet? No? Is it? Is it now?!", "Everything is loud! Everything! Stop it!"],
    brk: ["Quiet! Oh, quiet! It is so quiet! Do you hear it?", "The crest is mine! Sparks! Sparks!"],
    freed: ["Where do I go? Anywhere! Anywhere is good! Anywhere is free!", "I never sat still. I want to sit still for a day. Just one. Is that allowed?", "Thank you! Thank you! I have to run! Bye! Bye!"],
    memories: ["Remember the storm? We were so loud.", "You timed my laps with the lab clock. I thought I was fast. I was only dizzy.", "Can I climb you? I am joking. I am not joking. I used to."],
  };
  L.brinegrave = {
    meet: ["...I failed you. And now I stand against you.", "THE WALL DOES NOT SPEAK. THE WALL STANDS."],
    fight: ["Do not hold back. I would not forgive you.", "I will not move. The collar says so. But I choose to be slow.", "Stay behind me. All of it. Even now."],
    brk: ["The tide is mine again. The tide, and the dogs.", "My heads are all barking. They are all mine."],
    freed: ["Good. It is done.", "I promised to protect you. I could not. You protected me. Remember it kindly.", "Go. I will find the others. Not for you. For the promise."],
    memories: ["I promised to protect you. I failed. I am sorry.", "You brought a lamp to my cage in the dark, and a blanket for my back.", "The sea, once. The three of us. We were caught in the same storm. It was the best day."],
  };

  // ---------- PACK 5: The Iron Ward ----------
  L.bulwyrm = {
    meet: ["Hm. You.", "STAND. THE SUN SEES."],
    fight: ["Hm.", "Strike.", "...Still standing."],
    brk: ["...Cracked.", "...Better."],
    freed: ["Hm. Thank you.", "Bread. At the bars. I remember.", "Go."],
    memories: ["You brought bread.", "I did not say thanks. I am saying it.", "Walls remember. I remember."],
  };
  L.rotfang = {
    meet: ["Of course. Of course it is you. Why not.", "OBEDIENCE IS A KINDNESS."],
    fight: ["Go on. Hit me. It cannot be worse than the last year.", "Do not look sorry. I hate it when you look sorry.", "Fine! I am a monster! Happy? Everyone says so!"],
    brk: ["Oh. It is gone. ...Typical. Just when I had the speech ready.", "Teeth. Mine. Finally."],
    freed: ["Fine. I trusted you. Once. Happy?", "Do not thank me. Do not look at me. Go and save someone.", "I will be in a root cellar somewhere, being bitter. It suits me."],
    memories: ["You brought bread to the bars. Twice. I bit you once. You came back.", "We were the dangerous ones. You sat outside the bars and read to us anyway.", "I should have said it then. I did not. Say it for me."],
  };
  L.stillgaze = {
    meet: ["What walks in armour and stands before a friend? ...Ah. It is you.", "BY THE AUTHORITY OF THE THRONE: STAND."],
    fight: ["What is heavier than a collar? The hand that put it on.", "A riddle: what hits hardest when it is not meant to? ...You.", "The answer was always you. Keep going."],
    brk: ["What is lighter than a feather and heavier than a throne? A name. Stillgaze.", "The riddle breaks. And I am the answer."],
    freed: ["Free. What an odd word. It has no riddle in it.", "The riddle was always you. I only needed time to ask it.", "Goodbye. What is the opposite of goodbye? Ask me later. I will be somewhere."],
    memories: ["What has a roof but no walls? Ask me later. You never did.", "You answered one of my riddles wrong on purpose. I let you win.", "You are the only keeper who ever asked what I was thinking."],
  };

  // ---------- PACK 6: Breakers ----------
  L.crushjaw = {
    meet: ["You! You are huge! You have not been eating!", "THE HARVEST IS ORDERED."],
    fight: ["Hit me! I will hit you! We can eat after!", "Ha! That was good! Another!", "I am so hungry! I am so hungry I could cry!"],
    brk: ["Oh! There it goes! I can taste again!", "Bread! I can smell bread!"],
    freed: ["Phew. I am starving. Is there any food?", "We ate all the keepers' bread once. Best day of my life. Thank you for the best day.", "I am going to find a market. Do not follow. I will look after the stalls."],
    memories: ["We ate all the keepers' bread. Good old days!", "You stole an extra loaf for me. You cannot lie.", "Zephyrra and I used to race for your leftovers. I always won. She says no."],
  };
  L.zephyrra = {
    meet: ["It is you! I knew it was! I knew you would come!", "ONE LEGION. ONE VOICE."],
    fight: ["Come on come on come on! Catch me!", "We always won together! I mean, I did, and Crushjaw helped!", "Oh it hurts, it hurts, but I knew you would win!"],
    brk: ["I am back! The wings are mine! Oh, I knew it!", "Zephyrra! My name! I knew it all along!"],
    freed: ["I knew it! I knew it! I knew you would free me!", "We always won together. Together, remember? Remember me?", "I have to go and tell everybody! Goodbye! I love you! Goodbye!"],
    memories: ["We always won together. Together. Remember?", "You stitched my wing. Badly. I still have the knot.", "I always knew you were kind. I told everyone. They laughed. I was right."],
  };
  L.duskcoil = {
    meet: ["Well, well. The keeper's apprentice, in red. How dramatic.", "IT IS ENTERED IN THE LEDGER."],
    fight: ["Did you know I have been listening to you for years? You mutter.", "I know every secret in this legion. Including that you are going to win.", "Hit me, dear. It will make the gossip better."],
    brk: ["Oh! The ravens are mine again. All the secrets, mine!", "Quiet in my head. How rude of it to wait this long."],
    freed: ["There. Free, and with the best gossip in the world.", "I know every secret in that lab. Except yours. That is the only one I regret.", "I will tell no one. Which is a lie. I will tell everyone. Goodbye."],
    memories: ["I know every secret in the lab. Do you know what you said in your sleep?", "You used to read the tags on our cages. You thought no one noticed.", "The best friend I ever had was the one who never asked what I knew."],
  };

  // ---------- PACK 7: Deep Bastion ----------
  L.atlacrab = {
    meet: ["Thank you for coming, little one. Forgive me. I cannot step aside.", "THE LEGION IS A WALL. THE WALL DOES NOT SPEAK."],
    fight: ["Please mind the glass. And the pillar. And me.", "I will hold the line. It is what I am for. Forgive me.", "That was a fine strike. Thank you."],
    brk: ["The pillar tips. ...Thank you. It was heavy.", "I can feel my claws again. How kind of you."],
    freed: ["Thank you. Truly. I rocked you to sleep once, in that cold hall.", "I am a gentle thing. I will go back to being one.", "Goodbye, little one. Mind the glass."],
    memories: ["I rocked you to sleep once, in that cold hall.", "You asked me what the pillar was for. I said: someone has to hold something up.", "Solenne said you would be kind. She was right. She is usually right."],
  };
  L.solenne = {
    meet: ["I know that walk. You were so small, and now so armoured.", "BY THE AUTHORITY OF THE THRONE: STAND."],
    fight: ["Walk lightly. The light remembers where it has been.", "Steady hearts. We are the old guard.", "Do not grieve this. Light always finds the way home."],
    brk: ["The light returns. Do you feel it?", "I am whole. I was always whole. The collar only covered the sun."],
    freed: ["There. I forgive you. You have nothing to be forgiven for. I forgive you anyway.", "You were so little. And so brave. Be brave a while longer.", "Walk on. I will be the light behind you, wherever I am."],
    memories: ["You were so little. And so brave.", "I told stories to the cold hall. You listened with your whole face.", "A scarab pushes the sun across the sky. Someone has to. It might as well be kind."],
  };
  L.kappadeep = {
    meet: ["...Hello. Still here. Still waiting for you.", "STAND. THE SUN SEES."],
    fight: ["Slowly... slowly... and then, not slowly.", "I am sleepy. Wake me when it is done.", "Do not be sorry. Be quick."],
    brk: ["...Oh. The bowl is full again. The water is mine.", "I am awake. Truly awake. How odd."],
    freed: ["Thank you. ...Nap?", "You grew up. I am glad I was awake for it, even like this.", "Go on. I will sleep in a river somewhere and dream of this."],
    memories: ["Hello. Still here. Still waiting for you.", "You brought a cup of water for my bowl. Every dawn. I counted seventeen.", "The old guard. We kept the little ones calm. You were the littlest."],
  };

  // ---------- PACK 8: Wildfire ----------
  L.smolderhead = {
    meet: ["Hee! It is the apprentice! Hello! Do not stand there, I will burn you!", "THE HARVEST IS ORDERED."],
    fight: ["I did not mean to! The collar did it! Oops?", "Burn burn burn! Sorry! Sorry! Burn!", "Okay, okay, I will behave, just let me hit you once more!"],
    brk: ["Oh! There it goes! The heads are all mine!", "I can feel every ember. Which is bad. Which is great."],
    freed: ["Free! Free! I am going to set something on fire to celebrate!", "We burned down the east wing for you once. Oops. Worth it.", "I am running. Do not follow. Or do. I will burn the road to guide you."],
    memories: ["We burned the east wing for you once. Oops?", "You never told the keeper it was us. You took the blame. We were so proud.", "Every ember I have is a little bit of that night."],
  };
  L.pyrewisp = {
    meet: ["Heeheehee. The tin man. Come to play?", "OBEDIENCE IS A KINDNESS."],
    fight: ["Catch me if you can! Catch me! Catch me!", "Hee. That one tickled. Do it again.", "No no no, it is a prank, you are supposed to laugh!"],
    brk: ["Hee! The mask is mine again! Look!", "Ooooh. That is what quiet sounds like."],
    freed: ["Hee. Thank you. I mean it. I mean it so much I am not laughing.", "I made those jokes for you. You laughed at the right places. I counted.", "Booo! Did it work? ...It worked. Goodbye."],
    memories: ["Hee... you remember the jokes? I made them for you.", "You hid in my mask once, during the drills. I let you.", "The best trick I ever played was making you smile. Every other trick was practice."],
  };
  L.mawdeep = {
    meet: ["You! You have food? ...No? Oh. Hello.", "STAND. THE SUN SEES."],
    fight: ["I am so hungry I cannot stop. I cannot stop!", "Sorry. Sorry. I do not want to bite you. My mouth does.", "Is it over? Can I eat now? Please?"],
    brk: ["The whirlpool is quiet. It is quiet! I can taste again.", "Oh. I know what that is. That is me."],
    freed: ["Thank you. Is there food?", "You gave me your bread. I never forgot. Not once.", "I am going to find a pond. A big pond. And I am going to be a toad in it."],
    memories: ["You gave me your bread. I never forgot.", "The warm hall. The loud brothers. You all shared one spoon.", "I am not clever. I only remember who was kind. That is all of you."],
  };

  // ---------- PACK 9: Endless Dawn ----------
  L.auroracorn = {
    meet: ["I knew you would come. I did not think it would be like this.", "BY THE AUTHORITY OF THE THRONE: STAND."],
    fight: ["Do not be afraid. Strike, and strike true.", "I will heal myself and you will hurt me again. It is a poor game. I am sorry.", "Be kind to yourself after. I mean it."],
    brk: ["The collar was only a collar. I am not afraid of it any more.", "Listen. Do you hear the horn? It is mine."],
    freed: ["There. I always knew the good in you. It was never hidden.", "I knew someone kind would come. You did.", "Walk on in the light. I will keep a little for you."],
    memories: ["You came back. I knew it, in my heart.", "You sat with us on the night nobody would. You never said it was hard.", "I healed a thousand small hurts in that lab. Yours were the only ones I did not mind."],
  };
  L.lumoth = {
    meet: ["It is you... I thought of you in the dark.", "STAND. THE SUN SEES."],
    fight: ["I will glow for you. Even now. Even like this.", "The dust is heavy tonight. Forgive me.", "I never wanted to hurt anyone. I still do not."],
    brk: ["The dust is mine. It glows. Look, it glows.", "Oh. The night is back. I missed it."],
    freed: ["Thank you. I will glow for you, if you want.", "I never stopped glowing for you. Not once.", "Go on. The night is wide. I will be in it, somewhere, very small."],
    memories: ["I never stopped glowing for you. Not once.", "You fell asleep against my wing, reading. I did not move for hours.", "The moths here are small. Hello, small friends. I am sorry I could not stay."],
  };
  L.sunkenhorn = {
    meet: ["...The tide brought you.", "STAND. THE SUN SEES."],
    fight: ["...Strike. The tide forgives.", "Patience. A giant falls when it chooses.", "I am old. Do not weep for the old. They have already wept."],
    brk: ["The moon is mine again. The jaws, the tide, the antlers.", "...I remember my name. Sunkenhorn."],
    freed: ["...Welcome.", "The tide brought you home. It will take me away. That is its way.", "Go. The sea is wide, and I am going to be in it."],
    memories: ["The tide brought you home. Welcome.", "You brought me seawater in a bucket, every week. It was not much. It was everything.", "I said I would follow. I am still following. Even here."],
  };

  // ---------- styles and break clues ----------
  D.GENERAL_STYLE = {
    horncinder: "minotaur", skarnwolf: "minotaur", crushjaw: "minotaur",
    shellmund: "colossus", bulwyrm: "colossus", atlacrab: "colossus",
    kitsuneva: "phoenix", emberlamb: "phoenix", solenne: "phoenix", auroracorn: "phoenix", lumoth: "phoenix",
    vespera: "harpy", skyrend: "harpy", zephyrra: "harpy",
    glimmerkoi: "dragon", volthorn: "dragon", pyrewisp: "dragon",
    mossmaw: "hydra", rotfang: "hydra", smolderhead: "hydra",
    nightveil: "gorgon", stillgaze: "gorgon", duskcoil: "gorgon",
    brinegrave: "leviathan", kappadeep: "leviathan", mawdeep: "leviathan", sunkenhorn: "leviathan",
  };
  // three phrasings per style, a local's voice, exact about the method and silent about the creature (BIBLE 6.1; RULES-BOSS owns the real break)
  D.STYLE_CLUES = {
    minotaur: ["\"Horned ones lower the head before they charge. Two heavy blows in a breath and the charge turns on them.\"", "\"A charging bull cannot turn. Hit it hard, and hit it hard again, and it hits the wall instead of you.\"", "\"The legion's horned beasts are all momentum. Two heavy strikes in a row stop it cold.\""],
    colossus: ["\"Armoured ones wear the wall. Three heavy hammers and the wall has a door.\"", "\"A shield that has never been dented has never met three blows in a row.\"", "\"Stone guards the front. Hit it hard, and again, and again, before it settles.\""],
    phoenix: ["\"Fire-birds rise from their own ashes. Put an ailment on them, and then another, and the ashes stay cold.\"", "\"A healer is only as good as its next breath. Poison it, burn it, curse it, twice, and it forgets how to rise.\"", "\"Do not out-heal a fire-bird. Make it sick twice and watch the fire go out.\""],
    harpy: ["\"Fast ones live on the first move. Make them walk twice and they forget how to fly.\"", "\"A winged thing grounded is half a thing. Slow it, and slow it again.\"", "\"Speed is all they have. Take it twice and they are only a bird.\""],
    dragon: ["\"Storm dragons dislike getting wet. Soak them, soak them again, and the storm goes out of them.\"", "\"A spark in a wet coat has nowhere to go. Wet it twice and it goes out.\"", "\"Water first, and water again. The old riverfolk swear by it.\""],
    hydra: ["\"Many heads, many tempers. Make two elements argue on its skin, twice, and it forgets which head is in charge.\"", "\"A hydra hates being surprised by a reaction. Steam it, shock it, twice, and the heads fight each other.\"", "\"Burn what is wet, shock what is wet. Do it twice and the heads lose count.\""],
    gorgon: ["\"Gazers cannot bear a harder stone than their own. Give them one taste of it.\"", "\"A stare is a bluff. Turn the starer to stone, once, and it is the one who flinches.\"", "\"Stone is the only thing a gazer respects. Show it one.\""],
    leviathan: ["\"Tide-callers love water too much. Make them wet, and wet again, and they lose their footing in it.\"", "\"The sea in them is a charge. Soak the soaker, twice, and the tide falls over.\"", "\"Do not fight a tide-caller in its own element. Drown it in more of it, twice.\""],
  };
  // Story.styleClue(slot, variant): the break-clue rumour for the style of general number `slot` (1..24) in this playthrough
  S.styleClue = (slot, variant) => {
    const g = typeof S.generalFor === "function" ? S.generalFor(slot) : null;
    const st = g && D.GENERAL_STYLE[g.id]; if (!st) return null;
    const list = D.STYLE_CLUES[st]; return list[(variant || 0) % list.length];
  };
  // the lines of a general, with a safe fallback so a missing id never throws
  S.generalLines = id => L[id] || { meet: ["...You.", "THE THRONE SEES."], fight: ["...", "...", "..."], brk: ["...", "..."], freed: ["...", "...", "..."], memories: ["...", "...", "..."] };
})();
