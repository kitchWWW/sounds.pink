// inlets and outlets
inlets = 1;
outlets = 2;

function jsonToOSC(prefix, val, obj){
	if (typeof obj == 'object'){
		for(k in obj){
			jsonToOSC(prefix+'/'+val,k,obj[k])
		}
	}else{
		outlet(0, prefix+'/'+val+' '+obj);
	}
}


function anything()
{
	var a = arrayfromargs(messagename, arguments);
	try{
		var b = JSON.parse(a);
		jsonToOSC('','raw',b.raw);
	}catch(err){
		outlet(1, 0);
		outlet(0, "incomplete_json");
	}
}