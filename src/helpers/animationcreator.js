class AnimationCreator {
    constructor(config) {
        this.scene = config.scene;

        AnimationCreator.instance = this;
    }

    static getInstance(config) {
        if (!AnimationCreator.instance) {
            AnimationCreator.instance = new AnimationCreator(config);
        }
        return AnimationCreator.instance;
    }

    createAnimation(config) {
        var animationFrames = [];

        if (config.frames != null && config.frames.length > 0) {
            animationFrames = config.frames;
        } else if (config.framesConfig != null) {
            animationFrames = this.listFrames(config.framesConfig);
        }

        this.scene.anims.create(
            {
                key: config.key,
                frames: animationFrames,
                frameRate: config.frameRate,
                repeat: config.repeat
            }
        );
    }

    listFrames(framesConfig) {
        var caption = framesConfig.caption;
        var start = framesConfig.start;
        var end = framesConfig.end;
        var frames = [];

        for (var i = start; i < end + 1; i++) {
            frames.push({ key: caption + i });
        }

        return frames;
    }
}
