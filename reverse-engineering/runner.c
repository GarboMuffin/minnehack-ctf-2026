#include <stddef.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "cutils.h"
#include "mquickjs.h"
#include "mini-stdlib-impl.h"
#include "mini-stdlib-def.h"

int main() {
    return run_bytecode(bytecode_bin, bytecode_bin_len, &js_stdlib);
}
