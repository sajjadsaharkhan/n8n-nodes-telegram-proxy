#!/bin/bash

# Setup script for n8n-nodes-telegram-proxy
# Run this to initialize your package with your own details

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}n8n-nodes-telegram-proxy Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Prompt for GitHub username
read -p "$(echo -e ${YELLOW}Enter your GitHub username:${NC} )" GITHUB_USERNAME

# Prompt for npm username (if different)
read -p "$(echo -e ${YELLOW}Enter your npm username (press Enter to use GitHub username):${NC} )" NPM_USERNAME
NPM_USERNAME=${NPM_USERNAME:-$GITHUB_USERNAME}

# Prompt for your name
read -p "$(echo -e ${YELLOW}Enter your name:${NC} )" YOUR_NAME

# Prompt for email
read -p "$(echo -e ${YELLOW}Enter your email:${NC} )" YOUR_EMAIL

echo ""
echo -e "${GREEN}Updating package.json...${NC}"

# Update package.json with user details
sed -i.bak "s/@yourusername/@${NPM_USERNAME}/g" package.json
sed -i.bak "s/your.email@example.com/${YOUR_EMAIL}/g" package.json
sed -i.bak "s/Your Name/${YOUR_NAME}/g" package.json
sed -i.bak "s|your-registry.example.com|registry.npmjs.org|g" package.json
sed -i.bak "s|git+https://github.com/yourusername/n8n-nodes-telegram-proxy.git|git+https://github.com/${GITHUB_USERNAME}/n8n-nodes-telegram-proxy.git|g" package.json

echo -e "${GREEN}Updating README.md...${NC}"

# Update README.md
sed -i.bak "s/@yourusername/@${NPM_USERNAME}/g" README.md
sed -i.bak "s/yourusername/${GITHUB_USERNAME}/g" README.md

# Remove backup files
rm -f package.json.bak README.md.bak

echo ""
echo -e "${GREEN}✓ Setup complete!${NC}"
echo ""
echo "Package details:"
echo "  Name: @${NPM_USERNAME}/n8n-nodes-telegram-proxy"
echo "  Author: ${YOUR_NAME} <${YOUR_EMAIL}>"
echo "  GitHub: https://github.com/${GITHUB_USERNAME}/n8n-nodes-telegram-proxy"
echo ""
echo "Next steps:"
echo "  1. Review the changes in package.json and README.md"
echo "  2. Run: ./build-community.sh"
echo "  3. Run: npm install"
echo "  4. Run: npm run build"
echo ""
echo "Then commit and push to GitHub:"
echo "  git add ."
echo "  git commit -m 'Initial commit'"
echo "  git branch -M main"
echo "  git remote add origin https://github.com/${GITHUB_USERNAME}/n8n-nodes-telegram-proxy.git"
echo "  git push -u origin main"
echo ""
echo "After pushing to GitHub, publish to npm:"
echo "  npm publish"
echo ""
