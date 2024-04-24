class Scene2 extends Phaser.Scene {
  constructor() {
    super("playGame");
  }

  create() {
    // Initial Asset creation...
    this.background = this.add.tileSprite(
      0,
      0,
      config.width,
      config.height,
      "background"
    );
    this.background.setOrigin(0, 0);

    // Existing coin creation...
    this.coin = this.add.sprite(
      config.width / 2 - 50,
      config.height / 2,
      "coin"
    );
    // Additional coin creation...
    this.coin2 = this.add.sprite(
      config.width / 2 - 50,
      config.height / 2,
      "coin"
    );
    this.coin3 = this.add.sprite(
      config.width / 2 - 50,
      config.height / 2,
      "coin"
    );
    this.coin4 = this.add.sprite(
      config.width / 2 - 50,
      config.height / 2,
      "coin"
    );
    this.coin5 = this.add.sprite(
      config.width / 2 - 50,
      config.height / 2,
      "coin"
    );
    this.coin6 = this.add.sprite(
      config.width / 2 - 50,
      config.height / 2,
      "coin"
    );

    this.coinGroup = this.physics.add.group();
    this.coinGroup.add(this.coin);
    // Additional coins added to the group...
    this.coinGroup.add(this.coin2);
    this.coinGroup.add(this.coin3);
    this.coinGroup.add(this.coin4);
    this.coinGroup.add(this.coin5);
    this.coinGroup.add(this.coin6);

    // Coin interactivity...
    this.coin.setInteractive();
    this.coin2.setInteractive();
    this.coin3.setInteractive();
    this.coin4.setInteractive();
    this.coin5.setInteractive();
    this.coin6.setInteractive();

    this.physics.world.setBoundsCollision();
    this.monsterGroup = this.physics.add.group();

    //Initialize Enemies and their movement
    for (var i = 0; i < gameSettings.maxMonsters; i++) {
      var monster = this.physics.add.image(16, 16, "monster");
      this.monsterGroup.add(monster);
      monster.setRandomPosition(0, 0, game.config.width, game.config.height);
      monster.setVelocity(gameSettings.monsterVel, gameSettings.monsterVel);
      monster.setCollideWorldBounds(true);
      monster.setBounce(1);
    }
    
    // Player Movement and restrictions...
    this.player = this.physics.add.sprite(
      config.width / 2 - 8,
      config.height - 64,
      "player"
    );
    this.cursorKeys = this.input.keyboard.createCursorKeys();
    this.player.setCollideWorldBounds(true);

    // Overlaps...
    this.physics.add.overlap(
      this.player,
      this.monsterGroup,
      this.hitMonster,
      null,
      this
    );
    this.physics.add.overlap(
      this.player,
      this.coinGroup,
      this.coinPickUp,
      null,
      this
    );

    // Graphics...
    var graphics = this.add.graphics();
    graphics.fillStyle(0x000000, 1);
    graphics.beginPath();
    graphics.moveTo(0, 0);
    graphics.lineTo(config.width, 0);
    graphics.lineTo(config.width, 20);
    graphics.lineTo(0, 20);
    graphics.lineTo(0, 0);
    graphics.closePath();
    graphics.fillPath();

    // Scoreboard initialization...
    this.score = 0;
    var scoreFormated = this.zeroPad(this.score, 6);
    this.scoreLabel = this.add.bitmapText(
      10,
      5,
      "pixelFont",
      "SCORE " + scoreFormated,
      16
    );

    // Sound configuration...
    this.pickupSound = this.sound.add("audio_pickup");
    this.music = this.sound.add("music");
    this.damageSound = this.sound.add("audio_damage");
    this.powerUpSound = this.sound.add("powerUpSound");

    var musicConfig = {
      mute: false,
      volume: 0.1,
      rate: 1,
      detune: 0,
      seek: 0,
      loop: false,
      delay: 0,
    };
    this.music.play(musicConfig);

    // Power-up related variables...
    this.powerUpCount = 0;
    this.powerUpSpawnTimer = this.time.addEvent({
      delay: 10000, // 10 seconds
      loop: true,
      callback: this.spawnPowerUp,
      callbackScope: this,
    });
  }

  // Function to spawn power-up
  spawnPowerUp() {
    var powerUp = this.physics.add.image(
      Phaser.Math.Between(0, config.width),
      0,
      "powerUp"
    );
    powerUp.setScale(4);
    powerUp.setVelocityY(100);
    powerUp.setCollideWorldBounds(true);
    powerUp.setBounce(1);
    this.physics.add.overlap(
      this.player,
      powerUp,
      this.collectPowerUp,
      null,
      this
    );
  }

  // Function to handle power-up collection
  collectPowerUp(player, powerUp) {
    powerUp.destroy(); 
    this.powerUpCount++;
    this.powerUpSound.play();

    if (this.powerUpCount >= 1) {
      this.score *= 10;
      this.powerUpCount = 0;

      var powerUpText = this.add.bitmapText(
        config.width / 2,
        config.height / 2,
        "pixelFont",
        "Score x10",
        32
      );
      powerUpText.setOrigin(0.5);
      powerUpText.setTint(0x000000);

      // Deactivate the text after 3 seconds
      this.time.delayedCall(
        3000,
        function () {
          powerUpText.destroy();
        },
        [],
        this
      );
    }

    // Update score label
    var scoreFormated = this.zeroPad(this.score, 6);
    this.scoreLabel.text = "SCORE " + scoreFormated;
  }

  // Interaction when player hits a monster
  hitMonster(player, monster) {
    this.resetCoinPos(monster);
    if (this.player.alpha < 1) {
      return;
    }
    this.damageSound.play();
    player.disableBody(true, true);
    this.time.addEvent({
      delay: 1000,
      callback: this.resetPlayer,
      callbackScope: this,
      loop: false,
    });
    this.score = 0;
    var scoreFormated = this.zeroPad(this.score, 6);
    this.scoreLabel.text = "SCORE " + scoreFormated;
  }

  // Interaction when player hits a coin
  coinPickUp(player, coin) {
    this.resetCoinPos(coin);
    this.score += 15;
    var scoreFormated = this.zeroPad(this.score, 6);
    this.scoreLabel.text = "SCORE " + scoreFormated;
    this.pickupSound.play();
  }

  // Resets the player when they hit an enemy
  resetPlayer() {
    var x = config.width / 2 - 8;
    var y = config.height + 64;
    this.player.enableBody(true, x, y, true, true);

    this.player.alpha = 0.5;

    var tween = this.tweens.add({
      targets: this.player,
      y: config.height - 64,
      ease: "Power1",
      duration: 1500,
      repeat: 0,
      onComplete: function () {
        this.player.alpha = 1;
      },
      callbackScope: this,
    });
  }

  // Score number formating
  zeroPad(number, size) {
    var stringNumber = String(number);
    while (stringNumber.length < (size || 2)) {
      stringNumber = "0" + stringNumber;
    }
    return stringNumber;
  }

  // Update screen showing movements
  update() {
    this.moveCoin(this.coin, 1);
    this.moveCoin(this.coin2, 2);
    this.moveCoin(this.coin3, 3);
    this.moveCoin(this.coin4, 4);
    this.moveCoin(this.coin5, 2);
    this.moveCoin(this.coin6, 1);
    this.background.tilePositionY -= 0.5;
    this.movePlayerManager();
  }

  // Rules for player movement
  movePlayerManager() {
    this.player.setVelocity(0);
    if (this.cursorKeys.left.isDown) {
      this.player.setVelocityX(-gameSettings.playerSpeed);
    } else if (this.cursorKeys.right.isDown) {
      this.player.setVelocityX(gameSettings.playerSpeed);
    }

    if (this.cursorKeys.up.isDown) {
      this.player.setVelocityY(-gameSettings.playerSpeed);
    } else if (this.cursorKeys.down.isDown) {
      this.player.setVelocityY(gameSettings.playerSpeed);
    }
  }

  // Creates the movements of coins down the screen
  moveCoin(coin, speed) {
    coin.y += speed;
    if (coin.y > config.height) {
      this.resetCoinPos(coin);
    }
  }

  // Resets coins at top of screen
  resetCoinPos(coin) {
    coin.y = 0;
    var randomX = Phaser.Math.Between(0, config.width);
    coin.x = randomX;
  }
}
