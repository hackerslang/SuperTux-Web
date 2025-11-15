export class TrembleEffect {
    constructor(config) {
        this.scene = config.scene;
        this.player = config.player;
        this.stepTime = config.stepTime || 100;
        this.trembleDuration = config.duration || 500;
        this.trembleIntensity = config.intensity || 20;
        this.repeat = config.repeat || -1; // -1 for infinite
        this.trembleStepElapsedTime = 0;
        this.isTrembling = false;
        this.waitingTime = config.waitingTime || 0;
        this.targets = config.targets;

        if (!Array.isArray(this.targets)) {
            this.targets = [this.targets];
        }

        // Run after gameobjects and physics have updated so visual offsets don't get overwritten.
        this.scene.events.on('postupdate', this.update, this);

        this.waitTimer = 0;
        this.trembleIndex = 0;
        this.offsetIndex = 0;

        this.waitAfterPrevious = 0;

        // store original display positions for targets as { x, y }
        this.originalDisplayPositions = new Map();
        this.targets.forEach(t => {
            if (typeof t === 'string' && t === 'camera') {
                // camera doesn't need originalDisplayPositions
                return;
            }
            if (t && t.x !== undefined && t.y !== undefined) {
                this.originalDisplayPositions.set(t, { x: t.x, y: t.y });
            }
        });

        // camera follow bookkeeping
        this.camera = this.scene.cameras.main;
        this.cameraSaved = false; // have we captured original camera follow offset/state?
        this.cameraOriginalFollowOffset = { x: 0, y: 0 };
        this.cameraWasFollowing = false;

        this.trembleData = config.trembleData;
    }

    start() {
        this.elapsedTime = 0;
        this.isTrembling = true;

        // ensure we have original display positions captured at start (physics may have moved sprites)
        this.targets.forEach(t => {
            if (typeof t !== 'string' && t && t.x !== undefined && t.y !== undefined) {
                this.originalDisplayPositions.set(t, { x: t.x, y: t.y });
            }
        });

        // reset indices/timers
        this.trembleIndex = 0;
        this.offsetIndex = 0;
        this.trembleStepElapsedTime = 0;
        this.waitTimer = this.trembleData.initialWait || 0;

        // capture camera original follow offset/state once at start
        if (this.camera) {
            // followOffset exists even when camera isn't following; capture it
            this.cameraOriginalFollowOffset = {
                x: (this.camera.followOffset && this.camera.followOffset.x) || 0,
                y: (this.camera.followOffset && this.camera.followOffset.y) || 0
            };
            // camera._follow is the internal follow target (may be null). Use it to detect if camera is following.
            this.cameraWasFollowing = !!this.camera._follow;
            this.cameraSaved = true;
        }
    }

    update(time, delta) {
        // signature is (time, delta) because we are listening on postupdate
        if (this.initialWaitHasBegun === undefined || this.initialWaitHasBegun === false) {
            this.waitTimer = this.trembleData.initialWait || 0;
            this.initialWaitHasBegun = true;
        }

        if (this.waitTimer > 0) {
            this.waitTimer -= delta;
            return;
        }

        this.currentTremble = this.trembleData.trembles[this.trembleIndex];
        this.trembleStepElapsedTime += delta;

        const offsets = (this.currentTremble && this.currentTremble.offsets) ? this.currentTremble.offsets : [];
        if (offsets.length === 0) {
            this.trembleStepElapsedTime = 0;
            return;
        }

        // current offset object can carry duration (pause) in ms
        const currentOffset = offsets[this.offsetIndex % offsets.length];

        if (this.trembleStepElapsedTime >= this.waitAfterPrevious) {
            this.player.setUnControllable(true);

            // Apply the effect for this offset (camera shake + optional visual offset for player)
            for (var i = 0; i < this.targets.length; i++) {
                var target = this.targets[i];

                const currentOffsetX = (currentOffset.x * -1 || 0) * (this.trembleIntensity / 1);
                const currentOffsetY = (currentOffset.y * -1 || 0) * (this.trembleIntensity / 1);

                if (target === "camera") {
                    this.camera.setFollowOffset(currentOffsetX, currentOffsetY);

                    this.waitAfterPrevious = this.offsetIndex < offsets.length - 1 ? currentOffset.duration : this.trembleData.waitBetween;
                } else {
                    // visual bounce applied to sprite (player)
                    var creature = (target === "player") ? this.player : target;
                    if (!creature) { continue; }

                    const orig = this.originalDisplayPositions.get(creature) || { x: creature.x, y: creature.y };
                    // apply pixel offsets directly (these are visual only; physics body remains unchanged)

                    if (creature.onGround()) {
                        creature.body.velocity.x += currentOffsetX;

                        if (currentOffsetY < 0) {
                            // only apply upward velocity if on ground to avoid floaty effect
                            creature.body.velocity.y += currentOffsetY * 3;
                        }
                    }
                }
            }

            // advance index and reset step timer
            this.offsetIndex++;
            this.trembleStepElapsedTime = 0;

            // if we've finished the offsets in this tremble sequence
            if (this.offsetIndex >= offsets.length) {
                this.offsetIndex = 0;
                this.trembleIndex++;

                if (this.trembleIndex >= this.trembleData.trembles.length) {
                    if (this.repeat === -1) {
                        this.trembleIndex = 0;
                    } 

                    this.player.setUnControllable(false);
                }
            }
        }
    }
}

export class StompEffect extends TrembleEffect {
    constructor(config) {
        super(config);
        this.stompIntensity = config.intensity || 5;
        this.bounceFactor = config.bounceFactor || 0.7;
        this.reboundPause = config.reboundPause || 80; // base pause for main bounce
        this.waitBetween = config.waitBetween || 5000;
        this.init();
        this.start();
    }

    init() {
        // Build a stomp tremble sequence on the fly with per-offset durations.
        // Pattern: big down (longer pause / stronger camera shake), quick settle, smaller up, settle, smaller down, ...
        const offsets = [];
        let amplitude = Math.abs(this.stompIntensity);
        let direction = 1; // 1 => down, -1 => up
        let step = 0;

        while (/*amplitude >= 0.5 &&*/ step < 32) {
            // main bounce step: larger amplitude and longer pause (makes camera shake)
            offsets.push({
                x: 0,
                y: -direction * amplitude,
                duration: Math.round(this.reboundPause * (0.9 + (amplitude / Math.max(1, this.stompIntensity))))
            });
            
            // reduce amplitude and invert direction for next bounce
            amplitude = amplitude * this.bounceFactor;
            direction = -direction;
            step += 2;
        }

        // final settle ensure zero offset remains for one short frame
        offsets.push({ x: 0, y: 0, duration: 40 });

        this.trembleData = {
            key: this.key || 'stomp-effect',
            initialWait: 0,
            waitBetween: this.waitBetween,
            trembles: [
                {
                    offsets: offsets
                }
            ]
        };
    }
}