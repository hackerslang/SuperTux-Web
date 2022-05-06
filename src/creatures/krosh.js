class Krosh extends Enemy {
    constructor(config) {
        super(config);

        this.body.setVelocity(0, 0).setBounce(0, 0).setCollideWorldBounds(false);
        this.killAt = 0;
        this.direction = 0;
        this.setTexture("krosh");
        this.firstActivated = false;
        this.body.setImmovable(true);
        //this.body.allowGravity = false;
        this.startY = this.body.y;
        this.stopY = config.stopY;
        this.pauseTimer = 0;
        this.busyDropping = false;
        this.scene.physics.add.collider(this, this.level.groundLayer);
        this.scene.physics.world.disable(this);
    }

    update(time, delta) {
        //if (!this.activated()) {

        //    return;
        //}

        //if (!this.firstActivated) {
        //    this.activateStartMoving();
        //}

        if (!this.player.killed) {
            this.scene.physics.world.collide(this, this.player, this.playerHit);
        }

        this.scene.physics.world.collide(this, this.level.groundLayer, this.groundHit);

        if (this.body.blocked.down) {
            this.falling = false;
            this.pauseTimer = 2000;

            return;
        }

        

        //this.scene.physics.add.collider(this, this.level.groundLayer);

        this.body.velocity.y = Math.max(-100, this.body.velocity.y);
        this.body.y = Math.max(this.startY, this.body.y);

        if (this.pauseTimer > 0) {
            this.pauseTimer -= delta;
        } else {
            if (this.body.y > this.startY && !this.falling) {
                this.body.setVelocityY(-100);
            } else if (!this.hasCollisionWithGroundLayer()) {
                if (!this.falling) {
                    this.fallTimer = 1;
                    this.falling = true;
                    this.body.y += 10;
                } else {
                    if (!this.hasCollisionWithGroundLayer()) {
                        this.body.y += 10 * this.fallTimer;
                        this.fallTimer += 1;
                    }
                }
            }
        }
    }

    collisionYLeft() {
        var tileBottom = getFirstBottomTile();



        var tileY = Math.floor(this.body.y / 32);
    }

    getFirstBottomTile() {
        var thisBodyX = Math.floor(this.body.x / 32);
        var thisBodyY = Math.floor(this.body.y / 32);

        while (this.level.level[thisBodyY][thisBodyX] == 0) {
            thisBodyY++;
        }
        

    }

    hasCollisionWithGroundLayer() {
        var realY = Math.floor(this.body.y / 32);

        if (this.level.level[realY] != 0) {
            return true;
        }

        return false;
    }

    //collisionTileSpaceLeft() {
    //    var kroshY = this.body.y;
        

    //    this.falling = false;
    //    this.pauseTimer = 2000;
    //}


    playerHit(enemy, player) {
        if (enemy.verticalHit(enemy, player)) {
            player.removeFalling();
        } else if (enemy.downHit(enemy, player) && !player.invincible) {
            enemy.hurtPlayer(enemy, player);
        }
    }
}
