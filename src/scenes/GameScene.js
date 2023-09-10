class RandomLevelFactory {
    constructor(scene) {
        this.levels = [];
        this.index = 0;
        this.scene = scene;

        this.levels.push(new LevelTheBeginningData());
        this.levels.push(new LevelTheDescentData());
        this.levels.push(new LevelCastle1Data());
    }

    getLevel(index) {
        return this.makeLevel(this.levels[index]);
    }

    getNexLevel() {
        this.index++;

        return getLevel(this.index);
    }

    makeLevel(levelData) {
        return new Level(levelData, this.scene);
        //switch (levelData.landscape) {
        //    case 'snow':
        //        return new Level(levelData, this.scene);
        //    case 'castle':
        //        return new CastleLevel(levelData, this.scene);
        //    case 'castle2':
        //        return new CastleLevel(levelData, this.scene, "castle2");
        //}
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'GameScene' 
        });

        this.world1Levels = [
            new Level(levelTheBeginningData, this)
        ];

        this.currentLevel = this.world1Levels[0];

        //this.levelFactory = new RandomLevelFactory(this);

        this.imageLoader = new ImageLoader({ scene: this });
        this.animationLoader = new AnimationLoader({ scene: this });

        this.DEFAULT_FRAMERATE = 10;
        this.REPEAT_INFINITELY = -1;
        this.COIN_PATH = './assets/images/objects/';
        this.SPIKE_PATH = './assets/images/objects/spikes/';
        this.POWER_UP_PATH = './assets/images/powerups/';
        this.SNOW_SPRITES_PATH = './assets/images/level/snow/';
        this.CASTLE_SPRITES_PATH = './assets/images/level/castle/';
    }

    generateKeyController() {
        this.keys = {
            'jump': this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
            'fire': this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL),
            'left': this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
            'right': this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
            'duck': this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
            'menu': this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
        };

        this.keyController = new KeyController(this.keys, this);
    }

    addHealthBar() {
        this.healthBar = new HealthBar({
            key: 'healthbar',
            scene: this,
            x: 90,
            y: 20
        });
    }

    addCoinsDisplay() {
        this.coinsDisplay = new CoinsDisplay({
            scene: this,
            level: this.currentLevel
        });

        this.coinsDisplay.create();
    }

    setCollectedCoins(coins) {
        this.coinsDisplay.setCollectedCoins(coins);
    }

    addCollectedCoin() {
        this.coinsDisplay.addCollectedCoin();
    }

    setHealthBar(newHealth) {
        this.healthBar.setHealth(newHealth);
    }

    getKeyController() {
        return this.keyController;
    }

    preload() {
        this.loadImages();
        this.loadSounds();
        this.generateKeyController();
        this.currentLevel.preload();
    }

    create() {
        this.makeAnimations();
        this.makeSounds();
        this.currentLevel.create();
        this.addHealthBar();
        this.addCoinsDisplay();
    }

    loadImages() {
        this.loadUIImages();
        this.loadTuxImages();
        this.loadEnemyImages();
        this.loadParticleImages();
        this.loadCoinImages();
        this.loadBlockImages();
        this.loadSpikeImages();
        this.loadIndustrialImages();
        this.loadPowerupImages();
        this.loadSnowImages();
        this.loadCastleImages();
        this.loadWayArrowImages();
        this.loadBackgroundImages();
    }

    loadSounds() {
        this.load.audio('enemy-fall', './assets/sounds/fall.wav');
    }

    makeSounds() {
        this.sound.add('enemy-fall');
    }

    loadImage(caption, path) {
        this.imageLoader.loadImage(caption, path, 'png');
    }

    loadMultipleImages(caption, path, start, end) {
        this.imageLoader.loadMultipleImages(caption, path, 'png', start, end);
    }

    loadSpriteSheet(caption, path, frameWidth, frameHeight, n) {
        this.imageLoader.loadSpriteSheet(caption, path, frameWidth, frameHeight, n);
    }

    loadImagesFromData(key) {
        this.imageLoader.loadImagesFromData(key);
    }

    loadAnimationsFromData(key) {
        this.animationLoader.loadAnimationsFromData(key);
    }

    loadUIImages() {
        this.imageLoader.loadImagesFromData("UI");
    }

    loadTuxImages() {
        this.imageLoader.loadImagesFromData("tux");
    }

    loadBackgroundImages() {
        this.imageLoader.loadImagesFromData("backgrounds");
    }

    loadEnemyImages() {
        this.loadSnowBallImages();
        this.loadBouncingSnowBallImages();
        this.loadFlyingSnowBallImages();
        this.loadMrIceBlockImages();
        this.loadMrBombImages();
        this.loadKroshImages();
        this.loadFishImages();
        this.loadGhoulImages();
        this.loadJumpyImages();
    }

    loadCoinImages() {
        this.loadImagesFromData('coin');
    }

    loadBlockImages() {
        this.loadImagesFromData("blocks");
    }

    loadSpikeImages() {
        this.loadImage('spike-up', this.SPIKE_PATH + 'spikeup'); 
        this.loadImage('spike-down', this.SPIKE_PATH + 'spikedown');
        this.loadImage('spike-left', this.SPIKE_PATH + 'spikeleft');
        this.loadImage('spike-right', this.SPIKE_PATH + 'spikeright');
    }

    loadIndustrialImages() {
        this.loadImagesFromData("industrial");
    }

    loadKroshImages() {
        this.loadImagesFromData("krosh"); 
    }

    loadFishImages() {
        this.loadImagesFromData("fish");
    }

    loadGhoulImages() {
        this.loadImagesFromData("ghoul");
    }

    loadJumpyImages() {
        this.loadImagesFromData("jumpy");
    }

    loadPowerupImages() {
        this.loadImagesFromData("powerup");
    }

    loadSnowImages() {
        this.loadImage('igloo-fg', this.SNOW_SPRITES_PATH + 'exitfg');
        this.loadImage('igloo-bg', this.SNOW_SPRITES_PATH + 'exitbg');
        this.loadImage('antarctic-water', this.SNOW_SPRITES_PATH + 'antarctic');
        this.loadSpriteSheet('icebridge', this.SNOW_SPRITES_PATH + 'icebridge', 32, 32, 4);
        this.loadMultipleImages('antarctic-water-', this.SNOW_SPRITES_PATH + 'antarctic-', 1, 8);
    }

    loadCastleImages() {
        this.loadImage('lava', this.CASTLE_SPRITES_PATH + 'lava');
        this.loadMultipleImages('lava-', this.CASTLE_SPRITES_PATH + 'lava-', 1, 8);
    }

    loadSnowBallImages() {
        this.loadImagesFromData("snowball");
    }

    loadBouncingSnowBallImages() {
        this.loadImagesFromData("bouncing-snowball");
    }

    loadFlyingSnowBallImages() {
        this.loadImagesFromData("flying-snowball");
    }

    loadMrIceBlockImages() {
        this.loadImagesFromData("mr-iceblock");
    }

    loadMrBombImages() {
        this.loadImagesFromData("mr-bomb");
    }

    loadWayArrowImages() {
        this.loadImagesFromData("arrow");
    }

    loadParticleImages() {
        this.loadSparkleImages();
        this.loadSmokeImages();
    }

    loadSparkleImages() {
        this.loadImagesFromData("sparkle");
    }

    loadSmokeImages() {
        this.loadImagesFromData("smoke");
    }

    createAnimation(key, frames, frameRate, repeat) {
        if (frameRate == null) {
            frameRate = this.DEFAULT_FRAMERATE;
        }

        if (repeat == null) {
            repeat = this.REPEAT_INFINITELY;
        }

        AnimationCreator.getInstance({ scene: this }).createAnimation(key, frames, frameRate, repeat);
    }

    makeAnimations() {
        var keys = [
            "mr-bomb", "sparkle", "smoke", "tux", "ghoul",
            "bouncing-snowball", "snowball", "mr-iceblock",
            "fish", "antarctic-water", "star-moving", "coin"
        ];

        var self = this;

        keys.forEach(key => self.loadAnimationsFromData(key));

        this.createAnimation(
            {
                key: 'lava',
                framesConfig: {
                    caption: 'lava-',
                    start: 1,
                    end: 8
                },
                frameRate: 5,
                repeat: -1
            }
        );
    }

    update(time, delta) {
        this.getKeyController().update();
        this.healthBar.update(time, delta);
        this.currentLevel.update(time, delta);
    }
}
