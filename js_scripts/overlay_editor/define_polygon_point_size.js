function definePolygonPointSize() {
	let size = 10/GLOBAL.overlay_editor.scale;
	if (size < 2) {
		size = 2;
	} else if (size > 10) {
		size = 10;
	}
	return size;
}