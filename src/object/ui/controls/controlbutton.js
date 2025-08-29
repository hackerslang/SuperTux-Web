export class TextButton {
    constructor(config) {
        this.scene = config.scene;
        this.x = config.x;
        this.y = config.y;
        this.width = config.width || undefined;
        this.height = config.height || undefined;
        this.originX = config.originX || 0,
        this.originy = config.originY || 0,

        this.imageButton = new ImageButton(config);
        this.updateText(config.text);
    }

    updateText(newText) {
        if (this.text !== undefined) {
            this.text.remove();
            this.text = undefined;
        };

        this.text = this.scene.fontLoader.displayText({ scene: this.scene, fontName: "SuperTuxSmallWhite", x: this.x, y: this.y, text: newText });
     }
}