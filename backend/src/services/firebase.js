const admin = require('firebase-admin');
console.log("KEY START:");
console.log(process.env.FIREBASE_PRIVATE_KEY?.slice(0, 30));
console.log("KEY END");
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
    }),
    storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
  });
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };