#!/bin/bash
# Inicia backend e frontend em paralelo
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

export PATH="$HOME/.local/share/fnm:$PATH"
eval "$(fnm env --use-on-cd 2>/dev/null || true)"

echo "▶ Iniciando backend (http://localhost:8000) ..."
cd "$ROOT/backend"
~/.local/bin/uv run uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!

echo "▶ Iniciando frontend (http://localhost:5173) ..."
cd "$ROOT/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✓ Backend: http://localhost:8000"
echo "✓ Frontend: http://localhost:5173"
echo "✓ API Docs: http://localhost:8000/docs"
echo ""
echo "Pressione Ctrl+C para parar."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
