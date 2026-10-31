// Cross-chapter systems: ship and sea map, ferry pass, arena cups, guest companion, sacrifice and return, respec, charms, legends (owner: SYSTEMS).
// API for the chapter builders: logs/SYSTEMS.md ("SYSTEMS API"). This file = state, charms, legends, ferry, guest/sacrifice, respec. The arena is src/systems-arena.js, the journal/travel/charm screens src/systems-ui.js.
"use strict";
const Systems = (() => {
  const S = {}, F = Flow;
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const toWorldId = id => (typeof toWorld === "function" ? toWorld(id) : id);
  const pretty = id => String(id).replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase());
  S.esc = esc; S.pretty = pretty;

  // ---------- state (G.sys, created on demand so old saves load) ----------
  const ensure = g => {
    g.visited = g.visited || {}; const s = g.sys = g.sys || {};
    s.v = 1;
    if (!s.arena) s.arena = { licence: false, points: 0, cups: {}, wins: 0, losses: 0, streak: 0, bestStreak: 0, cheer: 0, bets: { won: 0, lost: 0, net: 0 }, ball: { plays: 0, wins: 0, paid: {}, best: 0 }, wall: [] };
    s.legends = s.legends || {}; s.respec = s.respec || { paid: {} };
    return s;
  };
  S.state = () => (G ? ensure(G) : null);
  // old saves: seed the visited towns, give the charm key items, fix missing fields
  S.migrate = g => {
    if (!g) return g;
    ensure(g); g.flags = g.flags || {}; g.items = g.items || {}; g.best = g.best || {};
    g.visited.orun = true; if (g.lastTown) g.visited[g.lastTown] = true;
    [["sp.seen", "sandpiper"], ["am.seen", "amberWells"], ["sg.seen", "saltgate"]].forEach(([fl, id]) => { if (g.flags[fl]) g.visited[id] = true; });
    Object.keys(g.inns || {}).forEach(k => { Object.keys(Data.REGIONS).forEach(id => { if (Data.REGIONS[id].town === k) g.visited[id] = true; }); });
    if (g.flags.wardstone && !(g.items.wardstone > 0)) g.items.wardstone = 1;
    if (g.flags.l1done) delete g.flags.l1done;
    (g.party || []).concat(g.collection || []).forEach(u => { if (u.lv0 === undefined) u.lv0 = Math.min(u.level || 3, 3); });
    return g;
  };

  // ---------- small helpers ----------
  const M_TABLE = [15, 30, 40, 55, 70, 90, 115, 135, 170, 190, 235, 255, 330];   // ECONOMY.md "m": what one random fight pays, per chapter (0 prologue .. 12 post-game)
  S.m = ch => M_TABLE[Math.max(0, Math.min(M_TABLE.length - 1, ch === undefined ? G.ch : ch))];
  S.playMs = () => (G.playMs || 0) + (Date.now() - (G.t0 || Date.now()));
  S.day = () => (G.nights || 0) + Math.floor(S.playMs() / 600000);      // days of play: inn nights plus one per 10 minutes of play (legend respawns)
  S.rid = () => (window.World && World.scene && World.scene.rid) || toWorldId(G.region);

  // ---------- items registered here (key items for the charms, Respec Stone) ----------
  const regItem = (k, o) => { if (!Data.ITEMS[k]) Data.ITEMS[k] = o; };
  regItem("lureBanner", { n: "Lure Banner", d: "A charm: doubles the fight rate for good.", key: true });
  regItem("quietSigil", { n: "Quiet Sigil", d: "A charm: fights far below your team's level never start.", key: true });
  regItem("respecStone", { n: "Respec Stone", d: "Takes back every stat point one creature spent, free. Gone after one use.", use: "respec" });
  regItem("soulDew", { n: "Soul Dew", d: "Brings one fallen creature back at full HP, once per fight.", f: 0 });
  Data.ITEMS.wardstone.d = "A charm: halves the fight rate for good.";

  // ---------- charms ----------
  const CHARMS = {
    wardstone: { n: "Wardstone", mult: 0.5, d: "Halves the fight rate." },
    lureBanner: { n: "Lure Banner", mult: 2, d: "Doubles the fight rate." },
    quietSigil: { n: "Quiet Sigil", mult: 1, skip: 8, d: "Fights eight or more levels below your team never start." },
  };
  S.CHARMS = CHARMS;
  S.ownedCharms = () => Object.keys(CHARMS).filter(k => G.flags[k] || (G.items[k] || 0) > 0);
  S.activeCharm = () => {
    const own = S.ownedCharms(), sel = G.charmSel;
    if (sel === null) return null;                                   // chosen: none
    if (sel && own.includes(sel)) return sel;
    return own.includes("wardstone") ? "wardstone" : own.length === 1 ? own[0] : null;   // never chosen: the Wardstone keeps working as in the first milestone
  };
  S.setCharm = k => { G.charmSel = k && CHARMS[k] && S.ownedCharms().includes(k) ? k : null; };
  S.giveCharm = (k, quiet) => { if (!CHARMS[k]) return false; G.flags[k] = true; if (!(G.items[k] > 0)) G.items[k] = 1; if (!quiet) UI.toast(CHARMS[k].n + " received.", 3000); return true; };
  S.timedCharm = () => (G.charm && G.charm.until > Date.now() ? G.charm : null);
  // walking time to the next fight is divided by this (the engine calls it through Flow.encounterMult); rates never stack, a lit Incense or Candle beats the permanent charm
  S.encounterMult = () => { const t = S.timedCharm(); if (t) return t.kind === "incense" ? 0.5 : 2; const a = S.activeCharm(); return a ? CHARMS[a].mult : 1; };
  S.pending = null;
  // Quiet Sigil: the engine asks before a random fight starts; the roll is kept so the fight that follows is the one that was looked at
  S.skipFight = table => {
    S.pending = null;
    if (S.activeCharm() !== "quietSigil" || !Core.rollEncounterSpec) return false;
    let spec = null; try { spec = Core.rollEncounterSpec(table); } catch (e) { spec = null; }
    if (!spec) return false;
    if (spec.level <= F.avgLevel() - CHARMS.quietSigil.skip) return true;
    S.pending = { table, foes: spec.foes, level: [spec.level, spec.level], weight: 1 }; return false;
  };
  S.takePending = table => { const p = S.pending; S.pending = null; return p && p.table === table ? p : null; };

  // ---------- ship and ferry pass ----------
  S.giveShip = (F2, o) => { G.flags.ship = true; UI.toast("The Salt Heron is yours.", 3200); if (!o || o.pass !== false) S.giveFerryPass(F2, true); };
  S.giveFerryPass = (F2, quiet) => { G.flags.ferryPass = true; if (!quiet) UI.toast("Ferry pass received.", 3000); };
  S.isBoatRegion = id => { const R = window.World && World.REGIONS && World.REGIONS[toWorldId(id)]; return !!(R && R.boat); };
  S.regionKind = id => {
    const R = Data.REGIONS[id] || {}, W = (window.World && World.REGIONS && World.REGIONS[toWorldId(id)]) || {};
    if (W.boat) return "sea"; if (R.town) return "town";
    if (R.dungeon || R.noFerry || W.dungeon || W.noFerry) return "dungeon";
    return R.overland || W.overland ? "overland" : "dungeon";
  };
  S.visited = id => !!(G.visited && G.visited[id]);
  S.travelList = () => Object.keys(G.visited || {}).filter(id => { const R = Data.REGIONS[id]; return R && R.town && !R.noFerry && !(id === "orun" && G.ch >= 5) && (!R.ferryNeed || World.cond(R.ferryNeed, G.flags)); }).map(id => ({ id, name: Data.REGIONS[id].n || pretty(id), here: id === G.region }));
  S.canTravel = () => {
    if (!G.flags.ferryPass) return { ok: false, why: "You have no ferry pass." };
    if (F.locked) return { ok: false, why: "Not now." };
    const k = S.regionKind(G.region);
    if (k === "dungeon") return { ok: false, why: "No ferry runs from in here." };
    return { ok: true, kind: k };
  };
  S.travelTo = async id => {
    const c = S.canTravel(); if (!c.ok || !S.visited(id) || !Data.REGIONS[id]) return false;
    F.sfx("menuOk"); if (F.engine) F.engine.prev = null;          // arrive at the town's inn entry (or its start), not at the door we used last
    F.goLater(id, "inn"); return true;
  };

  // ---------- legends (WORLD_MAP section 4) ----------
  const L = (id, o) => (Data.LEGENDS[id] = Object.assign({ id, chance: 0.04, respawn: 0 }, o));
  Data.LEGENDS = Data.LEGENDS || {};
  L("L1", { n: "The Dune Whisperer", enemy: "duneWhisperer", art: "sandstitchJackal", level: 6, ch: 1, where: "Whisperglass Dunes, at dusk", respawn: 30, reward: { charm: "wardstone" }, note: "A hound of wind and sand with a mouth full of voices." });
  L("L2", { n: "Shearwing, the Razor Sunbird", enemy: "shearwing", level: 17, ch: 3, where: "Greenmaw Jungle", reward: { gear: "G7" }, note: "It cut a legion banner in half in one pass.",
    intro: [["narr", "A shape crosses the canopy light: a bird of beaten gold, every feather an edge. It circles once, as if it had been waiting for you."]] });
  L("L3", { n: "Mother Glowmoth", enemy: "motherGlowmoth", level: 23, ch: 4, where: "Featherfall Canopy, on moonless nights", respawn: 30, color: "blue", reward: { items: [[["cinderWard", "fireWard", "wardFire"], 5], [["rimeWard", "frostWard", "wardRime"], 5]] }, note: "She lights the way for the lost, and eats the lights of those who lie.",
    intro: [["narr", "A lamp swings out of the dark, then a second, then ten. They are wings. Mother Glowmoth drifts towards you, kind and hungry."]] });
  L("L4", { n: "Old Hollowbell", enemy: "oldHollowbell", level: 30, ch: 6, where: "Kharam Oasis desert and the Ashen Orun ruins", reward: { items: [["respecStone", 1]] }, note: "It rings when the wells run low.",
    intro: [["narr", "Somewhere a bell is ringing, low and slow. A tortoise the size of a wagon hauls itself out of the heat haze, a bronze bell grown into its shell."]] });
  L("L5", { n: "The Black Pearl Hermit", enemy: "blackPearlHermit", level: 37, ch: 6, where: "the sea rocks off Gullrest", reward: { gear: "G36" }, note: "He gives his pearl to anyone who beats him fairly.",
    intro: [["narr", "A rock that only shows at low tide. On it, a crab-man sits very still around a pearl as black as a well."]] });
  L("L6", { n: "The Ghost of the Ninth Legion", enemy: "ghostOfTheNinthLegion", level: 51, ch: 8, where: "the Royal Road salt marsh and the Tzavan road", reward: { charm: "lureBanner" }, note: "A legion that vanished walks the road to find its general.",
    intro: [["narr", "A banner walks the road with no one holding it. Under it the dust is shaped like men marching."]] });
  L("L7", { n: "The Veil Stag", enemy: "veilStag", level: 65, ch: 10, where: "Saltmere marsh, at dawn", respawn: 30, color: "blue", reward: { items: [["soulDew", 1]] }, note: "He walks ahead of every battle, and the side he faces wins.",
    intro: [["narr", "A white stag stands in the marsh mist, antlers ringed with candle flames that never gutter. It looks at you, then at the horizon, and waits."]] });
  L("L8", { n: "The Last Warden", enemy: "lastWarden", level: 78, ch: 12, where: "the Drowned Capital", reward: { charm: "quietSigil" }, note: "It still guards a city that has no one left to guard.",
    intro: [["narr", "A builder guardian still stands its watch over the drowned street. Light-lines run under its stone skin. It lifts one arm: no one passes."]] });
  L("L9", { n: "Mawmother of the Deep", enemy: "mawmotherOfTheDeep", level: 82, ch: 12, where: "the sea of the Starfall Isles", reward: { gear: "G37" }, note: "She swallowed a star. It still burns inside her.",
    intro: [["narr", "The sea rises in a long back of grey skin. A mouth opens, and deep inside it something burns like a captured star."]] });
  Story.legend = Story.legend || {};
  S.legendArt = d => { const l = Data.LEGENDS[d.id] || {}; return d.art || l.art || d.enemy || l.enemy || null; };
  S.legendRec = id => S.state().legends[id] || (S.state().legends[id] = {});
  S.legendDone = id => { const rec = S.legendRec(id); return !!rec.done; };
  S.heardLegend = id => { S.legendRec(id).heard = true; };
  // respawn bookkeeping (L1, L3, L7 come back after 30 days of play); called on every region entry
  S.tickLegends = () => {
    if (G.flags.l1done === undefined && G.flags["l1.done"]) { const r = S.legendRec("L1"); if (!r.done) { r.done = true; r.day = S.day(); r.seen = true; } }
    Object.keys(Data.LEGENDS).forEach(id => { const l = Data.LEGENDS[id], r = S.state().legends[id]; if (!r || !r.done || !l.respawn) return; if (S.day() - (r.day || 0) >= l.respawn) { r.done = false; delete G.flags["legend." + id]; if (id === "L1") delete G.flags["l1.done"]; } });
  };
  // engine: should this legend stand on the map now? -> { id, x, y, art, color, size } | null
  S.legendSpawn = (d, rid, flags) => {
    if (!G || !Data.LEGENDS[d.id] && !d.enemy) return null;
    const l = Data.LEGENDS[d.id] || {}, force = S.forceLegend === d.id;
    if (S.legendDone(d.id) && !force) return null;
    if (d.when && !World.cond(d.when, flags)) return null;
    if (F.locked > 0 && !force) return null;               // never while a story scene or fight is running
    if (!force && Math.random() >= (d.chance !== undefined ? d.chance : l.chance)) return null;
    if (force) S.forceLegend = null;
    const spots = d.spots && d.spots.length ? d.spots : [[d.x, d.y]], sp = spots[Math.floor(Math.random() * spots.length)];
    return { id: d.id, x: sp[0], y: sp[1], art: S.legendArt(d), color: d.color || l.color, size: d.size || l.size, enemy: d.enemy || l.enemy, level: d.level || l.level };
  };
  const pickKey = list => (Array.isArray(list) ? list.find(k => (Core.ITEMS && Core.ITEMS[k]) || Data.ITEMS[k]) || list[0] : list);
  S.giveReward = async (rw, ch) => {
    rw = rw || {};
    if (rw.charm) S.giveCharm(rw.charm);
    (rw.items || []).forEach(([k, n]) => { const key = pickKey(k); if (!Data.ITEMS[key] && !(Data.MATS && Data.MATS[key])) Data.ITEMS[key] = { n: pretty(key), d: "A rare find." }; F.give(key, n); });
    if (rw.gear) { try { if (Data.SETS[rw.gear]) F.giveGear(rw.gear, 3); else console.warn("Systems: gear set not defined yet", rw.gear); } catch (e) { console.warn("Systems: gear reward failed", rw.gear, e); } }
    if (rw.gold) F.gold(rw.gold);
  };
  // touching the shimmer (engine hook `legend`): the chapter's own handler if it has one, else the generic fight and reward
  S.hookLegend = (id, rid, sp) => F.guard(async () => {
    const l = Data.LEGENDS[id] || { id, n: pretty(id) }, info = { id, region: rid, def: l, spawn: sp || {}, enemy: (sp && sp.enemy) || l.enemy, level: (sp && sp.level) || l.level };
    S.legendRec(id).seen = true;
    const fn = Story.legend && Story.legend[id];
    const done = fn ? await fn(F, info) : await S.legendGeneric(info);
    if (done) { const r = S.legendRec(id); r.done = true; r.day = S.day(); G.flags["legend." + id] = true; }
    return !!done;
  });
  S.legendGeneric = async info => {
    const l = info.def;
    F.music("legend"); await UI.say(l.intro || [["narr", "Something shimmers, and takes a shape."]]);
    const i = await F.ask(l.n || "A legend", [{ label: "Face it" }, { label: "Back away" }], { top: "38%" });
    if (i !== 0) { F.music(F.regionMusic()); return false; }
    F.checkpoint();
    const res = await F.fight([F.mkEnemy(info.enemy, info.level || 10)], { noFlee: true, music: "legend", goldMult: 0, xpBonus: l.xpBonus || 1.5, intro: l.fightIntro || ((l.n || "It") + " faces you."), bg: F.arenaOf(G.region) });
    if (res !== "win") { F.music(F.regionMusic()); return false; }
    G.gold += Math.round(10 * S.m(l.ch !== undefined ? l.ch : G.ch)); UI.toast("+" + Math.round(10 * S.m(l.ch !== undefined ? l.ch : G.ch)) + " kakal", 2400);
    await S.giveReward(l.reward, l.ch);
    return true;
  };

  // ---------- guest companion, sacrifice and return ----------
  S.guest = () => (G.party || []).find(u => u.guest) || null;
  S.syncGuest = () => {                                     // the guest levels with the party: same level as the others, auto-spread stats, no points
    const g = S.guest(); if (!g) return;
    const others = G.party.filter(u => u !== g); if (!others.length) return;
    const lv = Math.max(1, Math.round(others.reduce((a, u) => a + u.level, 0) / others.length)); if (g.level === lv) return;
    const r = g.maxHp ? g.hp / g.maxHp : 1; let n = null; try { n = Core.makeCreature(g.id, lv); } catch (e) { n = null; }
    g.level = lv; if (n) { g.stats = n.stats; g.maxHp = n.maxHp; g.hp = Math.max(g.alive ? 1 : 0, Math.round(r * g.maxHp)); }
    g.xp = 0; g.points = 0; g.spent = {};
  };
  S.afterXp = ups => { S.syncGuest(); return (ups || []).filter(x => !(x.u && x.u.guest)); };
  S.guestJoin = (who, o = {}) => {
    S.guestLeave(true);
    const others = G.party.filter(u => !u.guest), lv = o.level || (others.length ? Math.round(others.reduce((a, u) => a + u.level, 0) / others.length) : 3);
    const u = typeof who === "string" ? F.mk(who, lv) : who; u.guest = true; u.eq = { helm: null, armor: null, weapon: null }; u.sb = {}; u.slot = null; u.points = 0; u.spent = {}; if (o.name) u.name = o.name;
    const s = S.state(); if (G.party.length >= 3) s.displaced = G.party.splice(2, 1)[0];   // the last member waits until the guest leaves
    G.party.push(u); G.flags.guest = true; S.syncGuest(); return u;
  };
  S.guestLeave = quiet => {
    const g = S.guest(); if (!g) return null;
    G.party = G.party.filter(u => u !== g); const s = S.state(); if (s.displaced) { G.party.push(s.displaced); s.displaced = null; }
    delete G.flags.guest; if (!quiet && UI) UI.toast(g.name + " leaves the team.", 2400); return g;
  };
  S.captive = () => (G.sys && G.sys.captive) || null;
  S.sacrifice = id => {
    const s = S.state(); if (s.captive) return null;
    const real = G.party.filter(u => !u.guest); if (real.length <= 1) return null;
    const u = real.find(x => x.id === id) || real[real.length - 1], idx = G.party.indexOf(u);
    G.party.splice(idx, 1); u.eq = { helm: null, armor: null, weapon: null }; u.alive = true; u.hp = u.maxHp; u.buffs = []; u.st = {};
    s.captive = u; s.captiveIdx = idx; s.captiveLevel = u.level; s.captiveCh = G.ch; return u;
  };
  S.returnCaptive = () => {
    const s = S.state(), u = s.captive; if (!u) return null;
    S.guestLeave(true);
    const avg = F.avgLevel(), gain = Math.max(0, avg - u.level);
    if (gain > 0) { u.level = avg; u.points = (u.points || 0) + 3 * gain; u.xp = 0; u.maxHp = Core.maxHpOf(u.stats, u.level); }
    u.hp = u.maxHp; u.alive = true; u.buffs = []; u.mp = 0; u.st = {}; delete u.guest;
    s.captive = null; if (G.party.length < 3) G.party.splice(Math.min(s.captiveIdx || 0, G.party.length), 0, u); else G.collection.push(u);
    return u;
  };

  // ---------- respec (ECONOMY.md section 5) ----------
  const inferSpent = u => {                                   // creatures from before this system: what they hold above their build at the level they were made
    const c = Core.CREATURES[u.id], sp = {}; if (!c) return sp;
    const base = Core.spread(Core.STYLES[u.style].w, 80 + 3 * ((u.lv0 || Math.min(u.level, 3)) - 1), c.t);
    Core.STATS.forEach(k => { const d = (u.stats[k] || 0) - (base[k] || 0); if (d > 0) sp[k] = d; }); return sp;
  };
  S.spentOf = u => (u.spent ? Object.assign({}, u.spent) : inferSpent(u));
  S.respecPreview = u => { const sp = S.spentOf(u), stats = Object.assign({}, u.stats); let pts = 0; Object.keys(sp).forEach(k => { const take = Math.min(sp[k] || 0, stats[k] || 0); stats[k] -= take; pts += take; }); return { stats, points: pts }; };
  S.respec = u => {
    const p = S.respecPreview(u); if (!p.points) return false;
    const r = u.maxHp ? u.hp / u.maxHp : 1; u.stats = p.stats; u.points = (u.points || 0) + p.points; u.spent = {};
    u.maxHp = Core.maxHpOf(u.stats, u.level); u.hp = Math.max(u.alive ? 1 : 0, Math.round(r * u.maxHp)); return true;
  };
  S.respecCost = u => { const n = (S.state().respec.paid[u.id + ":" + G.ch] || 0); return Math.round(20 * u.level * Math.min(2, 1 + 0.5 * n)); };
  S.freeSession = {};                                         // creatures paid for during this Party screen visit: re-picking is free until it closes
  S.endSession = () => { S.freeSession = {}; };
  S.respecAvailable = u => !!u && !u.guest && (S.freeSession[u.id] || (G.items.respecStone || 0) > 0 || G.ch >= 6);
  // confirm window with a preview of the new stats; resolves true when a respec happened
  S.respecConfirm = u => new Promise(resolve => {
    const p = S.respecPreview(u), free = !!S.freeSession[u.id], stone = (G.items.respecStone || 0) > 0, cost = S.respecCost(u);
    UI.window("Respec " + u.name, (body) => {
      const rows = Core.STATS.map(k => `<div class="row" style="margin-bottom:3px"><span style="width:110px">${esc(Core.STAT_NAMES[k])}</span><b style="width:44px;text-align:right">${u.stats[k]}</b><span style="width:40px;text-align:center;color:#b7a58a">&rarr;</span><b style="width:44px;text-align:right;color:${p.stats[k] < u.stats[k] ? "#f2c14e" : "#f4e9d4"}">${p.stats[k]}</b></div>`).join("");
      body.innerHTML = `<div style="color:#b7a58a;margin-bottom:8px">${p.points ? `${p.points} stat points go back into the pool. Gear, set bonuses, moves and the off-style slot stay as they are.` : "Nothing to take back: no points were spent."}</div>${rows}
        <div class="row" style="margin-top:10px"><div class="g">${free ? "Free: you already paid during this visit." : stone ? "Respec Stone (free, used up)" : `Cost: ${cost} kakal${S.state().respec.paid[u.id + ":" + G.ch] ? " (again this chapter)" : ""}`}</div>
        <button class="b" data-go="1" ${p.points && (free || stone || G.gold >= cost) ? "" : "disabled"}>${free || stone ? "Respec" : "Pay and respec"}</button></div>`;
    }, { closeLabel: "Cancel (Esc)", click: (e, api) => {
      if (!e.target.closest("[data-go]")) return;
      if (!(S.freeSession[u.id] || stone) && G.gold < cost) return;
      if (S.freeSession[u.id]) { /* free */ } else if (stone) { G.items.respecStone--; S.freeSession[u.id] = 1; } else { G.gold -= cost; const k = u.id + ":" + G.ch, r = S.state().respec; r.paid[k] = (r.paid[k] || 0) + 1; S.freeSession[u.id] = 1; }
      S.respec(u); F.sfx("levelUp"); api.close(true);
    }, keys: (e, api) => { if (e.key === "Enter") { const b = document.querySelector("#ui [data-go]"); if (b && !b.disabled) b.click(); } } }).then(v => resolve(!!v));
  });
  // a Well-Keeper NPC: pick creatures, respec, spend the points in the Party screen, repeat
  S.respecDialog = async () => {
    for (;;) {
      const list = F.allCreatures().filter(u => !u.guest); if (!list.length) return;
      const i = await UI.choose(`Seven Wells. Who is it to be? (${G.gold} kakal${G.items.respecStone ? ", " + G.items.respecStone + " Respec Stone" : ""})`, list.map(u => ({ label: `${u.name}  Lv${u.level}  (${S.respecPreview(u).points} points to take back)${S.freeSession[u.id] ? "  [paid]" : ""}` })), { back: true });
      if (i < 0) { S.endSession(); return; }
      if (await S.respecConfirm(list[i]) && typeof partyScreen === "function") await partyScreen(F.allCreatures().indexOf(list[i]));
    }
  };
  S.useRespecStone = async () => {
    const list = F.allCreatures().filter(u => !u.guest && S.respecPreview(u).points > 0); if (!list.length) return "Nobody has spent a point yet.";
    const i = await UI.choose("Use the Respec Stone on who?", list.map(u => ({ label: `${u.name}  Lv${u.level}  (${S.respecPreview(u).points} points)` })), { back: true });
    if (i < 0) return ""; const ok = await S.respecConfirm(list[i]); S.endSession(); return ok ? `${list[i].name}'s points are back in the pool.` : "";
  };

  // ---------- hooks into the other files ----------
  // creatures remember their creation level and the points the player spent (respec); wrap the two functions that create/spend
  const mk0 = F.mk; F.mk = (id, lv) => { const u = mk0(id, lv); u.lv0 = lv; u.spent = {}; return u; };
  if (Core.spendPoint && !Core._spWrapped) { const sp0 = Core.spendPoint; Core._spWrapped = true; Core.spendPoint = (u, stat) => { if (!u.spent) u.spent = inferSpent(u); const ok = sp0(u, stat); if (ok) u.spent[stat] = (u.spent[stat] || 0) + 1; return ok; }; }
  const enter0 = F.enter; F.enter = async (region, entry) => { try { S.tickLegends(); } catch (e) { console.warn("Systems.tickLegends", e); } return enter0(region, entry); };

  // ---------- test hooks (dbg.sys) ----------
  S.dbg = {
    ship() { G.flags.ship = true; G.flags.ferryPass = true; return G.flags; },
    weather(kind, night) { if (window.World) World.forceSky = { weather: kind || "clear", night: night === undefined ? undefined : night }; return World.forceSky; },
    legend(id) { S.forceLegend = id; S.legendRec(id).done = false; delete G.flags["legend." + id]; return id; },
    guest(id, lv) { return S.guestJoin(id || "bramblehoof", { level: lv }); },
  };
  window.Systems = S;
  return S;
})();
