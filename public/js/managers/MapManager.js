class MapManager {
  mapData = null;
  tLayer = new Array();
  xCount = 0;
  yCount = 0;
  tSize = { x: 18, y: 18 };
  mapSize = { x: 20, y: 30 };
  tilesets = new Array();
  imgLoadCount = 0;
  imgLoaded = false;
  jsonLoaded = false;
  view = { x: 0, y: 0, w: 180, h: 180 };

  parseMap(tilesJSON) {
    this.mapData = JSON.parse(tilesJSON);
    this.xCount = this.mapData.width;
    this.yCount = this.mapData.height;
    this.tSize.x = this.mapData.tilewidth;
    this.tSize.y = this.mapData.tileheight;
    this.mapSize.x = this.xCount * this.tSize.x;
    this.mapSize.y = this.yCount * this.tSize.y;

    for (var i = 0; i < this.mapData.tilesets.length; i++) {
      var img = new Image();

      img.onload = (function () {
        this.imgLoadCount++;
        if (this.imgLoadCount === this.mapData.tilesets.length) {
          this.imgLoaded = true;
        }
      }).bind(this);

      img.src = "map/" + this.mapData.tilesets[i].source.split(".")[0] + ".png";

      var t = this.mapData.tilesets[i];
      var ts = {
        firstgid: t.firstgid,
        image: img,
        name: t.name,
        xCount: Math.floor(162 / this.tSize.x), // исправить хардкод
        yCount: Math.floor(162 / this.tSize.y),
      };
      this.tilesets.push(ts);
    }
    this.jsonLoaded = true;
  }

  isVisible(x, y, width, height) {
    if (
      x + width <= this.view.x ||
      y + height <= this.view.y ||
      x >= this.view.x + this.view.w ||
      y >= this.view.y + this.view.h
    )
      return false;
    return true;
  }

  draw(ctx) {
    if (!this.imgLoaded || !this.jsonLoaded) {
      setTimeout((function () {
        this.draw(ctx);
      }).bind(this), 100);
    } else {
      if (this.tLayer.length === 0)
        for (var id = 0; id < this.mapData.layers.length; id++) {
          var layer = this.mapData.layers[id];
          if (layer.type === "tilelayer") {
            this.tLayer.push(layer);
          }
        }
      for (var j = 0; j < this.tLayer.length; j++) {
        for (var i = 0; i < this.tLayer[j].data.length; i++) {
          if (this.tLayer[j].data[i] !== 0) {
            var tile = this.getTile(this.tLayer[j].data[i]);

            var pX = (i % this.xCount) * this.tSize.x;

            var pY = Math.floor(i / this.xCount) * this.tSize.y;

            if (!this.isVisible(pX, pY, this.tSize.x, this.tSize.y)) continue;

            pX -= this.view.x;
            pY -= this.view.y;

            ctx.drawImage(
              tile.img,
              tile.px,
              tile.py,
              this.tSize.x,
              this.tSize.y,
              pX,
              pY,
              this.tSize.x,
              this.tSize.y
            );
          }
        }
      }
    }
  }

  getTile(tileIndex) {
    var tile = {
      img: null,
      px: 0,
      py: 0,
    };
    var tileset = this.getTileset(tileIndex);
    tile.img = tileset.image;
    var id = tileIndex - tileset.firstgid;

    var x = id % tileset.xCount;

    var y = Math.floor(id / tileset.xCount);

    tile.px = x * this.tSize.x;
    tile.py = y * this.tSize.y;
    return tile;
  }

  getTileset(tileIndex) {
    for (var i = this.tilesets.length - 1; i >= 0; i--)
      if (this.tilesets[i].firstgid <= tileIndex) {
        return this.tilesets[i];
      }
    return null;
  }

  parseEntities() {
    if (!this.imgLoaded || !this.jsonLoaded) {
      setTimeout((function () {
        this.parseEntities();
      }).bind(this), 100);
    } else
      for (var j = 0; j < this.mapData.layers.length; j++)
        if (this.mapData.layers[j].type === "objectgroup") {
          var entities = this.mapData.layers[j];
          for (var i = 0; i < entities.objects.length; i++) {
            var e = entities.objects[i];
            try {
              var obj = new gameManager.factory[e.type]();
              obj.name = e.name;
              obj.pos_x = e.x;
              obj.pos_y = e.y;
              obj.size_x = e.width;
              obj.size_y = e.height;
              gameManager.entities.push(obj);
              if (obj.name === "player") gameManager.initPlayer(obj);
            } catch (ex) {
              console.log(
                "Error while creating: [" + e.gid + "] " + e.type + ", " + ex
              );
            }
          }
        }
  }

  getTilesetIdx(x, y) {
    var wX = x;
    var wY = y;
    var idx =
      Math.floor(wY / this.tSize.y) * this.xCount +
      Math.floor(wX / this.tSize.x);
    return this.tLayer[0].data[idx];
  }

  centerAt(x, y) {
    if (x < this.view.w / 2) this.view.x = 0;
    else if (x > this.mapSize.x - this.view.w / 2)
      this.view.x = this.mapSize.x - this.view.w;
    else this.view.x = x - this.view.w / 2;

    if (y < this.view.h / 2) this.view.y = 0;
    else if (y > this.mapSize.y - this.view.h / 2)
      this.view.y = this.mapSize.y - this.view.h;
    else this.view.y = y - this.view.h / 2;
  }

  loadMap(path) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = (function () {
      if (request.readyState === 4 && request.status === 200) {
        this.parseMap(request.responseText);
      }
    }).bind(this);
    request.open("GET", path, true);
    request.send();
  }
}
