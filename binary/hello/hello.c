#include <string.h>
#include <stdio.h>

char *the_flag = "flag{fbb1ca83-de6d-4d44-a3fa-99d53999bd5d}";

int main() {
    char *flag_ptr = the_flag;
    char greeting[128] = "Hello, ";
    printf("What is your name? ");
    scanf("%50s", greeting + strlen(greeting));
    strcat(greeting, "!\n");
    printf(greeting);
}
