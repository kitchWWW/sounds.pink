// TODOs


/*


*/


var colorParams = {
    "dark": {
        "grid": "#000000", // black
        "primaryOutline": "#000000", // black
        "accentColor1": "rgba(0, 0, 200, 0.1)", // blue
        "accentColor1_darker": "rgba(0, 0, 200, 0.4)", // blue
        "accentColor2": "rgba(0, 250, 0, 0.2)", // green
        "activityCircle": "#000000",
    },
    "light": {
        "grid": "#FFFFFF", // black
        "primaryOutline": "#FFFFFF", // black
        "accentColor1": "rgba(200, 0, 200, 0.1)", // purpleish
        "accentColor1_darker": "rgba(200, 0, 200, 0.4)", // purpleish
        "accentColor2": "rgba(0, 250, 0, 0.2)", // blue
        "activityCircle": "#000000",
    },
}

var allPoints = [
    "nose",
    "eye (inner) - L",
    "eye - L",
    "eye (outer) - L",
    "eye (inner) - R",
    "eye - R",
    "eye (outer) - R",
    "ear - L",
    "ear - R",
    "mouth - L",
    "mouth - R",
    "shoulder - L",
    "shoulder - R",
    "elbow - L",
    "elbow - R",
    "wrist - L",
    "wrist - R",
    "pinky - L",
    "pinky - R",
    "index - L",
    "index - R",
    "thumb - L",
    "thumb - R",
    "hip - L",
    "hip - R",
    "knee - L",
    "knee - R",
    "ankle - L",
    "ankle - R",
    "heel - L",
    "heel - R",
    "foot index  - L",
    "foot index - R"
]


var colorID = "dark"

document.getElementById("colorSelector").addEventListener("change", function() {
    colorID = document.getElementById("colorSelector").value
});

var rectCounts = {}

var currMidiCC = 16

function nextMidiCC() {
    const maxAngleCC = state.angles.reduce((max, item) => Math.max(max, item.cc), -Infinity);
    const maxActivityCC = state.activity.reduce((max, item) => Math.max(max, item.cc), -Infinity);
    const maxDistanceCC = state.dist.reduce((max, item) => Math.max(max, item.cc), -Infinity);
    const maxXYCC = state.xy.reduce((max, item) => Math.max(max, item.cc), -Infinity);
    var maxSoFar = Math.max(maxActivityCC, maxXYCC, maxDistanceCC, maxAngleCC, 15)
    return maxSoFar + 1
}

var state = {
    boxEnabled: [],
    height: 4,
    width: 5,
    smoothing: 3,
    mappings: {
    }, // for boxes
    angles: [],
    dist: [],
    xy:[],
    activity:[]
}


var pointLabelsToDo = [
    "nose",
    "ear - L",
    "ear - R",
    "shoulder - L",
    "shoulder - R",
    "elbow - L",
    "elbow - R",
    "wrist - L",
    "wrist - R",
    "hip - L",
    "hip - R",
    "knee - L",
    "knee - R",
    "ankle - L",
    "ankle - R",
]


