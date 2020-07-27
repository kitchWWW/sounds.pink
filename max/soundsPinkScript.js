// inlets and outlets
inlets = 1;
outlets = 1;


function anything()
{
	try{
		var a = arrayfromargs(messagename, arguments);
		var b = JSON.parse(a);
		for(k in b.pos){
			outlet(0, k+" "+b.pos[k]);
		}
	}catch(err){
		outlet(0, "invalid_code")
	}
}