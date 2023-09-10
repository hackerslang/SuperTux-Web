class BounceableBlock {
    constructor(config) {
        this.block = config.block;
        this.startY = config.y;

        this.playerHasPreviouselyHitWhileInAir = false;
    }

    update(time, delta) {
        this.body.setImmovable(true);

        if (!this.player.killed) {
            if (!this.player.jumping) {
                this.hasPreviouselyHitWhileInAir = false;
            }

            if (this.hitFromBelow()) {
                this.blockHit();
            }

            if (this.player.jumping && !this.playerHasPreviouselyHitWhileInAir) {
                this.playerHasPreviouselyHitWhileInAir = true;
            }
        }
    }

    blockHit() {

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
}