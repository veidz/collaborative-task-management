#!/bin/bash
echo "🚀 Setting up Collaborative Task Management"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NO_COLOR='\033[0m'

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

cd "$PROJECT_ROOT" || exit 1

echo "Project root: $PROJECT_ROOT"
echo ""

copy_env() {
  local dir=$1
  
  echo -e "${BLUE}Checking: $dir${NO_COLOR}"
  
  if [ ! -d "$dir" ]; then
    echo -e "${RED}✗${NO_COLOR} Directory $dir does not exist"
    return
  fi
  
  if [ -f "$dir/.env.example" ]; then
    if [ ! -f "$dir/.env" ]; then
      cp "$dir/.env.example" "$dir/.env"
      echo -e "${GREEN}✓${NO_COLOR} Created $dir/.env"
    else
      echo -e "${YELLOW}⚠${NO_COLOR} $dir/.env already exists, skipping"
    fi
  else
    echo -e "${YELLOW}⚠${NO_COLOR} $dir/.env.example not found"
  fi
}

echo -e "${BLUE}Setting up environment files...${NO_COLOR}"
echo ""

copy_env "apps/auth-service"
copy_env "apps/tasks-service"
copy_env "apps/notifications-service"
copy_env "apps/api-gateway"
copy_env "apps/web"
