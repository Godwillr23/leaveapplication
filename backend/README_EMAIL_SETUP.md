SMTP / Gmail Setup (backend)

1) Recommended: create an App Password (if using a Google account with 2-Step Verification)
- Visit: https://myaccount.google.com/security -> App passwords -> Select Mail -> generate
- Use the generated 16-char string as `SMTP_PASS`.

2) If you prefer OAuth2 (optional)
- Create OAuth credentials in Google Cloud Console, obtain Client ID/Secret and a Refresh Token.
- Populate the `EMAIL_OAUTH_*` variables in `.env` (see `.env.example`).

3) Environment variables (create `backend/.env` from `.env.example`)
 - `SMTP_HOST` (e.g. smtp.gmail.com)
 - `SMTP_PORT` (465 for SSL, 587 for STARTTLS)
 - `SMTP_SECURE` (true for 465)
 - `SMTP_USER` (your email)
 - `SMTP_PASS` (App Password or account password)
 - or set the `EMAIL_OAUTH_*` variables for OAuth2 mode

4) Restart backend after editing `.env`:
```powershell
cd backend
npm install
npm run dev
```

5) Test send:
```powershell
node -e "require('./utils/mailer').sendMail('you@domain.com','Test','Hello')"
```
