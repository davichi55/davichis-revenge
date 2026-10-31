// Region list for milestone M4 (owner: WORLD-M4). Put one region file name per region in the array; the files live next to this list.
(function () {
  var base = document.currentScript.src.replace(/list\.js.*$/, "");
  ["lowstep.js", "ahuacanSewers.js", "palaceCourt.js", "palaceGarden.js", "palaceEastWing.js", "palaceRoofs.js", "paleGate.js", "tzavanCoast.js", "saltFlats.js", "redSaltWeir.js", "redSaltMines.js", "orchardHills.js", "tukOrchard.js", "sunmawPyramid.js", "governorsVilla.js", "veiledCistern.js", "ashfeatherCamp.js", "rootdeepApproach.js", "blackMirrorPrison.js", "prisonCellNine.js", "hollowNest.js", "rootdeep.js"].forEach(function (f) { document.write('<script src="' + base + f + '"><\/script>'); });
})();
