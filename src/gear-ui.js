// Gear UI (UI-FIX): item icons and the equip chooser (a list of item cards: icon, piece + set name, "worn by <creature>" or "Free", set filter).
// GearUI.icon(pid, px) -> html: assets/gear/<setId>_<slot>.png if it exists, else a drawn slot icon tinted by the set.
// GearUI.choose(u, slot) -> Promise: -1 = closed, 0 = take it off, or the piece id chosen (the caller moves it; this only picks).
"use strict";
const GearUI = (() => {
  const esc = s => UI.esc(s);
  const CSS = `
  #ui .gc { display: flex; align-items: center; gap: 12px; padding: 6px 10px; border: 1px solid #3a2a1a; background: #22180f; margin-bottom: 6px; cursor: pointer; scroll-margin-top: 62px; scroll-margin-bottom: 10px; }
  #ui .gc.sel { border-color: #f2c14e; background: #2c1f12; } #ui .gc.here { box-shadow: inset 3px 0 0 #7dff9a; }
  #ui .gi { position: relative; width: 56px; height: 56px; flex: 0 0 56px; display: grid; place-items: center; background: radial-gradient(circle at 50% 60%, #3a2614, #170f0a 75%); border: 1px solid #3a2a1a; }
  #ui .gi img { position: absolute; inset: 2px; width: calc(100% - 4px); height: calc(100% - 4px); object-fit: contain; image-rendering: pixelated; }
  #ui .gc .gt { flex: 1; min-width: 0; } #ui .gc .gt b { display: block; font-weight: 400; color: #f2c14e; font-size: 19px; } #ui .gc .gt small { display: block; color: #b7a58a; font-size: 14px; }
  #ui .gc .bd { flex: 0 0 auto; text-align: right; font-size: 14px; }
  #ui .gc .bd span { display: inline-block; padding: 3px 10px; border-radius: 3px; border: 1px solid; font-size: 15px; white-space: nowrap; }
  #ui .gc .bd .free { color: #7dff9a; border-color: #3f8a52; background: #14301d; } #ui .gc .bd .wb { color: #ffb26a; border-color: #8a5a2a; background: #3a2412; } #ui .gc .bd .me { color: #f2c14e; border-color: #8a6a3a; background: #2f2410; }
  #ui .gc .bd small { display: block; margin-top: 3px; color: #b7a58a; font-size: 13px; }
  #ui .gf { position: sticky; top: -14px; z-index: 2; display: flex; flex-wrap: wrap; gap: 5px; padding: 8px 0 8px; margin: -14px 0 6px; background: #1b130e; border-bottom: 1px solid #3a2a1a; }
  #ui .gf button { font: inherit; font-size: 14px; color: #b7a58a; background: #22180f; border: 1px solid #3a2a1a; padding: 3px 10px; cursor: pointer; }
  #ui .gf button.on { color: #1b130e; background: #f2c14e; border-color: #f2c14e; }
  #ui .gh { font-family: "Marcellus SC", serif; color: #8f7a5c; font-size: 14px; letter-spacing: .08em; text-transform: uppercase; margin: 10px 0 4px; border-bottom: 1px solid #3a2c1f; }
  #ui .gc.off { background: #1b130e; }
  @media (max-width: 700px) { #ui .gc { flex-wrap: wrap; } #ui .gc .gt { flex-basis: calc(100% - 80px); } #ui .gc .bd { flex-basis: 100%; text-align: left; } }`;
  const hueOf = s => { let h = 0; for (const c of s) h = (h * 37 + c.charCodeAt(0)) % 360; return h; };
  // drawn stand-in icons (a helm, a breastplate, a blade), tinted by the set; the real art covers it once it loads
  const SHAPES = {
    helm: `<path d="M6 22 C6 10 14 5 20 5 C26 5 34 10 34 22 L34 30 L28 30 L28 24 L12 24 L12 30 L6 30 Z" /><path d="M18 5 L22 5 L22 1 L18 1 Z" opacity=".7"/><rect x="12" y="19" width="16" height="3" fill="#0d0907" opacity=".75"/>`,
    armor: `<path d="M8 6 L15 4 L20 8 L25 4 L32 6 L36 14 L30 17 L30 35 L10 35 L10 17 L4 14 Z" /><path d="M20 8 L20 35" stroke="#0d0907" stroke-width="1.4" opacity=".5" fill="none"/><circle cx="20" cy="20" r="3" fill="#0d0907" opacity=".45"/>`,
    weapon: `<path d="M20 2 L24 8 L24 26 L16 26 L16 8 Z" /><rect x="10" y="26" width="20" height="3.5" /><rect x="18" y="29.5" width="4" height="8" opacity=".8"/><path d="M20 4 L20 24" stroke="#0d0907" stroke-width="1.2" opacity=".35" fill="none"/>`,
  };
  function icon(pid, px = 56) {
    const [s, sl] = pid.split("."), h = hueOf(s), fill = `hsl(${h} 42% 52%)`, edge = `hsl(${h} 45% 20%)`;
    return `<span class="gi" style="width:${px}px;height:${px}px;flex-basis:${px}px"><svg viewBox="0 0 40 40" width="${Math.round(px * .72)}" height="${Math.round(px * .72)}" fill="${fill}" stroke="${edge}" stroke-width="1.5" stroke-linejoin="round">${SHAPES[sl] || SHAPES.helm}</svg>`
      + `<img src="assets/gear/${esc(s)}_${esc(sl)}.png" alt="" onload="this.previousElementSibling.style.display='none'" onerror="this.remove()"></span>`;
  }
  let cssDone = false;
  const ensureCss = () => { if (cssDone) return; cssDone = true; UI.ensure(); const st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st); };
  const wearers = pid => Flow.allCreatures().filter(x => x.eq && Object.values(x.eq).includes(pid));

  function choose(u, sl) {
    ensureCss();
    const here = u.eq && u.eq[sl] || null, sets = Object.keys(Data.SETS);
    const owned = Object.keys(G.owned).filter(p => G.owned[p] > 0 && p.split(".")[1] === sl).sort((a, b) => sets.indexOf(a.split(".")[0]) - sets.indexOf(b.split(".")[0]));
    const setIds = sets.filter(s => owned.some(p => p.split(".")[0] === s));
    let filt = "all", curList = [];
    const home = () => { const l = entries(), i = l.findIndex(en => en.pid && en.pid !== here); return i >= 0 ? i : 0; };   // start on the first piece you do not already wear
    let sel = 0;
    const cnt = Flow.setCounts(u);
    const entries = () => {   // off-card first (when the slot is filled), then the pieces of the chosen set(s)
      const out = []; if (here) out.push({ off: true });
      owned.filter(p => filt === "all" || p.split(".")[0] === filt).forEach(p => out.push({ pid: p }));
      return out;
    };
    sel = home();
    const card = (en, i) => {
      if (en.off) return `<div class="gc off${i === sel ? " sel" : ""}" data-i="${i}"><span class="gi" style="display:grid;place-items:center;color:#8f7a5c;font-size:26px">&times;</span><div class="gt"><b>Take it off</b><small>${esc(Data.pieceName(here))} goes back to the free pieces.</small></div></div>`;
      const p = en.pid, s = p.split(".")[0], mine = p === here, ws = wearers(p), free = Flow.hasFree(p), n = G.owned[p];
      const others = ws.filter(x => x !== u).map(x => x.name);
      const after = (cnt[s] || 0) + (mine || (here && here.split(".")[0] === s) ? 0 : 1);
      const progress = `${after} of 3 ${esc(Data.SETS[s].n)} pieces on ${esc(u.name)}${mine ? "" : after === 3 ? " (full bonus)" : after === 2 ? " (half bonus)" : ""}`;
      const badge = mine ? `<span class="me">Worn by ${esc(u.name)}</span>` : free ? `<span class="free">Free</span>` : `<span class="wb">Worn by ${esc(others.join(", "))}</span>`;
      const sub = mine ? (others.length ? `<small>${esc(others.join(", "))} wears one too</small>` : "") : free ? (ws.length ? `<small>${n} owned, ${esc(others.join(", "))} wears one</small>` : n > 1 ? `<small>${n} owned</small>` : "") : `<small>Equip: ${esc(others[0])} gives it up</small>`;
      return `<div class="gc${i === sel ? " sel" : ""}${mine ? " here" : ""}" data-i="${i}">${icon(p)}<div class="gt"><b>${esc(Data.pieceName(p))}</b><small>${esc(Data.SETS[s].n)}</small><small>${progress}</small></div><div class="bd">${badge}${sub}</div></div>`;
    };
    const pick = i => { const en = curList[i]; return en ? (en.off ? 0 : en.pid) : -1; };
    return UI.window(`${Data.SLOT_NAMES[sl]} for ${u.name}`, (body, api) => {
      const list = curList = entries(); sel = Math.max(0, Math.min(sel, list.length - 1));
      let lastSet = null, html = "";
      if (setIds.length > 1) html += `<div class="gf"><button class="${filt === "all" ? "on" : ""}" data-f="all">All sets</button>${setIds.map(s => `<button class="${filt === s ? "on" : ""}" data-f="${s}">${esc(Data.SETS[s].n)}</button>`).join("")}</div>`;
      else html += `<div style="height:0;margin-top:-6px"></div>`;
      if (!owned.length) html += `<div style="color:#b7a58a;margin:8px 0">No ${esc(Data.SLOT_NAMES[sl].toLowerCase())} pieces owned yet.</div>`;
      list.forEach((en, i) => {
        if (!en.off && filt === "all" && setIds.length > 1) { const s = en.pid.split(".")[0]; if (s !== lastSet) { lastSet = s; html += `<div class="gh">${esc(Data.SETS[s].n)}</div>`; } }
        html += card(en, i);
      });
      body.innerHTML = html;
      requestAnimationFrame(() => { const e = body.querySelector(".gc.sel"); if (e && e.scrollIntoView) e.scrollIntoView({ block: "nearest" }); });
    }, {
      foot: "Up/Down pick a piece, Left/Right switch set, Enter equips, Esc goes back.",
      click: (e, api) => {
        const f = e.target.closest("[data-f]"); if (f) { filt = f.dataset.f; sel = home(); return api.redraw(); }
        const c = e.target.closest("[data-i]"); if (!c) return; api.close(pick(+c.dataset.i));
      },
      keys: (e, api) => {
        const n = curList.length, k = e.key;
        if (k === "ArrowDown" || k === "s") { if (n) sel = (sel + 1) % n; }
        else if (k === "ArrowUp" || k === "w") { if (n) sel = (sel + n - 1) % n; }
        else if (k === "ArrowRight" || k === "ArrowLeft") { if (setIds.length < 2) return; const all = ["all"].concat(setIds), d = k === "ArrowRight" ? 1 : -1; filt = all[(all.indexOf(filt) + d + all.length) % all.length]; sel = home(); }
        else if (k === "Enter" || k === " ") { if (n) api.close(pick(sel)); return; }
        else if (k === "Backspace") return api.close(-1);
        else return;
        api.redraw();
      },
    }).then(v => (v == null ? -1 : v));
  }
  const blank = (px = 56) => { ensureCss(); return `<span class="gi" style="width:${px}px;height:${px}px;flex-basis:${px}px;opacity:.5"></span>`; };
  // the Items menu's gear list (Danny 2026-10-31: make it as nice as Party > Gear): cards grouped by set, icon, slot, who wears it
  function listHtml() {
    ensureCss();
    const owned = Object.keys(G.owned || {}).filter(p => G.owned[p] > 0);
    if (!owned.length) return `<div class="row"><div class="g">No gear yet.</div></div>`;
    const bySet = {}; owned.forEach(p => (bySet[p.split(".")[0]] = bySet[p.split(".")[0]] || []).push(p));
    return Object.keys(bySet).sort((a, b) => +a.slice(1) - +b.slice(1)).map(s => {
      const set = Data.SETS[s], pieces = Data.SLOTS.map(sl => Data.pieceId(s, sl)).filter(p => bySet[s].includes(p));
      return `<div class="gh">${esc(set.n)} <span style="float:right;text-transform:none;letter-spacing:0">${pieces.length}/3 pieces</span></div>` + pieces.map(p => {
        const w = wearers(p), n = G.owned[p], free = n - w.length, sl = p.split(".")[1];
        const badges = w.map(x => `<span class="wb">Worn by ${esc(x.name)}</span>`).join(" ") + (free > 0 ? ` <span class="free">${n > 1 ? free + " free" : "Free"}</span>` : "");
        return `<div class="gc" style="cursor:default">${icon(p)}<div class="gt"><b>${esc(Data.pieceName(p))}</b><small>${esc(Data.SLOT_NAMES[sl])}${n > 1 ? " · owned " + n : ""}</small></div><div class="bd">${badges}</div></div>`;
      }).join("");
    }).join("");
  }
  return { icon, blank, choose, listHtml };
})();
window.GearUI = GearUI;
