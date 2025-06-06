// global variable for overlay and tournament data
var GLOBAL = {};

function initGlobal() {
	GLOBAL = {
		use_vram: true, // generate Bitmaps for faster overlay creation at the cost of the GPU
		generate_sources: true, // flag used by generateStreamOverlays(null) when passed null to update overlay sources (defines what UI value updates will proc a stream overlay image export)
		source_changes: [], // where to store source changes before an update
		track_sources: { // track text fields and update on source change
			inc: 0,
			pairs: []
		},
		navigation: {}, // data location for navigation
		data_structure: {
			ignored: ['teams', 'bracket', 'assets', 'sets'], // data paths to ignore during structure editor generation,
			removed: [], // data keys removed during structure editing
			new_key_inc: 0 // incrementor used to make new key name values unique
		},
		ui: {
			active_data: null, // data used during UI creation
			drag_elem: null, // element being dragged during UI editing
			drag_clone: null, // shadow clone to animate drag
			drag_hover: null, // current hovered element while dragging
			drop_side: null,
			container: null
		}
	}
}

function initStreamOverlay() {
	
	// init global var
	initGlobal();
	
	// listen for hotkey commands (./js_scripts/hotkeys.js)
	initHotKeyListeners();
	
	/*
	proof of concept scenario:
		- CoD Double Tap
		- UID: uid_0000001
	*/
	// request tournament data
	ajax('POST', '/requestor.php', {
		application: 'load_tournament_data',
		uid: 'uid_0000001'
	}, streamDataLoaded, 'body');
	
	// async path ends with call to initNavigation() to kick off application start (./js_scripts/navigation.js)
}

function streamDataLoaded(status, data) {
	
	if (status) {
		
		// save initial tournament data in GLOBAL
		GLOBAL.active_tournament = data;
		
		// TODO: bracket within data
		GLOBAL.active_tournament.data.bracket = {};

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
			image.src = '/data/'+GLOBAL.active_tournament.uid+'/sources/'+GLOBAL.active_tournament.data.assets[source].file;
			image.onload = () => {
				
				// on image load, convert to bitmap for loading assets into VRAM
				// !! - this could potentially cause issues to low spec computers if the user has too many assets/layers and need those specs for gaming... offer base RAM loaded image option
				// !! - bitmaps generate overlays significantly faster
				
				if (GLOBAL.use_vram) {
					
					// replace source with bitmap (additional async action): VRAM
					createImageBitmap(image).then(bitmap => {
						loaded++;
						GLOBAL.active_tournament.data.assets[source].source = bitmap;
						if (loaded == to_load) {
						
							// once all assets are loaded, callback to initial overlay generation
							// (./js_scripts/overlays.js)
							generateStreamOverlays(null, dependenciesLoaded);
							
						}
					});
				} else {
					
					// replace source with image object: RAM
					loaded++;
					GLOBAL.active_tournament.data.assets[source].source = image;
					if (loaded == to_load) {
						
						// once all assets are loaded, callback to initial overlay generation
						// (./js_scripts/overlays.js)
						generateStreamOverlays(null, dependenciesLoaded);
						
					}
				}
			}
		});
	}
	
	// if no sources, continue
	if (sources.length == 0) {
		generateStreamOverlays(null, dependenciesLoaded);
	}
	
}

function dependenciesLoaded(status, data) {
	// (./js_scripts/navigation.js)
	initNavigation();
}