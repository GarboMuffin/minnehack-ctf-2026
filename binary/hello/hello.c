#include <string.h>
#include <stdio.h>

char *the_flag = "flag{e80525fc-9d60-4d11-a34b-73b386753ea3}";

int main() {
    char *flag_ptr = the_flag;
    char greeting[128] = "Hello, ";
    printf("What is your name? ");
    scanf("%50s", greeting + strlen(greeting));
    strcat(greeting, "!\n");
    printf(greeting);
}
