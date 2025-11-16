class Key extends Entity {
  constructor() {
    super();
    this.id = "key_" + Math.random();

    this.collected = false;
  }

  draw(ctx) {
    const currentSprite = animationManager.getCurrentFrame(this);
    const spriteName = currentSprite || "Key 1";

    spriteManager.drawSprite(this, ctx, spriteName, this.pos_x, this.pos_y);
  }

  update() {
    if (this.collected) {
        gameManager.kill(this);
    }

    const animationType = "key";
    animationManager.updateAnimation(this, animationType, 1);
  }

  startCollect() {
    this.collected = true;
    soundManager.play("/audio/heart.mp3");
  }
}
