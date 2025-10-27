import { Entity } from "./Entity.js";
import { spriteManager } from "../SpriteManager.js";
import { physicManager } from "../PhysicManager.js";

export class Player extends Entity {
  constructor() {
    super();
    this.lifetime = 100;
    this.move_x = 0;
    this.move_y = 0;
    this.speed = 1;
  }

  draw(ctx) {
    spriteManager.drawSprite(ctx, "player", this.pos_x, this.pos_y);
  }

  update() {
    physicManager.update(this);
  }
}
