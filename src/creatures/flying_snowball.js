import { Enemy } from './enemy.js';

export class FlyingSnowBall extends Enemy {
    constructor(config) {
        super(config);

        this.direction = 0;
        this.anims.play('flying-snowball');
        this.body.setAllowGravity(false);

        this.body.setSize(36, 41, true);
        this.setOrigin(0.5, 0.5);

        this.totalElapsedTime = 0;
        this.GLOBAL_SPEED_MULT = 0.8;
        this.PUFF_INTERVAL_MIN = 4;
        this.PUFF_INTERVAL_MAX = 8;
        this.startPositionX = this.x;
        this.startPositionY = this.y;
        this.puffTimer = -1;
        this.currentPathNode = 0;
        this.path = [{ x: -5, y: 0 }, { x: 5, y: 0 }];
        this.direction = 0;
        this.FLY_SPEED = 30;
        this.goingLeft = false;
        this.goingRight = false;

        this.squishable = true;
        this.squishedAnim = "flying-snowball-squished";
    }

    activate() {
        this.startPuffTimer();
    }

    startPuffTimer() {
        this.puffTimer = Math.floor(Math.random() * (this.PUFF_INTERVAL_MAX - this.PUFF_INTERVAL_MIN));
    }

    update(time, delta) {
        super.update(time, delta);

        if (this.killed) { return; }

        if (this.puffTimer > 0) {
            this.puffTimer -= delta;
        }

        this.totalElapsedTime = (this.totalElapsedTime + delta) % ((2 * Math.PI) / this.GLOBAL_SPEED_MULT);

        var targetDelta = this.totalElapsedTime * this.GLOBAL_SPEED_MULT;
        var targetHeight = Math.pow(Math.sin(targetDelta), 3) +
            Math.sin(3 * ((targetDelta - Math.PI) / 3)) / 3;

        targetHeight = targetHeight * 100 + this.startPositionY;

        this.body.setVelocityY(targetHeight - this.y);

        if (this.path != null) {
            if (this.currentPathNode == this.path.length) {
                this.currentPathNode = 0;
            }

            var pathX = this.startPositionX + (this.path[this.currentPathNode].x * 32);
            var pathY = this.startPositionY + (this.path[this.currentPathNode].y * 32);

            if (this.x > pathX) {
                this.direction = this.DIRECTION_LEFT;
            } else if (this.x < pathX) {
                this.direction = this.DIRECTION_RIGHT;
            }

            this.setVelocityX(this.direction * this.FLY_SPEED);
            this.flipX = (this.direction == this.DIRECTION_RIGHT ? true : false);

            if (this.direction == this.DIRECTION_LEFT && this.x <= pathX + 10) {
                this.direction = this.DIRECTION_RIGHT;
                this.currentPathNode++;
            } else if (this.direction == this.DIRECTION_RIGHT && this.x >= pathX - 10) {
                this.direction = this.DIRECTION_LEFT;
                this.currentPathNode++;
            }
        }

        if (this.puffTimer <= 0 && this.activated()) {
            var smokeParticle = new Particle({
                scene: this.scene,
                key: "smoke",
                level: this.level,
                x: this.x,
                y: this.y,
                depth: 100
            });

            //smokeParticle.body.setVelocityX(Math.floor(Math.random() * 20) - 10);
            smokeParticle.body.setVelocityY(150);

            this.startPuffTimer();
        }
    }
}