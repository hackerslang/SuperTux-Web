class Lava extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);
        
        this.body.setAllowGravity(false);
        this.player = config.player;
        this.level = config.level;
        this.scene = config.scene;
        this.id = config.id;
        this.anims.play('lava');
        this.setOrigin(0, 0);
        this.setDepth(120);
        this.alpha = config.alpha != null ? config.alpha : 1;
        //this.lavaCollider = this.scene.physics.add.collider(this.player, this);
    }

    update(time, delta) {
        this.playerHit();
        

        //if (!this.player.isDead()) {
        //    this.scene.physics.world.overlap(this, this.player, this.playerHit);
        //}

        //if (!this.player.killed) {
        //    if (this.player.body.blocked.down) {
        //        var tileX = this.player.x;
        //        var tileY = this.player.y;

        //        for (var i = 0; i < this.player.level.lavaSprites.length; i++) {
        //            var lavaSprite = this.player.level.lavaSprites[i];

        //            var lavaSpriteX = lavaSprite.x / 32;
        //            var lavaSpriteY = lavaSprite.y / 32;
        //            alert(tileX + " " + lavaSpriteX);
        //            if (tileX >= lavaSpriteX && tileX <= lavaSpriteX + 128 && tileY +20 >= lavaSpriteY - (2 * 32)) {
        //                this.player.die();
        //            }
        //        }
        //    }
        //}
    }

    playerHit() {
        //var playerX = this.player.body.x;
        //var playerY = this.player.body.y;
        //var playerHeight = this.player.body.height;

        //for (var i = 0; i < this.player.level.lavaSprites.length; i++) {
        //    var lavaSprite = this.player.level.lavaSprites[i];

        //    if (playerX >= lavaSprite.x + 32 && playerX <= lavaSprite.x + 128 && playerY >= lavaSprite.y - playerHeight && playerY <= lavaSprite.y) {
        //        this.player.dieWithoutRemovingColliders();
        //    }
        //}
    }
}