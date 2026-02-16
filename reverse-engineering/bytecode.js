print("> ");
var txt = input();

function check() {
    if (txt.length !== 42) return false;
    return (
        txt[0] === 'f' &&
        txt[1] === 'l' &&
        txt[2] === 'a' &&
        txt[3] === 'g' &&
        txt[4] === '{' &&
        txt[5] === 'd' &&
        txt[6] === 'a' &&
        txt[7] === 'c' &&
        txt[8] === '4' &&
        txt[9] === '0' &&
        txt[10] === 'c' &&
        txt[11] === 'b' &&
        txt[12] === '6' &&
        txt[13] === '-' &&
        txt[14] === '6' &&
        txt[15] === '2' &&
        txt[16] === '3' &&
        txt[17] === '3' &&
        txt[18] === '-' &&
        txt[19] === '4' &&
        txt[20] === '8' &&
        txt[21] === '0' &&
        txt[22] === '0' &&
        txt[23] === '-' &&
        txt[24] === 'a' &&
        txt[25] === '2' &&
        txt[26] === '5' &&
        txt[27] === '1' &&
        txt[28] === '-' &&
        txt[29] === 'a' &&
        txt[30] === 'c' &&
        txt[31] === '8' &&
        txt[32] === 'c' &&
        txt[33] === '9' &&
        txt[34] === '1' &&
        txt[35] === 'f' &&
        txt[36] === 'd' &&
        txt[37] === '7' &&
        txt[38] === 'b' &&
        txt[39] === '5' &&
        txt[40] === 'f' &&
        txt[41] === '}'
    );
}

if (check()) {
    print("Success!\n");
} else {
    print("Incorrect!\n");
}
