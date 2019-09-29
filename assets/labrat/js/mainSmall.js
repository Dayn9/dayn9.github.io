// We will use `strict mode`, which helps us by having the browser catch many common JS mistakes
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";
const app = new PIXI.Application(400,400);
document.querySelector("section").appendChild(app.view);

// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;	

// pre-load the images
PIXI.loader.
add(["images/GridSquare.png", "images/Treat.png", "images/Cheese.png", "images/Danger.png", "images/Needle.png", "images/Shock.png", "images/Gas.png", "images/Rat.png", "images/Heart.png", "images/CheesPlain.png", "images/HeartAnim.png", "images/RatIdle.png"]).
on("progress",e=>{console.log(`progress=${e.progress}`)}).
load(setup);

//Colors pallette used by all sprites and fonts
let colors = [0x739787, 0x294550, 0x403142, 0xA63340, 0xE1C0A9, 0xEAE1D0];

// aliases
let stage;

// game variables
let startScene;
let gameScene,scoreLabel,lifeLabel, trialLabel, trialCountdown, gameOverScoreLabel, gameOverHighScoreLabel;
let gameOverScene;

//sound variables
let biteSound, needleSound, shockSound, gasSound, backgroundMusic;

//level variables
let score = 0;
let life = 3;
let paused = true;
let trial = 1;
const trialTime = 20; 
let trialTimer = 20;

//grid variables
let squareSize = 64;
let squarePadding = 5;
let moveDist; 
let gridWidth = 5; 
let gridHeight = 5;
let grid = [];

//rat variables
let rat;
let ratTextures;
let hearts = [];
let heartOffset = 60; 
let heartPadding = 24;

//treat variables
let preCheese;
let cheese; 
const cheeseTime = 1;
let cheeseTimer = 0;

//needle variables
let preNeedles = [];
const maxNeedles = 5;
let needles = [];
let needleTime = 1;
let needleTimer = 0;
let needleShowTime = 4;
let needleDangerTime = 2;
let needleShowTimers = [];

//shock variables
let preShocks = [];
let shocks = [];
let shockTime = 3;
let shockTimer = 0;
let shockShowTime = 4;
let shockDangerTime = 2;
let shocksVisible = false;
let shockRowCol = false; //row = true : col = false;

//highscore variables
const prefix = "dms7827-";
const highscoreKey = prefix + "Highscore";
let  highscore = localStorage.getItem(highscoreKey);

//get the highscore
if(!highscore){
    localStorage.setItem(highscoreKey, 0);
    highscore = 0;
}

//sets up the game initially for the various stages 
function setup() {
	stage = app.stage;
    
	//Create the `start` scene
	startScene = new PIXI.Container();
    stage.addChild(startScene);
    
	//Create the main `game` scene and make it invisible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);
    
	//Create the `gameOver` scene and make it invisible
	gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);
    
	//Create labels for all 3 scenes
	createLabelsAndButtons();
    
    // Create Grid
    let moveDist = squareSize + squarePadding;
    let gridOffsetX = (sceneWidth / 2) - ((moveDist) * ((gridWidth - 1) / 2)); 
    let gridOffsetY = (sceneHeight / 2) - ((moveDist) * ((gridHeight - 1) / 2)); 
    for(let r = 0; r < gridWidth; r++){
        for(let c=0; c < gridHeight; c++){
            grid[(r*10) + c] = new GridSquare( gridOffsetX + (r * (moveDist)), gridOffsetY + (c * (moveDist)), r, c);
            gameScene.addChild(grid[(r * 10) + c])
        }
    }
    
    //Create Rat
    let gridSpace = Math.floor((gridWidth / 2)) * 11;
    rat = new AnimatedRat(grid[gridSpace].x, grid[gridSpace].y, 100, loadSpriteSheet());
    gameScene.addChild(rat);
    
    //Create Lives
    for(let h = 0; h < life; h++){
        hearts[h] = new Heart(lifeLabel.x + heartOffset + (heartPadding * h) , lifeLabel.y + 1, loadHeartSpriteSheet());
        gameScene.addChild(hearts[h]);
    }
    
    //setup cheese
    preCheese = new Treat(0,0);
    cheese = new Cheese(0,0);
    
    //setup needles
    for(let n = 0; n <maxNeedles; n++){
        preNeedles.push(new Danger(0,0));
        needles.push(new Needle(0,0));
        needleShowTimers.push(0);
    }
    
    //setup shocks
    for(let s = 0; s < gridWidth; s++){
        preShocks.push(new Danger(0,0));
        shocks.push(new Shock(0,0));
    }
    
    //setup sounds
    backgroundMusic = new Howl({
        src: ['sounds/Background.wav'],
        autoplay: true,
        loop: true,
        volume: 0.5,
    });
    biteSound = new Howl({
	   src: ['sounds/Bite.wav']
    });
    needleSound = new Howl({
        src: ['sounds/Needle.wav'],
        volume: 3,
    });
    shockSound = new Howl({
	   src: ['sounds/Shock.wav']
        
    });
    
    //Start the game
    spawnRandomTreat();
	app.ticker.add(gameLoop);
}

