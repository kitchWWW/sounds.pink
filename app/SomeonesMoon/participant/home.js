
function httpGetAsync(theUrl, callback) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function() {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
      callback(xmlHttp.responseText);
  }
  xmlHttp.open("GET", theUrl, true); // true for asynchronous 
  xmlHttp.send(null);
}


var SECTION_ORBITS = "SECTION_ORBITS"
var SECTION_TRACES = "SECTION_TRACES"
var SECTION_QR_CODE = "SECTION_QR_CODE"

var CURRENT_SECTION = SECTION_ORBITS

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

function revisedRandId() {
     return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 20);
}

var allAverages = {}
function runningAVG(field,val){
	if(field in allAverages){
		allAverages[field].push(Math.abs(val));
		var sum = allAverages[field].reduce((a, b) => a + b, 0);
		var avg = (sum / allAverages[field].length) || 0;
		if(allAverages[field].length > 15){
			allAverages[field].shift()
		}
		return avg;

	
	}else{
		allAverages[field] = [val]
		return val;
	}
}

var uniqueID = revisedRandId()

var dataToSend = {}
dataToSend['uniqueID'] = uniqueID;


var whiteNoise = new Pizzicato.Sound(function(e) {

    var output = e.outputBuffer.getChannelData(0);
    for (var i = 0; i < e.outputBuffer.length; i++)
        output[i] = Math.random();
});

function scale(input) {
	if (input < 0) {
		input = -input
	}
	if (input > 180) {
		input = input - 180
	}
	if (input > 90) {
		input = 90 - (input - 90)
	}
	return input / 90
}

function logScale(input) {
	return scale(input) * scale(input)
}

var violin = new Pizzicato.Sound({
	source: 'file',
	options: {
		path: './violinSoloNorm.mp3',
		loop: false
	}
}, function() {
	console.log('sound file loaded!');
});

var myAudioDelay = new Pizzicato.Effects.Delay({
	feedback: 0.0,
	time: Math.random(),
	mix: 0,
});

var lowPassFilter = new Pizzicato.Effects.LowPassFilter({
	frequency: 20000,
	peak: 10
});

var highPassFilter = new Pizzicato.Effects.HighPassFilter({
	frequency: 1,
	peak: 10
});


// var lowPassFilterSecond = new Pizzicato.Effects.LowPassFilter({
// 	frequency: 20000,
// 	peak: 10
// });





whiteNoise.addEffect(lowPassFilter);
whiteNoise.addEffect(highPassFilter);
violin.addEffect(myAudioDelay);
// violin.addEffect(lowPassFilterSecond);

var FILTER = "filter"
var DELAY = "delay"

var NOT_PLAYING = "NOT_PLAYING"
var NOISE = "NOISE"
var VIOLIN = "VIOLIN"



