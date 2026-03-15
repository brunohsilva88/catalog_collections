# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

App para catalogar colecionáveis (Funko Pops e Action Figures). Permite:
- Registrar itens via foto (frente/verso) com identificação por IA (Claude Vision)
- Saber quais itens faltam em cada série, cruzando com o catálogo de referência
- Gerenciar o catálogo manualmente

## Commands

### Iniciar tudo (backend + frontend)
```bash
./start.sh
```

### Backend isolado
```bash
cd backend
~/.local/bin/uv run uvicorn main:app --reload --port 8000
```

### Frontend isolado
```bash
cd frontend
export PATH="$HOME/.local/share/fnm:$PATH" && eval "$(fnm env --use-on-cd)"
npm run dev
```

### Instalar dependências backend
```bash
cd backend && ~/.local/bin/uv add <pacote>
```

### Instalar dependências frontend
```bash
cd frontend && npm install <pacote>
```

## Architecture

```
catalog_collections/
├── backend/               # FastAPI + SQLite
│   ├── main.py            # Rotas da API (FastAPI)
│   ├── models.py          # SQLModel: Collectible, MyItem
│   ├── database.py        # Conexão SQLite (catalog.db)
│   └── vision.py          # Integração Claude Vision para identificação por foto
├── frontend/              # React + Vite + Tailwind
│   └── src/
│       ├── App.jsx        # Roteamento por tabs (collection/add/missing/catalog)
│       ├── api.js         # Cliente HTTP para o backend (http://localhost:8000)
│       ├── pages/
│       │   ├── Collection.jsx  # Minha coleção (grid de itens possuídos)
│       │   ├── AddItem.jsx     # Upload de foto → IA ou cadastro manual
│       │   ├── Missing.jsx     # O que falta (catálogo - minha coleção)
│       │   └── Catalog.jsx     # Catálogo de referência (agrupado por série)
│       └── components/
│           ├── ItemCard.jsx    # Card reutilizável para qualquer item
│           └── PhotoUpload.jsx # Input de imagem com preview
├── uploads/               # Fotos enviadas pelo usuário (servidas em /uploads)
├── data/catalog/          # JSONs/CSVs do catálogo de referência (futuro)
└── start.sh               # Script para iniciar backend + frontend juntos
```

### Modelos de dados

- `Collectible` — catálogo de referência (o que existe no mercado por série)
- `MyItem` — itens que o usuário possui, com campos `ai_*` preenchidos pela IA e link opcional ao catálogo

### Portas

- Backend: `http://localhost:8000` (docs em `/docs`)
- Frontend: `http://localhost:5173`

### Variáveis de ambiente necessárias

- `ANTHROPIC_API_KEY` — chave da API Anthropic para o módulo de vision
