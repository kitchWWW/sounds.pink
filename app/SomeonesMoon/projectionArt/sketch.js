// ========================================== CLASSES ========================================================
class planet {

  constructor(x, y) {
    this.userID = "";
    this.moonCount = 0;
    this.planetRadius = 50;
    this.chaos = new Chaos(x, y, this.planetRadius);
    if (typeof(x) === 'number') {
      this.sun = null;
      this.x = x;
      this.y = y;
      this.stationary = true;
      this.orbitRadius = 50000; // random large number;
    } else {
      var sun = x;
      sun.moonCount += 1;
      this.stationary = false;
      this.sun = sun;
      if (sun.stationary) {
        this.orbitRadius = ((windowHeight / 2) * Math.random()) + (windowHeight / 6);
      } else {
        this.orbitRadius = ((sun.orbitRadius / 3) * Math.random()) + (sun.orbitRadius / 4)
      }
      this.orbitAngle = Math.random() * Math.PI * 2;
      this.x = this.sun.x + ((Math.sin(this.orbitAngle) * this.orbitRadius));
      this.y = this.sun.y + ((Math.cos(this.orbitAngle) * this.orbitRadius));
    }
  }
  nudge() {
    if (!this.stationary) {
      // do some math
      this.orbitAngle += (1 / this.orbitRadius) * (deltaTime / desiredFrameRate) * 1;
      this.x = this.sun.x + ((Math.sin(this.orbitAngle) * this.orbitRadius));
      this.y = this.sun.y + ((Math.cos(this.orbitAngle) * this.orbitRadius));
      this.chaos.relocate(this.x, this.y, this.planetRadius);
    }
    // this.chaos.nudge()
  }

  draw() {
    if (CURRENT_SECTION == SECTION_ORBITS || CURRENT_SECTION == SECTION_QR_CODE) {
      stroke(255);
      noFill();
      if (!this.stationary) {
        circle(this.sun.x, this.sun.y, this.orbitRadius * 2)
      }
      // this.chaos.draw();
      fill(255);
      circle(this.x, this.y, 10);
    }else if(CURRENT_SECTION == SECTION_TRACES){
      var strokeWeightToUse = 0;
      if(this.userID in users && users[this.userID]['avg-motion-alpha'] > 1){
        console.log("yo");
        strokeWeightToUse = Math.min(255,users[this.userID]['avg-motion-alpha'])
        console.log(strokeWeightToUse);
        stroke(strokeWeightToUse);
        point(this.x,this.y);
        point(this.x+1,this.y);
        point(this.x,this.y+1);
        point(this.x+1,this.y+1);
      }
    }
  }
}

class Chaos {
  constructor(x, y, rad) {
    this.x = x;
    this.y = y;
    this.rad = rad;
    this.moveItMoveIt();
    this.offset = Math.random() * 100;
    this.increment = Math.random() > .5 ? .08 : -.08;
    this.steps = 10;
  }
  relocate(x, y, rad) {
    this.x = x;
    this.y = y;
    this.rad = rad;
  }

  moveItMoveIt() {
    this.noize = [];
    for (var i = 0; i < this.steps * 4; i++) {
      this.noize.push(Math.random() * 100);
    }
  }
  nudge() {
    this.offset += this.increment * (deltaTime / desiredFrameRate);
  }
  draw() {
    this.xa = [];
    this.ya = [];
    for (var i = 0; i < this.steps; i++) {
      var angle = noise(this.noize[i * 4] + this.offset, this.noize[i * 4 + 1] + this.offset) * Math.PI * 2;
      var rad = this.rad * Math.sqrt(noise(this.noize[i * 4 + 2] + this.offset, this.noize[i * 4 + 3] + this.offset));
      this.xa.push(Math.cos(angle) * rad);
      this.ya.push(Math.sin(angle) * rad);
    }
    stroke(0);
    noFill();
    for (var i = 0; i < this.steps - 3; i++) {
      curve(
        this.xa[i + 0] + this.x,
        this.ya[i + 0] + this.y,
        this.xa[i + 1] + this.x,
        this.ya[i + 1] + this.y,
        this.xa[i + 2] + this.x,
        this.ya[i + 2] + this.y,
        this.xa[i + 3] + this.x,
        this.ya[i + 3] + this.y);
    }
  }
}


// ========================================== CONSTANTS ========================================================

var planets = []
var planetsThatNeedIDs = []
var users = {}
var img;
var qrCode;
var sun
var desiredFrameRate = 24;
var MARKED_FOR_REPLACEMENT = "MARKED_FOR_REPLACEMENT"