var app = angular.module('myApp', []);
app.controller('myCtrl', function($scope, $timeout) {
	$scope.onColor = '#7D8491';
	$scope.offColor = '#4CAF50'
	$scope.playOnColor = '#7DD1F4'

	$scope.alpha = 0;
	$scope.beta = 0;
	$scope.gamma = 0;
	$scope.alphaDisplay = 0;
	$scope.betaDisplay = 0;
	$scope.gammaDisplay = 0;

	$scope.playing = false

	$scope.myAudioDelay = myAudioDelay
	$scope.lowPassFilter = lowPassFilter
	$scope.highPassFilter = highPassFilter
	$scope.whiteNoise = whiteNoise
	
	// $scope.lowPassFilterSecond = lowPassFilterSecond

	$scope.effectStatus = {}
	$scope.effectStatus[DELAY] = false
	$scope.effectStatus[FILTER] = false

	$scope.updateAudioMotion = function(event) {
		console.log("update");
		console.log(event);
		var alpha = event.rotationRate.alpha;
		var beta = event.rotationRate.beta;
		var gamma = event.rotationRate.gamma;
		$scope.$apply(function() {
			$scope.whiteNoise.volume = 1;
			$scope.alpha = scale(alpha).toFixed(2);
			$scope.beta = scale(beta).toFixed(2);
			$scope.gamma = scale(gamma).toFixed(2);
			// dataToSend["motion-alpha"] = alpha;
			// dataToSend["motion-beta"] = beta;
			// dataToSend["motion-gamma"] = gamma;
			dataToSend["avg-motion-alpha"] = runningAVG("motion-alpha",alpha);
			dataToSend["avg-motion-beta"] = runningAVG("motion-beta",beta);
			dataToSend["avg-motion-gamma"] = runningAVG("motion-gamma",gamma);
			$scope.lowPassFilter.frequency = (logScale(alpha)) * 10000 + 5;
			$scope.highPassFilter.frequency = $scope.lowPassFilter.frequency * .9 + ((logScale(beta)) * 10000);
			$scope.lowPassFilter.peak = scale(gamma) * 20;
			$scope.highPassFilter.peak = scale(gamma) * 20;
			if($scope.playState == NOISE){
				$scope.alphaDisplay = (scale(alpha) * 90).toFixed(0);
				$scope.betaDisplay = (scale(beta) * 90).toFixed(0);
				$scope.gammaDisplay = (scale(gamma) * 90).toFixed(0);				
			}
		})
	}

	$scope.updateAudioOrientation = function(event) {
		console.log("update");
		console.log(event);
		var alpha = event.alpha;
		var beta = event.beta;
		var gamma = event.gamma;
		// dataToSend["orientation-alpha"] = alpha;
		// dataToSend["orientation-beta"] = beta;
		// dataToSend["orientation-gamma"] = gamma;
		$scope.$apply(function() {
			$scope.myAudioDelay.feedback = (scale(event.alpha) / 1.3334) + .25;
			$scope.myAudioDelay.time = scale(event.beta);
			$scope.myAudioDelay.mix = scale(event.gamma);

			if($scope.playState == VIOLIN){
				$scope.alphaDisplay = (scale(alpha) * 90).toFixed(0);
				$scope.betaDisplay = (scale(beta) * 90).toFixed(0);
				$scope.gammaDisplay = (scale(gamma) * 90).toFixed(0);				
			}
		})
	}

			


	$scope.hasPlayedBefore = false
	$scope.onClickPlay = function() {
		if (!$scope.hasPlayedBefore) {
			console.log("adding orientation callback")
			if (typeof DeviceMotionEvent.requestPermission === 'function') {
				console.log("yo1");
				DeviceMotionEvent.requestPermission()
					.then(permissionState => {
						console.log("yo2");
						if (permissionState === 'granted') {
							window.addEventListener("devicemotion", $scope.updateAudioMotion, true);
							window.addEventListener("deviceorientation", $scope.updateAudioOrientation, true);
						}
					})
					.catch(console.error);
			} else {
				console.log("yo3");
				window.addEventListener("devicemotion", $scope.updateAudioMotion, true);
				window.addEventListener("deviceorientation", $scope.updateAudioOrientation, true);
			}
			$scope.hasPlayedBefore = true;
		}
	}


	$scope.playState = NOT_PLAYING;
	$scope.buttonLabel = "press to start..."
	$scope.onClickSection = function(argument) {
		if($scope.playState === NOT_PLAYING){
			if(!$scope.hasPlayedBefore){
				$scope.onClickPlay()
			}
			// hit play
			// start the noise bit
			$scope.playState = NOISE
			whiteNoise.volume = 0;
			whiteNoise.play(1)
			$scope.buttonLabel = "its going!"
			$timeout(()=>{
				$scope.buttonLabel = "press for next..."
			}, 4000)
		}
		else if ($scope.playState === NOISE){
			// stop the noise
			whiteNoise.stop(1)
			violin.play()
			// start the violin
			$scope.playState = VIOLIN
			$scope.buttonLabel = "its going!"
		}else if ($scope.playState === VIOLIN){
			// // stop violin
			// violin.stop()
			// $scope.playState = NOT_PLAYING			
			// $scope.buttonLabel = "press to start..."
		}
	}
});



window.onclick = function() {
	let context = Pizzicato.context
	let source = context.createBufferSource()
	source.buffer = context.createBuffer(1, 1, 22050)
	source.connect(context.destination)
	source.start()

	var noSleep = new NoSleep();
	noSleep.enable()

	setInterval(function(){ 
		// send the update on your device orientation data once a second;
		var xhr = new XMLHttpRequest();
			xhr.open("POST", "/someonesMoonPost", true);
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.send(JSON.stringify(dataToSend));
	 }, 200);

	// setInterval(getUpdatedContext, 2000);
}





