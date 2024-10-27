import { HealthBarBorder } from './healthbarborder.js';

export class HealthBar extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        config.scene.add.existing(this);
        this.scene = config.scene;
        this.level = config.level;
        this.currentHealth = 100;
        this.scrollFactorX = 0;
        this.scrollFactorY = 0;

        if (config.initHealth != null) {
            this.setHealth(config.initHealth * 33 + (config.initHealth > 1 ? 1 : 0), false);
        } else {
            this.setHealth(100, false);
        }

        this.healthChanged = 0;
        this.passedDelta = 0;
        this.toggleBorder = false;

        this.healthBarBorder = new HealthBarBorder({
            key: 'healthbar',
            scene: this.scene,
            x: 90,
            y: 20,
            alpha: 0
        });
    }

    setHealth(health, animation) {
        var newHealth = health * 33;

        if (newHealth >= 99) {
            newHealth = 100;
        } else if (newHealth == 67) {
            newHealth = 66;
        } else if (newHealth == 34) {
            newHealth = 33;
        }

        var image = "healthbar-" + newHealth;

        this.setTexture(image);

        if (animation == null || animation) {
            this.healthChanged = 450;
        }
    }

    update(time, delta) {
        if (this.healthChanged > 0) {
            this.healthChanged -= delta;
            this.passedDelta += delta;

            if (this.passedDelta >= 90) {
                this.passedDelta = 0;
                this.toggleBorder = !this.toggleBorder;
            }

            this.healthBarBorder.toggleVisible(this.toggleBorder);
        } else {
            this.healthBarBorder.alpha = 0;
        }
    }
}