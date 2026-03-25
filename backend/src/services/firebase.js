const admin = require('firebase-admin');
const serviceAccount = require('../../firebase-key.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: serviceAccount.project_id + '.appspot.com'
  });
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };