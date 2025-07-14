# phpMyStreamOverlay
automated stream overlays for OBS using html 5 canvas, JavaScript and PHP

> this code is pre-alpha and not fully commented or structured

## To-DO

hot list
- overlay editor
	- create clipping square only paths and allow background fill color

- BETA release
	- overlay editor
		- [ ] create rects
		- [ ] hotkeys for moving layer on x / y axis or by a smaller pixel per dpi margin
		- [ ] allow moving and zooming of current project with mouse wheel and hotkeys
		- [ ] allow move / duplicate / remove multiple layers at once
		- [ ]  allow data management and asset upload from within the editor
	- [ ] settings: delete tournament, export / import tournament
	- [ ] notifications
	- [ ] Documentation / video
	- [ ] Webhook connect to source change for browser sources

- Full release features
	- [ ] allow webhook / browser source overlay that generates canvas images in real-time allowing transitions of toggle / display elements
	
- BUGS
	- [ ] Head feature to prevent infinite loops in getRealValue will also prevent the same variable path from being printed twice within the same line