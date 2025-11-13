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
    if (eventsManager.action["left"]) this.player.move_x = -1;
    if (eventsManager.action["right"]) this.player.move_x = 1;
    if (eventsManager.action["up"] && !this.upPressed) {
      this.player.jump();
      this.upPressed = true;
    }

    if (!eventsManager.action["up"]) {
      this.upPressed = false;
    }

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
    this.initAnimations();
    mapManager.draw(ctx);
    eventsManager.setup(canvas);
    soundManager.init();
    soundManager.loadArray(["/audio/1.mp3"]);
    soundManager.play("/audio/1.mp3", {
      volume: 0.5,
      looping: true,
    });
  }

  initAnimations() {
  // Анимация стойки (idle) - используем первые 11 спрайтов (sprite33 - sprite43)
  animationManager.addAnimation("idle", [
    "sprite2",  // 2
    "sprite3",  // 3
    "sprite4",  // 4
    "sprite5",  // 5
    "sprite6",  // 6
    "sprite7",  // 7
    "sprite8",  // 8
    "sprite9",  // 9
    "sprite10",  // 10
    "sprite11",
    "sprite12"   // 11
  ], 4); // 8 кадров в секунду - плавная анимация стойки

  // Анимация ходьбы (run) - используем следующие 8 спрайтов (sprite44 - sprite51)
  animationManager.addAnimation("run", [
    "sprite13",  // 12 - начало шага
    "sprite14",  // 13
    "sprite15",  // 14
    "sprite16",  // 15
    "sprite17",  // 16
    "sprite18",  // 17
    "sprite19",  // 18
    "sprite20",// 19 - завершение шага
  ], 6); // 12 кадров в секунду - быстрая анимация ходьбы

  // Анимация прыжка (jump) - используем последние 2 спрайта (sprite52 - sprite53)
  animationManager.addAnimation("jump", [
    "sprite2",  // 20 - прыжок вверх
    "sprite3"   // 21 - падение/приземление
  ], 10, false); // 10 кадров в секунду, не зациклена
}

  play() {
    this.timer = setInterval(() => {
      try {
        this.update();
      } catch (e) {
        console.log(e);
      }
    }, 1);
  }
}
