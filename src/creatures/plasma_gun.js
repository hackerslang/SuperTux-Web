class PlasmaGun extends Enemy {
    constructor(config) {
        super(config);
        this.killAt = 0;
        this.direction = 0;
        this.firstActivated = false;
        this.changedDirectionBeforeEdge = false;
        this.turnedAroundLeft = false;
        this.turnedAroundRight = false;
        this.stomped = false;
        this.x = config.x;
        this.startX = config.x - 42;
        this.y = config.y - 44;
        this.bottomY = config.y;
        this.scene = config.scene;

        var bottomLeft = this.scene.add.sprite(config.x - 32, this.bottomY, "industrial", 20);
        var bottomMid = this.scene.add.sprite(config.x, this.bottomY, "industrial", 3);
        var bottomRight = this.scene.add.sprite(config.x + 32, this.bottomY, "industrial", 21);

        var bottoms = [bottomLeft, bottomMid, bottomRight];
        var self = this;


        bottoms.forEach(function (bottom, idx) {
            self.scene.physics.world.enableBody(bottom, 0);
            bottom.body.setAllowGravity(false);
            bottom.body.setImmovable(true);
            bottom.setOrigin(0, 0);
            bottom.setDepth(950);
        });

        this.setDepth(900);

        this.setTexture("plasma-gun-weapon");

        this.setOrigin(0, 0);
        this.setOrigin(0, 0);
        this.plasmaStreams = [];

        this.scene.physics.world.enableBody(this, 0);
        this.body.setAllowGravity(false);
        
        this.FIRE_PAUSE_TIME = 3000;
        this.firePauseTimer = this.FIRE_PAUSE_TIME;
    }

    update(time, delta) {
        if (this.firePauseTimer > 0) {
            this.firePauseTimer -= delta;
        } else {
            this.fire();
            this.firePauseTimer = this.FIRE_PAUSE_TIME;
        }

        this.plasmaStreams.forEach(function (plsm, idx) {
            plsm.update();
        });
    }

    fire() {
        this.scene.tweens.add({
            targets: this,
            x: this.x + 20,
            yoyo: true,
            duration: 80,
            onUpdate: () => {
                this.updateFire();
            },
            onComplete: () => {
                this.x = this.startX;
            }
        });
        
    }

    updateFire() {
        if (!this.hasFiredDuringPeriod) {
            this.firePlasma();
        }
    }

    firePlasma() {
        var plasmaStream = new PlasmaStream({
            scene: this.scene,
            level: this.level,
            x: this.x - 20,
            y: this.y - 37,
            plasmaGun: this,
            key: "plasma-stream",
            id: this.plasmaStreams.length
        });

        this.plasmaStreams.push(plasmaStream);
    }
}

class PlasmaStream extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);
        this.body.setVelocity(0, 0).setBounce(0, 0).setCollideWorldBounds(false);
        this.body.setAllowGravity(false);
        this.id = config.id;
        this.plasmaGun = config.plasmaGun;
        this.level = config.level;
        this.scene = config.scene;
        this.body.setVelocityX(-300);
        this.x = config.x;
        this.y = config.y;
        this.killed = false;
        this.previousX = config.x;
        this.MAX_ALIVE_DISTANCE = 700;
        this.aliveMarker = this.MAX_ALIVE_DISTANCE;
    }

    update(time, delta) {
        if (!this.killed) {
            if (this.x < 100) {
                this.remove();
                this.killed = true;

                return;
            }

            this.aliveMarker -= (this.previousX - this.x);
            this.previousX = this.x;

            if (this.aliveMarker <= 0) {
                this.fadeOut();
                this.killed = true;

                return;
            }

            this.scene.physics.world.overlap(this, this.level.player, this.playerHit);
        }
    }

    playerHit(stream, player) {
        if (!player.invincible) {
            player.hurtBy(stream);
        }
    }

    fadeOut() {
        this.scene.tweens.add({
            targets: this,
            alpha: { from: 1, to: 0 },
            duration: 100,
            yoyo: false,
            onComplete: () => {
                this.remove();
            }
        });
    }

    remove() {
        var self = this;
        this.plasmaGun.plasmaStreams.filter(function (plsmStrm) { plsmStrm.id != self.id });
        this.destroy();
    }
}