class StarPowerUp extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);
        this.body.setVelocity(0, 0).setBounce(0, 0).setCollideWorldBounds(false);

        this.body.setAllowGravity(true);
        this.player = config.player;
        this.level = config.level;
        this.scene = config.scene;
        this.id = config.id
        this.anims.play('star-moving');
        this.startY = config.y;
        this.isEmpty = false;
        this.done = false;
        this.body.setBounce(0);
        this.body.setImmovable(true);
        this.direction = config.direction;
        this.body.velocity.x = this.direction * 70;
    }

    update(time, delta) {
        if (this.killed) {
            this.level.powerupGroup.remove(this);
            this.destroy();

            return;
        }

        this.scene.physics.world.collide(this, this.level.groundLayer);
        this.scene.physics.world.collide(this, this.level.woodGroup); 
        this.scene.physics.world.collide(this, this.level.blockGroup);

        this.scene.physics.world.overlap(this, this.player, this.collected);

        if (this.body.blocked.down) {
            this.body.velocity.y = -300;
        }
    }

    collected(star, player) {
        player.makeInvincible();
        star.killed = true;
    }
}