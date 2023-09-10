class BonusBlock extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);
        this.body.setVelocity(0, 0).setBounce(0, 0).setCollideWorldBounds(false);

        this.body.setAllowGravity(false);
        this.player = config.player;
        this.level = config.level;
        this.scene = config.scene;
        this.id = config.id;
        this.powerupType = config.powerupType;
        this.setTexture("bonus-block");
        this.startY = config.y;
        this.isEmpty = false;
        this.done = false;
        this.setOrigin(0, 0);
        this.body.setBounce(0);
        this.body.setImmovable(true);
        this.gotHitByPlayer = false;
        this.releasedPowerUp = false;
        this.hitSide = "none";
        this.content = config.content;
        this.powerup = false;

        this.CONTENT_COIN = 'coin';

        if (config.powerupType != null) {
            this.content = config.powerupType;
            this.powerup = true;
        }

        this.hitCounter = 1;

        if (config.hitCounter != null) {
            this.hitCounter = config.hitCounter;
        }

        

        this.scene.physics.add.collider(this.player, this);
    }

    update(time, delta) {
        if (this.hitCounter > 0 && !this.playerHasPreviouselyHitWhileInAir) {
            this.body.setImmovable(true);
            this.body.setVelocityY(0);
            this.tryOpen();
            this.startBounce();
        }
        
    }

    hit() {
        this.tryOpen();
    }


    getDirectionOnHit() {
        if (this.player.body.x > this.body.x) {
            return -1;
        }

        return 1;
    }

    tryOpen() {
        if (this.powerup) {
            this.releasePowerUp(this.getDirectionOnHit());
        } else if (this.content == this.CONTENT_COIN) {
            this.level.addBouncyCoin(this.x, this.y - 32, true);
            this.level.addCollectedCoin();
        }

        if (this.hitCounter == 1) {
            this.setTexture("bonus-block-empty");
        }

        this.hitCounter--;
    }

    releasePowerUp(direction) {
        if (!this.releasedPowerUp) {
            if (this.powerupType == 'star') {
                this.level.addStar(this.x, this.y - 32, direction);
            } else if (this.powerupType == 'egg') {
                this.level.addEgg(this.x, this.y - 32, direction);
            }

            this.releasedPowerUp = true;
        }
    }

    bounceComplete() {

    }

    hitFromBelow() {
        if (!this.player.isActiveAndAlive()) {
            return false;
        }

        return (this.player.body.top <= this.body.bottom + 3 && this.player.body.top >= this.body.bottom)
            && (this.player.body.right >= this.body.left - 8 && this.player.body.left <= this.body.right + 8);
    }

    remove() {
        this.level.removeBlock(this);
    }
}