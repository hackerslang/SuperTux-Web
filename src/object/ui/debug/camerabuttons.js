import { GlobalGameConfig } from '../../../game.js';

export class CameraButtons {
    constructor(config) {
        this.scene = config.scene;
        this.spriteHeight = 64;
        this.spriteWidth = 64;
        this.localDelta = 0;

        this.init();
    }

    init() {
        var spriteWidth = this.spriteWidth;
        var spriteHeight = this.spriteHeight;

        this.left = this.scene.add.sprite(30, GlobalGameConfig.height / 2, "camera-left");
        this.right = this.scene.add.sprite(GlobalGameConfig.width - 30, GlobalGameConfig.height / 2, "camera-right");
        this.up = this.scene.add.sprite(GlobalGameConfig.width / 2, 30, "camera-up");
        this.down = this.scene.add.sprite(GlobalGameConfig.width / 2, GlobalGameConfig.height - 30, "camera-down");

        this.sprites = [
            this.left,
            this.right,
            this.up,
            this.down
        ];

        var self = this;

        this.sprites.forEach((sprite) => {
            self.scene.add.existing(sprite);
            sprite.setDepth(1000);
            sprite.scrollFactorX = 0;
            sprite.scrollFactorY = 0;
        });

        this.leftRectangle = this.scene.add.rectangle(30, GlobalGameConfig.height / 2, spriteWidth, spriteHeight, 0xffffff, 0);
        this.rightRectangle = this.scene.add.rectangle(GlobalGameConfig.width - 30, GlobalGameConfig.height / 2, spriteWidth, spriteHeight, 0xffffff, 0);
        this.upRectangle = this.scene.add.rectangle(GlobalGameConfig.width / 2, 30, spriteWidth, spriteHeight, 0xffffff, 0);
        this.downRectangle = this.scene.add.rectangle(GlobalGameConfig.width / 2, GlobalGameConfig.height - 30, spriteWidth, spriteHeight, 0xffffff, 0);

        this.clickableRectangles = [
            this.leftRectangle,
            this.rightRectangle,
            this.upRectangle,
            this.downRectangle
        ];

        this.cameraMoves = [
            { x: -64, y: 0 },
            { x: 64, y: 0 },
            { x: 0, y: -64 },
            { x: 0, y: 64 }
        ];

        this.directions = [
            { cameraMove: { x: -64, y: 0 }, rectangle: this.leftRectangle, direction: "left" },
            { cameraMove: { x: 64, y: 0 }, rectangle: this.rightRectangle, direction: "right" },
            { cameraMove: { x: 0, y: -64 }, rectangle: this.upRectangle, direction: "up" },
            { cameraMove: { x: 0, y: 64 }, rectangle: this.downRectangle, direction: "down" }
        ];

        var i = 0;
        this.selectedRectangle = "none";

        this.directions.forEach((direction) => {
            var rectangle = direction.rectangle;
            var cameraMove = direction.cameraMove;

            rectangle.setInteractive();
            rectangle.scrollFactorX = 0;
            rectangle.scrollFactorY = 0;
            rectangle.on('pointerdown', function (pointer) {
                self.scene.cameras.main.stopFollow();
                self.scene.cameras.main.scrollX += cameraMove.x;
                self.scene.cameras.main.scrollY += cameraMove.y;
                self.selectedRectangle = direction.direction;
            });
            rectangle.on('pointerup', function (pointer) {
                self.selectedRectangle = "none";
            });
            i++;
        });
    }

    update(time, delta) {
        this.localDelta += delta;

        if (this.selectedRectangle !== "none" && this.localDelta > 100) {
            var cameraMove = this.directions.filter(direction => direction.direction === this.selectedRectangle)[0].cameraMove;

            this.scene.cameras.main.scrollX += cameraMove.x;
            this.scene.cameras.main.scrollY += cameraMove.y;

            this.localDelta = 0;
        }
    }
}