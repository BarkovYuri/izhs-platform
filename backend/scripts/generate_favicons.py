"""Генерация полного набора фавиконок из logo.png.

Покрывает все места, где браузеры/поисковики ищут иконку сайта:
 - frontend/src/app/favicon.ico — Next.js App Router (приоритет!)
 - frontend/public/favicon.ico — fallback для прямых запросов /favicon.ico
 - frontend/public/favicon.svg — современные браузеры
 - frontend/public/apple-touch-icon.png — iOS Safari
 - frontend/public/icon-192.png и icon-512.png — Google Search, PWA, Android
 - frontend/public/favicon-96.png — для маркера в title-bar (Yandex/Bing)

Все растровые иконки — белый домик из logo.png на скруглённой
терракотовой плашке (как в og.png и аватарке ВК).

Запуск: cd backend && .venv/bin/python scripts/generate_favicons.py
"""

from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent.parent
LOGO = ROOT / "frontend" / "public" / "logo.png"
PUBLIC = ROOT / "frontend" / "public"
APP = ROOT / "frontend" / "src" / "app"

BRAND = (184, 90, 53)
BRAND_LIGHT = (208, 118, 78)
BRAND_DARK = (140, 64, 36)


def make_icon(size: int) -> Image.Image:
    """Белый домик-логотип на скруглённой терракотовой плашке."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))

    # Радиус скругления: для маленьких иконок почти квадрат, для больших — iOS-стиль.
    radius = max(2, int(size * (0.18 if size >= 48 else 0.12)))
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        (0, 0, size, size), radius=radius, fill=255
    )

    # Радиальный градиент даёт глубину; на 16/32 px разница незаметна и
    # экономим время — заливаем плоско.
    if size >= 64:
        plate = Image.new("RGBA", (size, size), BRAND_DARK + (255,))
        gpx = plate.load()
        cx = cy = size / 2
        max_d = (cx ** 2 + cy ** 2) ** 0.5
        for y in range(size):
            for x in range(size):
                d = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5
                t = (d / max_d) ** 1.8
                gpx[x, y] = (
                    int(BRAND_LIGHT[0] * (1 - t) + BRAND_DARK[0] * t),
                    int(BRAND_LIGHT[1] * (1 - t) + BRAND_DARK[1] * t),
                    int(BRAND_LIGHT[2] * (1 - t) + BRAND_DARK[2] * t),
                    255,
                )
    else:
        plate = Image.new("RGBA", (size, size), BRAND + (255,))

    plate.putalpha(mask)
    img.alpha_composite(plate)

    # Padding: на маленьких иконках логотип должен сидеть плотнее, иначе
    # превращается в точку.
    if size <= 16:
        padding_ratio = 0.06
    elif size <= 32:
        padding_ratio = 0.10
    elif size <= 48:
        padding_ratio = 0.12
    else:
        padding_ratio = 0.16
    pad = int(size * padding_ratio)
    logo_size = size - pad * 2

    logo = Image.open(LOGO).convert("RGBA").resize(
        (logo_size, logo_size), Image.LANCZOS
    )
    px = logo.load()
    for y in range(logo.height):
        for x in range(logo.width):
            r, g, b, a = px[x, y]
            if a > 0:
                px[x, y] = (255, 255, 255, a)

    img.paste(logo, (pad, pad), logo)
    return img


def write_ico(path: Path):
    """Multi-size ICO. Google ищет 48×48 в первую очередь."""
    base = make_icon(256)
    base.save(
        path,
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)],
    )


def write_png(path: Path, size: int):
    make_icon(size).save(path, "PNG", optimize=True)


def write_svg(path: Path):
    """Упрощённый SVG-домик в стиле логотипа.

    Это собственная векторная интерпретация — растровый logo.png не
    переводится в SVG без потери качества. Если в будущем появится
    исходный .ai/.svg, стоит заменить на него.
    """
    svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="11" fill="#b85a35"/>
  <g fill="#fff">
    <path d="M14 28 L32 14 L42 22 L42 50 L14 50 Z M19 31 L19 47 L25 47 L25 39 L29 39 L29 47 L37 47 L37 31 L29 25 L25 25 L25 28 Z" fill-rule="evenodd"/>
    <path d="M36 18 L56 38 L56 41 L36 21 Z"/>
    <path d="M38 25 L56 43 L56 46 L38 28 Z"/>
    <rect x="40" y="14" width="1.8" height="36"/>
    <rect x="45" y="20" width="1.8" height="30"/>
  </g>
</svg>
"""
    path.write_text(svg, encoding="utf-8")


def main():
    out = [
        (PUBLIC / "favicon.svg", "svg", None),
        (PUBLIC / "apple-touch-icon.png", "png", 180),
        (PUBLIC / "icon-192.png", "png", 192),
        (PUBLIC / "icon-512.png", "png", 512),
        (PUBLIC / "favicon-96.png", "png", 96),
        (PUBLIC / "favicon.ico", "ico", None),
        (APP / "favicon.ico", "ico", None),
    ]
    for path, kind, size in out:
        path.parent.mkdir(parents=True, exist_ok=True)
        if kind == "svg":
            write_svg(path)
        elif kind == "ico":
            write_ico(path)
        else:
            write_png(path, size)
        size_kb = path.stat().st_size // 1024 or 1
        print(f"  ✓ {path.relative_to(ROOT)}  ({size_kb} KB)")
    print("Done.")


if __name__ == "__main__":
    main()
