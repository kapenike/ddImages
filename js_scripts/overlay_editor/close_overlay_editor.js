function closeOverlayEditor() {
	
	// remove active layer
	GLOBAL.overlay_editor.active_layer = null;
	
	// revert to previous on_save action
	GLOBAL.navigation.on_save = GLOBAL.overlay_editor.old_save;
	
	// remove editor tool event listeners
	removeImageEditorListeners();
	
	// close editor window
	Select('#image_editor').remove();
	
}