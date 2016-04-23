(function(app){
    app.Render = function(ph){
        var fb = ph.render.fieldBlock,
            ib = ph.render.infoBlock,
            rb = ph.render.resetBlock,
            tb = ph.render.turnBlock,
            sb = ph.render.scoreBlock,
            setStyle = function(gfo, val){
                var cellCont, cell, vl;
                if(!val){
                    cellCont = fb.querySelectorAll("div[data-coord]");
                    cell = fb.querySelectorAll("div[data-coord] > div");
                    for (var i = 0; i < cellCont.length; i++) {
                        cellCont[i].style.width =
                            cellCont[i].style.height =
                                cellCont[i].style.minWidth =
                                    cellCont[i].style.minHeight = ph.render.fullCellSize + "px";
                        cell[i].style.width = cell[i].style.height = ph.render.cellSize + "px";
                        cell[i].style.borderSize = ph.render.borderSize + "px";
                        ib.style.fontSize = ph.render.getFontSize(5) + "px";
                        rb.style.fontSize = ib.style.fontSize;
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
                fb.innerHTML = '';
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
                    fb.appendChild(row);
                }
                setStyle();
                return fb;
            },
            updCell: function (coords, val){
                var cell = fb.querySelector("div[data-coord='"+coords.y+":"+coords.x+"']");
                cell.dataset.value = val || 0;
                cell.querySelector('div').innerHTML = val || '';
                if(val) setStyle(cell, val);
            },
            mergeCell: function(cc){
                var offset = (ph.render.fullCellSize / 10),
                    fastSpeed = ph.render.duration / 3;
                $('[data-coord="'+cc.moveTo.y+':'+cc.moveTo.x+'"]>div',fb).animate(
                    {
                        width: ph.render.fullCellSize + offset + "px",
                        height: ph.render.fullCellSize + offset + "px",
                        top: -(offset/2) + "px",
                        left: -(offset/2) + "px"
                    }, {
                        duration: fastSpeed,
                        complete: (function(cc) {
                            return function(){
                                $('[data-coord="'+cc.moveTo.y+':'+cc.moveTo.x+'"]>div',fb).animate(
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
                $('[data-coord="'+currentCell.y+':'+currentCell.x+'"]>div', fb)
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
                                $('[data-coord="'+cc.y+':'+cc.x+'"]>div', fb).css({
                                    top: 0,
                                    left: 0
                                });
                                if(cc.merge) rd.mergeCell(cc);
                            }
                        })(currentCell, this)
                    });
            },
            wrongStep: function(){
                $(fb).animate({'backgroundColor': '#D5421C'}, {
                    duration: ph.render.duration,
                    complete: function(){
                        $(fb).animate({'backgroundColor': '#4a4a4a'}, ph.render.duration);
                    }
                });
            },
            updateGameInfo: function(type, val){
                if(type === 'turn'){
                    tb.innerHTML = val;
                }else if(type === 'score'){
                    sb.innerHTML = val;
                }

            }
        }
    };
})(app2048);
