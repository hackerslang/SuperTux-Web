class SquishableEnemy {
  constructor(config, self) {
    super(config);

    this.enemy = self;
    this.squishedSprite = config.squishedSprite;
  }

  update(time, delta) {
    this.checkKillAt(delta);
  }

  checkKillAt(delta) {
    if (this.killAt > 0) {
      this.killed = true;
      this.body.setVelocityX(0);
    } 

    this.killAt -= delta;

    if (this.killAt <= 0) {
        super.kill();
      }
  }

  killFlat(texture) {
    var self = this.enemy;

    self.setTexture(this.squishedSprite);
    self.body.height = 13;
    self.body.setVelocityX(0);
    self.body.acceleration.x = 0;
    self.killAt = 500;
    self.hasJustTurnedAroundLeft = false;
    self.hasJustTurnedAroundRight = false;
  }
}
