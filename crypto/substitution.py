#!/usr/bin/env python3
import string

mapping = {
  "a": "t",
  "b": "u",
  "c": "a",
  "d": "e",
  "e": "s",
  "f": "q",
  "g": "g",
  "h": "i",
  "i": "r",
  "j": "n",
  "k": "l",
  "l": "k",
  "m": "h",
  "n": "o",
  "o": "b",
  "p": "v",
  "q": "c",
  "r": "y",
  "s": "p",
  "t": "z",
  "u": "j",
  "v": "m",
  "w": "w",
  "x": "d",
  "y": "x",
  "z": "f"
}

def encrypt(text, mapping):
    result = ""
    for char in text:
        if char.lower() in mapping:
            mapped = mapping[char.lower()]
            if char.upper() == char:
                mapped = mapped.upper()
            result += mapped
        else:
            result += char
    return result

def main():
    while True:
        user_input = input("> ")
        encrypted = encrypt(user_input, mapping)
        print(encrypted)

if __name__ == "__main__":
    main()
