class MrIceBlock extends Enemy {
    constructor(config) {
        super(config);

        this.body.setVelocity(0, 0).setBounce(0, 0).setCollideWorldBounds(false);
        this.killAt = 0;
        this.direction = 0;
        this.anims.play("mriceblock-walk");
        this.firstActivated = false;
        this.changedDirectionBeforeEdge = false;
        this.turnedAroundLeft = false;
        this.turnedAroundRight = false;
        this.stomped = false;
        this.sliding = false;
        this.body.setSize(45,30, true);
        this.setOrigin(0.5, 0.5);
        this.width = 100;
    }

    create() {
        this.createWalkAnimation();
    }

    createWalkAnimation() {

    }

    update(time, delta) {
        super.update(time, delta);
        if (this.sliding) {
            this.enemyCollideSliding();
            this.playerCollideSliding();
        } else {
            super.enemyCollideTurn();
            super.playerCollideTurn();
        }

        if (!this.player.isDead()) {
            this.scene.physics.world.collide(this, this.player, this.playerHit);
        }

        this.scene.physics.world.collide(this, this.level.groundLayer);

        if (!this.activated()) {
            return;
        }

        if (!this.firstActivated) {
            this.activateStartMoving();
        }

        var enemies = this.level.getEnemies();

        for (var i = 0; i < enemies.length; i++) {
            var enemy = enemies[i];

            if (this !== enemy) {
                this.scene.physics.world.overlap(this, enemy, this.slideKill);
            }
        }

        if (!this.sliding) {
            super.walkAndTurnOnEdge();
        } else {
            if (this.body.blocked.left) {
                this.body.velocity.x = 300;
            } else if (this.body.blocked.right) {
                this.body.velocity.x = -300;
            }
        }
    }

    enemyCollideSliding() {
        Array.from(this.level.enemyGroup.children.entries).forEach(
            (currentEnemy) => {
                if (this.body.x != currentEnemy.body.x || this.body.y != currentEnemy.body.y) {
                    if (this.horizontalCollision(currentEnemy, this)) {
                        currentEnemy.slideKill();
                        this.slideChangeDirection();
                    } else if (this.horizontalCollision(this, currentEnemy)) {
                        currentEnemy.slideKill();
                        this.slideChangeDirection();
                    }
                }
            }
        );
    }

    playerCollideSliding() {

    }

    slideChangeDirection() {
        if (this.direction == this.DIRECTION_LEFT) {
            this.slideRight();
        } else {
            this.slideLeft();
        }
    }

    slideRight() {
        this.turnAroundSpeed(300, this.DIRECTION_RIGHT);

    }

    slideLeft() {
        this.turnAroundSpeed(300, this.DIRECTION_LEFT);
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
        if (enemy.sliding && !enemy.verticalHit(enemy, player) && !player.invincible) {
            enemy.hurtPlayer(enemy, player);
            enemy.slide(player);
        } else if (enemy.stomped) {
            enemy.slide(player);
        } else if (enemy.verticalHit(enemy, player)) {
            player.enemyBounce(enemy);
            enemy.makeStomped();
        } else if (player.invincible) {
            enemy.makeStomped();
        } else {
            enemy.hurtPlayer(enemy, player);
        }
    }

    enemyHit(thisEnemy, enemy) {
        if (thisEnemy.sliding) {
            enemy.slideKill();
        } else {
            enemy.walkAndTurnCollideEnemy(thisEnemy);
            thisEnemy.walkAndTurnCollideEnemy(enemy);
        }
    }

    makeStomped() {
        this.anims.play("mriceblock-stomped");
        this.body.setVelocityX(0);
        this.body.acceleration.x = 0;

        this.stomped = true;
        this.sliding = false;
    }

    slide(player) {
        this.direction = (player.body.x < this.body.x ? this.DIRECTION_RIGHT : this.DIRECTION_LEFT);
        this.body.velocity.x = this.direction * 300;
        this.sliding = true;
    }

    slideKill() {

    }

    slideKillOther(thisEnemy, other) {
        other.slideKill();
    }
}