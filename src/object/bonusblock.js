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
        this.id = config.id
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

        this.scene.physics.add.collider(this.player, this);
    }

    update(time, delta) {
        this.body.setImmovable(true);

        if (!this.player.killed) {
            if (this.hitFromBelow()) {
                this.blockHit();
            }
        }
    }

    blockHit() {
        if (!this.done && !this.isEmpty) {
            this.body.setImmovable(false);
            this.setTexture("bonus-block-empty");
            this.releasePowerUp(this.getDirectionOnHit());
            this.addYoyoTween();
        }

        this.gotHitByPlayer = true;
    }

    getDirectionOnHit() {
        if (this.player.body.x > this.body.x) {
            return -1;
        }

        return 1;
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

    addYoyoTween() {
        this.scene.tweens.add({
            targets: this,
            y: this.y - 32,
            yoyo: true,
            duration: 100,
            onUpdate: () => {
                this.update();
            },
            onComplete: () => {
                this.y = this.startY;
                this.done = true;
                this.body.setImmovable(true);
            }
        });
    }

    gotHit() {
        return this.gotHitByPlayer;
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
