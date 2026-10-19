#!/bin/sh
# Runs the rpcd plugin under busybox against a mock ZTE telnet server.
# Needs: busybox, python3.   Usage: tests/run.sh
cd "$(dirname "$0")/.." || exit 1
PLUGIN=$PWD/root/usr/libexec/rpcd/ponstatus
MOCK=$PWD/tests/mock_ont.py
T=$(mktemp -d); BB=$T/bin; mkdir "$BB"; busybox --install -s "$BB"
PORT=2323; FAIL=0

cat > "$T/functions.sh" <<'STUB'
config_load() { :; }
config_get() { eval "$1=\${T_$3:-\$4}"; }
STUB

call() {
	printf '%s' "${1:-{\}}" | env -i PATH="$BB" PONSTATUS_DIR="$T/state" PONSTATUS_LIB="$T/functions.sh" \
		T_host="${T_host:-127.0.0.1}" T_port="$PORT" T_user="${T_user-root}" T_pass=secret "$BB/sh" "$PLUGIN" call get
}
start() { rm -rf "$T/state" "$T/conns"; : > "$T/conns"; python3 "$MOCK" "$1" $PORT "$T/conns" & MPID=$!; sleep 0.6; }
stop()  { kill $MPID 2>/dev/null; wait $MPID 2>/dev/null; }
conns() { wc -l < "$T/conns" | tr -d ' '; }
check() {
	if printf '%s' "$3" | grep -qE "$2" && printf '%s' "$3" | python3 -c 'import json,sys; json.load(sys.stdin)'; then
		echo "ok    $1"
	else
		echo "FAIL  $1  -> $3"; FAIL=1
	fi
}

GOOD='"ok":true,"age":[0-9]+,"temperature":44.8,"voltage":3.214,"bias_current":14.8,"tx_power":2.44,"rx_power":-27.21'

start ok
s=$(date +%s); out=$(call); e=$(date +%s)
check "fresh read" "$GOOD" "$out"
echo "      first read took $((e - s)) s"
out=$(call); check "cache hit" "$GOOD" "$out"
[ "$(conns)" = 1 ] && echo "ok    one ONT session for two calls" || { echo "FAIL  sessions: $(conns)"; FAIL=1; }
out=$(call '{"force":true}'); check "force skips cache" "$GOOD" "$out"
[ "$(conns)" = 2 ] && echo "ok    force opened a new session" || { echo "FAIL  sessions: $(conns)"; FAIL=1; }
stop

start ok
for i in 1 2 3 4 5; do call > "$T/par$i" & done; wait $! 2>/dev/null; sleep 4
bad=0; for i in 1 2 3 4 5; do grep -q '"ok":true' "$T/par$i" || bad=1; done
[ $bad = 0 ] && [ "$(conns)" = 1 ] && echo "ok    5 parallel callers share one session" || { echo "FAIL  parallel (sessions: $(conns))"; FAIL=1; }
stop

start nologin; out=$(call);  check "shell without login" "$GOOD" "$out"; stop
start dark;    out=$(call);  check "no light -> null" '"rx_power":null' "$out"; stop
start badauth; out=$(call); check "wrong password" '"ok":false,"error":"auth"' "$out"; stop
start ok; out=$(T_user= call); check "no username" '"ok":false,"error":"config"' "$out"; stop
start ok; out=$(T_host=-x call); check "bad host" '"ok":false,"error":"config"' "$out"; stop

start ok; call >/dev/null; stop; sleep 6
out=$(call); check "ONT gone: last reading kept + error" "$GOOD.*\"error\":\"unreachable\"" "$out"
rm -rf "$T/state"; out=$(call); check "connection refused" '"ok":false,"error":"unreachable"' "$out"

start silent; s=$(date +%s); out=$(call); e=$(date +%s); stop
check "silent ONT times out" '"ok":false' "$out"
[ $((e - s)) -le 12 ] && echo "ok    bounded time ($((e - s)) s)" || { echo "FAIL  took $((e - s)) s"; FAIL=1; }

ls "$T/state" 2>/dev/null | tr '\n' ' '; echo "<- leftover state files"
rm -rf "$T"
[ $FAIL = 0 ] && echo "ALL PASSED" || echo "FAILURES"
exit $FAIL
