var settings = {};
var common = {};
common.database = [];
common.events = {};
common.settings = {};
common.operations = {};
common.statics = {};
common.instances = [];

SETTER(true, 'loading', 'hide', 1000);

common.operations.emit = function(name, a, b, c, d) {
	$('figure.component').each(function() {
		this.$instance.emit(name, a, b, c, d);
	});
	return common.operations;
};

common.operations.remove = function(name, uninstall) {
	$('figure[data-name="{0}"]'.format(name)).each(function() {
		var instance = this.$instance;
		instance.emit('destroy');
		delete instance.$events;
		$(this).remove();
	});
	common.database = common.database.remove('name', name);
	uninstall && SETTER('websocket', 'send', { TYPE: 'uninstall', body: name });
	UPDATE('common.database', 1000);
};

common.operations.append = function(html, updated) {

	var beg = -1;
	var end = -1;
	var tmp = -1;

	var body_settings = '';
	var body_svg = '';
	var body_script = '';
	var body_readme = '';
	var body_style = '';
	var body_html = '';

	while (true) {

		beg = html.indexOf('<script', end);
		if (beg === -1)
			break;

		end = html.indexOf('</script>', beg + 7);
		tmp = html.indexOf('<script', beg + 7);

		if (tmp !== -1 && tmp < end) {
			while (true) {
				end = html.indexOf('</script>', tmp + 7);
				tmp = html.indexOf('<script', tmp + 7);
				if (tmp === -1 || tmp > end) {
					end = html.lastIndexOf('</script>', tmp);
					break;
				}
			}
		}

		if (end === -1)
			break;

		var body = html.substring(beg, end);

		var beg = body.indexOf('>') + 1;
		var type = body.substring(0, beg);
		body = body.substring(beg).trim();

		if (type.indexOf('markdown') !== -1)
			body_readme = body;
		else if (type.indexOf('html') !== -1) {
			if (type.indexOf('body') === -1)
				body_settings = body;
			else
				body_html = body;
		} else if (type.indexOf('svg') !== -1)
			body_svg = body;
		else
			body_script = body;

		end += 9;
	}

	if (!body)
		return false;

	beg = html.indexOf('<style');
	if (beg !== -1)
		body_style = html.substring(html.indexOf('>', beg) + 1, html.indexOf('</style>')).trim();

	var component = {};
	new Function('exports', body_script)(component);

	if (!component.name)
		return false;

	component.settings = body_settings;
	component.svg = body_svg;
	component.readme = body_readme;
	component.html = body_html;
	component.dateupdated = updated;

	if (body_style) {
		$('#inlinecss_' + component.name).remove();
		$('<style type="text/css" id="inlinecss_{0}">'.format(component.name) + body_style + '</style>').appendTo('head');
	}

	var index = common.database.findIndex('name', component.name);
	if (index === -1)
		common.database.push(component);
	else {
		var tmp = common.database[index];
		tmp.uninstall && tmp.uninstall(true);
		common.database[index] = component;
		var designer = FIND('designer');
		designer && designer.operations.upgrade(component);
	}

	common.database.quicksort('name');

	// hack for refreshing database
	common.form === 'database' && UPDATE('common.database');
	return true;
};

function Instance(id, tab, element, declaration, options) {
	this.$events = {};
	this.id = id;
	this.tab = tab;
	this.scope = 'scope' + id;
	this.name = declaration.name;
	this.options = $.extend(true, CLONE(declaration.options), options || EMPTYOBJECT);
	this.element = element;
	declaration.install.call(this, this);
	this.make && this.make();
}

