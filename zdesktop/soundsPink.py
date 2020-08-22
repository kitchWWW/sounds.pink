import threading
from random import randrange
import time
import rtmidi
import json
import urllib.request
import urllib.parse
from tkinter import *

SOUNDS_PINK = 'sounds.pink'
NO_OUT_SELECTED = 'no output selected'
CUSTOM_CODE_NONE = '[NONE]'
CUSTOM_CODE_INVALID = '[INVALID]'
CUSTOM_CODE_CHECKING = '[CHECKING]'
CUSTOM_CODE_VALID = '[VALID]'

CUSTOM_CODE_ENTERED = CUSTOM_CODE_NONE
CUSTOM_CODE = CUSTOM_CODE_NONE
MIDI_PORT_SELECTED = NO_OUT_SELECTED

CUSTOM_CODE_IS_VALID = {}


HTML_FETCH_STATUS_GOOD = 'html is good'
HTML_FETCH_STATUS_BAD = 'html is nope'


JSON_PARSE_STATUS_GOOD = 'json is good'
JSON_PARSE_STATUS_BAD = 'json is no nope no way'

JSON_STATUS = 'status'

#### MIDI SETUP SECTION

midiout = rtmidi.MidiOut()
available_ports = midiout.get_ports()
allPorts = {}
print(available_ports)
HAS_VIRTUAL_PORTS = False
try:
	midiout.open_virtual_port(SOUNDS_PINK)
	allPorts[SOUNDS_PINK] = midiout
	HAS_VIRTUAL_PORTS = True
	MIDI_PORT_SELECTED = SOUNDS_PINK
except Error as e:
	print("unable to open virtual port")
	print(e)
# find all availiable output ports and open a connection to all of them
allPorts[NO_OUT_SELECTED] = NO_OUT_SELECTED
if available_ports:
	for i in range(len(available_ports)):
		outputPort = rtmidi.MidiOut()
		outputPort.open_port(i)
		allPorts[available_ports[i]] = outputPort
		print(allPorts)

available_ports.insert(0,NO_OUT_SELECTED)

if(HAS_VIRTUAL_PORTS):
	available_ports.insert(0,SOUNDS_PINK)


### THE ACTUAL LOGIC

def fetchJsonFromWeb():
	global CUSTOM_CODE
	if(CUSTOM_CODE == CUSTOM_CODE_NONE):
		return {'status':HTML_FETCH_STATUS_BAD}
	try:
		url = 'https://sounds.pink/positions/position_{0}.json'.format(CUSTOM_CODE)
		f = urllib.request.urlopen(url)
		res = f.read().decode('utf-8')
		payloadData = json.loads(res)
		# do something about this to prevent people from opening the same thing
		web_browser_id = payloadData['id']
		positionData = payloadData['pos']
		payloadData['status']=HTML_FETCH_STATUS_GOOD
		return payloadData
	except Exception as e:
		return {'status':str(e)}


def turnJsonIntoMidi(jsonOBJ):
	if(jsonOBJ['status'] != HTML_FETCH_STATUS_GOOD):
		return {'pos':{}}
	pos = {}
	startingCC = 14
	if('neutral' in jsonOBJ['pos']):
		# then it is emotion one!
		for k in jsonOBJ['pos']:
			pos[k] = {
				'cc':startingCC,
				'val':round(jsonOBJ['pos'][k]*127,0)
			}
			startingCC+=1
	elif('alpha' in jsonOBJ['pos']):
		# then it is emotion one!
		for k in jsonOBJ['pos']:
			valToUse = abs(jsonOBJ['pos'][k])
			
			while valToUse > 180:
				valToUse = valToUse - 180;
			while valToUse > 90:
				valToUse = valToUse - 90;
			valToUse = round((valToUse / 90.0) * 127)
			pos[k] = {
				'cc':startingCC,
				'val':valToUse
			}
			startingCC+=1
	elif('angleOfHead' in jsonOBJ['pos']):
		# then it is the pose one, and we do the math on the website.
		for k in jsonOBJ['pos']:
			valToUse = abs(jsonOBJ['pos'][k])
			pos[k] = {
				'cc':startingCC,
				'val':valToUse
			}
			startingCC+=1
	return {
		'status':JSON_PARSE_STATUS_GOOD,
		'pos': pos
	}




