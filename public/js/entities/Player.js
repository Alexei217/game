class Player extends Entity {
  constructor() {
    super();

    this.score = 0;
    this.lifetime = 100;

    this.haveKey = false;

    this.move_x = 0;
    this.speed = 1;
    this.vel_x = 0;
    this.vel_y = 0;

    this.onGround = false;
    this.jumpPower = 3;
    this.gravity = 0.08;
    this.maxFallSpeed = 10;

    this.id = "player_" + Math.random();

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
      "/audio/run0.mp3"
    ];
    this.stepTimer = 0;
    this.stepInterval = 100;
    this.lastStepIndex = -1;
    this.wasOnGround = true;
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
    if (this.isUsingDoor) {
      this.doorAnimationTimer -= 1;

      animationManager.updateAnimation(this, "door in", 1);

      if (this.doorAnimationTimer <= 0) {
        this.currentDoor.close()
        //gameManager.kill(this);
      }
      return;
    }

    this.handleMove();
    this.handleJump();
    this.handleAttack();
    this.handleDoorInteract();

    physicManager.update(this);

    if (this.move_x !== 0) {
      this.facingRight = this.move_x > 0;
    }

    this.handleSounds();

    // стойка
    let animationType = "idle";

    // атака
    if (this.isAttacking) {
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
    console.log("Attack hit:", entity.name);

    if (entity.takeDamage) {
      entity.takeDamage(1);
    }

    // gameManager.kill(entity);
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
          // радиус взаимодействия
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
      looping: false
    });
  }

  handleSounds() {
    this.handleFootsteps(); // звуки шагов
    this.handleJumpSound(); // звук прыжка
  }

  // ⭐ ЗВУКИ ШАГОВ
  handleFootsteps() {
    const isMoving = (this.move_x !== 0 && this.onGround);
    
    if (isMoving) {
      this.stepTimer -= 1;
      
      if (this.stepTimer <= 0) {
        this.playRandomFootstep();
        
        // Случайный интервал для естественности
        this.stepTimer = this.stepInterval + Math.random() * 40 - 20; // ±20ms
      }
    } else {
      this.stepTimer = 0;
    }
  }

  playRandomFootstep() {
    let randomIndex;
    
    // Исключаем повтор подряд одинаковых шагов
    do {
      randomIndex = Math.floor(Math.random() * this.stepSounds.length);
    } while (randomIndex === this.lastStepIndex && this.stepSounds.length > 1);
    
    const stepSound = this.stepSounds[randomIndex];
    console.log("Playing random step:", stepSound);
    
    soundManager.play(stepSound, {
      volume: 0.1,
      looping: false
    });
    
    this.lastStepIndex = randomIndex;
  }

  // ⭐ ЗВУК ПРЫЖКА
  handleJumpSound() {
    // Определяем момент отрыва от земли (начало прыжка)
    if (this.wasOnGround && !this.onGround && this.vel_y < 0) {
      this.playJumpSound();
    }
    
    this.wasOnGround = this.onGround;
  }

  playJumpSound() {
    console.log("Playing jump sound");
    soundManager.play("/audio/jump.mp3", {
      volume: 0.7,
      looping: false
    });
  }
}
