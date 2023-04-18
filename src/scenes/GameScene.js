class LevelFactory {
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

    makeLevel (levelData) {
        switch (levelData.landscape) {
            case 'snow':
                return new SnowLevel(levelData, this.scene);
            case 'castle':
                return new CastleLevel(levelData, this.scene);
            case 'castle2':
                return new CastleLevel(levelData, this.scene, "castle2");
        }
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'GameScene' 
        });

        this.levelFactory = new LevelFactory(this);
        this.imageLoader = new ImageLoader({ scene: this });
        this.animationLoader = new AnimationLoader({ scene: this });

        this.DEFAULT_FRAMERATE = 10;
        this.REPEAT_INFINITELY = -1;

        this.UI_PATH = './assets/images/ui/';
        this.TUX_PATH = './assets/images/creatures/tux/';
        this.COIN_PATH = './assets/images/objects/';
        this.BLOCK_PATH = './assets/images/level/blocks/';
        this.SPIKE_PATH = './assets/images/objects/spikes/';
        this.KROSH_PATH = './assets/images/creatures/krosh/';
        this.FISH_PATH = './assets/images/creatures/fish/';
        this.GHOUL_PATH = './assets/images/creatures/ghoul/';
        this.JUMPY_PATH = './assets/images/creatures/jumpy/';
        this.POWER_UP_PATH = './assets/images/powerups/';
        this.SNOW_SPRITES_PATH = './assets/images/level/snow/';
        this.CASTLE_SPRITES_PATH = './assets/images/level/castle/';
        this.SNOWBALL_PATH = './assets/images/creatures/snowball/';
        this.BOUNCING_SNOWBALL_PATH = './assets/images/creatures/bouncing_snowball/';
        this.FLYING_SNOWBALL_PATH = './assets/images/creatures/flying_snowball/';
        this.MR_ICEBLOCK_PATH = './assets/images/creatures/mr_iceblock/';
        this.MR_BOMB_PATH = './assets/images/creatures/mr_bomb/';
        this.ARROW_PATH = './assets/images/level/arrow/';
        this.PARTICLES_PATH = './assets/images/particles/';
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
        this.generateKeyController();
        this.currentLevel = this.levelFactory.getLevel(0);
        this.currentLevel.preload();
    }

    create() {
        this.makeAnimations();
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
        this.loadPowerupImages();
        this.loadSnowImages();
        this.loadCastleImages();
        this.loadWayArrowImages();
        this.loadBackgroundImages();
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
        var N_COINS = 16;

        this.loadSpriteSheet('coin', this.COIN_PATH + 'coins', 32, 32, N_COINS);
    }

    loadBlockImages() {
        this.loadSpriteSheet('wood', this.BLOCK_PATH + 'wood', 32, 32, 4);
        this.loadImage('wood-single', this.BLOCK_PATH  + 'wood-tiny');
        this.loadImage('bonus-block', this.BLOCK_PATH  + 'bonus-block');
        this.loadImage('bonus-block-empty', this.BLOCK_PATH  + 'block-empty');
        this.loadImage('brick', this.BLOCK_PATH + 'brick');
        this.loadMultipleImages('brick-piece', this.BLOCK_PATH + 'brick_piece', 1, 6);
    }

    loadSpikeImages() {
        this.loadImage('spike-up', this.SPIKE_PATH + 'spikeup'); 
        this.loadImage('spike-down', this.SPIKE_PATH + 'spikedown');
        this.loadImage('spike-left', this.SPIKE_PATH + 'spikeleft');
        this.loadImage('spike-right', this.SPIKE_PATH + 'spikeright');
    }

    loadKroshImages() {
        this.imageLoader.loadImagesFromData("krosh"); 
    }

    loadFishImages() {
        this.imageLoader.loadImagesFromData("fish");
    }

    loadGhoulImages() {
        this.imageLoader.loadImagesFromData("ghoul");
    }

    loadJumpyImages() {
        this.imageLoader.loadImagesFromData("jumpy");
    }

    loadPowerupImages() {
        this.imageLoader.loadImagesFromData("powerup");
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
        this.imageLoader.loadImagesFromData("snowball");
    }

    loadBouncingSnowBallImages() {
        this.imageLoader.loadImagesFromData("bouncing-snowball");
    }

    loadFlyingSnowBallImages() {
        this.imageLoader.loadImagesFromData("flying-snowball");
    }

    loadMrIceBlockImages() {
        this.imageLoader.loadImagesFromData("mr-iceblock");
    }

    loadMrBombImages() {
        this.imageLoader.loadImagesFromData("mr-bomb");
    }

    loadWayArrowImages() {
        this.imageLoader.loadImagesFromData("arrow");
    }

    loadParticleImages() {
        this.loadSparkleImages();
        this.loadSmokeImages();
    }

    loadSparkleImages() {
        this.loadMultipleImages('sparkle-', this.PARTICLES_PATH + 'sparkle-', 0, 1);
        this.loadMultipleImages('sparkle-dark-', this.PARTICLES_PATH + 'sparkle-dark-', 0, 1);
    }

    loadSmokeImages() {
        this.loadMultipleImages('smoke-', this.PARTICLES_PATH + 'smoke-', 1, 6);
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
        this.createAnimation(
            {
                key: "mrbomb-left",
                frames: [
                    { key: "mrbomb-left-1" },
                    { key: "mrbomb-left-2" },
                    { key: "mrbomb-left-3" },
                    { key: "mrbomb-left-4" },
                    { key: "mrbomb-left-5" },
                    { key: "mrbomb-left-6" },
                    { key: "mrbomb-left-7" },
                    { key: "mrbomb-left-8" }
                ],
                frameRate: 10,
                repeat: -1
            }
        );

        this.createAnimation(
            {
                key: "mrbomb-exploding-left",
                frames: [
                    { key: "mrbomb-exploding-0" },
                    { key: "mrbomb-exploding-1" },
                    { key: "mrbomb-exploding-2" },
                    { key: "mrbomb-exploding-3" },
                    { key: "mrbomb-exploding-4" }
                ],
                frameRate: 10,
                repeat: -1
            }
        );

        this.animationLoader.loadAnimationsFromData("sparkle");
        //this.createAnimation(
        //    {
        //        key: "sparkle-small",
        //        frames: [
        //            { key: "sparkle-0" },
        //            { key: "sparkle-1" },
        //            { key: "sparkle-0" }
        //        ],
        //        frameRate: 10,
        //        repeat: -1
        //    }
        //);

        //this.createAnimation(
        //    {
        //        key: "sparkle-medium",
        //        frames: [
        //            { key: "sparkle-0" },
        //            { key: "sparkle-1" },
        //            { key: "sparkle-0" },
        //            { key: "sparkle-1" },
        //            { key: "sparkle-0" }
        //        ],
        //        frameRate: 10,
        //        repeat: - 1
        //    }
        //);

        this.createAnimation(
            {
                key: "sparkle-dark",
                frames: [
                    { key: "sparkle-dark-0" },
                    { key: "sparkle-dark-1" },
                    { key: "sparkle-dark-0" }
                ],
                frameRate: 10,
                repeat: -1
            }
        );

        this.createAnimation(
            {
                key: "smoke",
                frames: [
                    { key: "smoke-1" },
                    { key: "smoke-2" },
                    { key: "smoke-3" },
                    { key: "smoke-4" },
                    { key: "smoke-5" },
                    { key: "smoke-6" }
                ],
                frameRate: 10,
            repeat: -1
            }
        );

        this.animationLoader.loadAnimationsFromData("tux");
        this.animationLoader.loadAnimationsFromData("ghoul");
        this.animationLoader.loadAnimationsFromData("bouncing-snowball");
        this.animationLoader.loadAnimationsFromData("snowball");
        this.animationLoader.loadAnimationsFromData("mr-iceblock");
        this.animationLoader.loadAnimationsFromData("fish");
        this.animationLoader.loadAnimationsFromData("coin");

        //this.createAnimation({
        //    key: 'coin-moving',
        //    frames: this.anims.generateFrameNumbers('coin'),
        //    frameRate: 20,
        //    repeat: -1
        //});

        this.createAnimation({
            key: 'star-moving',
            frames: this.anims.generateFrameNumbers('star'),
            frameRate: 20,
            repeat: -1
        });


        this.createAnimation(
            {
                key: 'antarctic-water',
                framesConfig: {
                    caption: 'antarctic-water-',
                    start: 1,
                    end: 8
                },
                frameRate: 5,
                repeat: -1
            }
        );

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
