let bgImage;
let bulletImg;
let explosionImg;

let player1 = {
  idle: {
    img: null,
    width: 70,
    height: 88,
    frames: 1
  },
  walk: {
    img: null,
    width: 323/4,
    height: 92,
    frames: 4
  },
  jump: {
    img: null,
    width: 576/7,
    height: 91,
    frames: 7
  },
  x: 500,
  y: 200,
  speedX: 10,
  speedY: 0,
  gravity: 0.8,
  jumpForce: -15,
  isJumping: false,
  groundY: 550,
  currentFrame: 0,
  currentAction: 'idle',
  direction: 1,
  bullets: [],
  health: 100,
  shootCooldown: 0,
  maxCooldown: 20,
  movingLeft: false,
  movingRight: false
};

let player2 = {
  idle: {
    img: null,
    width: 75,
    height: 80,
    frames: 1
  },
  walk: {
    img: null,
    width: 319/4,
    height: 82,
    frames: 4
  },
  jump: {
    img: null,
    width: 695/7,
    height: 93,
    frames: 7
  },
  x: 1000,
  y: 200,
  speedX: 10,
  speedY: 0,
  gravity: 0.8,
  jumpForce: -15,
  isJumping: false,
  groundY: 550,
  currentFrame: 0,
  currentAction: 'idle',
  direction: -1,
  bullets: [],
  health: 100,
  shootCooldown: 0,
  maxCooldown: 20,
  movingLeft: false,
  movingRight: false
};

class Bullet {
  constructor(x, y, direction, speed = 30) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.speed = speed;
    this.width = 50;
    this.height = 25;
    this.isExploding = false;
    this.explosionFrame = 0;
    this.maxExplosionFrames = 8;
  }

  update() {
    if (!this.isExploding) {
      this.x += this.speed * this.direction;
    } else {
      this.explosionFrame++;
    }
  }

  draw() {
    if (!this.isExploding) {
      push();
      translate(this.x, this.y);
      scale(this.direction, 1);
      image(bulletImg, 0, 0, this.width, this.height);
      pop();
    } else {
      image(explosionImg, 
            this.x - 25, this.y - 25, 
            50, 50);
    }
  }

  shouldRemove() {
    return this.x < 0 || 
           this.x > width || 
           (this.isExploding && this.explosionFrame >= this.maxExplosionFrames);
  }
}

