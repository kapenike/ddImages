<?php

require('app.php');

// e.g. php stop.php ALL (stops application and stops websocket server if ('ALL') included)
app('ddImages')->stop($argv);

?>