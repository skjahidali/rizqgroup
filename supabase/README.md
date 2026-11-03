# Enquiry email notifications

The website saves enquiries to `public.enquiries`, then calls the
`send-enquiry-email` Edge Function to email the submission to `info@rizqone.com`.
The Resend API key is used only by the Edge Function and is never placed in the
website JavaScript.

## One-time setup

1. Verify a sending domain in Resend and create an API key with permission to
   send email. The verified sender address must use that domain.
2. In the Supabase dashboard for project `vpicgenwfsaxsxnvojjj`, add these
   Edge Function secrets:
   - `RESEND_API_KEY`: the Resend API key.
   - `RESEND_FROM_EMAIL`: a verified sender, for example
     `RizqOne Website <website@your-verified-domain.com>`.
3. Install the Supabase CLI, authenticate, link this repository to the project,
   and deploy the function:

   ```text
   supabase login
   supabase link --project-ref vpicgenwfsaxsxnvojjj
   supabase functions deploy send-enquiry-email
   ```

4. Submit a test enquiry from the production site and confirm it is saved in
   Supabase and delivered to `info@rizqone.com`. The form only reports full
   success after both operations succeed.

The function accepts requests only from the production site origins and the
default local development origins `localhost:5500` and `127.0.0.1:5500`.
Submitted contact information is sent to Resend to deliver the notification.