//create all the font and button objects
function createLabelsAndButtons(){
    
    //add backgrounds
    startScene.addChild(new Square(colors[2], sceneWidth / 2, sceneHeight / 2, sceneWidth));
    gameScene.addChild(new Square(colors[2], sceneWidth / 2, sceneHeight / 2, sceneWidth));
    gameOverScene.addChild(new Square(colors[2], sceneWidth / 2, sceneHeight / 2, sceneWidth));
    
    //START SCENE
    let buttonStyle = new PIXI.TextStyle({
        fill: colors[0],
        fontFamily: 'Primus-DEMO',
        fontSize: 36,
    });
    
    let startLabel1 = new PIXI.Text("Lab Rat");
    startLabel1.style = new PIXI.TextStyle({
        fill:  colors[0],
        fontSize: 64,
        fontFamily: 'Primus-DEMO',
        stroke:  colors[1],
        strokeThickness: 6
    });
    
    startLabel1.x = 50;
    startLabel1.y = 100;
    startScene.addChild(startLabel1);
    
    let startLabel2 = new PIXI.Text("Dane Sherman");
    startLabel2.style = new PIXI.TextStyle({
        fill: colors[0],
        fontSize: 24,
        fontFamily: 'Primus-DEMO',
        fontStyle: "italic",
        stroke: colors[1],
        strokeThickness: 6
    });
    startLabel2.x = 92;
    startLabel2.y = 175;
    startScene.addChild(startLabel2);
    
    let startButton = new PIXI.Text("Begin Experiment");
    startButton.style = buttonStyle;
    startButton.x = 20;
    startButton.y = sceneHeight - 100;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup", startGame);
    startButton.on("pointerover", e=>e.target.alpha = 0.7);
    startButton.on("pointerout", e=>e.currentTarget.alpha = 1.0);
    startScene.addChild(startButton)
    
    //GAME SCENE
    let textStyle = new PIXI.TextStyle({
        fill: colors[1],
        fontSize: 16,
        fontFamily: 'Primus-DEMO',
        stroke: colors[0],
        strokeThickness: 2
    });
    
    let lifeStyle = new PIXI.TextStyle({
        fill: colors[3],
        fontSize: 16,
        fontFamily: 'Primus-DEMO',
        stroke: colors[4],
        strokeThickness: 2
    });
    
    let trialStyle = new PIXI.TextStyle({
        fill: colors[1],
        fontSize: 24,
        fontFamily: 'Primus-DEMO',
        stroke: colors[0],
        strokeThickness: 2
    });
    
    scoreLabel = new PIXI.Text();
    scoreLabel.style = textStyle;
    scoreLabel.x = sceneWidth/2 + 35;
    scoreLabel.y = sceneHeight - 25;
    gameScene.addChild(scoreLabel);
    increaseScoreBy(0);
    
    lifeLabel = new PIXI.Text();
    lifeLabel.style = lifeStyle;
    lifeLabel.x = sceneWidth/2 - 150;
    lifeLabel.y = sceneHeight - 25;
    gameScene.addChild(lifeLabel);
    decreaseLifeBy(0);
    
    trialLabel = new PIXI.Text();
    trialLabel.style = trialStyle;
    trialLabel.x = sceneWidth/2;
    trialLabel.y = 2;
    trialLabel.text = "Trial " + 1;
    gameScene.addChild(trialLabel);
    
    trialCountdown = new PIXI.Text();
    trialCountdown.style = trialStyle;
    trialCountdown.x = sceneWidth/2 - 100;
    trialCountdown.y = 2;
    trialCountdown.text = trialTime;
    gameScene.addChild(trialCountdown);
    
    //GAME OVER SCENE
    let gameOverText = new PIXI.Text("Experiment\nTerminated");
    textStyle = new PIXI.TextStyle({
        fill: colors[1],
        fontSize: 48,
        fontFamily: 'Primus-DEMO',
        stroke: colors[0],
        strokeThickness: 6
    });
    gameOverText.style = textStyle;
    gameOverText.x = 40;
    gameOverText.y = sceneHeight/2 - 160;
    gameOverScene.addChild(gameOverText);
    
    let playAgainButton = new PIXI.Text("Redo Experiment");
    playAgainButton.style = buttonStyle;
    playAgainButton.x = 25;
    playAgainButton.y = sceneHeight - 100;
    playAgainButton.interactive = true;
    playAgainButton.buttonMode = true;
    playAgainButton.on("pointerup", startGame);
    playAgainButton.on("pointerover", e=>e.target.alpha = 0.7);
    playAgainButton.on("pointerout", e=>e.currentTarget.alpha = 1.0);
    gameOverScene.addChild(playAgainButton);
    
    textStyle = new PIXI.TextStyle({
        fill: colors[1],
        fontSize: 18,
        fontFamily: 'Primus-DEMO',
        stroke: colors[0],
        strokeThickness: 4
    });
    gameOverScoreLabel = new PIXI.Text();
    gameOverScoreLabel.style = textStyle;
    gameOverScoreLabel.x = 90;
    gameOverScoreLabel.y = sceneHeight / 2 + 25;
    gameOverScene.addChild(gameOverScoreLabel);
    
    gameOverHighScoreLabel = new PIXI.Text();
    gameOverHighScoreLabel.style = textStyle;
    gameOverHighScoreLabel.x = 110;
    gameOverHighScoreLabel.y = sceneHeight / 2 + 55
    gameOverScene.addChild(gameOverHighScoreLabel);
    
}

