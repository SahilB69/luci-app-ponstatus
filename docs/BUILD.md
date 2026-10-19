# Building with the OpenWrt SDK

Build against the SDK matching the router's OpenWrt release, target and architecture. LuCI packages can be ABI- and release-sensitive; do not assume an APK built for a different release is compatible.

## Local SDK build

1. Download and extract the official OpenWrt SDK for the target device and release from the [OpenWrt downloads](https://downloads.openwrt.org/).
2. Copy this repository's package directory into the SDK as `package/luci-app-ponstatus`. The package directory is the repository root (it contains `Makefile`, `root/` and `htdocs/`).
3. Update and install the LuCI feed if needed:
   ```sh
   ./scripts/feeds update luci
   ./scripts/feeds install -a -p luci
   ```
4. Configure the package and compile:
   ```sh
   make menuconfig
   # Select LuCI -> Applications -> luci-app-ponstatus
   make package/luci-app-ponstatus/compile V=s
   ```
5. Find the generated package under `bin/packages/<arch>/`. Recent OpenWrt releases use APK; older releases may use IPK.

## GitHub Actions

The workflow in `.github/workflows/build.yml` runs the BusyBox mock-ONT regression suite and builds the package with the upstream `openwrt/gh-action-sdk` action for x86/64. Treat that artifact as a CI smoke build, not as a substitute for building with the exact SDK for your router. For release artifacts, use a matching target/release SDK and retain the build logs.
