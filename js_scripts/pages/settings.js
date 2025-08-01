function setNavigationSettings() {

	Select('#main', {
		innerHTML: '',
		children: [
			Create('div', {
				className: 'block',
				children: [
					Create('form', {
						id: 'Project_settings',
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
							}),
						]
					}),
					Create('div', {
						className: 'row',
						children: [
							Create('div', {
								className: 'col',
								style: {
									width: '33.3%'
								},
								children: [
									Create('h3', {
										innerHTML: 'Import Project'
									}),
									Create('input', {
										type: 'file',
										id: 'import_file'
									}),
									Create('div', {
										style: {
											textAlign: 'right'
										},
										children: [
											Create('button', {
												type: 'button',
												innerHTML: 'Import',
												onclick: function () {
													notify({
														text: 'Importing a project will override the current project entirely. Are you sure you\'d like to continue?',
														confirm: 'Import',
														cancel: 'Nevermind'
													}, function () {
														if (Select('#import_file').files.length > 0) {
															let send_data = {
																application: 'import_project',
																uid: GLOBAL.active_project.uid,
																file: Select('#import_file').files
															};
															// import
															ajax('POST', '/requestor.php', send_data, (status, data) => {
																if (status && data.status) {
																	// update prooject name in local registry
																	GLOBAL.project_registry[GLOBAL.active_project.uid] = data.project_name;
																	// load new project
																	ajax('POST', '/requestor.php', {
																		application: 'load_project_data',
																		uid: GLOBAL.active_project.uid
																	}, streamDataLoaded, 'body');
																}
															}, 'body');
														}
													});
												}
											})
										]
									})
								]
							}),
							Create('div', {
								className: 'col',
								style: {
									width: '33.3%'
								},
								children: [
									Create('h3', {
										innerHTML: 'Export Project'
									}),
									Create('div', {
										style: {
											textAlign: 'right'
										},
										children: [
											Create('button', {
												type: 'button',
												innerHTML: 'Export',
												onclick: function () {
													let send_data = {
														application: 'export_project',
														uid: GLOBAL.active_project.uid,
													};
													// send request to generate project archive
													ajax('POST', '/requestor.php', send_data, (status, data) => {
														if (status && data.status) {
															// open url to download export
															window.open('/requestor.php?download_export='+encodeURIComponent(data.project_name), '_blank');
														}
													}, 'body');
												}
											})
										]
									})
								]
							}),
							Create('div', {
								className: 'col',
								style: {
									width: '33.3%'
								},
								children: [
									Create('h3', {
										innerHTML: 'Delete Project'
									}),
									Create('div', {
										style: {
											textAlign: 'right'
										},
										children: [
											Create('button', {
												type: 'button',
												className: 'remove_button',
												innerHTML: 'Delete',
												onclick: function () {
													notify(
														{
															text: 'Deleting a project will remove all sources, data, assets and overlays <strong>permanently</strong>.',
															confirm: 'Nuke it',
															cancel: 'Ope, no thanks'
														},
														function () {
															let send_data = {
																application: 'delete_project',
																uid: GLOBAL.active_project.uid,
															};
															// send request to delete project
															ajax('POST', '/requestor.php', send_data, (status, data) => {
																if (status && data.status) {
																	// remove project registry entry
																	delete GLOBAL.project_registry[GLOBAL.active_project.uid];
																	// return to project selection screen
																	generateprojectSelectionScreen();
																}
															}, 'body');
														}
													)
												}
											})
										]
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