Instance.prototype.emit = function(name) {
	var e = this.$events[name];
	if (e && e.length) {
		for (var i = 0, length = e.length; i < length; i++)
			e[i].call(this, arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
	}
	return this;
};

Instance.prototype.on = function(name, fn) {
	var e = this.$events[name];
	!e && (this.$events[name] = e = []);
	e.push(fn);
	return this;
};

Instance.prototype.menu = function(items, el, callback, offsetX) {
	FIND('controls').show(el || this.element, items, callback, offsetX);
	return this;
};

Instance.prototype.send = function(id, type, data) {
	if (data) {
		var msg = {};
		msg.TYPE = 'send';
		msg.id = id;
		msg.type = type;
		msg.body = data;
		SETTER('websocket', 'send', msg);
	} else {
		var msg = {};
		msg.TYPE = 'send';
		msg.id = id;
		msg.type = type;
		msg.body = data;
		setTimeout2('isend' + id + 'x' + (type || ''), function(msg) {
			SETTER('websocket', 'send', msg);
		}, 200, 10, msg);
	}
	return this;
};

Instance.prototype.find = function(selector) {
	return this.element.find(selector);
};

Instance.prototype.append = function(value) {
	return this.element.append(value);
};

Instance.prototype.html = function(value) {
	return this.element.html(value);
};

Instance.prototype.event = function() {
	this.element.on.apply(this.element, arguments);
	return this;
};

Instance.prototype.css = function() {
	this.element.css.apply(this.element, arguments);
	return this;
};

Instance.prototype.settings = function() {
	var self = this;
	staticContent(self, function() {
		var options = CLONE(self.options);
		SET('settings.' + self.name, options, true);
		EMIT('open.' + self.name, options);
		SET('common.form', 'settings-' + self.name);
		RESET('settings.' + self.name + '.*', 500);
	});
	return self;
};

String.prototype.parseTransform = function() {
	var prop = ['translate', 'matrix', 'rotate', 'skewX', 'skewY', 'scale'];
	var val = this.match(/(translate|matrix|rotate|skewX|skewY|scale)\(.*?\)/g);
	var obj = {};
	if (val) {
		for (var i = 0, length = val.length; i < length; i++) {
			var item = val[i];
			var index = item.indexOf('(');
			var v = item.substring(index + 1, item.length - 1).split(/\,|\s/);
			var n = item.substring(0, index);
			obj[n] = {};
			switch (n) {
				case 'translate':
				case 'scale':
					obj[n].x = +v[0] || 0;
					obj[n].y = +v[1] || 0;
					break;
				case 'rotate':
					obj[n].a = +v[0] || 0;
					obj[n].x = +v[1] || 0;
					obj[n].y = +v[2] || 0;
					break;
				case 'skewX':
				case 'skewY':
					obj[n].a = +v[0];
					break;
				case 'matrix':
					obj[n].a = +v[0] || 0;
					obj[n].b = +v[1] || 0;
					obj[n].c = +v[2] || 0;
					obj[n].d = +v[3] || 0;
					obj[n].e = +v[4] || 0;
					obj[n].f = +v[5] || 0;
					break;
			}
		}
	}

	obj.toString = function() {
		var builder = [];
		for (var i = 0, length = prop.length; i < length; i++) {
			var n = prop[i];
			var o = this[n];
			if (!o)
				continue;
			switch (n) {
				case 'translate':
				case 'scale':
					builder.push(n + '(' + o.x + ',' + o.y + ')');
					break;
				case 'rotate':
					builder.push(n + '(' + o.a + ' ' + o.x + ' ' + o.y + ')');
					break;
				case 'skewX':
				case 'skewY':
					builder.push(n + '(' + o.a + ')');
					break;
				case 'matrix':
					builder.push(n + '(' + o.a + ',' + o.b + ',' + o.c + ',' + o.d + ',' + o.e + ',' + o.f + ')');
					break;
			}
		}
		return builder.join(' ');
	};

	return obj;
};

$.fn.getPosition = function(fixed) {
	var obj = {};
	obj.x = this.css('left').parseInt();
	obj.y = this.css('top').parseInt();
	obj.width = fixed ? this.width() : this.innerWidth();
	obj.height = fixed ? this.height() : this.innerHeight();
	var matrix = this.css('transform');
	if (matrix) {
		var values = matrix.substring(1, matrix.length - 1).trim();
		values = values.split(',').trim();
		obj.rotation = Math.round(Math.asin(values[1]) * (180 / Math.PI));
	} else
		obj.rotation = null;
	return obj;
};

$.fn.setPosition = function(obj) {
	var css = {};
	obj.x != null && (css.left = obj.x + 'px');
	obj.y != null && (css.top = obj.y + 'px');
	obj.width != null && (css.width = obj.width + 'px');
	obj.height != null && (css.height = obj.height + 'px');
	obj.rotation != null && (css.transform = 'rotate({0}deg)'.format(obj.rotation));
	this.css(css);
	return this;
};
