class BounceableBlock extends Phaser.GameObjects.Sprite {
    constructor(config) {
        this.block = config.block;
        this.startY = config.y;

        this.playerHasPreviouselyHitWhileInAir = false;
    }

    update(time, delta) {
        if (!this.done) {
            this.body.setImmovable(true);

            if (!this.player.killed) {
                //this.scene.physics.world.collide(this, this.player, this.blockHitPlayer);

                if (this.hitFromBelow()) {
                    this.blockHitPlayer(this, this.player);
                }
            }

            return;
        }

        if (!this.player.killed) {
            if (!this.player.jumping) {
                this.hasPreviouselyHitWhileInAir = false;
            }

            if (this.player.jumping && !this.playerHasPreviouselyHitWhileInAir) {
                this.playerHasPreviouselyHitWhileInAir = true;
            }
        }
    }

    blockHitPlayer(block, player) {
        if (block == null) { return; }
        if (block.body == null) { return; }
        block.body.setVelocityY(0);
        //if (!block.done && brick.hitFromBelow(block, player)) {
            block.bounce();
            block.playerHitEvents();
        //}
    }

    //hitFromBelow() {
    //    if (!this.player.isActiveAndAlive()) {
    //        return false;
    //    }

    //    return (this.player.body.top <= this.body.bottom + 3 && this.player.body.top >= this.body.bottom)
    //        && (this.player.body.right >= this.body.left - 8 && this.player.body.left <= this.body.right + 8);
    //}

    playerHitEvents() {
        // Template method pattern, subclasses can override this method or leave it empty!
    }

    startBounce(creature) {
        var centerOfHitter = creature.x + (creature.width / 2);
        var offset = (this.x - centerOfHitter) * 2 / this.width;

        if (offset < 2 || offset > 2) {
            offset = 0;
        }

        this.block.angle = this.BUMP_ROTATION_ANGLE * offset;
        this.addYoyoTween();
    }

    bounce() {
        this.scene.tweens.add({
            targets: this,
            y: this.y - 32,
            yoyo: true,
            duration: 100,
            onUpdate: () => {
                this.update();
            },
            onComplete: () => {
                this.y = this.startY;
                this.body.setImmovable(true);
                this.block.angle = 0;

                this.bounceComplete();
            }
        });
    }

    bounceComplete() {
        // Template method pattern, subclasses can override this method or leave it empty!
    }
}