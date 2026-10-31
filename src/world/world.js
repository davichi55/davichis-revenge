// One script tag loads the whole world engine: <script src="src/world/world.js"></script> (after Phaser). Region files are listed here.
(function () {
  var base = (function () { var s = document.currentScript; return s ? s.src.replace(/world\.js.*$/, "") : "src/world/"; })();
  ["helpers.js", "engine.js", "regions/orun.js", "regions/undercroft.js", "regions/dunes.js", "regions/sandpiper.js", "regions/cistern.js", "regions/basin.js", "regions/amberwells.js",
    "regions/quarry.js", "regions/flats.js", "regions/bonemaze.js", "regions/saltgate.js", "regions/hollow.js", "regions/m2/list.js", "regions/m1x/list.js", "regions/m3/list.js", "regions/m4/list.js", "regions/m5/list.js"].forEach(function (f) { document.write('<script src="' + base + f + '"><\/script>'); });
})();
