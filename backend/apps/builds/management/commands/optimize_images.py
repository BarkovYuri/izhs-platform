"""Сжимает все загруженные фото домов:
- ресайз до максимум 1920px по большей стороне (для рендеров — этого достаточно)
- jpeg quality=82 (визуально неотличимо от 100%, но в 6-10 раз меньше)
- сохранение EXIF удаляется (приватность + меньше)

Запуск:
    python manage.py optimize_images           # обработать все, кроме уже сжатых
    python manage.py optimize_images --force   # переобработать всё с нуля
    python manage.py optimize_images --dry     # только показать что будет сделано

Идемпотентна: после первого прогона повторный пропускает то что уже ≤ 1920px.
"""

from pathlib import Path

from django.core.management.base import BaseCommand
from PIL import Image, ImageOps

from apps.builds.models import BuildImage, BuildFloorImage, BuildFacadeImage

MAX_SIZE = 1920
JPEG_QUALITY = 82


class Command(BaseCommand):
    help = "Сжимает фото домов: max 1920px, JPEG q=82"

    def add_arguments(self, parser):
        parser.add_argument("--force", action="store_true",
                            help="Переобработать даже уже маленькие фото")
        parser.add_argument("--dry", action="store_true",
                            help="Только показать что будет сделано")

    def handle(self, *args, **options):
        force = options["force"]
        dry = options["dry"]

        models = [
            ("BuildImage", BuildImage),
            ("BuildFloorImage", BuildFloorImage),
            ("BuildFacadeImage", BuildFacadeImage),
        ]

        total_before = 0
        total_after = 0
        processed = 0
        skipped = 0

        for label, Model in models:
            self.stdout.write(self.style.NOTICE(f"\n=== {label} ==="))
            for obj in Model.objects.all().iterator():
                if not obj.image:
                    continue
                path = Path(obj.image.path)
                if not path.exists():
                    self.stdout.write(self.style.WARNING(f"  ! file missing: {path}"))
                    continue

                size_before = path.stat().st_size
                total_before += size_before

                try:
                    with Image.open(path) as im:
                        # Применяем поворот по EXIF (некоторые телефонные фото)
                        im = ImageOps.exif_transpose(im)
                        w, h = im.size
                        needs_resize = max(w, h) > MAX_SIZE
                        if not needs_resize and not force:
                            self.stdout.write(
                                f"  - skip ({size_before // 1024} KB, {w}x{h}): {path.name}"
                            )
                            skipped += 1
                            total_after += size_before
                            continue

                        if dry:
                            self.stdout.write(
                                f"  ~ would resize ({size_before // 1024} KB, {w}x{h}): {path.name}"
                            )
                            processed += 1
                            continue

                        im.thumbnail((MAX_SIZE, MAX_SIZE), Image.LANCZOS)
                        # Принудительно RGB (на случай RGBA / P)
                        if im.mode != "RGB":
                            im = im.convert("RGB")
                        im.save(path, "JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)

                    size_after = path.stat().st_size
                    total_after += size_after
                    saved = size_before - size_after
                    pct = (saved / size_before * 100) if size_before else 0
                    self.stdout.write(
                        f"  ✓ {path.name}: {size_before // 1024} KB → {size_after // 1024} KB "
                        f"(-{pct:.0f}%)"
                    )
                    processed += 1
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"  ✗ {path}: {e}"))

        saved_total = total_before - total_after
        self.stdout.write(self.style.SUCCESS(
            f"\n=== ИТОГО ===\n"
            f"Обработано: {processed}, пропущено: {skipped}\n"
            f"Размер: {total_before // 1024 // 1024} MB → {total_after // 1024 // 1024} MB "
            f"(сэкономлено {saved_total // 1024 // 1024} MB)"
        ))
