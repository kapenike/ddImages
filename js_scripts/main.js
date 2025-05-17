// global variable for overlay and tournament data
var GLOBAL = {
	use_vram: true, // generate Bitmaps for faster overlay creation at the cost of the GPU
	generate_sources: true, // flag used by generateStreamOverlays(null) when passed null to update overlay sources (defines what UI value updates will proc a stream overlay image export)
	source_changes: [], // where to store source changes before an update
	navigation: {} // data location for navigation
};

function initStreamOverlay() {
	
	/*
	proof of concept scenario:
		- CoD Double Tap
		- UID: uid_0000001

	
	### TODO ###
	
	- complete BRB / Caster screen / Starting soon
	
	- create player and teams data structures along with UI (logo, name, colors, etc)
	- create bracket system
	- create UI for filling bracket with team data
	- create overlays tagged to bracket data and auto-source updates to overlay
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
	}, loadTeams, 'body');
	
}

function loadTeams(status, data) {
	
	if (status) {
		
		// save initial tournament data in GLOBAL
		GLOBAL.active_tournament = data;
		
		// request team data
		ajax('POST', '/requestor.php', {
			application: 'get_team_data',
			uid: 'uid_0000001'
		}, streamDataLoaded, 'body');
	}
	
}

function streamDataLoaded(status, data) {
	
	if (status) {
		
		// set team data in global
		GLOBAL.active_tournament.data.teams = data;

		// load dependent image sources into GLOBAL
		loadOverlayDependencies();
		
	} else {
		alert('whoops, check your console');
	}
	
}

function loadOverlayDependencies() {
	
	// dependency sources
	let sources = [];
	
	// store dependency asset keys
	Object.keys(GLOBAL.active_tournament.data.assets).forEach(asset_key => {
		sources.push(asset_key);
	});
	
	// replace those sources with image objects by using the parent reference to source (sources.source)
	let loaded = 0;
	let to_load = sources.length;
	if (to_load > 0) {
		sources.forEach(source => {
			let image = new Image();
			image.src = '/data/tournament/'+GLOBAL.active_tournament.uid+'/sources/'+GLOBAL.active_tournament.data.assets[source];
			image.onload = () => {
				
				// on image load, convert to bitmap for loading assets into VRAM
				// !! - this could potentially cause issues to low spec computers if the user has too many assets/layers and need those specs for gaming... offer base RAM loaded image option
				// !! - bitmaps generate overlays significantly faster
				
				if (GLOBAL.use_vram) {
					
					// replace source with bitmap (additional async action): VRAM
					createImageBitmap(image).then(bitmap => {
						loaded++;
						GLOBAL.active_tournament.data.assets[source] = bitmap;
						if (loaded == to_load) {
						
							// once all assets are loaded, callback to initial overlay generation
							// (./js_scripts/overlays.js)
							generateStreamOverlays(null, dependenciesLoaded);
							
						}
					});
				} else {
					
					// replace source with image object: RAM
					loaded++;
					GLOBAL.active_tournament.data.assets[source] = image;
					if (loaded == to_load) {
						
						// once all assets are loaded, callback to initial overlay generation
						// (./js_scripts/overlays.js)
						generateStreamOverlays(null, dependenciesLoaded);
						
					}
				}
			}
		});
	}
	
}

function dependenciesLoaded(status, data) {
	// (./js_scripts/ui.js)
	generateUI();
}