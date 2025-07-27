# FSD[ ddImages ]
![Dynamic Data Images](/logo.png)
- Automate image changes using custom data fields, datasets and asset lists.
- Utilize PHP's built-in web server to create tools and displays with a live browser source (paired to dynamic data changes).

> ddImage changes will automatically update live in an OBS scene

## To-DO

- BETA release
	- [x] remove teams and just use datasets, improve dataset logic
	- overlay editor
		- [x] fix issue with layer sorting on larger project
		- [x] allow drag move of elements within a group AND the group as a whole
		- [ ] allow point path clipping for group layers
		- [x] custom color picker with access to variable input instead
		- [x] hotkeys for moving layer on x / y axis or by a smaller pixel per dpi margin
		- [x] allow moving and zooming of current project with mouse wheel and hotkeys
			- [x] added ctrl + d as layer selection removal
		- ez
			- [x] precision round off on positioning
			- [x] UI element for settings position of x and y based on percentage of screen
				- [x] allow offset to be from the left, center or right of element just like text
		- [ ] hotkey click to selected layers / mouse wheel to scroll through selection layers without mouse click region
	- [ ] settings: delete tournament, export / import tournament
	- [x] rename tournament to project
	- [ ] font manager
	- [ ] Webhook connect to source change for browser sources
		- [ ] Make browser sources easier for devs to import, front end and backend all in the same location and a registry to import them
	- [ ] Documentation

- FULL release features
	- [ ] restructure code and break large code bases into manageable classes with sub methods
	- [ ] create shapes, lines, cropping, clip from and more creation tools on the overlay editor
	- [ ] offer color picker as a tool for variable inputs (set statically within code)
	
- BUGS
	- [ ] Head feature to prevent infinite loops in getRealValue will also prevent the same variable path from being printed twice within the same line
	- [ ] data sets variable inputs dont log whether a value was set as a reference and doesnt re-check the box for path only reference when revisiting the dataset