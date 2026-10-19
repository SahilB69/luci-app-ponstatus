# luci-app-ponstatus

A LuCI page at **Status → PON Status** showing optical Rx/Tx power, module temperature, supply voltage and Tx bias current for compatible ZTE ONTs. Developed for the ZTE F670L; readings come from `opticaltst -getpara` over the ONT's Telnet management interface.

## Requirements

- OpenWrt with LuCI.
- BusyBox `nc` and `mkfifo`.
- Network access from the router to the ONT's management IP and Telnet port (usually 23).
- A ZTE ONT/firmware that supports `opticaltst -getpara`; compatibility with other models is not guaranteed.

## Install

**Recommended:** install a package built for your exact OpenWrt release and target. The published [latest APK](https://github.com/SahilB69/luci-app-ponstatus/releases/download/latest/luci-app-ponstatus.apk) is built for **OpenWrt 25.12.5, mediatek/filogic** and must not be installed on other targets/releases.

On a compatible APK-based router, run as root over SSH:

```sh
wget -O /tmp/luci-app-ponstatus.apk https://github.com/SahilB69/luci-app-ponstatus/releases/download/latest/luci-app-ponstatus.apk && apk add --allow-untrusted /tmp/luci-app-ponstatus.apk
```

See [INSTALL.md](INSTALL.md) for source installation, package installation and build instructions.

## Configure

In LuCI, open **Status → PON Status → Settings**. Enter the ONT management IP, Telnet port, username and password, then select **Save & Apply** and **Test connection**. The default username is `root`. Existing configuration is preserved during upgrades; credentials are stored in `/etc/config/ponstatus` with mode 600.

## Behavior

- The backend caches readings in `/tmp/ponstatus`; data older than five seconds triggers a background refresh.
- The page polls every ten seconds and pauses polling while the browser tab is hidden.
- If a refresh fails, the last good reading may remain visible with a warning.

## Troubleshooting

- **No reading:** run `ubus call ponstatus get '{"force":true}'` over SSH.
- **Cannot connect:** check the router's route to the ONT, management IP and Telnet port.
- **Unexpected/missing values:** confirm that the ONT firmware supports `opticaltst -getpara`.

## Development

- Build instructions: [docs/BUILD.md](docs/BUILD.md)
- Regression tests: run `sh tests/run.sh` on Linux with BusyBox and Python 3.
- License: Apache-2.0 (see [LICENSE](LICENSE)).
