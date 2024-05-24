var p1;
var p2;
var ctx;
var gameO = true;
var players = [];
var bullets = [];
var platforms = [];
var bombs = [];
var timer = 0;
var HEALTH = 500;
var reset = false;
var resetReady = false;
var full = {
    wid: false,
    hei: false
}

const times = {
    gun1: {time: 5},
    gun2: {time: 2},
    gun3: {time: 7},
    bomb: {time: 20}
}
const keys = {
    a: { pressed:false },
    d: { pressed:false },
    w: { pressed:false },
    Lshift: { pressed:false },
    ArrowLeft: { pressed:false },
    ArrowRight: { pressed:false },
    ArrowUp: { pressed:false },
    Rshift: { pressed:false }
}
const wins = {
    p1: 0,
    p2: 0
}
var area = {
    canvas : document.createElement("canvas"),
    hehe : function() {
        document.getElementById("finish").innerHTML = "";
        if(document.documentElement.clientWidth<1300){
            this.canvas.width = document.documentElement.clientWidth-30;
        } else {
            this.canvas.width = 1300;
            full.wid = true;
        }
        if(document.documentElement.clientHeight<900){
            this.canvas.height = document.documentElement.clientHeight;
        } else {
            this.canvas.height = 900;
            full.hei = true;
        }
        this.context = this.canvas.getContext("2d");
        var div = document.getElementById("test");
        div.appendChild(this.canvas);
        ctx = this.context;
        if(full.hei && full.wid)
            makePlats();
    },
    intervals : function(){
        this.interval = setInterval(updateG, 20);
    },
    clear : function(){
        this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
    }
}

class Player {
    constructor(wid, hei, col, x, y, f, gT) {
        this.width = wid;
        this.height = hei;
        this.color = col;
        this.xPos = x;
        this.yPos = y;
        this.yVelo = 0;
        this.xVelo = 0;
        this.jumps = 2;
        this.health = HEALTH;
        this.facing = f;
        this.gunType = gT;
        this.att = false;
        this.last = 0;
        this.guard = 0;
        this.lastB = 0;
        this.bombs = 10;
        this.draw = function(){
            this.guarding();
            ctx.fillStyle = this.color;
            ctx.fillRect(this.xPos, this.yPos, this.width, this.height);
        }
        this.update = function(){
            this.xVelo = 0;
            if(players[0]===this){
                if(keys.Lshift.pressed){
                    if(keys.a.pressed)
                        this.xVelo-=10;
                    if(keys.d.pressed)
                        this.xVelo+=10;                   
                }else{
                    if(keys.a.pressed)
                        this.xVelo-=5;
                    if(keys.d.pressed)
                        this.xVelo+=5;
                }
            }
            if(players[1]===this){
                if(keys.Rshift.pressed){
                    if(keys.ArrowLeft.pressed)
                        this.xVelo-=10;
                    if(keys.ArrowRight.pressed)
                        this.xVelo+=10;                   
                }else{
                    if(keys.ArrowLeft.pressed)
                        this.xVelo-=5;
                    if(keys.ArrowRight.pressed)
                        this.xVelo+=5;
                }
            }
            if(this.att)
                this.attack();
            this.yPos-=this.yVelo;
            this.xPos+=this.xVelo;
            if(this.yPos<area.canvas.height-this.height){
                this.yVelo-=1.4;
            }else{
                this.jumps=2;
                this.yVelo=0;
                this.yPos=area.canvas.height-this.height;
            }
            if(this.xPos<0)
                this.xPos=0;
            if((this.xPos+this.width)>area.canvas.width)
                this.xPos=area.canvas.width-this.width;
            platforms.forEach(p => {
                platcheck(this, p);
            })
        }
        this.attack = function(){
            switch(this.gunType){
                case 1:
                    if(timer-this.last>times.gun1.time){
                        bullets.push(new Bullet(20, 7, this.xPos+(this.width/2)-10, this.yPos+(this.height/2), 8, 20, this, this.facing));
                        this.last=timer;
                    }
                break
                case 2:
                    if(timer-this.last>times.gun2.time){
                        bullets.push(new Bullet(17, 5, this.xPos+(this.width/2)-17/2, this.yPos+(this.height/2), 13, 10, this, this.facing));
                        this.last=timer;
                    }
                break
                case 3:
                    if(timer-this.last>times.gun3.time){
                        bullets.push(new Bullet(14, 10, this.xPos+(this.width/2)-7, this.yPos+(this.height/2), 6, 30, this, this.facing));
                        this.last=timer;
                    }
                break
            }
        }
        this.bomb = function(){
            this.lastB = timer;
            this.bombs--;
            bombs.push(new Bomb(this.xPos+(this.width/2)-12.5,this.yPos+(this.height/2)-12.5,25,25,2*this.xVelo, 1.5*this.yVelo, this, this.facing))
        }
        this.guarding = function(){
            if(this.guard>0){
                this.xPos-=this.xVelo;
                ctx.strokeStyle = "lightblue";
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(this.xPos+(this.width/2), this.yPos+(this.height/2), 40, 0, 2 * Math.PI);
                ctx.stroke();    
                this.guard--; 
            }           
        }
    }
}

