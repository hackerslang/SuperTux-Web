class MrBomb extends Enemy {
    constructor(config) {
        super(config);

        this.body.setVelocity(0, 0).setBounce(0, 0).setCollideWorldBounds(false);
        this.killAt = 0;
        this.direction = 0;
        this.anims.play("mrbomb-left");
        this.firstActivated = false;
        this.changedDirectionBeforeEdge = false;
        this.turnedAroundLeft = false;
        this.turnedAroundRight = false;
        this.stomped = false;
        this.body.setSize(45, 30, true);
        this.setOrigin(0.5, 0.5);
    }

    update(time, delta) {
        super.update(time, delta);

        if (!this.player.isDead()) {
            this.scene.physics.world.collide(this, this.player, this.playerHit);
        }

        this.scene.physics.world.collide(this, this.level.groundLayer);
    }

    playerHit(enemy, player) {
        if (enemy.verticalHit(enemy, player)) {
            player.enemyBounce(enemy);
            enemy.kill();
            enemy.addBomb();
        } else if (player.invincible) {
            enemy.killNoFlat();
        } else {
            enemy.hurtPlayer(enemy, player);
        }
    }

    flipDraw() {
        if (this.flipDirection) {
            this.flipX = (this.direction == this.DIRECTION_RIGHT ? false : true);
            this.flipDirection = false;
        }
    }

    drawWalking() {
        this.anims.play("mrbomb-left");
    }

    addBomb() {
        new Bomb({
            scene: this.scene,
            key: "Bomb",
            level: this.level,
            x: this.x,
            y: this.y
        });
    }
}