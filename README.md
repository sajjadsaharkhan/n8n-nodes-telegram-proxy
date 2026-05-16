# n8n-nodes-telegram-proxy

> Telegram nodes with HTTP proxy support for n8n

[![npm version](https://badge.fury.io/js/%40yourusername%2Fn8n-nodes-telegram-proxy.svg)](https://www.npmjs.com/package/@yourusername/n8n-nodes-telegram-proxy)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An enhanced version of the official [n8n Telegram node](https://github.com/n8n-io/n8n/tree/master/packages/nodes-base/nodes/Telegram) with HTTP/HTTPS/SOCKS proxy support.

## Features

✅ All features from the official Telegram node
✅ **HTTP/HTTPS/SOCKS proxy support**
✅ Proxy authentication (username/password)
✅ Works with all Telegram operations
✅ Compatible with n8n 1.0+

## Why This Package?

The official n8n Telegram node doesn't support proxy configuration. This fork adds proxy support while maintaining 100% compatibility with all existing Telegram features.

## Installation

### Option 1: Install from npm (Recommended)

In your n8n directory:

```bash
npm install @yourusername/n8n-nodes-telegram-proxy
```

Then restart n8n.

### Option 2: Install from Source

```bash
git clone https://github.com/yourusername/n8n-nodes-telegram-proxy.git
cd n8n-nodes-telegram-proxy
npm install
npm run build
npm link
# In your n8n directory:
npm link @yourusername/n8n-nodes-telegram-proxy
```

## Usage

### Setting Up Proxy

1. In n8n, create a new credential: **Credentials → Telegram API (with Proxy)**
2. Fill in your Telegram Bot Token from [@BotFather](https://t.me/botfather)
3. Expand the **HTTP Proxy** section
4. Configure your proxy:
   - **Host**: Proxy server hostname or IP
   - **Port**: Proxy port (default: 3128)
   - **Protocol**: HTTP, HTTPS, or SOCKS
   - **Authentication** (optional): Username and password

### Example Scenarios

#### Behind a Corporate Proxy

```
Host: proxy.company.com
Port: 8080
Protocol: HTTP
Username: your-username
Password: your-password
```

#### Using SOCKS Proxy

```
Host: 127.0.0.1
Port: 1080
Protocol: SOCKS
```

#### Using Telegram in Restricted Regions

Configure a proxy in a region where Telegram is accessible:

```
Host: your-vps-ip.com
Port: 3128
Protocol: HTTP
```

## Available Nodes

- **Telegram (with Proxy)** - Send messages, media, and interact with chats
- **Telegram Trigger (with Proxy)** - Receive updates from Telegram

All operations from the official Telegram node are supported:
- Send text messages, photos, videos, documents, audio, stickers
- Edit and delete messages
- Manage chats
- Answer callback queries
- And more...

## Kubernetes/Docker Deployment

To use this package in a Docker/Kubernetes environment, build a custom n8n image:

```dockerfile
FROM n8nio/n8n:latest

USER root
RUN npm install -g @yourusername/n8n-nodes-telegram-proxy
USER node
```

Or use the multi-stage build approach for smaller images. See [KUBERNETES.md](KUBERNETES.md) for details.

## Development

```bash
# Clone the repository
git clone https://github.com/yourusername/n8n-nodes-telegram-proxy.git
cd n8n-nodes-telegram-proxy

# Install dependencies
npm install

# Build TypeScript
npm run build

# Watch for changes
npm run dev
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Acknowledgments

- Based on the official [n8n Telegram node](https://github.com/n8n-io/n8n)
- Built for the [n8n](https://n8n.io) workflow automation platform

## Disclaimer

This is an unofficial community package. It is not affiliated with or endorsed by n8n or Telegram.

---

Made with ❤️ for the n8n community
