import { GameSession } from '../../object/game_session.js';

export class LivesDisplay {
    constructor(config) {
        this.scene = config.scene;
        this.level = config.level;
        this.scrollFactorX = 0;
        this.scrollFactorY = 0;
        this.toggleBorder = false;
        this.START_COINS_TEXT_X = 73;
        this.Y = 50;
        this.digitImages = [];
    }

    create() {
        this.initLivesSprite();
        this.setLives(GameSession.getLives());
    }

    initLivesSprite() {
        var livesDisplayImage = this.scene.add.sprite(40, this.Y, "lives");

        livesDisplayImage.scrollFactorX = 0;
        livesDisplayImage.scrollFactorY = 0;
    }

    setLives(n) {
        var livesString = n.toString();
        var livesChars = livesString.split("");
        var startX = this.START_COINS_TEXT_X;

        this.clearDigitImages();
        this.digitImages = [];

        for (var i = 0; i < livesChars.length; i++) {
            var currentChar = livesChars[i];
            var charImage = this.scene.add.sprite(startX, this.Y, "medium-font-" + currentChar);
            this.scene.add.existing(charImage);

            charImage.scrollFactorX = 0;
            charImage.scrollFactorY = 0;

            this.digitImages.push(charImage);

            startX += charImage.width;
        }
    }

    clearDigitImages() {
        for (var i = 0; i < this.digitImages.length; i++) {
            this.digitImages[i].destroy();
        }
    }
}