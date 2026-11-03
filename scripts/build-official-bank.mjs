import { readFile, writeFile } from 'node:fs/promises';

const expected=[68,67,66,70,66,64,22];
const bank=[];

for(let theme=1; theme<=7; theme++){
  const text=await readFile(`official-bank/tema-${theme}.md`,'utf8');
  let current=null,num=null,options={},correct=-1,last=null;
  const push=()=>{
    if(current && ['A','B','C'].every(k=>Object.prototype.hasOwnProperty.call(options,k)) && correct>=0){
      bank.push({theme,num,question:current.replace(/\\s+/g,' ').trim(),options:['A','B','C'].map(k=>options[k].replace(/\\s+/g,' ').trim()),correct});
    }
  };
  for(const raw of text.split(/\\r?\\n/)){
    const line=raw.trim();
    let m=line.match(/^###\\s+(\\d+)\\.\\s+(.+)$/);
    if(m){push();num=Number(m[1]);current=m[2].trim();options={};correct=-1;last=null;continue;}
    m=line.match(/^-\\s+(?:\\*\\*)?([ABC])\\)\\s*(.*)$/i);
    if(m && current){
      const letter=m[1].toUpperCase();
      let value=m[2].trim();
      const isCorrect=line.includes('**') || value.includes('✅');
      value=value.replace(/\\*+/g,'').replace(/\\s*✅\\s*/g,'').trim();
      options[letter]=value;
      if(isCorrect) correct='ABC'.indexOf(letter);
      last=letter;
      continue;
    }
    if(current && last && line && !line.startsWith('#')){
      options[last]=(options[last]+' '+line).replace(/\\*+/g,'').replace(/\\s+/g,' ').trim();
    } else if(current && !last && line && !line.startsWith('#')){
      current+=' '+line;
    }
  }
  push();
  const got=bank.filter(q=>q.theme===theme).length;
  if(got!==expected[theme-1]) throw new Error(`Tema ${theme}: ${got} preguntes; esperades ${expected[theme-1]}`);
}

if(bank.length!==423) throw new Error(`Banc total ${bank.length}; esperades 423`);
await writeFile('official-bank.json',JSON.stringify(bank));
console.log(`Generated ${bank.length} questions`);
