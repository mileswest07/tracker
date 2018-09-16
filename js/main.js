import iconType from "./iconType.js";
import pickupType from "./pickupType.js";
import objColors from "./objColors.js";
import nodeType from "./nodeType.js";
import areaData from "./areaData.js";

import rawData from "./rawData.js";

let root = null;
let workingData = rawData;

function listConnections(currentNode) {
  return workingData.filter(node => node.parentId === currentNode.id);
}

function recursionA(currentNode, mapNodes) {
  currentNode.children = listConnections(currentNode);
  for (let i = 0; i < currentNode.children.length; i++) {
    if (mapNodes[currentNode.children[i].id] === true) {
      
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
  console.log("Hello world #" + node.id + ": " + node.textFill);
}

function makeNode(currentNode, x, y) {
  let svgRoot = document.getElementById("playground");
  let shapeEnum = 0;
  let shapeObject = null;
  let groupObject = document.createElementNS("http://www.w3.org/2000/svg", "g");
  let imageClass = null;
  let fillColor = "white";
  
  console.log(objColors);
  console.log(pickupType);
  console.log(currentNode.pickupType);
  
  if (currentNode.pickupType) {
    console.log(pickupType[currentNode.pickupType]);
    console.log(objColors[pickupType[currentNode.pickupType]]);
  }
  
  switch(currentNode.type) {
    case 3: 
      fillColor = objColors.boss;
      imageClass = "boss-image";
    case 2: 
      fillColor = objColors.elevator;
    case 1: 
      imageClass = imageClass.length > 0 ? imageClass : "lock-image";
      shapeObject = goal_template.cloneNode(true);
      groupObject.id = "goal" + currentNode.id;
      shapeObject.removeAttribute("fill");
      shapeObject.setAttribute("fill", "white");
      break;
    case 5: 
      shapeObject = lock_template.cloneNode(true);
      groupObject.id = "lock" + currentNode.id;
      shapeObject.removeAttribute("fill");
      shapeObject.setAttribute("fill", "#"+ objColors[pickupType[currentNode.pickupType]]);
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
      shapeObject = svgRoot.createElement("div");
      break;
    case 0: 
    default: 
      shapeEnum = iconType.none;
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
    imageObject.setAttribute("width", "38");
    imageObject.setAttribute("height", "38");
  }
  
  if (textObject && imageObject) {
    // do something to add both objects to the space
  } else if (textObject) {
    groupObject.appendChild(textObject);
  } else if (imageObject) {
    groupObject.appendChild(imageObject);
  } else {
    //something has gone wrong
  }
  
  groupObject.setAttribute("transform", "translate(" + x + " "+ y + ")");
  
  svgRoot.appendChild(groupObject);
}

function init() {
  makeTree();
  navigateTree(debugRecursion);
  
  makeNode(root, 720, 144);
  let testMorphBall = findNodeByProp("id", 4);
  makeNode(testMorphBall, 720, 288);
}

export default {
  init: init
};