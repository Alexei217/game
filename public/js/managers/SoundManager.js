class SoundManager {
  clips = {};
  context = null;
  gainNode = null;
  loaded = false;

  init() {
    this.context = new AudioContext();
    this.gainNode = this.context.createGain
      ? this.context.createGain()
      : this.context.createGainNode();
    this.gainNode.connect(this.context.destination);
  }

  load(path, callback) {
    if (this.clips[path]) {
      callback(this.clips[path]);
      return;
    }
    var clip = { path: path, buffer: null, loaded: false };
    clip.play = (function (volume, loop) {
      this.play(clip.path, {
        looping: loop ? loop : false,
        volume: volume ? volume : 1,
      });
    }).bind(this);
    this.clips[path] = clip;
    var request = new XMLHttpRequest();
    request.open("GET", path, true);
    request.responseType = "arraybuffer";
    request.onload = function () {
      this.context.decodeAudioData(request.response, function (buffer) {
        clip.buffer = buffer;
        clip.loaded = true;
        callback(clip);
      });
    }.bind(this);
    request.send();
  }

  loadArray(array) {
    for (var i = 0; i < array.length; i++) {
      this.load(array[i], (function () {
        if (array.length === Object.keys(this.clips).length) {
          for (let sd in this.clips) if (!this.clips[sd].loaded) return;
          this.loaded = true;
        }
      }).bind(this));
    }
  }
  
  play(path, settings) {
    if (!this.loaded) {
      setTimeout(
        function () {
          this.play(path, settings);
        }.bind(this),
        1000
      );
      return;
    }
    var looping = false;
    var volume = 1;
    if (settings) {
      if (settings.looping) looping = settings.looping;
      if (settings.volume) volume = settings.volume;
    }
    var sd = this.clips[path];
    if (sd === null) return false;
    var sound = this.context.createBufferSource();
    sound.buffer = sd.buffer;
    sound.connect(this.gainNode);
    sound.loop = looping;
    this.gainNode.gain.value = volume;
    sound.start(0);

    return true;
  }

  playWorldSound(path, x, y) {
    if (gameManager.player === null) return;
    var viewSize = Math.max(mapManager.view.w, mapManager.view.h) * 0.8;
    var dx = Math.abs(gameManager.player.pos_x - x);
    var dy = Math.abs(gameManager.player.pos_y - y);
    var distance = Math.sqrt(dx * dx + dy * dy);
    var norm = distance / viewSize;
    console.log(norm);
    if (norm > 1) norm = 1;
    var volume = 1.0 - norm;
    if (!volume) return;
    this.play(path, { looping: false, volume: volume });
  }

  toggleMute() {
    if (this.gainNode.gain.value > 0) this.gainNode.gain.value = 0;
    else this.gainNode.gain.value = 1;
  }

  stopAll() {
    this.gainNode.disconnect();
    this.gainNode = this.context.createGainNode(0);
    this.gainNode.connect(this.context.destination);
  }
}
