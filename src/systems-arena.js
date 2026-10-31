// Arena of Tzavan (owner: SYSTEMS): cups, Crowd Cheer, bets, purses, ball court, rank board, Champions' Wall, clerk conversation.
// API: logs/SYSTEMS.md section 2. Loaded right after src/systems.js.
"use strict";
(() => {
  const S = window.Systems, F = Flow, esc = S.esc;
  const A = () => S.state().arena;
  const price = () => Data.priceOf("sunwater", F.tier());
  const entryFee = () => 4 * price();
  const LICENCE = 300, CHEER_MAX = 6, CHEER_STEP = 0.03;

  // ---------- cups (ECONOMY.md arena purses, WORLD_MAP.md section 7) ----------
  const CUPS = Data.CUPS = Data.CUPS || {};
  const cup = (id, o) => { if (!CUPS[id]) CUPS[id] = Object.assign({ id, bg: "colosseum", music: "battleArena", entryP: 4, purseM: 3 }, o); };
  cup("bronze", { n: "Bronze Cup", ch: 6, m: 115, gear: "G1", note: "Three fights and a gladiator with a captured beast.",
    fights: [
      { n: "Shield squad", foes: ["legionShieldbearer", "legionSpearman", "legionArcher"], lv: 30 },
      { n: "The beast pen", foes: ["arenaLionWolf", "arenaBoarBull"], lv: 31 },
      { n: "Optio's drill", foes: ["legionOptio", "legionShieldbearer", "legionSpearman"], lv: 32 }],
    champion: { n: "Bronze Champion", foes: ["bronzeChampion", "bronzeBeast"], lv: 34, intro: "The Gladiator of the Black Sand steps out behind a tower shield, a chained beast at his heel." } });
  cup("iron", { n: "Iron Cup", ch: 8, m: 170, gear: "G2", note: "Four fights, then the Spear Twins.",
    fights: [
      { n: "Pike wall", foes: ["legionSpearman", "legionSpearman", "legionShieldbearer"], lv: 44 },
      { n: "Sun bulls", foes: ["arenaBoarBull", "arenaBoarBull", "arenaLionWolf"], lv: 45 },
      { n: "Archers' roost", foes: ["legionArcher", "legionArcher", "legionOptio"], lv: 46 },
      { n: "Centurion's guard", foes: ["legionCenturion", "legionShieldbearer"], lv: 47 }],
    champion: { n: "The Spear Twins", foes: ["spearTwinA", "spearTwinB"], lv: 49, intro: "Two spearmen walk out in step. When one lunges, so does the other." } });
  cup("silver", { n: "Silver Cup", ch: 9, m: 190, gear: "G3", note: "Four fights, then a general from the packs you did not take.",
    fights: [
      { n: "Standard bearers", foes: ["legionCenturion", "legionArcher", "legionShieldbearer"], lv: 52 },
      { n: "Black sand beasts", foes: ["arenaLionWolf", "arenaBoarBull", "arenaLionWolf"], lv: 53 },
      { n: "Optio's revenge", foes: ["legionOptio", "legionOptio", "legionSpearman"], lv: 54 },
      { n: "Cohort in square", foes: ["legionCenturion", "legionShieldbearer", "legionSpearman"], lv: 55 }],
    champion: { n: "The Silver General", foes: ["silverGeneral"], lv: 58, intro: "A general you might have been given wades onto the sand. It is not the story's general. Today it is simply the best they have." } });
  cup("naval", { n: "Naval Cup", ch: 10, m: 235, gear: "G39", flood: true, bg: "colosseum", note: "The sand is flooded for the Naumachia. Four fights, then the Admiral.",
    fights: [
      { n: "Galley crew", foes: ["legionShieldbearer", "legionArcher", "legionSpearman"], lv: 60 },
      { n: "Tide beasts", foes: ["arenaSeaBeast", "arenaSeaBeast"], lv: 61 },
      { n: "Boarding party", foes: ["legionOptio", "legionSpearman", "legionSpearman"], lv: 62 },
      { n: "Ram and net", foes: ["arenaSeaBeast", "legionCenturion"], lv: 63 }],
    champion: { n: "The Naumachia Admiral", foes: ["naumachiaAdmiral", "arenaSeaBeast"], lv: 66, intro: "Water pours over the white steps. The Admiral stands on a ship's prow that was never built to float." } });
  cup("grand", { n: "Grand Cup", ch: 12, m: 330, gear: "G46", note: "Five fights, then the Grand Champion.",
    fights: [
      { n: "Banner guard", foes: ["legionCenturion", "legionShieldbearer", "legionArcher"], lv: 72 },
      { n: "Beast kings", foes: ["arenaLionWolf", "arenaBoarBull", "arenaLionWolf"], lv: 73 },
      { n: "Twin spears again", foes: ["spearTwinA", "spearTwinB", "legionOptio"], lv: 74 },
      { n: "The silver rank", foes: ["silverGeneral", "legionCenturion"], lv: 75 },
      { n: "Tidal guard", foes: ["arenaSeaBeast", "naumachiaAdmiral"], lv: 76 }],
    champion: { n: "The Grand Champion", foes: ["grandChampion"], lv: 80, intro: "A jaguar-man in a gold collar, undefeated for eleven years, walks out. The hundred banners go quiet." } });
  S.cupIds = () => Object.keys(CUPS);

  // ---------- helpers ----------
  const hasEnemy = id => !!(Core.ENEMIES && Core.ENEMIES[id]);
  // a cup foe: the real enemy when RULES-BOSS has made it, else a stand-in of the same role (never crashes)
  S.cupEnemy = (id, lv) => {
    if (hasEnemy(id)) return F.mkEnemy(id, lv);
    const soldier = /legion|optio|centurion|shield|spear|archer|twin|admiral|general|champion|gladiator/i.test(id);
    const pick = list => list.find(hasEnemy);
    let base = soldier ? (/archer/i.test(id) ? pick(["raidArcher", "raidSlinger", "legion"]) : /shield/i.test(id) ? pick(["raidShieldbearer", "legion"]) : pick(["raidSpearman", "legion"]))
      : /sea|water|tide|eel|crab|shark/i.test(id) ? pick(["scorpion", "jackal"]) : pick(/bull|boar/i.test(id) ? ["scorpion", "jackal"] : ["jackal", "scorpion"]);
    base = base || Object.keys(Core.ENEMIES)[0];
    const e = Core.makeEnemy(base, lv); e.name = S.pretty(id); e.id = id; e.stand = true; return e;
  };
  S.cupOpen = id => { const c = CUPS[id]; if (!c) return false; if (window.dbg && window.dbg.sysOpen) return true; return G.ch >= c.ch || (c.flag && F.f(c.flag)); };
  S.rankOf = pts => { const R = [[0, "Sandling"], [10, "Sparring Partner"], [30, "Bronze Sparrow"], [70, "Iron Hound"], [130, "Silver Banner"], [220, "Naval Stalwart"], [340, "Hundred Banners"], [500, "Grand Champion"]]; let r = R[0]; R.forEach(x => { if (pts >= x[0]) r = x; }); const nx = R.find(x => x[0] > pts); return { title: r[1], next: nx ? nx[0] - pts : 0, nextTitle: nx ? nx[1] : "" }; };
  S.cheer = () => A().cheer || 0;
  S.addCheer = n => { const a = A(); a.cheer = Math.max(0, Math.min(CHEER_MAX, (a.cheer || 0) + n)); return a.cheer; };
  // Crowd Cheer: +3% atk/pow/def/res/spd per point, next arena fight only (flow.js applyGear calls this; revertGear restores the saved stats)
  S.cheerOn = false;
  S.applyCheer = party => {
    if (!S.cheerOn) return; const c = S.cheer(); if (!c) return;
    party.forEach(u => { ["atk", "pow", "def", "res", "spd"].forEach(k => { if (u.stats[k]) u.stats[k] = Math.round(u.stats[k] * (1 + CHEER_STEP * c)); }); });
  };
  const snapshot = () => JSON.stringify({ party: G.party, items: G.items, collection: G.collection }, (k, v) => (k === "view" || k === "owner" || k === "_save" || (v && v.isObject3D) ? undefined : v));
  const restore = snap => { const st = JSON.parse(snap); st.party.forEach(u => { u.buffs = u.buffs || []; }); G.party = st.party; G.items = st.items; G.collection = st.collection; };
  const stakes = m => [0, Math.round(m * 0.25), Math.round(m * 0.5), Math.round(m)];

  // one bet before a fight; returns the stake (already taken from the purse of gold)
  async function askBet(m, label) {
    const st = stakes(m), a = A();
    const i = await F.ask(`Bookmaker: ${label}. A win pays double. (${G.gold} kakal)`, st.map((v, k) => ({ label: k === 0 ? "No bet" : `Bet ${v} kakal`, disabled: k > 0 && G.gold < v })), { top: "40%" });
    const stake = i > 0 ? st[i] : 0; if (stake) { G.gold -= stake; a.bets.placed = (a.bets.placed || 0) + 1; }
    return stake;
  }
  const settleBet = (stake, win) => {
    if (!stake) return; const a = A();
    if (win) { G.gold += stake * 2; a.bets.won += stake; a.bets.net += stake; UI.toast(`Bet won: +${stake * 2} kakal`, 2200); }
    else { a.bets.lost += stake; a.bets.net -= stake; UI.toast(`Bet lost: ${stake} kakal`, 2200); }
  };
  const wallAdd = (cupId, c) => { const a = A(); if (!a.wall.some(w => w.cup === cupId)) a.wall.push({ cup: cupId, n: c.champion.n, foes: c.champion.foes.slice(), lv: c.champion.lv, ch: G.ch }); };

  // ---------- one cup run ----------
  // -> "won" | "lost" | "left" | "closed". opts.auto: skip the dialogue prompts (tests)
  S.cup = async (id, opts = {}) => {
    const c = CUPS[id], a = A(); if (!c || !S.cupOpen(id)) return "closed";
    if (!a.licence) return "closed";
    const fee = (c.entryP || 4) * price(), rec = a.cups[id] = a.cups[id] || { clears: 0, pieces: 0, firstPaid: false, tries: 0 };
    if (!opts.auto) {
      const ok = await F.ask(`${c.n}: entry ${fee} kakal (once per run). ${c.fights.length + 1} fights, no healing between except items. Lose, and you may restart at once, free.`, [{ label: `Enter (${fee} kakal)`, disabled: G.gold < fee }, { label: "Not now" }], { top: "36%" });
      if (ok !== 0) return "left";
    } else if (G.gold < fee) G.gold = fee;
    G.gold -= fee; F.sfx("menuOk");
    const start = snapshot(), all = c.fights.concat([Object.assign({ champion: true }, c.champion)]);
    const purseEach = Math.round((c.purseM || 3) * (c.m || S.m(G.ch))), pay = rec.firstPaid ? 0.3 : 1;
    let outcome = "lost", noFall = true;
    a.cheer = a.cheer || 0;
    outer: for (;;) {
      rec.tries++; let wins = 0, purse = 0;
      for (let i = 0; i < all.length; i++) {
        const f = all[i], foes = f.foes.map(fid => S.cupEnemy(fid, f.lv));
        if (!opts.auto) {
          F.music(c.music);
          await UI.say([["narr", f.champion ? (f.intro || `${f.n} enters the sand.`) : `Fight ${i + 1} of ${all.length}: ${f.n}.`]]);
          if (f.champion && f.cinema) { try { await f.cinema(f); } catch (e) { console.warn("cup cinema", e); } }   // STORY: a Cinema.boss reveal before the champion (champion.cinema)
        }
        const stake = opts.auto ? 0 : await askBet(c.m || S.m(G.ch), f.n);
        S.cheerOn = a.cheer > 0;
        const startFallen = G.party.filter(u => !u.alive).length;
        const res = await F.fight(foes, { cup: true, noFlee: true, boss: !!f.champion, goldMult: 0, xpBonus: 0.7, music: c.music, bg: c.bg, flood: !!c.flood, intro: f.champion ? f.n + " enters." : undefined, keepMusic: true });
        S.cheerOn = false; a.cheer = 0;       // the cheer only lasts for the next fight
        if (res === "win") {
          settleBet(stake, true); wins++; purse += Math.round(purseEach * pay); a.wins++; a.streak++; a.bestStreak = Math.max(a.bestStreak, a.streak); a.points += f.champion ? 5 : 2;
          const fallen = G.party.filter(u => !u.alive).length; if (fallen > startFallen) noFall = false;
          S.addCheer(fallen > startFallen ? 1 : 2);
          if (!opts.auto && i < all.length - 1) UI.toast(`Crowd Cheer ${S.cheer()} (+${Math.round(S.cheer() * CHEER_STEP * 100)}% next fight)`, 2400);
        } else {
          settleBet(stake, false); a.losses++; a.streak = 0; a.cheer = 0;
          if (opts.auto || opts.noRetry) { restore(start); outcome = "lost"; break outer; }
          const k = await F.ask("The crowd groans. Your team is carried off the sand.", [{ label: "Restart the cup now (free)" }, { label: `Leave (entry ${fee} kakal back)` }], { top: "38%" });
          restore(start);
          if (k === 0) { UI.toast("Back to the first fight.", 1800); continue outer; }
          G.gold += fee; F.music(F.regionMusic()); return "left";
        }
      }
      // all fights won: purse, gear, rank
      outcome = "won"; break;
    }
    if (outcome !== "won") { F.music(F.regionMusic()); return outcome; }
    const total = all.length * Math.round(purseEach * pay);
    G.gold += total; rec.clears++; a.points += rec.firstPaid ? 3 : 10;
    const first = !rec.firstPaid; rec.firstPaid = true; wallAdd(id, c);
    if (!opts.auto) {
      await UI.say([["narr", `${c.n} is yours. The purse: ${total} kakal${first ? "" : " (the crowd has seen this before: 30%)"}.`]]);
    } else UI.toast(`+${total} kakal`, 1200);
    if (c.gear && rec.pieces < 3 && Data.SETS[c.gear]) { rec.pieces++; F.giveGear(c.gear, 1); }
    else if (c.gear && rec.pieces < 3) console.warn("Systems.cup: gear set not defined yet", c.gear);
    F.flagCup && F.flagCup(id); G.flags["cup." + id] = true;
    F.music(F.regionMusic());
    return "won";
  };

  // ---------- ball court ----------
  // timing game: a marker sweeps across the bar, press Space / Enter / click inside the green hoop. 3 rounds, 2 hits wins. opts.force: true|false (tests)
  S.ballCourt = (opts = {}) => new Promise(resolve => {
    const a = A(); a.ball.plays++;
    const finish = win => {
      if (win) { a.ball.wins++; a.wins += 0; a.points += 2; }
      const key = "ch" + G.ch; let msg = "";
      if (win && !a.ball.paid[key]) { a.ball.paid[key] = true; const pay = Math.round(5 * S.m(G.ch)); G.gold += pay; msg = `The bookmakers pay out: +${pay} kakal.`; }
      S.addCheer(win ? 3 : 1); a.ball.best = Math.max(a.ball.best, win ? 1 : 0);
      resolve({ win, msg });
    };
    if (opts.force !== undefined) return finish(!!opts.force);
    let round = 0, hits = 0, misses = 0, pos = 0, dir = 1, centre = 0.5, zone = 0.22, locked = false, raf = 0, last = 0, speed = 0.9, result = null, bodyEl = null;
    const draw = () => {
      if (!bodyEl) return; const m = bodyEl.querySelector("#bcMark"), z = bodyEl.querySelector("#bcZone"); if (!m || !z) return;
      m.style.left = (pos * 100) + "%"; z.style.left = ((centre - zone / 2) * 100) + "%"; z.style.width = (zone * 100) + "%";
    };
    const setRound = () => { zone = [0.24, 0.18, 0.13][Math.min(2, round)]; speed = [0.8, 1.05, 1.35][Math.min(2, round)]; centre = 0.2 + Math.random() * 0.6; pos = 0; dir = 1; };
    const status = () => { if (!bodyEl) return; bodyEl.querySelector("#bcInfo").innerHTML = `Round ${Math.min(3, round + 1)} of 3 · hoops ${hits} · misses ${misses}`; };
    let api0 = null;
    const throwBall = () => {
      if (locked || result !== null) return; locked = true;
      const hit = Math.abs(pos - centre) <= zone / 2; if (hit) hits++; else misses++; round++;
      F.sfx(hit ? "levelUp" : "menuMove"); UI.toast(hit ? "Through the hoop!" : "Missed.", 900); status();
      if (hits >= 2 || misses >= 2 || round >= 3) { result = hits >= 2; cancelAnimationFrame(raf); setTimeout(() => api0 && api0.close(result), 500); return; }
      setTimeout(() => { setRound(); locked = false; status(); }, 450);
    };
    setRound();
    const loop = t => { const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t; if (!locked && result === null) { pos += dir * speed * dt; if (pos >= 1) { pos = 1; dir = -1; } if (pos <= 0) { pos = 0; dir = 1; } } draw(); raf = requestAnimationFrame(loop); };
    UI.window("Ball Court", (body, api) => {
      api0 = api; bodyEl = body;
      body.innerHTML = `<div style="color:#b7a58a;margin-bottom:14px">The stone ball. Press Space, Enter or click when the ball is over the green hoop. Two hoops in three throws wins.</div>
        <div id="bcInfo" style="margin-bottom:10px;color:#f2c14e"></div>
        <div id="bcBar" style="position:relative;height:46px;background:#120d0a;border:2px solid #8a6a3a;overflow:hidden;cursor:pointer"><div id="bcZone" style="position:absolute;top:0;bottom:0;background:rgba(80,200,110,.55);border-left:2px solid #7dff9a;border-right:2px solid #7dff9a"></div><div id="bcMark" style="position:absolute;top:6px;width:30px;height:30px;margin-left:-15px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#e8dcc4,#8a7a62);box-shadow:0 2px 6px #000"></div></div>
        <div style="margin-top:14px"><button class="b" id="bcThrow">Throw (Space)</button></div>`;
      body.querySelector("#bcBar").addEventListener("pointerdown", throwBall); body.querySelector("#bcThrow").addEventListener("click", throwBall);
      status(); draw(); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
    }, { closeLabel: "Walk away (Esc)", keys: e => { if (e.key === " " || e.key === "Enter") throwBall(); } }).then(v => { cancelAnimationFrame(raf); finish(v === true); });
  }).then(async r => { if (r.msg && !(opts && opts.quiet)) UI.toast(r.msg, 3000); return r.win; });

  // ---------- rank board and Champions' Wall ----------
  S.rankBoard = async () => {
    const a = A(), r = S.rankOf(a.points);
    await UI.window("Rank Board", body => {
      const cups = Object.keys(CUPS).map(id => { const c = CUPS[id], rec = a.cups[id]; return `<div class="row"><div class="g">${esc(c.n)}<small>${S.cupOpen(id) ? (rec && rec.clears ? `Cleared ${rec.clears}x · gear pieces ${rec.pieces}/3` : "Not cleared yet") : `Opens in chapter ${c.ch >= 12 ? "post-game" : c.ch}`}</small></div>${rec && rec.clears ? `<b style="color:#7ee081">Cleared</b>` : ""}</div>`; }).join("");
      const wall = a.wall.map(w => `<div class="row"><div class="g">${esc(w.n)}<small>Level ${w.lv} · beaten in chapter ${w.ch}</small></div></div>`).join("") || `<div class="row"><div class="g">Nobody on the wall yet.</div></div>`;
      body.innerHTML = `<div style="display:flex;gap:18px;align-items:baseline;margin-bottom:12px"><div style="font-family:'Marcellus SC',serif;font-size:30px;color:#f2c14e">${esc(r.title)}</div><div style="color:#b7a58a">${a.points} rank points${r.next ? ` · ${r.next} to ${esc(r.nextTitle)}` : ""}</div></div>
        <div class="row"><div class="g">Record<small>Wins ${a.wins} · losses ${a.losses} · streak ${a.streak} (best ${a.bestStreak}) · Crowd Cheer ${a.cheer || 0}/6</small></div></div>
        <div class="row"><div class="g">Bookmaker<small>Won ${a.bets.won} · lost ${a.bets.lost} · net ${a.bets.net >= 0 ? "+" : ""}${a.bets.net} kakal</small></div></div>
        <div class="row"><div class="g">Ball court<small>Played ${a.ball.plays}x · won ${a.ball.wins}x</small></div></div>
        <h3 style="margin-top:12px">Cups</h3>${cups}<h3 style="margin-top:12px">Champions' Wall</h3>${wall}`;
    }, { closeLabel: "Back (Esc)" });
  };

  // ---------- the clerk (call from the Tzavan NPC) ----------
  S.arena = {
    async counter(F2) {
      const a = A();
      if (!a.licence) {
        const i = await F.ask(`"Glory for the licensed. A licence is ${LICENCE} kakal, once, and the Hall is yours."  (${G.gold} kakal)`, [{ label: `Buy the licence (${LICENCE} kakal)`, disabled: G.gold < LICENCE }, { label: "Not today" }], { top: "38%" });
        if (i !== 0) return; G.gold -= LICENCE; a.licence = true; G.flags["arena.licence"] = true; F.sfx("levelUp");
        await UI.say([["clerk", "Stamped and sealed. Mind the sand, it stays in your boots for a week."]]);
      }
      for (;;) {
        const ids = S.cupIds(), opts = ids.map(id => { const c = CUPS[id], rec = a.cups[id], open = S.cupOpen(id); return { label: `${c.n}${rec && rec.clears ? " (cleared)" : ""}${open ? "" : "  [chapter " + (c.ch >= 12 ? "post-game" : c.ch) + "]"}`, disabled: !open, info: c.note }; });
        const extra = ["Ball court", "Bookmaker", "Rank board and wall", "Leave"];
        const i = await UI.choose(`Hall of the Hundred Banners · Crowd Cheer ${a.cheer || 0}/6 · ${G.gold} kakal`, opts.concat(extra.map(l => ({ label: l }))), { top: "20%" });
        if (i < 0 || i === opts.length + 3) return;
        if (i < opts.length) { const r = await S.cup(ids[i]); if (r === "won") await UI.say([["clerk", "The Hall will talk about that for a week. Next, if you are not tired."]]); }
        else if (i === opts.length) { const w = await S.ballCourt(); await UI.say([["clerk", w ? "Through the hoops, twice. The crowd likes you." : "Not today. The hoops will still be there."]]); }
        else if (i === opts.length + 1) await UI.say([["clerk", `"Back your own fights. Up to ${Math.round(S.m(G.ch))} kakal a bout, a win pays double, a loss is gone. Cheer from the stands helps the next fight, not the cup."`]]);
        else await S.rankBoard();
      }
    },
  };
  S.dbg.cup = (id, o) => { window.dbg.sysOpen = true; if (!A().licence) A().licence = true; return S.cup(id || "bronze", o || {}); };
  S.dbg.counter = () => S.arena.counter(F);
})();
