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

  for (const [key, value] of Object.entries(allCCLabels)) {
    // console.log(`${key}: ${value}`);
    document.getElementById(key+"Label").innerHTML = value
  }

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
  console.log(WebMidi.outputs);
  var outs = WebMidi.outputs;
  var select = document.getElementById('outMode')
  for (var i = 0; i<outs.length; i++){
      var opt = document.createElement('option');
      opt.value = i;
      opt.innerHTML = outs[i].name;
      select.appendChild(opt);
  }
});

var allCCLabels = {}

function sendCC(chan, val, name) {
  try {
    if(outputMode != "web"){
      WebMidi.outputs[outputMode].sendControlChange(chan, Math.floor(val * 128.0))
      allCCLabels[chan] = name
    }
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
    // console.log(pose);
    angleOfHead = angleBetweenTwoPoints(pose.rightEye, pose.leftEye)
    sendCC(12, angleOfHead / 180.0, "angleOfHead")
    angleOfHead = Math.round(angleOfHead)

    angleOfTorso = angleBetweenTwoPoints(pose.rightShoulder, pose.leftShoulder)
    sendCC(13, angleOfTorso / 180.0, "angleOfTorso")
    angleOfTorso = Math.round(angleOfTorso)

    angleOfHips = angleBetweenTwoPoints(pose.rightHip, pose.leftHip)
    sendCC(14, angleOfHips / 180.0, "angleOfHips")
    angleOfHips = Math.round(angleOfHips)

    rightArmRaised = angleBetweenThreePoints(pose.rightWrist, pose.rightShoulder, pose.rightHip)
    sendCC(15, rightArmRaised / 180.0, "rightArmRaised")
    rightArmRaised = Math.round(rightArmRaised)

    leftArmRaised = angleBetweenThreePoints(pose.leftWrist, pose.leftShoulder, pose.leftHip)
    sendCC(16, leftArmRaised / 180.0, "leftArmRaised")
    leftArmRaised = Math.round(leftArmRaised)

    rightArmOpen = angleBetweenThreePoints(pose.rightWrist, pose.rightElbow, pose.rightShoulder)
    sendCC(17, rightArmOpen / 180.0, "rightArmOpen")
    rightArmOpen = Math.round(rightArmOpen)

    leftArmOpen = angleBetweenThreePoints(pose.leftWrist, pose.leftElbow, pose.leftShoulder)
    sendCC(18, leftArmOpen / 180.0, "leftArmOpen")
    leftArmOpen = Math.round(leftArmOpen)

    rightKneeOpen = angleBetweenThreePoints(pose.rightAnkle, pose.rightKnee, pose.rightHip)
    sendCC(19, rightKneeOpen / 180.0, "rightKneeOpen")
    rightKneeOpen = Math.round(rightKneeOpen)

    leftKneeOpen = angleBetweenThreePoints(pose.leftAnkle, pose.leftKnee, pose.leftHip)
    sendCC(20, leftKneeOpen / 180.0, "leftKneeOpen")
    leftKneeOpen = Math.round(leftKneeOpen)

    rightLegRaised = angleBetweenThreePoints(pose.rightAnkle, pose.rightHip, {
      'x': pose.rightHip.x,
      'y': pose.rightHip.y + 10
    })
    sendCC(21, rightLegRaised / 180.0, "rightLegRaised")
    rightLegRaised = Math.round(rightLegRaised)

    leftLegRaised = angleBetweenThreePoints(pose.leftAnkle, pose.leftHip, {
      'x': pose.leftHip.x,
      'y': pose.leftHip.y + 10
    })
    sendCC(22, leftLegRaised / 180.0, "leftLegRaised")
    leftLegRaised = Math.round(leftLegRaised)

    pos = {
      angleOfHead,
      angleOfTorso,
      angleOfHips,
      leftArmRaised,
      rightArmRaised,
      rightArmOpen,
      leftArmOpen,
      rightKneeOpen,
      leftKneeOpen,
      rightLegRaised,
      leftLegRaised
    }
    console.log(pos);
    rawData = {
      nose: pose.nose,
      leftEye: pose.leftEye,
      rightEye: pose.rightEye,
      leftEar: pose.leftEar,
      rightEar: pose.rightEar,
      leftShoulder: pose.leftShoulder,
      rightShoulder: pose.rightShoulder,
      leftElbow: pose.leftElbow,
      rightElbow: pose.rightElbow,
      leftWrist: pose.leftWrist,
      rightWrist: pose.rightWrist,
      leftHip: pose.leftHip,
      rightHip: pose.rightHip,
      leftKnee: pose.leftKnee,
      rightKnee: pose.rightKnee,
      leftAnkle: pose.leftAnkle,
      rightAnkle: pose.rightAnkle
    }
    if(outputMode== "web"){
      postData('/dance', {
        id: CUSTOM_CODE,
        pos: pos,
        raw: rawData
      })      
    }
    updateCustomCodeDisplay();
    // For each pose detected, loop through all the keypoints
    for (let j = 0; j < pose.keypoints.length; j++) {
      let keypoint = pose.keypoints[j];
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        ctx.strokeRect(keypoint.position.x - RECTSIZE, keypoint.position.y - RECTSIZE, RECTSIZE * 2, RECTSIZE * 2);
      }
    }
  }
}


function updateSelectedCamera(event) {
  var newCameraId = document.getElementById('videoSource').value
  myPreferredCameraDeviceId = newCameraId
  updateUserMedia()
}

var outputMode = 'web'
function updateOutMode(event) {
  var newCameraId = document.getElementById('outMode').value
  outputMode = newCameraId
  if(outputMode == 'web'){
    document.getElementById('midiOutDisplay').style.display="none"
  }else{    
    document.getElementById('midiOutDisplay').style.display="block"
  }
}
updateOutMode()

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
