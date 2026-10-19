# Building with the OpenWrt SDK

Build against the SDK matching the router's OpenWrt release, target and architecture. LuCI packages can be release- and ABI-sensitive; do not assume a package built for a different release or target is compatible.

## Local SDK build

1. Download and extract the official OpenWrt SDK for your router's release and target from the [OpenWrt downloads](https://downloads.openwrt.org/).
2. Copy this repository into the SDK as `package/luci-app-ponstatus` (the repository root contains `Makefile`, `root/` and `htdocs/`).
3. Update the LuCI feed:
   ```sh
   ./scripts/feeds update luci
   ```
4. Configure and compile:
   ```sh
   make defconfig
   make package/luci-app-ponstatus/compile V=s
   ```
5. Find the resulting APK or IPK under `bin/packages/`.

## GitHub Actions

- `.github/workflows/build.yml` downloads the OpenWrt 25.12.5 SDK for `mediatek/filogic`, compiles the package, uploads a 90-day workflow artifact, and publishes the package to the `latest` prerelease on pushes to `main`. Version tags beginning with `v` publish versioned releases.
- `.github/workflows/test.yml` runs shell syntax checks and the BusyBox mock-ONT regression suite.

The published `latest` package is specifically built for OpenWrt 25.12.5 on `mediatek/filogic`. Do not install it on a different release or target. For other routers, build with the matching SDK.

## Manual regression tests

On a Linux host with BusyBox and Python 3 installed:
```sh
sh -n root/usr/libexec/rpcd/ponstatus
sh -n install.sh
sh tests/run.sh
```

The mock ONT suite covers cache behavior, forced refresh, concurrent callers, authentication failure, no-login firmware, missing optical signal, invalid configuration and connection timeouts. It cannot replace a test against the target ONT and firmware.
