import { mapManager } from "./MapManager.js"
import { spriteManager } from "./SpriteManager.js"
import { eventsManager } from "./EventManager.js";
import { Player } from "./entities/Player.js";
import { soundManager } from "./SoundManager.js";


export const gameManager = {
  factory: {},
  entities: [],
  fireNum: 0,
  player: null,
  laterKill: [],

  initPlayer: function (obj) {
    this.player = obj;
  },

  kill: function (obj) {
    this.laterKill.push(obj);
  },

  update: function () {
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
    soundManager.playWorldSound("audio/1.mp3", 0, 0);
    mapManager.draw(ctx);
    mapManager.centerAt(this.player.pos_x, this.player.pos_y);
    this.draw(ctx);
  },

  draw: function (ctx) {
    for (var e = 0; e < this.entities.length; e++) this.entities[e].draw(ctx);
  },

  loadAll: function () {
    mapManager.loadMap("./map.json");
    spriteManager.loadAtlas("sprites.json", "spritesheet.png");
    gameManager.factory["Player"] = Player;
    mapManager.parseEntities();
    mapManager.draw(ctx);
    eventsManager.setup(canvas);
    soundManager.init();
    soundManager.loadArray(["audio/1.mp3"]);
    
  },

  play: function () {
    setInterval(updateWorld, 10);
  },
};


export function updateWorld() {
  gameManager.update();
}

