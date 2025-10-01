function initHotKeyListeners() {
	
	// minimal shortcut keys for just ctrl+s right now
	GLOBAL.held_keys = { 
		ctrl: false,
		s: false,
		d: false,
		reset: false
	};
	
	// add event listener that prevents mouse wheel document zoom
	document.addEventListener('wheel', function (event) {
		if (event.ctrlKey) {
			event.preventDefault();
		}
	}, { passive: false });
	
	window.addEventListener('keydown', function (event) {
		if (GLOBAL.held_keys.reset == true) {
			event.preventDefault();
			return;
		}
		if (event.keyCode == 16) {
			GLOBAL.held_keys.shift = true;
		} else if (event.keyCode == 17) {
			GLOBAL.held_keys.ctrl = true;
		} else if (event.keyCode == 83) {
			GLOBAL.held_keys.s = true;
		} else if (event.keyCode == 68) {
			GLOBAL.held_keys.d = true;
		}
		
		// hotkey actions
		if (GLOBAL.held_keys.ctrl && GLOBAL.held_keys.s) {
			// save
			event.preventDefault();
			GLOBAL.held_keys.reset = true;
			onSaveAction();
		} else if (GLOBAL.held_keys.ctrl && GLOBAL.held_keys.d) {
			// remove layer selection
			event.preventDefault();
			GLOBAL.held_keys.reset = true;
			if (GLOBAL.overlay_editor.active_layer != null) {
				setActiveLayer(null);
			}
		}
	});
	
	window.addEventListener('keyup', function (event) {
		if (event.keyCode == 16) {
			GLOBAL.held_keys.shift = false;
		} else if (event.keyCode == 17) {
			GLOBAL.held_keys.ctrl = false;
		} else if (event.keyCode == 83) {
			GLOBAL.held_keys.s = false;
		} else if (event.keyCode == 68) {
			GLOBAL.held_keys.d = false;
		}
		GLOBAL.held_keys.reset = false;
	});
	
}