// The eight rule enemies and the Cinder Lich (2026-11-01; rules in src/rules/m6.js, art in art-review/m7): bestiary text, drops, the Lich's tomb scene in the
// Cinderglass Flats, and Itzcan the bounty hunter, who walks three maps (Greenmaw Jungle, the Kharam Road, the Red Salt Flats) and comes for you when he sees you.
// Loaded after newfoes.js.
"use strict";
(function () {
  const S = window.Story, D = window.Data, Q = Object.assign;
  const hero = t => ["hero", "(" + t + ")"];
  UI.person("itzcan", "Itzcan", ["assets/portraits/itzcan.png", "assets/creatures/bountyHunter.png"]);

  Q(D.GOODS, {
    blackJarShard: ["Black Soul-Jar Shard", 95], charredRib: ["Charred Rib", 14], skullRattle: ["Skull Rattle", 44], berserkerTorc: ["Bronze Torc", 30],
    sunDiscPlate: ["Sun-Disc Plate", 34], quicksilverVial: ["Quicksilver Vial", 40], cutpurseKnife: ["Cutpurse's Knife", 26], bolaStone: ["Bola Stone", 40], juggernautRivet: ["Juggernaut Rivet", 42],
  });
  Q(D.DROPS, {
    cinderLich: [["blackJarShard", 1]], cinderThrall: [["charredRib", 0.5]], boneRattlePriest: [["skullRattle", 0.45]], oathBerserker: [["berserkerTorc", 0.45]], sunTemplar: [["sunDiscPlate", 0.45]],
    quickTransmuter: [["quicksilverVial", 0.45]], cutpurse: [["cutpurseKnife", 0.5]], bountyHunter: [["bolaStone", 1]], bronzeJuggernaut: [["juggernautRivet", 0.45]],
  });
  Q(D.BEST, {
    cinderLich: "A sun priest who burned himself into the black glass of the Flats so that he would never die. He keeps what is left of his heart in a jar. While the jar is whole, he gets up again.",
    soulJar: "A jar of smoky black glass with a blue flame inside, on the altar of the Cinder Lich. It is half hidden behind him while he stands.",
    cinderThrall: "Charred bones with glass grown through them, walking the Cinderglass Flats. Knock it down and it pulls itself back together. Fire, or light, and it stays down.",
    boneRattlePriest: "A priest with a painted skull face and a rattle made from a real one. Every other round he shakes it, and one of the fallen gets up. Take him first.",
    oathBerserker: "A tribesman from the cold north, paid in legion silver. The more you hurt him, the harder he hits. Finish him fast, or not at all.",
    sunTemplar: "A knight of the sun cult with a gold disc on his chest. He seals away the spark of whoever has gathered the most, and wears it as a shield.",
    quickTransmuter: "An alchemist in a mirror mask. Every second round the flask changes colour, and so does what hurts him. Watch the flask.",
    cutpurse: "A market thief who slips into other people's fights. He takes something from your bag and runs the next round. Catch him and you get it back.",
    bountyHunter: "Itzcan, who hunts for the Company by the head. He walks the roads with a charcoal drawing of your face, and a bola that pins one of you where you stand.",
    bronzeJuggernaut: "A legionary sealed in riveted bronze like a walking siege engine. Nothing slows him, nothing stuns him, until the plates crack.",
  });
  Q(D.BREAKS, { bronzeJuggernaut: "Impact, twice in a row. The plates crack, and from then on he can be slowed and stunned like anyone else." });

  // ---------- the Cinder Lich: optional boss in the north of the Cinderglass Flats (chapter 2) ----------
  if (window.Cinema && Cinema.bossLooks) Cinema.bossLooks.cinderLich = { entrance: "rise", glow: 0x9fd8ff };
  const TOMB = { x: 760, y: 210 };
  if (D.REGIONS.flats) D.REGIONS.flats.things.push(["cinderLich", "The black glass coffin", s => !s.f["x.cinderLich"], "trigger"]);
  S.trigger.cinderLich = async F => {
    if (F.f("x.cinderLich")) return;
    await S.stage(async c => {
      c.actor("jar", { art: "soulJar", x: TOMB.x, y: TOMB.y - 34, h: 30, face: "left" });   // on the altar behind the coffin
      if (!F.f("x.lichSeen")) {
        F.set("x.lichSeen");
        await c.pan(TOMB.x, TOMB.y + 20, 800);
        await c.say([["narr", "A coffin of black glass between two black pillars. Skulls on racks, facing it. Candles burn round it, fresh ones, out here where nobody lives."],
          ["narr", "Inside the glass a dead man lies with his arms crossed over a chest that has no heart in it. On the altar behind him, a jar of the same glass holds a small blue flame."]]);
      }
      c.sfx("rumble"); c.fx("glow", TOMB.x, TOMB.y - 44, { color: 0x9fd8ff, ms: 1600 });
      await c.say([["narr", "Every candle bends toward the jar at once, as if a door had opened."]]);
      c.actor("lich", { art: "cinderLich", x: TOMB.x, y: TOMB.y + 40, h: 100, face: "right", alpha: 0 });
      c.sfx("roar"); c.shake(4, 700); c.fx("sparkle", TOMB.x, TOMB.y + 10, { r: 30, ms: 1400 });
      await c.anim("lich", "fadeIn", { ms: 900 }); c.emote("hero", "!");
      await c.say([["narr", "The lid slides off and breaks. The dead priest stands up out of the glass, slowly, and the fire in his ribs turns blue."], hero("He was waiting for somebody. It was not me.")]);
      c.remove("lich"); c.remove("jar"); c.follow();
    });
    await Cinema.boss({ id: "cinderLich", name: "The Cinder Lich", title: "Who Sealed His Heart in Glass", bg: F.arenaOf(G.region), music: "boss" });
    const res = await F.boss(Core.bossFoes("cinderLich", 9), { bg: F.arenaOf(G.region), intro: "The Cinder Lich raises his staff!", music: "boss" });
    if (res !== "win") return;
    F.set("x.cinderLich");
    await S.stage(async c => {
      await c.pan(TOMB.x, TOMB.y + 20, 600);
      c.sfx("rockFall"); c.shake(3, 600); c.fx("dust", TOMB.x, TOMB.y + 30, { n: 24, scale: 1.6, color: 0x605860 });
      await c.say([["narr", "The bones fall in a heap of ash and glass. One by one the candles go out."]]);
      c.fx("glow", TOMB.x, TOMB.y + 20, { color: 0xffd36a, ms: 2000 }); c.fx("sparkle", TOMB.x, TOMB.y + 10, { r: 26, ms: 1800 });
      F.sfx("coin"); F.gold(220); F.give("ember", 2); F.give("sunwater", 2);
      await c.say([["narr", "Under the coffin, the offerings of a hundred years: coins fused into lumps, and some still loose. 220 kakal, two Ashen Embers and two Sunwater Flasks."],
        hero("Somebody kept lighting his candles. I hope they don't come back tonight.")]);
      c.follow();
    });
  };
  S.done = Q(S.done || {}, { cinderLich: F => F.f("x.cinderLich") });

  // ---------- Itzcan the bounty hunter: three meetings, he gets stronger and the price goes up; after the third he quits ----------
  const HUNTS = { hunter1: { lv: 13, gold: 420 }, hunter2: { lv: 29, gold: 820 }, hunter3: { lv: 46, gold: 1280 } };
  const won = F => ["hunter1", "hunter2", "hunter3"].filter(k => F.f("x." + k)).length;
  Object.keys(HUNTS).forEach(id => {
    S.trigger[id] = async F => {
      if (F.f("x." + id)) return;
      const h = HUNTS[id], n = won(F);
      await S.stage(async c => {
        const p = c.hero; c.actor("itz", { art: "bountyHunter", x: p.x + 70, y: p.y - 6, h: 62, face: "left" });
        if (n === 0) await c.say([["narr", "A man in a long sand-coloured coat. He holds up a scrap of paper with a face drawn on it in charcoal, looks at it, looks at you."],
          ["itzcan", "Close enough. The Company pays by the head, and yours is on the list."], hero("It is not even a good drawing.")]);
        else if (n === 1) await c.say([["itzcan", "You again. My leg still aches from the last time. The price on you has gone up. So have I."]]);
        else await c.say([["itzcan", "Third time. They doubled it again. I would like to retire on you."]]);
        c.remove("itz");
      });
      const res = await F.fight([F.mkEnemy("bountyHunter", h.lv), F.mkEnemy("houndOfTheCohort", h.lv - 1, " B")], { intro: "Itzcan swings his bola!", music: "boss" });
      if (res !== "win") return;
      F.set("x." + id); if (S.pieceFrom) S.pieceFrom(F, "hunt:" + id);   // Itzcan carries a gear piece (src/story/pieces.js)
      await S.stage(async c => {
        const p = c.hero; c.actor("itz", { art: "bountyHunter", x: p.x + 70, y: p.y - 6, h: 62, face: "left" });
        if (n < 2) {
          await c.say([["itzcan", n === 0 ? "Fine. Fine! Keep your head on a little longer." : "Twice. Nobody pays me enough for twice."]]);
          await c.walk("itz", p.x + 420, p.y + 30, 1600); c.remove("itz");
          F.sfx("coin"); F.gold(h.gold);
          await c.say([["narr", "His purse is lying where he fell. " + h.gold + " kakal."]]);
        } else {
          await c.say([["itzcan", "No. Nobody pays enough for this."], ["narr", "He tears the charcoal drawing in half and lets the wind take it."], ["itzcan", "Find another fool, Company."]]);
          await c.walk("itz", p.x + 420, p.y + 30, 1800); c.remove("itz");
          F.sfx("coin"); F.gold(h.gold); F.give("ember", 2);
          await c.say([["narr", "He left his purse, and the hunter's kit he will not need again. " + h.gold + " kakal and two Ashen Embers."]]);
        }
        c.follow();
      });
    };
  });
})();
