import { MovingSprite } from "../moving_object.js";
import { CollisionGroup } from "../../collision/collision_group.js";
import { PowerUp } from "./powerup.js";

export class EggPowerUp extends PowerUp {
    constructor(config) {
        super(config, CollisionGroup.COLGROUP_MOVING);

        this.incollectableForTimer = 0;

        if (this.incollectableForTimer != null) {
            this.incollectableForTimer = config.incollectableForTimer;
        }

        this.body.setAllowGravity(true);
        this.player = config.player;
        this.sector = config.sector;
        this.scene = config.scene;
        this.id = this.scene.getPowerUpId();
        this.setTexture('egg');
        this.startY = config.y;
        this.isEmpty = false;
        this.done = false;
        this.body.setBounce(0);
        this.body.setImmovable(true);
        this.direction = config.direction;
        this.body.velocity.x = this.direction * 70;
        this.objectName = "PowerupEgg";
        this.isScheduledForRemoval = false;
        this.group = CollisionGroup.COLGROUP_MOVING;
    }

    update(time, delta) {
        if (this.isScheduledForRemoval) {
            this.scene.removePowerUp(this);
            this.destroy();
        }

        super.update(time, delta);

        if (this.incollectableForTimer > 0) {
            this.incollectableForTimer -= delta;
        }

        this.angle += 1;
    }

    collect() {
        if (this.incollectableForTimer <= 0) {
            this.player.addHealth(1);
            this.isScheduledForRemoval = true;
        }
    }

    isValid() {
        return true;
    }

    collisionSolid(hit) {
        super.collisionSolid(hit);
    }

    collision(other, hit) {
        super.collision(other, hit);
    }
}