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

function debugRecursion(node) {
  console.log("Hello world #" + node.id + ": " + node.textFill);
}

function makeNode(currentNode) {
  let svgRoot = document.getElementById("playground");
  let shapeEnum = 0;
  let shapeObject = null;
  let groupObject = document.createElementNS("http://www.w3.org/2000/svg", "g");
  
  switch(currentNode.type) {
    case 1: 
    case 2: 
    case 3: 
      shapeEnum = iconType.circle;
      shapeObject = goal_template.cloneNode(true);
      groupObject.id = "goal" + currentNode.id;
      shapeObject.fill = "white"; // TODO: determine the coloration
      break;
    case 5: 
      shapeEnum = iconType.square;
      shapeObject = lock_template.cloneNode(true);
      groupObject.id = "lock" + currentNode.id;
      shapeObject.fill = "white"; //TODO: determine the coloration
      break;
    case 8: 
    case 9: 
      shapeEnum = iconType.rhombus;
      shapeObject = key_template.cloneNode(true);
      groupObject.id = "key" + currentNode.id;
      shapeObject.fill = "white"; //TODO: determine the coloration
      break;
    case 4: 
    case 7: 
    case 10: 
      shapeEnum = iconType.wedge;
      shapeObject = unreq_template.cloneNode(true);
      groupObject.id = "unreq" + currentNode.id;
      shapeObject.fill = "white"; //TODO: determine the coloration
      break;
    case 6: 
      shapeEnum = iconType.arrow_up; // TODO: determine direction
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
    groupObject.appendChild(textObject);
  }
  
  if (currentNode.image.length > 0) {
    // pull the right image from the repo
  }
  
  if (currentNode.textFill.length > 0 && currentNode.image.length > 0) {
    // do something to add both objects to the space
  }
  
  groupObject.setAttribute("transform", "translate(720 144)");
  
  svgRoot.appendChild(groupObject);
}

function init() {
  makeTree();
  navigateTree(debugRecursion);
  
  makeNode(root);
}

export default {
  init: init
};