function initNavigation() {
	GLOBAL_NAVIGATION = [
		{
			name: 'Tournament Data',
			active: true,
			sub_navigation: [
				{
					name: 'Data Management',
					active: true,
					on_save: updateSourceChanges,
					app_init: function () {
						createUIFromData('#sub_main', GLOBAL.active_tournament.ui, 'update_tournament_details')
					},
					app_close: function () { toggleUIEditor(false); }
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
		}
	];
	
	// generate navigation and application init
	generateUI();
}

function generateUI(navigation = null) {
	
	// prevent navigation of already-active page
	if (navigation != null) {
		let active_navigation = Select('.active_navigation');
		if (active_navigation && active_navigation.innerHTML == navigation) {
			return;
		} else {
			
			// if new navigation, run all app_close methods on non-current navigation elements
			GLOBAL_NAVIGATION.forEach(nav_elem => {
				if (nav_elem.name != navigation && nav_elem.app_close) {
					nav_elem.app_close();
				}
			});
			
		}
	}
	
	Select('#navigation', {
		innerHTML: '',
		children: GLOBAL_NAVIGATION.map(nav_elem => {
			
			// nav break
			if (nav_elem.name == '') {
				return Create('div', {
					className: 'nav_break'
				});
			}
			
			// if current tab is active
			let nav_is_active = navigation == nav_elem.name || navigation == null && nav_elem.active;
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

function initNavigationApp(nav) {
	GLOBAL.navigation.on_save = (nav.on_save ? nav.on_save : () => {});
	if (nav.app_init) {
		nav.app_init();
	}
}

function onSaveAction() {
	GLOBAL.navigation.on_save();
}
	
function generateSubUI(navigation, sub_navigation) {
	
	// prevent navigation of already-active page
	if (navigation != null) {
		let active_navigation = Select('.active_sub_navigation');
		if (active_navigation && active_navigation.innerHTML == navigation) {
			return;
		} else {
			
			// if new navigation, run all app_close methods on non-current navigation elements
			sub_navigation.forEach(nav_elem => {
				if (nav_elem.name != navigation && nav_elem.app_close) {
					nav_elem.app_close();
				}
			});
			
		}
	}
	
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
					let nav_is_active = navigation == nav_elem.name || navigation == null && nav_elem.active;
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
		if (navigation == nav_elem.name || navigation == null && nav_elem.active) {
			
			// init on save and application startup methods
			initNavigationApp(nav_elem);
			
		}
	});
}

