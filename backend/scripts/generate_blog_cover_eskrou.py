"""Обложка для статьи /blog/eskrou-schet-izhs-chto-eto — 1600×900.

Композиция: терракотовый радиальный градиент с фирменным свечением,
слева заголовок и подзаголовок, справа белый домик и замочек —
метафора «дом под защитой». Тот же визуальный язык, что og.png,
vk-cover, аватарка ВК.

Запуск: cd backend && .venv/bin/python scripts/generate_blog_cover_eskrou.py
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent.parent
LOGO = ROOT / "frontend" / "public" / "logo.png"
OUT = ROOT / "frontend" / "public" / "blog-eskrou-cover.jpg"

W, H = 1600, 900

BRAND = (184, 90, 53)
BRAND_LIGHT = (208, 118, 78)
BRAND_DARK = (140, 64, 36)
WHITE = (255, 255, 255)
SOFT = (255, 230, 210)

FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_REG = "/System/Library/Fonts/Supplemental/Arial.ttf"


def gradient_bg(w: int, h: int) -> Image.Image:
    """Радиальный градиент с фокусом в верхней-левой трети."""
    img = Image.new("RGB", (w, h), BRAND_DARK)
    px = img.load()
    cx, cy = w * 0.32, h * 0.3
    max_d = ((max(cx, w - cx)) ** 2 + (max(cy, h - cy)) ** 2) ** 0.5
    for y in range(h):
        for x in range(w):
            d = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5
            t = (d / max_d) ** 1.4
            px[x, y] = (
                int(BRAND_LIGHT[0] * (1 - t) + BRAND_DARK[0] * t),
                int(BRAND_LIGHT[1] * (1 - t) + BRAND_DARK[1] * t),
                int(BRAND_LIGHT[2] * (1 - t) + BRAND_DARK[2] * t),
            )
    return img


def warm_glow(img: Image.Image):
    """Тёплое свечение в правом-верхнем углу."""
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    cx, cy, r = int(W * 0.85), int(-H * 0.1), int(W * 0.55)
    for i in range(r, 0, -10):
        alpha = int(28 * (i / r) ** 2)
        draw.ellipse(
            (cx - i, cy - i, cx + i, cy + i),
            fill=(255, 220, 190, alpha),
        )
    img.alpha_composite(overlay)


def whiten(logo: Image.Image) -> Image.Image:
    px = logo.load()
    for y in range(logo.height):
        for x in range(logo.width):
            r, g, b, a = px[x, y]
            if a > 0:
                px[x, y] = (255, 255, 255, a)
    return logo


def soft_shadow(layer: Image.Image, opacity: float = 0.22) -> Image.Image:
    sh = layer.copy()
    px = sh.load()
    for y in range(sh.height):
        for x in range(sh.width):
            r, g, b, a = px[x, y]
            if a > 0:
                px[x, y] = (0, 0, 0, int(a * opacity))
    return sh


def draw_padlock(img: Image.Image, cx: int, cy: int, size: int):
    """Стилизованный замочек: дужка-арка + корпус + скважина."""
    body_w = size
    body_h = int(size * 0.78)
    body_x1 = cx - body_w // 2
    body_y1 = cy - body_h // 2 + int(size * 0.1)
    body_x2 = body_x1 + body_w
    body_y2 = body_y1 + body_h

    shackle_w = int(body_w * 0.6)
    shackle_h = int(body_w * 0.55)
    shackle_x1 = cx - shackle_w // 2
    shackle_y1 = body_y1 - int(shackle_h * 0.9)
    shackle_x2 = cx + shackle_w // 2
    shackle_y2 = body_y1 + int(shackle_h * 0.2)
    thickness = max(4, int(size * 0.1))

    draw = ImageDraw.Draw(img)
    # Дужка — открытая снизу полуокружность.
    draw.arc(
        (shackle_x1, shackle_y1, shackle_x2, shackle_y2),
        start=180, end=360,
        fill=WHITE, width=thickness,
    )

    # Корпус.
    radius = int(body_h * 0.14)
    draw.rounded_rectangle(
        (body_x1, body_y1, body_x2, body_y2),
        radius=radius,
        fill=WHITE,
    )

    # Замочная скважина (вырез терракотовым).
    kh_size = int(body_w * 0.24)
    kh_cx = cx
    kh_cy = body_y1 + int(body_h * 0.42)
    draw.ellipse(
        (kh_cx - kh_size // 2, kh_cy - kh_size // 2,
         kh_cx + kh_size // 2, kh_cy + kh_size // 2),
        fill=BRAND,
    )
    slot_w = max(3, kh_size // 4)
    slot_h = int(kh_size * 0.7)
    draw.rectangle(
        (kh_cx - slot_w // 2, kh_cy,
         kh_cx + slot_w // 2, kh_cy + slot_h),
        fill=BRAND,
    )


def main():
    img = gradient_bg(W, H).convert("RGBA")
    warm_glow(img)

    draw = ImageDraw.Draw(img)

    # ---- Текст слева ----
    text_x = 110

    # Бейдж «БЛОГ · РЕМСТРОЙ» в обводке.
    tag_font = ImageFont.truetype(FONT_BOLD, 28)
    tag_text = "БЛОГ · РЕМСТРОЙ"
    bbox = draw.textbbox((0, 0), tag_text, font=tag_font)
    tag_w = bbox[2] - bbox[0]
    tag_h = bbox[3] - bbox[1]
    pad_x, pad_y = 26, 14
    tag_box_w = tag_w + pad_x * 2
    tag_box_h = tag_h + pad_y * 2 + 4
    tag_y = 110
    badge = Image.new("RGBA", (tag_box_w, tag_box_h), (0, 0, 0, 0))
    bd = ImageDraw.Draw(badge)
    bd.rounded_rectangle(
        (0, 0, tag_box_w, tag_box_h),
        radius=tag_box_h // 2,
        outline=(255, 255, 255, 220),
        width=2,
    )
    bd.text((pad_x, pad_y - 2), tag_text, fill=(255, 255, 255, 230), font=tag_font)
    img.alpha_composite(badge, (text_x, tag_y))

    # Заголовок — одно слово, крупно.
    title_font = ImageFont.truetype(FONT_BOLD, 150)
    title = "Эскроу-счёт"
    title_y = tag_y + tag_box_h + 50
    # Тень — глубина текста на цветном фоне.
    for ox, oy in [(3, 3), (5, 5)]:
        draw.text((text_x + ox, title_y + oy), title, fill=(0, 0, 0, 100), font=title_font)
    draw.text((text_x, title_y), title, fill=WHITE, font=title_font)
    bbox = draw.textbbox((0, 0), title, font=title_font)
    title_h = bbox[3] - bbox[1]

    # Подзаголовок — две строки.
    sub_font = ImageFont.truetype(FONT_REG, 42)
    sub_lines = ["Безопасная сделка", "для покупателя дома"]
    sub_y = title_y + title_h + 60
    for i, line in enumerate(sub_lines):
        draw.text((text_x, sub_y + i * 56), line, fill=SOFT, font=sub_font)

    # ---- Справа — домик + замочек ----
    logo_size = 460
    logo = Image.open(LOGO).convert("RGBA").resize(
        (logo_size, logo_size), Image.LANCZOS
    )
    logo = whiten(logo)
    logo_x = W - logo_size - 130
    logo_y = (H - logo_size) // 2 + 30

    # Лёгкая тень под домом.
    shadow_layer = soft_shadow(logo, opacity=0.18)
    shadow_canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    shadow_canvas.paste(shadow_layer, (logo_x + 8, logo_y + 12), shadow_layer)
    img.alpha_composite(shadow_canvas)

    img.paste(logo, (logo_x, logo_y), logo)

    # Замочек поверх домика — в верхнем правом углу композиции.
    lock_cx = logo_x + logo_size + 30
    lock_cy = logo_y - 30
    draw_padlock(img, lock_cx, lock_cy, 150)

    # ---- Фирменная тонкая полоса снизу ----
    draw.rectangle((0, H - 10, W, H), fill=BRAND)

    final = img.convert("RGB")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    final.save(OUT, "JPEG", quality=92, optimize=True, progressive=True)
    print(f"Saved: {OUT.relative_to(ROOT)}  ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
