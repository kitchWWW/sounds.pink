# sounds.pink
### turn motion into midi

## overview of product
sounds.pink is a pipeline for harnessing AI to allow you to translate movement, emotions, and device orientation into midi control data. Thus, it consists of a web site ([sounds.pink](https://sounds.pink)) that takes your position inputs, and a desktop application that contacts the server and outputs this data as midi information.

## overview of code
Two things live in this repo:

- the website housed under app
- the desktop application housed under zdesktop

the site is accessible online at [https://sounds.pink](https://sounds.pink)

Currently we are in "make it work" mode.

## todo list:

- The desktop application can only forward midi information for EMOTION, not POSE or DEVICE. This is the #1 priority.
- Windows.
- linux.
- midi smoothing so the controls don't jump around sporadically. 
- cleaning up old position files after a user has not messed with it for 24 hours.

If anyone wants to work on this with me, I would love to have some help making this project run!