function preload() {
  // 載入背景圖片
  bgImage = loadImage('background/forest.png');
  
  // 載入 player1 的圖片
  player1.idle.img = loadImage('player1/idle/idle.png');
  player1.walk.img = loadImage('player1/walk/walk.png');
  player1.jump.img = loadImage('player1/jump/jump.png');
  
  // 載入 player2 的圖片
  player2.idle.img = loadImage('player2/idle/idle.png');
  player2.walk.img = loadImage('player2/walk/walk.png');
  player2.jump.img = loadImage('player2/jump/jump.png');
  
  // 載入子彈和爆炸效果圖片
  bulletImg = loadImage('bullet.png');
  explosionImg = loadImage('explosion.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(20);
}

function draw() {
  // 繪製背景圖片
  image(bgImage, 0, 0, windowWidth, windowHeight);
  
  // 設定文字樣式
  textSize(50);
  textAlign(CENTER, TOP);
  textStyle(BOLD);
  fill(255);
  stroke(0);
  strokeWeight(4);
  
  // 繪製文字
  text('TKUET', windowWidth/2, 30);
  
  // 更新和繪製 player1
  updatePlayer(player1);
  drawPlayer(player1);
  
  // 更新和繪製 player2
  updatePlayer(player2);
  drawPlayer(player2);
  
  // 更新和繪製子彈
  updateAndDrawBullets(player1);
  updateAndDrawBullets(player2);
  
  // 更新冷卻時間
  if (player1.shootCooldown > 0) player1.shootCooldown--;
  if (player2.shootCooldown > 0) player2.shootCooldown--;
  
  // 繪製頂部血量條
  drawHealth();
  
  // 檢查碰撞
  checkCollisions();
}

function updatePlayer(player) {
  // 左右移動
  if (player.movingLeft) {
    player.x = player.x - player.speedX;
    player.direction = -1;
    if (!player.isJumping) {
      player.currentAction = 'walk';
    }
  }
  if (player.movingRight) {
    player.x = player.x + player.speedX;
    player.direction = 1;
    if (!player.isJumping) {
      player.currentAction = 'walk';
    }
  }

  // 限制在畫面內
  player.x = constrain(player.x, 50, windowWidth - 50);

  // 重力和跳躍
  player.y = player.y + player.speedY;
  player.speedY = player.speedY + player.gravity;

  // 地面碰撞
  if (player.y > player.groundY) {
    player.y = player.groundY;
    player.speedY = 0;
    player.isJumping = false;
    if (!player.movingLeft && !player.movingRight) {
      player.currentAction = 'idle';
    }
  }
}

function drawPlayer(player) {
  let currentAnim = player[player.currentAction];
  let sx = player.currentFrame * currentAnim.width;
  
  push();
  translate(player.x, player.y);
  scale(player.direction, 1);
  
  image(currentAnim.img, 
        0, 0,
        currentAnim.width, currentAnim.height,
        sx, 0,
        currentAnim.width, currentAnim.height);
  pop();
  
  // 更新動畫幀
  player.currentFrame = (player.currentFrame + 1) % currentAnim.frames;
  
  // 繪製頭頂血條
  drawHealthBar(player);
}

function drawHealthBar(player) {
  const barWidth = 100;
  const barHeight = 10;
  const x = player.x - barWidth/2;
  const y = player.y - player[player.currentAction].height - 20;
  
  // 背景
  fill(255, 0, 0);
  rect(x, y, barWidth, barHeight);
  
  // 血量
  fill(0, 255, 0);
  rect(x, y, barWidth * (player.health/100), barHeight);
}

function drawHealth() {
  // 玩家1生命值 (左側)
  fill(255, 0, 0);
  rect(10, 10, player1.health, 20);
  
  // 玩家2生命值 (右側)
  push();
  translate(width - 10, 10);
  rect(-player2.health, 0, player2.health, 20);
  pop();
}

function updateAndDrawBullets(player) {
  for (let i = player.bullets.length - 1; i >= 0; i--) {
    let bullet = player.bullets[i];
    bullet.update();
    bullet.draw();
    
    if (bullet.shouldRemove()) {
      player.bullets.splice(i, 1);
    }
  }
}

function shoot(player) {
  if (player.shootCooldown <= 0) {
    let bulletX = player.x + (player.direction > 0 ? 50 : -50);
    let bulletY = player.y - 0.5;
    player.bullets.push(new Bullet(bulletX, bulletY, player.direction));
    player.shootCooldown = player.maxCooldown;
  }
}

function keyPressed() {
  console.log("Key pressed:", key, keyCode); // 用來檢查按鍵是否被偵測到
  
  // 玩家1控制 (WASD)
  if (key === 'a' || key === 'A') {
    player1.movingLeft = true;
  }
  if (key === 'd' || key === 'D') {
    player1.movingRight = true;
  }
  if (key === 'w' || key === 'W') {
    if (!player1.isJumping) {
      player1.speedY = player1.jumpForce;
      player1.isJumping = true;
      player1.currentAction = 'jump';
    }
  }
  if (key === 'f' || key === 'F') {
    shoot(player1);
  }

  // 玩家2控制 (方向鍵)
  if (keyCode === LEFT_ARROW) {
    player2.movingLeft = true;
  }
  if (keyCode === RIGHT_ARROW) {
    player2.movingRight = true;
  }
  if (keyCode === UP_ARROW) {
    if (!player2.isJumping) {
      player2.speedY = player2.jumpForce;
      player2.isJumping = true;
      player2.currentAction = 'jump';
    }
  }
  if (keyCode === 32) { // 空白鍵
    shoot(player2);
  }
}

function keyReleased() {
  // 玩家1
  if (key === 'a' || key === 'A') {
    player1.movingLeft = false;
  }
  if (key === 'd' || key === 'D') {
    player1.movingRight = false;
  }

  // 玩家2
  if (keyCode === LEFT_ARROW) {
    player2.movingLeft = false;
  }
  if (keyCode === RIGHT_ARROW) {
    player2.movingRight = false;
  }

  // 如果玩家沒有移動且不在跳躍中，回到閒置狀態
  if (!player1.movingLeft && !player1.movingRight && !player1.isJumping) {
    player1.currentAction = 'idle';
  }
  if (!player2.movingLeft && !player2.movingRight && !player2.isJumping) {
    player2.currentAction = 'idle';
  }
}

function checkCollisions() {
  // 檢查玩家1的子彈是否擊中玩家2
  for (let bullet of player1.bullets) {
    if (!bullet.isExploding && checkBulletHit(bullet, player2)) {
      bullet.isExploding = true;
      player2.health = max(0, player2.health - 10);
    }
  }
  
  // 檢查玩家2的子彈是否擊中玩家1
  for (let bullet of player2.bullets) {
    if (!bullet.isExploding && checkBulletHit(bullet, player1)) {
      bullet.isExploding = true;
      player1.health = max(0, player1.health - 10);
    }
  }
}

function checkBulletHit(bullet, player) {
  let currentAnim = player[player.currentAction];
  return bullet.x > player.x - currentAnim.width/2 && 
         bullet.x < player.x + currentAnim.width/2 &&
         bullet.y > player.y - currentAnim.height &&
         bullet.y < player.y;
}

