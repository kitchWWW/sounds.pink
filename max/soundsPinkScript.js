// inlets and outlets
inlets = 1;
outlets = 1;


function anything()
{
	var a = arrayfromargs(messagename, arguments);
	try{
		var b = JSON.parse(a);
		for(k in b.pos){
			outlet(0, [k,b.pos[k]]);
		}
	}catch(err){
		outlet(0, "incomplete_json")
	}
}