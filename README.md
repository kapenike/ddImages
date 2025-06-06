# phpMyStreamOverlay
automated stream overlays for OBS using html 5 canvas, JavaScript and PHP

> this code is pre-alpha and not fully commented or structured

## To-DO
- [ ] Create UI builder with use of data from assets and `data structure` along with data from `data.sets`
	- [x] Create checkbox form element
	- [x] Allow drag and drop sorting of UI elements
		- [x] Create hook to reset UI listeners on navigation change
	- Create contextmenu override for:
		- Editing, removing and creatings sections
		- Editing, removing and creating field entries (allow data set entry)
		- Create method for selecting data structure element
		- Create input field that is just text that can read real time data to display with `getRealValue`
- [ ] Convert UID system to random UID rather than incremental, this is to prevent (future) exports and imports alongside an OBS export from creating disconnects with overlays sources
	-	Setup should mention that using documents to house this application is a good idea ... for the same reason mentioned above
- [ ] Allow creation of more data sets like teams `data.sets.teams`
- [ ] Create ability to delete teams and assets along with a notification system
- [ ] Create bracket system
	- Import bracket details into `data` property during import of tournament data
	- Allow creation of a bracket and seeding it with data from teams
		- Bracket data will exist within `data` for access within overlays but be restricted at a higher level
	- Create `bracket_data.json` and `bracket_ui.json` objects and structure so that the data is editable and accessible at each level of the bracket system (for use in overlays)
		- Unlike `data` or `ui` ... this objects will contain existing data like opposing teams, score, outcome, etc. This is for use in the bracketing system and will not be editable.
	- Prevent removal of teams currently seeded in the bracket
- [ ] Request god extend days by 4 hours each and then create an overlay editor
- [ ] More complex path variable comparisons



- [ ] Final rewrite with a TOP for creating new broadcasts
