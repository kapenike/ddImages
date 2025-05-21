# phpMyStreamOverlay
automated stream overlays for OBS using html 5 canvas, JavaScript and PHP

> this code is pre-alpha and not fully commented or structured

## To-DO
- [] Return tournament data entry but allow data structure and data ui to be changed within the application
	- [x] Pull tournament data entry ui generation out of `nav_tournament_data.js` and convert into a method
	- [x][] Create sub tab structure for **Modify Structure** and **Modify UI** sub navigation
	- [x] Create method for manipulating data structure and writing to `./data/tournament_uid/data.json`
		- [x] prevent handling of imported data properties like `assets` and (future) `bracket` depsite being in the structure for use within overlays and the UI
	- Create method for manipulating ui data structure and writing to `./data/tournament_uid/ui.json`
	- UI needs to allow use of pre existting data sets like Teams, and set its properties as the setter and sub setters (only select input field)
		- this will lead into another data structure for creating sub sets like teams 
	- Test and ensure new methods interact with `overlay.js` properly
	- Implement checkbox form element
- [] Create bracket system
	- Import bracket details into `data` property during import of tournament data
	- Allow creation of a bracket and seeding it with data from teams
		- Bracket data will exist within `data` for access within overlays but be restricted at a higher level
	- Create `bracket_data.json` and `bracket_ui.json` objects and structure so that the data is editable and accessible at each level of the bracket system (for use in overlays)
		- Unlike `data` or `ui` ... this objects will contain existing data like opposing teams, score, outcome, etc. This is for use in the bracketing system and will not be editable. However all other dynamic data and ui properties will be defined and accesible at this level.
- [] Restructure and further comment code for anyone else coming in
- [] Create datasets that ressemble the structure of Teams in the UI method
- [x] Create data protection method .. when data structures or assets are changed, auto-update the overlay and ui objects best as possible ... whats not possible just delete or inform the user?
- [] Overlay UI
	- Method for creating, editing and removing overlays
	- Create GUI editor for placing text and images along with setting values from variable data structures
	- Create clipping path UI
