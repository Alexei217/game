class Player extends Entity {
  constructor() {
    super();
    this.score = 0;
    this.lifetime = 100;
    this.move_x = 0;
    this.speed = 1;
    this.vel_x = 0; // горизонтальная скорость
    this.vel_y = 0; // вертикальная скорость
    this.onGround = false; // находится ли на земле
    this.jumpPower = 3;
    this.gravity = 0.08;
    this.maxFallSpeed = 10;

    this.id = "player_" + Math.random();

    this.facingRight = true; // направление взгляда

    this.isAttacking = false;
    this.attackTimer = 0;
    this.attackDuration = 90; // длительность атаки в ms
    this.canAttack = true; // кулдаун атаки

    this.wasInAir = false;
    this.isLanding = false;
    this.landingTimer = 0;
    this.landingDuration = 20; // длительность приземления

    this.lastAnimation = null;
  }

  draw(ctx) {
    const currentSprite = animationManager.getCurrentFrame(this);
    const spriteName = currentSprite || "Idle 1";

    // Просто передаем flip параметр
    spriteManager.drawSprite(
      this,
      ctx,
      spriteName,
      this.pos_x,
      this.pos_y,
      !this.facingRight // true если смотрит влево
    );
  }

  onTouchEntity(entity) {
    if (entity instanceof Diamond) {
      this.collectDiamond(entity);
    } 

    if (entity instanceof Heart) {
      this.collectHeart(entity);
    } 



    // Можно добавить другие взаимодействия
    // if (other instanceof Enemy) {
    //   this.takeDamage();
    // }
  }
  
  collectDiamond(diamond) {
    if (diamond.collected) return; // уже собран
    
    console.log("Player collected diamond!");
    
    // Помечаем алмаз как собранный
    diamond.collected = true;
    
    // Добавляем очки
    this.score += 100;
    console.log("Score:", this.score);
    
    // Воспроизводим звук
    //soundManager.play("/audio/collect.mp3");
    
    // Запускаем анимацию сбора у алмаза
    if (diamond.startCollect) {
      diamond.startCollect();
    }
    
    // Можно добавить визуальные эффекты
    this.createCollectEffect(diamond.pos_x, diamond.pos_y);
  }

  collectHeart(heart) {
    if (heart.collected) return; // уже собран
    
    console.log("Player collected heart!");
    
    // Помечаем алмаз как собранный
    heart.collected = true;
    
    // Добавляем очки
    this.lifetime += 100;
    console.log("Healf:", this.lifetime);
    
    // Воспроизводим звук
    //soundManager.play("/audio/collect.mp3");
    
    // Запускаем анимацию сбора у алмаза
    if (heart.startCollect) {
      heart.startCollect();
    }
    
    // Можно добавить визуальные эффекты
    this.createCollectEffect(heart.pos_x, heart.pos_y);
  }

  // ⭐ ВИЗУАЛЬНЫЙ ЭФФЕКТ ПРИ СБОРЕ
  createCollectEffect(x, y) {
    // Например, можно создать частицы или текст "+100"
    console.log("Collect effect at:", x, y);
    
    // Если есть система частиц:
    // particleManager.createExplosion(x, y, 10, '#00FFFF');
  }

  // ⭐ ВИЗУАЛЬНЫЙ ЭФФЕКТ ПРИ СБОРЕ
  createCollectEffect(x, y) {
    // Например, можно создать частицы или текст "+100"
    console.log("Collect effect at:", x, y);
    
    // Если есть система частиц:
    // particleManager.createExplosion(x, y, 10, '#00FFFF');
  }

  update() {
    this.handleMove();
    this.handleJump();
    this.handleAttack();

    physicManager.update(this);

    if (this.move_x !== 0) {
      this.facingRight = this.move_x > 0;
    }

    let animationType = "idle";

    // 1. АТАКА (самый высокий приоритет)
    if (this.isAttacking) {
      animationType = "attack";
    }
    // 2. ПРИЗЕМЛЕНИЕ
    else if (this.isLanding) {
      animationType = "land";
      this.landingTimer -= 1;

      if (this.landingTimer <= 0) {
        this.isLanding = false;
      }
    }
    // 3. ПОЛЕТ
    else if (!this.onGround) {
      if (this.vel_y < 0) {
        animationType = "jump_up";
      } else {
        animationType = "jump_down";
      }
      this.wasInAir = true;
    }
    // 4. НАЧАЛО ПРИЗЕМЛЕНИЯ
    else if (this.wasInAir) {
      animationType = "land";
      this.isLanding = true;
      this.landingTimer = this.landingDuration;
      this.wasInAir = false;
    }
    // 5. БЕГ
    else if (this.move_x !== 0) {
      animationType = "run";
    }

    animationManager.updateAnimation(this, animationType, 1);
  }

  handleMove() {
    this.move_x = 0;
    if (eventsManager.action["left"]) this.move_x = -1;
    if (eventsManager.action["right"]) this.move_x = 1;
  }

  handleJump() {
    if (eventsManager.action["up"] && !this.upPressed) {
      this.jump();
      this.upPressed = true;
    }

    if (!eventsManager.action["up"]) {
      this.upPressed = false;
    }
  }

  jump() {
    if (this.onGround && !this.isLanding) {
      this.vel_y = -this.jumpPower;
      this.onGround = false;
      this.wasInAir = true;
    }
  }

  handleAttack() {
    if (
      eventsManager.action["attack"] &&
      this.canAttack &&
      !this.isAttacking &&
      !this.attackPressed
    ) {
      this.attackPressed = true;
      this.startAttack();
    }

    if (!eventsManager.action["attack"]) {
      this.attackPressed = false;
    }

    // Обновляем таймер атаки
    if (this.isAttacking) {
      this.attackTimer -= 1;

      // Завершаем атаку когда время вышло
      if (this.attackTimer <= 0) {
        this.finishAttack();
      }
    }
  }

  startAttack() {
    this.isAttacking = true;
    this.attackTimer = this.attackDuration;
    this.canAttack = false; // предотвращаем повторную атаку
    animationManager.resetAnimation(this, "attack");

    // Можно добавить звук атаки
    soundManager.play("/audio/explode.mp3");

    // Создаем область атаки (хитбокс)
    this.createAttackHitbox();
  }

  finishAttack() {
    this.isAttacking = false;

    // Восстанавливаем возможность атаки через небольшой кулдаун
    setTimeout(() => {
      this.canAttack = true;
    }, 300); // 100ms кулдаун между атаками
  }
  createAttackHitbox() {
    // Определяем позицию атаки в зависимости от направления
    const attackX = this.facingRight
      ? this.pos_x + this.size_x
      : this.pos_x - 30; // отступ для атаки влево

    const attackY = this.pos_y + 10; // немного выше ног

    const attackWidth = 30;
    const attackHeight = 30;

    // Проверяем попадание по врагам
    this.checkAttackHit(attackX, attackY, attackWidth, attackHeight);
  }

  checkAttackHit(x, y, width, height) {
    // Проверяем все entities на попадание в область атаки
    gameManager.entities.forEach((entity) => {
      if (
        entity !== this &&
        this.isEntityInAttackRange(entity, x, y, width, height)
      ) {
        // Попали по entity!
        this.onAttackHit(entity);
      }
    });
  }

  isEntityInAttackRange(entity, attackX, attackY, attackWidth, attackHeight) {
    return !(
      attackX + attackWidth < entity.pos_x ||
      attackY + attackHeight < entity.pos_y ||
      attackX > entity.pos_x + entity.size_x ||
      attackY > entity.pos_y + entity.size_y
    );
  }

  onAttackHit(entity) {
    // Обработка попадания по врагу
    console.log("Attack hit:", entity.name);

    // Например, наносим урон
    if (entity.takeDamage) {
      entity.takeDamage(1);
    }

    // Или уничтожаем
    // gameManager.kill(entity);
  }
}
