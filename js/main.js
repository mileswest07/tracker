let main = {};

(function() {
  let root = null;
  let workingData = rawData;
  let mapRoots = [];
  let numMapsReady = 5;
  let digitPattern = /\d+/g;
  let numGradsAlready = 0;
  
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
      mapSearch.setAttribute("id", "mapSVG-" + main.currentMap);
      mapSearch.setAttribute("class", "map-svg");
      mapSearch.setAttribute("width", "100%");
      mapSearch.setAttribute("height", "100%");
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
      let newNode = makeNode(mapRoots[main.currentMap - 1], 0, 0);
      if (main.currentMap !== 1) { // for anything besides the starting map, to make sure the START node will have interactivity
        mapRoots[main.currentMap - 1].expanded = true; // for all non-first maps, expand the map
        animateChildren(newNode.id, mapRoots[main.currentMap - 1], { val: 1 }); // and display all nodes as possible
      }
    } else { // if map has already been created
      // move next map to front
      showMap(main.currentMap);
    }
    // with the map shown, reset cursor to the root/starting node
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

  // obtain list of all children to current node
  function listConnections(currentNode) {
    return workingData.filter(node => node.parentId === currentNode.id);
  }

  // for each node in the map
  function recursionA(currentNode, mapNodes) {
    if (!currentNode.hasOwnProperty("children")) {
      currentNode.children = []; // create children list for each node
    }
    let candidates = listConnections(currentNode); // obtain all children to current node
    // cycle through all children
    for (let i = 0; i < candidates.length; i++) {
      if (!candidates[i].hasOwnProperty("parents")) {
        candidates[i].parents = []; // allow children to have multiple parents for multiple paths
      }
      candidates[i].parents.push(currentNode); // add current node to child's parent list
      
      // for cases when a connection needs to be made to another part of the map without children to create that connection
      if (candidates[i].cousinsTo && Array.isArray(candidates[i].cousinsTo) && candidates[i].cousinsTo.length > 0) {
        if (!(mapVines[currentNode.mapId - 1] && Array.isArray(mapVines[currentNode.mapId - 1]) && mapVines[currentNode.mapId - 1].length > 0)) {
          mapVines[currentNode.mapId - 1] = []; // create a "vine" connection
        }
        let newArray = [candidates[i].id, ...candidates[i].cousinsTo]; // create vine connecting current child to its cousins, by node ID
        let newerArray = newArray.sort(); // sort by ID, earliest first
        
        // search to make sure new vine is not a duplicate
        let notFound = true; // flag for determining duplication
        for (let j = 0; j < mapVines[currentNode.mapId - 1].length; j++) {
          let cluster = mapVines[currentNode.mapId - 1][j];
          if (cluster.length !== newerArray.length) { // if vines are not the same length, ignore it and move to the next; can't be duplicate
            continue;
          }
          // if we get here, then we found a potential match just based on the length of the vine
          let lengthMatches = 0; // counter for matching IDs in that vine
          for (let k = 0; k < cluster.length; k++) {
            if (cluster[k] === newerArray[k]) { // matching IDs
              lengthMatches++; // if there's an ID match, then increase the counter
            }
          }
          if (lengthMatches === newerArray.length) { // if the counter of correct matches matches the whole length of the vine, then it's a verified duplicate
            notFound = false;
          }
          // otherwise it's not a match, ignore and move to the next possible vine
        }
        if (notFound) { // if after all that, the would-be vine is not a duplicate, then add it to the array of vines, for good
          mapVines[currentNode.mapId - 1].push(newerArray);
        }
      }
      
      // now add this node to the list of checked-off map nodes, to prevent infinite or loop recursion
      if (mapNodes[candidates[i].id] !== true) {
        currentNode.children.push(candidates[i]); // add child to the parent's list of children
        mapNodes[candidates[i].id] = true; // add to checklist
        recursionA(candidates[i], mapNodes); // move to first child and repeat this function
        // based on this motion, all firstborn children (going down all generations) get processed first, before the last generations's firstborn passes the torch to its sibling.
        // Once all siblings of a generation are complete, then the torch is passed back to the parent, and its next sibling is processed.
      }
    }
  }

  function makeTree() {
    // get all starting points for each map
    mapRoots = workingData.filter(node => node.type === nodeType.start);
    root = mapRoots[0]; // grab starting map as root of all maps
    
    for (let i = 0; i < mapRoots.length; i++) {
      let mapNodes = {}; // checklist for each node in the game
      let currentNode = mapRoots[i]; // start at map node
      recursionA(currentNode, mapNodes); // cycle through for each node starting at map node
    }
    console.log(mapRoots);
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
    if (main.goRandom && [7, 8].includes(currentNode.type)) {
      currentNode.type = 9;
    }
    
    // do different things based on the node type
    switch(currentNode.type) {
      case 1: // starting node
      case 14: // another node, "other" but circle
        groupObject.id += "goal" + currentNode.id; // add specific data about node to ID
        shapeObject = goal_template.cloneNode(true); // circle
        hoverShape = goal_template.cloneNode(true); // circle
        imageClass = ""; // no image needed, so no special effects needed
        if (currentNode.type === 1) { // starting point
          hoverCapture = hoverRoot; // assign hover method
          clickCapture = clickRoot; // assign click method
          if (root.id !== currentNode.id) { // if this isn't the root of all maps
            titleText = areaData[workingData.find(n => n.id === currentNode.pointsToElevatorId).mapId].name.toUpperCase(); // display destination name
          } else {
            titleText = "START"; // standard title text
          }
        } else {
          hoverCapture = doNothing; // assign hover method
          clickCapture = doNothing; // assign click method
        }
        break;
      case 13: // ending node
        groupObject.id += "end" + currentNode.id; // add specific data about node to ID
        shapeObject = end_template.cloneNode(true); // circle
        hoverShape = end_template.cloneNode(true); // circles
        imageClass = ""; // no image needed, so no special effects needed
        hoverCapture = doNothing; // assign hover method
        clickCapture = doNothing; // assign click method
        titleText = "END"; // standard title text
        break;
      case 2: // elevator access
        groupObject.id += "goal" + currentNode.id; // add specific data about node to ID
        shapeObject = goal_template.cloneNode(true); // circle
        hoverShape = goal_template.cloneNode(true); // circle
        imageClass = ""; // no image needed, so no special effects needed
        hoverCapture = hoverElevator; // assign hover method
        clickCapture = clickElevator; // assign click method
        // if not yet implemented
        if (currentNode.pointsToElevatorId !== -1) {
          console.log(currentNode);
          titleText = areaData[workingData.find(n => n.id === currentNode.pointsToElevatorId).mapId].name.toUpperCase(); // display destination name
          fillColor = "#" + areaData[workingData.find(n => n.id === currentNode.pointsToElevatorId).mapId].color; // get color of target elevator
        }// otherwise, fall back onto the data-given label
        break;
      case 3: // boss battle
        groupObject.id += "goal" + currentNode.id; // add specific data about node to ID
        shapeObject = goal_template.cloneNode(true); // circle
        hoverShape = goal_template.cloneNode(true); // circle
        imageClass = "boss-image"; // image might be needed; if so, no filters to be applied
        fillColor = "#" + objColors.boss; // default boss/battle color
        hoverCapture = hoverBoss; // assign hover method
        clickCapture = defeatBoss; // assign click method
        break;
      case 5: // lock
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
        hoverCapture = hoverLock; // assign hover method
        clickCapture = unlock; // assign click method
        break;
      case 12: // access
        groupObject.id += "access" + currentNode.id; // add specific data about node to ID
        shapeObject = access_template.cloneNode(true); // hexagon
        hoverShape = access_template.cloneNode(true); // hexagon
        imageClass = "lock-image"; // apply MULTIPLY
        fillColor = "#"+ objColors[pickupType[currentNode.pickupType]]; // grab the background color
        groupObject.setAttribute("isUnlocked", "false"); // make sure the rest of the map doesn't display, yet
        hoverCapture = hoverLock; // assign hover method
        clickCapture = unlock; // assign click method
        break;
      case 8: // required key
        groupObject.id += "unclaimed-key" + currentNode.id; // add specific data about node to ID
        shapeObject = key_template.cloneNode(true); // diamond
        hoverShape = key_template.cloneNode(true); // diamond
        imageClass = "key-image"; // apply SCREEN
        fillColor = "#"+ objColors[pickupType[currentNode.pickupType]]; // grab the background color
        hoverCapture = hoverKey; // assign hover method
        clickCapture = assignKey; // assign click method
        break;
      case 9: // required key (blank)
        groupObject.id += "unclaimed-key" + currentNode.id; // add specific data about node to ID
        shapeObject = key_template.cloneNode(true); // diamond
        hoverShape = key_template.cloneNode(true); // diamond
        imageClass = "blank-key"; // needs to be visible, so don't apply anything
        hoverCapture = hoverKey; // assign hover method
        clickCapture = assignKey; // assign click method
        break;
      case 4: // save room
      case 7: // unrequired key
      case 10: // other node, "other" but wedge
        groupObject.id += "unreq" + currentNode.id; // add specific data about node to ID
        shapeObject = unreq_template.cloneNode(true); // wedge
        hoverShape = unreq_template.cloneNode(true); // wedge
        imageClass = "key-image"; // apply SCREEN
        fillColor = "#"+ objColors[pickupType[currentNode.pickupType]]; // grab the background color
        // non-item nodes like save rooms and maps, display as on a white background
        if (currentNode.type === 4) { // save room
          hoverCapture = hoverSave; // assign hover method
          clickCapture = save; // assign click method
        } else if (currentNode.type === 7) { // unrequired key
          hoverCapture = hoverUnreq; // assign hover method
          clickCapture = collectKey; // assign click method
        } else { // other node
          hoverCapture = doNothing; // assign hover method
          clickCapture = doNothing; // assign click method
        }
        break;
      case 11: // slot node
        groupObject.id += "slot" + currentNode.id; // add specific data about node to ID
        shapeObject = slot_template.cloneNode(true); // pentagon
        hoverShape = slot_template.cloneNode(true); // pentagon
        imageClass = "key-image"; // apply SCREEN
        fillColor = "#"+ objColors[pickupType[currentNode.pickupType]]; // grab the background color
        hoverCapture = hoverKey; // assign hover method
        clickCapture = assignKey; // assign click method
        break;
      case 6: // one-way arrow
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
        fillColor = "#"+ areaData[currentNode.mapId].color; // get color of this map
        hoverCapture = hoverOther; // assign hover method
        clickCapture = doNothing; // assign click method
        break;
      case 0:
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
    // if we already have the text populated
    // or the text has yet to be populated
    // or we have to mark that a certain number of keys are needed
    // so long as the current node is not an arrow (we're ignoring this value because of directions)
    if (titleText.length !== 0 || (currentNode.textFill.length > 0 || (currentNode.numReqd > 1)) && currentNode.type !== 6) {
      textObject = document.createElementNS("http://www.w3.org/2000/svg", "text");
      textObject.classList.add("text-node");
      // TODO: variable text length, both based on rawData input options, and dynamic textarea filling from the SVG library
      textObject.setAttribute("x", "0");
      textObject.setAttribute("y", "9"); // slight vertical offset
      textObject.setAttribute("fill", "black");
      textObject.setAttribute("text-anchor", "middle"); // centered
      
      if (titleText.length !== 0) { // if we already have text set, based on earlier code
        textObject.innerHTML = titleText;
      } else if (currentNode.numReqd > 1 && (currentNode.type === 5 || currentNode.type === 12)) { // display required value
        textObject.classList.add("required-text"); // apply the right style
        textObject.innerHTML = "Required: " + currentNode.numReqd;
      } else if (currentNode.numReqd > 1) { // display required value
        textObject.classList.add("required-text"); // apply the right style
        textObject.setAttribute("y", "0"); // no vertical offset
        textObject.innerHTML = "x" + currentNode.numReqd;
      } else if (currentNode.type === 4) { // for save rooms, just display the giant S
        textObject.classList.add("save-text"); // apply the right style
        textObject.setAttribute("y", "0"); // no vertical offset
        textObject.innerHTML = "S";
      } else {
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
      if ([7, 8].includes(currentNode.type)) { // for keys
        textObject.setAttribute("fill", "white");
      } else { // this should apply for all other shape types
        textObject.setAttribute("fill", "black");
      }
      imageObject.setAttribute("y", "-48"); // offset image to be higher
      textObject.setAttribute("y", "29"); // offset text to be lower
      groupObject.appendChild(imageObject); // then add to the group
      groupObject.appendChild(textObject); // in the right order
    } else if (imageObject) { // no text, just apply image with current offset
      groupObject.appendChild(imageObject);
    } else if (textObject) { // no image, just apply text with current offset
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
    // for every key, required or otherwise, standard or slotted
    if (currentNode.textOuter.length !== 0 || currentNode.type === 7 || currentNode.type === 8 || currentNode.type === 11) {
      outerTextObject = document.createElementNS("http://www.w3.org/2000/svg", "text");
      outerTextObject.classList.add("text-node");
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
      outerStr = outerStr.split(" ");
      let rollingText = "";
      for (let u = 0; u < outerStr.length; u++) {
        rollingText += " " + outerStr[u];
        if (rollingText.length >= 5 || u + 1 === outerStr.length) {
          let tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
          tspan.setAttribute("x", "0");
          tspan.setAttribute("dy", "1.2em");
          tspan.textContent = rollingText;
          
          outerTextObject.appendChild(tspan);
          rollingText = "";
        }
      }
      
      groupObject.appendChild(outerTextObject);
    }
    
    // and now to place the group
    if (x && y) { // if we pass in a specific location, drop it there
      groupObject.setAttribute("transform", "translate(" + x + " "+ y + ")");
    } else { // otherwise, drop it wherever the cursor currently is
      groupObject.setAttribute("transform", "translate(" + getCursor().x + " "+ getCursor().y + ")");
    }
    
    groupObject.addEventListener("mouseenter", hoverCapture); // apply hovering method
    groupObject.addEventListener("mouseleave", removeHover); // and remove hovering effect
    groupObject.addEventListener("click", clickCapture); // apply clicking method
    
    // for each elevator that isn't a map root, we'll also include an arrow pointing south
    if (currentNode.type === 2 && currentNode.parent !== -1) {
      let escapeArrow = arrow_down_template.cloneNode(true); // copy a down arrow
      escapeArrow.removeAttribute("id"); // remove Id to prevent DOM troubles
      let arrowFill = areaData[currentNode.mapId].color; // use the map's color for the arrow
      let destination = workingData.find(n => n.id === currentNode.pointsToElevatorId); // find the destination node to grab the map data
      if (destination !== undefined) { // if we can find it, use that map's color
        arrowFill = areaData[destination.mapId].color;
      }
      escapeArrow.setAttribute("fill", "#"+ arrowFill); // apply the color
      let lastLine;
      if (x && y) {
        insertPathLine("d", x, y);
        lastLine = insertPathLine("u", x, (y + 144));
      } else {
        insertPathLine("d", getCursor().x, getCursor().y);
        lastLine = insertPathLine("u", getCursor().x, (getCursor().y + 144));
      }
      escapeArrow.setAttribute("transform", "translate(0 144)"); // place some distance south of the elevator
      // color last line according to new map color
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

  // move the cursor to certain coordinates, multiplied by the pixel factor
  function moveCursor(x, y) {
    getCursor().x = (x + 1) * 144; // offset by 1 to allow for margins in the upper left
    getCursor().y = (y + 1) * 144;
  }

  // instead of dropping the cursor, this is a relative move based on its current position
  function shiftCursor(dx, dy) {
    getCursor().x += dx * 144;
    getCursor().y += dy * 144;
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

  function getCursor() {
    return cursor;
  }

  // move cursor to this location
  function centerCursorOnElement(elementId) {
    let coords = getCurrentCoordsOfNodeById(elementId);
    moveCursor(((coords[0] / 144) - 1), ((coords[1] / 144) - 1));
  }

  function insertJunctionDot(x, y) {
    let shapeObject = junction_template.cloneNode(true);
    shapeObject.removeAttribute("id"); // strip away Id to prevent DOM problems
    if (x && y) { // remote drop
      shapeObject.setAttribute("transform", "translate(" + x + " " + y + ")");
    } else { // drop "here"
      shapeObject.setAttribute("transform", "translate(" + getCursor().x + " " + getCursor().y + ")");
    }
    shapeObject.setAttribute("fill", "#" + areaData[mapRoots[main.currentMap - 1].mapId].color); // color fill
    
    getCurrentMapElement("junctions").appendChild(shapeObject); // drop into the correct layer
    
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
    copy.children[0].setAttribute("fill", "#" + areaData[mapRoots[main.currentMap - 1].mapId].color);
    
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
    let destinationId = "mapSVG-" + main.currentMap;
    
    switch (destinationRaw.type) {
      case 3: 
      case 2: 
      case 1: 
        destinationId += "_goal" + destinationRaw.id;
        break;
      case 5: 
        destinationId += "_lock" + destinationRaw.id;
        break;
      case 8: 
        break;
        destinationId += "_key" + destinationRaw.id;
      case 9: 
        destinationId += "_unclaimed-key" + destinationRaw.id;
        break;
      case 4: 
      case 7: 
      case 10: 
        destinationId += "_unreq" + destinationRaw.id;
        break;
      case 6: 
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
    
    // TODO: drop all children between source and destination the appropriate height
    
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

  function hoverSave(e) {
    //console.log("Save was hovered!");
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
    if (dataNode.id !== mapRoots[0].id) {
      let destNode = workingData.find(entry => entry.id === dataNode.pointsToElevatorId); // first, let's see if we can find the raw data that this is supposed to connect to
      if (destNode === undefined) { // if we cannot, then we are missing a parent map (or pointsToElevatorId points to a map that isn't existent)
        console.log("Previous map not implemented, somehow");
      } else {
        console.log("would open map to", areaData[destNode.mapId].name); // if we found the data, then consoleout the intended map name
        popMap(destNode.mapId); // and then display the map panel
      }
    }
  }

  function unlock(e) {
    return; // NOT CURRENTLY IMPLEMENTED
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
      console.log("" + " #" + x.id + ": " + x.textOuter);
    });
  }

  //*************************************************************************************
  //************************************** FINALS ***************************************
  //*************************************************************************************

  function doNothing() {
    //console.log("nothing doing");
  }

  function expandViewbox() {
    let mapSearch = document.getElementById("mapSVG-" + main.currentMap); // for whatever the currently-displayed map
    let str = mapSearch.attributes.viewBox.value;
    let result = str.match(digitPattern);
    let newStr = "" + result[0] + " " + result[1] + " ";
    if (parseInt(result[2]) < (getCursor().x + 144)) { // if currently at the edge of the map
      newStr += (getCursor().x + 144 + 72); // if needed, expand with a margin
    } else {
      newStr += result[2];
    }
    if (parseInt(result[3]) < (getCursor().y + 144)) { // if currently at the edge of the map
      newStr += " " + (getCursor().y + 144 + 72); // if needed, expand with a margin
    } else {
      newStr += " " + result[3];
    }
    mapSearch.attributes.viewBox.value = newStr; // now apply the reformed string
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
    console.log("" + areaData[mapRoots[main.currentMap - 1].mapId].name + " #" + node.id + ": " + node.textOuter);
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
    main.currentGame = games.m; // TODO: swap games when HUD is made
    main.currentMap = 1; // start at map 1 no matter which game is selected
    main.goRandom = false; // TODO: select whether vanilla or randomized
    main.allowColors = true; // TODO; colorblind option
    makeTree(); // construct data tree
    // at this point, the data tree should be complete, with vine data on the side. No visuals have been processed yet.
    
    moveCursor(0, 0); // a behind-the-scenes pointer set to the origin point of the chart (where the START node is)
    popMap(main.currentMap); // display map 1
  }

  main.init = init;
  main.resizeCanvas = resizeCanvas;
  main.workingData = workingData;
  main.debugTree = debugTree;
  main.makeDependencyTree = makeDependencyTree;
})();