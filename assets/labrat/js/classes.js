const path = "/assets/labrat/"

//Sqare class for boxed objects 
class Square extends PIXI.Graphics{
    constructor(color = 0xFFFFFF,x  = 0, y = 0, rad = 0){
        super();
        this.beginFill(color);
        this.drawRect(-rad, -rad, rad * 2 , rad * 2);
        this.endFill();
        this.x = x;
        this.y = y;
    }
}

//holds information about the individual grid squares
class GridSquare extends PIXI.Sprite{
    constructor(x  = 0, y = 0, gridX = 0, gridY = 0){
        super(PIXI.loader.resources[path + "images/GridSquare.png"].texture);
        this.anchor.set(0.5, 0.5);
        this.scale.set(1); //32x32 sprite
        this.x = x;
        this.y = y;
        
        this.empty = true;
        this.gridX = gridX;
        this.gridY = gridY;
    }
}

//base class to all tiles that appear
class Tile extends PIXI.Sprite{
    move(x = 0, y = 0, gridX = 0, gridY = 0){
        this.x = x;
        this.y = y;
        this.isAlive = true;
        
        this.gridX = gridX;
        this.gridY = gridY;
    }
}

//tile that indicates where cheese will appear
class Treat extends Tile{
    constructor(x = 0, y = 0, gridX = 0, gridY = 0){
        super(PIXI.loader.resources[path + "images/Treat.png"].texture);
    
        this.anchor.set(0.5, 0.5);
        this.scale.set(1); //32x32 sprite
        this.x = x;
        this.y = y;
        this.isAlive = false;
        
        this.gridX = gridX;
        this.gridY = gridY;
    }
}

//tile that indicates where the cheese is
class Cheese extends Tile{
    constructor(x = 0, y = 0, gridX = 0, gridY = 0){
        super(PIXI.loader.resources[path + "images/Cheese.png"].texture);
    
        this.anchor.set(0.5, 0.5);
        this.scale.set(1); //32x32 sprite
        this.x = x;
        this.y = y;
        this.isAlive = false;
        
        this.gridX = gridX;
        this.gridY = gridY;
    }
}

//tile that indicates wher danger zones will appear
class Danger extends Tile{
    constructor(x = 0, y = 0, gridX = 0, gridY = 0){
        super(PIXI.loader.resources[path + "images/Danger.png"].texture);
    
        this.anchor.set(0.5, 0.5);
        this.scale.set(1); //32x32 sprite
        this.x = x;
        this.y = y;
        this.isAlive = false;
        
        this.gridX = gridX;
        this.gridY = gridY;
    }
}

//tile that indicates needle location
class Needle extends Tile{
    constructor(x = 0, y = 0, gridX = 0, gridY = 0){
        super(PIXI.loader.resources[path + "images/Needle.png"].texture);
    
        this.anchor.set(0.5, 0.5);
        this.scale.set(1); //32x32 sprite
        this.x = x;
        this.y = y;
        this.isAlive = false;
        
        this.gridX = gridX;
        this.gridY = gridY;
    }
}

//tile that indicates shock location
class Shock extends Tile{
    constructor(x = 0, y = 0, gridX = 0, gridY = 0){
        super(PIXI.loader.resources[path + "images/Shock.png"].texture);
    
        this.anchor.set(0.5, 0.5);
        this.scale.set(1); //32x32 sprite
        this.x = x;
        this.y = y;
        this.isAlive = false;
        
        this.gridX = gridX;
        this.gridY = gridY;
    }
}

//tile that indicates gas location
class Gas extends Tile{
    constructor(x = 0, y = 0, gridX = 0, gridY = 0){
        super(PIXI.loader.resources[path + "images/Gas.png"].texture);
    
        this.anchor.set(0.5, 0.5);
        this.scale.set(1); //32x32 sprite
        this.x = x;
        this.y = y;
        this.isAlive = false;
        
        this.gridX = gridX;
        this.gridY = gridY;
    }
}

//handles an individual heart (life) 
class Heart extends PIXI.extras.AnimatedSprite{
    constructor(x = 0, y = 0, textures = []){
        super(textures);
        this.textures = textures;
        this.anchor.set(0,0);
        this.scale.set(1);
        this.x = x;
        this.y = y;
        this.animationSpeed = 1/12;
        this.loop = false;
    }
    
    disolve(){
        this.animationSpeed = 1/12;
        this.gotoAndPlay(0);
    }
    
    reset(){
        this.texture = this.textures[0];
    }
    
}

//class for the main rat (legacy)
class Rat extends PIXI.Sprite{
    constructor(x = 0, y = 0, speed = 100){
        super(PIXI.loader.resources[path + "images/Rat.png"].texture);
    
        this.anchor.set(0.5, 0.5);
        this.scale.set(1); 
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
        this.speed = speed; //distance between squares
        this.moving = false;
        this.zIndex = 2;
    }
    
    moveTo(x = 0, y = 0){
        if(!this.moving){
            this.targetX = x;
            this.targetY = y;
            this.moving = true;
        }
    }
    
    move(dt = 1/60){
        if(this.moving){
            let moveX = Math.sign(this.targetX - this.x) * dt * this.speed;
            let moveY = Math.sign(this.targetY - this.y) * dt * this.speed;
            
            if((moveX > 0 && this.x + moveX > this.targetX) || (moveX < 0 && this.x + moveX < this.targetX )){
                this.moving = false;
                this.x = this.targetX; 
            }else{
                this.x += moveX;
            }
            
            if((moveY > 0 && this.y + moveY > this.targetY) || (moveY < 0 && this.y + moveY < this.targetY)){
                this.moving = false;
                this.y = this.targetY;            
            }else{
                this.y += moveY;
            }
        }
    }
}
      
//class for the main animated rat
class AnimatedRat extends PIXI.extras.AnimatedSprite{
    constructor(x = 0, y = 0, speed = 100, textures = []){
        super(textures);
    
        this.anchor.set(0.5, 0.5);
        this.scale.set(1); 
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
        this.speed = speed; //distance between squares
        this.moving = false;
        this.zIndex = 2;
        
        //animation bit
        this.animationSpeed = 1/12;
        this.loop = true;
        this.play();
    }
    
    moveTo(x = 0, y = 0){
        if(!this.moving){
            this.targetX = x;
            this.targetY = y;
            this.moving = true;
        }
    }
    
    move(dt = 1/60){
        if(this.moving){
            let moveX = Math.sign(this.targetX - this.x) * dt * this.speed;
            let moveY = Math.sign(this.targetY - this.y) * dt * this.speed;
            
            if((moveX > 0 && this.x + moveX > this.targetX) || (moveX < 0 && this.x + moveX < this.targetX )){
                this.moving = false;
                this.x = this.targetX; 
            }else{
                this.x += moveX;
            }
            
            if((moveY > 0 && this.y + moveY > this.targetY) || (moveY < 0 && this.y + moveY < this.targetY)){
                this.moving = false;
                this.y = this.targetY;            
            }else{
                this.y += moveY;
            }
        }
    }
}
           
           
           
           
           
           
           