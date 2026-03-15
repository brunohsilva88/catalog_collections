import base64
import json
from pathlib import Path
from anthropic import Anthropic

client = Anthropic()

SYSTEM_PROMPT = """Você é um especialista em colecionáveis, especialmente Funko Pops e Action Figures.
Ao receber fotos de um item, identifique:
- series: a franquia/série (ex: "Marvel", "Star Wars", "Disney", "DC Comics")
- name: o nome exato do personagem (ex: "Spider-Man", "Darth Vader", "Mickey Mouse")
- number: o número do item na série (se visível na caixa, ex: "01", "45")
- variant: variação especial, se houver (ex: "Glow in the Dark", "Chrome", "Flocked", "Metallic")
- category: tipo de item ("funko_pop", "action_figure", "vinyl", "other")
- confidence: sua confiança na identificação de 0.0 a 1.0

Responda APENAS com JSON válido neste formato:
{
  "series": "...",
  "name": "...",
  "number": "...",
  "variant": "...",
  "category": "...",
  "confidence": 0.95
}

Se não conseguir identificar o item, use confidence abaixo de 0.3 e preencha o que for possível."""


def encode_image(image_path: str) -> tuple[str, str]:
    """Retorna (base64_data, media_type)."""
    path = Path(image_path)
    suffix = path.suffix.lower()
    media_types = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".gif": "image/gif",
    }
    media_type = media_types.get(suffix, "image/jpeg")
    with open(image_path, "rb") as f:
        data = base64.standard_b64encode(f.read()).decode("utf-8")
    return data, media_type


def identify_collectible(front_path: str, back_path: str | None = None) -> dict:
    """
    Envia as fotos para a API Claude Vision e retorna os dados identificados.
    """
    content = []

    # Foto da frente (obrigatória)
    front_data, front_type = encode_image(front_path)
    content.append({
        "type": "image",
        "source": {"type": "base64", "media_type": front_type, "data": front_data},
    })
    content.append({"type": "text", "text": "Foto da frente do item:"})

    # Foto do verso (opcional)
    if back_path:
        back_data, back_type = encode_image(back_path)
        content.append({
            "type": "image",
            "source": {"type": "base64", "media_type": back_type, "data": back_data},
        })
        content.append({"type": "text", "text": "Foto do verso/caixa do item:"})

    content.append({"type": "text", "text": "Identifique este colecionável e retorne o JSON."})

    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=512,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": content}],
    )

    text = next(b.text for b in response.content if b.type == "text")

    # Extrai JSON da resposta (remove markdown code blocks se houver)
    text = text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    text = text.strip().rstrip("```")

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {
            "series": None,
            "name": "Não identificado",
            "number": None,
            "variant": None,
            "category": "other",
            "confidence": 0.0,
        }
