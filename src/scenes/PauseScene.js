class PauseScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'PauseScene'
        });
    }

    preload() {
        this.generateKeyController();
        var fontLoader = new FontLoader();

        fontLoader.loadFont(this, "SuperTuxSmallFont");
        fontLoader.loadFont(this, "SuperTuxBigFont");
    }

    create() {
        var rect = this.add.rectangle(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, 0xffffff, 0);

        rect.setOrigin(0, 0);
        rect.setInteractive();

        this.createPauseRect();
    }

    createPauseRect() {
        var fontLoader = new FontLoader();
        var text1 = "Game Paused";
        var text2 = "Press P to unpause ...";
        var text1X = (CANVAS_WIDTH / 2) - (22 * text1.length / 2);
        var text2X = (CANVAS_WIDTH / 2) - (18 * text2.length / 2);
        var textY1 = (CANVAS_HEIGHT - 24 - 20 - 10) / 2;
        var textY2 = (CANVAS_HEIGHT - 24 - 20 - 10) / 2 + 30;
        var padding = 30;
        var pauseX1 = text2X - padding;
        var pauseX2 = text2X + (18 * text2.length);
        var pauseY1 = textY1 - padding;
        var pauseY2 = textY2 + padding;
        var pauseRect = this.add.rectangle(pauseX1, pauseY1, pauseX2 - pauseX1, pauseY2 - pauseY1, 0x000000, 0.5);

        pauseRect.setOrigin(0, 0);
        pauseRect.setInteractive();
        fontLoader.displayText(this, "SuperTuxBigFont", text1X, textY1, text1);
        fontLoader.displayText(this, "SuperTuxSmallFont", text2X, textY2, text2);
    }

    resumeGame() {
        game.scene.stop("PauseScene");
        game.scene.resume(currentSceneKey);
    }

    generateKeyController() {
        this.keys = {
            'pause': this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P)
        };

        this.keyController = new KeyController(this.keys, this);
    }

    update(time, delta) {
        this.keyController.update();

        if (this.keyController.pressed('pause')) {
            this.resumeGame();
        }
    }
}