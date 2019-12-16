let setup = {};

(function() {
  let root = null;
  let mapRoots = [];
  let mapVines = [];

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
        if (!(mapVines[currentNode.mapId - 1] && Array.isArray(mapVines[currentNode.mapId - 1]) && mapVines[currentNode.mapId - 1].length > 0)) {
          mapVines[currentNode.mapId - 1] = []; // create a "vine" connection
        }
        let newArray = [candidate.id, ...candidate.cousinsTo]; // create vine connecting current child to its cousins, by node ID
        let newerArray = newArray.sort(); // sort by ID, earliest first
        
        // search to make sure new vine is not a duplicate
        let notFound = true; // flag for determining duplication
        for(const cluster of mapVines[currentNode.mapId - 1]) {
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
    console.log(setup.mapRoots);
  }
  
  setup.root = root;
  setup.mapRoots = mapRoots;
  setup.mapVines = mapVines;
  setup.makeTree = makeTree;
})();