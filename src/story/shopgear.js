// Gear in the shops of every chapter (Danny 2026-10-31: from chapter 3 on kakal had little to go to). Each main town sells spare copies of sets from earlier chapters,
// so a second or third creature can wear a set you already found. A full set costs about a third of a chapter's fight income (test-campaign.js gold per chapter:
// ch1 1.1k, ch2 3.8k, ch3 7.7k, ch4 10.6k, ch5 11k, ch6 35k, ch7 21k, ch8 25k, ch9 40k, ch10 32k, ch11 37k, post 160k). Pieces split 25/40/35 (helm/armour/weapon).
// Loaded after post.js: every shop key below must already exist.
"use strict";
(function () {
  const D = window.Data;
  const split = total => [0.25, 0.4, 0.35].map(f => Math.round(total * f / 10) * 10);
  const add = (shop, sets, total) => {
    const sh = D.SHOPS[shop]; if (!sh) { console.warn("shopgear: no shop", shop); return; }
    sh.gearPrice = Object.assign({}, sh.gearPrice); sh.stock = sh.stock.slice();   // some shops share one stock list (ch5 BAS, ch7 IMP...): copy before adding
    sets.forEach(set => { if (!sh.stock.includes("gear:" + set)) sh.stock.push("gear:" + set); sh.gearPrice[set] = split(total); });
  };
  // the three sets that were already for sale, priced to match
  add("sandpiper", ["G41"], 480);                // Wayfarer's Road Kit, ch1
  add("amber", ["G45"], 1200);                   // Stoneweather Cloak, ch2
  add("reach", ["G19"], 3600);                   // Challenge Banner Cohort, ch5
  // new
  add("ninefold", ["G16", "G12"], 2400);         // ch3: Tower Shield Phalanx (ch1), Cinder Serpent Pit (ch2)
  add("plume", ["G6", "G4"], 3200);              // ch4: Windfeather Scout (ch3), Warden of the Winding Halls (ch2)
  add("reach", ["G42"], 3600);                   // ch5: Legion Standard (ch3)
  add("tzavan", ["G17", "G21"], 7000);           // ch6: Stoneguard of the Sun Gate (ch2), Sunpriest's Vestments (ch4)
  add("kharam", ["G26"], 7000);                  // ch6: Stonegaze Order (ch5)
  add("lowstep", ["G22", "G31"], 7500);          // ch7: Ashen Pyre Order, Emberscale Mantle (ch6)
  add("pale", ["G32", "G43"], 8500);             // ch8: Tideglass Regalia (ch6), Sunstone Regalia (ch7)
  add("ashfeather", ["G13", "G30"], 11000);      // ch9: Bloodletter's Altar, Serpent-Haired Veil (ch8)
  add("saltmere", ["G29", "G24"], 12000);        // ch10: Coil of the Slow Hour, Shieldbearer Aviary (ch9)
  add("dawnwatch", ["G33", "G35"], 13000);       // ch11: Stormcaller's Obsidian Crown, Aether Bulb Circlet (ch10)
  add("starhaven", ["G25", "G14", "G18"], 30000); // post: Dawn-Fire Offering (ch11), Chorus of Many Heads, Counterstrike Bastion (ch6)
})();
