class Coin extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);

        this.body.setAllowGravity(false);
        this.player = config.player;
        this.level = config.level;
        this.scene = config.scene;
        this.id = config.id;
        this.anims.play('coin-moving');
    }

    update(time, delta) {
        this.scene.physics.world.overlap(this, this.player, this.coinHit);
    }

    coinHit(coin, player) {
        player.level.addCollectedCoin();
        coin.remove();
        coin.destroy();
    }

    remove() {
        this.level.removeCoin(this);
    }
}