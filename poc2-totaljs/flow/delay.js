exports.id = 'delay';
exports.title = 'Delay';
exports.group = 'Gears-Condition';
exports.color = 'LightGreen';
exports.icon = 'fa-thermometer-half';
exports.input = ['green', 'blue'];
exports.output = ['green', 'blue'];
exports.version = '1.0.0';
exports.author = 'Xfinity Gears';
exports.options = { delay: 5, timer_id: '123', enabled: true, enable_disable: true, reset: true, debug: true, errors: false };
exports.readme = 
`# Condition: Delay
Forward message received on activate channel immediately on the init channel, and, after delay time has passed also on the out channel, unless a message arrives on the cancel channel in the meantime. Delay should be given in simplified cron syntax, for example, 1s or 1h. timer_id, if provided, is used as ID for the internal timer ID, example: payload.meta.id

### Inputs
- First  -> activate
- Second -> cancel

### Outputs
- First  -> out
- Second -> init

### Params
name	delay
type	string
doc	time string for delay, for example 1s or 1h
default	
required	yes
valid values	

name	timer_id
type	string
doc	optional hint for timer id, for example payload.meta.id
default	
required	no
valid values	
`;

exports.html = 
`<div class="padding">
	<div class="row">
		<div class="col-md-6 m">
			<div data-jc="textbox" data-jc-path="property" data-jc-config="placeholder:path.to.value" class="m">Property</div>
		</div>
	</div>	
	<div class="col-md-4 m">
		<div data-jc="textbox" data-jc-path="delay" data-jc-config="placeholder:5;type:number;increment:true" class="m">Delay</div>
	</div>
	<div class="col-md-4 m">
		<div data-jc="textbox" data-jc-path="timer_id" data-jc-config="placeholder:'123'" class="m">Timer Id</div>
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