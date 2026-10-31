// Menus: main menu (Party / Items / Journal / System), shops, battle results, party swap, skill book, bestiary, settings.
"use strict";
const Menus = (() => {
  const esc = UI.esc, M = {};
  // Items > materials and goods (Danny 2026-10-31): what each thing is for. Materials name their skill-book move and progress; goods their base value and any active quest that asks for them
  const WANTS = { lanterns: { lanternWick: 4 }, needle: { adderFang: 5, wraithQuill: 1 }, ring3: { saltCrystal: 3 }, bounty2: { automatonCore: 3 } };
  function itemInfoRows() {
    const book = {}; Object.values(Data.BOOK || {}).forEach(b => (book[b.mat] = b));
    const wanted = k => Object.keys(G.quests).filter(q => G.quests[q] !== "done" && Data.QUESTS[q]).filter(q => ((Data.QUESTS[q].wants || WANTS[q] || {})[k])).map(q => `${Data.QUESTS[q].t} (${(Data.QUESTS[q].wants || WANTS[q])[k]})`);
    const row = (name, n, line, tag) => `<div class="row"><div class="g">${esc(name)} <small style="display:inline;color:#f2c14e">x${n}</small><small>${line}</small></div>${tag ? `<span style="color:#8fe0a0;font-size:14px;white-space:nowrap">${tag}</span>` : ""}</div>`;
    const mats = Object.keys(G.mats).filter(k => G.mats[k] > 0).map(k => { const b = book[k]; return row(Data.MATS[k][0], G.mats[k], b ? `Skill book: ${esc(b.n)} (${Math.min(G.mats[k], b.need)}/${b.need})${G.book.includes(Object.keys(Data.BOOK).find(x => Data.BOOK[x] === b)) ? " · unlocked" : ""}` : esc(Data.MATS[k][1] || ""), b ? "skill book" : ""); });
    const goods = Object.keys(G.goods).filter(k => G.goods[k] > 0).map(k => { const w = wanted(k); return row(Data.GOODS[k][0], G.goods[k], `Sells for about ${Data.GOODS[k][1]} kakal each${w.length ? " · Wanted: " + esc(w.join(", ")) : ""}`, w.length ? "wanted" : ""); });
    return mats.concat(goods).join("") || `<div class="row"><div class="g">None yet.</div></div>`;
  }
  const bar = (f, c = "#58c26a") => `<div style="height:6px;background:#000;margin-top:3px"><i style="display:block;height:100%;width:${Math.max(0, Math.min(100, f * 100))}%;background:${c}"></i></div>`;
  const gold = () => `${G.gold} kakal`;
  const itemName = k => (Data.ITEMS[k] && Data.ITEMS[k].n) || (Data.MATS[k] && Data.MATS[k][0]) || (Data.GOODS[k] && Data.GOODS[k][0]) || k;
  const pretty = id => id.replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase());
  M.itemName = itemName;

  // ---------- battle results ----------
  M.results = ({ xp, gold: g, ups, drops, boss, titan }) => UI.window(titan ? "Victory over a Titan" : "Victory!", body => {
    const dropList = Object.entries(drops).map(([n, c]) => `${esc(n)} x${c}`).join(", ") || "nothing this time";
    body.innerHTML = `<h3>Rewards</h3><div class="row"><div class="g">Experience<small>every creature in the party${G.collection.length ? " (and the wagon at a share)" : ""}</small></div><b>+${xp} XP</b></div>
      <div class="row"><div class="g">Kakal</div><b>+${g}</b></div><div class="row"><div class="g">Drops<small>${dropList}</small></div></div>
      ${ups.length ? `<h3 style="margin-top:14px">Level up!</h3>` + ups.map(u => `<div class="row"><div class="g">${esc(u.u.name)} reached level ${u.level}<small>+3 stat points${u.learned && u.learned.length ? `. <span style="color:#f2c14e">New move: ${u.learned.map(esc).join(", ")}!</span>` : ""}</small></div></div>`).join("") : ""}`;
    if (ups.length) UI.toast("Level up!", 2600);
  }, { closeLabel: "Continue (Enter)", gold, keys: (e, api) => { if (e.key === "Enter" || e.key === " ") api.close(); } });

  // ---------- shop ----------
  M.shop = key => {
    const sh = Data.SHOPS[key]; if (!sh) return Promise.resolve();
    let sel = 0, msg = "";
    const tier = () => (sh.tier != null ? sh.tier : Flow.tier());
    const price = k => { const d = Data.priceOf(k, tier()); const m = sh.disc && sh.disc[k]; return Math.max(1, Math.round(d * (m || 1))); };
    const buyRows = () => {
      const rows = [];
      sh.stock.forEach(s => {
        if (s.startsWith("gear:")) {
          const set = s.slice(5), slots = Data.SLOTS, cnt = slots.map(sl => Flow.owned(Data.pieceId(set, sl))), min = Math.min(...cnt), idx = cnt.findIndex(c => c === min);
          const prices = sh.gearPrice[set]; rows.push({ kind: "gear", set, slot: slots[idx], name: Data.SETS[set].pieces[idx], sub: `${Data.SETS[set].n} (${Data.SLOTS[idx]})`, price: prices[idx], owned: cnt[idx] });
        } else rows.push({ kind: "item", key: s, name: itemName(s), sub: Data.ITEMS[s].d, price: price(s), owned: G.items[s] || 0 });
      });
      return rows;
    };
    const sellRows = () => Object.keys(G.goods).filter(k => G.goods[k] > 0).map(k => ({ key: k, name: Data.GOODS[k][0], n: G.goods[k], price: Math.max(1, Math.round(Data.GOODS[k][1] * (sh.buys || 1))) }));
    return UI.window(sh.n, (body, api, tab) => {
      const rows = tab === 0 ? buyRows() : sellRows(); sel = Math.min(sel, Math.max(0, rows.length - 1));
      const head = `<div style="color:#b7a58a;margin-bottom:8px">${msg || (tab === 0 ? "Enter or click Buy. Shift+click or A buys five." : `Trade goods sell at ${Math.round((sh.buys || 1) * 100)}% here. Potions, gear and materials cannot be sold.`)}</div>`;
      if (tab === 0) body.innerHTML = head + rows.map((r, i) => `<div class="row${i === sel ? " sel" : ""}" data-r="${i}"><div class="g">${esc(r.name)}<small>${esc(r.sub)}${r.kind === "gear" ? "" : ""}</small></div><span style="color:#b7a58a">own ${r.owned}</span><b style="min-width:80px;text-align:right">${r.price} kal</b><button class="b" data-buy="${i}" ${G.gold < r.price ? "disabled" : ""}>Buy</button>${r.kind === "item" ? `<button class="b" data-buy5="${i}" ${G.gold < r.price * 5 ? "disabled" : ""}>x5</button>` : ""}</div>`).join("");
      else body.innerHTML = head + (rows.length ? rows.map((r, i) => `<div class="row${i === sel ? " sel" : ""}" data-r="${i}"><div class="g">${esc(r.name)}<small>you have ${r.n}</small></div><b>${r.price} kal each</b><button class="b" data-sell="${i}">Sell 1</button><button class="b" data-sellall="${i}">Sell all</button></div>`).join("") : `<div class="row"><div class="g">You have no trade goods. Enemies drop them: shells, fangs, coins.</div></div>`);
    }, {
      tabs: ["Buy", "Sell"], gold, foot: "Up/Down select, Enter buy or sell, Q/R switch tabs, Esc leave.",
      click: (e, api) => {
        const t = e.target.closest("[data-buy],[data-buy5],[data-sell],[data-sellall],[data-r]"); if (!t) return;
        if (t.dataset.r !== undefined && !t.dataset.buy) { sel = +t.dataset.r; }
        const d = t.dataset; act(api, d.buy !== undefined ? ["buy", +d.buy, 1] : d.buy5 !== undefined ? ["buy", +d.buy5, 5] : d.sell !== undefined ? ["sell", +d.sell, 1] : d.sellall !== undefined ? ["sell", +d.sellall, 999] : null);
        api.redraw();
      },
      keys: (e, api) => {
        const rows = api.tab === 0 ? buyRows() : sellRows(), k = e.key;
        if (k === "ArrowDown") sel = Math.min(rows.length - 1, sel + 1); else if (k === "ArrowUp") sel = Math.max(0, sel - 1);
        else if (k === "ArrowLeft") api.tab = 0; else if (k === "ArrowRight") api.tab = 1;
        else if (k === "Enter" || k === " ") act(api, [api.tab === 0 ? "buy" : "sell", sel, 1]);
        else if (k === "a" || k === "A") act(api, [api.tab === 0 ? "buy" : "sell", sel, 5]);
        api.redraw();
      },
    });
    function act(api, a) {
      if (!a) return; const [kind, i, n] = a;
      if (kind === "buy") {
        const r = buyRows()[i]; if (!r) return;
        for (let c = 0; c < n; c++) {
          if (G.gold < r.price) { msg = "Not enough kakal."; break; }
          if (r.kind === "item") Flow.give(r.key, 1, true); else { const pid = Data.pieceId(r.set, r.slot); G.owned[pid] = (G.owned[pid] || 0) + 1; }
          G.gold -= r.price; msg = `Bought ${r.name}.`; Flow.sfx("coin"); if (r.kind === "gear") break;
          if (r.kind === "item" && n > 1) { /* same price each */ }
        }
      } else {
        const r = sellRows()[i]; if (!r) return; const c = Math.min(n, r.n);
        G.goods[r.key] -= c; G.gold += c * r.price; msg = `Sold ${c} ${r.name} for ${c * r.price} kakal.`; Flow.sfx("coin");
      }
    }
  };

  // ---------- helpers: pick a creature ----------
  const pickCreature = (title, filter) => {
    const list = Flow.allCreatures().filter(filter || (() => true));
    if (!list.length) return Promise.resolve(null);
    return UI.choose(title, list.map(u => ({ label: `${u.name}  Lv${u.level}  ${u.hp}/${u.maxHp}${u.alive ? "" : "  (fallen)"}` })), { back: true }).then(i => (i < 0 ? null : list[i]));
  };

  // ---------- main menu ----------
  M.main = () => {
    let jt = 0, msg = "";
    const TABS = ["Party", "Items", "Journal", "System"]; if (G.flags.ferryPass && window.Systems && Systems.ui) TABS.splice(3, 0, "Travel"); Systems.ui && (Systems.ui.jt = 0, Systems.ui.page = 0);
    const win = UI.window("Menu", (body, api, tab) => {
      const foot = msg ? `<div style="color:#f2c14e;margin-bottom:8px">${esc(msg)}</div>` : "";
      const tn = TABS[tab];
      if (tab === 0) {
        const card = (u, i, wagon) => `<div class="row"><div style="width:62px;height:54px;display:grid;place-items:center">${UI.art(u.id)}</div><div class="g"><b style="font-weight:400;font-size:19px">${esc(u.name)}</b> <small style="display:inline">${esc(Core.CREATURES[u.id] ? Core.CREATURES[u.id].styleName || "" : "")} Lv ${u.level}${u.points ? ` · <span style="color:#f2c14e">+${u.points} points</span>` : ""}</small>${bar(u.hp / u.maxHp)}<small>HP ${u.hp}/${u.maxHp}${u.alive ? "" : " (fallen)"}</small></div><button class="b" data-d="${wagon ? "w" : "p"}${i}">Details</button>${wagon ? `<button class="b" data-sw="${i}">Swap in</button>` : ""}</div>`;
        body.innerHTML = foot + `<h3>Your team</h3>` + G.party.map((u, i) => card(u, i, false)).join("") + `<h3 style="margin-top:12px">The Menagerie Wagon</h3>` + (G.collection.length ? G.collection.map((u, i) => card(u, i, true)).join("") : `<div class="row"><div class="g">Empty. Freed creatures wait here and gain some experience while you fight.<small>Keys from the old dungeons free one cage each.</small></div></div>`)
          + `<div class="row"><div class="g">Party order<small>Reorder your three by swapping two of them.</small></div><button class="b" data-order="1">Swap order</button></div>`;
      } else if (tab === 1) {
        const names = ["respecStone", "sunwater", "ember", "antidote", "tonic", "incense", "candle", "cinderBomb", "rimeFlask", "soakJar", "sparkJar", "venomPot"];
        const has = names.filter(k => G.items[k] > 0);
        body.innerHTML = foot + `<h3>Items</h3>` + (has.length ? has.map(k => { const d = Data.ITEMS[k]; return `<div class="row"><div class="g">${esc(d.n)} x${G.items[k]}<small>${esc(d.d)}</small></div>${d.use ? `<button class="b" data-use="${k}">Use</button>` : `<small>in battle</small>`}</div>`; }).join("") : `<div class="row"><div class="g">No consumables. Shops sell Sunwater Flasks.</div></div>`)
          + `<h3 style="margin-top:12px">Key items</h3>` + (Object.keys(Data.ITEMS).filter(k => Data.ITEMS[k].key && G.items[k] > 0).map(k => `<div class="row"><div class="g">${esc(Data.ITEMS[k].n)}<small>${esc(Data.ITEMS[k].d)}</small></div></div>`).join("") || `<div class="row"><div class="g">None.</div></div>`)
          + (window.Systems && Systems.ui ? Systems.ui.charmsHtml() : "") + `<h3 style="margin-top:12px">Skill Book</h3><div style="color:#b7a58a;margin-bottom:6px">Collect materials, unlock moves. Any creature can carry one off-style move (Party > Skill).</div>`
          + Object.entries(Data.BOOK).map(([k, b]) => { const have = G.mats[b.mat] || 0, un = G.book.includes(k); return `<div class="row"><div class="g">${esc(b.n)}<small>${esc(b.d)}</small><small>${esc(Data.MATS[b.mat][0])}: ${Math.min(have, b.need)}/${b.need}${have > b.need ? " (+" + (have - b.need) + " spare)" : ""}</small></div>${un ? `<b style="color:#7ee081">Unlocked</b>` : `<button class="b" data-unlock="${k}" ${have >= b.need ? "" : "disabled"}>Unlock</button>`}</div>`; }).join("")
          + `<h3 style="margin-top:12px">Gear</h3>` + (window.GearUI && GearUI.listHtml ? GearUI.listHtml() : "")
          + `<h3 style="margin-top:12px">Materials and trade goods</h3>` + itemInfoRows();
      } else if (tn === "Journal" && window.Systems && Systems.ui) {
        body.innerHTML = Systems.ui.journalHtml(foot);
      } else if (tn === "Travel") {
        body.innerHTML = Systems.ui.travelHtml(foot);
      } else if (tab === 2) {
        const sub = ["Quests", "Rumours", "Bestiary"];
        let h = foot + `<div style="margin-bottom:10px">${sub.map((s, i) => `<button class="tab${i === jt ? " on" : ""}" data-jt="${i}">${s}</button>`).join(" ")}</div>`;
        if (jt === 0) {
          const ids = Object.keys(G.quests), act = ids.filter(i => G.quests[i] !== "done"), done = ids.filter(i => G.quests[i] === "done");
          h += `<h3>Active</h3>` + (act.length ? act.map(i => { const q = Data.QUESTS[i]; return `<div class="row"><div class="g">${esc(q.t)}${q.main ? ` <small style="display:inline;color:#f2c14e">main</small>` : ""}<small>${esc(q.steps[G.quests[i]] || "")}</small></div></div>`; }).join("") : `<div class="row"><div class="g">Nothing active.</div></div>`)
            + `<h3 style="margin-top:12px">Done</h3>` + (done.map(i => `<div class="row"><div class="g" style="color:#b7a58a">${esc(Data.QUESTS[i].t)}</div></div>`).join("") || `<div class="row"><div class="g">None yet.</div></div>`);
        } else if (jt === 1) {
          const towns = Object.keys(G.rumours).filter(t => G.rumours[t].length);
          h += towns.length ? towns.map(t => `<h3>${esc(Data.REGIONS[t === "amber" ? "amberWells" : t] ? Data.REGIONS[t === "amber" ? "amberWells" : t].n : t)}</h3>` + G.rumours[t].map(i => `<div class="row"><div class="g">${esc(Data.RUMOURS[t][i])}</div></div>`).join("")).join("") : `<div class="row"><div class="g">No rumours yet. Talk to people in towns.</div></div>`;
          if (G.flags["lore.bearer"]) h += `<h3 style="margin-top:12px">Lore</h3><div class="row"><div class="g">${esc(Data.LORE.bearerBreak)}</div></div>`;
        } else {
          const ids = Object.keys(G.best);
          h += ids.length ? ids.map(id => { const b = G.best[id], c = (Core.ENEMIES && Core.ENEMIES[id]) || {}; const nm = c.name || pretty(id);
            return `<div class="row"><div class="g"><b style="font-weight:400">${esc(nm)}</b><small>${esc(Data.BEST[id] || "No notes yet.")}</small><small>Met ${b.seen || 0}x · beaten ${b.beaten || 0}x${c.boss || id === "duneBearer" || id === "raidOptioKarvan" ? ` · Break: ${b.breakKnown ? "crack the sky-stone with two heavy impact moves in a row" : "not discovered yet"}` : ""}</small></div></div>`; }).join("") : `<div class="row"><div class="g">The Field Journal is empty. Fight, and it fills.</div></div>`;
        }
        body.innerHTML = h;
      } else {
        const v = G.vol || (G.vol = { music: 0.5, sfx: 0.8 });
        body.innerHTML = foot + `<div class="row"><div class="g">Save game<small>${Flow.locked ? "Not during a scene." : ""}</small></div><button class="b" data-sys="save" ${Flow.locked ? "disabled" : ""}>Save</button></div>
          <div class="row"><div class="g">Battle speed<small>Animations in fights.</small></div><button class="b" data-sys="speed">${SPEEDS[G.speed].name}</button></div>
          <div class="row"><div class="g">Remember last action<small>The battle menu opens on the action you used last.</small></div><button class="b" data-sys="cursor">${G.cursorMem === false ? "Off" : "On"}</button></div>
          <div class="row"><div class="g">Minimap<small>The area map in the corner (M).</small></div><button class="b" data-sys="minimap">${G.minimap === false ? "Off" : "On"}</button></div>
          <div class="row"><div class="g">Music volume</div><button class="b" data-sys="mv-">-</button><b>${Math.round(v.music * 100)}%</b><button class="b" data-sys="mv+">+</button></div>
          <div class="row"><div class="g">Sound effects volume</div><button class="b" data-sys="sv-">-</button><b>${Math.round(v.sfx * 100)}%</b><button class="b" data-sys="sv+">+</button></div>
          <div class="row"><div class="g">Back to title<small>Unsaved progress is lost.</small></div><button class="b" data-sys="title">Title</button></div>`;
      }
    }, {
      tabs: TABS, gold, foot: "Q / R or Tab switches tabs. Esc closes.",
      click: async (e, api) => {
        const t = e.target.closest("[data-d],[data-sw],[data-order],[data-use],[data-unlock],[data-jt],[data-sys],[data-sj],[data-travel],[data-charm]"); if (!t) return; const d = t.dataset; msg = "";
        if (d.sj !== undefined) { Systems.ui.journalClick(d.sj); return api.redraw(); }
        if (d.charm !== undefined) { msg = Systems.ui.charmClick(d.charm); return api.redraw(); }
        if (d.travel !== undefined) { if (await Systems.travelTo(d.travel)) api.close(); return; }
        if (d.jt !== undefined) { jt = +d.jt; return api.redraw(); }
        if (d.d !== undefined) { const wag = d.d[0] === "w", i = +d.d.slice(1); await partyScreen(wag ? G.party.length + i : i); return api.redraw(); }
        if (d.sw !== undefined) { // swap a wagon creature into the party
          const i = await UI.choose("Swap in for which team member?", G.party.map(u => ({ label: `${u.name} Lv${u.level}${u.guest ? " (guest)" : ""}`, disabled: !!u.guest })), { back: true });
          if (i >= 0) { const w = G.collection[+d.sw]; G.collection[+d.sw] = G.party[i]; G.party[i] = w; msg = `${w.name} joins the team.`; Flow.sfx("menuOk"); } return api.redraw();
        }
        if (d.order !== undefined) {
          const a = await UI.choose("Move which creature?", G.party.map(u => ({ label: u.name, disabled: !!u.guest })), { back: true }); if (a < 0) return;
          const b = await UI.choose("Swap places with?", G.party.map((u, k) => ({ label: u.name, disabled: k === a || !!u.guest })), { back: true }); if (b < 0) return;
          [G.party[a], G.party[b]] = [G.party[b], G.party[a]]; return api.redraw();
        }
        if (d.use !== undefined) {
          const k = d.use;
          if (k === "sunwater") { const u = await pickCreature("Heal who?", c => c.alive && c.hp < c.maxHp); if (u) { const h = Math.round(u.maxHp * 0.25); u.hp = Math.min(u.maxHp, u.hp + h); Flow.take(k); msg = `${u.name} recovers ${h} HP.`; Flow.sfx("potion"); } else msg = "Nobody needs healing."; }
          else if (k === "ember") { const u = await pickCreature("Revive who?", c => !c.alive); if (u) { u.alive = true; u.hp = Math.max(1, Math.round(u.maxHp * 0.3)); Flow.take(k); msg = `${u.name} is back on its feet.`; Flow.sfx("potion"); } else msg = "Nobody has fallen."; }
          else if (k === "respecStone") { msg = await Systems.useRespecStone() || ""; }
          else if (k === "incense" || k === "candle") { G.charm = { kind: k, until: Date.now() + 5 * 60 * 1000 }; Flow.take(k); msg = k === "incense" ? "Fights are rarer for five minutes." : "Fights come twice as often for five minutes."; }
          return api.redraw();
        }
        if (d.unlock !== undefined) { if (Flow.unlockBook(d.unlock)) { msg = `${Data.BOOK[d.unlock].n} unlocked!`; Flow.sfx("levelUp"); } return api.redraw(); }
        if (d.sys !== undefined) {
          const v = G.vol || (G.vol = { music: 0.5, sfx: 0.8 }), s = d.sys;
          if (s === "save") { msg = Flow.save() ? "Game saved." : "Saving failed."; }
          else if (s === "speed") G.speed = (G.speed + 1) % SPEEDS.length;
          else if (s === "cursor") G.cursorMem = G.cursorMem === false;
          else if (s === "minimap") { G.minimap = G.minimap === false; try { if (World.scene) World.scene.showMinimap(); } catch (e) {} }
          else if (s === "mv-" || s === "mv+") { v.music = Math.max(0, Math.min(1, Math.round((v.music + (s === "mv+" ? 0.1 : -0.1)) * 10) / 10)); Flow.applyVolume(); }
          else if (s === "sv-" || s === "sv+") { v.sfx = Math.max(0, Math.min(1, Math.round((v.sfx + (s === "sv+" ? 0.1 : -0.1)) * 10) / 10)); Flow.applyVolume(); Flow.sfx("menuMove"); }
          else if (s === "title") { if (await UI.confirm("Back to the title screen? Unsaved progress is lost.", "Yes", "No")) { api.close("title"); } return; }
          return api.redraw();
        }
      },
    });
    return win.then(r => { if (r === "title" && Flow.toTitle) Flow.toTitle(); });
  };

  // ---------- title-screen settings ----------
  M.settings = () => {
    const v = (window.__vol = window.__vol || (G && G.vol) || { music: 0.5, sfx: 0.8 });
    return UI.window("Settings", (body) => {
      body.innerHTML = `<div class="row"><div class="g">Battle speed<small>Animations in fights.</small></div><button class="b" data-s="speed">${SPEEDS[(G && G.speed) || 0].name}</button></div>
        <div class="row"><div class="g">Music volume</div><button class="b" data-s="mv-">-</button><b>${Math.round(v.music * 100)}%</b><button class="b" data-s="mv+">+</button></div>
        <div class="row"><div class="g">Sound effects volume</div><button class="b" data-s="sv-">-</button><b>${Math.round(v.sfx * 100)}%</b><button class="b" data-s="sv+">+</button></div>`;
    }, { closeLabel: "Back (Esc)", click: (e, api) => {
      const s = e.target.closest("[data-s]"); if (!s) return; const k = s.dataset.s;
      if (k === "speed") { if (!G) Flow.newGame(); G.speed = (G.speed + 1) % SPEEDS.length; }
      else if (k.startsWith("mv")) v.music = Math.max(0, Math.min(1, Math.round((v.music + (k === "mv+" ? 0.1 : -0.1)) * 10) / 10));
      else v.sfx = Math.max(0, Math.min(1, Math.round((v.sfx + (k === "sv+" ? 0.1 : -0.1)) * 10) / 10));
      try { if (window.Audio && typeof Audio.setVolume === "function") Audio.setVolume(v.music, v.sfx); localStorage.setItem("davichi-settings", JSON.stringify({ vol: v, speed: G ? G.speed : 0 })); } catch (er) {}
      api.redraw();
    } });
  };
  return M;
})();
window.Menus = Menus;
