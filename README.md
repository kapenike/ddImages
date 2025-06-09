# phpMyStreamOverlay
automated stream overlays for OBS using html 5 canvas, JavaScript and PHP

> this code is pre-alpha and not fully commented or structured

## To-DO
- [ ] Create UI builder with use of data from assets and `data structure` along with data from `data.sets`
	- [x] Create checkbox form element
	- [x] Allow drag and drop sorting of UI elements
		- [x] Create hook to reset UI listeners on navigation change
	- [ ] create variable path and variable path + real text input fields
		- [ ] create method for accessing a data sets values directly from the set value rather than requiring sub setters to save it in the data structure
		- [ ] allow save and load of this data into editor during context menu override below
		- [ ] restrict path selection input field paths based on GLOBAL.data_structure.ignored during source setting or value setting as path only
		- [ ] restrict value setting of `assets` and `sets` sub data BUT allow access when requesting source of data (`sets` only)
		- [ ] force path only on `assets` during value set
	[ ] Create contextmenu override for:
		- Editing, removing and creatings sections
		- Editing, removing and creating field entries (allow data set entry)
		- Create method for selecting data structure element
		- Create input field that is just text that can read real time data to display with `getRealValue`
- [ ] Allow creation of more data sets like teams `data.sets.teams`
- [ ] Create ability to delete assets
- [ ] Create bracket system
	- Import bracket details into `data` property during import of tournament data
	- Allow creation of a bracket and seeding it with data from teams
		- Bracket data will exist within `data` for access within overlays but be restricted at a higher level
	- Create `bracket_data.json` and `bracket_ui.json` objects and structure so that the data is editable and accessible at each level of the bracket system (for use in overlays)
		- Unlike `data` or `ui` ... this objects will contain existing data like opposing teams, score, outcome, etc. This is for use in the bracketing system and will not be editable.
	- Prevent removal of teams currently seeded in the bracket
- [ ] notifications
- [ ] overlay editor
- [ ] More complex path variable comparisons



- [ ] Final rewrite with a TOP for creating new broadcasts
- [ ] Documentation