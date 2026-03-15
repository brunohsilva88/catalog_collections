# Catalog Collections

App para catalogar colecionáveis (Funko Pops e Action Figures) com identificação automática por IA.

## O que faz

- **Identifica itens por foto** — envie a frente e o verso/caixa e o Claude Vision reconhece o personagem, série, número e variante automaticamente
- **Registra sua coleção** — mantém um inventário de tudo que você possui
- **Aponta o que falta** — cruza sua coleção com o catálogo de referência e lista os itens que ainda não tem
- **Catálogo de referência** — cadastre as séries completas para rastrear completude

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | Python · FastAPI · SQLite · SQLModel |
| IA | Claude Vision (`claude-opus-4-6`) |
| Frontend | React · Vite · Tailwind CSS |
| Gerenciador Python | [uv](https://github.com/astral-sh/uv) |
| Node | fnm |

## Pré-requisitos

- Python 3.10+
- Node 20+
- Chave de API da Anthropic — [console.anthropic.com](https://console.anthropic.com)

## Instalação

```bash
git clone https://github.com/brunohsilva88/catalog_collections.git
cd catalog_collections

# Instalar uv (gerenciador Python)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Instalar fnm + Node 20
curl -fsSL https://fnm.vercel.app/install | bash
fnm install 20 && fnm use 20

# Dependências do backend
cd backend && uv sync && cd ..

# Dependências do frontend
cd frontend && npm install && cd ..
```

## Configuração

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

Para persistir, adicione ao `~/.bashrc`.

## Rodando

```bash
./start.sh
```

| Serviço | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| Documentação da API | http://localhost:8000/docs |

## Uso

1. **Catálogo** — adicione as séries que você coleciona com todos os itens existentes
2. **Adicionar** — fotografe um item e a IA identifica automaticamente (ou cadastre manualmente)
3. **Faltando** — veja quais itens do catálogo ainda não estão na sua coleção
4. **Minha Coleção** — visualize e gerencie tudo que você possui

### Sem créditos na API

Na aba **Adicionar**, use o modo "✏️ Cadastro manual" para registrar itens sem consumir a API de visão.

## Estrutura do projeto

```
catalog_collections/
├── backend/
│   ├── main.py         # Rotas FastAPI
│   ├── models.py       # Modelos: Collectible, MyItem
│   ├── database.py     # Conexão SQLite
│   └── vision.py       # Integração Claude Vision
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── api.js
│       ├── pages/      # Collection, AddItem, Missing, Catalog
│       └── components/ # ItemCard, PhotoUpload
├── uploads/            # Fotos (gitignored)
├── start.sh            # Inicia backend + frontend
└── CLAUDE.md           # Guia para Claude Code
```

## Roadmap

- [ ] **Fase 2** — Integração com Pop Price Guide API para catálogo automático de Funko Pops
- [ ] **Fase 3** — App mobile com React Native (Expo) e câmera nativa
