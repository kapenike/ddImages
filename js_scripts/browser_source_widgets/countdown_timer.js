function setupCountdownClockWidget() {
	Select('#widget_content', {
		innerHTML: '',
		children: [
			Create('form', {
				id: 'countdown_clock_widget_form',
				children: [
					Create('div', {
						className: 'block',
						children: [
							Create('h3', {
								innerHTML: 'Create Countdown Clock'
							}),
							Create('label', {
								innerHTML: 'Type',
								children: [
									Create('select', {
										name: 'countdown_clock_type',
										onchange: function () {
											Select('#cc_hour', { innerHTML: (this.value == 'fromdistance' ? 'Hours' : 'Hour (24 hour clock)')});
										},
										children: [
											Create('option', {
												value: 'fromdistance',
												innerHTML: 'Countdown by Set Amount'
											}),
											Create('option', {
												value: 'towardstime',
												innerHTML: 'Countdown towards Set Time'
											})
										]
									})
								]
							}),
							Create('div', {
								className: 'row',
								children: [
									Create('div', {
										className: 'col',
										style: { width: '33.3%' },
										children: [
											Create('label', {
												children: [
													Create('span', {
														id: 'cc_hour',
														innerHTML: 'Hours',
													}),
													Create('input', {
														name: 'countdown_clock_hours',
														type: 'number',
														value: 0,
														min: 0
													})
												]
											})
										]
									}),
									Create('div', {
										className: 'col',
										style: { width: '33.3%' },
										children: [
											Create('label', {
												children: [
													Create('span', {
														innerHTML: 'Minutes',
													}),
													Create('input', {
														name: 'countdown_clock_minutes',
														type: 'number',
														value: 0,
														min: 0
													})
												]
											})
										]
									}),
									Create('div', {
										className: 'col',
										style: { width: '33.3%' },
										children: [
											Create('label', {
												children: [
													Create('span', {
														innerHTML: 'Seconds',
													}),
													Create('input', {
														name: 'countdown_clock_seconds',
														type: 'number',
														value: 0,
														min: 0
													})
												]
											})
										]
									})
								]
							})
						]
					}),
					Create('div', {
						className: 'block',
						children: [
							Create('h3', {
								innerHTML: 'Style'
							}),
							Create('p', {
								style: {
									fontSize: '12px'
								},
								innerHTML: '<i>Style values are set using JavaScript camelCase equivalents to CSS such as "fontSize" rather than "font-size".</li>'
							}),
							Create('div', {
								id: 'cc_styles',
								children: [
									Create('div', {
										className: 'row',
										children: [
											Create('div', {
												className: 'col',
												style: { width: '33.3%' },
												innerHTML: '<i>Style Key</i>'
											}),
											Create('div', {
												className: 'col',
												style: { width: '33.3%' },
												innerHTML: '<i>Style Value</i>'
											})
										]
									}),
									Create('div', {
										className: 'create_data_key',
										innerHTML: '+ Add Style',
										onclick: addNewCountdownClockStyleEntry
									})
								]
							})
						]
					}),
					Create('div', {
						className: 'block',
						children: [
							Create('h3', {
								innerHTML: 'Settings',
							}),
							Create('div', {
								children: [
									Create('label', {
										innerHTML: 'Text display on ending countdown',
										children: [
											Create('input', {
												type: 'text',
												name: 'cc_end_text_display',
												value: 'Starting Soon'
											})
										]
									}),
									Create('label', {
										innerHTML: 'Uniform H:M:S Separator',
										children: [
											Create('input', {
												type: 'text',
												name: 'cc_uniform_separator',
												value: ':'
											})
										]
									})
								]
							})
						]
					}),
					Create('div', {
						className: 'row block',
						children: [
							Create('h3', {
								innerHTML: 'H:M:S Settings'
							}),
							Create('div', {
								className: 'col',
								style: { width: '33.3%' },
								children: [
									Create('h5', {
										innerHTML: 'Hours'
									}),
									Create('label', {
										innerHTML: 'Tail',
										children: [
											Create('input', {
												type: 'text',
												name: 'cc_hour_tail',
												value: ''
											})
										]
									}),
									Create('label', {
										innerHTML: 'Pad with 0',
										children: [
											Create('input', {
												type: 'checkbox',
												name: 'cc_hour_pad',
												value: 'true',
												checked: true
											})
										]
									}),
									Create('label', {
										innerHTML: 'Line Break After',
										children: [
											Create('input', {
												type: 'checkbox',
												name: 'cc_hour_linebreak',
												value: 'true',
												checked: false
											})
										]
									}),
									Create('label', {
										innerHTML: 'Hide When 0',
										children: [
											Create('input', {
												type: 'checkbox',
												name: 'cc_hour_hidewhen0',
												value: 'true',
												checked: false
											})
										]
									})
								]
							}),
							Create('div', {
								className: 'col',
								style: { width: '33.3%' },
								children: [
									Create('h5', {
										innerHTML: 'Minutes'
									}),
									Create('label', {
										innerHTML: 'Tail',
										children: [
											Create('input', {
												type: 'text',
												name: 'cc_minute_tail',
												value: ''
											})
										]
									}),
									Create('label', {
										innerHTML: 'Pad with 0',
										children: [
											Create('input', {
												type: 'checkbox',
												name: 'cc_minute_pad',
												value: 'true',
												checked: true
											})
										]
									}),
									Create('label', {
										innerHTML: 'Line Break After',
										children: [
											Create('input', {
												type: 'checkbox',
												name: 'cc_minute_linebreak',
												value: 'true',
												checked: false
											})
										]
									}),
									Create('label', {
										innerHTML: 'Hide When 0',
										children: [
											Create('input', {
												type: 'checkbox',
												name: 'cc_minute_hidewhen0',
												value: 'true',
												checked: false
											})
										]
									})
								]
							}),
							Create('div', {
								className: 'col',
								style: { width: '33.3%' },
								children: [
									Create('h5', {
										innerHTML: 'Seconds'
									}),
									Create('label', {
										innerHTML: 'Tail',
										children: [
											Create('input', {
												type: 'text',
												name: 'cc_second_tail',
												value: ''
											})
										]
									}),
									Create('label', {
										innerHTML: 'Pad with 0',
										children: [
											Create('input', {
												type: 'checkbox',
												name: 'cc_second_pad',
												value: 'true',
												checked: true
											})
										]
									}),
									Create('label', {
										innerHTML: 'Line Break After',
										children: [
											Create('input', {
												type: 'checkbox',
												name: 'cc_second_linebreak',
												value: 'true',
												checked: false
											})
										]
									}),
									,
									Create('label', {
										innerHTML: 'Hide When 0',
										children: [
											Create('input', {
												type: 'checkbox',
												name: 'cc_second_hidewhen0',
												value: 'true',
												checked: false
											})
										]
									})
								]
							})
						]
					}),
					Create('button', {
						innerHTML: 'Generate Browser Source Timer',
						onclick: generateBrowserSourceTimer
					})
				]
			}),
			Create('label', {
				innerHTML: 'Countdown Clock Browser Source URL',
				children: [
					Create('input', {
						type: 'text',
						id: 'cc_output',
						readonly: 'readOnly',
						onclick: function () { this.focus(); this.select() },
						placeholder: 'Edit your settings and then generate a browser source timer'
					})
				]
			})
		]
	});

}

