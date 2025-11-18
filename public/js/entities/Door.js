class Door extends Entity {
  constructor() {
    super();
    this.id = "door_" + Math.random();

    this.isOpen = false;
    this.isOpening = false;
    this.isClosing = false;

    this.animationTimer = 0;
    this.animationDuration = 50;
  }

  draw(ctx) {
    const currentSprite = animationManager.getCurrentFrame(this);
    const spriteName = currentSprite || "Door idle 1";

    spriteManager.drawSprite(this, ctx, spriteName, this.pos_x, this.pos_y);
  }

  update() {
    let animationType = "door idle";
    if (this.isClosing) {
      animationType = "door closing";
      this.animationTimer -= 1;
      if (this.animationTimer <= 0) {
        this.isOpen = false;
        this.isClosing = false;
      }
    } else if (this.isOpening) {
      animationType = "door opening";
      this.animationTimer -= 1;
      if (this.animationTimer <= 0) {
        this.isOpen = true;
        this.isOpening = false;
      }
    } else if (this.isOpen) {
      animationType = "door open";
    }
    animationManager.updateAnimation(this, animationType, 1);
  }

  open() {
    if (this.isOpening || this.isOpen) return;
    this.isOpening = true;
    this.animationTimer = this.animationDuration;
    soundManager.play("/audio/door.mp3");
  }

  close() {
    if (this.isClosing || !this.isOpen) return;
    this.isClosing = true;
    this.animationTimer = this.animationDuration;
    soundManager.play("/audio/door.mp3");
  }

  onPlayerInteract(player) {
    if (!player.haveKey) {
      soundManager.play("/audio/door_locked.mp3");
      return;
    }

    if (!this.isOpen) {
      this.open();
    } else {
      player.enterDoor(this);
    }
  }
}
