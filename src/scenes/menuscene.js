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
        this.backgroundReady = false;
    }

    create() {
        this.initCursor();
        this.cursor = new Cursor({ scene: this });
        this.makeMenu();
        this.addBackground();
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
        //this.time.delayedCall(0, () => {
        //    this.game.renderer.snapshot((image) => {
        //        const blurRadius = 8;
        //        const canvas = document.createElement('canvas');
        //        canvas.width = image.width + blurRadius * 2;
        //        canvas.height = image.height + blurRadius * 2;
        //        const ctx = canvas.getContext('2d');
        //        ctx.filter = `blur(${blurRadius}px)`;
        //        ctx.drawImage(image, blurRadius, blurRadius);

        //        const cropped = document.createElement('canvas');
        //        cropped.width = image.width;
        //        cropped.height = image.height;
        //        const croppedCtx = cropped.getContext('2d');
        //        croppedCtx.drawImage(
        //            canvas,
        //            blurRadius, blurRadius, image.width, image.height,
        //            0, 0, image.width, image.height
        //        );

        //        const blurredBase64 = cropped.toDataURL('image/png');

        //        if (this.textures.exists('blurred-bg')) {
        //            this.textures.remove('blurred-bg');
        //        }

        //        this.textures.once('addtexture', (key) => {
        //            if (key === 'blurred-bg') {
        //                this.pausedBlurredImage = this.add.image(
        //                    this.sys.game.config.width / 2,
        //                    this.sys.game.config.height / 2,
        //                    'blurred-bg'
        //                ).setOrigin(0.5);

        //                this.makeMenu();
        //            }
        //        });
        //        this.textures.addBase64('blurred-bg', blurredBase64);
        //        this.backgroundReady = true;
        //    });
        //});
        //this.add.sprite(0, 0, "menu-background").setOrigin(0, 0).setScale(0.75);
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

    resumeGame() {

    }

    update(time, delta) {
        this.cursor.update(time, delta);
    }
}