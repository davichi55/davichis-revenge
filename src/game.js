// Davichi's Revenge: game bootstrap. Scenes (Boot, Title, Hub fallback), the bridge to the world engine (World.hooks + the Region scene), test hooks (window.dbg).
// The story lives in src/story/*.js, the screens in src/ui/*.js, state/flow in src/story/flow.js.
"use strict";
const W = 960, H = 540;
const FONT = '"Marcellus", "Georgia", serif', FONT_HEAD = '"Marcellus SC", "Marcellus", "Georgia", serif';
const COL = { ink: "#f4e9d4", dim: "#b7a58a", gold: "#f2c14e" };
const wait = (scene, ms) => Flow.wait(ms);

// ---------- ids: the world engine's region ids <-> the story's ----------
const WORLD_ID = { orun: "orun", undercroft: "orunUndercroft", dunes: "whisperglassDunes", sandpiper: "sandpiperRest", cistern: "cisternBurntGate", amberWells: "amberWells", basin: "amberBasin", maze: "boneMaze", flats: "cinderglassFlats", quarry: "scorpionQuarry", hollow: "hollowSkyStone", saltgate: "saltgate" };
const STORY_ID = {}; Object.entries(WORLD_ID).forEach(([k, v]) => (STORY_ID[v] = k));
const toStory = id => STORY_ID[id] || id, toWorld = id => WORLD_ID[id] || id;

// ---------- the bridge to the world engine ----------
const Engine = {
  prev: null,
  hasWorld(my) { return !!(window.World && World.REGIONS && World.REGIONS[toWorld(my)] && window.Region && !(window.dbg && window.dbg.noWorld) && !/[?&]hub/.test(location.search)); },
  stopOthers(keep) { ["Title", "Hub", "Region"].forEach(k => { try { if (k !== keep && game.scene.isActive(k)) game.scene.stop(k); } catch (e) {} }); },
  async enter(my, entry) {
    const wid = toWorld(my);
    if (this.hasWorld(my)) {
      const R = World.REGIONS[wid], en = R.entries || {};
      const cand = [entry, "from_" + this.prev, "from_" + toWorld(this.prev || ""), "start"].filter(Boolean);
      const e = cand.find(c => en[c]) || "start";
      // never restart the Region scene while it is still loading its textures (two overlapping loads add the same texture twice)
      for (let i = 0; i < 200; i++) { const sc = game.scene.getScene("Region"); if (!(sc && game.scene.isActive("Region") && sc.ready === false && !sc.dead)) break; await new Promise(r => setTimeout(r, 50)); }
      this.stopOthers("Region"); this.mode = "world";
      game.scene.start("Region", { region: wid, entry: e, party: G.party.map(u => u.id), flags: G.flags });
    } else {
      this.stopOthers("Hub"); this.mode = "hub";
      game.scene.start("Hub", { region: my });
    }
    this.prev = my; this.cur = my;
  },
  ready(my) { if (this.mode === "hub") hubLoop(my, Flow.token); },
};
Flow.engine = Engine;
Flow.toTitle = () => { Flow.token++; Engine.stopOthers("Title"); game.scene.start("Title"); };

// refuse exits the story is not ready for (world-engine mode; the hub uses the same rules through its visible conditions)
Story.exitGate = (to, F) => {
  const f = k => F.f(k);
  if (to === "dunes" && G.region === "orun" && !f("pro.packed")) return f("pro.dunmar") ? "(Not yet. The lessons and the vault first.)" : "(I should talk to Master Ithiel and Old Dunmar first.)";
  if (to === "undercroft" && !f("pro.dunmar")) return "(Dunmar's lessons. I should find him first.)";
  if (to === "cistern" && !f("sp.letter")) return "(A dead-end cistern. I don't know why I'd go in there.)";
  if (to === "basin" && G.region === "dunes" && !f("ci.karvan")) return "(The main road is crawling with raiders. There has to be another way east.)";
  if (["quarry", "flats", "saltgate", "hollow"].includes(to) && !f("am.wagon")) return "(I should find Old Dunmar's wagon in Amber Wells first.)";
  return null;
};

// ---------- World.hooks (D's engine calls these; story code handles them) ----------
(function installHooks() {
  if (!window.World) return;
  const Hk = World.hooks = World.hooks || {};
  Hk.talk = (npc, rid) => Flow.hookTalk(npc, toStory(rid));
  Hk.trigger = (id, rid) => Flow.hookTrigger(id, toStory(rid));
  Hk.chest = id => Flow.hookChest(id);
  Hk.gather = id => Flow.hookGather(id);
  Hk.encounter = (table, rid) => Flow.hookEncounter(table, toStory(rid));
  Hk.menu = () => Flow.hookMenu();
  Hk.exit = async (to, entry, info) => {
    const my = toStory(to), why = Story.exitGate(my, Flow);
    if (why) { await Flow.guard(() => UI.say([["hero", why]])); return false; }
    await Flow.hookExit(my, entry); return "handled";
  };
})();

