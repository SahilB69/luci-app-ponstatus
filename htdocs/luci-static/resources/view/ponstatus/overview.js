'use strict';
'require view';
'require poll';
'require ponstatus.api as api';

var POLL_SECONDS = 10;
var STALE_AFTER = 30;
var RANK = { na: 0, ok: 1, warn: 2, crit: 3 };
var TINT = { ok: 'rgba(46,157,87,.38)', warn: 'rgba(224,138,0,.38)', crit: 'rgba(210,60,60,.38)', na: 'rgba(128,128,128,.22)' };

function icon(paths) {
	return '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" ' +
		'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + '</svg>';
}

var METRICS = [
	{ id: 'rx_power', title: _('Rx power'), hint: _('Light received from the OLT'), unit: 'dBm', dec: 2, min: -35, max: -5,
	  icon: icon('<path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14"/>'),
	  none: { level: 'crit', label: _('No light') },
	  zones: [[-Infinity, -32, 'crit', _('Too low')], [-32, -30, 'warn', _('Low')], [-30, -8, 'ok', _('Good')], [-8, Infinity, 'crit', _('Too high')]] },
	{ id: 'tx_power', title: _('Tx power'), hint: _('Light sent towards the OLT'), unit: 'dBm', dec: 2, min: -2, max: 8,
	  icon: icon('<path d="M12 20V9m0 0-4 4m4-4 4 4M5 4h14"/>'),
	  none: { level: 'crit', label: _('Off') },
	  zones: [[-Infinity, 0.5, 'crit', _('Too low')], [0.5, 5, 'ok', _('Good')], [5, Infinity, 'crit', _('Too high')]] },
	{ id: 'temperature', title: _('Temperature'), hint: _('Optical module'), unit: '°C', dec: 1, min: 0, max: 100,
	  icon: icon('<path d="M10 14.5V5a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0z"/>'),
	  zones: [[-Infinity, -10, 'warn', _('Cold')], [-10, 70, 'ok', _('Normal')], [70, 85, 'warn', _('Warm')], [85, Infinity, 'crit', _('Hot')]] },
	{ id: 'voltage', title: _('Supply voltage'), hint: _('Module supply'), unit: 'V', dec: 3, min: 3.0, max: 3.6,
	  icon: icon('<path d="M13 3 5 13h6l-1 8 8-10h-6z"/>'),
	  zones: [[-Infinity, 3.0, 'crit', _('Too low')], [3.0, 3.1, 'warn', _('Low')], [3.1, 3.5, 'ok', _('Good')], [3.5, 3.6, 'warn', _('High')], [3.6, Infinity, 'crit', _('Too high')]] },
	{ id: 'bias_current', title: _('Tx bias current'), hint: _('Laser bias'), unit: 'mA', dec: 1, min: 0, max: 40,
	  icon: icon('<path d="M3 12h4l2-6 4 12 2-6h6"/>'), zones: [[-Infinity, Infinity, 'na', '']] }
];

