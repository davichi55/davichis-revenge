// Prologue: Orun, the Undercroft lessons, the pack choice during the raid, the escape.
"use strict";
(function () {
  const S = window.Story = window.Story || { talk: {}, trigger: {}, chest: {}, gather: {}, arrive: {} };
  const P = (id, name, face) => UI.person(id, name, face);
  // extra speakers (portraits come from assets/portraits/<id>.png when owner B adds them, else these stand-ins)
  P("traveller", "Traveller", ["assets/portraits/traveller.png", "assets/face_scholar.png"]); P("wellwoman", "Woman at the well", ["assets/portraits/wellwoman.png", "assets/face_innkeeper.png"]);
  P("caravaner", "Caravan guard", ["assets/portraits/caravaner.png", "assets/face_merchant.png"]); P("gossip", "Gossip", ["assets/portraits/gossip.png", "assets/face_scholar.png"]);
  P("pell", "Pell", ["assets/portraits/pell.png", "assets/face_scholar.png"]); P("foreman", "Shard foreman", ["assets/portraits/foreman.png", "assets/face_merchant.png"]);
  P("mazeheart", "Old Mazeheart", ["assets/portraits/mazeheart.png", "assets/face_mentor.png"]); P("kitemaker", "Kite maker", ["assets/portraits/kitemaker.png", "assets/face_merchant.png"]);
  P("courier", "Courier", ["assets/portraits/courier.png", "assets/face_merchant.png"]); P("captain", "Captain Brisk", ["assets/portraits/captain.png", "assets/face_merchant.png"]);
  P("apprentice", "Apprentice", ["assets/portraits/apprentice.png", "assets/face_scholar.png"]); P("karvan", "Optio Karvan", ["assets/portraits/karvan.png", "assets/face_merchant.png"]);
  P("soldier", "Raider", ["assets/portraits/soldier.png", "assets/face_merchant.png"]); P("bramblehoof", "Bramblehoof", ["assets/portraits/bramblehoof.png", "assets/creatures/bramblehoof.png"]);
  UI.PEOPLE.clerk.name = "Clerk"; UI.PEOPLE.merchant.name = "Merchant";

  // ---------- staging helpers for the early chapters (ch0, ch1, ch1x, ch2) ----------
  // S.stage = Cinema.stage that also runs in the menu hub (no map to film there): the same lines are spoken, every motion call does nothing.
  const hubMode = () => !!(Flow.engine && Flow.engine.mode === "hub");
  const dryStage = () => new Proxy({ hero: { x: 0, y: 0 }, say: lines => UI.say(lines), cageOut: (id, art, o = {}) => UI.say([...(o.before || []), ...(o.desc || [])]) }, { get: (t, k) => (k in t ? t[k] : k === "then" ? undefined : () => Promise.resolve()) });
  S.stage = async (fn, o) => {
    if (hubMode()) { try { await fn(dryStage()); } catch (e) { if (e instanceof Flow.Interrupt) throw e; console.warn("dry stage", e); } return; }
    return Cinema.stage(fn, o);
  };
  // where is this actor / map NPC / the hero right now? null when unknown (hub, headless tests)
  S.at = (c, id) => { try { const e = c._ent && c._ent(id); if (e && typeof e.x === "number" && typeof e.y === "number") return { x: e.x, y: e.y }; } catch (er) { /* unknown */ } return null; };
  // hurry an actor or map NPC to (x, y): about 200 px a second, never slower than 0.5 s or longer than 3.2 s
  S.rush = (c, id, x, y, speed) => { const p = S.at(c, id), d = p ? Math.hypot(p.x - x, p.y - y) : 0; return c.walk(id, x, y, Math.max(500, Math.min(3200, d / (speed || 200) * 1000))); };

  const rumourTalk = async (F, town, who, none) => {
    const r = F.rumour(town);
    if (r) { await F.say(who, r); F.sfx("menuOk"); } else await F.say(who, none || "Nothing new since you last asked. The market will talk again tomorrow.");
  };
  S.rumourTalk = rumourTalk;

  // ---------- the nine-pack slot rule (WORLD_MAP.md: mirror pack last, no two of a pack back to back) ----------
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  S.assignSlots = chosen => {
    const un = Data.PACKS.filter(p => p.id !== chosen), mirrorId = chosen === "dawn" ? "venom" : Data.MIRROR[chosen];
    const mirror = un.find(p => p.id === mirrorId), rest = un.filter(p => p !== mirror);
    const perm = {}; un.forEach(p => (perm[p.id] = shuffle(p.ids)));
    const seq = []; let last = null;
    for (let r = 0; r < 3; r++) {
      let order, tries = 0; do { order = shuffle(rest); tries++; } while (order[0] === last && tries < 60);
      order.forEach(p => seq.push(perm[p.id][r])); last = order[order.length - 1];
    }
    return { slots: seq.concat(perm[mirror.id]), unchosen: un.map(p => p.id), mirror: mirror.id };
  };
  // hook for later chapters: who is general number n (1-24), and what do they remember?
  S.generalFor = n => {
    const id = G.slots[n - 1]; if (!id) return null; const pk = Data.packOf(id);
    const lab = (Data.BANTER[pk.id].lab || []).find(l => l[0] === id);
    return { slot: n, id, name: Data.NAMES[id], pack: pk.id, lab: lab ? lab[1] : "", lines: (Data.BANTER[pk.id].lab || []).map(l => l[1]) };
  };

  // ---------- Orun ----------
  S.trigger["orun.start"] = async F => {
    if (F.f("pro.start")) return; F.set("pro.start");
    F.music("story");
    await UI.card({ image: "assets/bg_desert.png", big: "Prologue", text: "Orun, the Lantern Quarter. Third bell after dawn. The lamps on the bridges have not been put out yet." });
    F.music("town");
    // the Master crosses the city from the academy steps to find his late apprentice, says his piece and goes back
    await S.stage(async c => {
      const h = c.hero, m = S.at(c, "mentor");
      if (m) {
        await c.walk("mentor", 990, 700, 1400);                       // over the middle bridge
        await c.walk("mentor", h.x + 52, h.y - 34, 1500);
        c.face("mentor", "left"); c.face("hero", "up");
      }
      await c.say([["mentor", "Late again. And in that armour."]]);
      c.emote("hero", "...");
      await c.say([["hero", "..."]]);
      await c.say([
        ["mentor", "Hm. Never mind. Today is the day, apprentice. By nightfall you will have a team of your own."],
        ["mentor", "First, Old Dunmar will show you how a fight is read. Three lessons in the Undercroft. Go and find him at the lab."],
      ]);
      if (m) await c.walk("mentor", m.x, m.y, 2600);
    });
    F.quest("m_lessons", 0);
    UI.toast("Tip: Esc opens the menu.");
  };
  S.trigger["orun.vaultAuto"] = async F => { if (F.f("pro.lessons") && !F.f("pro.packed")) await S.trigger.vault(F); };

  const TIDY = [["tidy1", "a villager hands you a scroll: \"This was on the book stall. Looks like the Lab Master's.\" (1/3)"], ["tidy2", "a passer-by gives you a jar of cold lamp-oil: \"Found behind a shelf. The lab smell, I think.\" (2/3)"], ["tidy3", "the scholar returns a leaking ink bottle: \"This is Dunmar's, or the lab's. It stains.\" (3/3)"]];
  const tidyOrRumour = idx => async F => {
    const [flag, line] = TIDY[idx];
    if (F.qstep("tidy") === 0 && !F.f(flag)) { F.set(flag); await UI.say([["narr", line[0].toUpperCase() + line.slice(1)]]); if (F.f("tidy1") && F.f("tidy2") && F.f("tidy3")) F.quest("tidy", 1); return; }
    await S.rumourIdx(F, "orun", idx, ["apprentice", "gossip", "scholar"][idx]);
  };
  S.rumourIdx = async (F, town, idx, who) => {   // each villager tells one fixed rumour
    const list = Data.RUMOURS[town] || []; G.rumours[town] = G.rumours[town] || [];
    if (!G.rumours[town].includes(idx)) { G.rumours[town].push(idx); if (town === "amber" && idx === 0) { G.flags["lore.bearer"] = true; G.best.duneBearer = Object.assign(G.best.duneBearer || {}, { breakKnown: true }); } }
    await UI.say([[who || "narr", list[idx] || "Nothing to tell."]]);
  };
  const vil = [["r1", "apprentice"], ["r2", "gossip"], ["r3", "scholar"]];
  S.talk.orun = {
    mentor: async F => {
      if (!F.f("pro.dunmar")) await UI.say([["mentor", "Dunmar keeps the lab at the end of the lamp bridge. Three lessons, then the vault. Off you go."]]);
      else if (!F.f("pro.lessons")) await UI.say([["mentor", "Lessons first. A team you cannot read is a team you cannot lead."]]);
      else await UI.say([["mentor", "To the vault, apprentice. The pens are waiting."]]);
    },
    oldDunmar: async F => {
      if (!F.f("pro.dunmar")) {
        // the three loaners really come out of the lab house door and gather round you
        await S.stage(async c => {
          await c.say([
            ["dunmar", "There you are, lad. Still wearing the tin, I see."],
            ["hero", "It's comfortable."],
            ["dunmar", "Liar. Never mind. Ithiel says three lessons, so three lessons."],
          ]);
          const h = c.hero, ids = ["horncinder", "shellmund", "kitsuneva"];
          c.sfx("woodDoor"); c.fx("dust", 1560, 508, { n: 8 });
          await Promise.all(ids.map(async (id, i) => {
            await c.wait(i * 450);
            c.actor("vg" + i, { art: id, x: 1560 + (i - 1) * 14, y: 510, scale: 0.9, alpha: 0 });
            await c.anim("vg" + i, "fadeIn", { ms: 250 });
            await c.walk("vg" + i, h.x + 46 + i * 38, h.y + 16 + (i % 2) * 14, 1500);
            c.face("vg" + i, "left");
          }));
          c.emote("vg1", "heart");
          await Promise.all(ids.map((id, i) => c.anim("vg" + i, "hop")));
          await c.say([
            ["dunmar", "You have no team yet, so I lend you the oldest trio in my pens. The Vanguard. They taught half the apprentices in this city. Be kind to them."],
            ["dunmar", "The Undercroft stair is behind the lab house. Go down, go deeper, listen to my voice. It carries."],
          ]);
          c.fx("sparkle", h.x + 80, h.y - 10, { r: 40, ms: 900 });
          await Promise.all(ids.map((id, i) => c.anim("vg" + i, "fadeOut", { ms: 500 })));
        });
        F.set("pro.dunmar"); F.quest("m_lessons", 1);
        G.party = ["horncinder", "shellmund", "kitsuneva"].map(id => F.mk(id, 1));
        UI.toast("The Vanguard joins you for the lessons.");
      } else if (!F.f("pro.lessons")) await UI.say([["dunmar", "The Undercroft, lad. Down the stair, deeper each time. I'll be talking in your ear."]]);
      else await UI.say([["dunmar", "The vault. Go on."]]);
    },
    labMaster: async F => {
      const st = F.qstep("tidy");
      if (st === undefined) {
        await UI.say([["scholar", "You're Dunmar's apprentice? The lab is a mess. Three things have gone missing: a scroll, a jar of lamp-oil and a bottle of ink. Someone must have carried them off."], ["scholar", "Ask around. People in this city pick up everything: the villagers on the avenues, and the scholar standing at my door. Bring them back and the old temple kit in my cupboard is yours."]]);
        F.quest("tidy", 0);
      } else if (st === 1) {
        await UI.say([["scholar", "My scroll! My oil! My ink! Marvellous. Here, the temple-school kit. It never fit me."]]);
        F.giveGear("G44", 3); F.questDone("tidy"); F.sfx("coin");
      } else if (st === 0) await UI.say([["scholar", `Found ${[1, 2, 3].filter(n => F.f("tidy" + n)).length} of 3? Scroll, lamp-oil, ink. Ask the villagers on the avenues, and the scholar at my door.`]]);
      else await UI.say([["scholar", "The lab is tidy again, thanks to you."]]);
    },
    merchant: async F => { await UI.say([["clerk", "Academy shop. Flasks and antidotes, apprentice prices."]]); await F.shop("orun"); },
    innkeeper: async F => { await UI.say([["innkeeper", F.innCost("orun") ? "A bed in the Lamp and Quill?" : "Your first night is on the academy, apprentice."]]); await F.inn("orun"); },
    r1: tidyOrRumour(0), r2: tidyOrRumour(1), r3: tidyOrRumour(2),
    lockedLabDoor: async F => { await UI.say([["narr", "A brass plate: CAGE HALL. KEEPER ONLY. The lock is cold and heavy."], ["hero", "(What does Dunmar keep in there?)"]]); },
  };
  S.tidyCheck = () => {};
  S.trigger.packChoice = async F => { if (F.f("pro.lessons") && !F.f("pro.packed")) await S.trigger.vault(F); };
  S.trigger.raidStart = async () => {};

  // ---------- Undercroft: three lessons ----------
  // between lessons the loaners are patched up (Danny: the old "cool pool in the wall" line pointed at a pool nobody could see)
  const heal = async F => {
    F.healAll();
    await S.stage(async c => {
      const h = c.hero, ids = (G.party || []).map(u => u.id).slice(0, 3);
      ids.forEach((id, i) => c.actor("hl" + i, { art: id, x: h.x + 56 + i * 36, y: h.y + 14 + (i % 2) * 14, scale: 0.9 }));
      c.actor("hlD", { art: "npcDunmar", x: h.x - 170, y: h.y - 6, alpha: 0 });
      await c.anim("hlD", "fadeIn", { ms: 300 });
      await S.rush(c, "hlD", h.x + 12, h.y - 8, 150);
      c.sfx("splash"); c.fx("splash", h.x + 90, h.y + 24, { scale: 1.6 }); c.fx("sparkle", h.x + 90, h.y - 10, { r: 50, ms: 1400 });
      await Promise.all(ids.map((id, i) => c.anim("hl" + i, "shake", { ms: 350 })));
      c.sfx("heal");
      await Promise.all(ids.map((id, i) => c.anim("hl" + i, "hop")));
      await c.say([["narr", "Old Dunmar tips a bucket of spring water over the creatures. They shake it off, good as new."]]);
      await c.anim("hlD", "fadeOut", { ms: 400 });
    });
  };
  const lessonN = F => (F.f("pro.l1") ? (F.f("pro.l2") ? 3 : 2) : 1);
  S.trigger.cellarTutorial = async F => { if (!F.f("pro.dunmar")) return; if (!F.f("pro.l1")) await S.trigger.lesson(F); if (F.f("pro.l1") && !F.f("pro.l2")) await S.trigger.lesson(F); };
  S.trigger.undercroftDeep = async F => { if (!F.f("pro.dunmar")) return; while (!F.f("pro.lessons")) { const before = lessonN(F); await S.trigger.lesson(F); if (lessonN(F) === before && !F.f("pro.lessons")) return; } };
  S.trigger.lesson = async F => {
    if (F.f("pro.lessons")) return;
    const n = lessonN(F);
    if (n === 1) {
      await UI.say([["narr", "The Undercroft: wet stone, old builder pipes, a smell of ink and iron."]]);
      await F.banter("tut", { pack: "vanguard" });
      await UI.say([["dunmar", "Lesson one. Nobody starts a fight with magic. Your basic attack builds MP, +1 each time. Spells spend it."],
        ["dunmar", "Weak spells cost 1 MP, medium 2, strong 3. Hit that slug, get some MP, then cast something cheap."]]);
      const res = await F.fight([F.mkEnemy("pipeSlug", 1)], {}); if (res === "win") { F.set("pro.l1"); await UI.say([["dunmar", "Good. Basic attack, build, spend. Remember it, you'll do it ten thousand times."]]); await heal(F); }
    } else if (n === 2) {
      await UI.say([["dunmar", "Lesson two. Items, and Speed. A Sunwater Flask heals a quarter of one creature's HP. One item per creature per turn."],
        ["dunmar", "And Speed: if a creature is twice as fast as its enemy, it gets a third action that turn. No dodging in this game, only racing."],
        ["narr", "Dunmar slips three Sunwater Flasks down the stair."]]);
      F.give("sunwater", 3);
      const res = await F.fight([F.mkEnemy("inkImp", 2, " A"), F.mkEnemy("inkImp", 2, " B")], {}); if (res === "win") { F.set("pro.l2"); await UI.say([["dunmar", "Fine. A flask costs an action, so it is for when you must, not when you can."]]); await heal(F); }
    } else {
      await UI.say([["dunmar", "Lesson three, the last. Weaknesses. When you pick a target, look at what it fears and what it shrugs off."],
        ["dunmar", "This box is the old kind, full of tricks, but it hates fire. Two of these three breathe fire. Use it."],
        ["dunmar", "One more thing, for later. Every enemy has a guard. Once your creatures learn medium and strong moves, those crack it, and a broken enemy takes 50% more damage for a couple of turns. Today you cannot do that yet. Just burn it."]]);
      const res = await F.fight([F.mkEnemy("gelatinCubeMimic", 2)], {});
      if (res === "win") {
        F.set("pro.lessons"); await heal(F);
        F.quest("m_lessons", 2);
        await S.stage(async c => {
          const h = c.hero;
          await c.say([["dunmar", "That is all I have. Go up, take your pick of the pens, and..."]]);
          c.sfx("quake"); c.shake(6, 1100); c.tint("#1a1008", 0.3, 400);
          c.fx("dust", h.x - 70, h.y - 50, { n: 10, scale: 1.4 }); c.fx("dust", h.x + 80, h.y - 40, { n: 10, scale: 1.4 }); c.fx("dust", h.x, h.y - 90, { n: 8 });
          c.emote("hero", "!");
          await c.say([["narr", "A deep boom rolls through the stone. Dust sifts from the pipes."]]);
          await c.wait(500);
          await c.say([["dunmar", "...That was not a pipe."]]);
        });
        F.sfx("encounter"); F.go("orun", "vault");
      }
    }
  };

  // ---------- the pack choice during the raid ----------
  function pickPack() {
    let sel = 0;
    const cols = 3;
    return UI.window("Choose your team", (body, api) => {
      body.innerHTML = `<div style="color:#ff6b57;margin:-2px 0 10px;font-size:19px" class="shake">The horn! The walls are shaking! Choose, and run.</div>
        <div class="grid" style="grid-template-columns:repeat(${cols},1fr)">${Data.PACKS.map((p, i) => `<button class="pk${i === sel ? " sel" : ""}" data-p="${i}"><div class="art">${p.ids.map(id => UI.art(id)).join("")}</div><b>${p.n}</b><small>${p.ids.map(id => Data.NAMES[id]).join(" · ")}</small></button>`).join("")}</div>`;
    }, { noClose: true, closeLabel: "", gold: () => "", foot: "Arrow keys and Enter, or click.",
      click: (e, api) => { const b = e.target.closest("[data-p]"); if (b) { sel = +b.dataset.p; api.redraw(); if (e.detail >= 1) api.close(sel); } },
      keys: (e, api) => { const k = e.key; if (k === "ArrowRight") sel = (sel + 1) % 9; else if (k === "ArrowLeft") sel = (sel + 8) % 9; else if (k === "ArrowDown") sel = (sel + 3) % 9; else if (k === "ArrowUp") sel = (sel + 6) % 9; else if (k === "Enter" || k === " ") return api.close(sel); else return; api.redraw(); } });
  }
  // the clicked pack, big: the three creatures and their names (still no styles), then take them or look again
  function packCloseup(p) {
    let sel = 0;
    const img = id => `<div style="display:flex;flex-direction:column;align-items:center;gap:8px"><div style="height:250px;display:flex;align-items:flex-end;justify-content:center"><img src="assets/creatures/${id}.png" alt="${UI.esc(Data.NAMES[id])}" style="height:240px;width:240px;object-fit:contain;object-position:bottom;image-rendering:pixelated;filter:drop-shadow(0 6px 8px #000a)" onerror="this.style.visibility='hidden'"></div><b style="font-family:'Marcellus SC',serif;font-size:20px;color:#f2c14e">${UI.esc(Data.NAMES[id])}</b></div>`;
    return UI.window(p.n, (body) => {
      body.innerHTML = `<div style="display:flex;justify-content:space-around;align-items:flex-end;gap:16px;padding:18px 8px 26px;background:radial-gradient(ellipse at 50% 85%,#3a2614,#1b130e 70%);border:1px solid #3a2a1a">${p.ids.map(img).join("")}</div>
        <div style="display:flex;justify-content:center;gap:18px;margin-top:18px">${["Take them", "Look again"].map((l, i) => `<button class="row${i === sel ? " sel" : ""}" data-c="${i}" style="min-width:190px;justify-content:center;color:inherit;font:inherit;font-size:19px;cursor:pointer">${l}</button>`).join("")}</div>`;
    }, { noClose: true, closeLabel: "", gold: () => "", foot: "Left/Right and Enter, Esc to look again, or click.",
      click: (e, api) => { const b = e.target.closest("[data-c]"); if (b) api.close(+b.dataset.c === 0); },
      keys: (e, api) => { const k = e.key; if (k === "ArrowLeft" || k === "ArrowRight") { sel = 1 - sel; api.redraw(); } else if (k === "Enter" || k === " ") api.close(sel === 0); else if (k === "Escape" || k === "Backspace") api.close(false); } });
  }
  S.trigger.vault = async F => {
    F.music("packChoice");
    // the pens stand in a row, Dunmar and the Master hurry over, then the first blast shakes the courtyard
    await S.stage(async c => {
      const h = c.hero, pens = Data.PACKS.map(p => p.ids[0]);
      c.tint("#101420", 0.2, 800);
      pens.forEach((id, i) => c.actor("pen" + i, { art: id, x: h.x - 320 + i * 80, y: h.y - 150 + (i % 2) * 14, scale: 0.8, alpha: 0 }));
      c.sfx("woodDoor");
      await Promise.all(pens.map((id, i) => c.anim("pen" + i, "fadeIn", { ms: 500 + i * 70 })));
      await c.say([["narr", "The creature vault. Nine pens in a ring, and three pairs of eyes in each."]]);
      await S.rush(c, "oldDunmar", h.x - 64, h.y - 12); c.face("oldDunmar", "right");
      await c.say([
        ["dunmar", "Here, lad. Today you choose. Not the strongest, there's no such thing. Choose the ones you can stand beside."],
        ["hero", "How will I know?"],
        ["dunmar", "You won't. Not by looking. That's the joke of it."],
      ]);
      await S.rush(c, "mentor", h.x + 60, h.y - 22); c.face("mentor", "left"); c.emote("oldDunmar", "!");
      await c.say([
        ["mentor", "Dunmar. It's time."],
        ["dunmar", "Already? The bell hasn't even..."],
      ]);
      c.sfx("explosion"); c.shake(7, 1000); c.flash("#ffc890", 280); c.tint("#3a0c08", 0.35, 500);
      c.fx("dust", h.x - 120, h.y - 80, { n: 10, scale: 1.5 }); c.fx("dust", h.x + 120, h.y - 60, { n: 10, scale: 1.5 });
      pens.forEach((id, i) => { if (i % 3 === 0) c.emote("pen" + i, "!"); });
      await c.wait(500); c.sfx("hornWar");
      await c.say([["narr", "BOOM. The floor jumps. Out in the courtyard a flat, ugly horn begins to blow."]]);
      c.emote("hero", "!");
      await c.say([
        ["mentor", "That is the empire. Choose, apprentice. We have a moment. No more."],
        ["hero", "How can you be so calm?"],
        ["mentor", "Because panic is not a plan."],
      ]);
      await Promise.all(pens.map((id, i) => c.anim("pen" + i, "fadeOut", { ms: 450 })));
    });
    F.music("raid"); F.sfx("encounter");
    let pick;
    for (;;) {
      pick = await pickPack(); const p = Data.PACKS[pick];
      if (await packCloseup(p)) break;
    }
    const pk = Data.PACKS[pick];
    const sl = S.assignSlots(pk.id);
    G.pack = pk.id; G.slots = sl.slots; G.unchosen = sl.unchosen; G.mirror = sl.mirror;
    // level 3, but the 2 levels' worth of stat points (6) are the player's to spend, not pre-spread
    G.party = pk.ids.map(id => { const u = F.mk(id, 3); try { u.stats = Core.makeCreature(id, 1).stats; u.maxHp = Core.maxHpOf(u.stats, u.level); u.hp = u.maxHp; u.points = (u.points || 0) + 6; } catch (e) {} return u; }); G.collection = [];
    G.items.sunwater = (G.items.sunwater || 0);
    F.set("pro.packed"); F.questDone("m_lessons");
    // the chosen three spill out, soldiers flood in from the hall, the Master holds them while you run for the south gate
    await S.stage(async c => {
      const h = c.hero, ids = pk.ids;
      c.tint("#3a0c08", 0.3, 400);
      ids.forEach((id, i) => c.actor("pc" + i, { art: id, x: h.x + (i - 1) * 70, y: h.y - 140, scale: 0.95, alpha: 0 }));
      c.sfx("woodDoor");
      await Promise.all(ids.map((id, i) => c.anim("pc" + i, "fadeIn", { ms: 250 })));
      const spots = [[-58, 20], [62, 20], [2, 54]];
      Promise.all(ids.map((id, i) => c.walk("pc" + i, h.x + spots[i][0], h.y + spots[i][1], 900)));
      await c.say([
        ["narr", `You throw the pen gate wide. ${pk.ids.map(id => Data.NAMES[id]).join(", ")} spill out and press against your armour.`],
      ]);
      await Promise.all(ids.map((id, i) => c.anim("pc" + i, "hop")));
      await F.banter("choose");
      c.sfx("hornWar"); c.shake(4, 700);
      const arts = ["raidShieldbearer", "raidSpearman", "raidTorchbearer", "raidShieldbearer", "raidSpearman"];
      arts.forEach((art, i) => c.actor("sd" + i, { art, x: h.x - 200 + i * 100, y: h.y - 420 - (i % 2) * 36, light: art === "raidTorchbearer" ? 110 : 0 }));
      await Promise.all(arts.map((art, i) => c.walk("sd" + i, h.x - 200 + i * 100, h.y - 200 - (i % 2) * 30, 1500)));
      c.emote("sd2", "!"); c.sfx("clang");
      await c.say([
        ["narr", "Soldiers flood the vault behind you. Iron collars, ropes, shields like walls. Eight pens go dark, one after another."],
        ["hero", "No... the others!"],
        ["dunmar", "Out, lad! The back stair! Now!"],
      ]);
      c.emote("hero", "anger");
      await c.say([["mentor", "Take this. Your Field Journal. Everything you see and fight goes into it. Everything. Do you understand?"]]);
      c.sfx("itemGet"); c.fx("glow", h.x, h.y - 40, { color: 0xffd36a, ms: 1200 });
      await c.say([
        ["hero", "Master, come with us!"],
        ["mentor", "Someone must slow them. Go west, over the dunes, to Sandpiper Rest. I will send word."],
      ]);
      await S.rush(c, "mentor", h.x + 4, h.y - 110, 260); c.face("mentor", "up");
      c.sfx("swordClash"); c.shake(3, 400); c.fx("dust", h.x, h.y - 130, { n: 8 });
      const dm = S.at(c, "oldDunmar");
      if (dm) c.walk("oldDunmar", Math.max(80, h.x - 520), h.y - 40, 1100);
      await c.say([
        ["narr", "The satchel is already packed. Your name is stitched on the strap, and the thread looks old."],
        ["dunmar", "I'll save the cages I can. Find me when it's quiet. Amber Wells. Look for a wagon."],
        ["hero", "(I'll come back for all of you. I swear it.)"],
      ]);
      const gy = Math.min(h.y + 260, 1330);
      await Promise.all([c.walk("hero", h.x, gy, 1300), ...ids.map((id, i) => c.walk("pc" + i, h.x + spots[i][0], gy - 10 + (i === 2 ? 30 : 0), 1300))]);
    });
    F.give("journal", 1, true); F.give("sunwater", 4, true);
    UI.toast("You received the Field Journal and 4 Sunwater Flasks.");
    F.quest("m_escape", 0);
    F.autoSave = true;
    F.go("dunes", "start");
  };
})();
