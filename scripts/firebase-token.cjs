// Prints an OAuth access token for jaisalmervisitin@gmail.com from the Firebase CLI login (firebase login).
// Used for production admin tasks: FIREBASE_ACCESS_TOKEN=$(node scripts/firebase-token.cjs) node scripts/seed.mjs --project visitjaisalmer-e3085 …
const FT=require('child_process').execSync('npm root -g').toString().trim()+'/firebase-tools';
const auth=require(FT+'/lib/auth.js');
(async()=>{const a=auth.getAllAccounts().find(a=>a.user&&a.user.email==='jaisalmervisitin@gmail.com');
process.stdout.write((await auth.getAccessToken(a.tokens.refresh_token,[])).access_token);})();
