# FSD[ ddImages ]
![Dynamic Data Images](/logo.png)
- Automate image changes using custom data fields, datasets and asset lists.
- ddImages changes will automatically update live in an OBS scene

> [!IMPORTANT]  
> The primary directory **ddImages** cannot be renamed. ddImages does not use Apache and therefore has no hierarchical method to manage data paths. The directory named ddImages is used for relative pathing.

## Windows Download
- Download and extract from: holdonacoupledaysforbeta.url
- Launch `MSLaunchFSDimages.bat`

## Linux / MacOS install
- Install PHP (will vary depending on your distro)
	> sudo apt install php
	
- Update your php.ini config file to allow large image uploads and project imports.
	- Enter the following console command to locate your config file
	> php --ini
	
	- *(e.g. result): Loaded Configuration File:         /etc/php/8.3/cli/php.ini*
	- change the following configuration properties:
		- `upload_max_filesize=8M` -> `upload_max_filesize=2G`
		- `post_max_size=8M` -> `post_max_size=2G`
		- `memory_limit=128M` -> `memory_limit=2G`
		
- Clone or Download and extract the repository
- Navigate to the **ddImages** primary directory and launch the application using:
	> php -S localhost:8000
	
- Visit `localhost:8000` in your web browser to start using the application!

## To-DO

- BETA release
	- [x] font manager
	- [x] text rotation
	- [ ] custom clipping path
	- [ ] documentation

- FULL release features
	- [ ] variable inputs need to safe reference path as an in-built string like `(**pointer**$var$some/path$/var$)`
		- [ ] when re-opening a path variable, it should start at the current path directory
	- [ ] create section app that highjacks the region and creates a bracket system within using all generate ui components and datasets
	- [ ] restructure edit overlay app and generate overlay, classify and break into sub methods and a master state
		- [ ] add feature for selecting layer onclick and scroll wheel through
		- [ ] allow center position images and rotation on them
	- [ ] offer color picker as a tool for variable inputs
	- [ ] classify and make browser sources a library manager
	 - [ ] allow p2p connection to browser sources that live update with Switchboard data
	- [ ] create banner browser source app
	
- BUGS
	- [ ] Head feature to prevent infinite loops in getRealValue will also prevent the same variable path from being printed twice within the same line