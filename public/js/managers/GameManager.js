class GameManager {
  factory = {};
  entities = [];
  fireNum = 0;
  player = null;
  laterKill = [];

  initPlayer(obj) {
    this.player = obj;
  }

  kill(obj) {
    this.laterKill.push(obj);
  }

  update() {
    if (this.player === null) return;
    this.player.move_x = 0;
    this.player.move_y = 0;
    if (eventsManager.action["up"]) this.player.move_y = -1;
    if (eventsManager.action["down"]) this.player.move_y = 1;
    if (eventsManager.action["left"]) this.player.move_x = -1;
    if (eventsManager.action["right"]) this.player.move_x = 1;
    if (eventsManager.action["fire"]) this.player.fire();
    this.entities.forEach(function (e) {
      try {
        e.update();
      } catch (ex) {}
    });
    for (var i = 0; i < this.laterKill.length; i++) {
      var idx = this.entities.indexOf(this.laterKill[i]);
      if (idx > -1) this.entities.splice(idx, 1);
    }
    if (this.laterKill.length > 0) this.laterKill.length = 0;
    mapManager.draw(ctx);
    mapManager.centerAt(this.player.pos_x, this.player.pos_y);
    this.draw(ctx);
  }

  draw(ctx) {
    for (var e = 0; e < this.entities.length; e++) this.entities[e].draw(ctx);
  }

  loadAll() {
    mapManager.loadMap("/map/map.json");
    spriteManager.loadAtlas("/atlas/sprites.json", "/atlas/spritesheet.png");

    this.factory["Player"] = Player;
    mapManager.parseEntities();
    mapManager.draw(ctx);
    eventsManager.setup(canvas);
    soundManager.init();
    soundManager.loadArray(["/audio/1.mp3"]);
    soundManager.play("/audio/1.mp3", {
      volume: 0.5,
      looping: true,
    });
  }

  play() {
    this.timer = setInterval(() => {
      try {
        this.update();
      } catch (e) {
        console.log(e);
      }
    }, 10);
  }
}
