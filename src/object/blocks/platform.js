import { Sector } from '../level/sector.js';
export class Platform extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);

        this.init(config);
    }

    init(config) {
        this.body.setVelocity(0, 0).setBounce(0, 0).setCollideWorldBounds(false);
        this.body.setAllowGravity(false);

        this.x = config.x;
        this.y = config.y;
        this.scene = config.scene;
        this.player = config.player;
        
        this.canLand = false;
        this.trigger = config.trigger !== undefined ? config.trigger : "always";
        this.tweenInstance = null;
        this.tweenStarted = false;
        this.setOrigin(0.5, 0.5);
        this.scene.physics.add.collider(this, this.player, this.playerHit, null, this);

        this.initTextureAndSize(config.type);
        this.initTweenConfig(config.type);

        this.scene.staticObjects.push(this);
    }

    initTextureAndSize(type) {
        let textureNumber = type.split('-')[1];
        let texture = "";
        let height = 38;

        textureNumber = textureNumber.split('(')[0];

        switch (parseInt(textureNumber)) {
            case 0:
                texture = "industrial-platform-small";
                this.body.setSize(127, height);
                this.body.setOffset(0, 1); // Why this is, I don't know!
                break;
            case 1:
            default:
                texture = "industrial-platform-large";
                this.body.setSize(159, height);
                this.body.setOffset(0, 1); // Why this is, I don't know!
                break;
        }

        this.setTexture(texture);
    }

    initTweenConfig(type) {
        var platformTweenIndex = type.split('(')[1].replace(')', '');
        var sector = Sector.getCurrentSector();
        var platformTween = sector.sectorData.platformTweens[platformTweenIndex];

        this.tweenConfig = platformTween.tween;
    }

    update(time, delta) {
        if (this.tweenStarted.started) {
            this.tween.update(time);
        }

        

        switch (this.trigger) {
            case "always":
                this.moveAlways(delta);
                break;
            case "playerSight":
                this.moveWithinPlayerSight(delta);
                break;
            case "playerLand":
                this.moveOnPlayerLand(delta);
                break;
            default:
                break;
        };
    }

    moveAlways(delta) {
        this.addTween();
    }

    hasBeenSeen() {
        return (this.x < this.scene.cameras.main.scrollX + this.scene.sys.game.canvas.width + 32);
    }

    moveAlways(delta) {
        if (!this.tweenStarted && this.tweenConfig) {
            this.addTween();
            this.tweenStarted = true;
        }
    }

    moveWithinPlayerSight(delta) {
        if (!this.tweenStarted && this.tweenConfig && this.hasBeenSeen()) {
            this.addTween();
            this.tweenStarted = true;
        }
    }

    moveOnPlayerLand(delta) {
        if (!this.tweenStarted && this.tweenConfig && this.canLand) {
            this.addTween();
            this.tweenStarted = true;
        }
    }

    moveOnPlayerLand(delta) {
        if (!this.player.isDead() && !this.tweenStarted && this.tweenConfig) {
            this.canLand = true;
            
        }
        // Implement logic for moving when player lands on the platform
    }

    playerHit(platform, player) {
        if (!this.tweenStarted && this.tweenConfig && this.canLand) {
            this.addTween();
            this.tweenStarted = true;
        }
    }

    addTween() {
        if (!this.tweenConfig) return;
        
        const { duration, repeat, yoyo, fn: fn, params } = this.tweenConfig;
        const startX = params.startX !== undefined ? params.startX : this.x;
        const startY = params.startY !== undefined ? params.startY : this.y;

        const loopDelay = this.tweenConfig.pauseBetween !== undefined ? this.tweenConfig.pauseBetween : 0;

        const offsetX = params.offsetX !== undefined ? params.offsetX : params.endX - startX;
        const offsetY = params.offsetY !== undefined ? params.offsetY : params.endY - startY;
        
        const endX = startX + offsetX;
        const endY = startY + offsetY;

        var self = this;

        this.tween = this.scene.tweens.add({
            targets: this,
            duration: duration,
            repeat: repeat !== undefined ? repeat : -1,
            yoyo: yoyo !== undefined ? yoyo : true,
            hold: loopDelay,
            repeatDelay: loopDelay,
            dummy: { value: 1 },
            onUpdate: (tween, target) => {
                const t = tween.data[0].progress;
                const tAbs = yoyo ? Math.abs(0.5 - t) * 2 : t;
                let newX, newY;

                //self.scene.physics.world.collide(self, self.player, self.playerHit);

                switch (fn) {
                    case "circular":
                        const centerX = params.centerX !== undefined ? params.centerX : startX;
                        const centerY = params.centerY !== undefined ? params.centerY : startY;
                        const radius = params.radius !== undefined ? params.radius : 50;
                        const startAngle = params.startAngle !== undefined ? params.startAngle : 0;
                        const endAngle = params.endAngle !== undefined ? params.endAngle : 360;
                        const angle = Phaser.Math.DegToRad(startAngle + (endAngle - startAngle) * tAbs);

                        newX = centerX + radius * Math.cos(angle);
                        newY = centerY + radius * Math.sin(angle);

                        break;
                    case "quadratic":
                        newX = startX + offsetX * tAbs;
                        newY = (params.a || 0) * Math.pow(tAbs - 0.5, 2) + startY;

                        break;
                    case "sin":
                        newX = startX + offsetX * tAbs;
                        newY = startY + offsetY * Math.sin(Math.PI * t);

                        break;
                    case "linear":
                    default:
                        newX = startX + offsetX * (duration * tAbs);
                        newY = startY + (offsetY / (duration * tAbs));

                        break;
                }

                const prevX = target.body.x;
                const prevY = target.body.y;

                target.body.x = newX;
                target.body.y = newY;

                target.body.velocity.x = offsetX != 0 ? newX - prevX : 0;
                target.body.velocity.y = offsetY != 0 ? newY - prevY : 0;

                //target.body.reset(newX, newY);
            }
        });
    }
}