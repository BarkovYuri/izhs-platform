"""Фоновые изображения для баннеров акций — по главному (обложечному)
фото дома, как оно выведено в каталоге (первое по полю order).

Cover-resize до 1600×640 (широкий формат баннера) + лёгкая фирменная
тонировка. Текст (бейдж/цена/даты) поверх рисует React через
.promo-banner-overlay, поэтому сюда текст не добавляем.

Запуск: cd backend && .venv/bin/python scripts/generate_promo_banners.py
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
import django  # noqa: E402
django.setup()

from PIL import Image, ImageEnhance  # noqa: E402
from apps.builds.models import Build  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "apps" / "promotions" / "seed_assets"

W, H = 1600, 640
BRAND = (184, 90, 53)

# out filename -> build slug
TARGETS = {
    "akciya-1-euro-86b.jpg": "odnoetazhnyj-dom-euro-86b",
    "akciya-2-euro-136b.jpg": "dvuhetazhnyj-dom-euro-136b-s-balkonom",
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
    """Лёгкая терракотовая тонировка + чуть выше контраст/насыщенность."""
    img = ImageEnhance.Contrast(img).enhance(1.06)
    img = ImageEnhance.Color(img).enhance(1.08)
    overlay = Image.new("RGBA", img.size, (*BRAND, 26))
    return Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for out_name, slug in TARGETS.items():
        build = Build.objects.filter(slug=slug).first()
        if not build:
            print(f"  ✗ {slug}: Build не найден")
            continue
        cover = build.images.order_by("order", "id").first()
        if not cover or not cover.image:
            print(f"  ✗ {slug}: нет фото")
            continue

        img = Image.open(cover.image.path).convert("RGB")
        img = cover_resize(img, W, H)
        img = warm_tone(img)

        out_path = OUT / out_name
        img.save(out_path, "JPEG", quality=85, optimize=True, progressive=True)
        print(f"  ✓ {out_path.relative_to(ROOT)}  ← {cover.image.name}  ({out_path.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
