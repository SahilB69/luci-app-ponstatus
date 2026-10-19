'use strict';
'require view';
'require form';
'require ui';
'require ponstatus.api as api';

return view.extend({
	render: function () {
		var m = new form.Map('ponstatus', _('PON Status: ONT connection'),
			_('Telnet details used to read the optical module data from the ONT. ' +
			  'The router must be able to reach the ONT address (for example through a dedicated management port).'));
		var s = m.section(form.NamedSection, 'main', 'ponstatus');
		var o;

		o = s.option(form.Value, 'host', _('ONT address'));
		o.datatype = 'host';
		o.placeholder = '192.168.1.1';
		o.rmempty = false;

		o = s.option(form.Value, 'port', _('Telnet port'));
		o.datatype = 'port';
		o.placeholder = '23';

		o = s.option(form.Value, 'user', _('Username'));
		o.rmempty = false;

		o = s.option(form.Value, 'pass', _('Password'));
		o.password = true;

		o = s.option(form.Button, '_test', _('Connection test'));
		o.inputtitle = _('Test connection');
		o.inputstyle = 'action';
		o.description = _('Tests the saved settings. Use "Save & Apply" first if you changed anything.');
		o.onclick = function () {
			return api.read(true).then(function (d) {
				if (d && d.ok && !d.error)
					ui.addNotification(null, E('p', _('Connected. Rx power %s dBm, temperature %s °C.')
						.format(d.rx_power === null ? '-' : d.rx_power.toFixed(2), d.temperature.toFixed(1))), 'info');
				else
					ui.addNotification(null, E('p', api.describe(d && d.error)), 'danger');
			}, function () {
				ui.addNotification(null, E('p', api.describe('backend')), 'danger');
			});
		};

		return m.render();
	}
});
