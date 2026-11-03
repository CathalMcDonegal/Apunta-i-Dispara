import { readFile, writeFile } from 'node:fs/promises';
const files=[];
for(let theme=1; theme<=7; theme++) files.push({theme,text:await readFile(`official-bank/tema-${theme}.md`,'utf8')});
await writeFile('official-bank.json',JSON.stringify(files));
console.log('Embedded 7 published questionnaire snapshots');
