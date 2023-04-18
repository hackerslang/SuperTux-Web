var imagesData = {
    "images": {
        "tux": {
            "path": "./assets/images/creatures/tux/",
            "sprites": [
                {
                  "name": "tux-duck",
                  "value": "duck-0"
                },
                {
                  "name": "tux-skid",
                  "value": "skid-0" 
                },
                {
                  "name": "tux-gameover-1",
                  "value": "gameover-0" 
                },
                {
                  "name": "tux-gameover-2",
                  "value": "gameover-1" 
                },
                {
                  "name": "tux-stand-0",
                  "value": "stand-0" 
                },
                {
                  "name": "tux-idle-1",
                  "value": "idle-0" 
                },
                {
                  "name": "tux-idle-2",
                  "value": "idle-1" 
                },
                {
                  "name": "tux-jump-0",
                  "value": "jump-0"
                },
                {
                    "name": "tux-run-",
                    "value": "walk-",
                    "start": 0,
                    "end": 5
                }
            ]
        },
        "arrow": {
            "path": "./assets/images/level/arrow/",
            "sprites": [
                {
                    "name": "way-arrow-left",
                    "value": "large-arrow-left"
                },
                {
                    "name": "way-arrow-right",
                    "value": "large-arrow-right"
                }
            ]
        },
        "backgrounds": {
            "sprites": [
                {
                    "name": "pile-of-snow",
                    "value": "./assets/images/level/snow/pile-of-snow"
                },
                {
                    "name": "cloud",
                    "value": "./assets/images/doodads/cloud"
                },
                {
                    "name": "grass1",
                    "value": "./assets/images/doodads/grass1"
                },
                {
                    "name": "grass2",
                    "value": "./assets/images/doodads/grass2"
                }
            ]
        },
        "bouncing-snowball": {
            "path": "./assets/images/creatures/bouncing_snowball/",
            "sprites": [
                {
                    "name": "bouncing-snowball-bounce-",
                    "value": "bounce",
                    "start": 1,
                    "end": 3
                },
                {
                    "name": "bouncing-snowball-",
                    "value": "bs",
                    "start": 1,
                    "end": 8
                }
            ]
        },
        "fish": {
            "path": "./assets/images/creatures/fish/",
            "sprites": [
                {
                    "name": "fish-up",
                    "value": "up-",
                    "start": 0,
                    "end": 1
                },
                {
                    "name": "fish-down",
                    "value": "down"
                }
            ]
        },
        "flying-snowball": {
            "path": "./assets/images/creatures/flying_snowball/",
            "sprites": [
                {
                    "name": "flying-snowball-",
                    "value": "left-",
                    "start": 0,
                    "end": 3
                },
                {
                    "name": "flying-snowball-melting-",
                    "value": "melting-",
                    "start": 0,
                    "end": 2
                },
                {
                    "name": "flying-snowball-squished",
                    "value": "squished-left" }
            ]
        },
        "ghoul": {
            "path": "./assets/images/creatures/ghoul/",
            "sprites": [
                {
                    "name": "ghoul-",
                    "value": "g",
                    "start": 1,
                    "end": 8
                },
                {
                    "name": "ghoul-squished",
                    "value": "d1"
                }
            ]
        },
        "jumpy": {
            "path": "./assets/images/creatures/jumpy/",
            "sprites": [
                {
                    "name": "jumpy-down",
                    "value": "left-down"
                },
                {
                    "name": "jumpy-middle",
                    "value": "left-middle"
                },
                {
                    "name": "jumpy-up",
                    "value": "left-up"
                }
            ]
        },
        "krosh": {
            "path": "./assets/images/creatures/krosh/",
            "sprites": [
                {
                    "name": "krosh",
                    "value": "krosh"
                }
            ]
        },
        "mr-bomb": {
            "path": "./assets/images/creatures/mr_bomb/",
            "sprites": [
                {
                    "name": "mrbomb-left-",
                    "value": "bomb",
                    "start": 1,
                    "end": 8
                },
                {
                    "name": "mrbomb-exploding-",
                    "value": "exploding-left-",
                    "start": 0,
                    "end": 4
                }
            ]
        },
        "mr-iceblock": {
            "path": "./assets/images/creatures/mr_iceblock/",
            "sprites": [
                {
                    "name": "mriceblock-walk-",
                    "value": "iceblock-",
                    "start": 0,
                    "end": 7
                },
                {
                    "name": "mriceblock-stomped-0",
                    "value": "stomped-left"
                }
            ]
        },
        "powerup": {
            "path": "./assets/images/powerups/",
            "spritesheets": [
                {
                    "name": "star",
                    "value": "star",
                    "frameWidth": 32,
                    "frameHeight": 32,
                    "number": 8
                }
            ],
            "sprites": [
                {
                    "name": "egg",
                    "value": "egg-shade"
                }
            ]
        },
        "snowball": {
            "path": "./assets/images/creatures/snowball/",
            "sprites": [
                {
                    "name": "snowball-walk-",
                    "value": "snowball-",
                    "start": 0,
                    "end": 7
                },
                {
                    "name": "snowball-squished",
                    "value": "snowball-squished-left"
                }
            ]
        },
        "sparkle": {
            "path": "./assets/images/particles/",
            "sprites": [
                {
                    "name": "sparkle-",
                    "value": "sparkle-",
                    "start": 0,
                    "end": 1
                },
                {
                    "name": "sparkle-dark-",
                    "value": "sparkle-dark-",
                    "start": 0,
                    "end": 1
                }
            ]
        },
        "UI": {
            "path": "./assets/images/ui/",
            "sprites": [
                {
                    "name": "healthbar-100",
                    "value": "healthbar-100"
                },
                {
                    "name": "healthbar-66",
                    "value": "healthbar-66"
                },
                {
                    "name": "healthbar-33",
                    "value": "healthbar-33"
                },
                {
                    "name": "healthbar-0",
                    "value": "healthbar-0"
                },
                {
                    "name": "healthbar-border",
                    "value": "healthbar-border"
                },
                {
                    "name": "coins",
                    "value": "coins"
                },
                {
                    "name": "medium-font-",
                    "value": "fonts/",
                    "start": 0,
                    "end": 9
                }
            ]
        }
    }
};