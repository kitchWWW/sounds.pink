// inlets and outlets
inlets = 1;
outlets = 1;

function msg_float(v)
{
	input = v;
	if(input < 0){
		input = - input		
	}
	if(input > 180){
		input = input - 180
	}
	if(input > 90){
		input = 90 - (input - 90)		
	}
	input = input/90.0
	outlet(0, input);
}