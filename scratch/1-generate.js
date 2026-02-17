import fs from 'node:fs';
import path from 'node:path';
import JSZip from '@turbowarp/jszip';

const zip = await JSZip.loadAsync(fs.readFileSync('1-original.sb3'));
const json = JSON.parse(await zip.file('project.json').async('text'));

const blocks = json.targets[1].blocks;
for (const [blockId, block] of Object.entries(blocks)) {
    // go to the top level
    let topLevelBlock = block;
    while (topLevelBlock.parent) {
        topLevelBlock = blocks[topLevelBlock.parent];
    }

    if (topLevelBlock.opcode !== 'event_whenflagclicked' && topLevelBlock.opcode !== 'event_whenbroadcastreceived') {
        block.shadow = true;
    }
}

zip.file('project.json', JSON.stringify(json));
const newZip = await zip.generateAsync({
    type: 'nodebuffer'
});
fs.writeFileSync(path.join(import.meta.dirname, '../portal/src/challenge-static/scratch-ghosts-1/puzzle.sb3'), newZip);
