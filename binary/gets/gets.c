#include <stdio.h>

typedef struct {
    char buf[256];
    int print_flag;
} vars_t;

int main() {
    vars_t v = {0};
    printf("> ");
    gets(v.buf);
    if (v.print_flag != 0) {
        printf("flag{131cdc95-0314-4d81-9f84-de432848c109}\n");
    }
}
