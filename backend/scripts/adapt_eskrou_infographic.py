"""Адаптация инфографики про эскроу-счёт под бренд.

Исходник /frontend/public/eskrou-schet-izhs.webp содержит надпись
«Домдрево» — название чужого бренда. Скрипт находит плашку с этой
надписью, перерисовывает её и пишет «Ремстрой».

Запуск: cd backend && .venv/bin/python scripts/adapt_eskrou_infographic.py
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent.parent
SRC = ROOT / "frontend" / "public" / "eskrou-schet-izhs.webp"
OUT = SRC  # перезаписываем оригинал

# Зелёный фирменный цвет рамки плашек на исходнике — снято пипеткой
# с кадра инфографики. Если оригинал поменяется, цвет может уйти.
PILL_GREEN = (140, 198, 63)
TEXT_COLOR = (45, 45, 45)

FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"


def main():
    img = Image.open(SRC).convert("RGBA")
    w, h = img.size
    assert (w, h) == (300, 300), f"Unexpected size {w}x{h}"

    draw = ImageDraw.Draw(img)

    # Плашка «Домдрево» на исходнике располагается примерно в этой
    # области. Координаты подобраны вручную под текущий файл.
    pill = (100, 70, 205, 105)
    px1, py1, px2, py2 = pill
    pill_w = px2 - px1
    pill_h = py2 - py1
    radius = pill_h // 2

    # 1) Закрашиваем плашку белым с зелёной рамкой — повторяя стиль
    #    остальных плашек на инфографике.
    draw.rounded_rectangle(
        pill, radius=radius, fill="white", outline=PILL_GREEN, width=2,
    )

    # 2) Пишем «Ремстрой» по центру плашки.
    font = ImageFont.truetype(FONT_BOLD, 14)
    text = "Ремстрой"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    text_x = px1 + (pill_w - text_w) // 2
    # bbox у Pillow для truetype включает baseline-офсет — на глаз
    # текст всегда чуть смещён вниз. Компенсируем -2px.
    text_y = py1 + (pill_h - text_h) // 2 - 2
    draw.text((text_x, text_y), text, fill=TEXT_COLOR, font=font)

    # Сохраняем в WebP, как исходник. quality=90 даёт идентичное
    # визуальное качество при сравнимом размере.
    img.convert("RGB").save(OUT, "WEBP", quality=90, method=6)
    size_kb = OUT.stat().st_size // 1024
    print(f"Saved: {OUT.relative_to(ROOT)}  ({size_kb} KB)")


if __name__ == "__main__":
    main()
