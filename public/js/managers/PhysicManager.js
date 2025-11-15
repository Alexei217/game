class PhysicManager {
  update(obj) {
    if (obj.onGround) {
      obj.onGround = this.hasGroundUnder(obj, obj.pos_x, obj.pos_y);
    }

    // Применяем гравитацию
    if (!obj.onGround) {
      obj.vel_y += obj.gravity;
      // Ограничиваем максимальную скорость падения
      if (obj.vel_y > obj.maxFallSpeed) {
        obj.vel_y = obj.maxFallSpeed;
      }
    } else {
      obj.vel_y = 0; // на земле вертикальная скорость = 0
    }

    // Обрабатываем горизонтальное движение
    obj.vel_x = obj.move_x * obj.speed;
    // Вычисляем новую позицию
    var newX = obj.pos_x + obj.vel_x;

    // Проверяем столкновения по горизонтали
    if (obj.vel_x !== 0) {
      var canMoveX = this.canMoveTo(obj, newX, obj.pos_y);
      if (canMoveX) {
        obj.pos_x = newX;
      } else {
        obj.vel_x = 0;
      }
    }

    if (obj.vel_y !== 0) {
      var targetY = obj.pos_y + obj.vel_y;

      // Если скорость высокая, используем пошаговую проверку
      var stepY = obj.vel_y > 0 ? 1 : -1;
      var steps = Math.abs(obj.vel_y);
      var currentY = obj.pos_y;
      var collision = false;

      for (var i = 0; i < steps; i++) {
        currentY += stepY;
        if (!this.canMoveTo(obj, obj.pos_x, currentY)) {
          // Столкновение! Останавливаемся у поверхности
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

    // Проверяем столкновения с другими entity
    var e = this.entityAtXY(obj, obj.pos_x, obj.pos_y);
    if (e !== null && obj.onTouchEntity) {
      obj.onTouchEntity(e);
    }

    obj.pos_x = Math.round(obj.pos_x);
    obj.pos_y = Math.round(obj.pos_y);

    return obj.vel_x !== 0 || obj.vel_y !== 0 ? "move" : "stop";
  }

  hasGroundUnder(obj, x, y) {
    // Проверяем только две точки под углами объекта
    var groundCheckPoints = [
      { x: x, y: y + obj.size_y }, // левый нижний угол
      { x: x + obj.size_x - 1, y: y + obj.size_y }, // правый нижний угол
    ];

    for (var point of groundCheckPoints) {
      var ts = mapManager.getTilesetIdx(point.x, point.y);
      if (ts.some(item => item !== 155 && item !== 0)) {
        // непроходимый тайл = земля
        return true;
      }
    }
    return false;
  }

  // Проверяет, может ли объект переместиться в указанную позицию
  canMoveTo(obj, x, y) {
    // Проверяем все 4 угла спрайта
    var points = [
      { x: x, y: y }, // верхний левый
      { x: x + obj.size_x - 1, y: y }, // верхний правый
      { x: x, y: y + obj.size_y - 1 }, // нижний левый
      { x: x + obj.size_x - 1, y: y + obj.size_y - 1 }, // нижний правый
    ];

    for (var point of points) {
      var ts = mapManager.getTilesetIdx(point.x, point.y);
      // Если тайл непроходим (ts !== 155)
      if (ts.some(item => item !== 155 && item !== 0)) {
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
