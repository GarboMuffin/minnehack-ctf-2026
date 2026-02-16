#include <string.h>
#include <stdio.h>
#include <ctype.h>

char input[256];
// flag{RotThirteenIsVerySecure}
char data[] = "*****EbgGuvegrraVfIrelFrpher*";

int check() {
    int len = strlen(input);
    if (len != 29) return 0;
    if (input[0] != 'f') return 0;
    if (input[1] != 'l') return 0;
    if (input[2] != 'a') return 0;
    if (input[3] != 'g') return 0;
    if (input[4] != '{') return 0;
    if (input[len - 1] != '}') return 0;

    for (int i = 5; i < len - 1; i++) {
        char ch = input[i];
        int is_cap = ch >= 'A' && ch <= 'Z';
        int idx = ch - (is_cap ? 'A' : 'a');
        idx = (idx + 13) % 26;
        ch = idx + (is_cap ? 'A' : 'a');
        if (ch != data[i]) {
            return 0;
        }
    }

    return 1;
}

int main() {
    printf("What's the password?\n> ");
    fgets(input, 256, stdin);
    int len = strlen(input);
    while (isspace(input[len - 1])) {
        input[len - 1] = '\0';
        len--;
    }

    if (check()) {
        printf("Success!\n");
    } else {
        printf("Incorrect!\n");
    }
}
