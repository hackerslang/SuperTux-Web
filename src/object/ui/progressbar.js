export class ProgressBar {
    constructor(scene, x, y, width, height, color1, color2) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color1 = color1;
        this.color2 = color2;

        this.container = this.scene.add.graphics();
        this.gradient1 = this.scene.add.graphics();

        this.progressBox = new Phaser.Geom.Rectangle(this.x, this.y, this.width, this.height);
        this.progressBar = new Phaser.Geom.Rectangle(this.x, this.y, 0, this.height);

        this.container.fillStyle(0x222222, 0.8);
        this.container.lineStyle(1, 0x000000, 1);
        this.container.fillRect(this.progressBox.x, this.progressBox.y, this.progressBox.width, this.progressBox.height);
    }

    createGradientFill(value) {
        const color1 = Phaser.Display.Color.ValueToColor(this.color1);
        const color2 = Phaser.Display.Color.ValueToColor(this.color2);
        const interpolatedColor = Phaser.Display.Color.Interpolate.ColorWithColor(color1, color2, 100, value * 100);
        return Phaser.Display.Color.GetColor(interpolatedColor.r, interpolatedColor.g, interpolatedColor.b);
    }

    updateProgress(value) {
        this.gradient1.clear();
        const gradientColor = this.createGradientFill(value);
        this.gradient1.fillStyle(gradientColor, 1);
        this.gradient1.fillRect(this.progressBar.x, this.progressBar.y, this.progressBar.width * value, this.progressBar.height);
    }
}