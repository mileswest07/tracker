let setup = {
  root: null,
  mapRoots: [],
  mapVines: [],
  mapRelatives: []
};

(function() {
  function sortingNumbers(a, b) {
    return a - b;
  }
  
  function sortingIds(a, b) {
    return a.id - b.id;
  }
  
  function sortingNodes(a, b) {
    let returnValue = 0;
    let compiledArray = [];
    let interimArray = [];
    let properOrder = [13, 1, 12, 5, 16, 15, 6, 3, 11, 8, 7, 9, 2, 4, 14, 10, 0];
    for (let i = 0; i < properOrder.length; i++) {
      interimArray[i] = [];
    }
    interimArray[a.type].push(a);
    
    // place 'relatives' all next to each other
    let relativesNotSelected = true;
    for (let i = 0; i < setup.mapRelatives.length; i++) {
      if (setup.mapRelatives[i].includes(a.id) && setup.mapRelatives[i].includes(b.id)) {
        //console.log('relatives found for', setup.mapRelatives[i]);
        interimArray[a.type].push(b);
        relativesNotSelected = false;
      } else if (setup.mapRelatives[i].includes(a.id)) {
        if (setup.mapRelatives[i].indexOf(a.id) !== 0) {
          return setup.mapRelatives[i][0] - b.id;
        } else {
          return setup.mapRelatives[i][1] - b.id;
        }
      } else if (setup.mapRelatives[i].includes(b.id)) {
        if (setup.mapRelatives[i].indexOf(b.id) !== 0) {
          return a.id - setup.mapRelatives[i][0];
        } else {
          return a.id - setup.mapRelatives[i][1];
        }
      }
    }
    if (relativesNotSelected) {
      interimArray[b.type].push(b);
    }
    
    interimArray[a.type].sort(sortingIds);
    if (a.type !== b.type) {
      interimArray[b.type].sort(sortingIds);
    }
    
    for (let i = 0; i < properOrder.length; i++) {
      compiledArray = [...compiledArray, ...interimArray[properOrder[i]]];
    }
    
    if (compiledArray[0].id === a.id) {
      returnValue = -1;
    } else {
      returnValue = 1;
    }
    
    return returnValue;
  }
  
  // obtain list of all children to current node
  function listConnections(currentNode) {
    return main.workingData.filter(node => node.parentId === currentNode.id);
  }
  
  // for each node in the map
  function recursionA(currentNode, mapNodes) {
    if (!currentNode.hasOwnProperty("children")) {
      currentNode.children = []; // create children list for each node
    }
    let candidates = listConnections(currentNode); // obtain all children to current node
    // cycle through all children
    for (candidate of candidates) {
      candidate.parent = currentNode; // add current node to child's parent list
      
      // for cases when a connection needs to be made to another part of the map without children to create that connection
      if (candidate.cousinsTo && Array.isArray(candidate.cousinsTo) && candidate.cousinsTo.length > 0) {
        let newArray = [candidate.id, ...candidate.cousinsTo]; // create vine connecting current child to its cousins, by node ID
        newArray = newArray.sort(sortingNumbers); // sort by ID, earliest first
        // predicate is needed because otherwise JS will interpret each number as a string
        
        // search to make sure new vine is not a duplicate
        let notFound = true; // flag for determining duplication
        for (const cluster of setup.mapVines) {
          // to make the comparison, convert each array into a string and compare
          // NOTE: this only works because the array elements are all numbers only!
          notFound = cluster.toString() !== newArray.toString();
          // otherwise it's not a match, ignore and move to the next possible vine
        }
        if (notFound) { // if after all that, the would-be vine is not a duplicate, then add it to the array of vines, for good
          setup.mapVines.push(newArray);
          
          // and now to find out which relatives need to remember when NOT to scoot to the right when calculating space for children (in case of shared children)
          // To do this, we need to find common ancestors
          let ancestryLines = [];
          let shortestLine = -1;
          let shortestLength = 99;
          let commonAncestor = -1;
          let relatives = [];
          for (let i = 0; i < newArray.length; i++) {
            ancestryLines[i] = [];
            ancestryLines[i].push(newArray[i]);
            let currentNodeA = main.workingData.find(n => n.id === newArray[i]);
            for (; currentNodeA.parentId !== -1; currentNodeA = main.workingData.find(n => n.id === currentNodeA.parentId)) {
              ancestryLines[i].unshift(currentNodeA.id);
            }
            if (ancestryLines[i].length < shortestLength) {
              shortestLength = ancestryLines[i].length;
              shortestLine = i;
            }
          }
          
          for (let i = 0; i < shortestLength; i++) {
            let breakOut = false;
            for (let j = 1; j < ancestryLines.length; j++) {
              if (ancestryLines[0][i] !== ancestryLines[j][i]) {
                for (let k = 0; k < ancestryLines.length; k++) {
                  relatives.push(ancestryLines[k][i]);
                }
                commonAncestor = ancestryLines[0][i - 1];
                breakOut = true;
                break;
              }
            }
            if (breakOut) {
              break;
            }
          }
          
          relatives = relatives.sort(sortingNumbers);
          
          let relativeNotFound = true;
          for (const relations of setup.mapRelatives) {
            relativeNotFound = relations.toString() !== relatives.toString();
          }
          if (relativeNotFound) {
            setup.mapRelatives.push(relatives);
          }
        }
      }
      
      // now add this node to the list of checked-off map nodes, to prevent infinite or loop recursion
      if (mapNodes[candidate.id] !== true) {
        currentNode.children.push(candidate); // add child to the parent's list of children
        mapNodes[candidate.id] = true; // add to checklist
        recursionA(candidate, mapNodes); // move to first child and repeat this function
        // based on this motion, all firstborn children (going down all generations) get processed first, before the last generations's firstborn passes the torch to its sibling.
        // Once all siblings of a generation are complete, then the torch is passed back to the parent, and its next sibling is processed.
      }
    }
    
    currentNode.children = currentNode.children.sort(sortingNodes);
  }

  function makeTree() {
    // get all starting points for each map
    setup.mapRoots = main.workingData.filter(node => node.type === 1);
    setup.root = setup.mapRoots[0]; // grab starting map as root of all maps
    
    for (const mapRoot of setup.mapRoots) {
      let mapNodes = {}; // checklist for each node in the game
      let currentNode = mapRoot; // start at map node
      recursionA(currentNode, mapNodes); // cycle through for each node starting at map node
    }
    //console.log(setup.mapRoots);
  }
  
  setup.makeTree = makeTree;
})();