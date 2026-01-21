require('dotenv').config();
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

let transporter = null;

async function createOAuth2Transport() {
  const clientId = process.env.EMAIL_OAUTH_CLIENT_ID;
  const clientSecret = process.env.EMAIL_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.EMAIL_OAUTH_REFRESH_TOKEN;
  const user = process.env.EMAIL_USER;
  if (!clientId || !clientSecret || !refreshToken || !user) return null;

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const getAccessToken = async () => {
    const res = await oauth2Client.getAccessToken();
    return (res && res.token) ? res.token : res;
  };

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user,
      clientId,
      clientSecret,
      refreshToken,
      accessToken: getAccessToken(),
    },
  });
}

function createSmtpTransport() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: !!(process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465'),
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
  }
  return null;
}

// initialize transporter: prefer OAuth2 when configured
(async () => {
  try {
    transporter = await createOAuth2Transport();
    if (!transporter) transporter = createSmtpTransport();
  } catch (err) {
    console.error('Error creating mail transporter', err);
    transporter = createSmtpTransport();
  }
})();

exports.sendMail = async (to, subject, text) => {
  // If transporter not initialized yet, try creating a synchronous SMTP transport
  if (!transporter) {
    transporter = createSmtpTransport();
    if (!transporter) {
      console.log(`Mailer not configured. Would send to ${to}: ${subject} - ${text}`);
      return;
    }
  }

  try {
    const from = process.env.EMAIL_USER || process.env.SMTP_USER;
    await transporter.sendMail({ from, to, subject, text });
  } catch (err) {
    console.error('Failed to send email', err);
  }
};
