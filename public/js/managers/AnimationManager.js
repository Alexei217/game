class AnimationManager {
  constructor() {
    this.animations = new Map();
    this.entityAnimations = new Map();
  }

  addAnimation(name, frames, frameRate = 10, loop = true) {
    this.animations.set(name, {
      frames: frames,
      frameRate: frameRate,
      loop: loop
    });
  }

  resetAnimation(entity, animationName) {
    const entityAnim = this.entityAnimations.get(entity.id);
    if (entityAnim && entityAnim.name === animationName) {
      entityAnim.currentFrame = 0;
      entityAnim.frameTime = 0;
    }
  }

  updateAnimation(entity, animationName, dt) {
    if (!this.animations.has(animationName)) {
      return null;
    }
    const animType = this.animations.get(animationName);
    
    let entityAnim = this.entityAnimations.get(entity.id);
    
    if (!entityAnim || entityAnim.name !== animationName) {
      entityAnim = {
        name: animationName,
        currentFrame: 0,
        frameTime: 0
      };
    }

    entityAnim.frameTime += dt;
    const frameDuration = 1000 / animType.frameRate;

    if (entityAnim.frameTime >= frameDuration) {
      entityAnim.frameTime = 0;
      entityAnim.currentFrame++;

      if (entityAnim.currentFrame >= animType.frames.length) {
        if (animType.loop) {
          entityAnim.currentFrame = 0;
        } else {
          entityAnim.currentFrame = animType.frames.length - 1;
        }
      }
    }

    this.entityAnimations.set(entity.id, entityAnim);

    return animType.frames[entityAnim.currentFrame];
  }

  getCurrentFrame(entity) {
    const entityAnim = this.entityAnimations.get(entity.id);
    if (!entityAnim) return null;

    const animType = this.animations.get(entityAnim.name);
    if (!animType) return null;

    return animType.frames[entityAnim.currentFrame];
  }
}