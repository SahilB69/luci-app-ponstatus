#!/bin/sh
# Install or remove luci-app-ponstatus on a running OpenWrt router (no SDK or package manager).
# Usage (as root, from the unpacked directory):  ./install.sh [install|remove]
# An existing /etc/config/ponstatus is never overwritten.
set -eu
cd "$(dirname "$0")"

FILES="/usr/libexec/rpcd/ponstatus
/usr/share/rpcd/acl.d/luci-app-ponstatus.json
/usr/share/luci/menu.d/luci-app-ponstatus.json
/www/luci-static/resources/ponstatus/api.js
/www/luci-static/resources/view/ponstatus/overview.js
/www/luci-static/resources/view/ponstatus/settings.js"

[ "$(id -u)" = 0 ] || { echo "Run as root." >&2; exit 1; }
[ -d /usr/share/luci ] || { echo "LuCI does not seem to be installed." >&2; exit 1; }

case "${1:-install}" in
install)
	for tool in nc mkfifo; do
		command -v "$tool" >/dev/null 2>&1 || echo "Warning: '$tool' not found; the backend needs busybox nc and mkfifo." >&2
	done
	cp -a root/usr/. /usr/
	mkdir -p /www && cp -a htdocs/. /www/
	[ -f /etc/config/ponstatus ] || cp root/etc/config/ponstatus /etc/config/ponstatus
	chmod 755 /usr/libexec/rpcd/ponstatus
	chmod 600 /etc/config/ponstatus
	rm -f /www/luci-static/resources/view/ponstatus/status.js        # leftover from 1.0.0
	echo "$FILES" | while read -r f; do
		grep -qxF "$f" /etc/sysupgrade.conf 2>/dev/null || echo "$f" >> /etc/sysupgrade.conf
	done
	echo "Installed. Enter the ONT login under Status > PON Status > Settings."
	;;
remove)
	echo "$FILES" | while read -r f; do rm -f "$f"; done
	rm -rf /www/luci-static/resources/view/ponstatus /www/luci-static/resources/ponstatus
	if [ -f /etc/sysupgrade.conf ]; then
		echo "$FILES" | while read -r f; do sed -i "\\|^$f\\$|d" /etc/sysupgrade.conf; done
	fi
	echo "Removed. /etc/config/ponstatus was kept."
	;;
*)
	echo "Usage: $0 [install|remove]" >&2; exit 1 ;;
esac

rm -rf /tmp/luci-indexcache /tmp/luci-modulecache /tmp/ponstatus
/etc/init.d/rpcd restart
