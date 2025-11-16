class Door extends Entity {
  constructor() {
    super();
    this.id = "door_" + Math.random();

    this.isOpen = false;
    this.isOpening = false;
    this.isClosing = false;
    this.isLocked = false;

    this.animationTimer = 0;
    this.animationDuration = 150;
  }

  draw(ctx) {
    const currentSprite = animationManager.getCurrentFrame(this);
    const spriteName = currentSprite || "Door idle 1";

    spriteManager.drawSprite(this, ctx, spriteName, this.pos_x, this.pos_y);
  }

  update() {
    if (this.isClosing) {
      animationManager.updateAnimation(this, "door closing", 1);
      this.animationTimer -= 1;
      if (this.animationTimer <= 0) {
        this.isOpen = false;
        this.isClosing = false;
      }
      return;
    } else if (this.isOpening) {
      animationManager.updateAnimation(this, "door opening", 1);
      this.animationTimer -= 1;
      if (this.animationTimer <= 0) {
        this.isOpen = true;
      }
      return;
    }
    const animationType = "door idle";
    animationManager.updateAnimation(this, animationType, 1);
  }

  open() {
    if (this.isLocked || this.isOpening || this.isOpen) return;

    this.isOpening = true;
    this.animationTimer = this.animationDuration;

    soundManager.play("/audio/door.mp3");
  }

  close() {
    if (this.isLocked || this.isClosing || !this.isOpen) return;
    this.isOpening = false;
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

  // ⭐ УСТАНОВКА СВЯЗАННОЙ ДВЕРИ
  setConnectedDoor(door) {
    this.connectedDoor = door;
  }
}
