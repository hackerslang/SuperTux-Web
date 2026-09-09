import { CollisionGroup } from "../collision/collision_group.js";
import { CollisionObject } from "../collision/collision_object.js";
import { Rect } from '../math/rect.js';

export class StillSprite extends Phaser.GameObjects.Sprite {
    constructor(config, collisionGroup) {
        super(config.scene, config.x, config.y, config.key);

        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);

        this.collisionGroup = collisionGroup || CollisionGroup.COLGROUP_TOUCHABLE;
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

    collides(otherObject, hit) {
        return true;
    }

    isValid() {
        return !this.isScheduledForRemoval;
    }

    getVelocityX() {
        return 0;
    }

    getVelocityY() {
        return 0;
    }

    getVelocity() {
        return new Phaser.Math.Vector2(0, 0);
    }

    update(time, delta) {
        this.collisionObject.bbox = new Rect({
            left: this.body.x,
            top: this.body.y,
            width: this.body.width,
            height: this.body.height
        });
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