"""Генерация favicon.ico и apple-touch-icon из logo.png.

Запуск: cd backend && .venv/bin/python scripts/generate_favicons.py

favicon.ico — мульти-размерный (16, 32, 48) на белом фоне, для
ретро-браузеров и поиска Yandex/Google.
apple-touch-icon-180x180.png — 180×180 PNG с белым фоном, для добавления
сайта на главный экран iPhone/iPad.
"""

from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent.parent
LOGO = ROOT / "frontend" / "public" / "logo.png"
PUBLIC = ROOT / "frontend" / "public"

BRAND = (184, 90, 53, 255)


def make_brand_plate(size: int, padding: float = 0.18) -> Image.Image:
    """Логотип на терракотовой плашке (как в шапке сайта)."""
    img = Image.new("RGBA", (size, size), BRAND)

    # Скругление углов
    from PIL import ImageDraw
    mask = Image.new("L", (size, size), 0)
    radius = int(size * 0.22)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size, size), radius=radius, fill=255)

    # Логотип в центре, белый
    logo = Image.open(LOGO).convert("RGBA")
    pad = int(size * padding)
    inner = size - 2 * pad
    logo = logo.resize((inner, inner), Image.LANCZOS)

    px = logo.load()
    for y in range(logo.height):
        for x in range(logo.width):
            r, g, b, a = px[x, y]
            if a > 0:
                px[x, y] = (255, 255, 255, a)

    img.paste(logo, (pad, pad), logo)
    img.putalpha(mask)
    return img


def main():
    # apple-touch-icon: 180×180 на белом фоне (iOS не любит прозрачность).
    apple = Image.new("RGB", (180, 180), (255, 255, 255))
    plate = make_brand_plate(180)
    apple.paste(plate, (0, 0), plate)
    apple_path = PUBLIC / "apple-touch-icon.png"
    apple.save(apple_path, "PNG", optimize=True)
    print(f"Saved: {apple_path} ({apple_path.stat().st_size // 1024} KB)")

    # favicon.ico: рендерим в 256x256 и Pillow сам генерит мульти-размер
    # (16, 32, 48, 64, 128, 256). На прозрачном фоне.
    big = make_brand_plate(256)
    ico_path = PUBLIC / "favicon.ico"
    big.save(
        ico_path,
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)],
    )
    print(f"Saved: {ico_path} ({ico_path.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
