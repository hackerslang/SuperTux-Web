export var PlatformState = {
    STATE_STILL: 0,
    STATE_TREMBLING: 1,
    STATE_FALLING: 2
}

export class FallingPlatform extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);
        this.body.setVelocity(0, 0).setBounce(0, 0).setCollideWorldBounds(false);
        this.body.setImmovable(true);
        this.body.setAllowGravity(false);
        this.setTexture(config.texture);
        this.id = config.id;
        this.setDepth(1000);
        this.setOrigin(0, 0);
        this.body.setSize(config.width, config.height);
        this.player = config.player;
        this.scene = config.scene;
        this.playerTouched = false;
        this.state = PlatformState.STATE_STILL;
        this.MAX_STILL_DELTA = 500;
        this.MAX_TREMBLE_DELTA = 700;
        this.stillDelta = 0;
        this.trembleDelta = 0;
        this.fallDelta = 0;
        this.trembleFlag = false;
        this.originalX = config.x;
        this.originalY = config.y;
        this.initFall = true;
        this.pushable = false;

        this.playerCollides = true;
    }

    update(time, delta) {
        this.scene.physics.world.collide(this, this.player, this.playerHit);

        if (this.playerTouched) {
            if (this.state == PlatformState.STATE_STILL) {
                this.stayStill(delta);
            }
            if (this.state == PlatformState.STATE_TREMBLING) {
                this.tremble(delta);

                if (this.doneTrembling()) {
                    this.fall(delta);
                }
            }
        }
    }

    playerHit(platform, player) {
        platform.playerTouched = true;
    }

    stayStill(delta) {
        if (this.stillDelta < this.MAX_STILL_DELTA) {
            this.stillDelta += delta;
        } else {
            this.state = PlatformState.STATE_TREMBLING;
        }
    }

    tremble(delta) {
        this.trembleDelta += delta;

        if (!this.trembleFlag) {
            var rndX = Math.floor(Math.random() * 4) - 2;
            var rndY = Math.floor(Math.random() * 4) - 2;

            this.x += rndX;
            this.y += rndY;
        } else {
            this.x = this.originalX;
            this.y = this.originalY;
        }

        this.trembleFlag = !this.trembleFlag;
    }

    doneTrembling() {
        return this.trembleDelta >= this.MAX_TREMBLE_DELTA;
    }

    fall(delta) {
        this.body.setImmovable(false);
        this.body.setAllowGravity(true);
        this.state = PlatformState.STATE_FALLING;

        if (this.initFall) {
            this.body.velocity.y = 1000;
            this.initFall = false;
        }

        if (this.fallDelta > 80) {
            this.body.velocity.y += 200;
        }

        this.fallDelta += delta;
    }
}