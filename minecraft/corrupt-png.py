import struct
import sys

data = open(sys.argv[1], 'rb').read()

# destroy the CRC
result = bytearray(data)
pos = 8
while pos + 8 <= len(result):
    chunk = result[pos:pos + 8]
    if len(chunk) < 8:
        break
    length = struct.unpack('>I', chunk[:4])[0]
    write_pos = pos + 8 + length
    if write_pos + 4 <= len(result):
        random_value = struct.pack('>I', 0x12345678)
        result[write_pos:write_pos + 4] = random_value
    pos += 8 + length

open(sys.argv[1], 'wb').write(result)
