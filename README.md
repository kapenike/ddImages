# phpMyStreamOverlay
automated stream overlays for OBS using html 5 canvas, JavaScript and PHP

> this code is pre-alpha and not fully commented or structured

## To-DO

- BETA release
	- overlay editor
		- [ ] fix issue with layer sorting on larger project
		- [ ] allow drag move of elements within a group AND the group as a whole
		- [ ] allow any static input to be converted to a variable input
		- [ ] create rects
		- [ ] hotkeys for moving layer on x / y axis or by a smaller pixel per dpi margin
		- [ ] allow moving and zooming of current project with mouse wheel and hotkeys
		- [ ] allow move / duplicate / remove multiple layers at once
		- [ ] allow data management and asset upload from within the editor
		- ez
			- [ ] precision round off on positioning
			- [ ] ensure percentage positioning works
			- [ ] allow offset to be from the left, center or right of element just like text
	- [ ] settings: delete tournament, export / import tournament
	- [ ] notifications
	- [ ] Documentation / video
	- [ ] Webhook connect to source change for browser sources

- Full release features
	- [ ] allow webhook / browser source overlay that generates canvas images in real-time allowing transitions of toggle / display elements
	- [ ] consider possible options for controlling obs scenes on a timer and maybe creating the scene entirely from within this app using the OBS webhook api
	
- BUGS
	- [ ] Head feature to prevent infinite loops in getRealValue will also prevent the same variable path from being printed twice within the same line