// ---------- scenes ----------
function txt(scene, x, y, s, size = 18, color = COL.ink, opts = {}) {
  return scene.add.text(x, y, s, { fontFamily: opts.head ? FONT_HEAD : FONT, fontSize: size + "px", color, wordWrap: opts.wrap ? { width: opts.wrap } : undefined, align: opts.align || "left", lineSpacing: 4 }).setOrigin(opts.ox || 0, opts.oy || 0).setResolution(2);
}
class Boot extends Phaser.Scene {
  constructor() { super("Boot"); }
  preload() { ["title", "bg_desert", "bg_ruins", "pano_desert", "pano_temple"].forEach(k => this.load.image(k, "assets/" + k + ".png")); }
  create() {
    try { const s = JSON.parse(localStorage.getItem("davichi-settings") || "null"); if (s && s.vol) window.__vol = s.vol; } catch (e) {}
    const go = () => this.scene.start("Title");
    if (document.fonts) Promise.all([document.fonts.load('20px "Marcellus"'), document.fonts.load('20px "Marcellus SC"')]).then(go, go); else go();
  }
}

const LORE = [
  { image: "assets/pano_temple.png", text: "Long before any empire, the builders raised black-and-gold cities over the sand, and forged creatures from the metal of fallen stars." },
  { image: "assets/pano_temple.png", text: "Their greatest works were the Titans, giants set to sleep beneath the land. The builders vanished. The Titans slept on." },
  { image: "assets/bg_ruins.png", text: "Then came the Tzakal Harvesting Company. It learned to drain creatures of their power, and its power grew until even the old emperor gave up his throne to its head: Davichi." },
  { image: "assets/bg_ruins.png", text: "The empire has marched ever since, waging war on everyone, hunting for the Titans. It tortures anyone who knows where they sleep." },
  { image: "assets/pano_desert.png", text: "In the free city of Orun, at the edge of the desert, stands the Scholars' Academy. It studies what the builders left behind. Today, a young apprentice will choose a team." },
];

class Title extends Phaser.Scene {
  constructor() { super("Title"); }
  async create() {
    this.cameras.main.setBackgroundColor("#120d0a");
    const img = this.add.image(W / 2, H / 2, "title"); img.setScale(Math.max(W / img.width, H / img.height));
    this.add.rectangle(0, 0, W, H, 0x000000, 0.35).setOrigin(0);
    txt(this, W / 2, 56, "DAVICHI'S REVENGE", 56, COL.gold, { ox: 0.5, head: true }).setStroke("#000", 6);
    txt(this, W / 2, 124, "Milestone 1 · Prologue to the Dune Bearer", 18, COL.dim, { ox: 0.5 }).setStroke("#000", 4);
    UI.ensure(); Flow.music("title");
    const my = ++Flow.token;
    for (;;) {
      const info = Flow.hasSave() ? Flow.saveInfo() : null;
      const opts = [{ label: "New game" }, { label: "Continue", disabled: !info, info: info ? `Chapter ${info.ch}, ${info.party}` : "" }, { label: "Settings" }];
      const i = await UI.choose("", opts, { top: "46%", width: "min(360px,92vw)" });
      if (Flow.token !== my) return;
      if (i === 2) { await Menus.settings(); continue; }
      if (i === 1 && Flow.load()) { Flow.applyVolume(); await UI.fade(true, 400); Flow.enter(G.region, G.entry || "start"); return; }
      if (i === 0) {
        if (info && !(await UI.confirm("Start over? Your saved game stays until you save again.", "New game", "Back"))) continue;
        Flow.newGame(); G.vol = window.__vol || { music: 0.7, sfx: 0.8 }; Flow.applyVolume();
        Flow.music("story");
        for (const p of LORE) await UI.card(p);
        Flow.enter("orun", "start"); return;
      }
    }
  }
}

// Fallback explorer: used when the world engine has no map for a region yet. Same hooks, driven by menus.
class Hub extends Phaser.Scene {
  constructor() { super("Hub"); }
  create(data) {
    const R = Data.REGIONS[data.region] || {};
    this.cameras.main.setBackgroundColor("#120d0a");
    const key = R.bg || "bg_desert", img = this.add.image(W / 2, H / 2, key); img.setScale(Math.max(W / img.width, H / img.height));
    this.add.rectangle(0, 0, W, H, 0x000000, 0.4).setOrigin(0);
    txt(this, W - 24, 24, R.n || data.region, 30, COL.gold, { ox: 1, head: true }).setStroke("#000", 5);
    this.hud = txt(this, W - 24, 70, "", 17, COL.ink, { ox: 1, align: "right" }).setStroke("#000", 4);
    this.time.addEvent({ delay: 300, loop: true, callback: () => this.hud && this.hud.active && this.hud.setText(`${G.gold} kakal   ${G.items.sunwater || 0} flasks\n` + G.party.map(u => `${u.name} Lv${u.level}  ${u.hp}/${u.maxHp}`).join("\n")) });
  }
}
async function hubLoop(region, token) {
  while (Flow.token === token) {
    const R = Data.REGIONS[region] || {}, s = Flow.sstate(), opts = [];
    (R.npcs || []).forEach(([id, label, cond]) => { if (!cond || cond(s)) opts.push({ label: "Talk: " + label, run: () => Flow.hookTalk(id, region) }); });
    (R.things || []).forEach(([id, label, cond, kind]) => { if (!cond || cond(s)) opts.push({ label: "Search: " + label, run: () => (kind === "chest" ? Flow.hookChest(id) : kind === "gather" ? Flow.hookGather(id) : Flow.hookTrigger(id, region)) }); });
    (R.exits || []).forEach(([id, label, cond, kind]) => { if (!cond || cond(s)) opts.push({ label: "> " + label, run: () => (kind === "trigger" ? Flow.hookTrigger(id, region) : kind === "inn" ? Flow.guard(() => Flow.inn(id)) : Flow.hookExit(id)) }); });
    if (R.fields && R.table) opts.push({ label: "Wander the area (random fight)", run: () => Flow.hookEncounter(R.table, region) });
    if (R.table && !R.fields && R.id !== "undercroft") { /* tutorial cellar: no random fights */ }
    opts.push({ label: "Menu", run: () => Flow.hookMenu() });
    const i = await UI.choose(R.n || region, opts.map(o => ({ label: o.label })), { pos: "left", back: true });
    if (Flow.token !== token) return;
    try { if (i < 0) await Flow.hookMenu(); else await opts[i].run(); } catch (e) { console.error(e); }
  }
}

