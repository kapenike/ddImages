function setNavigationSettings() {

	Select('#main', {
		innerHTML: '',
		children: [
			Create('div', {
				className: 'block',
				children: [
					Create('form', {
						id: 'tournament_settings',
						children: [
							Create('label', {
								innerHTML: 'Tournament Title',
								children: [
									Create('input', {
										type: 'text',
										name: 'tournament_title',
										value: GLOBAL.active_tournament.title
									})
								]
							}),
							Create('div', {
								style: {
									textAlign: 'right'
								},
								children: [
									Create('button', {
										type: 'button',
										onclick: updateTournamentSettings,
										innerHTML: 'Save Settings'
									})
								]
							})
						]
					})
				]
			})
		]
	});
		
}

function updateTournamentSettings() {
	
	// use form style capture to easily inherit form capture methods
	let form_details = formToObj('tournament_settings');
	
	// append application
	form_details.application = 'update_tournament_settings';
	
	// append tournament uid
	form_details.uid = GLOBAL.active_tournament.uid;
	
	// update server-side team details, then call back to same scope function to save changes locally
	ajax('POST', '/requestor.php', form_details, (status, data) => {
		
		if (status) {

			// update local data and UI
			GLOBAL.active_tournament.title = form_details.tournament_title;
			Select('#tournament_title').innerHTML = form_details.tournament_title;
			
		}
		
	}, 'body');
}