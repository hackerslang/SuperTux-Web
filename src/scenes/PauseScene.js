import { game, CANVAS_WIDTH, CANVAS_HEIGHT } from '../game.js';
import { ImageButton } from '../object/ui/menu.js';
import { KeyController } from '../object/controller.js';
import { SectorSwapper } from '../object/level/sector_swapper.js';
import { MenuScene } from './menuscene.js';

export class PauseScene extends MenuScene {
    constructor() {
        super({
            key: 'PauseScene'
        });
    }

    preload() {
        super.preload();
        this.generateKeyController();
        this.imageLoader.loadImagesFromData("menu");
        this.imageLoader.loadImagesFromData("gamemenu");
    }

    create() {
        super.create();
        this.makePauseMenu();
    }

    makePauseMenu() {
        this.add.sprite(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 8, "paused-title").setOrigin(0.5, 0.5);
        this.add.sprite(CANVAS_WIDTH / 2, (CANVAS_HEIGHT / 8) + 100, "press-p-unpause").setOrigin(0.5, 0.5);

        var items = [
            {
                "texture": "resume-game",
                "hoverTexture": "resume-game-hover",
                "callBack": this.resumeGame
            }
        ];

        items.forEach(item => {
            new ImageButton({
                scene: this,
                x: CANVAS_WIDTH / 2,
                y: (CANVAS_HEIGHT / 2),
                originX: 0.5,
                originY: 0.5,
                texture: item.texture,
                hoverTexture: item.hoverTexture,
                callBack: item.callBack
            });
        });
    }

    resumeGame() {
        game.scene.stop("PauseScene");
        game.scene.resume(SectorSwapper.getCurrentSceneKey());
    }

    generateKeyController() {
        this.keyController = new KeyController(this);
    }

    update(time, delta) {
        super.update(time, delta);
        this.keyController.update();

        if (this.keyController.pressed('pause')) {
            this.resumeGame();
        }
    }
}