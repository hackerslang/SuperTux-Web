export var HitResponse = {
    ABORT_MOVE: 0,
    CONTINUE: 1,
    FORCE_MOVE: 2
};

export class CollisionHit {
    constructor(config) {
        this.left = false;
        this.right = false;
        this.top = false;
        this.bottom = false;
        this.crush = false;
        this.slopeNormal = new Phaser.Math.Vector2(0, 0);
    }
}