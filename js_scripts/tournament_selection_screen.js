function generateTournamentSelectionScreen() {
	
	if (GLOBAL.tournament_registry == null) {
		
		// get tournament registration
		ajax('POST', '/requestor.php', {
			application: 'load_tournament_registration',
		}, (status, data) => {
			if (status) {
				// stash registry then circle back around and generate UI
				GLOBAL.tournament_registry = data.msg;
				generateTournamentSelectionScreen();
			}
		}, 'body');
		return;
		
	}
	
	// hide navigation
	Select('.navigation').style.display = 'none';
	
	Select('#main', {
		innerHTML: '',
		children: [
			Create('div', {
				className: 'tournament_selection_box',
				children: [
					Create('img', {
						className: 'logo',
						src: 'logo.png'
					}),
					Create('label', {
						innerHTML: 'Tournaments',
						children: [
							Create('select', {
								id: 'tournament_uid_selection',
								children: Object.keys(GLOBAL.tournament_registry).map(key => {
									return Create('option', {
										innerHTML: GLOBAL.tournament_registry[key],
										value: key
									});
								})
							})
						]
					}),
					Create('button', {
						type: 'button',
						innerHTML: '+ Create New',
						style: {
							float: 'left'
						},
						onclick: tournamentCreationDialog
					}),
					Create('button', {
						type: 'button',
						className: 'main_button',
						innerHTML: 'Load Tournament',
						style: {
							float: 'right'
						},
						onclick: function () {
							let uid = Select('#tournament_uid_selection').value;
							if (uid) {
								ajax('POST', '/requestor.php', {
									application: 'load_tournament_data',
									uid: uid
								}, streamDataLoaded, 'body');
							}
						}
					}),
					Create('br', {
						style: {
							clear: 'both'
						}
					})
				]
			})
		]
	});
	
}

function tournamentCreationDialog() {
	Select('#main', {
		innerHTML: '',
		children: [
			Create('div', {
				className: 'tournament_selection_box',
				children: [
					Create('img', {
						className: 'logo',
						src: 'logo.png'
					}),
					Create('label', {
						innerHTML: 'Tournament Name',
						children: [
							Create('input', {
								id: 'tournament_uid_selection',
								type: 'text'
							})
						]
					}),
					Create('button', {
						type: 'button',
						className: 'small_button',
						innerHTML: 'Return to Tournament Selection',
						style: {
							float: 'left',
							backgroundColor: '#444444'
						},
						onclick: generateTournamentSelectionScreen
					}),
					Create('button', {
						type: 'button',
						className: 'main_button',
						innerHTML: 'Create Tournament',
						style: {
							float: 'right'
						},
						onclick: function () {
							let tournament_name = Select('#tournament_uid_selection').value;
							if (tournament_name != '') {
								ajax('POST', '/requestor.php', {
									application: 'create_tournament',
									tournament_name: tournament_name
								}, (status, data) => {
									if (status && data.status) {
										ajax('POST', '/requestor.php', {
											application: 'load_tournament_data',
											uid: data.uid
										}, streamDataLoaded, 'body');
									}
								}, 'body');
							}
						}
					}),
					Create('br', {
						style: {
							clear: 'both'
						}
					})
				]
			})
		]
	});
}