class Brick extends Phaser.GameObjects.Sprite {
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
        this.setTexture("brick");
        this.startY = config.y;
        this.done = false;
        this.body.setBounce(0);
        this.setOrigin(0, 0);
        this.body.setImmovable(true);
        this.brickPieces = [];
        this.brickPiecesDestroyAt = 180;
    }

    update(time, delta) {
        if (!this.done) {
            this.body.setImmovable(true);

            if (!this.player.killed) {
                this.scene.physics.world.collide(this, this.player, this.blockHit);
            }
        } else {
            if (this.brickPiecesDestroyAt <= 0) {
                for (var i = 0; i < this.brickPieces.length; i++) {
                    var brickPiece = this.brickPieces[i];

                    brickPiece.destroy();
                }
            } else {
                this.brickPiecesDestroyAt -= delta;

                for (var i = 0; i < this.brickPieces.length; i++) {
                    var brickPiece = this.brickPieces[i];

                    brickPiece.alpha -= 0.05;
                }
            }
            
        }
    }

    blockHit(brick, player) {
        if (brick == null) { return; }
        if (brick.body == null) { return; }
        brick.body.setVelocityY(0);
        if (!brick.done && brick.hitFromBelow(brick, player)) {
            brick.body.setImmovable(false);

            brick.scene.tweens.add({
                targets: brick,
                y: brick.y - 32,
                yoyo: true,
                duration: 100,
                onUpdate: () => brick.update(),
                onComplete: () => {
                    if (brick.done) { return; }
                    var brickX = brick.x;
                    var brickY = brick.y;
                    brick.done = true;

                    for (var i = 1; i < 7; i++) {
                        var brickPieceCaption = 'brick-piece' + i;
                        var brickPiece = brick.scene.add.sprite(brickX - 8 + Math.floor(Math.random() * 16), brickY - 8 + Math.floor(Math.random() * 16), brickPieceCaption);
                        brick.scene.physics.world.enable(brickPiece);
                        brick.scene.add.existing(brickPiece);
                        brickPiece.body.setAllowGravity(true);

                        brick.brickPieces.push(brickPiece);
                    }

                    brick.level.removeBlock(brick);
                    brick.destroy();
                }
            });
        }
    }

    hitFromBelow(brick, player) {
        if (!player.isActiveAndAlive()) {
            return false;
        }

        return (brick.body.y + brick.body.height) - (player.body.y) <= 0;
    }
}