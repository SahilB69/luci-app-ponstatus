# luci-app-ponstatus

LuCI interface for monitoring PON/ONT status on OpenWrt, with a lightweight backend, cached status retrieval, and a responsive web UI.

The v1.1.0 source archive is preserved under `releases/`. See `docs/BUILD.md` for the OpenWrt SDK build workflow and `CONTRIBUTING.md` for local checks.

## Features

- Live optical module readings from supported ZTE ONTs (tested design target: F670L).
- Cached backend reads and shared refreshes to reduce ONT sessions.
- LuCI overview and settings pages.
- BusyBox/mock-ONT regression tests.

## Compatibility and security

Requires OpenWrt with LuCI, `rpcd`, BusyBox utilities including `nc` and `mkfifo`, and network reachability to the ONT management interface. Review `root/etc/config/ponstatus` and secure ONT management access before deployment. Credentials are stored in the router configuration; protect router access and do not expose the ONT management service to untrusted networks.

## Source and build

The original v1.1.0 source archive is in [`releases/luci-app-ponstatus-1.1.0.tar.gz`](releases/luci-app-ponstatus-1.1.0.tar.gz). The workflow in `.github/workflows/build.yml` builds against an OpenWrt SDK using the upstream `openwrt/gh-action-sdk` action. See [`docs/BUILD.md`](docs/BUILD.md).

## License

The package Makefile declares Apache-2.0. See `LICENSE`.