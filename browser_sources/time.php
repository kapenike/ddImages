<?php
require '../app.php';
?>
<html>
<head>
<?php app('fonts')->generateFontCSS(); ?>
<script src="/js_scripts/jsui.min.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
	initTime('<?php echo $_GET['time_params']; ?>');
});

GLOBAL = {};

function initTime(params) {
	params = JSON.parse(atob(params));
	Select('#time', {
		style: params.style,
		children: [
			Create('div', {
				id: 'time_manage'
			})
		]
	});
	if (params.type == 'fromdistance') {
		GLOBAL.distance = parseInt(params.distance);
		GLOBAL.timer = setInterval(runFromDistance, 1000);
		GLOBAL.params = params;
	} else if (params.type == 'towardstime') {
		GLOBAL.distance = params.distance;
		GLOBAL.timer = setInterval(runTowardsTime, 1000);
		GLOBAL.params = params;
	}
}

function runFromDistance() {
	GLOBAL.distance--;
	if (GLOBAL.distance < 0) {
		Select('#time_manage', {
			innerHTML: GLOBAL.params.fallback
		});
		clearInterval(GLOBAL.timer);
	} else {
		let h = Math.floor(GLOBAL.distance / 3600);
		let m = Math.floor((GLOBAL.distance % 3600) / 60);
		let s = Math.floor(GLOBAL.distance % 60);
		printClock(h, m, s);
	}
}

function runTowardsTime() {
	let timediff = GLOBAL.distance - new Date().getTime();
  if (timediff < 0) {
		Select('#time_manage', {
			innerHTML: GLOBAL.params.fallback
		});
		clearInterval(GLOBAL.timer);
	} else {
		let h = Math.floor((timediff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		let m = Math.floor((timediff % (1000 * 60 * 60)) / (1000 * 60));
		let s = Math.floor((timediff % (1000 * 60)) / 1000);
		printClock(h, m, s);
	}
}

function printClock(h, m, s) {
	let output = '';
	if (h > 0 || !GLOBAL.params.hour.hide) {
		output += (GLOBAL.params.hour.pad && h < 10 ? '0'+h : h)+GLOBAL.params.hour.tail+(GLOBAL.params.hour.lb ? '<br/>' : '')+GLOBAL.params.separator;
	}
	if (m > 0 || !GLOBAL.params.minute.hide) {
		output += (GLOBAL.params.minute.pad && m < 10 ? '0'+m : m)+GLOBAL.params.minute.tail+(GLOBAL.params.minute.lb ? '<br/>' : '')+GLOBAL.params.separator;
	}
	if (s > 0 || !GLOBAL.params.second.hide) {
		output += (GLOBAL.params.second.pad && s < 10 ? '0'+s : s)+GLOBAL.params.second.tail+(GLOBAL.params.second.lb ? '<br/>' : '');
	}
	Select('#time_manage', {
		innerHTML: output
	});
}
</script>
<style>
html, body {
	width: 100%;
	height: 100%;
	padding: 0;
	margin: 0;
}
</style>
</head>
<body>
<div id="time"></div>
</body>
</html>