'use strict';
'require baseclass';
'require rpc';

var callGet = rpc.declare({
	object: 'ponstatus',
	method: 'get',
	params: [ 'force' ]
});

var MESSAGES = {
	unreachable: _('Cannot reach the ONT. Check the cable and that the ONT address answers a ping from the router.'),
	auth: _('The ONT rejected the login. Check the username and password.'),
	config: _('The ONT connection is not configured yet (address, username, password).'),
	nodata: _('The ONT answered but returned no optical data.'),
	tools: _('The router is missing a required tool (nc or mkfifo).'),
	backend: _('Cannot reach the router backend (ubus object "ponstatus"). Restart rpcd, then reload this page.')
};

return baseclass.extend({
	/* force=true skips the backend cache and reads the ONT now */
	read: function (force) {
		return callGet(!!force);
	},

	describe: function (code) {
		return MESSAGES[code] || _('Unexpected error (%s).').format(code);
	},

	/* errors the user can fix on the Settings page */
	fixableInSettings: function (code) {
		return code === 'auth' || code === 'config' || code === 'unreachable';
	}
});
