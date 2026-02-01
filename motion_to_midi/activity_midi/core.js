// TODOs


/*


*/


var colorParams = {
    "dark": {
        "grid": "#000000", // black
        "primaryOutline": "#000000", // black
        "primaryRGB": {r: 0, g: 0, b: 0}, // for interpolation
        "accentColor1": "rgba(0, 0, 200, 0.1)", // blue
        "accentColor1_darker": "rgba(0, 0, 200, 0.4)", // blue
        "accentRGB": {r: 0, g: 0, b: 200}, // for interpolation
        "accentColor2": "rgba(0, 250, 0, 0.2)", // green
        "activityCircle": "#000000",
    },
    "light": {
        "grid": "#FFFFFF", // white
        "primaryOutline": "#FFFFFF", // white
        "primaryRGB": {r: 255, g: 255, b: 255}, // for interpolation
        "accentColor1": "rgba(200, 0, 200, 0.1)", // purpleish
        "accentColor1_darker": "rgba(200, 0, 200, 0.4)", // purpleish
        "accentRGB": {r: 200, g: 0, b: 200}, // for interpolation
        "accentColor2": "rgba(0, 250, 0, 0.2)", // green
        "activityCircle": "#000000",
    },
}

// Interpolate between primary and accent color based on percentage (0-100)
function getThresholdColor(percent) {
    var primary = colorParams[colorID].primaryRGB;
    var accent = colorParams[colorID].accentRGB;
    var t = Math.max(0, Math.min(100, percent)) / 100;
    var r = Math.round(primary.r + (accent.r - primary.r) * t);
    var g = Math.round(primary.g + (accent.g - primary.g) * t);
    var b = Math.round(primary.b + (accent.b - primary.b) * t);
    return "rgb(" + r + ", " + g + ", " + b + ")";
}

// Check if a CC channel has user-defined thresholds
function hasUserThreshold(ccChan) {
    return state.sc && state.sc[""+ccChan] &&
           (state.sc[""+ccChan].n > 0 || state.sc[""+ccChan].x < 126);
}

