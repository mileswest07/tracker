let setup = {
  root: null,
  mapRoots: [],
  mapVines: []
};

(function() {
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
      if (!candidate.hasOwnProperty("parents")) {
        candidate.parents = []; // allow children to have multiple parents for multiple paths
      }
      candidate.parents.push(currentNode); // add current node to child's parent list
      
      // for cases when a connection needs to be made to another part of the map without children to create that connection
      if (candidate.cousinsTo && Array.isArray(candidate.cousinsTo) && candidate.cousinsTo.length > 0) {
        let newArray = [candidate.id, ...candidate.cousinsTo]; // create vine connecting current child to its cousins, by node ID
        newArray = newArray.sort((a, b) => a - b); // sort by ID, earliest first
        // predicate is needed because otherwise JS will interpret each number as a string
        
        // search to make sure new vine is not a duplicate
        let notFound = true; // flag for determining duplication
        for(const cluster of setup.mapVines) {
          // to make the comparison, convert each array into a string and compare
          // NOTE: this only works because the array elements are all numbers only!
          notFound = cluster.toString() !== newArray.toString();
          // otherwise it's not a match, ignore and move to the next possible vine
        }
        if (notFound) { // if after all that, the would-be vine is not a duplicate, then add it to the array of vines, for good
          setup.mapVines.push(newArray);
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
  }

  function makeTree() {
    // get all starting points for each map
    setup.mapRoots = main.workingData.filter(node => node.type === nodeType.start);
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