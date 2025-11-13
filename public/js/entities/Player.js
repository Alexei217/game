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

    this.id = "player_" + Math.random(); // уникальный ID для анимаций
    this.facingRight = true; // направление взгляда
    this.lastMoveX = 0; // последнее направление движения
  }

  draw(ctx) {
    // Получаем текущий спрайт из анимации
    const currentSprite = animationManager.getCurrentFrame(this);

    // Если есть анимация - используем её, иначе дефолтный спрайт
    const spriteName = currentSprite || "player";

    // Сохраняем контекст для отражения
    ctx.save();

    // Если смотрим влево - отражаем canvas
    if (!this.facingRight) {
      ctx.translate(this.pos_x + this.size_x, 0);
      ctx.scale(-1, 1);
      spriteManager.drawSprite(ctx, spriteName, 0, this.pos_y);
    } else {
      spriteManager.drawSprite(ctx, spriteName, this.pos_x, this.pos_y);
    }

    ctx.restore();
  }

  update() {
    // Обновляем направление взгляда
    if (this.move_x !== 0) {
      this.facingRight = this.move_x > 0;
      this.lastMoveX = this.move_x;
    }

    // Определяем тип анимации в зависимости от состояния
    let animationType = "idle"; // по умолчанию

    if (!this.onGround) {
      animationType = "jump";
    } else if (this.move_x !== 0) {
      animationType = "run";
    }

    // Обновляем анимацию (dt = 16ms для 60fps)
    animationManager.updateAnimation(this, animationType, 16);

    physicManager.update(this);
  }

  jump() {
    if (this.onGround) {
      this.vel_y = -this.jumpPower;
      this.onGround = false;
    }
  }
}
