# Contributing

Before submitting changes:

- Run `tests/run.sh` on Linux with BusyBox and Python 3 installed.
- Review shell changes for quoting, bounded timeouts, input validation and cleanup of temporary files.
- Keep credentials out of logs, test fixtures and commits.
- Test LuCI JavaScript in a supported OpenWrt/LuCI environment where possible.
- For packaging changes, build with the SDK matching the intended OpenWrt release and target.

Hardware-specific behavior cannot be fully verified by the mock ONT tests. Include the ONT model, firmware and OpenWrt version in bug reports, but redact passwords, public IPs and other secrets.