function updateDisplayWithState() {
    document.getElementById("smoothingSlider").value = state.smoothing
    document.getElementById("widthTextBox").value = state.width
    document.getElementById("heightTextBox").value = state.height
    drawActiveBoxes()
     for (var i = 0; i < allPoints.length; i++) {
        if (pointLabelsToDo.includes(allPoints[i])) {
            document.getElementById("checkbox" + i).checked = state.boxEnabled.includes(i)
        }
    }

    for (var w = 0; w < state.width; w++) {
        for (var h = 0; h < state.height; h++) {
            var id = w + "-" + h
            document.getElementById("checkbox" + id).checked = id in state.mappings
            if (id in state.mappings) {
                document.getElementById("midiNumb" + id).disabled = false
                document.getElementById("midiNumb" + id).value = state.mappings[id]
            } else {
                document.getElementById("midiNumb" + id).value = ""
                document.getElementById("midiNumb" + id).disabled = true
            }
        }
    }

    // and now we move on to doing the angle state update. Because this one is complex as shit, we actually have to create and destory most of the UI every single time.
    document.getElementById('angleUIList').innerHTML = ""
    for (var angleIndex = 0; angleIndex < state.angles.length; angleIndex++) {
        var iDiv = document.createElement('div');
        for (var pointIndex = 0; pointIndex < 3; pointIndex++) {
            const select = document.createElement('select');
            select.angleIndex = angleIndex;
            select.pointIndex = pointIndex;
            select.id = "angleSelect" + angleIndex + ":" + pointIndex
            select.style.width = "79px"
            allPoints.forEach(function(option, index) {
                const opt = document.createElement('option');
                opt.value = index;
                opt.text = option;
                select.appendChild(opt);
            });
            select.value = state.angles[angleIndex].pts[pointIndex]
            select.addEventListener("change", (event) => {
                var angleIndex = event.srcElement.angleIndex
                var pointIndex = event.srcElement.pointIndex
                var newVal = document.getElementById("angleSelect" + angleIndex + ":" + pointIndex).value
                state.angles[angleIndex].pts[pointIndex] = newVal
                stateHasBeenUpdated()
            })
            iDiv.appendChild(select)
        }
        var inputField = document.createElement("INPUT");
        inputField.setAttribute("type", "text");
        inputField.angleIndex = angleIndex
        inputField.myIndex = angleIndex
        inputField.id = "midiCCangle" + angleIndex
        inputField.addEventListener('change', (event) => {
            var i = event.srcElement.angleIndex
            var newVal = parseInt(event.srcElement.value)
            if (newVal > 128) {
                newVal = nextMidiCC()
            }
            if (newVal < 0) {
                newVal = nextMidiCC()
            }
            state.angles[i].cc = newVal
            stateHasBeenUpdated()
        })
        inputField.value = state.angles[angleIndex].cc
        iDiv.appendChild(inputField)

        var myDelete = document.createElement('span');
        myDelete.classList.add("deleteButton") // just for styling
        myDelete.innerHTML = "delete"
        myDelete.style.display = "inline-block"
        myDelete.angleIndex = angleIndex
        myDelete.addEventListener('click', (event) => {
            var angleIndex = event.srcElement.angleIndex
            state.angles.splice(angleIndex,1) // delete it!
            stateHasBeenUpdated()
        })
        iDiv.appendChild(myDelete)
        document.getElementById('angleUIList').appendChild(iDiv);
    }


    document.getElementById('distanceUIList').innerHTML = ""
    for (var distanceIndex = 0; distanceIndex < state.dist.length; distanceIndex++) {
        var iDiv = document.createElement('div');
        for (var pointIndex = 0; pointIndex < 2; pointIndex++) {
            const select = document.createElement('select');
            select.distanceIndex = distanceIndex;
            select.pointIndex = pointIndex;
            select.id = "distanceSelect" + distanceIndex + ":" + pointIndex
            select.style.width = "120px"
            allPoints.forEach(function(option, index) {
                const opt = document.createElement('option');
                opt.value = index;
                opt.text = option;
                select.appendChild(opt);
            });
            select.value = state.dist[distanceIndex].pts[pointIndex]
            select.addEventListener("change", (event) => {
                var distanceIndex = event.srcElement.distanceIndex
                var pointIndex = event.srcElement.pointIndex
                var newVal = document.getElementById("distanceSelect" + distanceIndex + ":" + pointIndex).value
                state.dist[distanceIndex].pts[pointIndex] = newVal
                stateHasBeenUpdated()
            })
            iDiv.appendChild(select)
        }
        var inputField = document.createElement("INPUT");
        inputField.setAttribute("type", "text");
        inputField.distanceIndex = distanceIndex
        inputField.myIndex = distanceIndex
        inputField.id = "midiCCdistance" + distanceIndex
        inputField.addEventListener('change', (event) => {
            var i = event.srcElement.distanceIndex
            var newVal = parseInt(event.srcElement.value)
            if (newVal > 128) {
                newVal = nextMidiCC()
            }
            if (newVal < 0) {
                newVal = nextMidiCC()
            }
            state.dist[i].cc = newVal
            stateHasBeenUpdated()
        })
        inputField.value = state.dist[distanceIndex].cc
        iDiv.appendChild(inputField)

        var myDelete = document.createElement('span');
        myDelete.classList.add("deleteButton") // just for styling
        myDelete.innerHTML = "delete"
        myDelete.style.display = "inline-block"
        myDelete.distanceIndex = distanceIndex
        myDelete.addEventListener('click', (event) => {
            var distanceIndex = event.srcElement.distanceIndex
            state.dist.splice(distanceIndex,1) // delete it!
            stateHasBeenUpdated()
        })
        iDiv.appendChild(myDelete)
        document.getElementById('distanceUIList').appendChild(iDiv);
    }

    document.getElementById('activityUIList').innerHTML = ""
    for (var activityIndex = 0; activityIndex < state.activity.length; activityIndex++) {
        var iDiv = document.createElement('div');
        const select = document.createElement('select');
        select.activityIndex = activityIndex;
        select.id = "activitySelect" + activityIndex
        select.style.width = "100px"
        allPoints.forEach(function(option, index) {
            const opt = document.createElement('option');
            opt.value = index;
            opt.text = option;
            select.appendChild(opt);
        });
        select.value = state.activity[activityIndex].pt
        select.addEventListener("change", (event) => {
            var activityIndex = event.srcElement.activityIndex
            var newVal = document.getElementById("activitySelect" + activityIndex).value
            state.activity[activityIndex].pt = newVal
            stateHasBeenUpdated()
        })
        iDiv.appendChild(select)
        var inputField = document.createElement("INPUT");
        inputField.setAttribute("type", "text");
        inputField.activityIndex = activityIndex
        inputField.myIndex = activityIndex
        inputField.id = "midiCCactivity" + activityIndex
        inputField.addEventListener('change', (event) => {
            var i = event.srcElement.activityIndex
            var newVal = parseInt(event.srcElement.value)
            if (newVal > 128) {
                newVal = nextMidiCC()
            }
            if (newVal < 0) {
                newVal = nextMidiCC()
            }
            state.activity[i].cc = newVal
            stateHasBeenUpdated()
        })
        inputField.value = state.activity[activityIndex].cc
        iDiv.appendChild(inputField)

        var myDelete = document.createElement('span');
        myDelete.classList.add("deleteButton") // just for styling
        myDelete.innerHTML = "delete"
        myDelete.style.display = "inline-block"
        myDelete.activityIndex = activityIndex
        myDelete.addEventListener('click', (event) => {
            var activityIndex = event.srcElement.activityIndex
            state.activity.splice(activityIndex,1) // delete it!
            stateHasBeenUpdated()
        })
        iDiv.appendChild(myDelete)
        document.getElementById('activityUIList').appendChild(iDiv);
    }

    document.getElementById('xyUIList').innerHTML = ""
    for (var xyIndex = 0; xyIndex < state.xy.length; xyIndex++) {
        var iDiv = document.createElement('div');
        const select = document.createElement('select');
        select.xyIndex = xyIndex;
        select.id = "xySelect" + xyIndex
        select.style.width = "100px"
        allPoints.forEach(function(option, index) {
            const opt = document.createElement('option');
            opt.value = index;
            opt.text = option;
            select.appendChild(opt);
        });
        select.value = state.xy[xyIndex].pt
        select.addEventListener("change", (event) => {
            var xyIndex = event.srcElement.xyIndex
            var newVal = document.getElementById("xySelect" + xyIndex).value
            state.xy[xyIndex].pt = newVal
            stateHasBeenUpdated()
        })
        iDiv.appendChild(select)

        const xyselect = document.createElement('select');
        xyselect.xyIndex = xyIndex;
        xyselect.id = "xyxyselect" + xyIndex
        xyselect.style.width = "40px"
        var lr = ['X','Y']
        lr.forEach(function(option, index) {
            const opt = document.createElement('option');
            opt.value = index;
            opt.text = option;
            xyselect.appendChild(opt);
        });
        xyselect.value = state.xy[xyIndex].i == 0 ? 0 : 1
        console.log("ooops")
        console.log(state.xy[xyIndex].i)
        console.log(xyIndex)
        console.log(xyselect.value)

        xyselect.addEventListener("change", (event) => {
            var xyIndex = event.srcElement.xyIndex
            var newVal = document.getElementById("xyxyselect" + xyIndex).value
            console.log("here!!!!")
            console.log(newVal)
            console.log(state.xy[xyIndex])
            state.xy[xyIndex].i = newVal
            stateHasBeenUpdated()
        })
        iDiv.appendChild(xyselect)

        var inputField = document.createElement("INPUT");
        inputField.setAttribute("type", "text");
        inputField.xyIndex = xyIndex
        inputField.myIndex = xyIndex
        inputField.id = "midiCCxy" + xyIndex
        inputField.addEventListener('change', (event) => {
            var i = event.srcElement.xyIndex
            var newVal = parseInt(event.srcElement.value)
            if (newVal > 128) {
                newVal = nextMidiCC()
            }
            if (newVal < 0) {
                newVal = nextMidiCC()
            }
            state.xy[i].cc = newVal
            stateHasBeenUpdated()
        })
        inputField.value = state.xy[xyIndex].cc
        iDiv.appendChild(inputField)

        var myDelete = document.createElement('span');
        myDelete.classList.add("deleteButton") // just for styling
        myDelete.innerHTML = "delete"
        myDelete.style.display = "inline-block"
        myDelete.xyIndex = xyIndex
        myDelete.addEventListener('click', (event) => {
            var xyIndex = event.srcElement.xyIndex
            state.xy.splice(xyIndex,1) // delete it!
            stateHasBeenUpdated()
        })
        iDiv.appendChild(myDelete)
        document.getElementById('xyUIList').appendChild(iDiv);
    }
}

