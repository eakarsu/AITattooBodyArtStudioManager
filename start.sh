#!/bin/bash

# ============================================
# AI Tattoo & Body Art Studio Manager
# Start Script - Seeds DB, Cleans Ports, Starts App
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
SERVER_PORT=4000
CLIENT_PORT=3000

echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════════════╗"
echo "║   🎨 AI Tattoo & Body Art Studio Manager 🎨     ║"
echo "║          Starting Application...                 ║"
echo "╚══════════════════════════════════════════════════╝"
echo -e "${NC}"

# ---- Step 1: Clean used ports ----
echo -e "${YELLOW}[1/5] Cleaning used ports ($SERVER_PORT, $CLIENT_PORT)...${NC}"

cleanup_port() {
    local port=$1
    local pids=$(lsof -ti :$port 2>/dev/null || true)
    if [ -n "$pids" ]; then
        echo -e "${RED}  Killing processes on port $port: $pids${NC}"
        echo "$pids" | xargs kill -9 2>/dev/null || true
        sleep 1
    else
        echo -e "${GREEN}  Port $port is free${NC}"
    fi
}

cleanup_port $SERVER_PORT
cleanup_port $CLIENT_PORT
echo -e "${GREEN}  ✓ Ports cleaned${NC}"

# ---- Step 2: Check PostgreSQL ----
echo -e "${YELLOW}[2/5] Checking PostgreSQL...${NC}"

if command -v pg_isready &> /dev/null; then
    if pg_isready -q 2>/dev/null; then
        echo -e "${GREEN}  ✓ PostgreSQL is running${NC}"
    else
        echo -e "${RED}  PostgreSQL is not running. Attempting to start...${NC}"
        if command -v brew &> /dev/null; then
            brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || true
        fi
        sleep 2
        if pg_isready -q 2>/dev/null; then
            echo -e "${GREEN}  ✓ PostgreSQL started${NC}"
        else
            echo -e "${RED}  ✗ Could not start PostgreSQL. Please start it manually.${NC}"
            exit 1
        fi
    fi
else
    echo -e "${YELLOW}  pg_isready not found, assuming PostgreSQL is running${NC}"
fi

# Create database if it doesn't exist
echo -e "${CYAN}  Creating database if not exists...${NC}"
createdb tattoo_studio 2>/dev/null || echo -e "${CYAN}  Database already exists${NC}"

# ---- Step 3: Install dependencies ----
echo -e "${YELLOW}[3/5] Installing dependencies...${NC}"

cd "$PROJECT_DIR/server"
if [ ! -d "node_modules" ]; then
    echo -e "${CYAN}  Installing server dependencies...${NC}"
    npm install 2>&1 | tail -1
else
    echo -e "${GREEN}  ✓ Server dependencies already installed${NC}"
fi

cd "$PROJECT_DIR/client"
if [ ! -d "node_modules" ]; then
    echo -e "${CYAN}  Installing client dependencies...${NC}"
    npm install 2>&1 | tail -1
else
    echo -e "${GREEN}  ✓ Client dependencies already installed${NC}"
fi

# ---- Step 4: Seed database ----
echo -e "${YELLOW}[4/5] Seeding database...${NC}"
cd "$PROJECT_DIR/server"
node seed.js
echo -e "${GREEN}  ✓ Database seeded with sample data${NC}"

# ---- Step 5: Start application with hot reload ----
echo -e "${YELLOW}[5/5] Starting application with hot reload...${NC}"

# Trap to clean up on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down...${NC}"
    cleanup_port $SERVER_PORT
    cleanup_port $CLIENT_PORT
    echo -e "${GREEN}✓ Application stopped${NC}"
    exit 0
}
trap cleanup SIGINT SIGTERM

# Start server with file watching (using node --watch if available, fallback to nodemon or plain node)
cd "$PROJECT_DIR/server"

NODE_VERSION=$(node -v | cut -d'.' -f1 | tr -d 'v')
if [ "$NODE_VERSION" -ge 18 ]; then
    echo -e "${CYAN}  Starting server with --watch (auto-reload on changes)...${NC}"
    node --watch index.js &
    SERVER_PID=$!
else
    if command -v npx &> /dev/null; then
        echo -e "${CYAN}  Starting server with nodemon (auto-reload on changes)...${NC}"
        npx -y nodemon index.js &
        SERVER_PID=$!
    else
        echo -e "${CYAN}  Starting server...${NC}"
        node index.js &
        SERVER_PID=$!
    fi
fi

# Start client (React dev server has built-in hot reload)
cd "$PROJECT_DIR/client"
echo -e "${CYAN}  Starting client (React dev server with hot reload)...${NC}"
BROWSER=none PORT=$CLIENT_PORT npm start &
CLIENT_PID=$!

sleep 3

echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════════════╗"
echo "║              🎨 App is Running! 🎨              ║"
echo "╠══════════════════════════════════════════════════╣"
echo "║                                                  ║"
echo "║  Frontend:  http://localhost:$CLIENT_PORT             ║"
echo "║  Backend:   http://localhost:$SERVER_PORT             ║"
echo "║                                                  ║"
echo "║  Login:     admin@tattoo.studio / password123    ║"
echo "║  (Or click 'Quick Demo Login' button)            ║"
echo "║                                                  ║"
echo "║  Both server and client auto-reload on changes   ║"
echo "║  Press Ctrl+C to stop                            ║"
echo "║                                                  ║"
echo "╚══════════════════════════════════════════════════╝"
echo -e "${NC}"

# Wait for both processes
wait $SERVER_PID $CLIENT_PID
