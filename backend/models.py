from typing import Optional
from sqlmodel import SQLModel, Field


class Collectible(SQLModel, table=True):
    """Catálogo de referência — todos os itens que existem em cada série."""
    id: Optional[int] = Field(default=None, primary_key=True)
    series: str = Field(index=True)          # ex: "Marvel", "Disney"
    name: str                                 # ex: "Spider-Man"
    number: Optional[str] = None             # ex: "01", "45" (número na série)
    variant: Optional[str] = None            # ex: "Glow in the Dark", "Metallic"
    category: str = Field(default="funko")   # "funko" | "action_figure" | etc.


class MyItem(SQLModel, table=True):
    """Itens que o usuário possui."""
    id: Optional[int] = Field(default=None, primary_key=True)
    collectible_id: Optional[int] = Field(default=None, foreign_key="collectible.id")
    # Campos para itens identificados pela IA mas não mapeados no catálogo
    ai_series: Optional[str] = None
    ai_name: Optional[str] = None
    ai_number: Optional[str] = None
    ai_variant: Optional[str] = None
    ai_category: Optional[str] = None
    ai_confidence: Optional[float] = None    # 0.0 a 1.0
    notes: Optional[str] = None
    photo_front: Optional[str] = None        # caminho relativo do arquivo
    photo_back: Optional[str] = None


# Schemas para a API (sem table=True)
class CollectibleCreate(SQLModel):
    series: str
    name: str
    number: Optional[str] = None
    variant: Optional[str] = None
    category: str = "funko"


class CollectibleRead(SQLModel):
    id: int
    series: str
    name: str
    number: Optional[str] = None
    variant: Optional[str] = None
    category: str
    owned: bool = False


class MyItemCreate(SQLModel):
    collectible_id: Optional[int] = None
    ai_series: Optional[str] = None
    ai_name: Optional[str] = None
    ai_number: Optional[str] = None
    ai_variant: Optional[str] = None
    ai_category: Optional[str] = None
    notes: Optional[str] = None


class MyItemRead(SQLModel):
    id: int
    collectible_id: Optional[int]
    ai_series: Optional[str]
    ai_name: Optional[str]
    ai_number: Optional[str]
    ai_variant: Optional[str]
    ai_category: Optional[str]
    ai_confidence: Optional[float]
    notes: Optional[str]
    photo_front: Optional[str]
    photo_back: Optional[str]
