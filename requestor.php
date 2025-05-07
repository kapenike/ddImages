<?php

/*
!!!data needs to associate tournament, team and player data to overlays so that a change procs an update to the overlay
*/

echo json_encode((object)[
	'tournament' => $_POST['tournament'],
	'application' => $_POST['application']
]);

?>