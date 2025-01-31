import { WalkingEnemy } from './walking_enemy.js';

export var SpikyState = {
    STATE_SLEEPING: 0,
    STATE_WAKING: 1,
    STATE_WALKING: 2
}

export class Spiky extends WalkingEnemy {
    constructor(config) {
        config.walkSpeed = 45;

        super(config);

        if (config.sleeping != null) {
            this.sleeping = true;
        } else {
            this.sleeping = false;
        }
        
        this.walkAnimation = "spiky-walk";
        this.body.setVelocity(0, 0).setBounce(0, 0).setCollideWorldBounds(false);
        this.direction = 0;
        this.firstActivated = false;

        this.body.setSize(32, 32, true);
        this.setOrigin(0.5, 0.5);
        this.body.setOffset(7, 6);

        this.squishable = false;
        this.initialize();
    }

    initialize() {
        if (this.sleeping) {
            this.state = SpikyState.STATE_SLEEPING;
            this.setVelocityX(0);
            this.anims.play("spiky-sleep");
        } else {
            this.state = SpikyState.STATE_WALKING;
            super.walk();
        }
    }

    update(time, delta) {
        super.update(time, delta);
    }

}

export class HellSpiky extends WalkingEnemy {
    constructor(config) {
        config.walkSpeed = 60;

        super(config);

        this.walkAnimation = "hellspiky-walk";
        this.tint = 0xFF0000;
        this.body.setVelocity(0, 0).setBounce(0, 0).setCollideWorldBounds(false);
        this.direction = 0;
        this.firstActivated = false;

        this.body.setSize(32, 32, true);
        this.setOrigin(0.5, 0.5);
        this.body.setOffset(7, 6);

        this.squishable = false;
    }

    initialize() {
        super.walk();
    }

    update(time, delta) {
        super.update(time, delta);
    }
}