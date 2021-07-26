class SnowBall extends Enemy {
    constructor(config) {
        super(config);

        this.body.setVelocity(0, 0).setBounce(0, 0).setCollideWorldBounds(false);
        this.killAt = 0;
        this.direction = 0;
        this.anims.play("snowball-walk");
        this.firstActivated = false;

        this.killFalling = false;
        this.body.setSize(30, 30, true);
        this.setOrigin(0.5, 0.5);
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

        this.scene.physics.world.collide(this, this.level.enemyGroup, this.enemyHit);

        if (!this.killFalling) {
            this.scene.physics.world.collide(this, this.scene.groundLayer);

            if (!this.player.isDead()) {
                this.scene.physics.world.collide(this, this.player, this.playerHit);
            }
        }

        if (this.killAt !== 0) {
            this.body.setVelocityX(0);

            if (!this.killFalling) {
                this.anims.play("snowball-squished");
            } else {
                this.setTexture("snowball-walk-1");
            }

            this.killAt -= delta;
            if (this.killAt <= 0) {
                this.kill();
            }
            return;
        }

        super.walkAndTurnOnEdge();

         

        

        //else if (Math.floor(this.body.x / 32)


    }

    enemyHit(thisEnemy, enemy) {
        enemy.walkAndTurnCollideEnemy(thisEnemy);
        thisEnemy.walkAndTurnCollideEnemy(enemy);
    }

    activateStartMoving() {
        this.firstActivated = true;

        this.direction = this.DIRECTION_LEFT;
        this.body.velocity.x = this.direction * 100;
    }

    playAnimation(key) {
        this.anims.play(key, true);
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

    killNoFlat() {
        super.killNoFlat("snowball-walk-0");
    }

    getFlat() {
        super.getFlat("snowball-squished");
    }

    slideKill() {
        this.anims.play("snowball-walk");
        this.killAt = 1500;
        this.killFalling = true;
        this.groundLayerCollider.destroy();
    }
}