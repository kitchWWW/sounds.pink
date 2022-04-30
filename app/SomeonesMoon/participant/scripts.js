function radians_to_degrees(radians)
{
  var pi = Math.PI;
  return radians * (180/pi);
}
function find_angle(A,B,C) {
    var AB = Math.sqrt(Math.pow(B.x-A.x,2)+ Math.pow(B.y-A.y,2));    
    var BC = Math.sqrt(Math.pow(B.x-C.x,2)+ Math.pow(B.y-C.y,2)); 
    var AC = Math.sqrt(Math.pow(C.x-A.x,2)+ Math.pow(C.y-A.y,2));
    return radians_to_degrees(Math.acos((BC*BC+AB*AB-AC*AC)/(2*BC*AB)));
}

function find_slope(A,B){
  return find_angle({x:A.x-5,y:A.y},A,B)
}

function scale(x, inmin, inmax, outmin, outmax) {
  if (x < inmin) {
    x = inmin
  }
  if (x > inmax) {
    x = inmax
  }
  var indiff = inmax - inmin
  var outdiff = outmax - outmin
  var scale = outdiff / indiff
  var xscaleable = x - inmin
  return outmin + (xscaleable * scale)
}


// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
PoseNet using p5.js
=== */
/* eslint-disable */

// Grab elements, create settings, etc.
var video = document.getElementById("video");
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
ctx.translate(640, 0);
ctx.scale(-1, 1);

// The detected positions will be inside an array
let poses = [];

// Create a webcam capture
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia({
    video: true
  }).then(function(stream) {
    video.srcObject = stream;
    video.play();
  });
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
const poseNet = ml5.poseNet(video, modelReady);
poseNet.on("pose", gotPoses);

// A function that gets called every time there's an update from the model
function gotPoses(results) {
  poses = results;
}

function modelReady() {
  console.log("model ready");
  poseNet.multiPose(video);
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  // Loop through all the poses detected
  if(poses.length > 0){
    pose = poses[0].pose
    // targets.time = scale(pose.nose.x, 0, 640, 0, .9)
    // targets.feedback = scale(pose.nose.y, 0, 480, 0, .9)
    rightArmOpen = find_angle(pose.rightShoulder,pose.rightElbow, pose.rightWrist)
    leftArmOpen = find_angle(pose.leftShoulder,pose.leftElbow, pose.leftWrist)
    rightArmUp = find_angle(pose.rightHip,pose.rightShoulder, pose.rightWrist)
    leftArmUp = find_angle(pose.leftHip,pose.leftShoulder, pose.leftWrist)
    headAngle = find_slope(pose.rightEar,pose.leftEar)

    lfoGain.gain.setValueAtTime(scale(rightArmOpen, 0, 180, 0, 300), 0)
    lfo.frequency.setValueAtTime(scale(leftArmOpen, 0, 180, 0, 20), 0);
    osc.frequency.setValueAtTime(scale(leftArmUp, 0, 180, 150, 700), 0)
    var filterFreq = scale(rightArmUp, 0, 180, 2, 140)
    var filterQ = scale(headAngle, 0, 180, 0, 5)

    biquadFilter.frequency.setValueAtTime(filterFreq*filterFreq, 0)
    biquadFilter.Q.setValueAtTime(filterQ*filterQ, 0)

    for (let j = 0; j < pose.keypoints.length; j += 1) {
      let keypoint = pose.keypoints[j];
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        ctx.beginPath();
        ctx.arc(keypoint.position.x, keypoint.position.y, 10, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }
  }
}










// ##### BIT FROM THE WEB AUDIO THING

var AudioContext = window.AudioContext ||
  window.webkitAudioContext;

const context = new AudioContext();
const masterVolume = context.createGain();
masterVolume.connect(context.destination);
masterVolume.gain.setValueAtTime(0.2, 0);

const osc = context.createOscillator();
const noteGain = context.createGain();
const lfo = context.createOscillator();
const lfoGain = context.createGain();

const lfo2 = context.createOscillator();
const lfo2Gain = context.createGain();

const biquadFilter = context.createBiquadFilter();

biquadFilter.frequency.value = 300;
biquadFilter.Q.value = 10


function go() {
  lfo.frequency.setValueAtTime(200, 0);
  lfo.connect(lfoGain);
  lfo.start(0);
  
  lfoGain.gain.setValueAtTime(200, 0)
  lfoGain.connect(osc.frequency)
  
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(220, 0);
  osc.start(0);
  /* osc.stop(context.currentTime + 1) */;
  osc.connect(biquadFilter);
  biquadFilter.connect(noteGain)
  noteGain.connect(masterVolume);
}






