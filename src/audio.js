/* Davichi's Revenge audio API (owner C).
   Exposes window.GameAudio and ALSO attaches the same methods to the built-in
   window.Audio constructor (a function object), so `new Audio()` keeps working and
   `window.Audio && Audio.sfx('hit')` works. Nothing here ever throws. */
(function () {
  var Native = window.Audio;                       // built-in HTMLAudioElement constructor
  var BASE = 'assets/audio/';
  var manifest = null, loading = false, pending = [];
  var vol = { music: 0.7, sfx: 0.8 }, muted = false;
  var unlocked = false;
  var cur = null, curKey = null, wantKey = null, fadeTimer = null;
  var sfxCache = {};

  try {
    var s = JSON.parse(localStorage.getItem('dr_audio') || 'null');
    if (s) { if (typeof s.music === 'number') vol.music = s.music; if (typeof s.sfx === 'number') vol.sfx = s.sfx; if (s.muted) muted = true; }
  } catch (e) {}
  function save() { try { localStorage.setItem('dr_audio', JSON.stringify({ music: vol.music, sfx: vol.sfx, muted: muted })); } catch (e) {} }
  function clamp(v) { v = +v; return isNaN(v) ? 0 : Math.max(0, Math.min(1, v)); }

  function loadManifest(cb) {
    if (manifest) return cb();
    pending.push(cb);
    if (loading) return;
    loading = true;
    fetch(BASE + 'audio.json').then(function (r) { return r.json(); }).then(function (j) {
      manifest = j; var p = pending; pending = []; p.forEach(function (f) { try { f(); } catch (e) {} });
    }).catch(function () { manifest = {}; pending = []; });
  }

  function mk(src) { var a = new Native(); a.preload = 'auto'; a.src = src; return a; }
  function targetVol(e) { return muted ? 0 : clamp(vol.music * (e.vol == null ? 1 : e.vol)); }

  function fade(el, to, ms, done) {
    if (!el) return;
    var from = el.volume, t0 = performance.now();
    if (el._f) clearInterval(el._f);
    el._f = setInterval(function () {
      var k = Math.min(1, (performance.now() - t0) / ms);
      try { el.volume = Math.max(0, Math.min(1, from + (to - from) * k)); } catch (e) {}
      if (k >= 1) { clearInterval(el._f); el._f = null; if (done) done(); }
    }, 40);
  }

  function startMusic(key) {
    var e = manifest && manifest[key];
    if (!e || e.type !== 'music') return;
    if (curKey === key && cur) return;
    var old = cur;
    var el = mk(BASE + e.file); el.loop = !!e.loop; el.volume = 0; el._entry = e;
    var p = el.play();
    if (p && p.catch) p.catch(function () { unlocked = false; });   // blocked: retry on next gesture
    cur = el; curKey = key;
    fade(el, targetVol(e), 1000);
    if (old) fade(old, 0, 1000, function () { try { old.pause(); old.src = ''; } catch (e2) {} });
    if (!e.loop) el.onended = function () { if (cur === el) { cur = null; curKey = null; } };
  }

  function applyMusic() {
    if (!unlocked) return;
    if (wantKey === null) {
      if (cur) { var o = cur; cur = null; curKey = null; fade(o, 0, 800, function () { try { o.pause(); } catch (e) {} }); }
      return;
    }
    loadManifest(function () { startMusic(wantKey); });
  }

  function unlock() {
    if (unlocked) return;
    unlocked = true;
    ['pointerdown', 'keydown', 'touchstart'].forEach(function (n) { window.removeEventListener(n, unlock, true); });
    applyMusic();
  }
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (n) { window.addEventListener(n, unlock, true); });
  // if autoplay was blocked, re-arm on the next gesture
  setInterval(function () {
    if (cur && cur.paused && !cur.ended && wantKey === curKey && unlocked) {
      var p = cur.play(); if (p && p.catch) p.catch(function () {});
    }
  }, 1500);

  var API = {
    music: function (key) {
      try {
        key = key || null;
        if (key === wantKey && (cur || !unlocked)) return;   // same key: no restart
        wantKey = key; applyMusic();
        if (!unlocked) loadManifest(function () {});
      } catch (e) {}
    },
    sfx: function (key, opts) {
      try {
        if (muted || vol.sfx <= 0) return;
        loadManifest(function () {
          var e = manifest[key]; if (!e || e.type !== 'sfx') return;
          var base = sfxCache[key] || (sfxCache[key] = mk(BASE + e.file));
          var a = base.cloneNode(); a.volume = clamp(vol.sfx * (e.vol == null ? 1 : e.vol));
          var v = (opts && opts.pitch) || (1 + (Math.random() - 0.5) * 0.12);
          a.playbackRate = v; try { a.preservesPitch = false; a.mozPreservesPitch = false; a.webkitPreservesPitch = false; } catch (x) {}
          var p = a.play(); if (p && p.catch) p.catch(function () {});
        });
      } catch (e) {}
    },
    setVolume: function (music, sfx) {
      try {
        if (music != null) vol.music = clamp(music);
        if (sfx != null) vol.sfx = clamp(sfx);
        save();
        if (cur && cur._entry) { if (cur._f) clearInterval(cur._f); cur.volume = targetVol(cur._entry); }
      } catch (e) {}
    },
    getVolume: function () { return { music: vol.music, sfx: vol.sfx }; },
    mute: function (b) {
      try {
        muted = (b === undefined) ? !muted : !!b; save();
        if (cur && cur._entry) { if (cur._f) clearInterval(cur._f); cur.volume = targetVol(cur._entry); }
      } catch (e) {}
    },
    isMuted: function () { return muted; },
    current: function () { return curKey; },
    preload: function (keys) {
      try { loadManifest(function () { (keys || []).forEach(function (k) { var e = manifest[k]; if (e && e.type === 'sfx' && !sfxCache[k]) sfxCache[k] = mk(BASE + e.file); }); }); } catch (e) {}
    },
    manifest: function (cb) { loadManifest(function () { cb(manifest); }); },
    unlock: unlock
  };

  window.GameAudio = API;
  if (typeof Native === 'function') {
    ['music', 'sfx', 'setVolume', 'getVolume', 'mute', 'isMuted', 'current', 'preload', 'manifest'].forEach(function (k) { try { Native[k] = API[k]; } catch (e) {} });
  } else {
    window.Audio = API;
  }
  loadManifest(function () {});
})();
