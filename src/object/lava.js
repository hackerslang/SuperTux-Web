export class Lava extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);

        this.body.setImmovable(true);
        this.body.setAllowGravity(false);
        this.player = config.player;
        this.scene = config.scene;
        this.id = config.id;
        this.anims.play('lava-flow');
        this.setOrigin(0, 0);
        this.setDepth(120);
        this.alpha = config.alpha != null ? config.alpha : 1;
    }

    update(time, delta) {
        if (!this.player.killed) {
            this.playerHit();
        }
    }

    playerHit() {
        var playerX = this.player.x;
        var playerY = this.player.y;
        var playerHeight = this.player.height;

        if (playerX >= this.x && playerX <= this.x + 128 && playerY >= this.y - playerHeight && playerY <= this.y) {
            this.player.die();
        }
    }
}