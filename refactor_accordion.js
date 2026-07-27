import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

const replacements = [
  {
    regex: /<section>\s*<div className="flex items-center gap-3 mb-4 opacity-50 px-2 text-blue-accent">\s*<Clock size=\{12\} className="sm:w-3\.5 sm:h-3\.5" \/>\s*<span className="text-\[9px\] sm:text-\[10px\] font-black uppercase tracking-\[2px\]">Operations & Boards<\/span>\s*<\/div>/,
    replace: `<AdminAccordion title="Operations & Boards" icon={<Clock size={16} />} colorClass="text-blue-accent" defaultOpen={true}>`
  },
  {
    regex: /<section>\s*<div className="flex items-center gap-3 mb-4 opacity-50 px-2 text-gold2">\s*<Trophy size=\{12\} className="sm:w-3\.5 sm:h-3\.5" \/>\s*<span className="text-\[9px\] sm:text-\[10px\] font-black uppercase tracking-\[2px\]">Conversion Intelligence<\/span>\s*<\/div>/,
    replace: `<AdminAccordion title="Conversion Intelligence" icon={<Trophy size={16} />} colorClass="text-gold2">`
  },
  {
    regex: /<section>\s*<div className="flex items-center gap-3 mb-4 opacity-50 px-2 text-purple-400">\s*<Megaphone size=\{14\} \/>\s*<span className="text-\[10px\] font-black uppercase tracking-\[2px\]">Communication & Hub<\/span>\s*<\/div>/,
    replace: `<AdminAccordion title="Communication & Hub" icon={<Megaphone size={16} />} colorClass="text-purple-400">`
  },
  {
    regex: /<section>\s*<div className="flex items-center gap-3 mb-4 opacity-50 px-2 text-indigo-400">\s*<Users size=\{14\} \/>\s*<span className="text-\[10px\] font-black uppercase tracking-\[2px\]">Team Roster Management<\/span>\s*<\/div>/,
    replace: `<AdminAccordion title="Team Roster Management" icon={<Users size={16} />} colorClass="text-indigo-400">`
  },
  {
    regex: /<section>\s*<div className="flex items-center gap-3 mb-4 opacity-50 px-2 text-green-accent">\s*<Calendar size=\{14\} \/>\s*<span className="text-\[10px\] font-black uppercase tracking-\[2px\]">Schedules & Logs<\/span>\s*<\/div>/,
    replace: `<AdminAccordion title="Schedules & Logs" icon={<Calendar size={16} />} colorClass="text-green-accent">`
  },
  {
    regex: /<section>\s*<div className="flex items-center gap-3 mb-4 opacity-50 px-2 text-red-400">\s*<Lock size=\{14\} \/>\s*<span className="text-\[10px\] font-black uppercase tracking-\[2px\]">Security & Environment<\/span>\s*<\/div>/,
    replace: `<AdminAccordion title="Security & Environment" icon={<Lock size={16} />} colorClass="text-red-400">`
  },
  {
    regex: /<section>\s*<div className="flex items-center gap-3 mb-4 opacity-50 px-2 text-gold">\s*<Medal size=\{14\} \/>\s*<span className="text-\[10px\] font-black uppercase tracking-\[2px\]">Leaderboard & Ranking Management<\/span>\s*<\/div>/,
    replace: `<AdminAccordion title="Leaderboard & Ranking Management" icon={<Medal size={16} />} colorClass="text-gold">`
  },
  {
    regex: /<section>\s*<div className="flex items-center gap-3 mb-4 opacity-50 px-2 text-gold">\s*<Crown size=\{14\} \/>\s*<span className="text-\[10px\] font-black uppercase tracking-\[2px\]">Member Approvals & Permissions<\/span>\s*<\/div>/,
    replace: `<AdminAccordion title="Member Approvals & Permissions" icon={<Crown size={16} />} colorClass="text-gold">`
  },
  {
    regex: /<section>\s*<div className="flex items-center gap-3 mb-4 opacity-50 px-2 text-green-400">\s*<Coins size=\{14\} \/>\s*<span className="text-\[10px\] font-black uppercase tracking-\[2px\]">Fine Settings & Balance Management<\/span>\s*<\/div>/,
    replace: `<AdminAccordion title="Fine Settings & Balance Management" icon={<Coins size={16} />} colorClass="text-green-400">`
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

let inAdminPanel = false;
let lines = code.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Admin Navigation "Slots"')) {
    inAdminPanel = true;
  }
  if (inAdminPanel && lines[i].includes('</section>')) {
    lines[i] = lines[i].replace('</section>', '</AdminAccordion>');
  }
  if (inAdminPanel && lines[i].includes('</motion.div>')) {
    if (lines[i+1] && lines[i+1].includes('</AnimatePresence>')) {
      inAdminPanel = false;
    }
  }
}
code = lines.join('\n');

fs.writeFileSync('src/App.tsx', code);
console.log("Replaced opening tags:", replacedCount);