function initState() {
    for (var i = 0; i < allPoints.length; i++) {
        var iDiv = document.createElement('div');
        var myLabel = document.createElement('span');
        iDiv.id = 'activeMarkerDiv' + i;
        // iDiv.className = 'block';
        myLabel.innerHTML = " " + allPoints[i]
        var checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.myIndex = i
        checkbox.id = "checkbox" + i
        checkbox.addEventListener('change', (event) => {
            console.log(event.srcElement)
            console.log(event.srcElement.myIndex)
            var i = event.srcElement.myIndex
            if (event.currentTarget.checked) {
                console.log(i + ' checked');
                if (!state.boxEnabled.includes(i)) {
                    state.boxEnabled.push(i)
                }
            } else {
                console.log(i + ' not checked');
                var index = state.boxEnabled.indexOf(i);
                if (index !== -1) {
                    state.boxEnabled.splice(index, 1);
                }
            }
            stateHasBeenUpdated()
        })
        iDiv.appendChild(checkbox)
        iDiv.appendChild(myLabel)
        if (pointLabelsToDo.includes(allPoints[i])) {
            document.getElementById('bodyMarkerList').appendChild(iDiv);
        }
    }
}

function addNewAngle() {
    state.angles.push({
        pts: [15, 11, 23],
        cc: nextMidiCC()
    })
    stateHasBeenUpdated()
}
document.getElementById("addNewAngleButton").onclick = addNewAngle


function addNewDistance() {
    state.dist.push({
        pts: [15, 16],
        cc: nextMidiCC()
    })
    stateHasBeenUpdated()
}
document.getElementById("addNewDistanceButton").onclick = addNewDistance

function addNewActivity() {
    state.activity.push({
        pt: 27,
        cc: nextMidiCC()
    })
    stateHasBeenUpdated()
}
document.getElementById("addNewActivityButton").onclick = addNewActivity

function addNewXY() {
    state.xy.push({
        pt: 0,
        i:0,
        cc: nextMidiCC()
    })
    stateHasBeenUpdated()
}
document.getElementById("addNewXYButton").onclick = addNewXY


