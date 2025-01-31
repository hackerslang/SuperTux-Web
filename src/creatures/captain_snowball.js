class SnowBall extends WalkingEnemy {
    constructor(config) {
        config.walkSpeed = 80;

        super(config);

        this.walkAnimation = "captain-snowball-walk";
        this.body.setVelocity(0, 0).setBounce(0, 0).setCollideWorldBounds(false);
        this.direction = 0;
        this.firstActivated = false;

        this.body.setSize(32, 32, true);
        this.setOrigin(0.5, 0.5);
        this.body.setOffset(7, 6);
    }

    collisionSquished() {
        this.setTexture("captain-snowball-squished");
        this.killSquished();

        return true;
    }

    mightClimb(width, height) {
        var x1 = 0;
        var x2 = 0;
        var top = this.body.top;
        var bottom = this.body.bottom;
        var y1a = top + 1;
        var y2a = bottom - 1;
        var y1b = top + 1 - height;
        var y2b = bottom - 1 - height;

        if (this.direction == this.DIRECTION_LEFT) {
            var left = this.body.x - (this.body.width / 2);
            x1 = left - width;
            x2 = left - 1;
        } else {
            var right = this.body.x + (this.body.width / 2);
            x1 = right + 1;
            x2 = right + width;
        }
    }

    canBeSquished() {
        //var willClimb
        var willFall = this.onGround() && this.mightFall();

        return true;
    }
}