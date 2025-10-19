<?php

require('app.php');

// e.g. php start.php external ALL (launches on external ipv4 ('external') and launches websocket server ('ALL'))
app('ddImages')->start($argv);

?>