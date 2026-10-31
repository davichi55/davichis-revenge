/* Davichi's Revenge audio API (owner AUDIO; v1 by owner C 2026-10-28, v2 2026-10-31).
   Exposes window.GameAudio and ALSO attaches the same methods to the built-in
   window.Audio constructor (a function object), so `new Audio()` keeps working and
   `window.Audio && Audio.sfx('hit')` works. Nothing here ever throws.

   Audio.music(key|null, {fade, restart})  looping music, cross-fades from the old track (default 1 s). Same track = no restart.
                                           Keys may be aliases (audio.json "alias"); two keys that resolve to the same file do not restart.
                                           Unknown keys never throw: names starting with battle or titan, or containing boss, general or guardian, fall back to battle, titan or boss, anything else keeps the current music.
   Audio.sfx(key, {vol, pitch, delay})     one-shot (overlaps, +-6% random pitch unless pitch given).
   Audio.ambient(key|null|"auto", {fade})  looping ambience layer under the music (rain, wind, night ...); follows the SFX volume.
                                           By default it follows the music: audio.json gives an area track an "amb" loop (e.g. jungle -> ambJungle) that plays quietly
                                           under it and stops under battle / boss / titan music. Audio.ambient("ambRain") overrides that (the world engine does it for
                                           weather and night), null = silence, "auto" = follow the music again.
   Audio.setVolume(music, sfx), getVolume, mute(bool), isMuted, current() (requested music key), preload(keys), manifest(cb),
   Audio.has(key) / Audio.resolve(key) (true / real track key once the manifest is loaded), Audio.state() (debug).

   audio.json entry: { file, type: music|sfx|ambient, loop, vol, seconds, start, end, xf } or { type, alias, vol? }.
   Looping music: at (end - xf) the track is crossfaded (equal power) into a second copy that starts at `start`, so there is
   no gap and no silent tail (start/end skip silence at the head/tail of a file; xf defaults to 2.5 s). */
