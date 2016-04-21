"use strict";
(function(){
    var Phar = function(){
            var renderPhar = {
              borderSize: 0,
                cellSize:80,
                duration: 150
            };
            renderPhar.fullCellSize = renderPhar.borderSize * 2 + renderPhar.cellSize;
            renderPhar.getFontSize = function (textLength){
                var result = renderPhar.cellSize / 2;
                switch (textLength){
                    case 4:
                        result = result - (5 * 100 / result);
                        break;
                    case 5:
                        result = result - (10 * 100 / result);
                        break;
                }
                return result;
            };
            return {
                size: 4,
                victoryCondition: 2048,
                gameFieldId: 'gameField',
                gameBoxId: 'gameBox',
                gameInfoId: 'gameInfo',
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
        },
        GameData = function(size){
            var mt = tools.genMt(size),
                score = 0,
                turn = 1,
                stepIsUnlocked = true;
            return {
                generatedInThisStep: tools.genMt(size),
                getCell: function(x, y){
                    if(x >= 0 && y >= 0 && x < size && y < size){
                        return mt[y][x];
                    }
                    return null;
                },
                getLiveCells: function(size){
                    var result = [];
                    for(var y = 0; y < size; y++){
                        for(var x = 0; x < size; x++){
                            if(parseInt(mt[y][x]) > 0){
                                result.push({x: x, y: y, val: mt[y][x]});
                            }
                        }
                    }
                    if(result.length > 0) return result;

                    return false;
                },
                getStepIsUnlocked: function(){
                    return stepIsUnlocked;
                },
                toggleLockingStep: function(){
                        stepIsUnlocked = !stepIsUnlocked;
                },
                resetDataOnMergers: function(){
                    this.generatedInThisStep = tools.genMt(size);
                },
                updateScore: function(mergeCell){
                    return score += mergeCell.val * 2;
                },
                updateTurn: function(){
                    turn += 1;
                },
                getTurn: function(){
                    return turn;
                },
                getScore: function(){
                    return score;
                },
                setCell: function(x, y, val){
                    mt[y][x] = val;
                }
            }
        },
        Render = function(ph){
            var gameFieldObj = document.getElementById(ph.gameFieldId),
                gameInfoObj = document.getElementById(ph.gameInfoId),
                turn =  document.getElementById('turn').querySelector('span'),
                score =  document.getElementById('score').querySelector('span'),
                setStyle = function(gfo, val){
                    var cellCont, cell, vl;
                    if(!val){

                        cellCont = gameFieldObj.querySelectorAll("div[data-coord]");
                        cell = gameFieldObj.querySelectorAll("div[data-coord] > div");
                        for (var i = 0; i < cellCont.length; i++) {
                            cellCont[i].style.width =
                                cellCont[i].style.height =
                                    cellCont[i].style.minWidth =
                                        cellCont[i].style.minHeight = ph.render.fullCellSize + "px";
                            cell[i].style.width = cell[i].style.height = ph.render.cellSize + "px";
                            cell[i].style.borderSize = ph.render.borderSize + "px";
                            gameInfoObj.style.fontSize = ph.render.getFontSize(5) + "px";
                        }
                    }else {
                        vl = val.toString().length;
                        if(vl > 2){
                            gfo.style.fontSize = ph.render.getFontSize(vl) + "px";
                        }else{
                            gfo.style.fontSize = ph.render.getFontSize(1) + "px";
                        }
                    }
                };
            return {
                generatePlayingField: function(){
                    var row, coll, cell;
                    gameFieldObj.innerHTML = '';
                    for(var y = 0; y < ph.size; y++){
                        row = document.createElement("div");
                        for(var x = 0; x < ph.size; x++){
                            coll = document.createElement("div");
                            cell = document.createElement("div");
                            coll.dataset.coord = y+":"+x;
                            coll.dataset.value = 0;
                            coll.appendChild(cell);
                            row.appendChild(coll);
                        }
                        gameFieldObj.appendChild(row);
                    }
                    setStyle();
                    return gameFieldObj;
                },
                updCell: function (coords, val){
                    var cell = gameFieldObj.querySelector("div[data-coord='"+coords.y+":"+coords.x+"']");
                    cell.dataset.value = val || 0;
                    cell.querySelector('div').innerHTML = val || '';
                    if(val) setStyle(cell, val);
                },
                mergeCell: function(cc){
                    var offset = (ph.render.fullCellSize / 10),
                        fastSpeed = ph.render.duration / 3;
                    $('[data-coord="'+cc.moveTo.y+':'+cc.moveTo.x+'"]>div',gameFieldObj).animate(
                        {
                            width: ph.render.fullCellSize + offset + "px",
                            height: ph.render.fullCellSize + offset + "px",
                            top: -(offset/2) + "px",
                            left: -(offset/2) + "px"
                        }, {
                            duration: fastSpeed,
                            complete: (function(cc) {
                                return function(){
                                    $('[data-coord="'+cc.moveTo.y+':'+cc.moveTo.x+'"]>div',gameFieldObj).animate(
                                        {
                                            width: ph.render.cellSize + "px",
                                            height: ph.render.cellSize + "px",
                                            top: 0,
                                            left: 0
                                        },fastSpeed);
                                }
                            })(cc)
                        })
                },
                moveCell: function(currentCell){
                    var shift = {};
                    shift.x = (currentCell.moveTo.x - currentCell.x) * ph.render.fullCellSize;
                    shift.y = (currentCell.moveTo.y - currentCell.y) * ph.render.fullCellSize;
                    $('[data-coord="'+currentCell.y+':'+currentCell.x+'"]>div', gameFieldObj)
                        .animate({
                            left: shift.x+"px",
                            top: shift.y+"px"
                        }, {
                            duration: ph.render.duration,
                            complete: (function(cc, rd) {
                                if(cc.merge)cc.val *= 2;
                                return function(){
                                    rd.updCell({x: cc.x, y: cc.y}, false);
                                    rd.updCell({x: cc.moveTo.x, y: cc.moveTo.y}, cc.val);
                                    $('[data-coord="'+cc.y+':'+cc.x+'"]>div', gameFieldObj).css({
                                        top: 0,
                                        left: 0
                                    });
                                    if(cc.merge) rd.mergeCell(cc);
                                }
                            })(currentCell, this)
                        });
                },
                wrongStep: function(){
                    $(gameFieldObj).animate({'backgroundColor': '#D5421C'}, {
                            duration: ph.render.duration,
                            complete: function(){
                                $(gameFieldObj).animate({'backgroundColor': '#4a4a4a'}, ph.render.duration);
                            }
                        });
                },
                updateGameInfo: function(type, val){
                    if(type === 'turn'){
                        turn.innerHTML = val;
                    }else if(type === 'score'){
                        score.innerHTML = val;
                    }

                }
            }
        },
        GameActions = function(){
            var ph = new Phar(),
                rd = new Render(ph),
                gd = new GameData(ph.size),
                getPlan = function (thisCell, depth){
                    var newDirect = {},
                        viewingCellValue,
                        recursionData;
                    thisCell.moveTo = null;
                    thisCell.merge = false;
                    newDirect.x = thisCell.x + (ph.direct_x * depth);
                    newDirect.y = thisCell.y + (ph.direct_y * depth);
                    viewingCellValue = gd.getCell(newDirect.x, newDirect.y);
                    if(viewingCellValue === 0){
                        recursionData = getPlan(thisCell, depth+1);
                        if(recursionData){
                            thisCell = recursionData;
                        }
                    }else if(viewingCellValue === null){
                        if(depth > 1){
                            newDirect.x = thisCell.x + (ph.direct_x * (depth-1));
                            newDirect.y = thisCell.y + (ph.direct_y * (depth-1));
                            thisCell.moveTo = {x: newDirect.x, y: newDirect.y};
                        }
                    }else if(viewingCellValue > 0){
                        if(thisCell.val === viewingCellValue){
                            if(gd.generatedInThisStep[newDirect.y][newDirect.x] === 0){
                                thisCell.moveTo = {x: newDirect.x, y: newDirect.y};
                                gd.generatedInThisStep[newDirect.y][newDirect.x] = 1;
                                thisCell.merge = true;
                            }else{
                                newDirect.x = thisCell.x + (ph.direct_x * (depth-1));
                                newDirect.y = thisCell.y + (ph.direct_y * (depth-1));
                                thisCell.moveTo = {x: newDirect.x, y: newDirect.y};
                            }
                        }else if(depth > 1){
                            newDirect.x = thisCell.x + (ph.direct_x * (depth-1));
                            newDirect.y = thisCell.y + (ph.direct_y * (depth-1));
                            thisCell.moveTo = {x: newDirect.x, y: newDirect.y};
                        }
                    }else{
                        return false;
                    }
                    return thisCell;
                },
                move = function (liveCells, depth){
                    var currentCell,
                        cellVal,
                        validStep = false;
                    for (var i = 0; i < liveCells.length; i++){
                        currentCell = getPlan(liveCells[i], depth);
                        cellVal = currentCell.val;
                        if(currentCell.moveTo){
                            if(currentCell.merge) {
                                cellVal *= 2;
                                gd.updateScore(currentCell);
                                if(ph.victoryCondition !==0 && cellVal >= ph.victoryCondition){
                                    ph.victoryCondition = 0;
                                    alert('2048! You won! ' +
                                        'But that is not the maximum possible value. ' +
                                        'Try score 131 072 (If this field is 4x4). The game continues ^_^');
                                }else if(cellVal >= 131072){
                                    alert('Cheater!!11');
                                }
                            }
                            gd.setCell(currentCell.x, currentCell.y, 0);
                            gd.setCell(currentCell.moveTo.x, currentCell.moveTo.y, cellVal);
                            rd.moveCell(currentCell);
                            validStep = true;
                        }
                    }
                    rd.updateGameInfo('score', gd.getScore());
                    gd.resetDataOnMergers();
                    return validStep;
                },
                thisGameIsOver = function(direction){
                    var cells = gd.getLiveCells(ph.size) || [],
                        movesUnblocked = 0,
                        cellsLength = cells.length,
                        cVal,
                        direct_x,
                        direct_y,
                        prop;
                    if(cellsLength === ph.size * ph.size){
                        for(var i = 0; i < cellsLength; i++){
                            cVal = cells[i].val;
                            for (prop in direction){
                                if (!direction.hasOwnProperty(prop)) continue;
                                direct_y = cells[i].y + direction[prop].y;
                                direct_x = cells[i].x + direction[prop].x;
                                if( direct_y >= 0 && direct_y < ph.size){
                                    if(direct_x >= 0 && direct_x < ph.size){
                                        if(gd.getCell(direct_x, direct_y) === cVal) movesUnblocked += 1;
                                    }
                                }

                            }
                        }
                        if(movesUnblocked === 0) {
                            alert('game over');
                            return true;
                        }
                    }
                    return false;
                },
                addCells = function(n){
                    var coords = (function(size, n){
                        var rKey, free = [], newCells = [];
                        for(var mt_y = 0; mt_y < size; mt_y++){
                            for(var mt_x = 0; mt_x < size; mt_x++){
                                if(gd.getCell(mt_x, mt_y) === 0){
                                    free.push({x:mt_x, y:mt_y})
                                }
                            }
                        }
                        for(var i = 0; i < n; i++){
                            rKey = tools.rand(0, free.length - 1);
                            newCells.push(free[rKey]);
                            free.splice(rKey, 1);
                        }
                        return newCells;
                    })(ph.size, n),
                        basicValue = 2;

                    for(var i = 0; i < coords.length; i++){
                        if (n === 11){
                            var st = i+1;
                            st = Math.pow(basicValue, st);
                            gd.setCell(coords[i].x, coords[i].y, st);
                            rd.updCell(coords[i], st);
                        }else if(n === 1 && tools.rand(0,9) === 0){
                            gd.setCell(coords[i].x, coords[i].y, 4);
                            rd.updCell(coords[i], 4);
                        }else{
                            gd.setCell(coords[i].x, coords[i].y, 2);
                            rd.updCell(coords[i], 2);
                        }
                    }
                },
                makeStep = function(toggle){
                    var liveCells = gd.getLiveCells(ph.size);
                    if(liveCells && toggle){
                        if(toggle === 'right' || toggle === 'down') liveCells = tools.reversedCopy(liveCells);
                        ph.direct_x = ph.direction[toggle].x;
                        ph.direct_y = ph.direction[toggle].y;
                        return move(liveCells, 1);
                    }
                    return false;
                },
                resetGame = function(){
                    gd = new GameData(ph.size);
                    rd.generatePlayingField();
                    addCells(3);
                    rd.updateGameInfo('score', gd.getScore());
                    rd.updateGameInfo('turn', gd.getTurn());
                };
            return {
                init: resetGame,
                validStep: function(toggle){
                        if(gd.getStepIsUnlocked()){
                            gd.toggleLockingStep();
                            if(makeStep(toggle)){
                                setTimeout(function(){
                                    addCells(1);
                                    if(thisGameIsOver(ph.direction)){
                                        resetGame();
                                    }else{
                                        gd.updateTurn();
                                        rd.updateGameInfo('turn', gd.getTurn());
                                        gd.toggleLockingStep();
                                    }
                                },ph.render.duration + (ph.render.duration / 3));
                            }else{
                                rd.wrongStep();
                                gd.toggleLockingStep();
                            }
                            return true;
                        }
                    return false;
                }
            };
        },
        tools = {
            genMt: function(s){
                var arr = [];
                for(var y = 0; y < s; y++){
                    arr[y] = [];
                    for(var x = 0; x < s; x++){
                        arr[y][x] = 0;
                    }
                }
                return arr;
            },
            rand: function(min, max){
                var rand = min + Math.random() * (max - min);
                rand = Math.round(rand);
                return rand;
            },
            reversedCopy : function(arr){
                var result = [];
                for( var i = arr.length; i--; ){
                    result.push( arr[i] );
                }
                return result;
            }
        },
        events = (function (){
            var ph = new Phar(),
                gameField = document.getElementById("gameField"),
                keyDirection = function (ga) {
                    return window.addEventListener("keydown", function(e) {
                        var toggle = false;
                        switch (e.keyCode){
                            case ph.direction.up.keyCode:
                                toggle = 'up';
                                break;
                            case ph.direction.left.keyCode:
                                toggle = 'left';
                                break;
                            case ph.direction.down.keyCode:
                                toggle = 'down';
                                break;
                            case ph.direction.right.keyCode:
                                toggle = 'right';
                                break;
                        }
                        if(toggle) e.preventDefault();
                        return ga.validStep(toggle);
                    }, false);
                },
                reset = function(ga){
                   return document.getElementById('reset').addEventListener('click', ga.init, false);
                },
                touchDirection = function(ga){
                    var touchPosition = [];
                    gameField.addEventListener("touchstart", function(e) {
                        e.preventDefault();
                        touchPosition.push({
                            x: e.changedTouches[0].screenX,
                            y: e.changedTouches[0].screenY
                        });
                    }, false);
                    gameField.addEventListener("touchend", function(e) {
                        e.preventDefault();
                        var directionTop,
                            directionLeft,
                            sensitivity = 5,
                            toggle = false;
                        touchPosition.push({
                            x: e.changedTouches[0].screenX,
                            y: e.changedTouches[0].screenY
                        });
                        directionTop = touchPosition[0].y - touchPosition[1].y;
                        directionLeft = touchPosition[0].x - touchPosition[1].x;
                        if (directionTop > 0 && directionTop > directionLeft && directionTop > sensitivity){
                            toggle = 'up';
                        }else if(directionLeft > 0 && directionLeft > directionTop && directionLeft > sensitivity){
                            toggle = 'left';
                        }else if(directionTop < 0 && Math.abs(directionTop) > Math.abs(directionLeft) && Math.abs(directionTop) > sensitivity){
                            toggle = 'down';
                        }else if(directionLeft < 0 && Math.abs(directionLeft) > Math.abs(directionTop) && Math.abs(directionLeft) > sensitivity){
                            toggle = 'right';
                        }
                        ga.validStep(toggle);
                        touchPosition = [];
                        return false;
                    }, false);
                };

            return window.onload = function(){
                var ga = new GameActions();
                ga.init();
                keyDirection(ga);
                touchDirection(ga);
                reset(ga);
            };
        })();
})();