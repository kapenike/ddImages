function setNavigationBrowserSources() {

	Select('#main', {
		innerHTML: '',
		children: [
			Create('div', {
				className: 'block',
				style: {
					height: '100%'
				},
				children: [
					Create('div', {
						className: 'row',
						children: [
							Create('div', {
								className: 'col',
								style: {
									width: '30%',
									height: '100%'
								},
								children: [
									Create('div', {
										className: 'row',
										children: [
											Create('div', {
												className: 'col',
												style: {
													width: '50%'
												},
												children: [
													Create('h3', {
														innerHTML: 'Browser Sources'
													})
												]
											})
										]
									}),
									Create('div', {
										style: {
											height: 'calc(100% - 150px)',
											overflowY: 'scroll'
										},
										children: [
											Create('div', {
												innerHTML: 'Countdown Clock',
												className: 'team_block',
												onclick: setupCountdownClockWidget,
												style: {
													backgroundColor: '#000000',
													color: '#ffffff'
												}
											})
										]
									})
								]
							}),
							Create('div', {
								className: 'col',
								id: 'widget_content',
								style: {
									width: '70%',
									height: '100%',
									overflowY: 'scroll'
								}
							})
						]
					})
				]
			})
		]
	});
	
	// default to countdown clock widget
	setupCountdownClockWidget();
		
}