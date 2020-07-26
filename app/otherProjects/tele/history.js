function getUrlVars() {
	var vars = {};
	var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
		vars[key] = value;
	});
	return vars;
}

function copyURLToCliboard(){
	 /* Get the text field */
  var copyText = document.getElementById("myInput");

  /* Select the text field */
  copyText.select();
  copyText.setSelectionRange(0, 99999); /*For mobile devices*/

  /* Copy the text inside the text field */
  document.execCommand("copy");
}

function backToStart(){
  window.location.href = '/otherProjects/tele'
}

async function getData(url = '') {
	// Default options are marked with *
	const response = await fetch(url, {
		method: 'GET', // *GET, POST, PUT, DELETE, etc.
		mode: 'cors', // no-cors, *cors, same-origin
		cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
		credentials: 'same-origin', // include, *same-origin, omit
		headers: {
			'Content-Type': 'application/json'
			// 'Content-Type': 'application/x-www-form-urlencoded',
		},
		redirect: 'follow', // manual, *follow, error
		referrerPolicy: 'no-referrer' // no-referrer, *client
	});
	return await response.json(); // parses JSON response into native JavaScript objects
}

function makeIndexFromKey(index){
	return 's'+index+'_Anon';
}


console.log(getUrlVars())
var clipToUse = getUrlVars()['clipToUse'];
document.getElementById("myInput").value=window.location.origin+'/otherProjects/tele/play.html?clipToUse='+clipToUse+'&jumpToEndOfChain=true';

getData('tree.json').then((tree) => {
	indexToLookFor = makeIndexFromKey(clipToUse);
	lineage = [indexToLookFor]
	while(tree.hasOwnProperty(indexToLookFor)){
		console.log(indexToLookFor)
		indexToLookFor = tree[indexToLookFor]
		lineage.push(indexToLookFor)
	}

	var table = document.createElement('table');



	for(var i = 0; i < lineage.length; i++){
		leftText = ' '
		if(i == lineage.length-1){
			leftText = 'Origional:'
		}
		if(i == 0){
			leftText = 'You:'
		}
		var tr = document.createElement('tr');
		var td1 = document.createElement('td');
		var td2 = document.createElement('td');
		var text1 = document.createTextNode(leftText);
		td2.innerHTML = '<audio id="audio-player" controls="controls" src="recordings/'+lineage[i]+'" type="audio/raw">'
		td1.appendChild(text1);
		tr.appendChild(td1);
		tr.appendChild(td2);
		table.appendChild(tr);
	}
	document.getElementById('tableForHistory').appendChild(table);

});