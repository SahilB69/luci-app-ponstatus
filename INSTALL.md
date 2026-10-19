# Installation

Choose a method below. Packages must match the router's OpenWrt release and target; do not force-install an incompatible package.

## 1. Install the published APK

The repository's `latest` APK is built for **OpenWrt 25.12.5, mediatek/filogic**. Use it only on a compatible APK-based router. Run as root over SSH:

```sh
wget -O /tmp/luci-app-ponstatus.apk https://github.com/SahilB69/luci-app-ponstatus/releases/download/latest/luci-app-ponstatus.apk && apk add --allow-untrusted /tmp/luci-app-ponstatus.apk
```

`--allow-untrusted` permits installation of an unsigned package. Install only packages you trust.

## 2. Install an existing package

Copy a package built for your router to `/tmp`, then use the matching package manager.

APK-based systems:
```sh
apk add --allow-untrusted /tmp/luci-app-ponstatus.apk
```

IPK/opkg-based systems:
```sh
opkg install /tmp/luci-app-ponstatus.ipk
```

## 3. Install from source on the router

Download the [latest source archive](https://github.com/SahilB69/luci-app-ponstatus/archive/refs/tags/latest.tar.gz) and transfer it to the router, or download it directly over SSH:

```sh
cd /tmp
wget -O luci-app-ponstatus.tar.gz https://github.com/SahilB69/luci-app-ponstatus/archive/refs/tags/latest.tar.gz
tar -xzf luci-app-ponstatus.tar.gz
cd luci-app-ponstatus-latest
chmod +x install.sh
./install.sh
```

Run the installer as root. It checks for LuCI, installs the backend and frontend files, creates the default configuration only if none exists, sets `/etc/config/ponstatus` to mode 600, adds installed paths to `/etc/sysupgrade.conf`, clears LuCI caches and restarts rpcd.

After installation, open **Status → PON Status → Settings**, enter the ONT management IP, Telnet port (usually 23), username and password, then select **Save & Apply** and **Test connection**. The default username is `root`. Open **Overview** to view readings.

To remove manually installed application files while keeping the configuration, run from the extracted source directory:

```sh
./install.sh remove
```

## 4. Build a package with the OpenWrt SDK

Use the SDK matching the router's OpenWrt release and target. Copy this repository into `package/luci-app-ponstatus` in the SDK tree, then run:

```sh
./scripts/feeds update luci
make defconfig
make package/luci-app-ponstatus/compile V=s
```

The output package is under `bin/packages/`. See [docs/BUILD.md](docs/BUILD.md).

## Compatibility and configuration

Designed for ZTE ONTs exposing `opticaltst -getpara` over Telnet; the F670L is the target model. Other models or firmware may return different output or may not work. Credentials are stored in `/etc/config/ponstatus`; restrict ONT management access to a trusted network and do not expose Telnet to the public internet.
