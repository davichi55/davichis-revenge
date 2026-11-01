// Achievements (2026-11-01, Danny: "it can make it more obvious if you have completed the whole game ... especially a 'kill all bosses'").
// Journal > Achievements: every achievement with its progress; the checklist ones open to show what is done (by name) and what is missing ("???" with a level hint).
// Everything is read from the save as it is (G.best, G.flags, G.owned, G.book, G.quests, creatures' evoU), so an older save gets what it already earned.
// G.ach[id] = the chapter it was earned in. Checked after every won fight, finished quest, area change, opened chest and menu; a toast when one is earned.
// Loaded after harvest.js.
"use strict";
(function () {
  const D = window.Data, U = window.Systems && Systems.ui, F0 = window.Flow;
  if (!U) return;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const E = () => Core.ENEMIES, META = () => Core.BOSS_META || {};
  const beaten = id => !!(G.best[id] && G.best[id].beaten);
  const nameOf = id => (E()[id] && E()[id].name) || id;
  const LV = { mazeGuardian: 8, bountyHunter: 13, raidOptioKarvan: 5, duneBearer: 10 };   // bosses without a BOSS_META level
  const lvOf = id => (META()[id] && META()[id].lv) || LV[id] || null;
  const uniq = a => [...new Set(a)];
  const has = (fn, ...a) => { try { return fn(...a); } catch (e) { return false; } };

  // ---------- the boss lists (built once, from the rules) ----------
  let L = null;
  function lists() {
    if (L) return L;
    const M = META(), ids = Object.keys(M).filter(id => E()[id]), kind = k => ids.filter(id => M[id].kind === k);
    const titans = uniq(ids.filter(id => /titan/i.test(M[id].kind)).concat(Object.keys(E()).filter(id => E()[id].titan && E()[id].boss)));
    const legends = uniq(Object.values(D.LEGENDS || {}).map(l => l.enemy).filter(id => E()[id]));
    const cups = kind("cup");
    const optional = uniq(kind("guardian").concat(["mazeGuardian", "bountyHunter"]).filter(id => E()[id] && id !== "harvestEngine"));
    const story = uniq(["raidOptioKarvan", "duneBearer"].concat(kind("mid"), kind("end")).filter(id => E()[id] && id !== "harvestEngine" && !titans.includes(id)));
    const all = uniq(story.concat(titans, legends, cups, optional, ["harvestEngine"]));
    return (L = { titans, legends, cups, optional, story, all });
  }
  // the collared generals are counted by their story slot (flag gen.freed.<n>); which creature stands in a slot depends on your pack (Story.generalFor)
  const genSlots = () => { const out = []; for (let n = 1; n <= 30; n++) { const g = has(window.Story.generalFor, n); if (g) out.push([n, g]); } return out; };
  const genList = () => genSlots().map(([n, g]) => { const ok = !!G.flags["gen.freed." + n]; return [ok ? (g.name || nameOf(g.id) || ("General " + n)) : "??? (general " + n + ")", ok]; });
  // ---------- area creatures, chests, gear ----------
  const areaKinds = () => uniq(Object.keys(World.REGIONS || {}).flatMap(r => has(World.areaFoes, r) || []));
  const chestIds = () => uniq(Object.values(World.REGIONS || {}).flatMap(r => (r.chests || []).map(c => c.id)));
  const setDone = s => D.SLOTS.every(sl => F0.owned(D.pieceId(s, sl)));
  const myCreatures = () => (G.party || []).concat(G.collection || []);
  const sideQuests = () => Object.keys(D.QUESTS).filter(q => !D.QUESTS[q].main && !/^bounty|^m_/.test(q));
  const bounties = () => Object.keys(D.QUESTS).filter(q => /^bounty\d+$/.test(q));

  // ---------- the achievements: p() -> { have, total, items?: [[label, done]] } ----------
  const bossItems = ids => ids.slice().sort((a, b) => (lvOf(a) || 0) - (lvOf(b) || 0)).map(id => [beaten(id) ? nameOf(id) : "???" + (lvOf(id) ? " (level " + lvOf(id) + ")" : ""), beaten(id)]);
  const fromItems = items => ({ have: items.filter(i => i[1]).length, total: items.length, items });
  const bossList = ids => fromItems(bossItems(ids));
  const A = [
    { id: "story", n: "The First Count", d: "Finish the story.", p: () => ({ have: G.flags["epilogue.done"] ? 1 : 0, total: 1 }) },
    { id: "bossAll", n: "Kill All Bosses", d: "Beat every boss in the world: story, Titans, legends, optional bosses, arena champions and generals.", p: () => fromItems(bossItems(lists().all).concat(genList())), list: 1 },
    { id: "titans", n: "Titan Breaker", d: "Beat every Titan.", p: () => bossList(lists().titans), list: 1 },
    { id: "legends", n: "Legend Hunter", d: "Beat every legend that walks the world.", p: () => bossList(lists().legends), list: 1 },
    { id: "optional", n: "Off the Beaten Road", d: "Beat every optional boss and guardian.", p: () => bossList(lists().optional), list: 1 },
    { id: "cups", n: "Hundred Banners", d: "Beat every arena champion.", p: () => bossList(lists().cups), list: 1 },
    { id: "generals", n: "Unchained", d: "Beat every collared general.", p: () => fromItems(genList()), list: 1 },
    { id: "engine", n: "Yield Insufficient", d: "Stop the Harvest Engine.", p: () => ({ have: G.flags["x.harvestEngine"] ? 1 : 0, total: 1 }) },
    { id: "areas", n: "Every Kind", d: "Meet every creature that lives in every area.", p: () => { const k = areaKinds(); return { have: k.filter(i => G.best[i] && G.best[i].seen).length, total: k.length }; } },
    { id: "chests", n: "Nothing Left Behind", d: "Open every chest.", p: () => { const c = chestIds(); return { have: c.filter(i => G.flags["chest." + i]).length, total: c.length }; } },
    { id: "gearOne", n: "Dressed for It", d: "Complete a gear set.", p: () => ({ have: Object.keys(D.SETS).some(setDone) ? 1 : 0, total: 1 }) },
    { id: "gearAll", n: "The Armoury", d: "Complete every gear set.", p: () => { const s = Object.keys(D.SETS); return { have: s.filter(setDone).length, total: s.length, items: s.map(k => [setDone(k) ? D.SETS[k].n : "??? (" + D.SLOTS.filter(sl => F0.owned(D.pieceId(k, sl))).length + "/3)", setDone(k)]) }; }, list: 1 },
    { id: "book", n: "Well Read", d: "Unlock every Skill Book move.", p: () => { const b = Object.keys(D.BOOK); return { have: b.filter(k => G.book.includes(k)).length, total: b.length, items: b.map(k => [G.book.includes(k) ? D.BOOK[k].n : "???", G.book.includes(k)]) }; }, list: 1 },
    { id: "evoOne", n: "Something New", d: "Unlock an evolution form.", p: () => ({ have: myCreatures().some(u => (u.evoU || []).length) ? 1 : 0, total: 1 }) },
    { id: "evoSix", n: "Six Faces", d: "Unlock all six forms of one creature.", p: () => ({ have: Math.min(6, Math.max(0, ...myCreatures().map(u => (u.evoU || []).length))), total: 6 }) },
    { id: "side", n: "Good Neighbour", d: "Finish every side quest.", p: () => { const q = sideQuests(); return { have: q.filter(i => G.quests[i] === "done").length, total: q.length, items: q.map(i => [G.quests[i] === "done" ? D.QUESTS[i].t : G.quests[i] !== undefined ? D.QUESTS[i].t + " (in progress)" : "???", G.quests[i] === "done"]) }; }, list: 1 },
    { id: "bounties", n: "On the Board", d: "Finish every bounty.", p: () => { const q = bounties(); return { have: q.filter(i => G.quests[i] === "done").length, total: q.length, items: q.map(i => [G.quests[i] === "done" ? D.QUESTS[i].t : G.quests[i] !== undefined ? D.QUESTS[i].t + " (in progress)" : "??? (chapter " + (D.QUESTS[i].ch || "?") + ")", G.quests[i] === "done"]) }; }, list: 1 },
  ];
  A.push({ id: "all", n: "The Whole Count", d: "Earn every other achievement.", p: () => { const o = A.filter(a => a.id !== "all"); return { have: o.filter(a => done(a)).length, total: o.length }; } });
  const prog = a => { const r = has(a.p); return r || { have: 0, total: 1 }; };
  const done = a => { const r = prog(a); return r.total > 0 && r.have >= r.total; };

  // ---------- earning ----------
  S_check();
  function S_check(quiet) {
    if (typeof G === "undefined" || !G || !G.best) return;
    G.ach = G.ach || {};
    const first = !G.achInit; let n = 0;
    for (const a of A) { if (G.ach[a.id] || !done(a)) continue; G.ach[a.id] = G.ch || 1; n++; if (!first && !quiet) UI.toast("Achievement: " + a.n, 4200); }
    if (first) { G.achInit = true; if (n) UI.toast(n + (n === 1 ? " achievement" : " achievements") + " already earned. See Journal > Achievements.", 4200); }
  }
  window.Achievements = { list: A, check: S_check, progress: prog, done };
  const later = () => setTimeout(() => S_check(), 50);
  const vic = F0.victory; F0.victory = async (foes, opts) => { const r = await vic(foes, opts); later(); return r; };
  const qd = F0.questDone; F0.questDone = id => { qd(id); later(); };
  const ent = F0.enter; F0.enter = function () { const r = ent.apply(this, arguments); later(); return r; };
  const hc = F0.hookChest; F0.hookChest = id => Promise.resolve(hc(id)).then(r => { later(); return r; });
  const ng = F0.newGame; if (ng) F0.newGame = function () { const r = ng.apply(this, arguments); G.ach = {}; G.achInit = true; return r; };

  // ---------- Journal tab ----------
  U.SUBS.push("Achievements");
  const TAB = U.SUBS.length - 1;
  U.achOpen = null;
  const jh = U.journalHtml; U.journalHtml = foot => {
    if (U.jt !== TAB) return jh(foot);
    S_check(true);
    let h = foot + `<div style="margin-bottom:10px">${U.SUBS.map((s, i) => `<button class="tab${i === U.jt ? " on" : ""}" data-sj="tab:${i}">${s}</button>`).join(" ")}</div>`;
    const got = A.filter(a => G.ach[a.id]).length;
    h += `<div style="color:#b7a58a;margin-bottom:8px">${got} of ${A.length} earned. Click one with a list to see what is still missing.</div>`;
    h += A.map(a => {
      const r = prog(a), ok = !!G.ach[a.id], pct = Math.round(100 * Math.min(1, r.have / Math.max(1, r.total))), open = U.achOpen === a.id && r.items;
      const head = `<div class="row"${a.list ? ` data-sj="ach:${a.id}" style="cursor:pointer"` : ""}><div class="g"><b style="font-weight:400;color:${ok ? "#7ee081" : "#f4e9d4"}">${ok ? "★ " : "☆ "}${esc(a.n)}</b>`
        + ` <small style="display:inline;color:${ok ? "#7ee081" : "#f2c14e"}">${r.total > 1 ? r.have + " / " + r.total : ok ? "earned" : "not yet"}${ok && G.ach[a.id] ? " · chapter " + G.ach[a.id] : ""}</small>`
        + `<small>${esc(a.d)}${a.list ? (open ? " ▲" : " ▼") : ""}</small>`
        + (r.total > 1 ? `<div style="height:5px;background:#2a1f18;border-radius:3px;margin-top:4px"><i style="display:block;height:5px;width:${pct}%;background:${ok ? "#7ee081" : "#c8962e"};border-radius:3px"></i></div>` : "") + `</div></div>`;
      if (!open) return head;
      const items = r.items.slice().sort((x, y) => (x[1] === y[1] ? 0 : x[1] ? 1 : -1));   // missing first
      return head + `<div style="margin:-4px 0 8px 14px;columns:2;column-gap:18px;font-size:14px">${items.map(([t, d]) => `<div style="color:${d ? "#7ee081" : "#8a7a66"}">${d ? "✓" : "·"} ${esc(t)}</div>`).join("")}</div>`;
    }).join("");
    return h;
  };
  const jc = U.journalClick; U.journalClick = d => {
    const [k, v] = String(d).split(":");
    if (k === "ach") { U.achOpen = U.achOpen === v ? null : v; return true; }
    return jc(d);
  };
})();
