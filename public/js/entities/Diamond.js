class Diamond extends Entity {
  constructor() {
    super();
    this.id = "diamond_" + Math.random();

    this.collected = false;
    this.collectTimer = 0;
    this.collectDuration = 150;
  }

  draw(ctx) {
    const currentSprite = animationManager.getCurrentFrame(this);
    const spriteName = currentSprite || "Diamond idle 1";

    spriteManager.drawSprite(this, ctx, spriteName, this.pos_x, this.pos_y);
  }

  update() {
    if (this.collected) {
      animationManager.updateAnimation(this, "diamond hit", 1);

      this.collectTimer -= 1;
      if (this.collectTimer <= 0) {
        gameManager.kill(this);
      }
      return;
    }

    const animationType = "diamond idle";
    animationManager.updateAnimation(this, animationType, 1);
  }

  startCollect() {
    this.collected = true;
    this.collectTimer = this.collectDuration;
    soundManager.play("/audio/diamond.mp3");
  }
}
