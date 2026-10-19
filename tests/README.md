# Regression tests

Run on Linux with Python 3 and BusyBox installed:

```sh
chmod +x tests/run.sh
tests/run.sh
```

The script exercises the rpcd backend against a local mock ONT, including successful reads, caching, parallel callers, missing optical data, authentication/configuration failures and bounded timeout behavior. It does not replace testing against a real ONT and router.
