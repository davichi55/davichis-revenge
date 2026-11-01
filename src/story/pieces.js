// Gear pieces spread out (2026-11-01, Danny: "isnt it strange that you can get the pieces at the same spot? ... spread it out over some optional bosses").
// Every set that used to come from one chest opened three times now gives only its first piece (the helm) from that chest. The other two pieces come from
// optional bosses, side quests and the bounty hunter. Ten new optional bosses (rules in src/rules/m7.js) stand on the maps as figures (region amb.hunters, sight 0).
// PIECES[set] = [armour source, weapon source]: "boss:<enemy id>" (any won fight that has it), "quest:<quest id>" (when the quest is completed), "hunt:<trigger id>".
// A piece you already own (older saves got them from the chests) pays kakal instead. Loaded after m6foes.js.
"use strict";
(function () {
  const S = window.Story, D = window.Data, F0 = window.Flow, Q = Object.assign;
  const hero = t => ["hero", "(" + t + ")"];
  const PIECES = {
    G5: ["boss:wellEater", "boss:mazeGuardian"], G20: ["quest:shard", "boss:stoneSinger"], G12: ["boss:cinderLich", "quest:debt"], G4: ["quest:bellow", "quest:tally"],
    G11: ["hunt:hunter1", "boss:xocoPoisoner"], G15: ["quest:steam", "boss:rootWitch"], G8: ["quest:lanterns", "boss:condorKeeper"], G10: ["boss:motherGlowmoth", "quest:kite"], G9: ["quest:wellStone", "boss:shearwing"],
    G26: ["quest:needle", "boss:blindOracle"], G28: ["quest:lantern", "quest:bounty2"], G14: ["boss:gateHound", "quest:hollowbell"], G18: ["quest:ring1", "boss:ironKnuckle"], G23: ["quest:pilgrim", "quest:ring2"],
    G38: ["boss:motherOfTheMaelstrom", "quest:bounty3"], G43: ["boss:mirrorChamberlain", "boss:emberWolf"], G13: ["quest:bounty5", "boss:nightDrinker"], G30: ["quest:cistern", "quest:bounty4"],
    G24: ["quest:bounty9", "quest:bounty7"], G35: ["quest:k8", "boss:stormcaller"], G40: ["boss:lastWarden", "boss:deepAngler"],
  };
  const SLOT2 = ["armor", "weapon"];
  const BY_SRC = {}; Object.keys(PIECES).forEach(set => PIECES[set].forEach((src, i) => (BY_SRC[src] = BY_SRC[src] || []).push([set, SLOT2[i]])));
  S.PIECES = PIECES;
  // one piece of a set; already owned -> kakal (one piece's worth at the shop is not known here, so a flat amount by chapter)
  S.givePiece = (F, set, slot) => {
    const pid = D.pieceId(set, slot), nm = D.pieceName(pid), sn = D.SETS[set].n;
    if (F.owned(pid)) { const g = 40 + 30 * (G.ch || 1); F.gold(g, true); UI.toast(`${nm} (${sn}): you have one already. Sold for ${g} kakal.`, 3600); return false; }
    G.owned[pid] = 1; UI.toast(`Gear: ${nm} (${sn})`, 3600); return true;
  };
  S.pieceFrom = (F, src) => { (BY_SRC[src] || []).forEach(([set, slot]) => { const k = "piece." + set + "." + slot; if (G.flags[k]) return; G.flags[k] = true; S.givePiece(F, set, slot); }); };
  // hooks: a won fight (boss:), a finished quest (quest:)
  const vic = F0.victory; F0.victory = async (foes, opts) => { const r = await vic(foes, opts); new Set(foes.map(e => e.id)).forEach(id => S.pieceFrom(F0, "boss:" + id)); return r; };
  const qd = F0.questDone; F0.questDone = id => { const was = G.quests[id] === "done"; qd(id); if (!was && G.quests[id] === "done") S.pieceFrom(F0, "quest:" + id); };

  // the old one-piece-per-visit chests: now only the helm, once; a chest whose helm you already own holds two Sunwater Flasks
  const chest = async (F, id, set, extra) => {
    F.visit = F.visit || {};
    if (F.visit[id]) { await UI.say([["narr", "The chest is empty."]]); return false; }
    F.visit[id] = true; F.sfx("door");
    if (extra) await extra(F, G.flags["gc." + id] || 0);
    const pid = D.pieceId(set, "helm");
    if (!F.owned(pid)) { G.owned[pid] = 1; G.flags["gc." + id] = 1; await UI.say([["narr", `You open the chest. Inside: ${D.pieceName(pid)} (${D.SETS[set].n}).`]]); UI.toast(`Gear: ${D.pieceName(pid)}`, 3200); return; }
    F.give("sunwater", 2); await UI.say([["narr", "Two Sunwater Flasks lie in the bottom of the chest."]]);
  };
  S.gearChest = chest; S.gearChest2 = chest;

  // ---------- the ten optional bosses: a figure on the map; touching it starts the scene (engine amb.hunters with sight 0 runs trigger <id>) ----------
  const OPT = {
    stoneSinger: { lv: 8, title: "Who Sings the Ground Awake", gold: 160,
      meet: [["narr", "A woman stands among the red rocks with her mouth open, singing one long low note. Pebbles roll toward her feet. The stones around her are humming back."]], thought: "The rocks are listening to her. That cannot be good for me.",
      after: [["narr", "Her song breaks off. The standing stones crack down the middle and go quiet."]] },
    xocoPoisoner: { lv: 14, title: "The Legion's Taster", gold: 380,
      meet: [["narr", "In the ruins a woman sits on a fallen head of stone, stirring a skull cup with one finger. The jungle is very quiet around her. Nothing is buzzing."]], thought: "Everything here is dead. Even the flies.",
      after: [["narr", "She drops the skull cup. What spills out eats a little hole in the stone."]] },
    rootWitch: { die: "deathCry", lv: 19, title: "Mother of the Blood Lilies", gold: 520,
      meet: [["narr", "Deep in the caves the roots grow up the walls into the shape of a woman. Red lilies open in her hair when she turns her head toward you."]], thought: "Do not breathe the flowers. Do not breathe the flowers.",
      after: [["narr", "The roots pull back into the walls. The lilies close, one by one, and drop."]] },
    condorKeeper: { lv: 20, title: "Master of the High Towers", gold: 540,
      meet: [["narr", "An old man in a cloak of black feathers watches you from the rocks. He lifts a bone whistle to his lips. High above, a shadow wider than a wagon turns once."]], thought: "He was waiting for something to walk up here. I walked up here.",
      after: [["narr", "The old man sits down on the rock and laughs, out of breath. The condor lands beside him and folds its wings."]] },
    blindOracle: { lv: 25, title: "Who Sees What You Will Do", gold: 640,
      meet: [["narr", "Among the shelves an old woman with a cloth over her eyes holds up a smoking bowl. A hundred little mirrors turn on their cords toward you."], ["narr", "\"You will strike with what you trust most,\" she says. \"They always do.\""]], thought: "She cannot see. So why is every mirror looking at me?",
      after: [["narr", "The bowl tips and the smoke runs out along the floor. The mirrors stop turning."]] },
    ironKnuckle: { lv: 31, title: "Champion of the Pit, Retired", gold: 820,
      meet: [["narr", "A huge bald man is punching a block of quarry stone. Chips fly. He stops, wipes his hands on his belt, and taps the gold buckle."], ["ironknuckle", "Nobody has taken this belt in twelve years. Come on, then. Three punches. That's all it ever takes."]], thought: "Three punches. I will count.",
      after: [["ironknuckle", "Ha! Good. Good! My knees are too old for this anyway."]] },
    mirrorChamberlain: { lv: 40, title: "Keeper of the Court's Faces", gold: 1100,
      meet: [["narr", "A tall man in gold and jade stands by the sundial. His face is a mirror. When he bows, his reflection in the pond bows a moment later, and so does a second one beside him."]], thought: "Which one of them is breathing?",
      after: [["narr", "The mirror mask cracks. Behind it there is only a tired, ordinary face, and then not even that."]] },
    nightDrinker: { die: "deathCry", lv: 47, title: "Priest of the Black Sun", gold: 1300,
      meet: [["narr", "Behind the altar something pale unfolds from the shadow. Its cloak is made of red feathers. Its teeth are not."]], thought: "Light. I need light.",
      after: [["narr", "It shrieks and falls apart into a cloud of red feathers that blow out through the pyramid's mouth."]] },
    stormcaller: { lv: 61, title: "Who Brings the Rain Indoors", gold: 1700,
      meet: [["narr", "Rain is falling inside the archive. In the middle of it a woman in dark blue holds her hands apart, and lightning walks between her fingers."]], thought: "Stay close to her. The storm hits whoever hangs back.",
      after: [["narr", "The rain stops in the middle of a drop. Water runs off the shelves and out under the doors."]] },
    deepAngler: { die: "deathCry", lv: 80, title: "The Light in the Deep", gold: 2400,
      meet: [["narr", "A small light bobs in the black water, warm and gold, like a lamp in a window at home. Behind it, very slowly, a mouth opens."]], thought: "Do not reach for the light.",
      after: [["narr", "The great jaw sinks back into the dark. The little gold light goes out last."]] },
  };
  UI.person("ironknuckle", "Toma", ["assets/portraits/ironknuckle.png", "assets/creatures/ironKnuckle.png"]);
  Object.keys(OPT).forEach(id => {
    const o = OPT[id];
    if (window.Cinema && Cinema.bossLooks) Cinema.bossLooks[id] = { entrance: "rise", glow: 0xd0b0ff };
    S.trigger[id] = async F => {
      if (F.f("x." + id)) return;
      await S.stage(async c => { await c.say(o.meet.concat([hero(o.thought)])); c.follow(); });
      await Cinema.boss({ id, name: Core.ENEMIES[id].name, title: o.title, bg: F.arenaOf(G.region), music: "boss" });
      const res = await F.boss(Core.bossFoes(id, o.lv), { bg: F.arenaOf(G.region), intro: Core.ENEMIES[id].intro, music: "boss" });
      if (res !== "win") return;
      F.set("x." + id);
      await S.stage(async c => { if (o.die) c.sfx(o.die); await c.say(o.after); F.sfx("coin"); F.gold(o.gold); c.follow(); });
    };
  });

  Q(D.BEST, {
    stoneSinger: "A geomancer who sings to the red rocks, and the rocks sing back. Every standing stone around her makes her song hit harder. Break the stones.",
    singingStone: "A standing stone that hums along with the Stone-Singer.",
    xocoPoisoner: "The legion's poison-taster, living in the jungle ruins. Every second round she drinks from her skull cup, and every drop of poison on you heals her.",
    rootWitch: "A witch grown out of the cave roots. She plants Blood Lilies; when one blooms it heals her and puts your team to sleep. Cut them before they open.",
    bloodLily: "A red lily the size of a barrel. It opens two rounds after it is planted.",
    condorKeeper: "An old falconer on the lookout towers. He marks one of you, and his Red Condor dives on whoever is marked. Kill the bird and he whistles for another.",
    redCondor: "The Condor Keeper's bird. It dives on the creature its master has marked.",
    blindOracle: "A blind woman among a hundred mirrors. Every second round she says the element you have used most, and turns it back on you. Change what you use.",
    ironKnuckle: "Toma, pit champion for twelve years. His punches stack up on one creature; the third is a knockout. Crack his guard with heavy blows and he loses count.",
    mirrorChamberlain: "The palace chamberlain with a mirror for a face. His mirror images catch blows meant for him. Hit them all at once.",
    mirrorImage: "One of the Mirror Chamberlain's reflections.",
    nightDrinker: "A priest of the black sun who drinks. Every bite makes him stronger. Fire and light burn the blood away, and a blaze of light burns it all.",
    stormcaller: "A woman who brings the rain indoors. Every third round the storm strikes everyone who held back from hitting her.",
    deepAngler: "A thing in the deep with a pretty light. When the lure is out, a plain attack on it bites the hook.",
  });
  Q(D.BREAKS, { ironKnuckle: "Impact, twice in a row. He stumbles and the combo count on all of you resets.", nightDrinker: "Light, twice in a row. Every stack of blood he drank burns out." });
})();
