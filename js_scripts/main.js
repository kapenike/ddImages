function initStreamOverlay() {
	
	/*
	proof of concept scenario:
		- CoD Double Tap
		- UID: uid_0000001

	
	### TODO ###
	- create proof of concept generic overlay using tournament settings information
	- create UI editor for tournament settings
	- tag overlays with "sources" to prompt javascript to generate specific overlays on the change of data
	- front end application to generate overlay and export through PHP
	- create player and teams data structures along with UI (logo, name, colors, etc)
	- create bracket system
	- create UI for filling bracket with team data
	- create overlays tagged to bracket data and auto-source updates to overlay
	- create UI for copying overlay sources for use in OBS
	- create UI for marking current match for use in overlay
		- this will also include pick / ban / score entry UI
		
	### FUTURE ###
	- create GUI editor for generating stream overlays
	- log tournaments as entries to a larger tournament entity, this will allow for preserving historic tournament data
	- log team and player stats from bracket system
	*/
	
	// request tournament data
	ajax('POST', '/requestor.php', {
		application: 'load_tournament_data',
		uid: 'uid_0000001'
	}, streamDataLoaded, 'body');
	
}

function streamDataLoaded(status, data) {
	if (status) {
		console.log(data);
	} else {
		alert('whoops');
	}
}