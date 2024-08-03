var fontsData = {
    "fonts": {
        "SuperTuxSmallFont": {
            "name": "SuperTuxSmallWhite",
            "path": "./assets/images/ui/fonts/supertux-small-white.png",
            "glyphChars": " !\"\#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~  ¡¢£¤¥¦§¨©ª«¬ ®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨĩĪīĬĭĮįİıĲĳĴĵĶķĸĹĺĻļĽľĿŀŁłŃńŅņŇňŉŊŋŌōŎŏŐőŒœŔŕŖŗŘřŚśŜŝŞşŠšŢţŤťŦŧŨũŪūŬŭŮůŰűŲųŴŵŶŷŸŹźŻżŽžſ…ắầặảạếệẻịỉốộồơớởợụủưựửứừữọấểềỏậ",
            "glyphWidth": 18,
            "glyphHeight": 20,
            "glyphBorder": 0
        },
        "SuperTuxBigFont": {
            "name": "SuperTuxBigWhite",
            "path": "./assets/images/ui/fonts/supertux-big-white.png",
            "glyphChars": " !\"\#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~  ¡¢£¤¥¦§¨©ª«¬ ®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨĩĪīĬĭĮįİıĲĳĴĵĶķĸĹĺĻļĽľĿŀŁłŃńŅņŇňŉŊŋŌōŎŏŐőŒœŔŕŖŗŘřŚśŜŝŞşŠšŢţŤťŦŧŨũŪūŬŭŮůŰűŲųŴŵŶŷŸŹźŻżŽžſ…ắầặảạếệẻịỉốộồơớởợụủưựửứừữọấểềỏậ",
            "glyphWidth": 22,
            "glyphHeight": 24,
            "glyphBorder": 0
        },
        "SuperTuxBigFontColored": {
            "name": "SuperTuxBigWhiteColored",
            "path": "./assets/images/ui/fonts/supertux-big-white-colored.png",
            "glyphChars": " !\"\#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~  ¡¢£¤¥¦§¨©ª«¬ ®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨĩĪīĬĭĮįİıĲĳĴĵĶķĸĹĺĻļĽľĿŀŁłŃńŅņŇňŉŊŋŌōŎŏŐőŒœŔŕŖŗŘřŚśŜŝŞşŠšŢţŤťŦŧŨũŪūŬŭŮůŰűŲųŴŵŶŷŸŹźŻżŽžſ…ắầặảạếệẻịỉốộồơớởợụủưựửứừữọấểềỏậ",
            "glyphWidth": 22,
            "glyphHeight": 24,
            "glyphBorder": 0
        }
    }
};

class FontLoader {
    loadFont(scene, fontName, fade, fadeFactor) {
        var font = fontsData.fonts[fontName];
        var endChar = font.glyphChars.length - 1;
        
        scene.load.spritesheet({ key: font.name, url: font.path, frameConfig: { frameWidth: font.glyphWidth, frameHeight: font.glyphHeight } });
    }

    displayText(scene, fontName, x, y, text, fade, fadeFactor) {
        var characters = [];
        var font = fontsData.fonts[fontName];
        var charX = x;
        var charY = y;

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
                charY += font.glyphHeight;

                continue;
            } else if (char == " ") {
                charX += font.glyphWidth;

                continue;
            }

            var n = font.glyphChars.indexOf(char);
            var charImage = scene.add.sprite(charX, charY, font.name, n);
            scene.add.existing(charImage);
            charImage.key = "char-" + i;

            if (this.tint != null) {
                this.tint = tint;
            }

            charImage.scrollFactorX = 0;
            charImage.scrollFactorY = 0;

            characters.push(charImage);

            charX += font.glyphWidth;
        }

        return new FontText({ characters: characters, fade: fade, fadeFactor: fadeFactor });
    }
}

class FontText {
    constructor(config) {
        this.characters = config.characters;
        this.doFade = config.fade;
        this.fadeFactor = config.fadeFactor;
        this.FADE_DELTA = 100;
        this.delta = 0;

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