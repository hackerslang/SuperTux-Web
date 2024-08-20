export class EggPowerUp extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);
        this.body.setVelocity(0, 0).setBounce(0, 0).setCollideWorldBounds(false);

        this.incollectableForTimer = 0;

        if (this.incollectableForTimer != null) {
            this.incollectableForTimer = config.incollectableForTimer;
        }

        this.body.setAllowGravity(true);
        this.player = config.player;
        this.sector = config.sector;
        this.scene = config.scene;
        this.id = config.id
        this.setTexture('egg');
        this.startY = config.y;
        this.isEmpty = false;
        this.done = false;
        this.body.setBounce(0);
        this.body.setImmovable(true);
        this.direction = config.direction;
        this.body.velocity.x = this.direction * 70;
    }

    update(time, delta) {
        if (this.killed) {
            this.scene.powerupGroup.remove(this);
            this.destroy();

            return;
        }

        if (this.incollectableForTimer > 0) {
            this.incollectableForTimer -= delta;
        }

        this.angle += 1;

        this.scene.physics.world.collide(this, this.scene.groundLayer);
        this.scene.physics.world.collide(this, this.scene.woodGroup);
        this.scene.physics.world.collide(this, this.scene.blockGroup);
        this.scene.physics.world.overlap(this, this.player, this.collected);
    }

    collected(egg, player) {
        if (egg.incollectableForTimer <= 0) {
            egg.collect(egg, player);
        }
    }

    collect(egg, player) {
        player.addHealth(1);
        egg.killed = true;
    }
}