// ---------- test hooks ----------
window.dbg = {
  get G() { return G; }, Core, Flow, Data, Story, Menus, UI, auto: false, noWorld: false,
  newGame(packIdx = 0, level = 3) { UI.reset(); Flow.newGame(); const pk = Data.PACKS[packIdx]; G.pack = pk.id; const sl = Story.assignSlots(pk.id); G.slots = sl.slots; G.unchosen = sl.unchosen; G.mirror = sl.mirror; G.party = pk.ids.map(id => Flow.mk(id, level)); G.vol = { music: 0.7, sfx: 0.8 }; return G; },
  // jump to a chapter with a ready party: "prologue" | 1 | 2 | 3 (end of M1 reached) ; or a region id
  jump(where = 1, packIdx = 0, level) {
    const F = Flow, lv = level || ({ prologue: 1, 1: 3, 2: 6, 3: 10 }[where] || 4);
    this.newGame(packIdx, lv);
    const f = k => (G.flags[k] = true);
    if (where === "prologue") { Flow.newGame(); G.party = []; G.region = "orun"; F.enter("orun", "start"); return G; }
    ["pro.start", "pro.dunmar", "pro.l1", "pro.l2", "pro.lessons", "pro.packed"].forEach(f); G.quests.m_lessons = "done"; G.items.sunwater = 8; G.items.journal = 1;
    let region = "dunes";
    if (where >= 1 || where === "sandpiper") { f("ch1.start"); f("sp.seen"); region = "sandpiper"; G.ch = 1; G.quests.m_escape = 0; G.lastTown = "sandpiper"; G.gold = 120; }
    if (where >= 2) { ["sp.letter", "sp.rested", "ci.karvan", "am.seen"].forEach(f); G.ch = 2; G.quests.m_escape = "done"; G.quests.m_cistern = "done"; G.quests.m_research = 0; G.lastTown = "amberWells"; region = "amberWells"; G.gold = 400; F.giveGear("G16", 3, true); G.items.sunwater = 12; }
    if (where >= 3) { ["am.wagon", "am.letter", "hol.seen", "bear.done", "sg.seen"].forEach(f); G.quests.m_research = "done"; G.quests.m_bearer = "done"; region = "saltgate"; G.lastTown = "saltgate"; G.gold = 600; }
    if (typeof where === "string" && Data.REGIONS[where]) region = where;
    G.region = region; G.entry = "start"; F.enter(region, "start"); return G;
  },
  region(id, entry) { return Flow.enter(id, entry || "start"); },
  give(k, n = 1) { Flow.give(k, n); }, gold(n = 100) { G.gold += n; },
  levels(n = 1) { for (let i = 0; i < n; i++) Core.giveXp(G.party, Core.xpToNext(G.party[0].level)); G.party.forEach(u => { u.hp = u.maxHp; }); },
  heal() { Flow.healAll(); },
  fight(table) { return Flow.fight(Flow.rollEncounter(table || Data.REGIONS[G.region].table), {}); },
  say(...a) { return UI.say(a); },
  worldCheck() { const out = {}; if (!window.World) return "no World"; Object.entries(World.REGIONS).forEach(([id, R]) => { out[id] = { mapped: toStory(id), npcs: (R.npcs || []).map(n => n.id).filter(Boolean), triggers: (R.triggers || []).map(t => t.id), chests: (R.chests || []).map(c => c.id), gathers: (R.gathers || []).map(c => c.id), exits: (R.exits || []).map(e => e.to) }; }); return out; },
  save() { return Flow.save(); },
};

window.game = new Phaser.Game({
  type: Phaser.AUTO, parent: "game", width: W, height: H, pixelArt: true, backgroundColor: "#120d0a",
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [Boot, Title, Hub].concat(window.Region ? [window.Region] : []),
});
