class Bomb extends Enemy {
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
        this.body.setSize(45, 30, true);
        this.setOrigin(0.5, 0.5);
    }

    update(time, delta) {
        super.update(time, delta);

        if (!this.player.isDead()) {
            this.scene.physics.world.collide(this, this.player, this.playerHit);
        }

        this.scene.physics.world.collide(this, this.level.groundLayer);

        //if (this.isGrabbed()) { return; }

        if (this.body.blocked.down || this.body.blocked.up) {
            this.body.setVelocityY(0);
        }

        if (this.body.blocked.left || this.body.blocked.right) {
            this.body.setVelocityY(-this.body.getVelocityY());
        }
    }

    explode() {

    }

    playerHit(enemy, player) {

    }
}