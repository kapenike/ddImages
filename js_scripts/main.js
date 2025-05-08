// global variable for overlay and tournament data
var GLOBAL = {
	useVRAM: true
};

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
		
		// save initial tournament data in GLOBAL
		GLOBAL.active_tournament = data;
		
		// load dependent image sources into GLOBAL
		loadOverlayDependencies();
		
	} else {
		alert('whoops');
	}
	
}

function loadOverlayDependencies() {
	
	// dependency sources
	let sources = [];
	
	// sift through global tournament layers for dependency sources
	GLOBAL.active_tournament.overlays.forEach((overlay, overlay_index) => {
		
		// loop layers and insert type=image source as a direct parent reference
		overlay.layers.forEach((layer, layer_index) => {
			if (layer.type == 'image') {
				sources.push(GLOBAL.active_tournament.overlays[overlay_index].layers[layer_index]);
			}
		})
		
	});
	
	// replace those sources with image objects by using the parent reference to source (sources.source)
	let loaded = 0;
	let to_load = sources.length;
	if (to_load > 0) {
		sources.forEach(source => {
			let image = new Image();
			image.src = '/data/tournament/'+GLOBAL.active_tournament.uid+'/sources/'+source.source;
			image.onload = () => {
				
				// on image load, convert to bitmap for loading assets into VRAM
				// !! - this could potentially cause issues to low spec computers if the user has too many assets/layers and need those specs for gaming... offer base RAM loaded image option
				// !! - bitmaps generate overlays significantly faster
				
				if (GLOBAL.useVRAM) {
					
					// replace source with bitmap (additional async action): VRAM
					createImageBitmap(image).then(bitmap => {
						loaded++;
						source.source = bitmap;
						if (loaded == to_load) {
						
							// once all assets are loaded, callback to initial overlay generation
							// (./js_scripts/overlays.js)
							generateStreamOverlays(null);
							
						}
					});
				} else {
					
					// replace source with image object: RAM
					loaded++;
					source.source = image;
					if (loaded == to_load) {
						
						// once all assets are loaded, callback to initial overlay generation
						// (./js_scripts/overlays.js)
						generateStreamOverlays(null);
						
					}
				}
			}
		});
	}
	
}
