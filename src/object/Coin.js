class Coin extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);

        this.body.setVelocity(0, 0).setBounce(0, 0).setCollideWorldBounds(false);
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
        coin.scene.addCollectedCoin();
        coin.remove();
        coin.destroy();
    }

    remove() {
        this.scene.removeCoin(this);
    }
}

class BouncyCoin extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);

        this.id = config.id;
        this.body.setAllowGravity(false);
        this.setOrigin(0, 0);
        this.FADE_TIME = 200;
        this.LIFE_TIME = 500;
        this.level = config.level;
        this.timer = this.LIFE_TIME;

        if (config.emerge) {
            this.emergeDistance = 32;
        }
        
        this.alpha = 1;
        this.isRemoved = false;
        this.anims.play('coin-moving');
    }

    update(time, delta) {
        if (this.isRemoved) { return; }

        var distance = -200 * (delta / 1000);
        
        this.timer -= delta;

        this.y += distance;
        this.emergeDistance += distance;

        if (this.timer <= 0) {
            this.level.powerupGroup.remove(this);
            this.isRemoved = true;
            this.destroy();
        } else {
            console.log("t:"+this.timer);
            var timeLeft = this.timer;
            var isFading = timeLeft < this.FADE_TIME && this.timer > 0;

            if (isFading) {
                var alpha = timeLeft / this.FADE_TIME;
                console.log("alpha:" + alpha);
                this.alpha = alpha;
            }

            if (this.emergeDistance > 0) {
                this.setDepth(900 - 5);
            } else {
                this.setDepth(900 + 5);
            }
        }
    }
}