// generate an overlay editor dialog at the current mouse position (transformed to remain on screen)
// takes a list of menu_items to create actions, allow width override in style
// could certainly be improved but works for all scenarios for now
function setImageEditorDialog(event, menu_items, width_override = null) {
	
	// if a current dialog is open, close it
	removeUIEditMenu();
	
	let x = event.clientX;
	let y = event.clientY;
	
	Select('#body', {
		children: [
			Create('div', {
				className: 'ui_edit_menu',
				id: 'ui_edit_menu',
				style: {
					left: x,
					top: y,
					transform: 'translate('+(x < (screen.width/2) ? '0' : '-100%')+', '+(y > (screen.height/2) ? '-100%' : '0')+')',
					width: width_override == null ? '200px' : width_override+'px'
				},
				children: [
					(typeof menu_items.title !== 'undefined' && menu_items.title != '' 
						? Create('div', {
								className: 'ui_edit_menu_title',
								innerHTML: menu_items.title
							})
						: Create('span')
					),
					...menu_items.items.map(item => {
						return (typeof item.title === 'string'
							? Create('div', {
									innerHTML: item.title,
									onclick: item.click,
									className: (typeof item.remove === 'undefined' ? (typeof item.action === 'undefined' ? '' : 'ui_edit_menu_save') : 'ui_edit_menu_remove')
								})
							: Create('div', {
									children: [ item.title ],
									onclick: item.click,
									className: (typeof item.remove === 'undefined' ? (typeof item.action === 'undefined' ? '' : 'ui_edit_menu_save') : 'ui_edit_menu_remove')
								})
						);
					}),
					Create('div', {
						innerHTML: 'cancel',
						className: 'ui_edit_menu_cancel',
						onclick: () => { removeUIEditMenu(); }
					})
				]
			})
		]
	});
	
}