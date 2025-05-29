# phpMyStreamOverlay
automated stream overlays for OBS using html 5 canvas, JavaScript and PHP

> this code is pre-alpha and not fully commented or structured

## To-DO
- [ ] Create UI builder with use of data from assets and `data structure` along with data from `data.sets`
	- [ ] Create checkbox form element
- [ ] Convert UID system to random UID rather than incremental, this is to prevent (future) exports and imports alongside an OBS export from creating disconnects with overlays sources
	-	Setup should mention that using documents to house this application is a good idea ... for the same reason mentioned above
- [ ] Allow creation of more data sets like teams `data.sets.teams`
- [ ] Allow user to delete overlays BUT also inform them if it has dependent overlays or data sources (path protection already prevents system error), prevents teams deletion if within the bracket
- [ ] Create bracket system
	- Import bracket details into `data` property during import of tournament data
	- Allow creation of a bracket and seeding it with data from teams
		- Bracket data will exist within `data` for access within overlays but be restricted at a higher level
	- Create `bracket_data.json` and `bracket_ui.json` objects and structure so that the data is editable and accessible at each level of the bracket system (for use in overlays)
		- Unlike `data` or `ui` ... this objects will contain existing data like opposing teams, score, outcome, etc. This is for use in the bracketing system and will not be editable.
- [ ] Entire structural rewrite along with comments
- [ ] Request god extend days by 4 hours each and then create an overlay editor
- [ ] More complex path variable comparisons

