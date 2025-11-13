class Player extends Entity {
  constructor() {
    super();
    this.lifetime = 100;
    this.move_x = 0;
    this.move_y = 0;
    this.speed = 1;
    this.jumpPower = 10;
    this.gravity = 0.3;
    this.maxFallSpeed = 10;
  }

  draw(ctx) {
    spriteManager.drawSprite(ctx, "player", this.pos_x, this.pos_y);
  }

  update() {
    physicManager.update(this);
  }

  jump() {
    if (this.onGround) {
      this.vel_y = -this.jumpPower;
      this.onGround = false;
    }
  }


}
