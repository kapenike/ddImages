function initStreamOverlay() {
	
	// generate and insert testing area
	Select('#body', {
		innerHTML: '',
		children: [
			Create('form', {
				id: 'test',
				children: [
					Create('div', {
						className: 'block',
						children: [
							Create('input', {
								name: 'test',
								type: 'text',
								value: 'test value'
							}),
							Create('button', {
								innerHTML: 'Test',
								onclick: function () {
									ajax('POST', '/index.php', formToObj('test'), ()=>{}, 'test');
								}
							})
						]
					})
				]
			})
		]
	});
	
}