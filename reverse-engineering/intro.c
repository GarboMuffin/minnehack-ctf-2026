#include <string.h>
#include <stdio.h>
#include <ctype.h>

char input[256];

int main() {
    printf("What's the password?\n> ");
    fgets(input, 256, stdin);
    int len = strlen(input);
    while (isspace(input[len - 1])) {
        input[len - 1] = '\0';
        len--;
    }

    if (strcmp("flag{Didnt_even_strip_debug_symbols}", input) == 0) {
        printf("Success!\n");
        return 0;
    } else {
        printf("Incorrect!\n");
        return 1;
    }
}
