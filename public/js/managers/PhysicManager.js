class PhysicManager {
  update(obj) {
    if (!obj.onGround) {
      obj.vel_y += obj.gravity;

      if (obj.vel_y > obj.maxFallSpeed) {
        obj.vel_y = obj.maxFallSpeed;
      }
    } else {
      obj.vel_y = 0;
    }

    // горизонтальное движение
    obj.vel_x = obj.move_x * obj.speed;

    var newX = obj.pos_x + obj.vel_x;

    if (obj.vel_x !== 0) {
      var canMoveX = this.canMoveTo(obj, newX, obj.pos_y);
      if (canMoveX) {
        obj.pos_x = newX;
      } else {
        obj.vel_x = 0;
      }
    }
    // вертикльное движение
    if (obj.vel_y !== 0) {
      var targetY = obj.pos_y + obj.vel_y;

      var stepY = obj.vel_y > 0 ? 1 : -1;
      var steps = Math.abs(obj.vel_y);
      var currentY = obj.pos_y;
      var collision = false;

      for (var i = 0; i < steps; i++) {
        currentY += stepY;
        if (!this.canMoveTo(obj, obj.pos_x, currentY)) {
          obj.pos_y = currentY - stepY;
          obj.vel_y = 0;
          if (stepY > 0) obj.onGround = true;
          collision = true;
          break;
        }
      }

      if (!collision) {
        obj.pos_y = targetY;
        obj.onGround = false;
      }
    }

    var e = this.entityAtXY(obj, obj.pos_x, obj.pos_y);
    if (e !== null && obj.onTouchEntity) {
      obj.onTouchEntity(e);
    }

    obj.pos_x = Math.round(obj.pos_x);
    obj.pos_y = Math.round(obj.pos_y);

    if (obj.onGround) {
      obj.onGround = this.hasGroundUnder(obj, obj.pos_x, obj.pos_y);
    }
  }

  hasGroundUnder(obj, x, y) {
    var groundCheckPoints = [
      { x: x, y: y + obj.size_y }, // нижний левый
      { x: x + obj.size_x - 1, y: y + obj.size_y }, // нижний правый
      { x: x + Math.floor(obj.size_x / 2), y: y + obj.size_y }, // середина нижней стороны
    ];

    for (var point of groundCheckPoints) {
      var ts = mapManager.getTilesetIdx(point.x, point.y);
      if (ts.some((item) => item !== 155 && item !== 0)) {
        return true;
      }
    }
    return false;
  }

  canMoveTo(obj, x, y) {
    let shift = 0;
    if(obj instanceof Player) {
      shift = 12
    }

    var points = [
      { x: x, y: y + shift }, // верхний левый
      { x: x + obj.size_x - 1, y: y + shift }, // верхний правый
      { x: x, y: y + obj.size_y - 1 }, // нижний левый
      { x: x + obj.size_x - 1, y: y + obj.size_y - 1 }, // нижний правый

      { x: x + Math.floor(obj.size_x / 2), y: y + shift}, // середина верхней стороны
      { x: x + Math.floor(obj.size_x / 2), y: y + obj.size_y - 1 }, // середина нижней стороны
      { x: x, y: y + Math.floor(obj.size_y / 2) }, // середина левой стороны
      { x: x + obj.size_x - 1, y: y + Math.floor(obj.size_y / 2) }, // середина правой стороны
    ];

    for (var point of points) {
      var ts = mapManager.getTilesetIdx(point.x, point.y);

      if (ts.some((item) => item !== 155 && item !== 0)) {
        return false;
      }
    }
    return true;
  }

  entityAtXY(obj, x, y) {
    for (var i = 0; i < gameManager.entities.length; i++) {
      var e = gameManager.entities[i];
      if (e.name !== obj.name) {
        if (
          x + obj.size_x < e.pos_x ||
          y + obj.size_y < e.pos_y ||
          x > e.pos_x + e.size_x ||
          y > e.pos_y + e.size_y
        )
          continue;
        return e;
      }
    }
    return null;
  }
}
