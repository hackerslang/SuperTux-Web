class BonusBlock extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);
        this.body.setVelocity(0, 0).setBounce(0, 0).setCollideWorldBounds(false);

        this.body.setAllowGravity(false);
        this.player = config.player;
        this.level = config.level;
        this.scene = config.scene;
        this.id = config.id
        this.powerupType = config.powerupType;
        this.setTexture("bonus-block");
        this.startY = config.y;
        this.isEmpty = false;
        this.done = false;
        this.setOrigin(0, 0);
        this.body.setBounce(0);
        this.body.setImmovable(true);
        this.gotHitByPlayer = false;
    }

    update(time, delta) {
        this.body.setImmovable(true);

        if (!this.player.killed) {
            this.scene.physics.world.collide(this, this.player, this.blockHit);
        }
    }

    blockHit(block, player) {
        if (this.gotHitByPlayer) {
            return;
        }

        block.body.setVelocityY(0);
        if (!block.done && block.hitFromBelow(block, player) && !block.isEmpty) {
            block.body.setImmovable(false);
            block.setTexture("bonus-block-empty");
            block.scene.tweens.add({
                targets: block,
                y: block.y - 32,
                yoyo: true,
                duration: 100,
                onUpdate: () => block.update(),
                onComplete: () => {
                    block.y = block.startY;
                    block.done = true;
                    block.body.setImmovable(true);
                }
            });

            if (block.powerupType == 'star') {
                block.level.addStar(block.x, block.y - 32);
            } else if (block.powerupType == 'egg') {
                block.level.addEgg(block.x, block.y - 32);
            }
        }

        this.gotHitByPlayer = true;
    }

    gotHit() {
        return this.gotHitByPlayer;
    }

    hitFromBelow(block, player) {
        if (!player.isActiveAndAlive()) {
            return false;
        }
        
        return (block.body.y + block.body.height) - (player.body.y) <= 0;
    }

    remove() {
        this.level.removeBlock(this);
    }
}
