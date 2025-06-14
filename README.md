# phpMyStreamOverlay
automated stream overlays for OBS using html 5 canvas, JavaScript and PHP

> this code is pre-alpha and not fully commented or structured

## To-DO
- QOL
	- [ ] After edit to UI field, its source should be logged for change in overlays
	- [ ] Text only field that shows data live rather than setting input
	- [ ] Determine if php init can be overriden from init_set for max file upload size or if instructions for setting value is required
	- [ ] Allow creation of more data sets like teams `data.sets.teams`
	- [ ] More complex path variable comparisons for overlay toggles
	- [ ] notifications
	- [ ] information icons for displaying what tools do
- BUGS
	- [ ] UI editor on hover leaves drag borders on some elements (non direct parent references issue)
- [ ] Create ability to delete assets
- [ ] Create base layer editor to later expand on for a GUI editor
- [ ] Create bracket system
	- Import bracket details into `data` property during import of tournament data
	- Allow creation of a bracket and seeding it with data from teams
		- Bracket data will exist within `data` for access within overlays but be restricted at a higher level
	- Create `bracket_data.json` and `bracket_ui.json` objects and structure so that the data is editable and accessible at each level of the bracket system (for use in overlays)
		- Unlike `data` or `ui` ... this objects will contain existing data like opposing teams, score, outcome, etc. This is for use in the bracketing system and will not be editable.
		- variable input field creation will need a new parameter to change base from `/data/` to `/data/bracket/`
	- Prevent removal of teams currently seeded in the bracket
- [ ] overlay editor
- [ ] Final rewrite with a TOP for creating new broadcasts
- [ ] Documentation