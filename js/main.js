let main = {
  currentMap: 1, // start at map 1 no matter which game is selected
};

(function() {
  let numMapsReady = 5; // TODO: phase this out
  
  const games = {
    "d": "mrd",
    "m": "m1",
    "z": "mzm",
    "p": "mp",
    "b": "pb",
    "e": "mp2e",
    "h": "ph",
    "c": "mp3c",
    "2": "m2ros",
    "a": "am2r",
    "r": "msr",
    "s": "sm",
    "o": "mom",
    "f": "mf"
  };

  function init() {
    main.currentGame = games.m; // TODO: swap games when HUD is made
    main.goRandom = false; // TODO: select whether vanilla or randomized
    main.allowColors = true; // TODO; colorblind option
    main.workingData = rawData; // TODO: make it game-dependent
    setup.makeTree(); // construct data tree
    // at this point, the data tree should be complete, with vine data on the side. No visuals have been processed yet.
    cursor.move(0, 0); // a behind-the-scenes pointer set to the origin point of the chart (where the START node is)
    interaction.popMap(main.currentMap); // display map 1
  }
  
  // resize background grid to fit the browser window
  function resizeCanvas() {
    let canvas = document.getElementById("background");
    if (canvas.width !== window.innerWidth){ // only change the dimension that changes
      canvas.width = window.innerWidth;
    }

    if (canvas.height !== window.innerHeight){ // only change the dimension that changes
      canvas.height = window.innerHeight;
    }

    let context = canvas.getContext("2d");
    let gridImage = document.getElementById("grid_" + main.currentGame);
    let pattern = context.createPattern(gridImage, "repeat");
    context.rect(0, 0, window.innerWidth, window.innerHeight);
    context.fillStyle = pattern;
    context.fill();
  };

  function debugRecursion(node) {
    console.log("" + areaData[setup.mapRoots[node.mapId - 1].mapId].name + " #" + node.id + ": " + pickupType[node.pickupType] + " - " + node.textFill + " - " + node.textOuter);
  }
  
  function debugTree() {
    console.log("vine cluster:: total", setup.mapVines);
    let saveMap = main.currentMap;
    for (let i = 0; i < numMapsReady; i++) {
      main.currentMap = i + 1;
      interaction.navigateTree(debugRecursion);
    }
    main.currentMap = saveMap;
    console.log("maps for", numMapsReady, "/", setup.mapRoots.length, "areas ready");
  }
  
  main.debugTree = debugTree;
  main.init = init;
  main.resizeCanvas = resizeCanvas;
})();