class Bullet {
    constructor(wid, hei, x, y, vel, dam, player, fac){
        this.width = wid;
        this.height = hei;
        this.xPos = x;
        this.yPos = y;
        this.alive = true;
        if(fac)
            this.xVelo = vel;
        else
            this.xVelo = vel*-1;
        this.damage = dam;
        this.shooter = player;
        this.draw = function(){
            if(this.shooter===players[0])
                ctx.fillStyle = "#630000";
            else
                ctx.fillStyle = "#000063";
            ctx.fillRect(this.xPos, this.yPos, this.width, this.height);
        }
        this.update = function(){
            this.xPos+=this.xVelo;
            if(this.shooter===p1){
                if(ammocheck(this,p2)){
                    if(p2.guard==0){
                        p2.health-=this.damage;
                        if(p2.health<0)
                            p2.health=0;
                    }
                this.alive = false;
                }
            }else{
                if(ammocheck(this,p1)){
                    if(p1.guard==0){
                        p1.health-=this.damage;
                        if(p1.health<0)
                            p1.health=0;
                    }
                    this.alive = false;
                } 
            }     
        }      
    }
}

class Platform {
    constructor(x,y,wid,hei){
        this.xPos = x;
        this.yPos = y;
        this.width = wid;
        this.height = hei;
        this.draw = function(){
            ctx.fillRect(this.xPos, this.yPos, this.width, this.height);
        }
    }
}

class Circle {
    constructor(x,y,r){
        this.xPos = x;
        this.yPos = y;
        this.radius = r;
    }
}

class Bomb {
    constructor(x,y,wid,hei,xvel, yvel, player, fac){
        this.xPos = x;
        this.yPos = y;
        this.width = wid;
        this.height = hei;
        this.yVelo = yvel;
        this.dama = 50;
        this.shooter = player;
        this.xVelo = xvel;
        this.fuse = 50;
        this.deal = false;
        this.draw = function(){
            if(this.fuse==2||this.fuse==1||this.fuse==0){
                ctx.fillStyle = "yellow";
                ctx.strokeStyle = "yellow";
                ctx.beginPath();
                ctx.arc(this.xPos+(this.width/2), this.yPos+(this.height/2), 100, 0, 2 * Math.PI);
                ctx.stroke();
                ctx.fill();
                this.damage();
            } else {
                ctx.fillStyle = "#3b3b3b";
                ctx.fillRect(this.xPos, this.yPos, this.width, this.height);
            }
        }
        this.update = function(){
            this.yPos-=this.yVelo;
            this.xPos+=this.xVelo;
            if(this.yPos<area.canvas.height-this.height){
                this.yVelo-=1.4;
            }else{
                this.yPos=area.canvas.height-this.height;
                this.xVelo=0;
            }
            if(this.xPos<0)
                this.xPos=0;
            if((this.xPos+this.width)>area.canvas.width)
                this.xPos=area.canvas.width-this.width;
            platforms.forEach(p => {
                platcheck(this, p);
            });
            this.fuse--;
        }
        this.damage = function(){
            if(this.shooter==p1){
                if(circlecheck(new Circle(this.xPos+(this.width/2), this.yPos+(this.height/2), 100),p2)){
                    this.deal = true;
                    p2.health-=this.dama;
                }
            } else {
                if(circlecheck(new Circle(this.xPos+(this.width/2), this.yPos+(this.height/2), 100),p1)){
                    this.deal = true;
                    p1.health-=this.dama;
                }
            }
        }
    }
}

