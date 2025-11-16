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
    this.factory["Diamond"] = Diamond;
    this.factory["Heart"] = Heart;
    this.factory["Door"] = Door;
    this.factory["Key"] = Key;
    mapManager.parseEntities();
    this.initAnimations();
    mapManager.draw(ctx);
    eventsManager.setup(canvas);
    soundManager.init();
    soundManager.loadArray([
      "/audio/hit.mp3",
      "/audio/jump.mp3",
      "/audio/diamond.mp3",
      "/audio/heart.mp3",
      "/audio/door_locked.mp3",
      "/audio/door.mp3",
      "/audio/run1.mp3",
      "/audio/run2.mp3",
      "/audio/run3.mp3", 
      "/audio/run4.mp3",
      "/audio/run5.mp3",
      "/audio/run6.mp3",
      "/audio/run7.mp3",
      "/audio/run8.mp3", 
      "/audio/run9.mp3",
      "/audio/run0.mp3", 
      "/audio/use_door.mp3"
    ]);
    // soundManager.play("/audio/1.mp3", {
    //   volume: 0.5,
    //   looping: true,
    // });
  }

  initAnimations() {
    animationManager.addAnimation(
      "idle",
      [
        "Idle 1",
        "Idle 2",
        "Idle 3",
        "Idle 4",
        "Idle 5",
        "Idle 6",
        "Idle 7",
        "Idle 8",
        "Idle 9",
        "Idle 10",
        "Idle 11",
      ],
      40
    );
    animationManager.addAnimation(
      "run",
      ["Run 1", "Run 2", "Run 3", "Run 4", "Run 5", "Run 6", "Run 7", "Run 8"],
      60
    );
    animationManager.addAnimation("jump_up", ["Jump 1"], 1, false);
    animationManager.addAnimation("jump_down", ["Fall 1"], 1, true);
    animationManager.addAnimation("land", ["Ground 1"], 1, false);
    animationManager.addAnimation(
      "attack",
      ["Attack 1", "Attack 2", "Attack 3"],
      34,
      false
    );

    animationManager.addAnimation(
      "diamond idle",
      [
        "Diamond Idle 1",
        "Diamond Idle 2",
        "Diamond Idle 3",
        "Diamond Idle 4",
        "Diamond Idle 5",
        "Diamond Idle 6",
        "Diamond Idle 7",
        "Diamond Idle 8",
        "Diamond Idle 9",
        "Diamond Idle 10",
      ],
      40
    );

    animationManager.addAnimation(
      "diamond hit",
      ["Diamond Hit 1", "Diamond Hit 2"],
      20,
      false
    );

    animationManager.addAnimation(
      "heart idle",
      [
        "Heart Idle 1",
        "Heart Idle 2",
        "Heart Idle 3",
        "Heart Idle 4",
        "Heart Idle 5",
        "Heart Idle 6",
        "Heart Idle 7",
        "Heart Idle 8",
      ],
      40
    );

    animationManager.addAnimation(
      "heart hit",
      ["Heart Hit 1", "Heart Hit 2"],
      20,
      false
    );

    animationManager.addAnimation(
      "door idle",
      ["Door Idle 1"],
      3, // медленная анимация
      true
    );

    animationManager.addAnimation(
      "door opening",
      [
        "Door Opening 1",
        "Door Opening 2",
        "Door Opening 3",
        "Door Opening 4",
        "Door Opening 5",
      ],
      50, // быстрая анимация открытия
      false // не зацикливать
    );

    animationManager.addAnimation(
      "door closing",
      ["Door Closing 1", "Door Closing 2", "Door Closing 3"],
      70, // быстрая анимация закрытия
      false // не зацикливать
    );

    animationManager.addAnimation(
      "door in",
      [
        "Door In 1",
        "Door In 2",
        "Door In 3",
        "Door In 4",
        "Door In 5",
        "Door In 6",
        "Door In 7",
        "Door In 8",
        "O",
      ],
      30,
      false
    );

    animationManager.addAnimation(
      "key",
      [
        "Key 1",
        "Key 2",
        "Key 3",
        "Key 4",
        "Key 5",
        "Key 6",
        "Key 7",
        "Key 8",
        "Key 9",
        "Key 10",
        "Key 11",
        "Key 12",
      ],
      30
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
