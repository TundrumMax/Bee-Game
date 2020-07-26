let beeSprite = new Image();
beeSprite.src = "BeeSpin.png";
let bee = {
    x: 0,
    y: 0,
    rotation: 0,
    targetRotation: 0,
    max_speed: 1,
    speed: 0,
    targetX: 0,
    targetY: 0,
    destinationReached: true,
    honeyStored: 20,
    maxHoney: 200,
    inventory: {
        //inventory objects
        //object type, id and amount
    },
    selectedInventoryItem: "",
    inventoryItemSelected: false,
    idle: {
        lerp: 0,
        timer: 0
    }

}

function UpdateBee(distanceToTarget) {





    //rotate towards target in closest direction
    let angle = bee.targetRotation;
    if (-angle + bee.rotation > Math.PI) {
        angle += Math.PI * 2;
    } else if (angle - bee.rotation > Math.PI) {
        bee.rotation += Math.PI * 2;
    }
    bee.rotation += Math.max(Math.min((angle - bee.rotation) / 4, 0.2), -0.2);
    if (bee.rotation < 0) {
        bee.rotation += Math.PI * 2;
    }
    bee.rotation %= Math.PI * 2;
    if (!bee.destinationReached) {
        //make the bee go at a constant speed until it is closer to the target, in which case, slow down
        bee.speed = Math.min(Math.pow(distanceToTarget / 8, 2), 0.1);
    }
    if (distanceToTarget < 0.5) {
        bee.destinationReached = true;
        bee.speed /= 1.1;
        currentSelection.show = false;
    }
    if (distanceToTarget < 1.5) {
        if (goCollectNectar) {
            collectNectar(bee.targetX, bee.targetY);
        }
    }

    bee.x += Math.cos(bee.rotation) * bee.speed;
    bee.y += Math.sin(bee.rotation) * bee.speed;
}

//Is the inventory open?
let inventoryOpen = false;

function addToInventory(id, type, name) { //type = 0 means ground, type = 1 means object
    if (bee.inventory[name]) {
        bee.inventory[name].amount++;
    } else {
        bee.inventory[name] = {
            id: id,
            type: type,
            amount: 1,
            hover: false,
            selected: false
        }
    }
}

function UpdateInventory() {
    let count = 0;

    for (const i in bee.inventory) {
        let item = bee.inventory[i];
        let x = (count % inventoryItemAmountPerLine) * iA + leftSideOfInventory;
        let y = Math.floor(count / inventoryItemAmountPerLine) * iA + topSideOfInventory;
        if (mouse.trueX > x + widthOfItems / 4 && mouse.trueY > y + widthOfItems / 4 && mouse.trueX < x + widthOfItems * 1.25 && mouse.trueY < y + widthOfItems * 1.25) {
            item.hover = true;
            if (mouse.leftPressed && !mouse.leftClicked) {
                CloseShop();

                bee.selectedInventoryItem = i;
                item.selected = !item.selected;
                bee.inventoryItemSelected = item.selected;

            }
        } else {

            item.hover = false;
        }
        if (bee.selectedInventoryItem != i) item.selected = false;

        count++;
    }
}

function ToggleInventory() {
    if (!inventoryOpen) inventoryOpen = true;
    else CloseInventory();
}

function CloseInventory() {
    inventoryOpen = false;
    if (bee.inventoryItemSelected) {
        bee.inventoryItemSelected = false;
        bee.inventory[bee.selectedInventoryItem].selected = false;
    }
}

function beeLoop(x, angleOffset) {
    return {
        position: {
            x: 2 * Math.sin(x),
            y: Math.sin(x * 2)
        },
        direction: {
            x: 2 * Math.cos(x + angleOffset),
            y: 2 * Math.cos((x + angleOffset) * 2)
        }
    }
}

let beeWaveTimer = 0;

