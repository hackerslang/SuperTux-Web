class LevelFactory {
    makeLevel (levelData, scene) {
        switch (levelData.landscape) {
            case 'snow':
                return new SnowLevel(levelData, scene);
            case 'castle':
                return null;
        }
    }
}

var Levels = {
    getLevel1: function (scene) {
        var levelFactory = new LevelFactory();

        return levelFactory.makeLevel(new Level1Data(), scene);
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'GameScene' 
        });
    }

    generateKeyController() {
        this.keys = {
            'jump': this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
            'fire': this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL),
            'left': this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
            'right': this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
            'duck': this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN)
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

    setHealthBar(newHealth) {
        this.healthBar.setHealth(newHealth);
    }

    getKeyController() {
        return this.keyController;
    }

    preload() {
        this.loadImages();
        this.generateKeyController();
        this.level1 = Levels.getLevel1(this);
        this.level1.preload();
    }

    create() {
        this.makeAnimations();
        this.level1.create();
        this.addHealthBar();
    }

    loadImages() {
        this.loadUIImages();
        this.loadTuxImages();
        this.loadEnemyImages();
        this.loadCoinImages();
        this.loadBlockImages();
        this.loadPowerupImages();
        this.loadSnowImages();
    }

    loadUIImages() {
        var uiPath = "./assets/images/ui/";

        this.loadHealthBarImages(uiPath);
    }

    loadHealthBarImages(uiPath){
        var percent = ["100", "66", "33", "0"];

        for (var i = 0; i < percent.length; i++) {
            this.load.image("healthbar-" + percent[i], uiPath + "healthbar-" + percent[i] + ".png");
        }

        this.load.image("healthbar-border", uiPath + "healthbar-border.png");
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

    loadEnemyImages() {
        this.loadSnowBallImages();
        this.loadMrIceBlockImages();
        this.loadKroshImages();
        this.loadFishImages();
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
        //this.load.image('fish-up-0', fishPath + 'up-0.png');
        //this.load.image('fish-up-1', fishPath + 'up-1.png');
        this.load.image('fish-down', fishPath + 'down.png');
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

    loadSnowBallImages() {
        var snowballPath = './assets/images/creatures/snowball/';
        this.N_SNOWBALL_RUN = 8;

        for (let i = 0; i < this.N_SNOWBALL_RUN; i++) {
            this.load.image('snowball-walk-' + (i + 1), snowballPath + 'snowball-' + i + '.png');
        }

        this.load.image('snowball-squished-0', snowballPath + 'snowball-squished-left.png');
    }

    loadMrIceBlockImages() {
        var mrIceBlockPath = './assets/images/creatures/mr_iceblock/';
        this.N_MR_ICEBLOCK_RUN = 8;

        for (let i = 0; i < this.N_SNOWBALL_RUN; i++) {
            this.load.image('mriceblock-walk-' + (i + 1), mrIceBlockPath + 'iceblock-' + i + '.png');
        }

        this.load.image('mriceblock-stomped-0', mrIceBlockPath + 'stomped-left.png');
    }

    makeAnimations() {
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

        this.anims.create(
            {
                key: 'snowball-squished',
                frames: [{ key: 'snowball-squished-0' }],
                frameRate: 24
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
        this.level1.update(time, delta);
    }
}
