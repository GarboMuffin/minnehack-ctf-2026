JS_CHALS = bytecode
JS_OUTS = $(addsuffix .out,$(JS_CHALS))

all: intro.out scramble.out bakers-dozen.out leaves.out $(JS_OUTS)

.PHONY: all clean mquickjs-build

clean:
	rm -fv *.out $(addsuffix _bytecode.h,$(JS_CHALS))

intro.out: intro.c
	gcc -g -O0 -Wall $^ -o $@

scramble.out: scramble.c
	gcc -O0 -Wall $^ -o $@

bakers-dozen.out: bakers-dozen.c
	gcc -O0 -Wall $^ -o $@

leaves.out: leaves.c
	gcc -O3 -Wall $^ -o $@
	strip leaves.out

MQJS_OBJS = mquickjs/mquickjs.o mquickjs/dtoa.o mquickjs/libm.o mquickjs/cutils.o

mquickjs-build:
	$(MAKE) -C mquickjs mqjs

mquickjs/mqjs $(MQJS_OBJS): mquickjs-build ;

mini-stdlib-def.h: mini-stdlib-def.c mini-stdlib-impl.h
	gcc mini-stdlib-def.c mquickjs/mquickjs_build.c -o mini-stdlib-def.out -Imquickjs
	./mini-stdlib-def.out > $@
	rm -f mini-stdlib-def.out

%_bytecode.h: %.js mquickjs/mqjs
	mquickjs/mqjs -o /dev/stdout $< | ( \
		echo '/* auto-generated - do not edit */'; \
		echo 'static const unsigned char bytecode_bin[] = {'; \
		xxd -i; \
		echo '};'; \
		echo 'static const unsigned int bytecode_bin_len = sizeof(bytecode_bin);' \
	) > $@

%.out: runner.c mini-stdlib-def.h mini-stdlib-def.c mini-stdlib-impl.h %_bytecode.h $(MQJS_OBJS)
	gcc -O0 -Wall -include $*_bytecode.h runner.c $(MQJS_OBJS) -Imquickjs -lm -o $@
	strip $@
