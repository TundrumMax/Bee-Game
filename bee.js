let beeSprite = new Image();
beeSprite.src = "BeeSpin.png";
let bee = {
    x: 0,
    y: 0,
    rotation: 0,
    max_speed: 1,
    speed: 0,
    targetX: 10,
    targetY: 10,
    destinationReached: true,
    honeyStored: 20,
    inventory: {
        //inventory objects
        //object type, id and amount
    },
    selectedInventoryItem: "",
    inventoryItemSelected: false
}

function UpdateBee(distanceToTarget) {
    //rotate towards target in closest direction
    if (!bee.destinationReached) {
        let angle = Math.PI / 2 - Math.atan2((bee.targetX + 0.5) - bee.x, (bee.targetY + 0.5) - bee.y);
        angle += Math.PI * 2;
        angle %= Math.PI * 2; //bring it into positive
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

        //make the bee go at a constant speed until it is closer to the target, in which case, slow down
        bee.speed = Math.min(Math.pow(distanceToTarget / 8, 2), 0.1);
    }
    if (distanceToTarget < 0.5) {
        bee.destinationReached = true;
        bee.speed /= 1.1;
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
let beeWaveTimer = 0;

function DrawBee() {
    beeWaveTimer++;
    // ctx.strokeStyle = "yellow";

    // ctx.lineWidth = 16 * camera.zoom;
    // ctx.lineCap = "round";
    // ctx.beginPath();
    // let bX = Math.cos(bee.rotation) * camera.zoom * 8;
    // let bY = Math.sin(bee.rotation) * camera.zoom * 8;
    // ctx.moveTo(-bX + (bee.x - camera.x) * scale + hw, -bY + (bee.y - camera.y) * scale + hh);
    // ctx.lineTo(bX + (bee.x - camera.x) * scale + hw, bY + (bee.y - camera.y) * scale + hh);
    // ctx.stroke();
    let x = (bee.x - camera.x) * scale + hw;
    let y = (bee.y - camera.y) * scale + hh;
    let h = Math.sin(beeWaveTimer * (Math.PI / 180) * 2) * 1.1;
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.ellipse(x, y + scale / 2, scale * 0.4 + (h + 1), scale * 0.2 + (h + 1), 0, 0, Math.PI * 2);
    ctx.fill();
    let a = Math.PI / 2 - bee.rotation;
    a += Math.PI * 2;
    a %= Math.PI * 2;
    let angle = Math.min(Math.max(Math.round(a / (Math.PI * 2) * 8), 0), 7);
    ctx.drawImage(beeSprite, angle * 32, 0, 32, 32, x - scale / 2, y - scale / 2 + h * 2.5, scale, scale);
    ctx.fillStyle = "black";
}

let inventoryWidth = widthOfShopbox;
let inventoryItemAmountPerLine = inventoryWidth < 200 ? 2 : 4;
let leftSideOfInventory = c.width / 2 + inventoryWidth + 20;
let topSideOfInventory = 20 + 40;
let iA = inventoryWidth / inventoryItemAmountPerLine;

let widthOfItems = iA / 1.5;
let b = 4 / 3;
let b2 = widthOfItems / b;

function DrawInventory() {
    ctx.fillStyle = "#faeabb";

    roundRect(leftSideOfInventory, 20 + 40, inventoryWidth, c.height - 40 - 40, 30);
    ctx.fill();
    let count = 0;

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


}