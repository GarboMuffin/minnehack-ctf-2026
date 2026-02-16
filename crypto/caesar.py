shift = int(input('shift> '))
plain = input('plaintext> ')
cipher = ''

for ch in plain:
    if ch.lower() in 'abcdefghijklmnopqrstuvwxyz':
        shifted = (ord(ch.lower()) - ord('a') + shift) % 26
        cipher += chr(ord('a') + shifted) if ch == ch.lower() else chr(ord('A') + shifted)
    else:
        cipher += ch

print(cipher)
