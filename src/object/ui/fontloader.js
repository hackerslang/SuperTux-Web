export var fontsData = {
    "fonts": {
        "SuperTuxSmallFont": {
            "name": "SuperTuxSmallWhite",
            "path": "./assets/images/ui/fonts/supertux-small-white.png",
            "glyphChars": " !\"\#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~  ¡¢£¤¥¦§¨©ª«¬ ®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨĩĪīĬĭĮįİıĲĳĴĵĶķĸĹĺĻļĽľĿŀŁłŃńŅņŇňŉŊŋŌōŎŏŐőŒœŔŕŖŗŘřŚśŜŝŞşŠšŢţŤťŦŧŨũŪūŬŭŮůŰűŲųŴŵŶŷŸŹźŻżŽžſ…ắầặảạếệẻịỉốộồơớởợụủưựửứừữọấểềỏậ",
            "glyphWidth": 11,
            "glyphHeight": 12,
            "glyphPaddingX": 0,
            "glyphPaddingY": 0,
            "glyphBorder": 0
        },
        "SuperTuxBigFont": {
            "name": "SuperTuxBigWhite",
            "path": "./assets/images/ui/fonts/supertux-big-white.png",
            "glyphChars": " !\"\#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~  ¡¢£¤¥¦§¨©ª«¬ ®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨĩĪīĬĭĮįİıĲĳĴĵĶķĸĹĺĻļĽľĿŀŁłŃńŅņŇňŉŊŋŌōŎŏŐőŒœŔŕŖŗŘřŚśŜŝŞşŠšŢţŤťŦŧŨũŪūŬŭŮůŰűŲųŴŵŶŷŸŹźŻżŽžſ…ắầặảạếệẻịỉốộồơớởợụủưựửứừữọấểềỏậ",
            "glyphWidth": 22,
            "glyphHeight": 24,
            "glyphPaddingX": 3,
            "glyphPaddingY": 0,
            "glyphBorder": 0,
            "glyphExceptions": [
                {
                    "key": "e",
                    "paddingLeft": 2,
                    "paddingRight": 0
                },
                {
                    "key": "i",
                    "paddingLeft": 3,
                    "paddingRight": 0
                },
                {
                    "key": "l",
                    "paddingLeft": 3,
                    "paddingRight": 0
                },
                {
                    "key": "t",
                    "paddingLeft": 2,
                    "paddingRight": 0
                }
            ]
        },
        "SuperTuxBigFontColored": {
            "name": "SuperTuxBigWhiteColored",
            "path": "./assets/images/ui/fonts/supertux-big-white-colored.png",
            "glyphChars": " !\"\#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~  ¡¢£¤¥¦§¨©ª«¬ ®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨĩĪīĬĭĮįİıĲĳĴĵĶķĸĹĺĻļĽľĿŀŁłŃńŅņŇňŉŊŋŌōŎŏŐőŒœŔŕŖŗŘřŚśŜŝŞşŠšŢţŤťŦŧŨũŪūŬŭŮůŰűŲųŴŵŶŷŸŹźŻżŽžſ…ắầặảạếệẻịỉốộồơớởợụủưựửứừữọấểềỏậ",
            "glyphWidth": 22,
            "glyphHeight": 24,
            "glyphPaddingX": 3,
            "glyphPaddingY": 0,
            "glyphBorder": 0,
            "glyphExceptions": [
                {
                    "key": "e",
                    "paddingLeft": 2,
                    "paddingRight": 0
                },
                { 
                    "key": "i",
                    "paddingLeft": 3,
                    "paddingRight": 0
                },
                {
                    "key": "l",
                    "paddingLeft": 3,
                    "paddingRight": 0
                },
                {
                    "key": "t",
                    "paddingLeft": 2,
                    "paddingRight": 0
                }
            ]
        }
    }
};

export class FontLoader {
    loadFont(scene, fontName, fade, fadeFactor) {
        var font = fontsData.fonts[fontName];
        var endChar = font.glyphChars.length - 1;
        
        scene.load.spritesheet({ key: font.name, url: font.path, frameConfig: { frameWidth: font.glyphWidth, frameHeight: font.glyphHeight } });
    }

    preCalculateTextDimensions(config) {
        var fontName = config.fontName;
        var text = config.text;
        var scale = 1;

        if (config.scale != null) {
            scale = config.scale;
        }

        var font = fontsData.fonts[fontName];
        var textWidth = 0;
        var textHeight = 0;
        var charX = 0;
        var charY = 0;

        for (var i = 0; i < text.length; i++) {
            var char = text[i];

            if (char == "\n") {
                charX = 0;
                charY += font.glyphHeight * scale;

                continue;
            } else if (char == " ") {
                charX += font.glyphWidth * scale;

                continue;
            }

            var realCharWidth = this.getRealCharWidth(font, char);

            charX += realCharWidth * scale;

            if (charX > textWidth) {
                textWidth = charX;
            }
        }

        return { "totalWidth": textWidth, "totalHeight": textHeight };
    }



