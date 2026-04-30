"""Обработка чертёжного генплана для сайта.

Запуск: cd backend && .venv/bin/python scripts/process_genplan.py

Что делает:
1. Crop узкого штампа сверху и кадастровой таблицы снизу
2. Поворот на 90° против часовой (влево) — горизонтальная ориентация
3. Усиление цветов (зелёные участки, серые дороги)
4. Лёгкое осветление топографического шума
5. Брендовая плашка снизу с подписью «Жилой комплекс «Красная смородина»»

Источник: frontend/public/genplan-source.jpg
Результат: frontend/public/genplan.png
"""

from pathlib import Path
from PIL import Image, ImageEnhance, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parent.parent.parent
SRC = ROOT / "frontend" / "public" / "genplan-source.jpg"
OUT = ROOT / "frontend" / "public" / "genplan.png"

BRAND = (184, 90, 53)
INK = (31, 28, 24)
MUTED = (106, 99, 90)
BG = (250, 247, 242)

FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_REG = "/System/Library/Fonts/Supplemental/Arial.ttf"


def main():
    img = Image.open(SRC).convert("RGB")
    print(f"Source: {img.size}")

    # 1) Crop: убираем штамп сверху (~30px) и кадастровую таблицу
    # снизу (~с y=900 до конца). По бокам берём вплотную к схеме.
    w, h = img.size
    img = img.crop((10, 30, w - 10, 905))
    print(f"After crop: {img.size}")

    # 2) Поворот на 90° против часовой (влево).
    # PIL.rotate с положительным углом и expand=True даёт CCW.
    img = img.rotate(90, expand=True, resample=Image.BICUBIC, fillcolor=(255, 255, 255))
    print(f"After rotate: {img.size}")

    # 3) Цветокоррекция:
    #    - небольшое поднятие насыщенности (зелёные участки сочнее)
    #    - небольшое поднятие контраста (границы участков чётче)
    #    - яркость +5% (фон-топография становится тише, отступает)
    img = ImageEnhance.Color(img).enhance(1.30)
    img = ImageEnhance.Contrast(img).enhance(1.10)
    img = ImageEnhance.Brightness(img).enhance(1.05)

    # 4) Брендовая плашка снизу.
    plate_h = 90
    plan_w, plan_h = img.size
    canvas = Image.new("RGB", (plan_w, plan_h + plate_h), BG)
    canvas.paste(img, (0, 0))
    draw = ImageDraw.Draw(canvas)

    # Декоративная полоска брендового цвета над плашкой
    draw.rectangle((0, plan_h, plan_w, plan_h + 4), fill=BRAND)

    # Текст в плашке
    title_font = ImageFont.truetype(FONT_BOLD, 28)
    sub_font = ImageFont.truetype(FONT_REG, 18)

    title = "Жилой комплекс «Красная смородина»"
    sub = "Кисловка, Томская область · Генеральный план"

    title_y = plan_h + 18
    sub_y = title_y + 36
    draw.text((30, title_y), title, fill=INK, font=title_font)
    draw.text((30, sub_y), sub, fill=MUTED, font=sub_font)

    # Лёгкая рамка вокруг всей картинки
    draw.rectangle(
        (0, 0, plan_w - 1, plan_h + plate_h - 1),
        outline=(220, 215, 205),
        width=1,
    )

    canvas.save(OUT, "PNG", optimize=True)
    print(f"Saved: {OUT}  ({OUT.stat().st_size // 1024} KB, size {canvas.size})")


if __name__ == "__main__":
    main()
