const RECTSIZE = 5

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



// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
PoseNet using p5.js
=== */

var CUSTOM_CODE = getUrlVars()['code']

function updateCustomCodeDisplay() {
  document.getElementById('customCode').innerHTML = CUSTOM_CODE
}


// Grab elements, create settings, etc.
var video = document.getElementById('video');
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

// The detected positions will be inside an array
let poses = [];

// Create a webcam capture

var myPreferredCameraDeviceId = null

function updateUserMedia() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    constraints = {
      video: true
    }
    if (myPreferredCameraDeviceId != null) {
      constraints = {
        video: {
          deviceId: myPreferredCameraDeviceId
        }
      }
    }
    navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: myPreferredCameraDeviceId
      }
    }).then(function(stream) {
      video.srcObject = stream;
      video.play();
      initPosenet()
    });
  }
}

updateUserMedia()

if (navigator.requestMIDIAccess) {
  console.log('This browser supports WebMIDI!');
} else {
  console.log('WebMIDI is not supported in this browser.');
}


WebMidi.enable(function(err) {
  console.log("once?")
  console.log(WebMidi.outputs)
});

function sendCC(chan, val, name) {
  try {
    WebMidi.outputs[0].sendControlChange(chan, Math.floor(val * 128.0))
  } catch (e) {
    console.log("sending midi data error")
    console.log(e)
  }
}

// A function to draw the video and poses into the canvas.
// This function is independent of the result of posenet
// This way the video will not seem slow if poseNet 
// is not detecting a position
function drawCameraIntoCanvas() {
  // Draw the video element into the canvas
  ctx.drawImage(video, 0, 0, 640, 480);
  // We can call both functions to draw all keypoints and the skeletons
  drawKeypoints();
  window.requestAnimationFrame(drawCameraIntoCanvas);
}
// Loop over the drawCameraIntoCanvas function
drawCameraIntoCanvas();

// Create a new poseNet method with a single detection
var poseNet;

function initPosenet() {
  poseNet = ml5.poseNet(video, modelReady);
  poseNet.on('pose', gotPoses);
}
initPosenet()

// A function that gets called every time there's an update from the model
function gotPoses(results) {
  poses = results;
}

function modelReady() {
  console.log("model ready")
  poseNet.multiPose(video)
}

function angleBetweenTwoPoints(a, b) {
  angleOfPoints = Math.atan((a.x - b.x) / (a.y - b.y)) * (180 / Math.PI) / 90;
  if (angleOfPoints > 0) {
    angleOfPoints = 1 - angleOfPoints
  } else {
    angleOfPoints = -1 * (1 + angleOfPoints)
  }
  angleOfPoints = (angleOfPoints) * 64 + 64
  return angleOfPoints
}

function angleBetweenThreePoints(A, B, C) {
  var AB = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
  var BC = Math.sqrt(Math.pow(B.x - C.x, 2) + Math.pow(B.y - C.y, 2));
  var AC = Math.sqrt(Math.pow(C.x - A.x, 2) + Math.pow(C.y - A.y, 2));
  return Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB)) * (180 / Math.PI) * (127 / 180.0);
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  // console.log(poses)
  if (poses.length > 0) {
    pose = poses[0].pose;
    pos = {}
    rawData = {}
    for (var i = 0; i < poses.length; i++) {
      keypoint1 = poses[i].pose.rightShoulder
      keypoint2 = poses[i].pose.leftShoulder

      console.log(poses[i])

      var keypoint = {
        x: (keypoint1.x + keypoint2.x) / 2,
        y: (keypoint1.y + keypoint2.y) / 2,
        confidence: Math.min(keypoint1.confidence, keypoint2.confidence)
      }

      pos["" + i+"x"] = keypoint.x
      pos["" + i+"y"] = keypoint.y
      rawData["" + i] = poses[i]
      ctx.strokeRect(keypoint.x - RECTSIZE, keypoint.y - RECTSIZE, RECTSIZE * 2, RECTSIZE * 2);
    }
    postData('/dance', {
      id: CUSTOM_CODE,
      pos: pos,
      raw: rawData
    })
    updateCustomCodeDisplay();
  }
}

function updateSelectedCamera(event) {
  var select = document.getElementById('videoSource')
  myPreferredCameraDeviceId = select.options[select.selectedIndex].value
  console.log(myPreferredCameraDeviceId)
  updateUserMedia()
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