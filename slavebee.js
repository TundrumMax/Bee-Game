class WorkerBee {
    constructor(x, y, post) {
        this.x = x;
        this.y = y;
        this.post = post;
        this.target = {
            x: x,
            y: y
        }
        this.angle = 0;
        this.flowerTarget = {
            x: 0,
            y: 0
        }
        this.foundFlowerTarget = false;
        this.storageTarget = {
            x: 0,
            y: 0
        }
        this.foundStorageTarget = false;
        this.honeyStorage = 0;
    }
    find(object) {

    }
}