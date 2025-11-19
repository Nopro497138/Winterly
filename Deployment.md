# 🚀 Deployment Guide - Winter Cookie

Complete step-by-step guide to deploy your Winter Cookie game.

## Part 1: Discord Bot Setup

### Step 1: Create Discord Application

1. Go to https://discord.com/developers/applications
2. Click **"New Application"**
3. Give it a name (e.g., "Winter Cookie Bot")
4. Click **"Create"**

### Step 2: Configure Bot

1. In left sidebar, click **"Bot"**
2. Click **"Add Bot"** → Confirm
3. Click **"Reset Token"** → **Copy the token** (save it securely!)
4. Scroll down to **"Privileged Gateway Intents"**
5. Enable **"SERVER MEMBERS INTENT"**
6. Click **"Save Changes"**

### Step 3: Get Application ID

1. In left sidebar, click **"General Information"**
2. Copy **"APPLICATION ID"** (this is your CLIENT_ID)

### Step 4: Invite Bot to Server

1. In left sidebar, click **"OAuth2"** → **"URL Generator"**
2. Under **Scopes**, select:
   - ✅ `bot`
   - ✅ `applications.commands`
3. Under **Bot Permissions**, select:
   - ✅ `Send Messages`
   - ✅ `Use Slash Commands`
4. Copy the generated URL at the bottom
5. Open URL in browser → Select your server → **Authorize**

### Step 5: Get Server ID

1. Open Discord
2. Go to **User Settings** → **Advanced**
3. Enable **"Developer Mode"**
4. Right-click your server icon → **"Copy Server ID"**

---

## Part 2: Railway Deployment (Discord Bot)

### Step 1: Prepare Repository

Make sure your project structure looks like this:

```
winter-cookie/
├── bot/
│   ├── index.js
│   ├── package.json
│   └── .env.example
└── web/
    └── ...
```

### Step 2: Deploy to Railway

1. Go to https://railway.app/
2. Click **"Start a New Project"**
3. Click **"Deploy from GitHub repo"**
4. Authorize Railway and select your repository
5. Select **Root Directory**: `/bot`

### Step 3: Configure Environment Variables

In Railway dashboard, go to **Variables** tab and add:

```
DISCORD_TOKEN=paste_your_bot_token_here
CLIENT_ID=paste_your_application_id_here
GUILD_ID=paste_your_server_id_here
WEBHOOK_SECRET=create_random_string_here
BASE_URL=https://your-app-name.vercel.app
```

**Important**: For `WEBHOOK_SECRET`, generate a random string:
```bash
# Run this in terminal to generate a secure secret:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Deploy

1. Railway will automatically deploy
2. Check **Deployments** tab for status
3. Click **View Logs** to see if bot connected successfully
4. You should see: `🎄 Logged in as YourBotName#1234`

---

## Part 3: Vercel Deployment (Website)

### Step 1: Setup SMTP (Gmail Example)

1. Go to https://myaccount.google.com/
2. Click **Security**
3. Enable **2-Step Verification** (if not already enabled)
4. Go back to Security
5. Click **App passwords**
6. Select **Mail** and **Other (Custom name)**
7. Name it "Winter Cookie"
8. Click **Generate**
9. **Copy the 16-character password** (save it!)

### Step 2: Deploy to Vercel

1. Go to https://vercel.com/
2. Click **"Add New..."** → **"Project"**
3. Import your Git repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Step 3: Add Environment Variables

In Vercel project settings, go to **Environment Variables** and add:

```
BASE_URL=https://your-project-name.vercel.app
WEBHOOK_SECRET=same_secret_from_railway
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your_16_char_app_password
FROM_EMAIL=Winter Cookie <your-email@gmail.com>
NODE_ENV=production
```

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for deployment to complete
3. Copy your deployment URL (e.g., `https://winter-cookie-xyz.vercel.app`)

### Step 5: Update Railway BASE_URL

1. Go back to Railway dashboard
2. Update `BASE_URL` variable with your Vercel URL
3. Redeploy if necessary

---

## Part 4: Testing

### Test Discord Bot

1. Go to your Discord server
2. Type `/` to see available commands
3. You should see:
   - `/verify`
   - `/info`
   - `/stats`
   - `/leaderboard`

