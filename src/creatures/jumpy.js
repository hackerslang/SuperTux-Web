class Jumpy extends Enemy {
    constructor(config) {
        super(config);

        this.body.setVelocity(0, 0).setBounce(0, 0).setCollideWorldBounds(false);
        this.killAt = 0;
        this.direction = 0;
        this.firstActivated = false;
        this.body.height = 50;
        this.changedDirectionBeforeEdge = false;
        this.turnedAroundLeft = false;
        this.turnedAroundRight = false;
        this.body.allowGravity = true;
        this.setOrigin(0.5, 0.5);
        this.JUMP_SPEED = 500;
        this.WALK_SPEED = 100;
        this.setTexture("jumpy-down");
        this.jumping = false;
        this.lastGroundY = this.y;
        this.changeAt = 0;
    }

    activeUpdate(time, delta) {         //FULLY IMPLEMENTED!!
        if (!this.player.isDead()) {
            this.scene.physics.world.collide(this, this.player, this.playerHit);
        }

        super.activeUpdate(time, delta);

        if (this.frozen) {
            return;
        }

        if (this.changeAt > 0) {
            this.changeAt -= delta;
        }
        
        if (this.isBlockedDownGroundLayer()) {
            this.body.velocity.y = -this.JUMP_SPEED;
            this.jumping = true;
            this.drawDown();
        } else if (this.body.velocity.y == 0) {
            this.drawUp();
        } else if (this.changeAt <= 0) {
            this.drawMiddle();
            this.changeAt = 100;
        }

        if (Math.abs(this.player.x - this.x) > 60) {
            if (this.player.x > this.x) {
                this.flipX = true;
                this.body.velocity.x = this.WALK_SPEED;
            } else {
                this.body.velocity.x = -this.WALK_SPEED;
                this.flipX = false;
            }
        }
    }

    drawDown() {
        this.setTexture("jumpy-down");
        this.adjustBodyDown();
    }

    drawUp() {
        this.setTexture("jumpy-up");
        this.adjustBodyUp();
    }

    drawMiddle() {
        this.setTexture("jumpy-middle");
        this.adjustBodyMiddle();
    }

    adjustBodyDown() {
        this.adjustBody(47, 46, 0, 0);
    }

    adjustBodyUp() {
        this.adjustBody(47, 54, 0, 0);
    }

    adjustBodyMiddle() {
        this.adjustBody(47, 49, 0, 0);
    }

    freeze() {
        super.freeze();

        this.setVelocityY(Math.abs(0, this.getVelocityY()));
    }

    isFreezable() {
        return true;
    }

    isFlammable() {
        return true;
    }

    isBlockedDownGroundLayer() {
        var tileX = Math.floor(this.x / 32);
        var tileY = Math.floor(this.y / 32);
        var level = this.level.getLevelData();

        if (tileY >= level.length - 1) { return false; } //must be killed

        return (level[tileY + 1][tileX] != '0');
    }

    onGround() {
        return this.slightlyAboveGround();
    }

    slightlyAboveGround() {
        let absVelocityY = Math.abs(this.body.velocity.y);
        let groundYDelta = Math.abs(this.lastGroundY - this.y);

        return (absVelocityY == 16.625 || absVelocityY == 31.25) && groundYDelta < 0.85;
    }

    playerHit(enemy, player) {
        enemy.hurtPlayer(enemy, player);
    }
}
