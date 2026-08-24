"""Фоновые изображения для баннеров акций — по главному (обложечному)
фото дома, как оно выведено в каталоге (первое по полю order).

Cover-resize до 1600×640 (широкий формат баннера) + лёгкая фирменная
тонировка, фирменный лого-плашка слева сверху (как в og.png, но
собрана из прозрачного logo.png — чтобы не тащить светлый фон og.png)
и крупная надпись «АКЦИЯ» по центру с тенью — чтобы файл выглядел
завершённым рекламным баннером сам по себе, независимо от того, что
поверх него ещё рисует React (.promo-banner-overlay) на сайте.

Запуск: cd backend && .venv/bin/python scripts/generate_promo_banners.py
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
import django  # noqa: E402
django.setup()

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont  # noqa: E402
from apps.builds.models import Build  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
FRONTEND_PUBLIC = ROOT.parent / "frontend" / "public"
LOGO = FRONTEND_PUBLIC / "logo.png"
OUT = ROOT / "apps" / "promotions" / "seed_assets"

W, H = 1600, 640
BRAND = (184, 90, 53)

FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"

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


def make_logo_plate(size: int) -> Image.Image:
    """Скруглённая терракотовая плашка с белым домиком — тот же знак,
    что в og.png, но из прозрачного logo.png (чисто накладывается на
    любое фото, без светлого фона og.png)."""
    pad = int(size * 0.16)
    plate = Image.new("RGBA", (size, size), (*BRAND, 255))
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        (0, 0, size, size), radius=int(size * 0.22), fill=255
    )
    plate.putalpha(mask)

    logo_size = size - pad * 2
    logo = Image.open(LOGO).convert("RGBA").resize((logo_size, logo_size), Image.LANCZOS)
    px = logo.load()
    for y in range(logo.height):
        for x in range(logo.width):
            r, g, b, a = px[x, y]
            if a > 0:
                px[x, y] = (255, 255, 255, a)
    plate.paste(logo, (pad, pad), logo)
    return plate


def paste_with_shadow(base: Image.Image, layer: Image.Image, xy, blur=14, alpha=110):
    """Мягкая тень под плашкой — чтобы читалась на любом фоне фото."""
    shadow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    shadow_shape = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    shadow_shape.paste((0, 0, 0, alpha), (0, 0), layer)
    shadow.paste(shadow_shape, (xy[0] + 4, xy[1] + 6), shadow_shape)
    shadow = shadow.filter(ImageFilter.GaussianBlur(blur))
    base.alpha_composite(shadow)
    base.alpha_composite(layer, xy)


def draw_center_word(img: Image.Image, text: str):
    """Крупное «АКЦИЯ» по центру с тенью и лёгкой затемняющей подложкой —
    читается на любом фото, независимо от его яркости в этом месте."""
    draw = ImageDraw.Draw(img, "RGBA")
    font = ImageFont.truetype(FONT_BOLD, 108)

    # Ручной леттер-спейсинг — так короткое слово смотрится как баннерный заголовок.
    spacing = 14
    widths = [draw.textlength(ch, font=font) for ch in text]
    total_w = sum(widths) + spacing * (len(text) - 1)
    bbox = draw.textbbox((0, 0), text, font=font)
    text_h = bbox[3] - bbox[1]

    cx, cy = img.width / 2, img.height / 2
    start_x = cx - total_w / 2
    top_y = cy - text_h / 2 - bbox[1]

    # Затемняющая подложка под словом — гарантирует контраст на любом фото.
    pad_x, pad_y = 36, 22
    draw.rounded_rectangle(
        (start_x - pad_x, top_y - pad_y + bbox[1], start_x + total_w + pad_x, top_y + text_h + pad_y + bbox[1]),
        radius=18, fill=(20, 14, 10, 92),
    )

    x = start_x
    for ch, w in zip(text, widths):
        for ox, oy in ((2, 2), (3, 3)):
            draw.text((x + ox, top_y + oy), ch, fill=(0, 0, 0, 130), font=font)
        draw.text((x, top_y), ch, fill=(255, 255, 255, 255), font=font)
        x += w + spacing


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
        img = warm_tone(img).convert("RGBA")

        logo_size = 116
        margin = 40
        plate = make_logo_plate(logo_size)
        paste_with_shadow(img, plate, (margin, margin))

        draw_center_word(img, "АКЦИЯ")

        out_path = OUT / out_name
        img.convert("RGB").save(out_path, "JPEG", quality=85, optimize=True, progressive=True)
        print(f"  ✓ {out_path.relative_to(ROOT)}  ← {cover.image.name}  ({out_path.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
