export class Dialog extends Phaser.GameObjects.Container {
    constructor(config) {
        super(config.scene, config.x, config.y, config.width, config.height);
        this.scene = config.scene;
        this.x = config.x;
        this.y = config.y;
        this.width = config.width;
        this.height = config.height;

        this.text = config.text || "";
    }

    create() {
        // Create a background rectangle
        this.background = this.scene.add.rectangle(this.x, this.y, this.width, this.height, 0x000000, 0.8);
        this.background.setOrigin(0, 0);
        this.add(this.background);
        // Add the dialog to the scene
        this.scene.add.existing(this);
    }

    fitText() {
        if (this.text !== "") {

        }
    }
}