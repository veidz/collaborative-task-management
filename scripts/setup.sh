#!/bin/sh
set -e

echo "Setting up Collaborative Task Management"

copy_env() {
  dir=$1
  
  echo "Checking: $dir"
  
  if [ ! -d "$dir" ]; then
    echo "✗ Directory $dir does not exist"
    return
  fi
  
  if [ -f "$dir/.env.example" ]; then
    if [ ! -f "$dir/.env" ]; then
      cp "$dir/.env.example" "$dir/.env"
      echo "Created $dir/.env"
    else
      echo "$dir/.env already exists, skipping"
    fi
  else
    echo "$dir/.env.example not found"
  fi
}

echo "Setting up environment files..."
echo ""

copy_env "/apps/auth-service"
copy_env "/apps/tasks-service"
copy_env "/apps/notifications-service"
copy_env "/apps/api-gateway"
copy_env "/apps/web"

echo ""
echo "Setup complete!"
