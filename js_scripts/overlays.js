// accepts list of data sources that have been changed to determine what overlays to regenerate, send null to generate all
function generateStreamOverlays(sources = null) {
	
	// define output canvas
	let canvas = Create('canvas', {
		width: 1920,
		height: 1080
	});
	
	// canvas context
	let ctx = canvas.getContext('2d');
	
	// overlay output
	let output_overlays = {};
	
	// loop currents overlays and detect which to update based on sources change
	GLOBAL.active_tournament.overlays.forEach(overlay => {
		
		// if overlay contains an updated source, or sources is null
		if (sources == null || overlay.sources.filter(x => sources.includes(x)).length > 0) {
		
			// generate overlay
			generateOverlay(ctx, output_overlays, overlay);
			
		}
		
	});
	
}

function generateOverlay(ctx, output_overlays, overlay) {
	
	// reset canvas
	ctx.clearRect(0, 0, 1920, 1080);
	
	// loop layers from back to front
	for (let i=overlay.layers.length-1; i>-1; i--) {
		
		// active layer
		let layer = overlay.layers[i];
		
		// PRINT TO CANVAS
		
	}
	
	console.log(GLOBAL.active_tournament.overlays[0].layers);
	
}