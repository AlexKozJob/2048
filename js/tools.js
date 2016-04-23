(function(app){
    app.tools = {
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
    };
})(app2048);