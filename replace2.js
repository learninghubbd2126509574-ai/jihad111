import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const replacements = [
  {
    regex: /<section>\s*<div className="flex items-center gap-3 mb-4 opacity-50 px-2 text-red-400">\s*<Shield size=\{14\} \/>\s*<span className="text-\[10px\] font-black uppercase tracking-\[2px\]">Security & Environment<\/span>\s*<\/div>/,
    replace: `<AdminAccordion title="Security & Environment" icon={<Shield size={16} />} colorClass="text-red-400">`
  },
  {
    regex: /<section>\s*<div className="flex items-center gap-3 mb-4 opacity-50 px-2 text-gold">\s*<Crown size=\{14\} \/>\s*<span className="text-\[10px\] font-black uppercase tracking-\[2px\]">Leaderboard & Ranking Management<\/span>\s*<\/div>/,
    replace: `<AdminAccordion title="Leaderboard & Ranking Management" icon={<Crown size={16} />} colorClass="text-gold">`
  },
  {
    regex: /<section>\s*<div className="flex items-center gap-3 mb-4 opacity-50 px-2 text-gold">\s*<Users size=\{14\} \/>\s*<span className="text-\[10px\] font-black uppercase tracking-\[2px\]">Member Approvals & Permissions<\/span>\s*<\/div>/,
    replace: `<AdminAccordion title="Member Approvals & Permissions" icon={<Users size={16} />} colorClass="text-gold">`
  }
];

let replacedCount = 0;
replacements.forEach(r => {
  if (code.match(r.regex)) {
    code = code.replace(r.regex, r.replace);
    replacedCount++;
  } else {
    console.log("Could not find match for:", r.replace);
  }
});
fs.writeFileSync('src/App.tsx', code);
console.log("Replaced:", replacedCount);
