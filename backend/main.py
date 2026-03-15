import os
import shutil
import uuid
from pathlib import Path
from typing import Optional

from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session, select

from database import create_db_and_tables, get_session
from models import (
    Collectible,
    CollectibleCreate,
    CollectibleRead,
    MyItem,
    MyItemRead,
)
from vision import identify_collectible

UPLOADS_DIR = Path("../uploads")
UPLOADS_DIR.mkdir(exist_ok=True)

app = FastAPI(title="Catalog Collections API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


# ── Catálogo de referência ────────────────────────────────────────────────────

@app.get("/catalog", response_model=list[CollectibleRead])
def list_catalog(
    series: Optional[str] = None,
    category: Optional[str] = None,
    session: Session = Depends(get_session),
):
    query = select(Collectible)
    if series:
        query = query.where(Collectible.series == series)
    if category:
        query = query.where(Collectible.category == category)
    items = session.exec(query).all()

    # Marca quais o usuário já possui
    owned_ids = {
        row
        for row in session.exec(select(MyItem.collectible_id)).all()
        if row is not None
    }
    return [
        CollectibleRead(**item.model_dump(), owned=item.id in owned_ids)
        for item in items
    ]


@app.post("/catalog", response_model=CollectibleRead)
def add_to_catalog(item: CollectibleCreate, session: Session = Depends(get_session)):
    db_item = Collectible(**item.model_dump())
    session.add(db_item)
    session.commit()
    session.refresh(db_item)
    return CollectibleRead(**db_item.model_dump(), owned=False)


@app.delete("/catalog/{item_id}")
def delete_from_catalog(item_id: int, session: Session = Depends(get_session)):
    item = session.get(Collectible, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item não encontrado")
    session.delete(item)
    session.commit()
    return {"ok": True}


# ── Minha coleção ─────────────────────────────────────────────────────────────

@app.get("/collection", response_model=list[MyItemRead])
def list_collection(session: Session = Depends(get_session)):
    return session.exec(select(MyItem)).all()


@app.post("/collection/identify", response_model=MyItemRead)
async def identify_and_add(
    front: UploadFile = File(...),
    back: Optional[UploadFile] = File(None),
    notes: Optional[str] = Form(None),
    session: Session = Depends(get_session),
):
    """Recebe fotos, envia para a IA identificar e salva na coleção."""

    def save_upload(upload: UploadFile) -> str:
        ext = Path(upload.filename).suffix or ".jpg"
        filename = f"{uuid.uuid4()}{ext}"
        dest = UPLOADS_DIR / filename
        with open(dest, "wb") as f:
            shutil.copyfileobj(upload.file, f)
        return str(dest)

    front_path = save_upload(front)
    back_path = save_upload(back) if back and back.filename else None

    result = identify_collectible(front_path, back_path)

    item = MyItem(
        ai_series=result.get("series"),
        ai_name=result.get("name"),
        ai_number=result.get("number"),
        ai_variant=result.get("variant"),
        ai_category=result.get("category"),
        ai_confidence=result.get("confidence"),
        notes=notes,
        photo_front=front_path,
        photo_back=back_path,
    )

    # Tenta vincular ao catálogo automaticamente
    if item.ai_name and item.ai_series:
        match = session.exec(
            select(Collectible).where(
                Collectible.series == item.ai_series,
                Collectible.name == item.ai_name,
            )
        ).first()
        if match:
            item.collectible_id = match.id

    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@app.post("/collection/manual", response_model=MyItemRead)
async def add_manual(
    collectible_id: Optional[int] = Form(None),
    ai_series: Optional[str] = Form(None),
    ai_name: Optional[str] = Form(None),
    ai_number: Optional[str] = Form(None),
    ai_variant: Optional[str] = Form(None),
    ai_category: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    front: Optional[UploadFile] = File(None),
    back: Optional[UploadFile] = File(None),
    session: Session = Depends(get_session),
):
    """Adiciona item manualmente sem usar IA."""

    def save_upload(upload: UploadFile) -> str:
        ext = Path(upload.filename).suffix or ".jpg"
        filename = f"{uuid.uuid4()}{ext}"
        dest = UPLOADS_DIR / filename
        with open(dest, "wb") as f:
            shutil.copyfileobj(upload.file, f)
        return str(dest)

    front_path = save_upload(front) if front and front.filename else None
    back_path = save_upload(back) if back and back.filename else None

    item = MyItem(
        collectible_id=collectible_id,
        ai_series=ai_series,
        ai_name=ai_name,
        ai_number=ai_number,
        ai_variant=ai_variant,
        ai_category=ai_category,
        notes=notes,
        photo_front=front_path,
        photo_back=back_path,
    )
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@app.delete("/collection/{item_id}")
def remove_from_collection(item_id: int, session: Session = Depends(get_session)):
    item = session.get(MyItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item não encontrado")
    for path in [item.photo_front, item.photo_back]:
        if path and Path(path).exists():
            os.remove(path)
    session.delete(item)
    session.commit()
    return {"ok": True}


# ── O que falta ───────────────────────────────────────────────────────────────

@app.get("/missing")
def get_missing(
    series: Optional[str] = None,
    session: Session = Depends(get_session),
):
    """Retorna itens do catálogo que o usuário ainda não possui."""
    query = select(Collectible)
    if series:
        query = query.where(Collectible.series == series)
    all_items = session.exec(query).all()

    owned_ids = {
        row
        for row in session.exec(select(MyItem.collectible_id)).all()
        if row is not None
    }

    missing = [item for item in all_items if item.id not in owned_ids]
    return missing


@app.get("/stats")
def get_stats(session: Session = Depends(get_session)):
    total_catalog = len(session.exec(select(Collectible)).all())
    total_owned = len(session.exec(select(MyItem)).all())
    owned_linked = len(
        [r for r in session.exec(select(MyItem.collectible_id)).all() if r is not None]
    )
    return {
        "total_catalog": total_catalog,
        "total_owned": total_owned,
        "owned_linked_to_catalog": owned_linked,
        "missing_from_catalog": max(0, total_catalog - owned_linked),
    }


@app.get("/series")
def list_series(session: Session = Depends(get_session)):
    items = session.exec(select(Collectible.series)).all()
    return sorted(set(items))
