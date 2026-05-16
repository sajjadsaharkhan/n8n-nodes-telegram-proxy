# Quick Start Guide

## Step 1: Initialize the Package

Run the setup script to personalize your package:

```bash
cd /Users/sajjad/n8n-nodes-telegram
./setup.sh
```

This will prompt you for:
- GitHub username
- npm username (or use the same as GitHub)
- Your name
- Your email

## Step 2: Build the Source Code

This copies the modified Telegram node files from your n8n source:

```bash
./build-community.sh
```

## Step 3: Install Dependencies and Build

```bash
npm install
npm run build
```

## Step 4: Test Locally (Optional)

```bash
# Create a symlink to test in your local n8n
cd /path/to/your/n8n/source
npm link ../n8n-nodes-telegram
```

## Step 5: Push to GitHub

```bash
git add .
git commit -m "Initial commit: Telegram nodes with proxy support"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/n8n-nodes-telegram-proxy.git
git push -u origin main
```

## Step 6: Publish to npm

```bash
# First time only - login to npm
npm login

# Publish the package
npm publish --access public
```

## Package Structure

```
n8n-nodes-telegram-proxy/
├── src/
│   ├── nodes/
│   │   └── TelegramProxy/
│   │       ├── TelegramProxy.node.ts          # Main action node
│   │       ├── TelegramProxyTrigger.node.ts   # Trigger node
│   │       ├── GenericFunctions.ts            # API request with proxy
│   │       ├── IEvent.ts                      # Event interfaces
│   │       ├── util/
│   │       │   └── triggerUtils.ts            # Trigger utilities
│   │       ├── credentials/
│   │       │   └── TelegramApiProxy.credentials.ts
│   │       └── telegram.svg                   # Icon
│   └── index.ts                                # Package exports
├── package.json
├── tsconfig.json
├── README.md
├── LICENSE
├── setup.sh            # Run this first!
├── build-community.sh  # Builds source code
└── .gitignore
```

## Naming Convention

The package uses these unique names to avoid conflicts with the official n8n Telegram node:

| Component | Official Name | This Package |
|-----------|---------------|--------------|
| Credential | `telegramApi` | `telegramApiProxy` |
| Action Node | `telegram` | `telegramProxy` |
| Trigger Node | `telegramTrigger` | `telegramProxyTrigger` |
| Display Name | "Telegram" | "Telegram (with Proxy)" |

This allows both packages to coexist in n8n.

## Usage After Installation

Once installed, users will see two Telegram nodes in n8n:

1. **Telegram** - Official node (no proxy support)
2. **Telegram (with Proxy)** - This community node (with proxy support)

Users can choose which one to use based on their needs.
