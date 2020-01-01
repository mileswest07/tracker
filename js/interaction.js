let interaction = {
  readyPan: false,
  prev: {
    x: 0,
    y: 0
  },
  max: {
    x: 432,
    y: 432
  },
  min: {
    x: 0,
    y: 0
  }
};

(function() {
  let digitPattern = /\d+/g;
  let numGradsAlready = 0;
  
  // hide map panel
  function hideMap(mapId) {
    let mapSearch = document.getElementById("mapSVG-" + mapId);
    if (mapSearch !== null) { // so long as the map panel exists (has been created)
      // hide current map
      if (mapSearch.classList) { // browser compatibility logic
        mapSearch.classList.add("hide-map");
      } else {
        let arr = mapSearch.className.split(" ");
        if (arr.indexOf("hide-map") === -1) {
          mapSearch.className += " hide-map";
        }
      }
    }
  }
  
  // show map panel
  function showMap(mapId) {
    let mapSearch = document.getElementById("mapSVG-" + mapId);
    if (mapSearch !== null) { // so long as the map panel exists (has been created)
      // show current map
      if (mapSearch.classList) { // browser compatibility logic
        mapSearch.classList.remove("hide-map");
      } else {
        mapSearch.className += mapSearch.className.replace(/\bhide-map\b/g);
      }
    }
  }
  
  function doNothing() {
    //console.log("nothing doing");
  }

  function removeHover(e) {
    //console.log("hover ended!");
    
    for (child of e.target.childNodes) {
      if (child.classList.contains("node-hover-overlay")) {
        child.classList.remove("show");
      }
    }
  }

  function hoverRoot(e) {
    //console.log("root was hovered!");
    
    for (child of e.target.childNodes) {
      if (child.classList.contains("node-hover-overlay")) {
        child.classList.add("show");
      }
    }
  }

  function hoverElevator(e) {
    //console.log("elevator was hovered!");
    
    for (child of e.target.childNodes) {
      if (child.classList.contains("node-hover-overlay")) {
        child.classList.add("show");
      }
    }
  }

  function hoverBoss(e) {
    //console.log("boss was hovered!");
    
    for (child of e.target.childNodes) {
      if (child.classList.contains("node-hover-overlay")) {
        child.classList.add("show");
      }
    }
  }

  function hoverLock(e) {
    //console.log("lock was hovered!");
    
    for (child of e.target.childNodes) {
      if (child.classList.contains("node-hover-overlay")) {
        child.classList.add("show");
      }
    }
  }

  function hoverKey(e) {
    //console.log("Key was hovered!");
    
    for (child of e.target.childNodes) {
      if (child.classList.contains("node-hover-overlay")) {
        child.classList.add("show");
      }
    }
  }

  function hoverSave(e) {
    //console.log("Save was hovered!");
    
    for (child of e.target.childNodes) {
      if (child.classList.contains("node-hover-overlay")) {
        child.classList.add("show");
      }
    }
  }

  function hoverUnreq(e) {
    //console.log("Unreq was hovered!");
    
    for (child of e.target.childNodes) {
      if (child.classList.contains("node-hover-overlay")) {
        child.classList.add("show");
      }
    }
  }

  function hoverOther(e) {
    //console.log("Other was hovered!");
    
    for (child of e.target.childNodes) {
      if (child.classList.contains("node-hover-overlay")) {
        child.classList.add("show");
      }
    }
  }
  
  function displayMenu() {
    
  }
  
  function hideMenu() {
    
  }
  
  function hoverBasic(e) {
    for (child of e.target.childNodes) {
      if (child.classList.contains("node-hover-overlay")) {
        child.classList.add("show");
      }
    }
  }
  
  // move cursor to this location
  function centerCursorOnElement(elementId) {
    let coords = getCurrentCoordsOfNodeById(elementId);
    cursor.move(((coords[0] / 144) - 1), ((coords[1] / 144) - 1));
  }

  function expandViewbox() {
    let mapSearch = document.getElementById("mapSVG-" + main.currentMap); // for whatever the currently-displayed map
    let str = mapSearch.attributes.viewBox.value;
    let result = str.match(digitPattern);
    let newStr = [];
    newStr.push(result[0]);
    newStr.push(result[1]);
    if (parseInt(result[2]) < (cursor.get().x + 144)) { // if currently at the edge of the map
      newStr.push(cursor.get().x + 144 + 72); // if needed, expand with a margin
      interaction.max.x = newStr[2];
    } else {
      newStr.push(result[2]);
    }
    if (parseInt(result[3]) < (cursor.get().y + 144)) { // if currently at the edge of the map
      newStr.push(cursor.get().y + 144 + 72); // if needed, expand with a margin
      interaction.max.y = newStr[3];
    } else {
      newStr.push(result[3]);
    }
    
    mapSearch.setAttribute("viewBox", newStr.join(' '));
  }
  
  function getCurrentMapElement(childCategory) {
    let returnValue = null;
    let mapSearch = document.getElementById("mapSVG-" + main.currentMap);
    if (mapSearch !== null) {
      let index = -1;
      switch (childCategory) {
        case "defs":
          index = 0;
          break;
        case "gridPaths":
          index = 1;
          break;
        case "junctions":
          index = 2;
          break;
        case "mainMeat":
          index = 3;
          break;
      }
      if (index !== -1) {
        returnValue = mapSearch.children[index];
      }
    }
    return returnValue;
  }
  
  function findElementOfLayerAtCoords(layer, x, y) {
    let returnValue = [];
    
    let childCollection = null;
    let parentElement = null;
    
    switch(layer) {
      case "grid":
        parentElement = getCurrentMapElement("gridPaths");
        break;
      case "junction":
        parentElement = getCurrentMapElement("junctions");
        break;
      case "node":
      default:
        parentElement = getCurrentMapElement("mainMeat");
    }
    childCollection = parentElement.children;
    
    for (child of childCollection) {
      let str = child.attributes.transform.value;
      let result = str.match(digitPattern);
      
      if (parseInt(result[0]) === x && parseInt(result[1]) === y) {
        returnValue.push(child);
      }
    }
    
    return returnValue;
  }
  
  function insertPathLine(dir, x, y) {
    let templateName = "";
    switch(dir) {
      case "l":
      case "left":
      case "w":
      case "west":
        templateName = "grid_line_h_left_template";
        break;
      case "r":
      case "right":
      case "e":
      case "east":
        templateName = "grid_line_h_right_template";
        break;
      case "u":
      case "up":
      case "n":
      case "north":
        templateName = "grid_line_v_up_template";
        break;
      case "d":
      case "down":
      case "s":
      case "south":
        templateName = "grid_line_v_down_template";
        break;
    }
    let original = document.getElementById(templateName);
    let copy = original.cloneNode(true);
    copy.removeAttribute("id");
    if (x && y) {
      copy.setAttribute("transform", "translate(" + x + " " + y + ")");
    } else {
      copy.setAttribute("transform", "translate(" + cursor.get().x + " " + cursor.get().y + ")");
    }
    if (main.allowColors && main.advancedColors && main.separateAreas) {
      copy.children[0].setAttribute("fill", "#" + areaData[setup.mapRoots[main.currentMap - 1].mapId].color);
    } else {
      copy.children[0].setAttribute("fill", "#ffffff");
    }
    
    getCurrentMapElement("gridPaths").appendChild(copy);
    
    // retrieve currently-just-added element
    let thisLine;
    if (x && y) {
      thisLine = findElementOfLayerAtCoords("grid", x, y);
    } else {
      thisLine = findElementOfLayerAtCoords("grid", cursor.get().x, cursor.get().y);
    }
    return thisLine[thisLine.length - 1];
  }
  
  function makeLineInDirection(direction) {
    let firstDirection = direction;
    let secondDirection;
    let xUnit = 0;
    let yUnit = 0;
    
    switch (direction) {
      case "d":
      case "down":
      case "s":
      case "south":
        secondDirection = "u";
        xUnit = 0;
        yUnit = 1;
        break;
      case "u":
      case "up":
      case "n":
      case "north":
        secondDirection = "d";
        xUnit = 0;
        yUnit = -1;
        break;
      case "r":
      case "right":
      case "e":
      case "east":
        secondDirection = "l";
        xUnit = 1;
        yUnit = 0;
        break;
      case "l":
      case "left":
      case "w":
      case "west":
        secondDirection = "r";
        xUnit = -1;
        yUnit = 0;
        break;
      default:
        break;
    }
    
    insertPathLine(firstDirection);
    cursor.shift(xUnit, yUnit);
    insertPathLine(secondDirection);
  }
  
  function makeLineInDirectionByUnits(direction, units) {
    for (let i = 0; i < units; i++) {
      makeLineInDirection(direction);
    }
  }
  
  function insertJunctionDot(x, y) {
    let shapeObject = junction_template.cloneNode(true);
    shapeObject.removeAttribute("id"); // strip away Id to prevent DOM problems
    if (x && y) { // remote drop
      shapeObject.setAttribute("transform", "translate(" + x + " " + y + ")");
    } else { // drop "here"
      shapeObject.setAttribute("transform", "translate(" + cursor.get().x + " " + cursor.get().y + ")");
    }
    // color fill, factoring in colorblind mode
    if (main.allowColors && main.advancedColors && main.separateAreas) {
      shapeObject.setAttribute("fill", "#" + areaData[setup.mapRoots[main.currentMap - 1].mapId].color); // color fill
    } else {
      shapeObject.setAttribute("fill", "#ffffff");
    }
    
    getCurrentMapElement("junctions").appendChild(shapeObject); // drop into the correct layer
    
    // retrieve currently-just-added element
    //return document.getElement();
  }

  function getCurrentCoordsOfNode(nodeObj) {
    let returnValues = [];
    let str = nodeObj.attributes.transform.value; // obtain the positioning digits from the node
    let result = str.match(digitPattern);
    returnValues.push(parseInt(result[0])); // x
    returnValues.push(parseInt(result[1])); // y
    
    return returnValues; // returning as array
  }

  function getCurrentCoordsOfNodeById(elementId) {
    let nodeObj = document.getElementById(elementId);
    return getCurrentCoordsOfNode(nodeObj);
  }
  
  function createCousinVine(elementId, destinationRaw) {
    let destinationId = "mapSVG-" + main.currentMap;
    
    switch (nodeType[destinationRaw.type]) {
      case "start":
      case "elevator":
      case "boss":
      case "another":
        destinationId += "_goal" + destinationRaw.id;
        break;
      case "end":
        destinationId += "_end" + destinationRaw.id;
        break;
      case "lock":
        destinationId += "_lock" + destinationRaw.id;
        break;
      case "key":
        destinationId += "_key" + destinationRaw.id;
        break;
      case "unknown":
        destinationId += "_unclaimed-lock" + destinationRaw.id;
        break;
      case "empty":
        destinationId += "_unclaimed-key" + destinationRaw.id;
        break;
      case "slot":
        destinationId += "_slot" + destinationRaw.id;
        break;
      case "access":
        destinationId += "_access" + destinationRaw.id;
        break;
      case "save": 
      case "unreq": 
      case "other": 
        destinationId += "_unreq" + destinationRaw.id;
        break;
      case "oneway": 
        destinationId += "_oneway" + destinationRaw.id;
        break;
    }
    let dest = document.getElementById(destinationId);
    
    if (dest === null) {
      // icon is not on the field yet (hidden behind inactive lock)
      return;
    }
    
    // get tween height
    let source = document.getElementById(elementId);
    
    let str = source.attributes.transform.value;
    let result = str.match(digitPattern);
    let sourceCoords = [];
    sourceCoords.push(parseInt(result[0]));
    sourceCoords.push(parseInt(result[1]));
    str = dest.attributes.transform.value;
    result = str.match(digitPattern);
    let destCoords = [];
    destCoords.push(parseInt(result[0]));
    destCoords.push(parseInt(result[1]));
    let earlier = null;
    let earlierCoords = [];
    let later = null;
    let laterCoords = [];
    let flipped = false;
    
    if (sourceCoords[0] > destCoords[0]) {
      earlier = dest;
      earlierCoords = destCoords;
      later = source;
      laterCoords = sourceCoords;
      flipped = true;
    } else {
      earlier = source;
      earlierCoords = sourceCoords;
      later = dest;
      laterCoords = destCoords;
    }
    
    let maxHeight = sourceCoords[1] > destCoords[1] ? sourceCoords[1] : destCoords[1];
    maxHeight += 144; // add one more space in order to clear the last row in each column
    
    // calculate drop distance for source node
    let sourceHeight = maxHeight - sourceCoords[1];
    let sourceDrop = sourceHeight / 144;
    // calculate drop distance for destination node
    let destHeight = maxHeight - destCoords[1];
    let destDrop = destHeight / 144;
    // calculate lateral distance between source and destination
    let diff = laterCoords[0] - earlierCoords[0];
    let diffRun = diff / 144;
    
    // TODO: drop all children between source and destination the appropriate height
    
    // and now make the graphics
    
    centerCursorOnElement(elementId);
    makeLineInDirectionByUnits("d", sourceDrop);
    insertJunctionDot();
    centerCursorOnElement(destinationId);
    makeLineInDirectionByUnits("d", destDrop);
    insertJunctionDot();
    makeLineInDirectionByUnits(flipped ? "r" : "l", diffRun);
    
    // reset cursor to original position
    centerCursorOnElement(elementId);
  }
  

  function recursionB(currentNode, predicate) {
    predicate(currentNode);
    for (child of currentNode.children) {
      recursionB(child, predicate);
    }
  }

  function navigateTree(predicate) {
    let currentRoot = setup.mapRoots[main.currentMap - 1];
    recursionB(currentRoot, predicate);
  }

  function findNodeByProp(property, value) {
    let returnNode = null;
    
    navigateTree(currentNode => {
      if (currentNode[property] === value) {
        returnNode = currentNode;
      }
    });
    
    return returnNode;
  }
  
  function findNodeById(value) {
    return findNodeByProp("id", value);
  }
  
  // check to see if node is a potential ancestor to another node
  function isAncestorTo(nodeIdA, nodeIdB) {
    let returnValue = false;
    let currentNode = findNodeById(nodeIdB);
    if (currentNode === null) { // if we can't find the second node, like it hasn't been made yet, then call it a failure
      return false;
    }
    while (currentNode.id !== -1) {
      if (nodeIdA === currentNode.id) {
        returnValue = true;
        break;
      }
      if (!currentNode.parents) {
        // assume currentNode is the map root
        // can't go further up
        break;
      }
      currentNode = currentNode.parents[0];
      //TODO: how to account for branching ancestors?
    }
    
    return returnValue;
  }
  
  // now let's make some vines in graphic form
  function attemptVines(elementId, node) {
    let returnValue = false;
    for (let i = 0; setup.mapVines && i < setup.mapVines.length; i++) { // let's go through every vine cluster in the databank to see if we need to make one right now
      let clusterDests = [];
      if (setup.mapVines[i].includes(node.id)) { // if a vine cluster involves this node
        clusterDests = setup.mapVines[i].filter(n => n !== node.id); // then let's hold onto the nodes that this vine is supposed to connect to
      }
      
      if (clusterDests.length === 0) {
        // bad data capture
        continue;
      }
      
      for (dest of clusterDests) {
        //TODO: refactor to take all vine ends into account
        
        let destinationRaw = findNodeById(dest);
        if (destinationRaw === null || destinationRaw.type === 0) { // if the node doesn't exist yet, ignore it
          continue;
        }
        
        if (isAncestorTo(destinationRaw.id, node.id)) {
          //console.log("attempting to vine with ancestor!");
          //TODO: make room for the new connection
        } else {
          //console.log("attempting to vine with cousin!");
          // continue with this one
          createCousinVine(elementId, destinationRaw);
          returnValue = true;
        }
      }
    }
    return returnValue;
  }
  
  // move shape to absolute position
  function moveNode(elementId, x, y) {
    let nodeObj = document.getElementById(elementId);
    nodeObj.setAttribute("transform", "translate(" + ((x + 1) * 144) + " " + ((y + 1) * 144) + ")");
  }

  // move shape to relative position
  function shiftNode(elementId, dx, dy) {
    let nodeObj = document.getElementById(elementId);
    let coords = getCurrentCoordsOfNodeById(elementId);
    nodeObj.setAttribute("transform", "translate(" + (coords[0] + (dx * 144)) + " " + (coords[1] + (dy * 144)) + ")");
  }

  // create children nodes and paths related to a node
  function animateChildren(elementId, node, accumulator) {
    centerCursorOnElement(elementId);
    expandViewbox();
    
    // accumulator keeps track of the width of columns to report, so that the parent can scoot its siblings enough to the right to make space for all of its descendants
    if (node.children.length === 0) {
      accumulator.val = 1; // no children = width of itself, which is 1
    }
    
    let toDoVines = false;
    for (let i = 0; setup.mapVines && i < setup.mapVines.length; i++) {
      if (setup.mapVines[i].includes(node.id)) { // if a vine cluster involves this node
        toDoVines = true;
        if (node.children.length === 1) {
          makeLineInDirectionByUnits("d", 1);
        }
      }
    }
    
    if (node.children.length === 0) {
      return; // and because there's no children, we don't need to factor in anything else with paths
    }
    if ((node.parentId === -1 && main.separateAreas) || node.id === setup.root.id) { // the map root needs to branch right first before displaying its children
      makeLineInDirectionByUnits("r", 1);
    } else { // everything else branches down
      makeLineInDirectionByUnits("d", 1);
    }
    
    let pseudolength = node.children.length;
    let pseudochildren = node.children;
    
    accumulator.val = pseudolength; // if a node has multiple children, the parents need to know
    
    let prevAccumulator = { // to pass by reference, this needs to be an object!
      val : accumulator.val // so get ready to pass this value up to its ancestors
    };
    
    for (let i = 0; i < pseudolength; i++) { // for each child, going down each generation for the firstborn before moving to the secondborn
      let child = pseudochildren[i];
      let vineWidth = 0;
      
      if (!main.separateAreas && nodeType[child.type] === "elevator") {
        let newChild = setup.mapRoots.find((item) => {
          return item.id === child.pointsToElevatorId;
        });
        
        for (let j = 0; j < newChild.children.length; j++) {
          pseudochildren.splice(i + j + 1, 0, newChild.children[j]);
          pseudolength++;
          accumulator.val++;
        }
        pseudochildren.splice(i, 1);
        pseudolength--;
        accumulator.val--;
        child = pseudochildren[i];
      }
      
      if (pseudolength > 1) { // when a parent has multiple children, we need to prepare horizontal lines and junction dots to make space for the children nodes
        if (i > 0) { // before making any of its siblings, we're going to need to move some columns over, and make the appropriate line
          // get width of previous' children
          
          let revisedWidth = prevAccumulator.val;
          for (let j = 0; j < setup.mapRelatives.length; j++) {
            let nextIndex = 0;
            if (setup.mapRelatives[j].indexOf(child.id) !== -1) {
              nextIndex = setup.mapRelatives[j].indexOf(child.id);
              if (setup.mapRelatives[j].indexOf(pseudochildren[i - 1].id) === nextIndex - 1) {
                if (prevAccumulator.val > 1) {
                  vineWidth = prevAccumulator.val - 1;
                  accumulator.val--;
                }
                revisedWidth = 1;
              }
              break;
            }
          }
          
          
          makeLineInDirectionByUnits("r", revisedWidth); // each descendant needs to report in to the ancestor, so they know how many spaces to move to the right
        }
        insertJunctionDot(); // now that we're in the destination column, place the junction dot
        makeLineInDirectionByUnits("d", 1);
        // TODO: do the proper method for dropping keys and locks, based on Mark's graphics, but only in dependency or condensed modes
      } else if (node.parentId === -1 && main.separateAreas) { // should a map begin with only one child, let's still include a junction dot
        insertJunctionDot();
        makeLineInDirectionByUnits("d", 1);
      } // otherwise, don't include a junction dot
      let newNode = makeNode(child); // now time to make the node for this child
      
      // and now that this node has been created, we need to deal with its descendants
      // recursion
      if (main.mode === modes[0] || (child.type !== 5 && child.type !== 12) || child.isUnlocked) { // only once this lock type has been unlocked
        let nChildren = { // now create accumulator for descendants
          val: 1 // needs to pass by reference, not value, otherwise there is no point
        };
        animateChildren(newNode.id, child, nChildren); // recursive method
        let vinesDone = attemptVines(newNode.id, child); // now that that is done for all descendants, let's try creating vines
        // replace previous accumulator with the currently-updated one (from this node's descendants) to pass on to the sibling
        if (nChildren.val > vineWidth) {
          prevAccumulator.val = nChildren.val;
        } else {
          prevAccumulator.val = vineWidth;
        }
        accumulator.val += nChildren.val - 1; // add the extra columns before returning to ancestor
      } else if (main.mode === modes[1]) {
        prevAccumulator.val = 1;
      }
      
      cursor.shift(0, -1); // and now that that's all finally done, step up one row
      if (pseudolength === 1) { // or two, if this is the only child
        cursor.shift(0, -1);
      }
      // before moving to the sibling of this node
    }
    
    centerCursorOnElement(elementId); // once all is said and done, return cursor to this node. This will allow all future branching and treemaking to use this node as the "root"
  }
  
  // create children nodes and paths related to a node
  function expandChildren(elementId, node, accumulator) {
    centerCursorOnElement(elementId);
    expandViewbox();
    
    // accumulator keeps track of the width of columns to report, so that the parent can scoot its siblings enough to the right to make space for all of its descendants
    if (node.children.length === 0) {
      accumulator.val = 1; // no children = width of itself, which is 1
    }
    // first check to see if vines are to be made
    // is this node part of a vine?
    let toDoVines = false;
    for (let i = 0; setup.mapVines && i < setup.mapVines.length; i++) {
      let clusterDests = [];
      if (setup.mapVines[i].includes(node.id)) { // if a vine cluster involves this node
        toDoVines = true; // if we capture the node by ID, then let's hold that flag
        clusterDests = setup.mapVines[i].filter(n => n !== node.id); // then let's hold onto the nodes that this vine is supposed to connect to
        makeLineInDirectionByUnits("d", 1);
        insertJunctionDot();
      }
      
      if (clusterDests.length === 0) {
        // bad data capture
        continue;
      }
      
      for (dest of clusterDests) {
        //TODO: refactor to take all vine ends into account
        
        let destinationRaw = findNodeById(dest);
        if (destinationRaw === null || destinationRaw.type === 0) { // if the node doesn't exist yet, ignore it
          continue;
        }
        
        if (isAncestorTo(destinationRaw.id, node.id)) {
          //console.log("attempting to vine with ancestor!");
          //TODO: make room for the new connection
        } else {
          //console.log("attempting to vine with cousin!");
          // continue with this one
          
          // Now that we know whether this vine is being touched, we need to
          // 1. move each related child down
          // 2. move this column closer together
          
        }
      }
    }
    
    // if there's no children, we don't need to factor in anything else with paths after vines are done
    if (node.children.length === 0) {
      return; 
    }
    
    if (node.parentId === -1) { // the map root needs to branch right first before displaying its children
      makeLineInDirectionByUnits("r", 1);
    } else { // everything else branches down
      makeLineInDirectionByUnits("d", 1);
    }
    
    for (let i = 0; i < node.children.length; i++) { // for each child, going down each generation for the firstborn before moving to the secondborn
      let child = node.children[i];
      
      if (node.children.length > 1) { // when a parent has multiple children, we need to prepare horizontal lines and junction dots to make space for the children nodes
        if (i > 0) { // before making any of its siblings, we're going to need to move some columns over, and make the appropriate line
          // get width of previous' children
          makeLineInDirectionByUnits("r", prevAccumulator.val); // each descendant needs to report in to the ancestor, so they know how many spaces to move to the right
        }
        insertJunctionDot(); // now that we're in the destination column, place the junction dot
        makeLineInDirectionByUnits("d", 1);
        // TODO: do the proper method for dropping keys and locks, based on Mark's graphics, but only in dependency or condensed modes
        
      } else if (node.parentId === -1) { // should a map begin with only one child, let's still include a junction dot
        insertJunctionDot();
        makeLineInDirectionByUnits("d", 1);
      } // otherwise, don't include a junction dot
      let newNode = makeNode(child); // now time to make the node for this child
      
      cursor.shift(0, -1); // and now that that's all finally done, step up one row
    }
  }
  
  // display map based on input parameter
  // NOW we're working with visuals!
  function popMap(mapId) {
    let mapSource = document.getElementById("mainground"); // main display for where the current map is to be shown
    let mapSearch = document.getElementById("mapSVG-" + mapId); // grab the correct map panel
    hideMap(main.currentMap); // hide current map while we work behind the scenes
    main.currentMap = mapId; // set current map to the new map panel
    if (mapSearch === null) { // if the map hasn't been made, then let's make it
      // TODO: this could all be done more cleanly...
      mapSearch = document.createElementNS("http://www.w3.org/2000/svg", "svg"); // create SVG container
      mapSearch.setAttribute("id", "mapSVG-" + mapId);
      mapSearch.setAttribute("class", "map-svg");
      mapSearch.setAttribute("width", "100%");
      // mapSearch.setAttribute("width", "60%"); //TODO: once we begin with the HUD upgrade
      mapSearch.setAttribute("height", "100%");
      // mapSearch.setAttribute("height", "60%"); //TODO: once we begin with the HUD upgrade
      mapSearch.setAttribute("viewBox", "0 0 432 432"); // 3 x 3 map for a default size
      mapSearch.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      mapSearch.setAttributeNS("http://www.w3.org/2000/svg", "xlink", "http://www.w3.org/1999/xlink");
      
      let defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      let gridPaths = document.createElementNS("http://www.w3.org/2000/svg", "g");
      gridPaths.setAttribute("class", "gridPaths");
      let junctions = document.createElementNS("http://www.w3.org/2000/svg", "g");
      junctions.setAttribute("class", "junctions");
      let mainMeat = document.createElementNS("http://www.w3.org/2000/svg", "g");
      mainMeat.setAttribute("class", "mainMeat");
      
      mapSearch.appendChild(defs);
      mapSearch.appendChild(gridPaths);
      mapSearch.appendChild(junctions);
      mapSearch.appendChild(mainMeat);
      mapSource.appendChild(mapSearch);
      
      // create map panel root/starting node
      let newNode = makeNode(setup.mapRoots[mapId - 1], 0, 0);
      if (mapId !== 1) { // for anything besides the starting map, to make sure the START node will have interactivity
        setup.mapRoots[mapId - 1].expanded = true; // for all non-first maps, expand the map
        animateChildren(newNode.id, setup.mapRoots[mapId - 1], { val: 1 }); // and display all nodes as possible
        //expandChildren(newNode.id, setup.mapRoots[mapId - 1], { val: 1 });
      }
    } else { // if map has already been created
      // move next map to front
      showMap(mapId);
    }
    // with the map shown, reset cursor to the root/starting node
    cursor.move(0, 0);
  }
  
  // clicking on the START element to begin navigation
  function clickRoot(e) {
    let domElement = e.target.parentElement; // obtain the parent <g> which contains the ID info
    centerCursorOnElement(domElement.id);
    
    let str = domElement.id.split("_")[1]; // retrieve the ID
    let result = str.match(digitPattern);
    result = parseInt(result[0]);
    let dataNode = findNodeById(result);
    
    if (dataNode === null) {
      console.error("Could not find this root!");
    }
    
    // if the map is already displayed, we don't want to hide it with another click
    if (!dataNode.expanded) {
      dataNode.expanded = true; // lock display
      animateChildren(domElement.id, dataNode, { val: 1 }); // expand relevant nodes
    }
    
    // should there be missing data (like an incomplete rawData.js file)
    if (dataNode.id !== setup.mapRoots[0].id) {
      let destNode = main.workingData.find(entry => entry.id === dataNode.pointsToElevatorId); // first, let's see if we can find the raw data that this is supposed to connect to
      if (destNode === undefined) { // if we cannot, then we are missing a parent map (or pointsToElevatorId points to a map that isn't existent)
        console.error("Previous map not implemented, somehow");
      } else {
        //console.log("would open map to", areaData[destNode.mapId].name); // if we found the data, then consoleout the intended map name
        popMap(destNode.mapId); // and then display the map panel
      }
    }
  }
  
  function clickElevator(e) {
    //console.log("elevator was clicked!", e);
    let groupNode = e.target.parentElement;
    let str = groupNode.id.split("_")[1];
    let result = str.match(digitPattern); // grab the ID value of the node
    result = parseInt(result[0]);
    let retrievedNode = findNodeById(result); // retrieve the object
    if (retrievedNode === null) {
      console.error("Could not find this elevator's data!"); // need to find out why the elevator was made wrong
      return;
    }
    let nextRoot = main.workingData.find(entry => entry.id === retrievedNode.pointsToElevatorId); // find the destination node
    if (nextRoot === undefined) {
      //console.log("Next map not implemented");
      return;
    }
    //console.log("would open map to", areaData[nextRoot.mapId].name);
    popMap(nextRoot.mapId); // open map panel
  }
  
  function calcChildrenShift(node, accumulator) {
    if (node.children.length === 0) {
      accumulator.val = 1;
      return;
    }
    if (node.parentId === -1) {
      cursor.shift(1, 0);
    } else {
      cursor.shift(0, 1);
    }
    
    let prevAccumulator = {
      val : accumulator.val
    };
    accumulator.val = node.children.length;
    
    for (let i = 0; i < node.children.length; i++) {
      let child = node.children[i];
      if (node.children.length > 1) {
        if (i > 0) {
          // get width of previous' children
          for (let j = 0; j < prevAccumulator.val; j++) {
            cursor.shift(1, 0);
          }
        }
        cursor.shift(0, 1);
      }
      
      // recursion
      if (child.type !== 5 || child.isUnlocked) {
        let nChildren = {
          val: 1
        };
        calcChildrenShift(child, nChildren);
        prevAccumulator = nChildren;
        accumulator.val += nChildren.val - 1;
      }
      
      cursor.shift(0, -1);
      if (node.children.length === 1) {
        cursor.shift(0, -1);
      }
    }
  }
  
  function ancestorsMakeRoom(elementId, node, accumulator) {
    if (node.id === setup.mapRoots[node.mapId - 1].id) {
      return;
    }
    
    let coords = getCurrentCoordsOfNodeById(elementId);
    let toShiftArray = [];
    let toConnectArray = [];
    let collecs = [];
    collecs.push(getCurrentMapElement("gridPaths"));
    collecs.push(getCurrentMapElement("junctions"));
    collecs.push(getCurrentMapElement("mainMeat"));
    
    for (let i = 0; i < collecs.length; i++) {
      for (child of collecs[i].children) {
        let childCoords = getCurrentCoordsOfNode(child);
        if (coords[0] < childCoords[0]) {
          toShiftArray.push(child);
        } else if (coords[0] === childCoords[0] && i === 0) {
          toConnectArray.push(child);
        }
      }
    }
    
    for (moveThis of toShiftArray) {
      let str = moveThis.attributes.transform.value;
      let result = str.match(digitPattern);
      let childCoords = [];
      let tempCursorSave = cursor.get();
      childCoords.push(parseInt(result[0]));
      childCoords.push(parseInt(result[1]));
      cursor.move(((childCoords[0] / 144) - 1), ((childCoords[1] / 144) - 1));
      moveThis.setAttribute("transform", "translate(" + (childCoords[0] + (accumulator.val * 144)) + " " + childCoords[1] + ")");
      cursor.shift(accumulator.val, 0);
      expandViewbox();
      cursor.move(tempCursorSave.x, tempCursorSave.y);
    }
    
    for (candidate of toConnectArray) {
      if (candidate.classList.contains("path-right")) {
        let str = candidate.attributes.transform.value;
        let result = str.match(digitPattern);
        let ancCoords = [];
        ancCoords.push(parseInt(result[0]));
        ancCoords.push(parseInt(result[1]));
        let tempCursorSave = cursor.get();
        
        cursor.move(((ancCoords[0] / 144) - 1), ((ancCoords[1] / 144) - 1));
        
        for (let j = 0; j < accumulator.val; j++) {
          cursor.shift(1, 0);
          insertPathLine("r");
          insertPathLine("l");
        }
        cursor.shift(1, 0);
        expandViewbox();
        
        cursor.move(tempCursorSave.x, tempCursorSave.y);
      }
    }
  }
  
  function unlock(e) {
    // only needed if in tracker mode. Otherwise, leave
    if (main.mode !== modes[1]) {
      return;
    }
    
    let parent = e.target.parentElement;
    centerCursorOnElement(parent.id);
    
    let str = parent.id.split("_")[1];
    let result = str.match(digitPattern);
    result = parseInt(result[0]);
    let retrievedNode = findNodeById(result);
    
    if (retrievedNode === null) {
      console.error("Could not find this lock!");
    }
    
    if (retrievedNode.isUnlocked) {
      //console.log("lock is already broken");
    } else {
      //console.log("lock is still active");
      retrievedNode.isUnlocked = true;
      let accumulator = { val: 1 };
      calcChildrenShift(retrievedNode, accumulator);
      accumulator.val--;
      ancestorsMakeRoom(parent.id, retrievedNode, accumulator);
      accumulator = { val: 1 };
      animateChildren(parent.id, retrievedNode, accumulator);
      attemptVines(parent.id, retrievedNode);
      // TODO: vines are having two issues; need to solve them
    }
  }
  
  function assignKey(e) {
    return; // NOT CURRENTLY IMPLEMENTED
  }
  
  function collectKey(e) {
    return; // NOT CURRENTLY IMPLEMENTED
  }
  
  function save(e) {
    console.log(document.cookie);
    return;
  }
  
  // creation of a node
  function makeNode(currentNode, x, y) {
    let shapeEnum = 0; // catch
    let shapeObject = null; // capture the shape DOM element
    let hoverShape = null; // and the hovering overlay
    let groupObject = document.createElementNS("http://www.w3.org/2000/svg", "g");
    groupObject.id = "mapSVG-" + main.currentMap + "_"; // this will be the ID that captures this node
    let imageClass = null; // image that will appear in the node
    let fillColor = "white"; // default fill: white
    let titleText = "";
    
    let hoverCapture = doNothing; // when hovering
    let clickCapture = doNothing; // when clicking, without the hovering overlay OR on touchscreen
    
    // in randomized mode, all keys are possibly required or unrequired, but we won't know until the key is collected
    if (main.goRandom && [7, 8, 11].includes(currentNode.type)) {
      currentNode.type = 9;
    }
    // do different things based on the node type
    switch(nodeType[currentNode.type]) {
      case "start": // starting node
        groupObject.id += "goal" + currentNode.id; // add specific data about node to ID
        shapeObject = goal_template.cloneNode(true); // circle
        hoverShape = goal_template.cloneNode(true); // circle
        imageClass = ""; // no image needed, so no special effects needed
        hoverCapture = hoverBasic; // assign hover method
        clickCapture = clickRoot; // assign click method
        if (setup.root.id !== currentNode.id) { // if this isn't the root of all maps
          titleText = areaData[main.workingData.find(n => n.id === currentNode.pointsToElevatorId).mapId].name.toUpperCase(); // display destination name
          fillColor = main.advancedColors ? "#" + areaData[main.workingData.find(n => n.id === currentNode.pointsToElevatorId).mapId].color : "#ffffff"; // get color of target elevator
        } else {
          titleText = "START"; // standard title text
          // fillColor will be standard white
        }
        break;
      case "another": // another node, "other" but circle
        groupObject.id += "goal" + currentNode.id; // add specific data about node to ID
        shapeObject = goal_template.cloneNode(true); // circle
        hoverShape = goal_template.cloneNode(true); // circle
        imageClass = ""; // no image needed, so no special effects needed
        hoverCapture = doNothing; // assign hover method
        clickCapture = doNothing; // assign click method
        break;
      case "end": // ending node
        groupObject.id += "end" + currentNode.id; // add specific data about node to ID
        shapeObject = end_template.cloneNode(true); // octagon
        hoverShape = end_template.cloneNode(true); // octagon
        imageClass = ""; // no image needed, so no special effects needed
        hoverCapture = doNothing; // assign hover method
        clickCapture = doNothing; // assign click method
        titleText = "END"; // standard title text
        break;
      case "elevator": // elevator access
        groupObject.id += "goal" + currentNode.id; // add specific data about node to ID
        shapeObject = goal_template.cloneNode(true); // circle
        hoverShape = goal_template.cloneNode(true); // circle
        imageClass = ""; // no image needed, so no special effects needed
        hoverCapture = hoverBasic; // assign hover method
        clickCapture = clickElevator; // assign click method
        // if not yet implemented
        if (currentNode.pointsToElevatorId !== -1) {
          //console.log(currentNode);
          titleText = areaData[main.workingData.find(n => n.id === currentNode.pointsToElevatorId).mapId].name.toUpperCase(); // display destination name
          fillColor = main.advancedColors ? "#" + areaData[main.workingData.find(n => n.id === currentNode.pointsToElevatorId).mapId].color : "#ffffff"; // get color of target elevator
        } // otherwise, fall back onto the data-given label
        break;
      case "boss": // boss battle
        groupObject.id += "goal" + currentNode.id; // add specific data about node to ID
        shapeObject = goal_template.cloneNode(true); // circle
        hoverShape = goal_template.cloneNode(true); // circle
        imageClass = "boss-image"; // image might be needed; if so, no filters to be applied
        fillColor = "#" + objColors.boss; // default boss/battle color
        hoverCapture = hoverBasic; // assign hover method
        clickCapture = unlock; // assign click method
        break;
      case "lock": // lock
        groupObject.id += "lock" + currentNode.id; // add specific data about node to ID
        shapeObject = lock_template.cloneNode(true); // square
        hoverShape = lock_template.cloneNode(true); // square
        // if the lock is a boss
        if (bossData.includes(currentNode.pickupType)) { // match against boss lock type
          imageClass = "boss-lock-image"; // grayscale the image
          fillColor = "#"+ objColors.boss; // default boss/battle color
        } else {
          imageClass = "lock-image"; // otherwise apply MULTIPLY to the item image
          fillColor = "#"+ objColors[pickupType[currentNode.pickupType]]; // grab the background color
          // if the lock is not an item lock, then the fillColor should be white
        }
        groupObject.setAttribute("isUnlocked", "false"); // make sure the rest of the map doesn't display, yet
        hoverCapture = hoverBasic; // assign hover method
        clickCapture = unlock; // assign click method
        break;
      case "access": // access
        groupObject.id += "access" + currentNode.id; // add specific data about node to ID
        shapeObject = access_template.cloneNode(true); // hexagon
        hoverShape = access_template.cloneNode(true); // hexagon
        imageClass = "lock-image"; // apply MULTIPLY
        fillColor = "#"+ objColors[pickupType[currentNode.pickupType]]; // grab the background color
        groupObject.setAttribute("isUnlocked", "false"); // make sure the rest of the map doesn't display, yet
        hoverCapture = hoverBasic; // assign hover method
        clickCapture = unlock; // assign click method
        break;
      case "key": // required key
        groupObject.id += "unclaimed-key" + currentNode.id; // add specific data about node to ID
        shapeObject = key_template.cloneNode(true); // diamond
        hoverShape = key_template.cloneNode(true); // diamond
        imageClass = "key-image"; // apply SCREEN
        fillColor = "#"+ objColors[pickupType[currentNode.pickupType]]; // grab the background color
        hoverCapture = hoverBasic; // assign hover method
        clickCapture = assignKey; // assign click method
        break;
      case "unknown": // lock (blank)
        groupObject.id += "unclaimed-lock" + currentNode.id; // add specific data about node to ID
        shapeObject = lock_template.cloneNode(true); // square
        hoverShape = lock_template.cloneNode(true); // square
        imageClass = "blank-lock"; // needs to be visible, so don't apply anything
        hoverCapture = hoverBasic; // assign hover method
        clickCapture = assignLock; // assign click method
        break;
      case "empty": // required key (blank)
        groupObject.id += "unclaimed-key" + currentNode.id; // add specific data about node to ID
        shapeObject = key_template.cloneNode(true); // diamond
        hoverShape = key_template.cloneNode(true); // diamond
        imageClass = "blank-key"; // needs to be visible, so don't apply anything
        hoverCapture = hoverBasic; // assign hover method
        clickCapture = assignKey; // assign click method
        break;
      case "save": // save room
      case "unreq": // unrequired key
      case "other": // other node, "other" but wedge
        groupObject.id += "unreq" + currentNode.id; // add specific data about node to ID
        shapeObject = unreq_template.cloneNode(true); // wedge
        hoverShape = unreq_template.cloneNode(true); // wedge
        imageClass = "key-image"; // apply SCREEN
        fillColor = "#"+ objColors[pickupType[currentNode.pickupType]]; // grab the background color
        // non-item nodes like save rooms and maps, display as on a white background
        if (currentNode.type === 4) { // save room
          hoverCapture = hoverBasic; // assign hover method
          clickCapture = save; // assign click method
          titleText = "S";
        } else if (currentNode.type === 7) { // unrequired key
          hoverCapture = hoverBasic; // assign hover method
          clickCapture = collectKey; // assign click method
        } else { // other node
          hoverCapture = doNothing; // assign hover method
          clickCapture = doNothing; // assign click method
        }
        break;
      case "slot": // slot node
        groupObject.id += "slot" + currentNode.id; // add specific data about node to ID
        shapeObject = slot_template.cloneNode(true); // pentagon
        hoverShape = slot_template.cloneNode(true); // pentagon
        imageClass = "key-image"; // apply SCREEN
        fillColor = "#"+ objColors[pickupType[currentNode.pickupType]]; // grab the background color
        hoverCapture = hoverBasic; // assign hover method
        clickCapture = assignKey; // assign click method
        break;
      case "oneway": // one-way arrow
        groupObject.id += "oneway" + currentNode.id; // add specific data about node to ID
        // to save on space, we are going to use the "textFill" property to determine the direction for our one-way arrows
        if (currentNode.textFill === "up") { // up
          shapeObject = arrow_up_template.cloneNode(true);
          hoverShape = arrow_up_template.cloneNode(true);
        } else if (currentNode.textFill === "down") { // down
          shapeObject = arrow_down_template.cloneNode(true);
          hoverShape = arrow_down_template.cloneNode(true);
        } else if (currentNode.textFill === "left") { // left
          shapeObject = arrow_left_template.cloneNode(true);
          hoverShape = arrow_left_template.cloneNode(true);
        } else { // right
          shapeObject = arrow_right_template.cloneNode(true);
          hoverShape = arrow_right_template.cloneNode(true);
        }
        fillColor = (main.advancedColors && main.separateAreas) ? "#"+ areaData[currentNode.mapId].color : "#ffffff"; // get color of this map
        hoverCapture = hoverBasic; // assign hover method
        clickCapture = unlock; // assign click method
        break;
      case "none":
      default:
        shapeEnum = iconType.none; // in case all fails, we need a catch-all
    }
    
    hoverShape.removeAttribute("id"); // remove ID from hover shape, otherwise there will be a duplicate ID
    
    fillColor = main.allowColors ? fillColor : "white"; // colorblind option
    shapeObject.setAttribute("fill", fillColor); // finally attach the color option to the shape
    
    shapeObject.removeAttribute("id"); // remove ID from shape object, otherwise there will be a duplicate ID
    groupObject.appendChild(shapeObject); // attach shape to the <g>; this must be on the bottom of everything
    
    // now let's create the text to go inside of the shape
    let textObject = null; // container object
    let textOffset = 0;
    // if we already have the text populated
    // or the text has yet to be populated
    // or we have to mark that a certain number of keys are needed
    // so long as the current node is not an arrow (we're ignoring this value because of directions)
    if (titleText.length !== 0 || (currentNode.textFill.length > 0 || (currentNode.numReqd > 1)) && currentNode.type !== 6 && currentNode.type !== 9) {
      textObject = document.createElementNS("http://www.w3.org/2000/svg", "text");
      textObject.classList.add("text-node");
      
      textObject.setAttribute("x", "0");
      textObject.setAttribute("y", "9"); // slight vertical offset
      textObject.setAttribute("fill", "black");
      textObject.setAttribute("text-anchor", "middle"); // centered
      textOffset = 39; // 39 pixels is perfect for "lg" text offset, if an image needs to be added
      
      if (titleText.length !== 0) { // if we already have text set, based on earlier code
        textObject.classList.add("text-lg");
        textObject.innerHTML = titleText;
      } else if (currentNode.numReqd > 1 && (currentNode.type === 5 || currentNode.type === 12)) { // display required value
        textObject.classList.add("text-md"); // apply the right style
        textObject.innerHTML = "Req: " + currentNode.numReqd;
        textOffset -= 4;
      } else if (currentNode.numReqd > 1) { // display required value
        textObject.classList.add("text-md"); // apply the right style
        textObject.setAttribute("y", "0"); // no vertical offset
        textObject.innerHTML = "x" + currentNode.numReqd;
        textOffset -= 4;
      } else if (currentNode.type === 4) { // for save rooms, just display the giant S
        textObject.classList.add("text-xl"); // apply the right style
        textObject.setAttribute("y", "0"); // no vertical offset
        textObject.innerHTML = "S";
        textOffset = 0;
      } else {
        textObject.classList.add("text-lg");
        textObject.innerHTML = currentNode.textFill;
      }
    }
    
    // now let's create the image to go inside the shape
    let imageObject = null;
     // if you have an image applied in the RawData
    if (currentNode.image.length > 0) {
      imageObject = document.createElementNS("http://www.w3.org/2000/svg", "image");
      imageClass = main.allowColors ? imageClass : "color-blind-image"; // apply filtered image OR color-blind one
      imageObject.classList.add(imageClass); // apply the class
      if (bossData.includes(currentNode.pickupType)) { // if this is a boss image, then we need to apply different logic
        imageObject.setAttributeNS("http://www.w3.org/1999/xlink", "href", "images/icons/" + currentNode.image + ".png"); // grab the boss image
        imageObject.setAttribute("width", "80px"); // larger size
        imageObject.setAttribute("height", "80px");
        imageObject.setAttribute("x", "-40");
        imageObject.setAttribute("y", "-40");
      } else {
        if (currentNode.type === 9) { // if we're doing randomized mode and each item is hidden, display item spheres instead
          imageObject.setAttributeNS("http://www.w3.org/1999/xlink", "href", "images/icons/itemSphere.png");
        } else { // otherwise, just display the item image
          imageObject.setAttributeNS("http://www.w3.org/1999/xlink", "href", "images/icons/" + currentNode.image + ".png");
        }
        
        imageObject.setAttribute("width", "42px"); // each image should be 42x42
        imageObject.setAttribute("height", "42px");
        imageObject.setAttribute("x", "-21");
        imageObject.setAttribute("y", "-21");
      }
    }
    
    // now based on the existence of a text and an image, we need to apply them to the group, with appropriate spacing
    if (textObject && imageObject && currentNode.type !== 9) { // for every shape where we have and image and text that ISN'T an "empty" node type
      if ([7, 8, 11].includes(currentNode.type) && main.allowColor) { // for keys unless colorblind
        textObject.setAttribute("fill", "white");
      } else { // this should apply for all other shape types
        textObject.setAttribute("fill", "black");
      }
      textObject.setAttribute("y", textOffset); // offset text to be lower
      groupObject.appendChild(imageObject); // then add to the group
      groupObject.appendChild(textObject); // in the right order
    } else if (imageObject) { // no text, just apply image with default offset
      groupObject.appendChild(imageObject);
    } else if (textObject) { // no image, just apply text with default offset
      groupObject.appendChild(textObject);
    } else {
      //something has gone wrong, we need to capture this
      // it's possible that we might have the rare case of having both image and text, and with an "empty" node
      // in which case
      // TODO: handle this case
    }
    
    // now we'll deal with external labels, for items
    let outerTextObject = null;
    let outerStr = "";
    // for every key, required or otherwise, standard or slotted, UNLESS randomized
    if ((currentNode.textOuter.length !== 0 || currentNode.type === 7 || currentNode.type === 8 || currentNode.type === 11) && currentNode.type !== 9) {
      outerTextObject = document.createElementNS("http://www.w3.org/2000/svg", "text");
      outerTextObject.classList.add("text-node");
      outerTextObject.classList.add("text-lg");
      outerTextObject.setAttribute("x", "0");
      outerTextObject.setAttribute("y", "60");// offset so that the text begins outside of the shape's borders
      outerTextObject.setAttribute("fill", main.allowColors ? "white" : "black");
      outerTextObject.setAttribute("text-anchor", "middle");
      outerTextObject.innerHTML = "";
      if (currentNode.textOuter.length !== 0) {
        outerStr = currentNode.textOuter; // if there's a specific text, use that
      } else { // otherwise, display the name of the item
        outerStr = pickupType[currentNode.pickupType];
      }
      
      // insert appropriate line breaks
      // TODO: might need to revise
      outerStr = outerStr.split(" ");
      let rollingText = "";
      for (let i = 0; i < outerStr.length; i++) {
        if (i > 0) { // insert a space after each word, after the first word
          rollingText += " ";
        }
        rollingText += outerStr[i];
        if (rollingText.length >= 5 || i + 1 === outerStr.length) { // If the text is longer than one line, cut it. Also process the last line of a text.
          let tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
          tspan.setAttribute("x", "0");
          tspan.setAttribute("dy", "1.2em"); // includes line spacing
          tspan.textContent = rollingText; // paste the text to the line
          
          outerTextObject.appendChild(tspan);
          rollingText = ""; // reset current text chunk
        }
      }
      
      groupObject.appendChild(outerTextObject); // save the text line
    }
    
    // and now to place the group
    if (x && y) { // if we pass in a specific location, drop it there
      groupObject.setAttribute("transform", "translate(" + x + " " + y + ")");
    } else { // otherwise, drop it wherever the cursor currently is
      groupObject.setAttribute("transform", "translate(" + cursor.get().x + " " + cursor.get().y + ")");
    }
    
    if (main.getIsDesktop()) {
      groupObject.addEventListener("mouseenter", hoverCapture); // apply hovering method
      groupObject.addEventListener("mouseleave", removeHover); // and remove hovering effect
    }
    groupObject.addEventListener("click", clickCapture); // apply clicking method
    
    // for each elevator that isn't a map root, we'll also include an arrow pointing south
    if (currentNode.type === 2 && currentNode.parent !== -1) {
      let escapeArrow = arrow_down_template.cloneNode(true); // copy a down arrow
      escapeArrow.removeAttribute("id"); // remove Id to prevent DOM troubles
      // use the map's color for the arrow unless using colorblind mode
      let arrowFill = "ffffff"; // default for colorblind mode
      if (main.allowColors && main.advancedColors) {
        arrowFill = areaData[currentNode.mapId].color; // grab the map color
        let destination = main.workingData.find(n => n.id === currentNode.pointsToElevatorId); // find the destination node to grab the map data
        if (destination !== undefined) { // if we can find it, use that map's color
          arrowFill = areaData[destination.mapId].color;
        }
      }
      escapeArrow.setAttribute("fill", "#" + arrowFill); // apply the color
      let lastLine;
      if (x && y) {
        insertPathLine("d", x, y);
        lastLine = insertPathLine("u", x, (y + 144));
      } else {
        insertPathLine("d", cursor.get().x, cursor.get().y);
        lastLine = insertPathLine("u", cursor.get().x, (cursor.get().y + 144));
      }
      escapeArrow.setAttribute("transform", "translate(0 144)"); // place some distance south of the elevator
      // color last line according to new map color unless using colorblind mode
      if (main.allowColors && main.advancedColors) {
        // using a gradient
        let newGradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
        newGradient.setAttribute("id", "Gradient" + (numGradsAlready + 1));
        newGradient.setAttribute("x1", 0);
        newGradient.setAttribute("x2", 0);
        newGradient.setAttribute("y1", 0);
        newGradient.setAttribute("y2", 1);
        let stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        stop1.setAttribute("offset", "0%");
        stop1.setAttribute("stop-color", "#" + areaData[currentNode.mapId].color);
        let stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        stop2.setAttribute("offset", "100%");
        stop2.setAttribute("stop-color", "#" + arrowFill);
        newGradient.appendChild(stop1);
        newGradient.appendChild(stop2);
        getCurrentMapElement("defs").appendChild(newGradient);
        numGradsAlready++;
        lastLine.children[0].setAttribute("fill", "url(#" + newGradient.id + ")");
      } else {
        lastLine.children[0].setAttribute("fill", "#ffffff");
      }
      
      groupObject.appendChild(escapeArrow);
    }
    
    // add hovering menu
    hoverShape.setAttribute("class", "node-hover-overlay");
    if (hoverShape.classList) {
      hoverShape.classList.add("node-hover-overlay");
    } else {
      let arr = hoverShape.className.split(" ");
      if (arr.indexOf("node-hover-overlay") == -1) {
          hoverShape.className += " node-hover-overlay";
      }
    }
    hoverShape.removeAttribute("stroke");
    hoverShape.removeAttribute("stroke-width");
    hoverShape.setAttribute("fill", "rgb(0, 0, 0, 0.33)");
    groupObject.appendChild(hoverShape);
    
    getCurrentMapElement("mainMeat").appendChild(groupObject); // now apply node to the map proper
    expandViewbox(); // make room for the whole map
    
    return document.getElementById(groupObject.id);
  }
  
  // zoom in and out, dynamic based on whether on desktop or on mobile, using mouse or using HUD elements
  function zoom(e) {
    let play = document.getElementById("mapSVG-" + main.currentMap);
    let viewBoxProps = play.getAttribute("viewBox").split(' ');
    let oldX = parseFloat(viewBoxProps[0]);
    let oldY = parseFloat(viewBoxProps[1]);
    let oldWidth = parseFloat(viewBoxProps[2]);
    let oldHeight = parseFloat(viewBoxProps[3]);
    let centerX = e.clientX;
    let centerY = e.clientY;
    
    if (e.target !== play) {
      centerX = parseInt(e.target.parentElement.attributes.transform.value.match(digitPattern)[0]);
      centerY = parseInt(e.target.parentElement.attributes.transform.value.match(digitPattern)[1]);
    }
    
    if (e.deltaY > 0) {
      // scroll down, so zoom out
      newWidth = oldWidth * 2.0;
      newHeight = oldHeight * 2.0;
    } else {
      // scroll up, so zoom in
      newWidth = oldWidth / 2.0;
      newHeight = oldHeight / 2.0;
    }
    newX = centerX - newWidth / 2.0;
    newY = centerY - newHeight / 2.0;
    if (newX <= 0) {
      newX = 0;
    }
    if (newY <= 0) {
      newY = 0;
    }
    let newViewBox = [
      newX,
      newY,
      newWidth,
      newHeight
    ];
    play.setAttribute("viewBox", newViewBox.join(' '));
  }
  
  function panStart(e) {
    if (e.target.tagName === "svg") {
      interaction.readyPan = true;
      interaction.prev.x = e.offsetX;
      interaction.prev.y = e.offsetY;
    } else {
      interaction.readyPan = false;
    }
  }
  
  function panDuring(e) {
    if (interaction.readyPan && e.target.tagName === "svg") {
      let play = document.getElementById("mapSVG-" + main.currentMap);
      let viewBoxProps = play.getAttribute("viewBox").split(' ');
      
      let newX = parseFloat(viewBoxProps[0]) + e.offsetX - interaction.prev.x;
      if (newX <= interaction.min.x) {
        newX = interaction.min.x;
      } else if (newX >= interaction.max.x) {
        newX = interaction.max.x;
      }
      let newY = parseFloat(viewBoxProps[1]) + e.offsetY - interaction.prev.y;
      if (newY <= interaction.min.y) {
        newY = interaction.min.y;
      } else if (newY >= interaction.max.y) {
        newY = interaction.max.y;
      }
      
      let newViewBox = [
        newX,
        newY,
        parseFloat(viewBoxProps[2]),
        parseFloat(viewBoxProps[3])
      ];
      play.setAttribute("viewBox", newViewBox.join(' '));
    }
  }
  
  function panEnd(e) {
    interaction.readyPan = false;
    interaction.prev.x = 0;
    interaction.prev.y = 0;
  }
  
  interaction.popMap = popMap;
  interaction.zoom = zoom;
  interaction.panStart = panStart;
  interaction.panDuring = panDuring;
  interaction.panEnd = panEnd;
  interaction.navigateTree = navigateTree;
})();