(function () {
  var Native = window.Audio;                       // built-in HTMLAudioElement constructor
  var BASE = 'assets/audio/';
  var XF = 2.5;                                    // default loop crossfade (seconds)
  var manifest = null, loading = false, pending = [];
  var vol = { music: 0.5, sfx: 0.8 }, muted = false;
  var unlocked = false, gestureOk = false;
  var sfxCache = {}, warned = {}, live = [];
  var slots = { music: { kind: 'music', want: null, cur: null, curKey: null }, ambient: { kind: 'ambient', want: null, cur: null, curKey: null } };
  var ambOverride;                                   // undefined = follow the music's "amb" bed, a string = explicit ambient loop, null = explicit silence
  var musicCat = null, musicBed = null;              // cat and "amb" bed of the music that is playing (battle / boss / titan music silences the ambience)

  try {
    var s = JSON.parse(localStorage.getItem('dr_audio') || 'null');
    if (s) { if (typeof s.music === 'number') vol.music = (s.music === 0.7 && !s.v2) ? 0.5 : s.music; /* 2026-10-31: the old default 0.7 drowned the sfx */ if (typeof s.sfx === 'number') vol.sfx = s.sfx; if (s.muted) muted = true; }
  } catch (e) {}
  function save() { try { localStorage.setItem('dr_audio', JSON.stringify({ music: vol.music, sfx: vol.sfx, muted: muted, v2: 1 })); } catch (e) {} }
  function clamp(v) { v = +v; return isNaN(v) ? 0 : Math.max(0, Math.min(1, v)); }
  function warnOnce(kind, key) { var id = kind + ':' + key; if (warned[id]) return; warned[id] = 1; try { console.warn('[audio] unknown ' + kind + ' key "' + key + '"'); } catch (e) {} }

  function loadManifest(cb) {
    if (manifest) return cb();
    pending.push(cb);
    if (loading) return;
    loading = true;
    fetch(BASE + 'audio.json').then(function (r) { return r.json(); }).then(function (j) {
      manifest = j; var p = pending; pending = []; p.forEach(function (f) { try { f(); } catch (e) {} });
    }).catch(function () { manifest = {}; pending = []; });
  }

  // key -> { key (real track key), entry, vol } following aliases (max 8 hops); null when it does not resolve to a file of that type
  function resolveKey(req, type) {
    if (!manifest || req == null) return null;
    var k = req, e = manifest[k], n = 0, v = null;
    while (e && e.alias && n++ < 8) { if (e.vol != null) v = e.vol; k = e.alias; e = manifest[k]; }
    if (!e || !e.file) return null;
    if (type && e.type !== type) return null;
    return { key: k, entry: e, vol: v != null ? v : (e.vol == null ? 1 : e.vol) };
  }
  // unknown music key: guess by name so a typo or a not-yet-made key still gets a sensible track
  function fallbackKey(req, type) {
    if (type !== 'music' || typeof req !== 'string') return null;
    var g = /^battle/i.test(req) ? 'battle' : /^titan/i.test(req) ? 'titan' : /boss|general|guardian|champion|duel/i.test(req) ? 'boss' : null;
    return g ? resolveKey(g, 'music') : null;
  }

  function mk(src) { var a = new Native(); a.preload = 'auto'; a.src = src; return a; }
  function seek(el, t) {
    if (!(t > 0)) return;
    try {
      if (el.readyState >= 1) el.currentTime = t;
      else el.addEventListener('loadedmetadata', function h() { el.removeEventListener('loadedmetadata', h); try { el.currentTime = t; } catch (e) {} });
    } catch (e) {}
  }

  // ---- voices: one playing element with a fade gain ----
  function voiceVol(v) {
    if (muted) return 0;
    var master = v.slot.kind === 'music' ? vol.music : vol.sfx;
    return clamp(master * v.vol * v.gain);
  }
  function apply(v) { try { v.el.volume = voiceVol(v); } catch (e) {} }
  function addVoice(slot, req, r, el) {
    var v = { slot: slot, req: req, key: r.key, entry: r.entry, vol: r.vol, el: el, gain: 0, fade: null, dying: false, partner: null, next: null };
    el._v = v; live.push(v); apply(v); return v;
  }
  function dispose(v) {
    var i = live.indexOf(v); if (i >= 0) live.splice(i, 1);
    try { v.el.onended = null; v.el.pause(); v.el.removeAttribute('src'); v.el.load(); } catch (e) {}
    if (v.next) { try { v.next.pause(); v.next.removeAttribute('src'); v.next.load(); } catch (e) {} v.next = null; }
  }
  function fadeTo(v, to, ms, eq, done) {
    if (!(ms > 0)) { v.gain = to; v.fade = null; apply(v); if (done) done(v); return; }
    v.fade = { from: v.gain, to: to, t0: performance.now(), ms: ms, eq: !!eq, done: done };
  }
  function kill(v, ms) {
    if (!v || v.dying) return;
    v.dying = true;
    fadeTo(v, 0, ms, true, dispose);
  }
  function tryPlay(v) {
    try {
      var p = v.el.play();
      if (p && p.then) p.then(function () { gestureOk = true; unwatchGestures(); }, function (err) { if (err && err.name === 'NotAllowedError') { unlocked = false; v.blocked = true; } });
    } catch (e) {}
  }

  function startVoice(slot, req, r, fadeMs) {
    var e = r.entry, el = mk(BASE + e.file);
    el.loop = !!e.loop; el.volume = 0;
    if (e.start > 0.05) seek(el, e.start);
    var v = addVoice(slot, req, r, el);
    slot.cur = v; slot.curKey = req;
    if (!e.loop) el.onended = function () { if (slot.cur === v) { slot.cur = null; slot.curKey = null; } dispose(v); };
    tryPlay(v);
    fadeTo(v, 1, fadeMs, true);
    return v;
  }

  // ---- ambience that follows the music: audio.json "amb" on a music entry names the loop that plays quietly under that area track ----
  function bedOf(req) {                              // first "amb" along the alias chain of a music key
    var k = req, e = manifest && manifest[k], n = 0;
    while (e && n++ < 8) { if (e.amb !== undefined) return e.amb; if (!e.alias) break; k = e.alias; e = manifest[k]; }
    return null;
  }
  function effectiveAmbient() {
    if (musicCat === 'battle' || musicCat === 'boss' || musicCat === 'titan') return null;
    return ambOverride !== undefined ? ambOverride : musicBed;
  }
  function syncAmbient(opts) {
    var k = effectiveAmbient(), sl = slots.ambient;
    if (k === sl.want) return;
    sl.want = k; applySlot(sl, opts);
  }
  function noteMusic(req, r) {
    if (req == null || !r) { musicCat = null; musicBed = null; } else { musicCat = r.entry.cat || null; musicBed = bedOf(req); }
    syncAmbient();
  }

  function startSlot(slot, opts) {
    var req = slot.want;
    var r = resolveKey(req, slot.kind) || fallbackKey(req, slot.kind);
    if (!r) { warnOnce(slot.kind, req); return; }
    if (slot.kind === 'music') noteMusic(req, r);
    var cur = slot.cur;
    if (cur && !cur.dying && cur.key === r.key && !(opts && opts.restart)) { cur.req = req; slot.curKey = req; return; }   // same track: keep playing
    var ms = opts && opts.fade != null ? +opts.fade : (slot.kind === 'music' ? 1000 : 1500);
    if (cur) { slot.cur = null; kill(cur, ms); }
    startVoice(slot, req, r, ms);
  }
  function applySlot(slot, opts) {
    if (!unlocked) return;
    if (slot.want === null) {
      if (slot.cur) { var o = slot.cur; slot.cur = null; slot.curKey = null; kill(o, opts && opts.fade != null ? +opts.fade : 800); }
      if (slot.kind === 'music') { musicCat = null; musicBed = null; syncAmbient(); }
      return;
    }
    loadManifest(function () { startSlot(slot, opts); });
  }

  // ---- loop crossfade ----
  function prepNext(v) {
    var e = v.entry, el = mk(BASE + e.file);
    el.loop = true; el.volume = 0; el.preload = 'auto';
    seek(el, e.start || 0);
    return el;
  }
  function loopCheck(slot) {
    var v = slot.cur;
    if (!v || v.dying || v.partner || !v.entry.loop) return;
    var el = v.el, d = el.duration;
    if (!d || !isFinite(d) || el.paused || el.ended) return;
    var e = v.entry, st = e.start || 0, en = Math.min(e.end || d, d);
    var xf = Math.max(0.4, Math.min(e.xf != null ? e.xf : XF, (en - st) / 4));
    var t = el.currentTime;
    if (t >= en - xf - 4 && !v.next) v.next = prepNext(v);                 // warm the second copy a few seconds early
    if (t >= en - xf) {
      var nel = v.next || prepNext(v); v.next = null;
      var nv = addVoice(slot, v.req, { key: v.key, entry: e, vol: v.vol }, nel);
      v.partner = nv; slot.cur = nv; slot.curKey = v.req;
      v.dying = true;
      tryPlay(nv);
      fadeTo(nv, 1, xf * 1000, true);
      fadeTo(v, 0, xf * 1000, true, dispose);
    }
  }
  function step() {
    var now = performance.now();
    for (var i = live.length - 1; i >= 0; i--) {
      var v = live[i], f = v.fade;
      if (!f) continue;
      var k = Math.min(1, (now - f.t0) / f.ms), sh = f.eq ? (f.to > f.from ? Math.sin(k * Math.PI / 2) : 1 - Math.cos(k * Math.PI / 2)) : k;
      v.gain = Math.max(0, Math.min(1, f.from + (f.to - f.from) * sh));
      apply(v);
      if (k >= 1) { var d = f.done; v.fade = null; if (d) { try { d(v); } catch (e) {} } }
    }
    try { loopCheck(slots.music); loopCheck(slots.ambient); } catch (e) {}
  }
  setInterval(step, 40);

  // ---- autoplay unlock: keep listening until a play() really succeeded ----
  var GESTURES = ['pointerdown', 'keydown', 'touchstart', 'mousedown', 'click'];
  function unwatchGestures() { if (gestureOk) GESTURES.forEach(function (n) { window.removeEventListener(n, onGesture, true); }); }
  function onGesture() {
    unlocked = true;
    ['music', 'ambient'].forEach(function (n) {
      var sl = slots[n];
      if (sl.cur && sl.cur.el.paused && !sl.cur.dying) tryPlay(sl.cur);
      else if (sl.want !== null && !sl.cur) applySlot(sl);
    });
  }
  GESTURES.forEach(function (n) { window.addEventListener(n, onGesture, true); });
  setInterval(function () {                          // watchdog: a track that got paused by the browser starts again
    ['music', 'ambient'].forEach(function (n) {
      var c = slots[n].cur;
      if (c && unlocked && !c.dying && c.el.paused && !c.el.ended && slots[n].want !== null) tryPlay(c);
    });
  }, 1500);

  function refreshAll() { live.forEach(apply); }

  var API = {
    music: function (key, opts) {
      try {
        key = key || null;
        var sl = slots.music;
        if (key === sl.want && (sl.cur || !unlocked) && !(opts && opts.restart)) return;   // same key: no restart
        sl.want = key; applySlot(sl, opts);
        if (!unlocked) loadManifest(function () {});
      } catch (e) {}
    },
    ambient: function (key, opts) {                  // key = explicit loop, null = silence, "auto" = follow the music's bed again
      try {
        ambOverride = key === 'auto' ? undefined : (key || null);
        syncAmbient(opts);
        if (!unlocked) loadManifest(function () {});
      } catch (e) {}
    },
    sfx: function (key, opts) {
      try {
        if (muted || vol.sfx <= 0) return;
        loadManifest(function () {
          var r = resolveKey(key, 'sfx'); if (!r) { warnOnce('sfx', key); return; }
          var base = sfxCache[r.key] || (sfxCache[r.key] = mk(BASE + r.entry.file));
          var go = function () {
            try {
              var a = base.cloneNode();
              a.volume = clamp(vol.sfx * r.vol * (opts && opts.vol != null ? opts.vol : 1));
              a.playbackRate = (opts && opts.pitch) || (1 + (Math.random() - 0.5) * 0.12);
              try { a.preservesPitch = false; a.mozPreservesPitch = false; a.webkitPreservesPitch = false; } catch (x) {}
              var p = a.play(); if (p && p.catch) p.catch(function () {});
            } catch (x) {}
          };
          if (opts && opts.delay > 0) setTimeout(go, opts.delay); else go();
        });
      } catch (e) {}
    },
    setVolume: function (music, sfx) {
      try {
        if (music != null) vol.music = clamp(music);
        if (sfx != null) vol.sfx = clamp(sfx);
        save(); refreshAll();
      } catch (e) {}
    },
    getVolume: function () { return { music: vol.music, sfx: vol.sfx }; },
    mute: function (b) {
      try { muted = (b === undefined) ? !muted : !!b; save(); refreshAll(); } catch (e) {}
    },
    isMuted: function () { return muted; },
    current: function () { return slots.music.curKey; },
    ambientCurrent: function () { return slots.ambient.curKey; },
    preload: function (keys) {
      try {
        loadManifest(function () {
          (keys || []).forEach(function (k) {
            var r = resolveKey(k);
            if (!r) return;
            if (r.entry.type === 'sfx') { if (!sfxCache[r.key]) sfxCache[r.key] = mk(BASE + r.entry.file); }
            else { try { fetch(BASE + r.entry.file); } catch (e) {} }          // warm the HTTP cache for music / ambient
          });
        });
      } catch (e) {}
    },
    manifest: function (cb) { loadManifest(function () { cb(manifest); }); },
    has: function (key) { try { return !!(resolveKey(key) || fallbackKey(key, 'music')); } catch (e) { return false; } },
    resolve: function (key) { try { var r = resolveKey(key); return r ? r.key : null; } catch (e) { return null; } },
    state: function () {
      var c = slots.music.cur, a = slots.ambient.cur;
      return {
        unlocked: unlocked, muted: muted, vol: { music: vol.music, sfx: vol.sfx }, voices: live.length,
        music: c ? { req: c.req, key: c.key, t: c.el.currentTime, dur: c.el.duration, paused: c.el.paused, volume: c.el.volume, gain: c.gain, entryVol: c.vol, start: c.entry.start || 0, end: c.entry.end || 0, crossfading: !!c.fade } : null,
        ambient: a ? { req: a.req, key: a.key, paused: a.el.paused, volume: a.el.volume } : null,
        ambientWant: slots.ambient.want, ambientOverride: ambOverride, musicBed: musicBed, musicCat: musicCat,
        want: slots.music.want
      };
    },
    debugElement: function (slot) { var s = slots[slot || 'music']; return s && s.cur ? s.cur.el : null; },   // for tests only
    unlock: onGesture
  };

  window.GameAudio = API;
  if (typeof Native === 'function') {
    ['music', 'ambient', 'sfx', 'setVolume', 'getVolume', 'mute', 'isMuted', 'current', 'ambientCurrent', 'preload', 'manifest', 'has', 'resolve', 'state'].forEach(function (k) { try { Native[k] = API[k]; } catch (e) {} });
  } else {
    window.Audio = API;
  }
  loadManifest(function () {});
})();
