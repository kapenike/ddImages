# phpMyStreamOverlay
automated stream overlays for OBS using html 5 canvas, JavaScript and PHP

> this code is alpha and not fully commented or structured

## To-DO

- BETA release
	- [ ] remove teams and just use datasets, improve dataset logic
	- overlay editor
		- [ ] fix issue with layer sorting on larger project
		- [x] allow drag move of elements within a group AND the group as a whole
		- [ ] allow point path clipping for group layers
		- [ ] allow any static input to be converted to a variable input on the fly, revert color field from static variable input (change for recent tournament)
		- [ ] create shapes
		- [ ] hotkeys for moving layer on x / y axis or by a smaller pixel per dpi margin
		- [ ] allow moving and zooming of current project with mouse wheel and hotkeys
		- [ ] allow move / duplicate / remove multiple layers at once
		- [ ] allow data management and asset upload from within the editor
		- ez
			- [x] precision round off on positioning
			- [ ] UI element for settings position of x and y based on percentage of screen
				- [ ] allow offset to be from the left, center or right of element just like text
		- [ ] break massive code file into manageable portions
	- [ ] settings: delete tournament, export / import tournament
	- [ ] rename tournament to project
	- [ ] notifications
	- [ ] Documentation / video
	- [ ] Webhook connect to source change for browser sources
		- [ ] Make browser sources easier for devs to import, front end and backend all in the same location and a registry to import them

	
- BUGS
	- [ ] Head feature to prevent infinite loops in getRealValue will also prevent the same variable path from being printed twice within the same line