# Build and test

## Local OpenWrt SDK build

Use the official SDK matching the router's OpenWrt release, target and architecture. Packages may be incompatible across releases or targets.

1. Download and extract the SDK from [OpenWrt downloads](https://downloads.openwrt.org/).
2. Copy this repository into the SDK tree as \`package/luci-app-ponstatus\`.
3. Run:

\`\`\`sh
./scripts/feeds update luci
make defconfig
make package/luci-app-ponstatus/compile V=s
\`\`\`

The APK/IPK is written under \`bin/packages/\`.

## GitHub Actions and releases

- \`.github/workflows/build.yml\` builds against the OpenWrt **25.12.5** SDK for **mediatek/filogic**, uploads a 90-day Actions artifact, and publishes the package on pushes to \`main\`.
- The moving \`latest\` release points to the latest successful main-branch build. Its APK is only for OpenWrt 25.12.5 on mediatek/filogic.
- Pushing a version tag beginning with \`v\` publishes a version-tagged release.
- \`.github/workflows/test.yml\` runs shell checks and the mock-ONT regression suite.

For another OpenWrt release or target, build with the matching SDK instead of installing the published \`latest\` APK.

## Regression tests

On Linux with BusyBox and Python 3 installed, run:

\`\`\`sh
sh -n root/usr/libexec/rpcd/ponstatus
sh -n install.sh
sh tests/run.sh
\`\`\`

The test suite uses a mock Telnet ONT. It checks common reading, cache, concurrency and connection-error behavior, but does not replace testing on a real ONT.
