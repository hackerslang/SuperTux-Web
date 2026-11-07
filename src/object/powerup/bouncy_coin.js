export class BouncyCoin extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        config.scene.add.existing(this);

        this.sector = config.sector;
        this.id = config.id;
        this.FADE_TIME = 200;
        this.LIFE_TIME = 500;
        this.timer = this.LIFE_TIME;
        this.emergeDistance = config.emerge ? 32 : 0;
        this.alpha = 1;
        this.isScheduledForRemoval = false;

        this.anims.play('coin-moving');
        this.setOrigin(0, 0);
    }

    update(time, delta) {
        if (this.isScheduledForRemoval) {
            return;
        }

        const distance = -200 * (delta / 1000);

        this.timer -= delta;
        this.y += distance;
        this.emergeDistance += distance;

        if (this.timer <= 0) {
            this.isScheduledForRemoval = true;
            this.scene.removeBouncyCoin(this);
            this.destroy();

            return;
        }

        this.draw();
    }

    draw() {
        var timeLeft = this.timer;
        var fading = timeLeft < this.FADE_TIME;
        if (fading) {
            var alpha = timeLeft / this.FADE_TIME;
            this.setAlpha(alpha);
        }

        if (this.emergeDistance > 0) {
            this.setDepth(895);
        } else {
            this.setDepth(905);
        }
    }
}
