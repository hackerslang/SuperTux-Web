import { WalkingEnemy } from './walking_enemy.js';

export class SnowBall extends WalkingEnemy {
    constructor(config) {
        config.walkSpeed = 80;

        super(config);

        this.walkAnimation = "snowball-walk";
        this.body.setVelocity(0, 0).setBounce(0, 0).setCollideWorldBounds(false);
        this.direction = 0;
        this.firstActivated = false;

        this.body.setSize(32, 32, true);
        this.setOrigin(0.5, 0.5);
        this.body.setOffset(7, 6);

        this.squishable = true;
        this.squishedAnim = "snowball-squished";
    }

    update(time, delta) {
        super.update(time, delta);
    }

    //update(time, delta) {
    //    super.checkKillAt(delta);

        
    //    if (!this.activated()) {
    //        return;
    //    }

    //    if (!this.firstActivated) {
    //        this.activateStartMoving();
    //    }

    //    super.update(time, delta);
    //    super.enemyCollideTurn();
    //    super.playerCollideTurn();

    //    this.scene.physics.world.collide(this, this.level.enemyGroup, this.enemyHit);

    //    if (!this.killFalling) {
    //        this.scene.physics.world.collide(this, this.scene.groundLayer);

    //        if (!this.player.isDead()) {
    //            this.scene.physics.world.collide(this, this.player, this.playerHit);
    //        }
    //    }
        
    //    super.walkAndTurnOnEdge();
    //}

    //enemyHit(thisEnemy, enemy) {
    //    enemy.walkAndTurnCollideEnemy(thisEnemy);
    //    thisEnemy.walkAndTurnCollideEnemy(enemy);
    //}

    //activateStartMoving() {
    //    this.firstActivated = true;

    //    this.direction = this.DIRECTION_LEFT;
    //    this.body.velocity.x = this.direction * 100;
    //}

    //playAnimation(key) {
    //    this.anims.play(key, true);
    //}

    //playerHit(enemy, player) {
    //    if (enemy.verticalHit(enemy, player)) {
    //        player.enemyBounce(enemy);
    //        enemy.getFlat();
    //    } else if (player.invincible) { 
    //        enemy.killNoFlat();
    //    } else {
    //        enemy.hurtPlayer(enemy, player);
    //    }
    //}

    //killNoFlat() {
    //    super.killNoFlat("snowball-walk-0");
    //}

    //getFlat() {
    //    super.getFlat("snowball-squished");
    //}

    //slideKill() {
    //    this.anims.play("snowball-walk");
    //    this.killAt = 1500;
    //    this.killFalling = true;
    //    this.groundLayerCollider.destroy();
    //}
}