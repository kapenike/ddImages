function saveOverlay() {
	
	// send new overlay data
	let form_details = {
		uid: GLOBAL.active_project.uid,
		application: 'update_overlay_layers',
		slug: GLOBAL.overlay_editor.slug,
		overlay: JSON.stringify(GLOBAL.overlay_editor.current)
	}
	
	ajax('POST', '/requestor.php', form_details, (status, data) => {
		if (status) {
			
			// update local overlay
			GLOBAL.active_project.overlays[GLOBAL.overlay_editor.slug] = JSON.parse(JSON.stringify(GLOBAL.overlay_editor.current));
			
			// update overlay output
			generateStreamOverlays({ slug: GLOBAL.overlay_editor.slug });
			
			// refresh overlay image on previous editor screen
			if (Select('.asset_preview')) {
				let img = Select('.asset_preview').children[0];
				img.src = img.src+'?'+new Date().getTime();
			}
			
		}
	}, 'body');
	
}