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
        this.keyController = new KeyController(this);
    }

    preloadFonts() {
        var fontLoader = new FontLoader();

        fontLoader.loadRawTtfFont(this, "Supertux-Medium-TrueType", "./assets/fonts/Supertux-Medium.ttf");
        fontLoader.loadFont(this, "SuperTuxBigColorFul");
        fontLoader.loadFont(this, "SuperTuxBigColorFulWhite");
        fontLoader.loadFont(this, "SuperTuxSmallColorFul");
        fontLoader.loadFont(this, "SuperTuxBigFont");
        fontLoader.loadFont(this, "SuperTuxBigFontColored");
        fontLoader.loadFont(this, "SuperTuxSmallFont");
    }

    createOverlayDark() {
        var rect = this.add.rectangle(0, 0, this.game.canvas.width, this.game.canvas.height, 0x272c2f, 0.95);

        rect.setOrigin(0, 0);
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