let main = {
  currentMap: 1, // start at map 1 no matter which game is selected,
  numMapsReady: 5 // TODO: phase this out, maybe
};

(() => {
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
    main.menu = false;
    
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
      console.log("Using mobile");
      isMobile = true;
    } else {
      console.log("Using desktop");
      isMobile = false;
    }
  }
  
  // from https://code-maven.com/ajax-request-for-json-data
  function ajax_fetch(url, callback) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        console.log('responseText:' + xmlhttp.responseText);
          try {
            var data = JSON.parse(xmlhttp.responseText);
          } catch(err) {
            console.log(err.message + " in " + xmlhttp.responseText);
            return;
          }
        callback(data);
      }
    };
 
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
  }
  
  function postFetch(data) {
    main.workingData = data;
    
    generate();
  }
  
  function generate() {
    if (main.menu) {
      main.goRandom = document.forms["startupMenu"]["isRandom"].checked;
      main.allowColors = document.forms["startupMenu"]["colorblind"].checked === false;
      main.advancedColors = document.forms["startupMenu"]["advancedColors"].checked;
      main.separateAreas = document.forms["startupMenu"]["separateAreas"].checked;
      
      main.mode = modes[0]; // TODO: make this an option
      
      let menuPointer = document.getElementById("mainMenu");
      if (menuPointer.classList) { // browser compatibility logic
        menuPointer.classList.remove("show-menu");
      } else {
        menuPointer.className += menuPointer.className.replace(/\bshow-menu\b/g);
      }
      
      let pointers = ["hud", "playground", "mainground", "background", "potatoes"];
      for (const pointer of pointers) {
        let target = document.getElementById(pointer);
        if (target.classList) { // browser compatibility logic
          target.classList.remove("hide-menu");
        } else {
          target.className += target.className.replace(/\bhide-menu\b/g);
        }
      }
      
      setup.makeTree(); // construct data tree
      // at this point, the data tree should be complete, with vine data on the side. No visuals have been processed yet.
      checklist.build(); // setup checklist
      cursor.move(0, 0); // a behind-the-scenes pointer set to the origin point of the chart (where the START node is)
      interaction.popMap(main.currentMap); // display map 1
    
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
      
      if (main.getIsMobile()) {
        window.onorientationchange = (e) => {
          main.resizeCanvas();
        };
      }

      main.resizeCanvas();
    }
  }
  
  function validateStartup(e) {
    e.preventDefault();
    if (!main.menu) {
      let gameInput = document.forms["startupMenu"]["selectedGame"].value;
      
      if (gameInput === "") {
        let error = document.getElementsByClassName("gameError")[0];
        
        if (error.classList) { // browser compatibility logic
          error.classList.remove("hide-error");
        } else {
          error.className += error.className.replace(/\bhide-error\b/g);
        }
        
        return;
      }
      
      main.menu = true;
      main.currentGame = games[document.forms["startupMenu"]["selectedGame"].value];
      ajax_fetch('https://raw.githubusercontent.com/mileswest07/tracker/json-attempt/js/' + main.currentGame + '/data.json', postFetch);
    }
  }
  
  // resize background grid to fit the browser window
  function resizeCanvas() {
    // don't adjust background canvas if we don't yet have the data needed
    if (!main.menu) {
      return;
    }
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
    for (let i = 0; i < main.numMapsReady; i++) {
      main.currentMap = i + 1;
      interaction.navigateTree(debugRecursion);
    }
    main.currentMap = saveMap;
    console.log("maps for", main.numMapsReady, "/", setup.mapRoots.length, "areas ready");
  }
  
  function getIsMobile() {
    return isMobile === true;
  }
  
  function getIsDesktop() {
    return isMobile === false;
  }
  
  main.debugTree = debugTree;
  main.init = init;
  main.validateStartup = validateStartup;
  main.resizeCanvas = resizeCanvas;
  main.getIsMobile = getIsMobile;
  main.getIsDesktop = getIsDesktop;
})();