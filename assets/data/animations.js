export var animationsData = {
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
                    caption: 'tux-duck-',
                    start: 0,
                    end: 4,
                    frameRate: 60,
                    repeat: 0
                },
                {
                    key: 'tux-climb-hang',
                    frames: [{ key: 'tux-climb-0' }],
                    frameRate: 24
                },
                {
                    key: 'tux-climb',
                    caption: 'tux-climb-',
                    start: 0,
                    end: 7,
                },
                {
                    key: "tux-fall",
                    frames: [{ key: 'tux-jump-2' }],
                    frameRate: 24
                },
                {
                    key: "tux-gameover",
                    caption: 'tux-gameover-',
                    start: 0,
                    end: 3,
                    frameRate: 8,
                    repeat: -1
                },
                {
                    key: 'tux-idle',
                    caption: 'tux-idle-',
                    start: 1,
                    end: 2,
                    frameRate: 24,
                    repeat: 0
                },
                {
                    key: 'tux-jump',
                    caption: 'tux-jump-',
                    start: 0,
                    end: 2,
                    frameRate: 24,
                    repeat: 0
                },
                {
                    key: 'tux-pushback-hurt',
                    frames: [{ key: 'tux-jump-7' }],
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
                    key: 'tux-kick',
                    caption: 'tux-kick-',
                    start: 0,
                    end: 5,
                    frameRate: 12,
                    repeat: 0
                },
                {
                    key: 'tux-stand',
                    frames: [{ key: 'tux-stand-0' }],
                    frameRate: 24
                },
                {
                    key: 'tux-walk',
                    caption: 'tux-walk-',
                    start: 0,
                    end: 7,
                    frameRate: 12,
                    repeat: -1
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
        "captain-snowball": {
            "animations": [
                {
                    key: "captain-snowball-walk",
                    caption: "captain-snowball-walk-",
                    start: 0,
                    end: 7
                },
                {
                    key: "captain-snowball-jump",
                    caption: "captain-snowball-jump-",
                    start: 0,
                    end: 3
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
        "lava": {
            "animations": [
                {
                    key: "lava-flow",
                    caption: "lava-",
                    start: 1,
                    end: 8,
                    frameRate: 8,
                    repeat: -1
                }
            ]
        },
        "lava-fish": {
            "animations": [
                {
                    key: "lava-fish-open-closed",
                    frames: [
                        { key: "lava-fish-closed-mouth" },
                        { key: "lava-fish-open-mouth" }
                    ]
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
                },
                {
                    key: "flying-snowball-squished",
                    frames: [
                        { key: "flying-snowball-squished" }
                    ]
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
        "spiky": {
            "animations": [
                {
                    key: "spiky-sleep",
                    frames: [
                        { key: "spiky-sleep-0" }
                    ]
                },
                {
                    key: "spiky-wakeup",
                    frames: [
                        { key: "spiky-sleep-1" },
                        { key: "spiky-sleep-2" },
                        { key: "spiky-sleep-3" }
                    ],
                    frameRate: 10,
                    repeat: 0
                },
                {
                    key: "spiky-walk",
                    caption: "spiky-walk-",
                    start: 0,
                    end: 7,
                    frameRate: 12,
                    repeat: -1
                },
                {
                    key: "hellspiky-walk",
                    caption: "hellspiky-walk-",
                    start: 0,
                    end: 7,
                    frameRate: 12,
                    repeat: -1
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
        },
        "plus-flickering": {
            "animations": [
                {
                    key: "plus-flickering",
                    frames: [
                        { key: "plus-1" },
                        { key: "plus-1" },
                        { key: "plus-1" },
                        { key: "plus-2" }
                    ]
                }
            ]
        }
    }
};