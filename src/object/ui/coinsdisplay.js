class CoinsDisplay {
    constructor(config) {
        //super(config.scene, config.x, config.y, config.key);
        //config.scene.add.existing(this);
        this.scene = config.scene;
        this.level = config.level;
        this.scrollFactorX = 0;
        this.scrollFactorY = 0;
        this.toggleBorder = false;
        this.START_COINS_TEXT_X = 50;
        this.Y = 48;

        var coinsDisplayImage = this.scene.add.sprite(27, this.Y, "coins");

        coinsDisplayImage.scrollFactorX = 0;
        coinsDisplayImage.scrollFactorY = 0;

        this.coins = 0;
        this.digitImages = [];
    }

    create() {
        this.setCollectedCoins(0);
    }

    addCollectedCoin() {
        setCollectedCoins(++this.coins);
    }

    setCollectedCoins(n) {
        var collectedCoinsString = n.toString();
        var startX = this.START_COINS_TEXT_X;

        this.clearDigitImages();
        this.digitImages = [];
        this.collectedCoinsChars = collectedCoinsString.split("");

        for (var i = 0; i < this.collectedCoinsChars.length; i++) {
            var currentChar = this.collectedCoinsChars[i];

            var charImage = this.scene.add.sprite(startX, this.Y, "medium-font-" + currentChar);
            this.scene.add.existing(charImage);
            charImage.key = "azdkapzkpazkd";

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