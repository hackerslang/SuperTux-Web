import { audioData } from '../../assets/data/sounds.js';

export class AudioLoader {
    constructor(config) {
        this.scene = config.scene;
        this.audioData = audioData;
    }

    loadAudioFromData(key) {
        var sounds = {};
        var path = "";
        var self = this;

        ({ sounds, path } = this.getPathAndSoundsFromData(key));

        if (sounds != null) {
            sounds.forEach(sound => self.loadSoundFromData(path, sound));
        }
    }

    getPathAndSoundsFromData(key) {
        var entity = this.audioData.sounds[key];
        var path = "";
        var sounds = entity.sounds;

        if (entity.path != null) {
            path = entity.path;
        }

        return { sounds, path };
    }

    addAudioFromData(key) {

    }

    loadSoundFromData(path, soundObject) {
        this.loadSound(soundObject.name, path + soundObject.value, soundObject.ext);
    }

    loadSound(caption, path, ext) {
        this.scene.load.audio(caption, path + '.' + ext);
    }

    addSoundsFromData(key) {
        var sounds = {};
        var path = "";
        var self = this;

        ({ sounds, path } = this.getPathAndSoundsFromData(key));

        if (sounds != null) {
            sounds.forEach(sound => self.scene.sound.add(sound.name));
        }
    }

    addSoundsFromData(key) {
        var sounds = {};
        var path = "";
        ({ sounds, path } = this.getPathAndSoundsFromData(key));

        if (!sounds) { return; }

        sounds.forEach(sound => {
            const soundKey = sound.name;

            // If already added, skip
            try {
                if (this.scene.sound.get(soundKey)) {
                    return;
                }
            } catch (e) {
                // ignore
            }

            // If audio is already in cache, add now
            if (this.scene.cache && this.scene.cache.audio && this.scene.cache.audio.exists(soundKey)) {
                this.scene.sound.add(soundKey);
                return;
            }

            // Listen for the specific filecomplete event for this audio key
            const fileCompleteEvent = 'filecomplete-audio-' + soundKey;
            const onFileComplete = (key) => {
                try {
                    if (!this.scene.sound.get(soundKey)) {
                        this.scene.sound.add(soundKey);
                    }
                } catch (e) {
                    // swallow
                } finally {
                    this.scene.load.off(fileCompleteEvent, onFileComplete);
                }
            };

            this.scene.load.on(fileCompleteEvent, onFileComplete);

            // Fallback: if loader already finished (but filecomplete did not fire), add on overall complete
            const onLoadComplete = () => {
                try {
                    if (this.scene.cache && this.scene.cache.audio && this.scene.cache.audio.exists(soundKey) && !this.scene.sound.get(soundKey)) {
                        this.scene.sound.add(soundKey);
                    }
                } finally {
                    this.scene.load.off('complete', onLoadComplete);
                    // ensure filecomplete listener removed if it never fired
                    this.scene.load.off(fileCompleteEvent, onFileComplete);
                }
            };
            this.scene.load.on('complete', onLoadComplete);
        });
    }
}