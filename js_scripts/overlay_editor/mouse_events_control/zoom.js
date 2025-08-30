function imageEditorZoom(event) {
	if (event.target.id == 'workspace') {
		
		// translate window cursor position to canvas position (before new scale)
		let translate_cursor_pre = translateWindowToCanvas(event.clientX, event.clientY);
		
		// change canvas scale
		GLOBAL.overlay_editor.scale *= event.deltaY < 0 ? 1.09 : .81;
		
		// translate window cursor position to canvas position (after new scale)
		let translate_cursor_post = translateWindowToCanvas(event.clientX, event.clientY);
		
		// get difference of cursor position based on scale change and add to current canvas window offset
		// scaled cursor position difference must be re-scaled with current scale change since the conversion does not directly relate
		GLOBAL.overlay_editor.canvas_window.x -= (translate_cursor_post.x - translate_cursor_pre.x)*GLOBAL.overlay_editor.scale;
		GLOBAL.overlay_editor.canvas_window.y -= (translate_cursor_post.y - translate_cursor_pre.y)*GLOBAL.overlay_editor.scale;
		
		printCurrentCanvas();
	}
}