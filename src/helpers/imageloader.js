import { imagesData } from '../../assets/data/images.js';
import { AsyncLock } from '../common/asynclock.js';

export class ImageLoader {
    constructor(config) {
        this.imagesData = imagesData;
        this.alreadyImportedKeys = [];
        this.lock = new AsyncLock();
    }

    loadImagesFromData(key, scene) {
        if (this.alreadyImportedKeys[key] !== undefined && this.alreadyImportedKeys[key]) { return; }

        var entity = this.imagesData.images[key];
        if (!entity) { return; }

        var path = "";
        var sprites = entity.sprites;
        var spritesheets = entity.spritesheets;

        if (entity.path != null) {
            path = entity.path;
        }

        if (sprites != null) {
            sprites.forEach(sprite => this.loadImageFromData(path, sprite, scene));
        }

        if (spritesheets != null) {
            spritesheets.forEach(spritesheet => this.loadSpritesheetFromData(path, spritesheet, scene));
        }

        this.alreadyImportedKeys[key] = true;
    }

    loadImageFromData(path, spriteObject, scene) {
        if (!spriteObject.hasOwnProperty("end")) {
            this.loadImage(spriteObject.name, path + spriteObject.value, "png", scene);
        } else {
            for (var i = spriteObject.start; i <= spriteObject.end; i++) {
                this.loadImage(spriteObject.name + i, path + spriteObject.value + i, "png", scene);
            }
        }
    }

    loadImage(caption, path, ext, scene) {
        scene.load.image(caption, path + '.' + ext);
    }

    loadSpritesheetFromData(path, spritesheet, scene) {
        this.loadSpriteSheet(spritesheet.name, path + spritesheet.value, spritesheet.frameWidth, spritesheet.frameHeight, spritesheet.number, scene);
    }

    loadSpriteSheet(caption, path, frameWidth, frameHeight, n, scene) {
        scene.load.spritesheet({
            key: caption,
            url: path + '.png',
            frameConfig: {
                frameWidth: frameWidth,
                frameHeight: frameHeight,
                startFrame: 0,
                endFrame: (typeof n === 'number' && n > 0) ? (n - 1) : n
            }
        });
    }

    loadMultipleImages(caption, path, ext, start, end, scene) {
        for (var i = start; i < end + 1; i++) {
            this.loadImage(caption + i, path + i, ext, scene);
        }
    }
}
