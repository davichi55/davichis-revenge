// Creature lines for milestone M4 (owner: STORY-M4): the sacrifice on the palace roofs (chapter 7), the return from cell nine (chapter 9), the later rumour about each freed general,
// and the banter of all nine packs for chapters 7-9. Voices: game-mechanics/STORY_BIBLE.md section 5. No jokes in the sacrifice; every voice stays its own.
//   Data.SACRIFICE[id]       = { hero, mates, grief }   what the creature that stays says to the hero, to its mates, and (grief) what it says when ANOTHER creature stays
//   Data.SACRIFICE_GRIEF[mate][stayer] = line           a pack-mate's answer to one particular stayer (same pack only; else the mate's own `grief`)
//   Data.RETURN_LINES[id]    = first line in cell nine   Data.GLAD[id] = what the others say when it comes back
//   Data.SEEN_LATER[id]      = one-line rumour about where a freed general was seen
"use strict";
(function () {
  const D = window.Data;
  D.SACRIFICE = {
    // ---- pack 1, the Vanguard ----
    horncinder: { hero: "Go! GO! I'll hold it! I'm the loudest thing in this whole palace, they will all look at me and not at you!", mates: "Look after him, both of you. Loudly, if you have to. I mean it. Loudly.", grief: "No! Not— No. Fine. I will be loud for all of us. I can do that. Somebody has to." },
    shellmund: { hero: "A wall is only a wall if it stays. Go, little one. Do not look back. Looking back is heavier than I am.", mates: "Sand is patient. I will be. Walk on, both of you. Slowly, now. Slowly.", grief: "...Then I will carry what I can. I carried one of you out of a fire once. I can do it again." },
    kitsuneva: { hero: "Straighten your strap, dear. There. Now go. Eat something. Sleep. I will be right here.", mates: "Mind him, both of you. He forgets to eat when he is frightened. And so do you.", grief: "Oh, my dears. Oh, no. ...Come here. Come close. We keep moving, and we keep each other." },
    // ---- pack 2, Blood Sprint ----
    skarnwolf: { hero: "Chain again. This one I choose. Go.", mates: "Run. You know how. Run faster than they do.", grief: "...No. ...Yes. Move. Do not let it be for nothing." },
    vespera: { hero: "Don't stand there gaping. Go. Honestly, you are the slowest creature I have ever had the misfortune to like.", mates: "Don't you dare get sentimental. I will be perfectly fine. Idiots. Both of you.", grief: "Of course. Of course it was the one with taste. ...Don't look at me. I have something in my eye." },
    glimmerkoi: { hero: "Will you tell me how it ends? Someone should know. ...Please go? Please?", mates: "Who will remember the names of things now? You will. Won't you? You will.", grief: "Why does it have to be one of us? Is there a reason? ...Is there a reason?" },
    // ---- pack 3, Slow Venom ----
    mossmaw: { hero: "Grumble. Fine. Somebody has to be the cork. Go, boy.", mates: "Grumble. Don't make a speech. Move.", grief: "Grumble. ...No. No grumble. Just go." },
    nightveil: { hero: "...You will not walk in the dark alone. I will be in it.", mates: "...Look after the light.", grief: "...It was always going to be someone." },
    emberlamb: { hero: "If it's all right... I would like to be the one. I'm brave when it counts. It counts. Please go?", mates: "Stay warm. Please. If that's all right.", grief: "Oh. Oh, no. I— I'll be brave for it. I'll try. I'm sorry. I'll try." },
    // ---- pack 4, Tempest ----
    skyrend: { hero: "Hah. Not funny this time. Go, kid. I'll find the way out. I always do.", mates: "Hah— no. No joke. Take care of him. Go on. Go on.", grief: "Hah— no. No. Not him. ...Hah. ...No." },
    volthorn: { hero: "Can I? Can I stay, I'm the fastest, I'm the fastest of all of us, they will never catch me, I will slip out the other side and find you, I will, I promise, go!", mates: "Don't wait. Don't wait for me. Is it far? It's not far. Go!", grief: "Is it time? It can't be time. What do we do? What do we do now? Somebody say what we do." },
    brinegrave: { hero: "I promised to protect you. This is how. Go.", mates: "Stay behind each other. All of it. All the way.", grief: "...I promised. I am sorry. I will carry it." },
    // ---- pack 5, the Iron Ward ----
    bulwyrm: { hero: "Walls stay.", mates: "Hm.", grief: "...Hm." },
    rotfang: { hero: "Of course it's me. Why not. ...Go. Before I say something kind and ruin it.", mates: "Fine. Go. I trusted you once. Don't make that a mistake.", grief: "Of course. Why not. Of course. ...Fine." },
    stillgaze: { hero: "What stays when you leave? ...Ask me later. Go.", mates: "The riddle was always the door. Go through it.", grief: "What stands, and falls, and stands? ...I do not know the answer. That is new." },
    // ---- pack 6, Breakers ----
    crushjaw: { hero: "Save me a plate! A big one! I'll be right behind you! Go! Go on!", mates: "Zephyrra, share your bread. Duskcoil, share yours. All of it. I mean it.", grief: "No. No, no. ...Somebody save a plate for it. Somebody. Please." },
    zephyrra: { hero: "I'll catch up, I'll catch up, I always catch up! Go, go, go!", mates: "Together, remember? We always won together. Go. Go!", grief: "I knew it. I knew something would— I didn't want to know it. I didn't want to." },
    duskcoil: { hero: "Did you know I have kept every secret you ever whispered? I will keep this one too. Go.", mates: "I know where the exits are. I know everything in this place. Go.", grief: "Did you know... no. No, I don't want to say it. I don't want to know it either." },
    // ---- pack 7, Deep Bastion ----
    atlacrab: { hero: "Thank you for choosing us. Please go. Mind the tiles.", mates: "A gentle hand, always. Thank you, both of you. Thank you.", grief: "Oh. Oh, thank you. For every kind word. I will be gentle with what is left." },
    solenne: { hero: "Walk lightly, and do not turn. I will be the light behind you.", mates: "Steady hearts. We are the old guard. We know how to do this.", grief: "Walk lightly. ...Walk lightly. These streets remember." },
    kappadeep: { hero: "I am awake. Look. ...I am awake. Go now, small one. Go.", mates: "I have slept through so much. Not this. Not this.", grief: "...Slowly. ...Slowly. And then not slowly. Go." },
    // ---- pack 8, Wildfire ----
    smolderhead: { hero: "It wasn't me. If they ask. It was never me. ...Go.", mates: "Don't look back. The smoke will find you either way.", grief: "Oops— no. No oops. Not this. It wasn't supposed to be this." },
    pyrewisp: { hero: "They won't find me. They never find me. Hee... go. Go on. Go.", mates: "Don't look back. It spoils the trick.", grief: "Boo? ...Boo. Nobody's laughing. Why is nobody laughing." },
    mawdeep: { hero: "You gave me your bread once. Go. I'm not hungry.", mates: "Eat something. Both of you. Please.", grief: "Is there food? ...No. I don't want food. I want it back." },
    // ---- pack 9, Endless Dawn ----
    auroracorn: { hero: "I knew this day would come. I also knew you would be kind about it. Go. I will glow.", mates: "I am not afraid. See? Go. Go.", grief: "I knew. ...I knew. I still hoped. Walk on, and be kind." },
    lumoth: { hero: "I will glow for you as long as I can. Go toward the dawn.", mates: "Take my light with you. It is yours now.", grief: "...Then I will glow for two. As long as I can." },
    sunkenhorn: { hero: "...The tide goes out. It also comes back. Go.", mates: "...Walk. I will follow. In my way.", grief: "...The sea takes what it takes. ...Walk." },
    // ---- lab extras that can be in the party by chapter 7 ----
    bramblehoof: { hero: "Bark remembers, small iron one. Go. The roots will hold this door.", mates: "The moss on my antlers is a promise. I keep it. Go.", grief: "...Bark grows over the wound. Slowly. Walk on." },
    quillshade: { hero: "Between us? I know every back stair in this palace. I will be fine. Go.", mates: "Between us: go. I will write nothing down.", grief: "Between us... I am sorry. I will tell the others nothing. Walk on." },
    mirequeen: { hero: "We have been dead twice and found it overrated. Go. —I will be fine. Go.", mates: "We are tired of fire. We will keep this gate. Go.", grief: "No. We said no. —No. I said no. Fine. Go on." },
    brassbone: { hero: "Record: this one carries. Record: it stays. Go.", mates: "Record: it was made to hold a door. It holds. Go.", grief: "Record: one is missing. Record: that is a hole. ...Go on." },
    selkira: { hero: "My pod sang here once. ...I will listen for you. Go...", mates: "The sea is not warm, where I am going. Be warm for me...", grief: "...Oh. ...The sea takes from us again. ...Walk, walk on..." },
  };
  D.SACRIFICE_FALLBACK = { hero: "Go. I will hold the gate. Go on.", mates: "Take care of him. Go.", grief: "...No. ...Walk on. We keep moving." };

  // an answer to one particular stayer, pack-mates only
  D.SACRIFICE_GRIEF = {
    horncinder: { shellmund: "NO! He carried me out of a fire! ...I will carry the others. Slowly. I can do slowly. I can do— I can try.", kitsuneva: "Not her! Take me! Who does the strap? Who does the strap thing?" },
    shellmund: { horncinder: "Young bull. ...Sand is patient. You never were. Be loud for the both of us.", kitsuneva: "She mended every one of us, in that cold hall. ...We will be careful with each other now." },
    kitsuneva: { horncinder: "Oh, my loud boy. I will keep your share of the bread. I will keep it warm.", shellmund: "Old stone. You always held the door. ...Rest now, dear. Rest." },
    skarnwolf: { vespera: "...Fast one. Go fast. Faster than the chain.", glimmerkoi: "...Too many questions. ...I will find the answers." },
    vespera: { skarnwolf: "Stupid, noble wolf. Walked out of one chain and walks into another. ...Don't look at me.", glimmerkoi: "Of course the one with questions. Now nobody asks me why. ...I hate that I will miss it." },
    glimmerkoi: { skarnwolf: "Will he be warm? Will he have water? ...Somebody tell me he will have water.", vespera: "She never said please. Not once. Will she say it now? Who would she say it to?" },
    mossmaw: { nightveil: "Grumble. Of course it's the quiet one. Who tells me when somebody is lying, now?", emberlamb: "Grumble. The little one. ...Grumble. I should have gone first." },
    nightveil: { mossmaw: "...It hid its laugh in a grumble. I heard it.", emberlamb: "...It went first. It always did, when it counted." },
    emberlamb: { mossmaw: "Oh, no. It looked after me. I'm sorry. I'm so sorry. I'll be brave for it.", nightveil: "It told me once that I was braver than it was. ...I'll try to be." },
    skyrend: { volthorn: "Hah— no. No. Kid, that one never sat still. It will find a way. It always does.", brinegrave: "Not him. He's the one who says the serious thing. Who says it now? Hah. ...Who says it now?" },
    volthorn: { skyrend: "He's the funny one. Who steals the baker's hat now? Can I? Can I do it? I don't want to do it.", brinegrave: "I don't have a question. I always have a question. I don't have one. What do I do?" },
    brinegrave: { skyrend: "I promised to protect all of you. ...I am sorry, joker. I will carry the prank forward.", volthorn: "Fast. Faster than me. ...Be faster than them, little storm." },
    bulwyrm: { rotfang: "Hm. Brother.", stillgaze: "Hm. Riddle-keeper." },
    rotfang: { bulwyrm: "Of course. The wall. Of course it's the wall. ...Fine. Fine.", stillgaze: "Of course. Leaves the riddle with us. Why not. Why not." },
    stillgaze: { bulwyrm: "What stands, falls, stands? ...The answer was always you, wall.", rotfang: "It hurt the most and said it the least. ...That was the riddle." },
    crushjaw: { zephyrra: "We always won together. ...Who do I race now?", duskcoil: "Who's going to tell me what everyone's hiding? ...I'll have to ask. Out loud." },
    zephyrra: { crushjaw: "He'll catch up. He'll catch up. He always, he always catches up...", duskcoil: "I knew it. I knew something would— I didn't want to know it." },
    duskcoil: { crushjaw: "Did you know he saved me the last piece, every time? Every time. Don't tell him I told you.", zephyrra: "She never told a single secret of mine. Not one. I would have told hers." },
    atlacrab: { solenne: "Thank you. For every kind word. Thank you, old friend.", kappadeep: "...He was awake, at the end. I am so glad. ...Thank you, old friend." },
    solenne: { atlacrab: "Gentle giant. The old guard thins. ...Walk lightly, all of us.", kappadeep: "A sleeper wakes, and walks the longest road. I will light it." },
    kappadeep: { atlacrab: "...He rocked us to sleep once. ...Now I am awake.", solenne: "...She walked lightly. Even here. Even here." },
    smolderhead: { pyrewisp: "It will set something on fire on the way out. I know it will. ...Set it big, little ghost. Set it big.", mawdeep: "He ate the smoke-sausage I burned. Every time. ...Who eats my cooking now?" },
    pyrewisp: { smolderhead: "He'll burn that whole gate down, won't he? Hee— no. No hee. ...Burn it big.", mawdeep: "The hungry one. He ate all the bad dreams in that hall. Every one." },
    mawdeep: { smolderhead: "He burned my bread once. He gave me his, after. ...I want that bread.", pyrewisp: "The giggler. ...It's quiet. I don't like quiet." },
    auroracorn: { lumoth: "I knew it would hurt. I knew. ...She will be glowing. I know she will.", sunkenhorn: "I knew it would be the one who loves us quietly." },
    lumoth: { auroracorn: "She always saw the good in them. ...I will look for it now.", sunkenhorn: "He spoke three words in a year. I heard every one." },
    sunkenhorn: { auroracorn: "...The dawn does not leave. It goes where the night is.", lumoth: "...A small light. The longest-lasting kind." },
  };

  // ---------- cell nine: the first line of the creature that was left behind, and what the others say when it is back ----------
  D.RETURN_LINES = {
    horncinder: "You turned round! I told them you would. I told the whole cell.",
    shellmund: "Slowly, young one. I am not going anywhere. I have been practising.",
    kitsuneva: "Dear. Your strap is crooked.",
    skarnwolf: "Chain's gone. You are here. ...Not bad, keeper.",
    vespera: "You are late. Terribly late. Don't you dare apologise, you will ruin it.",
    glimmerkoi: "Is it really you? You are taller. Did you eat? How did you find the door?",
    mossmaw: "Grumble. Took your time. ...Ha. I kept the bench warm. Moss does that.",
    nightveil: "...You came.",
    emberlamb: "You came back. I said you would. Nobody believed me. If that's all right.",
    skyrend: "Hah! About time. I had a bet running with the wall. You lost, kid.",
    volthorn: "Is it time? Is it time yet? You're here! You're HERE! Can I get up? Can I?",
    brinegrave: "I promised to protect you. I could not, from in here. You protected me. I will not forget it.",
    bulwyrm: "Hm. Late.",
    rotfang: "Oh. It's you. ...Fine. Fine. I waited. Happy?",
    stillgaze: "What was lost, and now stands in the door? ...Never mind. Hello.",
    crushjaw: "Is that— do you have— you brought SNACKS? Nobody brings snacks! I love you!",
    zephyrra: "You came, you came, I knew it, I knew you would come!",
    duskcoil: "Did you know they never found out one single thing I knew? Not one. ...You took your time.",
    atlacrab: "Thank you for coming. Mind the glass, please. Thank you.",
    solenne: "Steady hearts. You walked a long road to this door. Come. We will light the way back.",
    kappadeep: "...Hello. Still here.",
    smolderhead: "It wasn't me! ...What? Oh. It's you. Hello.",
    pyrewisp: "Hee— you found the cell! Nobody finds the cell! ...Hello.",
    mawdeep: "Is there food? ...You came. You came. I don't even want food.",
    auroracorn: "I knew someone kind would come. You did.",
    lumoth: "I kept glowing. I never stopped. ...You see? I kept it for you.",
    sunkenhorn: "...You came back. The tide always does.",
    bramblehoof: "Bark remembers. You came back, small iron one.",
    quillshade: "Between us? I told them nothing. Not one word. ...Hello.",
    mirequeen: "We knew you'd come. —I knew. I did. Hello.",
    brassbone: "Record: the door opened. Record: it was you.",
    selkira: "You came. ...I was listening for you. The sea is not in here...",
  };
  D.RETURN_FALLBACK = "...You came back.";
  D.GLAD = {   // what a creature says when the one who stayed walks out of cell nine
    horncinder: "You're BACK! I'm not crying! It's the glass dust!", shellmund: "There. The door was heavy and it opened. Good.", kitsuneva: "Oh, my dear. Come here. Let me look at you.",
    skarnwolf: "...Good. Stay close this time.", vespera: "Finally. Honestly. Don't ever do that again.", glimmerkoi: "How did it feel? What did you see? Are you hurt?",
    mossmaw: "Grumble. Welcome back. Grumble.", nightveil: "...Yes.", emberlamb: "Oh! You're warm! You're really warm!",
    skyrend: "Hah! There he is! The one who stayed!", volthorn: "You're here, you're here, is it over, are we going, can we go?", brinegrave: "...Good. Stay behind us now.",
    bulwyrm: "Hm. Good.", rotfang: "Fine. Fine. Don't say anything. Good.", stillgaze: "The riddle answers itself.",
    crushjaw: "Look, look, we have bread! Eat!", zephyrra: "I knew it, I knew it, I knew it!", duskcoil: "Did you know I never doubted it? Not once.",
    atlacrab: "Thank you for coming back. Mind the step.", solenne: "Steady hearts. Walk with us.", kappadeep: "...Welcome back. Slowly.",
    smolderhead: "Look who's back! Not me. I didn't do it.", pyrewisp: "Hee! Boo! Welcome home!", mawdeep: "You're back. Here. Have my bread.",
    auroracorn: "I knew. I always knew.", lumoth: "Let me glow for you. There.", sunkenhorn: "...The tide returns.",
    bramblehoof: "Bark grows back. Welcome.", quillshade: "Between us? Never leave again.", mirequeen: "We are glad. —I am glad.", brassbone: "Record: the count is whole again.", selkira: "...You are warm. Stay...",
  };
  D.GLAD_FALLBACK = "You're back.";

  // ---------- later rumours: where each freed general was seen (told two chapters on, one line each) ----------
  D.SEEN_LATER = {
    horncinder: "\"A bull with a goat's head on its back stood in a cheese farmer's yard, eating his hay and bellowing at his goats. The farmer says it was friendly. Loud, but friendly.\"",
    shellmund: "\"A tortoise with a collar-mark was seen sleeping in a dry well. It was humming.\"",
    kitsuneva: "\"A nine-tailed fox sat up all night with a sick child in a fishing village. In the morning the child was cool and the fox was gone. The fever net hung mended by the door.\"",
    skarnwolf: "\"A grey wolf with horns and a length of broken chain on its neck crossed the pass at dusk, going east. It did not look back.\"",
    vespera: "\"A sphinx-faced cat with bat wings took a priest's whole offering tray and flew off laughing. The priest is delighted. He says it is the first thing that ever took the offering without being afraid.\"",
    glimmerkoi: "\"A koi riding a small storm cloud floated over the rice terraces, asking every farmer the name of every plant. They told it. It wrote nothing down. It only listened.\"",
    mossmaw: "\"A three-headed boar grown over with moss sleeps in the harbour ditches. The neighbours leave apples. It grumbles at them. The apples vanish.\"",
    nightveil: "\"An owl with a mane of snakes sits on a gibbet outside a ruined fort every night, looking at the guard post. The guards swear it says nothing. They have stopped lying.\"",
    emberlamb: "\"A golden ram that smoulders softly slept three nights among a shepherd's flock. The sheep were warm all winter. The shepherd says it left a little ash, and one small shy bleat.\"",
    skyrend: "\"A griffin took a general's feathered hat off his head in front of his whole cohort and flew off laughing. The general was not laughing.\"",
    volthorn: "\"A blue lizard with too many legs and a crest of yellow feathers ran up the Ahuacan wall and down again, and up, and down. Boys were timing it. It never once stopped smiling.\"",
    brinegrave: "\"A great sea-eel with three dog heads lies at the mouth of the river, all three heads turned to the shore. The fishermen say it watches the boats go out and counts them back.\"",
    bulwyrm: "\"A stone figure with a sea-serpent in its chest stands in a roadside field. Farmers walk round it. It has not moved since the rains. They say it is guarding something that is not there.\"",
    rotfang: "\"A wingless dragon-worm chews a root at the edge of the Greenmaw and sneers at passers-by. When the tide is out it leaves them driftwood to burn. It denies this.\"",
    stillgaze: "\"A cockatrice told a ferryman a riddle and left before he could answer. The ferryman has been rowing in circles since, laughing.\"",
    crushjaw: "\"A crocodile-headed lion with a hippo's hindquarters ate an entire wedding feast in a village on the coast, and was thanked for it. The bride says it was the best wedding anyone ever had.\"",
    zephyrra: "\"A hare with antlers and white wings landed on a roof at Gullrest and told the whole street the good news. Nobody knew what the good news was. The street cheered.\"",
    duskcoil: "\"A raven-headed serpent coils on the tavern roof in Mourn's Gate and knows everyone's business. They say it has never once told. They say that is the frightening part.\"",
    atlacrab: "\"A giant crab with a pillar on its back held up the sagging corner of a poor widow's roof for a whole rainy season. She brought it soup.\"",
    solenne: "\"A golden scarab with a sun over its head walks the pilgrim road each morning, lighting the way for the lame. It does not speak. It does not need to.\"",
    kappadeep: "\"A kappa lies in the shallows of a salt pond and sleeps. The children say the bowl on its head has never once gone dry.\"",
    smolderhead: "\"Something with five necks and a taste for matches burned a cart park to the axles. Nobody was hurt. It was found sitting on the ashes, denying everything.\"",
    pyrewisp: "\"A white mask with a flame in it bobbed across the marshes and led a lost goatherd home. The goatherd says it giggled. The goatherd says it was the only thing that was kind to him that month.\"",
    mawdeep: "\"A huge toad with a whirlpool in its mouth sits at the end of a fishermen's pier. It is fed every morning. The nets have not been torn since.\"",
    auroracorn: "\"A white unicorn with swan wings stood at a gate at dawn, touching the heads of the sick. It said it hoped the day would be gentle. It was.\"",
    lumoth: "\"A moth with a golden bird's face glowed all night over a sickbed in the lower town. The fever broke at dawn. The moth was gone. There was gold dust on the sill.\"",
    sunkenhorn: "\"A whale with coral antlers surfaced for one evening off the Cinder Crown. Every ship in the bay stood still. It sang one note, and went down. The Wardens say it was a farewell.\"",
  };

  // ---------- banter: [creature in pack order] x 3 lines per moment (a fourth line belongs to Emberwick in `guest`) ----------
  const PK = {}; D.PACKS.forEach(p => (PK[p.id] = p.ids));
  const add = (moment, table) => Object.keys(table).forEach(pk => { (D.BANTER[pk] = D.BANTER[pk] || {})[moment] = table[pk].map((t, i) => [i < 3 ? PK[pk][i] : "emberwick", t]); });

  // chapter 7, on the night sea towards Ahuacan
  add("voyage2", {
    vanguard: ["Is that the city? So many lamps. ...I'm not scared. I'm quiet-loud. That's different.", "Quiet is good, young bull. A palace is a place for quiet feet.", "Sit close, dear. We will bring her out. I will see to it."],
    sprint: ["Walls like those. I know that smell. Gold outside, iron within.", "A palace. Honestly. I hope the kitchen is better than the company.", "Who lives behind all those windows? Are they asleep? Does anyone wait up for her?"],
    venom: ["Ha. A sea voyage to break into the emperor's house. Sensible. Very sensible.", "...She is awake. She is always awake.", "I hope she likes us. If that's all right. I hope we are enough."],
    tempest: ["Hah! Tell me there's a rooftop. Tell me there's a really high rooftop.", "Is it tonight? Is it tonight?! Can I run in front? Can I scout? Can I—", "Stay close. Tonight nobody wanders. Nobody."],
    ironward: ["Hm. Gold walls. Thin.", "Of course we're doing this. Walk into the emperor's house. Why not.", "What stands behind the gold, and waits? ...Ask me when we are there."],
    breakers: ["Do palaces have kitchens? Big ones? With bread? Just asking. For after.", "We'll do it, we'll do it, I know we'll do it! Her! After all this time!", "Did you know the palace has three hundred servants and every one of them knows something? Stay quiet."],
    bastion: ["Thank you for letting us come. Mind the lamps, please. We are guests, even there.", "Walk lightly through the golden halls. Steady hearts.", "...Slowly... and then, not slowly. I think tonight is 'not slowly'."],
    wildfire: ["A palace! Golden walls, curtains, banners... I'm only saying: it's a lot of kindling.", "Oh, the guards won't see us. They never see us. Hee. Hush now.", "Will there be food? ...No. Not tonight. Tonight we get her."],
    dawn: ["I knew we would come here, in the end. I knew we would not come alone.", "So many lamps. I'll glow very small, so they won't see. Small as a candle.", "...A long sea. A short night. ...Be ready."],
  });
  // chapter 8, the Salt Heron with Imela aboard (one of the old trio is missing, nobody says so)
  add("voyage3", {
    vanguard: ["She talks more than all of us put together! ...I like her. Is that allowed?", "She talks like the tide, young bull. Steady. It is a good sound to sail under.", "She counted us twice, dear. She knows who is missing. She did not ask."],
    sprint: ["She counted us. Twice. Like someone who has counted walls for years.", "She called me 'darling' and I let her. Don't tell anyone.", "Did you see how she looked at him? Is that what a mother looks like? Is that what it is for?"],
    venom: ["Ha. She already has opinions about my moss. Grumble.", "...She is brave. She does not know it.", "She hugged me. Nobody hugs me. If that's all right, I would like another."],
    tempest: ["Hah! That woman out-sassed Brisk. Brisk! Never thought I'd see it.", "She knows every drain in that palace, did you know, how many drains is that, a hundred, a thousand?", "She does not sleep. I do not either. We keep watch together."],
    ironward: ["Hm. Good woman.", "Of course she's kind. Of course. Why does everyone have to be kind.", "She hums when she thinks nobody hears. A riddle I like."],
    breakers: ["She makes bread! On a ship! Out of nothing! Can we keep her?", "She's so happy, she's so happy, and sad, and happy, did you see?", "Did you know she has counted the days for nineteen years? She told me. She told ME."],
    bastion: ["A gentle hand and a firm voice. Thank you for bringing her out.", "Nineteen years in one room, and she walks the deck like a morning. Remarkable.", "...She is awake. Always awake. ...I like her."],
    wildfire: ["I'm not saying she's the most interesting person we've met, but she showed me how to light a stove properly. ...I was not doing it wrong.", "Hee— she caught me hiding in the pantry. She gave me a biscuit.", "She gave me a biscuit. ...She gave me TWO."],
    dawn: ["I knew her face. I knew it from his. ...What a gentle woman.", "I will glow for her at night. She does not sleep well.", "...A mother. ...The tide knows mothers."],
  });
  // chapter 7, inside the Palace Court
  add("palace", {
    vanguard: ["Everything's gold! Even the floor! ...Why is the floor gold? Who sweeps gold?", "Soft feet, young bull. Gold is loud when it falls.", "Eyes up, dear. The banners are watching."],
    sprint: ["Collar altar. I can smell the iron from here. Don't look at it too long.", "Don't touch anything. I mean it. Some of it is cursed and all of it is tacky.", "A sun calendar, and one square left blank. Why would you leave a square blank?"],
    venom: ["Ha. Gold and spears. They have never heard of moss.", "...They are afraid. All of them. It is in how they stand.", "So many guards. I'll go first. If that's all right."],
    tempest: ["Hah! Look at that fountain! Be a shame if somebody splashed in it.", "Can I touch the banner, can I touch it, it's so shiny, is it real gold?", "No jokes tonight. No splashing. Eyes on the dark corners."],
    ironward: ["Hm. Too many windows.", "Gold everywhere and nobody sings. Of course.", "What is rich, and cold, and has a thousand eyes? ...A palace."],
    breakers: ["I can smell oranges! Palace oranges! ...Focus. Focus.", "Shh shh shh, I'm being quiet, look how quiet I'm being!", "Did you know the head cook is the real ruler of this wing? The guards are afraid of her."],
    bastion: ["Mind the marble. It is old, and it has seen worse than us.", "Walk lightly. This floor remembers every footstep.", "...Many guards. ...Slowly. ...Let them come to us."],
    wildfire: ["Curtains. Cushions. Carpets. ...I'm not saying anything. I'm just saying.", "Booo! Did it work? No— wait, they didn't see. Hee.", "I smell figs. And a pig roasting. ...No. Quiet. I'm being quiet."],
    dawn: ["They look so tired, the guards. Perhaps they are kind when nobody is watching.", "The lamps are too bright. I'll dim a little.", "...Heavy walls. Heavy lives."],
  });
  // chapter 8, Pale Gate: the loan from the Corps (the fourth line is Emberwick's)
  add("guest", {
    vanguard: ["A tiny lion with a candle on its head! ...Hello! Don't bite. Or do. A little.", "Sit by me, little flame. I have been a wall a long time. I know how to be steady.", "Come here, dear. Let me see that mane. Oh, it is like a hearth. Just the same.", "Warm. Still warm. ...Hello."],
    sprint: ["A loan. Meaning it goes back. Remember that, anyone getting attached.", "A cub. Wonderful. Does it bite? It looks as if it bites. I approve.", "What do you eat? Where is your mother? Is Kessa your mother? Does the fire hurt?", "Kessa says be useful. So. I will be useful. ...Please do not look at my tail."],
    venom: ["Grumble. Another mouth. Fine. Stay out of my moss.", "...It is afraid of us. It is also braver than it knows.", "Oh! You smoulder too! I'm not alone in it! If that's all right.", "You are warm too. I... like that."],
    tempest: ["Hah! A cub with a fire on its head! Watch it, kid, it'll steal your hat.", "Can I touch it? Can I? Is it hot? Is it hot all the time? Can I— ow. It's hot.", "Small one. Stay behind me. You are not mine to lose, but I will mind you anyway.", "I was told you were loud. You are. I do not mind."],
    ironward: ["Hm. Small.", "Great. Kessa's pet. Spying on us. Wonderful. I'll try not to sneer.", "What burns, and is not hungry? ...A cub that has not met us yet.", "I am not a spy. I am only warm. That is all."],
    breakers: ["Do you eat? Do you want half my bread? It's a good bread. It's mostly crumbs.", "A new one! A new one! Hello, hello, hello! Do you like running?", "Did you know Kessa cried when she gave you up? She thinks nobody noticed.", "She did not cry. ...She did. A little."],
    bastion: ["Thank you for joining us. Please mind the step, little one. It is slippery.", "A small flame, walking among old stone. We will keep you steady.", "...Welcome. ...Sit. ...There is time.", "I am warm. I will not burn you. ...I promise."],
    wildfire: ["Another fire-maker! ...Not me, though. I'm not. It's you, now. Welcome.", "Hee! A little fire! Boo! Did you jump? Do it again!", "Is there... can I... you are warm. I like warm. Do you have food?", "I have a biscuit. Kessa gave it. ...You may have half."],
    dawn: ["I knew someone small and warm would come. Welcome. Stay as long as you like.", "You glow too. Not like me. Warmer. I will learn it from you.", "...Little ember. ...The tide will not put you out. Not here.", "Warm. I am warm. ...Thank you for not minding."],
  });
  // chapter 8: after the first convoy is cut
  add("convoy", {
    vanguard: ["We took their bread! ...Is it bad that I want some?", "A soldier eats what the empire gives him. Today the empire gave him less.", "Leave something for the mules, dear. They did nothing."],
    sprint: ["Roads feed armies. Cut the road. Simple.", "Honestly. Crate after crate of dull grain. Where is the wine?", "Where was it going? How many soldiers does a crate feed? Do they count that?"],
    venom: ["Ha. Grain. Moss thinks of everything as food.", "...They were afraid, the guards. Of us, and of the one who sent them.", "I hope the mules are all right. If that's all right to hope."],
    tempest: ["Hah! Three more crates for the resistance! They'll make bread of that!", "Is that all of it? There's more somewhere, right? Right? Where's the next one?", "An army marches on its belly. We cut the belly."],
    ironward: ["Hm. Hungry army.", "Fine. Starve them. They starved us. Why feel bad.", "What feeds a legion? A road. What stops a legion? The road."],
    breakers: ["All that food and we're not eating it?! ...No, I know. I KNOW.", "We got it, we got it, three crates, did you see?", "Did you know the soldiers on these wagons are paid half? They won't fight hard for half."],
    bastion: ["Thank you, gentlemen of the road, for the lesson. We will be gentle with the mules.", "A road is a thread. Cut one, and the whole cloth looks different.", "...Slowly... a legion starves slowly."],
    wildfire: ["Burn the crates? ...Did someone say burn the crates? I'm only asking.", "Hee! Smoke! Look, a tower of smoke! You can see it from the sea!", "Is any of it for us? ...No. Right. Right."],
    dawn: ["I knew the road would listen if we asked kindly. And firmly.", "I will sit with the hungry ones tonight.", "...Bread for the many. ...Fine work."],
  });
  // chapter 8: the Sunmaw pyramid
  add("pyramid2", {
    vanguard: ["The altar's cracked! Look, it's got a crack in it! Hah! ...Is that blood? Is that blood on the stair?", "Stone remembers what is done on it. This one remembers a great deal.", "Don't look at the steps, dear. Look at me. There."],
    sprint: ["A pyramid. Another altar. I know this place. I know the smell.", "Disgusting. Blood on the steps. Whoever built this had no taste at all.", "Who is on the summit? Can it hear us? Is the collar really cracked?"],
    venom: ["Grumble. Gods are for people who need to blame somebody.", "...The summit is crying. I can hear it from here.", "Is the one at the top afraid? I would be afraid. I'll go first."],
    tempest: ["Hah— no. Not funny here. Let's get up there quick.", "How many stairs? A hundred? A thousand? Can I count them? One, two—", "I do not like places that smell of offering. Stay together."],
    ironward: ["Hm. Old altar.", "Of course there's an altar. Why would there not be.", "What drinks, and is never full? ...The step."],
    breakers: ["I don't want to eat anything on these steps.", "Hurry, hurry, hurry, up the steps, up, up!", "Did you know the cultists don't love the altar? They love the rank. It's easy to tell."],
    bastion: ["Please forgive the muddy boots. We are here for the one who was bent.", "A stair that has known too many feet. Walk lightly.", "...Slowly. ...Climb slowly. Whoever is at the top has waited long."],
    wildfire: ["A pyramid of nothing but kindling and cult. ...I'm not saying. I'm just saying.", "Boo? Hee? No— not here. Here I am quiet.", "It smells of old meat. I don't like it."],
    dawn: ["I knew there would be someone at the top who needs us. There always is.", "I will light the stairs. They are so dark.", "...Heavy stairs. ...Climb them kindly."],
  });
  // chapter 8: the Veiled Cistern
  add("cistern", {
    vanguard: ["Statues everywhere. Staring. Hey! Hey, you! Blink!", "Do not meet their eyes, young bull. Not yet.", "They were people once, dear. See the hands? That one was holding a child."],
    sprint: ["Frozen mid-step. Like they were running. ...I know that feeling.", "Mirrors. Everywhere. Finally, something that appreciates me.", "How do the mirrors work? Which way do they turn? What happens if I'm wrong?"],
    venom: ["Grumble. Glass, water, stone. A cold place.", "...They are not statues. They are asleep. A different kind of asleep.", "Oh. They look so surprised. Poor things. Poor, poor things."],
    tempest: ["Hah— the one in the corner is giving me a look. Kid, that statue is judging me.", "How do we get across? Which mirror? Can I turn it? Is it heavy? Is it—", "Keep out of the gaze. All of you. All of you."],
    ironward: ["Hm. Still people.", "Of course there's a lake full of frozen people. Why wouldn't there be.", "What looks at you, and does not see? ...Wait. They do see."],
    breakers: ["It's too quiet. And too cold. And there's no food.", "I don't like it, I don't like it, can we go, can we go quick?", "Did you know every one of those statues has a name? The Veiled One keeps a list."],
    bastion: ["Please excuse us, friends. We will be as quiet as we can.", "Light on glass, glass on stone. A puzzle for steady hearts.", "...Still water. ...I like still water. ...Not this still."],
    wildfire: ["Cold. And wet. And ugly. Not fire's kind of place.", "Mirrors! I can see myself seeing myself! Hee— hee— oh, that's strange.", "A lake. A big lake. I could drink it. ...No. It isn't water."],
    dawn: ["I knew this was a sad place. I did not know how sad.", "I will glow so they know someone is here. Maybe they can feel it.", "...Still sea. ...Old sleep."],
  });
  // chapter 9: Ashfeather Camp, the ground shaking, a deep note under everything
  add("rootdeep", {
    vanguard: ["The ground is humming! Like the glass sand! ...Only angrier.", "A deep note, under everything. Something big, chewing. I know that sound from the old world.", "Keep your boots on tonight, dear. Just in case."],
    sprint: ["Ground shakes every few minutes. Something under us is moving.", "Rope bridges, mud and a dirt floor. This war has no taste at all.", "What is chewing? Why is it chewing? Does it ever stop to rest?"],
    venom: ["Grumble. Roots as big as towers. Finally, someone who understands moss.", "...Something under us is awake. It has been awake a long time.", "The ground is shaking. I'm— it's all right. I'm all right. If that's all right."],
    tempest: ["Hah! The whole camp wobbles! It's like a ship. Almost!", "What's under there, what's under there? Is it big? How big? Can I go look? Can I?", "Do not go near the edge. Not one of you."],
    ironward: ["Hm. Hollow ground.", "Great. A camp on top of a creature. Why not.", "What digs, and is never done? ...Wait. I know that one."],
    breakers: ["My soup is shaking! Look, look at it!", "Did you feel that? Did you? Again! Again!", "Did you know the soldiers up there lost two scouts to it? Nobody found them."],
    bastion: ["The earth is unhappy. Please, let us be gentle with it.", "A deep note, under the camp. Steady hearts. We have heard worse.", "...Slowly... something is waking. ...Not slowly."],
    wildfire: ["Roots! Miles of roots! ...Dry roots. ...I'm just saying. I'm just saying.", "Hee, it tickles! The ground tickles!", "Something is hungry down there. I know the feeling."],
    dawn: ["I knew it would sound like this. A sad, old note.", "I will glow low. It sleeps badly, whatever it is.", "...The deep calls to the deep."],
  });
  // chapter 9: the trio together again at the camp (nobody says who came back)
  add("returned", {
    vanguard: ["Three again! Three! That's how a pack sits! Loudly!", "Three stones make a hearth, young bull. It was cold with two.", "Eat, dears. All of you. Sit close. There."],
    sprint: ["...Three. Good. Count us again tomorrow.", "Don't get used to this. I'm only pleased because it's convenient.", "Are we all here? Is everyone here? Count us. Please count us."],
    venom: ["Grumble. Three. ...Ha. Don't tell anyone I'm happy.", "...The dark is lighter with all of us in it.", "We're all here. All three. If that's all right to say out loud."],
    tempest: ["Hah! The band's back together! Top pen, all three!", "Everyone's here! Everyone! Can we do something? Can we do anything?", "Three. I promised to protect. I can keep that promise again."],
    ironward: ["Hm. Whole.", "Fine. Fine. I'm glad. Don't tell anyone.", "What was three, and was two, and is three? ...You."],
    breakers: ["Three of us! Three portions! Okay, one each, but that's the idea!", "We're together, we're together, I knew it, I knew it!", "Did you know that was the last secret I was keeping? That I was scared? Now you know."],
    bastion: ["Thank you. All three of us here. Thank you, small one, for your patience.", "Steady hearts. The old guard is whole.", "...Whole. ...Good. ...Now I can nap."],
    wildfire: ["The gang's all here! ...I take no credit for the cell door. It was already like that.", "Hee! Boo! Three! We're three!", "We're all here. I'm not hungry. That's strange."],
    dawn: ["I knew we would be three again. I knew.", "I will glow for all three tonight.", "...The tide brought us home. Together."],
  });
  // chapter 9: after the man on the bridge
  add("dawn", {
    vanguard: ["He didn't even look at us! He didn't even— I wanted to bite him!", "A man who never raises his voice. That is the kind to fear, young bull.", "Come here, dear. Sit. You have gone very quiet. That is all right."],
    sprint: ["He walked like a man who has never had to run.", "Polite. Oh, I hate polite. Give me a loud tyrant any day.", "What did he mean, 'priced'? How do you price a person? What is your price?"],
    venom: ["Grumble. The kind of man who counts the grains in a sack of poison.", "...He believes every word he says. That is the worst of it.", "He seemed so tired. I know it's a silly thing to feel. If that's all right."],
    tempest: ["Hah— no. I don't have a joke. He's not funny.", "Who was that? Who was that? He knew who we were. He knew!", "He offered a gift. First. Always first. Be careful of gifts."],
    ironward: ["Hm. Dangerous man.", "Of course. The kindest-sounding one is the worst. Of course.", "What is offered, and costs everything? ...A hand held out."],
    breakers: ["He didn't even offer us a snack.", "He was nice, he was nice and I hated him, what's wrong with me?", "Did you know he has not raised his voice in nineteen years? His servants say so."],
    bastion: ["Thank you for standing firm. It was a hard kindness to refuse.", "A man who prices light. Walk lightly, all of us. He is listening.", "...Slow, patient men are the dangerous ones. ...I would know."],
    wildfire: ["I wanted to set the bridge on fire. ...I didn't. Look at me, restraint.", "Hee— no. No giggles. I did not like him.", "He didn't look hungry. That's how I knew."],
    dawn: ["I tried to find the good in him. ...I am still looking. It's difficult.", "He had a small lantern. Just a little one. I could have lit it better.", "...A man who owns the dawn, and does not see it."],
  });
})();
