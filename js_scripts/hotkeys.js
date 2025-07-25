function initHotKeyListeners() {
	
	// minimal shortcut keys for just ctrl+s right now
	GLOBAL.held_keys = { 
		ctrl: false,
		s: false,
		reset: false
	};
	
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
		}
		if (GLOBAL.held_keys.ctrl && GLOBAL.held_keys.s) {
			event.preventDefault();
			GLOBAL.held_keys.reset = true;
			onSaveAction();
		}
	});
	
	window.addEventListener('keyup', function (event) {
		if (event.keyCode == 16) {
			GLOBAL.held_keys.shift = false;
		} else if (event.keyCode == 17) {
			GLOBAL.held_keys.ctrl = false;
		} else if (event.keyCode == 83) {
			GLOBAL.held_keys.s = false;
		}
		GLOBAL.held_keys.reset = false;
	});
	
}