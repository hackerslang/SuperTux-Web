import { animationsData } from '../../assets/data/animations.js';
import { AsyncLock } from '../common/asynclock.js';

var loadedAnimationGroups = [];

export class AnimationLoader {
    constructor(config) {
        this.scene = config.scene;
        this.animationsData = animationsData;
        this.DEFAULT_FRAMERATE = 10;
        this.REPEAT_INFINITELY = -1;
    }

    loadAnimationsFromData(key, scene) {
        if (!loadedAnimationGroups.includes(key)) {
            this.doLoadAnimationsFromData(key, scene);
        }   
    }

    doLoadAnimationsFromData(key, scene) {
        var entity = this.animationsData && this.animationsData.animations ? this.animationsData.animations[key] : null;
        if (!entity || !entity.animations) {
            console.warn('AnimationLoader: no animations found for group:', key);
            return;
        }

        entity.animations.forEach(animation => this.loadAnimationFromData(animation));
        loadedAnimationGroups.push(key);
    }

    loadAnimationFromData(entity) {
        var key = entity.key;
        var frameRate = this.getFrameRateFromDataItem(entity);
        var repeat = this.getRepeatFromDataItem(entity);
        var frames = this.getFramesFromDataItem(entity) || [];

        this.createAnimation(key, frames, frameRate, repeat, entity);
    }

    getFrameRateFromDataItem(entity) {
        var frameRate = this.DEFAULT_FRAMERATE;
        if (entity && entity.frameRate != null) {
            frameRate = entity.frameRate;
        }
        return frameRate;
    }

    getRepeatFromDataItem(entity) {
        var repeat = this.REPEAT_INFINITELY;
        if (entity && entity.repeat != null) {
            repeat = entity.repeat;
        }
        return repeat;
    }

    getFramesFromDataItem(entity) {
        if (!entity) { return []; }

        // If frames are explicitly provided in data, use them directly
        if (entity.frames != null && Array.isArray(entity.frames)) {
            return entity.frames;
        }

        // start/end + caption naming
        if (entity.start != null && entity.end != null) {
            const textureKey = entity.key;
            const caption = entity.caption || '';
            const duration = entity.frameDuration || 100;
            const frames = [];
            for (let i = entity.start; i <= entity.end; i++) {
                frames.push({ key: caption + i });
            }

            return frames;
        }

        // nothing could be built
        console.warn('AnimationLoader: could not generate frames for entity', entity);
        return [];
    }

    createAnimation(key, frames, frameRate, repeat, entity) {
        if (!Array.isArray(frames) || frames.length === 0) {
            // If an entity refers to a spritesheet, try to build frames from that spritesheet.
            if (entity && entity.spriteSheet) {
                const sheetKey = entity.spriteSheet;
                if (this.scene.textures.exists(sheetKey)) {
                    try {
                        const frameNames = this.scene.textures.get(sheetKey).getFrameNames();
                        // Build frames using numeric indices when possible
                        frames = frameNames.map((n, i) => ({ key: sheetKey, frame: isNaN(+n) ? n : i }));
                    } catch (e) {
                        console.warn('AnimationLoader: failed building frames from spritesheet', sheetKey, e);
                    }
                } else {
                    // Defer creation until the spritesheet texture is added — the existing missing-texture logic handles this below.
                    frames = [{ key: sheetKey, frame: 0 }];
                }
            }

            if (!Array.isArray(frames) || frames.length === 0) {
                console.warn(`AnimationLoader: skipping animation '${key}' — no frames`, frames);
                return;
            }
        }

        // Normalize frames: ensure objects and have key/frame
        const normalized = frames.map(f => {
            if (typeof f === 'string' || typeof f === 'number') {
                return { key: f, frame: f };
            }
            return f;
        });

        // Collect unique texture keys used by this animation
        const textureKeys = Array.from(new Set(normalized.map(f => f.key).filter(k => k !== undefined && k !== null)));

        // Find missing textures
        const missing = textureKeys.filter(k => !this.scene.textures.exists(k));
        if (missing.length > 0) {
            // Defer creation until missing textures are added. Register once listeners for each missing key.
            const tryCreate = () => {
                const stillMissing = textureKeys.filter(k => !this.scene.textures.exists(k));
                if (stillMissing.length === 0) {
                    // All textures present — rebuild frames from spritesheet if needed
                    let framesToUse = frames;
                    if (entity && entity.spriteSheet) {
                        try {
                            framesToUse = this.getFramesFromDataItem(entity) || frames;
                        } catch (e) {
                            console.warn('AnimationLoader: failed rebuilding frames for', key, e);
                        }
                    }

                    // Normalize again
                    const normalizedFinal = (framesToUse || []).map(f => {
                        if (typeof f === 'string' || typeof f === 'number') {
                            return { key: f, frame: f };
                        }
                        return f;
                    });

                    try {
                        this.scene.anims.create({
                            key: key,
                            frames: normalizedFinal,
                            frameRate: frameRate,
                            repeat: repeat
                        });
                        // console.log('AnimationLoader: created deferred animation', key);
                    } catch (e) {
                        console.warn('AnimationLoader: failed creating deferred animation', key, e);
                    }
                }
            };

            // Attach a one-time listener for texture additions. If several textures are missing, we'll tryCreate after each add.
            missing.forEach(mk => {
                this.scene.textures.once('add', (addedKey) => {
                    if (addedKey === mk) {
                        tryCreate();
                    }
                });
            });

            return;
        }

        // All textures exist — create immediately
        try {
            this.scene.anims.create({
                key: key,
                frames: normalized,
                frameRate: frameRate,
                repeat: repeat
            });
        } catch (e) {
            console.warn('AnimationLoader: failed creating animation', key, e);
        }
    }
}