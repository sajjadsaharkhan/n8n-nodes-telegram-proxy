#!/bin/bash

set -e

N8N_SOURCE="/Users/sajjad/Projects/Personal/GitHub/n8n"
SOURCE_DIR="$N8N_SOURCE/packages/nodes-base"
DEST_DIR="/Users/sajjad/n8n-nodes-telegram/src"

echo "Building n8n-nodes-telegram-proxy community package..."
echo ""

# Clean and create destination directories
echo "Preparing directories..."
rm -rf "$DEST_DIR"
mkdir -p "$DEST_DIR/nodes/TelegramProxy/util"
mkdir -p "$DEST_DIR/nodes/TelegramProxy/credentials"

# Copy and rename credential file
echo "Copying credential type..."
sed 's/telegramApi/telegramApiProxy/g; s/Telegram API/Telegram API (with Proxy)/g' \
    "$SOURCE_DIR/credentials/TelegramApi.credentials.ts" > \
    "$DEST_DIR/nodes/TelegramProxy/credentials/TelegramApiProxy.credentials.ts"

# Copy GenericFunctions and update credential references
echo "Copying GenericFunctions..."
sed 's/telegramApi/telegramApiProxy/g' \
    "$SOURCE_DIR/nodes/Telegram/GenericFunctions.ts" > \
    "$DEST_DIR/nodes/TelegramProxy/GenericFunctions.ts"

# Copy IEvent interface
echo "Copying IEvent interface..."
cp "$SOURCE_DIR/nodes/Telegram/IEvent.ts" \
   "$DEST_DIR/nodes/TelegramProxy/IEvent.ts"

# Copy triggerUtils and update credential references
echo "Copying triggerUtils..."
sed 's/telegramApi/telegramApiProxy/g' \
    "$SOURCE_DIR/nodes/Telegram/util/triggerUtils.ts" > \
    "$DEST_DIR/nodes/TelegramProxy/util/triggerUtils.ts"

# Copy and rename main Telegram node
echo "Copying Telegram node..."
sed 's/class Telegram/class TelegramProxy/g; s/name = '\''telegram'\''/name = '\''telegramProxy'\''/g; s/displayName: '\''Telegram'\''/displayName: '\''Telegram (with Proxy)'\''/g; s/telegramApi/telegramApiProxy/g; s/credential '\''telegramApi'\''/credential '\''telegramApiProxy'\''/g' \
    "$SOURCE_DIR/nodes/Telegram/Telegram.node.ts" > \
    "$DEST_DIR/nodes/TelegramProxy/TelegramProxy.node.ts"

# Copy and rename TelegramTrigger node
echo "Copying TelegramTrigger node..."
sed 's/class TelegramTrigger/class TelegramProxyTrigger/g; s/name = '\''telegramTrigger'\''/name = '\''telegramProxyTrigger'\''/g; s/Telegram Trigger/Telegram Trigger (with Proxy)/g; s/telegramApi/telegramApiProxy/g; s/credential '\''telegramApi'\''/credential '\''telegramApiProxy'\''/g' \
    "$SOURCE_DIR/nodes/Telegram/TelegramTrigger.node.ts" > \
    "$DEST_DIR/nodes/TelegramProxy/TelegramProxyTrigger.node.ts"

# Copy icon
echo "Copying icon..."
cp "$SOURCE_DIR/nodes/Telegram/telegram.svg" \
   "$DEST_DIR/nodes/TelegramProxy/telegram.svg"

# Create index.ts
echo "Creating index.ts..."
cat > "$DEST_DIR/index.ts" << 'EOF'
import { TelegramApiProxy } from './nodes/TelegramProxy/credentials/TelegramApiProxy.credentials';
import { TelegramProxy } from './nodes/TelegramProxy/TelegramProxy.node';
import { TelegramProxyTrigger } from './nodes/TelegramProxy/TelegramProxyTrigger.node';

export const credentials = [TelegramApiProxy];
export const nodes = [TelegramProxy, TelegramProxyTrigger];
EOF

echo ""
echo "✓ Build complete!"
echo ""
echo "Next steps:"
echo "  1. Update package.json with your GitHub username and details"
echo "  2. Run: npm install"
echo "  3. Run: npm run build"
echo "  4. Test locally: npm link"
echo "  5. Publish: npm publish"
