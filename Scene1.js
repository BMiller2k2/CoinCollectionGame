class Scene1 extends Phaser.Scene {
  
  constructor() {
    super("bootGame");
  }
    preload(){
      //Grabs the user location using their web browser
      function getUserLocation() {
        return new Promise((resolve, reject) => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              position => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                resolve({ latitude, longitude });
              },
              error => {
                reject(error);
              }
            );
          } else {
            reject(new Error("Geolocation is not supported by this browser."));
          }
        });
      }
      //Grabs the temperature using an API key, based on the location provided by getUserLocation()
      function fetchTemperature(latitude, longitude) {
        return new Promise((resolve, reject) => {
          const apiKey = "5c7f96f9f8484cb4ba1203818242404";
          const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${latitude},${longitude}`;
      
          fetch(url)
            .then(response => {
              if (!response.ok) {
                throw new Error("Failed to fetch weather data.");
              }
              return response.json();
            })
            .then(data => {
              const temperature = data.current.temp_f;
              resolve(temperature);
            })
            .catch(error => {
              reject(error);
            });
        });
      }

      //runs getUserLocation and fetchTemperature to get the temperature
      getUserLocation().then(location => {
        return fetchTemperature(location.latitude, location.longitude);
      })

      //Determines what version of the game will be played based on the temperature. If its above 70F then the desert
      //version is run, below 70F runs the ocean variation.
      .then(temperature => {
        if(temperature >= 70){
          this.load.image("background", "assets/images/Desert.png");
          this.load.image("monster", "assets/images/crow.png");
          this.load.image("player", "assets/images/drone.png");
          this.load.audio("music", "assets/sounds/desertmusic.mp3");
        }else{
          this.load.image("background", "assets/images/underwater.jpg");
          this.load.image("monster", "assets/images/monster.png");
          this.load.image("player", "assets/images/player.webp");
          this.load.audio("music", "assets/sounds/oceanmusic.mp3");
        }
      });

    //asset preload
    this.load.image("coin", "assets/images/coin.png");
    
    //Sound/bitmap preload
    this.load.bitmapFont("pixelFont", "assets/font/font.png", "assets/font/font.xml");
    this.load.audio("audio_damage", "assets/sounds/damage.mp3");
    this.load.audio("audio_pickup", ["assets/sounds/pickup.ogg", "assets/sounds/pickup.mp3"]); 
  }

  create() {
    this.add.text(20, 20, "Loading game...");
    this.scene.start("playGame");
  }
}
