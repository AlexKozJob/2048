"use strict";
var app2048 = {};
(function(app){
    app.Phar = function(){
        var renderPhar = {
            contentBlock: document.getElementById("content"),
            fieldBlock: document.getElementById("gameField"),
            infoBlock: document.getElementById("gameInfo"),
            turnBlock: document.getElementById('turn').querySelector('span'),
            scoreBlock: document.getElementById('score').querySelector('span'),
            resetBlock: document.getElementById("reset"),
            fieldSize: 4,
            borderSize: 0,
            duration: 150
        },
            minScreen = (renderPhar.contentBlock.offsetWidth > screen.height)?  screen.height: renderPhar.contentBlock.offsetWidth;
        console.log(renderPhar.contentBlock.offsetWidth);
        console.log(screen.height);
        renderPhar.cellSize = (minScreen > 768) ? 80 : minScreen / (renderPhar.fieldSize + 4);
        console.log(renderPhar.cellSize);
        if(renderPhar.cellSize > 80) renderPhar.cellSize = 80;
        console.log(renderPhar.cellSize);
        renderPhar.fullCellSize = renderPhar.borderSize * 2 + renderPhar.cellSize;
        renderPhar.getFontSize = function (textLength){
            var result = renderPhar.cellSize / 2;
            switch (textLength){
                case 4:
                    result = result - (5 * 100 / result);
                    break;
                case 5:
                    result = result - (30 * 100 / result);
                    break;
            }
            return result;
        };

        return {
            size: renderPhar.fieldSize,
            victoryCondition: 2048,
            direction: {
                left: {
                    keyCode: 37,
                    x: -1,
                    y: 0
                },
                up: {
                    keyCode: 38,
                    x: 0,
                    y: -1
                },
                right: {
                    keyCode: 39,
                    x: 1,
                    y: 0
                },
                down: {
                    keyCode: 40,
                    x: 0,
                    y: 1
                }
            },
            render: renderPhar
        };
    };
})(app2048);
