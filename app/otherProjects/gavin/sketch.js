var SMOTHING = .5
var HEIGHT_OF_TOP_BAR = 30;

var ogVidWidth = 100;
var ogVidHeight = 100;

let video;
let poseNet;
let pose;
let skeleton;
let sineWave;

function setup() {
  console.log(windowWidth);
  var cnv = createCanvas(windowWidth, windowHeight - HEIGHT_OF_TOP_BAR);
  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);
}

function preload() {
  // preload images;
}

// B is center point
function find_angle(A, B, C) {
  var AB = Math.sqrt(Math.pow(B[0] - A[0], 2) + Math.pow(B[1] - A[1], 2));
  var BC = Math.sqrt(Math.pow(B[0] - C[0], 2) + Math.pow(B[1] - C[1], 2));
  var AC = Math.sqrt(Math.pow(C[0] - A[0], 2) + Math.pow(C[1] - A[1], 2));
  return Math.abs(Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB)) * (180 / Math.PI));
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

function gotPoses(poses) {
  //console.log(poses);
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
  }
}

function modelLoaded() {
  console.log('poseNet ready');
}

let previouslyAbove = null;
guitar_len = 700;
rwx = 1;
rwy = 1;
lwy = 1;
lwx = 1;

function draw() {
  background(255);
  ogVidWidth = video.width;
  ogVidHeight = video.height;
  var porportionW = windowWidth / ogVidWidth
  var porportionH = (windowHeight - HEIGHT_OF_TOP_BAR) / ogVidHeight
  porportionToUse = Math.min(porportionW, porportionH)

  if (porportionToUse == porportionH) {  
    translate(windowWidth - (windowWidth - ogVidWidth) / 2, 0);
    scale(-1.0, 1.0);
  } else {
    translate(windowWidth, 0);
    scale(-1.0, 1.0);
  }

  scale(porportionToUse);
  image(video, 0, 0);

  // strokeWeight(10); // Beastly
  // line(ogVidWidth * .1, ogVidHeight * .1, ogVidWidth * .1, ogVidHeight * .9);
  // line(ogVidWidth * .1, ogVidHeight * .9, ogVidWidth * .9, ogVidHeight * .9);
  pts_sm = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  if (pose) {
    points_raw = [
      pose.leftWrist.x,
      pose.leftWrist.y,
      pose.rightWrist.x,
      pose.rightWrist.y,
      pose.leftElbow.x,
      pose.leftElbow.y,
      pose.rightElbow.x,
      pose.rightElbow.y,
      pose.leftShoulder.x,
      pose.leftShoulder.y,
      pose.rightShoulder.x,
      pose.rightShoulder.y,
      pose.leftHip.x,
      pose.leftHip.y,
      pose.rightHip.x,
      pose.rightHip.y,
    ]

    for (var i = 0; i < points_raw.length; i++) {
      pts_sm[i] = points_raw[i] //(pts_sm[i]* (1 - SMOTHING)) + (points_raw[i] * SMOTHING)
    }


    circle(pose.nose.x, pose.nose.y, 20);

    circle(pts_sm[0], pts_sm[1], 20); // left wrist
    circle(pts_sm[2], pts_sm[3], 20);

    circle(pts_sm[4], pts_sm[5], 20); // left elbow
    circle(pts_sm[6], pts_sm[7], 20);

    circle(pts_sm[8], pts_sm[9], 20); // left shoulder
    circle(pts_sm[10], pts_sm[11], 20);

    circle(pts_sm[12], pts_sm[13], 20); // left hip
    circle(pts_sm[14], pts_sm[15], 20);

    left_elbow_angle = find_angle(
      [pts_sm[0], pts_sm[1]], [pts_sm[4], pts_sm[5]], [pts_sm[8], pts_sm[9]]);
    right_elbow_angle = find_angle(
      [pts_sm[2], pts_sm[3]], [pts_sm[6], pts_sm[7]], [pts_sm[10], pts_sm[11]]);

    left_arm_angle = find_angle(
      [pts_sm[0], pts_sm[1]], [pts_sm[8], pts_sm[9]], [pts_sm[12], pts_sm[13]]);
    right_arm_angle = find_angle(
      [pts_sm[2], pts_sm[3]], [pts_sm[10], pts_sm[11]], [pts_sm[14], pts_sm[15]]);
    console.log("yeep");
    console.log(left_elbow_angle);
    console.log(right_elbow_angle);
    console.log(left_arm_angle);
    console.log(right_arm_angle);

    postData('/dance',{
      id:'2',
      left_elbow_angle:left_elbow_angle,
      right_elbow_angle:right_elbow_angle,
      left_arm_angle:left_arm_angle,
      right_arm_angle:right_arm_angle,
    })


  }
}

function noteToFreq(note) {
  let a = 440; //frequency of A (coomon value is 440Hz)
  return (a / 32) * (2 ** ((note - 9) / 12));
}