function generateUI(navigation = 'Data') {
	
	// generate navigation
	Select('#navigation', {
		innerHTML: '',
		children: [
			'Data',
			'Bracket',
			'Teams',
			'Overlay Sources'
		].map(section => {
			return Create('div', {
				className: 'navigation_element'+(navigation == section ? ' active_navigation' : ''),
				innerHTML: section,
				onclick: () => { generateUI(section) }
			});
		})
	});
	
	// switch case for setting navigation contents
	switch(navigation) {
		case 'Data':
			GLOBAL.navigation.on_save = updateSourceChanges;
			// (./js_scripts/nav_main.js)
			setNavigationMain();
			break;
			
		case 'Teams':
			GLOBAL.navigation.on_save = updateTeamData;
			// (./js_scripts/nav_overlay_sources.js)
			setNavigationTeams();
			break;
			
		case 'Overlay Sources':
			GLOBAL.navigation.on_save = ()=>{};
			// (./js_scripts/nav_overlay_sources.js)
			setNavigationOverlaySources();
			break;
			
		default:
			GLOBAL.navigation.on_save = ()=>{};
			Select('#main', { innerHTML: '' });
	}
	
}

function onSaveAction() {
	GLOBAL.navigation.on_save();
}

// not all comparisons are similar, allow ui setup to determine value depth to compare
function getDepthComparisonValue(field) {
	return getRealValue(field.source, (typeof field.value_depth === 'undefined' ? null : field.value_depth));
}
