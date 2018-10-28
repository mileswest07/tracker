let main = {};

(function() {
  let root = null;
  let workingData = rawData;
  let mapRoots = [];
  let numMapsReady = 5;
  let digitPattern = /\d+/g;
  let allowColors = false;
  
  const games = {
    "m": "m1",
    "2": "m2",
    "s": "sm",
    "o": "om",
    "f": "mf",
    "z": "zm",
    "r": "sr",
    "p": "mp",
    "e": "pe",
    "c": "pc",
    "h": "ph",
    "b": "pb"
  };

  let cursor = {
    x: 0,
    y: 0
  };

  let mapVines = [];
  
  function hideMap(mapId) {
    let mapSearch = document.getElementById("mapSVG-" + mapId);
    if (mapSearch !== null) {
      // hide current map
      if (mapSearch.classList) {
        mapSearch.classList.add("hide-map");
      } else {
        let arr = mapSearch.className.split(" ");
        if (arr.indexOf("hide-map") === -1) {
          mapSearch.className += " hide-map";
        }
      }
    }
  }
  
  function showMap(mapId) {
    let mapSearch = document.getElementById("mapSVG-" + mapId);
    if (mapSearch !== null) {
      // show current map
      if (mapSearch.classList) {
        mapSearch.classList.remove("hide-map");
      } else {
        mapSearch.className += mapSearch.className.replace(/\bhide-map\b/g);
      }
    }
  }
  
  function popMap(mapId) {
    let mapSource = document.getElementById("mainground");
    let mapSearch = document.getElementById("mapSVG-" + mapId);
    // hide current map
    hideMap(main.currentMap);
    main.currentMap = mapId;
    if (mapSearch === null) {
      // create new map
      mapSearch = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      mapSearch.setAttribute("id", "mapSVG-" + main.currentMap);
      mapSearch.setAttribute("class", "map-svg");
      mapSearch.setAttribute("width", "100%");
      mapSearch.setAttribute("height", "100%");
      mapSearch.setAttribute("viewBox", "0 0 432 432");
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
      
      let newNode = makeNode(mapRoots[main.currentMap - 1], 0, 0);
      if (main.currentMap !== 1) {
        mapRoots[main.currentMap - 1].expanded = true;
        animateChildren(newNode.id, mapRoots[main.currentMap - 1], { val: 1 });
      }
    } else {
      // move next map to front
      showMap(main.currentMap);
    }
    moveCursor(0, 0);
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

  function listConnections(currentNode) {
    return workingData.filter(node => node.parentId === currentNode.id);
  }

  function recursionA(currentNode, mapNodes) {
    if (!currentNode.hasOwnProperty("children")) {
      currentNode.children = [];
    }
    let candidates = listConnections(currentNode);
    for (let i = 0; i < candidates.length; i++) {
      if (!candidates[i].hasOwnProperty("parents")) {
        candidates[i].parents = [];
      }
      candidates[i].parents.push(currentNode);
      
      if (candidates[i].cousinsTo && Array.isArray(candidates[i].cousinsTo) && candidates[i].cousinsTo.length > 0) {
        if (!(mapVines[currentNode.mapId - 1] && Array.isArray(mapVines[currentNode.mapId - 1]) && mapVines[currentNode.mapId - 1].length > 0)) {
          mapVines[currentNode.mapId - 1] = [];
        }
        let newArray = [candidates[i].id, ...candidates[i].cousinsTo];
        let newerArray = newArray.sort();
        
        let notFound = true;
        for (let j = 0; j < mapVines[currentNode.mapId - 1].length; j++) {
          let cluster = mapVines[currentNode.mapId - 1][j];
          if (cluster.length !== newerArray.length) {
            continue;
          }
          let lengthMatches = 0;
          for (let k = 0; k < cluster.length; k++) {
            if (cluster[k] === newerArray[k]) {
              lengthMatches++;
            }
          }
          if (lengthMatches === newerArray.length) {
            notFound = false;
          }
        }
        if (notFound) {
          mapVines[currentNode.mapId - 1].push(newerArray);
        }
      }
      
      if (mapNodes[candidates[i].id] !== true) {
        currentNode.children.push(candidates[i]);
        mapNodes[candidates[i].id] = true;
        recursionA(candidates[i], mapNodes);
      }
    }
  }

  function makeTree() {
    mapRoots = workingData.filter(node => node.type === nodeType.start);
    root = mapRoots[0];
    
    for (let i = 0; i < mapRoots.length; i++) {
      let mapNodes = {};
      let currentNode = mapRoots[i];
      recursionA(currentNode, mapNodes);
    }
  }

  function recursionB(currentNode, predicate) {
    predicate(currentNode);
    for (let i = 0; i < currentNode.children.length; i++) {
      recursionB(currentNode.children[i], predicate);
    }
  }

  function navigateTree(predicate) {
    let currentRoot = mapRoots[main.currentMap - 1];
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
  
  function isAncestorTo(nodeIdA, nodeIdB) {
    let returnValue = false;
    let currentNode = findNodeById(nodeIdB);
    if (currentNode === null) {
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

  function makeNode(currentNode, x, y) {
    let shapeEnum = 0;
    let shapeObject = null;
    let hoverShape = null;
    let groupObject = document.createElementNS("http://www.w3.org/2000/svg", "g");
    groupObject.id = "mapSVG-" + main.currentMap + "_";
    let imageClass = null;
    let fillColor = "white";
    let titleText = ""; // todo: apply property to each category
    
    let hoverCapture = doNothing;
    let clickCapture = doNothing;
    
    switch(currentNode.type) {
      case 1: // starting node
        imageClass = "lock-image";
        shapeObject = goal_template.cloneNode(true);
        groupObject.id += "goal" + currentNode.id;
        fillColor = "white";
        hoverShape = goal_template.cloneNode(true);
        hoverShape.removeAttribute("id");
        hoverCapture = hoverRoot;
        clickCapture = clickRoot;
        break;
      case 2: // elevator access
        imageClass = "lock-image";
        shapeObject = goal_template.cloneNode(true);
        groupObject.id += "goal" + currentNode.id;
        if (currentNode.pickupType !== 0) {
          fillColor = "#" + objColors[pickupType[currentNode.pickupType]];
          hoverCapture = hoverElevator2;
          clickCapture = doNothing;
        } else {
          fillColor = "#" + objColors.elevator;
          hoverCapture = hoverElevator;
          clickCapture = clickElevator;
        }
        hoverShape = goal_template.cloneNode(true);
        hoverShape.removeAttribute("id");
        break;
      case 3: // boss battle
        imageClass = "boss-image";
        shapeObject = goal_template.cloneNode(true);
        groupObject.id += "goal" + currentNode.id;
        fillColor = "#" + objColors.boss;
        hoverShape = goal_template.cloneNode(true);
        hoverShape.removeAttribute("id");
        hoverCapture = hoverBoss;
        clickCapture = defeatBoss;
        break;
      case 5: // lock
        shapeObject = lock_template.cloneNode(true);
        groupObject.id += "lock" + currentNode.id;
        if (bossData.includes(currentNode.pickupType)) {
          imageClass = "boss-lock-image";
          fillColor = "#"+ objColors.boss;
        } else {
          imageClass = "lock-image";
          fillColor = "#"+ objColors[pickupType[currentNode.pickupType]];
        }
        groupObject.setAttribute("isUnlocked", "false");
        hoverShape = lock_template.cloneNode(true);
        hoverShape.removeAttribute("id");
        hoverCapture = hoverLock;
        clickCapture = unlock;
        break;
      case 8: // required key
      case 9: // required key (blank)
        shapeObject = key_template.cloneNode(true);
        groupObject.id += "key" + currentNode.id;
        imageClass = "key-image";
        fillColor = "#"+ objColors[pickupType[currentNode.pickupType]];
        hoverShape = key_template.cloneNode(true);
        hoverShape.removeAttribute("id");
        hoverCapture = hoverKey;
        if (currentNode.type === 9) {
          clickCapture = assignKey;
        } else {
          clickCapture = collectKey;
        }
        break;
      case 4: // save room
      case 7: // unrequired key
      case 10: // other node
        shapeObject = unreq_template.cloneNode(true);
        groupObject.id += "unreq" + currentNode.id;
        imageClass = "key-image";
        fillColor = "#"+ objColors[pickupType[currentNode.pickupType]];
        hoverShape = unreq_template.cloneNode(true);
        hoverShape.removeAttribute("id");
        hoverCapture = hoverUnreq;
        if (currentNode.type === 4) {
          clickCapture = save;
        } else if (currentNode.type === 7) {
          clickCapture = collectKey;
        } else {
          clickCapture = doNothing;
        }
        break;
      case 6: // one-way arrow
        if (currentNode.textFill === "up") {
          shapeObject = arrow_up_template.cloneNode(true);
          hoverShape = arrow_up_template.cloneNode(true);
        } else if (currentNode.textFill === "down") {
          shapeObject = arrow_down_template.cloneNode(true);
          hoverShape = arrow_down_template.cloneNode(true);
        } else if (currentNode.textFill === "left") {
          shapeObject = arrow_left_template.cloneNode(true);
          hoverShape = arrow_left_template.cloneNode(true);
        } else {
          shapeObject = arrow_right_template.cloneNode(true);
          hoverShape = arrow_right_template.cloneNode(true);
        }
        groupObject.id += "oneway" + currentNode.id;
        if (allowColors) {
          fillColor = "#"+ areaData[currentNode.mapId].color;
        } else {
          fillColor = "white";
        }
        hoverShape.removeAttribute("id");
        hoverCapture = hoverOther;
        clickCapture = doNothing;
        break;
      case 0: 
      default: 
        shapeEnum = iconType.none;
        fillColor = "white";
    }
    
    shapeObject.setAttribute("fill", fillColor);
    
    shapeObject.removeAttribute("id");
    groupObject.appendChild(shapeObject);
    
    let textObject = null;
    
    if ((currentNode.textFill.length > 0 || (currentNode.numReqd > 1)) && currentNode.type !== 6) {
      textObject = document.createElementNS("http://www.w3.org/2000/svg", "text");
      textObject.classList.add("text-node");
      textObject.setAttribute("x", "0");
      textObject.setAttribute("y", "9");
      textObject.setAttribute("fill", "black");
      textObject.setAttribute("text-anchor", "middle");
      
      if (currentNode.numReqd > 1) {
        textObject.innerHTML = "Required: " + currentNode.numReqd;
      } else if (currentNode.type === 4) {
        textObject.innerHTML = "S";
      } else {
        textObject.innerHTML = currentNode.textFill;
      }
    }
    
    let imageObject = null;
    
    if (currentNode.image.length > 0) {
      // pull the right image from the repo
      imageObject = document.createElementNS("http://www.w3.org/2000/svg", "image");
      imageObject.classList.add(imageClass);
      imageObject.setAttributeNS("http://www.w3.org/1999/xlink", "href", "images/icons/" + currentNode.image + ".png");
      imageObject.setAttribute("width", "80px");
      imageObject.setAttribute("height", "80px");
      imageObject.setAttribute("x", "-40");
      imageObject.setAttribute("y", "-40");
    }
    
    if (textObject && imageObject) {
      if ([7, 8].includes(currentNode.type)) { // for keys
        textObject.setAttribute("fill", "white");
      } else {
        textObject.setAttribute("fill", "black");
      }
      if (currentNode.children.length === 0 && !(currentNode.parentId.length > 1)) {
        textObject.setAttribute("y", "81");
      } else {
        imageObject.setAttribute("y", "-48");
        textObject.setAttribute("y", "29");
      }
      groupObject.appendChild(imageObject);
      groupObject.appendChild(textObject);
    } else if (imageObject) {
      groupObject.appendChild(imageObject);
    } else if (textObject) {
      groupObject.appendChild(textObject);
    } else {
      //something has gone wrong
    }
    
    if (x && y) {
      groupObject.setAttribute("transform", "translate(" + x + " "+ y + ")");
    } else {
      groupObject.setAttribute("transform", "translate(" + getCursor().x + " "+ getCursor().y + ")");
    }
    
    groupObject.addEventListener("mouseenter", hoverCapture);
    groupObject.addEventListener("mouseleave", removeHover);
    groupObject.addEventListener("click", clickCapture);
    
    if (currentNode.type === 2 && currentNode.parent !== -1) {
      let escapeArrow = arrow_down_template.cloneNode(true);
      escapeArrow.removeAttribute("id");
      let arrowFill;
      let destination = workingData.find(n => n.id === currentNode.pointsToElevatorId);
      if (destination !== undefined) {
        arrowFill = areaData[destination.mapId].color;
      } else {
        arrowFill = areaData[currentNode.mapId].color;
      }
      if (allowColors) {
        escapeArrow.setAttribute("fill", "#"+ arrowFill);
      }
      let lastLine;
      if (x && y) {
        insertPathLine("d", x, y);
        lastLine = insertPathLine("u", x, (y + 144));
      } else {
        insertPathLine("d", getCursor().x, getCursor().y);
        lastLine = insertPathLine("u", getCursor().x, (getCursor().y + 144));
      }
      escapeArrow.setAttribute("transform", "translate(0 144)");
      // color last line according to new map color
      
      let newGradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
      let numGradsAlready = getCurrentMapElement("defs").children.length;
      newGradient.setAttribute("id", "Gradient" + (numGradsAlready + 1))
      newGradient.setAttribute("x1", 0);
      newGradient.setAttribute("x2", 0);
      newGradient.setAttribute("y1", 0);
      newGradient.setAttribute("y2", 1);
      let stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
      stop1.setAttribute("offset", "0%");
      stop1.setAttribute("stop-color", "#"+ areaData[root.mapId].color);
      let stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
      stop2.setAttribute("offset", "100%");
      stop2.setAttribute("stop-color", "#"+ arrowFill);
      newGradient.appendChild(stop1);
      newGradient.appendChild(stop2);
      getCurrentMapElement("defs").appendChild(newGradient);
      if (allowColors) {
        lastLine.children[0].setAttribute("fill", "url(#" + newGradient.id + ")");
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
          hoverShape.className += " " + "node-hover-overlay";
      }
    }
    hoverShape.removeAttribute("stroke");
    hoverShape.removeAttribute("stroke-width");
    hoverShape.setAttribute("fill", "rgb(0, 0, 0, 0.33)");
    groupObject.appendChild(hoverShape);
    
    getCurrentMapElement("mainMeat").appendChild(groupObject);
    expandViewbox();
    
    return document.getElementById(groupObject.id);
  }

  function moveCursor(x, y) {
    getCursor().x = (x + 1) * 144;
    getCursor().y = (y + 1) * 144;
  }

  function shiftCursor(dx, dy) {
    getCursor().x += dx * 144;
    getCursor().y += dy * 144;
  }

  function getCurrentCoordsOfNode(nodeObj) {
    let returnValues = [];
    let str = nodeObj.attributes.transform.value;
    let result = str.match(digitPattern);
    returnValues.push(parseInt(result[0]));
    returnValues.push(parseInt(result[1]));
    
    return returnValues;
  }

  function getCurrentCoordsOfNodeById(elementId) {
    let nodeObj = document.getElementById(elementId);
    return getCurrentCoordsOfNode(nodeObj);
  }

  function moveNode(elementId, x, y) {
    let nodeObj = document.getElementById(elementId);
    nodeObj.setAttribute("transform", "translate(" + ((x + 1) * 144) + " " + ((y + 1) * 144) + ")");
  }

  function shiftNode(elementId, dx, dy) {
    let nodeObj = document.getElementById(elementId);
    let coords = getCurrentCoordsOfNodeById(elementId);
    nodeObj.setAttribute("transform", "translate(" + (coords[0] + (dx * 144)) + " " + (coords[1] + (dy * 144)) + ")");
  }

  function getCursor() {
    return cursor;
  }

  function centerCursorOnElement(elementId) {
    let coords = getCurrentCoordsOfNodeById(elementId);
    moveCursor(((coords[0] / 144) - 1), ((coords[1] / 144) - 1));
  }

  function insertJunctionDot(x, y) {
    let shapeObject = junction_template.cloneNode(true);
    shapeObject.removeAttribute("id");
    if (x && y) {
      shapeObject.setAttribute("transform", "translate(" + x + " " + y + ")");
    } else {
      shapeObject.setAttribute("transform", "translate(" + getCursor().x + " " + getCursor().y + ")");
    }
    if (allowColors) {
      shapeObject.setAttribute("fill", "#"+ areaData[mapRoots[main.currentMap - 1].mapId].color);
    }
    
    getCurrentMapElement("junctions").appendChild(shapeObject);
    
    // retrieve currently-just-added element
    //return document.getElement();
  }

  function insertPathLine(dir, x, y) {
    let templateName = "";
    switch(dir) {
      case "l":
        templateName = "grid_line_h_left_template";
        break;
      case "r":
        templateName = "grid_line_h_right_template";
        break;
      case "u":
        templateName = "grid_line_v_up_template";
        break;
      case "d":
        templateName = "grid_line_v_down_template";
        break;
    }
    let original = document.getElementById(templateName);
    let copy = original.cloneNode(true);
    copy.removeAttribute("id");
    if (x && y) {
      copy.setAttribute("transform", "translate(" + x + " " + y + ")");
    } else {
      copy.setAttribute("transform", "translate(" + getCursor().x + " " + getCursor().y + ")");
    }
    if (allowColors) {
      copy.children[0].setAttribute("fill", "#"+ areaData[mapRoots[main.currentMap - 1].mapId].color);
    }
    
    getCurrentMapElement("gridPaths").appendChild(copy);
    
    // retrieve currently-just-added element
    let thisLine;
    if (x && y) {
      thisLine = findElementOfLayerAtCoords("grid", x, y);
    } else {
      thisLine = findElementOfLayerAtCoords("grid", getCursor().x, getCursor().y);
    }
    return thisLine[thisLine.length - 1];
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
    
    for (let i = 0; i < childCollection.length; i++) {
      let child = childCollection[i];
      let str = child.attributes.transform.value;
      let result = str.match(digitPattern);
      
      if (parseInt(result[0]) === x && parseInt(result[1]) === y) {
        returnValue.push(child);
      }
    }
    
    return returnValue;
  }

  function ancestorsMakeRoom(elementId, node, accumulator) {
    if (node.id === mapRoots[node.mapId - 1].id) {
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
      for (let j = 0; j < collecs[i].children.length; j++) {
        let child = collecs[i].children[j];
        let childCoords = getCurrentCoordsOfNode(child);
        if (coords[0] < childCoords[0]) {
          toShiftArray.push(child);
        } else if (coords[0] === childCoords[0] && i === 0) {
          toConnectArray.push(child);
        }
      }
    }
    
    for (let i = 0; i < toShiftArray.length; i++) {
      let moveThis = toShiftArray[i];
      let str = moveThis.attributes.transform.value;
      let result = str.match(digitPattern);
      let childCoords = [];
      let tempCursorSave = {};
      tempCursorSave.x = getCursor().x;
      tempCursorSave.y = getCursor().y;
      childCoords.push(parseInt(result[0]));
      childCoords.push(parseInt(result[1]));
      moveCursor(((childCoords[0] / 144) - 1), ((childCoords[1] / 144) - 1));
      moveThis.setAttribute("transform", "translate(" + (childCoords[0] + (accumulator.val * 144)) + " " + childCoords[1] + ")");
      shiftCursor(accumulator.val, 0);
      expandViewbox();
      moveCursor(tempCursorSave.x, tempCursorSave.y);
    }
    
    for (let i = 0; i < toConnectArray.length && accumulator.val > 0; i++) {
      let candidate = toConnectArray[i];
      if (candidate.classList.contains("path-right")) {
        let str = candidate.attributes.transform.value;
        let result = str.match(digitPattern);
        let ancCoords = [];
        ancCoords.push(parseInt(result[0]));
        ancCoords.push(parseInt(result[1]));
        let tempCursorSave = {};
        tempCursorSave.x = getCursor().x;
        tempCursorSave.y = getCursor().y;
        
        moveCursor(((ancCoords[0] / 144) - 1), ((ancCoords[1] / 144) - 1));
        
        for (let j = 0; j < accumulator.val; j++) {
          shiftCursor(1, 0);
          insertPathLine("r");
          insertPathLine("l");
        }
        shiftCursor(1, 0);
        expandViewbox();
        
        moveCursor(tempCursorSave.x, tempCursorSave.y);
      }
    }
  }

  function calcChildrenShift(node, accumulator) {
    if (node.children.length === 0) {
      accumulator.val = 1;
      return;
    }
    if (node.parentId === -1) {
      shiftCursor(1, 0);
    } else {
      shiftCursor(0, 1);
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
            shiftCursor(1, 0);
          }
        }
        shiftCursor(0, 1);
      }
      
      // recursion
      if (child.type !== nodeType.lock || child.isUnlocked) {
        let nChildren = {
          val: 1
        };
        calcChildrenShift(child, nChildren);
        prevAccumulator = nChildren;
        accumulator.val += nChildren.val - 1;
      }
      
      shiftCursor(0, -1);
      if (node.children.length === 1) {
        shiftCursor(0, -1);
      }
    }
  }
  
  function createCousinVine(elementId, destinationRaw) {
    let destinationId = "";
    
    switch (destinationRaw.type) {
      case 3: 
      case 2: 
      case 1: 
        destinationId = "mapSVG-" + main.currentMap + "_goal" + destinationRaw.id;
        break;
      case 5: 
        destinationId = "mapSVG-" + main.currentMap + "_lock" + destinationRaw.id;
        break;
      case 8: 
      case 9: 
        destinationId = "mapSVG-" + main.currentMap + "_key" + destinationRaw.id;
        break;
      case 4: 
      case 7: 
      case 10: 
        destinationId = "mapSVG-" + main.currentMap + "_unreq" + destinationRaw.id;
        break;
      case 6: 
        destinationId = "mapSVG-" + main.currentMap + "_oneway" + destinationRaw.id;
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
    let meatyBits = getCurrentMapElement("mainMeat").children;
    
    for (let j = 0; j < meatyBits.length; j++) {
      let child = meatyBits[j];
      let childCoords = getCurrentCoordsOfNode(child);
      if (earlierCoords[0] < childCoords[0] && childCoords[0] < laterCoords[0]) {
        // now in an area between the source and the destination columns
        if (childCoords[1] > maxHeight) {
          maxHeight = childCoords[1]; //TODO: what if there are sibling paths underneath the intended cousins?
        }
      }
    }
    
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
    
    // and now make the graphics
    
    centerCursorOnElement(elementId);
    for (let j = 0; j < sourceDrop; j++) {
      insertPathLine("d");
      shiftCursor(0, 1);
      insertPathLine("u");
    }
    insertJunctionDot();
    centerCursorOnElement(destinationId);
    for (let j = 0; j < destDrop; j++) {
      insertPathLine("d");
      shiftCursor(0, 1);
      insertPathLine("u");
    }
    insertJunctionDot();
    for (let j = 0; j < diffRun; j++) {
      if (flipped) {
        insertPathLine("r");
        shiftCursor(1, 0);
        insertPathLine("l");
      } else {
        insertPathLine("l");
        shiftCursor(-1, 0);
        insertPathLine("r");
      }
    }
    
    // reset cursor to original position
    centerCursorOnElement(elementId);
  }

  function attemptVines(elementId, node) {
    for (let i = 0; mapVines[main.currentMap - 1] && i < mapVines[main.currentMap - 1].length; i++) {
      let clusterDests = [];
      if (mapVines[main.currentMap - 1][i].includes(node.id)) {
        clusterDests = mapVines[main.currentMap - 1][i].filter(n => n !== node.id);
      }
      
      if (clusterDests.length === 0) {
        // bad data capture
        continue;
      }
      
      for (let k = 0; k < clusterDests.length; k++) {
        
        //TODO: refactor to take all vine ends into account
        
        let destinationRaw = findNodeById(clusterDests[k]);
        
        if (destinationRaw === null || destinationRaw.type === 0) {
          continue;
        }
        
        if (isAncestorTo(destinationRaw.id, node.id)) {
          //console.log("attempting to vine with ancestor!");
          //TODO: make room for the new connection
        } else {
          //console.log("attempting to vine with cousin!");
          // continue with this one
          createCousinVine(elementId, destinationRaw);
        }
      }
    }
  }

  function animateChildren(elementId, node, accumulator) {
    centerCursorOnElement(elementId);
    expandViewbox();
    
    if (node.children.length === 0) {
      accumulator.val = 1;
      return;
    }
    if (node.parentId === -1) {
      insertPathLine("r");
      shiftCursor(1, 0);
      insertPathLine("l");
    } else {
      insertPathLine("d");
      shiftCursor(0, 1);
      insertPathLine("u");
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
            insertPathLine("r");
            shiftCursor(1, 0);
            insertPathLine("l");
          }
        }
        insertJunctionDot();
        insertPathLine("d");
        shiftCursor(0, 1);
        insertPathLine("u");
        // TODO: get drop height based on pickup type, for lock types
      } else if (node.parentId === -1) {
        insertJunctionDot();
        insertPathLine("d");
        shiftCursor(0, 1);
        insertPathLine("u");
      }
      let newNode = makeNode(child); ///HERE
      
      // recursion
      //if (child.type !== nodeType.lock || child.isUnlocked) {
        let nChildren = {
          val: 1
        };
        animateChildren(newNode.id, child, nChildren);
        attemptVines(newNode.id, child);
        prevAccumulator = nChildren;
        accumulator.val += nChildren.val - 1;
      //}
      
      shiftCursor(0, -1);
      if (node.children.length === 1) {
        shiftCursor(0, -1);
      }
    }
    
    centerCursorOnElement(elementId);
  }

  function removeHover(e) {
    //console.log("hover ended!");
    let me = e.target;
    let children = me.childNodes;
    
    for (let i = 0; i < children.length; i++) {
      if (children[i].classList.contains("node-hover-overlay")) {
        children[i].classList.remove("show");
      }
    }
  }

  function hoverRoot(e) {
    //console.log("root was hovered!");
    let me = e.target;
    let children = me.childNodes;
    
    for (let i = 0; i < children.length; i++) {
      if (children[i].classList.contains("node-hover-overlay")) {
        children[i].classList.add("show");
      }
    }
  }

  function hoverElevator(e) {
    //console.log("elevator was hovered!");
    let me = e.target;
    let children = me.childNodes;
    
    for (let i = 0; i < children.length; i++) {
      if (children[i].classList.contains("node-hover-overlay")) {
        children[i].classList.add("show");
      }
    }
  }

  function hoverElevator2(e) {
    //console.log("elevator2 was hovered!");
    let me = e.target;
    let children = me.childNodes;
    
    for (let i = 0; i < children.length; i++) {
      if (children[i].classList.contains("node-hover-overlay")) {
        children[i].classList.add("show");
      }
    }
  }

  function hoverBoss(e) {
    //console.log("boss was hovered!");
    let me = e.target;
    let children = me.childNodes;
    
    for (let i = 0; i < children.length; i++) {
      if (children[i].classList.contains("node-hover-overlay")) {
        children[i].classList.add("show");
      }
    }
  }

  function hoverLock(e) {
    //console.log("lock was hovered!");
    let me = e.target;
    let children = me.childNodes;
    
    for (let i = 0; i < children.length; i++) {
      if (children[i].classList.contains("node-hover-overlay")) {
        children[i].classList.add("show");
      }
    }
  }

  function hoverKey(e) {
    //console.log("Key was hovered!");
    let me = e.target;
    let children = me.childNodes;
    
    for (let i = 0; i < children.length; i++) {
      if (children[i].classList.contains("node-hover-overlay")) {
        children[i].classList.add("show");
      }
    }
  }

  function hoverUnreq(e) {
    //console.log("Unreq was hovered!");
    let me = e.target;
    let children = me.childNodes;
    
    for (let i = 0; i < children.length; i++) {
      if (children[i].classList.contains("node-hover-overlay")) {
        children[i].classList.add("show");
      }
    }
  }

  function hoverOther(e) {
    //console.log("Other was hovered!");
    let me = e.target;
    let children = me.childNodes;
    
    for (let i = 0; i < children.length; i++) {
      if (children[i].classList.contains("node-hover-overlay")) {
        children[i].classList.add("show");
      }
    }
  }

  function clickElevator(e) {
    //console.log("elevator was clicked!", e);
    let parent = e.target.parentElement;
    let str = parent.id.split("_")[1];
    let result = str.match(digitPattern);
    result = parseInt(result[0]);
    let retrievedNode = findNodeById(result);
    if (retrievedNode === null) {
      console.error("Could not find this elevator's data!");
      return;
    }
    let nextRoot = workingData.find(entry => entry.id === retrievedNode.pointsToElevatorId);
    if (nextRoot === undefined) {
      console.log("Next map not implemented");
      return;
    }
    console.log("would open map to", areaData[nextRoot.mapId].name);
    popMap(nextRoot.mapId);
  }

  function clickRoot(e) {
    let parent = e.target.parentElement;
    centerCursorOnElement(parent.id);
    
    let str = parent.id.split("_")[1];
    let result = str.match(digitPattern);
    result = parseInt(result[0]);
    let retrievedNode = findNodeById(result);
    
    if (retrievedNode === null) {
      console.error("Could not find this root!");
    } else if (!retrievedNode.expanded) {
      retrievedNode.expanded = true;
      animateChildren(parent.id, retrievedNode, { val: 1 });
    }
    
    if (retrievedNode.id !== mapRoots[0].id) {
      let destNode = workingData.find(entry => entry.id === retrievedNode.pointsToElevatorId);
      if (destNode === undefined) {
        console.log("Previous map not implemented, somehow");
      } else {
        console.log("would open map to", areaData[destNode.mapId].name);
        popMap(destNode.mapId);
      }
    }
  }

  function unlock(e) {
    return;
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
    }
  }
  
  function defeatBoss(e) {
    return;
    let parent = e.target.parentElement;
    
    let str = parent.id.split("_")[1];
    let result = str.match(digitPattern);
    result = parseInt(result[0]);
    let retrievedNode = findNodeById(result);
    
    if (retrievedNode === null) {
      console.error("Could not find this boss!");
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
    }
  }
  
  function assignKey(e) {
    return;
  }
  
  function collectKey(e) {
    return;
  }
  
  function save(e) {
    console.log(document.cookie);
    return;
  }
  
  //*************************************************************************************
  //****************************** CONDENSED DEPENDENCY *********************************
  //*************************************************************************************
  
  function circular() {
    const seen = new WeakSet();
    return (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return value.id;
        }
        seen.add(value);
      }
      return value;
    };
  }
  
  let treeClone = {};
  
  function recursionC(currentNode, predicate) {
    predicate(currentNode);
    for (let i = 0; i < currentNode.children.length; i++) {
      recursionC(currentNode.children[i], predicate);
    }
  }
  
  function newGetById(value) {
    let returnNode = null;
    
    recursionB(treeClone, currentNode => {
      if (currentNode.id === value) {
        returnNode = currentNode;
      }
    });
    
    return returnNode;
  }
  
  function makeDependencyTree() {
    treeClone = JSON.parse(JSON.stringify(mapRoots[0], circular()));
    let keysFound = [];
    //debugger;
    recursionC(treeClone, node => {
      let dest;
      if (node.type === nodeType.save || node.type === nodeType.other || ([3, 7].includes(node.pickupType) && node.type === nodeType.unreq)) {
        let childList = newGetById(node.parents[0]).children;
        for (let j = 0; j < childList.length; j++) {
          if (childList[j].id === node.id) {
            dest = j;
            break;
          }
        }
        for (let i = 0; i < node.children.length; i++) {
          node.children[i].parents[0] = node.parents[0];
        }
        newGetById(node.parents[0]).children.splice(dest, 1, ...node.children);
      } else if (node.type === nodeType.elevator) {
        //TODO: factor in elevators
      } else if (node.type === nodeType.key || node.type === nodeType.unreq) {
        
        if (keysFound.includes(node.pickupType) && node.type === nodeType.unreq) {
          
          let childList = newGetById(node.parents[0]).children;
          for (let j = 0; j < childList.length; j++) {
            if (childList[j].id === node.id) {
              dest = j;
              break;
            }
          }
          newGetById(node.parents[0]).children.splice(dest, 1, ...node.children);
          
        } else {
          if (!keysFound.includes(node.pickupType)) {
            keysFound.push(node.pickupType);
            let arrayOfLocks = [];
            recursionC(treeClone, n => {
              if (n.pickupType === node.pickupType && n.type === nodeType.lock) {
                arrayOfLocks.push(n);
              }
            });
            for (let i = 0; i < arrayOfLocks.length; i++) {
              for (let j = 0; j < arrayOfLocks.length; j++) {
                if (i === j) {
                  continue;
                }
                
                let ancestorCheck = false;
                let currentNode = arrayOfLocks[j];
                if (currentNode === null) {
                  ancestorCheck =  false;
                } else {
                  while (currentNode.id !== -1) {
                    
                    if (arrayOfLocks[i].id === currentNode.id) {
                      ancestorCheck = true;
                      break;
                    }
                    if (!currentNode.parents) {
                      // assume currentNode is the map root
                      // can't go further up
                      break;
                    }
                    currentNode = newGetById(currentNode.parents[0]);
                    //TODO: how to account for branching ancestors?
                  }
                }
                
                if (ancestorCheck) {
                  let childList = newGetById(arrayOfLocks[j].parents[0]).children;
                  for (let l = 0; l < childList.length; l++) {
                    if (childList[l].id === arrayOfLocks[j].id) {
                      dest = l;
                      break;
                    }
                  }
                  for (let k = 0; k < node.children.length; k++) {
                    node.children[k].parents[0] = node.parents[0];
                  }
                  newGetById(arrayOfLocks[j].parents[0]).children.splice(dest, 1, ...arrayOfLocks[j].children); // TODO: make sure this is correct?
                }
              }
            }
          }
        }
      }
    });
    
    let recurse = false;
    do {
      recurse = false;
      recursionC(treeClone, node => {
        if ((node.type === nodeType.lock || node.type === nodeType.oneway) && node.children.length === 0) {
          recurse = true;
          let dest = newGetById(node.parents[0]).children.indexOf(node);
          newGetById(node.parents[0]).children.splice(dest, 1);
        }
      });
    } while (recurse);
    
    //TODO: get item dependency lists of locks per key
    
    recursionC(treeClone, x => {
      console.log("" + " #" + x.id + ": " + x.textFill);
    });
  }

  //*************************************************************************************
  //************************************** FINALS ***************************************
  //*************************************************************************************

  function doNothing() {
    //console.log("nothing doing");
  }

  function expandViewbox() {
    let mapSearch = document.getElementById("mapSVG-" + main.currentMap);
    let str = mapSearch.attributes.viewBox.value;
    let result = str.match(digitPattern);
    let newStr = "" + result[0] + " " + result[1] + " ";
    if (parseInt(result[2]) < (getCursor().x + 144)) {
      newStr += (getCursor().x + 144 + 72);
    } else {
      newStr += result[2];
    }
    if (parseInt(result[3]) < (getCursor().y + 144)) {
      newStr += " " + (getCursor().y + 144 + 72);
    } else {
      newStr += " " + result[3];
    }
    mapSearch.attributes.viewBox.value = newStr;
  }
  
  function resizeCanvas() {
    let canvas = document.getElementById("background");
    if (canvas.width !== window.innerWidth){
      canvas.width = window.innerWidth;
    }

    if (canvas.height !== window.innerHeight){
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
    console.log("" + areaData[mapRoots[main.currentMap - 1].mapId].name + " #" + node.id + ": " + node.textFill);
  }
  
  function debugTree() {
    console.log("vine cluster:: total", mapVines);
    let saveMap = main.currentMap;
    for (let i = 0; i < numMapsReady; i++) {
      main.currentMap = i + 1;
      navigateTree(debugRecursion);
    }
    main.currentMap = saveMap;
    console.log("maps for", numMapsReady, "/", mapRoots.length, "areas ready");
  }

  function init() {
    main.currentGame = games.m; // TODO: swap games
    main.currentMap = 1;
    makeTree();
    
    moveCursor(0, 0);
    popMap(main.currentMap);
  }

  main.init = init;
  main.resizeCanvas = resizeCanvas;
  main.workingData = workingData;
  main.debugTree = debugTree;
  main.makeDependencyTree = makeDependencyTree;
})();