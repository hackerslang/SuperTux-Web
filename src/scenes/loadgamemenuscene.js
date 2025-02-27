export class LoadGameMenuScene extends MenuScene {
    constructor() {
        super({ key: 'LoadGameMenuScene' });
    }

    preload() {
        super.preload();
        this.preloadImages();
    }

    generateKeyController() {
        this.keys = {
            'menu': this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
        };

        this.keyController = new KeyController(this.keys, this);
    }

    preloadFonts() {
        var fontLoader = new FontLoader();

        fontLoader.loadFont(this, "SuperTuxBigFont");
        fontLoader.loadFont(this, "SuperTuxBigFontColored");
        fontLoader.loadFont(this, "SuperTuxSmallFont");
    }

    preloadImages() {
        var imageLoader = new ImageLoader({ scene: this });

        imageLoader.loadImagesFromData("menu");
    }
}