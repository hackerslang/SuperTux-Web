import { FontLoader } from '../object/ui/fontloader.js';
import { ImageLoader } from '../helpers/imageloader.js';
import { KeyController } from '../object/controller.js';
import { Cursor } from '../object/ui/cursor.js';

export class MenuScene extends Phaser.Scene {
    constructor(config) {
        super({ key: config.key });

        this.dialogActive = false;
    }

    preload() {
        this.initImageLoader();
        this.generateKeyController();
        this.preloadFonts();
        this.imageLoader.loadImagesFromData("dialog");
        this.imageLoader.loadImagesFromData("menu");
        this.imageLoader.loadImagesFromData("menu-lines");
    }

    create() {
        this.initCursor();
        this.addBackground();
        this.cursor = new Cursor({ scene: this });
    }

    setDialogActive(active) {
        this.dialogActive = active;
    }

    isDialogActive() {
        return this.dialogActive;
    }

    initImageLoader() {
        if (this.imageLoader === undefined) {
            this.imageLoader = new ImageLoader({ scene: this });
        }
    }

    addBackground() {
        this.add.sprite(0, 0, "menu-background").setOrigin(0, 0).setScale(0.75);
    }

    generateKeyController() {
        this.keyController = new KeyController(this);
    }

    preloadFonts() {
        var fontLoader = new FontLoader();

        fontLoader.loadRawTtfFont(this, "Supertux-Medium-TrueType", "./assets/fonts/Supertux-Medium.ttf");
        fontLoader.loadFont(this, "SuperTuxBigFontFlashy");
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
        this.cursor = new Cursor({ scene: this });

        this.cursor.setDefaultCursor();

        this.input.on('pointerdown', (pointer, gameObjects) => {
            this.cursor.setCursorDown();
        });

        this.input.on('pointerup', (pointer, gameObjects) => {
            this.cursor.setDefaultCursor();
        });
    }
}