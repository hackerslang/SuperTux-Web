import { WalkingEnemy } from './walking_enemy.js';

export class SmartBall extends WalkingEnemy {
    constructor(config) {
        config.walkSpeed = 80;

        super(config);

        this.walkAnimation = "smartball-walk";
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
        this.squishedAnim = "smartball-squished";

        this.objectName = "SmartBall";
        this.initialize();
    }

    initialize() {
        this.setLedgeBehavior(LedgeBehavior.NORMAL);
    }

    update(time, delta) {
        super.update(time, delta);
    }
}