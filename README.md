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
	- [ ] UI fields that set the same value will override .. this is logical but maybe notify the user? or let it be incremental
	- [ ] Prevent infinite loops with new path creation
- TODO
- [ ] Create base layer editor to later expand on for a GUI editor
- [ ] Create bracket system
	- [ ] Prevent removal of teams currently seeded in the bracket
- [ ] overlay editor
- [ ] Final rewrite with a TOP for creating new broadcasts
- [ ] Documentation