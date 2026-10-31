// Bestiary text, drops and break hints for the 18 enemies added on 2026-11-01 (RULES-BOSS; designs in art-review/new-enemies/list.md, rules in src/rules/m5.js).
// Loaded after shopgear.js. Goods are sold to shops like the other drops; prices follow the chapter's other drops (about 18 + 0.6 x level).
"use strict";
(function () {
  const D = window.Data, Q = Object.assign;
  Q(D.GOODS, {
    scytheEdge: ["Gilded Scythe Edge", 22], lacqueredScabbard: ["Lacquered Scabbard", 26], chainLink: ["Hooked Chain Link", 28], fanRib: ["Painted Fan Rib", 42], halberdSpike: ["Halberd Spike", 42],
    flailBall: ["Spiked Flail Ball", 36], brassGear: ["Brass Gear", 36], oilHose: ["Oil-Soaked Hose", 46], drumSkin: ["Drumskin Scrap", 40], eagleFinial: ["Gold Eagle Finial", 62],
    bronzeGreave: ["Bronze Greave", 46], obsidianMask: ["Obsidian Mask Shard", 58], wardStone: ["Carved Ward Stone", 60], harpoonHead: ["Barbed Harpoon Head", 36], brassCrank: ["Brass Crank", 38],
    windUpKey: ["Wind-Up Key", 38], strawBundle: ["Rotten Straw Bundle", 18], blackFeather: ["Black Crow Feather", 16], bladeTusk: ["Blade-Tipped Tusk", 24],
  });
  Q(D.DROPS, {
    scytheLegionary: [["scytheEdge", 0.4], ["legionCoin", 0.4]], katanaLegionary: [["lacqueredScabbard", 0.5], ["legionCoin", 0.4]], chainSickleSkirmisher: [["chainLink", 0.45]],
    warFanDancer: [["fanRib", 0.45]], gateHalberdier: [["halberdSpike", 0.45], ["legionCoin", 0.4]], bucklerFlailer: [["flailBall", 0.45]], brassArmSapper: [["brassGear", 0.45]],
    bellowsFlamer: [["oilHose", 0.4]], drumCarrier: [["drumSkin", 0.45]], aquilaBearer: [["eagleFinial", 0.7], ["legionCoin", 0.8]], phalanxHoplite: [["bronzeGreave", 0.4], ["legionCoin", 0.4]],
    maskedExecutioner: [["obsidianMask", 0.7]], wardStoneAbjurer: [["wardStone", 0.7]], harpoonMarine: [["harpoonHead", 0.45]], repeaterCrossbowman: [["brassCrank", 0.45]],
    clockworkWarHound: [["windUpKey", 0.45]], scarecrowReaver: [["strawBundle", 0.5]], scarecrowCrow: [["blackFeather", 0.5]], tuskedWarBoar: [["bladeTusk", 0.45]],
  });
  Q(D.BEST, {
    scytheLegionary: "A legionary with a black scythe over his shoulder. Every third round the blade goes up for the weakest of you, and it is slow.",
    katanaLegionary: "The uniform is right. The sword is not. Charge him and the hand on the hilt moves first.",
    chainSickleSkirmisher: "A light skirmisher with a sickle on a chain. The chain pins one of you for a turn. He has little HP; the pin lasts only as long as he does.",
    warFanDancer: "An officer who dances. The fans come up as a small shield, every other round. Hit her before she is ready.",
    gateHalberdier: "He plants the halberd and waits. A charge against him comes back on you, and his hook drags every blow his way.",
    bucklerFlailer: "Buckler up, flail round the shield. The flail leaves a mark on one of you, and everything hits that one harder. Weak alone.",
    brassArmSapper: "An engineer with one arm of brass. Every third round the piston winds up for a punch that stuns. You can hear it.",
    bellowsFlamer: "A cone of fire from a leather bellows. The oil tank on his back is his weakness: water breaks him, and the tank goes off beside his friends.",
    drumCarrier: "He beats a sun-carved drum, and the soldiers beside him hit harder and take less. He barely fights. Take him first.",
    aquilaBearer: "A veteran with the gold eagle on a pole. While he stands, his side hits harder, takes less, and mends its barriers sooner. Take him first.",
    phalanxHoplite: "A row of round shields. Each one covers the men beside it, so go for the end of the row, or hit them all at once.",
    maskedExecutioner: "A hood, an obsidian mask and an axe too big for one hand. Every fourth round he marks the weakest of you. Break him while the axe is up.",
    wardStoneAbjurer: "A priest with a ring of carved stones. He sets a ward on his friends and keeps one on himself. If you can reach him, reach him first.",
    harpoonMarine: "A sea-legion marine with a barbed harpoon on a rope. The rope pins one of you where you stand.",
    repeaterCrossbowman: "A crossbow with a crank and a magazine. His second shot is a copy of the first, so he is only as bad as his first bolt.",
    clockworkWarHound: "A wind-up dog in bronze. Two bites a round while the key is tight. By the fourth round it is slow and tired.",
    scarecrowReaver: "Straw, rust and a stolen breastplate. It stands up again while the crow lives. Kill the crow first. Fire.",
    scarecrowCrow: "A black crow on a scarecrow's shoulder. It is small, and it is the reason the scarecrow keeps getting up.",
    tuskedWarBoar: "A boar in bronze with blades on its tusks. Every third round it lowers its head and rushes one of you.",
  });
  Q(D.BREAKS, { bellowsFlamer: "Water. The oil tank bursts, and the foes standing next to him feel it." });
})();
