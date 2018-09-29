import iconType from "./iconType.js";
import pickupType from "./pickupType.js";
import objColors from "./objColors.js";
import nodeType from "./nodeType.js";
import areaData from "./areaData.js";

import rawData from "./rawData.js";

let root = null;
let workingData = rawData;

let cursor = {
  x: 0,
  y: 0
};

let mapVines = [];

function listConnections(currentNode) {
  return workingData.filter(node => ((node.parentId === currentNode.id) || (node.parentId.length && node.parentId.find(input => input === currentNode.id) !== undefined)));
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
    
    if (mapNodes[candidates[i].id] === true) {
      mapVines.push([candidates[i].id, currentNode.id]);
    } else {
      currentNode.children.push(candidates[i]);
      mapNodes[candidates[i].id] = true;
      recursionA(candidates[i], mapNodes);
    }
  }
}

function makeTree() {
  root = workingData.find(node => node.type === nodeType.start)
  
  let mapNodes = {};
  let currentNode = root;
  recursionA(currentNode, mapNodes);
}

function recursionB(currentNode, predicate) {
  predicate(currentNode); {
    for (let i = 0; i < currentNode.children.length; i++) {
      recursionB(currentNode.children[i], predicate);
    }
  }
}

function navigateTree(predicate) {
  recursionB(root, predicate);
}

function findNodeByProp(property, value) {
  var returnNode = null;
  
  navigateTree(currentNode => {
    if (currentNode[property] === value) {
      returnNode = currentNode;
    }
  });
  
  return returnNode;
}

function debugRecursion(node) {
  //console.log("Hello world #" + node.id + ": " + node.textFill);
}

