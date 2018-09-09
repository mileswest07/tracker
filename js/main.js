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
  console.log("Hello world #" + node.id);
}

function makeNode(currentNode) {
  let svgRoot = document.getElementById("playground");
  let shapeEnum = 0;
  let shapeObject = null;
  
  switch(currentNode.type) {
    case 1: 
    case 2: 
    case 3: 
      shapeEnum = iconType.circle;
      shapeObject = svgRoot.createElement("circle");
      shapeObject.cx = 60;
      shapeObject.cy = 60;
      shapeObject.r = 60;
      shapeObject.stroke = "black";
      shapeObject.strokeWidth = 4;
      shapeObject.fill = "white"; // TODO: determine the coloration
      break;
    case 5: 
      shapeEnum = iconType.square;
      shapeObject = svgRoot.createElement("rect");
      shapeObject.rx = 12.5;
      shapeObject.ry = 12.5;
      shapeObject.width = 120;
      shapeObject.height = 120;
      shapeObject.stroke = "black";
      shapeObject.strokeWidth = 4;
      shapeObject.fill = "white"; //TODO: determine the coloration
      break;
    case 8: 
    case 9: 
      shapeEnum = iconType.rhombus;
      shapeObject = svgRoot.createElement("path");
      shapeObject.d = "M52.5 7.5 c 7.5 -7.5, 7.5 -7.5, 15 0 l 45 45 c 7.5 7.5, 7.5 7.5, 0 15 l -45 45 c -7.5 7.5, -7.5 7.5, -15 0 l -45 -45 c -7.5 -7.5, -7.5 -7.5, 0 -15 Z";
      shapeObject.stroke = "black";
      shapeObject.strokeWidth = 4;
      shapeObject.fill = "white"; //TODO: determine the coloration
      break;
    case 4: 
    case 7: 
    case 10: 
      shapeEnum = iconType.wedge;
      shapeObject = svgRoot.createElement("path");
      shapeObject.d = "M56.25 14.5 c 3.75 -6.5, 3.75 -6.5, 7.5 0 l 52.5 91 c 3.75 6.5, 3.75 6.5, -3.75 6.5 l -105 0 c -7.5 0, -7.5 0, -3.75 -6.5 Z";
      shapeObject.stroke = "black";
      shapeObject.strokeWidth = 4;
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
  
  svgRoot.appendChild(shapeObject);
}

function init() {
  makeTree();
  navigateTree(debugRecursion);
  
  //makeNode(root);
}

export default {
  init: init
};