//set variables to default values and start the game
function startGame(){
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
    score = 0;
    life = 3;
    increaseScoreBy(0);
    decreaseLifeBy(0);
    loadLevel();
}

//increase the score
function increaseScoreBy(value){
    score += value;
    scoreLabel.text = 'Cheese ' + score;
}

//remove a heart
function decreaseLifeBy(value){
    life -= value;
    life = parseInt(life);
    lifeLabel.text = "Lives"; 
    if(life < 3){
        hearts[life].disolve();
    }
}

//increase the trial and ramp up the speed by 
function nextTrial(){
    trial++;
    trial = parseInt(trial);
    trialLabel.text = "Trial " + trial;
    
    let factor = 0.9;
    
    needleTime *= factor;
    needleDangerTime *= factor;
    needleShowTime *= factor;
    
    shockTime *= factor;
    shockShowTime *= factor;
    shockDangerTime *= factor;
    
    rat.speed *= 1.1;
    
    clearBoard();
}

//remove everything from the board except rat and cheese
function clearBoard(){
    //set all spaces to empty
    for(let r = 0; r < gridWidth; r++){
        for(let c=0; c < gridHeight; c++){
            grid[(r*10) + c].empty = true;
        }
    }
    //remove needles
    needleTimer = 0;
    for(let n = 0; n<maxNeedles; n++){
        grid[(needles[n].gridX * 10) + needles[n].gridY].empty = true;
        gameScene.removeChild(needles[n]);
        needles[n].isAlive = false;  
        grid[(preNeedles[n].gridX * 10) + preNeedles[n].gridY].empty = true;
        gameScene.removeChild(preNeedles[n]);
        preNeedles[n].isAlive = false;  
    }
    //remove shocks
    shockTimer = 0;
    for(let s = 0; s<shocks.length; s++){
        grid[(shocks[s].gridX * 10) + shocks[s].gridY].empty = true;
        gameScene.removeChild(shocks[s]);
        shocks[s].isAlive = false;  
        grid[(preShocks[s].gridX * 10) + preShocks[s].gridY].empty = true;
        gameScene.removeChild(preShocks[s]);
        preShocks[s].isAlive = false;  
    }
}


