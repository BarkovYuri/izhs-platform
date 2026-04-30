"""Генерация статической OG-картинки 1200×630 для https://remstroy70.ru.

Запускается один раз вручную, результат — frontend/public/og.png.
Использует системный Arial из macOS Supplemental (есть кириллица).

Запуск: cd backend && .venv/bin/python scripts/generate_og.py
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent.parent
LOGO = ROOT / "frontend" / "public" / "logo.png"
OUT = ROOT / "frontend" / "public" / "og.png"

W, H = 1200, 630
BRAND = (184, 90, 53)
INK = (31, 28, 24)
MUTED = (106, 99, 90)
BG_TOP = (250, 247, 242)
BG_BOTTOM = (240, 230, 210)

FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_REG = "/System/Library/Fonts/Supplemental/Arial.ttf"


def vertical_gradient(w: int, h: int, top, bottom):
    img = Image.new("RGB", (w, h), top)
    px = img.load()
    for y in range(h):
        t = y / (h - 1)
        r = int(top[0] * (1 - t) + bottom[0] * t)
        g = int(top[1] * (1 - t) + bottom[1] * t)
        b = int(top[2] * (1 - t) + bottom[2] * t)
        for x in range(w):
            px[x, y] = (r, g, b)
    return img


def soft_brand_glow(img: Image.Image):
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    # тёплый круг в правом верхнем
    cx, cy, r = 950, 20, 480
    for i in range(r, 0, -8):
        alpha = int(28 * (i / r) ** 2)
        draw.ellipse(
            (cx - i, cy - i, cx + i, cy + i),
            fill=(*BRAND, alpha),
        )
    img.paste(overlay, (0, 0), overlay)


def main():
    img = vertical_gradient(W, H, BG_TOP, BG_BOTTOM)
    soft_brand_glow(img)
    draw = ImageDraw.Draw(img)

    # Логотип слева, по центру вертикально
    logo = Image.open(LOGO).convert("RGBA")
    logo_size = 220
    logo = logo.resize((logo_size, logo_size), Image.LANCZOS)

    # Логотип на фирменной плашке (как в Navbar — белый logo внутри
    # терракотового скруглённого квадрата).
    pad = 20
    plate_size = logo_size + pad * 2
    plate = Image.new("RGBA", (plate_size, plate_size), (*BRAND, 255))
    mask = Image.new("L", (plate_size, plate_size), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        (0, 0, plate_size, plate_size), radius=46, fill=255
    )
    plate.putalpha(mask)
    # инвертируем логотип (как на сайте через filter:invert).
    # Простой путь: заменить непрозрачные пиксели на белый.
    pixels = logo.load()
    for y in range(logo.height):
        for x in range(logo.width):
            r, g, b, a = pixels[x, y]
            if a > 0:
                pixels[x, y] = (255, 255, 255, a)
    plate.paste(logo, (pad, pad), logo)

    plate_x = 100
    plate_y = (H - plate_size) // 2
    img.paste(plate, (plate_x, plate_y), plate)

    # Текст справа от плашки
    text_x = plate_x + plate_size + 60

    title_font = ImageFont.truetype(FONT_BOLD, 140)
    title = "Ремстрой"
    # Центрируем по вертикали относительно плашки
    bbox = draw.textbbox((0, 0), title, font=title_font)
    title_h = bbox[3] - bbox[1]
    title_y = plate_y + (plate_size - title_h) // 2 - 20
    draw.text((text_x, title_y), title, fill=INK, font=title_font)

    # Подпись мелким шрифтом снизу
    subtitle_font = ImageFont.truetype(FONT_REG, 36)
    subtitle = "Строительство кирпичных домов"
    sub_y = title_y + title_h + 24
    draw.text((text_x, sub_y), subtitle, fill=MUTED, font=subtitle_font)

    # Тонкая полоска бренда внизу
    band_h = 8
    draw.rectangle((0, H - band_h, W, H), fill=BRAND)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT, "PNG", optimize=True)
    print(f"Saved: {OUT}  ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
