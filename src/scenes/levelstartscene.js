import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../game.js';
import { AnimationLoader } from '../helpers/animationloader.js';
import { ImageLoader } from '../helpers/imageloader.js';
import { SectorSwapper } from '../object/level/sector_swapper.js';
import { LeanTux } from '../creatures/player.js';

export class LevelStartScene extends Phaser.Scene {
    constructor() {
        super({ key: "LevelStartScene" });
        this.key = "LevelStartScene";
    }

    init(config) {
        // Accept a slot (from SectorSwapper.createNewSectorSceneInBackground) or a direct sectorScene reference
        this.slot = config.slot;
        this.sectorScene = config.sectorScene || (this.slot ? this.slot.loadedScene : null);
        this.levelTitle = config.levelTitle;
        this.authors = config.authors !== undefined ? config.authors : ["Hackerslang"];
        this.nextLevel = config.nextLevel;
    }

    async preload() {
        this.load.plugin('rexlineprogressplugin', '../../plugins/rexlineprogressplugin.min.js', true);

        this.imageLoader = ImageLoader.getInstance();
        this.animationLoader = AnimationLoader.getInstance();

        await this.loadImages();

        this.load.font('SuperTux-Medium', '../../assets/fonts/SuperTux-Medium.ttf', 'truetype');
    }

    async create() {
        

        this.createTitle();
        this.createAuthors();

        this.progressBar = this.add.rexLineProgress(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 50, "0x366237", 1, {});
        this.progressBar.setValue(1, 0, 100);

        

 


    }

    update(time, delta) {
        this.player.update(time, delta);
    }

    subscribeToSectorProgress() {
        if (!this.sectorScene || !this.sectorScene.events) { return; }

        var self = this;
        this.sectorScene.events.on('loadProgress', (progress) => {
            if (self.progressBar && self.progressBar.setValue) {
                self.progressBar.setValue(progress / 100, 0, 100);
            }
        });
    }

    async loadImages() {
        var keys = ["tux-lean-startlvlscreen"];
        for (const key of keys) {
            await this.imageLoader.loadImagesFromData(key, this);
        }
    }

    async loadAnimations() {
        var keys = ["tux-lean-startlvlscreen"];
        for (const key of keys) {
            await this.animationLoader.loadAnimationsFromData(key, this);
        }
    }

    positionPlayerOnScreen() {
        this.player.body.allowGravity = false;
        this.player.body.x = (CANVAS_WIDTH / 2);
    }



    positionTitleOnScreen() {
        
    }

    displayProgress(progress, max) {
        
    }
}