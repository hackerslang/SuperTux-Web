export class SmallAnimatedIcon extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.texture);
        this.scene = config.scene;
        this.scene.add.existing(this);
        this.yoyoTime = config.yoyoTime || 300;
        this.setDepth(800);

        this.initAnimation();
    }

    initAnimation() {
        this.scene.tweens.add({
            targets: this,
            scaleY: { from: 1, to: 0.7 },
            duration: this.yoyoTime,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.scene.tweens.add({
            targets: this,
            angle: { from: -10, to: 10 },
            duration: this.yoyoTime,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.scene.tweens.add({
            targets: this,
            alpha: { from: 1, to: 0 },
            duration: this.yoyoTime,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
}