function drawActiveBoxes() {
    document.getElementById('boxesList').innerHTML = ""
    for (var w = 0; w < state.width; w++) {
        for (var h = 0; h < state.height; h++) {
            var id = w + "-" + h
            var iDiv = document.createElement('div');
            var myLabel = document.createElement('span');
            myLabel.classList.add("labelArea")
            myLabel.innerHTML = id
            iDiv.id = 'box-' + id;

            var checkbox = document.createElement('input');
            checkbox.type = "checkbox";
            checkbox.myIndex = id
            checkbox.id = "checkbox" + id
            checkbox.addEventListener('change', (event) => {
                var id = event.srcElement.myIndex
                if (event.srcElement.checked) {
                    state.mappings[id] = newCandidateNumber(id)
                } else {
                    delete state.mappings[id]
                }
                state.mappings[id]
                stateHasBeenUpdated()
            })

            var inputField = document.createElement("INPUT");
            inputField.setAttribute("type", "text");
            inputField.myIndex = id
            inputField.id = "midiNumb" + id

            inputField.addEventListener('change', (event) => {

                var newVal = parseInt(event.srcElement.value)
                console.log(newVal)
                if (newVal > 128) {
                    newVal = newCandidateNumber(id)
                }
                if (newVal < 0) {
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

function newCandidateNumber(id) {
    var l = id.split("-")
    var w = parseInt(l[0])
    var h = parseInt(l[1])
    var startingPoint = 48
    if (state.width * state.height > 127 - startingPoint) {
        startingPoint = 127 - (state.width * state.height)
    }
    if (startingPoint < 0) {
        startingPoint = 1
    }
    return startingPoint + (w * state.height) + h
}


function addToRectCount(point, newRectCounts) {
    if (Object.keys(newRectCounts).length < state.width * state.height) {
        for (var w = 0; w < state.width; w++) {
            for (var h = 0; h < state.height; h++) {
                newRectCounts[w + "-" + h] = 0
            }
        }
    }
    var w = Math.floor(point.x * state.width)
    var h = Math.floor(point.y * state.height)
    newRectCounts[w + "-" + h] += 1
}
var oldRectCounts = {}



function processRectCounts(newRectCounts) {
    for (var w = 0; w < state.width; w++) {
        for (var h = 0; h < state.height; h++) {
            if ((w + "-" + h in state.mappings)) {
                if (newRectCounts[w + "-" + h] > 0 && oldRectCounts[w + "-" + h] == 0) {
                    // send a note on!!!!
                    sendNoteOn(w + "-" + h)
                }
                if (newRectCounts[w + "-" + h] == 0 && oldRectCounts[w + "-" + h] > 0) {
                    // send a note off!!!!
                    sendNoteOff(w + "-" + h)
                }
            }
        }
    }
    return newRectCounts
}

document.getElementById("heightTextBox").onchange = (event) => {
    state.height = keepValid(parseInt(event.currentTarget.value), 1, 20, 4)
    stateHasBeenUpdated()
}
document.getElementById("widthTextBox").onchange = (event) => {
    state.width = keepValid(parseInt(event.currentTarget.value), 1, 20, 5)
    stateHasBeenUpdated()
}

function sendNoteOn(id) {
    sendToMidi([0x90, state.mappings[id], 0x7f])
}

function sendNoteOff(id) {
    sendToMidi([0x80, state.mappings[id], 0])
}

function sendMidiCC(ccChan, val) {
    if(midiMapIsOpen){
        console.log("midi map open, not sending traditional midi cc");
        return;
    }
    // we DO want to do rounding for free.
    // we DON'T want to do minmaxing without alerting.
    var valToCheck = Math.round(val)
    var valToSend = Math.min(Math.max(valToCheck, 0), 126)
    if (valToCheck != valToSend) {
        console.log("ERROR: " + val + " != " + valToSend)
    }
    sendToMidi([0xB0, ccChan, valToSend])
}


var prevlandmarks = null

function doWholeSpecificFunction(result) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    for (var w = 0; w < state.width; w++) {
        for (var h = 0; h < state.height; h++) {
            canvasCtx.beginPath();
            var wunit = canvasElement.width / state.width
            var hunit = canvasElement.height / state.height
            canvasCtx.lineWidth = 3;
            canvasCtx.strokeStyle = colorParams[colorID].grid;
            canvasCtx.strokeRect(w * wunit, h * hunit, wunit, hunit);
            if (w + "-" + h in state.mappings) {
                canvasCtx.fillStyle = colorParams[colorID].accentColor1;
                canvasCtx.rect(w * wunit, h * hunit, wunit, hunit);
                canvasCtx.fill();
            }
            if (oldRectCounts[w + "-" + h] > 0 && w + "-" + h in state.mappings) {
                canvasCtx.fillStyle = colorParams[colorID].accentColor2;
                canvasCtx.rect(w * wunit, h * hunit, wunit, hunit);
                canvasCtx.fill();
            }
        }
    }

    var newRectCounts = {}
    if (result.landmarks.length > 0) {
        foundSomething()
        var landmark = result.landmarks[0]
        if (prevlandmarks == null) {
            prevlandmarks = []
            for (var i = 0; i < 15; i++) {
                prevlandmarks.push(JSON.parse(JSON.stringify(landmark)))
            }
        }
        landmark = smoothLandmark(landmark)
        var wayPrevLandmark = prevlandmarks.shift()

        for (var i = 0; i < allPoints.length; i++) {
            var px1 = normalizedToPixelCoordinates(
                landmark[i].x,
                landmark[i].y,
                canvasElement.width,
                canvasElement.height)

            var dx = (landmark[i].x - wayPrevLandmark[i].x)
            var dy = (landmark[i].y - wayPrevLandmark[i].y)
            var totalActivity = (dx * dx) + (dy * dy)

            for (var j = state.activity.length - 1; j >= 0; j--) {
                if (state.activity[j].pt == i) {
                    sendMidiCC(state.activity[j].cc, Math.round(totalActivity * 300))
                    canvasCtx.lineWidth = 0;
                    canvasCtx.strokeStyle = colorParams[colorID].primaryOutline;
                    canvasCtx.beginPath();
                    if (totalActivity < 3 / 400) {
                        totalActivity = 3 / 400
                    }
                    canvasCtx.arc(px1[0], px1[1], Math.round(totalActivity * 400), 0, 2 * Math.PI);
                    canvasCtx.fillStyle = colorParams[colorID].accentColor1;
                    canvasCtx.stroke();
                    canvasCtx.fill();
                }
            }

            var widthOfCross = 50;
            for (var j = state.xy.length - 1; j >= 0; j--) {
                if (state.xy[j].pt == i) {
                    console.log(state.xy[j].i)
                    if(state.xy[j].i == 0){ // doing x
                        sendMidiCC(state.xy[j].cc, 127 - (px1[0] * 126 / canvasElement.width))
                        canvasCtx.beginPath();
                        canvasCtx.lineWidth = 4;
                        canvasCtx.strokeStyle = colorParams[colorID].primaryOutline
                        canvasCtx.moveTo(px1[0], px1[1] - widthOfCross)
                        canvasCtx.lineTo(px1[0], px1[1] + widthOfCross)
                        canvasCtx.stroke()
                    }
                    if(state.xy[j].i == 1){ // doing y
                        sendMidiCC(state.xy[j].cc, 127 - (px1[1] * 126 / canvasElement.height))
                        canvasCtx.beginPath();
                        canvasCtx.lineWidth = 4;
                        canvasCtx.strokeStyle = colorParams[colorID].primaryOutline
                        canvasCtx.moveTo(px1[0] - widthOfCross, px1[1])
                        canvasCtx.lineTo(px1[0] + widthOfCross, px1[1])
                        canvasCtx.stroke()
                    }
                }
            }
            if (pointLabelsToDo.includes(allPoints[i])) {

                if (state.boxEnabled.includes(i)) {
                    canvasCtx.beginPath();
                    canvasCtx.rect(px1[0] - 10, px1[1] - 10, 20, 20);
                    canvasCtx.fillStyle = colorParams[colorID].accentColor1_darker;
                    canvasCtx.fill()
                }
                if (state.boxEnabled.includes(i)) {
                    addToRectCount(landmark[i], newRectCounts)
                }

                canvasCtx.beginPath();
                canvasCtx.strokeStyle = colorParams[colorID].primaryOutline
                canvasCtx.strokeRect(px1[0] - 10, px1[1] - 10, 20, 20);
                canvasCtx.fill();
            }

        }
        for (var angleIndex = 0; angleIndex < state.angles.length; angleIndex++) {
            var anglePts = state.angles[angleIndex].pts
            var px1 = normalizedToPixelCoordinates(
                landmark[anglePts[0]].x,
                landmark[anglePts[0]].y,
                canvasElement.width,
                canvasElement.height)
            var px2 = normalizedToPixelCoordinates(
                landmark[anglePts[1]].x,
                landmark[anglePts[1]].y,
                canvasElement.width,
                canvasElement.height)
            var px3 = normalizedToPixelCoordinates(
                landmark[anglePts[2]].x,
                landmark[anglePts[2]].y,
                canvasElement.width,
                canvasElement.height)
            var angleFormed = calculateAngle(px1, px2, px3)

            if(!isNaN(angleFormed)){
                sendMidiCC(state.angles[angleIndex].cc,Math.floor(angleFormed * (127/180)))                
            }
            canvasCtx.beginPath();
            canvasCtx.lineWidth = 4;
            canvasCtx.strokeStyle = colorParams[colorID].primaryOutline
            canvasCtx.moveTo(px1[0], px1[1])
            canvasCtx.lineTo(px2[0], px2[1])
            canvasCtx.lineTo(px3[0], px3[1])
            canvasCtx.stroke()
            // Calculate the start and end angles for the arc
            const startAngle = Math.atan2(px1[1] - px2[1], px1[0] - px2[0]);
            const endAngle = Math.atan2(px3[1] - px2[1], px3[0] - px2[0]);
            canvasCtx.beginPath();
            canvasCtx.arc(px2[0], px2[1], 50, startAngle, endAngle, !isClockwiseShorter(startAngle,endAngle)); // Adjust the radius as needed
            canvasCtx.lineWidth = 3;
            canvasCtx.strokeStyle = colorParams[colorID].accentColor1_darker;
            canvasCtx.stroke();
        }

         for (var distanceIndex = 0; distanceIndex < state.dist.length; distanceIndex++) {
            var distPts = state.dist[distanceIndex].pts
            var px1 = normalizedToPixelCoordinates(
                landmark[distPts[0]].x,
                landmark[distPts[0]].y,
                canvasElement.width,
                canvasElement.height)
            var px2 = normalizedToPixelCoordinates(
                landmark[distPts[1]].x,
                landmark[distPts[1]].y,
                canvasElement.width,
                canvasElement.height)
            var distanceBetween = calculateDistance(px1, px2)
            if(!isNaN(distanceBetween)){
                sendMidiCC(state.dist[distanceIndex].cc,Math.floor(128 * distanceBetween / (canvasElement.width)))
            }
            canvasCtx.beginPath();
            canvasCtx.lineWidth = 4;
            canvasCtx.strokeStyle = colorParams[colorID].primaryOutline
            canvasCtx.moveTo(px1[0], px1[1])
            canvasCtx.lineTo(px2[0], px2[1])
            canvasCtx.stroke()
        }

        prevlandmarks.push(JSON.parse(JSON.stringify(landmark)));
        oldRectCounts = processRectCounts(newRectCounts)
    }
    canvasCtx.restore();
}

function clearEverything() {
    for (var i = 0; i < 40; i++) {
        sendMidiCC(14 + i, 0)
        prevlandmarks = null
    }

    var emptyRectCounts = {}
    for (const [key, value] of Object.entries(oldRectCounts)) {
        emptyRectCounts[key] = 0
    }
    processRectCounts(emptyRectCounts)
    oldRectCounts = emptyRectCounts
}



// ========================== LIBRARY BELOW ============================



function foundSomething() {
    nothingOnce = false
    nothingTwice = false
    nothingThreetimes = false
}

var nothingOnce = false
var nothingTwice = false // after this, clear things.
var nothingThreetimes = false // to tell if we've already cleared things.

function checkForNothing() {
    console.log("checking for nothing")
    if (nothingOnce == false) {
        nothingOnce = true
        nothingTwice = false
        return
    }
    if (nothingOnce == true) {
        if (nothingTwice == false) {
            nothingTwice = true
            return
        }
        if (nothingTwice == true) {
            if (nothingThreetimes == false) {
                clearEverything()
                nothingThreetimes = true
            }
        }
    }
}
setInterval(checkForNothing, 300)

async function doCameraFirst() {
    console.log("hello?")
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');

        const cameraSelect = document.getElementById('cameraSelect');
        videoDevices.forEach(device => {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.text = device.label || `Camera ${cameraSelect.length + 1}`;
            cameraSelect.appendChild(option);
        });

        cameraSelect.addEventListener('change', () => {
            const selectedDeviceId = cameraSelect.value;
            setCamera(selectedDeviceId);
        });

        if (videoDevices.length > 0) {
            setCamera(videoDevices[0].deviceId);
        }
    } catch (error) {
        console.error('Error accessing media devices.', error);
    }
}

async function setCamera(deviceId) {
    try {
        webcamRunning = false
        const constraints = {
            video: {
                deviceId: {
                    exact: deviceId
                }
            }
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        const videoElement = document.getElementById('webcam');
        videoElement.srcObject = stream;
        webcamRunning = true
    } catch (error) {
        console.error('Error setting camera.', error);
    }
}


function openFullscreen(elem) {
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
        /* Safari */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
        /* IE11 */
        elem.msRequestFullscreen();
    }
}

function fullscreen() {
    openFullscreen(document.getElementById("wholeThingMaybe"))
}

let midiOutput = null;

function enableMidiStuff() {
    if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess({
                sysex: true
            })
            .then(onMIDISuccess, onMIDIFailure);
    } else {
        console.error('Web MIDI API not supported in this browser.');
    }
}


function onMIDISuccess(midiAccess) {
    btn.disabled = false
    const midiOutputDevicesSelect = document.getElementById('midiOutputDevices');
    const outputs = midiAccess.outputs.values();
    var midiOutsAdded = 0
    for (let output of outputs) {
        const option = document.createElement('option');
        option.value = output.id;
        option.text = output.name;
        midiOutputDevicesSelect.appendChild(option);
        midiOutsAdded += 1
    }

    if (midiOutsAdded == 0) {
        document.getElementById("midiError").style.display = "block"
    }

    midiOutputDevicesSelect.addEventListener('change', (event) => {
        midiOutput = midiAccess.outputs.get(event.target.value);
    });

    // Automatically select the first output device
    if (midiOutputDevicesSelect.options.length > 0) {
        midiOutputDevicesSelect.selectedIndex = 0;
        midiOutput = midiAccess.outputs.get(midiOutputDevicesSelect.value);
    }
}

function onMIDIFailure() {
    console.error('Could not access MIDI devices.');
}

function sendToMidi(command) {
    if (midiOutput) {
        midiOutput.send(command);
    } else {
        // console.error('No MIDI output device selected.');
    }
}

function isClockwiseShorter(startAngle, endAngle) {
    // Normalize the angles to be between 0 and 2*PI
    startAngle = startAngle % (2 * Math.PI);
    endAngle = endAngle % (2 * Math.PI);

    // Calculate the difference in both directions
    const clockwiseDistance = (endAngle - startAngle + 2 * Math.PI) % (2 * Math.PI);
    const counterclockwiseDistance = (startAngle - endAngle + 2 * Math.PI) % (2 * Math.PI);

    // Determine if clockwise is shorter
    return clockwiseDistance <= counterclockwiseDistance;
}

function calculateAngle(p1, p2, p3) {
    // Calculate vectors v1 and v2
    const v1 = [p1[0] - p2[0], p1[1] - p2[1]];
    const v2 = [p3[0] - p2[0], p3[1] - p2[1]];

    // Calculate the dot product of v1 and v2
    const dotProduct = v1[0] * v2[0] + v1[1] * v2[1];

    // Calculate the magnitudes of v1 and v2
    const magnitudeV1 = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1]);
    const magnitudeV2 = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1]);

    // Calculate the cosine of the angle
    const cosTheta = dotProduct / (magnitudeV1 * magnitudeV2);

    // Calculate the angle in radians
    const angleInRadians = Math.acos(cosTheta);

    // Convert the angle to degrees
    const angleInDegrees = angleInRadians * (180 / Math.PI);

    return angleInDegrees;
}

