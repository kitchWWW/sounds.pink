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
var isFirstRun = true

function updateCustomCodeDisplay() {
  document.getElementById('customCode').innerHTML = CUSTOM_CODE
}

// window.onclick = function() {
//   var noSleep = new NoSleep();
//   noSleep.enable()
// }

function processFingerCurl(curlStr) {
  if (curlStr == 'No Curl') {
    return 0
  }
  if (curlStr == 'Half Curl') {
    return 64
  }
  if (curlStr == 'Full Curl') {
    return 127
  }
}

function processFingerDirection(curlStr) {
  if (curlStr == 'Vertical Down') {
    return 0
  }
  if (curlStr == 'Diagonal Down Left') {
    return 18
  }
  if (curlStr == 'Horizontal Left') {
    return 36
  }
  if (curlStr == 'Diagonal Up Left') {
    return 54
  }
  if (curlStr == 'Vertical Up') {
    return 72
  }
  if (curlStr == 'Diagonal Up Right') {
    return 90
  }
  if (curlStr == 'Horizontal Right') {
    return 108
  }
  if (curlStr == 'Diagonal Down Right') {
    return 127
  }
}

// *********************************** STUFF FROM THEM
const config = {
  video: {
    width: 640,
    height: 480,
    fps: 30
  }
};

const landmarkColors = {
  thumb: 'red',
  indexFinger: 'blue',
  middleFinger: 'yellow',
  ringFinger: 'green',
  pinky: 'orange',
  palmBase: 'white'
};

const gestureStrings = {
  'thumbs_up': 't',
  'victory': 'v'
};

async function main() {
  const video = document.querySelector("#pose-video");
  const canvas = document.querySelector("#pose-canvas");
  const ctx = canvas.getContext("2d");
  const resultLayer = document.querySelector("#pose-result");
  // configure gesture estimator
  const knownGestures = [
    // pass on these for now
    // fp.Gestures.VictoryGesture,
    // fp.Gestures.ThumbsUpGesture
  ];
  const GE = new fp.GestureEstimator(knownGestures);
  // load handpose model
  const model = await handpose.load();
  console.log("Handpose model loaded");

  // main estimation loop
  const estimateHands = async () => {
    if (isFirstRun) {
      document.getElementById('customCode').innerHTML = '[waiting for hand...]'
      isFirstRun = false
    }

    // clear canvas overlay
    ctx.clearRect(0, 0, config.video.width, config.video.height);
    resultLayer.innerText = '';

    // get hand landmarks from video
    // Note: Handpose currently only detects one hand at a time
    // Therefore the maximum number of predictions is 1
    const predictions = await model.estimateHands(video, true);

    for (let i = 0; i < predictions.length; i++) {

      // draw colored dots at each predicted joint position
      for (let part in predictions[i].annotations) {
        for (let point of predictions[i].annotations[part]) {
          drawPoint(ctx, point[0], point[1], 3, landmarkColors[part]);
        }
      }
      // console.log("predictions")
      // console.log(predictions)
      // now estimate gestures based on landmarks
      // using a minimum confidence of 7.5 (out of 10)
      const est = GE.estimate(predictions[i].landmarks, 7.5);
      // console.log("estimates")
      // console.log(est);
      if (est.gestures.length > 0) {
        // find gesture with highest confidence
        let result = est.gestures.reduce((p, c) => {
          return (p.confidence > c.confidence) ? p : c;
        });
        resultLayer.innerText = gestureStrings[result.name];
      }

      // ******************* AND NOW MY CODE

      posData = est.poseData
      pos = {}
      for (i = 0; i < posData.length; i++) {
        pos[posData[i][0] + 'Curl'] = processFingerCurl(posData[i][1])
        pos[posData[i][0] + 'Dir'] = processFingerDirection(posData[i][2])
      }
      console.log(pos)
      response = postData('/dance', {
        id: CUSTOM_CODE,
        pos,
        raw: predictions
      })
      updateCustomCodeDisplay();
    }

    // ...and so on
    setTimeout(() => {
      estimateHands();
    }, 1000 / config.video.fps);
  };



  // ******************* Back to their code


  estimateHands();
  console.log("Starting predictions");
}

async function initCamera(width, height, fps) {
  var videoConstraints = {
    width: width,
    height: height,
    frameRate: {
      max: fps
    }
  }
  if (myPreferredCameraDeviceId != null) {
    var videoConstraints = {
      deviceId: myPreferredCameraDeviceId,
      width: width,
      height: height,
      frameRate: {
        max: fps
      }
    }

  }
  const constraints = {
    audio: false,
    video: videoConstraints
  };

  const video = document.querySelector("#pose-video");
  video.width = width;
  video.height = height;

  // get video stream
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  video.srcObject = stream;

  return new Promise(resolve => {
    video.onloadedmetadata = () => {
      resolve(video)
    };
  });
}

function drawPoint(ctx, x, y, r, color) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}


function doBigInit() {
  initCamera(
    config.video.width, config.video.height, config.video.fps
  ).then(video => {
    video.play();
    video.addEventListener("loadeddata", event => {
      console.log("Camera is ready");
      main();
    });
  });
  const canvas = document.querySelector("#pose-canvas");
  canvas.width = config.video.width;
  canvas.height = config.video.height;
  console.log("Canvas initialized");
}

window.addEventListener("DOMContentLoaded", () => {
  doBigInit();
});


var myPreferredCameraDeviceId = null
function updateSelectedCamera(event) {
  var select = document.getElementById('videoSource')
  myPreferredCameraDeviceId = select.options[select.selectedIndex].value
  console.log(myPreferredCameraDeviceId)
  doBigInit()
}


navigator.mediaDevices.enumerateDevices().then(function(devices) {
  for (var i = 0; i < devices.length; i++) {
    var device = devices[i];
    if (device.kind === 'videoinput') {
      var option = document.createElement('option');
      option.value = device.deviceId;
      option.text = device.label || 'camera ' + (i + 1);
      document.getElementById('videoSource').appendChild(option);
    }
  };
});