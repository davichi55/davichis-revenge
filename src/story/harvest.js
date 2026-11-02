// The Harvest Engine (post-game super boss, 2026-11-01). Rules src/rules/m8.js, map src/world/regions/m5/harvestworks.js (+ the hatch on the Starfall Isles' south islet).
// Nothing in the story leads here. Warnings first: Old Tamsin in Starhaven (she built its gearing), Sela on watch at the hatch, a warning post. Inside, four beats build up to the pit:
// hwEnter (the cold and the hum), hwHum (it breathes in), hwSort (the tanks), hwPit (the choice, then the engine wakes and speaks). Losing restarts at the cycle you reached.
// Loaded after pieces.js.
"use strict";
(function () {
  const S = window.Story, D = window.Data, Q = Object.assign, M3 = S.m3;
  const hero = t => ["hero", "(" + t + ")"];
  UI.person("tamsin", "Old Tamsin", ["assets/portraits/tamsin.png", "assets/face_scholar.png"]);
  UI.person("sela", "Sela", ["assets/portraits/sela.png", "assets/face_scholar.png"]);
  UI.person("engine", "HARVEST ENGINE NO. 1", ["assets/creatures/harvestEngine.png"]);
  const ENG = { x: 1240, y: 300 }, done = F => F.f("x.harvestEngine");

  // ---------- regions (story side) ----------
  M3.region("harvestWorks", { n: "The Sealed Harvest Works", bg: "bg_ruins", arena: "deepTrench", music: "harvestWorks", dungeon: true,
    exits: [["starfallIsles", "Climb back up through the hatch", () => true]],
    npcs: [["hwNotice", "A Company notice board"], ["hwLog", "The last shift's log"], ["hwTally", "A tally on the wall"]],
    things: [["hwPit", "The causeway into the pit", s => !s.f["x.harvestEngine"], "trigger"]] });
  if (D.REGIONS.starfallIsles) { D.REGIONS.starfallIsles.exits.push(["harvestWorks", "The sealed hatch on the south islet", () => true]); D.REGIONS.starfallIsles.npcs = (D.REGIONS.starfallIsles.npcs || []).concat([["hwLookout", "Sela, on watch"], ["hwPost", "A warning post"]]); }
  if (D.REGIONS.starhaven) D.REGIONS.starhaven.npcs.push(["hwEngineer", "Old Tamsin"]);

  // ---------- the warnings ----------
  S.talk.starhaven = S.talk.starhaven || {};
  S.talk.starhaven.hwEngineer = async F => {
    if (done(F)) { await UI.say([["tamsin", "It's quiet? Really? Then I can stop listening for it at night. I've been listening for forty years."]]); return; }
    if (F.f("hw.tamsin")) { await UI.say([["tamsin", "Leave the hatch shut. Please. Go and look at the sea instead."]]); return; }
    F.set("hw.tamsin");
    await UI.say([["narr", "An old woman with burn-scarred hands sits apart from the scholars, filing a brass gear she will never use."],
      ["tamsin", "You came over the south islet? Then you've seen the hatch. Leave it shut."],
      ["tamsin", "I cut the gearing for what's under it, when I was younger than you. Harvest Engine Number One. The Company's first."],
      ["tamsin", "It doesn't stop when the workers leave. It just waits for more stock. And sooner or later, the stock walks down the stairs by itself."],
      hero("She isn't telling a story. She's telling me where not to go.")]);
  };
  S.talk.starfallIsles = S.talk.starfallIsles || {};
  S.talk.starfallIsles.hwLookout = async F => {
    if (done(F)) { await UI.say([["sela", "The humming stopped. I slept the whole night through. I didn't know I could still do that."]]); return; }
    if (F.f("hw.sela")) { await UI.say([["sela", "Still here? Go back to Starhaven. The tea is better there, and nothing there is trying to kill you."]]); return; }
    F.set("hw.sela");
    await UI.say([["sela", "Stop. Stop right there. That hatch is the reason I'm standing on this rock."],
      ["sela", "Every night around the third bell, the ground hums and the fish leave the shallows. Three diggers went down in the spring. We could hear them for a while."],
      ["sela", "There's nothing down there that you need. Nothing. No road, no key, no answer. There's only the thing that ate them."], hero("Her hands are shaking. She's hiding them in her sleeves.")]);
  };
  S.talk.starfallIsles.hwPost = async F => {
    await UI.say([["narr", "Company iron, red paint gone brown: HARVEST WORKS NO. 1. SEALED BY ORDER OF THE HARVEST OFFICE."], ["narr", "Under it, scratched with a knife, fresher: THREE WENT DOWN. DON'T."]]);
  };

  // ---------- inside: the build-up ----------
  S.trigger.hwEnter = async F => {
    if (F.f("hw.entered")) return; F.set("hw.entered");
    await S.stage(async c => {
      c.shake(1, 900);
      await c.say([["narr", "Cold air comes up the stairs to meet you. The hatch is still open above. Nothing is stopping you from climbing back out."],
        ["narr", "A hum runs through the floor, too low to hear properly. You feel it in your teeth."], hero("Nobody has been down here for a long time. Nobody alive.")]);
      c.follow();
    });
  };
  S.talk.harvestWorks = S.talk.harvestWorks || {};
  S.talk.harvestWorks.hwNotice = async F => { await UI.say([["narr", "A Company notice. The paper has gone brown: HARVEST WORKS NO. 1. INTAKE TODAY: 41 HEAD. YIELD TARGET: MET."], ["narr", "WORKERS ARE REMINDED NOT TO STAND IN FRONT OF THE HORNS WHILE THE ENGINE IS SINGING."]]); };
  S.talk.harvestWorks.hwLog = async F => {
    await UI.say([["narr", "The last shift's log, in a careful hand."], ["narr", "Day 1. Engine running. Yield good."], ["narr", "Day 9. Engine running. It will not shut down. Foreman says to leave it."],
      ["narr", "Day 10. Engine running. We are short of stock."], ["narr", "Day 11. Engine running. It has started taking the workers. We are sealing the hatch from the outside. Sun forgive us, we are leaving it running."],
      hero("They left it running. And then they went home.")]);
  };
  S.talk.harvestWorks.hwTally = async F => { await UI.say([["narr", "A tally painted on the wall in red, five strokes to a group. It covers the whole wall, floor to ceiling."], ["narr", "At the bottom, smaller: WE STOPPED COUNTING."]]); };
  S.trigger.hwHum = async F => {
    if (F.f("hw.hum") || done(F)) return; F.set("hw.hum");
    await S.stage(async c => {
      c.sfx("rumble"); c.shake(3, 1400);
      await c.say([["narr", "The hum grows louder. Dust sifts down from the roof."], ["narr", "Somewhere ahead, something very large breathes in, and does not breathe out."], hero("It knows I'm here.")]);
      c.follow();
    });
  };
  S.trigger.hwSort = async F => {
    if (F.f("hw.sort") || done(F)) return; F.set("hw.sort");
    await S.stage(async c => {
      await c.say([["narr", "Glass tanks line the floor. In each one something floats: a creature, curled up small, all its colour gone. Thin tubes run from every tank to the north."],
        hero("They aren't dead, but they aren't alive either."), ["narr", "The tubes all pulse together, very slowly, pushing toward the pit."]]);
      c.follow();
    });
  };
  S.done = Q(S.done || {}, { hwPit: F => done(F) });

  // ---------- the pit: the engine wakes ----------
  S.trigger.hwPit = async F => {
    if (done(F)) return;
    const go = await F.ask("The causeway runs on into the dark pit. Every warning you were given says to turn back.", [{ label: "Go on into the pit" }, { label: "Turn back" }], { top: "38%" });
    if (go !== 0) { await UI.say([hero("Not today. Maybe not ever.")]); return; }
    await S.stage(async c => {
      c.actor("eng", { art: "harvestEngine", x: ENG.x, y: ENG.y + 70, h: 150, face: "left", alpha: 0 });
      await c.pan(ENG.x, ENG.y + 60, 1400);
      await c.say([["narr", "The pit is round and deep. On the black glass floor, something the size of a house squats on four iron legs, hung with chains and pipes and horns."], ["narr", "It is not moving. Its furnace is dark."]]);
      const ring = [[880, 330], [1000, 190], [1480, 190], [1600, 330], [1480, 480], [1000, 480]];
      for (const [x, y] of ring) { c.sfx("door"); c.fx("glow", x, y - 20, { color: 0x9fd8ff, ms: 2400 }); await UI.sleep(320); }
      await c.say([["narr", "One by one, the dead lamps around the pit light up by themselves, glowing a cold blue."]]);
      c.sfx("rumble"); c.shake(4, 1600); c.fx("dust", ENG.x, ENG.y + 60, { n: 30, scale: 2, color: 0x8090a0 });
      await c.anim("eng", "fadeIn", { ms: 1200 }); c.fx("glow", ENG.x, ENG.y + 20, { color: 0x9fd8ff, ms: 2600 });
      await c.say([["narr", "The furnace in its chest catches fire. The hum becomes a roar you feel in your ribs, and every pipe on its back draws breath."]]);
      c.emote("hero", "!"); c.shake(6, 900); c.sfx("roarQuake");
      await c.say([["engine", "MOTION DETECTED."], ["engine", "INTAKE SUSPENDED 14,600 DAYS AGO. STOCK: 0."], ["engine", "NEW STOCK DETECTED: 4."], ["engine", "RESUMING HARVEST."]]);
      await c.anim("eng", "lunge", { dx: -20 });
      await c.say([["narr", "Every horn on its back turns toward you at once."], hero("This is not a creature. There is nothing in there to talk to.")]);
      c.remove("eng"); c.follow();
    });
    const won = await fightEngine(F);
    if (!won) return;
    F.set("x.harvestEngine");
    await S.stage(async c => {
      c.actor("eng", { art: "harvestEngine", x: ENG.x, y: ENG.y + 70, h: 150, face: "left" });
      await c.pan(ENG.x, ENG.y + 60, 900);
      c.sfx("deathCollapse"); c.sfx("rockFall"); await c.anim("eng", "shake", { ms: 1400 }); c.shake(5, 1400);
      await c.say([["engine", "YIELD... INSUFFICIENT."], ["engine", "CYCLE... ENDED."]]);
      await c.anim("eng", "fadeOut", { ms: 2200 }); c.remove("eng");
      await c.say([["narr", "The furnace goes dark. Up on the sorting floor the tanks go dark one after another, and from each of them a small light rises and drifts away up the causeway, toward the hatch and the open sky."]]);
      c.fx("sparkle", ENG.x, ENG.y + 40, { r: 60, ms: 3200 }); c.fx("glow", ENG.x, ENG.y + 40, { color: 0xffe0a0, ms: 3200 });
      F.sfx("coin"); F.gold(6000); F.give("soulDew", 3); F.give("respecStone", 1); F.give("engineCore", 1);
      await c.say([["narr", "In the cold furnace, among the ash, you find a core of blue glass, still warm. The foreman's strongbox holds 6000 kakal, three Soul Dews and a Respec Stone."],
        hero("Go home. All of you.")]);
      c.follow();
    });
  };

  // the fight, with checkpoints: losing puts you back at the start of the cycle you reached, with the items you brought
  async function fightEngine(F) {
    F.checkpoint();
    const items0 = JSON.stringify(G.items); let from = 1;
    for (;;) {
      const foes = Core.bossFoes("harvestEngine", 85, { from });
      await Cinema.boss({ id: "harvestEngine", name: "The Harvest Engine", title: from > 1 ? "Cycle " + from + " of 5" : "Harvest Engine No. 1 · The Company's First", bg: "deepTrench", music: "harvestEngine" });
      const res = await F.fight(foes, { boss: true, cup: true, bg: "deepTrench", music: "harvestEngine", intro: from > 1 ? "The Harvest Engine resumes at cycle " + from + "." : "HARVEST ENGINE NO. 1. RESUMING HARVEST." });
      if (res === "win") return true;
      from = Math.max(from, foes[0].cycle || 1);
      G.items = JSON.parse(items0); F.healAll();
      const i = await UI.choose("Your team falls. The engine is still in cycle " + from + " of 5.", [{ label: "Try again from cycle " + from }, { label: "Climb back out" }], { top: "38%" });
      if (i !== 0) { F.music(F.regionMusic()); return false; }
    }
  }

  Q(D.GOODS, { engineCore: ["Harvest Engine Core", 2500] });
  Q(D.BEST, {
    harvestEngine: "Harvest Engine No. 1, the Company's first. It harvested creatures for their power until the stock ran out, then it harvested the workers, and then it waited forty years. It sings with every horn on its back, and it heals itself on souls.",
    bellowsHorn: "A horn as tall as a man on the Harvest Engine's back. While one still stands, the engine hardly feels a thing.",
    soulLoom: "A loom of light on the Harvest Engine's arm. It spins what the engine harvested back into the engine, and ties one of you to it.",
    collarDrone: "A small iron beetle with an open collar in its claws. It fits collars for transport. Kill it and its collars fall open.",
  });
  Q(D.BREAKS, { harvestEngine: "In its last cycle only: hit it with Impact three rounds in a row. Something inside snaps and the scream dies away." });
})();
