import { CollisionGroup } from "../collision/collision_group.js"; 
import { CollisionObject } from "../collision/collision_object.js";

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
        this.collisionObject.bbox.left = this.body.left;
        this.collisionObject.bbox.top = this.body.top;
        this.collisionObject.bbox.width = this.body.width;
        this.collisionObject.bbox.height = this.body.height;
        console.log("update");
        console.log(this.collisionObject.bbox);
        console.log("updateend");
    }
}