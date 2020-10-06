let checklist = {};

(() => {
  function buildListOfChecklistItems() {
    let listOfKeys = [];
    let listOfPickupTypes = [];
    let holdMap = main.currentMap;
    for (let i = 0; i < main.numMapsReady; i++) {
      main.currentMap = 1 + i;
      interaction.navigateTree((currentNode) => {
        if (!listOfPickupTypes.includes(currentNode.pickupType) && !bossData.includes(currentNode.pickupType) && currentNode.pickupType != 0) {
          listOfPickupTypes.push(currentNode.pickupType);
          listOfKeys.push({name: pickupType[currentNode.pickupType], image: "images/icons/" + currentNode.image + ".png"});
        }
      })
    }
    listOfKeys = listOfKeys.sort((a, b) => {
      return pickupType.indexOf(a.name) - pickupType.indexOf(b.name);
    })
    console.log(listOfKeys);
    
    main.currentMap = holdMap;
  }

  checklist.build = buildListOfChecklistItems;
})();