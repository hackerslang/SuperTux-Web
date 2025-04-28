export class Event {
    constructor(config) {
        this.scene = config.scene;

    }

    init() {

    }

    register() {
    }
}

export class CameraTrembleScene extends Event {
    constructor(config) {
        super();
        this.init();
    }

    init() {
        // Initialize the camera tremble effect
        this.tremblePattern = [
            { x: 2, y: 0 },
            { x: 1, y: 3 },
            { x: -4, y: 1 },
            { x: 0, y: -2 },
            { x: 3, y: -1 }
        ];
        this.currentTrembleIndex = 0;
    }

    register() {
        // Start the camera tremble effect
        this.scene.time.addEvent({
            delay: 100, // Time in milliseconds between each movement
            callback: this.trembleCamera,
            callbackScope: this,
            loop: true
        });
    }

    trembleCamera() {
        // Get the current tremble offset
        const offset = this.tremblePattern[this.currentTrembleIndex];

        // Apply the offset to the camera
        this.cameras.main.setScroll(offset.x, offset.y);

        // Move to the next offset in the pattern
        this.currentTrembleIndex = (this.currentTrembleIndex + 1) % this.tremblePattern.length;
    }
}

export class EventHandler {

}