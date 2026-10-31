// Evolution: forms, unlock rules, stat boosts, traits, upgraded personal moves (owner: EVO). See BUILD_PLAN_2.md and ../game-mechanics/EVOLUTIONS.md.
// The form data (generated from game-mechanics/evo-src) is in src/evolution-data.js (EvoData). This file is the rules.
//
// API
//   Evo.formsOf(u)            -> [{ form, unlocked, active, ready, req: [{label,have,need,ok}], why }]   all 6 forms of a creature
//   Evo.check(u)              -> [form]    unlocks every form whose requirements are met now (forever); returns the newly unlocked ones
//   Evo.checkAll(units, toast)-> unlocks for many units; calls toast(text) for each new form
//   Evo.setForm(u, formId|null) -> {ok, msg}   switch form (null = the base creature); only unlocked forms
//   Evo.active(u)             -> form | null
//   Evo.applyAll(party) / Evo.revertAll(party)   around a fight (Flow.applyGear / revertGear call these): boosts stats, sets u.evo, upgrades the personal move
//   Evo.moveView(u, moveId)   -> { name, desc }  the name and text to show for a move (the upgraded personal move of the active form)
//   Evo.artOf(u)              -> { key, sprite, model, tint, scale, hasArt }  what to draw for the unit's active form
//   Evo.preload()             -> Promise, learns which form art exists (manifest + creature index)
//   Evo.D                     -> the generated data
// Unit fields (plain data, saved with the creature): u.evoU = [unlocked form ids], u.evoA = active form id or absent.
// During a fight only: u.evo (the resolved traits), u.evs (per-fight state), u._evoSave (the stats to restore), u.art / u.vtint / u.vscale (drawing).
"use strict";
(function (root) {
  const isNode = typeof module !== "undefined" && module.exports;
  const Core = root.Core || (isNode ? require("./core.js") : null);
  const D = root.EvoData || (isNode ? require("./evolution-data.js") : null);
  if (!Core || !D) return;
  const EVO = Core.EVO, API = Core.EVOAPI, MOVES = Core.MOVES, STATUS = Core.STATUS;
  const STATS = Core.STATS, clamp = API.clamp, chance = API.chance;
  const SN = Core.STAT_NAMES;
  const NOTE = {};   // creature id -> { formId: form }
  Object.values(D.creatures).forEach(c => { NOTE[c.id] = {}; c.forms.forEach(f => (NOTE[c.id][f.id] = f)); });
  const STAGE_NAME = { 2: "Second form", 3: "Third form", 4: "Post-game form", d: "Duo form" };

  // ---------- forms: data access, unlocking, switching ----------
  const data = u => D.creatures[u.id] || null;
  const formOf = (u, id) => (id && NOTE[u.id] && NOTE[u.id][id]) || null;
  const has = (u, id) => !!(u.evoU && u.evoU.includes(id));
  const active = u => { const f = u.evoA && formOf(u, u.evoA); return f && has(u, f.id) ? f : null; };
  function reqOf(u, f) {
    const c = data(u), out = [];
    out.push({ label: "Level " + f.lv, have: u.level, need: f.lv, ok: u.level >= f.lv });
    Object.keys(f.req).forEach(k => out.push({ label: SN[k], have: u.stats[k], need: f.req[k], ok: u.stats[k] >= f.req[k], stat: k }));
    if (f.stage === 3) { const fr = formOf(u, f.from); out.push({ label: (fr ? fr.n : f.from) + " unlocked", have: has(u, f.from) ? 1 : 0, need: 1, ok: has(u, f.from), flag: 1 }); }
    if (f.stage === 4) { const ok = c.forms.some(x => x.stage === 3 && has(u, x.id)); out.push({ label: "A third form unlocked", have: ok ? 1 : 0, need: 1, ok, flag: 1 }); }
    return out;
  }
  function formsOf(u) {
    const c = data(u); if (!c) return [];
    const act = active(u);
    return c.forms.map(f => { const req = reqOf(u, f), ok = req.every(r => r.ok), un = has(u, f.id); return { form: f, unlocked: un, active: !!act && act.id === f.id, ready: ok && !un, req, why: req.filter(r => !r.ok).map(r => r.flag ? r.label : r.label + " " + r.need + " (now " + r.have + ")").join(", ") }; });
  }
  function check(u) {
    const c = data(u); if (!c || u.side === "e" || u.evo) return [];
    const out = [];
    for (let pass = 0; pass < 3; pass++) {   // a third form needs its second form first: run the order stage by stage
      let any = false;
      formsOf(u).forEach(r => { if (r.ready) { u.evoU = u.evoU || []; u.evoU.push(r.form.id); out.push(r.form); any = true; } });
      if (!any) break;
    }
    return out;
  }
  function checkAll(units, toast) {
    const got = [];
    (units || []).forEach(u => { check(u).forEach(f => { got.push({ u, f }); if (toast) toast(u.name + " can take a new form: " + f.n + ". Forms tab in the Party screen."); }); });
    return got;
  }
  function setForm(u, id) {
    if (u.evo) return { ok: false, msg: "Not during a fight." };
    if (!id) { delete u.evoA; return { ok: true, msg: u.name + " returns to its base form." }; }
    const f = formOf(u, id); if (!f) return { ok: false, msg: "Unknown form." };
    if (!has(u, id)) return { ok: false, msg: "Not unlocked yet." };
    u.evoA = id; return { ok: true, msg: u.name + " takes the form of " + f.n + "." };
  }

  // ---------- art ----------
  let artKeys = null, artTried = false;
  function preload() {
    if (artTried || typeof fetch === "undefined") return Promise.resolve();
    artTried = true; artKeys = { model: {}, sprite: {} };
    const get = url => fetch(url, { cache: "no-cache" }).then(r => (r.ok ? r.json() : {})).catch(() => ({}));
    return Promise.all([get("assets/models/manifest.json"), get("assets/creatures/index.json")]).then(([m, c]) => {
      Object.keys(m || {}).forEach(k => { if (k.includes("__")) artKeys.model[k] = 1; });
      Object.keys(c || {}).forEach(k => { if (k.includes("__")) artKeys.sprite[k] = 1; });
    });
  }
  function artOf(u) {
    const f = active(u) || (u.evo && formOf(u, u.evo.form)); if (!f) return null;
    const key = f.art.key, hasArt = !!(artKeys && (artKeys.model[key] || artKeys.sprite[key]));
    const tint = TINT[f.id] !== undefined ? TINT[f.id] : tintOf(f);
    return { key, sprite: f.art.sprite, model: f.art.model, hasArt, tint: hasArt ? 0 : tint, scale: f.sc };
  }
  // without form art the base creature is drawn tinted by the form's palette and scaled by the form's size
  const TINT = {};
  const PAL = [["gold", 0xffe08a], ["bronze", 0xe0b070], ["brass", 0xe8c070], ["amber", 0xffc070], ["orange", 0xffb070], ["ember", 0xffa070], ["flame", 0xffa878], ["fire", 0xffa070], ["lava", 0xff9070], ["red", 0xff9a8a], ["crimson", 0xff8a8a], ["scarlet", 0xff9080], ["rose", 0xffb0c0], ["pink", 0xffc0d8], ["violet", 0xc8a8ff], ["purple", 0xc8a0f0], ["lilac", 0xd8b8ff],
    ["blue", 0xa8c8ff], ["teal", 0x90e0d8], ["turquoise", 0x90e8e0], ["cyan", 0xa0f0ff], ["sea", 0x98d8e8], ["ice", 0xc8e8ff], ["frost", 0xd0ecff], ["silver", 0xe0e8f0], ["white", 0xffffff], ["pearl", 0xf4f0f8], ["grey", 0xc8c8c8], ["gray", 0xc8c8c8], ["slate", 0xb0b8c8], ["stone", 0xd0c8b8], ["black", 0x9a9aa8], ["obsidian", 0xa098b0], ["ink", 0xa0a0c0],
    ["green", 0xa8e0a0], ["moss", 0xa8d890], ["jade", 0x98e0b0], ["emerald", 0x90e0a0], ["mint", 0xb0f0d0], ["lime", 0xd0f090], ["brown", 0xd0b090], ["tan", 0xe0d0a8], ["sand", 0xf0e0b0], ["cream", 0xfff0d0], ["yellow", 0xfff0a0], ["copper", 0xe8b090], ["rust", 0xe0a080]];
  function tintOf(f) { const w = (f.pal || "").toLowerCase(); for (const [k, c] of PAL) if (w.includes(k)) return c; return 0xffffff; }

  // ---------- fight setup ----------
  // the stat points a form adds at the creature's current level (a share of its total stat points, spread by the form's shape)
  function boostFor(u, f) {
    const total = Math.round((80 + 3 * (u.level - 1)) * D.stages[f.stage].boost), sum = Object.values(f.sh).reduce((a, b) => a + b, 0), bs = {};
    let used = 0; Object.keys(f.sh).forEach(k => { bs[k] = Math.floor(total * f.sh[k] / sum); used += bs[k]; });
    const ks = Object.keys(f.sh).sort((a, b) => f.sh[b] - f.sh[a]); for (let i = 0; used < total; i++, used++) bs[ks[i % ks.length]]++;
    return bs;
  }
  function dupTrait(f) { return f.trait.fx.map(x => Object.assign({ k: x.k }, x.r)); }
  function applyAll(party) {
    party.forEach(u => {
      u._evoSave = { stats: Object.assign({}, u.stats), maxHp: u.maxHp, hp: u.hp }; u.evo = null; u.evs = null;
    });
    party.forEach(u => {
      const f = active(u); if (!f) return;
      const bs = boostFor(u, f);
      Object.keys(bs).forEach(k => (u.stats[k] += bs[k]));
      const t = dupTrait(f), E = { form: f.id, stage: f.stage, t, critDmg: 0, pmId: Core.CREATURES[u.id].personal, riders: f.pm.riders.map(x => Object.assign({ k: x.k }, x.r)), pw: f.pm.pw, duo: [], duoK: 1 };
      t.forEach(x => { if (x.k === "critDmg") E.critDmg += x.pct / 100; if (x.k === "startMp") u.stats.foc += 10 * x.n; });
      if (f.stage === "d") { E.duo = D.creatures[u.id].duo.moves.slice(); E.duoK = D.duoK; }
      u.evo = E;
      const art = artOf(u); if (art) { if (art.hasArt) u.art = art.key; else if (art.tint) u.vtint = art.tint; u.vscale = art.scale; }
      // the upgraded personal move: the move of this creature is unique to it, so it is changed in place for the fight
      const mv = MOVES[E.pmId]; if (mv) {
        if (!mv._base) mv._base = { name: mv.name, desc: mv.desc, p: mv.p };
        mv.name = f.pm.name; mv.desc = f.pm.desc; if (mv.p !== undefined) mv.p = mv._base.p * f.pm.pw;
      }
    });
    // team-wide stat traits (every ally of the wearer, the wearer too)
    party.forEach(u => { if (u.evo) u.evo.t.forEach(x => { if (x.k === "teamStat") party.forEach(a => (a.stats[x.stat] = Math.round(a.stats[x.stat] * (1 + x.pct / 100)))); }); });
    party.forEach(u => {
      const was = u._evoSave; if (!was) return;
      if (u.stats.hp !== was.stats.hp) { const r = u.maxHp ? u.hp / u.maxHp : 1; u.maxHp = Core.maxHpOf(u.stats, u.level); u.hp = Math.max(u.alive === false ? 0 : 1, Math.round(r * u.maxHp)); }
    });
  }
  function revertAll(party) {
    party.forEach(u => {
      if (u.evo) { const mv = MOVES[u.evo.pmId]; if (mv && mv._base) { mv.name = mv._base.name; mv.desc = mv._base.desc; if (mv._base.p !== undefined) mv.p = mv._base.p; delete mv._base; } }
      const s = u._evoSave;
      if (s) { u.stats = s.stats; const r = u.maxHp ? u.hp / u.maxHp : 1; u.maxHp = s.maxHp; u.hp = Math.max(u.alive ? 1 : 0, Math.min(s.maxHp, Math.round(r * s.maxHp))); }
      delete u._evoSave; u.evo = null; u.evs = null; delete u.art; delete u.vtint; delete u.vscale;
    });
  }
  function moveView(u, id) {
    const m = MOVES[id]; if (!m) return { name: id, desc: "" };
    const f = active(u); const c = data(u);
    if (f && c && id === c.personal && !(u.evo)) return { name: f.pm.name, desc: f.pm.desc };
    if (f && f.stage === "d" && c.duo.moves.includes(id)) return { name: m.name, desc: m.desc + " (Duo form: " + Math.round(D.duoK * 100) + "% power.)" };
    return { name: m.name, desc: m.desc };
  }
  // the moves a duo form borrows from another style
  const baseMovesOf = Core.movesOf;
  Core.movesOf = u => {
    const list = baseMovesOf(u);
    const f = u.evo ? formOf(u, u.evo.form) : active(u);
    if (f && f.stage === "d") D.creatures[u.id].duo.moves.forEach(m => { if (!list.includes(m) && MOVES[m] && MOVES[m].lvl <= u.level) list.push(m); });
    return list;
  };

  // ---------- trait helpers ----------
  const TS = (u, k) => (u.evo ? u.evo.t.filter(x => x.k === k) : []);
  const sumT = (u, k, key = "pct") => TS(u, k).reduce((a, x) => a + (x[key] || 0), 0);
  const living = (ctx, u) => ctx.team(u).filter(a => a.alive);
  const lowest = (list, not) => list.filter(a => a.alive && a !== not).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
  const foeStatus = t => Object.keys(t.st).length > 0 || t.buffs.some(b => b.val < 0 && b.type !== "sres");
  function scopeOk(scope, tg, kind, el) {
    const m = tg && tg.move ? MOVES[tg.move] : null;
    switch (scope) {
      case "all": return true;
      case "phys": return kind === "phys"; case "spell": return kind === "spell";
      case "basic": return !!(m && m.basic); case "mp1": return !!(m && m.mp === 1 && !m.basic); case "mp2": return !!(m && m.mp === 2); case "mp3": return !!(m && m.mp === 3);
      case "strong": return !!(m && m.mp >= 2); case "personal": return !!(m && m.personal); case "release": return !!(tg && (tg.move === "maelstrom" || tg.move === "tidalWave"));
      case "aoe": return !!(tg && tg.aoe); case "multi": return !!(m && m.hits > 1); case "impact": return !!(m && (m.bk || []).includes("impact"));
      case "single": return !!(m && m.target === "enemy");
      case "big": return !!(tg && tg.enemy && tg.strongHit); case "boss": return false;
      default: return el === scope;
    }
  }
  function condOk(c, ctx, self, foe) {
    if (!c) return true;
    if (c.foeStatus && !(foe && foeStatus(foe))) return false;
    if (c.foeHas && !(foe && foe.st[c.foeHas])) return false;
    if (c.foeBroken && !(foe && foe.broken)) return false;
    if (c.foeBoss && !(foe && foe.boss)) return false;
    if (c.foeAbove && !(foe && foe.hp / foe.maxHp * 100 > c.foeAbove)) return false;
    if (c.foeBelow && !(foe && foe.hp / foe.maxHp * 100 < c.foeBelow)) return false;
    if (c.hpAbove && !(self.hp / self.maxHp * 100 > c.hpAbove)) return false;
    if (c.hpBelow && !(self.hp / self.maxHp * 100 < c.hpBelow)) return false;
    if (c.first && !(self.evs && self.evs.acts === 0)) return false;
    if (c.groups && !(ctx.opp(self).filter(f => f.alive).length >= 2)) return false;
    if (c.alone && !(ctx.opp(self).filter(f => f.alive).length === 1)) return false;
    if (c.allyDown && !ctx.team(self).some(a => !a.alive)) return false;
    if (c.tele && !ctx.foes.some(f => f.alive && f.charging)) return false;
    if (c.round && !(ctx.round >= c.round)) return false;
    return true;
  }
  const hurtN = (ctx, u) => ctx.team(u).filter(a => a.alive && a.hp < a.maxHp);
  const heal = (ctx, u, a, v) => API.healFlat(ctx, a, Math.max(1, Math.round(v)), { silent: 1 });

  // ---------- the hooks the battle rules call (Core.EVO) ----------
  Object.assign(EVO, {
    start(ctx, p) {
      p.evs = { hits: 0, acts: 0, focN: 0, focTgt: null, moveDmg: 0, tideHitN: 0, costT: -1, hsT: -1, expT: -1, stackT: -1, basicT: -1, critMpT: -1, mpHitT: -1, brkT: -1, delayR: -1, braceR: -1, lsUsed: 0, veng: 0, duoNow: 0, pmHeal: 0, pre: null, healTgt: null, healReal: 0 };
      ctx.evoTeam = true;
      TS(p, "startShield").forEach(x => API.addBuff(p, "shield", Math.round(p.maxHp * x.pct / 100), x.turns, { by: p }));
      TS(p, "tideStart").forEach(x => API.gainTide(ctx, p, x.n));
      TS(p, "swiftStart").forEach(x => API.addBuff(p, "spd", x.pct / 100, 1));
      if (TS(p, "unheard").length) p.unheard = true;
    },
    turn(ctx, u) {
      const e = u.evs; if (!e) return;
      e.tideHitN = 0;
      TS(u, "regen").forEach(x => { if (condOk(x.cond, ctx, u, null) && u.hp < u.maxHp) heal(ctx, u, u, u.maxHp * x.pct / 100); });
      TS(u, "rally").forEach(x => { const a = lowest(hurtN(ctx, u)); if (a) heal(ctx, u, a, a.maxHp * x.pct / 100); });
      TS(u, "cleanseSelf").forEach(x => { if ((x.every === 1 || u.fxTurns % 2 === 0) && Object.keys(u.st).length) API.cleanse(ctx, u, 1); });
    },
    pierce(src, kind) { const p = TS(src, "pierce").filter(x => x.scope === "all" || x.scope === kind).reduce((a, x) => a + x.pct / 100, 0); return 1 - Math.min(0.6, p); },
    critAdd(src) { return sumT(src, "crit") / 100; },
    out(ctx, src, tgt, tg, kind, el) {
      if (src.side === tgt.side) return 1;
      const e = src.evs || {}; let add = 0;
      src.evo.t.forEach(x => {
        if (x.k === "dmg" && scopeOk(x.scope, tg, kind, el) && condOk(x.cond, ctx, src, tgt)) add += x.pct / 100;
        else if (x.k === "rhythm" && ((e.hits || 0) + 1) % x.n === 0) add += x.pct / 100;
        else if (x.k === "focus" && e.focTgt === tgt) add += Math.min(x.max, e.focN || 0) * x.pct / 100;
        else if (x.k === "ramp") add += Math.min(x.max, x.pct * Math.max(0, ctx.round - 1)) / 100;
      });
      let m = 1 + add;
      if (src.evo.duo.length && tg.move && src.evo.duo.includes(tg.move)) m *= src.evo.duoK;
      return m;
    },
    inc(ctx, src, tgt, tg, kind, el) {
      if (src.side === tgt.side) return 1;
      let m = 1; const e = tgt.evs;
      if (tgt.evo) {
        tgt.evo.t.forEach(x => {
          if (x.k === "dr") { const ok = x.scope === "boss" ? !!src.boss : scopeOk(x.scope, tg, kind, el); if (ok && condOk(x.cond, ctx, tgt, src)) m *= 1 - x.pct / 100; }
          else if (x.k === "resEl" && el === x.el) m *= 1 - x.pct / 100;
          else if (x.k === "tideDr") m *= 1 - Math.min(0.5, x.pct * (tgt.tide || 0) / 100);
          else if (x.k === "brace" && e && e.braceR !== ctx.round) { e.braceR = ctx.round; m *= 1 - x.pct / 100; }
        });
      }
      ctx.party.forEach(a => {
        if (!a.evo || !a.alive) return;
        a.evo.t.forEach(x => {
          if (x.k === "aegis" && a !== tgt && tgt.hp / tgt.maxHp * 100 < x.hp) m *= 1 - x.pct / 100;
          else if (x.k === "teamDr") m *= 1 - x.pct / 100;
        });
      });
      return Math.max(0.2, m);
    },
    hit(ctx, src, tgt, v, crit, kind, el, tg, absorbed) {
      if (src.side === tgt.side) return;
      if (src.evo && src.evs) {
        const e = src.evs, m = tg.move ? MOVES[tg.move] : null; e.hits++; e.moveDmg += v;
        src.evo.t.forEach(x => {
          switch (x.k) {
            case "cleave": if (m && m.target === "enemy" && !tg.cleave && v > 0) ctx.foes.forEach(f => { if (f.alive && f !== tgt) API.directHit(ctx, src, f, v * x.pct / 100, "CLEAVE"); }); break;
            case "leech": if (scopeOk(x.scope, tg, kind, el) && src.alive && v > 0) heal(ctx, src, src, v * x.pct / 100); break;
            case "hitStatus": if (tgt.alive && v > 0 && STATUS[x.type]) {
              if (x.once === "turn") { if (e.hsT !== src.fxTurns) { e.hsT = src.fxTurns; API.addStatus(ctx, src, tgt, x.type, x.n); } }
              else if (x.chance && chance(x.chance / 100)) API.addStatus(ctx, src, tgt, x.type, x.n, { sure: 1 });
            } break;
            case "expose": if (tgt.alive && v > 0 && e.expT !== src.fxTurns) { e.expT = src.fxTurns; API.addBuff(tgt, "vuln", x.pct / 100, x.turns, { by: src }); } break;
            case "delayHit": if (tgt.alive && e.delayR !== ctx.round) { e.delayR = ctx.round; API.delayTurn(ctx, tgt, src.name + " throws " + tgt.name + " off its rhythm."); } break;
            case "breakAssist": if (tg.bk && tg.strong && tgt.alive && !tgt.broken && x.tags.some(t => tg.bk.includes(t)) && e.brkT !== src.fxTurns) { e.brkT = src.fxTurns; API.countBreak(ctx, tgt, tg.bk); } break;
            case "mpCrit": if (crit && e.critMpT !== src.fxTurns) { e.critMpT = src.fxTurns; src.mp = Math.min(src.maxMp, src.mp + 1); } break;
            case "mpKill": if (tgt.hp <= 0) src.mp = Math.min(src.maxMp, src.mp + x.n); break;
            case "tideBasic": if (m && m.basic && src.style === "leviathan" && condOk(x.cond, ctx, src, tgt)) API.gainTide(ctx, src, 1); break;
          }
        });
      }
      if (tgt.evo && tgt.evs && (v > 0 || absorbed > 0)) {
        const e = tgt.evs;
        tgt.evo.t.forEach(x => {
          switch (x.k) {
            case "mpHit": if (e.mpHitT !== tgt.fxTurns && tgt.alive) { e.mpHitT = tgt.fxTurns; tgt.mp = Math.min(tgt.maxMp, tgt.mp + 1); } break;
            case "tideHit": if (e.tideHitN < x.max && tgt.alive) { e.tideHitN++; API.gainTide(ctx, tgt, 1); } break;
            case "thorns": if (kind === "phys" && src.alive && tgt.hp > 0 && !tg.refl) API.directHit(ctx, tgt, src, v * x.pct / 100, "THORNS"); break;
            case "retaliate": if (tgt.hp > 0 && src.alive && v >= tgt.maxHp * x.min / 100 && !tg.refl) API.directHit(ctx, tgt, src, v * x.pct / 100, "RETALIATE"); break;
          }
        });
      }
    },
    statusDur(src, type) { return TS(src, "statusLong").filter(x => !x.types || x.types.includes(type)).reduce((a, x) => a + x.n, 0); },
    statusStack(src, type) {
      const x = TS(src, "stack").find(y => y.types.includes(type)); const e = src.evs; if (!x || !e || e.stackT === src.fxTurns) return 0;
      e.stackT = src.fxTurns; return 1;
    },
    statusApplied(ctx, src, tgt, type) {
      const s = tgt.st[type], S = STATUS[type]; if (!s || !S || !S.dot) return;
      const p = sumT(src, "dotPlus"); if (p) s.gm = Math.max(s.gm || 1, 1 + p / 100);
    },
    statusRes(tgt) { return sumT(tgt, "statusRes") / 100; },
    immune(tgt, type) { return TS(tgt, "immune").some(x => x.types.includes(type)); },
    debuffMod(src) { return [1 + sumT(src, "debuffPower") / 100, TS(src, "debuffLong").reduce((a, x) => a + x.n, 0)]; },
    healMult(src) { const e = src.evs; let m = 1 + sumT(src, "healPlus") / 100 + (e ? e.pmHeal : 0); if (e && e.duoNow) m *= src.evo.duoK; return m; },
    healed(ctx, src, tgt, real, over) {
      const e = src.evs; if (!e) return;
      if (e.healTgt === null) { e.healTgt = tgt; e.healReal = real; }
      if (over > 0) TS(src, "healOver").forEach(x => { const val = Math.min(over, Math.round(tgt.maxHp * x.pct / 100)), ex = API.getBuff(tgt, "shield"); if (val > 0 && (!ex || ex.val < val)) API.addBuff(tgt, "shield", val, 2, { by: src }); });
    },
    costCut(u, m) {
      const e = u.evs; if (!e || e.costT === u.fxTurns || !m.mp || m.mp < 2 || m.basic) return 0;
      return TS(u, "costDown").some(x => x.scope === "any" || (x.scope === "spell" && m.kind !== "phys") || (x.scope === "phys" && m.kind === "phys") || (x.scope === "mp3" && m.mp === 3) || (x.scope === "mp2" && m.mp === 2) || (x.scope === "support" && m.grp === "support")) ? 1 : 0;
    },
    beforeMove(ctx, u, m, id, target) {
      const e = u.evs; if (!e) return;
      e.moveDmg = 0; e.healTgt = null; e.healReal = 0; e.duoNow = u.evo.duo.includes(id) ? 1 : 0;
      e.pmHeal = id === u.evo.pmId ? u.evo.riders.filter(r => r.k === "healPlus").reduce((a, r) => a + r.pct / 100, 0) : 0;
      e.cutNow = EVO.costCut(u, m) > 0;
      const snap = new Map(); ctx.team(u).concat(ctx.opp(u)).forEach(a => a.buffs.forEach(b => snap.set(b, b.turns)));
      const ext = { rooted: u.rooted, moss: target && target.moss, terror: target && target.terrorOn, ablaze: u.ablaze };
      e.pre = { snap, ext, dead: target && !target.alive, gal: u.gallop, run: u.runes, omen: target && target.omen };
    },
    afterMove(ctx, u, id, moveId, target) {
      const e = u.evs, m = MOVES[moveId]; if (!e || !m) return;
      const E = u.evo, pre = e.pre || {};
      if (e.cutNow) e.costT = u.fxTurns;
      e.acts++;
      // basic attack: MP
      if (m.basic && TS(u, "mpBasic").length && e.basicT !== u.fxTurns) { e.basicT = u.fxTurns; u.mp = Math.min(u.maxMp, u.mp + 1); }
      // focus: actions in a row on one target
      if (m.target === "enemy" && target) { if (e.focTgt === target) e.focN = Math.min(4, e.focN + 1); else { e.focTgt = target; e.focN = 1; } }
      // guard after a move
      TS(u, "moveGuard").forEach(x => {
        const ok = (x.scope === "impact" && (m.bk || []).includes("impact")) || (x.scope === "spell" && m.kind !== "phys" && m.mp) || (x.scope === "personal" && m.personal) || (x.scope === "mp3" && m.mp === 3) || (x.scope === "mp2" && m.mp === 2)
          || (x.scope === "support" && m.grp === "support") || (x.scope === "phys" && m.kind === "phys" && m.mp) || (x.scope === "strong" && m.mp >= 2) || (x.scope === "control" && m.grp === "control");
        if (ok) API.hold(u, u, "dr", x.pct / 100);
      });
      // heal extras
      if (e.healTgt && m.target === "ally") {
        const t = e.healTgt;
        if (TS(u, "healCleanse").length && t.alive) API.cleanse(ctx, t, 1, u);
        TS(u, "healEcho").forEach(x => { const a = lowest(hurtN(ctx, u), t); if (a && e.healReal > 0) heal(ctx, u, a, e.healReal * x.pct / 100); });
      }
      if (m.target === "allyDown" && pre.dead && target && target.alive) TS(u, "reviveBoost").forEach(x => heal(ctx, u, target, target.maxHp * x.pct / 100));
      // buffs and shields cast on allies last longer
      const bl = sumT(u, "buffLong", "n");
      if (bl && m.grp === "support") ctx.team(u).forEach(a => a.buffs.forEach(b => { if (b.turns < 50 && (b.val > 0 || b.type === "shield") && pre.snap && pre.snap.get(b) !== b.turns) b.turns += bl; }));
      // the upgraded personal move
      if (moveId === E.pmId) riders(ctx, u, m, target, pre, e);
      e.duoNow = 0; e.pmHeal = 0; e.pre = null;
    },
    die(ctx, u) {
      const x = TS(u, "lastStand")[0], e = u.evs; if (!x || !e || e.lsUsed) return;
      e.lsUsed = 1; u.hp = Math.max(1, Math.round(u.maxHp * x.heal / 100)); ctx.ev.push({ t: "heal", tgt: u, v: u.hp });
      API.say(ctx, u.name + " refuses to fall!"); return false;
    },
    risen(ctx, p) {
      const x = TS(p, "ashes")[0]; if (!x) return;
      p.hp = Math.max(p.hp, Math.round(p.maxHp * x.hp / 100)); API.addBuff(p, "shield", Math.round(p.maxHp * x.sh / 100), 2, { by: p });
    },
    allyDown(ctx, a, dead) {
      const x = TS(a, "vengeance")[0], e = a.evs; if (!x || !e || e.veng >= x.max) return;
      e.veng++; API.addBuff(a, "atk", x.pct / 100 * e.veng, 99, { force: 1 }); API.addBuff(a, "pow", x.pct / 100 * e.veng, 99, { force: 1 });
      API.say(ctx, a.name + " burns for revenge.");
    },
    release(ctx, u) { TS(u, "tideHeal").forEach(x => living(ctx, u).forEach(a => heal(ctx, u, a, a.maxHp * x.pct / 100))); },
  });

  // personal-move riders (what the upgrade adds): run after the move
  function riders(ctx, u, m, target, pre, e) {
    const foe = target && target.side !== u.side ? target : null, ally = target && target.side === u.side ? target : null, mine = living(ctx, u);
    const E = u.evo;
    E.riders.forEach(r => {
      switch (r.k) {
        case "refund": u.mp = Math.min(u.maxMp, u.mp + r.n); break;
        case "selfDr": API.hold(u, u, "dr", r.pct / 100); break;
        case "selfShield": API.addBuff(u, "shield", Math.round(u.maxHp * r.pct / 100), 2, { by: u }); break;
        case "selfHeal": heal(ctx, u, u, u.maxHp * r.pct / 100); break;
        case "lowHeal": { const a = lowest(hurtN(ctx, u)); if (a) heal(ctx, u, a, a.maxHp * r.pct / 100); break; }
        case "teamHeal": mine.forEach(a => heal(ctx, u, a, a.maxHp * r.pct / 100)); break;
        case "status": if (foe && foe.alive) API.addStatus(ctx, u, foe, r.type, r.n, r.chance ? { chance: r.chance / 100 } : {}); break;
        case "debuff": if (foe && foe.alive) API.debuff(ctx, u, foe, r.stat, -r.pct / 100, r.turns); break;
        case "buffSelf": API.addBuff(u, r.stat, r.pct / 100, r.turns); break;
        case "buffTeam": mine.forEach(a => API.addBuff(a, r.stat, r.pct / 100, r.turns)); break;
        case "splash": if (e.moveDmg > 0) ctx.foes.forEach(f => { if (f.alive && f !== foe) API.directHit(ctx, u, f, e.moveDmg * r.pct / 100, "SPLASH"); }); break;
        case "cleanse": API.cleanse(ctx, ally || u, r.n, u); break;
        case "tide": API.gainTide(ctx, u, r.n); break;
        case "vuln": if (foe && foe.alive) API.addBuff(foe, "vuln", r.pct / 100, r.turns, { by: u }); break;
        case "delay": if (foe && foe.alive) API.delayTurn(ctx, foe, u.name + " pushes " + foe.name + " to the back of the line."); break;
        case "stun": if (foe && foe.alive && chance(r.pct / 100)) API.addStatus(ctx, u, foe, "stun", 1, { sure: 1 }); break;
        case "shieldTeam": mine.forEach(a => API.addBuff(a, "shield", Math.round(a.maxHp * r.pct / 100), 2, { by: u })); break;
        case "drTeam": mine.forEach(a => API.hold(u, a, "dr", r.pct / 100)); break;
        case "extend": extend(u, ally || foe, pre, r.n, ctx); break;
      }
    });
  }
  // "its lasting effect lasts n turns longer": buffs and debuffs the move just made or refreshed, plus the creature-specific timers
  function extend(u, tgt, pre, n, ctx) {
    const all = ctx.party.concat(ctx.foes);
    all.forEach(a => a.buffs.forEach(b => { if (b.turns < 50 && pre.snap && pre.snap.get(b) !== b.turns && (b.by === u || b.owner === u || a === u || (tgt && a === tgt) || a.side === u.side)) b.turns += n; }));
    if (u.rooted > 0 && u.rooted !== pre.ext.rooted) u.rooted += n;
    if (u.ablaze > 0 && u.ablaze !== pre.ext.ablaze) u.ablaze += n;
    if (tgt && tgt.moss > 0 && tgt.moss !== pre.ext.moss) tgt.moss += n;
    if (tgt && tgt.terrorOn > 0 && tgt.terrorOn !== pre.ext.terror) tgt.terrorOn += n;
    if (u.gallop && u.gallop !== pre.gal) u.gallop.t += n;
    if (u.runes && u.runes !== pre.run) u.runes.t += n;
    if (tgt && tgt.omen && tgt.omen !== pre.omen) tgt.omen.t += n;
    if (u.sun) u.sun.left += n;
    if (u.tails > 0) u.tails += n;
    Object.keys(tgt && tgt.st || {}).forEach(k => { if (tgt.side !== u.side && tgt.st[k].by === undefined && tgt.st[k].t > 0 && pre.snap) { /* statuses keep their own lengths */ } });
  }

  const Evo = { D, formsOf, check, checkAll, setForm, active, has, formOf, data, applyAll, revertAll, moveView, artOf, preload, boostFor, STAGE_NAME, reqOf, tintOf };
  root.Evo = Evo; if (isNode) module.exports = Evo; else preload();
})(typeof window !== "undefined" ? window : globalThis);
