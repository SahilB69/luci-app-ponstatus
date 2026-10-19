#!/usr/bin/env python3
"""Mock ZTE F670L telnet service for testing the ponstatus backend.
usage: mock_ont.py MODE PORT CONNFILE   (MODE: ok | badauth | nologin | silent | dark)"""
import socketserver, sys, time

MODE, PORT, CONNFILE = sys.argv[1], int(sys.argv[2]), sys.argv[3]
IAC = b"\xff\xfd\x18\xff\xfd\x1f\xff\xfb\x01\xff\xfb\x03"
OUT = (b" optical running parameters:\r\n\r\n optical temp=11477\r\n\r\n optical SupplyVoltage=32136\r\n\r\n"
       b" optical TXBiasCurrent=7400\r\n\r\n optical TXPower=17553\r\n\r\n optical RXPower=%d\r\n\r\n"
       b" optical VideoRXPower=0\r\n\r\n optical RFTXPower=0\r\nClose optical_dev success!\r\n")

class Handler(socketserver.StreamRequestHandler):
    def handle(self):
        with open(CONNFILE, "a") as f:
            f.write("x\n")
        w = self.wfile.write
        if MODE == "silent":
            time.sleep(30)
            return
        if MODE != "nologin":
            w(IAC + b"\r\nF670L\r\n\r\nLogin:")
            while True:
                if not self.rfile.readline().strip():
                    return
                w(b"Password:")
                pw = self.rfile.readline().strip()
                if MODE != "badauth" and pw == b"secret":
                    break
                w(b"\r\nLogin incorrect\r\n\r\nLogin:")
        w(b"\r\n/ # ")
        while True:
            line = self.rfile.readline()
            if not line:
                return
            cmd = line.strip()
            if cmd == b"exit":
                return
            w(cmd + b"\r\n")
            if cmd == b"opticaltst -getpara":
                w(OUT % (0 if MODE == "dark" else 19))
            w(b"/ # ")

class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True

Server(("127.0.0.1", PORT), Handler).serve_forever()
