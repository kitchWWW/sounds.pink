var rectCounts = {}

var state = {
    enabled:[0],
    height:4,
    width:5,
    debug:false,
    smoothing:3,
    mappings:{"0-0":60},
}


function updateDisplayWithState() {
    document.getElementById("debugOn").checked = state.debug
    document.getElementById("smoothingSlider").value = state.smoothing
    for(var i = 0; i < allPoints.length;i++){
        document.getElementById("checkbox"+i).checked = state.enabled.includes(i)
    }
    document.getElementById("widthTextBox").value = state.width
    document.getElementById("heightTextBox").value = state.height
    drawActiveBoxes()
    for(var w = 0; w < state.width;w++ ){
        for(var h = 0; h < state.height;h++){
            var id = w+"-"+h
            document.getElementById("checkbox"+id).checked = id in state.mappings
            if(id in state.mappings){
                document.getElementById("midiNumb"+id).disabled = false
                document.getElementById("midiNumb"+id).value = state.mappings[id]                
            }else{
                document.getElementById("midiNumb"+id).value = ""
                document.getElementById("midiNumb"+id).disabled = true 
            }

        }
    }
}


function initState() {
	for(var i = 0; i < allPoints.length;i++){
	    var iDiv = document.createElement('div');
	    var myLabel = document.createElement('span');
	    
	    iDiv.id = 'activeMarkerDiv'+i;
	    // iDiv.className = 'block';
	    myLabel.innerHTML = " "+allPoints[i]
	    var checkbox = document.createElement('input');
	    checkbox.type = "checkbox";
	    checkbox.myIndex = i
	    checkbox.id = "checkbox"+i
	    checkbox.addEventListener('change', (event) => {
	        console.log(event.srcElement)
	        console.log(event.srcElement.myIndex)
	        var i = event.srcElement.myIndex
	          if (event.currentTarget.checked) {
	            console.log(i+' checked');
	            if(!state.enabled.includes(i)){
	                state.enabled.push(i)
	            }
	          } else {
	            console.log(i+' not checked');
	            var index = state.enabled.indexOf(i);
	            if (index !== -1) {
	              state.enabled.splice(index, 1);
	            }
	          }
	          stateHasBeenUpdated()
	        })
	    iDiv.appendChild(checkbox)
	    iDiv.appendChild(myLabel)
	    document.getElementById('bodyMarkerList').appendChild(iDiv);
	}
}



function drawActiveBoxes(){
    document.getElementById('boxesList').innerHTML = ""
    for(var w = 0; w < state.width;w++ ){
    for(var h = 0; h < state.height;h++){
        var id = w+"-"+h
        var iDiv = document.createElement('div');
        var myLabel = document.createElement('span');
        myLabel.classList.add("labelArea")
        myLabel.innerHTML = id
        iDiv.id = 'box-'+id;

        var checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.myIndex = id
        checkbox.id = "checkbox"+id
        checkbox.addEventListener('change', (event) => {
            var id = event.srcElement.myIndex
            if(event.srcElement.checked){
                state.mappings[id] = newCandidateNumber(id)
            }else{
                delete state.mappings[id]
            }
            state.mappings[id]
            stateHasBeenUpdated()
        })

        var inputField = document.createElement("INPUT");
        inputField.setAttribute("type", "text");
        inputField.myIndex = id
        inputField.id="midiNumb"+id

        inputField.addEventListener('change', (event) => {
            
            var newVal = parseInt(event.srcElement.value)
            console.log(newVal)
            if(newVal > 128){
                newVal = newCandidateNumber(id)
            }
            if(newVal < 0){
                newVal = newCandidateNumber(id)
            }
            state.mappings[event.srcElement.myIndex] = newVal
            stateHasBeenUpdated()
        })
        iDiv.appendChild(checkbox)
        iDiv.appendChild(myLabel)
        iDiv.appendChild(inputField)
        document.getElementById('boxesList').appendChild(iDiv);
    }
}
}

drawActiveBoxes()

