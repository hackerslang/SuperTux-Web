class PlusPowerUp extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);
        this.body.setVelocity(0, 0).setBounce(0, 0).setCollideWorldBounds(false);

        this.incollectableForTimer = 0;

        if (this.incollectableForTimer != null) {
            this.incollectableForTimer = config.incollectableForTimer;
        }

        this.body.setAllowGravity(true);
        this.player = config.player;
        this.sector = config.sector;
        this.scene = config.scene;
        this.id = config.id
        this.anims.play('plus-flickering');
        this.body.setBounce(0);
        this.body.setImmovable(true);
        this.direction = config.direction;
        this.initialDirection = this.direction;

        this.body.velocity.y = - 150;
        this.body.velocity.x = this.direction * 90;

        this.startedTimer = 1500;
        this.bounceBack = false;
    }

    update(time, delta) {
        if (this.killed) {
            this.scene.powerupGroup.remove(this);
            this.destroy();

            return;
        }

        if (this.incollectableForTimer > 0) {
            this.incollectableForTimer -= delta;
        }

        if (this.startedTimer > 0) {
            this.startedTimer -= delta;
        }

        if (this.startedTimer <= 0) {
            if (!this.bounceBack) {
                this.body.acceleration.x += (this.direction * -1) + (delta / 50);
                this.angle += this.direction * 2;
                if (Math.abs(this.body.velocity.x) < 15) {
                    this.body.velocity.x = 0;
                    this.body.acceleration.x = 0;
                    this.bounceBack = true;
                }
            }
        } else {
            this.angle += this.direction * 5;
        }

        this.scene.physics.world.collide(this, this.scene.groundLayer);
        this.scene.physics.world.collide(this, this.scene.woodGroup);
        this.scene.physics.world.collide(this, this.scene.blockGroup);

        this.scene.physics.world.overlap(this, this.player, this.collected);
    }

    collected(plus, player) {
        if (plus.incollectableForTimer <= 0) {
            plus.collect(plus, player);
        }
    }

    collect(plus, player) {
        player.addHealth(2);
        plus.killed = true;
    }
}