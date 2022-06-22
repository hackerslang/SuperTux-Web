class WalkingEnemy extends Enemy {
    constructor(config) {
        this.body.setVelocity(0, 0).setBounce(0, 0).setCollideWorldBounds(false);
    }
}