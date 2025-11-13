class Entity {
  constructor() {
    this.pos_x = 0;
    this.pos_y = 0;
    this.size_x = 0;
    this.size_y = 0;
    this.vel_x = 0; // горизонтальная скорость
    this.vel_y = 0; // вертикальная скорость
    this.onGround = false; // находится ли на земле
  }
}
