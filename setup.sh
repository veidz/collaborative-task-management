#!/bin/bash
echo "🚀 Setting up Collaborative Task Management..."

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NO_COLOR='\033[0m'

copy_env() {
  local dir=$1
  if [ -f "$dir/.env.example" ]; then
    if [ ! -f "$dir/.env" ]; then
      cp "$dir/.env.example" "$dir/.env"
      echo -e "${GREEN}✓${NO_COLOR} Created $dir/.env"
    else
      echo -e "${YELLOW}⚠${NO_COLOR} $dir/.env already exists, skipping"
    fi
  fi
}

copy_env "apps/auth-service"
copy_env "apps/tasks-service"
copy_env "apps/notifications-service"
copy_env "apps/api-gateway"
copy_env "apps/web"

echo ""
echo -e "${GREEN}✓${NO_COLOR} Setup complete!"
