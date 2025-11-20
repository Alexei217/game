class EventsManager {
  constructor() {
    this.bind = [];
    this.action = [];
  }

  setup(canvas) {
    this.bind[65] = "left";
    this.bind[68] = "right";
    this.bind[87] = "up";
    this.bind[32] = "attack";
    this.bind[69] = "interact";
    document.body.addEventListener("keydown", this.onKeyDown.bind(this));
    document.body.addEventListener("keyup", this.onKeyUp.bind(this));
    document.addEventListener('keydown', this.onGlobalKeyDown.bind(this));
  }

  onKeyDown(event) {
    var action = this.bind[event.keyCode];
    if (action) this.action[action] = true;
  }

  onKeyUp(event) {
    var action = this.bind[event.keyCode];
    if (action) this.action[action] = false;
  }

  onGlobalKeyDown(event) {
    if (event.key === 'Escape') {
      gameManager.showPause();
    }
  }
}
