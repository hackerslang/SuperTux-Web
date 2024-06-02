class Particle extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);
        this.body.setVelocity(0, 0).setBounce(0, 0).setCollideWorldBounds(false);

        this.body.setImmovable(true);

        var allowGravity = false;

        if (config.allowGravity != null) {
            allowGravity = config.allowGravity;
        }

        this.body.setAllowGravity(allowGravity);
        this.key = config.key;
        this.level = config.level;
        this.scene = config.scene;
        this.body.setBounce(0);
        this.setDepth(config.depth);


        if (this.key != null) {
            this.anims.play(this.key).once('animationcomplete', () => {
                this.destroy();
            });
            
        } else if (this.texture != null) {
            this.setTexture(this.texture);
        }
    }

    update(time, delta) {
        if (this.y > this.scene.cameras.main.scrollY + this.scene.sys.game.canvas.height + 32) {
            this.destroy();
        }
    }
}

class Sparkle extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);
        this.body.setVelocity(0, 0).setBounce(0, 0).setCollideWorldBounds(false);

        this.id = config.id;
        this.body.setImmovable(false);
        this.body.setAllowGravity(false);
        this.key = config.key;
        this.level = config.level;
        this.scene = config.scene;
        this.body.setBounce(0);
        this.body.setImmovable(true);
        this.setDepth(config.depth);
        this.player = config.player;

        this.relativeX = Math.floor(Math.random() * this.player.SPARKLE_BODY_WIDTH); //REAL_COLLISION_BOX_WIDTH);
        this.relativeY = Math.floor(Math.random() * this.player.SPARKLE_BODY_HEIGHT - 5); //REAL_COLLISION_BOX_HEIGHT);

        this.body.x = this.player.body.left + this.relativeX;
        this.body.y = this.player.body.top + this.relativeY;
        this.dissapearing = false;
        this.destroyed = false;

        this.anims.play(this.key).once('animationcomplete', () => {
            this.dissapearing = true;
            this.player.removeParticle(this);
            this.visible = false;
            this.destroy();
            this.destroyed = true;
        });
    }

    update(time, delta) {
        if (this.destroyed) {
            return;
        }

        this.body.x = this.player.body.left + this.relativeX;
        this.body.y = this.player.body.top + this.relativeY;
        
    }
}