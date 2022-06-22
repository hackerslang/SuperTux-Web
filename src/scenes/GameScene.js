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

    loadUIImages() {
        var uiPath = "./assets/images/ui/";

        this.loadHealthBarImages(uiPath);
        this.loadCoinsDisplayImage(uiPath);
        this.loadMediumFont(uiPath);
    }

    loadHealthBarImages(uiPath) {
        var percent = ["100", "66", "33", "0"];

        for (var i = 0; i < percent.length; i++) {
            this.load.image("healthbar-" + percent[i], uiPath + "healthbar-" + percent[i] + ".png");
        }

        this.load.image("healthbar-border", uiPath + "healthbar-border.png");
    }

    loadCoinsDisplayImage(uiPath) {
        this.load.image("coins", uiPath + "coins.png");
    }

    loadMediumFont(uiPath) {
        for (var i = 0; i < 10; i++) {
            this.load.image("medium-font-" + i, uiPath + "fonts/" + i + ".png")
        }
    }

    loadTuxImages() {
        var tuxPath = './assets/images/creatures/tux/';
        this.N_TUX_RUN = 6;
        this.load.image("tux-duck", tuxPath + "duck-0.png");
        this.load.image("tux-skid", tuxPath + "skid-0.png");
        this.load.image('tux-gameover-1', tuxPath + 'gameover-0.png');
        this.load.image('tux-gameover-2', tuxPath + 'gameover-1.png');
        this.load.image('tux-stand-0', tuxPath + 'stand-0.png');
        this.load.image('tux-idle-1', tuxPath + 'idle-0.png');
        this.load.image('tux-idle-2', tuxPath + 'idle-1.png');
        this.load.image('tux-jump-0', tuxPath + 'jump-0.png');
        for (let i = 0; i < this.N_TUX_RUN; i++) {
            this.load.image('tux-run-' + (i + 1), tuxPath + 'walk-' + i + '.png');
        }
    }

    loadBackgroundImages() {
        this.load.image('pile-of-snow', './assets/images/level/snow/pile-of-snow.png');
        this.load.image('cloud', './assets/images/doodads/cloud.png');
        this.load.image('grass1', './assets/images/doodads/grass1.png');
        this.load.image('grass2', './assets/images/doodads/grass2.png');
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
        var coinPath = './assets/images/objects/';
        this.N_COINS = 16;

        this.load.spritesheet('coin', './assets/images/objects/coins.png', { frameWidth: 32, frameHeight: 32 }, this.N_COINS);
    }

    loadBlockImages() {
        var blockPath = './assets/images/level/blocks/';

        this.load.spritesheet('wood', blockPath + 'wood.png', { frameWidth: 32, frameHeight: 32 }, 4);
        this.load.image('wood-single', blockPath + 'wood-tiny.png'); 
        this.load.image('bonus-block', blockPath + 'bonus-block.png');
        this.load.image('bonus-block-empty', blockPath + 'block-empty.png');

        this.load.image('brick', blockPath + 'brick.png');

        for (var i = 1; i < 7; i++) {
            this.load.image('brick-piece' + i, blockPath + 'brick_piece' + i + '.png');
        }
    }

    loadSpikeImages() {
        var spikePath = './assets/images/objects/spikes/';

        this.load.image('spike-up', spikePath + 'spikeup.png'); 
        this.load.image('spike-down', spikePath + 'spikedown.png'); 
        this.load.image('spike-left', spikePath + 'spikeleft.png'); 
        this.load.image('spike-right', spikePath + 'spikeright.png'); 
    }

    loadKroshImages() {
        var kroshPath = './assets/images/creatures/krosh/';

        this.load.image('krosh', kroshPath + 'krosh.png'); 
    }

    loadFishImages() {
        var fishPath = './assets/images/creatures/fish/';

        for (var i = 0; i < 2; i++) {
            this.load.image('fish-up-' + i, fishPath + 'up-' + i + '.png');
        }

        this.load.image('fish-down', fishPath + 'down.png');
    }

    loadGhoulImages() {
        var ghoulPath = './assets/images/creatures/ghoul/';

        for (var i = 0; i < 8; i++) {
            this.load.image('ghoul-' + (i + 1), ghoulPath + 'g' + (i + 1) + '.png');
        }

        this.load.image('ghoul-squished', ghoulPath + 'd1.png');
    }

    loadJumpyImages() {
        var jumpyPath = './assets/images/creatures/jumpy/';

        this.load.image('jumpy-down', jumpyPath + 'left-down.png');
        this.load.image('jumpy-middle', jumpyPath + 'left-middle.png');
        this.load.image('jumpy-up', jumpyPath + 'left-up.png');
    }

    loadPowerupImages() {
        var powerupPath = './assets/images/powerups/';

        this.load.spritesheet('star', powerupPath + 'star.png', { frameWidth: 32, frameHeight: 32 }, 8); 
        this.load.image('egg', powerupPath + 'egg-shade.png');
    }

    loadSnowImages() {
        var snowSpritesPath = './assets/images/level/snow/';

        this.load.image('igloo-fg', snowSpritesPath + 'exitfg.png');
        this.load.image('igloo-bg', snowSpritesPath + 'exitbg.png');
        this.load.image('antarctic-water', snowSpritesPath + 'antarctic.png');
        this.load.spritesheet('icebridge', snowSpritesPath + 'icebridge.png', { frameWidth: 32, frameHeight: 32 }, 4);

        this.N_ANTARCTIC_WATER = 8;

        for (var i = 0; i < this.N_ANTARCTIC_WATER; i++) {
            this.load.image('antarctic-water-' + (i + 1), snowSpritesPath + 'antarctic-' + (i + 1) + '.png');
        }
    }

    loadCastleImages() {
        var castleSpritesPath = './assets/images/level/castle/';

        this.load.image('lava', castleSpritesPath + 'lava.png');

        this.N_LAVA = 8;

        for (var i = 0; i < this.N_LAVA; i++) {
            this.load.image('lava-' + (i + 1), castleSpritesPath + 'lava-' + (i + 1) + '.png');
        }
    }

    loadSnowBallImages() {
        var snowballPath = './assets/images/creatures/snowball/';
        this.N_SNOWBALL_RUN = 8;

        for (let i = 0; i < this.N_SNOWBALL_RUN; i++) {
            this.load.image('snowball-walk-' + (i + 1), snowballPath + 'snowball-' + i + '.png');
        }

        this.load.image('snowball-squished', snowballPath + 'snowball-squished-left.png');
    }

    loadBouncingSnowBallImages() {
        var bouncingSnowballPath = './assets/images/creatures/bouncing_snowball/';

        for (let i = 1; i < 4; i++) {
            this.load.image('bouncing-snowball-bounce-' + i, bouncingSnowballPath + 'bounce' + i + '.png');
        }

        for (let i = 1; i < 9; i++) {
            this.load.image('bouncing-snowball-' + i, bouncingSnowballPath + 'bs' + i + '.png');
        }
    }

    loadFlyingSnowBallImages() {
        var FLYING_SNOWBALL_PATH = './assets/images/creatures/flying_snowball/';

        for (let i = 0; i < 4; i++) {
            this.load.image('flying-snowball-' + i, FLYING_SNOWBALL_PATH + 'left-' + i + '.png');
        }

        for (let i = 0; i < 3; i++) {
            this.load.image('flying-snowball-melting-' + i, FLYING_SNOWBALL_PATH + 'melting-' + i + '.png');
        }

        this.load.image('flying-snowball-squished', FLYING_SNOWBALL_PATH + 'squished-left.png');
    }

    loadMrIceBlockImages() {
        var mrIceBlockPath = './assets/images/creatures/mr_iceblock/';
        this.N_MR_ICEBLOCK_RUN = 8;

        for (let i = 0; i < this.N_SNOWBALL_RUN; i++) {
            this.load.image('mriceblock-walk-' + (i + 1), mrIceBlockPath + 'iceblock-' + i + '.png');
        }

        this.load.image('mriceblock-stomped-0', mrIceBlockPath + 'stomped-left.png');
    }

    loadMrBombImages() {
        var mrBombPath = './assets/images/creatures/mr_bomb/';

        for (let i = 1; i < 9; i++) {
            this.load.image('mrbomb-left-' + i, mrBombPath + 'bomb' + i + '.png');
        }

        for (let i = 0; i < 5; i++) {
            this.load.image('mrbomb-exploding-' + i, mrBombPath + 'exploding-left-' + i + '.png');
        }
    }

    loadWayArrowImages() {
        var wayArrowPath = './assets/images/level/arrow/';

        this.load.image('way-arrow-left', wayArrowPath + 'large-arrow-left.png');
        this.load.image('way-arrow-right', wayArrowPath + 'large-arrow-right.png');
    }

    loadParticleImages() {
        this.loadSparkleImages();
        this.loadSmokeImages();
    }

    loadSparkleImages() {
        const PARTICLES_PATH = './assets/images/particles/';

        this.load.image('sparkle-0', PARTICLES_PATH + 'sparkle-0.png');
        this.load.image('sparkle-1', PARTICLES_PATH + 'sparkle-1.png');
        this.load.image('sparkle-dark-0', PARTICLES_PATH + 'sparkle-dark-0.png');
        this.load.image('sparkle-dark-1', PARTICLES_PATH + 'sparkle-dark-1.png');
    }

    loadSmokeImages() {
        const PARTICLES_PATH = './assets/images/particles/';

        for (let i = 1; i < 7; i++) {
            this.load.image('smoke-' + i, PARTICLES_PATH + 'smoke-' + i + '.png');
        }
    }

    makeAnimations() {
        this.anims.create(
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

        this.anims.create(
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

        this.anims.create(
            {
                key: "sparkle-small",
                frames: [
                    { key: "sparkle-0" },
                    { key: "sparkle-1" },
                    { key: "sparkle-0" }
                ],
                frameRate: 10,
                repeat: 1
            }
        );

        this.anims.create(
            {
                key: "sparkle-medium",
                frames: [
                    { key: "sparkle-0" },
                    { key: "sparkle-1" },
                    { key: "sparkle-0" },
                    { key: "sparkle-1" },
                    { key: "sparkle-0" }
                ],
                frameRate: 10,
                repeat: 1
            }
        );

        this.anims.create(
            {
                key: "sparkle-dark",
                frames: [
                    { key: "sparkle-dark-0" },
                    { key: "sparkle-dark-1" },
                    { key: "sparkle-dark-0" }
                ],
                frameRate: 10,
                repeat: 1
            }
        );

        this.anims.create(
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
                repeat: 1
            }
        );

        this.anims.create(
            {
                key: "ghoul",
                frames: [
                    { key: 'ghoul-2', width: 50, height: 50 },
                    { key: 'ghoul-3', width: 50, height: 50 },
                    { key: 'ghoul-5', width: 50, height: 50 },
                    { key: 'ghoul-5', width: 50, height: 50 },
                    { key: 'ghoul-6', width: 50, height: 50 },
                    { key: 'ghoul-7', width: 50, height: 50 },
                    { key: 'ghoul-7', width: 50, height: 50 },
                    { key: 'ghoul-7', width: 50, height: 50 },
                    { key: 'ghoul-8', width: 50, height: 50 },
                    { key: 'ghoul-1', width: 50, height: 50 },
                    { key: 'ghoul-1', width: 50, height: 50 },
                    { key: 'ghoul-1', width: 50, height: 50 },
                    { key: 'ghoul-1', width: 50, height: 50 },
                    { key: 'ghoul-1', width: 50, height: 50 },
                    { key: 'ghoul-1', width: 50, height: 50 },
                    { key: 'ghoul-1', width: 50, height: 50 },
                    { key: 'ghoul-1', width: 50, height: 50 },
                    { key: 'ghoul-1', width: 50, height: 50 }
                ],
                frameRate: 10,
                repeat: -1
            }
        );

        this.anims.create(
            {
                key: "bouncing-snowball-left",
                frames: [
                    { key: 'bouncing-snowball-1' },
                    { key: 'bouncing-snowball-2' },
                    { key: 'bouncing-snowball-3' },
                    { key: 'bouncing-snowball-4' },
                    { key: 'bouncing-snowball-5' },
                    { key: 'bouncing-snowball-6' },
                    { key: 'bouncing-snowball-7' },
                    { key: 'bouncing-snowball-8' },
                    { key: 'bouncing-snowball-8' }
                    //{ key: 'bouncing-snowball-8' }
                    //{ key: 'bouncing-snowball-8' },
                    //{ key: 'bouncing-snowball-8' }
                ],
                frameRate: 10,
                repeat: -1
            }
        );

        this.anims.create(
            {
                key: "bouncing-snowball-left2",
                frames: [
                    { key: 'bouncing-snowball-1' },
                    { key: 'bouncing-snowball-2' },
                    { key: 'bouncing-snowball-3' },
                    { key: 'bouncing-snowball-4' },
                    { key: 'bouncing-snowball-5' },
                    { key: 'bouncing-snowball-6' },
                    { key: 'bouncing-snowball-7' },
                    { key: 'bouncing-snowball-8' },
                    { key: 'bouncing-snowball-8' }
                    //{ key: 'bouncing-snowball-8' }
                    //{ key: 'bouncing-snowball-8' },
                    //{ key: 'bouncing-snowball-8' }
                ],
                frameRate: 10,
                repeat: -1
            }
        );

        this.anims.create(
            {
                key: "bouncing-snowball-left-down",
                frames: [
                    { key: 'bouncing-snowball-8' },
                    { key: 'bouncing-snowball-bounce-1' },
                    { key: 'bouncing-snowball-bounce-2' },
                    { key: 'bouncing-snowball-bounce-3' }
                ],
                frameRate: 10,
                repeat: 1
            }
        );

        this.anims.create(
            {
                key: "bouncing-snowball-left-up",
                frames: [
                    { key: 'bouncing-snowball-bounce-3' },
                    { key: 'bouncing-snowball-bounce-2' },
                    { key: 'bouncing-snowball-bounce-1' },
                    { key: 'bouncing-snowball-8' }
                ],
                frameRate: 10,
                repeat: 1
            }
        );

        this.anims.create(
            {
                key: "bouncing-snowball-squished",
                frames: [
                    { key: 'bouncing-snowball-squished' }
                ]
            }
        );

        this.anims.create(
            {
                key: "snowball-squished",
                frames: [
                    { key: 'snowball-squished' }
                ]
            }
        );

        this.anims.create(
            {
                key: 'flying-snowball',
                frames: [
                    { key: 'flying-snowball-0' },
                    { key: 'flying-snowball-2' },
                    { key: 'flying-snowball-2' },
                    { key: 'flying-snowball-3' }
                ]
            }
        );

        this.anims.create(
            {
                key: 'flying-snowball-melting',
                frames: [
                    { key: 'flying-snowball-melting-0' },
                    { key: 'flying-snowball-melting-1' },
                    { key: 'flying-snowball-melting-2' }
                ]
            }
        );


        this.anims.create(
            {
                key: "fish-up",
                frames: [{ key: 'fish-up-0' }, { key: 'fish-up-1' }],
                frameRate: 8,
                repeat: -1
            }
        );

        this.anims.create({
            key: 'coin-moving',
            frames: this.anims.generateFrameNumbers('coin'),
            frameRate: 20,
            repeat: -1
        });

        this.anims.create({
            key: 'star-moving',
            frames: this.anims.generateFrameNumbers('star'),
            frameRate: 20,
            repeat: -1
        })

        this.anims.create(
            {
                key: 'tux-duck',
                frames: [{ key: 'tux-duck-0' }],
                frameRate: 24
            }
        );

        this.anims.create(
            {
                key: 'tux-skid',
                frames: [{ key: 'tux-skid-0' }],
                frameRate: 24
            }
        );

        this.anims.create(
            {
                key: "tux-gameover",
                frames: [{ key: 'tux-gameover-1' }, { key: 'tux-gameover-2' }],
                frameRate: 8,
                repeat: -1
            }
        );

        this.anims.create(
            {
                key: 'tux-idle',
                frames: [{ key: 'tux-idle-1' }, { key: 'tux-idle-2' }],
                frameRate: 24,
                repeat: -1
            }
        );

        this.anims.create(
            {
                key: 'tux-stand',
                frames: [{ key: 'tux-stand-0' }],
                frameRate: 24
            }
        );

        this.anims.create(
            {
                key: 'tux-jump',
                frames: [{ key: 'tux-jump-0' }],
                frameRate: 24
            }
        );

        var tuxRunFrames = [];
        var i;
        for (i = 0; i < this.N_TUX_RUN; i++) {
            tuxRunFrames.push({
                key: 'tux-run-' + (i + 1)
            });
        }

        this.anims.create(
            {
                key: 'tux-run',
                frames: tuxRunFrames,
                frameRate: 12,
                repeat: -1
            }
        );

        var antarcticWaterFrames = [];
        for (var i = 0; i < this.N_ANTARCTIC_WATER; i++) {
            antarcticWaterFrames.push({
                key: 'antarctic-water-' + (i + 1)
            });
        }

        this.anims.create(
            {
                key: 'antarctic-water',
                frames: antarcticWaterFrames,
                frameRate: 5,
                repeat: -1
            }
        );

        var lavaFrames = [];
        for (var i = 0; i < this.N_LAVA; i++) {
            lavaFrames.push({
                key: 'lava-' + (i + 1)
            });
        }

        this.anims.create(
            {
                key: 'lava',
                frames: lavaFrames,
                frameRate: 5,
                repeat: -1
            }
        );

        var snowballWalkFrames = [];
        var i;
        for (i = 0; i < this.N_SNOWBALL_RUN; i++) {
            snowballWalkFrames.push({
                key: 'snowball-walk-' + (i + 1)
            });
        }

        this.anims.create(
            {
                key: 'snowball-walk',
                frames: snowballWalkFrames,
                frameRate: 12,
                repeat: -1
            }
        );

        var mrIceBlockWalkFrames = [];

        for (var i = 0; i < this.N_SNOWBALL_RUN; i++) {
            mrIceBlockWalkFrames.push({
                key: 'mriceblock-walk-' + (i + 1)
            });
        }

        this.anims.create(
            {
                key: "mriceblock-walk",
                frames: mrIceBlockWalkFrames,
                frameRate: 12,
                repeat: -1
            }
        );

        this.anims.create(
            {
                key: 'mriceblock-stomped',
                frames: [{ key: 'mriceblock-stomped-0' }],
                frameRate: 24
            }
        );
    }

    update(time, delta) {
        this.getKeyController().update();
        this.healthBar.update(time, delta);
        this.currentLevel.update(time, delta);
    }
}