function startGame() {
    var b = 50;
    area.hehe();
    p1 = new Player(b, b, "red", 0, area.canvas.height-b, true, 0);
    players.push(p1);
    p2 = new Player(b, b, "blue", area.canvas.width, area.canvas.height-b, false, 0);
    players.push(p2);
    area.intervals();
}

function updateG(){
    area.clear();
    players.forEach(p => {
        p.update();
        p.draw()
    });
    bullets.forEach(b => {
        b.update();
        b.draw();
        if(!b.alive)
            bullets.splice(bullets.indexOf(b),1);
    });
    bombs.forEach(b => {
        b.update();
        b.draw();
        if(b.fuse==0||b.deal)
            bombs.splice(bombs.indexOf(b),1);
    });
    drawUI();
    if(wincheck())
        resetG();
}

function resetG(){
    gameO = true;
    timer = 0;
    HEALTH = 500;
    clearInterval(area.interval);
    ctx.fillStyle = "black";
    setTimeout(()=>{
        ctx.fillText("Play again?",area.canvas.width/2,area.canvas.height/2);
        setTimeout(()=>{resetReady = true;},1000);
    },1000);
}

function drawUI(){
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "50px Times New Roman";
    timer++;
    ctx.fillStyle = "black";
    ctx.fillText(Math.trunc((timer/50)), area.canvas.width/2, 55);
    ctx.fillRect(27,27,100*5+6,56);
    ctx.fillRect(area.canvas.width-27,27,100*-5-6,56);
    players.forEach(p =>{
        ctx.fillStyle = p.color;
        if(players[0]===p){
            for(var i=0; i<p1.bombs; i++)
                ctx.fillRect(45*i+90,97,20,40);
            ctx.fillRect(30,30,p.health,50);
        } else {
            for(var i=0; i<p2.bombs; i++)
                ctx.fillRect(1200-45*i,97,20,40);
            ctx.fillRect(area.canvas.width-30,30,p.health*-1,50);
        }
        ctx.fillStyle = "black";
        if(players[0]===p)
            ctx.fillText(wins.p1, 40, 120);
        else
            ctx.fillText(wins.p2, area.canvas.width-40, 120);
    })
    platforms.forEach(p =>{
        ctx.fillStyle = "black";
        p.draw();
    });
}

function makePlats(){
    platforms.push(new Platform(100,400,150,50));
    platforms.push(new Platform(area.canvas.width-100-150,400,150,50));
    platforms.push(new Platform(area.canvas.width/2-200,600,400,50));
}

function setAmmo(type, play){
    play.gunType = type;
}

function ammocheck(b1, b2){
    return((b1.xPos+b1.width>=b2.xPos && b1.xPos<=b2.xPos+b2.width) && 
           (b1.yPos+b1.height>=b2.yPos && b1.yPos<=b2.yPos+b2.height))
}

