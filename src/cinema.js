// Animated cutscenes for Davichi's Revenge (owner: CINEMA). The API is in BUILD_PLAN_2.md ("Cinema API"); usage notes and panel art script: logs/CINEMA.md.
//   await Cinema.title("Chapter 3", "Into the Jungle", { sub, img })          chapter title card (about 3 s)
//   await Cinema.stage(async c => {...})                                       an animated scene on the live map (World.scene): letterbox, input locked
//   await Cinema.boss({ id, name, title, bg, music, lines, entrance })         short 3D reveal in its own overlay, then hands over to the fight
//   await Cinema.panels([{ img, text, pan }], { music })                       illustrated story panels with a slow pan/zoom
//   await Cinema.voyage({ from, to, text })                                    a boat crossing a painted sea with a route line
// Every call is a promise, never throws, skips its waits at Instant battle speed (G.speed === 2) and shows a dark placeholder if art is missing.
"use strict";
(function () {
  const W = 960, H = 540;
  const Cinema = {};
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeIO = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const sleepRaw = ms => new Promise(r => setTimeout(r, ms));

  // ---------- speed, audio, safety ----------
  function speedF() { try { if (Cinema.forceInstant) return 0.1; if (typeof Flow !== "undefined" && Flow.speedF && typeof G !== "undefined" && G) return Flow.speedF(); } catch (e) { /* no game state: normal speed */ } return Cinema.speed || 1; }
  const instant = () => speedF() <= 0.11;
  const sleep = ms => new Promise(r => setTimeout(r, instant() ? 0 : Math.max(0, ms * speedF())));
  const sfx = k => { try { if (window.Audio && typeof Audio.sfx === "function") Audio.sfx(k); } catch (e) { /* audio is optional */ } };
  const music = k => { try { if (k !== undefined && window.Audio && typeof Audio.music === "function") Audio.music(k); } catch (e) { /* audio is optional */ } };
  const guard = (name, fn, dflt) => async (...a) => { try { return await fn(...a); } catch (e) { console.warn("Cinema." + name + " failed:", e); return dflt; } };
  const uiOpen = () => { try { return !!(window.UI && UI.open && UI.open()); } catch (e) { return false; } };
  async function sayLines(lines, o) { if (!lines || !lines.length) return; try { if (window.UI && UI.say) await UI.say(lines, Object.assign({ escSkips: true }, o || {})); } catch (e) { console.warn("Cinema say failed", e); } }

  // ---------- the layer, styles, key capture ----------
  const CSS = `
  #cin { position: fixed; inset: 0; z-index: 60; pointer-events: none; font-family: "Marcellus", Georgia, serif; color: #f4e9d4; }
  #cin * { box-sizing: border-box; }
  #cin .cin-frame { position: fixed; overflow: hidden; pointer-events: none; }
  #cin .bar { position: absolute; left: 0; width: 100%; height: 11.5%; background: #000; transition: transform .6s ease-out; }
  #cin .bar.t { top: 0; transform: translateY(-100%); } #cin .bar.b { bottom: 0; transform: translateY(100%); }
  #cin .bar.on { transform: translateY(0); }
  #cin .ov { position: absolute; inset: 0; opacity: 0; pointer-events: none; }
  #cin .full { position: fixed; inset: 0; background: #050302; pointer-events: auto; cursor: pointer; overflow: hidden; }
  #cin .ttl { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
  #cin .ttl .sub { font-family: "Marcellus SC", serif; font-size: 20px; letter-spacing: .55em; padding-left: .55em; color: #b8975a; opacity: 0; transition: opacity 1s; }
  #cin .ttl .rule { height: 2px; width: 0; margin: 18px 0; background: linear-gradient(90deg, transparent, #f2c14e, transparent); transition: width 1.4s ease-out; }
  #cin .ttl .big { font-family: "Marcellus SC", serif; font-size: 66px; color: #f2c14e; letter-spacing: .3em; padding-left: .3em; opacity: 0; filter: blur(10px); text-shadow: 0 0 28px rgba(242,193,78,.55), 0 3px 0 #000; transition: opacity 1.2s, letter-spacing 2.4s ease-out, filter 1.2s; max-width: 94vw; }
  #cin .ttl .ex { margin-top: 6px; font-size: 22px; color: #b7a58a; font-style: italic; opacity: 0; transition: opacity 1s; }
  #cin .ttl.go .sub, #cin .ttl.go .ex { opacity: 1; } #cin .ttl.go .rule { width: min(560px, 70vw); } #cin .ttl.go .big { opacity: 1; letter-spacing: .07em; filter: blur(0); }
  #cin .spark { position: absolute; width: 3px; height: 3px; background: #ffcf7a; border-radius: 50%; opacity: 0; animation: cinrise 4s linear infinite; box-shadow: 0 0 6px #ffb050; }
  @keyframes cinrise { 0% { transform: translateY(0); opacity: 0 } 15% { opacity: .9 } 100% { transform: translateY(-46vh); opacity: 0 } }
  #cin .pnl { position: absolute; inset: 0; opacity: 0; transition: opacity .7s; overflow: hidden; background: #050302; }
  #cin .pnl.on { opacity: 1; }
  #cin .pnl .im { position: absolute; inset: 0; background-size: cover; background-position: center; will-change: transform; transform-origin: 50% 50%; }
  #cin .pnl.miss .im { background: radial-gradient(ellipse at 50% 40%, #2a1c12 0%, #120b07 70%); }
  #cin .pnl .shade { position: absolute; inset: 0; background: linear-gradient(transparent 52%, rgba(6,3,2,.94) 90%), radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.55) 100%); }
  #cin .pnl .cap { position: absolute; left: 50%; transform: translateX(-50%); bottom: 6.5vh; width: min(880px, 92vw); text-align: center; font-size: 25px; line-height: 1.5; text-shadow: 0 2px 0 #000, 0 0 8px #000; white-space: pre-wrap; }
  #cin .pnl .cap .bg { font-family: "Marcellus SC", serif; color: #f2c14e; font-size: 44px; letter-spacing: 2px; margin-bottom: 8px; }
  #cin .hint { position: absolute; right: 22px; bottom: 12px; color: #b7a58a; font-size: 15px; opacity: .85; text-shadow: 0 1px 0 #000; pointer-events: none; }
  #cin .hint.tl { right: auto; left: 22px; top: 12px; bottom: auto; }
  #cin .bossov { position: fixed; inset: 0; background: #000; pointer-events: none; opacity: 0; transition: opacity .6s; }
  #cin .bossov canvas { display: block; position: absolute; inset: 0; width: 100%; height: 100%; }
  #cin .nmcard { position: absolute; left: 50%; top: 17%; transform: translateX(-50%); width: min(900px, 94vw); text-align: center; opacity: 0; transition: opacity .8s; pointer-events: none; }
  #cin .nmcard.on { opacity: 1; }
  #cin .nmcard .rl { height: 2px; width: 0; margin: 10px auto; background: linear-gradient(90deg, transparent, #f2c14e, transparent); transition: width 1.2s ease-out; }
  #cin .nmcard.on .rl { width: 100%; }
  #cin .nmcard .nm { font-family: "Marcellus SC", serif; font-size: 62px; color: #f6e2b0; letter-spacing: .5em; padding-left: .5em; text-shadow: 0 0 30px rgba(255,120,60,.6), 0 4px 0 #000; transition: letter-spacing 2.6s ease-out; }
  #cin .nmcard.on .nm { letter-spacing: .08em; }
  #cin .nmcard .tt { font-family: "Marcellus SC", serif; font-size: 22px; letter-spacing: .3em; padding-left: .3em; color: #d9a85a; text-shadow: 0 2px 0 #000; }
  #cin .vignette { position: absolute; inset: 0; background: radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,.65) 100%); pointer-events: none; }
  #cin .voy { position: fixed; inset: 0; background: #06121a; pointer-events: auto; cursor: pointer; overflow: hidden; opacity: 0; transition: opacity .8s; }
  #cin .voy canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
  #cin .voy .cap { position: absolute; left: 50%; transform: translateX(-50%); bottom: 7vh; width: min(860px, 92vw); text-align: center; font-size: 25px; line-height: 1.5; text-shadow: 0 2px 0 #000, 0 0 10px #000; opacity: 0; transition: opacity 1s; }
  #cin .voy .cap.on { opacity: 1; }
  `;
  let layer = null;
  function ensureLayer() {
    if (!document.getElementById("cin-css")) { const st = document.createElement("style"); st.id = "cin-css"; st.textContent = CSS; document.head.appendChild(st); }
    if (!layer || !layer.isConnected) { layer = document.createElement("div"); layer.id = "cin"; document.body.appendChild(layer); }
    return layer;
  }
  const mkEl = (cls, html, parent) => { const d = document.createElement("div"); d.className = cls; if (html != null) d.innerHTML = html; (parent || ensureLayer()).appendChild(d); return d; };
  // one capture-phase key listener per overlay; when a UI modal is open the UI listener has already consumed the key (it stops propagation), so ours never fires
  function keys(fn) { const f = e => { if (uiOpen()) return; if (fn(e)) { e.stopImmediatePropagation(); e.preventDefault(); } }; addEventListener("keydown", f, true); return () => removeEventListener("keydown", f, true); }
  const ADV = ["Enter", " ", "e", "E", "ArrowDown", "z", "Z"];

  // ===================================================================================================================================
  // Cinema.title
  // ===================================================================================================================================
  Cinema.title = guard("title", async (chapter, name, o = {}) => {
    if (instant()) return;
    ensureLayer(); sfx("titleSwell");
    const el = mkEl("full", null);
    if (o.img) { const im = mkEl("", null, el); im.style.cssText = `position:absolute;inset:0;background:url(${o.img}) center/cover;opacity:.32;filter:blur(1px)`; }
    const ttl = mkEl("ttl", `<div class="sub">${esc(String(chapter || "").toUpperCase())}</div><div class="rule"></div><div class="big">${esc(name || "")}</div><div class="rule"></div><div class="ex">${esc(o.sub || "")}</div>`, el);
    for (let i = 0; i < 26; i++) { const s = mkEl("spark", null, el); s.style.left = (8 + Math.random() * 84) + "%"; s.style.top = (58 + Math.random() * 38) + "%"; s.style.animationDelay = (Math.random() * 4).toFixed(2) + "s"; s.style.animationDuration = (3 + Math.random() * 3).toFixed(1) + "s"; }
    el.style.opacity = 0; el.style.transition = "opacity .5s"; await sleepRaw(30); el.style.opacity = 1;
    let skip = false; const off = keys(e => { if ([...ADV, "Escape"].includes(e.key)) { skip = true; return true; } return false; }); el.addEventListener("pointerdown", () => (skip = true));
    const f = speedF(), wait = async ms => { const t0 = performance.now(); while (performance.now() - t0 < ms * f && !skip) await sleepRaw(40); };
    await wait(450); ttl.classList.add("go"); await wait(o.ms || 3000);
    skip = false; off(); el.style.opacity = 0; await sleepRaw(550); el.remove();
  });

  // ===================================================================================================================================
  // Cinema.stage: an animated scene on the live Region map
  // ===================================================================================================================================
  const NATIVE_RIGHT = new Set(["hero"]);                          // art that faces right by default (everything else faces left)
  const HERO_H = 66, CREATURE_H = 64;
  function mkTex(sc, key, w, h, draw) { if (sc.textures.exists(key)) return; const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h); sc.textures.addCanvas(key, c); }
  function ensureTextures(sc) {
    mkTex(sc, "cin_ph", 40, 72, (x, w, h) => { x.fillStyle = "#0c0708"; x.beginPath(); x.arc(20, 14, 11, 0, 7); x.fill(); x.fillRect(8, 24, 24, 44); x.fillRect(5, 30, 4, 24); x.fillRect(31, 30, 4, 24); x.strokeStyle = "#5a4020"; x.lineWidth = 2; x.strokeRect(8, 25, 24, 43); x.fillStyle = "#8a6a3a"; x.font = "bold 18px sans-serif"; x.textAlign = "center"; x.fillText("?", 20, 52); });
    mkTex(sc, "cin_dot", 2, 2, x => { x.fillStyle = "rgba(0,0,0,0)"; x.fillRect(0, 0, 2, 2); });
    mkTex(sc, "cin_flame", 16, 26, (x, w, h) => { const g = x.createRadialGradient(8, 19, 1, 8, 16, 11); g.addColorStop(0, "rgba(255,250,200,1)"); g.addColorStop(0.35, "rgba(255,190,70,0.95)"); g.addColorStop(0.75, "rgba(255,100,20,0.6)"); g.addColorStop(1, "rgba(255,60,0,0)"); x.fillStyle = g; x.beginPath(); x.moveTo(8, 0); x.bezierCurveTo(14, 9, 17, 15, 15, 20); x.bezierCurveTo(13, 26, 3, 26, 1, 20); x.bezierCurveTo(-1, 15, 2, 9, 8, 0); x.fill(); });
    mkTex(sc, "cin_leaf", 8, 5, x => { x.fillStyle = "#3f7a34"; x.fillRect(1, 1, 6, 3); x.fillStyle = "#6bb04a"; x.fillRect(2, 1, 4, 1); x.fillStyle = "#264a1e"; x.fillRect(0, 2, 1, 1); x.fillRect(7, 2, 1, 1); });
    mkTex(sc, "cin_leaf2", 8, 5, x => { x.fillStyle = "#8a5a2a"; x.fillRect(1, 1, 6, 3); x.fillStyle = "#b98a3a"; x.fillRect(2, 1, 4, 1); });
    mkTex(sc, "cin_feather", 14, 5, x => { x.fillStyle = "#fff"; x.fillRect(1, 2, 12, 1); x.fillRect(3, 1, 8, 1); x.fillRect(3, 3, 8, 1); x.fillRect(5, 0, 4, 1); x.fillRect(5, 4, 4, 1); });
    mkTex(sc, "cin_salt", 2, 2, x => { x.fillStyle = "#f2f6ff"; x.fillRect(0, 0, 2, 2); });
    mkTex(sc, "cin_streak", 2, 10, x => { const g = x.createLinearGradient(0, 0, 0, 10); g.addColorStop(0, "rgba(190,225,255,0)"); g.addColorStop(1, "rgba(210,235,255,.9)"); x.fillStyle = g; x.fillRect(0, 0, 2, 10); });
    mkTex(sc, "cin_ring", 96, 96, x => { x.strokeStyle = "#fff"; x.lineWidth = 5; x.beginPath(); x.ellipse(48, 48, 42, 42, 0, 0, 7); x.stroke(); x.lineWidth = 2; x.globalAlpha = 0.5; x.beginPath(); x.ellipse(48, 48, 34, 34, 0, 0, 7); x.stroke(); });
    mkTex(sc, "cin_swirl", 128, 128, x => { x.strokeStyle = "#fff"; x.lineCap = "round"; for (let k = 0; k < 3; k++) { x.lineWidth = 4 - k; x.globalAlpha = 0.9 - k * 0.2; x.beginPath(); for (let a = 0; a < 5.2; a += 0.1) { const r = 6 + a * (10 + k * 4); const px = 64 + Math.cos(a + k * 2.1) * r, py = 64 + Math.sin(a + k * 2.1) * r; a ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke(); } });
    const emote = (key, draw) => mkTex(sc, "cin_e_" + key, 26, 28, (x, w, h) => { x.fillStyle = "#1a0f14"; x.beginPath(); x.roundRect ? x.roundRect(0, 0, 26, 22, 5) : x.rect(0, 0, 26, 22); x.fill(); x.fillStyle = "#fff6dc"; x.beginPath(); x.roundRect ? x.roundRect(1.5, 1.5, 23, 19, 4) : x.rect(1.5, 1.5, 23, 19); x.fill(); x.fillStyle = "#1a0f14"; x.beginPath(); x.moveTo(9, 21); x.lineTo(13, 27); x.lineTo(16, 21); x.fill(); x.fillStyle = "#fff6dc"; x.beginPath(); x.moveTo(10.5, 20); x.lineTo(13, 24.5); x.lineTo(14.5, 20); x.fill(); draw(x); });
    const glyph = (txt, col, px) => x => { x.fillStyle = col; x.font = `bold ${px || 17}px "Marcellus", Georgia, sans-serif`; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(txt, 13, 11.5); };
    emote("!", glyph("!", "#d8321e", 18)); emote("?", glyph("?", "#2a4aa8", 18)); emote("...", glyph("...", "#3a2a1a", 17)); emote("heart", glyph("♥", "#e0306a", 17)); emote("music", glyph("♪", "#2a7a4a", 17));
    emote("anger", x => { x.strokeStyle = "#d8321e"; x.lineWidth = 2.4; x.lineCap = "round"; for (const [a, b, c, d] of [[8, 6, 12, 6], [12, 6, 12, 10], [18, 6, 14, 6], [14, 6, 14, 10], [8, 16, 12, 16], [12, 16, 12, 12], [18, 16, 14, 16], [14, 16, 14, 12]]) { x.beginPath(); x.moveTo(a, b); x.lineTo(c, d); x.stroke(); } });
    emote("sweat", x => { x.fillStyle = "#3a8ae0"; x.beginPath(); x.moveTo(13, 3); x.bezierCurveTo(20, 11, 19, 18, 13, 18); x.bezierCurveTo(7, 18, 6, 11, 13, 3); x.fill(); x.fillStyle = "#bfe0ff"; x.fillRect(10, 11, 2, 4); });
  }

  const ready = async () => {                                        // wait for the Region scene (after F.enter the map may still be loading)
    for (let i = 0; i < 220; i++) { const sc = window.World && World.scene; if (sc && sc.ready && sc.sys && sc.sys.isActive() && sc.hero) return sc; await sleepRaw(50); }
    return null;
  };

  class Stage {
    constructor(sc, o) {
      this.sc = sc; this.o = o || {}; this.actors = new Map(); this.pending = []; this.objs = []; this.timers = []; this.lights = []; this.dead = false;
      this.black = false; this.panned = false; this.zoomed = false; this.fxTex = false;
    }
    get dry() { return !this.sc; }
    // ----- setup / teardown -----
    _frame() {
      const L = ensureLayer(); let f = L.querySelector(".cin-frame");
      if (!f) { f = mkEl("cin-frame", '<div class="ov tint"></div><div class="ov fade" style="background:#000"></div><div class="ov flash" style="background:#fff"></div><div class="bar t"></div><div class="bar b"></div>', L); }
      const c = window.game && game.canvas, r = c ? c.getBoundingClientRect() : { left: 0, top: 0, width: innerWidth, height: innerHeight };
      Object.assign(f.style, { left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px" });
      return f;
    }
    async _begin() {
      if (this.sc) {
        const sc = this.sc; ensureTextures(sc); this.fxTex = true;
        sc.lock(true); this.locked = true;
        this.frame = this._frame(); this._rs = () => this._frame(); addEventListener("resize", this._rs);
        if (this.o.bars !== false && !instant()) { await sleepRaw(30); this.frame.querySelector(".bar.t").classList.add("on"); this.frame.querySelector(".bar.b").classList.add("on"); await sleepRaw(instant() ? 0 : 450 * speedF()); } else { this.frame.querySelector(".bar.t").classList.add("on"); this.frame.querySelector(".bar.b").classList.add("on"); }
        this._upd = (t, dt) => this._tick(t, dt); sc.events.on("update", this._upd);
      }
      if (this.o.music !== undefined) music(this.o.music);
    }
    async _end() {
      if (this.dead) return; this.dead = true;
      const sc = this.sc, live = sc && sc.sys && sc.sys.isActive();
      try { removeEventListener("resize", this._rs); } catch (e) { /* ignore */ }
      if (sc) {
        try { sc.events.off("update", this._upd); } catch (e) { /* ignore */ }
        for (const t of this.timers) try { t.remove(false); } catch (e) { /* ignore */ }
        for (const o of this.objs) try { o.destroy(); } catch (e) { /* ignore */ }
        for (const a of this.actors.values()) this._destroyActor(a);
        if (sc.tempLights) for (const l of this.lights) { const i = sc.tempLights.indexOf(l); if (i >= 0) sc.tempLights.splice(i, 1); }
        if (live) {
          try { if (this.panned || this.zoomed) { sc.follow(); sc.cameras.main.zoomTo(1, instant() ? 1 : 450, "Sine.easeInOut", true); } } catch (e) { /* ignore */ }
        }
      }
      const f = this.frame;
      if (f) {
        const tint = f.querySelector(".tint"); if (tint) { tint.style.transition = "opacity .5s"; tint.style.opacity = 0; }
        f.querySelector(".bar.t").classList.remove("on"); f.querySelector(".bar.b").classList.remove("on");
        const fd = f.querySelector(".fade");
        if (this.black) {                                              // the story faded to black and left it: hold the black until the next map is up, then lift it
          const myScene = sc, t0 = performance.now();
          const iv = setInterval(() => { const cur = window.World && World.scene; if ((cur && (cur !== myScene || (cur.ready && !myScene)) ) || performance.now() - t0 > 7000) { clearInterval(iv); fd.style.transition = "opacity .5s"; fd.style.opacity = 0; setTimeout(() => this._release(), 700); } }, 80);
        } else { if (fd) { fd.style.transition = "opacity .4s"; fd.style.opacity = 0; } setTimeout(() => this._release(), 700); }
      }
      if (sc && this.locked) try { sc.lock(false); } catch (e) { /* ignore */ }
    }
    _release() { activeFrames--; if (activeFrames <= 0) { activeFrames = 0; const f = layer && layer.querySelector(".cin-frame"); if (f) f.remove(); } }
    _tick(time, delta) {                                             // per frame: actor sprites follow their data, bubbles follow actors
      const sc = this.sc; if (!sc || this.dead) return; const dt = Math.min(0.05, delta / 1000);
      for (const a of this.actors.values()) {
        if (!a.s || !a.s.scene) continue;
        let bob = 0;
        if (a.moving) { bob = Math.abs(Math.sin(time * 0.012)) * 2; if (a.hero) { const fr = Math.floor(time / 95) % 8; a.s.setTexture((a.dir === "up" ? "hkUp" : a.dir === "down" ? "hkDown" : "hkSide") + fr); } }
        else if (a.hero && a.s.texture.key.indexOf("Idle") < 0 && sc.textures.exists((a.dir === "up" ? "hkUp" : a.dir === "down" ? "hkDown" : "hkSide") + "Idle")) a.s.setTexture((a.dir === "up" ? "hkUp" : a.dir === "down" ? "hkDown" : "hkSide") + "Idle");
        a.s.setPosition(Math.round(a.x), Math.round(a.y - bob - (a.lift || 0))).setDepth(a.y + (a.depth || 0)); if (a.sh) a.sh.setPosition(Math.round(a.x), Math.round(a.y) - 1).setDepth(a.y - 1).setAlpha(a.s.alpha * 0.9);
        if (a.bubble && a.bubble.scene) a.bubble.setPosition(Math.round(a.x), Math.round(a.y - (a.dispH || 60) - 10 - (a.lift || 0)));
        if (a.lamp) { a.lamp[0] = a.x; a.lamp[1] = a.y - 24; }
      }
    }
    async _settle() { if (!this.pending.length) return; const p = this.pending.splice(0); await Promise.race([Promise.all(p), sleepRaw(5000)]); }
    _dur(ms) { return instant() ? 1 : Math.max(1, ms * speedF()); }
    _add(o) { if (o) this.objs.push(o); return o; }
    _every(ms, fn, life) {
      const sc = this.sc; if (!sc) return null; const t = sc.time.addEvent({ delay: ms, loop: true, callback: () => { try { fn(); } catch (e) { /* ignore */ } } }); this.timers.push(t);
      if (life > 0) sc.time.delayedCall(life, () => { try { t.remove(false); } catch (e) { /* ignore */ } }); return t;
    }
    _tw(cfg) {
      const sc = this.sc; return new Promise(res => {
        if (!sc || !sc.sys || !sc.sys.isActive()) return res();
        let done = false; const fin = () => { if (!done) { done = true; res(); } };
        try { sc.tweens.add(Object.assign({}, cfg, { duration: this._dur(cfg.duration), onComplete: () => { if (cfg.onComplete) cfg.onComplete(); fin(); } })); } catch (e) { return res(); }
        setTimeout(fin, this._dur(cfg.duration) + 1200);
      });
    }

    // ----- actors -----
    actor(id, o = {}) {
      const sc = this.sc; if (!sc || this.dead) return null;
      try {
        const hp = sc.pos || { x: 0, y: 0 };
        const a = { id, art: o.art || id, x: o.x != null ? o.x : hp.x, y: o.y != null ? o.y : hp.y, scale: o.scale || 1, h: o.h, name: o.name, dir: "side", moving: false, depth: o.depth || 0, lift: 0 };
        a.hero = a.art === "hero"; a.nativeRight = NATIVE_RIGHT.has(a.art);
        a.sh = sc.add.image(a.x, a.y - 1, "shadow").setDepth(a.y - 1).setScale(1.2);
        a.s = sc.add.image(a.x, a.y, "cin_dot").setOrigin(0.5, 1).setDepth(a.y).setVisible(false);
        a.faceR = o.face ? o.face === "right" : !!o.flip === !a.nativeRight;   // flip = mirror the art: native-left art then faces right
        if (o.alpha !== undefined) a.s.setAlpha(o.alpha);
        this.actors.set(id, a);
        if (o.light) { a.lamp = [a.x, a.y - 24, o.light, 0.9]; sc.tempLights = sc.tempLights || []; sc.tempLights.push(a.lamp); this.lights.push(a.lamp); }
        this.pending.push(this._loadArt(a, o));
        return a;
      } catch (e) { console.warn("Cinema.actor", id, e); return null; }
    }
    _loadArt(a, o) {
      const sc = this.sc;
      return new Promise(resolve => {
        const done = res => { try { if (!this.dead && a.s && a.s.scene) { if (res) this._applyArt(a, res); else this._placeholder(a); } } catch (e) { console.warn("Cinema art", a.id, e); } resolve(); };
        const art = a.art;
        if (art === "hero") return done({ key: "hkSideIdle", kind: "hero" });
        if (sc.textures.exists(art) && art !== "__MISSING") return done({ key: art, kind: "region" });
        const cands = [];
        const ru = sc.spriteUrl ? sc.spriteUrl(art) : null; if (ru) cands.push([art, ru, "region"]);
        cands.push(["cr_" + art, "assets/creatures/" + art + ".png", "creature"], ["crx_" + art, "assets/" + art + ".png", "creature"]);
        const next = i => {
          if (i >= cands.length) return done(null);
          const [key, url, kind] = cands[i];
          if (sc.textures.exists(key)) return done({ key, kind });
          let over = false; const ld = sc.load;
          const tm = setTimeout(() => { if (!over) { over = true; cleanup(); next(i + 1); } }, 6000);
          const ok = () => { if (over) return; over = true; clearTimeout(tm); cleanup(); done({ key, kind }); };
          const bad = f => { if (over || !f || f.key !== key) return; over = true; clearTimeout(tm); cleanup(); next(i + 1); };
          const cleanup = () => { ld.off("filecomplete-image-" + key, ok); ld.off("loaderror", bad); };
          ld.on("filecomplete-image-" + key, ok); ld.on("loaderror", bad);
          ld.image(key, url); if (!ld.isLoading()) ld.start();
        };
        next(0);
      });
    }
    _applyArt(a, { key, kind }) {
      const sc = this.sc, img = sc.textures.get(key).getSourceImage(), sh = img.height || 64;
      let useKey = key, scale;
      if (kind === "hero") { scale = a.scale; a.dispH = HERO_H * scale; }
      else if (kind === "creature") {
        const th = Math.round((a.h || CREATURE_H) * a.scale);
        if (th < sh) { const tk = "cin_" + key + "_" + th; if (!sc.textures.exists(tk)) { const w = Math.max(1, Math.round(img.width * th / sh)), c = document.createElement("canvas"); c.width = w; c.height = th; const x = c.getContext("2d"); x.imageSmoothingEnabled = false; x.drawImage(img, 0, 0, w, th); sc.textures.addCanvas(tk, c); } useKey = tk; scale = 1; a.dispH = th; }
        else { scale = th / sh; a.dispH = th; }
      } else { const man = sc.man && sc.man[key]; scale = a.scale * (a.h ? a.h / sh : (man && man.kind === "npc") || /^npc/.test(key) ? 1.3 : 1); a.dispH = sh * scale; }
      a.s.setTexture(useKey).setScale(scale).setVisible(true); a.base = scale; a.dispW = a.s.displayWidth;
      a.sh.setScale(clamp(a.dispW / 40, 0.7, 6), clamp(a.dispW / 55, 0.6, 3));
      this._face(a, a.faceR ? "right" : "left");
      if (!a.noIdle) a.idle = sc.tweens.add({ targets: a.s, scaleY: { from: scale, to: scale * 0.97 }, duration: 900 + Math.random() * 500, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    }
    _placeholder(a) {
      const sc = this.sc; a.s.setTexture("cin_ph").setVisible(true); const h = (a.h || 70) * a.scale; a.base = h / 72; a.s.setScale(a.base); a.dispH = h; a.dispW = 40 * a.base; a.sh.setScale(1.1, 1);
      if (a.id && !a.hero) a.label = this._add(sc.add.text(a.x, a.y + 4, String(a.name || a.id), { fontFamily: "Marcellus, Georgia, serif", fontSize: "11px", color: "#8a6a3a" }).setOrigin(0.5, 0).setDepth(a.y + 1));
      this._face(a, a.faceR ? "right" : "left");
    }
    _face(a, dir) {
      if (!a || !a.s) return; a.dir = dir === "up" || dir === "down" ? dir : "side";
      if (dir === "left" || dir === "right") { a.faceR = dir === "right"; a.s.setFlipX(a.faceR !== a.nativeRight); }
      if (a.hero) { const tk = (a.dir === "up" ? "hkUp" : a.dir === "down" ? "hkDown" : "hkSide") + "Idle"; if (this.sc.textures.exists(tk)) a.s.setTexture(tk); }
    }
    _destroyActor(a) { try { if (a.idle) a.idle.remove(); a.s && a.s.destroy(); a.sh && a.sh.destroy(); a.bubble && a.bubble.destroy(); a.label && a.label.destroy(); } catch (e) { /* ignore */ } }
    // who is "id"? a temporary actor, the hero, or a map NPC with that id
    _ent(id) {
      const sc = this.sc; if (!sc) return null; const a = this.actors.get(id); if (a) return { kind: "actor", a, get x() { return a.x; }, get y() { return a.y; } };
      if (id === "hero") return { kind: "hero", get x() { return sc.pos.x; }, get y() { return sc.pos.y; } };
      const n = (sc.npcs || []).find(q => q.id === id); if (n) return { kind: "npc", n, get x() { return n.x; }, get y() { return n.y; } };
      return null;
    }
    remove(id) { const a = this.actors.get(id); if (a) { this._destroyActor(a); this.actors.delete(id); } else if (this.sc) { const n = (this.sc.npcs || []).find(q => q.id === id); if (n) { n.on = false; if (n.s) n.s.setVisible(false); if (n.sh) n.sh.setVisible(false); } } }
    face(id, dir) { const e = this._ent(id); if (!e) return; if (e.kind === "actor") this._face(e.a, dir); else if (e.kind === "hero") { const sc = this.sc; sc.face = dir === "up" ? "up" : dir === "down" ? "down" : "side"; if (dir === "left") sc.flipH = true; if (dir === "right") sc.flipH = false; } else if (e.kind === "npc" && e.n.s && (dir === "left" || dir === "right")) e.n.s.setFlipX(dir === "right"); }
    async walk(id, x, y, ms) {
      await this._settle(); const e = this._ent(id); if (!e || this.dead) return;
      const dist = Math.hypot(x - e.x, y - e.y), dur = ms != null ? ms : dist / 90 * 1000;
      if (e.kind === "hero") return this.walkHero(x, y, ms);
      if (e.kind === "npc") { const n = e.n, dx = x - n.x; if (Math.abs(dx) > 2 && n.s) n.s.setFlipX(dx > 0); await new Promise(res => { this.sc.moveNpc(id, x, y, dist / Math.max(0.05, this._dur(dur) / 1000)).then(res, res); setTimeout(res, this._dur(dur) + 1500); }); return; }
      const a = e.a; const dx = x - a.x, dy = y - a.y;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) { if (Math.abs(dy) > Math.abs(dx) + 4 && a.hero) this._face(a, dy > 0 ? "down" : "up"); else this._face(a, dx > 0 ? "right" : "left"); }
      a.moving = true; let last = 0;
      await this._tw({ targets: a, x, y, duration: dur, ease: "Linear", onUpdate: () => { const now = this.sc.time.now; if (now - last > 190 && !instant()) { last = now; this.sc.dustAt(a.x, a.y, 0.35); } } });
      a.moving = false; if (a.hero) this._face(a, a.dir === "side" ? (a.faceR ? "right" : "left") : a.dir);
    }
    async walkHero(x, y, ms) {
      await this._settle(); const sc = this.sc; if (!sc || this.dead) return; const dist = Math.hypot(x - sc.pos.x, y - sc.pos.y);
      const speed = ms != null ? dist / Math.max(0.05, this._dur(ms) / 1000) : 135 / (instant() ? 0.02 : speedF());
      await new Promise(res => { sc.moveHero(x, y, speed).then(res, res); setTimeout(res, dist / Math.max(1, speed) * 1000 + 1500); });
    }
    // small body animations: "hop" | "bow" | "shake" | "fall" (lies down) | "rise" | "fadeOut" | "fadeIn" | "grow" (opts.to) | "lunge" (toward dx)
    async anim(id, kind, o = {}) {
      await this._settle(); const e = this._ent(id); if (!e || this.dead) return; const a = e.kind === "actor" ? e.a : null; const spr = a ? a.s : e.kind === "npc" ? e.n.s : e.kind === "hero" ? this.sc.hero : null; if (!spr) return;
      const sx = spr.scaleX, sy = spr.scaleY;
      if (kind === "hop" && a) { for (let i = 0; i < (o.n || 1); i++) { await this._tw({ targets: a, lift: o.h || 14, duration: 150, ease: "Quad.easeOut" }); await this._tw({ targets: a, lift: 0, duration: 150, ease: "Quad.easeIn" }); } }
      else if (kind === "bow") await this._tw({ targets: spr, angle: o.dir === "left" ? -14 : 14, duration: 260, yoyo: true, hold: 300 });
      else if (kind === "shake") await this._tw({ targets: spr, x: spr.x + 3, duration: 45, yoyo: true, repeat: Math.max(2, Math.round((o.ms || 400) / 90)) });
      else if (kind === "fall") { if (a) { a.noIdle = true; if (a.idle) a.idle.remove(); } spr.setOrigin(0.5, 0.9); await this._tw({ targets: spr, angle: o.dir === "left" ? -90 : 90, duration: o.ms || 380, ease: "Quad.easeIn" }); }
      else if (kind === "rise") { spr.setOrigin(0.5, 1); await this._tw({ targets: spr, angle: 0, duration: o.ms || 400 }); }
      else if (kind === "fadeOut") await this._tw({ targets: spr, alpha: 0, duration: o.ms || 600 });
      else if (kind === "fadeIn") { spr.setAlpha(0); await this._tw({ targets: spr, alpha: 1, duration: o.ms || 600 }); }
      else if (kind === "grow") { const k = o.to || 1.2; await this._tw({ targets: spr, scaleX: sx * k, scaleY: sy * k, duration: o.ms || 700, ease: "Sine.easeInOut" }); if (a) { a.noIdle = true; if (a.idle) a.idle.remove(); a.dispH *= k; } }
      else if (kind === "lunge" && a) { const dx = o.dx != null ? o.dx : (a.faceR ? 18 : -18); await this._tw({ targets: a, x: a.x + dx, duration: 120, yoyo: true, ease: "Quad.easeOut" }); }
    }
    emote(id, kind) {
      const sc = this.sc; if (!sc || this.dead) return; const k = kind || "!";
      try {
        const e = this._ent(id); if (!e) return; const key = "cin_e_" + k; if (!sc.textures.exists(key)) return;
        let a = e.kind === "actor" ? e.a : null;
        const h = a ? a.dispH || 60 : e.kind === "hero" ? HERO_H : e.n && e.n.s ? e.n.s.displayHeight : 60;
        const b = sc.add.image(Math.round(e.x), Math.round(e.y - h - 10), key).setOrigin(0.5, 1).setDepth(9300).setScale(0.1); this._add(b); if (a) { if (a.bubble) a.bubble.destroy(); a.bubble = b; }
        else { const u = () => { try { b.setPosition(Math.round(e.x), Math.round(e.y - h - 10)); } catch (er) { /* ignore */ } }; sc.events.on("update", u); b.once("destroy", () => sc.events.off("update", u)); }
        sfx("menuMove");
        sc.tweens.add({ targets: b, scale: { from: 0.1, to: 1.5 }, duration: this._dur(220), ease: "Back.easeOut" });
        sc.time.delayedCall(this._dur(1000), () => { if (!b.scene) return; sc.tweens.add({ targets: b, alpha: 0, y: b.y - 8, duration: this._dur(260), onComplete: () => { if (a && a.bubble === b) a.bubble = null; b.destroy(); } }); });
      } catch (er) { console.warn("Cinema.emote", er); }
    }
    shout(id, text, color) { const sc = this.sc; if (!sc || this.dead) return; const e = this._ent(id); if (!e) return; try { sc.shout(e.x, e.y - 22, text, color); } catch (er) { /* ignore */ } }
    sprite(key, x, y, o = {}) {                                      // a static prop (an existing region sprite key); removed at the end
      const sc = this.sc; if (!sc || this.dead || !sc.textures.exists(key)) return null;
      const s = sc.add.image(Math.round(x), Math.round(y), key).setOrigin(0.5, 1).setDepth(y + (o.dy || 0)); if (o.scale) s.setScale(o.scale); if (o.flip) s.setFlipX(true); if (o.alpha !== undefined) s.setAlpha(o.alpha); return this._add(s);
    }
    light(x, y, r, a) { const sc = this.sc; if (!sc) return null; const l = [x, y, r || 120, a == null ? 0.9 : a]; sc.tempLights = sc.tempLights || []; sc.tempLights.push(l); this.lights.push(l); return l; }

    // ----- camera and screen -----
    get hero() { return this.sc ? { x: this.sc.pos.x, y: this.sc.pos.y } : { x: 0, y: 0 }; }
    async pan(x, y, ms) {
      await this._settle(); const sc = this.sc; if (!sc || this.dead) return; this.panned = true;
      await new Promise(res => { const c = sc.cameras.main; c.stopFollow(); try { c.pan(x, y, this._dur(ms || 900), "Sine.easeInOut", true, (cam, p) => { if (p === 1) res(); }); } catch (e) { return res(); } setTimeout(res, this._dur(ms || 900) + 1200); });
    }
    async zoom(z, ms) {
      await this._settle(); const sc = this.sc; if (!sc || this.dead) return; this.zoomed = true;
      await new Promise(res => { try { sc.cameras.main.zoomTo(z, this._dur(ms || 900), "Sine.easeInOut", true, (cam, p) => { if (p === 1) res(); }); } catch (e) { return res(); } setTimeout(res, this._dur(ms || 900) + 1200); });
    }
    follow() { if (this.sc && !this.dead) try { this.sc.follow(); } catch (e) { /* ignore */ } }
    shake(strength, ms) { const sc = this.sc; if (!sc || this.dead) return; try { const s = strength == null ? 4 : strength; sc.cameras.main.shake(this._dur(ms || 400), new Phaser.Math.Vector2(s / W, s / H), true); } catch (e) { /* ignore */ } }
    flash(color, ms) {
      if (!this.frame) return; const f = this.frame.querySelector(".flash"); if (!f) return; f.style.background = color == null ? "#fff" : (typeof color === "number" ? "#" + color.toString(16).padStart(6, "0") : color);
      const d = this._dur(ms || 300); f.style.transition = "none"; f.style.opacity = 0.9; requestAnimationFrame(() => { f.style.transition = `opacity ${d}ms ease-out`; f.style.opacity = 0; });
    }
    async fade(toBlack, ms) {
      await this._settle(); if (!this.frame) return; const f = this.frame.querySelector(".fade"), d = this._dur(ms || 600);
      f.style.transition = `opacity ${d}ms`; f.style.opacity = toBlack ? 1 : 0; this.black = !!toBlack; await sleepRaw(d + 30);
    }
    tint(color, alpha, ms) {
      if (!this.frame) return; const t = this.frame.querySelector(".tint"); t.style.background = typeof color === "number" ? "#" + color.toString(16).padStart(6, "0") : (color || "#000");
      t.style.transition = `opacity ${this._dur(ms || 600)}ms`; t.style.opacity = alpha == null ? 0.4 : alpha;
    }
    sfx(key) { sfx(key); }
    music(key) { music(key); }
    async wait(ms) { await this._settle(); if (this.dead) return; await sleep(ms == null ? 500 : ms); }
    async say(lines, o) { await this._settle(); await sayLines(lines, o); }
    // a caption in the middle of the screen ("Three nights later..."), fades in and out; resolves when gone
    async caption(text, ms) {
      if (instant() || !this.frame) return; const d = mkEl("", esc(text), this.frame); d.style.cssText = "position:absolute;left:0;right:0;top:44%;text-align:center;font-family:'Marcellus SC',serif;font-size:34px;letter-spacing:.12em;color:#f2c14e;text-shadow:0 2px 0 #000,0 0 18px #000;opacity:0;transition:opacity .8s";
      await sleepRaw(30); d.style.opacity = 1; await sleep(ms || 2200); d.style.opacity = 0; await sleepRaw(850); d.remove();
    }

    // ----- effects: fire smoke sparkle dust rain saltRain lightning embers leaves feathers splash glow explosion portal -----
    fx(kind, x, y, o = {}) {
      const sc = this.sc; if (!sc || this.dead) return; if (x == null) x = sc.pos.x; if (y == null) y = sc.pos.y;
      try { (FX[kind] || FX.glow).call(this, sc, x, y, o || {}); } catch (e) { console.warn("Cinema.fx " + kind, e); }
    }
  }
  let activeFrames = 0;
  const ADD = () => Phaser.BlendModes.ADD;
  const view = sc => sc.cameras.main.worldView;
  const FX = {
    fire(sc, x, y, o) {
      const k = o.scale || 1, life = o.ms == null ? 6000 : o.ms;
      const glow = this._add(sc.add.image(x, y - 8 * k, o.color === "blue" ? "glowBlue" : "glow").setDepth(y + 8).setBlendMode(ADD()).setScale(1.3 * k).setAlpha(0.6));
      const fl = [0, 1, 2].map(i => this._add(sc.add.image(x + (i - 1) * 5 * k, y, "cin_flame").setOrigin(0.5, 1).setDepth(y + 6 + i).setBlendMode(ADD()).setScale(k * (1.1 - i * 0.18))));
      let n = 0; const t = this._every(45, () => { n++; glow.setAlpha(0.45 + Math.random() * 0.3).setScale((1.2 + Math.random() * 0.2) * k); fl.forEach((f, i) => f.setScale(k * (1.1 - i * 0.18) * (0.85 + Math.random() * 0.3), k * (1.1 - i * 0.18) * (0.9 + Math.random() * 0.35))); }, 0);
      const e = this._every(120, () => { const em = sc.add.image(x + (Math.random() - 0.5) * 8 * k, y - 8 * k, "ember").setDepth(y + 9).setScale(1 + Math.random()); this._add(em); sc.tweens.add({ targets: em, y: em.y - (26 + Math.random() * 30) * k, x: em.x + (Math.random() - 0.4) * 22, alpha: 0, duration: 800 + Math.random() * 600, onComplete: () => em.destroy() }); }, 0);
      if (life > 0) sc.time.delayedCall(life, () => { try { t.remove(false); e.remove(false); sc.tweens.add({ targets: [glow, ...fl], alpha: 0, duration: 500, onComplete: () => [glow, ...fl].forEach(o2 => o2.destroy()) }); } catch (er) { /* ignore */ } });
    },
    smoke(sc, x, y, o) {
      const life = o.ms == null ? 6000 : o.ms, k = o.scale || 1;
      this._every(240, () => { const e = sc.add.image(Math.round(x + (Math.random() - 0.5) * 12), Math.round(y - 8), "smoke").setDepth(y + 20).setAlpha(0.55).setScale(0.6 * k); if (o.color != null) e.setTint(o.color); this._add(e); sc.tweens.add({ targets: e, y: e.y - (110 + Math.random() * 50) * k, x: e.x + 24 + Math.random() * 24, scale: 2.6 * k, alpha: 0, duration: 2800 + Math.random() * 1400, onComplete: () => e.destroy() }); }, life);
    },
    sparkle(sc, x, y, o) {
      const life = o.ms == null ? 3000 : o.ms, r = o.r || 40;
      this._every(70, () => { const s = sc.add.image(Math.round(x + (Math.random() - 0.5) * r * 2), Math.round(y - Math.random() * r * 1.4), "star").setDepth(9100).setBlendMode(ADD()).setScale(0.4).setAlpha(0); if (o.color != null) s.setTint(o.color); this._add(s); sc.tweens.add({ targets: s, alpha: 1, scale: 1.8 + Math.random(), duration: 300, yoyo: true, onComplete: () => s.destroy() }); }, life);
    },
    dust(sc, x, y, o) {
      const n = o.n || 12, k = o.scale || 1;
      for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, d = (14 + Math.random() * 26) * k, p = sc.add.image(Math.round(x), Math.round(y - 2), "puff").setDepth(y + 30).setAlpha(0.55).setScale(0.6 * k); if (o.color != null) p.setTint(o.color); this._add(p); sc.tweens.add({ targets: p, x: x + Math.cos(a) * d, y: y - 2 + Math.sin(a) * d * 0.45 - 8, scale: (1.3 + Math.random() * 0.8) * k, alpha: 0, duration: 700 + Math.random() * 500, ease: "Quad.easeOut", onComplete: () => p.destroy() }); }
    },
    rain(sc, x, y, o) {
      const life = o.ms == null ? 5000 : o.ms, salt = !!o.salt, slant = o.slant != null ? o.slant : salt ? 40 : 60;
      this._every(32, () => { const v = view(sc); for (let i = 0; i < (salt ? 3 : 5); i++) { const px = v.x + Math.random() * (v.width + 120) - 40, py = v.y - 16 - Math.random() * 30, d = sc.add.image(Math.round(px), Math.round(py), salt ? "cin_salt" : "cin_streak").setDepth(9400).setAlpha(salt ? 0.85 : 0.7); if (!salt) d.setRotation(0.25).setScale(1, 1.2); else d.setScale(1 + Math.random()); this._add(d); const dur = salt ? 1100 + Math.random() * 600 : 420 + Math.random() * 160; sc.tweens.add({ targets: d, y: py + v.height + 40, x: px - slant * (dur / 500), alpha: 0.2, duration: dur, onComplete: () => d.destroy() }); } }, life);
    },
    lightning(sc, x, y, o) {
      const v = view(sc), top = o.fromY != null ? o.fromY : v.y - 20, g = sc.add.graphics().setDepth(9450); this._add(g);
      const draw = w => { g.clear(); g.lineStyle(w, 0xe6f2ff, 1); g.beginPath(); let cx = x + (Math.random() - 0.5) * 60, cy = top; g.moveTo(cx, cy); const steps = 9; for (let i = 1; i <= steps; i++) { cx = i === steps ? x : lerp(cx, x, 0.25) + (Math.random() - 0.5) * 46; cy = lerp(top, y, i / steps); g.lineTo(cx, cy); } g.strokePath(); };
      draw(5); this.flash(o.color || "#dfeaff", 260); this.shake(o.shake != null ? o.shake : 2, 250); sfx("shock");
      sc.time.delayedCall(70, () => { if (g.scene) draw(3); }); sc.time.delayedCall(170, () => { if (g.scene) draw(6); }); sc.time.delayedCall(330, () => { if (g.scene) g.destroy(); });
      const gl = this._add(sc.add.image(x, y, "glowBlue").setDepth(y + 40).setBlendMode(ADD()).setScale(1.6)); sc.tweens.add({ targets: gl, alpha: 0, scale: 3, duration: 500, onComplete: () => gl.destroy() });
    },
    embers(sc, x, y, o) {
      const life = o.ms == null ? 5000 : o.ms, r = o.r || 120;
      this._every(70, () => { const e = sc.add.image(Math.round(x + (Math.random() - 0.5) * r * 2), Math.round(y + (Math.random() - 0.3) * r * 0.5), "ember").setDepth(9100).setScale(1 + Math.random() * 1.5).setAlpha(0.95); if (o.color != null) e.setTint(o.color); this._add(e); sc.tweens.add({ targets: e, y: e.y - 60 - Math.random() * 80, x: e.x + (Math.random() - 0.3) * 50, alpha: 0, duration: 1400 + Math.random() * 1200, onComplete: () => e.destroy() }); }, life);
    },
    leaves(sc, x, y, o) { FX._drift.call(this, sc, x, y, o, ["cin_leaf", "cin_leaf2"], 1.4); },
    feathers(sc, x, y, o) { FX._drift.call(this, sc, x, y, o, ["cin_feather"], 1.3, [0xffffff, 0x58c8a0, 0xf2c14e, 0x2a9a7a]); },
    _drift(sc, x, y, o, keys, sc2, tints) {
      const life = o.ms == null ? 5000 : o.ms, r = o.r;
      this._every(110, () => { const v = view(sc), px = r ? x + (Math.random() - 0.5) * r * 2 : v.x + Math.random() * v.width, py = r ? y - 60 : v.y - 10; const s = sc.add.image(Math.round(px), Math.round(py), keys[Math.floor(Math.random() * keys.length)]).setDepth(9400).setScale(sc2 * (0.8 + Math.random() * 0.6)).setRotation(Math.random() * 6); if (tints) s.setTint(tints[Math.floor(Math.random() * tints.length)]); else if (o.color != null) s.setTint(o.color); this._add(s); const dur = 3200 + Math.random() * 2000, sway = 30 + Math.random() * 40; sc.tweens.add({ targets: s, y: py + (r ? 160 : v.height + 30), duration: dur, ease: "Sine.easeIn", onComplete: () => s.destroy() }); sc.tweens.add({ targets: s, x: px + sway, rotation: s.rotation + 3, duration: dur / 3, yoyo: true, repeat: 2, ease: "Sine.easeInOut" }); }, life);
    },
    splash(sc, x, y, o) {
      const k = o.scale || 1, ring = this._add(sc.add.image(x, y, "cin_ring").setDepth(y + 1).setScale(0.1 * k, 0.04 * k).setAlpha(0.9).setTint(o.color != null ? o.color : 0xcfeaff)); sc.tweens.add({ targets: ring, scaleX: 0.9 * k, scaleY: 0.34 * k, alpha: 0, duration: 800, ease: "Quad.easeOut", onComplete: () => ring.destroy() });
      for (let i = 0; i < 9; i++) { const d = this._add(sc.add.image(x, y, "drop").setDepth(y + 20).setScale(1.3)), a = (i / 9) * 3.14 + 3.14 + (Math.random() - 0.5) * 0.4, dist = (12 + Math.random() * 20) * k; sc.tweens.add({ targets: d, x: x + Math.cos(a) * dist * 1.4, duration: 520, ease: "Linear" }); sc.tweens.add({ targets: d, y: [y - 28 * k - Math.random() * 14, y + 4], duration: 520, ease: "Sine.easeOut", onComplete: () => d.destroy() }); }
      sfx("water");
    },
    glow(sc, x, y, o) {
      const col = o.color != null ? o.color : 0xffd36a, n = o.n || 1, k = o.scale || 1, life = o.ms;
      const g = this._add(sc.add.image(x, y, "light").setDepth(y + 50).setBlendMode(ADD()).setTint(col).setScale(0.3 * k).setAlpha(0));
      if (life != null && life > 0) { sc.tweens.add({ targets: g, alpha: { from: 0, to: 0.9 }, scale: 1.6 * k, duration: Math.min(500, life / 2), yoyo: true, hold: Math.max(0, life - 1000), onComplete: () => g.destroy() }); return; }
      sc.tweens.add({ targets: g, alpha: { from: 0.9, to: 0 }, scale: { from: 0.4 * k, to: 2.6 * k }, duration: 900, repeat: n - 1, onComplete: () => g.destroy() });
    },
    explosion(sc, x, y, o) {
      const k = o.scale || 1;
      const fl = this._add(sc.add.image(x, y - 10, "light").setDepth(y + 60).setBlendMode(ADD()).setTint(0xffa040).setScale(0.4 * k)); sc.tweens.add({ targets: fl, scale: 3.4 * k, alpha: 0, duration: 520, ease: "Quad.easeOut", onComplete: () => fl.destroy() });
      const ring = this._add(sc.add.image(x, y, "cin_ring").setDepth(y + 2).setScale(0.1 * k, 0.05 * k).setTint(0xffd070).setAlpha(0.9)); sc.tweens.add({ targets: ring, scaleX: 1.6 * k, scaleY: 0.7 * k, alpha: 0, duration: 650, ease: "Quad.easeOut", onComplete: () => ring.destroy() });
      for (let i = 0; i < 16; i++) { const a = Math.random() * 6.28, d = (30 + Math.random() * 50) * k, s = this._add(sc.add.image(x, y - 8, "spark").setDepth(y + 61).setBlendMode(ADD()).setScale(1.2)); sc.tweens.add({ targets: s, x: x + Math.cos(a) * d, y: y - 8 + Math.sin(a) * d * 0.7 - 10, alpha: 0, duration: 500 + Math.random() * 400, ease: "Quad.easeOut", onComplete: () => s.destroy() }); }
      FX.dust.call(this, sc, x, y, { n: 10, scale: 1.6 * k, color: 0x6a5a50 }); FX.smoke.call(this, sc, x, y, { ms: 1200, scale: 1.3 * k, color: 0x403a38 });
      this.shake(o.shake != null ? o.shake : 5, 420); this.flash("#ffd8a0", 240); sfx("fire");
    },
    portal(sc, x, y, o) {
      const col = o.color != null ? o.color : 0x9a4dff, life = o.ms == null ? 5000 : o.ms, k = o.scale || 1;
      const g = this._add(sc.add.image(x, y - 30 * k, "pglow").setDepth(y + 40).setBlendMode(ADD()).setScale(0.2 * k).setAlpha(0.9)); if (o.color != null) g.setTint(col);
      const sw = [0, 1].map(i => this._add(sc.add.image(x, y - 30 * k, "cin_swirl").setDepth(y + 41).setBlendMode(ADD()).setTint(col).setScale((0.15 + i * 0.1) * k).setAlpha(0.9)));
      sc.tweens.add({ targets: g, scale: 1.3 * k, duration: 800, ease: "Back.easeOut" }); sc.tweens.add({ targets: sw, scale: 0.8 * k, duration: 800, ease: "Back.easeOut" });
      sc.tweens.add({ targets: sw[0], angle: 360, duration: 2400, repeat: -1 }); sc.tweens.add({ targets: sw[1], angle: -360, duration: 1700, repeat: -1 });
      const t = this._every(90, () => { const a = Math.random() * 6.28, d = (50 + Math.random() * 30) * k, s = sc.add.image(x + Math.cos(a) * d, y - 30 * k + Math.sin(a) * d * 0.8, "star").setDepth(y + 42).setBlendMode(ADD()).setTint(col).setScale(1.2); this._add(s); sc.tweens.add({ targets: s, x, y: y - 30 * k, alpha: 0, duration: 650, onComplete: () => s.destroy() }); }, 0);
      if (life > 0) sc.time.delayedCall(life, () => { try { t.remove(false); sc.tweens.add({ targets: [g, ...sw], scale: 0, alpha: 0, duration: 600, onComplete: () => [g, ...sw].forEach(q => q.destroy()) }); } catch (e) { /* ignore */ } });
    },
  };
  FX.saltRain = function (sc, x, y, o) { FX.rain.call(this, sc, x, y, Object.assign({}, o, { salt: true })); };
  FX.sand = function (sc, x, y, o) { FX.dust.call(this, sc, x, y, o); };

  Cinema.stage = guard("stage", async (fn, o) => {
    let sc = null; try { sc = await ready(); } catch (e) { sc = null; }
    const c = new Stage(sc, o); activeFrames++;
    let began = false;
    try { await c._begin(); began = true; await fn(c); }
    catch (e) { console.warn("Cinema.stage scene failed:", e); if (e && e.constructor && e.constructor.name === "Interrupt") { try { await c._end(); } catch (er) { /* ignore */ } throw e; } }
    try { await c._end(); } catch (e) { console.warn("Cinema.stage cleanup failed:", e); }
  });
  Cinema.Stage = Stage;

  // ===================================================================================================================================
  // Cinema.panels: illustrated story panels with a slow pan/zoom and a typed caption
  // ===================================================================================================================================
  const PANS = {
    in: [{ s: 1.0, x: 0, y: 0 }, { s: 1.16, x: 0, y: 0 }], out: [{ s: 1.16, x: 0, y: 0 }, { s: 1.0, x: 0, y: 0 }],
    left: [{ s: 1.14, x: -6, y: 0 }, { s: 1.14, x: 6, y: 0 }], right: [{ s: 1.14, x: 6, y: 0 }, { s: 1.14, x: -6, y: 0 }],
    up: [{ s: 1.14, x: 0, y: -5 }, { s: 1.14, x: 0, y: 5 }], down: [{ s: 1.14, x: 0, y: 5 }, { s: 1.14, x: 0, y: -5 }],
    inleft: [{ s: 1.04, x: 4, y: 0 }, { s: 1.18, x: -3, y: 0 }], inright: [{ s: 1.04, x: -4, y: 0 }, { s: 1.18, x: 3, y: 0 }], inup: [{ s: 1.04, x: 0, y: -3 }, { s: 1.18, x: 0, y: 3 }], indown: [{ s: 1.04, x: 0, y: 3 }, { s: 1.18, x: 0, y: -3 }],
    still: [{ s: 1.02, x: 0, y: 0 }, { s: 1.02, x: 0, y: 0 }],
  };
  const PAN_ORDER = ["in", "left", "out", "right", "inup", "inleft"];
  Cinema.panels = guard("panels", async (list, o = {}) => {
    if (!Array.isArray(list)) list = list ? [list] : []; if (!list.length) return;
    ensureLayer(); if (o.music !== undefined) music(o.music);
    const prevMusic = o.restoreMusic && window.Audio && Audio.current ? Audio.current() : null;
    const root = mkEl("full", null); root.style.opacity = 0; root.style.transition = "opacity .6s";
    const hint = mkEl("hint tl", "Esc: skip", root); const nextHint = mkEl("hint", "Enter", root);
    let skipAll = false, adv = null; const inst = instant();
    const off = keys(e => { if (ADV.includes(e.key)) { if (adv) adv(); return true; } if (e.key === "Escape") { skipAll = true; if (adv) adv(); return true; } return false; });
    root.addEventListener("pointerdown", () => { if (adv) adv(); });
    await sleepRaw(30); root.style.opacity = 1; await sleepRaw(inst ? 60 : 500);
    let prev = null;
    for (let i = 0; i < list.length && !skipAll; i++) {
      const p = typeof list[i] === "string" ? { text: list[i] } : list[i] || {}, img = p.img || p.image, text = p.text || "";
      const el = mkEl("pnl", null, root); root.insertBefore(el, hint);
      const im = mkEl("im", null, el), shade = mkEl("shade", null, el); const cap = mkEl("cap", (p.big ? `<div class="bg">${esc(p.big)}</div>` : "") + `<div class="tx"></div>`, el);
      const tx = cap.querySelector(".tx");
      if (img) { const probe = new Image(); const ok = await new Promise(res => { probe.onload = () => res(true); probe.onerror = () => res(false); probe.src = img; setTimeout(() => res(false), 7000); }); if (ok) im.style.backgroundImage = `url("${img}")`; else el.classList.add("miss"); } else el.classList.add("miss");
      // pan / zoom from -> to
      let pan = p.pan; if (!pan) pan = PAN_ORDER[i % PAN_ORDER.length]; const pr = typeof pan === "string" ? PANS[pan] || PANS.in : [pan.from || PANS.in[0], pan.to || PANS.in[1]];
      const tr = q => `translate(${q.x || 0}%, ${q.y || 0}%) scale(${q.s || 1})`;
      const dur = (p.ms || clamp(text.length * 60 + 4500, 7000, 15000));
      im.style.transition = "none"; im.style.transform = tr(pr[0]);
      el.classList.add("on"); if (prev) { const old = prev; old.classList.remove("on"); setTimeout(() => old.remove(), 800); }
      if (!inst) { await sleepRaw(30); im.style.transition = `transform ${dur / speedF() * 1.0}ms linear`; im.style.transform = tr(pr[1]); }
      if (p.sfx) sfx(p.sfx); if (p.shake) el.style.animation = "uishake .5s 2";
      // typed text, then wait for Enter
      let typed = false, timer = 0, pos = 0; const step = Math.max(1, Math.round(1.1 / (window.UI_SPEED || 1)) * (speedF() < 0.6 ? 2 : 1));
      if (inst || !text) { tx.textContent = text; typed = true; }
      else timer = setInterval(() => { pos = Math.min(text.length, pos + step); tx.textContent = text.slice(0, pos); if (pos >= text.length) { typed = true; clearInterval(timer); } }, 22);
      await new Promise(res => {
        const t0 = performance.now();
        adv = () => { if (performance.now() - t0 < 250) return; if (!typed) { typed = true; clearInterval(timer); tx.textContent = text; return; } adv = null; res(); };
        if (inst) setTimeout(() => { adv = null; res(); }, 200);
        if (!text) setTimeout(() => { if (adv) { typed = true; adv = null; res(); } }, inst ? 400 : clamp(dur * 0.6, 3500, 8000) * speedF());   // a panel without text moves on by itself
      });
      clearInterval(timer); prev = el;
    }
    off(); root.style.opacity = 0; await sleepRaw(650); root.remove();
    if (prevMusic) music(prevMusic);
  });

  // ===================================================================================================================================
  // Cinema.voyage: a boat crossing a painted sea, with a route line
  // ===================================================================================================================================
  // known ports on a 960x540 sea chart: west coast Sehkarem (desert) at the left, east coast Ixcalo (jungle) at the right
  const PORTS = {
    saltgate: [150, 360, "Saltgate"], brassharbour: [170, 215, "Brass Harbour"], gullrest: [470, 330, "Gullrest"], creepingshore: [800, 355, "Creeping Shore"], ixcalo: [800, 355, "Ixcalo"],
    cindercrown: [520, 175, "Cinder Crown"], maelstrom: [610, 400, "Maelstrom Straits"], starfall: [470, 70, "Starfall Isles"], starhaven: [470, 70, "Starhaven"], ahuacan: [830, 240, "Ahuacan"], tzavan: [820, 150, "Tzavan"], saltmere: [150, 120, "Saltmere"],
  };
  const portOf = (name, dflt) => { const k = String(name || "").toLowerCase().replace(/[^a-z]/g, ""); const p = PORTS[k] || Object.entries(PORTS).find(([key]) => k && (k.includes(key) || key.includes(k)))?.[1]; return p ? { x: p[0], y: p[1], name: p[2] } : { x: dflt[0], y: dflt[1], name: String(name || "") }; };
  Cinema.ports = PORTS;
  function coast(ctx, side, t, mood) {                               // painted coastline polygons with soft shading, drawn into the 960x540 chart
    const west = side === "w", sandA = mood.night ? "#6a5238" : "#c8a468", sandB = mood.night ? "#463422" : "#a07a42", grassA = mood.night ? "#1b3a26" : "#3f7a46", grassB = mood.night ? "#0f2418" : "#2a5a34";
    const edge = x => west ? x : W - x, pts = [];
    for (let y = -10; y <= H + 10; y += 10) { const w = 110 + 70 * Math.sin(y * 0.021 + (west ? 1 : 4)) + 40 * Math.sin(y * 0.057 + 2) + 18 * Math.sin(y * 0.15); pts.push([edge(w), y]); }
    const path = (off) => { ctx.beginPath(); ctx.moveTo(edge(-20), -20); pts.forEach(([x, y]) => ctx.lineTo(x + (west ? off : -off), y)); ctx.lineTo(edge(-20), H + 20); ctx.closePath(); };
    ctx.save(); path(26); ctx.fillStyle = mood.night ? "rgba(70,150,160,.22)" : "rgba(120,220,220,.3)"; ctx.fill();   // shallows
    path(10); ctx.fillStyle = mood.night ? "rgba(150,210,220,.3)" : "rgba(235,250,250,.55)"; ctx.fill();                         // foam
    path(0); const g = ctx.createLinearGradient(edge(0), 0, edge(150), 0); g.addColorStop(0, west ? sandA : grassA); g.addColorStop(1, west ? sandB : grassB); ctx.fillStyle = g; ctx.fill(); ctx.clip();
    let seed = west ? 11 : 29; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    for (let i = 0; i < 360; i++) { const x = rnd() * 150, y = rnd() * H; ctx.fillStyle = west ? (rnd() < 0.5 ? sandA : sandB) : (rnd() < 0.5 ? grassA : grassB); ctx.globalAlpha = 0.5; const r = 3 + rnd() * 7; ctx.beginPath(); ctx.ellipse(edge(x), y, r, r * 0.6, 0, 0, 7); ctx.fill(); }
    if (!west) { for (let i = 0; i < 90; i++) { const x = 40 + rnd() * 120, y = rnd() * H; ctx.globalAlpha = 0.8; ctx.fillStyle = mood.night ? "#0a1a10" : "#1e4a28"; ctx.beginPath(); ctx.arc(edge(x), y, 6 + rnd() * 6, 0, 7); ctx.fill(); ctx.fillStyle = mood.night ? "#16301e" : "#356a3a"; ctx.beginPath(); ctx.arc(edge(x) - 2, y - 3, 4 + rnd() * 4, 0, 7); ctx.fill(); } }
    else { for (let i = 0; i < 40; i++) { const x = 30 + rnd() * 100, y = rnd() * H; ctx.globalAlpha = 0.35; ctx.strokeStyle = sandB; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 14, y - 5, x + 30, y); ctx.stroke(); } }
    ctx.restore();
  }
  function paintSea(canvas, img, mood) {
    const ctx = canvas.getContext("2d");
    if (img) { ctx.drawImage(img, 0, 0, W, H); ctx.fillStyle = mood.night ? "rgba(4,16,26,.35)" : "rgba(10,40,60,.15)"; ctx.fillRect(0, 0, W, H); }
    else { const g = ctx.createLinearGradient(0, 0, 0, H); if (mood.night) { g.addColorStop(0, "#071a2a"); g.addColorStop(1, "#0b2a3c"); } else { g.addColorStop(0, "#1a5a78"); g.addColorStop(1, "#1d7a8c"); } ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); let seed = 5; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296); for (let i = 0; i < 900; i++) { const x = rnd() * W, y = rnd() * H, l = 8 + rnd() * 22; ctx.strokeStyle = mood.night ? `rgba(120,190,210,${0.05 + rnd() * 0.1})` : `rgba(210,245,250,${0.08 + rnd() * 0.14})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + l / 2, y - 3, x + l, y); ctx.stroke(); } }
    coast(ctx, "w", 0, mood); coast(ctx, "e", 0, mood);
    // chart graticule, faint
    ctx.strokeStyle = "rgba(240,220,170,.07)"; ctx.lineWidth = 1; for (let x = 0; x < W; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = 0; y < H; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  }
  const loadImg = url => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = url; setTimeout(() => res(null), 7000); });
  Cinema.voyage = guard("voyage", async (o = {}) => {
    const lines = [].concat(o.text || []).filter(Boolean);
    if (instant()) { if (lines.length) await sayLines(lines.map(t => ["narr", t])); return; }
    ensureLayer();
    const mood = { night: o.mood ? o.mood === "night" : true };
    const from = portOf(o.from, [150, 360]), to = portOf(o.to, [800, 355]);
    const route = o.route ? o.route.map(([x, y]) => ({ x, y })) : (() => { const mx = (from.x + to.x) / 2, my = Math.min(from.y, to.y) - 40 - Math.abs(from.y - to.y) * 0.2; return [from, { x: lerp(from.x, mx, 0.9), y: lerp(from.y, my, 0.6) }, { x: mx, y: my }, { x: lerp(to.x, mx, 0.8), y: lerp(to.y, my, 0.6) + 10 }, to]; })();
    const [seaImg, ship] = await Promise.all([loadImg("assets/cinema/" + (mood.night ? "sea_night" : "sea_day") + ".png"), loadImg("assets/regions/sprites/harborShip.png")]);
    const root = mkEl("voy", null), cv = document.createElement("canvas"); cv.width = W; cv.height = H; root.appendChild(cv);
    const bg = document.createElement("canvas"); bg.width = W; bg.height = H; paintSea(bg, seaImg, mood);
    const cap = mkEl("cap", "", root); mkEl("hint tl", "Esc: skip", root);
    const ctx = cv.getContext("2d");
    // the route as a smooth polyline sampled into points (Catmull-Rom)
    const pts = [];
    for (let i = 0; i < route.length - 1; i++) { const p0 = route[Math.max(0, i - 1)], p1 = route[i], p2 = route[i + 1], p3 = route[Math.min(route.length - 1, i + 2)]; for (let t = 0; t < 1; t += 0.04) { const t2 = t * t, t3 = t2 * t; pts.push({ x: 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3), y: 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3) }); } }
    pts.push(route[route.length - 1]);
    const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y)); const total = cum[cum.length - 1] || 1;
    const at = d => { d = clamp(d, 0, total); let i = 1; while (i < cum.length - 1 && cum[i] < d) i++; const t = (d - cum[i - 1]) / ((cum[i] - cum[i - 1]) || 1); return { x: lerp(pts[i - 1].x, pts[i].x, t), y: lerp(pts[i - 1].y, pts[i].y, t), a: Math.atan2(pts[i].y - pts[i - 1].y, pts[i].x - pts[i - 1].x), i }; };
    const f = speedF(), D = (o.ms || Math.max(9000, lines.length * 4200 + 2500)) * f;
    let skipAll = false, jump = false, done = false, li = -1, seed = 7; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    const off = keys(e => { if (e.key === "Escape") { skipAll = true; return true; } if (ADV.includes(e.key)) { jump = true; return true; } return false; }); root.addEventListener("pointerdown", () => (jump = true));
    const gulls = Array.from({ length: 5 }, () => ({ x: rnd() * W, y: 60 + rnd() * 160, v: 18 + rnd() * 20, p: rnd() * 6 }));
    const setCap = idx => { if (idx === li) return; li = idx; cap.classList.remove("on"); setTimeout(() => { if (li === idx) { cap.textContent = lines[idx] || ""; cap.classList.add("on"); } }, idx === 0 ? 0 : 450); };
    const draw = (k, now) => {
      const kk = easeIO(clamp((k - 0.06) / 0.88, 0, 1)), pos = at(kk * total), tm = now * 0.001;
      ctx.clearRect(0, 0, W, H); ctx.drawImage(bg, 0, 0);
      for (let i = 0; i < 70; i++) { const x = (i * 137.5 + tm * (10 + (i % 5) * 4)) % (W + 40) - 20, y = (i * 91.7) % H, l = 10 + (i % 4) * 5, yy = y + Math.sin(tm + i) * 2; ctx.strokeStyle = `rgba(190,235,245,${0.05 + 0.07 * Math.sin(tm * 1.3 + i)})`; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x, yy); ctx.quadraticCurveTo(x + l / 2, yy - 3, x + l, yy); ctx.stroke(); }
      ctx.save(); ctx.lineCap = "round"; ctx.setLineDash([2, 9]); ctx.lineWidth = 3; ctx.strokeStyle = "rgba(242,193,78,.22)"; ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.stroke();
      ctx.strokeStyle = "rgba(255,214,110,.95)"; ctx.shadowColor = "#ffb040"; ctx.shadowBlur = 8; ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y); for (let i = 1; i <= pos.i && i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y); ctx.lineTo(pos.x, pos.y); ctx.stroke(); ctx.restore();
      for (const [p, lit] of [[from, 1], [to, k > 0.9 ? 1 : 0.55]]) { ctx.save(); ctx.globalAlpha = lit; ctx.fillStyle = "#1a0f14"; ctx.beginPath(); ctx.arc(p.x, p.y, 7, 0, 7); ctx.fill(); ctx.fillStyle = "#f2c14e"; ctx.beginPath(); ctx.arc(p.x, p.y, 4.5, 0, 7); ctx.fill(); ctx.font = "20px 'Marcellus SC', serif"; ctx.textAlign = "center"; ctx.fillStyle = "#f4e9d4"; ctx.shadowColor = "#000"; ctx.shadowBlur = 6; ctx.fillText(p.name, p.x, p.y - 16); ctx.restore(); }
      const bob = Math.sin(tm * 2.2) * 1.5, sw = 78, sh = ship ? sw * ship.height / ship.width : 50, right = Math.cos(pos.a) >= 0;
      ctx.save(); ctx.translate(pos.x, pos.y + bob); ctx.rotate(clamp(Math.sin(pos.a) * 0.18, -0.25, 0.25) * (right ? 1 : -1)); if (!right) ctx.scale(-1, 1);
      ctx.fillStyle = "rgba(230,250,255,.25)"; ctx.beginPath(); ctx.ellipse(-sw * 0.55, sh * 0.32, sw * 0.5, 5, 0, 0, 7); ctx.fill(); ctx.fillStyle = "rgba(0,0,0,.3)"; ctx.beginPath(); ctx.ellipse(0, sh * 0.34, sw * 0.42, 6, 0, 0, 7); ctx.fill();
      if (ship) { ctx.imageSmoothingEnabled = false; ctx.scale(-1, 1); ctx.drawImage(ship, -sw / 2, -sh * 0.78, sw, sh); } else { ctx.fillStyle = "#5a3a22"; ctx.beginPath(); ctx.moveTo(-26, 0); ctx.lineTo(28, 0); ctx.lineTo(20, 12); ctx.lineTo(-18, 12); ctx.fill(); ctx.fillStyle = "#e8dcc0"; ctx.beginPath(); ctx.moveTo(0, -34); ctx.lineTo(22, -4); ctx.lineTo(0, -4); ctx.fill(); }
      ctx.restore();
      for (const g of gulls) { g.x += g.v * 0.016; if (g.x > W + 20) g.x = -20; const fl = Math.sin(tm * 6 + g.p); ctx.strokeStyle = "rgba(235,235,225,.8)"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(g.x - 7, g.y + fl * 3); ctx.lineTo(g.x, g.y); ctx.lineTo(g.x + 7, g.y + fl * 3); ctx.stroke(); }
      const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.4, W / 2, H / 2, W * 0.62); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,.6)"); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
      if (lines.length) setCap(Math.min(lines.length - 1, Math.floor(k * lines.length * 0.999)));
    };
    music(o.music); sfx("waves"); await sleepRaw(30); root.style.opacity = 1;
    let elapsed = 0, last = performance.now();
    await new Promise(res => {
      const step = () => {
        if (done) return res();
        const now = performance.now(); elapsed += Math.min(100, now - last); last = now;
        if (jump) { jump = false; const nl = li + 1; if (!lines.length || nl >= lines.length) { done = true; return res(); } elapsed = (nl / lines.length) * D + 30; }
        if (skipAll) { done = true; return res(); }
        const k = clamp(elapsed / D, 0, 1); try { draw(k, now); } catch (e) { done = true; console.warn("voyage draw", e); return res(); }
        if (k >= 1) { done = true; return res(); }
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
    off(); if (!skipAll) await sleepRaw(900 * f); root.style.opacity = 0; await sleepRaw(850); root.remove();
  });

  // ===================================================================================================================================
  // Cinema.boss: a short 3D reveal in its own overlay (Three.js r128), then the fight starts
  // ===================================================================================================================================
  // arena looks copied from src/arena3d.js ARENAS; later arena keys use a look-alike until ARENA exposes Arena3D.arenaDef(key) -> { floor, pano, fog, fogNear, fogFar, sun, sunI, amb, hemi, torches, torch, dust, tint, rocks }
  const A_LOOK = {
    desert: { floor: "floor_sand", pano: "pano_desert", fog: 0x2a1610, fogNear: 22, fogFar: 70, sun: 0xffb070, sunI: 0.9, amb: 0.75, hemi: 0.9, torches: false, rocks: true, dust: 0xffe0b0 },
    temple: { floor: "floor_stone", pano: "pano_temple", fog: 0x0c0907, fogNear: 14, fogFar: 48, sun: 0x8a7a6a, sunI: 0.35, amb: 0.45, hemi: 0.6, torches: true, dust: 0xffa060 },
    cistern: { floor: "floor_stone", pano: "pano_temple", fog: 0x0a1418, fogNear: 12, fogFar: 42, sun: 0x6a8a9a, sunI: 0.4, amb: 0.5, hemi: 0.65, torches: true, dust: 0x9fd8ff, torch: 0x4aa8d8, tint: 0x9ec8d8 },
    undercroft: { floor: "floor_stone", pano: "pano_temple", fog: 0x0e100a, fogNear: 12, fogFar: 40, sun: 0x8a8a6a, sunI: 0.3, amb: 0.5, hemi: 0.6, torches: true, dust: 0xc8d8a0, torch: 0xffc060 },
    quarry: { floor: "floor_sand", pano: "pano_desert", fog: 0x2e1a12, fogNear: 20, fogFar: 62, sun: 0xff9a5a, sunI: 1.0, amb: 0.7, hemi: 0.8, torches: false, rocks: true, dust: 0xe0a070 },
    flats: { floor: "floor_sand", pano: "pano_desert", fog: 0x2a0e08, fogNear: 16, fogFar: 54, sun: 0xff6a3a, sunI: 1.1, amb: 0.6, hemi: 0.7, torches: true, rocks: true, dust: 0xff8a40, torch: 0xff5a20 },
    boneMaze: { floor: "floor_stone", pano: "pano_temple", fog: 0x14110c, fogNear: 12, fogFar: 40, sun: 0xb0a890, sunI: 0.35, amb: 0.5, hemi: 0.6, torches: true, dust: 0xe8e0c8 },
  };
  const A_ALIAS = { ruins: "temple", dunes: "desert", basin: "desert", hollow: "temple", maze: "boneMaze" };
  const A_LIKE = {   // [base look, overrides] for the arena keys of chapters 3+ (guesses by name; ARENA's real definitions win once exposed)
    shore: ["desert", { fog: 0x1a2630, tint: 0xb8d8e0, sun: 0xd8e8f0, dust: 0xcfe8f0 }], river: ["desert", { fog: 0x14262a, tint: 0xa0d0c8, dust: 0xbfe8e0 }], riverCave: ["cistern", { fog: 0x0a1a18, torch: 0x58d8a8 }],
    jungle: ["desert", { fog: 0x0e1c12, tint: 0x9ad0a0, sun: 0xd8f0b0, dust: 0xc8f0a0, amb: 0.6 }], canopy: ["desert", { fog: 0x10241a, tint: 0xa8e0b0, sun: 0xf0ffc0, dust: 0xd8ffb0 }], fort: ["temple", { fog: 0x14100c, torch: 0xff9a40 }],
    pyramid: ["temple", { torch: 0xffa040, fog: 0x100a08 }], pools: ["cistern", { torch: 0x68d8e8 }], sporeCave: ["cistern", { fog: 0x100a18, torch: 0xb06aff, dust: 0xd8a8ff }], aviary: ["desert", { fog: 0x1c2630, tint: 0xd8e8f8 }],
    spire: ["temple", { fog: 0x181c28, tint: 0xc8d0f0 }], lookout: ["desert", { fog: 0x1a1c24, tint: 0xd0d8e8 }], occupied: ["temple", { fog: 0x140a0a, torch: 0xff5a3a }], vault: ["temple", { fog: 0x0a0c10, torch: 0x7ab8ff }], coldVault: ["cistern", { fog: 0x080e14, tint: 0xb8d8f0, torch: 0x88c8ff }],
    oasisRuins: ["desert", { tint: 0xe8d8b8 }], harbourCoast: ["desert", { fog: 0x1a2430, tint: 0xc0d8e8 }], fenShrine: ["cistern", { fog: 0x0e1a12, torch: 0x88e8a0 }], giantQuarry: ["quarry", {}], sunbirdRoost: ["desert", { fog: 0x2a1a0a, sun: 0xffd070, tint: 0xfff0c0 }],
    seaDeck: ["desert", { fog: 0x10202c, tint: 0xa8c8e0, sun: 0xc8e0ff }], seaCave: ["cistern", {}], volcano: ["flats", { fog: 0x2a0a04, torch: 0xff4a10, sun: 0xff5020 }], underworld: ["boneMaze", { fog: 0x0a0610, torch: 0x9a5aff }],
    colosseum: ["desert", { fog: 0x2a1c12, tint: 0xf0d8b0 }], barracks: ["temple", { torch: 0xff8a3a }], sewer: ["cistern", { fog: 0x0c140c, torch: 0x88b858 }], palace: ["temple", { fog: 0x1a1008, torch: 0xffc060, tint: 0xf0e0c0 }], palaceGarden: ["desert", { fog: 0x1a2412, tint: 0xd8f0c0 }],
    saltFlats: ["desert", { fog: 0x24282c, tint: 0xf0f4ff, sun: 0xffffff }], orchard: ["desert", { fog: 0x1c2412, tint: 0xd8f0b0 }], saltMine: ["cistern", { fog: 0x14181c, tint: 0xe8f0ff, torch: 0xe8f0ff }], villa: ["temple", { torch: 0xffc060, tint: 0xf0e0c0 }], glassCistern: ["cistern", { tint: 0xc8f0ff }],
    prison: ["boneMaze", { fog: 0x0c0c10, torch: 0xff8a3a }], roots: ["boneMaze", { fog: 0x0e140c, torch: 0x78c85a, tint: 0xa8d890 }], hollowTree: ["boneMaze", { fog: 0x0e140c, torch: 0x78c85a }], trenches: ["desert", { fog: 0x24201c, tint: 0xd8c8b0 }], crypt: ["boneMaze", { torch: 0x8a8aff }],
    stormPeak: ["desert", { fog: 0x14182a, tint: 0xa8b0d8, sun: 0xb8c8ff }], prism: ["temple", { fog: 0x100c18, torch: 0xc88aff, tint: 0xe0d0ff }], greatPyramid: ["temple", { fog: 0x14080a, torch: 0xffa040, tint: 0xffe0b0 }], pyramidGate: ["temple", { torch: 0xffa040 }], sunCore: ["flats", { fog: 0x301206, sun: 0xffe090, torch: 0xffd070 }],
    starfall: ["desert", { fog: 0x0a0c1c, tint: 0xc0c8f8, sun: 0xb8c0ff, dust: 0xc8d0ff }], crater: ["quarry", { fog: 0x120e18, tint: 0xd0c0f0 }], drownedCity: ["cistern", { fog: 0x061418, tint: 0x9ae0e0, torch: 0x58e8d8 }], deepTrench: ["cistern", { fog: 0x03080e, tint: 0x6aa0c8, torch: 0x48a0e8 }],
  };
  function arenaLook(bg) {
    try { const ext = window.Arena3D && typeof Arena3D.arenaDef === "function" && Arena3D.arenaDef(bg); if (ext && (ext.floor || ext.floorUrl)) return Object.assign({}, A_LOOK.desert, ext); } catch (e) { /* use the built-in table */ }
    const key = A_ALIAS[bg] || bg; if (A_LOOK[key]) return A_LOOK[key];
    const like = A_LIKE[bg]; if (like) return Object.assign({}, A_LOOK[like[0]], like[1]);
    return A_LOOK.desert;
  }
  // how each boss makes its entrance. Story agents may add entries: Cinema.bossLooks.myBoss = { entrance: "land", glow: 0xff4040 }
  // entrance: rise (out of the floor) | land (falls from the sky) | uncoil (a serpent unwinds) | walk (marches in from the left) | emerge (fades in out of the dark with lightning)
  const BOSS_LOOKS = {
    raidOptioKarvan: { entrance: "walk", glow: 0xff6a3a }, mazeGuardian: { entrance: "rise", glow: 0xe8e0c8 }, duneBearer: { entrance: "rise", glow: 0x8fe8ff },
    fortCenturion: { entrance: "walk", glow: 0xff6a3a }, windhollowGuardian: { entrance: "rise", glow: 0x9affc0 }, plumedCoil: { entrance: "uncoil", glow: 0x58e8b0 }, shearwing: { entrance: "land", glow: 0xd0f0ff }, motherGlowmoth: { entrance: "emerge", glow: 0xffe890 },
    drownedShrineGuardian: { entrance: "rise", glow: 0x58d8e8 }, stoneGiant: { entrance: "rise", glow: 0xffc070 }, sunbirdGuardian: { entrance: "land", glow: 0xffd070 }, motherOfTheMaelstrom: { entrance: "rise", glow: 0x58b8ff }, emberWolf: { entrance: "land", glow: 0xff6a20 }, gateHound: { entrance: "land", glow: 0x9a6aff },
    oldHollowbell: { entrance: "emerge", glow: 0xc8d8ff }, blackPearlHermit: { entrance: "rise", glow: 0xb0a0ff }, bronzeChampion: { entrance: "walk", glow: 0xffc060 }, bronzeBeast: { entrance: "land", glow: 0xffc060 },
    veiledCisternGuardian: { entrance: "rise", glow: 0x88c8ff }, hollowNestGuardian: { entrance: "rise", glow: 0x78e85a }, rootGnawer: { entrance: "rise", glow: 0x78c85a }, ghostOfTheNinthLegion: { entrance: "emerge", glow: 0xff5a3a },
    prismGuardian: { entrance: "rise", glow: 0xd8a8ff }, mentorIthiel: { entrance: "walk", glow: 0xc8a8ff }, stormRam: { entrance: "land", glow: 0x8ab8ff }, emperorDavichi: { entrance: "walk", glow: 0xff3a3a }, sunEater: { entrance: "rise", glow: 0xffd060 },
  };
  Cinema.bossLooks = BOSS_LOOKS;
  function lookOf(id, mkind) {
    if (BOSS_LOOKS[id]) return BOSS_LOOKS[id];
    if (/coil|serpent|wyrm|snake|viper|hydra/i.test(id)) return { entrance: "uncoil", glow: 0x58e8b0 };
    if (/hound|wolf|ram|beast|bird|wing|drake|hawk/i.test(id)) return { entrance: "land", glow: 0xff8a40 };
    if (/ghost|wraith|spirit|hermit|hollowbell|moth/i.test(id)) return { entrance: "emerge", glow: 0xc8d8ff };
    if (mkind === "human" || /champion|davichi|ithiel|admiral|centurion|optio|mentor|captain|twin|general/i.test(id)) return { entrance: "walk", glow: 0xff8a40 };
    return { entrance: "rise", glow: 0xffb070 };
  }
  let bRenderer = null, bManifest = null; const texCache = {}, gltfCache = {};
  const loadTex3 = url => texCache[url] || (texCache[url] = new Promise(res => new THREE.TextureLoader().load(url, t => { t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; res(t); }, undefined, () => res(null))));
  const loadGLB = url => gltfCache[url] || (gltfCache[url] = new Promise(res => { try { new THREE.GLTFLoader().load(url, g => res(g), undefined, () => res(null)); } catch (e) { res(null); } }));
  async function getManifest() {
    if (bManifest && Object.keys(bManifest).length) return bManifest;
    try { const m = window.Arena3D && Arena3D.manifest && Arena3D.manifest(); if (m && Object.keys(m).length) return (bManifest = m); } catch (e) { /* fetch it ourselves */ }
    try { const r = await fetch("assets/models/manifest.json"); if (r.ok) bManifest = await r.json(); } catch (e) { /* no manifest */ }
    return bManifest || {};
  }
  const mfile = f => (f.startsWith("assets/") ? f : f.startsWith("models/") ? "assets/" + f : "assets/models/" + f);
  const SRC_FALLBACK = { duneBearer: "assets/models/duneBearer.glb", knight: "assets/models/dreadKnight.glb" };
  async function loadBossModel(key) {
    const man = (await getManifest())[key] || {}, tries = [];
    if (man.file) tries.push([mfile(man.file), man.yaw || 0]); if (SRC_FALLBACK[key]) tries.push([SRC_FALLBACK[key], man.yaw || 0]);
    if (!man.file) tries.push(["assets/models/" + key + ".glb", 0], ["assets/models/" + key + "_static.glb", 0]);
    for (const [url, yaw] of tries) { const g = await loadGLB(url); if (g) return { kind: "model", gltf: g, yaw, mscale: man.scale || 1, mkind: man.kind }; }
    for (const url of ["assets/creatures/" + key + ".png", "assets/" + key + ".png"]) { const t = await loadTex3(url); if (t) return { kind: "sprite", tex: t, mscale: man.scale || 1, mkind: man.kind }; }
    return { kind: "none", mscale: man.scale || 1, mkind: man.kind };
  }
  const B_HEIGHT = { knight: 2.3, duneBearer: 6.2, scorpion: 2.0, jackal: 2.1, legion: 2.9, raidOptioKarvan: 3.4 }, B_KIND_H = { creature: 2.9, enemy: 2.6, boss: 5.6, human: 2.9 };
  function posedBox(root) { root.updateMatrixWorld(true); const box = new THREE.Box3(), v = new THREE.Vector3(); root.traverse(o => { if (!o.isMesh) return; const p = o.geometry.attributes.position, step = Math.max(1, Math.floor(p.count / 4000)); for (let i = 0; i < p.count; i += step) { if (o.isSkinnedMesh) o.boneTransform(i, v); else v.fromBufferAttribute(p, i); box.expandByPoint(v.applyMatrix4(o.matrixWorld)); } }); return box; }
  function fitModel(m, height) { let b = posedBox(m); const sz = b.getSize(new THREE.Vector3()).y || 1; m.scale.multiplyScalar(height / sz); b = posedBox(m); const c = b.getCenter(new THREE.Vector3()); m.position.set(m.position.x - c.x, m.position.y - b.min.y, m.position.z - c.z); }
  function matte(m) { m.traverse(o => { if (o.isMesh) { o.material = Array.isArray(o.material) ? o.material.map(x => x.clone()) : o.material.clone(); if ("metalness" in o.material) { o.material.metalness = 0; o.material.roughness = 0.9; } } }); }
  const softTex = (() => { let t = null; return () => { if (t) return t; const c = document.createElement("canvas"); c.width = c.height = 64; const x = c.getContext("2d"), g = x.createRadialGradient(32, 32, 1, 32, 32, 31); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.45, "rgba(255,255,255,.45)"); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return (t = new THREE.CanvasTexture(c)); }; })();
  const ringTex = (() => { let t = null; return () => { if (t) return t; const c = document.createElement("canvas"); c.width = c.height = 128; const x = c.getContext("2d"), g = x.createRadialGradient(64, 64, 40, 64, 64, 63); g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(0.7, "rgba(255,255,255,.9)"); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return (t = new THREE.CanvasTexture(c)); }; })();
  const sfxKeys = { list: null };
  function sfxOr(key, fallback) { try { if (sfxKeys.list === null) { sfxKeys.list = []; if (window.Audio && Audio.manifest) Audio.manifest(m => { sfxKeys.list = Object.keys(m || {}); }); } sfx(sfxKeys.list.includes(key) ? key : fallback); } catch (e) { sfx(fallback); } }
  const smooth = t => t * t * (3 - 2 * t);

  async function buildReveal(o) {
    if (!(window.THREE && THREE.GLTFLoader && THREE.WebGLRenderer)) return null;
    const A = arenaLook(o.bg || "desert"), id = o.id || "", def = (window.Core && Core.ENEMIES && Core.ENEMIES[id]) || {}, key = o.art || def.art || id;
    const [model, floorT, panoT] = await Promise.all([loadBossModel(key), loadTex3(A.floorUrl || "assets/" + A.floor + ".png"), loadTex3(A.panoUrl || "assets/" + A.pano + ".png")]);
    const looks = Object.assign({}, lookOf(id, model.mkind), o.look || {}), entrance = o.entrance || looks.entrance, glow = o.glow != null ? o.glow : looks.glow;
    const h = (o.height || (B_HEIGHT[key] || B_KIND_H[model.mkind || "boss"] || 5.6) * (model.mscale || 1) * (def.vscale || 1)) * (o.scale || 1);
    const P = new THREE.Vector3(o.x != null ? o.x : -5, 0, o.z != null ? o.z : -1), isModel = model.kind === "model";
    if (!bRenderer) { bRenderer = new THREE.WebGLRenderer({ antialias: true }); }
    const renderer = bRenderer; renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(42, 16 / 9, 0.1, 220);
    scene.background = new THREE.Color(A.fog); scene.fog = new THREE.Fog(A.fog, A.fogNear, A.fogFar);
    const resize = () => { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; const hHalf = Math.atan(Math.tan(THREE.MathUtils.degToRad(21)) * 16 / 9); camera.fov = Math.min(95, Math.max(42, THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(hHalf) / camera.aspect)))); camera.updateProjectionMatrix(); };
    // floor, panorama, lights, torches, dust (same recipe as the arena)
    const world = new THREE.Group(); scene.add(world);
    if (floorT) { const ft = floorT.clone(); ft.needsUpdate = true; ft.wrapS = ft.wrapT = THREE.RepeatWrapping; ft.repeat.set(16, 16); const fl = new THREE.Mesh(new THREE.PlaneGeometry(140, 140), new THREE.MeshLambertMaterial({ map: ft, color: A.tint || 0xffffff })); fl.rotation.x = -Math.PI / 2; world.add(fl); }
    else { const fl = new THREE.Mesh(new THREE.PlaneGeometry(140, 140), new THREE.MeshLambertMaterial({ color: 0x2a2018 })); fl.rotation.x = -Math.PI / 2; world.add(fl); }
    if (panoT) { const pt = panoT.clone(); pt.needsUpdate = true; pt.wrapS = THREE.MirroredRepeatWrapping; pt.repeat.set(4, 1); const pano = new THREE.Mesh(new THREE.CylinderGeometry(60, 60, 34, 64, 1, true), new THREE.MeshBasicMaterial({ map: pt, side: THREE.BackSide, fog: false, color: A.tint || 0xffffff })); pano.position.y = A.floor === "floor_stone" ? 13 : 9; world.add(pano); }
    world.add(new THREE.AmbientLight(0xffffff, A.amb), new THREE.HemisphereLight(0xfff0dd, 0x6a4a30, A.hemi));
    const sun = new THREE.DirectionalLight(A.sun, A.sunI); sun.position.set(-10, 14, 8); world.add(sun);
    const torchLights = [];
    if (A.torches) [[-9, -7], [9, -7], [-12, 6], [12, 6]].forEach(([x, z]) => { const l = new THREE.PointLight(A.torch || 0xff8a3a, 1.6, 22, 2); l.position.set(x, 3.2, z); world.add(l); torchLights.push(l); const fm = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), new THREE.MeshBasicMaterial({ color: A.torch || 0xffb060 })); fm.position.copy(l.position); world.add(fm); });
    if (A.rocks !== false && !A.torches) { const rockMat = new THREE.MeshPhongMaterial({ color: 0x9a6a44, flatShading: true, shininess: 0 }); for (let i = 0; i < 26; i++) { const a = i * 2.39, d = 7 + (i * 37 % 11), s = 0.25 + (i * 13 % 7) / 9, x = Math.cos(a) * d, z = Math.sin(a) * d - 2; const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), rockMat); rock.position.set(x, s * 0.35, z); rock.rotation.set(i, i * 2, i * 3); rock.scale.y = 0.6; world.add(rock); } }
    const dn = 260, dpos = new Float32Array(dn * 3); for (let i = 0; i < dn; i++) { dpos[i * 3] = (Math.random() - 0.5) * 40; dpos[i * 3 + 1] = Math.random() * 8; dpos[i * 3 + 2] = (Math.random() - 0.5) * 30; }
    const dg = new THREE.BufferGeometry(); dg.setAttribute("position", new THREE.BufferAttribute(dpos, 3)); const dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: A.dust || 0xffe0b0, size: 0.07, transparent: true, opacity: 0.7 })); world.add(dust);
    // the boss: group (position) > inner (entrance motion, yaw) > model
    const grp = new THREE.Group(); grp.position.copy(P); scene.add(grp); const inner = new THREE.Group(); grp.add(inner);
    let mixer = null, clips = {}, yawFix = model.yaw || 0, mats = [];
    if (isModel) {
      const m = THREE.SkeletonUtils ? THREE.SkeletonUtils.clone(model.gltf.scene) : model.gltf.scene.clone(true); matte(m);
      if (model.gltf.animations && model.gltf.animations.length) { mixer = new THREE.AnimationMixer(m); model.gltf.animations.forEach(c => { const n = c.name.toLowerCase(); ["idle", "walk", "slash", "hurt", "jump"].forEach(k => { if (n.includes(k)) clips[k] = c; }); }); const base = clips.idle || clips.walk; if (base) { const ac = mixer.clipAction(base); ac.play(); if (!clips.idle) ac.timeScale = 0; } mixer.update(0); }
      if (def.vtint) m.traverse(q => { if (q.isMesh && q.material && q.material.color) q.material.color.multiply(new THREE.Color(def.vtint)); });
      fitModel(m, h); inner.add(m); m.traverse(q => { if (q.isMesh) (Array.isArray(q.material) ? q.material : [q.material]).forEach(x => mats.push(x)); });
    } else if (model.kind === "sprite") {
      const asp = model.tex.image ? model.tex.image.width / model.tex.image.height : 1, mesh = new THREE.Mesh(new THREE.PlaneGeometry(h * asp, h), new THREE.MeshBasicMaterial({ map: model.tex, transparent: true, alphaTest: 0.05, side: THREE.DoubleSide })); mesh.position.y = h / 2; mesh.scale.x = -1; inner.add(mesh); mats.push(mesh.material); yawFix = 0;
    } else {   // no art at all: a dark silhouette with two glowing eyes
      const body = new THREE.Mesh(new THREE.CylinderGeometry(h * 0.22, h * 0.32, h * 0.8, 10), new THREE.MeshLambertMaterial({ color: 0x120a0c })); body.position.y = h * 0.4; const head = new THREE.Mesh(new THREE.SphereGeometry(h * 0.17, 10, 8), new THREE.MeshLambertMaterial({ color: 0x120a0c })); head.position.y = h * 0.88;
      const eyeM = new THREE.MeshBasicMaterial({ color: glow }); [-1, 1].forEach(s => { const e = new THREE.Mesh(new THREE.SphereGeometry(h * 0.025, 6, 6), eyeM); e.position.set(h * 0.1, h * 0.9, s * h * 0.07); inner.add(e); }); inner.add(body, head); yawFix = 0;
    }
    // aura and rim light
    const aura = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex(), color: glow, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); aura.scale.set(h * 1.8, h * 1.5, 1); aura.position.set(0, h * 0.5, -1.2); grp.add(aura);
    const rim = new THREE.PointLight(glow, 0, 40, 2); rim.position.set(P.x + 3, h * 0.9, P.z - 5); scene.add(rim);
    const under = new THREE.PointLight(glow, 0, 16, 2); under.position.set(P.x, 0.6, P.z + 1.2); scene.add(under);
    // shadow blob and crack glow on the floor
    const shMat = new THREE.MeshBasicMaterial({ map: softTex(), color: 0x000000, transparent: true, opacity: 0.55, depthWrite: false }), shadow = new THREE.Mesh(new THREE.PlaneGeometry(h * 1.3, h * 0.7), shMat); shadow.rotation.x = -Math.PI / 2; shadow.position.set(P.x, 0.03, P.z); scene.add(shadow);
    const crackMat = new THREE.MeshBasicMaterial({ map: softTex(), color: glow, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }), crack = new THREE.Mesh(new THREE.PlaneGeometry(h * 1.4, h * 1.4), crackMat); crack.rotation.x = -Math.PI / 2; crack.position.set(P.x, 0.05, P.z); scene.add(crack);
    // dust puffs and shock rings
    const puffs = [], rings = [];
    const burst = (x, z, n, spread, up, size, col) => { for (let i = 0; i < n; i++) { const mat = new THREE.SpriteMaterial({ map: softTex(), color: col != null ? col : (A.dust || 0xd8c0a0), transparent: true, opacity: 0.55, depthWrite: false }), s = new THREE.Sprite(mat), a = Math.random() * 6.28, r = Math.random() * spread; s.position.set(x + Math.cos(a) * r * 0.4, 0.2 + Math.random() * 0.6, z + Math.sin(a) * r * 0.4); const sc0 = size * (0.6 + Math.random() * 0.8); s.scale.set(sc0, sc0, 1); scene.add(s); puffs.push({ s, vx: Math.cos(a) * (0.4 + Math.random() * 1.4) * spread * 0.25, vz: Math.sin(a) * (0.4 + Math.random() * 1.4) * spread * 0.25, vy: up * (0.5 + Math.random()), life: 0, max: 1.4 + Math.random() * 1.0, grow: 1.5 + Math.random() }); } };
    const shockwave = (x, z, size, col, ms) => { const mat = new THREE.MeshBasicMaterial({ map: ringTex(), color: col, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.08, z); scene.add(m); rings.push({ m, life: 0, max: ms || 0.9, size }); };
    // the camera: keyframes of position and look-at, smooth between them
    const Dst = clamp(h * 1.9, 11, 40), up = h * 0.5, face = a => (inner.rotation.y = yawFix - Math.PI / 2 + a);   // face(0): toward the camera, face(Math.PI/2): toward +x
    const K = entrance === "land" || entrance === "emerge"
      ? [{ u: 0, p: [P.x + 4, h * 0.5, P.z + Dst * 1.05], l: [P.x, h * 0.5, P.z] }, { u: 1.6, p: [P.x + 3, h * 0.35, P.z + Dst], l: [P.x, h * 0.4, P.z] }, { u: 3.4, p: [P.x - 3, h * 0.45, P.z + Dst * 1.05], l: [P.x, up, P.z] }, { u: 6.2, p: [P.x - 0.5, h * 0.55, P.z + Dst * 1.2], l: [P.x, up, P.z] }]
      : [{ u: 0, p: [P.x + Dst * 0.55, 0.9, P.z + Dst * 0.8], l: [P.x, 0.5, P.z] }, { u: 2.8, p: [P.x + Dst * 0.4, h * 0.34, P.z + Dst * 0.95], l: [P.x, h * 0.42, P.z] }, { u: 4.2, p: [P.x - Dst * 0.25, h * 0.42, P.z + Dst * 1.05], l: [P.x, up, P.z] }, { u: 7.0, p: [P.x - 0.5, h * 0.55, P.z + Dst * 1.2], l: [P.x, up, P.z] }];
    const END = { p: [0, 6.1, 20.5], l: [0, 1.9, 0] };
    const camAt = u => { let i = 0; while (i < K.length - 2 && u > K[i + 1].u) i++; const a = K[i], b = K[i + 1], t = smooth(clamp((u - a.u) / (b.u - a.u), 0, 1)); return { p: a.p.map((v, k) => lerp(v, b.p[k], t)), l: a.l.map((v, k) => lerp(v, b.l[k], t)) }; };
    const st = { u: 0, shake: 0, endBlend: 0, rate: 1, freeze: o.freezeAt != null ? o.freezeAt : null, done: false, handover: 0, popped: false };
    const sfxAt = {}; const once = (name, u, fn) => { if (st.u >= u && !sfxAt[name]) { sfxAt[name] = true; fn(); } };
    const lm = (grp, k) => { grp.scale.set(k.x, k.y, k.z); };
    const e0 = entrance === "land" ? 1.0 : entrance === "walk" ? 0.5 : entrance === "emerge" ? 0.8 : 0.6;
    // ---- the entrance: motion of the boss as a function of time ----
    const setMats = (op) => mats.forEach(x => { if (op >= 1) { x.transparent = !!x.userData.t0; x.opacity = 1; } else { x.userData.t0 = x.userData.t0 === undefined ? x.transparent : x.userData.t0; x.transparent = true; x.opacity = op; } });
    function entranceUpdate(u, dt) {
      const e = u - e0; grp.visible = true;
      let sx = 1, sy = 1, bob = 0;
      if (entrance === "rise") {
        const T = 2.5, k = clamp(e / T, 0, 1), kk = easeOut(k); grp.position.y = lerp(-h * 1.02, 0, kk); face(0.35 * (1 - k));
        crackMat.opacity = clamp(Math.sin(Math.min(1, e / 0.6) * Math.PI / 2) * (1 - k * 0.55), 0, 1) * (e > 0 ? 1 : 0); crack.scale.setScalar(0.6 + k * 0.7); under.intensity = e > 0 ? 3.2 * (1 - k * 0.6) : 0; aura.material.opacity = 0.15 + 0.2 * k;
        if (e > 0 && e < T && Math.random() < dt * 14) burst(P.x + (Math.random() - 0.5) * h * 0.5, P.z + (Math.random() - 0.5) * h * 0.3, 2, h * 0.5, 1.4, h * 0.3);
        if (e > 0 && e < T) st.shake = Math.max(st.shake, 0.12 + 0.08 * k);
        once("rise-start", e0, () => sfxOr("rumble", "hitHeavy")); once("rise-end", e0 + T, () => { burst(P.x, P.z, 14, h * 0.9, 1.2, h * 0.4); shockwave(P.x, P.z, h * 2.2, glow, 0.9); st.shake = 0.55; sfx("hitHeavy"); });
        if (e < 0) grp.position.y = -h * 1.1;
      } else if (entrance === "land") {
        const fall = 0.6, k = clamp(e / fall, 0, 1); if (e < 0) { grp.visible = false; } else if (e < fall) { grp.position.y = lerp(h * 5, 0, k * k); face(0.2); shMat.opacity = 0.15 + 0.4 * k; shadow.scale.setScalar(0.3 + 0.7 * k); sy = 1 + (1 - k) * 0.08; } else { grp.position.y = 0; const r = e - fall, sq = Math.exp(-r * 6) * Math.cos(r * 18); sy = 1 - 0.22 * Math.max(0, sq); sx = 1 + 0.12 * Math.max(0, sq); face(0.2 * Math.max(0, 1 - r / 1.5)); }
        once("land-hit", e0 + fall, () => { burst(P.x, P.z, 22, h * 1.1, 1.4, h * 0.45); shockwave(P.x, P.z, h * 3, glow, 0.8); st.shake = 0.8; sfxOr("bossReveal", "hitHeavy"); flash("#fff", 260); }); aura.material.opacity = e > fall ? 0.3 : 0; under.intensity = e > fall ? 2.4 * Math.exp(-(e - fall) * 1.4) : 0;
      } else if (entrance === "uncoil") {
        const T = 2.6, k = clamp(e / T, 0, 1), kk = easeOut(k); if (e < 0) grp.visible = false; sy = lerp(0.12, 1, kk) + Math.sin(k * 3.1) * 0.05; sx = lerp(1.6, 1, kk); inner.rotation.y = yawFix - Math.PI / 2 + (1 - kk) * Math.PI * 3 + 0.3 * (1 - k); aura.material.opacity = 0.35 * k; under.intensity = e > 0 ? 2.5 * (1 - k * 0.5) : 0;
        once("uncoil-s", e0, () => { burst(P.x, P.z, 16, h * 0.9, 0.9, h * 0.35); shockwave(P.x, P.z, h * 2, glow, 1.0); sfxOr("rumble", "hitHeavy"); }); once("uncoil-e", e0 + T, () => { st.shake = 0.5; burst(P.x, P.z, 10, h * 0.8, 1.2, h * 0.4); sfx("hitHeavy"); });
        if (e > 0 && e < T) st.shake = Math.max(st.shake, 0.1);
      } else if (entrance === "walk") {
        const T = 2.9, k = clamp(e / T, 0, 1), kk = easeOut(k); if (e < 0) grp.visible = false; grp.position.x = lerp(P.x - 26, P.x, kk); const step = e * 5.2; bob = Math.abs(Math.sin(step)) * 0.22 * (1 - k * 0.8); grp.position.y = bob; face(Math.PI / 2 * (1 - clamp((e - T) / 0.6, 0, 1)) + (k >= 1 ? 0 : 0));
        if (k >= 1) face(Math.PI / 2 - clamp((e - T) / 0.7, 0, 1) * (Math.PI / 2 - 0.3)); shadow.position.x = grp.position.x; crack.position.x = grp.position.x;
        if (e > 0 && e < T && Math.floor(step / Math.PI) !== (st.lastStep || 0)) { st.lastStep = Math.floor(step / Math.PI); st.shake = Math.max(st.shake, 0.18); sfx("step"); burst(grp.position.x, P.z, 3, h * 0.4, 0.5, h * 0.2); }
        aura.material.opacity = 0.18 * k; under.intensity = 0.6 * k;
        once("walk-end", e0 + T, () => { burst(P.x, P.z, 8, h * 0.6, 0.8, h * 0.3); sfx("hitHeavy"); st.shake = 0.3; });
      } else {   // emerge: out of the dark, lightning flashes
        const T = 2.2, k = clamp(e / T, 0, 1); if (e < 0) grp.visible = false; const fl = 0.55 + 0.45 * Math.sin(e * 40) * Math.sin(e * 17), op = k >= 1 ? 1 : clamp(k * 1.2, 0, 1) * (k < 0.8 ? fl : 1); setMats(op); face(0.25 * (1 - k)); aura.material.opacity = 0.45 * k; under.intensity = 1.5 * k; grp.position.y = Math.sin(e * 1.6) * 0.12 * k + (isModel ? 0 : 0);
        once("em-1", e0 + 0.3, () => { flash("#cfe0ff", 200); st.shake = 0.2; sfx("shock"); }); once("em-2", e0 + 1.1, () => { flash("#cfe0ff", 200); sfx("shock"); }); once("em-3", e0 + T, () => { setMats(1); flash("#ffffff", 300); st.shake = 0.4; sfxOr("bossReveal", "hitHeavy"); });
      }
      inner.scale.set(sx, sy, sx);
      // the roar: after the entrance the boss swells once
      const roarAt = e0 + (entrance === "land" ? 0.6 + 1.0 : entrance === "walk" ? 3.5 : entrance === "emerge" ? 2.3 : entrance === "uncoil" ? 2.7 : 2.6) + 0.3;
      if (u > roarAt && u < roarAt + 0.9) { const r = Math.sin((u - roarAt) / 0.9 * Math.PI); inner.scale.multiplyScalar(1 + 0.05 * r); st.shake = Math.max(st.shake, 0.15 * r); }
      once("roar", roarAt, () => { flash("#ffe0c0", 200); sfxOr("bossReveal", "hitHeavy"); aura.material.opacity += 0.25; });
    }
    return { A, h, P, scene, camera, renderer, resize, dust, torchLights, mixer, rim, under, aura, crack, puffs, rings, st, K, END, camAt, entranceUpdate, entrance, glow, grp, inner, face, yawFix, shadow, isModel, e0, burst, shockwave };
    function flash(c, ms) { if (st.onFlash) st.onFlash(c, ms); }
  }

  // plays the whole reveal: the overlay, the loop, the name card, the lines, the handover
  async function runReveal(rv, o) {
    ensureLayer();
    const ov = mkEl("bossov", null); ov.appendChild(rv.renderer.domElement); const bars = [mkEl("bar t", null, ov), mkEl("bar b", null, ov)]; mkEl("vignette", null, ov);
    const flashEl = mkEl("", null, ov); flashEl.style.cssText = "position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none"; rv.st.onFlash = (c, ms) => { flashEl.style.background = c; flashEl.style.transition = "none"; flashEl.style.opacity = 0.85; requestAnimationFrame(() => { flashEl.style.transition = `opacity ${(ms || 240) / 1000}s ease-out`; flashEl.style.opacity = 0; }); };
    const card = mkEl("nmcard", `<div class="rl"></div><div class="nm">${esc(o.name || "")}</div>${o.title ? `<div class="tt">${esc(o.title)}</div>` : ""}<div class="rl"></div>`, ov);
    const { st, camera, scene, renderer } = rv; rv.resize(); const onResize = () => rv.resize(); addEventListener("resize", onResize);
    let clock = performance.now(), live = true; const waiters = [];
    const until = u => new Promise(res => (st.u >= u ? res() : waiters.push([u, res])));
    let skip = false; const off = keys(e => { if (ADV.includes(e.key) || e.key === "Escape") { skip = true; return true; } return false; }); ov.addEventListener("pointerdown", () => (skip = true));
    const camPos = new THREE.Vector3(), camLook = new THREE.Vector3(), f = speedF();
    const loop = () => {
      if (!live) return; requestAnimationFrame(loop);
      const now = performance.now(), dt = Math.min(0.05, (now - clock) / 1000); clock = now;
      try {
        if (st.freeze == null || st.u < st.freeze) st.u += dt * (skip ? 5 : 1) / Math.max(0.35, f);
        rv.entranceUpdate(st.u, dt); if (st.faceOverride != null) rv.inner.rotation.y = st.faceOverride;
        if (rv.mixer) rv.mixer.update(dt);
        // dust motes, torches, puffs, rings
        const p = rv.dust.geometry.attributes.position; for (let i = 0; i < p.count; i++) { let y = p.getY(i) + dt * 0.25; if (y > 8) y = 0; p.setY(i, y); } p.needsUpdate = true;
        rv.torchLights.forEach((l, i) => (l.intensity = 1.4 + Math.sin(now * 0.009 + i * 2) * 0.25 + Math.random() * 0.15));
        for (let i = rv.puffs.length - 1; i >= 0; i--) { const q = rv.puffs[i]; q.life += dt; const k = q.life / q.max; q.s.position.x += q.vx * dt; q.s.position.z += q.vz * dt; q.s.position.y += q.vy * dt; q.vy *= 0.97; q.vx *= 0.97; q.vz *= 0.97; q.s.material.opacity = 0.55 * (1 - k) * (1 - k); const sc2 = q.s.scale.x * (1 + dt * q.grow * 0.5); q.s.scale.set(sc2, sc2, 1); if (k >= 1) { scene.remove(q.s); q.s.material.dispose(); rv.puffs.splice(i, 1); } }
        for (let i = rv.rings.length - 1; i >= 0; i--) { const q = rv.rings[i]; q.life += dt; const k = q.life / q.max; q.m.scale.setScalar(0.4 + q.size * easeOut(k)); q.m.material.opacity = 0.9 * (1 - k); if (k >= 1) { scene.remove(q.m); q.m.material.dispose(); q.m.geometry.dispose(); rv.rings.splice(i, 1); } }
        rv.rim.intensity = Math.max(rv.rim.intensity, 0) * 0.9 + 0.1 * (st.u > rv.e0 + 0.5 ? 2.2 + Math.sin(now * 0.004) * 0.5 : 0); rv.aura.scale.set(rv.h * (1.8 + Math.sin(now * 0.003) * 0.06), rv.h * 1.5, 1);
        // the camera
        const c = rv.camAt(st.u), b = st.endBlend; camPos.set(c.p[0], c.p[1], c.p[2]); camLook.set(c.l[0], c.l[1], c.l[2]);
        if (b > 0) { const k = smooth(b); camPos.set(lerp(c.p[0], rv.END.p[0], k), lerp(c.p[1], rv.END.p[1], k), lerp(c.p[2], rv.END.p[2], k)); camLook.set(lerp(c.l[0], rv.END.l[0], k), lerp(c.l[1], rv.END.l[1], k), lerp(c.l[2], rv.END.l[2], k)); }
        camPos.x += Math.sin(now * 0.0011) * 0.12; camPos.y += Math.sin(now * 0.0017) * 0.06;
        if (st.shake > 0) { camPos.x += (Math.random() - 0.5) * st.shake * 1.4; camPos.y += (Math.random() - 0.5) * st.shake * 1.0; st.shake = Math.max(0, st.shake - dt * 1.6); }
        camera.position.copy(camPos); camera.lookAt(camLook); renderer.render(scene, camera);
        for (let i = waiters.length - 1; i >= 0; i--) if (st.u >= waiters[i][0]) { const w = waiters.splice(i, 1)[0]; w[1](); }
      } catch (e) { console.warn("boss reveal frame", e); live = false; waiters.splice(0).forEach(w => w[1]()); }
    };
    await sleepRaw(30); ov.style.opacity = 1; bars.forEach(b => b.classList.add("on")); requestAnimationFrame(loop);
    const R = rv.e0; let T_end = R + (rv.entrance === "land" ? 2.6 : rv.entrance === "walk" ? 4.6 : rv.entrance === "emerge" ? 3.6 : 3.8);
    Cinema._rv = rv;                                               // test hook: Cinema._rv.st.freeze = seconds stops the reveal clock at that moment (Enter continues)
    if (st.freeze != null) { await new Promise(res => { const k2 = keys(e => { if (ADV.includes(e.key) || e.key === "Escape") { k2(); res(); return true; } return false; }); }); st.freeze = null; }
    await until(T_end);
    skip = false; card.classList.add("on"); sfxOr("titleSwell", "levelUp"); await until(st.u + 2.6);
    skip = false; off();
    if (o.lines && o.lines.length) await sayLines(o.lines);
    // pull back to the fight camera, the boss turns to face the party; then leave the overlay up until the arena is drawn
    card.classList.remove("on"); const t0 = performance.now(), faceFrom = rv.inner.rotation.y; const turn = setInterval(() => { const k = clamp((performance.now() - t0) / (1300 * f), 0, 1); st.endBlend = k; st.faceOverride = lerp(faceFrom, rv.yawFix, smooth(k)); if (k >= 1) clearInterval(turn); }, 16);
    await sleepRaw(1350 * f); clearInterval(turn); st.endBlend = 1; st.faceOverride = rv.yawFix;
    // hand over: keep the last frame until the arena is on screen
    const hold = performance.now(); bars.forEach(b => b.classList.remove("on"));
    const iv = setInterval(() => {
      const a3 = document.getElementById("a3"), shown = a3 && getComputedStyle(a3).display !== "none", waited = performance.now() - hold;
      if ((shown && waited > 300) || waited > 20000) { clearInterval(iv); ov.style.transition = "opacity .5s"; ov.style.opacity = 0; setTimeout(() => { live = false; removeEventListener("resize", onResize); try { rv.scene.traverse(q => { if (q.geometry) q.geometry.dispose(); if (q.material) (Array.isArray(q.material) ? q.material : [q.material]).forEach(x => x.dispose()); }); } catch (e) { /* ignore */ } ov.remove(); }, 600); }
    }, 80);
    Cinema.holding = true; setTimeout(() => (Cinema.holding = false), 20000);
  }
  Cinema.boss = guard("boss", async (o = {}) => {
    o = Object.assign({}, o); if (o.music !== undefined) music(o.music);
    const lines = o.lines || [];
    if (instant()) { await sayLines(lines); return; }
    let rv = null; try { rv = await buildReveal(o); } catch (e) { console.warn("Cinema.boss build failed", e); }
    if (!rv) {                                                     // no WebGL / no THREE: a dark card with the name, then the lines
      const el = mkEl("full", `<div class="ttl go"><div class="sub">${esc(o.title || "")}</div><div class="rule"></div><div class="big">${esc(o.name || "")}</div><div class="rule"></div></div>`); el.style.opacity = 0; el.style.transition = "opacity .5s"; await sleepRaw(30); el.style.opacity = 1; await sleep(1800); el.style.opacity = 0; await sleepRaw(550); el.remove(); await sayLines(lines); return;
    }
    try { await runReveal(rv, o); }
    catch (e) { console.warn("Cinema.boss reveal failed", e); document.querySelectorAll("#cin .bossov").forEach(n => n.remove()); await sayLines(lines); }
  });

  window.Cinema = Cinema;
})();
