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


function updateXY(event) {
  var alpha = event.alpha.toFixed(2);
  var beta = event.beta.toFixed(2);
  var gamma = event.gamma.toFixed(2);
  document.getElementById('alphaValue').innerHTML = alpha
  document.getElementById('betaValue').innerHTML = beta
  document.getElementById('gammaValue').innerHTML = gamma
  response = postData('/dance', {
    id: CUSTOM_CODE,
    pos: {
      alpha,
      beta,
      gamma,
    },
    raw: event
  })
  console.log(response)
  updateCustomCodeDisplay();
}


var CUSTOM_CODE = getUrlVars()['code']
function updateCustomCodeDisplay(){
  document.getElementById('customCode').innerHTML = CUSTOM_CODE
}

function doRequest(){
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
    DeviceMotionEvent.requestPermission()
      .then(permissionState => {
        if (permissionState === 'granted') {
          // window.addEventListener('devicemotion', $scope.updateXY, true);
          window.addEventListener("deviceorientation", updateXY, true);
        }
      })
      .catch(console.error);
  } else {
    window.addEventListener("deviceorientation", updateXY, true);
  }
  document.getElementById('alphaValue').innerHTML = "waiting..."
  document.getElementById('betaValue').innerHTML = "waiting..."
  document.getElementById('gammaValue').innerHTML = "waiting..."
  document.getElementById('startButton').innerHTML = "started."
}



window.onclick = function() {
  var noSleep = new NoSleep();
  noSleep.enable()

}