function calculateDistance(p1, p2) {
    // Calculate the differences in x and y coordinates
    const deltaX = p1[0] - p2[0];
    const deltaY = p1[1] - p2[1];

    // Calculate the distance using the Pythagorean theorem
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    return distance;
}


function calculateAverage(arr) {
    if (arr.length === 0) return 0;

    let sum = arr.reduce((accumulator, current) => accumulator + current, 0);
    return sum / arr.length;
}


var allSmoothing = {}

function smoothWithMap(name, val) {
    if (!(name in allSmoothing)) {
        allSmoothing[name] = []
    }
    allSmoothing[name].push(val)
    while (allSmoothing[name].length > state.smoothing) {
        allSmoothing[name].shift()
    }
    return calculateAverage(allSmoothing[name])
}

function capZeroOne(numb) {
    return Math.min(Math.max(numb, 0), 1)
}

function smoothLandmark(landmark) {
    var ret = []
    for (var i = 0; i < landmark.length; i++) {
        ret.push({})
        ret[i].x = smoothWithMap("p" + i + "-x", capZeroOne(landmark[i].x))
        ret[i].y = smoothWithMap("p" + i + "-y", capZeroOne(landmark[i].y))
        ret[i].z = smoothWithMap("p" + i + "-z", capZeroOne(landmark[i].z))
    }
    return ret
}


