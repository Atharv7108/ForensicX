#!/bin/bash

# SQLite Browser Installation Guide for macOS

echo "=== SQLite Browser Installation Options ==="
echo ""
echo "Option 1: Install DB Browser for SQLite (Recommended)"
echo "Download from: https://sqlitebrowser.org/dl/"
echo ""
echo "Option 2: Install via Homebrew:"
echo "brew install --cask db-browser-for-sqlite"
echo ""
echo "Option 3: Use command line SQLite:"
echo "sqlite3 forensicx.db"
echo ""
echo "=== Database Location ==="
echo "Database file: $(pwd)/forensicx.db"
echo ""
echo "=== Useful SQLite Commands ==="
echo ".tables                    # List all tables"
echo ".schema users             # Show users table structure"
echo "SELECT * FROM users;      # View all users"
echo "SELECT * FROM detection_history;  # View detection history"
echo ".quit                     # Exit SQLite"