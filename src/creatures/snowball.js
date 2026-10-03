import { WalkingEnemy } from './walking_enemy.js';

export class SnowBall extends WalkingEnemy {
    constructor(config) {
        config.walkSpeed = 80;

        super(config);

        this.walkAnimation = "snowball-walk";
        this.direction = 0;

        if (config.direction == "left") {
            this.direction = this.DIRECTION_LEFT;
        } else if (config.direction == "right") {
            this.direction = this.DIRECTION_RIGHT;
        }

        this.firstActivated = false;

        this.body.x = config.x;
        this.body.y = config.y;
        this.body.setSize(32, 32, true);
        this.setOrigin(0.5, 0.5);
        this.body.setOffset(7, 6);

        this.squishable = true;
        this.squishedAnim = "snowball-squished";

        this.objectName = "SnowBall";
        this.initialize();
    }

    initialize() {
        super.initialize();
    }

    update(time, delta) {
        super.update(time, delta);
    }

    collisionSquished(object) {
        if (this.frozen)
            return super.collisionSquished(object);

        this.anims.play(this.squishedAnim);
        this.killSquished(object);

        return true;
    }
}