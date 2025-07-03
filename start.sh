#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Port configurations
BACKEND_PORT=8000
FRONTEND_PORT=3000
FRONTEND_ALT_PORT=3001

echo -e "${BLUE}🚀 Zenetia Zap Startup Script${NC}"
echo -e "${BLUE}=================================${NC}\n"

# Function to kill process on a specific port
kill_port() {
    local port=$1
    local service_name=$2
    
    echo -e "${YELLOW}🔍 Checking for existing ${service_name} on port ${port}...${NC}"
    
    # Find process using the port
    PID=$(lsof -ti:${port})
    
    if [ ! -z "$PID" ]; then
        echo -e "${RED}⚠️  Found ${service_name} running on port ${port} (PID: ${PID})${NC}"
        echo -e "${RED}🔪 Killing process...${NC}"
        kill -9 $PID
        sleep 2
        echo -e "${GREEN}✅ ${service_name} stopped${NC}"
    else
        echo -e "${GREEN}✅ No ${service_name} running on port ${port}${NC}"
    fi
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Kill existing services
echo -e "${YELLOW}🧹 Cleaning up existing services...${NC}"
kill_port $BACKEND_PORT "Backend (FastAPI)"
kill_port $FRONTEND_PORT "Frontend (Next.js)"
kill_port $FRONTEND_ALT_PORT "Frontend (Next.js Alt)"

echo ""

# Check if required commands exist
echo -e "${YELLOW}🔧 Checking dependencies...${NC}"

if ! command_exists python && ! command_exists python3; then
    echo -e "${RED}❌ Python not found. Please install Python 3.8+${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm not found. Please install Node.js and npm${NC}"
    exit 1
fi

if ! command_exists pip; then
    echo -e "${RED}❌ pip not found. Please install pip${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All dependencies found${NC}\n"

# Create log directory
mkdir -p logs

# Check for virtual environment
echo -e "${YELLOW}🐍 Checking Python virtual environment...${NC}"
if [ ! -d ".venv" ]; then
    echo -e "${YELLOW}⚠️  No .venv found, creating one...${NC}"
    python -m venv .venv
    echo -e "${GREEN}✅ Virtual environment created${NC}"
fi

# Activate virtual environment
echo -e "${YELLOW}🔧 Activating virtual environment...${NC}"
source .venv/bin/activate

# Install dependencies if needed
if [ ! -f ".venv/deps_installed" ]; then
    echo -e "${YELLOW}📦 Installing Python dependencies...${NC}"
    pip install -r requirements.txt
    touch .venv/deps_installed
    echo -e "${GREEN}✅ Dependencies installed${NC}"
fi

# Start backend
echo -e "${BLUE}🐍 Starting Backend (FastAPI)...${NC}"
echo -e "${YELLOW}Port: ${BACKEND_PORT}${NC}"
echo -e "${YELLOW}Logs: logs/backend.log${NC}"

# Start backend in background with activated venv
nohup .venv/bin/uvicorn app.main:app --host 0.0.0.0 --port $BACKEND_PORT --reload > logs/backend.log 2>&1 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Check if backend started successfully
if kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${GREEN}✅ Backend started successfully (PID: ${BACKEND_PID})${NC}"
    echo -e "${GREEN}🌐 Backend URL: http://localhost:${BACKEND_PORT}${NC}"
    echo -e "${GREEN}📚 API Docs: http://localhost:${BACKEND_PORT}/docs${NC}"
else
    echo -e "${RED}❌ Backend failed to start. Check logs/backend.log${NC}"
    exit 1
fi

echo ""

# Start frontend
echo -e "${BLUE}⚛️  Starting Frontend (Next.js)...${NC}"
echo -e "${YELLOW}Port: ${FRONTEND_PORT} (or auto-assigned)${NC}"
echo -e "${YELLOW}Logs: logs/frontend.log${NC}"

# Change to frontend directory and start
cd frontend

# Start frontend in background
nohup npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 5

# Check if frontend started successfully
if kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${GREEN}✅ Frontend started successfully (PID: ${FRONTEND_PID})${NC}"
    
    # Try to determine the actual port used
    sleep 2
    ACTUAL_PORT=$(lsof -ti:$FRONTEND_PORT)
    if [ ! -z "$ACTUAL_PORT" ]; then
        echo -e "${GREEN}🌐 Frontend URL: http://localhost:${FRONTEND_PORT}${NC}"
    else
        ACTUAL_PORT=$(lsof -ti:$FRONTEND_ALT_PORT)
        if [ ! -z "$ACTUAL_PORT" ]; then
            echo -e "${GREEN}🌐 Frontend URL: http://localhost:${FRONTEND_ALT_PORT}${NC}"
        else
            echo -e "${YELLOW}🌐 Frontend URL: Check logs/frontend.log for the actual port${NC}"
        fi
    fi
else
    echo -e "${RED}❌ Frontend failed to start. Check logs/frontend.log${NC}"
    # Kill backend if frontend fails
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Go back to root directory
cd ..

echo ""
echo -e "${GREEN}🎉 Both services started successfully!${NC}"
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}🐍 Backend: http://localhost:${BACKEND_PORT}${NC}"
echo -e "${GREEN}📚 API Docs: http://localhost:${BACKEND_PORT}/docs${NC}"
echo -e "${GREEN}⚛️  Frontend: http://localhost:${FRONTEND_PORT} (or auto-assigned)${NC}"
echo -e "${GREEN}📋 Logs: ./logs/backend.log and ./logs/frontend.log${NC}"
echo ""
echo -e "${YELLOW}🛑 To stop services, run: ./stop.sh${NC}"
echo -e "${YELLOW}📖 To view logs: tail -f logs/backend.log or tail -f logs/frontend.log${NC}"
echo ""
echo -e "${BLUE}💡 Services are running in the background. Close this terminal safely.${NC}"

# Save PIDs for stop script
echo $BACKEND_PID > .backend_pid
echo $FRONTEND_PID > .frontend_pid

echo -e "${GREEN}✅ Startup complete!${NC}" 