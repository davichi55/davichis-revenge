// Party screen: your team and the Menagerie Wagon creatures. Tabs: Stats (3 points per level, no caps), Moves, Gear (3 slots, set bonuses), Skill (one off-style move).
// Built on the shared UI layer (src/ui/ui.js). Keys: Left/Right or 1-9 switch creature, Q/R tabs, Up/Down pick a stat, Enter adds a point, Esc closes.
"use strict";
const STAT_INFO = {
  hp: "How much damage it can take.", atk: "Damage of basic attacks and physical moves.", pow: "Spell damage and how much heals restore.",
  def: "Less physical damage taken.", res: "Less spell damage taken, and shrugging off status effects.",
  spd: "Who acts first. At 2x the enemy's speed: +1 action per turn.", foc: "Starting MP in a fight: +1 MP per 10 Focus.",
  lck: "Critical hits, and the chance your status effects land.",
};
// prologue: Old Dunmar lends the practice creatures; their points are not the player's to spend (Danny 2026-10-31)
const LOANER_LINE = "(Old Dunmar's practice creatures. Not mine to train.)";
const loaner = () => { try { return !G.pack; } catch (e) { return false; } };
function partyScreen(startAt = 0) {
  const w = partyScreen0(startAt); return w.then(r => { if (window.Systems) Systems.endSession(); return r; });
}
function partyScreen0(startAt = 0) {
  const esc = UI.esc;
  let cur = Math.max(0, startAt), sel = 0, msg = "";
  const roster = () => G.party.concat(G.collection || []);
  const style = u => { try { return Core.CREATURES[u.id].styleName || ""; } catch (e) { return ""; } };
  if (window.Evo) Evo.checkAll(G.party.concat(G.collection || []), t => UI.toast(t, 4000));   // forms unlocked since the last visit
  // Forms tab: the 6 forms of a creature (evolution). Unlocked forms are yours for good; switch any time outside a fight.
  const formsHtml = u => {
    if (!window.Evo || !Evo.data(u)) return `<h3>Forms</h3><div style="color:#b7a58a">${esc(u.name)} has no other forms.</div>`;
    const rows = Evo.formsOf(u), act = Evo.active(u), SN = Core.STAT_NAMES, ST = Evo.STAGE_NAME;
    const boost = f => Object.entries(Evo.boostFor(u, f)).filter(([, v]) => v).map(([k, v]) => `+${v} ${SN[k]}`).join(", ");
    const card = r => {
      const f = r.form, c = Evo.data(u), tag = f.stage === "d" ? "Duo: " + Core.STYLES[c.duo.style].name + " moves" : ST[f.stage] + (f.rq ? " · " + SN[c.axes[f.rq]] + " branch" : "");
      const btn = r.active ? `<b style="color:#7dff9a">Active</b>` : r.unlocked ? `<button class="b" data-form="${f.id}">Use</button>` : r.ready ? `<b style="color:#f2c14e">Ready</b>` : "";
      const lock = r.unlocked ? "" : r.ready ? "" : `<small style="color:#c98a6a">Needs: ${esc(r.req.filter(q => !q.ok).map(q => q.flag ? q.label : q.label + " " + q.need + " (now " + q.have + ")").join(", "))}</small>`;
      const dim = r.unlocked ? "" : "opacity:.72;";
      return `<div class="row${r.active ? " sel" : ""}" style="${dim}align-items:flex-start"><div class="g"><span style="color:#f2c14e">${esc(f.n)}</span> <small style="display:inline">${esc(tag)}</small>
        ${lock}<small>Trait ${esc(f.trait.name)}: ${esc(f.trait.fx.map(x => x.text).join(" "))}</small><small>Move ${esc(f.pm.name)}: ${esc(f.pm.desc)}</small>
        <small>With this form: ${esc(boost(f))}${f.stage === "d" ? " · borrows " + esc(c.duo.moves.map(m => Core.MOVES[m].name).join(", ")) + " at " + Math.round(Evo.D.duoK * 100) + "% power" : ""}</small></div>${btn}</div>`;
    };
    return `<h3>Forms <span style="font-family:Marcellus;font-size:14px;color:#b7a58a;float:right">${act ? esc(act.n) : "Base form"}</span></h3>
      <div style="color:#b7a58a;font-size:14px;margin-bottom:6px">A form you unlock is yours for good, even if you change your stats later. Switch whenever you like outside a fight.</div>
      <div class="row${act ? "" : " sel"}"><div class="g">Base form<small>${esc(u.name)} as it is. No boost, trait or upgrade.</small></div>${act ? `<button class="b" data-form="">Use</button>` : `<b style="color:#7dff9a">Active</b>`}</div>`
      + rows.map(card).join("");
  };
  const moveBox = (m, who) => { const d0 = Core.MOVES[m], vw = d0 && window.Evo && who ? Evo.moveView(who, m) : null, d = d0 && vw ? Object.assign({}, d0, vw) : d0; if (!d) return `<div class="row"><div class="g">${esc(m)}</div></div>`; return `<div class="row"><div class="g">${esc(d.name)}<small>${esc(d.desc || "")}</small></div><span style="color:#6fb7ff">${d.basic ? "+1 MP" : d.hpCost ? "15% HP" : (d.mp || 0) + " MP"}</span></div>`; };
  const gearMsg = u => { const a = Flow.activeBonus(u); if (!a) return "No set bonus yet. Two pieces of one set give half the bonus, three give all of it."; const nd = bonusNeed(u, a.b); return `${Data.SETS[a.set].n}: ${a.b.n} (${a.level === 2 ? "full" : "2-piece, half strength"})${nd && !nd.ok ? " · does nothing on " + u.name + " yet" : ""}`; };
  // Set bonuses that only work with a certain move, passive or style (owner RULES-GEAR): what they need, and whether this creature has it. A tag without an entry always works.
  // { move: id } = that exact move; { passive: id, what } = that passive; { style: id, what } = that style (Tide); { any: (move, creature) => bool, what } = some move that fits;
  // passive + any together = either one. The tag names are the `fx` of src/story/data.js SETS and the rules in src/core.js (gear set bonuses).
  const isEl = (m, u, els) => els.includes(m.el === "self" ? u.element : m.el);
  const spell = m => m.kind !== "phys", lowers = (m, s) => (m.db || []).some(d => d[0] === s && d[1] < 0);
  const gives = (m, ts) => (m.st || []).some(s => ts.includes(s[0])) || (m.id === "twoHeads" && ts.includes("bleed"));
  const poisonMv = m => (Core.GEAR ? Core.GEAR.poisonMove(m) : gives(m, ["poison"])), HEALS = (Core.GEAR && Core.GEAR.HEAL_MOVES) || [];
  const TIDE = { style: "leviathan", what: "Tide (Leviathan style)" };
  const NEEDS = {
    lockedShields: { move: "shieldWall" }, shieldBrother: { move: "bulwark" }, earthquake: { move: "earthshaker" }, chargedAttune: { move: "attune" }, sharperDetonate: { move: "detonate" },
    masterMixing: { passive: "comboMaster", what: "the Combo Master passive (Dragon style)" },
    deadEnd: { any: m => (m.bk || []).includes("impact"), what: "an impact move" },
    cheapCruelty: { any: m => m.mp === 1 && (m.p || 0) > 0, what: "a 1 MP attack" },
    slowBurn: { any: m => gives(m, ["burn"]), what: "a move that burns" },
    emberHeart: { any: (m, u) => isEl(m, u, ["fire"]), what: "fire moves" },
    // Minotaur
    sandUnderfoot: { any: m => !!(m.hpCost || m.hpCostPct), what: "a move that costs HP" },
    heavyHitter: { any: m => m.mp >= 3 && (m.target === "enemy" || m.target === "allEnemies"), what: "a 3 MP attack (the Speed loss applies either way)" },
    bottledFury: { move: "wrath" }, thrifty: { any: m => m.mp >= 2, what: "a move that costs 2 MP or more" },
    // Harpy
    tailwindWeave: { move: "tailwind" }, deathFromAbove: { move: "dive" }, thiefsHands: { move: "snatch" },
    hundredCuts: { any: m => (m.hits || 1) > 1, what: "a move with several hits" },
    openWounds: { any: m => gives(m, ["bleed"]), what: "a move that causes bleed" },
    glancingFeathers: { any: m => m.id === "dive" || m.id === "hitAndRun", what: "Dive or Hit and Run" },
    shrillEcho: { any: m => lowers(m, "spd"), what: "a move that lowers Speed" },
    // Hydra
    toxicEdge: { any: poisonMv, what: "a poison move" }, virulent: { any: poisonMv, what: "a poison move" },
    leanBrew: { any: m => poisonMv(m) && m.mp >= 2, what: "a poison move that costs 2 MP or more" },
    deepCuts: { any: m => gives(m, ["bleed"]), what: "a move that causes bleed" }, hungerRed: { any: m => gives(m, ["bleed"]), what: "a move that causes bleed" },
    ruptureRite: { move: "rupture" }, quickenedRot: { move: "fester" }, regrowth: { move: "regrow" },
    louderChorus: { passive: "manyHeads", what: "the Many Heads passive (Hydra style)" },
    earlyRot: { any: m => gives(m, ["burn", "bleed", "poison", "shock"]), what: "a move that burns, bleeds, poisons or shocks" },
    // Colossus
    spikedFacing: { move: "counterSt" }, weightyBlows: { move: "crushWeight" }, provocation: { move: "challenge" }, heavySleeper: { move: "challenge" },
    // Phoenix
    radiantHealing: { any: m => HEALS.includes(m.id), what: "a healing move" }, overflowingLight: { any: m => HEALS.includes(m.id), what: "a healing move" },
    frugalLight: { any: m => HEALS.includes(m.id) && m.mp >= 2, what: "a healing move that costs 2 MP or more" },
    rebirthRite: { move: "rebirth" }, longerEmber: { passive: "ashes", what: "the From the Ashes passive (Phoenix style)" },
    ashenMantle: { passive: "ashes", any: m => m.id === "rebirth" || m.id === "revive", what: "Rebirth, Revive or the From the Ashes passive" },
    healingFlame: { any: m => ["cleansingFlame", "purge", "silverLining"].includes(m.id), what: "Cleansing Flame, Purge or Silver Lining" },
    inoculation: { any: m => ["cleansingFlame", "purge", "silverLining"].includes(m.id), what: "Cleansing Flame, Purge or Silver Lining" },
    quickPurge: { move: "purge" }, strongWard: { move: "flameWard" }, brighterSun: { move: "sunfire" },
    lingeringWard: { any: m => ["flameWard", "silverLining", "plantThePillar"].includes(m.id), what: "Flame Ward, Silver Lining or Plant the Pillar" },
    scorchingWard: { any: m => ["flameWard", "silverLining", "plantThePillar"].includes(m.id), what: "Flame Ward, Silver Lining or Plant the Pillar" },
    // Gorgon
    hardStare: { move: "stoneGaze" }, cheapStone: { move: "stoneGaze" }, cracking: { move: "crackArmour" }, tighterCoil: { move: "coil" }, quietHiss: { move: "hiss" }, lastingCurse: { move: "curseOfStone" },
    deepWeakness: { any: m => (m.db || []).some(d => d[1] < 0), what: "a move that lowers a stat" }, longMarks: { any: m => (m.db || []).some(d => d[1] < 0), what: "a move that lowers a stat" },
    deeperExposure: { passive: "exposed", what: "the Exposed passive (Gorgon style)" },
    shellCracker: { any: m => (m.bk || []).includes("shell"), what: "a shell-breaking move (Crack Armour, Shatter Shield)" },
    chainBreaker: { any: m => m.grp === "control", what: "a control move" },
    heavyFeet: { any: m => lowers(m, "spd"), what: "a move that lowers Speed" },
    calmEyes: { any: m => lowers(m, "atk") || m.id === "dirtyLaundry", what: "a move that lowers Attack" },
    // Dragon
    fireThrift: { any: (m, u) => m.mp >= 2 && spell(m) && isEl(m, u, ["fire"]), what: "a fire spell that costs 2 MP or more" },
    cheapThunder: { any: (m, u) => m.mp >= 2 && spell(m) && isEl(m, u, ["shock"]), what: "a lightning spell that costs 2 MP or more" },
    deepFrost: { any: (m, u) => isEl(m, u, ["water", "ice"]), what: "water or ice moves" },
    stormSurge: { any: (m, u) => isEl(m, u, ["shock"]), what: "lightning moves" }, wetConductor: { any: (m, u) => isEl(m, u, ["shock"]), what: "lightning moves" },
    lingeringDamp: { any: m => gives(m, ["wet", "chill"]), what: "a move that makes enemies Wet or Chilled" }, brittleFreeze: { any: m => gives(m, ["wet", "chill"]), what: "a move that makes enemies Wet or Chilled" },
    elementDance: { any: (m, u) => spell(m) && m.mp > 0 && !!(m.el === "self" ? u.element : m.el), what: "spells of different elements" },
    wideBurn: { any: m => m.target === "allEnemies" && spell(m), what: "a spell that hits all enemies" },
    // Leviathan
    heavierTide: { any: m => m.id === "maelstrom" || m.id === "tidalWave", what: "Maelstrom or Tidal Wave" }, finishingWave: { any: m => m.id === "maelstrom" || m.id === "tidalWave", what: "Maelstrom or Tidal Wave" },
    crashingWave: { any: m => m.id === "maelstrom" || m.id === "tidalWave", what: "Maelstrom or Tidal Wave" },
    deeperReservoir: TIDE, pressureSkin: TIDE, salvage: TIDE, longBreath: { move: "deepBreath" }, draggingCurrent: { move: "riptide" }, longHunger: { move: "abyssalHunger" }, surgingUndertow: { move: "undertow" },
    heavyTail: { any: m => m.id === "tailSlap" || m.id === "undertow", what: "Tail Slap or Undertow" },
    // any style
    persuasive: { any: m => (m.st || []).length > 0 || m.grp === "control", what: "a move that causes a status or control" },
  };
  const ownerStyle = id => { const s = Object.keys(Core.STYLE_MOVES).find(k => Core.STYLE_MOVES[k].includes(id)); return s ? Core.STYLES[s].name : ""; };
  function bonusNeed(u, b) {
    const n = b.fx && NEEDS[b.fx]; if (!n) return null;
    const known = Core.movesOf(u), later = (Core.STYLE_MOVES[u.style] || []).filter(id => !known.includes(id)).map(id => Core.MOVES[id]).sort((x, y) => x.lvl - y.lvl);
    const pn = () => { try { return Core.CREATURES[u.id].passiveName.split(":")[0]; } catch (e) { return n.what; } };
    if (n.style) return u.style === n.style ? { ok: true, text: "Works: " + u.name + " builds Tide." } : { ok: false, text: "Needs " + n.what + ". No effect on " + u.name + "." };
    if (n.passive && u.passive === n.passive) return { ok: true, text: "Works: " + u.name + " has " + pn() + "." };
    if (n.passive && !n.any) return { ok: false, text: "Needs " + n.what + ". No effect on " + u.name + "." };
    if (n.move) {
      const m = Core.MOVES[n.move];
      if (known.includes(n.move)) return { ok: true, text: "Works: " + u.name + " knows " + m.name + "." };
      if (later.some(x => x.id === n.move)) return { ok: false, text: "Only boosts " + m.name + ", which " + u.name + " learns at level " + m.lvl + "." };
      return { ok: false, text: "Only boosts " + m.name + " (" + ownerStyle(n.move) + " style). No effect on " + u.name + "." };
    }
    const have = known.map(id => Core.MOVES[id]).filter(m => m && n.any(m, u));
    if (have.length) return { ok: true, text: "Works with " + have.slice(0, 3).map(m => m.name).join(", ") + "." };
    const nx = later.find(m => n.any(m, u));
    return { ok: false, text: "Needs " + n.what + (nx ? ". First one: " + nx.name + " at level " + nx.lvl + "." : ". No effect on " + u.name + ".") };
  }
  const dot = ok => `<span title="${ok ? "active" : "no effect"}" style="display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:8px;vertical-align:1px;${ok ? "background:#7dff9a;box-shadow:0 0 6px 2px #46e070;animation:sbPulse 1.6s ease-in-out infinite" : "background:#4a4038;border:1px solid #7a6a58"}"></span>`;
  return UI.window("Party", (body, api, tab) => {
    const R = roster(); cur = Math.min(cur, R.length - 1); const u = R[cur], c = (Core.CREATURES && Core.CREATURES[u.id]) || {};
    // bars on a scale that grows with level (stats have no cap): the highest stat no longer looks "full" at level 3
    const maxStat = Math.max(60 + 3 * u.level, ...Core.STATS.map(k => u.stats[k]));
    // what the active set bonus adds in a fight (Danny: where do I see the +20% Defense?): apply the gear to a copy and compare
    const gear = (() => { const d = {}; try { const c = { id: u.id, level: u.level, stats: { ...u.stats }, maxHp: u.maxHp, hp: u.hp, eq: u.eq, sb: u.sb }; Flow.applyGear([c]); Core.STATS.forEach(k => { const v = c.stats[k] - u.stats[k]; if (v) d[k] = v; }); if (c.maxHp > u.maxHp) d.maxHp = c.maxHp - u.maxHp; } catch (e) {} return d; })();
    const list = `<div style="display:grid;gap:8px;align-content:start">${R.map((p, i) => `<button class="row${i === cur ? " sel" : ""}" data-c="${i}" style="text-align:left;color:inherit;font:inherit;cursor:pointer;margin:0"><div style="width:56px;height:50px;display:grid;place-items:center">${UI.art(p.id)}</div><div class="g">${esc(p.name)}<small>${esc(style(p))} · Lv ${p.level}${i >= G.party.length ? " · wagon" : ""}</small>${(() => `<div style="height:5px;background:#000;margin-top:3px"><i style="display:block;height:100%;width:${100 * p.hp / p.maxHp}%;background:#58c26a"></i></div>`)()}${p.points ? `<span style="background:#f2c14e;color:#1b130e;font-size:14px;padding:0 6px;border-radius:3px">+${p.points} points</span>` : ""}</div></button>`).join("")}</div>`;
    const head = `<div style="display:flex;gap:14px;align-items:center;margin-bottom:12px"><div style="width:120px;height:104px;display:grid;place-items:center;background:radial-gradient(circle at 50% 70%,#3a2614,#1b130e 70%);border:1px solid #3a2a1a">${UI.art(u.id, 50)}</div>
      <div><div style="font-family:'Marcellus SC',serif;font-size:28px;color:#f2c14e">${esc(u.name)}</div><div style="color:#b7a58a">${esc(style(u))} · Level ${u.level} · HP ${u.hp}/${u.maxHp}${gear.maxHp ? ` <span style="color:#7dff9a">+${gear.maxHp} max</span>` : ""} · starts with ${Math.floor(u.stats.foc / 10)} MP</div>
      <div style="color:#b7a58a;font-size:14px;margin-top:2px">${esc(c.passiveName || "")}</div><div style="color:#b7a58a;font-size:14px">XP ${u.xp} / ${Core.xpToNext(u.level)}</div></div></div>`;
    let main = "";
    const note = msg ? `<div style="color:#f2c14e;margin-bottom:8px">${esc(msg)}</div>` : "";
    if (tab === 0) {
      main = `<h3>Stats <span style="font-family:Marcellus;font-size:14px;color:#b7a58a;float:right">${u.points ? u.points + " points to spend" : "3 points per level"}</span></h3>`
        + Core.STATS.map((k, i) => `<div class="row${i === sel ? " sel" : ""}" data-s="${i}" style="margin-bottom:3px"><span style="width:100px">${Core.STAT_NAMES[k]}</span><b style="width:36px;text-align:right">${u.stats[k]}</b><small style="width:46px;padding-left:6px;color:#7dff9a" title="from the set bonus, in fights">${gear[k] ? "+" + gear[k] : ""}</small><div style="flex:1;height:8px;background:#000"><i style="display:block;height:100%;width:${100 * u.stats[k] / maxStat}%;background:linear-gradient(90deg,#8a5a2a,#f2c14e)"></i></div><button class="b" data-add="${i}" ${u.points ? "" : "disabled"}>+</button></div>`).join("")
        + `<div style="color:#b7a58a;font-size:14px;margin-top:6px;min-height:2.4em">${Core.STAT_NAMES[Core.STATS[sel]]}: ${STAT_INFO[Core.STATS[sel]]}</div>`
        + (u.guest ? `<div style="color:#b7a58a;margin-top:6px">${esc(u.name)} is a guest: its stats follow the team and cannot be changed.</div>` : window.Systems && Systems.respecAvailable(u) ? `<div class="row" style="margin-top:8px"><div class="g">Respec<small>Take back the points ${esc(u.name)} spent and spend them again. Gear, moves and set choices stay.</small></div><button class="b" data-respec="1">Respec</button></div>` : "");
    } else if (tab === 1) {
      const mv = Core.movesOf(u); const nxt = (Core.STYLE_MOVES[u.style] || []).map(m => Core.MOVES[m]).find(m => m && m.lvl > u.level);
      main = `<h3>Moves <span style="font-family:Marcellus;font-size:14px;color:#b7a58a;float:right">${mv.length} learned</span></h3>${mv.map(m => moveBox(m, u)).join("")}${nxt ? `<div style="color:#b7a58a;margin-top:6px">Next move: ${esc(nxt.name)} at level ${nxt.lvl}</div>` : ""}`;
    } else if (tab === 2) {
      const a = Flow.activeBonus(u), cnt = Flow.setCounts(u);
      main = note + `<h3>Gear</h3>` + Data.SLOTS.map(sl => { const pid = u.eq && u.eq[sl]; return `<div class="row" style="align-items:center">${window.GearUI ? (pid ? GearUI.icon(pid, 52) : GearUI.blank(52)) : ""}<div class="g">${Data.SLOT_NAMES[sl]}<small>${pid ? esc(Data.pieceName(pid)) + " · " + esc(Data.SETS[pid.split(".")[0]].n) : "empty"}</small></div><button class="b" data-slot="${sl}">${pid ? "Change" : "Equip"}</button></div>`; }).join("")
        + `<h3 style="margin-top:12px">Set bonus</h3><div style="color:#b7a58a;margin-bottom:6px">${esc(gearMsg(u))}</div>`
        + Object.keys(cnt).filter(s => cnt[s] >= 2).map(s => Data.SETS[s].b.map((b, bi) => { const on = (u.sb && u.sb[s] != null ? u.sb[s] : 0) === bi, nd = bonusNeed(u, b), ok = !nd || nd.ok; return `<button class="row${on ? " sel" : ""}" data-sb="${s}:${bi}" style="width:100%;text-align:left;color:inherit;font:inherit;cursor:pointer;${ok ? "" : "opacity:.6"}"><div class="g">${dot(ok)}${esc(b.n)}<small>${esc(cnt[s] >= 3 ? b.d : "Half strength: " + b.d2)}</small>${nd ? `<small style="color:${ok ? "#8fe0a0" : "#c98a6a"}">${esc(nd.text)}</small>` : ""}</div>${on ? "<b style='color:#f2c14e'>chosen</b>" : ""}</button>`; }).join("")).join("") + "<style>@keyframes sbPulse{50%{box-shadow:0 0 10px 4px #46e070;opacity:.8}}</style>" + (Object.values(cnt).some(n => n >= 2) ? `<div style="color:#b7a58a;font-size:14px">Change the bonus any time outside a fight.</div>` : "");
    } else if (tab === 4) {
      main = note + formsHtml(u);
    } else {
      const slot = u.slot && Data.BOOK[u.slot];
      main = note + `<h3>Off-style move</h3><div style="color:#b7a58a;margin-bottom:8px">One move from the Skill Book can ride along in this slot. It costs the normal amount but has none of the style's bonus effects.</div>
        <div class="row"><div class="g">${slot ? esc(slot.n) : "Empty"}<small>${slot ? esc(slot.d) : "Nothing equipped."}</small></div><button class="b" data-skill="1">${slot ? "Change" : "Equip"}</button></div>`
        + (slot && !(Core.MOVES && Core.MOVES[slot.move]) ? `<div style="color:#ff6b57;font-size:14px">The battle rules do not know this move yet; it will start working when they do.</div>` : "");
    }
    body.innerHTML = `<div style="display:grid;grid-template-columns:250px 1fr;gap:18px">${list}<div>${head}${main}</div></div>`;
  }, {
    tabs: ["Stats", "Moves", "Gear", "Skill", "Forms"],
    gold: () => `${G.gold} kakal`, foot: "Left/Right switch creature, Q / R switch tabs, Up/Down pick a stat, Enter adds a point, Esc closes.",
    click: async (e, api) => {
      const t = e.target.closest("[data-c],[data-add],[data-s],[data-slot],[data-sb],[data-skill],[data-respec],[data-form]"); if (!t) return; const d = t.dataset, R = roster(), u = R[cur]; msg = "";
      if (d.form !== undefined) { const r = Evo.setForm(u, d.form || null); msg = r.msg; Flow.sfx("menuOk"); return api.redraw(); }
      if (d.respec !== undefined) { await Systems.respecConfirm(u); return api.redraw(); }
      if (u.guest && (d.add !== undefined || d.slot !== undefined || d.skill !== undefined || d.sb !== undefined)) { msg = u.name + " is a guest: nothing to change here."; return api.redraw(); }
      if (d.c !== undefined) { cur = +d.c; return api.redraw(); }
      if (d.s !== undefined && d.add === undefined) { sel = +d.s; return api.redraw(); }
      if (d.add !== undefined) { if (loaner()) { UI.toast(LOANER_LINE, 3200); return; } if (u.points) { Core.spendPoint(u, Core.STATS[+d.add]); sel = +d.add; Flow.sfx("menuOk"); if (window.Evo) Evo.checkAll([u], t => UI.toast(t, 4000)); } return api.redraw(); }
      if (d.sb !== undefined) { const [s, i] = d.sb.split(":"); u.sb = u.sb || {}; u.sb[s] = +i; return api.redraw(); }
      if (d.slot !== undefined) {
        const sl = d.slot, pick = await GearUI.choose(u, sl);   // -1 closed, 0 take it off, else the piece id
        if (pick === 0) { u.eq[sl] = null; }
        else if (pick !== -1) {
          const p = pick;
          if (u.eq && u.eq[sl] === p) return api.redraw();
          if (!Flow.hasFree(p)) { const other = Flow.allCreatures().find(x => x !== u && x.eq && x.eq[sl] === p); if (other) other.eq[sl] = null; }
          u.eq[sl] = p; Flow.sfx("menuOk");
        }
        return api.redraw();
      }
      if (d.skill !== undefined) {
        const keys = G.book.slice(); if (!keys.length) { msg = "No moves unlocked yet. Gather 10 of a material and unlock it in the Skill Book."; return api.redraw(); }
        const i = await UI.choose(`Off-style move for ${u.name}`, [{ label: "None" }].concat(keys.map(k => ({ label: Data.BOOK[k].n, info: Data.BOOK[k].d }))), { back: true });
        if (i === 0) u.slot = null; else if (i > 0) u.slot = keys[i - 1];
        return api.redraw();
      }
    },
    keys: (e, api) => {
      const k = e.key, n = roster().length;
      if (k === "ArrowRight") cur = (cur + 1) % n; else if (k === "ArrowLeft") cur = (cur + n - 1) % n;
      else if (/^[1-9]$/.test(k)) cur = Math.min(n - 1, +k - 1);
      else if (k === "ArrowDown") sel = (sel + 1) % Core.STATS.length; else if (k === "ArrowUp") sel = (sel + Core.STATS.length - 1) % Core.STATS.length;
      else if ((k === "Enter" || k === " " || k === "+") && api.tab === 0) { const u = roster()[cur]; if (loaner()) UI.toast(LOANER_LINE, 3200); else if (u.points && !u.guest) Core.spendPoint(u, Core.STATS[sel]); }
      else return;
      api.redraw();
    },
  });
}
