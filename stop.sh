#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🛑 Zenetia Zap Stop Script${NC}"
echo -e "${BLUE}=========================${NC}\n"

# Port configurations
BACKEND_PORT=8000
FRONTEND_PORT=3000
FRONTEND_ALT_PORT=3001

# Function to kill process on a specific port
kill_port() {
    local port=$1
    local service_name=$2
    
    echo -e "${YELLOW}🔍 Stopping ${service_name} on port ${port}...${NC}"
    
    # Find process using the port
    PID=$(lsof -ti:${port})
    
    if [ ! -z "$PID" ]; then
        echo -e "${RED}🔪 Killing ${service_name} (PID: ${PID})...${NC}"
        kill -9 $PID
        sleep 1
        echo -e "${GREEN}✅ ${service_name} stopped${NC}"
    else
        echo -e "${GREEN}✅ No ${service_name} running on port ${port}${NC}"
    fi
}

# Kill services by port
echo -e "${YELLOW}🧹 Stopping all Zenetia Zap services...${NC}"
kill_port $BACKEND_PORT "Backend (FastAPI)"
kill_port $FRONTEND_PORT "Frontend (Next.js)"
kill_port $FRONTEND_ALT_PORT "Frontend (Next.js Alt)"

# Kill services by saved PIDs (if available)
if [ -f ".backend_pid" ]; then
    BACKEND_PID=$(cat .backend_pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        echo -e "${RED}🔪 Killing saved backend process (PID: ${BACKEND_PID})...${NC}"
        kill -9 $BACKEND_PID 2>/dev/null
    fi
    rm -f .backend_pid
fi

if [ -f ".frontend_pid" ]; then
    FRONTEND_PID=$(cat .frontend_pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo -e "${RED}🔪 Killing saved frontend process (PID: ${FRONTEND_PID})...${NC}"
        kill -9 $FRONTEND_PID 2>/dev/null
    fi
    rm -f .frontend_pid
fi

# Kill any remaining Node.js processes that might be running Next.js
echo -e "${YELLOW}🔍 Checking for remaining Next.js processes...${NC}"
NEXTJS_PIDS=$(pgrep -f "next.*dev")
if [ ! -z "$NEXTJS_PIDS" ]; then
    echo -e "${RED}🔪 Killing remaining Next.js processes...${NC}"
    kill -9 $NEXTJS_PIDS 2>/dev/null
fi

# Kill any remaining uvicorn processes
echo -e "${YELLOW}🔍 Checking for remaining uvicorn processes...${NC}"
UVICORN_PIDS=$(pgrep -f "uvicorn.*app.main:app")
if [ ! -z "$UVICORN_PIDS" ]; then
    echo -e "${RED}🔪 Killing remaining uvicorn processes...${NC}"
    kill -9 $UVICORN_PIDS 2>/dev/null
fi

echo ""
echo -e "${GREEN}✅ All services stopped successfully!${NC}"
echo -e "${YELLOW}📋 Logs are preserved in ./logs/ directory${NC}"
echo -e "${BLUE}🚀 To start services again, run: ./start.sh${NC}" 