function makeNode(currentNode, x, y) {
  let svgRoot = document.getElementById("playground");
  let shapeEnum = 0;
  let shapeObject = null;
  let groupObject = document.createElementNS("http://www.w3.org/2000/svg", "g");
  let imageClass = null;
  let fillColor = "white";
  let titleText = ""; // todo: apply property to each category
  
  let hoverCapture = doNothing;
  let clickCapture = doNothing;
  
  switch(currentNode.type) {
    case 3: 
      //fillColor = "#" + objColors.boss;
      //imageClass = "boss-image";
    case 2: 
      //fillColor = "#" + objColors.elevator;
    case 1: 
      imageClass = (imageClass !== null && imageClass.length > 0) ? imageClass : "lock-image";
      shapeObject = goal_template.cloneNode(true);
      groupObject.id = "goal" + currentNode.id;
      shapeObject.removeAttribute("fill");
      shapeObject.setAttribute("fill", fillColor);
      break;
    case 5: 
      shapeObject = lock_template.cloneNode(true);
      groupObject.id = "lock" + currentNode.id;
      shapeObject.removeAttribute("fill");
      shapeObject.setAttribute("fill", "#"+ objColors[pickupType[currentNode.pickupType]]);
      if (currentNode.pickupType === 11 || currentNode.pickupType === 12) {
        shapeObject.setAttribute("fill", "#"+ objColors.boss);
      }
      
      imageClass = "lock-image";
      break;
    case 8: 
    case 9: 
      shapeObject = key_template.cloneNode(true);
      groupObject.id = "key" + currentNode.id;
      shapeObject.removeAttribute("fill");
      shapeObject.setAttribute("fill", "#"+ objColors[pickupType[currentNode.pickupType]]);
      imageClass = "key-image";
      break;
    case 4: 
    case 7: 
    case 10: 
      shapeObject = unreq_template.cloneNode(true);
      groupObject.id = "unreq" + currentNode.id;
      shapeObject.removeAttribute("fill");
      shapeObject.setAttribute("fill", "#"+ objColors[pickupType[currentNode.pickupType]]);
      imageClass = "key-image";
      break;
    case 6: 
      if (currentNode.textFill === "up") {
        shapeObject = arrow_up_template.cloneNode(true);
      } else if (currentNode.textFill === "down") {
        shapeObject = arrow_down_template.cloneNode(true);
      } else if (currentNode.textFill === "left") {
        shapeObject = arrow_left_template.cloneNode(true);
      } else {
        shapeObject = arrow_right_template.cloneNode(true);
      }
      groupObject.id = "oneway" + currentNode.id;
      shapeObject.removeAttribute("fill");
      shapeObject.setAttribute("fill", "#"+ areaData[currentNode.mapId].color);
      break;
    case 0: 
    default: 
      shapeEnum = iconType.none;
  }
  
  switch(currentNode.type) {
    case 0:
      break;
    case 1:
      hoverCapture = hoverRoot;
      clickCapture = clickRoot;
      break;
    case 2:
      break;
    case 3:
      break;
    case 4:
      break;
    case 5:
      clickCapture = unlock;
      groupObject.setAttribute("isUnlocked", "false");
      break;
    case 6:
      break;
    case 7:
      break;
    case 8:
      break;
    case 9:
      break;
    case 10:
      break;
  }
  
  shapeObject.removeAttribute("id");
  shapeObject.removeAttribute("transform");
  groupObject.appendChild(shapeObject);
  
  let textObject = null;
  
  if (currentNode.textFill.length > 0 && currentNode.type !== 6) {
    textObject = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textObject.classList.add("text-node");
    textObject.setAttribute("x", "0");
    textObject.setAttribute("y", "9");
    textObject.setAttribute("fill", "black");
    textObject.setAttribute("text-anchor", "middle");
    textObject.innerHTML = currentNode.textFill;
  }
  
  let imageObject = null;
  
  if (currentNode.image.length > 0) {
    // pull the right image from the repo
    imageObject = document.createElementNS("http://www.w3.org/2000/svg", "image");
    imageObject.classList.add(imageClass);
    imageObject.setAttribute("xlink:href", "images/icons/" + currentNode.image + ".png");
    imageObject.setAttribute("width", "42px");
    imageObject.setAttribute("height", "42px");
    imageObject.setAttribute("x", "-20");
    imageObject.setAttribute("y", "-20");
  }
  
  /* if (textObject && imageObject) {
    // do something to add both objects to the space
  } else */ if (imageObject) {
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
  
  mainMeat.appendChild(groupObject);
  
  if (currentNode.type === 2 && currentNode.parent !== -1) {
    let escapeArrow = arrow_down_template.cloneNode(true);
    escapeArrow.removeAttribute("id");
    escapeArrow.removeAttribute("fill");
    escapeArrow.setAttribute("fill", "#"+ areaData[currentNode.mapId].color);
    if (x && y) {
      insertPathLine("d", x, y);
      insertPathLine("u", x, (y + 144));
      escapeArrow.setAttribute("transform", "translate(" + x + " "+ (y + 144) + ")");
    } else {
      insertPathLine("d", getCursor().x, getCursor().y);
      insertPathLine("u", getCursor().x, (getCursor().y + 144));
      escapeArrow.setAttribute("transform", "translate(" + getCursor().x + " "+ (getCursor().y + 144) + ")");
    }
    mainMeat.appendChild(escapeArrow);
  }
  
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
  let pattern = /\d+/g;
  let result = str.match(pattern);
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
  nodeObj.removeAttribute("transform");
  nodeObj.setAttribute("transform", "translate(" + ((x + 1) * 144) + " " + ((y + 1) * 144) + ")");
}

function shiftNode(elementId, dx, dy) {
  let nodeObj = document.getElementById(elementId);
  let coords = getCurrentCoordsOfNodeById(elementId);
  nodeObj.removeAttribute("transform");
  nodeObj.setAttribute("transform", "translate(" + (coords[0] + (dx * 144)) + " " + (coords[1] + (dy * 144)) + ")");
}

function getCursor() {
  return cursor;
}

function removeHover(e) {
  //console.log("hover ended!");
}

function hoverRoot(e) {
  //console.log("root was hovered!");
}

function centerCursorOnElement(elementId) {
  let coords = getCurrentCoordsOfNodeById(elementId);
  moveCursor(((coords[0] / 144) - 1), ((coords[1] / 144) - 1));
}

function insertJunctionDot(x, y) {
  let shapeObject = junction_template.cloneNode(true);
  shapeObject.removeAttribute("id");
  shapeObject.removeAttribute("transform");
  shapeObject.removeAttribute("fill");
  if (x && y) {
    shapeObject.setAttribute("transform", "translate(" + x + " " + y + ")");
  } else {
    shapeObject.setAttribute("transform", "translate(" + getCursor().x + " " + getCursor().y + ")");
  }
  shapeObject.setAttribute("fill", "#"+ areaData[root.mapId].color);
  
  junctions.appendChild(shapeObject);
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
  copy.removeAttribute("transform");
  copy.children[0].removeAttribute("fill");
  if (x && y) {
    copy.setAttribute("transform", "translate(" + x + " " + y + ")");
  } else {
    copy.setAttribute("transform", "translate(" + getCursor().x + " " + getCursor().y + ")");
  }
  copy.children[0].setAttribute("fill", "#"+ areaData[root.mapId].color);
  
  gridPaths.appendChild(copy);
}

function findElementOfLayerAtCoords(layer, x, y) {
  let returnValue = [];
  
  let childCollection = null;
  let parentElement = null;
  
  switch(layer) {
    case "grid":
      parentElement = gridPaths;
      break;
    case "junction":
      parentElement = junctions;
      break;
    case "node":
    default:
      parentElement = mainMeat;
  }
  childCollection = parentElement.children;
  
  let pattern = /\d+/g;
  
  for (let i = 0; i < childCollection.length; i++) {
    let child = childCollection[i];
    let str = child.attributes.transform.value;
    let result = str.match(pattern);
    
    if (parseInt(result[0]) === x && parseInt(result[1]) === y) {
      returnValue.push(child);
    }
  }
  
  return returnValue;
}

function ancestorsMakeRoom(elementId, node, accumulator) {
  if (node.id === root.id) {
    return;
  }
  
  let coords = getCurrentCoordsOfNodeById(elementId);
  let toShiftArray = [];
  let toConnectArray = [];
  let collecs = [];
  let pattern = /\d+/g;
  collecs.push(gridPaths);
  collecs.push(junctions);
  collecs.push(mainMeat);
  
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
    let result = str.match(pattern);
    let childCoords = [];
    childCoords.push(parseInt(result[0]));
    childCoords.push(parseInt(result[1]));
    moveThis.removeAttribute("transform");
    moveThis.setAttribute("transform", "translate(" + (childCoords[0] + (accumulator.val * 144)) + " " + childCoords[1] + ")");
  }
  
  for (let i = 0; i < toConnectArray.length && accumulator.val > 0; i++) {
    let candidate = toConnectArray[i];
    if (candidate.classList.contains("path-right")) {
      let str = candidate.attributes.transform.value;
      let result = str.match(pattern);
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
      
      moveCursor(tempCursorSave.x, tempCursorSave.y);
    }
  }
}

