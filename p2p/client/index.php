<?php
// this file is a system file that is expected to run alongside the P2P server controller
// if you would like to make a more complex P2P client, create one similar to 'example_controlled_client.php'



// function to request server details
require('../server_details.php');

// load server configuration
$config = requestServerDetails();

// parse init variables
$init = ['state' => 'connect'];

if (isset($_GET['uid'])) {
	
	$init['project_uid'] = $_GET['uid'];
	
	if (isset($_GET['overlay'])) {
		
		$init['listeners']['overlays'] = [$_GET['overlay']];
		
	}
	
}

?>
<html>
<script>

// init socket
const socket = new WebSocket('ws://<?php echo $config->host; ?>:<?php echo $config->ws_port; ?>');
var GLOBAL = {};

// request overlay from server
function requestOverlay(uid, overlay_slug) {
	return 'http://<?php echo $config->host.':'.$config->host_port; ?>/request_image.php?uid='+uid+'&overlay_slug='+overlay_slug+'&time='+Date.now();
}

socket.addEventListener('open', (event) => {
	document.getElementById('main').innerHTML = '<h1>^_^<br />server connected</h1>';
	socket.send('<?php echo json_encode($init); ?>');
});

socket.addEventListener('message', (event) => {
	let data = JSON.parse(event.data);
	
	if (data.identifier) {
		
		// server identifier for controller to match up to screen, if no image is already present
		if (document.getElementById('main').children[0].tagName.toLowerCase() != 'img') {
			document.getElementById('main').innerHTML = '<h1>^_^<br />server connected<br />'+data.identifier+'</h1>';
		}
		
	}
	
	if (data.project_uid) {
		
		// global init from initial declaration, can change from controller
		GLOBAL = data;
		document.getElementById('main').innerHTML = '<img src="'+requestOverlay(GLOBAL.project_uid, GLOBAL.overlays[0])+'" />';
		
	} else if (data.update) {

		// update of data within current state
		if (data.update.overlays.length > 0) {
			document.getElementById('main').innerHTML = '<img src="'+requestOverlay(GLOBAL.project_uid, GLOBAL.overlays[0])+'" />';
		}
	}
	
});

socket.addEventListener('error', (event) => {
	document.getElementById('main').innerHTML = '<h1>x_x<br />server is dead</h1>';
});

socket.addEventListener('close', (event) => {
	document.getElementById('main').innerHTML = '<h1>@_@<br />closed connection</h1>';
});

</script>
<style>
html, body, #main {
	width: 100%;
	height: 100%;
	padding: 0;
	margin: 0;
	font-family: Verdana;
	background-color: #dddddd;
}

h1 {
	font-size: 120px;
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	text-align: center;
}
img {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	max-width: 100%;
  max-height: 100%;
  height: auto;
  display: block;
}
</style>
<body>
<div id="main"></div>
</body>
</html>