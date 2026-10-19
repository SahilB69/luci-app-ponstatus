# Regression tests

Run on Linux with BusyBox and Python 3 installed:

```sh
sh tests/run.sh
```

The script exercises the rpcd backend against a local mock ZTE ONT over Telnet. It checks readings, caching, concurrent callers and common connection/configuration errors. It does not replace testing on the target router and ONT firmware.
