class SnowBall extends Enemy {
    constructor(config) {
        super(config);

        this.body.setVelocity(0, 0).setBounce(0, 0).setCollideWorldBounds(false);
        this.killAt = 0;
        this.direction = 0;
        this.anims.play("snowball-walk");
        this.firstActivated = false;
        this.changedDirectionBeforeEdge = false;
        this.turnedAroundLeft = false;
        this.turnedAroundRight = false;
        this.slideKill = false;
    }

    create() {
        this.createWalkAnimation();
    }

    createWalkAnimation() {

    }

    update(time, delta) {
        if (!this.activated()) {

            return;
        }

        if (!this.firstActivated) {
            this.activateStartMoving();
        }

        this.scene.physics.world.collide(this, this.scene.groundLayer);

        if (!this.player.isDead()) {
            this.scene.physics.world.collide(this, this.player, this.playerHit);
        }

        if (this.killAt !== 0) {
            this.body.setVelocityX(0);

            if (this.doSlideKill) {
                this.body.velocity.y = 20;
                this.anims.play("snowball-walk");
            } else {
                this.anims.play("snowball-squished");
            }

            this.killAt -= delta;
            if (this.killAt <= 0) {
                this.kill();
            }
            return;
        }

        if (this.body.x <= 10 || this.isAtEdgeLeft() && !this.turnedAroundLeft) {
            this.direction = this.DIRECTION_RIGHT;
            this.body.velocity.x = this.direction * 100;
            this.flipX = true;
            this.turnedAroundLeft = true;
            this.turnedAroundRight = false;
            this.anims.play("snowball-walk");
        } else if (this.isAtEdgeRight() && !this.turnedAroundRight) { //no ground below
            this.direction = this.DIRECTION_LEFT;
            this.body.velocity.x = this.direction * 100;
            this.flipX = false;
            this.turnedAroundLeft = false;
            this.turnedAroundRight = true;
        }

        

        //else if (Math.floor(this.body.x / 32)


    }

    activateStartMoving() {
        this.firstActivated = true;

        this.direction = this.DIRECTION_LEFT;
        this.body.velocity.x = this.direction * 100;
    }

    isAtEdgeLeft() {
        var levelTiles = this.level.getLevelData();
        var tileX = Math.floor(this.body.x / 32);
        var tileY = Math.floor(this.body.y / 32);

        if (tileX <= 0 || tileY >= levelTiles.length - 1) {
            return false;
        }

        var tile = levelTiles[tileY + 1][tileX - 1];

        return (tile == 0);
    }

    isAtEdgeRight() {
        var levelTiles = this.level.getLevelData();
        var tileX = Math.floor(this.body.x / 32);
        var tileY = Math.floor(this.body.y / 32);

        if (tileX >= levelTiles[0].length - 1 || tileY >= levelTiles.length - 1) {
            return false;
        }


        var tile = levelTiles[tileY + 1][tileX + 1];

        return (tile == 0);
    }

    playAnimation(key) {
        this.anims.play(key, true);
    }

    playerHit(enemy, player) {
        if (enemy.verticalHit(enemy, player)) {
            player.enemyBounce(enemy);
            enemy.getFlat(enemy, player);
        } else if (player.invincible) { 
            enemy.getFlat();
        } else {
            enemy.hurtPlayer(enemy, player);
        }
    }

    getFlat(enemy, player) {
        this.anims.play("snowball-squished");
        this.body.height = 13;
        this.body.setVelocityX(0);
        this.body.acceleration.x = 0;
        this.killAt = 500;
    }

    slideKill() {
        this.anims.play("snowball-walk");
        this.doSlideKill = true;
        this.killAt = 500;
    }
}