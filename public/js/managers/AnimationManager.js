class AnimationManager {
  constructor() {
    this.animations = new Map();
    this.currentAnimations = new Map(); // entityId -> current animation
  }

  // Добавляем анимацию
  addAnimation(name, frames, frameRate = 10, loop = true) {
    this.animations.set(name, {
      frames: frames, // массив имен спрайтов
      frameRate: frameRate,
      loop: loop,
      currentFrame: 0,
      frameTime: 0
    });
  }

  // Обновляем анимацию для объекта
  updateAnimation(entity, animationName, dt) {
    if (!this.animations.has(animationName)) return null;
    
    const anim = this.animations.get(animationName);
    anim.frameTime += dt;
    
    const frameDuration = 1000 / anim.frameRate;
    
    if (anim.frameTime >= frameDuration) {
      anim.frameTime = 0;
      anim.currentFrame++;
      
      if (anim.currentFrame >= anim.frames.length) {
        if (anim.loop) {
          anim.currentFrame = 0;
        } else {
          anim.currentFrame = anim.frames.length - 1;
        }
      }
    }
    
    // Сохраняем текущую анимацию для объекта
    this.currentAnimations.set(entity.id, {
      name: animationName,
      frame: anim.frames[anim.currentFrame]
    });
    
    return anim.frames[anim.currentFrame];
  }

  // Получаем текущий кадр анимации для объекта
  getCurrentFrame(entity) {
    const currentAnim = this.currentAnimations.get(entity.id);
    return currentAnim ? currentAnim.frame : null;
  }
}