If commands don't appear:
- Wait 5-10 minutes (Discord can be slow)
- Kick and re-invite the bot
- Check Railway logs for errors

### Test Website Registration

1. Go to your Vercel URL
2. Click **"Sign In / Register"**
3. Enter email and password
4. Click **"Register"**
5. Check your email for verification code

### Test Full Flow

1. Register on website → Get verification code
2. In Discord: `/verify 123456` (your code)
3. Bot should confirm: "🎄 Account Successfully Linked!"
4. Refresh website → You should be logged in
5. Click Santa → Cookies should increase
6. Buy an upgrade → Stats should update
7. Check `/stats` in Discord

---

## Part 5: Troubleshooting

### Bot Issues

**Error: "DISCORD_TOKEN missing"**
- Make sure environment variable is set in Railway
- No extra spaces or quotes around the token

**Error: "Invalid Form Body guild_id"**
- `GUILD_ID` must be your server ID (long number)
- Enable Developer Mode in Discord to copy it
- Make sure `CLIENT_ID` is also set correctly

**Commands not showing**
- Wait 10-15 minutes
- Kick bot from server and re-invite
- Check Railway logs for "✅ Commands registered successfully!"

### Website Issues

**Error: "Can't resolve '../styles/Home.module.css'"**
- ✅ Fixed! New code has all styles inline
- No CSS files needed

**Email not sending**
- Double-check SMTP credentials
- Make sure 2-Step Verification is enabled (Gmail)
- Use App Password, not regular password
- Check spam folder

**"User not found" error**
- Make sure `data` folder has write permissions
- Check if `users.json` is being created
- Verify environment variables are set

### Database Issues

**Permission denied**
- On Vercel: Use `/tmp` directory for writes
- Update `db.js`:
  ```javascript
  const DB_FILE = path.join('/tmp', 'users.json');
  ```

**Data not persisting**
- On Vercel, `/tmp` is ephemeral
- Consider using:
  - Vercel Postgres
  - MongoDB Atlas
  - Railway Postgres
  - Or keep simple JSON for demo

---

## Part 6: Custom Domain (Optional)

### Vercel Custom Domain

1. Go to Vercel project → **Settings** → **Domains**
2. Add your domain (e.g., `wintercookie.com`)
3. Follow DNS setup instructions
4. Update `BASE_URL` in both Vercel and Railway

### Railway Custom Domain

1. Railway project → **Settings** → **Networking**
2. Click **"Generate Domain"**
3. Or add custom domain with your DNS provider

---

## Part 7: Monitoring

### Railway Logs

```bash
# Check real-time logs
railway logs --follow
```

### Vercel Logs

1. Go to project dashboard
2. Click **"Deployments"**
3. Click any deployment → **"View Function Logs"**

### Discord Bot Health

Create a simple health check:
- Add `/ping` command to bot
- Returns bot latency and uptime

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Discord bot created
- [ ] Bot invited to server
- [ ] SMTP credentials obtained
- [ ] All secrets generated

### Railway (Bot)
- [ ] Repository connected
- [ ] Root directory set to `/bot`
- [ ] All environment variables added
- [ ] Deployment successful
- [ ] Bot online in Discord
- [ ] Commands registered

### Vercel (Website)
- [ ] Repository connected
- [ ] Root directory set to `/web`
- [ ] All environment variables added
- [ ] Deployment successful
- [ ] Website loads correctly
- [ ] Registration works
- [ ] Email delivery works

### Integration Testing
- [ ] Register on website
- [ ] Receive verification email
- [ ] `/verify` command works
- [ ] Account linked successfully
- [ ] Game saves/loads correctly
- [ ] `/stats` command works
- [ ] `/leaderboard` shows data

---

## 🎉 Success!

If all checks pass, your Winter Cookie game is live! 

Share your website URL with friends and start playing! 🎄🍪

---

## 📞 Support

If you encounter issues:

1. Check Railway logs: `railway logs`
2. Check Vercel deployment logs
3. Verify all environment variables
4. Test each component separately
5. Check Discord bot permissions

Common issues are usually:
- Missing/incorrect environment variables
- SMTP authentication problems
- Discord permissions
- Database write permissions

Good luck and happy holidays! ❄️
