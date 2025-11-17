class Enemy extends Entity {
  constructor() {
    super();
    this.id = "enemy_" + Math.random();

    this.lifetime = 3;

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
    this.attackDuration = 150;
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
    this.stepInterval = 100;
    this.lastStepIndex = -1;
    this.wasOnGround = true;

    this.isTakingDamage = false;
    this.takeDamageTimer = 0;
    this.takeDamageDuration = 90;

    this.isDying = false;
    this.dieTimer = 0;
    this.dieDuration = 90;
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
    //this.handleAttack();

    physicManager.update(this);

    this.handleSounds();

    if (this.move_x !== 0) {
      this.facingRight = this.move_x > 0;
    }

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
    this.move_x = 0;
    if (this.pos_x > gameManager.player.pos_x) this.move_x = -1;
    if (this.pos_x < gameManager.player.pos_x) this.move_x = 1;
  }

  handleAttack() {
    if (
      eventsManager.action["attack"] &&
      this.canAttack &&
      !this.isAttacking &&
      !this.isTakingDamage &&
      !this.attackPressed
    ) {
      this.attackPressed = true;
      this.startAttack();
    }

    if (!eventsManager.action["attack"]) {
      this.attackPressed = false;
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
    soundManager.play("/audio/pig_attack.mp3");

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
      ? this.pos_x + this.size_x
      : this.pos_x - 30;

    const attackY = this.pos_y + 10;

    const attackWidth = 30;
    const attackHeight = 30;

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
      console.log(this.lifetime);
    }
  }

  handleSounds() {
    this.handleFootsteps(); // звуки шагов
  }

  handleFootsteps() {
    if (this.move_x !== 0 && this.onGround) {
      this.stepTimer -= 1;

      if (this.stepTimer <= 0) {
        this.playRandomFootstep();
        this.stepTimer = this.stepInterval + Math.random() * 40 - 20;
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
      volume: 0.1,
      looping: false,
    });

    this.lastStepIndex = randomIndex;
  }
}
