function setNavigationTournamentData() {
	
	Select('#main', {
		innerHTML: '',
		children: [
			Create('div', {
				className: 'sub_navigation',
				children: [
					Create('div', {
						className: 'sub_navigation_element',
						id: 'data_management',
						innerHTML: 'Data Management',
						style: {
							float: 'left'
						},
						onclick: function() { setTournamentDataSubNavigation('data_management'); }
					}),
					Create('div', {
						className: 'sub_navigation_element_active',
						id: 'data_structure',
						innerHTML: 'Edit Data Structure',
						style: {
							float: 'right'
						},
						onclick: function() { setTournamentDataSubNavigation('data_structure'); }
					})
				]
			}),
			Create('div', {
				id: 'tournament_data_continuation_block'
			})
		]
	});
	
	// init on data_management
	setTournamentDataSubNavigation('data_management');
	
}

function setTournamentDataSubNavigation(id) {
	
	// if current id is active tab, return
	if (Select('.sub_navigation_element_active').id == id) {
		return false;
	}
	
	// revert sub navigation active element to inactive
	Select('.sub_navigation_element_active', { className: 'sub_navigation_element' });
	
	// make current sub navigation active
	Select('#'+id, { className: 'sub_navigation_element sub_navigation_element_active' });
	
	// set main area contents
	switch (id) {
		case 'data_management':
			GLOBAL.navigation.on_save = updateSourceChanges;
			Select('#tournament_data_continuation_block', {
				innerHTML: '',
				children: [
					createUIFromData(GLOBAL.active_tournament.ui, 'update_tournament_details')
				]
			});
			break;
			
		case 'data_structure':
			GLOBAL.navigation.on_save = updateDataStructure;
			Select('#tournament_data_continuation_block', {
				innerHTML: '',
				children: [
					manageDataStructure(GLOBAL.active_tournament.data, 'update_tournament_data_structure')
				]
			});
			break;
			
		default:
			GLOBAL.navigation.on_save = ()=>{};
			Select('#tournament_data_continuation_block', { innerHTML: '' });
	}
	
	
}