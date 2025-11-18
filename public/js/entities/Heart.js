class Heart extends Entity {
  constructor() {
    super();
    this.id = "heart_" + Math.random();

    this.collected = false;
    this.collectTimer = 0;
    this.collectDuration = 50;
  }

  draw(ctx) {
    const currentSprite = animationManager.getCurrentFrame(this);
    const spriteName = currentSprite || "Heart idle 1";

    spriteManager.drawSprite(this, ctx, spriteName, this.pos_x, this.pos_y);
  }

  update() {
    if (this.collected) {
      animationManager.updateAnimation(this, "heart hit", 1);

      this.collectTimer -= 1;
      if (this.collectTimer <= 0) {
        gameManager.kill(this);
      }
      return;
    }

    const animationType = "heart idle";
    animationManager.updateAnimation(this, animationType, 1);
  }

  startCollect() {
    this.collected = true;
    this.collectTimer = this.collectDuration;
    soundManager.play("/audio/heart.mp3", {
      volume: 0.5,
      looping: false,
    });
  }
}
