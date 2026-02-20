# Gastro & Stay Belgrade — Website

Premium short-term apartment rental website for 5 units in Belgrade.  
**Stack:** HTML + CSS + Vanilla JS (frontend) · Node.js + Express + Nodemailer (backend)

---

## Project Structure

```
/assets/           → Logo, icons, apartment photos (add your own images here)
/css/styles.css    → All styles (CSS variables, responsive)
/js/main.js        → Homepage logic (apartment cards, form, header)
/js/apartment.js   → Apartment detail page logic + lightbox
/data/apartments.json → Apartment data (edit prices, descriptions, amenities)
/index.html        → Main homepage
/apartment.html    → Apartment detail template (reads ?id= from URL)
/privacy.html      → Privacy policy
/terms.html        → Terms & conditions
/server/           → Node.js backend
  index.js         → Express server + /api/inquiry endpoint
  package.json     → Dependencies
  .env.example     → Environment variable template
/README.md         → This file
```

---

## Quick Start (Local Development)

### 1. Clone / unzip the project

```bash
cd gastrostay
```

### 2. Setup the backend

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env` with your SMTP credentials:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password        # Gmail: use an App Password, not your main password
OWNER_EMAIL=your-inbox@email.com   # Where inquiries are delivered
```

**Gmail App Password:** Go to Google Account → Security → 2-Step Verification → App Passwords → generate one for "Mail".

### 3. Start the server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs on **http://localhost:3000** and serves both the API and the frontend.

### 4. Test the form

Open http://localhost:3000 in your browser, fill in the inquiry form and submit.  
Check the terminal for confirmation and your inbox for the email.

---

## Adding Real Photos

1. Place apartment images in `/assets/apartments/`:
   - `a1-1.jpg`, `a1-2.jpg`, `a1-3.jpg`, `a1-4.jpg` (Apartment 1)
   - `a2-1.jpg` … `a2-4.jpg` (Apartment 2)
   - … and so on for all 5 apartments
2. Update `data/apartments.json` — `thumbnail` and `images[]` paths already match this convention.
3. The CSS automatically falls back to gradient placeholders if images are missing.

## Customising Apartment Data

Edit `/data/apartments.json` to update:
- Prices (`pricePerNight`)
- Names, descriptions
- Amenities, rules
- Guest/bed/size info

---

## Deployment

### Option A: Render (recommended — free tier available)

1. Push project to a GitHub repository
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your repo
4. Settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add environment variables in Render dashboard (copy from `.env.example`)
6. Deploy!

Render will serve both the API and static frontend from `server/index.js`.

### Option B: Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# From /server directory
cd server
fly launch        # follow prompts
fly secrets set SMTP_HOST=... SMTP_PORT=587 SMTP_USER=... SMTP_PASS=... OWNER_EMAIL=...
fly deploy
```

### Option C: VPS / any Node host

```bash
# Upload all files to server
# Install dependencies
cd server && npm install

# Set environment variables (or use .env file)
# Start with PM2 for process management:
npm install -g pm2
pm2 start index.js --name gastrostay
pm2 save
pm2 startup
```

### Option D: Serverless (e.g. Vercel)

The frontend can be served as static files from any CDN.  
The `/api/inquiry` endpoint needs to be adapted to a serverless function (e.g. `/api/inquiry.js` in a Vercel project). Contact details available on request.

---

## Notes

- `node_modules/` is not included — run `npm install` in `/server/` after cloning
- No database required — all data in `data/apartments.json`
- No client-side frameworks — pure HTML/CSS/JS for maximum performance
- Accessibility: semantic HTML, aria labels, keyboard navigation, focus rings
- SEO: meta tags, Open Graph, JSON-LD LocalBusiness schema

---

© 2025 Gastro & Stay Belgrade