function newCandidateNumber(id){
    var l = id.split("-")
    var w = parseInt(l[0])
    var h = parseInt(l[1])
    var startingPoint = 60
    if(state.width * state.height > 67){
        startingPoint = 127 - (state.width * state.height)
    }
    if(startingPoint < 0){
        startingPoint = 1
    }
    return startingPoint + (w * state.height) + h
}



function addToRectCount(point, newRectCounts){
    if(Object.keys(newRectCounts).length < state.width * state.height){
        for(var w = 0; w < state.width;w++ ){
            for(var h = 0; h < state.height;h++){
                newRectCounts[w+"-"+h] = 0
        }}
    }
    var w = Math.floor(point.x * state.width)
    var h = Math.floor(point.y * state.height)
    newRectCounts[w+"-"+h] += 1
}
var oldRectCounts = {}



function processRectCounts(newRectCounts){
    for(var w = 0; w < state.width;w++ ){
        for(var h = 0; h < state.height;h++){
            if((w+"-"+h in state.mappings)){
                if(newRectCounts[w+"-"+h] > 0 && oldRectCounts[w+"-"+h] == 0){
                    // send a note on!!!!
                    sendNoteOn(w+"-"+h)
                }
                if(newRectCounts[w+"-"+h] == 0 && oldRectCounts[w+"-"+h] > 0){
                    // send a note off!!!!
                    sendNoteOff(w+"-"+h)
                }
            }
        }
    }
    return newRectCounts
}

document.getElementById("heightTextBox").onchange = (event) => {
    state.height = keepValid(parseInt(event.currentTarget.value),1,20,4)
    stateHasBeenUpdated()
}
document.getElementById("widthTextBox").onchange = (event) => {
    state.width = keepValid(parseInt(event.currentTarget.value),1,20,5)
    stateHasBeenUpdated()
}

function sendNoteOn(id) {
	sendToMidi([0x90, state.mappings[id], 0x7f])
}
function sendNoteOff(id){
	sendToMidi([0x80, state.mappings[id], 0])
}


function doWholeSpecificFunction(){
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    for(var w = 0; w < state.width;w++ ){
        for(var h = 0; h < state.height;h++){
            canvasCtx.beginPath();
            var wunit = canvasElement.width / state.width
            var hunit = canvasElement.height / state.height
            if(state.debug){
                canvasCtx.lineWidth = 3;
                canvasCtx.strokeStyle = "black";
                canvasCtx.fillStyle = "rgba(0, 0, 200, 0)";
                canvasCtx.strokeRect(w*wunit, h*hunit, wunit, hunit);

                if(w+"-"+h in state.mappings){
                    canvasCtx.fillStyle = "rgba(0, 0, 200, 0.1)";
                    canvasCtx.rect(w*wunit, h*hunit, wunit, hunit);
                    canvasCtx.fill();
                }
            }
            if(oldRectCounts[w+"-"+h] > 0 && w+"-"+h in state.mappings){
                canvasCtx.fillStyle = "rgba(0, 250, 0, 0.2)";
                canvasCtx.rect(w*wunit, h*hunit, wunit, hunit);
                canvasCtx.fill();
            }
        }
    }
    canvasCtx.lineWidth = 3;
    canvasCtx.strokeStyle = "black";

    var newRectCounts = {}

    if(result.landmarks.length > 0){
        var landmark = result.landmarks[0]
        landmark = smoothLandmark(landmark)
        for(var i = 0; i < allPoints.length; i++){
            var px1 = normalizedToPixelCoordinates(
                    landmark[i].x,
                    landmark[i].y,
                    canvasElement.width,
                    canvasElement.height)
            canvasCtx.beginPath();
            canvasCtx.rect(px1[0]-10, px1[1]-10, 20, 20);
            if(state.enabled.includes(i)){
                canvasCtx.fillStyle = "black";
                addToRectCount(landmark[i], newRectCounts)
            }else{
                canvasCtx.fillStyle = "rgba(0, 0, 200, 0)";;
            }
            if(state.debug){
                canvasCtx.strokeRect(px1[0]-10, px1[1]-10, 20, 20);
            }
            canvasCtx.fill();
        }
        if(state.debug){
            console.log(newRectCounts)
        }
        oldRectCounts = processRectCounts(newRectCounts)
    }
    canvasCtx.restore();
}
