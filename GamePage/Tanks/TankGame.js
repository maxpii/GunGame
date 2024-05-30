var area = {
    canvas : document.createElement("canvas"),
    hehe : function() {
        this.canvas.width = 1300;
        this.canvas.height = 900;
        this.context = this.canvas.getContext("2d");
        var div = document.getElementById("game");
        div.appendChild(this.canvas);
        ctx = this.context;
    },

    intervals : function(){
        this.interval = setInterval(updateG, 20);
    },
    clear : function(){
        this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
    }
}
var ctx;


function startGame(){
    area.hehe();
    area.intervals();
    ctx.fillStyle = "black";
}


function updateG(){
    area.clear();
    ctx.fillRect(10,10,20,20);
}