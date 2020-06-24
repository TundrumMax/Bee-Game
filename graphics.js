let c = document.createElement("canvas");
c.width = window.innerWidth;
c.height = window.innerHeight;

//Graphics functions
let hPI = Math.PI / 2;
let morePI = Math.PI * 1.5;
//produces a rounded rectangle for things like menu boxes or item boxes
function roundRect(x, y, width, height, radius) {

    ctx.beginPath();
    //bottom left

    ctx.arc(x + radius, y + height - radius, radius, Math.PI, hPI, true);
    //bottom right

    ctx.arc(x + width - radius, y + height - radius, radius, hPI, 0, true);
    //top right

    ctx.arc(x + width - radius, y + radius, radius, 0, morePI, true);
    //top left

    ctx.arc(x + radius, y + radius, radius, morePI, Math.PI, true);
    ctx.closePath();

}
//creates a triangle-wave-like curve
//Thank you Eriksonn from the OneLoneCoder Discord Server for the equations below
function TriangleCurve(x, a) {
    return Math.min(x / a, (1 - x) / (1 - a));
}
//smoothens a curve
function Smoothen(x) {
    return (x ** 2) * (3 - 2 * x)
}
//combines the trianglecurve function with the smoothen function to create a smooth triangle curve, which can be used to animation a glow as a reaction to an event
let SmoothTriangleCurve = (x, a) => Smoothen(TriangleCurve(x, a));



//Tile Images
let menuSet = new Image();
menuSet.src = "MenuSprites.png";

let tileset = new Image();
tileset.src = "Tileset2.png";

//the camera, which can be panned around
let camera = {
    x: 0,
    y: 0,
    zoom: 2
}
//the scale of every tile
let scale = 32 * camera.zoom;


function DrawTileMap(map) {
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            let imageX = map[y][x];
            let drawX = (x - camera.x) * scale + hw;
            let drawY = (y - camera.y) * scale + hh;
            ctx.drawImage(tileset, imageX * 32, 0, 32, 32, drawX, drawY, scale + 1, scale + 1);
        }
    }
}

function DrawObjectMap(objectMap) {
    for (let y = 0; y < objectMap.length; y++) {
        for (let x = 0; x < objectMap[y].length; x++) {
            let obj = objectMap[y][x];
            let oId = obj.id;
            let oImageX = 0;
            if (oId == 1) {
                //go to a specific storage sprite depending on how much honey is stored inside compared to its max possible storage amount
                oImageX += Math.min(Math.ceil(obj.value / obj.maxValue * 4), 4);
            } else {
                //skip storage sprites
                oImageX = oId + 3;
            }
            let drawX = (x - camera.x) * scale + hw;
            let drawY = (y - camera.y) * scale + hh;

            if (oId != 0) {
                ctx.drawImage(tileset, oImageX * 32, 32, 32, 32, drawX, drawY, scale, scale);
            }
        }
    }
}

function DrawStorage(storageIndices) {
    for (let i = 0; i < storageIndices.length; i++) {
        let y = storageIndices[i][0];
        let x = storageIndices[i][1];
        let drawX = (x - camera.x) * scale + hw + scale / 1.5;
        let drawY = (y - camera.y) * scale + hh + scale;
        let obj = objectMap[y][x];
        if (obj.id == 2) {
            let randomNumber = Math.random()
            if (randomNumber < 0.01)
                obj.value = Math.min(obj.value + 1, 99);

        } else if (obj.id == 1) {
            if (sellRequest) {
                let t = obj.value;
                obj.value = Math.max(obj.value - sellRequest, 0);
                sellRequest -= t - obj.value;
            }
        }


        let value = obj.value;
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#6363aa";
        ctx.strokeText(Math.floor(value), drawX, drawY);
        ctx.fillStyle = "white";
        ctx.fillText(Math.floor(value), drawX, drawY);
        if (obj.id == 1)
            totalStorage += Math.floor(obj.value);
    }
}