function pointInRect(pt, rect) { // where rect is x,y,width,height
    if (pt.x >= rect[0] && pt.x <= rect[0] + rect[2] && pt.y >= rect[1] && pt.y <= rect[1] + rect[3]) {
        return true
    }
    return false
}


function normalizedToPixelCoordinates(normalized_x, normalized_y, image_width, image_height) {
    // Checks if the float value is between 0 and 1.
    function isValidNormalizedValue(value) {
        return (value > 0 || Math.abs(0 - value) < Number.EPSILON) && (value < 1 || Math.abs(1 - value) < Number.EPSILON);
    }
    var x_px = Math.min(Math.floor(normalized_x * image_width), image_width - 1);
    var y_px = Math.min(Math.floor(normalized_y * image_height), image_height - 1);
    return [x_px, y_px];
}

function getQueryParams(qs) {
    qs = qs.split('+').join(' ');
    var params = {},
        tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }

    return params;
}


function dataToQueryString(data) {
    var encoded = [];

    for (var key in data) {
        // skip prototype properties
        if (!data.hasOwnProperty(key)) continue;

        // encode string properly to use in url
        encoded.push(key + '=' + encodeURIComponent(data[key]));
    }
    return '?' + encoded.join('&');
}

function updateStateToWorkWithCurrentStateObject(validState, newState){
    // add backwards compatability
    if(!('angles' in newState)){
        newState.angles = []
    }
    if(!('dist' in newState)){
        newState.dist = []
    }
    if('activitySending' in newState){
        if(!('activity' in newState)){
            newState.activity = []
        }
        for(var i = 0; i < newState.activitySending.length;i++){
            if(newState.activitySending[i] != -1){
                newState.activity.push({
                    pt:i,
                    cc:newState.activitySending[i]
                })
            }
        }
        delete newState['activitySending']
    }
    if('xySending' in newState){
        if(!('xy' in newState)){
            newState.xy = []
        }
        for(var i = 0; i < newState.xySending.length;i++){
            if(newState.xySending[i] != -1){
                newState.xy.push({
                    pt:i % allPoints.length,
                    i: i >= allPoints.length,
                    cc: newState.xySending[i]
                })
            }
        }
        delete newState['xySending']
    }
    return newState
}

