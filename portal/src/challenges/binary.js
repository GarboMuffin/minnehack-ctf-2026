import { Category, staticFlag } from "../challenges.js";
import { highlight, HL_STYLES, ssh } from "./shared.js";

const c = new Category({
    name: 'Binary Exploitation',
    description: ``
});

c.add({
    id: 'bin-gets',
    name: 'Gets',
    description: () => `
        ${HL_STYLES}

        <p>This category, we'll give you the source code for a Linux program written in C or another language. Your goal is to find a bug that allows you to trick it into printing the flag. Compile and run it on your own computer to develop an attack.</p>

        ${highlight(`
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
                printf("flag{...}\\n");
            }
        }
        `, 'c')}

        <p>To get the real flag, run the command below to connect to our server and perform your attack. We compiled with <code>gcc -ansi -O0</code> on Ubuntu 24.04.</p>
        ${ssh('zR37URyJ3mJ5K7vfeOnDIJ5A')}
        `,
    value: 50,
    check: staticFlag('flag{131cdc95-0314-4d81-9f84-de432848c109}')
});

c.add({
    id: 'bin-grid',
    name: 'Grid',
    description: () => `
        ${HL_STYLES}

        ${highlight(`
        #include <string.h>
        #include <stdio.h>

        #define IS_ADMIN (1 << 6)

        typedef struct {
            int mode;
            char pixels[1024];
        } grid_t;

        grid_t grid;

        void print_grid() {
            for (int y = 0; y < 16; y++) {
                printf("%.32s\\n", &grid.pixels[y * 32]);
            }
            if (grid.mode & IS_ADMIN) {
                printf("flag{...}\\n");
            }
        }

        int main() {
            grid.mode = 0;
            for (int i = 0; i < 1024; i++) {
                grid.pixels[i] = '?';
            }

            while (1) {
                printf("Current image:\\n");
                print_grid();

                int x;
                int y;
                char c;
                printf("X coordinate of pixel to change: ");
                scanf("%d", &x);
                printf("Y coordinate of pixel to change: ");
                scanf("%d", &y);
                printf("What character to put there: ");
                scanf(" %c", &c);

                if (x >= 0 && y >= 0) {
                    grid.pixels[y * 32 + x] = c;
                } else {
                    printf("Error: out of bounds!\\n");
                }
            }
        }
        `, 'c')}

        <p>To get the real flag, run the command below to connect to our server and perform your attack. We compiled with <code>gcc -O2</code> on Ubuntu 24.04.</p>
        ${ssh('fiymDAzBJ5GjiouRB4AK0Rz1')}
        `,
    value: 50,
    check: staticFlag('flag{e80525fc-9d60-4d11-a34b-73b386753ea3}')
});

c.add({
    id: 'bin-hello',
    name: 'Hello',
    description: () => `
        ${HL_STYLES}

        ${highlight(`
        #include <string.h>
        #include <stdio.h>

        char *the_flag = "flag{...}";

        int main() {
            char *flag_ptr = the_flag;
            char greeting[128] = "Hello, ";
            printf("What is your name? ");
            scanf("%50s", greeting + strlen(greeting));
            strcat(greeting, "!\\n");
            printf(greeting);
        }
        `, 'c')}

        <p>To get the real flag, run the command below to connect to our server and perform your attack. We compiled with <code>gcc -O0</code> on Ubuntu 24.04.</p>
        ${ssh('N4onoYe1R584oDuGHN7zPo4x')}
        `,
    value: 50,
    check: staticFlag('flag{fbb1ca83-de6d-4d44-a3fa-99d53999bd5d}')
});
