class FlyingSnowBall extends Enemy {
    constructor(config) {
        super(config);

        this.killAt = 0;
        this.direction = 0;
        this.anims.play('flying-snowball');
        this.body.setAllowGravity(false);

        this.body.setSize(36, 41, true);
        this.setOrigin(0.5, 0.5);

        this.totalElapsedTime = 0;
        this.GLOBAL_SPEED_MULT = 0.8;
        this.PUFF_INTERVAL_MIN = 4;
        this.PUFF_INTERVAL_MAX = 8;
        this.startPositionY = this.y;
        this.puffTimer = -1;
    }

    activate() {
        this.startPuffTimer();
    }

    startPuffTimer() {
        this.puffTimer = Math.floor(Math.random() * (this.PUFF_INTERVAL_MAX - this.PUFF_INTERVAL_MIN));
    }

    update(time, delta) {
        if(!this.player.isDead()) {
            this.scene.physics.world.collide(this, this.player, this.playerHit);
        }

        this.scene.physics.world.collide(this, this.level.groundLayer);

        this.puffTimer -= delta;

        this.totalElapsedTime = (this.totalElapsedTime + delta) % ((2 * Math.PI) / this.GLOBAL_SPEED_MULT);

        var targetDelta = this.totalElapsedTime * this.GLOBAL_SPEED_MULT;
        var targetHeight = Math.pow(Math.sin(targetDelta), 3) +
            Math.sin(3 * ((targetDelta - Math.PI) / 3)) /3;

        targetHeight = targetHeight * 100 + this.startPositionY;
        
        this.body.setVelocityY(targetHeight - this.y);
        
        if (!this.player.isDead()) {
            if(this.player.x > this.x) {
                this.flipX = true;
                this.body.velocity.x = 100;
            } else {
                this.body.velocity.x = -100;
                this.fipX = false;
            }
        }

        if (this.puffTimer <= 0 && this.activated()) {
            var smokeParticle = new Particle({
                scene: this.scene,
                key: "smoke",
                level: this.level,
                x: this.x,
                y: this.y,
                depth: 100
            });

            smokeParticle.body.setVelocityX(Math.floor(Math.random() * 20) - 10);
            smokeParticle.body.setVelocityY(150);

            this.startPuffTimer();
        }
    }

    playerHit(enemy, player) {
        if (!enemy.verticalHit(enemy, player) && !player.invincible) {
            enemy.hurtPlayer(enemy, player);
        } else if (enemy.verticalHit(enemy, player)) {
            enemy.squished();
        } else if (player.invincible) {
            enemy.killNoFlat();
        } else {
            enemy.hurtPlayer(enemy, player);
        }
    }

    killNoFlat() {
        super.killNoFlat("flying-snowball-0");
    }

    squished() {
        this.getFlat("flying-snowball-squished");
    }
}