// Region list for CH1-EXPAND (chapter 1 and 2 extra maps). Loaded from world.js after the M2 list (uses World.kitM2).
(function () {
  var base = document.currentScript.src.replace(/list\.js.*$/, "");
  ["glassRidges.js", "hummingHollow.js", "caravanGraveyard.js", "dryWaystation.js", "oasisOutskirts.js", "redMesaSteps.js", "saltpanWorks.js"].forEach(function (f) { document.write('<script src="' + base + f + '"><\/script>'); });
})();