// Pose model landmarks (33 points)
var poseAllPoints = [
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

var posePrimaryPoints = [
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

// Hand model landmarks (21 points per hand, we'll track both hands)
// Joint labels without L/R for dropdown (21 items)
var handJointLabels = [
    "wrist",
    "thumb 0 (base)",
    "thumb 1",
    "thumb 2",
    "thumb 3 (tip)",
    "index 0 (base)",
    "index 1",
    "index 2",
    "index 3 (tip)",
    "middle 0 (base)",
    "middle 1",
    "middle 2",
    "middle 3 (tip)",
    "ring 0 (base)",
    "ring 1",
    "ring 2",
    "ring 3 (tip)",
    "pinky 0 (base)",
    "pinky 1",
    "pinky 2",
    "pinky 3 (tip)"
]

var handAllPoints = [
    "wrist - L",
    "thumb 0 (base) - L",
    "thumb 1 - L",
    "thumb 2 - L",
    "thumb 3 (tip) - L",
    "index 0 (base) - L",
    "index 1 - L",
    "index 2 - L",
    "index 3 (tip) - L",
    "middle 0 (base) - L",
    "middle 1 - L",
    "middle 2 - L",
    "middle 3 (tip) - L",
    "ring 0 (base) - L",
    "ring 1 - L",
    "ring 2 - L",
    "ring 3 (tip) - L",
    "pinky 0 (base) - L",
    "pinky 1 - L",
    "pinky 2 - L",
    "pinky 3 (tip) - L",
    "wrist - R",
    "thumb 0 (base) - R",
    "thumb 1 - R",
    "thumb 2 - R",
    "thumb 3 (tip) - R",
    "index 0 (base) - R",
    "index 1 - R",
    "index 2 - R",
    "index 3 (tip) - R",
    "middle 0 (base) - R",
    "middle 1 - R",
    "middle 2 - R",
    "middle 3 (tip) - R",
    "ring 0 (base) - R",
    "ring 1 - R",
    "ring 2 - R",
    "ring 3 (tip) - R",
    "pinky 0 (base) - R",
    "pinky 1 - R",
    "pinky 2 - R",
    "pinky 3 (tip) - R"
]

// Hand primary points with index (into handAllPoints) and display label
var handPrimaryPointsData = [
    { index: 0, label: "wrist - L" },
    { index: 21, label: "wrist - R" },
    { index: 1, label: "thumb (base) - L" },
    { index: 22, label: "thumb (base) - R" },
    { index: 4, label: "thumb (tip) - L" },
    { index: 25, label: "thumb (tip) - R" },
    { index: 8, label: "index (tip) - L" },
    { index: 29, label: "index (tip) - R" },
    { index: 12, label: "middle (tip) - L" },
    { index: 33, label: "middle (tip) - R" },
    { index: 16, label: "ring (tip) - L" },
    { index: 37, label: "ring (tip) - R" },
    { index: 17, label: "pinky (base) - L" },
    { index: 38, label: "pinky (base) - R" },
    { index: 20, label: "pinky (tip) - L" },
    { index: 41, label: "pinky (tip) - R" },
];

// For backward compatibility (used by pointLabelsToDo assignment)
var handPrimaryPoints = handPrimaryPointsData.map(function(p) { return p.label; });

// Helper: check if an index is a primary point
function isPrimaryPoint(index) {
    if (getCurrentModel() === "h-mp") {
        return handPrimaryPointsData.some(function(p) { return p.index === index; });
    } else {
        return posePrimaryPoints.includes(poseAllPoints[index]);
    }
}

// Helper: get display label for a primary point index
function getPrimaryLabel(index) {
    if (getCurrentModel() === "h-mp") {
        var found = handPrimaryPointsData.find(function(p) { return p.index === index; });
        return found ? found.label : allPoints[index];
    } else {
        return allPoints[index];
    }
}

// Special direction points for angle measurement (indexes 100+)
// These represent virtual points 50 pixels away from the center in a given direction
var directionPoints = [
    { index: 100, label: "↑ up", dx: 0, dy: -50 },
    { index: 101, label: "↓ down", dx: 0, dy: 50 },
    { index: 102, label: "→ right", dx: -50, dy: 0 },
    { index: 103, label: "← left", dx: 50, dy: 0 }
];

function isDirectionIndex(index) {
    return index >= 100 && index <= 103;
}

function getDirectionOffset(index) {
    var dir = directionPoints.find(function(d) { return d.index === index; });
    return dir ? { dx: dir.dx, dy: dir.dy } : null;
}

function getPointLabel(index) {
    if (isDirectionIndex(index)) {
        var dir = directionPoints.find(function(d) { return d.index === index; });
        return dir ? dir.label : "unknown";
    }
    return allPoints[index] || "unknown";
}

// Helper functions to convert between hand index and L/R + joint index
function handIndexToLRAndJoint(index) {
    if (index < 21) {
        return { hand: "L", joint: index };
    } else {
        return { hand: "R", joint: index - 21 };
    }
}

function lrAndJointToHandIndex(hand, joint) {
    return hand === "R" ? parseInt(joint) + 21 : parseInt(joint);
}

// Create a point selector - returns either a single dropdown (pose) or dual dropdowns (hand)
// Optional jointWidth parameter to customize joint dropdown width (default 90px)
// Optional includeDirections parameter to add direction options (up/down/left/right) at the top
function createPointSelector(currentIndex, onChangeCallback, idPrefix, jointWidth, includeDirections) {
    var container = document.createElement('span');
    jointWidth = jointWidth || "90px";

    if (getCurrentModel() === "h-mp") {
        // Hand mode: check if current value is a direction
        var isDirection = isDirectionIndex(currentIndex);

        // Hand mode: two dropdowns (L/R and joint) OR single dropdown for directions
        var lrSelect = document.createElement('select');
        lrSelect.style.width = "36px";
        lrSelect.id = idPrefix + "_lr";

        // Add direction options at top if includeDirections is true
        if (includeDirections) {
            directionPoints.forEach(function(dir) {
                var opt = document.createElement('option');
                opt.value = dir.index;
                opt.text = dir.label;
                lrSelect.appendChild(opt);
            });
            // Add separator
            var sepOpt = document.createElement('option');
            sepOpt.disabled = true;
            sepOpt.text = "──────";
            lrSelect.appendChild(sepOpt);
        }

        ["L", "R"].forEach(function(hand) {
            var opt = document.createElement('option');
            opt.value = hand;
            opt.text = hand;
            lrSelect.appendChild(opt);
        });

        var jointSelect = document.createElement('select');
        jointSelect.style.width = jointWidth;
        jointSelect.id = idPrefix + "_joint";
        handJointLabels.forEach(function(label, index) {
            var opt = document.createElement('option');
            opt.value = index;
            opt.text = label;
            jointSelect.appendChild(opt);
        });

        // Set current values
        if (isDirection) {
            lrSelect.value = currentIndex; // direction index
            jointSelect.style.display = "none"; // hide joint selector for directions
        } else {
            var current = handIndexToLRAndJoint(currentIndex);
            lrSelect.value = current.hand;
            jointSelect.value = current.joint;
        }

        // Change handlers
        var updateValue = function() {
            var lrVal = lrSelect.value;
            // Check if it's a direction value
            if (isDirectionIndex(parseInt(lrVal))) {
                jointSelect.style.display = "none";
                onChangeCallback(parseInt(lrVal));
            } else {
                jointSelect.style.display = "";
                var newIndex = lrAndJointToHandIndex(lrVal, jointSelect.value);
                onChangeCallback(newIndex);
            }
        };
        lrSelect.addEventListener("change", updateValue);
        jointSelect.addEventListener("change", updateValue);

        container.appendChild(lrSelect);
        container.appendChild(jointSelect);
    } else {
        // Pose mode: single dropdown
        var select = document.createElement('select');
        select.style.width = "120px";
        select.id = idPrefix;

        // Add direction options at top if includeDirections is true
        if (includeDirections) {
            directionPoints.forEach(function(dir) {
                var opt = document.createElement('option');
                opt.value = dir.index;
                opt.text = dir.label;
                select.appendChild(opt);
            });
            // Add separator
            var sepOpt = document.createElement('option');
            sepOpt.disabled = true;
            sepOpt.text = "──────";
            select.appendChild(sepOpt);
        }

        allPoints.forEach(function(option, index) {
            var opt = document.createElement('option');
            opt.value = index;
            opt.text = option;
            select.appendChild(opt);
        });
        select.value = currentIndex;
        select.addEventListener("change", function() {
            onChangeCallback(parseInt(select.value));
        });
        container.appendChild(select);
    }

    return container;
}

// Dynamic point arrays based on current model
var allPoints = poseAllPoints
var pointLabelsToDo = posePrimaryPoints

function getCurrentModel() {
    return state.md || "p-mp"
}

function updatePointArraysForModel() {
    var model = getCurrentModel()
    if (model === "h-mp") {
        allPoints = handAllPoints
        pointLabelsToDo = handPrimaryPoints
    } else {
        allPoints = poseAllPoints
        pointLabelsToDo = posePrimaryPoints
    }
}


var colorID = "dark"

document.getElementById("colorSelector").addEventListener("change", function() {
    colorID = document.getElementById("colorSelector").value
});

var rectCounts = {}

var currentCCValues = {}  // { ccNumber: { inputPercent: float, outputPercent: float } }

var currMidiCC = 16

function nextMidiCC() {
    const maxAngleCC = state.angles.reduce((max, item) => Math.max(max, item.cc), -Infinity);
    const maxActivityCC = state.activity.reduce((max, item) => Math.max(max, item.cc), -Infinity);
    const maxDistanceCC = state.dist.reduce((max, item) => Math.max(max, item.cc), -Infinity);
    const maxXYCC = state.xy.reduce((max, item) => Math.max(max, item.cc), -Infinity);
    var maxSoFar = Math.max(maxActivityCC, maxXYCC, maxDistanceCC, maxAngleCC, 15)
    return maxSoFar + 1
}

function toNoteName(midiNote) {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const noteIndex = midiNote % 12;
    const octave = Math.floor(midiNote / 12) - 1;
    return noteNames[noteIndex] + octave;
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
    activity:[],
    md: "p-mp" // model: "p-mp" (pose-mediapipe) or "h-mp" (hand-mediapipe)
}


function updateDisplayWithState() {
    document.getElementById("smoothingSlider").value = state.smoothing
    document.getElementById("widthTextBox").value = state.width
    document.getElementById("heightTextBox").value = state.height
    drawActiveBoxes()
     for (var i = 0; i < allPoints.length; i++) {
        if (isPrimaryPoint(i)) {
            var checkbox = document.getElementById("checkbox" + i)
            if (checkbox) {
                checkbox.checked = state.boxEnabled.includes(i)
            }
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
    var isHandMode = getCurrentModel() === "h-mp";
    for (var angleIndex = 0; angleIndex < state.angles.length; angleIndex++) {
        var iDiv = document.createElement('div');
        if (isHandMode) {
            iDiv.style.marginBottom = "10px";
            iDiv.style.paddingBottom = "10px";
            iDiv.style.borderBottom = "1px solid #444";
        }
        for (var pointIndex = 0; pointIndex < 3; pointIndex++) {
            (function(ai, pi) {
                // Include direction options for the third point (index 2) only
                var includeDirections = (pi === 2);
                var selector = createPointSelector(
                    state.angles[ai].pts[pi],
                    function(newVal) {
                        state.angles[ai].pts[pi] = newVal;
                        stateHasBeenUpdated();
                    },
                    "angleSelect" + ai + "_" + pi,
                    isHandMode ? "120px" : null,
                    includeDirections
                );
                iDiv.appendChild(selector);
                if (isHandMode) {
                    iDiv.appendChild(document.createElement('br'));
                }
            })(angleIndex, pointIndex);
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
            (function(di, pi) {
                var selector = createPointSelector(
                    state.dist[di].pts[pi],
                    function(newVal) {
                        state.dist[di].pts[pi] = newVal;
                        stateHasBeenUpdated();
                    },
                    "distanceSelect" + di + "_" + pi
                );
                iDiv.appendChild(selector);
            })(distanceIndex, pointIndex);
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
        (function(ai) {
            var selector = createPointSelector(
                state.activity[ai].pt,
                function(newVal) {
                    state.activity[ai].pt = newVal;
                    stateHasBeenUpdated();
                },
                "activitySelect" + ai
            );
            iDiv.appendChild(selector);
        })(activityIndex);
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
        (function(xi) {
            var selector = createPointSelector(
                state.xy[xi].pt,
                function(newVal) {
                    state.xy[xi].pt = newVal;
                    stateHasBeenUpdated();
                },
                "xySelect" + xi
            );
            iDiv.appendChild(selector);
        })(xyIndex);

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

        xyselect.addEventListener("change", (event) => {
            var xyIndex = event.srcElement.xyIndex
            var newVal = document.getElementById("xyxyselect" + xyIndex).value
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
        if (!isPrimaryPoint(i)) continue;
        var iDiv = document.createElement('div');
        var myLabel = document.createElement('span');
        iDiv.id = 'activeMarkerDiv' + i;
        // iDiv.className = 'block';
        myLabel.innerHTML = " " + getPrimaryLabel(i)
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
        document.getElementById('bodyMarkerList').appendChild(iDiv);
    }
}

function getDefaultAnglePts() {
    // Return sensible defaults based on current model
    if (getCurrentModel() === "h-mp") {
        return [4, 5, 8]; // thumb tip, index 0 (base), index 3 (tip) - left hand
    } else {
        return [15, 11, 23]; // wrist L, shoulder L, hip L
    }
}

function getDefaultDistancePts() {
    if (getCurrentModel() === "h-mp") {
        return [4, 8]; // thumb 3 (tip), index 3 (tip) - left hand
    } else {
        return [15, 16]; // wrist L, wrist R
    }
}

function getDefaultActivityPt() {
    if (getCurrentModel() === "h-mp") {
        return 8; // index 3 (tip) - left hand
    } else {
        return 15; // wrist L
    }
}

function getDefaultXYPt() {
    if (getCurrentModel() === "h-mp") {
        return 0; // wrist - left hand
    } else {
        return 0; // nose
    }
}

function addNewAngle() {
    state.angles.push({
        pts: getDefaultAnglePts(),
        cc: nextMidiCC()
    })
    stateHasBeenUpdated()
}
document.getElementById("addNewAngleButton").onclick = addNewAngle


function addNewDistance() {
    state.dist.push({
        pts: getDefaultDistancePts(),
        cc: nextMidiCC()
    })
    stateHasBeenUpdated()
}
document.getElementById("addNewDistanceButton").onclick = addNewDistance

function addNewActivity() {
    state.activity.push({
        pt: getDefaultActivityPt(),
        cc: nextMidiCC()
    })
    stateHasBeenUpdated()
}
document.getElementById("addNewActivityButton").onclick = addNewActivity

function addNewXY() {
    state.xy.push({
        pt: getDefaultXYPt(),
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

            var myNoteLabel = document.createElement('span');

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
            if(state.mappings[id]){
                myNoteLabel.innerHTML = " " +toNoteName(state.mappings[id])
            }

            iDiv.appendChild(checkbox)
            iDiv.appendChild(myLabel)
            iDiv.appendChild(inputField)
            iDiv.appendChild(myNoteLabel)
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

function sendMidiCC(ccChan, val, max) {
    // scaledMin/scaledMax define input thresholds (0-126 scale)
    // Input below min → 0, above max → 126, between → interpolate to 0-126
    var scaledMin = 0;
    var scaledMax = 126
    if(state.sc){// a scaling mapping store
        if(state.sc[""+ccChan]){
            scaledMin = state.sc[""+ccChan].n // min input threshold
            scaledMax = state.sc[""+ccChan].x // max input threshold
        }
    }

    // Normalize input to 0-126 scale
    var inputAs126 = (val / max) * 126
    var inputPercent = (inputAs126 / 126) * 100

    // Apply thresholds and interpolate
    var valToSend;
    if (inputAs126 <= scaledMin) {
        valToSend = 0;
    } else if (inputAs126 >= scaledMax) {
        valToSend = 126;
    } else {
        // Linear interpolation between thresholds
        valToSend = ((inputAs126 - scaledMin) / (scaledMax - scaledMin)) * 126;
    }
    valToSend = Math.round(valToSend);
    var outputPercent = (valToSend / 126) * 100

    // Store values for canvas display
    currentCCValues[ccChan] = { inputPercent: inputPercent, outputPercent: outputPercent }

    if(midiMapIsOpen){
        return;
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
                    var activityCC = state.activity[j].cc;
                    sendMidiCC(activityCC, totalActivity * 300, 127)
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

                    // Draw threshold visualization: arc around circle showing % complete
                    if (hasUserThreshold(activityCC) && currentCCValues[activityCC]) {
                        var outputPercent = currentCCValues[activityCC].outputPercent;
                        var thresholdRadius = 50;
                        var arcAngle = (outputPercent / 100) * 2 * Math.PI;
                        canvasCtx.beginPath();
                        canvasCtx.arc(px1[0], px1[1], thresholdRadius, -Math.PI/2, -Math.PI/2 + arcAngle);
                        canvasCtx.lineWidth = 4;
                        canvasCtx.strokeStyle = getThresholdColor(outputPercent);
                        canvasCtx.stroke();
                    }
                }
            }

            var widthOfCross = 50;
            var thresholdOffset = 8;
            for (var j = state.xy.length - 1; j >= 0; j--) {
                if (state.xy[j].pt == i) {
                    console.log(state.xy[j].i)
                    var xyCC = state.xy[j].cc;
                    if(state.xy[j].i == 0){ // doing x
                        sendMidiCC(xyCC, canvasElement.width - px1[0], canvasElement.width)
                        canvasCtx.beginPath();
                        canvasCtx.lineWidth = 4;
                        canvasCtx.strokeStyle = colorParams[colorID].primaryOutline
                        canvasCtx.moveTo(px1[0], px1[1] - widthOfCross)
                        canvasCtx.lineTo(px1[0], px1[1] + widthOfCross)
                        canvasCtx.stroke()

                        // Draw threshold visualization: vertical line offset to the left, from bottom to top
                        if (hasUserThreshold(xyCC) && currentCCValues[xyCC]) {
                            var outputPercent = currentCCValues[xyCC].outputPercent;
                            var fullLength = widthOfCross * 2;
                            var lineLength = (outputPercent / 100) * fullLength;
                            canvasCtx.beginPath();
                            canvasCtx.lineWidth = 4;
                            canvasCtx.strokeStyle = getThresholdColor(outputPercent);
                            canvasCtx.moveTo(px1[0] - thresholdOffset, px1[1] + widthOfCross)
                            canvasCtx.lineTo(px1[0] - thresholdOffset, px1[1] + widthOfCross - lineLength)
                            canvasCtx.stroke()
                        }
                    }
                    if(state.xy[j].i == 1){ // doing y
                        sendMidiCC(xyCC, canvasElement.height - px1[1], canvasElement.height)
                        canvasCtx.beginPath();
                        canvasCtx.lineWidth = 4;
                        canvasCtx.strokeStyle = colorParams[colorID].primaryOutline
                        canvasCtx.moveTo(px1[0] - widthOfCross, px1[1])
                        canvasCtx.lineTo(px1[0] + widthOfCross, px1[1])
                        canvasCtx.stroke()

                        // Draw threshold visualization: horizontal line offset above, from right to left
                        if (hasUserThreshold(xyCC) && currentCCValues[xyCC]) {
                            var outputPercent = currentCCValues[xyCC].outputPercent;
                            var fullLength = widthOfCross * 2;
                            var lineLength = (outputPercent / 100) * fullLength;
                            canvasCtx.beginPath();
                            canvasCtx.lineWidth = 4;
                            canvasCtx.strokeStyle = getThresholdColor(outputPercent);
                            canvasCtx.moveTo(px1[0] + widthOfCross, px1[1] - thresholdOffset)
                            canvasCtx.lineTo(px1[0] + widthOfCross - lineLength, px1[1] - thresholdOffset)
                            canvasCtx.stroke()
                        }
                    }
                }
            }
            if (isPrimaryPoint(i)) {

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

            // Handle direction indexes for px3 (virtual points 50px from center)
            var px3;
            if (isDirectionIndex(anglePts[2])) {
                var offset = getDirectionOffset(anglePts[2]);
                px3 = [px2[0] + offset.dx, px2[1] + offset.dy];
            } else {
                px3 = normalizedToPixelCoordinates(
                    landmark[anglePts[2]].x,
                    landmark[anglePts[2]].y,
                    canvasElement.width,
                    canvasElement.height)
            }
            var angleFormed = calculateAngle(px1, px2, px3)
            var angleCC = state.angles[angleIndex].cc;

            if(!isNaN(angleFormed)){
                sendMidiCC(angleCC, angleFormed, 180)
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
            canvasCtx.arc(px2[0], px2[1], 50, startAngle, endAngle, !isClockwiseShorter(startAngle,endAngle));
            canvasCtx.lineWidth = 3;
            canvasCtx.strokeStyle = colorParams[colorID].accentColor1_darker;
            canvasCtx.stroke();

            // Draw threshold visualization: second arc showing thresholded %
            if (hasUserThreshold(angleCC) && currentCCValues[angleCC]) {
                var outputPercent = currentCCValues[angleCC].outputPercent;
                var counterClockwise = !isClockwiseShorter(startAngle, endAngle);
                // Calculate the partial arc based on thresholded output
                var fullArcAngle;
                if (counterClockwise) {
                    fullArcAngle = startAngle - endAngle;
                    if (fullArcAngle < 0) fullArcAngle += 2 * Math.PI;
                } else {
                    fullArcAngle = endAngle - startAngle;
                    if (fullArcAngle < 0) fullArcAngle += 2 * Math.PI;
                }
                var partialAngle = (outputPercent / 100) * fullArcAngle;
                var partialEndAngle = counterClockwise ? startAngle - partialAngle : startAngle + partialAngle;

                canvasCtx.beginPath();
                canvasCtx.arc(px2[0], px2[1], 60, startAngle, partialEndAngle, counterClockwise);
                canvasCtx.lineWidth = 4;
                canvasCtx.strokeStyle = getThresholdColor(outputPercent);
                canvasCtx.stroke();
            }
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
            var distCC = state.dist[distanceIndex].cc;
            if(!isNaN(distanceBetween)){
                var diagonal = Math.sqrt(canvasElement.width * canvasElement.width + canvasElement.height * canvasElement.height)
                sendMidiCC(distCC, distanceBetween, diagonal)
            }
            canvasCtx.beginPath();
            canvasCtx.lineWidth = 4;
            canvasCtx.strokeStyle = colorParams[colorID].primaryOutline
            canvasCtx.moveTo(px1[0], px1[1])
            canvasCtx.lineTo(px2[0], px2[1])
            canvasCtx.stroke()

            // Draw threshold visualization: second line beneath showing thresholded %
            if (hasUserThreshold(distCC) && currentCCValues[distCC]) {
                var outputPercent = currentCCValues[distCC].outputPercent;
                // Calculate the direction vector and perpendicular offset
                var dx = px2[0] - px1[0];
                var dy = px2[1] - px1[1];
                var length = Math.sqrt(dx * dx + dy * dy);
                // Normalize and get perpendicular (offset below the line)
                var perpX = -dy / length * 8;
                var perpY = dx / length * 8;
                // Calculate end point based on thresholded percentage
                var endX = px1[0] + dx * (outputPercent / 100);
                var endY = px1[1] + dy * (outputPercent / 100);

                canvasCtx.beginPath();
                canvasCtx.lineWidth = 4;
                canvasCtx.strokeStyle = getThresholdColor(outputPercent);
                canvasCtx.moveTo(px1[0] + perpX, px1[1] + perpY)
                canvasCtx.lineTo(endX + perpX, endY + perpY)
                canvasCtx.stroke()
            }
        }

        prevlandmarks.push(JSON.parse(JSON.stringify(landmark)));
        oldRectCounts = processRectCounts(newRectCounts)
    }

    // Update scaling canvases if modal is open
    if (midiMapIsOpen) {
        updateAllScalingCanvases();
    }

    canvasCtx.restore();
}

function clearEverything() {
    for (var i = 0; i < 40; i++) {
        sendMidiCC(14 + i, 0, 127)
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
        // Default model to pose if not set
        if (!state.md) {
            state.md = "p-mp"
        }
        // Update point arrays based on loaded model
        updatePointArraysForModel()
        // Update model selector if it exists
        var modelSelector = document.getElementById("modelSelector")
        if (modelSelector) {
            modelSelector.value = state.md
        }
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
    HandLandmarker,
    FilesetResolver,
    DrawingUtils
} from "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0";

let poseLandmarker = undefined;
let handLandmarker = undefined;
let currentLandmarker = undefined; // points to whichever model is active
let runningMode = "IMAGE";
let enableWebcamButton;
let webcamRunning = false;
const videoHeight = "360px";
const videoWidth = "480px";

// Model loading functions
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
    return poseLandmarker;
};

const createHandLandmarker = async () => {
    const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
        },
        runningMode: runningMode,
        numHands: 2
    });
    return handLandmarker;
};

// Load the appropriate model based on state
const loadCurrentModel = async () => {
    if (enableWebcamButton) {
        enableWebcamButton.disabled = true;
        enableWebcamButton.innerHTML = "loading...";
    }

    var model = getCurrentModel();
    if (model === "h-mp") {
        if (!handLandmarker) {
            await createHandLandmarker();
        }
        currentLandmarker = handLandmarker;
    } else {
        if (!poseLandmarker) {
            await createPoseLandmarker();
        }
        currentLandmarker = poseLandmarker;
    }

    if (enableWebcamButton) {
        enableWebcamButton.disabled = false;
        enableWebcamButton.innerHTML = "turn on camera";
    }
};

// Switch model and reset recognizer state
async function switchModel(newModel) {
    if (state.md === newModel) return;

    // Reset recognizer-related state (keep box mappings)
    state.md = newModel;
    state.angles = [];
    state.dist = [];
    state.xy = [];
    state.activity = [];
    state.boxEnabled = [];
    state.sc = {}; // reset scaling

    // Update point arrays
    updatePointArraysForModel();

    // Reset landmarks tracking
    prevlandmarks = null;

    // Reset running mode so new model can be configured properly
    runningMode = "IMAGE";

    // Clear and rebuild the body marker checkboxes BEFORE updating display
    document.getElementById('bodyMarkerList').innerHTML = "";
    initState(); // rebuild the body marker checkboxes

    // Reload model
    await loadCurrentModel();

    // If webcam was running, set the new model to VIDEO mode
    if (webcamRunning && currentLandmarker) {
        runningMode = "VIDEO";
        await currentLandmarker.setOptions({ runningMode: "VIDEO" });
    }

    // Update UI (after checkboxes exist)
    stateHasBeenUpdated();
}

// Initialize model selector
document.getElementById("modelSelector").value = getCurrentModel();
document.getElementById("modelSelector").addEventListener("change", function() {
    var newModel = document.getElementById("modelSelector").value;
    switchModel(newModel);
});

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
    enableWebcamButton.disabled = true;
    enableWebcamButton.innerHTML = "loading...";
    enableWebcamButton.addEventListener("click", enableCam);
} else {
    console.warn("getUserMedia() is not supported by your browser");
}

// Load initial model (after enableWebcamButton is set)
loadCurrentModel();
// Enable the live webcam view and start detection.
function enableCam(event) {
    console.log("hi?")
    doCameraFirst()
    console.log("hi? again")
    if (!currentLandmarker) {
        console.log("Wait! landmarker not loaded yet.");
        return;
    }

    enableWebcamButton.style.display = "none"
    document.getElementById("cameraSelect").style.display = "block"

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

    // Show the video container now that dimensions are set
    document.getElementById("wholeThingMaybe").style.display = "block";

    // Now let's start detecting the stream.
    if (runningMode === "IMAGE") {
        runningMode = "VIDEO";
        await currentLandmarker.setOptions({
            runningMode: "VIDEO"
        });
    }
    let startTimeMs = performance.now();
    if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;

        var model = getCurrentModel();
        if (model === "h-mp") {
            // Hand model
            var result = currentLandmarker.detectForVideo(video, startTimeMs);
            // Normalize hand results to match pose format
            var normalizedResult = normalizeHandResult(result);
            doWholeSpecificFunction(normalizedResult);
        } else {
            // Pose model
            currentLandmarker.detectForVideo(video, startTimeMs, (result) => {
                doWholeSpecificFunction(result);
            });
        }
    }
    // Call this function again to keep predicting when the browser is ready.
    if (webcamRunning === true) {
        window.requestAnimationFrame(predictWebcam);
    }
}

// Normalize hand landmarks to match the format expected by doWholeSpecificFunction
// Hand model returns: { landmarks: [[21 points], [21 points]], handednesses: [...] }
// We need: { landmarks: [[42 points]] } where first 21 are left hand, next 21 are right hand
function normalizeHandResult(result) {
    // Create empty landmarks for both hands (42 total points)
    var combinedLandmarks = [];
    for (var i = 0; i < 42; i++) {
        combinedLandmarks.push({ x: 0, y: 0, z: 0, visibility: 0 });
    }

    var hasAnyHand = false;

    if (result.landmarks && result.landmarks.length > 0 && result.handednesses) {
        for (var h = 0; h < result.landmarks.length; h++) {
            var handLandmarks = result.landmarks[h];
            // Skip if no handedness data for this hand
            if (!result.handednesses[h] || !result.handednesses[h][0]) {
                continue;
            }
            var handedness = result.handednesses[h][0].categoryName; // "Left" or "Right"

            // Note: MediaPipe returns "Left" for what appears as right hand in mirrored video
            // Since video is mirrored, "Left" from MediaPipe = right side of screen = "R" in our naming
            var offset = (handedness === "Left") ? 21 : 0; // "Left" from MP -> Right hand -> indices 21-41

            for (var i = 0; i < handLandmarks.length; i++) {
                combinedLandmarks[offset + i] = {
                    x: handLandmarks[i].x,
                    y: handLandmarks[i].y,
                    z: handLandmarks[i].z,
                    visibility: 1
                };
            }
            hasAnyHand = true;
        }
    }

    return {
        landmarks: hasAnyHand ? [combinedLandmarks] : []
    };
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
            allsendbuttons[i].innerHTML = "send pulse"
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

// Scaling canvas functions
function createScalingCanvas(ccnumb) {
    var canvas = document.createElement("canvas");
    canvas.id = "scalingCanvas_" + ccnumb;
    canvas.ccNumber = ccnumb;
    canvas.width = 160;
    canvas.height = 24;
    canvas.style.borderRadius = "3px";
    canvas.style.marginRight = "8px";
    canvas.style.verticalAlign = "middle";
    canvas.style.cursor = "pointer";
    canvas.style.background = "#222";

    // Track dragging state
    canvas.dragging = null; // 'min' or 'max' or null

    canvas.addEventListener("mousedown", function(e) {
        var rect = canvas.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var percent = (x / canvas.width) * 100;

        // Get current min/max
        var minPercent = 0;
        var maxPercent = 100;
        if (state.sc && state.sc["" + ccnumb]) {
            minPercent = (state.sc["" + ccnumb].n / 126) * 100;
            maxPercent = (state.sc["" + ccnumb].x / 126) * 100;
        }

        // Determine which line is closer
        var distToMin = Math.abs(percent - minPercent);
        var distToMax = Math.abs(percent - maxPercent);

        if (distToMin < distToMax && distToMin < 10) {
            canvas.dragging = 'min';
        } else if (distToMax < 10) {
            canvas.dragging = 'max';
        } else if (distToMin < distToMax) {
            canvas.dragging = 'min';
        } else {
            canvas.dragging = 'max';
        }
    });

    canvas.addEventListener("mousemove", function(e) {
        if (!canvas.dragging) return;

        var rect = canvas.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var percent = Math.max(0, Math.min(100, (x / canvas.width) * 100));
        var midiVal = Math.round((percent / 100) * 126);

        // Initialize state.sc if needed
        if (!state.sc) state.sc = {};
        if (!state.sc["" + ccnumb]) state.sc["" + ccnumb] = { n: 0, x: 126 };

        if (canvas.dragging === 'min') {
            // Don't let min exceed max
            var currentMax = state.sc["" + ccnumb].x;
            state.sc["" + ccnumb].n = Math.min(midiVal, currentMax);
        } else if (canvas.dragging === 'max') {
            // Don't let max go below min
            var currentMin = state.sc["" + ccnumb].n;
            state.sc["" + ccnumb].x = Math.max(midiVal, currentMin);
        }

        drawScalingCanvas(canvas);
        stateHasBeenUpdated();
    });

    canvas.addEventListener("mouseup", function(e) {
        canvas.dragging = null;
    });

    canvas.addEventListener("mouseleave", function(e) {
        canvas.dragging = null;
    });

    return canvas;
}

function drawScalingCanvas(canvas) {
    var ctx = canvas.getContext("2d");
    var width = canvas.width;
    var height = canvas.height;
    var ccnumb = canvas.ccNumber;

    // Clear and draw background
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, width, height);

    // Get current values
    var inputPercent = 0;
    var outputPercent = 0;
    if (currentCCValues[ccnumb]) {
        inputPercent = currentCCValues[ccnumb].inputPercent;
        outputPercent = currentCCValues[ccnumb].outputPercent;
    }

    // Get min/max settings
    var minPercent = 0;
    var maxPercent = 100;
    if (state.sc && state.sc["" + ccnumb]) {
        minPercent = (state.sc["" + ccnumb].n / 126) * 100;
        maxPercent = (state.sc["" + ccnumb].x / 126) * 100;
    }

    var barHeight = 8;
    var topBarY = 2;
    var bottomBarY = height - barHeight - 2;

    // Top bar (input) - purple
    ctx.fillStyle = "#c850c8";
    ctx.fillRect(0, topBarY, (inputPercent / 100) * width, barHeight);

    // Bottom bar (output) - darker purple
    ctx.fillStyle = "#a030a0";
    ctx.fillRect(0, bottomBarY, (outputPercent / 100) * width, barHeight);

    // Draw min line (white)
    var minX = (minPercent / 100) * width;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(minX, 0);
    ctx.lineTo(minX, height);
    ctx.stroke();

    // Draw max line (white)
    var maxX = (maxPercent / 100) * width;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(maxX, 0);
    ctx.lineTo(maxX, height);
    ctx.stroke();
}

function updateAllScalingCanvases() {
    for (var ccnumb in currentCCValues) {
        var canvas = document.getElementById("scalingCanvas_" + ccnumb);
        if (canvas) {
            drawScalingCanvas(canvas);
        }
    }
}

function createMidiMapDiv(ccnumb, label){
    var newdiv = document.createElement("div")
    var sendButton = document.createElement("button")
    sendButton.innerHTML = "send pulse"
    sendButton.ccNumber = ccnumb
    sendButton.classList.add("sendButton")
    sendButton.classList.add("sendButtonNormal")
    sendButton.style.marginRight = "5px"
    sendButton.style.width = "80px"
    sendButton.onclick = (event)=>{
        event.target.innerHTML = "waiting..."
        var doDelay = document.getElementById("doDelay").checked
        var delayTime = 1
        if(doDelay){
            delayTime = 3000
        }
        console.log("Do Delay:" + delayTime)
        setTimeout(()=>{
            event.target.innerHTML = "sending..."
            console.log(event.target.ccNumber)
            sendPulse(event.target, event.target.ccNumber)            
        },delayTime)
    }
    var scalingCanvas = createScalingCanvas(ccnumb)
    var labelSpan = document.createElement("span")
    labelSpan.innerHTML = ccnumb +" - "+label
    newdiv.appendChild(sendButton)
    newdiv.appendChild(scalingCanvas)
    newdiv.appendChild(labelSpan)
    newdiv.ccNumber = ccnumb

    // Initial draw
    drawScalingCanvas(scalingCanvas)

    return newdiv
}

function renderInsidesOfMidiModal(){
    document.getElementById("midimaplist").innerHTML = ""
    var divsToAdd = []

    for (var i = 0; i < state.angles.length; i++) {
        var angleLabel = getPointLabel(state.angles[i].pts[0])+", "+getPointLabel(state.angles[i].pts[1])+", "+getPointLabel(state.angles[i].pts[2])
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
        var label = "distance: "+distLabel
        divsToAdd.push(createMidiMapDiv(state.dist[i].cc, label))
    }
    for (var i = 0; i < state.xy.length; i++) {
        var xyLabel = allPoints[state.xy[i].pt]+" - "+(["X","Y"][state.xy[i].i])
        var label = "xy: "+xyLabel
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
    document.getElementById("delayCheckboxArea").style.display = "block"
    if(divsToAdd.length == 0){
        var newdiv = document.createElement("div")
        newdiv.innerHTML = "No midi CC channels to send. Please create new outputs first by adding a new activity, distance, angle, or XY, and then come back here to map them."
        document.getElementById("midimaplist").appendChild(newdiv)
        document.getElementById("delayCheckboxArea").style.display = "none"
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


