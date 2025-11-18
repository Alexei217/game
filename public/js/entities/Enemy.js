class Enemy extends Entity {
  constructor() {
    super();
    this.id = "enemy_" + Math.random();

    this.lifetime = 1;

    this.range = 2;

    this.move_x = 0;
    this.speed = 1;
    this.vel_x = 0;
    this.vel_y = 0;

    this.onGround = false;
    this.gravity = 0.08;
    this.maxFallSpeed = 10;

    this.facingRight = true;

    this.isAttacking = false;
    this.attackTimer = 0;
    this.attackDuration = 55;
    this.canAttack = true;

    this.stepSounds = [
      "/audio/run1.mp3",
      "/audio/run2.mp3",
      "/audio/run3.mp3",
      "/audio/run4.mp3",
      "/audio/run5.mp3",
      "/audio/run.mp3",
      "/audio/run7.mp3",
      "/audio/run8.mp3",
      "/audio/run9.mp3",
      "/audio/run0.mp3",
    ];
    this.stepTimer = 0;
    this.stepInterval = 25;
    this.lastStepIndex = -1;

    this.isTakingDamage = false;
    this.takeDamageTimer = 0;
    this.takeDamageDuration = 40;

    this.isDying = false;
    this.dieTimer = 0;
    this.dieDuration = 90;

    this.patrolSpeed = 1; 
    this.chaseSpeed = 2;
    this.detectionRange = 150;
    this.patrolDirection = 1;
    this.isChasing = false;
    this.wallCheckDistance = 10;
  }

  draw(ctx) {
    const currentSprite = animationManager.getCurrentFrame(this);
    const spriteName = currentSprite || "Idle 1";

    spriteManager.drawSprite(
      this,
      ctx,
      spriteName,
      this.pos_x,
      this.pos_y,
      !this.facingRight
    );
  }

  update() {
    // смерть
    if (this.isDying) {
      this.dieTimer -= 1;

      if (this.dieTimer <= 0) {
        //gameManager.kill(this);
      }

      animationManager.updateAnimation(this, "pig die", 1);
      return;
    }

    this.handleMove();
    this.handleAttack();

    physicManager.update(this);

    this.handleSounds();

    // стойка
    let animationType = "pig idle";

    // получение урона
    if (this.isTakingDamage) {
      animationType = "pig damage";
      this.takeDamageTimer -= 1;

      if (this.takeDamageTimer <= 0) {
        this.isTakingDamage = false;
      }
    }

    // атака
    else if (this.isAttacking) {
      animationType = "pig attack";
    }

    // бег
    else if (this.move_x !== 0) {
      animationType = "pig run";
    }

    animationManager.updateAnimation(this, animationType, 1);
  }

  handleMove() {
    const player = gameManager.player;

    const distanceToPlayer = Math.abs(
      this.pos_x +
        Math.floor(this.size_x / 2) -
        (player.pos_x + Math.floor(player.size_x / 2))
    );

    const canSeePlayer =
      distanceToPlayer <= this.detectionRange &&
      Math.abs(this.pos_y - player.pos_y) < 100;

    if (canSeePlayer && !player.isDying) {
      // Режим преследования
      this.isChasing = true;
      this.speed = this.chaseSpeed;

      // Двигаемся к игроку
      if (
        Math.abs(
          this.pos_x +
            Math.floor(this.size_x / 2) -
            (player.pos_x + Math.floor(player.size_x / 2))
        ) <= 1
      ) {
        this.move_x = 0;
      } else if (
        this.pos_x + Math.floor(this.size_x / 2) >
        player.pos_x + Math.floor(player.size_x / 2)
      ) {
        this.move_x = -1;
      } else if (
        this.pos_x + Math.floor(this.size_x / 2) <
        player.pos_x + Math.floor(player.size_x / 2)
      ) {
        this.move_x = 1;
      }

      // Обновляем направление взгляда
      if (this.move_x !== 0) {
        this.facingRight = this.move_x > 0;
      }
    } else {
      // Режим патрулирования
      this.isChasing = false;
      this.speed = this.patrolSpeed;
      this.patrol();
    }
  }

  patrol() {
    // Если достигли границы патрулирования или уперлись в стену - разворачиваемся

    if (this.isFacingWall()) {
      this.patrolDirection *= -1;
    }

    this.move_x = this.patrolDirection;

    // Обновляем направление взгляда
    this.facingRight = this.patrolDirection > 0;
  }

  isFacingWall() {
    // Проверяем, есть ли стена в направлении движения
    const checkX = this.facingRight
      ? this.pos_x + this.size_x + this.wallCheckDistance
      : this.pos_x - this.wallCheckDistance;

    const checkY = this.pos_y;

    const ts = mapManager.getTilesetIdx(checkX, checkY);
    return ts.some((item) => item !== 155 && item !== 0);
  }

  // ... остальные методы остаются без изменений ...

  handleAttack() {
    if (
      Math.abs(
        this.pos_x +
          Math.floor(this.size_x / 2) -
          (gameManager.player.pos_x + Math.floor(gameManager.player.size_x / 2))
      ) <= this.range &&
      this.pos_y + this.size_y ==
        gameManager.player.pos_y + gameManager.player.size_y &&
      this.canAttack &&
      !this.isAttacking &&
      !this.isTakingDamage &&
      !gameManager.player.isDying
    ) {
      this.startAttack();
    }
    if (this.isAttacking) {
      this.attackTimer -= 1;

      if (this.attackTimer <= 0) {
        this.finishAttack();
      }
    }
  }

  startAttack() {
    this.isAttacking = true;
    this.attackTimer = this.attackDuration;
    this.canAttack = false;
    animationManager.resetAnimation(this, "pig attack");
    soundManager.play("/audio/pig_attack.mp3", {
      volume: 0.4,
      looping: false,
    });

    this.createAttackHitbox();
  }

  finishAttack() {
    this.isAttacking = false;

    setTimeout(() => {
      this.canAttack = true;
    }, 300);
  }

  createAttackHitbox() {
    const attackX = this.facingRight
      ? this.pos_x + Math.floor(this.size_x / 2)
      : this.pos_x - this.range;

    const attackY = this.pos_y;

    const attackWidth = this.range + Math.floor(this.size_x / 2);
    const attackHeight = 28;

    this.checkAttackHit(attackX, attackY, attackWidth, attackHeight);
  }

  checkAttackHit(x, y, width, height) {
    gameManager.entities.forEach((entity) => {
      if (
        entity !== this &&
        this.isEntityInAttackRange(entity, x, y, width, height)
      ) {
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
    if (entity.takeDamage) {
      entity.takeDamage(1);
    }

    // gameManager.kill(entity);
  }

  takeDamage(damage) {
    if (!this.isTakingDamage) {
      this.lifetime -= damage;
      if (this.lifetime <= 0) {
        gameManager.player.score += 200
        this.isDying = true;
        this.dieTimer = this.dieDuration;
        soundManager.play("/audio/pig_die.mp3", {
          volume: 0.7,
          looping: false,
        });
      } else {
        soundManager.play("/audio/pig_pain.mp3", {
          volume: 0.7,
          looping: false,
        });
      }

      this.isTakingDamage = true;
      this.takeDamageTimer = this.takeDamageDuration;
    }
  }

  handleSounds() {
    if (this.move_x !== 0 && this.onGround) {
      this.stepTimer -= 1;

      if (this.stepTimer <= 0) {
        this.playRandomFootstep();
        this.stepTimer = this.stepInterval + Math.random();
      }
    } else {
      this.stepTimer = 0;
    }
  }

  playRandomFootstep() {
    let randomIndex;

    do {
      randomIndex = Math.floor(Math.random() * this.stepSounds.length);
    } while (randomIndex === this.lastStepIndex && this.stepSounds.length > 1);

    const stepSound = this.stepSounds[randomIndex];
    soundManager.play(stepSound, {
      volume: 0.05,
      looping: false,
    });

    this.lastStepIndex = randomIndex;
  }
}
