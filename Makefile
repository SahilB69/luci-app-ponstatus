include $(TOPDIR)/rules.mk

PKG_VERSION:=1.1.0
PKG_RELEASE:=1
PKG_LICENSE:=Apache-2.0

LUCI_TITLE:=PON module status for ZTE ONTs (Rx/Tx power, temperature, voltage, bias)
LUCI_DESCRIPTION:=Live optical module readings from a ZTE ONT (e.g. F670L), read over its telnet management port.
LUCI_DEPENDS:=+luci-base +rpcd
LUCI_PKGARCH:=all

# Register the new rpcd ubus object immediately after package installation.
define Package/luci-app-ponstatus/postinst
#!/bin/sh
if [ -z "${IPKG_INSTROOT}" ]; then
	rm -f /tmp/luci-indexcache /tmp/luci-modulecache /tmp/ponstatus
	/etc/init.d/rpcd restart
fi
exit 0
endef

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature
