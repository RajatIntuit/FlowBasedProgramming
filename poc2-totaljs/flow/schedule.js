exports.id = 'schedule';
exports.title = 'Schedule';
exports.group = 'Gears-Condition';
exports.color = 'LightGreen';
exports.icon = 'fa-thermometer-half';
exports.input = [];
exports.output = ['blue'];
exports.version = '1.0.0';
exports.author = 'Xfinity Gears';
exports.options = { schedule: 'dd.MM.yyyy HH:mm:ss', payload: '', props: '', recurrent: false, enabled: true, enable_disable: true, reset: true, debug: true, errors: false };
exports.readme =
`# Condition: Schedule
One time or recurring schedule using our usual mix of cron and go syntax. At the scheduled time the message defined in parameters will be emitted on the out channel. The message can be blank.

### Inputs

### Outputs
- First  -> out

### Params
name	schedule
type	schedule
doc	schedule when to emit message
default	
required	yes
valid values	

name	payload
type	object
doc	message to emit at schedule
default	
required	no
valid values	

name	props
type	object
doc	message to emit at schedule
default	
required	no
valid values	

name	recurrent
type	bool
doc	if true, repeat schedule at defined interval
default	
required	yes
valid values	
`;

exports.html = 
`<div class="padding">
	<div class="row">
		<div class="col-md-6 m">
			<div data-jc="textbox" data-jc-path="property" data-jc-config="placeholder:path.to.value" class="m">Property</div>
		</div>
	</div>	
	<div class="row">
		<div class="col-md-4 m">
			<div data-jc="codemirror" data-jc-path="payload" data-jc-config="placeholder:@({});type:javascript" class="m">Payload</div>
		</div>
	</div>	
	<div class="col-md-4">
		<div data-jc="textbox" data-jc-path="schedule" data-jc-config="placeholder:@(dd.MM.yyyy HH:mm:ss);maxlength:25;align:center">Schedule</div>
	</div>
	<div class="col-md-4 m">
		<div data-jc="codemirror" data-jc-path="props" data-jc-config="placeholder:@({});type:javascript" class="m">Props</div>
	</div>
	<div class="col-md-4 m">
		<div data-jc="textbox" data-jc-path="recurrent" data-jc-config="placeholder:@();type:Boolean|boolean" class="m">Recurrent</div>
	</div>
</div>`;

exports.install = function(instance) {

	var lastdata;

	instance.custom.reconfigure = function() {
		instance.options = U.extend({ temp_heating_day: 22, temp_heating_night: 21, temp_heating_away: 20, hysteresis: 0.5, temp_current: 21, enabled: false, heating: false, mode: 'day' }, instance.options, true);
		instance.options.name = instance.name;		
		send();
	};


	instance.custom.status = function() {
		var options = instance.options;	
		instance.status(global.FLOWBOARD ? 'C:{0} | S:{1} | +-{2} | {3} | M:{4}'.format(options.temp_current, options['temp_heating_'+ options.mode] || '??', options.hysteresis, options.enabled ? 'enabled' : 'disabled', options.mode) : 'Flowbard not found.', global.FLOWBOARD ? null : 'red');
		instance.flowboard('options', options);
	};

	// enable/disable
	instance.on('0', function(flowdata) {
		var temp = flowdata.data;
		var options = instance.options;

		if (temp === true || temp === 1 || temp === 'on')
			options.enabled = true;
		else
			options.enabled = false;
	
		send();
	});

	// temperature
	instance.on('1', function(flowdata) {
		var options = instance.options;
		var val = getVal(flowdata.data, options.property);

		if (!val)
			return;

		if (typeof val !== 'number') {
			val = val.parseFloat();
			if (isNaN(val)){
				instance.error('Error, input value is not a number: ' + val);
				return;
			}
		}	
	
		options.temp_current = val;	
		lastdata = val;

		send();
	});

	// set day mode
	instance.on('2', function(flowdata) {
		var o = instance.options;
		var m = flowdata.data;

		// if data is a string with one of the supported modes then set it as current mode
		if (m === 'day' || m === 'night' || m === 'away')
			o.mode = m;
		else // off
			o.mode = '';

		send();
	});

	function send() {
		if (!lastdata) 
			return;
		
		var options = instance.options;

		if (!options.enabled || !options.mode) {			
			options.heating = false;
			options.cooling = false;
			instance.send(1, lastdata);
		} else {
			if (options.temp_current < (options['temp_heating_' + options.mode] - options.hysteresis)) {
				// start
				options.heating = true;
				instance.send(0, lastdata);
			} else if (options.temp_current > (options['temp_heating_' + options.mode] + options.hysteresis)) {
				// stop
				options.heating = false;
				instance.send(1, lastdata);
			}
		}

		instance.custom.status();
	};

	function getVal(obj, path) {
		if (path) {
			if (path.indexOf('.') === -1)
				return obj[path];
			else
				return U.get(obj, path);
		}

		return obj;
	};

	instance.on('options', instance.custom.reconfigure);
	setTimeout(instance.custom.reconfigure, 3000);

	instance.on('flowboard', function(type, data) {
		switch (type) {
			case 'setoptions':
				instance.options.temp_heating_day = data.temp_heating_day;
				instance.options.temp_heating_night = data.temp_heating_night;
				instance.options.temp_heating_away = data.temp_heating_away;
				instance.options.hysteresis = data.hysteresis;
				instance.custom.reconfigure();
				// send options to designer
				instance.reconfig();
				break;

			case 'getoptions':
				instance.flowboard('options', instance.options);
				break;
		}
	});

	instance.on('click', function() {
		instance.options.enabled = !instance.options.enabled;
		send();
	});
};