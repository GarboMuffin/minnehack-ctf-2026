import {app, finish} from './server.js';

import './challenges/intro.js';
import './challenges/reverse-engineering.js';
import './challenges/binary.js';
import './challenges/web.js';
import './challenges/supply-chain.js';
import './challenges/crypto.js';
import './challenges/minecraft.js';
import './challenges/scratch.js';
import './challenges/control-panel.js';
import './challenges/meta.js';

finish();

const port = process.env.PORT || 20000;
app.listen(port, (err) => {
    if (err) {
        throw err;
    }

    console.log(`Started on port ${port}`);
});
