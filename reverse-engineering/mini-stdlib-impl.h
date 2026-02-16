static JSValue js_print(JSContext *ctx, JSValue *this_val, int argc, JSValue *argv)
{
    int i;
    JSValue v;
    for(i = 0; i < argc; i++) {
        if (i != 0)
            putchar(' ');
        v = argv[i];
        if (JS_IsString(ctx, v)) {
            JSCStringBuf buf;
            const char *str;
            size_t len;
            str = JS_ToCStringLen(ctx, &len, v, &buf);
            fwrite(str, 1, len, stdout);
        } else {
            JS_PrintValueF(ctx, argv[i], JS_DUMP_LONG);
        }
    }
    return JS_UNDEFINED;
}

static JSValue js_input(JSContext *ctx, JSValue *this_val, int argc, JSValue *argv)
{
    char buf[4096];
    if (fgets(buf, sizeof(buf), stdin) == NULL)
        return JS_NewString(ctx, "");
    /* strip trailing newline */
    size_t len = strlen(buf);
    if (len > 0 && buf[len - 1] == '\n')
        buf[--len] = '\0';
    return JS_NewStringLen(ctx, buf, len);
}

static int run_bytecode(const unsigned char *data, unsigned int len,
                        const JSSTDLibraryDef *stdlib)
{
    uint8_t mem_buf[32768];
    JSContext *ctx;
    uint8_t *bc_buf;

    ctx = JS_NewContext(mem_buf, sizeof(mem_buf), stdlib);

    bc_buf = malloc(len);
    memcpy(bc_buf, data, len);

    if (JS_RelocateBytecode(ctx, bc_buf, len)) {
        JS_FreeContext(ctx);
        return 1;
    }

    JSValue loaded = JS_LoadBytecode(ctx, bc_buf);
    JSValue returned = JS_Run(ctx, loaded);
    int ret = JS_IsException(returned) ? 1 : 0;

    JS_FreeContext(ctx);
    return ret;
}
