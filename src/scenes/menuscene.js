import { FontLoader } from '../object/ui/fontloader.js';
import { KeyController } from '../object/controller.js';
export class MenuScene extends Phaser.Scene {
    constructor(config) {
        super({ key: config.key });
    }

    preload() {
        this.generateKeyController();
        this.preloadFonts();
    }

    create() {
        this.initCursor();
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

    initCursor() {
        this.currentCursor = "default";
        this.input.setDefaultCursor('url(./assets/images/ui/cursor/mousecursor.png), pointer');

        this.input.on('pointerdown', (pointer, gameObjects) => {
            this.input.setDefaultCursor('url(./assets/images/ui/cursor/mousecursor-click.png), pointer');
            this.currentCursor = "down";
        });

        this.input.on('pointerup', (pointer, gameObjects) => {
            this.input.setDefaultCursor('url(./assets/images/ui/cursor/mousecursor.png), pointer');
            this.currentCursor = "default";
        });
    }
}