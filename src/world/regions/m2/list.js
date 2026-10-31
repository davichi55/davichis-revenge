// Region list for milestone M2 (owner: WORLD-M2). Put one region file name per region in the array; the files live next to this list. kit.js (shape and prop helpers) must stay first.
(function () {
  var base = document.currentScript.src.replace(/list\.js.*$/, "");
  ["kit.js", "creepingShore.js", "tamarsLanding.js", "siltRiver.js", "siltRiverHollow.js", "ninefoldFerry.js", "greenmawJungle.js", "redrootCamp.js", "fortOcelan.js", "coilHillPyramid.js", "boilingPools.js", "featherfallCanopy.js", "plumeRest.js", "sporerootCaves.js", "windhollowAviary.js", "lookoutChain.js", "canopySpire.js", "marigoldHollow.js", "imelasHouse.js", "imelasCellar.js", "waterfallCave.js"].forEach(function (f) { document.write('<script src="' + base + f + '"><\/script>'); });
})();
