import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');
let lines = code.split('\n');
lines[7716] = lines[7716].replace('</AdminAccordion>', '</section>');
lines[7779] = lines[7779].replace('</AdminAccordion>', '</section>');
fs.writeFileSync('src/App.tsx', lines.join('\n'));
