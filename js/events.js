"use strict";
(function(app){
    app.events = (function (){
            var ph = new app.Phar(),
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
                    document.addEventListener("touchstart", function(e) {
                        if(e.path[0].id !== "reset"){
                            e.preventDefault();
                            touchPosition.push({
                                x: e.changedTouches[0].screenX,
                                y: e.changedTouches[0].screenY
                            });
                        }
                    }, false);
                    document.addEventListener("touchend", function(e) {
                        var directionTop,
                            directionLeft,
                            sensitivity = 20,
                            toggle = false;
                        if(e.path[0].id !== "reset"){
                            touchPosition.push({
                                x: e.changedTouches[0].screenX,
                                y: e.changedTouches[0].screenY
                            });
                            directionTop = touchPosition[0].y - touchPosition[1].y;
                            directionLeft = touchPosition[0].x - touchPosition[1].x;
                            if (directionTop > 0 && directionTop > directionLeft && directionTop > sensitivity){
                                toggle = 'up';
                            }else if(directionLeft > 0 && directionLeft > directionTop + sensitivity && directionLeft > sensitivity){
                                toggle = 'left';
                            }else if(directionTop < 0 && Math.abs(directionTop) > Math.abs(directionLeft) + sensitivity && Math.abs(directionTop) > sensitivity){
                                toggle = 'down';
                            }else if(directionLeft < 0 && Math.abs(directionLeft) > Math.abs(directionTop) + sensitivity && Math.abs(directionLeft) > sensitivity){
                                toggle = 'right';
                            }
                            if(toggle)e.preventDefault();
                            ga.validStep(toggle);
                            touchPosition = [];
                        }
                        return false;
                    }, false);
                };

            return window.onload = function(){
                var ga = new app.GameActions();
                ga.init();
                keyDirection(ga);
                touchDirection(ga);
                reset(ga);
            };
        })();
})(app2048);