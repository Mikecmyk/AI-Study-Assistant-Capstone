#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "Starting build process..."

# --- Python/Django Setup ---
echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Running database migrations..."
python manage.py migrate

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Build completed successfully!"