var CSS = '\
.pon{--pon-ok:#2e9d57;--pon-warn:#e08a00;--pon-crit:#d23c3c;--pon-na:#8a8f98;--pon-line:rgba(128,128,128,.28)}\
.pon-head{display:flex;flex-wrap:wrap;align-items:center;gap:.6em 1em;margin:.4em 0 1.1em}\
.pon-head .pon-grow{flex:1;min-width:8em}\
.pon-pill{display:inline-flex;align-items:center;gap:.5em;padding:.3em .9em;border-radius:99px;font-weight:600;color:#fff;background:var(--pon-na);transition:background .3s}\
.pon-pill i{width:.55em;height:.55em;border-radius:50%;background:#fff;opacity:.85}\
.pon-pill.ok{background:var(--pon-ok)}.pon-pill.warn{background:var(--pon-warn)}.pon-pill.crit{background:var(--pon-crit)}\
.pon-updated{opacity:.7}\
.pon-note{margin:0 0 1.1em;padding:.7em 1em;border-radius:8px;border:1px solid var(--pon-warn);background:rgba(224,138,0,.12)}\
.pon-note.crit{border-color:var(--pon-crit);background:rgba(210,60,60,.12)}\
.pon-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px}\
.pon-card{border:1px solid var(--pon-line);border-radius:12px;padding:14px 16px 12px;background:rgba(128,128,128,.07);transition:opacity .3s}\
.pon-top{display:flex;align-items:center;gap:.55em}.pon-ico{display:inline-flex;opacity:.65}.pon-title{font-weight:600;flex:1}\
.pon-chip{font-size:.75em;font-weight:600;padding:.15em .6em;border-radius:99px;color:var(--pon-na);background:rgba(128,128,128,.16)}.pon-chip:empty{display:none}\
.pon-value{margin:.35em 0 .1em;line-height:1.15;white-space:nowrap}.pon-num{font-size:2em;font-weight:700;font-variant-numeric:tabular-nums}\
.pon-unit{font-size:.9em;opacity:.65;margin-left:.3em}.pon-bar{position:relative;height:6px;border-radius:3px;margin:.9em 0 .35em}\
.pon-mark{position:absolute;top:50%;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;background:var(--pon-na);border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.25);transition:left .5s ease,background .3s}\
.pon-scale{display:flex;justify-content:space-between;font-size:.72em;opacity:.55;font-variant-numeric:tabular-nums}.pon-hint{font-size:.8em;opacity:.6;margin-top:.5em}\
.lvl-ok .pon-num{color:var(--pon-ok)}.lvl-warn .pon-num{color:var(--pon-warn)}.lvl-crit .pon-num{color:var(--pon-crit)}\
.lvl-ok .pon-mark{background:var(--pon-ok)}.lvl-warn .pon-mark{background:var(--pon-warn)}.lvl-crit .pon-mark{background:var(--pon-crit)}\
.lvl-ok .pon-chip{color:var(--pon-ok);background:rgba(46,157,87,.15)}.lvl-warn .pon-chip{color:var(--pon-warn);background:rgba(224,138,0,.15)}.lvl-crit .pon-chip{color:var(--pon-crit);background:rgba(210,60,60,.15)}\
.pon-grid.stale .pon-card{opacity:.55}.pon-card.loading .pon-num{opacity:.25;animation:pon-pulse 1.2s ease-in-out infinite}.pon-grid.offline .pon-card.loading .pon-num{animation:none}\
@keyframes pon-pulse{50%{opacity:.6}}@media (prefers-reduced-motion:reduce){.pon *{animation:none!important;transition:none!important}}';

function classify(m, v) {
	if (v === null) return m.none;
	for (var i = 0; i < m.zones.length; i++)
		if (v >= m.zones[i][0] && v < m.zones[i][1])
			return { level: m.zones[i][2], label: m.zones[i][3] };
	return { level: 'na', label: '' };
}

function trackGradient(m) {
	var span = m.max - m.min, stops = [];
	function pct(x) { return Math.max(0, Math.min(100, (x - m.min) / span * 100)); }
	m.zones.forEach(function (z) {
		var a = pct(z[0]), b = pct(z[1]);
		if (b > a) stops.push(TINT[z[2]] + ' ' + a + '% ' + b + '%');
	});
	return 'linear-gradient(90deg,' + stops.join(',') + ')';
}

function setText(node, text) { if (node.textContent !== text) node.textContent = text; }
function setClass(node, cls) { if (node.className !== cls) node.className = cls; }
function formatAge(s) { s = Math.max(0, Math.round(s)); return s < 60 ? s + ' s' : Math.floor(s / 60) + ' min ' + (s % 60) + ' s'; }

