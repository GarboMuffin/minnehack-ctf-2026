#include <string.h>
#include <stdio.h>
#include <ctype.h>

char input[256];
char flag[256];

int main() {
    printf("What's the password?\n> ");
    fgets(input, 256, stdin);
    int len = strlen(input);
    while (isspace(input[len - 1])) {
        input[len - 1] = '\0';
        len--;
    }

    // flag{NotMuchBetter}
    flag[14] = 't';
    flag[2] = 'a';
    flag[10] = 'c';
    flag[4] = '{';
    flag[17] = 'r';
    flag[5] = 'N';
    flag[15] = 't';
    flag[6] = 'o';
    flag[18] = '}';
    flag[9] = 'u';
    flag[8] = 'M';
    flag[0] = 'f';
    flag[3] = 'g';
    flag[13] = 'e';
    flag[7] = 't';
    flag[11] = 'h';
    flag[1] = 'l';
    flag[12] = 'B';
    flag[16] = 'e';

    if (strcmp(flag, input) == 0) {
        printf("Success!\n");
    } else {
        printf("Incorrect!\n");
    }
}
