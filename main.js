let hw = c.width / 2;
let hh = c.height / 2;
let ctx = c.getContext("2d");
ctx.imageSmoothingEnabled = false;
document.body.appendChild(c);

function LoadSoundAsBatch(src) {

    let array = [];
    array.push(new Audio(src));
    array.push(new Audio(src));
    array.push(new Audio(src));
    array.push(new Audio(src));
    return {
        sounds: array,
        counter: 0
    };
}
let knockSound = LoadSoundAsBatch("Knock Sound.mp3");

let mouse = {
    x: 0,
    y: 0,
    trueX: 0,
    trueY: 0,
    leftPressed: false,
    rightPressed: false,
    leftClicked: false
};
document.onmousedown = (e) => {
    if (e.button == 0)
        mouse.leftPressed = true;
    else if (e.button == 2)
        mouse.rightPressed = true;
};
document.onmouseup = (e) => {
    if (e.button == 0)
        mouse.leftPressed = false;
    else if (e.button == 2)
        mouse.rightPressed = false;
};
document.onmousemove = e => {
    mouse.trueX = e.clientX;
    mouse.trueY = e.clientY;
    mouse.x = mouse.trueX / camera.zoom;
    mouse.y = mouse.trueY / camera.zoom;
};
document.oncontextmenu = e => {
    e.preventDefault();
}
let keys = [];
document.onkeydown = (e) => {
    keys[e.key] = true;
}
document.onkeyup = (e) => {
    keys[e.key] = false;
}





ctx.fillStyle = "white";
ctx.font = "30px Arial";



let currentSelection = {
    x: 0,
    y: 0,
    show: false
} //MUST. ANIMATE. EVERYTHING.



let totalStorage = 0;