//main game loop 
function gameLoop(){
	if (paused) return; 
	
	//Calculate "delta time"
	let dt = 1/app.ticker.FPS;
    if (dt > 1/12) dt=1/12;	
      
    //Check Keys and move rat
        moveDist = squareSize + squarePadding;
		if(keys[keyboard.RIGHT] && rat.x != grid[(gridWidth-1) * 11].x){
			rat.moveTo(rat.x + moveDist, rat.y);
		}else if(keys[keyboard.LEFT] && rat.x != grid[0].x) {
			rat.moveTo(rat.x - moveDist, rat.y);
		}
		
		if(keys[keyboard.DOWN] && rat.y != grid[(gridHeight-1) * 11].y){
			rat.moveTo(rat.x, rat.y + moveDist);
		}else if(keys[keyboard.UP] && rat.y != grid[0].y) {
			rat.moveTo(rat.x, rat.y - moveDist);
		}
		rat.move(dt);
        
        //chesse spawning 
        if(cheese.isAlive && rectsIntersect(rat, cheese)){
            increaseScoreBy(trial);
            grid[(cheese.gridX * 10) + cheese.gridY].empty = true;
            gameScene.removeChild(cheese);
            cheese.isAlive = false;
            spawnRandomTreat();
            biteSound.play();
        }
        if(preCheese.isAlive){
            cheeseTimer += dt;
            if(cheeseTimer > cheeseTime){
                cheese.move(preCheese.x, preCheese.y)
                gameScene.addChild(cheese);
                preCheese.isAlive = false;
                gameScene.removeChild(preCheese);
                ratOnTop();
            }
        }else if(!cheese.isAlive){
            spawnRandomTreat();
        }
    
        //needle spawning
        needleTimer += dt;
        for(let n = 0; n < maxNeedles; n++){
            needleShowTimers[n] +=dt;
            if(needles[n].isAlive){
                if(rectsIntersect(rat, needles[n])){
                    decreaseLifeBy(1);
                    grid[(needles[n].gridX * 10) + needles[n].gridY].empty = true;
                    gameScene.removeChild(needles[n]);
                    needles[n].isAlive = false;  
                    needleSound.play();
                }else if(needleShowTimers[n] > needleShowTime){
                    grid[(needles[n].gridX * 10) + needles[n].gridY].empty = true;
                    gameScene.removeChild(needles[n]);
                    needles[n].isAlive = false;
                }
            }
            
            if(preNeedles[n].isAlive && needleShowTimers[n] > needleDangerTime){
                needles[n].move(preNeedles[n].x, preNeedles[n].y, preNeedles[n].gridX, preNeedles[n].gridY)
                gameScene.addChild(needles[n]);
                preNeedles[n].isAlive = false;
                gameScene.removeChild(preNeedles[n]);
                needleShowTimers[n] = 0;
                ratOnTop();
            }
        }
        if(needleTimer > needleTime){
            spawnRandomNeedle();
        }     
    
    //shockSpawning
    if(trial >= 2){
        shockTimer += dt;
        if(shocksVisible){
            for(let s = 0; s< shocks.length; s++){
                if(shocks[s].isAlive){
                    if(rectsIntersect(rat, shocks[s])){
                        decreaseLifeBy(1);
                        grid[(shocks[s].gridX * 10) + shocks[s].gridY].empty = true;
                        gameScene.removeChild(shocks[s]);
                        shocks[s].isAlive = false;
                        shockSound.play();
                    }
                }
                if(shockTimer > shockShowTime){
                    grid[(shocks[s].gridX * 10) + shocks[s].gridY].empty = true;
                    gameScene.removeChild(shocks[s]);
                    shocks[s].isAlive = false;
                }
            } 
            
            if(shockTimer > shockShowTime){
                shocksVisible = false;
                shockTimer = 0;
            }
        }else if(preShocks[0].isAlive && shockTimer > shockDangerTime){
            for(let s = 0; s < shocks.length; s++){
                shocks[s].move(preShocks[s].x, preShocks[s].y, preShocks[s].gridX, preShocks[s].gridY);
                gameScene.addChild(shocks[s]);
                preShocks[s].isAlive = false;
                gameScene.removeChild(preShocks[s]);
                ratOnTop();
                shocksVisible = true;
            }
            shockTimer = 0;
        }else if(!preShocks[0].isAlive && shockTimer > shockTime){
            spawnRandomShock();
        }
    }
    
    //trials incrementation and timing
    trialTimer -= dt;
    if(trialTimer < 0){
        nextTrial()
        trialTimer = trialTime;
    }
    trialCountdown.text = Math.ceil(trialTimer);
    
	//Check if game over?
	if (life <= 0){
	   end();
    }
}

//spawn a treat on a random grid space
function spawnRandomTreat(){
    if(!preCheese.isAlive){
        let sqr = getEmptySquare();
        if(sqr != null){
            preCheese.move(sqr.x, sqr.y, sqr.gridX, sqr.gridY);
            gameScene.addChild(preCheese); 
            ratOnTop();
        }
        cheeseTimer = 0;
    }   
}

//spawn a needle on a random grid space
function spawnRandomNeedle(){
    for(let n = 0; n < maxNeedles; n++){
        if(!(preNeedles[n].isAlive || needles[n].isAlive)){
            let sqr = getEmptySquare();
            if(sqr !=null){
                preNeedles[n].move(sqr.x, sqr.y, sqr.gridX, sqr.gridY);
                gameScene.addChild(preNeedles[n]); 
                ratOnTop();
                needleTimer = 0;
                needleShowTimers[n] = 0
                return;
            }   
        }
    }
}

