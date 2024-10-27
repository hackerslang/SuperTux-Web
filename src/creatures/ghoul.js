class Ghoul extends Enemy {
    constructor(config) {
        super(config);

        this.body.setVelocity(0, 0).setBounce(0, 0).setCollideWorldBounds(false);
        this.killAt = 0;
        this.direction = 0;
        this.anims.play("ghoul");
        this.firstActivated = false;
        this.body.height = 70;
        this.body.width = 65;
    }

    update(time, delta) {
        if (!this.activated()) {
            return;
        }

        if (!this.firstActivated) {
            this.activateStartMoving();
        }

        super.update(time, delta);
        super.enemyCollideTurn();
        super.playerCollideTurn();
        console.log(this);
        if (!this.killFalling) {
            this.scene.physics.world.collide(this, this.scene.groundLayer);

            if (!this.player.isDead()) {
                this.scene.physics.world.collide(this, this.player, this.playerHit);
            }
        }

        if (this.killAt !== 0) {
            this.body.setVelocityX(0);

            if (!this.killFalling) {
                this.setTexture("ghoul-squished");
            } else {
                this.setTexture("ghoul-1");
            }

            this.killAt -= delta;
            if (this.killAt <= 0) {
                this.kill();
            }
            return;
        }

        super.walkAndTurnOnEdge();
    }

    activateStartMoving() {
        this.firstActivated = true;

        this.direction = this.DIRECTION_LEFT;
        this.body.velocity.x = this.direction * 100;
    }

    playerHit(enemy, player) {
        if (enemy.verticalHit(enemy, player)) {
            player.enemyBounce(enemy);
            enemy.getFlat();
        } else if (player.invincible) {
            enemy.killNoFlat();
        } else {
            enemy.hurtPlayer(enemy, player);
        }
    }

    getFlat() {
        super.getFlat("ghoul-squished");
    }

    killNoFlat() {
        super.killNoFlat("ghoul-1");
    }

    slideKill() {
        this.anims.play("ghoul-1");
        this.killAt = 1500;
        this.killFalling = true;
        this.groundLayerCollider.destroy();
    }
}