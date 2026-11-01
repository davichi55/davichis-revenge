// The Harvest Engine: the post-game super boss (2026-11-01, Danny: "a boss that takes around 30 minutes", level 85, "some kind of soulweaver and sonomancer combination ...
// machines are loud when operating so it will attack with sound waves ... soulweaver abilities to heal itself"). Where and the scenes: src/story/harvest.js. Art: art-review/m7.
// One unit with five phases ("cycles"), each about six minutes, each with its own parts and its own rule. Losing restarts at the cycle you reached (BOSS_FOES extra.from).
//   Every cycle   RESONANCE: its single-target sound attacks stack Resonance on whoever they hit; the fourth stack SHATTERS (10% max HP and a lost action). Area sound does not stack.
//                 SOUL HARVEST: every 4th round it pulls on your souls: heals half of the HP your team is missing (cap 5% of its own) and 5% more for every fallen creature.
//   1 INTAKE      two Bellows Horns blast sound; while a horn stands the engine takes 75% less.
//   2 SORTING     the Soul Loom spins what it harvested: heals the engine 3% a round and threads one creature (drained every round) until the loom is cut.
//   3 RENDERING   no parts; every 3rd round is THE HUSH: everything goes silent, and damage dealt to the engine that round comes back on the one who dealt it.
//   4 COLLARING   two Collar Drones fit collars (-25% damage dealt); each collared creature feeds it 2% a round; killing a drone frees whoever it collared.
//   5 OVERDRIVE   it screams louder every round (+4% damage, stacking) until a break (impact, three in a row) cuts the scream back to nothing.
(function (root) {
  const Core = root.Core || require("../core.js");
  const H = Core.HOOKS, X = Core.EFFECTS, K = Core.CONDS, A = Core.EVOAPI, say = Core.say;
  const BOSS_META = Core.BOSS_META = Core.BOSS_META || {}, BOSS_FOES = Core.BOSS_FOES = Core.BOSS_FOES || {};
  const LV = 85;
  BOSS_META.harvestEngine = { lv: LV, t: 1800, kind: "end" };
  const heroes = ctx => ctx.party.filter(p => p.alive);
  const alive = (ctx, id) => ctx.foes.filter(f => f.alive && f.id === id);
  const addUnits = (ctx, e, ids) => Core.abExtras(ctx, e, { summon: ids, summonMax: ids.length + (e.kids || []).filter(k => k.alive).length }, null, [], false);
  const machine = (ctx, lines, color) => ctx.ev.push({ t: "machine", lines, color: color || "#ff5a4a" });   // arena3d.js shows it as the engine's own voice

  // ---------- Resonance (every sound attack) ----------
  X.resonate = (ctx, e, a, tgt, targets) => {
    (a.aoe ? targets : [tgt]).filter(t => t && t.alive).forEach(t => {
      t.reso = (t.reso || 0) + 1;
      if (t.reso < 4) { ctx.ev.push({ t: "say", text: t.name + " resonates (" + t.reso + "/4)." }); return; }
      t.reso = 0; A.directHit(ctx, e, t, Math.round(t.maxHp * 0.1), "SHATTER"); if (t.alive) t.loseAct = (t.loseAct || 0) + 1;
      ctx.ev.push({ t: "say", text: "The sound SHATTERS through " + t.name + "!" });
    });
  };

  // ---------- the cycles ----------
  const CYCLES = {
    1: { name: "INTAKE", lines: ["HARVEST ENGINE NO. 1", "CYCLE 1 OF 5: INTAKE", "SUBJECTS: 3. ESTIMATED YIELD: GOOD."], parts: ["bellowsHorn", "bellowsHorn"], desc: "Two great horns swing up on its back and draw breath." },
    2: { name: "SORTING", lines: ["CYCLE 2 OF 5: SORTING", "SUBJECTS RESIST.", "SPINNING HARVESTED MATTER."], parts: ["soulLoom"], desc: "The horns tear away. A loom of cold light unfolds from its side, and the threads reach for you." },
    3: { name: "RENDERING", lines: ["CYCLE 3 OF 5: RENDERING", "PARTS LOST: TOLERABLE.", "LISTEN."], parts: [], desc: "Plates slam shut over its furnace. For a moment there is no sound at all." },
    4: { name: "COLLARING", lines: ["CYCLE 4 OF 5: COLLARING", "FITTING SUBJECTS FOR TRANSPORT."], parts: ["collarDrone", "collarDrone"], desc: "Hatches open in its flanks. Small iron things crawl out, carrying open collars." },
    5: { name: "OVERDRIVE", lines: ["CYCLE 5 OF 5: OVERDRIVE", "SAFETY LIMITS REMOVED.", "YIELD WILL BE TAKEN."], parts: [], desc: "Every pipe opens at once. The scream starts, and it does not stop." },
  };
  function enterCycle(ctx, u, n, quiet) {
    u.cycle = n; u.scream = 0; u.hushNow = false;
    ctx.foes.forEach(f => { if (f.alive && f.partOf === "harvestEngine") { f.hp = 0; A.die(ctx, f); } });   // the last cycle's parts are torn off
    heroes(ctx).forEach(p => { p.buffs = p.buffs.filter(b => !b.collar); p.threaded = false; });
    if (!quiet) { machine(ctx, CYCLES[n].lines); say(ctx, CYCLES[n].desc); }
    if (CYCLES[n].parts.length) addUnits(ctx, u, CYCLES[n].parts);
  }
  H.harvestEngine = {
    start(ctx, u) { enterCycle(ctx, u, u.cycle || 1); },
    phase(ctx, u) { enterCycle(ctx, u, (u.cycle || 1) + 1); },
    inMult(ctx, u, src, info) {
      if (u.cycle === 1 && alive(ctx, "bellowsHorn").length) return 0.25;
      if (u.cycle === 3 && u.hushNow && src && src.side === "p" && src.alive && info && info.v > 0) { A.directHit(ctx, u, src, Math.round(info.v * 0.5), "ECHO"); }
      return 1;
    },
    outMult(ctx, u) { return u.cycle === 5 ? 1 + 0.04 * (u.scream || 0) : 1; },
    round(ctx, u) {
      if (!u.alive) return;
      // Soul Harvest
      if (ctx.round % 4 === 0) {
        const miss = heroes(ctx).reduce((s, p) => s + (p.maxHp - p.hp), 0), fallen = ctx.party.filter(p => !p.alive).length;
        const v = Math.round(Math.min(miss * 0.5, u.maxHp * 0.05) + u.maxHp * 0.05 * fallen);
        if (v > 0) { A.healFlat(ctx, u, v, { silent: 1 }); say(ctx, "SOUL HARVEST. The engine pulls on your souls" + (fallen ? ", and on the fallen," : "") + " and mends itself."); }
      }
      if (u.cycle === 3) {
        if (u.hushNow) { u.hushNow = false; say(ctx, "The roar comes back."); }
        else if ((ctx.round + 1) % 3 === 0) { u.hushNow = true; machine(ctx, ["THE HUSH"], "#9fd8ff"); say(ctx, "Every sound in the pit stops. Anything you strike it with now comes back on you."); }
      }
      if (u.cycle === 4) {
        const n = heroes(ctx).filter(p => p.buffs.some(b => b.collar)).length;
        if (n) { A.healFlat(ctx, u, Math.round(u.maxHp * 0.02 * n), { silent: 1 }); say(ctx, "The collars feed the engine (" + n + ")."); }
      }
      if (u.cycle === 5 && !u.broken) { u.scream = (u.scream || 0) + 1; if (u.scream % 3 === 0) say(ctx, "The scream climbs higher. +" + 4 * u.scream + "% damage."); }
    },
    broken(ctx, u) { if (u.cycle === 5) { u.scream = 0; say(ctx, "Something inside the engine snaps. The scream drops to a grinding whine."); } },
  };

  // ---------- parts ----------
  H.soulLoom = { round(ctx, u) {
    if (!u.alive) return; const e = alive(ctx, "harvestEngine")[0]; if (!e) return;
    A.healFlat(ctx, e, Math.round(e.maxHp * 0.03), { silent: 1 });
    let t = heroes(ctx).find(p => p.threaded); if (!t) { t = heroes(ctx).sort((a, b) => b.hp - a.hp)[0]; if (t) { t.threaded = true; say(ctx, "A thread of light runs from the loom into " + t.name + "."); } }
    if (t) { A.directHit(ctx, u, t, Math.round(t.maxHp * 0.06), "THREAD"); A.healFlat(ctx, e, Math.round(t.maxHp * 0.06), { silent: 1 }); }
  }, die(ctx) { heroes(ctx).forEach(p => (p.threaded = false)); say(ctx, "The loom is cut. The threads go slack."); } };
  X.fitCollar = (ctx, e, a, tgt) => {
    if (!tgt || !tgt.alive || tgt.buffs.some(b => b.collar)) return;
    Core.addBuff(tgt, "atk", -0.25, 99, { force: 1, collar: e }); Core.addBuff(tgt, "pow", -0.25, 99, { force: 1, collar: e });
    ctx.ev.push({ t: "debuff", tgt, stat: "atk", val: -0.25, turns: 99 }); say(ctx, e.name + " snaps a collar round " + tgt.name + "'s neck.");
  };
  H.collarDrone = { die(ctx, u) { heroes(ctx).forEach(p => { const had = p.buffs.some(b => b.collar === u); p.buffs = p.buffs.filter(b => b.collar !== u); if (had) say(ctx, "The collar on " + p.name + " falls open."); }); } };
  K.noCollarFree = ctx => ctx.party.some(p => p.alive && !p.buffs.some(b => b.collar));

  const part = (id, name, profile, o) => Core.defEnemy(id, name, profile, Object.assign({ boss: true, actions: 1, xpAbs: 0, goldAbs: 0, partOf: "harvestEngine", immune: ["poison", "bleed", "burn", "stun", "freeze", "chill", "slow", "petrify"] }, o));
  part("bellowsHorn", "Bellows Horn", "caster", { hpMult: 2.4, rs: { shock: -0.3 }, focusMult: 2, ab: [{ n: "Bellow", p: 0.4, k: "spell", fx: "resonate", w: 1 }] });
  part("soulLoom", "Soul Loom", "tank", { hpMult: 4.2, hooks: ["soulLoom"], rs: { light: -0.4, dark: 0.5 }, focusMult: 2.5, ab: [{ n: "Spin", self: ["dr", 0.15, 1], w: 1 }] });
  part("collarDrone", "Collar Drone", "swift", { hpMult: 1.6, hooks: ["collarDrone"], rs: { shock: -0.4 }, focusMult: 2.2, ab: [{ n: "Fit Collar", p: 0.25, fx: "fitCollar", w: 3, if: "noCollarFree" }, { n: "Clamp", p: 0.4, w: 1 }] });

  // ---------- the engine ----------
  const SOUND = (n, p, o) => Object.assign({ n, p, k: "spell" }, o && o.aoe ? {} : { fx: "resonate" }, o);   // area sound hurts everyone but does not stack Resonance
  const AB = {
    1: [SOUND("Intake Roar", 0.28, { aoe: 1, w: 3 }), SOUND("Piston Shriek", 0.6, { w: 3 }), { n: "Grind", p: 0.55, w: 2 }],
    2: [SOUND("Shuttle Whine", 0.55, { w: 3 }), SOUND("Loom Drone", 0.24, { aoe: 1, w: 2 }), { n: "Soul Hook", p: 0.5, drain: 0.6, w: 3 }],
    3: [SOUND("Rendering Howl", 0.3, { aoe: 1, w: 3 }), SOUND("Bone Frequency", 0.65, { db: ["def", -0.2, 2], w: 2 }), { n: "Press", p: 0.6, w: 2 }],
    4: [SOUND("Forge Hammer", 0.6, { w: 3 }), SOUND("Collar Chime", 0.26, { aoe: 1, db: ["spd", -0.15, 2], w: 2 }), { n: "Soul Hook", p: 0.5, drain: 0.6, w: 2 }],
    5: [SOUND("Overdrive Scream", 0.3, { aoe: 1, w: 4 }), SOUND("Feedback Spike", 0.65, { w: 3 }), { n: "Soul Hook", p: 0.5, drain: 0.6, w: 2 }],
  };
  const PH = (n, hpMult, extra) => Object.assign({ hpMult, ab: AB[n], text: CYCLES[n].name, actions: 2 }, extra || {});
  Core.defEnemy("harvestEngine", "The Harvest Engine", "caster", { boss: true, actions: 2, hooks: ["harvestEngine"], hpMult: 9, ab: AB[1], cycle: 1,
    xpAbs: Math.round(Core.fightXpBase(LV) * 14), goldAbs: Math.round(Core.goldBase(LV) * 14), immune: ["poison", "bleed", "stun", "freeze", "petrify"], rs: { shock: -0.25, earth: 0.25 }, vscale: 1.25,
    intro: "The Harvest Engine starts its cycle.", bigEvery: 5, bigHit: 0.55, bigName: "Full Yield",
    phases: [PH(2, 10), PH(3, 10, { bigEvery: 4 }), PH(4, 10), PH(5, 9, { breakType: "impact", breakNeed: 3, bigEvery: 4, bigHit: 0.6 })] });
  Core.DMG.byId.harvestEngine = 0.7; Core.DMG.byId.bellowsHorn = 0.7; Core.DMG.byId.soulLoom = 0.7; Core.DMG.byId.collarDrone = 0.7;   // tuned with the per-cycle sim (scratch engine.js): about 30 minutes
  // extra.from = the cycle to start at (the checkpoint after a defeat)
  BOSS_FOES.harvestEngine = (lv, extra) => {
    const u = Core.makeEnemy("harvestEngine", lv || LV), from = Math.max(1, Math.min(5, (extra && extra.from) || 1));
    for (let c = 2; c <= from; c++) { const p = u.phases.shift(); Object.assign(u, p); u.phaseNo = c; }
    u.maxHp = Core.maxHpOf(u.stats, u.level, u.hpMult); u.hp = u.maxHp; u.cycle = from;
    return [u];
  };

  // ---------- HUD lines ----------
  const baseNotes = Core.foeNotes;
  Core.foeNotes = (f, ctx) => {
    const n = baseNotes ? baseNotes(f, ctx) : [], r = ctx ? ctx.round : 0;
    if (f.id === "harvestEngine") {
      n.push("Cycle " + (f.cycle || 1) + " of 5: " + CYCLES[f.cycle || 1].name);
      n.push("Soul Harvest on round " + (Math.floor(r / 4) * 4 + 4));
      if (f.cycle === 1 && ctx && alive(ctx, "bellowsHorn").length) n.push("Horns standing: takes 75% less");
      if (f.cycle === 3) n.push(f.hushNow ? "THE HUSH: your hits echo back" : "Hush every 3rd round");
      if (f.cycle === 5) n.push("Scream +" + 4 * (f.scream || 0) + "% damage");
    }
    if (f.hooks && f.hooks.includes("soulLoom")) n.push("Heals the engine 3% a round");
    return n;
  };
  // Resonance shows on the hero's own chips (arena3d.js reads u.reso)
  if (typeof module !== "undefined") module.exports = Core;
})(typeof window !== "undefined" ? window : globalThis);
