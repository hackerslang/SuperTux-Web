class HealthBarBorder extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        config.scene.add.existing(this);
        this.scene = config.scene;
        this.level = config.level;
        this.alpha = config.alpha;
        this.currentHealth = 100;
        this.scrollFactorX = 0;
        this.scrollFactorY = 0;
        this.setTexture("healthbar-border");
    }

    toggleVisible(visible) {
        this.alpha = visible ? 1 : 0.3;
    }
}