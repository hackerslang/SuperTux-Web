class Sparkle extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);
        this.body.setVelocity(0, 0).setBounce(0, 0).setCollideWorldBounds(false);

        this.body.setImmovable(true);
        this.body.setAllowGravity(false);
        this.key = config.key;
        this.level = config.level;
        this.scene = config.scene;
        this.body.setBounce(0);
        this.body.setImmovable(true);
        this.setDepth(1000);

        this.anims.play(this.key).once('animationcomplete', () => {
            this.destroy();
        });
    }

    update(time, delta) {
    }
}