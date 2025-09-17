function setNavigationP2PServer() {

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
														innerHTML: 'Generate Static Link'
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
												className: 'selection_list_block',
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
								style: {
									width: '70%',
									height: '100%',
									overflowY: 'scroll'
								},
								children: [
									Create('div', {
										
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