function setNavigationSettings() {

	Select('#main', {
		innerHTML: '',
		children: [
			Create('div', {
				className: 'block',
				children: [
					Create('form', {
						id: 'project_settings',
						children: [
							Create('label', {
								innerHTML: 'project Title',
								children: [
									Create('input', {
										type: 'text',
										name: 'project_title',
										value: GLOBAL.active_project.title
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
										onclick: updateProjectSettings,
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

function updateProjectSettings() {
	
	// use form style capture to easily inherit form capture methods
	let form_details = formToObj('project_settings');
	
	// append application
	form_details.application = 'update_project_settings';
	
	// append project uid
	form_details.uid = GLOBAL.active_project.uid;
	
	// update server-side team details, then call back to same scope function to save changes locally
	ajax('POST', '/requestor.php', form_details, (status, data) => {
		
		if (status) {

			// update local data and UI
			GLOBAL.active_project.title = form_details.project_title;
			Select('#project_title').innerHTML = form_details.project_title;
			
		}
		
	}, 'body');
}