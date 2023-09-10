class BouncingSnowBall extends Enemy {
    constructor(config) {
        super(config);

        this.body.setVelocity(0, 0).setBounce(0, 0).setCollideWorldBounds(false);
        this.killAt = 0;
        this.direction = 0;
        this.setTexture('bouncing-snowball-4');
        this.firstActivated = false;

        this.body.setSize(30, 30, true);
        this.setOrigin(0.5, 0.5);

        this.JUMPSPEED = -450;
        this.BSNOWBALL_WALKSPEED = 80;
        this.animationUp = false;

        //this.on('animationcomplete', this.animCompleted, this);
    }

    initialize() {
        this.setVelocityX(this.direction == this.DIRECTION_LEFT ? -this.BSNOWBALL_WALKSPEED : this.BSNOWBALL_WALKSPEED);
    }

    update(time, delta) {

        //super.checkKillAtSquishedOrFall("snowball-squished", "bouncing-snowball-4", delta);

        if (this.killed || this.killAt > 0) {

            return;
        }

        if (!this.activated()) {

            return;
        }

        if (!this.firstActivated) {
            this.activateStartMoving();
        }

        super.update(time, delta);

        if (!this.killFalling) {
            this.scene.physics.world.collide(this, this.scene.groundLayer);

            if (!this.player.isDead()) {
                this.scene.physics.world.collide(this, this.player, this.playerHit);
            }
        }

        if (this.anims.getName() == 'bouncing-snowball-left-up') {
            this.anims.play('bouncing-snowball-left');
        } else if (this.anims.getName() == "bouncing-snowball-left") {
            if (this.anims.currentFrame.textureKey == "bouncing-snowball-8") {
                this.anims.play('bouncing-snowball-left2');
            }
        } else if (this.anims.getName() == "bouncing-snowball-left2") {
            if (this.anims.currentFrame.textureKey == "bouncing-snowball-8") {
                this.anims.play('bouncing-snowball-left');
            }
        }

        var levelTiles = this.level.getLevelData();
        var tileY = Math.floor(this.body.y / 32);
        var tileX = Math.floor(this.body.x / 32);

        super.killWhenFallenDown();

        if (levelTiles[tileY + 1][tileX] != 0 && this.body.velocity.y >= 64) {
            this.anims.play("bouncing-snowball-left-down");
        }

        if (this.body.blocked.down) {
            var bounceSpeed = -this.body.velocity.y * 0.8;

            this.body.velocity.y = Math.min(this.JUMPSPEED, bounceSpeed);
            this.anims.play('bouncing-snowball-left-up');
        } else if (this.body.blocked.up) {
            this.body.velocity.y = 0;
        } else if (this.body.blocked.left) {
            this.setVelocityX(this.BSNOWBALL_WALKSPEED);
        } else if (this.body.blocked.right) {
            this.setVelocityX(-this.BSNOWBALL_WALKSPEED);
        }
    }

    playerHit(enemy, player) {
        if (enemy.verticalHit(enemy, player)) {
            player.bounce(enemy);
            enemy.anims.play("snowball-squished");
            enemy.killSquished();
        } else if (player.invincible) {
            enemy.killNoFlat();
        } else {
            enemy.hurtPlayer(enemy, player);
        }
    }

    killNoFlat() {
        super.killNoFlat("bouncing-snowball-4");
    }

    getFlat() {
        super.getFlat("snowball-squished");
    }

    activateStartMoving() {
        this.firstActivated = true;

        this.direction = this.DIRECTION_LEFT;
        this.body.velocity.x = this.direction * this.BSNOWBALL_WALKSPEED;
    }
}