    displayText(config) {
        var scene = config.scene;
        var fontName = config.fontName;
        var x = config.x;
        var y = config.y;
        var text = config.text;
        var fade = config.fade;
        var fadeFactor = config.fadeFactor;

        var scale = 1;

        if (config.scale != null) {
            scale = config.scale;
        }

        var characters = [];
        var font = fontsData.fonts[fontName];
        var charX = x;
        var charY = y;
        var textWidth = 0;

        if (fade == null) {
            fade = false;
        }

        if (fadeFactor = null) {
            fadeFactor = 1;
        }

        for (var i = 0; i < text.length; i++) {
            var char = text[i];

            if (char == "\n") {
                charX = x;
                charY += font.glyphHeight * scale;

                continue;
            } else if (char == " ") {
                charX += font.glyphWidth * scale;

                continue;
            }

            var n = font.glyphChars.indexOf(char);
            
            var realCharWidth = this.getRealCharWidth(font, char);
            var glyphException = this.getGlyphException(font, char);
            var glyphPaddingLeft = glyphException == null ? 0 : glyphException.paddingLeft * scale;
            var glyphPaddingRight = glyphException == null ? 0 : glyphException.paddingRight * scale;
            var charImage = scene.add.sprite(charX - glyphPaddingLeft, charY, font.name, n);
            charImage.scale = scale;
            //charImage = charImage.setCrop(glyphPaddingLeft, font.glyphPaddingY, font.glyphWidth - glyphPaddingRight - glyphPaddingLeft, font.glyphHeight - (font.glyphPaddingY * 2));
            scene.add.existing(charImage);
            charImage.key = "char-" + i;

            charImage.scrollFactorX = 0;
            charImage.scrollFactorY = 0;

            characters.push(charImage);

            charX += realCharWidth * scale;

            var currentTextWidth = charX - x;

            if (currentTextWidth > textWidth) {
                textWidth = currentTextWidth;
            }
        }

        return new FontText({ characters: characters, fade: fade, fadeFactor: fadeFactor, totalWidth: textWidth, totalHeight: charY + font.glyphHeight - y });
    }

    displayTextAlignRight(config) {
        var textWidth = this.preCalculateTextDimensions(config).totalWidth;

        config.x -= textWidth;

        return this.displayText(config);
    }

    displayTextAlignBottom(config) {
        var textHeight = this.preCalculateTextDimensions(config).totalHeight;

        config.y -= textHeight;

        return this.displayText(config);
    }

    displayTextAlignBottomRight(config) {
        var coords = this.preCalculateTextDimensions(config);
        var textWidth = coords.totalWidth;
        var textHeight = coords.totalHeight;

        config.x -= textWidth;
        config.y -= textHeight;

        return this.displayText(config);

    }

    getRealCharWidth(font, char) {
        var excPaddingLeft = 0;
        var excPaddingRight = 0;
        var exception = this.getGlyphException(font, char);

        excPaddingLeft = exception == null ? 0 : exception.paddingLeft;
        excPaddingRight = exception == null ? 0 : exception.paddingRight;

        return font.glyphWidth - ((font.glyphPaddingX + excPaddingLeft + excPaddingRight)* 2);
    }

    getGlyphException(font, char) {
        var exception = null;
        
        if (font.glyphExceptions != null) {
            exception = font.glyphExceptions.find(obj => obj.key == char);
        }

        return exception;
    }
}

class FontText {
    constructor(config) {
        this.characters = config.characters;
        this.doFade = config.fade;
        this.fadeFactor = config.fadeFactor;
        this.FADE_DELTA = 100;
        this.delta = 0;
        this.totalWidth = config.totalWidth;
        this.totalHeight = config.totalHeight;

        if (this.fadeFactor == null) {
            this.fadeFactor = 1;
        }
    }

    show() {
        this.visible(true);
    }

    hide() {
        this.visible(false);
    }

    visible(show) {
        for (var i = 0; i < this.characters.length; i++) {
            this.characters[i].visible = show;
        }
    }

    update(time, delta) {
        if (this.doFade) {
            this.fade(delta);
        }
    }

    fade(delta) {
        this.delta += delta;

        if (this.delta >= this.FADE_DELTA * this.fadeFactor) { 
            for (var i = 0; i < this.characters.length; i++) {
                this.characters[i].alpha = this.characters[i].alpha - (0.1 * this.fadeFactor);
            }

            if (this.characters[0].alpha == 0) {
                for (var i = 0; i < this.characters.length; i++) {
                    this.characters[i].destroy();
                }
            }

            this.delta = 0;
        }
    }
}