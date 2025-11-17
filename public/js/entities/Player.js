class Player extends Entity {
  constructor() {
    super();
    this.id = "player_" + Math.random();

    this.score = 0;
    this.lifetime = 300;

    this.haveKey = false;

    this.move_x = 0;
    this.speed = 2;
    this.vel_x = 0;
    this.vel_y = 0;

    this.onGround = false;
    this.jumpPower = 3;
    this.gravity = 0.08;
    this.maxFallSpeed = 10;

    this.facingRight = true;

    this.isAttacking = false;
    this.attackTimer = 0;
    this.attackDuration = 90;
    this.canAttack = true;

    this.wasInAir = false;
    this.isLanding = false;
    this.landingTimer = 0;
    this.landingDuration = 20;

    this.isUsingDoor = false;
    this.doorAnimationTimer = 0;
    this.doorAnimationDuration = 400;
    this.currentDoor = null;

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

  onTouchEntity(entity) {
    if (entity instanceof Diamond) {
      this.collectDiamond(entity);
    }

    if (entity instanceof Heart) {
      this.collectHeart(entity);
    }

    if (entity instanceof Key) {
      this.collectKey(entity);
    }
  }

  collectDiamond(diamond) {
    if (diamond.collected) return;

    this.score += 100;

    if (diamond.startCollect) {
      diamond.startCollect();
    }
  }

  collectHeart(heart) {
    if (heart.collected) return;

    this.lifetime += 100;

    if (heart.startCollect) {
      heart.startCollect();
    }
  }

  collectKey(key) {
    if (key.collected) return;

    this.haveKey = true;

    if (key.startCollect) {
      key.startCollect();
    }
  }

  update() {
    // вход в дверь
    if (this.isUsingDoor) {
      this.doorAnimationTimer -= 1;

      if (this.doorAnimationTimer <= 0) {
        this.currentDoor.close();
        //gameManager.kill(this);
      }

      animationManager.updateAnimation(this, "door in", 1);
      return;
    }

    // смерть
    if (this.isDying) {
      this.dieTimer -= 1;

      if (this.dieTimer <= 0) {
        //gameManager.kill(this);
      }

      animationManager.updateAnimation(this, "die", 1);
      return;
    }

    this.handleMove();
    this.handleJump();
    this.handleAttack();
    this.handleDoorInteract();

    physicManager.update(this);

    this.handleSounds();

    if (this.move_x !== 0) {
      this.facingRight = this.move_x > 0;
    }

    // стойка
    let animationType = "idle";

    // получение урона
    if (this.isTakingDamage) {
      animationType = "damage";
      this.takeDamageTimer -= 1;

      if (this.takeDamageTimer <= 0) {
        this.isTakingDamage = false;
      }
    }

    // атака
    else if (this.isAttacking) {
      animationType = "attack";
    }

    // приземление
    else if (this.isLanding) {
      animationType = "land";
      this.landingTimer -= 1;

      if (this.landingTimer <= 0) {
        this.isLanding = false;
      }
    }

    // полет
    else if (!this.onGround) {
      if (this.vel_y < 0) {
        animationType = "jump_up";
      } else {
        animationType = "jump_down";
      }
      this.wasInAir = true;
    }

    // начало приземления
    else if (this.wasInAir) {
      animationType = "land";
      this.isLanding = true;
      this.landingTimer = this.landingDuration;
      this.wasInAir = false;
    }

    // бег
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
    if (this.onGround) {
      this.vel_y = -this.jumpPower;
      this.onGround = false;
      this.isLanding = false;
      this.wasInAir = true;
    }
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
    animationManager.resetAnimation(this, "attack");
    soundManager.play("/audio/hit.mp3");

    this.createAttackHitbox();
  }

  finishAttack() {
    this.isAttacking = false;

    setTimeout(() => {
      this.canAttack = true;
    }, 300);
  }

  createAttackHitbox() {
    const range = 22
    const attackX = this.facingRight
      ? this.pos_x + Math.floor(this.size_x / 2)
      : this.pos_x - range;

    const attackY = this.pos_y;

    const attackWidth = range + Math.floor(this.size_x / 2);
    const attackHeight = 44;

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
        soundManager.play("/audio/die.mp3", {
          volume: 0.7,
          looping: false,
        });
      } else {
        soundManager.play("/audio/pain.mp3", {
          volume: 0.7,
          looping: false,
        });
      }

      this.isTakingDamage = true;
      this.takeDamageTimer = this.takeDamageDuration;
      console.log(this.lifetime);
    }
  }

  handleDoorInteract() {
    if (eventsManager.action["interact"] && !this.interactPressed) {
      this.interactPressed = true;
      this.tryInteractWithDoor();
    }

    if (!eventsManager.action["interact"]) {
      this.interactPressed = false;
    }
  }

  tryInteractWithDoor() {
    const nearbyDoor = this.findNearbyDoor();
    if (nearbyDoor) {
      nearbyDoor.onPlayerInteract(this);
    }
  }

  findNearbyDoor() {
    for (let entity of gameManager.entities) {
      if (entity instanceof Door) {
        const distance = this.pos_x - entity.pos_x;

        if (
          0 <= distance &&
          distance <= 15 &&
          entity.pos_y + entity.size_y == this.pos_y + this.size_y
        ) {
          return entity;
        }
      }
    }
    return null;
  }

  enterDoor(door) {
    if (this.isUsingDoor) return;

    this.isUsingDoor = true;
    this.doorAnimationTimer = this.doorAnimationDuration;
    this.currentDoor = door;
    soundManager.play("/audio/use_door.mp3", {
      volume: 0.1,
      looping: false,
    });
  }

  handleSounds() {
    this.handleFootsteps(); // звуки шагов
    this.handleJumpSound(); // звук прыжка
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

  handleJumpSound() {
    if (this.wasOnGround && !this.onGround && this.vel_y < 0) {
      this.playJumpSound();
    }

    this.wasOnGround = this.onGround;
  }

  playJumpSound() {
    soundManager.play("/audio/jump.mp3", {
      volume: 0.7,
      looping: false,
    });
  }
}
