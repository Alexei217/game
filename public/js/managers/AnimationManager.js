class AnimationManager {
  constructor() {
    this.animations = new Map(); // типы анимаций (общие для всех)
    this.entityAnimations = new Map(); // состояние анимаций для каждого объекта
  }

  // Добавляем тип анимации (общий для всех объектов)
  addAnimation(name, frames, frameRate = 10, loop = true) {
    this.animations.set(name, {
      frames: frames,
      frameRate: frameRate,
      loop: loop
    });
  }

  // Сброс анимации для конкретного объекта
  resetAnimation(entity, animationName) {
    const entityAnim = this.entityAnimations.get(entity.id);
    if (entityAnim && entityAnim.name === animationName) {
      entityAnim.currentFrame = 0;
      entityAnim.frameTime = 0;
    }
  }

  // Обновляем анимацию для конкретного объекта
  updateAnimation(entity, animationName, dt) {
    if (!this.animations.has(animationName)) {
      console.warn(`Animation type "${animationName}" not found`);
      return null;
    }

    const animType = this.animations.get(animationName);
    
    // Получаем или создаем состояние анимации для этого объекта
    let entityAnim = this.entityAnimations.get(entity.id);
    
    // Если у объекта нет анимации или он переключился на другую анимацию
    if (!entityAnim || entityAnim.name !== animationName) {
      entityAnim = {
        name: animationName,
        currentFrame: 0,
        frameTime: 0
      };
      this.entityAnimations.set(entity.id, entityAnim);
    }

    // Обновляем время анимации
    entityAnim.frameTime += dt;
    const frameDuration = 1000 / animType.frameRate;

    // Проверяем, нужно ли переключить кадр
    if (entityAnim.frameTime >= frameDuration) {
      entityAnim.frameTime = 0;
      entityAnim.currentFrame++;

      // Обрабатываем конец анимации
      if (entityAnim.currentFrame >= animType.frames.length) {
        if (animType.loop) {
          entityAnim.currentFrame = 0; // зацикливание
        } else {
          entityAnim.currentFrame = animType.frames.length - 1; // останавливаем на последнем кадре
        }
      }
    }

    // Сохраняем обновленное состояние
    this.entityAnimations.set(entity.id, entityAnim);

    return animType.frames[entityAnim.currentFrame];
  }

  // Получаем текущий кадр анимации для объекта
  getCurrentFrame(entity) {
    const entityAnim = this.entityAnimations.get(entity.id);
    if (!entityAnim) return null;

    const animType = this.animations.get(entityAnim.name);
    if (!animType) return null;

    return animType.frames[entityAnim.currentFrame];
  }

  // Получаем информацию о текущей анимации объекта
  getCurrentAnimation(entity) {
    const entityAnim = this.entityAnimations.get(entity.id);
    if (!entityAnim) return null;

    return {
      name: entityAnim.name,
      currentFrame: entityAnim.currentFrame,
      frameTime: entityAnim.frameTime
    };
  }

  // Удаляем состояние анимации объекта (при удалении объекта)
  removeEntityAnimation(entity) {
    this.entityAnimations.delete(entity.id);
  }
}