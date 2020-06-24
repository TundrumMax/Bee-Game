//Shop stuff




//Is the shop open?
let shopOpen = false;

function CloseShop() {
    shopOpen = false;
    for (let i = 0; i < shopItems.length; i++) {
        shopItems[i].selected = false;
        shopItems[i].selectAnimation = 0;
        shopItems[i].outOfCost = false;
        shopItems[i].outOfCostAnimation = 0;
    }
}


//The width of the shop in pixels, around a quarter of the width of the screen.
let widthOfShopbox = c.width / 4 - 20;
//How many items will be displayed per row.
let itemAmountPerLineS = widthOfShopbox < 200 ? 1 : 2;
//Self explanatory.
let halfWidthOfShopbox = widthOfShopbox / 2;
//The size of each item, but as a multiplier. I don't know why I did this but its too late to fix it now.
let itemSize = widthOfShopbox / itemAmountPerLineS / 1.5;
//Again, self explanatory.
let hItemSize = itemSize / 2;
//The distance between items. Doesn't seem to really work how I want it to work, but it kinda works.
let itemMargin = widthOfShopbox / itemAmountPerLineS / 3;


//The items that will be displayed in the shop
let shopItems = [{
    type: "object", //is it a background tile or an object?
    id: 2, //the id of the shop item, aka the difference between a flower and a container
    name: "Flower", //display name for the item
    cost: 20, //cost to buy the item
    selected: false, //is the mouse hovering over the item?
    selectAnimation: 0, //used to animate the greenness of the item box when hovered
    outOfCost: false, //can the player *not* afford the item? will be true when the player clicks on the item box
    outOfCostAnimation: 0 //used to animate the redness of the item box
}, {
    type: "object",
    id: 1,
    name: "Storage Unit",
    cost: 50,
    selected: false,
    selectAnimation: 0,
    outOfCost: false,
    outOfCostAnimation: 0
}, {
    type: "object",
    id: 3,
    name: "Shop",
    cost: 1000,
    selected: false,
    selectAnimation: 0,
    outOfCost: false,
    outOfCostAnimation: 0
}, {
    type: "tile",
    id: 0,
    name: "Grass",
    cost: 10,
    selected: false,
    selectAnimation: 0,
    outOfCost: false,
    outOfCostAnimation: 0
}, {
    type: "tile",
    id: 1,
    name: "Brick",
    cost: 10,
    selected: false,
    selectAnimation: 0,
    outOfCost: false,
    outOfCostAnimation: 0
}];
let sellRequest = 0; //a request for how much honey will be taken when buying an item from the shop

function UpdateShop() {
    for (let i = 0; i < shopItems.length; i++) {
        let obj = shopItems[i];
        let x = ((i % itemAmountPerLineS) * (itemSize + itemMargin) + (halfWidthOfShopbox / itemAmountPerLineS)) + hw;
        let y = Math.floor(i / itemAmountPerLineS) * (itemSize + itemMargin) + 60 + hItemSize + itemMargin / 2 + (70 * widthOfShopbox / 500 * 2);
        if (mouse.trueX > x - hItemSize && mouse.trueX < x + hItemSize &&
            mouse.trueY > y - hItemSize && mouse.trueY < y + hItemSize) {
            obj.selected = true;
            if (mouse.leftPressed && !mouse.leftClicked) {
                if (totalStorage >= obj.cost) {
                    sellRequest += obj.cost;
                    // bee.inventory.push({
                    //     id: obj.id,
                    //     type: obj.type
                    // });
                    addToInventory(obj.id, obj.type, obj.name);
                    mouse.leftClicked = true;

                } else {
                    obj.outOfCost = true;
                    obj.outOfCostAnimation = 0;

                }
                break;
            }
        } else {
            obj.selected = false;
        }
    }
}

function DrawShop() {
    ctx.fillStyle = "#faeabb";
    roundRect(c.width / 2, 20 + 40, widthOfShopbox, c.height - 40 - 40, 30);
    ctx.fill();
    ctx.fillStyle = "black";
    ctx.font = (70 * widthOfShopbox / 500) + "px Arial";
    ctx.fillText("Shop", halfWidthOfShopbox + hw - ctx.measureText("Shop").width / 2, 60 + (70 * widthOfShopbox / 500 * 1.5)); //* c.height / 1100
    for (let i = 0; i < shopItems.length; i++) {
        let obj = shopItems[i];
        let x = ((i % itemAmountPerLineS) * (itemSize + itemMargin) + (halfWidthOfShopbox / itemAmountPerLineS)) + hw;
        if (obj.outOfCost) {
            x += Math.sin(obj.outOfCostAnimation * 10 * (Math.PI / 180)) / (obj.outOfCostAnimation / 10 + 1) * 10;
        }
        let y = Math.floor(i / itemAmountPerLineS) * (itemSize + itemMargin) + 60 + hItemSize + itemMargin / 2 + (70 * widthOfShopbox / 500 * 2);
        let imageX = obj.id;
        if (obj.type == "object") {
            imageX -= 1;
            if (obj.id > 1) {
                imageX += 4;
            }
        }

        let imageY = obj.type == "tile" ? 0 : 1;
        if (obj.selected) {
            obj.selectAnimation = Math.min(obj.selectAnimation + 10, 100);
        } else {
            obj.selectAnimation = Math.max(obj.selectAnimation - 10, 0);
        }
        if (obj.outOfCost) {
            obj.selectAnimation = 0; //reset it
            obj.outOfCostAnimation += 2;
        }
        if (obj.outOfCostAnimation >= 200) {
            obj.outOfCostAnimation = 0;
            obj.outOfCost = false;
        }
        let gradient = ctx.createRadialGradient(x, y, 0, x, y, itemSize);
        gradient.addColorStop(0, "rgb(255,255,255)");
        if (obj.selectAnimation > 0) {
            gradient.addColorStop(1, "rgba(" + 255 * ((100 - obj.selectAnimation) / 100) + ",255," + 255 * ((100 - obj.selectAnimation) / 100) + ")");
        } else if (obj.outOfCost) {
            let x = obj.outOfCostAnimation / 100;
            let colourRamp = SmoothTriangleCurve(x / 2, 0.3);

            // colourRamp = Math.min(3 * x, 1 - (x - 1 / 3) * 1.5);
            // colourRamp = colourRamp ** 2 * (3 - 2 * colourRamp);


            gradient.addColorStop(0.9, "rgba(255," + 255 * ((1 - colourRamp) / 1) + "," + 255 * ((1 - colourRamp) / 1) + ")");
        }
        ctx.fillStyle = gradient;
        roundRect(x - hItemSize, y - hItemSize, itemSize, itemSize, 10);
        ctx.fill();
        ctx.lineWidth = 5;
        ctx.strokeStyle = "#f5cb90";
        ctx.stroke();
        let imageScale = 0.6;
        let imageScaledOffsetY = 0.9;
        ctx.drawImage(tileset, imageX * 32, imageY * 32, 32, 32, x - (itemSize * imageScale) / 2, y - (itemSize * imageScaledOffsetY) / 2, itemSize * imageScale, itemSize * imageScale);
        ctx.fillStyle = "black";
        ctx.font = (itemSize / 7.5) + "px Arial";
        ctx.fillText(obj.name, x - Math.min(ctx.measureText(obj.name).width, itemSize - 10) / 2, y + (itemSize / 3.5), itemSize - 10);
        ctx.font = (itemSize / 10) + "px Arial";
        let txt = "Cost: " + obj.cost + " Honey";
        ctx.fillText(txt, x - (ctx.measureText(txt).width) / 2, y + (itemSize / 2.5));
    }
}