function addNewCountdownClockStyleEntry() {
	Select('#cc_styles').insertBefore(
		Create('div', {
			className: 'row',
			children: [
				Create('div', {
					className: 'col',
					style: { width: '33.3%' },
					children: [
						Create('input', {
							type: 'text',
							name: 'cc_style_keys[]'
						})
					]
				}),
				Create('div', {
					className: 'col',
					style: { width: '33.3%' },
					children: [
						Create('input', {
							type: 'text',
							name: 'cc_style_values[]'
						})
					]
				}),
				Create('div', {
					className: 'col',
					style: { width: '33.3%' },
					children: [
						Create('div', {
							className: 'remove_data_key',
							innerHTML: '&times',
							onclick: function () {
								this.parentNode.parentNode.remove();
							}
						})
					]
				})
			]
		})
	, Select('#cc_styles').lastChild);
}

function generateBrowserSourceTimer() {
	let timer_params = formToObj('countdown_clock_widget_form');
	
	let distance = 0;
	if (timer_params.countdown_clock_type == 'fromdistance') {
		distance = (parseInt(timer_params.countdown_clock_hours)*60*60) + (parseInt(timer_params.countdown_clock_minutes)*60) + parseInt(timer_params.countdown_clock_seconds);
	} else {
		let now = new Date();
		now.setHours(parseInt(timer_params.countdown_clock_hours));
		now.setMinutes(parseInt(timer_params.countdown_clock_minutes));
		now.setSeconds(parseInt(timer_params.countdown_clock_seconds));
		distance = now.getTime();
	}
	
	let styles = {};
	if (timer_params['cc_style_keys[]']) {
		timer_params['cc_style_keys[]'].forEach((key, index) => {
			styles[key] = timer_params['cc_style_values[]'][index];
		});
	}

	let send_obj = {
		type: timer_params.countdown_clock_type,
		fallback: timer_params.cc_end_text_display,
		distance: distance,
		separator: timer_params.cc_uniform_separator,
		style: styles,
		hour: {
			tail: timer_params.cc_hour_tail,
			pad: timer_params.cc_hour_pad ? true : false,
			lb: timer_params.cc_hour_linebreak ? true : false,
			hide: timer_params.cc_hour_hidewhen0 ? true : false
		},
		minute: {
			tail: timer_params.cc_minute_tail,
			pad: timer_params.cc_minute_pad ? true : false,
			lb: timer_params.cc_minute_linebreak ? true : false,
			hide: timer_params.cc_minute_hidewhen0 ? true : false
		},
		second: {
			tail: timer_params.cc_second_tail,
			pad: timer_params.cc_second_pad ? true : false,
			lb: timer_params.cc_second_linebreak ? true : false,
			hide: timer_params.cc_second_hidewhen0 ? true : false
		}
	};
	console.log(send_obj);
	
	Select('#cc_output', {
		value: window.location.origin+'/browser_sources/time.php?time_params='+btoa(JSON.stringify(send_obj))
	});
}