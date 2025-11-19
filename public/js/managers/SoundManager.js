class SoundManager {
  constructor() {
    this.clips = {};
    this.context = null;
    this.mainGainNode = null;
    this.loaded = false;
  }

  init() {
    this.context = new AudioContext();
    this.mainGainNode = this.context.createGain
      ? this.context.createGain()
      : this.context.createGainNode();
    this.mainGainNode.connect(this.context.destination);
    this.mainGainNode.gain.value = 1;
  }

  load(path, callback) {
    var clip = { path: path, buffer: null, loaded: false };
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
      this.load(
        array[i],
        function () {
          if (array.length === Object.keys(this.clips).length) {
            for (let sd in this.clips) if (!this.clips[sd].loaded) return;
            this.loaded = true;
          }
        }.bind(this)
      );
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
    var soundGainNode = this.context.createGain
      ? this.context.createGain()
      : this.context.createGainNode();

    sound.buffer = sd.buffer;
    sound.loop = looping;

    sound.connect(soundGainNode);
    soundGainNode.connect(this.mainGainNode);

    soundGainNode.gain.value = volume;
    sound.start(0);

    return {
      stop: function () {
        try {
          sound.stop();
        } catch (e) {}
      },
      setVolume: function (newVolume) {
        soundGainNode.gain.value = newVolume;
      },
      source: sound,
      gainNode: soundGainNode,
    };
  }

  playWorldSound(path, x, y) {
    if (gameManager.player === null) return;
    var viewSize = Math.max(mapManager.view.w, mapManager.view.h) * 0.8;
    var dx = Math.abs(gameManager.player.pos_x - x);
    var dy = Math.abs(gameManager.player.pos_y - y);
    var distance = Math.sqrt(dx * dx + dy * dy);
    var norm = distance / viewSize;
    if (norm > 1) norm = 1;
    var volume = 1.0 - norm;
    if (!volume) return;
    return this.play(path, { looping: false, volume: volume / 5 });
  }

  toggleMute() {
    if (this.mainGainNode.gain.value > 0) this.mainGainNode.gain.value = 0;
    else this.mainGainNode.gain.value = 1;
  }

  stopAll() {
    this.mainGainNode.disconnect();
    this.mainGainNode = this.context.createGainNode(0);
    this.mainGainNode.connect(this.context.destination);
  }
}
