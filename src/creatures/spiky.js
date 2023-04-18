class Spiky extends WalkingEnemy {
    constructor(config) {
        config.walkSpeed = 80;

        super(config);

        this.walkAnimation = "spiky-walk";
        this.body.setVelocity(0, 0).setBounce(0, 0).setCollideWorldBounds(false);
        this.direction = 0;
        this.firstActivated = false;

        this.body.setSize(32, 32, true);
        this.setOrigin(0.5, 0.5);
        this.body.setOffset(7, 6);
    }

}