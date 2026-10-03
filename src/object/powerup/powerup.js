import { MovingSprite } from "../moving_object.js";
import { CollisionGroup } from "../../collision/collision_group.js";

export class PowerUp extends MovingSprite {
    constructor(config, collisionGroup) {
        super(config, collisionGroup);

        this.incollectableForTimer = 0;

        if (this.incollectableForTimer != null) {
            this.incollectableForTimer = config.incollectableForTimer;
        }

        this.body.setAllowGravity(true);
        this.player = config.player;
        this.sector = config.sector;
        this.scene = config.scene;
        this.id = this.scene.getPowerUpId();
        this.direction = config.direction;
        this.initialDirection = this.direction;

        this.isScheduledForRemoval = false;
        this.group = CollisionGroup.COLGROUP_MOVING;
    }

    update(time, delta) {
        if (this.isScheduledForRemoval) {
            return;
        }

        this.body.y = Math.floor(this.body.y);

        super.update(time, delta);

        if (this.incollectableForTimer > 0) {
            this.incollectableForTimer -= delta;
        }

        if (this.startedTimer > 0) {
            this.startedTimer -= delta;
        }
    }

    isValid() {
        return true;
    }

    collect() {
        if (plus.incollectableForTimer <= 0) {
            this.isScheduledForRemoval = true;
            this.player.collectPowerUp(this);
        }
    }

    collisionSolid(hit) {
        var hits = hit.left || hit.right || hit.top || hit.bottom;

        if (hit.left || hit.right) {
            this.setAccelerationX(0);
            this.direction *= -1;
            this.body.velocity.x = this.getVelocityX() * 0.3;
        }

        if (hit.top) {
            this.setVelocityY(0.2);
        } else if (hit.bottom) {
            this.setVelocityY(0);
            this.setAccelerationY(0);
            super.saveGravityY();
            this.body.setGravityY(0);
        } else {
            super.restoreGravityY();
        }
    }

    collision(other, hit) {
        var otherCreature = other !== undefined && other.parent !== undefined ? other.parent : undefined;

        if (otherCreature !== undefined && !otherCreature.isEnemy) {
            this.collect();
        }
    }
}