import os
import struct
import random
import zlib

f = open('resourcepack.zip', 'wb')

def rand_short():
    return struct.pack('<H', random.randint(0, 0xFFFF))
def rand_int():
    return struct.pack('<I', random.randint(0, 0xFFFFFFFF))
def rand_name():
    s = ""
    for i in range(random.randint(1, 50)):
        s += random.choice("abcdefghijklmnopqrstuvwxyz/////...")
    if random.uniform(0, 1) < 0.5:
        return f"assets/minecraft/textures/entity/{s}.png"
    return f"./assets/minecraft/textures/entity/{s}.png"

def corrupt_png(data):
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
            random_value = struct.pack('>I', random.randint(0, 0xFFFFFFFF))
            result[write_pos:write_pos + 4] = random_value
        pos += 8 + length
    # add some extra data so that zlib actually does something and hides the PNG header
    for i in range(0, random.randint(1000, 2000)):
        result.append(random.randint(32, 100))
    return bytes(result)

paths = []
paths.append({
    "path": rand_name(),
    "type": "bomb"
})

all_walk = []
for dirpath, dirnames, filenames in os.walk('resourcepack'):
    for name in filenames:
        all_walk.append(os.path.join(dirpath, name))

def path_key(p):
    if 'flag1' in p: return 1
    if 'flag2' in p: return 2
    return 3

for path in sorted(all_walk, key=path_key):
    trimmed_path = path.replace('resourcepack/', '')
    with open(path, 'rb') as ff:
        uncompressed_data = ff.read()
        if path.endswith('.png') and name != 'pack.png':
            uncompressed_data = corrupt_png(uncompressed_data)
        compressed_data = zlib.compress(uncompressed_data, level=zlib.Z_BEST_COMPRESSION, wbits=-zlib.MAX_WBITS)

        if 'flag1' in path:
            paths.insert(0, {
                "path": trimmed_path,
                "type": "flag1",
                "uncompressed_data": uncompressed_data,
                "compressed_data": compressed_data
            })
            continue

        paths.append({
            "path": f"./{trimmed_path}",
            "type": "decoy",
        })

        if 'flag2' in path:
            paths.append({
                "path": trimmed_path,
                "type": "flag2",
                "uncompressed_data": uncompressed_data,
                "compressed_data": compressed_data
            })
        else:
            paths.append({
                "path": trimmed_path,
                "type": "real",
                "uncompressed_data": uncompressed_data,
                "compressed_data": compressed_data
            })

        paths.append({
            "path": f"./{trimmed_path}",
            "type": "decoy",
        })

        # if random.uniform(0, 1) < 0.5:
        #     paths.append({
        #         "path": trimmed_path,
        #         "type": "mock"
        #     })
        if random.uniform(0, 1) < 0.9:
            paths.append({
                "path": rand_name(),
                "type": "bomb"
            })

# local headers
for meta in paths:
    meta["local_header_start"] = f.tell()
    # magic header
    f.write(b'\x50\x4b\x03\x04')
    # version needed to extract
    f.write(struct.pack('<B', random.randint(0x80, 0xFF)))
    f.write(struct.pack('<B', random.randint(0x00, 0xFF)))
    # bit flag
    f.write(struct.pack('<h', 0))
    # compression method
    # f.write(struct.pack('<h', 0))
    f.write(b"\x08\x00") # cant tamper with, vanilla checks
    # modification time
    f.write(rand_short())
    # modification date
    f.write(rand_short())
    # crc-32 of uncompressed
    f.write(rand_int())
    # compressed size
    if meta["type"] in ('real', 'flag2'):
        f.write(struct.pack("<i", len(meta["compressed_data"])))
    elif meta["type"] in ('flag1',):
        f.write(struct.pack("<i", len(meta["uncompressed_data"])))
    elif meta["type"] in ('decoy'):
        f.write(struct.pack("<I", 0))
    elif meta["type"] in ('bomb', 'mock'):
        f.write(struct.pack("<I", random.randint(0x10000000, 0xFFFFFFFF)))
    # uncompressed size
    f.write(rand_int())
    # f.write(rand_int())
    # file name length
    f.write(struct.pack("<h", len(meta["path"])))
    # extra field length
    f.write(struct.pack("<h", 0)) # cant screw with
    # file name
    f.write(meta["path"].encode('utf-8'))
    # extra field
    # data
    if meta["type"] in ('real', 'flag2'):
        f.write(meta["compressed_data"])
    elif meta["type"] in ('flag1',):
        f.write(meta["uncompressed_data"])

central_directory_start = f.tell()

# central directory
for meta in paths:
    if meta["type"] == "mock":
        continue
    # magic header
    f.write(b'\x50\x4b\x01\x02')
    # version made by
    f.write(rand_short())
    # version needed to extract
    f.write(struct.pack('<B', random.randint(0x80, 0xFF)))
    f.write(struct.pack('<B', random.randint(0x00, 0xFF)))
    # bit flag
    f.write(struct.pack('<h', 0))
    # compression method
    # f.write(struct.pack('<h', 0))
    if meta["type"] in ('real', 'flag2'):
        f.write(b"\x08\x00") # cant tamper with, vanilla checks
    else:
        f.write(b"\x00\x00")
    # modification time
    f.write(rand_short())
    # modification date
    f.write(rand_short())
    # crc-32 of uncompressed
    f.write(rand_int())
    # compressed size
    if meta["type"] in ('real', 'flag2'):
        f.write(struct.pack("<i", len(meta["compressed_data"])))
    elif meta["type"] in ('decoy', 'flag1'):
        f.write(struct.pack("<I", 0))
    elif meta["type"] in ('bomb', 'mock'):
        f.write(struct.pack("<I", random.randint(0xFF000000, 0xFFFFFFFF)))
    # uncompressed size
    f.write(rand_int())
    # file name length
    f.write(struct.pack("<h", len(meta["path"])))
    # extra field length
    f.write(struct.pack("<h", 0))
    # file comment length
    f.write(struct.pack("<h", 0))
    # disk number where file starts
    f.write(struct.pack("<h", 0))
    # internal file attributes
    f.write(struct.pack("<h", 0))
    # external file attributes
    f.write(struct.pack("<i", 0))
    # offset of local file header
    f.write(struct.pack("<i", meta["local_header_start"]))
    # file name
    f.write(meta["path"].encode('utf-8'))
    # extra field
    # file comment

central_directory_size = f.tell() - central_directory_start

# end of central directory
# magic header
f.write(b'\x50\x4b\x05\x06')
# number of this disk
f.write(struct.pack('<H', random.randint(0x1000, 0x8000)))
# disk where central directory starts
f.write(struct.pack('<H', random.randint(0x9000, 0xFFFF)))
# number of central director records on this disk
f.write(rand_short())
# total number of central director records
f.write(rand_short())
# size of central directory in bytes
f.write(struct.pack("<i", central_directory_size)) # cant screw with
# offset of start of central directory
f.write(struct.pack("<i", central_directory_start)) # cant screw with
# comment length
f.write(struct.pack("<i", 0)) # cant screw with
# comment

f.close()
