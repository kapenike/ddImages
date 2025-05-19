function generateUI(navigation = 'Tournament Data') {
	
	// generate navigation
	Select('#navigation', {
		innerHTML: '',
		children: [
			'Tournament Data', // data structure and UI structure to complete
			'Bracket',
			'Teams Manager', // teams as sub data structure to tournament to complete
			'',
			'Assets', // asset management to complete
			'Overlays'
		].map(section => {
			if (section == '') {
				return Create('div', {
					className: 'nav_break'
				});
			} else {
				return Create('div', {
					className: 'navigation_element'+(navigation == section ? ' active_navigation' : ''),
					innerHTML: section,
					onclick: () => { generateUI(section) }
				});
			}
		})
	});
	
	// switch case for setting navigation contents
	switch(navigation) {
		case 'Tournament Data':
			GLOBAL.navigation.on_save = updateSourceChanges;
			// (./js_scripts/nav_main.js)
			setNavigationTournamentData();
			break;
			
		case 'Teams Manager':
			GLOBAL.navigation.on_save = updateTeamData;
			// (./js_scripts/nav_overlay_sources.js)
			setNavigationTeams();
			break;
			
		case 'Assets':
			GLOBAL.navigation.on_save = updateAssetData;
			// (./js_scripts/nav_assets.js)
			setNavigationAssets();
			break;	
		
		case 'Overlays':
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
