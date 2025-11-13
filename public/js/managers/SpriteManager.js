class SpriteManager {
  image = new Image();
  sprites = new Array();
  imgLoaded = false;
  jsonLoaded = false;

  loadAtlas(atlasJson, atlasImg) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = (function () {
      if (request.readyState === 4 && request.status === 200) {
        this.parseAtlas(request.responseText);
      }
    }).bind(this);
    request.open("GET", atlasJson, true);
    request.send();
    this.loadImg(atlasImg);
  }

  loadImg(imgName) {
    this.image.onload = (function () {
      this.imgLoaded = true;
    }).bind(this);
    this.image.src = imgName;
  }

  parseAtlas(atlasJSON) {
    var atlas = JSON.parse(atlasJSON);
    for (var i = 0; i < atlas.length; i++) {
      var spriteData = atlas[i];
      this.sprites.push({
        name: spriteData.name,
        x: spriteData.x,
        y: spriteData.y,
        w: spriteData.width,
        h: spriteData.height,
      });
    }
    this.jsonLoaded = true;
  }

  drawSprite(ctx, name, x, y) {
    if (!this.imgLoaded || !this.jsonLoaded) {
      setTimeout((function () {
        this.drawSprite(ctx, name, x, y);
      }).bind(this), 100);
    } else {
      var sprite = this.getSprite(name);
      if (!mapManager.isVisible(x, y, sprite.w, sprite.h)) return;
      x -= mapManager.view.x;
      y -= mapManager.view.y;
      ctx.drawImage(
        this.image,
        sprite.x,
        sprite.y,
        sprite.w,
        sprite.h,
        x,
        y,
        sprite.w,
        sprite.h
      );
    }
  }

  getSprite(name) {
    for (var i = 0; i < this.sprites.length; i++) {
      var s = this.sprites[i];
      if (s.name === name) return s;
    }
    return null;
  }
}
