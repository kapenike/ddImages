# FSD[ ddImages ]
![Dynamic Data Images](/logo.png)
- Automate image changes using custom data fields, datasets and asset lists
- ddImages changes will automatically update live in an OBS scene

> [!IMPORTANT]  
> The primary directory **ddImages** cannot be renamed. ddImages does not use Apache and therefore has no hierarchical method to manage data paths. The directory named ddImages is used for relative pathing.

## Windows Download
- Download and extract from: [https://firststepdesign.co/file/ddImages.zip](https://firststepdesign.co/file/ddImages.zip) (35.9 MB)
- Launch `LaunchFSDddImages.bat`

*The windows download includes an example project by default. Check it out to learn how the application works!*

## Linux / MacOS install
*The base code does not include an example project by default, download and import it from: [https://firststepdesign.co/file/Example.fsdi](https://firststepdesign.co/file/Example.fsdi) (220.3 KB)*

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
		- `max_input_vars=1000` -> `max_input_vars=10000`
		- ensure the php_zip extension is enabled `extension=zip`, no `;` preceding it
		- ensure the php_curl extension is enabled `extension=curl`, no `;` preceding it
		- ensure the php_curl extension is enabled `extension=sockets`, no `;` preceding it
		
- Clone or Download and extract the repository
- Rename the primary directory to `ddImages` NOT `ddImages-main`
- Navigate to the **ddImages** primary directory and launch the application using:
	> php -S localhost:8000
	
- Visit `localhost:8000` in your web browser to start using the application!

- Websockets works for Linux and Windows ... no test case for Mac available so either donate one to me or commit a change for all files under  `/p2p/`

## To-DO

FEATURES:

- Switchboard
	- allow multiple pages
	
- Datasets and Assets
	- probably pretty complex, but an updated asset and/or dataset needs to traverse current data state to determine if it will require an overlay update
		this then needs to notify P2P server of the updated data point containing the asset and/or dataset update
		
- Dataset
	- allow sorting
	- on create, scroll new insert into view and highlight

- Overlay editor features
	- ctrl + z, ctrl + y: undo and redo
	- position image from different origins, then allow image rotations, update flipLayer function with new positioning possibilities
	- allow text to overflow when prompted and provide a new height dimension, with that allow vertical positioning, default top but allow center and bottom, update flipLayer function with new positioning possibilities
	- right click tool on overlay editor to:
		- create new layer
		- remove layer if selection is within active layer bounds
		- select layer, behind layer, layer container
		- ctrl + t for a new UI to control rotation and dimensions of layer object

- variable input
	- needs to allow window anchor selection to change specific concatted variables rather than just appending the new variable selection
	- offer search option for lists containing more than 10 values
	- needs complete rewrite with new variable storage on HTMLElements using JSUI

- P2P
	- allow viewing of uncontrolled clients as well as allowing force disconnect of any client

BUGS:

- head feature to prevent infinite loops in getRealValue will also prevent the same variable path from being printed twice within the same line

OUTSTANDING WORK:

- QOL: drag move of group layers has old logic to handle the dragged contents of the direct drag object, it needs to be updated to merge with the new logic for dragging all infinite sub groups of a parent container