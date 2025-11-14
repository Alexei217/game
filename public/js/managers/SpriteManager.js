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

  drawSprite(ctx, name, x, y, flip = false) {
    if (!this.imgLoaded || !this.jsonLoaded) {
      setTimeout((function () {
        this.drawSprite(ctx, name, x, y, flip);
      }).bind(this), 100);
      return;
    }

    var sprite = this.getSprite(name);
    if (!sprite) return;
    
    if (!mapManager.isVisible(x, y, sprite.w, sprite.h)) return;
    
    var screenX = x - mapManager.view.x;
    var screenY = y - mapManager.view.y;

    if (flip) {
      ctx.save();
      ctx.translate(screenX + sprite.w, screenY);
      ctx.scale(-1, 1);
      ctx.drawImage(
        this.image,
        sprite.x, sprite.y, sprite.w, sprite.h,
        0, 0, sprite.w, sprite.h
      );
      ctx.restore();
    } else {
      ctx.drawImage(
        this.image,
        sprite.x, sprite.y, sprite.w, sprite.h,
        screenX, screenY, sprite.w, sprite.h
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
