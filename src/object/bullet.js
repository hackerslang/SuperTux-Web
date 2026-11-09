import { MovingSprite } from "./moving_object.js";
import { BonusType } from '../creatures/player.js';

export class Bullet extends MovingSprite {
    constructor(config) {
        super(config, config.collisionGroup);

        this.setVelocity(config.velocity.x, config.velocity.y);
        this.type = config.type || BonusType.BONUS_FIRE;
        this.particleTime = 0;
        this.init();
    }

    init() {
        switch (this.type) {
            case BonusType.BONUS_FIRE:
                this.anims.play("firebullet"); 
                break;

            case BonusType.BONUS_ICE:
                this.anims.play("icebullet");
                break;
        }
    }

    update(time, delta) {
        this.angle = Phaser.Math.RadToDeg(this.body.angle) * (this.type == BonusType.BONUS_ICE ? 1 : 3);

        if (this.body.velocity.x > 0) {
            this.angle += delta * Math.PI * 4;
        }
        else {
            this.angle -= delta * Math.PI * 4;
        }

        this.particleTime += delta;
        if (this.particleTime >= 0.08) {
            this.scene.addSpriteParticle(
                (this.type == BonusType.BONUS_ICE ?
                    "images/objects/bullets/icebullet_tail.sprite" :
                    "images/objects/bullets/firebullet_tail.sprite"),
                "default",
                this.x, this.y, ANCHOR_MIDDLE,
                Vector(0, 0), Vector(0, 0),
                LAYER_OBJECTS - 1);
            this.particleTime = 0;
        }
    }
}