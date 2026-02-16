#include <string.h>
#include <stdio.h>
#include <ctype.h>
#include <stdlib.h>

char input[256];

struct tree;
struct tree {
    struct tree* left;
    struct tree* right;
    char key;
    char value;
};
struct tree* tree;

__attribute__((always_inline)) inline struct tree* newnode(char key, char value) {
    struct tree* tree = malloc(sizeof(struct tree));
    tree->left = NULL;
    tree->right = NULL;
    tree->key = key;
    tree->value = value;
    return tree;
}

__attribute__((always_inline)) inline void insert(char key, char value) {
    struct tree* newtree = newnode(key, value);

    if (tree == NULL) {
        tree = newtree;
        return;
    }

    struct tree* ptr = tree;
    while (1) {
        if (key < ptr->key) {
            if (ptr->left) {
                ptr = ptr->left;
            } else {
                ptr->left = newtree;
                return;
            }
        } else {
            if (ptr->right) {
                ptr = ptr->right;
            } else {
                ptr->right = newtree;
                return;
            }
        }
    }
}

__attribute__((always_inline)) inline char get(char ch) {
    struct tree* ptr = tree;
    while (1) {
        if (ch == ptr->key) {
            return ptr->value;
        } else if (ch < ptr->key) {
            ptr = ptr->left;
        } else {
            ptr = ptr->right;
        }
    }
}

int check() {    
    int len = strlen(input);
    if (len != 26) return 0;
    if (input[0] != 'f') return 0;
    if (input[1] != 'l') return 0;
    if (input[2] != 'a') return 0;
    if (input[3] != 'g') return 0;
    if (input[4] != '{') return 0;
    if (input[len - 1] != '}') return 0;

    insert('a', 'Y');
    insert('b', 'X');
    insert('c', 'i');
    insert('d', 'h');
    insert('e', 'V');
    insert('f', 'N');
    insert('g', 's');
    insert('h', 'E');
    insert('i', 'J');
    insert('j', 'Z');
    insert('k', 'w');
    insert('l', 'S');
    insert('m', 'p');
    insert('n', 'D');
    insert('o', 'n');
    insert('p', 'a');
    insert('q', 'z');
    insert('r', 'd');
    insert('s', 'I');
    insert('t', 'u');
    insert('u', 'e');
    insert('v', 'k');
    insert('w', 'M');
    insert('x', 'g');
    insert('y', 'F');
    insert('z', 'C');
    insert('A', 'j');
    insert('B', 'T');
    insert('C', 'y');
    insert('D', 'f');
    insert('E', 'b');
    insert('F', 't');
    insert('G', 'A');
    insert('H', 'v');
    insert('I', 'U');
    insert('J', 'x');
    insert('K', 'G');
    insert('L', 'q');
    insert('M', 'l');
    insert('N', 'L');
    insert('O', 'm');
    insert('P', 'B');
    insert('Q', 'W');
    insert('R', 'c');
    insert('S', 'H');
    insert('T', 'Q');
    insert('U', 'O');
    insert('V', 'o');
    insert('W', 'r');
    insert('X', 'K');
    insert('Y', 'R');
    insert('Z', 'P');

    char mapped[256];
    for (int i = 0; i < len - 6; i++) {
        mapped[i] = get(input[i + 5]);
    }

    // flag{UnbalancedBinaryTree}
    return (strcmp(mapped, "ODXYSYDiVhTJDYdFQdVV") == 0);
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
