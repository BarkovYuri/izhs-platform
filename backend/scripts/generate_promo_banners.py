"""Фоновые изображения для баннеров акций (запуск двух домов).

Берём реальное фото дома, приводим cover-resize до 1600×640 (широкий
формат баннера) и слегка тонируем в фирменный терракотовый — картинка
используется как фон, весь текст (бейдж/цена/даты) рисует React поверх
через .promo-banner-overlay, поэтому сюда текст не добавляем.

Запуск: cd backend && .venv/bin/python scripts/generate_promo_banners.py
"""

from pathlib import Path
from PIL import Image, ImageEnhance

ROOT = Path(__file__).resolve().parent.parent
MEDIA = ROOT / "media" / "builds"
OUT = ROOT / "apps" / "promotions" / "seed_assets"

W, H = 1600, 640
BRAND = (184, 90, 53)

SOURCES = {
    "akciya-1-euro-86b.jpg": "3_lFYZeVl.jpg",
    "akciya-2-euro-136b.jpg": "1_x6Zc1y6.jpg",
}


def cover_resize(src: Image.Image, w: int, h: int) -> Image.Image:
    src_ratio = src.width / src.height
    dst_ratio = w / h
    if src_ratio > dst_ratio:
        new_h = h
        new_w = round(src.width * (h / src.height))
    else:
        new_w = w
        new_h = round(src.height * (w / src.width))
    resized = src.resize((new_w, new_h), Image.LANCZOS)
    left = (new_w - w) // 2
    top = (new_h - h) // 2
    return resized.crop((left, top, left + w, top + h))


def warm_tone(img: Image.Image) -> Image.Image:
    """Лёгкая терракотовая тонировка + чуть выше контраст/насыщенность —
    чтобы фото читалось как часть фирменного дизайна, а не случайный кадр."""
    img = ImageEnhance.Contrast(img).enhance(1.06)
    img = ImageEnhance.Color(img).enhance(1.08)

    overlay = Image.new("RGBA", img.size, (*BRAND, 26))
    return Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for out_name, src_name in SOURCES.items():
        src_path = MEDIA / src_name
        img = Image.open(src_path).convert("RGB")
        img = cover_resize(img, W, H)
        img = warm_tone(img)
        out_path = OUT / out_name
        img.save(out_path, "JPEG", quality=85, optimize=True, progressive=True)
        print(f"  ✓ {out_path.relative_to(ROOT)}  ({out_path.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
