"""Оптимизация фоновой картинки Hero для главной страницы.

Запуск: cd backend && .venv/bin/python scripts/process_hero_bg.py

Берёт hero-bg-source.jpg (4K, 3-5 MB), уменьшает до 2400px по ширине,
сжимает в JPEG q=82 progressive — итог обычно 250-450 KB. Этого
размера достаточно для retina-экранов 2K без видимой потери качества,
а грузится в 8-10 раз быстрее оригинала.

Источник: frontend/public/hero-bg-source.jpg
Результат: frontend/public/hero-bg.jpg
"""

from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent.parent
SRC = ROOT / "frontend" / "public" / "hero-bg-source.jpg"
OUT = ROOT / "frontend" / "public" / "hero-bg.jpg"

MAX_WIDTH = 2400
QUALITY = 75


def main():
    if not SRC.exists():
        raise SystemExit(
            f"Не найден исходник: {SRC}\n"
            "Сохрани оригинальное фото как hero-bg-source.jpg в frontend/public/"
        )

    img = Image.open(SRC).convert("RGB")
    img = ImageOps.exif_transpose(img)
    print(f"Source: {img.size} ({SRC.stat().st_size // 1024} KB)")

    if img.width > MAX_WIDTH:
        new_h = int(img.height * MAX_WIDTH / img.width)
        img = img.resize((MAX_WIDTH, new_h), Image.LANCZOS)
        print(f"Resized to: {img.size}")

    img.save(OUT, "JPEG", quality=QUALITY, optimize=True, progressive=True)
    size_kb = OUT.stat().st_size // 1024
    print(f"Saved: {OUT} ({size_kb} KB)")


if __name__ == "__main__":
    main()
