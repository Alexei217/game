class PhysicManager {
  update(obj) {
    if (obj.move_x === 0 && obj.move_y === 0) return "stop";
    var newX = obj.pos_x + Math.floor(obj.move_x * obj.speed);
    var newY = obj.pos_y + Math.floor(obj.move_y * obj.speed);
    var ts1 = mapManager.getTilesetIdx(
      newX,
      newY
    );
    var ts2 = mapManager.getTilesetIdx(
      newX + obj.size_x -1,
      newY
    );
    var ts3 = mapManager.getTilesetIdx(
      newX,
      newY + 42
    );
    var ts4 = mapManager.getTilesetIdx(
      newX + obj.size_x -1,
      newY  + 42
    );
    var e = this.entityAtXY(obj, newX, newY);
    if (e !== null && obj.onTouchEntity) obj.onTouchEntity(e);
    // if (ts !== 1 && obj.onTouchMap) obj.onTouchMap(ts);
    if (e === null && ts1 == 155 && ts2 == 155 && ts3 == 155 && ts4 == 155) {
      obj.pos_x = newX;
      obj.pos_y = newY;
    } else return "break";
    return "move";
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
