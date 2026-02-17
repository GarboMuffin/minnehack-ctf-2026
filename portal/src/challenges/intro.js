import { Category, staticFlag } from "../challenges.js";
import { highlight, HL_STYLES, ssh } from "./shared.js";

const c = new Category({
    name: 'Free Points',
    description: ``
});

c.add({
    id: 'intro-ssh',
    name: 'Make sure your SSH works',
    description: () => `
        ${HL_STYLES}
        <p>Several parts of this CTF will require SSH'ing into our server to do something. Let's make sure your SSH works before you try a real challenge.</p>
        <p>Open your computer's terminal app, and then copy and paste this command in (without the dollar sign). Any terminal or operating system works.</p>
        ${ssh('tVDZNI7N4apIuFYAmELo2ynX')}
        <p>The first time you connect, you'll see a warning like:</p>
        ${highlight(`
        The authenticity of host '[128.101.131.184]:80 ([128.101.131.184]:80)' can't be established.
        ED25519 key fingerprint is: SHA256:3AertfeRbiPXfdRSDnzwCIcwQsgQBr4tgH88lVm7K78
        This key is not known by any other names.
        Are you sure you want to continue connecting (yes/no/[fingerprint])? `, 'txt')}
        <p><b>Type "yes" and press enter.</b> Now you should get a prompt like:</p>
        <pre>root@f47b78561a71:/app#</pre>
        <p>If so, you now have access to a temporary Linux shell running on our server (inside a sandbox, of course). You can find the flag in the file <code>/flag</code>. Explore a bit to read it.</p>
        ${highlight(`
        root@f47b78561a71:/app# cd /
        root@f47b78561a71:/# ls
        app  bin  boot  dev  etc  flag  home  lib  lib64  media
        mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var
        root@f47b78561a71:/# cat flag
        flag{...}
        root@f47b78561a71:/#`, 'txt')}
        <p>Paste the flag you found into the box below:</p>
        `,
    value: 10,
    check: staticFlag('flag{8ca5c172-9734-4e8d-ab0d-8ca4f16b7297}')
});
