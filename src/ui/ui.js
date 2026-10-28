// UI layer for Davichi's Revenge: HTML overlays (dialogue box with portraits, choices, toasts, cards, fades, modal windows).
// Works over any Phaser scene and over the 3D arena. Look: dark brown, gold Marcellus SC headings, Marcellus text.
"use strict";
const UI = (() => {
  const CSS = `
  #ui { position: fixed; inset: 0; z-index: 70; pointer-events: none; font-family: "Marcellus", Georgia, serif; color: #f4e9d4; }
  #ui * { box-sizing: border-box; }
  #ui .ovl { position: absolute; inset: 0; pointer-events: auto; }
  #ui .dim { background: rgba(10,6,4,.55); }
  #ui .box { position: absolute; left: 50%; transform: translateX(-50%); bottom: 4vh; width: min(900px, 94vw); min-height: 150px; background: rgba(27,19,14,.96); border: 2px solid #8a6a3a; box-shadow: 0 0 0 4px rgba(27,19,14,.96), 0 0 0 5px #3a2a1a; padding: 14px 20px 16px 20px; display: flex; gap: 18px; cursor: pointer; }
  #ui .box .face { flex: 0 0 112px; height: 112px; border: 1px solid #3a2a1a; background: radial-gradient(circle at 50% 70%, #3a2614, #1b130e 75%); display: grid; place-items: center; overflow: hidden; }
  #ui .box .face img { width: 108px; height: 108px; object-fit: contain; image-rendering: pixelated; }
  #ui .box .face .ini { font-family: "Marcellus SC", serif; font-size: 44px; color: #8a6a3a; }
  #ui .box .nm { font-family: "Marcellus SC", serif; color: #f2c14e; font-size: 20px; margin-bottom: 4px; }
  #ui .box .tx { font-size: 21px; line-height: 1.38; white-space: pre-wrap; }
  #ui .box .nx { position: absolute; right: 18px; bottom: 8px; color: #b7a58a; font-size: 16px; animation: uibl .8s infinite alternate; }
  @keyframes uibl { from { opacity: 1 } to { opacity: .15 } }
  #ui .pan { position: absolute; background: rgba(27,19,14,.97); border: 2px solid #8a6a3a; box-shadow: 0 0 0 4px rgba(27,19,14,.97), 0 0 0 5px #3a2a1a; padding: 12px 14px; min-width: 280px; max-width: 94vw; max-height: 88vh; overflow-y: auto; }
  #ui .pan h4 { margin: 0 0 8px; font-family: "Marcellus SC", serif; font-weight: 400; font-size: 17px; color: #b7a58a; }
  #ui .pan .opt { display: block; width: 100%; text-align: left; font: inherit; font-size: 20px; color: #f4e9d4; background: none; border: 0; padding: 4px 6px; cursor: pointer; }
  #ui .pan .opt.sel { color: #f2c14e; background: #2c1f12; } #ui .pan .opt.sel::before { content: "> "; } #ui .pan .opt.off { color: #6d5f4f; cursor: default; }
  #ui .pan .info { margin-top: 8px; color: #b7a58a; font-size: 15px; min-height: 2.6em; border-top: 1px solid #3a2a1a; padding-top: 6px; }
  #ui .toast { position: absolute; top: 14px; left: 50%; transform: translateX(-50%); background: rgba(27,19,14,.95); border: 1px solid #8a6a3a; color: #f2c14e; padding: 6px 16px; font-size: 18px; pointer-events: none; transition: opacity .5s; white-space: nowrap; max-width: 94vw; overflow: hidden; text-overflow: ellipsis; }
  #ui .fade { position: absolute; inset: 0; background: #000; opacity: 0; transition: opacity .5s; pointer-events: none; z-index: 5; }
  #ui .card { position: absolute; inset: 0; background: #0c0806 center/cover no-repeat; pointer-events: auto; cursor: pointer; display: grid; place-items: end center; }
  #ui .card .sh { position: absolute; inset: 0; background: linear-gradient(transparent 35%, rgba(8,5,3,.92) 80%); }
  #ui .card .ct { position: relative; width: min(820px, 92vw); padding: 0 0 7vh; font-size: 24px; line-height: 1.5; text-align: center; text-shadow: 0 2px 0 #000; }
  #ui .card .big { font-family: "Marcellus SC", serif; color: #f2c14e; font-size: 46px; letter-spacing: 2px; margin-bottom: 8px; }
  #ui .card .hint { position: absolute; right: 22px; bottom: 14px; color: #b7a58a; font-size: 15px; }
  #ui .win { position: absolute; inset: 0; display: grid; place-items: center; pointer-events: auto; background: rgba(10,6,4,.86); }
  #ui .win .frame { width: min(1040px, 96vw); height: min(640px, 92vh); background: #1b130e; border: 2px solid #8a6a3a; box-shadow: 0 0 0 4px #1b130e, 0 0 0 5px #3a2a1a; display: flex; flex-direction: column; }
  #ui .win .top { display: flex; align-items: center; gap: 6px; padding: 10px 14px; border-bottom: 1px solid #3a2a1a; }
  #ui .win .top h2 { font-family: "Marcellus SC", serif; font-weight: 400; color: #f2c14e; margin: 0 14px 0 0; font-size: 24px; }
  #ui .win .tab { font: inherit; font-size: 17px; color: #b7a58a; background: #22180f; border: 1px solid #3a2a1a; padding: 5px 14px; cursor: pointer; }
  #ui .win .tab.on { color: #1b130e; background: #f2c14e; border-color: #f2c14e; }
  #ui .win .gold { margin-left: auto; color: #f2c14e; font-size: 18px; }
  #ui .win .x { font: inherit; color: #f4e9d4; background: #2c1f12; border: 1px solid #8a6a3a; padding: 4px 12px; cursor: pointer; margin-left: 8px; }
  #ui .win .body { flex: 1; overflow-y: auto; padding: 14px 18px; }
  #ui .win .foot { border-top: 1px solid #3a2a1a; padding: 6px 14px; color: #b7a58a; font-size: 14px; }
  #ui .win h3 { font-family: "Marcellus SC", serif; font-weight: 400; color: #f2c14e; margin: 0 0 6px; font-size: 18px; }
  #ui .row { display: flex; align-items: center; gap: 10px; padding: 6px 8px; border: 1px solid #3a2a1a; background: #22180f; margin-bottom: 6px; }
  #ui .row.sel { border-color: #f2c14e; background: #2c1f12; }
  #ui .row .g { flex: 1; } #ui .row small { color: #b7a58a; display: block; font-size: 14px; }
  #ui button.b { font: inherit; font-size: 16px; color: #f2c14e; background: #2c1f12; border: 1px solid #8a6a3a; padding: 4px 12px; cursor: pointer; }
  #ui button.b:disabled { opacity: .35; cursor: default; }
  #ui .grid { display: grid; gap: 10px; }
  #ui .pk { text-align: center; padding: 10px 8px; border: 2px solid #3a2a1a; background: #22180f; cursor: pointer; font: inherit; color: inherit; }
  #ui .pk.sel { border-color: #f2c14e; background: #2c1f12; transform: translateY(-2px); }
  #ui .pk .art { display: flex; justify-content: center; gap: 0; height: 74px; align-items: end; }
  #ui .pk .art img { height: 70px; width: 70px; object-fit: contain; image-rendering: pixelated; margin: 0 -6px; }
  #ui .pk b { display: block; font-family: "Marcellus SC", serif; font-weight: 400; color: #f2c14e; font-size: 18px; margin-top: 4px; }
  #ui .pk small { color: #b7a58a; font-size: 13.5px; display: block; margin-top: 2px; line-height: 1.25; }
  #ui .win img { max-width: 100%; max-height: 100%; object-fit: contain; image-rendering: pixelated; } #ui .row img { width: 56px; height: 50px; }
  #ui .pk .art { height: 62px; } #ui .pk .art img { height: 60px; width: 60px; } #ui .pk { padding: 6px 6px; } #ui .pk small { font-size: 12.5px; }
  #ui .shake { animation: uishake .5s infinite; } @keyframes uishake { 0%,100% { transform: translate(0,0) } 25% { transform: translate(-3px,2px) } 75% { transform: translate(3px,-2px) } }
  `;
  let root = null, fadeEl = null;
  const stack = [];                         // open modals; the top one gets the keys
  const PEOPLE = {};                        // id -> { name, face: [candidates], tag }
  const person = (id, name, face, extra) => (PEOPLE[id] = { name, face: [].concat(face || []), ...(extra || {}) });
  person("hero", "Apprentice", ["assets/portraits/hero.png", "assets/face_hero.png"]);
  person("mentor", "Master Ithiel", ["assets/portraits/mentor.png", "assets/face_mentor.png"]);
  person("dunmar", "Old Dunmar", ["assets/portraits/dunmar.png", "assets/face_innkeeper.png"]);
  person("innkeeper", "Innkeeper", ["assets/portraits/innkeeper.png", "assets/face_innkeeper.png"]);
  person("clerk", "Clerk", ["assets/portraits/clerk.png", "assets/face_merchant.png"]);
  person("merchant", "Merchant", ["assets/portraits/merchant.png", "assets/face_merchant.png"]);
  person("scholar", "Scholar", ["assets/portraits/scholar.png", "assets/face_scholar.png"]);
  person("narr", "", []);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function ensure() {
    if (root) return root;
    const st = document.createElement("style"); st.id = "ui-css"; st.textContent = CSS; document.head.appendChild(st);
    root = document.createElement("div"); root.id = "ui"; document.body.appendChild(root);
    fadeEl = document.createElement("div"); fadeEl.className = "fade"; root.appendChild(fadeEl);
    // one capture-phase key listener: the top modal gets the key, nothing else (Phaser, menus below) sees it
    addEventListener("keydown", e => {
      const top = stack[stack.length - 1]; if (!top) return;
      e.stopImmediatePropagation(); e.preventDefault();
      if (top.key) top.key(e);
    }, true);
    addEventListener("keyup", e => { if (stack.length) e.stopImmediatePropagation(); }, true);
    return root;
  }
  const open = () => stack.length > 0;

  // candidate image chain: tries each source, finally shows an initial
  function faceHtml(id, cls) {
    const p = PEOPLE[id] || creatureFace(id);
    const c = (p.face || []).slice();
    const ini = esc((p.name || id || "?").trim().charAt(0).toUpperCase());
    if (!c.length) return `<div class="face"><span class="ini">${ini}</span></div>`;
    return `<div class="face"><img src="${c[0]}" data-alt="${esc(c.slice(1).join("|"))}" onerror="UI._fb(this)" alt=""><span class="ini" style="display:none">${ini}</span></div>`;
  }
  function creatureFace(id) {
    let nm = id; try { nm = (Core.CREATURES[id] && Core.CREATURES[id].name) || id.charAt(0).toUpperCase() + id.slice(1); } catch (e) {}
    return { name: nm, face: ["assets/portraits/" + id + ".png", "assets/creatures/" + id + ".png", "assets/" + id + ".png"] };
  }
  function _fb(img) {
    const alt = (img.dataset.alt || "").split("|").filter(Boolean);
    if (alt.length) { img.dataset.alt = alt.slice(1).join("|"); img.src = alt[0]; }
    else { img.style.display = "none"; if (img.nextElementSibling) img.nextElementSibling.style.display = ""; }
  }
  function art(id, h) { // creature picture html (for lists)
    const c = creatureFace(id).face;
    return `<img src="${c[1]}" data-alt="${esc([c[2]].join("|"))}" onerror="UI._fb(this)" alt="${esc(id)}"><span class="ini" style="display:none;font-size:${h || 30}px;color:#8a6a3a">?</span>`;
  }

  // ---- dialogue ----
  // lines: [ [who, text], ... ] | { who, text } | "text"; resolves when finished.
  function say(lines, opts = {}) {
    ensure();
    if (!Array.isArray(lines)) lines = [lines];
    const list = lines.map(l => (typeof l === "string" ? { who: "narr", text: l } : Array.isArray(l) ? { who: l[0], text: l[1] } : l));
    return new Promise(resolve => {
      const ovl = document.createElement("div"); ovl.className = "ovl"; root.appendChild(ovl);
      let i = -1, full = "", pos = 0, timer = 0, done = false;
      const m = { key: null };
      const finish = () => { clearInterval(timer); const k = stack.indexOf(m); if (k >= 0) stack.splice(k, 1); ovl.remove(); resolve(); };
      const next = () => {
        i++; if (i >= list.length) return finish();
        const L = list[i], p = PEOPLE[L.who] || creatureFace(L.who);
        const name = L.name != null ? L.name : p.name;
        ovl.innerHTML = `<div class="box">${L.who === "narr" ? "" : faceHtml(L.who)}<div style="flex:1;min-width:0">${name ? `<div class="nm">${esc(name)}</div>` : ""}<div class="tx"></div></div><div class="nx" style="display:none">▼</div></div>`;
        full = L.text; pos = 0; done = false; clearInterval(timer);
        const tx = ovl.querySelector(".tx"), nx = ovl.querySelector(".nx");
        const step = Math.max(1, Math.round(1.4 / (window.UI_SPEED || 1)));
        timer = setInterval(() => { pos = Math.min(full.length, pos + step); tx.textContent = full.slice(0, pos); if (pos >= full.length) { done = true; nx.style.display = ""; clearInterval(timer); } }, 16);
        if (L.sfx && window.Audio && Audio.sfx) try { Audio.sfx(L.sfx); } catch (e) {}
      };
      const adv = () => { if (!done) { pos = full.length; ovl.querySelector(".tx").textContent = full; done = true; ovl.querySelector(".nx").style.display = ""; clearInterval(timer); } else next(); };
      m.key = e => { if (["Enter", " ", "e", "E", "ArrowDown", "z", "Z"].includes(e.key)) adv(); };
      ovl.addEventListener("pointerdown", adv);
      stack.push(m); next();
    });
  }

  // ---- choices ----  options: [{label, disabled, info}] -> index | -1 (back)
  function choose(title, options, o = {}) {
    ensure();
    return new Promise(resolve => {
      const ovl = document.createElement("div"); ovl.className = "ovl" + (o.dim ? " dim" : ""); root.appendChild(ovl);
      const pan = document.createElement("div"); pan.className = "pan";
      const pos = o.pos || "mid";
      if (pos === "left") Object.assign(pan.style, { left: "3vw", top: "8vh", width: "min(380px,92vw)" });
      else if (pos === "right") Object.assign(pan.style, { right: "3vw", top: "8vh", width: "min(420px,92vw)" });
      else Object.assign(pan.style, { left: "50%", top: o.top || "34%", transform: "translateX(-50%)", width: o.width || "min(540px,92vw)" });
      ovl.appendChild(pan);
      let sel = Math.max(0, options.findIndex(x => !x.disabled)); const m = {};
      const finish = v => { const k = stack.indexOf(m); if (k >= 0) stack.splice(k, 1); ovl.remove(); resolve(v); };
      const draw = () => {
        pan.innerHTML = `${title ? `<h4>${esc(title)}</h4>` : ""}${options.map((x, i) => `<button class="opt${i === sel ? " sel" : ""}${x.disabled ? " off" : ""}" data-i="${i}">${esc(x.label)}</button>`).join("")}<div class="info">${esc((options[sel] && options[sel].info) || "")}</div>`;
        if (!options.some(x => x.info)) pan.querySelector(".info").remove();
      };
      pan.addEventListener("click", e => { const b = e.target.closest("[data-i]"); if (b && !options[+b.dataset.i].disabled) finish(+b.dataset.i); });
      pan.addEventListener("pointerover", e => { const b = e.target.closest("[data-i]"); if (b && +b.dataset.i !== sel) { sel = +b.dataset.i; draw(); } });
      m.key = e => {
        const k = e.key, n = options.length;
        if (k === "ArrowDown" || k === "s" || k === "S") { for (let t = 0; t < n; t++) { sel = (sel + 1) % n; if (!options[sel].disabled) break; } draw(); }
        else if (k === "ArrowUp" || k === "w" || k === "W") { for (let t = 0; t < n; t++) { sel = (sel + n - 1) % n; if (!options[sel].disabled) break; } draw(); }
        else if (k === "Enter" || k === " " || k === "e" || k === "E") { if (!options[sel].disabled) finish(sel); }
        else if ((k === "Escape" || k === "Backspace") && o.back) finish(-1);
        else if (/^[1-9]$/.test(k) && +k <= n && !options[+k - 1].disabled) finish(+k - 1);
      };
      stack.push(m); draw();
    });
  }

  // generic full window: build(body, api) draws; api.close(v), api.redraw(); opts.keys(e, api)
  function window_(title, build, o = {}) {
    ensure();
    return new Promise(resolve => {
      const ovl = document.createElement("div"); ovl.className = "win"; root.appendChild(ovl);
      const m = {}; let tab = o.tab || 0;
      const api = { close: v => { const k = stack.indexOf(m); if (k >= 0) stack.splice(k, 1); ovl.remove(); resolve(v); }, redraw: () => draw(), get tab() { return tab; }, set tab(v) { tab = v; draw(); } };
      const draw = () => {
        const scroll = ovl.querySelector(".body") ? ovl.querySelector(".body").scrollTop : 0;
        ovl.innerHTML = `<div class="frame"><div class="top"><h2>${esc(title)}</h2>${(o.tabs || []).map((t, i) => `<button class="tab${i === tab ? " on" : ""}" data-tab="${i}">${esc(t)}</button>`).join("")}<span class="gold">${o.gold ? o.gold() : ""}</span>${o.noClose ? "" : `<button class="x" data-x="1">${o.closeLabel || "Close (Esc)"}</button>`}</div><div class="body"></div><div class="foot">${o.foot || ""}</div></div>`;
        build(ovl.querySelector(".body"), api, tab); ovl.querySelector(".body").scrollTop = scroll;
      };
      ovl.addEventListener("click", e => {
        const t = e.target.closest("[data-tab]"); if (t) { tab = +t.dataset.tab; draw(); return; }
        if (e.target.closest("[data-x]")) { if (!o.noClose) api.close(); return; }
        if (o.click) o.click(e, api);
      });
      m.key = e => {
        if (e.key === "Escape" && !o.noClose) return api.close();
        if (o.tabs && (e.key === "q" || e.key === "Q" || e.key === "PageUp")) { tab = (tab + o.tabs.length - 1) % o.tabs.length; return draw(); }
        if (o.tabs && (e.key === "r" || e.key === "R" || e.key === "PageDown" || e.key === "Tab")) { tab = (tab + 1) % o.tabs.length; return draw(); }
        if (o.keys) o.keys(e, api);
      };
      stack.push(m); draw();
    });
  }

  // fullscreen card: image + text (lore pages, chapter titles)
  function card(o) {
    ensure();
    return new Promise(resolve => {
      const el = document.createElement("div"); el.className = "card";
      if (o.image) el.style.backgroundImage = `url(${o.image})`; if (o.fit) el.style.backgroundSize = o.fit;
      el.innerHTML = `<div class="sh"></div><div class="ct">${o.big ? `<div class="big">${esc(o.big)}</div>` : ""}<div>${esc(o.text || "")}</div></div><div class="hint">Enter / click</div>`;
      root.appendChild(el); el.style.opacity = 0; el.style.transition = "opacity .6s"; requestAnimationFrame(() => (el.style.opacity = 1));
      const m = {}; let ready = false; setTimeout(() => (ready = true), o.delay != null ? o.delay : 350);
      const finish = () => { if (!ready) return; const k = stack.indexOf(m); if (k >= 0) stack.splice(k, 1); el.style.opacity = 0; setTimeout(() => el.remove(), 500); resolve(); };
      m.key = e => { if (["Enter", " ", "e", "E", "Escape"].includes(e.key)) finish(); };
      el.addEventListener("pointerdown", finish); stack.push(m);
      if (o.auto) setTimeout(() => { ready = true; finish(); }, o.auto);
    });
  }

  function toast(text, ms = 2200) {
    ensure(); const t = document.createElement("div"); t.className = "toast"; t.textContent = text; root.appendChild(t);
    const old = root.querySelectorAll(".toast"); old.forEach((x, i) => { if (x !== t) x.style.top = 14 + (old.length - 1 - i) * 36 + "px"; });
    setTimeout(() => (t.style.opacity = 0), ms); setTimeout(() => t.remove(), ms + 600);
  }
  function fade(to, ms = 500) { ensure(); fadeEl.style.transition = `opacity ${ms}ms`; fadeEl.style.opacity = to ? 1 : 0; return new Promise(r => setTimeout(r, ms + 30)); }
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const confirm_ = (q, yes = "Yes", no = "No") => choose(q, [{ label: yes }, { label: no }], { back: true }).then(i => i === 0);

  const reset = () => { stack.length = 0; if (root) root.querySelectorAll(".ovl").forEach(e => e.remove()); };   // test hooks: drop every open modal (e.g. the title menu when dbg jumps straight into a game)
  return { reset, say, choose, window: window_, card, toast, fade, sleep, confirm: confirm_, art, esc, person, PEOPLE, open, _fb, faceHtml, creatureFace, ensure };
})();
window.UI = UI;