var SECTION_ORBITS = "SECTION_ORBITS"
var SECTION_TRACES = "SECTION_TRACES"
var SECTION_QR_CODE = "SECTION_QR_CODE"

var CURRENT_SECTION = SECTION_QR_CODE

// ========================================== FUNCTIONS ========================================================

function preload() {
  img = loadImage('./res/stars.png');
  qrCode = loadImage('./res/qrcode.png');
}

function httpGetAsync(theUrl, callback) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function() {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
      callback(xmlHttp.responseText);
  }
  xmlHttp.open("GET", theUrl, true); // true for asynchronous 
  xmlHttp.send(null);
}


function doVisualsUpdateWithUsers() {
  // for (u in users) {
  //   // do something related to something I'm sure
  // }
}

function doNewUserThings(userID) {
  // console.log(planets);
  if(planetsThatNeedIDs.length > 0){
    console.log("doing the new planet replace")
    var newMoon = planetsThatNeedIDs.shift();
    newMoon.userID = userID;
    return;
  }
  var newMoon
  if (planets.length < 4) {
    newMoon = new planet(sun);
  } else {
    var randomPlanet = planets[Math.floor(Math.random() * planets.length)];
    while (randomPlanet.orbitRadius < 50 || (randomPlanet.moonCount > 3 && !randomPlanet.stationary)) {
      randomPlanet = planets[Math.floor(Math.random() * planets.length)];
    }
    newMoon = new planet(randomPlanet)
  }
  planets.push(newMoon);
  newMoon.userID = userID
}

function doRemoveUserThings(planet){
  planet.userID = MARKED_FOR_REPLACEMENT
  console.log("doing the planet removal");
  planetsThatNeedIDs.push(planet)
  console.log(planetsThatNeedIDs);
}


function getUpdatedUsers() {
  httpGetAsync("/SomeonesMoon/responses.json", (response) => {
    console.log("got a response!");
    // console.log(response);
    var newUsers = JSON.parse(response);
    for (var i = 1; i< planets.length; i++){
      p = planets[i];
      if((!(p.userID in newUsers)) && (p.userID != MARKED_FOR_REPLACEMENT) && (p.stationary == false)){
        doRemoveUserThings(p);
      }
    }
    for (u in newUsers) {
      if (!(u in users)) {
        doNewUserThings(u);
      }
      users[u] = newUsers[u];
    }
    doVisualsUpdateWithUsers();
  })
}

function getUpdatedContext() {
  httpGetAsync("/SomeonesMoon/context.json", (response) => {
    console.log("got a CONTEXT response!");
    console.log(response);
    var context = JSON.parse(response)
    if(context['section'] != CURRENT_SECTION){
      setSection(context['section'])
    }
  })
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function setup() {
  frameRate(desiredFrameRate);
  createCanvas(windowWidth, windowHeight);

  sun = new planet(windowWidth / 2, windowHeight / 2, 50);
  planets.push(sun);

  setInterval(getUpdatedUsers, 200);
  // setInterval(getUpdatedContext, 2000);

}

function setSection(section){
  console.log(section)
  CURRENT_SECTION = section;
  if(CURRENT_SECTION == SECTION_TRACES){
    image(img, 0, 0, windowWidth, windowHeight);
  }
}


function draw() {
  // background(255);
  if (CURRENT_SECTION == SECTION_ORBITS) {
    image(img, 0, 0, windowWidth, windowHeight);
    // skip sun
    for (var i = 1; i < planets.length; i++) {
      var p = planets[i];
      p.nudge()
      p.draw();
    }
  } else if (CURRENT_SECTION === SECTION_TRACES) {
    for (var i = 1; i < planets.length; i++) {
      var p = planets[i];
      p.nudge()
      p.draw();
    }
  } else if (CURRENT_SECTION === SECTION_QR_CODE) {
    image(img, 0, 0, windowWidth, windowHeight);
    // skip sun
    for (var i = 1; i < planets.length; i++) {
      var p = planets[i];
      p.nudge()
      p.draw();
    }    
    var heightToUse = windowHeight/1.5
    var xOffset = ((windowWidth - heightToUse) / 2.0);
    image(qrCode, xOffset, (windowHeight-heightToUse)/2.0, heightToUse, heightToUse);
  } else {
    image(img, 0, 0, windowWidth, windowHeight);
    console.log("BAD SECTION!!!!");
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


// ========================================== STUFF YOU RUN ON STARTUP ========================================================



window.onclick = function(event) {
  setSection(SECTION_TRACES)
}











