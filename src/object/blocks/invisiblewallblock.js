class InvisibleWallBlock extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);
        this.body.setVelocity(0, 0).setBounce(0, 0).setCollideWorldBounds(false);
        this.body.setImmovable(true);
        this.body.setAllowGravity(false);
        this.setTexture("invisible-wall");
        this.setDepth(1000);
        this.player = config.player;
        this.scene = config.scene;
        config.scene.physics.add.collider(config.player, this);
    }
}