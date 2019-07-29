var admin = require('firebase-admin');

var serviceAccount = require('../../react-expres-firebase-firebase-adminsdk-ingay-72341e784f.json');

let additionalClaims = {
  premiumAccount: true
};

function createCustomToken() {
  return admin.auth().createCustomToken(uid, additionalClaims);
}

var app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://react-expres-firebase.firebaseio.com/'
});

function VerifyToken(idToken) {
  if(idToken) {
    return admin.auth().verifyIdToken(idToken)
         .then(function(decodedToken){
           let uid = decodedToken.uid;
           if(uid) {
             return true;
           }
           return false;
         })
         .catch(function(error){
           res.status(400).send(error);
         });
  }
  return false;
}

module.exports = VerifyToken;
