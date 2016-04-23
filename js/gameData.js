(function(app){
    app.GameData = function(size){
        var mt = app.tools.genMt(size),
            score = 0,
            turn = 1,
            stepIsUnlocked = true;
        return {
            generatedInThisStep: app.tools.genMt(size),
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
            getTurn: function(){
                return turn;
            },
            getScore: function(){
                return score;
            },
            toggleLockingStep: function(){
                stepIsUnlocked = !stepIsUnlocked;
            },
            resetDataOnMergers: function(){
                this.generatedInThisStep = app.tools.genMt(size);
            },
            setScore: function(mergeCell){
                return score += mergeCell.val * 2;
            },
            setTurn: function(){
                turn += 1;
            },
            setCell: function(x, y, val){
                mt[y][x] = val;
            }
        }
    };
})(app2048);