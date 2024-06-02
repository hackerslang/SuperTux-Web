class Slope extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);
        
        this.body.setImmovable(true);
        this.body.setAllowGravity(false);
        this.player = config.player;
        this.level = config.level;
        this.scene = config.scene;
        this.id = config.id;
        this.setTexture(config.texture);

        this.slopeCollisionBlocks = config.slopeCollisionBlocks;
        this.setDepth(100);

        this.init();
    }

    init() {
        var self = this;
        this.slopeCollisionBlock.forEach(
            (collisionBlock) => {
                var realX = Math.floor(self.x / 32);
                var realY = Math.floor(self.y / 32);
                var particle = self.scene.add.sprite(realX * 32 + collisionBlock.x, realY * 32 + collisionBlock.y, 'slope-particle');
                particle.setDepth(200);
            }
        );
    }
}