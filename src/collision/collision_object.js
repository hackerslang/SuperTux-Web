import { Rect } from "../math/rect.js";

export class CollisionObject {
    constructor(config) {
        this.parent = config.parent;
        this.group = config.group;
        this.bbox = new Rect();
        this.dest = new Rect();
        this.uniSolid = false;
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
        return new Phaser.Math.Vector2(this.getVelocityX(), this.getVelocityY());
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

    isValid() {
        return this.parent.isValid();
    }
}