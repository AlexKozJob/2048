(function(app){
    app.GameActions = function(){
        var ph = new app.Phar(),
            rd = new app.Render(ph),
            gd = new app.GameData(ph.size),
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
                    validStep = false,
                    expectAnimation = [];
                for (var i = 0; i < liveCells.length; i++){
                    currentCell = getPlan(liveCells[i], depth);
                    cellVal = currentCell.val;
                    if(currentCell.moveTo){
                        if(currentCell.merge) {
                            cellVal *= 2;
                            gd.setScore(currentCell);
                            if(ph.victoryCondition !==0 && cellVal >= ph.victoryCondition){
                                ph.victoryCondition = 0;
                                alert('2048! You won! ' +
                                    'But that is not the maximum possible value. ' +
                                    'Try to get a 131 072 cell value. The game continues ^_^');
                            }
                        }
                        gd.setCell(currentCell.x, currentCell.y, 0);
                        gd.setCell(currentCell.moveTo.x, currentCell.moveTo.y, cellVal);
                        expectAnimation.push(currentCell);
                        validStep = true;
                    }
                }
                rd.moveCell(expectAnimation);
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
                            rKey = app.tools.rand(0, free.length - 1);
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
                    }else if(n === 1 && app.tools.rand(0,9) === 0){
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
                    if(toggle === 'right' || toggle === 'down') liveCells = app.tools.reversedCopy(liveCells);
                    ph.direct_x = ph.direction[toggle].x;
                    ph.direct_y = ph.direction[toggle].y;
                    return move(liveCells, 1);
                }
                return false;
            },
            resetGame = function(){
                gd = new app.GameData(ph.size);
                rd.reset();
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
                                gd.setTurn();
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
    };
})(app2048);