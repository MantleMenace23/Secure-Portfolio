# Sneaky Portfolio

A dark-mode "About Me" portfolio with a hidden admin console and applications view.

## Configuration
- Set `ADMIN_CODE`, `GITHUB_REPO`, `GITHUB_BRANCH`, and `PORT` in `.env`.

## Local Run
```bash
npm install
cp .env.example .env
# edit .env with your settings
npm start
```

## Deploy to Render
1. Push this project to GitHub.
2. Create a new **Web Service** on [Render](https://render.com/).
3. Connect your repo, select **Node.js**, and set build/start commands:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add environment variables in the Render dashboard:
   - `ADMIN_CODE` (your secret)
   - `GITHUB_REPO` (like `yourname/yourrepo`)
   - `GITHUB_BRANCH` (usually `main`)
   - `PORT` (Render provides one automatically)
5. Deploy!

Visit your site — admin button unlocks the Applications page, which fetches `.html` files from your GitHub repo root.
