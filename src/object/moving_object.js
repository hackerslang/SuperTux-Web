import { CollisionGroup } from "../collision/collision_group.js"; 
import { CollisionObject } from "../collision/collision_object.js";
import { Rect } from '../math/rect.js';

export class MovingSprite extends Phaser.GameObjects.Sprite  {
    constructor(config, collisionGroup) {
        super(config.scene, config.x, config.y, config.key);

        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);

        var collisionGroup = collisionGroup || CollisionGroup.COLGROUP_MOVING;

        this.collisionObject = new CollisionObject({ group: collisionGroup, parent: this });
        this.isScheduledForRemoval = false;
    }

    getCollisionObject() {
        return this.collisionObject;
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

    update(time, delta) {
        this.collisionObject.bbox = new Rect({
            left: this.body.left,
            top: this.body.top,
            width: this.body.width,
            height: this.body.height
        })
    }
}