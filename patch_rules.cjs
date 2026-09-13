const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');

const notifRules = `
    function isValidNotification(data) {
      return data.keys().hasAll(['title', 'body', 'recipient', 'sender', 'createdAt']) &&
             data.title is string && data.body is string;
    }

    match /notifications/{id} {
      allow read: if true;
      allow create: if true; // allow system or admin
      allow update: if true; // allow readBy updates
      allow delete: if isAdmin();
    }
`;

rules = rules.replace("match /userBalances/{whatsapp} {", notifRules + "\n    match /userBalances/{whatsapp} {");

fs.writeFileSync('firestore.rules', rules);
console.log('firestore.rules patched');