function getStateFromURL() {
    try {
        var query = getQueryParams(document.location.search);
        var newState = JSON.parse(query.s)
        var stillNewState = updateStateToWorkWithCurrentStateObject(state,newState)
        state = newState
        console.log(state)
    } catch (e) {
        console.log("error parsing state!")
        console.log(e.stack)
        console.log("going with default state.")
        pushStateToURL()
    }
}

function pushStateToURL() {
    var s = {
        s: JSON.stringify(state)
    }
    var res = dataToQueryString(s)
    // console.log(res)
    window.history.pushState("object or string", "Title", "/activity_midi/index.html" + res);
}

// pushStateToURL()

getStateFromURL()

// now set up things for the given state

// var totalRects = state.width * state.height

function stateHasBeenUpdated() {
    pushStateToURL()
    updateDisplayWithState()
}


initState();
updateDisplayWithState()



// Copyright 2023 The MediaPipe Authors.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import {
    PoseLandmarker,
    FilesetResolver,
    DrawingUtils
} from "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0";
let poseLandmarker = undefined;
let runningMode = "IMAGE";
let enableWebcamButton;
let webcamRunning = false;
const videoHeight = "360px";
const videoWidth = "480px";
// Before we can use PoseLandmarker class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment to
// get everything needed to run.
const createPoseLandmarker = async () => {
    const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
    poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
            delegate: "GPU"
        },
        runningMode: runningMode,
        numPoses: 1
    });
};
createPoseLandmarker();



const video = document.getElementById("webcam");
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");
const drawingUtils = new DrawingUtils(canvasCtx);
// Check if webcam access is supported.
const hasGetUserMedia = () => {
    var _a;
    return !!((_a = navigator.mediaDevices) === null || _a === void 0 ? void 0 : _a.getUserMedia);
};
// If webcam supported, add event listener to button for when user
// wants to activate it.
if (hasGetUserMedia()) {
    enableWebcamButton = document.getElementById("webcamButton");
    enableWebcamButton.addEventListener("click", enableCam);
} else {
    console.warn("getUserMedia() is not supported by your browser");
}
// Enable the live webcam view and start detection.
function enableCam(event) {
    console.log("hi?")
    doCameraFirst()
    console.log("hi? again")
    if (!poseLandmarker) {
        console.log("Wait! poseLandmaker not loaded yet.");
        return;
    }
    if (webcamRunning === true) {
        webcamRunning = false;
        enableWebcamButton.innerText = "ENABLE PREDICTIONS";
    } else {
        webcamRunning = true;
        enableWebcamButton.innerText = "DISABLE PREDICTIONS";
        enableWebcamButton.style.display = "none"
        document.getElementById("cameraSelect").style.display = "block"
    }
    // getUsermedia parameters.
    const constraints = {
        video: true
    };
    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        video.srcObject = stream;
        video.addEventListener("loadeddata", predictWebcam);
    });
}
let lastVideoTime = -1;


async function predictWebcam() {
    console.log("called predictWebcam")
    var idealWidth = document.getElementById("col1").clientWidth
    var idealHeight = idealWidth * (video.videoHeight / video.videoWidth) // RESPECT the original video aspect ratio

    idealHeight = idealHeight + "px"
    idealWidth = idealWidth + "px"

    canvasElement.style.height = idealHeight // videoHeight;
    video.style.height = idealHeight // videoHeight;
    canvasElement.style.width = idealWidth // videoWidth;
    video.style.width = idealWidth // videoWidth;

    // Now let's start detecting the stream.
    if (runningMode === "IMAGE") {
        runningMode = "VIDEO";
        await poseLandmarker.setOptions({
            runningMode: "VIDEO"
        });
    }
    let startTimeMs = performance.now();
    if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;
        poseLandmarker.detectForVideo(video, startTimeMs, (result) => {
            doWholeSpecificFunction(result);
        });
    }
    // Call this function again to keep predicting when the browser is ready.
    if (webcamRunning === true) {
        window.requestAnimationFrame(predictWebcam);
    }
}


document.getElementById("smoothingSlider").onchange = (event) => {
    state.smoothing = parseInt(event.currentTarget.value)
    stateHasBeenUpdated()
}


// document.getElementById("fullscreenButton").onclick = (event) => {
//     fullscreen()
// }

document.getElementById("enableMidi").onclick = (event) => {
    enableMidiStuff()
    document.getElementById("enableMidi").style.display = "none"
    document.getElementById("midiOutputDevices").style.display = "inline-block"
}

function keepValid(x, low, high, pref) {
    if (x < low) {
        return low
    }
    if (x > high) {
        return high
    }
    return x
}

var isDivHidden = {
    "spatialBoxesContent": false,
    "activityContent": false,
    "xyContent": false,
    "angleContent": false,
    "distanceContent": false,
}

document.getElementById("spatialBoxesContentShowHide").onclick = function() {
    showHide("spatialBoxesContent")
}
document.getElementById("activityContentShowHide").onclick = function() {
    showHide("activityContent")
}
document.getElementById("xyContentShowHide").onclick = function() {
    showHide("xyContent")
}
document.getElementById("angleContentShowHide").onclick = function() {
    showHide("angleContent")
}
document.getElementById("distanceContentShowHide").onclick = function() {
    showHide("distanceContent")
}

// DELETE THIS AFTER DEVELOPING ANGLES
// showHide("spatialBoxesContent")
// showHide("activityContent")
// showHide("xyContent")

