// Game state and flow: the one global G, save/load, items, gear, quests, rumours, shops/inns, battles with results, region changes.
// Chapter scripts (ch0.js, ch1.js, ch2.js) are written against this file's `Flow` object (aliased F in the scripts).
"use strict";
let G = null;                                   // the saved game state (party-screen.js and the menus read this global)
const SAVE_KEY = "davichis-revenge-save-v2", CP_KEY = "davichis-revenge-cp-v2";
const SPEEDS = [{ name: "1x", f: 1 }, { name: "2x", f: 0.5 }, { name: "Instant", f: 0.1 }];

const Flow = (() => {
  class Interrupt { constructor(kind) { this.kind = kind; } }   // thrown to unwind a script (e.g. woke up at the inn after a defeat)
  const F = { Interrupt, locked: 0, cp: null, token: 0, hooks: {}, engine: null };

  // ---------- state ----------
  const newState = () => ({
    v: 2, ch: 0, pack: null, party: [], collection: [], slots: [], unchosen: [], gold: 60, items: {}, mats: {}, goods: {}, book: [], owned: {}, flags: {}, quests: {}, kills: {}, best: {},
    rumours: {}, region: "orun", entry: "start", speed: (G && G.speed) || 0, nights: 0, charm: null, lastTown: "orun", inns: {}, playMs: 0, t0: Date.now(), banterSeen: {},
    visited: {},   // towns seen (ferry pass list); G.sys = the systems state (src/systems.js), created on demand
  });
  F.newGame = () => { G = newState(); return G; };
  F.f = k => !!(G && G.flags[k]);
  F.set = (k, v = true) => { G.flags[k] = v; };
  F.sstate = () => ({ ch: G.ch, f: G.flags, q: new Proxy({}, { get: (_, id) => (typeof id === "string" && id in G.quests && G.quests[id] !== "done" ? G.quests[id] : undefined) }) });
  F.tier = () => (G.ch <= 0 ? 0 : G.ch <= 2 ? 1 : G.ch <= 4 ? 2 : G.ch <= 6 ? 3 : G.ch <= 8 ? 4 : G.ch <= 10 ? 5 : G.ch <= 11 ? 6 : 7);   // 7 = post-game (potion 110)
  F.price = (item, shop) => { const d = Data.priceOf(item, F.tier()); const m = shop && shop.disc && shop.disc[item]; return Math.max(1, Math.round(d * (m || 1))); };
  F.speedF = () => SPEEDS[(G && G.speed) || 0].f;
  F.wait = ms => new Promise(r => setTimeout(r, Math.max(10, ms * F.speedF())));

  // ---------- save / load ----------
  // the arena hangs each unit's 3D model on u.view; saving it made one save ~26 MB and localStorage refused it
  const snap = () => JSON.stringify(G, (k, v) => (k === "view" || (v && v.isObject3D) ? undefined : v));
  F.save = (quiet) => {
    if (!G) return false;
    try { G.playMs = (G.playMs || 0) + (Date.now() - (G.t0 || Date.now())); G.t0 = Date.now(); localStorage.setItem(SAVE_KEY, snap()); if (!quiet) UI.toast("Game saved."); return true; }
    catch (e) { console.error("save failed", e); if (!quiet) UI.toast("Saving failed: the browser refused the save."); return false; }
  };
  F.load = () => { try { const s = localStorage.getItem(SAVE_KEY); if (!s) return false; G = JSON.parse(s); G.t0 = Date.now(); if (!G.v) return false; if (window.Systems) Systems.migrate(G); return true; } catch (e) { return false; } };
  F.hasSave = () => { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } };
  F.saveInfo = () => { try { const g = JSON.parse(localStorage.getItem(SAVE_KEY)); return g && { ch: g.ch, region: g.region, party: g.party.map(u => u.name + " " + u.level).join(", ") }; } catch (e) { return null; } };
  F.checkpoint = () => { F.cp = snap(); try { localStorage.setItem(CP_KEY, F.cp); } catch (e) {} };
  F.restoreCheckpoint = () => { if (!F.cp) return false; const sp = G.speed; G = JSON.parse(F.cp); G.speed = sp; G.t0 = Date.now(); if (window.Systems) Systems.migrate(G); return true; };

  // ---------- audio (never throws) ----------
  F.music = key => { try { if (window.Audio && typeof Audio.music === "function") Audio.music(key); } catch (e) {} };
  F.sfx = key => { try { if (window.Audio && typeof Audio.sfx === "function") Audio.sfx(key); } catch (e) {} };
  F.applyVolume = () => { try { if (G && G.vol && G.vol.music === 0.7 && !G.vol.v2) { G.vol.music = 0.5; G.vol.v2 = 1; }   // the old default was too loud next to the sfx
    if (window.Audio && typeof Audio.setVolume === "function" && G) Audio.setVolume(G.vol ? G.vol.music : 0.5, G.vol ? G.vol.sfx : 0.8); } catch (e) {} };

  // ---------- creatures ----------
  F.mk = (id, lv) => {
    let u;
    try { u = Core.makeCreature(id, lv); } catch (e) { u = Core.makeCreature("horncinder", lv); u.id = id; u.name = Data.NAMES[id] || id; u.stand = true; }
    u.eq = { helm: null, armor: null, weapon: null }; u.sb = {}; u.slot = null;
    return u;
  };
  F.mkEnemy = (id, lv, tag) => {
    try { if (Core.ENEMIES && Core.ENEMIES[id]) return Core.makeEnemy(id, lv, tag); } catch (e) {}
    const k = Data.kindOf(id), base = Data.STAND_IN[k], nm = id.replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase());
    const e = Core.makeEnemy(base, lv, tag); e.name = nm + (tag || ""); e.id = id; e.stand = true; return e;
  };
  F.nameOf = id => { try { return (Core.CREATURES[id] && Core.CREATURES[id].name) || Data.NAMES[id] || id; } catch (e) { return Data.NAMES[id] || id; } };
  F.allCreatures = () => G.party.concat(G.collection);
  F.healAll = (full = true) => { F.allCreatures().forEach(u => { u.alive = true; u.hp = u.maxHp; u.buffs = []; u.mp = 0; }); };
  F.avgLevel = () => Math.round(G.party.reduce((s, u) => s + u.level, 0) / Math.max(1, G.party.length));

  // ---------- items, goods, materials ----------
  F.item = k => (G.items[k] || 0);
  F.give = (k, n = 1, quiet) => {
    if (Data.MATS[k]) { G.mats[k] = (G.mats[k] || 0) + n; if (!quiet) UI.toast(`+${n} ${Data.MATS[k][0]} (${G.mats[k]})`); return; }
    if (Data.GOODS[k]) { G.goods[k] = (G.goods[k] || 0) + n; if (!quiet) UI.toast(`+${n} ${Data.GOODS[k][0]}`); return; }
    G.items[k] = (G.items[k] || 0) + n; if (!quiet) UI.toast(`+${n} ${Data.ITEMS[k] ? Data.ITEMS[k].n : k}`);
  };
  F.take = (k, n = 1) => { G.items[k] = Math.max(0, (G.items[k] || 0) - n); };
  F.gold = (n, quiet) => { G.gold += n; if (!quiet) UI.toast((n >= 0 ? "+" : "") + n + " kakal"); };
  F.matCount = k => G.mats[k] || 0;

  // ---------- gear ----------
  F.owned = pid => G.owned[pid] || 0;
  F.worn = pid => F.allCreatures().filter(u => Object.values(u.eq || {}).includes(pid)).length;
  F.hasFree = pid => F.owned(pid) - F.worn(pid) > 0;
  F.giveGear = (setId, n = 3, quiet) => {            // pieces in fixed order, missing first
    const out = [];
    for (let i = 0; i < n; i++) {
      const slots = Data.SLOTS; const missing = slots.find(s => !F.owned(Data.pieceId(setId, s))) || slots[i % 3];
      const pid = Data.pieceId(setId, missing); G.owned[pid] = (G.owned[pid] || 0) + 1; out.push(Data.pieceName(pid));
    }
    if (!quiet) UI.toast(`Gear: ${out.join(", ")}`, 3200);
    return out;
  };
  F.setCounts = u => { const c = {}; Object.values(u.eq || {}).forEach(pid => { if (pid) { const s = pid.split(".")[0]; c[s] = (c[s] || 0) + 1; } }); return c; };
  // the active set bonus of a creature: { set, idx, level: 2 (full) | 1 (two pieces), b }
  F.activeBonus = u => {
    const c = F.setCounts(u); const sets = Object.keys(c).filter(s => c[s] >= 2).sort((a, b) => c[b] - c[a]); if (!sets.length) return null;
    const s = sets[0], idx = (u.sb && u.sb[s] != null) ? u.sb[s] : 0; return { set: s, idx, level: c[s] >= 3 ? 2 : 1, b: Data.SETS[s].b[idx] };
  };
  F.xpBonus = u => { const a = F.activeBonus(u); return a && a.b.st && a.b.st.xp ? a.b.st.xp[2 - a.level] / 100 : 0; };   // Fast Learner: this creature earns +15% (+7% with two pieces) experience
  F.xpMult = () => 1 + G.party.reduce((s, u) => s + F.xpBonus(u), 0) / Math.max(1, G.party.length);   // the party average (kept for old callers); victory gives every creature its own bonus
  // apply gear for a fight: stat bonuses change stats temporarily (reverted after); fx tags go on u.fx for the battle rules
  F.applyGear = party => {
    if (window.Evo) Evo.applyAll(party);   // evolution: the active form's stat boost, traits and upgraded personal move (reverted after the gear in revertGear)
    party.forEach(u => {
      u._save = { stats: { ...u.stats }, maxHp: u.maxHp, hp: u.hp }; u.fx = {};
      const a = F.activeBonus(u); if (!a) return;
      if (a.b.fx) u.fx[a.b.fx] = a.level;
      const st = a.b.st; if (!st) return;
      const v = k => (st[k] ? st[k][2 - a.level] : 0);
      ["def", "res", "spd"].forEach(k => { if (v(k)) u.stats[k] = Math.round(u.stats[k] * (1 + v(k) / 100)); });
      if (v("startMp")) u.stats.foc += 10 * v("startMp");          // +10 Focus = +1 starting MP
      if (v("minMp")) u.stats.foc = Math.max(u.stats.foc, 10 * v("minMp"));   // Quiet Mind: a floor, not an extra (a creature that already starts with that much MP gains nothing)
      if (v("hp")) { const nm = Math.round(u.maxHp * (1 + v("hp") / 100)); u.hp += nm - u.maxHp; u.maxHp = nm; }
    });
    if (G.items && G.items.springCharm > 0) party.forEach(u => { u.stats.foc += 10; });   // Spring Charm (Cinderwatch hot spring): +1 starting MP for everyone, reverted with the gear
    if (window.Systems && Systems.applyCheer) Systems.applyCheer(party);   // Crowd Cheer (arena): a small stat bonus, reverted with the gear
  };
  F.revertGear = party => party.forEach(u => {
    if (u._save) { u.stats = u._save.stats; const r = u.maxHp ? u.hp / u.maxHp : 1; const wasHp = u._save.maxHp; u.maxHp = wasHp; u.hp = Math.max(u.alive ? 1 : 0, Math.min(wasHp, Math.round(r * wasHp))); delete u._save; }
    u.fx = {}; u.buffs = [];
  });
  (function wrapRevertForEvo() { const rg = F.revertGear; F.revertGear = party => { rg(party); if (window.Evo) Evo.revertAll(party); }; })();

  // ---------- skill book ----------
  F.bookUnlocked = k => G.book.includes(k);
  F.unlockBook = k => { const b = Data.BOOK[k]; if (G.book.includes(k) || (G.mats[b.mat] || 0) < b.need) return false; G.mats[b.mat] -= b.need; G.book.push(k); return true; };
  (function patchMoves() {   // a creature's off-style slot adds its book move to the move list (if the rules know the move)
    if (typeof Core === "undefined" || !Core.movesOf || Core._movesPatched) return;
    const orig = Core.movesOf; Core._movesPatched = true;
    Core.movesOf = u => { const base = orig(u); const k = u.slot && Data.BOOK[u.slot]; const mv = k && k.move; if (mv && Core.MOVES && Core.MOVES[mv] && !base.includes(mv)) return base.concat(mv); return base; };
  })();

  // ---------- quests, rumours, bestiary ----------
  F.quest = (id, step) => {
    const q = Data.QUESTS[id]; if (!q) return; const cur = G.quests[id];
    if (cur === "done") return; if (cur !== undefined && step <= cur) return;
    G.quests[id] = step; UI.toast((cur === undefined ? "Quest started: " : "Quest updated: ") + q.t);
  };
  F.questDone = id => { if (G.quests[id] === "done") return; G.quests[id] = "done"; if (Data.QUESTS[id]) UI.toast("Quest complete: " + Data.QUESTS[id].t, 3000); };
  F.qstep = id => G.quests[id];
  F.rumour = town => {
    const list = Data.RUMOURS[town] || []; G.rumours[town] = G.rumours[town] || [];
    const i = list.findIndex((_, k) => !G.rumours[town].includes(k)); if (i < 0) return null;
    G.rumours[town].push(i); if (town === "amber" && i === 0) { G.flags["lore.bearer"] = true; G.best.duneBearer = Object.assign(G.best.duneBearer || {}, { breakKnown: true }); }
    return list[i];
  };
  F.seen = (id, beaten, level) => {
    const b = (G.best[id] = G.best[id] || { seen: 0, beaten: 0 }); b.seen++; if (beaten) { b.beaten++; G.kills[id] = (G.kills[id] || 0) + 1; }
    if (b.ch === undefined) { b.ch = G.ch; b.where = G.region; }   // journal: where and in which chapter it was first met
    if (level) { b.lv = b.lv || [level, level]; b.lv[0] = Math.min(b.lv[0], level); b.lv[1] = Math.max(b.lv[1], level); }
  };

  // ---------- dialogue shortcuts ----------
  F.say = (who, text) => UI.say([[who, text]]);
  F.talk = lines => UI.say(lines);
  F.ask = (prompt, opts, o) => UI.choose(prompt, opts.map(x => (typeof x === "string" ? { label: x } : x)), o);
  F.banter = async (moment, opt = {}) => {
    const pk = opt.pack || G.pack || "vanguard", all = (Data.BANTER[pk] && Data.BANTER[pk][moment]) || [];
    const here = w => !(Core.CREATURES && Core.CREATURES[w]) || !G.party.length || G.party.some(u => u.id === w);   // a creature in the wagon stays quiet
    const lines = (opt.n ? all.slice(0, opt.n) : all).filter(l => here(l[0])); if (!lines.length) return;
    await UI.say(lines.map(([who, text]) => [who, text]));
  };
  F.idleBanter = async () => { // one random creature line in a town
    const pk = G.pack; if (!pk) return; const all = ((Data.BANTER[pk] && Data.BANTER[pk].idle) || []).filter(l => !(Core.CREATURES && Core.CREATURES[l[0]]) || G.party.some(u => u.id === l[0])); if (!all.length) return;
    const [who, text] = all[Math.floor(Math.random() * all.length)]; await UI.say([[who, text]]);
  };
  F.letter = (from, text) => UI.say([["narr", "A folded letter. The wax bears " + from + "."], ...text.map(t => ["narr", t])]);

  // ---------- encounters ----------
  const pickW = list => { const t = list.reduce((s, x) => s + (x.w || x.weight || 1), 0); let r = Math.random() * t; for (const x of list) { r -= (x.w || x.weight || 1); if (r <= 0) return x; } return list[0]; };
  const lvOf = (lv, d) => { const r = lv || d || [3, 4]; if (typeof r === "number") return r; return r[0] + Math.floor(Math.random() * (r[1] - r[0] + 1)); };
  F.rollEncounter = tableId => {
    let ids = null, lvR = null, entry = null, tbl = null;
    try { tbl = Core.ENCOUNTERS && Core.ENCOUNTERS[tableId]; } catch (e) {}
    const mine = Data.ENC[tableId];
    if (tbl) {
      const arr = Array.isArray(tbl) ? tbl : (tbl.groups || tbl.list || tbl.table || tbl.entries || []);
      if (arr.length) {
        entry = (window.Systems && Systems.takePending && Systems.takePending(tableId)) || pickW(arr.map(x => (typeof x === "string" ? { foes: [x] } : Array.isArray(x) ? { foes: x } : x)));   // pending = the roll the Quiet Sigil already looked at
        ids = [].concat(entry.foes || entry.enemies || entry.group || entry.units || entry.id || []);
        lvR = entry.lv || entry.level || entry.levels || tbl.lv || tbl.level || tbl.levels;
        ids = ids.map(x => (typeof x === "string" ? x : x && x.id)).filter(Boolean);
      }
    }
    if (!ids || !ids.length) { if (!mine) return null; ids = mine.groups[Math.floor(Math.random() * mine.groups.length)]; lvR = mine.lv; }
    const lv = lvOf(lvR, mine && mine.lv), tags = ids.length > 1 ? [" A", " B", " C", " D"] : [""];
    const n = {}; ids.forEach(i => (n[i] = (n[i] || 0) + 1));
    return ids.map((id, i) => F.mkEnemy(id, Math.max(1, lv + (Math.random() < 0.3 ? 1 : 0) - (Math.random() < 0.2 ? 1 : 0)), n[id] > 1 || ids.length > 1 ? tags[i] : ""));
  };

  // ---------- battle ----------
  F.arenaOf = region => ({ dunes: "dunes", cistern: "cistern", quarry: "quarry", flats: "flats", undercroft: "undercroft", maze: "boneMaze", hollow: "hollow", basin: "basin" })[region]
    || (Data.REGIONS[region] && Data.REGIONS[region].arena) || "desert";   // chapters 3+: Data.REGIONS[id].arena names the battle arena (keys in BUILD_PLAN_2.md)
  F.lastOutcome = null;
  const ITEM_KEY = { potion: "sunwater", ashenEmber: "ember" };   // Core.ITEMS key -> G.items key
  // fights: opts { boss, bg, intro, noFlee, music, goldMult, xpBonus, cup, flood }. Returns "win" | "flee" (| "lose" with opts.cup). A defeat offers retry or wake-up (throws Interrupt("wake")).
  F.fight = async (foes, opts = {}) => {
    const bg = opts.bg || F.arenaOf(G.region);
    const startState = JSON.stringify({ party: G.party, items: G.items, collection: G.collection }, (k, v) => (k === "view" || (v && v.isObject3D) ? undefined : v));   // u.view holds the 3D model and (arena-boss.js) a link back to the unit: it must never be serialised
    for (;;) {
      F.music(opts.boss ? (opts.music || "boss") : (opts.music || (foes.some(e => /^raid|legion/i.test(e.id || "")) ? "battleSoldiers" : "battle"))); F.sfx("encounter");
      F.applyGear(G.party);
      let r = null;
      try {
        if (!window.Arena3D || !Arena3D.fight) throw new Error("no arena");
        // item bag: Core.ITEMS keys <-> G.items keys (potion = sunwater, ashenEmber = ember; every other Core item uses the same key in G.items)
        const it = {}; Object.keys(Core.ITEMS || {}).forEach(k => { it[k] = G.items[ITEM_KEY[k] || k] || 0; });
        G.party.forEach(u => { u.offMove = u.slot || null; });
        r = await Arena3D.fight({ party: G.party, foes, boss: !!(opts.boss || opts.noFlee), bg, items: it, speedF: F.speedF, auto: !!(window.dbg && window.dbg.auto), intro: opts.intro, flood: opts.flood });
        if (r.items) { Object.keys(it).forEach(k => { if (r.items[k] != null) G.items[ITEM_KEY[k] || k] = r.items[k]; }); r.potions = null; }
      } catch (e) { console.error("fight failed", e); r = { res: "win", potions: G.items.sunwater || 0 }; }
      F.lastResult = r;
      F.revertGear(G.party);
      if (r.potions != null) G.items.sunwater = r.potions;
      if (r.res === "win") { F.music("victory"); await F.victory(foes, opts); F.music(opts.keepMusic ? opts.music : F.regionMusic()); return "win"; }
      if (r.res === "flee") { F.music(F.regionMusic()); return "flee"; }
      // defeat
      F.music("gameover"); F.sfx("ko");
      if (opts.cup) return "lose";   // arena cups run their own retry (Systems.cup): no prompt, nothing restored here
      const i = await UI.choose("Your team falls...", [{ label: "Try again" + (opts.boss ? " (free, right before the fight)" : "") }, { label: "Wake up at the last town (full heal)", info: "You keep everything you had before the fight." }], { top: "38%" });
      const st = JSON.parse(startState); G.party = st.party; G.items = st.items; G.collection = st.collection;
      if (i === 0) { foes = foes.map(e => F.mkEnemy(e.id, e.level, (e.name || "").slice((Core.ENEMIES[e.id] ? Core.ENEMIES[e.id].name : (e.name || "")).length) )); continue; }
      F.healAll(); throw new Interrupt("wake");
    }
  };
  F.regionMusic = () => (Data.REGIONS[G.region] && Data.REGIONS[G.region].music) || "desert";
  F.boss = async (foes, opts = {}) => { F.checkpoint(); return F.fight(foes, { ...opts, boss: true }); };

  F.victory = async (foes, opts) => {
    let xp = Core.fightXp ? Core.fightXp(foes, F.avgLevel()) : foes.reduce((s, e) => s + Math.round((e.xp || 6) * e.level / 2), 0), gold = Core.fightGold ? Core.fightGold(foes) : foes.reduce((s, e) => s + Math.round((e.gold || 4) * e.level / 2), 0);   // Core.fightXp/fightGold (RULES-BOSS): the XP curve for levels 10-85
    if (opts.xpBonus) xp = Math.round(xp * opts.xpBonus); if (opts.xpMult != null) xp = Math.round(xp * opts.xpMult);
    if (opts.goldMult != null) gold = Math.round(gold * opts.goldMult); G.gold += gold;
    G.party.forEach(u => { if (!u.alive) { u.alive = true; u.hp = Math.max(1, u.hp); } u.buffs = []; });
    const avg = F.avgLevel();
    G.collection.forEach(u => { u.xp += Math.round(xp * (u.level < avg ? 0.6 : 0.3)); let n = 0; while (u.xp >= Core.xpToNext(u.level) && n++ < 30) { u.xp -= Core.xpToNext(u.level); u.level++; u.points = (u.points || 0) + 3; u.maxHp = Core.maxHpOf(u.stats, u.level); u.hp = u.maxHp; } });
    let ups = []; G.party.forEach(u => { ups = ups.concat(Core.giveXp([u], Math.round(xp * (1 + F.xpBonus(u))))); });   // Fast Learner: each creature earns its own bonus
    if (window.Evo) Evo.checkAll(G.party.concat(G.collection), t => UI.toast(t, 4000));   // evolution: a form whose level and stat requirements are met is unlocked for good
    if (window.Systems && Systems.afterXp) ups = Systems.afterXp(ups);   // a guest companion follows the party's level and takes no points
    const drops = [];
    foes.forEach(e => {
      F.seen(e.id || e.art, true, e.level);
      (Data.DROPS[e.id] || []).forEach(([k, p]) => { if (Math.random() < p * (opts.boss ? 1 : 1)) { drops.push(k); } });
    });
    drops.forEach(k => F.give(k, 1, true));
    const names = {}; drops.forEach(k => { const nm = (Data.MATS[k] || Data.GOODS[k] || [k])[0]; names[nm] = (names[nm] || 0) + 1; });
    await Menus.results({ xp, gold, ups, drops: names, boss: !!opts.boss, titan: foes.some(e => e.titan || (Core.ENEMIES && Core.ENEMIES[e.id] && Core.ENEMIES[e.id].titan) || (Core.BOSS_META && Core.BOSS_META[e.id] && Core.BOSS_META[e.id].kind === "optTitan")) });   // QA-A: the optional Titans (T3+) say it too
  };

  // ---------- inn and shop ----------
  F.innCost = key => (key === "orun" && !G.inns.orun ? 0 : Math.round(Data.priceOf("sunwater", F.tier()) * 3 * ((Data.INNS[key] && Data.INNS[key].mult) || 1)));   // Data.INNS[key].mult: 0.5 resistance camp, 1.5 imperial town (ECONOMY.md)
  F.inn = async key => {
    const inn = Data.INNS[key] || { n: "Inn" }, cost = F.innCost(key);
    const i = await UI.choose(`${inn.n}: a bed and a hot meal. Everyone wakes at full HP, the fallen too.`, [{ label: cost ? `Stay the night (${cost} kakal)` : "Stay the night (free)", disabled: G.gold < cost }, { label: "Not now" }], { back: true });
    if (i !== 0) return false;
    G.gold -= cost; G.inns[key] = (G.inns[key] || 0) + 1; G.nights++; F.music(null); await UI.fade(true, 600); F.healAll(); G.lastTown = G.region === "hollow" ? "saltgate" : G.region; F.save(true); await UI.sleep(500);
    F.music("town"); await UI.fade(false, 600); UI.toast("Everyone is fully healed. Game saved.");
    return true;
  };
  F.shop = key => Menus.shop(key);

  // ---------- regions ----------
  F.goLater = (region, entry) => { setTimeout(() => F.enter(region, entry), 0); };
  F.go = (region, entry) => { F.goLater(region, entry); throw new Interrupt("go"); };   // always the last call of a script: unwinds it, then the new region starts
  F.enter = async (region, entry) => {
    const my = ++F.token; const prevRegion = G.region; G.region = region; G.entry = entry || "start";
    const R = Data.REGIONS[region] || {};
    if (R.town) { G.lastTown = region; (G.visited = G.visited || {})[region] = true; }   // the ferry pass lists visited towns
    (G.been = G.been || {})[region] = true;   // every area entered, in order: the bestiary's Areas list
    await UI.fade(true, 350);
    F.visit = {}; if (region === "dunes" || (Story.duskSet && Story.duskSet[region])) { if (!(Story.duskSet && Story.duskSet[region] && Story.duskSet[prevRegion])) G.flags["dunes.dusk"] = !G.flags["l1.done"] && Math.random() < 0.4; }   // the dusk hound roams the dunes and the CH1-EXPAND maps (Story.duskSet): the roll is only repeated when you come in from outside that area
    F.music(R.music || "desert");
    if (F.engine && F.engine.enter) await F.engine.enter(region, entry);
    await UI.fade(false, 450);
    UI.ensure();
    if (F.token !== my) return;
    if (R.town && region !== "orun" && F.hasSaveSlotSafe()) F.save(true);   // arriving in a town autosaves
    F.locked++;
    try { for (const a of R.autos || []) { if (F.token !== my) break; await F.runTrigger(a, region); } }
    catch (e) { if (e instanceof Interrupt) { if (e.kind === "wake") await F.wake(); } else console.error(e); }
    finally { F.locked--; }
    if (F.token === my && F.engine && F.engine.ready) F.engine.ready(region, entry);
  };
  F.hasSaveSlotSafe = () => G && G.party.length > 0;
  F.wake = async () => { const t = G.lastTown || "orun"; F.healAll(); F.token++; UI.toast("You wake up in " + (Data.REGIONS[t] ? Data.REGIONS[t].n : "town") + "."); return F.enter(t, "inn"); };   // switch region right now: the hero must not stand in the boss trigger while the old map is still up

  // ---------- script dispatch (chapter files fill Story.*) ----------
  window.Story = window.Story || { talk: {}, trigger: {}, chest: {}, gather: {}, arrive: {} };
  Story.finish = Story.finish || {}; Story.start = Story.start || {};   // dbg.jump(n): chapter files register finish[k](F, G) and start[k] = { region, entry }
  F.runTrigger = async (id, region) => { const fn = Story.trigger[id]; if (fn) return fn(F, region || G.region); console.warn("no trigger", id); };
  F.guard = async fn => { F.locked++; try { return await fn(); } catch (e) { if (e instanceof Interrupt) { if (e.kind === "wake") await F.wake(); } else console.error(e); } finally { F.locked--; } };
  F.hookTalk = (npc, region) => F.guard(async () => {
    region = region || G.region; const fn = (Story.talk[region] && Story.talk[region][npc]) || (Story.talk["*"] && Story.talk["*"][npc]);
    if (fn) await fn(F, region); else { console.warn("no talk", region, npc); await UI.say([[npc, "..."]]); }
  });
  F.hookTrigger = (id, region) => F.guard(async () => {
    const done = Story.done && Story.done[id], key = "trig." + id;      // the world engine fires a trigger once: give it back until the story step is really finished
    if (done) delete G.flags[key];
    await F.runTrigger(id, region);
    if (done && done(F)) G.flags[key] = true;
  });
  F.hookChest = id => F.guard(async () => { const fn = Story.chest[id]; if (fn) return fn(F); console.warn("no chest", id); });
  F.hookGather = id => F.guard(async () => { const fn = Story.gather[id]; if (fn) return fn(F); console.warn("no gather", id); });
  F.hookEncounter = (tableId, region) => F.guard(async () => {
    if (F.locked > 1) return;
    const foes = F.rollEncounter(tableId); if (!foes) return;
    G.flags["enc.n"] = (G.flags["enc.n"] || 0) + 1;
    const sc = window.World && World.scene, xm = sc && sc.encPending != null ? sc.encPending : 1; if (sc) sc.encPending = null;   // random fights come more often (max ~20 s apart): XP per fight is scaled so XP per minute stays the same
    const res = await F.fight(foes, { bg: F.arenaOf(region || G.region), xpMult: xm < 1 ? xm : undefined });
    F.afterFight && F.afterFight(res);
  });
  F.hookExit = (to, entry) => F.guard(async () => { F.go(to, entry); });
  F.hookMenu = (tab) => (F.locked ? Promise.resolve() : Menus.main(tab));
  F.encounterMult = () => (window.Systems ? Systems.encounterMult() : (G.flags.wardstone ? 0.5 : 1));   // charms: src/systems.js

  // Visible-condition helper for hub and engines
  F.vis = cond => !cond || cond(F.sstate());
  return F;
})();
window.Flow = Flow;