return view.extend({
	render: function () {
		var last = null, busy = null;
		var pillText = E('span'), pill = E('span', { 'class': 'pon-pill', 'role': 'status' }, [ E('i'), pillText ]);
		var updated = E('span', { 'class': 'pon-updated' });
		var note = E('div', { 'class': 'pon-note', 'role': 'alert' });
		var grid = E('div', { 'class': 'pon-grid' });
		var button = E('button', { 'class': 'cbi-button cbi-button-action', 'click': function () { update(true); } }, _('Refresh'));
		note.hidden = true;

		METRICS.forEach(function (m) {
			var r = m.ref = {
				card: E('div', { 'class': 'pon-card loading', 'role': 'group', 'aria-label': m.title }),
				num: E('span', { 'class': 'pon-num' }, '--'), unit: E('span', { 'class': 'pon-unit' }, m.unit),
				chip: E('span', { 'class': 'pon-chip' }), mark: E('div', { 'class': 'pon-mark' }),
				bar: E('div', { 'class': 'pon-bar', 'title': m.min + ' – ' + m.max + ' ' + m.unit })
			};
			var ico = E('span', { 'class': 'pon-ico' }); ico.innerHTML = m.icon;
			r.bar.style.background = trackGradient(m); r.bar.appendChild(r.mark); r.mark.hidden = true;
			[ E('div', { 'class': 'pon-top' }, [ ico, E('span', { 'class': 'pon-title' }, m.title), r.chip ]),
			  E('div', { 'class': 'pon-value' }, [ r.num, r.unit ]), r.bar,
			  E('div', { 'class': 'pon-scale' }, [ E('span', String(m.min)), E('span', String(m.max)) ]),
			  E('div', { 'class': 'pon-hint' }, m.hint)
			].forEach(function (n) { r.card.appendChild(n); });
			grid.appendChild(r.card);
		});

		function paintCard(m, v) {
			var r = m.ref;
			if (v === undefined) {
				r.card.classList.add('loading'); setClass(r.card, 'pon-card loading');
				setText(r.num, '--'); setText(r.chip, ''); r.unit.hidden = false; r.mark.hidden = true;
				return 'na';
			}
			var c = classify(m, v); setClass(r.card, 'pon-card lvl-' + c.level);
			setText(r.num, v === null ? c.label : v.toFixed(m.dec)); r.unit.hidden = (v === null);
			setText(r.chip, v === null ? '' : c.label); r.mark.hidden = (v === null);
			if (v !== null) r.mark.style.left = Math.max(0, Math.min(100, (v - m.min) / (m.max - m.min) * 100)) + '%';
			return c.level;
		}

		function showNote(level, code) {
			var nodes = [ api.describe(code) ];
			if (api.fixableInSettings(code)) nodes.push(' ', E('a', { 'href': L.url('admin/status/ponstatus/settings') }, _('Open settings')));
			note.className = 'pon-note ' + level; note.hidden = false;
			while (note.firstChild) note.removeChild(note.firstChild);
			nodes.forEach(function (n) { note.appendChild(typeof n === 'string' ? document.createTextNode(n) : n); });
		}

		function paint() {
			var d = last && last.d, ok = !!(d && d.ok), pending = !!(d && d.pending) || !d;
			var age = ok ? d.age + (Date.now() - last.at) / 1000 : 0, stale = ok && age > STALE_AFTER, worst = 'na';
			setClass(grid, 'pon-grid' + (stale ? ' stale' : '') + (!ok && !pending ? ' offline' : ''));
			METRICS.forEach(function (m) { var lvl = paintCard(m, ok ? d[m.id] : undefined); if (RANK[lvl] > RANK[worst]) worst = lvl; });

			if (ok && !stale) {
				setClass(pill, 'pon-pill ' + (worst === 'na' ? 'ok' : worst));
				setText(pillText, { ok: _('Healthy'), warn: _('Warning'), crit: _('Critical'), na: _('Healthy') }[worst]);
			} else if (ok) { setClass(pill, 'pon-pill'); setText(pillText, _('Stale')); }
			else if (pending) { setClass(pill, 'pon-pill'); setText(pillText, _('Reading…')); }
			else { setClass(pill, 'pon-pill crit'); setText(pillText, _('Offline')); }

			setText(updated, ok ? _('Updated %s ago').format(formatAge(age)) : pending ? _('Contacting the ONT…') : _('Last attempt failed'));
			if (d && d.error) showNote(ok ? 'warn' : 'crit', d.error); else note.hidden = true;
		}

		function update(force) {
			if (busy) return busy;
			if (document.hidden && !force) return Promise.resolve();
			if (force) { button.disabled = true; setText(button, _('Refreshing…')); }
			function finish(d) { last = { d: d, at: Date.now() }; busy = null; button.disabled = false; setText(button, _('Refresh')); paint(); }
			busy = api.read(force).then(finish, function () { finish({ ok: false, error: 'backend' }); });
			return busy;
		}

		paint(); update(false);
		poll.add(function () { return update(false); }, POLL_SECONDS);
		var ticker = window.setInterval(paint, 1000);
		window.addEventListener('pagehide', function () { window.clearInterval(ticker); });
		document.addEventListener('visibilitychange', function () { if (!document.hidden) update(false); });
		return E('div', { 'class': 'pon' }, [
			E('style', CSS), E('h2', _('PON Module Status')),
			E('div', { 'class': 'pon-head' }, [ pill, E('span', { 'class': 'pon-grow' }, updated), button ]),
			note, grid
		]);
	},
	handleSaveApply: null, handleSave: null, handleReset: null
});
