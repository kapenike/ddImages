# phpMyStreamOverlay
automated stream overlays for OBS using html 5 canvas, JavaScript and PHP

> this code is pre-alpha and not fully commented or structured

## To-DO

hot list
- overlay editor
	- create clipping paths and allow background fill color

- source tracking for text isnt smart enough to update long chained set references for text display
	- pair up with all head values found during getRealValue rather than intial source
- Allow creation of more data sets like teams `data.sets.teams`


- TODO
	- [ ] overlay editor
		- create rects
		- hotkeys for moving layer on x / y axis or by a smaller pixel per dpi margin
		- allow moving and zooming of current project with mouse wheel and hotkeys
		- allow move / duplicate / remove multiple layers at once
	- [ ] settings: delete tournament, export / import tournament
	- [ ] notifications
	- [ ] Documentation
- FUTURE
	- [ ] Webhook connect to source change for browser sources
	- [ ] Bracket system