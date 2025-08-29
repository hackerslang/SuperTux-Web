import { game, CANVAS_WIDTH, CANVAS_HEIGHT } from '../game.js';
import { HorizontalLine, ImageButton, ClickableHoverableRecangle } from '../object/ui/menu.js';
import { MenuScene } from './menuscene.js';

export class SettingsMenuScene extends MenuScene {
    constructor(config) {
        super({ key: 'SettingsMenuScene' });
    }

    preload() {
        super.preload();
        this.imageLoader.loadImagesFromData("settingsmenu");
    }

    create() {
        super.create();
        this.makeSettingsMenu();
    }

    makeSettingsMenu() {
        var items = [
            {
                "texture": "audio",
                "hoverTexture": "audio-hover",
                "callBack": null
            },
            {
                "texture": "video",
                "hoverTexture": "video-hover",
                "callBack": null
            },
            {
                "texture": "gameplay",
                "hoverTexture": "gameplay-hover",
                "callBack": null
            },
            {
                "texture": "key-bindings",
                "hoverTexture": "key-bindings-hover",
                "callBack": null
            }
        ];

        this.menuItems = [];

        var self = this;
        var i = 0;
        var x = 50;
        var y = 150;
        var padding = 20;

        this.add.sprite(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 8, "settingsmenu-title").setOrigin(0.5, 0.5);

        var dots = [];

        new HorizontalLine({ scene: this, x: 40, y: 130, width: 1000, scale: 0.15, originX: 0, originY: 0 });

        items.forEach(item => {
            var currentY = y + i * 37;

            self.menuItems.push(
                new ImageButton({
                    scene: this,
                    x: x,
                    y: currentY,
                    originX: 0,
                    originY: 0.5,
                    scale: 0.75,
                    texture: item.texture,
                    hoverTexture: item.hoverTexture,
                    callBack: item.callBack
                }));

            var dot = this.add.sprite(x - 20, currentY, "dot").setOrigin(0, 0.5);

            dot.scale = 0.5;
            dot.alpha = 0;

            dots.push(dot);

            i++;
        });
    }
}