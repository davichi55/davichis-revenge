// Menu pieces from SYSTEMS: paged journal and bestiary (200+ entries), Travel tab (ferry pass), Charms list. Loaded after src/systems-arena.js, before src/ui/menus.js,
// which calls Systems.ui.* (journalHtml/journalClick, travelHtml/travelClick, charmsHtml/charmClick).
"use strict";
(() => {
  const S = window.Systems, F = Flow, esc = S.esc, pretty = S.pretty;
  const PER = 8;
  const U = S.ui = { jt: 0, page: 0, cat: "All", qcat: "All" };
  Data.BREAKS = Data.BREAKS || {};
  Data.BREAKS.duneBearer = Data.BREAKS.duneBearer || "Crack the sky-stone with two heavy impact moves in a row.";
  Data.BREAKS.raidOptioKarvan = Data.BREAKS.raidOptioKarvan || Data.BREAKS.duneBearer;

  // ---------- bestiary ----------
  const legendEnemies = () => { const m = {}; Object.values(Data.LEGENDS || {}).forEach(l => { if (l.enemy) m[l.enemy] = l; }); return m; };
  const wallIds = () => { const m = {}; ((S.state().arena || {}).wall || []).forEach(w => w.foes.forEach(f => (m[f] = w))); return m; };
  const catOf = id => {
    const e = (Core.ENEMIES && Core.ENEMIES[id]) || {}, L = legendEnemies();
    if (L[id]) return "Legends";
    if (wallIds()[id]) return "Champions' Wall";
    if (e.titan || /^titan|Titan$/.test(id) || (Data.TITANS && Data.TITANS.includes && Data.TITANS.includes(id))) return "Titans";
    if (e.boss || /^(duneBearer|raidOptioKarvan)$/.test(id)) return "Bosses";
    if (/^raid|legion|optio|centurion|soldier|archer|spearman|shield|general|admiral/i.test(id)) return "Soldiers";
    return "Creatures";
  };
  U.CATS = ["All", "Creatures", "Soldiers", "Bosses", "Titans", "Legends", "Champions' Wall"];
  U.bestiary = () => {
    const ids = Object.keys(G.best).filter(id => G.best[id] && G.best[id].seen);
    // the wall also lists champions that are not in best (never fought in the field)
    return ids.map(id => ({ id, cat: catOf(id) })).filter(x => U.cat === "All" || x.cat === U.cat).sort((a, b) => (G.best[a.id].ch || 0) - (G.best[b.id].ch || 0) || a.id.localeCompare(b.id));
  };
  const entry = ({ id, cat }) => {
    const b = G.best[id], c = (Core.ENEMIES && Core.ENEMIES[id]) || {}, nm = c.name || (Data.NAMES && Data.NAMES[id]) || pretty(id);
    const lv = b.lv ? (b.lv[0] === b.lv[1] ? "Lv " + b.lv[0] : `Lv ${b.lv[0]}-${b.lv[1]}`) : "";
    const where = b.where && Data.REGIONS[b.where] ? Data.REGIONS[b.where].n : "";
    const brk = Data.BREAKS[id], isBoss = c.boss || cat === "Bosses" || cat === "Titans" || cat === "Legends";
    const breakLine = brk || isBoss ? `<small>Break: ${brk && b.breakKnown ? esc(brk) : "not discovered yet"}</small>` : "";
    // drops (Danny 2026-10-31): known once you have beaten it; skill-book materials are marked
    const bookMat = {}; Object.values(Data.BOOK || {}).forEach(k => (bookMat[k.mat] = k.n));
    const dl = (Data.DROPS[id] || c.drops || []).filter(([k]) => !/^G\d+$/.test(k));
    const dName = k => (Data.MATS[k] || Data.GOODS[k] || [Data.ITEMS[k] ? Data.ITEMS[k].n : pretty(k)])[0];
    const dropLine = dl.length ? `<small>Drops: ${b.beaten ? dl.map(([k, p]) => esc(dName(k)) + ` (${p >= 0.3 ? "common" : p >= 0.15 ? "uncommon" : "rare"}${bookMat[k] ? ", skill book: " + esc(bookMat[k]) : ""})`).join(", ") : "unknown until you beat one"}</small>` : "";
    return `<div class="row"><div style="width:62px;height:54px;display:grid;place-items:center">${UI.art(c.art || id)}</div><div class="g"><b style="font-weight:400">${esc(nm)}</b> <small style="display:inline;color:#8a6a3a">${esc(cat === "All" ? "" : cat)}</small><small>${esc(Data.BEST[id] || "No notes yet.")}</small><small>Met ${b.seen || 0}x · beaten ${b.beaten || 0}x${lv ? " · " + lv : ""}${where ? " · " + esc(where) : ""}${b.ch !== undefined ? " · chapter " + b.ch : ""}</small>${dropLine}${breakLine}</div></div>`;
  };
  const pager = (total, key) => {
    const pages = Math.max(1, Math.ceil(total / PER)); U.page = Math.min(U.page, pages - 1);
    return `<div style="display:flex;gap:10px;align-items:center;margin:8px 0"><button class="b" data-sj="${key}:prev" ${U.page <= 0 ? "disabled" : ""}>&lt; Prev</button><span style="color:#b7a58a">Page ${U.page + 1} / ${pages} · ${total} entries</span><button class="b" data-sj="${key}:next" ${U.page >= pages - 1 ? "disabled" : ""}>Next &gt;</button></div>`;
  };
  const chips = (list, cur, key) => `<div style="margin-bottom:8px;display:flex;flex-wrap:wrap;gap:6px">${list.map(c => `<button class="tab${c === cur ? " on" : ""}" data-sj="${key}:${esc(c)}">${esc(c)}</button>`).join("")}</div>`;

  // ---------- journal ----------
  U.SUBS = ["Quests", "Rumours", "Bestiary", "Legends", "Stats", "Effects"];
  // ---------- effects guide (Danny 2026-10-31): how statuses, reactions and breaks work; an entry opens once it happened in a fight (G.seenFx, set by the arena) ----------
  U.FX_HELP = [
    ["damage", "How damage works", "Physical moves use Attack against Defense, spells use Power against Resistance: damage = move power x your stat x your stat / (your stat + their defence). A critical hit does 1.5x. Hitting a weakness does more (WEAK), a resistance less (RESIST). A creature resists its own element a little.", true],
    ["mp", "MP and actions", "Every creature gets 2 actions per turn (3 if its Speed is at least twice the fastest enemy's). A basic attack gives +1 MP; other moves cost 1, 2 or 3 MP. Fights start at 0 MP plus 1 per 10 Focus, MP never carries over to the next fight, and a creature holds at most 10 MP (Leviathans 15). Medium and strong moves (2-3 MP) are the ones that break enemies; cheap moves shine once an enemy is broken.", true],
    ["items", "Items in battle", "Using an item takes one action, and each creature can use only one item per turn. A Sunwater flask heals 25% of max HP, an Ashen Ember brings a fallen creature back at 30% HP, a Reed Antidote clears most statuses (not Wet) and lowered stats. A night at an inn heals the whole team.", true],
    ["elements", "Elements", "Moves can carry an element: fire, water, ice, shock, earth, wind, light, dark, nature or poison. Foes can be weak to an element (WEAK: more damage) or resist it (RESIST: less). Every creature resists its own element a little (25% less). Some elements bring statuses with them, and some mix into reactions.", true],
    ["offstyle", "The off-style slot", "Each creature can carry one move from the Skill Book in its off-style slot. It costs the normal MP, but the creature's style passive and role bonuses do not apply to it. Skill-book moves are unlocked with 10 pieces of their material.", true],
    ["levelgap", "Level gap", "An enemy more than 5 levels below your creature hits softer: 4% less per extra level, never below 35% of a normal hit. Weaker enemies also give less experience: 15% less per level below your party (never below 10%), and stronger ones 5% more per level above (up to 30% more).", true],
    ["telegraph", "Big attacks", "Some foes gather their strength for a whole turn and strike on their next one; a warning shows above the fight. Stunning or freezing the foe while it gathers cancels the attack. Otherwise it is time to heal, shield or guard."],
    ["shield", "Shields", "A shield takes damage before HP does, until it is used up or runs out of time. Blocked damage shows as \"blocked\" next to the number."],
    ["guard", "Taunts and guarding", "A taunting creature draws every single-target attack onto itself (area attacks still hit everyone). Bulwark goes further: the guard takes the hits meant for one ally until its next turn.", true],
    ["swarm", "Swarms", "Some foes are a swarm of many small bodies: area moves hit them 1.6x as hard, single-target moves only 0.75x.", true],
    ["burn", "Burn", "Fire damage at the end of each of the burning one's turns, for 3 turns (a new stack refreshes the time), up to 8 stacks. Each tick = stacks x (1 + 0.18 x the Power of whoever set it alight). More Power, hotter burn. Water puts it out."],
    ["bleed", "Bleed", "Damage at the end of each of the bleeding one's turns, for 3 turns, up to 8 stacks. Each tick = stacks x (1 + 0.18 x the Attack of whoever cut it). Skeletons and some others cannot bleed."],
    ["poison", "Poison", "Poison damage at the end of each of the poisoned one's turns, for 4 turns, up to 8 stacks. Each tick = stacks x (1 + 0.18 x the Power of whoever poisoned it). Slow but long."],
    ["shock", "Shock", "A small tick each turn for 2 turns (up to 3 stacks), and every stack gives a 12% chance to lose an action at the start of a turn. On a wet target, shock does double damage instead (Conductive)."],
    ["wet", "Wet", "Lasts 3 turns. Wet + shock = Conductive (double damage). Wet + chill = Freeze. Wet + burn = Steam (the burn goes out)."],
    ["chill", "Chill", "Each stack lowers Speed by 6% for 3 turns, up to 6 stacks. Chill + wet = Freeze. A heavy physical blow on a chilled or frozen target shatters it (Shatter)."],
    ["freeze", "Freeze", "Frozen solid: skips its next turn. Big foes do not always freeze. A heavy physical blow on a frozen target does 1.6x (Shatter)."],
    ["slow", "Slow", "Speed x 0.7 for 2 turns. Slowing an enemy can give your fast creatures a third action (twice the enemy's Speed)."],
    ["stun", "Stun", "Loses its next turn. A stun also cancels an attack the enemy was gathering strength for. Bosses grow harder to stun each time."],
    ["steam", "Steam", "Wreathed in steam: Attack -25% for 2 turns. Comes from mixing wet and fire."],
    ["petrify", "Petrify", "Turning to stone: each round Attack, Power and Speed drop by another 10%; at the third step it is stunned."],
    ["tide", "Tide", "Leviathans build Tide (up to 5) with moves such as Tail Slap (+1), Undertow (+1), Deep Breath (+2), Riptide (+1), Swell (+1 at the start of each of its next 3 turns) and Brace the Deep (+1 when hit, at most 2). Maelstrom and Tidal Wave release it: damage x (1 + 1.6 per Tide), so 5 Tide hits 9x as hard, and the Tide drops to 0. A release at 5 Tide also tries to stun (High Water). Every Leviathan knows Tithe of the Deep from level 1: it costs 20% of its max HP and no MP, needs at least 1 Tide, and its next release (Maelstrom or Tidal Wave, within 3 turns) hits x (1 + 0.3 per Tide held when you pay), so 5 Tide makes that release 2.5x harder again (1 Tide only x1.3). The tithe is spent by the release, you cannot pay it twice, and it cannot be paid with too little HP left. The classic round: build to full Tide, pay the tithe, release. Tide starts at 0 every fight. Leviathans also hold up to 15 MP instead of 10."],
    ["Conductive", "Reaction: Conductive", "Shock on a wet target: double damage, and the water is used up."],
    ["Freeze", "Reaction: Freeze", "Chill on a wet target, or wet on a chilled one: the target freezes."],
    ["Shatter", "Reaction: Shatter", "A medium or strong physical move on a chilled or frozen target: 1.6x damage, and the ice breaks."],
    ["Steam", "Reaction: Steam", "Wet on a burning target, or fire on a wet one: the burn goes out and steam lowers its Attack."],
    ["Detonate", "Reaction: Detonate", "Detonate uses up every element mark on the target (burn, wet, chill, shock) for one burst; each mark adds to the blast."],
    ["broken", "Breaks", "Some foes crack under the right kind of medium or strong move (impact, slow, shell, an element...). When it breaks, it takes 1.5x damage for a short while, then recovers. Cheap moves are best while it is broken."],
    ["debuff", "Lowered stats", "Moves like Hiss or Venom Mark lower one stat by a share of its value for a few turns (one turn = one round): Hiss -25% Attack for 2 turns, Venom Mark -25% Resistance for 3 turns. A new lowering of the same stat replaces the old one instead of stacking, and a lowering and a raise of the same stat add together. Bosses take only 70% of it (-25% becomes about -17%). A stat never drops below 20% of its value."],
    ["buff", "Raised stats", "Raises work the same way: a share of the stat for a few turns (Fortify: +40% Defense and Resistance for 2 turns). A new raise of the same stat replaces the old one. Some effects stop raises for a while (Curse of Stone)."],
    ["resist", "Resisted", "Statuses do not always land: your Luck raises the chance, the target's Resistance lowers it. Some foes are immune to certain statuses."],
  ];
  U.effectsHtml = () => {
    let seen = {}; try { seen = G.seenFx || {}; } catch (e) {}
    const open = U.FX_HELP.filter(x => x[3] || seen[x[0]]), shut = U.FX_HELP.length - open.length;
    return open.map(x => `<div class="row"><div class="g">${esc(x[1])}<small>${esc(x[2])}</small></div></div>`).join("")
      + (shut ? `<div class="row"><div class="g" style="color:#6d5f4f">${shut} more ${shut === 1 ? "effect" : "effects"} not seen yet</div></div>` : "");
  };
  // ---------- stats guide (Danny 2026-10-31): what every stat does, and where each owned creature's points work best ----------
  U.STAT_HELP = {
    hp: ["HP", "How much damage it can take. Max HP = 30 + 5 per HP point + 3 per level. Every creature needs some; the ones that stand in front need a lot."],
    atk: ["Attack", "Damage of basic attacks and physical moves. Damage = move power x Attack x Attack / (Attack + the target's Defense), so Attack grows stronger the more you put in. Moves that use \"the higher of Attack and Power\" pick whichever is bigger."],
    pow: ["Power", "Damage of spells, and how much heals and shields restore. Spell damage uses the same rule as Attack, against the target's Resistance. Healers and spellcasters live on this stat."],
    def: ["Defense", "Less damage from physical hits. When your Defense equals the attacker's Attack, its hits do half damage; more Defense keeps lowering it."],
    res: ["Resistance", "Less damage from spells (same rule as Defense, against Power). It also makes enemy statuses (burn, poison, stun...) land less often (up to 80% of them miss), and makes control effects such as stun, freeze and being held land less often."],
    spd: ["Speed", "Who acts first each round. A creature with at least twice the Speed of the fastest enemy gets 3 actions that turn instead of 2. Slowing an enemy can push you over that line in the middle of a fight."],
    foc: ["Focus", "Starting MP in every fight: 1 MP for each full 10 Focus. Fights start at 0 MP otherwise, so Focus means your first spells come a turn or two sooner."],
    lck: ["Luck", "Critical hits: 5% chance + 0.4% per Luck point (minus 0.2% per point of the target's Luck), between 2% and 60%; a critical hit does 1.5x damage. Luck also raises the chance your statuses land and lowers the enemy's critical chance on you."],
  };
  U.STYLE_TIP = {
    minotaur: "Hits hard and spends little MP: Attack first, HP so it survives in front, a little Speed.",
    harpy: "Fast, many small hits: Speed (aim for twice the enemy's), Attack, then Luck for critical hits.",
    hydra: "Wears foes down with statuses: Power for stronger burn and poison, Luck so they land, some HP.",
    colossus: "Stands in front and takes the hits: HP, Defense and Resistance. Attack matters little.",
    phoenix: "Heals and rises again: Power for bigger heals, Focus so the first heal comes early, Resistance.",
    gorgon: "Slows and weakens: Speed to act before the enemy, Power and Luck so its effects land.",
    dragon: "Big spells and reactions: Power first, Focus for early MP, then Speed.",
    leviathan: "Builds Tide and releases it: HP to last, Focus (its MP pool is 15), and Power or Attack for the release.",
  };
  U.statsHtml = () => {
    const own = (G.party || []).concat(G.collection || []).filter(u => u && Core.CREATURES[u.id]);
    let h = `<h3>What each stat does</h3>` + Core.STATS.map(k => `<div class="row"><div class="g">${esc(U.STAT_HELP[k][0])}<small>${esc(U.STAT_HELP[k][1])}</small></div></div>`).join("");
    h += `<h3 style="margin-top:12px">Your creatures</h3>`;
    h += own.map(u => {
      const c = Core.CREATURES[u.id], st = Core.STYLES[c.style] || {}, w = st.w || {}, t = c.t || {};
      const order = Core.STATS.map(k => [k, (w[k] || 1) * (t[k] || 1)]).sort((a, b) => b[1] - a[1]).map(x => Core.STAT_NAMES[x[0]]);
      return `<div class="row"><div class="g">${esc(u.name)} <small style="display:inline;color:#b7a58a">${esc(c.styleName || "")} · level ${u.level}${u.points ? ` · ${u.points} points to spend` : ""}</small><small>${esc(U.STYLE_TIP[c.style] || "")}</small><small>Best for ${esc(u.name)}: ${esc(order.slice(0, 3).join(", "))}. Useful: ${esc(order.slice(3, 5).join(", "))}. Least: ${esc(order.slice(5).join(", "))}.</small></div></div>`;
    }).join("") || `<div class="row"><div class="g">No creatures yet.</div></div>`;
    return h;
  };
  U.journalHtml = foot => {
    let h = foot + `<div style="margin-bottom:10px">${U.SUBS.map((s, i) => `<button class="tab${i === U.jt ? " on" : ""}" data-sj="tab:${i}">${s}</button>`).join(" ")}</div>`;
    if (U.jt === 0) {
      const ids = Object.keys(G.quests).filter(i => Data.QUESTS[i]), grp = i => (Data.QUESTS[i].ch !== undefined ? "Chapter " + Data.QUESTS[i].ch : Data.QUESTS[i].main ? "Main story" : "Side");
      const act = ids.filter(i => G.quests[i] !== "done"), done = ids.filter(i => G.quests[i] === "done");
      const sorted = list => list.slice().sort((a, b) => (Data.QUESTS[b].main ? 1 : 0) - (Data.QUESTS[a].main ? 1 : 0));
      const q = (i, d) => { const o = Data.QUESTS[i]; return d ? `<div class="row"><div class="g" style="color:#b7a58a">${esc(o.t)}</div></div>` : `<div class="row"><div class="g">${esc(o.t)}${o.main ? ` <small style="display:inline;color:#f2c14e">main</small>` : ""}<small>${esc(o.steps[G.quests[i]] || "")}</small></div></div>`; };
      const groups = list => { const g = {}; list.forEach(i => (g[grp(i)] = g[grp(i)] || []).push(i)); return Object.keys(g).map(k => (Object.keys(g).length > 1 ? `<div style="color:#8a6a3a;margin:6px 0 4px">${esc(k)}</div>` : "") + sorted(g[k]).map(i => q(i, list === done)).join("")).join(""); };
      const total = act.length + done.length, shown = (list) => list; void shown;
      const all = act.concat(done); const pages = Math.ceil(total / (PER * 2)); void pages;
      h += `<h3>Active</h3>` + (act.length ? groups(act) : `<div class="row"><div class="g">Nothing active.</div></div>`);
      const dp = done.slice(U.page * PER * 2, U.page * PER * 2 + PER * 2);
      h += `<h3 style="margin-top:12px">Done (${done.length})</h3>` + (dp.map(i => q(i, true)).join("") || `<div class="row"><div class="g">None yet.</div></div>`);
      if (done.length > PER * 2) h += pager(Math.ceil(done.length / 2), "q"); void all;
    } else if (U.jt === 1) {
      const towns = Object.keys(G.rumours).filter(t => G.rumours[t].length);
      const nm = t => { const r = Data.REGIONS[t === "amber" ? "amberWells" : t]; return r ? r.n : pretty(t); };
      const lines = []; towns.forEach(t => G.rumours[t].forEach(i => lines.push([t, (Data.RUMOURS[t] || [])[i]])));
      const pg = lines.slice(U.page * 10, U.page * 10 + 10);
      h += lines.length ? pg.map((l, k) => (k === 0 || pg[k - 1][0] !== l[0] ? `<h3 style="margin-top:8px">${esc(nm(l[0]))}</h3>` : "") + `<div class="row"><div class="g">${esc(l[1])}</div></div>`).join("") : `<div class="row"><div class="g">No rumours yet. Talk to people in towns.</div></div>`;
      if (lines.length > 10) { const pages = Math.ceil(lines.length / 10); U.page = Math.min(U.page, pages - 1); h += `<div style="display:flex;gap:10px;align-items:center;margin:8px 0"><button class="b" data-sj="r:prev" ${U.page <= 0 ? "disabled" : ""}>&lt; Prev</button><span style="color:#b7a58a">Page ${U.page + 1} / ${pages}</span><button class="b" data-sj="r:next" ${U.page >= pages - 1 ? "disabled" : ""}>Next &gt;</button></div>`; }
      if (G.flags["lore.bearer"]) h += `<h3 style="margin-top:12px">Lore</h3><div class="row"><div class="g">${esc(Data.LORE.bearerBreak)}</div></div>`;
    } else if (U.jt === 2) {
      const all = U.bestiary(); h += chips(U.CATS, U.cat, "cat");
      if (U.cat === "Champions' Wall") {
        const wall = (S.state().arena || {}).wall || [];
        h += wall.length ? wall.map(w => `<div class="row"><div class="g"><b style="font-weight:400">${esc(w.n)}</b><small>${esc((Data.CUPS[w.cup] || {}).n || "")} champion · Level ${w.lv} · beaten in chapter ${w.ch}</small></div></div>`).join("") : `<div class="row"><div class="g">Nobody on the wall yet. Win a cup in Tzavan.</div></div>`;
      } else {
        h += all.length ? all.slice(U.page * PER, U.page * PER + PER).map(entry).join("") + pager(all.length, "b") : `<div class="row"><div class="g">Nothing here yet.</div></div>`;
      }
    } else if (U.jt === 4) {
      h += U.statsHtml();
    } else if (U.jt === 5) {
      h += U.effectsHtml();
    } else {
      const ids = Object.keys(Data.LEGENDS || {});
      h += ids.map(id => {
        const l = Data.LEGENDS[id], rec = (S.state().legends || {})[id] || {}, seen = rec.seen || rec.heard || rec.done || G.flags["legend." + id];
        if (!seen) return `<div class="row"><div class="g" style="color:#6d5f4f">Unknown legend<small>A rumour somewhere, perhaps.</small></div></div>`;
        return `<div class="row"><div class="g"><b style="font-weight:400">${esc(l.n)}</b> <small style="display:inline;color:${rec.done ? "#7ee081" : "#f2c14e"}">${rec.done ? "defeated" : "not defeated"}</small><small>${esc(l.note || "")}</small><small>${esc(l.where || "")}${l.respawn ? " · comes back after a while" : ""}</small></div></div>`;
      }).join("");
    }
    return h;
  };
  // returns true when the menu should redraw
  U.journalClick = d => {
    const [k, v] = String(d).split(":");
    if (k === "tab") { U.jt = +v; U.page = 0; }
    else if (k === "cat") { U.cat = v; U.page = 0; }
    else if (k === "b" || k === "q" || k === "r") U.page = Math.max(0, U.page + (v === "next" ? 1 : -1));
    return true;
  };

  // ---------- Travel tab ----------
  U.travelHtml = (foot, msg) => {
    const c = S.canTravel(); let h = foot + `<h3>Ferry pass</h3>`;
    if (!c.ok) h += `<div class="row"><div class="g">${esc(c.why)}<small>The pass works from towns, on the sea and out on the open road, never inside a dungeon.</small></div></div>`;
    else h += `<div style="color:#b7a58a;margin-bottom:8px">Choose a town you have visited. You arrive at its inn.</div>`;
    const list = S.travelList();
    h += list.length ? list.map(t => `<div class="row"><div class="g">${esc(t.name)}${t.here ? ` <small style="display:inline">you are here</small>` : ""}</div><button class="b" data-travel="${esc(t.id)}" ${!c.ok || t.here ? "disabled" : ""}>Sail</button></div>`).join("") : `<div class="row"><div class="g">No towns visited yet.</div></div>`;
    return h;
  };

  // ---------- Charms ----------
  U.charmsHtml = () => {
    const own = S.ownedCharms(); if (!own.length) return "";
    const act = S.activeCharm(), t = S.timedCharm();
    return `<h3 style="margin-top:12px">Charms</h3><div style="color:#b7a58a;margin-bottom:6px">One charm works at a time. A lit Incense or Lure Candle beats it while it burns.${t ? ` (${t.kind === "incense" ? "Incense" : "Lure Candle"} is burning now.)` : ""}</div>`
      + own.map(k => `<div class="row"><div class="g">${esc(S.CHARMS[k].n)}<small>${esc(S.CHARMS[k].d)}</small></div>${act === k ? `<b style="color:#7ee081">Active</b>` : `<button class="b" data-charm="${k}">Use</button>`}</div>`).join("")
      + `<div class="row"><div class="g">No charm<small>Normal fight rate.</small></div>${act === null ? `<b style="color:#7ee081">Active</b>` : `<button class="b" data-charm="none">Use</button>`}</div>`;
  };
  U.charmClick = k => { S.setCharm(k === "none" ? null : k); F.sfx("menuOk"); return k === "none" ? "No charm is active." : S.CHARMS[k].n + " is active."; };
})();

// Move descriptions name the exact stat change (Danny 2026-10-31: "not clear how Hiss lowers attack"): "Lowers enemy Attack for 2 turns." -> "... (Attack -25%)"
(function () {
  if (typeof Core === "undefined" || !Core.MOVES) return;
  const NM = Object.assign({}, Core.STAT_NAMES, { sres: "Status resistance", dr: "Damage taken" });
  Object.values(Core.MOVES).forEach(m => {
    if (!m.db || !m.db.length || !m.desc || /%/.test(m.desc) || m._dbNote) return;
    m._dbNote = 1;
    const bits = m.db.map(([st, v, t]) => `${NM[st] || st} ${v > 0 ? "+" : "-"}${Math.round(Math.abs(v) * 100)}%${t && !/turn/.test(m.desc) ? ` for ${t} turns` : ""}`);
    m.desc = m.desc.replace(/\.?\s*$/, ".") + ` ${bits.join(", ")}.`;
  });
})();
