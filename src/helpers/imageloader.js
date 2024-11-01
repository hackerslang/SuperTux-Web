import { imagesData } from '../../assets/data/images.js';

export class ImageLoader {
    constructor(config) {
        this.scene = config.scene;
        this.imagesData = imagesData;
    }

    loadImagesFromData(key) {
        var entity = this.imagesData.images[key];
        var path = "";
        var sprites = entity.sprites;
        var spritesheets = entity.spritesheets;

        if (entity.path != null) {
            path = entity.path;
        }

        if (sprites != null) {
            sprites.forEach(sprite => this.loadImageFromData(path, sprite));
        }

        if (spritesheets != null) {
            spritesheets.forEach(spritesheet => this.loadSpritesheetFromData(path, spritesheet));
        }
    }

    loadImageFromData(path, spriteObject) {
        if (!spriteObject.hasOwnProperty("end")) {
            this.loadImage(spriteObject.name, path + spriteObject.value, "png");
        } else {
            for (var i = spriteObject.start; i <= spriteObject.end; i++) {
                this.loadImage(spriteObject.name + i, path + spriteObject.value + i, "png");
            }
        }
    }

    loadImage(caption, path, ext) {
        this.scene.load.image(caption, path + '.' + ext);
    }

    loadSpritesheetFromData(path, spritesheet) {
        this.loadSpriteSheet(spritesheet.name, path + spritesheet.value, spritesheet.frameWidth, spritesheet.frameHeight, spritesheet.number);
    }

    loadSpriteSheet(caption, path, frameWidth, frameHeight, n) {
        this.scene.load.spritesheet({
            key: caption,
            url: path + '.png',
            frameConfig: {
                frameWidth: frameWidth,
                frameHeight: frameHeight,
                startFrame: 0,
                endFrame: n
            }
        });
    }

    loadMultipleImages(caption, path, ext, start, end) {
        for (var i = start; i < end + 1; i++) {
            this.loadImage(caption + i, path + i, ext);
        }
    }
}
