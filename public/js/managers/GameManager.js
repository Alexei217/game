class GameManager {
  constructor() {
    this.factory = {};
    this.entities = [];
    this.player = null;
    this.laterKill = [];
    this.currentLevel = null;
    this.gameStarted = false;
    this.score = 0;
    this.sound = null;

    this.startMenu = document.getElementById("startMenu");
    this.secondLevelMenu = document.getElementById("secondLevelMenu");
    this.pause = document.getElementById("pause");
    this.finishMenu = document.getElementById("finishMenu");
    this.leaderboard = document.getElementById("leaderboard");
  }

  initPlayer(obj) {
    this.player = obj;
  }

  kill(obj) {
    this.laterKill.push(obj);
  }

  update() {
    if (this.player === null || !this.gameStarted) return;

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

    if (this.player) {
      mapManager.centerAt(this.player.pos_x, this.player.pos_y);
      mapManager.draw(ctx);
      this.draw(ctx);
    }
  }

  draw(ctx) {
    for (var e = 0; e < this.entities.length; e++) this.entities[e].draw(ctx);
  }

  resetGame() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.entities = [];
    this.player = null;
    this.laterKill = [];
  }

  loadLevel(levelMap) {
    this.resetGame();
    this.currentLevel = levelMap;

    mapManager.loadMap("/map/" + levelMap);
    mapManager.parseEntities();

    if (levelMap == "map1.json") {
      this.updateScoreDisplay();
    } else {
      this.updateScoreDisplay(this.score);
    }
    this.updateHpDisplay(3);

    this.startMenu.style.display = "none";
    this.secondLevelMenu.style.display = "none";
    this.pause.style.display = "none";
    this.finishMenu.style.display = "none";
    this.leaderboard.style.display = "none";

    this.showGame();
  }

  loadAll() {
    spriteManager.loadAtlas("/atlas/sprites.json", "/atlas/spritesheet.png");

    this.factory["Player"] = Player;
    this.factory["Enemy"] = Enemy;
    this.factory["Diamond"] = Diamond;
    this.factory["Heart"] = Heart;
    this.factory["Door"] = Door;
    this.factory["Key"] = Key;
    this.factory["RedBoost"] = RedBoost;
    this.factory["BlueBoost"] = BlueBoost;

    this.initAnimations();
    eventsManager.setup(canvas);
    soundManager.init();
    soundManager.loadArray([
      "/audio/hit.mp3",
      "/audio/jump.mp3",
      "/audio/pain.mp3",
      "/audio/die.mp3",
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
      "/audio/use_door.mp3",
      "/audio/key.mp3",
      "/audio/pig_attack.mp3",
      "/audio/pig_pain.mp3",
      "/audio/pig_die.mp3",
      "/audio/bottle.mp3",
      "/audio/main.mp3",
      "/audio/button.mp3",
    ]);
    this.sound = soundManager.play("/audio/main.mp3", {
      volume: 0.1,
      looping: true,
    });
    this.setupMenu();
    this.setupLeaderboard();
  }

  setupMenu() {
    const startBtn = document.getElementById("startBtn");
    const secondLevelBtn = document.getElementById("secondLevelBtn");
    const restartBtn = document.getElementById("restartBtn");
    const toStartMenuBtns = document.querySelectorAll(".to-start-menu-btn");
    const saveScoreBtn = document.getElementById("saveScoreBtn");
    const soundBtns = document.querySelectorAll(".sound-btn");

    startBtn.addEventListener("click", (e) => {
      this.loadLevel("map1.json");
      this.play();
      soundManager.play("/audio/button.mp3", {
        volume: 0.1,
        looping: false,
      });
    });

    secondLevelBtn.addEventListener("click", (e) => {
      this.loadLevel("map2.json");
      this.play();
      soundManager.play("/audio/button.mp3", {
        volume: 0.1,
        looping: false,
      });
    });

    restartBtn.addEventListener("click", (e) => {
      const levelMap = gameManager.currentLevel;
      this.loadLevel(levelMap);
      this.play();
      soundManager.play("/audio/button.mp3", {
        volume: 0.1,
        looping: false,
      });
    });

    toStartMenuBtns.forEach((button) => {
      button.addEventListener("click", (e) => {
        this.showStartMenu();
        soundManager.play("/audio/button.mp3", {
          volume: 0.1,
          looping: false,
        });
      });
    });

    saveScoreBtn.addEventListener("click", () => {
      this.saveScore();
      this.showLeaderboard();
      soundManager.play("/audio/button.mp3", {
        volume: 0.1,
        looping: false,
      });
    });

    soundBtns.forEach((button) => {
      button.addEventListener("click", (e) => {
        soundManager.toggleMute();
        soundManager.play("/audio/button.mp3", {
          volume: 0.1,
          looping: false,
        });
      });
    });
  }

  showStartMenu() {
    this.secondLevelMenu.style.display = "none";
    this.pause.style.display = "none";
    this.finishMenu.style.display = "none";
    this.leaderboard.style.display = "none";
    this.hideGame();

    this.startMenu.style.display = "block";
  }

  showSecondLevelMenu() {
    this.startMenu.style.display = "none";
    this.pause.style.display = "none";
    this.finishMenu.style.display = "none";
    this.leaderboard.style.display = "none";
    this.hideGame();

    this.secondLevelMenu.style.display = "block";
  }

  showPause() {
    if (this.player) {
      if (this.gameStarted) {
        this.gameStarted = false;
        this.pause.style.display = "block";
      } else {
        this.gameStarted = true;
        this.pause.style.display = "none";
      }
      soundManager.play("/audio/button.mp3", {
        volume: 0.1,
        looping: false,
      });
    }
  }

  showFinishMenu() {
    this.startMenu.style.display = "none";
    this.pause.style.display = "none";
    this.secondLevelMenu.style.display = "none";
    this.leaderboard.style.display = "none";
    this.hideGame();

    this.finishMenu.style.display = "block";
  }

  showLeaderboard() {
    this.startMenu.style.display = "none";
    this.finishMenu.style.display = "none";
    this.secondLevelMenu.style.display = "none";
    this.pause.style.display = "none";
    this.hideGame();

    this.updateLeaderboardDisplay();
    this.leaderboard.style.display = "block";
  }

  showGame() {
    const scoreDisplay = document.getElementById("scoreDisplay");
    const hpDisplay = document.getElementById("hpDisplay");

    canvas.style.display = "block";
    scoreDisplay.style.display = "block";
    hpDisplay.style.display = "block";

    this.gameStarted = true;
  }

  hideGame() {
    const scoreDisplay = document.getElementById("scoreDisplay");
    const hpDisplay = document.getElementById("hpDisplay");

    canvas.style.display = "none";
    scoreDisplay.style.display = "none";
    hpDisplay.style.display = "none";

    this.gameStarted = false;
  }

  setupLeaderboard() {
    const leaderBoardBtns = document.getElementById("leaderBoardBtn");
    const closeLeaderboardBtn = document.getElementById("closeLeaderboardBtn");
    const clearLeaderboardBtn = document.getElementById("clearLeaderboardBtn");

    leaderBoardBtns.addEventListener("click", () => {
      this.showLeaderboard();
      soundManager.play("/audio/button.mp3", {
        volume: 0.1,
        looping: false,
      });
    });

    closeLeaderboardBtn.addEventListener("click", () => {
      this.showStartMenu();
      soundManager.play("/audio/button.mp3", {
        volume: 0.1,
        looping: false,
      });
    });

    clearLeaderboardBtn.addEventListener("click", () => {
      this.clearLeaderboard();
      soundManager.play("/audio/button.mp3", {
        volume: 0.1,
        looping: false,
      });
    });
  }

  saveScore() {
    const nameInput = document.getElementById("playerNameInput");
    if (nameInput && nameInput.value.trim() !== "") {
      this.playerName = nameInput.value.trim();
    } else {
      this.playerName = "Player";
    }
    const leaderboard = this.getLeaderboard();
    const newEntry = {
      player: this.playerName,
      score: this.score,
      date: new Date().toLocaleDateString("ru-RU"),
    };

    leaderboard.push(newEntry);

    leaderboard.sort((a, b) => b.score - a.score);

    if (leaderboard.length > 10) {
      leaderboard.splice(10);
    }

    localStorage.setItem("kingsHammerLeaderboard", JSON.stringify(leaderboard));
  }

  getLeaderboard() {
    const stored = localStorage.getItem("kingsHammerLeaderboard");
    return stored ? JSON.parse(stored) : [];
  }

  updateLeaderboardDisplay() {
    const leaderboardBody = document.getElementById("leaderboardBody");
    const leaderboard = this.getLeaderboard();

    if (leaderboardBody) {
      leaderboardBody.innerHTML = "";

      if (leaderboard.length === 0) {
        leaderboardBody.innerHTML = `
        <tr>
          <td colspan="4" class="no-records">
            no records
          </td>
        </tr>
        `;
        return;
      }

      leaderboard.forEach((entry, index) => {
        const row = document.createElement("tr");

        let place = index + 1;

        row.innerHTML = `
          <td>${place}</td>
          <td>${entry.player}</td>
          <td>${entry.score}</td>
          <td>${entry.date}</td>
        `;

        leaderboardBody.appendChild(row);
      });
    }
  }

  clearLeaderboard() {
    localStorage.removeItem("kingsHammerLeaderboard");
    this.updateLeaderboardDisplay();
  }

  updateScoreDisplay(score = 0) {
    const scoreDisplay = document.getElementById("scoreDisplay");
    if (scoreDisplay) {
      scoreDisplay.textContent = `Score: ${score}`;
    }
  }

  updateHpDisplay(hp = 0) {
    const hpDisplay = document.getElementById("hpDisplay");
    if (hpDisplay) {
      hpDisplay.textContent = `HP: ${hp}`;
    }
  }

  completeFirstLevel() {
    this.showSecondLevelMenu();
    this.score = this.player.score;
  }

  completeLastLevel() {
    const finalScore = document.getElementById("finalScore");
    this.score += this.player.score;
    if (finalScore) {
      finalScore.textContent = this.score;
    }
    this.showFinishMenu();
  }

  endGame() {
    this.showStartMenu();
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
      120
    );
    animationManager.addAnimation(
      "run",
      ["Run 1", "Run 2", "Run 3", "Run 4", "Run 5", "Run 6", "Run 7", "Run 8"],
      170
    );
    animationManager.addAnimation(
      "die",
      ["Dead 1", "Dead 2", "Dead 3", "Dead 4"],
      100,
      false
    );
    animationManager.addAnimation("jump_up", ["Jump 1"], 1, false);
    animationManager.addAnimation("jump_down", ["Fall 1"], 1, true);
    animationManager.addAnimation("land", ["Ground 1"], 1, false);
    animationManager.addAnimation(
      "attack",
      ["Attack 1", "Attack 2", "Attack 3"],
      120,
      false
    );

    animationManager.addAnimation("damage", ["Hit 1", "Hit 2"], 80, false);

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
      120,
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
      140
    );

    animationManager.addAnimation(
      "diamond hit",
      ["Diamond Hit 1", "Diamond Hit 2"],
      40,
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
      120
    );

    animationManager.addAnimation(
      "heart hit",
      ["Heart Hit 1", "Heart Hit 2"],
      40,
      false
    );

    animationManager.addAnimation("door idle", ["Door Idle 1"], 1, false);

    animationManager.addAnimation(
      "door opening",
      [
        "Door Opening 1",
        "Door Opening 2",
        "Door Opening 3",
        "Door Opening 4",
        "Door Opening 5",
      ],
      200,
      false
    );

    animationManager.addAnimation("door open", ["Door Opening 5"], 1, false);

    animationManager.addAnimation(
      "door closing",
      ["Door Closing 1", "Door Closing 2", "Door Closing 3"],
      150,
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
      120
    );

    animationManager.addAnimation(
      "red boost",
      [
        "Red Boost 1",
        "Red Boost 2",
        "Red Boost 3",
        "Red Boost 4",
        "Red Boost 5",
        "Red Boost 6",
        "Red Boost 7",
      ],
      100
    );

    animationManager.addAnimation(
      "blue boost",
      [
        "Blue Boost 1",
        "Blue Boost 2",
        "Blue Boost 3",
        "Blue Boost 4",
        "Blue Boost 5",
        "Blue Boost 6",
        "Blue Boost 7",
      ],
      100
    );

    animationManager.addAnimation(
      "pig idle",
      [
        "Pig Idle 12",
        "Pig Idle 11",
        "Pig Idle 10",
        "Pig Idle 9",
        "Pig Idle 8",
        "Pig Idle 7",
        "Pig Idle 6",
        "Pig Idle 5",
        "Pig Idle 4",
        "Pig Idle 3",
        "Pig Idle 2",
        "Pig Idle 1",
      ],
      150
    );
    animationManager.addAnimation(
      "pig run",
      [
        "Pig Run 6",
        "Pig Run 5",
        "Pig Run 4",
        "Pig Run 3",
        "Pig Run 2",
        "Pig Run 1",
      ],
      160
    );
    animationManager.addAnimation(
      "pig attack",
      [
        "Pig Attack 5",
        "Pig Attack 4",
        "Pig Attack 3",
        "Pig Attack 2",
        "Pig Attack 1",
      ],
      100,
      false
    );
    animationManager.addAnimation(
      "pig die",
      ["Pig Dead 4", "Pig Dead 3", "Pig Dead 2", "Pig Dead 1"],
      100,
      false
    );
    animationManager.addAnimation(
      "pig damage",
      ["Pig Hit 2", "Pig Hit 1"],
      40,
      false
    );
  }

  play() {
    this.timer = setInterval(() => {
      try {
        this.update();
      } catch (e) {
        console.log(e);
      }
    }, 16);
  }
}
