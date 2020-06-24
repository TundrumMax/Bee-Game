let mW = 16;
let mH = 16;


let rawMap = function () {
    let text = [];
    // let circleSeed = Math.random() * 10 + 90;
    for (let y = 0; y < mH; y++) {
        for (let x = 0; x < mW; x++) {
            //we want a cobble circle-ish shape in the centre of the world
            let angle = Math.atan2(x, y);
            let dist = Math.sqrt((y - mH / 2) ** 2 + (x - mW / 2) ** 2) + angle;
            if (dist < 3) {
                text.push("1");
            } else {
                text.push("0");
            }
        }
    }
    return text.join("");
}();

//Thank you Frisk from the Everybody Edits Discord for giving me most of this function
function generateMap(string, width, height) {
    let Array2D = [...Array(height)].map((_, a) => [...Array(width)].map((_, b) => {
        return parseInt(string[width * a + b], 10);
    }));
    // let returnArray = [];
    // let e = 0;
    // for (let y = 0; y < Array2D.length; y++) {
    //     let element = Array2D[y];
    //     returnArray[y] = [];
    //     for (let x = 0; x < element.length; x++) {
    //         let element2 = element[x];
    //         returnArray[y][x] = element2;

    //     }
    // }



    return Array2D;
}

let map = generateMap(rawMap, mW, mH);




let storageIndices = [];
let objectMap = [...Array(mH)].map((_, a) => [...Array(mW)].map((_, b) => {
    let id = 0;
    let yes = 0;
    yes = a & b;
    // if (yes == 0) id = 2; //flower
    // if (b == mW - 1) id = 1; //container
    if (b == Math.floor(mW / 2) && a == Math.floor(mH / 2)) id = 3; //shop
    let object = {
        id: id
    }
    if (id == 1 || id == 2) {
        storageIndices.push([a, b]);
        object.value = 0;
        object.maxValue = 99;
    }
    return object;
}));


function SetBlockFromInventory(xPosition, yPosition) {
    if (yPosition < 0 || xPosition < 0 || yPosition >= mH || xPosition >= mW) return;
    let itemSelected = bee.inventory[bee.selectedInventoryItem];
    if (itemSelected.type == "object") { //its an object
        if (objectMap[yPosition][xPosition].id == 0) { //nothing there
            let newObject = {
                id: itemSelected.id,
                value: 0,
                maxValue: 99
            }
            if (bee.selectedInventoryItem != "Flower" || (bee.selectedInventoryItem == "Flower" && map[yPosition][xPosition] == 0)) {
                objectMap[yPosition][xPosition] = newObject;
                itemSelected.amount--;
                if (newObject.id == 1 || newObject.id == 2) //flower or storage
                    storageIndices.push([yPosition, xPosition]);
                if (itemSelected.amount < 1) {
                    delete bee.inventory[bee.selectedInventoryItem];
                    bee.inventoryItemSelected = false;
                }
            }
        }
    } else { //its a tile
        if (map[yPosition][xPosition] != itemSelected.id) {
            map[yPosition][xPosition] = itemSelected.id;
            itemSelected.amount--;
            if (itemSelected.amount < 1) {
                delete bee.inventory[bee.selectedInventoryItem];
                bee.inventoryItemSelected = false;
            }
        }

    }
}