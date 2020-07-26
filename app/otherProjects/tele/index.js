
function getUrlVars() {
	var vars = {};
	var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
		vars[key] = value;
	});
	return vars;
}


var allRecordingOptions = [];

askForRecordings();

function askForRecordings() {
	var url = "/teleListRecordings";
	var request = new XMLHttpRequest();
	request.open('GET', url, true);
	request.onload = function() {
		unfilteredList = JSON.parse(request.responseText)
		console.log(unfilteredList);
		unfilteredList.forEach(function(e) {
			if (e == '.DS_Store') {
				return;
			}
			e = e.replace('s', '')
			e = e.replace('_Anon', '')
			allRecordingOptions.push(parseInt(e))
		})
		console.log(allRecordingOptions);
	};
	request.onerror = function() {
		console.log("whoops!")
	};
	request.send();
}

function joinRandom() {
	idToUse = allRecordingOptions[Math.floor(Math.random() * allRecordingOptions.length)];
	window.location.replace(window.location.origin + '/otherProjects/tele/play.html?clipToUse=' + idToUse+'&jumpToEndOfChain=true');
}

function joinMostRecent() {
	idToUse = Math.max(...allRecordingOptions);
	window.location.replace(window.location.origin + '/otherProjects/tele/play.html?clipToUse=' + idToUse+'&jumpToEndOfChain=true');
}


function startNew() {
	window.location.replace(window.location.origin + '/otherProjects/tele/new.html');
}