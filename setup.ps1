# VakilBot – Setup Script (Windows PowerShell)
# Run this from the e:\V-code directory

Write-Host "=========================================="
Write-Host " VakilBot Backend Setup"
Write-Host "=========================================="

# 1. Create & activate virtual environment
Write-Host "`n[1/5] Creating Python virtual environment..."
python -m venv venv
.\venv\Scripts\Activate.ps1

# 2. Install dependencies
Write-Host "[2/5] Installing Python dependencies..."
pip install -r backend\requirements.txt

# 3. Copy .env
Write-Host "[3/5] Setting up environment file..."
if (-not (Test-Path "backend\.env")) {
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "  -> Created backend\.env - PLEASE EDIT IT with your GROQ_API_KEY"
}

# 4. Run migrations
Write-Host "[4/5] Running database migrations..."
python backend\manage.py makemigrations users firms chatbot
python backend\manage.py migrate

# 5. Run ingestion
Write-Host "[5/5] Building legal knowledge base (vector store)..."
Write-Host "  -> This will download the embedding model (~90MB) on first run"
python backend\rag\ingest.py

Write-Host ""
Write-Host "=========================================="
Write-Host " Setup Complete!"
Write-Host "=========================================="
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Edit backend\.env and add your GROQ_API_KEY"
Write-Host "     Get a free key at: https://console.groq.com"
Write-Host "  2. Start the backend: python backend\manage.py runserver"
Write-Host "  3. Start the frontend: cd frontend && npm install && npm run dev"
Write-Host "  4. Open: http://localhost:5173"
Write-Host ""
