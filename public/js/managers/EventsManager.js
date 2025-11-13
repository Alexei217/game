class EventsManager {
  bind = [];
  action = [];

  setup(canvas) {
    this.bind[87] = "up";
    this.bind[65] = "left";
    this.bind[83] = "down";
    this.bind[68] = "right";
    this.bind[32] = "fire";
    canvas.addEventListener("mousedown", this.onMouseDown.bind(this));
    canvas.addEventListener("mouseup", this.onMouseUp.bind(this));
    document.body.addEventListener("keydown", this.onKeyDown.bind(this));
    document.body.addEventListener("keyup", this.onKeyUp.bind(this));
  }

  onMouseDown(event) {
    this.action["fire"] = true;
  }

  onMouseUp(event) {
    this.action["fire"] = false;
  }

  onKeyDown(event) {
    var action = this.bind[event.keyCode];
    if (action) this.action[action] = true;
  }

  onKeyUp(event) {
    var action = this.bind[event.keyCode];
    if (action) this.action[action] = false;
  }
}
