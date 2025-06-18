export class ScrollBar extends Phaser.GameObjects.Container {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x - X position of the scrollbar
     * @param {number} y - Y position of the scrollbar
     * @param {number} height - Height of the scrollbar
     * @param {number} trackWidth - Width of the scrollbar track
     * @param {number} thumbHeight - Height of the draggable thumb
     */
    constructor(scene, x, y, height, trackWidth = 16, thumbHeight = 40) {
        super(scene, x, y);

        this.trackWidth = trackWidth;
        this.height = height;
        this.thumbHeight = thumbHeight;

        // Draw track
        this.track = scene.add.rectangle(0, 0, trackWidth, height, 0x888888, 0.5)
            .setOrigin(0, 0)
            .setInteractive();
        this.add(this.track);

        // Draw thumb
        this.thumb = scene.add.rectangle(0, 0, trackWidth, thumbHeight, 0xffffff, 1)
            .setOrigin(0, 0)
            .setInteractive({ draggable: true });
        this.add(this.thumb);

        // Enable dragging
        scene.input.setDraggable(this.thumb);

        // Drag logic
        this.thumb.on('drag', (pointer, dragX, dragY) => {
            // Clamp thumb position
            dragY = Phaser.Math.Clamp(dragY, 0, height - thumbHeight);
            this.thumb.y = dragY;
            // Emit scroll event with normalized value (0-1)
            this.emit('scroll', dragY / (height - thumbHeight));
        });

        // Optional: click on track to move thumb
        this.track.on('pointerdown', (pointer) => {
            let localY = pointer.y - this.y;
            let thumbY = Phaser.Math.Clamp(localY - thumbHeight / 2, 0, height - thumbHeight);
            this.thumb.y = thumbY;
            this.emit('scroll', thumbY / (height - thumbHeight));
        });

        // Add to scene
        scene.add.existing(this);
    }

    /**
     * Set the scroll position (0-1)
     */
    setScroll(value) {
        value = Phaser.Math.Clamp(value, 0, 1);
        this.thumb.y = value * (this.height - this.thumbHeight);
    }

    /**
     * Get the current scroll position (0-1)
     */
    getScroll() {
        return this.thumb.y / (this.height - this.thumbHeight);
    }
}
