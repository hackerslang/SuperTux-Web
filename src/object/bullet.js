import { MovingSprite } from "./moving_object.js";
import { PlayerBonus } from '../creatures/player.js';
import { animationsData } from '../../assets/data/animations.js';
import { imagesData } from '../../assets/data/images.js';
import { HitResponse } from "../collision/collision_hit.js";

export var BonusType = {
    BONUS_FIRE: 1,
    BONUS_ICE: 2
};

export class Bullet extends MovingSprite {
    constructor(config) {
        super(config, config.collisionGroup);

        this.scene = config.scene;
        this.player = config.player;
        this.owner = this.player !== undefined ? "player" : "enemy";

        this.lifeCount = 3;
        this.body.setAllowRotation(false);

        if (config.velocity !== undefined) {
            this.setVelocity(config.velocity.x, config.velocity.y);
        }
        
        this.bonus = config.bonus || BonusType.BONUS_FIRE;
        this.animationKey = this.bonus === BonusType.BONUS_ICE ? "icebullet" : "firebullet";

        this.particleTime = 0;
        this.anims.play(this.animationKey);
        this.setDepth(this.player.depth - 1);

        this.isBullet = true;
    }

    collisionSolid(hit) {
        console.log("hit", hit);
        if (hit.slopeNormal.x != 0 && hit.slopeNormal.y <= 0) {
            let bounceInitY = -300,
                bounceInitX = 450;
            // steep slope
            if (Math.abs(hit.slopeNormal.x) > 0.5) {
                this.lifeCount -= 0.07;
                bounceInitY = -500;
                bounceInitX = 350;
            }
            else
                this.lifeCount -= 0.2;

            // inverse it (but with a little decrease) if it's a fast falling fireball
            if (Math.abs(this.body.velocity.y) > 600)
                this.setVelocityX(-Math.abs(this.body.velocity.y) * 0.8);
            else
                this.setVelocityY(Math.clamp(bounceInitY - Math.abs(this.body.velocity.x / 3.8), -500, -300));

            if (Math.abs(this.body.velocity.x) > bounceInitX)
                this.setVelocity((this.body.velocity.x > 0 ? 1 : -1) * bounceInitX);

            return;
        }

        if (hit.top || hit.bottom) {
            console.log("top, bottom", hit);
            this.setVelocityY(-this.body.velocity.y);
            this.lifeCount--;
            return;
        }

        if (hit.left || hit.right) {
            console.log("right, left", hit);
            if (this.bonus == BonusType.BONUS_ICE) {
                this.setVelocityX(-this.body.velocity.x);
                this.lifeCount--;
            } else {
                this.removeMe();
            }
        }
    }

    removeMe() {
        this.scene.removeBullet(this);
        this.destroy();
    }

    ricochet(hit) {
        this.collisionSolid(hit);
    }

    collision(other, hit) {
        return HitResponse.FORCE_MOVE;
    }

    setVelocity(x, y) {
        this.setVelocityX(x);
        this.setVelocityY(y);
    }

    setVelocityX(x) {
        this.body.velocity.x = x;
    }

    setVelocityY(y) {
        this.body.velocity.y = y;
    }

    preupdate(time, delta) {
        this.anims.update();
    }

    update(time, delta) {
        super.update(time, delta);

        if (this.body.velocity.x > 0) {
            this.rotation += delta / 1000 * Math.PI * 4;
        } else {
            this.rotation -= delta / 1000 * Math.PI * 4;
        }

        this.particleTime += delta;
        if (this.particleTime >= 120) {
            this.scene.addParticle(
                this.x, this.y, null,
                new Phaser.Math.Vector2(0, 0), new Phaser.Math.Vector2(0, 0),
                (this.type == BonusType.BONUS_ICE ?
                    "icebullet-tail" :
                    "firebullet-tail"));
            this.particleTime = 0;
        }
    }
}