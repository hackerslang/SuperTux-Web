var animationsData = {
    "animations": {
        "antarctic-water": {
            "animations": [
                {
                    key: 'antarctic-water',
                    caption: 'antarctic-water-',
                    start: 1,
                    end: 8,
                    frameRate: 5,
                    repeat: -1
                }
            ]
        },
        "tux": {
            "animations": [
                {
                    key: 'tux-duck',
                    frames: [{ key: 'tux-duck-0' }],
                    frameRate: 24
                },
                {
                    key: "tux-gameover",
                    caption: 'tux-gameover-',
                    start: 1,
                    end: 2,
                    frameRate: 8,
                    repeat: -1
                },
                {
                    key: 'tux-idle',
                    caption: 'tux-idle-',
                    start: 1,
                    end: 2,
                    frameRate: 24,
                    repeat: -1
                },
                {
                    key: 'tux-jump',
                    frames: [{ key: 'tux-jump-0' }],
                    frameRate: 24
                },
                {
                    key: 'tux-run',
                    caption: 'tux-run-',
                    start: 0,
                    end: 5,
                    frameRate: 12,
                    repeat: -1
                },
                {
                    key: 'tux-skid',
                    frames: [{ key: 'tux-skid-0' }],
                    frameRate: 24
                },
                {
                    key: 'tux-stand',
                    frames: [{ key: 'tux-stand-0' }],
                    frameRate: 24
                }
            ]
        },
        "bouncing-snowball": {
            "animations": [
                {
                    key: "bouncing-snowball-left",
                    frames: [
                        { key: 'bouncing-snowball-1' },
                        { key: 'bouncing-snowball-2' },
                        { key: 'bouncing-snowball-3' },
                        { key: 'bouncing-snowball-4' },
                        { key: 'bouncing-snowball-5' },
                        { key: 'bouncing-snowball-6' },
                        { key: 'bouncing-snowball-7' },
                        { key: 'bouncing-snowball-8' },
                        { key: 'bouncing-snowball-8' }
                        //{ key: 'bouncing-snowball-8' }
                        //{ key: 'bouncing-snowball-8' },
                        //{ key: 'bouncing-snowball-8' }
                    ],
                    frameRate: 10,
                    repeat: - 1
                },
                {
                    key: "bouncing-snowball-left2",
                    frames: [
                        { key: 'bouncing-snowball-1' },
                        { key: 'bouncing-snowball-2' },
                        { key: 'bouncing-snowball-3' },
                        { key: 'bouncing-snowball-4' },
                        { key: 'bouncing-snowball-5' },
                        { key: 'bouncing-snowball-6' },
                        { key: 'bouncing-snowball-7' },
                        { key: 'bouncing-snowball-8' },
                        { key: 'bouncing-snowball-8' }
                        //{ key: 'bouncing-snowball-8' }
                        //{ key: 'bouncing-snowball-8' },
                        //{ key: 'bouncing-snowball-8' }
                    ],
                    frameRate: 10,
                    repeat: - 1
                },
                {
                    key: "bouncing-snowball-left-down",
                    frames: [
                        { key: 'bouncing-snowball-8' },
                        { key: 'bouncing-snowball-bounce-1' },
                        { key: 'bouncing-snowball-bounce-2' },
                        { key: 'bouncing-snowball-bounce-3' }
                    ],
                    frameRate: 10,
                    repeat: 1
                },
                {
                    key: "bouncing-snowball-left-up",
                    frames: [
                        { key: 'bouncing-snowball-bounce-3' },
                        { key: 'bouncing-snowball-bounce-2' },
                        { key: 'bouncing-snowball-bounce-1' },
                        { key: 'bouncing-snowball-8' }
                    ],
                    frameRate: 10,
                    repeat: 1
                },
                {
                    key: "bouncing-snowball-squished",
                    frames: [
                        { key: 'bouncing-snowball-squished' }
                    ]
                }
            ]
        },
        "coin": {
            "animations": [
                {
                    key: "coin-moving",
                    spriteSheet: "coin-moving",
                    frameRate: 20,
                    repeat: -1
                }
            ]
        },
        "fish": {
            "animations": [
                {
                    key: "fish-up",
                    caption: 'fish-up-',
                    start: 0,
                    end: 1,
                    frameRate: 8,
                    repeat: -1
                }
            ]
        },
        "flying-snowball": {
            "animations": [
                {
                    key: 'flying-snowball',
                    caption: 'flying-snowball-',
                    start: 0,
                    end: 3
                },
                {
                    key: 'flying-snowball-melting',
                    caption: 'flying-snowball-melting-',
                    start: 0,
                    end: 2
                }
            ]
        },
        "ghoul": {
            "animations": [
                {
                    key: "ghoul",
                    frames: [
                        { key: 'ghoul-2', width: 50, height: 50 },
                        { key: 'ghoul-3', width: 50, height: 50 },
                        { key: 'ghoul-5', width: 50, height: 50 },
                        { key: 'ghoul-5', width: 50, height: 50 },
                        { key: 'ghoul-6', width: 50, height: 50 },
                        { key: 'ghoul-7', width: 50, height: 50 },
                        { key: 'ghoul-7', width: 50, height: 50 },
                        { key: 'ghoul-7', width: 50, height: 50 },
                        { key: 'ghoul-8', width: 50, height: 50 },
                        { key: 'ghoul-1', width: 50, height: 50 },
                        { key: 'ghoul-1', width: 50, height: 50 },
                        { key: 'ghoul-1', width: 50, height: 50 },
                        { key: 'ghoul-1', width: 50, height: 50 },
                        { key: 'ghoul-1', width: 50, height: 50 },
                        { key: 'ghoul-1', width: 50, height: 50 },
                        { key: 'ghoul-1', width: 50, height: 50 },
                        { key: 'ghoul-1', width: 50, height: 50 },
                        { key: 'ghoul-1', width: 50, height: 50 }
                    ],
                    frameRate: 10,
                    repeat: - 1
                }
            ]
        },
        "mr-bomb": {
            "animations": [
                {
                    key: "mrbomb-left",
                    caption: "mrbomb-left-",
                    start: 1,
                    end: 8,
                    frameRate: 10,
                    repeat: -1
                },
                {
                    key: "mrbomb-exploding-left",
                    caption: "mrbomb-exploding-",
                    start: 0,
                    end: 4,
                    frameRate: 10,
                    repeat: -1
                }
            ]
        },
        "mr-iceblock": {
            "animations": [
                {
                    key: "mriceblock-walk",
                    caption: 'mriceblock-walk-',
                    start: 0,
                    end: 7,
                    frameRate: 12,
                    repeat: -1
                },
                {
                    key: 'mriceblock-stomped',
                    frames: [{ key: 'mriceblock-stomped-0' }],
                    frameRate: 24
                }
            ]
        },
        "smoke": {
            "animations": [
                {
                    key: "smoke",
                    frames: [
                        { key: "smoke-1" },
                        { key: "smoke-2" },
                        { key: "smoke-3" },
                        { key: "smoke-4" },
                        { key: "smoke-5" },
                        { key: "smoke-6" }
                    ],
                    frameRate: 10,
                    repeat: -1
                }
            ]
        },
        "snowball": {
            "animations": [
                {
                    key: 'snowball-walk',
                    caption: "snowball-walk-",
                    start: 0,
                    end: 7,
                    frameRate: 12,
                    repeat: -1
                },
                {
                    key: "snowball-squished",
                    frames: [
                        { key: "snowball-squished" }
                    ]
                }
            ]
        },
        "sparkle": {
            "animations": [
                {
                    "key": "sparkle-small",
                    "frames": [
                        { "key": "sparkle-0" },
                        { "key": "sparkle-1" },
                        { "key": "sparkle-0" }
                    ],
                    "frameRate": 10,
                    "repeat": 0
                },
                {
                    "key": "sparkle-medium",
                    "frames": [
                        { "key": "sparkle-0" },
                        { key: "sparkle-1" },
                        { key: "sparkle-0" },
                        { key: "sparkle-1" },
                        { key: "sparkle-0" }
                    ],
                    frameRate: 10,
                    repeat: 0
                },
                {
                    key: "sparkle-dark",
                    frames: [
                        { key: "sparkle-dark-0" },
                        { key: "sparkle-dark-1" },
                        { key: "sparkle-dark-0" }
                    ],
                    frameRate: 10,
                    repeat: 0
                }
            ]
        },
        "star-moving": {
            "animations": [
                {
                    key: 'star-moving',
                    spriteSheet: 'star',
                    frameRate: 20,
                    repeat: -1
                }
            ]
        }
    }
};