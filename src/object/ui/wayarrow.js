class WayArrow extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        config.scene.add.existing(this);
        this.scene = config.scene;
        this.level = config.level;
        this.direction = config.direction;
        
        this.initTexture();
        this.setDepth(990);
    }

    initTexture() {
        var texture = "";
        switch (this.direction) {
            case "left":
                this.setTexture("way-arrow-left");
                break;
            case "right":
                this.setTexture("way-arrow-right");
                break;
            case "up":
                this.setTexture("way-arrow-right");
                this.angle = -90;
                break;
            default: //"down"
                this.setTexture("way-arrow-left");
                this.angle = -90;
                break;
        }
    }
}