function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
    vars[key] = value;
  });
  return vars;
}

var sineWave = new Pizzicato.Sound({
  source: 'wave',
  options: {
    frequency: 880
  }
});

function playBeep(ms) {
  sineWave.play();
  window.setTimeout(function() {
    sineWave.stop();
  }, ms)
}


var currentRecordingToSave = 0;
var currentRecordingForPlayback = null;

function listenToRecording() {
  currentRecordingForPlayback = new Pizzicato.Sound('recordings_all/s' + currentRecordingToSave + '_Anon', function() {
    console.log("got it!")
    currentRecordingForPlayback.play()
  })
}

function rerecord() {
  document.getElementById("listenToPast").style.display = "none";
  if (currentRecordingForPlayback != null) {
    currentRecordingForPlayback.stop();
  }
  startRecordProcess();
  document.getElementById("finishedRecording").style.display = "none";
}

function submit() {
  postData('/teleNew', {
    id: currentRecordingToSave
  })
  window.location.href = '/otherProjects/tele/history.html?clipToUse=' + currentRecordingToSave
}

function startRecordProcess() {
  document.getElementById("instructions").innerHTML = "start in ";
  document.getElementById("countdownDisplay").innerHTML = "3";
  playBeep(100);
  window.setTimeout(function() {
    countdownUpdate(2, true, startActiveRecord);
  }, 1000); // play the ten second recording
}

function countdownUpdate(next, beep, followUpFunction) {
  if (next > 0) {
    if(beep){
      playBeep(100);
    }
    document.getElementById("countdownDisplay").innerHTML = next;
    window.setTimeout(function() {
      countdownUpdate(next - 1, beep, followUpFunction)
    }, 1000); // play the ten second recording
  } else {
    followUpFunction()
  }
}

function startActiveRecord() {
  playBeep(200);
  window.setTimeout(function() {
    startRecording();
    document.getElementById("instructions").innerHTML = "Go! you've got ";
    document.getElementById("countdownDisplay").innerHTML = "10";
    window.setTimeout(function() {
      countdownUpdate(9, false, endRecordingProcess)
    }, 1000, ); // play the ten second recording

  }, 210);
}

function endRecordingProcess() {
  playBeep(100);
  document.getElementById("instructions").innerHTML = "";
  document.getElementById("countdownDisplay").innerHTML = "";
  stopRecording();
  document.getElementById("finishedRecording").style.display = "block";
}
async function startRecording() {
  recorder = await recordAudio();
  recorder.start();
}
async function stopRecording() {
  await recorder.stop();
}
const recordAudio = () => {
  return new Promise(resolve => {
    navigator.mediaDevices.getUserMedia({
        audio: true
      })
      .then(stream => {
        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks = [];
        mediaRecorder.addEventListener("dataavailable", event => {
          audioChunks.push(event.data);
        });
        const start = () => {
          mediaRecorder.start();
        };
        const play = () => {
          mediaRecorder.play();
        }
        const stop = () => {
          return new Promise(resolve => {
            mediaRecorder.addEventListener("stop", () => {
              const audioBlob = new Blob(audioChunks);
              var fd = new FormData();
              fd.append('fname', 'test.wav');
              fd.append('upload', audioBlob);
              sendFDtoServer(fd);
              resolve({
                audioBlob,
              });
            });
            mediaRecorder.stop();
          });
        };
        resolve({
          start,
          stop
        });
      });
  });
};

function sendFDtoServer(fd) {
  var url = "/teleUpload";
  var request = new XMLHttpRequest();
  request.open('POST', url, true);
  request.onload = function() { // request successful
    // we can use server response to our request now
    currentRecordingToSave = request.responseText.replace('s', '')
    currentRecordingToSave = currentRecordingToSave.replace('_Anon', '')
    currentRecordingToSave = parseInt(currentRecordingToSave)
    console.log(request.responseText);
    if (request.responseText.includes("Request Entity Too Large")) {
      alert("Warning: file too large.");
    }
  };
  request.onerror = function() {
    console.log("whoops!")
  };
  request.send(fd); // create FormData from form that triggered event
}
// the stupid junk you have to do to get pizz audio to work on mobile.
window.onclick = function() {
  let context = Pizzicato.context
  let source = context.createBufferSource()
  source.buffer = context.createBuffer(1, 1, 22050)
  source.connect(context.destination)
  source.start()
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