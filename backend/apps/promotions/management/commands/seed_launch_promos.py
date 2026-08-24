"""Заводит две стартовые акции («Акция 1» и «Акция 2») с фиксированными
текстами и ценами — идемпотентно (update_or_create по slug), можно
безопасно перезапускать.

Перед созданием сверяет текущую Build.price с ожидаемой «ценой до
скидки» из акции — если они разошлись (кто-то поменял цену дома в
админке), выводит предупреждение и требует --force, чтобы не завести
акцию с некорректной зачёркнутой ценой на карточке.

Запуск:
    python manage.py seed_launch_promos
    python manage.py seed_launch_promos --force  # создать, даже если Build.price разошлась
"""

from datetime import date
from decimal import Decimal
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.core.files import File
from django.db import transaction
from django.utils import timezone

from apps.builds.models import Build
from apps.promotions.models import Promotion, PromotionBuild

SEED_ASSETS = Path(__file__).resolve().parents[3] / "promotions" / "seed_assets"

ENDS_AT = date(2026, 12, 31)
CONTRACT_DEADLINE = date(2026, 12, 31)

PROMOS = [
    {
        "slug": "akciya-1-euro-86b",
        "title": "Акция 1 — EURO-86B",
        "build_slug": "odnoetazhnyj-dom-euro-86b",
        "expected_old_price": Decimal("8500000"),
        "promo_price": Decimal("7500000"),
        "badge_label": "-1 000 000 ₽",
        "banner_title": "Дом за 7 500 000 ₽ вместо 8 500 000 ₽",
        "banner_subtitle": "Успейте до 31.12.2026!",
        "terms": (
            "Заключите договор подряда на строительство дома до 31 "
            "декабря 2026 года и получите скидку 1 000 000 ₽: вместо "
            "8 500 000 ₽ — всего 7 500 000 ₽. Количество предложений "
            "ограничено."
        ),
        "banner_image": SEED_ASSETS / "akciya-1-euro-86b.jpg",
    },
    {
        "slug": "akciya-2-euro-136b",
        "title": "Акция 2 — EURO-136B",
        "build_slug": "dvuhetazhnyj-dom-euro-136b-s-balkonom",
        "expected_old_price": Decimal("10200000"),
        "promo_price": Decimal("9200000"),
        "badge_label": "-1 000 000 ₽",
        "banner_title": "Дом за 9 200 000 ₽ вместо 10 200 000 ₽",
        "banner_subtitle": "Договор — до 31.12.2026!",
        "terms": (
            "При заключении договора подряда на строительство дома до "
            "31 декабря 2026 года — скидка 1 000 000 ₽: вместо "
            "10 200 000 ₽ всего 9 200 000 ₽. Успейте зафиксировать цену."
        ),
        "banner_image": SEED_ASSETS / "akciya-2-euro-136b.jpg",
    },
]


class Command(BaseCommand):
    help = "Заводит акции «Акция 1» (EURO-86B) и «Акция 2» (EURO-136B)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--force", action="store_true",
            help="Создать акцию, даже если текущая цена дома отличается от ожидаемой",
        )

    def handle(self, *args, **options):
        force = options["force"]
        today = timezone.localdate()

        with transaction.atomic():
            for spec in PROMOS:
                try:
                    build = Build.objects.get(slug=spec["build_slug"])
                except Build.DoesNotExist:
                    raise CommandError(f"Build не найден: {spec['build_slug']}")

                if build.price != spec["expected_old_price"] and not force:
                    raise CommandError(
                        f"{spec['slug']}: текущая цена {build.title} = "
                        f"{build.price} ₽, ожидалась {spec['expected_old_price']} ₽. "
                        f"Текст акции ссылается на старую цену — проверьте и "
                        f"перезапустите с --force, если это ожидаемо."
                    )

                promo, _ = Promotion.objects.update_or_create(
                    slug=spec["slug"],
                    defaults={
                        "title": spec["title"],
                        "badge_label": spec["badge_label"],
                        "banner_title": spec["banner_title"],
                        "banner_subtitle": spec["banner_subtitle"],
                        "terms": spec["terms"],
                        "contract_deadline": CONTRACT_DEADLINE,
                        "starts_at": today,
                        "ends_at": ENDS_AT,
                        "is_published": True,
                    },
                )

                image_path = spec["banner_image"]
                if image_path.exists() and not promo.banner_image:
                    with open(image_path, "rb") as fh:
                        promo.banner_image.save(image_path.name, File(fh), save=True)

                PromotionBuild.objects.update_or_create(
                    promotion=promo, build=build,
                    defaults={"promo_price": spec["promo_price"]},
                )

                self.stdout.write(self.style.SUCCESS(
                    f"OK: {promo.slug} → {build.title} "
                    f"({build.price} ₽ → {spec['promo_price']} ₽)"
                ))