function expandViewbox() {
  let str = playground.attributes.viewBox.value;
  let pattern = /\d+/g;
  let result = str.match(pattern);
  let newStr = "" + result[0] + " " + result[1] + " ";
  if (parseInt(result[2]) < (getCursor().x + 144)) {
    newStr += (getCursor().x + 144 + 72);
  } else {
    newStr += result[2];
  }
  if (parseInt(result[3]) < (getCursor().y + 144)) {
    newStr += " " + (getCursor().y + 144+ 72);
  } else {
    newStr += " " + result[3];
  }
  playground.attributes.viewBox.value = newStr;
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

function attemptVines(elementId, node) {
  let tempCursorSave = {};
  tempCursorSave.x = getCursor().x;
  tempCursorSave.y = getCursor().y;
  let pattern = /\d+/g;
  
  for (let i = 0; i < mapVines.length; i++) {
    if (node.id === mapVines[i][0] || node.id === mapVines[i][1]) {
      let destinationRaw = null;
      
      // attempt to see if the destination is showing
      if (node.id === mapVines[i][0]) {
        destinationRaw = findNodeByProp("id", mapVines[i][1]);
      } else {
        destinationRaw = findNodeByProp("id", mapVines[i][0]);
      }
      
      let destinationId = "";
      if (destinationRaw.type === 0) {
        break;
      }
      switch (destinationRaw.type) {
        case 3: 
        case 2: 
        case 1: 
          destinationId = "goal" + destinationRaw.id;
          break;
        case 5: 
          destinationId = "lock" + destinationRaw.id;
          break;
        case 8: 
        case 9: 
          destinationId = "key" + destinationRaw.id;
          break;
        case 4: 
        case 7: 
        case 10: 
          destinationId = "unreq" + destinationRaw.id;
          break;
        case 6: 
          destinationId = "oneway" + destinationRaw.id;
          break;
      }
      let attempt = document.getElementById(destinationId);
      
      if (attempt === null) {
        break;
      }
      
      // get tween height
      let source = document.getElementById(elementId);
      let dest = attempt;
      
      let str = source.attributes.transform.value;
      let result = str.match(pattern);
      let sourceCoords = [];
      sourceCoords.push(parseInt(result[0]));
      sourceCoords.push(parseInt(result[1]));
      str = dest.attributes.transform.value;
      result = str.match(pattern);
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
      
      for (let j = 0; j < mainMeat.length; j++) {
        let child = mainMeat[j];
        let childCoords = getCurrentCoordsOfNode(child);
        if (earlierCoords[0] < childCoords[0] && childCoords[0] < laterCoords[0]) {
          // now in an area between the source and the destination
          if (childCoords[1] > maxHeight) {
            maxHeight = childCoords[1];
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
    insertJunctionDot();
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
    }
    let newNode = makeNode(child); ///HERE
    
    // recursion
    if (child.type !== nodeType.lock || child.isUnlocked) {
      let nChildren = {
        val: 1
      };
      animateChildren(newNode.id, child, nChildren);
      attemptVines(newNode.id, child);
      prevAccumulator = nChildren;
      accumulator.val += nChildren.val - 1;
    }
    
    shiftCursor(0, -1);
    if (node.children.length === 1) {
      shiftCursor(0, -1);
    }
  }
  
  centerCursorOnElement(elementId);
}

function clickRoot(e) {
  let parent = e.originalTarget.parentElement;
  centerCursorOnElement(parent.id);
  
  let str = parent.id;
  let pattern = /\d+/g;
  let result = str.match(pattern);
  result = parseInt(result[0]);
  let retrievedNode = findNodeByProp("id", result);
  
  if (retrievedNode.expanded) {
    //console.log("already expanded!");
  } else {
    //console.log("expanding now!");
    retrievedNode.expanded = true;
    animateChildren(parent.id, retrievedNode, { val: 1 });
  }
}

function unlock(e) {
  let parent = e.originalTarget.parentElement;
  centerCursorOnElement(parent.id);
  
  let str = parent.id;
  let pattern = /\d+/g;
  let result = str.match(pattern);
  result = parseInt(result[0]);
  let retrievedNode = findNodeByProp("id", result);
  
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

function doNothing() {
  //console.log("nothing doing");
}

function init() {
  makeTree();
  navigateTree(debugRecursion);
  
  moveCursor(0, 0);
  makeNode(root);
}

export default {
  init: init
};