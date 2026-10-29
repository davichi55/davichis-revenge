// Party screen: your team and the Menagerie Wagon creatures. Tabs: Stats (3 points per level, no caps), Moves, Gear (3 slots, set bonuses), Skill (one off-style move).
// Built on the shared UI layer (src/ui/ui.js). Keys: Left/Right or 1-9 switch creature, Q/R tabs, Up/Down pick a stat, Enter adds a point, Esc closes.
"use strict";
const STAT_INFO = {
  hp: "How much damage it can take.", atk: "Damage of basic attacks and physical moves.", pow: "Spell damage and how much heals restore.",
  def: "Less physical damage taken.", res: "Less spell damage taken, and shrugging off status effects.",
  spd: "Who acts first. At 2x the enemy's speed: +1 action per turn.", foc: "Starting MP in a fight: +1 MP per 10 Focus.",
  lck: "Critical hits, and the chance your status effects land.",
};
function partyScreen(startAt = 0) {
  const esc = UI.esc;
  let cur = Math.max(0, startAt), sel = 0, msg = "";
  const roster = () => G.party.concat(G.collection || []);
  const style = u => { try { return Core.CREATURES[u.id].styleName || ""; } catch (e) { return ""; } };
  const moveBox = m => { const d = Core.MOVES[m]; if (!d) return `<div class="row"><div class="g">${esc(m)}</div></div>`; return `<div class="row"><div class="g">${esc(d.name)}<small>${esc(d.desc || "")}</small></div><span style="color:#6fb7ff">${d.basic ? "+1 MP" : d.hpCost ? "15% HP" : (d.mp || 0) + " MP"}</span></div>`; };
  const gearMsg = u => { const a = Flow.activeBonus(u); return a ? `${Data.SETS[a.set].n}: ${a.b.n} (${a.level === 2 ? "full" : "2-piece, half strength"})` : "No set bonus yet. Two pieces of one set give half the bonus, three give all of it."; };
  return UI.window("Party", (body, api, tab) => {
    const R = roster(); cur = Math.min(cur, R.length - 1); const u = R[cur], c = (Core.CREATURES && Core.CREATURES[u.id]) || {};
    const maxStat = Math.max(20, ...Core.STATS.map(k => u.stats[k]));
    const list = `<div style="display:grid;gap:8px;align-content:start">${R.map((p, i) => `<button class="row${i === cur ? " sel" : ""}" data-c="${i}" style="text-align:left;color:inherit;font:inherit;cursor:pointer;margin:0"><div style="width:56px;height:50px;display:grid;place-items:center">${UI.art(p.id)}</div><div class="g">${esc(p.name)}<small>${esc(style(p))} · Lv ${p.level}${i >= G.party.length ? " · wagon" : ""}</small>${(() => `<div style="height:5px;background:#000;margin-top:3px"><i style="display:block;height:100%;width:${100 * p.hp / p.maxHp}%;background:#58c26a"></i></div>`)()}${p.points ? `<span style="background:#f2c14e;color:#1b130e;font-size:12px;padding:0 6px;border-radius:3px">+${p.points} points</span>` : ""}</div></button>`).join("")}</div>`;
    const head = `<div style="display:flex;gap:14px;align-items:center;margin-bottom:12px"><div style="width:120px;height:104px;display:grid;place-items:center;background:radial-gradient(circle at 50% 70%,#3a2614,#1b130e 70%);border:1px solid #3a2a1a">${UI.art(u.id, 50)}</div>
      <div><div style="font-family:'Marcellus SC',serif;font-size:28px;color:#f2c14e">${esc(u.name)}</div><div style="color:#b7a58a">${esc(style(u))} · Level ${u.level} · HP ${u.hp}/${u.maxHp} · starts with ${Math.floor(u.stats.foc / 10)} MP</div>
      <div style="color:#b7a58a;font-size:14px;margin-top:2px">${esc(c.passiveName || "")}</div><div style="color:#b7a58a;font-size:13px">XP ${u.xp} / ${Core.xpToNext(u.level)}</div></div></div>`;
    let main = "";
    const note = msg ? `<div style="color:#f2c14e;margin-bottom:8px">${esc(msg)}</div>` : "";
    if (tab === 0) {
      main = `<h3>Stats <span style="font-family:Marcellus;font-size:14px;color:#b7a58a;float:right">${u.points ? u.points + " points to spend" : "3 points per level"}</span></h3>`
        + Core.STATS.map((k, i) => `<div class="row${i === sel ? " sel" : ""}" data-s="${i}" style="margin-bottom:3px"><span style="width:100px">${Core.STAT_NAMES[k]}</span><b style="width:36px;text-align:right">${u.stats[k]}</b><div style="flex:1;height:8px;background:#000"><i style="display:block;height:100%;width:${100 * u.stats[k] / maxStat}%;background:linear-gradient(90deg,#8a5a2a,#f2c14e)"></i></div><button class="b" data-add="${i}" ${u.points ? "" : "disabled"}>+</button></div>`).join("")
        + `<div style="color:#b7a58a;font-size:14px;margin-top:6px;min-height:2.4em">${Core.STAT_NAMES[Core.STATS[sel]]}: ${STAT_INFO[Core.STATS[sel]]}</div>`;
    } else if (tab === 1) {
      const mv = Core.movesOf(u); const nxt = (Core.STYLE_MOVES[u.style] || []).map(m => Core.MOVES[m]).find(m => m && m.lvl > u.level);
      main = `<h3>Moves <span style="font-family:Marcellus;font-size:14px;color:#b7a58a;float:right">${mv.length} learned</span></h3>${mv.map(moveBox).join("")}${nxt ? `<div style="color:#b7a58a;margin-top:6px">Next move: ${esc(nxt.name)} at level ${nxt.lvl}</div>` : ""}`;
    } else if (tab === 2) {
      const a = Flow.activeBonus(u), cnt = Flow.setCounts(u);
      main = note + `<h3>Gear</h3>` + Data.SLOTS.map(sl => { const pid = u.eq && u.eq[sl]; return `<div class="row"><div class="g">${Data.SLOT_NAMES[sl]}<small>${pid ? esc(Data.pieceName(pid)) + " · " + esc(Data.SETS[pid.split(".")[0]].n) : "empty"}</small></div><button class="b" data-slot="${sl}">${pid ? "Change" : "Equip"}</button></div>`; }).join("")
        + `<h3 style="margin-top:12px">Set bonus</h3><div style="color:#b7a58a;margin-bottom:6px">${esc(gearMsg(u))}</div>`
        + Object.keys(cnt).filter(s => cnt[s] >= 2).map(s => Data.SETS[s].b.map((b, bi) => { const on = (u.sb && u.sb[s] != null ? u.sb[s] : 0) === bi; return `<button class="row${on ? " sel" : ""}" data-sb="${s}:${bi}" style="width:100%;text-align:left;color:inherit;font:inherit;cursor:pointer"><div class="g">${esc(b.n)}<small>${esc(cnt[s] >= 3 ? b.d : "Half strength: " + b.d2)}</small></div>${on ? "<b style='color:#f2c14e'>chosen</b>" : ""}</button>`; }).join("")).join("") + (Object.values(cnt).some(n => n >= 2) ? `<div style="color:#b7a58a;font-size:13px">Change the bonus any time outside a fight.</div>` : "");
    } else {
      const slot = u.slot && Data.BOOK[u.slot];
      main = note + `<h3>Off-style move</h3><div style="color:#b7a58a;margin-bottom:8px">One move from the Skill Book can ride along in this slot. It costs the normal amount but has none of the style's bonus effects.</div>
        <div class="row"><div class="g">${slot ? esc(slot.n) : "Empty"}<small>${slot ? esc(slot.d) : "Nothing equipped."}</small></div><button class="b" data-skill="1">${slot ? "Change" : "Equip"}</button></div>`
        + (slot && !(Core.MOVES && Core.MOVES[slot.move]) ? `<div style="color:#ff6b57;font-size:14px">The battle rules do not know this move yet; it will start working when they do.</div>` : "");
    }
    body.innerHTML = `<div style="display:grid;grid-template-columns:250px 1fr;gap:18px">${list}<div>${head}${main}</div></div>`;
  }, {
    tabs: ["Stats", "Moves", "Gear", "Skill"],
    gold: () => `${G.gold} kakal`, foot: "Left/Right switch creature, Q / R switch tabs, Up/Down pick a stat, Enter adds a point, Esc closes.",
    click: async (e, api) => {
      const t = e.target.closest("[data-c],[data-add],[data-s],[data-slot],[data-sb],[data-skill]"); if (!t) return; const d = t.dataset, R = roster(), u = R[cur]; msg = "";
      if (d.c !== undefined) { cur = +d.c; return api.redraw(); }
      if (d.s !== undefined && d.add === undefined) { sel = +d.s; return api.redraw(); }
      if (d.add !== undefined) { if (u.points) { Core.spendPoint(u, Core.STATS[+d.add]); sel = +d.add; Flow.sfx("menuOk"); } return api.redraw(); }
      if (d.sb !== undefined) { const [s, i] = d.sb.split(":"); u.sb = u.sb || {}; u.sb[s] = +i; return api.redraw(); }
      if (d.slot !== undefined) {
        const sl = d.slot, pieces = Object.keys(G.owned).filter(p => G.owned[p] > 0 && p.split(".")[1] === sl);
        const opts = [{ label: "Take it off" }].concat(pieces.map(p => { const free = Flow.hasFree(p), mine = u.eq && u.eq[sl] === p; return { label: `${Data.pieceName(p)}  (${Data.SETS[p.split(".")[0]].n})${mine ? "  [worn]" : free ? "" : "  [worn by another: swap]"}`, disabled: mine }; }));
        const i = await UI.choose(`${Data.SLOT_NAMES[sl]} for ${u.name}`, opts, { back: true });
        if (i === 0) { u.eq[sl] = null; }
        else if (i > 0) {
          const p = pieces[i - 1];
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
      else if ((k === "Enter" || k === " " || k === "+") && api.tab === 0) { const u = roster()[cur]; if (u.points) Core.spendPoint(u, Core.STATS[sel]); }
      else return;
      api.redraw();
    },
  });
}
