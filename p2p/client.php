<?php

if (!file_exists('web_socket_server_details.json')) {
	echo '
		<html>
		<style>
		 h1 {
			 font-size: 120px;
			 position: absolute;
			 top: 50%;
			 left: 50%;
			 transform: translate(-50%, -50%);
			 text-align: center;
		 }
		</style>
		<body>
			<h1>x_x <br /> server is dead</h1>
		</body>
		</html>
	';
	exit;
}

// load server configuration
$config = json_decode(file_get_contents('web_socket_server_details.json'));

// parse init variables
$init = ['state' => 'connect'];

if (isset($_GET['project_uid'])) {
	
	$init['project_uid'] = $_GET['project_uid'];
	
	if (isset($_GET['overlay'])) {
		
		$init['listeners']['overlays'] = [$_GET['overlay']];
		
	}
	
}

?>
<html>
<script>

const socket = new WebSocket('ws://<?php echo $config->host; ?>:<?php echo $config->ws_port; ?>');

socket.addEventListener('open', (event) => {
	socket.send('<?php echo json_encode($init); ?>');
});

socket.addEventListener('message', (event) => {
	console.log(JSON.parse(event.data));
});

socket.addEventListener('error', (event) => {
	document.body.innerHTML = '<h1>x_x <br /> server is dead</h1>';
});

socket.addEventListener('close', (event) => {
	document.body.innerHTML = '<h1>-_- <br /> closed connection</h1>';
});

</script>
<style>
html, body, #main {
	width: 100%;
	height: 100%;
	padding: 0;
	margin: 0;
	font-family: Verdana;
}

h1 {
	font-size: 120px;
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	text-align: center;
}
</style>
<body>
<div id="main"></div>
</body>
</html>