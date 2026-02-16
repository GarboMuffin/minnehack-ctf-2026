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
        printf("%.32s\n", &grid.pixels[y * 32]);
    }
    if (grid.mode & IS_ADMIN) {
        printf("flag{e80525fc-9d60-4d11-a34b-73b386753ea3}\n");
    }
}

int main() {
    grid.mode = 0;
    for (int i = 0; i < 1024; i++) {
        grid.pixels[i] = '?';
    }

    while (1) {
        printf("Current image:\n");
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
            printf("Error: out of bounds!\n");
        }
    }
}
