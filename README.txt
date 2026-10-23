# RIZQ ONE website refresh

A responsive, human-first homepage with separate HTML, CSS and JavaScript files.

## Files
- `index.html` — page structure, SEO metadata and Organization structured data
- `styles.css` — responsive design, layouts, colors, motion and accessibility styles
- `script.js` — mobile navigation, scroll reveals, service preselection and enquiry handoff

## Install / publish
1. Upload all three files into the same website directory.
2. Use `index.html` as the homepage (often the public root, `public_html`, or the deployment's static root).
3. Keep the stylesheet and script filenames unchanged, or update their paths in `index.html`.
4. In `script.js`, set `WHATSAPP_NUMBER` to your verified business WhatsApp number in international digits-only format. Example format: `919876543210` (example only; replace it).
5. Check that `https://www.rizqone.com/` is your preferred canonical domain and that the Organization details accurately describe your business.

## Important automation note
The contact form currently prepares the enquiry and opens WhatsApp only after `WHATSAPP_NUMBER` is configured. Without a number, it attempts to copy the message. It does not store leads or send messages automatically from a server.

For production lead automation (database/CRM, email notifications, consent records, scheduled follow-ups, analytics), connect a backend or a trusted form/automation provider and configure credentials server-side. Never put private API keys in `script.js`.

## Before going live
- Test mobile and desktop layouts.
- Test all navigation anchors and the contact form.
- Add your real social-sharing image, favicon and verified contact details if needed.
- Confirm any business registration claims and all service descriptions.
- Use a privacy notice and consent checkbox if your chosen lead-processing workflow requires it.
