class AnimationLoader {
    constructor(config) {
        this.scene = config.scene;
        this.animationsData = animationsData;
        this.DEFAULT_FRAMERATE = 10;
        this.REPEAT_INFINITELY = -1;
    }

    loadAnimationsFromData(key) {
        var entities = this.animationsData.animations[key];

        entities.animations.forEach(animation => this.loadAnimationFromData(animation));
    }

    loadAnimationFromData(entity) {
        var key = entity.key;
        var frameRate = this.getFrameRateFromDataItem(entity);
        var repeat = this.getRepeatFromDataItem(entity);
        var frames = this.getFramesFromDataItem(entity);

        this.createAnimation(key, frames, frameRate, repeat);
    }

    getFrameRateFromDataItem(entity) {
        var frameRate = this.DEFAULT_FRAMERATE;


        if (entity.frameRate != null) {
            frameRate = entity.frameRate;
        }

        return frameRate;
    }

    getRepeatFromDataItem(entity) {
        var repeat = this.REPEAT_INFINITELY;

        if (entity.repeat != null) {
            repeat = entity.repeat;
        }

        return repeat;
    }

    getFramesFromDataItem(entity) {
        var frames = entity.frames;

        if (entity.spriteSheet != null) {
            frames = this.scene.anims.generateFrameNumbers(entity.spriteSheet);
        } else if (entity.start != null) {
            frames = [];

            for (var i = entity.start; i < entity.end + 1; i++) {
                frames.push({ key: entity.caption + i });
            }
        }
        
        return frames;
    }

    createAnimation(key, frames, frameRate, repeat) {
        this.scene.anims.create(
            {
                key: key,
                frames: frames,
                frameRate: frameRate,
                repeat: repeat
            }
        );
    }
}
