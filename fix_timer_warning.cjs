const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldWarning = `        // 5 minute warning trigger
        if (config.timerNotificationsActive && remainingSeconds === 300) {
          sendNotification('টাইমার শেষ হতে ৫ মিনিট বাকি!', '৫ মিনিট পর টাইমার শেষ হয়ে যাবে, সবাই দ্রুত রেজাল্ট সাবমিট করে ফেলেন।', 'all', 'system');
        }`;

const newWarning = `        // 5 minute warning trigger (Local Native Notification only, avoiding mass DB writes)
        if (config.timerNotificationsActive && remainingSeconds === 300) {
          if ('Notification' in window && Notification.permission === 'granted') {
             new Notification('টাইমার শেষ হতে ৫ মিনিট বাকি!', { body: '৫ মিনিট পর টাইমার শেষ হয়ে যাবে, সবাই দ্রুত রেজাল্ট সাবমিট করে ফেলেন।' });
          }
        }`;

if (content.includes(oldWarning)) {
  content = content.replace(oldWarning, newWarning);
  fs.writeFileSync('src/App.tsx', content);
  console.log('Fixed timer warning');
} else {
  console.log('Could not find oldWarning block.');
}
