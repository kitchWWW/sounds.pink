// This is all the stuff related to the EMOTION screen


function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
    vars[key] = value;
  });
  return vars;
}

async function postData(url = '', data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *client
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  return await response.json(); // parses JSON response into native JavaScript objects
}



var CUSTOM_CODE = getUrlVars()['code']

function updateCustomCodeDisplay(resizedDetections) {
  document.getElementById('customCode').innerHTML = CUSTOM_CODE
  var emotions = ['neutral', 'angry', 'surprised', 'sad', 'happy', 'fearful', 'disgusted']
  var indexofMaxEmotion = 0
  for (var i = 0; i < 7; i++) {
    if (resizedDetections[0]['expressions'][emotions[i]] >
      resizedDetections[0]['expressions'][emotions[indexofMaxEmotion]]) {
      indexofMaxEmotion = i
    }
  }
  for (var i = 0; i < 7; i++) {
    console.log(emotions[i])
    var domEmotion = document.getElementById(emotions[i])
    domEmotion.innerHTML = (resizedDetections[0]['expressions'][emotions[i]] * 100).toFixed(2)
    if (i == indexofMaxEmotion) {
      domEmotion.style.backgroundColor = "pink"
    } else {
      domEmotion.style.backgroundColor = "white"
    }
  }

}


console.log("hello!");


const video = document.getElementById("video");
let predictedAges = [];

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceExpressionNet.loadFromUri("/models"),
  faceapi.nets.ageGenderNet.loadFromUri("/models")
]).then(startVideo);

function startVideo() {
  navigator.getUserMedia({
      video: {}
    },
    stream => (video.srcObject = stream),
    err => console.error(err)
  );
}

video.addEventListener("playing", () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);

  const displaySize = {
    width: video.width,
    height: video.height
  };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    // console.log(resizedDetections);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    console.log(resizedDetections);

    var posToSend = resizedDetections[0]['expressions']
    posToSend['raw'] = resizedDetections[0]

    if (resizedDetections.length > 0) {
      postData('/dance', {
        id: CUSTOM_CODE,
        pos: posToSend
      })
      updateCustomCodeDisplay(resizedDetections);
    }
  }, 50);
});

function interpolateAgePredictions(age) {
  predictedAges = [age].concat(predictedAges).slice(0, 30);
  const avgPredictedAge =
    predictedAges.reduce((total, a) => total + a) / predictedAges.length;
  return avgPredictedAge;
}