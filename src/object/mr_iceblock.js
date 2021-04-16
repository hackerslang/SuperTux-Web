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
        this.body.setSize(45,30);

        this.width = 100;
    }

    create() {
        this.createWalkAnimation();
    }

    createWalkAnimation() {

    }

    update(time, delta) {
        this.scene.physics.world.collide(this, this.scene.groundLayer);

        if (!this.player.isDead()) {
            this.scene.physics.world.collide(this, this.player, this.playerHit);
        }

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
            if (this.body.x <= 10 || this.isAtEdgeLeft() && !this.turnedAroundLeft) {
                this.direction = this.DIRECTION_RIGHT;
                this.body.velocity.x = this.direction * 100;
                this.flipX = true;
                this.turnedAroundLeft = true;
                this.turnedAroundRight = false;
            } else if (this.isAtEdgeRight() && !this.turnedAroundRight) { //no ground below
                this.direction = this.DIRECTION_LEFT;
                this.body.velocity.x = this.direction * 100;
                this.flipX = false;
                this.turnedAroundLeft = false;
                this.turnedAroundRight = true;
            }
        } else {
            
        }
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
        if (enemy.stomped) {
            enemy.slide(player);
        } else if (enemy.verticalHit(enemy, player)) {
            player.enemyBounce(enemy);
            enemy.makeStomped();
        } else {
            enemy.hurtPlayer(enemy, player);
        }
    }

    enemyHit(thisEnemy, enemy) {
        if (this.sliding) {

        }
    }

    hit(enemy, player) {
        if (this.stomped) {
            this.slide(player);
        } else {
            this.makeStomped();
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

    slideKillOther(thisEnemy, other) {
        other.slideKill();
    }
}