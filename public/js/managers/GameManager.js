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
    soundManager.loadArray(["/audio/1.mp3", "/audio/explode.mp3"]);
    // soundManager.play("/audio/1.mp3", {
    //   volume: 0.5,
    //   looping: true,
    // });
  }

  initAnimations() {
    // Анимация стойки (idle) - используем первые 11 спрайтов (sprite33 - sprite43)
    animationManager.addAnimation(
      "idle",
      [
        "sprite2", // 4
        "sprite3", // 5
        "sprite4", // 6
        "sprite5", // 7
        "sprite6", // 8
        "sprite7", // 9
        "sprite8", // 10
        "sprite9",
        "sprite10", // 11
        "sprite11",
        "sprite12", // 11
      ],
      4
    ); // 8 кадров в секунду - плавная анимация стойки

    // Анимация ходьбы (run) - используем следующие 8 спрайтов (sprite44 - sprite51)
    animationManager.addAnimation(
      "run",
      [
        "sprite13", // 14
        "sprite14", // 15
        "sprite15", // 16
        "sprite16", // 17
        "sprite17", // 18
        "sprite18", // 19 - завершение шага
        "sprite19", // 18
        "sprite20", // 19 - завершение шага
      ],
      6
    ); // 12 кадров в секунду - быстрая анимация ходьбы

    // Анимация прыжка (jump) - используем последние 2 спрайта (sprite52 - sprite53)
    animationManager.addAnimation("jump_up", ["sprite23"], 1, false);

    // Падение вниз
    animationManager.addAnimation("jump_down", ["sprite22"], 1, true);

    // Приземление
    animationManager.addAnimation("land", ["sprite21"], 1, false);
    animationManager.addAnimation(
      "attack",
      [
        "sprite24", // кадр 1 атаки
        "sprite25", // кадр 2 атаки  
        "sprite26"  // кадр 3 атаки
      ],
      10, // скорость анимации атаки
      false // не зацикливать - проигрывается один раз
    );
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
