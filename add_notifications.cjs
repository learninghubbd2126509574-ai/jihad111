const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add Import
content = content.replace("import { PhoneKeypad, PasswordKeyboard } from './components/VirtualAuthKeypad';",
  "import { PhoneKeypad, PasswordKeyboard } from './components/VirtualAuthKeypad';\nimport { NotificationManager, sendNotification } from './components/NotificationManager';");

// 2. Add timerNotificationsActive to Config
content = content.replace("autoTimerEnabled?: boolean;", "autoTimerEnabled?: boolean;\n  timerNotificationsActive?: boolean;");

// 3. Inject NotificationManager UI
content = content.replace('<div className="min-h-screen pb-20">', '<div className="min-h-screen pb-20">\n      <div className="fixed top-4 right-4 z-[2000]">\n         <NotificationManager user={currentUser} position={userData?.position} />\n      </div>');

// 4. Send Notification in startTimer
content = content.replace(
  "showMsg(`Timer started for ${Math.round(duration / 60)} minutes!`, 'success');",
  "showMsg(`Timer started for ${Math.round(duration / 60)} minutes!`, 'success');\n      if (config.timerNotificationsActive) {\n        sendNotification('টাইমার শুরু হয়েছে!', `${Math.round(duration / 60)} মিনিটের জন্য টাইমার শুরু করা হয়েছে, সবাই দ্রুত রেজাল্ট সাবমিট করুন।`, 'all', 'system');\n      }"
);

// 5. Add Admin Panel Section
const adminSection = `                      <AdminAccordion title="Push Notifications & Broadcasts" icon={<Bell size={16} />} colorClass="text-blue-400">
                         <div className="bg-surface/40 border border-white/5 p-4 sm:p-6 rounded-2xl sm:rounded-3xl relative overflow-hidden group mb-4">
                           <h4 className="text-[9px] sm:text-xs font-black text-white uppercase tracking-widest mb-4">Send Broadcast</h4>
                           <form onSubmit={async (e) => {
                             e.preventDefault();
                             const fd = new FormData(e.target);
                             const title = fd.get('title');
                             const body = fd.get('body');
                             const audience = fd.get('audience');
                             if(title && body) {
                               try {
                                 await sendNotification(title.toString(), body.toString(), audience.toString(), 'admin');
                                 alert('Broadcast sent!');
                                 e.target.reset();
                               } catch(err) {
                                 alert('Error sending broadcast');
                               }
                             }
                           }} className="space-y-3">
                             <input required name="title" placeholder="Notification Title..." className="w-full bg-bg/50 border border-white/10 rounded-xl p-3 text-sm text-white" />
                             <textarea required name="body" placeholder="Notification Message..." rows="3" className="w-full bg-bg/50 border border-white/10 rounded-xl p-3 text-sm text-white resize-y custom-scrollbar" />
                             <select name="audience" className="w-full bg-bg/50 border border-white/10 rounded-xl p-3 text-sm text-white">
                               <option value="all">Everyone (All Users)</option>
                               <option value="Counsellor">All Counsellors</option>
                               <option value="Team Leader">All Team Leaders</option>
                               <option value="STL">All STLs</option>
                             </select>
                             <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2">
                               <Send size={16} /> Send Broadcast
                             </button>
                           </form>
                         </div>
                         <div className="bg-surface/40 border border-white/5 p-4 sm:p-6 rounded-2xl sm:rounded-3xl">
                           <h4 className="text-[9px] sm:text-xs font-black text-white uppercase tracking-widest mb-4">Timer Notifications (SMS/Push)</h4>
                           <div className="flex items-center justify-between bg-bg p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/5 mb-3 sm:mb-4">
                              <span className={\`text-[9px] sm:text-[10px] font-black uppercase tracking-widest \${config.timerNotificationsActive ? 'text-green-accent' : 'text-muted-main'}\`}>
                                 {config.timerNotificationsActive ? 'Timer SMS Active' : 'Timer SMS Off'}
                              </span>
                              <div
                                onClick={async () => {
                                  try {
                                    await updateDoc(doc(db, 'config', 'global'), { timerNotificationsActive: !config.timerNotificationsActive });
                                  } catch (e) {
                                    console.error(e);
                                  }
                                }}
                                className={\`w-10 h-5 sm:w-12 sm:h-6 rounded-full relative cursor-pointer transition-all \${config.timerNotificationsActive ? 'bg-green-accent' : 'bg-muted-main2'}\`}
                              >
                                <div className={\`absolute top-0.5 sm:top-1 w-4 h-4 rounded-full bg-bg transition-all \${config.timerNotificationsActive ? 'left-5.5 sm:left-7' : 'left-0.5 sm:left-1'}\`} />
                              </div>
                           </div>
                           <p className="text-xs text-muted-main">When enabled, starting the timer sends a notification to everyone. A 5-minute warning notification is also automatically triggered.</p>
                         </div>
                      </AdminAccordion>`;

content = content.replace('<AdminAccordion title="Website Logo & Branding (লোগো পরিবর্তন)"', adminSection + '\n                      <AdminAccordion title="Website Logo & Branding (লোগো পরিবর্তন)"');

// 6. Update Timer Logic to trigger the 5-min warning
// We search for "setTimeLeft(diff > 0 ? Math.floor(diff / 1000) : 0);" 
// and add a check for diff === 5 * 60 * 1000 (which is around 300 seconds).

const updateRemainingLogic = `
        const remainingSeconds = Math.floor(diff / 1000);
        setTimeLeft(diff > 0 ? remainingSeconds : 0);
        
        // 5 minute warning trigger
        if (config.timerNotificationsActive && remainingSeconds === 300) {
          sendNotification('টাইমার শেষ হতে ৫ মিনিট বাকি!', '৫ মিনিট পর টাইমার শেষ হয়ে যাবে, সবাই দ্রুত রেজাল্ট সাবমিট করে ফেলেন।', 'all', 'system');
        }
`;
content = content.replace("setTimeLeft(diff > 0 ? Math.floor(diff / 1000) : 0);", updateRemainingLogic);

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx patched successfully');
