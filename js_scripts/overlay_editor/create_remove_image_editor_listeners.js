function createImageEditorListeners() {
	window.addEventListener('mousedown', imageEditorMouseDown);
	window.addEventListener('mousemove', imageEditorMouseMove);
	window.addEventListener('mouseup', imageEditorMouseUp);
	window.addEventListener('contextmenu', imageEditorMouseCTX);
	window.addEventListener('wheel', imageEditorZoom);
}

function removeImageEditorListeners() {
	window.removeEventListener('mousedown', imageEditorMouseDown);
	window.removeEventListener('mousemove', imageEditorMouseMove);
	window.removeEventListener('mouseup', imageEditorMouseUp);
	window.removeEventListener('contextmenu', imageEditorMouseCTX);
	window.removeEventListener('wheel', imageEditorZoom);
}