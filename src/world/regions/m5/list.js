// Region list for milestone M5 (owner: WORLD-M5). Put one region file name per region in the array; the files live next to this list.
(function () {
  var base = document.currentScript.src.replace(/list\.js.*$/, "");
  ["common.js", "warfront.js", "camp.js", "trenches.js", "sanctum.js", "crypts.js", "observatory.js", "spine.js", "prism.js", "bastion.js", "stair.js", "gates.js", "descent.js", "emperorhall.js", "eater.js", "roof.js", "starhaven.js", "starfall.js", "crater.js", "drowned.js", "deep.js"].forEach(function (f) { document.write('<script src="' + base + f + '"><\/script>'); });
})();
