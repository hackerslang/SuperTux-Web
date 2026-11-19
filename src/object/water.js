export class Water extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);

        this.body.setAllowGravity(false);
        this.player = config.player;
        this.level = config.level;
        this.scene = config.scene;
        this.id = config.id
        this.setDepth(99999);
        this.setAlpha(0.96);
        this.anims.play('antarctic-water');
        this.setOrigin(0, 0);
    }
}