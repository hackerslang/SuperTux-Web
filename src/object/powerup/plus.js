import { MovingSprite } from "../moving_object.js";
import { CollisionGroup } from "../../collision/collision_group.js";
import { PowerUp } from "./powerup.js";

export class PlusPowerUp extends PowerUp {
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
        this.anims.play('plus-flickering');
        this.direction = config.direction;
        this.initialDirection = this.direction;

        this.body.velocity.y = - 150;
        this.body.velocity.x = this.direction * 90;

        this.startedTimer = 1500;
        this.bounceBack = false;
        this.objectName = "PowerupPlus";
        this.isScheduledForRemoval = false;
        this.group = CollisionGroup.COLGROUP_MOVING;
    }

    update(time, delta) {
        if (this.isScheduledForRemoval) {
            this.scene.removePowerUp(this);
            this.destroy();

            return;
        }

        super.update(time, delta);

        if (this.startedTimer > 0) {
            this.startedTimer -= delta;
        }

        if (this.startedTimer <= 0) {
            if (!this.bounceBack) {
                this.body.acceleration.x += (this.direction * -1) + (delta / 50);
                this.angle += this.direction * 2;
                if (Math.abs(this.body.velocity.x) < 15) {
                    this.body.velocity.x = 0;
                    this.body.acceleration.x = 0;
                    this.bounceBack = true;
                }
            }
        } else {
            this.angle += this.direction * 5;
        }
    }

    isValid() {
        return true;
    }

    collect() {
        if (this.incollectableForTimer <= 0) {
            this.player.addHealth(2);
            this.isScheduledForRemoval = true;
        }
    }

    collisionSolid(hit) {
        super.collisionSolid(hit);
    }

    collision(other, hit) {
        super.collision(other, hit);
    }
}