function Loop() {
    if (sellRequest) {
        let bt = bee.honeyStored;
        bee.honeyStored = Math.max(bee.honeyStored - sellRequest, 0);
        sellRequest -= bt - bee.honeyStored;
    }

    totalStorage = bee.honeyStored;

    // camera.y += 0.1;
    scale = 32 * camera.zoom;
    let distanceToTarget = Math.sqrt(((bee.targetX + 0.5) - bee.x) ** 2 + ((bee.targetY + 0.5) - bee.y) ** 2);

    // map[storageIndices[0][0]][storageIndices[0][1]].value = Math.min(map[storageIndices[0][0]][storageIndices[0][1]].value + 0.1, 99);





    UpdateBee(distanceToTarget);

    camera.x += (bee.x - camera.x) / 16;
    camera.y += (bee.y - camera.y) / 16;

    ctx.clearRect(0, 0, c.width, c.height);

    DrawTileMap(map);
    DrawObjectMap(objectMap);


    DrawStorage(storageIndices);

    // ctx.fillText(bee.speed, (bee.x - camera.x) * scale + hw, (bee.y - camera.y - 1) * scale + hh);
    // ctx.fillText(distanceToTarget, (bee.x - camera.x) * scale + hw, (bee.y - camera.y - 1.5) * scale + hh);



    let xPosition = Math.floor(((mouse.x - hw / camera.zoom) + camera.x * 32) / 32);
    let yPosition = Math.floor(((mouse.y - hh / camera.zoom) + camera.y * 32) / 32);
    currentSelection.x += (xPosition - currentSelection.x) / 3;
    currentSelection.y += (yPosition - currentSelection.y) / 3;
    let xValue = ((currentSelection.x - camera.x) * 32 + hw / camera.zoom) * camera.zoom;
    let yValue = ((currentSelection.y - camera.y) * 32 + hh / camera.zoom) * camera.zoom;
    ctx.lineWidth = 4;

    if (!bee.inventoryItemSelected)
        ctx.strokeStyle = "yellow";
    else
        ctx.strokeStyle = "#00ff00";

    ctx.strokeRect(xValue, yValue, scale, scale);



    if (!bee.destinationReached && currentSelection.show) {
        let selectedXPosition = ((bee.targetX - camera.x) * 32 + hw / camera.zoom) * camera.zoom;
        let selectedYPosition = ((bee.targetY - camera.y) * 32 + hh / camera.zoom) * camera.zoom;
        let gradient = ctx.createRadialGradient(selectedXPosition + 0.5 * scale, selectedYPosition + 0.5 * scale, 0, selectedXPosition + 0.5 * scale, selectedYPosition + 0.5 * scale, scale);
        gradient.addColorStop(0.4, "rgba(255,255,0,0)");
        gradient.addColorStop(0.5, "rgba(255,255,0," + Math.min(distanceToTarget - 0.5, 1));
        gradient.addColorStop(0.7, "rgba(255,255,0,0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(selectedXPosition, selectedYPosition, scale, scale);
    }
    DrawBee();

    ctx.fillStyle = "black";
    // ctx.fillText("x: " + (xPosition + 1), xValue, yValue - 40);
    // ctx.fillText("y: " + (yPosition + 1), xValue, yValue - 10);
    if (shopOpen)
        UpdateShop();

    if (inventoryOpen)
        UpdateInventory();
    //im so sorry i know this can be optimised
    let movementYeahYeah = false; //is the player moving with wasd
    if (keys["w"]) {
        bee.targetY = bee.y - 3;
        movementYeahYeah = true;
    }
    if (keys["a"]) {
        bee.targetX = bee.x - 3;
        movementYeahYeah = true;
    }
    if (keys["s"]) {
        bee.targetY = bee.y + 2;
        movementYeahYeah = true;
    }
    if (keys["d"]) {
        bee.targetX = bee.x + 2;
        movementYeahYeah = true;
    }
    if (movementYeahYeah) {
        bee.destinationReached = false;
        currentSelection.show = false;
    } else if (currentSelection.show == false && !bee.destinationReached) { //stops the bee from overshooting if the player stops pressing
        bee.destinationReached = false;
    }
    if (mouse.leftPressed) {
        if (!mouse.leftClicked) {
            let iP = false;
            if (mouse.trueX < c.width && mouse.trueX > c.width - scale - 5 && mouse.trueY < scale + 5 && mouse.trueY > 0) {
                ToggleInventory();
                if (bee.inventoryItemSelected)
                    bee.inventory[bee.selectedInventoryItem].selected = false;
                iP = true;
                knockSound.sounds[knockSound.counter = (knockSound.counter + 1) % knockSound.sounds.length].play();
            } else if (!shopOpen && !inventoryOpen) {
                bee.targetX = xPosition;
                bee.targetY = yPosition;
                bee.destinationReached = false;
                currentSelection.show = true;
            }
            if (shopOpen) {
                if (mouse.trueX < hw || mouse.trueY < 60 || mouse.trueX > c.width - 20 || mouse.trueY > c.height - 20) {
                    CloseShop();
                    CloseInventory();

                }

            } else if (inventoryOpen) {
                if ((mouse.trueX < hw + widthOfShopbox + 20 || mouse.trueY < 60) && !iP) {
                    if (!bee.inventoryItemSelected)
                        CloseInventory();
                    else {
                        SetBlockFromInventory(xPosition, yPosition);
                    }
                }
            }

        }
        mouse.leftClicked = true;
    } else {
        mouse.leftClicked = false;
    }
    if (mouse.rightPressed) {
        if (!mouse.rightClicked) {
            if ((shopOpen && mouse.trueX < hw) || ((inventoryOpen && !shopOpen) && mouse.trueX < hw * 1.5) || (!shopOpen && !inventoryOpen)) {
                let selectionX = Math.floor(((mouse.x - hw / camera.zoom) + camera.x * 32) / 32);
                let selectionY = Math.floor(((mouse.y - hh / camera.zoom) + camera.y * 32) / 32);
                if (selectionX >= 0 && selectionX < mW && selectionY >= 0 && selectionY < mH) {
                    let obj = objectMap[selectionY][selectionX];
                    let id = obj.id;
                    let temp = 0;
                    switch (id) {
                        case 1: //storage
                            temp = obj.value;
                            obj.value = Math.min(obj.maxValue, obj.value + bee.honeyStored);
                            bee.honeyStored = Math.max(0, bee.honeyStored - (obj.maxValue - temp));
                            break;
                        case 2: //flower
                            temp = bee.honeyStored;
                            bee.honeyStored = Math.min(99, Math.floor(obj.value) + bee.honeyStored);
                            obj.value = Math.max(0, obj.value - (99 - temp));
                            break;
                        case 3: //terminal
                            if (shopOpen) CloseShop();
                            else shopOpen = true;
                            inventoryOpen = shopOpen;


                            break;
                        default:
                            break;
                    }

                }
            }


        }
        mouse.rightClicked = true;
    } else {
        mouse.rightClicked = false;
    }
    let w = ctx.measureText(bee.honeyStored + " / 99").width;
    ctx.fillText(bee.honeyStored + " / 99", c.width / 2 - w / 2, 40);
    ctx.fillText(totalStorage, 15, 40);
    if (shopOpen) {
        DrawShop();
    }
    ctx.font = "30px Arial";
    if (inventoryOpen) {
        DrawInventory();
        ctx.shadowColor = "white";
        ctx.shadowBlur = 10;
    }
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#dfa535";
    roundRect(c.width - scale - 5, 5, scale, scale, 15);
    ctx.stroke();
    ctx.drawImage(menuSet, 0, 0, 32, 32, c.width - scale - 5, 5, scale, scale);

    ctx.shadowBlur = 0;
    let vignette = ctx.createRadialGradient(hw, hh, 0, hw, hh, c.width);
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, "rgba(30, 0, 59,1)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, c.width, c.height);
    requestAnimationFrame(Loop);
}
requestAnimationFrame(Loop);