function DrawBee() {
    beeWaveTimer++;

    //yes I really have to do this in the draw function
    bee.targetRotation = Math.PI / 2 - Math.atan2((bee.targetX + 0.5) - bee.x, (bee.targetY + 0.5) - bee.y);
    bee.targetRotation += Math.PI * 2;
    bee.targetRotation %= Math.PI * 2;





    let cheese = beeLoop(bee.idle.timer, 0.5);
    let newBeeX = bee.x + cheese.position.x * bee.idle.lerp * .5;
    let newBeeY = bee.y + cheese.position.y * bee.idle.lerp * .5;
    if (bee.destinationReached) { //pretty simple ay
        bee.idle.lerp = Math.min(bee.idle.lerp + 0.01, 1);
        bee.idle.timer += 0.05;
        bee.targetRotation = lerp(bee.targetRotation, Math.atan2(cheese.direction.y, cheese.direction.x), bee.idle.lerp);
    } else {
        bee.idle.lerp = Math.max(bee.idle.lerp - 0.01, 0);
    }
    let x = (newBeeX - camera.x) * scale + hw;
    let y = (newBeeY - camera.y) * scale + hh;
    let h = Math.sin(beeWaveTimer * (Math.PI / 180) * 2) * 1.1;
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.ellipse(x, y + scale / 2, scale * 0.4 + (h + 1), scale * 0.2 + (h + 1), 0, 0, Math.PI * 2);
    ctx.fill();

    let a = Math.PI / 2 - bee.rotation;
    a += Math.PI * 2;
    a %= Math.PI * 2;
    let angle = Math.max(Math.round(a / (Math.PI * 2) * 8), 0) % 8;
    ctx.drawImage(beeSprite, angle * 32, 0, 32, 32, x - scale / 2, y - scale / 2 + h * 2.5, scale, scale);
    ctx.fillStyle = "black";
}

let inventoryWidth = widthOfShopbox;
let inventoryHeight = c.height - 40 - 40;
let inventoryItemAmountPerLine = inventoryWidth < 200 ? 2 : 4;
let leftSideOfInventory = c.width / 2 + inventoryWidth + 20;
let topSideOfInventory = 20 + 40;
let iA = inventoryWidth / inventoryItemAmountPerLine;

let widthOfItems = iA / 1.5;
let b = 4 / 3;
let b2 = widthOfItems / b;

function DrawInventory() {
    ctx.fillStyle = "#faeabb";

    roundRect(leftSideOfInventory, 20 + 40, inventoryWidth, inventoryHeight, 30);
    ctx.fill();
    let count = 0;
    if (Object.keys(bee.inventory).length)
        for (const i in bee.inventory) {
            let item = bee.inventory[i];
            let x = (count % inventoryItemAmountPerLine) * iA + leftSideOfInventory;
            let y = Math.floor(count / inventoryItemAmountPerLine) * iA + topSideOfInventory;

            roundRect(x + widthOfItems / 4, y + widthOfItems / 4, widthOfItems, widthOfItems, 20);
            let gradient = ctx.createRadialGradient(x + b2, y + b2, 0, x + b2, y + b2, widthOfItems);
            gradient.addColorStop(0, "#faeabb");
            gradient.addColorStop(1, "#f5cb90");
            ctx.fillStyle = gradient;
            ctx.fill();

            let imageX = item.id;
            if (item.type == "object") {
                imageX -= 1;
                if (item.id > 1) {
                    imageX += 4;
                }
            }
            let imageY = item.type == "tile" ? 0 : 1;
            ctx.drawImage(tileset, 32 * imageX, 32 * imageY, 32, 32, x + widthOfItems / 4, y + widthOfItems / 4, widthOfItems, widthOfItems);


            if (item.hover || item.selected) {
                roundRect(x + widthOfItems / 4, y + widthOfItems / 4, widthOfItems, widthOfItems, 20);
                let gradient2 = ctx.createRadialGradient(x + b2, y + b2, 0, x + b2, y + b2, widthOfItems);
                gradient2.addColorStop(0, "rgba(255,255,255,0)");
                if (item.hover) {
                    if (item.selected)
                        gradient2.addColorStop(1, "rgba(127,255,0,1)");
                    else
                        gradient2.addColorStop(1, "rgba(255,255,0,1)");
                } else
                    gradient2.addColorStop(1, "rgba(0,255,0,1)");

                ctx.fillStyle = gradient2;
                ctx.fill();
            }
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#6363aa";
            ctx.strokeText(item.amount, x + widthOfItems, y + widthOfItems * 1.25);
            ctx.fillStyle = "white";
            ctx.fillText(item.amount, x + widthOfItems, y + widthOfItems * 1.25);
            count++;
        }
    else {
        ctx.fillStyle = "#f5cb90";
        let texts = ["There is nothing here", "Buy something from the shop"];
        let textLength1 = ctx.measureText(texts[0]).width;
        let textLength2 = ctx.measureText(texts[1]).width;
        ctx.fillText(texts[0], leftSideOfInventory + inventoryWidth / 2 - textLength1 / 2, topSideOfInventory + inventoryHeight / 2 - 30);
        ctx.fillText(texts[1], leftSideOfInventory + inventoryWidth / 2 - textLength2 / 2, topSideOfInventory + inventoryHeight / 2 + 10);
    }
}