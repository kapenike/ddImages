function initNavigation() {
	
	// show naviation
	Select('.navigation').style.display = 'block';
	
	GLOBAL_NAVIGATION = [
		{
			name: 'Tournament Data',
			default: true,
			sub_navigation: [
				{
					name: 'Data Management',
					default: true,
					on_save: updateSourceChanges,
					app_init: function () {
						createUIFromData('#sub_main', GLOBAL.active_tournament.ui, 'update_tournament_details')
					},
					close_app: function () { 
						toggleUIEditor(false);
						clearSourceChanges();
					}
				},
				{
					name: 'Edit Data Structure',
					style: {
						float: 'right',
					},
					on_save: updateDataStructure,
					app_init: function () {
						manageDataStructure('#sub_main', GLOBAL.active_tournament.data, 'update_tournament_data_structure')
					}
				}
			]
		},
		{ name: '' },
		{
			name: 'Teams Manager',
			on_save: updateTeamData,
			app_init: setNavigationTeams,
		},
		{
			name: 'Assets Manager',
			on_save: updateAssetData,
			app_init: setNavigationAssets,
		},
		{
			name: 'Overlays',
			app_init: setNavigationOverlaySources
		},
		{
			name: 'Browser Sources',
			app_init: setNavigationBrowserSources,
		},
		{
			name: 'Settings',
			on_save: updateTournamentSettings,
			app_init: setNavigationSettings
		}
	];
	
	// generate navigation and application init
	generateUI();
}

function generateUI(navigation = null) {
	
	// prevent navigation of already-active page
	if (navigation != null) {
		let active_navigation = Select('.active_navigation').innerHTML;
		if (active_navigation == navigation) {
			return;
		} else {
			
			// if new navigation, run close app on active page
			closeApp(true, active_navigation);
			
		}
	}
	
	Select('#navigation', {
		innerHTML: '<div id="tournament_title">'+GLOBAL.active_tournament.title+'</div>',
		children: GLOBAL_NAVIGATION.map(nav_elem => {
			
			// nav break
			if (nav_elem.name == '') {
				return Create('div', {
					className: 'nav_break'
				});
			}
			
			// if current tab is active
			let nav_is_active = navigation == nav_elem.name || navigation == null && nav_elem.default;
			if (nav_is_active) {
				
				// init on save and application startup methods
				initNavigationApp(nav_elem);
				
				// generate sub navigation if it exists
				if (nav_elem.sub_navigation) {
					generateSubUI(null, nav_elem.sub_navigation);
				}
				
			}
			
			// generate main navigation element
			let nav_element = Create('div', {
				className: 'navigation_element'+(nav_is_active ? ' active_navigation' : ''),
				innerHTML: nav_elem.name,
				onclick: () => { generateUI(nav_elem.name) }
			});
			
			// if style, apply
			if (nav_elem.style) {
				Create(nav_element, { style: nav_elem.style }, true);
			}
			
			// return main navigation element
			return nav_element;
		})
	});
	
}
	
function generateSubUI(navigation, sub_navigation) {
	
	// prevent navigation of already-active page
	if (navigation != null) {
		let active_navigation = Select('.active_sub_navigation');
		if (active_navigation && active_navigation.innerHTML == navigation) {
			return;
		}
	}
	
	// check for close app condition on sub navigation
	closeApp(false);
	
	// append sub navigation to main container
	Select('#main', {
		innerHTML: '',
		children: [
			Create('div', {
				className: 'sub_navigation',
				children: sub_navigation.map(nav_elem => {
					
					// nav break
					if (nav_elem.name == '') {
						return Create('div', {
							className: 'nav_break'
						});
					}

					// generate sub navigation element
					let nav_is_active = navigation == nav_elem.name || navigation == null && nav_elem.default;
					let nav_element = Create('div', {
						className: 'sub_navigation_element'+(nav_is_active ? ' active_sub_navigation' : ''),
						innerHTML: nav_elem.name,
						onclick: () => { generateSubUI(nav_elem.name, sub_navigation) }
					});
					
					// if style, apply
					if (nav_elem.style) {
						Create(nav_element, { style: nav_elem.style }, true);
					}
					
					// return sub navigation element
					return nav_element;
					
				})
			}),
			Create('div', {
				id: 'sub_main'
			})
		]
	});
	
	
	// sub navigation container does not exist, so run app init after navigation creation
	sub_navigation.forEach(nav_elem => {
		if (navigation == nav_elem.name || navigation == null && nav_elem.default) {
			
			// init on save and application startup methods
			initNavigationApp(nav_elem);
			
		}
	});
}

function initNavigationApp(nav) {
	GLOBAL.navigation.on_save = (nav.on_save ? nav.on_save : () => {});
	if (nav.app_init) {
		nav.app_init();
	}
}

function closeApp(master, navigation = null) {
	
	// loop global navigation
	GLOBAL_NAVIGATION.forEach(nav_elem => {
		
		// if master tier, close app for old navigation
		if (master && nav_elem.close_app && nav_elem.name == navigation) {
			nav_elem.close_app();
		}
		
		// run on sub navigation if it exists
		if (nav_elem.sub_navigation) {
			
			// query for active sub navigation
			let active_sub_navigation = Select('.active_sub_navigation');
			if (active_sub_navigation) {
				active_sub_navigation = active_sub_navigation.innerHTML;
				
				// loop sub navigation
				nav_elem.sub_navigation.forEach(sub_nav_elem => {
					
					// close app for old navigation
					if (sub_nav_elem.close_app && sub_nav_elem.name == active_sub_navigation) {
						sub_nav_elem.close_app();
					}
					
				});
			}
		}
	});
}

function onSaveAction() {
	GLOBAL.navigation.on_save();
}
