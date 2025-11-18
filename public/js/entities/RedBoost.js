class RedBoost extends Entity {
  constructor() {
    super();
    this.id = "red_boost_" + Math.random();

    this.collected = false;
  }

  draw(ctx) {
    const currentSprite = animationManager.getCurrentFrame(this);
    const spriteName = currentSprite || "Red Boost 1";

    spriteManager.drawSprite(this, ctx, spriteName, this.pos_x, this.pos_y);
  }

  update() {
    if (this.collected) {
      gameManager.kill(this);
    }

    const animationType = "red boost";
    animationManager.updateAnimation(this, animationType, 1);
  }

  startCollect() {
    this.collected = true;
    soundManager.play("/audio/bottle.mp3", {
      volume: 0.4,
      looping: false,
    });
  }
}
