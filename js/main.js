let main = {
  currentMap: 1, // start at map 1 no matter which game is selected
};

(function() {
  let numMapsReady = 5; // TODO: phase this out
  let isMobile = false;
  
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
    main.allowColors = true; // TODO: colorblind option
    main.advancedColors = false; // TODO: select whether tons of colors, or some white/black is allowed
    main.workingData = rawData; // TODO: make it game-dependent
    main.separateAreas = true; // TODO: make it an option
    setup.makeTree(); // construct data tree
    // at this point, the data tree should be complete, with vine data on the side. No visuals have been processed yet.
    cursor.move(0, 0); // a behind-the-scenes pointer set to the origin point of the chart (where the START node is)
    interaction.popMap(main.currentMap); // display map 1
    
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
      console.log("Using mobile");
      isMobile = true;
    } else {
      console.log("Using desktop");
      isMobile = false;
    }
    
    document.getElementById("mainground").onwheel = (e) => {
      e.preventDefault();
      //console.log("did wheel", e);
      interaction.zoom(e);
    };
    
    document.getElementById("mainground").onmousedown = (e) => {
      e.preventDefault();
      //console.log("did click start", e);
      interaction.panStart(e);
    };
    
    document.getElementById("mainground").onmousemove = (e) => {
      e.preventDefault();
      if (interaction.readyPan) {
        interaction.panDuring(e);
      }
    };
    
    document.getElementById("mainground").onmouseup = (e) => {
      e.preventDefault();
      //console.log("did click end", e);
      interaction.panEnd(e);
    };

    main.resizeCanvas();
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

    if (main.allowColors) {
      let context = canvas.getContext("2d");
      let gridImage = document.getElementById("grid_" + main.currentGame);
      let pattern = context.createPattern(gridImage, "repeat");
      context.rect(0, 0, window.innerWidth, window.innerHeight);
      context.fillStyle = pattern;
      context.fill();
    }
  };

  function debugRecursion(node) {
    console.log("" + areaData[setup.mapRoots[node.mapId - 1].mapId].name + " #" + node.id + ": " + pickupType[node.pickupType] + " - " + node.textFill + " - " + node.textOuter);
  }
  
  function debugTree() {
    console.log("vine cluster:: total", setup.mapVines);
    console.log("close relatives:: total", setup.mapRelatives);
    let saveMap = main.currentMap;
    for (let i = 0; i < numMapsReady; i++) {
      main.currentMap = i + 1;
      interaction.navigateTree(debugRecursion);
    }
    main.currentMap = saveMap;
    console.log("maps for", numMapsReady, "/", setup.mapRoots.length, "areas ready");
  }
  
  function getIsMobile() {
    return isMobile === true;
  }
  
  function getIsDesktop() {
    return isMobile === false;
  }
  
  main.debugTree = debugTree;
  main.init = init;
  main.resizeCanvas = resizeCanvas;
  main.getIsMobile = getIsMobile;
  main.getIsDesktop = getIsDesktop;
})();