function showHide(divName) {
    if (isDivHidden[divName]) {
        document.getElementById(divName).style.display = "block"
        document.getElementById(divName + "ShowHide").innerHTML = "hide"
        isDivHidden[divName] = false
    } else {
        document.getElementById(divName).style.display = "none"
        document.getElementById(divName + "ShowHide").innerHTML = "show"
        isDivHidden[divName] = true
    }
}






var midiMapIsOpen = false

// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

function sendPulse(clickedbutton, numb) {
    var allsendbuttons = document.getElementsByClassName("sendButton");
    // Step 1: Disable all other send buttons for 0.5 seconds
    for (let i = 0; i < allsendbuttons.length; i++) {
        allsendbuttons[i].disabled = true;
        allsendbuttons[i].classList.remove("sendButtonNormal")
        allsendbuttons[i].style.background = "#666"
    }
    setTimeout(() => {
        for (let i = 0; i < allsendbuttons.length; i++) {
            allsendbuttons[i].disabled = false;
            allsendbuttons[i].classList.add("sendButtonNormal")
            allsendbuttons[i].style.background = "#444"
        }
    }, 600);

    // Step 2: Trigger a callback to sendMidiWith(value) with linear ramp values up and down
    let interval = 10; // milliseconds
    let duration = 500; // total duration in ms
    let steps = duration / (2 * interval); // number of steps for up and down ramp
    let stepValue = 1 / steps; // increment value per step
    let currentValue = 0;
    let ascending = true; // direction of the ramp
    let clearIntervalNextTime = false

    let rampInterval = setInterval(() => {
        var toSend = [0xB0, numb, Math.round(currentValue * 127)]
        console.log(toSend)
        sendToMidi(toSend)

        if(clearIntervalNextTime){
            clearInterval(rampInterval);
        }

        // Step 3: Update clicked button background based on currentValue
        let percentage = currentValue * 100;
        clickedbutton.style.background = `linear-gradient(to right, #888 ${percentage}%, black ${percentage}%)`;

        if (ascending) {
            currentValue += stepValue;
            if (currentValue >= 1) {
                ascending = false;
                currentValue = 1; // Ensure it doesn’t exceed 1
            }
        } else {
            currentValue -= stepValue;
            if (currentValue < 0) {
                clearIntervalNextTime = true
                currentValue = 0; // Ensure it doesn’t drop below 0
            }
        }
    }, interval);
}

// Example function to simulate sending MIDI data
function sendMidiWith(value) {
    console.log("Sending MIDI value:", value);
}

function createMidiMapDiv(ccnumb, label){
    var newdiv = document.createElement("div")
    var sendButton = document.createElement("button")
    sendButton.innerHTML = "send pulse"
    sendButton.ccNumber = ccnumb
    sendButton.classList.add("sendButton")
    sendButton.classList.add("sendButtonNormal")
    sendButton.style.marginRight = "5px"
    sendButton.onclick = (event)=>{
        console.log(event.target.ccNumber)
        sendPulse(event.target, event.target.ccNumber)
    }
    var labelSpan = document.createElement("span")
    labelSpan.innerHTML = ccnumb +" - "+label
    newdiv.appendChild(sendButton)
    newdiv.appendChild(labelSpan)
    newdiv.ccNumber = ccnumb
    return newdiv
}

function renderInsidesOfMidiModal(){
    document.getElementById("midimaplist").innerHTML = ""
    var divsToAdd = []

    for (var i = 0; i < state.angles.length; i++) {
        var angleLabel = allPoints[state.angles[i].pts[0]]+", "+allPoints[state.angles[i].pts[1]]+", "+allPoints[state.angles[i].pts[2]]
        var label = "angle: "+angleLabel
        divsToAdd.push(createMidiMapDiv(state.angles[i].cc, label))
    }
    for (var i = 0; i < state.activity.length; i++) {
        var activityLab = allPoints[state.activity[i].pt]
        var label = "activity: "+activityLab
        divsToAdd.push(createMidiMapDiv(state.activity[i].cc, label))
    }
    for (var i = 0; i < state.dist.length; i++) {
        var distLabel = allPoints[state.dist[i].pts[0]]+", "+allPoints[state.dist[i].pts[1]]
        var label = state.dist[i].cc +" - distance: "+distLabel
        divsToAdd.push(createMidiMapDiv(state.dist[i].cc, label))
    }
    for (var i = 0; i < state.xy.length; i++) {
        var xyLabel = allPoints[state.xy[i].pt]+" - "+(["X","Y"][state.xy[i].i])
        var label = state.xy[i].cc +" - xy: "+xyLabel
        divsToAdd.push(createMidiMapDiv(state.xy[i].cc, label))
    }

    // now sort them to display in order
    divsToAdd.sort((a, b) => a.ccNumber - b.ccNumber);

    // and identify duplicates to highlight in red
    const countMap = new Map();
    divsToAdd.forEach(obj => {
        countMap.set(obj.ccNumber, (countMap.get(obj.ccNumber) || 0) + 1);
    });

    // Add isDuplicate field to each object
    divsToAdd.forEach(obj => {
        obj.isDuplicate = countMap.get(obj.ccNumber) > 1;
        console.log(obj.isDuplicate)
        if(obj.isDuplicate){
            obj.classList.add('duplicate')
        }
    });

    for(var i = 0; i < divsToAdd.length;i++){
        document.getElementById("midimaplist").appendChild(divsToAdd[i])
    }
    if(divsToAdd.length == 0){
        var newdiv = document.createElement("div")
        newdiv.innerHTML = "No midi CC channels to send. Please create new outputs first by adding a new activity, distance, angle, or XY, and then come back here to map them."
        document.getElementById("midimaplist").appendChild(newdiv)
    }
}

// When the user clicks on the button, open the modal
btn.onclick = function() {
  renderInsidesOfMidiModal()
  modal.style.display = "block";
  midiMapIsOpen = true;
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
  midiMapIsOpen = false;
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
    midiMapIsOpen = false;
  }
}