//spawn a shock in a random grid row or col
function spawnRandomShock(){
    if(!(preShocks[0].isAlive || shocks[0].isAlive)){
        let sqrs;
        if(Math.random() < 0.5){
            sqrs = getEmptyRow();
            shockRowCol = true;
        }else{
            sqrs = getEmptyCol();
            shockRowCol = false;
        }
        
        if(sqrs != null){
            for(let s = 0; s < sqrs.length; s++){
                preShocks[s].move(sqrs[s].x, sqrs[s].y, sqrs[s].gridX, sqrs[s].gridY);
                gameScene.addChild(preShocks[s]);
            }
            
            ratOnTop();
            shockTimer = 0;
        }
    }
}

//find an empty grid space
function getEmptySquare(){
    let gridsquare;
    let tries = 0;
    do{
        let row = Math.floor(Math.random() * gridHeight);
        let col = Math.floor(Math.random() * gridWidth);
        gridsquare = grid[(row* 10) + col];
        tries++;
        if(tries>20){return null;}
    }while(!gridsquare.empty)
    gridsquare.empty = false;
    return gridsquare;
}

//find an empty grid row
function getEmptyRow(){
    let gridSquares = [];
    let tries = 0;
    let row = Math.floor(Math.random() * gridHeight);
    let emptyCols = 0;
    do{
        if(tries > gridHeight){return null;}
        row = (row + 1)%gridHeight; //check next row
        emptyCols = 0;
        for(let c = 0; c < gridWidth; c++){
            if(grid[(row * 10) + c].empty){
                emptyCols++; 
            }
        }
        
        tries++;        
    }while(emptyCols<gridHeight);
    for(let c = 0; c < gridWidth; c++){
        gridSquares.push(grid[(row * 10) + c])
        grid[(row * 10) + c].empty = false;
    }
    return gridSquares;
}

//find an empty grid col
function getEmptyCol(){
    let gridSquares = [];
    let tries = 0;
    let col = Math.floor(Math.random() * gridWidth);
    let emptyRows = 0;
    do{
        if(tries > gridWidth){return null;}
        col = (col + 1)%gridWidth; //check next col
        emptyRows = 0;
        for(let r = 0; r < gridHeight; r++){
            if(grid[(r * 10) + col].empty){
                emptyRows++; 
            }
        }
        
        tries++;        
    }while(emptyRows<gridWidth);
    for(let r = 0; r < gridHeight; r++){
        grid[(r * 10) + col].empty = false;
        gridSquares.push(grid[(r * 10) + col])
    }
    return gridSquares;
}

//make sure rat is drawn on top
function ratOnTop(){
    //place the rat first in draw order
    gameScene.removeChild(rat);
    gameScene.addChild(rat);
}

//reset the variables and clear level for reset
function loadLevel(){
	paused = false;
    
    for(let heart of hearts){
        heart.reset();
    }
    
    needleTime = 1;
    needleShowTime = 4;
    needleDangerTime = 2;

    shockTime = 3;
    shockShowTime = 4;
    shockDangerTime = 2;

    trial = 1;
    trialLabel.text = "Trial " + 1;
    
    trialTimer = trialTime;
    
    rat.speed = 100;
    clearBoard();
}

//load in the rat animation sprite sheet
function loadSpriteSheet(){
    let spriteSheet = PIXI.BaseTexture.fromImage("images/RatIdle.png");
    let width = 64;
    let height = 64;
    let numFrames = 4;
    let textures = [];
    for(let i = 0; i < numFrames; i++){
        let frame = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(i * width, 0, width, height));
        textures.push(frame);
    }
    return textures;
}

//load in the heartfade animation sprite sheet
function loadHeartSpriteSheet(){
    let spriteSheet = PIXI.BaseTexture.fromImage("images/HeartAnim.png");
    let width = 20;
    let height = 18;
    let numFrames = 4;
    let textures = [];
    for(let i = 0; i < numFrames; i++){
        let frame = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(i * width, 0, width, height));
        textures.push(frame);
    }
    return textures;
}

//display the game over screen and handle highscore
function end(){
    paused = true;
    
    gameOverScene.visible = true;
    gameScene.visible = false;
    
    gameOverScoreLabel.text = 'Cheese consumed: ' + score;
    
    if(score > highscore){
        highscore = score;
        localStorage.setItem(highscoreKey, highscore);
    }
    
    gameOverHighScoreLabel.text = 'Most Cheese: ' + highscore;
}