class Fish extends Enemy {
    constructor(config) {
        super(config);

        this.body.setVelocity(0, 0).setBounce(0, 0).setCollideWorldBounds(false);
        this.killAt = 0;
        this.direction = 0;
        this.startY = this.body.y;
        this.firstActivated = true;
        this.body.allowGravity = true;
        this.scene.add.existing(this);
        this.groundLayerCollider.destroy();
        this.anims.play('fish-up');
        this.jumping = true;
    }

    update(time, delta) {
        if (!this.player.isDead()) {
            this.scene.physics.world.overlap(this, this.player, this.playerHit);
        }

        this.body.velocity.x = 0;

        if (this.body.y >= this.startY) {
            this.body.velocity.y = -700;
        }

        if (this.body.velocity.y > 0) {
            this.jumping = false;
            this.setTexture('fish-down');
        } else if (!this.jumping) {
            this.anims.play('fish-up');
            this.jumping = true;
        }
    }

    playerHit(enemy, player) {
        if (!player.invincible) {
            enemy.hurtPlayer(enemy, player);
        }
    }
}