import sys
import base64
import hashlib
import hmac
import struct
import time

secret = "RU43TH2ZWYQQSBYWF25SN4SBSDNNINJ7"

def totp(secret):
    tm = int(time.time() / 30)
    key = base64.b32decode(secret)
    b = struct.pack(">q", tm)
    hm = hmac.HMAC(key, b, hashlib.sha1).digest()
    offset = hm[-1] & 0x0F
    truncatedHash = hm[offset:offset + 4]
    code = struct.unpack(">L", truncatedHash)[0]
    code &= 0x7FFFFFFF
    code %= 1000000
    return code

def read_int():
    while True:
        s = input("> ")
        if len(s) != 6:
            print("Code should only be 6 digits.")
            continue
        try:
            return int(s)
        except ValueError:
            print("That's not a number.")

try:
    # for perf reasons we just compute the code once even though it technically should switch every 30s
    code = totp(secret)
    while True:
        token = read_int()
        if code == token:
            sys.exit(0)
        else:
            print("Invalid 2FA, try again.")
except KeyboardInterrupt:
    sys.exit(1)
