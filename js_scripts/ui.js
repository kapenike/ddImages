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
			'Overlays',
			'Browser Sources'
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
			// navigation on save set within setNavigationTournamentData()
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
			
		case 'Browser Sources':
			GLOBAL.navigation.on_save = ()=>{};
			// (./js_scripts/nav_browser_sources.js)
			setNavigationBrowserSources();
			break;
			
		default:
			GLOBAL.navigation.on_save = ()=>{};
			Select('#main', { innerHTML: '' });
	}
	
}

function onSaveAction() {
	GLOBAL.navigation.on_save();
}