def sendMidiData(jsonOBJ):
	global MIDI_PORT_SELECTED;
	if(MIDI_PORT_SELECTED == NO_OUT_SELECTED):
		return;
	for k in jsonOBJ:
		shouldSend = True
		try:
			if(GLOBAL_allMidiTableUpdateCheckboxValues[k] == 0):
				shouldSend = False
		except:
			pass
		if(shouldSend):
			updateMessage = [176,jsonOBJ[k]['cc'],jsonOBJ[k]['val']]
			allPorts[MIDI_PORT_SELECTED].send_message(updateMessage)
			time.sleep(0.0001)


def doMidiStuff():
	global CUSTOM_CODE_IS_VALID
	global CUSTOM_CODE
	global midiWeAreSending
	if(CUSTOM_CODE != CUSTOM_CODE_NONE and CUSTOM_CODE != CUSTOM_CODE_INVALID and CUSTOM_CODE_IS_VALID[CUSTOM_CODE] != CUSTOM_CODE_INVALID):
		if(randrange(20) == 0):
			ret = fetchJsonFromWeb()
			if(ret['status'] == HTML_FETCH_STATUS_GOOD):
				ret = turnJsonIntoMidi(ret)
				CUSTOM_CODE_IS_VALID[CUSTOM_CODE] = CUSTOM_CODE_VALID
				sendMidiData(ret['pos'])
				midiWeAreSending = ret['pos'];
			elif(str(ret['status']).startswith('HTTP Error 404:')):
				CUSTOM_CODE_IS_VALID[CUSTOM_CODE] = CUSTOM_CODE_INVALID
			else:
				# probably is just a JSON parsing error from reading while the server was writing. try again later.
				pass

def doMidiLoop():
	while 1:
		doMidiStuff()


##### UI CODE


OPTIONS = available_ports #etc


GLOBAL_allMidiTableUpdateCheckboxValues = {}

allMidiTableUpdateSVs = {}
allMidiTableUpdateLabels = {}
allMidiTableUpdateCVs = {}
allMidiTableUpdateCBs = {}
gridRowToAddAt = 3
midiWeAreSending = {}

def updateMidiTable(master):
	global gridRowToAddAt
	global midiWeAreSending
	global GLOBAL_allMidiTableUpdateCheckboxValues
	for k in midiWeAreSending:
		if(not k in allMidiTableUpdateSVs):
			sv = StringVar()
			cv = IntVar()
			label = Label(master, textvariable=sv)
			label.grid(row=gridRowToAddAt,column=1)
			checkbutton = Checkbutton(master, text = '', variable = cv, \
				 onvalue = 1, offvalue = 0)
			checkbutton.grid(row=gridRowToAddAt,column=0)
			checkbutton.select()
			allMidiTableUpdateSVs[k] = sv
			allMidiTableUpdateCVs[k] = cv
			allMidiTableUpdateLabels[k] = label
			allMidiTableUpdateCBs[k] = checkbutton

		allMidiTableUpdateSVs[k].set("{0} -> cc {1}, currently: {2}".format(k, midiWeAreSending[k]['cc'],midiWeAreSending[k]['val']))
		allMidiTableUpdateLabels[k].config(fg="black")
		GLOBAL_allMidiTableUpdateCheckboxValues[k] = allMidiTableUpdateCVs[k].get()
		gridRowToAddAt+=1

	for k in allMidiTableUpdateSVs:
		if(k not in midiWeAreSending):
			allMidiTableUpdateSVs[k].set('no current data for {0}'.format(k))
			allMidiTableUpdateLabels[k].config(fg="#AAAAAA")

