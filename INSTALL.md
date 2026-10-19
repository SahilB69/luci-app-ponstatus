# Installation guide

This project supports three installation routes. Use a package built for the exact OpenWrt release and architecture whenever possible.

## 1. Install on the router from source

Download the v1.1.0 source archive, transfer it to the router, then run the following as root over SSH:

```sh
cd /tmp
tar -xzf luci-app-ponstatus-1.1.0.tar.gz
cd luci-app-ponstatus
chmod +x install.sh
./install.sh
```

The script requires LuCI. It copies the backend, LuCI menu/ACL and frontend resources, creates the default config only if one does not already exist, sets `/etc/config/ponstatus` permissions to 600, adds installed files to `/etc/sysupgrade.conf`, clears LuCI caches and restarts rpcd.

After installation, open **Status → PON Status → Settings**, enter the ONT management IP, Telnet port (normally 23), username and password, select **Save & Apply**, and use **Test connection**. Then open **Overview**.

Remove manually installed files (the configuration is kept) with:

```sh
cd /tmp/luci-app-ponstatus
./install.sh remove
```

## 2. Install an APK/IPK

Copy a package built for your OpenWrt release and architecture to `/tmp`.

APK-based systems:
```sh
apk add --allow-untrusted /tmp/luci-app-ponstatus-*.apk
```

opkg-based systems:
```sh
opkg install /tmp/luci-app-ponstatus-*.ipk
```

Do not force-install a package built for a different release or architecture. If no compatible artifact is available, build it with the matching SDK.

## 3. Build with the OpenWrt SDK

Copy the package directory into `package/luci-app-ponstatus` in the matching SDK tree, then run:

```sh
./scripts/feeds update luci
./scripts/feeds install luci-base
make menuconfig
make package/luci-app-ponstatus/compile V=s
```

Select **LuCI → Applications → luci-app-ponstatus** in menuconfig. Output packages are written under `bin/packages/`. Refer to [docs/BUILD.md](docs/BUILD.md).

## Security notes

Credentials are stored in `/etc/config/ponstatus`. Keep router access restricted and do not expose ONT Telnet management to untrusted networks. Backups of this configuration may contain the password.

## Compatibility

Designed for ZTE ONTs exposing `opticaltst -getpara` over Telnet (F670L is the target model). Other ONT models or firmware versions may not provide the expected command/output. Test on your own hardware before relying on the readings.