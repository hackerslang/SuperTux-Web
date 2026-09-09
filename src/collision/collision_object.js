import { Rect } from "../math/rect.js";

export class CollisionObject {
    constructor(config) {
        this.parent = config.parent;
        this.group = config.group;
        this.bbox = new Rect();
        this.dest = new Rect();
        this.uniSolid = false;

        this.isScheduledForRemoval = false;
    }

    getId() {
        return this.parent.id;
    }

    setWidth(width) {
        this.dest.setWidth(width);
        this.bbox.setWidth(width);
    }

    collisionSolid(hit) {
        this.parent.collisionSolid(hit);
    }

    collides(other, hit) {
        return this.parent.collides(other, hit);
    }

    collision(other, hit) {
        return this.parent.collision(other, hit);
    }

    collisionTile(tileAttributes) {
        this.parent.collisionTile(tileAttributes);
    }

    getMovement(delta) {
        // delta is milliseconds
        const dt = (typeof delta === 'number') ? delta / 1000 : 1 / 60;

        return new Phaser.Math.Vector2(this.getVelocityX() * dt, this.getVelocityY() * dt);
    }

    setMovement(movement, delta) {
        // delta is milliseconds
        const dt = (typeof delta === 'number') ? delta / 1000 : 1 / 60;

        this.parent.setVelocity(movement.x / dt, movement.y / dt);
    }

    getVelocityX() {
        return this.parent.getVelocityX();
    }

    getVelocityY() {
        return this.parent.getVelocityY();
    }

    getVelocity() {

    }

    isUniSolid() {
        return this.uniSolid;
    }

    getGroup() {
        return this.parent.getGroup();
    }

    isValid() {
        return this.parent.isValid();
    }

    equals(other) {
        return this.parent.equals(other.parent);
    }

    getBbox() {
        return new Rect(this.bbox);
    }
}