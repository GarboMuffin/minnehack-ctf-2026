import sys

plaintext = open(sys.argv[1], 'rb').read()
pad = open(sys.argv[2], 'rb').read()

assert len(plaintext) < len(pad)

output = open(sys.argv[3], 'wb')
for a, b in zip(plaintext, pad):
    output.write(bytes([a ^ b]))
