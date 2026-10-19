# luci-app-ponstatus

LuCI page (**Status → PON Status**) with live Rx/Tx power, temperature, supply voltage and Tx bias current for a ZTE ONT optical module (developed for the F670L). Readings are retrieved from `opticaltst -getpara` over the ONT's Telnet management interface.

## Requirements

- OpenWrt with LuCI (JavaScript-based LuCI; OpenWrt 22.03 or newer is the intended baseline).
- BusyBox `nc` and `mkfifo`.
- Router network access to the ONT management IP and Telnet port.
- A compatible ZTE ONT exposing `opticaltst -getpara`; other models/firmware may not work.

## Installation

Choose **one** method.

### Method A — Install a built package (recommended)

Download an APK or IPK built for your exact OpenWrt release and architecture from the repository's [Actions](https://github.com/SahilB69/luci-app-ponstatus/actions) artifacts or [Releases](https://github.com/SahilB69/luci-app-ponstatus/releases). Do not install a package built for a different OpenWrt release or target.

The published `latest` APK targets **OpenWrt 25.12.5, mediatek/filogic**. On a compatible router, run this over SSH as root:

```sh
wget -O /tmp/luci-app-ponstatus.apk https://github.com/SahilB69/luci-app-ponstatus/releases/download/latest/luci-app-ponstatus.apk &&
apk add --allow-untrusted /tmp/luci-app-ponstatus.apk
```

This allows installation of an unsigned package. Only install it if the release and target match your router.

If you already have a compatible APK in `/tmp`:
```sh
apk add --allow-untrusted /tmp/luci-app-ponstatus.apk
```

If your router uses IPK or the available package is incompatible, build with the matching SDK or use Method B.

### Method B — Install from source on the router

1. Download the source archive from the repository and copy it to the router (for example, to `/tmp`).
2. SSH to the router and run:
   ```sh
   cd /tmp
   tar -xzf luci-app-ponstatus-1.1.0.tar.gz
   cd luci-app-ponstatus
   chmod +x install.sh
   ./install.sh
   ```
   Run as `root`. The script checks for LuCI, installs backend and frontend files, preserves an existing `/etc/config/ponstatus`, sets the config file to mode 600, adds installed paths to `/etc/sysupgrade.conf`, and restarts rpcd.
3. Open LuCI and go to **Status → PON Status → Settings**.
4. Enter the ONT IP address, Telnet port (usually 23), username and password. The default username is `root`; change it if your ONT uses a different account.
5. Click **Save & Apply**, then **Test connection**. Open **Overview** to see the readings.

To remove the manually installed files while preserving the configuration:
```sh
cd /tmp/luci-app-ponstatus
./install.sh remove
```

### Method C — Build a package using the OpenWrt SDK

Use the SDK matching your router's OpenWrt release and target. Copy this repository to `package/luci-app-ponstatus`, then run:
```sh
./scripts/feeds update luci
make defconfig
make package/luci-app-ponstatus/compile V=s
```
See [docs/BUILD.md](docs/BUILD.md) for more detail. The resulting package is under `bin/packages/`.

## Configuration and security

The ONT username/password are stored in `/etc/config/ponstatus`; the installer sets permissions to 600. Fresh installs default the username to `root`; existing configurations are preserved during installation. Use a unique ONT password where supported, restrict Telnet/management access to the router's trusted management network, and never expose the ONT's Telnet port to the public internet. Do not share config backups containing credentials.

## How it works

- `ubus call ponstatus get` reads cached data from `/tmp/ponstatus`.
- When data is older than five seconds, one background refresh is started; concurrent callers share it.
- The backend uses bounded, expect-style Telnet interaction and reports errors such as `unreachable`, `auth`, `config`, `nodata` and `tools`.
- The web page polls every ten seconds and pauses while the browser tab is hidden. A previous good reading is retained with a warning if refresh fails.

## Optical metric thresholds

Edit the `zones` entries in `htdocs/luci-static/resources/view/ponstatus/overview.js`. Defaults include Rx warning below -30 dBm (critical below -32 dBm or above -8 dBm), Tx 0.5–5 dBm, temperature warning above 70 °C (critical above 85 °C), and voltage 3.1–3.5 V. Thresholds are model-dependent; confirm against your ONT specifications.

## Troubleshooting

- Stuck on “Reading…”: run `ubus call ponstatus get '{"force":true}'` and inspect `cat /tmp/ponstatus/err`.
- Cannot reach ONT: check router-to-ONT routing, address, management interface and Telnet port.
- Backend error: run `/etc/init.d/rpcd restart`, then refresh or log back into LuCI.
- Empty or unexpected readings: verify that the ONT firmware supports `opticaltst -getpara` and that the configured credentials are correct.

## Tests

Run `tests/run.sh` on Linux with BusyBox and Python 3 installed. It uses a mock ZTE Telnet service; it does not replace testing on a real ONT.

## Source and license

Source code is organized under `root/`, `htdocs/`, and `tests/`. The package Makefile declares Apache-2.0; see [LICENSE](LICENSE).
