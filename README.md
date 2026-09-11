# Hummm... I Have a Question for You

A bilingual date-invitation app built with Next.js, Supabase, and Resend.

## How it works

1. The creator enters their name, their date's name, email address, and an optional note.
2. A six-digit email code verifies the creator's address.
3. The app creates a public invitation link plus a private results link.
4. The recipient completes the playful date questionnaire once.
5. Supabase stores the answer and Resend emails the final report to the creator.

## Edit locally

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open `http://localhost:3000`.

The creator page is in `app/page.tsx`; the recipient experience is in `components/date-invitation.tsx`.

## Environment variables

Add these to Vercel for Production, Preview, and Development:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=your-server-only-secret-key
RESEND_API_KEY=re_...
EMAIL_FROM=Date Invitation <hello@notify.herman99.click>
APP_URL=https://herman99.click
```

Never expose `SUPABASE_SECRET_KEY` or `RESEND_API_KEY` with a `NEXT_PUBLIC_` prefix.

## Deploy with Vercel

1. Upload this folder to a new GitHub repository.
2. In Vercel, choose **Add New → Project**.
3. Import the GitHub repository.
4. Keep the detected framework as **Next.js** and click **Deploy**.

The database requires the `email_verifications`, `invitations`, and `responses` tables created in Supabase before using the invitation flow.
