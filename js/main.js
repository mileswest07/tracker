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

function listConnections(currentNode) {
  return workingData.filter(node => node.parentId === currentNode.id);
}

function recursionA(currentNode, mapNodes) {
  currentNode.children = listConnections(currentNode);
  for (let i = 0; i < currentNode.children.length; i++) {
    if (!currentNode.children[i].hasOwnProperty("parents")) {
      currentNode.children[i].parents = [];
    }
    currentNode.children[i].parents.push(currentNode);
    
    if (mapNodes[currentNode.children[i].id] === true) {
      // TODO: make vine
    } else {
      mapNodes[currentNode.children[i].id] = true;
      recursionA(currentNode.children[i], mapNodes);
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
      // TODO: determine direction
      //console.log("fails on", currentNode.id);
      shapeObject = arrow_up_template.cloneNode(true);
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
  
  if (currentNode.textFill.length > 0) {
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
    groupObject.setAttribute("transform", "translate(" + cursor.x + " "+ cursor.y + ")");
  }
  
  groupObject.addEventListener("mouseenter", hoverCapture);
  groupObject.addEventListener("mouseleave", removeHover);
  groupObject.addEventListener("click", clickCapture);
  
  mainMeat.appendChild(groupObject);
  
  return document.getElementById(groupObject.id);
}

function moveCursor(x, y) {
  cursor.x = (x + 1) * 144;
  cursor.y = (y + 1) * 144;
}

function shiftCursor(dx, dy) {
  cursor.x += dx * 144;
  cursor.y += dy * 144;
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
  let str = document.getElementById(elementId).attributes.transform.value;
  let pattern = /\d+/g;
  let result = str.match(pattern);
  moveCursor(parseInt(result[0]) / 144 - 1, parseInt(result[1]) / 144 - 1);
}

function insertJunctionDot(x, y) {
  let shapeObject = junction_template.cloneNode(true);
  shapeObject.removeAttribute("id");
  shapeObject.removeAttribute("transform");
  if (x && y) {
    shapeObject.setAttribute("transform", "translate(" + x + " "+ y + ")");
  } else {
    shapeObject.setAttribute("transform", "translate(" + cursor.x + " "+ cursor.y + ")");
  }
  
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
  if (x && y) {
    copy.setAttribute("transform", "translate(" + x + " "+ y + ")");
  } else {
    copy.setAttribute("transform", "translate(" + cursor.x + " "+ cursor.y + ")");
  }
  
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
  console.log(parentElement);
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

function ancestorsMakeRoom(node, source, accumulator) {
  let shiftValue = node.children.length - 1;
  if (node.id === root.id) {
    return;
  }
  for (let i = 0; i < node.children.length; i++) {
    let child = node.children[i];
    if (node === child) {
      accumulator += shiftValue;
      if (i < (node.parents[0].children.length - 1)) {
        /// TODO: grab all elements to the right of this column
        // move group right (accumulator) units
        // center cursor to (node)
        // draw line right (accumulator) units
      }
      ancestorsMakeRoom(node.parents[0], source, accumulator);
    }
  }
}

function expandViewbox() {
  let str = playground.attributes.viewBox.value;
  let pattern = /\d+/g;
  let result = str.match(pattern);
  let newStr = "" + result[0] + " " + result[1] + " ";
  if (parseInt(result[2]) < (cursor.x + 144)) {
    newStr += (cursor.x + 144 + 72);
  } else {
    newStr += result[2];
  }
  if (parseInt(result[3]) < (cursor.y + 144)) {
    newStr += " " + (cursor.y + 144+ 72);
  } else {
    newStr += " " + result[3];
  }
  playground.attributes.viewBox.value = newStr;
}

function animateChildren(elementId, node, accumulator) {
  centerCursorOnElement(elementId);
  expandViewbox();
  
  if (node.children.length === 0) {
    accumulator.val = 1;
    return;
  }
  //ancestorsMakeRoom(node, node. 0);
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
    //if (child.type !== nodeType.lock) {
      let nChildren = {
        val: 1
      };
      animateChildren(newNode.id, child, nChildren);
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

function clickRoot(e) {
  let parent = e.originalTarget.parentElement;
  centerCursorOnElement(parent.id);
  
  let str = parent.id;
  let pattern = /\d+/g;
  let result = str.match(pattern);
  result = parseInt(result[0]);
  let retrievedNode = findNodeByProp("id", result);
  
  if (parent.attributes.expanded === "true") {
    //console.log("already expanded!");
  } else {
    //console.log("expanding now!");
    animateChildren(parent.id, retrievedNode, { val: 1 });
  }
  
  parent.attributes.expanded = "true";
  
  //console.log(retrievedNode.children);
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