function platcheck(b1, b2){
    if(ammocheck(b1,b2)){
        if(b1.yVelo>0){
            b1.yPos = b2.yPos + b2.height + 1;
            b1.yVelo = 0;
            return;
        }else if(b1.yVelo<0){
            b1.yPos = b2.yPos - b1.height;
            b1.yVelo=0;
            b1.jumps = 2;
            b1.xVelo=0;
            return;
        }
    }
    return
}

function circlecheck(c,r){
    var distX = Math.abs(c.xPos - r.xPos-r.width/2);
    var distY = Math.abs(c.yPos - r.yPos-r.height/2);

    if (distX > (r.width/2 + c.radius)) { return false; }
    if (distY > (r.height/2 + c.radius)) { return false; }

    if (distX <= (r.width/2)) { return true; } 
    if (distY <= (r.height/2)) { return true; }

    var dx=distX-r.width/2;
    var dy=distY-r.height/2;
    return (dx*dx+dy*dy<=(c.radius*c.radius));
}

function wincheck(){
    if(p1.health<=0 && p1.health==p2.health){
        document.getElementById("finish").innerHTML = "<br>DRAW<br>";
        gameO = false;
    } else if (p2.health<=0 && p2.health<p1.health){
        document.getElementById("finish").innerHTML = "<br>PLAYER 1 WINS<br>";
        gameO = false;
        wins.p1++;
    } else if (p1.health <=0 && p1.health<p2.health){
        document.getElementById("finish").innerHTML = "<br>PLAYER 2 WINS<br>";
        gameO = false;
        wins.p2++;
    }
    if(!gameO)
        return true;
    return false;
}

window.addEventListener('keydown', (e)=>{
    switch(e.code.toLowerCase()){
        case 'keyd':
            keys.d.pressed=true;
            p1.facing=true;
        break
        case 'keya':
            keys.a.pressed=true;
            p1.facing=false;
        break
        case 'keyw':
            if(p1.jumps>0&&p1.guard==0){
                p1.yVelo=25;
                p1.jumps--;
            }
        break 
        case 'keyx':
            p1.att = true;
        break
        case 'shiftleft':
            keys.Lshift.pressed=true;
        break
        
        case 'arrowright':
            keys.ArrowRight.pressed=true;
            p2.facing = true;
        break
        case 'arrowleft':
            keys.ArrowLeft.pressed=true;
            p2.facing=false;
        break
        case 'arrowup':
            e.preventDefault();
            if(p2.jumps>0&&p2.guard==0){
                p2.yVelo=25;
                p2.jumps--;
            }
        break
        case 'comma':
            e.preventDefault();
            p2.att = true;
        break
        case 'numpad0':
            keys.Rshift.pressed=true;
        break  
    }
})

window.addEventListener('keyup', (e)=>{
    switch(e.code.toLowerCase()){
        case 'keyd':
            keys.d.pressed=false;
        break
        case 'keya':
            keys.a.pressed=false;
        break
        case 'shiftleft':
            keys.Lshift.pressed=false;
        break
        case 'keyx':
            p1.att = false;
        break        

        case 'arrowright':
            keys.ArrowRight.pressed=false;
        break
        case 'arrowleft':
            keys.ArrowLeft.pressed=false;
        break
        case 'numpad0':
            keys.Rshift.pressed=false;
        break
        case 'comma':
            p2.att = false;
        break
    }
})

window.addEventListener('keypress', (e)=>{
    e.preventDefault();
    if(e.code.toLowerCase()=='space'&&resetReady){
        resetReady = false;
        players.length=0;
        bullets.length=0;
        startGame();
    }
    if(e.code.toLowerCase()=='keyv' && p1.guard==0)
        p1.guard = 20;
    if(e.code.toLowerCase()=='slash' && p2.guard==0)
        p2.guard = 20;
    if(e.code.toLowerCase()=='keyc' && timer-p1.lastB>=times.bomb.time && p1.bombs>0)
        p1.bomb();
    if(e.code.toLowerCase()=='period' && timer-p2.lastB>=times.bomb.time && p2.bombs>0)
        p2.bomb();
})
