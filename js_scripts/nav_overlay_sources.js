function setNavigationOverlaySources() {

	Select('#main', {
		innerHTML: '',
		children: [
			Create('div', {
				className: 'block',
				children: [
					Create('h3', {
						innerHTML: 'Overlay Output Image Sources'
					}),
					Create('div', {
						children: GLOBAL.active_tournament.overlays.map(overlay => {
							return Create('input', {
								disabled: true,
								type: 'text',
								value: GLOBAL.active_tournament.cwd+'/overlay_output/'+GLOBAL.active_tournament.uid+'/'+overlay.slug+'.png'
							})
						})
					})
				]
			})
		]
	});
		
}