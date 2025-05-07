function initStreamOverlay() {
	
	ajax('POST', '/requestor.php', {
		application: 'load_base_data',
		tournament: 'coddoubletap'
	}, streamDataLoaded, 'body');
	
}

function streamDataLoaded(status, data) {
	if (status) {
		console.log(data);
	} else {
		alert('whoops');
	}
}