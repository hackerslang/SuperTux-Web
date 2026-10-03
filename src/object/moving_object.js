import { CollisionGroup } from "../collision/collision_group.js"; 
import { CollisionObject } from "../collision/collision_object.js";
import { Rect } from '../math/rect.js';

export class MovingSprite extends Phaser.GameObjects.Sprite  {
    constructor(config, collisionGroup) {
        super(config.scene, config.x, config.y, config.key);

        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);

        this.collisionGroup = collisionGroup || CollisionGroup.COLGROUP_MOVING;
        this.collisionObject = new CollisionObject({ group: collisionGroup, parent: this });
        this.isScheduledForRemoval = false;
    }

    getCollisionObject() {
        return this.collisionObject;
    }

    getBbox() {
        return this.collisionObject.bbox;
    }

    collision(otherObject, hit) {

    }

    collides(movingObject, hit) {
        return true;
    }

    isValid() {
        return !this.isScheduledForRemoval;
    }

    getVelocityX() {
        return this.body.velocity.x;
    }

    getVelocityY() {
        return this.body.velocity.y;
    }

    setVelocityX(x) {
        this.body.velocity.x = x;
    }

    setVelocityY(y) {
        this.body.velocity.y = y;
    }

    setAccelerationX(x) {
        this.body.acceleration.x = x;
    }

    setAccelerationY(y) {
        this.body.acceleration.y = y;
    }

    update(time, delta) {
        this.collisionObject.bbox = new Rect({
            left: this.body.x,
            top: this.body.y,
            width: this.body.width,
            height: this.body.height
        });
    }

    saveGravityY() {
        const gravity = this.body && this.body.gravity ? this.body.gravity : { x: 0, y: 0 };

        this.savedGravityY = gravity.y;
    }

    restoreGravityY() {
        if (!this.body || !this._savedGravityY) return;

        this.body.setGravityY(this.savedGravityY || 0);
    }

    getGroup() {
        return this.collisionGroup;
    }

    setGroup(group) {
        this.collisionGroup = group;
    }

    equals(other) {
        return this.id == other.id;
    }
}