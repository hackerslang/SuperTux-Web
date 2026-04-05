import { BounceableBlock } from './bounceableblock.js';

class InfoBlock extends BounceableBlock {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);
        this.body.setVelocity(0, 0).setBounce(0, 0).setCollideWorldBounds(false);

        this.body.setAllowGravity(false);
        this.player = config.player;
        this.level = config.level;
        this.scene = config.scene;
        this.id = config.id;
        this.setTexture("info-block");
        this.startY = config.y;
        this.done = false;
        this.setOrigin(0, 0);
        this.body.setBounce(0);
        this.body.setImmovable(true);
        this.gotHitByPlayer = false;
        this.hitSide = "none";
        this.content = config.content;

        this.scene.physics.add.collider(this.player, this);
    }

    update(time, delta) {
        super.update(time, delta);
    }

    playerHitEvents() {
        this.toggleInfoTooltip();
    }

    toggleInfoTooltip() {
        if (this.visible) {
            this.hideInfoTooltip();
        } else {
            this.showInfoTooltip();
        }
    }

    showInfoTooltip() {

    }

    hideInfoTooltip() {

    }
}