def doClose():
	print("closing!")

def updateInformLabel(master):
	global CUSTOM_CODE
	global CUSTOM_CODE_IS_VALID
	global MIDI_PORT_SELECTED
	
	CUSTOM_CODE_ENTERED = custom_code_sv.get()
	
	if(CUSTOM_CODE_ENTERED == ''):
		CUSTOM_CODE = CUSTOM_CODE_NONE
		CUSTOM_CODE_IS_VALID[CUSTOM_CODE_ENTERED] = CUSTOM_CODE_NONE
	elif(len(CUSTOM_CODE_ENTERED) < 4 or len(CUSTOM_CODE_ENTERED) > 4):
		CUSTOM_CODE = CUSTOM_CODE_INVALID
		CUSTOM_CODE_IS_VALID[CUSTOM_CODE_ENTERED] = CUSTOM_CODE_INVALID
	else:
		CUSTOM_CODE = CUSTOM_CODE_ENTERED;

	if(CUSTOM_CODE == CUSTOM_CODE_NONE or CUSTOM_CODE == CUSTOM_CODE_INVALID):
		v.set("Please enter a 4 digit custom code")	
	elif(CUSTOM_CODE_IS_VALID[CUSTOM_CODE_ENTERED] == CUSTOM_CODE_CHECKING):
		v.set("Checking custom code {0}...".format(custom_code_sv.get()))
	elif(CUSTOM_CODE_IS_VALID[CUSTOM_CODE_ENTERED] == CUSTOM_CODE_INVALID):
		v.set("Invalid code {0}, please re-enter".format(custom_code_sv.get()))
	elif(CUSTOM_CODE_IS_VALID[CUSTOM_CODE_ENTERED] == CUSTOM_CODE_VALID):
		if(MIDI_PORT_SELECTED == NO_OUT_SELECTED):
			v.set("accepting data from {0}, but no out selected".format(CUSTOM_CODE_ENTERED))
		else:
			v.set("sending data from {0} to {1}".format(CUSTOM_CODE_ENTERED,MIDI_PORT_SELECTED))
	else:
		v.set("you should never see this message.")



def OptionMenu_SelectionEvent(event):
	global MIDI_PORT_SELECTED
	print(event);
	MIDI_PORT_SELECTED = event

def UpdateCustomCode(self, *args):
	global midiWeAreSending
	CUSTOM_CODE_IS_VALID[custom_code_sv.get()] = CUSTOM_CODE_CHECKING
	print(custom_code_sv.get())
	midiWeAreSending = {}
	return True

custom_code_sv = None 
v = None

def threadmain():
	global custom_code_sv
	global v
	master = Tk()
	master.title("sounds.pink")
	custom_code_sv = StringVar()
	v = StringVar()

	label0 = Label(master, text="midi output:").grid(row=0)
	label1 = Label(master, text="custom code:").grid(row=1)
	label2 = Label(master, textvariable=v).grid(row=2,columnspan=2)

	custom_code_sv.trace_add("write", UpdateCustomCode)

	variable = StringVar(master)
	variable.set(OPTIONS[0]) # default value
	e = Entry(master, textvariable=custom_code_sv, validate="focusout", validatecommand=UpdateCustomCode)
	e.grid(row=1,column=1)

	w = OptionMenu(master, variable, *OPTIONS, command=OptionMenu_SelectionEvent)
	w.grid(row=0,column=1)

	master.bind_all("<Control-q>", doClose)

	updateInformLabel(master)

	new_thread = threading.Thread(target=doMidiLoop)
	new_thread.start()

	while True:
		updateInformLabel(master)
		updateMidiTable(master)
		master.update_idletasks()
		master.update()



if __name__ == '__main__':
	threadmain()




