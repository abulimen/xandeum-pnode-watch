# Telegram & Discord Bot Setup Guide

Complete documentation for setting up and deploying the Xandeum pNode Watch bots.

## Overview

The platform includes bots for both Telegram and Discord that provide real-time network monitoring directly in your chat applications.

### Available Commands

| Command | Description |
|---------|-------------|
| `/help` or `/start` | Show available commands |
| `/stats` | Network overview (online nodes, uptime) |
| `/price` | XAND token price and 24h change |
| `/node <id>` | Get details for a specific node |
| `/top [n]` | Top N nodes by credits (default: 5) |

---

## Telegram Bot Setup

### 1. Create Bot with BotFather

1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Send `/newbot` and follow the prompts
3. Choose a name (e.g., "Xandeum pNode Watch")
4. Choose a username (must end in `bot`, e.g., `xandeum_pnode_bot`)
5. Copy the **API Token** provided

### 2. Configure Environment

Add to your `.env.local`:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
```

### 3. Register Webhook

After deploying to production, register the webhook URL:

```bash
curl "https://your-domain.com/api/telegram/set-webhook?url=https://your-domain.com/api/telegram/webhook"
```

**Response:**
```json
{
  "success": true,
  "webhookUrl": "https://your-domain.com/api/telegram/webhook",
  "telegramResponse": { "ok": true, "result": true }
}
```

### 4. Test the Bot

1. Open your bot in Telegram
2. Send `/start` - you should receive a welcome message
3. Try `/stats` to verify API connectivity

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Bot not responding | Check webhook registration |
| "Failed to fetch" errors | Verify API endpoints are accessible |
| No response | Check server logs for errors |

---

## Discord Bot Setup

### 1. Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application** and give it a name
3. Go to **Bot** section and click **Add Bot**
4. Copy the **Bot Token**
5. Note the **Application ID** from the General Information page
6. Copy the **Public Key**

### 2. Configure Environment

Add to your `.env.local`:

```env
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_APP_ID=your_application_id
DISCORD_PUBLIC_KEY=your_public_key
```

### 3. Set Interactions Endpoint

1. In Discord Developer Portal, go to your application
2. Navigate to **General Information**
3. Set **Interactions Endpoint URL** to:
   ```
   https://your-domain.com/api/discord/interactions
   ```
4. Discord will verify the endpoint - it must be deployed first

### 4. Register Slash Commands

Run the registration script:

```bash
npx tsx scripts/register-discord-commands.ts
```

**Output:**
```
Registering Discord slash commands...
Successfully registered commands: help, stats, price, node, top
```

### 5. Invite Bot to Server

Generate an invite URL with required permissions:

```
https://discord.com/api/oauth2/authorize?client_id=YOUR_APP_ID&permissions=2048&scope=bot%20applications.commands
```

Replace `YOUR_APP_ID` with your Application ID.

**Required Permissions:**
- `Send Messages` (2048)

### 6. Test the Bot

1. In your Discord server, type `/help`
2. The bot should respond with available commands
3. Try `/stats` to verify API connectivity

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Commands not showing | Re-run registration script |
| "Unknown interaction" | Check interactions endpoint URL |
| Signature verification failed | Verify public key in env |

---

## API Endpoints

### Telegram Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/telegram/webhook` | POST | Receives Telegram updates |
| `/api/telegram/webhook` | GET | Health check |
| `/api/telegram/set-webhook` | GET | Register webhook URL |

### Discord Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/discord/interactions` | POST | Handles slash commands |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      Bot Architecture                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Telegram              Discord                               │
│     │                     │                                  │
│     ▼                     ▼                                  │
│  /api/telegram/      /api/discord/                           │
│    webhook            interactions                           │
│     │                     │                                  │
│     └─────────┬───────────┘                                  │
│               │                                              │
│               ▼                                              │
│     ┌─────────────────┐                                      │
│     │  lib/bot/       │                                      │
│     │  handlers.ts    │  ◄── Shared command logic            │
│     └─────────────────┘                                      │
│               │                                              │
│               ▼                                              │
│     ┌─────────────────┐                                      │
│     │  Internal APIs  │                                      │
│     │  /api/prpc      │                                      │
│     │  /api/credits   │                                      │
│     │  /api/token     │                                      │
│     └─────────────────┘                                      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | For Telegram | Bot token from BotFather |
| `DISCORD_BOT_TOKEN` | For Discord | Bot token from Developer Portal |
| `DISCORD_APP_ID` | For Discord | Application ID |
| `DISCORD_PUBLIC_KEY` | For Discord | Public key for signature verification |
| `NEXT_PUBLIC_BASE_URL` | Recommended | Base URL for generating links |

---

## Deployment Notes

### Vercel Deployment

Both bots work seamlessly with Vercel's serverless architecture:

1. Add environment variables in Vercel Dashboard
2. Deploy the application
3. Register Telegram webhook with production URL
4. Set Discord interactions endpoint to production URL
5. Register Discord commands

### Self-Hosted Deployment

1. Ensure HTTPS is configured (required for webhooks)
2. Set all environment variables
3. Start the application
4. Complete webhook registration steps

---

## Security Considerations

1. **Never commit tokens** - Always use environment variables
2. **Discord signature verification** - Enabled in production
3. **Webhook URL privacy** - Don't share your webhook URLs publicly
4. **Rate limiting** - Both platforms have rate limits, handlers are designed to be efficient

---

## Adding New Commands

To add a new command:

1. Add handler function to `lib/bot/handlers.ts`
2. Add case to switch in `/api/telegram/webhook/route.ts`
3. Add case to switch in `/api/discord/interactions/route.ts`
4. Add command definition to `scripts/register-discord-commands.ts`
5. Re-run Discord command registration
