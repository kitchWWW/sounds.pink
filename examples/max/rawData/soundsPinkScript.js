// inlets and outlets
inlets = 1;
outlets = 2;


function anything()
{
	var a = arrayfromargs(messagename, arguments);
	try{
		var b = JSON.parse(a);
		for(k in b.pos){
			outlet(1, parseFloat(b.pos[k]));
			outlet(0, k);
		}
	}catch(err){
		outlet(1, 0);
		outlet(0, "incomplete_json");
	}
}