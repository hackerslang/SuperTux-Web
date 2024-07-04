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
        }
    }
};

class FontLoader {
    loadFont(scene, fontName) {
        var font = fontsData.fonts[fontName];
        var endChar = font.glyphChars.length - 1;
        
        scene.load.spritesheet({ key: font.name, url: font.path, frameConfig: { frameWidth: font.glyphWidth, frameHeight: font.glyphHeight } });
    }

    displayText(scene, fontName, x, y, text) {
        var font = fontsData.fonts[fontName];
        var charX = x;
        var charY = y;

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
            charImage.key = "char-"+i;

            charImage.scrollFactorX = 0;
            charImage.scrollFactorY = 0;

            charX += font.glyphWidth;
        }
    }
}