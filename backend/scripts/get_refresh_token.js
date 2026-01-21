const { google } = require('googleapis');
const readline = require('readline');

const CLIENT_ID = process.env.EMAIL_OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.EMAIL_OAUTH_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Please set EMAIL_OAUTH_CLIENT_ID and EMAIL_OAUTH_CLIENT_SECRET in env.');
  process.exit(1);
}

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  'urn:ietf:wg:oauth:2.0:oob'
);

const scopes = ['https://www.googleapis.com/auth/gmail.send'];

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: scopes,
});

console.log('1) Visit this URL in your browser:\n');
console.log(authUrl + '\n');
console.log('2) Authorize the app and copy the code shown.');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question('\nEnter the authorization code here: ', async (code) => {
  try {
    const { tokens } = await oAuth2Client.getToken(code.trim());
    console.log('\nSuccess. Save these values to your .env:');
    console.log('EMAIL_OAUTH_REFRESH_TOKEN=' + (tokens.refresh_token || '')); // may be undefined if not returned
    console.log('\nFull token object (keep secret):\n', tokens);
  } catch (err) {
    console.error('Error retrieving tokens', err);
  } finally {
    rl.close();
  }
});
