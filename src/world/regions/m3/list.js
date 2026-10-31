// Region list for milestone M3 (owner: WORLD-M3). One region file name per region in the array; the files live next to this list.
// _util.js (prop helpers) must come first. art-review/m3w/ground.js loads every *.js here except list.js. Files are added to the list as they are finished.
(function () {
  var base = document.currentScript.src.replace(/list\.js.*$/, "");
  ["_util.js", "ashenOrun.js", "orunMemoryRoom.js", "undervaults.js", "coldVaults.js", "ashenCanyon.js", "haldarsReach.js", "brassHarbour.js", "kharamRoad.js", "kharamOasis.js", "drownedFenShrine.js", "giantQuarry.js", "sunbirdRoost.js", "weepingSea.js", "gullrest.js", "maelstromCaves.js", "cinderCrownIsle.js", "cinderwatch.js", "cinderCrownCrater.js", "mournsGate.js", "hollowsOfMourn.js", "tzavan.js", "tzavanBarracks.js"].forEach(function (f) { document.write('<script src="' + base + f + '"><\/script>'); });
})();
