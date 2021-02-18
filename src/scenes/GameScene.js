class GameScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'GameScene' 
        });

        this.MIN_DELTA = 80;
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

    getKeyController() {
        return this.keyController;
    }

    preload() {
        this.tux = new Tux({
            scene: this,
            x: 0,
            y: 0
        });

        this.loadTuxImages();
        this.generateKeyController();
        this.level1 = new Level1({ scene: this, player: this.tux });
        this.level1.preload();

        
        
        
        
    }

    create() {
        var backgroundImage = this.add.image(0, 0, 'arctic-background');
        backgroundImage.setOrigin(0, 0.2);
        //backgroundImage.fixedToCamera = true;
        backgroundImage.scrollFactorX = 0;
        backgroundImage.scrollFactorY = 0;

        this.makeAnimations();
        this.tux.setSprite(this.add.sprite(0, 0, 'tux-stand'));
        this.tux.getSprite().body.setCollideWorldBounds(true);

        this.level1.create();
        this.physics.world.enable(this.tux.sprite);
        this.physics.world.setBoundsCollision(true, true, true, true);
        this.cameras.main.setBounds(0, 0, this.level1.getLevelData()[0].length * 32, 21 * 32);
        this.cameras.main.startFollow(this.tux.sprite);

        
    }

    loadTuxImages() {
        var tuxPath = './assets/images/creatures/tux/';
        this.N_TUX_RUN = 6;
        this.load.image("tux-duck", tuxPath + "duck-0.png");
        this.load.image("tux-skid", tuxPath + "skid-0.png");
        this.load.image('tux-gameover-1', tuxPath + 'gameover-0.png');
        this.load.image('tux-gameover-2', tuxPath + 'gameover-1.png');
        this.load.image('tux-stand', tuxPath + 'stand-0.png');
        this.load.image('tux-idle-1', tuxPath + 'idle-0.png');
        this.load.image('tux-idle-2', tuxPath + 'idle-1.png');
        this.load.image('tux-jump-0', tuxPath + 'jump-0.png');
        for (let i = 0; i < this.N_TUX_RUN; i++) {
            this.load.image('tux-run-' + (i + 1), tuxPath + 'walk-' + i + '.png');
        }


    }

    makeAnimations() {

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
    }


    update(time, delta) {
        this.getKeyController().update();
        this.tux.update(time, delta);
        this.tux.draw();
    }
}
