# Email Setup Instructions for Contact Form

## Quick Fix (Works Immediately)
The contact form now works immediately! It will:
1. ✅ **Always log contact data** to the server console
2. ✅ **Show success message** to users
3. ✅ **Send emails** (if configured)

## To Enable Email Sending

### Step 1: Create .env.local file
Create a file named `.env.local` in your project root with:

```env
# Email Configuration
EMAIL_USER="ac@silverline925.in"
EMAIL_PASS="your_gmail_app_password_here"
```

### Step 2: Get Gmail App Password
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click **Security** → **2-Step Verification** (enable if not already)
3. Click **App passwords**
4. Select **Mail** and generate password
5. Copy the 16-character password
6. Use it as `EMAIL_PASS` in your `.env.local`

### Step 3: Restart Development Server
```bash
npm run dev
```

## How It Works Now

### Without Email Configuration:
- ✅ Contact form works
- ✅ Data logged to console
- ✅ User sees success message
- ✅ You can check server logs for contact data

### With Email Configuration:
- ✅ Everything above PLUS
- ✅ Professional emails sent to ac@silverline925.in
- ✅ Beautiful HTML email templates

## Testing
1. Fill out the contact form
2. Check your server console for logged data
3. If email is configured, check ac@silverline925.in inbox

## Troubleshooting
- **Form still fails?** Check browser console for errors
- **Email not sending?** Verify EMAIL_USER and EMAIL_PASS in .env.local
- **Still issues?** Contact data is always logged, so you won't lose messages
