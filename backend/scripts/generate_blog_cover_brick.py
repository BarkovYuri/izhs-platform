"""Обложка для статьи /blog/kakoj-kirpich-vybrat-dlya-doma — 1600×900.

Слева — заголовок и подзаголовок. Справа — стилизованная «кладка»
из кирпичиков в фирменных оттенках терракотового, с лёгким сдвигом
рядов как в реальной кладке.
"""

from pathlib import Path
from random import Random
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent.parent
OUT = ROOT / "frontend" / "public" / "blog-brick-cover.jpg"

W, H = 1600, 900

BRAND_LIGHT = (208, 118, 78)
BRAND_DARK = (140, 64, 36)
WHITE = (255, 255, 255)
SOFT = (255, 230, 210)

# Палитра кирпичиков — тёплые тёмно-красные тона + кремовый.
BRICK_COLORS = [
    (193, 92, 55),
    (165, 73, 42),
    (210, 110, 65),
    (148, 60, 35),
    (235, 200, 165),  # cream — лицевой/облицовочный
    (180, 80, 50),
]

FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_REG = "/System/Library/Fonts/Supplemental/Arial.ttf"


def gradient_bg(w: int, h: int) -> Image.Image:
    """Радиальный градиент с фокусом сверху-слева."""
    img = Image.new("RGB", (w, h), BRAND_DARK)
    px = img.load()
    cx, cy = w * 0.32, h * 0.32
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


def draw_brick_wall(img: Image.Image, area: tuple[int, int, int, int]):
    """Рисуем кирпичную кладку в заданной области (x1, y1, x2, y2).

    Каждый ряд сдвигается на половину кирпича — как в реальной кладке.
    Цвета чуть варьируются для естественного вида.
    """
    rng = Random(42)
    x1, y1, x2, y2 = area
    brick_w = 140
    brick_h = 60
    mortar = 6  # шов
    radius = 4

    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    rows = (y2 - y1) // (brick_h + mortar) + 1
    for row in range(rows):
        y = y1 + row * (brick_h + mortar)
        offset = (brick_w // 2) if row % 2 else 0
        # Сдвинутые ряды начинаются левее, чтобы покрыть всю область.
        x = x1 - offset
        while x < x2 + brick_w:
            color = BRICK_COLORS[rng.randrange(len(BRICK_COLORS))]
            # Лёгкая тень — глубина кладки.
            draw.rounded_rectangle(
                (x + 2, y + 3, x + brick_w + 2, y + brick_h + 3),
                radius=radius, fill=(0, 0, 0, 80),
            )
            draw.rounded_rectangle(
                (x, y, x + brick_w, y + brick_h),
                radius=radius, fill=(*color, 235),
            )
            x += brick_w + mortar

    img.alpha_composite(overlay)


def main():
    img = gradient_bg(W, H).convert("RGBA")
    warm_glow(img)

    # ---- Кирпичная кладка справа ----
    # Занимает правые ~45% полотна, чуть наклонена под маской.
    wall_area = (W - 760, 80, W + 40, H - 60)
    draw_brick_wall(img, wall_area)

    # Лёгкая виньетка с левой стороны кладки — плавный переход.
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    odraw = ImageDraw.Draw(overlay)
    fade_x = W - 760
    fade_width = 140
    for dx in range(fade_width):
        alpha = int(230 * (1 - dx / fade_width))
        odraw.line(
            [(fade_x + dx, 0), (fade_x + dx, H)],
            fill=(BRAND_LIGHT[0], BRAND_LIGHT[1], BRAND_LIGHT[2], alpha),
            width=1,
        )
    img.alpha_composite(overlay)

    # ---- Текст слева ----
    draw = ImageDraw.Draw(img)
    text_x = 110

    # Бейдж.
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

    # Заголовок — две строки.
    title_font = ImageFont.truetype(FONT_BOLD, 105)
    title_y = tag_y + tag_box_h + 50
    lines = ["Какой кирпич", "выбрать для дома"]
    for i, line in enumerate(lines):
        y = title_y + i * 115
        for ox, oy in [(3, 3), (5, 5)]:
            draw.text((text_x + ox, y + oy), line, fill=(0, 0, 0, 100), font=title_font)
        draw.text((text_x, y), line, fill=WHITE, font=title_font)

    # Подзаголовок.
    sub_font = ImageFont.truetype(FONT_REG, 36)
    sub_y = title_y + len(lines) * 115 + 40
    draw.text(
        (text_x, sub_y),
        "Виды, марки и применение —",
        fill=SOFT, font=sub_font,
    )
    draw.text(
        (text_x, sub_y + 48),
        "от фундамента до облицовки",
        fill=SOFT, font=sub_font,
    )

    # Фирменная полоса снизу.
    draw.rectangle((0, H - 10, W, H), fill=BRAND_DARK)

    final = img.convert("RGB")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    final.save(OUT, "JPEG", quality=92, optimize=True, progressive=True)
    print(f"Saved: {OUT.relative_to(ROOT)}  ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
